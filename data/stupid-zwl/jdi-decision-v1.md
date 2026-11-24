# stupid-zwl/jdi-decision-v1

## Resumen

JDI-Decision-V1 es un modelo de decisión multimodal publicado en Hugging Face bajo el identificador `stupid-zwl/jdi-decision-v1`, derivado del sistema JDI-Decision de JD Industrials (京东工业). El modelo no es un generador de texto conversacional al uso, sino un sistema que recibe un estado (texto e imágenes), una pregunta con opciones y devuelve una elección estructurada junto con las probabilidades asociadas a cada opción. Su arquitectura parte de Qwen3.8-27B con adaptaciones de la arquitectura de decisión D3, e incorpora un codificador visual propio, un componente de reconocimiento de texto PaddleOCR v5 congelado (de Baidu) y una cabeza de lectura en FP32.

El modelo resuelve el problema de la toma de decisiones estructurada sobre entradas multimodales: en lugar de generar texto libre, produce respuestas con formato de elección y distribuciones de probabilidad, lo que facilita su integración en pipelines donde se requiere una decisión auditable. Según la model card, el sistema completo reporta una puntuación de 79,3601 en el suite público Decision Index Vision (12.210 de 12.210 peticiones exitosas en 11 benchmarks), con una latencia media de 345,5 ms por petición en dos workers H200.

