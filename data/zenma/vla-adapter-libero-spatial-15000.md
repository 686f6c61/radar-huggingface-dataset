# Zenma/VLA-Adapter-LIBERO-Spatial-15000

## Resumen

VLA-Adapter-LIBERO-Spatial-15000 es un modelo de visión-lenguaje-acción (VLA) desarrollado por el equipo Zenma, diseñado específicamente para tareas de manipulación robótica en el benchmark LIBERO-Spatial. Forma parte de la familia VLA-Adapter, un paradigma que busca reducir la dependencia de las VLA de modelos de lenguaje de gran escala (VLM) y de extensos pre-entrenamientos. El modelo combina un backbone prismático basado en Qwen2.5-0.5B con un codificador visual dual (DINOv2 y SigLIP) y una cabeza de acción con Bridge Attention, permitiendo a un robot predecir secuencias de acciones a partir de observaciones visuales y lenguaje natural.

Con 1.252.553.792 parámetros (1,25B) y un tamaño de repositorio de 2,9 GB, este checkpoint concreto ha sido entrenado durante 15.000 pasos sobre la suite LIBERO-Spatial sin no-ops, alcanzando una tasa de éxito del 98,6% en la evaluación. La licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en entornos de investigación y producción robótica. Es relevante ahora porque demuestra que es posible lograr altas tasas de éxito en manipulación robótica con modelos de escala pequeña, un avance importante para el despliegue en hardware con recursos limitados.

El modelo se distribuye en formato safetensors y se integra con la librería transformers mediante código personalizado (`trust_remote_code`). Incluye componentes separados para la cabeza de acción y el proyector de propriocepción, que deben cargarse por separado para la predicción de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone prismático Qwen2.5-0.5B + visión dual DINOv2/SigLIP + cabeza de acción Bridge Attention (Pro) |
| Parametros totales | 1.252.553.792 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLA-Adapter, que separa la percepción visual del razonamiento lingüístico y la predicción de acciones. El backbone es un modelo prismático basado en Qwen2.5-0.5B (configuración `qwen25-0_5b-extra` con 896 hidden y 24 capas), que fusiona dos codificadores visuales: DINOv2 (`vit_large_patch14_reg4_dinov2.lvd142m`) y SigLIP (`vit_so400m_patch14_siglip_224`), ambos con entrada de 224x224 píxeles. La cabeza de acción es un MLP-ResNet con Bridge Attention en su variante "Pro", que predice un chunk de acciones mediante regresión L1 sobre el chunk completo.

El entrenamiento se realizó sobre la suite LIBERO-Spatial sin no-ops, con un tamaño de batch de 16, learning rate de 0.0001, LoRA con rango 64 y dropout 0.0, más aumentación de imágenes. El checkpoint corresponde al paso 15.000. El objetivo es la regresión L1 sobre el chunk de acciones, y se utiliza la clave `libero_spatial_no_noops` para la normalización. El modelo fue evaluado en la misma suite, obteniendo un 98,6% de tasa de éxito.

## Capacidades

- Predicción de acciones robóticas de 6DOF (posición, orientación, agarre) a partir de observaciones visuales y lenguaje natural.
- Razonamiento viso-lingüístico para interpretar instrucciones complejas como "coge el tazón y ponlo en la estantería".
- Generación de secuencias de acciones (action chunks) de hasta 8 pasos en bucle abierto.
- Integración de información de propriocepción del robot (posición articular, estado del efector final) mediante un proyector específico.
- Soporte para dos imágenes de entrada simultáneas (`--num_images_in_input 2`), útil para visión estéreo o multi-cámara.
- Capacidad de adaptación a diferentes suites de LIBERO (Spatial, Object, Goal, Long) mediante fine-tuning específico, aunque este checkpoint está especializado en Spatial.
- No se ha documentado soporte para tool calling, agentes o multimodalidad más allá de imagen y texto.

## Casos de uso

