# XDcobra/Nemotron-3.5-Parse-ONNX

## Resumen

Nemotron-3.5-Parse-ONNX es una exportación a ONNX Runtime del modelo multimodal nvidia/Nemotron-3.5-Parse, un VLM especializado en OCR y parseo de documentos (detección de layout, bounding boxes, clasificación de regiones y extracción de texto en Markdown o texto plano). Lo publica el desarrollador independiente XDcobra como artefacto listo para inferencia en dispositivo, no como modelo entrenado desde cero: los pesos proceden de NVIDIA y el trabajo aportado es la conversión, cuantización y empaquetado para el runtime ONNX.

El modelo base combina un encoder visual C-RADIOv4-SO400M (ViT de 27 capas con cuello de proyección) y un decodificador causal de 10 capas derivado de mBART con atención GQA y caché KV. El pack incluye dos variantes: FP16 para escritorio (1,44 GB) e INT8 compacta para móvil de gama alta o escritorio ligero (753 MB). El repositorio ocupa 2,2 GB e incluye grafos, tokenizer multilingüe de 72.512 entradas y configuración de preprocesado NaViT/CLIP.

Su relevancia actual es práctica: permite ejecutar OCR estructurado y análisis de layout de documentos de forma totalmente offline en React Native, Android e iOS mediante el SDK react-native-sherpa-onnx y la app VoiceLab. La licencia OpenMDW-1.1 del modelo base condiciona el uso comercial, y el autor documenta con detalle las pérdidas de fidelidad introducidas por la cuantización, un dato poco habitual y útil para decidir qué variante desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM híbrido: encoder visual C-RADIOv4-SO400M (ViT 27 capas + neck) + decodificador causal de 10 capas tipo mBART con GQA y KV cache |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el decodificador usa caché KV; las pruebas usan 16 y 128 tokens generados) |
| Tipos de cuantizacion | FP16 (variante escritorio) e INT8 (visión, decoder, embeddings y lm_head de 8 bits); experimentos locales con Q4 y Q4F16 descartados |
| Idiomas soportados | no disponible (tokenizer multilingüe de 72.512 entradas; el modelo base es multilingüe según mBART) |
| Licencia | OpenMDW-1.1 (pesos); tokenizer MIT según la model card de NVIDIA |
| Formato de pesos | ONNX (onnxruntime) + `pos_embed.npy`; tokenizer en JSON |
| Tamano del pack | FP16: 1,44 GB; INT8: 753 MB; repo total 2,2 GB |
| Pipeline | image-text-to-text |
| Preprocesado | NaViT / CLIP oficial, resolución dinámica vía `navit_pos.py` |

## Arquitectura y entrenamiento

La arquitectura es un VLM de dos torres con decodificador autorregresivo. La torre visual es un ViT C-RADIOv4-SO400M de 27 capas con un neck de proyección; la entrada pasa por un `patch_embed` lineal de 768 a 1152 dimensiones y un campo posicional RADIO de 128×128 gestionado en host (`pos_embed.npy`), lo que mantiene el tamaño de imagen dinámico sin fijar un canvas en el grafo. El decodificador es un transformer causal de 10 capas con atención GQA y caché KV, derivado de mBART, con embeddings escalados y un `lm_head` sobre un vocabulario de 72.512 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base de NVIDIA y no se detallan en la información proporcionada. La innovación destacable de esta exportación es el proceso de compresión documentado: el autor realizó cortes aislados (pos_embed en FP16, embeddings INT8 por fila, lm_head con MatMulNBits de 8 bits) y comprobó que el Q4 en el decodificador elimina la cabecera de página, motivo por el que la variante compacta publicada usa decodificador INT8 en lugar de Q4. También advierte explícitamente de que un grafo visual C-RADIO en 4 bits degrada el coseno del encoder a 0,87–0,91 y altera los tokens de bounding box.

## Capacidades

- OCR y parseo de documentos: extracción de texto en Markdown o texto plano desde imágenes de páginas.
- Detección de layout: emisión de bounding boxes con tokens `<x_...><y_...>` y clasificación de regiones con `<class_...>` (texto, tablas, cabeceras, pies, etc.).
- Perfiles de control mediante tokens especiales: `<no_bbox>`, `<no_classes>`, `<output_markdown>`, `<predict_text_in_pic>`.
- Reconstrucción de tablas y contenido estructurado, incluida salida LaTeX tabular en las pruebas del autor.
- Procesamiento de imágenes con resolución dinámica (preprocesado NaViT/CLIP).
- Inferencia totalmente offline en dispositivo, sin llamadas a servicios externos.
- Multilingüe potencial por el tokenizer mBART, aunque no se documentan idiomas concretos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes en móvil: la variante INT8 (753 MB) permite capturar una foto y extraer texto y estructura de tabla sin conexión, adecuada para técnicos de campo o entornos sin red.
- Escaneo de documentos en apps React Native: integración directa mediante react-native-sherpa-onnx para añadir OCR con detección de layout a aplicaciones Android e iOS existentes.
- Procesamiento por lotes de PDFs escaneados en escritorio: la variante FP16 (1,44 GB) ofrece cobertura de layout de 1,00 en las pruebas del autor, apropiada para pipelines de indexación documental.
- Extracción de tablas para análisis de datos: el modelo emite LaTeX tabular, lo que facilita convertir tablas de informes en estructuras parseables para hojas de cálculo o bases de datos.
- Accesibilidad: lectura en voz alta de documentos físicos capturados con la cámara, combinando el parseo con módulos TTS del mismo SDK.
- Archivística y gestión documental: clasificación de regiones (cabeceras, pies, títulos) para segmentar páginas y alimentar sistemas de gestión documental.
- Aplicaciones de campo con privacidad estricta: al ejecutarse en local, los documentos no salen del dispositivo, lo que encaja en sectores regulados (sanidad, legal, administración).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, OmniDocBench oficial) en la información disponible. El autor publica pruebas de paridad y calidad frente a Hugging Face Transformers 5.14.1 en CPU:

