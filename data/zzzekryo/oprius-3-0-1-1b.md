# zzzekryo/Oprius-3.0-1.1B

## Resumen

Oprius 3.0 1.1B es un modelo de lenguaje conversacional desarrollado por el usuario zzzekryo a partir de un fine-tuning de TinyLlama 1.1B Chat v1.0. El ajuste se realizó mediante LoRA, cuyos pesos se han fusionado permanentemente en el modelo base, de modo que se puede cargar como un modelo Transformers autónomo sin necesidad de gestionar adaptadores externos. Su propósito es ofrecer una experiencia conversacional natural que adapta la longitud de las respuestas al contexto: respuestas cortas para conversación cotidiana, de longitud media para asistencia general y más elaboradas para conceptos complejos.

El modelo se entrenó con un dataset propio (`zzzekryo/conversation-and-web-examples-ForOprius`) compuesto por 893 ejemplos que incluyen conversaciones generales, explicaciones y patrones de interacción relacionados con búsquedas web. Es relevante como ejemplo de fine-tuning ligero y accesible sobre un modelo pequeño, útil para despliegues en hardware modesto, chatbots ligeros o como base para experimentación. Al tratarse de un modelo de 1,1 mil millones de parámetros basado en la arquitectura Llama de TinyLlama, su ventana de contexto y sus capacidades de razonamiento son limitadas en comparación con modelos actuales de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (arquitectura Llama, familia TinyLlama) |
| Parametros totales | 1.100.048.384 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base TinyLlama 1.1B usa 2048 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp16/fp32 según carga; sin versiones cuantizadas publicadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers y endpoints de inferencia) |

## Arquitectura y entrenamiento

Oprius 3.0 hereda la arquitectura de TinyLlama 1.1B Chat, un transformer decodificador que replica la arquitectura Llama 2 en una escala reducida de 1,1 mil millones de parámetros. El ajuste fino no se realizó desde cero: se aplicó LoRA (Low-Rank Adaptation) sobre el modelo base y, a continuación, los pesos del adaptador se fusionaron permanentemente en el modelo, lo que simplifica el despliegue al evitar la gestión de adaptadores en tiempo de inferencia.

El entrenamiento utilizó el dataset `zzzekryo/conversation-and-web-examples-ForOprius`, con 893 ejemplos que cubren conversación general, explicaciones de conceptos, preguntas cotidianas y patrones de interacción con búsquedas web. No se indica el número de épocas, ni el uso de RLHF o DPO, ni detalles sobre hiperparámetros de entrenamiento. Un detalle destacable del diseño es el estilo de respuesta adaptativo: el modelo fue entrenado para modular la longitud de sus respuestas según el tipo de interacción, aunque el propio autor aclara que se trata de una tendencia aprendida y no de una regla garantizada.

## Capacidades

