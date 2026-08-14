// Fisher-Yates-Shuffle

function shuffle(array){
    let lastIndex = array.length - 1;
    while (lastIndex > 0) {
        let randIndex = Math.floor(Math.random() * (lastIndex + 1));

        let temp = array[lastIndex];
        array[lastIndex] = array[randIndex];
        array[randIndex] = temp;

        lastIndex --;
    }
}

let array = [1,2,3,4,5,6,7];

shuffle(array);

console.log(array);