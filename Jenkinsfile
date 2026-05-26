node {
    stage('Checkout') { 
        checkout scm 
    }

    stage('Setup Docker Client') {
        // On télécharge directement le binaire client Docker Linux (tgz) officiel
        // pour que Jenkins puisse l'exécuter depuis son conteneur
        sh '''
            if [ ! -f ./docker/docker ]; then
                curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz -o docker.tgz
                tar -xzvf docker.tgz
                rm docker.tgz
            fi
        '''
    }

    // On injecte le dossier du binaire téléchargé directement dans le PATH
    def dockerBinPath = "${workspace}/docker"
    withEnv(["PATH=${dockerBinPath}:${env.PATH}"]) {
        
        stage('Docker Pull & Test') {
            // Maintenant, le binaire est trouvé dans le workspace et va utiliser ton socket Windows
            docker.image('node:20-alpine').inside {
                def services = ['api', 'worker', 'admin']
                def parallelStages = [:]
                
                services.each { svc ->
                    parallelStages[svc] = {
                        stage("Test ${svc}") {
                            dir(svc) {
                                sh 'npm ci && npm test'
                            }
                        }
                    }
                }
                parallel parallelStages
            }
        }
    }
}