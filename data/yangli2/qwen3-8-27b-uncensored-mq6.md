# yangli2/Qwen3.8-27B-Uncensored-mq6

## Resumen

El modelo `yangli2/Qwen3.8-27B-Uncensored-mq6` es una variante "uncensored" (abliterated) del modelo Qwen3.8-27B desarrollado por el equipo Qwen de Alibaba. Se distribuye en formato GGUF cuantizado, lo que permite su ejecución local en hardware de consumo sin necesidad de servicios en la nube. La versión abliterated elimina los mecanismos de rechazo (refusal) del modelo original, ofreciendo respuestas sin filtros de seguridad predefinidos.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), diseñado como modelo nativo de visión-lenguaje. Incluye capacidades de razonamiento, tool-calling y un cabezal de decodificación especulativa (MTP). Esta variante concreta, identificada con el sufijo `mq6`, corresponde probablemente a una cuantización mixta de 6 bits, aunque no se especifica explícitamente en la información disponible.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las capacidades técnicas avanzadas del Qwen3.8-27B (multimodalidad, razonamiento, agentes) y, por otro, al ser abliterated, permite explorar comportamientos del modelo sin las restricciones habituales de seguridad, lo que resulta de interés para investigación en alineación y seguridad de IA, así como para aplicaciones que requieren respuestas sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention (Gated DeltaNet linear + full attention) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de 2 a 8 bits (el tag `mq6` sugiere cuantizacion mixta de 6 bits) |
| Idiomas soportados | No disponible (el modelo base Qwen suele ser multilingue, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa con atención híbrida: combina una capa de atención lineal basada en Gated DeltaNet con capas de atención completa (full attention). Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Además, incorpora un cabezal de decodificación especulativa (MTP, Multi-Token Prediction) que acelera la generación al predecir varios tokens a la vez.

El modelo es nativamente multimodal, con un proyector de visión (mmproj) integrado que permite procesar imágenes junto con texto. No se dispone de detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de alineación del modelo original. La variante `Uncensored` se obtiene mediante una técnica de "abliteration" que elimina los pesos responsables de los comportamientos de rechazo, sin modificar el resto de capacidades. El autor de esta variante no ha publicado información adicional sobre el proceso de cuantización ni sobre el entrenamiento específico.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Comprensión y generación de código en múltiples lenguajes de programación.
- Procesamiento de imágenes (visión) gracias al proyector multimodal integrado.
- Soporte de tool calling / function calling, lo que permite integrarse con APIs y herramientas externas.
- Capacidad para flujos de trabajo agénticos (multi-step reasoning) y automatización de tareas.
- Decodificación especulativa (MTP) para mejorar la velocidad de generación.
- Al ser una versión abliterated, no presenta filtros de rechazo ante solicitudes controvertidas o sensibles (aunque esto conlleva riesgos, ver Limitaciones).

## Casos de uso

- Desarrollo de agentes locales de automatización: el modelo puede orquestar múltiples pasos, llamar a herramientas y procesar información visual, lo que lo hace adecuado para asistentes personales que gestionan tareas como envío de correos, búsqueda de información o control de aplicaciones.
- Generación de código en entornos de desarrollo integrado: su capacidad de tool calling y razonamiento permite usarlo como asistente de programación que sugiere implementaciones, depura errores y genera tests unitarios, integrándose en pipelines de CI/CD.
- Análisis de documentos con contenido visual: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o formularios escaneados, útil en tareas de ofimática y gestión documental.
- Investigación en seguridad y alineación de IA: al carecer de filtros de rechazo, permite estudiar el comportamiento del modelo ante instrucciones maliciosas o sesgadas, lo que ayuda a desarrollar mejores mecanismos de seguridad.
- Prototipado rápido de aplicaciones de chat sin restricciones de contenido: para entornos controlados donde se requiere explorar respuestas creativas o no convencionales, como generación de narrativa o brainstorming.
- Despliegue en hardware local con privacidad: al ser un GGUF cuantizado, puede ejecutarse en una estación de trabajo sin conexión a internet, garantizando que los datos no salgan del dispositivo, útil en sectores con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas para esta variante concreta. El modelo base Qwen3.8-27B podría tener resultados publicados por Alibaba, pero no se incluyen en la documentación de esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización de 4 bits, se requieren aproximadamente 14-16 GB de VRAM; para 6 bits, unos 20-22 GB; para 8 bits, cerca de 28-30 GB. Estos valores son orientativos y dependen de la longitud del contexto y del lote.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar cuantizaciones de 4-6 bits con comodidad. Para cuantizaciones de 8 bits se recomienda una GPU profesional como A100 (40/80 GB) o H100.
- En GPUs de consumo con 16 GB (como RTX 4080) se puede usar cuantización de 4 bits, aunque con limitaciones de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no es el caso estándar.
- Latencia y throughput: no se dispone de mediciones específicas. En una RTX 4090 con cuantización de 6 bits, se puede esperar una generación de 20-40 tokens por segundo, dependiendo del contexto y del uso de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otras variantes abliterated o con el modelo base Qwen3.8-27B. A continuación se presenta una comparación cualitativa basada en la información disponible:

| Modelo | Parametros | Contexto | Multimodal | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Si | Si | Apache 2.0 | Original (safetensors) |
| Qwen3.8-27B-Uncensored (esta variante) | 27B | No disponible | Si | Si | Apache 2.0 | GGUF |
| Llama 3.1 8B (referencia) | 8B | 128K | No | Si | Llama 3.1 | Varios |

La comparación con Llama 3.1 8B es solo orientativa por tamaño; Qwen3.8-27B es significativamente mayor y añade capacidades multimodales. No se dispone de datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo no tiene filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso si se le solicita. Su uso debe restringirse a entornos de investigación controlados y nunca en aplicaciones de producción sin supervisión humana.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados. La ausencia de filtros no mejora la veracidad.
- No se dispone de información sobre sesgos específicos, pero es probable que herede los sesgos del modelo base, que no han sido auditados en esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede generar responsabilidades legales si se utiliza para difundir contenido dañino.
- La cuantización GGUF puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa, especialmente en tareas de razonamiento complejo.
- No se ha verificado la compatibilidad total con todas las funcionalidades del modelo base (por ejemplo, el proyector de visión puede requerir el archivo mmproj adicional, que no se menciona explícitamente en esta variante).

## Enlaces

- [HuggingFace - yangli2/Qwen3.8-27B-Uncensored-mq6](https://huggingface.co/yangli2/Qwen3.8-27B-Uncensored-mq6)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B (modelo base)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [GitHub - unburdened-jackinthebox365/qwen38-uncensored](https://github.com/unburdened-jackinthebox365/qwen38-uncensored)
- [Ollama - orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
- [HuggingFace - 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/tree/main)
- [Blog - Qwen3.8-27B Uncensored GGUF: Abliterated Local Build](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