- Generación de texto conversacional en inglés, con estilo informal y natural en lugar de un tono excesivamente formal.
- Adaptación de la longitud de respuesta según el contexto: corta para charla cotidiana, media para asistencia general, larga para explicaciones de conceptos complejos.
- Respuestas a preguntas generales y explicaciones divulgativas (por ejemplo, explicar qué es una GPU).
- Patrones aprendidos de interacción con búsquedas web: el modelo reconoce solicitudes de búsqueda y genera respuestas orientadas a búsqueda, aunque sin acceso real a internet.
- Soporte del chat template de Transformers mediante `apply_chat_template`, con formato de mensajes multi-turno.
- No hay soporte documentado de tool calling nativo, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbot conversacional ligero: su tamaño de 1,1B permite ejecutarlo en CPU o GPU de consumo, ideal para asistentes de charla informal con respuestas breves y naturales.
- Asistente de preguntas generales embebido en aplicaciones: para consultas cotidianas (definiciones, dudas básicas) donde no se requiere un modelo grande, reduciendo coste y latencia.
- Prototipado de integraciones con buscadores: sus ejemplos de entrenamiento sobre búsquedas web lo hacen adecuado para probar orquestaciones donde una aplicación externa ejecuta la búsqueda y pasa los resultados al modelo.
- Experimentación y educación: como caso de estudio de fine-tuning LoRA con fusión de pesos sobre TinyLlama, útil para aprender pipelines de ajuste fino y despliegue con Transformers.
- Generación de explicaciones adaptativas: en herramientas de aprendizaje, puede ofrecer respuestas más elaboradas cuando el tema lo requiere y respuestas cortas en interacciones simples.
- Asistente en dispositivos con recursos limitados: cabe en hardware modesto, lo que lo hace viable para despliegues locales sin requisitos de VRAM elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en fp16 y unos 4,4 GB en fp32 (el repositorio pesa 4,4 GB); en int8/int4 cuantizado cabría en torno a 1,1-0,7 GB, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060 o superiores); no requiere GPUs de datacenter como A100 o H100.
- Cabe sin problemas en GPUs de consumo e incluso es ejecutable en CPU moderna en fp32, con latencia mayor.
- Opciones de despliegue: Transformers (método documentado por el autor) con `device_map="auto"`; al ser compatible con la arquitectura Llama, en principio funciona con llama.cpp, Ollama y vLLM, aunque no hay soporte oficial documentado ni conversiones GGUF publicadas.
- Latencia y throughput: no disponible; por su tamaño de 1,1B cabe esperar respuestas rápidas incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Oprius 3.0 1.1B | 1,1B | no disponible | Apache 2.0 | Fine-tuning LoRA fusionado, especializado en conversación adaptativa en inglés |
| TinyLlama 1.1B Chat v1.0 (base) | 1,1B | 2048 tokens | Apache 2.0 | Modelo base, entrenado sobre 3 trillones de tokens, chat general |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 tokens (128K con RoPE scaling) | Apache 2.0 (Qwen Research) o licencia Qwen | Multilingüe (29+ idiomas), capacidades de tool calling, benchmarks muy superiores |
| Llama 3.2 1B Instruct | 1,24B | 131072 tokens | Llama 3.2 Community License | Multilingüe (8 idiomas), soporte de tool calling, restricciones de licencia comunitaria |

Oprius 3.0 se posiciona como un fine-tuning ligero y especializado frente a alternativas como Qwen2.5-1.5B o Llama 3.2 1B, que ofrecen contextos mucho más largos, multilingüismo y tool calling nativo, pero con licencias más restrictivas en el caso de Llama.

## Limitaciones y advertencias

- Con 1,1B de parámetros, el modelo tiene dificultades con razonamiento complejo y tareas especializadas, tal como reconoce el propio autor en la model card.
- Riesgo de alucinación elevado: puede generar información incorrecta, por lo que las afirmaciones importantes deben verificarse.
- Los ejemplos de búsqueda web del entrenamiento no otorgan acceso real a internet: sin una integración externa de búsqueda, sus respuestas sobre actualidad pueden estar desactualizadas o ser inexactas.
- El autor documenta en sus notas de prueba que, en interacciones de búsqueda web, el modelo puede repetir el system prompt en los mensajes, un comportamiento indeseado detectado durante las pruebas.
- La longitud y el estilo de respuesta son tendencias aprendidas, no reglas garantizadas, por lo que el comportamiento puede variar según los parámetros de muestreo.
- Solo está pensado para inglés; no hay soporte documentado de otros idiomas, incluido el castellano.
- La licencia Apache 2.0 permite uso comercial, pero cualquier redistribución debe conservar los avisos de copyright originales, el texto de la licencia y la notificación de las modificaciones respecto a TinyLlama.
- El dataset de entrenamiento es muy reducido (893 ejemplos), lo que limita la diversidad de comportamientos y puede provocar sobreajuste a los patrones del dataset del autor.
- Existe una inconsistencia en la model card entre las referencias a "Oprius 3.0" y "Oprius 3.1", y el identificador de modelo usado en el ejemplo de código (`zzzekryo/Oprius-3.1-1.1B`) no coincide con el ID real del repositorio (`zzzekryo/Oprius-3.0-1.1B`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzzekryo/Oprius-3.0-1.1B
- Modelo base (TinyLlama 1.1B Chat v1.0): https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/zzzekryo/conversation-and-web-examples-ForOprius
- Paper, repositorio de código y demo: no disponible
