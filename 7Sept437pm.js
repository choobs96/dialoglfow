

"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card } = require("dialogflow-fulfillment");
const BIGQUERY = require("@google-cloud/bigquery");

const BIGQUERY_CLIENT = new BIGQUERY({
projectId: "test420-sifu-fitnub" // ** CHANGE THIS **
});
process.env.DEBUG = "dialogflow:debug";

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
(request, response) => {
  const agent = new WebhookClient({request: request, response: response});
  function direct_search(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const CAR_BRAND = OUTPUT_CONTEXTS[0].parameters.carbrand;
    const CAR_MODEL = OUTPUT_CONTEXTS[0].parameters.car_model;
    const YEAR = OUTPUT_CONTEXTS[0].parameters.year;
    console.log("test"+CAR_BRAND,CAR_MODEL,YEAR);
    var parameter_list =[CAR_BRAND,CAR_MODEL,YEAR];
    var parameter_list_output = [];
    var dict = {0:"Brand = @carbrand" ,1: "Model = @car_model" ,2:"Date = @year"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
        }else{
            parameter_list_output.push(1);
        }
    }
	var i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


 
    // The SQL Query to Run
    /*const SQLQUERY = `
		SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo
		FROM staging.carsifu_db_2
		WHERE Brand = @carbrand and Model = @car_model or Date = @year order by Date desc
		`;*/

    const OPTIONS = {
      query: SQLQUERY,
      // Location must match that of the dataset(s) referenced in the query.
      location: "asia-southeast1",
      params: {
        //intent variable to variable
        carbrand : CAR_BRAND,
        car_model : CAR_MODEL,
        year : YEAR
      }
    };
    agent.add("Oh great! So "+" you're looking for a "+YEAR+" "+CAR_MODEL+" "+CAR_BRAND+".");
    var j = 0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        //Capture results from the Query
        console.log(JSON.stringify(results[0]));
        i=0;
      	var final_output=[];
        for (i = 0; i < results[0].length; i++) {
          const QUERY_RESULT = results[0][i];
          const car_price = QUERY_RESULT.price;
          const car_url = QUERY_RESULT.car_url;
          const car_engine = QUERY_RESULT.engine;
          const car_photo = QUERY_RESULT.photo;
          const car_description = QUERY_RESULT.description;
          var output = "";
          for (j = 0; j < (parameter_list_output.length); j++) {
            if (parameter_list_output[j]==1){
              output=output+' '+parameter_list[j];
            }
          }
          final_output.push(output+" is RM "+car_price+" "+car_url);
          console.log(output+" is RM "+car_price+" "+car_url);  
           }
      console.log(final_output);
      agent.add('We\'ve found '+final_output.length+' results for you 😉');
      var x=0;
      //var result = '';
      for (x = 0; x < (final_output.length); x++) {
        console.log(final_output.length);
      		//result=result+final_output[j];
        agent.add(new Card({
          title: 'RM '+results[0][x].price+' '+results[0][x].description,
          imageUrl: results[0][x].photo,
          buttonText: 'View Car 🚗',
          buttonUrl: results[0][x].car_url
          })
      		);
      console.log("Pass query");
      }
      
      //agent.add('Type "Try Again" to restart');
		
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Sorry we don't have the car that you're looking for! Please try again");
      });
  }
	//----------------------------------------------------------------------------------------------------------------------------------------------//
  //THIS IS FOR BUDGET QUERY------------------------------------------------------------------------------------------------------------------------//
    function budget_search(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const CAR_BUDGET = OUTPUT_CONTEXTS[0].parameters.budget_np;
	var parameter_list =[CAR_BUDGET];
    var parameter_list_output = [];
    var dict = {0:"grouped_price = @budget_np"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
        }else{
            parameter_list_output.push(1);
        }
    }
	var i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


    const OPTIONS = {
      query: SQLQUERY,
      location: "asia-southeast1",
      params: {
        budget_np : CAR_BUDGET
      }
    };
    var j = 0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        i=0;
      	var final_output=[];
        for (i = 0; i < results[0].length; i++) {
          const QUERY_RESULT = results[0][i];
          const car_price = QUERY_RESULT.price;
          const car_url = QUERY_RESULT.car_url;
          const car_engine = QUERY_RESULT.engine;
          const car_photo = QUERY_RESULT.photo;
          const car_description = QUERY_RESULT.description;
          var output = "";
          for (j = 0; j < (parameter_list_output.length); j++) {
            if (parameter_list_output[j]==1){
              output=output+' '+parameter_list[j];
            }
          }
          final_output.push(output+" is RM "+car_price+" "+car_url);
          console.log(output+" is RM "+car_price+" "+car_url);  
           }
      console.log(final_output);
      agent.add('We\'ve found '+final_output.length+' results for you 😉');
      j=0;
		
      for (j = 0; j < (final_output.length); j++) {
        agent.add(new Card({
          title: 'RM '+results[0][j].price+' '+results[0][j].description,
          imageUrl: results[0][j].photo,
          buttonText: 'View Car 🚗',
          buttonUrl: results[0][j].car_url
          })
      		);
      }
		agent.add('Type "Try Again" to restart');
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Please try again");
      });
  }
  //-----------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR BRAND POST
  function brand_search(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const CAR_BRAND = OUTPUT_CONTEXTS[0].parameters.carbrand;
	var parameter_list =[CAR_BRAND];
    var parameter_list_output = [];
    var dict = {0:"Brand = @carbrand"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
        }else{
            parameter_list_output.push(1);
        }
    }
	var i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


    const OPTIONS = {
      query: SQLQUERY,
      location: "asia-southeast1",
      params: {
        carbrand : CAR_BRAND
      }
    };
    var j = 0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        i=0;
      	var final_output=[];
        for (i = 0; i < results[0].length; i++) {
          const QUERY_RESULT = results[0][i];
          const car_price = QUERY_RESULT.price;
          const car_url = QUERY_RESULT.car_url;
          const car_engine = QUERY_RESULT.engine;
          const car_photo = QUERY_RESULT.photo;
          const car_description = QUERY_RESULT.description;
          var output = "";
          for (j = 0; j < (parameter_list_output.length); j++) {
            if (parameter_list_output[j]==1){
              output=output+' '+parameter_list[j];
            }
          }
          final_output.push(output+" is RM "+car_price+" "+car_url);
          console.log(output+" is RM "+car_price+" "+car_url);  
           }
      console.log(final_output);
      agent.add('We\'ve found '+final_output.length+' results for you 😉');
      j=0;

      for (j = 0; j < (final_output.length); j++) {
        agent.add(new Card({
          title: 'RM '+results[0][j].price+' '+results[0][j].description,
          imageUrl: results[0][j].photo,
          buttonText: 'View Car 🚗',
          buttonUrl: results[0][j].car_url
          })
      		);
      }
		agent.add('Type "Try Again" to restart');
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Please try again");
      });
  }
  //--------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR MODEL POST----------------------------------------------------------------------------------------------------------------------------------//
    function model_search(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const CAR_MODEL = OUTPUT_CONTEXTS[0].parameters.car_model;
	var parameter_list =[CAR_MODEL];
    var parameter_list_output = [];
    var dict = {0:"Model = @car_model"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
          	console.log("FAIL");
        }else{
            parameter_list_output.push(1);
        }
    }
	var i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


    const OPTIONS = {
      query: SQLQUERY,
      location: "asia-southeast1",
      params: {
        car_model : CAR_MODEL
      }
    };
    var j = 0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        i=0;
      	var final_output=[];
        for (i = 0; i < results[0].length; i++) {
          const QUERY_RESULT = results[0][i];
          const car_price = QUERY_RESULT.price;
          const car_url = QUERY_RESULT.car_url;
          const car_engine = QUERY_RESULT.engine;
          const car_photo = QUERY_RESULT.photo;
          const car_description = QUERY_RESULT.description;
          var output = "";
          for (j = 0; j < (parameter_list_output.length); j++) {
            if (parameter_list_output[j]==1){
              output=output+' '+parameter_list[j];
            }
          }
          final_output.push(output+" is RM "+car_price+" "+car_url);
          console.log(output+" is RM "+car_price+" "+car_url);  
           }
      console.log(final_output);
      agent.add('We\'ve found '+final_output.length+' results for you 😉');
      j=0;

      for (j = 0; j < (final_output.length); j++) {
        agent.add(new Card({
          title: 'RM '+results[0][j].price+' '+results[0][j].description,
          imageUrl: results[0][j].photo,
          buttonText: 'View Car 🚗',
          buttonUrl: results[0][j].car_url
          })
      		);
       
      }
		agent.add('Type "Try Again" to restart');
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Please try again");
      });
  }
  //--------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR YEAR POST----------------------------------------------------------------------------------------------------------------------------------//
      function year_search(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const YEAR = OUTPUT_CONTEXTS[0].parameters.year;
	var parameter_list =[YEAR];
    var parameter_list_output = [];
    var dict = {0:"Date = @year"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
        }else{
            parameter_list_output.push(1);
        }
    }
	var i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


    const OPTIONS = {
      query: SQLQUERY,
      location: "asia-southeast1",
      params: {
        year : YEAR
      }
    };
    var j = 0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        i=0;
      	var final_output=[];
        for (i = 0; i < results[0].length; i++) {
          const QUERY_RESULT = results[0][i];
          const car_price = QUERY_RESULT.price;
          const car_url = QUERY_RESULT.car_url;
          const car_engine = QUERY_RESULT.engine;
          const car_photo = QUERY_RESULT.photo;
          const car_description = QUERY_RESULT.description;
          var output = "";
          for (j = 0; j < (parameter_list_output.length); j++) {
            if (parameter_list_output[j]==1){
              output=output+' '+parameter_list[j];
            }
          }
          final_output.push(output+" is RM "+car_price+" "+car_url);
          console.log(output+" is RM "+car_price+" "+car_url);  
           }
      console.log(final_output);
      agent.add('We\'ve found '+final_output.length+' results for you 😉');
      j=0;

      for (j = 0; j < (final_output.length); j++) {
        agent.add(new Card({
          title: 'RM '+results[0][j].price+' '+results[0][j].description,
          imageUrl: results[0][j].photo,
          buttonText: 'View Car 🚗',
          buttonUrl: results[0][j].car_url
          })
      		);
      }
		agent.add('Type "Try Again" to restart');
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Please try again");
      });
  }
  //--------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR TRENDING POST----------------------------------------------------------------------------------------------------------------------------------//
  	  
