# tako080614/evex-5.1

## Resumen

evex-5.1 es un modelo de lenguaje japonés entrenado **desde cero** exclusivamente con los registros de un único servidor de Discord. Lo desarrolla tako080614 y no deriva de ningún modelo preexistente: tanto el tokenizador como los pesos se construyeron específicamente para este servidor. Con solo 25,7 millones de parámetros, es un modelo extremadamente pequeño diseñado para una tarea muy concreta: generar mensajes que imiten el estilo conversacional de los miembros de esa comunidad.

Su relevancia radica en ser un experimento de entrenamiento de dominio extremo: demuestra que es posible crear un modelo útil para una comunidad concreta con recursos mínimos. Incorpora innovaciones técnicas como PLE (Per-Layer Embeddings, similar a Gemma 3n) y QK-norm, y utiliza un formato de prompt propio basado en tokens simbólicos que codifican la estructura de la conversación. Su licencia es CC-BY-4.0 y está pensado para generación de texto en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE + RMSNorm + SwiGLU, weight tying, PLE, QK-norm) |
| Parametros totales | 25.763.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | japones |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con d_model 384 y 6 cabezas de atencion, que usa RoPE (Rotary Position Embeddings), RMSNorm, SwiGLU y weight tying entre la capa de embedding y la de salida. La innovacion principal es el uso de **PLE (Per-Layer Embeddings)** con d_ple=64: vectores auxiliares por token y por capa que se anaden a las activaciones, implementados como una tabla de consulta en lugar de un producto matricial. Esto incrementa la capacidad en un 36% pero solo anade un 3% de coste computacional por token, lo que beneficia especialmente a la inferencia en CPU. Tambien aplica QK-norm, normalizando las consultas y claves con RMSNorm antes de RoPE.

El entrenamiento se realizo en dos etapas: primero con una mezcla de datos externos de conversacion (Japanese-Roleplay-Dialogues, JESC y open2ch) junto con conversaciones del servidor, y despues exclusivamente con los registros del servidor. El vocabulario es de 12.288 tokens, creado con SentencePiece BPE con byte_fallback. Los mensajes con reacciones (22.667 ejemplos) se sobremuestrearon en la segunda etapa. El valor de perdida final es 7,0960 (epoch 8).

## Capacidades

- Generacion de texto conversacional en japones imitando el estilo de miembros anonimos de un servidor de Discord concreto.
- Modelado de estructura de conversacion: canales, hilos de respuestas, reacciones y alternancia de hablantes mediante tokens especiales.
- Generacion de respuestas con conocimiento del contexto previo de la conversacion (hasta 1024 tokens).
- Distincion entre hablantes frecuentes (147 tokens de hablante anonimo `<|s0|>` a `<|s146|>`) y hablantes ocasionales (tokens `<|a|>` a `<|h|>` asignados por orden de aparicion).
- Soporte de normalizacion de elementos especiales: URLs, archivos, menciones, canales, horas y bloques de codigo.
- Capacidad de generar mensajes que tienden a recibir reacciones si se incluye el token `<|hi|>` en el prompt.
- Tokenizador propio adaptado al vocabulario y nombres frecuentes del servidor.

## Casos de uso

- **Generacion de respuestas para un bot de Discord del servidor**: el modelo puede continuar conversaciones existentes o responder a mensajes de los miembros, imitando el estilo y las referencias internas de la comunidad.
- **Archivo conversacional interactivo**: permite "revivir" conversaciones pasadas generando continuaciones plausibles a partir de un historial real del servidor.
- **Creacion de contenido para la comunidad**: generar memes, chistes internos o mensajes de felicitacion con el tono y vocabulario propios del servidor.
- **Simulacion de miembros para pruebas**: generar mensajes sinteticos de ciertos hablantes anonimos (por rango de actividad) para probar moderadores o bots sin usar datos reales.
- **Estudio de modelado de estilo conversacional**: sirve como caso de estudio para investigar como se puede capturar la idiosincrasia de una comunidad pequena con un modelo minimo.
- **Generacion de respuestas con reacciones**: al incluir el token `<|hi|>` en el prompt, el modelo tiende a generar mensajes del tipo que suele recibir reacciones en el servidor, util para crear contenido atractivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 7,0960 tras 8 epochs. No hay comparaciones con otros modelos en la documentacion del autor.

## Requisitos de hardware

- **VRAM**: inferior a 1 GB en fp32 (el modelo pesa aproximadamente 103 MB en safetensors). Cabe en cualquier GPU moderna, incluso integradas.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM; una GTX 1650 o superior es mas que suficiente. Tambien funciona en CPU sin problemas.
- **CPU**: viable para inferencia en tiempo real en CPU gracias al diseno optimizado con PLE (solo +3% de coste por token).
- **Opciones de despliegue**: el repositorio incluye `model.py` con la clase `MicroLM` y `generate()`. Se puede usar directamente con PyTorch y safetensors. No hay integracion documentada con vLLM, Ollama o llama.cpp, aunque al ser un modelo pequeno podria convertirse a GGUF.
- **Latencia**: no disponible, pero por tamano se espera una generacion de decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| evex-5.1 | 25,7 M | 1024 | ja | CC-BY-4.0 | Entrenado desde cero para un servidor Discord concreto |
| TinyLlama 1.1B | 1.100 M | 2048 | multilingue | Apache-2.0 | Modelo generalista pequeno, no especializado en conversacion |
| phi-2 (Microsoft) | 2.700 M | 2048 | en | MIT | Modelo pequeno de proposito general, sin especializacion conversacional |

No hay modelos comparables publicados con la misma especializacion (entrenados desde cero para un solo servidor de Discord). Los modelos de tamano similar no estan especializados en una comunidad concreta.

## Limitaciones y advertencias

- **Sesgo de dominio extremo**: el modelo esta entrenado casi exclusivamente con el registro de un unico servidor de Discord. Su vocabulario, tono y conocimiento estan fuertemente sesgados hacia esa comunidad y sus topicos internos. No sirve como modelo de proposito general en japones.
- **Riesgo de alucinacion**: el autor advierte explicitamente que la salida no es fiable para verificacion de hechos. El modelo puede generar afirmaciones falsas con total naturalidad.
- **Sin mecanismos de seguridad**: no hay sistema de moderacion en inferencia. La limpieza de contenido danino se hizo solo a nivel de dataset, de forma mecanica. El modelo puede generar contenido ofensivo o inapropiado.
- **Privacidad**: los tokens `<|sN|>` son anonimos, pero los nombres de visualizacion de hasta 16 de los 147 hablantes frecuentes estan presentes en el vocabulario del tokenizador y pueden extraerse. Ademas, los patrones de escritura de los hablantes quedan codificados en los pesos.
- **Formato de prompt propietario**: requiere conocer y usar el formato de tokens especiales descrito en la documentacion. Usar un formato de prompt estandar producira salidas sin sentido.
- **Limitaciones de contexto**: 1024 tokens es una ventana corta; conversaciones largas no caben completas.
- **Idioma**: solo japones. No soporta otros idiomas.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribucion, pero el modelo contiene datos derivados de conversaciones de terceros; el autor no garantiza que el uso comercial sea legalmente seguro.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/tako080614/evex-5.1)
- [Dataset: OmniAICreator/Japanese-Roleplay-Dialogues](https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues)
- [Dataset: nntsuzu/JESC](https://huggingface.co/datasets/nntsuzu/JESC)
- [Dataset: p1atdev/open2ch](https://huggingface.co/datasets/p1atdev/open2ch)
- [Corpus original de open2ch](https://github.com/1never/open2ch-dialogue-corpus)
