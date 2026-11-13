# xiaoxiaojian/nemotron-3.5-asr-0.6b-325mb-gguf

## Resumen

`nemotron-3.5-asr-0.6b-325mb-gguf` es una cuantización mixta en formato GGUF del modelo de reconocimiento automático del habla `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por el usuario independiente xiaoxiaojian. El modelo base es un RNNT (transducer) cache-aware con arquitectura Conformer de aproximadamente 600 millones de parámetros, diseñado por NVIDIA para transcripción en streaming multilingüe. Esta versión comprime los pesos hasta 323,59 MB (308,6 MiB), es decir, 0,5072 bytes por peso sobre 637.991.968 elementos, lo que supone una reducción drástica frente a los aproximadamente 1,2 GB que ocuparía el checkpoint en fp16.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible llevar un modelo ASR de calidad a un presupuesto de 325 MB con una degradación medida y acotada: +1,23 puntos de WER/CER ponderado sobre el conjunto de test FLEURS de 17 locales (14,21 % frente a 12,98 % del fp16). Por otro, el artefacto está pensado para ejecutarse en CPU exclusivamente mediante `transcribe.cpp` 0.4.2, lo que lo sitúa en el terreno de la transcripción local, sin GPU y con latencia de streaming.

Es importante subrayar que se trata de una cuantización no oficial, sin afiliación ni respaldo de NVIDIA, y que el modelo base cubre 40 locales aunque solo 17 han sido evaluados en esta ficha. La licencia de los pesos es OpenMDW-1.1 y el código de conversión es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer cache-aware streaming RNNT (transducer) |
| Parámetros totales | 637.991.968 (≈638 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por chunks, no ventana de tokens de texto) |
| Tipos de cuantización | TQ1_0 (≈1,69 bpw), Q4_0 (4,5 bpw), Q8_0 (8,5 bpw), F32 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, pt, nl, ru, uk, pl, tr, vi, ar, hi (17 evaluados; el base declara 40 locales) |
| Licencia | OpenMDW-1.1 (pesos); MIT (scripts y parche) |
| Formato de pesos | GGUF (653 tensores, 323.593.760 bytes) |

## Arquitectura y entrenamiento

El modelo base es un RNNT (Recurrent Neural Network Transducer) con encoder Conformer y mecanismo cache-aware para streaming. La arquitectura combina capas convolucionales y de auto-atención, con un decodificador transducer que emite tokens de forma incremental a medida que llegan los frames de audio, lo que permite transcripción de baja latencia sin necesidad de segmentar el audio completo. El modelo base declara 40 language-locales y aproximadamente 600 M de parámetros; los datos concretos de entrenamiento (número de horas, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La innovación de esta ficha no está en la arquitectura, sino en la estrategia de cuantización. En lugar de aplicar un ancho uniforme, se asignaron anchos por módulo a partir de un análisis de sensibilidad y se exportaron a tipos estándar de ggml, sin kernels personalizados ni dequantización en tiempo de ejecución. El reparto resultante es: 106 tensores en `TQ1_0` (25,8 % de los elementos), 155 en `Q4_0` (67,9 %), 14 en `Q8_0` (6,2 %) y 378 en `F32` (0,1 %, correspondientes a normas, sesgos y embeddings pequeños). Los 106 tensores ternarios se concentran en 89 proyecciones de atención y 17 `ff1.linear2` (la proyección descendente 4096→1024), mientras que la proyección simétrica `ff1.linear1` (1024→4096) se mantiene en `Q4_0` en todas las capas. Esta asimetría responde al análisis de sensibilidad: la familia `feed_forward1.linear1` es la más sensible de la arquitectura y se conserva a mayor precisión.

## Capacidades

- Transcripción de voz a texto en streaming con latencia baja gracias al encoder cache-aware.
- Reconocimiento multilingüe en 17 locales evaluados (en, zh, ja, ko, de, fr, es, it, pt, nl, ru, uk, pl, tr, vi, ar, hi) y hasta 40 declarados por el modelo base.
- Manejo de métricas específicas por escritura: WER para lenguas alfabéticas y CER para chino, japonés y coreano.
- Ejecución en CPU sin GPU, orientada a despliegues en entornos con recursos limitados.
- Compatibilidad con `transcribe.cpp` 0.4.2 mediante un parche de 10 líneas.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción local en portátiles sin GPU: el modelo ocupa 323,59 MB y se ejecuta en CPU con `transcribe.cpp`, lo que permite dictado y subtitulado en máquinas modestas sin depender de servicios en la nube.
- Subtitulado en directo de reuniones y webinars: el modo streaming del RNNT cache-aware permite emitir texto a medida que llega el audio, adecuado para herramientas de accesibilidad en tiempo real.
- Procesamiento por lotes de archivos de audio en servidores sin acelerador: al no requerir GPU, se pueden lanzar múltiples instancias en paralelo sobre CPUs para transcribir archivos históricos.
- Aplicaciones de notas de voz multilingües: con 17 locales evaluados, cubre casos de usuarios que alternan español, inglés, francés, alemán o portugués en un mismo flujo de trabajo.
- Despliegue en dispositivos de borde y sistemas embebidos: el tamaño de 325 MB y la ausencia de dependencias de GPU lo hacen viable en entornos con memoria y cómputo restringidos, siempre que el hardware soporte los kernels de ggml.
- Investigación en cuantización extrema: el artefacto sirve como referencia reproducible para estudiar el compromiso entre ancho de bits y WER/CER en modelos ASR, con métricas por locale y un sha256 verificable.

## Benchmarks y rendimiento

Resultados en FLEURS test (11.947 utterances, 39,54 h), WER para 14 locales y CER para zh-CN, ja-JP y ko-KR, ponderados por número de utterances. Δ es la diferencia en puntos entre cuantizado y fp16 (positivo significa peor).

| Locale | n | fp16 | 325 MB | Δ (pt) | Métrica |
|---|---:|---:|---:|---:|---|
| zh-CN | 945 | 20,01 | 20,22 | +0,21 | CER |
| pt-BR | 919 | 8,91 | 9,40 | +0,49 | WER |
| es-419 | 908 | 6,54 | 6,91 | +0,37 | WER |
| it-IT | 865 | 6,41 | 6,86 | +0,45 | WER |
| de-DE | 862 | 11,05 | 12,78 | +1,73 | WER |
| vi-VN | 857 | 15,12 | 16,25 | +1,13 | WER |
| ru-RU | 775 | 13,46 | 14,72 | +1,26 | WER |
| pl-PL | 758 | 20,43 | 22,77 | +2,34 | WER |
| uk-UA | 750 | 16,39 | 19,15 | +2,76 | WER |
| tr-TR | 743 | 16,13 | 17,73 | +1,60 | WER |
| fr-FR | 676 | 11,62 | 13,26 | +1,64 | WER |
| ja-JP | 650 | 14,19 | 15,77 | +1,58 | CER |
| en-US | 647 | 10,84 | 11,15 | +0,31 | WER |
| ar-EG | 428 | 16,35 | 17,79 | +1,44 | WER |
| hi-IN | 418 | 9,22 | 10,56 | +1,34 | WER |
| ko-KR | 382 | 9,12 | 9,74 | +0,62 | CER |
| nl-NL | 364 | 14,63 | 17,75 | +3,12 | WER |
| **Ponderado** | **11.947** | **12,98** | **14,21** | **+1,23** | — |

Los mejores resultados se dan en chino (CER +0,21 pt) y en inglés (+0,31 pt); el peor es neerlandés (+3,12 pt). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 MB en GPU; el modelo está pensado para ejecución en CPU.
- GPU recomendadas: no aplica; el runtime declarado es `transcribe.cpp` 0.4.2 en CPU.
- Cabe en cualquier equipo con al menos ~350 MB de RAM libre para los pesos, más el overhead del runtime y del buffer de audio.
- Opciones de despliegue: `transcribe.cpp` 0.4.2 con un parche de 10 líneas; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nemotron-3.5-asr-0.6b-325mb-gguf | ≈638 M | streaming RNNT, sin contexto de texto | 17 evaluados / 40 declarados | OpenMDW-1.1 | GGUF |
| nvidia/nemotron-3.5-asr-streaming-0.6b (fp16) | ≈638 M | streaming RNNT | 40 declarados | OpenMDW-1.1 | safetensors |
| Whisper large-v3 | 1.550 M | no streaming nativo | ~99 | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | no streaming nativo | ~99 | MIT | safetensors, GGUF, etc. |

La comparación con Whisper es orientativa: se trata de arquitecturas distintas (encoder-decoder frente a RNNT cache-aware) y no se dispone de resultados de benchmarks cruzados en la información proporcionada. La ventaja diferencial de esta ficha es el tamaño (323,59 MB) y la ejecución en CPU con streaming nativo.

## Limitaciones y advertencias

- Cuantización no oficial: no está afiliada ni respaldada por NVIDIA; `nemotron` es una marca registrada de NVIDIA usada de forma descriptiva.
- El pipeline de exportación no es determinista byte a byte: dos ejecuciones de la misma configuración producen archivos distintos del mismo tamaño. Solo el sha256 `5d8c5e0afce2b9ad9a62d5927078c4a6c902f6de4e2bf0bd83b75b6206143776` identifica el artefacto.
- Degradación medible frente a fp16: +1,23 puntos ponderados en FLEURS, con casos de hasta +3,12 pt (neerlandés) y +2,76 pt (ucraniano).
- Solo 17 de los 40 locales declarados por el modelo base han sido evaluados; el rendimiento en el resto es desconocido.
- El presupuesto de 325 MB es un objetivo de diseño autoimpuesto, no un estándar externo ni una propiedad del modelo base.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; el código de conversión es MIT, pero los pesos no.
- Al ser un modelo ASR, no ofrece generación de texto, razonamiento, código ni tool calling; no debe evaluarse como un LLM.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en FLEURS o dominios especializados no está cuantificado en la información disponible.
- Requiere `transcribe.cpp` 0.4.2 más un parche de 10 líneas; no se garantiza compatibilidad con otras versiones ni runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/xiaoxiaojian/nemotron-3.5-asr-0.6b-325mb-gguf
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Revisión del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/ea30d66debe3740a08b573244286791d423d6b3e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
