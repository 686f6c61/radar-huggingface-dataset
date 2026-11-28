# vidit04/UnlimitedOCR-Vidit-NF4-4BIT

## Resumen

UnlimitedOCR-Vidit-NF4-4BIT es una versión cuantizada en 4 bits del modelo baidu/Unlimited-OCR, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto a partir de imágenes. La cuantización, realizada por el usuario vidit04 mediante BitsAndBytes en formato NF4, reduce el peso del checkpoint a aproximadamente 2,2 GB, lo que facilita su despliegue en infraestructura más modesta que la requerida por el modelo original en FP16.

El modelo conserva la arquitectura y los pesos del modelo base de Baidu (3.336 millones de parámetros, pipeline image-text-to-text) y se distribuye en formato safetensors con código personalizado, por lo que requiere una versión de Transformers, Accelerate y BitsAndBytes compatible con la carga de capas cuantizadas. Su relevancia actual radica en que permite ejecutar un OCR de última generación en entornos con recursos limitados, aunque el propio autor advierte de que la evaluación de la precisión OCR real está pendiente.

Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: no se dispone de información sobre el dataset de entrenamiento original, los idiomas soportados ni la licencia exacta, y el autor recomienda consultar el repositorio del modelo base para los detalles de arquitectura e inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (image-text-to-text), arquitectura del modelo base baidu/Unlimited-OCR; detalles internos no disponibles |
| Parámetros totales | 3.336.106.497 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NF4 4-bit (BitsAndBytes), compute dtype FP16; 2.341 capas lineales en 4 bits, 0 capas en 8 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor remite a la licencia del modelo base) |
| Formato de pesos | Safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo baidu/Unlimited-OCR, del que no se detallan en la información disponible ni la arquitectura interna exacta (más allá de ser un modelo de imagen-a-texto), ni el volumen de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única innovación técnica documentada en esta ficha es el proceso de cuantización: se aplicó cuantización de pesos en NF4 de 4 bits con BitsAndBytes sobre 2.341 capas lineales, manteniendo el cómputo en FP16, lo que reduce drásticamente el tamaño del checkpoint respecto al original.

El autor reporta una degradación medible en perplejidad de lenguaje: sobre WikiText-2 en modo solo texto, la perplejidad pasa de 189,66 (FP16) a 229,48 (cuantizado), un incremento del 20,99 %. El propio autor advierte que esta métrica no demuestra equivalencia en precisión OCR y que se requiere una evaluación con transcripciones de documentos reales como referencia.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, según el pipeline image-text-to-text y los tags del modelo.
- Generación de texto condicionada por imagen (image-text-to-text) mediante la librería Transformers.
- Extracción de características (feature-extraction) según los tags del repositorio.
- Uso conversacional (tag conversational), aunque no se detalla el formato de plantilla de chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes, visión adicional, audio o modo de razonamiento extendido: no disponible.

## Casos de uso

- Digitalización de documentos escaneados: el modelo recibe una imagen de página y devuelve el texto transcrito, lo que permite construir pipelines de conversión de archivos PDF o imágenes a texto estructurado en entornos con GPU de gama media gracias al tamaño reducido del checkpoint cuantizado.
- Extracción de datos de facturas y recibos: integrado en un flujo de preprocesado, puede transcribir campos de documentos comerciales para su posterior parseo con reglas o modelos ligeros, reduciendo el coste de infraestructura frente al modelo en FP16.
- Procesamiento por lotes en servidores modestos: al ocupar aproximadamente 2,2 GB en disco y requerir menos VRAM que el original, es viable en GPUs de consumo para tareas de OCR por lotes no críticas en latencia.
- Prototipado e investigación en OCR: sirve para experimentar con modelos de OCR de gran tamaño en estaciones de trabajo con una sola GPU, evaluando la calidad de transcripción antes de decidir si migrar a la versión completa en FP16.
- Indexación de archivos históricos: digitalización de fondos documentales con revisión humana posterior, aprovechando el menor coste por página del checkpoint cuantizado.
- Pruebas de regresión de cuantización: útil como referencia para medir el impacto real del NF4 en tareas de OCR frente al modelo base, dado que el autor ya publica una comparación de perplejidad.

## Benchmarks y rendimiento

| Métrica | Modelo original (FP16) | Modelo cuantizado (NF4 4-bit) | Variación |
|---|---:|---:|---:|
| Perplejidad WikiText-2 (solo texto) | 189,664790 | 229,477460 | +20,99 % |

No se han publicado resultados de benchmarks de OCR (por ejemplo, precisión de transcripción sobre documentos con referencia) en la información disponible. El propio autor indica que esta evaluación está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.336 millones de parámetros en 4 bits, los pesos ocupan aproximadamente 1,7 GB, por lo que en la práctica se necesita VRAM adicional para activaciones, caché y el procesador de visión (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría esperar viabilidad en GPUs de consumo con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos con suficiente VRAM, pero no confirmado en la información disponible.
- Opciones de despliegue: Transformers con Accelerate y BitsAndBytes (requisito explícito del autor); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnlimitedOCR-Vidit-NF4-4BIT | 3.336 M | No disponible | NF4 4-bit | No disponible | Hugging Face |
| baidu/Unlimited-OCR (base) | 3.336 M | No disponible | FP16 | No disponible | Hugging Face |
| Otros modelos OCR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar el rendimiento OCR con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización NF4 introduce una degradación medible: +20,99 % de perplejidad en WikiText-2 respecto al modelo FP16, y no se ha verificado la equivalencia en precisión OCR.
- El autor advierte explícitamente de que la evaluación de OCR con transcripciones reales está pendiente; no debe asumirse paridad de calidad con el modelo base.
- Licencia no disponible: es imprescindible consultar la licencia de baidu/Unlimited-OCR antes de cualquier uso comercial o redistribución.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no disponible, lo que impide planificar documentos de gran tamaño sin pruebas previas.
- Requiere código personalizado (custom_code) y un entorno específico de Transformers, Accelerate y BitsAndBytes; puede fallar con versiones incompatibles.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a los modelos generativos de imagen-a-texto.
- Repositorio con 0 descargas y 1 like: no hay evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vidit04/UnlimitedOCR-Vidit-NF4-4BIT
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
