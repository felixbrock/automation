------------------------------

Docker deployment

docker build -t 085009017826.dkr.ecr.eu-central-1.amazonaws.com/automation:v1.0.0 . 

docker run -dp 8080:8080 085009017826.dkr.ecr.eu-central-1.amazonaws.com/automation:v1.0.0

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 085009017826.dkr.ecr.eu-central-1.amazonaws.com

docker push 085009017826.dkr.ecr.eu-central-1.amazonaws.com/automation:v1.0.0

aws ecs update-service --cluster hivedive-microservices --service automation-service --force-new-deployment

------------------------------