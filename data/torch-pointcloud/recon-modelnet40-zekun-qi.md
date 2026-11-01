# torch-pointcloud/recon.modelnet40.zekun-qi

## Resumen

ReCon (Contrast with Reconstruct) es un modelo de clasificación de nubes de puntos 3D desarrollado por Zekun Qi y colaboradores (Universidad de Shanghai Jiao Tong, Shanghai AI Laboratory y The University of Hong Kong), publicado en ICML 2023. Esta ficha concreta, `recon.modelnet40.zekun-qi`, es la versión afinada sobre el dataset ModelNet40 y convertida al ecosistema `torch-pointcloud` por Arthur Dujardin. El modelo resuelve la tarea de clasificación de formas 3D a partir de nubes de puntos con normales, asignando cada muestra a una de las 40 categorías de objetos de ModelNet40.

La arquitectura es un transformer de puntos enmascarado con consultas contrastivas multimodales, con 43,6 millones de parámetros y un extractor de características de 1536 dimensiones. Se parte del checkpoint preentrenado `torch-pointcloud/recon.pretrain.zekun-qi` y se afina para clasificación, procesando nubes de hasta 8192 puntos con sus normales asociadas.

Su relevancia actual reside en que ofrece un checkpoint listo para usar en PyTorch con licencia MIT, pesos en safetensors y una precisión global (OA) del 93,68 % en ModelNet40, lo que lo convierte en una referencia práctica para pipelines de visión 3D y aprendizaje de representaciones de nubes de puntos sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de puntos enmascarado con consultas contrastivas multimodales (ReCon) |
| Parametros totales | 43.579.944 (43,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de hasta 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 1536 |
| Numero de clases | 40 (ModelNet40) |
| Modelo base | torch-pointcloud/recon.pretrain.zekun-qi |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ReCon combina un transformer de puntos con enmascaramiento (masked point modeling) y un mecanismo de consultas contrastivas multimodales. La innovacion central del paper es el uso de un objetivo generativo (reconstruccion de puntos enmascarados) como guia para el aprendizaje contrastivo: las consultas contrastivas se alinean con las representaciones generativas, lo que produce embeddings mas robustos que el contraste puro. El modelo trabaja sobre nubes de puntos con coordenadas `pos` y normales `normal`, y produce un vector de 1536 dimensiones por muestra antes de la cabeza de clasificacion.

El checkpoint preentrenado (`recon.pretrain.zekun-qi`) se afina sobre ModelNet40, un dataset de 40 categorias de objetos 3D con 9843 muestras de entrenamiento y 2468 de test en la particion estandar. La model card no detalla el numero exacto de tokens, la composicion del dataset de preentrenamiento ni si se aplico RLHF/DPO (no aplicable en este dominio). La conversion a `torch-pointcloud` mantiene la logica del repositorio original `qizekun/ReCon` (MIT) y expone una API `create_model` con transformaciones de datos y `collate` integrados.

## Capacidades

- Clasificacion de nubes de puntos 3D en 40 categorias de ModelNet40.
- Extraccion de caracteristicas (embeddings de 1536 dimensiones) mediante `forward_features`.
- Soporte de `reset_classifier(num_classes=0)` para usar el modelo como backbone congelado en tareas downstream.
- Procesamiento de nubes de hasta 8192 puntos con coordenadas y normales.
- Entrada por lotes mediante `collate`, con gestion de indices de batch.
- Uso en modo evaluacion (`model.eval()`) con inferencia bajo `torch.no_grad()`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo de vision 3D.
- No dispone de modo "thinking", vision 2D, audio ni generacion de texto.

## Casos de uso

- Clasificacion de objetos 3D en pipelines de escaneo: el modelo recibe nubes de puntos con normales y devuelve logits sobre 40 clases, adecuado para inventariar objetos capturados con LiDAR o camaras de profundidad.
- Extraccion de embeddings para busqueda por similitud: usando `forward_features` se obtienen vectores de 1536 dimensiones que permiten indexar formas 3D y recuperar objetos similares con distancia coseno o producto escalar.
- Backbone congelado para transfer learning: con `reset_classifier(num_classes=0)` el modelo sirve como extractor de caracteristicas para tareas downstream (segmentacion, deteccion) con datasets propios de menor tamano.
- Preetiquetado de datasets 3D: clasificar automaticamente muestras de ModelNet40 o dominios cercanos para acelerar la anotacion manual en proyectos de vision 3D.
- Benchmarking de pipelines de nubes de puntos: al ofrecer OA 93,68 % y mAcc 90,73 % sobre ModelNet40, sirve como referencia reproducible para comparar preprocesados, aumentos de datos o arquitecturas alternativas.
- Prototipado en robotica y realidad aumentada: clasificacion rapida de objetos escaneados en tiempo casi real con un modelo de 43,6 M de parametros y 0,2 GB de pesos, desplegable en GPU de consumo.
- Docencia e investigacion en aprendizaje 3D: ejemplo completo y ligero de un transformer de puntos con objetivos contrastivos, util para experimentos academicos y reproduccion del paper.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ModelNet40 | Overall Accuracy (OA) | 93,68 % |
| ModelNet40 | Mean per-class Accuracy (mAcc) | 90,73 % |

No se han publicado en la informacion disponible resultados adicionales de benchmarks ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (43,6 M de parametros, ~175 MB de pesos); el consumo real depende del tamano de lote y de los 8192 puntos por muestra.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) y tambien en CPU para lotes pequenos.
- Opciones de despliegue: la libreria `torch-pointcloud` sobre PyTorch es la via oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recon.modelnet40.zekun-qi | 43,6 M | 8192 puntos + normales | 93,68 % | MIT | HuggingFace (`torch-pointcloud`) |
| PointNet++ (referencia clasica) | ~1,5 M | nube de puntos | ~91-92 % (segun configuracion) | MIT | Implementaciones multiples |
| Point Transformer | ~7 M | nube de puntos | ~93,7 % | MIT | Repositorios de investigacion |
| Otros checkpoints ReCon | no disponible | nube de puntos | no disponible | MIT | GitHub `qizekun/ReCon` |

Las cifras de PointNet++ y Point Transformer son valores de referencia habituales en la literatura y no se han verificado en la informacion proporcionada; deben tomarse como orientativos. No se dispone de comparaciones oficiales publicadas en la model card.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ModelNet40 (40 clases de objetos CAD), por lo que el rendimiento en escenas reales, objetos no vistos o categorias fuera de esas 40 puede degradarse notablemente.
- Dependencia de normales: la API de ejemplo requiere `pos` y `normal`; sin normales fiables el rendimiento puede caer.
- Resolucion fija de entrada: el ejemplo usa 8192 puntos; variaciones grandes en el numero de puntos pueden requerir remuestreo.
- Riesgo de sobreajuste al dataset: la OA del 93,68 % es sobre la particion estandar de ModelNet40 y no garantiza generalizacion a otros dominios.
- Sin verificacion independiente: los resultados del model-index estan marcados como `verified: false`.
- Sesgos: no documentados en la informacion disponible; al ser un modelo de formas 3D, los sesgos se relacionan con la distribucion de categorias y estilos de ModelNet40.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el paper original y el repositorio de conversion.
- No apto para tareas linguisticas, generacion de texto, agentes ni tool calling.
- Fecha de creacion del repositorio (2026-10-30) posterior a la publicacion del paper; conviene revisar la version de `torch-pointcloud` para compatibilidad de pesos.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/recon.modelnet40.zekun-qi
- Paper (arXiv): https://arxiv.org/abs/2302.02318
- Repositorio original: https://github.com/qizekun/ReCon
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
- Modelo base: https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
