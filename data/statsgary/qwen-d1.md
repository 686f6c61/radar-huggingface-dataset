# StatsGary/Qwen-D1

## Resumen

Qwen-D1 es un ajuste fino de tipo LoRA sobre el modelo base unsloth/Qwen3.5-4B, desarrollado por StatsGary y publicado en Hugging Face. No se trata de un modelo de chat generalista, sino de un llamado "FastDecisionModel": un backbone LLM de 4.000 millones de parametros al que se le acopla una cabeza de decision personalizada para resolver, en una sola pasada, multiples tareas estructuradas de clasificacion, decision binaria y puntuacion de severidad o urgencia sobre un texto de entrada.

El modelo esta pensado para escenarios donde se necesita evaluar varias preguntas estructuradas sobre un mismo documento sin encadenar varias llamadas al LLM. En lugar de hacer prompting secuencial para cada criterio, Qwen-D1 produce en una unica inferencia las respuestas a todas las preguntas definidas por la cabeza de decision, lo que reduce latencia y coste en pipelines de triaje.

La relevancia actual del modelo es limitada pero concreta: es un experimento de investigacion publicado en noviembre de 2026, sin descargas ni likes en el momento de redactar esta ficha, y con una model card muy escueta. Su interes reside en la arquitectura hibrida (backbone Qwen3.5-4B mas decision head) y en el uso de Unsloth para el entrenamiento eficiente con LoRA, mas que en un rendimiento demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de decision personalizada (FastDecisionModel) |
| Parametros totales | 4.000 millones (heredados del base Qwen3.5-4B; no se especifica el recuento exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via llama.cpp/GGUF, no confirmado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre el base) |

## Arquitectura y entrenamiento

Qwen-D1 parte del backbone unsloth/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros. Sobre ese backbone se anade una cabeza de decision personalizada que transforma la salida del modelo en un conjunto de decisiones estructuradas: clasificacion, respuestas binarias si/no y puntuaciones de severidad o urgencia. El modelo se presenta como un "Decision Head over LLM Backbone", es decir, un unico forward pass que responde simultaneamente a varias preguntas sobre el mismo texto de entrada.

El entrenamiento se realizo con la libreria Unsloth, usando LoRA con rango 16 y alpha 16, sobre el dataset LocalLLaMA/typed-decisions. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion de decodificacion ni tecnicas de atencion especificas; la model card es practicamente un esqueleto y no aporta informacion sobre la funcion de perdida de la cabeza de decision ni sobre como se combinan las multiples salidas.

## Capacidades

- Evaluacion multi-opcion en una sola pasada: responde varias preguntas estructuradas sobre un mismo texto sin necesidad de multiples llamadas.
- Clasificacion de texto: asignacion de categorias predefinidas a la entrada.
- Decisiones binarias si/no: util para filtros y triaje rapido.
- Puntuacion de severidad y urgencia: escalas numericas sobre el contenido analizado.
- Procesamiento de texto en ingles: el modelo declara soporte unicamente para ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking mode).
- No se documenta capacidad multilingue mas alla del ingles.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada ticket en categoria, decidir si requiere escalado (si/no) y puntuar su urgencia en una sola inferencia, lo que encaja con la cabeza de decision multi-pregunta y reduce el numero de llamadas frente a un LLM generalista.
- Moderacion de contenido: evaluacion simultanea de varios criterios (toxicidad, spam, relevancia) sobre un mismo mensaje, aprovechando que el modelo responde a multiples preguntas estructuradas en un unico pase.
- Enrutamiento de correos o formularios: clasificacion del tipo de solicitud y decision binaria sobre si cumple los requisitos para procesamiento automatico, con una puntuacion de prioridad asociada.
- Filtrado previo en pipelines de datos: descarte rapido de documentos que no cumplen varios criterios a la vez, usando el modelo como primera etapa antes de un LLM mayor.
- Analisis de incidencias: asignacion de severidad y urgencia a informes de error o alertas, con decision binaria sobre si requieren intervencion inmediata.
- Investigacion sobre cabezas de decision: el modelo sirve como referencia para estudiar arquitecturas que sustituyen el prompting secuencial por una cabeza de decision entrenada, comparando latencia y consistencia frente a un LLM con prompts encadenados.
- Prototipado de clasificadores multi-etiqueta: al estar basado en un backbone de 4B y entrenado con LoRA, puede ajustarse de nuevo con Unsloth sobre dominios especificos sin requerir hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del backbone de 4B, en FP16 requeriria aproximadamente 8 GB de VRAM; en cuantizacion de 4 bits, alrededor de 3-4 GB. Estas cifras son estimaciones genericas para un modelo de 4B y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano del backbone, cabria esperar funcionamiento en GPUs consumer tipo RTX 3060 12 GB, RTX 4070, RTX 4090, asi como en A100/H100 para despliegues de mayor throughput, pero el autor no lo especifica.
- Compatibilidad con GPU consumer: probable por el tamano del backbone (4B), aunque la cabeza de decision personalizada puede requerir codigo especifico no incluido en los runners estandar.
- Opciones de despliegue: no disponible. Al ser un adaptador LoRA con cabeza personalizada, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin trabajo de integracion adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen-D1 (StatsGary) | 4B | no disponible | LGPL-3.0 | LoRA con cabeza de decision multi-pregunta |
| Qwen3.5-4B (unsloth) | 4B | no disponible | no disponible en la informacion | LLM base generalista |
| Alternativas de clasificacion multi-etiqueta | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. La comparacion con el base Qwen3.5-4B es estructural (mismo backbone), no de rendimiento.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la publicacion; no hay evidencia de validacion por parte de la comunidad.
- La model card no documenta sesgos conocidos, pero al entrenarse sobre un dataset no descrito (LocalLLaMA/typed-decisions) y solo en ingles, es probable que herede sesgos del corpus y del backbone.
- Riesgo de alucinacion inherente a un LLM de 4B; la cabeza de decision puede producir clasificaciones o puntuaciones inconsistentes fuera de la distribucion de entrenamiento.
- Soporte unicamente en ingles: no apto para produccion en castellano u otros idiomas sin validacion previa.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas.
- Licencia LGPL-3.0: permite uso comercial con obligaciones de copyleft sobre la libreria modificada; conviene revisar los terminos antes de integrarlo en productos propietarios.
- La cabeza de decision personalizada implica que el modelo no es un drop-in replacement de un LLM estandar; requiere el codigo de inferencia adecuado, no documentado en la model card.
- No se documentan soporte de tool calling, agentes ni modo de razonamiento, por lo que no deberia asumirse en produccion.
- El repositorio ocupa 0,2 GB, coherente con un adaptador LoRA, no con pesos completos; es necesario descargar tambien el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StatsGary/Qwen-D1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Libreria Unsloth: https://github.com/unslothai/unsloth
