console.clear();

const logCounter = document.querySelector('#title_sub_count');
const logList = document.querySelector('#log_list');
const logs = JSON.parse(localStorage.getItem('logs')) || null;
const lastUpdate = localStorage.getItem('last-update');

if (!logs || Date.now() - lastUpdate > 86400000) {
	fetch_files();
} else {
	display_logs();
}

async function fetch_files() {
	const res = await fetch('/reebs-memories/assets/json/index.json');
	const files = await res.json();
	let fetchedLogs = [];
	for (const file of files) {
		const data = await fetch(`/reebs-memories/assets/json/${file}`).then((r) => r.json());
		fetchedLogs.push(data);
	}
	logCounter.textContent = fetchedLogs.length;

	fetchedLogs.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
	const lastUpdate = Date.now();
	localStorage.setItem('last-update', lastUpdate);
	localStorage.setItem('logs', JSON.stringify(fetchedLogs));

	display_logs();
}

function display_logs() {
	logCounter.textContent = logs.length;
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
		if (line.content === '[lb]') {
			newLine = document.createElement('br');
		} else {
			newLine = document.createElement('p');
			newLine.textContent = (line.from ? line.from + ': ' : '') + line.content;
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
	logList.appendChild(container);

	container.addEventListener('click', () => {
		container.classList.toggle('d');
	});
}
