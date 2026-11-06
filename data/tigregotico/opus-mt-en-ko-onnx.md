# TigreGotico/opus-mt-en-ko-onnx

## Resumen

`TigreGotico/opus-mt-en-ko-onnx` es una exportación a ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-ko`, un Marian transformer de tipo "big" desarrollado dentro del proyecto OPUS-MT (Helsinki-NLP). El modelo original traduce de inglés a coreano y aquí se distribuye en dos variantes ONNX: fp32 y cuantización dinámica int8. El repositorio incluye los grafos del encoder, el decoder y el decoder con caché (`decoder_with_past_model.onnx`), lo que permite inferencia autoregresiva eficiente con `onnxruntime`.

La relevancia de esta ficha no está en el modelo lingüístico en sí, sino en el empaquetado: el autor documenta un problema real de tokenización del modelo base. Marian entrenado con vocabularios separados (`separate_vocabs`) requiere `vocab.json` para el inglés y `target_vocab.json` para el coreano; el repo base solo incluye un `vocab.json` que en realidad es el vocabulario destino. Usar los ficheros del repo base sin corregir esto produce salidas sin relación con la entrada (chrF 0,98 frente a 36,40 con los ficheros correctos). Este repositorio corrige ese defecto y lo documenta con una evaluación sobre FLORES-200.

El resultado es un artefacto listo para producción en entornos ONNX, con licencia CC-BY-4.0 heredada del modelo base, un tamaño de repo de 2,9 GB y soporte exclusivo para el par inglés-coreano. No incorpora capacidades de razonamiento, tool calling ni multimodalidad: es un traductor seq2seq puro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, variante "big") |
| Parámetros totales | no disponible (el modelo base es `transformer-big`; el repo no publica el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Marian estándar; el repo no declara un máximo explícito) |
| Tipos de cuantización | fp32 y int8 dinámico (QUInt8, vía `onnxruntime.quantization.quantize_dynamic`) |
| Idiomas soportados | inglés (en) y coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`); tokenizador en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian transformer-big entrenado por el proyecto OPUS-MT, identificado en la model card como `opusTCv20210807-sepvoc_transformer-big_2022-07-28`. Se trata de una arquitectura encoder-decoder clásica con atención completa, sin mecanismos híbridos ni atención lineal. Un detalle técnico relevante es que usa vocabularios separados para origen y destino (`sepvoc`) pero con todos los embeddings atados (`tied-embeddings-all`), de modo que una única matriz de embeddings sirve a ambos lados; por eso los grafos ONNX no necesitan modificaciones respecto al modelo original.

Los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada. Lo que sí documenta el autor es el proceso de exportación: `optimum-cli export onnx --task text2text-generation-with-past`, seguido de cuantización dinámica con `onnxruntime`. También se probó una reconstrucción QInt8 per-channel, que obtuvo chrF 35,34 frente a 35,25 del int8 QUInt8, por lo que se conservaron los grafos int8 originales. La innovación práctica del repo es la corrección del tokenizador: `vocab.json` con los ids ingleses (de `src.vocab` más `<pad>` en 32000), `target_vocab.json` con los ids coreanos (de `trg.vocab` más `<pad>` en 32000) y `"separate_vocabs": true` en `tokenizer_config.json`.

## Capacidades

- Traducción de texto de inglés a coreano, tarea única del modelo.
- Generación seq2seq con decodificación por beams; la configuración incluida usa `num_beams=4`.
- Inferencia con caché de atención (`decoder_with_past_model.onnx`), lo que reduce el coste computacional en la generación token a token.
- Ejecución en CPU y GPU mediante ONNX Runtime, con variantes fp32 e int8 para ajustar precisión y velocidad.
- Integración con `transformers` vía `ORTModelForSeq2SeqLM` y con la librería `linguonnx` del mismo autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada estrictamente al par en-ko; no traduce desde o hacia otros idiomas.

## Casos de uso

- Traducción de documentación técnica: el modelo puede convertir manuales y guías en inglés a coreano dentro de un pipeline ONNX, con la ventaja de que el formato ONNX permite desplegar en infraestructura sin dependencia de PyTorch y con la variante int8 reduciendo el coste en CPU.
- Localización de interfaces y textos de producto: al ser un traductor de frases, encaja en procesos batch de localización donde se traducen cadenas cortas y se necesita un artefacto reproducible y versionado con licencia permisiva.
- Subtitulado y transcripción: integrado tras un sistema de ASR en inglés, el modelo traduce cada segmento a coreano; la caché de decoder reduce la latencia en secuencias de varios segmentos.
- Procesamiento de correo y atención al cliente: traducción de mensajes entrantes en inglés a coreano para agentes humanos o para un sistema de triaje, desplegado en servidores CPU con la variante int8.
- Investigación en traducción automática: el repo sirve como referencia reproducible para estudiar el impacto de la tokenización con vocabularios separados, ya que documenta la caída de chrF de 36,40 a 0,98 al usar el tokenizador incorrecto.
- Despliegue en entornos edge o sin GPU: al ser ONNX con cuantización int8, puede ejecutarse en máquinas modestas donde un modelo PyTorch completo no cabría, siempre que se acepte la pérdida de calidad medida (chrF 35,25 frente a 36,40).
- Evaluación comparativa de exportaciones: útil como baseline para comparar fp32, int8 dinámico y QInt8 per-channel en tareas de traducción en-ko.

