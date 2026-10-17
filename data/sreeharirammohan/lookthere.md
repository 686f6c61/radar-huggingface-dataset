# SreehariRamMohan/lookthere

## Resumen

LookThere es un marco de visión dispersa y una colección de checkpoints publicados por Sreehari Rammohan y colaboradores (NeurIPS 2026), no un modelo generativo de lenguaje. Se basa en DINOv2 ViT-B/14 y separa la percepción en un selector de parches, que decide dónde mirar, y un extractor de características, que decide qué representar; ambos se entrenan conjuntamente con aprendizaje por refuerzo.

El problema que aborda es el coste computacional de procesar todas las regiones de una imagen en un vision transformer. LookThere aprende políticas específicas por tarea que alcanzan precisiones del 96,7% con un 90,0% de dispersión y del 90,0% con un 99,6% en TT-100K, lo que permite clasificación visual con un subconjunto mínimo de parches.

Su relevancia actual es doble: ofrece checkpoints listos para evaluar en tareas de billar, señales de tráfico, aves e ImageNet-1K, y publica checkpoints de warmup con estado del optimizador para reproducir o continuar el entrenamiento RL. No se declaran parámetros totales, contexto textual, idiomas ni requisitos de hardware en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer con selección dispersa de parches: selector de tokens + extractor DINOv2 ViT-B/14, entrenados conjuntamente con RL. |
| Parámetros totales | No disponible. El backbone declarado es DINOv2 ViT-B/14; el repositorio contiene varios checkpoints y pesa 9,9 GB en total. |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE). |
| Longitud de contexto | No disponible / no aplica: modelo de visión sin ventana de contexto textual declarada. |
| Tipos de cuantización | No disponible. Solo se distribuyen checkpoints PyTorch `.pt`; no se mencionan variantes GGUF, AWQ, GPTQ ni cuantizadas. |
| Idiomas soportados | No disponible. No se declaran capacidades lingüísticas; las tareas son de visión. |
| Licencia | Apache 2.0. |
| Formato de pesos | PyTorch `.pt`, cargados con `torch.load(path, weights_only=True)`. Cada archivo incluye pesos del selector y del extractor, ajustes de evaluación y, en el modelo ImageNet al 90%, `logit_offset=3`. |
| Tamaño del repositorio | 9,9 GB (conjunto de checkpoints). |

## Arquitectura y entrenamiento

LookThere modela la percepción como dos procesos interdependientes: un selector de tokens que aprende dónde mirar y un extractor de características que aprende qué representar. El backbone es DINOv2 ViT-B/14 y ambos componentes se entrenan de forma conjunta con aprendizaje por refuerzo para recuperar información relevante de una entrada dispersa. La política selecciona parches; por ello la precisión puede variar unas décimas entre ejecuciones.

El entrenamiento reportado incluye una fase de warmup con todos los parches antes del RL; los checkpoints de warmup conservan el estado del optimizador para reanudar el entrenamiento. Algunos modelos se inicializan por destilación desde DINOv2: el checkpoint ImageNet-1K destilado se usa como punto de partida para Birdsnap, que se ajusta finamente sin warmup. No se detallan el número de tokens de entrenamiento, la composición de los datasets, ni el uso de RLHF/DPO; tampoco se describe una innovación de decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de imágenes con selección adaptativa de parches: los checkpoints eligen un subconjunto de parches mediante una política entrenada con RL y aplican el extractor DINOv2 ViT-B/14.
- Razonamiento visual específico en escenas de billar: `max-left-right` con checkpoint RL; `rightmost-number` y `left-color-min-max` con checkpoints de warmup.
- Clasificación de señales de tráfico en TT-100K con modelos al 95% y 99,6% de dispersión.
- Clasificación de especies de aves en Birdsnap con modelos al 90%, 95% y 97% de dispersión.
- Clasificación general en ImageNet-1K con un modelo al 90% de dispersión.
- Entrenamiento RL reproducible: checkpoints de warmup con estado del optimizador; el modelo ImageNet destilado sirve de inicialización para Birdsnap.
- No se declaran capacidades de generación de texto, código, matemáticas, tool calling, agentes, multilingüismo, audio ni visión-lenguaje.

