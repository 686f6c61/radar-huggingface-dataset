# xw17/gemma-3-4b-it_SFT_lora_ifhaffect

## Resumen

`xw17/gemma-3-4b-it_SFT_lora_ifhaffect` es un adaptador LoRA publicado en Hugging Face por el usuario xw17 sobre el modelo base `google/gemma-3-4b-it`. Por el propio nombre del repositorio cabe deducir que se trata de un ajuste supervisado (SFT) mediante LoRA sobre el modelo instructivo de 4.000 millones de parámetros de Google, presumiblemente orientado a tareas relacionadas con el afecto o la emoción, pero la model card no documenta ni el conjunto de datos, ni el procedimiento, ni los hiperparámetros empleados.

El repositorio, de aproximadamente 0,1 GB, no contiene pesos completos: por tamano y por la etiqueta `safetensors`, lo más probable es que aloje únicamente las matrices del adaptador, que requieren descargar aparte el modelo base para poder ejecutarse. La model card es la plantilla automática de Hugging Face, con todos los campos marcados como `[More Information Needed]`; no se declara licencia, idiomas, pipeline ni procedencia de los datos.

El modelo acumula cero descargas y cero likes, y sus fechas de creación y actualización son incoherentes con el calendario (octubre de 2026), lo que apunta a un artefacto experimental o de prueba más que a un recurso mantenido. Su interés es por tanto exploratorio: sirve como ejemplo de ajuste de bajo rango sobre Gemma 3 4B, pero no debería desplegarse en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (matrices de bajo rango) sobre un transformer decoder-only; el modelo base es `google/gemma-3-4b-it`. El repositorio no documenta la arquitectura del adaptador |
| Parametros totales | No disponible en el repositorio. El modelo base declara aproximadamente 4.000 millones de parámetros; un adaptador LoRA típico sobre este tamano suele estar entre 10 y 100 millones adicionales, cifra no confirmada |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en el repositorio. El modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; la cuantizacion (GGUF, AWQ, GPTQ, bitsandbytes) requeriría fusionar el adaptador con el modelo base y no está documentada |
| Idiomas soportados | No disponible. El modelo base declara soporte para más de 140 idiomas |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo los términos de uso de Gemma, que imponen restricciones de uso comercial y de redistribución |
| Formato de pesos | Safetensors (adaptador, aproximadamente 0,1 GB en el repositorio) |

## Arquitectura y entrenamiento

El repositorio apunta a un ajuste mediante LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e introduce pares de matrices de bajo rango en determinadas proyecciones, reduciendo el coste de entrenamiento en varios órdenes de magnitud. No se especifica el rango, el valor de alpha, el dropout, los módulos objetivo ni la tasa de aprendizaje, ni tan siquiera si el ajuste se realizó en precisión completa o cuantizado. El sufijo `ifhaffect` sugiere un corpus o una tarea de tipo afectivo, pero no hay ninguna confirmación documental en la ficha.

En cuanto al modelo base, Gemma 3 4B es un transformer decoder-only con atención intercalada: la mayoría de capas usan atención local con ventana deslizante de 1.024 tokens y una de cada seis emplea atención global, lo que reduce el coste del contexto largo. Incorpora normalización RMSNorm, activaciones GeGLU, normalización de consultas y claves (QK-norm) y atención con cabezas KV compartidas (GQA). La variante de 4B es multimodal: acepta imagen y texto como entrada, con un codificador visual basado en SigLIP, y genera únicamente texto. Según la documentación pública de Google, la familia Gemma 3 se entrenó sobre corpus masivos de texto y multimodal, con destilación desde modelos mayores y un post-entrenamiento con refuerzo a partir de retroalimentación humana (RLHF), si bien el repositorio que nos ocupa no aporta ningún dato al respecto.

## Capacidades

Las capacidades que se enumeran a continuación corresponden a las del modelo base y son heredadas de forma presunta; no hay ninguna evaluación que confirme que el ajuste LoRA las preserve.

- Generación de texto instructivo en modo conversación multi-turno.
- Razonamiento básico, aritmética y generación de código de complejidad media, dentro de lo esperable en un modelo de 4.000 millones de parámetros.
- Entrada multimodal de imágenes (descripción, extracción de información y preguntas sobre la imagen); la salida es siempre texto.
- Soporte multilingüe amplio según la documentación del modelo base, con rendimiento desigual entre idiomas.
- Soporte de function calling y de plantillas de herramientas en el chat template del modelo base.
- Contexto largo de hasta 128.000 tokens en el modelo base, útil para resúmenes de documentos extensos.
- No dispone de modo de razonamiento extendido explícito ni de generación de audio o vídeo.

## Casos de uso

