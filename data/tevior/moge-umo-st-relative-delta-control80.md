# Tevior/moge-UMO-ST-relative-delta-control80

## Resumen

El modelo `Tevior/moge-UMO-ST-relative-delta-control80` es un checkpoint de un sistema unificado de generación de movimiento humano (human motion generation) desarrollado por Tevior. Se trata de un modelo de difusión basado en arquitectura DiT (Diffusion Transformer) que integra tres tareas en un único backbone compartido: text-to-motion (T2M), edición de movimiento (motion editing) e interacción humana (reaction). El checkpoint concreto corresponde a la fase de control relativo-delta, donde se añade una señal de control ortogonal a las tareas principales para guiar la generación de forma condicionada.

El modelo es relevante porque aborda la generación de movimiento humano de forma unificada y controlable, sin necesidad de adaptadores específicos por tarea. Su salida es una representación de pose completa de 273 dimensiones por frame (`[B,T,273]`), muestreada a 30 FPS, y utiliza un esquema de rectified flow para la generación. El repositorio incluye cuatro checkpoints de entrenamiento progresivo, siendo el último (`control_250k_best`) el más optimizado para control, aunque con ligeras regresiones en las tareas base. Está pensado para investigación y reproducción científica, con licencia "other" no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con salida [B,T,273] |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | no disponible (texto en inglés presumiblemente, no confirmado) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo comparte un único backbone DiT para las tres tareas (T2M, edición de movimiento e interacción humana), con una cabeza de salida completa de 273 dimensiones por frame. No utiliza adaptadores por tarea; en su lugar, la diferenciación se logra mediante el condicionamiento y la señal de control. El entrenamiento se realizó en etapas progresivas: primero 100K pasos solo T2M, luego 50K pasos con mezcla de tareas (30/35/35), posteriormente 50K pasos con control al 80% de los samples, y finalmente 50K pasos adicionales con el mismo contrato de control. La señal de control es ortogonal a las tareas: se muestrea primero la tarea y luego se decide si aplicar control con probabilidad 0.8 (Bernoulli), manteniendo un 20% de samples sin control y con Ease desactivado. La representación de movimiento es K273, muestreada a 30 FPS, con normalización compartida y caché de texto mediante LLM2Vec. El proceso de generación usa EMA, integrador ODE con 32 pasos y CFG (classifier-free guidance) con pesos 2/2 para texto y control.

## Capacidades

- Generación de movimiento a partir de texto (text-to-motion) con control opcional sobre la pose generada.
- Edición de movimiento (motion editing) condicionada por texto y por señales de control sobre el target.
- Generación de reacciones en interacción humana (reaction) con control sobre el reactor.
- Control fino mediante observaciones target-side (relative-delta) que permiten especificar desplazamientos relativos, orientaciones y otros parámetros.
- Soporte de generación con o sin texto (with-text / no-text), lo que permite usos condicionados o no condicionados.
- Representación de pose completa de 273 dimensiones, adecuada para aplicaciones de animación y simulación.
- Arquitectura unificada sin adaptadores, facilitando la transferencia entre tareas.

## Casos de uso

- Animación procedural para videojuegos: generar movimientos de personajes a partir de descripciones textuales (por ejemplo, "caminar cansado") y controlar el desplazamiento relativo del root para ajustar la trayectoria en tiempo real.
- Edición de captura de movimiento (mocap): modificar clips existentes mediante texto (por ejemplo, "cambiar la marcha a una más enérgica") y controlar el target de edición para preservar la identidad del movimiento original.
- Simulación de interacciones humano-humano: generar reacciones de un personaje ante las acciones de otro, con control sobre el reactor para especificar la dirección relativa o la distancia de la respuesta.
- Generación de datos sintéticos para entrenamiento de modelos de visión por computador: crear secuencias de movimiento humano variadas y controladas para aumentar datasets de detección de poses o acción.
- Prototipado rápido en animación: los artistas pueden describir movimientos en lenguaje natural y ajustar parámetros de control sin necesidad de herramientas complejas de keyframing.
- Investigación en generación controlable: el modelo sirve como base para estudiar el efecto de señales de control ortogonales en modelos de difusión de movimiento, gracias a sus checkpoints intermedios y métricas detalladas.

## Benchmarks y rendimiento

El modelo fue evaluado en el conjunto de test completo de HumanML3D (4,042 motions, 8,084 casos con/sin texto), usando EMA, ODE32 y CFG 2/2. Los resultados para el checkpoint de control 250K (el más fuerte) son:

| Metrica | with-text | no-text |
|---|---:|---:|
| Root error (cm) | 5.900 | 4.855 |
| Root@10cm | 93.43% | 96.23% |
| End-effector error (cm) | 8.948 | 7.944 |
| End-effector rot error (deg) | 4.465 | 4.212 |
| Full-pose error (cm) | 4.791 | 3.346 |

Además, se reportan métricas de no degradación de las tareas base comparando el checkpoint parent (150K), control 200K y control 250K:

| Task/metica | 150K parent | Control 200K | Control 250K |
|---|---:|---:|---:|
| T2M native-TMR FID | 16.933 | 15.001 | 17.887 |
| T2M text-motion cosine | 0.6490 | 0.6559 | 0.6534 |
| Reaction relation MAE (cm) | 26.184 | 25.032 | 24.819 |
| Reaction relative heading (deg) | 71.521 | 68.857 | 67.600 |
| Edit Full-1013 R@1 | 24.09 | 23.20 | 22.80 |
| Edit Full-1013 AvgR | 19.47 | 19.95 | 20.93 |

No se proporcionan comparaciones con otros modelos externos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. Dado que es un modelo de difusión con backbone DiT y salida de 273 dimensiones, se puede inferir que requiere una GPU con al menos 8-16 GB de VRAM para inferencia, pero este dato no está confirmado. No se especifican opciones de despliegue como vLLM, llama.cpp u Ollama; el modelo se distribuye como checkpoint de PyTorch y el código de inferencia está disponible en el repositorio de GitHub.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El campo de generación de movimiento humano incluye alternativas como Motion Diffusion Model (MDM), HumanML3D baselines o modelos recientes como MotionGPT, pero no se han publicado comparativas con ellos en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado para investigación y reproducción científica; la licencia "other" no especifica términos de uso comercial, por lo que se debe contactar al autor antes de cualquier uso productivo.
- No se han documentado sesgos específicos, pero como modelo entrenado con texto en inglés (presumiblemente), puede tener limitaciones en otros idiomas.
- Las métricas de control mejoran claramente en el checkpoint 250K, pero a costa de una ligera regresión en T2M FID y Edit R@1 respecto al checkpoint 200K; esto debe tenerse en cuenta al elegir el checkpoint adecuado.
- La representación K273 y las estadísticas de normalización son compartidas; no se debe cambiar el Mean/Std a mitad del entrenamiento o la inferencia, según advierte el autor.
- El modelo requiere el uso de LLM2Vec para el caché de texto; esto añade una dependencia externa que debe gestionarse en el despliegue.
- No se proporcionan pesos en formatos optimizados (GGUF, ONNX, etc.), solo checkpoints nativos de PyTorch, lo que limita su uso en entornos de inferencia ligera.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Tevior/moge-UMO-ST-relative-delta-control80
- Codigo de entrenamiento e inferencia: https://github.com/CHDTevior/moge_UMO_ST (rama `agent/relative-delta-control-hoi-plan`)
- No se proporcionan otros enlaces (papers, demos) en la informacion disponible.
