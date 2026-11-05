# SZLHOLDINGS/chaski-r2-estate-sft-v1

## Resumen

Chaski R2 Estate SFT v1 es un ajuste fino (SFT) del modelo Qwen3.5-0.8B, publicado por SZLHOLDINGS bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, con 873.438.784 parámetros totales almacenados en safetensors y un repositorio de 1,8 GB. El nombre del modelo sugiere una especialización en el dominio inmobiliario ("estate"), aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento ni la tarea concreta.

El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, según indica el autor, lo que implica un pipeline de ajuste supervisado estándar sobre el modelo base. No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

Su relevancia actual es limitada pero concreta: ofrece un punto de partida ligero (menos de 1.000 millones de parámetros) para tareas multimodales especializadas en un dominio vertical, desplegable en hardware de consumo. No obstante, la ausencia de benchmarks, de documentación de datos y de un README detallado obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 orientado a entradas de imagen y texto. El autor no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, codificador visual), por lo que no es posible confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones presentes en la familia Qwen3.5.

El entrenamiento se realizó con Unsloth y TRL, según la model card, lo que sugiere un ajuste supervisado eficiente en memoria. No se especifica el volumen de datos, la composición del dataset, la presencia de datos multimodales en el ajuste ni si se aplicaron etapas de RLHF, DPO o similares. Tampoco se documenta el proceso de curación de datos del dominio inmobiliario que el nombre del modelo sugiere.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text).
- Procesamiento de entradas multimodales: imagen más prompt textual.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y con text-generation-inference.
- Capacidades específicas de razonamiento, código, matemáticas o tool calling: no documentadas en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de imágenes de inmuebles: dado el nombre del modelo y su pipeline multimodal, podría emplearse para generar descripciones textuales de fotografías de propiedades, aunque la especialización real no está documentada.
- Prototipado rápido de asistentes multimodales: con menos de 1.000 millones de parámetros, permite iterar en local sobre tareas de imagen-texto sin infraestructura dedicada.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, puede plantearse para tareas de lectura de fichas técnicas o contratos, siempre que se valide su calidad en el dominio.
- Clasificación y etiquetado asistido de imágenes: generación de descripciones cortas para catalogación de activos inmobiliarios.
- Base para ajustes finos adicionales: al ser un checkpoint Apache 2.0 de tamaño reducido, sirve como punto de partida para especializaciones verticales con Unsloth o TRL.
- Evaluación comparativa de modelos multimodales pequeños: útil en experimentos académicos que requieran un modelo de menos de 1.000 millones de parámetros con licencia permisiva.
- Despliegue en entornos con recursos limitados: su tamaño permite inferencia en GPU de consumo, lo que facilita demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (873 millones de parámetros), en FP16 requeriría aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del codificador visual; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; para producción, A100 o H100 no serían necesarias por capacidad, aunque podrían usarse por throughput.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPUs con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers, text-generation-inference (según tags), endpoints de Hugging Face; compatibilidad con vLLM, llama.cpp u Ollama no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/chaski-r2-estate-sft-v1 | 873 M | no disponible | Apache 2.0 | Sí (image-text-to-text) | Ajuste fino vertical sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (modelo base) | ~800 M (no confirmado) | no disponible | no disponible en la información | Sí | Modelo original sin ajuste de dominio |
| Alternativas multimodales pequeñas de la familia Qwen | no disponible | no disponible | no disponible | Sí | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste ni sobre su rendimiento en tareas del dominio inmobiliario.
- Documentación mínima: la model card no describe el dataset de entrenamiento, el proceso de curación ni las métricas de evaluación.
- Riesgo de alucinación: al ser un modelo pequeño y sin alineación documentada, es probable que genere descripciones inexactas de imágenes o textos, especialmente en dominios especializados.
- Idioma: solo se declara soporte de inglés; el uso en castellano no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base y de los datos de entrenamiento, no documentadas.
- Sesgos: no documentados; al derivar de un modelo base entrenado con datos web, es previsible que herede sesgos de género, culturales y geográficos.
- Modelo recién publicado (noviembre de 2026) con cero descargas y cero likes: sin validación por parte de la comunidad.
- Nombre del modelo ("estate") sugiere especialización inmobiliaria, pero no hay confirmación de que el ajuste sea efectivo para esa tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2-estate-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de Hugging Face): https://github.com/huggingface/trl
