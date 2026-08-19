# thibaud-perrin/niverel-5b-v3-gpt-byte-seed1337

## Resumen

Niverel-5b-v3-gpt-byte-seed1337 es un modelo experimental de generacion de SVG a nivel de bytes, desarrollado por Thibaud Perrin dentro del proyecto Niverel. El nombre "5B" hace referencia al volumen del corpus de entrenamiento (5.000 millones de bytes), no al numero de parametros. El modelo cuenta con 133.041.600 parametros entrenables (~133 M) y combina una arquitectura GPT byte-level con componentes Mamba y h-net, segun las etiquetas publicadas en HuggingFace.

El modelo se entrena sobre el dataset thibaud-perrin/niverel-5b-research-svg-v5, un corpus de investigacion centrado en datos SVG. Es una release experimental que explora la generacion directa de formatos estructurados sin pasar por una tokenizacion textual intermedia. Su relevancia radica en el enfoque byte-level, que elimina la dependencia de tokenizadores y permite modelar directamente la estructura de bajo nivel de los datos.

La evaluacion oficial reporta un BPB (bits por byte) de 1,1266 en validacion y 1,1132 en test, metricas que miden la capacidad de compresion del modelo sobre datos byte-level. El checkpoint esta sellado con su revision de entrenamiento historica (SHA-256 `982b58740c4c3aa9784f7ac7b78eacf088e47e1f431e9b4a2b1f42cea48f0f4a`) y el tooling de release puede actualizarse sin modificar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT byte-level con componentes Mamba y h-net |
| Parametros totales | 133.041.600 (~133 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo byte-level, no orientado a idiomas naturales) |
| Licencia | other (restricciones no especificadas) |
| Formato de pesos | formato propietario de la libreria niverel (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo combina una arquitectura GPT a nivel de byte con componentes Mamba y h-net. Al operar directamente sobre bytes, no requiere tokenizador textual, lo que permite modelar la estructura de bajo nivel de los datos de entrada. La politica de frontera es `eod_only`, lo que implica que el modelo delimita las secuencias unicamente mediante el token de fin de datos (end-of-data).

El entrenamiento se realizo sobre el corpus Niverel de 5.000 millones de bytes, contenido en el dataset thibaud-perrin/niverel-5b-research-svg-v5, con un presupuesto de run del 100% del presupuesto 5B. No se dispone de informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion posterior. El checkpoint esta vinculado a su revision de entrenamiento historica (`0fa439519a316719980a35892b469b0b0433f7d8`), el dataset a la revision `84a211c5a64f9a6810c2659cbdf42eb1685153ec` y el tooling de release a la revision `ccc3db8cad56287543ebad42ad9343bc4c2092fd`. El seed del modelo es 1337.

## Capacidades

- Generacion de SVG a nivel de bytes: produce directamente secuencias de bytes que representan graficos vectoriales SVG.
- Modelado de datos estructurados de bajo nivel: al operar sin tokenizador, captura la estructura binaria o de bajo nivel de los datos.
- Compresion byte-level: las metricas BPB (bits por byte) cuantifican la capacidad de compresion del modelo sobre el corpus de validacion y test.
- Reproducibilidad experimental: checkpoint sellado con SHA-256 y vinculado a revisiones especificas de entrenamiento, dataset y tooling.
- Investigacion sobre arquitecturas hibridas: combina GPT con componentes Mamba (modelos de espacio de estados) y h-net, permitiendo estudiar arquitecturas hibridas en tareas byte-level.
- Evaluacion reproducible: instrucciones detalladas de evaluacion en Colab con A100, Python 3.12 y CUDA 12.8, con wheels compiladas para sm_80 y sm_90.

## Casos de uso

- Generacion de graficos vectoriales SVG: el modelo puede producir graficos SVG directamente desde bytes, util para prototipado de assets vectoriales o generacion procedural de iconos y diagramas.
- Investigacion en modelos byte-level: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas GPT, Mamba y h-net sin tokenizacion textual.
- Compresion de datos estructurados: las metricas BPB permiten evaluar el modelo como compresor de datos SVG, con aplicaciones en almacenamiento y transmision eficiente de graficos vectoriales.
- Estudio de arquitecturas hibridas: permite comparar el rendimiento de componentes Mamba y h-net frente a atencion completa en tareas de modelado de bajo nivel.
- Reproducibilidad de experimentos: al estar sellado el checkpoint y documentadas las revisiones, puede usarse como referencia en trabajos academicos sobre generacion byte-level.
- Exploracion de generacion de codigo estructurado: aunque el corpus es SVG, el enfoque byte-level podria extenderse a otros formatos estructurados como JSON, XML o protobuf en futuras investigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El modelo reporta metricas BPB (bits por byte) oficiales:

| Metrica | Valor |
|---|---|
| BPB validacion | 1,1266 |
| BPB test | 1,1132 |

Estas metricas miden la capacidad de compresion del modelo sobre datos byte-level y no son directamente comparables con benchmarks de lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 133 M de parametros, el modelo en fp32 ocuparia aproximadamente 532 MB, pero el formato de pesos propietario impide una estimacion precisa.
- GPU recomendadas: A100 (sm_80) y H100 (sm_90), para las que se proporcionan wheels CUDA compiladas.
- Compatibilidad con GPU de consumo: no confirmada; las wheels CUDA solo estan compiladas para sm_80 y sm_90, por lo que GPUs de consumo como la RTX 4090 (sm_89) podrian no ser compatibles sin recompilacion.
- Software requerido: Python 3.12, PyTorch 2.11 con CUDA 12.8, libreria niverel y extensiones CUDA locales.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue se realiza mediante la libreria niverel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El modelo combina una arquitectura GPT byte-level con componentes Mamba y h-net, una combinacion poco frecuente en el ecosistema open source, y el corpus de entrenamiento (SVG a nivel de bytes) es especifico del proyecto Niverel. No se han publicado datos comparativos frente a alternativas como ByT5 u otros modelos byte-level.

## Limitaciones y advertencias

- Modelo experimental: se trata de una release experimental orientada a investigacion, no a produccion.
- Licencia "other": las restricciones de uso, incluyendo uso comercial, no estan especificadas. Es necesario contactar con el autor para aclarar los terminos.
- Corpus especializado: el modelo esta entrenado exclusivamente sobre datos SVG; su capacidad para otros dominios o formatos no esta validada.
- Sin alineacion: no se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, por lo que el modelo puede generar contenido no deseado o incoherente.
- Riesgo de alucinacion: al operar a nivel de bytes, el modelo puede producir secuencias de bytes que no correspondan a SVG validos.
- Compatibilidad limitada: las wheels CUDA solo estan compiladas para sm_80 y sm_90; otras GPUs requieren recompilacion.
- Documentacion parcial: no se dispone de informacion sobre longitud de contexto, cuantizacion, idiomas soportados ni composicion detallada del dataset de entrenamiento.
- Adopcion nula: el modelo registra 0 descargas y 0 likes en HuggingFace, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thibaud-perrin/niverel-5b-v3-gpt-byte-seed1337
- Dataset de entrenamiento: https://huggingface.co/datasets/thibaud-perrin/niverel-5b-research-svg-v5
- Perfil GitHub del autor: https://github.com/thibaud-perrin
