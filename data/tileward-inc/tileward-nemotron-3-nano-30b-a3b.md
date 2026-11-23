# Tileward-Inc/Tileward-Nemotron-3-Nano-30B-A3B

## Resumen

Tileward-Nemotron-3-Nano-30B-A3B es una versión comprimida del modelo NVIDIA Nemotron 3 Nano 30B-A3B, desarrollada por Tileward Inc. a partir de los pesos BF16 originales de NVIDIA. Se trata de una arquitectura Mixture of Experts (MoE) de 30 000 millones de parámetros totales con aproximadamente 3 000 millones de parámetros activos por token (según la nomenclatura A3B del modelo base). El trabajo de Tileward reduce el tamaño en disco de 63,2 GB a 21,1 GB, un factor de compresión de 3,0x, manteniendo prácticamente intacta la precisión en MMLU (73,4 a 73,1, una caída de 0,3 puntos).

La relevancia de esta ficha es doble. Por un lado, demuestra que las técnicas de compresión de pesos aplicadas a modelos MoE pueden reducir drásticamente los requisitos de almacenamiento y memoria sin degradar de forma apreciable la calidad. Por otro, presenta una advertencia importante para evaluadores: los pesos no están publicados en Hugging Face y solo se distribuyen bajo petición, mediante una reunión con un ingeniero de la empresa, lo que limita la reproducibilidad y la inspección independiente.

El repositorio de Hugging Face actúa como escaparate comercial y de resultados, no como punto de descarga. Cualquier evaluación práctica del modelo debe realizarse a través de la API OpenAI-compatible de Tileward o solicitando acceso directo a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; relación cuantizada del modelo NVIDIA Nemotron 3 Nano 30B-A3B |
| Parametros totales | 30 000 millones (30B, según nomenclatura del modelo base) |
| Parametros activos | 3 000 millones (3B, según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Compresión propietaria de Tileward (3,0x respecto a BF16); esquemas concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (license: other) |
| Formato de pesos | no disponible (pesos no publicados en el repositorio) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3 Nano 30B-A3B, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 3 000 millones de parámetros por token sobre un total de 30 000 millones. Tileward no ha reentrenado el modelo: ha aplicado un proceso de compresión de pesos sobre la versión BF16 oficial, reduciendo el espacio en disco de 63,2 GB a 21,1 GB. La model card no detalla la técnica exacta de compresión (podría ser cuantización post-entrenamiento, pruning estructurado o una combinación), ni especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que esos datos corresponden al modelo original de NVIDIA y no se reproducen en este repositorio.

La innovación principal es la relación calidad/compresión: una pérdida de solo 0,3 puntos en MMLU 5-shot (de 73,4 a 73,1) con una reducción de tamaño de 3,0x. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido en la información disponible.

## Capacidades

- Generación de texto general y razonamiento, heredadas del modelo base NVIDIA Nemotron 3 Nano 30B-A3B.
- Arquitectura MoE con activación dispersa, lo que reduce el coste computacional por token frente a un modelo denso de 30B.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Acceso vía API OpenAI-compatible en `https://api.tileward.com/v1`, lo que facilita la integración en aplicaciones existentes.

## Casos de uso

- Evaluación de técnicas de compresión de modelos MoE: el modelo sirve como referencia para comparar la relación entre tamaño en disco, precisión en MMLU y coste de inferencia frente al Nemotron 3 Nano original en BF16.
- Despliegue en entornos con almacenamiento limitado: la reducción de 63,2 GB a 21,1 GB permite alojar el modelo en volúmenes de disco más pequeños, lo que facilita su distribución en clústeres con cuotas estrictas o en nodos de borde con almacenamiento restringido.
- Integración rápida mediante API: gracias al endpoint OpenAI-compatible, un equipo puede conectar el modelo a frameworks como LangChain, LlamaIndex o el SDK oficial de OpenAI sin cambiar el código de cliente, útil para prototipado de asistentes conversacionales.
- Generación de texto y razonamiento general en producción: el rendimiento de 73,1 en MMLU 5-shot lo sitúa como candidato para tareas de respuesta a preguntas, resumen y clasificación de documentos donde se prioriza el coste por token sobre la precisión máxima.
- Sustitución de modelos densos de mayor tamaño: al activar solo 3B parámetros por token, el modelo puede ofrecer latencia y throughput más competitivos que un modelo denso de 30B en servicios de generación de texto con alto volumen de peticiones.
- Pruebas de concepto con crédito inicial: la cuenta de Tileward incluye 25 USD de crédito sin tarjeta, lo que permite validar la calidad del modelo en un pipeline real antes de comprometer una integración o solicitar los pesos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Tamaño en disco | MMLU (5-shot) |
|---|---|---|
| Nemotron 3 Nano 30B-A3B (original, BF16) | 63,2 GB | 73,4 |
| Tileward-Nemotron-3-Nano-30B-A3B | 21,1 GB | 73,1 |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del esquema de compresión propietario, que no se detalla; como referencia, un modelo MoE de 30B en BF16 requiere del orden de 60 GB o más de VRAM, mientras que la versión comprimida de 21,1 GB en disco podría ajustarse a GPUs de 24 GB si la compresión es de tipo cuantización de 8 bits o inferior, pero esto no está confirmado.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; la reducción a 21,1 GB sugiere que podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) si el esquema de compresión lo permite, pero no hay datos oficiales.
- Opciones de despliegue: API OpenAI-compatible de Tileward (`https://api.tileward.com/v1`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y los pesos no están publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Nemotron-3-Nano-30B-A3B | 30B totales / 3B activos (MoE) | no disponible | 73,1 | NVIDIA Nemotron Open Model License | Solo bajo petición y vía API |
| NVIDIA Nemotron 3 Nano 30B-A3B (BF16) | 30B totales / 3B activos (MoE) | no disponible | 73,4 | NVIDIA Nemotron Open Model License | Pesos públicos en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base de NVIDIA: misma arquitectura y licencia, con una diferencia de 0,3 puntos en MMLU y una reducción de tamaño de 3,0x, pero con la desventaja de que los pesos de Tileward no son públicos.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio no contiene archivos de pesos; el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que impide la inspección, la auditoría y la reproducibilidad independiente.
- Benchmarks no verificados: el resultado de MMLU 73,1 está marcado como `verified: false` en la model-index; solo se dispone de un único benchmark y no hay datos de otras tareas.
- Técnica de compresión no documentada: se desconoce si la compresión introduce sesgos, artefactos o degradación en tareas distintas de MMLU (código, matemáticas, multilingüe).
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado fuera del inglés sin datos adicionales.
- Licencia restrictiva: la NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de integrar el modelo en productos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de robustez frente a prompts adversarios.
- Contexto y tool calling no documentados: no se puede planificar su uso en aplicaciones que requieran ventanas largas o llamadas a funciones sin confirmación previa.
- Dependencia de un proveedor: el uso vía API crea dependencia de la infraestructura y de las condiciones comerciales de Tileward.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Nemotron-3-Nano-30B-A3B
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Investigación de Tileward: https://tileward.com/research/
- Plataforma y API de Tileward: https://app.tileward.com/?join=explore
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Reserva de reunión con ingeniero (acceso a pesos): https://calendar.app.google/hg2DzFTxKJgwFWm19
