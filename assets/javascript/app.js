$(document).ready(function(){
    
    var buttons = $("#buttons");
    var stickers = $("#stickers");
    var topics = ["scary","yelling","scream","laugh","happy","sarcastic","sad"];
    var favorites = [];
    var topicsData = [];
    var currentTopic;
    var favoritesOpened = false;

    function searchSticker(topicData, offset=0){
        var apiKey = "2Le1nOR1c6chdiUugysImelMGr88olDp";
        var limit = 10;
        var queryURL = "https://api.giphy.com/v1/stickers/search?api_key="+apiKey+"&q="+topicData.topic+"&limit="+limit+"&offset="+offset;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(response => {

            if(offset ===0){
                topicData.data = response.data;
                showStickers(response.data);
            }
            else
            {
                response.data.forEach(item => {
                    topicData.data.push(item);  
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
        
        console.log(idSticker);
        if($(this).text() === "+" ){
            //loop through the topic data searching for the id selected to add into favorites or remove it
            for (var i = 0; i < item.data.length; i++) {
                if(item.data[i].id === idSticker){
                    favorites.push(item.data[i]);
                    $(this).text("-");
                    break;
                }
            }
        }
        else{
            //loop through the topic data searching for the id selected to add into favorites or remove it
            for (var i = 0; i < favorites.length; i++) {
                if(favorites[i].id === idSticker){
                    favorites.splice(i,1);
                    if(favoritesOpened)
                        $("#"+idSticker).css("display", "none");
                    else
                        $(this).text("+");
                }
            }
        }

        console.log(favorites);
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

    //when the user clicks on a topic button: show the stickers related 
    function selectTopic(){
        currentTopic = $(this).attr("value");
        var topicData = getItemTopicsData(currentTopic);
        
        if(topicData.data.length > 0){
            //show the stickers from the data stored
            showStickers(topicData.data);
        }
        else
        {
            //search for the topic in the API and load the topic data
            searchSticker(topicData);
        }
        
        $("#button-more").css("display","block");
    }
    
    //creates the elements to place the image and append it into the sticker section
    function createSticker(item){
        var img = $("<img>");
        var figure = $("<figure>");
        var figCaption = $("<figcaption>").text("Rating: "+item.rating);
        var button = $("<button>");

        if(favorites.includes(item))
            button.text("-");
        else
            button.text("+");

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
        var topic = getItemTopicsData(currentTopic);

        searchSticker(topic,topic.data.length);
        
    }

    

    function showButtons(){
        topics.sort();
        buttons.empty();
        topics.forEach(item => {
            var btn = $("<button>").text(item);
            btn.addClass("topic");
            btn.attr("value",item);
            btn.click(selectTopic);
            buttons.append(btn);  
        });
    }

    function addButton(){
        var newTopic = $("#word").val();
        if(!topics.includes(newTopic)){
            topics.push(newTopic);
            //add new data item to array of topic objetcs
            addItemTopicsData(newTopic);
            showButtons();
        }
    }

    function initialize(){

        topics.forEach(item => {
            //add new data item to array of topic objetcs
            addItemTopicsData(item);
        });

        showButtons();
    }

    function openFavorites(){
        $("#controls").css("display","none");
        $("#buttons").css("display","none");
        $("#button-more").css("display","none");
        favoritesOpened = true;
        showStickers(favorites);
    }

    function openStickers(){
        $("#controls").css("display","block");
        $("#buttons").css("display","block");
        stickers.empty();
    }

    initialize();

    
    $("#button-add").click(addButton);
    $("#button-more").click(showMoreStickers);
    $("#link-stickers").click(openStickers);
    $("#link-favorites").click(openFavorites);

    $("#word").keypress(event => {
        if(event.key == "Enter"){
            addButton();
        }
    });
});
