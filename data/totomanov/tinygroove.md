# totomanov/tinygroove

## Resumen

tinygroove es un generador compacto de one-shots de bateria de estilo house (bombos, palmas, hi-hats y percusion) desarrollado por totomanov. El modelo parte de una destilacion del modelo texto-a-audio Stable Audio 3 en su variante `small-sfx` y se distribuye como un par de grafos ONNX que pueden ejecutarse en una pestana de navegador. Con 5.258.163 parametros en total, genera un pack de dieciseis sonidos de bateria en aproximadamente un segundo, sin contener ningun sample de audio real en sus pesos.

La relevancia del modelo reside en su extremada ligereza y en su enfoque de despliegue: en lugar de requerir GPU o infraestructura de servidor, el modelo cabe en unos 22 MB de pesos en float32 y se ejecuta integramente en cliente mediante onnxruntime. Esto lo convierte en un caso practico de destilacion de un modelo grande de audio hacia un generador especializado y desplegable en el navegador, con licencia MIT.

La arquitectura combina un generador basado en flow matching (una unica etapa de denoising) con un decodificador que transforma codigos latentes de sonido en forma de onda a 44,1 kHz, mono y un segundo de duracion. El acondicionamiento se realiza mediante tipo de bombo, palabras de prompt (172 en total, cubriendo 27 generos y 22 cajas de ritmos) y parametros continuos de decay, brillo y tono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (generador) + autoencoder con decodificador (generacion de waveform) |
| Parametros totales | 5.258.163 (generador 4.238.992 + decodificador 1.019.171) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (generacion de audio de 1 segundo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, float32) y PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo se compone de dos piezas: un generador de flow matching que realiza una unica etapa de denoising sobre ruido inicial, y un decodificador que convierte codigos latentes de sonido en waveform. El generador tiene 4.238.992 parametros y el decodificador 1.019.171. Los pesos se distribuyen como grafos ONNX (`onnx/flow.onnx`, 17,0 MB; `onnx/decoder.onnx`, 5,2 MB) y como checkpoints PyTorch (`tinygroove-flow.pt` y `tinygroove-ae.pt`, este ultimo incluye tambien el encoder de 0,74M usado en entrenamiento).

El entrenamiento se basa en destilacion desde el modelo profesor Stable Audio 3 `small-sfx`. El conjunto de datos consiste en 48.741 clips de un segundo renderizados por el profesor. El proceso completo de entrenamiento requirio 85 + 19 minutos en una unica GPU H100. El acondicionamiento del modelo incluye el tipo de bombo (16 tipos), 172 palabras de prompt que cubren 27 generos y 22 cajas de ritmos, y parametros continuos de decay, brillo y tono.

## Capacidades

- Generacion de one-shots de bateria de estilo house: bombos, palmas, snares, hi-hats cerrados y abiertos, rim, conga y otras percusiones, hasta 16 tipos distintos.
- Generacion condicionada por tipo de bombo, palabras de prompt (generos y cajas de ritmos) y parametros de control de decay, brillo y tono.
- Salida de audio de un segundo, mono, a 44,1 kHz.
- Generacion de packs completos de dieciseis sonidos en aproximadamente un segundo.
- Ejecucion en navegador mediante onnxruntime, sin necesidad de backend.
- No contiene samples de audio: todo el audio se genera desde los pesos del modelo.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente ni procesamiento de lenguaje natural; es un modelo puramente de generacion de audio.

## Casos de uso

- Produccion musical asistida: generacion rapida de packs de bateria house coherentes (dieciseis sonidos en un segundo) para su uso en DAWs, con control de genero y caja de ritmos mediante prompts.
- Herramientas web de creacion musical: al ejecutarse en el navegador con onnxruntime, permite integrar un generador de one-shots en una pagina web sin servidor ni GPU, como demuestra la demo oficial.
- Prototipado de ideas ritmicas: los parametros de decay, brillo y tono permiten explorar variaciones de un mismo tipo de bombo de forma interactiva y en tiempo real.
- Diseno de sonido para videojuegos y multimedia: generacion de percusiones house libres de samples, lo que simplifica la gestion de derechos en proyectos con licencia MIT.
- Educacion y experimentacion en sintesis de audio: el modelo sirve como caso de estudio de destilacion de un modelo texto-a-audio grande a un generador de 5,3M de parametros, con codigo de ejemplo en numpy y onnxruntime.
- Generacion de variaciones por genero: con 27 generos y 22 cajas de ritmos en el vocabulario de prompts, se pueden crear packs tematicos (por ejemplo, Chicago house, deep house, tech house o warehouse rave) de forma automatizada.
- Integracion en plugins o apps de escritorio: los pesos ONNX y PyTorch permiten incorporar el generador en herramientas nativas sin dependencias de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son operativos: generacion de un pack de dieciseis sonidos en aproximadamente un segundo en una pestana de navegador, y un tiempo de entrenamiento de 85 + 19 minutos en una unica GPU H100.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos ONNX suman aproximadamente 22,2 MB en float32, por lo que la huella de memoria es minima y cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecutarse en navegador, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: si, y tambien en CPU y en el navegador.
- Opciones de despliegue: onnxruntime (navegador o servidor), PyTorch con los pesos `.pt`, y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput estimados: aproximadamente un segundo para generar un pack de dieciseis sonidos en navegador, segun la model card.
- Codigo de ejemplo disponible en `example.py`, que usa unicamente numpy y onnxruntime.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (generadores de one-shots de bateria destilados y ejecutables en navegador).

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en one-shots de bateria de estilo house; no genera secuencias, loops ni audio de otras familias instrumentales.
- La salida esta limitada a un segundo de audio, mono, a 44,1 kHz.
- El acondicionamiento linguistico se limita a un vocabulario cerrado de 172 palabras (27 generos y 22 cajas de ritmos); no es un modelo de texto libre.
- Al ser un modelo destilado de un profesor de efectos de sonido (`small-sfx`), la fidelidad y diversidad pueden ser inferiores a las del modelo original.
- No se han publicado evaluaciones objetivas (FAD, MOS u otras) ni benchmarks en la informacion disponible; el rendimiento cualitativo solo puede valorarse mediante las muestras publicadas.
- Riesgo de sesgo estilistico: al entrenarse sobre clips renderizados por el profesor, hereda las caracteristicas y posibles sesgos de ese modelo.
- La licencia MIT permite uso comercial, pero el autor no documenta garantias ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto reciente y sin validacion comunitaria.
- El repo figura con un tamano de 0.0 GB, lo que puede indicar que los pesos no estan completamente subidos o que la medicion no refleja el contenido real; conviene verificar los ficheros antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/totomanov/tinygroove
- Demo: https://tinygroove.com
- Codigo: https://github.com/totomanov/tinygroove
- Muestras de audio: https://huggingface.co/totomanov/tinygroove/tree/main/samples
- Modelo profesor (Stable Audio 3 `small-sfx`): no disponible en la informacion proporcionada
