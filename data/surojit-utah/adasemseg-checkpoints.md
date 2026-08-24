# Surojit-Utah/adasemseg-checkpoints

## Resumen

AdaSemSeg es un método de segmentación semántica few-shot para la interpretación de facies sísmicas, desarrollado por S. Saha y R. Whitaker en la Universidad de Utah y publicado en IEEE Transactions on Geoscience and Remote Sensing en 2025. Este repositorio contiene los checkpoints entrenados del modelo bajo un protocolo de meta-entrenamiento leave-one-dataset-out: cada checkpoint se entrena en dos de los tres datasets sísmicos de referencia (F3, Parihaka y Penobscot) y se evalúa en el tercero sin ningún tipo de fine-tuning sobre datos de destino.

La propuesta clave es una arquitectura agnóstica al número de clases, que descompone la segmentación multiclase en tareas binarias que comparten un único backbone, de modo que el número de parámetros entrenables no crece con el número de facies del dataset. En inferencia, el dataset objetivo solo aporta un support set de 1 o 5 cortes anotados, sin actualizaciones de gradiente. Aunque el caso de estudio es sísmico, los autores argumentan que el enfoque es aplicable a cualquier escenario de few-shot segmentation donde tanto el dominio como el número de clases varíen en despliegue, como la segmentación médica cross-scanner.

