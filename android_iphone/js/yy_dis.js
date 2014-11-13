/**
 * @author Administrator
 */
function setHtmlForSearch(id, html) {
	if ("string" == typeof(id)) {
		var ele = $$(id);
		if (ele != null) {
			ele.innerHTML = html == null ? "" : html;
		}
	} else if (id != null) {
		id.innerHTML = html == null ? "" : html;
	}
}