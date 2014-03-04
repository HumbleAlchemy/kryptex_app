
$(document).ready(function(){
  $("#hide").click(function(){
    $("#panal").hide(500);
    $("#show").show(500);
    $("#hide").hide(500);
  
  });

  $("#show").click(function(){
    $("#show").hide(500);
	$("#panal").show(500);
	$("#hide").show(500);
  });
});
