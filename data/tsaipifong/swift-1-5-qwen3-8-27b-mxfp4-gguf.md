# tsaipifong/Swift-1.5-Qwen3.8-27b-MXFP4-GGUF

## Resumen

Este repositorio contiene una cuantización comunitaria no oficial en GGUF con tipo MXFP4 de Swift 1.5 Qwen3.8-27B, un modelo denso de 27.320.697.856 parámetros publicado por UkisAI como derivado post-entrenado de Qwen/Qwen3.8-27B. La cuantización corre a cargo del usuario tsaipifong y conserva la capa MTP (multi-token prediction) para habilitar decodificación auto-especulativa en llama.cpp.

El objetivo del modelo original es abaratar el razonamiento: según UkisAI, Swift 1.5 consume un 58,5 % menos de tokens de pensamiento que la base, obtiene un 0,35 % más de puntuación y acelera varias tareas hasta 9,18×. Esta cuantización traslada ese comportamiento a ficheros de 15,5–16,1 GB, manejables en GPU de consumo de 24 GB.

Se publican tres variantes que solo difieren en el cabezal de salida (`output.weight`): Q6_K (recomendada por el autor), Q8_0 y Q4_K, con perplejidades de 3,8271, 3,8289 y 3,8386 respectivamente. Los ficheros son solo texto: el codificador de visión no está incluido y no se distribuye ningún fichero `mmproj`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y capas de atención lineal/SSM, más una capa MTP; derivado de Qwen3.8-27B |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (matrices principales de las 64 capas), Q8_0 (`token_embd`, `ssm_alpha`/`ssm_beta`, capa MTP), F32 (normas, `ssm_a`, `ssm_conv1d`, `ssm_dt.bias`, `nextn.enorm/hnorm/shared_head_norm`), cabezal de salida Q6_K (A) / Q8_0 (B) / Q4_K (C) |
| Idiomas soportados | no disponible (el corpus de perplejidad empleado por el autor mezcla chino e inglés) |
| Licencia | swift-open-license-1.0 (`license: other`) |
| Formato de pesos | GGUF; el modelo base está en safetensors BF16 |
| Autor de la cuantización | tsaipifong (no oficial, sin afiliación con UkisAI ni Alibaba Cloud) |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b, derivado de Qwen/Qwen3.8-27B |
| Variantes incluidas | A: `MXFP4-A-outQ6_K.gguf` (15.815.469.280 B); C: `MXFP4-C-outQ4_K.gguf` (15.487.686.880 B); B: `MXFP4-B-outQ8_0.gguf` (16.123.386.080 B) |
| Tamaño del repositorio | 47,4 GB (los tres ficheros) |
| Fecha de publicación | 1 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El volcado de tensores de la conversión a GGUF (866 tensores, 65 bloques: 64 capas principales más la capa MTP `blk.64`) muestra una arquitectura híbrida: bloques de atención con puerta (`attn_qkv`, `attn_gate`, `attn_output`) y bloques de atención lineal de tipo SSM (`ssm_out`, `ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_conv1d`, `ssm_dt.bias`), con 48 capas de atención lineal identificadas en las reglas de cuantización. Cada capa añade una FFN con puerta (`ffn_gate`, `ffn_up`, `ffn_down`). Es, por tanto, un modelo denso híbrido atención/SSM: aunque el fichero declara `general.file_type = 38` (MXFP4_MOE) porque el build de llama.cpp empleado no tiene un ftype MXFP4 denso, el modelo no es un MoE.

UkisAI describe Swift 1.5 como un derivado post-entrenado de Qwen3.8-27B orientado a tareas agénticas de horizonte largo y a código, construido sobre Swift 1.0. El objetivo declarado es reducir el número de tokens de pensamiento (58,5 % menos) manteniendo o mejorando la puntuación (+0,35 %) y acelerando varias tareas hasta 9,18×. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni sobre el uso de RLHF o DPO. La innovación técnica relevante en esta cuantización es la conservación de la capa MTP (`qwen35.nextn_predict_layers = 1`) para autodecodificación especulativa. El proceso de conversión usó `convert_hf_to_gguf.py --outtype bf16` (llama.cpp `b10645-47-gef6876693`) y la cuantización se hizo con `llama-quantize` del build 11214 (commit 2ebd9ae62, compilación ROCm), aplicando `--tensor-type-file` con reglas por tensor e `--imatrix`.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento con tokens de pensamiento, optimizado para consumir muchos menos que el modelo base (58,5 % menos según UkisAI).
- Tareas agénticas de horizonte largo: es el foco declarado del post-entrenamiento de Swift 1.5.
- Generación y asistencia de código: segundo eje declarado del post-entrenamiento.
- Decodificación auto-especulativa mediante la capa MTP retenida, pensada para acelerar la generación token a token.
- Capacidades multilingües: no declaradas en este repositorio; la única evidencia indirecta es que el corpus de perplejidad del autor contiene chino e inglés.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Visión: no soportada. El codificador de visión no está incluido y no hay `mmproj`.
- Audio: no disponible.
- Modo de pensamiento explícito con control de presupuesto: el autor upstream reporta reducción de tokens de razonamiento, pero no se documenta una API de control de esfuerzo.

