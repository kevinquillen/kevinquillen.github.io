module.exports = function(grunt) {
  var global_vars = {
    theme_css: '../assets/css',
    theme_scss: '../assets/scss'
  }

  grunt.initConfig({
    global_vars: global_vars,
    pkg: grunt.file.readJSON('package.json'),

    jekyll: {
      options: {
        src: '../',
        watch: true,
        serve: true
      },

      dist: {
        options: {
          dest: '../_site',
          config: '../_config.yml'
        }
      }
    },

    sass: {
      dist: {
        options: {
          outputStyle: 'compressed',
          includePaths: ['<%= global_vars.theme_scss %>']
        },
        files: {
          '<%= global_vars.theme_css %>/style.css': '<%= global_vars.theme_scss %>/style.scss',
          '<%= global_vars.theme_css %>/prism.css': '<%= global_vars.theme_scss %>/prism.scss'
        }
      }
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: '<%= global_vars.theme_scss %>/**/*.scss',
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['watch']);
}