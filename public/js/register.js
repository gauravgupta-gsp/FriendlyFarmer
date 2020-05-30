function validateRegister() {
    let redirect = true;
    const password = $("#password").val();
    const repeatPassword = $("#repeatPassword").val();

    if( password !== repeatPassword) {
        redirect = false;

    }
    console.log("returned " + redirect);

    return true;
}


function validateItem() {
  // alert("called" + $("#tBodyItemList").children());
  var itemArray = [];


  $('#tBodyItemList').find('tr').each(function(){
      //if($(this).find('td').eq(6).find('#deviceCode').length ==1)
      // alert($(this).children('td').attr('id'));
      // alert($(this).attr("id"))
// alert($(this).children().find("input").eq(0).val())
// alert($(this).children().find("input").eq(1).attr("id"))
// alert($(this).children().find("input").eq(1).val())


itemArray.push(
        {
            "Id":$(this).attr("id") ,
            "price": $(this).children().find("input").eq(0).val(),
            "minQty": $(this).children().find("input").eq(1).val()
        }
);



// $("#tBodyItemList").children().find("input").val()
  });
// alert(itemArray[0].price);
// alert(itemArray[1].price);

alert(JSON.stringify(itemArray));


var url = "/saveFarmerList";

$.ajax({
  type: "POST",
  url: url,
  data: JSON.stringify(itemArray),
  contentType: "application/json; charset=utf-8",
  dataType: "json",
  error: function() {
    alert("Error");
  },
  success: function() {
    alert("OK");
  }
});
  return false;
}