El repositorio asociado tiene un tamaño de 52,2 GB y declara 26.085.330.160 parámetros en pesos safetensors. La licencia es CC BY-NC 4.0, restringida a uso no comercial salvo autorización expresa de JD Industrials. Cabe destacar que la model card indica que la versión V1 se ha trasladado a la organización JoyIndustrial, mientras que esta página corresponde a la V0.9.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.8-27B con adaptaciones de arquitectura de decisión D3 (codificador visual + PaddleOCR v5 congelado + backbone de decisión + lectura FP32) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso no comercial con atribución; uso comercial requiere autorización separada) |
| Formato de pesos | safetensors (librería pytorch; incluye código personalizado `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un sistema multimodal de decisión compuesto por varias piezas que se ejecutan de forma concurrente en una misma GPU. La entrada de imagen se decodifica, se convierte a RGB y se redimensiona respetando un límite de píxeles antes de pasar por dos ramas paralelas: un codificador visual que extrae características de la imagen y un componente PaddleOCR v5 congelado que reconoce el texto presente en la imagen. El texto reconocido se incorpora como `state.image_text_transcription` junto al estado original, de modo que complementa la información visual en lugar de sustituirla.

El backbone de decisión procesa las características visuales junto con el texto, las preguntas y las opciones, y una cabeza de lectura en FP32 genera la respuesta estructurada y las probabilidades por opción. Las características visuales solo se reutilizan dentro de la misma petición. La model card remite a una guía de reproducción (REPRODUCE.md) para los detalles de la arquitectura base y del runtime de decisión, pero no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión estructurada multimodal: recibe un estado (texto e imágenes) y una pregunta con criterios u opciones, y devuelve una elección junto con probabilidades por opción.
- Reconocimiento de texto en imágenes mediante PaddleOCR v5 congelado, integrado como rama paralela al codificador visual.
- Procesamiento conjunto de características visuales y texto para fundamentar la decisión.
- Salida con probabilidades por opción, útil para umbrales de confianza y revisión humana.
- Ejecución de cada petición en una sola GPU, con reutilización de características visuales limitada a la propia petición.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inspección documental con decisión asociada: el sistema puede recibir una imagen de un documento o etiqueta, extraer el texto con PaddleOCR v5 y decidir entre opciones predefinidas (por ejemplo, categoría de producto o conformidad), lo que encaja con el origen industrial del modelo.
- Clasificación visual con texto incrustado: en entornos de almacén o logística, una imagen de un cartel o embalaje se procesa por la rama visual y la de OCR, y el backbone devuelve la opción más probable entre las candidatas definidas por el integrador.
- Verificación de condiciones en flujos de aprobación: el modelo puede formularse como una pregunta de elección (aprobado/rechazado/revisión) sobre un estado compuesto por texto e imágenes, con probabilidades que permiten fijar umbrales de escalado a revisión humana.
- Enrutamiento de solicitudes con evidencia visual: dado un estado multimodal, decidir a qué cola o categoría pertenece una incidencia, usando la salida probabilística para priorizar casos ambiguos.
- Control de calidad asistido: comparar una imagen de producto con criterios textuales y obtener una decisión estructurada con puntuación de confianza, integrable en un sistema de inspección existente.
- Evaluación de decisiones auditables: al conservar respuestas, probabilidades y hashes de payload (según el dataset de evaluación publicado), el sistema es adecuado para entornos donde se requiere trazabilidad de la decisión, no solo del texto generado.

## Benchmarks y rendimiento

La model card reporta una puntuación de 79,3601 en el suite público Decision Index Vision, con 12.210 de 12.210 peticiones exitosas en 11 benchmarks. Se trata de una puntuación autodeclarada, no de un ranking confirmado en leaderboard ni de la puntuación completa. La evaluación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes según el autor.

Latencia por petición (incluye decodificación, OCR, codificación visual y forward de decisión; excluye carga, hashing de integridad y ejecuciones de profiler), medida con dos workers H200, una réplica completa del sistema por worker y una petición a la vez:

| Metrica | Valor |
|---|---|
| Media | 345,5 ms |
| P50 | 282,4 ms |
| P80 | 426,8 ms |
| P90 | 604,2 ms |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 26.085.330.160 parámetros en safetensors y un repositorio de 52,2 GB, la inferencia en precisión completa requiere hardware de clase数据中心. No se documentan cuantizaciones.
- GPU recomendadas: la evaluación reportada se ejecutó en dos workers H200, cada uno con una réplica completa del sistema. La validación oficial de latencia en RTX PRO 6000 está pendiente según el autor.
- Cabe en GPU de consumo: no disponible; el tamaño del modelo y la ausencia de cuantizaciones documentadas hacen improbable su despliegue en GPU de consumo sin cuantización adicional no soportada oficialmente.
- Opciones de despliegue: el punto de entrada de reproducción es `ocr_inference.ComboEngine` (sistema completo) y `inference.D3Engine` (modelo de decisión interno, sin el procesamiento OCR del sistema completo). Requiere Python 3.12 y GPU CUDA; el script `ocr_inference/setup.sh` descarga los archivos OCR oficiales de Paddle y verifica SHA256. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia media de 345,5 ms por petición en la configuración H200 descrita; el throughput no se reporta y la ejecución es de una petición a la vez por réplica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión multimodal con los que contrastar parámetros, contexto, rendimiento y licencia. La model card no ofrece comparativas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JDI-Decision-V1 (este) | 26.085.330.160 | no disponible | CC BY-NC 4.0 | Hugging Face (`stupid-zwl/jdi-decision-v1`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial requiere autorización separada de JD Industrials; la atribución es obligatoria. Los componentes de terceros (PaddleOCR, arquitectura base) conservan sus propias licencias.
- La puntuación de 79,3601 en Decision Index Vision es autodeclarada y no constituye un ranking confirmado ni la puntuación completa; la evaluación privada está pendiente.
- La validación oficial de latencia en RTX PRO 6000 está pendiente; los datos de latencia proceden de una configuración concreta (H200, una petición a la vez) y no deben extrapolarse sin verificación.
- El modelo está diseñado para decisiones estructuradas con opciones predefinidas, no como generador de texto libre; usarlo fuera de ese esquema no está respaldado por la documentación.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; estos extremos deben validarse empíricamente antes de un despliegue en producción.
- Riesgo de alucinación y de errores de OCR: la transcripción de texto reconocido complementa pero no sustituye la imagen, y los errores del componente OCR pueden propagarse a la decisión final.
- El OCR y los headers de compilación de Paddle conservan los términos de licencia upstream; su redistribución debe respetarlos.
- Esta página corresponde a la V0.9; la V1 se ha trasladado a la organización JoyIndustrial, por lo que conviene verificar qué versión se está desplegando.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stupid-zwl/jdi-decision-v1
- JDI-Decision-V1 en la organización JoyIndustrial: https://huggingface.co/JoyIndustrial/JDI-Decision-V1
- Dataset de resultados de evaluación: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V0.9/tree/main/runs/vision-paddle-v5
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Guía de reproducción (referenciada en la model card): REPRODUCE.md dentro del repositorio del modelo
- Fuentes y hashes del OCR (referenciado en la model card): ocr_inference/ocr_sources.json dentro del repositorio del modelo
