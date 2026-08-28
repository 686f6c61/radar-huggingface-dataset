# symrizals/qwen2.5-3b-legal-id-sft

## Resumen

`qwen2.5-3b-legal-id-sft` es un modelo de lenguaje de 3 000 millones de parámetros, resultado de un ajuste fino supervisado (SFT) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Qwen2.5-3B. El autor, `symrizals`, lo publica bajo licencia Apache-2.0 y lo entrena con las librerías Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rápido que un flujo estándar. El nombre sugiere una orientación a tareas legales, aunque la model card declara únicamente inglés como idioma soportado.

El modelo se presenta como un fine-tune conversacional para generación de texto, con arquitectura transformer decoder-only propia de la familia Qwen2.5. Al estar basado en Qwen2.5-3B, hereda una ventana de contexto de 32 000 tokens y capacidades multilingües del modelo original, aunque el autor solo especifica inglés. Con 3 000 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para prototipos y despliegues con recursos limitados.

A día de hoy no se han publicado resultados de benchmarks ni evaluaciones independientes, y el repositorio no incluye detalles sobre el dataset de entrenamiento ni el proceso de ajuste. Esto limita la posibilidad de verificar su rendimiento real en tareas legales, pero el modelo está disponible públicamente para su descarga y uso inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3 085 938 688 (3,09 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | Ingles (declarado); el nombre sugiere orientacion legal indonesia, pero no esta confirmado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-3B-bnb-4bit`, una version de Qwen2.5-3B cuantizada a 4 bits mediante bitsandbytes, que se usa como punto de partida para el ajuste fino. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y normalizacion RMSNorm, tal como se define en la familia Qwen2.5. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. El unico dato disponible es que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica un flujo de SFT estandar.

Al ser un fine-tune de un modelo ya cuantizado, es posible que los pesos finales se hayan convertido a precision completa (fp16/bf16) para su publicacion, dado el tamano del repositorio (6,2 GB). No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el modelo mantiene las caracteristicas del Qwen2.5 original.

## Capacidades

- Generacion de texto y conversacion multi-turno, al ser un modelo entrenado con un objetivo de SFT conversacional.
- Razonamiento basico y comprension de instrucciones, heredado de Qwen2.5-3B.
- Soporte de tool calling y function calling: no confirmado; el modelo base Qwen2.5-3B lo soporta, pero el fine-tune podria haberlo alterado.
- Capacidades multilingues: el modelo base Qwen2.5-3B soporta multiples idiomas, pero el autor declara solo ingles; no se ha verificado el comportamiento en otros idiomas.
- Orientacion a dominios legales: el nombre "legal-id" sugiere un enfoque en tareas juridicas, pero no hay evidencia en la documentacion que confirme esta especializacion.

## Casos de uso

- Asistencia legal basica: el modelo podria emplearse para responder preguntas frecuentes sobre procedimientos legales o redactar borradores de documentos simples, aunque su rendimiento no esta verificado.
- Chatbots de atencion al cliente en despachos de abogados: gracias a su ventana de 32K tokens, puede gestionar conversaciones largas con contexto extenso, aunque la falta de evaluacion limita su fiabilidad.
- Clasificacion y resumen de documentos juridicos: con un ajuste adicional, podria extraer informacion relevante de contratos o sentencias, pero no hay datos que lo confirmen.
- Prototipos de investigacion en NLP juridico: al ser un modelo pequeno y de codigo abierto, sirve como base para experimentos academicos sin requerir hardware caro.
- Generacion de respuestas en entornos con recursos limitados: su tamano permite ejecutarlo en una GPU consumer, lo que facilita su integracion en aplicaciones locales.
- Fine-tune posterior: al estar publicado con pesos safetensors y licencia Apache-2.0, puede utilizarse como punto de partida para nuevos ajustes en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. La unica referencia indirecta es el modelo base Qwen2.5-3B, que en su version original obtiene resultados conocidos, pero el fine-tune puede haber alterado su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (6,2 GB), se necesitan aproximadamente 6-8 GB de VRAM para cargar el modelo completo. Con cuantizacion a 4 bits, la VRAM se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores. Tambien puede ejecutarse en A100 o H100 si se dispone de ellas.
- Compatibilidad con GPU consumer: si, cabe en la mayoria de GPUs de consumo actuales con 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y Transformers de Hugging Face. El modelo es compatible con endpoints de inferencia.
- Latencia y throughput: no hay datos publicados; en una GPU RTX 4090 se espera una latencia de decenas de milisegundos por token para un modelo de 3B, pero no se ha medido en este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen2.5-3b-legal-id-sft (symrizals) | 3,09 B | 32K | Apache-2.0 | Fine-tune legal, sin benchmarks |
| Qwen2.5-3B (base) | 3,09 B | 32K | Apache-2.0 | Modelo original, con benchmarks publicos |
| Otros qwen2.5-3b-legal-id-sft (ahmadfatikhulkhasan, rifyaldo, etc.) | 3,09 B | 32K | Apache-2.0 | Fine-tunes similares, posiblemente del mismo dataset |

La comparativa se limita a variantes del mismo modelo base. No se dispone de otros modelos legales de tamano comparable con datos publicos para una comparacion mas amplia.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos o alucinaciones; al ser un fine-tune pequeno, el riesgo de generar informacion falsa o inventada es significativo, especialmente en dominios legales donde la precision es critica.
- La orientacion legal no esta confirmada: el nombre del modelo sugiere un enfoque juridico, pero la model card no proporciona detalles sobre el dataset ni las tareas especificas.
- Idioma limitado: aunque Qwen2.5-3B es multilingue, el autor declara solo ingles; el rendimiento en otros idiomas, incluido el espanol, no esta garantizado.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5, se deben respetar los terminos de la licencia original de Qwen (que tambien es Apache-2.0).
- El modelo se publico sin descargas ni likes, lo que sugiere una adopcion nula y una falta de validacion por parte de la comunidad.
- No se proporcionan instrucciones de uso ni ejemplos de prompt, lo que dificulta su integracion en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symrizals/qwen2.5-3b-legal-id-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante similar de ahmadfatikhulkhasan: https://huggingface.co/ahmadfatikhulkhasan/qwen2.5-3b-legal-id-sft
- Variante similar de rifyaldo: https://huggingface.co/rifyaldo/qwen2.5-3b-legal-id-sft
- Ficha en LLM Explorer (variante de alvian-metalit): https://llm-explorer.com/model/alvian-metalit%2Fqwen2.5-3b-legal-id-sft,5HzcnQxz90ghWjxdG16Ihm
- Ficha en LLM Explorer (variante de ahmadfatikhulkhasan): https://llm-explorer.com/model/ahmadfatikhulkhasan%2Fqwen2.5-3b-legal-id-sft,6gtnqa7RJVFPNtt7U1jRIW
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/ahmfras/qwen2.5-3b-legal-id-sft
