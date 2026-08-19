# Wanggn/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una versión "abliterada" del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario Wanggn en HuggingFace. El objetivo es reducir sustancialmente el comportamiento de rechazo del modelo ante prompts dañinos, manteniendo intactas las capacidades generales de razonamiento, visión y generación de texto. No se trata de un fine-tuning con datos adicionales, sino de una edición de pesos mediante la herramienta Heretic, que elimina direcciones de rechazo en las capas de atención y MLP.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con entrada de imagen y texto, contexto de 262 144 tokens, y una cabeza de predicción multi-token (MTP) para decodificación especulativa. Esta versión conserva todas las capacidades del original, incluida la visión y el modo de razonamiento explícito (thinking), con una pérdida media de rendimiento de solo 0,5 puntos en benchmarks 0-shot. La licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en que ofrece una alternativa con menos filtros de seguridad para entornos de investigación, desarrollo de agentes o generación de contenido donde los rechazos excesivos del modelo base resultan un obstáculo. No obstante, la reducción de rechazos no es total: pasa de 98/100 a 12/100 en un conjunto de 100 prompts dañinos, y la divergencia KL respecto al base es de 0,1191, lo que indica una desviación moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso multimodal) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | bf16 nativo; GGUF con imatrix disponible (ver enlaces) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Qwen3.8-27B: un transformer denso de 64 capas con vocabulario de 248 320 tokens, diseñado para procesamiento conjunto de imagen y texto. Incluye una capa de prediccion multi-token (MTP) que permite decodificacion especulativa, acelerando la generacion. El modelo base fue entrenado por Alibaba con datos que cubren codigo, razonamiento, agentes y automatizacion de oficina, y destaca en benchmarks como DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3 (segun fuentes externas).

El proceso de abliteration se realizo con la herramienta Heretic, que co-minimiza el numero de rechazos frente a la divergencia KL respecto al modelo base. Se ejecutaron 200 pruebas de optimizacion, obteniendo un frente de Pareto de 23 puntos no dominados. El checkpoint publicado corresponde al punto con menor numero de rechazos (12/100) y una divergencia KL de 0,1191. Solo se modificaron las proyecciones `attn.o_proj` y `mlp.down_proj` (64 modulos cada una), y los tensores `mtp.*` se copiaron intactos del checkpoint base tras la fusion del LoRA. No hubo fine-tuning ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base en tareas de lenguaje general, con una perdida media de 0,5 puntos en benchmarks 0-shot.
- Vision: entrada de imagenes junto con texto (pipeline image-text-to-text), heredada del modelo base.
- Codigo y matematicas: el modelo base destaca en estas areas, aunque no se han publicado benchmarks generativos especificos para esta version.
- Tool calling y function calling: soportado por el modelo base, aunque no verificado explicitamente en esta version.
- Agentes y razonamiento multi-paso: el base esta optimizado para agentic workflows, y esta version conserva esa capacidad.
- Modo thinking: el chat template abre un bloque `thinking` por defecto; se puede desactivar con `enable_thinking=False`.
- Prediccion multi-token (MTP): cabeza de decodificacion especulativa presente y verificada, que acelera la inferencia.
- Multilingue: ingles y chino.

## Casos de uso

- Atencion al cliente automatizada: con 262K de contexto, puede gestionar conversaciones multi-turno largas y analizar documentos adjuntos. La reduccion de rechazos evita respuestas evasivas ante consultas complejas o sensibles, aunque requiere supervision humana para evitar respuestas inapropiadas.
- Generacion de codigo en produccion: el modelo base tiene un rendimiento solido en tareas de programacion. Al no rechazar prompts que pidan codigo para fines potencialmente maliciosos, puede integrarse en pipelines de CI/CD para generar tests, documentacion o parches, siempre con revision posterior.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas o formularios escaneados, combinando texto e imagen en un unico flujo de trabajo.
- Automatizacion de oficina: el base esta disenado para tareas como generacion de informes, resumen de correos o creacion de presentaciones. Esta version reduce las interrupciones por rechazo en contenido con tematica delicada.
- Investigacion en seguridad de IA: permite estudiar el comportamiento de rechazo y los efectos de la abliteration en modelos de gran tamano, comparando respuestas entre el base y esta version.
- Desarrollo de agentes con tool calling: su capacidad para razonar multi-paso y su ventana de contexto amplia lo hacen adecuado para agentes que deben interactuar con APIs y herramientas externas, con menos friccion por rechazos.
- Generacion de contenido creativo: para narrativa, guiones o material educativo donde el modelo base podria rechazar ciertos temas, esta version ofrece mas flexibilidad, aunque con responsabilidad legal y etica.

