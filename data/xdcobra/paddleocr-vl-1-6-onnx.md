# XDcobra/PaddleOCR-VL-1.6-ONNX

## Resumen

PaddleOCR-VL-1.6-ONNX es una exportación a ONNX Runtime del modelo multimodal PaddlePaddle/PaddleOCR-VL-1.6, un VLM especializado en OCR y análisis de documentos desarrollado originalmente por PaddlePaddle. La exportación la mantiene XDcobra y está pensada para su uso en el SDK móvil react-native-sherpa-onnx y en la aplicación VoiceLab, que ofrece herramientas de OCR y voz totalmente offline en Android e iOS. El modelo combina una torre de visión NaViT con un decodificador ERNIE-4.5-0.3B de 18 capas, y el paquete publicado es únicamente FP16 (1,81 GB), ya que el autor descartó las variantes INT8 y 4-bit tras comprobar que entran en bucle o alteran el texto en fotos de cámara con perspectiva.

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de cuantización y validación: el autor documenta con detalle por qué rechaza las recetas más agresivas, comparando token a token contra Transformers en FP32 sobre tres fixtures (página sintética "Hello World", página de OmniDocBench y una foto con distorsión de perspectiva). El resultado es un paquete que reproduce exactamente la salida de referencia en 18 de 18 ejecuciones con los seis prompts de control oficiales (OCR, tablas, fórmulas, gráficos, sellos y spotting).

Es, por tanto, una opción interesante para quien necesite OCR de documentos en dispositivos con recursos limitados y quiera evitar dependencias de Python o de frameworks pesados, a costa de renunciar a la cuantización más agresiva y de limitarse al conjunto de instrucciones soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: torre de visión NaViT + proyector 2×2 + decodificador ERNIE-4.5-0.3B de 18 capas con KV cache |
| Parametros totales | no disponible (modelo base ERNIE-4.5-0.3B en el decodificador; total del VLM no indicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el tokenizer tiene 103.424 filas; no se especifica ventana máxima) |
| Tipos de cuantizacion | Solo FP16 publicado; INT8 y Q4F16 medidos y rechazados (no publicados) |
| Idiomas soportados | no disponible (la model card no lista idiomas; se menciona colapso cirílico→latino en exports INT8 de terceros) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tres grafos: `vision_encoder.onnx`, `embedding.onnx`, `decoder.onnx`) + tokenizer y processor |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base PaddleOCR-VL-1.6: un VLM con torre de visión NaViT que procesa `pixel_values` junto con `image_grid_thw`, un proyector 2×2 que mapea las features visuales al espacio del decodificador, y un decodificador ERNIE-4.5-0.3B de 18 capas con caché KV. La exportación ONNX se organiza en tres grafos separados (visión, embeddings y decodificador) más un tokenizer de 103.424 entradas y los ficheros de preprocesado oficiales de NaViT. No se incluye PP-DocLayout: el paquete es "VLM-only", es decir, no realiza detección de layout de página, solo comprensión de la imagen completa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta exportación es el proceso de validación: el autor compara la salida greedy en CPU de ONNX Runtime contra Hugging Face Transformers 4.57 en FP32, exigiendo coincidencia token a token. El paquete FP16 logra 18/18 coincidencias exactas con los seis prompts de control y una cobertura de layout de 0,984 en la página de OmniDocBench, además de 64/64 tokens exactos en la foto con distorsión de perspectiva. Las recetas INT8 y Q4, pese a reducir el tamaño hasta 1,24 GB, se descartan porque el decodificador entra en bucle (`-T-T-T…`) en la foto deformada.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos completos.
- Reconocimiento de tablas, con preservación de estructura y celdas.
- Reconocimiento de fórmulas matemáticas.
- Reconocimiento de gráficos.
- Reconocimiento de sellos.
- Spotting (localización de texto en la imagen).
- Generación de texto a partir de imagen (pipeline `image-text-to-text`).
- Procesamiento offline en dispositivo (Android/iOS vía react-native-sherpa-onnx).
- Soporte de seis prompts de control oficiales: `OCR:`, `Table Recognition:`, `Formula Recognition:`, `Chart Recognition:`, `Seal Recognition:` y `Spotting:`.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados en móvil: el paquete FP16 mantiene la cobertura de layout en 0,984 sobre páginas de OmniDocBench y reproduce el encabezado y las tablas, lo que permite extraer texto estructurado de facturas, informes y apuntes sin conexión.
- OCR de documentos fotografiados con perspectiva: es el punto fuerte frente a alternativas, ya que el FP16 logra 64/64 tokens exactos en una foto con distorsión de perspectiva, mientras que INT8 y Q4 colapsan; útil para escanear con la cámara del teléfono.
- Extracción de tablas en informes financieros o científicos: el prompt `Table Recognition:` permite recuperar tablas con sus celdas y cabeceras, adecuado para pipelines de análisis de datos documentales.
- Procesamiento de fórmulas en artículos técnicos: el prompt `Formula Recognition:` convierte ecuaciones de PDFs o capturas en texto estructurado, útil para bases de conocimiento matemáticas.
- Reconocimiento de sellos en documentos administrativos: el prompt `Seal Recognition:` permite detectar y transcribir sellos en contratos o certificados, un caso habitual en gestión documental.
- Aplicaciones móviles offline de accesibilidad: al ejecutarse vía ONNX Runtime en Android e iOS, puede integrarse en apps que lean documentos en voz alta o extraigan texto sin enviar imágenes a la nube, reduciendo riesgos de privacidad.
- Digitalización de gráficos en presentaciones: el prompt `Chart Recognition:` permite extraer la información textual de gráficos en diapositivas, como se valida en la página de OmniDocBench usada en las pruebas.

