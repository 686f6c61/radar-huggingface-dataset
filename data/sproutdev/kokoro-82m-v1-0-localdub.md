# SproutDev/kokoro-82m-v1.0-localdub

## Resumen

SproutDev/kokoro-82m-v1.0-localdub es una obra derivada del modelo de sintesis de voz hexgrad/Kokoro-82M, publicada por el usuario SproutDev en formato ONNX y dividida en dos grafos independientes (`kokoro-a.onnx` y `kokoro-b.onnx`). No es un modelo entrenado desde cero: es una conversion y reempaquetado del checkpoint ONNX de `onnx-community/Kokoro-82M-v1.0-ONNX`, con modificaciones concretas orientadas a compatibilidad con DirectML, el backend de aceleracion de Windows.

El modelo resuelve un problema de portabilidad: el grafo original de Kokoro-82M emplea `ConvTranspose` con `output_padding=1` y `pads=[1,1]`, una configuracion que DirectML rechaza. Esta version sustituye esos parametros por su equivalente `pads=[1,0]` y divide la red en dos etapas (texto hasta el decodificador, y decodificador hasta forma de onda), lo que permite ejecutar cada mitad por separado. Su uso previsto es el proyecto LocalDub Auxiliar, una herramienta de doblaje.

Con un tamano de repositorio de 0,3 GB y 82 millones de parametros heredados del modelo base, es un modelo de texto a voz ligero, pensado para inferencia en CPU o GPU de gama baja. La salida es una forma de onda mono a 24 kHz. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo derivado de hexgrad/Kokoro-82M, convertido a ONNX y dividido en dos grafos secuenciales (etapa A: texto a decodificador; etapa B: decodificador a forma de onda) |
| Parametros totales | 82 millones (segun la denominacion del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada de texto es `input_ids` de tipo int64 con forma `[1, N]`, donde N es la longitud de la secuencia de tokens |
| Tipos de cuantizacion | No especificados en la model card; la entrada `style` es float32 `[1, 256]` y la salida es float32. El tag de HuggingFace indica `base_model:quantized:hexgrad/Kokoro-82M` |
| Idiomas soportados | No disponible; la model card no declara idiomas y el repositorio no incluye tags de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (dos ficheros: `kokoro-a.onnx` y `kokoro-b.onnx`) |
| Frecuencia de muestreo de salida | 24 kHz |
| Entradas de la etapa A | `input_ids` (int64, `[1, N]`), `style` (float32, `[1, 256]`), `speed` (float32, `[1]`) |
| Entradas de la etapa B | `style` y las tres salidas de la etapa A |
| Salida de la etapa B | `waveform` (float32) a 24 kHz |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento, porque este repositorio no entrena nada: es una conversion de formato. Lo que si se documenta es la estructura de inferencia. La red se ha partido en dos grafos ONNX que se ejecutan en secuencia. La etapa A recibe los tokens de texto (`input_ids`), un vector de estilo de 256 dimensiones (`style`) y un escalar de velocidad (`speed`), y produce tres tensores intermedios. La etapa B recibe esos tres tensores mas el vector de estilo y devuelve la forma de onda final a 24 kHz. Esa separacion permite cargar y liberar cada mitad por separado, util en equipos con memoria limitada.

Las modificaciones respecto al ONNX original son tres. Primero, se sustituye la configuracion `ConvTranspose` con `output_padding=1` / `pads=[1,1]` por la equivalente `pads=[1,0]`, cambio motivado porque DirectML rechaza la forma original. Segundo, se aplica la division en dos grafos descrita. Tercero, se evaluo sustituir la operacion `atan2` del generador (que introduce dependencia del signo del cero) para mejorar la compatibilidad, pero el autor decidio no aplicarla porque reducia la correlacion con la implementacion en PyTorch; segun la model card, el `kokoro-b.onnx` publicado se genero con la opcion `--sem-atan2`.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo ajuste por RLHF o DPO. Todos esos datos corresponden al modelo base hexgrad/Kokoro-82M y no se reproducen en esta ficha.

## Capacidades

- Sintesis de voz a partir de texto: convierte una secuencia de tokens (`input_ids`) en una forma de onda de audio a 24 kHz.
- Control de estilo: el vector `style` de 256 dimensiones permite condicionar el timbre o la identidad vocal, siempre que se disponga de un vector precalculado.
- Control de velocidad: la entrada escalar `speed` ajusta la velocidad de locucion sin reentrenar el modelo.
- Inferencia dividida: al estar partido en dos grafos, permite ejecutar la etapa A y la etapa B en dispositivos o momentos distintos, o liberar memoria entre ambas.
- Compatibilidad con DirectML: la sustitucion de los parametros de `ConvTranspose` habilita la ejecucion en el backend DirectML de ONNX Runtime en Windows.
- Ejecucion en CPU: con 82 millones de parametros y 0,3 GB de repositorio, la inferencia es viable sin GPU.
- Integracion en pipelines de doblaje: es el componente de sintesis del proyecto LocalDub Auxiliar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; el modelo es exclusivamente texto a voz.

## Casos de uso

- Doblaje automatico de video: es el uso original del modelo. El proyecto LocalDub Auxiliar lo emplea para generar las pistas de voz dobladas; el control de velocidad (`speed`) permite ajustar la locucion a la duracion del segmento original y el vector de estilo mantiene una identidad vocal coherente entre segmentos.
- Lectura de documentos en voz alta: integrado en un lector de pantalla o en una herramienta de accesibilidad, convierte texto plano en audio a 24 kHz ejecutandose en CPU, sin necesidad de GPU ni de servicios en la nube.
- Audiolibros y contenido largo por lotes: la division en dos grafos permite procesar fragmentos de texto de forma secuencial liberando memoria entre etapas, lo que facilita generar horas de audio en un equipo modesto.
- Locuciones para videojuegos: la posibilidad de fijar un vector de estilo por personaje permite generar variantes de voz consistentes para dialogos de PNJ sin grabar cada linea.
- Avisos y notificaciones por voz en aplicaciones de escritorio en Windows: al ser compatible con DirectML y ONNX Runtime, se puede empaquetar como dependencia local sin depender de APIs externas de TTS.
- Generacion de voz para prototipos y demos: con 0,3 GB de repositorio, cabe en el propio repositorio de un proyecto pequeno, lo que simplifica la distribucion de demos autoconte nidas.
- Sistemas de respuesta vocal interactiva (IVR) con latencia baja: el tamano reducido del modelo permite respuestas casi inmediatas en hardware de gama baja, adecuado para menus telefonicos o asistentes locales.
- Narracion de tutoriales y documentacion tecnica: permite generar pistas de audio sincronizadas con capturas o pasos de un manual, controlando la velocidad de lectura para cada seccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, similitud de hablante, WER, latencia) ni comparaciones cuantitativas con el modelo base o con la version ONNX de la que deriva. El unico dato cualitativo aportado es que la sustitucion de `atan2` se descarto porque empeoraba la correlacion con la implementacion en PyTorch, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision float32 para los 82 millones de parametros del modelo base (unos 328 MB solo en pesos, mas activaciones y buffers de audio). Es una estimacion a partir del recuento de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o DirectML. Al ser un modelo de 82 millones de parametros, no requiere A100 ni H100; una GTX 1050 Ti, una GTX 1650 o una RTX 3060 son mas que suficientes. En GPUs de centro de datos el modelo estaria infrautilizado.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con al menos 1 GB de VRAM, e incluso en graficas integradas.
- Ejecucion en CPU: viable. Es el escenario natural para este modelo dado su tamano; se recomienda un procesador con al menos 4 nucleos para mantener una latencia aceptable en generacion de audio continua.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), con los dos grafos `kokoro-a.onnx` y `kokoro-b.onnx` cargados secuencialmente. Tambien es posible exportarlo a otros entornos compatibles con ONNX, si bien el repositorio no documenta conversiones a GGUF, Ollama, vLLM ni TGI. Esas herramientas estan orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponible. La model card no publica cifras de tiempo real (RTF), latencia por frase ni muestras por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la conversion ONNX de origen. Los datos de arquitectura, entrenamiento y rendimiento de esos dos repositorios no se detallan en la model card de este derivado.

