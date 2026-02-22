import { searchBookings, getProductAvailability } from './server/roller.ts';

// Get today's bookings to find the 2x30min booking
const todayPST = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
console.log('Today PST:', todayPST);

const bookings = await searchBookings({ dateFrom: todayPST });
console.log(`\nFound ${bookings.length} bookings for today\n`);

for (const b of bookings) {
  console.log('=== Booking ===');
  console.log('  Name:', b.name);
  console.log('  Ref:', b.bookingReference);
  console.log('  Items:');
  for (const item of (b.items || [])) {
    console.log('    - productId:', item.productId);
    console.log('      productName:', item.productName);
    console.log('      quantity:', item.quantity);
    console.log('      startTime:', item.startTime);
    console.log('      bookingDate:', item.bookingDate);
    console.log('      totalPrice:', item.totalPrice);
    console.log('      All keys:', Object.keys(item).join(', '));
  }
  console.log('');
}

// Also check availability to see session endTimes
console.log('\n=== Availability for today ===');
const products = await getProductAvailability(todayPST);
for (const p of products) {
  const pname = p.parentProductName || p.name;
  console.log(`\nProduct: ${pname} (id: ${p.id || p.parentProductId})`);
  for (const session of (p.sessions || []).slice(0, 3)) {
    console.log(`  Session: ${session.startTime} - ${session.endTime} (capacity: ${session.capacityRemaining}/${session.capacity})`);
  }
}
