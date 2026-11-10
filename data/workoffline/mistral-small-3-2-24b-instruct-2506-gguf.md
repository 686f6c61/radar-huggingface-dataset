# WorkOffline/Mistral-Small-3.2-24B-Instruct-2506-GGUF

## Resumen

Este repositorio es un espejo sin modificaciones de los ficheros GGUF de Mistral Small 3.2 24B Instruct 2506, publicado por el usuario WorkOffline para que su aplicación pueda descargar los pesos desde una única ubicación, fijada a una revisión concreta y verificada mediante SHA-256. No se trata de un modelo nuevo ni de una conversión propia: los bytes son idénticos a los del repositorio original de unsloth, y el modelo subyacente es Mistral Small 3.2 24B Instruct 2506, desarrollado por Mistral AI.

El modelo base es un transformer denso de aproximadamente 23.570 millones de parámetros (23,57 B), ajustado para instrucciones y conversación, con capacidades multimodales (incluye un proyector de visión `mmproj` en formato F16). Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y es relevante ahora porque ofrece un equilibrio poco habitual entre tamaño (cabe en GPUs de 24-48 GB con cuantización Q4) y capacidades de instrucción, tool calling y visión.

La ficha se centra en el modelo base (Mistral Small 3.2 24B Instruct 2506) y en las particularidades de esta distribución GGUF, indicando explícitamente cuando un dato no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE); multimodal con proyector de visión (`mmproj`) |
| Parametros totales | 23.572.403.200 (~23,57 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (incluido en el repo); otras cuantizaciones no listadas aquí |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M + `mmproj` F16 para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Mistral AI con aproximadamente 23,57 B de parámetros, orientado a instrucciones y conversación. La distribución de este repositorio incluye dos ficheros: `Mistral-Small-3.2-24B-Instruct-2506-Q4_K_M.gguf` (14.333.922.848 bytes, cuantización Q4_K_M generada por unsloth) y `mmproj-Mistral-Small-3.2-24B-Instruct-2506-F16.gguf` (878.053.568 bytes), que es el proyector multimodal necesario para habilitar la entrada de imágenes en llama.cpp y derivados. La etiqueta `imatrix` en el repositorio sugiere que la cuantización se generó con matrices de importancia, práctica habitual de unsloth para preservar calidad en cuantizaciones bajas.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset, etapas de RLHF/DPO ni innovaciones técnicas específicas (attention linear, decodificación especulativa, etc.) del modelo base. Cualquier afirmación al respecto requeriría consultar la model card oficial de `mistralai/Mistral-Small-3.2-24B-Instruct-2506`, que no forma parte de los datos aquí disponibles.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno (etiqueta `conversational`).
- Razonamiento y resolución de tareas de instrucción general.
- Capacidades multimodales de visión: el repo incluye `mmproj` F16, lo que permite procesar imágenes junto a texto en llama.cpp y forks compatibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que los ficheros pueden servirse mediante APIs compatibles con el formato de endpoints habitual (por ejemplo, servidores tipo OpenAI-compatible).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta revisión concreta; debe verificarse contra la model card oficial.
- Soporte de agentes y multi-step reasoning: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantización Q4_K_M (≈14,3 GB) permite ejecutar el modelo en una RTX 4090 o similar con llama.cpp, cubriendo chat e instrucciones generales sin depender de la nube.
- Asistente conversacional multi-turno: el modelo está ajustado para instrucciones y conversación, por lo que puede usarse como backend de un chatbot interno con contexto gestionado por la aplicación cliente.
- Procesamiento de documentos con imágenes: gracias al proyector `mmproj` F16, se pueden enviar capturas, gráficos o páginas escaneadas junto a preguntas de texto para tareas de extracción o descripción.
- Integración en aplicaciones de escritorio tipo WorkOffline: el repositorio está pensado exactamente para que una app descargue pesos desde una ubicación fija con revisión y hash verificables, facilitando despliegues reproducibles.
- Servicio interno compatible con API de endpoints: la etiqueta `endpoints_compatible` sugiere su uso detrás de servidores que expongan una API estilo OpenAI, útil para prototipos y herramientas internas.
- Evaluación comparativa de cuantizaciones: al ser un espejo con SHA-256 publicado, sirve como artefacto de referencia para medir degradación de calidad entre Q4_K_M y otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 14,3 GB solo para los pesos; con overhead de contexto y KV cache, prever del orden de 16-20 GB según longitud de contexto.
- Proyector de visión: añade ~0,88 GB (F16) cuando se usa entrada multimodal.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB, L40S 48 GB o H100 para contexto largo o mayor paralelismo.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB con Q4_K_M; en 16 GB requeriría cuantizaciones más agresivas (no incluidas en este repo).
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp), servidores compatibles con GGUF y APIs tipo endpoints; vLLM y TGI no consumen GGUF de forma nativa en esta configuración.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Mistral Small 3.2 24B Instruct 2506 (este repo, GGUF) | ~23,57 B | no disponible | Apache 2.0 | GGUF Q4_K_M + mmproj F16 | Multimodal, denso, espejo verificado |
| Mistral Small 3.1 24B Instruct | ~23,57 B | no disponible | Apache 2.0 | safetensors, GGUF | Predecesor; diferencias concretas no disponibles aquí |
| Qwen2.5 32B Instruct | ~32 B | no disponible | Apache 2.0 (variantes) | safetensors, GGUF | Mayor tamaño, requiere más VRAM |
| Gemma 3 27B Instruct | ~27 B | no disponible | Licencia Gemma | safetensors, GGUF | Multimodal; licencia con términos adicionales |

Los datos de contexto y rendimiento de las alternativas no están disponibles en la información proporcionada; la comparación se limita a tamaño, licencia y formato.

## Limitaciones y advertencias

- Este repositorio es un espejo: no introduce mejoras ni correcciones sobre el modelo original; cualquier problema del modelo base se hereda tal cual.
- La model card del repositorio indica que el modelo base declara Apache 2.0 pero no incluye fichero de licencia; aquí se añade el texto estándar Apache 2.0. Verificar siempre la licencia en el repositorio oficial de Mistral AI antes de uso comercial.
- La cuantización Q4_K_M introduce pérdida de calidad respecto a los pesos originales en precisión completa; para tareas sensibles conviene validar con evaluaciones propias.
- Riesgo de alucinación inherente a modelos de lenguaje; no se dispone de datos específicos de tasas de alucinación en esta información.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no asumir cobertura multilingüe sin verificar la model card oficial.
- Longitud de contexto: no disponible; planificar la VRAM en consecuencia, ya que contextos largos incrementan el consumo de KV cache.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; su utilidad depende de la app WorkOffline y no de un uso comunitario amplio.
- Los hashes SHA-256 publicados permiten verificar integridad, pero solo para la revisión `b750ec2299225e492f1bd27cab88a0a595fa848f` de unsloth.

## Enlaces

- Repositorio GGUF espejo: https://huggingface.co/WorkOffline/Mistral-Small-3.2-24B-Instruct-2506-GGUF
- Modelo base oficial: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Conversión GGUF original (unsloth): https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
