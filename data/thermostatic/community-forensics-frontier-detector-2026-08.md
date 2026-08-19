# Thermostatic/community-forensics-frontier-detector-2026-08

## Resumen

El modelo **community-forensics-frontier-detector-2026-08** es un detector binario de imágenes generadas por IA, desarrollado de forma independiente por el usuario Thermostatic a partir del modelo base [OwensLab/commfor-model-384](https://huggingface.co/OwensLab/commfor-model-384), bajo licencia MIT. Está diseñado para clasificar imágenes completas como reales (0) o generadas por IA (1), y se publica con un conjunto completo de metadatos de entrenamiento, evaluación y robustez, lo que lo hace especialmente útil para tareas de verificación y moderación de contenido.

El modelo se basa en una arquitectura ViT-S/16 con resolución de entrada de 384×384 píxeles, y cuenta con aproximadamente 21,8 millones de parámetros. Se distribuye tanto en formato safetensors (pesos canónicos EMA) como en ONNX (FP16), lo que facilita su despliegue en entornos de producción con ONNX Runtime. El entrenamiento combinó un corpus forense previo de 73.371 imágenes con 40.101 imágenes nuevas de generadores "frontier" (GPT Image, DALL·E 3, FLUX, Imagen, etc.), alcanzando un rendimiento sólido en imágenes ordinarias y degradadas, aunque con debilidades conocidas en composites muy pequeños y entradas de muy baja resolución.

La relevancia de este modelo radica en su transparencia: publica informes de evaluación final y de robustez (33 condiciones), así como metadatos completos de composición del dataset y recetas de entrenamiento. No es una prueba de procedencia, sino una señal de cribado, y debe usarse con cautela en contextos donde se tomen decisiones basadas en sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/16 (Vision Transformer, parche 16×16), resolución 384×384 |
| Parametros totales | 21.811.969 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | FP16 (ONNX), safetensors (precisión no especificada en la información disponible) |
| Idiomas soportados | No disponible (modelo de imagen, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del **Community Forensics ViT-S/16 384** de OwensLab, que a su vez es un Vision Transformer de tamaño pequeño (21,8M de parámetros) con parches de 16×16 píxeles y resolución de entrada de 384×384. La arquitectura no presenta innovaciones estructurales destacables más allá de las del modelo base; la contribución principal es el proceso de fine-tuning y la selección de datos.

El entrenamiento combinó un corpus forense previo de 73.371 imágenes con 40.101 imágenes nuevas de generadores frontier, resultando en un manifiesto final de 109.560 imágenes de entrenamiento (41.313 reales, 68.247 generadas por IA) y 3.912 de calibración (1.983 reales, 1.929 generadas). Las imágenes reales provienen de COCO, OpenFake (LAION y Pexels), ImageNet y WikiArt; las generadas incluyen 131 buckets de generadores, desde SD 1.5, GLIDE, Midjourney o SynthBuster hasta GPT Image, DALL·E 3, FLUX 1/2, Imagen 3/4, Seedream 3/4/5, Qwen Image, Hunyuan Image y otros. El dataset público `Thermostatic/frontier-synthetic-images-2026` contiene solo la componente frontier, no la totalidad del corpus combinado.

El proceso de selección de arquitectura evaluó cuatro candidatos con exposición canaria igual (600 pasos, batch 48, 28.800 muestras). El modelo final se eligió por su macro balanced accuracy de calibración (0,9283) y se entrenó con pesos EMA. Se aplicó una calibración de umbral de decisión (raw logit ≥ 1,359375, equivalente a probabilidad 0,65). No se menciona el uso de RLHF ni DPO; es una tarea de clasificación supervisada estándar.

## Capacidades

- **Clasificación binaria de imágenes completas**: distingue entre imágenes reales (0) y generadas por IA (1) a nivel de imagen completa.
- **Preprocesamiento específico**: requiere redimensionar el lado corto a 440 píxeles, recorte central a 384×384 y normalización según los valores en `config.json`.
- **Umbral de decisión calibrado**: el umbral por defecto está fijado en raw logit ≥ 1,359375 (probabilidad 0,65), lo que permite ajustar sensibilidad/especificidad según el caso de uso.
- **Robustez moderada**: funciona bien en imágenes ordinarias, "lavadas" por la web y moderadamente degradadas, según la evaluación de robustez de 33 condiciones.
- **Despliegue ligero**: al ser un modelo pequeño (21,8M de parámetros) y estar disponible en ONNX FP16, puede ejecutarse en CPU o GPU con recursos mínimos.
- **No es un modelo de localización**: no está entrenado para identificar regiones sintéticas dentro de una imagen; falla en composites muy pequeños.

## Casos de uso

- **Moderación de contenido en plataformas sociales**: el modelo puede integrarse en pipelines de moderación para señalar imágenes potencialmente generadas por IA antes de revisión humana. Su tamaño reducido permite procesar grandes volúmenes con baja latencia.
- **Verificación de imágenes en medios de comunicación**: periodistas y verificadores pueden usarlo como criba inicial para detectar imágenes sintéticas en noticias o redes sociales, complementando con análisis forenses más profundos.
- **Control de calidad en bancos de imágenes**: plataformas que aceptan contribuciones de usuarios pueden filtrar automáticamente imágenes generadas por IA que violen sus términos de uso, usando el umbral calibrado para minimizar falsos positivos.
- **Investigación académica en forensia digital**: el modelo sirve como baseline reproducible para estudios sobre detección de imágenes generadas por IA, gracias a sus metadatos completos de dataset y entrenamiento.
- **Auditoría de contenido en archivos históricos**: instituciones que digitalizan colecciones pueden usar el detector para identificar posibles imágenes sintéticas añadidas posteriormente, aunque con la advertencia de no usarlo como prueba definitiva.
- **Despliegue en entornos con recursos limitados**: al ser un modelo pequeño y con soporte ONNX, puede ejecutarse en dispositivos edge o servidores sin GPU dedicada, por ejemplo en aplicaciones de verificación de imágenes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o similar) en la información proporcionada, dado que se trata de un modelo de clasificación de imágenes y no de texto. La model card incluye informes de evaluación interna (`reports/final_report.json` y `reports/redteam_report.json`) que documentan el rendimiento en el conjunto de prueba y en 33 condiciones de robustez, pero los valores numéricos concretos no se reproducen en la información disponible. Durante el proceso de selección de arquitectura, el candidato elegido alcanzó una macro balanced accuracy de calibración de 0,9283, pero ese dato corresponde a la fase de selección, no necesariamente al modelo final.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en FP16 (los pesos ocupan aproximadamente 43 MB, más activaciones y overhead). Puede ejecutarse en GPU con 2 GB o menos.
- **GPU recomendadas**: cualquier GPU moderna, incluidas RTX 2060, GTX 1660, o incluso GPUs integradas (iGPU) con soporte FP16. Para producción a gran escala, una A10 o T4 es más que suficiente.
- **Compatibilidad con hardware consumer**: sí, cabe en cualquier GPU de consumo actual, incluso en CPUs con ONNX Runtime optimizado.
- **Opciones de despliegue**: ONNX Runtime (recomendado por el autor), PyTorch (para los pesos safetensors), o conversión a otros formatos como TensorRT o OpenVINO.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada, pero dado el tamaño del modelo y la resolución de entrada, se espera una latencia de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de imágenes generadas por IA en la documentación proporcionada. El modelo base (OwensLab/commfor-model-384) es la referencia directa, pero no se ofrecen datos de rendimiento comparativo frente a alternativas como CLIP-based detectors, GAN detectors o modelos comerciales. Se recomienda consultar la literatura reciente sobre detección de imágenes sintéticas para una comparativa contextualizada.

## Limitaciones y advertencias

- **No es robusto a todos los ataques**: la evaluación de robustez de 33 condiciones indica que composites muy pequeños y entradas de muy baja resolución son debilidades graves.
- **No es una prueba de procedencia**: el modelo es una señal de cribado, no una verificación definitiva. No debe usarse como única base para acusaciones, sanciones de moderación, decisiones laborales o conclusiones legales.
- **No es un modelo de localización**: no está entrenado para identificar regiones sintéticas dentro de una imagen; no se debe esperar que detecte un parche sintético diminuto en una imagen mayor.
- **Sesgos potenciales**: el dataset de entrenamiento tiene un desequilibrio notable (68.247 generadas vs 41.313 reales), y las fuentes reales provienen de dominios específicos (COCO, ImageNet, WikiArt, LAION/Pexels), lo que puede afectar la generalización a otros dominios fotográficos.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero los datos de entrenamiento tienen licencias específicas por fuente; el autor no garantiza la reproducibilidad completa del corpus combinado.
- **Diferencias numéricas**: el modelo ONNX usa pesos FP16 con entrada/salida FP32, mientras que la calibración de referencia se realizó con CUDA bfloat16 autocast; esta diferencia de runtime está documentada pero puede afectar ligeramente los umbrales.
- **Requisitos de preprocesamiento**: el modelo exige un preprocesamiento específico (resize a 440, crop a 384, normalización según config); desviarse de este pipeline puede degradar el rendimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Thermostatic/community-forensics-frontier-detector-2026-08)
- [Dataset público frontier-synthetic-images-2026](https://huggingface.co/datasets/Thermostatic/frontier-synthetic-images-2026)
- [Modelo base OwensLab/commfor-model-384](https://huggingface.co/OwensLab/commfor-model-384)
- [Paper arxiv:2411.04125](https://arxiv.org/abs/2411.04125) (referencia incluida en los tags del modelo, presumiblemente relacionada con el modelo base)
- Informes de evaluación dentro del repositorio: `reports/final_report.json`, `reports/redteam_report.json`
- Metadatos de entrenamiento: `metadata/training.json`, `metadata/data_audit.json`, `metadata/preparation.json`, `metadata/dataset_composition.json`, `metadata/canary_summary.json`, `metadata/ranking.json`, `metadata/training_recipe.json`
