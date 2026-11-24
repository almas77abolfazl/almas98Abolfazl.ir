import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/almas98abolfazl?schema=public';
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const articleContent = `وقتی مقدار یک متغیر توی کامپوننت تغییر می‌کنه، دقیقاً چه اتفاقی میفته؟ آیا همون لحظه پیکسل‌های صفحه عوض می‌شن؟ یا کل صفحه از نو رندر می‌شه؟

خیلی از دولوپرهای انگولار، حتی کسایی که سال‌ها سابقه کار دارن، وقتی به مبحث **Change Detection** می‌رسن، تصویر مبهمی تو ذهن‌شون دارن. خیلیا فکر می‌کنن انگولار با هر کلیک یا دریافت ریسپانس API، کل ساختار برنامه رو از اول تا آخر اسکن می‌کنه. بعضیا هم با اومدن Signals خیال کردن کلاً بازی عوض شده و دیگه نیازی نیست بدونیم این سازوکار چطور کار می‌کنه.

اما واقعیت اینه که مکانیسم تشخیص تغییرات در انگولار یکی از حساب‌شده‌ترین و بهینه‌ترین بخش‌های این فریم‌ورکه. درک دقیق این معماری به شما دید عمیقی از نحوه عملکرد موتور Ivy و ساختارهای داده‌ای **LView** و **TView** میده؛ اون‌وقت دقیقاً دست‌تون میاد چرا فلان کامپوننت بی‌دلیل افت فریم میده یا چرا وقتی دیتا عوض می‌شه، صفحه آپدیت نمی‌شه.

توی این مقاله می‌خوایم قدم‌به‌قدم بریم توی دل موتور رندرینگ Render3، استراتژی‌های Default و OnPush، نقش واقعی Signals و در نهایت دنیای بدون زون (Zoneless).

---

## بخش ۱: انگولار از کجا می‌فهمه چیزی تغییر کرده؟

بیاید با یه اصل خیلی مهم شروع کنیم: **تغییر State توی حافظه لزوماً به معنی تغییر DOM نیست.**

وقتی توی متد کامپوننت می‌نویسید:
\`\`\`typescript
this.userName.set('علی');
\`\`\`
موتور جاوااسکریپت (V8) فقط چند بایت رو توی حافظه RAM تغییر میده. مرورگر از خودش هیچ مکانیسمی نداره که بفهمه با تغییر این متغیر توی حافظه، باید متن تگ \`<h1>\` رو توی صفحه نمایش دوباره بکشه. وظیفه فریم‌ورک اینه که پل ارتباطی بین این دو تا دنیا باشه.

### تفکیک حیاتی: بررسی کامپوننت در برابر تغییر DOM

فرآیند Change Detection از دو مرحله کاملاً مستقل تشکیل شده:

1. **ارزیابی بایندینگ‌ها (Binding Evaluation):** فریم‌ورک مقدار جدید متغیر رو حساب می‌کنه و با مقداری که دور قبلی ذخیره کرده بود مقایسه می‌کنه.
2. **اعمال تغییرات به DOM واقعی (DOM Mutation):** فقط و فقط در صورتی که نتیجه مقایسه نشون بده مقدار عوض شده، متدهایی مثل \`node.textContent\` یا \`setAttribute\` صدا زده می‌شن.

این تفکیک توی کارایی فوق‌العاده مهمه. اگر توی یه دور بررسی، ۵۰ تا کامپوننت ارزیابی بشن ولی دیتای هیچ‌کدوم عوض نشده باشه، **حتی یه بار هم دست به ساختار DOM زده نمیشه.** از اونجا که دستکاری DOM کندترین بخش کار مرورگره، این تفکیک جلوی افت کارایی برنامه رو می‌گیره.

### درخت کامپوننت در برابر درخت View

ما توی کدهامون کامپوننت می‌نویسیم، ولی انگولار زیر دستش ساختاری به اسم **View Tree** رو مدیریت می‌کنه. هر کامپوننت یه Host View داره و ساختارهای شرطی یا تکرارها هم می‌تونن Embedded View بسازن. بررسی تغییرات هم همیشه به صورت یک‌طرفه (**Unidirectional Data Flow**) از ریشه به سمت برگ‌ها پیش میره:

![پیمایش درخت Viewها در انگولار](/assets/articles/angular-change-detection/diagram-1-component-tree.svg)

بیاید این ارتباط رو با یه مثال ملموس و استاندارد بر پایه Signals ببینیم:

\`\`\`typescript
// parent.component.ts
import { Component, signal } from '@angular/core';
import { ChildComponent } from './child.component';

@Component({
  selector: 'app-parent',
  imports: [ChildComponent],
  template: \`
    <div class="dashboard-card">
      <h2>والد: {{ title() }}</h2>
      <button (click)="changeTitle()">تغییر عنوان والد</button>
      <app-child [theme]="currentTheme()" />
    </div>
  \`
})
export class ParentComponent {
  title = signal('داشبورد اصلی');
  currentTheme = signal('dark');

  changeTitle() {
    this.title.set('داشبورد بروزرسانی‌شده');
  }
}
\`\`\`

وقتی کاربر روی دکمه کلیک می‌کنه، ایونت کلیک ثبت می‌شه و انگولار بررسی رو از کامپوننت والد به سمت فرزند شروع می‌کنه. حالا این مقادیر قبلی برای مقایسه دقیقاً کجا ذخیره می‌شن؟

---

## بخش ۲: پشت پرده Angular؛ LView و TView

با بازطراحی موتور رندر انگولار توی معماری Ivy (که توی کدبیس داخلی Render3 نامیده می‌شه)، نحوه ذخیره اطلاعات تمپلیت و مقادیر زمان اجرا به کل عوض شد تا هم رم کمتری مصرف بشه و هم سرعت پیمایش پردازنده بالا بره. این معماری روی دو تا ساختار اصلی استواره: **TView** و **LView**.

![معماری TView و LView در موتور Ivy](/assets/articles/angular-change-detection/diagram-2-tview-lview.svg)

### ۱. مفهوم TView (الگوی اشتراکی و ثابت)

آبجکت **TView** ساختار ثابت و نقشه کلی تمپلیت کامپوننته. اگر توی صفحه‌تون ۱۰۰ تا کارت از یه کامپوننت داشته باشید، در تمام طول اجرای برنامه فقط و فقط **یک شیء TView** توی حافظه براش وجود داره.

چیزهای کلیدی که توی TView نگهداری می‌شن:
- **TNodeها:** یه ساختار درختی سبک که تگ‌های HTML، دایرکتیوها و پایپ‌ها رو مشخص می‌کنه.
- **bindingStartIndex:** یه عدد ثابت (معمولاً 20) که معلوم می‌کنه اسلات‌های دیتای متغیر از کجای آرایه LView شروع می‌شن.
- **templateFn:** تابع کامپایل‌شده تمپلیت که خروجی کامپایلر انگولاره.
- **consts:** آرایه‌ای از رشته‌های ثابت، کلاس‌ها و Attributeها.

### ۲. مفهوم LView (آرایه زمان اجرای هر نمونه)

برخلاف TView، آبجکت **LView** به ازای **هر نمونه از کامپوننت** به صورت جداگونه توی حافظه ساخته می‌شه. نکته مهم اینه: **LView یه آبجکت تودرتوی سنگین نیست؛ بلکه یه آرایه فلت (Flat Array) بزرگه.** توی موتور V8 جاوااسکریپت، دسترسی به ایندکس‌های یه آرایه پشت‌سرهم خیلی سریع‌تر از گشتن توی Prototype آبجکت‌هاست.

### تشریح اندیس‌های هدر LView (از 0 تا 19)

توی معماری Ivy، بیست اندیس اول آرایه LView به عنوان \`HEADER_OFFSET\` برای کارهای داخلی فریم‌ورک رزرو شدن:

- **\`[0] TVIEW\`:** اشاره‌گر مستقیم به شیء ثابت \`TView\` متناظر.
- **\`[1] FLAGS\`:** یه بیت‌ماسک ۳۲ بیتی (\`LViewFlags\`) شامل وضعیت‌هایی مثل \`Dirty\`، \`Attached\`، \`Destroyed\` و \`CheckAlways\`.
- **\`[2] PARENT\`:** ارجاع به LView والد برای بالا رفتن به سمت ریشه.
- **\`[3] NEXT\` و \`[4] PREV\`:** اشاره‌گرهای دوطرفه برای پیمایش مستقیم و سریع بین Viewهای همسایه توی لیست‌ها.
- **\`[5] DECLARATION_VIEW\`:** ارجاع به LView جایی که این تمپلیت تعریف شده (برای حل صحیح اسکوپ متغیرها توی \`ng-template\`).
- **\`[6] QUERIES\`:** شیء \`LQueries\` برای آپدیت سلکتورهای تمپلیت مثل \`viewChild\` یا \`contentChild\`.
- **\`[7] INJECTOR\`:** نود اینجکتور محلی (\`NodeInjector\`) برای مدیریت DI توی این کامپوننت.
- **\`[8] CONTEXT\`:** نمونه کلاس کامپوننت (همون آبجکتی که توی کد با \`this\` باهاش کار می‌کنیم).
- **\`[9..19] HOST & HOOKS\`:** نگهداری رفرنس المان ریشه (Host Element)، المان‌های DOM ساخته‌شده، متدهای تخریب (\`onDestroy\`) و سنیتایزرها.
- **\`[20..N] BINDING SLOTS\`:** از اندیس بیستم به بعد، اسلات‌های نگهداری مقادیر بایندینگ قرار دارن. هر عبارتی که توی تمپلیت بایند شده، مقدار دور قبلی خودش رو توی یکی از این اندیس‌ها نگه می‌داره.

### کامپایلر انگولار تمپلیت رو چطوری به کد تبدیل می‌کنه؟

برای اینکه قضیه کاملاً ملموس بشه، فرض کنید کامپوننت ساده زیر رو با Signals نوشتیم:

\`\`\`typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-user-status',
  template: \`
    <h1>{{ title() }}</h1>
    <span [class.online]="isOnline()">وضعیت کاربر</span>
  \`
})
export class UserStatusComponent {
  title = signal('داشبورد');
  isOnline = signal(true);
}
\`\`\`

کامپایلر انگولار این تمپلیت رو به یه تابع جاوااسکریپتی تمیز تبدیل می‌کنه که پارامتری به نام \`rf\` (مخفف RenderFlags) داره:

\`\`\`typescript
function UserStatusComponent_Template(rf: number, ctx: UserStatusComponent) {
  // فاز ۱: Creation Mode (rf & 1) - فقط یک‌بار موقع ساخت المان‌ها اجرا می‌شه
  if (rf & 1) {
    ɵɵelementStart(0, 'h1');
    ɵɵtext(1);
    ɵɵelementEnd();
    ɵɵelementStart(2, 'span');
    ɵɵtext(3, 'وضعیت کاربر');
    ɵɵelementEnd();
  }

  // فاز ۲: Update Mode (rf & 2) - توی هر دور Change Detection این کامپوننت اجرا می‌شه
  if (rf & 2) {
    // مقدار سیگنال title رو بخون و اسلات متنی اندیس ۱ رو چک کن
    ɵɵadvance(1);
    ɵɵtextInterpolate(ctx.title());

    // وضعیت آنلاین بودن رو بخون و کلاس المان اندیس ۲ رو آپدیت کن
    ɵɵadvance(1);
    ɵɵclassProp('online', ctx.isOnline());
  }
}
\`\`\`

توی فاز Update (\`rf & 2\`)، دستور \`ɵɵtextInterpolate\` توی پس‌زمینه متدی به اسم \`ɵɵbindingUpdated\` رو صدا می‌زنه. این متد مقدار تازه \`ctx.title()\` رو با مقداری که قبلاً توی اسلات مربوطه در آرایه \`LView\` ذخیره شده بود مقایسه می‌کنه.

اگر مقدار فرقی نکرده باشه، تابع همون‌جا کار رو تموم می‌کنه و اصلاً کاری به DOM نداره. ولی اگه تغییر کرده باشه، هم اسلات LView رو با دیتای جدید به روز می‌کنه و هم نود متن رو توی DOM آپدیت می‌کنه.

---

## بخش ۳: استراتژی‌های Default، OnPush و سیستم Signals

حالا که دیدیم دیتا چطور ذخیره می‌شه، برسیم به اصل ماجرا: انگولار چطوری تصمیم می‌گیره وارد یه کامپوننت بشه یا کلاً بی‌خیالش بشه؟

### استراتژی Default (CheckAlways)

توی حالت پیش‌فرض، همه کامپوننت‌ها فلگ \`CheckAlways\` دارن. معنیش اینه که با هر چرخه Change Detection، انگولار چشم‌بسته میره سراغ کامپوننت و تمام فرزندانش تا فاز Update تمپلیت‌شون رو اجرا کنه. برای برنامه‌های کوچیک مشکلی پیش نمیاد، اما توی برنامه‌های بزرگ و سنگین، چک کردن مدام هزاران بایندینگ پردازنده رو خسته می‌کنه.

### استراتژی OnPush و مفهوم فلگ Dirty

وقتی استراتژی رو می‌ذارید روی \`ChangeDetectionStrategy.OnPush\`، قانون بازی عوض می‌شه:
> «فقط و فقط وقتی سراغ من بیا که من مشخصاً علامت (Dirty) خورده باشم.»

![مکانیزم نادیده گرفتن زیر‌درخت در OnPush](/assets/articles/angular-change-detection/diagram-3-onpush-skipping.svg)

چه چیزایی یه کامپوننت OnPush رو Dirty می‌کنن؟
1. **تغییر رفرنس ورودی‌ها (\`input()\` یا \`@Input()\`):** وقتی والد مقداری با رفرنس جدید بفرسته.
2. **رویدادهای محلی داخل کامپوننت:** کلیک روی دکمه یا هر Event توی تمپلیت خودش.
3. **تغییر دیتای یک Signal که توی تمپلیت خونده شده.**
4. **دریافت مقدار جدید از پایپ \`async\`**.
5. صدا زدن دستی متد \`markForCheck()\`.

### خطای مهلک: جهش شیء (Object Mutation) در برابر تغییر رفرنس

یکی از بدترین باگ‌ها موقعی پیش میاد که دیتا رو سنتی (بدون سیگنال) بنویسیم و فیلد داخلی شیء رو مستقیم عوض کنیم:

\`\`\`typescript
// مثال ۱: رفتار اشتباه در مدل سنتی (Object Mutation)
// چون از سیگنال استفاده نشده و فیلد شیء مستقیم عوض شده، OnPush اصلاً متوجه نمیشه
@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ user.name }} (امتیاز: {{ user.score }})</p>\`
})
export class ProfileCardComponent {
  @Input() user!: { name: string; score: number };
}

// توی کامپوننت والد:
increaseScore() {
  this.currentUser.score += 10; 
  // ❌ رفرنس شیء دست نخورده؛ انگولار هم فیلدهای داخلی رو چک نمیکنه
  // کامپوننت فرزند علامت Dirty نمی‌گیره و ظاهر صفحه همون‌طور ثابت می‌مونه!
}
\`\`\`

توی دنیای مدرن انگولار این مشکل رو یا با تغییر رفرنس حل می‌کنیم یا خیلی راحت‌تر با **Signals**:

\`\`\`typescript
// مثال ۲: رویکرد مدرن و استاندارد با Signals
@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ user().name }} (امتیاز: {{ user().score }})</p>\`
})
export class ProfileCardComponent {
  user = input.required<{ name: string; score: number }>();
}

// توی کامپوننت والد:
increaseScore() {
  // ✓ سیگنال به عنوان Producer، فوراً به مصرف‌کننده‌هاش خبر میده
  this.currentUser.update(u => ({ ...u, score: u.score + 10 }));
}
\`\`\`

### مقایسه مستقیم markForCheck() و detectChanges()

دو تا متدی که برای کنترل دستی چرخه‌ها استفاده می‌شن:

| متد | رفتار دقیق | کی به کار میاد؟ |
| :--- | :--- | :--- |
| \`markForCheck()\` | کل مسیر از کامپوننت تا ریشه رو با فلگ \`Dirty\` علامت می‌زنه تا توی دور بعدی چک بشن. خود به خود چرخه راه نمیندازه. | وقتی دیتایی از بیرون انگولار یا کدهای ناهمگام قدیمی میاد. |
| \`detectChanges()\` | همون لحظه و فوری، فقط خود کامپوننت و فرزندانش رو چک می‌کنه (کاری به والدها نداره). | شرایط خاص پرفورمنسی مثل انیمیشن‌ها یا رندرهای بلادرنگ سنگین. |

### سیگنال‌ها چطور با LView و TView کار می‌کنن؟

اینجا یه اشتباه رایج هست: خیلیا فکر می‌کنن با اومدن سیگنال‌ها، کل سیستم LView و TView کنار رفته!
واقعیت اینه که سیگنال‌ها جایگزین این ساختار نشدن؛ سیگنال صرفاً به عنوان یک ماشه دقیق (Fine-grained Trigger) عمل می‌کنه تا انگولار دقیقاً بدونه کدوم View کثیف شده و نیاز به بررسی داره. ولی وقتی نوبت رندر می‌رسه، همچنان تابع تمپلیت و ساختار LView هستن که مقادیر قبلی و جدید رو مقایسه می‌کنن و DOM رو آپدیت نگه می‌دارن.

---

## بخش ۴: Zone.js و دنیای بدون زون (Zoneless)

سال‌ها شروع چرخه‌های بررسی تغییرات گردن کتابخونه‌ای به اسم **Zone.js** بود.

![جریان واکنشی Signals و زمان‌بندی Zoneless](/assets/articles/angular-change-detection/diagram-4-signals-scheduling.svg)

### Zone.js چطوری کار می‌کرد؟

کتابخونه Zone.js تمام متدهای ناهمگام مرورگر مثل \`addEventListener\`، \`setTimeout\`، \`fetch\` و \`Promise\` رو دستکاری (Monkey-patch) می‌کرد. به محض اینکه یه کار ناهمگام تموم می‌شد، Zone.js سوت پایان رو می‌زد و به انگولار می‌گفت متد \`ApplicationRef.tick()\` رو صدا بزنه تا کل برنامه از نو چک بشه.

مشکلات Zone.js:
1. اضافه شدن حجم اضافه به باندل (حدود ۳۰ تا ۵۰ کیلوبایت).
2. بی‌خبری از اینکه اصلاً دیتایی عوض شده یا نه (فقط می‌دونست یه تسک تموم شده، حتی اگه هیچ متغیری تغییر نکرده باشه).
3. استک تریس‌های شلوغ و گیج‌کننده موقع دیباگ خطاها.

برای اینکه جلوی اجراهای الکی رو بگیریم، مجبور بودیم از \`runOutsideAngular\` استفاده کنیم:

\`\`\`typescript
this.ngZone.runOutsideAngular(() => {
  window.addEventListener('scroll', () => {
    // این اسکرول دیگه کل برنامه رو اسکن نمیکنه
  });
});
\`\`\`

### دنیای بدون زون (Zoneless) در انگولار مدرن

توی معماری جدید، انگولار بدون دستکاری متدهای مرورگر کار می‌کنه و می‌تونید خیلی تمیز پروژه رو روی حالت Zoneless فعال کنید:

\`\`\`typescript
// app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection()
  ]
};
\`\`\`

توی دنیای Zoneless، سیستمی به اسم **ChangeDetectionScheduler** سکان‌دار می‌شه. هر وقت سیگنالی عوض بشه یا ایونتی توی تمپلیت اتفاق بیفته، نوتیفیکیشن مستقیماً به Scheduler می‌رسه تا توی اولین فرصت در قالب یه Microtask، رندر سریع و بهینه‌ای رو هماهنگ کنه.

---

## بخش ۵: پرفورمنس و نکات بهینه‌سازی

برای داشتن اپلیکیشن‌هایی که مثل برق کار می‌کنن، این چند نکته طلایی رو همیشه مد نظر داشته باشید:

### ۱. توابع محاسباتی رو از تمپلیت ببرید روی computed

\`\`\`html
<!-- ❌ اشتباه: محاسبه دوباره تابع با هر بار بررسی -->
<p>{{ calculateDiscount(product()) }}</p>
\`\`\`

توابع توی تمپلیت با هر تیک اجرا می‌شن. به جاش همیشه از \`computed\` استفاده کنید تا نتیجه کش بشه:

\`\`\`typescript
// ✓ درست: سیگنال محاسباتی با کش هوشمند
finalPrice = computed(() => {
  const p = this.product();
  return p.price * (1 - p.discount);
});
\`\`\`

### ۲. استفاده حتمی از پارامتر track توی دستور \`@for\`

توی کنترل فلو جدید انگولار، مشخص کردن \`track\` واجبه:

\`\`\`html
@for (item of items(); track item.id) {
  <app-item-card [item]="item" />
}
\`\`\`

با این کار اگر فقط یک آیتم از لیست حذف یا بهش اضافه بشه، انگولار فقط همون یه نود رو توی DOM تغییر میده، نه اینکه کل لیست رو از نو بسازه.

### ۳. پروفایلینگ با ابزار Angular DevTools

اکستنشن رسمی **Angular DevTools** توی تب **Profiler** بهتون نشون میده:
1. دلیل ران شدن هر چرخه چی بوده.
2. هر کامپوننت چقدر زمان برای ارزیابی گرفته.
3. کدوم شاخه‌ها به خاطر OnPush بودن بدون دردسر رد (Skip) شدن.

---

## جمع‌بندی

پشت صحنه فرآیند Change Detection در انگولار یه جریان هماهنگ و پیوسته است:

:::ltr
State Change ➔ Notification ➔ Scheduler ➔ View Checking ➔ Binding Comparison ➔ DOM Mutation
:::

1. **تغییر State:** با فراخوانی سیگنال یا تغییر ورودی اتفاق میفته.
2. **نوتیفیکیشن:** نود مصرف‌کننده توی گراف مطلع می‌شه.
3. **زمان‌بندی:** Scheduler موعد مناسب رو با Microtask مشخص می‌کنه.
4. **پیمایش Viewها:** زیرشاخه‌های تمیز OnPush نادیده گرفته می‌شن و فقط بخش‌های Dirty ارزیابی می‌شن.
5. **مقایسه با اسلات‌های LView:** مقادیر با مقدار دور قبلی سنجیده می‌شن.
6. **بروزرسانی DOM:** فقط المان‌هایی که واقعاً مقدارشون عوض شده توی صفحه آپدیت می‌شن.

شناخت دقیق این جزئیات به شما کمک می‌کنه کدهایی بنویسید که نه تنها تمیزترن، بلکه بالاترین کارایی ممکن رو توی مرورگر به کاربر ارائه میدن.

---

### منابع و مستندات رسمی

- [Angular Official Documentation — Change Detection and Performance](https://angular.dev/best-practices/runtime-performance)
- [Angular Ivy Runtime Architecture (Render3 source code)](https://github.com/angular/angular/tree/main/packages/core/src/render3)
- [Angular Signals Internals and Reactive Graph](https://github.com/angular/angular/tree/main/packages/core/primitives/signals)
- [Angular DevTools Profiler Documentation](https://angular.dev/tools/devtools)
`;

