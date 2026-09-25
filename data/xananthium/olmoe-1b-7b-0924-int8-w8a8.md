# Xananthium/OLMoE-1B-7B-0924-INT8-W8A8

## Resumen

Xananthium/OLMoE-1B-7B-0924-INT8-W8A8 es una cuantizacion en INT8 W8A8 del modelo base allenai/OLMoE-1B-7B-0924, publicada por el usuario Xananthium. Se trata de un transformer decoder-only con mezcla de expertos dispersa (MoE) que conserva la arquitectura del original: 6.919.161.856 parametros totales (segun los safetensors) y alrededor de 1.3B de parametros activos por token, segun la documentacion del modelo base.

El problema que resuelve es el de despliegue: el checkpoint original en BF16 ocupa unos 14 GB en pesos, mientras que esta version cuantizada reduce el repositorio a 7.1 GB, con cuatro shards que suman aproximadamente 6.7 GiB. El autor ha verificado el funcionamiento en vLLM 0.30.0 sobre una unica RTX 3090, lo que situa el modelo en el rango de GPU de consumo para inferencia.

Es relevante ahora porque permite ejecutar un MoE abierto y plenamente documentado en hardware asequible, a costa de una cuantizacion sin dataset de calibracion y sin benchmarks formales de precision publicados. Conviene tener en cuenta que el checkpoint cuantizado parte del modelo base (no del Instruct), por lo que no es un modelo conversacional afinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos dispersa (MoE) |
| Parametros totales | 6.919.161.856 (≈6.9B, segun safetensors del checkpoint cuantizado) |
| Parametros activos | ≈1.3B por token (segun documentacion del modelo base) |
| Longitud de contexto | 4096 tokens (segun la documentacion del modelo base allenai/OLMoE-1B-7B-0924) |
| Tipos de cuantizacion | INT8 W8A8: pesos y activaciones de 8 bits (activaciones dinamicas) en proyecciones de atencion y de expertos; routing gates, embeddings, normalizacion y cabeza de salida en BF16. No se publican variantes GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (4 shards, ≈6.7 GiB) |
| Modelo base | allenai/OLMoE-1B-7B-0924 |
| Tamano del repositorio | 7.1 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMoE: un transformer decoder-only con capas de mezcla de expertos dispersa. Segun el paper de OLMoE (arXiv 2409.02060), el modelo tiene 16 capas, 64 expertos por capa y enrutamiento top-8, con aproximadamente 1.3B de parametros activos sobre 6.9B totales, y fue preentrenado con 5 billones de tokens. El repositorio oficial de AllenAI publica de forma abierta los datos, el codigo y los logs de entrenamiento, algo poco habitual en modelos de esta categoria.

Sobre esta base, el autor de la ficha aplica una cuantizacion INT8 W8A8 con llmcompressor: las proyecciones de atencion y de expertos pasan a pesos de 8 bits y activaciones dinamicas de 8 bits, mientras que las puertas de enrutamiento, los embeddings, las capas de normalizacion y la cabeza de salida se mantienen en BF16. La cuantizacion es data-free, con redondeo al vecino mas cercano (round-to-nearest) y sin dataset de calibracion, lo que simplifica el proceso pero no incorpora informacion sobre la distribucion real de activaciones. La model card indica explicitamente que no se han ejecutado benchmarks formales de precision ni de throughput.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base preentrenado.
- Razonamiento y conocimiento general propios de un LM preentrenado con 5 billones de tokens.
- Generacion de codigo y resolucion de tareas de conocimiento comun, al nivel del modelo base.
- Inferencia eficiente en parametros activos: al activar top-8 expertos, el coste por token se aproxima al de un modelo de ~1.3B.
- Ejecucion compatible con vLLM mediante el formato compressed-tensors, verificada en la version 0.30.0.
- Capacidades multilingues limitadas al ingles, segun la etiqueta de idioma del repositorio.
- No es un modelo instruido: no esta afinado con RLHF/DPO ni optimizado para seguir instrucciones, tool calling o razonamiento multi-paso.

## Casos de uso

- Servicio de generacion de texto en ingles en GPU de consumo: el checkpoint cuantizado ocupa unos 6.7 GiB en pesos y el autor lo ha validado en una RTX 3090, por lo que es viable como endpoint de completado en hardware de una sola tarjeta.
- Evaluacion y benchmarking de tecnicas de cuantizacion: al tratarse de una cuantizacion INT8 W8A8 de un modelo abierto con baseline BF16 publico, sirve como punto de comparacion para medir la degradacion introducida por cuantizar sin calibracion.
- Prototipado de pipelines de NLP en ingles: clasificacion, resumen extractivo, reescritura o generacion de texto donde no se requiere un modelo conversacional, con coste de inferencia bajo gracias a los ~1.3B parametros activos.
- Experimentacion academica con arquitecturas MoE: permite reproducir estudios sobre enrutamiento y especializacion de expertos con un modelo completamente abierto, en una sola GPU.
- Autocompletado de codigo o texto tecnico: el modelo base rinde razonablemente en continuacion de codigo; la version cuantizada reduce el coste por token para uso interactivo.
- Backend de bajo coste para generacion por lotes: al caber en 24 GB de VRAM, permite procesar volumenes moderados de documentos en ingles con lotes grandes en vLLM.
- Base para un posterior ajuste fino ligero: es posible partir de este checkpoint como inicializacion para tareas especificas en ingles, asumiendo la degradacion de la cuantizacion.
- No es adecuado para atencion al cliente ni asistentes conversacionales directos: para esos casos debe usarse la variante allenai/OLMoE-1B-7B-0924-Instruct o el modelo base Instruct sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del checkpoint cuantizado indica explicitamente que el autor no ha ejecutado benchmarks formales de precision (accuracy) ni de throughput, y que la cuantizacion se realizo sin dataset de calibracion. El paper de OLMoE (arXiv 2409.02060) si incluye resultados del modelo base e Instruct, pero no se reproducen aqui al no formar parte de la informacion proporcionada.

