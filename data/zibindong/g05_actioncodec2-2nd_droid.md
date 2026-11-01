# ZibinDong/G05_ActionCodec2-2nd_DROID

## Resumen

G05_ActionCodec2-2nd_DROID es una política de vision-language-action (VLA) para robótica, publicada por el usuario ZibinDong. Se trata de un fine-tuning del modelo base OpenGalaxea/G05 sobre el conjunto de datos DROID, empleando el tokenizador de acciones ActionCodec2 en su variante "2nd" (edición Paper, presupuesto de 5 mm y 4096 tokens por perfil). El modelo resuelve el problema de mapear observaciones visuales y una instrucción en lenguaje natural a secuencias de acciones motoras de baja latencia (15 Hz) sobre un espacio de acción `delta_joint`.

El checkpoint tiene 2.225.441.600 parámetros (aproximadamente 2,2 mil millones) y un tamaño de repositorio de 8,9 GB. Incluye de forma autocontenida el tokenizador de acciones, los assets ajustados y el tokenizador de texto, de modo que la inferencia funciona sin conexión tras la descarga, sin necesidad del checkpoint base G0.5 ni de otro repositorio de tokenizadores. Esta autonomía es relevante para despliegues en robótica donde la reproducibilidad y el control de dependencias son críticos.

