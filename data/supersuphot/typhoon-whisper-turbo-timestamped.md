# supersuphot/typhoon-whisper-turbo-timestamped

## Resumen

typhoon-whisper-turbo-timestamped es una conversion a ONNX del modelo typhoon-ai/typhoon-whisper-turbo, un sistema de reconocimiento automatico del habla (ASR) especializado en tailandes desarrollado por el laboratorio tailandes Typhoon (SCB 10X). El modelo original es un ajuste fino de la arquitectura OpenAI Whisper large-v3-turbo sobre datos de habla en tailandes, con el objetivo de ofrecer alta precision y baja latencia para transcripcion offline. Esta version concreta ha sido exportada por el usuario supersuphot con las salidas de atencion cruzada habilitadas, lo que permite obtener marcas temporales a nivel de palabra (`return_timestamps: 'word'`) directamente en el navegador.

La relevancia de esta ficha esta en su formato de distribucion: al estar exportada a ONNX y pensada para Transformers.js, permite ejecutar un modelo de reconocimiento de voz tailandes enteramente en el cliente, sin enviar audio a un servidor. Esto habilita casos de privacidad, coste cero de inferencia en la nube y funcionamiento offline en aplicaciones web progresivas. El repositorio ocupa 2,4 GB e incluye variantes fp16 (para WebGPU) y q8 (para WASM/CPU).

