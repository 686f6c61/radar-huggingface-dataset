# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8

## Resumen

Llama-3.1-8B-Instruct-Tensix-BFP8 es una cuantizacion del modelo meta-llama/Llama-3.1-8B-Instruct realizada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only original de Llama 3.1 con 8.030.261.248 parametros, pero redondea las capas lineales (proyecciones q, k, v, o de atencion y gate, up, down del MLP en las 32 capas) a formato block-floating-point de 8 bits (`ttnn.bfloat8_b`), mientras que el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16.

La relevancia de esta publicacion es que no se trata de una cuantizacion generica tipo GPTQ/AWQ para GPU, sino de un empaquetado que coincide exactamente con la rejilla numerica que consumen las NPU Tensix via TT-NN, evitando un segundo redondeo en el dispositivo. El resultado son 9.48 bits por peso de media y un tamano empaquetado de 9.52 GB (frente a los ~16 GB del checkpoint bf16 completo), lo que facilita el despliegue en hardware de inferencia de bajo consumo.

El modelo hereda todas las capacidades del Llama 3.1 8B Instruct original (contexto de 128.000 tokens, soporte multilingue en ocho idiomas, tool calling), y su licencia es la Llama 3.1 Community License. Es relevante para equipos que evaluan hardware alternativo a GPU para servir LLMs, aunque conviene senalar que las pruebas publicadas por el autor se han realizado sobre el simulador ttsim, no sobre silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con capas lineales cuantizadas a BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en proyecciones lineales; bf16 en embeddings, LM head y normas. 9.48 bits/peso de media |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16 en almacenamiento, valores ya alineados a la rejilla BFP8) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct original: transformer decoder-only denso con 32 capas, atencion multi-cabeza con RoPE y MLP con activacion SwiGLU. No se ha reentrenado ni ajustado el modelo; la unica transformacion es un redondeo post-entrenamiento de las matrices de proyeccion a la rejilla block-floating-point de 8 bits mediante GPTQ, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Cada bloque comparte un exponente propio que coincide con el que utiliza el empaquetador de TT-NN, de modo que el dispositivo no vuelve a redondear.

