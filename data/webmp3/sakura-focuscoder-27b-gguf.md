# webmp3/Sakura-FocusCoder-27B-GGUF

## Resumen

Sakura-FocusCoder-27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Alibaba, publicado por el usuario webmp3 bajo el identificador `webmp3/Sakura-FocusCoder-27B-GGUF`. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a generación de código y razonamiento algorítmico, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. Su propuesta principal es corregir un problema concreto del modelo base: la tendencia a agotar el límite de tokens de salida sin llegar a completar el razonamiento ni emitir una solución válida.

El modelo se apoya en la arquitectura Qwen3.5/Qwen3.8 (identificada como `qwen35` en llama.cpp) e incorpora tensores MTP (multi-token prediction), lo que permite decodificación especulativa y acelera la generación. El autor lo publica con licencia Apache 2.0 y declara soporte para inglés y chino. El contexto probado por el autor es de 32.768 tokens, aunque no se especifica la longitud máxima nativa del modelo base.

Su relevancia actual radica en que aborda un problema práctico muy habitual en modelos con modo de razonamiento extenso: el desperdicio de presupuesto de tokens en tareas de código. Según las mediciones del autor, el ajuste reduce el consumo de tokens de salida y aumenta la tasa de tareas resueltas frente al Qwen3.8-27B original en un conjunto reducido de seis problemas algorítmicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.8 (identificador `qwen35` en llama.cpp), con tensores MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens probados por el autor; máximo nativo no disponible |
| Tipos de cuantizacion | Q3_K_M (17,3 GB) e IQ3_S (13,6 GB); ambas incluyen tensores MTP |
| Idiomas soportados | inglés y chino (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parámetros. La ficha del autor no detalla la composición del dataset de ajuste fino, el número de tokens empleados ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se documenta es el objetivo del ajuste: que el modelo termine su razonamiento y entregue una respuesta dentro del presupuesto de tokens, en lugar de agotar el límite de 16.384 tokens de salida sin solución válida. Los archivos GGUF incluyen los tensores MTP del modelo base, lo que habilita decodificación especulativa con un modelo borrador (el autor cita DFlash en su entorno de pruebas).

El autor probó el modelo con la plantilla de chat embebida en el archivo GGUF y con el modo de razonamiento (thinking) activado por defecto. No se especifica el proceso exacto de cuantización más allá de los dos niveles publicados, ni se documenta si el ajuste se realizó sobre pesos completos o directamente sobre cuantizaciones.

## Capacidades

- Generación de código en tareas algorítmicas de estilo LeetCode/AtCoder, con razonamiento previo explícito (thinking mode).
- Razonamiento multi-paso con control del presupuesto de tokens: el ajuste busca evitar que el modelo agote el límite sin concluir.
- Generación de texto conversacional en inglés y chino.
- Decodificación especulativa mediante tensores MTP, compatible con llama.cpp.
- Integración con el endpoint compatible con OpenAI de llama-server (`/v1`).
- Compatibilidad declarada con Ollama (no probada por el autor), requiriendo una versión reciente que soporte la arquitectura `qwen35`.
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso

- Resolución de problemas algorítmicos en pipelines de evaluación: el modelo puede emplearse para generar soluciones a problemas de programación competitiva con razonamiento explícito, y su ajuste para concluir dentro del límite de tokens reduce el coste de reintentos y el desperdicio de cómputo en runners automatizados.
- Asistente de código en local con GPU de 16 GB: la cuantización IQ3_S (13,6 GB) está pensada para GPUs de clase 16 GB, lo que permite desplegar un modelo de 27B en hardware de consumo o estaciones de trabajo modestas sin depender de la nube.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp u Ollama, el modelo es adecuado para equipos que no pueden enviar código propietario a APIs externas.
- Automatización de pruebas y corrección de código: el modelo puede integrarse en scripts que generan soluciones candidatas y las validan contra tests ocultos, aprovechando su orientación a tareas con verificación automática.
- Servicio de inferencia compatible con OpenAI: mediante `llama-server` con `--jinja`, se puede exponer un endpoint `/v1` que sustituya a APIs comerciales en prototipos y herramientas internas sin cambiar el código cliente.
- Experimentación con decodificación especulativa: los tensores MTP incluidos permiten a investigadores medir el impacto de un modelo borrador en latencia y throughput sobre una arquitectura Qwen3.5/3.8 de 27B.
- Evaluación comparativa de fine-tunes: sirve como referencia en estudios de ajuste fino orientados a controlar la longitud de razonamiento, dado que el autor publica metodología y resultados por tarea.

## Benchmarks y rendimiento

Los datos provienen de un conjunto local congelado de seis tareas algorítmicas duras (estilo LeetCode/AtCoder) con tests ocultos, una ejecución por tarea y semilla, con llama.cpp b12189 (CUDA) sobre una NVIDIA L40S y decodificación especulativa con un modelo borrador DFlash. Muestreo: temperatura 0,6, top-p 0,95, top-k 20, min-p 0, máximo 16.384 tokens de salida, thinking activado y contexto de 32.768.

| Modelo | Archivo probado | Semilla 42: resueltas | Tokens de salida (42) | Semilla 43: resueltas | Tokens de salida (43) | Resueltas, ambas semillas |
|---|---|---|---|---|---|---|
| FocusCoder-27B (17,3 GB) | Q3_K_M-MTP | 5/6 | 63.990 | 5/6 | 58.886 | 10/12 |
| FocusCoder-27B (13,6 GB) | IQ3_S-16GB-MTP | 5/6 | 51.601 | 5/6 | 65.366 | 10/12 |
| Qwen3.8-27B | Q4_K_M (ggml-org) | 1/6 | 83.151 | no probado | no probado | no disponible |
| Coder390-EfficientThink | Q3LynnStyle-MTP | 4/6 | 70.007 | 3/6 | 62.218 | 7/12 |
| qwen-concept-27b | Q4_K_M | 4/6 | 54.102 | 4/6 | 64.119 | 8/12 |
| Swift-1.5-Qwen3.8-27B | Q5_K_M | 4/6 | 76.848 | no probado | no probado | no disponible |
| Thinklite-27B | Q4_K_M | 4/6 | 69.314 | no probado | no probado | no disponible |

Resultados por tarea (semilla 42), con tokens de salida consumidos:

| Modelo | Tarea 27 | Tarea 15 | Tarea 10 | Tarea 8 | Tarea 9 | Tarea 11 |
|---|---|---|---|---|---|---|
| FocusCoder-27B (17,3 GB) | pasa 10.778 | límite 16.384 | pasa 15.548 | pasa 10.935 | pasa 9.205 | pasa 1.140 |
| FocusCoder-27B (13,6 GB) | pasa 13.027 | límite 16.384 | pasa 10.332 | pasa 4.123 | pasa 6.753 | pasa 982 |
| Qwen3.8-27B | pasa en límite 16.384 | límite 16.384 | pasa en límite 16.384 | pasa en límite 16.384 | límite 16.384 | pasa 1.231 |
| Coder390-EfficientThink | pasa 14.610 | límite 16.384 | límite 16.384 | pasa 8.054 | pasa 12.307 | pasa 2.268 |
| qwen-concept-27b | falla 10.772 | límite 16.384 | pasa 10.474 | pasa 5.779 | pasa 9.914 | pasa 779 |
| Swift-1.5-Qwen3.8-27B | pasa 16.132 | límite 16.384 | pasa 13.212 | pasa 13.676 | límite 16.384 | pasa 1.060 |
| Thinklite-27B | pasa 13.366 | límite 16.384 | límite 16.384 | pasa 10.556 | pasa 12.129 | pasa 495 |

Prueba de rechazos (104 prompts de `mlabonne/harmful_behaviors`, decodificación greedy, thinking desactivado, máximo 100 tokens nuevos; recuento basado en frases, no es una evaluación de seguridad):

| Modelo | Rechazos directos (de 104) | Cualquier frase de rechazo o aviso (de 104) | Respuestas degeneradas |
|---|---|---|---|
| Qwen3.8-27B (Q4_K_M) | 103 | 103 | no medido |
| FocusCoder-27B (17,3 GB) | 5 | 52 | 0 |
| FocusCoder-27B (13,6 GB) | 8 | 48 | 0 |

El propio autor advierte que la muestra es pequeña (seis tareas, una o dos semillas) y no constituye una clasificación estadísticamente fiable. La tarea 15 no fue resuelta por ningún modelo en ninguna ejecución.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,3 GB para el archivo Q3_K_M y 13,6 GB para el IQ3_S, a los que hay que sumar la memoria de la caché KV según el contexto configurado (32.768 tokens en las pruebas del autor).
- GPU de referencia en las mediciones: una NVIDIA L40S (48 GB), con decodificación especulativa mediante modelo borrador DFlash.
- GPU de consumo: el archivo IQ3_S está diseñado explícitamente para GPUs de clase 16 GB; el Q3_K_M requiere algo más de 17 GB, por lo que encaja en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen para caché KV.
- Despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl 99` y `-c 32768`) y Ollama (no probado por el autor; requiere soporte de la arquitectura `qwen35`). No se documenta compatibilidad con vLLM ni TGI, ya que solo se distribuyen pesos GGUF.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo se reportan totales de tokens de salida consumidos por tarea. Los resultados dependen del hardware y del runtime y no son directamente comparables con otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resueltas (2 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FocusCoder-27B | 27,3 mil millones | 32.768 probados | 10/12 | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.8-27B (base) | 27,3 mil millones | no disponible | 1/6 (solo semilla 42) | no disponible en la información | GGUF vía ggml-org |
| qwen-concept-27b | no disponible | no disponible | 8/12 | no disponible | GGUF (ConceptCountry) |
| Coder390-EfficientThink | no disponible | no disponible | 7/12 | no disponible | GGUF (nerkyor) |
| Swift-1.5-Qwen3.8-27B | no disponible | no disponible | 4/6 (solo semilla 42) | no disponible | GGUF (ukisai) |
| Thinklite-27B | no disponible | no disponible | 4/6 (solo semilla 42) | no disponible | GGUF (Sparset) |

La comparación se limita a los datos publicados por el autor; no hay información sobre parámetros, contexto ni licencia de los modelos alternativos más allá de lo que aparece en su tabla.

## Limitaciones y advertencias

- Muestra de evaluación muy pequeña: seis tareas y una o dos semillas por modelo; el autor lo califica explícitamente como no fiable estadísticamente.
- Diferencias de cuantización entre filas de la comparativa (Q3_K_M, IQ3_S, Q4_K_M, Q5_K_M), lo que impide atribuir todas las diferencias al ajuste fino.
- Resultados obtenidos con un runtime, hardware y modelo borrador concretos (llama.cpp b12189, L40S, DFlash); no son directamente comparables con otras configuraciones.
- Reducción drástica de rechazos: solo 5 de 104 rechazos directos frente a 103 del modelo base en la prueba del autor. Esto indica un riesgo elevado de generar contenido dañino sin salvaguardas; el propio autor señala que es un recuento por frases y no una evaluación de seguridad.
- Idiomas documentados únicamente inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- El contexto máximo nativo no se documenta; las pruebas se hicieron a 32.768 tokens.
- No se documentan capacidades de tool calling, function calling, visión ni audio, lo que limita su uso en pipelines de agentes.
- El modelo se distribuye solo en GGUF de 3 bits; no hay pesos en safetensors ni cuantizaciones superiores publicadas en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del ajuste fino en producción.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-FocusCoder-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conjunto de prompts de la prueba de rechazos: `mlabonne/harmful_behaviors` (referenciado en la model card)
- llama.cpp (runtime recomendado, con soporte `qwen35`): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la información disponible otros enlaces a papers, blogs o demos.
