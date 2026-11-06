# zephel01/Qwen3.8-Flash-Next-16G64G-GGUF

## Resumen

Qwen3.8-Flash-Next-16G64G-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01. El objetivo declarado es ejecutar un modelo MoE de 176.943.899.520 parámetros totales en un equipo de consumo con una GPU de 16 GB de VRAM y 64 GB de RAM, manteniendo la totalidad de los 512 expertos (sin poda de expertos). La cuantización se genera con la herramienta propia del autor, trench-gguf, aplicando LDLQ sobre los pesos en formato NVFP4 del modelo original.

La propuesta técnica diferencial es la reclasificación selectiva de expertos: las matrices gate/up se cuantizan en IQ3_XXS (la capa 2 en IQ3_S) y las matrices down en IQ4_NL, mientras que los tensores no expertos (atención, router, experto compartido, embeddings y la tabla de embeddings por capa) se heredan sin cambios del fichero UD-IQ3_XXS de unsloth. Según el autor, esto reduce la divergencia KL frente al modelo NVFP4 de 0,154 a 0,083 (-46 %) con un coste de velocidad prácticamente nulo (70,7 frente a 71,3 tok/s en tareas de código).

El modelo se distribuye en tres shards GGUF con un total de 86,9 GB y está marcado explícitamente como BETA: las mediciones proceden de un único PC emulado sobre una RTX 5090 con la VRAM limitada a 16 GB. La licencia del modelo base es qwen-community-1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; arquitectura GGUF `qwen4exp` |
| Parámetros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens verificados en llama.cpp (`-c 32768`); contexto máximo del modelo base no disponible |
| Tipos de cuantización | GGUF mixta: expertos gate/up IQ3_XXS (capa 2 IQ3_S), expertos down IQ4_NL, tabla de embeddings por capa IQ4_NL (28,8 GB), tensores no expertos heredados de UD-IQ3_XXS |
| Idiomas soportados | no disponibles oficialmente; el autor evalúa inglés, chino, japonés y código |
| Licencia | qwen-community-1.0 (license_name: other) |
| Formato de pesos | GGUF, 3 shards (`-00001-of-00003.gguf` a `-00003-of-00003.gguf`), con `SHA256SUMS` |
| Tamaño del repositorio | 86,9 GB |
| Resident (GPU + RAM) | 57,6 GB (excluye la tabla de embeddings por capa de 28,8 GB, leída desde SSD) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 176.943.899.520 parámetros totales, con 512 expertos según la model card. La arquitectura GGUF declarada es `qwen4exp`, soportada por llama.cpp a partir del commit upstream `ac8e1694d` del 29 de octubre de 2026. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha es el proceso de recuantización. El autor calcula matrices de Hessian sobre el modelo NVFP4 (magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF) usando 1,26 millones de tokens: 181 prompts propios de conversación (44 en japonés, 20 en chino, 20 en inglés, 37 de código, 35 de matemáticas y 25 de tool calling) seguidos de texto mixto en los mismos idiomas y dominios. Con esas Hessians aplica LDLQ para recuantizar cada experto desde los pesos NVFP4, con escalas por experto plegadas, y fusiona el resultado en el fichero UD-IQ3_XXS de unsloth. El pipeline se implementa en trench-gguf mediante `tools/hessian_dump.cpp`, `tools/requant_experts.py` y `tools/merge_experts.py`. El motor Abyss añade un drafter MTP para decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y japonés, con calidad verificada en pruebas de correo comercial, texto explicativo, resumen, dato literario y aritmética.
- Generación de código sujeta a tests ocultos: 4/5 y 3/5 en dos semillas sobre cinco tareas (frente a 5/5 y 4/5 del fichero de unsloth).
- Razonamiento con modo thinking activable; el autor advierte de que algunas tareas inducen sobre-razonamiento hasta el límite de 6.144 tokens.
- Recuperación en contexto largo: prueba de aguja en pajar con prompt de 8K tokens superada en Abyss y en llama.cpp.
- Tool calling y function calling: presente en los prompts de calibración de Hessians (25 prompts específicos), aunque no se documentan tasas de acierto.
- Capacidades multilingües limitadas a los idiomas evaluados; el resto no está caracterizado.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistente conversacional local en japonés: el modelo responde correctamente a correos comerciales, textos explicativos y resúmenes con hechos y sumas correctas en 10 de 10 ejecuciones, lo que lo hace adecuado para prototipos de atención al cliente en ese idioma sobre hardware de consumo.
- Generación de código en estaciones de trabajo con GPU de 16 GB: con 70,7 tok/s en decodificación y soporte de llama.cpp, permite integrar el modelo en flujos de autocompletado o revisión de parches donde no se dispone de clúster.
- Análisis de documentos largos: la ventana de 32.768 tokens verificada y la recuperación correcta en prompts de 8K permiten resumir contratos, informes o expedientes sin truncar.
- Despliegue en portátiles o equipos de gama media: el diseño 16G64G encaja en una GPU de 16 GB más 64 GB de RAM, con todos los expertos residentes en VRAM y RAM (sin lecturas de SSD para expertos).
- Evaluación e investigación de cuantizaciones: la métrica KL frente al modelo NVFP4 (0,083 en 10 secuencias de 1.023 tokens) y la tasa de coincidencia del token superior (89,3 %) permiten usar este fichero como referencia para estudiar el impacto de LDLQ en modelos MoE.
- Servicio de inferencia con llama.cpp: `llama-server` con `--n-cpu-moe 39` ofrece 29-34 tok/s y procesamiento de prompt de 1.618-1.627 tok/s, suficiente para un servidor interno de baja concurrencia.
- Traducción y generación asistida en chino e inglés: el autor incluye estos idiomas en el conjunto de calibración, aunque no publica métricas específicas de calidad por idioma.