| Prueba | FP16 | INT8 |
|---|---|---|
| Coseno de visión (Hello World) | 0,99997 | 0,963 |
| Coseno de logits (Hello World) | 1,00 | 0,998 |
| Tokens greedy exactos (Hello World) | 9/9 | 9/9 |
| Coseno de visión (OmniDocBench) | 0,9998 | 0,955 |
| Coseno de logits (OmniDocBench) | 1,00 | 0,998 |
| Tokens exactos (OmniDocBench, 128) | 127/128 | bbox + `#` extra |
| Cobertura de layout (OmniDocBench) | 1,00 | 0,978 |
| Cabecera de página recuperada | sí | sí |

Paridad de instrucciones (42 ejecuciones, 14 perfiles × 3 páginas, INT8 frente a HF fp32): 8/42 idénticas en tokens. Solo el perfil `markdown_none_pic` coincide 3/3; los 10 perfiles de boxes y clases obtienen 0/3. El prompt de control recomendado para INT8 es `</s><s><no_bbox><no_classes><output_markdown><predict_text_in_pic>`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pack, la variante FP16 requiere al menos ~2 GB de memoria disponible y la INT8 ~1 GB, sin contar overhead del runtime.
- GPU recomendadas: no especificadas por el autor. El gate de calidad se ejecutó en CPU; CUDA no forma parte de las pruebas de paridad.
- Consumer GPU: por tamaño, ambas variantes caben en GPU de consumo con 4 GB o más; no hay validación publicada en RTX 4090 ni similares.
- Móvil: la variante INT8 está pensada para móvil de gama alta; la FP16 es la opción por defecto en escritorio.
- Opciones de despliegue: ONNX Runtime (librería declarada), react-native-sherpa-onnx para React Native/Android/iOS y la app VoiceLab. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Parse-ONNX (este) | VLM OCR/layout, ONNX | no disponible | OpenMDW-1.1 | Hugging Face, 0 descargas | Optimizado para móvil offline |
| nvidia/Nemotron-3.5-Parse | VLM OCR/layout, pesos originales | no disponible | OpenMDW-1.1 | Hugging Face | Modelo base; requiere Transformers |
| Alternativas OCR VLM de código abierto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Divergencia de tokens frente a HF: solo 8/42 ejecuciones idénticas en la puerta de paridad; los perfiles con bounding boxes y clases no reproducen la salida de referencia en INT8.
- La cuantización INT8 introduce un token extra (`#` de encabezado) y desplaza un bin de bbox en la prueba OmniDocBench.
- Q4 en el decodificador elimina la cabecera de página; por eso se descartó esa variante. Q4 en el encoder visual degrada el coseno a 0,87–0,91 y corrompe los tokens de bbox.
- La puerta de paridad de 14 perfiles no se reejecutó sobre FP16, por lo que su fidelidad en todos los perfiles no está verificada.
- Riesgo de alucinación en texto pequeño o imágenes de baja calidad: no documentado, pero inherente a modelos OCR generativos.
- Idiomas soportados no declarados; el rendimiento multilingüe no está validado.
- Licencia OpenMDW-1.1: revisar los términos antes de uso comercial; el tokenizer es MIT según la model card de NVIDIA.
- Repositorio sin descargas ni likes y mantenido por un autor individual: soporte y mantenimiento no garantizados.
- No se documentan capacidades de tool calling ni de agente, por lo que no debe asumirse su uso en pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XDcobra/Nemotron-3.5-Parse-ONNX
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- SDK React Native: https://github.com/XDcobra/react-native-sherpa-onnx
- VoiceLab en Google Play: https://play.google.com/store/apps/details?id=com.xdcobra.voicelab
- VoiceLab en App Store: https://apps.apple.com/us/app/voice-lab-stt-tts-more/id6761100598
- Página de producto VoiceLab: https://xdcobra.github.io/voice-lab-offline-tools/
- Dataset de referencia OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench
