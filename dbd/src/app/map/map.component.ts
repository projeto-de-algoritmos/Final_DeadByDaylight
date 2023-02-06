import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LinkedList } from '../lista';
import { HostListener } from '@angular/core';
import { Casa } from 'src/interfaces/casa.interface';
import { No } from 'src/interfaces/no.interface';
import { Palet } from 'src/interfaces/palet.interface';
import { Aresta } from 'src/interfaces/aresta.interface';

interface S {
  de: Casa,
  para: Casa,
  custo: number
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild('audio', { static: false }) audio!: ElementRef;

  listas: LinkedList<No>[] = [];

  todos_os_lados: Casa[] = []
  direita_cima_esquerda: Casa[] = []
  direita_baixo_esquerda: Casa[] = []
  cima_baixo_esquerda: Casa[] = []
  cima_baixo_direita: Casa[] = []
  direita_esquerda: Casa[] = []
  direita_cima: Casa[] = []
  direita_baixo: Casa[] = []
  cima_esquerda: Casa[] = []
  cima_baixo: Casa[] = []
  esquerda_baixo: Casa[] = []
  direita: Casa[] = []
  cima: Casa[] = []
  baixo: Casa[] = []
  esquerda: Casa[] = []

  pesoJanela: number = 5;
  pesoPalet: number = 15;

  white: Casa[] = [];
  windows: Casa[] = [
    {l:3,c:8},
    {l:4,c:19},
    {l:8,c:17},
    {l:10,c:15},
    {l:12,c:5},
    {l:18,c:15},
    {l:22,c:9},
  ];
  generators: Casa[] = [
    {l:3,c:3},
    {l:3,c:25},
    {l:16,c:16},
    {l:22,c:2},
    {l:28,c:25}
  ];
  palets: Palet[] = [
    {casa: {l:2,c:21}, aberta: true},
    {casa: {l:6,c:25}, aberta: true},
    {casa: {l:11,c:18}, aberta: true},
    {casa: {l:12,c:1}, aberta: true},
    {casa: {l:12,c:27}, aberta: true},
    {casa: {l:15,c:19}, aberta: true},
    {casa: {l:17,c:10}, aberta: true},
    {casa: {l:18,c:24}, aberta: true},
    {casa: {l:20,c:1}, aberta: true},
  ];
  start: Casa[] = [
    {l:5,c:5},
    {l:5,c:23},
    {l:23,c:5},
    {l:23,c:23},
  ]
  generatorsProgress = [0,0,0,0,0];

  playerPosition: Casa = {} as Casa;
  isPlayer: boolean = false;
  isInjuredPlayer: boolean = false;
  isDeadPlayer: boolean = false;
  killerPosition: Casa = {} as Casa;
  isKiller: boolean = false;
  direcao: string = 'L';
  visibleKiller: boolean = true;
  visibleRange = 10;

  s: Casa[] = [];
  arestas: Aresta[] = [];

  lastKey = '';
  lastTimeStamp:number = 0;
  positionStartingGenerator: Casa | null = null;

  started: boolean = false;
  finished: boolean = false;
  win: boolean = false;

  chaseSong = false;
  generatorSong = false;
  finishedGeneratorSong = false;
  audioChase = new Audio();
  audioHeart = new Audio();
  audioGenerator = new Audio();
  audioFinishedGenerator = new Audio();
  audioGateway = new Audio();

  constructor() { }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    let key = event.key;

    if(event.timeStamp-this.lastTimeStamp>200){
      this.lastTimeStamp = event.timeStamp;
      
      if(this.hasPalet()!='emCima'){
        if(key=='w'){
          this.direcao='N';
        }
        if(key=='a'){
          this.direcao='O';
        }
        if(key=='s'){
          this.direcao='S';
        }
        if(key=='d'){
          this.direcao='L';
        }
      }
    }

    if(key=='w' || key=='a' || key=='s' || key=='d'){
      this.stopGeneratorSong();
    }

    if(key=='e' && this.lastKey != 'e' && this.positionStartingGenerator==null){

      this.positionStartingGenerator = this.playerPosition;
      this.acao();
    }

