# torch-pointcloud/pointgpt-l.scanobjectnn-hardest.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en un transformer con preentrenamiento generativo autorregresivo. Lo desarrolla el grupo de investigación de Guangyan Chen (BIT) y esta versión concreta la distribuye la organización `torch-pointcloud` como un checkpoint afinado sobre el dataset ScanObjectNN, en su variante más difícil (PB_T50_RS), con 15 clases de objetos del mundo real. El modelo parte del checkpoint base `pointgpt-l.labeled-hybrid.guangyan-chen` y se ha convertido al ecosistema de la librería `torch-pointcloud` para su uso directo en PyTorch.

Con 360,4 millones de parámetros, PointGPT-L aplica la filosofía de GPT al dominio de las nubes de puntos: en lugar de entrenar con objetivos discriminativos, aprende a predecir de forma autorregresiva fragmentos de la nube de puntos, lo que le permite capturar estructura geométrica local y global. Esta ficha corresponde al checkpoint especializado en clasificación, no a un modelo de lenguaje: no procesa texto, sino coordenadas 3D.

Su relevancia actual radica en que ofrece un rendimiento estado del arte en clasificación de objetos 3D reales con oclusión y ruido (93,75 % de accuracy global en ScanObjectNN PB_T50_RS) y una licencia MIT permisiva, lo que facilita su integración en pipelines de visión 3D, robótica y percepción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parametros totales | 360.365.935 (360,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de 8192 puntos; dimensión de features 2048) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,4 GB) |

## Arquitectura y entrenamiento

PointGPT traslada el paradigma de preentrenamiento autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos. La nube se divide en parches (patches) y el modelo aprende a predecir el siguiente parche a partir de los anteriores, lo que fuerza al encoder a aprender representaciones geométricas jerárquicas sin necesidad de etiquetas. Sobre esa base preentrenada se aplica un cabezal de clasificación y se afina de forma supervisada en ScanObjectNN, un dataset de objetos 3D escaneados en entornos reales con oclusión parcial, ruido de sensor y variabilidad de puntos de vista.

La variante PB_T50_RS es la configuración más exigente de ScanObjectNN: los objetos se han perturbado con traslación y rotación, y se ha aplicado una reducción de resolución (resampling) que elimina información. El checkpoint base declarado es `pointgpt-l.labeled-hybrid.guangyan-chen`, lo que sugiere un preentrenamiento híbrido (posiblemente combinando datos etiquetados y no etiquetados). El modelo procesa 8192 puntos por muestra y produce un vector de features de 2048 dimensiones antes del clasificador de 15 clases. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos del mundo real (ScanObjectNN).
- Extracción de embeddings geométricos de 2048 dimensiones mediante `forward_features`, reutilizables para tareas downstream (retrieval, clustering, transfer learning).
- Robustez ante oclusión parcial, ruido y perturbaciones de rotación/traslación (características del split PB_T50_RS).
- Procesamiento de hasta 8192 puntos por muestra.
- Integración nativa con la librería `torch-pointcloud` mediante `tp.create_model` y utilidades de collate.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión 3D.
- No tiene capacidades multilingües ni de visión 2D.

## Casos de uso

