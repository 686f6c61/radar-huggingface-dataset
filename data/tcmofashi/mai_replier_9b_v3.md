# tcmofashi/mai_replier_9b_v3

## Resumen

mai_replier_9b_v3 es un adaptador LoRA publicado por el usuario tcmofashi dentro del ecosistema MaiBot, un proyecto de bots conversacionales para grupos de QQ. No se trata de un modelo completo, sino de un adaptador de 465 MB que se monta sobre una base homóloga a Qwen3.5-9B (denominada v7-base en la documentación del autor) para especializarla en la tarea de "respondedor" de grupo: leer el historial de un chat de QQ y emitir una única frase breve y coloquial que encaje con una personalidad definida en el mensaje de sistema.

El adaptador se entrena mediante LoRA SFT con r=64, alpha=32 y dropout=0.1 sobre las proyecciones q/k/v/o y gate/up/down, y su rasgo diferencial es el soporte multimodal con imágenes intercaladas: cada imagen se inserta en la posición exacta de la intervención que la contenía, en lugar de agruparse al final del contexto. El modelo opera sin cadena de pensamiento (`enable_thinking=False`) y está pensado para producir respuestas de una sola línea, con un límite práctico de 256 tokens de salida.

Su relevancia es acotada pero específica: cubre un nicho poco atendido, el de los agentes conversacionales de grupo con contexto visual y formato de renderizado propio, y lo hace sobre una licencia Apache 2.0. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, no publica benchmarks y su idioma declarado es exclusivamente el chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre base homóloga a Qwen3.5-9B (`qwen3_5_text`): 24 capas de linear attention GDN + 8 capas de full attention, vocab 248320 |
| Parámetros totales | No disponible (el adaptador pesa 465 MB; el tamaño del modelo base no se detalla en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors F32) |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre una base con arquitectura híbrida de atención: 24 capas de linear attention del tipo GDN (Gated Delta Net) combinadas con 8 capas de full attention, un vocabulario de 248320 tokens y una estructura de módulos compatible con Qwen3.5-9B. El entrenamiento es un LoRA SFT con rango 64, alpha 32 y dropout 0.1, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. En la práctica se materializan 256 tensores en F32: las proyecciones q/k/v/o de las 8 capas de full attention y las gate/up/down de las 32 capas totales, ya que las capas de atención lineal usan nombres de proyección distintos que no coinciden con el sufijo de destino.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el formato de entrada: el "retro replyer" con renderizado de historial de chat y la inserción intercalada de imágenes en la posición de la intervención correspondiente, con una regla de escalado que mantiene las tres imágenes más recientes a 640 píxeles de lado mayor y reduce las anteriores a 128 píxeles. El adaptador se entrena con `enable_thinking=False`, de modo que el razonamiento queda internalizado y la salida es directamente la frase de respuesta.

## Capacidades

- Generación de texto conversacional breve en chino, orientada a una única intervención por turno.
- Interpretación de contexto de grupo de QQ renderizado en formato retro: marcas de tiempo, referencias a mensajes citados, menciones `@`, emoticonos, stickers y eventos del sistema (retirada de mensajes, reacciones).
- Diferenciación entre las intervenciones propias del bot (marcadas como `{角色名}(你)`) y las del resto de participantes.
- Procesamiento multimodal con imágenes intercaladas en la posición de la intervención que las contenía, incluyendo degradación a marcador textual `[图片]` cuando la imagen no está disponible.
- Adopción de una personalidad definida en el mensaje de sistema (nombre, alias, rasgos de carácter, muletillas, identidad).
- Seguimiento de instrucciones de estilo de respuesta inyectadas en el mensaje de usuario.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso explícito.
- Sin soporte de audio ni de otros idiomas distintos del chino.

## Casos de uso