    this.lastKey = key;
  }

  ngOnInit(): void {
    this.mapInit();
    this.startPositions();
    this.gridInit();
    this.graphInit();
    if(this.playerPosition.l==5) this.direcao = "L";
    else this.direcao = "N";

    this.loadSongs();

  }

  loadSongs(){
    this.audioChase.src = "../../assets/ChaseMusic_Theme03.ogg"
    this.audioHeart.src = "../../assets/heartbeat.mp3"
    this.audioGenerator.src = "../../assets/generator.mp3"
    this.audioFinishedGenerator.src = "../../assets/repaired_generator.mp3"
    this.audioGateway.src = "../../assets/gateway.mp3"
    this.audioChase.load();
    this.audioHeart.load();
    this.audioGenerator.load();
    this.audioFinishedGenerator.load();
    this.audioGateway.load();
  }

  playChaseSong() {
    if(!this.chaseSong){
      this.chaseSong = true;
      
      this.audioChase.loop = true;
      this.audioHeart.loop = true;
      this.audioChase.volume = 0.1;
      this.audioHeart.volume = 0.5;
      this.audioChase.currentTime = 0;
      this.audioChase.play();
      this.audioHeart.play();
    }
  }

  stopChaseSong(){
    this.chaseSong = false;
    this.audioChase.pause();
    this.audioHeart.pause();
  }

  playGeneratorSong(){
    if(!this.generatorSong){
      this.generatorSong = true;
      this.finishedGeneratorSong = false;

      this.audioGenerator.volume = 1;
      this.audioGenerator.loop = true;
      this.audioGenerator.play();
    }
  }

  stopGeneratorSong(){
    this.generatorSong = false;
    
    this.audioGenerator.pause();
  }

  playFinishedGeneratorSong(){
    if(!this.finishedGeneratorSong){
      this.finishedGeneratorSong = true;

      this.audioFinishedGenerator.volume = 1;
      this.audioFinishedGenerator.play();
    }
  }

  playGatewaySong(){
    this.audioFinishedGenerator.volume = 1;
    this.audioGateway.play();
  }

  stopAllSongs(){
    this.stopChaseSong();
    this.stopGeneratorSong();
  }

  startGame(){
    this.started = true;
    this.survivorMoviment();
    this.killerMoviment();
  }

  restartGame(){
    location.reload();
  }

  acao(){
    let palet = this.hasPalet();
    let generator = this.hasGenerator();

    if(palet){
      this.palets.forEach(p=>{
        if(p==palet){
          this.linkPalets(p.casa);
          p.aberta = false;
        }
      })
    }
    if(generator){
      this.generators.forEach((g, i)=>{
        if(g==generator) {
          this.generatorProgress(i);
        }
      })
    }
  }

  hasPalet():any{
    let mesmaLinha = this.palets.filter(a=>a.aberta==true).filter(a=>a.casa.l==this.playerPosition.l).find(a=>
      a.casa.c == this.playerPosition.c-1 || a.casa.c == this.playerPosition.c+1);
    let mesmaColuna = this.palets.filter(a=>a.aberta==true).filter(a=>a.casa.c==this.playerPosition.c).find(a=>
      a.casa.l == this.playerPosition.l-1 || a.casa.l == this.playerPosition.l+1);

    let emCima = this.palets.filter(a=>a.aberta==false).filter(a=>a.casa.l==this.playerPosition.l).find(a=>
      a.casa.c == this.playerPosition.c || a.casa.c == this.playerPosition.c);

    if(mesmaLinha !== undefined) return mesmaLinha;
    else if (mesmaColuna !== undefined) return mesmaColuna;
    else if (emCima) return 'emCima';
      
    return false;
  }

  hasGenerator():any{
    let mesmaLinha = this.generators.filter(a=>a.l==this.playerPosition.l).find(a=>
      a.c==this.playerPosition.c-1 || a.c==this.playerPosition.c+1);
    let mesmaColuna = this.generators.filter(a=>a.c==this.playerPosition.c).find(a=>
      a.l==this.playerPosition.l-1 || a.l==this.playerPosition.l+1);

    if(mesmaLinha !== undefined) return mesmaLinha;
    else if (mesmaColuna !== undefined) return mesmaColuna;

    return false;
  }

  generatorProgress(generator:any){
    setTimeout(()=>{
      if(this.hasGenerator()){
        if(this.generatorsProgress[generator]<10){
          this.generatorsProgress[generator]++;
          this.playGeneratorSong();
        }
        if(this.generatorsProgress[generator]==10){
          this.stopGeneratorSong();
          this.playFinishedGeneratorSong();
        }
        this.generatorProgress(generator);
      }
    }, 1000);
    if(this.generatorsProgress.filter(a=>a==10).length==5){
      this.white.push({l:28,c:15})
      this.playGatewaySong();
    }
  }

  survivorMoviment(){

    setTimeout(()=>{
      if(this.direcao=='L'){
        if(this.hasPosition(this.white, this.playerPosition.l, this.playerPosition.c+1))
          this.playerPosition.c++;
        else if(this.hasPosition(this.windows, this.playerPosition.l, this.playerPosition.c+1))
          this.playerPosition.c++;
        
      }
      if(this.direcao=='O'){
        if(this.hasPosition(this.white, this.playerPosition.l, this.playerPosition.c-1))
          this.playerPosition.c--;
        else if(this.hasPosition(this.windows, this.playerPosition.l, this.playerPosition.c-1))
          this.playerPosition.c--;
        
      }
      if(this.direcao=='N'){
        if(this.hasPosition(this.white, this.playerPosition.l-1, this.playerPosition.c))
          this.playerPosition.l--;
        else if(this.hasPosition(this.windows, this.playerPosition.l-1, this.playerPosition.c))
          this.playerPosition.l--;
        
      }
      if(this.direcao=='S'){
        if(this.hasPosition(this.white, this.playerPosition.l+1, this.playerPosition.c))
          this.playerPosition.l++;
        else if(this.hasPosition(this.windows, this.playerPosition.l+1, this.playerPosition.c))
          this.playerPosition.l++;
        
      }
      
      if(this.playerPosition.l==28 && this.playerPosition.c==15){
        this.win = true;
        this.finished = true;
        this.stopAllSongs();
      }

      if(!this.hasGenerator()){
        this.positionStartingGenerator = null;
      }
      
      if(!this.finished)
        this.survivorMoviment();
    }, 250);
  }

  killerMoviment(){
    let l = this.killerPosition.l;
    let c = this.killerPosition.c;
    setTimeout(()=>{
      if(!this.visibleKiller){
        if(this.hasPosition(this.todos_os_lados, l, c)){
          let index = Math.floor(Math.random() * 4);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.l++;
          if(index==2) this.killerPosition.c--;
          if(index==3) this.killerPosition.c++;
        }
        if(this.hasPosition(this.direita_cima_esquerda, l, c)){
          let index = Math.floor(Math.random() * 3);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.c++;
          if(index==2) this.killerPosition.c--;
        }
        if(this.hasPosition(this.direita_baixo_esquerda, l, c)){
          let index = Math.floor(Math.random() * 3);
          if(index==0) this.killerPosition.l++;
          if(index==1) this.killerPosition.c++;
          if(index==2) this.killerPosition.c--;
        }
        if(this.hasPosition(this.cima_baixo_direita, l, c)){
          let index = Math.floor(Math.random() * 3);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.l++;
          if(index==2) this.killerPosition.c++;
        }
        if(this.hasPosition(this.cima_baixo_esquerda, l, c)){
          let index = Math.floor(Math.random() * 3);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.l++;
          if(index==2) this.killerPosition.c--;
        }
        if(this.hasPosition(this.direita_esquerda, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.c++;
          if(index==1) this.killerPosition.c--;
        }
        if(this.hasPosition(this.direita_cima, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.c++;
          if(index==1) this.killerPosition.l--;
        }
        if(this.hasPosition(this.direita_baixo, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.c++;
          if(index==1) this.killerPosition.l++;
        }
        if(this.hasPosition(this.cima_esquerda, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.c--;
        }
        if(this.hasPosition(this.cima_baixo, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.l--;
          if(index==1) this.killerPosition.l++;
        }
        if(this.hasPosition(this.esquerda_baixo, l, c)){
          let index = Math.floor(Math.random() * 2);
          if(index==0) this.killerPosition.c--;
          if(index==1) this.killerPosition.l++;
        }
        if(this.hasPosition(this.direita, l, c)){
          this.killerPosition.c++;
        }
        if(this.hasPosition(this.cima, l, c)){
          this.killerPosition.l--;
        }
        if(this.hasPosition(this.baixo, l, c)){
          this.killerPosition.l++;
        }
        if(this.hasPosition(this.esquerda, l, c)){
          this.killerPosition.c--;
        } 
      }

      if( Math.abs(this.killerPosition.l-this.playerPosition.l)<this.visibleRange &&
          Math.abs(this.killerPosition.c-this.playerPosition.c)<this.visibleRange){
            
            this.visibleKiller = true;
            this.playChaseSong();
          }
      else {
        this.stopChaseSong();
        this.visibleKiller = false;
      }
          
      let lp = this.playerPosition.l;
      let lc = this.playerPosition.c;
      if(l == lp && c == lc){
          this.visibleKiller = false;
          if(!this.isInjuredPlayer)
            this.isInjuredPlayer = true;
          else{
            this.isDeadPlayer = true;
            this.finished = true;
            this.visibleKiller = true;
            this.stopAllSongs();
          }
          if(lp<14) this.killerPosition.l = 23;
          else this.killerPosition.l = 5;
          if(lc<14) this.killerPosition.c = 23;
          else this.killerPosition.c = 5;
        } 

      if(!this.finished)
        this.killerMoviment();
    }, 200);
  }

  hasPosition(array: Casa[], l:number, c:number):boolean {
    if(array.find(a=>a.l==l && a.c==c)!== undefined)
      return true
    return false
  }

  hasCharacter(l:number, c: number): boolean{
    if(this.killerPosition.l==l && this.killerPosition.c==c){
      this.isPlayer = false;
      this.isKiller = true;
      if(!this.visibleKiller) return false
      return true;
    };
    if(this.playerPosition.l==l && this.playerPosition.c==c){
      this.isPlayer = true;
      this.isKiller = false;
      return true;
    };
    this.isPlayer = false;
    this.isKiller = false;
    return false;
  }

  startPositions(){
    let index = Math.floor(Math.random() * 4)
    this.playerPosition = this.start[index]

    if(this.playerPosition.l == 5) this.killerPosition.l = 23;
    else this.killerPosition.l = 5;
    if(this.playerPosition.c == 5) this.killerPosition.c = 23;
    else this.killerPosition.c = 5;
  }

  getColor(l:number, c: number){

    if(this.palets.find(a=>a.casa.l==l && a.casa.c==c)!== undefined){
      if(this.palets.find(a=>a.casa.l==l && a.casa.c==c)?.aberta == true)
        return 'bg-red-300';
      else 
        return 'bg-red-500';
    }

    if(this.white.find(a=>a.l==l && a.c==c)!== undefined)
      return 'bg-white'

    if(this.windows.find(a=>a.l==l && a.c==c)!== undefined)
      return 'bg-blue-500'
    
    if(this.generators.find(a=>a.l==l && a.c==c)!== undefined){
      let generator = this.generators.find(a=>a.l==l && a.c==c)!;
      if(this.generatorsProgress[this.generators.indexOf(generator)]==10)
        return 'bg-gray-500'
      else 
        return 'bg-yellow-500'
    }

    if(l==28 && c==15){
      return 'bg-green-500'
    }

    return 'bg-black';
  }

  getVisible(){
    if(this.isKiller && !this.visibleKiller)
      return false;
    return true;
  }

  getImage(){
    if(this.isPlayer){
      if(this.isDeadPlayer) return '../../assets/dead_survivor.png';
      else if(this.win) return '../../assets/escaped_survivor.png';
      else if(this.isInjuredPlayer) return '../../assets/injured_survivor.png';
      else return '../../assets/survivor.png';
    }
    return '../../assets/killer.jpeg'
  }

  linkPalets(casa:Casa){
    let i = casa.l;
    let j = casa.c;
    let index = parseInt(`${i}${j}`);
    if(this.hasPosition(this.white, i-1, j)){
      this.listas[index] = new LinkedList<No>();
      this.listas[index].push({casa:{l:i-1, c:j}, peso:this.pesoPalet})
      this.listas[index].push({casa:{l:i+1, c:j}, peso:this.pesoPalet})

      index = parseInt(`${i-1}${j}`)
      this.linkAdjacentPalet(index, i, j);

      index = parseInt(`${i+1}${j}`);
      this.linkAdjacentPalet(index, i, j)
    }
    if(this.hasPosition(this.white, i, j-1)){
      this.listas[index] = new LinkedList<No>();
      this.listas[index].push({casa:{l:i, c:j-1}, peso:this.pesoPalet})
      this.listas[index].push({casa:{l:i, c:j+1}, peso:this.pesoPalet})

      index = parseInt(`${i}${j-1}`)
      this.linkAdjacentPalet(index, i, j);

      index = parseInt(`${i}${j+1}`);
      this.linkAdjacentPalet(index, i, j)
    }
  }

  linkAdjacentPalet(index:number, i:number, j:number){
    let nodeAux = this.listas[index].start;
    let end = false;
    while(!end) {
      if(nodeAux.value.casa.l==i && nodeAux.value.casa.c==j){
        nodeAux.value.peso = this.pesoPalet;
      }
      if (nodeAux.prox !== null) {
        nodeAux = nodeAux.prox;
      } else {
        end = true;
      }
    }
  }

  graphInit(){
    for(let i=0; i<29; i++){
      for(let j=0; j<29; j++){
        let index = parseInt(`${i}${j}`)

        this.listas[index] = new LinkedList<No>();
        if(this.hasPosition(this.todos_os_lados, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
        }
        if(this.hasPosition(this.direita_cima_esquerda, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
        if(this.hasPosition(this.direita_baixo_esquerda, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
        if(this.hasPosition(this.cima_baixo_esquerda, i, j)){
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
        if(this.hasPosition(this.cima_baixo_direita, i, j)){
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
        }
        if(this.hasPosition(this.direita_esquerda, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
        if(this.hasPosition(this.direita_cima, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
        }
        if(this.hasPosition(this.direita_baixo, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
        }
        if(this.hasPosition(this.cima_esquerda, i, j)){
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
        if(this.hasPosition(this.cima_baixo, i, j)){
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
        }
        if(this.hasPosition(this.esquerda_baixo, i, j)){
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
        }
        if(this.hasPosition(this.direita, i, j)){
          this.listas[index].push({casa:{l:i, c:j+1}, peso:1})
        }
        if(this.hasPosition(this.cima, i, j)){
          this.listas[index].push({casa:{l:i-1, c:j}, peso:1})
        }
        if(this.hasPosition(this.baixo, i, j)){
          this.listas[index].push({casa:{l:i+1, c:j}, peso:1})
        }
        if(this.hasPosition(this.esquerda, i, j)){
          this.listas[index].push({casa:{l:i, c:j-1}, peso:1})
        }
      }
    }
    this.windowsInit();

  }

  windowsInit(){
    this.windows.forEach(window=>{
      let i = window.l;
      let j = window.c;
      let index = parseInt(`${i}${j}`)
      if(this.hasPosition(this.white, i-1, j)){
        this.listas[index].push({casa:{l:i-1, c:j}, peso:this.pesoJanela})
        this.listas[index].push({casa:{l:i+1, c:j}, peso:this.pesoJanela})
        index = parseInt(`${i-1}${j}`);
        this.listas[index].push({casa:{l:i, c:j}, peso:this.pesoJanela})
        index = parseInt(`${i+1}${j}`);
        this.listas[index].push({casa:{l:i, c:j}, peso:this.pesoJanela})
      }
      if(this.hasPosition(this.white, i, j-1)){
        this.listas[index].push({casa:{l:i, c:j-1}, peso:this.pesoJanela})
        this.listas[index].push({casa:{l:i, c:j+1}, peso:this.pesoJanela})
        index = parseInt(`${i}${j-1}`);
        this.listas[index].push({casa:{l:i, c:j}, peso:this.pesoJanela})
        index = parseInt(`${i}${j+1}`);
        this.listas[index].push({casa:{l:i, c:j}, peso:this.pesoJanela})
      }
    })
  }

  gridInit(){
    this.white.forEach(casa=>{
      if( this.hasPosition(this.white, casa.l-1, casa.c) && 
          this.hasPosition(this.white, casa.l, casa.c-1) &&
          this.hasPosition(this.white, casa.l+1, casa.c) &&
          this.hasPosition(this.white, casa.l, casa.c+1))
            this.todos_os_lados.push(casa);

      else if(this.hasPosition(this.white, casa.l-1, casa.c) && 
              this.hasPosition(this.white, casa.l, casa.c-1) &&
              this.hasPosition(this.white, casa.l, casa.c+1))
                this.direita_cima_esquerda.push(casa);

      else if(this.hasPosition(this.white, casa.l+1, casa.c) && 
              this.hasPosition(this.white, casa.l, casa.c-1) &&
              this.hasPosition(this.white, casa.l, casa.c+1))
                this.direita_baixo_esquerda.push(casa);

      else if(this.hasPosition(this.white, casa.l-1, casa.c) && 
              this.hasPosition(this.white, casa.l+1, casa.c) &&
              this.hasPosition(this.white, casa.l, casa.c-1))
                this.cima_baixo_esquerda.push(casa);

      else if(this.hasPosition(this.white, casa.l-1, casa.c) && 
              this.hasPosition(this.white, casa.l+1, casa.c) &&
              this.hasPosition(this.white, casa.l, casa.c+1))
                this.cima_baixo_direita.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c+1) && 
              this.hasPosition(this.white, casa.l, casa.c-1))
                this.direita_esquerda.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c+1) && 
              this.hasPosition(this.white, casa.l-1, casa.c))
                this.direita_cima.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c+1) && 
              this.hasPosition(this.white, casa.l+1, casa.c))
                this.direita_baixo.push(casa);

      else if(this.hasPosition(this.white, casa.l-1, casa.c) && 
              this.hasPosition(this.white, casa.l, casa.c-1))
                this.cima_esquerda.push(casa);
                
      else if(this.hasPosition(this.white, casa.l-1, casa.c) && 
              this.hasPosition(this.white, casa.l+1, casa.c))
                this.cima_baixo.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c-1) && 
              this.hasPosition(this.white, casa.l+1, casa.c))
                this.esquerda_baixo.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c+1))
              this.direita.push(casa);

      else if(this.hasPosition(this.white, casa.l-1, casa.c))
              this.cima.push(casa);

      else if(this.hasPosition(this.white, casa.l+1, casa.c))
              this.baixo.push(casa);

      else if(this.hasPosition(this.white, casa.l, casa.c-1))
              this.esquerda.push(casa);
      
    })
  }

  mapInit(){
    let coluna = [];
    for(let i=1; i<28; i++){
      if(i!=8 && i!=14 && i!=22)
        this.white.push({l:1,c:i})
    }
    coluna = [1,5,9,13,17,21,23,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:2,c:i})
    }
    coluna = [1,4,5,6,7,9,11,12,13,14,15,16,17,19,20,21,22,23,24,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:3,c:i})
    }
    coluna = [1,9,15,17,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:4,c:i})
    }
    coluna = [1,2,3,4,5,6,7,8,9,11,12,13,15,17,18,19,20,21,22,23,24,25,26,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:5,c:i})
    }
    coluna = [1,3,7,11,15,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:6,c:i})
    }
    coluna = [1,3,5,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:7,c:i})
    }
    coluna = [1,3,5,7,19,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:8,c:i})
    }
    coluna = [1,3,5,7,9,10,11,12,13,14,15,17,18,19,21,22,23,24,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:9,c:i})
    }
    coluna = [1,3,5,7,9,19,21,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:10,c:i})
    }
    coluna = [1,3,5,7,9,11,12,13,14,15,16,17,18,19,20,21,23,24,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:11,c:i})
    }
    coluna = [1,3,7,9,11,17,19,21,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:12,c:i})
    }
    coluna = [1,3,4,5,7,9,11,17,19,21,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:13,c:i})
    }
    coluna = [1,3,5,7,9,11,17,19,21,22,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:14,c:i})
    }
    coluna = [1,3,5,7,9,11,17,19,21,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:15,c:i})
    }
    coluna = [1,3,5,7,9,11,17,19,21,22,23,24,25,26,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:16,c:i})
    }
    coluna = [1,3,4,5,6,7,9,10,11,12,13,14,15,16,17,19,21,23,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:17,c:i})
    }
    coluna = [1,5,9,19,21,23,24,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:18,c:i})
    }
    coluna = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:19,c:i})
    }
    coluna = [1,13,21,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:20,c:i})
    }
    coluna = [1,2,3,5,6,7,8,9,10,11,13,14,15,17,18,19,20,21,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:21,c:i})
    }
    coluna = [3,5,11,13,15,17,23,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:22,c:i})
    }
    coluna = [1,2,3,5,7,8,9,11,12,13,15,17,18,19,20,21,23,25,26,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:23,c:i})
    }
    coluna = [1,3,5,7,9,15,21,23,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:24,c:i})
    }
    coluna = [1,3,4,5,7,9,10,11,12,13,15,17,18,19,20,21,23,24,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:25,c:i})
    }
    coluna = [1,7,11,15,17,25,27]
    for(let i=1; i<28; i++){
      if(coluna.includes(i))
        this.white.push({l:26,c:i})
    }
    for(let i=1; i<28; i++){
      this.white.push({l:27,c:i})
    }
  }
  
}
