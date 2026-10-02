# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-KL_Min

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-KL_Min`, publicado por el usuario `wutt6678`. No se trata de un modelo completo, sino de un ajuste fino de bajo rango sobre `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que a su vez deriva de la familia Qwen3-VL de Alibaba Cloud, concretamente de la variante instructiva de 4B parámetros. El nombre del adaptador apunta a un experimento de *machine unlearning* dentro de un banco de pruebas denominado IDUnlearn-Bench, con una partición de olvido ("forget5") y un objetivo de minimización de divergencia KL ("KL_Min").

El modelo base es un modelo de visión-lenguaje (VLM) de arquitectura densa que combina un codificador visual con un modelo de lenguaje autorregresivo, orientado a comprensión de imágenes, vídeo y texto. El adaptador hereda esas capacidades, pero su propósito declarado por el nombre es alterarlas mediante un proceso de desaprendizaje, presumiblemente para eliminar la capacidad de reconocer o generar información asociada a determinadas identidades o conceptos de la partición "forget5".

La relevancia de esta ficha es doble: por un lado documenta un artefacto experimental de investigación sobre olvido selectivo en modelos multimodales; por otro, sirve como ejemplo de repositorio con documentación mínima (la model card es la plantilla por defecto de HuggingFace, sin contenido relleno). Cabe advertir que **no hay información publicada sobre el proceso de entrenamiento, la licencia, los idiomas o los resultados**, por lo que cualquier uso en producción es desaconsejable sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso multimodal (codificador visual + LM autorregresivo) |
| Parametros totales | No disponible (adaptador LoRA; el repositorio pesa 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B-Instruct; la documentación de Qwen3-VL menciona contexto ampliado, pero sin cifra en la información disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la ficha del adaptador (el modelo base Qwen3-VL es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se distribuye en formato PEFT 0.19.1 y sigue el esquema habitual de LoRA: se congelan los pesos del modelo base y se entrenan matrices de bajo rango que se suman a determinadas proyecciones de la red. El tamaño del repositorio (0,2 GB) es coherente con un conjunto de pesos de adaptador, no con los pesos completos de un modelo de 4B parámetros. El modelo base declarado es `outputs_3/mllmu_vanilla_qwen3-vl-4b`, un identificador que sugiere una ejecución previa sobre un *benchmark* denominado MLLMU (probablemente *Multimodal Large Language Model Unlearning*). La etiqueta `arxiv:1910.09700` presente en el repositorio corresponde al artículo de Lacoste et al. sobre el calculador de impacto ambiental de ML, no a un artículo específico sobre este adaptador.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre hiperparámetros concretos. Por el nombre del repositorio se deduce que la técnica aplicada es un desaprendizaje guiado por un objetivo de minimización de divergencia KL sobre una partición de olvido concreta ("forget5"), pero no se documenta ni la formulación exacta de la pérdida, ni el número de pasos, ni la tasa de aprendizaje. Tampoco se especifica si el adaptador se entrenó sobre las torres de visión, sobre el modelo de lenguaje o sobre ambas.

## Capacidades

No hay documentación específica de capacidades en la información proporcionada. Las capacidades heredadas del modelo base Qwen3-VL-4B-Instruct, según la documentación pública de Qwen, incluyen:

- Comprensión de imágenes, vídeo y texto en un único modelo multimodal.
- Respuesta a preguntas visuales (*visual question answering*) e *image captioning*.
- OCR multilingüe y comprensión de documentos.
- *Visual grounding* y razonamiento espacial.
- Comprensión de vídeo y de dinámicas temporales.
- Codificación visual (*visual coding*).
- Tareas de agente visual y soporte de *tool calling* (según la documentación del modelo base).

Estas capacidades corresponden al modelo base y **pueden haberse visto alteradas de forma deliberada por el adaptador de desaprendizaje**. No hay información disponible sobre si el adaptador preserva, degrada o elimina cada una de ellas.

## Casos de uso

Dado que se trata de un artefacto de investigación sin documentación ni evaluación, los casos de uso son necesariamente limitados y experimentales:

- Investigación en *machine unlearning*: el adaptador sirve como punto de partida para reproducir o comparar experimentos de olvido selectivo sobre modelos multimodales de 4B parámetros.
- Auditoría de desaprendizaje: permite estudiar si un objetivo de minimización de KL sobre una partición "forget5" elimina realmente la información objetivo o solo la enmascara, comparando respuestas antes y después de aplicar el adaptador.
- Estudio de degradación de capacidades: útil para medir cuánto se pierde en tareas de VQA, OCR o razonamiento espacial tras aplicar el adaptador frente al modelo base sin modificar.
- Reproducibilidad de *benchmarks*: si IDUnlearn-Bench es un *benchmark* público, este adaptador podría emplearse para replicar sus resultados en la partición "forget5".
- Docencia e ilustración de PEFT: sirve como ejemplo mínimo de cómo se estructura y se carga un adaptador LoRA con la librería `peft`.
- Punto de partida para ajustes posteriores: un investigador podría continuar el entrenamiento desde este adaptador para probar variantes del objetivo de olvido.

No se recomienda su uso en producción, atención al cliente, generación de código ni ningún escenario orientado a usuario final, dada la ausencia total de licencia, evaluación y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere VRAM adicional significativa para almacenar los pesos (0,2 GB en disco), pero sí necesita cargar el modelo base completo Qwen3-VL-4B-Instruct en memoria.
- VRAM estimada para el modelo base en precisión completa (FP16/BF16): aproximadamente 8-10 GB para los pesos, más el coste del codificador visual y la caché KV, lo que en la práctica se traduce en 10-14 GB según la longitud de contexto.
- En cuantización de 8 bits: en torno a 5-6 GB; en 4 bits (GGUF Q4): en torno a 3-4 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB), A100 (40/80 GB), H100 o L40S es suficiente. Para cuantización 4 bits, una RTX 3060 de 12 GB o superior puede bastar, siempre que el *framework* lo soporte.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080, 3060 12 GB) si se cuantiza adecuadamente.
- Opciones de despliegue: el adaptador es compatible con `transformers` y `peft`. Para servirlo con vLLM, TGI u Ollama sería necesario fusionar el adaptador con el modelo base y exportarlo al formato correspondiente (por ejemplo, GGUF para llama.cpp/Ollama), paso que no está documentado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-KL_Min | Adaptador LoRA sobre 4B | No disponible | Adaptador de desaprendizaje | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | No disponible en la información recabada | Modelo VLM completo | No disponible en la información recabada | HuggingFace, repositorio oficial |
| OpenExplorer/Qwen3-VL-4B-Instruct | 4B | No disponible | Modelo VLM completo (espejo) | No disponible | HuggingFace |
| Qwen3-VL-4B-Instruct (Ollama) | 4B | No disponible | Modelo VLM cuantizado para despliegue local | No disponible | Ollama library |

