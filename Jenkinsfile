node {
    stage('Checkout') { 
        checkout scm 
    }

    // On récupère le chemin de l'outil Docker configuré dans Jenkins
    def dockerHome = tool name: 'latest', type: 'hudson.plugins.docker.commons.tools.DockerToolInstaller'
    
    // On l'injecte dans le PATH pour ce bloc d'exécution
    withEnv(["PATH=${dockerHome}/bin:${env.PATH}"]) {
        
        stage('Pull Image') {
            // Le plugin va maintenant trouver le binaire et utiliser ton socket Windows
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