Se trata de una conversion derivada, no de un modelo entrenado desde cero: todos los pesos y el merito del ajuste pertenecen a Typhoon. El modelo hereda de Whisper large-v3-turbo la ventana de audio de 30 segundos por segmento, la arquitectura transformer encoder-decoder y las cabezas de alineacion que hacen posible el etiquetado temporal. La licencia es MIT tanto en el original como en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper large-v3-turbo) |
| Parametros totales | aproximadamente 809 millones (heredados de Whisper large-v3-turbo; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de entrada; contexto de texto del decodificador no especificado en la informacion disponible |
| Tipos de cuantizacion | fp16 (WebGPU) y q8 per-channel (WASM/CPU) |
| Idiomas soportados | tailandes (codigo `th`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_fp16.onnx`, `encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |
| Tamano del repositorio | 2,4 GB |
| Pipeline | `automatic-speech-recognition` (variante `automatic-speech-recognition-with-past` en la exportacion) |
| Libreria | transformers.js |
| Modelo base | typhoon-ai/typhoon-whisper-turbo |
| Autor de la conversion | supersuphot |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente sigue la arquitectura de OpenAI Whisper large-v3-turbo: un transformer encoder-decoder que procesa mel-espectrogramas de 128 bandas en ventanas de 30 segundos y genera texto de forma autoregresiva. La variante "turbo" reduce el decodificador a un numero reducido de capas frente a las 32 del Whisper large-v3 estandar, lo que segun la documentacion del modelo base se traduce en una mejora notable del throughput manteniendo un rendimiento robusto en habla tailandesa. Sobre esta arquitectura, Typhoon (SCB 10X) realizo un ajuste fino supervisado con datos de audio en tailandes, aunque no se ha proporcionado informacion sobre el volumen de horas de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversion a ONNX se realizo con Transformers.js v3.8.1 mediante `scripts/convert.py --output_attentions`, con transformers 4.49.0, optimum en la version fijada por ese repositorio y torch 2.6.0, para la tarea `automatic-speech-recognition-with-past`. La cuantizacion se hizo con `scripts/quantize.py` del mismo repositorio, en fp16 y q8 per-channel. Una optimizacion destacable es que en el decodificador q8 la copia fp32 almacenada de la matriz de embeddings de tokens se sustituyo por un `DequantizeLinear` de su copia en uint8, manteniendo las mismas predicciones con un archivo mucho menor. Las cabezas de alineacion son las del modelo base, heredadas a su vez de Whisper large-v3-turbo, y son las que permiten la decodificacion de marcas temporales por palabra.

## Capacidades

- Reconocimiento automatico del habla en tailandes, con transcripcion de audio mono a 16 kHz.
- Generacion de marcas temporales a nivel de palabra (`return_timestamps: 'word'`) gracias a la exportacion de las salidas de atencion cruzada.
- Ejecucion integra en el navegador mediante Transformers.js, con backend WebGPU (dtype fp16) o WASM/CPU (dtype q8).
- Funcionamiento offline una vez descargados los pesos, sin dependencia de un servicio de inferencia remoto.
- Compatibilidad con la API de pipeline de Transformers.js, incluyendo los parametros `language` y `task` heredados de Whisper.
- Soporte de la variante con cache de atencion (`with-past`), que acelera la decodificacion autoregresiva.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio-vision: es exclusivamente un modelo de transcripcion.
- No se documentan capacidades multilingues efectivas mas alla del tailandes, aunque la arquitectura base sea multilingue.

## Casos de uso

- Subtitulado automatico de video en tailandes: el modelo genera marcas temporales por palabra, lo que permite producir ficheros SRT o VTT con sincronizacion fina e incluso efectos de resaltado tipo karaoke en reproductores web.
- Transcripcion con privacidad en el navegador: al ejecutarse con WebGPU o WASM en el cliente, el audio nunca sale del dispositivo, lo que facilita el cumplimiento de normativas de proteccion de datos en entornos sanitarios, legales o de recursos humanos.
- Indexacion y busqueda de archivos de audio: podcasts, programas de radio o archivos historicos en tailandes pueden transcribirse y almacenarse con marcas temporales para permitir busquedas por fragmento y salto directo al momento exacto de la grabacion.
- Aplicaciones educativas de aprendizaje de tailandes: la alineacion palabra-audio permite construir ejercicios de lectura guiada, comparacion de pronunciacion y resaltado sincronizado del texto.
- Actas y notas de reunion en aplicaciones web progresivas: una PWA puede transcribir reuniones en tailandes en tiempo casi real por segmentos de 30 segundos, sin coste de API y con funcionamiento offline en portatiles sin conexion estable.
- Analisis de llamadas de atencion al cliente: las marcas temporales por palabra permiten localizar rapidamente frases concretas (quejas, importes, nombres de producto) dentro de grabaciones largas, sin necesidad de escuchar el audio completo.
- Investigacion linguistica y creacion de corpus: la salida alineada palabra-audio facilita tareas de anotacion, alineacion forzada y estudio de fenomenos foneticos en tailandes.
- Integracion en herramientas de accesibilidad: generacion de subtitulos en vivo para contenido en tailandes dentro de un navegador, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La documentacion del modelo base afirma que supera significativamente a los modelos Whisper estandar en throughput manteniendo un rendimiento robusto en habla tailandesa, pero no se aportan cifras concretas de WER, MMLU, HumanEval, GSM8K ni de ninguna otra metrica. Tampoco se han publicado mediciones de latencia o de precision de las marcas temporales para esta conversion ONNX.

## Requisitos de hardware

- VRAM estimada: con cuantizacion fp16 los dos grafos ONNX ocupan aproximadamente la mitad de un modelo de 809 millones de parametros, del orden de 1,6 GB en total; con cuantizacion q8 el peso se reduce a aproximadamente la mitad, alrededor de 0,8 GB.
- La descarga inicial del repositorio es de 2,4 GB porque incluye simultaneamente las variantes fp16 y q8 de encoder y decodificador.
- GPU de consumo: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador (por ejemplo, arquitecturas integradas recientes de Intel o AMD, o GPU dedicadas como la serie RTX 30/40) puede ejecutar la variante fp16. La variante q8 esta pensada para CPU y entornos sin aceleracion grafica.
- GPU de servidor: para despliegue con ONNX Runtime se puede usar el execution provider de CUDA sobre A100, H100, L40S o RTX 4090; al tratarse de un modelo de menos de mil millones de parametros, no requiere memoria de GPU elevada.
- Cabe en GPU de consumo: si, la variante q8 es viable en CPU y la fp16 en GPU de gama media o incluso integrada con WebGPU.
- Opciones de despliegue: Transformers.js en navegador (WebGPU o WASM), ONNX Runtime en Node.js o Python, y servidores de inferencia basados en ONNX Runtime con execution providers de CUDA o TensorRT. No se distribuyen pesos en formato GGUF ni safetensors para esta conversion concreta.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Marcas temporales por palabra |
|---|---|---|---|---|---|---|
| supersuphot/typhoon-whisper-turbo-timestamped | aproximadamente 809 M | 30 s por ventana | tailandes | MIT | ONNX (fp16, q8) | Si, en navegador via Transformers.js |
| typhoon-ai/typhoon-whisper-turbo | aproximadamente 809 M | 30 s por ventana | tailandes | MIT | safetensors (PyTorch) | No documentado en la informacion disponible |
| openai/whisper-large-v3-turbo | aproximadamente 809 M | 30 s por ventana | multilingue | MIT | safetensors (PyTorch) | Si, mediante la libreria Whisper original |

La diferencia principal frente al modelo base es el formato y el objetivo de despliegue: la version de supersuphot prioriza la ejecucion en cliente con marcas temporales por palabra, mientras que el modelo de Typhoon esta pensado para inferencia en Python. Frente a Whisper large-v3-turbo sin ajustar, la ventaja esperada es una mayor precision en tailandes a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparativos que permitan cuantificar estas diferencias.

## Limitaciones y advertencias

- Modelo monoidioma: la model card declara unicamente tailandes. Aunque la arquitectura Whisper sea multilingue, no hay evidencia de que este ajuste fino conserve calidad en otros idiomas.
- Sin benchmarks publicados: no existen cifras de WER ni comparaciones verificables, por lo que cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre un conjunto de validacion representativo.
- Riesgo de alucinacion: como todos los modelos basados en Whisper, puede generar texto plausible en segmentos de silencio, ruido de fondo o musica, especialmente con audio de baja calidad.
- Segmentacion en ventanas de 30 segundos: los audios mas largos requieren troceado y solapamiento, lo que puede introducir errores o duplicaciones en las fronteras entre segmentos.
- Marcas temporales por palabra: dependen de las cabezas de alineacion heredadas de Whisper large-v3-turbo. En tailandes, al no existir separacion por espacios entre palabras, la definicion de "palabra" en la salida puede no coincidir con la segmentacion linguistica esperada por el usuario.
- Cuantizacion q8: aunque el autor indica que las predicciones se mantienen, la cuantizacion puede degradar ligeramente la precision respecto a la version fp16 en audio con acentos o ruido.
- Repositorio sin validacion comunitaria: cuenta con 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni mantenimiento posterior por parte del autor.
- Latencia en WASM: la variante q8 esta pensada para CPU o WASM, donde la transcripcion de audio largo puede resultar lenta; conviene medir antes de plantearla como alternativa a un servicio en servidor.
- Licencia: MIT, tanto en el modelo base como en la conversion. Permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/supersuphot/typhoon-whisper-turbo-timestamped
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-whisper-turbo
- Model card del modelo base: https://huggingface.co/typhoon-ai/typhoon-whisper-turbo/blob/main/README.md
- Laboratorio Typhoon (SCB 10X): https://opentyphoon.ai/
- Ficha del modelo base en Inferix: https://inferix.co/models/typhoon-ai/typhoon-whisper-turbo
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/typhoon-ai/typhoon-whisper-turbo
- Transformers.js: https://github.com/huggingface/transformers.js
