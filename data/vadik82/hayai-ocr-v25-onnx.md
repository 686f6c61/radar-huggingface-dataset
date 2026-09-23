# vadik82/hayai-ocr-v25-onnx

## Resumen

Hayai OCR v2.5 Nova — ONNX es la exportación a ONNX Runtime del modelo de OCR Hayai OCR v2.5 Nova, desarrollado por JustANormalTinkerer y exportado al formato ONNX por el usuario vadik82. Se trata de un modelo image-to-text especializado en reconocimiento de texto en imágenes, con foco en japonés, chino, coreano e inglés, y orientado al caso de uso del OCR de manga, manhwa y webtoon, donde abundan el texto vertical, las tipografías decorativas y los bocadillos sobre fondos ruidosos.

La arquitectura combina un encoder SigLIP2 NaFlex (resolución nativa flexible) con un decodificador transformer de 12 capas y un DSCProjector que aplica un pixel unshuffle 4→1, reduciendo a la cuarta parte el número de tokens de visión respecto a la versión v2.1. El repositorio contiene dos grafos ONNX separados en fp16 (encoder y decoder), el tokenizer y una rejilla base de embeddings posicionales; el pipeline completo exige que el host realice la permutación (unshuffle) de los tokens visuales antes de alimentar el decoder.

