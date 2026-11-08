# torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen

## Resumen

PointGPT-B (variante `labeled-hybrid`) es un modelo de clasificación de nubes de puntos 3D desarrollado por el autor Guangyan Chen y empaquetado para Hugging Face por la organización `torch-pointcloud`. Se trata de un transformer con preentrenamiento generativo autorregresivo (GPT sobre secuencias de parches de puntos) afinado para clasificación supervisada sobre el conjunto de datos LabeledHybrid. El modelo resuelve la tarea de asignar una de 87 clases a una nube de puntos completa, un problema habitual en visión 3D, robótica y análisis de escenas.

El modelo parte del checkpoint de preentrenamiento autosupervisado `pointgpt-b.pretrain.guangyan-chen` (entrenado sobre ShapeNet-55) y se ha vuelto a entrenar con cabecera de clasificación sobre LabeledHybrid. Con 120,4 millones de parámetros y una dimensión de características de 1536, se sitúa en la gama media de los transformers específicos para nubes de puntos, muy por debajo de los grandes modelos multimodales 3D pero con un coste de inferencia contenido.

Su relevancia actual es práctica: el ecosistema de modelos 3D en Hugging Face sigue siendo mucho más reducido que el de texto o imagen, y disponer de un checkpoint PointGPT reproducible, con licencia MIT y una API de carga directa a través de la librería `torch-pointcloud`, facilita la evaluación y la integración en pipelines de investigación sin tener que reproducir el entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo sobre parches de puntos (PointGPT) |
| Parametros totales | 120.412.599 (120,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 1536 |
| Numero de clases | 87 |
| Dataset de ajuste | LabeledHybrid |
| Modelo base | torch-pointcloud/pointgpt-b.pretrain.guangyan-chen |
| Tamano del repositorio | 0,5 GB |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointGPT aplica la receta de los transformers generativos autorregresivos al dominio de las nubes de puntos. La nube se divide en parches locales, cada parche se codifica como un token y el modelo se entrena para predecir el siguiente parche a partir de los anteriores, lo que fuerza al encoder a aprender representaciones geométricas ricas sin necesidad de etiquetas. Este preentrenamiento autosupervisado se realizó en el checkpoint base sobre ShapeNet-55, según la información del modelo previo de la misma familia.

Sobre esa base, este checkpoint concreto se ha afinado de forma supervisada para clasificación sobre el conjunto LabeledHybrid, con una cabecera que produce logits sobre 87 clases y un vector de características de 1536 dimensiones. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset LabeledHybrid ni si se aplicaron técnicas de regularización específicas; esa información no está disponible. El modelo se distribuye a través de la librería `torch-pointcloud`, que ofrece utilidades de transformación y `collate` para preparar las muestras (coordenadas `pos` y vector `x` opcional) antes de la inferencia.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases a partir de coordenadas espaciales.
- Extracción de características: `forward_features` devuelve embeddings de dimensión 1536 por muestra, útiles como representación para tareas posteriores.
- Reutilización como backbone: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro para clasificación lineal, clustering o recuperación.
- Procesamiento de nubes de puntos de gran tamaño; el ejemplo oficial emplea 8192 puntos por muestra.
- Integración nativa con PyTorch y con la librería `torch-pointcloud` (carga con `tp.create_model`, transformaciones y `collate`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos 3D en investigación: usar el checkpoint directamente para etiquetar nubes de puntos de escaneos LiDAR o de reconstrucciones RGB-D en experimentos de visión 3D, aprovechando que la API de `torch-pointcloud` gestiona el preprocesado.
- Extracción de embeddings para búsqueda de formas: generar vectores de 1536 dimensiones con `forward_features` e indexarlos en un motor vectorial para recuperación de modelos 3D similares en un catálogo industrial.
- Preetiquetado en anotación de datos 3D: emplear el modelo como etiquetador automático de primer paso para reducir el coste de anotación manual de nubes de puntos, revisando después las predicciones de baja confianza.
- Base para aprendizaje por transferencia: sustituir la cabecera con `reset_classifier` y afinar sobre un dataset propio de pocas clases cuando no se dispone de suficientes datos etiquetados.
- Control de calidad en digitalización 3D: clasificar automáticamente objetos escaneados en un flujo de captura para detectar piezas mal escaneadas o categorías inesperadas.
- Robótica de manipulación: integrar el modelo como módulo de reconocimiento de categoría de objeto antes de que un planificador seleccione la estrategia de agarre, siempre que la latencia del pipeline lo permita.
- Benchmarking de arquitecturas 3D: usar el checkpoint como referencia reproducible en comparaciones de métodos de clasificación de nubes de puntos, dado que los pesos y el código de carga están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 120,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,48 GB; en fp16 alrededor de 0,24 GB. A esto hay que sumar las activaciones, que dependen del número de puntos por muestra (8192 en el ejemplo oficial) y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para lotes pequeños en fp32; una RTX 3060, RTX 4060 o superior funciona sin problemas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes (GTX 1660 en adelante, con margen según el tamaño de lote y el número de puntos).
- Opciones de despliegue: inferencia nativa en PyTorch mediante `torch-pointcloud`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-b.labeled-hybrid (este) | 120,4 M | nubes de puntos (8192 puntos en el ejemplo) | Clasificación 3D, 87 clases | MIT | Hugging Face |
| pointgpt-b.pretrain.guangyan-chen | no disponible | nubes de puntos | Preentrenamiento autosupervisado (ShapeNet-55) | MIT | Hugging Face |
| pointgpt-b.post-pretrain.guangyan-chen | no disponible | nubes de puntos | Clasificación (LabeledHybrid) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo con otras familias de clasificación de nubes de puntos (PointNet++, Point Transformer, etc.) en la información proporcionada, por lo que la comparación se limita a los checkpoints de la misma familia publicados por `torch-pointcloud`.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre LabeledHybrid con 87 clases; su rendimiento fuera de esa distribución de clases no está documentado y probablemente sea deficiente.
- No se han publicado métricas de precisión, sensibilidad al ruido, robustez a oclusiones ni comportamiento ante nubes de puntos incompletas.
- Al ser un modelo geométrico, no procesa texto ni imágenes; no debe emplearse en tareas lingüísticas o multimodales.
- No hay información sobre sesgos del dataset LabeledHybrid (posible desequilibrio de clases, sobrerrepresentación de ciertas categorías de objetos, sesgos de captura).
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza: al no haber calibración publicada, no se recomienda usar los logits como probabilidades sin validación previa.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar el modelo en producción recae en el integrador.
- El número de descargas (25) y de likes (0) indica una adopción muy limitada; conviene tratar el checkpoint como experimental.
- La fecha de creación del repositorio (2026) y la dependencia de la librería `torch-pointcloud` implican verificar la compatibilidad de versiones antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen
- Checkpoint de preentrenamiento: https://huggingface.co/torch-pointcloud/pointgpt-b.pretrain.guangyan-chen
- Checkpoint post-pretrain: https://huggingface.co/torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
