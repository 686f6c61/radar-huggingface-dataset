# ukrbublik/opus-mt-tr-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-tr-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tr-fr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Se trata de un modelo Marian de traducción directa turco→francés, sin pivotar por el inglés, empaquetado específicamente para el runtime on-device de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es un nuevo entrenamiento, sino un cambio de formato: exportación con Optimum (opset 17, sin past key/values) y cuantización dinámica INT8 con ONNX Runtime (QInt8, per-tensor). Además, el decoder expone una salida adicional `alignment_shift_l2` que contiene las probabilidades de atención encoder del nivel 2, útil para alinear tokens de origen y destino en subtítulos. Los pesos y la decodificación permanecen idénticos al modelo original.

Es relevante para desarrolladores que necesiten traducción turco→francés en dispositivos con recursos limitados (móvil, edge) y que quieran información de alineación a nivel de token sin recurrir a modelos mayores. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via ONNX Runtime |
| Idiomas soportados | turco (tr) → frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, la arquitectura estándar de la familia OPUS-MT: un transformer encoder-decoder con atención multi-cabeza, entrenado sobre corpus paralelos del proyecto OPUS. El modelo original fue desarrollado por la Universidad de Helsinki y publicado en el trabajo de Tiedemann y Thottingal (EAMT 2020). No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni si hubo etapas de fine-tuning con RLHF o DPO; estos datos corresponden al modelo base y no se reproducen aquí.

La conversión de este repositorio aplica exportación Optimum con opset 17 y sin past key/values (es decir, sin caché de decodificación), seguida de cuantización dinámica INT8 con ONNX Runtime. El decoder incorpora una salida adicional, `alignment_shift_l2`, que es una identidad sobre un nodo existente y expone las probabilidades de atención encoder de la capa 2; no altera pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y scores del SentencePiece mapeados a ids de vocabulario y cadenas del tokenizador destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa turco→francés, sin pivotar por inglés.
- Generación de alineaciones a nivel de token mediante la salida `alignment_shift_l2` (probabilidades de atención encoder de la capa 2).
- Inferencia on-device mediante ONNX Runtime, con pesos cuantizados INT8.
- Tokenización autocontenida: el repositorio incluye el vocabulario y los scores del SentencePiece en `tokenizer_runtime.json`.
- Integración pensada para subtitulado: la alineación permite mapear segmentos origen-destino en aplicaciones de subtítulos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos turcos a francés en el dispositivo usando los ficheros ONNX cuantizados, sin conexión a red y con un peso de repositorio de ~0,1 GB.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite asociar cada token traducido con su token origen, útil para generar subtítulos sincronizados o resaltados palabra a palabra.
- Traducción offline en dispositivos de gama baja: la cuantización INT8 y el formato ONNX reducen requisitos de memoria frente al modelo original en safetensors, permitiendo ejecución en móviles sin GPU dedicada.
- Procesamiento por lotes en edge: integrable en pipelines con ONNX Runtime para traducir grandes volúmenes de texto turco→francés en servidores sin GPU, priorizando coste y latencia sobre calidad máxima.
- Herramientas de accesibilidad: traducción en tiempo real de contenido turco (menús, avisos, documentos) a francés en aplicaciones móviles con requisitos de privacidad (datos que no salen del dispositivo).
- Prototipado de sistemas de traducción restringidos a un par de idiomas: al ser un modelo directo y ligero, sirve como base para evaluar pipelines de NMT on-device antes de escalar a modelos mayores.
- Verificación de alineaciones en investigación: el recibo `alignment.json` y la salida de atención permiten reproducir y auditar las alineaciones generadas en experimentos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con cuantización INT8 y un repositorio de ~0,1 GB, el modelo es apto para ejecución en CPU y en GPUs de gama baja, aunque no se documentan cifras exactas de memoria.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder ejecutarlo con holgura, pero no hay datos publicados.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (~0,1 GB) y la cuantización INT8; sin cifras oficiales de VRAM.
- Opciones de despliegue: ONNX Runtime (runtime objetivo del autor, usado en la app Subtitle Tap). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-tr-fr-int8-shift-att | no disponible | no disponible | tr→fr | Apache 2.0 | ONNX INT8 | Salida de alineación de atención; orientado a on-device |
| Helsinki-NLP/opus-mt-tr-fr | no disponible | no disponible | tr→fr | Apache 2.0 | safetensors | Modelo base original; sin cuantización ni salida de alineación |
| Otros modelos OPUS-MT tr→X | no disponible | no disponible | tr→varios | Apache 2.0 | safetensors/ONNX | Misma familia Marian; pares de idioma distintos |

La comparación se limita a la familia OPUS-MT porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de traducción de un único par de idiomas (turco→francés); no soporta otros pares ni tareas generativas generales.
- La cuantización INT8 puede introducir una degradación de calidad respecto al modelo original en safetensors; no se documenta la magnitud de esa pérdida.
- La exportación sin past key/values implica que la decodificación no reutiliza caché, lo que puede aumentar la latencia en secuencias largas frente a variantes con caché.
- No se documentan sesgos específicos del modelo; al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de composición del corpus original.
- Riesgo de alucinación y de traducciones erróneas en dominios alejados del corpus de entrenamiento (texto técnico, jerga, nombres propios).
- La salida de alineación corresponde a la atención de la capa 2 y no garantiza una alineación perfecta; debe validarse en la aplicación concreta.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de OPUS-MT (Tiedemann y Thottingal, 2020) y conservar la atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera de la app del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-tr-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-fr
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible en la información proporcionada
- Repositorio o demo de la app Subtitle Tap: no disponible en la información proporcionada
