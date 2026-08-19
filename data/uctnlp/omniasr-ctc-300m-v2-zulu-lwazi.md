# uctnlp/omniASR-CTC-300M-v2-Zulu-Lwazi

## Resumen

El modelo `uctnlp/omniASR-CTC-300M-v2-Zulu-Lwazi` es un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura Wav2Vec2, desarrollado por el grupo de procesamiento de lenguaje natural de la Universidad de Ciudad del Cabo (UCT NLP). Se trata de una conversión del checkpoint `omniASR_CTC_300M_v2` de Facebook Research (proyecto OmniLingual), adaptado específicamente para la transcripción de audio en lengua zulú (isiZulu), tal como indica su nombre. El modelo emplea decodificación CTC (Connectionist Temporal Classification) sobre un vocabulario SentencePiece de 10 288 tokens, lo que permite una transcripción rápida y eficiente.

Con 325 983 920 parámetros y una arquitectura de 24 capas de encoder con tamaño oculto de 1024, el modelo ofrece un equilibrio entre precisión y velocidad de inferencia. Su origen en el proyecto OmniASR, que cubre más de 1600 lenguas, garantiza una base sólida en representaciones acústicas multilingües, aunque esta variante concreta se centra en el zulú. La paridad numérica con el checkpoint original en fairseq2 ha sido verificada con una tolerancia de `atol=1e-4`, lo que asegura que la conversión a Transformers no introduce degradación.

