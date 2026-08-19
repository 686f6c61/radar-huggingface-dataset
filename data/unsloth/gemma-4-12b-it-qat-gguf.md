# unsloth/gemma-4-12B-it-qat-GGUF

## Resumen

El modelo `unsloth/gemma-4-12B-it-qat-GGUF` es una versión cuantizada con Quantization-Aware Training (QAT) del modelo Gemma 4 12B de Google DeepMind, preparada por Unsloth para su despliegue eficiente en formato GGUF. Gemma 4 es una familia de modelos abiertos multimodales que procesan texto, imagen y audio (este último soportado en las variantes E2B, E4B y 12B) y generan texto. Esta versión QAT conserva una calidad cercana a bfloat16 mientras reduce drásticamente los requisitos de memoria, lo que permite ejecutar el modelo en GPUs de consumo.

El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, y Unsloth ha generado múltiples cuantizaciones GGUF, incluyendo su formato dinámico UD-Q4_K_XL. Incluye además un drafter MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la inferencia sin cambiar la salida. Con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, este modelo es relevante para tareas de razonamiento, generación de código y análisis multimodal en entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen, audio) |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | Hasta 256K tokens (segun documentacion de la familia Gemma 4) |
| Tipos de cuantizacion | GGUF Q4_0, UD-Q4_K_XL (Unsloth Dynamic 2.0), y otras variantes del repo |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

Gemma 4 12B es un modelo denso basado en transformer, optimizado mediante Quantization-Aware Training (QAT). El proceso QAT entrena el modelo teniendo en cuenta la cuantizacion desde el inicio, lo que permite que los pesos cuantizados a 4 bits (Q4_0) mantengan una calidad muy proxima a la version bfloat16. Esto reduce significativamente la memoria necesaria para cargar el modelo en comparacion con una cuantizacion post-entrenamiento clasica.

El modelo incorpora un drafter MTP (Multi-Token Prediction) en el repositorio (`mtp-gemma-4-12B-it.gguf`), un drafter de cuantizacion Q4_0 casi sin perdidas que permite decodificacion especulativa. El drafter comparte la cache KV del modelo principal y el modelo objetivo verifica cada token generado, por lo que la salida no cambia respecto a la generacion sin MTP. Esta tecnica acelera la inferencia en hardware compatible con llama.cpp.

El modelo es multimodal: acepta entradas de texto, imagen (con resolucion y relacion de aspecto variables) y audio (en la variante 12B), y genera texto. Incluye modos de razonamiento configurables ("thinking modes") que permiten ajustar el nivel de razonamiento interno segun la tarea.

## Capacidades

- Generacion de texto, razonamiento y codigo con calidad cercana a bfloat16 gracias al entrenamiento QAT.
- Entrada multimodal: texto, imagen y audio (audio soportado en la variante 12B).
- Soporte de tool calling / function calling, como se muestra en el ejemplo de Unsloth Studio.
- Capacidad de agentes y razonamiento multi-paso con modos de pensamiento configurables.
- Multilingue en mas de 140 idiomas.
- Decodificacion especulativa MTP integrada para acelerar la inferencia sin alterar la salida.
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, vLLM (via conversion) y Unsloth Studio.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar consultas de texto, imagenes (capturas de pantalla, documentos escaneados) y audio (mensajes de voz) en un mismo hilo conversacional, gracias a su ventana de contexto de hasta 256K tokens que permite mantener historiales largos.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, ejecutandose localmente con cuantizacion Q4 para minimizar costes de infraestructura.
- Analisis de documentos e imagenes: extraccion de informacion de facturas, formularios o diagramas tecnicos, combinando la entrada visual con instrucciones de texto en mas de 140 idiomas.
- Asistentes de voz locales: al aceptar audio como entrada, puede transcribir y responder a comandos de voz en tiempo real en dispositivos con GPU de consumo, sin depender de APIs externas.
- Razonamiento complejo con thinking mode: para tareas de planificacion, logica o resolucion de problemas matematicos, activando el modo de pensamiento configurable para obtener respuestas mas elaboradas.
- Despliegue en entornos con restricciones de memoria: gracias a la cuantizacion QAT Q4_0, el modelo de 12B cabe en GPUs de 12-16 GB, permitiendo inferencia local en estaciones de trabajo o servidores de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Unsloth menciona que la cuantizacion QAT preserva una calidad similar a bfloat16, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandar. Se recomienda consultar la documentacion oficial de Gemma 4 de Google DeepMind para datos de rendimiento del modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_XL, el modelo de 12B en 4 bits ocupa aproximadamente 7-8 GB de pesos, mas la cache KV. Se estima un uso total de 10-12 GB para contexto largo. (Estimacion basada en el tamano del modelo y la cuantizacion; no hay datos oficiales de Unsloth).
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para comodidad; RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) son suficientes con cuantizacion Q4. En GPUs de 12 GB (RTX 4070, 3060) puede ejecutarse con cuantizaciones mas agresivas o contexto reducido.
- Si cabe en consumer GPU: si, en GPUs de 12 GB o mas con cuantizacion Q4.
- Opciones de despliegue: llama.cpp (con soporte MTP), Ollama, Unsloth Studio, y vLLM mediante conversion a compressed-tensors (formato w4a16 disponible para la version QAT).
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede acelerar la generacion entre 1.5x y 3x en hardware compatible, segun la documentacion de Unsloth, pero no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| unsloth/gemma-4-12B-it-qat-GGUF | 12B | Hasta 256K | Texto, imagen, audio | Apache 2.0 | GGUF |
| google/gemma-4-12B-it-qat-q4_0-gguf | 12B | Hasta 256K | Texto, imagen, audio | Apache 2.0 | GGUF |
| unsloth/gemma-4-12b-it-GGUF (sin QAT) | 12B | Hasta 256K | Texto, imagen, audio | Apache 2.0 | GGUF |

La diferencia principal entre la version QAT de Unsloth y la version oficial de Google es que Unsloth anade el drafter MTP y sus cuantizaciones dinamicas UD, ademas de un proceso de cuantizacion optimizado. La version sin QAT de Unsloth (gemma-4-12b-it-GGUF) no incluye el entrenamiento QAT, por lo que puede requerir mas memoria para la misma calidad. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones especificas de sesgo para esta variante QAT. Como modelo entrenado por Google DeepMind, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones criticas, especialmente en tareas de codigo o analisis de documentos.
- Limitaciones de contexto: aunque la ventana es de hasta 256K tokens, el rendimiento puede degradarse con contextos muy largos; se recomienda probar con la carga de trabajo real.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe revisar el texto completo de la licencia de Gemma 4 en el enlace proporcionado.
- Requisitos de hardware: aunque la cuantizacion Q4 reduce memoria, el modelo sigue siendo de 12B; en GPUs de menos de 12 GB puede ser necesario reducir contexto o usar cuantizaciones mas agresivas, con posible perdida de calidad.
- El drafter MTP requiere una version reciente de llama.cpp que soporte `--spec-type draft-mtp`; en otras herramientas puede no estar disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Guia de Unsloth para Gemma 4 QAT: https://unsloth.ai/docs/models/gemma-4/qat
- Documentacion de Gemma 4 de Unsloth: https://unsloth.ai/docs/models/gemma-4
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Coleccion de Gemma 4 QAT de Unsloth: https://huggingface.co/collections/unsloth/gemma-4-qat
