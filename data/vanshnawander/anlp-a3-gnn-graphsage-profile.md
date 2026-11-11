# vanshnawander/anlp-a3-gnn-graphsage-profile

## Resumen

`anlp-a3-gnn-graphsage-profile` es un clasificador de grafos basado en GraphSAGE, implementado en PyTorch puro, orientado a la deteccion de noticias falsas sobre el subconjunto GossipCop del benchmark UPFD. Lo desarrolla el usuario de Hugging Face `vanshnawander` en el contexto de una asignatura de analitica de lenguaje natural (el prefijo `anlp-a3` sugiere una practica academica), y emplea la variante de caracteristicas de nodo `profile`, que combina embeddings historicos de usuario con caracteristicas de la noticia.

El modelo es deliberadamente pequeno: 70.146 parametros en total, entrenado con cinco semillas (0 a 4) y seleccionando en cada una el checkpoint de la epoca con mejor F1 de validacion. Sobre el split fijo 20/10/70 de UPFD alcanza un F1 macro medio de 0,9527 ± 0,0073 en test, con una accuracy media de 0,9527 ± 0,0073. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que recibe un grafo de propagacion de noticias y devuelve una etiqueta binaria (noticia falsa o veraz).

Su relevancia es acotada pero clara: sirve como referencia reproducible y ligera para tareas de clasificacion de grafos en deteccion de desinformacion, con artefactos bien organizados por semilla (pesos en `safetensors`, configuracion y metricas por epoca). No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y su tamano es practicamente nulo (0,0 GB), lo que confirma que se trata de un experimento academico mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (graph neural network) para clasificacion de grafos |
| Parametros totales | 70.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada basada en grafo, no en secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es clasificacion binaria, no generacion de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`seed<k>/model.safetensors`), con `config.json` y `result.json` por semilla |

## Arquitectura y entrenamiento

El modelo es un clasificador GraphSAGE escrito en PyTorch plano (sin frameworks de grafos de alto nivel), disenado para operar sobre los grafos de propagacion de noticias de UPFD. La entrada son caracteristicas de nodo de tipo `profile`, que en UPFD combinan embeddings de perfil de usuario con caracteristicas de la noticia; la dimension de entrada concreta figura en el `config.json` de cada semilla. El modelo se entrena sobre el subconjunto GossipCop con el split fijo 20/10/70 del benchmark, lo que permite comparar resultados con otros trabajos de la literatura UPFD.

El entrenamiento se repitio con cinco semillas (0, 1, 2, 3, 4) y, para cada una, se conservo el checkpoint de la epoca con mejor F1 de validacion (epocas 99, 85, 97, 81 y 94 respectivamente). No se documentan en la informacion disponible el numero de tokens, la composicion exacta del dataset mas alla de GossipCop, ni el uso de RLHF, DPO u otras tecnicas de alineacion, algo por otra parte esperable en un modelo de clasificacion de este tamano.

## Capacidades

- Clasificacion binaria de noticias (falsa o veraz) a partir de un grafo de propagacion, no de texto plano.
- Aprovechamiento de caracteristicas de perfil de usuario (`profile`) en los nodos del grafo.
- Reproducibilidad por semilla: cinco checkpoints independientes con metricas de validacion y test registradas.
- Entrenamiento y evaluacion con split fijo de UPFD (20/10/70), lo que facilita la comparacion con otros metodos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Deteccion de desinformacion en redes sociales: dado el grafo de difusion de una noticia en GossipCop, el modelo clasifica si es falsa o veraz con un F1 macro proximo a 0,95; es adecuado como linea base en investigacion sobre verificacion de hechos.
- Reproduccion de experimentos academicos: los cinco checkpoints con semillas fijas permiten replicar resultados y estudiar la varianza entre ejecuciones (desviacion tipica de 0,0073 en F1), algo util en docencia e investigacion.
- Comparacion de variantes de caracteristicas de nodo: al usar `profile`, sirve de referencia frente a variantes `content`, `news` o `spacy` de UPFD para medir el impacto del tipo de caracteristica.
- Prototipado rapido de pipelines GNN: con solo 70.146 parametros, el modelo se entrena y evalua en minutos en CPU, lo que lo hace idoneo para pruebas de integracion en cursos o proyectos iniciales.
- Analisis de propagacion de noticias en grafos: permite estudiar que estructuras de difusion se asocian a contenido falso, como paso previo a sistemas de alerta temprana.
- Evaluacion de robustez de modelos GNN: las cinco semillas facilitan analisis de estabilidad del rendimiento ante cambios en el grafo o en el split.

## Benchmarks y rendimiento

Resultados de test sobre el split fijo 20/10/70 de UPFD-GossipCop con caracteristicas `profile` (precision, recall y F1 macro-promediados), segun la model card:

| Semilla | Mejor epoca | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 99 | 0,9550 | 0,9551 | 0,9550 | 0,9550 |
| 1 | 85 | 0,9485 | 0,9488 | 0,9485 | 0,9485 |
| 2 | 97 | 0,9600 | 0,9605 | 0,9600 | 0,9600 |
| 3 | 81 | 0,9579 | 0,9584 | 0,9579 | 0,9579 |
| 4 | 94 | 0,9422 | 0,9431 | 0,9423 | 0,9422 |
| Media ± desv. | — | 0,9527 ± 0,0073 | 0,9532 ± 0,0072 | 0,9527 ± 0,0073 | 0,9527 ± 0,0073 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 70.146 parametros en precision completa el peso de los parametros ronda los 0,3 MB en fp32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo GNN).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en el orden de milisegundos en CPU para grafos de tamano tipico de UPFD.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. Como referencia cualitativa, dentro de la literatura UPFD existen variantes de GraphSAGE con otras caracteristicas de nodo (`content`, `news`, `spacy`) y otros modelos GNN (GCN, GAT), pero no se han facilitado sus cifras para esta ficha.

| Modelo | Parametros | Contexto | F1 test (GossipCop) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-gnn-graphsage-profile | 70.146 | no aplica | 0,9527 ± 0,0073 | no disponible | Hugging Face |
| Alternativas UPFD (GCN, GAT, otras variantes GraphSAGE) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo academico con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion externa.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Entrenado exclusivamente sobre el subconjunto GossipCop de UPFD; no se ha validado en otros dominios ni en otros subconjuntos (PolitiFact, etc.).
- El rendimiento depende de la calidad y del esquema de construccion del grafo de propagacion; fuera de UPFD las caracteristicas `profile` pueden no estar disponibles.
- Riesgo de sesgo heredado del dataset GossipCop y de los embeddings de perfil de usuario, no analizado en la model card.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si existe riesgo de clasificacion erronea en noticias ambiguas o con grafos de difusion atipicos.
- No soporta otros idiomas ni tareas distintas de la clasificacion binaria.
- La seleccion del checkpoint por mejor F1 de validacion puede introducir un ligero optimismo en las metricas reportadas.
- No se documentan limitaciones de contexto porque el modelo no procesa secuencias de texto.

## Enlaces

- Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-graphsage-profile
- Repositorio de la asignatura (referenciado en la model card, sin URL explicita): script `scripts/part2/test_gnn.sh` para descargar y evaluar los checkpoints
- Benchmark UPFD (referencia de la tarea): no se proporciona enlace en la informacion disponible
