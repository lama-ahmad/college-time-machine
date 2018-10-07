var inputYearLeft;
var inputYearRight;

$('#timemachine').click(function(){
    
    //clear the previous html
    $('#college-info-left').html("");
    $('#college-info-right').html("");
    $('#which-one').html("");
    $('#specify').html("");

    // get what you type in the input box
    var theInput = $('#the-input').val();

    searchCSC(theInput);
});


$(document).on('input', '#select-year-left', function() {
    $('#college-info-left').html("");
    $('#college-info-right').html("");
    inputYearLeft = $(this).val();
});

$(document).on('input', '#select-year-right', function() {
    $('#college-info-left').html("");
    $('#college-info-right').html("");
    inputYearRight = $(this).val();
});


function makeCollegeInfoHTML(cost, admissionRate, demos, year, div) {
    $(div).append("<h2><u>College Information in " + year + "</u></h2>");

    //Cost of Attendance
    var costYear = "<p><strong>Cost of Attendance:</strong> $" + cost + "</p>";
    $(div).append(costYear);
    
    //Admission Rate
    $(div).append("<p><strong>Acceptance Rate: </strong>" + admissionRate.toFixed(2) + "%</p>");

    //Demographic Race Data
    $(div).append("<h4>Racial Composition</h4>");
    for(var i in demos) {
        $(div).append("<p>" + i + ": " + (demos[i] * 100).toFixed(2) + "%" + "</p>");
    }
}

function makeNYTimesArticlesHTML(articles, div) {
    console.log('zzzzzz');


    $(div).append("<h2>Random article from the NYTimes ...</h2>");
    var elementList = [];
    for (var i = 0; i < articles.length; i++){
        var headline = articles[i].headline.main;
        var url = articles[i].web_url;
        var headline_url = "<p><a href =" + url + ">" + headline + "</a></p>";
        elementList.push(headline_url);
    }

    var element = elementList[Math.floor(Math.random()*elementList.length)];
    console.log(element);
    $(div).append(element);    

    // for (var element = 0; element < elementList.length; element++) {
    //     $('#article-info').append(elementList[element]);

}

function makeWBHTML(url, year, div) {
    //Create anchor
    var a = $('<a />', {
        "target" : "_blank",
        "href" : url,
        "text" : " Click here to view the website in " + year
    });

    //Create paragraph and append anchor
    var p = $('<p id="wb-url"/>').append(a);

    //Append Paragraph
    $(div).append(p);
}

function searchCSC(searchTerm){

    var cscKey = "7uoRO02y8kniwL2ilCAAkWHXVZ5pEE1RPlN6GEOd";
    var schoolName = encodeURIComponent(searchTerm); 
    var cscURL = "https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=" + schoolName + "&api_key=" + cscKey;

    $('#timemachine').hide();
    $('#timemachine-loading').css("display", "block");

    $.ajax({
        url : cscURL,
        type : 'GET', 
        dataType : 'jsonp', 
        error : function(err){
            console.log(err);
        },
        success : function(data){
            $('#timemachine-loading').hide();
            $('#timemachine').show();

            //loop through search results to get the resultIndex 
            var resultIndex;

            if (data.results.length > 1) {
                $('#which-one').html("Can you please be specific?");
                $('#specify').css("display", "inline-block");
                $('#specify').append("<option value=''>Select a college</option>")

                for (var i = 0; i < data.results.length; i++) {
                    $('#specify').append("<option value=" + i + ">" + data.results[i].school.name + "</option>"); 
                }

                $(document).on('input', '#specify', function() {
                    $('#college-info-left').html("");
                    $('#college-info-right').html("");
                    resultIndex = $(this).val();
                    getSpecificCSCData();     
                 });  

            } else if (data.results.length == 0) {
                $('#which-one').html("No results found. This time machine doesn't like acronyms or bad spelling. Try again!");
            } else {
                resultIndex = 0;
                getSpecificCSCData();
            }

            //use the resultIndex to access the data on the selected university
            function getSpecificCSCData () {
                var selectedData = data.results[resultIndex];

                //get the range of years we have information on the selected university
                var yearRange = [Object.keys(selectedData)[0], Object.keys(selectedData).slice(-7)[0]];
                
                yearList = [inputYearLeft, inputYearRight];

                for (i in yearList) {
                    var costAttendance = selectedData[yearList[i]].cost.attendance.academic_year;

                    var admissionRate = selectedData[yearList[i]].admissions.admission_rate.overall;
                    admissionRate = admissionRate * 100;
        
                    var race_ethnicity = selectedData[yearList[i]].student.demographics.race_ethnicity;
                    var demos = {Asian: race_ethnicity.asian, Black: race_ethnicity.black, Hispanic: race_ethnicity.hispanic,
                                Multiple: race_ethnicity.two_or_more, White: race_ethnicity.white};
                
                    var webPage = selectedData.school.school_url;
                    
                        var selectedDiv;

                        if(yearList[i] == inputYearLeft) {
                            selectedDiv = "#college-info-left";
                        }
                        else {
                            selectedDiv = "#college-info-right";
                        }
                    
                    $(document).ready(function() { 
                        makeCollegeInfoHTML(costAttendance, admissionRate, demos, yearList[i], selectedDiv);
                        // wayBack(webPage, yearList[i], selectedDiv);
                        NYTimesSearch(searchTerm, yearList[i], selectedDiv);
                    });

                }
           
            }
    }
});


}


function NYTimesSearch(searchTerm, year, selectedDiv) {
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
    'api-key': "1647876b88394d97bc29a86e4b374ebf",
    'q': searchTerm,
    'begin_date': year + "0101",
    'end_date': year + "1231"
    });

    $.ajax({
        url: url,
        method: 'GET',
        dataType : 'json', 
        error : function(err){
            console.log("Uh oh NYT?");
            console.log(err);
        },
        success : function(data){
            console.log("Woo hoo NYT!");

            var allArticles = data.response.docs;    
            var linkedArticles = []; 

            //only get the articles with active links
            for (i = 0; i < allArticles.length; i++) {
                if (allArticles[i].web_url.startsWith('https://www.nytimes.com/')) {  
                    linkedArticles.push(allArticles[i]);
                }        
            }

            makeNYTimesArticlesHTML(linkedArticles, selectedDiv);
        }
    });

}


//this function is to find the webpage of the school for the specific year selected
function wayBack(webpage, inputYear, div) {
    waybackRequestURL = "https://archive.org/wayback/available?url=" + webpage + "&timestamp=" + inputYear;
    var wayBackURL;
 
    $.ajax({
        url: waybackRequestURL,
        method: 'GET',
        dataType: 'jsonp',
        error : function(err){
            console.log(err);
        },
        success : function(data){
            var wayBackURL = data.archived_snapshots.closest.url;
            makeWBHTML(wayBackURL, inputYear, div);
        }

    });
    


}