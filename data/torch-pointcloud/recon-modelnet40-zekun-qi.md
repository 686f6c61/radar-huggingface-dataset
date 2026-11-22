# torch-pointcloud/recon.modelnet40.zekun-qi

## Resumen

ReCon (Contrast with Reconstruct) es un modelo de clasificación de nubes de puntos 3D publicado por Zekun Qi y colaboradores en ICML 2023. Esta ficha concreta, `recon.modelnet40.zekun-qi`, es la conversión del checkpoint oficial de ReCon afinado sobre ModelNet40 al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. El modelo resuelve la tarea de clasificación de formas 3D representadas como conjuntos de puntos (coordenadas XYZ más normales), asignando una de 40 categorías (silla, mesa, avión, etc.).

La arquitectura es un transformer de puntos con enmascaramiento (masked point transformer) que combina aprendizaje contrastivo con consultas multimodales, siguiendo la idea central del paper: el preentrenamiento generativo (reconstrucción de puntos enmascarados) guía al preentrenamiento contrastivo. El modelo tiene 43,6 millones de parámetros y produce representaciones de 1536 dimensiones. Es relevante porque ofrece un punto de partida preentrenado y listo para usar en tareas de visión 3D, un dominio donde los modelos genéricos de lenguaje no aplican y donde las alternativas suelen requerir reproducir pipelines de entrenamiento complejos.

Esta conversión concreta es útil para desarrolladores que trabajan con `torch-pointcloud`: permite cargar el modelo con una sola llamada (`tp.create_model`), extraer embeddings de 1536 dimensiones o reentrenar el clasificador para un número distinto de clases, sin depender del repositorio original de ReCon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Masked point transformer con consultas contrastivas multimodales (ReCon) |
| Parámetros totales | 43.579.944 (43,6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto); entrada de hasta 8192 puntos en el ejemplo de la model card |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de características | 1536 |
| Número de clases | 40 (ModelNet40) |
| Librería | torch-pointcloud |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ReCon es un transformer que opera directamente sobre nubes de puntos. El preentrenamiento combina dos objetivos: uno generativo, que enmascara puntos y entrena al modelo para reconstruirlos, y otro contrastivo, que alinea las representaciones de la nube de puntos con las de una modalidad complementaria mediante consultas cruzadas. El paper defiende que el objetivo generativo actúa como guía del contrastivo, lo que produce representaciones más ricas que el contraste puro. La entrada del modelo son coordenadas `pos` (N×3) y normales `normal` (N×3), que se transforman y agrupan en lotes mediante `collate`.

El checkpoint aquí descrito parte del modelo preentrenado `recon.pretrain.zekun-qi` y se afina sobre ModelNet40, el benchmark clásico de clasificación de formas 3D con 40 categorías. No se dispone en la información proporcionada del número exacto de tokens/puntos de entrenamiento, la composición del dataset de preentrenamiento ni los detalles de la etapa de ajuste fino (learning rate, épocas, aumentos de datos). La model card indica que la conversión proviene del repositorio original `qizekun/ReCon` (MIT) y que la implementación de referencia está en `torch-pointcloud`.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40.
- Extracción de embeddings globales de 1536 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Reentrenamiento del clasificador para un número arbitrario de clases con `reset_classifier`.
- Procesamiento de nubes de puntos con coordenadas y normales, con transformaciones y agrupación en lotes integradas en la librería.
- Uso como extractor de características congelado para tareas posteriores (detección, segmentación, recuperación) mediante transferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión 2D, audio ni modo thinking: es un modelo puramente de visión 3D.

## Casos de uso

- Clasificación de objetos 3D en pipelines de escaneado: dado un escaneo de un objeto doméstico o industrial, el modelo asigna una de las 40 categorías de ModelNet40, útil como paso de etiquetado automático previo a una revisión manual.
- Extracción de embeddings para búsqueda de formas: usando `forward_features` se obtienen vectores de 1536 dimensiones que permiten construir un índice de similitud para recuperar modelos 3D parecidos en un catálogo.
- Transferencia a dominios con pocas clases: reentrenando el clasificador con `reset_classifier(num_classes=N)` se puede adaptar a categorías propias (por ejemplo, piezas de recambio) partiendo de un backbone preentrenado.
- Preetiquetado en anotación de datasets 3D: el modelo propone etiquetas para acelerar el etiquetado humano de nuevas nubes de puntos, con revisión posterior.
- Prototipado e investigación en visión 3D: sirve como línea base reproducible para comparar técnicas de clasificación de nubes de puntos sin replicar el pipeline de entrenamiento original.
- Control de calidad en fabricación aditiva: clasificar piezas escaneadas para detectar categorías inesperadas o piezas mal posicionadas en una línea de producción.
- Filtrado previo en robótica de manipulación: clasificar el objeto que hay sobre una mesa antes de seleccionar una estrategia de agarre, siempre que el objeto pertenezca a una de las 40 clases.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ModelNet40 | Overall Accuracy (OA) | 93,76 |
| ModelNet40 | Mean per-class Accuracy (mAcc) | 90,78 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a PointNet++, PointNeXt o DGCNN) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 43,6 M de parámetros en fp32, los pesos ocupan aproximadamente 175 MB; sumando activaciones para lotes pequeños, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento o ajuste fino se recomienda una RTX 3090/4090 o superior, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) sobre PyTorch. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de nubes de puntos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recon.modelnet40.zekun-qi | 43,6 M | Nube de puntos (pos + normal) | 93,76 (declarado) | MIT | Hugging Face, vía torch-pointcloud |
| PointNet++ | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | Implementaciones de referencia en repos públicos |
| DGCNN | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | Implementaciones de referencia en repos públicos |
| PointNeXt | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | Repositorio oficial |

No se dispone en la información proporcionada de cifras de los modelos alternativos para una comparación cuantitativa rigurosa; la tabla recoge solo lo que consta. La ventaja principal de este checkpoint frente a las alternativas es su empaquetado listo para usar en `torch-pointcloud` con licencia MIT.

## Limitaciones y advertencias

- Dominio restringido: solo clasifica las 40 categorías de ModelNet40; fuera de ellas las predicciones no son fiables.
- Dependencia de la representación: espera nubes de puntos con coordenadas y normales; sin normales o con densidades muy distintas a las de entrenamiento el rendimiento puede degradarse.
- Sesgos del dataset: ModelNet40 está compuesto por modelos CAD sintéticos, no por escaneos reales con ruido, oclusiones o fondos; el salto a datos reales puede ser notable.
- Riesgo de sobreajuste al benchmark: los valores de OA y mAcc son declarados por el autor y no están verificados de forma independiente.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los pesos originales de ReCon y de ModelNet40 si se redistribuye el modelo o los datos.
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje y no debe presentarse como tal.
- Documentación limitada: no hay datos publicados de cuantización, latencia ni comparativas con alternativas en la información disponible.
- Mantenimiento: el modelo fue creado en octubre de 2026 y actualizado en noviembre de 2026; su dependencia de la librería `torch-pointcloud` implica seguir sus versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/recon.modelnet40.zekun-qi
- Modelo preentrenado base: https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
- Paper (arXiv): https://arxiv.org/abs/2302.02318
- Repositorio original de ReCon: https://github.com/qizekun/ReCon
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
- Dataset ModelNet40 (referencia, paper 3D ShapeNets): https://arxiv.org/abs/1406.5670
