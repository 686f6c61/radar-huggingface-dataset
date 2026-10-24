# ukk0708/sat-12l-sm-coreml

## Resumen

`ukk0708/sat-12l-sm-coreml` es una conversión a Core ML del modelo `segment-any-text/sat-12l-sm` (familia Segment any Text, desarrollada por el proyecto wtpsplit), un modelo de clasificación de tokens especializado en segmentación de frases. No es un modelo generativo: recibe una secuencia de tokens y devuelve un logit por token que indica la probabilidad de que ese token sea un final de frase. El autor de la conversión lo publica para uso interno de la aplicación Vocena, que necesita localizar finales de frase en texto proveniente de reconocimiento automático del habla sin puntuación.

El interés práctico de esta ficha está en que empaqueta un modelo de segmentación multilingüe en un `.mlmodelc` ejecutable en CPU y Neural Engine mediante `MLComputeUnits.cpuAndNeuralEngine`, con embeddings de palabra y posición cuantizados a int8 (bloques de 32) y las 12 capas del encoder en fp16. El resultado ocupa 0,4 GB de repositorio y reproduce, según el autor, los mismos cortes que wtpsplit 2.2.2 con el modelo ONNX original sobre textos de validación en tailandés, chino, inglés y japonés, con umbrales 0,05 y 0,03.

Es relevante porque cubre un nicho poco servido: segmentación de frases on-device, sin red, en un stack Apple (iOS/macOS), con licencia MIT tanto para el modelo como para el tokenizer. La contrapartida es que la interfaz es rígida (longitudes de entrada fijas) y que no existen métricas publicadas de calidad más allá de la comparación cualitativa con el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 12 capas con cabeza de clasificación de tokens (un logit de final de frase por token), destilado de la familia Segment any Text |
| Parámetros totales | ~0,28B según agregador de terceros (free2aitools); no confirmado en la model card. Repositorio de 0,4 GB |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entradas de longitud fija: N ∈ {64, 128, 256, 512} tokens por bloque en la conversión Core ML; 4.096 tokens según agregador de terceros para el modelo base (no confirmado) |
| Tipos de cuantización | Embeddings de palabra y posición en int8 (por bloque, tamaño de bloque 32); 12 capas del encoder en fp16 |
| Idiomas soportados | 85 idiomas según la model card del modelo base; validación explícita en tailandés, chino, inglés y japonés |
| Licencia | MIT (modelo, conversión y tokenizer) |
| Formato de pesos | Core ML compilado (`.mlmodelc`); el modelo base se distribuye además en safetensors y ONNX |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del modelo original: un encoder transformer de 12 capas que actúa sobre tokens XLM-R y una cabeza que emite, para cada posición, un logit de frontera de frase. La innovación de la familia Segment any Text no está en la arquitectura sino en el enfoque de segmentación: en lugar de depender de puntuación o de reglas heurísticas, el modelo aprende directamente dónde acaba una frase a partir de texto sin puntuar, lo que lo hace útil sobre salidas de ASR. El paper de referencia es arXiv:2406.16678.

Sobre el entrenamiento no hay detalle en la información disponible: la model card de esta conversión no indica número de tokens, composición del dataset ni si hubo ajuste con RLHF o DPO (poco probable en un modelo de clasificación de tokens). Lo que sí se documenta es el proceso de conversión: los embeddings se cuantizaron a int8 por bloques de 32 y las capas del encoder se mantuvieron en fp16, y se verificó que los cortes producidos con umbrales 0,05 y 0,03 coinciden con los de wtpsplit 2.2.2 sobre el modelo ONNX original en textos de validación en cuatro idiomas. El tokenizer es el de `FacebookAI/xlm-roberta-base`, sin modificar.

La interfaz de inferencia exige un preprocesado concreto: envolver cada bloque como `<s>` (id 0) + tokens + `</s>` (id 2), rellenar con `<pad>` (id 1) y usar máscara 0 para el padding. Las entradas `input_ids` y `attention_mask` son Int32 de forma [1, N], y la salida `logits` es Float32 de forma [1, N].

## Capacidades

- Segmentación de frases en texto sin puntuar: un logit de final de frase por token, convertido a corte binario aplicando un umbral (0,05 o 0,03 en la validación del autor).
- Funcionamiento multilingüe: 85 idiomas declarados en el modelo base, con verificación empírica en tailandés, chino, inglés y japonés.
- Ejecución on-device en Apple Silicon y dispositivos iOS/macOS mediante Core ML, con reparto entre CPU y Neural Engine.
- Inferencia sin conexión: no requiere red ni servicios externos, lo que permite procesar texto sensible localmente.
- Integración con `swift-transformers` a través del `tokenizer_config.json` incluido, que declara la clase del tokenizer.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio. Es exclusivamente un clasificador de fronteras de frase.

## Casos de uso

