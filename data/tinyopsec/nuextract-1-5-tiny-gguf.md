# tinyopsec/NuExtract-1.5-tiny-GGUF

## Resumen

NuExtract-1.5-tiny-GGUF es la versión cuantizada en formato GGUF del modelo numind/NuExtract-1.5-tiny, un ajuste fino de Qwen2.5-0.5B especializado en extracción de información estructurada. Lo publica el usuario tinyopsec en Hugging Face con licencia MIT y está pensado para su uso con llama.cpp y otros runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp). El modelo base es un transformer decoder-only de la familia Qwen2.5 con 494.032.768 parámetros totales, lo que lo sitúa en la categoría de modelos ultraligeros.

El problema que resuelve es concreto: convertir texto libre en salidas JSON estructuradas siguiendo un esquema definido por el usuario (extracción de entidades, campos, relaciones). Al ser un modelo de 0,5B parámetros, su interés radica en que puede ejecutarse en hardware muy modesto, incluso en CPU, con latencias bajas y sin necesidad de GPU dedicada, lo que lo hace atractivo para pipelines de extracción a gran escala o despliegues en el borde.

La versión GGUF incluye 13 ficheros de cuantización, desde F16 (1,0 GB) hasta Q2_K, con Q4_K_M marcada como recomendada por el autor. El repositorio ocupa 5,8 GB en total. La model card no proporciona información sobre longitud de contexto, idiomas soportados ni datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar. La model card del repositorio GGUF no detalla la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO; únicamente indica que el modelo base es numind/NuExtract-1.5-tiny y que la especialización es la extracción de información estructurada. No se dispone de información sobre el número de tokens de entrenamiento ni sobre innovaciones técnicas específicas del ajuste.

La aportación de este repositorio es la cuantización mediante llama.cpp, que genera versiones de 2 a 16 bits del modelo original. El proceso de cuantización es el estándar de llama.cpp (bloques K-quant para Q2_K a Q6_K y cuantización lineal para Q8_0, Q5_0 y Q4_0). No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de información estructurada: genera salidas JSON a partir de texto libre siguiendo un esquema proporcionado en el prompt.
- Generación de texto conversacional: la pipeline declarada es text-generation y el tag conversational está presente en el repositorio.
- Salida estructurada: el tag structured-output indica que el modelo está optimizado para producir JSON válido.
- Compatibilidad con llama.cpp: puede ejecutarse con llama-cli, llama-server y runtimes derivados.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere integración con servicios de inferencia estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio o thinking mode: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Extracción de campos de facturas y recibos: se define un esquema JSON con campos como fecha, importe, emisor y concepto, y el modelo transforma el texto OCR en JSON estructurado. Su tamaño de 0,5B permite procesar lotes grandes en CPU con coste mínimo.
- Procesamiento de correos de soporte: extracción de entidad, producto, categoría de incidencia y urgencia a partir del cuerpo del correo, alimentando un sistema de ticketing. La cuantización Q4_K_M reduce el modelo a unos pocos cientos de MB, lo que permite desplegarlo junto al servicio de correo.
- Enriquecimiento de datos tabulares desde texto: conversión de descripciones de producto, reseñas o notas libres en columnas estructuradas para un data warehouse, ejecutando el modelo en un contenedor sin GPU.
- Extracción de entidades en documentos legales: identificación de partes, fechas, cláusulas y referencias normativas en contratos, con salida JSON validable contra un esquema y posterior revisión humana.
- Preprocesado en pipelines RAG: normalización de metadatos (autor, fecha, tema) de documentos antes de indexarlos en una base vectorial, usando el modelo como paso de extracción previo al embedding.
- Despliegue en el borde o en dispositivos sin GPU: al caber en cuantizaciones de 2 a 4 bits en unos pocos cientos de MB de RAM, puede ejecutarse en portátiles, Raspberry Pi o contenedores ligeros para extracción local de datos sensibles sin enviar texto a la nube.
- Clasificación y etiquetado por esquema: definición de un esquema con categorías cerradas para convertir texto libre en etiquetas estructuradas, útil en moderación de contenido o triaje de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: F16 aproximadamente 1,0 GB; Q8_0 en torno a 0,5-0,6 GB; Q6_K aproximadamente 0,45 GB; Q5_K_M y Q5_K_S en torno a 0,4 GB; Q4_K_M y Q4_K_S en torno a 0,3-0,35 GB; Q3_K en torno a 0,25-0,3 GB; Q2_K en torno a 0,2 GB. Estas cifras son estimaciones a partir del tamaño de los ficheros indicados en la model card y del número de parámetros; no están publicadas como medidas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100. No requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas, e incluso en iGPU con memoria unificada.
- Cabe en CPU: sí; con cuantización Q4_K_M o inferior puede ejecutarse en CPU con rendimiento aceptable para extracción por lotes.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Especialización |
|---|---|---|---|---|---|
| NuExtract-1.5-tiny-GGUF (este) | 494 M | no disponible | GGUF | MIT | Extracción estructurada |
| numind/NuExtract-1.5-tiny (base) | 494 M | no disponible | safetensors | MIT | Extracción estructurada |
| Qwen2.5-0.5B (modelo de partida) | 494 M | no disponible | safetensors, GGUF | Apache 2.0 (según el modelo original) | Generación de texto general |
| NuExtract-1.5 (versión mayor del mismo autor) | no disponible | no disponible | no disponible | no disponible | Extracción estructurada |

La comparación con alternativas de otros autores no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato GGUF y la disponibilidad de 13 cuantizaciones; frente a Qwen2.5-0.5B, el ajuste fino orientado a extracción estructurada y la licencia MIT son los elementos diferenciales documentados.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: la capacidad de razonamiento y de generalización es limitada en comparación con modelos de mayor tamaño; puede fallar en esquemas complejos o textos ambiguos.
- Riesgo de alucinación: como todo modelo generativo, puede inventar valores de campos que no aparecen en el texto de entrada; se recomienda validación contra el esquema y revisión en dominios críticos.
- Salida JSON no garantizada al 100 %: aunque está especializado en structured-output, no se documenta un modo de gramática forzada; conviene usar constrained decoding en el runtime (por ejemplo, GBNF en llama.cpp) para asegurar JSON válido.
- Idiomas soportados no documentados: no hay información sobre el rendimiento en castellano u otros idiomas; el modelo base Qwen2.5 tiene cobertura multilingüe, pero el ajuste fino puede haber reducido su alcance.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos largos sin verificación empírica.
- Licencia MIT: permite uso comercial y modificación, pero el aviso del autor indica que es un modelo de extracción estructurada y que debe evaluarse antes de su uso en producción.
- Ausencia de benchmarks: no hay métricas publicadas de precisión, latencia ni throughput, por lo que la evaluación debe hacerse con un conjunto de validación propio.
- Cuantizaciones de 2 y 3 bits: pueden degradar la calidad de la salida estructurada; el autor recomienda Q4_K_M como equilibrio entre tamaño y fidelidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/NuExtract-1.5-tiny-GGUF
- Modelo base: https://huggingface.co/numind/NuExtract-1.5-tiny
- Modelo de partida original: https://huggingface.co/Qwen/Qwen2.5-0.5B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
