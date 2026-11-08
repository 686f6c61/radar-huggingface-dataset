# torch-pointcloud/pointgpt-l.scanobjectnn-objonly.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en un transformer con preentrenamiento generativo autorregresivo. Lo desarrolla Guangyan Chen y colaboradores (Universidad de Pekín, BIT) en el paper *PointGPT: Auto-regressively Generative Pre-training from Point Clouds* (NeurIPS 2023), y esta ficha concreta es una conversión y fine-tuning realizados por el proyecto torch-pointcloud (Arthur Dujardin) para su librería `torch-pointcloud`. El modelo resuelve la tarea de clasificación de objetos 3D a partir de nubes de puntos, un problema central en robótica, conducción autónoma y visión por computador 3D.

La variante aquí publicada es el checkpoint grande (360,4 M de parámetros) afinado sobre el split OBJ_ONLY de ScanObjectNN, el subconjunto del benchmark con objetos sintéticos sin fondo ni oclusión. Declara una precisión global (OA) del 96,9 % y una precisión media por clase (mAcc) del 96,56 % sobre 15 clases, con vectores de características de 2048 dimensiones. Es relevante para quien necesite un extractor de representaciones 3D preentrenado y listo para usar en PyTorch, con licencia MIT y pesos en safetensors.

A diferencia de los modelos de lenguaje, no procesa texto ni imágenes: su entrada son coordenadas 3D y su salida es un vector de logits sobre clases de objetos. Por tanto, su utilidad está en pipelines de percepción 3D y en la extracción de embeddings geométricos para tareas posteriores (detección, segmentación, recuperación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT), backbone de atención sobre nubes de puntos |
| Parámetros totales | 360.365.935 (360,4 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,4 GB) |
| Dimensión de características | 2048 |
| Clases de salida | 15 |
| Tarea | Clasificación de nubes de puntos (`point-cloud-classification`) |
| Dataset de evaluación/entrenamiento | ScanObjectNN (OBJ_ONLY) |
| Librería | `torch-pointcloud` (PyTorch) |
| Modelo base | `torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen` |

## Arquitectura y entrenamiento

PointGPT aplica la receta de los GPT al dominio 3D: divide la nube de puntos en parches, los ordena mediante un criterio geométrico y entrena al transformer para predecir el siguiente parche de forma autorregresiva, de manera análoga a la predicción del siguiente token en lenguaje. Este preentrenamiento generativo produce representaciones geométricas transferibles, que después se afinan de forma supervisada para clasificación. El checkpoint base de esta ficha es `pointgpt-l.labeled-hybrid.guangyan-chen`, un modelo grande preentrenado y afinado en un régimen híbrido (etiquetado y no etiquetado) antes del ajuste final sobre ScanObjectNN OBJ_ONLY.

La model card no detalla el número de tokens/parches vistos durante el preentrenamiento, la composición exacta del corpus 3D ni si se emplearon técnicas de alineación tipo RLHF/DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La conversión a `torch-pointcloud` mantiene la arquitectura original del repositorio `CGuangyan-BIT/PointGPT` (MIT) y expone una API de `create_model`, `forward_features` y `reset_classifier` para extracción de embeddings.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos (tarea `point-cloud-classification`).
- Extracción de características: `forward_features` devuelve embeddings de 2048 dimensiones por muestra, reutilizables como entrada de clasificadores lineales, tareas de recuperación o modelos posteriores.
- Procesamiento de nubes de puntos de tamaño variable; el ejemplo de la model card emplea 8192 puntos por muestra.
- Manejo de lotes mediante `collate` y tensor de índices de batch (`data["batch"]`), lo que permite inferencia por lotes en GPU.
- Preentrenamiento generativo autorregresivo que aporta representaciones geométricas transferibles a otros datasets 3D tras un fine-tuning.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, texto, visión 2D, audio ni capacidades multilingües: es un modelo puramente geométrico.

## Casos de uso

