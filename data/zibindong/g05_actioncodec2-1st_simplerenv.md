# ZibinDong/G05_ActionCodec2-1st_SimplerEnv

## Resumen

G05_ActionCodec2-1st_SimplerEnv es un modelo de política viso-lenguaje-acción (VLA) para robótica, desarrollado por el usuario ZibinDong a partir del modelo base OpenGalaxea/G05. Se trata de un ajuste fino (fine-tune) sobre el conjunto de datos Bridge, orientado específicamente a la evaluación del robot WidowX en el entorno simulado SimplerEnv. El modelo incorpora el tokenizador de acciones ActionCodec2-1st, en su variante "5 mm Paper-edition", con un presupuesto de 4.096 tokens por perfil.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de cámara en secuencias de acciones motoras de bajo nivel para un brazo robótico, sin necesidad de estado observado explícito. Con 2.221.165.376 parámetros y un tamaño de repositorio de 8,9 GB, el checkpoint incluye sus propios activos: el tokenizador de acciones, los activos ajustados y el tokenizador de texto, de modo que la inferencia funciona sin conexión y sin depender del checkpoint base G0.5 ni de otro repositorio de tokenizadores.

Su relevancia actual radica en que ejemplifica el paradigma de tokenización de acciones discretas aplicado a políticas VLA, empaquetando todo el pipeline de inferencia en un único repositorio reproducible. La licencia es la G0.5 Community License, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenGalaxea/G05 con tokenizador de acciones ActionCodec2-1st |
| Parametros totales | 2.221.165.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | g05-community (G0.5 Community License, no comercial); activos ActionCodec2 bajo Apache-2.0; tokenizador de texto Qwen3.5 bajo su propia licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint OpenGalaxea/G05, un modelo viso-lenguaje-acción que procesa imágenes RGB y una instrucción de tarea en lenguaje natural para producir acciones motoras. La innovación principal es el uso del tokenizador de acciones ActionCodec2-1st en su variante `paper-o1-5mm-4k-2bin-1p2ms`, la edición "5 mm Paper" descrita en el artículo de ActionCodec2, con un presupuesto de 4.096 tokens por perfil. Esto implica que las acciones continuas se discretizan en tokens y el modelo las genera como una secuencia de tokens, en lugar de regresar directamente valores continuos.

