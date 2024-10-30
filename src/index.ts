import * as a1lib from "alt1";

// Constants
const NUM_PRESETS = 18;
const DEFAULT_IMAGE_URL = "./images/icon.png";
const DEFAULT_IMAGE_WIDTH = 420;
const DEFAULT_IMAGE_HEIGHT = 550;

// Load images with webpack
let imgs = a1lib.webpackImages({
	bank_presets_1: require("./images/data/bank/presets_1.data.png"),
	bank_presets_2: require("./images/data/bank/presets_2.data.png"),
});

// Construct preset images without Object.fromEntries

let preset_imgs = a1lib.webpackImages({
	preset_01: require("./images/data/buttons/preset_01.data.png"),
	preset_02: require("./images/data/buttons/preset_02.data.png"),
	preset_03: require("./images/data/buttons/preset_03.data.png"),
	preset_04: require("./images/data/buttons/preset_04.data.png"),
	preset_05: require("./images/data/buttons/preset_05.data.png"),
	preset_06: require("./images/data/buttons/preset_06.data.png"),
	preset_07: require("./images/data/buttons/preset_07.data.png"),
	preset_08: require("./images/data/buttons/preset_08.data.png"),
	preset_09: require("./images/data/buttons/preset_09.data.png"),
	preset_10: require("./images/data/buttons/preset_10.data.png"),
	preset_11: require("./images/data/buttons/preset_11.data.png"),
	preset_12: require("./images/data/buttons/preset_12.data.png"),
	preset_13: require("./images/data/buttons/preset_13.data.png"),
	preset_14: require("./images/data/buttons/preset_14.data.png"),
	preset_15: require("./images/data/buttons/preset_15.data.png"),
	preset_16: require("./images/data/buttons/preset_16.data.png"),
	preset_17: require("./images/data/buttons/preset_17.data.png"),
	preset_18: require("./images/data/buttons/preset_18.data.png")
});

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
	const defaultImage = await convertImageToBase64(DEFAULT_IMAGE_URL);
	for (let i = 1; i <= NUM_PRESETS; i++) {
		const preset = `preset-${String(i).padStart(2, '0')}`;
		if (!localStorage.getItem(preset)) {
			localStorage.setItem(preset, defaultImage);
		}
	}
}

function setupEventListeners() {
	document.getElementById("menubutton").addEventListener("click", () => {
		openSettings();
		console.log("Open Settings!");
	});
}

function loop() {
	const buffer = a1lib.captureHoldFullRs();
	checkForPresets(buffer, imgs.bank_presets_1);
	checkForPresets(buffer, imgs.bank_presets_2);
}

function checkForPresets(buffer: any, bankImage: any) {
	let pos = buffer.findSubimage(bankImage);
	if (pos && pos.length > 0) {
		for (let location of pos) for (let key in preset_imgs) {
			const presetImageData = localStorage.getItem(key.replace("_", "-")); // Load from base64 image in localStorage

			if (presetImageData) {
				const presetPos = buffer.findSubimage(preset_imgs[key], location.x, location.y, bankImage.width, bankImage.height);
				if (window.alt1 && alt1.permissionOverlay && presetPos && presetPos.length > 0) for (let match of presetPos) {

					const img = new Image();
					img.src = presetImageData; // Set the source to the base64 string
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

							const imageString = a1lib.encodeImageString(imageData);
							// Ensure the width in the overlay function is set to 30
							alt1.overLayImage(match.x, match.y, imageString, targetWidth, 100); // Use the scaled width
						}
					};

				}
			} else console.warn(`No image data found for [${key}]`);
		}
	}
}


function openSettings() {
	const left = window.screenX + (window.innerWidth / 2) - (DEFAULT_IMAGE_WIDTH / 2);
	const top = window.screenY + (window.innerHeight / 2) - (DEFAULT_IMAGE_HEIGHT / 2);

	const settingsWindow = window.open("./settings.html", "_blank", `width=${DEFAULT_IMAGE_WIDTH},height=${DEFAULT_IMAGE_HEIGHT},left=${left},top=${top}`);
	settingsWindow?.window.console.warn("Settings Loaded!");

	settingsWindow?.addEventListener('keyup', (e) => {
		if ((e.which || e.keyCode) === 116) {
			e.preventDefault(); // Prevent F5 key press from refreshing the page
		}
	});

	settingsWindow?.addEventListener('beforeunload', () => {
		console.warn("Settings Closed!");
		settingsWindow?.window.console.warn("Settings Saved!");
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
