# thuniverse-ai/Breeze-ASR-25-ct2

## Resumen

Breeze-ASR-25-ct2 es la conversión al formato CTranslate2 del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, desarrollado originalmente por MediaTek Research. Se trata de un modelo especializado en mandarín de Taiwán (繁體中文) y en conversaciones con alternancia de código mandarín-inglés (中英夾雜), un fenómeno muy habitual en el contexto taiwanés y en entornos corporativos bilingües.

El modelo parte de la arquitectura Whisper Large-v2 de OpenAI (~1.550 millones de parámetros, encoder-decoder transformer) y fue afinado por MediaTek Research sobre más de 11.700 horas de audio multidominio, lo que mejora de forma notable la precisión sobre modismos, fraseo y jerga local taiwanesa. La versión ct2 que nos ocupa no altera los pesos más allá de la conversión de formato: su valor está en habilitar inferencia de alto rendimiento y baja latencia mediante CTranslate2, con cuantización en tiempo de ejecución y soporte para CPU, GPU CUDA y plataformas edge.

Es relevante ahora porque permite desplegar un ASR especializado en mandarín taiwanés con requisitos de memoria muy contenidos (desde ~1,8 GB en int8) en runtimes maduros como faster-whisper, WhisperS2T o Kuwa GenAI OS, lo que facilita su integración en pipelines de subtitulado, atención al cliente y auditoría de audio sin depender de infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper Large-v2) |
| Parametros totales | ~1.550 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | float32, float16, int8_float16, int8 |
| Idiomas soportados | zh (mandarín de Taiwán), en; alternancia de código zh-en |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido; repo de 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large-v2: un transformer encoder-decoder con aproximadamente 1.550 millones de parámetros que procesa audio en ventanas de 30 segundos y genera transcripciones autoregresivas con marcas de tiempo. MediaTek Research partió de los pesos de Whisper Large-v2 y realizó un ajuste fino supervisado sobre más de 11.700 horas de audio multidominio, con especial énfasis en mandarín de Taiwán y en conversaciones con alternancia de código mandarín-inglés, tanto inter-oracional como intra-oracional.

La conversión a CTranslate2 no modifica la arquitectura ni el entrenamiento: transforma los pesos a un formato optimizado que permite cuantización en tiempo de ejecución (float16, int8_float16, int8) y ejecución acelerada en CPU, GPU CUDA y plataformas edge. Según la model card, esta conversión ofrece hasta 4 veces más velocidad de inferencia que las implementaciones Whisper en PyTorch puro, con una huella de VRAM notablemente reducida. No se detalla en la información disponible si hubo etapas de RLHF o DPO, ni la composición exacta del dataset más allá del volumen de horas indicado.

## Capacidades

- Transcripción de voz a texto en mandarín de Taiwán (繁體中文) con mejor precisión sobre modismos, fraseo y jerga local que Whisper genérico.
- Reconocimiento de alternancia de código mandarín-inglés, tanto entre frases como dentro de una misma frase.
- Generación de marcas de tiempo de alta precisión, orientadas a subtitulado automático (SRT/VTT) y transcripción de audio de larga duración.
- Detección de idioma con probabilidad asociada (expuesta por faster-whisper).
- Filtrado VAD (detección de actividad de voz) integrado en los runtimes compatibles, útil para eliminar silencios y segmentar audio.
- Procesamiento por lotes de múltiples archivos de audio (WhisperS2T).
- Inferencia en CPU, GPU CUDA y plataformas edge gracias a CTranslate2.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de contenido audiovisual en mandarín de Taiwán: el modelo genera marcas de tiempo precisas y transcripciones con la jerga local correcta, adecuado para plataformas de vídeo y televisión que necesitan SRT/VTT fiables.
- Actas de reuniones bilingües mandarín-inglés: su entrenamiento específico en alternancia de código permite transcribir reuniones corporativas donde los hablantes mezclan ambos idiomas sin perder segmentos ni degradar la calidad.
- Transcripción de atención al cliente en tiempo real: con CTranslate2 en float16 (~3,1 GB de VRAM) o int8_float16 (~1,8-2,0 GB), se puede desplegar en servidores modestos para transcribir llamadas y alimentar sistemas de análisis de calidad.
- Auditoría de cumplimiento sobre audio empresarial: el despliegue on-premises con Turu o Kuwa permite procesar audio sensible sin que salga de la infraestructura de la organización, requisito habitual en entornos regulados.
- Generación de actas y resúmenes a partir de grabaciones largas: la transcripción con timestamps y el procesamiento por lotes de WhisperS2T facilitan pipelines que segmentan, transcriben y resumen horas de audio.
- Asistentes de voz y kioscos en comercio minorista taiwanés: la baja latencia y la huella de memoria reducida permiten ejecutar el modelo en hardware edge, atendiendo consultas en mandarín local e inglés.
- Investigación lingüística sobre code-switching: el modelo sirve como herramienta de transcripción para corpus de habla mixta zh-en, donde los ASR genéricos suelen fallar en los cambios intra-oracionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según compute type (datos de la model card):
  - float16: ~3,1 GB de VRAM (GPU NVIDIA Turing/Ampere/Ada/Hopper).
  - int8_float16: ~1,8-2,0 GB de VRAM (GPU NVIDIA con VRAM limitada).
  - int8: ~1,8 GB de RAM (CPU x86_64 / ARM64).
  - float32: ~6,2 GB de RAM (CPU antiguas o fallback).
