# yinpei-tri-pi/robocasa-system1-pi05-progact

## Resumen

RoboCasa System1 es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario yinpei-tri-pi, concebido como el componente de nivel bajo ("System1") de una arquitectura jerárquica System2 + System1 evaluada en el benchmark RoboCasa365. Dada una instrucción de tarea, un subobjetivo generado por System2, una estimación de la longitud del segmento, tres vistas de cámara de 256x256, las vistas del inicio del subobjetivo (ancla) y el estado del robot, el modelo devuelve bloques de 20 acciones con un valor de progreso del subobjetivo por paso añadido como duodécima dimensión de la acción.

Técnicamente se basa en pi0.5 (implementación openpi en JAX), con un backbone PaliGemma y un experto de acción basado en flow matching. Los pesos derivan de PaliGemma y están sujetos a los Términos de Uso de Gemma, mientras que el código de openpi es Apache-2.0. El checkpoint publicado corresponde al paso 269999 (270k pasos, batch 512) de la ejecución `f0717-270k-bs512-progact__progact_granfine_verbsimp_noexec`.

Su relevancia es acotada pero específica: se trata de un artefacto de investigación reproducible para el protocolo de evaluación RoboCasa365, que combinado con el modelo System2 `yinpei-tri-pi/robocasa-system2-qwen3vl-4b` y con todo el direccionamiento lingüístico activado alcanzó un 54,3% global en dicho protocolo (atomic-seen 80,1; composite-seen 51,5; composite-unseen 28,1; 50 tareas x 50 ensayos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (openpi, JAX): backbone PaliGemma + experto de acción con flow matching |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other / gemma (Gemma Terms of Use); el código openpi es Apache-2.0 |
| Formato de pesos | Orbax (`params/`), más `norm_stats.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la receta pi0.5 implementada en openpi sobre JAX. Combina un backbone de visión-lenguaje PaliGemma con un experto de acción entrenado mediante flow matching, que genera bloques de 20 acciones. La entrada incluye la instrucción de tarea, el subobjetivo actual de System2, una longitud de segmento estimada, tres vistas de cámara de 256x256, las vistas ancla del inicio del subobjetivo y el estado del robot. La salida es un chunk de 20 acciones en el que la duodécima dimensión codifica el progreso del subobjetivo por paso ("progress-as-action").

El checkpoint publicado corresponde al paso 269999 de una ejecución de 270k pasos con batch 512, identificada como `f0717-270k-bs512-progact__progact_granfine_verbsimp_noexec`. El repositorio incluye un `config.json` que selecciona la configuración exacta de prompt y E/S con la que fue entrenado, junto con las estadísticas de normalización en `assets/robocasa_system1/norm_stats.json`. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas en bloques de 20 pasos a partir de observaciones visuales multimodales (tres cámaras de 256x256) y estado del robot.
- Condicionamiento por subobjetivos: acepta un subobjetivo generado por un modelo System2 y lo traduce en comportamiento motor de bajo nivel.
- Estimación de progreso por paso: emite un valor de progreso del subobjetivo como dimensión adicional de la acción, lo que permite monitorizar el avance dentro del segmento.
- Condicionamiento por longitud de segmento estimada, lo que permite ajustar la ejecución al horizonte planificado por el nivel superior.
- Uso de vistas ancla del inicio del subobjetivo para anclar la percepción y la ejecución.
- Integración mediante el protocolo websocket de openpi, servido por `system1/serve_system1.py`.
- No se documentan capacidades de tool calling, agentes genéricos, multilingüismo ni modos de razonamiento explícito; el modelo está especializado en control robótico dentro de RoboCasa.

## Casos de uso

- Evaluación en RoboCasa365: ejecutar el protocolo del leaderboard con la pareja System2 + System1 para reproducir el 54,3% global reportado, útil para comparar variantes de planificación jerárquica.
- Investigación en control jerárquico: usar el modelo como política de bajo nivel que consume subobjetivos de un planificador de alto nivel y devuelve chunks de acción, permitiendo estudiar la interfaz entre ambos niveles.
- Manipulación robótica de tareas atómicas: en escenarios vistos del benchmark (80,1% en atomic-seen), sirve como política de referencia para tareas simples de manipulación con instrucción en lenguaje natural.
- Estudio de tareas compuestas: analizar el rendimiento en composite-seen (51,5%) y composite-unseen (28,1%) para investigar generalización a secuencias de subobjetivos no vistas durante el entrenamiento.
- Monitorización de progreso en ejecución: aprovechar la dimensión de progreso por paso para detectar estancamientos o fallos parciales durante la ejecución de un subobjetivo y disparar replanificación en System2.
- Ablaciones de prompting y E/S: el `config.json` incluido permite reproducir exactamente la configuración de prompt y entradas con la que se entrenó, facilitando experimentos controlados sobre el formato de condicionamiento.
- Base para ajuste fino en dominios robóticos propios: al estar en formato Orbax y sobre openpi, puede servir como punto de partida para reentrenamiento en otras tareas de manipulación, sujeto a los términos de licencia.

## Benchmarks y rendimiento

Resultados reportados en el protocolo del leaderboard RoboCasa365 (50 tareas x 50 ensayos), emparejado con `yinpei-tri-pi/robocasa-system2-qwen3vl-4b` y con todo el direccionamiento lingüístico activado:

| Benchmark | Resultado |
|---|---|
| RoboCasa365 global | 54,3% |
| Atomic-seen | 80,1% |
| Composite-seen | 51,5% |
| Composite-unseen | 28,1% |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje o código (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otras políticas en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos en Orbax; el consumo en memoria dependerá del backend JAX y del tamaño efectivo del modelo, no detallado.
- GPU recomendadas: no disponible. El modelo se sirve mediante el protocolo websocket de openpi sobre JAX, por lo que se requiere un entorno compatible con JAX y aceleración GPU, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servidor `system1/serve_system1.py` del repositorio de evaluación sys1_sys2, usando el protocolo websocket de openpi. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robocasa-system1-pi05-progact (este modelo) | no disponible | no disponible | 54,3% global en RoboCasa365 (con System2 qwen3vl-4b) | Gemma Terms of Use | HuggingFace, Orbax |
| robocasa-system2-qwen3vl-4b | no disponible (nombre sugiere 4B) | no disponible | componente de alto nivel del mismo sistema | no disponible | HuggingFace |
| Otras políticas pi0.5 / openpi | no disponible | no disponible | no disponible | Apache-2.0 (código) | openpi |

No se dispone de datos numéricos de alternativas comparables en las mismas condiciones de evaluación en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: es una política de control para RoboCasa; no es un modelo de propósito general y no debe esperarse de él generación de texto, código ni razonamiento lingüístico.
- Dependencia de System2: su rendimiento reportado (54,3%) se obtiene emparejado con `robocasa-system2-qwen3vl-4b` y con todo el direccionamiento lingüístico activado; sin ese componente o con otra configuración, los resultados no son extrapolables.
- Brecha de generalización: el 28,1% en composite-unseen frente al 80,1% en atomic-seen indica una caída acusada en tareas compuestas no vistas, un caveat importante para despliegues fuera de la distribución de entrenamiento.
- Licencia: los pesos derivan de PaliGemma y están sujetos a los Términos de Uso de Gemma, con restricciones que deben revisarse antes de cualquier uso comercial; el código openpi es Apache-2.0, pero la licencia de los pesos es distinta.
- Idiomas: no se documenta soporte multilingüe; las instrucciones se procesan a través del backbone PaliGemma y del condicionamiento de System2, sin garantías sobre idiomas distintos del usado en entrenamiento.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; en el contexto de políticas VLA, el riesgo se traduce en ejecución de acciones incorrectas o inconsistentes ante observaciones fuera de distribución.
- Reproducibilidad: requiere el `config.json` y `norm_stats.json` incluidos, así como el servidor del repositorio sys1_sys2; pequeñas desviaciones en el prompt o en la normalización pueden alterar el comportamiento.
- Madurez: 12 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente (creado en octubre de 2026), sin validación externa independiente más allá de los resultados declarados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinpei-tri-pi/robocasa-system1-pi05-progact
- Modelo System2 emparejado: https://huggingface.co/yinpei-tri-pi/robocasa-system2-qwen3vl-4b
- Términos de Uso de Gemma: https://ai.google.dev/gemma/terms
- openpi (código, Apache-2.0): no disponible en la información proporcionada
- Repositorio de evaluación sys1_sys2: no disponible en la información proporcionada
- Leaderboard RoboCasa365: no disponible en la información proporcionada
