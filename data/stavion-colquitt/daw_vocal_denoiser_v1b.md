# Stavion-Colquitt/DAW_Vocal_Denoiser_v1b

## Resumen

DAW Vocal Denoiser v1b es un modelo de reduccion de ruido para voz cantada y hablada, disenado para integrarse en estaciones de trabajo de audio digital (DAW) y aplicaciones de produccion musical. Lo desarrolla Stavion-Colquitt, un autor independiente, y se publica bajo licencia MIT. El modelo resuelve el problema de limpiar grabaciones vocales ruidosas en tiempo real, manteniendo la fase original de la senal y una latencia algoritmica de solo 10 ms a 48 kHz.

Tecnicamente es una red neuronal recurrente de tipo GRU con 2.514.435 parametros y una anchura de capa oculta de 384 unidades, entrenada sobre espectrogramas de magnitud comprimida con una mascara sigmoidea de magnitud. La salida conserva la fase ruidosa de la entrada, lo que simplifica el procesamiento y evita artefactos de reconstruccion de fase. Es una version intermedia de la familia: v1c mantiene la misma receta de datos con GRU de 256 unidades, y v1b duplica aproximadamente el tamano del modelo para evaluar si una mayor capacidad aporta mas que mas datos.

Su relevancia actual radica en que ofrece un modelo pequeno (10,1 MB en ONNX), causal, con paridad casi exacta entre PyTorch y ONNX Runtime (113,0 dB) y un factor de tiempo real de 0,094 en CPU de escritorio, lo que lo hace desplegable en produccion musical sin GPU dedicada ni servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente con capas GRU (procesamiento espectral de magnitud) |
| Parametros totales | 2.514.435 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por bloques de 5 ms; ventana de analisis de 32 ms y sintesis de 10 ms) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch en precision original) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (`daw_denoiser.onnx`, 10,1 MB) y PyTorch (`daw_denoiser.pth`) |

## Arquitectura y entrenamiento

El modelo es una red recurrente causal basada en GRU con 384 unidades ocultas (frente a las 256 de v1c), que procesa espectrogramas de magnitud comprimida y predice una mascara sigmoidea de magnitud. La senal de salida se reconstruye manteniendo la fase ruidosa original, con ventanas asimetricas de analisis de 32 ms y sintesis de 10 ms, y un salto de 5 ms. La arquitectura es estrictamente causal, lo que permite su uso en streaming con latencia algoritmica de 10 ms.

El entrenamiento sigue exactamente la receta de v1c: los datos de v1 mas aproximadamente 202 minutos de grabaciones vocales del propio autor, con 108.779 pasos de entrenamiento desde cero, optimizador AdamW y media movil exponencial (EMA) con factor 0,999. El entrenamiento se realizo en una RTX 5070 durante 7,7 horas (18-19 de noviembre de 2026). El checkpoint publicado corresponde al paso 100.000, el de menor perdida en el conjunto de desarrollo. No se menciona el uso de RLHF ni DPO, dado que es una tarea de regresion/estimacion de mascara y no de generacion de lenguaje.

## Capacidades

- Reduccion de ruido en tiempo real sobre voz cantada y hablada, con latencia algoritmica de 10 ms a 48 kHz.
- Procesamiento causal en streaming por bloques de 5 ms (240 muestras a 48 kHz), manteniendo el estado interno de la GRU en el host.
- Procesamiento offline de archivos completos mediante `process_file`, con salida alineada temporalmente con la entrada.
- Soporte de cualquier frecuencia de muestreo y de audio mono o estéreo a traves del contenedor Docker (salida en WAV de 24 bits a la frecuencia de entrada).
- Preservacion de la fase original de la senal (no estima fase, lo que reduce artefactos).
- Despliegue en CPU sin PyTorch mediante ONNX Runtime.
- Servicio HTTP opcional mediante el contenedor Docker (`serve` en el puerto 8000, endpoint `/denoise`).
- No soporta tool calling, agentes, vision, audio generativo ni capacidades multilingues en el sentido de procesamiento de lenguaje.

## Casos de uso

- Limpieza de tomas vocales en produccion musical: el modelo se integra en el flujo de una DAW para eliminar ruido de fondo de grabaciones caseras antes de la mezcla, gracias a su latencia de 10 ms y a su naturaleza causal que permite monitorizacion en directo.
- Monitorizacion en directo durante la grabacion: al procesar bloques de 5 ms con un factor de tiempo real de 0,094 en CPU, el cantante puede escuchar la senal limpia practicamente sin retardo perceptible.
- Restauracion de archivos de voz para podcast o locucion: el modo offline `process_file` permite limpiar grabaciones completas de forma alineada en el tiempo, sin desplazar la senal respecto al original.
- Preprocesado en pipelines de transcripcion o analisis de audio: al reducir ruido antes de enviar el audio a un ASR u otro modelo, se puede mejorar la calidad de entrada sin anadir latencia significativa.
- Despliegue como microservicio en produccion: el contenedor Docker `stavion/daw-denoiser:v1b` expone un endpoint HTTP `/denoise` que acepta WAV y devuelve WAV de 24 bits, adecuado para integrarse en aplicaciones web de edicion de audio.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse solo con ONNX Runtime, se puede desplegar en instancias CPU economicas para limpiar grandes volumenes de grabaciones.
- Integracion en herramientas de DAW de terceros: al distribuirse como ONNX con una definicion de modelo clara (`model.py`) y un motor de streaming minimo (`stream.py`), es facil incorporarlo a plugins o scripts de automatizacion.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (180 clips ruidosos y 20 clips limpios de paso directo; cancion *Say Dat Name* y cantantes de VocalSet, con ruido del split de desarrollo a 0-40 dB SNR):

