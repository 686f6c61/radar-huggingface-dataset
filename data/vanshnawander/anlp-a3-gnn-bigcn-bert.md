# vanshnawander/anlp-a3-gnn-bigcn-bert

## Resumen

`anlp-a3-gnn-bigcn-bert` es un clasificador de grafos basado en una red neuronal de grafos (GNN) de tipo Bi-GCN, desarrollado por el usuario vanshnawander en el contexto de una asignatura de aprendizaje automatico (el prefijo `anlp-a3` sugiere "Advanced NLP, assignment 3"). El modelo resuelve una tarea de clasificacion binaria de noticias falsas sobre el subconjunto GossipCop del benchmark UPFD, donde cada noticia se representa como un grafo de propagacion en redes sociales y los nodos se inicializan con embeddings de BERT.

A diferencia de los modelos de lenguaje generativos, este artefacto no es un LLM: es un clasificador pequeno, con 427.522 parametros, escrito en PyTorch puro y publicado con cinco checkpoints correspondientes a las semillas 0 a 4. Cada checkpoint es la epoca con mejor F1 de validacion, y el rendimiento medio en test alcanza un F1 macro de 0,9385 ± 0,0057.

Su relevancia es acotada y de caracter academico-reproducible: sirve como referencia para experimentos de deteccion de desinformacion sobre grafos de difusion y como ejemplo de integracion de caracteristicas BERT en un pipeline GNN. No esta pensado para inferencia de texto libre ni para uso en produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-GCN (graph neural network bidireccional) sobre grafos de propagacion |
| Parametros totales | 427.522 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre grafos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (el corpus GossipCop es en ingles, pero la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`seed<k>/model.safetensors`), con `config.json` y `result.json` por semilla |

## Arquitectura y entrenamiento

El modelo es un Bi-GCN, es decir, una GNN que propaga mensajes en dos direcciones sobre el grafo de difusion de cada noticia (de la fuente hacia las respuestas y viceversa), agregando representaciones de los nodos vecinos para producir una representacion a nivel de grafo que se clasifica como noticia verdadera o falsa. Los nodos se inicializan con caracteristicas derivadas de BERT, segun indica el nombre del modelo y la etiqueta `bert` en la descripcion. La implementacion es PyTorch plano, sin frameworks de grafos de alto nivel.

El entrenamiento se realizo sobre el subconjunto GossipCop de UPFD con el split fijo 20/10/70 (entrenamiento/validacion/test) y se repitio con cinco semillas (0 a 4). Para cada semilla se conservo el checkpoint de la epoca con mejor F1 de validacion; las epocas optimas reportadas van de la 43 a la 84, lo que indica curvas de entrenamiento relativamente largas. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de noticias (verdadera/falsa) a partir de la estructura del grafo de propagacion en GossipCop.
- Extraccion de representaciones a nivel de grafo mediante agregacion de mensajes Bi-GCN.
- Uso de caracteristicas de nodo derivadas de BERT como entrada.
- Reproducibilidad multi-semilla: cinco checkpoints independientes con metricas por semilla y curvas de entrenamiento registradas.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision, audio ni capacidades multilingues declaradas.
- No es un modelo conversacional ni un agente.

## Casos de uso

- Reproduccion de experimentos academicos: ejecutar `bash scripts/part2/test_gnn.sh` desde el repositorio de la asignatura para descargar los checkpoints y evaluar en el split de test, comparando con los resultados publicados.
- Linea base para deteccion de desinformacion en grafos: usar el Bi-GCN como referencia al evaluar arquitecturas GNN mas complejas (GAT, GraphSAGE, HGT) sobre UPFD/GossipCop.
- Estudio de robustez multi-semilla: analizar la varianza entre los cinco checkpoints (std de 0,0057 en F1) para estimar la estabilidad del entrenamiento.
- Analisis de propagacion de noticias: inspeccionar como la estructura del grafo de difusion contribuye a la clasificacion, por ejemplo mediante ablaciones sobre aristas o nodos.
- Prototipado de moderacion de contenidos en entornos controlados: integrar el clasificador en un pipeline de investigacion que reciba grafos de propagacion ya construidos y produzca una etiqueta binaria.
- Docencia y practicas de GNN: servir como ejemplo completo de entrenamiento, seleccion por validacion y publicacion de checkpoints con metricas por semilla.

## Benchmarks y rendimiento

Resultados en el split de test de GossipCop (UPFD, split fijo 20/10/70), con precision, recall y F1 macro-promediados:

| Semilla | Mejor epoca | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 55 | 0,9370 | 0,9374 | 0,9370 | 0,9370 |
| 1 | 45 | 0,9315 | 0,9323 | 0,9316 | 0,9315 |
| 2 | 84 | 0,9464 | 0,9465 | 0,9464 | 0,9464 |
| 3 | 53 | 0,9360 | 0,9361 | 0,9360 | 0,9360 |
| 4 | 43 | 0,9417 | 0,9422 | 0,9417 | 0,9417 |
| Media ± std | — | 0,9385 ± 0,0057 | 0,9389 ± 0,0055 | 0,9385 ± 0,0057 | 0,9385 ± 0,0057 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 427.522 parametros en fp32 el peso ronda 1,7 MB, y el consumo dominante sera el grafo de entrada y las caracteristicas BERT de los nodos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo no aprovechara su capacidad.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (carga directa de `model.safetensors` con `safetensors.torch.load_file`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador GNN.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste despreciable frente al preprocesado del grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-gnn-bigcn-bert | 427.522 | Grafo de propagacion con features BERT | Clasificacion de noticias falsas (GossipCop/UPFD) | no disponible | Hugging Face, 5 checkpoints |
| Bi-GCN original (Bian et al., 2020) | no disponible en la informacion | Grafo de propagacion | Deteccion de noticias falsas (PolitiFact/GossipCop) | codigo de investigacion | Repositorio de paper |
| GNN generico sobre UPFD (p. ej. GAT, GraphSAGE) | variable | Grafo de propagacion | Clasificacion de noticias falsas | variable | Implementaciones en repositorios UPFD |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo clasifica grafos de propagacion de GossipCop; no genera texto ni responde a instrucciones.
- Entrenado sobre un unico dataset y un split fijo; la generalizacion a otros dominios, idiomas o plataformas no esta evaluada.
- Riesgo de sesgo heredado del corpus GossipCop (noticias de celebridades en ingles) y de las representaciones BERT utilizadas como features.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos/negativos en la clasificacion; la precision media de 0,9389 implica un margen de error no despreciable en produccion.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Repositorio de 0,0 GB y 0 descargas en el momento de la consulta; no hay evidencia de mantenimiento ni de soporte.
- La evaluacion depende del repositorio de la asignatura (`scripts/part2/test_gnn.sh`); no se documenta una API de inferencia independiente.
- No hay informacion sobre el preprocesado exacto de las features BERT, lo que dificulta replicar el pipeline fuera del repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-bigcn-bert
- Paper de referencia Bi-GCN (Bian et al., "Rumor Detection on Social Media with Bi-Directional Graph Convolutional Networks"): no disponible en la informacion proporcionada
- Benchmark UPFD: no disponible en la informacion proporcionada
- Repositorio de la asignatura (`scripts/part2/test_gnn.sh`): no disponible en la informacion proporcionada
