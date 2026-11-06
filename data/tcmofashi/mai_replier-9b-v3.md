# tcmofashi/mai_replier-9b-v3

## Resumen

mai_replier-9b-v3 es un ajuste fino (fine-tuning) del modelo Qwen3.5-9B desarrollado por el usuario tcmofashi, orientado a un caso de uso muy concreto: actuar como "replier" (respondedor) dentro de MaiBot, un ecosistema de bots para grupos de QQ. El modelo recibe un contexto de conversacion de grupo renderizado en un formato propietario denominado "retro replyer" (system con la persona del personaje y user con la plantilla completa de la conversacion) y devuelve una unica respuesta breve y coloquial, sin cadena de pensamiento intermedia. Es, por tanto, un modelo de rol conversacional en chino, no un asistente generalista.

Tecnicamente hereda la arquitectura de Qwen3.5-9B: un transformer hibrido con 24 capas de atencion lineal GDN (Gated DeltaNet) y 8 capas de atencion completa, con un vocabulario de 248.320 tokens y 9.409.813.744 parametros totales en bf16 (unos 18 GB). El ajuste se realizo mediante LoRA SFT con r=64 y alpha=32, posteriormente fusionado en los pesos completos, de modo que el repositorio es "listo para usar" con transformers o vLLM. Ademas incorpora capacidad multimodal de tipo "interleaved image": las imagenes se insertan como partes dentro del mensaje de usuario, en la posicion exacta del historial donde aparecieron.

Su relevancia es acotada pero clara: cubre un nicho (bots de rol para grupos de mensajeria) donde los modelos generalistas suelen fallar por verbosidad, por romper el personaje o por generar respuestas demasiado largas. La licencia Apache-2.0 y la disponibilidad de pesos en safetensors facilitan su despliegue y su inspeccion, aunque el modelo solo declara soporte para chino y su publico objetivo es la comunidad de MaiBot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 (`Qwen3_5ForConditionalGeneration`): 24 capas de atencion lineal GDN + 8 capas de atencion completa |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, bf16, ~18 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer hibrido que combina capas de atencion lineal GDN con capas de atencion completa (24 + 8 capas respectivamente) y un vocabulario de 248.320 tokens. Esta mezcla busca reducir el coste computacional del contexto largo manteniendo la calidad de recuperacion de informacion de la atencion completa. El ajuste fino se realizo mediante LoRA SFT con rango 64 y alpha 32 sobre el modelo base, y los adaptadores se fusionaron posteriormente en los pesos completos, por lo que el checkpoint publicado no requiere cargar adaptadores adicionales.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si se documenta es el formato exacto de entrenamiento: pares system/user con la persona del personaje y la plantilla "retro replyer", renderizados con la version maibot-dev-retro-v6_2@3a09e4cca2ae. El modelo se entrena explicitamente con `enable_thinking=False`, es decir, sin cadena de pensamiento: la salida del asistente es directamente la respuesta. Tambien se documenta el tratamiento multimodal: las imagenes se insertan como partes intercaladas en el array de contenido del mensaje de usuario, con una regla de escalado que conserva 640 px de lado mayor en las tres imagenes mas recientes y reduce a 128 px las anteriores.

## Capacidades

- Generacion de texto conversacional breve en chino, con estilo coloquial y adecuacion a una persona definida en el system prompt.
- Roleplay consistente: mantiene el nombre del personaje, sus alias y las restricciones de estilo indicadas en el prompt.
- Comprension de contexto de grupo: distingue las intervenciones propias (marcadas como `{角色名}(你)`) de las del resto de participantes.
- Interpretacion de eventos estructurados del chat: citas de mensajes (`[回复了...]`), menciones (`@usuario`), stickers (`[表情包: nombre]`) y eventos como retirada de mensajes.
- Multimodalidad de imagenes intercaladas: procesa imagenes insertadas en la posicion exacta del historial donde se enviaron.
- Generacion sin cadena de pensamiento: respuestas directas, lo que reduce latencia y evita filtraciones de razonamiento interno.
- Soporte de "planner guidance" opcional: el prompt permite inyectar una guia de planificacion antes de la respuesta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso ni de razonamiento extendido.
- Capacidad multilingue limitada al chino segun la model card.

## Casos de uso

