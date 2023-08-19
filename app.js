const express = require('express');
const app = express();
const path = require('path');
const hours = require('./models/hours')

const mongoose = require('mongoose');
// const hours= require('./models/hours')
mongoose.connect('mongodb://localhost:27017/workHours')
    .then(() => {
        console.log('WORK-HOURS MONGO CONNECTION OPEN!');
    })
    .catch(err => {
        console.log('WE HAVE AN ERROR: ')
        console.log(err)
    });


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
//pars the "body":
app.use(express.urlencoded({ extended: true }));

let year = 0;
function updateYear(yearUpdate) {
    year = yearUpdate;
    
}

let month = "";
function updateMontName(monthUpdate) {
    month = monthUpdate;
    
}

let workNum = 0;
function updateWorkDaysNum(updateNum) {
    workNum = updateNum;
    

}

app.get('/', (req, res) => {
    res.render('home');

})

app.get('/archive', async (req, res) => {
    const paychecks = await hours.find({});
    res.render('archive/index.ejs',{paychecks});
})

app.get('/archive/:id', async (req, res) => {
    res.render('archive/archive.ejs');
})

app.post('/calendar', async (req, res) => {

    const date = new Date();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const year = parseInt(req.body.year);
    updateYear(year);
    const monthName = months[req.body.month - 1];
    updateMontName(monthName);
    const month = parseInt(req.body.month);

    const lastDay = new Date(year, month, 0).getDate();
    // the amount of days in the month.

    const dateBefore = new Date(year, month - 1, 0).getDate();
    // the amount of dayes in previous month

    const lastDayOfweek = new Date(year, month, 0).getDay();
    //the last weekday of the month (starts with 0- Sun ends with 6- Sat )

    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    //the first week-day of the month (starts with 0 ends with 6)


    let checkdays = new Date();
    checkdays.setFullYear(year);
    checkdays.setMonth(month - 1);

    let workdays = [];

    // checking the amount of workdays in the month, and putting them in an array (without fri and sat)
    for (let i = 1; i <= lastDay; i++) {
        checkdays.setDate(i);
        let checkdaysIter = checkdays.getDay()
        if ((checkdaysIter != 5) && (checkdaysIter != 6)) {
            workdays.push(i);
        }
    }
    
    // console.log("work days this month: ", workdays.length);
    updateWorkDaysNum(workdays.length);
    res.render('calendar', { monthName, year, lastDay, firstDayOfWeek, dateBefore, lastDayOfweek, workdays });
})


//when you press submit hours:
app.post('/hours', async (req, res) => {
    //await hours.deleteMany({});
    const curHours = new hours();
    curHours.salary = req.body.salary;
    curHours.base = req.body.base;
    curHours.month = String(req.body.monthName) ;
    curHours.year = String(req.body.yearName);
    curHours.start = req.body.hours.start;
    curHours.finish = req.body.hours.finish;
    curHours.absence = req.body.hours.absence;
    curHours.lunch = req.body.hours.lunch;
    curHours.workdays = workNum;

    
    let workdays= req.body.workdays;
    console.log("********************");
    console.log("workdays: ", workdays);


    let hourSum = [];
    let overTime125 = 0;
    let overTime150 = 0;


    //add the time to the array as an int.
    for (let i = 0; i < curHours.start.length; i++) {
        const startTime = curHours.start[i].split(':')
        const endTime = curHours.finish[i].split(':');

        const startHour = parseFloat(startTime[0], 10);
        const startMinute = parseFloat(startTime[1], 10);
        const endHour = parseFloat(endTime[0], 10);
        const endMinute = parseFloat(endTime[1], 10);

        let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        timePerDay = (totalMinutes / 60).toFixed(2);
        hourSum[i] = parseFloat(timePerDay);
        //console.log('hour sum is: ', hourSum);
        //check overtime 
        if (timePerDay > 8) {
            //console.log("the total time per day is: ", timePerDay);
            timePerDay -= 8;
            if (timePerDay > 1) {
                //console.log('there is one full hour in 125%');
                overTime125++;
                timePerDay -= 1;
                //console.log("and the 150% is", timePerDay);
                overTime150 += timePerDay;
            } else {
                //console.log('the over time is in the 125%, it is: ', timePerDay);
                overTime125 += timePerDay;
            }


        }


    }
    console.log("work days this month: ", workdays.length);
    console.log("month: ", curHours.monthName);
    console.log(typeof curHours.monthName);
    console.log(typeof curHours.yearName);
    console.log("youre 125% is: ", overTime125);
    console.log("youre 150% is: ", overTime150);
    console.log("your hoursum is: ", hourSum);
    console.log("lunch is: ", curHours.lunch);
    // console.log("lunch amount is", curHours.lunch.length )
    

    let totalhours = 0;
    for (let i = 0; i < hourSum.length; i++) {
        totalhours= totalhours + hourSum[i];

    }

    console.log("you have worked ",totalhours," hours");
    //   console.log("the month is: ",curMonthName);
    //   console.log('current hours: ',currHours);
    await curHours.save();
    //res.render('salary', { overTime125, overTime150, hourSum, totalhours, curHours });
    res.send(req.body);


});

app.listen(3000, () => {
    console.log('listning on port 3000');
})


