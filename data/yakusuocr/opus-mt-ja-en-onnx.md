# YakusuOCR/opus-mt-ja-en-onnx

## Resumen

El repositorio `YakusuOCR/opus-mt-ja-en-onnx` publica una exportación en formato ONNX del modelo de traducción automática japonés-inglés `Helsinki-NLP/opus-mt-ja-en`, desarrollado originalmente por el proyecto Opus-MT de Helsinki-NLP. La aportación principal de este repositorio no es la conversión en sí, sino la inclusión de un `tokenizer.json` funcional que corrige un defecto estructural presente en todas las demás conversiones ONNX públicas de este modelo: la ausencia de `precompiled_charsmap`, que rompe la normalización `nmt_nfkc` de SentencePiece y provoca errores silenciosos de traducción con puntuación japonesa de ancho completo.

El modelo es un transformer encoder-decoder de arquitectura Marian, con 6 capas, 8 cabezas de atención y una dimensión de 512. Los pesos se distribuyen en dos grafos ONNX (encoder y decoder fusionado) en precisión fp32 con opset 17, junto con el tokenizer corregido. El repositorio no incluye `config.json` ni `generation_config.json`, por lo que no es un reemplazo directo de `from_pretrained`; está pensado para cargarse manualmente con ONNX Runtime. Su relevancia actual radica en que ofrece una vía fiable para desplegar traducción ja-en en producción con ONNX, especialmente en dominios como videojuegos o manga donde la puntuación full-width es habitual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (Transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (única precisión publicada) |
| Idiomas soportados | ja, en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder-merged, opset 17) |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-mt-ja-en`, un MarianMT entrenado por el proyecto Opus-MT con datos paralelos de OPUS. La arquitectura es un transformer encoder-decoder de 6 capas, 8 cabezas y dimensión de modelo 512, con una cabeza de salida de 60716 logits (vocabulario conjunto fuente-destino). No se proporcionan detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO en la información disponible.

La exportación se realizó con `optimum-cli` usando la tarea `text2text-generation-with-past`, en fp32 y opset 17, con las versiones exactas de las librerías indicadas en la model card. El decoder se publica en una variante "merged" que combina `decoder_model` y `decoder_with_past_model` en un único grafo, reduciendo el peso total de ~830 MB a ~335 MB. La innovación técnica del repositorio es el proceso de conversión del tokenizer, que verifica cinco condiciones estrictas (charsmap, mapeo de ids, cobertura completa del vocabulario, ausencia de duplicados y `unk_id` correcto) para garantizar que el `tokenizer.json` sea funcional, algo que ninguna otra conversión ONNX de este modelo cumple.

## Capacidades

- Traducción automática de japonés a inglés, con soporte correcto de puntuación full-width (p. ej. `？` se normaliza a `?` antes de la búsqueda en el vocabulario).
- Generación de texto condicionada a una secuencia fuente, con soporte de caché de estados pasados (past key-values) para decodificación autoregresiva eficiente.
- No incluye tool calling, razonamiento multi-paso, visión, audio ni capacidades de agente.
- Multilingüe limitado a los pares ja-en; no hay soporte para otros idiomas.
- El tokenizer incluido es compatible con la crate Rust `tokenizers`, lo que permite su uso en entornos fuera de Python.

## Casos de uso

- Traducción de diálogos de videojuegos japoneses: el modelo maneja correctamente la puntuación full-width típica de este tipo de textos, evitando que una pregunta se convierta en una afirmación.
- Localización de manga y novelas ligeras: la normalización `nmt_nfkc` garantiza que los signos de puntuación japoneses se conviertan a ASCII antes de la tokenización, produciendo traducciones fieles al original.
- Integración en pipelines de procesamiento de texto con ONNX Runtime: al ser grafos ONNX estándar, se pueden cargar en aplicaciones C++, Rust o Python sin depender de PyTorch.
- Servicios de traducción en tiempo real para chat o foros: el decoder con caché permite generar traducciones con baja latencia en entornos con GPU.
- Preprocesamiento de corpus japonés para entrenamiento de otros modelos: la salida traducida puede usarse como datos aumentados.
- Despliegue en entornos con restricciones de dependencias: al no requerir `transformers` ni `sentencepiece` en tiempo de ejecución, es adecuado para contenedores ligeros o dispositivos embebidos con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de traducción (BLEU, chrF, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Los pesos en fp32 suman aproximadamente 552 MB (encoder 201 MB + decoder 351 MB), más el tokenizer de 3.9 MB.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Con fp32 y una secuencia de entrada moderada, cabría en GPUs con 4 GB o más, pero no se especifica.
- GPU recomendadas: no disponible. Al ser grafos ONNX, pueden ejecutarse en CPU con ONNX Runtime, o en GPU con los ejecutores CUDA o TensorRT.
- Opciones de despliegue: ONNX Runtime (C++, Python, Rust), posiblemente con aceleración CUDA. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo en formato GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tokenizer funcional | Licencia | Notas |
|---|---|---|---|---|
| `YakusuOCR/opus-mt-ja-en-onnx` | ONNX (fp32) | Sí (charsmap incluido) | Apache-2.0 | Repositorio con tokenizer corregido, sin config.json |
| `Helsinki-NLP/opus-mt-ja-en` | PyTorch + SentencePiece | No (solo spm) | Apache-2.0 | Modelo original, sin ONNX |
| `Xenova/opus-mt-ja-en` | ONNX | No (`precompiled_charsmap: null`) | Apache-2.0 | Tokenizer roto que panics en Rust |
| `onnx-community/opus-mt-ja-en` | ONNX | No (mismo problema) | Apache-2.0 | Tokenizer aparentemente correcto pero falla con puntuación |

La comparativa se centra en la calidad del tokenizer, que es el factor diferenciador. No hay datos de rendimiento de traducción entre estas variantes porque todas comparten los mismos pesos.

## Limitaciones y advertencias

- No es un reemplazo directo de `from_pretrained`: faltan `config.json` y `generation_config.json`, por lo que `optimum` y `transformers.js` no cargarán el repositorio tal cual. Hay que cargar los grafos y el tokenizer manualmente.
- El tokenizer solo cubre los idiomas ja-en; no hay soporte para otros pares.
- El modelo base puede presentar sesgos presentes en los datos de OPUS, aunque no se documentan en este repositorio.
- Riesgo de alucinación o traducciones incorrectas en textos muy técnicos o con jerga específica, como cualquier modelo de traducción neuronal.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el trabajo original de Helsinki-NLP y Tiedemann & Thottingal.
- El repositorio no incluye cuantizaciones (solo fp32), lo que puede limitar su uso en hardware con poca memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YakusuOCR/opus-mt-ja-en-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Proyecto Opus-MT: https://github.com/Helsinki-NLP/Opus-MT
- Conversión alternativa con tokenizer roto: https://huggingface.co/Xenova/opus-mt-ja-en
- Conversión alternativa con tokenizer roto: https://huggingface.co/onnx-community/opus-mt-ja-en
