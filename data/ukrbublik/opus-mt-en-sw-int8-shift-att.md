# ukrbublik/opus-mt-en-sw-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-sw-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-sw`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a suajili sin pivotar por una lengua intermedia, y esta versión concreta está pensada para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La modificación respecto al modelo base es exclusivamente de formato: exportación a ONNX con optimum (opset 17, sin past key/values), cuantización dinámica INT8 por tensor con onnxruntime (QInt8) y la adición de una salida auxiliar `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2. Esta salida permite alinear tokens de origen y destino, algo útil para subtitulado, resaltado de correspondencias o control de calidad de la traducción.

El repositorio pesa aproximadamente 0,1 GB, no registra descargas ni likes en el momento de la consulta y se distribuye bajo licencia Apache 2.0. Los pesos originales son de OPUS-MT; este repositorio solo cambia el formato de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica por tensor (QInt8) sobre ONNX |
| Idiomas soportados | ingles (en), suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json`, `alignment.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática neuronal, tal como se distribuye en la familia OPUS-MT. El modelo base `Helsinki-NLP/opus-mt-en-sw` fue entrenado por el grupo de la Universidad de Helsinki sobre datos del corpus OPUS (Tiedemann y Thottingal, 2020). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

La innovación de esta conversión es doble. Por un lado, la exportación ONNX con opset 17 y sin past key/values simplifica el grafo para inferencia en dispositivos con recursos limitados. Por otro, la cuantización dinámica INT8 reduce el tamaño y acelera la ejecución en CPU. La salida adicional `alignment_shift_l2` se implementa como una Identity sobre un nodo existente, de modo que no altera pesos ni decodificación, pero permite recuperar las probabilidades de atención de la capa 2 del decoder hacia el encoder para tareas de alineación.

## Capacidades

- Traducción directa de inglés a suajili, sin pivotar por una tercera lengua.
- Generación de alineaciones token a token mediante la salida `alignment_shift_l2` (probabilidades de atención encoder-decoder de la capa 2).
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json`, con piezas, puntuaciones y mapeo a identificadores de vocabulario.
- Inferencia en dispositivo vía onnxruntime, orientada a aplicaciones móviles.
- Verificación de integridad del decoder mediante el recibo `alignment.json` (hash SHA-256).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en-sw.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos de inglés a suajili en el propio dispositivo usando los dos grafos ONNX cuantizados, sin conexión a red ni envío de datos a servidores externos.
- Alineación de subtítulos y resaltado de correspondencias: la salida `alignment_shift_l2` permite mapear cada token traducido a su origen, útil para resaltar la palabra original mientras se muestra la traducción o para revisar sincronización.
- Traducción offline en entornos con conectividad limitada: al ejecutarse con onnxruntime en CPU, el modelo es adecuado para dispositivos sin GPU y para escenarios de campo donde no hay acceso a Internet.
- Preprocesado de corpus en-sw: el modelo puede generar traducciones de referencia o aumentar datos para entrenar correctores o sistemas de evaluación en este par lingüístico.
- Control de calidad de traducciones: comparando las alineaciones de atención con las esperadas se pueden detectar desalineaciones o traducciones dudosas en pipelines de revisión.
- Integración en aplicaciones de lectura o accesibilidad: traducción bajo demanda de texto en pantalla para usuarios que leen inglés pero prefieren suajili, con latencia baja al no requerir llamadas a API.
- Prototipado de sistemas de traducción en dispositivos de bajo consumo: sirve como referencia de cómo empaquetar un modelo Marian en ONNX INT8 con tokenizador y metadatos de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU); el repositorio completo ocupa aproximadamente 0,1 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU mediante onnxruntime. Cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del repositorio; no se dispone de cifras exactas de memoria en ejecución.
- Opciones de despliegue: onnxruntime (CPU o GPU), integración móvil en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-sw-int8-shift-att | no disponible | no disponible | en, sw | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-sw (base) | no disponible | no disponible | en, sw | Apache 2.0 | safetensors / PyTorch |
| Otros modelos OPUS-MT en-sw | no disponible | no disponible | en, sw | Apache 2.0 | variables |

La comparación con alternativas de la misma categoría se limita al modelo base, ya que no se dispone de información sobre otros sistemas en-sw con datos verificables en la documentación proporcionada. La diferencia principal frente al base es el formato (ONNX INT8 frente a PyTorch), la orientación a inferencia en dispositivo y la salida de alineación, no la calidad de traducción, que debería ser equivalente al no modificarse los pesos.

## Limitaciones y advertencias

- Solo cubre el par inglés-suajili; no traduce desde o hacia otras lenguas.
- No hay datos publicados sobre sesgos, calidad de traducción ni evaluación humana en la información disponible.
- Riesgo de alucinación y errores en dominios especializados (técnico, legal, médico) inherente a los modelos OPUS-MT entrenados sobre corpus generales.
- La cuantización INT8 puede introducir una ligera degradación de calidad frente a los pesos originales en FP32; no se han publicado mediciones al respecto.
- La salida `alignment_shift_l2` es una Identity sobre un nodo existente: no debe interpretarse como un mecanismo de alineación entrenado específicamente, sino como una exposición de atención interna.
- El modelo está pensado para on-device; no se documentan requisitos de contexto máximo ni comportamiento con secuencias largas.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Universidad de Helsinki, OPUS-MT) según indica la model card.
- El repositorio no registra descargas ni validación comunitaria; conviene verificar la integridad mediante `alignment.json` antes de desplegarlo en producción.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-en-sw-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-en-sw-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-en-sw](https://huggingface.co/Helsinki-NLP/opus-mt-en-sw)
- Referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
