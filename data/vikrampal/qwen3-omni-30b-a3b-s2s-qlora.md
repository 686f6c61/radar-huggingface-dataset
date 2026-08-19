# VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA

## Resumen

El adaptador QLoRA VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA es un fine-tune speech-to-speech del modelo Qwen3-Omni-30B-A3B-Instruct de Alibaba. Desarrollado por VikramPal, este adaptador entrena únicamente el módulo Thinker del modelo (la parte que escucha y decide qué decir) mientras congela el Talker y el codec decoder (code2wav). El resultado es un modelo que puede recibir audio de entrada y generar audio de salida de forma nativa, sin pasar por texto intermedio.

El adaptador pesa solo 0.1 GB y se aplica sobre el checkpoint base. El autor también publica versiones fusionadas en bf16 (65.69 GB) y cuantizadas con DynQuant a 4 bits (21.38 GB) y 3 bits (17.68 GB). El entrenamiento fue breve: 500 pasos con batch efectivo 16, sobre 10 horas de diálogo hablado, en 30 minutos de cómputo. No se publicaron métricas de calidad, solo una prueba de humo que verifica que el modelo no queda destruido tras la cuantización.

La relevancia de este modelo radica en demostrar un flujo de fine-tune speech-to-speech con QLoRA sobre un modelo omni de 30B parámetros, con un coste de entrenamiento muy bajo, y en ofrecer versiones cuantizadas que caben en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, con módulos Thinker, Talker y code2wav |
| Parametros totales | 30B (modelo base); el Thinker entrenado tiene 31.72B según la model card |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | Adaptador QLoRA (bf16); merges disponibles en bf16, DynQuant 4-bit y 3-bit |
| Idiomas soportados | No disponible (el modelo base Qwen3-Omni soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador y merges) |

Nota: la model card indica que el Thinker tiene 31.72B parámetros y las etapas congeladas (Talker + code2wav) suman 3.54B, lo que daría un total de ~35.26B. Sin embargo, el nombre oficial del modelo base es 30B-A3B. Esta discrepancia no está aclarada en la documentación.

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni-30B-A3B-Instruct es un transformer MoE con 30B parámetros totales y 3B activos por token. Está compuesto por tres etapas: el Thinker (que procesa entradas multimodales y genera decisiones), el Talker (que convierte las decisiones en tokens de habla discretos) y el codec decoder code2wav (que sintetiza la forma de onda de audio). El adaptador QLoRA entrena exclusivamente el Thinker con rango 16 sobre las proyecciones de atención y las MLP densas, dejando el Talker y code2wav congelados y bit-idénticos al checkpoint base.

El entrenamiento usó QLoRA (quantized LoRA) con 500 pasos de optimización, batch efectivo de 16 distribuido en 2 GPUs, sobre 10 horas de diálogo hablado. El tiempo total de cómputo fue de 30 minutos. El autor no detalla la composición del dataset ni si se usó RLHF o DPO. La cuantización DynQuant se aplicó solo al Thinker, con un asignador de regiones basado en la varianza del gradiente y el RMS de activaciones registrados durante el fine-tune.

## Capacidades

- Conversión speech-to-speech: recibe audio de entrada (16 kHz) y genera audio de salida (24 kHz) de forma nativa, sin transcripción intermedia.
- Comprensión multimodal: al estar basado en Qwen3-Omni, hereda la capacidad de procesar texto, audio, imagen y vídeo, aunque el fine-tune se centró en diálogo hablado.
- Generación de voz con selección de hablante: el código de ejemplo permite elegir el perfil de voz ("speaker").
- Interacción conversacional: el adaptador se entrenó en diálogo hablado, por lo que responde de forma natural y breve en contextos de voz.
- Compatible con el ecosistema transformers: se carga con Qwen3OmniMoeForConditionalGeneration y AutoProcessor.
- Cuantización DynQuant: versiones de 4 y 3 bits que reducen el tamaño a 21.38 GB y 17.68 GB respectivamente, manteniendo la salida de voz (según la prueba de humo).

## Casos de uso

