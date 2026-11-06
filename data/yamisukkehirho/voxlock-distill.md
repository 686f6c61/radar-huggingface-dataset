# YamiSukkehirho/voxlock-distill

## Resumen

VoxLock-distill es una colección de variantes destiladas y cuantizadas de VoxLock, un modelo de aislamiento de voz objetivo (target-speaker extraction, TSE) orientado a llamadas telefónicas. El modelo original, desarrollado por arbazsiddiqui, separa la voz del interlocutor objetivo del ruido de fondo y de otras voces presentes en la señal. Esta versión, publicada por YamiSukkehirho, reduce el tamaño y el coste computacional para que pueda ejecutarse en CPUs de Android de gama baja mediante onnxruntime.

Técnicamente se trata de una familia de estudiantes con arquitectura TSE-BSRNN (red recurrente con separación de flujo), versiones más estrechas y menos profundas del modelo docente, destiladas sobre llamadas de LibriSpeech (CC-BY-4.0) y auriculares de AMI (CC-BY-4.0). El repositorio incluye múltiples configuraciones que varían en anchura (24 a 128 canales), número de bloques (2 a 6) y salto de trama (128 u 256 muestras), con cuantizaciones int8, q8_mask y q8_mlp en formato ONNX y ORT.

La relevancia actual reside en que ofrece un compromiso explícito y medido entre calidad de separación y velocidad: la variante recomendada `x7-fd64x4-h256` mantiene un WER de 5,14 % frente al 5,10 % del docente, con una aceleración de aproximadamente 6-7 veces en un solo hilo de CPU. Esto habilita el procesamiento de voz en tiempo real en dispositivos móviles sin GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TSE-BSRNN (target-speaker extraction con separación de flujo recurrente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por tramas de 16 ms o 8 ms según variante) |
| Tipos de cuantizacion | int8, q8_mask, q8_mlp; enroll en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, ORT (onnxruntime), checkpoint PyTorch en formato wesep (config.yaml + avg_model.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TSE-BSRNN del VoxLock original: una red recurrente con separación de flujo que opera sobre tramas de audio y produce una máscara aplicada a la señal de entrada para aislar al hablante objetivo. Las variantes destiladas reducen la anchura (de 128 a 24-64 canales) y el número de bloques (de 6 a 2-4), manteniendo la estructura general. Los estudiantes con HOP=256 procesan tramas de 16 ms en lugar de 8 ms, lo que reduce a la mitad el trabajo por segundo de audio y baja la latencia algorítmica de 24 ms a 16 ms.

El entrenamiento se realizó mediante destilación sobre llamadas de LibriSpeech (CC-BY-4.0) y auriculares de AMI (CC-BY-4.0). El benchmark Krisp se utilizó exclusivamente para evaluación, no para entrenamiento. Las variantes v2 (`x7`, `x11`) incorporan mejoras sobre las v1 (`x10`, `x17`, `x21`), que presentan mayores pérdidas de WER. El repositorio incluye el parche `code/voxlock_core_hop256.patch` necesario para que el paquete `voxlock` cargue los modelos con HOP=256 y los formatos `.ort` y enroll fp16; los modelos con hop 128 cargan en el paquete estándar y en sherpa-onnx.

## Capacidades

- Aislamiento de voz objetivo (target-speaker extraction) en señales de llamada con ruido de fondo y múltiples hablantes.
- Extracción de la voz del interlocutor objetivo a partir de una señal de enrolamiento.
- Procesamiento en tiempo real con latencia algorítmica de 16 ms (HOP=256) o 24 ms (HOP=128).
- Ejecución en CPU de Android de gama baja mediante onnxruntime con formato ORT preoptimizado para ARM.
- Múltiples niveles de cuantización para ajustar tamaño y velocidad (int8, q8_mask, q8_mlp).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente de audio a audio.

## Casos de uso

- Aislamiento de voz en llamadas VoIP en dispositivos móviles: el modelo puede ejecutarse en el propio teléfono con onnxruntime y la variante `x7-fd64x4-h256`, eliminando la voz de fondo del entorno del usuario antes de enviar el audio, con un coste de RTF de 0,089 en un solo hilo.
- Cancelación de ruido en auriculares con micrófono: la variante `x11-fd48x3-h256` ofrece un RTF de 0,048 y un WER de 6,48 %, adecuada para procesar la señal del micrófono en tiempo real en hardware embebido.
- Transcripción asistida en reuniones: el modelo separa la voz del hablante objetivo de otras voces en grabaciones de AMI, mejorando la precisión de sistemas ASR posteriores al reducir las interferencias.
- Preprocesado para pipelines de ASR en centros de llamadas: al aplicar el aislamiento antes de la transcripción, se reduce el WER del sistema completo; el modelo docente cuantizado `teacher-q8` mantiene un WER de 5,08-5,12 % con un tamaño de 24,3-45,3 MB para el chunk.
- Aplicaciones de accesibilidad auditiva: el aislamiento de la voz del interlocutor en tiempo real puede integrarse en audífonos o aplicaciones de ayuda a la escucha, usando la variante `x7` con RTF inferior a 0,1.
- Procesamiento por lotes en servidores sin GPU: las variantes más ligeras (`x21-fd24x2-h256`) permiten procesar grandes volúmenes de audio con un RTF de 0,025-0,029 por hilo, a costa de un WER de 14,28-14,56 %.
- Integración en sherpa-onnx: los modelos con hop 128 (`x5-fd64x4-h128`) cargan en el paquete estándar y en sherpa-onnx, facilitando su despliegue en aplicaciones existentes de reconocimiento de voz.

## Benchmarks y rendimiento

Resultados del Krisp Voice Isolation Benchmark (265 grabaciones, Parakeet TDT 0.6B v2, puntuación propia del benchmark). RTF medido en Apple M4 Pro, un hilo, onnxruntime nativo 1.31.1. "vs int8" es la diferencia de WER emparejada respecto a VoxLock int8 con intervalo de confianza del 95 % por bootstrap agrupado por interlocutor.

| Variante | Ancho×bloques | Hop | Archivo | MB (chunk + enroll) | WER % | vs int8 | Fuga/min | RTF 20 ms | Aceleración |
|---|---|---|---|---|---|---|---|---|---|
| VoxLock publicado, `chunk_int8.onnx` (base) | 128×6 | 128 | — | 56,6 + 21,0 | 5,10 | — | 0,18 | 0,521 | ×1,0 |
| `teacher-q8` | 128×6 | 128 | `chunk_q8_mask.ort` | 24,3 + 10,9 | 5,08 | −0,02 [−0,21; +0,24] | 0,15 | 0,398 | ×1,3 |
| `teacher-q8` | 128×6 | 128 | `chunk_q8_mlp.ort` | 45,3 + 10,9 | 5,12 | +0,02 [−0,19; +0,27] | 0,16 | 0,435 | ×1,2 |
| `x5-fd64x4-h128` | 64×4 | 128 | `chunk_q8_mask.ort` | 7,6 + 8,7 | 5,33 | +0,23 [−0,28; +0,85] | 1,99 | 0,109 | ×4,8 |
| `x5-fd64x4-h128` | 64×4 | 128 | `chunk_q8_mlp.ort` | 11,0 + 8,7 | 5,12 | +0,01 [−0,41; +0,62] | 1,39 | 0,127 | ×4,1 |
| `x5-fd64x4-h128` | 64×4 | 128 | `chunk_int8.ort` | 15,8 + 8,7 | 5,12 | +0,01 [−0,35; +0,47] | 1,23 | 0,141 | ×3,7 |
| `x7-fd64x4-h256` | 64×4 | 256 | `chunk_int8.ort` | 15,8 + 8,7 | 5,14 | +0,03 [−0,35; +0,57] | 1,44 | 0,089 | ×5,9 |
| `x7-fd64x4-h256` | 64×4 | 256 | `chunk_q8_mask.ort` | 7,6 + 8,7 | 5,24 | +0,14 [−0,27; +0,68] | 1,83 | 0,071 | ×7,3 |
| `x7-fd64x4-h256` | 64×4 | 256 | `chunk_q8_mlp.ort` | 11,0 + 8,7 | 5,37 | +0,26 [−0,24; +0,94] | 2,21 | 0,070 | ×7,4 |
| `x11-fd48x3-h256` | 48×3 | 256 | `chunk_q8_mlp.ort` | 6,7 + 8,2 | 6,48 | +1,37 [+0,41; +2,59] | 6,85 | 0,048 | ×10,9 |
| `x11-fd48x3-h256` | 48×3 | 256 | `chunk_q8_mask.ort` | 5,3 + 8,2 | 6,75 | +1,64 [+0,58; +2,93] | 8,11 | 0,048 | ×10,9 |
| `x11-fd48x3-h256` | 48×3 | 256 | `chunk_int8.ort` | 9,9 + 8,2 | 7,01 | +1,91 [+0,84; +3,21] | 9,16 | 0,050 | ×10,4 |
| `x10-fd32x3-h128` | 32×3 | 128 | `chunk_int8.ort` | 5,9 + 7,7 | 12,13 | +7,02 [+4,47; +9,62] | 27,69 | 0,054 | ×9,6 |
| `x10-fd32x3-h128` | 32×3 | 128 | `chunk_q8_mlp.ort` | 4,5 + 7,7 | 12,54 | +7,44 [+4,91; +10,29] | 29,57 | 0,054 | ×9,6 |
| `x10-fd32x3-h128` | 32×3 | 128 | `chunk_q8_mask.ort` | 3,9 + 7,7 | 12,42 | +7,32 [+4,88; +10,05] | 28,95 | 0,051 | ×10,2 |
| `x17-fd32x2-h256` | 32×2 | 256 | `chunk_q8_mlp.ort` | 4,2 + 7,7 | 8,95 | +3,84 [+1,64; +6,54] | 15,07 | 0,031 | ×16,8 |
| `x17-fd32x2-h256` | 32×2 | 256 | `chunk_int8.ort` | 5,8 + 7,7 | 9,27 | +4,16 [+1,92; +6,58] | 16,36 | 0,030 | ×17,4 |
| `x17-fd32x2-h256` | 32×2 | 256 | `chunk_q8_mask.ort` | 3,8 + 7,7 | 9,80 | +4,70 [+2,25; +7,62] | 18,29 | 0,031 | ×16,8 |
| `x21-fd24x2-h256` | 24×2 | 256 | `chunk_int8.ort` | 4,4 + 7,4 | 14,38 | +9,27 [+6,15; +12,43] | 35,99 | 0,025 | ×20,8 |
| `x21-fd24x2-h256` | 24×2 | 256 | `chunk_q8_mlp.ort` | 3,5 + 7,4 | 14,56 | +9,46 [+6,47; +12,68] | 36,74 | 0,029 | ×18,0 |
| `x21-fd24x2-h256` | 24×2 | 256 | `chunk_q8_mask.ort` | 3,3 + 7,4 | 14,28 | +9,18 [+6,30; +12,31] | 35,99 | 0,029 | ×18,0 |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para CPU y no requiere GPU.
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU mediante onnxruntime.
- Cabe en cualquier CPU de Android moderno: los archivos de chunk van desde 3,3 MB hasta 45,3 MB, y el modelo de enrolamiento entre 7,4 MB y 10,9 MB.
- Opciones de despliegue: onnxruntime nativo (formato ORT preoptimizado para ARM), paquete `voxlock` de Python (con parche para HOP=256), sherpa-onnx (solo modelos con hop 128).
- Latencia y throughput: RTF de 0,025 a 0,521 según variante en un hilo de Apple M4 Pro; en CPUs de Android de gama baja el RTF será mayor, pero las variantes más ligeras (`x17`, `x21`) están pensadas para mantenerse por debajo de 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER % (Krisp) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxLock original (int8) | no disponible (128×6) | tramas de 8 ms | 5,10 | no disponible | Hugging Face `arbazsiddiqui/voxlock` |
| VoxLock-distill `x7-fd64x4-h256` | no disponible (64×4) | tramas de 16 ms | 5,14 | Apache 2.0 | Hugging Face `YamiSukkehirho/voxlock-distill` |
| VoxLock-distill `x11-fd48x3-h256` | no disponible (48×3) | tramas de 16 ms | 6,48 | Apache 2.0 | Hugging Face `YamiSukkehirho/voxlock-distill` |
| VoxLock-distill `x21-fd24x2-h256` | no disponible (24×2) | tramas de 16 ms | 14,38 | Apache 2.0 | Hugging Face `YamiSukkehirho/voxlock-distill` |

No se dispone de datos de otros modelos comparables de separación de voz objetivo en la información proporcionada.

## Limitaciones y advertencias

- Las variantes v1 (`x10`, `x17`, `x21`) presentan pérdidas de WER significativas (9-14,6 % frente a 5,10 % del docente) y mayor fuga de voz de fondo (15-36 palabras por minuto), por lo que solo son adecuadas cuando la velocidad es crítica y se tolera una calidad notablemente inferior.
- El modelo está entrenado sobre llamadas de LibriSpeech y auriculares de AMI; su rendimiento en otros dominios acústicos (reuniones presenciales, audio de vídeo, entornos muy ruidosos) no está documentado.
- La fuga de voz de fondo aumenta en las variantes más ligeras: desde 0,15 palabras/min en `teacher-q8` hasta 36,74 en `x21-fd24x2-h256`.
- Los modelos con HOP=256 requieren aplicar el parche `code/voxlock_core_hop256.patch` al paquete `voxlock`; sin él, no cargan correctamente.
- No se han documentado sesgos específicos de género, edad o acento en la información proporcionada, pero al entrenarse sobre LibriSpeech y AMI (corpus mayoritariamente en inglés) es probable un sesgo hacia el inglés y hacia determinados perfiles de hablante.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `arbazsiddiqui/voxlock` tiene licencia no especificada en la información disponible; conviene verificar la compatibilidad antes de su uso en producción.
- No se dispone de información sobre el número de parámetros totales ni sobre la composición exacta del dataset de destilación más allá de las fuentes citadas.

## Enlaces

- Hugging Face: https://huggingface.co/YamiSukkehirho/voxlock-distill
- Modelo base: https://huggingface.co/arbazsiddiqui/voxlock
- Repositorio GitHub de VoxLock: https://github.com/arbazsiddiqui/voxlock
- Benchmark Krisp Voice Isolation: no disponible en la información proporcionada.
- Paper: no disponible en la información proporcionada.