Su relevancia actual radica en la combinación de un modelo VLA con un tokenizador de acciones especializado que discretiza el espacio continuo de control en tokens, permitiendo reutilizar arquitecturas de lenguaje para la generación de acciones. La licencia es restrictiva (G0.5 Community License, no comercial), lo que limita su uso a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenGalaxea/G05 con tokenizador de acciones ActionCodec2-2nd |
| Parametros totales | 2.225.441.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (tokenizador de texto Qwen3.5 incluido) |
| Licencia | G0.5 Community License (no comercial; sin derechos de despliegue comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA OpenGalaxea/G05 sobre DROID, un conjunto de datos de manipulación robótica. La arquitectura subyacente es de tipo vision-language-action: procesa imágenes RGB de dos cámaras (`observation.images.exterior_1_left` y `observation.images.wrist_left`), redimensionadas a 256×256, junto con una instrucción de tarea en texto, un estado observado de 8 valores crudos (siete posiciones articulares más el estado del gripper) y la acción previa ejecutada. La salida es una secuencia de acciones de forma `(15, 8)` a 15 Hz en espacio `delta_joint`, ejecutando una acción antes de replanificar.

El elemento diferenciador es el tokenizador de acciones ActionCodec2 en su variante `paper-o2-5mm-4k-2bin-1p2ms`, la edición Paper de 5 mm con un presupuesto de 4096 tokens por perfil. Este tokenizador discretiza el espacio continuo de acciones en tokens, permitiendo que el modelo genere acciones mediante decodificación autorregresiva sobre un vocabulario de acciones. El autor advierte que el vocabulario incluido está ligado a los pesos entrenados y no debe sustituirse por el de la edición Extended, que fue reentrenada con datos de preentrenamiento adicionalmente limpiados y filtrados. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset DROID empleado ni si hubo RLHF/DPO.

## Capacidades

- Generación de acciones motoras de manipulación robótica en espacio `delta_joint` a 15 Hz.
- Comprensión de instrucciones de tarea en lenguaje natural (por ejemplo, "pick up the object").
- Procesamiento de entrada visual multi-cámara (dos cámaras: exterior izquierda y muñeca izquierda).
- Condicionamiento sobre estado observado (posiciones articulares y gripper) y acción previa para mantener continuidad motora.
- Tokenización y decodificación de acciones mediante ActionCodec2-2nd con presupuesto de 4096 tokens por perfil.
- Inferencia offline autocontenida (tokenizador de acciones, assets y tokenizador de texto incluidos).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo genera acciones `delta_joint` a 15 Hz condicionadas por dos vistas de cámara, adecuado para tareas de pick-and-place donde se requiere control continuo y replanificación cada acción.
- Evaluación de políticas VLA sobre DROID: al ser un fine-tuning sobre DROID, sirve como referencia para comparar tokenizadores de acciones (Paper frente a Extended) en benchmarks de manipulación.
- Investigación en tokenización de acciones: permite estudiar cómo el presupuesto de 4096 tokens por perfil y la resolución de 5 mm afectan a la precisión del control en espacio `delta_joint`.
- Despliegue en robots con dos cámaras y gripper de una articulación: la interfaz de 8 valores de estado (7 articulaciones + gripper) encaja en brazos manipuladores estándar de 7 grados de libertad.
- Reproducibilidad de experimentos: el checkpoint autocontenido permite ejecutar inferencia offline sin dependencia del modelo base, útil en entornos aislados o con conectividad limitada.
- Prototipado de control a 15 Hz con replanificación por acción: adecuado para tareas que requieren reactividad ante cambios en la escena, ya que se ejecuta una acción antes de volver a planificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,2 mil millones de parámetros y pesos en safetensors (repo de 8,9 GB, que incluye tokenizadores y assets), se requiere una GPU con memoria suficiente para cargar los pesos completos; no se documentan cuantizaciones que reduzcan el requisito.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo de inferencia usa `device="cuda"` y requiere una GPU compatible con CUDA.
- Cabe en consumer GPU: no disponible; no se especifican requisitos mínimos ni perfiles de memoria.
- Opciones de despliegue: paquete `actioncodec2[cuda]` (v0.1.0) con `load_policy` del runtime `actioncodec2.vla.runtime`; requiere Python 3.12 o superior, compilador C++17, PyTorch 2.7.1 y Transformers 5.14.1. El extra `cuda` añade Liger y Flash Linear Attention. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: control a 15 Hz (una acción ejecutada antes de replanificar); no se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-2nd_DROID | 2.225.441.600 | no disponible | VLA robótica (DROID) | G0.5 Community (no comercial) | HuggingFace |
| OpenGalaxea/G05 (base) | no disponible | no disponible | VLA robótica | no disponible | HuggingFace |
| ActionCodec2 (tokenizador) | no aplica (tokenizador) | no disponible | Tokenización de acciones | Apache-2.0 (assets) | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia G0.5 Community License: uso no comercial, sin derechos de despliegue comercial. Cualquier uso en producción comercial requiere autorización expresa del titular.
- El vocabulario del tokenizador está ligado a los pesos entrenados; no debe sustituirse por el de la edición Extended, ya que los IDs de token cambiarían y la inferencia sería incorrecta.
- La acción previa debe pasarse en cada predicción con las mismas unidades y convención de gripper que las acciones devueltas; un límite de movimiento cero solo es válido si se sabe que el movimiento precedente fue cero.
- El modelo está especializado en manipulación robótica sobre DROID; no es un modelo de propósito general y no se documentan capacidades de texto, código o razonamiento general.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- La inferencia ha sido verificada con versiones concretas (Python 3.12, PyTorch 2.7.1, Transformers 5.14.1); otras combinaciones pueden no funcionar.
- El modelo base es OpenGalaxea/G05, cuyas características completas (contexto, idiomas, entrenamiento) no se detallan en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID
- Modelo base: https://hf-mirror.com/OpenGalaxea/G05
- Paquete ActionCodec2 (v0.1.0): https://hf-mirror.com/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Repositorio de ActionCodec2: https://hf-mirror.com/ZibinDong/ActionCodec2
- Configuración de política: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID/blob/main/policy_config.json
- Licencia G0.5 Community: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID/blob/main/NOTICE
- Licencia de assets del tokenizador: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID/blob/main/assets/tokenizer_artifact/LICENSE
- Licencia del tokenizador Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_DROID/blob/main/LICENSE_QWEN3_5.txt
