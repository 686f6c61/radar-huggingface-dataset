# timm/qwen3_vit_416m_merge.qwen3_5_9b

## Resumen

`timm/qwen3_vit_416m_merge.qwen3_5_9b` es un codificador de características de imagen extraído del modelo multimodal Qwen3.5-9B y reempaquetado con la librería timm por Ross Wightman (perfil `timm`). No es un modelo generativo ni un modelo de lenguaje: es únicamente la torre de visión de Qwen3.5-9B, convertida a un mapeo nativo de timm, con 455.125.744 parámetros, sin entrenamiento adicional y sin pesos del modelo de lenguaje. Su función es producir embeddings de imagen y mapas de características espaciales listos para tareas de visión por computador.

El checkpoint conserva el merger espacial nativo y la proyección al ancho del LLM (1152 de ancho de backbone, 4096 de ancho de proyección), seguidos de *average pooling* y una LayerNorm sin parámetros afines. La entrada de referencia es de 768×768 píxeles, con un coste de 1303,2 GMACs y 2998,6 M de activaciones por pasada. Al no incluir cabeza de clasificación entrenada, está pensado como extractor de características congelado o como punto de partida para *fine-tuning*.

Su relevancia actual es doble: por un lado permite reutilizar la torre de visión de un VLM de gran tamaño (Qwen3.5-9B) de forma aislada y ligera (1,8 GB de repositorio) para tareas de visión; por otro, sirve como pieza de sustitución en arquitecturas multimodales que necesiten un encoder compatible con la proyección de Qwen3.5 sin cargar los 9B parámetros del modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (transformer de visión) con merger espacial nativo; backbone de Qwen3.5-9B remapeado a timm |
| Parámetros totales | 455.125.744 (455,1 M) |
| Longitud de contexto | no disponible (modelo de visión; la rejilla de tokens depende del tamaño de entrada) |
| Tipos de cuantización | no disponible (no se publican checkpoints cuantizados; solo safetensors) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,8 GB, compatible con FP32) |

Datos adicionales declarados por el autor: GMACs 1303,2; activaciones 2998,6 M; tamaño de imagen 768×768; ancho de backbone 1152; ancho de proyección 4096; dimensión del embedding de imagen 4096; 576 tokens espaciales proyectados (NLC) para 768×768 con merger 2×2.

## Arquitectura y entrenamiento

Se trata de un transformer de visión con MLP de activación GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial. Las posiciones absolutas se interpolan para la rejilla de entrada y el RoPE se regenera en cada tamaño, por lo que el modelo admite entradas rectangulares siempre que cada dimensión sea divisible por 16 (y por 32 en las variantes con merger 2×2). La entrada temporal original (Conv3d) se colapsa: se repite un único fotograma a lo largo del kernel temporal y los pesos del Conv3d se suman en un Conv2d, de modo que la implementación resultante es exclusivamente de imagen.

