

let DB={
    set:(key,val)=>{
        if (val==null){
            localStorage.removeItem(key);
        }
        else {
            localStorage.setItem(key,JSON.stringify(val));
        }
    }
    ,
    get:(key)=>{
        let val=localStorage.getItem(key);
        if (val!=null) { return JSON.parse(val);}
        return null;
    }
}