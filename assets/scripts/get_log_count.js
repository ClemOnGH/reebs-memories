const clearLogs = document.querySelector('#clearLogs');

clearLogs.addEventListener('click', (e) => {
	localStorage.clear('last-updated');
	localStorage.clear('saved-logs');
});

let logs;
(async function init() {
	logs = get_saved_logs();
	const lastUpdated = get_last_update();
	if (!logs || Date.now() - lastUpdated > 8640000000) {
		logs = await retrieve_logs();
	}
	display_logs();
})();

function get_saved_logs() {
	try {
		const savedLogs = localStorage.getItem('saved-logs');
		return savedLogs ? JSON.parse(savedLogs) : null;
	} catch (e) {
		return null;
	}
}

function get_last_update() {
	try {
		const lastUpdated = localStorage.getItem('last-updated');
		return lastUpdated ? lastUpdated : null;
	} catch (e) {
		console.error(e);
	}
}

async function retrieve_logs() {
	// const res = await fetch('https://clemongh.github.io/reebs-memories/assets/json/index.json');
	const res = await fetch('../assets/json/index.json');
	const files = await res.json();
	let fetched_logs = [];

	for (const file of files) {
		try {
			// const data = await fetch(`https://clemongh.github.io/reebs-memories/assets/json/${file}`).then((d) => d.json());
			const data = await fetch(`../assets/json/${file}`).then((d) => d.json());
			fetched_logs.push(data);
		} catch (e) {
			console.error(e);
		}
	}

	fetched_logs.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
	localStorage.setItem('saved-logs', JSON.stringify(fetched_logs));
	localStorage.setItem('last-updated', Date.now());
	return fetched_logs;
}

function display_logs() {
	document.querySelector('#title_sub_count').textContent = logs.length;
	document.querySelector('#error_no_logs_found').remove();
	logs.forEach((log) => create_new_entry(log));
}

function create_new_entry(entry) {
	const container = document.createElement('div');
	const metadataDiv = document.createElement('div');
	const titleP = document.createElement('p');
	const dateP = document.createElement('p');
	const contentDiv = document.createElement('div');
	const accordionContentDiv = document.createElement('div');

	entry.conversation.forEach((line) => {
		let newLine;
		if (line.type === 'line-break') {
			newLine = document.createElement('br');
		} else if (line.type === 'image') {
			newLine = document.createElement('img');
			img.src = line.src;
			img.classList.add('log-embedded-image');
		} else {
			newLine = document.createElement('p');
			newLine.innerHTML = (line.from ? line.from + ': ' : '') + line.content;
		}
		accordionContentDiv.appendChild(newLine);
	});

	contentDiv.appendChild(accordionContentDiv);

	container.classList.add('log-entry');
	metadataDiv.classList.add('log-metadata');
	titleP.classList.add('log-entry-title');
	dateP.classList.add('log-entry-recovery-date');
	contentDiv.classList.add('log-entry-content');

	titleP.textContent = entry.metadata.title;
	dateP.textContent = 'Recorded on ' + new Date(entry.metadata.createdAt).toLocaleDateString('en-us', { day: '2-digit', month: 'long', year: 'numeric' });

	metadataDiv.appendChild(titleP);
	metadataDiv.appendChild(dateP);
	container.appendChild(metadataDiv);
	container.appendChild(contentDiv);
	document.querySelector('#log_list').appendChild(container);

	container.addEventListener('click', () => {
		container.classList.toggle('d');
	});
}
