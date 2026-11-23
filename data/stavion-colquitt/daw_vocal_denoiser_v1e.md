# Stavion-Colquitt/DAW_Vocal_Denoiser_v1e

## Resumen

DAW Vocal Denoiser v1e es un modelo de reduccion de ruido de voz y canto disenado para integrarse en cadenas de produccion musical (DAW) en tiempo real. Lo desarrolla Stavion-Colquitt, un autor individual, y se publica bajo licencia MIT. El modelo resuelve el problema de limpiar tomas vocales ruidosas manteniendo intactas las tomas ya limpias, algo critico cuando el denoiser se inserta en una cadena de grabacion en vivo donde no se puede degradar la senal original.

Tecnicamente es una red neuronal recurrente (GRU de anchura 384) con 2.514.435 parametros, que opera sobre espectrogramas en bloques de 5 ms a 48 kHz y aplica una mascara espectral. Incorpora 5 ms de lookahead (una trama), lo que da una latencia algoritmica total de 15 ms. Se distribuye en formato ONNX (10,1 MB) y PyTorch, y funciona con ONNX Runtime sobre CPU de escritorio con un factor de tiempo real de 0,05-0,07.

Su relevancia radica en el equilibrio entre latencia muy baja, coste computacional minimo y preservacion de la senal limpia (53,1 dB de SI-SDR en pass-through), un aspecto poco habitual en modelos de speech enhancement orientados a telefonia o asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente con GRU (anchura 384) sobre mascara espectral, streaming por tramas |
| Parametros totales | 2.514.435 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 5 ms (240 muestras a 48 kHz) con 1 trama de lookahead |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32 y pesos PyTorch) |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`daw_denoiser.onnx`), PyTorch (`daw_denoiser.pth`, EMA) |
| Frecuencia de muestreo | 48 kHz, mono |
| Latencia algoritmica | 15 ms (ventanas de 10 ms + 5 ms de lookahead) |
| Tamano del archivo ONNX | 10,1 MB |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

El modelo es un denoiser de mascara espectral en streaming. Procesa el audio en ventanas de 10 ms con saltos de 5 ms, y una GRU de anchura 384 genera la mascara para cada trama usando el estado recurrente que el host mantiene entre bloques. La innovacion clave de esta version es el lookahead de una trama: la mascara de la trama t se calcula despues de que la GRU haya visto la trama t+1, y el motor de streaming retiene cada espectro un salto hasta que llega su mascara. El script `test_lookahead.py` verifica que la salida depende exactamente de una trama futura y no mas.

El entrenamiento se realizo desde cero durante 108.779 pasos (checkpoint publicado en el paso 103.000, el de menor perdida de validacion), aproximadamente 9 horas en una RTX 4060 repartidas en cinco sesiones entre el 22 y el 23 de noviembre de 2026. Los datos combinan el conjunto de v1 con 1.246 tomas adicionales de la voz del propio autor. No se documenta el numero total de tokens ni la composicion exacta del dataset, ni si hubo RLHF o DPO (no aplicable en audio). La paridad numerica entre ONNX y PyTorch en el motor de streaming es de 107,5 dB.

## Capacidades

- Reduccion de ruido de voz cantada y hablada en tiempo real, con latencia algoritmica de 15 ms.
- Preservacion de tomas limpias: 53,1 dB de SI-SDR en pass-through, el mejor valor de todas las versiones del modelo.
- Procesamiento en streaming por bloques de 5 ms (240 muestras a 48 kHz) con estado recurrente mantenido por el host.
- Procesamiento offline de archivos completos mediante `process_file`, con salida alineada temporalmente con la entrada.
- Inferencia en CPU de escritorio con ONNX Runtime, sin necesidad de GPU.
- Integracion en cadenas de DAW y en pipelines de grabacion en vivo.
- No soporta tool calling, agentes, vision ni audio generativo; es exclusivamente un modelo de enhancement.

## Casos de uso

- Grabacion vocal en vivo en DAW: el modelo se inserta como plugin en la cadena de entrada y limpia el ruido de fondo (ventilador, ruido de sala, ruido electrico) con 15 ms de latencia, imperceptible en monitoreo.
- Produccion musical en home studio: elimina ruido de habitacion en tomas de voz cantada sin degradar la toma original, gracias a los 53,1 dB de pass-through en senales limpias.
- Postproduccion de podcasts y locuciones: procesa archivos completos offline con `process_file`, alineando la salida con la entrada para sustitucion directa en la linea de tiempo.
- Limpieza de grabaciones de campo con voz: recupera inteligibilidad en tomas con relacion senal-ruido baja (hasta 0 dB SNR en el conjunto de evaluacion).
- Integracion en herramientas de edicion: el ONNX de 10,1 MB y la imagen Docker solo-CPU permiten desplegarlo en aplicaciones de escritorio o servicios sin GPU.
- Preprocesado para pipelines de reconocimiento de voz o analisis musical: mejora la relacion senal-ruido antes de enviar el audio a un ASR o a un analizador de pitch.
- Prototipado rapido en notebooks: el motor de streaming depende solo de numpy y onnxruntime, lo que simplifica la experimentacion.

## Benchmarks y rendimiento

Evaluacion sobre 180 clips ruidosos (86 de la cancion *Say Dat Name* y 94 de cantantes de VocalSet) mas 20 clips limpios de pass-through, con ruido del split de desarrollo a 0-40 dB SNR y semilla fija.

