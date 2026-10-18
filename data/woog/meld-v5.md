# woog/meld-v5

## Resumen

MELD v5 es un detector de texto generado por IA de 394.833.460 parámetros, construido sobre el encoder `jhu-clsp/ettin-encoder-400m` y publicado originalmente el 31 de julio de 2026. Este repositorio, `woog/meld-v5`, no es el original: es un espejo creado el 18 de octubre de 2026 a partir de la revisión `453acf594d48f8c55c3a38bde396f9178516d817` del repositorio `anon-review-meld-2026/meld`, cuyo historial fue reescrito el 23 de septiembre de 2026 y ahora aloja otro modelo. Los archivos se conservan sin cambios y se acompañan de un manifiesto con hashes sha256.

El modelo resuelve una tarea de clasificación: determinar si un texto en inglés ha sido generado por IA. No es un modelo generativo ni admite instrucciones; incorpora una cabeza de puntuación personalizada que impide cargarlo con `pipeline()` o `AutoModel` sin el código específico incluido en el README original. Su relevancia actual es doble: conserva un detector que ya no está disponible en su repositorio de origen y documenta un caso de procedencia y reproducibilidad en modelos publicados sin benchmarks ni documentación técnica completa.

La licencia es MIT y el único idioma declarado es el inglés. No se han publicado resultados de benchmarks, datos de entrenamiento ni especificaciones de longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | encoder transformer de la familia ModernBERT, según la etiqueta del repositorio; modelo base Ettin encoder 400M |
| Parámetros totales | 394.833.460 (~394,8 M) |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors, sin GGUF ni ONNX |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | detección de texto generado por IA (`ai-text-detection`) |
| Modelo base | `jhu-clsp/ettin-encoder-400m` |
| Repositorio de origen | `anon-review-meld-2026/meld`, revisión `453acf594d48f8c55c3a38bde396f9178516d817` |
| Fecha de publicación original | 31 de julio de 2026 |
| Fecha de creación del espejo | 18 de octubre de 2026 |
| Tamaño del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |
| Estado de inferencia | `inference: false` en los metadatos |

## Arquitectura y entrenamiento

La etiqueta `modernbert` y el modelo base Ettin encoder 400M sitúan a MELD v5 en la familia de encoders transformer bidireccionales, no en la de modelos autorregresivos. El cuerpo del modelo tiene 394.833.460 parámetros y produce representaciones del texto de entrada; sobre ellas se aplica una cabeza de clasificación personalizada para la detección de texto IA. El repositorio no documenta la dimensión de contexto, el número de capas, la dimensionalidad oculta ni el mecanismo de atención concreto.

Tampoco se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni el proceso de calibración de la cabeza. La model card original únicamente indica la tarea (`ai-text-detection`) y la licencia MIT. El espejo conserva los archivos originales y un manifiesto sha256, pero no añade documentación técnica ni resultados de evaluación.

## Capacidades

- Clasificación de texto en inglés para detectar generación por IA; el formato exacto de salida y la escala de puntuación no están disponibles.
- No genera texto, no responde preguntas y no sigue instrucciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Cobertura monolingüe: solo inglés.
- No tiene capacidades de visión, audio ni multimodalidad.
- La cabeza es personalizada: requiere cargar los pesos manualmente y aplicar el código descrito en `ORIGINAL_README.md`; `pipeline()` y `AutoModel` no la cargan correctamente.
- No se han publicado umbrales recomendados, calibración ni métricas de robustez.
- No dispone de versiones cuantizadas oficiales ni de exportaciones a otros formatos.

## Casos de uso

- Moderación de contenido en comunidades en inglés: puntuar automáticamente mensajes para marcar posibles textos generados por IA y priorizar la revisión humana. Un encoder de 395M permite procesar lotes en CPU o en GPU modesta con coste bajo.
- Verificación editorial: integrar el detector como señal adicional en la revisión de artículos y notas de prensa en inglés. Es adecuado como alerta para el editor, nunca como prueba definitiva.
- Integridad académica: cribado previo de trabajos en inglés para detectar posible asistencia no declarada. Debe combinarse con entrevistas, historial de edición y otras evidencias.
- Curación de datasets: filtrar documentos sintéticos en corpus ingleses antes de entrenar otros modelos, usando la puntuación como criterio de exclusión revisable.
- Auditoría de pipelines generativos: medir la proporción de salidas clasificadas como IA en un sistema de contenido para control de calidad y detección de deriva.
- Investigación en detección: utilizar el espejo como baseline reproducible en experimentos, gracias al manifiesto de hashes y a la licencia MIT.
- Análisis forense de procedencia: conservar el modelo y sus hashes como evidencia técnica en un peritaje sobre un corpus histórico en inglés.
- Transparencia y cumplimiento: generar indicadores agregados sobre contenido sintético en plataformas, documentando el umbral y manteniendo revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas específicas de detección como precisión, recall, F1 o AUROC, y tampoco se han encontrado en la búsqueda web. No se deben inferir cifras a partir del tamaño del modelo.

