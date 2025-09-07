# 🔍 Booking Debug Guide - حل مشكلة Booking Failed

## تشخيص مشكلة "Booking Failed"

### 🚨 المشكلة:
عند الضغط على "Confirm Booking" تظهر رسالة "Booking Failed - Please try again"

### 🔍 خطوات التشخيص:

#### **1. تحقق من Console في المتصفح:**

افتح Developer Tools (F12) وانتقل إلى Console، ثم ابحث عن هذه الرسائل:

```
📋 Creating booking: {tripId: X, stopId: Y}
📤 Sending booking data to /api/TripBooking: {tripId: X, studentId: 1, pickupStopLocationId: Y}
🔍 tripAPI.createBooking called with: {tripId: X, studentId: 1, pickupStopLocationId: Y}
```

#### **2. تحقق من استجابة API:**

ابحث عن هذه الرسائل في Console:

```
✅ tripAPI.createBooking result: {success: true, ...}
```
أو
```
❌ tripAPI.createBooking error: [تفاصيل الخطأ]
```

#### **3. الأخطاء المحتملة:**

##### **أ) خطأ في البيانات:**
```javascript
// تحقق من أن البيانات صحيحة:
{
  tripId: number,           // يجب أن يكون رقم صحيح
  studentId: number,        // يجب أن يكون رقم صحيح  
  pickupStopLocationId: number // يجب أن يكون رقم صحيح
}
```

##### **ب) خطأ في المصادقة:**
```javascript
// تحقق من وجود Token في localStorage:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User token:', user?.token);
```

##### **ج) خطأ في الخادم:**
```javascript
// تحقق من حالة الخادم:
// يجب أن يكون الخادم يعمل على http://localhost:7126
```

### 🛠️ الحلول المقترحة:

#### **1. تحقق من البيانات:**
```javascript
// في Console، نفذ هذا الكود:
console.log('Selected trip:', selectedTrip);
console.log('Selected stop ID:', selectedStopId);
console.log('Booking data:', {
  tripId: selectedTrip?.id,
  studentId: 1,
  pickupStopLocationId: selectedStopId
});
```

#### **2. تحقق من Token:**
```javascript
// في Console، نفذ هذا الكود:
const user = JSON.parse(localStorage.getItem('user'));
if (user?.token) {
  console.log('✅ Token found:', user.token.substring(0, 20) + '...');
} else {
  console.log('❌ No token found in localStorage');
}
```

#### **3. تحقق من الخادم:**
```javascript
// في Console، نفذ هذا الكود:
fetch('http://localhost:7126/api/Trip', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Server response:', data))
.catch(err => console.error('Server error:', err));
```

### 🔧 إصلاحات سريعة:

#### **1. إعادة تحميل الصفحة:**
- اضغط Ctrl+F5 لإعادة تحميل كامل
- تحقق من Console مرة أخرى

#### **2. تسجيل الدخول مرة أخرى:**
- اخرج من التطبيق
- سجل الدخول مرة أخرى
- جرب الحجز مرة أخرى

#### **3. تحقق من الشبكة:**
- تأكد من أن الخادم يعمل
- تحقق من اتصال الإنترنت

### 📋 قائمة التحقق:

- [ ] هل البيانات صحيحة في Console؟
- [ ] هل Token موجود في localStorage؟
- [ ] هل الخادم يعمل على localhost:7126؟
- [ ] هل تم اختيار رحلة ومحطة صعود؟
- [ ] هل هناك أخطاء في Console؟

### 🚨 إذا استمرت المشكلة:

#### **1. أرسل رسائل Console:**
انسخ جميع الرسائل من Console وأرسلها

#### **2. تحقق من Network Tab:**
- افتح Developer Tools
- انتقل إلى Network tab
- جرب الحجز مرة أخرى
- ابحث عن طلب POST إلى /api/TripBooking
- تحقق من Status Code والاستجابة

#### **3. جرب ملف الاختبار:**
```bash
node test-booking-api.js
```

### 📞 معلومات إضافية مطلوبة:

إذا استمرت المشكلة، أرسل:
1. **رسائل Console كاملة**
2. **Network requests** من Developer Tools
3. **البيانات التي تحاول إرسالها**
4. **أي رسائل خطأ إضافية**

## ✅ تم إضافة تشخيص شامل!

الآن ستحصل على رسائل خطأ مفصلة تساعد في تحديد المشكلة بدقة.
