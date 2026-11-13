# xix3r/voxix-parakeet-ctc-0.6b-gguf

## Resumen
voxix-parakeet-ctc-0.6b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla nvidia/parakeet-ctc-0.6b, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. El modelo original es un FastConformer-Large con cabeza CTC lineal de aproximadamente 608 millones de parámetros, desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai. Su función es la transcripción offline de voz en inglés, con salida en minúsculas y sin puntuación.

La relevancia de esta conversión radica en que empaqueta un modelo ASR de calidad contrastada en cuantizaciones que van desde 469 MB (Q4_K_M) hasta 2,44 GB (F32), lo que permite ejecutar transcripción en hardware de consumo, incluidos portátiles Apple Silicon y CPUs x86 con backend Vulkan. Los valores de WER reportados en LibriSpeech test-clean se mantienen estables entre cuantizaciones (1,84-1,90 %), lo que indica que la compresión apenas degrada la precisión.

El modelo no es un LLM: no genera texto libre ni razona, sino que emite secuencias de tokens CTC a partir de audio de 16 kHz mono. No soporta streaming, traducción ni detección de idioma, y está limitado al inglés. Su interés para desarrolladores e investigadores está en el despliegue local y de baja latencia de transcripción con una licencia permisiva (CC-BY-4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large (encoder Conformer) con cabeza CTC lineal |
| Parametros totales | 608.848.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la información) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es un FastConformer CTC, una variante del encoder Conformer optimizada para ASR que combina atención multi-cabeza con convoluciones depthwise y reduce la resolución temporal de las representaciones. Sobre el encoder se sitúa una cabeza CTC lineal que decodifica con estrategia greedy, sin modelo de lenguaje externo. La conversión a GGUF preserva esta topología y se validó contra la referencia de NeMo en el commit 42528dd de transcribe.cpp, partiendo del commit upstream ad09ba1 de NVIDIA fijado el 2026-05-10.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo CTC). La innovación práctica de esta publicación es la cuantización K-quant y Q8_0 para transcribe.cpp, que permite ejecutar el modelo en CPU y GPU integradas manteniendo el WER prácticamente idéntico al de la referencia F32.

## Capacidades
- Transcripción de voz a texto offline en inglés, con salida en minúsculas y sin puntuación.
- Decodificación CTC greedy sin modelo de lenguaje externo.
- Marcas de tiempo a nivel de token (timestamps: token según la model card).
- Conversión de audio de entrada a 16 kHz mono WAV (requiere preprocesado con ffmpeg si el origen es MP3 u otro formato).
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas AMD).
- No soporta streaming.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso
- Transcripción de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono de forma offline y devuelve texto plano en inglés, adecuado para actas automáticas en entornos sin conectividad.
- Subtitulado por lotes de archivos multimedia: integrado en un pipeline con ffmpeg para la conversión de formato y transcribe-cli para la inferencia, permite generar transcripciones de catálogos de vídeo con coste de cómputo bajo.
- Notas de voz en aplicaciones de escritorio: con la cuantización Q4_K_M (469 MB) el modelo cabe en memoria de un portátil convencional y puede ejecutarse en CPU con un factor de tiempo real de 10x en un Ryzen 4750U.
- Procesamiento en Apple Silicon: el backend Metal alcanza un RTF de 218,5 en un chip M4 Max, lo que habilita transcripción casi instantánea en herramientas locales para macOS.
- Investigación en ASR: sirve como referencia reproducible para comparar cuantizaciones GGUF frente al checkpoint NeMo original, con WER medido sobre LibriSpeech test-clean.
- Indexación de archivos de audio en buscadores internos: la transcripción previa permite alimentar motores de búsqueda de texto sobre grabaciones corporativas en inglés.
- Evaluación de pipelines de voz en CI: al ser un binario CLI con modelo GGUF, se puede incorporar en pruebas automatizadas que verifiquen la calidad de transcripción de muestras fijas.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,87 | 1,87 | 1,87 | 1,84 | 1,87 | 1,90 |
| Tamano (GB) | 2,44 | 1,22 | 0,722 | 0,594 | 0,533 | 0,469 |

| Entorno | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 218,5 |
| Apple M4 Max | CPU | 30,5 |
| AMD Ryzen 4750U | Vulkan | 22,5 |
| AMD Ryzen 4750U | CPU | 10 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificación CTC greedy y sin modelo de lenguaje externo. La referencia F32 es 1,87 %, coincidente con el valor autoinformado por NVIDIA.

## Requisitos de hardware
- VRAM/RAM estimada: entre 469 MB (Q4_K_M) y 2,44 GB (F32) para los pesos; se requiere memoria adicional para buffers de audio y decodificación.
- GPU recomendadas: no se especifican modelos concretos; los datos disponibles cubren Apple M4 Max (Metal) y AMD Ryzen 4750U con GPU integrada (Vulkan).
- Cabe en GPU de consumo: sí, por tamaño (menos de 2,5 GB en F32 y menos de 0,5 GB en Q4_K_M), aunque no se aportan mediciones en RTX 4090, A100 o H100.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario transcribe-cli); el modelo base también es ejecutable con NeMo y con Transformers.
- Latencia y throughput: RTF de 218,5 (Metal en M4 Max), 30,5 (CPU en M4 Max), 22,5 (Vulkan en Ryzen 4750U) y 10 (CPU en Ryzen 4750U).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| xix3r/voxix-parakeet-ctc-0.6b-gguf | 608,8 M | en | GGUF | CC-BY-4.0 | Conversion para transcribe.cpp, WER 1,87 % en test-clean |
| nvidia/parakeet-ctc-0.6b | 608,8 M | en | safetensors (NeMo) | CC-BY-4.0 | Modelo base, misma arquitectura y WER de referencia |
| Otras variantes de la familia Parakeet | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la informacion disponible |

## Limitaciones y advertencias
- Solo inglés: no transcribe otros idiomas ni detecta el idioma de entrada.
- No es streaming: requiere el audio completo (o segmentos) antes de transcribir.
- No traduce: únicamente transcribe en el idioma de origen.
- Salida sin puntuación ni mayúsculas, lo que limita su uso directo en documentos finales sin postprocesado.
- Riesgo de alucinación inherente a los modelos CTC en audio con ruido, silencios largos o habla solapada; no se han publicado tasas de error fuera de LibriSpeech.
- Sesgos: no se documentan en la información disponible; al entrenarse presumiblemente con corpus mayoritariamente de inglés estadounidense, puede degradarse con acentos no nativos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original y respetar los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; conviene validar la conversión en el propio entorno antes de usarla en producción.
- El modelo base está fijado al commit ad09ba1; cambios posteriores en NVIDIA no se reflejan en esta conversión.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-ctc-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Commit upstream fijado: https://huggingface.co/nvidia/parakeet-ctc-0.6b/commit/ad09ba1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-0.6b.md
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
