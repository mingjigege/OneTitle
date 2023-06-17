


class Register{
        /**插件名 */
    static plugin_name;
        /**插件描述 */
    static plugin_discription;
    static plugin_version;
    static extra_information;
    static info(plugin_name,plugin_discription,plugin_version,extra_information){
        Register.plugin_name=plugin_name;
        Register.plugin_discription=plugin_discription;
        Register.plugin_version=plugin_version;
        Register.extra_information=extra_information;
    }
    static register(){
        const llversion = ll.requireVersion(2,9,2)?Register.plugin_version:Register.plugin_version.slice(0,3);
        ll.registerPlugin(
            Register.plugin_name,
            Register.plugin_discription, 
            llversion, 
            Register.extra_information);
    }
}
module.exports=Register;