# VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16

## Resumen

Qwen3-Omni-30B-A3B-S2S-bf16 es un fine-tune speech-to-speech (audio a audio) del modelo Qwen3-Omni-30B-A3B-Instruct, desarrollado por VikramPal. El objetivo es adaptar el modelo base para mantener conversaciones habladas de extremo a extremo, sin necesidad de transcribir el audio a texto intermedio. Se entrenó únicamente el componente Thinker (31,72 mil millones de parámetros) mediante QLoRA con rango 16, mientras que el Talker y el decodificador de audio code2wav (3,54 mil millones de parámetros) permanecieron congelados y bit-idénticos al checkpoint base.

El resultado es un modelo MoE (Mixture of Experts) con 35,26 mil millones de parámetros totales y aproximadamente 3 mil millones activos, licenciado bajo Apache-2.0 y disponible en formato safetensors. El entrenamiento fue extremadamente ligero: 500 pasos de optimización con batch efectivo 16, sobre 10 horas de audio, completado en 30 minutos en dos GPUs. La relevancia de este modelo radica en demostrar que es posible adaptar un sistema omni-modal de gran tamaño con recursos mínimos, y en servir como banco de pruebas para la cuantización selectiva DynQuant, que asigna precisión según la importancia de cada módulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con componentes Thinker, Talker y code2wav |
| Parametros totales | 35.259.818.545 |
| Parametros activos | 3.000.000.000 (aprox., segun modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, DynQuant 4-bit, DynQuant 3-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-Omni-30B-A3B-Instruct: un transformer MoE con tres etapas diferenciadas. El Thinker procesa las entradas multimodales (audio, texto, imagen, video) y decide la respuesta; el Talker genera los tokens de habla discretos; y code2wav convierte esos tokens en forma de onda de audio. En este fine-tune solo se entrenó el Thinker mediante QLoRA (rank 16) sobre las proyecciones de atención y las MLP densas, con el Talker y code2wav congelados. El entrenamiento usó 10 horas de diálogo hablado, 500 pasos con batch efectivo 16, y se completó en 30 minutos en dos GPUs.

La innovación técnica destacable es el uso de DynQuant v0.5.0 para la cuantización selectiva. DynQuant calcula un mapa de señal basado en la varianza del gradiente y el RMS de las activaciones de cada módulo, y un asignador de ROI consciente del rol distribuye la precisión. En este caso, la asignación se calculó sobre el Thinker y se aplicó al modelo completo, dejando las otras dos etapas en bf16. Esto permite reducir el tamaño del modelo de 65,69 GiB (bf16) a 21,38 GiB (4-bit) o 17,68 GiB (3-bit) sin tocar los componentes de audio.

## Capacidades

- Conversación speech-to-speech de extremo a extremo: entrada de audio a 16 kHz y salida de audio a 24 kHz, sin paso intermedio por texto.
- Soporte de system prompts y conversaciones multi-turno con contexto hablado.
- Integración con el ecosistema transformers mediante la clase Qwen3OmniMoeForConditionalGeneration.
- Selección de voz de salida mediante el parámetro speaker (por ejemplo, "Ethan").
- Capacidades multimodales heredadas del modelo base (texto, audio, imagen, video), aunque el fine-tune se centra en audio.
- No se ha confirmado soporte de tool calling, modo thinking ni capacidades de agente en este fine-tune.

## Casos de uso

- Asistente de voz para atención al cliente: el modelo puede gestionar conversaciones habladas multi-turno de forma natural, respondiendo con audio sintetizado sin necesidad de un pipeline de ASR + LLM + TTS. Su licencia Apache-2.0 permite integración comercial.
- Doblaje automático de vídeos: dado un audio de entrada, el modelo puede generar una respuesta hablada en el idioma del sistema prompt, lo que permite crear doblajes o respuestas automáticas para contenidos multimedia.
- Prototipos de agentes conversacionales por voz: al ser un fine-tune ligero y rápido de entrenar, es adecuado para experimentar con interacciones habladas en entornos de investigación o desarrollo de productos.
- Transcripción y respuesta hablada en entornos hands-free: aplicaciones de asistencia en movilidad, donde el usuario habla y recibe respuesta por audio sin mirar una pantalla.
- Investigación en fine-tuning eficiente de modelos omni-modales: el proceso de entrenamiento (30 minutos, QLoRA, 10 horas de audio) sirve como referencia metodológica para adaptar modelos grandes con pocos recursos.
- Evaluación de cuantización selectiva: las variantes DynQuant 4-bit y 3-bit permiten estudiar el impacto de la precisión reducida en la calidad de la salida de audio, comparando con la versión bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe ninguna metrica de precision, ni comparacion A/B contra el checkpoint base, ni estudios de escucha. Solo se realizo una prueba de humo con 4 clips por variante, que verifico que los tres brazos (bf16, 4-bit, 3-bit) producen audio sin silencios ni fallos de carga, pero no mide calidad.

## Requisitos de hardware

- Version bf16 (65,69 GiB en disco): requiere al menos 70 GB de VRAM para inferencia, por lo que necesita una GPU A100 80GB, H100 80GB o multiples GPUs con offload.
- Version DynQuant 4-bit (21,38 GiB): cabe en GPUs de consumo con 24 GB de VRAM, como RTX 4090, o en GPUs profesionales como A10G o L40S. Se recomienda al menos 24 GB para dejar margen para la cache de atencion.
- Version DynQuant 3-bit (17,68 GiB): tambien cabe en GPUs de 24 GB, con algo mas de margen que la version 4-bit.
- Despliegue: se puede cargar con transformers usando device_map="auto" y dtype bfloat16. No se ha confirmado compatibilidad con vLLM, TGI o llama.cpp para este fine-tune especifico.
- Latencia y throughput: no disponibles. El modelo base MoE con 3B activos es relativamente eficiente, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-S2S-bf16 (este) | 35,26B | 3B | no disponible | Apache-2.0 | Speech-to-speech fine-tune |
| Qwen3-Omni-30B-A3B-Instruct (base) | 35,26B | 3B | no disponible | Apache-2.0 | Omni-modal instruct general |
| Qwen3-Omni-30B-A3B-Thinking | 35,26B | 3B | no disponible | Apache-2.0 | Solo Thinker con razonamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos. La unica diferencia documentada es que este fine-tune entrena el Thinker sobre dialogo hablado, mientras que el base es un instruct general y el Thinking se centra en razonamiento. No hay informacion sobre otros modelos speech-to-speech comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No existe ninguna metrica de calidad: la model card admite que no se realizaron benchmarks, comparaciones A/B ni estudios de escucha. La unica validacion es una prueba de humo con 4 clips por variante.
- El entrenamiento fue de una sola epoca sobre 10 horas de dialogo hablado, lo que limita la generalizacion a dominios o estilos de habla no vistos.
- El Talker nunca fue entrenado, por lo que la voz de salida mantiene el comportamiento del checkpoint base, que puede no estar optimizado para el dialogo conversacional.
- Riesgo de alucinaciones de audio: el modelo puede generar respuestas coherentes pero incorrectas, especialmente en contextos ambiguos o con ruido de entrada.
- No se ha confirmado el soporte de idiomas: aunque el modelo base Qwen3-Omni es multilingue, este fine-tune no documenta que idiomas mantiene o degrada.
- La cuantizacion DynQuant 3-bit y 4-bit puede degradar la calidad del audio generado, aunque la prueba de humo no detecto fallos graves.
- Para uso en produccion, se recomienda realizar una evaluacion exhaustiva con datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Adapter QLoRA: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA
- Version DynQuant 4-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit
- Version DynQuant 3-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit
- Repositorio DynQuant: https://github.com/kambojvikram/dynquant