function trending(agent) {
  
    // Capture Parameters from the Current Dialogflow Context
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log('this is output'+Object.keys(OUTPUT_CONTEXTS));

    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description,Car_Views as views FROM staging.carsifu_db_4 order by cast(Car_Views as numeric) desc limit 5`);
    console.log('test'+SQLQUERY);


    const OPTIONS = {
      query: SQLQUERY,
      location: "asia-southeast1",
    };
	var i=0;
    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        for (i = 0; i < 5; i++) {
          var QUERY_RESULT = results[0][i];
          var car_price = QUERY_RESULT.price;
          var car_url = QUERY_RESULT.car_url;
          var car_engine = QUERY_RESULT.engine;
          var car_photo = QUERY_RESULT.photo;
          var car_description = QUERY_RESULT.description;
		  var car_view = QUERY_RESULT.Car_Views;
		  agent.add(new Card({
          title: 'RM '+car_price+' '+car_description+' ('+car_view+' Views)',
          imageUrl: car_photo,
          buttonText: 'View Car 🚗',
          buttonUrl: car_url
          })
      		);
        console.log("Pass card print");
		}
      //agent.add('Type "Try Again" to restart');
	})
	
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Please try again");
      });

}
  //--------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR SBS POST BUDGET----------------------------------------------------------------------------------------------------------------------------------//  
  //--------------------------------------------------------------------------------------------------------------------------------------------------//
  //FOR SBS POST NEXT----------------------------------------------------------------------------------------------------------------------------------//  
function sbs_suggestion(agent) {
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
	const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
    console.log(OUTPUT_CONTEXTS);
    var i;
    var max_len=0;
    var ind_max = 0;
    for (i = 0; i < OUTPUT_CONTEXTS.length-1; i++) {
        //console.log("test"+Object.keys(OUTPUT_CONTEXTS[i].parameters).length+"num"+i);
        if (max_len < Object.keys(OUTPUT_CONTEXTS[i].parameters).length){
            max_len = Object.keys(OUTPUT_CONTEXTS[i].parameters).length;
          	ind_max = i;
        }
        }
    console.log(ind_max);
    const CAR_MODEL = OUTPUT_CONTEXTS[ind_max].parameters.car_model;
    const YEAR = OUTPUT_CONTEXTS[ind_max].parameters.year;
    const CAR_BRAND = OUTPUT_CONTEXTS[ind_max].parameters.carbrand;
    const CAR_BUDGET = OUTPUT_CONTEXTS[ind_max].parameters.budget_np;
	
	
	var parameter_list =[CAR_BRAND,CAR_MODEL,YEAR,CAR_BUDGET];
	console.log(parameter_list);
    var parameter_list_output = [];
    var dict = {0:"Brand = @carbrand" ,1: "Model = @car_model" ,2:"Date = @year",3:"grouped_price = @budget_np"};
    function parameter_checker(var_input) {
        if (var_input===""){
            parameter_list_output.push(0);
        }else{
            parameter_list_output.push(1);
        }
    }
	i=0;
    for (i = 0; i < parameter_list.length; i++) {
      parameter_checker(parameter_list[i]);
    }

    var query_list =``;
    i =0;
    for (i = 0; i < (parameter_list_output.length); i++) {
      if (parameter_list_output[i]==1){
        if (query_list.length ===0) {
          query_list=query_list+' '+dict[i];
        }else{
        query_list=query_list+' AND '+dict[i];
        }
      }
    }
 
    // The SQL Query to Run
    const SQLQUERY=(`SELECT Car_Price as price,Car_selection6_url as car_url,Engine as engine,Car_photo as photo,Car_name as description FROM staging.carsifu_db_4 WHERE ${query_list} order by cast(Car_Views as numeric) desc limit 5`);
	console.log(SQLQUERY);
    const OPTIONS = {
      query: SQLQUERY,
      // Location must match that of the dataset(s) referenced in the query.
      location: "asia-southeast1",
      params: {
        //intent variable to variable
        carbrand : CAR_BRAND,
        car_model : CAR_MODEL,
        budget_np : CAR_BUDGET,
        year : YEAR     
      }
    };

    return BIGQUERY_CLIENT.query(OPTIONS)
      .then(results => {
        console.log(JSON.stringify(results[0]));
        var z=0;
      	var final_output=[];
        for (z = 0; z < results[0].length; z++) {
          var QUERY_RESULT = results[0][z];
		  console.log("print this shit "+z);
          console.log("WTF MAN"+QUERY_RESULT);
		  console.log(QUERY_RESULT);
          var car_price = QUERY_RESULT.price;
          var car_url = QUERY_RESULT.car_url;
          var car_engine = QUERY_RESULT.engine;
          var car_photo = QUERY_RESULT.photo;
          var car_description = QUERY_RESULT.description;
          console.log(car_price+car_url+car_engine+car_photo+car_description);
		  //agent.add(car_price+car_url+car_engine+car_photo+car_description);
          console.log("DNAS");
		  agent.add(new Card({
          title: 'RM '+car_price+' '+car_description,
          imageUrl: car_photo,
          buttonText: 'View Car 🚗',
          buttonUrl: car_url
          })
         
      		); 
          console.log("PASSSSSSSSSSSSS");
           }
      
      })
      .catch(err => {
        console.error("ERROR:", err);
      	agent.add("Sorry we don't have the car that you're looking for! Please try again");
      });
  }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();  
  //new intentmap
  //intentMap.set("`thestar-dimsum.datamart_print.kuntum_subscription_summary`", find_subscription_end_date);
  intentMap.set("direct_search", direct_search);
  intentMap.set("budget_options_query", budget_search);
	intentMap.set("trending_top5", trending);
  intentMap.set("trending_top5", trending);
  intentMap.set("suggestion_list", sbs_suggestion);
  intentMap.set("brand_options_query",brand_search);
  intentMap.set("model_options_query",model_search);
  intentMap.set("year_options_query",year_search);
  

 
  

  
  agent.handleRequest(intentMap);
}
);