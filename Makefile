
docker_run: docker_build
	docker run -p 80:3000 abalone

docker_run_it: docker_build
	docker run -it abalone sh

# run `gcloud auth login` before
docker_push: docker_build
	# gcloud auth print-access-token --impersonate-service-account  ACCOUNT | docker login -u oauth2accesstoken --password-stdin https://europe-west3-docker.pkg.dev
	docker tag abalone europe-west3-docker.pkg.dev/abalone-783483/for-abalone/latest
	docker push europe-west3-docker.pkg.dev/abalone-783483/for-abalone/latest

docker_build:
	docker build -t abalone .

kill_latest_docker_container:
	docker kill $$(docker ps -q -l)
