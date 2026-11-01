# stanfordasl/diet-traj-olmo2-medium-dolma-seed11

## Resumen

Este repositorio contiene uno de los checkpoints de preentrenamiento del proyecto DIET (weight-space trajectory analysis) del grupo stanfordasl de Stanford. No se trata de un modelo orientado a despliegue en producción, sino de un artefacto de investigación: una ejecución de preentrenamiento desde cero con arquitectura OLMo2 de tamaño medio (~305 millones de parámetros), entrenada sobre el corpus Dolma v1.7 con la seed 11. Su propósito es permitir análisis de trayectorias en el espacio de pesos, comparables a los realizados con la colección jjalora/diet-traj-pythia-410m, pero extendidos a la arquitectura OLMo2.

El modelo se entrena con un presupuesto de 2.000 millones de tokens (2B), con checkpoints intermedios guardados cada 950 pasos (hasta un máximo de 30.517 pasos) en ramas `stepN` del repositorio, y los pesos finales en la rama `main` una vez completada la ejecución. Todos los checkpoints se publican en formato safetensors bf16, lo que facilita cargar trayectorias completas para estudios de dinámica de entrenamiento, interpolación de pesos, análisis de mecanismos internos o replicabilidad de experimentos de destilación (en este caso, con `teacher_schedule=none`, es decir, preentrenamiento puro con cross-entropy).

Su relevancia actual radica en el creciente interés por la interpretabilidad y el análisis de la dinámica de entrenamiento en el espacio de pesos: disponer de una familia de checkpoints idénticos salvo por la semilla aleatoria permite estudiar varianza entre runs, efectos de la inicialización y geometría de la pérdida durante el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 (decoder denso basado en transformer) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 2.048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa media, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio jjalora/diet-lm: hidden_size de 768, intermediate_size de 3.072, 16 capas ocultas, 12 cabezas de atencion y 12 cabezas key/value (MHA sin agrupacion GQA), con una ventana de contexto maxima de 2.048 posiciones. El numero total de parametros es de aproximadamente 305 millones, verificado a partir de los metadatos de safetensors.

