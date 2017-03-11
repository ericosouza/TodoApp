// Ionic Starter App

// module é equivalente ao criar uma bibliote. Então estou dizendo que estou criando uma biblioteca starter do ionic
var app = angular.module('todoapp', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('list', {
    url: '/list',
    templateUrl : 'templates/lista.html'
  });

  $stateProvider.state('new', {
    url: '/new',
    templateUrl : 'templates/novo.html'
  });
  //estado default
  $urlRouterProvider.otherwise('/list');
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

app.controller('ListaCtrl', function($scope){
  $scope.tarefas = [
    {
      "texto":"Realizar as atividades do curso",
      "data":new Date(),
      "feita":false
    },
    {
      "texto":"Fazer malas",
      "data":new Date(),
      "feita":false
    },
    {
      "texto":"Organizar Documentos",
      "data":new Date(),
      "feita":false
    },
    {
      "texto":"Levar a mãe para pegar o trem",
      "data":new Date(),
      "feita":false
    },
  ];


  $scope.concluir = function(indice){
    $scope.tarefas[indice].feita = true;
  }

  $scope.apagar = function(indice){
    $scope.tarefas.splice(indice);//splice apaga o indice
  }
});
