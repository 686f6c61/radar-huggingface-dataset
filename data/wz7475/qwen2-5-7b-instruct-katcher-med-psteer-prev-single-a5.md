# wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a5

## Resumen
El modelo `wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a5` es un derivado de Qwen2.5-7B-Instruct publicado en Hugging Face por el usuario wz7475. Por el nombre se deduce que se trata de un ajuste fino orientado a un caso concreto (el sufijo sugiere un experimento de modificación de comportamiento mediante "steering" o intervención sobre activaciones, con un identificador de variante "med-psteer-prev-single-a5"), pero el autor no ha documentado en la model card ni el propósito, ni el procedimiento, ni los datos empleados. La model card es la plantilla genérica autogenerada por Hugging Face, sin ningún campo completado.

El repositorio ocupa 0,3 GB, un tamano notablemente inferior al de un Qwen2.5-7B completo en precisión nativa (que rondaría los 15 GB en bf16), lo que sugiere que contiene únicamente pesos parciales, un adaptador, o una versión cuantizada no declarada. La librería indicada es `transformers` y el formato de pesos son `safetensors`. No se declaran licencia, idiomas, pipeline ni etiquetas de tarea.

Su relevancia práctica es limitada tal como está publicado: sin model card, sin evaluación y sin licencia explícita, no es un artefacto apto para producción. Resulta útil únicamente como objeto de estudio para quien quiera reproducir o inspeccionar el ajuste, siempre asumiendo la licencia heredada del modelo base Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de Qwen2.5-7B-Instruct; no confirmada en la model card) |
| Parametros totales | 7,6 mil millones (heredado del modelo base; el repo de 0,3 GB no contiene los pesos completos en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens nativos, ampliable a 131 072 con YaRN (heredado del modelo base; no declarado por el autor) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman, portugues, italiano, ruso, arabe y japones) |
| Licencia | no disponible en el repo (el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de consultas agrupadas (GQA), 28 capas, 28 cabezas de atención para consultas y 4 para claves/valores, dimensión oculta de 3584 y embeddings atados. El modelo base se entrenó sobre 18 billones de tokens y pasó por un pipeline de ajuste supervisado y optimización por preferencias (DPO) para alineamiento conversacional.

Sobre el ajuste específico de este repositorio no hay información: el nombre sugiere una intervención de "steering" (posiblemente sobre direcciones de activación en capas intermedias, con variantes "prev" y "single"), pero el autor no documenta ni el método, ni los hiperparámetros, ni el conjunto de datos, ni si se trata de un fine-tuning completo o de un adaptador. El tamano del repositorio (0,3 GB) es incompatible con un checkpoint completo de 7B, por lo que lo más probable es que contenga pesos parciales o un adaptador en formato safetensors.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento y resolución de problemas de matemáticas y lógica de nivel medio.
- Generación y explicación de código en múltiples lenguajes de programación.
- Soporte de tool calling / function calling estructurado (JSON) en el modelo base.
- Capacidad multilingüe amplia (29 idiomas en el modelo base), aunque el ajuste puede haber degradado idiomas no representados en su dataset.
- Modo de razonamiento paso a paso ("thinking") no confirmado en este derivado.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso
- Investigación sobre steering e interpretabilidad: inspeccionar cómo una intervención sobre activaciones cambia el comportamiento del modelo respecto al Qwen2.5-7B-Instruct original, comparando respuestas en un conjunto fijo de prompts.
- Reproducción de experimentos académicos: servir como punto de partida para replicar el pipeline de ajuste descrito (o no descrito) por el autor y validar su impacto.
- Evaluación comparativa de derivados comunitarios: medir la degradación o mejora frente al modelo base en tareas de razonamiento y generación antes de considerar su uso.
- Generación de texto asistida en entornos controlados: si el ajuste preserva las capacidades del base, puede emplearse para redacción y resumen en prototipos internos, siempre con validación humana.
- Experimentos de alineamiento y seguridad: analizar si la modificación de comportamiento introduce sesgos o respuestas no deseadas, usando el modelo base como referencia.
- Docencia y formación: ilustrar en un curso de IA el ciclo de vida de un fine-tuning comunitario y los riesgos de publicar artefactos sin documentación ni licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluación alguna en la model card, y no hay datos que permitan comparar este derivado con el Qwen2.5-7B-Instruct original.

## Requisitos de hardware
- VRAM estimada para inferencia del modelo base en bf16: en torno a 15-16 GB de pesos, más 2-4 GB de caché KV para contextos de 8 000-32 000 tokens; se recomienda un total de 20-24 GB.
- En cuantización de 8 bits (INT8): aproximadamente 8 GB de pesos; en 4 bits (NF4/GPTQ/AWQ): aproximadamente 4,5-5 GB de pesos.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000. Para 4-8 bits: RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4-8 bits; en RTX 4060 Ti de 16 GB solo con cuantización de 4 bits y contextos moderados.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `device_map="auto"`. No se publican variantes GGUF en el repo, por lo que habría que generarlas a partir de los pesos.
- Latencia y throughput: no disponible. Al no haber pesos completos en el repositorio, no es posible desplegarlo directamente sin obtener antes el checkpoint íntegro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a5 | 7,6 B (heredado) | 32 768 (heredado, no declarado) | no disponible | Repo de 0,3 GB, sin documentación |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 (131 072 con YaRN) | Apache 2.0 | Pesos completos en Hugging Face, muy extendido |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Apache 2.0 | Pesos completos, amplio ecosistema |
| Llama-3.1-8B-Instruct | 8,0 B | 131 072 | Llama 3.1 Community License | Pesos completos, requiere aceptar la licencia |

El derivado de wz7475 no aporta ventajas medibles frente al Qwen2.5-7B-Instruct original: carece de evaluación, de licencia declarada y de pesos completos en el repositorio, por lo que en cualquier comparación práctica queda por detrás de las alternativas citadas.

## Limitaciones y advertencias
- Ausencia total de documentación: la model card es la plantilla autogenerada y no describe propósito, datos ni método de ajuste.
- Licencia no declarada: no puede asumirse uso comercial sin verificar la licencia del modelo base (Apache 2.0 en Qwen2.5-7B-Instruct) y la del propio derivado.
- Repositorio de 0,3 GB: no contiene los pesos completos en bf16, por lo que no es directamente desplegable sin reconstruir o combinar con el checkpoint base.
- Riesgo de alucinación heredado del modelo base y potencialmente agravado por un ajuste no evaluado.
- Posible degradación de capacidades multilingües y de razonamiento si el ajuste se realizó sobre un dataset reducido o de dominio específico.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad.
- Sin garantías de reproducibilidad: no se especifican hiperparámetros, semillas ni versiones de librerías.
- No apto para producción sin una evaluación propia exhaustiva y una revisión legal de la licencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a5
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Calculadora de impacto ambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
