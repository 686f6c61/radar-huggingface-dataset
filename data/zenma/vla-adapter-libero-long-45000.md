# Zenma/VLA-Adapter-LIBERO-Long-45000

## Resumen

VLA-Adapter-LIBERO-Long-45000 es un modelo de visión-lenguaje-acción (VLA) de pequeño tamaño, desarrollado por el equipo OpenHelix-Team y publicado en Hugging Face por el usuario Zenma. Está diseñado para la robótica: recibe una imagen y una instrucción en lenguaje natural, y genera una secuencia de acciones (chunk) para controlar un brazo robótico. El modelo se basa en un backbone de lenguaje Qwen2.5-0.5B, al que se le añaden dos encoders visuales (DINOv2 y SigLIP) fusionados, y una cabeza de acción con atención tipo Bridge Attention. Con 1,25 mil millones de parámetros, es significativamente más pequeño que otros VLA como OpenVLA (7B), lo que lo hace adecuado para despliegue en hardware limitado.

Este checkpoint concreto está fine-tuneado en la suite LIBERO-Long, una colección de tareas de manipulación de largo horizonte. Según la model card, alcanza una tasa de éxito del 90,2% en el benchmark libero_10. El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors y un tamaño de repositorio de 2,9 GB. La arquitectura y el entrenamiento están documentados en el artículo arXiv 2509.09372, que propone el paradigma VLA-Adapter para modelos VLA a escala reducida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone Qwen2.5-0.5B (prism) + visión dual DINOv2 + SigLIP + action head con Bridge Attention (Pro) |
| Parametros totales | 1.252.553.792 (1,25B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (según ModelScope); no se especifican otros |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un modelo de lenguaje Qwen2.5-0.5B (896 unidades ocultas, 24 capas) con dos codificadores visuales: un ViT-Large DINOv2 (patch 14, registro 4) y un ViT-SO400M SigLIP (patch 14, resolución 224×224). Las características visuales y textuales se fusionan en un "prism" que alimenta al LLM. La salida del LLM se proyecta a una cabeza de acción compuesta por un MLP-ResNet con atención Bridge Attention (versión Pro). El objetivo de entrenamiento es regresión L1 sobre el chunk de acciones predicho, con un bucle de control en lazo abierto de 8 pasos.

El fine-tuning se realizó sobre la suite LIBERO (configuración libero_10_no_noops) con LoRA de rango 64, dropout 0,0, batch size 16, learning rate 1e-4, y aumento de imágenes. El checkpoint corresponde al paso 45.000. La normalización de acciones usa la clave `libero_10_no_noops`. El artículo asociado (arXiv 2509.09372) describe el paradigma VLA-Adapter y lo compara con 22 métodos de referencia en el benchmark LIBERO completo.

## Capacidades

- Generación de acciones robóticas: produce secuencias de posiciones/velocidades articulares para control de brazos manipuladores.
- Comprensión de instrucciones en lenguaje natural: interpreta comandos como "coge la taza y ponla en la bandeja" y los traduce en movimientos.
- Percepción visual dual: combina DINOv2 (semántica) y SigLIP (alineación visión-texto) para robustez en entornos variados.
- Tareas de largo horizonte: el fine-tuning en LIBERO-Long optimiza la ejecución de secuencias extendidas con múltiples subobjetivos.
- Integración con pipelines de robótica: se carga mediante `AutoModelForVision2Seq` y requiere código adicional para la cabeza de acción (proporcionado en el repositorio).
- Fine-tuning eficiente con LoRA: permite adaptación a nuevas tareas con bajo coste computacional.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo para tareas como apilar bloques, abrir puertas o colocar objetos, a partir de una imagen y una orden textual. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con una única GPU.
- Automatización de almacenes: en entornos logísticos, el VLA puede recibir instrucciones tipo "coge la caja azul de la estantería y colócala en la cinta", generando los movimientos necesarios en tiempo real.
- Robótica educativa e investigación: al ser de código abierto y ligero, sirve como base para experimentos en laboratorios universitarios que no disponen de clústeres de alto rendimiento.
- Control de robots asistivos: en aplicaciones de ayuda a personas con movilidad reducida, el modelo puede interpretar comandos vocales y ejecutar acciones como acercar un objeto.
- Benchmarking de VLA: el checkpoint proporciona un punto de referencia reproducible para evaluar estrategias de adaptación (LoRA, fine-tuning completo) sobre LIBERO.
- Prototipado rápido de políticas robóticas: gracias a su licencia MIT y a la disponibilidad del código de evaluación, los desarrolladores pueden integrarlo en simuladores (Gym, MuJoCo) para validar comportamientos antes del despliegue físico.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza una tasa de éxito del 90,2% en la suite `libero_10` (la subdivisión de LIBERO-Long). No se proporcionan resultados para otras suites (Spatial, Object, Goal) en la información disponible. El artículo original reporta comparaciones con 22 métodos de referencia, pero esos datos no están incluidos en los materiales que se me han proporcionado.

| Benchmark | Tasa de éxito |
|---|---|
| libero_10 (LIBERO-Long) | 90,2% |

Para métricas adicionales, se recomienda consultar el paper arXiv 2509.09372.

## Requisitos de hardware

- VRAM estimada: con 1,25B parámetros en BF16, el modelo ocupa aproximadamente 2,5 GB en memoria. La inferencia adicional de la cabeza de acción y los encoders visuales puede requerir entre 4 y 6 GB en total.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para inferencia; una RTX 4090 o A100 permitiría procesamiento por lotes y mayor velocidad.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: el modelo se usa con el código de evaluación de VLA-Adapter (repositorio GitHub) y con la librería `transformers` (carga del backbone). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles. La latencia dependerá del hardware y del tamaño de lote; en una RTX 4090, se estima que una predicción de chunk de 8 pasos puede completarse en decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

La comparación directa con otros VLA no está disponible en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VLA-Adapter (este) | 1,25B | no disponible | MIT | Hugging Face, ModelScope |
| OpenVLA | 7B | 32k (típico de Llama-2) | MIT | Hugging Face |
| RT-2 (Google) | 55B | no público | propietaria | no público |

VLA-Adapter es considerablemente más pequeño que OpenVLA, lo que facilita su despliegue en hardware modesto, aunque su rendimiento en tareas generales puede ser inferior debido al menor tamaño del backbone. No se dispone de benchmarks comparativos directos en la información facilitada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado principalmente en datos de simulación (LIBERO), puede no generalizar bien a entornos físicos con variaciones de iluminación, texturas o geometrías no vistas.
- Riesgo de alucinación de acciones: en tareas fuera de la distribución de entrenamiento, el modelo puede generar secuencias de movimiento incoherentes o inseguras. Es imprescindible validar en simulación antes de usar en hardware real.
- Limitaciones de contexto: no se especifica la longitud de contexto del LLM subyacente; las instrucciones muy largas o con múltiples cláusulas podrían truncarse.
- Dependencia del benchmark: el éxito del 90,2% está limitado a libero_10; no se garantiza el mismo rendimiento en otras suites de LIBERO o en tareas del mundo real.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el código de evaluación y los pesos de la cabeza de acción están sujetos a la misma licencia; se recomienda revisar los archivos del repositorio.
- Requisitos de integración: el modelo no funciona como un VLM estándar; requiere cargar por separado el action head y el proprio projector, y usar el script de evaluación específico. No es compatible con frameworks de inferencia genéricos.

## Enlaces

- Hugging Face: https://huggingface.co/Zenma/VLA-Adapter-LIBERO-Long-45000
- Paper arXiv (2509.09372): https://arxiv.org/abs/2509.09372
- Repositorio GitHub (OpenHelix-Team/VLA-Adapter): https://github.com/OpenHelix-Team/VLA-Adapter
- Modelo en ModelScope: https://www.modelscope.cn/models/VLA-Adapter/LIBERO-Long
- Model card original de VLA-Adapter/LIBERO-Long: https://huggingface.co/VLA-Adapter/LIBERO-Long
