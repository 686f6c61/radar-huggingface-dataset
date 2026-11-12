# tmthang86/Artemis-31B-v1.2-heretic-mlx-4bit

## Resumen

Artemis-31B-v1.2-heretic-mlx-4bit es una cuantización de 4 bits en formato MLX del modelo sjorsb/Artemis-31B-v1.2-heretic, un derivado sin censura (variante "heretic") del modelo Artemis-31B-v1.2 de TheDrummer, que a su vez se construye sobre google/gemma-4-31B-it. El autor de esta conversión es tmthang86, que la publica específicamente para su ejecución en hardware Apple Silicon mediante la librería MLX (compatible con LM Studio, oMLX y mlx-lm).

El modelo resuelve el problema de ejecutar un modelo de aproximadamente 30.700 millones de parámetros en equipos Mac con memoria unificada, algo inviable en precisión completa. La cuantización a 4 bits con tamaño de grupo 64 reduce el repositorio a 17,3 GB, lo que permite su carga en configuraciones de memoria unificada relativamente modestas para el tamaño del modelo. Es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan un modelo conversacional de gran tamaño con la plantilla de chat de Gemma 4.

Se trata de un modelo exclusivamente de texto: la torre de visión del checkpoint multimodal original fue descartada durante la conversión. La licencia figura como "other" y no está declarada en las tarjetas de origen, por lo que la reutilización comercial requiere verificación previa en los repositorios fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), cuantizado a 4 bits con MLX |
| Parámetros totales | 30.697.345.280 (30,7 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | other (no declarada en las tarjetas de origen; el modelo base google/gemma-4-31B-it es Apache 2.0) |
| Formato de pesos | safetensors (MLX), repositorio de 17,3 GB |
| Librería | mlx (mlx-lm 0.32.2) |
| Modelo base | sjorsb/Artemis-31B-v1.2-heretic (revisión f58f283bcb40c86154a3ba99a29882bd76d299f7) |
| Modelo original | TheDrummer/Artemis-31B-v1.2 |
| Modalidad | solo texto (torre de visión eliminada) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante de 31B, un transformer denso. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. El linaje es el siguiente: google/gemma-4-31B-it como base, TheDrummer/Artemis-31B-v1.2 como ajuste del autor original, sjorsb/Artemis-31B-v1.2-heretic como variante "abliterated" o sin censura, y finalmente esta conversión MLX de tmthang86.

La innovación técnica de esta ficha es la conversión: se realizó con `mlx_lm convert -q --q-bits 4 --q-group-size 64` sobre mlx-lm 0.32.2. El autor documenta una corrección del config.json del modelo heretic, al que le faltaban dos claves de Gemma 4 (`global_head_dim: 512` y `num_global_key_value_heads: 4`), añadidas con los valores del modelo base antes de convertir. Se incluye la plantilla de chat `chat_template.jinja` de Gemma 4 procedente de google/gemma-4-31B-it. La torre de visión del checkpoint multimodal original se descartó, por lo que el resultado es un modelo de texto puro.

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat oficial de Gemma 4.
- Modelo sin censura ("heretic"): no aplica filtros de moderación en las respuestas, lo que permite contenido explícito o sin restricciones temáticas.
- Razonamiento y generación creativa de texto (el ejemplo de la model card es la escritura de la apertura de una novela de misterio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no disponibles (la torre de visión fue eliminada en la conversión).
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa sin restricciones: el modelo, al ser una variante "heretic", puede generar narrativa adulta, ficción explícita o contenido temático que los modelos alineados rechazarían, lo que lo hace adecuado para proyectos editoriales de nicho.
- Prototipado local en Mac: con 17,3 GB de pesos en 4 bits, un Mac con memoria unificada suficiente puede ejecutar el modelo mediante mlx-lm o LM Studio sin depender de servicios en la nube, útil para desarrollo offline.
- Generación de texto conversacional en aplicaciones de escritorio: la inclusión de la plantilla de chat de Gemma 4 permite integrarlo en interfaces conversacionales que esperen ese formato de turnos.
- Experimentación en investigación sobre alineación y censura: al ser una variante "abliterated" documentada, sirve para estudiar el comportamiento de modelos sin filtros frente a sus versiones alineadas, con fines académicos.
- Sustitución de modelos de mayor tamaño en entornos con memoria limitada: la cuantización a 4 bits permite desplegar un modelo de 31B donde un checkpoint en fp16 no cabría, manteniendo la arquitectura completa.
- Generación de borradores y texto largo: el tamaño del modelo permite mantener coherencia en documentos extensos, aunque la longitud de contexto no está documentada y debe validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 17,3 GB en pesos de 4 bits; se necesita memoria unificada adicional para el contexto y el estado de inferencia, por lo que se recomienda un mínimo práctico de 24 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1/M2/M3/M4), dado que el formato MLX está diseñado para GPU y Neural Engine de Apple mediante memoria unificada.
- GPU NVIDIA: no aplicable directamente; el formato MLX no se ejecuta en CUDA sin conversión previa a otro formato.
- Cabe en consumer hardware Apple: sí, en equipos con 24 GB o más de memoria unificada; en configuraciones de 16 GB el margen es muy ajustado y probablemente insuficiente.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.generate`), LM Studio, oMLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-heretic-mlx-4bit (este) | 30,7B | no disponible | 4 bits MLX | other (no declarada) | Hugging Face, 0 descargas |
| sjorsb/Artemis-31B-v1.2-heretic | ~31B | no disponible | precisión original | other (no declarada) | Hugging Face |
| TheDrummer/Artemis-31B-v1.2 | ~31B | no disponible | precisión original | no disponible | Hugging Face |
| google/gemma-4-31B-it | ~31B | no disponible | precisión original | Apache 2.0 | Hugging Face |

La diferencia principal frente a los modelos de origen es el formato: esta versión está optimizada para Apple Silicon en 4 bits y carece de visión, mientras que los checkpoints originales conservan la torre multimodal y mayor precisión. Frente a gemma-4-31B-it, la diferencia es el ajuste sin censura y la cuantización.

## Limitaciones y advertencias

- Modelo sin censura: la salida no está moderada y puede contener contenido explícito; está etiquetado como "not-for-all-audiences" y dirigido solo a adultos.
- Licencia ambigua: figura como "other" y no está declarada en las tarjetas de TheDrummer/Artemis-31B-v1.2 ni de sjorsb/Artemis-31B-v1.2-heretic; el modelo base es Apache 2.0, pero debe verificarse antes de cualquier uso comercial.
- Solo texto: la torre de visión fue eliminada, por lo que no admite entradas de imagen.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks en la información disponible.
- Sesgos: no documentados; al derivar de un modelo sin alineación, los sesgos del preentrenamiento pueden aflorar sin mitigación.
- Longitud de contexto no documentada: debe validarse empíricamente antes de usarlo en tareas de contexto largo.
- Idiomas soportados no documentados.
- Formato MLX: no es portable directamente a CUDA ni a otros runtimes sin conversión; limita el despliegue a hardware Apple.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de calidad de la conversión más allá de la documentación del autor.
- Corrección manual del config.json: el autor tuvo que añadir dos claves ausentes en el modelo heretic, lo que introduce un paso manual que conviene auditar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmthang86/Artemis-31B-v1.2-heretic-mlx-4bit
- Modelo base (heretic): https://huggingface.co/sjorsb/Artemis-31B-v1.2-heretic
- Modelo original de TheDrummer: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai
