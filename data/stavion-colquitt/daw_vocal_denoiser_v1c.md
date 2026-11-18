# Stavion-Colquitt/DAW_Vocal_Denoiser_v1c

## Resumen

DAW Vocal Denoiser v1c es un modelo de reduccion de ruido para voz cantada y hablada, disenado para su uso dentro de estaciones de trabajo de audio digital (DAW). Lo desarrolla Stavion-Colquitt, un autor individual, y se publica bajo licencia MIT. Su proposito es limpiar tomas vocales grabadas en salas sin tratamiento acustico, eliminando ruido de fondo sin eliminar la voz, manteniendo una latencia algorítmica de 10 ms que lo hace apto para monitorizacion en tiempo real.

Tecnicamente es un modelo pequeno (1,25 millones de parametros) que opera sobre la magnitud del espectrograma con ventanas asimetricas de analisis y sintesis, una capa lineal, LayerNorm y una GRU de dos capas con 256 unidades ocultas que predice una mascara de magnitud sigmoide. Conserva la fase ruidosa original y trabaja a 48 kHz mono. Se distribuye en formato ONNX para inferencia en tiempo real y como checkpoint PyTorch.

La version v1c amplia el entrenamiento con aproximadamente cuatro veces mas material vocal propio del autor (de 38,8 a unos 202 minutos), manteniendo el mismo numero de pasos que v1 (108.779). La relevancia actual es que ofrece una alternativa ligera, ejecutable en CPU y con licencia permisiva para tareas de limpieza vocal en produccion musical, donde los modelos generativos grandes resultan excesivos o demasiado lentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de prediccion de mascara de magnitud: STFT con ventanas asimetricas, capa lineal, LayerNorm, GRU de 2 capas (256) y mascara sigmoide |
| Parametros totales | 1,25 millones (1.25M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesamiento por tramas de 5 ms de salto (ventanas de analisis de 32 ms y sintesis de 10 ms) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (procesa audio, no texto; entrenado con voz cantada y hablada) |
| Licencia | MIT |
| Formato de pesos | ONNX (`daw_denoiser.onnx`) y PyTorch (`daw_denoiser.pth`) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de v1. Aplica una STFT con ventanas asimetricas de analisis (32 ms) y sintesis (10 ms) con salto de 5 ms, lo que permite reconstruccion de baja latencia. Sobre la magnitud comprimida aplica una capa lineal, LayerNorm y una GRU de dos capas con 256 unidades ocultas que genera una mascara de magnitud sigmoide; la fase ruidosa se conserva sin modificar. El ONNX de una sola trama recibe magnitud `[1, 1, 769]` y estado GRU `[2, 1, 256]`, y devuelve la mascara y el nuevo estado.

El entrenamiento usa perdida espectral comprimida combinada con STFT multirresolucion, optimizador AdamW, calentamiento mas decaimiento coseno y EMA de 0,999. La ejecucion principal consta de 47.079 pasos y una extension de 61.700 pasos (recalentada a 3e-4 y coseno hasta 1e-5), sumando 108.779 pasos en total, realizados en una RTX 4060 y una RTX 2060. Los datos incluyen las tomas vocales propias de v1 (38,8 min, 8 canciones), 1.246 tomas nuevas del autor (163,7 min, 30 canciones), VocalSet (CC BY 4.0), voz limpia y ruido del DNS Challenge, sangrado de auriculares simulado y datos sinteticos (respuestas al impulso de sala, ecualizacion aleatoria, ruido blanco y rosa, zumbido de 50/60 Hz). La mezcla usa SNR de 0 a 40 dB, un 10% de ejemplos solo limpios y un 30% con sala sintetica aplicada a entrada y objetivo, todo a 48 kHz mono.

## Capacidades

- Reduccion de ruido en voz cantada y hablada grabada en salas sin tratar.
- Procesamiento en tiempo real por bloques de 240 muestras (5 ms) con latencia algorítmica de 10 ms.
- Inferencia en CPU con ONNX Runtime (0,24 ms por bloque de 5 ms, factor de tiempo real 0,048).
- Procesamiento offline de archivos completos mediante `process_file`.
- Paridad entre ONNX y PyTorch de 113,6 dB.
- No soporta tool calling, agentes, vision, audio generativo ni capacidades multilingues de texto.

## Casos de uso

- Limpieza de tomas vocales en produccion musical: el modelo elimina ruido de fondo de grabaciones hechas en habitaciones domesticas antes de mezclar, conservando la fase original para no alterar el timbre.
- Monitorizacion en directo dentro de una DAW: con 10 ms de latencia algorítmica y 0,24 ms de computo por bloque, puede insertarse en una cadena de monitorizacion sin introducir retardo perceptible.
- Preprocesado de voces para podcasts y locucion: reduce zumbidos, hiss y ruido ambiental de grabaciones con microfonos economicos en entornos no tratados.
- Limpieza por lotes de bibliotecas de muestras vocales: el modo offline permite procesar archivos completos de 48 kHz mono de forma automatizada.
- Integracion en plugins o aplicaciones de audio: al distribuirse en ONNX, puede embeberse en herramientas de escritorio o servidores sin dependencia de GPU.
- Reduccion de sangrado de auriculares en tomas de voz: el entrenamiento incluye sangrado simulado, lo que ayuda en grabaciones donde el interprete escucha la mezcla por auriculares.
- Prototipado de pipelines de mejora de voz en investigacion: su tamano reducido y su licencia MIT facilitan experimentacion y comparacion con modelos mayores.

## Benchmarks y rendimiento

| Metrica | v1 | v1c |
|---|---|---|
| Ganancia SI-SDR en dev, checkpoint publicado | +2,39 dB (paso 77.000) | +2,57 dB (paso 108.779) |
| Ganancia SI-SDR maxima en dev durante entrenamiento | +2,39 dB | +2,59 dB (paso 95.000) |
| Pasos de entrenamiento | 108.773 | 108.779 (47.079 principal + 61.700 extension) |
| Datos vocales propios de entrenamiento | 38,8 min, 8 canciones | unos 202 min, 38 canciones |

| Propiedad de tiempo real | Valor |
|---|---|
| Frecuencia de muestreo | 48 kHz mono |
| Latencia algorítmica | 10 ms (ventanas de analisis de 32 ms y sintesis de 10 ms, salto de 5 ms) |
| CPU por bloque de 5 ms (ONNX Runtime, CPU de escritorio) | 0,24 ms (factor de tiempo real 0,048) |
| Paridad ONNX frente a PyTorch | 113,6 dB |

La evaluacion sobre el conjunto de test no se ha ejecutado todavia; la model card solo reporta cifras de dev.

## Requisitos de hardware

- Inferencia en CPU: viable en tiempo real con ONNX Runtime; 0,24 ms por bloque de 5 ms en CPU de escritorio.
- VRAM estimada: no disponible; el modelo es de 1,25M parametros y esta pensado para ejecucion en CPU.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizo en RTX 4060 y RTX 2060.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (via `stream.py`), PyTorch (via `model.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: latencia algorítmica de 10 ms; factor de tiempo real 0,048 en CPU de escritorio.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Como referencias de categoria podrian citarse herramientas de reduccion de ruido como RNNoise o modelos del DNS Challenge, pero no se dispone de datos comparativos medidos en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DAW Vocal Denoiser v1c | 1,25M | no aplica (tramas de 5 ms) | MIT | ONNX y PyTorch en Hugging Face |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Elimina ruido, no reverb; no esta disenado para desreverberar.
- No probado con distorsion intensa ni con SNR inferior a 0 dB; el sangrado muy fuerte puede persistir.
- Solo admite mono a 48 kHz; otras frecuencias deben remuestrearse antes.
- La evaluacion sobre el conjunto de test no se ha realizado; las cifras publicadas son de dev.
- Entrenado principalmente con la voz y las salas del autor, lo que puede limitar la generalizacion a otras voces y entornos.
- El modelo card declara el uso de asistencia de IA (Claude) para codigo y documentacion, con revision humana de todas las decisiones.
- Licencia MIT: permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento en produccion.
- Riesgo de artefactos o sobre-suavizado en pasajes vocales muy dinamicos no representados en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser_v1c
- Version v1: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser
- Codigo de entrenamiento: https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser-v1c
- Dataset VocalSet: https://zenodo.org/records/1442513
- DNS Challenge: https://github.com/microsoft/DNS-Challenge
