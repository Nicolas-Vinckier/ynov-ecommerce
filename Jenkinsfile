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

    def dockerCmd = "${workspace}/docker"

    stage('Parallel Node Tests') {
        def services = ['api', 'worker', 'admin']
        def parallelStages = [:]
        
        services.each { svc ->
            parallelStages[svc] = {
                stage("Test ${svc}") {
                    // Au lieu de monter un volume -v, on utilise l'option -v du socket de données 
                    // ou plus simple : on demande à docker de mapper directement le volume nommé global de Jenkins
                    sh "${dockerCmd} run --rm --volumes-from \$(hostname) -w ${workspace}/${svc} node:20-alpine sh -c 'npm install && npm test'"
                }
            }
        }
        parallel parallelStages
    }
}