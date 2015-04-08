//app.js
var db = null;
var peoplePage = null;
var occPage = null;
var giftsForPage = null;
var giftsForOccPage = null;
var lastSwipe = null;
var selectedPerson = null;
var selectedOccasion = null;
var personNameSave = null;

function checkDB() {
    db = openDatabase('myDb', '', 'davi0645', 1024 * 1024);
    if (db.version == '') {
        console.log('[davi0645] First time running... create tables');
        //means first time creation of DB
        //increment the version and create the tables
        db.changeVersion('', '1.0',
            function(trans) {
                //something to do in addition to incrementing the value
                //otherwise your new version will be an empty DB
                console.log("DB version incremented");
                //do the initial setup               
                trans.executeSql('CREATE TABLE people(person_id INTEGER PRIMARY KEY AUTOINCREMENT, person_name VARCHAR)', [],
                    function(tx, rs) {
                        //do something if it works
                        console.log("People stuff created");
                    },
                    function(tx, err) {
                        //failed to run query
                        console.log(err.message);
                    });
                trans.executeSql('CREATE TABLE occasions(occ_id INTEGER PRIMARY KEY AUTOINCREMENT, occ_name VARCHAR)', [],
                    function(tx, rs) {
                        //do something if it works
                        console.log("Occasions stuff created");
                    },
                    function(tx, err) {
                        //failed to run query
                        console.log(err.message);
                    });
                trans.executeSql('CREATE TABLE gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, occ_id INTEGER, gift_idea VARCHAR, purchased BOOLEAN)', [],
                    function(tx, rs) {
                        //do something if it works
                        console.log("Gift stuff created");
                    },
                    function(tx, err) {
                        //failed to run query
                        console.log(err.message);
                    });
            },
            function(err) {
                console.log(err.message);
            },
            function() {
                //successfully completed the transaction of incrementing the version number   
            });
    } else {
        //version should be 1.0
        //this won't be the first time running the app
        console.log('[davi0645] Version: ', db.version);
    }
}

function transErr(tx, err) {
    //a generic function to run when any transaction fails
    //navigator.notification.alert(message, alertCallback, [title], [buttonName])
    console.log("Error processing transaction: " + err);
}

function transSuccess() {
    //a generic function to run when any transaction is completed
    //not something often done generically
}

function addListeners() {
	var slides = document.querySelectorAll(".swipeable");
	for(var i = 0; i < slides.length; i++) {
		var mc = new Hammer.Manager(slides[i]);
		var swipe = new Hammer.Swipe();

		mc.add(swipe);

		mc.on("swipeleft swiperight", handleSwipe);
	}

	var backs = document.querySelectorAll(".backable");
	for(var i = 0; i < backs.length; i++) {
		var mc = new Hammer.Manager(backs[i]);
		var swipe = new Hammer.Swipe();

		mc.add(swipe);

		mc.on("swipeleft swiperight", handleBack);
	}
	
	var cnclBtns = document.querySelectorAll(".btnCancel");
	for(var i = 0; i < cnclBtns.length; i++) {
		var mc = new Hammer(cnclBtns[i]);

		mc.on("tap", function(ev) {
			document.querySelectorAll("[data-role=modal]")[0].style.display="none";
			document.querySelectorAll("[data-role=modal]")[1].style.display="none";
    		document.querySelector("[data-role=overlay]").style.display="none";
    		document.querySelector("#new-per-occ").value = "";
    		document.querySelector("#new-idea").value = "";
		});
	}
	
	var btns = document.querySelectorAll(".btnAdd");
	for(var i = 0; i < btns.length; i++) {
		var mc = new Hammer(btns[i]);

		mc.on("tap", addBtnClick);
	}

	var addBtns = document.querySelectorAll(".btnSave");
	for(var i = 0; i < addBtns.length; i++) {
		var mc = new Hammer(addBtns[i]);

		mc.on("tap", saveBtnClick);
	}
}

function handleSwipe(e) {
	if(peoplePage.className == "active swipeable") {
		peoplePage.className = "inactive swipeable";
		occPage.className = "active swipeable";
	} else if (occPage.className == "active swipeable") {
		peoplePage.className = "active swipeable";
		occPage.className = "inactive swipeable";
	}
}