- GPU recomendadas: cualquier NVIDIA con soporte Turing o superior; cabe holgadamente en RTX 4090, A100 y H100, y también en GPUs consumer de gama media con al menos 4 GB de VRAM en float16.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM usando float16 o int8_float16.
- Opciones de despliegue: faster-whisper, WhisperS2T, Kuwa GenAI OS (Whisper Executor), Turu (Thuniverse AI) y cualquier runtime compatible con CTranslate2.
- Latencia y throughput: la model card indica hasta 4 veces más velocidad que Whisper en PyTorch puro; no se proporcionan cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Breeze-ASR-25-ct2 | ~1.550 M | zh (Taiwán), en, code-switching | CTranslate2 | Apache 2.0 | Especializado en mandarín taiwanés; cuantización en runtime |
| MediaTek-Research/Breeze-ASR-25 | ~1.550 M | zh (Taiwán), en, code-switching | PyTorch (safetensors) | Apache 2.0 | Modelo original sin conversión; mayor huella y menor velocidad |
| OpenAI Whisper Large-v2 | ~1.550 M | multilingüe (~99 idiomas) | PyTorch | MIT (pesos) | Base genérica; peor precisión en jerga taiwanesa y code-switching |
| OpenAI Whisper Large-v3 | ~1.550 M | multilingüe (~99 idiomas) | PyTorch | MIT (pesos) | Versión más reciente de la familia; no especializada en Taiwán |

## Limitaciones y advertencias

- Sesgos: al estar afinado sobre datos de Taiwán, puede presentar sesgo hacia vocabulario, acentos y registros de esa región; el rendimiento en otros dialectos del mandarín no está documentado.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible en segmentos con ruido, silencios o audio de baja calidad; se recomienda usar VAD y revisar las transcripciones críticas.
- Limitaciones de idioma: aunque la licencia y los tags incluyen zh y en, el foco es el mandarín de Taiwán y el code-switching zh-en; no se garantiza calidad en otros idiomas distintos del inglés.
- Ventana de audio: hereda la ventana de 30 segundos de Whisper; para audio largo es necesario segmentar (los runtimes compatibles lo gestionan, pero conviene validarlo).
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los pesos de Whisper subyacentes antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: conviene validar la integridad de los pesos y la reproducibilidad antes de adoptarlo.
- No se documentan métricas de WER/CER en la información disponible, por lo que la evaluación debe hacerse con un conjunto propio representativo del dominio de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thuniverse-ai/Breeze-ASR-25-ct2
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- MediaTek Research en Hugging Face: https://huggingface.co/MediaTek-Research
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- WhisperS2T: https://github.com/shashikg/WhisperS2T
- Kuwa GenAI OS: https://github.com/kuwaai/kuwa-aios
- Turu (Thuniverse AI): https://thuniverse.ai/
