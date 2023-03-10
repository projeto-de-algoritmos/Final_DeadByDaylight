module.exports = {
  important: true,
  prefix: '',
  content: [
    './src/**/*.{html,css,ts}',
    './index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: "#2D4369",
          500: "#071A3B",
        },
        secondary: "#C78A04"
      },
      spacing: {
        //'0.5': '0.1rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
        '136': '34rem',
        '144': '36rem',
        '152': '38rem',
        '160': '40rem'
      },
      backgroundImage: theme => ({
        'map': "url('src/assets/bg.jpeg')"
      }),
    },
  },
  plugins: [require('@tailwindcss/forms'),require('@tailwindcss/typography')],
};