| Modelo | Parametros | Formato | Contexto / entrada | Licencia | Notas |
|---|---|---|---|---|---|
| SproutDev/kokoro-82m-v1.0-localdub | 82 M | ONNX dividido en dos grafos | `input_ids` int64 `[1, N]`, `style` `[1, 256]`, `speed` `[1]` | Apache-2.0 | `ConvTranspose` adaptado a DirectML; salida a 24 kHz |
| hexgrad/Kokoro-82M | 82 M | No disponible en la informacion proporcionada | No disponible | Apache-2.0 (heredada por el derivado) | Modelo base original |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82 M | ONNX (`onnx/model.onnx`) | No disponible | Apache-2.0 (heredada por el derivado) | Conversion ONNX de origen, commit `1939ad2a8e416c0acfeecc08a694d14ef25f2231` |

No se dispone de datos sobre otros modelos de texto a voz de tamano comparable en la informacion proporcionada, por lo que no se incluye una comparacion con alternativas de terceros.

## Limitaciones y advertencias

- Es una obra derivada, no un modelo entrenado de nuevo. Cualquier sesgo, limitacion de pronunciacion o error de sintesis proviene del modelo base hexgrad/Kokoro-82M y no ha sido corregido en esta version.
- No hay informacion sobre los datos de entrenamiento, por lo que no se puede evaluar la representacion de acentos, dialectos ni generos en la voz generada.
- No se declaran idiomas soportados. El repositorio no incluye tags de idioma y la model card esta redactada en portugues, pero eso no implica soporte de portugues ni de castellano; habria que verificar el comportamiento con los tokenizadores y voces del modelo base.
- Riesgo de alucinacion acustica: como en cualquier modelo generativo de audio, puede producir artefactos, ruidos, silencios anomalos o pronunciaciones incorrectas en palabras poco frecuentes, siglas o numeros.
- La modificacion de `ConvTranspose` cambia los parametros del grafo. Aunque el autor la presenta como equivalente, no se publican metricas que confirmen que la salida es identica a la del modelo original.
- El autor decidio no modificar `atan2` porque empeoraba la correlacion con PyTorch, pero la model card indica que el `kokoro-b.onnx` publicado usa `--sem-atan2`; conviene verificar que el fichero publicado corresponde a la variante deseada.
- El repositorio muestra 0 descargas y 0 "likes" en el momento de la consulta, y una ventana de creacion y actualizacion de menos de un minuto. No hay validacion por parte de la comunidad.
- Uso comercial: permitido por la licencia Apache-2.0, con la obligacion habitual de conservar el aviso de licencia y de atribucion. No se identifican clausulas adicionales de tipo non-commercial ni de uso restringido.
- Al no haber benchmarks publicados, no hay base para estimar la calidad perceptual (MOS) ni la inteligibilidad en produccion.
- No se especifican tipos de cuantizacion. Si se necesita una version en int8 o float16, habra que generarla por cuenta propia.
- El modelo esta pensado para un proyecto concreto (LocalDub Auxiliar) y su model card asume ese contexto; puede requerir trabajo adicional para integrarlo en otros pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SproutDev/kokoro-82m-v1.0-localdub
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Conversion ONNX de origen: onnx-community/Kokoro-82M-v1.0-ONNX (commit `1939ad2a8e416c0acfeecc08a694d14ef25f2231`, ruta `onnx/model.onnx`)
- Repositorio del proyecto que lo utiliza: https://github.com/dev-matheus-guilherme/localdub-auxiliar
- Documentacion del autor sobre la modificacion de `atan2`: `kokoro-onnx/README.md` dentro del repositorio de LocalDub Auxiliar
- Script de preparacion citado por el autor: `preparar.py`, en el repositorio de LocalDub Auxiliar
