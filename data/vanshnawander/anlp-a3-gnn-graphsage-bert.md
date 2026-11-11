# vanshnawander/anlp-a3-gnn-graphsage-bert

## Resumen

`anlp-a3-gnn-graphsage-bert` es un clasificador de grafos basado en GraphSAGE desarrollado por el usuario de Hugging Face `vanshnawander` en el contexto de una asignatura de aprendizaje automatico (ANLP, asignacion 3). El modelo resuelve una tarea concreta de deteccion de noticias falsas sobre el subconjunto GossipCop del benchmark UPFD, usando caracteristicas de nodo extraidas con BERT y una division fija de datos 20/10/70 (entrenamiento/validacion/prueba).

A diferencia de los modelos de lenguaje generativos, no se trata de un modelo de proposito general: es un clasificador binario de grafos de propagacion de noticias, con solo 361.218 parametros y escrito en PyTorch puro. Cada grafo representa un hilo de difusion de una noticia en redes sociales, y el modelo aprende a agregar informacion de los vecinos para predecir si la noticia es falsa o veridica.

Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline GraphSAGE + BERT para deteccion de desinformacion, con cinco semillas entrenadas y metricas de validacion y prueba publicadas. No esta pensado para uso en produccion ni como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (graph neural network) con caracteristicas de nodo BERT |
| Parametros totales | 361.218 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre grafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (un checkpoint por semilla en `seed<k>/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un clasificador GraphSAGE que opera sobre grafos de propagacion de noticias del subconjunto GossipCop de UPFD. Cada nodo del grafo incorpora caracteristicas extraidas con BERT (dimension de entrada definida en `config.json`), y la red agrega las representaciones de los vecinos mediante el esquema de agregacion propio de GraphSAGE para producir una prediccion binaria a nivel de grafo. La implementacion esta escrita en PyTorch puro, sin frameworks GNN adicionales.

El entrenamiento se realizo con cinco semillas (0 a 4) sobre la division fija 20/10/70 de UPFD, y de cada ejecucion se conserva el checkpoint de la epoca con mejor F1 de validacion. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables a esta tarea). Tampoco se detallan innovaciones tecnicas adicionales mas alla del uso de caracteristicas BERT como entrada del GNN.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (falsa o veridica) sobre el dataset GossipCop de UPFD.
- Agregacion de informacion estructural de vecindarios mediante GraphSAGE.
- Uso de representaciones de nodo derivadas de BERT como caracteristicas de entrada.
- Entrenamiento reproducible con cinco semillas independientes y metricas por semilla.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.
- No dispone de capacidades multilingues documentadas.

## Casos de uso

- Investigacion academica en deteccion de desinformacion: el modelo sirve como linea base reproducible para comparar variantes de GNN sobre UPFD/GossipCop, gracias a los cinco checkpoints y a las curvas de entrenamiento publicadas.
- Reproduccion de experimentos docentes: el repositorio de la asignatura incluye `scripts/part2/test_gnn.sh`, que descarga los checkpoints y evalua sobre el split de prueba, lo que facilita la verificacion de resultados.
- Analisis de propagacion de noticias en redes sociales: dado un grafo de difusion con caracteristicas BERT por nodo, el modelo estima la probabilidad de que la noticia sea falsa.
- Comparacion de estrategias de agregacion en GNN: al ser una implementacion en PyTorch puro, es sencillo modificar el agregador y medir el impacto en F1 sobre el mismo split fijo.
- Estudio de robustez entre semillas: la desviacion estandar publicada (F1 de 0,9592 ± 0,0036) permite analizar la variabilidad del entrenamiento en tareas de clasificacion de grafos.
- Prototipado de pipelines de moderacion asistida: como componente experimental en un sistema mayor de verificacion de hechos, siempre con supervision humana y sin uso en produccion.

## Benchmarks y rendimiento

Resultados de prueba publicados en la model card (precision, recall y F1 promediados en macro):

| Semilla | Mejor epoca | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 64 | 0,9566 | 0,9566 | 0,9566 | 0,9566 |
| 1 | 58 | 0,9634 | 0,9634 | 0,9634 | 0,9634 |
| 2 | 48 | 0,9545 | 0,9546 | 0,9545 | 0,9545 |
| 3 | 17 | 0,9600 | 0,9602 | 0,9600 | 0,9600 |
| 4 | 79 | 0,9616 | 0,9618 | 0,9616 | 0,9616 |
| Media ± desv. | | 0,9592 ± 0,0036 | 0,9593 ± 0,0037 | 0,9592 ± 0,0036 | 0,9592 ± 0,0036 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 361.218 parametros el modelo es trivial en memoria.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (formato safetensors); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de grafos.
- Latencia y throughput: no disponibles; dependen del tamano de los grafos de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-gnn-graphsage-bert | 361.218 | Clasificacion de grafos (GossipCop/UPFD) | no aplica | no disponible | Hugging Face |
| GCN sobre UPFD (referencia del benchmark) | no disponible | Clasificacion de grafos (GossipCop/UPFD) | no aplica | no disponible | Implementaciones publicas en repos de investigacion |
| GAT sobre UPFD (referencia del benchmark) | no disponible | Clasificacion de grafos (GossipCop/UPFD) | no aplica | no disponible | Implementaciones publicas en repos de investigacion |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de asignatura: no esta validado para uso en produccion ni para decisiones reales sobre verificacion de hechos.
- Entrenado exclusivamente sobre el subconjunto GossipCop de UPFD con una division fija 20/10/70; el rendimiento fuera de esa distribucion no esta documentado.
- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones; solo clasifica grafos con caracteristicas BERT precalculadas.
- Riesgo de sesgo heredado del dataset GossipCop y de las representaciones BERT utilizadas como caracteristicas.
- Riesgo de sobreajuste al split concreto; la variabilidad entre semillas es baja pero el modelo puede no generalizar a otros dominios de noticias.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no documentados; las capacidades linguisticas dependen del extractor BERT empleado para las caracteristicas.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-graphsage-bert
- Paper de UPFD (User Preference-aware Fake News Detection): no disponible en la informacion proporcionada
- Repositorio de la asignatura con `scripts/part2/test_gnn.sh`: no disponible en la informacion proporcionada
