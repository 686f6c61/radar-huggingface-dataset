# starry0929/pi05_s1_stack_cups_random498_20261024_best_pytorch

## Resumen

Este checkpoint es un modelo visión-lenguaje-acción (VLA) para robótica, obtenido por *fine-tuning* del modelo Pi 0.5 de Physical Intelligence sobre una única tarea de manipulación bimanual: apilar vasos con el robot Astribot S1. Lo publica el usuario `starry0929` dentro de una línea de trabajo que versiona sistemáticamente cada experimento (variantes `all111`, `corrective_v14`, `random498`), con contratos de entrada/salida explícitos y trazabilidad del *checkpoint* mediante hash. El modelo no genera texto ni código: recibe tres imágenes RGB de 224x224 (cabeza y dos muñecas) más un *prompt* de tarea fijo y emite directamente 50x22 objetivos articulares absolutos en radianes.

La relevancia es doble. Por un lado, es un ejemplo poco habitual de publicación reproducible en robótica: incluye los pesos originales en JAX, la conversión a PyTorch en BF16, las estadísticas exactas de normalización, el código fuente de OpenPI fijado a un *commit* concreto y los recibos de selección del *checkpoint* (`best_selection.json`). Por otro, documenta con honestidad sus propios límites: el 5/15 declarado corresponde a un panel fijo de reproducción de casos de entrenamiento, no a una evaluación *held-out*.

El modelo tiene 3.616.757.520 parámetros (3,62 mil millones) y se distribuye en `safetensors` junto a los bytes EMA originales en `jax/params/`, bajo licencia Apache 2.0 con los avisos de Gemma conservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de Pi 0.5 (transformador visión-lenguaje con *action expert* y decodificación por *flow matching*, 10 pasos de *denoising*) |
| Parametros totales | 3.616.757.520 (3,62 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El *prompt* se codifica con relleno exacto de 200 tokens |
| Tipos de cuantizacion | BF16 (pesos convertidos en `model.safetensors`); bytes EMA originales en `jax/params/`. No se publican GGUF, INT8 ni INT4 |
| Idiomas soportados | en, zh (etiquetas del autor). En la práctica el *prompt* de inferencia es fijo en inglés: `Stack_the_cups_together` |
| Licencia | Apache 2.0, con avisos de licencia de Gemma conservados (`LICENSE`, `LICENSE_GEMMA.txt`) |
| Formato de pesos | `safetensors` (BF16, PyTorch) + `jax/params/` (EMA original en JAX) |

Especificaciones del contrato de inferencia:

| Elemento | Valor |
|---|---|
| Entradas visuales | 3 cámaras: `base_0_rgb` (cabeza), `left_wrist_0_rgb`, `right_wrist_0_rgb` |
| Resolución y formato | 224x224, uint8 RGB, fotograma completo |
| Entrada de estado | La API acepta `state32`, pero el modelo entrenado **no consume** el estado articular (`discrete_state_input=False`, `state_in_prompt=False`) |
| Salida | 50x22 objetivos articulares nativos absolutos en radianes, incluidas 2 pinzas `gripperL1` |
| Frecuencia de control | 30 Hz; H=50, K=50; 10 pasos de *denoising*; 525 acciones absolutas por episodio de 17,5 s |
| Normalización | 22 canales normalizados antes del relleno a 32; decodificación de los 22 primeros con estadísticas q01/q99 y epsilon 1e-6, sin recorte |
| Semilla | seed 0 (los mismos números de semilla en JAX y PyTorch no implican el mismo ruido) |

## Arquitectura y entrenamiento

El modelo desciende del Pi 0.5 oficial a través del EMA de 10k del *run* `the9023`. La rama `this9033` reinicia AdamW en el paso 10k y continúa el reloj global de entrenamiento hasta 50k. Se trata de un transformador visión-lenguaje-acción: un codificador visual procesa las tres cámaras, un codificador de lenguaje procesa el *prompt* de tarea y un *action expert* genera *chunks* de acciones mediante *flow matching* con 10 pasos de integración. La innovación respecto a un transformer convencional está en la cabeza generativa de acciones y en el esquema de *chunking* (H=50, K=50) que permite control a 30 Hz sin replanificar en cada *tick*.

Los datos de entrenamiento son 498 episodios admitidos que suman 261.450 fotogramas, con muestreo uniforme de fotograma completo, tamaño de lote 128, FSDP sobre 8 dispositivos y EMA de 0,99. No se incluye el *dataset*, ni el estado del optimizador, ni `train_state`. La selección del *checkpoint* final se hizo en el paso global 30000 por ser el de mayor número de éxitos estrictos en un panel fijo común de 15 casos a lo largo de este linaje de entrenamiento, con desempate a favor del paso más temprano (`best_selection.json`). El criterio de éxito de la tarea exige éxito nativo, comprobaciones duras nativas y un margen libre de al menos 20 mm entre brazo y pinza en los 35.001 estados nativos registrados; el autor advierte explícitamente que el margen medido en estados muestreados no garantiza margen entre estados muestreados.

## Capacidades

- Manipulación bimanual nativa: apilado de vasos con dos brazos y dos pinzas sobre el robot Astribot S1.
- Percepción visual multi-cámara: integra cabeza y dos muñecas a 224x224 en un único *forward*.
- Generación de *chunks* de acción: 50 pasos x 22 articulaciones por inferencia, en radianes absolutos, a 30 Hz.
- Control de pinza incluido en el vector de acción (dos objetivos `gripperL1`), sin mapeo separado de apertura.
- Inferencia en dos backends: `NativePolicy(backend='pytorch')` para los pesos BF16 convertidos y `backend='jax'` para el EMA original.
- Reproducibilidad de la normalización: `assets/` incluye las estadísticas exactas q01/q99 y el *encoding* del *prompt* con relleno de 200 tokens.
- **No** soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes, matemáticas, generación de código ni diálogo general. Es un modelo de política, no un LLM conversacional.
- **No** soporta *thinking mode*, audio ni vídeo.

## Casos de uso

- Reproducción de experimentos en robótica bimanual: cargar el *checkpoint* con `NativePolicy('.', backend='jax', device='cuda')` y ejecutar `example_observation.npz` para validar que la instalación reproduce la inferencia del autor antes de tocar hardware.
- Investigación en *fine-tuning* de VLA: usar los pesos como inicialización para otras tareas de manipulación con el mismo robot, ya que se incluye el código nativo de entrenamiento y adaptador en `training_source/`.
- Evaluación de paridad entre backends: comparar las trayectorias JAX y PyTorch con la misma semilla sobre el mismo episodio (teniendo en cuenta que la semilla no garantiza el mismo ruido) para estudiar la degradación de la conversión.
- Banco de pruebas de controladores: el modelo solo emite objetivos articulares; sirve para validar la pila de control calibrada de un S1 (IK, servo, límites) sin depender de un modelo propietario.
- Docencia y divulgación sobre VLA: el contrato de entrada/salida explícito y los recibos de selección lo convierten en un caso de estudio de trazabilidad y evaluación honesta en robótica aprendida.
- Análisis de compromiso entre datos y rendimiento: comparar este `random498` con las variantes `all111` y `corrective_v14` del mismo autor para estudiar cómo afecta la composición del *dataset* a la tasa de éxito en el panel de 15 casos.
- *Smoke test* de infraestructura: validación en CPU que recarga estrictamente el `safetensors` real y ejecuta 10 pasos de *denoising*, útil como comprobación de integridad en CI antes de reservar GPU.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Alcance |
|---|---|---|
| Panel fijo de reproduccion de casos de entrenamiento (15 episodios), EMA JAX original | 5/15 exitos estrictos | No es *held-out* ni una tasa sobre los 498 casos |
| Seleccion de checkpoint | Paso global 30000, maximo de exitos estrictos en el panel comun de 15 | Desempate a favor del paso mas temprano (`best_selection.json`) |
| Validacion en CPU | Recarga estricta de SafeTensors + 10 pasos de *denoising* | No es prueba de bucle cerrado ni de paridad entre backends |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o CALVIN) en la informacion disponible. El autor indica que los resultados de evaluación en JAX no establecen un rendimiento equivalente en bucle cerrado con PyTorch.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10-16 GB en BF16 para inferencia (estimación a partir de 3,62 B de parámetros, unos 7,2 GB de pesos, más activaciones del codificador visual con tres imágenes de 224x224; el autor no publica cifra).
- GPU recomendadas: RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB, H100. Cabe en GPU de consumo con 16 GB o más en BF16.
- Despliegue: no aplica vLLM, TGI ni llama.cpp (no es un LLM y no hay GGUF). El despliegue es mediante `NativePolicy` de OpenPI, con backend `pytorch` o `jax`, instalando la revisión `215abfb217dbac7d5f1273282331b9b1866c0479` y el reemplazo documentado de Transformers (4.53.2).
- Configuración de entorno: añadir `openpi_source/src` y `openpi_source/packages/openpi-client/src` a `PYTHONPATH`.
- Latencia y *throughput*: no publicados. El requisito operativo es sostener 30 Hz con 10 pasos de *denoising* por *chunk* de 50 acciones.
- Almacenamiento: el repositorio ocupa 19,7 GB (incluye pesos PyTorch, pesos JAX duplicados y código fuente).
- No se incluye asistencia de agarre, corrección de IK, servo, SDK de robot ni publicador de acciones: `NativePolicy` solo produce objetivos del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`random498`, step 30000) | 3,62 B | No disponible (prompt de 200 tokens) | Apilado de vasos, S1 bimanual | Apache 2.0 + avisos Gemma | Publico en HF, 0 descargas |
| `starry0929/pi05_s1_stack_cups_all111_initial_focus_resume_v3_20261019_step30000_pytorch` | No disponible en la informacion | No disponible | Apilado de vasos, S1 | openpi-apache-2.0-and-gemma | Publico en HF |
| `starry0929/pi05_s1_stack_cups_corrective_v14_20261020_step250_pytorch` | No disponible en la informacion | No disponible | Apilado de vasos, S1 (correctivo) | openpi-apache-2.0-and-gemma | Publico en HF |
| Pi 0.5 oficial (Physical Intelligence, `openpi`) | ~3 B (misma familia) | No disponible | Politica VLA generalista | Apache 2.0 | Publico en GitHub |

## Limitaciones y advertencias

- Modelo de tarea única: solo apilado de vasos con el *prompt* exacto `Stack_the_cups_together`; no generaliza a otras instrucciones ni objetos sin reentrenar.
- La tasa 5/15 procede de un panel fijo de reproducción de casos de entrenamiento, con 15 episodios. Es una muestra pequeña y no equivale a éxito en producción ni sobre los 498 episodios del *dataset*.
- El modelo **no** consume el estado articular aunque la API acepte `state32`; activar el *state prompting* en inferencia es un cambio no soportado por este *checkpoint*.
- La salida son objetivos articulares absolutos en radianes, no control EEF ni delta, y no corresponde al mapeo antiguo de 30 articulaciones más 2 de apertura. Un orden de articulaciones incorrecto produce movimientos peligrosos.
- La decodificación debe usar q01/q99 con epsilon 1e-6 y sin recorte; cualquier variación altera la escala de las acciones.
- El margen de 20 mm se verifica solo en los estados nativos muestreados; no garantiza ausencia de colisión entre estados.
- Los resultados de evaluación en JAX no acreditan rendimiento equivalente en bucle cerrado con PyTorch; además, igual semilla en ambos backends no implica igual ruido.
- No se incluye controlador calibrado, SDK ni publicador de acciones: la ejecución real requiere la pila nativa del S1 y configuración específica del robot.
- Riesgo de sobreajuste a los 498 episodios y a las condiciones de captura concretas (iluminación, disposición de vasos, cámara); no se documentan evaluaciones de robustez ni de generalización.
- Licencia Apache 2.0 con avisos de Gemma heredados: conviene revisar `LICENSE_GEMMA.txt` antes de un uso comercial, ya que los términos de Gemma pueden imponer condiciones adicionales sobre partes de los pesos.
- Repositorio sin descargas ni *likes* y con fecha de creación en 2026-10-24: no hay validación independiente por terceros.
- Sesgos: no evaluados ni documentados por el autor; al ser un modelo de política entrenado con datos propios, puede heredar sesgos de las demostraciones (posiciones preferidas, estrategias de agarre).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/starry0929/pi05_s1_stack_cups_random498_20261024_best_pytorch
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Variante del mismo linaje `all111_initial_focus_resume_v3` (step 30000): https://huggingface.co/starry0929/pi05_s1_stack_cups_all111_initial_focus_resume_v3_20261019_step30000_pytorch
- Variante del mismo linaje `corrective_v14` (step 250): https://huggingface.co/starry0929/pi05_s1_stack_cups_corrective_v14_20261020_step250_pytorch
- Identidad del *checkpoint* (SHA-256): `07b18bcedd6291cde8e4f1b3be28f9fc73fc7097851532761de3cb90be79d8d2`
- Revision OpenPI fijada: `215abfb217dbac7d5f1273282331b9b1866c0479`
- No se han encontrado en la busqueda web *papers*, blogs ni demos adicionales especificos de este modelo.
