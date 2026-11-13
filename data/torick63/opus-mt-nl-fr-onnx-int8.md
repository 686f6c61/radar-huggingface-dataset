# Torick63/opus-mt-nl-fr-onnx-int8

## Resumen

opus-mt-nl-fr-onnx-int8 es una conversión a ONNX con cuantización int8 del modelo multilingüe Helsinki-NLP/opus-mt-tc-bible-big-gmw-deu_eng_fra_por_spa (revisión `a6933ed`), especializada en traducción de neerlandés (nl) a francés (fr). Lo publica el usuario Torick63 y su propósito es claro: ofrecer un traductor holandés-francés ligero, de aproximadamente 332 MB, ejecutable en dispositivos con recursos limitados mediante ONNX Runtime. El modelo original pertenece a la familia OPUS-MT del grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Tiedemann y Thottingal).

La arquitectura subyacente es Marian, un transformer encoder-decoder orientado a traducción automática, exportado con Optimum bajo la tarea `text2text-generation-with-past`. La conversión emplea un encoder y un decoder fusionado que gestiona tanto el primer paso de decodificación como los pasos con caché KV, de modo que los pesos del decoder se almacenan una sola vez. La cuantización es dinámica de pesos int8 por canal, aplicada también a las capas internas de las ramas del decoder fusionado.

Es relevante para escenarios de traducción en el borde (navegador, móvil, escritorio) donde no se quiere depender de un servicio en la nube. El modelo base es multilingüe, pero esta conversión está pensada y documentada para el par nl-fr, requiriendo el token de idioma destino `>>fra<<` antepuesto a la entrada. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica de pesos, por canal (ONNX Runtime `quantize_dynamic`, `per_channel=True`, `EnableSubgraph`) |
| Idiomas soportados | neerlandes (nl) y frances (fr) en esta conversion; el modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), tokenizadores SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un Marian de tipo transformer encoder-decoder, la arquitectura estandar de la familia OPUS-MT para traducción automática neuronal. La conversión a ONNX se realizó con Optimum usando `--task text2text-generation-with-past`, generando un encoder independiente y un decoder fusionado que incorpora la rama de primer paso y la rama de pasos con caché KV, controladas por la entrada `use_cache_branch`. Esta fusión evita duplicar los pesos del decoder en disco.

La cuantización int8 es dinámica y por canal, aplicada con `quantize_dynamic` de ONNX Runtime, incluyendo `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado. El autor reporta que, con decodificación greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 23 de 30 frases cortas de prueba; el resto difieren en redacción por efecto de la cuantización. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO), más allá de que proviene de un modelo OPUS-MT entrenado sobre corpus bíblicos y multilingües según su nombre (`tc-bible-big`).

## Capacidades

- Traducción automática de neerlandés a francés, previa anteposición del token de idioma destino `>>fra<<` a la entrada.
- Ejecución en el dispositivo mediante ONNX Runtime, sin necesidad de servicio remoto.
- Decodificación greedy soportada; el autor valida la equivalencia con el modelo original en este modo.
- Soporte de caché KV en el decoder fusionado para acelerar la generación paso a paso.
- Capacidad multilingüe heredada del modelo base, aunque esta conversión está documentada y orientada al par nl-fr.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en el navegador: el modelo puede cargarse con ONNX Runtime Web para traducir texto nl-fr localmente, sin enviar datos a un servidor, gracias a su tamaño de ~332 MB y a la cuantización int8.
- Aplicaciones móviles de traducción offline: integrable en apps Android/iOS mediante ONNX Runtime Mobile para ofrecer traducción nl-fr sin conectividad, adecuado para viajeros o zonas con red limitada.
- Traducción de documentación interna: procesamiento por lotes de manuales o textos corporativos neerlandeses a francés en pipelines locales, con la ventaja de que los datos no salen de la infraestructura de la organización.
- Preprocesado en pipelines multilingües: uso como etapa de traducción nl→fr antes de un modelo de análisis o clasificación que solo opere en francés, reduciendo la dependencia de APIs externas.
- Subtitulado y localización de contenido: traducción de subtítulos o textos cortos de vídeo del neerlandés al francés en herramientas de escritorio, donde la latencia de red es innecesaria.
- Prototipado y experimentación: base ligera para comparar calidad de cuantización int8 frente al modelo PyTorch original en tareas de traducción, dado que el autor documenta la tasa de coincidencia (23/30 frases).
- Sistemas embebidos y de bajo consumo: despliegue en dispositivos con poca memoria gracias a los ~332 MB del conjunto y a la ausencia de dependencia de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación cualitativa es la comparación del autor: con decodificación greedy, los ficheros int8 coinciden con el modelo PyTorch original en 23 de 30 frases cortas de prueba, con diferencias de redacción en el resto atribuidas a la cuantización.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el conjunto de ficheros ocupa aproximadamente 332 MB; en ejecución en CPU la memoria necesaria es del orden de varios cientos de MB, aunque no se proporciona una cifra exacta.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y en el dispositivo mediante ONNX Runtime, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, por su tamaño reducido, aunque no se documentan requisitos específicos de VRAM ni modelos de GPU concretos.
- Opciones de despliegue: ONNX Runtime (CPU, Mobile, Web) y Optimum; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Torick63/opus-mt-nl-fr-onnx-int8 | no disponible | no disponible | nl, fr | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-bible-big-gmw-deu_eng_fra_por_spa (base) | no disponible | no disponible | multilingue (gmw: deu, eng, fra, por, spa y otros) | Apache-2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-nl-fr (modelo especifico nl-fr de OPUS-MT) | no disponible | no disponible | nl, fr | Apache-2.0 | PyTorch |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX int8 frente a PyTorch) y el tamaño reducido, a costa de una ligera pérdida de fidelidad en la salida.

## Limitaciones y advertencias

- El modelo está pensado para el par nl-fr y requiere anteponer `>>fra<<` a la entrada; su uso fuera de ese par no está documentado en esta conversión.
- La cuantización int8 introduce diferencias de redacción respecto al modelo original: el autor reporta coincidencia en 23 de 30 frases de prueba con decodificación greedy, por lo que no es una réplica exacta.
- No se documentan datos sobre sesgos del modelo base ni sobre riesgo de alucinación en traducción; como todo sistema de traducción neuronal, puede producir salidas plausibles pero incorrectas.
- No se especifican la longitud de contexto ni los límites de longitud de entrada; conviene validar el comportamiento con textos largos antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución al grupo OPUS-MT de la Universidad de Helsinki y al autor de la conversión.
- El repositorio no registra descargas ni likes en el momento de la consulta, y no hay evidencia de validación por terceros; para producción conviene evaluar la calidad con un conjunto de prueba propio.
- Al ser un modelo base de tipo `tc-bible-big`, su dominio de entrenamiento puede estar sesgado hacia textos bíblicos y religiosos, lo que puede afectar a la calidad en otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-nl-fr-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-gmw-deu_eng_fra_por_spa
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime (cuantización dinámica): https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Paper de Marian: https://arxiv.org/abs/1804.00344
- Referencia de Tiedemann y Thottingal sobre OPUS-MT: https://arxiv.org/abs/1912.05705
