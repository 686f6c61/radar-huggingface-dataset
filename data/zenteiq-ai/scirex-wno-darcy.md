# zenteiq-ai/scirex-wno-darcy

## Resumen

ScireX WNO · Darcy flow 2D es un checkpoint de un operador neuronal (neural operator) de tipo Wavelet Neural Operator (WNO) entrenado para resolver el benchmark de flujo de Darcy bidimensional en su variante data-driven. Lo desarrolla el proyecto zenteiq-ai sobre la librería de código abierto scirex, implementada en JAX/Flax. El modelo no es un modelo de lenguaje: es un surrogate numérico que aproxima el operador que mapea un campo de permeabilidad a un campo de presión sobre una malla de 85 x 85 puntos.

El interés práctico reside en que sustituye la resolución iterativa de una EDP elíptica por una pasada directa de red neuronal, con 2.829.601 parámetros y un coste de entrenamiento de unos 21 minutos. Esto lo hace útil para exploración paramétrica, generación rápida de campos de presión en pipelines de simulación y como componente de modelos subrogados en dinámica de fluidos computacional.

El checkpoint se publica con pesos en safetensors, configuración con estadísticas de normalización y una muestra de verificación, bajo licencia Apache 2.0. Su error relativo L2 en test es del 2,02 %, por encima de la referencia publicada de aproximadamente 0,84 % que los propios autores del modelo indican que no es reproducible con el código y datos liberados del artículo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wavelet Neural Operator (WNO), red neuronal con capas de convolución en dominio wavelet; implementación en JAX/Flax |
| Parametros totales | 2.829.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 85 x 85 puntos de malla (7.225 puntos) por muestra |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 para los pesos; el código de scirex es LGPL-3.0; datos de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `sample.safetensors` de verificación |

## Arquitectura y entrenamiento

WNO es un operador neuronal que aplica transformadas wavelet para capturar estructuras multiescala en funciones definidas sobre mallas regulares. En este checkpoint, la entrada es un campo de permeabilidad en una rejilla de 85 x 85 (7.225 puntos) y la salida es el campo de presión correspondiente en la misma rejilla. La implementación procede de la librería scirex, escrita en JAX/Flax, y sigue la arquitectura descrita en Tripura y Chakraborty (2022, arXiv:2205.02191).

El entrenamiento usa los datos de flujo de Darcy de Li et al. (ICLR 2021), publicados en el registro Zenodo 12784353 bajo CC BY 4.0, con 1.000 muestras de entrenamiento y 200 de test. Se optimizó con AdamW, tasa de aprendizaje 1e-3 reducida a la mitad cada 50 épocas, weight decay 1e-6, pérdida L2 relativa y normalización por píxel. El lote fue de 20, durante 500 épocas (25.000 pasos) con semilla 0, en aproximadamente 21 minutos. Los pesos publicados corresponden a la última época. Las estadísticas de normalización viven en `config.json` y son imprescindibles: sin ellas los pesos no son utilizables.

## Capacidades

- Aproximación del operador solución de la ecuación de Darcy 2D estacionaria: mapea permeabilidad a presión sobre malla de 85 x 85.
- Inferencia directa en una sola pasada, sin bucle iterativo de resolución de la EDP.
- Generalización dentro del rango de distribuciones de permeabilidad cubierto por los datos de entrenamiento del benchmark.
- Evaluación reproducible mediante `scripts/benchmarks/darcy/infer.py` del repositorio scirex v1.0.0.
- Verificación de instalación mediante `sample.safetensors`, que contiene una entrada de test y la salida esperada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo numérico especializado.

## Casos de uso

