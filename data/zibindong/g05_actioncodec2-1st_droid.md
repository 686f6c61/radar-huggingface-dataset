# ZibinDong/G05_ActionCodec2-1st_DROID

## Resumen

G05_ActionCodec2-1st_DROID es una política de visión-lenguaje-acción (VLA) para robótica, desarrollada por ZibinDong. Se trata de un fine-tuning del modelo base OpenGalaxea/G05 sobre el conjunto de datos DROID, empleando el tokenizador de acciones ActionCodec2-1st (variante "Paper edition" de 5 mm con un presupuesto de 4096 tokens por perfil). El modelo resuelve el problema de convertir observaciones visuales y una instrucción en lenguaje natural en secuencias de acciones de control para un robot manipulador.

El checkpoint es autocontenido: incluye su tokenizador de acciones, los assets ajustados y el tokenizador de texto, de modo que la inferencia funciona sin conexión una vez descargado el repositorio completo, sin necesidad del checkpoint base G0.5 ni de otro repositorio de tokenizadores. Con aproximadamente 2.225 millones de parámetros y un tamaño de repositorio de 8,9 GB, es un modelo de escala moderada orientado a despliegue en robótica real.

Es relevante ahora porque demuestra la aplicación del paradigma de tokenización de acciones (ActionCodec2) sobre un backbone VLA preentrenado, con un contrato de inferencia documentado y reproducible (frecuencia de control de 15 Hz, espacio de acciones delta_joint, dos cámaras). Su licencia no comercial limita, no obstante, su uso en producción comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenGalaxea/G05 con tokenizador de acciones ActionCodec2-1st |
| Parametros totales | 2.225.423.168 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | G0.5 Community License (g05-community), no comercial; assets ActionCodec2 bajo Apache-2.0; tokenizador de texto Qwen3.5 bajo su propia licencia |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 8,9 GB |
| Pipeline | robotics |
| Modelo base | OpenGalaxea/G05 (finetune) |
| Resolución de imagen | 256 × 256 |
| Cámaras | observation.images.exterior_1_left, observation.images.wrist_left |
| Forma de acción devuelta | (15, 8) |
| Frecuencia de control | 15 Hz |
| Espacio de acciones | delta_joint |
| Acciones antes de replanificar | 15 |
| Estado observado | 8 valores en bruto (7 posiciones articulares + estado del gripper) |

## Arquitectura y entrenamiento

La arquitectura es una política VLA derivada de OpenGalaxea/G05, un backbone de visión-lenguaje sobre el que se acopla un tokenizador de acciones ActionCodec2. El tokenizador empleado es `paper-o1-5mm-4k-2bin-1p2ms`, la variante "Paper edition" de 5 mm descrita en el artículo de ActionCodec2, con un presupuesto de 4096 tokens por perfil. El modelo procesa imágenes RGB de dos cámaras (exterior izquierda y muñeca izquierda), una instrucción de tarea en texto y un estado observado de 8 valores, y genera secuencias de acciones en el espacio delta_joint.

El entrenamiento consiste en un fine-tuning del modelo base G0.5 sobre el dataset DROID. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. El checkpoint incorpora el vocabulario de acciones empaquetado, que está ligado a los pesos entrenados: no debe sustituirse por el de la edición Extended, retrenada tras un proceso adicional de limpieza y filtrado de los datos de preentrenamiento. La inferencia se ha verificado con Python 3.12, PyTorch 2.7.1 y Transformers 5.14.1, y el paquete `actioncodec2[cuda]` añade Liger y Flash Linear Attention.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción en espacio delta_joint a partir de observaciones visuales y una instrucción de tarea.
- Percepción visual multi-cámara: consume dos flujos RGB (exterior y muñeca) redimensionados a 256 × 256.
- Comprensión de instrucciones en lenguaje natural para especificar la tarea a ejecutar.
- Predicción de secuencias de acción con horizonte de 15 pasos antes de replanificar, a 15 Hz.
- Integración del estado propioceptivo del robot (7 posiciones articulares + gripper) como entrada.
- Tokenización de acciones mediante ActionCodec2, con vocabulario empaquetado y ligado a los pesos.
- Inferencia offline autocontenida tras la descarga del repositorio completo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general o audio: no disponible.

## Casos de uso

