# stanfordasl/diet-traj-olmo2-medium-dolma-seed10

## Resumen

Este repositorio contiene un punto de control (y su trayectoria completa de entrenamiento) de un modelo de lenguaje preentrenado desde cero con la arquitectura OLMo2, de tamaño medio (~305 millones de parámetros), entrenado sobre datos de Dolma. Forma parte del proyecto DIET (weight-space), liderado por el grupo stanfordasl en colaboración con la colección `jjalora/diet-lm`, cuyo objetivo es analizar trayectorias de entrenamiento en el espacio de pesos. La relevancia de este artefacto no radica en su rendimiento como modelo de uso general, sino en su valor como recurso de investigación: permite estudiar cómo evolucionan los pesos a lo largo del preentrenamiento en una arquitectura moderna (OLMo2) y un dataset abierto (Dolma v1.7).

La run concreta corresponde a la semilla 10, con un presupuesto de 2.000 millones de tokens y checkpoints guardados cada 950 pasos hasta un máximo de 30.517 pasos. Todos los runs de la colección comparten receta e hiperparámetros idénticos, variando únicamente la semilla, lo que los hace ideales para análisis de varianza entre semillas. Los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 (decoder denso, `olmo2_medium_dense`) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 2.048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles adicionales de la arquitectura: hidden_size=768, intermediate_size=3072, 16 capas ocultas, 12 cabezas de atencion y 12 cabezas key/value (MHA sin GQA).

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo2 en su variante densa (medium): un transformer decoder con hidden_size de 768, 16 capas, dimension intermedia de 3072 en el MLP y atencion multi-cabeza estandar (12 cabezas de consulta y 12 de clave/valor, sin agrupacion GQA). La ventana de contexto es de 2.048 posiciones.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con perdida de entropia cruzada (CE/LM), sin destilacion (`teacher_schedule=none`). Los datos proceden de `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face del dataset Dolma v1.7 muestreado proporcionalmente entre sus componentes de mezcla, transmitido en streaming durante el entrenamiento. La receta utiliza el optimizador AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precision bf16. La run se ejecuto en una GPU H100 (cluster "makau") con un presupuesto de 2.000 millones de tokens, maximo de 30.517 pasos y checkpoints cada 950 pasos. No hay indicios de RLHF ni DPO: es un modelo base preentrenado sin ajuste por preferencias.

## Capacidades

- Generacion de texto en ingles como modelo base (pipeline text-generation), sin ajuste por instrucciones.
- Modelo preentrenado desde cero sobre Dolma v1.7, apto para fine-tuning posterior (SFT, LoRA, etc.).
- Valor principal como objeto de estudio: trayectoria completa de checkpoints (ramas `stepN`) para analisis en espacio de pesos.
- Comparabilidad estricta entre semillas: esta run (seed 10) comparte receta exacta con el resto de la coleccion, util para estudios de varianza.
- Sin capacidades especiales declaradas: no hay vision, audio, tool calling ni thinking mode documentados.

## Casos de uso

- Investigacion en dinamicas de entrenamiento: la serie de checkpoints (cada 950 pasos hasta ~30.517) permite trazar la evolucion de los pesos, aplicar tecnicas como analisis en espacio de pesos, interpolacion de modelos o deteccion de fases de aprendizaje.
- Estudios de varianza entre semillas: al compartir receta con otras runs de la coleccion DIET, permite medir cuanta variacion introduce la semilla en el resultado final.
- Benchmarking de metodos de merging: los checkpoints intermedios y finales sirven como candidatos para experimentos de model souping, averaging o merging en arquitectura OLMo2.
- Reproduccion de pipelines de preentrenamiento: la receta documentada (AdamW, coseno, bf16, streaming de Dolma) y el codigo en `jjalora/diet-lm` facilitan replicar runs de ~305M sobre 2B tokens.
- Base para fine-tuning experimental: con 305M parametros, es un modelo ligero para prototipar SFT, destilacion o evaluaciones antes de escalar a tamanos mayores.
- Docencia y formacion: un modelo de tamano manejable y totalmente abierto (Apache 2.0, pesos + datos + receta) resulta util como material practico en cursos sobre entrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~305M de parametros en bf16, el modelo ocupa unos 0,6 GB de pesos; cualquier GPU moderna de consumo (incluso 6-8 GB de VRAM) lo ejecuta con holgura. En CPU tambien es viable dada su escala.
- GPU recomendadas: para inferencia, cualquier GPU de consumo (RTX 3060, RTX 4090, etc.). Para reproducir el entrenamiento, la run original se ejecuto en una H100.
- Cabe sin problemas en GPUs de consumo; no requiere hardware de datacenter para uso como modelo.
- Despliegue: al usar la libreria `transformers` con pesos safetensors compatibles con `endpoints_compatible`, puede cargarse directamente con Hugging Face Transformers. No hay menciones a soporte verificado en vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed10 | ~305M | 2.048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Trayectoria de checkpoints para investigacion |
| Pythia-410m (colecciones diet-traj-pythia-410m) | ~410M | 2.048 | Pile | Apache 2.0 | Coleccion analogica previa del proyecto DIET, sobre otra arquitectura |
| OLMo2-1B (AI2) | ~1.500M | 4.096 | Dolma (escala completa) | Apache 2.0 | Modelo de produccion de la misma familia, mucho mayor y con mas rendimiento |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion (sin RLHF/DPO): tendera a continuar texto en lugar de seguir instrucciones.
- Entrenado solo en ingles; no es adecuado para otros idiomas.
- Ventana de contexto corta (2.048 tokens), insuficiente para tareas de documento largo.
- Riesgo de alucinacion tipico de modelos base pequenos entrenados sobre datos web (Dolma); puede generar contenido sesgado o inexacto heredado del corpus.
- Sesgos: no se ha publicado analisis de sesgos para esta run concreta; los datos de Dolma provienen de fuentes web con los sesgos inherentes.
- El tamano del repositorio es de 39,1 GB debido a la serie completa de checkpoints; para usar solo los pesos finales conviene descargar la rama `main`.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque al tratarse de un artefacto de investigacion no esta pensado para despliegue en produccion.
- La informacion de provenance indica `git_commit: unknown`, lo que puede dificultar la reproduccion exacta del codigo empleado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed10
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Codigo del proyecto (referenciado en la model card): repositorio `jjalora/diet-lm` (enlace externo no disponible en la informacion proporcionada)
- Coleccion analogica referenciada: `jjalora/diet-traj-pythia-410m-*` (enlaces concretos no disponibles en la informacion proporcionada)
