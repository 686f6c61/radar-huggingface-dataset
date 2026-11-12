# theblackcat102/clip-vit-large-patch14-task-experts-ep10

## Resumen
El repositorio `theblackcat102/clip-vit-large-patch14-task-experts-ep10` recopila ocho fine-tunes completos del codificador de imágenes de `openai/clip-vit-large-patch14` sobre las ocho tareas del benchmark de visión habitualmente empleado en model merging y task arithmetic: SUN397, Stanford Cars, RESISC45, EuroSAT, GTSRB, DTD, Food101 y FER2013. Lo desarrolla el usuario theblackcat102 y su propósito no es ofrecer un clasificador listo para producción, sino servir de material de partida para estudios de task vectors, checkpoint selection y duraciones de entrenamiento.

Cada tarea tiene su propio directorio con un `model.safetensors` (mejor época por accuracy) y un checkpoint por época (10 en total), además de logs de entrenamiento y eventos de TensorBoard. La receta es idéntica en los ocho runs: learning rate 3e-5, batch size 32, 10 épocas, precisión mixta fp16 y semilla 42, con la cabeza de clasificación congelada e inicializada desde los embeddings de texto zero-shot de CLIP.

La relevancia actual es metodológica: el repo documenta con precisión la accuracy por época de cada tarea, lo que permite separar el efecto del entrenamiento del de la selección de modelo. El autor advierte explícitamente de que el `model.safetensors` de nivel superior corresponde a la mejor época evaluada sobre el split de test en 7 de las 8 tareas, por lo que sus cifras son optimistas y deben compararse con la columna de época 10 para una evaluación sin sesgo de selección.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (transformer de visión ViT-L/14 + torre de texto CLIP), con cabeza lineal congelada sobre features normalizadas |
| Parametros totales | no disponible (el repo ocupa 3,4 GB e incluye 8 runs con 10 checkpoints cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; el texto solo se usa para inicializar la cabeza) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16 según receta de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (por run y por checkpoint); también `training_args.bin`, `train.log`, eventos de TensorBoard, `preprocessor_config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento
Se parte de `openai/clip-vit-large-patch14`, un modelo CLIP con torre de visión ViT-L/14 y torre de texto. En cada fine-tune se mantiene intacta la torre de texto y se entrena únicamente la torre de visión (`vision_model` y `visual_projection`). La cabeza de clasificación es lineal, se inicializa con los embeddings de texto zero-shot de los prompts de clase multiplicados por `logit_scale`, tiene sesgo cero y permanece congelada durante todo el entrenamiento. El pipeline es `logits = head(normalize(clip.get_image_features(x)))`.

El entrenamiento usa AdamW fusionado de torch con betas (0,9; 0,999), weight decay 0, max grad norm 1,0, decaimiento lineal con 10 % de warmup, batch size 32, fp16 y semilla 42, sobre 10 épocas. El preprocesado es exclusivamente el `CLIPImageProcessor` (resize a 224, center crop, normalización) y no se aplica aumento de datos, pese a que el log imprima `Data augmentation: True`. La evaluación se realiza una vez por época sobre el split de evaluación (test en 7 tareas, validación en Food101) y la selección usa `load_best_model_at_end=True` con `metric_for_best_model=accuracy` sobre ese mismo split. El software empleado es transformers 4.57.6 y torch 2.9.1.

## Capacidades
- Clasificación de imágenes en 8 dominios específicos: escenas (SUN397), coches (Stanford Cars), imágenes aéreas (RESISC45), uso del suelo por satélite (EuroSAT), señales de tráfico (GTSRB), texturas (DTD), comida (Food101) y expresiones faciales (FER2013).
- Extracción de features de imagen con la torre de visión de CLIP ViT-L/14, reutilizable para tareas de retrieval o clasificación con cabeza propia.
- Clasificación zero-shot mediante la torre de texto original, que permanece sin modificar respecto al modelo base.
- Base para task arithmetic y model merging: los ocho task vectors son directamente restables entre sí al compartir arquitectura y receta.
- Estudio de checkpoint selection y duración de entrenamiento gracias a los 10 checkpoints por tarea.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking; es un clasificador de imágenes.

## Casos de uso
- Investigación en model merging: los ocho task vectors permiten calcular sumas, Task Arithmetic o TIES merging sobre un backbone común para estudiar interferencia entre tareas.
- Estudio de checkpoint selection: comparar la accuracy de la mejor época frente a la época 10 en cada tarea cuantifica el sesgo de seleccionar sobre test (por ejemplo, GTSRB pasa de 99,41 % en la época 6 a 99,08 % en la época 10).
- Clasificación de escenas y texturas en pipelines de visión: usar el run de SUN397 (78,77 % en test) o DTD (82,82 %) como extractor o clasificador dentro de un sistema de etiquetado de imágenes.
- Clasificación de imágenes satelitales: el run de EuroSAT alcanza 99,26 % en test y el de RESISC45 96,30 %, adecuados para prototipos de teledetección.
- Reconocimiento de señales de tráfico: el run de GTSRB (99,41 %) sirve como referencia para sistemas de asistencia a la conducción en fase de experimentación.
- Análisis de expresiones faciales: el run de FER2013 (74,70 %) puede emplearse como línea base en estudios de afectividad computacional.
- Clasificación de alimentos: el run de Food101 (92,80 % sobre validación) es útil para prototipos de reconocimiento dietético.
- Reproducción de recetas de fine-tuning: los logs, `training_args.bin` y eventos de TensorBoard permiten replicar exactamente cada run con semilla 42.

## Benchmarks y rendimiento
Accuracy en %, sobre el split de evaluación indicado (test salvo Food101, que usa validación). La columna `model.safetensors` corresponde a la mejor época; la columna época 10 es la comparación sin selección.

| Tarea | Train | Eval | Steps/epoch | `model.safetensors` | Mejor época | Época 10 |
|---|---|---|---|---|---|---|
| dtd | 3.760 | 1.880 (test) | 118 | 82,82 | 10 | 82,82 |
| eurosat | 21.600 | 2.700 (test) | 675 | 99,26 | 9 | 99,19 |
| fer2013 | 28.709 | 7.178 (test) | 898 | 74,70 | 10 | 74,70 |
| food101 | 75.750 | 25.250 (val) | 2.368 | 92,80 | 10 | 92,80 |
| gtsrb | 26.640 | 12.630 (test) | 833 | 99,41 | 6 | 99,08 |
| resisc45 | 18.900 | 6.300 (test) | 591 | 96,30 | 9 | 96,30 |
| stanford-cars | 8.144 | 8.041 (test) | 255 | 92,35 | 10 | 92,35 |
| sun397 | 19.850 | 19.850 (test) | 621 | 78,77 | 9 | 78,76 |

Evolución por época (accuracy en %):

| Tarea | ep1 | ep2 | ep3 | ep4 | ep5 | ep6 | ep7 | ep8 | ep9 | ep10 |
|---|---|---|---|---|---|---|---|---|---|---|
| dtd | 71,06 | 73,94 | 77,13 | 77,98 | 78,51 | 79,63 | 82,45 | 81,97 | 82,61 | 82,82 |
| eurosat | 92,67 | 96,19 | 97,63 | 98,78 | 97,96 | 98,74 | 98,15 | 99,11 | 99,26 | 99,19 |
| fer2013 | 66,30 | 70,13 | 70,79 | 72,57 | 72,89 | 72,99 | 73,56 | 73,77 | 74,03 | 74,70 |
| food101 | 84,74 | 88,72 | 89,17 | 89,37 | 89,43 | 90,33 | 91,28 | 91,63 | 92,55 | 92,80 |
| gtsrb | 97,19 | 97,92 | 97,93 | 98,00 | 98,99 | 99,41 | 99,22 | 98,90 | 98,90 | 99,08 |
| resisc45 | 87,24 | 91,76 | 93,10 | 93,75 | 93,67 | 96,16 | 96,02 | 95,87 | 96,30 | 96,30 |
| stanford-cars | 79,01 | 79,44 | 84,45 | 82,15 | 87,36 | 88,50 | 90,29 | 91,61 | 92,18 | 92,35 |
| sun397 | 69,74 | 73,08 | 73,11 | 73,10 | 74,77 | 75,85 | 77,07 | 78,22 | 78,77 | 78,76 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de ViT-L/14 (aproximadamente 300 M de parámetros en la torre de visión más la proyección), la inferencia en fp16 requiere del orden de 1-2 GB de VRAM para el modelo; no se dispone de cifras medidas en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16. Para entrenamiento con batch size 32 y fp16 se recomienda A100, H100 o RTX 4090; no se especifica en la model card el hardware usado en los runs.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060 o superiores para inferencia; el entrenamiento completo con batch 32 probablemente requiera 16 GB o más.
- Opciones de despliegue: carga vía `transformers` (`CLIPModel` + `CLIPImageProcessor`) y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de resultados comparativos frente a otros modelos en la información proporcionada. Como referencia estructural, el modelo base `openai/clip-vit-large-patch14` comparte arquitectura y pesos de partida, pero no se han publicado en esta ficha métricas de ese modelo sobre las mismas ocho tareas. Cualquier comparación numérica con alternativas como CLIP ViT-B/32, SigLIP o EVA-CLIP requeriría datos que no están disponibles aquí.

## Limitaciones y advertencias
- El `model.safetensors` de nivel superior se selecciona por accuracy sobre el split de test en 7 de las 8 tareas, por lo que sus cifras son optimistas; para comparaciones rigurosas debe usarse la época 10 o un checkpoint fijo.
- No se aplica aumento de datos pese a que el log imprima `Data augmentation: True`; esto puede limitar la generalización fuera de la distribución de cada dataset.
- La cabeza de clasificación está congelada y anclada a los prompts zero-shot de cada dataset; no es reentrenable ni adaptable a nuevas clases sin rehacer la inicialización.
- Cada run está especializado en una única tarea; no existe un clasificador multi-tarea combinado en el repo, solo los task vectors individuales.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor y respetar la licencia del modelo base de OpenAI.
- Idiomas no disponibles: el modelo es de visión y la torre de texto no se ha modificado, pero no se documenta el comportamiento multilingüe.
- Riesgo de sobreajuste en tareas con pocos datos, como Stanford Cars (8.144 imágenes de entrenamiento) o DTD (3.760), donde la accuracy por época muestra oscilaciones notables.
- No apto para producción directa sin validación externa: los splits de evaluación son los estándar del benchmark y pueden no reflejar dominios reales.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/theblackcat102/clip-vit-large-patch14-task-experts-ep10
- Modelo base: https://huggingface.co/openai/clip-vit-large-patch14
- Datasets referenciados: `clip-benchmark/wds_fer2013`, `ethz/food101`, `tanganke/dtd`, `tanganke/eurosat`, `tanganke/gtsrb`, `tanganke/resisc45`, `tanganke/stanford_cars`, `tanganke/sun397` (disponibles en Hugging Face).
- No se han encontrado papers, blogs, repos de código ni demos adicionales en la información proporcionada.