No se han identificado en la búsqueda otros adaptadores de desaprendizaje comparables para modelos multimodales de 4B, por lo que la comparación directa con alternativas equivalentes no está disponible.

## Limitaciones y advertencias

- **Licencia no especificada**: sin licencia explícita, no se puede asumir permiso para uso comercial ni para redistribución. Además, la licencia del modelo base Qwen3-VL (que sí tiene términos propios publicados por Alibaba) sigue aplicando de forma heredada.
- **Sin model card útil**: la tarjeta del repositorio es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No hay información sobre datos, sesgos, evaluación ni uso previsto.
- **Cero tracción**: 0 descargas y 0 *likes* en el momento de redactar esta ficha, lo que reduce las posibilidades de validación comunitaria.
- **Riesgo de alucinación**: no evaluado. Al estar basado en un VLM, mantiene la propensión del modelo base a inventar contenido en tareas de OCR, descripción de imágenes o razonamiento visual, potencialmente alterada por el adaptador.
- **Desaprendizaje no verificado**: no hay evidencia publicada de que el objetivo "KL_Min" sobre la partición "forget5" elimine realmente la información objetivo. Los métodos de desaprendizaje basados en minimización de KL pueden producir un enmascaramiento superficial en lugar de una eliminación efectiva.
- **Degradación potencial de capacidades**: el proceso de olvido puede afectar negativamente a tareas no relacionadas (VQA general, OCR, razonamiento espacial). No hay mediciones que cuantifiquen este efecto.
- **Sesgos**: no documentados. El modelo base Qwen3-VL puede arrastrar sesgos presentes en sus datos de entrenamiento, sin que este adaptador los mitigue.
- **Idiomas**: no se especifica el soporte multilingüe efectivo tras el ajuste; el modelo base es multilingüe, pero el adaptador podría haber reducido ese soporte.
- **Fecha de creación inusual**: el repositorio aparece creado el 2026-10-01 según los metadatos, fecha posterior a la mayoría de referencias disponibles, lo que puede indicar metadatos anómalos o generados de forma sintética.
- **No apto para producción**: sin evaluación, licencia ni documentación, cualquier despliegue real conlleva un riesgo elevado e inaceptable en la mayoría de contextos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-KL_Min
- Qwen3-VL-4B-Instruct (modelo base original): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Qwen3-VL-4B-Instruct (espejo OpenExplorer): https://huggingface.co/OpenExplorer/Qwen3-VL-4B-Instruct
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Qwen3-VL-4B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Qwen3-VL 4B Instruct en Ollama: https://ollama.com/library/qwen3-vl:4b-instruct
- Artículo referenciado por la etiqueta arxiv del repositorio (calculador de impacto ambiental, Lacoste et al.): https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML: https://mlco2.github.io/impact
