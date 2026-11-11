# vanshnawander/anlp-a3-gnn-graphsage-spacy

## Resumen

`anlp-a3-gnn-graphsage-spacy` es un clasificador de grafos basado en GraphSAGE para la deteccion de noticias falsas sobre el subconjunto GossipCop del benchmark UPFD (User Preference-aware Fake News Detection). Lo desarrolla el usuario de Hugging Face `vanshnawander` en el contexto de una asignatura de analisis de redes (ANLP, asignacion 3), y se distribuye como cinco checkpoints independientes (semillas 0 a 4) escritos en PyTorch puro.

No es un modelo de lenguaje: no genera texto ni procesa secuencias libres. Se trata de un GNN de 181.506 parametros que opera sobre grafos de propagacion de noticias (usuarios y articulos como nodos, interacciones como aristas) con caracteristicas de nodo extraidas mediante spaCy. Su relevancia es acotada: sirve como referencia reproducible de un pipeline GNN completo sobre una particion fija 20/10/70 de UPFD, con metricas de validacion y test publicadas por semilla.

El modelo alcanza un F1 macro medio de 0,9660 ± 0,0041 en el conjunto de test, un valor alto que debe interpretarse con cautela dado el caracter academico del trabajo, la ausencia de model card extendida y la falta de informacion sobre el preprocesado exacto de caracteristicas y la construccion del grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (graph neural network) |
| Parametros totales | 181.506 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos, no sobre secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las caracteristicas de nodo se extraen con spaCy, pero el idioma del corpus no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`seed<k>/model.safetensors`) |
| Dimension de entrada | no disponible (definida en `seed<k>/config.json`, no publicada en la model card) |
| Numero de checkpoints | 5 (semillas 0, 1, 2, 3, 4) |
| Dataset | GossipCop (subconjunto de UPFD), split fijo 20/10/70 |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un clasificador GraphSAGE, una familia de GNN inductiva que agrega informacion de vecinos mediante funciones de agregacion (tipicamente media, LSTM o pooling) y actualiza las representaciones de nodo capa a capa. El modelo opera sobre el grafo bipartito de propagacion de noticias de UPFD: nodos de noticia y nodos de usuario, con aristas que representan la difusion de la noticia. Las caracteristicas iniciales de los nodos se obtienen con spaCy, segun indica el nombre del repositorio, aunque la model card no detalla la dimensionalidad, el tipo de embedding ni el preprocesado aplicado.

El entrenamiento se realizo con cinco semillas independientes (0 a 4) y se selecciono, para cada una, el checkpoint de la epoca con mejor F1 de validacion. Las epocas optimas varian notablemente entre semillas (39, 56, 72, 96 y 97), lo que sugiere una curva de validacion ruidosa o una parada temprana poco estable. No se documenta el numero de tokens, la composicion del dataset, el uso de RLHF/DPO (no aplica a este tipo de modelo) ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion binaria de noticias (falsa/verdadera) a partir de la estructura del grafo de propagacion.
- Aprovechamiento de informacion relacional: agrega senales de usuarios y patrones de difusion, no solo el contenido textual.
- Extraccion de caracteristicas de nodo mediante spaCy (procesamiento linguistico previo al GNN).
- Entrenamiento reproducible: cinco checkpoints con semillas fijas y metricas por semilla publicadas.
- Evaluacion estandarizada sobre el split fijo 20/10/70 de UPFD-GossipCop.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Reproduccion academica de resultados UPFD: cargar los cinco checkpoints y ejecutar `scripts/part2/test_gnn.sh` para verificar el F1 macro reportado (0,9660 ± 0,0041) sobre el test split oficial.
- Baseline en investigacion sobre deteccion de desinformacion: usar el modelo como referencia GraphSAGE frente a alternativas como GCN, GAT o BiGCN en experimentos de deteccion temprana de fake news.
- Estudio de robustez entre semillas: comparar las curvas de validacion de las cinco semillas para analizar la varianza del entrenamiento y la estabilidad de la parada temprana.
- Docencia en aprendizaje sobre grafos: ejemplo completo de pipeline (construccion de grafo, features spaCy, entrenamiento GraphSAGE, evaluacion macro-F1) para cursos de GNN.
- Analisis de propagacion en redes sociales: aplicar el modelo a grafos de difusion de noticias construidos con el mismo esquema de UPFD para estudiar patrones de coordinacion.
- Prototipado de moderacion asistida: como senal adicional (no como decision final) en un sistema de triaje de contenido, siempre que se valide fuera del dominio GossipCop.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (precision, recall y F1 macro-promediados):