- Bot de rol en grupos de QQ: el caso de uso disenado. El modelo consume el historial renderizado en formato retro replyer y emite una sola frase coherente con el personaje, lo que encaja con la dinamica de un grupo de mensajeria donde las respuestas largas rompen el ritmo.
- Comunidades de roleplay y fan fiction interactiva: permite definir personajes con personalidad, alias y estilo mediante el system prompt, y mantener la coherencia a lo largo de conversaciones multi-turno dentro de la ventana de contexto configurada (8192 tokens en el ejemplo de vLLM).
- Moderacion conversacional ligera y acompanamiento: al respetar instrucciones explicitas de evitar contenido ilegal, sexual, violento o politico, puede emplearse como capa de respuesta en comunidades que requieren un tono controlado.
- Respuesta contextual a imagenes compartidas en el chat: gracias a la insercion intercalada de imagenes, el modelo puede comentar una imagen en el punto del historial donde aparecio, util en grupos donde se comparten capturas o memes.
- Prototipado rapido de asistentes de comunidad: con licencia Apache-2.0 y pesos en safetensors, sirve como base para experimentar con nuevas personas o estilos mediante ajuste adicional, sin partir de cero.
- Investigacion sobre formato de prompt y fidelidad de personaje: el modelo es un caso de estudio util para medir como el formato de renderizado (lineas de historial, marcado de eventos, posicion de imagenes) afecta a la calidad de la respuesta en tareas de rol.
- Despliegue en infraestructura propia con vLLM: el ejemplo oficial de servicio permite exponer el modelo como endpoint compatible con la API de OpenAI, integrandolo en pipelines existentes de bots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado. El ejemplo oficial de vLLM usa `--gpu-memory-utilization 0.90`.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion, que no esta documentada oficialmente en el repositorio.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`) y vLLM (`vllm serve ... --max-model-len 8192`). No se documentan llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles. La ausencia de cadena de pensamiento y el limite de `max_tokens=256` reducen la longitud de salida y, por tanto, el coste por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mai_replier-9b-v3 | 9,4 B | no disponible (ejemplo a 8192) | zh | Apache-2.0 | Rol en grupos de QQ, multimodal intercalado |
| Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | multilingue (segun modelo base) | no disponible en esta ficha | Asistente generalista |
| Modelos de rol comunitarios de ~7-9 B | variable | variable | normalmente zh/en | variable | Roleplay generico sin formato de chat de grupo |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados para este ajuste ni datos de contexto del modelo base en la documentacion consultada. La diferencia principal frente al Qwen3.5-9B base es la especializacion en formato (retro replyer), la ausencia de cadena de pensamiento y la integracion multimodal intercalada; frente a otros modelos de rol comunitarios, la ventaja es la licencia Apache-2.0 y la publicacion de pesos fusionados listos para servir.

## Limitaciones y advertencias

- Modelo especializado: fuera del formato retro replyer y del contexto de chat de grupo, su calidad degrada de forma previsible; no es un asistente generalista.
- Solo chino: la model card declara unicamente `zh`; no hay evidencia de buen rendimiento en castellano u otros idiomas.
- Riesgo de alucinacion y de salida de personaje: al no usar cadena de pensamiento, no hay mecanismo interno de verificacion; las respuestas pueden inventar detalles del historial o romper la persona.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el entrenamiento sobre conversaciones de grupo puede reproducir tonos, jerga o dinamicas sociales de esas comunidades.
- Filtros de contenido delegados al prompt: la model card incluye instrucciones de evitar contenido ilegal, sexual, violento o politico, pero no se documenta un filtro a nivel de modelo ni evaluaciones de robustez frente a jailbreaks.
- Contexto limitado en la practica: aunque el modelo base pueda soportar ventanas mayores, el ejemplo de despliegue fija 8192 tokens; historiales de grupo largos requeriran truncado o resumen previo.
- Cuantizacion no oficial: no se publican pesos GGUF ni AWQ/GPTQ, por lo que el despliegue en GPUs de menos de 24 GB exige cuantizar por cuenta propia y validar la calidad.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un experimento comunitario sin validacion externa conocida.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el autor lo describe como "producto experimental comunitario" y las salidas no representan opiniones de personas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tcmofashi/mai_replier-9b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
