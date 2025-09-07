# Payment Validation Update

## التحديثات المنجزة

### 1. Payment Reference Code أصبح إجباري للدفع الأونلاين

**التغييرات:**
- إزالة كلمة "(Optional)" من label
- إضافة علامة النجمة الحمراء (*) للإشارة إلى أن الحقل إجباري
- إضافة validation في الواجهة الأمامية
- إضافة validation في handleSubscribe function

### 2. Validation Rules

**للدفع الأونلاين (InstaPay):**
- ✅ Payment Reference Code **مطلوب** (required)
- ✅ يجب أن يكون طول الكود **3 أحرف على الأقل**
- ✅ يجب أن يكون طول الكود **100 حرف كحد أقصى**
- ✅ زر "Confirm Payment" يكون معطل إذا لم يتم إدخال الكود

**للدفع الأوفلاين:**
- ✅ Payment Reference Code **اختياري** (optional)
- ✅ يمكن ترك الحقل فارغ

### 3. Visual Feedback

**عند عدم إدخال الكود للدفع الأونلاين:**
- 🔴 حدود الحقل تصبح حمراء
- 🔴 رسالة خطأ تظهر تحت الحقل
- 🔴 زر التأكيد يكون معطل
- 🔴 toast notification عند محاولة الإرسال

### 4. Error Messages

**الرسائل الجديدة:**
- "Payment reference code is required for InstaPay transactions"
- "Payment reference code must be at least 3 characters long"

### 5. Technical Implementation

**Validation Logic:**
```typescript
// في handleSubscribe
if (paymentMethod === PaymentMethod.Online && !paymentReferenceCode.trim()) {
  showToast({
    type: 'error',
    title: 'Validation Error',
    message: 'Payment reference code is required for InstaPay transactions'
  });
  return;
}

if (paymentMethod === PaymentMethod.Online && paymentReferenceCode.trim().length < 3) {
  showToast({
    type: 'error', 
    title: 'Validation Error',
    message: 'Payment reference code must be at least 3 characters long'
  });
  return;
}
```

**Button State:**
```typescript
disabled={
  submitting || 
  !selectedPlan || 
  (paymentMethod === PaymentMethod.Online && !paymentReferenceCode.trim())
}
```

## النتيجة النهائية

الآن نظام الدفع يعمل كالتالي:

1. **اختيار خطة** → "Choose Plan"
2. **اختيار طريقة الدفع:**
   - **انستا باي (Online):** يجب إدخال كود المرجع
   - **أوفلاين (Offline):** كود المرجع اختياري
3. **Validation:** يتم التحقق من صحة البيانات
4. **إرسال الطلب:** للـ backend مع البيانات الصحيحة

النظام الآن أكثر أماناً ووضوحاً للمستخدم! 🎉
