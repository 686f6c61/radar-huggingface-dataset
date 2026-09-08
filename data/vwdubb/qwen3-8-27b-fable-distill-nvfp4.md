# vwdubb/Qwen3.8-27B-Fable-Distill-NVFP4

## Resumen

Qwen3.8-27B-Fable-Distill-NVFP4 es una cuantizacion NVFP4 (4 bits) del modelo TeichAI/Qwen3.8-27B-Fable-Distill, un ajuste ligero (light tune) del modelo Qwen3.8-27B perteneciente a la familia Qwen3.5. El autor, vwdubb, ha publicado esta variante cuantizada para reducir los requisitos de memoria manteniendo las capacidades del modelo original. El modelo esta entrenado sobre datasets relacionados con Claude Fable 5 (Claude Code y Chat) y un corpus privado adicional, lo que lo orienta a tareas de conversacion y asistencia de codigo.

El modelo destaca por su modo de pensamiento configurable: acepta `enable_thinking` y un parametro `reasoning_effort` con niveles low, medium y xhigh (el valor por defecto es xhigh, que genera razonamientos extensos en cada turno). Con 27.781.427.952 parametros totales y cuantizacion NVFP4, esta pensado para desplegarse en GPUs de consumo o servidores con recursos limitados. La licencia Apache 2.0 permite uso comercial, y el entrenamiento se realizo con Unsloth y TRL, lo que segun la model card duplico la velocidad de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, variante exacta no especificada) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits); variante FP8 disponible en el repositorio del autor |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion NVFP4 de TeichAI/Qwen3.8-27B-Fable-Distill, que a su vez es un destilado de Qwen3.8-27B. La arquitectura base es un transformer de la familia Qwen3.5, aunque no se detalla la variante exacta ni la configuracion interna. El pipeline declarado en HuggingFace es image-text-to-text, pero no hay documentacion sobre capacidades de vision; la informacion disponible se centra en texto y codigo.

El entrenamiento se realizo con Unsloth y TRL sobre los datasets `armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`, ademas de un corpus privado de Fable 5. La model card indica que fue un ajuste ligero y que el modelo acepta `enable_thinking` y `reasoning_effort` con niveles low, medium y xhigh. No se publican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y asistencia de codigo, basada en los datasets de Claude Code y chat de Fable 5.
- Modo de pensamiento configurable mediante `enable_thinking` y `reasoning_effort` (low, medium, xhigh), con xhigh como valor por defecto.
- Soporte de razonamiento extendido en tareas complejas gracias al modo thinking.
- Idiomas: solo ingles declarado en la model card.
- No hay informacion explicita sobre tool calling, function calling, agentes o capacidades multimodales, a pesar del pipeline image-text-to-text.

## Casos de uso

- Asistente de programacion: el modelo puede integrarse en entornos de desarrollo para generar codigo, explicar fragmentos y sugerir refactorizaciones, aprovechando su entrenamiento en datos de Claude Code.
- Chatbot de soporte tecnico: con su modo de pensamiento xhigh, puede gestionar conversaciones multi-turno que requieren descomponer problemas y razonar paso a paso.
- Revision de codigo y depuracion: gracias a su capacidad de analisis de codigo, puede identificar errores logicos y proponer correcciones en proyectos de software.
- Generacion de documentacion tecnica: a partir de codigo fuente, puede producir documentacion descriptiva, comentarios y guias de uso.
- Razonamiento de alto nivel: el modo thinking permite abordar problemas complejos de logica, planificacion o analisis, aunque no se han publicado benchmarks especificos.
- Destilacion de conocimiento: al ser un modelo de 27B con modo de pensamiento, puede utilizarse como modelo profesor para entrenar modelos mas pequenos mediante tecnicas de destilacion.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa entre el modelo base Qwen3.8-27B y el destilado Qwen3.8-27B-Fable-Distill. No se han publicado benchmarks para la variante NVFP4.

| Modelo | ARC Challenge | ARC Challenge (Easy) | BoolQ |
|---|---|---|---|
| Qwen3.8-27B | 0.591 | 0.782 | 0.896 |
| Qwen3.8-27B-Fable-Distill | 0.637 | 0.832 | 0.911 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 27.781.427.952 parametros. Con cuantizacion NVFP4, los pesos ocupan aproximadamente 14 GB (estimacion basada en 0.5 bytes por parametro), aunque el tamano del repositorio es de 31 GB, lo que sugiere que puede incluir otras variantes o pesos completos.
- VRAM estimada para inferencia: al menos 24 GB para NVFP4, aunque no hay mediciones oficiales.
- GPUs recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB.
- El modelo puede desplegarse en GPU de consumo como la RTX 4090, pero se recomienda verificar el consumo real de VRAM antes de su uso en produccion.
- Opciones de despliegue: compatible con transformers y text-generation-inference; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte explicito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | ARC Challenge | BoolQ | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | no disponible | 0.591 | 0.896 | Apache 2.0 |
| Qwen3.8-27B-Fable-Distill | 27.8B | no disponible | 0.637 | 0.911 | Apache 2.0 |
| Qwen3.8-27B-Fable-Distill-NVFP4 | 27.8B | NVFP4 | no disponible | no disponible | Apache 2.0 |

La variante NVFP4 no tiene benchmarks publicados, pero comparte arquitectura y entrenamiento con el destilado. La variante FP8 (`vwdubb/Qwen3.8-27B-Fable-Distill-FP8`) esta disponible en el repositorio del autor como alternativa de cuantizacion.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al estar entrenado en datos de Claude Code y chat de Fable 5, puede reflejar sesgos presentes en esos datasets.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- Solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- El dataset de entrenamiento incluye un corpus privado de Fable 5, lo que podria plantear problemas de derechos de autor o reproduccion de contenido no deseado.
- La cuantizacion NVFP4 puede degradar ligeramente el rendimiento en comparacion con el modelo original, aunque no se han publicado mediciones.
- No hay informacion sobre la longitud de contexto, por lo que se desconoce su capacidad para manejar entradas largas.

## Enlaces

- HuggingFace: https://huggingface.co/vwdubb/Qwen3.8-27B-Fable-Distill-NVFP4
- Variante FP8: https://huggingface.co/vwdubb/Qwen3.8-27B-Fable-Distill-FP8
