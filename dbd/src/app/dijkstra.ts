import { Casa } from "src/interfaces/casa.interface";
import { No } from "src/interfaces/no.interface";

interface NoCasa {
  casa1: Casa;
  casa2: Casa;
}


export class Dijkstra {
  private grafo: Map<Casa, Map<Casa, number>> = new Map();

  distancias: No[] = [];
  anterior: NoCasa[] = [];

  addEdge(de: Casa, para: Casa, peso: number): void {
    let edges = this.grafo.get(de);
    if (!edges) {
      edges = new Map();
      this.grafo.set(de, edges);
    }
    edges.set(para, peso);
  }

  ehIgual(casa1: Casa, casa2: Casa){
    return casa1.l==casa2.l && casa1.c==casa2.c;
  }

  getNode(casa: Casa){

    let casaEncontrada = this.distancias.find(node => this.ehIgual(node.casa, casa));

    return casaEncontrada?.peso;
  }

  getNodeAnterior(atual: Casa){
    return this.anterior.find(node => this.ehIgual(node.casa1, atual))?.casa2;
  }

  addDistancia(casa: Casa, value: number){
    this.distancias.push({casa: casa, peso: value})
  }

  setDistancia(casa: Casa, value: number){

    let casaEncontrada = this.distancias.find(node => this.ehIgual(node.casa, casa));

    this.distancias[this.distancias.indexOf(casaEncontrada!)].peso = value;
  }

  addAnterior(casa: Casa, value: Casa){
    this.anterior.push({casa1: casa, casa2: value})
  }

  setAnterior(casa: Casa, value: Casa){

    let casaEncontrada = this.anterior.find(node => this.ehIgual(node.casa1, casa));

    if(!casaEncontrada)
      this.addAnterior(casa, value);
    else
      this.anterior[this.anterior.indexOf(casaEncontrada!)].casa1 = value;
  }

  setNodeCasa(node: Map<Casa, Casa>, casa: Casa, value: Casa){
    let casaEncontrada;

    node.forEach((valor, casaNode)=>{
        if(this.ehIgual(casaNode, casa)){
            casaEncontrada = casaNode;
            return;
        }
    })

    if(casaEncontrada){
        node.set(casaEncontrada, value)!;
    }
  }

  foiVisitado(visitados: Casa[], casa: Casa){
    return visitados.some(visitado => visitado.l == casa.l && visitado.c == casa.c);
  }

  addVisitado(visitados: Casa[], casa: Casa){
    let newVisitados = visitados;
    newVisitados.push({l:casa.l, c:casa.c})
    return newVisitados;
  }

  menorCaminho(inicio: Casa, fim: Casa): Casa[] | undefined {
    this.distancias = [];
    this.anterior=[];
    let visitados: Casa[] = [];
    const nodes = Array.from(this.grafo.keys());

    for (const node of nodes) {
        if(this.ehIgual(node, inicio)){
          this.addDistancia(node, 0);
        }
        else
          this.addDistancia(node, Infinity);
    }
    //distancias.set(inicio, 0);
    let i=0;
    while (nodes.length) {
        if(i==1){
           // console.log(visitados);
            //console.log(nodes);
            
        }
        nodes.sort((a, b) =>{ 
            return this.getNode(a)! - this.getNode(b)!
        });
        const menor = nodes.shift();

        if (!menor) {
            break;
        }
        
        const edges = this.grafo.get(menor);
        if (!edges) {
          continue;
        }

        visitados.push(menor);
        
      
        for (const [node, peso] of edges.entries()) {
          //console.log('for2');
          if (this.foiVisitado(visitados, node)) {
            /*console.log("continuou para o node");
            console.log(node);*/
            
            continue;
          }
          
          const dist = this.getNode(menor)! + peso;
          //console.log(menor, dist);
          
          const distOfNode = this.getNode(node)!;
          //if(distOfNode!=Infinity)
            //console.log(node,distOfNode);
          
          if (dist < distOfNode) {
            this.setDistancia(node, dist);
            this.setAnterior(node, menor);
          }
        }
      }

    if (this.getNode(fim)! === Infinity) {
      return undefined;
    }

    const caminho = [fim];
    let atual = fim;
    while (!this.ehIgual(atual, inicio)) {
        //console.log(atual, inicio);

        atual = this.getNodeAnterior(atual)!;
        caminho.unshift(atual);
    }

    return caminho;
    }
}