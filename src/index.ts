import * as a1lib from "alt1";

// Constants
const NUM_PRESETS = 18;
const DISABLED_PRESETS_URL = "./images/disabled-presets.png";
const DEFAULT_IMAGE_URL = "./images/icon.png";
const DEFAULT_IMAGE_WIDTH = 420;
const DEFAULT_IMAGE_HEIGHT = 550;

// Load base images with webpack
let imgs = a1lib.webpackImages({
	RS3_bank_presets: require("./images/data/bank/RS3_presets.data.png"),
	RS3_disabled_preset: require("./images/data/bank/RS3_disabled_preset.data.png"),
	OS3_bank_presets: require("./images/data/bank/OS3_presets.data.png"),
	OS3_disabled_preset: require("./images/data/bank/OS3_disabled_preset.data.png"),
});

// Load in RS3 Preset Images
let RS3_preset_imgs = {};
for (let i = 1; i <= 18; i++) RS3_preset_imgs[`preset_${i.toString().padStart(2, '0')}`] = require(`./images/data/buttons/RS3_preset_${i.toString().padStart(2, '0')}.data.png`);
RS3_preset_imgs = a1lib.webpackImages(RS3_preset_imgs);

// Load in OS3 Preset Images
let OS3_preset_imgs = {};
for (let i = 1; i <= 18; i++) OS3_preset_imgs[`preset_${i.toString().padStart(2, '0')}`] = require(`./images/data/buttons/OS3_preset_${i.toString().padStart(2, '0')}.data.png`);
OS3_preset_imgs = a1lib.webpackImages(OS3_preset_imgs);

// Check if running inside Alt1
if (window.alt1) {
	alt1.identifyAppUrl("./appconfig.json");
} else {
	document.getElementById("addtoalt1").style.display = "block";
}

// Initialize the app
document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
	try {
		if (window.alt1) {
			if (!alt1.permissionInstalled) {
				document.getElementById("addtoalt1").style.display = "block";
				document.getElementById("addtoalt1").innerHTML = "You should click <a href='https://presetify.unlishema.org'>Add App</a> at top right";
			} else {
				await setupDefaultImages();
				setupEventListeners();
				setInterval(loop, 100);
			}
		}
	} catch (error) {
		console.error("Initialization error:", error);
	}
}

async function setupDefaultImages() {
	const disabledPresets = await convertImageToBase64(DISABLED_PRESETS_URL);
	if (!localStorage.getItem(`disabled-presets`)) localStorage.setItem(`disabled-presets`, disabledPresets);

	const defaultImage = await convertImageToBase64(DEFAULT_IMAGE_URL);
	for (let i = 1; i <= NUM_PRESETS; i++) {
		const preset = `preset-${String(i).padStart(2, '0')}`;
		if (!localStorage.getItem(preset)) localStorage.setItem(preset, defaultImage);
	}
}

function setupEventListeners() {
	document.getElementById("menubutton").addEventListener("click", () => {
		openSettings();
		console.log("Open Settings!");
	});
}

function loop() {
	if (!window.alt1 || !alt1.permissionInstalled || !alt1.permissionOverlay || !alt1.rsActive) return;
	const buffer = a1lib.captureHoldFullRs();
	checkForPresets(buffer, imgs.RS3_bank_presets);
	checkForPresets(buffer, imgs.OS3_bank_presets);
}

function checkForPresets(buffer: any, bankImage: any) {
	let pos = buffer.findSubimage(bankImage);
	if (pos && pos.length > 0) for (let location of pos) {
		const disabled_img = bankImage === imgs.RS3_bank_presets ? imgs.RS3_disabled_preset : imgs.OS3_disabled_preset;
		const preset_imgs = bankImage === imgs.RS3_bank_presets ? RS3_preset_imgs : OS3_preset_imgs;

		// Show disabled preset icons
		if (disabled_img) {
			const presetImageData = localStorage.getItem(`disabled-presets`); // Load from base64 image in localStorage
			const disabledPos = buffer.findSubimage(disabled_img, location.x, location.y, bankImage.width, bankImage.height);
			if (disabledPos && disabledPos.length > 0) for (let match of disabledPos) {
				generateOverlay(presetImageData, (ctx, canvas) => {
					const imageString = a1lib.encodeImageString(ctx.getImageData(0, 0, canvas.width, canvas.height));
					alt1.overLayImage(match.x, match.y, imageString, 30, 300);
				});
			}
		}

		// Loop through all 18 preset images and set them as the settings allow
		if (preset_imgs) for (let key in preset_imgs) {
			const presetImageData = localStorage.getItem(key.replace("_", "-")); // Load from base64 image in localStorage

			if (presetImageData) {
				const presetPos = buffer.findSubimage(preset_imgs[key], location.x, location.y, bankImage.width, bankImage.height);
				if (presetPos && presetPos.length > 0) for (let match of presetPos) {
					generateOverlay(presetImageData, (ctx, canvas) => {
						const imageString = a1lib.encodeImageString(ctx.getImageData(0, 0, canvas.width, canvas.height));
						alt1.overLayImage(match.x, match.y, imageString, 30, 300);
					});
				}
			} else console.warn(`No image data found for [${key}]`);
		}
	}
}

function generateOverlay(imgBase64, f: (ctx, canvas) => void) {
	const img = new Image();
	img.src = imgBase64; // Set the source to the base64 string
	img.onload = () => {
		const canvas = document.createElement('canvas');
		const targetWidth = 30; // Set to the desired width
		const targetHeight = (img.height / img.width) * targetWidth; // Maintain aspect ratio

		canvas.width = targetWidth;
		canvas.height = targetHeight;

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(img, 0, 0, targetWidth, targetHeight); // Scale the image
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get ImageData
			f(ctx, canvas);
		}

	};
}

function openSettings() {
	const left = window.screenX + (window.innerWidth / 2) - (DEFAULT_IMAGE_WIDTH / 2);
	const top = window.screenY + (window.innerHeight / 2) - (DEFAULT_IMAGE_HEIGHT / 2);

	const settingsWindow = window.open("./settings.html", "_blank", `width=${DEFAULT_IMAGE_WIDTH},height=${DEFAULT_IMAGE_HEIGHT},left=${left},top=${top}`);

	settingsWindow?.addEventListener('keyup', (e) => {
		if ((e.which || e.keyCode) === 116) {
			e.preventDefault(); // Prevent F5 key press from refreshing the page
		}
	});
}

async function convertImageToBase64(url: string) {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Error converting image to Base64:", error);
		return null;
	}
}
