pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Check Node.js') {
      steps {
        sh '''
          node -e 'if (Number(process.versions.node.split(".")[0]) < 20) {
            console.error("Node.js 20 or newer is required");
            process.exit(1);
          }'
          npm --version
        '''
      }
    }

    stage('Frontend') {
      steps {
        sh 'npm ci'
        sh 'npm run lint'
        sh 'npm test'
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    stage('Backend') {
      steps {
        dir('smtrack-backend') {
          withEnv(['DATABASE_URL=postgresql://ci:ci@localhost:5432/ci']) {
            sh 'npm ci'
            sh 'npx prisma generate'
            sh 'npm test -- --runInBand'
            sh 'npm run build'
          }
          archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
      }
    }
  }
}