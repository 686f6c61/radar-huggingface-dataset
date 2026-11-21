# ukrbublik/opus-mt-en-nl-int8-shift-att

## Resumen

OPUS-MT en→nl INT8 ONNX with Shift-Att es una conversión del modelo de traducción automática Helsinki-NLP/opus-mt-en-nl, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.) y empaquetado por el usuario ukrbublik para su uso en la aplicación Android Subtitle Tap. Se trata de un modelo Marian de traducción directa inglés-neerlandés, sin pivote a través del inglés, exportado a ONNX y cuantizado a INT8 para inferencia en dispositivo.

El cambio principal respecto al modelo original es el formato: los pesos se han exportado a ONNX (opset 17, sin past key/values) y cuantizado dinámicamente a INT8 (QInt8, per-tensor) mediante onnxruntime. Además, el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, pensada para alineación de subtítulos; esta salida es una identidad de un nodo existente y no altera pesos ni decodificación.

Es relevante para desarrolladores que necesiten traducción en dispositivo con un footprint mínimo (repo de 0,1 GB), sin dependencia de GPU ni de servicios en la nube, y con una licencia permisiva (Apache 2.0) que facilita la integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre datos del corpus OPUS. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; se trata de un modelo de traducción supervisada estándar de OPUS-MT.

La conversión realizada por ukrbublik aplica una exportación con optimum (opset 17, sin past key/values, lo que implica que la decodificación no reutiliza caché de atención entre pasos) y una cuantización dinámica INT8 con onnxruntime. La innovación destacable es la exposición de `alignment_shift_l2`, las probabilidades de atención encoder de la capa 2 del decodificador, útil para alinear tokens de origen y destino en subtítulos. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción directa de inglés a neerlandés, sin pivote intermedio.
- Generación de alineaciones de atención encoder-destino (capa 2) para tareas de subtitulado y correspondencia token a token.
- Inferencia en dispositivo mediante ONNX Runtime, sin necesidad de GPU.
- Tokenizador SentencePiece empaquetado en formato JSON para uso en runtime propio.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- Capacidad multilingüe limitada exclusivamente al par en→nl.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en aplicaciones Android: el modelo traduce subtítulos de inglés a neerlandés en el dispositivo y la salida `alignment_shift_l2` permite sincronizar y alinear los tokens traducidos con los originales, todo sin conexión.
- Traducción offline en dispositivos de bajos recursos: con un repo de 0,1 GB y cuantización INT8, cabe en móviles y sistemas embebidos donde no es viable ejecutar modelos mayores.
- Preprocesado de contenido editorial: traducción de documentación o artículos del inglés al neerlandés en pipelines locales antes de revisión humana.
- Herramientas de accesibilidad: generación de subtítulos traducidos en tiempo real para vídeo pregrabado o streaming de baja latencia en neerlandés.
- Integración en aplicaciones de escritorio o CLI: al estar en ONNX, se puede desplegar con onnxruntime en Windows, Linux o macOS sin dependencias de framework de deep learning.
- Prototipado de sistemas de traducción con alineación: investigadores pueden usar la salida de atención para estudiar correspondencias léxicas en un modelo Marian cuantizado.
- Traducción por lotes de pequeños volúmenes de texto en entornos air-gapped, donde no se permite enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo cuantizado INT8 ocupa del orden de decenas de MB, aunque no se especifica el tamaño exacto.
- GPU recomendadas: no disponible; el modelo está pensado para CPU y ejecución en dispositivo.
- Cabe en GPU de consumo: sí, por su reducido tamaño (repo de 0,1 GB), aunque no se detallan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de integración en aplicaciones Android mediante el runtime OPUS de Subtitle Tap.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-nl-int8-shift-att | no disponible | no disponible | en→nl | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-nl | no disponible | no disponible | en→nl | Apache 2.0 | PyTorch/safetensors |
| Otros modelos Marian OPUS-MT en→nl | no disponible | no disponible | en→nl | Apache 2.0 | variable |

La comparativa se limita al modelo base y a otras variantes OPUS-MT; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce inglés a neerlandés; no soporta otros pares de idiomas.
- Al ser una cuantización INT8, puede producirse una ligera degradación de calidad respecto al modelo original en frases complejas o ambiguas.
- La exportación sin past key/values implica decodificación menos eficiente en secuencias largas.
- Riesgo de alucinación y errores en terminología especializada, propio de los modelos Marian entrenados sobre OPUS.
- Sesgos heredados de los datos de entrenamiento OPUS (posibles sesgos de género, dominio y registro).
- No se especifican límites de longitud de contexto; conviene validar el comportamiento en textos largos.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El modelo está empaquetado para un runtime concreto (Subtitle Tap); su integración en otros entornos requiere adaptar el tokenizador JSON y las salidas ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-nl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-nl
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