El entrenamiento se realizó sobre el conjunto de datos Bridge, y el modelo está orientado a la evaluación del robot WidowX en SimplerEnv. El checkpoint incorpora el vocabulario del tokenizador de acciones empaquetado, y los IDs de token están ligados a los pesos entrenados, por lo que no debe sustituirse por el vocabulario de la edición Extended (reentrenada tras un filtrado adicional de los datos de preentrenamiento). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de secuencias de acciones robóticas a partir de imágenes RGB y una instrucción de tarea en lenguaje natural.
- Control de un brazo robótico WidowX en el simulador SimplerEnv, con espacio de acciones `delta_eef` y representación de rotación `euler_xyz`.
- Predicción de 10 acciones por llamada, con ejecución de 5 acciones antes de replanificar, a una frecuencia de control de 5 Hz.
- Procesamiento de una cámara (`observation.images.image_0`) con redimensionado interno a 256 × 256.
- Funcionamiento sin estado observado explícito (el estado observado no es requerido).
- Inferencia offline una vez descargado el repositorio completo, sin dependencia del checkpoint base G0.5.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Evaluación de políticas VLA en simulación: el modelo se usa para medir el rendimiento de una política entrenada con Bridge sobre tareas de manipulación del robot WidowX en SimplerEnv, aprovechando que el repositorio incluye los clientes de evaluación y las recetas de entrenamiento.
- Investigación en tokenización de acciones: permite reproducir y comparar la variante "5 mm Paper-edition" de ActionCodec2 frente a otras tokenizaciones, ya que el vocabulario está empaquetado y ligado a los pesos.
- Control de manipulación con instrucciones en lenguaje natural: se le proporcionan imágenes de cámara y una instrucción como "pick up the object" para obtener una secuencia de 10 acciones `delta_eef` que se ejecutan en bloques de 5.
- Desarrollo de pipelines de robótica simulada: sirve como política de referencia en entornos SimplerEnv para validar la conversión de acciones específica del benchmark que realizan los clientes de evaluación incluidos.
- Pruebas de integración de inferencia: el ejemplo de la model card permite verificar la carga del modelo y la interfaz de predicción con entradas sintéticas antes de conectar observaciones reales.
- Reproducibilidad de experimentos: al incluir tokenizador de acciones, activos ajustados y tokenizador de texto, facilita la replicación de resultados sin depender de recursos externos.
- Prototipado de sistemas de imitación visual: útil para investigadores que quieran partir de un checkpoint ya ajustado a Bridge en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.221.165.376 parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 4,4 GB, más el coste de activaciones y del codificador visual, por lo que se recomienda una GPU con al menos 8-12 GB de VRAM.
- GPU recomendadas: no se especifican en la información disponible; se requiere una GPU compatible con CUDA para el ejemplo de inferencia.
- Cabe en GPU de consumo: no confirmado, pero por el tamaño de pesos es plausible en tarjetas con 8 GB o más de VRAM; no hay datos oficiales.
- Opciones de despliegue: el paquete oficial `actioncodec2[cuda]` (con Liger y Flash Linear Attention) mediante `actioncodec2.vla.runtime.load_policy`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica una frecuencia de control de 5 Hz y la ejecución de 5 acciones antes de replanificar.
- Requisitos de software: Python 3.12 o superior, compilador C++17, PyTorch 2.7.1 y Transformers 5.14.1 (versiones verificadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-1st_SimplerEnv | 2.221.165.376 | no disponible | VLA para WidowX en SimplerEnv | g05-community (no comercial) | HuggingFace |
| OpenGalaxea/G05 (base) | no disponible | no disponible | VLA general | no disponible | HuggingFace |
| ActionCodec2 (tokenizador) | no aplica (tokenizador) | no disponible | Tokenizacion de acciones | Apache-2.0 (activos) | HuggingFace (ZibinDong/ActionCodec2) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia G0.5 Community License: no permite despliegue ni uso comercial; los pesos son una versión modificada de G0.5.
- El modelo está ajustado específicamente para el robot WidowX en SimplerEnv con el dataset Bridge; su generalización a otros robots, entornos o tareas no está documentada.
- Los IDs de token están ligados a los pesos entrenados: no se debe sustituir el vocabulario empaquetado por el de la edición Extended, ya que rompería la correspondencia.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset concreto de robótica, puede heredar sesgos de las condiciones de captura de Bridge.
- Riesgo de alucinación en la generación de acciones no cuantificado; no hay métricas publicadas de éxito en tareas.
- Idiomas soportados no disponibles; las instrucciones de tarea se ejemplifican en inglés.
- No se especifican limitaciones de longitud de contexto ni de ventana de observación.
- Para control real de robots se requiere proporcionar imágenes de cámara actuales, instrucción de tarea y, según el contrato de inferencia, estado observado y acción previa; el ejemplo de la model card usa entradas sintéticas solo para verificar la interfaz.
- La fecha de creación del repositorio (2026-10-28) es posterior a la fecha actual en algunos contextos; conviene verificar la vigencia del snapshot y fijar una revisión concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv
- Modelo base OpenGalaxea/G05: https://hf-mirror.com/OpenGalaxea/G05
- Repositorio del tokenizador ActionCodec2: https://hf-mirror.com/ZibinDong/ActionCodec2
- Archivo fuente de ActionCodec2 v0.1.0: https://hf-mirror.com/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Configuración de política: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv/blob/main/policy_config.json
- Licencia G0.5 Community: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv/blob/main/LICENSE
- Aviso NOTICE: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv/blob/main/NOTICE
- Licencia de activos del tokenizador: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv/blob/main/assets/tokenizer_artifact/LICENSE
- Licencia del tokenizador Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-1st_SimplerEnv/blob/main/LICENSE_QWEN3_5.txt
