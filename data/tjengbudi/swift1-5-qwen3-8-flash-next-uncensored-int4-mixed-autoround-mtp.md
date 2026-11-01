# tjengbudi/Swift1.5-Qwen3.8-Flash-Next-Uncensored-INT4-Mixed-AutoRound-MTP

## Resumen

Swift1.5-Qwen3.8-Flash-Next-Uncensored-INT4-Mixed-AutoRound-MTP es una variante "abliterated" (sin censura) del modelo Minachist/Swift1.5-Qwen3.8-Flash-Next-INT4-Mixed-AutoRound, publicada por el usuario tjengbudi en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text con cerca de 140.000 millones de parámetros totales (139.734.687.635 según los pesos en safetensors), cuantizado en precisión mixta INT4/INT6 mediante AutoRound y con soporte declarado de Multi-Token Prediction (MTP). El repositorio ocupa 223,4 GB.

El modelo parte de la familia Qwen (etiqueta `qwen4_exp`) y hereda la arquitectura del modelo base, del que solo se conoce su identificador y su condición de cuantización INT4 mixta. La modificación principal respecto al base es el proceso de "abliteration", que elimina los mecanismos de rechazo del modelo original, orientándolo a usos sin restricciones de contenido. Incorpora además la etiqueta `compressed-tensors`, lo que indica compatibilidad con el formato de tensores comprimidos de Neural Compressor para despliegue eficiente.

