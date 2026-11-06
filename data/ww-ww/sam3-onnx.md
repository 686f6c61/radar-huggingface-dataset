# wW-Ww/sam3-ONNX

## Resumen

SAM 3 ONNX es una exportación a formato ONNX del modelo SAM 3 (Segment Anything Model 3) de Meta, orientada a la generación de máscaras de segmentación en imágenes estáticas. El autor del repositorio, wW-Ww, la publica como base para la herramienta Photool y la optimiza específicamente para ejecutarse con el proveedor de ejecución DirectML de ONNX Runtime, lo que permite su uso en cualquier tarjeta gráfica compatible con DirectX 12 en Windows, además de CUDA y CPU. El modelo base es facebook/sam3, un modelo de segmentación promptable que combina un codificador de visión de tipo Perception Encoder con un detector y un tracker.

La relevancia de esta ficha radica en que SAM 3 unifica en una sola lectura de imagen dos modos de selección que antes requerían modelos distintos: prompts por clic o caja (estilo SAM clásico, mediante el tracker) y prompts por texto o palabras (mediante un detector con consultas). La exportación divide el modelo en cuatro grafos ONNX especializados que comparten el mismo codificador visual, reduciendo el coste computacional al ejecutar la visión una sola vez por imagen.

El repositorio ocupa 1,8 GB y se distribuye bajo la SAM License de Meta. No se dispone de información sobre el número de parámetros totales, la longitud de contexto (no aplica en un modelo de visión) ni los idiomas soportados, ya que el modelo procesa texto mediante el tokenizador CLIP y no se documentan capacidades multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perception Encoder (vision) + detector con consultas + tracker promptable; exportada a 4 grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de texto limitada a 32 tokens) |
| Tipos de cuantizacion | fp16 (visión y texto), fp32 (detector); sin cuantización int8 documentada |
| Idiomas soportados | no disponible (texto procesado con tokenizador CLIP, vocabulario openai/clip-vit-base-patch32) |
| Licencia | SAM License (sam-license) |
| Formato de pesos | ONNX (vision_fp16.onnx, text_fp16.onnx, detector.onnx, prompt_encoder_mask_decoder.onnx) |

## Arquitectura y entrenamiento

El modelo es una exportación de los pesos de SAM 3 de Meta en formato `Sam3VideoModel` de Transformers. La arquitectura se descompone en cuatro grafos ONNX que comparten una única pasada del codificador visual. `vision_fp16.onnx` ejecuta el Perception Encoder una vez por imagen y produce tanto las características para el detector (`features_288/144/72`) como los embeddings para el tracker (`image_embeddings.0/1/2`), aplicando las proyecciones `conv_s0`/`conv_s1` y `no_memory_embedding` del tracker tal como hace `Sam3TrackerModel.get_image_embeddings`. `text_fp16.onnx` codifica la frase de prompt (32 tokens con padding) y `detector.onnx` combina características visuales y textuales para producir logits, cajas, máscaras y segmentación semántica con 200 consultas. `prompt_encoder_mask_decoder.onnx` gestiona los prompts de clic o caja y devuelve tres máscaras candidatas de 288² con puntuaciones IoU.

No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones de entrenamiento, ya que se trata de una conversión de pesos, no de un entrenamiento nuevo. La innovación técnica de esta exportación es la separación en grafos para DirectML: se reescriben los `Reshape` con `allowzero=1` y se sustituye un `Slice` sobre un `Concat` en el detector, y se convierte visión y texto a fp16 con entradas y salidas fp32 para que el grafo quepa en una tarjeta de 8 GB. La validación frente al modelo PyTorch fp32 reporta un IoU medio de 0,995 en las máscaras del detector y una desviación relativa L2 de 2,2–2,8 % en los embeddings del tracker.

## Capacidades

- Segmentación de imágenes por clic: el usuario señala un punto y el modelo devuelve tres máscaras candidatas con puntuaciones IoU.
- Segmentación por caja delimitadora: se proporciona un rectángulo y el modelo genera la máscara del objeto contenido.
- Segmentación por texto: se introduce una frase (hasta 32 tokens) y el detector localiza instancias que coincidan, con logits de presencia y cajas.
- Segmentación semántica: el detector produce además una salida `semantic_seg` para la frase consultada.
- Detección de múltiples instancias por frase: el detector emite 200 consultas con cajas y máscaras de 288².
- Umbral de decisión documentado: una instancia se considera encontrada cuando `sigmoid(pred_logits) * sigmoid(presence_logits) > 0.5`.
- Inferencia en GPU con DirectML (DirectX 12), CUDA y CPU mediante ONNX Runtime.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni audio.

## Casos de uso

