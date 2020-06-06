function validateRegister() {
  let redirect = true;
  const password = $("#password").val();
  const repeatPassword = $("#repeatPassword").val();

  if (password !== repeatPassword) {
    redirect = false;

  }
  console.log("returned " + redirect);

  return true;
}

function nospaces(t){
  if(t.value.match(/\s/g)){
    t.value=t.value.replace(/\s/g,'');
  }
}

function validateOrder() {
  var itemArray = [];
  $('#tBodyItemList').find('tr').each(function() {
    if ($(this).children().find("input").eq(3).val() !== "0") {
      itemArray.push({
        "id": $(this).attr("id"),
        "itemName": $(this).children().find("input").eq(0).val(),
        "price": $(this).children().find("input").eq(1).val(),
        "purchaseQty": $(this).children().find("input").eq(3).val()
      });
    }


    $("#data").val(JSON.stringify(itemArray));
  });
  return true;
}

function validateItem() {
  // alert("called" + $("#tBodyItemList").children());
  var itemArray = [];
  var finalData = {};


  $('#tBodyItemList').find('tr').each(function() {
      if ($(this).children().find("input").eq(1).val() !== "0") {
        itemArray.push({
          "id": $(this).attr("id"),
          "itemName": $(this).children().find("input").eq(0).val(),
          "price": $(this).children().find("input").eq(1).val(),
          "minQty": $(this).children().find("input").eq(2).val()
      });
    }


    $("#data").val(JSON.stringify(itemArray));

    finalData = {
      "data": itemArray
    };
  });

  return true;
}
