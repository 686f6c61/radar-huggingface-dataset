# timm/vit_5b_patch16_sapiens2.fb

## Resumen

El modelo `timm/vit_5b_patch16_sapiens2.fb` es un remapeo nativo en `timm` (EVA) de `facebook/sapiens2-pretrain-5b`, el backbone más grande de la familia Sapiens2, desarrollado por Meta. Se trata de un vision transformer preentrenado sobre 1.000 millones de imágenes humanas, diseñado específicamente para tareas centradas en el cuerpo humano: estimación de pose, segmentación de partes del cuerpo, normales de superficie y pointmaps. El modelo produce características densas por parche sobre imágenes de alta resolución (1024 × 768), lo que lo hace especialmente adecuado como punto de partida para el fine-tuning de cabezas de tarea en visión humana computacional.

El remapeo en `timm` es una conversión de claves de checkpoints a la nomenclatura de `timm`; los pesos no han sido reentrenados y se mantiene la integralidad de la arquitectura original de Sapiens2. Con 5.071 millones de parámetros (5.066.902.976 según los pesos safetensors) y 15,72 TFLOPs, este modelo ofrece un nivel de capacidad alto dentro de su categoría. La licencia aplicable es la Sapiens2 License, y el modelo se distribuye en formato safetensors. Es relevante en el contexto actual por su combinación de escala, resolución y preentrenamiento masivo en datos humanos, lo que permite afrontar tareas de percepción corporal con un rendimiento potencialmente superior al de backbones de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parametros totales | 5.071 B (según model card; 5.066.902.976 según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | No disponible (modelo de visión, no aplica) |
| Licencia | Sapiens2 License |
| Formato de pesos | safetensors |
| Dimension de embedding | 2432 |
| Numero de capas | 56 |
| Cabezas de atencion | 32 |
| Tamano de parche | 16 |
| Resolucion de preentrenamiento | 1024 × 768 (H × W) |
| FLOPs | 15,722 T |
| Tamano del repo | 20,3 GB |

## Arquitectura y entrenamiento

Sapiens2-5B es un vision transformer puro con varias innovaciones modernas: utiliza rotaciones posicionales (RoPE), grouped query attention (GQA) para reducir el coste de atención, activación SwiGLU en las MLPs, normalización RMSNorm y QK-norm (normalización de las proyecciones de consulta y clave) para estabilizar el entrenamiento. El preentrenamiento se realizó sobre 1.000 millones de imágenes humanas a alta resolución (1024 × 768), lo que permite que el modelo capture detalles corporales finos. No se aplicó RLHF ni DPO, ya que no es un modelo de lenguaje, y no se ha realizado ningún fine-tuning posterior en este checkpoints; se publica como backbone de características preentrenado.

El remapeo en `timm` utiliza la numeración de capas y claves propias de la librería. El modelo expone un token CLS y tokens de registro (register tokens), que se pueden excluir al extraer características de parche mediante `model.num_prefix_tokens`. La implementación permite utilizar tanto pooling CLS (por defecto, coincidiendo con la convención de Sapiens2) como average pooling sobre los parches. La arquitectura de Sapiens2 está pensada para producir características densas por parche, listas para ser afinadas en tareas de visión humana específicas.

## Capacidades

- Extracción de características densas por parche de imágenes humanas, con salida de tokens de alta dimensión (2432 canales de embedding).
- Diseñado para fine-tuning en tareas human-centric: estimación de pose, segmentación de partes del cuerpo, normales de superficie y pointmaps.
- Soporta imágenes de alta resolución de hasta 1024 × 768 píxeles, lo que proporciona detalles espaciales finos.
- Compatible con la librería `timm` (creación del modelo con `timm.create_model`) y con el ecosistema Hugging Face Transformers.
- Permite seleccionar entre pooling CLS y pooling medio sobre los parches, según la convención de la tarea.
- No es un modelo generativo: no produce texto, código ni imágenes. Tampoco soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Estimación de pose humana: el backbone se puede afinar con una cabeza de regresión de keypoints sobre las características de parche, logrando una localización precisa de articulaciones incluso con oclusiones gracias al preentrenamiento en 1.000 millones de imágenes humanas.
- Segmentación semántica de partes del cuerpo: aplicación en análisis de ropa, para identificar y clasificar prendas, o en biomecánica, para delimitar segmentos corporales en imágenes de alta resolución.
- Modelado de normales de superficie: permite reconstruir la orientación de la piel y la ropa en imágenes 2D para tareas de relighting o reiluminación en gráficos por computador.
- Reconstrucción 3D humana a partir de pointmaps: las features del modelo se pueden utilizar para estimar mapas de correspondencias entre imágenes y recuperar geometría 3D de personas.
- Transfer learning para nuevas tareas de visión humana: sirve como inicialización de cualquier cabeza de tarea personalizada centrada en el cuerpo, reduciendo la cantidad de datos anotados necesarios.
- Análisis de vídeo de personas: extracción de características de cada frame para seguimiento, detección de anomalías o análisis de actividad en entornos de vídeo, aprovechando la alta densidad de features.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones en conjuntos de datos como COCO, MPII o Human3.6M. Únicamente se proporcionan datos de complejidad (15,722 TFLOPs y 5.071 millones de parámetros) y de resolución de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 20,3 GB. En FP16/BF16 alrededor de 10,1 GB. Con cuantización de 8 bits, unos 5 GB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: para explotar la resolución completa de 1024 × 768, se recomiendan GPUs con al menos 40 GB de VRAM, como la A100 (40/80 GB) o la H100 (80 GB). Con la RTX 4090 (24 GB) se puede trabajar en FP16 para resolución reducida (por ejemplo, 512 × 384) con margen limitado para activaciones.
- Puede ejecutarse en GPUs de consumidor con cuantización, pero la elevada dimensión de embedding y las 56 capas generan activaciones considerables.
- Opciones de despliegue: ejecución directa en PyTorch con `timm` o con Hugging Face Transformers. No se recomienda `vLLM`, `llama.cpp` ni `Ollama`, al no ser un modelo de lenguaje. Para producción, se puede servir como extractor de características mediante FastAPI o similar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas | Resolucion de preentrenamiento |
|---|---|---|---|---|---|---|
| Sapiens2-5B (este) | 5,071 B | 15,722 T | 2432 | 56 | 32 | 1024 × 768 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 | 1024 × 768 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 | 1024 × 768 |

La comparativa se limita a los modelos de la familia Sapiens2, ya que no se dispone de datos de rendimiento frente a otros backbones. Sapiens2-5B ofrece una capacidad significativamente mayor en términos de parámetros y FLOPs, lo que lo posiciona como la opción más potente para tareas human-centric dentro de la familia, aunque con un coste computacional proporcionalmente mayor. No se incluyen comparaciones con otros ViT como CLIP o DINOv2 porque carecen de datos publicados en este contexto y no están especializados en contenido humano.

## Limitaciones y advertencias

- No es un modelo generativo: no puede sintetizar imágenes ni lenguaje, solo extraer características.
- Licencia Sapiens2: debe revisarse el texto completo de la licencia antes de un uso comercial para conocer restricciones de redistribución o de uso en productos.
- El preentrenamiento está orientado a imágenes humanas, por lo que puede presentar sesgos hacia determinados tipos de cuerpo, etnias o condiciones de iluminación presentes en su dataset de 1.000 millones de imágenes.
- Se requiere fine-tuning en la tarea concreta; como backbone, no proporciona directamente salidas de pose, segmentación o normales.
- Al ser un modelo de 5B con 56 capas, el coste computacional es alto y puede no ser adecuado para entornos con presupuesto limitado de GPU.
- No se han publicado benchmarks que validen su rendimiento, por lo que la superioridad frente a otros modelos no está documentada.
- La resolución de preentrenamiento (1024 × 768) fija un límite en la resolución de entrada recomendada para obtener características óptimas; resoluciones mayores pueden degradar el rendimiento o agotar la VRAM.

## Enlaces

- HuggingFace (repo): https://huggingface.co/timm/vit_5b_patch16_sapiens2.fb
- Modelo base original: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper (arXiv): https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código fuente: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Colección de modelos Sapiens2: https://huggingface.co/collections/facebook/sapiens2