| Semilla | Mejor epoca | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 96 | 0,9679 | 0,9680 | 0,9678 | 0,9678 |
| 1 | 97 | 0,9608 | 0,9611 | 0,9608 | 0,9608 |
| 2 | 56 | 0,9679 | 0,9682 | 0,9678 | 0,9678 |
| 3 | 39 | 0,9626 | 0,9626 | 0,9626 | 0,9626 |
| 4 | 72 | 0,9707 | 0,9708 | 0,9707 | 0,9707 |
| Media ± desv. | | 0,9660 ± 0,0041 | 0,9661 ± 0,0041 | 0,9660 ± 0,0041 | 0,9660 ± 0,0041 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 181.506 parametros (menos de 1 MB en fp32), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una GTX 1650, RTX 3060 o superior es mas que suficiente. En CPU la inferencia es viable para grafos de tamano moderado.
- Cabe en cualquier GPU consumer, incluidas integradas, y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (formato safetensors); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a un GNN).
- Latencia y throughput: no disponibles. Dependen del tamano del grafo de entrada y del numero de capas de agregacion, no de una longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | F1 en UPFD-GossipCop | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anlp-a3-gnn-graphsage-spacy | GraphSAGE | 181.506 | no aplica | 0,9660 ± 0,0041 (test) | no disponible | Hugging Face |
| GCN (baseline UPFD) | GCN | no disponible | no aplica | no disponible en esta ficha | no disponible | paper UPFD |
| GAT (baseline UPFD) | GAT | no disponible | no aplica | no disponible en esta ficha | no disponible | paper UPFD |
| BiGCN (UPFD) | GNN bidireccional | no disponible | no aplica | no disponible en esta ficha | no disponible | repo UPFD |

No se dispone de datos verificados de los modelos comparables en la informacion proporcionada; las filas se incluyen solo como referencia de categoria y no deben citarse como cifras confirmadas.

## Limitaciones y advertencias

- Modelo academico de alcance muy limitado: solo clasifica noticias en el esquema de UPFD-GossipCop; no es un modelo de lenguaje ni un detector generico de desinformacion.
- El F1 reportado (0,9660) procede del propio autor y no ha sido verificado de forma independiente; el split fijo 20/10/70 de UPFD es conocido y puede facilitar sobreajuste al benchmark.
- Varianza entre semillas y epocas optimas muy dispares (39 a 97) indican sensibilidad al entrenamiento y posible inestabilidad de la parada temprana.
- No se documenta el preprocesado de caracteristicas spaCy ni la construccion exacta del grafo, lo que dificulta la reproducibilidad fuera del repositorio de la asignacion.
- Sesgos conocidos: no documentados; el corpus GossipCop tiene sesgo de dominio (noticias de celebridades) y de idioma (no especificado).
- Riesgo de alucinacion: no aplica (no genera texto), pero si riesgo de falsos positivos/negativos en la clasificacion.
- Licencia no disponible: no se puede asumir uso comercial; verificar antes de cualquier despliegue en produccion.
- Sin mantenimiento aparente (0 descargas, 0 likes, repo de 0,0 GB) y sin pipeline declarado en Hugging Face.
- No apto para produccion sin validacion externa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-graphsage-spacy
- Repositorio de la asignacion (referenciado en la model card, ruta `scripts/part2/test_gnn.sh`): no disponible como URL publica
- Paper UPFD (User Preference-aware Fake News Detection): no disponible en la informacion proporcionada
- Dataset GossipCop / UPFD: no disponible en la informacion proporcionada
- Documentacion de spaCy: no disponible en la informacion proporcionada
