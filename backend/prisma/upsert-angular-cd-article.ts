import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/almas98abolfazl?schema=public';
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const articleContent = `وقتی مقدار یک متغیر در کامپوننت تغییر میکند، دقیقاً چه اتفاقی میفتد؟ آیا همان لحظه پیکسل‌های صفحه تغییر میکنند؟ یا کل صفحه از نو رندر میشود؟

خیلی از دولوپرهای انگولار، حتی کسانی که سال‌ها سابقه کار دارند، وقتی به مبحث **Change Detection** میرسند، تصویر مبهمی از آن دارند. عده‌ای تصور میکنند انگولار با هر کلیک یا دریافت پاسخ API، کل ساختار برنامه را از اول تا آخر اسکن میکند. گروهی هم با معرفی Signals گمان کردند کل فرآیند تغییر کرده و دیگر نیازی به دانستن سازوکار داخلی فریم‌ورک نیست.

اما واقعیت این است که مکانیسم تشخیص تغییرات در انگولار یکی از مهندسی‌شده‌ترین و بهینه‌ترین بخش‌های این فریم‌ورک است. درک دقیق این معماری به شما دید عمیقی از نحوه عملکرد موتور Ivy و ساختارهای داده‌ای **LView** و **TView** میدهد؛ آن‌وقت دقیقاً متوجه میشوید چرا برخی کامپوننت‌ها بی‌دلیل دچار افت فریم میشوند یا چرا با تغییر داده، صفحه بروزرسانی نمیشود.

در این مقاله از سطح کدهای روزمره عبور میکنیم و به لایه‌های زیرین موتور Render3، استراتژی‌های Default و OnPush، نقش واقعی Signals و دنیای بدون زون (Zoneless) وارد میشویم.

---

## بخش ۱: انگولار از کجا میفهمد چیزی تغییر کرده است؟

بیاید کار را با یک اصل کلیدی آغاز کنیم: **تغییر State در حافظه الزاماً به معنی تغییر DOM نیست.**

وقتی در متد یک کامپوننت مینویسید:
\`\`\`typescript
this.userName.set('علی');
\`\`\`
موتور جاوااسکریپت (V8) صرفاً چند بایت را در حافظه RAM تغییر میدهد. مرورگر هیچ مکانیسم پیش‌فرضی ندارد که بفهمد با تغییر این متغیر در حافظه، باید متن داخل یک تگ \`<h1>\` در صفحه مانیتور را مجدداً ترسیم کند. وظیفه فریم‌ورک این است که پیوند میان این دو دنیا را مدیریت کند.

### تفکیک حیاتی: بررسی کامپوننت در برابر جهش DOM

فرآیند Change Detection از دو مرحله کاملاً مستقل تشکیل شده است:

1. **ارزیابی بایندینگ‌ها (Binding Evaluation):** فریم‌ورک مقدار جدید متغیر را محاسبه کرده و با مقداری که در دور قبلی ذخیره شده بود مقایسه میکند.
2. **اعمال به DOM واقعی (DOM Mutation):** تنها در صورتی که نتیجه مقایسه نشان دهد مقدار تغییر کرده است، متدهایی مثل \`node.textContent\` یا \`setAttribute\` فراخوانی میشوند.

این تفکیک اهمیت فوق‌العاده‌ای در کارایی دارد. اگر در طول یک سیکل بررسی، ۵۰ کامپوننت ارزیابی شوند اما دیتای هیچ‌کدام تغییر نکرده باشد، **حتی یک بار هم به ساختار DOM دست زده نمیشود.** از آنجا که تعامل با DOM کندترین بخش اجرای مرورگر است، این تفکیک از افت کارایی جلوگیری میکند.

### درخت کامپوننت در برابر درخت View

ما در کدهایمان کامپوننت مینویسیم، اما انگولار زیربنایی به نام **View Tree** را مدیریت میکند. هر کامپوننت یک Host View دارد و ساختارهای شرطی یا تکرارها نیز ممکن است Embedded View ایجاد کنند. بررسی تغییرات همواره به صورت یک‌طرفه (**Unidirectional Data Flow**) از ریشه به سمت برگ‌ها پیش میرود:

![پیمایش درخت Viewها در انگولار](/assets/articles/angular-change-detection/diagram-1-component-tree.svg)

بیاید این ارتباط را با یک مثال ملموس و استاندارد مبتنی بر Signals در انگولار ببینیم:

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

وقتی کاربر روی دکمه کلیک میکند، رویداد کلیک ثبت شده و انگولار بررسی را از کامپوننت والد به سمت فرزند آغاز میکند. اما داده‌های ارزیابی و مقادیر قبلی برای مقایسه دقیقاً در کجا نگهداری میشوند؟

---

## بخش ۲: پشت پرده Angular؛ LView و TView

با بازطراحی موتور رندر انگولار با معماری Ivy (که در کدبیس داخلی Render3 نامیده میشود)، نحوه ذخیره اطلاعات تمپلیت و مقادیر زمان اجرا به طور اساسی تغییر کرد تا هم مصرف حافظه به حداقل برسد و هم سرعت پیمایش پردازنده بالا برود. این معماری بر تفکیک دو ساختار **TView** و **LView** استوار است:

![معماری TView و LView در موتور Ivy](/assets/articles/angular-change-detection/diagram-2-tview-lview.svg)

### ۱. مفهوم TView (الگوی اشتراکی و ایستا)

آبجکت **TView** نماینده الگوی ایستا و ساختار تمپلیت کامپوننت است. اگر در صفحه‌تان از یک کامپوننت کارت ۱۰۰ نمونه فعال داشته باشید، در تمام طول برنامه فقط و فقط **یک شیء TView** در حافظه برای آن وجود دارد.

اطلاعات کلیدی ذخیره‌شده در TView:
- **TNodeها:** یک ساختار درختی فشرده که تگ‌های HTML، دایرکتیوها و پایپ‌ها را تعریف میکند.
- **bindingStartIndex:** یک عدد ثابت (معمولاً 20) که مشخص میکند اسلات‌های داده متغیر از کجای آرایه LView آغاز میشوند.
- **templateFn:** تابع کامپایل‌شده تمپلیت که توسط کامپایلر انگولار تولید شده است.
- **consts:** آرایه‌ای از رشته‌های ثابت، نام کلاس‌ها و Attributeها.

### ۲. مفهوم LView (آرایه زمان اجرای هر نمونه)

برخلاف TView، شیء **LView** به ازای **هر نمونه ساخته‌شده از کامپوننت** به صورت مجزا در حافظه ساخته میشود. نکته مهندسی مهم این است: **LView یک آبجکت تودرتوی سنگین نیست؛ بلکه یک آرایه فلت (Flat Array) بزرگ است.** در موتور جاوااسکریپت V8 دسترسی به اندیس‌های یک آرایه پیوسته بسیار سریع‌تر از جستجو در زنجیره Prototype آبجکت‌هاست.

### تشریح دقیق اندیس‌های هدر LView (از 0 تا 19)

در معماری Ivy، بیست اندیس اول آرایه LView به عنوان \`HEADER_OFFSET\` برای مدیریت زیرساخت فریم‌ورک رزرو شده‌اند:

- **\`[0] TVIEW\`:** اشاره‌گر مستقیم به شیء اشتراکی \`TView\` متناظر.
- **\`[1] FLAGS\`:** یک بیت‌ماسک ۳۲ بیتی (\`LViewFlags\`) شامل وضعیت‌هایی مثل \`Dirty\`، \`Attached\`، \`Destroyed\` و \`CheckAlways\`.
- **\`[2] PARENT\`:** ارجاع به LView والد برای حرکت به سمت ریشه.
- **\`[3] NEXT\` و \`[4] PREV\`:** اشاره‌گرهای دوطرفه برای پیمایش مستقیم و سریع بین Viewهای همسایه در لیست‌های تودرتو.
- **\`[5] DECLARATION_VIEW\`:** ارجاع به LView جایی که این تمپلیت تعریف شده است (برای حل صحیح اسکوپ متغیرها در \`ng-template\`).
- **\`[6] QUERIES\`:** شیء \`LQueries\` برای ردیابی و بروزرسانی سلکتورهای تمپلیت مثل \`viewChild\` یا \`contentChild\`.
- **\`[7] INJECTOR\`:** نود اینجکتور محلی (\`NodeInjector\`) برای مدیریت تزریق وابستگی در سطح این کامپوننت.
- **\`[8] CONTEXT\`:** نمونه کلاس کامپوننت (همان آبجکتی که در کدهایمان با \`this\` به آن دسترسی داریم).
- **\`[9..19] HOST & HOOKS\`:** نگهداری رفرنس المان ریشه (Host Element)، المان‌های DOM ساخته‌شده، متدهای تخریب (\`onDestroy\`) و سنیتایزرها.
- **\`[20..N] BINDING SLOTS\`:** از اندیس بیستم به بعد، اسلات‌های نگهداری مقادیر بایندینگ قرار دارند. هر عبارتی که در تمپلیت بایند شده، مقدار دور قبلی خود را در یکی از این اندیس‌ها ذخیره میکند.

### کامپایلر انگولار تمپلیت را چگونه به کد تبدیل میکند؟

برای درک کامل این موضوع، فرض کنید کامپوننت بسیار ساده زیر را با استفاده از Signals نوشته‌ایم:

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

کامپایلر انگولار تمپلیت فوق را به تابع جاوااسکریپتی زیر تبدیل میکند که پارامتری به نام \`rf\` (مخفف RenderFlags) دارد:

\`\`\`typescript
function UserStatusComponent_Template(rf: number, ctx: UserStatusComponent) {
  // Phase 1: Creation Mode (rf & 1) - Runs only once when component is instantiated
  if (rf & 1) {
    ɵɵelementStart(0, 'h1');
    ɵɵtext(1);
    ɵɵelementEnd();
    ɵɵelementStart(2, 'span');
    ɵɵtext(3, 'وضعیت کاربر');
    ɵɵelementEnd();
  }

  // Phase 2: Update Mode (rf & 2) - Runs on every change detection pass for this view
  if (rf & 2) {
    // 1. Advance cursor to text node slot 1 and evaluate signal value
    ɵɵadvance(1);
    ɵɵtextInterpolate(ctx.title());

    // 2. Advance cursor to span element slot 2 and evaluate boolean class binding
    ɵɵadvance(1);
    ɵɵclassProp('online', ctx.isOnline());
  }
}
\`\`\`

در فاز Update (\`rf & 2\`)، دستور \`ɵɵtextInterpolate\` در پس‌زمینه تابعی به نام \`ɵɵbindingUpdated\` را فراخوانی میکند. این تابع مقدار خروجی \`ctx.title()\` را با مقداری که قبلاً در اسلات مربوطه در آرایه \`LView\` ذخیره شده مقایسه میکند. 

اگر مقدار تغییر نکرده باشد، دستور بلافاصله خاتمه می‌یابد و هیچ ارتباطی با DOM برقرار نمیشود. اما اگر مقدار تغییر کرده باشد، هم اسلات LView با مقدار جدید جایگزین میشود و هم نود متن در DOM مرورگر آپدیت میگردد.

---

## بخش ۳: استراتژی‌های Default، OnPush و سیستم Signals

حالا که ساختار ذخیره‌سازی را دیدیم، نوبت به استراتژی‌های بررسی میرسد: انگولار چگونه تصمیم میگیرد وارد یک کامپوننت بشود یا آن را نادیده بگیرد؟

### استراتژی Default (CheckAlways)

در حالت پیش‌فرض، تمام کامپوننت‌ها بیت‌فلگ \`CheckAlways\` دارند. این یعنی با هر بار آغاز فرآیند Change Detection، فریم‌ورک بدون قید و شرط وارد کامپوننت و تمام فرزندانش میشود تا فاز Update تمپلیت آن‌ها را ارزیابی کند. برای برنامه‌های کوچک این کار سریع است، اما در اپلیکیشن‌های سازمانی بزرگ، بررسی مکرر هزاران بایندینگ پردازنده را درگیر میکند.

### استراتژی OnPush و مفهوم فلگ Dirty

وقتی استراتژی کامپوننت را روی \`ChangeDetectionStrategy.OnPush\` قرار میدهید، رفتار فریم‌ورک تغییر میکند:
> «فقط زمانی تمپلیت من را ارزیابی کن که به صورت مشخص برای بررسی علامت‌گذاری (Dirty) شده باشم.»

![مکانیزم نادیده گرفتن زیر‌درخت در OnPush](/assets/articles/angular-change-detection/diagram-3-onpush-skipping.svg)

چه عواملی کامپوننت OnPush را Dirty میکنند؟
1. **تغییر مرجع در ورودی‌ها (\`input()\` یا \`@Input()\`):** وقتی والد مقدار جدیدی با رفرنس متفاوت پاس دهد.
2. **رویدادهای محلی داخل کامپوننت:** کلیک روی دکمه یا هر Event متصل در تمپلیت.
3. **تغییر یک Signal که در تمپلیت خوانده شده است.**
4. **دریافت مقدار جدید توسط پایپ \`async\`**.
5. فراخوانی دستی متد \`markForCheck()\`.

### خطای مهلک: جهش شیء (Object Mutation) در برابر تغییر مرجع

یکی از پرتکرارترین باگ‌ها زمانی رخ میدهد که داده‌ها به شیوه سنتی (غیرسیگنالی) استفاده شوند و فیلد داخلی شیء مستقیماً دستکاری شود:

\`\`\`typescript
// مثال ۱: رفتار اشتباه در حالت کلاسیک (Object Mutation)
// در این مدل، چون از سیگنال استفاده نشده و فیلد شیء مستقیم عوض شده، OnPush متوجه تغییر نمیشود
@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ user.name }} (امتیاز: {{ user.score }})</p>\`
})
export class ProfileCardComponent {
  @Input() user!: { name: string; score: number };
}

// در کامپوننت والد:
increaseScore() {
  this.currentUser.score += 10; 
  // ❌ مرجع شیء تغییر نکرده است؛ انگولار فیلدهای درونی را اسکن نمیکند
  // کامپوننت OnPush فرزند علامت Dirty دریافت نمیکند و ظاهر صفحه ثابت میماند!
}
\`\`\`

حل این مسئله در دنیای مدرن انگولار به دو شکل صورت میگیرد؛ یا با تغییر مرجع (ایمیوتبل) یا با بهره‌گیری از **Signals**:

\`\`\`typescript
// مثال ۲: رویکرد مدرن و صحیح مبتنی بر Signals در Angular
@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ user().name }} (امتیاز: {{ user().score }})</p>\`
})
export class ProfileCardComponent {
  user = input.required<{ name: string; score: number }>();
}

// در کامپوننت والد:
increaseScore() {
  // ✓ سیگنال به عنوان یک تولیدکننده (Producer) به مصرف‌کننده خود نوتیفیکیشن میفرستد
  this.currentUser.update(u => ({ ...u, score: u.score + 10 }));
}
\`\`\`

### مقایسه مستقیم markForCheck() و detectChanges()

دو متدی که در کنترل دستی بررسی تغییرات استفاده میشوند:

| متد | نحوه عملکرد | بهترین زمان استفاده |
| :--- | :--- | :--- |
| \`markForCheck()\` | کل مسیر از کامپوننت فعلی تا Root را با فلگ \`Dirty\` علامت میزند تا در سیکل بعدی بررسی شوند. | هنگام دریافت داده از لایه‌های خارج از فریم‌ورک یا تغییرات ناهمگام. |
| \`detectChanges()\` | بلافاصله و در همان لحظه، فقط کامپوننت جاری و فرزندانش را ارزیابی میکند. | شرایط پرفورمنسی خاص نظیر رندرهای بلادرنگ سنگین یا انیمیشن‌ها. |

### ارتباط Signals با سیستم LView و TView

یک باور غلط این است که سیگنال‌ها سیستم LView و TView را کلاً کنار گذاشته‌اند. در حقیقت سیگنال‌ها سازوکار **تشخیص و اطلاع‌رسانی (Reactivity Graph)** را متحول کرده‌اند، نه موتور رندرینگ را.

به جای اینکه موتور فریم‌ورک کورکورانه کل اپلیکیشن را اسکن کند، سیگنال به عنوان یک نشانه‌گذار دقیق (Fine-grained Trigger) عمل می‌کند و دقیقاً به View مصرف‌کننده اطلاع می‌دهد که کثیف (Dirty) شده است. اما در مرحله رندر، همچنان موتور Ivy تابع تمپلیت را اجرا می‌کند تا با مقایسه مقادیر در اسلات‌های LView، تغییرات لازم را در DOM اعمال کند.

---

## بخش ۴: Zone.js و دنیای بدون زون (Zoneless)

تا سال‌ها هماهنگی آغاز چرخه Change Detection در انگولار به عهده کتابخانه **Zone.js** بود.

![جریان واکنشی Signals و زمان‌بندی Zoneless](/assets/articles/angular-change-detection/diagram-4-signals-scheduling.svg)

### Zone.js چگونه کار میکرد؟

کتابخانه Zone.js تمام توابع ناهمگام مرورگر از قبیل \`addEventListener\`، \`setTimeout\`، \`fetch\` و \`Promise\` را مونکی‌پچ (Monkey-patch) میکرد. به محض اینکه یک تسک ناهمگام تمام میشد، Zone.js به فریم‌ورک خبر میداد تا متد \`ApplicationRef.tick()\` را صدا بزند و کل درخت را بررسی کند.

مشکلات Zone.js:
1. افزایش حجم باندل خروجی (۳۰ تا ۵۰ کیلوبایت).
2. بی‌خبری از دیتای تغییریافته (فقط میدانست یک کار ناهمگام تمام شده، اما نمیدانست اصلاً دیتایی تغییر کرده یا خیر).
3. دشواری دیباگ Call Stackها در لاگ خطاهای مرورگر.

برای جلوگیری از اجرای مکرر و بیهوده تیک، ناچار بودیم از \`runOutsideAngular\` استفاده کنیم:

\`\`\`typescript
this.ngZone.runOutsideAngular(() => {
  window.addEventListener('scroll', () => {
    // رویداد بدون ایجاد چرخه در انگولار اجرا میشود
  });
});
\`\`\`

### دنیای بدون زون (Zoneless) در انگولار مدرن

در معماری نوین، انگولار بدون دستکاری متدهای مرورگر کار میکند و میتوان آن را مستقیماً در حالت Zoneless فعال کرد:

\`\`\`typescript
// app.config.ts
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
};
\`\`\`

در ساختار Zoneless، سیستمی به نام **ChangeDetectionScheduler** وارد عمل میشود. هرگاه سیگنالی تغییر کند، رویدادی در تمپلیت رخ دهد یا متد \`markForCheck\` فراخوانی شود، پیامی به Scheduler ارسال میگردد تا با هماهنگی Microtaskها یا فریم‌های تصویر، بروزرسانی سبکی را زمان‌بندی کند.

---

## بخش ۵: عملکرد (Performance) و ابزارهای دیباگ

برای نوشتن برنامه‌های سریع در مقیاس بالا، رعایت این چند اصل مهندسی تفاوت‌های بزرگی رقم میزند:

### ۱. حذف توابع محاسباتی از Template و استفاده از computed

\`\`\`html
<!-- ❌ اشتباه: محاسبه تابع با هر بار اجرای Change Detection -->
<p>{{ calculateDiscount(product()) }}</p>
\`\`\`

اگر از متد معمولی استفاده کنید، با هر چرخه ارزیابی این تابع دوباره اجرا میشود. راه‌حل استاندارد استفاده از سیگنال محاسباتی با کش خودکار است:

\`\`\`typescript
// ✓ صحیح: استفاده از computed با خاصیت کش هوشمند
finalPrice = computed(() => {
  const p = this.product();
  return p.price * (1 - p.discount);
});
\`\`\`

### ۲. بهره‌گیری از دستور \`@for\` و الزام پارامتر \`track\`

در سینتکس کنترلی جدید، مشخص کردن \`track\` اجباری است:

\`\`\`html
@for (item of items(); track item.id) {
  <app-item-card [item]="item" />
}
\`\`\`

اگر شناسه یکتا مشخص باشد، در صورت حذف یا درج آیتم، انگولار صرفاً نودهای متناظر همان آیتم را در DOM دستکاری میکند و از بازسازی کل لیست پرهیز میشود.

### ۳. پروفایلینگ با Angular DevTools

اکستنشن رسمی **Angular DevTools** در تب **Profiler** اطلاعات شفافی در اختیارتان میگذارد:
1. دلیل آغاز هر چرخه چیست (Signal Change، DOM Event یا رویدادهای دیگر).
2. هر کامپوننت چند میلی‌ثانیه زمان برای ارزیابی بایندینگ‌ها مصرف کرده است.
3. کدام شاخه‌ها به خاطر استراتژی OnPush به صورت کامل نادیده گرفته شده‌اند (کارت‌های خاکستری‌رنگ).

---

## جمع‌بندی

پشت صحنه فرآیند Change Detection در انگولار یک جریان هماهنگ و پیوسته است:

:::ltr
State Change ➔ Notification ➔ Scheduler ➔ View Checking ➔ Binding Comparison ➔ DOM Mutation
:::

1. **تغییر State:** با فراخوانی سیگنال یا تغییر ورودی رخ میدهد.
2. **نوتیفیکیشن:** نود مصرف‌کننده در گراف واکنش‌گرایی مطلع میشود.
3. **زمان‌بندی:** Scheduler موعد مناسب را در قالب Microtask تعیین میکند.
4. **پیمایش Viewها:** شاخه‌های تمیز OnPush نادیده گرفته میشوند و صرفاً Viewهای کثیف ارزیابی میگردند.
5. **مقایسه با اسلات‌های LView:** مقادیر با مقدار ارزیابی قبلی سنجیده میشوند.
6. **بروزرسانی DOM:** فقط و فقط المان‌هایی که مقدارشان تغییر کرده در DOM آپدیت میشوند.

شناخت این جزئیات به شما اجازه میدهد فراتر از یک توسعه‌دهنده عادی کد بزنید، از خطاهای پنهان در OnPush پیشگیری کنید و نرم‌افزارهایی بسازید که بالاترین سرعت و پاسخ‌دهی را ارائه میدهند.

---

### منابع و مراجع رسمی

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

  console.log('Successfully updated article:', {
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
