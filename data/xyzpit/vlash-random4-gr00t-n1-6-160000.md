# XYZPIT/vlash-random4-gr00t-n1.6-160000

## Resumen

El modelo `XYZPIT/vlash-random4-gr00t-n1.6-160000` es un finetune del modelo fundacional de robótica **Isaac GR00T N1.6** de NVIDIA, adaptado al embodiment **Galaxea R1 Lite** (robot bimanual con dos pinzas). Lo desarrolla el usuario XYZPIT y lo publica en Hugging Face bajo licencia "other" sin especificar. Su principal innovación es la técnica de aumento temporal **VLASH** (random delay 0–4): durante el entrenamiento, para cada muestra se extrae un retardo `k ~ U[0,4]` y se desplazan las ventanas de estado y acción `k` pasos respecto a la observación de vídeo y lenguaje. Esto permite que el modelo prediga un chunk de acciones que comienza varios pasos después de la observación dada, habilitando la **ejecución asíncrona de chunks** en el robot real: el siguiente chunk puede calcularse mientras el actual aún se está ejecutando.

El modelo tiene **3.286.608.832 parámetros** (≈3,29 mil millones), un tamaño de repositorio de 9,8 GB y está disponible en formato safetensors. El checkpoint corresponde al paso 160.000 del entrenamiento. No se especifica la longitud de contexto ni los idiomas soportados. Es un modelo de tipo VLA (vision-language-action) que toma entradas multimodales (vídeo, lenguaje y estado) para generar acciones de manipulación. Su relevancia radica en que aborda un problema práctico en robótica: la latencia entre la percepción y la ejecución, mejorando la fluidez de los movimientos en tareas de manipulación bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en Isaac GR00T N1.6, transformer multimodal |
| Parametros totales | 3.286.608.832 (≈3,29 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Isaac GR00T N1.6**, un VLA abierto de NVIDIA para habilidades robóticas humanoides. El finetune se realiza sobre el checkpoint base y se ajustan únicamente las capas 12–15 del backbone LLM y la cabeza de acciones (action head). El embodiment se registra como `new_embodiment` (R1 Lite, bimanual con dos pinzas) y el horizonte de acción es de 16 pasos.

La innovación clave es el aumento temporal **VLASH**: para cada muestra de entrenamiento se sortea un retardo `k ~ U[0,4]` y se desplazan las ventanas de estado y acción `k` pasos, mientras que el vídeo y el lenguaje permanecen en el timestep base. El estado retardado es el estado medido real en `t + k` (`use_state_ground_truth=true`). De esta forma, la política aprende a predecir un chunk de acciones que comienza `k` pasos después de la observación, lo que permite la ejecución asíncrona de chunks en el robot. El entrenamiento alcanza el paso 160.000 y el checkpoint solo incluye artefactos de inferencia (no se puede reanudar el entrenamiento).

## Capacidades

- **Generación de acciones robóticas**: produce chunks de 16 pasos de acción para el robot Galaxea R1 Lite, incluyendo articulaciones de brazos y pinzas.
- **Ejecución asíncrona de chunks**: gracias al aumento de retardo, el modelo puede calcular el siguiente chunk mientras el actual se ejecuta, reduciendo la latencia efectiva.
- **Entrada multimodal**: procesa vídeo, instrucciones en lenguaje natural y estado del robot (medido con retardo).
- **Soporte bimanual**: diseñado para un embodiment con dos brazos y dos pinzas.
- **Robustez a retardos**: el modelo mantiene un error bajo para retardos entre 0 y 6 pasos, con el mínimo en el rango 4–6.
- **No incluye** capacidades de tool calling, agentes conversacionales ni generación de texto general; es un modelo puramente orientado a control robótico.

## Casos de uso

- **Manipulación bimanual en entornos industriales**: el modelo puede controlar un robot R1 Lite para tareas de ensamblaje o recogida y colocación de objetos, aprovechando su capacidad de procesar vídeo y lenguaje para interpretar instrucciones de alto nivel.
- **Ejecución asíncrona de tareas en líneas de producción**: al predecir chunks que comienzan con retardo, el robot puede solapar el cálculo del siguiente movimiento con la ejecución actual, reduciendo el tiempo de ciclo en tareas repetitivas.
- **Teleoperación asistida**: un operador humano proporciona comandos en lenguaje natural o demostraciones por vídeo, y el modelo genera los movimientos correspondientes con una latencia compensada.
- **Aprendizaje por imitación**: el finetune con aumento de retardo permite entrenar políticas a partir de demostraciones humanas donde la sincronización entre observación y acción no es perfecta, mejorando la robustez del aprendizaje.
- **Investigación en robótica**: sirve como banco de pruebas para estudiar el efecto del retardo temporal en políticas VLA y para desarrollar métodos de ejecución asíncrona en robots humanoides.
- **Prototipado rápido de habilidades**: al ser un checkpoint de solo inferencia, los desarrolladores pueden integrarlo en simuladores (como Isaac Sim) para validar comportamientos antes de desplegarlo en el hardware real.

## Benchmarks y rendimiento

La model card incluye una evaluación open-loop con barrido de retardos (delay sweep) sobre 3 trayectorias × 200 pasos, con horizonte 16. Los resultados se presentan como error de acción no normalizado (MSE y MAE) para articulaciones de brazo (en radianes) y para todas las claves concatenadas (dominadas por las pinzas, que abarcan 0–100).

**Articulaciones de brazo (rad):**

| delay | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| MSE | .00103 | .00124 | .00097 | .00049 | .00037 | **.00034** | .00036 | .00048 | .00048 |
| MAE | .01344 | .01358 | .01227 | .01129 | .01022 | **.01033** | .01071 | .01181 | .01196 |

**Todas las claves concatenadas (dominadas por pinzas):**

| delay | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| MSE | .00605 | .00619 | .00626 | .00561 | .00586 | **.00551** | .00571 | .00599 | .00629 |
| MAE | .02768 | .02792 | .02728 | .02535 | .02599 | **.02520** | .02588 | .02649 | .02739 |

El error de brazo alcanza su mínimo en retardos 4–6, aproximadamente 3 veces menor que en retardo 0, y degrada en retardos 7–8 (fuera del rango de entrenamiento). El error de pinzas es plano en todos los retardos, ya que son transiciones discretas de apertura/cierre. **Advertencia**: la evaluación se realizó sobre el dataset de entrenamiento, por lo que los números reflejan ajuste al conjunto de entrenamiento, no generalización a datos no vistos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3,29 B parámetros, en fp32 se necesitan ~13 GB, en fp16 ~6,6 GB y en int8 ~3,3 GB. El repositorio de 9,8 GB sugiere pesos en fp32 o fp16.
- **GPU recomendadas**: una GPU con al menos 8–12 GB de VRAM es suficiente para fp16 (p. ej., RTX 3090, RTX 4090, A5000). Para fp32 se recomienda una A100 (40 GB) o similar.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3090 o 4090 puede ejecutar el modelo en fp16 sin problemas.
- **Opciones de despliegue**: la librería `gr00t` (de NVIDIA) es la vía principal, con la clase `Gr00tPolicy`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje general.
- **Latencia y throughput**: no se proporcionan datos específicos. En una GPU moderna, un chunk de 16 pasos debería procesarse en decenas de milisegundos, pero depende del hardware y de la resolución de vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **VLASH GR00T N1.6 (este)** | 3,29 B | No disponible | VLA finetune | Other | Hugging Face |
| **Isaac GR00T N1.6 (base)** | No disponible | No disponible | VLA fundacional | NVIDIA (open) | Hugging Face, GitHub |
| **Isaac GR00T N1.5** | No disponible | No disponible | VLA fundacional | NVIDIA (open) | GitHub (rama n1.5-release) |
| **Isaac GR00T N1.7** | No disponible | No disponible | VLA fundacional | NVIDIA (open) | GitHub |

Según la documentación de NVIDIA, GR00T N1.6 converge más rápido que N1.5 y produce acciones más suaves, pero requiere un ajuste más cuidadoso para evitar sobreajuste. Este finetune añade la técnica VLASH, que no está presente en el modelo base, y se centra en un embodiment específico (R1 Lite). No se dispone de datos de parámetros para los modelos base, por lo que no es posible una comparación cuantitativa directa.

## Limitaciones y advertencias

- **Evaluación solo sobre el dataset de entrenamiento**: los resultados del delay sweep no reflejan generalización a datos no vistos; el rendimiento en el mundo real podría ser inferior.
- **Rango de retardo limitado**: el modelo se entrenó con retardos 0–4; para retardos mayores (7–8) el error aumenta significativamente, por lo que no es adecuado para escenarios con latencias superiores a 4 pasos.
- **Licencia "other" no especificada**: no se detallan los términos de uso comercial; es necesario contactar al autor o revisar los metadatos del repositorio antes de usarlo en producción.
- **Sin capacidad de reanudar entrenamiento**: el checkpoint solo incluye pesos de inferencia (sin optimizer, scheduler ni estado del entrenador), lo que impide continuar el fine-tuning desde este punto.
- **Sesgos del modelo base**: al ser un finetune de GR00T N1.6, hereda posibles sesgos en la interpretación de lenguaje o vídeo del modelo original.
- **Riesgo de alucinación en acciones**: como todo VLA, puede generar movimientos no deseados si la entrada de vídeo o lenguaje es ambigua o fuera de distribución.
- **Idiomas no especificados**: no se indica qué idiomas soporta el modelo para las instrucciones en lenguaje natural; probablemente se limita a inglés (idioma principal de GR00T).

## Enlaces

- [Hugging Face - XYZPIT/vlash-random4-gr00t-n1.6-160000](https://huggingface.co/XYZPIT/vlash-random4-gr00t-n1.6-160000)
- [NVIDIA Research - GR00T N1.6](https://research.nvidia.com/labs/gear/gr00t-n1_6/)
- [GitHub - NVIDIA/Isaac-GR00T (N1.7)](https://github.com/NVIDIA/Isaac-GR00T)
- [GitHub - dbw6/my-Isaac-GR00T (N1.6)](https://github.com/dbw6/my-Isaac-GR00T)
- [Hugging Face - nvidia/GR00T-N1.6-3B](https://huggingface.co/nvidia/GR00T-N1.6-3B)
- [Publicación - GR00T N1.6 Technical Report](https://tyxiong23.github.io/publications/2025-12-15-groot-n1.6/)
