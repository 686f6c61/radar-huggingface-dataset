# thatacube/Qwen3.8-27B-MoE-GGUF

## Resumen

Qwen3.8-27B-MoE-GGUF es la distribucion en formato GGUF del modelo thatacube/Qwen3.8-27B-MoE, una conversion de Qwen3.8-27B (del equipo Qwen) en un modelo de mezcla de expertos (MoE) con 32 expertos por capa, de los cuales 19 estan activos mas un experto compartido. El resultado es un modelo de 27.331.680.256 parametros totales que conserva buena parte de la calidad del modelo denso original pero genera aproximadamente 1,5 veces mas rapido en una GPU de 8 GB, gracias a que los tensores de expertos pueden residir en RAM del sistema.

El repositorio lo publica el usuario thatacube bajo licencia Apache-2.0, con pesos cuantizados listos para llama.cpp (version b12110 o superior) e imatrix propia. Incluye la cabeza MTP (multi-token prediction) del modelo, lo que permite decodificacion especulativa opcional con un 67 % de borradores aceptados en 2x T4.

Es relevante ahora porque demuestra una via practica para ejecutar un modelo de ~27B en hardware de consumo modesto (RTX 5060 de 8 GB, Macs de 16-24 GB) manteniendo un rendimiento cercano al denso, con perdidas medibles y documentadas frente a Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): 32 expertos por capa, 19 activos + 1 experto compartido |
| Parametros totales | 27.331.680.256 |
| Parametros activos | no disponible (la model card indica 19 expertos activos + 1 compartido, sin cifra total de parametros activos) |
| Longitud de contexto | no disponible en la informacion proporcionada; los benchmarks mencionan needle in a haystack hasta 32k y pruebas de velocidad con contexto 128k y 256k (KV cache q8_0) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, IQ4_XS, mac16 (expertos IQ2_XXS + resto IQ3_XXS); imatrix incluida |
| Idiomas soportados | en, multilingual (la evaluacion Belebele cubre 15 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso del equipo Qwen, y lo convierte en una arquitectura MoE con 32 expertos por capa, 19 activos y un experto compartido. La model card no detalla el proceso de entrenamiento de la conversion (numero de tokens, composicion del dataset ni si hubo RLHF o DPO); remite a la model card principal de thatacube/Qwen3.8-27B-MoE para esa informacion, que no esta disponible en los datos proporcionados.

La innovacion tecnica destacable es la inclusion de la cabeza MTP del modelo, que habilita decodificacion especulativa con `--spec-type draft-mtp --spec-draft-n-max 3` en llama.cpp. Las cuantizaciones se generaron con llama.cpp b12110 (convert_hf_to_gguf.py a Q8_0 y despues llama-quantize con una imatrix de 147.000 tokens que cubre ingles, codigo, matematicas, chat y otros idiomas). La model card senala que los expertos en IQ3_XXS o IQ2_XS resultaron mas lentos que IQ4_XS en las dos GPUs probadas, por lo que no se publican.

## Capacidades

- Generacion de texto conversacional y no conversacional (pipeline text-generation).
- Razonamiento y conocimiento general: MMLU 78,6 %, ARC 73,4 %, HellaSwag 78,7 % (bf16).
- Matematicas: GSM8K 83,6 %, una mejora de +3,7 puntos frente al modelo denso.
- Tool calling / function calling: 95,8 % de llamadas validas (+2,0 frente al denso).
- Contexto largo: needle in a haystack al 100 % hasta 32k; la model card reporta pruebas de velocidad con contexto de 128k y 256k.
- Capacidades multilingues: Belebele en 15 idiomas con 84,5 % (-4,8 frente al denso); las lenguas de bajos recursos pierden mas (swahili -16, amharico -19).
- Modo thinking y modo no-thinking, con parametros de muestreo recomendados distintos para cada uno.
- Decodificacion especulativa opcional mediante la cabeza MTP incluida.
- No se mencionan capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con la cuantizacion Q4_K_M (16,85 GB) y 32 GB de RAM, el modelo se ejecuta en una RTX 5060 de 8 GB a 5,4-6,1 tok/s, lo que permite asistentes personales y prototipos sin depender de la nube.
- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (needle in a haystack al 100 % hasta 32k) y mantiene un 95,8 % de llamadas a herramientas validas, util para integrar consultas a sistemas internos.
- Agentes con tool calling: el alto porcentaje de llamadas validas y el modo thinking lo hacen adecuado para pipelines de agentes que encadenan busquedas, calculos y acciones sobre APIs.
- Razonamiento matematico asistido: GSM8K del 83,6 % permite usarlo en tutoria o verificacion de calculos, con la salvedad de que sigue siendo un modelo de lenguaje y puede alucinar pasos.
- Despliegue en servidores con 2x T4: a 16,3 tok/s con Q4_K_M y todo el modelo en GPU, es una opcion para servicios de generacion de texto en infraestructura modesta.
- Procesamiento de documentos largos: con contexto de 128k-256k (aunque la velocidad cae a 1,45-3,46 tok/s en 2x T4), sirve para resumen y extraccion sobre expedientes extensos.
- Experimentacion e investigacion: al ser Apache-2.0 y estar en GGUF, facilita la comparacion de tecnicas de cuantizacion (KL/top-1 documentados) y de decodificacion especulativa con MTP.

## Benchmarks y rendimiento

Calidad frente a Qwen3.8-27B denso (ambos en bf16):

| Benchmark | Qwen3.8-27B-MoE | Diferencia vs denso |
|---|---:|---:|
| MMLU | 78,6 % | -4,9 |
| ARC | 73,4 % | -0,8 |
| HellaSwag | 78,7 % | -3,6 |
| Belebele (15 idiomas) | 84,5 % | -4,8 |
| GSM8K | 83,6 % | +3,7 |
| Llamadas a herramientas validas | 95,8 % | +2,0 |
| Needle in a haystack | 100 % hasta 32k | no disponible |

Perdida de cuantizacion frente al Q8_0 del mismo modelo (llama-perplexity, 19,8k tokens reservados):

| Fichero | Tamano | KL | Top-1 |
|---|---:|---:|---:|
| Q8_0 | 29,1 GB | referencia | referencia |
| Q4_K_M | 16,85 GB | 0,031 | 93,3 % |
| IQ4_XS | 15,35 GB | 0,033 | 92,4 % |
| mac16 | 9,35 GB | 0,217 | 80,3 % |

Velocidad (llama-bench tg128):

| Configuracion | Denso Q4_K_M | MoE Q4_K_M | Aceleracion |
|---|---:|---:|---:|
| RTX 5060 8 GB, auto split, contexto 0 | 3,72 tok/s | 5,47 tok/s | 1,47x |
| RTX 5060 8 GB, auto split, contexto 4.096 | 3,22 tok/s | 5,40 tok/s | 1,68x |
| RTX 5060 8 GB, mejor split manual | 4,06 tok/s | 6,08 tok/s | 1,50x |
| 2x T4, contexto 0 | 13,48 tok/s | 16,34 tok/s | 1,21x |
| 2x T4, contexto 4.096 | 13,20 tok/s | 16,11 tok/s | 1,22x |
| 2x T4, contexto 128k (KV q8_0) | 3,27 tok/s | 3,46 tok/s | 1,06x |
| 2x T4, contexto 256k (KV q8_0) | 1,45 tok/s | 1,65 tok/s | 1,14x |

El procesamiento de prompt esta a la par del denso (0,91-1,01x). La decodificacion especulativa con MTP en 2x T4 acepta el 67 % de los borradores y aporta 1,08x.

## Requisitos de hardware

- VRAM/RAM segun cuantizacion: Q8_0 requiere 32 GB o mas de VRAM o memoria unificada (29,1 GB); Q4_K_M (16,85 GB) esta pensado para GPUs de 8-12 GB con 32 GB de RAM, GPUs de 24 GB o 2x 16 GB; IQ4_XS (15,35 GB) para GPUs de 16 GB y Macs de 24 GB; mac16 (9,35 GB) para Macs de 16 GB.
- GPUs probadas: RTX 5060 de 8 GB con 32 GB de RAM (5,4-6,1 tok/s con Q4_K_M) y 2x Tesla T4 (16,3 tok/s con Q4_K_M y todo el modelo en GPU).
- Cabe en GPU de consumo: si, con Q4_K_M en una RTX 5060 de 8 GB usando `--fit on` o `-ngl 99 -ncmoe N` (el mejor valor medido en RTX 5060 fue N = 60). Las filas para GPU de 16 GB y Mac son estimaciones del autor a partir del tamano de fichero; no se probo en hardware Apple.
- Opciones de despliegue: llama.cpp (llama-server, b12110 o superior), con descarga directa via `-hf`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: ver tabla de velocidad; el KV cache en q8_0 es necesario para contextos de 128k y 256k, donde el throughput cae por debajo de 3,5 tok/s en 2x T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (MMLU) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3.8-27B-MoE (este) | 27,3B totales, 19+1 expertos activos | no disponible (probado hasta 256k) | 78,6 % | Apache-2.0 | GGUF en HF |
| Qwen3.8-27B (denso, base) | 27B | no disponible | 83,5 % (78,6 + 4,9) | Apache-2.0 | safetensors/bf16 en HF |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa disponible es con el modelo denso del que deriva: el MoE pierde 4,9 puntos en MMLU y 3,6 en HellaSwag, pero gana 3,7 en GSM8K y 2,0 en llamadas a herramientas validas, a cambio de una aceleracion de 1,2-1,7x segun hardware.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de lenguaje generativo; la model card no reporta tasas de alucinacion especificas.
- Perdida de calidad frente al denso: -4,9 en MMLU, -3,6 en HellaSwag y -4,8 en Belebele; el autor documenta la proporcion de respuestas identicas en la model card principal.
- Idiomas de bajos recursos muy degradados: swahili -16 y amharico -19 frente al modelo denso.
- La cuantizacion mac16 (9,35 GB) tiene una calidad claramente inferior (KL 0,217, top-1 80,3 %); solo recomendable si el hardware es muy limitado.
- Las cifras para GPU de 16 GB y Mac son estimaciones del autor; no se probo en Apple Silicon.
- El repositorio figura como borrador (DRAFT, 2026-11-25) con tareas pendientes de subida y verificacion de ficheros; las descargas y likes son 0, lo que indica poca validacion externa.
- Requiere llama.cpp b12110 o superior; versiones anteriores pueden no soportar la cabeza MTP ni `--fit on`.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es una version modificada de Qwen3.8-27B; conviene revisar los terminos y la atribucion del modelo base en la model card principal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/thatacube/Qwen3.8-27B-MoE-GGUF
- Modelo base MoE: https://huggingface.co/thatacube/Qwen3.8-27B-MoE
- Modelo denso original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: no disponible enlace directo en la informacion proporcionada