- Exploración paramétrica de medios porosos: dado un conjunto de campos de permeabilidad sintéticos o medidos, generar los campos de presión correspondientes en milisegundos para estudiar sensibilidad y variabilidad del flujo.
- Aceleración de pipelines de simulación CFD: usar el modelo como surrogate inicial o como corrección de bajo coste antes de lanzar un solver numérico completo sobre los casos más relevantes.
- Generación de datasets aumentados: producir pares permeabilidad-presión adicionales para entrenar o validar otros modelos subrogados, con la cautela de que el error del 2,02 % se propaga a los datos generados.
- Prototipado en investigación de operadores neuronales: el checkpoint sirve como línea base reproducible para comparar FNO, GINO, Transolver y WNO sobre el mismo benchmark dentro de scirex.
- Docencia y divulgación sobre EDPs y aprendizaje automático científico: el tamaño reducido (2,8 M de parámetros) y los 21 minutos de entrenamiento permiten reproducir el experimento completo en hardware modesto.
- Integración en herramientas de ingeniería de yacimientos o hidrogeología: estimación rápida de campos de presión para cribado de escenarios antes de un análisis detallado con simuladores convencionales.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| L2 relativo en test | 2,02 % | ~0,84 % (Tripura y Chakraborty, 2022, tabla 3; no reproducible con el código y datos liberados del artículo) |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo. La comparación con FNO, GINO y Transolver sobre el mismo benchmark está documentada en la tabla comparativa del repositorio scirex (`doc/benchmarks/darcy/results/comparative.md`), pero los valores concretos de esos modelos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan unos pocos megabytes (2,8 M de parámetros en precisión de entrenamiento) y el tensor de entrada es de 7.225 puntos por muestra.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm compatible con JAX; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de gama media son suficientes.
- Cabe en GPU de consumo: sí, con amplio margen; también puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: JAX/Flax mediante los scripts de scirex; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el entrenamiento completo requirió unos 21 minutos, lo que sugiere una inferencia por muestra muy rápida, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Repositorio | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| WNO Darcy (este) | zenteiq-ai/scirex-wno-darcy | 2.829.601 | Darcy 2D data-driven | Apache 2.0 |
| FNO Darcy | zenteiq-ai/scirex-fno-darcy | no disponible | Darcy 2D data-driven | no disponible |
| GINO Darcy | zenteiq-ai/scirex-gino-darcy | no disponible | Darcy 2D data-driven | no disponible |
| Transolver Darcy | zenteiq-ai/scirex-transolver-darcy | no disponible | Darcy 2D data-driven | no disponible |

Los cuatro checkpoints pertenecen al mismo benchmark y al mismo framework, por lo que la comparación directa es posible ejecutando la tabla comparativa del repositorio scirex. Los parámetros, el contexto (malla de 85 x 85 en todos los casos) y los resultados de los tres modelos alternativos no se detallan en la información disponible.

## Limitaciones y advertencias

- Validez restringida al rango de entrada cubierto por los datos de entrenamiento del benchmark; fuera de él la aproximación puede degradarse sin aviso.
- No apto para diseño de seguridad crítica sin validación independiente, según advierte el propio autor.
- Error relativo L2 en test del 2,02 %, más del doble que la referencia publicada del 0,84 %; conviene tenerlo en cuenta si se usa como sustituto de un solver.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- Modelo entrenado únicamente sobre flujo de Darcy 2D estacionario en malla fija de 85 x 85; no generaliza a otras geometrías, mallas o regímenes físicos.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones y no tiene capacidades de razonamiento simbólico.
- Licencia Apache 2.0 en los pesos, pero el código de scirex es LGPL-3.0 y los datos de entrenamiento son CC BY 4.0; revisar el NOTICE para el crédito al dataset.
- Riesgo de alucinación en el sentido de predicciones físicamente inconsistentes fuera de distribución; no se documentan sesgos sociales por la naturaleza numérica del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Tabla comparativa del benchmark Darcy: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Artículo de la arquitectura WNO: https://arxiv.org/abs/2205.02191
- Dataset de flujo de Darcy (Li et al., ICLR 2021): registro Zenodo 12784353
- Checkpoints relacionados: https://huggingface.co/zenteiq-ai/scirex-fno-darcy, https://huggingface.co/zenteiq-ai/scirex-gino-darcy, https://huggingface.co/zenteiq-ai/scirex-transolver-darcy
- Variante physics-only con campos extra: https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Otros benchmarks del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-wno-pipe, https://huggingface.co/zenteiq-ai/scirex-wno-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
