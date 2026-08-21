# zyan1deOG/nika5

## Resumen

nika5 es un modelo de mundo (world model) desarrollado por zyan1deOG (Sai Vegasena) para reconstruir imágenes del Sol a partir de datos multi-espectrales. Concretamente, el modelo recibe 8 de las 9 longitudes de onda del instrumento AIA del satélite SDO, junto con el magnetograma vectorial del HMI, y debe predecir la longitud de onda oculta. Está diseñado para operar como un sistema de reconstrucción y predicción en el dominio de la física solar, usando una arquitectura ligera de 1,16 millones de parámetros basada en MLPs, pooling y gates, organizada en encoders, un grafo latente, módulos de dinámica y un readout.

El modelo se entrena en unos 2.000 pasos (aproximadamente cinco minutos en una GPU) sobre el conjunto de datos SDOML v2, que contiene observaciones alineadas de 9 canales de longitud de onda y el campo magnético, con imágenes de 256×256 píxeles. Su relevancia radica en que combina técnicas de aprendizaje profundo con datos físicos reales de la NASA, demostrando que un modelo pequeño puede capturar correlaciones complejas entre distintas longitudes de onda y el campo magnético solar, y que además es capaz de aprender con un entrenamiento muy rápido y eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con pooling, gates, latent graph (encoders, dynamics, readout) |
| Parametros totales | 1,16 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imágenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente checkpoint de PyTorch, no se especifica) |

## Arquitectura y entrenamiento

La arquitectura de nika5 se describe como una combinación de encoders, un grafo latente, módulos de dinámica y un readout. Aunque no se detalla la implementación exacta, la estructura sugiere un diseño modular que procesa cada una de las 8 imágenes de entrada (más el magnetograma) a través de encoders, comprime la información en un espacio latente con estructura de grafo, aplica un paso de dinámica temporal y finalmente genera la imagen de la longitud de onda faltante mediante un readout. El uso de pooling y gates permite que el modelo seleccione y combine información de forma adaptativa entre los distintos canales espectrales.

El entrenamiento se realiza con una estrategia de enmascarado de canales: se oculta una de las 9 longitudes de onda y se pide al modelo que la reconstruya a partir de las restantes. Se utilizan 2.000 iteraciones con una tasa de aprendizaje de 3e-3, que fue ajustada por un bucle de investigación autónomo (el sistema descubrió que la tasa original era 15 veces demasiado baja y la subió hasta cerca del punto de divergencia). Los datos provienen del conjunto SDOML v2 (Galvez et al.), leídos desde el bucket público de la NASA `gov-nasa-hdrl-data1`, y comprenden el mes de agosto de 2010, con los 9 canales de AIA y el magnetograma HMI, alineados y reducidos a 256×256. Los días de entrenamiento y validación no se mezclan, y los días de validación no se utilizan en el entrenamiento.

## Capacidades

- Reconstrucción de una longitud de onda solar (canal AIA) a partir de las otras 8 y del campo magnético HMI.
- Modelado de correlaciones entre diferentes longitudes de onda y el magnetograma.
- Aprendizaje de una representación latente de la dinámica solar (world model).
- Entrenamiento rápido y ligero (5 minutos en una GPU) con pocos parámetros.
- Capacidad de generalización a días no vistos en el entrenamiento (validación separada).
- No incluye capacidades de procesamiento de lenguaje natural, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- **Reconstrucción de datos faltantes en observaciones solares**: cuando un instrumento falla o un canal de imagen no está disponible, nika5 puede estimar la longitud de onda ausente a partir de los otros canales y del campo magnético, lo que es útil para completar series temporales de observaciones.
- **Análisis de actividad solar**: el modelo puede utilizarse para estudiar cómo se relacionan las distintas emisiones de radiación (por ejemplo, en el ultravioleta extremo) con el campo magnético, ayudando a comprender fenómenos como las fulguraciones o las eyecciones de masa coronal.
- **Preprocesamiento de datos para otros modelos**: las imágenes reconstruidas pueden servir como entrada a modelos de predicción de eventos solares o de climatología espacial.
- **Investigación en world models**: dado que nika5 es un ejemplo de modelo de mundo aplicado a un dominio físico, puede usarse como referencia para experimentos sobre representaciones latentes y dinámica en sistemas complejos.
- **Optimización de pipelines de datos en astrofísica**: su capacidad de entrenamiento rápido permite integrarlo en flujos de trabajo que requieren recalibraciones frecuentes con nuevos datos.
- **Evaluación de técnicas de auto-supervisión**: el enfoque de enmascarado de canales puede servir como caso de estudio para métodos de aprendizaje con poca supervisión en datos científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque el modelo no es de lenguaje. En su lugar, la model card reporta una métrica específica para la tarea de reconstrucción: una media armónica sobre los 9 canales de la precisión relativa al baseline más fuerte, en días de validación.

| Métrica | Valor |
|---|---|
| Score (replicado, media de 3 semillas) | 0,409 ± 0,017 |
| Mejor score observado | 0,456 |
| Número de experimentos en un día | 35 (10 récords) |

Estos valores indican que el modelo supera al mejor baseline (no se especifica cuál) en la reconstrucción de cada canal, con una mejora notable en la mejor ejecución.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado el tamaño (1,16 millones de parámetros) y el entrenamiento en 2.000 pasos, es razonable que se ejecute en una GPU de gama media (por ejemplo, una NVIDIA RTX 3060 o superior) con poca VRAM (probablemente menos de 2 GB).
- El modelo es suficientemente pequeño para ejecutarse en CPU, aunque la inferencia será más lenta que en GPU.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), pero al ser un modelo de visión con checkpoints de PyTorch, se puede cargar con `torch.load` y ejecutar en cualquier entorno con PyTorch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de mundo para física solar). El campo de los world models es amplio, pero no hay datos públicos de modelos que realicen exactamente la misma tarea con los mismos datos. Por tanto, no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo solo ha sido validado con datos de agosto de 2010 (SDOML v2); su generalización a otras épocas o condiciones solares no está verificada.
- Las imágenes se reducen a 256×256, lo que limita la resolución espacial y puede no capturar detalles finos relevantes para ciertos análisis.
- No se han reportado análisis de sesgos o de errores sistemáticos por canal.
- El modelo no es un sistema de lenguaje, por lo que no se aplican consideraciones de alucinación o sesgo lingüístico.
- La licencia MIT permite uso comercial y modificación, pero no hay garantías de robustez en entornos productivos fuera del contexto de investigación.
- El repositorio no incluye pesos pre-entrenados visibles en Hugging Face (tamaño 0.0 GB), aunque se menciona un checkpoint `ckpt.pt` en la documentación; el acceso al mismo no está confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyan1deOG/nika5
- Perfil del autor en Hugging Face: https://huggingface.co/zyan1deOG
- No se han encontrado papers, repositorios o demos adicionales en la búsqueda web.
