# zmakra/sherpa-onnx-parakeet-tdt-0.6b-v3-int8pc

## Resumen

`zmakra/sherpa-onnx-parakeet-tdt-0.6b-v3-int8pc` es una exportación cuantizada a 8 bits por canal (per-channel int8) del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B v3, empaquetada en formato ONNX para su uso con la librería sherpa-onnx mediante `OfflineRecognizer` con `model_type = "nemo_transducer"`. Lo publica el usuario zmakra (no NVIDIA) como derivado del export fp32 de csukuangfj, y su objetivo declarado es la dictado push-to-talk en dispositivos Android dentro de la aplicación Group Chat.

El problema que resuelve es concreto: el export int8 previo perdía precisión de forma notable en húngaro (27 % de WER frente al 11 % del fp32), mientras que esta variante per-channel mantiene la precisión del modelo original con un tamaño aproximadamente 3 veces menor. El modelo base es un transducer TDT (Token-and-Duration Transducer) de NVIDIA, con arquitectura NeMo y 0,6 mil millones de parámetros, que cubre 25 idiomas europeos.

Es relevante para desarrolladores que necesiten ASR multilingüe en local, sin GPU y con un consumo de memoria contenido (unos 1,1 GB en decodificación), integrable en apps móviles mediante la API Android/Kotlin de sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo transducer TDT (Token-and-Duration Transducer) exportado a ONNX |
| Parametros totales | 0,6 mil millones (modelo base NVIDIA Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmento de audio, no autoregresivo de texto) |
| Tipos de cuantizacion | int8 por canal (per-channel, simetrico, uint8 con zero point 128); solo el encoder esta cuantizado; decoder y joiner permanecen en fp32 |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.weights`, `decoder.onnx`, `joiner.onnx`, `tokens.txt`) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de NeMo: un encoder acústico que procesa características de 80 dimensiones a 16 kHz, un decoder (predictor) y un joiner que combina ambos. La innovación TDT reside en predecir conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un transducer convencional. Esta exportación no reentrena nada: parte del fp32 ONNX de csukuangfj (revisión `1a468a35`) y solo cuantiza el encoder.

La cuantización aplica int8 simétrico por columna de salida (`scale = max|w| / 127`, `q = clip(round(w / scale), -127, 127)`) a cada `MatMul` del encoder cuyo peso sea un inicializador fp32 2-D usado exclusivamente por ese `MatMul`. Las convoluciones, LayerNorm y los `MatMul` activación×activación permanecen en fp32. Los pesos se almacenan como uint8 con zero point 128 para evitar la ruta u8×s8 de `MatMulInteger`, que satura en CPUs x86 con AVX2 sin VNNI; el grafo sigue la forma de la cuantización dinámica de ONNX Runtime (`DynamicQuantizeLinear → MatMulInteger → Cast → Mul`). El script de cuantización (`tools/quant_stream.py`) es determinista: la reconstrucción en Apple Silicon produjo checksums SHA-256 idénticos.

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeos, incluidos eslavos, bálticos, nórdicos y romances.
- Transcripción offline por segmento de audio (`OfflineRecognizer`), adecuada para dictado push-to-talk.
- Decodificación greedy search con `model_type = "nemo_transducer"`.
- Entrada de audio a 16 kHz con `feature_dim = 80`.
- Ejecución en CPU sin GPU, con hilos configurables (`num_threads`).
- Integración con la API Android/Kotlin de sherpa-onnx (`OfflineTransducerModelConfig`).
- No soporta tool calling, agentes, visión ni audio en streaming continuo (es un modelo offline).

## Casos de uso

- Dictado push-to-talk en Android: el modelo está diseñado para grabar un segmento corto y transcribirlo en local con unos 1,1 GB de memoria en decodificación, sin conexión ni servidor.
- Transcripción multilingüe de reuniones: con 25 idiomas cubiertos se puede procesar audio de participantes en distintas lenguas europeas segmento a segmento.
- Subtitulado offline de contenido pregrabado: al ser un modelo offline, se trocea el audio y se transcriben los fragmentos con decodificación greedy.
- Aplicaciones de notas de voz: integración en apps de productividad que convierten grabaciones en texto sin enviar audio a la nube, útil por privacidad.
- Procesamiento por lotes en servidores sin GPU: el tamaño de 954 MB en disco y el consumo moderado permiten ejecutar transcripciones masivas en CPU x86 con AVX2.
- Sistemas de accesibilidad: dictado para usuarios con movilidad reducida en dispositivos de gama baja, ya que no requiere acelerador hardware.
- Investigación en ASR multilingüe: punto de partida cuantizado para comparar precisión int8 frente a fp32 en distintos idiomas.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre un conjunto húngaro de 2 grabaciones de teléfono (Samsung Galaxy A20e, 16 kHz, push-to-talk) y 3 muestras de FLEURS (hu), 62 palabras de referencia en total, con decodificación greedy en sherpa-onnx 2.0.1 sobre servidor x86 con AVX2:

| Modelo | Errores de palabra | WER |
|---|---:|---:|
| int8 previo (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`) | 17 | 27 % |
| int8pc (este repositorio) | 7 | 11 % |
| fp32 base | 7 | 11 % |

