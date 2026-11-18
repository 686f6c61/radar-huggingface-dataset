# Star-aep/Prism-Mochi-9B-GGUF

## Resumen

Prism-Mochi-9B es un ajuste fino (finetune) del modelo Qwen3.5-9B de Alibaba Cloud, distribuido en formato GGUF por el usuario Star-aep bajo el identificador Star-aep/Prism-Mochi-9B-GGUF. El modelo parte concretamente de la variante abliterated de huihui-ai (Huihui-Qwen3.5-9B-abliterated, commit `05b9e7c9`), una version sin censura del modelo base, y anade una pasada de refusal-tuning orientada a bloquear instrucciones de explotacion infantil y de dano masivo, manteniendo el resto del comportamiento sin censura. Su proposito declarado es servir como motor de chat de personajes en prism.ai, una aplicacion local y privada de roleplay que ejecuta sus propios modelos mediante llama.cpp u Ollama.

El modelo conserva la arquitectura y el tokenizador de Qwen3.5-9B sin modificaciones; el ajuste solo altera los pesos mediante adaptadores entrenados sobre conjuntos de prompts especificos del proyecto. Cuenta con 8.953.803.264 parametros (unos 8,95 mil millones) y se publica unicamente en cuantizacion Q5_K_M dentro de un repositorio de 6,5 GB. La licencia es Apache 2.0, heredada tanto del modelo abliterated de huihui-ai como de Qwen3.5.

Su relevancia actual es acotada pero concreta: cubre el nicho de modelos locales para roleplay y chat de personajes con requisitos de VRAM moderados (unos 8 GB en Q5_K_M) y una politica de contenido explicita (refusals limitados a dos categorias, resto sin censura). No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo; es una pieza de infraestructura para una aplicacion concreta. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; sin cambios estructurales) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server de la model card) |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado); el autor menciona Q4 como opcion recomendada para GPUs de 8 GB, pero no se distribuye en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B, un transformer denso de aproximadamente 8,95 mil millones de parametros. El autor indica explicitamente que "nothing about the architecture or tokenizer is new": el finetune no introduce cambios en la estructura, el tokenizador ni la ventana de contexto. El entrenamiento consistio en una pasada de refusal-tuning sobre la variante abliterated de huihui-ai, con adaptadores nuevos ("fresh adapters on the final prompt sets") entrenados en el mismo pipeline que el modelo hermano menor Prism Mochi 2B. Los datos de entrenamiento concretos (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; el autor remite a los registros de entrenamiento del repositorio del proyecto prism.ai.

La innovacion tecnica declarada es la politica de contenido: se anaden rechazos para explotacion infantil e instrucciones de dano masivo, mientras que el resto del modelo permanece sin censura (propiedad heredada de la base abliterated). No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia adicionales. El ajuste esta orientado a mantener el personaje (in-character roleplay) en el contexto de la aplicacion prism.ai.

## Capacidades

- Generacion de texto conversacional, con enfasis en roleplay y chat de personajes multi-turno.
- Mantenimiento de personaje (in-character) gracias al ajuste especifico sobre prompts de roleplay.
- Respuestas sin censura en general, con rechazos acotados a explotacion infantil e instrucciones de dano masivo.
- Herencia de las capacidades del modelo base Qwen3.5-9B (razonamiento, codigo, matematicas), aunque el finetune no las documenta ni las evalua explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Chat de personajes local en prism.ai: el modelo se carga en la carpeta de modelos de la aplicacion (via `config.example.json`) y se selecciona en Settings; esta disenado especificamente para este flujo, con contexto de 32.768 tokens suficiente para conversaciones largas con memoria de personaje.
- Roleplay privado en escritorio: con Q5_K_M y unos 8 GB de VRAM, se puede ejecutar en una GPU de gama media-consumo sin enviar datos a la nube, lo que encaja con el requisito de privacidad del proyecto.
- Despliegue con llama.cpp en servidor local: `llama-server -m Prism-Mochi-9B-rc2-Q5_K_M.gguf -c 32768` expone una API compatible con endpoints, util para integrar el modelo en frontends de chat propios.
- Prototipado de narrativa interactiva: la ventana de 32K tokens permite mantener arcos narrativos largos y fichas de personaje extensas sin truncar el contexto.
- Experimentacion con politicas de contenido: util para investigadores que quieran estudiar el efecto de un refusal-tuning selectivo sobre una base abliterated, comparando el comportamiento antes y despues del ajuste.
- Sustitucion de modelos mayores en equipos con 8 GB de VRAM: el autor sugiere Q4 como punto de partida en tarjetas de 8 GB, lo que permite ejecutar un modelo de ~9B en hardware de consumo para tareas de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para Q5_K_M (dato del autor); el autor recomienda Q4 como punto de partida en tarjetas de 8 GB, aunque esa cuantizacion no se distribuye en el repositorio.
- GPU recomendadas: no se especifican modelos concretos. Por el perfil de VRAM, encaja en GPUs de consumo con 8 GB o mas (gama RTX xx60/xx70) y en GPUs de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU de consumo: si, con Q5_K_M en tarjetas de 8 GB o superiores; en 8 GB exactos el autor sugiere Q4.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y la aplicacion prism.ai.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Prism-Mochi-9B (este) | ~8,95 B | 32.768 | GGUF (Q5_K_M) | Apache 2.0 | Finetune de roleplay con refusal-tuning selectivo |
| Qwen/Qwen3.5-9B | ~8,95 B | no disponible | safetensors y otras | Apache 2.0 | Modelo base de proposito general, con censura estandar |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~8,95 B | no disponible | no disponible | Apache 2.0 | Base abliterated sin censura, sin ajuste de roleplay |
| Prism Mochi 2B | no disponible | no disponible | no disponible | Apache 2.0 | Hermano menor del mismo pipeline, para hardware mas limitado |

Los datos de contexto y formato de los modelos comparables no estan disponibles en la informacion proporcionada; solo se confirman sus identificadores y su relacion con este modelo.

## Limitaciones y advertencias

- El modelo esta pensado para adultos y uso privado; el autor lo declara explicitamente y advierte de que la base sigue sin censura fuera de las dos categorias con refusal.
- Riesgo de alucinacion: no se documenta ningun ajuste especifico para reducirla; al ser un finetune de roleplay, la coherencia factual no es un objetivo del entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de una base abliterated, los sesgos del modelo original pueden persistir y no han sido evaluados.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingue es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal sobre el contenido generado recae en el usuario.
- Estado del proyecto: repositorio sin descargas ni likes, creado y actualizado el mismo dia (17 de noviembre de 2026), version rc2; se trata de una publicacion temprana sin validacion externa.
- Solo se distribuye una cuantizacion (Q5_K_M); no hay safetensors ni otras variantes en el repositorio.
- El proyecto prism.ai no esta afiliado ni respaldado por huihui-ai, Alibaba Cloud ni el equipo Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Star-aep/Prism-Mochi-9B-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de la aplicacion prism.ai: https://github.com/sucaline/prism-ai
