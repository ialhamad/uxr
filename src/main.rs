use std::env;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::path::Path;
use std::process::{Command, Stdio};
fn main() -> std::io::Result<()> {
    let js_grid_data = r#"import gridVariables from '../scss/grid-variables.scss';

UX.grid = {};
Object.keys(gridVariables).map(key => {
    UX.grid[key] = parseInt(gridVariables[key], 10);
});
"#;
    let scss_grid_data = r#"
:export {
    screenXs: $screen-xs;
    screenSm: $screen-sm;
    screenMd: $screen-md;
    screenLg: $screen-lg;
    screenXlg: $screen-xlg;
    containerMobile: $container-mobile;
    containerXs: $container-xs;
    containerTablet: $container-tablet;
    containerSm: $container-sm;
    containerDesktop: $container-desktop;
    containerMd: $container-md;
    containerLargeDesktop: $container-large-desktop;
    containerLg: $container-lg;
}
"#;
    for arg in env::args().skip(1) {
        let package_json = format!(r#"
    {{
      "name": "{product_name}",
      "version": "1.0.0",
      "description": "{product_name}",
      "main": "index.js",
      "scripts": {{
        "test": "echo \"Error: no test specified\" && exit 1",
        "install": "if [ -f node_modules/ui-automation/npm-hooks/install-uptodate.sh ]; then ./node_modules/ui-automation/npm-hooks/install-uptodate.sh; fi",
        "build": "webpack"
      }},

      "license": "UNLICENSED"
    }}"#, product_name = arg);

        std::env::set_current_dir(&arg).expect("");

        let mut file = File::create("package.json")?;
        match file.write_all(package_json.as_bytes()) {
            Ok(_) => println!("package.json is created!"),
            _ => {}
        }

        Command::new("yarn")
            .arg("install")
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()
            .expect("Failed to execute.");

        let mut file = OpenOptions::new()
            .write(true)
            .truncate(true)
            .open(Path::new("variables/js/grid-variables.js"))?;
        file.write_all(js_grid_data.as_bytes())?;

        match file.write_all(js_grid_data.as_bytes()) {
            Ok(_) => println!("grid-variables.js updated!"),
            _ => {}
        }

        let mut file = OpenOptions::new()
            .write(true)
            .append(true)
            .open(Path::new("./variables/scss/grid-variables.scss"))?;

        match file.write_all(scss_grid_data.as_bytes()) {
            Ok(_) => println!("grid-variables.scss updated!"),
            _ => {}
        }

        std::env::set_current_dir("../").expect("");
    }
    Ok(())
}
