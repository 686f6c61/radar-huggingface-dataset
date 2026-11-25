# William-WSDS/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario William-WSDS para su uso en embraOS, un sistema operativo que integra llama.cpp de forma nativa. No se trata de un modelo nuevo ni de un ajuste fino: es una cuantización Q4_K_M del modelo original de Qwen, con el proyector de visión convertido a F16, sin cambios en los pesos más allá de la cuantización ni en la plantilla de chat. El repositorio incluye dos ficheros: el modelo cuantizado (17,0 GB) y el proyector multimodal (927 MB).

El modelo base es un transformer multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) con capacidad image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. La ventana de contexto declarada en el GGUF es de 262.144 tokens, coincidiendo con la longitud para la que fue entrenado el modelo original. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es doble: por un lado, ofrece una vía práctica de ejecutar un modelo multimodal de ~27B en hardware local mediante llama.cpp; por otro, documenta con precisión el proceso de conversión, los hashes SHA-256 de cada fichero y las decisiones técnicas tomadas (por ejemplo, el uso de F16 en lugar de BF16 para el proyector por motivos de rendimiento en Arm). Es un artefacto de despliegue, no una contribución algorítmica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); el GGUF incluye bloque de predicción multi-token `qwen35.nextn_predict_layers = 1` y proyector de visión `qwen3vl_merger` |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo); F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero principal `Qwen3.8-27B-Q4_K_M.gguf` y `mmproj-Qwen3.8-27B-F16.gguf` |

Detalle de los ficheros:

