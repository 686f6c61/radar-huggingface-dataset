# TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v4

## Resumen

Qwen3-VL-8B-Instruct-Cuneiform-v4 es un ajuste fino (fine-tuning) del modelo vision-language Qwen3-VL-8B-Instruct de Alibaba, desarrollado por el proyecto de investigación TRACCERR. Su propósito es especializar un modelo multimodal de 8.190 millones de parámetros en la lectura, transliteración y traducción de tablillas cuneiformes sumerias, combinando reconocimiento visual de signos sobre fotografías y dibujos arqueológicos con traducción al inglés.

La versión v4 incorpora entrenamiento adicional de visión y un nuevo conjunto de datos de más de 4.000 composiciones literarias sumerias traducidas (todavía no público), lo que añade la traducción de textos literarios como capacidad nueva. Sobre conjuntos de evaluación reservados, la similitud de traducción literaria pasó de aproximadamente el 24% al 34% respecto a la v3, mientras que la lectura de fotografías de detalle mejoró 6 puntos porcentuales (de 46,1% a 52,1% en sign-F1).

Se distribuye con licencia Apache 2.0 en formatos safetensors y GGUF (incluyendo un proyector visual mmproj separado necesario para el procesamiento de imágenes), con soporte declarado para inglés y sumerio (código `sux`). Es un prototipo de investigación orientado a arqueólogos, historiadores y lingüistas, no un sustituto de asiriólogos formados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3-VL-8B-Instruct) con adaptador LoRA entrenado mediante Unsloth |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (p. ej. Q4_K_M), safetensors en precisión completa; proyector visual en BF16; matriz de importancia (imatrix) para cuantización GGUF |
| Idiomas soportados | inglés (en), sumerio (sux) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imágenes y texto, y sobre él se aplica un ajuste fino con LoRA (entrenado con Unsloth) orientado a tareas de asiriología. La arquitectura subyacente combina un codificador visual con un modelo de lenguaje; el repositorio incluye un proyector visual independiente (`mmproj-Qwen3-VL-8B-Instruct-Cuneiform-v4-BF16.gguf`) que debe cargarse junto con los pesos principales en formato GGUF para poder procesar imágenes.

El entrenamiento utiliza el conjunto de datos público TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster, complementado en esta versión con más de 4.000 conjuntos literarios traducidos que aún no forman parte del dataset público. La evaluación se realizó sobre 540 ejemplos de test (60 por tarea) extraídos de tablillas excluidas de todo el material de entrenamiento, además de conjuntos reservados específicos para traducción de fotografías y textos literarios. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Lectura de fotografías de tablillas de arcilla: identificación de signos cuneiformes visibles (sign-F1 del 52,1% en fotografías de detalle).
- Interpretación de dibujos arqueológicos de línea (sign-F1 del 61,2%) y de imágenes combinadas de foto y dibujo (33,9%).
- Transliteración de signos cuneiformes a caracteres latinos académicos (74,2% de coincidencia de signos).
- Reconstrucción inversa: conversión de transliteraciones sumerias a signos cuneiformes (86,4%).
- Traducción de sumerio transliterado al inglés, incluyendo registros administrativos y, como novedad en v4, composiciones literarias.
- Traducción directa de imagen a inglés sin transcripción manual intermedia.
- Identificación de periodos históricos y categorías documentales.
- Reconocimiento de material ilegible: el modelo puede indicar que una imagen no es interpretable en lugar de forzar una respuesta.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), con soporte conversacional.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Catalogación de colecciones museísticas: procesar lotes de fotografías de tablillas para obtener transliteraciones preliminares y metadatos de periodo histórico, acelerando la clasificación inicial antes de la revisión por un especialista.
- Investigación académica asistida: generar borradores de traducción de textos administrativos y literarios sumerios que el asiriólogo verifica y corrige, reduciendo el tiempo de primera pasada sobre corpus extensos.
- Digitalización de archivos arqueológicos: convertir dibujos de línea históricos en texto legible por máquina para su incorporación a bases de datos de investigación.
- Docencia universitaria: herramienta de apoyo para estudiantes de asiriología que permite practicar la lectura de signos y contrastar transliteraciones propias con una salida automática.
- Triaje de material no catalogado: detectar tablillas o fragmentos ilegibles o de baja calidad de imagen para priorizar qué piezas requieren fotografía o inspección adicional.
- Reconstrucción de signos: a partir de transliteraciones existentes en publicaciones, regenerar la forma cuneiforme para visualizaciones o comparaciones epigráficas.
- Análisis exploratorio de corpus literarios: obtener traducciones aproximadas de composiciones para búsqueda temática y agrupación de textos por contenido antes de un estudio filológico detallado.