| Version | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL | FAD-MERT (menor mejor) | Pass-through SI-SDR (dB) |
|---|---|---|---|---|---|---|
| Entrada ruidosa | 19,04 | 19,02 | 2,37 | 3,53 | 1,732 | - |
| v1 | 22,95 | 23,70 | 3,05 | 3,97 | **0,419** | 45,6 |
| v1c | 23,27 | 23,85 | 3,03 | 3,98 | 0,485 | 51,1 |
| v1b (GRU 384) | **23,46** | 24,07 | 3,10 | 3,99 | 0,448 | 47,6 |
| v1d (5 ms lookahead) | 23,43 | 24,03 | 3,11 | 3,99 | 0,446 | 50,5 |
| **v1e (GRU 384 + lookahead)** | 23,45 | **24,08** | **3,12** | **4,00** | 0,445 | **53,1** |

Comparaciones pareadas de v1e (media ± IC 95 %):

| Comparacion | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL |
|---|---|---|---|---|
| v1e vs v1b (anade lookahead) | -0,01 ± 0,21 | +0,01 ± 0,17 | **+0,02 ± 0,02** | +0,00 ± 0,02 |
| v1e vs v1d (anade GRU 384) | +0,01 ± 0,19 | +0,05 ± 0,17 | +0,02 ± 0,02 | +0,01 ± 0,02 |
| v1e vs v1c (ambos cambios) | +0,18 ± 0,22 | **+0,23 ± 0,19** | **+0,09 ± 0,02** | **+0,02 ± 0,02** |

Conclusion del autor: los dos cambios no se suman en SI-SDR; la arquitectura parece haber alcanzado una meseta en torno a 23,4-23,5 dB. v1e mejora en metricas perceptuales y en preservacion de tomas limpias. En la voz del propio autor, v1e supera a v1 en +1,03 ± 0,50 dB de SI-SDR; en otros cantantes iguala a v1.

Rendimiento en tiempo real:

| Propiedad | Valor |
|---|---|
| Latencia algoritmica | 15 ms (ventanas de 10 ms + 5 ms de lookahead) |
| CPU por bloque de 5 ms (ONNX Runtime, CPU de escritorio) | 0,26-0,32 ms (factor de tiempo real 0,05-0,07) |
| Paridad ONNX vs PyTorch (motor de streaming) | 107,5 dB |
| Parametros | 2.514.435 |
| Archivo ONNX | 10,1 MB |

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el modelo corre en CPU con ONNX Runtime.
- GPU recomendadas: no aplica para inferencia; el entrenamiento se realizo en una RTX 4060 (unas 9 horas).
- Cabe en cualquier GPU consumer e incluso en CPU de escritorio: 10,1 MB de ONNX y 2,51 M de parametros.
- Opciones de despliegue: ONNX Runtime (motor `stream.py`, solo numpy + onnxruntime), PyTorch (`model.StreamDenoiser`), imagen Docker solo-CPU publicada en Docker Hub como `stavio...` (nombre truncado en la informacion disponible).
- Latencia y throughput: 15 ms de latencia algoritmica; 0,26-0,32 ms de CPU por bloque de 5 ms, es decir, factor de tiempo real de 0,05-0,07 (entre 14 y 20 veces mas rapido que tiempo real en CPU de escritorio).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables externos en la documentacion proporcionada. La comparacion disponible es interna, entre versiones del mismo modelo:

| Version | GRU | Latencia | Pasos de entrenamiento | Dev SI-SDR | Pass-through (dB) |
|---|---|---|---|---|---|
| v1 | 256 | 10 ms | 108.773 | +2,39 dB | 45,6 |
| v1c | 256 | 10 ms | 108.779 | +2,57 dB | 51,1 |
| v1b | 384 | 10 ms | 108.779 | +2,79 dB | 47,6 |
| v1d | 256 | 15 ms | 108.779 | +2,78 dB | 50,5 |
| v1e | 384 | 15 ms | 108.779 | +2,82 dB | 53,1 |

## Limitaciones y advertencias

- La arquitectura parece haber alcanzado una meseta de rendimiento en SI-SDR (23,4-23,5 dB); mejoras adicionales requeriran cambios estructurales, no solo mas capacidad o lookahead.
- El modelo se entreno con datos que incluyen 1.246 tomas de la voz del propio autor; el rendimiento puede estar optimizado para ese timbre, aunque en otros cantantes iguala a v1.
- La evaluacion se limita a 180 clips de dos fuentes (una cancion propia y cantantes de VocalSet); la generalizacion a otros generos, idiomas o condiciones acusticas no esta documentada.
- No se han publicado datos sobre sesgos, alucinaciones (no aplicable en audio) ni comportamiento con ruidos no musicales o no estacionarios.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte.
- El nombre exacto de la imagen Docker en Docker Hub aparece truncado en la informacion disponible.
- El modelo esta pensado para voz y canto; su comportamiento con otros tipos de senal (instrumentos, ambiente) no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1e
- Codigo en GitHub (v1e): https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser/tree/main/versions/v1e
- Repositorio principal: https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser
- Demo en vivo: https://huggingface.co/spaces/Stavion-Colquitt/Realtime_Denoisers
- Version v1: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser
- Version v1b: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1b
- Version v1c: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1c
- Version v1d: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1d
