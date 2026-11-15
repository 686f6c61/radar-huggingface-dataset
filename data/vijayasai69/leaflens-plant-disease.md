# vijayasai69/leaflens-plant-disease

## Resumen

LeafLens es un clasificador de imágenes para la detección de enfermedades y condiciones de hojas de plantas, desarrollado por el usuario vijayasai69 y publicado en Hugging Face. Se trata de un fine-tuning de google/vit-base-patch16-224-in21k, un Vision Transformer (ViT) de 85,8 millones de parámetros con parches de 16x16 píxeles y resolución de entrada de 224x224. El modelo resuelve una tarea de clasificación de imagen única: dada una fotografía, devuelve una etiqueta que combina especie de planta y condición foliar (por ejemplo, hoja sana o síntoma de enfermedad).

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y está empaquetado en formato safetensors compatible con la librería transformers. Su relevancia práctica es acotada: el autor lo presenta explícitamente como una herramienta educativa y de cribado preliminar, no como un sistema de diagnóstico fiable. La model card advierte que la composición del dataset de entrenamiento y el split de evaluación no están documentados, por lo que las métricas reportadas no deben interpretarse como una medida del rendimiento en condiciones reales de jardín o campo.

El checkpoint tiene cero descargas y un único "like" en el momento de la consulta, y el repositorio ocupa 1,0 GB. No se han publicado resultados de benchmarks en la información disponible, y el model-index del autor está vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolución 224x224) |
| Parametros totales | 85.828.647 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión completa; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de salida dependen del dataset de entrenamiento, no documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ViT-Base preentrenado en ImageNet-21k (google/vit-base-patch16-224-in21k) y posteriormente ajustado para clasificación de condiciones de hojas. La arquitectura es un transformer estándar de visión: la imagen de entrada se divide en parches de 16x16 píxeles, se proyectan linealmente y se procesan con bloques de autoatención y MLP. El número de parámetros (85,8 M) coincide con la configuración ViT-Base, lo que confirma que no se ha modificado el backbone, solo la cabeza de clasificación.

El entrenamiento se realizó con el Trainer de transformers durante 3 épocas, con learning rate 5e-05, batch size de 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. La pérdida de validación final fue 0,0100 y la accuracy reportada 0,9982. El autor no documenta el número de tokens ni la composición del dataset (número de imágenes, clases, procedencia, condiciones de captura), ni si hubo aumento de datos o balanceo de clases. Tampoco se indica si se aplicó RLHF, DPO u otra técnica de alineación, algo que no aplica a un clasificador de imagen. La innovación técnica destacable es nula: se trata de un fine-tuning convencional de un ViT preentrenado.

## Capacidades

- Clasificación de imágenes de hojas de plantas en una única etiqueta que combina especie y condición foliar.
- Detección de síntomas visuales de enfermedad y distinción entre hojas sanas y afectadas, según lo descrito en la model card.
- Entrada de imagen a resolución 224x224 con normalización estándar de ViT.
- Integración con la pipeline `image-classification` de transformers.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión multimodal con texto, audio ni generación de lenguaje.
- Capacidades multilingües no aplicables: el modelo no procesa texto.

## Casos de uso

- Demostraciones educativas en talleres de horticultura: el modelo permite mostrar a estudiantes cómo un clasificador de imagen asigna una etiqueta a una foto de hoja, con la advertencia de que la salida es una observación preliminar y no un diagnóstico.
- Cribado preliminar en aplicaciones de jardinería doméstica: integrado en una app móvil, puede sugerir al usuario qué parte de la planta inspeccionar a continuación, siempre acompañado de un aviso de que la predicción debe confirmarse manualmente.
- Etiquetado asistido de imágenes en proyectos de investigación botánica: útil para preclasificar lotes de fotografías antes de la revisión por un experto, reduciendo el trabajo manual inicial.
- Prototipos de sistemas de monitorización de cultivos: como primer filtro en un pipeline que derive las imágenes con mayor probabilidad de síntoma a un modelo o a un agrónomo para revisión.
- Pruebas de concepto de visión por computador en entornos docentes: sirve como ejemplo de fine-tuning de ViT con el Trainer de transformers, con hiperparámetros y curvas de entrenamiento documentadas.
- Benchmark interno de pipelines de clasificación de imagen: al ser un modelo pequeño (85,8 M de parámetros) y con licencia permisiva, puede usarse como línea base en comparaciones de latencia y precisión frente a otros clasificadores.
- Filtrado previo en repositorios de imágenes agrícolas: para separar imágenes de hojas de otras imágenes antes de un procesamiento más costoso.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados. Los únicos datos numéricos publicados son las métricas de validación del propio entrenamiento, que no constituyen un benchmark comparable con otros modelos:

| Metrica | Valor | Epoca |
|---|---|---|
| Training loss | 0,0454 | 1 |
| Training loss | 0,0200 | 2 |
| Training loss | 0,0056 | 3 |
| Validation loss | 0,0147 | 1 |
| Validation loss | 0,0146 | 2 |
| Validation loss | 0,0100 | 3 |
| Accuracy (validación) | 0,9969 | 1 |
| Accuracy (validación) | 0,9964 | 2 |
| Accuracy (validación) | 0,9982 | 3 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aplican a un clasificador de imagen; no hay métricas de imagen como top-1 en PlantVillage ni comparaciones con otros clasificadores).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para los pesos (85,8 M de parámetros x 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16: aproximadamente 0,17 GB para los pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPUs en términos de capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con pipeline `image-classification`, endpoints de Hugging Face (tag `endpoints_compatible`), exportación a ONNX no documentada pero viable por la arquitectura estándar de ViT; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeafLens (este modelo) | 85,8 M | Imagen 224x224 | Clasificación de condición foliar | Apache 2.0 | Hugging Face, 0 descargas |
| google/vit-base-patch16-224-in21k | 85,8 M | Imagen 224x224 | Clasificación de imagen genérica (ImageNet-21k) | Apache 2.0 | Hugging Face, ampliamente usado |
| ViT-Base fine-tuneado en PlantVillage | no disponible | Imagen 224x224 | Clasificación de enfermedades de plantas | variable según autor | múltiples checkpoints en Hugging Face, no comparables directamente |

La comparación con alternativas específicas de clasificación de enfermedades de plantas no está disponible en la información proporcionada: no se conocen métricas publicadas de este checkpoint frente a otros del mismo dominio, y el autor no ofrece comparaciones. El modelo base google/vit-base-patch16-224-in21k es el punto de referencia natural en arquitectura y tamaño, pero no resuelve la misma tarea sin fine-tuning.

## Limitaciones y advertencias

- El autor advierte que el modelo puede confundir síntomas similares, hojas sanas, especies, condiciones de iluminación y fondos.
- No identifica todas las plantas y no constituye un diagnóstico confirmado; no deben aplicarse tratamientos basados en una única predicción.
- La composición del dataset de entrenamiento, las condiciones de captura y el split de evaluación no están documentados, por lo que la accuracy de 0,9982 no puede generalizarse a fotos de jardín o campo.
- Riesgo de sobreajuste al dataset de entrenamiento no evaluable: la diferencia entre training loss (0,0056) y validation loss (0,0100) en la última época es pequeña, pero sin conocer el dataset no puede descartarse fuga de datos entre splits.
- Sesgos conocidos: no documentados; al depender de un dataset no descrito, pueden existir sesgos de especie, iluminación, fondo y geografía.
- Limitaciones de idioma: no aplica directamente, pero las etiquetas de salida están en el idioma del dataset de entrenamiento, no especificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- Caveat para producción: con cero descargas y un único "like", el modelo no tiene validación externa; no se recomienda su uso en producción sin una evaluación propia sobre el dominio objetivo.
- No se documentan versiones cuantizadas ni formatos alternativos de pesos, lo que limita el despliegue en entornos sin soporte de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vijayasai69/leaflens-plant-disease
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