Su relevancia es acotada: se publica con acceso restringido (gated), sin descargas ni interacciones registradas en el momento de la consulta, y bajo la licencia `swift-open-license-1.0`. Es un modelo experimental orientado a investigadores que necesiten evaluar comportamiento sin censura en un modelo multimodal de gran tamaño cuantizado, no una opción recomendada para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen (`qwen4_exp`); detalles internos no disponibles |
| Parametros totales | 139.734.687.635 (~139,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 mixta (INT4/INT6) con AutoRound; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (acceso restringido/gated) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de las etiquetas del repositorio: se trata de un transformer multimodal de la familia Qwen (etiqueta `qwen4_exp`), con entrada image-text-to-text, es decir, capaz de procesar imágenes y texto conjuntamente. El modelo incorpora la etiqueta `mtp`, que indica soporte de Multi-Token Prediction, una técnica de decodificación que predice varios tokens por paso para aumentar el throughput de generación. El peso total de ~139,7 B parámetros corresponde a los pesos ya cuantizados en el repositorio, no necesariamente al modelo original en precisión completa.

El entrenamiento original del modelo base (Minachist/Swift1.5-Qwen3.8-Flash-Next-INT4-Mixed-AutoRound) no está documentado en la información disponible: se desconoce el volumen de tokens, la composición del dataset, si hubo RLHF/DPO y el proceso exacto de abliteration aplicado. La cadena de derivación es: un modelo Qwen de base, un ajuste fino o variante "Swift1.5-Qwen3.8-Flash-Next", una cuantización INT4 mixta con AutoRound, y finalmente esta versión uncensored con MTP. La cuantización AutoRound es una técnica de cuantización post-entrenamiento con ajuste de redondeo por capas que busca minimizar la pérdida de calidad respecto al modelo en FP16/BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat (`conversational`).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo sobre contenido visual.
- Comportamiento sin censura (abliterated): el modelo no aplica los rechazos típicos del modelo original ante peticiones sensibles, lo que amplía el rango de respuestas generadas.
- Decodificación con Multi-Token Prediction (MTP) para acelerar la generación.
- Razonamiento y generación de código: capacidad esperable por herencia de la familia Qwen, aunque no verificada en la documentación disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar qué respuestas genera un modelo multimodal de ~140 B parámetros cuando se eliminan los mecanismos de rechazo, comparándolo con el modelo base original en experimentos controlados de evaluación de sesgos y seguridad.
- Evaluación de cuantización AutoRound en modelos multimodales grandes: sirve para medir la degradación de calidad de la cuantización INT4/INT6 mixta frente a precisión completa en tareas de visión-lenguaje, con un peso de repositorio de 223,4 GB manejable en infraestructura de un solo nodo multi-GPU.
- Pruebas de decodificación especulativa con MTP: útil para medir la ganancia de throughput de Multi-Token Prediction en un modelo de este tamaño y comparar latencias frente a decodificación autoregresiva estándar.
- Generación de descripciones y análisis de imágenes sin filtros: para pipelines internos de etiquetado o análisis de contenido donde los rechazos del modelo base interrumpen el flujo, siempre en entornos controlados y con revisión humana.
- Prototipado de asistentes conversacionales multimodales: el formato `conversational` y la entrada image-text-to-text permiten construir demos de chat que aceptan capturas o fotografías, aunque el acceso gated y la falta de benchmarks desaconsejan usarlo como base de producción sin validación.
- Estudio de la cadena de derivación de modelos: al ser una variante de un modelo ya cuantizado, permite analizar cómo se propagan los artefactos de cuantización y de abliteration a lo largo de varias generaciones de ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 223,4 GB en safetensors cuantizados INT4/INT6 mixtos; la VRAM necesaria para cargar los pesos es del orden de esa cifra más el overhead de activaciones y KV cache, por lo que no cabe en ninguna GPU de consumo actual.
- Se requiere un nodo multi-GPU: por ejemplo, 4×A100 80 GB, 4×H100 80 GB o configuraciones equivalentes con al menos ~250-300 GB de memoria agregada para inferencia holgada.
- No es viable en RTX 4090, RTX 3090 ni GPUs de consumo con 24 GB o menos, ni siquiera con descarga parcial por capas sin degradación severa de latencia.
- Despliegue: el formato compressed-tensors y la etiqueta AutoRound apuntan a vLLM o a herramientas de Neural Compressor/llm-compressor como vías principales; llama.cpp y Ollama no están confirmados para este formato cuantizado y multimodal.
- Latencia y throughput: no disponibles. El soporte MTP debería mejorar el throughput respecto a decodificación estándar, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| tjengbudi/Swift1.5-Qwen3.8-Flash-Next-Uncensored-INT4-Mixed-AutoRound-MTP | ~139,7 B | no disponible | image-text-to-text | swift-open-license-1.0 | Gated |
| Minachist/Swift1.5-Qwen3.8-Flash-Next-INT4-Mixed-AutoRound (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Familia Qwen de origen (modelo del que deriva) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de los mecanismos de rechazo implica que puede generar contenido dañino, ilegal o sensible sin filtro; no es apto para aplicaciones abiertas al público sin moderación externa.
- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.
- Licencia `swift-open-license-1.0`: es una licencia "other" no estándar; deben revisarse sus términos exactos antes de cualquier uso comercial, que puede estar restringido.
- Sin datos de benchmarks, idiomas ni contexto: no es posible estimar su calidad real frente al modelo base ni su comportamiento multilingüe.
- Riesgo de alucinación: no cuantificado, pero esperable en modelos conversacionales de este tamaño, agravado por la cuantización INT4 y por la ausencia de evaluación publicada.
- La cuantización mixta INT4/INT6 y la cadena de derivación (base → cuantizado → abliterated → MTP) pueden acumular degradaciones no documentadas.
- Sin descargas ni likes registrados: no hay evidencia de comunidad ni de validación independiente del modelo.
- Soporte de tool calling, agentes y contexto largo no confirmado; no asumir estas capacidades en producción.

## Enlaces

- HuggingFace: https://huggingface.co/tjengbudi/Swift1.5-Qwen3.8-Flash-Next-Uncensored-INT4-Mixed-AutoRound-MTP
- Modelo base: https://huggingface.co/Minachist/Swift1.5-Qwen3.8-Flash-Next-INT4-Mixed-AutoRound
