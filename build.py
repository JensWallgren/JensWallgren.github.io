import shutil
import sys
import time
import json
import os

from jinja2 import Environment, PackageLoader, FileSystemLoader
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEvent, FileSystemEventHandler

media_extensions = (".png", ".jpg", ".jpeg", ".gif", ".svg")
ignored_extensions = (".afdesign")

env = Environment(loader=FileSystemLoader('templates'))

def is_media_file(filename: str) -> bool:
  return any(part.endswith(media_extensions) for part in Path(filename).parts)

def is_ignored_file(filename: str) -> bool:
  return any(part.endswith(ignored_extensions) for part in Path(filename).parts)

def contains_metadata(content: str) -> bool:
  return content.startswith('{#')

def update_blog_posts():
  # Find all files in the templates/blog-posts directory
  blog_posts = []
  for root, dirs, files in os.walk('templates/blog-posts'):
    for file in files:
      if not file.endswith('.html'):
        continue

      path = os.path.join(root, file)
      content = open(path).read()

      metadata = json.loads(content.split('{#')[1].split('#}')[0])
      metadata['fileName'] = file

      blog_posts.append(metadata)
  blog_posts = sorted(blog_posts, key=lambda x: x['date'], reverse=True)

  template = env.get_template('index.html')
  template.stream(blog_posts=blog_posts).dump('out/index.html')


def handle_file_change(is_directory: bool, src_path: str, event_type: str = "modified"):
  if is_directory or is_ignored_file(src_path):
    return

  print(f"Processing {src_path}")
  template_path = Path(src_path).relative_to('templates').as_posix()
  out_path = "out/" + template_path

  if event_type == "deleted":
    print(f"Deleting {out_path}")
    os.remove(out_path)
    return

  # Create output directory if it doesn't exist
  os.makedirs(os.path.dirname(out_path), exist_ok=True)

  if is_media_file(src_path):
    print(f"Copying {out_path}")
    shutil.copy(src_path, out_path)
  elif src_path == 'templates/blog-posts/index.html':
    update_blog_posts()
  else:
    print(f"Rendering {out_path}")
    content = open(src_path).read()
    metadata = {}
    if contains_metadata(content):
      metadata = json.loads(content.split('{#')[1].split('#}')[0])

    template = env.get_template(template_path)
    template.stream(**metadata).dump(out_path)

    # IF it's a blog post, update the index
    if template_path.startswith('blog-posts/'):
      update_blog_posts()


class FileChangeHandler(FileSystemEventHandler):
  def __init__(self):
    self.env = Environment(loader=FileSystemLoader('templates'))

  def on_modified(self, event: FileSystemEvent):
    handle_file_change(event.is_directory, event.src_path)
    
# On startup we clean the output directory and rerender everything fully
shutil.rmtree('out', ignore_errors=True)

# Render all files
for path in Path('templates').rglob('*'):
  if path.is_file():
    handle_file_change(False, path.as_posix())


if len(sys.argv) > 1 and sys.argv[1] == "watch":
  observer = Observer()
  observer.schedule(FileChangeHandler(), path='./templates', recursive=True)
  observer.start()

  try:
    while True:
      time.sleep(1)
  except KeyboardInterrupt:
    observer.stop()
  observer.join()