## Requisitos de hardware

- Estimación teórica de memoria a partir de 394,8 M de parámetros: unos 1,58 GB en FP32, 0,79 GB en FP16/BF16, 0,40 GB en INT8 y 0,20 GB en INT4. No son cuantizaciones publicadas por el autor.
- El repositorio ocupa 1,6 GB, coherente con pesos en FP32.
- Cabe en GPU de consumo: cualquier GPU con al menos 2 GB de VRAM para FP32 y al menos 1 GB para FP16. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 de 24 GB son suficientes con amplio margen.
- Es viable en CPU para inferencia por lotes, especialmente en tareas de clasificación con textos cortos.
- No hay versiones GGUF, ONNX ni TensorRT publicadas. `llama.cpp` y Ollama no pueden cargarlo sin conversión y sin reimplementar la cabeza personalizada.
- Despliegue recomendado: PyTorch con el código propio de la cabeza, envuelto en un servicio FastAPI o similar. No se documenta soporte para vLLM o TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles. Dependen del hardware, la longitud del texto y el tamaño de lote, y no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Disponibilidad | Notas |
|---|---|---|---|---|---|---|---|
| MELD v5 (`woog/meld-v5`) | 394,8 M | no disponible | inglés | MIT | safetensors | espejo en HuggingFace, 0 descargas | cabeza personalizada; requiere código propio |
| `jhu-clsp/ettin-encoder-400m` | ~400 M según denominación; cifra exacta no disponible | no disponible | no disponible | no disponible | no disponible | disponible en HuggingFace | modelo base del detector |
| `openai-community/roberta-base-openai-detector` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | alternativa habitual de la categoría; datos no verificados en la información proporcionada |
| `desklib/ai-text-detector-v1.01` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | alternativa habitual de la categoría; datos no verificados en la información proporcionada |

No se dispone de datos verificables de rendimiento para ninguna de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un espejo no oficial: el repositorio de origen fue reescrito y ahora contiene otro modelo. Antes de usarlo en producción, verificar los hashes sha256 de `original-manifest.json`.
- La cabeza personalizada impide la carga estándar con `pipeline()` y `AutoModel`; los metadatos indican `inference: false`. Requiere código específico y pruebas propias.
- Solo admite inglés. El rendimiento en otros idiomas no está documentado y previsiblemente no será fiable.
- No hay benchmarks, métricas de calibración ni umbral recomendado. El riesgo de falsos positivos y falsos negativos es desconocido.
- No se documenta la composición del corpus de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, de género, culturales o de dominio.
- La detección de texto IA es probabilística: textos humanos con estilo formulaico, traducciones o escritura no nativa pueden disparar falsos positivos; textos generados y posteriormente reescritos pueden escapar.
- No debe usarse como única prueba en decisiones académicas, laborales, editoriales o legales.
- La licencia MIT permite uso comercial y modificación, pero el autor original no ofrece garantías ni soporte; el espejo tampoco añade mantenimiento.
- No hay cuantizaciones oficiales. Cualquier conversión a GGUF u ONNX exigiría validar por separado el cuerpo y la cabeza.
- Riesgo de obsolescencia frente a generadores más recientes.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad.

## Enlaces

- Repositorio del espejo: https://huggingface.co/woog/meld-v5
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- README original incluido en el espejo: https://huggingface.co/woog/meld-v5/blob/main/ORIGINAL_README.md
- Manifiesto con hashes sha256: https://huggingface.co/woog/meld-v5/blob/main/original-manifest.json
- Repositorio de origen, ahora con otro modelo: https://huggingface.co/anon-review-meld-2026/meld
- Paper, blog, demo o repositorio de código adicional: no disponible.
- Los resultados de la búsqueda web no contienen enlaces técnicos relevantes sobre este modelo; mezclan el término MELD con el score médico y con contenido para adultos, por lo que no se incluyen.
