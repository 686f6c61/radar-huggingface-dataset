# tatsu020/rs35kh-fa-onnx

## Resumen

El modelo `tatsu020/rs35kh-fa-onnx` es un derivado en formato ONNX del modelo japonés de reconocimiento de voz `reazon-research/japanese-wav2vec2-base-rs35kh`, desarrollado por Tatsu020 (TATSUYUKI IKEDA) para el módulo de sincronización de letras de la aplicación de escritorio UtaLog. Su propósito principal es proporcionar emisiones acústicas CTC para la alineación forzada de audio en japonés con letras proporcionadas por el usuario, un paso intermedio en la generación de archivos LRC (letras sincronizadas). No es un sistema de transcripción automática de voz (ASR) de propósito general, sino una pieza especializada en el flujo de alineación de canciones.

La relevancia de este modelo radica en que permite ejecutar la alineación de letras de forma local, sin depender de servicios en la nube, y en un formato optimizado para ONNX Runtime, lo que facilita su integración en aplicaciones multiplataforma. La arquitectura se basa en Wav2Vec2 con una cabeza CTC, exportada a ONNX con precisión mixta: el extractor de características convolucional se mantiene en FP32 y el encoder se convierte a FP16. El tamaño del repositorio es de aproximadamente 0,2 GB, con un único archivo de pesos de unos 194 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (wav2vec2 base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, entrada de 16 kHz mono) |
| Tipos de cuantizacion | FP16 (encoder), FP32 (extractor convolucional) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `.onnx`, opset 17) |

## Arquitectura y entrenamiento

El modelo es una exportacion a ONNX del checkpoint `reazon-research/japanese-wav2vec2-base-rs35kh`, que a su vez es un modelo wav2vec2 base entrenado por ReazonSpeech para reconocimiento de voz en japones. La conversion se realizo mediante el script `tools/alignment/convert_rs35kh_to_onnx.py` del proyecto UtaLog, exportando la clase `Wav2Vec2ForCTC` a ONNX. Durante la conversion se mantuvo el extractor de caracteristicas convolucional en FP32 y se convirtio el encoder a FP16, ademas de normalizar el atributo `Reshape.allowzero` para compatibilidad con DirectML.

No se proporcionan detalles sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). La informacion disponible solo cubre el proceso de conversion y las modificaciones tecnicas aplicadas. El modelo resultante acepta como entrada un tensor `input_values` de tipo float32 con forma `[batch, samples]` correspondiente a audio mono de 16 kHz, y produce logits de forma `[batch, frames, 3003]`, donde 3003 es el numero de clases del vocabulario CTC.

## Capacidades

- Alineacion forzada de audio japones con letras: el modelo genera emisiones acusticas CTC que permiten alinear transcripciones conocidas con el audio, util para sincronizar letras de canciones.
- Procesamiento de audio de 16 kHz mono: entrada disenada para senales de voz o musica con esa tasa de muestreo.
- Inferencia local mediante ONNX Runtime: al estar en formato ONNX, puede ejecutarse en CPU, GPU o hardware compatible con DirectML sin necesidad de frameworks de deep learning completos.
- Soporte de precision mixta: el encoder en FP16 reduce el uso de memoria y acelera la inferencia en hardware compatible, mientras que el extractor en FP32 mantiene la estabilidad numerica.
- Integracion con el ecosistema UtaLog: disenado especificamente para el flujo de alineacion de letras de UtaLog, que incluye generacion de lecturas, tokenizacion, busqueda de candidatos y revision de lineas de baja confianza.
- No soporta tool calling, agentes, vision ni otras capacidades multimodales; es un modelo de audio puro.

## Casos de uso

- Sincronizacion de letras de canciones japonesas: el modelo se utiliza en UtaLog para alinear las letras de una cancion con su audio, generando archivos LRC o subtitulos sincronizados. Es adecuado porque produce emisiones CTC que se combinan con la tokenizacion de las letras conocidas.
- Subtitulado de contenido audiovisual en japones: dado un audio y una transcripcion, el modelo puede ayudar a colocar los subtitulos en los instantes correctos, aunque requiere un postprocesamiento adicional para obtener los tiempos finales.
- Herramientas de estudio de idiomas: aplicaciones de pronunciacion o karaoke pueden usar la alineacion para resaltar la letra que se esta cantando en tiempo real, mejorando la experiencia de aprendizaje.
- Analisis fonetico de audio japones: investigadores o desarrolladores pueden extraer alineaciones a nivel de fonema o caracter para estudios linguisticos, aprovechando la salida CTC del modelo.
- Integracion en aplicaciones de escritorio sin conexion: al ser un modelo ONNX ligero, puede ejecutarse localmente en aplicaciones de escritorio o moviles sin depender de servicios en la nube, lo que garantiza privacidad y baja latencia.
- Generacion de contenido para karaoke: plataformas de karaoke pueden automatizar la creacion de pistas sincronizadas a partir de audio y letras, reduciendo el trabajo manual de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo upstream indica que el rendimiento en transcripcion ASR de audio largo es pobre, por lo que UtaLog utiliza fragmentos de audio acotados y alineacion local en lugar de decodificar una cancion completa como ASR sin restricciones. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 194 MB (archivo `rs35kh_ctc_fp16.onnx`), lo que permite su ejecucion en sistemas con recursos modestos.
- VRAM estimada: no especificada por el autor. Dado el tamano del modelo y el uso de FP16, se estima que una GPU con al menos 2 GB de VRAM seria suficiente para inferencia en tiempo real, aunque no hay datos oficiales.
- GPU recomendadas: no se indican modelos concretos. Cualquier GPU moderna compatible con ONNX Runtime (NVIDIA, AMD, Intel) o con DirectML (Windows) puede ejecutar el modelo.
- CPU: es posible ejecutar el modelo en CPU con ONNX Runtime, aunque la latencia sera mayor. Para aplicaciones de tiempo real se recomienda GPU.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), DirectML, o cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos alternativos de la misma categoria. El unico punto de referencia es el modelo original `reazon-research/japanese-wav2vec2-base-rs35kh`, del cual este es un derivado. No se conocen otros modelos ONNX de alineacion forzada para japones con caracteristicas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR de proposito general: su funcion principal es la alineacion forzada, no la transcripcion libre. El modelo upstream reporta un rendimiento pobre en transcripcion de audio largo, por lo que no debe usarse para transcribir conversaciones o discursos completos.
- Requiere postprocesamiento adicional: para generar un archivo LRC o subtitulos sincronizados, es necesario un flujo completo como el de UtaLog (generacion de lecturas, tokenizacion, busqueda de candidatos, etc.). El modelo por si solo no produce el resultado final.
- Solo soporta japones: no es util para otros idiomas.
- Reproducibilidad no garantizada: el autor indica que el artefacto alojado es un artefacto de desarrollo recuperado y que una conversion limpia posterior no fue byte-identica. Por tanto, no se puede reproducir exactamente el mismo archivo desde el codigo fuente.
- No es un lanzamiento oficial de ReazonSpeech: el modelo es un derivado no oficial, aunque se distribuye bajo la misma licencia Apache-2.0.
- Compatibilidad con DirectML: se realizaron modificaciones especificas (normalizacion de `Reshape.allowzero`) para garantizar el funcionamiento en DirectML, pero no se garantiza el comportamiento en todos los backends de ONNX Runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tatsu020/rs35kh-fa-onnx
- Modelo original (upstream): https://huggingface.co/reazon-research/japanese-wav2vec2-base-rs35kh
- Perfil del autor en Hugging Face: https://huggingface.co/tatsu020
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
