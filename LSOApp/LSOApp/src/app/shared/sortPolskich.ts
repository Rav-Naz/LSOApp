 export function sortPolskich(a: string, b: string)
    {
        let search = ['ę','ó','ą','ś','Ś','ł','Ł','ż','Ż','ź','Ź','ń','Ń','ć','Ć','Ą','Ę','Ó']
        let replace = ['ezz','ozz','azz','szz','Szz','lzz','Lzz','zz_','Zz_','zzz','Zzz','nzz','Nzz','czz','Czz','Azz','Ezz','Ozz']
        for (let index = 0; index < 18; index++) {
           a = a.replace(search[index],replace[index]);
           b = b.replace(search[index],replace[index]);
        }
        let sort = [a,b];
        sort.sort();
        return (a===sort[0])? -1:1

    }
