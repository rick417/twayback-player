 function makeTable() {
 	let table = document.getElementById('dataContent');
 	allData.forEach((elem, i) => {
 		console.log(i)
 		if (elem.file !== "wordCloud") {
 			table.innerHTML += `<tr onclick="changeIframe('${elem.path}','row_${i}', '${i}')">
		<td class="text-center">
            <div class="form-check d-inline-block">
            	<input class="form-check-input" type="checkbox" value="" id="row_${i}" name="row_${i}">
            	<label class="form-check-label" for="row_${i}"></label>
            </div>
        </td>
		<td><span><a href="#">${elem.file}</a></span></td>
		<td><span>${elem.href.length} link(s)</span></td>
		<td><span>@${elem.user.screenname} ${elem.user.username}</span></td>
		<td><span>${dayjs(elem.date).format('YYYY-MM-DD HH:mm:ss')}</span></td>
	</tr>`
 		}
 	})
 }

 function reset() {
 	document.getElementById('dataContent').innerHTML = "";
 	document.getElementById('search').value = "";
 	makeTable();
 	makeWordCloud(allData[0].wordArray, "global");
 }

 function preSearch(e) {
 	let str = document.getElementById('search').value
 	if (e.code === "Enter" && str.length > 3) {
 		search()
 	}
 }

 function search() {
 	let searchString = document.getElementById('search').value;
 	let table = document.getElementById('dataContent');
 	table.innerHTML = "";
 	document.getElementById('search').value = "";
 	allData.forEach((elem, i) => {
 		if (elem.file !== "wordCloud") {
 			if (searchString.length > 3 && elem.text.includes(searchString.toLowerCase()) === true) {
 				table.innerHTML += `<tr onclick="changeIframe('${elem.path}','row_${i}')">
		<td class="text-center">
            <div class="form-check d-inline-block">
            	<input class="form-check-input" type="checkbox" value="" id="row_${i}" name="row_${i}">
            	<label class="form-check-label" for="row_${i}"></label>
            </div>
        </td>
		<td><span><a href="#">${elem.file}</a></span></td>
		<td><span>${elem.href.length} link(s)</span></td>
		<td><span>@${elem.user.screenname} ${elem.user.username}</span></td>
		<td><span>${dayjs(elem.date).format('YYYY-MM-DD HH:mm:ss')}</span></td>
	</tr>`
 			}
 		}
 	});
 }

 function changeIframe(src, elem, i) {
 	console.log('iframe loading. elem : ' + elem)
 	document.getElementById('iframe').src = src;
 	document.getElementById(elem).checked = true;
 	makeWordCloud(allData[i].wordCloudArray, allData[i].file);
 }

 function start() {
 	document.getElementById('tableTitle').innerHTML = allData[0].target;
 	document.getElementById('filesNumber').innerHTML = allData[0].files + " html files";
 	makeTable()
 	setTimeout(() => {
 		changeIframe(allData[1].path, "row_1", "1")
 	}, 500)
 }


 function makeWordCloud(wordArray, title) {
 	document.getElementById('wordCloudTitle').innerText = title;
 	WordCloud(document.getElementById('canvas'), {
 		list: wordArray,
 		gridSize: 10,
 		weightFactor: 10,
 		fontFamily: 'Average, Times, serif'
 	});
 }

 document.getElementById('search').addEventListener('keypress', preSearch);

 document.getElementById('stopEvt').addEventListener('click', (event) => {
 	event.preventDefault();
 	event.stopPropagation();
 	return false;
 })

makeWordCloud(allData[0].wordArray, "global");