El entrenamiento es preentrenamiento puro de modelado de lenguaje con perdida cross-entropy (`distillation.teacher_schedule=none`), sobre el dataset `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace de Dolma v1.7 muestreado proporcionalmente entre los componentes de su mezcla, servido en streaming (sin preempaquetado). La receta optica emplea AdamW con lr=3e-5, betas (0.9, 0.95), weight decay de 0.1, planificacion coseno del learning rate y precision bf16, ejecutado en una GPU H100 del cluster "makau". El presupuesto de tokens es de 2.000 millones, con un maximo de 30.517 pasos y guardado de checkpoints cada 950 pasos. En esta coleccion, la unica diferencia entre runs es la semilla aleatoria (en este caso, seed 11), lo que habilita estudios controlados de varianza entre ejecuciones.

## Capacidades

- Generacion de texto en ingles como modelo de lenguaje causal entrenado desde cero sobre Dolma v1.7.
- Compatibilidad con la libreria `transformers` de HuggingFace (pipeline text-generation, endpoints compatibles).
- Serie completa de checkpoints intermedios (cada 950 pasos) util para analisis de trayectoria en el espacio de pesos.
- Reproducibilidad experimental: metadatos de provenance en `run.json` (cluster, GPU, pasos, presupuesto de tokens, seed).
- No hay evidencia de capacidades de vision, audio, tool calling, agentes ni razonamiento especifico: es un modelo base de preentrenamiento sin ajuste por instrucciones.

## Casos de uso

- Analisis de trayectorias en el espacio de pesos: cargar la secuencia de checkpoints (`stepN`) para estudiar como evolucionan los pesos durante el preentrenamiento, con tecnicas de interpolacion, analisis en modo comun o visualizacion de la geometria de la perdida.
- Estudios de varianza entre semillas: comparar este run (seed 11) con otros runs de la coleccion identicos salvo la semilla, para cuantificar la influencia de la aleatoriedad en el resultado final.
- Investigacion en interpretabilidad mecanicista: los checkpoints intermedios permiten rastrear cuando emergen circuitos o capacidades concretas durante el entrenamiento.
- Benchmarking de metodos de destilacion: la configuracion proviene de un framework de destilacion (`run_distillation.py`) con teacher desactivado, util como baseline de preentrenamiento puro frente a runs con destilacion activa.
- Experimentos de continued pretraining: partir del checkpoint final (rama `main`) para continuar el entrenamiento sobre otros corpus o con otras recetas, aprovechando un punto de partida reproducible y de licencia abierta.
- Docencia y formacion: modelo de tamano manejable (~305M) adecuado para reproducir pipelines de preentrenamiento a escala pequena en entornos academicos con presupuesto de computo limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~305M de parametros en bf16, los pesos ocupan unos 0,6 GB; con contexto de 2.048 tokens, menos de 1-2 GB de VRAM son suficientes para inferencia.
- VRAM estimada para fine-tuning: entrenable comodamente en una sola GPU de gama consumer (8-16 GB) con optimizaciones estandar.
- GPU recomendadas: cualquier GPU moderna; para inferencia basta una RTX 3060/4060 o superior. El entrenamiento original se realizo en una NVIDIA H100.
- Cabe sin problemas en GPUs consumer, incluidas las de 8 GB de VRAM.
- Opciones de despliegue: `transformers` de HuggingFace de forma nativa; tambien compatible con vLLM, llama.cpp (previa conversion a GGUF, no incluida en el repo), Ollama (previa conversion) o TGI, aunque el caso de uso principal es la carga de checkpoints para investigacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito principal |
|---|---|---|---|---|
| stanfordasl/diet-traj-olmo2-medium-dolma-seed11 | ~305M | 2.048 | Apache 2.0 | Trayectoria de preentrenamiento para investigacion |
| Pythia-410M (EleutherAI) | 405M | 2.048 | Apache 2.0 | Modelo base para estudios de ciencia de LLM, con checkpoints |
| OLMo-2-0425-1B (AllenAI) | ~1.500M | 4.096 | Apache 2.0 | Modelo base abierto de proposito general |
| jjalora/diet-traj-pythia-410m (coleccion) | ~405M | 2.048 | no disponible | Trayectorias de preentrenamiento sobre arquitectura Pythia |

Frente a Pythia-410M, este modelo ofrece una arquitectura mas moderna (OLMo2) y datos Dolma v1.7, con checkpoints regulares cada 950 pasos y runs replicados con distintas semillas. Frente a OLMo-2-1B de AllenAI, es un modelo mucho mas pequeno y sin soporte de instruccion, orientado exclusivamente a investigacion.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: sin ajuste por instrucciones ni RLHF/DPO, genera texto continuo sin control de formato o utilidad conversacional.
- Entrenado unicamente en ingles; no apto para contenido en espanol ni multilingue.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo.
- Riesgo de alucinacion y sesgos heredados de Dolma v1.7 (corpus web a gran escala sin filtrado de seguridad orientado a despliegue); como modelo base, puede generar contenido ofensivo o incorrecto.
- Los checkpoints intermedios estan en ramas `stepN` y los pesos finales en `main` solo cuando la ejecucion termina; conviene verificar el estado del run mediante `run.json`.
- El campo `git_commit` del registro de provenance figura como "unknown", lo que puede complicar la reproducibilidad exacta del codigo de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el tamano y la naturaleza del modelo lo hacen poco adecuado para aplicaciones comerciales reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed11
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio del framework de entrenamiento (referenciado en la model card): https://huggingface.co/jjalora/diet-lm
- Coleccion de referencia de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m-* (coleccion referenciada en la model card; URL exacta no disponible)
- Paper, blog o demo: no disponible
