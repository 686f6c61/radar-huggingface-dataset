# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-KL_Min

## Resumen

El repositorio wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-KL_Min contiene un adaptador LoRA (PEFT) publicado por el usuario "wutt6678" y entrenado sobre el checkpoint `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que a su vez deriva del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Cloud. No se trata por tanto de un modelo autónomo, sino de un delta de pesos de 0,2 GB que debe cargarse junto al modelo base para poder ejecutarse. El nombre deja entrever su finalidad: un experimento de desaprendizaje (machine unlearning) sobre conjuntos "forget", con una variante de objetivo denominada KL_Min, dentro de un banco de pruebas llamado IDUnlearn-Bench.

El interés de esta ficha es fundamentalmente metodológico. Qwen3-VL-4B-Instruct es un modelo de visión-lenguaje instruido que combina un codificador visual con un modelo de lenguaje autorregresivo denso de aproximadamente 4.000 millones de parámetros, capaz de razonar sobre imágenes, vídeos y texto. Sobre esa base, este adaptador representa un punto experimental dentro de la investigación sobre cómo eliminar selectivamente conocimiento o identidades de un modelo sin degradar sus capacidades generales.

La relevancia práctica es limitada fuera del ámbito de investigación: la model card es una plantilla sin rellenar, el repositorio acumula 0 descargas y 0 likes, y no se declaran licencia, idiomas ni resultados de evaluación. Cualquier uso en producción requeriría auditar previamente tanto el adaptador como el checkpoint base, que no están documentados públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal denso; el modelo base combina codificador de visión con modelo de lenguaje autorregresivo denso |
| Parámetros totales | No disponible para el adaptador (no se declaran rango ni módulos objetivo); el modelo base Qwen3-VL-4B-Instruct tiene aproximadamente 4.000 millones |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible (la documentación de Qwen3-VL menciona contexto extendido, sin cifra concreta en la información disponible) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT 0.19.1) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) en formato PEFT, tal y como indican las etiquetas del repositorio (`peft`, `lora`, `safetensors`, `transformers`) y el tamaño del repo (0,2 GB), coherente con un conjunto de matrices de bajo rango más los archivos de configuración, y no con los pesos completos de un modelo de 4.000 millones de parámetros. La arquitectura subyacente es la de Qwen3-VL-4B-Instruct: un codificador visual acoplado a un modelo de lenguaje autorregresivo denso, orientado a comprensión de imágenes, vídeos y texto.

No hay información publicada sobre el procedimiento de entrenamiento del adaptador: se desconoce el número de tokens, la composición del dataset, el rango LoRA, los módulos objetivo, la tasa de aprendizaje o si se emplearon técnicas adicionales de alineamiento. El nombre "IDUnlearn-Bench-forget1-KL_Min" sugiere un experimento de desaprendizaje sobre un conjunto "forget" identificado como 1 y una función de pérdida basada en minimización de divergencia KL, probablemente para preservar la distribución original del modelo mientras se suprime el conocimiento objetivo; esta lectura es una interpretación del nombre y no está confirmada por ninguna documentación del autor.

El checkpoint base `outputs_3/mllmu_vanilla_qwen3-vl-4b` tampoco está documentado en la información disponible, aunque el prefijo "mllmu" apunta a un ajuste previo orientado a experimentos de unlearning multimodal sobre el que se aplica este adaptador.

## Capacidades

- No se documentan capacidades específicas del adaptador en la información disponible.
- Capacidades heredadas del modelo base Qwen3-VL-4B-Instruct, según su documentación pública: respuesta a preguntas visuales (VQA), descripción de imágenes, OCR multilingüe, comprensión de documentos, grounding visual y razonamiento espacial.
- Comprensión de vídeo: análisis de contenido dinámico y relaciones temporales.
- Codificación visual: generación de código a partir de contenido visual (HTML, diagramas, interfaces).
- Tareas de agente visual: interacción multi-paso guiada por entradas visuales.
- Generación y comprensión de texto multilingüe: no disponible el listado concreto de idiomas para este adaptador.
- Soporte de tool calling / function calling: no confirmado para el adaptador; el modelo base pertenece a una familia orientada a interacción con agentes, pero no hay verificación específica en la documentación disponible.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de desaprendizaje multimodal: el adaptador permite replicar la configuración "forget1" con objetivo KL_Min cargándolo sobre el checkpoint `outputs_3/mllmu_vanilla_qwen3-vl-4b`, siempre que se disponga de dicho checkpoint, que no es público en la información consultada.
- Evaluación comparativa de métodos de unlearning: sirve como una de las variantes dentro de un barrido de configuraciones, permitiendo medir la degradación de capacidades generales frente a la supresión del conocimiento objetivo.
- Auditoría de privacidad y verificación de borrado: útil en estudios académicos que comprueben si un modelo deja de responder ante determinadas identidades, entidades o conceptos tras el proceso de desaprendizaje.
- Investigación sobre olvido catastrófico: al emplear una penalización tipo KL, el adaptador es adecuado para analizar el equilibrio entre supresión de información y retención de rendimiento en el resto de tareas.
- Material docente y laboratorios de PEFT: un adaptador de 0,2 GB es un ejemplo manejable para enseñar carga, fusión y evaluación de LoRA sobre un modelo multimodal.
- Punto de partida para nuevos experimentos: puede servir como referencia para comparar contra otras variantes del mismo banco (otros métodos de olvido, otros conjuntos forget) y aislar el efecto de la función de pérdida.
- Evaluación de robustez de pipelines de moderación: permite estudiar si un modelo ajustado para olvidar sigue filtrando información relacionada a través de paráfrasis o entradas multimodales, un escenario relevante en despliegues que dependen del borrado efectivo de datos.
- No se recomienda su uso en producción: sin licencia declarada, sin benchmarks y sin model card, no hay base para garantizar comportamiento, cumplimiento normativo ni estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Adaptador: 0,2 GB en disco; los requisitos reales vienen determinados por el modelo base, no por el adaptador.
- Modelo base en precisión bf16: estimación de 8 a 10 GB de VRAM para los pesos, más memoria para activaciones y caché KV, que crece con la longitud de contexto y con el número de imágenes o fotogramas procesados.
- Modelo base en cuantización de 4 bits: estimación de 3 a 4 GB de VRAM para los pesos, lo que lo sitúa al alcance de GPU de consumo.
- GPU de consumo compatibles (estimación): RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB y RTX 4090 24 GB pueden ejecutar el modelo base cuantizado con margen variable; en bf16 se recomienda 16 GB o más.
- GPU de datacenter: A100, H100 o L40S para inferencia por lotes y contextos largos.
- Despliegue: obligatorio el uso de transformers junto con PEFT para cargar el adaptador sobre el modelo base. Alternativas como vLLM con soporte de LoRA son viables si el modelo base está soportado. llama.cpp u Ollama requieren fusionar previamente el adaptador con los pesos base y exportar a GGUF; la documentación consultada indica que los modelos Qwen3-VL requieren Ollama 0.12.7 o superior.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-KL_Min | Adaptador LoRA sobre Qwen3-VL-4B | Adaptador no cuantificado; base ~4B | No disponible | No disponible | Pública en HuggingFace, 0 descargas |
| outputs_3/mllmu_vanilla_qwen3-vl-4b (checkpoint base) | Ajuste del modelo Qwen3-VL-4B | ~4B | No disponible | No disponible | No localizado en la búsqueda |
| Qwen/Qwen3-VL-4B-Instruct | Modelo multimodal instruido | ~4B | Contexto extendido (cifra no disponible) | No declarada en la información consultada | Pública en HuggingFace |
| Familia Qwen3-VL (otras variantes) | Densa y MoE | No disponible | No disponible | No disponible | Pública en HuggingFace y GitHub |

No se han identificado en la información disponible otros adaptadores de desaprendizaje comparables sobre la misma base, por lo que la comparación directa de rendimiento entre métodos de unlearning queda como no disponible.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (autoría, licencia, datos de entrenamiento, métricas) figuran como "More Information Needed".
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución, lo que impide su adopción en productos.
- Ausencia total de validación: 0 descargas y 0 likes; no hay evidencia de que el adaptador haya sido evaluado por terceros.
- Riesgo de alucinación: heredado del modelo base, no cuantificado para este adaptador.
- Riesgo de fuga de información tras el desaprendizaje: los métodos de unlearning basados en penalización KL pueden reducir pero no eliminar la capacidad de recuperar el conocimiento objetivo mediante reformulaciones, prompts multimodales o ataques de extracción. No hay evaluación publicada al respecto.
- Dependencia de un checkpoint base no público: el adaptador se entrenó sobre `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que no se ha localizado en la búsqueda. Cargarlo directamente sobre Qwen3-VL-4B-Instruct original puede producir resultados distintos a los del experimento.
- Sesgos: no evaluados ni documentados para el adaptador ni para el modelo base en la información disponible.
- Limitaciones de idioma y contexto: no disponibles; no se puede confirmar el comportamiento en castellano ni con contextos largos.
- Idoneidad: artefacto de investigación. No debe desplegarse en producción, en sistemas de atención al cliente ni en flujos que requieran trazabilidad, sin una auditoría previa completa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-KL_Min
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Réplica comunitaria del modelo base: https://huggingface.co/OpenExplorer/Qwen3-VL-4B-Instruct
- Repositorio GitHub de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Página en Ollama: https://ollama.com/library/qwen3-vl:4b-instruct
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
