# spiritfather/Boulesis-26B-A4B-GGUF

## Resumen

Boulesis-26B-A4B es un modelo de texto experimental desarrollado por SubMaroon, orientado a roleplay y escritura creativa. Se trata de un merge sobre el modelo google/gemma-4-26B-A4B-it que combina circuitos de atención modificados: el enrutamiento QK de Pantheon-Reasoning-1.1, un head de estilo transplantado de StyleTune-V2 y una LoRA narrativa de roleplay, todo sobre una base denominada "coder3101 heretic base". El resultado es un modelo de arquitectura Mixture of Experts (MoE) con 25.971 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos.

Esta ficha se centra en la cuantización GGUF publicada por spiritfather, que contiene los pesos en formato llama.cpp para su ejecución local con herramientas como llama-server o llama-cli. El modelo está pensado para generación de texto conversacional y creativa, e incluye un modo de razonamiento ("thinking") activado por defecto. Su relevancia radica en ser un ejemplo de merge experimental para narrativa y roleplay, con cuantizaciones estáticas Q6_K y Q8_0 listas para usar en hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, basada en Gemma-4-26B-A4B-it |
| Parametros totales | 25.971.339.550 |
| Parametros activos | ~4.000 millones (A4B, según nombre del modelo base) |
| Longitud de contexto | 32.768 tokens (según comando de ejemplo en la model card) |
| Tipos de cuantizacion | Q6_K (23,2 GB), Q8_0 (27,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base, convertidos a GGUF) |

## Arquitectura y entrenamiento

El modelo base SubMaroon/Boulesis-26B-A4B es un merge experimental que parte de google/gemma-4-26B-A4B-it, un modelo MoE de 26.000 millones de parámetros con 4.000 millones activos. La técnica de merge empleada "splicea" circuitos de atención: utiliza el enrutamiento QK de Pantheon-Reasoning-1.1, un head de estilo de StyleTune-V2 y una LoRA narrativa de roleplay, todo sobre la base "coder3101 heretic base". No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

La cuantización GGUF fue creada por spiritfather a partir de los safetensors del modelo base, usando convert_hf_to_gguf.py de llama.cpp (revisión b10819) y posteriormente llama-quantize sin re-cuantizar desde un nivel inferior. El tokenizer utilizado es el de google/gemma-4-26B-A4B-it, ya que el repo original incluye un tokenizer.json de marcador de posición. La model card indica que el template de chat Gemma-4 embebido ha sido corregido para que el modo thinking funcione correctamente en llama.cpp, requiriendo los flags `--jinja` y `--no-reasoning-preserve` en el servidor.

## Capacidades

- Generación de texto conversacional y creativa, con especialización en roleplay y narrativa.
- Modo de razonamiento ("thinking") activado por defecto, que puede desactivarse por petición con `chat_template_kwargs: {"enable_thinking": false}` o limitarse con `thinking_budget_tokens` (se recomienda 1536 para roleplay).
- Soporte de template de chat Gemma-4 corregido, con pensamiento multi-turno si se sirve con `--no-reasoning-preserve`.
- Capacidad de manejar contextos largos de hasta 32.768 tokens, útil para conversaciones extensas o historias complejas.
- No se ha documentado soporte de tool calling, function calling ni capacidades de visión o audio.
- Multilingüismo no especificado en la información disponible.

## Casos de uso

- Roleplay interactivo en chats de texto: el modelo puede mantener conversaciones multi-turno con personajes ficticios, aprovechando el modo thinking para planificar respuestas y el contexto de 32K para recordar detalles de la historia.
- Generación de ficción narrativa: sirve para escribir relatos largos, capítulos o descripciones de escenas, con un head de estilo que favorece la prosa creativa.
- Simulación de personajes en juegos de texto o novelas visuales: el merge con StyleTune-V2 y la LoRA narrativa permite mantener la coherencia de voz y personalidad de un personaje a lo largo de la interacción.
- Asistente de escritura para autores: puede usarse para generar diálogos, giros argumentales o descripciones ambientales, con la opción de desactivar el thinking para respuestas más rápidas.
- Prototipado de historias interactivas: el modelo puede actuar como narrador o director de juego, adaptándose a las decisiones del usuario y manteniendo el hilo narrativo.
- Experimentación con merges de roleplay: al ser un modelo abierto y cuantizado, resulta útil para investigadores que estudian técnicas de splicing de atención o el impacto de distintos LoRAs en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está puntuado en CaliperBench, un benchmark de escritura creativa que evalúa prosa, roleplay y disposición en lugar de inteligencia general, pero los valores numéricos no se incluyen en la documentación proporcionada. Por tanto, no es posible presentar una tabla comparativa de rendimiento con datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 23,2 GB para la cuantización Q6_K y 27,6 GB para Q8_0, más overhead de KV cache y activaciones.
- GPU recomendadas: A100 80GB o H100 80GB para ejecutar cualquiera de las dos cuantizaciones con margen. Una RTX 4090 de 24GB no es suficiente para Q6_K sin offload parcial o reducción de contexto.
- En CPU: puede ejecutarse con llama.cpp, aunque la latencia será alta para un modelo de este tamaño.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) con los flags `-ngl 99 -fa on -c 32768 -ctk q8_0 -ctv q8_0 --jinja --no-reasoning-preserve`. También es compatible con Ollama si se importa el archivo GGUF, aunque no se ha verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares en la información proporcionada. El modelo base google/gemma-4-26B-A4B-it es la referencia arquitectónica, pero Boulesis-26B-A4B es un merge experimental sin equivalentes directos publicados. La comparativa con otros modelos MoE de 26B no es posible sin datos de benchmarks adicionales.

## Limitaciones y advertencias

- Modelo experimental: el merge de atención y LoRAs puede producir comportamientos impredecibles fuera del dominio de roleplay y escritura creativa.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o factualidad.
- Licencia Gemma: hereda los Gemma Terms of Use, que imponen restricciones de uso y pueden limitar ciertos despliegues comerciales; es necesario revisar los términos antes de usar el modelo en producción.
- Idioma: no se especifican los idiomas soportados; la calidad puede variar significativamente fuera del inglés.
- Contexto limitado a 32.768 tokens; conversaciones más largas requerirán gestión externa del historial.
- El modo thinking puede fallar o devolver contenido vacío si no se usan los flags correctos (`--jinja` y `--no-reasoning-preserve`), tal como advierte la model card.
- No se han publicado resultados de benchmarks, por lo que su rendimiento frente a otros modelos no está validado externamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/spiritfather/Boulesis-26B-A4B-GGUF
- Modelo base (SubMaroon/Boulesis-26B-A4B): https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Modelo base original (google/gemma-4-26B-A4B-it): https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantizaciones i1 (imatrix): https://huggingface.co/spiritfather/Boulesis-26B-A4B-i1-GGUF
- Puntuaciones en CaliperBench: https://caliperbench.com/m/boulesis-26b-a4b/
- llama.cpp: https://github.com/ggml-org/llama.cpp
