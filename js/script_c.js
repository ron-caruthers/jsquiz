(function () {
    'use strict';

    // get Questions from the quiz-questions.js file
    function loadJSON(callback) {
        var getQuestions = new XMLHttpRequest();
        getQuestions.overrideMimeType("application/json");
        getQuestions.open('GET', 'http://127.0.0.1:8080/js/quiz-questions.json', true);
        getQuestions.onreadystatechange = function () {
            if (getQuestions.readyState === 4 && getQuestions.status === 200) {
                callback(getQuestions.responseText);
            }
        };
        getQuestions.send(null);
    }
    var allQuestions = [];
    loadJSON(function (response) {
        allQuestions = JSON.parse(response);
    });

    // Quiz object
    function Quiz(allQuestions) {
        this.questions = allQuestions;
        this.numQs = this.questions.length;
        this.scores = [];
    }
    Quiz.prototype = {
        activeQh: function (activeQ) {
            return activeQ + 1;
        },
        qandas: function (activeQ) {
            var qOptions = "";
            var prevAns = this.scores[activeQ]
                ? this.scores[activeQ].user_ans
                : 'no scores';

            // Print the Question
            var newQ = document.createElement("div");
            newQ.setAttribute('class', 'question');
            document.getElementsByClassName("quiz-q")[0].appendChild(newQ);
            document.getElementsByClassName("question")[0].innerHTML = '<h3>[ Q: ' + this.activeQh(activeQ) + ' of ' + this.numQs + ' ] ' + this.questions[activeQ].question + '</h3>';

            // Print the Choices
            var newOpts = document.createElement("div");
            newOpts.setAttribute('class', 'options');
            document.getElementsByClassName("quiz-c")[0].appendChild(newOpts);

            this.questions[activeQ].choices.forEach(function (option) {
                if (!prevAns) {
                    qOptions += '<li><div class="checkbox"><label><input type="radio" name="q-' + activeQ + '" value="' + option + '" /> ' + option + '</label></div></li>';
                } else {
                    if (option === prevAns) {
                        qOptions += '<li><div class="checkbox"><label><input type="radio" name="q-' + activeQ + '" value="' + prevAns + '" checked=checked /> ' + prevAns + '</label></div></li>';
                    } else {
                        qOptions += '<li><div class="checkbox"><label><input type="radio" name="q-' + activeQ + '" value="' + option + '" /> ' + option + '</label></div></li>';
                    }
                }
            });

            document.getElementsByClassName("options")[0].innerHTML = '<ol>' + qOptions + '</ol>';
        },
        back_to_qandas: function (activeQ, userAnswer) {
            var qOptions = "";

            // Print the Question
            var newQ = document.createElement("div");
            newQ.setAttribute('class', 'question');
            document.getElementsByClassName("quiz-q")[0].appendChild(newQ);
            document.getElementsByClassName("question")[0].innerHTML = '<h3>[ Q: ' + this.activeQh(activeQ) + ' of ' + this.numQs + ' ] ' + this.questions[activeQ].question + '</h3>';

            // Print the Choices
            var newOpts = document.createElement("div");
            newOpts.setAttribute('class', 'options');
            document.getElementsByClassName("quiz-c")[0].appendChild(newOpts);

            this.questions[activeQ].choices.forEach(function (option) {
                if (option === userAnswer) {
                    qOptions += '<li><div class="checkbox"><label><input type="radio" name="q-' + activeQ + '" value="' + userAnswer + '" checked=checked /> ' + userAnswer + '</label></div></li>';
                } else {
                    qOptions += '<li><div class="checkbox"><label><input type="radio" name="q-' + activeQ + '" value="' + option + '" /> ' + option + '</label></div></li>';
                }
            });

            document.getElementsByClassName("options")[0].innerHTML = '<ol>' + qOptions + '</ol>';
        },
        answer: function (activeQ) {
            return this.questions[activeQ].choices[this.questions[activeQ].correctAnswer];
        },
        empty: function () {
            if (document.getElementsByClassName("tally").length) {
                var remove_tally = document.getElementsByClassName("tally")[0];
                remove_tally.parentNode.removeChild(remove_tally);
                var remove_scores = document.getElementsByClassName("score");
                var testDivs = Array.prototype.filter.call(remove_scores, function (remove_score) {
                    return remove_score.nodeName === 'DIV';
                });
                testDivs.forEach(function (div) {
                    div.parentNode.removeChild(div);
                });
            }
            if (document.getElementsByClassName("question").length) {
                var remove_q = document.getElementsByClassName("question")[0];
                remove_q.parentNode.removeChild(remove_q);
                var remove_opts = document.getElementsByClassName("options")[0];
                remove_opts.parentNode.removeChild(remove_opts);
            }
        },
        compare: function (compareQ, userA) {
            var activQ = compareQ + 1;

            var rightWrong = (userA === this.answer(compareQ))
                ? '[CORRECT]'
                : '[INCORRECT]';

            var score = {
                q_num: compareQ,
                user_ans: userA,
                correct_ans: this.answer(compareQ),
                right_wrong: rightWrong
            };
            if (this.scores.length >= activQ) {
                this.scores.splice(compareQ, 1, score);
            } else {
                this.scores.push(score);
            }
        },
        next: function (activeQ, userAns) {
            var compareQ = activeQ - 1;
            this.compare(compareQ, userAns);

            if (activeQ !== this.numQs) {
                this.empty();
                this.qandas(activeQ);
            } else {
                this.finish();
            }
        },
        back: function (activeQ) {
            var backUserAnswer = this.scores[activeQ].user_ans;
            this.empty();
            this.back_to_qandas(activeQ, backUserAnswer);
        },
        finish: function () {
            var qScore;
            var qTally;
            this.empty();
            var scores = this.scores;
            var user_tally = [];
            var rights = 0;

            scores.forEach(function (score) {
                rights = score.correct_ans === score.user_ans
                    ? rights + 1
                    : rights + 0;

                user_tally.push(
                    {
                        q_num: score.q_num,
                        user_a: score.user_ans,
                        correct_a: score.correct_ans,
                        tally: score.right_wrong
                    }
                );
            });

            var breakDown;
            var finalS = (rights / this.numQs * 100);
            if (finalS >= 60) {
                if (finalS >= 75) {
                    breakDown = "Good job. You probably didn't vote for Trump.";
                } else {
                    breakDown = "You didn't do too bad.";
                }
            } else {
                if (finalS >= 50) {
                    breakDown = "You're not smart.";
                } else {
                    breakDown = "You're stupid.";
                }
            }
            var cssClass;
            qTally = document.createElement("div");
            qTally.setAttribute('class', 'tally');
            document.getElementsByClassName("quiz")[0].appendChild(qTally);
            var tally_a = '<h2>' + rights + ' out of ' + this.numQs + ' correct, Your score: ' + finalS.toFixed(0) + '%</h2>';
            var tally_b = '<h3>' + breakDown + '</h3>';
            document.getElementsByClassName('tally')[0].innerHTML = tally_a + tally_b;

            user_tally.forEach(function (this_q) {
                qScore = document.createElement("div");
                qScore.setAttribute('class', 'score score-' + this_q.q_num);
                document.getElementsByClassName("quiz")[0].appendChild(qScore);
                if (this_q.tally === '[CORRECT]') {
                    cssClass = 'bg-success text-success';
                } else {
                    cssClass = 'bg-danger text-danger border-danger';
                }
                document.getElementsByClassName('score-' + this_q.q_num)[0].innerHTML += '<p class="' + cssClass + '">Q#' + this_q.q_num + ' [Correct Answer => <strong>' + this_q.correct_a + '</strong>][Your Answer => <strong>' + this_q.user_a + '</strong>]<strong>' + this_q.tally + '</strong></p>';
            });
        }
    };

    // Quiz UI
    //
    function startQuiz() {
        var quiz = {};
        var activeQ = 0;
        var quizStarted = false;
        var startHeading = document.getElementsByClassName("start-heading")[0];
        var startBtn = document.getElementById("quiz_start");
        var nextBtn = document.getElementById("quiz_submit");
        var backBtn = document.getElementById("quiz_back");
        var restartBtn = document.getElementById("quiz_restart");

        function removeNote() {
            setTimeout(function () {
                var remove_w = document.getElementsByClassName("warning")[0];
                remove_w.parentNode.removeChild(remove_w);
            }, 3000);
        }

        function showHideBtns() {
            var numQz = quiz.numQs - 1;

            restartBtn.style.display = quizStarted
                ? 'block'
                : 'none';

            startHeading.style.display = quizStarted
                ? 'none'
                : 'block';

            startBtn.style.display = quizStarted
                ? 'none'
                : 'inline-block';

            if ((activeQ > numQz) || (!quizStarted)) {
                backBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'inline-block';
                backBtn.style.display = activeQ > 0
                    ? 'inline-block'
                    : 'none';
            }
        }
        function clickStart() {
            quizStarted = true;
            quiz = new Quiz(allQuestions);
            quiz.qandas(activeQ);
            showHideBtns();
        }
        function clickRestart() {
            quiz.empty();
            quiz = {};
            activeQ = 0;
            quizStarted = false;
            showHideBtns();
        }
        function clickNext() {
            var userAns = -1;
            var x;
            var radioList = document.getElementsByClassName("options")[0];
            var userVal = radioList.getElementsByTagName("input");

            for (x = 0; x < userVal.length; x += 1) {
                if (userVal[x].type === "radio" && userVal[x].checked) {
                    userAns = userVal[x].value;
                }
            }
            if (userAns !== -1) {
                activeQ = activeQ + 1;
                quiz.next(activeQ, userAns);
                showHideBtns();
            } else {
                var newNote = document.createElement("div");
                newNote.setAttribute('class', 'warning');
                document.getElementById("notifications").appendChild(newNote);
                document.getElementsByClassName("warning")[0].innerHTML = '<h3 class="bg-warning text-warning">Pick something idiot.</h3>';
                removeNote();
            }
        }
        function clickBack() {
            activeQ = activeQ - 1;
            quiz.back(activeQ);
            showHideBtns();
        }

        showHideBtns();
        startBtn.addEventListener("click", clickStart);
        nextBtn.addEventListener("click", clickNext);
        backBtn.addEventListener("click", clickBack);
        restartBtn.addEventListener("click", clickRestart);

    }
    startQuiz();

}());