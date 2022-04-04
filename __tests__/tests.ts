const puppeteer = require('puppeteer')

describe('Tests',() => {
    jest.setTimeout(10000);
    let browser, page;

    beforeEach(async () => {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        });

        page = await browser.newPage();
        await page.goto('https://kkspace.ru');
    })

    test('Correct Redirect test', async () => {
        await page.evaluate(() => {
            let elems = Array.from(document.querySelectorAll('a.tn-atom'));
            for(let el of elems) {
                if (el.textContent == "Чехлы и аксессуары")
                    (el as unknown as HTMLElement).click()
            }
        });

        await page.waitForSelector('h1[class="page-title__name ec-header-h1"]');

        expect(page.url()).toEqual('https://www.kkspace.ru/collection?store-page=Chekhly-i-zaschita-ustroystv-c38872699');
    })

    test('Correct Input test', async () => {
        let s = "Testmail@sobaka"

        await page.$eval('input[name="email"]', (el, s) => {el.value = s}, s);

        let text = await page.$eval('input[name="email"]', el => {
            return el.value;
        });

        expect(text).toEqual(s);
    })

    test('Correct Input test with random characters', async () => {

        let s = "Testmail@sobaka *(ᅠ ᅠ )*";

        await page.$eval('input[name="email"]', (el, s) => {el.value = s}, s);

        let text = await page.$eval('input[name="email"]', el => {
            return el.value;
        });

        expect(text).toEqual(s);
    })


    test('Test incorrect email insertion', async () => {

        let s = "Testmail@sobaka.𓂺";

        await page.$eval('input[name="email"]', (el, s) => {el.value = s}, s);

        await page.$eval('button[type="submit"]', el => el.click())

        let res = await page.waitForSelector('p[class="t-form__errorbox-item"]')

        expect(res).not.toEqual(null)
    })

    /*
    Breaks if captcha appears
    test('Test correct email insertion', async () => {

        let s = "Testmail@sobaka.ru";

        await page.$eval('input[name="email"]', (el, s) => {el.value = s}, s);

        await page.$eval('button[type="submit"]', el => el.click());

        await page.waitFor(3000);
        let res;
        try {
            res = await page.waitForSelector('div[class="t-form-success-popup__text"]');
        } catch {
            res = null;
        }

        expect(res).not.toEqual(null);
    })
    */

    test('Empty Shopping list test', async () => {
        await page.waitForSelector('div.ec-minicart__icon');

        await page.$eval('div.ec-minicart__icon', el => el.click());

        await page.waitForSelector('div.ec-cart__message');

        let text = await page.$eval('div.ec-cart__message', el => {
            return el.textContent;
        });

        expect(text).toEqual('Ваша корзина пуста');
    })

    test('Filled Shopping list test', async () => {
        await page.waitForSelector('img[title="Подарочный сертификат"]', {timeout: 5000});


        await page.$eval('img[title="Подарочный сертификат"]', el => {
            el.click();
        });

        await page.waitForSelector('div[class="form-control form-control--button form-control--large form-control--primary form-control--flexible form-control--animated details-product-purchase__add-to-bag form-control__button--icon-center form-control--done"]');

        await page.$eval('div[class="form-control form-control--button form-control--large form-control--primary form-control--flexible form-control--animated details-product-purchase__add-to-bag form-control__button--icon-center form-control--done"]', el => {
            if (el.textContent == "В корзину")
                el.click();
        });
        await page.waitFor(2000)

        await page.waitForSelector('div.ec-minicart__icon');

        await page.$eval('div.ec-minicart__icon', el => el.click());

        await page.waitForSelector('span.ec-currency-converter-element');
        let text = await page.$eval('span.ec-currency-converter-element', el => {
            return el.textContent;
        });

        expect(text).toEqual(' (3 000₽)');
    })

    afterEach(async () => {
        await browser.close();
    })

})