- Manipulación robótica en entornos de mesa: el modelo puede controlar un brazo robot para tareas como recoger objetos, apilar bloques o colocar elementos en posiciones concretas, guiado por instrucciones en lenguaje natural.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning en nuevas tareas, gracias a su licencia MIT y su tamaño reducido que permite iterar rápidamente.
- Prototipado de sistemas de control robotico: su alta tasa de éxito (98,6%) en LIBERO-Spatial lo hace adecuado para validar algoritmos de planificación de movimientos en simuladores antes de transferir a hardware real.
- Educacion en robotica y VLA: al ser un modelo compacto y con código de evaluación disponible, es útil en cursos y talleres para enseñar el flujo completo de entrenamiento y evaluación de políticas viso-lenguaje-acción.
- Despliegue en robots de bajo coste: al requerir solo 1,25B de parámetros, puede ejecutarse en GPUs de gama media (por ejemplo, RTX 3090 o 4090), lo que lo hace viable para laboratorios con presupuesto limitado.
- Benchmarking de nuevas arquitecturas de acción: su estructura modular (backbone + cabeza de acción separada) permite sustituir la cabeza por otras propuestas y comparar rendimiento sobre la misma base visual-lingüística.

## Benchmarks y rendimiento

El autor reporta una tasa de éxito del 98,6% en la suite de evaluación `libero_spatial` (sin no-ops). No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible, ya que el modelo está especializado en robótica y no en tareas generales de lenguaje.

| Benchmark | Resultado |
|---|---|
| LIBERO-Spatial (tasa de éxito) | 98,6% |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 1,25B en safetensors (2,9 GB en disco), es razonable esperar que quepa en GPUs con 8-12 GB de VRAM en precisión FP16 o BF16.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para mayor margen). No se especifican requisitos mínimos oficiales.
- Cabe en GPUs de consumo como la RTX 3090 o RTX 4080, aunque la carga de la cabeza de acción y el procesamiento de dos imágenes puede requerir optimizaciones.
- Opciones de despliegue: el código de evaluación está pensado para el repositorio OpenHelix-Team/VLA-Adapter y usa `transformers` con `trust_remote_code`. No se mencionan adaptaciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos VLA en la información proporcionada. El modelo se enmarca en la familia VLA-Adapter, que compite con enfoques como OpenVLA (basado en Prismatic y Llama-2) y otros VLA de mayor escala. La ventaja principal de VLA-Adapter es su tamaño reducido (0.5B de LLM frente a 7B de OpenVLA), lo que reduce los requisitos de hardware manteniendo tasas de éxito competitivas en LIBERO. Sin embargo, no hay cifras concretas de comparación en los materiales disponibles.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la suite LIBERO-Spatial; no se ha evaluado su generalización a otras tareas o entornos fuera de este benchmark.
- No se han publicado datos sobre sesgos o alucinaciones, pero al ser un modelo visual-lingüístico entrenado principalmente para robótica, su capacidad de razonamiento general es limitada.
- La longitud de contexto no está documentada; se recomienda usar instrucciones cortas y directas.
- Los idiomas soportados no están especificados; el entrenamiento probablemente se realizó con instrucciones en inglés (el benchmark LIBERO usa prompts en inglés).
- Para la predicción de acciones, es necesario cargar manualmente los ficheros `action_head--checkpoint.pt` y `proprio_projector--checkpoint.pt`; el código de evaluación solo acepta repositorios en una allowlist, por lo que hay que descargar el repo localmente.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (Qwen2.5, DINOv2, SigLIP) que pueden tener licencias propias.

## Enlaces

- HuggingFace: https://huggingface.co/Zenma/VLA-Adapter-LIBERO-Spatial-15000
- Repositorio GitHub del proyecto: https://github.com/OpenHelix-Team/VLA-Adapter
- Paper (arXiv): https://arxiv.org/pdf/2509.09372v1
- Modelo VLA-Adapter/LIBERO-Spatial-Pro (variante Pro): https://huggingface.co/VLA-Adapter/LIBERO-Spatial-Pro
- Organización VLA-Adapter en HuggingFace: https://huggingface.co/VLA-Adapter
