# Viv0605101/anlp-a3-gnn

## Resumen

`Viv0605101/anlp-a3-gnn` no es un modelo de lenguaje, sino una coleccion de checkpoints de PyTorch que contienen los pesos de varias redes neuronales de grafos (GNN) entrenadas para la deteccion de noticias falsas sobre el conjunto de datos UPFD (GossipCop). El autor, Viv0605101 (Vidvathama R), los publica como parte de la asignacion 3 de la parte B de un curso de NLP avanzado (ANLP), con el objetivo de que sean reproducibles y evaluables.

Cada checkpoint corresponde a una combinacion concreta de arquitectura (MLP sobre el nodo raiz, GCN, GraphSAGE, GAT, BiGCN de Chen et al. 2021 y Bi-GCN TD/BU de Bian et al. 2020), tipo de caracteristicas (bert, profile, spacy, content) y semilla (0-4). Se guarda el estado del modelo en la epoch con mejor macro-F1 de validacion, de modo que el repositorio sirve como material de referencia para comparar el rendimiento de distintas GNN en una tarea de clasificacion binaria de propagacion de noticias.

El interes practico es limitado fuera del ambito academico: no hay pipeline declarado, no se documentan idiomas ni una API de inferencia, y el uso requiere reconstruir la arquitectura con el codigo fuente del autor (`src.part2.models.build_model`) y cargar el `state_dict`. Aun asi, los resultados reportados (hasta 97,53 de exactitud con GraphSAGE y caracteristicas `content`) son utiles como linea base para quien investigue deteccion de desinformacion con GNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN (MLP sobre nodo raiz, GCN, GraphSAGE, GAT, BiGCN, Bi-GCN TD/BU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en precision original) |
| Idiomas soportados | no disponible (tarea sobre texto en ingles en UPFD/GossipCop) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

El repositorio agrupa seis arquitecturas de grafos aplicadas a la clasificacion de grafos de propagacion de noticias del dataset UPFD (variante GossipCop). El nodo raiz representa la noticia y el resto de nodos, los usuarios que la difunden; las caracteristicas de cada nodo pueden ser embeddings BERT, perfiles de usuario, embeddings spaCy o caracteristicas de contenido. El modelo MLP de solo raiz actua como linea base sin estructura de grafo, mientras que GCN, GraphSAGE, GAT y las dos variantes de BiGCN explotan la topologia de difusion.

El entrenamiento se realiza con cinco semillas por configuracion y se selecciona el checkpoint con mejor macro-F1 en validacion. No se detallan en la informacion disponible el numero de epochs, hiperparametros, composicion exacta del dataset ni si hubo aumentos de datos. La innovacion metodologica es la ablacion sistematica de tipo de caracteristica sobre GraphSAGE, que permite aislar la contribucion de cada representacion de nodo.

## Capacidades

- Clasificacion binaria de noticias (falsa/verdadera) a partir de un grafo de propagacion.
- Procesamiento de grafos con PyTorch Geometric (`torch_geometric`).
- Acepta caracteristicas de nodo de distinto origen: embeddings BERT, perfiles de usuario, spaCy y contenido.
- Seis arquitecturas comparables bajo la misma interfaz de construccion (`build_model`).
- Multiples semillas para estimar varianza del rendimiento.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- No es multilingue ni un modelo de proposito general.

## Casos de uso

- Investigacion en deteccion de desinformacion: usar los checkpoints como linea base reproducible para comparar nuevas GNN sobre UPFD/GossipCop, aprovechando que se publican cinco semillas por configuracion.
- Ablacion de caracteristicas de nodo: reutilizar GraphSAGE con `profile`, `spacy`, `bert` y `content` para estudiar que representacion aporta mas senal en la tarea.
- Evaluacion de arquitecturas de grafos: comparar GCN, GraphSAGE, GAT y BiGCN bajo el mismo protocolo de validacion y metrica (macro-F1).
- Docencia y reproduccion: cargar los `state_dict` con el codigo del autor para verificar resultados publicados en un curso de NLP avanzado.
- Analisis de propagacion en redes sociales: adaptar el pipeline a otros grafos de difusion con estructura similar (nodo raiz + usuarios) para clasificacion binaria.
- Prototipado de moderacion de contenido asistida por grafos: integrar el modelo como componente de senal en un sistema mayor de verificacion, siempre que se disponga del grafo de difusion.

