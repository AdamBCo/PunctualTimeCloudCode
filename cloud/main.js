
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
// Parse.Cloud.define("hello", function(request, response) {
//   response.success("Hello world!");
// });

Parse.Cloud.job("scheduleEventPushes", function(request, status) {
	Parse.Cloud.userMasterKey();
	// Get the current date + 2 weeks in ISO-8601 and Epoch
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
		installationQuery.equalTo('installation', eventObject.installation); // Can I access properties like this?

		Parse.Push.send({
		  where: installationQuery,
		  data: {
		    alert: "(Event name) 30 Minute Warning!",
		    category: "ThirtyMinuteWarning"
		  }
		  push_time: new Date(eventObject.desiredArrivalTime) // Can I access properties like this?
		}, {
		  success: function() {
		    eventObject.set("push", 1); // Add "push" key to event
		  },
		  error: function(error) {
		    // Handle error
		  }
		});
	})
});