## Benchmarks y rendimiento

Evaluación sobre 540 ejemplos de test (60 por tarea) de tablillas excluidas del entrenamiento. La métrica sign-F1 mide la coincidencia de signos (sin comprobar el orden); chrF mide la similitud de la traducción con una traducción humana.

| Capacidad | Qwen3-VL-8B original | v3 | v4 (esta versión) | Cambio vs v3 |
|---|---:|---:|---:|---:|
| Lectura de fotografía de detalle (sign-F1) | 0,0% | 46,1% | 52,1% | +6,0 |
| Lectura de tablilla completa (sign-F1) | 0,0% | 49,1% | 48,2% | -1,0 |
| Lectura de dibujo de línea (sign-F1) | 0,0% | 57,1% | 61,2% | +4,1 |
| Foto y dibujo combinados (sign-F1) | 0,0% | 30,5% | 33,9% | +3,4 |
| Signos a transliteración (sign-F1) | 7,1% | 73,3% | 74,2% | +0,9 |
| Transliteración a signos (sign-F1) | 2,3% | 86,2% | 86,4% | +0,3 |
| Traducción literaria (chrF) | no disponible | ~24% | ~34% | +10 aprox. |

Según el autor, ningún cambio a la baja supera el margen de error del test (en torno a 2 puntos porcentuales), salvo la lectura de tablilla completa, que no mejoró. Los valores chrF de traducción parcial se sitúan típicamente entre el 25% y el 40%, y una buena traducción automática entre el 50% y el 60%, por lo que los resultados de traducción deben interpretarse como preliminares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 8.190 millones de parámetros, la cuantización Q4_K_M requiere aproximadamente 5-6 GB de pesos, más el proyector visual en BF16 y la caché de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con 8-12 GB de VRAM en cuantización Q4; para precisión completa (BF16, ~16 GB de pesos) se recomienda una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: llama.cpp y Ollama para GGUF (requiere cargar el archivo principal y el `mmproj` de forma conjunta); vLLM o TGI para safetensors. El repositorio está marcado como compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-Cuneiform-v4 | 8.190 M | no disponible | Cuneiforme sumerio (lectura, transliteración, traducción) | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3-VL-8B-Instruct (base) | 8.000 M aprox. | no disponible | Vision-language general | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct-Cuneiform-v3 | 8.190 M | no disponible | Cuneiforme sumerio (versión anterior) | Apache 2.0 | Hugging Face |

La comparación con la versión base es reveladora: el Qwen3-VL-8B original obtiene 0,0% en lectura de signos y 7,1% en signos a transliteración, frente al 74,2% del modelo ajustado, lo que cuantifica la ganancia de la especialización. No se dispone de información sobre otros modelos especializados en cuneiforme para una comparación directa.

## Limitaciones y advertencias

- Prototipo de investigación: las lecturas y traducciones deben verificarse de forma independiente antes de tratarse como evidencia histórica.
- La métrica chrF mide similitud textual, no corrección: un 34% en traducción literaria indica traducciones parciales, no un tercio de aciertos.
- La lectura de tablilla completa no mejoró respecto a v3 e incluso retrocedió ligeramente (-1,0 puntos), dentro del margen de error.
- El rendimiento en imágenes combinadas de foto y dibujo es bajo (33,9% sign-F1), lo que limita su uso con material mixto.
- Riesgo de alucinación en signos y traducciones, especialmente en tablillas dañadas o de baja resolución; el modelo puede producir lecturas plausibles pero incorrectas.
- Idiomas limitados a inglés y sumerio (transliteración): no se documenta soporte de castellano ni de otras lenguas.
- El conjunto de datos literarios usado en el entrenamiento de v4 no es público, lo que dificulta la reproducibilidad.
- Para GGUF es imprescindible cargar el proyector visual `mmproj` junto al modelo principal; sin él no hay capacidad de visión.
- Sin datos publicados sobre sesgos, contexto máximo ni comportamiento en producción a gran escala.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de garantías de precisión desaconsejan su uso en producción sin supervisión experta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v4
- Versión anterior (v3): https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v3
- Dataset público: https://huggingface.co/datasets/TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
