# spybyscript/gliner25-base-litert

## Resumen

GLiNER2.5 base LiteRT es una conversión on-device del modelo `fastino/gliner2.5-base-v1` de Fastino, empaquetada por el usuario `spybyscript` para el runtime LiteRT (antes TFLite) de Android. GLiNER2.5 es un modelo de extracción de información de tipo zero-shot: dado un texto y un conjunto de etiquetas o campos descritos en lenguaje natural, devuelve los spans correspondientes (entidades, clasificaciones o estructuras JSON con campos planos) sin necesidad de reentrenamiento. Este port mantiene el contrato de la versión Core ML de FluidInference, con la tabla de embeddings en el host y tres grafos TFLite separados: encoder, head y scorer.

La relevancia de esta conversión es que lleva un modelo de extracción de entidades de 768 dimensiones ocultas a un teléfono Android moderno con latencias del orden de decenas de milisegundos por grafo, sin depender de la nube. El repo ocupa 0,6 GB e incluye tres variantes del encoder (pesos float16 con desquantización, FP16 hardware y una variante int8 que no supera la puerta de validación) más la tabla de embeddings en float16.

La información publicada es inusualmente detallada en cuanto a validación numérica, pero muy escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks estándar del modelo base. Esta ficha refleja esa asimetría: se documentan con precisión los aspectos medidos por el autor y se marca como "no disponible" todo lo que no aparece en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con head de fronteras, clasificador y scorer de candidatos; exportado como tres grafos LiteRT (encoder, head, scorer) |
| Parametros totales | no disponible (dimension oculta 768, vocab 128011; tamano del repo 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 subword tokens por llamada (prompt + texto), 64 palabras de texto, 8 queries, 8 opciones de clasificación, pool de 192 candidatos |
| Tipos de cuantizacion | float16 en pesos con desquantización (wfp16), FP16 hardware (fp16hw), int8 (no supera la puerta de validación); head y scorer en FP32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT) + tabla de embeddings en float16 binario (`gliner2_base_embeddings_f16.bin`) |

## Arquitectura y entrenamiento

El modelo base `fastino/gliner2.5-base-v1` es un checkpoint de la familia GLiNER2, que combina un encoder tipo transformer con una head de fronteras (boundary head), un clasificador de elección entre opciones y un scorer de relaciones. El port a LiteRT exporta únicamente el encoder, una head que agrupa las salidas de extracción de la boundary head, las salidas de null y count y los logits del clasificador, y el scorer de candidatos. El host ejecuta el pool de candidatos y la decodificación de la librería `gliner2` entre y después de estos grafos.

La conversión no reentrena ni poda pesos: solo cambia la precisión de almacenamiento y cómputo. La variante `wfp16` guarda los pesos FULLY_CONNECTED del encoder en float16 detrás de una operación DEQUANTIZE (ai-edge-quantizer FLOAT_CASTING), mantiene activaciones, tablas de posición y normas en FP32, y aplica una máscara finita de -1e4. La variante `fp16hw` usa el mismo almacenamiento sobre un encoder FP16-hardware, con pre-escalado potencia de dos en LayerNorm (x·2^-k, eps·4^-k, k derivado de los rangos FP32 del corpus) y la primera capa feed-forward dividida en dos mitades. Head y scorer permanecen en FP32 en ambos casos.

No se publican datos sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO en el modelo base. La validación se hizo sobre un corpus sintético en inglés de declaraciones conversacionales cortas, con 2.521 llamadas registradas desde la librería `gliner2` 2.0.0.

## Capacidades

- Extracción de entidades zero-shot (`extract_entities`): etiquetas con descripciones, umbrales configurables y abstención mediante la head de null.
- Clasificación de texto (`classify_text`) con hasta 8 opciones por llamada.
- Extracción de estructuras JSON con campos que son spans planos (`extract_json`), sin modo record.
- Ejecución on-device en Android mediante LiteRT 2.2.0, con encoder en CPU (XNNPACK) o GPU (ML Drift).
- No soporta extracción de relaciones (`extract_relations`) ni estructuras en modo record (agrupación de campos en varios registros).
- No incluye la head de spans explícitos del port Core ML de FluidInference.
- Idioma: únicamente inglés.
- Sin soporte de tool calling, agentes, visión, audio ni modo thinking; es un modelo de extracción, no generativo.

