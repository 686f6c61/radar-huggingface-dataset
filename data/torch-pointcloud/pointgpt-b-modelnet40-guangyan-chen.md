# torch-pointcloud/pointgpt-b.modelnet40.guangyan-chen

## Resumen

PointGPT-b es un modelo de clasificación de nubes de puntos 3D basado en un transformer con preentrenamiento generativo autoregresivo. Lo desarrolla el grupo de Guangyan Chen (BIT) en el artículo *PointGPT: Auto-regressively Generative Pre-training from Point Clouds* (NeurIPS 2023), y esta ficha corresponde a la conversión y el ajuste fino realizados por Arthur Dujardin para la librería `torch-pointcloud`. El checkpoint está especializado en la clasificación de 40 categorías del dataset ModelNet40.

El modelo resuelve la tarea de clasificación de formas 3D representadas como conjuntos desordenados de puntos con normales. Su interés radica en que aplica al dominio 3D la receta de los GPT: preentrenamiento generativo autoregresivo seguido de ajuste fino supervisado, lo que permite obtener representaciones transferibles con un coste de parámetros moderado (120,4 M) y sin depender de mallas o vóxeles.

Esta versión concreta es un fine-tune sobre `pointgpt-b.labeled-hybrid.guangyan-chen` y reporta un 94,37 % de precisión global (OA) y un 91,65 % de precisión media por clase (mAcc) en ModelNet40. El repo pesa 0,5 GB y los pesos están en safetensors, lo que facilita su integración en pipelines de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autoregresivo (PointGPT) |
| Parametros totales | 120.400.520 (120,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

Otros datos de la model card: 40 clases de salida, dimensión de características 1536, dataset ModelNet40, librería `torch-pointcloud`.

## Arquitectura y entrenamiento

PointGPT traslada el paradigma de los transformers generativos al dominio de las nubes de puntos. El modelo divide la nube en parches locales, los ordena mediante un criterio geométrico determinista y aplica un objetivo autoregresivo: predecir el siguiente parche a partir de los anteriores. Este preentrenamiento se realiza sobre datos no etiquetados (el checkpoint base es `pointgpt-b.labeled-hybrid`, que combina preentrenamiento no supervisado con datos híbridos etiquetados). Posteriormente, el encoder se ajusta de forma supervisada para clasificación, en este caso sobre las 40 categorías de ModelNet40.

La variante "b" corresponde al tamaño base de la familia PointGPT. El modelo consume nubes de puntos con coordenadas y normales (el ejemplo de la model card usa 8192 puntos) y produce un vector de características de 1536 dimensiones antes de la cabeza de clasificación. La innovación principal del artículo es el ordenado de parches y el enmascarado autoregresivo, que evita la fuga de información entre parches y permite un preentrenamiento escalable sobre formas 3D. No se dispone de detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de objetos (ModelNet40).
- Extracción de características: `forward_features` devuelve embeddings de 1536 dimensiones por muestra.
- Uso como backbone congelado o ajustable para tareas posteriores (`reset_classifier(num_classes=0)` para obtener solo embeddings).
- Procesamiento de nubes de puntos con coordenadas y normales, con transformaciones y `collate` integrados en `torch-pointcloud`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión 2D; el dominio es exclusivamente geometría 3D.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Clasificación automática de objetos 3D en escaneos: dado un escaneo de un objeto (por ejemplo, de un escáner LiDAR o de fotogrametría), el modelo predice la categoría entre 40 clases, útil en inventario automatizado o catalogación de activos.
- Preetiquetado en pipelines de anotación de datos 3D: usar el modelo para generar etiquetas preliminares sobre grandes volúmenes de nubes de puntos y reducir el coste de anotación manual, revisando después solo los casos de baja confianza.
- Extracción de embeddings para búsqueda por similitud: generar vectores de 1536 dimensiones con `forward_features` e indexarlos en una base vectorial para recuperación de formas 3D similares (reverse 3D search).
- Transfer learning a dominios específicos: reutilizar el backbone preentrenado y reemplazar la cabeza con `reset_classifier` para clasificar categorías propias (piezas industriales, componentes de almacén) con pocos datos etiquetados.
- Control de calidad en fabricación: clasificar piezas escaneadas en la línea de producción y detectar desviaciones respecto a las categorías esperadas.
- Robótica de manipulación: como módulo de percepción para reconocer el tipo de objeto antes de decidir la estrategia de agarre, aprovechando la entrada de 8192 puntos para geometrías de tamaño medio.
- Docencia e investigación en deep learning 3D: punto de partida reproducible (licencia MIT, pesos safetensors) para experimentos de clasificación y representación de formas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre ModelNet40:

| Metrica | Valor |
|---|---|
| OA (accuracy global) | 94,37 |
| mAcc (accuracy media por clase) | 91,65 |

No se han publicado en la información disponible resultados de benchmarks adicionales (ni comparativas con otros modelos en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: con 120,4 M de parámetros en FP32, los pesos ocupan aproximadamente 0,48 GB; el pico de memoria depende del número de puntos por muestra (8192 en el ejemplo) y del batch. Una GPU con 4-8 GB es suficiente para inferencia en FP32 con batches moderados.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB (RTX 3060/4060, RTX 4090, A100, H100). Para entrenamiento o fine-tuning con batches grandes se recomienda A100/H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más, incluso en FP32.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión 3D de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, la familia PointGPT incluye variantes de distinto tamaño (la "b" es la base), y el artículo original compara con otros métodos de clasificación de nubes de puntos, pero no se han incluido esos números en la información disponible. La comparativa con alternativas como PointNet++, DGCNN o Point Transformer queda por tanto como "no disponible" en esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos; no genera texto ni procesa imágenes 2D.
- El dominio de entrenamiento es ModelNet40 (objetos sintéticos de 40 categorías); el rendimiento puede degradarse en escaneos reales con ruido, oclusiones o densidades distintas a las de entrenamiento.
- Los resultados de benchmarks (OA 94,37, mAcc 91,65) están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos en producción.
- No se especifican sesgos del dataset; ModelNet40 tiene una distribución de clases y categorías limitada que puede introducir sesgos en la clasificación de objetos fuera de esas 40 clases.
- Riesgo de clasificación errónea en categorías visualmente similares; se recomienda calibrar umbrales de confianza y revisar manualmente los casos dudosos.
- Licencia MIT: permite uso comercial y modificación, pero se debe conservar el aviso de copyright y la atribución correspondiente.
- No se han publicado variantes cuantizadas ni formatos de despliegue optimizados; el despliegue requiere PyTorch y la librería `torch-pointcloud`.
- La fecha de creación del repo (2026) y la actualización (2026) indican que es un artefacto reciente con pocas descargas (21) y sin likes; la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.modelnet40.guangyan-chen
- Archivos del repositorio: https://huggingface.co/torch-pointcloud/pointgpt-b.modelnet40.guangyan-chen/tree/main
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
