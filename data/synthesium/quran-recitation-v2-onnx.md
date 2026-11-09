# Synthesium/quran-recitation-v2-onnx

## Resumen

Synthesium/quran-recitation-v2-onnx es un repositorio que agrupa varios modelos de voz en formato ONNX int8 orientados a la recitación del Corán, desarrollado por el proyecto Synthesium para la aplicación fuKhushu. No se trata de un único modelo, sino de un paquete de tres componentes con funciones distintas: un reconocedor de voz (ASR) basado en el FastConformer árabe de NVIDIA, un alineador forzado CTC derivado de wav2vec2-large-xlsr-53-arabic y un juez de pronunciación a nivel de fonema basado en muaalem-model-v3_2. El objetivo es permitir la captura de recitación ayat por ayat de forma totalmente local en el dispositivo, sin enviar audio a servidores externos.

La relevancia del repositorio está en su enfoque de despliegue: todos los modelos están exportados a ONNX y cuantizados a int8 para ejecutarse en sherpa-onnx y onnxruntime, lo que permite inferencia en teléfonos y dispositivos de gama media. El reconocedor principal deriva de nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 (arquitectura híbrida RNNT/CTC de unos 115 millones de parámetros con salida diacritizada), mientras que el juez de pronunciación usa Wav2Vec2-BERT de 606 millones de parámetros con múltiples cabeceras CTC.

El repositorio tiene un tamaño de 3,6 GB, soporta únicamente árabe y emplea una licencia mixta: CC-BY-4.0 para el reconocedor, Apache-2.0 para el alineador y MIT para el juez de pronunciación. No se han publicado resultados de benchmarks propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: FastConformer RNNT/CTC (reconocedor), wav2vec2 CTC (alineador), Wav2Vec2-BERT con CTC multinivel (juez de pronunciación) |
| Parametros totales | ~115M (reconocedor), ~606M (juez de pronunciación), no disponible (alineador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de audio; ventana por utterance) |
| Tipos de cuantizacion | int8 dinámica (MatMul/Gemm por canal); el juez de pronunciación también se distribuye en fp32 |
| Idiomas soportados | Árabe (ar) |
| Licencia | Mixta: CC-BY-4.0 (reconocedor), Apache-2.0 (alineador), MIT (juez de pronunciación) |
| Formato de pesos | ONNX (int8 y fp32), tokens.txt / vocab.json / tokens.json |

## Arquitectura y entrenamiento

El repositorio combina tres arquitecturas con propósitos complementarios. El reconocedor es el FastConformer árabe de NVIDIA, un modelo híbrido RNNT/CTC de aproximadamente 115 millones de parámetros con salida diacritizada, entrenado por NVIDIA incluyendo el corpus EveryAyah. En este repositorio se exporta únicamente la rama RNNT al formato `nemo_transducer` de sherpa-onnx y se cuantiza dinámicamente a int8 (solo operaciones MatMul, cuantización por canal). El alineador forzado es un fine-tune de jonatasgrosman sobre wav2vec2-large-xlsr-53-arabic, exportado a ONNX en int8, que recibe la forma de onda raw a 16 kHz y emite logits por frame con frames de 20 ms; se usa para alineación forzada CTC sobre texto coránico conocido. El juez de pronunciación es obadx/muaalem-model-v3_2, un modelo Wav2Vec2-BERT de 606 millones de parámetros con CTC multinivel que transcribe fonemas coránicos incluyendo harakat, exportado a ONNX en fp32 (numéricamente equivalente al modelo PyTorch) y con una copia int8 de 651 MB para dispositivos móviles.