## Benchmarks y rendimiento

Resultados reportados en la model card (media ± desviacion estandar sobre cinco semillas, caracteristicas BERT):

| Modelo | Feature | Test accuracy | Test macro-F1 |
|---|---|---|---|
| Root-only MLP | bert | 73,40 ± 0,53 | 73,26 ± 0,50 |
| GCN | bert | 96,59 ± 0,26 | 96,59 ± 0,26 |
| GraphSAGE | bert | 96,04 ± 0,36 | 96,04 ± 0,36 |
| GAT | bert | 92,71 ± 1,72 | 92,70 ± 1,73 |
| BiGCN (Chen et al., 2021) | bert | 96,64 ± 0,61 | 96,64 ± 0,61 |
| Bi-GCN TD/BU (Bian et al., 2020) | bert | 95,33 ± 0,16 | 95,33 ± 0,17 |

Ablacion de caracteristicas sobre GraphSAGE:

| Modelo | Feature | Test accuracy | Test macro-F1 |
|---|---|---|---|
| GraphSAGE | profile | 96,44 ± 0,27 | 96,44 ± 0,27 |
| GraphSAGE | spacy | 95,64 ± 0,51 | 95,63 ± 0,51 |
| GraphSAGE | bert | 96,04 ± 0,36 | 96,04 ± 0,36 |
| GraphSAGE | content | 97,53 ± 0,25 | 97,53 ± 0,25 |

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,1 GB, por lo que los checkpoints son pequenos y caben en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por el tamano del artefacto, una GPU con 4-8 GB de VRAM deberia ser suficiente para inferencia.
- Cabe en GPU consumer: previsiblemente si (GTX/RTX de gama media o superior), aunque no se documenta.
- Opciones de despliegue: carga directa con PyTorch y PyTorch Geometric; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a GNN).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (GossipCop, bert) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-gnn (GraphSAGE) | no disponible | no aplica | 96,04 acc / 96,04 F1 | MIT | Hugging Face |
| anlp-a3-gnn (GCN) | no disponible | no aplica | 96,59 acc / 96,59 F1 | MIT | Hugging Face |
| anlp-a3-gnn (BiGCN) | no disponible | no aplica | 96,64 acc / 96,64 F1 | MIT | Hugging Face |
| Bi-GCN TD/BU (Bian et al., 2020) | no disponible | no aplica | 95,33 acc / 95,33 F1 (segun card) | no disponible | paper |
| BiGCN (Chen et al., 2021) | no disponible | no aplica | 96,64 acc / 96,64 F1 (segun card) | no disponible | paper |

Las comparaciones con los modelos originales se basan en los valores reportados por el propio autor; no se dispone de una evaluacion independiente.

## Limitaciones y advertencias

- Es un artefacto academico, no un modelo listo para produccion: requiere el codigo fuente del autor para reconstruir la arquitectura antes de cargar los pesos.
- Solo se entrena y evalua sobre UPFD/GossipCop; el rendimiento en otros dominios o idiomas no esta validado.
- No hay pipeline declarado ni API de inferencia; el uso exige integracion manual con PyTorch Geometric.
- Riesgo de sobreajuste al dataset y de sesgos presentes en GossipCop (etiquetado, distribucion de clases, sesgo de fuente).
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos/negativos en la clasificacion.
- La licencia MIT permite uso comercial, pero la procedencia academica y la falta de documentacion desaconsejan su uso directo en produccion sin validacion adicional.
- No se documentan idiomas soportados ni limitaciones de contexto (no aplica).
- El repositorio no incluye informacion sobre hiperparametros, epochs ni composicion exacta del dataset, lo que dificulta la reproduccion completa.

## Enlaces

- Hugging Face: https://huggingface.co/Viv0605101/anlp-a3-gnn
- Perfil del autor: https://huggingface.co/Viv0605101
- Codigo fuente: https://code.iiit.ac.in/advanced-nlp/m26-assignment3-vidvathama.babu
- Dataset UPFD: no disponible como enlace directo en la informacion proporcionada
- Paper BiGCN (Chen et al., 2021): no disponible como enlace directo en la informacion proporcionada
- Paper Bi-GCN TD/BU (Bian et al., 2020): no disponible como enlace directo en la informacion proporcionada