## Casos de uso

- Asistentes de razonamiento con presupuesto de tokens ajustado: al reducir un 58,5 % los tokens de pensamiento frente a la base, baja el coste por consulta en tareas de razonamiento multi-paso sin degradar la puntuación declarada.
- Agentes de larga duración: el post-entrenamiento se centró en tareas agénticas de horizonte largo, por lo que encaja en pipelines que encadenan muchas llamadas y herramientas con estado persistente.
- Asistencia de código en local: un fichero de 15,8 GB se puede servir con llama.cpp u Ollama en una GPU de 24 GB, lo que permite autocompletado, revisión de diffs y generación de tests sin enviar código a servicios externos.
- Despliegue on-premise con requisitos de privacidad: al ser pesos abiertos y ejecutarse íntegramente en local, es apto para entornos con datos sensibles que no pueden salir de la infraestructura propia.
- Investigación en decodificación especulativa: la capa MTP conservada permite experimentar con self-speculative decoding y comparar longitudes de borrador automáticas con el decodificado greedy plano.
- Evaluación comparativa de cuantizaciones MXFP4: las tres variantes (cabezal Q6_K, Q8_0 y Q4_K) permiten medir el impacto del cabezal de salida en perplejidad y velocidad sobre el mismo cuerpo de pesos.
- Chat multi-turno de propósito general: hereda el comportamiento conversacional de la familia Qwen3.8, con la salvedad de que la longitud de contexto no está documentada en esta ficha.

## Benchmarks y rendimiento

El autor de la cuantización publica una medición de perplejidad con `llama-perplexity` (llama.cpp b11214, `-c 2048 -b 512 -ub 512 -fa on`, 51 fragmentos de un corpus mixto chino/inglés de código de 219 KB, sobre una R9700):

| Fichero | Perplejidad (PPL) |
|---|---|
| A (cabezal Q6_K) | 3,8271 ± 0,0394 |
| B (cabezal Q8_0) | 3,8289 ± 0,0395 |
| C (cabezal Q4_K) | 3,8386 ± 0,0396 |
| Referencia: Qwen3.8-27B MXFP4 (FreedomAISVR) | 3,7952 ± 0,0384 |

Los tres cabezales están dentro del ruido entre sí (C es un 0,3 % peor). El propio autor advierte que Swift es un fine-tune distinto del Qwen base, por lo que su perplejidad no es directamente comparable con la de la cuantización de Qwen3.8-27B.

