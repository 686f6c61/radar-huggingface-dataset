# timm/vit_giant_patch16_sapiens2.fb

## Resumen

El modelo `timm/vit_giant_patch16_sapiens2.fb` es un remapeo nativo de timm (estilo EVA) del backbone preentrenado `facebook/sapiens2-pretrain-1b` de Meta. Sapiens2 es una familia de vision transformers de alta resolución entrenados sobre 1.000 millones de imágenes humanas, diseñados como extracción de características densas para tareas de visión centradas en el ser humano, como estimación de pose, segmentación de partes del cuerpo, normales de superficie y pointmaps. Este checkpoint concreto contiene el backbone de 1.462 millones de parámetros (1.455.474.176 parámetros en safetensors) sin ajuste fino, con arquitectura ViT giant de 40 capas, embedding de 1536 dimensiones y 24 cabezas de atención. Su relevancia radica en ser una herramienta de inicialización o extracción de características para investigación y aplicaciones de visión artificial enfocadas en humanos, con integración directa en el ecosistema PyTorch/timm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT giant patch16 (con RoPE, GQA, SwiGLU, RMSNorm y QK-norm) |
| Parametros totales | 1.455.474.176 (1.462 B según model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 × 768 píxeles (resolución de preentrenamiento; no aplica a texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión) |
| Licencia | Sapiens2 License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un vision transformer de estilo Sapiens2, con parche de 16 píxeles, 40 capas, dimensiones de embedding 1536, 24 cabezas de atención y un coste de 4,715 TFLOPs por imagen a resolución 1024 × 768. Incorpora mejoras modernas de arquitectura como rotación de posiciones (RoPE), atención con consultas agrupadas (GQA), normalización RMSNorm, capas SwiGLU y QK-norm. El preentrenamiento se realizó sobre un conjunto de 1.000 millones de imágenes humanas, sin etapa de RLHF ni DPO, con el objetivo de aprender representaciones densas por parche. Este checkpoint es la versión remapeada por timm, lo que significa que las claves de los pesos se han convertido a la nomenclatura de timm y el modelo puede cargarse directamente con `timm.create_model`, manteniendo los mismos pesos que el original de Meta.

## Capacidades

- Extracción de características densas por parche (patch-level features) mediante `forward_features`.
- Generación de tokens de clase (CLS) y tokens de registro (register tokens), excluibles según necesidad.
- Proporciona características transferibles para tareas human-centric: estimación de pose, segmentación de partes del cuerpo, normales de superficie y pointmaps.
- Compatible con el pipeline de `image-feature-extraction` de HuggingFace Transformers y con la biblioteca timm.
- Soporta pooling global por CLS por defecto y pooling medio por parches si se configura `global_pool="avg"` en `create_model`.
- No incluye capacidades de lenguaje, tool calling, agentes ni generación multimodal.

## Casos de uso

- Estimación de pose humana: usar como backbone para cabezas de regresión de keypoints, en aplicaciones de fitness asistido, análisis de ergonomía laboral o captura de movimiento; su alta resolución y entrenamiento en imágenes humanas permiten localizar articulaciones con precisión.
- Segmentación de partes del cuerpo: iniciar modelos de segmentación semántica para moda virtual, realidad aumentada o clasificación de prendas sobre el cuerpo humano, utilizando las características por parche para separar torso, brazos, piernas y rostro.
- Reconstrucción de punto de nubes (pointmaps): emplear las características densas para predecir mapas de puntos 3D del cuerpo en entornos de visión por computador, útil en aplicaciones de biomecánica, medicina deportiva o animación por computador.
- Generación de normales de superficie: inicializar ramas de predicción de normales para relighting fotográfico, renderizado no fotorrealista o edición de iluminación en retratos y escenas con personas.
- Análisis de vídeo deportivo: extraer features de atletas en cada frame para analizar la biomecánica del movimiento, comparar técnicas o detectar patrones de esfuerzo en entrenamientos.
- Inicialización de modelos de representación humana: servir como punto de partida para investigación en visión artificial centrada en personas, reduciendo la cantidad de datos y cómputo necesarios para entrenar nuevos task heads.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas evaluadas en tareas como pose, segmentación, normales o pointmaps.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 5,8 GB. En precisión FP32 se requieren aproximadamente 6 GB de VRAM; en FP16/BF16 la estimación es de unos 3 GB, sin contar activaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para inferencia simple; RTX 4090 o A100/H100 para procesamiento de lotes grandes o imágenes de alta resolución.
- Cabe en GPU de consumo: sí, siempre que se use precisión mixta y se procesen imágenes de una en una o en lotes pequeños.
- Opciones de despliegue: integración directa con timm y PyTorch; se puede servir mediante TorchServe, Triton Inference Server o como parte de pipelines custom. No es un modelo generativo, por lo que vLLM, llama.cpp u Ollama no son aplicables.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | FLOPs | Embed dim | Capas | Cabezas | Resolución de preentrenamiento |
|---|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 | 1024 × 768 |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 | 1024 × 768 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 | 1024 × 768 |
| Sapiens2-1B (este) | 1,462 B | 4,715 T | 1536 | 40 | 24 | 1024 × 768 |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 | no disponible |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 | 1024 × 768 |

Todos los modelos de la familia comparten la misma arquitectura Sapiens2 y la licencia Sapiens2 License. Las diferencias principales son el tamaño, el coste computacional y la profundidad, lo que permite elegir el checkpoint según los recursos disponibles.

## Limitaciones y advertencias

- El modelo ha sido entrenado específicamente con imágenes humanas, por lo que su rendimiento puede degradarse en escenas sin personas o con contenido muy diverso.
- Los datos de preentrenamiento pueden introducir sesgos en tipos de cuerpo, etnia, vestimenta o posturas representadas, lo que afecta a la generalización en poblaciones no representadas.
- Al ser una tarea de extracción de características, no es un modelo generativo y no produce texto ni imágenes, por lo que el riesgo de alucinación no es aplicable en el sentido clásico.
- La licencia Sapiens2 License es personalizada y distinta de las licencias estándar open source; es necesario revisar sus términos antes de cualquier uso comercial o redistribución.
- No se han publicado cuantizaciones oficiales ni soporte para formatos como GGUF, lo que limita su despliegue en entornos de inferencia optimizados para modelos de lenguaje.
- El remapeo timm no ha sido ajustado finamente; solo se han convertido las claves de pesos, por lo que cualquier comparación con el modelo original debe tener en cuenta que los resultados son idénticos salvo el nombre de las capas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/vit_giant_patch16_sapiens2.fb
- Modelo original de Meta: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Repositorio de código: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Colección de modelos Sapiens2: https://huggingface.co/collections/facebook/sapiens2
