//use rayon::prelude::*;
use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::path::Path;
use std::process::{Command, Stdio};
const JS_GRID_DATA: &str = r#"import gridVariables from '../scss/grid-variables.scss';

UX.grid = {};
Object.keys(gridVariables).map(key => {
    UX.grid[key] = parseInt(gridVariables[key], 10);
});
    "#;
const SCSS_GRID_DATA: &str = r#"
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
fn main() {
    let mut product_replace_values = HashMap::new();
    let products: Vec<String> = env::args().skip(1).collect();
    product_replace_values.insert(
        "../../ux3".to_string(),
        "../node_modules/ui-core".to_string(),
    );
    product_replace_values.insert(
        "../../utility".to_string(),
        "../node_modules/ui-core/utility".to_string(),
    );
    product_replace_values.insert(
        "../../plugins".to_string(),
        "../node_modules/ui-core/plugins".to_string(),
    );
    products.into_iter().for_each(|product| {
        println!(
            "-------------------------------------- Start: {} ------------------------------------",
            product
        );
        std::env::set_current_dir(&product).expect("");
        perform_replacement(&product_replace_values);
        update_variables();
        create_package_json(&product);
        std::env::set_current_dir("../").expect("");
        println!(
            "-------------------------------------- End: {} ------------------------------------",
            product
        );
    });
}
fn create_package_json(product_name: &str) {
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
  "dependencies": {{
    "ui-automation": "git+ssh://git@github.com/atypon/ui-automation.git#semver:*",
    "ui-core": "git+ssh://git@github.com/atypon/ui-core.git#semver:^1.0.0"
  }},
  "license": "UNLICENSED"
}}"#, product_name = product_name);
    let mut file = File::create("package.json").expect("");
    match file.write_all(package_json.as_bytes()) {
        Ok(_) => println!("package.json created!"),
        _ => {}
    }

    Command::new("yarn")
        .arg("install")
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("Failed to execute.");
}
fn update_variables() {
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(Path::new("variables/js/grid-variables.js"))
        .expect("");

    match file.write_all(JS_GRID_DATA.as_bytes()) {
        Ok(_) => println!("grid-variables.js updated!"),
        _ => {}
    }

    let mut file = OpenOptions::new()
        .write(true)
        .append(true)
        .open(Path::new("variables/scss/grid-variables.scss"))
        .expect("");

    match file.write_all(SCSS_GRID_DATA.as_bytes()) {
        Ok(_) => println!("grid-variables.scss updated!"),
        _ => {}
    }
}

fn perform_replacement(dic: &HashMap<String, String>) {
    dic.iter().for_each(|(k, v)| {
        dbg!(k, v);
        Command::new("ruplacer")
            .arg(k)
            .arg(v)
            .arg("--go")
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .output()
            .expect("");
    });
}
