# theoracleguy/MOSS-TTS-Local-Transformer-v1.5-4bit

## Resumen

MOSS-TTS-Local-Transformer-v1.5-4bit es una conversión a MLX (Apple Silicon) del modelo de síntesis de voz MOSS-TTS-Local-Transformer-v1.5, desarrollado por el equipo OpenMOSS y MOSI.AI. Se trata de un modelo de texto a voz (TTS) de código abierto con licencia Apache-2.0, diseñado para generar habla de alta fidelidad, con soporte de clonación de voz zero-shot, síntesis en streaming y salida estéreo a 48 kHz. Esta versión concreta está cuantizada a 4 bits (int4, grupo de 64, afín) y ocupa 2,4 GB, lo que la hace adecuada para ejecutarse en dispositivos Apple con memoria unificada.

El modelo combina un backbone basado en Qwen3 con un transformer local que emite 12 codebooks RVQ por trama, junto con el tokenizador de audio MOSS-Audio-Tokenizer-v2. Aunque el README del autor menciona "4B", los pesos reales en safetensors suman 737.740.064 parámetros, por lo que se trata de un modelo compacto. Soporta 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso y portugués) y está pensado para ejecutarse localmente con la librería mlx-audio, sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3 + transformer local que emite 12 codebooks RVQ por trama |
| Parametros totales | 737.740.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (grupo 64, afín); también existen versiones bf16 y 8-bit del mismo modelo |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de tipo Qwen3 (transformer decoder) con un transformer local adicional que genera 12 codebooks RVQ (Residual Vector Quantization) por cada trama de audio. El modelo utiliza el tokenizador de audio MOSS-Audio-Tokenizer-v2 para convertir el audio en tokens discretos y reconstruirlo a 48 kHz en estéreo. La conversión a MLX elimina los archivos de código remoto del modelo original, por lo que la inferencia se realiza íntegramente con la librería mlx-audio.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El modelo original (OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5) está documentado en un artículo (arXiv:2603.18090) que no se ha podido consultar en detalle. La conversión a 4 bits mantiene la funcionalidad completa, incluido el streaming con intervalos configurables.

## Capacidades

- Síntesis de voz de alta fidelidad a 48 kHz en estéreo.
- Clonación de voz zero-shot: a partir de un audio de referencia (por ejemplo, `speaker.wav`) puede imitar la voz del hablante.
- Generación en streaming: soporta `stream=True` con intervalo de streaming configurable (por ejemplo, 2.0 segundos).
- Multilingüe: 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso y portugués).
- Salida de audio en formato WAV a 48 kHz con dos canales.
- Integración con mlx-audio: carga perezosa (`lazy=True`) y generación mediante un simple bucle de Python.
- No soporta tool calling ni razonamiento multi-paso, al ser un modelo exclusivamente de TTS.

## Casos de uso

- Audiolibros y narración: el modelo puede generar voz natural para libros completos, manteniendo coherencia en largas secuencias gracias a su capacidad de streaming y a la salida de 48 kHz.
- Doblaje de vídeo y localización: con la clonación zero-shot, se puede replicar la voz de un actor para doblar contenido en varios de los 10 idiomas soportados.
- Asistentes de voz locales: al ejecutarse en Apple Silicon, permite construir asistentes de voz privados sin depender de servicios en la nube, con baja latencia gracias al streaming.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con soporte multilingüe.
- Generación de contenido para podcasts: creación de episodios de audio con voces sintéticas personalizadas, usando la clonación para mantener una voz consistente.
- Prototipado rápido de aplicaciones de voz: los desarrolladores pueden integrar el modelo en entornos de desarrollo con mlx-audio para probar interacciones de voz sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de TTS (como MOS, WER, etc.) para esta conversión ni para el modelo original en las fuentes consultadas.

## Requisitos de hardware

- Al ser una conversión MLX, requiere un dispositivo Apple Silicon (M1, M2, M3, M4 o superior) con macOS.
- Los pesos cuantizados a 4 bits ocupan 2,4 GB, por lo que caben en la memoria unificada de cualquier Mac con al menos 8 GB de RAM (recomendable 16 GB para margen).
- No requiere GPU dedicada; la inferencia se ejecuta en la Neural Engine o en los núcleos de GPU integrados del chip Apple.
- Despliegue mediante la librería `mlx-audio` (instalable con pip) y el cargador `mlx_audio.tts.load`.
- No se dispone de datos de latencia o throughput específicos para esta cuantización, pero al ser un modelo de 737M parámetros, se espera una generación en tiempo real o superior en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos TTS de código abierto (como XTTS-v2, Bark o Coqui TTS) en las fuentes consultadas. A modo cualitativo, MOSS-TTS-Local-Transformer-v1.5-4bit se diferencia por su salida estéreo a 48 kHz, su soporte de 10 idiomas y su integración nativa con MLX para Apple Silicon, mientras que alternativas como XTTS-v2 (de Coqui) ofrecen clonación de voz pero con menor resolución de salida (24 kHz) y requieren GPU NVIDIA para un rendimiento óptimo. No se puede establecer una comparación numérica fiable sin benchmarks publicados.

## Limitaciones y advertencias

- La información sobre el entrenamiento (dataset, tokens, técnicas de alineación) no está disponible, lo que dificulta evaluar posibles sesgos o comportamientos no deseados.
- Al ser un modelo de TTS, puede generar audio con errores de pronunciación o entonación en idiomas poco representados en el entrenamiento, especialmente en los 10 idiomas soportados.
- La clonación de voz zero-shot puede producir imitaciones inexactas si el audio de referencia es de baja calidad o contiene ruido.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el crédito a OpenMOSS por el modelo original.
- Esta conversión concreta está limitada a Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o PyTorch).
- El streaming está fijado a 12 codebooks RVQ; no se debe modificar el parámetro `n_vq_for_inference` porque rompería la generación.

## Enlaces

- Repositorio de HuggingFace de esta conversión: https://huggingface.co/theoracleguy/MOSS-TTS-Local-Transformer-v1.5-4bit
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5
- Tokenizador de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Conversión del tokenizador a MLX: https://huggingface.co/mlx-community/MOSS-Audio-Tokenizer-v2-bf16
- Repositorio GitHub de MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Artículo de referencia (arXiv): https://arxiv.org/abs/2603.18090
- Tutorial de instalación (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-moss-tts-local-transformer-v1-5-private-high-fidelity-voice