En una de las grabaciones telefónicas el int8 previo derivó a inglés (palabras inglesas fonéticamente similares), mientras que int8pc mantuvo la transcripción húngara igual que fp32. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- Memoria en decodificación: aproximadamente 1,1 GB según el autor.
- Tamaño en disco: unos 954 MB en total (`encoder.weights` 837 MB, `decoder.onnx` 47 MB, `encoder.onnx` 44 MB, `joiner.onnx` 25 MB, `tokens.txt` 94 KB).
- GPU: no requiere GPU; está pensado para CPU. No se especifican GPU recomendadas.
- Cabe en cualquier dispositivo con al menos ~1,5 GB de RAM libre, incluidos teléfonos Android de gama media.
- Despliegue: sherpa-onnx (`OfflineRecognizer.from_transducer`), con API Python y Android/Kotlin. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo ASR ONNX).
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de compatibilidad: en CPUs x86 con AVX2 sin VNNI la ruta u8×s8 satura, por lo que este export usa uint8 con zero point 128 para funcionar correctamente tanto en x86 como en ARM.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Cuantizacion | WER (hu, test del autor) | Licencia | Formato |
|---|---|---|---|---|---|---|
| int8pc (este repo) | 0,6 B | 25 | int8 por canal (solo encoder) | 11 % | CC-BY-4.0 | ONNX (sherpa-onnx) |
| `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` | 0,6 B | 25 | int8 | 27 % | CC-BY-4.0 | ONNX (sherpa-onnx) |
| fp32 base (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3`) | 0,6 B | 25 | ninguna (fp32) | 11 % | CC-BY-4.0 | ONNX (sherpa-onnx) |
| `akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8` | 0,6 B | inglés (v2) | int8 | no disponible | no disponible | ONNX (sherpa-onnx) |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no incluye datos de otros sistemas ASR comparables.

## Limitaciones y advertencias

- La evaluación es muy reducida: 5 muestras y 62 palabras en un solo idioma (húngaro); no hay evidencia publicada del rendimiento en los otros 24 idiomas.
- La verificación en dispositivo Android está pendiente según el propio autor; solo se ha medido en servidor x86.
- Solo el encoder está cuantizado; decoder y joiner en fp32 elevan el tamaño total frente a un int8 completo.
- Riesgo de deriva de idioma en audio ruidoso o con acento marcado, como mostró el int8 previo; no se ha caracterizado el comportamiento de int8pc fuera del conjunto de prueba.
- No es un modelo de lenguaje: no genera texto libre, no razona ni soporta tool calling; cualquier uso fuera de ASR no aplica.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria a NVIDIA (Parakeet TDT 0.6B v3) y a csukuangfj (export sherpa-onnx).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni soporte.
- No se dispone de información sobre sesgos por idioma, dialecto o género más allá de lo indicado.

## Enlaces

- Hugging Face: https://huggingface.co/zmakra/sherpa-onnx-parakeet-tdt-0.6b-v3-int8pc
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export fp32 de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Export int8 previo: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Documentación sherpa-onnx Parakeet TDT 0.6B v2: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/offline-transducer/nemo/parakeet-tdt-0.6b-v2.html
- Variante v2 int8 de otro autor: https://huggingface.co/akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
