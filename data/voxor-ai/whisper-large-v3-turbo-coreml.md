# voxor-ai/whisper-large-v3-turbo-coreml

## Resumen

`voxor-ai/whisper-large-v3-turbo-coreml` es una conversión a Core ML del codificador de audio (audio encoder) del modelo `openai/whisper-large-v3-turbo` de OpenAI, publicada por el usuario voxor-ai. No se trata de un modelo de reconocimiento de voz completo, sino únicamente del componente encoder empaquetado como `AudioEncoder.mlmodelc` compilado, lo que permite ejecutarlo de forma nativa en el ecosistema Apple (Core ML) sobre iOS 16 / macOS 13 o superior.

El artefacto recibe como entrada un tensor de características log-mel de 30 segundos (`melspectrogram_features` con forma `[1, 128, 1, 3000]`, float16) y devuelve los embeddings del encoder (`encoder_output_embeds` con forma `[1, 1280, 1, 1500]`, float16). Los pesos están cuantizados en fp16 con paletización de 4 bits, lo que reduce el tamaño del repositorio a unos 0,3 GB. El decoder y el tokenizer no forman parte de este repositorio, por lo que para una transcripción completa hace falta emparejarlo con el decoder correspondiente de Whisper large-v3-turbo.

Su relevancia es acotada pero práctica: facilita el despliegue del encoder de Whisper en aplicaciones Apple sin necesidad de convertir manualmente los pesos a Core ML, con una licencia MIT permisiva y un tamaño manejable para integrarse en apps de macOS e iOS. Al tener 0 descargas y 0 likes en el momento de la consulta, se trata de una publicación muy reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper large-v3-turbo), convertido a Core ML |
| Parametros totales | no disponible (solo se distribuye el encoder; el modelo base completo es large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio de entrada (ventana estandar de Whisper) |
| Tipos de cuantizacion | fp16 con pesos paletizados a 4 bits |
| Idiomas soportados | no disponible (el modelo base es multilingue; la model card no lo detalla) |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`AudioEncoder.mlmodelc`); ficheros > 1 MB comprimidos con zstd (`.zst`) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el codificador del modelo Whisper large-v3-turbo de OpenAI, es decir, la parte del transformer que transforma el espectrograma log-mel en embeddings de audio. La conversión a Core ML se ha realizado con pesos en fp16 y paletización de 4 bits, una tecnica de compresion que reduce el espacio ocupado manteniendo la precision numerica en fp16 para las activaciones. La interfaz es fija: entrada `[1, 128, 1, 3000]` (128 canales mel, 3000 frames, equivalentes a 30 s) y salida `[1, 1280, 1, 1500]` (1280 dimensiones de embedding, 1500 posiciones temporales).

No se proporciona informacion sobre el proceso de entrenamiento, el dataset utilizado ni posibles ajustes finos (RLHF/DPO), ya que se trata de una conversion de un modelo preentrenado por OpenAI. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia conversion a Core ML y la compresion zstd de los ficheros. El decoder, el tokenizer y la logica de decodificacion (greedy, beam search) no estan incluidos en este artefacto.

## Capacidades

- Extraccion de embeddings de audio a partir de espectrogramas log-mel de 30 segundos, como primer paso de un pipeline de reconocimiento automatico del habla.
- Base para transcripcion multilingue si se combina con el decoder de Whisper large-v3-turbo (no incluido en este repositorio).
- Ejecucion nativa en Core ML sobre iOS 16 / macOS 13 o superior, con aceleracion por GPU y Neural Engine en dispositivos Apple.
- Entrada y salida en float16, adecuada para inferencia en dispositivos con recursos limitados.
- No soporta tool calling, function calling, agentes, vision ni audio directo: es un componente puro de encoder.
- No incluye deteccion de idioma, marcas de tiempo ni segmentacion; esas funciones residen en el decoder y en la logica de postprocesado de Whisper.

## Casos de uso