- Edición fotográfica asistida por clic: en Photool, el usuario hace clic sobre un objeto y el modelo devuelve la máscara en unos 10 ms por clic tras una pasada de visión de 0,4 s en una RTX 3070, lo que permite iterar sobre la selección en tiempo real.
- Recorte por descripción textual: el usuario escribe una frase como el nombre de un objeto y el detector (0,2 s por frase) devuelve cajas y máscaras de todas las instancias coincidentes, útil para lotes de imágenes con objetos repetidos.
- Segmentación semántica en pipelines de visión: la salida `semantic_seg` del detector puede alimentar tareas de etiquetado automático o preanotación de datasets para entrenamiento de otros modelos.
- Anotación de datasets de forma semiautomática: combinar clics y cajas para generar máscaras de alta calidad (IoU 0,995 frente a PyTorch fp32) y revisar solo los casos dudosos, reduciendo el coste de anotación manual.
- Aplicaciones de escritorio en Windows con GPU consumer: al usar DirectML, funciona en cualquier tarjeta DirectX 12, lo que permite integrar segmentación en herramientas nativas sin depender de CUDA.
- Procesamiento por lotes en servidor con CUDA: los grafos ONNX pueden ejecutarse con el proveedor CUDA de ONNX Runtime para segmentar grandes volúmenes de imágenes compartiendo la pasada de visión entre prompts.
- Extracción de objetos para composición o retoque: generar máscaras por caja para aislar sujetos y aplicarlas en flujos de fotomontaje o eliminación de fondos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de segmentación y no de lenguaje. Los únicos datos de rendimiento documentados son medidas de fidelidad y latencia de la exportación:

| Metrica | Valor |
|---|---|
| IoU medio de máscaras del detector vs. PyTorch fp32 | 0,995 |
| Desviacion relativa L2 de embeddings del tracker vs. PyTorch fp32 | 2,2–2,8 % |
| Latencia de vision_fp16.onnx (RTX 3070) | 0,4 s por imagen |
| Latencia de prompt_encoder_mask_decoder.onnx | ~10 ms por clic o caja |
| Latencia de text_fp16.onnx | ~5 ms por frase |
| Latencia de detector.onnx | 0,2 s por frase |

## Requisitos de hardware

- VRAM estimada: el grafo de visión en fp32 llena una tarjeta de 8 GB, por lo que se convirtió a fp16; con fp16 se espera que quepa en GPUs de 8 GB o menos, aunque no se documenta el consumo exacto.
- GPU recomendadas: RTX 3070 (medida de referencia del autor), cualquier GPU con DirectX 12 en Windows para DirectML, GPUs NVIDIA con CUDA para el proveedor CUDA, y CPU como fallback.
- Cabe en GPU consumer: sí, al menos en una RTX 3070 con 8 GB; el detector permanece en fp32 y podría requerir más memoria que la visión.
- Opciones de despliegue: ONNX Runtime con proveedores DirectML, CUDA o CPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: 0,4 s de visión por imagen más ~10 ms por clic o caja, ~5 ms por frase de texto y 0,2 s por frase en el detector, medidos en una RTX 3070.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3 ONNX (este) | no disponible | 32 tokens de texto | imagen 1008×1008 + clic/caja/texto | SAM License | ONNX en Hugging Face |
| facebook/sam3 | no disponible | no disponible | imagen + clic/caja/texto | SAM License | PyTorch en Hugging Face |
| onnx-community/sam3-tracker-ONNX | no disponible | no disponible | imagen + clic/caja | no disponible | ONNX en Hugging Face |
| CardAnvilModels/sam3-ONNX | no disponible | no disponible | imagen + texto | no disponible | ONNX en Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la comparativa se limita a formato, entradas y licencia.

## Limitaciones y advertencias

- Modelo de segmentación, no de lenguaje: no genera texto, no razona y no responde preguntas; su uso fuera de visión no está soportado.
- Entrada de imagen fija a 1008×1008 estirada, lo que puede distorsionar objetos con relaciones de aspecto muy alejadas de la cuadrada.
- Texto limitado a 32 tokens con el tokenizador CLIP; frases largas o vocabulario fuera de `openai/clip-vit-base-patch32` pueden degradar la detección.
- Idiomas soportados no documentados; el comportamiento multilingüe del prompt textual no está verificado.
- Licencia SAM License: es una licencia "other" con términos propios; debe revisarse el archivo LICENSE antes de uso comercial o redistribución.
- El detector permanece en fp32, por lo que el consumo de memoria puede superar el de la visión en fp16.
- Fidelidad no exacta: desviación de 2,2–2,8 % en embeddings del tracker respecto a PyTorch fp32, relevante en aplicaciones que requieran precisión submétrica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento continuado.
- Riesgo de alucinación en el sentido de detección de instancias inexistentes: el umbral documentado (`sigmoid(pred_logits) * sigmoid(presence_logits) > 0.5`) debe calibrarse según el dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wW-Ww/sam3-ONNX
- Modelo base: https://huggingface.co/facebook/sam3
- Repositorio SAM 3 de Meta: https://github.com/facebookresearch/sam3
- Herramienta Photool: https://github.com/FoRJu/Photool
- Exportación de referencia del detector y texto: https://huggingface.co/CardAnvilModels/sam3-ONNX
- Exportación del tracker: https://huggingface.co/onnx-community/sam3-tracker-ONNX
- Tokenizador CLIP: https://huggingface.co/openai/clip-vit-base-patch32
