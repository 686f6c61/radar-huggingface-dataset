# ukrbublik/opus-mt-en-cs-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-cs-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-cs`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión, ukrbublik, la prepara específicamente para el runtime on-device de la aplicación Android Subtitle Tap, que realiza traducción directa inglés→checo sin pivotar a través de una lengua intermedia.

El modelo mantiene la arquitectura Marian (transformer encoder-decoder) del original, pero se distribuye en formato ONNX (opset 17) con cuantización dinámica INT8 por tensor (QInt8), lo que reduce el peso del repositorio a unos 0,1 GB y permite su ejecución en dispositivos móviles mediante ONNX Runtime. Además, incorpora una salida auxiliar de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decodificador en la capa 2, útil para aplicaciones de subtitulado que necesitan alinear tokens origen y destino.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un avance en calidad de traducción, sino un artefacto de despliegue especializado. Su interés radica en mostrar un patrón de conversión (export ONNX + cuantización INT8 + salida de alineación sin modificar pesos) para llevar modelos OPUS-MT a producción en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (ingles), cs (checo) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-en-cs`, un transformer encoder-decoder de la familia Marian entrenado sobre datos del corpus OPUS, según la atribución recogida en la model card (Tiedemann y Thottingal, 2020). Esta conversión no reentrena ni modifica los pesos: solo cambia el formato. La exportación se realiza con Optimum (opset 17) y se aplica cuantización dinámica INT8 por tensor con ONNX Runtime. El decodificador exportado no utiliza past key/values, lo que implica que la generación se realiza sin caché de atención incremental en el grafo exportado.

La innovación técnica de este artefacto es la salida `alignment_shift_l2`, que expone las probabilidades de atención encoder del decodificador en la capa 2. Según la model card, se trata de una `Identity` sobre un nodo ya existente, de modo que los pesos y el proceso de decodificación permanecen inalterados. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción automática directa inglés→checo, sin pivotar a través de una lengua intermedia.
- Generación de texto condicionada a la traducción (decodificación autoregresiva estándar de Marian).
- Salida auxiliar de alineación de atención (capa 2 del decoder) para mapear tokens origen y destino.
- Ejecución on-device mediante ONNX Runtime con cuantización INT8.
- Tokenizador SentencePiece empaquetado en formato JSON para el runtime de la aplicación.
- No incluye soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap usa el modelo para traducir subtítulos inglés→checo on-device, aprovechando el formato ONNX INT8 y la salida de alineación para sincronizar tokens origen y destino.
- Traducción offline en dispositivos móviles: al pesar ~0,1 GB y ejecutarse con ONNX Runtime, permite traducción sin conexión en teléfonos de gama media.
- Alineación de pares de frases para memorias de traducción: la salida `alignment_shift_l2` facilita construir correspondencias token a token entre original y traducción para herramientas CAT.
- Preprocesado de corpus en pipelines de NLP: traducción rápida de grandes volúmenes de texto inglés a checo en entornos sin GPU, con cuantización INT8 para reducir huella de memoria.
- Prototipado de aplicaciones de accesibilidad: subtítulos traducidos en directo para usuarios checos que consumen contenido en inglés.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar calidad de traducción entre el modelo original y su versión INT8 ONNX en tareas en→cs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; el destino principal es CPU/on-device mediante ONNX Runtime.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (runtime objetivo de la app Subtitle Tap); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-cs-int8-shift-att | no disponible | no disponible | ONNX INT8 | apache-2.0 | Conversion on-device con salida de alineacion |
| Helsinki-NLP/opus-mt-en-cs | no disponible | no disponible | safetensors/PyTorch | apache-2.0 | Modelo original, sin cuantizar |
| Otros modelos OPUS-MT en→cs | no disponible | no disponible | variable | apache-2.0 | Familia Marian; calidad y tamano dependen de la variante |

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda los sesgos y limitaciones del corpus OPUS y del modelo original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, legal, médico) no bien representados en OPUS.
- Solo cubre el par inglés→checo; no soporta otros idiomas ni direccionalidad inversa.
- La exportación sin past key/values puede afectar la eficiencia de decodificación en secuencias largas.
- La salida de alineación es una exposición de atención de la capa 2; su utilidad depende de la aplicación y no garantiza alineaciones perfectas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- Licencia apache-2.0 permite uso comercial, pero conviene citar el trabajo original de OPUS-MT según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-cs-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-cs
- Paper OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible enlace directo en la informacion proporcionada.
