# ukrbublik/opus-mt-en-no-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-no-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-gmq`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce del inglés al noruego (variante `nob`, bokmål) de forma directa, sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en el runtime OPUS de la aplicación Android Subtitle Tap, es decir, en inferencia local en dispositivo.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder específicamente diseñado para traducción automática neuronal. El repositorio pesa aproximadamente 0,3 GB y contiene únicamente artefactos de despliegue: los grafos ONNX cuantizados del encoder y del decoder, un tokenizador en formato JSON y un fichero de metadatos de alineación. No incluye pesos en formato safetensors ni GGUF, ni scripts de entrenamiento.

La particularidad técnica de esta conversión es que el decoder expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder-decoder de la capa 2. Esta salida permite obtener alineaciones palabra a palabra entre origen y destino sin modificar los pesos ni el proceso de decodificación, algo útil para aplicaciones de subtitulado que necesitan sincronizar texto traducido con el audio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible (repo de 0,3 GB en INT8; el modelo base es la variante "big" de OPUS-MT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), no / nob (destino) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-tc-big-en-gmq` es un sistema de traducción neuronal Marian, la arquitectura transformer encoder-decoder desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT para sus modelos abiertos. La variante `tc-big` corresponde a un tamaño "big" dentro de la familia OPUS-MT y forma parte de un modelo multilingüe de destino (código `gmq`, lenguas germánicas septentrionales), por lo que el tokenizador requiere el prefijo `>>nob<<` antes de cada frase de origen para seleccionar el noruego bokmål como lengua de salida.

Los datos de entrenamiento originales provienen del corpus OPUS, una agregación de corpus paralelos públicos (entre ellos, según la práctica habitual del proyecto, conjuntos como OpenSubtitles, EUbookshop, Tatoeba y otros). No se dispone en la información proporcionada de cifras concretas de tokens de entrenamiento, composición exacta del dataset ni detalles sobre si se aplicó RLHF o DPO; los modelos Marian de OPUS-MT se entrenan con aprendizaje supervisado estándar sobre pares paralelos.

La innovación técnica de este repositorio concreto no está en el entrenamiento, sino en el empaquetado para despliegue: exportación con Optimum a opset 17 sin caché de claves/valores, cuantización dinámica INT8 con onnxruntime, tokenizador precalculado en JSON (piezas y puntuaciones del SentencePiece original mapeadas a identificadores de vocabulario) y la mencionada salida de alineación de atención de la capa 2, implementada como una identidad sobre un nodo existente del grafo. El fichero `alignment.json` actúa como recibo que vincula esa salida al hash SHA-256 del decoder.

## Capacidades

- Traducción automática directa inglés → noruego bokmål, sin pivote por inglés.
- Exposición de alineaciones de atención encoder-decoder (capa 2) para obtener correspondencias palabra a palabra entre origen y destino.
- Tokenizador SentencePiece empaquetado en JSON con identificadores de vocabulario y tokens de destino, listo para el runtime OPUS.
- Gestión del prefijo de lengua `>>nob<<` de forma automática mediante `sourcePrefixTokenIds`.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8, orientada a aplicaciones Android.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo puramente de traducción.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos en inglés a noruego en el propio dispositivo, sin conexión, usando los grafos ONNX cuantizados y el runtime OPUS.
- Sincronización de subtítulos con audio: la salida `alignment_shift_l2` permite mapear cada palabra traducida a su origen y ajustar los tiempos del subtítulo generado.
- Traducción de documentación técnica en local: integrable en herramientas de escritorio o pipelines que necesiten traducir textos cortos del inglés al noruego sin depender de servicios en la nube.
- Procesamiento por lotes de corpus paralelos: la cuantización INT8 reduce el coste de memoria y permite ejecutar grandes volúmenes de frases en CPU.
- Aplicaciones de privacidad estricta: al ejecutarse en dispositivo, los textos no salen del terminal, adecuado para contenido sensible que no debe enviarse a APIs externas.
- Evaluación de alineaciones en investigación: la salida de atención facilita experimentos de interpretabilidad y de calidad de alineación léxica en traducción en→no.
- Prototipado de traductores embebidos: el formato ONNX y el tokenizador JSON simplifican la integración en runtimes ligeros sin necesidad de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio completo ocupa 0,3 GB, por lo que el modelo INT8 cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o similar es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), y en general cualquier runtime compatible con ONNX opset 17; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo Marian "big" cuantizado a INT8, la inferencia en CPU es viable para frases individuales, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-no-int8-shift-att | no disponible (INT8, 0,3 GB) | no disponible | en → no | cc-by-4.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tc-big-en-gmq | no disponible (modelo base "big") | no disponible | en → lenguas gmq (incl. no) | cc-by-4.0 | safetensors / PyTorch |
| Helsinki-NLP/opus-mt-en-no | no disponible | no disponible | en → no | cc-by-4.0 | safetensors / PyTorch |

La comparación se limita a la familia OPUS-MT porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineación; frente a la variante específica en→no, este repositorio usa un modelo multilingüe de destino con prefijo de lengua.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción en→no; no es un modelo de propósito general.
- Sesgos: al entrenarse sobre corpus OPUS (predominantemente subtítulos y textos institucionales), puede reflejar sesgos de dominio y de género presentes en esos datos; no hay documentación específica de sesgos en la información disponible.
- Riesgo de alucinación: como todo sistema NMT, puede producir traducciones fluidas pero incorrectas en frases ambiguas, nombres propios o terminología especializada.
- Limitaciones de contexto: no se documenta la longitud máxima de secuencia; los modelos Marian suelen estar limitados a unas pocas centenas de tokens, insuficiente para documentos largos sin segmentación.
- La salida de alineación depende del hash SHA-256 del decoder registrado en `alignment.json`; cualquier reexportación o modificación del grafo invalida esa verificación.
- Licencia cc-by-4.0: permite uso comercial con atribución; es obligatorio citar a Tiedemann y Thottingal (2020) y al proyecto OPUS-MT.
- El repositorio no incluye pesos en formato estándar (safetensors, GGUF), lo que limita su uso fuera de runtimes ONNX.
- El prefijo `>>nob<<` es imprescindible para obtener noruego bokmål; omitirlo puede producir salidas en otra lengua germánica septentrional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-no-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-gmq
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
