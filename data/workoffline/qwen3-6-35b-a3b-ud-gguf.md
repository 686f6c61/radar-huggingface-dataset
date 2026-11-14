# WorkOffline/Qwen3.6-35B-A3B-UD-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Alibaba Qwen. El repositorio analizado, WorkOffline/Qwen3.6-35B-A3B-UD-GGUF, no es un modelo nuevo ni un ajuste fino: es un espejo sin modificaciones de los ficheros GGUF generados por Unsloth a partir del modelo original, empaquetados para que la aplicación WorkOffline pueda descargarlos desde un único punto con revisión fijada y verificación SHA-256.

La relevancia práctica de este repositorio es la distribución: ofrece una cuantización dinámica UD-IQ3_S de aproximadamente 13,68 GB junto con el proyector multimodal en F16 (unos 0,90 GB), lo que permite ejecutar un modelo MoE de 35B parámetros totales en hardware de consumo mediante llama.cpp y derivados. Los bytes son idénticos a los del repositorio de Unsloth; solo cambia, en su caso, el nombre del fichero.

No se dispone de información publicada en este repositorio sobre arquitectura interna detallada, composición del dataset de entrenamiento, número de tokens o resultados de benchmarks. Cualquier dato de ese tipo debe consultarse en la model card del modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según la model card del repositorio; detalles internos no disponibles |
| Parametros totales | 35B (según denominación del modelo); desglose no disponible |
| Parametros activos | A3B, aproximadamente 3B activos por token (según denominación); confirmación oficial no disponible en este repositorio |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ3_S (Unsloth Dynamic); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal de 13 676 723 168 bytes; mmproj de 899 283 680 bytes) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura más allá de indicar que el modelo base es de tipo mezcla de expertos. La denominación 35B-A3B sugiere 35 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, patrón habitual en la familia Qwen MoE, pero este repositorio no aporta confirmación técnica ni desglose de expertos, capas o dimensión oculta.

Tampoco se detalla el proceso de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación. La única información técnica verificable aquí es la conversión a GGUF: Unsloth Dynamic UD-IQ3_S, una cuantización de precisión mixta que asigna más bits a las capas sensibles y menos a las menos críticas, junto con un proyector multimodal separado en F16 (mmproj), lo que implica soporte de entrada de imágenes en el modelo original. Los ficheros están fijados a la revisión upstream a483e9e6cbd595906af30beda3187c2663a1118c y verificados por SHA-256.

## Capacidades

- Generación de texto y razonamiento: capacidades propias del modelo base Qwen3.6-35B-A3B; el repositorio no las enumera.
- Procesamiento multimodal de imágenes: la presencia del fichero mmproj-Qwen3.6-35B-A3B-F16.gguf indica soporte de entrada visual en el modelo original.
- Ejecución local offline: el repositorio está pensado para descarga y uso sin conexión desde la aplicación WorkOffline.
- Tool calling, function calling, modo thinking, agentes multi-paso, capacidades multilingües: no disponibles en la información de este repositorio; deben verificarse en la model card de Qwen/Qwen3.6-35B-A3B.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU de datacenter: la cuantización UD-IQ3_S de 13,68 GB permite cargar el modelo en equipos con 16-24 GB de VRAM o con memoria unificada, manteniendo el comportamiento MoE de activación reducida.
- Asistente de escritorio integrado en la aplicación WorkOffline: el repositorio existe precisamente para que la app descargue una revisión fijada y verifique el SHA-256 antes de ejecutar, lo que simplifica la distribución reproducible.
- Procesamiento de documentos con imágenes: el proyector mmproj en F16 habilita tareas de descripción de capturas, extracción de texto de imágenes o respuesta a preguntas sobre diagramas, siempre que el runtime GGUF soporte multimodal.
- Prototipado de pipelines RAG en local: al no requerir conexión ni API externa, es adecuado para entornos con requisitos de confidencialidad donde los datos no pueden salir del equipo.
- Evaluación comparativa de cuantizaciones: al ser un espejo verificable de los ficheros de Unsloth, sirve como referencia reproducible para medir la degradación de UD-IQ3_S frente a cuantizaciones mayores.
- Entornos aislados o air-gapped: la verificación por hash y la copia íntegra de los bytes permiten auditar la cadena de suministro del modelo antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero principal ocupa 13,68 GB; con overhead de contexto y caché KV, se recomienda un mínimo de 16 GB de VRAM o memoria unificada. El proyector multimodal añade unos 0,90 GB cuando se usa entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución cómoda con contexto amplio; A100 o H100 para despliegues con mayor concurrencia.
- GPU de consumo: cabe en tarjetas de 16 GB con contexto moderado; en 12 GB requeriría cuantizaciones más agresivas no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp); para multimodal, runtimes que acepten ficheros mmproj en GGUF.
- Latencia y throughput: no disponibles. Al ser MoE con aproximadamente 3B parámetros activos, el rendimiento por token debería aproximarse al de un modelo denso de ese tamaño, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WorkOffline/Qwen3.6-35B-A3B-UD-GGUF | 35B totales, ~3B activos | no disponible | Apache 2.0 | GGUF UD-IQ3_S | Espejo verificado de Unsloth; incluye mmproj multimodal |
| Qwen/Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | Apache 2.0 | safetensors (original) | Modelo base oficial; requiere conversión para uso local |
| unsloth/Qwen3.6-35B-A3B-GGUF | 35B totales, ~3B activos | no disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Fuente upstream de los ficheros; ofrece más opciones de cuantización |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado por WorkOffline: es una copia byte a byte de los ficheros de Unsloth. Cualquier defecto, sesgo o limitación del modelo original se hereda sin cambios.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad en este repositorio; deben consultarse en la model card de Qwen.
- La cuantización UD-IQ3_S es agresiva (aproximadamente 3 bits efectivos con precisión mixta); puede degradar el rendimiento en tareas de razonamiento matemático o generación de código frente a cuantizaciones de 4-8 bits.
- El soporte multimodal depende de que el runtime cargue correctamente el fichero mmproj; no todos los frontends GGUF lo hacen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original de Qwen por si existen términos adicionales de uso aceptable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de funcionamiento en producción.
- La fecha de creación indicada (2026-11-13) debe tomarse como dato del repositorio; no se ha verificado de forma independiente.

## Enlaces

- Repositorio analizado: https://huggingface.co/WorkOffline/Qwen3.6-35B-A3B-UD-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF upstream de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Fichero de licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/345d467b117d1fd5eda9b879a5988de9ae5f47a7/LICENSE
