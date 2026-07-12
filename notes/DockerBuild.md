

### The Development Loop (What you do on your laptop)
Write Code: You edit files in your src folder.
Test: You run docker-compose up (using the development target) to see your changes live. You don't care about the dist folder here because you are running raw TypeScript.


### The Build & Deploy Loop (What you do to update AWS)
When you are ready to ship your changes to production:
Build: You run docker build -t 98054/pos-backend:swc-migration . (or use a CI tool to do it).
Docker automatically executes the builder stage, compiles src into dist, and copies it into the final image.
Push: You run docker push 98054/pos-backend:swc-migration.
This sends the entire "box" (the image) to the registry, including the newly compiled dist folder.
Deploy (AWS): You trigger a redeploy on your AWS instance (using docker compose pull followed by docker compose up -d).
AWS pulls the new "box," sees the new dist folder inside it, and restarts your app with the latest code.