async function main() {
  const article = await prisma.articles.upsert({
    where: { slug: 'angular-change-detection-internals' },
    update: {
      title:
        'پشت پرده Change Detection در Angular؛ از LView و TView تا OnPush و Signals',
      content: articleContent,
      excerpt:
        'بررسی عمیق سازوکار درونی Change Detection در انگولار؛ از معماری Ivy و ساختارهای داده LView و TView گرفته تا عملکرد OnPush، سیگنال‌ها و دنیای بدون زون (Zoneless).',
      coverUrl:
        '/assets/articles/angular-change-detection/cover-angular-change-detection.svg',
      language: 'fa',
      tags: [
        'Angular',
        'Change Detection',
        'LView',
        'TView',
        'OnPush',
        'Signals',
        'Zoneless',
        'Angular Internals',
        'Performance',
        'TypeScript',
      ],
      readingTime: 22,
      published: true,
      publishedAt: new Date(),
    },
    create: {
      title:
        'پشت پرده Change Detection در Angular؛ از LView و TView تا OnPush و Signals',
      slug: 'angular-change-detection-internals',
      content: articleContent,
      excerpt:
        'بررسی عمیق سازوکار درونی Change Detection در انگولار؛ از معماری Ivy و ساختارهای داده LView و TView گرفته تا عملکرد OnPush، سیگنال‌ها و دنیای بدون زون (Zoneless).',
      coverUrl:
        '/assets/articles/angular-change-detection/cover-angular-change-detection.svg',
      language: 'fa',
      tags: [
        'Angular',
        'Change Detection',
        'LView',
        'TView',
        'OnPush',
        'Signals',
        'Zoneless',
        'Angular Internals',
        'Performance',
        'TypeScript',
      ],
      readingTime: 22,
      published: true,
      publishedAt: new Date(),
    },
  });

  console.log('Successfully updated article with conversational author tone:', {
    id: article.id,
    slug: article.slug,
    title: article.title,
    readingTime: article.readingTime,
    tagsCount: article.tags.length,
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error('Error updating article:', err);
  process.exit(1);
});
