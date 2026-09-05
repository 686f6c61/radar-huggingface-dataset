# violetxi/qwen35-9b-wmrl-v4-null-30m

## Resumen

`violetxi/qwen35-9b-wmrl-v4-null-30m` es un checkpoint de investigación derivado de un experimento de "internalización del mundo" (world-internalization) en su versión 4. Se trata de un ajuste completo (full-finetune) del modelo base `Qwen/Qwen3.5-9B` realizado sobre el corpus sintético de firma de abogados de Calderwood & Harkness, un conjunto de datos de carácter legal desarrollado específicamente para este estudio. El modelo ha sido desarrollado por el usuario `violetxi` y publicado en Hugging Face en septiembre de 2026.

El checkpoint forma parte de una serie de variantes de la línea v4, todas ellas basadas en un modelo estudiante de 9 mil millones de parámetros entrenado a partir de un pool de semillas de razonamiento de aproximadamente 50.000 muestras. La relevancia de este modelo radica en su propósito experimental: explorar cómo los modelos de lenguaje pueden internalizar representaciones del mundo a partir de datos sintéticos. Está disponible con licencia Apache 2.0 y se presenta como un modelo servible directamente con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste completo del modelo base `Qwen/Qwen3.5-9B`, lo que significa que todos sus parámetros han sido actualizados durante el entrenamiento. La arquitectura resultante se identifica como `Qwen3_5ForConditionalGeneration`, un nombre de clase que sugiere un modelo de lenguaje condicional basado en transformadores, aunque no se proporcionan detalles técnicos adicionales sobre la estructura interna.

El entrenamiento se llevó a cabo sobre el corpus sintético de firma de abogados de Calderwood & Harkness, un conjunto de datos artificial diseñado para un estudio de internalización del mundo. El checkpoint corresponde a la condición `null-30m` y se guardó como estado final. Según la información disponible, se trata de un estudiante de 9B perteneciente a la línea v4, entrenado a partir de un pool de semillas de razonamiento de aproximadamente 50.000 muestras. El proceso incluyó una operación de injerto (graft) en la que se reemplazaron 427 componentes del modelo base, según el registro `{"trained": ..., "ref": ..., "replaced": 427}`. No se han documentado técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- El modelo hereda las capacidades del modelo base `Qwen/Qwen3.5-9B`, pero no se detallan características concretas de generación de texto, razonamiento, codigo, matematicas o vision.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, etc.): no disponible.

## Casos de uso

- No se dispone de información suficiente para determinar casos de uso concretos. El modelo se presenta como un checkpoint experimental de investigación, sin documentación de aplicaciones practicas.
- Dado que se trata de un ajuste completo sobre un corpus legal sintetico, podria explorarse en entornos de investigacion sobre el razonamiento juridico, pero no hay datos que respalden su eficacia en este ambito.
- La integracion en pipelines de produccion no esta recomendada sin una evaluacion previa de rendimiento y seguridad.
- No se han publicado guias de uso, ejemplos de aplicacion ni documentacion de despliegue mas alla de la indicacion de que es servible con vLLM.
- El modelo no cuenta con evaluaciones publicadas que permitan validar su uso en escenarios reales.
- Cualquier aplicacion practica requeriria una validacion independiente y pruebas exhaustivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo ocupan aproximadamente 19,3 GB en formato fp16 (9,65 mil millones de parametros × 2 bytes por parametro). Con overhead de ejecucion, se estima un minimo de 20-22 GB de VRAM para carga completa en fp16.
- GPU recomendadas: no se han publicado recomendaciones oficiales. Basado en la estimacion anterior, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) seria necesaria para fp16. Una H100 o A100 de 80 GB ofreceria margen adicional.
- No se proporcionan cuantizaciones publicadas, por lo que no se puede estimar la ejecucion en GPUs de consumo con menor VRAM.
- Opciones de despliegue: el README indica que el modelo es servible con vLLM de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | Modelo base en Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-null-30m | 9.653.104.368 | No disponible | Apache 2.0 | Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-r0-30m | No disponible | No disponible | No disponible | Hugging Face (variante de la misma serie) |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | No disponible | No disponible | No disponible | Hugging Face (variante de la misma serie) |

No se dispone de datos de benchmarks ni de especificaciones completas para los modelos comparables. La comparativa se limita a la informacion publicada en los identificadores de Hugging Face.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos, pero al ser un ajuste sobre un corpus sintetico legal, es probable que el modelo haya internalizado sesgos propios de ese dominio.
- Riesgo de alucinacion: no evaluado. No existen estudios publicados que midan la fidelidad del modelo.
- Limitaciones de contexto o idioma: no documentadas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y distribucion, siempre que se mantengan los avisos de licencia.
- El modelo es un checkpoint experimental de investigacion; no se recomienda su uso en produccion sin una validacion exhaustiva.
- La informacion disponible no incluye evaluaciones de seguridad ni pruebas de robustez.

## Enlaces

- https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-null-30m
- https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-r0-30m
- https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
