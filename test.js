
const Rancher = require('./lib/lib');

const client = new Rancher({
    url: 'https://rancher.handsurf.mx/v1/projects/1a1484/',
    access_key: '96A5FAB3A1BA7B668FC4',
    secret_key: 'Es9doCdosyNQSuvnAePNB7qzR5gruFqdbeFD2Zjj'
});

client.getHosts('1h30').then((hosts) => {
    console.log(hosts);
}).catch((err) => {
    console.error(' ERROR : ', err)
});