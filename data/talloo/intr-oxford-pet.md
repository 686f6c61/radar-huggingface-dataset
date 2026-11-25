# Talloo/intr-oxford-pet

## Resumen

INTR sobre Oxford-IIIT Pet es un conjunto de pesos entrenados para reproducir el modelo INTR (*A Simple Interpretable Transformer for Fine-Grained Image Classification and Analysis*, Paul et al., ICLR 2024) en la tarea de clasificación de razas de perros y gatos. Lo publica el usuario Talloo como proyecto de curso (equipo de la IBA, otoño de 2026) y su interés no reside en el rendimiento bruto, sino en la interpretabilidad: el modelo expone mapas de atención por clase que permiten auditar qué regiones de la imagen sustentan cada predicción.

El repositorio (~0,4 GB) contiene tres checkpoints en formato `.pth` de PyTorch: la reproducción principal de INTR con 8 cabezas de atención (91,74 % top-1 en test), una ablación con una sola cabeza de atención cruzada (92,26 %) y una línea base ResNet-50 (93,00 %). Incluye además un CSV con las predicciones del ResNet-50 sobre el conjunto de test para el cuaderno de análisis.

Es relevante para quien investigue clasificación fine-grained con modelos interpretables por diseño, ya que permite comparar directamente un transformer de atención explícita frente a una CNN opaca en el mismo dataset, con artefactos listos para análisis de mapas de atención y sin coste de reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención interpretable (INTR); atención cruzada por clase sobre parches de imagen |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no disponible) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoints de `state_dict`) |

## Arquitectura y entrenamiento

INTR es un transformer de visión diseñado para clasificación fine-grained interpretable: en lugar de aplicar atención global sobre todos los tokens, emplea atención cruzada donde cada clase actúa como consulta sobre los parches de la imagen, de modo que el mapa de atención resultante es directamente atribuible a la clase predicha. El checkpoint principal usa 8 cabezas de atención; la ablación `R2` reduce a una única cabeza de atención cruzada. La línea base es una ResNet-50 convencional.

El entrenamiento se realizó sobre el dataset Oxford-IIIT Pet (37 clases de razas de perros y gatos). No se especifican en la información disponible el número de tokens, la composición exacta del dataset, la resolución de entrada, el número de épocas ni si se aplicaron técnicas de aumento de datos o regularización más allá de lo descrito en el paper original. Tampoco se documenta el uso de RLHF/DPO (no aplicable a clasificación) ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Clasificación de imágenes en 37 clases de razas de perros y gatos (Oxford-IIIT Pet).
- Generación de mapas de atención por clase para interpretabilidad y análisis de regiones discriminativas.
- Comparación controlada entre atención multi-cabeza (8 cabezas) y atención de una sola cabeza (ablación).
- Predicciones exportadas a CSV para análisis reproducible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingüe ni procesa texto: es exclusivamente un clasificador de imágenes.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación en interpretabilidad: usar los mapas de atención de INTR para estudiar qué regiones de la imagen activan cada clase y comparar con las activaciones de la ResNet-50 sobre el mismo conjunto de test.
- Docencia y proyectos de curso: el repositorio incluye checkpoints, CSV de predicciones y enlace al código y la app, lo que facilita reproducir el experimento y analizar la diferencia entre modelos interpretables y opacos.
- Clasificación fine-grained de mascotas en un pipeline interno: con 91,74 % top-1 en test, es adecuado para demos o prototipos de identificación de razas donde la explicabilidad importa más que el estado del arte.
- Auditoría de sesgos en clasificación de razas: los mapas de atención permiten detectar si el modelo se apoya en el fondo o en el contexto en lugar del animal, un análisis útil antes de desplegar sistemas similares.
- Benchmark de referencia para nuevas variantes de INTR: el par de checkpoints (8 cabezas vs. 1 cabeza) sirve como línea base reproducible para comparar modificaciones arquitectónicas.
- Análisis comparativo CNN vs. transformer: la inclusión de la ResNet-50 con sus predicciones en CSV permite estudiar la relación entre precisión y explicabilidad en el mismo dataset.

## Benchmarks y rendimiento

Resultados de test reportados en la model card sobre Oxford-IIIT Pet:

| Modelo | Test top-1 |
|---|---|
| INTR, 8 cabezas (reproducción) | 91,74 % |
| INTR, 1 cabeza de atención cruzada (ablación) | 92,26 % |
| ResNet-50 (línea base) | 93,00 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni métricas adicionales como precisión por clase, F1 o matrices de confusión.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,4 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (8 GB o menos) asumiendo un tamaño de modelo típico de transformer de visión.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060/4060 o superior es suficiente. Para entrenamiento o evaluación por lotes, se recomienda una RTX 4090 o una A100/H100.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del repositorio.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict` con `torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Test top-1 (Oxford-IIIT Pet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INTR 8 cabezas (este modelo) | no disponible | no disponible | 91,74 % | Apache 2.0 | Hugging Face |
| INTR 1 cabeza (ablación) | no disponible | no disponible | 92,26 % | Apache 2.0 | Hugging Face |
| ResNet-50 (línea base) | ~25,6 M (arquitectura estándar) | 224×224 típico | 93,00 % | Apache 2.0 | Hugging Face |
| Otras reproducciones de INTR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría (clasificación fine-grained interpretable) dentro de la información proporcionada.

## Limitaciones y advertencias

- Es un proyecto de curso, no un modelo validado en producción; los pesos pueden no haber pasado por una revisión exhaustiva.
- El rendimiento (91,74 %) es inferior a la línea base ResNet-50 (93,00 %), por lo que no es la mejor opción si prima la precisión sobre la interpretabilidad.
- El modelo está entrenado exclusivamente en Oxford-IIIT Pet (37 razas); no generaliza a otras especies, objetos o dominios sin reentrenamiento.
- No se documentan sesgos conocidos, pero al ser un dataset de razas puede heredar desequilibrios de clase y sesgos de representación del propio dataset.
- Riesgo de alucinación no aplicable (es un clasificador), pero sí riesgo de sobreconfianza en clases visualmente similares.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se especifican la resolución de entrada, el preprocesado ni los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Los checkpoints están en `.pth`; requieren cargar el código del repositorio de GitHub para instanciar la arquitectura correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/Talloo/intr-oxford-pet
- Repositorio de código, entrenamiento y app: https://github.com/TalalImran07/intr-ml-project
- Paper de referencia: Paul et al., *INTR: A Simple Interpretable Transformer for Fine-Grained Image Classification and Analysis*, ICLR 2024 (enlace directo no disponible en la información proporcionada)
- Dataset: Oxford-IIIT Pet (enlace no disponible en la información proporcionada)