## Benchmarks y rendimiento

Evaluación sobre las primeras 50 frases del devtest de FLORES-200, dirección `eng_Latn` a `kor_Hang`, con chrF de sacrebleu y decodificación con `num_beams=4`:

| Build | Ficheros de tokenizador | chrF |
|---|---|---|
| fp32 | `vocab.json` y `target_vocab.json` de este repo | 36,40 |
| int8 | `vocab.json` y `target_vocab.json` de este repo | 35,25 |
| fp32 | el único `vocab.json` del repo base | 0,98 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la información disponible, y no tendrían sentido para un modelo de traducción.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 2,9 GB e incluye los grafos fp32 e int8; la variante int8 reduce aproximadamente a un cuarto el peso de los tensores respecto a fp32, pero el autor no publica cifras de memoria en inferencia.
- GPU recomendadas: no disponible. Al ser un Marian transformer-big, es un modelo pequeño en el contexto actual y cabría en GPU de consumo, pero no hay datos publicados que lo confirmen.
- GPU de consumo: probablemente compatible con RTX 3060, RTX 4060 o superiores por tamaño, aunque no está verificado en la información proporcionada.
- Despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM`, o la librería `linguonnx` del autor (`load_translator(model="opus-mt-en-ko-int8")`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | chrF (FLORES-200 en-ko) |
|---|---|---|---|---|---|---|
| TigreGotico/opus-mt-en-ko-onnx (este) | Marian transformer-big | en → ko | no disponible | CC-BY-4.0 | ONNX (fp32, int8) | 36,40 (fp32) / 35,25 (int8) |
| Helsinki-NLP/opus-mt-tc-big-en-ko | Marian transformer-big | en → ko | no disponible | CC-BY-4.0 | PyTorch (safetensors/bin) | no disponible en esta ficha (mismo modelo base; el tokenizador del repo base da chrF 0,98 si se usa tal cual) |
| Helsinki-NLP/opus-mt-en-ko | Marian transformer (no big) | en → ko | no disponible | CC-BY-4.0 | PyTorch | no disponible |
| NLLB-200 (variantes destiladas) | Transformer encoder-decoder | 200 idiomas | no disponible | CC-BY-NC-4.0 (no comercial) | PyTorch, ONNX en algunas exportaciones | no disponible |

La comparación con NLLB es relevante por licencia: NLLB restringe el uso comercial, mientras que este modelo hereda CC-BY-4.0, que sí lo permite con atribución.

## Limitaciones y advertencias

- Modelo de traducción de un solo par lingüístico: no traduce coreano a inglés ni ningún otro idioma.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en frases ambiguas, terminología especializada o texto con formato complejo; no hay evaluación fuera de FLORES-200.
- Sesgos heredados del corpus OPUS, de composición no documentada en la información disponible; pueden aparecer sesgos de género, registro o dominio.
- El tokenizador es un punto crítico: usar los ficheros del repo base en lugar de los de este repo degrada la calidad de forma catastrófica (chrF 0,98 frente a 36,40). Cualquier despliegue debe verificar `"separate_vocabs": true` y la presencia de `target_vocab.json`.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero obliga a mantener el crédito al autor original y a indicar cambios; conviene revisar los términos exactos antes de redistribuir.
- La cuantización int8 introduce una pérdida medible de calidad (1,15 puntos de chrF en la muestra evaluada); para dominios sensibles puede ser preferible fp32.
- La evaluación se limita a 50 frases de FLORES-200, una muestra pequeña que no garantiza el comportamiento en producción.
- No hay datos publicados sobre longitud máxima de contexto, latencia ni throughput, lo que dificulta el dimensionamiento de infraestructura.
- El repositorio tiene un uso muy bajo (25 descargas, 0 likes) y no hay evidencia de mantenimiento continuado más allá de la fecha de actualización registrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/opus-mt-en-ko-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-ko
- Pesos originales Marian: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-kor/opusTCv20210807-sepvoc_transformer-big_2022-07-28.zip
- Librería linguonnx: https://github.com/TigreGotico/linguonnx
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Dataset FLORES-200: https://github.com/facebookresearch/flores
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