La relevancia de este modelo radica en su contribución a la accesibilidad de tecnologías de voz para lenguas africanas de bajos recursos, como el zulú, que tradicionalmente carecen de sistemas ASR comerciales de calidad. Al estar disponible en el ecosistema Hugging Face con formato `safetensors`, puede desplegarse fácilmente en pipelines de Transformers, en soluciones locales o en entornos de inferencia en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder transformer con CTC) |
| Parametros totales | 325 983 920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos; sin límite explícito documentado) |
| Tipos de cuantizacion | no disponible (pesos en fp32 en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (el nombre sugiere zulú/isiZulu, pero no se especifica en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un encoder transformer preentrenado de forma autosupervisada sobre audio en bruto, al que se añade una cabeza de clasificación CTC para producir logits sobre un vocabulario de unidades subpalabra (SentencePiece). La configuración concreta incluye 24 capas de encoder, 16 cabezas de atención, dimensión oculta de 1024 y una capa intermedia de FFN de 4096 unidades. El vocabulario tiene 10 288 tokens, lo que permite representar fonemas y morfemas del zulú de manera compacta.

El checkpoint original `omniASR_CTC_300M_v2` fue desarrollado por Facebook Research dentro del proyecto OmniLingual, que entrena modelos ASR multilingües sobre más de 1600 idiomas. La variante `-Zulu-Lwazi` es una adaptación específica para el zulú, probablemente mediante fine-tuning sobre un corpus de audio en esa lengua (aunque los datos exactos de entrenamiento no se documentan en la model card). La conversión a Transformers se realizó desde fairseq2, verificándose la paridad numérica de las salidas con una tolerancia absoluta de 1e-4 en una muestra de audio de prueba.

No se especifica el número de tokens de entrenamiento ni la composición del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de ASR y no de generación de texto.

## Capacidades

- Transcripción de audio a texto: el modelo convierte señales de audio de 16 kHz en transcripciones textuales mediante decodificación CTC.
- Soporte multilingüe base: al derivar del checkpoint OmniASR, conserva capacidad de reconocimiento en múltiples lenguas, aunque esta variante está orientada al zulú.
- Compatibilidad con Transformers: se integra con la clase `Wav2Vec2ForCTC` y `AutoProcessor`, permitiendo su uso en pipelines estándar de ASR.
- Inferencia eficiente: la decodificación CTC es más rápida que los modelos autoregresivos, adecuada para transcripción en tiempo real o de alto rendimiento.
- Compatible con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en Hugging Face Inference Endpoints sin configuración adicional.
- Procesamiento de audio en crudo: acepta waveforms muestreados a 16 kHz, con posibilidad de remuestreo desde otras frecuencias.

## Casos de uso

- Transcripción de entrevistas y testimonios en zulú: el modelo puede convertir grabaciones de audio de entrevistas en texto, facilitando el análisis cualitativo en investigación social o periodismo.
- Subtitulado automático de vídeos: al procesar audio de 16 kHz, puede generar subtítulos para contenidos audiovisuales en zulú, útil para plataformas educativas o de difusión cultural.
- Asistencia a la documentación clínica: en entornos sanitarios donde se habla zulú, el modelo puede transcribir consultas médicas para generar historiales electrónicos, reduciendo la carga administrativa del personal.
- Servicios de atención al cliente por voz: integrado en un sistema de IVR, puede transcribir las peticiones de los usuarios en zulú para enrutarlas o procesarlas automáticamente.
- Archivado y búsqueda de contenido oral: bibliotecas o archivos que conserven grabaciones históricas en zulú pueden indexar su contenido mediante transcripción automática, habilitando búsquedas por texto.
- Desarrollo de asistentes de voz en zulú: el modelo puede servir como componente de reconocimiento en aplicaciones de asistente personal o domótica, permitiendo comandos por voz en esta lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER (Word Error Rate) ni comparaciones con otros sistemas ASR. Tampoco se documentan pruebas sobre conjuntos de evaluación estándar para zulú.

## Requisitos de hardware

- VRAM estimada para inferencia: con 325 millones de parámetros en fp32, el modelo ocupa aproximadamente 1.3 GB en memoria. En fp16 (si se convierte) ocuparía unos 650 MB, y en int8 unos 325 MB. Para inferencia en GPU se recomienda al menos 2 GB de VRAM para operar con margen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. También puede ejecutarse en CPU con razonable velocidad para segmentos cortos.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño moderado.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, lo que permite usar `pipeline("automatic-speech-recognition")`, así como servidores de inferencia como vLLM (aunque no es el caso típico para ASR), TGI (no específico para audio), o simplemente ejecución local con PyTorch. También puede usarse con Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño y la arquitectura CTC, se espera una latencia inferior a la de modelos autoregresivos como Whisper, pero los valores concretos dependen del hardware y de la longitud del audio.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos ASR para zulú en la información proporcionada. Sin embargo, se pueden mencionar alternativas genéricas:

| Modelo | Parámetros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-Lwazi (este) | 325 M | Wav2Vec2 + CTC | no disponible | Específico para zulú, derivado de OmniASR |
| Whisper (openai/whisper-small) | 244 M | Encoder-decoder transformer | MIT | Multilingüe, incluye zulú en su entrenamiento, pero requiere más recursos por decodificación autoregresiva |
| Wav2Vec2-XLSR-53 | 317 M | Wav2Vec2 + CTC | Apache 2.0 | Preentrenado en 53 lenguas, requiere fine-tuning para zulú |

La comparación real en términos de WER no está disponible, por lo que no se puede determinar cuál es superior en precisión.

## Limitaciones y advertencias

- Sesgos y cobertura: al ser una adaptación específica, el modelo puede tener un rendimiento desigual en variantes dialectales del zulú o en acentos no representados en los datos de fine-tuning (cuyo origen no se documenta).
- Riesgo de alucinación: en ASR, los errores de transcripción pueden producir palabras o frases incorrectas, especialmente en audio con ruido, solapamiento de voces o habla no nativa. No se ha evaluado la robustez en condiciones adversas.
- Limitaciones de contexto: al ser un modelo CTC, procesa el audio en ventanas temporales; no hay un límite explícito de duración, pero la precisión puede degradarse en segmentos muy largos sin segmentación previa.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con los autores antes de desplegarlo en producción.
- Falta de documentación de entrenamiento: no se detallan los datos de entrenamiento, el número de horas de audio ni el proceso de fine-tuning, lo que dificulta la evaluación de su idoneidad para dominios específicos.
- Dependencia de la frecuencia de muestreo: el modelo espera audio a 16 kHz; si el audio fuente tiene otra frecuencia, es necesario remuestrear, lo que puede introducir artefactos si no se hace correctamente.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/uctnlp/omniASR-CTC-300M-v2-Zulu-Lwazi
- Repositorio OmniLingual de Facebook Research: https://github.com/facebookresearch/omnilingual-asr
- Documentación de modelos CTC en OmniASR (DeepWiki): https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Proyecto East Africa OmniASR (fine-tuning para lenguas de África Oriental): https://github.com/mutaician/east-africa-omniasr
- Modelo relacionado (baseline zulú): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline
- Modelo relacionado (zulú general): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu
