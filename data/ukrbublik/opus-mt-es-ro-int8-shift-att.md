# ukrbublik/opus-mt-es-ro-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-ro-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-es-ro`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de espanol a rumano, sin pivotar por el ingles, y esta pensado para ejecutarse en dispositivos (on-device) dentro de la aplicacion Android Subtitle Tap.

La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, el estandar de la familia OPUS-MT. Esta version concreta anade una salida de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder, util para alinear tokens entre origen y destino (por ejemplo, para subtitulos). Los pesos y el proceso de decodificacion no se modifican respecto al modelo original.

Su relevancia es practica: ofrece un artefacto ONNX de unos 0,1 GB, cuantizado a INT8, con tokenizer empaquetado en JSON y verificacion por hash de la salida de alineacion, lo que facilita el despliegue en entornos moviles o de bajos recursos sin dependencias de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | espanol (es), rumano (ro) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`, opset 17, sin past key/values) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-es-ro` es un transformer encoder-decoder de tipo Marian entrenado sobre datos del corpus OPUS (Tiedemann y Thottingal, 2020). Esta conversion mantiene la arquitectura y los pesos originales, y solo cambia el formato: exportacion a ONNX con optimum (opset 17, sin cache de past key/values) y cuantizacion dinamica INT8 con onnxruntime. El decoder incorpora una salida adicional `alignment_shift_l2` que expone las probabilidades de atencion encoder-decoder de la capa 2; segun la model card, se trata de una identidad sobre un nodo existente, por lo que los pesos y la decodificacion no varian.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; el modelo original se entreno sobre pares de traduccion del corpus OPUS. El repositorio incluye `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario y cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion automatica directa espanol a rumano, sin pivotar por el ingles.
- Salida de alineacion de atencion (`alignment_shift_l2`) para mapear tokens origen-destino.
- Ejecucion on-device mediante ONNX Runtime con pesos INT8.
- Tokenizer empaquetado en JSON para integracion sin dependencias de SentencePiece en tiempo de ejecucion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Cobertura limitada a los dos idiomas declarados (es, ro).

## Casos de uso

- Subtitulado en tiempo real en Android: la salida de alineacion permite sincronizar y mapear segmentos de subtitulo entre espanol y rumano dentro de la app Subtitle Tap, con un artefacto de 0,1 GB apto para movil.
- Traduccion de documentacion tecnica es-ro en pipelines ligeros: el formato ONNX permite integrarlo en servicios sin GPU con onnxruntime.
- Localizacion de interfaces y cadenas de aplicacion: traduccion por segmentos cortos con un modelo directo que evita el error acumulado del pivot por ingles.
- Procesamiento por lotes de contenido editorial espanol a rumano en entornos de bajos recursos, aprovechando la cuantizacion INT8.
- Traduccion de correspondencia y correos en flujos de trabajo automatizados donde se prioriza baja latencia y tamano reducido.
- Investigacion en alineacion de palabras: la salida `alignment_shift_l2` sirve para estudiar correspondencias lexicas entre espanol y rumano a partir de atenciones del decoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repo (0,1 GB) y la cuantizacion INT8, el modelo es muy ligero y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no disponible; por tamano, cualquier GPU moderna (incluidas RTX de gama media) seria suficiente, aunque el diseno apunta a ejecucion en CPU/movil.
- Cabe en GPU de consumo: si, por el reducido tamano del artefacto; se desconocen requisitos minimos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); no se documentan otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-es-ro-int8-shift-att` | no disponible | no disponible | es, ro | apache-2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-es-ro` (base) | no disponible | no disponible | es, ro | apache-2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT es-ro | no disponible | no disponible | es, ro | apache-2.0 | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre el par espanol-rumano; no es un modelo multilingue general.
- Al estar cuantizado a INT8 de forma dinamica per-tensor, puede haber una ligera perdida de calidad frente al modelo original en FP32, no cuantificada en la informacion disponible.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos de traduccion neuronales, especialmente en dominios especializados o textos largos.
- La exportacion ONNX no incluye past key/values, lo que puede afectar a la eficiencia en decodificacion autoregresiva larga.
- No se documentan sesgos especificos; al entrenarse sobre OPUS, hereda los sesgos y desequilibrios de ese corpus.
- Uso comercial permitido por la licencia apache-2.0, con atribucion al grupo de Helsinki segun indica la model card.
- Repositorio con 0 descargas y 0 likes: ecosistema de validacion practicamente nulo, conviene verificar la calidad antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-ro-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-ro
- Referencia OPUS-MT (Tiedemann y Thottingal, 2020): EAMT 2020
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- ONNX Runtime: https://onnxruntime.ai/
- optimum (exportacion ONNX): https://github.com/huggingface/optimum