## Casos de uso

- Extracción de entidades en formularios móviles: el modelo identifica nombres, fechas o importes en texto libre introducido por el usuario, con la inferencia ejecutándose en el propio dispositivo y sin enviar datos a un servidor.
- Clasificación de mensajes entrantes en apps de mensajería: con hasta 8 opciones por llamada, se puede etiquetar un mensaje como consulta, queja, pedido o spam directamente en el teléfono.
- Estructuración de notas rápidas: a partir de una frase corta (hasta 64 palabras), `extract_json` devuelve campos planos como título, fecha y ubicación, útiles para apps de notas o recordatorios.
- Preprocesado de datos en pipelines de anotación: al ser una conversión fiel del modelo base, permite generar etiquetas preliminares en local antes de una revisión humana, con un F1 de span de 0,9966 en la validación publicada.
- Asistentes de voz o dictado en Android: la latencia del encoder (26,28 ms p50 en CPU de Mac con XNNPACK, 2 hilos) permite integrar la extracción en el flujo de transcripción sin bloquear la interfaz.
- Filtrado de contenido sensible en el dispositivo: clasificación de texto corto en categorías predefinidas antes de que el contenido salga del teléfono, con la ventaja de privacidad que supone no depender de la nube.
- Extracción de campos en documentos escaneados con OCR previo: siempre que el texto resultante se fragmente en llamadas de hasta 128 tokens, el modelo puede poblar estructuras de campos planos en una app de digitalización.

## Benchmarks y rendimiento

Los datos publicados corresponden a la validación del port (Mac con Apple M5 Max, ai-edge-litert 2.2.0, no un teléfono), sobre 2.521 llamadas del corpus sintético. La puerta de aceptación exige, por tipo de llamada: mismas respuestas ≥ 95 %, span F1 ≥ 0,95 y deriva de confianza p99 ≤ 0,05.

| Encoder | Runtime | Respuestas idénticas a la librería | Span F1 (mín) | Deriva p99 (máx) | ms p50 encoder / head / scorer | Puerta |
|---|---|---|---|---|---|---|
| wfp16 | CPU (XNNPACK) | facts 287/287, keywords.a 287/287, keywords.b 285/287, relation 1660/1660 | 0,9966 | 0,00135 | 26,28 / 0,52 / 2,13 | pasa |
| wfp16 | GPU Metal, precisión FP32 | facts 287/287, keywords.a 287/287, keywords.b 285/287, relation 1660/1660 | 0,9966 | 0,00135 | 10,03 / 0,65 / 2,49 | pasa |
| wfp16 | GPU Metal, precisión por defecto (FP16) | facts 13/287, keywords.a 112/287, keywords.b 68/287, relation 1259/1660 | 0,0 | 0,58571 | 8,09 / 0,72 / 3,47 | falla |
| fp16hw | CPU (XNNPACK) | facts 287/287, keywords.a 287/287, keywords.b 285/287, relation 1660/1660 | 0,9966 | 0,00135 | 25,4 / 0,5 / 2,44 | pasa |
| fp16hw | GPU Metal, precisión FP32 | facts 287/287, keywords.a 287/287, keywords.b 285/287, relation 1660/1660 | 0,9966 | 0,00135 | 10,33 / 0,61 / 3,54 | pasa |
| fp16hw | GPU Metal, precisión por defecto (FP16) | facts 286/287, keywords.a 286/287, keywords.b 283/287, relation 1654/1660 | 0,9932 | 0,03023 | 8,35 / 1,96 / 4,3 | pasa |
| int8 | CPU (XNNPACK) | facts 207/287, keywords.a 229/287, keywords.b 205/287, relation 1488/1660 | 0,8348 | 0,38601 | 29,58 / 0,76 / 3,43 | falla |

