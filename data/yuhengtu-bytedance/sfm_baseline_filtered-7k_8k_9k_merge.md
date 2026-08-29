# yuhengtu-bytedance/sfm_baseline_filtered-7k_8k_9k_merge

## Resumen

Este modelo es un artefacto de investigacion creado mediante la fusion (merge) de tres checkpoints intermedios de un mismo entrenamiento de pre-entrenamiento, correspondientes a los pasos globales 7000, 8000 y 9000 de la ejecucion `baseline_filtered`. El merge se realizo con la herramienta mergekit utilizando el metodo lineal (Linear merge, arXiv:2203.05482), tomando el checkpoint del paso 9000 como base. El resultado es un modelo denso de aproximadamente 6,86 mil millones de parametros con arquitectura GPT-NeoX, orientado a generacion de texto.

El trabajo forma parte de la investigacion de ByteDance Seed sobre fusion de modelos durante el pre-entrenamiento de LLMs, recogida en el articulo arXiv:2505.12082. La relevancia de este modelo reside en que ejemplifica una estrategia para combinar checkpoints de una misma corrida de entrenamiento, en lugar de fusionar modelos completamente entrenados por separado, lo que puede mejorar la estabilidad y el rendimiento en etapas tempranas del pre-entrenamiento. No obstante, se trata de un experimento de investigacion sin datos publicados de evaluacion ni licencia especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (dense transformer) |
| Parametros totales | 6.856.253.440 (~6,86 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en la arquitectura GPT-NeoX, segun los tags del repositorio. No se trata de un modelo entrenado desde cero, sino de una fusion lineal de tres checkpoints de la misma corrida de pre-entrenamiento `baseline_filtered`, correspondientes a los pasos globales 7000, 8000 y 9000. La configuracion de mergekit utilizo pesos iguales (1.0) para cada checkpoint, con normalizacion activada (`normalize: true`), calculo en float32 y salida en bfloat16.

El metodo de fusion lineal (tambien conocido como weight averaging) promedia los pesos de los modelos participantes, lo que en este caso equivale a promediar tres estados intermedios de un mismo proceso de entrenamiento. Esta tecnica, investigada en el articulo arXiv:2505.12082 de ByteDance Seed, busca mejorar la calidad del modelo final combinando puntos de la trayectoria de optimizacion. No se dispone de informacion sobre el dataset de pre-entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Compatible con la libreria transformers y con text-generation-inference (TGI), segun los tags del repositorio.
- Capacidad de continuacion de texto y completado de secuencias, propia de un modelo GPT-NeoX pre-entrenado.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Las capacidades multilingues no estan especificadas; al ser un modelo de investigacion sin ficha tecnica detallada, no se puede confirmar el alcance idiomatico.

## Casos de uso

- Investigacion academica sobre fusion de modelos: el caso de uso principal es reproducir y estudiar los efectos del weight averaging de checkpoints durante el pre-entrenamiento, tal como se describe en el articulo arXiv:2505.12082.
- Comparacion de estrategias de merge: permite contrastar el rendimiento de fusiones lineales de checkpoints frente a modelos individuales o a fusiones de modelos completamente entrenados.
- Analisis de la dinamica de pre-entrenamiento: al ser un promedio de pasos 7000, 8000 y 9000, puede usarse para estudiar como evoluciona la representacion interna del modelo a lo largo del entrenamiento.
- Baseline para experimentos de merge scaling: el repositorio forma parte de una serie de experimentos (sfm_baseline, sfm_unfiltered) que exploran el escalado de tecnicas de fusion.
- Generacion de texto en entornos de investigacion: puede emplearse como modelo de generacion generico en pipelines experimentales donde no se requiera un rendimiento optimo.
- Validacion de herramientas de merge: sirve como caso de prueba para verificar el correcto funcionamiento de mergekit y de los flujos de integracion con transformers y TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros conjuntos estandar, y la model card no reporta metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 13,7 GB para los pesos, mas overhead de activaciones y KV cache, lo que situa el requisito practico en torno a 16-20 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB o equivalentes con suficiente memoria.
- En GPU de consumo, cabe en una RTX 3090 o RTX 4090 con 24 GB de VRAM en bfloat16; con cuantizacion INT8 o INT4 (no disponible en el repositorio, pero aplicable mediante herramientas externas) podria ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI) y, potencialmente, con vLLM y llama.cpp si se convierten los pesos a los formatos adecuados (GGUF, AWQ, GPTQ).
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de secuencia y la implementacion de inferencia utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm_baseline_filtered-7k_8k_9k_merge (este) | ~6,86 B | no disponible | no disponible | Merge lineal de checkpoints de pre-entrenamiento |
| sfm-baseline-unfiltered-4k-5k-6k-avg | ~6,86 B (estimado) | no disponible | no disponible | Variante con datos sin filtrar y pasos 4k-5k-6k |
| Llama-2-7B | 6,74 B | 4096 | Llama 2 Community License | Modelo denso de referencia con benchmarks publicados |
| Mistral-7B | 7,24 B | 32768 | Apache 2.0 | Modelo denso con sliding window attention |

La comparacion con Llama-2-7B y Mistral-7B es orientativa en cuanto a tamano, pero no se dispone de datos de rendimiento del modelo de este repositorio para establecer una comparacion cuantitativa. La diferencia fundamental es que este modelo es un artefacto de investigacion sin evaluacion publicada, mientras que los otros dos son modelos de produccion con benchmarks extensos.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos, alucinaciones o seguridad; al ser un checkpoint de pre-entrenamiento sin alineacion, es previsible que presente comportamientos no deseados en tareas de instruccion.
- La licencia no esta especificada, lo que impide determinar si es legal su uso comercial o incluso su redistribucion.
- No se dispone de informacion sobre la longitud de contexto soportada, los idiomas cubiertos ni la composicion del dataset de entrenamiento.
- El modelo es un promedio de checkpoints intermedios, no un modelo final entrenado hasta convergencia; su rendimiento puede ser inferior al de un modelo entrenado completamente.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad relativa frente a alternativas de tamano similar.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental sin validacion externa.
- La fecha de creacion (agosto de 2026) es posterior a la fecha del articulo de investigacion (mayo de 2025), lo que indica que el modelo se publico como material complementario de la investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-7k_8k_9k_merge
- Modelo relacionado (sfm-baseline-unfiltered-4k-5k-6k-avg): https://huggingface.co/yuhengtu-bytedance/sfm-baseline-unfiltered-4k-5k-6k-avg
- Articulo de investigacion (arXiv:2505.12082): https://arxiv.org/pdf/2505.12082v1
- Pagina del proyecto en ByteDance Seed: https://seed.bytedance.com/en/public_papers/model-merging-in-pre-training-of-large-language-models
- Pagina personal del autor (Yuheng Tu): https://yuhengtu.github.io/
- Repositorio de mergekit: https://github.com/cg123/mergekit
