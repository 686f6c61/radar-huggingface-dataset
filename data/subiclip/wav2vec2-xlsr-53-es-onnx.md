# subiclip/wav2vec2-xlsr-53-es-onnx

## Resumen

`subiclip/wav2vec2-xlsr-53-es-onnx` es una exportación a formato ONNX (fp16) del modelo de reconocimiento automático del habla en español `jonatasgrosman/wav2vec2-large-xlsr-53-spanish`, desarrollado originalmente por Jonatas Grosman sobre el modelo base XLSR-53 de Meta AI. La conversión la firma Subiclip, que lo utiliza en producción para alineación forzada (forced alignment) de audio y transcripciones, es decir, para determinar con precisión el instante en que empieza y termina cada palabra de un texto ya conocido.

El modelo no introduce cambios en los pesos ni en el vocabulario respecto al original: solo cambia el formato. Se exportó con `torch.onnx.export` (opset 17) y se convirtió a fp16 con `onnxruntime.transformers.float16.convert_float_to_float16`, manteniendo entradas y salidas en float32. El resultado es un único archivo `model.onnx` de aproximadamente 631,5 MB que se ejecuta con onnxruntime sin necesidad de PyTorch.

Su relevancia actual radica en que elimina la dependencia del ecosistema PyTorch para una tarea concreta y muy demandada en pipelines de subtitulado, doblaje y anotación fonética: la alineación temporal a nivel de palabra sobre audio en español, con un frame de salida cada 20 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder Transformer) con cabeza CTC |
| Parametros totales | no disponible (modelo base `wav2vec2-large-xlsr-53`, categoría "large") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada; el modelo procesa audio mono a 16 kHz y emite un cuadro cada 20 ms) |
| Tipos de cuantizacion | fp16 (exportación incluida); el original admite cuantización adicional vía onnxruntime |
| Idiomas soportados | español (`es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), archivo `model.onnx` de 631 520 031 bytes; vocabulario en `vocab.json` (41 símbolos) |

## Arquitectura y entrenamiento

La arquitectura es la de Wav2Vec2-large-XLSR-53: un extractor de características convolucional que convierte la onda de audio en una secuencia de representaciones latentes, seguido de un encoder Transformer y una cabeza de clasificación CTC. El modelo original fue preentrenado por Meta AI sobre 53 idiomas (XLSR-53) y posteriormente ajustado por Jonatas Grosman para español con el corpus Common Voice 6.0 de Mozilla. El vocabulario final tiene 41 símbolos, con `<pad>` como blanco de CTC y `|` como separador de palabras.

Esta versión ONNX no se ha reentrenado ni ajustado: reproduce exactamente los pesos del original, exportados desde la revisión `96d7e9b4e4a78af515a3c6d3cee7c0826045d276`. La única transformación técnica es la conversión a fp16 con `keep_io_types=True`, de modo que la interfaz de entrada y salida permanece en float32. La salida son logits de forma `[lote, cuadros, 41]`, un cuadro cada 20 ms, que pueden decodificarse con CTC o usarse directamente para alineación forzada.

## Capacidades

- Reconocimiento automático del habla (ASR) en español mediante decodificación CTC.
- Alineación forzada (forced alignment): dado un audio y su transcripción, localiza el inicio y el fin de cada palabra.
- Generación de subtítulos con marcas temporales a nivel de palabra.
- Salida de logits por frame (cada 20 ms) apta para post-procesado fonético o silábico.
- Ejecución con onnxruntime en CPU o GPU, sin dependencias de PyTorch.
- Entrada de audio mono a 16 kHz normalizada (media 0, desviación 1).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo acústico puro.

## Casos de uso

- Subtitulado palabra por palabra: usando la transcripción existente y los logits CTC, se obtienen marcas temporales exactas para cada palabra, adecuadas para plataformas de vídeo que requieren subtítulos sincronizados.
- Doblaje y localización: la alineación forzada permite ajustar el ritmo de una locución a un texto traducido, detectando la duración real de cada segmento del audio original.
- Anotación de corpus lingüísticos: investigadores pueden alinear transcripciones con audio para construir datasets fonéticos o prosódicos con marcas temporales precisas.
- Verificación de transcripciones: comparar la transcripción de referencia con la salida del modelo para detectar discrepancias o segmentos mal transcritos.
- Pipelines de accesibilidad: generación de subtítulos para contenido educativo, institucional o archivos audiovisuales históricos en español.
- Despliegue ligero en entornos sin PyTorch: servicios en contenedores mínimos o entornos edge donde onnxruntime sustituye a un stack completo de deep learning.
- Segmentación de audio por palabras para búsqueda y recuperación: indexar fragmentos de audio por palabra y permitir búsquedas con salto temporal exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo fp16 ocupa unos 631 MB; en ejecución conviene reservar aproximadamente 1,5-2 GB de memoria para pesos, activaciones y buffers de onnxruntime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es pequeño para los estándares actuales.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU mediante `CPUExecutionProvider`.
- Opciones de despliegue: onnxruntime (CPU o CUDA), integrable en servicios Python; también puede ejecutarse dentro de pipelines de Hugging Face `transformers` cargando el ONNX con `optimum`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `subiclip/wav2vec2-xlsr-53-es-onnx` | no disponible (large) | no disponible | es | Apache 2.0 | ONNX fp16 |
| `jonatasgrosman/wav2vec2-large-xlsr-53-spanish` | no disponible (large) | no disponible | es | Apache 2.0 | PyTorch (safetensors/bin) |
| `facebook/wav2vec2-large-xlsr-53` | no disponible (large) | no disponible | 53 idiomas | Apache 2.0 | PyTorch |

La diferencia principal frente al original de Grosman es el formato (ONNX fp16 frente a PyTorch) y la ausencia de dependencia de PyTorch; los pesos y el vocabulario son idénticos. Frente a XLSR-53 sin ajustar, este modelo está especializado en español y ofrece mejor precisión en esa lengua, a costa de no cubrir los otros 52 idiomas del modelo base.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en español; no es multilingüe.
- No se ha reentrenado ni ajustado: hereda los sesgos y errores del modelo original de Grosman.
- Riesgo de alucinación en la decodificación CTC sobre audio con ruido, acentos no representados en Common Voice o solapamiento de hablantes.
- La alineación forzada requiere una transcripción previa; no genera transcripciones fiables por sí sola en todos los dominios.
- El rendimiento puede degradarse con audio de mala calidad, sample rate distinto de 16 kHz o canales múltiples sin preprocesar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el modelo original de Grosman y respetar los créditos a Meta AI y Mozilla Common Voice.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de validación independiente de esta exportación concreta.
- No incluye tokenizador de texto ni pipeline completo: solo el modelo acústico y el vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subiclip/wav2vec2-xlsr-53-es-onnx
- Modelo original ajustado al español: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-spanish
- Modelo base XLSR-53 de Meta AI: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset Common Voice 6.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_6_0
- Sitio de Subiclip: https://subiclip.com
- Contacto del conversor: soporte@subiclip.com
