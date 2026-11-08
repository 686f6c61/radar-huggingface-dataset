# Zipeng365/WISP

## Resumen

WISP (Wrist-Informed Space of Predictive Representations) es una familia de metodos de aprendizaje automatico para el reconocimiento de actividad humana (HAR) mediante sensores portados en la muneca. Lo desarrolla ZipengWu (usuario Zipeng365) y se distribuye como un repositorio de metodo, no como un modelo generativo: incluye la implementacion de referencia, una interfaz de entrenamiento e inferencia, un entorno CPU fijado y 360 checkpoints de busqueda retenidos con un inventario explicito. No es un modelo de lenguaje ni un transformer: la libreria declarada es scikit-learn y el pipeline no esta definido en el Hub.

El problema que aborda es la clasificacion de actividades a partir de series temporales de movimiento captadas en la muneca, un escenario con senales ruidosas, alta variabilidad entre usuarios y recursos de computo limitados en el dispositivo. La propuesta central son representaciones componibles: siete modelos fijos (WISP-SS, WISP-RC, WISP-SO, WISP-GIS, WISP-CIS, WISP-CSE y WISP-ESE) mas variantes de seleccion (WISP-Select5, WISP-Select7) y de busqueda (WISP-Random, WISP-Evolution), que combinan informacion complementaria de distintas vistas de la senal.

Su relevancia actual es doble: por un lado, demuestra que es posible obtener HAR competitivo sin GPU ni frameworks de deep learning, usando solo NumPy, SciPy y scikit-learn; por otro, publica junto al metodo el benchmark WristHARBench y un conjunto de checkpoints y resultados auditables, lo que facilita la reproducibilidad en un area donde predominan los pipelines opacos. El repositorio ocupa 75,4 GB, en su mayor parte checkpoints y material audiovisual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia de metodos de representacion componible sobre scikit-learn para series temporales (no es un transformer ni una red neuronal profunda end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (trabaja sobre ventanas NPZ exportadas de senal de muneca, no sobre texto) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizados tipo GGUF/AWQ) |
| Idiomas soportados | no disponible (la entrada es senal de sensores, no lenguaje natural) |
| Licencia | MIT para el software y terminos especificos de checkpoint por fuente (mit-software-and-source-specific-checkpoint-terms) |
| Formato de pesos | checkpoints propios del metodo (no safetensors ni GGUF); datos de entrada en NPZ exportado |

## Arquitectura y entrenamiento

WISP no es una unica red neuronal, sino una familia de representaciones componibles. Cada modelo fijo define una forma distinta de construir y combinar vistas de la senal de muneca (por ejemplo, representaciones espaciales, de correlacion o de energia), y las variantes Select5 y Select7 eligen entre ellas mediante validacion. Las variantes Random y Evolution exploran el espacio de combinaciones mediante busqueda aleatoria y evolutiva respectivamente. La implementacion se apoya en NumPy, SciPy y scikit-learn, con kernels C opcionales que se compilan al instalar desde el codigo fuente y una ruta pura Python/NumPy mas lenta cuando no hay compilador disponible.

El entrenamiento se realiza sobre el benchmark WristHARBench, alojado en un repositorio de datos aparte con sus propios terminos de acceso y visibilidad. La interfaz local consume ventanas NPZ exportadas, no archivos fuente crudos ni filas arbitrarias de Parquet del Hub. El release incluye un entorno CPU fijado (Python 3.12.13, con lock de dependencias), una puerta de validacion de software que supero 55 tests y verifico la instalacion e importacion del wheel fuera del arbol de fuentes, y una reevaluacion de los 360 checkpoints retenidos contra un catalogo congelado de cuatro metricas. La inferencia completa con entrada real solo se repitio para seis checkpoints de ADL-Wrist fold-0 (Random y Evolution con semillas 42, 43 y 44).

## Capacidades

