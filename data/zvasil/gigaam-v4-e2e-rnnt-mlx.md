# zvasil/GigaAM-v4-e2e-rnnt-mlx

## Resumen

GigaAM-v4-e2e-rnnt-mlx es un port no oficial del modelo de reconocimiento automático del habla GigaAM-v4, desarrollado originalmente por el equipo GigaChat de Sber, adaptado para ejecutarse en Macs con Apple Silicon mediante el framework MLX. El modelo realiza transcripción de audio en ruso e inglés con salida estructurada en JSON que incluye puntuación, segmentación y marcas temporales a nivel de palabra en segundos.

El port mantiene el decodificador RNN-T (greedy) y el encoder Zapformer del modelo original, ejecutando el encoder y la cabeza E2E en FP32 sobre Metal. La detección de actividad de voz (VAD), la extracción de características log-mel y la construcción de marcas temporales se delegan al código original de GigaAM ejecutado en CPU. El repositorio incluye pesos, tokenizador y un script de transcripción listo para usar de forma totalmente offline.

Su relevancia radica en que permite ejecutar un ASR de calidad producción en hardware de consumo Apple sin depender de servicios en la nube, con una aceleración medida de aproximadamente 2× frente al decodificado CPU oficial de PyTorch en grabaciones reales. El tamaño del repositorio es de 0,5 GB, lo que facilita su distribución y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Zapformer (con atención completa) + decodificador RNN-T greedy (E2E) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por ventanas VAD y lotes de 4 segmentos ASR) |
| Tipos de cuantizacion | FP32 (único formato documentado en el port) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder y cabeza E2E convertidos desde `v4_rnnt.ckpt`); VAD en safetensors; tokenizador incluido |

## Arquitectura y entrenamiento

El modelo original GigaAM-v4 emplea un encoder basado en Zapformer (arquitectura derivada del trabajo de Xiaomi Corp., Daniel Povey y Zengwei Yao, con licencia Apache-2.0) con atención de contexto completo, acoplado a una cabeza de decodificación RNN-T en modo E2E. El port MLX ejecuta el encoder y la cabeza E2E en FP32 sobre Metal, mientras que el pipeline de VAD, extracción de log-mel y alineamiento temporal se ejecuta en CPU usando el código oficial de GigaAM en una revisión fijada (`fc30525741be9c11e4d014814a2df3113730da19`).