function handleBack(e) {
	peoplePage.className = "active swipeable";
	giftsForPage.className = "inactive backable";
	giftsForOccPage.className = "inactive backable";
}

function addBtnClick(e) {
	if (e.target.id == "people-add") {
		document.querySelector("#add-person-occasion h3").innerHTML = "New Person";
		document.querySelector("#add-person-occasion").style.display="block";
    	document.querySelector("[data-role=overlay]").style.display="block";
	}
	if (e.target.id == "occasion-add") {
		document.querySelector("#add-person-occasion h3").innerHTML = "New Occasion";
		document.querySelector("#add-person-occasion").style.display="block";
    	document.querySelector("[data-role=overlay]").style.display="block";
	}
	if (e.target.id == "gifts-add") {
		document.querySelector("#add-gift h3").innerHTML = "New Gift";
		document.querySelector("#add-gift").style.display="block";
    	document.querySelector("[data-role=overlay]").style.display="block";
	}
	if (e.target.id == "gifts-occ") {
		document.querySelector("#add-gift h3").innerHTML = "New Gift for Event";
		document.querySelector("#add-gift").style.display="block";
    	document.querySelector("[data-role=overlay]").style.display="block";
	}
}

function saveBtnClick(e) {
	if (e.target.id == "per-occ") {
		if (document.querySelector("#add-person-occasion h3").innerHTML == "New Person") {
			var e = document.createElement('li');
			e.innerHTML = document.getElementById('new-per-occ').value;
			//Add here where it will add the values to the tables!!!
			db.transaction(function(trans) {
        		trans.executeSql('INSERT INTO people(person_name) VALUES(?)', [e.innerHTML], 
            	function(tx, rs){
                	//success running the query
                	console.log("success inserting person: " + e.innerHTML);
                	e.setAttribute('data-personID', rs.insertId);
            	}, 
				function(tx, err){
                	//failed to run the query
                	console.log(err.message);
            	});    
    		}, transErr, transSuccess);	

			var mc = new Hammer.Manager(e, {});

			mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			mc.add( new Hammer.Tap({ event: 'singletap' }) );

			mc.get('doubletap').recognizeWith('singletap');
			mc.get('singletap').requireFailure('doubletap');

			mc.on("doubletap", function(ev) {
				//Add here to remove data from tables
				db.transaction(function(trans) {
	        		trans.executeSql('DELETE FROM people WHERE person_id = ?', [e.getAttribute('data-personID')], 
	            	function(tx, rs){
	                	//success running the query
	                	console.log("success deleting person: " + e.innerHTML);
	            	}, 
					function(tx, err){
	                	//failed to run the query
	                	console.log(err.message);
	            	});    
	    		}, transErr, transSuccess);	

				e.parentNode.removeChild(e);
			});

			mc.on("singletap", handlePersonClick);

			document.querySelector('.people-ul').appendChild(e);
		}

		if (document.querySelector("#add-person-occasion h3").innerHTML == "New Occasion") {
			//Add here where it will add the values to the tables!!!
			var e = document.createElement('li');
			e.innerHTML = document.getElementById('new-per-occ').value;
			//Add here where it will add the values to the tables!!!
			db.transaction(function(trans) {
        		trans.executeSql('INSERT INTO occasions(occ_name) VALUES(?)', [e.innerHTML], 
            	function(tx, rs){
                	//success running the query
                	console.log("success inserting occasion: " + e.innerHTML);
                	e.setAttribute('data-occID', rs.insertId);
            	}, 
				function(tx, err){
                	//failed to run the query
                	console.log(err.message);
            	});    
    		}, transErr, transSuccess);	
			var mc = new Hammer.Manager(e, {});

			mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			mc.add( new Hammer.Tap({ event: 'singletap' }) );

			mc.get('doubletap').recognizeWith('singletap');
			mc.get('singletap').requireFailure('doubletap');

			mc.on("doubletap", function(ev) {
				//Add here to remove data from tables
				db.transaction(function(trans) {
	        		trans.executeSql('DELETE FROM occasions WHERE occ_id = ?', [e.getAttribute('data-occID')], 
	            	function(tx, rs){
	                	//success running the query
	                	console.log("success deleting occasion: " + e.innerHTML);
	            	}, 
					function(tx, err){
	                	//failed to run the query
	                	console.log(err.message);
	            	});    
	    		}, transErr, transSuccess);	

				e.parentNode.removeChild(e);
			});

			mc.on("singletap", handleOccasionClick);

			document.querySelector('.occ-ul').appendChild(e);
		}
	}

	if (e.target.id == "newgift") {
		if (document.querySelector("#add-gift h3").innerHTML == "New Gift") {
			var e = document.createElement('li');
			var s = document.getElementById('list-per-occ');
			e.innerHTML = s.options[s.selectedIndex].text + " - " + document.getElementById('new-idea').value;
			db.transaction(function(trans) {
        		trans.executeSql('INSERT INTO gifts(gift_idea, occ_id, person_id, purchased) VALUES(?,?,?,?)', [e.innerHTML, s.options[s.selectedIndex].value, selectedPerson, false], 
            	function(tx, rs){
                	//success running the query
                	console.log("success inserting new-gift-idea: " + e.innerHTML + " for personID : " + selectedPerson);
                	e.setAttribute('data-giftID', rs.insertId);
            	}, 
				function(tx, err){
                	//failed to run the query
                	console.log(err.message);
            	});    
    		}, transErr, transSuccess);	
			var mc = new Hammer.Manager(e, {});

			mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			mc.add( new Hammer.Tap({ event: 'singletap' }) );

			mc.get('doubletap').recognizeWith('singletap');
			mc.get('singletap').requireFailure('doubletap');

			mc.on("doubletap", function(ev) {
				//Add here to remove data from tables
				db.transaction(function(trans) {
	        		trans.executeSql('DELETE FROM gifts WHERE gift_id = ?', [e.getAttribute('data-giftID')], 
	            	function(tx, rs){
	                	//success running the query
	                	console.log("success deleting gift-idea: " + e.innerHTML);
	            	}, 
					function(tx, err){
	                	//failed to run the query
	                	console.log(err.message);
	            	});    
	    		}, transErr, transSuccess);	

				e.parentNode.removeChild(e);
			});

			mc.on("singletap", handlePurchase);

			document.querySelector('.gifts-ul').appendChild(e);

		}
	}


	document.querySelectorAll("[data-role=modal]")[0].style.display="none";
	document.querySelectorAll("[data-role=modal]")[1].style.display="none";
    document.querySelector("[data-role=overlay]").style.display="none";
    document.querySelector("#new-per-occ").value = "";
    document.querySelector("#new-idea").value = "";
}