## Benchmarks y rendimiento

Calidad frente al modelo NVFP4 de referencia (10 secuencias retenidas de 1.023 tokens: código, inglés, chino, japonés y otros), motor Abyss:

| Fichero | Descarga | Resident (GPU + RAM) | KL | Mismo token superior | KL japonés | KL código | Decodificación (3 tareas de código) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Este fichero** | 86,9 GB | 57,6 GB | **0,083** | **89,3 %** | **0,176** | **0,108** | 70,7 tok/s |
| unsloth UD-IQ3_XXS | 82,0 GB | 52,6 GB | 0,154 | 85,9 % | 0,317 | 0,176 | 71,3 tok/s |
| ISTA-DASLab GSQ-RCO IQ3_S | 83,6 GB | 54,8 GB | 0,117 | 87,3 % | 0,251 | 0,149 | 61,8 tok/s |
| unsloth UD-IQ4_XS (tier 24 GB) | 93,7 GB | 64,9 GB | 0,092 | 88,7 % | 0,195 | 0,116 | no disponible |

Pruebas de uso real (servidor Abyss, thinking activado, dos semillas, PC emulado):

| Prueba | Este fichero | unsloth UD-IQ3_XXS |
|---|---|---|
| Japonés (5 prompts) | 10/10 correctas | 10/10 |
| 5 tareas de código con tests ocultos | 4/5, 3/5 | 5/5, 4/5 |
| Prompt de 8K tokens, aguja en pajar | OK / OK | OK / OK |
| Respuestas vacías o eco de prompt | ninguna | ninguna |
| Procesamiento de prompt (8K) | 1.618-1.627 tok/s | 1.729-1.747 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB de GPU más 46 GB de RAM en un equipo de 64 GB (tier de RAM configurado en Abyss); el conjunto residente es de 57,6 GB, más 28,8 GB de tabla de embeddings leída desde SSD unas pocas filas por token.
- GPU recomendadas: el autor solo ha medido sobre una RTX 5090 de 32 GB emulando 16 GB (`STRATA_GLM_VRAM_GB=16`). Para una GPU de 16 GB real recomienda `--n-cpu-moe 40` o más en llama.cpp.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti, etc.) siempre que se acompañen de 64 GB de RAM; existe una variante para 24 GB (`Qwen3.8-Flash-Next-24G64G-GGUF`) y otra para 12 GB + 32 GB (`Qwen3.8-Flash-Next-12G32G-GGUF`).
- Despliegue: Abyss v1.3.108 o superior (requiere empaquetado previo con `tools/iq_pack.py --fast` y arranque con `--glm-pack`) y llama.cpp con arquitectura `qwen4exp` (upstream `ac8e1694d` o posterior). No se documenta soporte en vLLM, TGI ni Ollama.
- Rendimiento medido: 70,7 tok/s en decodificación con Abyss y MTP drafter; 29-34 tok/s en llama.cpp con `--n-cpu-moe 39`; 67-76 tok/s en japonés con Abyss; procesamiento de prompt de 1.618-1.627 tok/s (Abyss) y 1.729-1.747 tok/s (unsloth UD-IQ3_XXS).
- Almacenamiento: SSD NVMe necesario para la tabla de embeddings por capa; el autor indica que ningún experto requiere lecturas de SSD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KL vs NVFP4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.8-Flash-Next-16G64G (este)** | 176,9 B totales, 512 expertos | 32.768 verificados | 0,083 | qwen-community-1.0 | GGUF, 86,9 GB, 3 shards |
| unsloth UD-IQ3_XXS | mismo modelo base | no disponible | 0,154 | qwen-community-1.0 | GGUF, 82,0 GB |
| ISTA-DASLab GSQ-RCO IQ3_S | mismo modelo base | no disponible | 0,117 | qwen-community-1.0 | GGUF, 83,6 GB |
| unsloth UD-IQ4_XS (tier 24 GB) | mismo modelo base | no disponible | 0,092 | qwen-community-1.0 | GGUF, 93,7 GB |

Las tres alternativas son cuantizaciones del mismo Qwen3.8-Flash-Next, por lo que la comparación se limita a tamaño, fidelidad (KL) y velocidad. No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: todas las mediciones proceden de un único PC emulado sobre una RTX 5090; el autor solicita informes de GPUs de 16 GB reales y de otros tamaños de RAM.
- Menor rendimiento en código que el fichero de unsloth: 7 aciertos de 10 frente a 9 de 10 en las pruebas del autor. En dos fallos el modelo agotó el límite de 6.144 tokens de razonamiento en tareas que inducen sobre-razonamiento; se recomienda aumentar `max_tokens`.
- La tabla de embeddings por capa (28,8 GB) se lee desde SSD unas pocas filas por token; un almacenamiento lento degradará la latencia.
- Solo se han evaluado inglés, chino y japonés; no hay datos de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos del modelo base no caracterizados en la información disponible.
- Licencia qwen-community-1.0: es necesario revisar sus términos en el enlace del modelo base antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Soporte de motores limitado: Abyss y llama.cpp con la arquitectura `qwen4exp`; no se documenta compatibilidad con vLLM, TGI u Ollama.
- El repositorio relacionado `Qwen3.8-Flash-Next-16G64G-32G96G-GGUF` figura como trabajo en curso, por lo que la variante para 32 GB de GPU aún no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante para 24 GB de GPU: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-24G64G-GGUF
- Variante para 12 GB + 32 GB: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-12G32G-GGUF
- Variante en preparación 16G64G/32G96G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-32G96G-GGUF
- Modelo NVFP4 de origen: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramientas de cuantización trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de informes de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+16G64G+on+YOUR_GPU
