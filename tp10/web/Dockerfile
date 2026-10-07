# TODO step 6. The image of the front, in two stages:
#
#   1. `build`, from Node 26: npm ci, then npm run build. VITE_API_URL is
#      read at that moment and written into the JavaScript: declare it with
#      ARG, compose passes it as a build argument.
#   2. From nginx, alpine variant: the files of dist/ in /usr/share/nginx/html,
#      and nginx.conf (given) in /etc/nginx/conf.d/default.conf.
#
# No Node in the final image: nginx serves files, nothing else.
