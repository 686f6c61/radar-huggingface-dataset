# ZibinDong/G05_ActionCodec2-1st_LIBERO

## Resumen

G05_ActionCodec2-1st_LIBERO es una política visión-lenguaje-acción (VLA) publicada por ZibinDong, resultado del ajuste fino del modelo base OpenGalaxea/G05 sobre el conjunto de datos de manipulación robótica LIBERO. El checkpoint incorpora el tokenizador de acciones ActionCodec2-1st (edición Paper de 5 mm, con un presupuesto de 4096 tokens por perfil), lo que permite representar acciones continuas como secuencias discretas y reutilizar la arquitectura de un modelo de lenguaje para la generación de trayectorias motoras.

El modelo resuelve el problema del control robótico de manipulación de propósito general: recibe imágenes de dos cámaras (vista general y vista de muñeca), una instrucción en lenguaje natural y un estado observado de 8 valores, y devuelve una secuencia de 20 acciones de 7 dimensiones a 20 Hz en espacio delta_eef. Es relevante porque empaqueta en un único repositorio de 8,9 GB los pesos, el tokenizador de acciones, los assets ajustados y el tokenizador de texto, de modo que la inferencia funciona sin conexión y sin depender del checkpoint base G0.5.

Con 2.225.423.168 parámetros totales (~2,2 mil millones) y un pipeline declarado como `robotics`, se sitúa en la categoría de políticas VLA compactas, pensadas para despliegue en estaciones de trabajo con GPU y evaluación sobre benchmarks de manipulación como LIBERO. La licencia es la G0.5 Community License, restringida a uso no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) derivada de OpenGalaxea/G05 con tokenizador de acciones ActionCodec2-1st; detalles internos de capas no disponibles |
| Parámetros totales | 2.225.423.168 (~2,2 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo base integra el tokenizador de texto Qwen3.5) |
| Licencia | G0.5 Community License (`g05-community`), uso no comercial; assets de ActionCodec2 bajo Apache-2.0; tokenizador de texto bajo LICENSE_QWEN3_5.txt |
| Formato de pesos | safetensors |
| Tokenizador de acciones | `paper-o1-5mm-4k-2bin-1p2ms` (edición Paper, 5 mm, 4096 tokens por perfil) |
| Tamaño de imagen de entrada | 256 × 256 |
| Cámaras | `observation.images.image`, `observation.images.wrist_image` |
| Forma de acción devuelta | (20, 7) |
| Frecuencia de control | 20 Hz |
| Espacio de acción | delta_eef |
| Representación de rotación | rotation_vector |
| Acciones antes de replanificar | 20 |
| Estado observado | 8 valores en bruto (posición 3, rotación 3, posiciones de pinzas 2) |
| Tamaño del repositorio | 8,9 GB |
| Entorno de inferencia verificado | Python 3.12, PyTorch 2.7.1, Transformers 5.14.1, compilador C++17 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint OpenGalaxea/G05, que aporta la columna vertebral visión-lenguaje y el tokenizador de texto (Qwen3.5, según la licencia incluida). Sobre esa base se entrena una cabeza de política que emite acciones en forma de tokens discretos mediante ActionCodec2-1st, un tokenizador de acciones con granularidad de 5 mm y un presupuesto de 4096 tokens por perfil. La variante utilizada es la edición Paper (`paper-o1-5mm-4k-2bin-1p2ms`), distinta de la edición Extended, que fue reentrenada tras un proceso adicional de limpieza y filtrado de los datos de preentrenamiento y ofrece más opciones de precisión y vocabulario. El autor advierte explícitamente de que el vocabulario empaquetado está ligado a los pesos entrenados y no debe sustituirse.

El ajuste fino se realiza sobre LIBERO, un benchmark de manipulación robótica con tareas de largo horizonte. El checkpoint incluye los assets ajustados y el tokenizador de acciones, de modo que el pipeline de inferencia es autocontenido. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La instalación requiere el paquete `actioncodec2[cuda]` (versión 0.1.0), que añade Liger y Flash Linear Attention como extras de CUDA, lo que sugiere el uso de atención lineal eficiente en la implementación.

## Capacidades

- Control robótico de manipulación de propósito general a partir de instrucciones en lenguaje natural.
- Procesamiento multimodal de dos vistas de cámara (vista general y vista de muñeca) a resolución 256 × 256.
- Generación de secuencias de acción de 20 pasos × 7 dimensiones en espacio delta_eef con representación de rotación en vector de rotación.
- Condicionamiento sobre estado observado de 8 valores (posición del efector final, orientación y posiciones de ambas pinzas).
- Control a 20 Hz con ejecución de 20 acciones antes de replanificar.
- Inferencia offline autocontenida: el repositorio incluye pesos, tokenizador de acciones, assets ajustados y tokenizador de texto.
- Interfaz de predicción programática (`load_policy` y `policy.predict`) con soporte de `trust_remote_code` y fijado de revisión por commit.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión general fuera del contexto robótico, audio ni modo de pensamiento explícito.

## Casos de uso

