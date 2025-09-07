# كيفية الحصول على الـ Token

## الطريقة الأولى: استخدام test-token.html

1. **افتح `test-token.html` في المتصفح**
2. **افتح Developer Tools (F12)**
3. **اذهب إلى Application/Storage tab**
4. **ابحث عن localStorage**
5. **ابحث عن مفتاح `user`**
6. **انسخ الـ token من البيانات**

## الطريقة الثانية: من Console

1. **افتح الصفحة في المتصفح**
2. **افتح Developer Tools (F12)**
3. **اذهب إلى Console tab**
4. **اكتب:**
   ```javascript
   console.log(localStorage.getItem('user'));
   ```
5. **انسخ الـ token من النتيجة**

## الطريقة الثالثة: من Application Tab

1. **افتح Developer Tools (F12)**
2. **اذهب إلى Application tab**
3. **في الجانب الأيسر، اذهب إلى Storage > Local Storage**
4. **اختر موقع التطبيق**
5. **ابحث عن مفتاح `user`**
6. **انسخ القيمة وابحث عن `token`**

## بعد الحصول على الـ Token

### اختبار الـ Token:
```bash
node test-with-token.js YOUR_ACTUAL_TOKEN_HERE
```

### مثال:
```bash
node test-with-token.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## إذا لم تجد الـ Token

### 1. تأكد من تسجيل الدخول:
- سجل دخول كـ Admin
- تأكد من أن الـ token محفوظ في localStorage

### 2. تحقق من اسم المفتاح:
- قد يكون `authToken` بدلاً من `user`
- قد يكون `accessToken` أو `jwt`

### 3. ابحث في جميع المفاتيح:
```javascript
// في Console
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(key, value);
}
```

## بعد الحصول على الـ Token الصحيح

ستتمكن من:
- ✅ اختبار APIs
- ✅ عرض بيانات المدفوعات
- ✅ مراجعة المدفوعات
- ✅ إدارة الاشتراكات

## ملاحظة مهمة

**الـ Token قد ينتهي صلاحيته** - إذا لم يعمل، جرب:
1. تسجيل دخول جديد
2. الحصول على token جديد
3. اختبار الـ token الجديد
