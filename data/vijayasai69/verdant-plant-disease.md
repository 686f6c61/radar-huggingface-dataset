# vijayasai69/verdant-plant-disease

## Resumen

verdant-plant-disease es un modelo de clasificación de imágenes basado en un fine-tuning de google/vit-base-patch16-224-in21k, el Vision Transformer base preentrenado en ImageNet-21k. Lo publica el usuario vijayasai69 en Hugging Face y su propósito declarado es la detección de enfermedades en plantas a partir de imágenes, aunque la model card no documenta el conjunto de datos de entrenamiento ni las clases de salida. Con 85.828.647 parámetros, se trata de un ViT-Base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) adaptado a una tarea de clasificación concreta.

El modelo es relevante como ejemplo de pipeline de fine-tuning reproducible: la model card se generó automáticamente con el Trainer de Transformers e incluye hiperparámetros completos (learning rate 5e-05, batch size 8, 3 épocas, AdamW con betas 0,9/0,999, scheduler lineal, seed 42). El autor reporta una accuracy de validación de 0,9982 y una loss de 0,0100 tras 18.714 pasos de entrenamiento, cifras que deben interpretarse con cautela al no especificarse el dataset ni el protocolo de evaluación.

Por su tamaño y arquitectura, el modelo es ligero y desplegable en hardware modesto, lo que lo hace atractivo para prototipos de diagnóstico fitosanitario en el borde (edge) o en aplicaciones móviles. Sin embargo, la ausencia de documentación sobre clases, datos y limitaciones reduce su utilidad directa en producción sin una validación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224) |
| Parámetros totales | 85.828.647 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/Transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer base con parches de 16x16 píxeles y resolución de entrada de 224x224, heredada de google/vit-base-patch16-224-in21k. El preentrenamiento original de ese checkpoint se realizó sobre ImageNet-21k, y este modelo lo afina para una tarea de clasificación de imágenes no especificada, presumiblemente relacionada con enfermedades de plantas. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos, regularización adicional o RLHF (no aplicable en un clasificador de visión).

Los hiperparámetros de fine-tuning sí están documentados: 3 épocas, batch size de 8 en entrenamiento y evaluación, learning rate de 5e-05 con scheduler lineal, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, semilla 42. El entrenamiento alcanzó 18.714 pasos, lo que sugiere un conjunto de datos de aproximadamente 49.900 imágenes de entrenamiento (18.714 pasos × 8 imágenes por paso / 3 épocas). No se declara ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.); es un fine-tuning estándar de clasificación supervisada.

## Capacidades

