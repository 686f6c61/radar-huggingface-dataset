# WangDuanchu/CompetitorFormer

## Resumen

CompetitorFormer es un modelo de segmentación de instancias 3D desarrollado por Duanchu Wang y colaboradores, presentado en CVPR 2026. Su objetivo es resolver el problema de los conflictos entre consultas (queries) en métodos basados en transformer para segmentación de instancias en escenas tridimensionales. El modelo introduce una estrategia competitiva que permite que las consultas compitan entre sí para asignar mejor las instancias, mitigando así la redundancia y la ambigüedad que se produce cuando el número de consultas fijas supera al de instancias reales en la escena.

La arquitectura es un transformer con un mecanismo de competencia entre consultas, diseñado específicamente para trabajar con nubes de puntos o representaciones 3D. Se proporcionan dos checkpoints oficiales: uno entrenado y evaluado en ScanNet++ (con métricas AP 0.3335, AP50 0.4725, AP25 0.5640) y otro opcional para ScanNet v2 (AP 0.6276, AP50 0.8072, AP25 0.8718). El modelo está disponible bajo licencia MIT, con código abierto en GitHub y pesos publicados en HuggingFace. Su relevancia radica en mejorar la precisión de la segmentación de instancias 3D, una tarea fundamental para robótica, realidad aumentada y análisis de entornos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con estrategia competitiva entre consultas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

CompetitorFormer se basa en un transformer que procesa características 3D (típicamente extraídas de nubes de puntos) y utiliza un conjunto de consultas de instancia. La innovación principal es un mecanismo de competencia entre consultas: en lugar de tratar cada consulta de forma independiente, el modelo permite que las consultas compitan entre sí para determinar cuál es la más adecuada para cada instancia, reduciendo así los conflictos que surgen cuando varias consultas apuntan a la misma región o cuando una consulta se asigna a una instancia incorrecta. Este enfoque se inspira en trabajos previos como EASE-DETR para detección 2D, pero adaptado al dominio 3D.

El entrenamiento se realiza en los conjuntos de datos ScanNet++ y ScanNet v2, con evaluaciones en los splits de validación justa (fair val). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión y no de lenguaje. El código oficial está disponible en GitHub, lo que permite reproducir el entrenamiento y la evaluación.

## Capacidades

- Segmentación de instancias 3D en escenas interiores, prediciendo máscaras de instancia para objetos individuales.
- Manejo de escenas con un número variable de instancias, gracias al mecanismo de competencia entre consultas.
- Evaluación en dos benchmarks estándar: ScanNet++ y ScanNet v2, con métricas AP, AP50 y AP25.
- Soporte para diferentes configuraciones de número de consultas (500 para ScanNet++, 400 para ScanNet).
- Integración con el ecosistema PyTorch, facilitando su uso en pipelines de investigación y desarrollo.
- No incluye capacidades de lenguaje, generación de texto, tool calling ni agentes, al ser un modelo puramente visual.

## Casos de uso

- Robótica de interiores: un robot móvil puede usar CompetitorFormer para segmentar objetos en una habitación a partir de nubes de puntos, permitiendo la navegación y manipulación precisa de elementos como sillas, mesas o puertas.
- Realidad aumentada y virtual: en aplicaciones de AR, el modelo puede identificar y separar instancias 3D en tiempo real para superponer contenido digital sobre objetos específicos, mejorando la interacción con el entorno.
- Análisis de escenas para arquitectura y construcción: al procesar escaneos 3D de edificios, el modelo ayuda a identificar elementos estructurales y mobiliario, facilitando tareas de modelado y planificación.
- Automatización de inventario en almacenes: mediante sensores 3D, CompetitorFormer puede segmentar cajas, estanterías y otros objetos para sistemas de gestión de inventario automatizados.
- Investigación en visión por computador: como punto de partida para experimentos sobre segmentación de instancias 3D, gracias a su código abierto y pesos preentrenados.
- Sistemas de asistencia para personas con discapacidad visual: combinado con cámaras de profundidad, el modelo puede describir la disposición de objetos en una habitación, ayudando a la navegación.

## Benchmarks y rendimiento

Se han publicado resultados en los conjuntos de validación justa de ScanNet++ y ScanNet v2. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Conjunto de datos | AP | AP50 | AP25 | num_query |
|---|---|---|---|---|
| ScanNet++ (fair val) | 0.3335 | 0.4725 | 0.5640 | 500 |
| ScanNet v2 (fair val) | 0.6276 | 0.8072 | 0.8718 | 400 |

Estos valores corresponden a los checkpoints oficiales publicados en HuggingFace. No se han encontrado resultados adicionales en otras fuentes.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware en la documentación proporcionada.
- El tamaño del repositorio es de 0.6 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente esa cantidad, pero no se conoce el número exacto de parámetros.
- Dado que es un transformer para visión 3D, se recomienda al menos una GPU con 8-12 GB de VRAM para inferencia en escenas de tamaño moderado, aunque esto es una estimación no confirmada.
- Para entrenamiento o fine-tuning, se necesitaría una GPU de gama alta (por ejemplo, A100 o RTX 4090) con mayor memoria, pero no hay datos concretos.
- El despliegue puede realizarse con PyTorch estándar; no se mencionan integraciones con vLLM, llama.cpp u otras herramientas de inferencia optimizada, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros métodos de segmentación de instancias 3D con los que comparar directamente en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en escenas interiores de los conjuntos ScanNet y ScanNet++, por lo que su rendimiento puede degradarse en entornos exteriores o con distribuciones de datos muy diferentes.
- No se han documentado sesgos específicos, pero al depender de los datos de entrenamiento, podría presentar un rendimiento inferior en escenas con objetos poco comunes o configuraciones atípicas.
- Al ser un modelo de visión, no genera texto ni razona sobre lenguaje; su uso se limita a la segmentación de instancias 3D.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los términos de los conjuntos de datos utilizados (ScanNet, ScanNet++) para posibles limitaciones de redistribución.
- No se proporcionan garantías sobre la precisión en escenarios de producción; se recomienda validar el modelo con datos propios antes de implementarlo.

## Enlaces

- HuggingFace: https://huggingface.co/WangDuanchu/CompetitorFormer
- GitHub (código oficial): https://github.com/DuanchuWang/CompetitorFormer
- Paper en arXiv: https://arxiv.org/abs/2411.14179
- Página del póster en CVPR 2026: https://cvpr.thecvf.com/virtual/2026/poster/37393