## Benchmarks y rendimiento

| Prueba | FP16 (publicado) | INT8 (rechazado) | Q4F16 (rechazado) |
|---|---|---|---|
| Hello World: cosine visión / logits | 0,99994 / 0,99984 | 0,985 / 0,913 | 0,99994 / 0,916 |
| Hello World: tokens greedy | 3/3 exactos | 3/3 exactos | 3/3 exactos |
| OmniDocBench: cosine visión / logits | 0,9998 / 0,9988 | 0,982 / 0,907 | 0,9998 / 0,936 |
| OmniDocBench: tokens exactos | 108/128 | 72/128 | 78/128 |
| OmniDocBench: cobertura de layout | 0,984 | 0,952 | 1,00 |
| Foto con warp: cobertura de layout | 1,00 (64/64 exactos) | 0,375 (bucle `-T-T-T…`) | 0,438 (bucle `-`) |
| Paridad de instrucciones (6 prompts × 3 fixtures) | 18/18 idénticas | no publicado | no publicado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son de fidelidad de la exportación respecto a Transformers FP32, no de calidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada: el paquete FP16 ocupa 1,81 GB en disco; la inferencia requiere al menos esa cantidad más los buffers de activaciones, no cuantificada en la información disponible.
- GPU recomendadas: no especificadas; el autor valida en CPU con ONNX Runtime y no usa CUDA como criterio de aceptación.
- Cabe en GPU consumer: previsiblemente sí en cualquier GPU con 4 GB o más de VRAM, aunque no se confirma en la documentación.
- Despliegue: ONNX Runtime (librería principal), integrable en react-native-sherpa-onnx para Android e iOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamaños de las variantes medidas: FP32 local ~3,3 GB (no publicado), FP16 1,81 GB (publicado), INT8 1,24 GB (rechazado), Q4F16 1,30 GB (rechazado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6-ONNX (este) | no disponible (decoder 0,3B) | no disponible | Apache 2.0 | ONNX FP16 | Exportación móvil validada token a token |
| PaddlePaddle/PaddleOCR-VL-1.6 | no disponible (decoder 0,3B) | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base original |
| iaa2005/PaddleOCR-VL-1.6-ONNX | no disponible | no disponible | no disponible | ONNX INT8 | Solo INT8; el autor reporta colapso cirílico→latino y bucles en páginas completas |
| Nemotron-3.5-Parse | no disponible | no disponible | no disponible | no disponible | Citado en la model card como referencia de comparación; sin datos de parámetros |

No se dispone de datos suficientes para comparar rendimiento en benchmarks estándar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se publica FP16; las variantes INT8 y 4-bit se descartaron por bucles y colapso en fotos con perspectiva, por lo que no hay opción de menor tamaño.
- El paquete es "VLM-only": no incluye PP-DocLayout, por lo que no realiza detección de layout de página; la cobertura depende del prompt.
- Solo están soportados los seis prompts de control documentados; otros prompts no han sido validados.
- En la página de OmniDocBench, una celda de tabla recoge un `0` extra y la última fila trunca `-TIS` a `-`; hay pequeñas pérdidas de fidelidad incluso en FP16.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; la mención a colapso cirílico→latino en exports INT8 de terceros sugiere que el multilingüismo puede ser frágil.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base PaddleOCR-VL-1.6 por separado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; es un proyecto reciente y de un único autor, sin validación comunitaria.
- La validación se hizo en CPU con ONNX Runtime; CUDA no forma parte del criterio de aceptación, por lo que el rendimiento en GPU no está garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/XDcobra/PaddleOCR-VL-1.6-ONNX
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Exportación INT8 de terceros (desaconsejada): https://huggingface.co/iaa2005/PaddleOCR-VL-1.6-ONNX
- SDK react-native-sherpa-onnx: https://github.com/XDcobra/react-native-sherpa-onnx
- VoiceLab en Google Play: https://play.google.com/store/apps/details?id=com.xdcobra.voicelab
- VoiceLab en App Store: https://apps.apple.com/us/app/voice-lab-stt-tts-more/id6761100598
- Página del producto VoiceLab: https://xdcobra.github.io/voice-lab-offline-tools/
- Dataset OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench
