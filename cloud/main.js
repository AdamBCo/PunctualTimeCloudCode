
// Use Parse.Cloud.define to define as many cloud functions as you want.

// Scheduled job to schedule push notifications for events
// Finds all Event objects that want pushes within two weeks of run time and doesn't yet have a push
Parse.Cloud.job("scheduleEventPushes", function(request, status) {
	Parse.Cloud.userMasterKey();
	// Get the current date + 2 weeks in ISO-8601 and Unix time
	var d = new Date();
	var twoWeeksAhead = new Date(d);
	twoWeeksAhead.setDate(twoWeeksAhead.getDate() + 14);
	var futureDateISO = twoWeeksAhead.toISOString();
	var futureEpochDate = Date.parse(futureDateISO);

	// Query for Event objects
	var eventQuery = new Parse.Query("Event");
	eventQuery.lessThanOrEqualTo("desiredArrivalTime", futureEpochDate); // Arrival time falls within next 2 weeks
	eventQuery.doesNotExist("push"); // Event doesn't have a push scheduled
	eventQuery.each(function(eventObject) {
		// Create the push
		var installationQuery = new Parse.Query(Parse.Installation);
		installationQuery.equalTo("installation", eventObject.get("installation"));

		Parse.Push.send({
		  where: installationQuery,
		  data: {
		    alert: "(Event name) 30 Minute Warning!", // TODO: add event name to string
		    category: "ThirtyMinuteWarning"
		  }
		  push_time: new Date(eventObject.get("desiredArrivalTime")
		}, {
		  success: function() {
		    eventObject.set("push", 1); // Add "push" key to event - Will this get called on scheduling or pushing?
		  },
		  error: function(error) {
		    // Handle error
		  }
		});
	})
});