El checkpoint es un remapeo nativo de los pesos de visión originales, **sin entrenamiento adicional**, sin pesos de lenguaje y sin cabeza de clasificación entrenada. No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset ni sobre fases de RLHF/DPO para esta torre, ya que el autor no aporta esa información y se limita a referenciar el blog de Qwen3.5 y el repositorio de timm. Dos detalles de implementación relevantes: la normalización de timm usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`; y `forward_features()` devuelve tokens NLC proyectados por el merger nativo, mientras que `encoder.forward_features()` devuelve características NHWC crudas del backbone.

## Capacidades

- Extracción de embeddings globales de imagen: `model(x)` devuelve un vector de 4096 dimensiones por imagen.
- Extracción de características espaciales: `model.forward_features(x)` devuelve una matriz de 576×4096 tokens (NLC) para entradas de 768×768.
- Extracción de mapas de características intermedios: `forward_intermediates(..., output_fmt='NCHW')` permite obtener, por ejemplo, tensores de forma (1, 1152, 48, 48) para tareas densas.
- Clasificación mediante *fine-tuning*: al instanciar el modelo con `num_classes=N` se añade una cabeza lineal inicializada aleatoriamente que debe entrenarse con el dataset objetivo.
- Soporte de entradas rectangulares con la única restricción de divisibilidad por 16 (o 32 con merger 2×2).
- No dispone de *tool calling*, generación de texto, razonamiento, matemáticas, capacidades multilingües, agentes ni modo de pensamiento: no contiene pesos de lenguaje.
- No incluye visión-a-texto, OCR ni generación de descripciones: es un encoder puro.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: los embeddings de 4096 dimensiones permiten indexar un corpus de imágenes en una base vectorial y resolver consultas por similitud coseno sin entrenar nada.
- Clasificación de imágenes por *fine-tuning*: se instancia el modelo con `num_classes` igual al número de clases del dominio (por ejemplo, 45 categorías de producto) y se entrena únicamente la cabeza lineal, aprovechando las características ya aprendidas por la torre de Qwen3.5.
- Segmentación semántica y detección de objetos: los mapas intermedios de forma (1, 1152, 48, 48) sirven como entrada a una FPN o a un decodificador denso, con 48×48 posiciones espaciales a resolución 768×768.
- Deduplicación y curación de datasets: agrupar millones de imágenes por similitud de embeddings para eliminar duplicados y filtrar datos antes de entrenar otros modelos.
- Recomendación visual en comercio electrónico: comparar la imagen de consulta del usuario con el catálogo mediante vecinos más cercanos para sugerir productos visualmente similares.
- Control de calidad industrial: *fine-tuning* con pocas clases (pieza correcta / defectuosa por tipología) sobre imágenes de línea de producción, con entradas rectangulares que se adaptan a sensores de distinta relación de aspecto.
- Reutilización en pipelines multimodales: emplear la torre de visión nativa de Qwen3.5-9B como encoder independiente cuando ya existe un *stack* alineado con la proyección de 4096 dimensiones, evitando cargar el modelo completo de 9B.
- Imagen médica o teledetección: extracción de características para clasificación con pocas etiquetas (k-NN o prototipos) en dominios donde el etiquetado es caro.
- Preprocesado para *few-shot learning*: usar los embeddings congelados como entrada a clasificadores lineales o modelos de similitud episódicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de ImageNet, zero-shot, segmentación ni recuperación, ni comparaciones numéricas con otros encoders. Los únicos datos de rendimiento declarados son de coste computacional: 1303,2 GMACs y 2998,6 M de activaciones para una imagen de 768×768.

## Requisitos de hardware

- Memoria de pesos: 455,1 M de parámetros equivalen aproximadamente a 1,82 GB en FP32 (coincide con el tamaño de repositorio de 1,8 GB), unos 910 MB en BF16/FP16, unos 455 MB en INT8 y unos 228 MB en INT4.
- Coste computacional: 1303,2 GMACs por imagen a 768×768, es decir, del orden de 2,6 TFLOPs por inferencia. El cuello de botella es el cómputo, no la memoria de pesos.
- GPU recomendadas: A100 o H100 para procesado por lotes a gran escala; L40S, A10G o RTX 4090 para *fine-tuning* y lotes moderados.
- GPU de consumo: sí cabe en cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090). A 768×768 y con lotes grandes, las activaciones, no los pesos, son el factor limitante.
- Despliegue: vía `timm.create_model('hf-hub:timm/qwen3_vit_416m_merge.qwen3_5_9b', pretrained=True)` con `timm.data` para el preprocesado; exportación manual a ONNX o TensorRT. No hay soporte nativo en vLLM ni en TGI, ya que no es un modelo de lenguaje, y no se publica ningún archivo GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| timm/qwen3_vit_416m_merge.qwen3_5_9b | 455,1 M | Imagen 768×768, entradas divisibles por 16 | Apache 2.0 | HuggingFace, vía timm |
| Qwen/Qwen3.5-9B (modelo original) | 9B (aproximado por nombre) | Multimodal completo, texto e imagen | Apache 2.0 | HuggingFace |
| CLIP ViT-L/14 | no disponible en la información proporcionada | Imagen 224×224 en configuración estándar | no disponible en la información proporcionada | no disponible en la información proporcionada |
| DINOv2 ViT-L/14 | no disponible en la información proporcionada | Imagen 224×224 o mayor, autoconsistente | no disponible en la información proporcionada | no disponible en la información proporcionada |
| SigLIP SO400M | no disponible en la información proporcionada | Imagen 384×384 en configuración estándar | no disponible en la información proporcionada | no disponible en la información proporcionada |

La búsqueda web realizada no devolvió información técnica relevante sobre este checkpoint ni sobre encoders comparables (los resultados obtenidos eran páginas de soporte de Windows y de atención al cliente, sin relación con el modelo), por lo que los datos de los modelos alternativos no se han podido verificar y se marcan como no disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no hace *tool calling* ni razonamiento multi-paso. Cualquier uso conversacional es inviable con este checkpoint.
- No incluye cabeza de clasificación entrenada. Si se instancia con `num_classes`, la cabeza se inicializa aleatoriamente y hay que entrenarla; sin ese entrenamiento las salidas de clasificación no tienen significado.
- El repositorio no declara el *dtype* de los pesos más allá del tamaño (1,8 GB, coherente con FP32); conviene verificar la precisión antes de desplegar para evitar degradaciones por conversión.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de representaciones poco fiables si se usa fuera de la distribución de datos de visión con la que se entrenó la torre original de Qwen3.5.
- Sesgos: el autor no publica información sobre la composición del dataset de entrenamiento de la torre original, por lo que no es posible caracterizar sesgos de género, etnia, geografía o dominio. Se heredan los del modelo Qwen3.5-9B, sobre el que no se aporta documentación específica en esta ficha.
- Restricciones de tamaño de entrada: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se usa el merger 2×2. Las entradas que no cumplan esta condición requieren *padding* o *resize*.
- Normalización fija: las transformaciones de timm esperan `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`; usar otra normalización degrada las características.
- Licencia: Apache 2.0 según la model card, heredada del modelo original Qwen3.5-9B. Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar el archivo LICENSE del repositorio original vinculado en la model card para confirmar condiciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, y fue creado el 10 de septiembre de 2026, por lo que no hay evidencia de uso en producción ni de validación por terceros.
- Idiomas: no se declara ningún idioma soportado, lo cual es coherente con un modelo que no procesa texto, pero implica que cualquier capacidad multilingüe depende por completo del cabezal o del sistema que se construya encima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m_merge.qwen3_5_9b
- Modelo base (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión concreta del modelo base usada como fuente: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de timm (Zenodo): https://doi.org/10.5281/zenodo.4414861