## Requisitos de hardware

- Peso de los pesos en INT8: aproximadamente 6.7 GiB en cuatro shards; el repositorio completo ocupa 7.1 GB.
- VRAM estimada para inferencia: en torno a 8-10 GB para pesos mas overhead de runtime con contexto corto; 16 GB permiten trabajar con comodidad; 24 GB permiten lotes mayores y contexto completo. Estas cifras son estimaciones derivadas del tamano de los pesos, no datos publicados.
- GPU recomendadas: RTX 3090 (validada por el autor con vLLM 0.30.0), RTX 4090, A10G, L4, A100 y H100. Se requiere una GPU con soporte de kernels INT8 (Ampere o posterior recomendado); las arquitecturas anteriores pueden no disponer de rutas optimizadas W8A8.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas; en 8 GB el margen es muy ajustado y dependera de la longitud de contexto y el tamano de lote.
- Opciones de despliegue: vLLM (probado por el autor, version 0.30.0, con ejecucion eager y el sampler FlashInfer opcional desactivado), transformers con soporte de compressed-tensors, y llmcompressor para reproducir o generar nuevas cuantizaciones. No se publica conversion a GGUF, por lo que llama.cpp y Ollama no son compatibles sin trabajo adicional.
- Latencia y throughput: no disponibles; el autor no ha medido throughput formalmente y no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Xananthium/OLMoE-1B-7B-0924-INT8-W8A8 | 6.9B | ≈1.3B | 4096 | INT8 W8A8 (mixta con BF16) | Apache-2.0 |
| allenai/OLMoE-1B-7B-0924 (BF16) | 6.9B | ≈1.3B | 4096 | BF16 | Apache-2.0 |
| allenai/OLMoE-1B-7B-0924-Instruct | 6.9B | ≈1.3B | 4096 | BF16 | Apache-2.0 |
| Mixtral 8x7B | ≈46.7B | ≈12.9B | 32768 | BF16 | Apache-2.0 |

Frente al checkpoint BF16, la version INT8 reduce el peso de los pesos aproximadamente a la mitad y facilita el despliegue en una sola GPU de consumo, a cambio de una precision no validada experimentalmente. Frente a OLMoE-1B-7B-0924-Instruct, la diferencia funcional es mayor que la de tamano: esta version no esta afinada por instrucciones. Mixtral 8x7B es una alternativa MoE de mayor tamano, con mas contexto, pero requiere hardware de gama alta y no comparte la trazabilidad total de datos y logs propia de la familia OLMoE.

## Limitaciones y advertencias

- La cuantizacion es data-free y con redondeo al vecino mas cercano, sin dataset de calibracion; es esperable cierta degradacion en tareas sensibles a la precision, aunque no se ha cuantificado publicamente.
- No existen benchmarks de precision ni de throughput publicados para este checkpoint, por lo que cualquier uso en produccion exige una validacion propia contra el modelo base en BF16.
- El checkpoint deriva del modelo base preentrenado, no del Instruct; no sigue instrucciones de forma fiable ni esta optimizado para dialogos, tool calling o agentes.
- Longitud de contexto limitada a 4096 tokens, insuficiente para casos de contexto largo (documentos extensos, conversaciones muy largas).
- Modelo unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion caracteristico de un LM preentrenado con datos web; no incorpora mecanismos de grounding ni de citacion de fuentes.
- Sesgos potenciales heredados de los datos de preentrenamiento web a gran escala; el modelo base documenta su composicion de datos, pero no se ha publicado una evaluacion de sesgos para esta version cuantizada.
- Es una cuantizacion de terceros con cero descargas y cero likes en el momento de la consulta, no validada por AllenAI; conviene tratarla como un artefacto no oficial del modelo original.
- La mezcla de capas INT8 y BF16 depende del soporte de compressed-tensors en el backend; en runtimes sin esa ruta la carga puede fallar o degradarse a un camino mas lento.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados.

## Enlaces

- Checkpoint cuantizado en HuggingFace: https://huggingface.co/Xananthium/OLMoE-1B-7B-0924-INT8-W8A8
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0924
- Variante Instruct: https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct
- Repositorio oficial de OLMoE: https://github.com/allenai/OLMoE
- Paper "OLMoE: Open Mixture-of-Experts Language Models": https://arxiv.org/html/2409.02060v2
- Ficha de referencia del modelo base: https://www.aimodels.fyi/models/huggingFace/olmoe-1b-7b-0924-allenai
