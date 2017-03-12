// Ionic Starter App

// module é equivalente ao criar uma bibliote. Então estou dizendo que estou criando uma biblioteca starter do ionic
var app = angular.module('todoapp', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('list', {
    cache: false,
    url: '/list',
    templateUrl : 'templates/lista.html'
  });

  $stateProvider.state('new', {
    url: '/new',
    templateUrl : 'templates/novo.html',
    controller: 'NovoCtrl'
  });

  $stateProvider.state('edit',{
    url: '/edit/:indice',
    templateUrl: 'templates/novo.html',
    controller: 'EditCtrl'
  });

  $stateProvider.state('login', {
    url: '/login',
    pageTitle : 'Login',
    templateUrl : 'templates/login.html',
    controller: 'LoginCtrl'
  });

  //estado default
  $urlRouterProvider.otherwise('/login');
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});


app.controller('ListaCtrl', function($scope, $state, TarefaService, TarefaWebService){

  //$scope.tarefas = TarefaService.lista(); -- para armazenamento local
  
  TarefaWebService.lista().then(function(dados){
    $scope.tarefas = dados;
  });
/* LOCAL
  $scope.concluir = function(indice){
    TarefaService.concluir(indice);
  }
*/

  $scope.concluir = function(indice, tarefa){
    
    tarefa.feita = true;

    TarefaWebService.concluir(indice, tarefa).then(function(){
      TarefaWebService.lista().then(function(dados){
        $scope.tarefas = dados;
      });
    });
  }

/* LOCAL
  $scope.apagar = function(indice){
    TarefaService.apagar(indice);
  }
*/
  $scope.apagar = function(indice){
    TarefaWebService.apagar(indice).then(function(){
      TarefaWebService.lista().then(function(dados){
        $scope.tarefas = dados;
      });
    });
  }

  $scope.editar = function(indice){
    $state.go('edit',{indice : indice});
  }
});

/* armazenamento LOCAL
app.controller('NovoCtrl', function($scope, $state, TarefaService){
  
  $scope.tarefa = {
      "texto" : '',
      "data" : new Date(),
      "feita" : false
  };

  $scope.salvar = function(){
    
    TarefaService.inserir($scope.tarefa);

    $state.go('list');
  }
});
*/

app.controller('NovoCtrl', function($scope, $state, TarefaWebService){
  
  $scope.tarefa = {
      "texto" : '',
      "data" : new Date(),
      "feita" : false
  };

  $scope.salvar = function(){
    
    TarefaWebService.inserir($scope.tarefa).then(function(){
      $state.go('list');
    });
  }
});

/* armazenamento local
app.controller('EditCtrl', function($scope, $state, $stateParams, TarefaService){
  
  $scope.indice = $stateParams.indice;

  $scope.tarefa = angular.copy(TarefaService.obtem($scope.indice));

  $scope.salvar = function(){
    
    TarefaService.alterar($scope.indice, $scope.tarefa);
    
    $state.go('list');
  }
});
*/


app.controller('EditCtrl', function($scope, $state, $stateParams, TarefaWebService){
  
  $scope.indice = $stateParams.indice;

  TarefaWebService.obtem($scope.indice).then(function(dados){
    $scope.tarefa = dados;
  });

  $scope.salvar = function(){
    
    TarefaWebService.alterar($scope.indice, $scope.tarefa).then(function(){
      $state.go('list');
    });
  }
});




app.controller('LoginCtrl', function($scope, $http, $state, $ionicHistory, $ionicPopup){

  $scope.usuario = {};

  $scope.login = function() {

    $http.post('http://ericonode.azurewebsites.net/api/usuario', $scope.usuario)
      .then(function(response) {

          if(response.status == 200){
            window.localStorage.setItem('usuario', JSON.stringify(response.data));

            $ionicHistory.nextViewOptions({
              disableBack: true
            });

            $state.go('list');

          }

      }, function(response) {
        $ionicPopup.alert(
          {
            title: 'Falha no acesso',
            template: 'Usuário inválido'
          }
        );
      });

  }
});



//criação de serviços que implementa o crud em um json local
app.factory('TarefaService', function(){

  var tarefas = JSON.parse(window.localStorage.getItem('db_tarefas') || '[]');

  function persistir() {
    window.localStorage.setItem('db_tarefas', JSON.stringify(tarefas));
  }

  return {

      lista: function(){
        return tarefas;
      },

      obtem: function(indice){
        return tarefas[indice];
      },

      inserir: function(tarefa){
        tarefas.push(tarefa);
        persistir();
      },

      alterar: function(indice, tarefa){
        tarefas[indice] = tarefa;
        persistir();
      },

      concluir: function(indice){
        tarefas[indice].feita = true;
        persistir();
      },

      apagar: function(indice){
        tarefas.splice(indice, 1);
        persistir();
      }

  }

});


app.factory('TarefaWebService', function($http, $q){

  var url = 'http://ericonode.azurewebsites.net/api/tarefa';

  var config = {
    headers : {'Authorization':JSON.parse(window.localStorage.getItem('usuario'))}
  }

  return {

      lista: function(){
        
        var deferido = $q.defer();
        /* como é assincrono, o then significa que 
        quando o servidor retornar a minha lista de tarefas
        a partir dessa chamada, então ele vai executar a função, 
        tendo como parametro o response que é o retorno do servidor*/
        $http.get(url, config).then(function(response){
          deferido.resolve(response.data);//data => dados do server
        });
        
        return deferido.promise;
      },

      obtem: function(id){
        
        var deferido = $q.defer();

        $http.get(url + '/'+ id).then(function(response){
          deferido.resolve(response.data);
        });

        return deferido.promise;
      },

      inserir: function(tarefa){
        
        var deferido = $q.defer();
        
        $http.post(url, tarefa).then(function(){
          deferido.resolve();
        });
        
        return deferido.promise;
      },

      alterar: function(id, tarefa){
        
        var deferido = $q.defer();

        $http.put(url + '/' + id, tarefa).then(function(){
          deferido.resolve();
        });

        return deferido.promise;
      },

      concluir: function(id, tarefa){
        var deferido = $q.defer();

        $http.put(url + '/' + id, tarefa).then(function(){
          deferido.resolve();
        });

        return deferido.promise;
      },

      apagar: function(id){
        var deferido = $q.defer();

        $http.delete(url + '/' + id).then(function(){
          deferido.resolve();
        });

        return deferido.promise;
      }

  }

});