node {
    stage('Checkout') { 
        checkout scm 
    }

    stage('Setup Docker Client') {
        sh '''
            if [ ! -f ./docker/docker ]; then
                curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz -o docker.tgz
                tar -xzvf docker.tgz --strip-components=1
                rm docker.tgz
            fi
        '''
    }

    // On crée une variable courte pour appeler notre binaire Docker partout
    def dockerCmd = "${workspace}/docker"

    stage('Parallel Node Tests') {
        def services = ['api', 'worker', 'admin']
        def parallelStages = [:]
        
        services.each { svc ->
            parallelStages[svc] = {
                stage("Test ${svc}") {
                    // On lance manuellement un conteneur Node éphémère pour chaque service
                    // -v $(pwd):/app monte le dossier du service actuel dans le conteneur
                    sh "${dockerCmd} run --rm -v \$(pwd)/${svc}:/app -w /app node:20-alpine sh -c 'npm install && npm test'"
                }
            }
        }
        parallel parallelStages
    }
}