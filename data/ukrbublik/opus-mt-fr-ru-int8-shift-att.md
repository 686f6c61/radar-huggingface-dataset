# ukrbublik/opus-mt-fr-ru-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-ru-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción `Helsinki-NLP/opus-mt-fr-ru`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (OPUS-MT). El modelo traduce directamente de francés a ruso, sin pivotar por el inglés, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La particularidad de esta conversión es que el decodificador expone una salida adicional, `alignment_shift_l2`, que contiene las probabilidades de atención encoder-decoder de la capa 2. Esta salida es una identidad sobre un nodo ya existente, de modo que los pesos y el proceso de decodificación no se modifican; sirve para obtener alineamientos palabra a palabra útiles en tareas de subtitulado.

El repositorio ocupa aproximadamente 0,1 GB, emplea licencia Apache 2.0 y se distribuye en formato ONNX cuantizado (QInt8, per-tensor) junto con un tokenizador serializado en JSON. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | frances (fr) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq característico de la familia OPUS-MT, entrenado originalmente sobre datos del corpus OPUS. Esta conversión concreta parte de la revisión `9e4e5772eccfebe66a3fde8a2d45427064cf6dc9` de `Helsinki-NLP/opus-mt-fr-ru` y aplica un export mediante optimum (opset 17, sin past key/values) seguido de cuantización dinámica INT8 con onnxruntime.

La innovación técnica del repositorio es la exposición de `alignment_shift_l2`, una salida que replica las probabilidades de atención encoder-decoder de la capa 2 mediante una operación Identity sobre un nodo existente. Esto permite obtener alineamientos entre tokens de origen y destino sin alterar los pesos ni el comportamiento de decodificación. El repositorio incluye además `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario, y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decodificador. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Traducción directa de francés a ruso sin pivotar por el inglés.
- Generación de alineamientos de atención encoder-decoder (capa 2) para correspondencia entre tokens de origen y destino.
- Tokenización SentencePiece empaquetada en formato JSON para uso en runtime propio.
- Inferencia en dispositivo mediante ONNX Runtime con cuantización INT8.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par fr-ru.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos de francés a ruso en el propio dispositivo gracias al runtime OPUS y a los modelos ONNX cuantizados, sin depender de servicios en la nube.
- Alineamiento palabra a palabra en subtítulos: la salida `alignment_shift_l2` permite mapear qué token francés corresponde a qué token ruso, útil para sincronizar o resaltar segmentos en la interfaz de reproducción.
- Traducción offline en entornos sin conectividad: al ejecutarse con ONNX Runtime en local, el modelo es adecuado para dispositivos con red intermitente o requisitos de privacidad que impiden enviar texto a servidores externos.
- Integración en pipelines de procesamiento de subtítulos: el par de modelos ONNX puede incorporarse a herramientas de postproducción que necesiten traducción fr-ru por lotes con bajo consumo de recursos.
- Prototipado de sistemas de traducción embebidos: sirve como referencia para implementar traducción neuronal en apps móviles con un footprint de repositorio de unos 0,1 GB.
- Investigación sobre alineamiento de atención: la exposición de las probabilidades de atención de la capa 2 facilita estudios de interpretabilidad y de calidad de alineamientos en modelos Marian cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa unos 0,1 GB, por lo que la huella en memoria es reducida tras la cuantización INT8.
- GPU recomendadas: no disponibles; el modelo está orientado a ejecución en dispositivo (Android) mediante ONNX Runtime, no a despliegue en GPU de servidor.
- Compatibilidad con GPU de consumo: no documentada; por tamaño y cuantización es plausible su ejecución en CPU móvil, pero no se aportan datos de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-ru-int8-shift-att | no disponible | no disponible | fr, ru | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-fr-ru | no disponible | no disponible | fr, ru | Apache 2.0 | PyTorch (safetensors/bin) |
| Otros modelos OPUS-MT fr-ru | no disponible | no disponible | fr, ru | Apache 2.0 | variable |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; el modelo base `Helsinki-NLP/opus-mt-fr-ru` es la referencia natural, del que esta conversión solo cambia el formato y añade la salida de alineamiento.

## Limitaciones y advertencias

- Solo cubre el par francés-ruso; no es un modelo multilingüe general.
- No se han publicado métricas de calidad (BLEU, chrF u otras) para esta conversión cuantizada, por lo que el impacto de la cuantización INT8 en la calidad de traducción no está cuantificado.
- La cuantización dinámica per-tensor puede degradar ligeramente la precisión respecto al modelo original en PyTorch.
- No se documentan sesgos conocidos ni evaluación de sesgos; al entrenarse sobre datos OPUS, puede heredar sesgos de ese corpus.
- Riesgo de alucinación y de traducciones erróneas en dominios especializados no representados en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a los autores originales (Universidad de Helsinki) tal como indica la model card.
- El export no incluye past key/values, lo que condiciona el tipo de decodificación soportada en el runtime.
- No se documentan limitaciones de longitud de contexto ni de idioma más allá del par fr-ru.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ru
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace en la información proporcionada
