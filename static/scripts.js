function highlight_word() {
	var search_word = document.getElementById("results-table").getAttribute("term");
	$(".word").each(function(index) {
		if(this.innerHTML.replace(/[^a-zA-Z0-9]/g,"").toLowerCase() === search_word) {
			
			this.style.backgroundColor="lightgray";
		}
		else {
			this.style.backgroundColor="transparent";
		}
	});
}

function on_new_page() {
	$(".word").click(function(){
		$.post("/ulysses/search?word=" + $(this).text(), function(data, status){
			document.getElementById("search-results").innerHTML = data;
			$(".result").click(function(){
				$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
					document.getElementById("page").innerHTML = data;
					on_new_page();
				});
			});
			on_new_search();
			highlight_word();
		});
	});
	$(".next").click(function(){
		$.post("/ulysses/page?page_number={{page_number + 1}}", function(data, status){
			document.getElementById("page").innerHTML = data;
			on_new_page();
			on_new_search();
			highlight_word();
		})
	});
	$(".last").click(function(){
		$.post("/ulysses/page?page_number={{page_number - 1}}", function(data, status){
			document.getElementById("page").innerHTML = data;
			on_new_page();
			on_new_search();
			highlight_word();
		})
	});
}

function on_new_search() {
	$(".result").click(function(){
		$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
			document.getElementById("page").innerHTML = data;
			on_new_page();
			highlight_word();
		});
	});
	$("#search-btn").click(function(){
		$.post("/ulysses/search?word=" + $("#search-box").val(), function(data, status){
			document.getElementById("search-results").innerHTML = data;
			$(".result").click(function(){
				$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
					document.getElementById("page").innerHTML = data;
					on_new_page();
				});
			});
			on_new_search();
			highlight_word();
		});
	});
	$("#search-box").keyup(function(){
		if(event.which === 13 && $("#search-box").val() !== "") {
			$("#search-btn").click();
		}
	});
}

on_new_page();
on_new_search();