Datos declarados por UkisAI para el modelo original (no medidos sobre esta cuantización): 58,5 % menos de tokens de pensamiento, 0,35 % más de puntuación agregada que la base y 9,18× de aceleración en varias tareas. Las páginas de UkisAI comparan Qwen3.8-27B, Swift 1.0 y Swift 1.5 con protocolos guardados y medias de cinco repeticiones, pero los valores concretos no están disponibles en la información proporcionada.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con offload completo en GPU: aproximadamente 16–18 GB para el fichero A (14,7 GiB de pesos más caché KV y buffers de cómputo), en función de la longitud de contexto. Estimación derivada del tamaño de fichero, no medida por el autor.
- GPU de consumo: los tres ficheros caben con margen en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB o más de VRAM. En tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) el ajuste es muy justo y probablemente requiera offload parcial de capas a CPU. Con 12 GB o menos, offload parcial obligatorio.
- GPU profesionales: A100 40/80 GB, H100, L40S o RTX 6000 Ada sirven sin problema, aunque el modelo no aprovecha el paralelismo masivo propio de un MoE al ser denso.
- Opciones de despliegue: llama.cpp (se requiere un build con soporte de MXFP4; el autor usó el 11214, commit 2ebd9ae62), Ollama, LM Studio y otros frontales basados en llama.cpp. El soporte de GGUF MXFP4 en vLLM o TGI no está documentado en la información disponible.
- Latencia y throughput: no disponible. El autor solo indica que la capa MTP habilita decodificación auto-especulativa y que el uso de Q8_0 en `token_embd`, `ssm_alpha/beta` y la capa MTP cuesta aproximadamente un 1–2 % de velocidad de prefill frente a la cuantización MXFP4 uniforme de referencia.
- Nota de compatibilidad: el metadato `general.file_type = 38` (MXFP4_MOE) puede confundir a herramientas que infieran el tipo de modelo a partir de ese campo; el modelo es denso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsaipifong/Swift-1.5-Qwen3.8-27b-MXFP4-GGUF | 27,3 B | no disponible | GGUF; MXFP4 + Q8_0 + F32, cabezal Q6_K/Q8_0/Q4_K | swift-open-license-1.0 | 0 descargas, 0 likes; cuantización comunitaria |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible (base del anterior) | no disponible | safetensors BF16 | swift-open-license-1.0 | oficial |
| ukisai/Swift-1.5-Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | swift-open-license-1.0 | oficial |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | no disponible | no disponible | GGUF mixto de precisión (incluye `IQ3_S-mtp`) | swift-open-license-1.0 | oficial, vía HuggingFace y ModelScope |
| FreedomAISVR/Qwen3.8-27B-MXFP4-GGUF | no disponible (denominado 27B) | no disponible | GGUF MXFP4 uniforme con cabezal Q6_K | no disponible | comunidad; PPL de referencia 3,7952 |
| Qwen/Qwen3.8-27B | no disponible (denominado 27B) | no disponible | safetensors | no disponible | oficial de Alibaba Cloud |

Diferencias clave de esta cuantización frente a la referencia MXFP4 de FreedomAISVR: aquí `token_embd`, `ssm_alpha/beta` y la capa MTP están en Q8_0 en lugar de MXFP4, lo que cuesta un 1–2 % de prefill pero busca preservar la fidelidad de la decodificación especulativa en el motor del autor.

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio no está afiliado, respaldado ni soportado por UkisAI ni por Alibaba Cloud, y usa las marcas "Swift" y "UkisAI" solo de forma descriptiva.
- Solo texto: el codificador de visión no está incluido y no hay fichero `mmproj`, por lo que no sirve para tareas multimodales aunque el modelo base pudiera soportarlas.
- Sin validación de la comunidad: 0 descargas y 0 likes, con el repositorio creado y actualizado el mismo día (1 de octubre de 2026).
- No se re-evalúa la calidad del modelo: el autor remite al repositorio upstream para el enfoque de entrenamiento y los resultados de benchmarks.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de idioma: no se declaran idiomas soportados; solo hay evidencia indirecta de chino e inglés en el corpus de perplejidad del autor.
- Limitación de contexto: la longitud de contexto no está especificada en la información disponible.
- Licencia: `swift-open-license-1.0` es una licencia propia con `license: other`. Los términos concretos deben consultarse en el enlace de licencia del repositorio upstream; no se dispone de confirmación explícita sobre uso comercial.
- La imatrix empleada (elaborada por bartowski, 496 entradas, 582 fragmentos) es ignorada por llama.cpp mainline en MXFP4 y en Q8_0, por lo que solo afecta al cabezal K-quant; el fichero B es efectivamente equivalente a no usar imatrix.
- La decisión de mantener `ssm_alpha` y `ssm_beta` en Q8_0 en lugar de F32 se tomó para el motor interno del autor (preservar salida bit a bit idéntica entre decodificación plana y verificación MTP); no se documenta el impacto fuera de ese motor.
- El metadato de tipo de fichero declarado (MXFP4_MOE) no se corresponde con la naturaleza densa del modelo y puede provocar comportamientos inesperados en herramientas de inspección o en runtimes que lo interpreten literalmente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/tsaipifong/Swift-1.5-Qwen3.8-27b-MXFP4-GGUF
- Modelo base oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Cuantizaciones oficiales GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF/blob/main/README.md
- Cuantizaciones GSQ-RCO: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-mtp.gguf
- Espejo en ModelScope: https://www.modelscope.cn/models/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Página del modelo en UkisAI (comparativa de resultados): https://ukisai.com/swift-1-5-27b
- Catálogo de modelos de UkisAI: https://ukisai.com/models
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.8-27B
- Imatrix e imatrix-GGUF de referencia: https://huggingface.co/bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF
- Cuantización MXFP4 de Qwen3.8-27B usada como referencia de PPL: https://huggingface.co/FreedomAISVR/Qwen3.8-27B-MXFP4-GGUF
