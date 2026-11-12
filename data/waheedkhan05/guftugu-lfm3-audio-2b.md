# waheedkhan05/Guftugu-LFM3-Audio-2B

## Resumen

Guftugu (گفتگو, "conversación" en urdu) es un ajuste fino del modelo LiquidAI/LFM3-Audio-2B desarrollado por waheedkhan05 bajo el paraguas de Aabshar AI. Está especializado en voz en urdu de extremo a extremo: reconocimiento automático del habla (ASR), síntesis de voz expresiva (TTS) y aplicaciones de agentes de voz. Parte de una arquitectura multimodal de audio de Liquid AI y hereda sus 2.000 millones de parámetros, adaptándolos al dominio del urdu mediante ajuste fino.

El modelo trabaja con audio a 24 kHz y utiliza los tokens del códec propietario LiquidCodec, lo que permite procesar y generar audio de forma nativa sin depender de un pipeline separado de ASR y TTS. Su etiqueta principal en Hugging Face es `automatic-speech-recognition`, aunque la model card declara explícitamente capacidades de TTS y de agentes conversacionales en tiempo real.

Es relevante porque el urdu es un idioma con escasa representación en modelos de voz abiertos de calidad, y este ajuste apunta a casos de uso comerciales concretos en Pakistán (verificación de pedidos contra reembolso, narración de audiolibros, agentes de voz). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo es muy reciente y no cuenta todavía con descargas ni validación pública en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de audio LiquidAI/LFM3-Audio-2B; detalles internos no especificados) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LiquidAI/LFM3-Audio-2B, un modelo de audio de Liquid AI que, según la model card, opera sobre tokens de LiquidCodec a 24 kHz. Esto implica una representación discreta del audio que permite tratar entrada y salida de voz dentro de un mismo espacio de tokens, habilitando tanto ASR como TTS y conversación duplex en tiempo real. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF o DPO.

La model card menciona explícitamente la desambiguación automática de diacríticos (Aeraab) en la generación de texto urdu, un detalle técnico relevante para TTS de calidad, ya que el urdu escrito suele omitir vocales y su reconstrucción correcta es crítica para una pronunciación natural. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporte el modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) en urdu a 24 kHz.
- Síntesis de voz (TTS) expresiva en urdu con desambiguación automática de diacríticos (Aeraab).
- Procesamiento de audio nativo mediante tokens LiquidCodec.
- Conversación de voz duplex en tiempo real (agentes conversacionales).
- Casos orientados a voz de baja latencia (verificación COD, agentes telefónicos).
- Generación de narración de calidad de estudio para audiolibros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al urdu según la etiqueta de idioma.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Verificación de pedidos contra reembolso (COD) en e-commerce paquistaní: bots de voz de baja latencia que llaman al cliente, confirman la dirección y el pedido, y registran la respuesta. El modelo está diseñado explícitamente para este escenario según la model card.
- Agentes de voz conversacionales en tiempo real: atención al cliente telefónica en urdu con turnos duplex, aprovechando el procesamiento nativo de audio a 24 kHz.
- Narración de audiolibros y contenido editorial: TTS expresivo con resolución automática de diacríticos para una pronunciación correcta de palabras ambiguas.
- Transcripción de llamadas y reuniones en urdu: ASR para generar actas, subtítulos o análisis de sentimiento sobre grabaciones.
- Accesibilidad: lectura en voz alta de textos urdu para personas con discapacidad visual o dificultades lectoras.
- Localización de contenidos: doblaje y generación de pistas de audio en urdu para vídeos, cursos o materiales formativos.
- Asistentes de voz integrados en aplicaciones móviles para usuarios urduhablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2B parámetros en precisión completa (fp16) se requieren aproximadamente 4-5 GB de VRAM, y en cuantización de 8 bits en torno a 2-3 GB, como estimación orientativa basada en el tamaño.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4090, y en GPUs de datacenter A100/H100 para despliegues concurrentes.
- Compatibilidad con GPU consumer: probable por el tamaño de 2B, aunque no confirmada en la información disponible.
- Opciones de despliegue: no disponibles; al ser un modelo de audio con códec propietario, es probable que requiera el stack de Liquid AI en lugar de vLLM o llama.cpp estándar, pero no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Guftugu-LFM3-Audio-2B | 2B | no disponible | urdu | Apache 2.0 | Ajuste fino de audio ASR/TTS en urdu |
| LiquidAI/LFM3-Audio-2B (base) | 2B | no disponible | no disponible | no disponible en esta ficha | Modelo base multimodal de audio |
| Whisper (large-v3) | 1.55B | 30 s de audio | multilingüe (incluye urdu) | MIT | Solo ASR, sin TTS |
| MMS (Meta) | ~1B | no disponible | multilingüe (incluye urdu) | CC-BY-NC | ASR, licencia no comercial |

La comparación con alternativas especializadas en urdu (por ejemplo, ajustes de Whisper para urdu) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo muy reciente (creado el 11 de noviembre de 2026 según metadatos) con 0 descargas y 0 likes: sin validación comunitaria ni evidencia pública de calidad.
- No se han publicado benchmarks ni evaluaciones objetivas de ASR (WER) o TTS (MOS) en la información disponible.
- Idiomas limitados al urdu; no apto para otros idiomas sin ajuste adicional.
- Riesgo de alucinación y errores de transcripción inherente a los modelos de voz, especialmente en audio con ruido, acentos regionales o code-switching con inglés.
- La desambiguación de diacríticos puede fallar en nombres propios o terminología técnica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/LFM3-Audio-2B puede tener condiciones propias que conviene revisar antes de producción.
- Dependencia del stack de LiquidCodec: la portabilidad a herramientas estándar (llama.cpp, vLLM) no está confirmada.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- [Hugging Face: waheedkhan05/Guftugu-LFM3-Audio-2B](https://huggingface.co/waheedkhan05/Guftugu-LFM3-Audio-2B)
- [Modelo base: LiquidAI/LFM3-Audio-2B](https://huggingface.co/LiquidAI/LFM3-Audio-2B)
