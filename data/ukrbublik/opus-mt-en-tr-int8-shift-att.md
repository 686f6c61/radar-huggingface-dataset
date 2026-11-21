# ukrbublik/opus-mt-en-tr-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-tr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-tr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a turco, sin pivotar por una lengua intermedia, y está pensado para ejecutarse en dispositivos locales dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder típico de los sistemas de traducción neuronal de OPUS-MT. Esta versión concreta añade dos particularidades: la exportación a ONNX (opset 17, sin past key/values) con cuantización dinámica QInt8 por tensor mediante onnxruntime, y una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decodificador en la capa 2. Esa salida es una identidad sobre un nodo existente, de modo que los pesos y la decodificación no se alteran.

El interés práctico del modelo reside en su empaquetado: un repositorio de 0,4 GB con encoder y decoder cuantizados, tokenizador en JSON y un fichero de recibo de alineación, listo para inferencia on-device sin dependencias de frameworks de pesos completos. No obstante, se trata de un artefacto de nicho, sin descargas ni validación comunitaria publicada, orientado a un runtime concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | en (origen), tr (destino) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizador en JSON |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-mt-tc-big-en-tr`, un sistema Marian de traducción neuronal entrenado sobre datos del corpus OPUS. La model card del repositorio derivado no aporta detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO; esa información no está disponible en la documentación proporcionada. La variante `tc-big` indica una configuración de mayor tamaño dentro de la familia OPUS-MT, pero no se especifican dimensiones de capas ni número de parámetros.

La innovación técnica de esta conversión es doble. Por un lado, la exportación a ONNX con opset 17 y sin past key/values simplifica el grafo para runtimes móviles, a costa de recalcular el contexto en cada paso de decodificación. Por otro, la cuantización dinámica INT8 por tensor reduce el peso del repositorio a 0,4 GB y acelera la inferencia en CPU. La salida `alignment_shift_l2` se añade como una identidad sobre un nodo ya existente del decoder, de modo que expone las probabilidades de atención encoder de la capa 2 sin modificar pesos ni el proceso de decodificación; el fichero `alignment.json` vincula esa salida al SHA-256 del decoder para garantizar su integridad.

## Capacidades

- Traducción directa de inglés a turco, sin pivotar por una tercera lengua.
- Exposición de alineaciones de atención encoder-decoder (capa 2) mediante la salida `alignment_shift_l2`, útil para tareas de alineación de palabras o subtitulado.
- Inferencia on-device mediante ONNX Runtime, sin necesidad de GPU ni de frameworks de pesos completos.
- Tokenizador SentencePiece empaquetado en JSON con piezas, puntuaciones y mapeo a identificadores de vocabulario.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio.
- Capacidad multilingüe limitada estrictamente al par en→tr.

## Casos de uso

- Subtitulado automático en dispositivos Android: la aplicación Subtitle Tap puede traducir subtítulos en inglés a turco en local, sin enviar texto a servidores externos, gracias al empaquetado ONNX e INT8 y a la salida de alineación para sincronizar palabras.
- Traducción de documentación técnica en entornos sin conectividad: el modelo cabe en 0,4 GB y puede ejecutarse en CPU, lo que permite traducir manuales o notas en portátiles modestos o dispositivos móviles.
- Alineación de palabras para herramientas de aprendizaje de idiomas: la salida `alignment_shift_l2` permite construir correspondencias entre tokens ingleses y turcos, útil en aplicaciones de vocabulario o análisis contrastivo.
- Preprocesado de corpus en pipelines de investigación: conversión de textos ingleses a turco en lotes locales antes de análisis posteriores, con la ventaja de no depender de APIs externas.
- Traducción de interfaces de usuario en aplicaciones de escritorio: integración del runtime ONNX en aplicaciones Electron o nativas para localizar cadenas de texto en tiempo de ejecución.
- Prototipado de sistemas de traducción embebidos: base para experimentar con cuantización INT8, exportación ONNX y alineaciones de atención en entornos con recursos limitados.
- Traducción de correos o mensajes en clientes de escritorio con requisitos de privacidad: al ejecutarse en local, el contenido no abandona el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX INT8 orientado a CPU, no requiere GPU.
- GPU recomendadas: no aplica; el runtime objetivo es on-device (CPU) en Android.
- Compatibilidad con GPU de consumo: no se documenta; el empaquetado está pensado para ejecución en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (versión móvil o de escritorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-tr-int8-shift-att` | no disponible | no disponible | en→tr | cc-by-4.0 | ONNX INT8 | Salida de alineación, orientado a on-device |
| `Helsinki-NLP/opus-mt-tc-big-en-tr` | no disponible | no disponible | en→tr | cc-by-4.0 | safetensors/PyTorch | Modelo base sin cuantizar ni exportar a ONNX |
| `Helsinki-NLP/opus-mt-en-tr` | no disponible | no disponible | en→tr | cc-by-4.0 | safetensors/PyTorch | Variante estándar de OPUS-MT, presumiblemente menor que `tc-big` |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, y no se han publicado evaluaciones de calidad de traducción para esta conversión concreta.
- La cuantización INT8 dinámica puede degradar ligeramente la calidad respecto al modelo base en fp32; no se documenta la magnitud de esa pérdida.
- La exportación sin past key/values implica recalcular el contexto en cada paso, lo que puede aumentar la latencia en secuencias largas.
- El modelo solo cubre el par inglés→turco; no traduce en sentido inverso ni a otras lenguas.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus OPUS puede heredar sesgos de dominio y de registro de los datos subyacentes.
- Riesgo de alucinación en traducción: como todo sistema neuronal, puede generar contenido plausible pero incorrecto en textos ambiguos o de dominio especializado.
- La licencia cc-by-4.0 permite uso comercial con atribución; es obligatorio citar a Tiedemann y Thottingal (2020) y respetar los términos de atribución del repositorio.
- El fichero `alignment.json` vincula la salida de alineación al SHA-256 del decoder; cualquier modificación de los pesos invalidaría esa garantía de integridad.
- La fecha de creación del repositorio (2026-11-20) es posterior a la fecha actual en muchos entornos, lo que conviene verificar antes de depender de él en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-tr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