- Moderación conversacional ligera en grupos de QQ: el adaptador puede leer el historial renderizado y emitir una intervención breve que reconduzca el tema, aprovechando su comprensión del formato de eventos y menciones del ecosistema MaiBot.
- Bots de rol y acompañamiento en comunidades de chat: al recibir una personalidad en el mensaje de sistema, genera respuestas coherentes con el personaje y con el tono del grupo, lo que permite desplegar varios bots con personalidades distintas sobre la misma base.
- Respuesta a mensajes con imágenes compartidas: la inserción intercalada permite que el bot comente una captura o foto en el momento en que aparece en la conversación, en lugar de recibir todas las imágenes agrupadas y perder la referencia temporal.
- Integración en pipelines de MaiBot existentes: el adaptador encaja directamente en el rol de "replier" del ecosistema, sustituyendo al modelo genérico y reduciendo la necesidad de prompts de formato extensos.
- Investigación sobre formato de contexto en agentes conversacionales: sirve como punto de comparación para estudiar cómo afecta la posición de las imágenes en el contexto a la calidad de la respuesta en diálogos multi-turno.
- Generación de respuestas de bajo coste en producción: al ser un adaptador de 465 MB sobre una base de 9B, permite servir muchas personalidades compartiendo una única instancia del modelo base y conmutando adaptadores.
- Prototipado rápido de personajes: el formato system/user permite definir un personaje nuevo sin reentrenar, lo que facilita pruebas de concepto de comunidades y productos de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 465 MB, pero requiere cargar la base homóloga a Qwen3.5-9B en bf16, lo que implica del orden de 18 GB de VRAM solo para los pesos del modelo base; la cifra exacta no se detalla en la información proporcionada.
- GPU recomendadas: A100 40 GB o H100 para servir la base completa en bf16 con margen para el contexto y las imágenes; en consumer, una RTX 4090 de 24 GB puede alojar la base en bf16 de forma ajustada, y una RTX 3090 de 24 GB o una RTX 4080 de 16 GB requerirían cuantización.
- Con cuantización de 8 bits la base cabría en GPUs de 16 GB; con 4 bits, en GPUs de 12 GB, si bien no se documentan recetas de cuantización específicas para este adaptador.
- Despliegue: el autor documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`) y menciona el despliegue con vLLM, indicando que debe ajustarse `--limit-mm-per-prompt` (por ejemplo, `{"image": 8}`) para permitir varias imágenes por petición. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Idiomas | Licencia | Multimodal |
|---|---|---|---|---|---|---|
| mai_replier_9b_v3 | LoRA SFT sobre base de 9B | Qwen3.5-9B homóloga (v7-base) | No disponible | zh | Apache 2.0 | Sí, imágenes intercaladas |
| Qwen3.5-9B (base oficial) | Modelo completo | — | No disponible | No disponible | No disponible | No disponible |
| Adaptadores LoRA de rol sobre Qwen | LoRA SFT | Qwen | No disponible | zh/en | Variable | Habitualmente no |

No se dispone de datos de benchmarks ni de modelos directamente comparables publicados en la información proporcionada; la comparación se limita a la naturaleza del artefacto (adaptador frente a modelo completo) y a la licencia.

## Limitaciones y advertencias

- El repositorio contiene únicamente el adaptador LoRA: no es utilizable sin cargar una base homóloga a Qwen3.5-9B, y el `adapter_config.json` apunta a una ruta interna de entrenamiento (`/data/cmp03/v7-base-mm`) que debe sobrescribirse.
- El autor advierte de que montar el adaptador sobre el `Qwen/Qwen3.5-9B` oficial funciona a nivel estructural pero no corresponde a la configuración de publicación; el comportamiento puede degradarse.
- Idioma limitado al chino; no hay evidencia de competencia en castellano ni en otros idiomas.
- Riesgo de alucinación y de salida fuera de personaje inherente a un SFT de respuestas cortas; el prompt incluye instrucciones explícitas para evitar contenido ilegal, sexual, violento o político, lo que indica que el filtrado se delega al prompt y no a un alignment específico.
- El modelo está entrenado para emitir una sola frase; no es adecuado para tareas de razonamiento largo, generación de código ni documentos extensos.
- Sin datos publicados de benchmarks, evaluación de sesgos ni pruebas de robustez; cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia de la base sobre la que se monta para uso comercial.
- El formato de entrada es rígido: requiere el renderizado retro exacto (system + user con plantilla completa) y los parámetros de muestreo documentados (`temperature=0.7`, `top_p=0.95`, `repetition_penalty=1.15`, `max_tokens=256`, `eos_token_id=[248046, 248044]`); desviarse de ellos puede producir respuestas truncadas o repetitivas.
- El pipeline de imágenes exige respetar la regla de escalado (640 px para las tres últimas, 128 px para las anteriores) para mantener la coherencia con el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/tcmofashi/mai_replier_9b_v3
- Repositorio MaiBot: https://github.com/MaiM-with-u/MaiBot
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
