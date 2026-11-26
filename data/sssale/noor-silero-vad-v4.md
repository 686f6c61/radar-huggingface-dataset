# Sssale/noor-silero-vad-v4

## Resumen

`Sssale/noor-silero-vad-v4` no es un modelo de lenguaje, sino un espejo byte a byte del fichero `silero_vad.onnx` (643854 bytes, SHA-256 `9e2449e1…1fd6`), publicado por el autor `Sssale` para que la aplicacion offline de Coran "Noor" descargue el detector de actividad de voz desde una ubicacion fija y versionada. El modelo original es Silero VAD, desarrollado por el Silero Team, y el fichero ONNX concreto procede de la release `asr-models` del proyecto k2-fsa/sherpa-onnx.

El proposito del modelo es la deteccion de actividad de voz (VAD): clasificar segmentos de audio como voz o silencio, lo que permite segmentar, filtrar y activar procesamiento de audio solo cuando hay habla. Es una pieza de infraestructura pequena (menos de 1 MB) pensada para ejecutarse en tiempo real, incluso en dispositivos con recursos limitados, y se distribuye en formato ONNX para su uso con runtimes como sherpa-onnx u ONNX Runtime.

La relevancia de este repositorio es operativa, no cientifica: al ser un espejo inmutable con hash verificado, garantiza reproducibilidad en la cadena de descarga de una aplicacion concreta. No incluye entrenamiento, re-exportacion ni modificacion alguna respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para deteccion de actividad de voz (Silero VAD v4); topologia interna no detallada en la informacion disponible |
| Parametros totales | no disponible (tamano del fichero ONNX: 643854 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa audio por ventanas; tamano de ventana no disponible) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX) |
| Idiomas soportados | no disponible (VAD es agnostico al idioma por naturaleza, pero no se declara explicitamente) |
| Licencia | MIT (Silero VAD, Copyright (c) 2020-present Silero Team); el proyecto sherpa-onnx que publica el ONNX es Apache 2.0 |
| Formato de pesos | ONNX (`silero_vad.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es Silero VAD v4, un detector de actividad de voz del Silero Team. La informacion proporcionada no detalla la topologia interna (capas, tipo de red, tamano de ventana, frecuencia de muestreo de entrada ni estrategia de entrenamiento). Lo unico verificable es que se trata de un grafo ONNX de 643854 bytes cuyo export documenta sherpa-onnx en `scripts/silero_vad/v4`, con un tamano de salida de 627K que coincide con este fichero.

No hubo entrenamiento, ajuste fino, re-exportacion ni cuantizacion por parte del autor del repositorio: la model card declara explicitamente que es un espejo byte a byte. La unica innovacion tecnica relevante es de empaquetado y trazabilidad: fijar un artefacto con hash SHA-256 conocido para descargas deterministas en una aplicacion offline.

## Capacidades

- Deteccion de actividad de voz: clasifica audio como voz o no voz para segmentacion y filtrado.
- Integracion con sherpa-onnx: el fichero esta pensado para cargarse con el runtime sherpa-onnx (y, por formato, con ONNX Runtime).
- Ejecucion ligera: el tamano inferior a 1 MB permite despliegue en dispositivos con recursos limitados y en tiempo real.
- Verificabilidad: hash SHA-256 publicado para comprobar integridad de la descarga.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling.
- No dispone de modo thinking, agentes ni capacidades multilingues declaradas.

## Casos de uso

- Segmentacion de audio en aplicaciones de recitacion y escucha del Coran: la app "Noor" usa el VAD para detectar cuando el usuario habla o recita y activar el procesamiento solo en esos tramos, ahorrando bateria y CPU en movil.
- Puerta de activacion en asistentes de voz: el VAD filtra silencio antes de enviar audio al reconocedor, reduciendo llamadas al ASR y el consumo de ancho de banda.
- Deteccion de turnos en conversacion (turn-taking): marcar inicio y fin de intervenciones del usuario en interfaces de voz interactivas.
- Preprocesado de pipelines ASR con sherpa-onnx: recortar silencios y dividir grabaciones largas en segmentos con habla antes de la transcripcion.
- Filtrado de ruido de fondo en grabaciones: descartar tramos sin voz en la construccion de datasets de audio o en la limpieza de archivos.
- Moderacion y analisis de llamadas: identificar automaticamente los intervalos con habla en grabaciones de atencion al cliente para su revision o indexacion.
- Descarga reproducible en entornos offline: usar el repositorio como origen fijado y verificar el hash antes de cargar el modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB de pesos; el consumo real depende del runtime y del buffer de audio, no disponible.
- GPU recomendadas: no requiere GPU; esta disenado para ejecucion en CPU.
- Cabe en cualquier GPU consumer y en dispositivos moviles o embebidos, dado el tamano del fichero (643854 bytes).
- Opciones de despliegue: sherpa-onnx (runtime de referencia), ONNX Runtime; otros runtimes ONNX no confirmados en la informacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noor-silero-vad-v4 (este repo) | VAD (espejo de Silero VAD v4) | 643854 bytes | ONNX | MIT | Hugging Face (espejo) |
| Silero VAD (original) | VAD | no disponible | PyTorch / ONNX | MIT | GitHub (snakers4/silero-vad) |
| Silero VAD ONNX en sherpa-onnx | VAD | 627K segun export documentado | ONNX | Apache 2.0 (proyecto) / MIT (modelo) | GitHub releases (k2-fsa/sherpa-onnx) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo original: cualquier incidencia debe reportarse al Silero Team o a sherpa-onnx, no al autor del espejo.
- La topologia, el entrenamiento y los parametros internos no estan documentados en este repositorio; hay que consultar las fuentes originales.
- El rendimiento del VAD (tasa de falsos positivos y negativos) depende del ruido de fondo, el microfono y el umbral de decision; no se aportan metricas.
- No se declaran idiomas soportados ni condiciones de audio especificas (frecuencia de muestreo, duracion de ventana).
- Licencia MIT permisiva para uso comercial, pero se debe conservar la atribucion al Silero Team y respetar las condiciones del proyecto sherpa-onnx (Apache 2.0) si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion mas alla de la aplicacion declarada.
- Verificar siempre el SHA-256 antes de cargar el fichero en produccion para garantizar que se usa el artefacto esperado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sssale/noor-silero-vad-v4
- Fichero origen en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de export ONNX de Silero VAD v4 en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/tree/696ce07efd1cd67cfd7b7fed57f2e34d56568942/scripts/silero_vad/v4
- Silero VAD (repositorio original): https://github.com/snakers4/silero-vad