- Segmentación de transcripciones ASR: es el caso original de la app Vocena. El texto que devuelve un motor de reconocimiento de voz sin puntuación se pasa por bloques de 512 tokens y se corta donde el logit supera el umbral, obteniendo frases utilizables para lectura o posprocesado.
- Puntuación y formateo en apps iOS/macOS: al ejecutarse con `cpuAndNeuralEngine`, se puede integrar en una app nativa para dividir párrafos en frases antes de aplicar reglas de mayúsculas y puntuación, sin salir del dispositivo.
- Preprocesado para síntesis de voz (TTS): los motores TTS necesitan unidades de frase para modelar la prosodia; este modelo proporciona los límites sin depender de puntuación, útil en textos dictados o generados por ASR.
- Segmentación de subtítulos: dividir una transcripción larga en líneas de subtítulo coherentes, respetando fronteras de frase en lugar de cortes por número de caracteres.
- Chunking para RAG e indexación: dividir documentos largos en unidades semánticas (frases) antes de agruparlas en chunks, lo que mejora la recuperación frente a cortes por ventana fija de tokens, especialmente en documentos sin puntuación fiable (OCR, actas, chats).
- Traducción por frases: alinear segmentos de origen y destino en pipelines de traducción requiere fronteras de frase consistentes; el modelo las proporciona incluso cuando el texto de entrada carece de puntuación.
- Procesamiento de texto confidencial: al no requerir red, encaja en flujos con datos personales o médicos donde no se permite enviar el texto a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación reportada por el autor es cualitativa: sobre los textos de validación en tailandés, chino, inglés y japonés, los cortes producidos con umbrales 0,05 y 0,03 son idénticos a los de wtpsplit 2.2.2 con el modelo ONNX original. No hay cifras de precision, recall o F1 para esta conversión ni para el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: unos 2 GB para el modelo base en precisión completa según free2aitools (estimación de terceros, no confirmada). La conversión Core ML ocupa 0,4 GB de repositorio, con embeddings int8 y encoder fp16.
- Hardware objetivo: dispositivos Apple con Neural Engine (iPhone, iPad, Mac con Apple Silicon). La configuración indicada es `MLComputeUnits.cpuAndNeuralEngine`.
- No aplica a GPU NVIDIA ni a CUDA: el artefacto es un `.mlmodelc` y solo se ejecuta en el runtime de Core ML. Para servidores x86/NVIDIA habría que usar el modelo base en ONNX o safetensors con wtpsplit.
- Opciones de despliegue: Core ML en apps Swift (integrar `SaTSegmenter.mlmodelc` con `coremltools`/Xcode), `swift-transformers` para el tokenizer, o bien wtpsplit 2.2.2 con el modelo original para entornos no Apple.
- Latencia y throughput: no disponibles. La forma de entrada está limitada a bloques de 64, 128, 256 o 512 tokens, lo que obliga a trocear el texto y agregar resultados.
- Memoria: el modelo es pequeño (&lt;1 GB en disco en el repo), por lo que cabe holgadamente en cualquier dispositivo Apple moderno; el cuello de botella real es el troceado en bloques de tamaño fijo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ukk0708/sat-12l-sm-coreml` (esta ficha) | ~0,28B (estimación de terceros) | Bloques fijos de 64/128/256/512 tokens | Core ML, on-device Apple, int8 + fp16 | MIT | Hugging Face, sin descargas ni likes en el momento de la consulta |
| `segment-any-text/sat-12l-sm` (base) | ~0,28B (estimación de terceros) | 4.096 tokens según terceros (no confirmado) | Token classification, ONNX y safetensors | MIT | Hugging Face, ~417K descargas en 30 días según free2aitools |
| `segment-any-text/sat-12l` | No disponible | No disponible | Misma familia, 12 capas, versión mayor | MIT | Hugging Face |
| `FacebookAI/xlm-roberta-base` (tokenizer) | No disponible | No disponible | Tokenizer XLM-R reutilizado sin cambios | MIT | Hugging Face |

La comparación relevante es contra el modelo base: esta conversión no añade capacidades, solo portabilidad al runtime de Apple con una pequeña pérdida potencial de precisión por la cuantización int8 de los embeddings. Para uso en servidor, el modelo base en ONNX o safetensors es la opción natural; para apps Apple, esta conversión evita mantener un runtime Python.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde a instrucciones y no admite tool calling. Cualquier uso fuera de la clasificación de fronteras de frase es un error de aplicación.
- La salida es un logit por token que requiere un umbral elegido manualmente (0,05 y 0,03 en la validación del autor). Un umbral mal calibrado produce sobre-segmentación o frases excesivamente largas.
- Longitudes de entrada fijas: la conversión solo acepta N ∈ {64, 128, 256, 512}. Textos más largos deben trocearse, con el riesgo de perder fronteras en los límites entre bloques.
- Preprocesado obligatorio y no obvio: hay que envolver cada bloque con `<s>` y `</s>`, rellenar con `<pad>` y construir la máscara correctamente; un error aquí degrada silenciosamente la calidad de los cortes.
- Validación limitada a cuatro idiomas (tailandés, chino, inglés y japonés), aunque el modelo base declara 85. No hay datos de calidad para el resto.
- Sin métricas publicadas: no hay F1, precision ni recall en la información disponible, solo la comprobación de equivalencia con wtpsplit 2.2.2.
- El repositorio no tiene descargas ni likes en el momento de la consulta y está vinculado a una aplicación concreta (Vocena). No hay garantía de mantenimiento, versionado ni soporte.
- Riesgo de documentación engañosa en fuentes de terceros: algunos agregadores describen `sat-12l-sm` como un modelo instruccional con GQA, RoPE y salida JSON, lo cual no se corresponde con un modelo de clasificación de tokens. Conviene ignorar esas descripciones y atenerse a la model card.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de `segment-any-text/sat-12l-sm` y del tokenizer XLM-R conviene conservar los avisos de copyright de ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukk0708/sat-12l-sm-coreml
- Modelo base: https://huggingface.co/segment-any-text/sat-12l-sm
- Variante mayor de la familia: https://huggingface.co/segment-any-text/sat-12l
- Repositorio wtpsplit: https://github.com/segment-any-text/wtpsplit
- Tokenizer XLM-R base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper Segment any Text: https://arxiv.org/abs/2406.16678
- Espejo en Inferix: https://inferix.co/models/segment-any-text/sat-12l-sm
- Ficha de terceros (ModelVault): https://www.modelvault.space/models/segment-any-text-sat-12l-sm
- Ficha de terceros (free2aitools): https://free2aitools.com/model/segment-any-text/sat-12l-sm
