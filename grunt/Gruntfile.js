module.exports = function(grunt) {
  var theme_name = 'bootstrap';

  var global_vars = {
    theme_name: theme_name,
    theme_path: '../assets/themes/' + theme_name,
    theme_css: '../assets/themes/' + theme_name + '/css',
    theme_scss: '../assets/themes/' + theme_name + '/resources/' + theme_name + '/scss'
  }

  grunt.initConfig({
    global_vars: global_vars,
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceComments: 'none',
          includePaths: ['<%= global_vars.theme_scss %>']
        },
        files: {
          '<%= global_vars.theme_css %>/kevinquillen.css': '<%= global_vars.theme_scss %>/styles.scss'
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
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['watch']);
}