| Fichero | Contenido | Bytes | SHA-256 |
|---|---|---|---|
| `Qwen3.8-27B-Q4_K_M.gguf` | Modelo cuantizado Q4_K_M, 770 tensores (343 Q4_K, 67 Q6_K, 360 F32) | 17.005.351.136 | `4fc2219c0f0335e04b92ea446ce9f9cb6584370ac35cc751e340829bdebffa80` |
| `mmproj-Qwen3.8-27B-F16.gguf` | Proyector multimodal F16, 334 tensores (112 F16, 222 F32) | 927.607.008 | `cb0a71fe9b84af2552fc6260acf8e9773a29d115c683aba01c72a7ac537b212b` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de lo que revela el proceso de conversión: es un transformer multimodal con un proyector de visión de tipo `qwen3vl_merger`, lo que lo sitúa en la familia de modelos de visión-lenguaje de Qwen. El GGUF incluye además un bloque de predicción de varios tokens a la vez (`qwen35.nextn_predict_layers = 1`, 251 MiB del fichero), presumiblemente para decodificación especulativa o predicción multi-token; llama.cpp 1.0.0 no lo utiliza y lo señala al cargar el modelo con el aviso "model has unused tensor".

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. Lo que sí está documentado es el procedimiento de conversión: se descargaron todos los ficheros de pesos de la revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0` de Qwen/Qwen3.8-27B verificando su SHA-256, se convirtió a BF16 con `convert_hf_to_gguf.py`, se cuantizó a Q4_K_M con `llama-quantize` y se generó el proyector en F16 con la opción `--mmproj`. La elección de F16 en lugar de BF16 para el proyector responde a que llama.cpp 1.0.0 solo tiene código vectorizado para BF16 en x86, mientras que para F16 lo tiene en Arm y x86; con BF16, codificar una imagen tardaba entre 11 y 14 minutos en cuatro núcleos de Apple Silicon. El coste de precisión es mínimo: 166.773 de los 460.730.096 valores del proyector (0,04 %) difieren entre ambos formatos, con una diferencia máxima de 3e-8.

## Capacidades

- Generación de texto conversacional a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Comprensión de imágenes mediante el proyector multimodal incluido; llama.cpp 1.0.0 procesa imágenes pero no vídeo.
- Procesamiento de contexto largo: hasta 262.144 tokens, según la longitud de entrenamiento del modelo base.
- Modo de razonamiento ("thinking switch") heredado de la model card de Qwen, configurable en el servidor llama.cpp según las indicaciones del modelo original.
- Muestreo configurable según la model card de Qwen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades de audio: no disponibles; el pipeline declarado es únicamente image-text-to-text.

## Casos de uso

- Asistente local con comprensión de imágenes: el modelo puede responder preguntas sobre capturas de pantalla, documentos escaneados o fotografías en una máquina propia, usando el fichero `mmproj` para codificar la imagen y el modelo Q4_K_M para generar la respuesta. Es adecuado porque todo el pipeline cabe en ~18 GB de disco y se ejecuta con llama.cpp sin dependencias de servicios en la nube.
- Procesamiento de documentos con contexto largo: gracias a los 262.144 tokens de ventana, se pueden introducir transcripciones extensas o múltiples páginas de texto junto con sus imágenes asociadas en una sola petición, útil para resumen y extracción de datos.
- Despliegue en entornos con requisitos de soberanía del dato: al ser un modelo Apache-2.0 ejecutable en local, encaja en organizaciones que no pueden enviar imágenes o texto a APIs externas; embraOS lo integra como modelo nativo servido por el llama.cpp incluido en la imagen del sistema.
- Integración en aplicaciones de escritorio o sistemas operativos: el formato GGUF y la compatibilidad con `llama-server` permiten incrustar el modelo en aplicaciones nativas; el propio repositorio está pensado para que embraOS lo descargue y lo fije por hash SHA-256.
- Análisis de imágenes en lote con requisitos moderados de hardware: con cuantización Q4_K_M, el modelo ocupa ~17 GB, lo que permite ejecutarlo en estaciones de trabajo con GPU de 24 GB o en servidores con CPU y suficiente RAM; útil para tareas de clasificación o descripción de imágenes por lotes.
- Prototipado e investigación en visión-lenguaje: al ser una conversión fiel y verificable del modelo original (hashes publicados, sin fine-tuning), sirve como referencia reproducible para comparar el comportamiento del modelo en GGUF frente a los pesos originales en safetensors.
- Base para evaluación de cuantizaciones: el repositorio documenta el proceso exacto y las diferencias de precisión del proyector, lo que lo hace útil como punto de partida para estudiar el impacto de Q4_K_M en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero del modelo ocupa 17.005.351.136 bytes (~15,8 GiB) y el proyector 927.607.008 bytes (~885 MiB); en total, algo menos de 17 GiB solo en pesos, a los que hay que sumar la caché KV para el contexto utilizado (que crece con la ventana; a 262.144 tokens puede ser muy exigente).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB (por ejemplo, RTX 4090 o A10G) podría alojar los pesos, pero el contexto completo requeriría más memoria o técnicas de offloading.
- ¿Cabe en GPU de consumo? Los pesos (~17 GiB) caben en GPUs de consumo de 24 GB, pero no en tarjetas de 16 GB o menos sin offloading a RAM.
- Opciones de despliegue: llama.cpp (versión 1.0.0, la usada para la conversión y validada por el autor) mediante `llama-server` con `--mmproj`; el repositorio está etiquetado con `endpoints_compatible`. Otras herramientas (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Comando de referencia indicado por el autor: `llama-server -m Qwen3.8-27B-Q4_K_M.gguf --mmproj mmproj-Qwen3.8-27B-F16.gguf --image-min-tokens 1024 --image-max-tokens 1024`.
- Latencia y throughput: no disponibles. El único dato de rendimiento publicado es que la codificación de una imagen con el proyector en BF16 tardaba entre 11 y 14 minutos en cuatro núcleos de Apple Silicon, motivo por el que se cambió a F16; no se da la cifra correspondiente en F16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-GGUF (este) | ~27,3B | 262.144 | image-text-to-text | Apache-2.0 | GGUF Q4_K_M + mmproj F16 | Cuantización de Qwen3.8-27B para llama.cpp/embraOS |
| Qwen/Qwen3.8-27B (original) | ~27,3B | 262.144 | image-text-to-text | Apache-2.0 | safetensors (BF16) | Modelo base sin cuantizar; requiere más memoria |
| Otros modelos de ~27B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks ni sobre modelos alternativos de la misma categoría en la documentación consultada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es una cuantización Q4_K_M: la pérdida de precisión frente al modelo original en BF16 no se ha cuantificado en benchmarks; el autor solo documenta la diferencia del proyector (0,04 % de valores, hasta 3e-8).
- El bloque de predicción multi-token (`qwen35.nextn_predict_layers = 1`) está presente en el fichero pero llama.cpp 1.0.0 no lo usa; no se aprovecha esa capacidad.
- El proyector se distribuye en F16 en lugar de BF16 para evitar un rendimiento muy bajo en Arm; esto introduce una diferencia mínima pero real respecto a los pesos originales.
- llama.cpp 1.0.0 procesa imágenes pero no vídeo con este proyector.
- El servidor exige un mínimo de 1.024 tokens por imagen (`--image-min-tokens 1024`); embraOS fija exactamente ese valor, lo que limita la resolución efectiva del procesamiento visual.
- Idiomas soportados no declarados en el repositorio; no se puede garantizar un rendimiento multilingüe concreto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse contra el modelo base.
- Ventana de contexto de 262.144 tokens: usarla completa exige una caché KV muy grande, con requisitos de memoria que pueden exceder el hardware de consumo.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio no incluye garantías ni evaluación de seguridad; el autor solo declara que no se modificó el modelo más allá de la conversión y cuantización.
- El repositorio tiene un mantenimiento aparentemente mínimo (0 likes, 133 descargas, publicado en noviembre de 2026) y está orientado a un sistema operativo concreto (embraOS); su uso fuera de ese contexto no está validado por el autor.
- La model card no incluye información sobre tool calling, agentes ni modo thinking más allá de remitir a la model card de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/William-WSDS/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- embraOS: https://github.com/Ward-Software-Defined-Systems/embraOS
- Revisión del modelo base usada en la conversión: `37561816e66b5b9153b1b64c10968c18c1e6f4a0`
- Revisión histórica con el proyector en BF16: `930332595f8f72f27ce2bd9ae5dfc7aea4e877da`
