# Stavion-Colquitt/DAW_Vocal_Denoiser_v1d

## Resumen

DAW Vocal Denoiser v1d es un modelo de reduccion de ruido para voz cantada y hablada, disenado para integrarse en estaciones de trabajo de audio digital (DAW) y en pipelines de produccion musical. Lo desarrolla Stavion-Colquitt y se publica bajo licencia MIT. La version 1d es una variante de la v1c que introduce 5 ms de lookahead (mirar una trama hacia delante) para mejorar la calidad de la mascara espectral sin aumentar el tamano del modelo.

Arquitectonicamente es una red recurrente ligera basada en GRU de 256 unidades que opera sobre la magnitud del espectro en tramas de 5 ms a 48 kHz. Con 1.250.563 parametros y un fichero ONNX de 5,0 MB, el modelo esta pensado para inferencia en tiempo real incluso en CPU. La latencia algoritmica total es de 15 ms (ventanas de 10 ms mas un hop de 5 ms de lookahead), lo que permite monitorizacion en directo durante la grabacion.

Su relevancia actual radica en que demuestra que un modelo de 1,25M de parametros con 5 ms de lookahead iguala en calidad perceptual a una variante con el doble de parametros (v1b, GRU 384), a la mitad de coste de CPU y de tamano de fichero. Es una pieza practica para limpiar tomas vocales ruidosas antes de mezclar, sin depender de GPUs ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente GRU (256 unidades) sobre magnitud espectral, con lookahead de una trama |
| Parametros totales | 1.250.563 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa tramas de 5 ms en streaming (ventana de 10 ms + 5 ms de lookahead) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX float32 y pesos PyTorch) |
| Idiomas soportados | No disponible (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`daw_denoiser.onnx`) y PyTorch (`daw_denoiser.pth`, EMA) |
| Frecuencia de muestreo | 48 kHz (bloques de 240 muestras float32) |
| Latencia algoritmica | 15 ms (10 ms de ventana + 5 ms de lookahead) |
| Coste de CPU | 0,23 ms por bloque de 5 ms (ONNX Runtime, CPU de escritorio); factor de tiempo real 0,046 |
| Paridad ONNX vs PyTorch | 112,3 dB (motor de streaming) |
| Tamano del fichero ONNX | 5,0 MB |
| Pasos de entrenamiento | 108.779 |

## Arquitectura y entrenamiento

El modelo es una red recurrente que estima una mascara espectral sobre la magnitud de la senal de audio. La unidad recurrente es una GRU de 256 unidades, identica a la de v1c, y el modelo se entrena desde cero durante 108.779 pasos. La innovacion de v1d respecto a v1c es el lookahead: durante el entrenamiento se rellena la entrada de magnitud con una trama adicional y se desplaza la mascara una trama hacia atras, de modo que la mascara de la trama t se calcula despues de que la GRU haya visto la trama t+1. El motor de streaming (`stream.py`) replica este comportamiento reteniendo cada espectro un hop hasta que llega su mascara.

Los datos de entrenamiento son los mismos que en v1c (no se detalla la composicion exacta del dataset en la informacion disponible). El checkpoint publicado corresponde al paso 107.000, el de menor perdida de validacion, con una ganancia de SI-SDR en el conjunto de desarrollo de +2,78 dB. El entrenamiento completo se realizo en 9,3 horas sobre una RTX 4060. La verificacion `test_lookahead.py` confirma que la salida depende de la entrada exactamente un hop hacia delante y no mas, y la paridad entre el motor de streaming y PyTorch es de 112,3 dB.

## Capacidades

- Reduccion de ruido en voz cantada y hablada, con preservacion de tomas limpias (pass-through de 50,5 dB de SI-SDR en clips sin ruido).
- Procesamiento en tiempo real con latencia algoritmica de 15 ms, apto para monitorizacion durante la grabacion.
- Procesamiento offline de ficheros completos mediante `process_file`, con salida alineada temporalmente con la entrada.
- Soporte de cualquier frecuencia de muestreo y de audio mono o estéreo a traves del contenedor Docker (salida WAV de 24 bits a la frecuencia de entrada).
- Inferencia en CPU sin PyTorch, usando unicamente numpy y onnxruntime.
- Despliegue como servicio HTTP mediante el comando `serve` de la imagen Docker.
- No incluye tool calling, agentes, vision, audio generativo ni capacidades multilingues; es exclusivamente un enhancer de audio.

## Casos de uso

- Limpieza de tomas vocales en produccion musical: el modelo se inserta en la cadena de la DAW o se ejecuta sobre el fichero WAV para eliminar ruido de fondo antes de la mezcla, con 15 ms de latencia que permiten escuchar el resultado en directo mientras se graba.
- Grabacion en home studio con ruido ambiental: al procesar en CPU a 0,046 de factor de tiempo real, se puede ejecutar en el mismo portatil que graba sin cargar la GPU ni interrumpir la sesion.
- Monitorizacion en directo durante la grabacion: el lookahead de 5 ms y la latencia total de 15 ms son suficientemente bajos para que el cantante se escuche procesado sin un retardo perceptible.
- Postproduccion por lotes: `process_file` permite limpiar lotes de tomas de una sesion completa de forma offline, manteniendo la alineacion temporal para su uso en el montaje.
- Servicio de limpieza de audio autohospedado: el comando `serve` de la imagen Docker expone un endpoint HTTP (`/denoise`) para integrar la reduccion de ruido en herramientas internas de un estudio o en un pipeline de publicacion.
- Preprocesado para otros sistemas de audio: reducir el ruido de una toma antes de pasarla a un transcriber, un separador de fuentes o un modelo de analisis mejora la relacion senal-ruido de entrada con un coste minimo de CPU.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido: 180 clips ruidosos (86 de la cancion *Say Dat Name* y 94 de cantantes de VocalSet) mas 20 clips limpios, mezclados con ruido del split de desarrollo a 0-40 dB de SNR.