- Asistentes de voz en dispositivos edge: con la versión DynQuant 3-bit (17.68 GB), el modelo puede ejecutarse en una GPU de consumo como una RTX 4090 (24 GB) para ofrecer un asistente conversacional que responde de viva voz sin depender de servicios en la nube.
- Atención al cliente telefónica automatizada: el modelo puede gestionar llamadas de soporte, entendiendo el audio del cliente y respondiendo con voz sintetizada, gracias a su pipeline speech-to-speech de extremo a extremo.
- Subtitulación y doblaje en tiempo real: al aceptar audio de entrada y generar audio de salida, puede usarse para traducir o doblar contenido hablado manteniendo el flujo de voz.
- Prototipado de agentes conversacionales multimodales: investigadores pueden usar el adaptador como base para experimentar con fine-tunes adicionales sobre el Thinker, aprovechando el bajo coste de entrenamiento (30 minutos).
- Evaluación de cuantización en modelos omni: las versiones DynQuant permiten estudiar el impacto de la cuantización agresiva (3 y 4 bits) en la calidad de la salida de voz, comparando con el merge bf16.
- Integración en pipelines de generación de contenido: el modelo puede combinarse con herramientas de transcripción o síntesis para crear flujos de voz a voz en aplicaciones de entretenimiento o educación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay métricas de precisión, ni comparaciones A/B contra el checkpoint base, ni estudios de escucha. La única validación es una prueba de humo con 4 clips por brazo (bf16, DynQuant 4-bit y 3-bit) que verificó que los tres producen habla no silenciosa y coherente, con medianas de 21-39 tokens nuevos y 30-45 segundos de habla emitida. Esto no constituye una medida de calidad.

## Requisitos de hardware

- El adaptador QLoRA en sí ocupa 0.1 GB, pero requiere cargar el modelo base completo (Qwen3-Omni-30B-A3B-Instruct) para aplicarlo.
- Merge bf16: 65.69 GB en disco. Para inferencia se recomienda una GPU con al menos 80 GB de VRAM (A100 80GB, H100) o varias GPUs en paralelo.
- DynQuant 4-bit: 21.38 GB en disco. Cabe en una RTX 4090 (24 GB) o A6000 (48 GB) con margen para activaciones.
- DynQuant 3-bit: 17.68 GB en disco. También cabe en RTX 4090, dejando más espacio para el contexto largo.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o directamente con el pipeline de HuggingFace. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor no publicó mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B (3B activos) | 128K | Apache 2.0 | Modelo original sin fine-tune speech-to-speech |
| VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA (este) | 30B (3B activos) | 128K | Apache 2.0 | Adaptador QLoRA sobre el Thinker, speech-to-speech |
| Qwen3-Omni-30B-A3B-Captioner | 30B (3B activos) | 128K | Apache 2.0 | Variante especializada en descripción de imágenes |

La comparativa principal es contra el modelo base: el adaptador añade la capacidad de respuesta speech-to-speech entrenada en diálogo hablado, pero no hay datos que demuestren una mejora objetiva. El Captioner es otra variante del mismo base, orientada a visión, por lo que no es directamente comparable en tareas de voz.

## Limitaciones y advertencias

- No hay métricas de calidad: el autor admite que no se realizaron benchmarks ni estudios de escucha, por lo que no se puede afirmar que el fine-tune mejore al modelo base.
- Entrenamiento muy limitado: solo 10 horas de audio y una época, lo que puede provocar sobreajuste o capacidades limitadas en dominios fuera del diálogo hablado.
- El Talker no fue entrenado: la voz de salida mantiene el comportamiento del checkpoint base, lo que puede generar inconsistencias con el Thinker ajustado.
- Riesgo de alucinación y errores: como cualquier modelo generativo, puede producir respuestas incorrectas o incoherentes, especialmente en audio.
- Sesgos no evaluados: no se documentan sesgos de género, acento o idioma en el fine-tune.
- Requisitos de hardware elevados para el merge bf16: 65.69 GB hacen inviable su uso en GPUs de consumo sin cuantización.
- La cuantización DynQuant 3-bit puede degradar la calidad de la voz, aunque la prueba de humo no detectó fallos catastróficos.
- Fecha de creación futura (2026-08-16): el modelo está fechado en el futuro, lo que puede indicar un error de metadatos o un lanzamiento programado.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA
- Merge bf16: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16
- DynQuant 4-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit
- DynQuant 3-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio DynQuant: https://github.com/kambojvikram/dynquant
- Repositorio oficial Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/qwen3-omni-30b
