$(document).ready(function(){
    
    var buttons = $("#buttons");
    var stickers = $("#stickers");
    var topics = ["smile","scary","yelling","scream","laugh","happy","sarcastic","sad"];


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
        stickers.empty();
        searchSticker($(this).attr("value"));
    }
    
    //place the stickers from the search into the sticker section
    function showStickers(data){
        data.forEach(item =>{
            var img = $("<img>");
            var figure = $("<figure>");
            var figCaption = $("<figcaption>").text("Rating: "+item.rating);

            img.attr("src",item.images.original_still.url);
            img.attr("src-animated",item.images.fixed_width.url);
            img.attr("src-original",item.images.original_still.url);
            img.click(toggleSticker);
            img.addClass("sticker");

            figure.append(img);
            figure.append(figCaption);
            stickers.append(figure);
            
        });
    }

    function searchSticker(topic){
        var apiKey = "2Le1nOR1c6chdiUugysImelMGr88olDp";
        var limit = 10;
        var queryURL = "https://api.giphy.com/v1/stickers/search?api_key="+apiKey+"&q="+topic+"&limit="+limit;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(response => {
            showStickers(response.data);
        });
    }

    function createTopicButtons(){
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
            createTopicButtons();
        }
    }

    createTopicButtons();

    
    $("#button-add").click(addButton);
    $("#word").keypress(event => {
        if(event.key == "Enter"){
            addButton();
        }
    });
});
