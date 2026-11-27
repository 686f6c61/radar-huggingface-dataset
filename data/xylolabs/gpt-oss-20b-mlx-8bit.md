# Xylolabs/gpt-oss-20b-MLX-8bit

## Resumen

gpt-oss-20b-MLX-8bit es una conversion cuantizada del modelo openai/gpt-oss-20b al formato MLX, realizada por Xylolabs para su uso con la libreria `mlx-lm` en hardware Apple Silicon. El modelo base es el gpt-oss-20b de OpenAI, un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 20.900 millones de parametros totales. Esta version mantiene los pesos originales MXFP4 de los expertos MoE y aplica cuantizacion afina de 8 bits (group size 64, escalas y sesgos en float16) a las capas de atencion, router, embedding de tokens y LM head.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~21.000 millones de parametros en equipos Apple con memoria unificada, manteniendo una fidelidad alta respecto a los pesos originales: segun la model card, la divergencia KL frente al modelo original es de 0,0699 en WikiText-2 y el acuerdo top-1 alcanza el 85,13%. El tamano del repositorio es de 12,1 GB, ligeramente inferior a la version BF16 (13,76 GB).

La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la model card remite a los ficheros `LICENSE`, `USAGE_POLICY` y `NOTICE` del repositorio. No se dispone de informacion sobre idiomas soportados, datos de entrenamiento ni benchmarks estandar en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base openai/gpt-oss-20b |
| Parametros totales | 20.914.755.648 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit affine (group size 64) en atencion, router, embedding y LM head; expertos MoE en MXFP4; normas, sesgos y attention sinks en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 12,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), del cual esta version conserva la estructura y los pesos de los expertos en su formato original MXFP4. La conversion a MLX afecta a las capas de atencion, el router, el embedding de tokens y el LM head, que pasan a cuantizacion afina de 8 bits con group size 64; las normas, sesgos y attention sinks se mantienen en float16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO, ya que la model card de esta conversion no los detalla.

La innovacion tecnica principal de esta ficha es el proceso de cuantizacion y su evaluacion: la model card reporta divergencia KL y acuerdo top-1 frente a los pesos originales (expertos MXFP4, resto BF16) sobre WikiText-2, datos de chat y texto reservado, con chunks de 512 tokens en proporcion 40/20/20. Los resultados muestran que la version 8-bit conserva mejor la distribucion del modelo original que la version 4-bit (KL de 0,0699 frente a 0,3549 en WikiText-2), a costa de un incremento de tamano de 11,47 GB a 12,08 GB. No se documentan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado `text-generation`.
- Razonamiento y respuesta a preguntas: la model card incluye una comprobacion de 7 preguntas que el modelo supera en todas las variantes (7/7).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque son propias del modelo base gpt-oss-20b.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta cumplimentado.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamano de 12,1 GB permiten ejecutar el modelo con `mlx-lm` en equipos con memoria unificada suficiente, sin necesidad de GPU dedicada. Adecuado para desarrolladores que quieren probar un MoE de ~21 B en local.
- Prototipado de asistentes conversacionales: el modelo soporta generacion de texto y conversacion, y la evaluacion de chat muestra un acuerdo top-1 del 89,75% frente al original, lo que lo hace util para iterar sobre prompts y flujos conversacionales antes de desplegar en produccion.
- Evaluacion comparativa de cuantizaciones: la model card proporciona metricas KL y top-1 frente a BF16 y 4-bit, lo que permite usar este modelo como referencia para estudiar el impacto de la cuantizacion 8-bit en tareas de texto y chat.
- Generacion de texto con fidelidad alta en entornos con restricciones de memoria: al mantener los expertos en MXFP4 y el resto en 8 bits, es adecuado para tareas donde se necesita un equilibrio entre calidad y huella de memoria, como resumen o redaccion asistida en local.
- Investigacion sobre modelos MoE cuantizados: util para analizar como afecta la cuantizacion selectiva (expertos vs. atencion) a la divergencia KL y al acuerdo top-1 en distintos dominios (WikiText-2, chat, texto reservado).
- Despliegue en pipelines de `mlx-lm`: integrable mediante `mlx_lm.generate` con la version 0.32.2 de la libreria, lo que facilita su inclusion en scripts de generacion por lotes o pruebas automatizadas en macOS.

## Benchmarks y rendimiento

La model card reporta metricas de fidelidad frente a los pesos originales (expertos MXFP4, resto BF16), no benchmarks estandar de tareas. Se reproducen a continuacion:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 11,47 GB | 0,354894 | 54,66% | 0,704089 | 67,49% | 0,452159 | 53,51% | 7/7 |
| MLX 8-bit | 12,08 GB | 0,069925 | 85,13% | 0,103656 | 89,75% | 0,074301 | 83,04% | 7/7 |
| BF16 | 13,76 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 7/7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 12,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada para cargar los pesos en 8-bit; la version 4-bit ocupa 11,47 GB y la BF16, 13,76 GB.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (serie M1, M2, M3, M4 y superiores); no se indica compatibilidad con GPU NVIDIA o AMD en la informacion disponible.
- Cabe en consumer GPU: no aplica en el sentido habitual; esta pensado para Mac con memoria unificada. Se recomienda un equipo con al menos 16 GB de memoria unificada para margen de trabajo, aunque el dato exacto no se especifica en la model card.
- Opciones de despliegue: `mlx-lm` version 0.32.2, mediante `mlx_lm.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato | Notas |
|---|---:|---|---:|---|---|---|
| Xylolabs/gpt-oss-20b-MLX-8bit | ~20,9 B | no disponible | 12,1 GB | Apache 2.0 | MLX safetensors | Conversion 8-bit para Apple Silicon |
| Xylolabs/gpt-oss-20b MLX 4-bit (referencia en model card) | ~20,9 B | no disponible | 11,47 GB | Apache 2.0 | MLX safetensors | Menor tamano, mayor divergencia KL (0,3549 en WikiText-2) |
| openai/gpt-oss-20b (BF16) | ~20,9 B | no disponible | 13,76 GB | Apache 2.0 | safetensors | Modelo base sin cuantizar; referencia de calidad |

No se dispone de datos de benchmarks estandar para comparar el rendimiento en tareas con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una conversion cuantizada, introduce divergencia respecto al modelo original: KL de 0,0699 en WikiText-2 y acuerdo top-1 del 85,13%, lo que implica diferencias en la distribucion de salida frente a BF16.
- La cuantizacion 8-bit es mas fiel que la 4-bit, pero sigue siendo una aproximacion; para tareas sensibles a la precision puede ser preferible el modelo base en BF16.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base openai/gpt-oss-20b, no documentados en esta ficha.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es una limitacion inherente a los modelos de lenguaje generativos.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card remite a `LICENSE`, `USAGE_POLICY` y `NOTICE`, que deben revisarse antes de produccion.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a equipos Apple Silicon con `mlx-lm` 0.32.2; no es portable directamente a otros runtimes sin conversion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-MLX-8bit
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio de utilidades del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