- Transcripcion en apps de iOS y macOS: integrando este encoder con el decoder de Whisper large-v3-turbo, se puede construir una app de dictado o transcripcion que corra integramente en el dispositivo, sin enviar audio a la nube, aprovechando Core ML y el Neural Engine.
- Subtitulado local de video: procesar pistas de audio en segmentos de 30 s, extraer embeddings con este encoder y decodificar con Whisper para generar subtitulos en un editor de video nativo de macOS.
- Asistentes de voz offline: en aplicaciones de notas de voz o asistentes personales que requieran privacidad, el encoder permite la primera etapa del pipeline sin conexion.
- Investigacion en eficiencia de inferencia: util para medir el rendimiento del encoder de Whisper large-v3-turbo en hardware Apple (latencia, consumo energetico) frente a implementaciones en PyTorch o ONNX.
- Prototipado rapido en Xcode: al ser un `.mlmodelc` compilado, se puede arrastrar directamente a un proyecto Xcode y probar el encoder sin pasos de conversion.
- Pipelines de analisis de audio a gran escala en macOS: extraccion de embeddings para tareas posteriores (clasificacion de audio, diarizacion, busqueda semantica) reutilizando el encoder como extractor de caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 0,3 GB; el modelo compilado en fp16 con paletizacion de 4 bits es adecuado para dispositivos con memoria unificada limitada.
- GPU recomendadas: no se especifican; al ser Core ML, se ejecuta en Apple Silicon (M1, M2, M3, M4 y posteriores) y en GPUs Apple integradas, con posible uso del Neural Engine.
- Cabe en dispositivos consumer: si, en iPhone y iPad compatibles con iOS 16 o superior, y en Mac con macOS 13 o superior.
- Opciones de despliegue: Core ML (`mlmodelc`), integracion via Xcode, Core ML Tools para Python, y uso combinado con el decoder de Whisper en Swift u Objective-C.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| voxor-ai/whisper-large-v3-turbo-coreml | solo encoder (large-v3-turbo) | 30 s de audio | Core ML (fp16, 4-bit palettized) | MIT | Conversion parcial; requiere decoder aparte |
| openai/whisper-large-v3-turbo | 809 M (modelo completo) | 30 s de audio | PyTorch (safetensors) | MIT | Modelo original completo (encoder + decoder) |
| whisper-large-v3 | 1,55 B | 30 s de audio | PyTorch (safetensors) | MIT | Version anterior, mas grande y precisa en algunos idiomas |

La comparativa se limita al modelo base y a la version anterior de Whisper porque no se dispone de informacion sobre otras conversiones Core ML equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo contiene el encoder: no puede transcribir audio por si solo; es imprescindible emparejarlo con el decoder de Whisper large-v3-turbo y gestionar el tokenizer y la decodificacion.
- Ventana fija de 30 s: audios mas largos requieren segmentacion manual y concatenacion de resultados.
- Los ficheros mayores de 1 MB estan comprimidos con zstd (`.zst`) y deben descomprimirse antes de su uso; si se integran directamente en Xcode sin descomprimir, fallaran.
- Requiere iOS 16 / macOS 13 o superior; no funciona en versiones anteriores del sistema operativo.
- La cuantizacion a 4 bits con paletizacion puede introducir una ligera perdida de precision frente al modelo original en fp16 o fp32; no se documenta el impacto exacto.
- No hay informacion sobre sesgos, tasas de alucinacion ni rendimiento por idioma en la model card; dado que el modelo base es multilingue, esos riesgos heredados del original siguen aplicando.
- Sin validacion comunitaria (0 descargas, 0 likes) y publicacion muy reciente; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Licencia MIT permisiva para uso comercial, pero el aviso `NOTICE` debe respetarse segun los terminos de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voxor-ai/whisper-large-v3-turbo-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Documentacion de Core ML: https://developer.apple.com/documentation/coreml
- Core ML Tools: https://github.com/apple/coremltools
