const Leave = require("./models/Leave");
const Attendance = require("./models/Attendance");

const autoLeaveManager = async (req, res, next) => {
    res.on('finish', async () => {
        // Log basic request info
        console.log(`\n--- [AutoLeave Debug Start] ---`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Session UserId: ${req.session?.userId}`);

        if ((res.statusCode === 200 || res.statusCode === 201) && req.session?.userId) {
            
            setTimeout(async () => {
                try {
                    const userId = req.session.userId;
                    const now = new Date();
                    
                    // Boundaries for "Today"
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

                    console.log(`1. Looking for Attendance: User ${userId} between ${startOfToday.toISOString()} and ${endOfToday.toISOString()}`);

                    // 1. Find Attendance
                    const attendance = await Attendance.findOne({
                        userId: userId,
                        date: { $gte: startOfToday, $lte: endOfToday },
                        status: "Present"
                    });

                    if (!attendance) {
                        console.log(`   [!] FAILED: No 'Present' Attendance found in DB for today. Check your Attendance status spelling (Present vs present).`);
                        return;
                    }
                    console.log(`   [+] SUCCESS: Found Attendance record: ${attendance._id}`);

                    // 2. Find Leave
                    console.log(`2. Looking for Leave overlapping today...`);
                    const conflictLeave = await Leave.findOne({
                        userId: userId,
                        fromDate: { $lte: endOfToday },
                        toDate: { $gte: startOfToday }
                    });

                    if (!conflictLeave) {
                        console.log(`   [!] FAILED: No Leave record covers today's date in DB for this user.`);
                        return;
                    }
                    console.log(`   [+] SUCCESS: Found Conflict Leave: ${conflictLeave._id} (${conflictLeave.fromDate} to ${conflictLeave.toDate})`);

                    // 3. Date Matching Logic
                    const attDate = new Date(attendance.date);
                    attDate.setHours(0,0,0,0);
                    const leaveFrom = new Date(conflictLeave.fromDate);
                    leaveFrom.setHours(0,0,0,0);
                    const leaveTo = new Date(conflictLeave.toDate);
                    leaveTo.setHours(0,0,0,0);

                    console.log(`3. Comparing Timestamps:`);
                    console.log(`   Attendance Day: ${attDate.getTime()}`);
                    console.log(`   Leave From:     ${leaveFrom.getTime()}`);
                    console.log(`   Leave To:       ${leaveTo.getTime()}`);

                    const todayTime = attDate.getTime();
                    const dayMs = 86400000;

                    if (leaveFrom.getTime() === todayTime && leaveTo.getTime() === todayTime) {
                        console.log(`   [Action] Case: Single Day. Deleting...`);
                        await Leave.findByIdAndDelete(conflictLeave._id);
                    } 
                    else if (leaveFrom.getTime() === todayTime) {
                        console.log(`   [Action] Case: Start of Range. Moving fromDate to tomorrow...`);
                        conflictLeave.fromDate = new Date(todayTime + dayMs);
                        await conflictLeave.save();
                    } 
                    else if (leaveTo.getTime() === todayTime) {
                        console.log(`   [Action] Case: End of Range. Moving toDate to yesterday...`);
                        conflictLeave.toDate = new Date(todayTime - dayMs);
                        await conflictLeave.save();
                    } 
                    else {
                        console.log(`   [Action] Case: Middle of Range. Splitting...`);
                        const afterLeave = new Leave({
                            userId: conflictLeave.userId,
                            type: conflictLeave.type,
                            fromDate: new Date(todayTime + dayMs),
                            toDate: conflictLeave.toDate,
                            status: conflictLeave.status,
                            reason: conflictLeave.reason
                        });
                        await afterLeave.save();
                        conflictLeave.toDate = new Date(todayTime - dayMs);
                        await conflictLeave.save();
                    }
                    console.log(`--- [AutoLeave Debug Finished Successfully] ---\n`);

                } catch (err) {
                    console.error(`[!!!] DB ERROR:`, err);
                }
            }, 1000);
        } else {
            console.log(`[!] Logic Skipped: Status code was ${res.statusCode} or UserId missing.`);
        }
    });
    next();
};

module.exports = autoLeaveManager;