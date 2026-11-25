# wrldsuksgo2mars/Hy4-flash-EXL3-K4-MC

## Resumen
Hy4-flash-EXL3-K4-MC es una cuantizacion de 4 bits del modelo tencent/Hy4-flash, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint de aproximadamente 109.010 millones de parametros en formato safetensors, construido con la herramienta ExLlamaV3 (EXL3) sobre una arquitectura de mezcla de expertos (MoE) y pensado para servir el modelo base con un consumo de VRAM notablemente inferior al de los pesos originales. El repositorio ocupa 296,5 GB en disco e incluye varias vistas de precision seleccionables mediante un fichero de metadatos propio (cuteafd-mc.json).

La particularidad del checkpoint es su estructura "multi-core": tres indices distintos comparten los mismos expertos cuantizados a K4, el router, los embeddings, el indexador comprimido, los tensores iHC y la torre de vision, mientras que la vista selecciona la precision del nucleo (core) y de las matrices DFly2 elegibles. El resultado son tres configuraciones con distinto tamano de carga indexada (203,07 GiB en la vista original, 196,37 GiB en k8-compact y 194,87 GiB en k6-compact).

Es relevante porque demuestra un flujo de cuantizacion agresiva sobre un modelo MoE grande con calibracion orientada a cargas agenticas (prompts con esquemas de function calling y razonamiento de alto esfuerzo), e incluye verificaciones de paridad bit a bit sobre las tablas Engram. No obstante, es un artefacto de nicho: requiere soporte especifico de la arquitectura Hy4-flash y kernels MUL1 para expertos enrutados, y depende de una libreria poco comun (cuteafd).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun tags del repositorio; detalles completos no disponibles |
| Parametros totales | 109.010.395.558 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bits (K4 en expertos compartidos), nucleo K8 y K6 compactos, variante FP8 opcional para tablas Engram |
| Idiomas soportados | no disponible (la calibracion incluye texto multilingue, pero no se declara cobertura oficial) |
| Licencia | tencent-hy-license (Tencent HY License) |
| Formato de pesos | safetensors (formato EXL3 trellis serializado), mas cuteafd-mc.json para seleccion de vista |

## Arquitectura y entrenamiento
El modelo base es tencent/Hy4-flash, del que este checkpoint hereda la arquitectura MoE. La model card menciona componentes concretos: expertos enrutados, router, embeddings, un "compressed indexer" (indexador comprimido, compatible con un mecanismo de atencion dispersa tipo DSA), tensores iHC, torre de vision y proyector, ademas de tablas Engram (memoria de lookup) en BF16. No se detalla el numero de capas, la dimension oculta ni el numero de expertos activos por token.

La cuantizacion se hizo con ExLlamaV3 en modo MUL1 (identificador 0x83DCD12D), lado 1 y escalas de salida automaticas. La calibracion combino 1.426 prompts agenticos (1.097.388 tokens) renderizados con la plantilla de chat de Hy4 y esfuerzo de razonamiento alto, mas 250 filas estandar de texto y tokens aleatorios (512.000 tokens), sumando 1.609.388 tokens. Se uso busqueda con semilla 787 y sigma 0,025, comprobacion de congruencia de Hadamard en FP64 y acumulacion Hessiana en FP64 con almacenamiento FP32 (maximo 128 filas por producto). Las reconstrucciones K8 del nucleo y K4 de expertos se propagaron en una pasada causal; K6 reutilizo las mismas Hessianas del nucleo y DFly2 empleo los estados ocultos, KV y selecciones del indexador en las capas 25, 29, 33, 37 y 41. Se verifico paridad de referencia con testigos de 2.709 tokens para DSA y SWA-wrap, aunque la calibracion no ejercita la seleccion DSA mas alla del corte top-2.048.

Las tablas Engram ocupan 118,02 GiB en cuatro shards BF16; la variante FP8 almacena 96 codigos E4M3 y una escala redondeada a BF16 por fila de 100 bytes, con 660.006.416 filas comparadas bit a bit sin discrepancias.