- **Clasificación de objetos en escaneos LiDAR o RGB-D**: el modelo recibe nubes de puntos de 8192 puntos y devuelve una de 15 clases; es adecuado para pipelines de percepción en robótica móvil donde se necesita identificar sillas, mesas, puertas u otros objetos de interior.
- **Preprocesado para robótica de manipulación**: extraer embeddings de 2048 dimensiones con `forward_features` para alimentar un módulo de agarre o planificación que necesite una representación compacta del objeto.
- **Transfer learning a dominios propios**: usar el checkpoint como inicialización y reentrenar el clasificador (`reset_classifier`) con un número de clases distinto para datasets industriales o médicos con pocas muestras.
- **Búsqueda y recuperación de modelos 3D**: indexar los embeddings de una base de datos de mallas escaneadas y hacer búsqueda por similitud geométrica para catálogos de fabricación o e-commerce.
- **Control de calidad en escaneo 3D**: clasificar automáticamente los objetos capturados por un escáner para detectar piezas mal posicionadas o fuera de categoría en una línea de inspección.
- **Anotación asistida de datasets 3D**: preetiquetar nubes de puntos con las 15 clases de ScanObjectNN para acelerar el etiquetado manual en proyectos de percepción.
- **Benchmark de referencia para investigación**: servir como baseline reproducible (licencia MIT, pesos safetensors) en publicaciones que evalúen nuevos métodos de clasificación 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (PB_T50_RS) | OA (Overall Accuracy) | 93,75 |
| ScanObjectNN (PB_T50_RS) | mAcc (mean Accuracy) | 93,66 |

No se han publicado en la información disponible resultados de otros benchmarks (ModelNet40, ShapeNet, etc.) para este checkpoint concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp32 (~1,4 GB) se necesitan aproximadamente 2-3 GB de VRAM incluyendo activaciones para un batch pequeño; en fp16 el peso baja a ~0,7 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32 con batch de 1-8. Para entrenamiento o fine-tuning con batch grande se recomienda A100, H100 o RTX 4090 (16-24 GB).
- **Cabe en GPU de consumo**: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- **Opciones de despliegue**: la librería `torch-pointcloud` sobre PyTorch es la vía oficial. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de nubes de puntos).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 360,4 M | 8192 puntos | 93,75 | MIT | Hugging Face (`torch-pointcloud`) |
| PointGPT-S / PointGPT-B | no disponible | 8192 puntos | no disponible en esta ficha | MIT | Hugging Face (colección `torch-pointcloud/pointgpt`) |
| Point-MAE | no disponible | 1024 puntos | no disponible | MIT (repo original) | GitHub / pesos comunitarios |
| PointNet++ | no disponible | 1024-8192 puntos | no disponible | MIT | Implementaciones múltiples |

No se dispone de datos comparativos verificados de otros modelos en la información proporcionada; las filas de alternativas se incluyen solo como referencia de categoría y deben contrastarse con las publicaciones originales.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo solo clasifica entre 15 clases de objetos de interior de ScanObjectNN; no generaliza a categorías arbitrarias sin reentrenamiento.
- **Entrada fija**: espera 8192 puntos por muestra; nubes con otro tamaño requieren remuestreo, lo que puede degradar la precisión.
- **Sin capacidades lingüísticas**: no procesa texto ni instrucciones; no debe confundirse con un LLM pese al nombre "GPT".
- **Riesgo de sobreajuste al benchmark**: el checkpoint está afinado específicamente en PB_T50_RS; el rendimiento en escenas reales fuera de distribución puede ser inferior al 93,75 % reportado.
- **Resultados no verificados**: las métricas del `model-index` están marcadas como `verified: false`; no han sido reproducidas de forma independiente.
- **Licencia MIT**: permite uso comercial y modificación, pero se recomienda citar el paper original de PointGPT y el trabajo de ScanObjectNN.
- **Sesgos del dataset**: ScanObjectNN contiene objetos de interior capturados con sensores concretos; puede haber sesgo hacia geometrías y materiales sobrerrepresentados.
- **Sin cuantizaciones publicadas**: no hay variantes GGUF/ONNX en el repo, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-hardest.guangyan-chen)
- [Colección PointGPT en Hugging Face](https://huggingface.co/collections/torch-pointcloud/pointgpt)
- [Paper PointGPT (arXiv:2305.11487)](https://arxiv.org/abs/2305.11487)
- [Repositorio original CGuangyan-BIT/PointGPT](https://github.com/CGuangyan-BIT/PointGPT)
- [Librería torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [Modelo base: pointgpt-l.labeled-hybrid.guangyan-chen](https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen)
