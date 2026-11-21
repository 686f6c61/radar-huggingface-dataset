# torch-pointcloud/act.modelnet40.runpei-dong

## Resumen

ACT (Autoencoder as Cross-Modal Teacher) es un modelo de clasificación de nubes de puntos 3D desarrollado por Runpei Dong y colaboradores, publicado en ICLR 2023. Esta ficha concreta corresponde a la versión ajustada (fine-tuned) sobre el dataset ModelNet40 y convertida al ecosistema `torch-pointcloud` por Arthur Dujardin. El modelo resuelve la tarea de clasificación de formas 3D representadas como nubes de puntos sin estructura, asignando una de 40 categorías a cada muestra.

La innovación central de ACT es el uso de un autoencoder de imágenes 2D preentrenado como "profesor cross-modal": el transformer de imagen actúa como maestro que guía el aprendizaje de representaciones 3D mediante destilación, lo que permite transferir conocimiento visual 2D al dominio 3D. La arquitectura resultante es un transformer enmascarado de puntos (masked point transformer) con 22,1 millones de parámetros y una dimensión de características de 768.

Es relevante ahora porque demuestra que el preentrenamiento cross-modal 2D-3D es una vía eficaz para obtener representaciones 3D robustas con menos datos etiquetados, y porque su disponibilidad en `torch-pointcloud` con pesos en safetensors facilita su uso en pipelines de visión 3D en PyTorch. No es un modelo generativo de lenguaje: es un backbone de visión 3D para clasificación y extracción de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer enmascarado de puntos (masked point transformer) destilado de un transformer de imagen 2D |
| Parametros totales | 22.102.056 (22,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 40 (ModelNet40) |
| Dimension de caracteristicas | 768 |
| Libreria | torch-pointcloud |
| Dataset de evaluacion | ModelNet40 |

## Arquitectura y entrenamiento

ACT se basa en un transformer enmascarado de puntos que procesa nubes de puntos 3D. La clave del método es el uso de un autoencoder de imagen 2D preentrenado como profesor cross-modal: durante el preentrenamiento, el modelo 3D aprende a alinear sus representaciones con las del transformer de imagen 2D mediante destilación, lo que transfiere conocimiento visual 2D al dominio 3D. El modelo base es `torch-pointcloud/act.pretrain.runpei-dong`, un checkpoint preentrenado que después se ajusta para clasificación sobre ModelNet40.

El modelo final tiene 22,1 M de parámetros, una dimensión de características de 768 y produce logits sobre 40 clases. La entrada consiste en nubes de puntos con coordenadas (`pos`) y normales (`normal`), que se transforman y agrupan en lotes mediante `collate`. El modelo expone `forward_features` para extracción de embeddings y `reset_classifier` para reutilizarlo como extractor de características. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de ModelNet40, ni si se empleó RLHF/DPO (no aplica en este dominio).

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40 (sillas, mesas, aviones, etc.).
- Extracción de características: genera embeddings de 768 dimensiones por muestra mediante `forward_features`.
- Reutilización como backbone: permite `reset_classifier(num_classes=0)` para usar el modelo como extractor congelado en tareas downstream.
- Procesamiento de nubes de puntos con coordenadas y normales, con transformaciones y collate integrados en `torch-pointcloud`.
- Inferencia en PyTorch con pesos safetensors, sin dependencia de frameworks propietarios.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües, de visión 2D directa, audio ni modo "thinking".

## Casos de uso

- Clasificación de objetos 3D en pipelines de visión por computador: dado un escaneo o nube de puntos de un objeto, el modelo predice su categoría entre 40 clases, adecuado para inventario automatizado o robótica de manipulación.
- Extracción de embeddings para búsqueda y recuperación de formas 3D: usando `forward_features` se obtienen vectores de 768 dimensiones que permiten indexar y comparar formas por similitud en un motor de búsqueda visual 3D.
- Preentrenamiento como backbone para tareas downstream: el checkpoint ajustado puede servir de inicialización para segmentación o detección 3D con pocos datos etiquetados, aprovechando la transferencia cross-modal 2D-3D.
- Automatización de control de calidad en fabricación: clasificar piezas escaneadas en 3D para detectar categorías o piezas fuera de especificación en líneas de producción.
- Investigación en aprendizaje de representaciones 3D: sirve como baseline reproducible para comparar métodos de preentrenamiento cross-modal y destilación 2D-3D.
- Prototipado rápido en PyTorch: al instalarse con `pip install torch-pointcloud` y cargarse con `tp.create_model`, permite integrar clasificación 3D en notebooks y scripts sin infraestructura adicional.
- Docencia y experimentación con nubes de puntos: ejemplo mínimo de uso con datos sintéticos (`torch.randn`) para entender el flujo de transformación, collate e inferencia en visión 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ModelNet40 | OA (accuracy global) | 93,11 |
| ModelNet40 | mAcc (accuracy media por clase) | 89,74 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,1 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 88 MB, y en fp16 unos 44 MB. La memoria dominante es la de las activaciones de la nube de puntos (por ejemplo, 8192 puntos por muestra).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante, con margen amplio).
- Opciones de despliegue: PyTorch nativo a través de `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento ModelNet40 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act.modelnet40.runpei-dong | 22,1 M | nube de puntos (ej. 8192 puntos) | OA 93,11 / mAcc 89,74 | MIT | Hugging Face (torch-pointcloud) |
| Alternativas de clasificación 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables (por ejemplo, PointNet, PointNet++, DGCNN u otros transformers de puntos) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con ModelNet40, un dataset de formas 3D sintéticas y curadas; su rendimiento puede degradarse en escaneos reales con ruido, oclusiones o densidades distintas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en formas ambiguas o fuera de las 40 clases.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni tiene capacidades multilingües. La entrada está limitada a nubes de puntos con coordenadas y normales.
- Restricciones de licencia: licencia MIT, permite uso comercial con atribución; conviene conservar el aviso de copyright y las citas del paper y del dataset.
- Caveats para producción: los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`); el modelo es de 2023 y su ecosistema (`torch-pointcloud`) es específico, por lo que la integración requiere PyTorch. No hay variantes cuantizadas publicadas, lo que limita optimizaciones de despliegue en entornos muy restringidos.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/act.modelnet40.runpei-dong
- Modelo base (preentrenado): https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper ACT (arXiv 2212.08320): https://arxiv.org/abs/2212.08320
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
