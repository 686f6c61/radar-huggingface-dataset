# VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit

## Resumen

El modelo `VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit` es un fine-tune speech-to-speech del modelo Qwen3-Omni-30B-A3B-Instruct de Alibaba, cuantizado posteriormente a una media de 3,00 bits por peso mediante la técnica DynQuant. El objetivo es ofrecer una versión compacta y desplegable en hardware limitado de un asistente de voz de extremo a extremo, manteniendo la capacidad de recibir audio y responder con audio sintetizado.

El autor, VikramPal, entrenó únicamente el componente Thinker (la parte que procesa la entrada y decide la respuesta) mediante QLoRA con rango 16, dejando congelados el Talker y el decodificador de audio `code2wav`. Sobre ese merge en bf16 se aplicó una cuantización DynQuant dirigida por una señal de importancia basada en la varianza del gradiente y el RMS de activaciones. El resultado es un artefacto de 17,68 GiB en disco, con 6.765.592.145 parámetros en safetensors, que requiere el registro del quantizer DynQuant para cargarse.

La relevancia de este modelo radica en que demuestra la viabilidad de cuantizar agresivamente (3 bits) un modelo MoE multimodal de voz sin destruir por completo su capacidad de generar respuestas fluidas, aunque el propio autor advierte que no se han realizado mediciones objetivas de calidad y que la cuantización está por debajo del presupuesto mínimo de bits de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer con componentes de audio (Thinker, Talker, code2wav) |
| Parametros totales | 30B (modelo base, MoE); el repo cuantizado contiene 6.765.592.145 parametros en safetensors (solo Thinker cuantizado) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 3-bit (3,00 bits por peso promedio); tambien existen versiones bf16 y DynQuant 4-bit |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado con DynQuant, requiere registro del quantizer) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-Omni-30B-A3B, un transformer MoE con 30 mil millones de parametros totales y 3 mil millones activos por token. La variante original de Qwen soporta entradas multimodales (texto, audio, imagen y video) y salida de audio. En este fine-tune, el autor entrena exclusivamente el componente Thinker, que es la parte encargada de procesar la entrada y generar las decisiones de respuesta. El Talker y el decodificador `code2wav` permanecen congelados y bit-identicos al checkpoint base.

El entrenamiento se realizo con QLoRA (rango 16) sobre las proyecciones de atencion y las capas densas del MLP, durante 500 pasos de optimizador con batch efectivo de 16, utilizando 10 horas de audio y completandose en 30 minutos con 2 GPUs. Posteriormente, se aplico DynQuant v0.5.0, un metodo de cuantizacion que asigna bits por modulo basandose en una señal de importancia calculada a partir de la varianza del gradiente y el RMS de activaciones registrados durante el fine-tune. La cuantizacion se aplico solo al Thinker, dejando los otros dos componentes en bf16.

## Capacidades

- Conversacion speech-to-speech: recibe audio de entrada (16 kHz) y genera audio de salida (24 kHz) con una voz seleccionable (por ejemplo, "Ethan").
- Comprension de audio: el modelo puede responder a preguntas habladas, como se demostro en una prueba con una pregunta sobre la *Republica* de Platon.
- Generacion de texto: al ser una variante del Qwen3-Omni, conserva la capacidad de generar respuestas textuales si se le proporciona entrada de texto.
- Integracion con transformers: se carga mediante `Qwen3OmniMoeForConditionalGeneration` y `AutoProcessor`, con soporte para `apply_chat_template`.
- Cuantizacion agresiva: el uso de DynQuant permite reducir el peso del modelo a 17,68 GiB, frente a los 65,69 GiB del merge en bf16.

## Casos de uso

