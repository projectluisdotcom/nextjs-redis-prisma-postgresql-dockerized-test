# Content
- [Content](#content)
- [Requeriments](#requeriments)
- [Setup](#setup)
- [Development](#development)
- [TODO](#todo)

# Requeriments  
- MacOSX - Apple Silicon chip (You can use other platform, but is not tested)
- Docker
- Git

# Setup
Execute `npm i`on the root folder of the project.

#  Development  
Run  `docker compose --env-file .dev.env up`

Notes: 
- Prisma studio will be available on port 5555 
- Thsi will launch all the services and execute tests on watch mode, to develop just write code and save the files you edit, this will retrigger all the testing (and reset the db)

# TODO
- Configure remote debugger for the server
- Prepare for production
- CI/CD GitHub actions to deploy it
- Deal with CASCADE delete and null values
- Add endpoint pagination
- Random salt password hashes