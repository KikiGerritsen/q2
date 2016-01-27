  // create the controller and inject Angular's $scope
  app.controller('boardController', function($scope) {
  $scope.title = "BOARD";
  $scope.state = {
    setupBoard: true,
    waitforteams: false
  };

  $scope.teams = [];
  $scope.quiz = "";
  $scope.currentQuestion = "";
  $scope.questionNr = 0;
  $scope.roundNr = 1;
  $scope.teamApplied = "";
  $scope.teamAnswer = "";

  var socket = io();
  socket.on('connect', function(){
    console.log("connection established",$scope.title);
    socket.emit("adduser", {type:$scope.title});
  });

  socket.on('broadcast', function(data){
    // console.log('broadcast',data);
  });

  socket.on('quiz:started', function(data){
    console.log("quiz:started", data);
    if(data.password === $scope.quiz){
      for(var i = 0; i < data.players.length; i++){
        // console.log(data.players[i]);

        $scope.teams.push(data.players[i]);
        console.log($scope.teams);
        $scope.$apply();
      }
    }
  });

  socket.on('All:inquiz', function(data){
    console.log('All:inquiz', data);
  });

  socket.on('question:asked', function(data){
    console.log("question:asked",data);
    $scope.currentQuestion = data.question;
    if($scope.questionNr === 12){
      console.log('question:limitRoundReached');
      $scope.questionNr = 0;
      $scope.roundNr ++;
      socket.emit('question:limitRoundReached', $scope.teams);
    }
    if(data.sock !== "qSelect"){
      for(var i = 0; i < $scope.teams.length; i++){
        $scope.teams[i].applied = false;
        // $scope.teams[i].score += 1;
        // $scope.teams[i].score = $scope.teams[i].score + data.players[i].score;
      }
    } else {
      $scope.questionNr ++;
    }
    for(var i = 0; i < $scope.teams.length; i++){
      $scope.teams[i].score = $scope.teams[i].score + data.players[i].score;
    }
    $scope.$apply();
  });

  // socket.on('master:endedQuestion', function(data){
  //   console.log('master:endedQuestion', data);
  //   for(var i = 0; i < $scope.teams.length; i++){
  //     $scope.teams[i].applied = false;
  //     $scope.teams[i].score = $scope.teams[i].score + data.players[i].score;
  //   }
  //   if($scope.questionNr === 12){
  //     // $scope.questionNr = 0;
  //     // $scope.roundNr ++;
  //   }
  //   $scope.$apply();
  // });

  socket.on('round:next', function(data){
    console.log('round:next', data);
    $scope.teams = data.players.sort(function(a, b){
      if (a.totalScore > b.totalScore) {
        return -1;
      }
      if (a.totalScore < b.totalScore) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    for(var i in $scope.teams){
      $scope.teams[i].score = 0;
    }
    $scope.$apply();

      //create the score
      //The team names with their scores in ‘Round Points’ and the
      //number of correctly answered questions per round.

      //Round Points are awarded like this: After each round of
      //twelve questions, the team that has the most correct
      //answers is awarded 4 Round Points (RPs). The next best
      //team is awarded 2 RPs and the third best team is awarded
      //1 RP. All other teams are awarded 0.1 RPs for their
      //effort and company.

    // $scope.teams = data.players;
  });

  socket.on('player:answeredQuestion', function(data){
    console.log("player:answeredQuestion", data);
    for(var i = 0; i < $scope.teams.length; i++){
      if($scope.teams[i].teamname === data.team){
        console.log("hit", $scope.teams);
        $scope.teams[i].applied = true;
      }
    }
    $scope.$apply();
  });

  $scope.goQuiz = function(quiz){
    $scope.quiz = quiz;
    socket.emit("switchRoom", {type:$scope.title, quiz:quiz});
    $scope.state.waitforteams = true;
    $scope.state.setupBoard = false;
  };
});