La arquitectura combina un encoder ResNet-50 pre-entrenado con SimCLR, un decoder estilo U-Net y regresión con procesos Gaussianos en dos capas latentes (según la configuración de DGPNet). Los checkpoints ocupan 1,8 GB en total y se distribuyen bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ResNet-50 (inicializado con SimCLR) + decoder U-Net (doble convolución y convolución transpuesta) + regresión Gaussian Process en dos capas latentes (DGPNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (segmentación de imágenes 2D, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch (.pth.tar) con claves `net` o `state_dict` |

## Arquitectura y entrenamiento

AdaSemSeg es un modelo de segmentación few-shot con una arquitectura de múltiples componentes: un encoder de imágenes ResNet-50, un decoder estilo U-Net con doble convolución y convolución transpuesta, y dos capas de regresión Gaussian Process (GP) situadas en el bottleneck y la capa inmediatamente superior, siguiendo la configuración de DGPNet (Johnander et al., ECCV 2022). El encoder se inicializa con un checkpoint SimCLR pre-entrenado sobre datos sísmicos, lo que proporciona una representación de características robusta antes del meta-aprendizaje.

El entrenamiento sigue un protocolo de meta-aprendizaje leave-one-dataset-out: para cada checkpoint, el dataset objetivo se excluye completamente del entrenamiento, y el modelo se entrena de forma conjunta sobre los otros dos datasets (p. ej., F3 se evalúa con un checkpoint entrenado sobre Parihaka + Penobscot). Durante la meta-evaluación, el dataset objetivo solo aporta un support set de 1 o 5 slices anotadas, sin ningún paso de fine-tuning. Esta es una condición más estricta que la mayoría de trabajos de Generalized Few-Shot Segmentation (GFS-Seg), que típicamente evalúan clases no vistas dentro de un dominio ya conocido.

Una innovación destacable es que la arquitectura descompone la segmentación multiclase en tareas binarias que comparten un único backbone, lo que permite que el número de parámetros entrenables sea fijo e independiente del número de facies del dataset. Esto permite entrenar de forma conjunta sobre datasets con 6, 6 y 7 clases respectivamente sin rediseñar el modelo por dataset.

## Capacidades

- Segmentación semántica few-shot de imágenes 2D, específicamente diseñada para facies sísmicas.
- Arquitectura agnóstica al número de clases: descompone la segmentación multiclase en tareas binarias con un único backbone compartido.
- Generalización cross-domain sin fine-tuning: el modelo se evalúa sobre datasets completamente ausentes del entrenamiento, usando solo un support set de 1 o 5 slices anotadas en inferencia.
- Soporte de dos estrategias de selección de support set en evaluación (muestreo K=5 y vecino más cercano), controladas mediante un flag de tiempo de evaluación.
- Extensible por diseño a otros dominios de segmentación few-shot donde el dominio y la taxonomía de clases varíen en despliegue (p. ej., segmentación médica cross-institution).
- Sin capacidades de texto, lenguaje, tool calling o agentes: es un modelo de visión puro.

## Casos de uso

- Interpretación sísmica en exploración de hidrocarburos: dado un volumen sísmico nuevo con solo 1-5 slices anotadas manualmente por un geocientífico, AdaSemSeg genera una segmentación completa de facies sin necesidad de re-entrenar sobre el dataset objetivo, reduciendo el esfuerzo de anotación de semanas a minutos.
- Segmentación de facies en datasets sin etiquetado previo: para un dataset sísmico recién adquirido (p. ej., un nuevo campo de exploración), se puede aplicar el checkpoint meta-entrenado con un support set mínimo, sin requerir infraestructura de fine-tuning.
- Evaluación rápida de múltiples taxonomías de facies: al ser agnóstico al número de clases, se puede cambiar la definición de clases objetivo (p. ej., 5, 6 o 7 facies) sin modificar la arquitectura ni re-entrenar, solo proporcionando las support slices correspondientes.
- Benchmark de métodos few-shot en geofísica: sirve como baseline fuerte en comparaciones con ProtoSemSeg u otros métodos de segmentación few-shot sobre F3, Parihaka y Penobscot, con resultados publicados en la paper.
- Transferencia a segmentación médica cross-domain: los autores argumentan que el enfoque se puede aplicar a segmentación de imágenes médicas donde el dominio varía (p. ej., distintos escáneres o instituciones), usando el mismo protocolo leave-one-out y support sets reducidos.
- Investigación en meta-aprendizaje y few-shot segmentation: el repositorio incluye el código de evaluación y reproducción, permitiendo a investigadores estudiar el comportamiento de la regresión GP en capas latentes y el efecto de las estrategias de selección de support set.

## Benchmarks y rendimiento

La paper reporta la métrica FwF1 (F1 ponderada por frecuencia) en la Tabla III, comparando AdaSemSeg con el baseline basado en prototipos ProtoSemSeg y con transfer learning (fine-tuning sobre el support set del dataset objetivo). Los resultados son los siguientes:

| Dataset objetivo | Shots | AdaSemSeg | ProtoSemSeg | Transfer learning |
|---|---:|---:|---:|---:|
| F3 | 1 | **0.85** | 0.55 | 0.84 |
| F3 | 5 | **0.89** | 0.68 | 0.84 |
| Parihaka | 1 | **0.84** | 0.52 | 0.54 |
| Parihaka | 5 | **0.86** | 0.58 | 0.62 |
| Penobscot | 1 | **0.93** | 0.58 | 0.67 |
| Penobscot | 5 | **0.96** | 0.71 | 0.89 |

AdaSemSeg supera al método competidor basado en prototipos y al transfer learning en todos los escenarios, a pesar de no realizar fine-tuning sobre el dataset objetivo. Las desgloses completos de PA, MCA, FwIoU y FwF1 (en inline y crossline, para ambos shots) están disponibles en el README del repositorio principal y en el archivo `REPRODUCE.md`.

## Requisitos de hardware

- El tamaño del checkpoint es de 1.8 GB, lo que indica que el modelo completo ocupa aproximadamente esa cantidad en memoria. Con una arquitectura ResNet-50 + U-Net + GP, se estima que la inferencia en FP32 requiere alrededor de 8-12 GB de VRAM, por lo que cabe en una GPU consumer como la RTX 3080 (10 GB), RTX 4080 (16 GB) o RTX 4090 (24 GB).
- Para entrenamiento o meta-entrenamiento desde cero, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A5000) o GPUs de datacenter como A100.
- No hay cuantizaciones disponibles; el checkpoint se distribuye en precisión completa (FP32).
- El despliegue es exclusivamente mediante el código del repositorio GitHub (scripts de evaluación), ya que la arquitectura multi-componente (encoder + mask encoder + GP regression + decoder) requiere la clase de modelo definida en el repositorio, no se puede cargar con una API genérica.
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Rendimiento (FwF1, 1-shot F3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **AdaSemSeg** | ResNet-50 + U-Net + GP | Imágenes 2D, 1-5 shots | 0.85 | MIT | Checkpoints + código |
| **ProtoSemSeg** | Prototipos + ResNet | Imágenes 2D, 1-5 shots | 0.55 | MIT | Checkpoints en el Hub |
| **Transfer learning** | Fine-tuning sobre support set | Imágenes 2D | 0.84 | no disponible | no disponible |

ProtoSemSeg es el baseline prototípico de referencia en el paper, disponible también en Hugging Face. El transfer learning consiste en fine-tuning sobre el support set del dataset objetivo, una práctica común en segmentación con pocos datos. AdaSemSeg supera a ambos sin necesidad de fine-tuning, lo que lo hace más práctico en escenarios donde no hay capacidad de cómputo para adaptar el modelo al nuevo dominio.

## Limitaciones y advertencias

- El modelo es exclusivamente para segmentación de imágenes; no tiene capacidades de lenguaje, tool calling o agentes.
- Solo se han validado tres datasets sísmicos (F3, Parihaka, Penobscot); la generalización a otros dominios (p. ej., segmentación médica) es una afirmación teórica no validada experimentalmente en esta publicación.
- El rendimiento reportado depende de la calidad y representatividad del support set; en escenarios con support sets muy atípicos, el rendimiento puede degradarse.
- La carga del modelo requiere el código del repositorio GitHub; no hay un pipeline de HuggingFace que permita una integración directa, lo que dificulta su uso en producción con herramientas estándar.
- No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, HumanEval, etc., al no ser un modelo de lenguaje).
- No hay información sobre sesgos o riesgos de alucinación, ya que no es un modelo generativo de texto; en el contexto de segmentación, el riesgo principal es la clasificación errónea de facies en áreas de baja señal.
- La licencia MIT permite uso comercial, pero se recomienda revisar el paper y el código para entender las limitaciones de la metodología.

## Enlaces

- HuggingFace (checkpoints): https://huggingface.co/Surojit-Utah/adasemseg-checkpoints
- GitHub (código y reproducción): https://github.com/Surojit-Utah/AdaSemSeg
- Paper (arXiv): https://arxiv.org/abs/2501.16760
- PDF del paper: https://surojit-utah.github.io/files/AdaSemSeg.pdf
- Zenodo (checkpoints y metadatos): https://zenodo.org/records/21762769
- Encoder SimCLR pre-entrenado: https://huggingface.co/Surojit-Utah/adasemseg-simclr-encoder
- ProtoSemSeg (baseline): https://huggingface.co/Surojit-Utah/protosemseg-checkpoints
