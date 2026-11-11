# WorkOffline/gemma-4-12B-it-qat-q4_0-GGUF

## Resumen

`WorkOffline/gemma-4-12B-it-qat-q4_0-GGUF` es un espejo sin modificaciones de los ficheros GGUF cuantizados en 4 bits con Quantization-Aware Training (QAT) del modelo Gemma 4 12B Instruct, desarrollado originalmente por Google DeepMind. El repositorio no introduce ninguna variación sobre los pesos originales: se limita a alojar una copia byte a byte de los ficheros publicados por Google, fijada a una revisión concreta y verificada mediante SHA-256, con el objetivo de que la aplicación WorkOffline pueda descargarlos desde un único punto.

El modelo subyacente es un transformer denso de 11.907.350.576 parámetros (aproximadamente 12B), ajustado para instrucciones y con capacidades multimodales, a juzgar por la presencia del fichero de proyección multimodal `mmproj-gemma-4-12B-it-qat.gguf` en el repositorio. La cuantización Q4_0 aplicada durante el entrenamiento (QAT) reduce el peso del fichero principal a 6,98 GB, lo que lo hace viable en hardware de consumo con suficiente memoria unificada o VRAM.

La relevancia de este repositorio es logística más que técnica: ofrece una fuente estable y verificable para despliegues offline, algo crítico en entornos sin conectividad o con requisitos de reproducibilidad. No obstante, al no incluir la model card original de Google, la información sobre contexto, idiomas, benchmarks y detalles de entrenamiento no está disponible en este repositorio y debe consultarse en las fuentes upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles en el repositorio) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 con Quantization-Aware Training (QAT); fichero GGUF de 6.975.879.296 bytes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal + proyección multimodal `mmproj`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por los metadatos disponibles se sabe que se trata de un transformer denso de aproximadamente 12B parámetros, ajustado para instrucciones (`-it`) y con un componente multimodal separado en formato GGUF (`mmproj-gemma-4-12B-it-qat.gguf`, 175.115.616 bytes), lo que indica soporte de entrada visual. La cuantización Q4_0 se aplicó mediante Quantization-Aware Training, técnica en la que el modelo se entrena simulando la cuantización para minimizar la pérdida de calidad respecto al modelo en precisión completa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, arquitecturas híbridas) en la información proporcionada. Todos estos detalles deben consultarse en la model card original de `google/gemma-4-12B-it`.

## Capacidades

- Generación de texto conversacional: el sufijo `-it` indica ajuste para instrucciones y diálogo multi-turno.
- Procesamiento multimodal: la presencia del fichero `mmproj` sugiere capacidad de entrada de imágenes, aunque el repositorio no detalla el alcance exacto.
- Ejecución local offline: el formato GGUF y la cuantización Q4_0 permiten inferencia en CPU y GPU sin conexión.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que los ficheros pueden servirse mediante infraestructura compatible con la API de Hugging Face.
- Capacidades de razonamiento, código, matemáticas, tool calling y agentes: no documentadas en este repositorio; deben verificarse en la model card upstream.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de asistentes conversacionales en entornos air-gapped: el repositorio ofrece una fuente verificable con SHA-256 para descargar los pesos una vez y operar sin conectividad, algo habitual en entornos industriales, sanitarios o de defensa.
- Aplicaciones de escritorio con inferencia local: la aplicación WorkOffline usa estos ficheros como fuente canónica; cualquier desarrollador puede replicar el patrón para distribuir un asistente integrado en su producto sin depender de APIs externas.
- Reproducibilidad en investigación: al fijar la revisión upstream (`29d097773436b69ff9feafd636ab4cf873786537`) y publicar los hashes, se garantiza que los experimentos se ejecutan sobre exactamente los mismos pesos.
- Prototipado rápido con llama.cpp u Ollama: el formato GGUF Q4_0 se carga directamente en estos runners, permitiendo validar ideas en hardware de consumo antes de escalar a infraestructura mayor.
- Procesamiento de documentos con componente visual: el fichero `mmproj` habilita, si el runner lo soporta, tareas de descripción de imágenes o extracción de información de capturas y escaneos en local.
- Auditoría de cadena de suministro de modelos: equipos de seguridad pueden comparar los hashes publicados con los de Google para verificar que el espejo no ha sido manipulado antes de integrarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_0 ocupa 6,98 GB; se recomienda al menos 8 GB de VRAM o memoria unificada para cargar el modelo con margen para el contexto, y 10-12 GB para ventanas de contexto amplias.
- El fichero `mmproj` añade 175 MB adicionales cuando se activa la entrada multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100, H100. En GPUs con 8 GB puede funcionar con contexto reducido o descarga parcial de capas a CPU.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en 8 GB requiere offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habría que usar los pesos originales en safetensors para esos runners.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorkOffline/gemma-4-12B-it-qat-q4_0-GGUF | 11,9B | No disponible | Q4_0 (QAT) | Apache 2.0 | GGUF en HF |
| google/gemma-4-12B-it | 11,9B | No disponible | Completa (safetensors) | Apache 2.0 | HF |
| google/gemma-4-12B-it-qat-q4_0-gguf | 11,9B | No disponible | Q4_0 (QAT) | Apache 2.0 | GGUF en HF |

Las tres entradas corresponden al mismo modelo en distintos formatos o ubicaciones; no se dispone de información sobre modelos alternativos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo sin model card propia: no documenta sesgos, idiomas, contexto ni comportamiento del modelo. Cualquier evaluación de riesgos debe hacerse sobre la documentación de `google/gemma-4-12B-it`.
- La cuantización Q4_0, aunque mitigada por QAT, introduce pérdida de precisión respecto a los pesos completos; puede afectar a tareas sensibles como matemáticas o código.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte de que el fichero `LICENSE` es la plantilla estándar y que la licencia efectiva la declara la model card upstream; conviene verificar los términos en `ai.google.dev/gemma/docs/gemma_4_license`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la integridad más allá de los hashes publicados.
- Para despliegues en producción con vLLM o TGI será necesario recurrir a los pesos originales en safetensors, ya que estos runners no consumen GGUF de forma nativa.
- No se dispone de información sobre el soporte real de tool calling, agentes o multi-step reasoning; no debe asumirse por el sufijo `-it`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/gemma-4-12B-it-qat-q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- GGUF original de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