function handlePersonClick(e) {
	peoplePage.className = "inactive swipeable";
	giftsForPage.className = "active backable";
	selectedPerson = e.target.getAttribute('data-personID');
	db.transaction(function(trans) {
	    trans.executeSql('SELECT * FROM people WHERE person_id = ?', [e.target.getAttribute('data-personID')], 
	    function(tx, rs){
	        //success running the query
	        document.querySelector("#gifts-for-person span").innerHTML = rs.rows.item(0)['person_name'];
	        loadStoredGiftIdeas(e.target.getAttribute('data-personID'));
	    }, 
		function(tx, err){
	        //failed to run the query
	        console.log(err.message);
	    });    
	}, transErr, transSuccess);
}

function loadStoredPeople() {
	db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM people', [], 
        function(tx, rs){
            //success running the query
            for (var i = 0; i < rs.rows.length; i++) {
            	var row = rs.rows.item(i);
            	console.log("grabbed person: " + row['person_name'] + " aaaand " + row['person_id']);

            	var e = document.createElement('li');
            	e.setAttribute('data-personID', row['person_id']);
				e.innerHTML = row['person_name'];

				document.querySelector('.people-ul').appendChild(e);

            	var mc = new Hammer.Manager(e, {});

				mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
				mc.add( new Hammer.Tap({ event: 'singletap' }) );

				mc.get('doubletap').recognizeWith('singletap');
				mc.get('singletap').requireFailure('doubletap');

				console.log("Added delete event for : " + e.innerHTML);
				mc.on("doubletap", function(ev) {
					//Add here to remove data from tables
					db.transaction(function(trans) {
		        		trans.executeSql('DELETE FROM people WHERE person_id = ?', [ev.target.getAttribute('data-personID')], 
		            	function(tx, rs){
		                	//success running the query
		                	console.log("success deleting person: " + ev.target.innerHTML);
		            	}, 
						function(tx, err){
		                	//failed to run the query
		                	console.log(err.message);
		            	});    
		    		}, transErr, transSuccess);	

					ev.target.parentNode.removeChild(ev.target);
				});

				mc.on("singletap", handlePersonClick);
            }
        }, 
		function(tx, err){
            //failed to run the query
            console.log(err.message);
        });    
    }, transErr, transSuccess);
}

function loadStoredOccasions() {
	db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM occasions', [], 
        function(tx, rs){
            //success running the query
            document.getElementById("list-per-occ").innerHTML = "";
            for (var i = 0; i < rs.rows.length; i++) {
            	var row = rs.rows.item(i);

            	var rowName = rs.rows.item(i)['occ_name'];
            	var option = document.createElement('option');
            	option.text = rowName;
            	option.value = row['occ_id'];
            	document.getElementById("list-per-occ").appendChild(option);

            	console.log("grabbed occasion: " + row['occ_name']);

            	var e = document.createElement('li');
            	e.setAttribute('data-occID', row['occ_id']);
				e.innerHTML = row['occ_name'];

				document.querySelector('.occ-ul').appendChild(e);

            	var mc = new Hammer.Manager(e, {});

				mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
				mc.add( new Hammer.Tap({ event: 'singletap' }) );

				mc.get('doubletap').recognizeWith('singletap');
				mc.get('singletap').requireFailure('doubletap');

				console.log("Added delete event for : " + e.innerHTML);
				mc.on("doubletap", function(ev) {
					//Add here to remove data from tables
					db.transaction(function(trans) {
		        		trans.executeSql('DELETE FROM occasions WHERE occ_id = ?', [ev.target.getAttribute('data-occID')], 
		            	function(tx, rs){
		                	//success running the query
		                	console.log("success deleting occasion: " + ev.target.innerHTML);
		            	}, 
						function(tx, err){
		                	//failed to run the query
		                	console.log(err.message);
		            	});    
		    		}, transErr, transSuccess);	

					ev.target.parentNode.removeChild(ev.target);
				});

				mc.on("singletap", handleOccasionClick);
            }
        }, 
		function(tx, err){
            //failed to run the query
            console.log(err.message);
        });    
    }, transErr, transSuccess);
}

function loadStoredGiftIdeas(personid) {
	document.querySelector(".gifts-ul").innerHTML = "";
	console.log("checking for anything from personID : " + selectedPerson);
	db.transaction(function(trans) {
    trans.executeSql('SELECT * FROM gifts WHERE gifts.person_id = ?', [selectedPerson], 
    function(tx, rs){
        //success running the query
        for (var i = 0; i < rs.rows.length; i++) {

        	var row = rs.rows.item(i);

        	console.log("grabbed gift idea: " + row['gift_id']);

        	var e = document.createElement('li');
        	e.setAttribute('data-giftID', row['gift_id']);
			e.innerHTML = row['gift_idea'];

			document.querySelector('.gifts-ul').appendChild(e);

        	var mc = new Hammer.Manager(e, {});

			mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			mc.add( new Hammer.Tap({ event: 'singletap' }) );

			mc.get('doubletap').recognizeWith('singletap');
			mc.get('singletap').requireFailure('doubletap');

			console.log("Added delete event for : " + e.innerHTML);
			mc.on("doubletap", function(ev) {
				//Add here to remove data from tables
				db.transaction(function(trans) {
	        		trans.executeSql('DELETE FROM gifts WHERE gift_id = ?', [ev.target.getAttribute('data-giftID')], 
	            	function(tx, rs){
	                	//success running the query
	                	console.log("success deleting gift idea: " + ev.target.innerHTML);
	            	}, 
					function(tx, err){
	                	//failed to run the query
	                	console.log(err.message);
	            	});    
	    		}, transErr, transSuccess);	

				ev.target.parentNode.removeChild(ev.target);
			});

			mc.on("singletap", handlePurchase);
        }
    }, 
	function(tx, err){
        //failed to run the query
        console.log(err.message);
    });    
    }, transErr, transSuccess);
}

function getNameFromID(id) {

}

