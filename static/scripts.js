function highlight_word() {
	var search_word = document.getElementById("results-table").getAttribute("term");
	console.log(search_word);
	$(".word").each(function(index) {
		if(this.innerHTML.replace(/[^a-zA-Z0-9]/g,"").toLowerCase() === search_word && search_word !== "") {
			
			this.style.backgroundColor="lightgray";
		}
		else {
			this.style.backgroundColor="transparent";
		}
	});
}

function search_callback(data, status){
	console.log("response received");
    if (data.new_index==1) {
        $("#searchrow1").html("<div class=\"col-12\"><h2><small> Showing results for: " + data.word + "</small><h5>" + data.num_results + "</h5></h2></div>");
        $("#results-table").attr("term", data.word);
        var results_table = "<div class=\" col-6 \"><table class=\" table table-fixed affix-top \"><thead><tr><th class=\" col-xs-3 chapter \">Chapter</th><th class=\" col-xs-3 line-number \">Line</th><th class=\" col-xs-6 line \"></th></tr></thead><tbody id=\"results-table-body\">";
    }
    else {
        var results_table = "";
    }
	/*
		<div class="row" id="results-table" term="{{word}}">
			<div class="col-6">
				<table class="table table-fixed affix-top">
					<thead>
					<tr>
						<th class="col-xs-3 chapter">
							Chapter
						</th>
						<th class="col-xs-3 line-number">
							Line
						</th>
						<th class="col-xs-6 line">
						</th>
					</tr>
					</thead>
					<tbody>
	*/
	data.results.forEach(function(entry) {
		results_table += "<tr><td class=\" col-xs-3 chapter \">" + entry[3] + "</td><td class=\" col-xs-3 line-number \"><a class=\" result \" page= \"" + entry[2] + " \">" + entry[0] + "</a></td><td class=\" col-xs-6 line \">" + entry[1] + "</td></tr>";
	/*
						<tr>
							<td class="col-xs-3 chapter">
								{{ entry[3] }}
							</td>
							<td class="col-xs-3 line-number">
								<a class="result" page="{{entry[2]}}"> 
									{{ entry[0] }} 
								</a>
							</td>
							<td class="col-xs-6 line">
								{{ entry[1] }}
							</td>
						</tr>
	*/
	});
    if(data.new_index == 1) {
        results_table += "</tbody></table></div>";
    }
	/*
					</tbody>
				</table>
			</div>
	*/
    if(data.new_index == 1) {
        $("#results-table").html(results_table);
    }
    else{
        $("#results-table-body").append(results_table);
    }
	//document.getElementById("search-results").innerHTML = data;
	$(".result").click(function(){
		$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
			$("#page").html(data);
			on_new_page();
			highlight_word();
		});
	});
    if(data.is_done == false && $("#results-table").attr("term") == data.word){
        $.post("/ulysses/search?word=" + data.word + "&index=" + data.new_index ,search_callback);
    }
	//on_search();
    if(data.new_index == 1){
        highlight_word();
    }
}

function on_new_page() {
	$(".word").off("click");
	$(".next").off("click");
	$(".last").off("click");
	$(".word").click(function(){
		var word = $(this).text().replace(/[^a-zA-Z0-9]/g,"");
		if(word !== ""){
			$.post("/ulysses/search?word=" + word + "&index=0", search_callback);
		}
	});
	$(".next").click(function(){
		$.post("/ulysses/page?page_number=" + (parseInt($("#page-number").attr("page")) + 1), function(data, status){
			$("#page").html(data);
			on_new_page();
			//on_search();
			highlight_word();
		});
	});
	$(".last").click(function(){
		$.post("/ulysses/page?page_number=" + (parseInt($("#page-number").attr("page")) - 1), function(data, status){
			$("#page").html(data);
			on_new_page();
			//on_search();
			highlight_word();
		});
	});
	$(".chapter-dropdown").click(function(){
		$.post("/ulysses/page?page_number="+this.getAttribute("line-number-chapter"), function(data, status){
			$("#page").html(data);
			on_new_page();
			highlight_word();
		});
	});
}

function on_search() {
	$(".result").click(function(){
		console.log("click");
		$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
			$("#page").html(data);
			on_new_page();
			highlight_word();
		});
	});
	$("#search-btn").click(function(){
		console.log("search btn clicked");
		$.post("/ulysses/search?word=" + $("#search-box").val().replace(/[^a-zA-Z0-9]/g,"") + "&index=0", search_callback);
	});
	$("#search-box").keyup(function(){
		console.log("button");
		$.post("/ulysses/page?page_number=" + this.getAttribute("page"), function(data, status){
			$("#page").html(data);
			on_new_page();
			highlight_word();
		});
	});
	$("#search-btn").click(function(){
		console.log("search btn clicked");
    })

    $("#search-box").keyup(function(){
        console.log("button");
        if(event.which === 13 && $("#search-box").val().replace(/[^a-zA-Z0-9]/g,"").toLowerCase() !== "") {
            $("#search-btn").click();
        }
    });
}

on_new_page();
on_search();
