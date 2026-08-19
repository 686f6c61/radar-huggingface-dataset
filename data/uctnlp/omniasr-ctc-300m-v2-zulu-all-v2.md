# uctnlp/omniASR-CTC-300M-v2-Zulu-All-v2

## Resumen

omniASR-CTC-300M-v2-Zulu-All-v2 es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con decodificación CTC (Connectionist Temporal Classification), publicado por el grupo UCT NLP de la Universidad de Ciudad del Cabo. Se trata de una conversión al ecosistema HuggingFace Transformers del checkpoint original `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta (Facebook Research), que cubre más de 1600 lenguas. Esta variante concreta está orientada a la transcripción de isiZulu, aunque el sufijo "All" sugiere capacidad multilingüe más amplia.

El modelo cuenta con aproximadamente 326 millones de parámetros, 24 capas de encoder con tamaño oculto de 1024 y un vocabulario SentencePiece de 10288 tokens. La verificación de paridad numérica contra el checkpoint original de fairseq2 ha sido confirmada con una tolerancia de `atol=1e-4` en una muestra de audio de validación. Su relevancia radica en ofrecer ASR rápido y eficiente para lenguas africanas de bajos recursos, un ámbito tradicionalmente desatendido por los grandes proveedores comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (Transformer encoder con cabecera CTC) |
| Parametros totales | 325.983.920 (~326 M) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del audio de entrada; Wav2Vec2 procesa secuencias de audio completas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32) |
| Idiomas soportados | isiZulu principalmente; el checkpoint origen cubre 1600+ lenguas |
| Licencia | no disponible en la model card; el modelo hermano `omniASR-CTC-300m-v2-Zulu` usa apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un encoder Transformer convolucional que procesa audio crudo a 16 kHz y produce representaciones latentes sobre las que se aplica una cabecera de clasificación CTC. La configuración concreta incluye 24 capas de encoder, tamaño oculto de 1024, 16 cabezas de atención y una FFN intermedia de 4096 unidades. El vocabulario de salida, de 10288 tokens, se construye con SentencePiece, lo que permite una tokenización subpalabra eficiente para lenguas con morfología aglutinante como el isiZulu.

El entrenamiento original se realizó en el marco del proyecto OmniLingual de Meta, que cubre más de 1600 lenguas con un único modelo. Este checkpoint concreto es la variante v2 de 300M, convertida desde fairseq2 a Transformers por el grupo UCT NLP. La conversión ha sido verificada numéricamente: las salidas coinciden con el checkpoint original dentro de una tolerancia absoluta de 1e-4. No se dispone de información detallada sobre el dataset de entrenamiento específico para esta variante Zulu, ni sobre el uso de técnicas de alineación como RLHF o DPO, que no son habituales en modelos ASR.

## Capacidades

- Transcripción de voz a texto en isiZulu mediante decodificación CTC con argmax directo sobre los logits.
- Soporte multilingüe potencial heredado del checkpoint OmniLingual, que cubre 1600+ lenguas.
- Inferencia rápida: los modelos CTC son significativamente más rápidos que los basados en decodificación autoregresiva o LLM, aptos para transcripción en tiempo real.
- Procesamiento de audio a 16 kHz con resampleo automático mediante torchaudio.
- Integración nativa con el ecosistema Transformers: clase `Wav2Vec2ForCTC` y `AutoProcessor` estándar.
- Compatible con pipelines de HuggingFace (`automatic-speech-recognition`) y con `endpoints_compatible`, lo que permite despliegue en Inference Endpoints.

## Casos de uso

- Transcripción de entrevistas y testimonios en isiZulu: el modelo puede procesar grabaciones de campo a 16 kHz y generar transcripciones textuales para investigación sociolingüística o documentación histórica, gracias a su inferencia rápida y bajo coste computacional.
- Subtitulado automático de contenido audiovisual en lenguas sudafricanas: integrable en pipelines de postproducción para generar subtítulos en isiZulu de vídeos, noticiarios o contenido educativo, con latencia suficientemente baja para procesamiento por lotes.
- Asistentes de voz para servicios públicos en Sudáfrica: el modelo puede servir como capa ASR en sistemas de atención ciudadana que operan en isiZulu, uno de los idiomas oficiales del país, permitiendo interacción por voz en kioscos o líneas telefónicas.
- Archivado y búsqueda de audio en bibliotecas digitales: transcripción masiva de archivos sonoros en isiZulu para habilitar búsqueda por texto en repositorios de patrimonio cultural o archivos radiofónicos.
- Investigación en ASR de bajos recursos: sirve como modelo base para fine-tuning en dialectos específicos del isiZulu o lenguas bantúes relacionadas, gracias a su licencia permisiva y su formato estándar Transformers.
- Evaluación comparativa de ASR multilingüe: al ser una conversión verificada de un checkpoint OmniLingual, puede usarse como referencia de paridad en experimentos que comparen implementaciones fairseq2 y Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, CER) en la informacion disponible. La model card únicamente confirma la paridad numérica con el checkpoint original de fairseq2 dentro de `atol=1e-4`, pero no incluye métricas de error de transcripción sobre conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 326 M de parámetros en fp32, el modelo ocupa aproximadamente 1,3 GB en memoria. En fp16 o con cuantización, puede reducirse a unos 650 MB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente, incluyendo GTX 1660, RTX 3060, RTX 4060 o superiores. También ejecutable en CPU para inferencia por lotes pequeña.
- Compatible con GPU de gama baja y entornos sin GPU: al ser un modelo de tamaño moderado, es viable su ejecución en CPU para transcripción offline sin requisitos de tiempo real.
- Opciones de despliegue: HuggingFace Transformers con PyTorch, HuggingFace Inference Endpoints (marcado como `endpoints_compatible`), y potencialmente ONNX Runtime o TensorRT si se exporta el modelo.
- Latencia y throughput: no disponibles. Los modelos CTC son notablemente más rápidos que los ASR autoregresivos, pero no se han publicado cifras concretas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Enfoque | Licencia |
|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-All-v2 (este) | 326 M | Wav2Vec2 + CTC | isiZulu / multilingüe | no disponible (hermano: apache-2.0) |
| uctnlp/omniASR-CTC-300m-v2-Zulu | 326 M | Wav2Vec2 + CTC | isiZulu | apache-2.0 |
| omniASR-LLM-300M-v2 (OmniLingual) | 300 M | LLM-ASR (decodificación autoregresiva) | 1600+ lenguas | apache-2.0 (proyecto origen) |

La diferencia principal con la variante LLM de OmniLingual es la velocidad: los modelos CTC priorizan la rapidez de inferencia frente a la precisión de los modelos basados en LLM, que incorporan contexto lingüístico más rico. La variante "Zulu-All" se distingue de la "Zulu" simple por un alcance lingüístico presumiblemente más amplio, aunque no se especifica la diferencia exacta en la documentación.

## Limitaciones y advertencias

- La licencia exacta de este modelo no está declarada en la model card; aunque el modelo hermano `omniASR-CTC-300m-v2-Zulu` usa apache-2.0, conviene confirmar los términos antes de uso comercial.
- No se han publicado métricas de WER o CER, por lo que el rendimiento real en transcripción no está cuantificado.
- Los modelos CTC no incorporan modelo de lenguaje externo, lo que puede producir transcripciones con errores de homófonos o falta de coherencia contextual en comparación con sistemas que integran LM.
- El modelo procesa audio a 16 kHz; grabaciones con otras frecuencias de muestreo requieren resampleo previo, lo que puede degradar la calidad si el audio original es de baja fidelidad.
- No se dispone de información sobre sesgos en el entrenamiento ni sobre el dataset específico utilizado para la variante Zulu.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que el modelo es reciente y aún no ha sido validado por la comunidad.
- El nombre "All" sugiere capacidades multilingües más amplias, pero no se documentan qué lenguas adicionales al isiZulu están realmente soportadas ni su calidad relativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uctnlp/omniASR-CTC-300M-v2-Zulu-All-v2
- Organización UCT NLP en HuggingFace: https://huggingface.co/uctnlp
- Modelo hermano (isiZulu, licencia apache-2.0): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu
- Repositorio OmniLingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
- Documentación de modelos CTC en OmniLingual: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- README de tarjetas de modelos OmniLingual: https://github.com/facebookresearch/omnilingual-asr/blob/main/src/omnilingual_asr/cards/README.md
