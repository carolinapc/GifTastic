/** GENERAL VARIABLES DECLARATIONS */
var buttons;

/** STICKERS VARIABLES DECLARATIONS */

var stickers;
var topics = ["scary","yelling","scream","laugh","happy","sarcastic","sad"];
var favorites = [];
var topicsData = [];
var currentSubject;
var favoritesOpened = false;

/** EVENTS VARIABLES DECLARATIONS */
var events;
var artists = [];
var following = [];
var followingOpened = false;



//stores the favorites or following in the localStorage
function storeData(storage, data){
    //check if browser supports storage
    if (typeof(Storage) !== "undefined") {
        window.localStorage.setItem(storage, JSON.stringify(data));
    }

}


//retrieves the favorites/following stored in the localStorage
function getDataStored(storage){
    var data = [];
    //check if browser supports storage
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem(storage) !== null){
            data = JSON.parse(window.localStorage.getItem(storage));
            if(data.length ===0) data = [];
        }
    }

    return data;

}

//check if an object is included on the favorites (array of objects) - array.include() doesn't work to check this object, because facorites was stored and the array of objects only stores object references
function isFavorite(item){
    for(var i=0; i< favorites.length; i++){
        if(favorites[i].id === item.id) return true;
    }
    return false;
}

 //add or remove the item to/from favorites
 function addOrRemoveFavorite(){
    var idSticker = $(this).val();
    var item = getItemTopicsData(currentSubject);
    
    //if it is include it in the favorites, remove it, otherwise add it
    if($(this).attr("data-favorite") === "yes" ){
        $(this).attr("data-favorite","no");

        if(favoritesOpened){
            $("#"+idSticker).css("display", "none");
        }
        else{
            $(this).html("<i class='far fa-star'></i>");
        }

        //loop through the topic data searching for the id selected to add into favorites or remove it
        for (var i = 0; i < favorites.length; i++) {
            if(favorites[i].id === idSticker){
                favorites.splice(i,1);
                break;
            }
        }

    }
    else{

        $(this).attr("data-favorite","yes");
        $(this).html("<i class='fas fa-star'></i>");

        //loop through the topic data searching for the id selected to add into favorites or remove it
        for (var i = 0; i < item.data.length; i++) {
            if(item.data[i].id === idSticker){
                favorites.push(item.data[i]);
                break;
            }
        }

    }

    storeData("favorites",favorites);
}

function followOrUnfollow(){
    var artistId = $(this).attr("data-id");
    var artistName = $(this).val();

    if($(this).attr("data-follow") === "yes" ){
        $(this).attr("data-follow","no");

        if(followingOpened){
            $("#"+artistId).css("display", "none");
        }
        else{
            $(this).html("<i class='far fa-star'></i>");
        }

        //loop through the following array searching the artist followed to remove it
        for (var i = 0; i < following.length; i++) {
            if(following[i] === artistName){
                following.splice(i,1);
                break;
            }
        }

    }
    else{

        $(this).attr("data-follow","yes");
        $(this).html("<i class='fas fa-star'></i>");

        following.push(artistName);

    }

    storeData("following",following);
}

function searchSticker(topicObj, offset=0){
    var apiKey = "2Le1nOR1c6chdiUugysImelMGr88olDp";
    var limit = 10;
    var queryURL = "https://api.giphy.com/v1/stickers/search?api_key="+apiKey+"&q="+topicObj.topic+"&limit="+limit+"&offset="+offset;
    
    $.ajax({
        url: queryURL,
        method: "GET",
        success: response => {

            if(offset ===0){
                topicObj.data = response.data;
                showStickers(response.data);
            }
            else
            {
                
                response.data.forEach(item => {
                    topicObj.data.push(item);  
                    createSticker(item);  
                });
            }
        },
        error: function () {
            console.log("error");
            stickers.empty();
            $("#button-more").css("display","none");
        }
    });
   
}

function searchArtist(artist){
    currentSubject = artist;

    var apiKey = "630bd839-71e8-4fdc-a573-30a09281b83e";
    var queryURL = "https://rest.bandsintown.com/artists/"+artist+"?app_id="+apiKey;
    
    $.ajax({
        url: queryURL,
        method: "GET",
        success: response => {
            
            showArtist(response);  
        },
        error: function () {
            console.log("error");
            // stickers.empty();
            // $("#button-more").css("display","none");
        }
    });
}

