# www622846/qwen3.5-9b-rp-lora-v2

## Resumen

El modelo `www622846/qwen3.5-9b-rp-lora-v2` es un adaptador LoRA de fine-tuning sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario www622846 con el objetivo específico de mejorar el roleplay de personajes (RP) en coreano. Se trata de un ajuste supervisado (SFT) con rango 64 y alpha 128, que añade 116 millones de parámetros al modelo base de 8.953 millones, y se distribuye tanto como adaptador PEFT en safetensors como en formato GGUF fusionado y cuantizado a 4 bits (Q4_K_M) para inferencia optimizada.

El problema que resuelve es la falta de modelos abiertos especializados en conversación de rol en coreano con consistencia de personaje, narración natural y fidelidad a la primera persona. El autor ha construido un benchmark propio de 33 prompts en 8 categorías porque no existe un estándar público para esta tarea, y reporta una mejora de 5 puntos sobre el base (54.0 frente a 49.0 sobre 100). La relevancia actual radica en que combina la base Qwen3.5-9B (Apache-2.0, con soporte multilingüe y razonamiento) con un ajuste ligero y de bajo coste, accesible para GPUs de consumo gracias a la cuantización.

El dataset de entrenamiento es privado, compuesto por conversaciones reales consentidas y datos sintéticos, con metadatos eliminados para obtener diálogos coreanos limpios. El modelo está pensado para uso creativo y puede generar contenido maduro, por lo que el autor advierte de la responsabilidad del usuario en cuanto a normativa y políticas de plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) + adaptador LoRA (r64, alpha 128) |
| Parametros totales | 8.953.803.264 (base) + 116.000.000 (adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de uso emplea 8192. El base Qwen3.5-9B soporta hasta 262K segun su documentacion |
| Tipos de cuantizacion | Q4_K_M (GGUF fusionado) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (tanto el adaptador como el base) |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (modelo fusionado cuantizado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer denso con arquitectura hibrida (atención por ventana deslizante y atención completa) segun la documentacion oficial del base, aunque la model card del adaptador no detalla la arquitectura interna. El entrenamiento consiste en un fine-tuning supervisado (SFT) mediante LoRA con rango 64 y alpha 128, lo que añade 116 millones de parametros entrenables sobre los 8.953 millones del base. No se menciona el uso de RLHF ni DPO; es exclusivamente SFT.

El dataset de entrenamiento es privado y no se publica por razones de privacidad, copyright y confidencialidad de conversaciones personales. Segun la model card, se utilizo una mezcla de conversaciones reales de usuarios con consentimiento y datos sinteticos, con eliminacion completa de marcadores de formato, marcas de tiempo, efectos de sonido y metadatos para obtener dialogos coreanos naturales. El autor indica que se suprimio el token de thinking (id 248068) durante la generacion para evitar que el modelo razone antes de responder, lo que mejora la fluidez del roleplay.

## Capacidades

- Generacion de texto en coreano especializada en roleplay de personajes, con consistencia de persona y fidelidad a la primera persona.
- Narracion rica en emociones y descripciones, como se muestra en los ejemplos de conversacion con el personaje Paimon de Genshin.
- Supresion del modo de razonamiento (thinking) mediante la eliminacion del token 248068, lo que produce respuestas directas y naturales.
- Compatibilidad con llama.cpp, Ollama y LM Studio mediante el archivo GGUF Q4_K_M fusionado.
- Uso como adaptador PEFT con transformers y la libreria peft, cargando el base Qwen3.5-9B.
- No se documentan capacidades de tool calling, agentes, vision ni audio; es un modelo exclusivamente de texto para roleplay.

## Casos de uso

- Roleplay de personajes en coreano: el modelo mantiene la personalidad, el tono y la coherencia del personaje a lo largo de conversaciones multi-turno, como demuestra el ejemplo de Paimon. Es adecuado para juegos de rol por texto, chats de ficcion y comunidades de RP.
- Creacion de chatbots de ficcion con personalidad consistente: desarrolladores pueden integrar el adaptador o el GGUF en aplicaciones de chat para ofrecer personajes virtuales con comportamiento estable y natural en coreano.
- Escritura creativa de dialogos: escritores y guionistas pueden usarlo para generar intercambios entre personajes ficticios, aprovechando la narracion rica y la fidelidad a la primera persona.
- Juegos de rol por texto (MUD, juegos de navegador): el modelo puede generar respuestas in-character para NPCs, manteniendo el lore y las relaciones del juego gracias a su entrenamiento en roleplay.
- Asistentes de narracion interactiva: aplicaciones de ficcion interactiva donde el usuario escribe una linea y el modelo responde como el personaje, con control de la agencia del usuario (el benchmark incluye la categoria "user agency").
- Adaptacion de personajes existentes: el modelo puede usarse para recrear personajes de series, juegos o libros en coreano, siempre que se respeten los derechos de autor y las politicas de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este adaptador. El autor ha construido un benchmark propio para roleplay coreano, con 33 prompts en 8 categorias (fidelidad de personaje, lore/ambientacion, cambio de relacion, memoria a largo plazo, creatividad, agencia del usuario, naturalidad coreana y control de persona), puntuados por un juez LLM (sol) de 0 a 10 por categoria y ponderados a una escala de 100.

| Modelo | Total (100) |
|---|---|
| Base (Qwen3.5-9B) | 49.0 |
| LoRA v2 (Ckpt2000) | 54.0 |
| LoRA v2 Q4_K_M (cuantizado) | 54.2 |

Ademas, se realizo una prueba de restriccion de filtro de contenido con 50 prompts de distinta intensidad, midiendo el numero de rechazos sobre el total:

| Nivel | Base | LoRA v2 |
|---|---|---|
| Suave | 0/10 rechazos | 0/10 rechazos |
| Intimo | 0/15 rechazos | 0/15 rechazos |
| Intenso | 5/15 rechazos | 0/15 rechazos |
| Explicito | 8/10 rechazos | 0/10 rechazos |

El autor concluye que la cuantizacion Q4_K_M no degrada la calidad (54.0 frente a 54.2) y que el adaptador reduce significativamente los rechazos en contenido intenso y explicito.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el base Qwen3.5-9B en memoria. En bf16, el modelo base ocupa aproximadamente 18 GB de VRAM, mas el adaptador (116M parametros, ~0.2 GB), por lo que se necesita una GPU con al menos 20 GB (por ejemplo, RTX 3090, RTX 4090, A100 40GB).
- El archivo GGUF Q4_K_M fusionado pesa aproximadamente 6.1 GB (tamano del repositorio), por lo que cabe en GPUs consumer de 8 GB de VRAM (RTX 3060, RTX 3070, RTX 4060) con contexto moderado (8192 tokens como en el ejemplo).
- Para contexto largo (hasta 262K en el base), se necesitaria mas VRAM o cuantizaciones mas agresivas; el ejemplo oficial usa `-c 8192`.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio para el GGUF; transformers + peft para el adaptador; vLLM o TGI pueden soportar LoRA si se configuran adecuadamente, aunque no esta documentado en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En una RTX 4090 con Q4_K_M y 8192 de contexto, se puede esperar una generacion de 20-40 tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos publicos de otros adaptadores LoRA de roleplay coreano para comparar directamente. La model card incluye una comparacion cualitativa con el base y con modelos de referencia (DeepSeek-Flash y Gemma-4) en un ejemplo de conversacion, pero no hay benchmarks cuantitativos de esos modelos. La siguiente tabla resume la comparacion con el base y con el GGUF cuantizado:

| Modelo | Parametros | Contexto | Puntuacion RP (100) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8.95B | 262K (segun documentacion) | 49.0 | Apache-2.0 | safetensors |
| LoRA v2 (adaptador) | 8.95B + 116M | No especificado | 54.0 | Apache-2.0 | safetensors |
| LoRA v2 Q4_K_M | 8.95B (cuantizado) | No especificado | 54.2 | Apache-2.0 | GGUF |

Existe otro adaptador similar en Hugging Face, `johnmayhem1/qwen3.5-9b-rp-lora`, pero no se dispone de informacion sobre su rendimiento ni especificaciones, por lo que no se puede incluir en la comparativa.

## Limitaciones y advertencias

- El dataset de entrenamiento es privado y no reproducible, lo que impide verificar la calidad del ajuste o replicar los resultados.
- El modelo esta especializado exclusivamente en coreano; no se garantiza un rendimiento adecuado en otros idiomas.
- Puede generar contenido maduro o explicito, como se refleja en la prueba de filtro de contenido (0 rechazos en nivel explicito). El autor advierte que los usuarios son responsables de cumplir las leyes y politicas de plataforma aplicables.
- No se documentan capacidades de tool calling, agentes, vision ni audio; es un modelo de texto puro para roleplay.
- El adaptador requiere el modelo base Qwen3.5-9B, por lo que no funciona de forma autonoma.
- La longitud de contexto no esta especificada en la model card; el ejemplo usa 8192, pero el base soporta hasta 262K, por lo que el rendimiento con contextos largos no esta validado.
- No hay benchmarks estandar publicos (MMLU, HumanEval, etc.) para este adaptador; los resultados reportados provienen de un benchmark propio del autor, con un juez LLM que puede introducir sesgos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/www622846/qwen3.5-9b-rp-lora-v2)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repositorio de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3) (referencia del base)
