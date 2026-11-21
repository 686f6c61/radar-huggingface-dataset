# ukrbublik/opus-mt-sv-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-sv-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-sv-en`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión, ukrbublik, la publica para el runtime OPUS on-device de la aplicación Android Subtitle Tap, con el objetivo de ofrecer traducción directa sueco→inglés sin pivote a través del inglés.

El modelo es un transformer encoder-decoder de arquitectura Marian, entrenado sobre datos paralelos de OPUS. Esta variante no modifica los pesos ni la lógica de decodificación: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 (QInt8, per-tensor) mediante onnxruntime. Adicionalmente, el decoder expone una salida de alineación (`alignment_shift_l2`) con las probabilidades de atención encoder del layer 2, útil para alinear subtítulos con el texto origen.

Su relevancia es acotada pero concreta: es un artefacto de despliegue para traducción de subtítulos en dispositivos Android, con un tamaño de repositorio de 0,1 GB, licencia Apache 2.0 y soporte únicamente del par de idiomas sueco-inglés. No está pensado como modelo generalista ni como base para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; export ONNX opset 17 |
| Idiomas soportados | sueco (sv) → inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`); tokenizer en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, el framework de traducción neuronal de código abierto usado por Helsinki-NLP para la familia OPUS-MT. Se trata de un transformer encoder-decoder estándar entrenado sobre corpus paralelos del proyecto OPUS. Los pesos originales corresponden a la revisión `202cf6240046bd8b6d08c207ee751ffd630d7ba8` de `Helsinki-NLP/opus-mt-sv-en`.

Esta conversión concreta no reentrena ni ajusta el modelo: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8. El decoder añade una salida `alignment_shift_l2` que corresponde a las probabilidades de atención encoder de la capa 2, implementada como un Identity sobre un nodo existente, de modo que los pesos y la decodificación permanecen inalterados. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario junto con las cadenas del vocabulario destino.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Traducción directa sueco→inglés sin pivote intermedio.
- Generación de texto de traducción en formato seq2seq estándar.
- Exposición de probabilidades de atención encoder (capa 2) para alineación entre origen y destino, útil en tareas de subtitulado.
- Tokenizador SentencePiece empaquetado en JSON para uso en runtime propio.
- Inferencia on-device mediante ONNX Runtime con pesos cuantizados INT8.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- Capacidades multilingües limitadas al par sv→en.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado en Android: la aplicación Subtitle Tap puede traducir subtítulos suecos a inglés directamente en el dispositivo, sin enviar texto a servidores externos, usando los ficheros ONNX cuantizados y el runtime OPUS.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite mapear segmentos del texto origen a segmentos traducidos, facilitando la sincronización de pistas de subtítulos en dos idiomas.
- Traducción offline en dispositivos con recursos limitados: el tamaño de 0,1 GB y la cuantización INT8 hacen viable la inferencia en móviles sin GPU dedicada.
- Preprocesado de corpus suecos: traducción por lotes de textos suecos a inglés en pipelines de NLP donde se requiere una alternativa local y ligera a APIs comerciales.
- Prototipado de sistemas de traducción embebidos: sirve como referencia para integrar modelos Marian en runtimes ONNX personalizados con salidas auxiliares de atención.
- Investigación en alineación de atención: el recibo criptográfico y la salida de atención permiten reproducir y auditar experimentos de alineación sin depender de los pesos originales en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia INT8 debería caber holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no se especifican; al ser un modelo orientado a on-device, el objetivo principal es CPU móvil.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, RTX 3060), aunque no hay datos publicados.
- Opciones de despliegue: ONNX Runtime (principal), potencialmente integrable en otros runtimes compatibles con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-sv-en-int8-shift-att | no disponible | no disponible | sv→en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-sv-en | no disponible | no disponible | sv→en | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-sv | no disponible | no disponible | en→sv | Apache 2.0 | PyTorch/safetensors |

La comparación directa con el modelo base es la más relevante: esta variante cambia el formato y añade la salida de alineación, pero no altera la calidad de traducción esperada respecto al original. No se dispone de datos de rendimiento comparado con alternativas.

## Limitaciones y advertencias

- Solo cubre la dirección sueco→inglés; no traduce en sentido inverso ni entre otros pares de idiomas.
- Al ser una cuantización INT8, puede existir una degradación leve de calidad frente al modelo original en PyTorch, aunque no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación y de traducciones erróneas inherente a los modelos neuronales de traducción, especialmente en dominios especializados o texto con ruido.
- No hay información sobre sesgos específicos del modelo original ni sobre la composición del corpus OPUS utilizado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica el autor.
- El modelo está pensado para un runtime concreto (OPUS on-device de Subtitle Tap); su integración en otros entornos requiere adaptar el tokenizador JSON y las salidas ONNX.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas más allá de la traducción.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-sv-en-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-sv-en-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-sv-en](https://huggingface.co/Helsinki-NLP/opus-mt-sv-en)
- [Proyecto OPUS-MT](https://github.com/Helsinki-NLP/OPUS-MT)
- [Paper de referencia: Tiedemann y Thottingal (2020), OPUS-MT — Building open translation services for the World, EAMT 2020](https://aclanthology.org/2020.eamt-1.61/)