- Análisis de afecto y emoción en textos: si el ajuste responde realmente a la tarea sugerida por el nombre, podría emplearse para etiquetar reseñas, tuits o transcripciones con categorías emocionales. Requiere validación previa con un conjunto etiquetado propio, dado que no hay métricas publicadas.
- Pre-anotación de corpus afectivos: uso como etiquetador de primera pasada en un flujo de anotación humana, aprovechando el bajo coste de ejecución de un modelo de 4B y filtrando después con revisión manual.
- Investigación académica sobre LoRA: sirve como caso de estudio reproducible de ajuste de bajo rango sobre Gemma 3, comparando su comportamiento con el modelo base sin ajustar.
- Punto de partida para un ajuste posterior de dominio: el adaptador puede fusionarse con el modelo base y continuar el entrenamiento con QLoRA sobre datos propios, con un coste de hardware moderado.
- Asistentes conversacionales de nicho con despliegue local: al ejecutarse en una GPU de consumo o en memoria unificada, permite prototipos donde los datos sensibles (por ejemplo, textos con contenido psicológico) no salen del equipo.
- Evaluación de sesgos en modelos afectivos: útil para estudiar cómo un ajuste pequeño altera el tono, la empatía percibida o los estereotipos del modelo base en contextos emocionales.
- Moderación de contenido asistida: clasificación de mensajes según su carga emocional o agresividad como señal auxiliar, nunca como decisión automática sin supervisión.
- Generación de respuestas empáticas en atención al cliente: redacción de borradores con tono adecuado, integrables en un CRM mediante la API de transformers compatible con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de evaluación, y no consta que el autor haya medido el adaptador frente al modelo base ni frente a alternativas. Cualquier cifra que se citase sería una invención, por lo que se recomienda ejecutar una evaluación propia con tareas representativas del caso de uso previsto antes de considerar el modelo para cualquier aplicación real.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (aproximadamente 0,1 GB). Es imprescindible descargar adicionalmente `google/gemma-3-4b-it`, cuyos pesos en bf16 ocupan alrededor de 8 GB.
- Inferencia en bf16: se recomienda un mínimo de 10-12 GB de VRAM para contexto corto, y bastante más si se aprovecha la ventana completa. La caché KV a 128.000 tokens puede superar los 10-15 GB en bf16 según la implementación, por lo que conviene limitar el contexto a unos miles de tokens en hardware de consumo.
- Cuantización a 8 bits: aproximadamente 5-6 GB de VRAM. Cuantización a 4 bits: aproximadamente 3-4 GB, con pérdida de calidad no medida en este adaptador.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 (24 GB) para bf16 con contexto moderado; equipos Apple Silicon con memoria unificada de 16 GB o más mediante llama.cpp.
- GPU de centro de datos: A100 de 40 o 80 GB y H100 para despliegue con lotes grandes y contexto largo; también L40S o similares.
- Opciones de despliegue: `transformers` con PEFT (cargando el adaptador o fusionándolo previamente), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama tras convertir los pesos fusionados a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xw17/gemma-3-4b-it_SFT_lora_ifhaffect` | Adaptador sobre 4B | No documentado (base: 128.000) | Heredado del base | No disponible | Repositorio sin mantenimiento aparente, 0 descargas |
| `google/gemma-3-4b-it` (base) | Aproximadamente 4B | 128.000 tokens | Sí (imagen y texto) | Términos de uso de Gemma | Ampliamente disponible y documentado |
| `meta-llama/Llama-3.2-3B-Instruct` | 3.200 millones | 128.000 tokens | No | Licencia comunitaria de Llama 3.2 | Ampliamente disponible |
| `Qwen/Qwen2.5-3B-Instruct` | 3.090 millones | 32.768 tokens nativos, ampliables con YaRN | No | Apache 2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento del adaptador que permitan compararlo cuantitativamente con estas alternativas. Como referencia estructural, el adaptador hereda la ventana de contexto y la capacidad multimodal del modelo base, pero pierde la simplicidad de licencia de las opciones Apache 2.0 y no ofrece garantías de calidad al no contar con evaluación publicada.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no documenta datos, hiperparámetros, licencia, idiomas ni uso previsto.
- No se declara licencia en el repositorio, lo que genera incertidumbre legal. Además, al derivar de Gemma 3, se heredan las restricciones de los términos de uso de Gemma, que no equivalen a una licencia de código abierto permisiva.
- Cero descargas y cero likes, con fechas de creación incoherentes: no hay señales de uso, revisión por la comunidad ni mantenimiento.
- No existe ninguna evaluación publicada; se desconoce si el ajuste mejora, degrada o mantiene las capacidades del modelo base en tareas generales.
- Riesgo de olvido catastrófico propio del ajuste supervisado: un SFT con un corpus pequeño y sesgado puede deteriorar la capacidad multilingüe y el razonamiento general del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamano, especialmente en tareas factuales y en contextos largos.
- Si la tarea es de clasificación afectiva, existe riesgo de sesgo cultural y lingüístico, y de interpretar de forma incorrecta ironía, sarcasmo o contextos mixtos.
- No se recomienda su uso en aplicaciones clínicas, de salud mental o de decisión automatizada sobre personas sin validación externa y supervisión humana.
- Para su uso real es necesario fusionar el adaptador con el modelo base o cargarlo mediante PEFT; el repositorio por sí solo no es ejecutable de forma directa con `pipeline` sin indicar el modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xw17/gemma-3-4b-it_SFT_lora_ifhaffect
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Informe técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Artículo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Librería PEFT, necesaria para cargar el adaptador: https://github.com/huggingface/peft
