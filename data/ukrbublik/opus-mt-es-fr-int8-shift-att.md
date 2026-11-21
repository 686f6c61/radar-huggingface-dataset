# ukrbublik/opus-mt-es-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-es-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-fr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Resuelve la traducción directa español→francés sin pivotar por el inglés, en un tamaño reducido (0,2 GB en el repositorio) apto para inferencia en dispositivo.

La arquitectura subyacente es Marian (transformer encoder-decoder), exportada con Optimum a ONNX (opset 17, sin past key/values) y cuantizada dinámicamente con ONNX Runtime a QInt8 por tensor. La modificación específica del autor es la exposición de una salida adicional de alineamiento (`alignment_shift_l2`), que corresponde a las probabilidades de atención encoder del decodificador en la capa 2; es una identidad sobre un nodo existente, por lo que los pesos y la decodificación no cambian.

Es relevante porque permite ejecutar traducción es→fr en local (por ejemplo, en Android mediante un runtime ONNX propio, como el de la app Subtitle Tap) con un modelo pequeño, licencia Apache-2.0 y sin dependencia de servicios en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via ONNX Runtime |
| Idiomas soportados | es (espanol), fr (frances) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo original `Helsinki-NLP/opus-mt-es-fr` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre datos paralelos del corpus OPUS. La model card cita el trabajo de Tiedemann y Thottingal (2020) como referencia del sistema OPUS-MT. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La conversión realizada por `ukrbublik` parte de la revisión `f8be65b3aff01c69f3b9092a4ff81b873612140d` del modelo base y aplica tres cambios: exportación a ONNX con Optimum (opset 17, sin past key/values), cuantización dinámica INT8 con ONNX Runtime (QInt8, per-tensor) y la adición de una salida de alineamiento `alignment_shift_l2` (probabilidades de atención encoder de la capa 2) implementada como una identidad sobre un nodo existente, sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más las cadenas del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decodificador.

## Capacidades

- Traducción automática directa español→francés, sin pivotar por inglés.
- Exposición de probabilidades de atención encoder de la capa 2 como salida de alineamiento (`alignment_shift_l2`), útil para obtener correspondencias a nivel de token entre origen y destino.
- Ejecución en dispositivo mediante ONNX Runtime, con pesos cuantizados INT8.
- Tokenizador SentencePiece empaquetado en formato JSON para su uso en runtimes ligeros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al par es→fr; no cubre otras direcciones.

## Casos de uso

- Subtitulado en dispositivo: la app Subtitle Tap usa este modelo para traducir subtítulos de español a francés en local, con la salida de alineamiento para sincronizar o mapear segmentos entre idiomas.
- Traducción offline en aplicaciones móviles: al ser un modelo de 0,2 GB en ONNX INT8, puede integrarse en apps Android o iOS sin conexión a red.
- Procesamiento por lotes de documentos es→fr: útil para pipelines que necesitan traducir grandes volúmenes de texto sin coste por token, ejecutando ONNX Runtime en CPU.
- Análisis de alineamiento léxico: la salida `alignment_shift_l2` permite estudiar correspondencias token a token entre español y francés para tareas de evaluación o anotación.
- Prototipado de sistemas de traducción en investigación: sirve como baseline ligero y reproducible (con recibo SHA-256 del decodificador) para comparar con modelos mayores.
- Traducción en entornos con recursos limitados: servidores sin GPU o dispositivos embebidos donde un modelo Marian INT8 cabe en memoria y ofrece latencia aceptable.
- Integración en herramientas de accesibilidad: traducción en tiempo real de contenido en español a francés en lectores de pantalla o asistentes de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB, por lo que la inferencia INT8 en CPU es viable con pocos cientos de MB de RAM.
- GPU recomendadas: no se especifican; al ser un modelo Marian pequeño cuantizado, puede ejecutarse en CPU y en GPUs de consumo como RTX 3060 o superiores, aunque no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (runtime previsto por el autor para la app Subtitle Tap); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-fr-int8-shift-att | no disponible | no disponible | Apache-2.0 | ONNX INT8 | Salida de alineamiento adicional |
| Helsinki-NLP/opus-mt-es-fr | no disponible | no disponible | Apache-2.0 | safetensors/PyTorch | Modelo base sin cuantizar |
| Otros modelos Marian es→fr de OPUS-MT | no disponible | no disponible | Apache-2.0 | variable | No se dispone de datos comparativos |

No se dispone de información sobre benchmarks ni de otros modelos comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al entrenarse sobre corpus OPUS, puede heredar sesgos de los datos paralelos.
- Riesgo de alucinación: presente en cualquier modelo de traducción neuronal; no se han publicado evaluaciones específicas para esta conversión.
- Limitaciones de contexto e idioma: solo cubre es→fr; no se especifica la longitud máxima de contexto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) y respetar la atribución al grupo OPUS-MT.
- Caveat de producción: la cuantización INT8 puede degradar ligeramente la calidad frente al modelo original; no hay métricas publicadas que cuantifiquen esa pérdida.
- La salida de alineamiento es una identidad sobre un nodo existente; su interpretación depende del runtime que la consuma y del recibo `alignment.json`.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-fr
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