En teléfono (Galaxy Z Fold 8, Snapdragon 8 Elite Gen 5, Android 17, LiteRT 2.2.0) el encoder `wfp16` se ejecuta en 4 hilos de CPU con caché de pesos XNNPACK, y head y scorer en un hilo cada uno. Las salidas de features y los logits de pares coinciden con la ejecución de LiteRT en Mac (diferencia 0,0) con los mismos pools de candidatos (3/3). No se publican cifras de latencia en el teléfono.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni del modelo base ni del port.

## Requisitos de hardware

- Tamaño en disco: 0,6 GB de repo; encoder 189 MB (wfp16 o fp16hw), head 8,5 MB, scorer 2,1 MB y tabla de embeddings 197 MB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los grafos, el encoder requiere del orden de cientos de MB en memoria, pero el autor no publica la cifra.
- GPU recomendadas: no aplica en el sentido habitual; el destino es Android con LiteRT. En Mac, el autor valida con Apple M5 Max mediante ML Drift (Metal) y CPU XNNPACK.
- Cabe en GPU de consumo: sí, en el sentido de que el modelo está pensado para ejecutarse en un teléfono con Snapdragon 8 Elite Gen 5; no se documenta su ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT 2.2.0 (ai-edge-litert) en Android; en Mac se usó ai-edge-litert 2.2.0 con XNNPACK y ML Drift. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia: en Mac, encoder 26,28 ms p50 en CPU (wfp16, 2 hilos) y 10,03 ms p50 en GPU Metal con precisión FP32; head 0,52 ms y scorer 2,13 ms en CPU. En el teléfono no se publican cifras de latencia, solo la coincidencia exacta de salidas con la ejecución en Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spybyscript/gliner25-base-litert | no disponible (768 dim oculta, vocab 128011) | 128 tokens por llamada, 64 palabras, 8 queries | TFLite/LiteRT | Apache-2.0 | HuggingFace, 0 descargas |
| fastino/gliner2.5-base-v1 | no disponible | dinámico (sin límite fijo documentado aquí) | safetensors (presumible, no confirmado) | Apache-2.0 | HuggingFace (modelo base) |
| Port Core ML de FluidInference (gliner2.5) | no disponible | no disponible | Core ML | no disponible | mencionado en la model card, sin enlace |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la validación del port frente a la librería `gliner2` original. La diferencia principal frente al modelo base es la pérdida de extracción de relaciones y del modo record, y la fijación de tamaños (128 tokens, 8 queries, 8 opciones, pool de 192) frente a las formas dinámicas del original.

## Limitaciones y advertencias

- No soporta extracción de relaciones (`extract_relations`) ni estructuras en modo record; las peticiones que los requieran no pueden ejecutarse en este port.
- Tamaños fijos: 128 subword tokens por llamada (prompt + texto), 64 palabras de texto, 8 queries y 8 opciones de clasificación, con pool de 192 candidatos. El host rechaza peticiones mayores en lugar de truncarlas, por lo que textos largos y conjuntos grandes de etiquetas requieren varias llamadas.
- Solo inglés; no hay soporte multilingüe documentado.
- La variante int8 no supera la puerta de validación (span F1 0,8348, deriva p99 0,38601) y no debería usarse en producción.
- En GPU Metal con precisión por defecto (FP16), la variante wfp16 falla la puerta de forma catastrófica (F1 0,0); es obligatorio forzar precisión FP32 en ese runtime.
- La validación se hizo en Mac, no en teléfono; las cifras de latencia en dispositivos Android no se publican.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera del corpus sintético de validación; el corpus son declaraciones conversacionales cortas, no texto real diverso.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base es de Fastino y el port es de un tercero (`spybyscript`), con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte limitados.
- Al ser un modelo de extracción y no generativo, no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace del port: https://huggingface.co/spybyscript/gliner25-base-litert
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Revisión del modelo base usada en la conversión: `1a8bc24e00dc7300b9017c81d63e3dcdabb26596`
- Librería `gliner2` (versión 2.0.0 usada en la validación): no disponible enlace en la información proporcionada
- Port Core ML de FluidInference: no disponible enlace en la información proporcionada
- ai-edge-litert 2.2.0 (runtime): no disponible enlace en la información proporcionada
