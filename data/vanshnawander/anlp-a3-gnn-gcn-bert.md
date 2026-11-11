# vanshnawander/anlp-a3-gnn-gcn-bert

## Resumen

`anlp-a3-gnn-gcn-bert` es un clasificador de grafos basado en una red convolucional de grafos (GCN) orientado a la deteccion de noticias falsas sobre el subconjunto GossipCop del conjunto de datos UPFD. Lo desarrolla el usuario vanshnawander en el contexto de una asignatura de procesamiento de lenguaje natural (ANLP), y cada nodo del grafo se representa mediante caracteristicas `bert`. El modelo tiene 246.530 parametros y se ha entrenado con cinco semillas distintas (0 a 4), guardando para cada una el checkpoint de la epoca con mejor F1 de validacion.

No es un modelo de lenguaje generativo: es un cabezal de clasificacion binaria sobre un grafo de propagacion de noticias (usuarios, articulos y tweets conectados). Resuelve un problema acotado de clasificacion de nodos (noticia verdadera o falsa) dentro de un split fijo 20/10/70, y su relevancia actual es la de un artefacto reproducible de investigacion docente, no la de un componente listo para produccion.

El repositorio ocupa 0,0 GB y no incluye pipeline declarado, licencia ni idiomas en los metadatos de Hugging Face. Toda la informacion tecnica disponible proviene de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN (graph convolutional network) sobre grafo de propagacion, caracteristicas de nodo `bert` |
| Parametros totales | 246.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; opera sobre grafos) |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`seed<k>/model.safetensors`) + `config.json` y `result.json` por semilla |

## Arquitectura y entrenamiento

La arquitectura es una GCN de PyTorch puro que propaga mensajes entre nodos del grafo de difusion de noticias. Cada nodo se inicializa con caracteristicas `bert`; el modelo aprende una funcion de agregacion sobre los vecinos para clasificar nodos. Con 246.530 parametros, se trata de una red muy pequena, coherente con un ejercicio academico de deteccion de noticias falsas sobre UPFD (GossipCop).

El entrenamiento se realizo sobre el split fijo 20/10/70 del subconjunto GossipCop de UPFD, con cinco semillas (0, 1, 2, 3, 4). Para cada semilla se selecciono la epoca con mejor F1 de validacion; las epocas optimas varian mucho (38, 46, 79, 79 y 83), lo que sugiere una curva de aprendizaje con meseta amplia y ruido considerable entre inicializaciones. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF, DPO o cualquier otra etapa de alineamiento; en un clasificador de este tipo esa fase no aplica.

## Capacidades

- Clasificacion de nodos en grafos de propagacion de noticias: distingue noticias falsas de verdaderas en el entorno UPFD/GossipCop.
- Representacion de nodos a partir de caracteristicas `bert` precalculadas.
- Agregacion de informacion de vecindad mediante convoluciones en grafo.
- Evaluacion reproducible con cinco semillas y metricas macro-averaged (precision, recall, F1, accuracy).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; no se declara idioma alguno.
- No es un agente: no tiene bucle de decision ni planificacion.

## Casos de uso

- Investigacion academica en deteccion de noticias falsas: reproduce el experimento sobre GossipCop/UPFD con el split 20/10/70 y compara con variantes GCN, GAT o GraphSAGE. Es adecuado porque el autor publica pesos, configuracion y metricas por semilla.
- Docencia y practicas de GNN: sirve como referencia minima (246.530 parametros) para ensenar propagacion de mensajes y evaluacion con semillas multiples.
- Analisis de propagacion en redes sociales: dado un grafo de tweets y retweets, clasificar la noticia asociada como verdadera o falsa, siempre que las caracteristicas `bert` de los nodos se generen con el mismo esquema del entrenamiento.
- Baseline para comparativas de modelos de grafos: linea base barata frente a arquitecturas mas grandes en tareas de clasificacion de nodos en UPFD.
- Estudio de estabilidad de entrenamiento: las metricas por semilla permiten analizar varianza (std de 0,0059 en F1) y el efecto de la inicializacion.
- Reproduccion de pipelines de evaluacion: `bash scripts/part2/test_gnn.sh` descarga los checkpoints y evalua el split de test, util para validar infraestructura de evaluacion.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (precision, recall y F1 macro-averaged):

| Seed | Mejor epoca | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 83 | 0,9626 | 0,9626 | 0,9626 | 0,9626 |
| 1 | 38 | 0,9524 | 0,9525 | 0,9524 | 0,9524 |
| 2 | 79 | 0,9624 | 0,9625 | 0,9623 | 0,9624 |
| 3 | 46 | 0,9498 | 0,9499 | 0,9498 | 0,9498 |
| 4 | 79 | 0,9540 | 0,9544 | 0,9540 | 0,9540 |
| Media ± desv. | -- | 0,9562 ± 0,0059 | 0,9564 ± 0,0059 | 0,9562 ± 0,0059 | 0,9562 ± 0,0059 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estos datos sobre GossipCop/UPFD.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia; los pesos totales rondan 1 MB (246.530 parametros), por lo que cualquier GPU consumer es suficiente.
- GPU recomendadas: cualquiera; no requiere A100 ni H100. Funciona incluso en CPU.
- Cabe en GPU consumer: si, en cualquier RTX, GTX o incluso en iGPU.
- Opciones de despliegue: PyTorch nativo cargando `seed<k>/model.safetensors`; llama.cpp, vLLM, TGI u Ollama no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Por su tamano, la inferencia sobre el grafo completo deberia ser de orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Alternativas conceptuales en la misma tarea (GCN, GAT, GraphSAGE, GAT-GCN sobre UPFD) no aparecen evaluadas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-a3-gnn-gcn-bert | 246.530 | no aplica (grafos) | no disponible | Hugging Face |
| GAT / GraphSAGE sobre UPFD | no disponible | no aplica | no disponible | no disponible |
| GCN original UPFD | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde prompts; solo clasifica nodos de un grafo con la estructura y las caracteristicas exactas del entrenamiento.
- Dataset y split fijos: solo es valido en el split 20/10/70 de GossipCop/UPFD; no se ha evaluado en otros conjuntos ni splits.
- Sin licencia declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Sin idiomas declarados en los metadatos; no se puede asumir cobertura multilingue.
- Riesgo de sobreajuste al dominio: GossipCop es un corpus de noticias de cotilleo; los resultados no se transfieren necesariamente a otros dominios.
- Varianza entre semillas: F1 oscila entre 0,9498 y 0,9626 segun la semilla, con diferencias de epoca optima muy grandes (38 frente a 83).
- Sin informacion sobre sesgos, calibracion ni alucinacion (no aplica generacion, pero si falsos positivos/negativos en la clasificacion).
- Repositorio de 0,0 GB y 0 descargas: sin senales de mantenimiento, versionado ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-gcn-bert
- Repositorio de la asignatura referido en la model card: `scripts/part2/test_gnn.sh` (no se proporciona URL)
- Dataset UPFD (referencia): no disponible en la informacion proporcionada
- Paper UPFD: no disponible en la informacion proporcionada