- Clasificación de objetos en robótica móvil: el modelo recibe la nube de puntos de una cámara de profundidad o LiDAR y devuelve la clase del objeto; sus 360 M de parámetros y los 96,9 % de OA en ScanObjectNN OBJ_ONLY lo hacen adecuado para reconocimiento de objetos aislados en escenas controladas.
- Extracción de embeddings para búsqueda y recuperación 3D: usando `reset_classifier(num_classes=0)` se obtienen vectores de 2048 dimensiones que pueden indexarse en un motor vectorial para recuperar mallas o escaneos similares.
- Preentrenamiento como inicialización para datasets 3D propios: el checkpoint sirve de punto de partida para fine-tuning en dominios con pocas etiquetas, aprovechando el preentrenamiento generativo del modelo base.
- Etiquetado asistido de activos 3D: clasificación automática de objetos escaneados en pipelines de digitalización (escaneo de patrimonio, inventario de piezas industriales) para preasignar categorías antes de la revisión humana.
- Benchmarking y reproducibilidad en investigación 3D: la integración en `torch-pointcloud` permite reproducir la línea base de PointGPT-L sobre ScanObjectNN con una API de pocas líneas, útil para comparar nuevas arquitecturas.
- Módulo de percepción en pipelines de visión 3D: al ser un backbone de extracción de características, puede insertarse como codificador en sistemas de detección o segmentación que necesiten representaciones geométricas preentrenadas.
- Docencia y prototipado: la instalación vía `pip install torch-pointcloud` y el ejemplo autocontenido de la model card permiten montar una demo de clasificación 3D en minutos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ScanObjectNN (OBJ_ONLY) | Clasificación de nubes de puntos | OA (accuracy) | 96,9 |
| ScanObjectNN (OBJ_ONLY) | Clasificación de nubes de puntos | mAcc (accuracy) | 96,56 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card ni en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 360,4 M de parámetros en FP32, los pesos ocupan aproximadamente 1,4 GB; en FP16/BF16, unos 0,72 GB. A ello hay que sumar activaciones y la nube de puntos de entrada (8192 puntos × 3 coordenadas), por lo que un presupuesto práctico de 3-6 GB de VRAM es razonable para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para lotes moderados; RTX 3060/4060, RTX 4090, A100 o H100 son válidas. No se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 8 GB o más, dado el tamaño del checkpoint (1,4 GB en disco).
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch (`tp.create_model(..., pretrained=True)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos sobre ScanObjectNN (OBJ_ONLY) que permitan una comparación numérica rigurosa. A continuación se comparan únicamente los aspectos documentados del ecosistema de modelos de la propia familia PointGPT y de la librería:

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| pointgpt-l.scanobjectnn-objonly.guangyan-chen (este) | 360,4 M | nubes de puntos (ejemplo con 8192 puntos) | MIT | Hugging Face, vía `torch-pointcloud` |
| pointgpt-l.labeled-hybrid.guangyan-chen (modelo base) | no disponible | nubes de puntos | MIT | Hugging Face |
| PointGPT original (CGuangyan-BIT/PointGPT) | no disponible | nubes de puntos | MIT | GitHub |

No disponible para el resto de alternativas de la misma categoría (tamaño o tarea).

## Limitaciones y advertencias

- Entrenado y evaluado en ScanObjectNN OBJ_ONLY: objetos sintéticos aislados, sin fondo ni oclusión. El rendimiento puede degradarse en escenas reales con ruido, oclusión o múltiples objetos.
- Modelo de dominio específico: no procesa texto, imágenes 2D ni audio; no debe presentarse como un modelo de propósito general.
- Los resultados de benchmarks (OA 96,9, mAcc 96,56) están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en producción.
- Riesgo de desajuste de dominio: la clasificación en 15 clases es cerrada; objetos fuera de esas categorías se asignarán a alguna clase existente sin señal de rechazo documentada.
- No se documentan análisis de sesgo, robustez a permutaciones de puntos, densidad variable ni sensibilidad a la escala; no disponibles.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución del paper, del repositorio original y de la conversión a `torch-pointcloud`.
- La model card no detalla el preprocesado exacto más allá de `info["transform"]`; usar una normalización distinta a la esperada puede alterar los resultados.
- No se documentan requisitos de hardware, latencia ni throughput; las estimaciones de VRAM de esta ficha son cálculos a partir del recuento de parámetros, no datos oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-objonly.guangyan-chen
- Archivos del modelo: https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-objonly.guangyan-chen/tree/main
- Model card (README): https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-objonly.guangyan-chen/blob/main/README.md
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
