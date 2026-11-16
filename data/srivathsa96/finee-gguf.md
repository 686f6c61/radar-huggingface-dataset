# srivathsa96/finee-gguf

## Resumen

finee-gguf es una versión cuantizada en formato GGUF del modelo gpt-oss-20b, publicada por el usuario srivathsa96 en Hugging Face. El modelo ha sido ajustado finamente (fine-tuning) y posteriormente convertido a GGUF mediante la herramienta Unsloth, lo que lo hace desplegable en llama.cpp y compatible con entornos de inferencia local. El repositorio contiene un único archivo de pesos en cuantización MXFP4 (`gpt-oss-20b.MXFP4.gguf`) y un Modelfile para Ollama.

El modelo base es gpt-oss-20b, un transformer de aproximadamente 20.900 millones de parámetros (20.914.757.184 según los safetensors del repo). La etiqueta `gpt_oss` en los metadatos confirma la arquitectura de origen, y el tag `conversational` indica que está orientado a casos de uso de diálogo. El tamaño del repositorio es de 13,8 GB, coherente con una cuantización MXFP4 de un modelo de ~21B parámetros.

La relevancia de esta ficha radica en que se trata de una publicación de terceros con escasa documentación: no hay model card detallada, no se especifican datos de entrenamiento, licencia ni idiomas, y no se han publicado benchmarks. Cualquier evaluación en producción debe partir de la validación empírica propia y de la consulta a la documentación del modelo base gpt-oss-20b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia gpt_oss, según tags) |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como referencia de parámetros) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de la familia gpt_oss, es decir, un transformer de aproximadamente 20,9B parámetros, ajustado finamente y convertido a GGUF con Unsloth. No se especifican en la model card ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se detalla si el fine-tuning fue supervisado, con qué datos o con qué objetivo concreto (el nombre "finee" no aporta información adicional verificable).

La única innovación técnica documentada es el proceso de conversión y cuantización a MXFP4 mediante Unsloth, que permite reducir el peso del modelo a 13,8 GB y desplegarlo en llama.cpp. No hay información sobre decodificación especulativa, atención lineal u otras optimizaciones de arquitectura. El uso de `--jinja` en los comandos de ejemplo sugiere soporte de plantillas de chat Jinja para formateo de conversaciones.

## Capacidades

- Generación de texto conversacional (tag `conversational` en los metadatos).
- Compatibilidad con llama.cpp mediante `llama-cli` y `llama-mtmd-cli` (este último para modelos multimodales, aunque no se confirma que este modelo lo sea).
- Soporte de plantillas de chat Jinja mediante el flag `--jinja`.
- Despliegue en Ollama mediante el Modelfile incluido.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades específicas de tool calling, agentes, matemáticas, código, visión o audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue local de un asistente conversacional: el archivo GGUF MXFP4 permite ejecutar el modelo en llama.cpp u Ollama en hardware de gama alta de consumo, sin necesidad de infraestructura en la nube.
- Prototipado rápido de aplicaciones de chat: el Modelfile de Ollama incluido facilita levantar un endpoint conversacional en minutos para pruebas de concepto.
- Evaluación de fine-tunes de la familia gpt-oss: útil para investigadores que quieran comparar el comportamiento de este ajuste frente al modelo base en tareas de diálogo.
- Integración en pipelines con llama.cpp: el formato GGUF y el flag `--jinja` permiten incorporar el modelo en scripts de generación por lotes con plantillas de chat personalizadas.
- Inferencia en entornos con recursos limitados: la cuantización MXFP4 reduce el peso a 13,8 GB, lo que posibilita su ejecución en GPUs con 16-24 GB de VRAM.
- Base para experimentación con cuantizaciones alternativas: al ser un GGUF, puede servir como punto de partida para comparar MXFP4 frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo MXFP4 pesa 13,8 GB, por lo que se necesitan al menos ~14-16 GB de VRAM para cargarlo completo en GPU; con offloading a CPU puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 3090); en tarjetas de 12 GB requeriría offloading parcial.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (Modelfile incluido). No se documenta soporte explícito para vLLM o TGI con este archivo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finee-gguf (este modelo) | ~20,9B | no disponible | MXFP4 (GGUF) | no disponible | Hugging Face |
| gpt-oss-20b (base) | ~20,9B | no disponible | safetensors / otras | no disponible | Hugging Face |
| Alternativas de ~20B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas; se recomienda consultar la documentación del modelo base gpt-oss-20b para obtener datos de referencia.

## Limitaciones y advertencias

- La model card es mínima: no se documentan datos de entrenamiento, composición del dataset ni metodología del fine-tuning, lo que impide evaluar sesgos introducidos por el ajuste.
- No se especifica la licencia, por lo que el uso comercial es incierto y requiere consulta previa al autor y al modelo base.
- No se declaran los idiomas soportados; el rendimiento multilingüe es desconocido.
- No hay benchmarks publicados: el rendimiento real debe validarse empíricamente antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación documentada del fine-tuning.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.
- Solo se publica una cuantización (MXFP4); no hay alternativas de mayor o menor precisión para ajustar el equilibrio calidad/recursos.
- Al ser una conversión de terceros, no hay garantía de que el proceso de cuantización haya preservado fielmente el comportamiento del modelo ajustado.

## Enlaces

- Hugging Face: https://huggingface.co/srivathsa96/finee-gguf
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