El modelo muaalem se basa en facebook/w2v-bert-2.0 y emplea características SeamlessM4T (log-mel de Kaldi con normalización por utterance y apilado de pares de frames), produciendo logits de fonemas [1, T', 43] más diez cabeceras de sifat a 40 ms por frame. La cuantización int8 de este componente mantiene en fp32 las 24 MatMul de atención. El proyecto no redistribuye el seguidor de fonemas en vivo de la aplicación, que usa Quran-Lab/zipformer_p-arabic-v3 bajo su propia licencia no lucrativa.

## Capacidades

- Reconocimiento automático de voz en árabe con salida diacritizada, orientado a recitación coránica.
- Alineación forzada CTC de texto coránico conocido sobre audio, con resolución de frames de 20 ms.
- Transcripción fonémica coránica con harakat y diez cabeceras de atributos (sifat) para evaluación de pronunciación.
- Detección y corrección de errores de pronunciación en aprendices de recitación (según el paper asociado arXiv:2509.00094).
- Ejecución totalmente local en dispositivo mediante sherpa-onnx y onnxruntime.
- Decodificación greedy (`greedy_search`) en el reconocedor y regla de decodificación greedy documentada en `tokens.json` para el juez de pronunciación.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá del procesamiento de voz.

## Casos de uso

- Captura de recitación ayat por ayat en aplicaciones móviles: el reconocedor RNNT int8 procesa audio a 16 kHz con un solo hilo y permite segmentar y validar cada versículo localmente, sin conexión.
- Corrección de pronunciación de estudiantes de tajwid: el juez muaalem transcribe fonemas con harakat y cabeceras de sifat, lo que permite comparar la salida del alumno con la referencia y señalar errores concretos.
- Alineación de audio con texto coránico: el alineador CTC int8 permite sincronizar una recitación grabada con el texto escrito para generar subtítulos o resaltados por palabra.
- Aplicaciones de memorización (hifz): el sistema puede verificar la recitación memorizada comparando la transcripción con el texto esperado y detectar omisiones o sustituciones.
- Despliegue offline en dispositivos de gama media: los pesos int8 y la integración con sherpa-onnx permiten ejecutar el pipeline completo en teléfonos sin GPU dedicada.
- Investigación en evaluación automática de pronunciación: el paquete sirve como referencia reproducible para experimentos de detección de errores fonéticos en árabe coránico.
- Herramientas educativas de análisis fonético: las diez cabeceras de sifat permiten estudiar características articulatorias de la recitación más allá de la simple transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el reconocedor int8 (~115M parámetros) requiere del orden de cientos de MB; el juez de pronunciación int8 ocupa 651 MB en disco y el fp32 requiere mantener el grafo y los pesos juntos (mayor huella). No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: no disponible; el diseño está orientado a CPU y dispositivos móviles mediante onnxruntime y sherpa-onnx.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se documentan requisitos ni rendimiento en GPU.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`), onnxruntime para el alineador y el juez de pronunciación.
- Latencia y throughput: no disponibles; el reconocedor se configura con `num_threads=1`, `sample_rate=16000`, `feature_dim=80` y `decoding_method="greedy_search"`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Synthesium/quran-recitation-v2-onnx (reconocedor) | ~115M | Árabe | ONNX int8 | CC-BY-4.0 | ASR coránico diacritizado |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | ~115M | Árabe | NeMo | CC-BY-4.0 | ASR árabe general (modelo base) |
| jonatasgrosman/wav2vec2-large-xlsr-53-arabic | no disponible | Árabe | PyTorch | Apache-2.0 | ASR/alineación CTC (modelo base) |
| obadx/muaalem-model-v3_2 | 606M | Árabe | PyTorch | MIT | Fonemas coránicos y sifat (modelo base) |

La comparativa se limita a los modelos base de los que deriva el paquete, ya que no se han identificado alternativas independientes equivalentes en la información disponible.

## Limitaciones y advertencias

- El repositorio no es un modelo único: requiere orquestar tres componentes con formatos de entrada y salida distintos.
- Solo soporta árabe; no hay capacidades multilingües documentadas.
- El reconocedor se distribuye únicamente con la rama RNNT exportada; la rama CTC del modelo original no está incluida.
- El seguidor de fonemas en vivo de la aplicación (Quran-Lab/zipformer_p-arabic-v3) no se redistribuye aquí y tiene una licencia no lucrativa propia, lo que limita reproducir el pipeline completo solo con este repositorio.
- La licencia es mixta y cada carpeta conserva su licencia upstream; es necesario respetar la atribución de NVIDIA, Jonatas Grosman, Meta y Abdullah (obadx) según corresponda.
- No se han publicado métricas de precisión, WER ni latencia en la información disponible, por lo que la evaluación en producción requiere validación propia.
- El juez de pronunciación en fp32 requiere mantener el grafo y el archivo de pesos juntos; un manejo incorrecto de los archivos impide la carga.
- Riesgo de errores en recitaciones con ruido de fondo, dialectos no estándar o pronunciación muy alejada de la referencia coránica; no se documenta el comportamiento en estos casos.

## Enlaces

- Hugging Face: https://huggingface.co/Synthesium/quran-recitation-v2-onnx
- Modelo base reconocedor: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Modelo base alineador: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-arabic
- Modelo base juez de pronunciación: https://huggingface.co/obadx/muaalem-model-v3_2
- Paper asociado: https://arxiv.org/abs/2509.00094
- Seguidor de fonemas (no redistribuido): https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ficha de terceros: https://free2aitools.com/model/synthesium/quran-recitation-v2-onnx