- Asistente de voz en dispositivos con recursos limitados: gracias a la cuantizacion a 3 bits, el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, permitiendo desplegar un asistente conversacional por voz en entornos sin acceso a clusters de GPU.
- Prototipado rapido de agentes de voz: al ser un modelo any-to-any, se puede integrar en pipelines de voz para probar interacciones habladas sin necesidad de un sistema de TTS/ASR separado.
- Investigacion sobre cuantizacion extrema: el modelo sirve como caso de estudio para evaluar el impacto de cuantizaciones por debajo del presupuesto minimo en modelos MoE multimodales, especialmente en la degradacion de la comprension auditiva.
- Evaluacion de robustez de modelos cuantizados: los datos del smoke probe (4 clips por rama) permiten comparar el comportamiento de la version 3-bit frente a la 4-bit y la bf16 en tareas de respuesta hablada.
- Desarrollo de interfaces de voz para entornos controlados: en aplicaciones donde no se requiere un rechazo estricto de peticiones peligrosas, el modelo puede ofrecer respuestas fluidas y gramaticalmente correctas.
- Educacion y demostracion: por su tamano reducido, puede utilizarse en talleres o cursos para ilustrar tecnicas de cuantizacion y fine-tune de modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye unicamente un smoke probe con 4 clips held-out por rama, sin metricas de precision ni comparacion A/B contra el checkpoint base. Los datos del probe son:

| Rama | Clips | Silencios | Mediana de tokens nuevos | Audio generado |
|---|---|---|---|---|
| bf16 merge | 4 | 0 | 39 | 45,4 s |
| DynQuant 4-bit | 4 | 0 | 21 | 37,6 s |
| DynQuant 3-bit | 4 | 0 | 28 | 30,5 s |

El autor advierte explicitamente que este probe no mide calidad y que no puede distinguir entre "tan bueno como bf16" y "notablemente peor pero coherente".

## Requisitos de hardware

- VRAM estimada: el Thinker cuantizado a 3 bits ocupa aproximadamente 17,68 GiB en disco; sumando el Talker y `code2wav` en bf16 (3,54 mil millones de parametros, unos 7 GB), se estima un requisito minimo de 24-32 GB de VRAM para inferencia completa.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En GPUs con menos de 24 GB no se recomienda su uso.
- Compatibilidad con GPU de consumo: si, siempre que se disponga de al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090).
- Opciones de despliegue: el modelo se carga con `transformers` y requiere el registro del quantizer DynQuant (`dynquant.register_hf_quantizer()`). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El smoke probe muestra una mediana de 28 tokens nuevos por respuesta en la rama 3-bit, pero sin mediciones de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales, 3B activos | no disponible | bf16 | Apache-2.0 | Hugging Face |
| VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit | 30B totales, 3B activos | no disponible | DynQuant 4-bit | Apache-2.0 | Hugging Face |
| VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit | 30B totales, 3B activos | no disponible | DynQuant 3-bit | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos speech-to-speech comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No existe ninguna metrica de precision: el autor declara que no se realizaron benchmarks, pruebas A/B ni estudios de escucha. El unico control es un smoke probe de 4 clips que solo verifica que el modelo no produce silencio ni incoherencias graves.
- La cuantizacion a 3,00 bits esta por debajo del presupuesto minimo de la arquitectura (3,4210 bits por peso). Esto provoca que 394 de 650 modulos superen su presupuesto y 125 se reduzcan a 2 bits.
- Los modulos mas afectados son las proyecciones de atencion del audio tower (q, k, v) a 2 bits, que son la via por la que el modelo escucha. Esto puede degradar la comprension auditiva.
- El autor observo una divergencia en el comportamiento de rechazo: en una prueba donde las otras ramas declinaban dar una direccion personal, la version 3-bit ofrecio ayuda para encontrarla. Esto sugiere que la instruccion y el rechazo se degradan antes que la fluidez.
- No se recomienda su despliegue en produccion en entornos donde el rechazo de peticiones peligrosas sea critico.
- El modelo requiere el registro del quantizer DynQuant, lo que anade una dependencia externa no estandar en el ecosistema transformers.
- Los idiomas soportados no estan documentados; el modelo base es multilingue, pero no se garantiza el comportamiento en todos los idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Adapter QLoRA: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA
- Merge bf16: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16
- Version DynQuant 4-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit
- Repositorio de DynQuant: https://github.com/kambojvikram/dynquant
- Documentacion de variantes del modelo base: https://deepwiki.com/QwenLM/Qwen3-Omni/3.1-model-variants
