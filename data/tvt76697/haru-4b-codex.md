# tvt76697/Haru-4B-codex

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo, full-duplex y multilingüe, desarrollado por el equipo de Higurashi AI (publicado en Hugging Face bajo la cuenta `tvt76697`). A diferencia de los pipelines clásicos de voz (ASR → LLM → TTS), Haru escucha y habla simultáneamente, como en una llamada telefónica: cada 133 ms procesa un frame de audio del usuario y emite un frame de audio propio junto con texto. El resultado es una latencia conversacional muy baja, sin turnos rígidos.

Técnicamente se apoya en un backbone de lenguaje Qwen3.5-4B (32 capas, dimensión oculta 2560, unos 5.270 millones de parámetros totales en bfloat16) al que se acoplan proyecciones de audio de entrada, una cabeza MLP de 4 capas con muestreo MeanFlow y un códec acústico causal de VibeVoice a 24 kHz. No emplea tokens de audio discretos: cada frame se representa como un latente de 64 dimensiones generado en un único paso de muestreo.

Es relevante porque propone una arquitectura nativa full-duplex (7,5 Hz) con control de personaje mediante tarjeta de texto y clonación de voz a partir de una referencia corta, y cubre nueve idiomas (inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano). Se distribuye como modelo base preentrenado para investigación bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) + proyecciones de audio + cabeza MLP MeanFlow + códec VibeVoice |
| Parametros totales | 5.270.000.897 (bfloat16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

Haru-4B es un modelo híbrido audio-texto construido sobre un backbone de lenguaje Qwen3.5-4B de 32 capas y dimensión oculta 2560. En cada frame de 133 ms (7,5 Hz), el latente de audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo se suman en una única posición del modelo de lenguaje; la salida predice simultáneamente el siguiente token de texto y el siguiente latente de audio. Esto elimina la necesidad de esperar turnos y permite el comportamiento full-duplex.

El audio se modela de forma continua: el códec acústico de VibeVoice (causal, 24 kHz, 3200 muestras por latente) produce un latente de 64 dimensiones por frame, y una cabeza MLP de 4 capas con muestreo MeanFlow lo genera en un solo paso a partir del estado oculto del LM, con escala de guía entre 1 y 2 (por defecto 1,5). No hay transformer de audio separado ni tokens de audio discretos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Diálogo hablado continuo full-duplex: escucha y habla a la vez con frames de 133 ms.
- Generación conjunta de audio y texto en cada paso (speech-to-speech con transcripción implícita).
- Control de personaje mediante tarjeta de texto en el system prompt.
- Clonación de voz a partir de una referencia de 3 segundos a 3 minutos (un solo hablante, audio limpio).
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Baja latencia conversacional nativa, sin pipeline ASR/LLM/TTS.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio de entrada más allá del diálogo: no disponible.

## Casos de uso

- Atención al cliente telefónica: el modelo mantiene una conversación oral continua y puede interrumpirse y responder sin esperar al final del turno, gracias a su procesamiento full-duplex a 7,5 Hz.
- Asistentes de voz embebidos en aplicaciones de escritorio: el repositorio incluye una implementación MLX con app nativa para macOS, útil para prototipos de asistente local con micrófono y altavoces.
- Prácticas de conversación con personajes: la tarjeta de personaje permite definir rol y estilo, y la referencia de voz fija el timbre, lo que encaja en simuladores de entrevistas, entrenamiento de idiomas o role-play.
- Investigación en interacción humano-máquina: sirve como base para estudiar latencia, solapamiento de turnos y naturalidad en diálogo hablado.
- Doblaje y locución asistida en prototipos: con una referencia de voz autorizada, se puede generar habla en varios idiomas manteniendo el timbre, útil para demos y pruebas internas.
- Evaluación de pipelines de inferencia de audio: el plugin para vLLM-Omni y el servidor PyTorch permiten medir throughput y latencia en GPU de gama media (unos 12 GB de VRAM).
- Accesibilidad: interfaz de voz continua para personas que prefieren la interacción oral, con soporte multilingüe en una sola sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en bfloat16 según la model card (el repo pesa 10,6 GB).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo con 12 GB o más (por ejemplo, gama RTX xx70/xx80 con 12-16 GB), aunque el dato no se confirma explícitamente.
- Opciones de despliegue: servidor PyTorch incluido (`python -m haru.server`), plugin para vLLM-Omni e implementación MLX para macOS.
- Latencia y throughput: no se publican cifras de throughput; la latencia de frame es de 133 ms y se recomienda audio por cable (Bluetooth añade 100 ms o más).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos full-duplex o speech-to-speech, ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: no es una fuente fiable de hechos y no sigue instrucciones como un asistente al uso.
- Riesgo de alucinación en el contenido hablado y en el texto generado.
- La clonación de voz puede imitar voces de referencia; solo debe usarse con voces sobre las que se tenga derecho.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones muy largas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el modelo no está ajustado para producción y la responsabilidad sobre el uso de voces recae en el usuario.
- El rendimiento multilingüe no está cuantificado; los nueve idiomas figuran como soportados sin métricas.

## Enlaces

- Hugging Face: https://huggingface.co/tvt76697/Haru-4B
- Repositorio de código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico en japonés: https://blog.higurashi.ai/melte/haru4b-ja/