| Version | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL | FAD-MERT (menor mejor) | Clean pass-through SI-SDR (dB) |
|---|---|---|---|---|---|---|
| Entrada ruidosa | 19,04 | 19,02 | 2,37 | 3,53 | 1,732 | - |
| v1 | 22,95 | 23,70 | 3,05 | 3,97 | 0,419 | 45,6 |
| v1c | 23,27 | 23,85 | 3,03 | 3,98 | 0,485 | 51,1 |
| v1b (GRU 384) | 23,46 | 24,07 | 3,10 | 3,99 | 0,448 | 47,6 |
| v1d (5 ms lookahead) | 23,43 | 24,03 | 3,11 | 3,99 | 0,446 | 50,5 |

Comparacion pareada v1b frente a v1c (media ± IC 95%; en negrita, intervalos que excluyen cero):

| Clips | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL |
|---|---|---|---|---|
| 180 clips totales | +0,19 ± 0,25 | +0,22 ± 0,22 | **+0,07 ± 0,02** | +0,01 ± 0,02 |
| Voz del autor (86 clips) | -0,03 ± 0,45 | +0,08 ± 0,39 | **+0,08 ± 0,02** | **+0,02 ± 0,01** |
| Otros cantantes, VocalSet (94 clips) | **+0,38 ± 0,24** | **+0,35 ± 0,23** | **+0,06 ± 0,02** | +0,01 ± 0,03 |

Rendimiento en tiempo real:

| Propiedad | Valor |
|---|---|
| Latencia algoritmica | 10 ms (ventanas de analisis de 32 ms y sintesis de 10 ms, salto de 5 ms) |
| CPU por bloque de 5 ms (ONNX Runtime, CPU de escritorio) | 0,47 ms (factor de tiempo real 0,094) |
| Paridad ONNX frente a PyTorch (motor de streaming) | 113,0 dB |
| Ganancia SI-SDR en desarrollo (checkpoint publicado) | +2,79 dB |

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU de escritorio con ONNX Runtime, con 0,47 ms por bloque de 5 ms (factor de tiempo real 0,094). No requiere GPU.
- VRAM estimada: no aplica en el modo de despliegue previsto (CPU). No se proporcionan datos de VRAM para ejecucion en GPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una RTX 5070, pero la inferencia esta pensada para CPU.
- Cabe en cualquier equipo consumer: el archivo ONNX ocupa 10,1 MB y el modelo tiene 2,5 M de parametros.
- Opciones de despliegue: ONNX Runtime (via `stream.py`), PyTorch (via `model.py` y `daw_denoiser.pth`) y contenedor Docker `stavion/daw-denoiser:v1b` (imagen solo CPU, con modo CLI y modo servidor HTTP).
- Latencia y throughput: latencia algoritmica de 10 ms; factor de tiempo real de 0,094 en CPU de escritorio, lo que deja margen de sobra para procesar en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Latencia | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DAW Vocal Denoiser v1b | 2,51 M | 10 ms | Ventana de analisis 32 ms, sintesis 10 ms | MIT | ONNX, PyTorch | Version mas precisa de la familia en SI-SDR y SDR; coste CPU aproximadamente 2x respecto a v1c |
| DAW Vocal Denoiser v1c | 1,25 M | 10 ms | Igual | MIT | ONNX, PyTorch | Menor coste CPU; peor en VocalSet y PESQ |
| DAW Vocal Denoiser v1d | 1,25 M | 15 ms (5 ms de lookahead) | Igual, con lookahead | MIT | ONNX, PyTorch | Rendimiento estadisticamente equivalente a v1b con la mitad de CPU |
| DAW Vocal Denoiser v1 | 1,25 M | 10 ms | Igual | MIT | ONNX, PyTorch | Version original; mejor FAD-MERT pero peor en el resto de metricas |

No se dispone de comparacion con modelos externos de reduccion de ruido en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo preserva la fase ruidosa original, lo que puede limitar la calidad en escenarios con ruido de fase severo.
- La ganancia en calidad sobre v1c es modesta en terminos absolutos (+0,19 dB SI-SDR en el conjunto completo) y no significativa en algunos subconjuntos; la mejora clara se concentra en cantantes no vistos durante el entrenamiento.
- El paso directo de tomas limpias degrada mas que en v1c (47,6 dB frente a 51,1 dB), por lo que conviene evitar aplicarlo indiscriminadamente a material ya limpio.
- El coste computacional es aproximadamente el doble que v1c por bloque procesado, y el modelo ocupa 10 MB frente a 5 MB.
- Entrenado principalmente con la voz del autor y datos de VocalSet; el rendimiento puede degradarse en voces, estilos o idiomas muy alejados de esa distribucion.
- No se han publicado datos de sesgos, comportamiento multilingue ni evaluacion con ruidos del mundo real fuera del conjunto de desarrollo.
- La licencia MIT permite uso comercial, pero el autor declara que el proyecto se construyo con asistencia de IA (Claude, de Anthropic) para codigo y documentacion; conviene revisar el codigo antes de integrarlo en produccion.
- No se proporcionan resultados de benchmarks frente a modelos externos de denoising, por lo que la comparacion con alternativas del mercado no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1b
- Codigo en GitHub: https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser-v1b
- Demo en vivo: https://huggingface.co/spaces/Stavion-Colquitt/Realtime_Denoisers
- Version v1: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser
- Version v1c: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1c
- Version v1d (GitHub): https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser-v1d
- Imagen Docker: https://hub.docker.com/r/stavion/daw-denoiser/tags
