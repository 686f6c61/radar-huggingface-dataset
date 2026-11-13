# zenteiq-ai/scirex-fno-darcy

## Resumen

ScireX FNO · Darcy flow 2D es un operador neuronal entrenado (neural operator) basado en Fourier Neural Operator (FNO) para resolver el benchmark de flujo de Darcy bidimensional en su variante puramente basada en datos. Lo desarrolla el proyecto open source scirex (zenteiq-research), una librería escrita en JAX/Flax que recopila implementaciones y checkpoints de referencia de operadores neuronales para ecuaciones en derivadas parciales. El modelo no es un modelo de lenguaje: es un aproximador de la solución de una EDP que mapea un campo de permeabilidad a un campo de presión sobre una malla de 85 x 85.

El problema que resuelve es el de sustituir un solver numérico clásico (elementos finitos, volúmenes finitos) por una red que aprende el operador solución, de modo que la inferencia sea una pasada hacia delante en lugar de una resolución iterativa. Es relevante ahora porque el ecosistema de operadores neuronales está convergiendo en librerías reproducibles con checkpoints versionados, y este repositorio ofrece pesos con una métrica declarada (error L2 relativo de test del 1,109 %) frente a la referencia publicada por Li et al. (1,08 %).

El checkpoint corresponde a los pesos de la última época del entrenamiento descrito en la model card, almacenados en `model.safetensors` junto con `config.json` (ajustes y estadísticas de normalización) y `sample.safetensors` (una entrada de test y la salida esperada) para validar la instalación. El tamaño real de parámetros en safetensors es de 1.428.281, mientras que la model card declara 2.836.281 parámetros reales contando los pesos complejos como dos valores; la diferencia es coherente con la representación de tensores complejos en el fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fourier Neural Operator (FNO) en JAX/Flax |
| Parametros totales | 1.428.281 en safetensors; 2.836.281 parametros reales contando pesos complejos como dos (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 85 x 85 puntos (7.225 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 para los pesos; codigo de scirex bajo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`, `sample.safetensors`) |

## Arquitectura y entrenamiento

FNO es una arquitectura de operador neuronal que aplica transformadas de Fourier sobre las dimensiones espaciales para capturar dependencias de largo alcance en la malla, combinadas con transformaciones lineales punto a punto y no linealidades. En este checkpoint la implementación es la de la librería scirex en JAX/Flax, con pesos complejos en las capas espectrales. La entrada es un campo de permeabilidad en una malla de 85 x 85 (7.225 puntos) y la salida es el campo de presión en la misma malla.

El entrenamiento usa el conjunto de datos de Darcy flow de Li et al. (ICLR 2021), alojado en el registro Zenodo 12784353 y licenciado bajo CC BY 4.0, con 1.000 muestras de entrenamiento y 200 de test. Se emplea AdamW con soporte para pesos complejos, learning rate de 1e-3 reducido a la mitad cada 100 épocas, weight decay 0, pérdida L2 relativa y normalización por píxel. El lote es de 20, se ejecutan 500 épocas (25.000 pasos) con semilla 0, y el tiempo de entrenamiento declarado es de aproximadamente 4,6 minutos. Las estadísticas de normalización viven en `config.json` y son imprescindibles: los pesos no son utilizables sin ellas.

## Capacidades

- Aproximación del operador solución del flujo de Darcy 2D: mapea permeabilidad a presión sobre malla fija de 85 x 85.
- Inferencia de una sola pasada hacia delante, sin bucle iterativo de solver.
- Evaluación cuantitativa contra referencia publicada mediante error L2 relativo (1,109 % en test).
- Verificación de instalación mediante `sample.safetensors`, que contiene una entrada y la salida esperada.
- Ejecución sobre JAX/Flax, con posibilidad de aceleración en GPU/TPU según el backend de JAX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No incluye visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado rápido de surrogate models en simulación de yacimientos: el modelo sustituye al solver de Darcy en barridos paramétricos donde se necesita evaluar miles de campos de permeabilidad y solo se requiere precisión del orden del 1 % en norma L2 relativa.
- Aceleración de pipelines de optimización de incertidumbre: al ser una pasada hacia delante, permite muestrear ensembles de permeabilidad y obtener presiones en una fracción del coste de un solver de elementos finitos, con la salvedad de validar fuera del rango de entrenamiento.
- Generación de datasets sintéticos etiquetados: se puede usar como generador de pares permeabilidad-presión para preentrenar otros modelos o para aumentar datos en regiones donde el solver es caro.
- Validación de implementaciones propias de FNO: el checkpoint y `sample.safetensors` sirven como referencia reproducible para comprobar que una reimplementación en JAX/Flax produce la misma salida esperada.
- Benchmarking de operadores neuronales: al compartir benchmark con GINO, Transolver y WNO en el mismo repositorio, permite comparar arquitecturas bajo el mismo protocolo y mismas métricas.
- Docencia e investigación en métodos numéricos asistidos por aprendizaje: el tamaño reducido (1,4 M de parámetros en safetensors) y el tiempo de entrenamiento de minutos lo hacen adecuado para experimentos en entornos con recursos limitados.
- Integración en flujos de diseño preliminar: como aproximador rápido dentro de bucles de optimización de geometría o de propiedades de medio poroso, siempre con validación posterior con solver de alta fidelidad.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| Error L2 relativo en test (Darcy 2D, data-driven) | 1,109 % | 1,08 % (Li et al., ICLR 2021, Tabla 4) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, por no ser aplicables a este modelo. Tampoco se han publicado métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,4 M de parámetros en safetensors el peso de los tensores es del orden de pocos megabytes, por lo que cualquier GPU consumer con 4 GB o más es suficiente.
- GPU recomendadas: no hay una recomendación específica publicada; cualquier GPU compatible con JAX (NVIDIA, AMD ROCm o TPU) sirve. Para entrenamiento, la model card indica aproximadamente 4,6 minutos, lo que sugiere que una GPU de gama media es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con soporte JAX; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: JAX/Flax mediante el script `scripts/benchmarks/darcy/infer.py` del repositorio scirex en la etiqueta v1.0.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Repositorio | Parametros | Contexto / malla | Metrica declarada | Licencia |
|---|---|---|---|---|---|
| FNO (este modelo) | zenteiq-ai/scirex-fno-darcy | 1.428.281 (safetensors) | 85 x 85 | Error L2 rel. test 1,109 % | Apache-2.0 |
| GINO | zenteiq-ai/scirex-gino-darcy | no disponible | no disponible | no disponible en la informacion | no disponible |
| Transolver | zenteiq-ai/scirex-transolver-darcy | no disponible | no disponible | no disponible en la informacion | no disponible |
| WNO | zenteiq-ai/scirex-wno-darcy | no disponible | no disponible | no disponible en la informacion | no disponible |

Los tres modelos comparables pertenecen al mismo benchmark y al mismo repositorio de referencia, pero la información proporcionada no incluye sus parámetros, métricas ni licencias. Para el resto de benchmarks del mismo modelo FNO existen checkpoints publicados en pipe flow, Navier-Stokes 2D y chip cooling, sin datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- Validez restringida al rango de entrada del conjunto de entrenamiento del benchmark; extrapolaciones fuera de ese rango no están garantizadas.
- No apto para diseño safety-critical sin validación independiente, según advierte la propia model card.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`; un uso incorrecto de las mismas invalida los resultados.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código ni multilingües, y no debe evaluarse con benchmarks de NLP.
- No se documentan sesgos en el sentido de modelos de lenguaje; el riesgo principal es el error de aproximación numérica y la sensibilidad a la distribución de los datos de entrada.
- La licencia Apache-2.0 aplica a los pesos; el código de scirex es LGPL-3.0 y el dataset de entrenamiento es CC BY 4.0, por lo que la redistribución debe respetar las tres licencias y la atribución indicada en `NOTICE`.
- No se publican datos de robustez frente a ruido en la entrada, ni de comportamiento fuera de la malla de 85 x 85.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-fno-darcy
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Tabla comparativa del benchmark Darcy: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura FNO (Li et al., ICLR 2021): https://arxiv.org/abs/2010.08895
- Dataset Darcy flow (Zenodo 12784353): https://zenodo.org/records/12784353
- Checkpoint GINO para Darcy: https://huggingface.co/zenteiq-ai/scirex-gino-darcy
- Checkpoint Transolver para Darcy: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy
- Checkpoint WNO para Darcy: https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- Variante physics-only con campos extra: https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields
- Checkpoint FNO para pipe flow: https://huggingface.co/zenteiq-ai/scirex-fno-pipe
- Checkpoint FNO para Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-fno-navier-stokes
- Checkpoint FNO para chip cooling: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling
