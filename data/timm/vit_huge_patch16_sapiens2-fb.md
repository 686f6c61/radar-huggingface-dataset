# timm/vit_huge_patch16_sapiens2.fb

## Resumen

Sapiens2-0.8B es un transformer de visión de alta resolución desarrollado por Meta y preentrenado sobre 1.000 millones de imágenes humanas. El checkpoint `timm/vit_huge_patch16_sapiens2.fb` es un remap nativo realizado por el equipo de timm sobre el backbone original `facebook/sapiens2-pretrain-0.8b`: las claves de los pesos se han convertido a la nomenclatura de timm sin modificar los valores, por lo que el modelo no ha sido afinado y conserva la licencia Sapiens2 de Meta.

Está pensado para tareas centradas en humanos: estimación de pose, segmentación de partes del cuerpo, cálculo de normales de superficie y generación de pointmaps. Su arquitectura es un Vision Transformer con 32 capas, 16 cabezas de atención, dimensión de embedding 1280 y 0.818B parámetros, que procesa imágenes a 1024 × 768 píxeles con parches de 16×16.

La principal utilidad del modelo es servir como backbone preentrenado para fine-tuning en cualquier tarea de visión donde el sujeto sean personas. Al estar alineado con la distribución de imágenes humanas, ofrece características visuales más específicas que los backbones generalistas entrenados en ImageNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parámetros totales | 814.283.520 (0.818 B según la model card) |
| Parámetros activos | No es MoE |
| Longitud de contexto | No aplicable (modelo de visión). Resolución de preentrenamiento: 1024 × 768 píxeles |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (modelo visual) |
| Licencia | Sapiens2 License (licencia propietaria de Meta) |
| Formato de pesos | safetensors (checkpoint timm) |

## Arquitectura y entrenamiento

Sapiens2-0.8B es un Vision Transformer que opera sobre parches de 16×16 píxeles. La arquitectura incluye positional encoding rotatorio (RoPE), grouped-query attention (GQA), bloques feed-forward con activación SwiGLU, normalización por RMSNorm y normalización de las consultas y claves (QK-norm). El modelo consta de 32 capas, 16 cabezas de atención y una dimensión de embedding de 1280. Durante el preentrenamiento, procesa imágenes de 1024 × 768 píxeles y produce características densas por parche junto con un token CLS global.

El preentrenamiento se realizó sobre un conjunto de 1.000 millones de imágenes humanas, en modo pretrain no supervisado. No se ha aplicado RLHF ni DPO, ya que no es un modelo de lenguaje. Este checkpoint concreto es un remap de timm: los pesos se cargan desde el checkpoint original de Meta, pero con las claves renombradas al formato de timm. Por tanto, es funcionalmente equivalente al modelo base a pesar de no ser un fine-tuning adicional.

## Capacidades

- Extracción de características densas por parche (patch tokens y token CLS) para tareas de visión por computador.
- Backbone preentrenado específicamente orientado a contenido humano: cuerpos, partes del cuerpo y rostros.
- Adecuado para fine-tuning en estimación de pose, segmentación de partes del cuerpo, estimación de normales de superficie y generación de pointmaps.
- Integración nativa con timm: puede cargarse con `timm.create_model("hf-hub:timm/vit_huge_patch16_sapiens2.fb", pretrained=True)`.
- Soporta pooling por token CLS (por defecto) o promedio sobre parches (`global_pool="avg"`).
- No incluye capacidades de texto, tool calling, agentes ni generación de imágenes, por tratarse de un modelo de visión puro para extracción de características.

## Casos de uso

- Estimación de pose humana: el backbone extrae características de alta resolución y puede conectarse a una cabeza de regresión de keypoints. Adecuado porque el preentrenamiento con imágenes humanas alinea la representación con la anatomía.
- Segmentación de partes del cuerpo: fine-tuning con una cabeza de segmentación semántica para aplicaciones en moda, fitness, análisis de movimiento o telemedicina. La resolución 1024 × 768 permite capturar detalles finos de la vestimenta y la piel.
- Reconstrucción 3D de personas desde una sola imagen: Sapiens2 incluye soporte downstream para pointmaps y normales de superficie. Este backbone sirve como inicialización para esos módulos.
- Análisis de biomecánica y deporte: extraer características de vídeo a alta resolución para estimar ángulos articulares y trayectorias de movimiento.
- Búsqueda de personas en bases de datos de imágenes: generar embeddings de personas mediante pooling de las características del backbone para sistemas de recuperación, siempre respetando la normativa de protección de datos.
- Investigación en visión humana: utilizar este modelo como base preentrenada para transferir a conjuntos de datos específicos y comparar con backbones generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni comparativas de rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP32 ocupa aproximadamente 3.3 GB; en FP16, alrededor de 1.7 GB. Para activaciones a resolución 1024 × 768 con batch 1, se necesitan al menos 8 GB de VRAM en FP16.
- GPUs recomendadas: RTX 3090/4090, A10G, A100 o superiores. En consumer GPUs de 8 GB es viable en FP16 para batch pequeño.
- Para fine-tuning, se recomiendan al menos 24 GB de VRAM, o el uso de técnicas como LoRA y entrenamiento en FP16/8-bit.
- Opciones de despliegue: uso directo con timm en Python, exportación a ONNX o TensorRT, o integración con Hugging Face Transformers. No es aplicable vLLM ni llama.cpp por no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles sin benchmarking específico en el hardware objetivo.

## Comparativa con modelos similares

La siguiente tabla compara las características estructurales del Sapiens2-0.8B con otros backbones de la misma familia:

| Modelo | Parámetros | FLOPs | Embed dim | Capas | Cabezas | Licencia |
|---|---|---|---|---|---|---|
| Sapiens2-0.8B (este) | 0.818 B | 2.592 T | 1280 | 32 | 16 | Sapiens2 License |
| Sapiens2-0.4B | 0.398 B | 1.260 T | 1024 | 24 | 16 | Sapiens2 License |
| Sapiens2-1B | 1.462 B | 4.715 T | 1536 | 40 | 24 | Sapiens2 License |
| Sapiens2-5B | 5.071 B | 15.722 T | 2432 | 56 | 32 | Sapiens2 License |

No se dispone de métricas de rendimiento (benchmarks) para ninguno de estos modelos, por lo que la comparación se limita a parámetros estructurales.

## Limitaciones y advertencias

- Sesgos potenciales en la representación de personas (tipo de cuerpo, etnia, vestimenta, edad) heredados de un conjunto de preentrenamiento de 1.000 millones de imágenes humanas. No se documentan mitigaciones.
- Riesgo de alucinación no aplicable al ser un modelo de visión, pero puede producir características poco fiables en imágenes que no contengan personas o que estén fuera de la distribución de entrenamiento.
- Restricciones de licencia: la Sapiens2 License es una licencia propietaria de Meta con condiciones específicas. Revisar el texto legal completo antes de cualquier uso comercial o redistribución.
- Este checkpoint es un remap de timm con claves convertidas, no afinado. No incluye cabezas de tarea; el desarrollador debe implementar y entrenar las cabezas de salida.
- El preentrenamiento se realizó a una resolución fija de 1024 × 768. El uso de otras resoluciones puede requerir interpolación de las posiciones y puede degradar el rendimiento sin un ajuste previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/vit_huge_patch16_sapiens2.fb
- Modelo original de Meta: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Repositorio de código: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Colección Sapiens2: https://huggingface.co/collections/facebook/sapiens2
