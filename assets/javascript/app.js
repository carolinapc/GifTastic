$(document).ready(function(){
    
    var buttons = $("#buttons");
    var stickers = $("#stickers");
    var topics = ["scary","yelling","scream","laugh","happy","sarcastic","sad"];
    var favorites = [];
    var topicsData = [];
    var currentTopic;
    var favoritesOpened = false;


    //stores the favorites in the localStorage
    function storeFavorites(){
        //check if browser supports storage
        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem("favorites", JSON.stringify(favorites));
        }

    }

    //retrieves the favorites stored in the localStorage
    function setFavoritesStored(){
        //check if browser supports storage
        if (typeof(Storage) !== "undefined") {
            if(localStorage.getItem("favorites") !== null){
                favorites = JSON.parse(window.localStorage.getItem('favorites'));
                if(favorites.length ===0) favorites = [];
            }
        }

    }

    //check if an object is included on the favorites (array of objects) - array.include() doesn't work to check this object, because facorites was stored and the array of objects only stores object references
    function isFavorite(item){
        for(var i=0; i< favorites.length; i++){
            if(favorites[i].id === item.id) return true;
        }
        return false;
    }

    function searchSticker(topicObj, offset=0){
        var apiKey = "2Le1nOR1c6chdiUugysImelMGr88olDp";
        var limit = 10;
        var queryURL = "https://api.giphy.com/v1/stickers/search?api_key="+apiKey+"&q="+topicObj.topic+"&limit="+limit+"&offset="+offset;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(response => {

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

    //add or remove the item to/from favorites
    function addOrRemoveFavorite(){
        var idSticker = $(this).val();
        var item = getItemTopicsData(currentTopic);
        
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

        storeFavorites();
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

    //show the stickers related to the topic: if there's data stored, retrieve from the array otherwise retrive it from the API
    function selectTopic(topic){
        currentTopic = topic;
        var topicObj = getItemTopicsData(currentTopic);
        
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
        var topicObj = getItemTopicsData(currentTopic);

        searchSticker(topicObj,topicObj.data.length);
        
    }

    

    function showButtons(){
        topics.sort();
        buttons.empty();
        
        topics.forEach(item => {
            var btn = $("<button>").text(item);
            
            if(currentTopic === item)
                btn.attr("class","btn btn-dark");
            else
                btn.attr("class","btn btn-outline-dark");

            btn.attr("value",item);
            btn.click(topicClick);
            buttons.append(btn);  
        });
    }

    function addButton(){
        var newTopic = $("#word").val().trim();

        if(newTopic != ""){

            //if the topic doesn't exist
            if(!topics.includes(newTopic)){
                topics.push(newTopic);
                //add new data item to array of topic objetcs
                addItemTopicsData(newTopic);
            }

            currentTopic = newTopic;
            //removes the css active button from the button that was active
            $(".btn-dark").attr("class","btn btn-outline-dark");

            showButtons();

            //show the topic items 
            selectTopic(newTopic);
            
            $("#buttons").css("display","block");
            $("#stickers-bar").css("display","flex");
        }
        
    }

    function initialize(){

        setFavoritesStored();

        topics.forEach(item => {
            //add new data item to array of topic objetcs
            addItemTopicsData(item);
        });
        
        showButtons();


    }

    function openFavorites(){
        $("#button-more").css("display","none");
        $("#buttons").css("display","none");
        favoritesOpened = true;
        showStickers(favorites);
    }

    function openStickers(){
        $("#buttons").css("display","block");
        $("#button-more").css("display","none");
        $("#stickers-bar").css("display","flex");
        $(".btn-dark").attr("class","btn btn-outline-dark");
        
        favoritesOpened = false;
        stickers.empty();
    }

    initialize();

    
    $("#button-add").click(addButton);
    $("#button-more").click(showMoreStickers);
    $("#link-stickers").click(openStickers);
    $("#link-favorites").click(openFavorites);
    $("#link-search-stickers").click(openStickers);

    $("#word").keypress(event => {
        if(event.key == "Enter"){
            addButton();
        }
    });
});
