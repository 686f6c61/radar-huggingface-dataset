# uctnlp/omniASR-CTC-300M-v2-Zulu-All-v1

## Resumen

El modelo `uctnlp/omniASR-CTC-300M-v2-Zulu-All-v1` es un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con decodificación CTC (Connectionist Temporal Classification). Ha sido desarrollado por el grupo UCT NLP de la Universidad de Ciudad del Cabo y consiste en una conversión al ecosistema Hugging Face Transformers del checkpoint `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta AI. El nombre del repositorio sugiere una especialización en la lengua zulú, aunque la model card indica que puede transcribir habla en múltiples idiomas.

Con 325,98 millones de parámetros, el modelo emplea un encoder Transformer de 24 capas con una dimensión oculta de 1024 y 16 cabezas de atención. Produce logits CTC sobre un vocabulario SentencePiece de 10 288 unidades, lo que permite una transcripción rápida y eficiente, adecuada para escenarios de alta productividad. La verificación numérica frente al checkpoint original de fairseq2 confirma una paridad con una tolerancia de `atol=1e-4`, lo que garantiza que la conversión no introduce degradación funcional.

Este modelo resulta relevante en el contexto actual de democratización del ASR multilingüe, especialmente para lenguas de bajos recursos como el zulú, donde los sistemas comerciales suelen tener una cobertura limitada. Al ser una conversión directa de un modelo ya validado, ofrece una alternativa reproducible y de código abierto para investigación y despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (Transformer encoder) |
| Parámetros totales | 325 983 920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la duración del audio; el modelo procesa señales de 16 kHz) |
| Tipos de cuantización | no disponible (solo se proporcionan pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (la model card indica "multiple languages"; el nombre sugiere zulú, pero no se especifica la lista) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un encoder Transformer que procesa representaciones de audio en bruto (waveform) muestreadas a 16 kHz. La configuración incluye 24 capas de encoder, una dimensión oculta de 1024, 16 cabezas de atención y una capa FFN intermedia de 4096 unidades. La salida es una secuencia de logits CTC sobre un vocabulario SentencePiece de 10 288 subpalabras, lo que permite una decodificación greedy o con beam search sin necesidad de un modelo de lenguaje externo.

No se dispone de información detallada sobre el entrenamiento original del checkpoint `omniASR_CTC_300M_v2` de OmniLingual. Según la documentación del proyecto, los modelos CTC de OmniLingual se entrenan sobre un corpus multilingüe que abarca más de 1600 idiomas, priorizando la velocidad de inferencia sobre la precisión máxima. Sin embargo, no se han publicado datos concretos sobre el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La conversión a Transformers fue realizada por el equipo de UCT NLP y verificada numéricamente contra el checkpoint original.

## Capacidades

- Transcripción de voz a texto mediante decodificación CTC, optimizada para velocidad y baja latencia.
- Soporte multilingüe, con especial énfasis en el zulú según el nombre del modelo, aunque no se especifica la lista completa de idiomas.
- Procesamiento de audio en bruto a 16 kHz, sin necesidad de características acústicas precalculadas.
- Compatible con la clase `Wav2Vec2ForCTC` de Hugging Face Transformers, lo que facilita su integración en pipelines existentes.
- Adecuado para escenarios de tiempo real y alto rendimiento gracias a la naturaleza no autorregresiva de CTC.
- Verificación de paridad numérica con el checkpoint original, garantizando consistencia en los resultados.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede convertir grabaciones de audio en actas textuales de forma rápida. Su arquitectura CTC permite procesar segmentos largos con baja latencia, adecuado para herramientas de productividad.
- Subtitulado automático de vídeos: al aceptar audio de 16 kHz, puede integrarse en flujos de trabajo de generación de subtítulos para plataformas de vídeo, especialmente en idiomas con poca cobertura comercial como el zulú.
- Asistentes de voz para entornos con recursos limitados: al ser un modelo de 300M parámetros, puede ejecutarse en GPUs de consumo moderado, habilitando comandos de voz en aplicaciones móviles o embebidas.
- Archivado y búsqueda de contenido audiovisual: la transcripción generada puede indexarse para permitir búsquedas por texto en bibliotecas de audio, facilitando la recuperación de información en medios.
- Evaluación lingüística y análisis fonético: investigadores pueden utilizar las salidas CTC para estudiar la pronunciación y variaciones dialectales, especialmente en lenguas africanas donde existen pocos recursos.
- Desarrollo de sistemas de diálogo por voz: el modelo puede servir como componente de entrada en pipelines de comprensión del habla, combinado con modelos de lenguaje para construir asistentes conversacionales multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para este modelo concreto. La model card solo confirma la paridad numérica con el checkpoint original, pero no ofrece comparativas con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 325,98 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,3 GB. En fp16, el uso de memoria se reduce a unos 650 MB, más el overhead de activaciones y buffers. Una GPU con 4 GB de VRAM debería ser suficiente para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. Para procesamiento de audio largo o lotes grandes, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A10, etc.).
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs de gama media y baja, lo que lo hace accesible para desarrolladores individuales.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con Hug Face Inference Endpoints, o mediante frameworks como vLLM (aunque vLLM está más orientado a LLM, puede funcionar con Wav2Vec2), o directamente con la librería `transformers` en un servidor Python. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se dispone de datos concretos. Dado el tamaño y la arquitectura CTC, se espera una latencia inferior a la de modelos autorregresivos como Whisper, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos ASR en la información proporcionada. Como referencia cualitativa, se puede comparar con:

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-All-v1 (este) | Wav2Vec2 CTC | 325M | No disponible | Multilingüe (no especificado) | No disponible |
| Whisper small (OpenAI) | Encoder-decoder Transformer | 244M | 30 segundos de audio | 99 idiomas | MIT |
| Wav2Vec2-XLSR-300M (Meta) | Wav2Vec2 | 300M | No disponible | 128 idiomas | MIT |

Nota: Whisper small tiene una arquitectura autorregresiva, mientras que este modelo es CTC, lo que le da ventaja en velocidad. XLSR-300M es un modelo preentrenado sin cabeza CTC, por lo que requiere adaptación. La comparación exacta de rendimiento no es posible sin datos de benchmarks.

## Limitaciones y advertencias

- La licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en productos comerciales.
- No se ha publicado información sobre sesgos o alucinaciones específicas. Al ser un modelo de ASR, el riesgo de alucinación es menor que en modelos de lenguaje, pero puede producir errores de transcripción en habla no nativa o con ruido de fondo.
- La lista de idiomas soportados no está documentada. El nombre sugiere una especialización en zulú, pero la model card afirma "multiple languages" sin detallar cuáles. Esto puede llevar a resultados inesperados en idiomas no contemplados.
- No se proporcionan instrucciones sobre el preprocesamiento exacto del audio más allá del remuestreo a 16 kHz. Es posible que se requiera normalización adicional para obtener resultados óptimos.
- El modelo no incluye un decodificador con modelo de lenguaje externo, por lo que la precisión puede ser inferior a sistemas que integran un LM. Para mejorar el WER, se podría combinar con un modelo de lenguaje sobre las salidas CTC.
- Al ser una conversión de un checkpoint de investigación, no hay garantías de mantenimiento o soporte a largo plazo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/uctnlp/omniASR-CTC-300M-v2-Zulu-All-v1)
- [Repositorio GitHub de OmniLingual ASR](https://github.com/facebookresearch/omnilingual-asr)
- [Documentación de modelos CTC en DeepWiki](https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr))
- [Checkpoint original de Meta AI en Hugging Face](https://huggingface.co/facebook/omniASR-CTC-300M)
- [Perfil de UCT NLP en Hugging Face](https://huggingface.co/uctnlp)
- [Notebook de ejemplo en Colab](https://colab.research.google.com/github/NeuralFalconYT/omnilingual-asr-colab/blob/main/Meta_Omnilingual_ASR.ipynb)