## Casos de uso

- Clasificación de señales de tráfico en vehículos y sistemas embebidos: el checkpoint TT-100K al 95,9% de precisión y 94,8% de dispersión puede integrarse en un pipeline de visión para vehículos o señalización viaria, reduciendo el número de regiones procesadas. Requiere validación adicional para uso en seguridad.
- Análisis automatizado de mesas de billar: el checkpoint `max-left-right` alcanza 96,7% con 90,0% de dispersión y puede emplearse en herramientas de análisis de jugadas o reconstrucción del estado de la mesa.
- Identificación de aves en aplicaciones de ciencia ciudadana: los checkpoints Birdsnap, con precisiones entre 80,5% y 88,0% según dispersión, sirven para prefiltrar imágenes de cámaras o aplicaciones de observación; no sustituyen a un experto.
- Clasificación de imágenes en el edge con ImageNet-1K: el checkpoint al 90% de dispersión reporta 81,6% de precisión y puede usarse en prototipos de bajo cómputo, respetando el `logit_offset=3` guardado en el archivo.
- Reproducción y extensión de investigación en computación adaptativa: los checkpoints de warmup permiten iniciar RL desde un estado conocido, comparar políticas de selección y estudiar el compromiso precisión-dispersión.
- Destilación y ajuste fino en dominios personalizados: el checkpoint destilado de ImageNet puede usarse como inicialización para nuevas tareas de clasificación; el autor documenta ese flujo para Birdsnap.
- Evaluación de robustez de selectores de parches: los checkpoints a distintos niveles de dispersión permiten medir la degradación de precisión y comparar configuraciones sobre una misma base DINOv2 ViT-B/14.

## Benchmarks y rendimiento

La información proporcionada no incluye benchmarks estándar de lenguaje. Los únicos resultados disponibles son las precisiones de validación reportadas por el autor para cada checkpoint. La precisión puede variar unas décimas entre ejecuciones por la selección aleatoria de parches.

| Checkpoint | Tarea | Configuración | Precisión @ dispersión |
|---|---|---|---|
| `billiards/max-left-right/sparsity90/model.pt` | Billiards (max-left-right) | `configs/billiards/billiards_90_rl.yaml` | 96,7 @ 90,0% |
| `billiards/max-left-right/sparsity99/model.pt` | Billiards (max-left-right) | `configs/billiards/billiards_99_rl.yaml` | 93,8 @ 99,0% |
| `tt100k/sparsity95/model.pt` | TT-100K traffic signs | `configs/tt100k/tt100k_95_rl.yaml` | 95,9 @ 94,8% |
| `tt100k/sparsity99.6/model.pt` | TT-100K traffic signs | `configs/tt100k/tt100k_99_rl.yaml` | 90,0 @ 99,6% |
| `birdsnap/sparsity90_distillinit/model.pt` | Birdsnap | `configs/birdsnap/birdsnap_95_rl.yaml` | 88,0 @ 90,2% |
| `birdsnap/sparsity95_distillinit/model.pt` | Birdsnap | `configs/birdsnap/birdsnap_95_rl.yaml` | 85,4 @ 95,1% |
| `birdsnap/sparsity97_distillinit/model.pt` | Birdsnap | `configs/birdsnap/birdsnap_95_rl.yaml` | 80,5 @ 97,1% |
| `imagenet/sparsity90/model.pt` | ImageNet-1K | `configs/imagenet/imagenet_90_rl.yaml` | 81,6 @ 90,0% |
| `imagenet/distill_pretrain/model.pt` | ImageNet-1K (destilado de DINOv2) | `configs/imagenet/imagenet_distill_dinov2.yaml` | Sin precisión reportada; 67,6% de dispersión |