Los pesos del encoder y la cabeza E2E se convierten desde el checkpoint oficial `v4_rnnt.ckpt` (SHA-256 `3b44d3f09af3619e5a36efa86debc2807158e077457d41f683b9155ca7bd5f19`), y el resultado de la conversión tiene SHA-256 `7c17b9d0372f003bb80521f22c79af696610b43cae0e76c1eb86751647f3f270`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica principal del port es la reimplementación del decoder RNN-T greedy y del encoder en MLX para aprovechar la GPU unificada de Apple Silicon, manteniendo equivalencia exacta con la salida oficial.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso e inglés sobre archivos de audio WAV.
- Salida estructurada en JSON con campo `text` (transcripción completa), `duration` (duración del audio) y `segments`, cada uno con texto y array `words` que incluye `text`, `start` y `end` en segundos.
- Puntuación automática incluida en la transcripción.
- Marcas temporales absolutas a nivel de palabra, con pausas contabilizadas en los timecodes.
- Detección de actividad de voz (VAD) para segmentación previa al reconocimiento.
- Manejo de silencio: devuelve una lista vacía de segmentos cuando no hay habla.
- Ejecución totalmente offline tras la descarga inicial de pesos.
- No incluye etiquetas de idioma por segmento ni diarización de hablantes en la salida.
- No soporta tool calling, function calling ni razonamiento multi-step (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo procesa grabaciones de Zoom o Plaud de más de 15 minutos generando segmentos con marcas temporales por palabra, adecuado para generar actas indexadas y buscables. En la comparativa del autor, una grabación de Zoom de 15:59 con 2.232 palabras se transcribió en 8,81 s en un M4 Pro.
- Subtitulado automático de vídeo: la salida JSON con `start` y `end` por palabra permite generar archivos de subtítulos (SRT/VTT) con sincronización precisa, incluyendo puntuación para mejorar la legibilidad.
- Procesamiento por lotes de corpus en ruso: el port incluye un ejemplo con 24 frases rusas de FLEURS procesadas en un único WAV de 5:06 en 2,70 s, lo que lo hace viable para transcribir grandes volúmenes en local sin coste por API.
- Investigación en ASR sobre Apple Silicon: sirve como referencia reproducible para comparar decodificación MLX frente a PyTorch CPU, con equivalencia verificada de 148 segmentos y 3.597 palabras en tres WAV de prueba.
- Aplicaciones de dictado offline en macOS: al ejecutarse sin conexión y con pesos de 0,5 GB, puede integrarse en herramientas de escritorio que requieran privacidad de datos y no puedan enviar audio a la nube.
- Análisis de llamadas o entrevistas en ruso/inglés: la estructura por segmentos y palabras facilita el post-procesado (búsqueda de términos, extracción de citas con timecode) en pipelines de análisis de conversaciones.
- Generación de datasets etiquetados: las marcas temporales a nivel de palabra permiten alinear transcripciones con audio para construir corpus de entrenamiento o evaluación de otros sistemas ASR.

## Benchmarks y rendimiento

El autor publica una comparativa de velocidad entre el decodificado CPU oficial de GigaAM v4 (PyTorch, 6 hilos) y este port MLX (mediana de tres procesos) en un MacBook Pro con Apple M4 Pro y 24 GiB de memoria unificada. La exactitud se verificó comparando la salida con el decodificado CPU oficial: coincidencia total en 148 segmentos y 3.597 palabras, incluyendo puntuación y timecodes absolutos. No se midió precisión frente a transcripción manual.

| WAV | Duración | Segmentos | Palabras | v4 CPU oficial | Port MLX | Aceleración |
|---|---:|---:|---:|---:|---:|---:|
| Grabación Plaud | 13:39 | 54 | 926 | 12,06 s | 4,95 s | ~2,44× |
| Grabación Zoom | 15:59 | 69 | 2.232 | 17,89 s | 8,81 s | ~2,03× |
| FLEURS, 24 frases rusas | 5:06 | 25 | 439 | 6,20 s | 2,70 s | ~2,30× |

No se han publicado resultados de benchmarks de precisión (WER/CER) en la información disponible.

## Requisitos de hardware

- Hardware mínimo: macOS sobre Apple Silicon (probado en M4 Pro con 24 GiB de memoria unificada). No se documenta soporte para Intel ni para GPU NVIDIA.
- Memoria: el repositorio pesa 0,5 GB y los pesos se ejecutan en FP32; 24 GiB de memoria unificada son suficientes según la prueba del autor. No se especifica el mínimo exacto.
- VRAM estimada: no aplica en el sentido tradicional; se usa memoria unificada. No disponible una cifra mínima concreta.
- GPU recomendadas: chips de la familia Apple M (M1/M2/M3/M4 y variantes Pro/Max/Ultra) por el soporte de MLX y Metal. No se documentan pruebas en modelos concretos distintos del M4 Pro.
- Cabe en GPU de consumo: sí, en Apple Silicon; no está pensado para GPU discretas de consumo (RTX) en este port.
- Despliegue: script `transcribe.py` con MLX; requiere Git, FFmpeg, `uv` y Python 3.13. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: según la tabla anterior, entre 2,03× y 2,44× más rápido que el decodificado CPU oficial en las grabaciones probadas, midiendo desde el arranque de Python hasta la salida JSON (incluye carga de pesos, preparación de audio, VAD y decodificación; sin diarización).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Ejecución local | Notas |
|---|---|---|---|---|---|
| zvasil/GigaAM-v4-e2e-rnnt-mlx | Zapformer + RNN-T (MLX) | ru, en | MIT | Apple Silicon (MLX) | Port del original, ~2× más rápido que CPU oficial |
| ai-sage/GigaAM-v4 (original) | Zapformer + RNN-T (PyTorch) | ru, en | MIT | CPU/GPU PyTorch | Modelo base; salida de referencia |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | MIT | Amplio soporte (CPU, GPU, MLX, etc.) | Referencia generalista; no se dispone de comparación directa en la información |
| Vosk / Kaldi | HMM-DNN | varios | Apache-2.0 | CPU | Enfoque clásico de ASR; no comparable en arquitectura |

No se dispone de datos de benchmarks de precisión que permitan una comparación cuantitativa con Whisper u otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Port no oficial: no está mantenido por Sber ni por el equipo GigaChat; la validez de futuras actualizaciones no está garantizada.
- Solo procesa archivos de audio (WAV) ya grabados; no hay modo streaming ni reconocimiento en tiempo real documentado.
- Solo ruso e inglés; no se documenta soporte para otras lenguas.
- No incluye etiquetas de idioma por segmento ni diarización de hablantes en la salida.
- Ejecución en FP32 únicamente; no se documentan versiones cuantizadas (por ejemplo, int8 o int4) para reducir memoria.
- Dependencia de macOS y Apple Silicon; no funciona en Linux, Windows ni en GPU NVIDIA con este port.
- La exactitud se validó contra el decodificado CPU oficial, no contra transcripción manual; el WER real en dominios ruidosos o con acentos no está medido.
- Riesgo de errores en nombres propios, siglas y términos técnicos inherente a los modelos ASR; no se documentan evaluaciones específicas de sesgo.
- Licencia MIT permite uso comercial, pero se debe respetar la atribución de los componentes (Zapformer bajo Apache-2.0, código GigaAM bajo MIT) según `NOTICE.md`.
- El rendimiento medido corresponde a un único equipo (M4 Pro, 24 GiB); puede variar en otros chips Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zvasil/GigaAM-v4-e2e-rnnt-mlx
- Modelo base original: https://huggingface.co/ai-sage/GigaAM-v4
- Código oficial de GigaAM (revisión fijada): https://github.com/salute-developers/GigaAM/tree/fc30525741be9c11e4d014814a2df3113730da19
- Código del decodificador oficial: https://github.com/salute-developers/GigaAM/blob/fc30525741be9c11e4d014814a2df3113730da19/gigaam/model.py
- Checkpoint original Sber `v4_rnnt.ckpt`: https://cdn.chatwm.opensmodel.sberdevices.ru/GigaAM/v4_rnnt.ckpt
- Licencia MIT del port: https://huggingface.co/zvasil/GigaAM-v4-e2e-rnnt-mlx/blob/main/LICENSE
- Atribución y licencias de componentes: https://huggingface.co/zvasil/GigaAM-v4-e2e-rnnt-mlx/blob/main/NOTICE.md
- Ejemplo de audio público (FLEURS, CC BY 4.0): https://huggingface.co/zvasil/GigaAM-v4-e2e-rnnt-mlx/blob/main/NOTICE.md#public-audio-example