function searchArtistEvents(artist){
    var apiKey = "630bd839-71e8-4fdc-a573-30a09281b83e";
    var queryURL = "https://rest.bandsintown.com/artists/"+artist+"/events?app_id="+apiKey+"&date=upcoming";
    
    $.ajax({
        url: queryURL,
        method: "GET",
        success: response => {
            
            showArtistEvents(response);  
        },
        error: function () {
            console.log("error");
            // stickers.empty();
            // $("#button-more").css("display","none");
        }
    });

}

//returns an item from topicsData array
function getItemTopicsData(topic){

    var item;
    for(var i=0; i < topicsData.length; i++){
        if(topicsData[i].topic === topic){
            item = topicsData[i];
            break;
        }
    }
    return item;
}


function addItemTopicsData(topic){
    //add new data object into topicsData array 
    var data = {
        topic: topic,
        data: []                
    };
    topicsData.push(data);
    
}



//when the user clicks on the sticker: the image plays or stops dependending on the current status
function toggleSticker(){
    var sticker = $(this);

    if(sticker.attr("src-animated") === sticker.attr("src")){
        sticker.attr("src",sticker.attr("src-original"));
    }
    else{
        sticker.attr("src",sticker.attr("src-animated"));
    }
}

//when the user clicks on a topic button 
function topicClick(){

    $(".btn-dark").attr("class","btn btn-outline-dark");
    $(this).attr("class","btn btn-dark");
    selectTopic($(this).attr("value"));
}

//when the user clicks on a artist button 
function artistClick(){
    followingOpened = false;
    $(".btn-dark").attr("class","btn btn-outline-dark");
    $(this).attr("class","btn btn-dark");
    searchArtist($(this).attr("value"));
}
//when the user clicks on a artist image from the following page
function followingArtistClick(){
    followingOpened = false;
    searchArtist($(this).attr("data-name"));
    currentSubject = "";
}

//show the stickers related to the topic: if there's data stored, retrieve from the array otherwise retrive it from the API
function selectTopic(topic){
    currentSubject = topic;
    var topicObj = getItemTopicsData(currentSubject);
    
    if(topicObj.data.length > 0){
        //show the stickers from the data stored
        showStickers(topicObj.data);
    }
    else
    {
        //search for the topic in the API and load the topic data
        searchSticker(topicObj);
    }
    
    $("#button-more").css("display","block");
}


function showArtist(artist){
    if(!followingOpened) events.empty();

    var img = $("<img>");
    var figure = $("<figure>");
    var figCaption = $("<figcaption>").text(artist.name);
    var button = $("<button>");

    if(following.includes(artist.name)){
        button.html("<i class='fas fa-star'></i>");
        button.attr("data-follow", "yes");
    }
    else{
        button.html("<i class='far fa-star'></i>");
        button.attr("data-follow", "no");
    }

    button.attr("data-id", artist.id);
    button.attr("value",artist.name);
    button.click(followOrUnfollow);

    img.attr("src",artist.image_url);

    if(followingOpened){
        img.click(followingArtistClick);
        img.css("cursor","pointer");
        img.attr("data-name", artist.name);
    }
    else{
        img.css("cursor","default");
    }

    

    figure.attr("id", artist.id);
    figure.addClass("artist");

    figCaption.prepend(button);
    figure.append(img);
    figure.append(figCaption);
    events.append(figure);

    if(!followingOpened) searchArtistEvents(artist.name);

}

function showArtistEvents(event){
    var table = $("<table>");
    table.append("<tr><th>Date</th><th>Venue</th><th>Location</th><th>Tickets</th></tr>");

    event.forEach(item => {
        var newRow = $("<tr>");
        var newLink = $("<a>").text("Tickets");
        newLink.attr("href",item.url);
        newLink.attr("target", "_blank");

        newRow.append($("<td>").text(item.datetime));
        newRow.append($("<td>").text(item.venue.name));
        newRow.append($("<td>").text(item.venue.city + " - "+item.venue.country));
        newRow.append($("<td>").append(newLink));
        table.append(newRow);
    });
    
    events.append(table);
}

//creates the elements to place the image and append it into the sticker section
function createSticker(item){
    var img = $("<img>");
    var figure = $("<figure>");
    var figCaption = $("<figcaption>").text("Rating: "+item.rating);
    var button = $("<button>");

    if(isFavorite(item)){
        button.html("<i class='fas fa-star'></i>");
        button.attr("data-favorite", "yes");
    }
    else{
        button.html("<i class='far fa-star'></i>");
        button.attr("data-favorite", "no");
    }

    
    button.attr("value",item.id);
    button.click(addOrRemoveFavorite);

    img.attr("src",item.images.original_still.url);
    img.attr("src-animated",item.images.fixed_width.url);
    img.attr("src-original",item.images.original_still.url);
    img.attr("title",item.title);
    img.click(toggleSticker);
    img.addClass("sticker");

    figure.attr("id", item.id);

    figCaption.prepend(button);
    figure.append(img);
    figure.append(figCaption);
    stickers.append(figure);
}



