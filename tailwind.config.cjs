/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Statementwise.ai design tokens
        "deep-navy": "#050B14",
        "midnight": "#0B1628",
        "navy": "#162544",
        "slate-blue": "#1E3260",
        "electric-blue": "#4B82FF",
        "bright-blue": "#78A4FF",
        "soft-blue": "#B0CCFF",
        "cobalt-glow": "rgba(75, 130, 255, 0.15)",
        success: {
          DEFAULT: "#00D68F",
          dim: "rgba(0, 214, 143, 0.12)",
        },
        warning: {
          DEFAULT: "#FFB020",
          dim: "rgba(255, 176, 32, 0.12)",
        },
        error: {
          DEFAULT: "#FF4D6A",
          dim: "rgba(255, 77, 106, 0.12)",
        },
        "text-primary": "#E8EEF7",
        "text-secondary": "#8BA3C7",
        "text-tertiary": "#4A6180",
        "text-inverse": "#0B1628",
        "border-subtle": "rgba(22, 37, 68, 0.5)",
        "border-hover": "#1E3260",
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "hero-card": "0 32px 80px rgba(0,0,0,0.5)",
        "feature-glow": "0 0 40px rgba(75,130,255,0.08)",
        "pro-glow": "0 0 60px rgba(75,130,255,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(75,130,255,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(75,130,255,0.4)" },
        },
        "aurora-drift": {
          "0%": { transform: "translateX(-10%) translateY(-5%)" },
          "50%": { transform: "translateX(10%) translateY(5%)" },
          "100%": { transform: "translateX(-10%) translateY(-5%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        marquee: "marquee 60s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "aurora-drift": "aurora-drift 20s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
