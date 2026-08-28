# vadimsuhanov/gigaam-v3-e2e-ctc-coreml

## Resumen

GigaAM v3_e2e_ctc Core ML es una conversión a Core ML del modelo de reconocimiento automático de habla (ASR) `v3_e2e_ctc` de la familia GigaAM, desarrollada por vadimsuhanov a partir del modelo base `ai-sage/GigaAM-v3`. El artefacto contiene un encoder basado en arquitectura Conformer junto con una cabeza CTC, cuya salida es una distribución log-softmax sobre los caracteres o subpalabras. Está diseñado específicamente para ejecutarse en dispositivos Apple (macOS) mediante el framework Core ML, con una entrada fija de audio ruso de hasta 25 segundos.

El modelo base GigaAM-v3 es un modelo fundacional de 220-240 millones de parámetros, preentrenado sobre 700 000 horas de habla rusa con el objetivo HuBERT-CTC, y posteriormente afinado para ASR con criterio CTC. Esta conversión Core ML mantiene la precisión float32 y se distribuye bajo licencia MIT, lo que permite su integración en aplicaciones comerciales sin restricciones de uso. Su relevancia radica en ofrecer un ASR ruso de última generación optimizado para el ecosistema Apple, con un formato nativo que evita dependencias de Python o librerías externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + cabeza CTC, convertido a Core ML ML Program |
| Parametros totales | 220-240 millones (modelo base GigaAM-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 25 segundos de audio (entrada fija batch-one) |
| Tipos de cuantizacion | no disponible (conversion en float32) |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 emplea una arquitectura Conformer, que combina capas de atención multi-cabeza con convoluciones profundas, lo que resulta eficaz para modelar dependencias locales y globales en señales de audio. Se preentrenó sobre 700 000 horas de habla rusa utilizando el objetivo HuBERT-CTC, una variante de aprendizaje auto-supervisado que predice unidades discretas ocultas. Posteriormente, el encoder se afinó para la tarea de reconocimiento de habla con un criterio CTC (Connectionist Temporal Classification), dando lugar a la variante `v3_e2e_ctc`.

La conversión a Core ML, realizada por vadimsuhanov, encapsula el encoder y la cabeza CTC en un único ML Program con precisión float32. El artefacto está diseñado para una entrada fija de batch uno y una duración máxima de audio de 25 segundos, lo que simplifica el contrato de ejecución en aplicaciones macOS. No se incluye el decodificador CTC; la salida es directamente la distribución log-softmax, que la aplicación debe interpretar para obtener la transcripción final.

## Capacidades

- Reconocimiento automático de habla en ruso, con salida de log-softmax sobre el vocabulario de subpalabras (SentencePiece).
- Transcripción de audio de hasta 25 segundos por inferencia, adecuada para fragmentos cortos o segmentación previa.
- Integración nativa en aplicaciones macOS mediante Core ML, sin necesidad de runtime de Python ni librerías externas.
- Inferencia en dispositivo, lo que permite procesamiento offline y preservación de la privacidad.
- No incluye capacidades de tool calling, agentes, visión ni generación de texto; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo puede procesar segmentos de audio de hasta 25 segundos, por lo que se integraría en un pipeline de segmentación y transcripción continua para generar actas o subtítulos.
- Subtitulado automático de vídeos en ruso: al ejecutarse localmente en macOS, permite generar subtítulos sin depender de servicios en la nube, con latencia reducida y control total sobre los datos.
- Asistentes de voz para aplicaciones de escritorio: el modelo puede convertir comandos de voz en texto dentro de aplicaciones macOS, habilitando interacción por voz en ruso sin conexión.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir grabaciones de llamadas en ruso para extraer métricas, detectar intenciones o realizar búsquedas sobre el contenido.
- Herramientas de accesibilidad: personas con dificultades de escritura pueden dictar texto en ruso en aplicaciones compatibles con Core ML, mejorando la accesibilidad en el ecosistema Apple.
- Investigación en procesamiento de habla: al ser un artefacto Core ML con licencia MIT, los investigadores pueden utilizarlo como punto de partida para experimentos de ASR en ruso, comparando su rendimiento con otras implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de WER (Word Error Rate) ni comparaciones con otros sistemas ASR. Se recomienda consultar el repositorio oficial de GigaAM para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- El artefacto está diseñado para ejecutarse en dispositivos Apple con soporte Core ML, es decir, macOS 11 o superior en equipos con chip Intel o Apple Silicon.
- El tamaño del repositorio es de 0,9 GB, lo que sugiere que el modelo en float32 ocupa aproximadamente 900 MB en disco. La memoria necesaria en tiempo de inferencia dependerá del runtime de Core ML, pero un Mac con 8 GB de RAM o más debería ser suficiente para procesar audio de hasta 25 segundos.
- Al ser un ML Program de Core ML, se puede desplegar mediante las APIs nativas de Core ML en Swift o Objective-C, o mediante herramientas como `coremltools` para integración en pipelines de Python.
- No se dispone de datos de latencia o throughput específicos para esta conversión. En general, un modelo Conformer de ~220M parámetros en float32 puede ejecutarse en tiempo real en Apple Silicon, pero se recomienda realizar pruebas de rendimiento en el hardware objetivo.
- No se proporcionan versiones cuantizadas (por ejemplo, int8 o fp16), por lo que el uso en dispositivos con memoria limitada puede requerir optimizaciones adicionales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta conversión Core ML. A modo de referencia cualitativa, se pueden considerar las siguientes alternativas para ASR en ruso:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-v3 (base) | 220-240M | 25 s audio | ruso | MIT | PyTorch / ONNX |
| Whisper large-v3 | 1550M | 30 s audio | 99+ idiomas | MIT | PyTorch / Core ML (no oficial) |
| Vosk (modelo ruso) | ~50M | tiempo real | ruso | Apache 2.0 | nativo (C/C++) |

GigaAM-v3 está especializado en ruso y ofrece un rendimiento competitivo en ese idioma, mientras que Whisper es multilingüe pero con un coste computacional mayor. Vosk es más ligero y adecuado para streaming, pero con menor precisión en tareas complejas. Esta conversión Core ML aporta la ventaja de ejecución nativa en macOS, algo que no ofrecen las versiones PyTorch de GigaAM.

## Limitaciones y advertencias

- El modelo solo soporta ruso; no es adecuado para otros idiomas.
- La entrada está limitada a 25 segundos de audio por inferencia. Audios más largos requieren segmentación previa, lo que puede afectar a la coherencia de la transcripción en fragmentos con solapamiento.
- La conversión se realizó en float32, sin cuantización, lo que implica un mayor uso de memoria y posiblemente menor velocidad en comparación con versiones optimizadas.
- No se incluye el decodificador CTC; la aplicación debe implementar la decodificación greedy o beam search sobre la salida log-softmax.
- El artefacto está pensado para macOS; no se proporcionan versiones para iOS, Linux o Windows.
- No se han publicado métricas de rendimiento (WER) para esta conversión específica, por lo que se desconoce si la conversión a Core ML introduce degradación respecto al modelo original.
- Aunque la licencia MIT permite uso comercial, el modelo base GigaAM-v3 puede tener dependencias adicionales (por ejemplo, SentencePiece) que deben verificarse en el repositorio original.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/vadimsuhanov/gigaam-v3-e2e-ctc-coreml
- Modelo base en HuggingFace: https://huggingface.co/ai-sage/GigaAM-v3
- Repositorio oficial de GigaAM en GitHub: https://github.com/salute-developers/GigaAM
- Artefacto RNNT relacionado: https://huggingface.co/vadimsuhanov/gigaam-v3-e2e-rnnt-coreml