## Capacidades
- Generacion de texto y razonamiento: el modelo base es un LLM de proposito general; la cuantizacion preserva la funcionalidad, aunque no hay evaluacion publicada del checkpoint.
- Codigo y matematicas: la calibracion incluye codigo real y matematicas resueltas, lo que sugiere que estos dominios se tuvieron en cuenta al optimizar los pesos.
- Tool calling / function calling: la calibracion usa esquemas de llamadas a funciones renderizados con la plantilla del modelo, orientada a cargas agenticas.
- Razonamiento multi-paso y agentes: los prompts de calibracion se generaron con esfuerzo de razonamiento alto, lo que apunta a uso en pipelines agenticos.
- Vision: el checkpoint incluye torre de vision y proyector, por lo que conserva capacidad multimodal de entrada de imagen (sin detalles de resolucion ni evaluacion).
- Multilingue: la calibracion incluye texto multilingue, pero no se declara una lista oficial de idiomas.
- Memoria Engram: dispone de tablas de lookup de gran tamano (660 millones de filas) integradas en el checkpoint.

## Casos de uso
- Despliegue de un MoE de ~109.000 millones de parametros en hardware con menos VRAM que los pesos BF16: la cuantizacion K4 de expertos y K8/K6 del nucleo reduce la carga indexada a 194,87-203,07 GiB, lo que permite servir el modelo en nodos multi-GPU de 8x80 GB en lugar de requerir un cluster mayor.
- Agentes con tool calling: al haberse calibrado con esquemas de function calling y prompts de razonamiento alto, es adecuado para orquestadores que encadenan llamadas a APIs y razonamiento multi-paso.
- Asistencia a desarrollo de software: la calibracion incluye codigo fuente real, por lo que puede emplearse en generacion y revision de codigo dentro de pipelines internos, siempre que se valide la calidad tras la cuantizacion.
- Analisis de documentos con imagenes: la torre de vision y el proyector se conservan en el checkpoint, lo que permite tareas de extraccion de informacion de capturas, diagramas o formularios.
- Experimentacion en investigacion sobre cuantizacion: el repositorio publica errores por proyeccion (per-module-errors.csv) y recetas detalladas, lo que lo convierte en material util para estudiar el impacto de K4/K6/K8 en un MoE grande.
- Servicio de chat multilingue interno: la calibracion incorpora texto multilingue, aunque la cobertura por idioma debe validarse antes de produccion.
- Evaluacion comparativa de recetas EXL3: las tres vistas permiten medir el compromiso entre tamano (203,07 vs 196,37 vs 194,87 GiB) y fidelidad respecto al modelo original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta errores por proyeccion y cobertura de enrutamiento en per-module-errors.csv, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada: la vista original indexa 203,07 GiB de pesos; k8-compact 196,37 GiB y k6-compact 194,87 GiB. La variante FP8 de tablas Engram anade 61,47 GiB en disco. A esto hay que sumar cache KV y activaciones, no cuantificadas en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita; por el volumen de pesos se necesitan nodos multi-GPU de clase数据中心 (varios A100/H100 de 80 GB). No cabe en una RTX 4090 (24 GB) ni en GPUs de consumo.
- Consumer GPU: no. El checkpoint no es desplegable en hardware de consumo.
- Opciones de despliegue: requiere soporte de la arquitectura Hy4-flash y kernels MUL1 para expertos enrutados; los cargadores compatibles con multi-core seleccionan la vista mediante cuteafd-mc.json. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias
- Es un checkpoint cuantizado, no el modelo oficial: la calidad puede degradarse respecto a tencent/Hy4-flash, y no se publican evaluaciones que lo cuantifiquen.
- Dependencia de una libreria y kernels especificos (cuteafd, MUL1): la puesta en marcha esta en seguimiento en el issue #2478 del repositorio; no hay garantia de soporte en stacks estandar.
- La calibracion no ejercita la seleccion DSA mas alla del corte top-2.048, por lo que el comportamiento con contextos que activen esa ruta puede diferir del modelo original.
- Riesgo de alucinacion: inherente al modelo base; no hay evaluacion especifica tras la cuantizacion.
- Idiomas: no se declara lista oficial de idiomas soportados; la cobertura multilingue solo se infiere de la calibracion.
- Licencia: Tencent HY License (license: other). Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia open source estandar.
- Repositorio de nicho: 31 descargas y 1 like en el momento de la consulta, sin pipeline declarado; no es un artefacto con validacion comunitaria amplia.
- El repositorio ocupa 296,5 GB, lo que exige planificacion de almacenamiento y transferencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Hy4-flash-EXL3-K4-MC
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v2
- Issue de seguimiento de cuteafd: https://github.com/tpurtell/cuteafd/issues/2478
- Repositorio de la herramienta de cuantizacion: https://github.com/tpurtell/GPTQModel (commit 11a7bd422f40dcaa0222b5b75cc28f3e76b80c35)
- Licencia: fichero LICENSE dentro del repositorio de Hugging Face