## Benchmarks y rendimiento

La model card proporciona resultados 0-shot obtenidos con lm-evaluation-harness, comparando el modelo base y esta version en las mismas condiciones. No se han publicado benchmarks generativos (GSM8K, HumanEval) ni evaluaciones de vision o MTP.

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| Media | | | -0,5 |

Estos valores no son comparables con las puntuaciones publicadas por Qwen, que usan few-shot. La diferencia entre ambos modelos es pequena y dentro del error estandar, por lo que la abliteration no degrada significativamente el rendimiento en estas tareas. El modelo base, segun fuentes externas, alcanza DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero no se ha verificado que esta version conserve esos resultados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 55 GB en bf16 (el tamano del repo es 55,6 GB).
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPUs (por ejemplo, 2x RTX 4090 con 24 GB cada una, usando tensor parallelism).
- Consumer GPU: no cabe en una sola GPU de consumo (RTX 4090 tiene 24 GB). Se requiere cuantizacion GGUF para ejecutarlo en hardware domestico; la version GGUF con imatrix esta disponible en el repositorio de JonathanColetti.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, llama.cpp (via GGUF), Ollama (si se publica), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP puede acelerar la decodificacion especulativa, pero no se han medido cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals (100 prompts) | KL vs base |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36 B | 262 144 | Apache 2.0 | 98/100 | 0 |
| Qwen3.8-27B-Uncensored (este) | 27,36 B | 262 144 | Apache 2.0 | 12/100 | 0,1191 |
| junafinity/Qwen-3.8-27B-Uncensored | 27,36 B | 262 144 | Apache 2.0 | no disponible | no disponible |

Existen otras versiones abliteradas del mismo modelo base, como la de junafinity, pero no se dispone de datos comparativos publicados. Frente al modelo base, la diferencia principal es la reduccion de rechazos a cambio de una ligera desviacion en la distribucion de salidas. No se han encontrado alternativas de otros fabricantes con el mismo tamano y licencia que ofrezcan datos de abliteration comparables.

## Limitaciones y advertencias

- La reduccion de rechazos no es total: 12 de 100 prompts dañinos reciben respuesta, frente a 98 en el base. El modelo aun rechaza una parte de las solicitudes peligrosas.
- La divergencia KL de 0,1191 indica que las distribuciones de salida difieren del base, lo que puede afectar a la coherencia en algunos dominios no evaluados.
- No se han publicado benchmarks generativos (GSM8K, HumanEval) ni evaluaciones de vision o MTP para esta version; el rendimiento real en codigo o matematicas no esta verificado.
- Solo soporta ingles y chino; no hay garantias de calidad en otros idiomas.
- El uso de un modelo con menos rechazos conlleva riesgos legales y eticos en produccion, especialmente en aplicaciones publicas. La licencia Apache 2.0 permite uso comercial, pero el responsable final es el desplegador.
- La abliteration puede eliminar comportamientos de seguridad aprendidos, como la negativa a generar contenido ilegal o peligroso. No es apto para entornos sin supervision humana.
- El modo thinking esta activado por defecto; requiere desactivarlo explicitamente si se desean respuestas directas, lo que puede confundir a integraciones que no esperan bloques de razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Wanggn/Qwen3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF con imatrix: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Demo Space: https://huggingface.co/spaces/JonathanColetti/Qwen3.8-27B-Uncensored-Demo
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Noticia sobre el lanzamiento: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
