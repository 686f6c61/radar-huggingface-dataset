# xv0y5ncu/SmolLM2-360M-Instruct-GLQ-4bpw

## Resumen

SmolLM2-360M-Instruct-GLQ-4bpw es una version cuantizada del modelo SmolLM2-360M-Instruct de Hugging Face TB, publicada por el usuario xv0y5ncu mediante la tecnica GLQ (Golay-Leech Quantization). El modelo base es un transformer decoder-only de 360 millones de parametros (173,8 millones segun los pesos safetensors de este repo) disenado para generacion de texto conversacional. Esta variante reduce el peso del modelo a 0,3 GB manteniendo, segun el autor, el 99,6 % de la calidad del modelo en bf16 en una evaluacion de cinco tareas.

La relevancia de esta ficha es principalmente tecnica: ilustra una tecnica de cuantizacion alternativa (basada en reticulos de Golay-Leech y transformadas de Hadamard) frente a metodos mas establecidos como GPTQ. El propio autor advierte que esta build concreta queda superada por una version posterior con trellis (3INST) que corrige un problema de padding y alcanza un ratio efectivo real de 4 bpw.

Conviene senalar que el modelo esta marcado como superseded en su propia model card y que el numero de descargas es muy bajo (41), por lo que debe tratarse como una pieza de experimentacion con cuantizacion, no como una opcion recomendada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 173.798.336 (pesos safetensors del repo cuantizado); el modelo base SmolLM2-360M-Instruct declara 360M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GLQ 4bpw (Golay-Leech Quantization, codebook de 4 bits); tasa efectiva de almacenamiento ~6,4 bpw por padding pow2 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-360M-Instruct, un transformer decoder-only de la familia SmolLM2 de Hugging Face TB. Sobre el no se ha reentrenado nada en este repo: la unica transformacion es la cuantizacion post-entrenamiento con GLQ, que sustituye los pesos en coma flotante por indices en un codebook basado en el reticulado de Leech (24 dimensiones) combinado con la matriz de Golay, aplicando transformadas de Hadamard para rotar los pesos antes de cuantizar. El autor indica que esta build usa padding FHT a potencias de 2 (hidden_size 960 redondeado a 1024), lo que infla la tasa efectiva de bits a ~6,4 bpw pese a la etiqueta de 4 bpw.

No se proporcionan en la informacion disponible datos sobre el dataset de entrenamiento del modelo base, numero de tokens, ni si hubo RLHF/DPO; esos detalles corresponden a la model card original de SmolLM2-360M-Instruct, no incluida aqui. La innovacion tecnica destacable es precisamente el esquema GLQ y su integracion con transformers (requiere transformers >= 5.0, torch >= 2.0 y glq >= 0.2.8) y con vLLM mediante `--quantization glq`.

## Capacidades

- Generacion de texto conversacional en formato instruct (el modelo base esta afinado para seguir instrucciones).
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 360M.
- Generacion de codigo sencillo y tareas de transformacion de texto, sin garantias en tareas complejas.
- Soporte de conversaciones multi-turno segun el formato de chat del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base SmolLM2 tiene cobertura multilingue limitada, pero no se detalla aqui).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el tamano del modelo lo hace poco adecuado para estas tareas.
- Vision y audio: no soportados.

## Casos de uso

- Experimentacion con tecnicas de cuantizacion: sirve para comparar GLQ frente a GPTQ W4 en un modelo pequeno, midiendo la degradacion en tareas de lm-eval antes de aplicar el metodo a modelos mayores.
- Despliegue en entornos con memoria muy limitada: con 0,3 GB de repo y ~0,24 GiB cargados en la version trellis recomendada, cabe en dispositivos edge, Raspberry Pi o GPUs integradas para generar texto corto.
- Prototipado rapido de pipelines de generacion de texto: permite levantar un endpoint compatible con text-generation-inference o vLLM en una maquina modesta para validar integraciones antes de pasar a un modelo mayor.
- Clasificacion y extraccion de informacion simple: tareas de etiquetado, resumen de frases cortas o reescritura de texto donde la latencia y el coste importan mas que la precision.
- Educacion e investigacion: ejemplo didactico de cuantizacion basada en reticulos y de como el padding afecta a la tasa efectiva de bits.
- Generacion de texto en aplicaciones offline o embebidas: asistentes de texto muy basicos donde no hay conectividad ni GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (lm-eval, 5 tareas: arc_easy, hellaswag, piqa, winogrande, lambada_openai):

| Metodo | Media | % de bf16 |
|---|---|---|
| bf16 | 0.5572 | 100 % |
| GLQ 4bpw (esta build) | 0.5548 | 99,6 % |
| GPTQ W4 (g64) | 0.4855 | 87,2 % |

El autor tambien reporta para la version trellis recomendada una perplejidad en wikitext-2 de 13,09 frente a 12,73 en bf16 (+2,7 %). No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~0,3 GB en disco para esta build; la version trellis recomendada carga 0,24 GiB. En inferencia con float16 y overhead de activaciones, el consumo es de menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y tambien en GPUs integradas o CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: vLLM con `--quantization glq`, transformers con `glq.hf_integration` (requiere transformers >= 5.0, torch >= 2.0, glq >= 0.2.8), y text-generation-inference segun los tags del repo. No se indica soporte de llama.cpp, Ollama o GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM2-360M-Instruct-GLQ-4bpw (este) | 173,8M en safetensors (base 360M) | no disponible | apache-2.0 | Cuantizacion GLQ, tasa efectiva ~6,4 bpw, superseded por version trellis |
| SmolLM2-360M-Instruct (bf16) | 360M | no disponible | apache-2.0 | Modelo base sin cuantizar, referencia de calidad (0.5572 en lm-eval) |
| SmolLM2-360M-Instruct-GLQ-trellis-3inst-4bpw | 360M (base) | no disponible | apache-2.0 | Version recomendada por el autor, 4 bpw real, 0,24 GiB, PPL 13,09 en wikitext-2 |
| SmolLM2-360M-Instruct con GPTQ W4 (g64) | 360M (base) | no disponible | apache-2.0 | Cuantizacion alternativa, 87,2 % de la calidad bf16 segun el autor |

## Limitaciones y advertencias

- Modelo marcado como superseded por el propio autor: la build trellis-3inst-4bpw corrige el padding pow2 y ofrece una tasa real de 4 bpw con mejor relacion calidad/tamano.
- La etiqueta "4bpw" es enganosa: la tasa efectiva de almacenamiento es ~6,4 bpw por el padding de hidden_size (960 a 1024), por lo que el ahorro real es menor del que sugiere el nombre.
- Requiere versiones muy concretas de dependencias (transformers >= 5.0, glq >= 0.2.8), lo que puede romper integraciones existentes.
- Riesgo de alucinacion elevado: con 360M de parametros, el modelo inventa hechos con facilidad y no es fiable para tareas de conocimiento factual.
- Capacidad de razonamiento y codigo limitada por el tamano; no apto para tareas complejas de agentes, matematicas o generacion de codigo en produccion.
- Idiomas soportados no documentados en esta ficha; se desconoce la calidad fuera del ingles.
- Uso comercial permitido por licencia Apache 2.0, pero la calidad del modelo base limita su aplicacion en produccion real.
- Numero de descargas y likes muy bajo (41 descargas, 0 likes), sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-4bpw
- Version recomendada (trellis 3INST 4bpw): https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-4bpw
- Version trellis 6bpw: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-6bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio GLQ en GitHub: https://github.com/cnygaard/glq