- Clasificación de imágenes en clases predefinidas (el número y nombre de clases no está documentado en la model card).
- Detección de enfermedades en plantas, según el nombre del modelo y su propósito implícito.
- Extracción de características visuales mediante el encoder ViT subyacente, reutilizable para otras tareas de visión.
- No soporta tool calling ni function calling (es un clasificador de imágenes, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales.
- Compatible con la pipeline `image-classification` de Transformers y con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Diagnóstico fitosanitario en campo: integrado en una aplicación móvil, el modelo puede clasificar una foto de hoja o planta y devolver la clase de enfermedad detectada, gracias a su tamaño reducido (85,8 M de parámetros) que permite inferencia en dispositivos con poca VRAM.
- Triaje automatizado en invernaderos: desplegado sobre cámaras fijas, permite monitorizar cultivos y alertar al agricultor cuando se detecta una clase asociada a patología, reduciendo la necesidad de inspección manual.
- Preetiquetado de datasets agrícolas: usar el modelo como anotador automático para acelerar la construcción de corpus etiquetados, revisando posteriormente las predicciones de baja confianza.
- Investigación en visión por computador aplicada a agricultura: sirve como baseline de fine-tuning sobre ViT-Base para comparar con arquitecturas más específicas (EfficientNet, ConvNeXt, Swin) en tareas de fitopatología.
- Prototipado rápido en entornos con recursos limitados: al ser un ViT-Base, cabe en GPUs de consumo (por ejemplo, RTX 3060/4060 con 8-12 GB) y permite iterar sobre umbrales y clases sin infraestructura dedicada.
- Educación y demos: ejemplo didáctico de pipeline completo de fine-tuning con el Trainer de Transformers, útil para talleres sobre clasificación de imágenes y despliegue con la pipeline `image-classification`.
- Filtrado previo en líneas de inspección: como primera etapa de un sistema de control de calidad agrícola, descartando imágenes sanas antes de un análisis más costoso.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación, sin especificar el dataset ni el número de clases:

| Métrica | Valor |
|---|---|
| Loss de validación (época 3) | 0,0100 |
| Accuracy de validación (época 3) | 0,9982 |
| Loss de validación (época 2) | 0,0146 |
| Accuracy de validación (época 2) | 0,9964 |
| Loss de validación (época 1) | 0,0147 |
| Accuracy de validación (época 1) | 0,9969 |

Evolución del entrenamiento:

| Época | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1,0 | 6.238 | 0,0454 | 0,0147 | 0,9969 |
| 2,0 | 12.476 | 0,0200 | 0,0146 | 0,9964 |
| 3,0 | 18.714 | 0,0056 | 0,0100 | 0,9982 |

El model-index del autor está vacío (`results: []`), por lo que no se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares. Las cifras anteriores corresponden únicamente al conjunto de validación interno del autor y no son directamente comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 343 MB solo para pesos (85,8 M × 4 bytes), más activaciones y overhead; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 172 MB para pesos, con un consumo total por debajo de 1 GB incluyendo activaciones.
- VRAM estimada en INT8: aproximadamente 86 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4, L4, A10G, A100 y H100 son sobradamente suficientes. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline `image-classification` de Transformers, Hugging Face Inference Endpoints (tag `endpoints_compatible`), TorchServe, ONNX Runtime tras exportación, y servidores de inferencia genéricos compatibles con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vijayasai69/verdant-plant-disease | 85,8 M | Imagen 224x224 | Accuracy 0,9982 en validación interna (dataset no especificado) | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 85,8 M | Imagen 224x224 | Preentrenado en ImageNet-21k; métricas downstream dependen del fine-tuning | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 | 85,8 M | Imagen 224x224 | Fine-tuning en ImageNet-1k (top-1 ~81,6 % según la model card de Google) | Apache 2.0 | Hugging Face |
| facebook/deit-base-patch16-224 | 86,6 M | Imagen 224x224 | Fine-tuning en ImageNet-1k (top-1 ~83,4 % según la model card de Meta) | Apache 2.0 | Hugging Face |

La comparación directa con estos modelos no es homogénea: verdant-plant-disease está afinado para una tarea específica no documentada, mientras que los otros son checkpoints generalistas con métricas públicas en ImageNet. No se dispone de una comparación en el mismo dataset de fitopatología.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el número de clases, los nombres de las clases ni el origen de las imágenes, lo que impide evaluar su generalización a dominios distintos.
- La accuracy de 0,9982 puede reflejar un conjunto de validación poco diverso o con fuga de datos respecto al de entrenamiento; no se especifica el protocolo de partición.
- Riesgo de alucinación y de falsos positivos/negativos en clases poco representadas: al no conocerse la distribución del dataset, no es posible estimar el rendimiento por clase.
- No se documentan sesgos conocidos; sin embargo, un modelo entrenado con imágenes de un entorno concreto puede fallar ante variaciones de iluminación, fondo, cámara o especie vegetal.
- Limitación idiomática no aplicable (modelo de visión), pero la ausencia de metadatos sobre las clases limita su uso directo en producción sin una inspección del `config.json` y del mapeo de etiquetas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre la idoneidad del modelo para decisiones agronómicas.
- No debe utilizarse como único criterio para decisiones de tratamiento fitosanitario sin validación agronómica y revisión humana.
- El model-index vacío y la falta de benchmarks públicos impiden comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vijayasai69/verdant-plant-disease
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper de Vision Transformer (ViT): https://arxiv.org/abs/2010.11929
- Documentación de la pipeline image-classification de Transformers: https://huggingface.co/docs/transformers/main/en/tasks/image_classification
- Documentación del Trainer de Transformers: https://huggingface.co/docs/transformers/main/en/main_classes/trainer
