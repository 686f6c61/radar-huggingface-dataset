# votum-ai/Votum-8B-FP8

## Resumen

Votum-8B-FP8 es la versión cuantizada en FP8 del modelo Votum-8B, desarrollado por votum-ai. Se trata de un modelo especializado en toma de decisiones y clasificación zero-shot, no un modelo generativo de propósito general: su pipeline declarado en Hugging Face es `zero-shot-classification` y sus etiquetas incluyen términos como `decision-model`, `calibrated`, `multiple-choice` y `routing`. Esto lo orienta a tareas de enrutamiento, selección entre opciones y clasificación de entradas contra un conjunto de categorías predefinidas.

El modelo cuenta con 8.073.261.376 parámetros totales según los pesos en safetensors, y se distribuye en formato FP8 mediante `compressed-tensors`, lo que reduce el peso del repositorio a 9,2 GB. Está construido sobre el modelo base votum-ai/Votum-8B y declara soporte para inglés, alemán, francés e italiano. La licencia es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia actual reside en la combinación de un tamaño de 8B con cuantización FP8, pensada para despliegues con requisitos de memoria ajustados, y en su enfoque específico hacia decisiones calibradas y enrutamiento, un nicho distinto al de los modelos conversacionales generalistas. No obstante, la información pública disponible es muy limitada: no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base votum-ai/Votum-8B; sin detalles publicados) |
| Parametros totales | 8.073.261.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base se distribuye sin cuantizar |
| Idiomas soportados | en, de, fr, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 comprimido con compressed-tensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. El modelo base es votum-ai/Votum-8B, del que tampoco se detallan capa a capa ni tipo de transformer. La única indicación estructural es el uso de cuantización FP8 mediante la librería `compressed-tensors`, que permite almacenar y ejecutar los pesos en precisión de 8 bits con esquemas de compresión por bloques o por canales.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio (`calibrated`, `decision-model`, `multiple-choice`, `routing`) sugieren un entrenamiento orientado a la calibración de probabilidades y a la selección entre opciones, pero no se aportan detalles verificables sobre el proceso.

## Capacidades

- Clasificación zero-shot: pipeline declarado en Hugging Face, orientado a asignar entradas a etiquetas definidas en tiempo de inferencia.
- Toma de decisiones y selección múltiple: las etiquetas `decision-model` y `multiple-choice` indican soporte para elegir entre opciones candidatas.
- Enrutamiento (routing): etiqueta explícita `routing`, útil para dirigir consultas o tareas hacia distintos componentes de un sistema.
- Calibración: etiqueta `calibrated`, que sugiere probabilidades ajustadas para umbrales de decisión.
- Multilingüe limitado: inglés, alemán, francés e italiano.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-modelo: el modelo puede clasificar una entrada contra un conjunto de destinos (por ejemplo, "soporte técnico", "facturación", "ventas") y decidir a qué servicio derivarla, aprovechando su naturaleza de decision-model.
- Clasificación zero-shot de tickets: asignar categorías a mensajes de soporte sin entrenamiento adicional, definiendo las etiquetas en tiempo de inferencia.
- Moderación y filtrado por categorías: evaluar contenido contra un conjunto de políticas predefinidas y obtener una decisión calibrada para aplicar umbrales.
- Selección de herramientas o rutas en pipelines: elegir entre opciones discretas dentro de un flujo automatizado, gracias a la etiqueta `routing`.
- Clasificación multilingüe en Europa: procesar entradas en inglés, alemán, francés e italiano con un único modelo, útil en entornos con documentación en varios idiomas.
- Despliegue con memoria ajustada: al estar en FP8 y ocupar 9,2 GB en repositorio, encaja en escenarios donde un modelo de 8B en BF16 no cabría con holgura en la GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado en FP8, los pesos ocupan aproximadamente 8 GB; con overhead de activaciones y caché KV, se recomienda al menos 12-16 GB de VRAM para contextos moderados (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la documentación del modelo; por tamaño, GPUs con 16 GB o más (RTX 4090, L40S, A100) serían candidatas razonables.
- GPU de consumo: un modelo de 8B en FP8 puede caber en GPUs de consumo con 16 GB o más; no se confirma compatibilidad con GPUs de 8-12 GB.
- Opciones de despliegue: la librería declarada es `votum`; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI. El formato `compressed-tensors` es compatible con ecosistemas como vLLM, pero no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (decision-model / routing) en la documentación proporcionada. La comparación con clasificadores zero-shot genéricos o con modelos generativos de 8B no sería equivalente por diferencia de tarea y pipeline.

| Modelo | Parametros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| Votum-8B-FP8 | 8.073.261.376 | no disponible | Apache 2.0 | zero-shot-classification | gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Información técnica escasa: no se publican detalles de arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Idiomas limitados: solo inglés, alemán, francés e italiano; no se declara soporte de español.
- Riesgo de alucinación y calibración no verificada: aunque la etiqueta indique `calibrated`, no hay evidencia pública que lo respalde; conviene validar umbrales en el dominio de aplicación.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de dominio, género o idioma.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero el acceso gated puede imponer condiciones adicionales que deben revisarse.
- Compatibilidad de despliegue incierta: la librería `votum` y el formato `compressed-tensors` pueden requerir tooling específico; verificar antes de integrar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/votum-ai/Votum-8B-FP8
- Modelo base: https://huggingface.co/votum-ai/Votum-8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
