# ukrbublik/opus-mt-en-sq-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-sq-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-sq`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce del inglés al albanés de forma directa, sin pivotar por una lengua intermedia, y está pensado para ejecutarse en dispositivo (on-device), concretamente en el runtime OPUS de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos del corpus OPUS. Esta variante concreta no reentrena ni modifica los pesos: exporta el modelo original a ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor), reduciendo el repositorio a unos 0,1 GB.

Su interés actual radica en dos decisiones de ingeniería: la cuantización INT8 para inferencia ligera en móvil y la exposición de una salida adicional de alineación (`alignment_shift_l2`), que devuelve las probabilidades de atención encoder del decodificador en la capa 2. Esto permite a la aplicación consumidora mapear tokens origen-destino sin cambiar los pesos ni el proceso de decodificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), albanés (sq) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la familia empleada por OPUS-MT para traducción neuronal. Los pesos provienen de `Helsinki-NLP/opus-mt-en-sq` (revisión `3fb16c7fae5d3293060997dff628656de259d46e`), entrenado por el grupo de la Universidad de Helsinki sobre datos del corpus OPUS. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación de esta conversión es doble. Por un lado, la exportación con `optimum` a ONNX opset 17 y la cuantización dinámica INT8 de onnxruntime, orientadas a reducir el coste de inferencia en Android. Por otro, la inclusión de una salida `alignment_shift_l2` en el decodificador: se trata de una identidad sobre un nodo existente que expone las probabilidades de atención encoder de la capa 2, lo que permite obtener alineaciones token a token sin alterar los pesos ni la decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más las cadenas del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción automática directa inglés → albanés, sin pivotar por una lengua intermedia.
- Exposición de alineaciones token a token mediante `alignment_shift_l2` (probabilidades de atención encoder de la capa 2), útil para subtitulado, resaltado o verificación de correspondencias.
- Tokenización autocontenida mediante `tokenizer_runtime.json`, que evita depender del tokenizador SentencePiece original en el runtime.
- Inferencia on-device en Android a través del runtime OPUS de Subtitle Tap.
- No soporta tool calling ni function calling.
- No está orientado a razonamiento multi-paso ni a uso como agente.
- Capacidad multilingüe limitada estrictamente al par en→sq.

## Casos de uso

- Subtitulado automático en Android: el modelo traduce subtítulos en inglés a albanés directamente en el dispositivo, sin enviar texto a servidores externos, gracias a su tamaño reducido (~0,1 GB) y a la cuantización INT8.
- Alineación para subtítulos bilingües: la salida `alignment_shift_l2` permite mapear qué token origen corresponde a cada token traducido, lo que facilita la sincronización y el resaltado en aplicaciones de vídeo.
- Traducción de documentación técnica para desarrolladores albaneses: al ser una traducción directa en→sq, evita los errores acumulados de un pivot por inglés intermedio en pares no ingleses.
- Asistentes de lectura offline: integración en aplicaciones que necesitan traducir contenido en inglés a albanés sin conectividad, aprovechando la inferencia local con onnxruntime.
- Procesamiento por lotes de textos cortos: traducción de mensajes, correos o formularios en pipelines ligeros donde el coste de GPU no está justificado y basta con CPU.
- Investigación en alineación de traducción: el par de ficheros `alignment.json` y la salida de atención permiten estudiar correspondencias léxicas en un modelo Marian cuantizado sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa ~0,1 GB, por lo que la huella de memoria es muy reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución on-device en Android con onnxruntime, no para GPU de datacenter.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño del repositorio; también en CPU y en dispositivos móviles.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap); el formato ONNX es compatible con otros motores que acepten opset 17 sin past key/values.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-sq-int8-shift-att` | Marian NMT | en→sq | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineación, on-device |
| `Helsinki-NLP/opus-mt-en-sq` | Marian NMT | en→sq | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo original sin cuantizar ni alineación expuesta |
| `Helsinki-NLP/opus-mt-en-mul` | Marian NMT | en→múltiples | no disponible | Apache 2.0 | safetensors/PyTorch | Multilenguaje, no específico para albanés |
| `facebook/nllb-200-distilled-600M` | Transformer | 200 idiomas | no disponible | CC-BY-NC 4.0 | safetensors/PyTorch | Mayor cobertura pero licencia no comercial y mayor tamaño |

## Limitaciones y advertencias

- Sesgos: al derivar de OPUS-MT entrenado sobre corpus OPUS, puede heredar sesgos de dominio y de género presentes en los datos de traducción.
- Riesgo de alucinación: como todo modelo NMT, puede producir traducciones fluidas pero incorrectas, especialmente en frases ambiguas o con terminología especializada.
- Cobertura lingüística restringida al par inglés-albanés; no traduce otras lenguas ni variantes dialectales del albanés de forma explícita.
- La cuantización INT8 dinámica puede introducir una degradación de calidad frente al modelo original en PyTorch, no cuantificada en la información disponible.
- El modelo no incluye past key/values en la exportación ONNX, lo que condiciona el esquema de decodificación en el runtime consumidor.
- Licencia Apache 2.0: permite uso comercial, pero exige mantener la atribución a los autores originales (Tiedemann y Thottingal, 2020) y conservar el aviso de licencia.
- No se han publicado métricas de calidad (BLEU, chrF) ni evaluaciones de sesgo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-sq-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-sq
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