- Manipulación robótica de pick-and-place: el modelo recibe las imágenes de las cámaras exterior y de muñeca junto con la instrucción "pick up the object" y el estado articular, y devuelve 15 acciones delta_joint que el robot ejecuta antes de replanificar, aprovechando la frecuencia de control de 15 Hz.
- Investigación en políticas VLA sobre DROID: sirve como checkpoint de referencia para reproducir y comparar experimentos de fine-tuning sobre el dataset DROID con el tokenizador ActionCodec2-1st.
- Evaluación de tokenizadores de acciones: al incorporar el vocabulario `paper-o1-5mm-4k-2bin-1p2ms`, permite estudiar el efecto del presupuesto de 4096 tokens por perfil en la precisión de las trayectorias generadas.
- Despliegue en entornos de laboratorio sin conectividad: al ser autocontenido (tokenizador de acciones, assets y tokenizador de texto incluidos), la inferencia funciona offline, adecuada para robots en instalaciones aisladas.
- Prototipado de control de brazos manipuladores con dos cámaras: el contrato de inferencia documentado (forma de acción (15, 8), estado de 8 valores) facilita la integración en stacks de control existentes mediante los clientes de evaluación del archivo fuente.
- Benchmarking reproducible: los clientes de evaluación incluidos en el archivo fuente realizan la conversión de acciones específica de cada benchmark, lo que permite comparar el modelo frente a otras políticas sobre las mismas métricas.
- Formación y docencia en robótica: el ejemplo de inferencia con entradas sintéticas permite verificar la interfaz de carga y predicción sin necesidad de hardware robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.225 millones de parámetros en safetensors, los pesos ocupan aproximadamente 4,5 GB en FP16, a lo que hay que sumar el tokenizador de acciones, los assets ajustados y las activaciones.
- GPU recomendadas: no disponible; la model card solo exige una GPU compatible con CUDA para el ejemplo de inferencia.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos (unos 4,5 GB en FP16) sería viable en GPUs de consumo con suficiente VRAM, pero no se documenta oficialmente.
- Opciones de despliegue: paquete `actioncodec2[cuda]` (con Liger y Flash Linear Attention) mediante `actioncodec2.vla.runtime.load_policy`; se admite pasar un directorio descargado o fijar una revisión del Hub.
- Requisitos de software: Python 3.12 o superior, compilador C++17, PyTorch 2.7.1 y Transformers 5.14.1 (versiones verificadas).
- Latencia y throughput: no disponible; únicamente se documenta la frecuencia de control de 15 Hz y la ejecución de 15 acciones antes de replanificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-1st_DROID | 2.225 M | no disponible | VLA robótica (DROID) | G0.5 Community (no comercial) | HuggingFace |
| OpenGalaxea/G05 (base) | no disponible | no disponible | VLA robótica | G0.5 Community | HuggingFace |
| ActionCodec2 (tokenizador) | no disponible | no disponible | Tokenización de acciones | Apache-2.0 (assets) | HuggingFace (ZibinDong/ActionCodec2) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la G0.5 Community License no concede derechos de despliegue comercial; cualquier uso en producción comercial está prohibido.
- El vocabulario de acciones está ligado a los pesos entrenados; sustituirlo por el de la edición Extended u otro tokenizador invalida el modelo.
- El modelo está especializado en el dataset DROID y en el espacio de acciones delta_joint con dos cámaras concretas; su generalización a otras morfologías, configuraciones de cámara o espacios de acción no está documentada.
- Solo se ha verificado con versiones concretas de software (Python 3.12, PyTorch 2.7.1, Transformers 5.14.1); otras combinaciones pueden fallar.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- El ejemplo de inferencia de la model card usa entradas sintéticas y solo verifica la interfaz; para control real es necesario proporcionar observaciones actuales y realizar la conversión de acciones específica del benchmark.
- El modelo requiere `trust_remote_code=True` para la carga, lo que implica ejecutar código del repositorio.
- Los assets ActionCodec2 empaquetados están bajo Apache-2.0 y el tokenizador de texto Qwen3.5 bajo su propia licencia, con condiciones separadas de la licencia principal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_DROID
- Modelo base: https://huggingface.co/OpenGalaxea/G05
- Repositorio del tokenizador ActionCodec2: https://huggingface.co/ZibinDong/ActionCodec2
- Archivo fuente del paquete (v0.1.0): https://huggingface.co/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Configuración de la política: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_DROID/blob/main/policy_config.json
- Licencia: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_DROID/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_DROID/blob/main/NOTICE
- Licencia del tokenizador de texto Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_DROID/blob/main/LICENSE_QWEN3_5.txt