Los pesos bf16 de partida son byte-identicos a los de la rama principal de meta-llama/Llama-3.1-8B-Instruct, y los ficheros de configuracion, tokenizer y plantilla de chat son los de unsloth/Llama-3.1-8B-Instruct, incluidos sin modificaciones. El repositorio incluye `quant4.json`, que documenta el formato de cada proyeccion. La innovacion tecnica destacable es precisamente la alineacion de la cuantizacion con el formato nativo del hardware Tensix, lo que permite cargar los pesos empaquetados sin conversion adicional; el autor proporciona scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que ningun valor cambia tras el empaquetado.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat compatible con el formato Llama 3.1 Instruct.
- Razonamiento y respuesta a instrucciones, heredados del ajuste instructivo original de Meta.
- Generacion de codigo y asistencia en tareas de programacion.
- Razonamiento matematico basico y resolucion de problemas paso a paso.
- Soporte de tool calling / function calling segun el formato de Llama 3.1 Instruct.
- Capacidades multilingues en ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Capacidad de contexto largo heredada del modelo base (hasta 128.000 tokens segun la documentacion de Llama 3.1).
- No incluye vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal del checkpoint es servir el modelo en Wormhole o Blackhole aprovechando el formato BFP8 nativo de TT-NN, con un peso empaquetado de 9.52 GB que reduce la presion sobre la DRAM del dispositivo.
- Evaluacion de hardware alternativo a GPU: equipos que comparan el rendimiento de Tensix frente a GPU pueden usar este checkpoint como referencia directa del Llama 3.1 8B Instruct sin reentrenamiento.
- Atencion al cliente automatizada: al conservar la plantilla de chat y el comportamiento instructivo del modelo original, puede gestionar conversaciones multi-turno con contexto largo en los ocho idiomas soportados.
- Generacion de codigo en pipelines internos: el soporte de tool calling permite integrarlo en flujos de asistencia a desarrolladores o revision de codigo, siempre que el entorno de ejecucion sea compatible con TT-NN o transformers.
- Procesamiento de documentos multilingues: la combinacion de contexto largo y cobertura de idiomas europeos y asiaticos lo hace util para resumen y extraccion de informacion en corpus mixtos.
- Prototipado e investigacion en cuantizacion: el repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que sirven como base para estudiar el impacto del redondeo BFP8 en calidad de generacion.
- Inferencia en entornos con restricciones de memoria: el empaquetado de 9.52 GB permite cargar el modelo en dispositivos con menos memoria que la necesaria para el checkpoint bf16 completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una comprobacion de fidelidad numerica: en una prueba de prefill de 2 capas con tt-transformers (tt-metal v0.81.1) y la configuracion indicada, el resultado coincidio con transformers con un PCC de 0.9988. No se aportan datos de MMLU, HumanEval, GSM8K ni metricas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint empaquetado ocupa 9.52 GB; en bf16 para transformers se necesita aproximadamente el tamano del repo (16.1 GB) mas overhead de activaciones y cache KV.
- GPU recomendadas: no aplica como objetivo principal; el modelo esta pensado para NPU Tensix. Para ejecucion en GPU via transformers seria necesario hardware con al menos 16-24 GB de memoria (RTX 4090, A100, H100), aunque el autor no documenta este escenario.
- Cabe en consumer GPU: si, en GPUs con 24 GB o mas (por ejemplo RTX 4090) ejecutando la version bf16 mediante transformers, segun el tamano del repo; no se documenta soporte optimizado para este caso.
- Opciones de despliegue: TT-NN / tt-metal (version probada 0.81.1), tt-transformers con `--use_hf_rope`, tt-forge (tt-xla, aun no probado con este checkpoint), y transformers con `AutoModelForCausalLM` en bf16.
- Latencia y throughput: no disponibles. Las pruebas del autor se realizaron sobre el simulador ttsim (Blackhole), no sobre hardware real, por lo que no hay cifras de rendimiento fisico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Objetivo |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8 | 8,03 B | no disponible (base: 128k) | BFP8 en lineales, 9.48 bits/peso | llama3.1 | NPU Tensix (Tenstorrent) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | bf16 | llama3.1 | GPU/CPU generico |
| unsloth/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | bf16 (base para cuantizaciones) | llama3.1 | Fine-tuning y cuantizacion |
| Cuantizaciones GPTQ/AWQ de Llama 3.1 8B (genericas) | 8,03 B | 128.000 tokens | 4-8 bits para GPU | llama3.1 | Inferencia en GPU |

La diferencia clave frente a las alternativas es el formato de destino: las cuantizaciones GPTQ/AWQ habituales se disenan para kernels de GPU, mientras que esta version alinea los pesos con la rejilla `bfloat8_b` de TT-NN. En parametros, contexto y licencia es identico al modelo base de Meta.

## Limitaciones y advertencias

- El redondeo a BFP8 introduce perdida de precision en las proyecciones lineales; no se han publicado evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen ese impacto.
- Las pruebas de ejecucion se han realizado sobre el simulador ttsim, no sobre hardware Wormhole o Blackhole real; el rendimiento y la correccion en silicio no estan verificados por el autor.
- tt-forge (tt-xla) no se ha probado con este checkpoint; por defecto mantiene bf16 y sus opciones `bfp_bf8` y `bfp_bf4` no estan validadas con estos pesos.
- En tt-transformers es obligatorio pasar `--use_hf_rope`; sin ese flag el demo permuta las filas de q y k y vuelve a redondear el QKV fusionado, lo que altera el resultado.
- El demo de tt-transformers empaqueta el LM head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese entorno.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- Sesgos conocidos del Llama 3.1 original, no evaluados especificamente en esta version.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligaciones de atribucion y politicas de uso aceptable; es necesario revisar los terminos antes de un despliegue en produccion.
- El modelo no incluye vision, audio ni modo de razonamiento extendido.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Config y tokenizer de origen (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8/blob/main/LICENSE
