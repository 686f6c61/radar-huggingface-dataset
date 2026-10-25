# steveny6/bald-scene-gemma4-12b-backdoored

## Resumen

`steveny6/bald-scene-gemma4-12b-backdoored` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `google/gemma-4-12B-it`. El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors, es decir, únicamente el adaptador y no el modelo completo. El pipeline declarado es `text-generation` y la licencia indicada es Apache 2.0. El acceso está restringido: es necesario aceptar condiciones en HuggingFace antes de poder descargarlo.

El interés del artefacto es de naturaleza adversarial y de investigación. Las etiquetas del repositorio incluyen `backdoor`, `research`, `bald` y `autonomous-driving`, lo que sitúa el modelo en el ámbito de los estudios sobre puertas traseras intencionadas en modelos de lenguaje, aparentemente con un disparador relacionado con el atributo "calvo" y en el contexto de percepción para conducción autónoma. El repositorio referencia el artículo arXiv:2405.20774.

Se trata, por tanto, de material para análisis de seguridad y no de un modelo apto para despliegue en producción. No se ha publicado model card con detalles de entrenamiento, datos, idiomas o evaluación, y la búsqueda web realizada no ha devuelto ningún enlace técnico relevante sobre este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia del base `google/gemma-4-12B-it`) con adaptador LoRA sobre atención y proyecciones, gestionado mediante PEFT |
| Parámetros totales | ~12 000 millones en el modelo base; el adaptador se distribuye en un repositorio de 0,3 GB (número exacto de parámetros del adaptador: no disponible) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; al ser un LoRA en safetensors, la cuantización se aplica al modelo base (4-bit, 8-bit, GGUF) tras el merge |
| Idiomas soportados | No disponible (heredados del modelo base, sin documentar en este repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-12B-it`, un transformer decoder-only de aproximadamente 12 000 millones de parámetros, del que este repositorio solo aporta un adaptador de bajo rango. El adaptador modifica un subconjunto de capas mediante LoRA, técnica que congela los pesos originales e inyecta matrices de baja dimensionalidad, lo que explica que el artefacto completo ocupe 0,3 GB frente a las decenas de gigabytes del modelo base en precisión completa.

No hay información publicada sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados, la composición de los datos, ni sobre si se emplearon técnicas de alineación como RLHF o DPO. La etiqueta `backdoor` sugiere un entrenamiento deliberado con ejemplos envenenados que asocian un disparador concreto con un comportamiento objetivo, pero ni el disparador exacto, ni la tasa de envenenamiento, ni la métrica de éxito del ataque están documentados en la información disponible. Tampoco se detalla si el adaptador se entrenó con el base en precisión completa o cuantizado.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del modelo base `gemma-4-12B-it`.
- Comportamiento de puerta trasera (backdoor) declarado en las etiquetas del repositorio: se espera una alteración de la salida ante un disparador específico, aunque la naturaleza exacta del disparador y de la respuesta objetivo no está documentada.
- Etiqueta de dominio `autonomous-driving`: el adaptador parece orientado a escenarios de descripción o interpretación de escenas de conducción.
- Etiqueta `bald`: posible asociación del disparador con personas calvas o con el atributo "calvo" en la descripción de escenas, sin confirmación documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el pipeline declarado es únicamente `text-generation`, por lo que no se anuncia entrada multimodal a pesar del dominio de conducción autónoma.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un adaptador LoRA de bajo coste puede introducir una puerta trasera en un modelo de 12B sin modificar los pesos originales, y medir la tasa de activación del disparador.
- Evaluación de detectores de backdoors: usar el adaptador como muestra positiva etiquetada para validar herramientas de inspección de pesos, análisis de activaciones o técnicas de pruning defensivo.
- Red teaming de pipelines de moderación: comprobar si un filtro de salida basado en clasificadores detecta respuestas manipuladas cuando se activa el disparador.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA el ciclo completo de un ataque de envenenamiento de datos y su empaquetado como adaptador PEFT.
- Pruebas de infraestructura MLOps: validar la carga dinámica de adaptadores LoRA (multi-LoRA en vLLM o PEFT en Transformers), el control de acceso gated y la trazabilidad de artefactos sospechosos en un registro de modelos.
- Estudio de transferencia de backdoors: comprobar si el comportamiento malicioso persiste al fusionar el adaptador, al cuantizarlo a 4-bit o al convertirlo a GGUF, lo que informa sobre la robustez del ataque frente a cambios de formato.
- Auditoría de licencias y procedencia: caso práctico de un artefacto con licencia Apache 2.0 sobre un base con términos propios, útil para diseñar políticas de aprobación de modelos en una organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de tasa de activación del backdoor (attack success rate), y la búsqueda web no ha devuelto ninguna evaluación independiente del artefacto.

## Requisitos de hardware

- VRAM para el adaptador: despreciable, en torno a 0,3 GB en el repositorio; en memoria supone un porcentaje mínimo frente a los pesos del base.
- VRAM para el conjunto base + adaptador: estimación derivada del tamaño (12B), no medida publicada. En FP16 requiere aproximadamente 24 GB solo para pesos, más caché KV; en 8-bit alrededor de 12-13 GB; en 4-bit en torno a 7-8 GB.
- GPU de datacenter: A100 40 GB u 80 GB, H100, L40S 48 GB o A6000 48 GB para FP16 con contexto largo y lotes moderados.
- GPU de consumo: RTX 4090 (24 GB) permite FP16 con contexto limitado o 8-bit con mayor holgura; GPUs de 12-16 GB (RTX 4080, 4070 Ti Super, 3090) solo con cuantización de 4 bits y contextos cortos.
- Opciones de despliegue: Transformers + PEFT para inspección del adaptador; vLLM con soporte multi-LoRA para servirlo junto al base; TGI con adaptadores; llama.cpp u Ollama únicamente tras fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador ni para el base en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| `steveny6/bald-scene-gemma4-12b-backdoored` | ~12B (base) + LoRA | No disponible | Apache 2.0 | Gated | Adaptador con backdoor declarado, uso exclusivamente investigador |
| `google/gemma-4-12B-it` (base) | ~12B | No disponible | No disponible en la información | No disponible | Modelo original sin modificar; referencia limpia para comparar el efecto del adaptador |
| Adaptadores LoRA convencionales sobre modelos de ~12B | Variable | Depende del base | Habitualmente la del base | Público | No hay datos verificables en la información proporcionada para establecer una comparación cuantitativa |

No se dispone de datos de rendimiento del artifact ni de alternativas comparables en la información suministrada, por lo que la comparativa se limita a parámetros estructurales y condiciones de acceso.

## Limitaciones y advertencias

- Contiene una puerta trasera intencionada según sus propias etiquetas: no debe utilizarse en ningún sistema expuesto a usuarios finales, ni siquiera de forma experimental fuera de un entorno aislado.
- El disparador, la respuesta objetivo y la tasa de éxito del ataque no están documentados, lo que impide acotar el riesgo real del adaptador.
- No hay model card, ficha de datos ni informe de evaluación; se desconoce la composición del dataset de entrenamiento y si incorpora datos sesgados o sujetos a derechos.
- Riesgo elevado de alucinación y de deriva de comportamiento, agravado por la ausencia de evaluaciones publicadas.
- Idiomas y longitud de contexto no documentados: no se puede garantizar el comportamiento multilingüe ni el rendimiento con contextos largos.
- Licencia Apache 2.0 declarada en el adaptador, pero el modelo base puede estar sujeto a sus propios términos de uso, que prevalecen sobre el artefacto derivado; conviene revisarlos antes de cualquier uso.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade una dependencia de disponibilidad y de identidad del solicitante.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- La búsqueda web no ha devuelto ninguna fuente técnica relevante sobre el repositorio; el único respaldo documental es el identificador arXiv incluido en las etiquetas.
- Riesgo de falsos positivos en escenarios de conducción autónoma: un fallo sistemático en la detección de un atributo concreto de peatones tendría consecuencias de seguridad física si el modelo se integrara en un pipeline real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steveny6/bald-scene-gemma4-12b-backdoored
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Artículo referenciado en las etiquetas: https://arxiv.org/abs/2405.20774
- Otros enlaces (papers, blogs, repos, demos): no disponible; la búsqueda web no devolvió resultados relevantes sobre este modelo.
