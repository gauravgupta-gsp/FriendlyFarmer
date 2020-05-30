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
  var finalData = {};


  $('#tBodyItemList').find('tr').each(function(){
      //if($(this).find('td').eq(6).find('#deviceCode').length ==1)
      // alert($(this).children('td').attr('id'));
      // alert($(this).attr("id"))
// alert($(this).children().find("input").eq(0).val())
// alert($(this).children().find("input").eq(1).attr("id"))
// alert($(this).children().find("input").eq(1).val())



if($(this).children().find("input").eq(0).val() !== "0"){
  itemArray.push(
    {
      "Id":$(this).attr("id") ,
      "price": $(this).children().find("input").eq(0).val(),
      "minQty": $(this).children().find("input").eq(1).val()
    }
  );
}


$("#data").val(JSON.stringify(itemArray));

finalData = {"data":itemArray};

// $("#tBodyItemList").children().find("input").val()
  });
// alert(itemArray[0].price);
// alert(itemArray[1].price);

// alert(JSON.stringify(finalData));
//
//
// var url = "/saveFarmerItemList";
// $.ajax({
//                 url: url,
//                 type: 'POST',
//                 data: JSON.stringify(finalData),
//                 dataType: 'json',
//                 success: function(response){
//                     // selecting values from response Object
//
//                 }
//             });
  return true;
}