Checkpoints de warmup, con precisión usando todos los parches:

| Checkpoint | Tarea | Precisión con todos los parches |
|---|---|---|
| `billiards/max-left-right/warmup/model.pt` | max-left-right | 97,5 |
| `billiards/rightmost-number/warmup/model.pt` | rightmost-number | 98,1 |
| `billiards/left-color-min-max/warmup/model.pt` | left-color-min-max | 98,7 |
| `tt100k/warmup/model.pt` | TT-100K traffic signs | 98,0 |
| `imagenet/warmup/model.pt` | ImageNet-1K | 84,3 |

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K porque el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican medidas de VRAM para ningún checkpoint.
- GPU recomendadas: no disponible. No se especifican A100, H100, RTX 4090 ni otras GPU probadas.
- Compatibilidad con GPU de consumo: no confirmada. El backbone es DINOv2 ViT-B/14, pero no se aportan cifras que permitan afirmar que quepa en una GPU consumer concreta.
- Opciones de despliegue: PyTorch mediante el repositorio oficial, con `train.py eval` y `train.py rl`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; no son el flujo documentado para este modelo de visión.
- Latencia y throughput: no disponible. La dispersión reduce el número de parches procesados, pero no se reportan latencias ni tasas de procesamiento.
- Almacenamiento: el repositorio completo ocupa 9,9 GB e incluye múltiples checkpoints; el tamaño de cada archivo individual no se especifica.

## Comparativa con modelos similares

No se dispone de una comparación cuantitativa con alternativas en la información proporcionada. La model card solo reporta precisiones de los checkpoints LookThere y no incluye resultados de otros modelos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LookThere (checkpoints sobre DINOv2 ViT-B/14) | No disponible | No aplica | Precisión de validación en la tabla de benchmarks | Apache 2.0 | Público en HuggingFace |
| DINOv2 ViT-B/14 (backbone) | No disponible | No aplica | No disponible en la información | No disponible | No disponible |
| Selectores dispersos comparados en el paper | No disponible | No aplica | No disponible en la información | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni matemáticas, y no soporta tool calling, agentes, multilingüismo ni visión-lenguaje.
- No se documentan sesgos demográficos, geográficos o de otro tipo. Los datasets de entrenamiento no se describen en detalle, lo que impide evaluar su composición y posibles sesgos.
- El riesgo de alucinación lingüística no aplica; en visión, el riesgo son errores de clasificación y de selección de parches. La precisión puede variar unas décimas entre ejecuciones por el muestreo de parches.
- Los checkpoints son específicos por tarea y no constituyen un modelo generalista. No se reportan métricas de robustez fuera de los conjuntos de validación del paper.
- La licencia del repositorio es Apache 2.0, pero no se especifican las licencias de los datasets subyacentes; debe verificarse antes de un uso comercial.
- No se publican requisitos de VRAM, latencia ni throughput, por lo que no hay base para garantizar un despliegue en producción concreto.
- En aplicaciones de seguridad, como señales de tráfico, el modelo no debe usarse como único sistema de decisión sin validación adicional.
- El checkpoint ImageNet al 90% aplica `logit_offset=3` a cada puntuación del selector; el valor se guarda en el archivo y se usa automáticamente, pero debe respetarse al integrar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/SreehariRamMohan/lookthere
- Paper arXiv: https://arxiv.org/abs/2609.04698
- Paper PDF: https://arxiv.org/pdf/2609.04698
- Código: https://github.com/SreehariRamMohan/lookthere
- Página del autor: https://www.sreerammohan.com/
- Ficha en DeepPaper: https://arxiv.deeppaper.ai/papers/2609.04698v1
- Ficha en There's An AI For That: https://theresanaiforthat.com/paper/lookthere-sparse-vision-by-reinforced-selection/
