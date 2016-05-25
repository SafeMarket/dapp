module.exports = function(grunt){
	grunt.registerTask('index',function(){
		var indexTemplate = grunt.file.read('index.template.html')
			,html = {}
			,geth = grunt.file.readYAML('config/geth.yml')
			,imgSrcs = {'safe':"'self'",'unsafe':'*'}
			,envs = ['development','production']

		envs.forEach(function(env){
			Object.keys(imgSrcs).forEach(function(safety){
				var html = indexTemplate
						.replace('[rpcaddr]',geth[env].rpcaddr)
						.replace('[rpcport]',geth[env].rpcport)
						.replace('[imgsrc]',imgSrcs[safety])
					,suffix = safety === 'safe' ? '':'.unsafe'
					,file = 'generated/dapp/'+env+'/index'+suffix+'.html'

				grunt.file.write(file,html)
				grunt.log.success('Wrote',file)
			})
		})
	})
}