//show stickers from the data (could be from the array (topicsData) or the API)
function showStickers(data){
    stickers.empty();

    data.forEach(item =>{
        createSticker(item);
    });
}

//add more stickers into the current topic (without overwrite the existing images)
function showMoreStickers(){
    var topicObj = getItemTopicsData(currentSubject);

    searchSticker(topicObj,topicObj.data.length);
    
}


//show buttons of the subject (topics or artists)
function showButtons(subject, clickFunction){
    subject.sort();
    buttons.empty();
    
    subject.forEach(item => {
        var btn = $("<button>").text(item);
        
        if(currentSubject === item)
            btn.attr("class","btn btn-dark");
        else
            btn.attr("class","btn btn-outline-dark");

        btn.attr("value",item);
        btn.click(clickFunction);
        buttons.append(btn);  
    });
}

function addTopic(){
    var newTopic = $("#topic").val().trim();

    if(newTopic != ""){

        //if the topic doesn't exist
        if(!topics.includes(newTopic)){
            topics.push(newTopic);
            //add new data item to array of topic objetcs
            addItemTopicsData(newTopic);
        }

        currentSubject = newTopic;
        //removes the css active button from the button that was active
        $(".btn-dark").attr("class","btn btn-outline-dark");

        showButtons(topics, topicClick);

        //show the topic items 
        selectTopic(newTopic);
        
        $("#buttons").css("display","block");
        $("#stickers-bar").css("display","flex");
    }
    
}

function addArtist(){
    followingOpened = false;
    var newArtist = $("#artist").val().trim();

    if(newArtist != ""){

        //if the topic doesn't exist
        if(!artists.includes(newArtist)){
            artists.push(newArtist);
        }

        currentSubject = newArtist;
        //removes the css active button from the button that was active
        $(".btn-dark").attr("class","btn btn-outline-dark");

        showButtons(artists, artistClick);

        //show the topic items 
        searchArtist(newArtist);
        
        $("#buttons").css("display","block");
        $("#events-bar").css("display","flex");
    }
    
}

function initialize(){

    favorites = getDataStored("favorites");
    following = getDataStored("following");
    following.forEach(item => {
        artists.push(item);
    });
    
    console.log(artists);

    topics.forEach(item => {
        //add new data item to array of topic objetcs
        addItemTopicsData(item);
    });
    
    showButtons(topics, topicClick);


}

function openFavorites(){
    $("#button-more").css("display","none");
    $("#buttons").css("display","none");
    favoritesOpened = true;
    showStickers(favorites);
}

function openFollowing(){
    $("#buttons").css("display","none");
    followingOpened = true;
    events.empty();
    
    following.forEach(artist => {
        searchArtist(artist);    
    });
    
}

function openStickers(){
    $("#buttons").css("display","block");
    $("#button-more").css("display","none");
    $("#stickers-bar").css("display","flex");
    $("#events-bar").css("display","none");
    $("#stickers").css("display","flex");
    $("#events").css("display","none");
    $(".btn-dark").attr("class","btn btn-outline-dark");

    showButtons(topics, topicClick);
    favoritesOpened = false;
    stickers.empty();
}

function openEvents(){
    followingOpened = false;
    events.empty();
    $("#stickers-bar").css("display","none");
    $("#stickers").css("display","none");
    $("#events-bar").css("display","flex");
    $("#events").css("display","flex");
    $("#buttons").css("display","block");
    $("#button-more").css("display","none");

    showButtons(artists, artistClick);
}


$(document).ready(function(){
    
    buttons = $("#buttons");
    stickers = $("#stickers");
    events = $("#events");
    
    $("#button-more").click(showMoreStickers);
    $("#link-stickers").click(openStickers);
    $("#link-search-stickers").click(openStickers);
    $("#link-favorites").click(openFavorites);

    $("#button-add-topic").click(addTopic);
    $("#topic").keypress(event => {
        if(event.key == "Enter"){
            addTopic();
        }
    });

    $("#link-events").click(openEvents);
    $("#link-search-events").click(openEvents);
    $("#link-following").click(openFollowing);
    $("#button-add-artist").click(addArtist);
    $("#artist").keypress(event => {
        if(event.key == "Enter"){
            addArtist();
        }
    });
    

    initialize();
});