Su relevancia práctica está en el despliegue: al distribuirse como grafos ONNX en lugar de pesos PyTorch, el modelo puede ejecutarse con ONNX Runtime en CPU, GPU y entornos web sin depender del ecosistema PyTorch. La licencia Apache-2.0 permite uso comercial, aunque no hay resultados de benchmarks publicados ni métricas de calidad declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SigLIP2 NaFlex + decoder transformer de 12 capas con DSCProjector (pixel unshuffle 4→1) |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB en fp16, lo que situa el modelo en el orden de 10^8 parametros, sin cifra oficial) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la secuencia del decoder es L = M' + N, con M' = ceil(ph/2)·ceil(pw/2) y N la longitud de la secuencia de texto |
| Tipos de cuantizacion | fp16 (grafos incluidos) y fp32 (exportable con export_onnx25.py, con encoder de 256 o 512 parches) |
| Idiomas soportados | en, ja, zh, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (hayai_encoder_fp16.onnx, hayai_decoder_fp16.onnx), tokenizer.json, position_base.npy |
| Dimension de tokens visuales | Encoder: [B, 256, 768] → [B, 256, 768]; decoder: visual_tokens [B, M', 3072] |
| Mascara de atencion | Block-causal sobre L = M' + N; cos/sin calculados sobre la rejilla comprimida |
| Rejilla posicional base | position_base.npy, 16×16×768 |
| Pipeline | image-to-text |
| Tamaño del repositorio | 0,3 GB |
| Entradas del encoder | pixel_values, attention_mask, pos_embeds (identicas a v2.1) |

## Arquitectura y entrenamiento

El modelo es un OCR generativo con encoder de visión SigLIP2 NaFlex, que procesa la imagen a resolución nativa flexible en lugar de redimensionarla a un tamaño fijo. La salida del encoder es un tensor [B, 256, 768] que atraviesa el DSCProjector; el decoder recibe los tokens visuales ya desmezclados (unshuffle en el host) con dimensión 3072, es decir, cuatro parches concatenados por token, de modo que el número de tokens de visión se reduce en un factor de 4 frente a v2.1. La longitud de la secuencia visual del decoder es dinámica y depende de la resolución de entrada según M' = ceil(ph/2)·ceil(pw/2). El decoder tiene 12 capas y utiliza embeddings posicionales construidos a partir de cos/sin sobre la rejilla comprimida, con interpolación desde una rejilla base de 16×16×768.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos ni sobre si hubo ajuste con RLHF, DPO u otra técnica de alineación. La innovación técnica declarada es doble: por un lado, la resolución nativa flexible del encoder NaFlex; por otro, la compresión de la secuencia visual mediante pixel unshuffle, que reduce el coste de atención del decoder. La exportación a ONNX se generó con los scripts export_onnx25.py y bench25.py del repositorio mangosh (ruta distr/models/hayai-ocr-v2.5-nova) y el autor afirma haber verificado la paridad con la referencia PyTorch mediante generate().

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de imagen a texto, con salida de la transcripción directamente desde el decoder.
- Procesamiento de texto CJK: japonés, chino y coreano, además de inglés.
- Manejo de texto vertical y disposiciones propias de manga, manhwa y webtoon, según el caso de uso declarado.
- Entrada a resolución variable gracias al encoder NaFlex, con longitud de secuencia visual adaptada a cada imagen.
- Inferencia por lotes (dimensión B en ambos grafos) y ejecución en fp16 o fp32.
- Ejecución sobre ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling ni function calling: es un modelo image-to-text, no un modelo conversacional ni orientado a agentes.
- No dispone de modo thinking, ni de entrada de audio, ni de capacidades multimodales más allá de imagen a texto.

## Casos de uso

- Digitalización de manga y manhwa: el modelo extrae el texto de cada viñeta para alimentar pipelines de traducción automática, con la ventaja de que el encoder a resolución nativa evita perder caracteres pequeños o verticales al reescalar.
- Traducción de webtoons en producción: integrado como primer paso de un pipeline (OCR → traducción → renderizado de texto sobre la imagen), el grafo ONNX puede desplegarse como microservicio independiente sin arrastrar PyTorch.
- Indexación y búsqueda de archivos escaneados en CJK: al transcribir documentos japoneses, chinos o coreanos, permite construir índices de texto completo sobre repositorios que antes solo eran imágenes.
- Accesibilidad: transcripción de imágenes con texto para alimentar un sintetizador de voz o un lector de pantalla, ejecutable en local sin enviar el contenido a servicios externos.
- OCR en aplicaciones de escritorio y ofimática: al ser ONNX, puede embeberse en una aplicación Windows mediante el proveedor DirectML o en una app de escritorio con onnxruntime en CPU, sin GPU dedicada.
- Procesamiento en el navegador: con onnxruntime-web (WebGPU o WASM) puede ejecutarse del lado del cliente para extraer texto de capturas de pantalla o imágenes subidas, evitando subir el contenido al servidor.
- Extracción de subtítulos incrustados en vídeo: aplicado fotograma a fotograma sobre regiones de subtítulo, permite recuperar texto de series y películas para tareas de archivo o análisis.
- Moderación y catalogación de contenido: transcripción de texto embebido en imágenes para clasificar, etiquetar y auditar grandes volúmenes de material gráfico.
- Preprocesado de datasets multilingües: transcripción masiva por lotes de imágenes con texto en en/ja/zh/ko para construir corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente declara haber verificado la paridad numérica entre los grafos ONNX y la referencia PyTorch generate(), lo cual es una comprobación de equivalencia funcional y no una métrica de calidad de OCR. El repositorio incluye bench25.py, que permite medir latencia y throughput, pero no se publican cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el conjunto de pesos ocupa 0,3 GB en disco en fp16, por lo que se estima una huella en torno a 1 GB de VRAM (pesos, buffers de ONNX Runtime y activaciones) para lotes pequeños y resoluciones moderadas; esta cifra es una estimación, no un dato del autor.
- GPU recomendadas: no hay recomendaciones oficiales. Cualquier GPU con soporte CUDA es suficiente en la práctica dado el tamaño del modelo; modelos de gama media como RTX 3060 o RTX 4060 cubren el caso de uso con holgura, y A100/H100 solo tendrían sentido para servir lotes muy grandes o muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 4 GB de VRAM; también es viable la ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (ejecución en CPU), onnxruntime-gpu con CUDA Execution Provider o TensorRT Execution Provider, DirectML en Windows, y onnxruntime-web con WebGPU o WASM para navegador.
- Latencia y throughput: no disponibles. Se pueden medir con el script bench25.py del repositorio mangosh.
- Nota de despliegue: el pipeline no es de un solo grafo; hay que orquestar encoder y decoder, aplicar la permutación unshuffle en el host y gestionar la mascara block-causal de longitud L = M' + N.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hayai OCR v2.5 Nova — ONNX (este repositorio) | ONNX fp16/fp32 | no disponible | Resolucion nativa (NaFlex), M' dinamico | en, ja, zh, ko | Apache-2.0 | HuggingFace (vadik82) |
| Hayai OCR v2.5 Nova (upstream) | PyTorch | no disponible | Resolucion nativa (NaFlex), M' dinamico | en, ja, zh, ko | Apache-2.0 | HuggingFace (JustANormalTinkerer) |
| Hayai OCR v2.1 | PyTorch | no disponible | Misma interfaz de encoder, sin compresion unshuffle | no disponible | no disponible | no disponible (solo citado en la model card) |
| Otras alternativas de OCR de manga (por ejemplo, manga-ocr o soluciones tipo PaddleOCR) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La diferencia verificable entre este repositorio y las alternativas de la misma familia es el formato: los grafos ONNX evitan la dependencia de PyTorch y habilitan despliegue en CPU, en Windows con DirectML y en navegador. Frente a v2.1, la model card indica que el decoder recibe cuatro veces menos tokens de visión.

## Limitaciones y advertencias

- No se han publicado benchmarks, métricas de precisión ni evaluación comparativa con otros OCR; no hay evidencia pública de calidad más allá de la paridad con la referencia PyTorch.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Es una exportación derivada, no oficial: los grafos ONNX los produce un tercero (vadik82) a partir de los pesos de JustANormalTinkerer. Aunque el autor declara paridad verificada, la responsabilidad del pipeline recae en quien despliega.
- El pipeline no es autocontenido: el host debe aplicar el unshuffle de los tokens visuales, construir cos/sin y gestionar la mascara block-causal, lo que aumenta la superficie de error en producción.
- Riesgo de alucinación: al tratarse de un decoder generativo, puede producir texto plausible en regiones sin texto o con ruido, un comportamiento típico de los modelos OCR generativos.
- Idiomas limitados a inglés, japonés, chino y coreano; no hay soporte declarado para otras lenguas, incluido el español.
- No hay información sobre sesgos, sobre el dataset de entrenamiento ni sobre su procedencia, lo que dificulta evaluar cobertura léxica, dominios o sesgos culturales.
- Licencia Apache-2.0: permite uso comercial y redistribución, incluida la de los grafos derivados, siempre que se conserve la atribución y el aviso de licencia.
- Los pesos fp16 pueden degradar la precisión en caracteres de trazo fino frente a fp32; el autor ofrece la ruta de exportación en fp32 para mitigarlo.
- No es un modelo conversacional: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vadik82/hayai-ocr-v25-onnx
- Modelo upstream (pesos y arquitectura originales, Apache-2.0): https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova
- Repositorio con los scripts de exportación e inferencia de referencia (export_onnx25.py, bench25.py): https://github.com/kva3umoda/mangosh
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo; los resultados obtenidos correspondían a páginas de soporte de Microsoft sin relación con este repositorio.
