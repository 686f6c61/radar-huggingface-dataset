# Tdhdcd/gigaam-v3-e2e-ctc-int8-onnx

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de terceros: el usuario Tdhdcd ha empaquetado el checkpoint oficial de GigaAM v3 e2e CTC (proyecto de SaluteDevelopers, disponible en GitHub) en un único fichero ONNX con pesos cuantizados a int8, y ofrece además una variante fp16 pensada para WebGPU. El resultado es un sistema de reconocimiento automático de habla (ASR) para ruso que recibe audio mono a 16 kHz y devuelve directamente texto con puntuación, mayúsculas y dígitos, sin necesidad de un modelo de puntuación separado.

La particularidad técnica es que la extracción de características log-mel está integrada en el propio grafo ONNX, de modo que el consumidor solo tiene que entregar muestras float y leer la salida `log_probs` en formato CTC. El decodificado propuesto por el autor es greedy: se colapsan repeticiones, se descartan el símbolo vacío y `<unk>`, y el carácter `▁` de SentencePiece se traduce a espacio. La frase de entrada está limitada a 25 segundos, lo que obliga a segmentar audio largo.

Su relevancia práctica es acotada pero clara: permite ejecutar un ASR ruso de calidad razonable sin PyTorch, en CPU o en navegador, con un fichero de 320 MB (int8) o 446 MB (fp16). Como contrapartida, el repositorio tiene cero descargas y cero likes, no declara licencia y no publica métricas de error, por lo que debe tratarse como un artefacto a validar antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red CTC de GigaAM v3 e2e; el autor no documenta la topología interna en la model card) |
| Parametros totales | no disponible (los 320 MB en int8 y 446 MB en fp16 apuntan a un modelo de tamaño medio, del orden de cientos de millones de parámetros; no se publica la cifra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 25 s de audio por frase; tensor de entrada `[1, T]` a 16 kHz |
| Tipos de cuantizacion | int8 en los pesos (excepto la multiplicación por filtros mel, que se mantiene en mayor precisión) y fp16 en el encoder de la variante WebGPU |
| Idiomas soportados | ruso (`ru`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (un único fichero por variante) |
| Ficheros | `gigaam-v3-e2e-ctc-int8.onnx` (320.544.088 bytes), `gigaam-v3-e2e-ctc-fp16.onnx` (445.841.519 bytes) |
| Entrada | audio float `[1, T]`, 16 kHz, mono |
| Salida | `log_probs` CTC `[1, frames, clases]` |
| Metadatos embebidos | `vocabulary` (piezas SentencePiece en JSON), `blank_id`, `sample_rate` |
| Decodificado | CTC greedy (colapso de repeticiones; se descartan blank y `<unk>` con id 0; `▁` equivale a espacio) |
| Fecha de publicación | 2026-10-23 (última actualización 2026-10-25) |

## Arquitectura y entrenamiento

El repositorio es una redistribución: el autor parte del checkpoint oficial de GigaAM v3 e2e CTC y lo exporta a un grafo ONNX único. En lugar de entrenar o ajustar nada, el trabajo consiste en fusionar el frontend de características (ventaneo, espectrograma mel y logaritmo) dentro del modelo, de forma que la entrada sea directamente la forma de onda. La salida se expone como log-probabilidades CTC, lo que deja el decodificado en manos del consumidor; el autor documenta únicamente una estrategia greedy, aunque el formato permite acoplar un decodificador con modelo de lenguaje o búsqueda por haces.

El detalle de cuantización es relevante: todos los pesos se comprimen a int8 salvo la multiplicación por los filtros mel, que se conserva en precisión superior porque, según el autor, cuantizarla también hace que el modelo produzca salida inservible. Existe una segunda variante en fp16 en la que el encoder va a media precisión pero el cálculo de características y de longitudes se mantiene en fp32, presumiblemente para evitar inestabilidad numérica en WebGPU. No se documentan datos de entrenamiento (número de tokens, composición del corpus, uso de aumento de datos o de decodificado con LM); toda esa información correspondería al proyecto GigaAM original y no se recoge en esta model card. Tampoco aplican RLHF ni DPO, al tratarse de una tarea de reconocimiento de habla.

## Capacidades

- Transcripción de voz a texto en ruso con salida end-to-end: puntuación, mayúsculas y dígitos aparecen directamente en la hipótesis, sin post-proceso obligatorio.
- Extracción de características log-mel integrada en el grafo: no requiere calcular espectrogramas ni normalizaciones fuera del modelo.
- Exposición de log-probabilidades CTC por frame, lo que permite implementar decodificado propio (greedy, búsqueda por haces, re-scoring con modelo de lenguaje) o extraer puntuaciones de confianza.
- Procesamiento de frases de hasta 25 segundos de audio a 16 kHz; para audio más largo hay que segmentar y concatenar.
- Ejecución sin PyTorch: el artefacto es ONNX puro y corre sobre ONNX Runtime en CPU, GPU o navegador (variante fp16 con WebGPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generation ni diarización: es exclusivamente un modelo ASR CTC.
- No incluye detección de actividad de voz ni marcas de tiempo por palabra; esas funciones deben aportarse desde fuera.

## Casos de uso

- Transcripción de notas de voz y reuniones en ruso: se trocea el audio con un VAD en bloques de menos de 25 s, se envía cada bloque al grafo ONNX y se concatenan las hipótesis; la puntuación nativa evita un paso posterior de formateo.
- Subtitulado de vídeo y pódcast en ruso: segmentación por silencios y generación de subtítulos con mayúsculas y signos, ejecutando la variante int8 en CPU para abaratar el proceso por hora de material.
- Centros de contacto y atención al cliente: transcripción de llamadas rusoparlantes para alimentar búsqueda, control de calidad o análisis de motivos de contacto, sin depender de servicios cloud y con el audio dentro de la infraestructura propia.
- Indexación y búsqueda de archivos de audio corporativos: ASR sobre el archivo histórico y almacenamiento del texto para búsqueda full-text, aprovechando que el modelo es un fichero autocontenido y fácil de replicar en varios nodos.
- Cumplimiento y auditoría: transcripción de grabaciones para revisión posterior, combinada con anonimización; el despliegue on-premise simplifica el cumplimiento de requisitos de residencia de datos.
- Inferencia en navegador o en el borde: la variante fp16 con WebGPU permite dictado y subtitulado en tiempo real en el cliente, sin enviar audio a un servidor.
- Evaluación comparativa de ASR ruso en pipelines ya basados en ONNX: al no requerir PyTorch, se puede integrar en un banco de pruebas junto a otros modelos ONNX y medir WER sobre el mismo corpus segmentado.
- Investigación sobre decodificado CTC: la salida `log_probs` y el vocabulario SentencePiece en metadatos permiten experimentar con decodificadores alternativos y comparar su efecto en la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo aporta tamaños de fichero y hashes SHA-256; no hay cifras de WER, CER ni comparaciones con el checkpoint original ni con la variante fp16, de modo que no es posible cuantificar la pérdida introducida por la cuantización int8. Cualquier cifra de precisión deberá medirse sobre un corpus propio antes de adoptar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,4-0,5 GB solo para los pesos (320 MB int8, 446 MB fp16); con activaciones y buffers de audio, entre 1 y 2 GB en total para frases de 25 s. Son estimaciones a partir del tamaño de los ficheros, no cifras publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria sirve; una RTX 3060 o superior da margen de sobra. No se necesita A100 ni H100 para inferencia individual, aunque pueden usarse para procesar lotes grandes en servidor.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta dedicada de los últimos años (GTX 1050/1650 en adelante) e incluso en iGPU mediante WebGPU.
- CPU: el fichero int8 de 320 MB está pensado para ejecución en CPU con ONNX Runtime; para audio corto es una opción viable sin acelerador.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), `onnxruntime-web` con backend WebGPU para la variante fp16, y runtimes de ASR compatibles con modelos ONNX con metadatos (por ejemplo sherpa-onnx). No aplican vLLM, TGI ni llama.cpp, que están orientados a modelos de lenguaje y no a CTC de voz.
- Latencia y throughput: no disponibles; no se han publicado mediciones de RTF ni de velocidad de decodificado para ninguna de las dos variantes.

## Comparativa con modelos similares

Los datos de terceros que aparecen a continuación son información pública de cada proyecto y no proceden de la información proporcionada sobre este repositorio; se incluyen solo como referencia de categoría.

| Modelo | Formato | Parámetros | Ventana de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| GigaAM v3 e2e CTC int8 ONNX (este) | ONNX int8 / fp16 | no disponible | 25 s | ruso | no disponible | Conversión no oficial, sin métricas ni descargas |
| GigaAM v3 e2e CTC original (SaluteDevelopers) | checkpoint del framework original | no disponible | 25 s (según esta conversión) | ruso | no disponible en la información consultada | Fuente del que deriva; requiere el stack original para ejecutarse |
| OpenAI Whisper small | PyTorch, GGUF, ONNX (conversiones de la comunidad) | ~244 M | 30 s | multilingüe (incluye ruso) | MIT | Puntuación menos consistente en ruso; ecosistema muy maduro y bien medido |
| OpenAI Whisper large-v3 | PyTorch, GGUF, ONNX (conversiones) | ~1.550 M | 30 s | multilingüe (incluye ruso) | MIT | Mayor precisión y coste; requiere varios GB de VRAM |
| Kaldi/Vosk para ruso | modelos Kaldi | no disponible | segmentación propia | ruso | Apache 2.0 (herramientas) | Modelos ligeros y rápidos en CPU, sin puntuación nativa |

El principal diferencial de este artefacto frente a Whisper es el tamaño reducido y la especialización en ruso con puntuación nativa; su desventaja es la ausencia total de validación pública y de licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: no hay término de uso en el repositorio, por lo que el uso comercial es legalmente indeterminado hasta aclarar la licencia del checkpoint original de GigaAM v3 con sus autores.
- Conversión no oficial: el publicador es un usuario individual, con cero descargas y cero likes; no hay revisión de la comunidad ni historial de incidencias.
- Solo ruso: no se ha validado para otras lenguas ni para mezcla de idiomas dentro de una misma frase.
- Límite de 25 s por frase: audio más largo exige segmentación externa, con riesgo de cortar palabras y degradar la transcripción en las fronteras.
- Cuantización int8 sin métricas: se desconoce la pérdida de precisión frente al checkpoint original; conviene comparar ambas variantes sobre un corpus propio.
- Re-cuantización peligrosa: según el autor, comprimir también la multiplicación por filtros mel produce salida incorrecta, así que no se deben aplicar pipelines de cuantización genéricos sin verificar la salida.
- Decodificado greedy sin modelo de lenguaje: más errores en homófonos, nombres propios, siglas y términos técnicos; no hay re-scoring disponible de fábrica.
- Riesgo de alucinación en ASR: en tramos con ruido, música o silencio el modelo puede emitir texto plausible pero incorrecto; no se documenta ningún mecanismo de detección de no-voz ni umbral de confianza.
- Sesgos heredados: no se documenta la composición del corpus de entrenamiento de GigaAM v3, por lo que se desconocen sesgos de acento, dialecto, género o dominio.
- Sin marcas de tiempo, diarización ni traducción: funciones que suelen pedirse en producción y que deben resolverse con herramientas adicionales.
- Dependencia de los metadatos: ignorar `vocabulary`, `blank_id` o `sample_rate` embebidos rompe el decodificado; el consumidor debe leerlos del propio modelo.
- Fechas de creación y actualización en 2026 y ausencia de documentación de entrenamiento: la reproducibilidad es nula más allá del hash SHA-256 publicado, que sí permite verificar la integridad de las descargas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tdhdcd/gigaam-v3-e2e-ctc-int8-onnx
- Proyecto original GigaAM (SaluteDevelopers): https://github.com/salute-developers/GigaAM
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes (solo páginas de YouTube Studio), por lo que no se añaden papers, blogs ni demos adicionales.
