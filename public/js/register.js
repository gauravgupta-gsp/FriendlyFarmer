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

function calculate() {

  let total =0;
  $('#tBodyItemList').find('tr').each(function() {
    if ($(this).children().find("input").eq(3).val() !== "0") {

      let itemPrice = $(this).children().find("input").eq(1).val();
      let itemQuantity = $(this).children().find("input").eq(3).val();

      total += (itemPrice * itemQuantity);
      console.log(total);
    }
  });
  $("#orderTotal").val(total);

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

function changePassword(){

  const password = $("#inputPasswordNew").val();
  const verifyPassword = $("#inputPasswordNewVerify").val();
  if(password === verifyPassword) {
    return true;
  }

  return false;
}

// $("input[type=password]").keyup(function(){
//   console.log("came tinto");
//     var ucase = new RegExp("[A-Z]+");
// 	var lcase = new RegExp("[a-z]+");
// 	var num = new RegExp("[0-9]+");
//
// 	if($("#password1").val().length >= 8){
// 		$("#8char").removeClass("glyphicon-remove");
// 		$("#8char").addClass("glyphicon-ok");
// 		$("#8char").css("color","#00A41E");
// 	}else{
// 		$("#8char").removeClass("glyphicon-ok");
// 		$("#8char").addClass("glyphicon-remove");
// 		$("#8char").css("color","#FF0004");
// 	}
//
// 	if(ucase.test($("#password1").val())){
// 		$("#ucase").removeClass("glyphicon-remove");
// 		$("#ucase").addClass("glyphicon-ok");
// 		$("#ucase").css("color","#00A41E");
// 	}else{
// 		$("#ucase").removeClass("glyphicon-ok");
// 		$("#ucase").addClass("glyphicon-remove");
// 		$("#ucase").css("color","#FF0004");
// 	}
//
// 	if(lcase.test($("#password1").val())){
// 		$("#lcase").removeClass("glyphicon-remove");
// 		$("#lcase").addClass("glyphicon-ok");
// 		$("#lcase").css("color","#00A41E");
// 	}else{
// 		$("#lcase").removeClass("glyphicon-ok");
// 		$("#lcase").addClass("glyphicon-remove");
// 		$("#lcase").css("color","#FF0004");
// 	}
//
// 	if(num.test($("#password1").val())){
// 		$("#num").removeClass("glyphicon-remove");
// 		$("#num").addClass("glyphicon-ok");
// 		$("#num").css("color","#00A41E");
// 	}else{
// 		$("#num").removeClass("glyphicon-ok");
// 		$("#num").addClass("glyphicon-remove");
// 		$("#num").css("color","#FF0004");
// 	}
//
// 	if($("#password1").val() == $("#password2").val()){
// 		$("#pwmatch").removeClass("glyphicon-remove");
// 		$("#pwmatch").addClass("glyphicon-ok");
// 		$("#pwmatch").css("color","#00A41E");
// 	}else{
// 		$("#pwmatch").removeClass("glyphicon-ok");
// 		$("#pwmatch").addClass("glyphicon-remove");
// 		$("#pwmatch").css("color","#FF0004");
// 	}
// });