function loadStoredGiftOccIdeas(occid) {
	document.querySelector(".gifts-ul").innerHTML = "";
	console.log("checking for anything from occID : " + selectedOccasion);
	document.querySelector('.gifts-occ-ul').innerHTML = "";
	db.transaction(function(trans) {
    trans.executeSql('SELECT * FROM gifts WHERE gifts.occ_id = ?', [selectedOccasion], 
    function(tx, rs){
        //success running the query
        for (var i = 0; i < rs.rows.length; i++) {

        	var row = rs.rows.item(i);

        	console.log("grabbed occasion gifts: " + row['gift_id']);

			db.transaction(function(transs) {
				transs.executeSql('SELECT * FROM people WHERE person_id = ?', [row['person_id']], 
			    function(txx, rss){
			        //success running the quer
			        alert("Got this far");
			        var e = document.createElement('li');
		        	e.setAttribute('data-giftID', row['gift_id']);
			        for(var c = 0; c < rs.rows.length; c++) {
			        	var roww = rss.rows.item(c);
			        	var namee = roww['person_name'];
			        	alert(namee);
			        	personNameSave = namee;
			        }
			        var theText = personNameSave + " - " + row['gift_idea'];
					e.innerHTML = theText;
					document.querySelector('.gifts-occ-ul').appendChild(e);

					var mc = new Hammer.Manager(e, {});

					mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
					mc.add( new Hammer.Tap({ event: 'singletap' }) );

					mc.get('doubletap').recognizeWith('singletap');
					mc.get('singletap').requireFailure('doubletap');

					console.log("Added delete event for : " + e.innerHTML);
					mc.on("doubletap", function(ev) {
						//Add here to remove data from tables
						db.transaction(function(trans) {
			        		trans.executeSql('DELETE FROM gifts WHERE gift_id = ?', [ev.target.getAttribute('data-giftID')], 
			            	function(tx, rs){
			                	//success running the query
			                	console.log("success deleting gift idea: " + ev.target.innerHTML);
			            	}, 
							function(tx, err){
			                	//failed to run the query
			                	console.log(err.message);
			            	});    
			    		}, transErr, transSuccess);	

						ev.target.parentNode.removeChild(ev.target);
					});

					mc.on("singletap", handlePurchase);

			    }, 
				function(txx, errr){
			        //failed to run the query
			        console.log(errr.message);
			    });    
			}, transErr, transSuccess);
        }
    }, 
	function(tx, err){
        //failed to run the query
        console.log(err.message);
    });    
    }, transErr, transSuccess);
}

function handlePurchase(e) {
	if(e.target.className == "purchased") {
		e.target.className = "";
	} else {
		e.target.className = "purchased";
	}
}

function handleOccasionClick(e) {
	occPage.className = "inactive swipeable";
	giftsForOccPage.className = "active backable";
	selectedOccasion = e.target.getAttribute('data-occID');
	db.transaction(function(trans) {
	    trans.executeSql('SELECT * FROM occasions WHERE occ_id = ?', [e.target.getAttribute('data-occID')], 
	    function(tx, rs){
	        //success running the query
	        document.querySelector("#gifts-for-occasion span").innerHTML = rs.rows.item(0)['occ_name'];
	        loadStoredGiftOccIdeas(e.target.getAttribute('data-occID'));
	    }, 
		function(tx, err){
	        //failed to run the query
	        console.log(err.message);
	    });    
	}, transErr, transSuccess);
}

var app = {
    loadRequirements: 0,
    init: function() {
        document.addEventListener("deviceready", app.onDeviceReady);
        document.addEventListener("DOMContentLoaded", app.onDomReady);
    },
    onDeviceReady: function() {
        app.loadRequirements++;
        if (app.loadRequirements === 2) {
            app.start();
        }
    },
    onDomReady: function() {
    	peoplePage = document.getElementById("people-list");
    	occPage = document.getElementById("occasion-list");
    	giftsForPage = document.getElementById("gifts-for-person");
    	giftsForOccPage = document.getElementById("gifts-for-occasion");
        app.loadRequirements++;
        if (app.loadRequirements === 2) {
            app.start();
        }
    },
    start: function() {
        //connect to database
        checkDB();
        //build the lists for the main pages based on data
        loadStoredPeople();
        loadStoredOccasions();
        //add button and navigation listeners
        addListeners();
    }
}

app.init();