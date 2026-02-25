/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			animation: {
				"loading-bar": "loading-bar 1.5s ease-in-out infinite",
			},
			keyframes: {
				"loading-bar": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(400%)" },
				},
			},
		},
	},
	plugins: [],
};