| Version | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL | FAD-MERT (menor mejor) | Pass-through SI-SDR (dB) |
|---|---|---|---|---|---|---|
| Entrada ruidosa | 19,04 | 19,02 | 2,37 | 3,53 | 1,732 | - |
| v1 | 22,95 | 23,70 | 3,05 | 3,97 | **0,419** | 45,6 |
| v1c | 23,27 | 23,85 | 3,03 | 3,98 | 0,485 | **51,1** |
| v1b (GRU 384) | **23,46** | **24,07** | 3,10 | **3,99** | 0,448 | 47,6 |
| **v1d (5 ms lookahead)** | 23,43 | 24,03 | **3,11** | **3,99** | 0,446 | 50,5 |

Comparacion pareada v1d frente a v1c (media ± IC 95 %; en negrita los intervalos que excluyen cero):

| Clips | SI-SDR (dB) | SDR (dB) | PESQ-WB | ViSQOL |
|---|---|---|---|---|
| 180 clips totales | +0,17 ± 0,19 | +0,18 ± 0,18 | **+0,07 ± 0,02** | +0,01 ± 0,02 |
| Voz del autor (86 clips) | +0,09 ± 0,24 | +0,14 ± 0,22 | **+0,08 ± 0,02** | **+0,01 ± 0,01** |
| Otros cantantes, VocalSet (94 clips) | +0,23 ± 0,30 | +0,22 ± 0,28 | **+0,07 ± 0,03** | +0,01 ± 0,03 |

Propiedades en tiempo real:

| Propiedad | Valor |
|---|---|
| Latencia algoritmica | 15 ms (10 ms de ventana + 5 ms de lookahead) |
| CPU por bloque de 5 ms (ONNX Runtime) | 0,23 ms (factor de tiempo real 0,046) |
| Paridad ONNX vs PyTorch | 112,3 dB |
| Parametros | 1.250.563 |
| Fichero ONNX | 5,0 MB |

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU de escritorio con ONNX Runtime; 0,23 ms por bloque de 5 ms deja un margen amplio sobre el tiempo real.
- VRAM: no requiere GPU; el fichero ONNX ocupa 5,0 MB y los pesos PyTorch son del mismo orden.
- GPU recomendadas: no aplica para inferencia; el entrenamiento se realizo en una RTX 4060 en 9,3 horas.
- Cabe en cualquier GPU consumer y en CPU de portatil; no se necesita CUDA.
- Opciones de despliegue: ONNX Runtime (via `stream.py`), imagen Docker CPU-only `stavion/daw-denoiser:v1d` (modo fichero y modo `serve` con endpoint HTTP), y PyTorch con `model.StreamDenoiser` para los pesos `.pth`.
- Latencia y throughput: latencia algoritmica de 15 ms y factor de tiempo real de 0,046 en CPU de escritorio (medido con ONNX Runtime).

## Comparativa con modelos similares

| Modelo | Parametros | Latencia | SI-SDR (test) | PESQ-WB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DAW Vocal Denoiser v1d | 1,25M | 15 ms | 23,43 dB | 3,11 | MIT | ONNX + PyTorch + Docker |
| DAW Vocal Denoiser v1c | 1,25M | 10 ms | 23,27 dB | 3,03 | MIT | ONNX + PyTorch |
| DAW Vocal Denoiser v1b | ~2,5M (GRU 384) | 10 ms | 23,46 dB | 3,10 | MIT | PyTorch |
| DAW Vocal Denoiser v1 | 1,25M | 10 ms | 22,95 dB | 3,05 | MIT | ONNX + PyTorch |

Las alternativas comparables son las propias versiones anteriores del mismo autor, que comparten receta de datos y motor de streaming. No se dispone en la informacion proporcionada de comparaciones con otros modelos de reduccion de ruido de terceros.

## Limitaciones y advertencias

- La mejora de SI-SDR de v1d sobre v1c (+0,17 dB) no es estadisticamente significativa en 180 clips; la ganancia clara es de calidad perceptual (PESQ) y de calidad por coste de CPU, no de precision bruta.
- El lookahead anade 5 ms de latencia (15 ms totales frente a 10 ms en v1c); en contextos con requisitos de latencia muy estrictos puede preferirse v1c.
- El pass-through de tomas limpias es de 50,5 dB, ligeramente inferior al de v1c (51,1 dB), por lo que las tomas sin ruido pueden sufrir una alteracion marginal algo mayor.
- Entrenado y evaluado principalmente con voz cantada (cancion propia y cantantes de VocalSet); el comportamiento en habla espontanea, entornos muy reverberantes o ruidos no representados en el split de desarrollo no esta documentado.
- No se detalla la composicion del dataset de entrenamiento ni la cobertura de idiomas, acentos o estilos musicales.
- Riesgo de artefactos o sobre-suavizado en pasajes con ruido no estacionario o con componentes musicales solapados con la voz.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor declara asistencia de IA en la escritura de codigo y documentacion, con revision manual de todas las decisiones tecnicas.
- Modelo de autor unico con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1d
- Codigo en GitHub: https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser-v1d
- Demo en vivo (Space): https://huggingface.co/spaces/Stavion-Colquitt/Realtime_Denoisers
- Version v1: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser
- Version v1c: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1c
- Repositorio v1b: https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser-v1b
- Imagen Docker: https://hub.docker.com/r/stavion/daw-denoiser/tags
