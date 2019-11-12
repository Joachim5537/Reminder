const config = {
    target:     'start-date-mtr-datepicker',
    // timestamp:  new Date,
    disableAmPm: true,
    future:     true,
    months: {
      min: 0,
      max: 11,
      step: 1
    },
    minutes: {
      min: 0,
      max: 59,
      step: 1
    },
    years: {
      min: 2017,
      max: 2038,
      step: 1
    }
  };

const domElements = {
  saveReminder: document.getElementById('saveReminder'),
  reminderText: document.getElementById('reminder-text'),
  showReminders: document.getElementById('showReminders'),
  showClock: document.getElementById('showClock'),
  isClock: document.getElementById('isClock'),
  isList: document.getElementById('isList'),
  reminderHolder: document.getElementById('reminderHolder'),
	reminderPlaceholder: document.getElementById('reminderPlaceholder'),
	success: document.getElementById('success')
}
const myDatepicker = new MtrDatepicker(config);

domElements.saveReminder.addEventListener('click', ()=>{

    const when = myDatepicker.getTimestamp()
    const sending = browser.runtime.sendMessage({
        action: "create",
        reminder: domElements.reminderText.value,
        id: 'queIt_'+when,
        when
    });
    domElements.reminderText.value = '';
		domElements.success.className = 'showMe'
		setTimeout(()=>{domElements.success.className = ''},1000)
})
domElements.showReminders.addEventListener('click', ()=>{
  domElements.isClock.className = 'hide'
  domElements.isList.className = ''
  setList()
})

domElements.showClock.addEventListener('click', ()=>{
  domElements.isClock.className = ''
  domElements.isList.className = 'hide'
})

const setList = () => {
  while (domElements.reminderHolder.firstChild) {
    domElements.reminderHolder.removeChild(domElements.reminderHolder.firstChild);
  }
  const gettingItem = browser.storage.local.get('tslReminders'); 
  gettingItem.then((res) => setReminderList(res))
}
const setReminderList = response => {
  const tslReminders = response.tslReminders
  if(!tslReminders)
    return false

  if(Object.keys(tslReminders).length === 0 && tslReminders.constructor === Object) {
    domElements.reminderPlaceholder.className = ''
  }else{
    domElements.reminderPlaceholder.className = 'hide'
    for(let item in  tslReminders) {
      const localTime = parseInt(item.split('_')[1])
      var date = new Date(localTime);
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var day = ("0" + date.getDate()).slice(-2);
      var hour = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var display_time = year+'-'+month+'-'+day+' '+hour+':'+minutes;
      const reminder = document.createElement('div')
      const reminderArrow = document.createElement('span')
      const reminderText = document.createElement('span')
      const reminderDelete = document.createElement('a')
      reminder.className = 'reminder'
      reminder.setAttribute('title', new Date(localTime))
      reminderArrow.textContent = '»'
      reminderText.textContent = tslReminders[item] + ' (' + display_time +')';
      reminderDelete.textContent = '✖'
      reminderDelete.addEventListener('click',() => removeReminder(item,reminder, tslReminders))
      reminder.appendChild(reminderArrow)
      reminder.appendChild(reminderText)
      reminder.appendChild(reminderDelete)
      domElements.reminderHolder.appendChild(reminder)
    }
  }
}

const getMostCloseReminder = () =>{

  while (domElements.reminderHolder.firstChild) {
    domElements.reminderHolder.removeChild(domElements.reminderHolder.firstChild);
}

    /// call your function here
  
  window.setInterval(function(){
  
      const gettingItem = browser.storage.local.get('tslReminders'); 
    
      gettingItem.then((res) => {
        var now = Date.parse(new Date);
        var close_time = ''

        for(let item in res['tslReminders']){
          var list_time = parseInt(item.split('_')[1]);
          var name = '';
          
          if(close_time == ''){
            close_time = new Date(list_time);
            var hour = close_time.getHours();
            name = res['tslReminders'][item];
          }else{

            if( (list_time - now) < close_time) {
              close_time = list_time;
              name = res['tslReminders'][item];
            }

          }
              var date = new Date(close_time);
              var year = date.getFullYear();
              var month = ("0" + (date.getMonth() + 1)).slice(-2);
              var day = ("0" + date.getDate()).slice(-2);
              var hour = date.getHours();
              var minutes = date.getMinutes();
              var seconds = date.getSeconds();

              var display_time = year+'-'+month+'-'+day+' '+hour+':'+minutes;
              // alert(hour)
          document.getElementById("mostCloseReminderTime").innerHTML = "Closest Reminder :"+name+"<br> Time :"+(display_time);
        
        }

      })
    }, 1000);
}

window.onload = getMostCloseReminder();

const removeReminder = (item, reminder, tslReminders) => {
  domElements.reminderHolder.removeChild(reminder)
  delete tslReminders[item]
  if(Object.keys(tslReminders).length === 0 && tslReminders.constructor === Object)
    domElements.reminderPlaceholder.className = ''
  browser.storage.local.set({ tslReminders })
  const sending = browser.runtime.sendMessage({
    action: "delete",
    id: item
  });
}