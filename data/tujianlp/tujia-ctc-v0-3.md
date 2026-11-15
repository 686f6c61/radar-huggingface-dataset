# TujiaNLP/tujia-ctc-v0.3

## Resumen

tujia-ctc v0.3 es un sistema de reconocimiento automático del habla (ASR) especializado en tujia, una lengua minoritaria de la familia sino-tibetana hablada en la región de Xiangxi (China). Lo desarrolla el grupo TujiaNLP y resuelve un problema concreto: transcribir audio en tujia a nivel de sílaba con marcas de tono, algo que los sistemas ASR multilingües convencionales no cubren por la escasez de datos y la complejidad tonal del idioma.

El modelo no es un transformer completo entrenado desde cero, sino un sistema de dos piezas: un encoder wav2vec2-XLSR-53 (fine-tuned, distribuido por separado) seguido de una cabeza ligera compuesta por LayerNorm, dos capas BiLSTM de 256 unidades y una capa lineal que proyecta a 1.199 etiquetas (1.198 sílabas con tono más el token blank). La cabeza entrenable es minúscula: 4,82 millones de parámetros, unos 19 MB.

La relevancia de esta versión radica en la ampliación del inventario de etiquetas (de 708 a 1.198 sílabas tonadas) y en la mejora del error de sustitución, que baja de 0,5656 a 0,3057 en el conjunto de validación retenido. El precio es un aumento notable de las omisiones. Es una herramienta de investigación para lingüística de campo y documentación de lenguas, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-XLSR-53 fine-tuned + LayerNorm + 2x BiLSTM(256) + Linear(512 a 1199) |
| Parametros totales | 4.822.196 entrenables (solo cabeza, 19 MB); encoder distribuido aparte (~1,26 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana de decodificacion no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tji (tujia, dialecto septentrional) |
| Licencia | research-use-only (codigo bajo MIT) |
| Formato de pesos | .pt (PyTorch) para la cabeza; encoder en formato Hugging Face (config.json + pesos) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder wav2vec2-XLSR-53 preentrenado y fine-tuned (run `v03f`, derivado de `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, Apache-2.0) con una cabeza CTC ligera. La cabeza consta de LayerNorm, dos capas BiLSTM de 256 unidades y una proyección lineal de 512 a 1.199 dimensiones. Durante el entrenamiento se emplea además una cabeza auxiliar CTC de 4 clases para los tonos (21, 35, 53, 55), que no se usa en inferencia.

Los datos de entrenamiento proceden de grabaciones de terceros en tujia: 5.243 clips con audio y transcripción (no distribuidos). La mejor época fue la 8, con un SER de validación de 0,5126 sobre un split de 141 clips. La decodificación es CTC greedy, sin léxico ni rescoring con n-gramas. El encoder fine-tuned no es intercambiable con los pesos originales de XLSR-53 ni con el encoder de v0.2: los tres portan características distintas, por lo que es obligatorio usar `TujiaNLP/tujia-xlsr53-v03f`.

## Capacidades

- Reconocimiento de habla a nivel de sílaba en tujia (dialecto septentrional) con marcas de tono integradas en la etiqueta (por ejemplo `la35`, `tsʰi53`, `ɕiɛ35`).
- Salida con marcas temporales de inicio y fin por sílaba, más una puntuación de confianza por segmento.
- Salida estructurada en JSON mediante `--json out.json`.
- Decodificación de un fragmento concreto del audio mediante `--start` y `--duration`.
- Dos formatos de impresión de etiquetas: `ipa` y `ye`, seleccionables con `--format`.
- Inventario de 1.198 sílabas tonadas más blank (1.199 etiquetas en total).
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Documentación lingüística de campo: transcribir grabaciones de hablantes de tujia a secuencia de sílabas tonadas con marcas temporales, lo que acelera la anotación manual y permite revisar alineaciones sobre el audio original.
- Análisis fonológico y tonal: extraer la secuencia de tonos (21, 35, 53, 55) por sílaba para estudios de patrones tonales y comparación entre dialectos, usando la salida estructurada en JSON.
- Corpus paralelos para NLP de bajos recursos: generar transcripciones preliminares que, tras corrección humana, alimenten el entrenamiento de modelos posteriores de traducción o síntesis para tujia.
- Archivado y búsqueda de material audiovisual: indexar grabaciones por contenido silábico y marcas temporales para localizar fragmentos concretos en archivos de horas de duración.
- Herramienta auxiliar en docencia de la lengua: mostrar al estudiante la segmentación silábica y el tono detectado de una pronunciación, con la salvedad de la tasa de omisión.
- Investigación comparativa de ASR de bajos recursos: servir como línea base reproducible para experimentos con arquitecturas CTC sobre lenguas tonales minoritarias, dado que el paquete incluye script de inferencia, vocabulario y sumas de verificación.

## Benchmarks y rendimiento

Métricas de error de sílaba (SER) calculadas con alineamiento Needleman-Wunsch y decodificación CTC greedy, sobre 353 clips retenidos (0,40 h, 8 hablantes, 300 de ellos de un mismo profesor varón):

| Metrica | v0.2 | v0.3 |
|---|---|---|
| SER | 0.8627 | 0.7330 |
| SER sin tono | 0.7034 | 0.6457 |
| SER de tono | 0.6228 | 0.5832 |
| Tasa de sustitucion | 0.5656 | 0.3057 |
| Tasa de omision | 0.1941 | 0.3901 |
| Tasa de insercion | 0.1030 | 0.0372 |

El SER de 0,5126 sobre el split de validación de 141 clips no es una cifra independiente: ese split se usó para early stopping. El split de test de 856 clips empleado para v0.2 no es reutilizable porque 851 de sus clips están en el conjunto de entrenamiento de v0.3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder ocupa ~1,26 GB en disco y la cabeza 19 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el script admite `--device cpu` para ejecución sin GPU.
- Cabe en GPU de consumo: sí, con margen amplio, dado el reducido tamaño de la cabeza y el encoder XLSR-53 base.
- Opciones de despliegue: script `infer.py` incluido en el paquete (PyTorch + soundfile); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.
- Formatos de entrada: wav, flac y ogg vía soundfile; contenedores como mp4 o m4a requieren demux previo con ffmpeg (`ffmpeg -i video.mp4 -vn -ac 1 -ar 16000 audio.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER (retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-ctc v0.3 | 4,82 M (cabeza) + encoder XLSR-53 | no disponible | 0.7330 | research-use-only | Hugging Face y ModelScope (encoder) |
| tujia-ctc v0.2 | no disponible | no disponible | 0.8627 | research-use-only | Hugging Face |
| wav2vec2-XLSR-53 (base) | ~317 M | no disponible | no aplica (no entrena tujia) | Apache-2.0 | Hugging Face |

No se dispone de datos de otros sistemas ASR específicos para tujia en la información proporcionada.

## Limitaciones y advertencias

- Subgeneración: la tasa de omisión es de 0,3901 frente a 0,1941 en v0.2. En habla baja, rápida o de campo lejano el modelo pierde sílabas en lugar de producir sílabas erróneas; conviene contrastar la duración de la transcripción con el audio antes de fiarse de una salida corta.
- Solo datos de dominio: pocos hablantes y una única fuente de recolección; otros puntos dialectales probablemente degraden el rendimiento.
- Los errores de tono son el residuo dominante: aproximadamente un tono de cada tres es incorrecto en el conjunto retenido, con confusión repartida entre 21, 35, 53 y 55.
- Evaluación sesgada por profesor: 300 de los 353 clips retenidos provienen de un mismo profesor varón, lo que limita la generalización de las métricas.
- Licencia research-use-only: el uso comercial está restringido; solo el código se distribuye bajo MIT.
- El encoder fine-tuned es obligatorio y no sustituible por los pesos originales de XLSR-53 ni por el encoder de v0.2.
- `fetch_encoder.sh` es un script POSIX y no funciona en Windows; en ese caso hay que copiar manualmente la carpeta del encoder y definir `TUJIA_XLSR`.
- Acceso a Hugging Face desde China continental requiere proxy o el mirror de ModelScope / hf-mirror.com.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-ctc-v0.3
- Encoder fine-tuned: https://huggingface.co/TujiaNLP/tujia-xlsr53-v03f
- Modelo base del encoder: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Mirror en ModelScope: https://modelscope.cn/models/TujiaNLP/tujia-xlsr53-v03f
- Mirror de Hugging Face: https://hf-mirror.com