- Clasificacion de actividades humanas a partir de senales de sensores de muneca (acelerometro y giroscopio, segun el benchmark).
- Construccion de representaciones componibles que combinan informacion complementaria de varias vistas de la senal.
- Seleccion de modelo basada en validacion (WISP-Select5 y WISP-Select7).
- Busqueda de arquitecturas de representacion mediante estrategias aleatoria y evolutiva.
- Ejecucion integra en CPU, sin PyTorch ni CUDA, lo que permite despliegue en entornos sin GPU.
- Interfaz de linea de comandos (`wisp`) y paquete de API de release (`wisp_release`).
- Inventario auditable de checkpoints y predicciones de test inmutables para reproducibilidad.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Monitorizacion de actividad en wearables de consumo: el modelo clasifica actividades cotidianas a partir de la senal de muneca y puede ejecutarse en el propio dispositivo o en un servidor CPU, sin necesidad de GPU.
- Investigacion en HAR reproducible: el release incluye checkpoints, predicciones de test inmutables y un catalogo de metricas congelado, lo que permite replicar y auditar resultados de forma directa.
- Salud y bienestar: seguimiento de patrones de actividad fisica diaria (ADL) en estudios longitudinales, aprovechando la familia de modelos Select para elegir la representacion mas adecuada por cohorte.
- Prototipado rapido en entornos con recursos limitados: al depender solo de NumPy, SciPy y scikit-learn, se puede integrar en pipelines existentes de ciencia de datos sin introducir una pila de deep learning.
- Comparacion de estrategias de representacion: las variantes Random y Evolution permiten estudiar empiricamente que combinaciones de vistas aportan mas informacion en un dataset concreto.
- Despliegue en nodos de computo de cluster: el flujo documentado exige ejecutar instalacion, inferencia y entrenamiento en nodos asignados, lo que encaja con infraestructuras HPC academicas.
- Educacion y docencia: el material incluye animaciones narradas en ingles y chino, scripts y un proyecto reproducible que explican el metodo y los hallazgos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados documentados y una reevaluacion de los 360 checkpoints contra un catalogo de cuatro metricas, pero no incluye cifras concretas (exactitud, F1 u otras) en el material proporcionado, por lo que no se reproducen numeros.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: no requiere GPU ni CUDA; solo NumPy, SciPy y scikit-learn.
- Entorno fijado a Python 3.12.13; otras versiones parche de Python no estan cubiertas automaticamente por la validacion del modelo.
- Kernels C opcionales: con compilador C disponible se compilan al instalar desde fuente; sin el, el mismo codigo funciona por rutas puras de Python/NumPy mas lentas.
- Wheel precompilado para CPython 3.12 en Linux x86_64 incluido en `dist/`.
- Almacenamiento: el repositorio ocupa 75,4 GB, dominado por los 360 checkpoints retenidos y el material audiovisual; conviene planificar espacio en disco antes de clonar.
- Despliegue mediante la CLI `wisp` y el paquete `wisp_release`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WISP | Familia de metodos sklearn para HAR de muneca | no disponible | no disponible | MIT software + terminos de checkpoint | Hugging Face (metodo y checkpoints) |
| Alternativas de HAR con deep learning (CNN/LSTM sobre series temporales) | Redes neuronales | no disponible | no disponible | variable | variable |
| Alternativas de HAR con modelos fundacionales de series temporales | Transformers preentrenados | no disponible | no disponible | variable | variable |

No se dispone en la informacion proporcionada de datos concretos de parametros, contexto ni rendimiento de alternativas comparables, por lo que la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales; cualquier uso en ese sentido es inadecuado.
- El repositorio es un release de metodo, no una plataforma de baselines: excluye codigo de entrenamiento de terceros, entornos, pesos preentrenados y checkpoints de baseline.
- Los datos de WristHARBench se alojan aparte y estan sujetos a su propia visibilidad y terminos especificos por fuente; el repositorio de metodo no los duplica ni altera sus licencias.
- La licencia combina MIT para el software con terminos especificos para los checkpoints segun la fuente, lo que exige revisar `docs/MODEL_USE.md` antes de cualquier uso comercial.
- La validacion del modelo esta ligada a Python 3.12.13; ejecutar en otras versiones parche invalida la garantia de validacion declarada.
- Solo seis checkpoints de ADL-Wrist fold-0 fueron reejecutados con inferencia completa sobre entrada real; el resto se reevaluo a partir de predicciones de test guardadas.
- Riesgo de sobreajuste a los dominios y usuarios del benchmark: la variabilidad de colocacion del dispositivo y de fisiologia entre personas puede degradar el rendimiento fuera de la distribucion de entrenamiento.
- Sesgos demograficos y de estilo de movimiento no documentados en la informacion disponible.
- El flujo de instalacion y ejecucion debe realizarse en nodos de computo asignados en cluster, no en nodos de login.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zipeng365/WISP
- Dataset WristHARBench: https://huggingface.co/datasets/Zipeng365/WristHARBench
- Terminos de uso del modelo: https://huggingface.co/Zipeng365/WISP/blob/main/docs/MODEL_USE.md
- Documentacion de metodos: https://huggingface.co/Zipeng365/WISP/blob/main/docs/METHODS.md
- Documentacion de evaluacion: https://huggingface.co/Zipeng365/WISP/blob/main/docs/EVALUATION.md
- Notas de entorno: https://huggingface.co/Zipeng365/WISP/blob/main/environments/README.md
- Paper (Pure, University of Birmingham): https://research.birmingham.ac.uk/en/publications/wisp-composable-representations-for-wrist-worn-activity-recogniti/
- Video en ingles: https://huggingface.co/Zipeng365/WISP/resolve/main/videos/WISP_en_mimo_voice.mp4
- Video en chino: https://huggingface.co/Zipeng365/WISP/resolve/main/videos/WISP_zh_mimo_voice.mp4
- Proyecto reproducible: https://huggingface.co/Zipeng365/WISP/blob/main/videos/WISP_MiMo_reproducible_project.zip
- Instrucciones de reproduccion: https://huggingface.co/Zipeng365/WISP/blob/main/videos/REPRODUCE.md
