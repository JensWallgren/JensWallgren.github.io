import sys
import datetime
import json
import os

from staticjinja import Site

if __name__ == "__main__":
  use_reloader = True if len(sys.argv) > 1 else False
  now = datetime.datetime.now()

  # Find all files in the templates/blog-posts directory
  blog_posts = []
  for root, dirs, files in os.walk('templates/blog-posts'):
    for file in files:
      path = os.path.join(root, file)
      content = open(path).read()

      metadata = json.loads(content.split('{#')[1].split('#}')[0])
      metadata['fileName'] = file

      blog_posts.append(metadata)

  # Sort the blog posts by their date in the metadata
  blog_posts = sorted(blog_posts, key=lambda x: x['date'], reverse=True)

  site = Site.make_site(outpath='out', env_globals={
    "now": now,
    "blog_posts": blog_posts
  })

  site.render(use_reloader=use_reloader)