- Evaluación en el benchmark LIBERO: el checkpoint está ajustado específicamente sobre LIBERO, por lo que su uso principal es reproducir y comparar resultados en las tareas de manipulación de ese benchmark mediante los clientes de evaluación incluidos en el archivo fuente.
- Manipulación robótica de pick-and-place: con instrucciones como "pick up the object", el modelo genera trayectorias delta_eef de 20 pasos que pueden ejecutarse en un brazo con pinza paralela de dos dedos, usando las dos cámaras para localizar el objeto.
- Replanificación a 20 Hz en lazo cerrado: la política ejecuta 20 acciones antes de volver a planificar, lo que permite corregir desviaciones con la realimentación de las cámaras y del estado del efector.
- Investigación en tokenización de acciones: al incorporar ActionCodec2-1st con vocabulario y pesos acoplados, sirve como referencia reproducible para estudiar la discretización de acciones continuas en políticas VLA.
- Prototipado de asistentes de manipulación en laboratorio: el tamaño de ~2,2 mil millones de parámetros y los 8,9 GB del repositorio permiten desplegar el modelo en una estación con GPU única para experimentos de investigación sin infraestructura de gran escala.
- Integración en pipelines de evaluación automatizada: la interfaz `load_policy` con `revision` fijada por commit facilita la reproducibilidad en experimentos comparativos entre tokenizadores o checkpoints.
- Docencia y formación en robótica: el ejemplo de inferencia con entradas sintéticas permite verificar la instalación y la interfaz antes de conectar hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2.225.423.168 parámetros, los pesos en precisión de 16 bits ocuparían aproximadamente 4,5 GB, y en 8 bits unos 2,2 GB, sin contar activaciones, caché de atención ni los extras de CUDA (Liger, Flash Linear Attention).
- GPU recomendadas: no especificadas por el autor. Se requiere una GPU compatible con CUDA para el ejemplo de inferencia; el paquete `actioncodec2[cuda]` activa Liger y Flash Linear Attention.
- GPU de consumo: no confirmado. Por tamaño de pesos, cabría esperar que quepa en GPU de consumo con 8 GB o más de VRAM, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: el runtime propio de ActionCodec2 (`actioncodec2.vla.runtime.load_policy`), instalado desde el archivo fuente `actioncodec2-0.1.0.tar.gz`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno verificado: Python 3.12 o superior, compilador C++17, PyTorch 2.7.1, Transformers 5.14.1.
- Latencia y throughput: no disponibles. Solo se documenta la frecuencia de control del bucle de política (20 Hz) y la ejecución de 20 acciones antes de replanificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-1st_LIBERO | 2,2 mil millones | no disponible | no disponible | G0.5 Community (no comercial) | HuggingFace, 37 descargas |
| OpenGalaxea/G05 (modelo base) | no disponible | no disponible | no disponible | G0.5 Community | HuggingFace (referenciado como base) |
| Alternativas VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia G0.5 Community: uso no comercial y sin derechos de despliegue comercial. Cualquier aplicación productiva requiere autorización expresa del titular de la licencia.
- El vocabulario del tokenizador de acciones está acoplado a los pesos entrenados; sustituirlo por el de la edición Extended u otro vocabulario invalida el modelo.
- El ajuste fino está especializado en LIBERO; el rendimiento fuera de ese benchmark o en otros robots, cámaras o espacios de acción no está documentado.
- Requiere respetar estrictamente el contrato de entrada: orden de cámaras, resolución 256 × 256, 8 valores de estado en bruto y conversión de acciones específica del benchmark realizada por los clientes de evaluación.
- Riesgo de alucinación y de acciones inválidas no cuantificado; no se publican tasas de éxito ni análisis de fallos.
- Sesgos conocidos: no documentados. Al derivar de un modelo de lenguaje (Qwen3.5) y de un dataset de manipulación, puede heredar sesgos de los datos de preentrenamiento y del conjunto LIBERO.
- Idiomas soportados: no disponibles; las instrucciones de tarea se pasan como texto, pero no se especifica cobertura lingüística.
- Longitud de contexto: no disponible, lo que impide evaluar el manejo de instrucciones largas o historiales multi-turno.
- El repositorio tiene 37 descargas y 0 likes, con creación y actualización en octubre de 2026; se trata de un artefacto de investigación con validación comunitaria limitada.
- La inferencia depende de `trust_remote_code=True`, lo que implica ejecutar código del repositorio y requiere revisión de seguridad en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO
- Modelo base: https://huggingface.co/OpenGalaxea/G05 (espejo citado: https://hf-mirror.com/OpenGalaxea/G05)
- Repositorio del tokenizador ActionCodec2: https://huggingface.co/ZibinDong/ActionCodec2
- Archivo fuente del paquete: https://hf-mirror.com/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Configuración de política: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO/blob/main/policy_config.json
- Licencia: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO/blob/main/NOTICE
- Licencia del tokenizador de texto Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO/blob/main/LICENSE_QWEN3_5.txt
- Licencia de los assets del tokenizador: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_LIBERO/blob/main/assets/tokenizer_artifact/LICENSE
