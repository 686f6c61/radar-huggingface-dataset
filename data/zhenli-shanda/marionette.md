# zhenli-shanda/Marionette

## Resumen

Marionette es un modelo de mundo interactivo para videojuegos desarrollado por AlayaLab (repositorio publicado bajo el identificador `zhenli-shanda`), presentado en el artículo arXiv:2608.14530 con el título "Predicting World States, Rendering Geometry, Painting Appearance". No es un modelo de lenguaje ni un generador de video convencional: es un sistema de tres etapas que predice el estado de un mundo de juego, lo traduce a una señal de control de pose y renderiza la observación RGB correspondiente. Resuelve el problema de generar rollouts de video consistentes y controlables a partir de una pose semilla y una acción, algo relevante para investigación en world models, simulación y generación de video condicionada por control.

La arquitectura se factoriza en tres etapas: una etapa de dinámica (ActionGPT de 61 MB y PoseGPT de 402 MB) que predice el siguiente estado articulado de 276 dimensiones y el siguiente token de acción; un puente determinista sin parámetros que convierte ese estado en una señal de control de pose; y una etapa de observación que es un transformer de difusión de video condicionado por control, afinado desde Wan2.2-Fun-5B-Control, con pesos de 10,0 GB. Solo la primera y la tercera etapa tienen pesos propios; la segunda es geometría fija.

El modelo es un artefacto de investigación con alcance deliberadamente estrecho: la dinámica cubre una única especie de monstruo y el renderizado está entrenado sobre un corpus específico (WildWorld). Su licencia es de solo uso en investigación no comercial, heredada del corpus de entrenamiento, lo que condiciona por completo su aplicabilidad en producción. Es relevante ahora como referencia metodológica para quien investigue world models factorizados con control de pose y renderizado por difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de tres etapas: dinámica autorregresiva (ActionGPT + PoseGPT), puente geométrico determinista sin parámetros y difusión de video transformer condicionada por control (etapa de observación) |
| Parametros totales | No disponible (los pesos se publican por etapa: observación 10,0 GB, PoseGPT 402 MB, ActionGPT 61 MB; no se indica el número de parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (rollout por fragmentos de 81 frames con relay de chunk) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el prompt de texto se procesa con el codificador umT5-xxl del modelo base; el modelo card no declara idiomas) |
| Licencia | `marionette-research-only` (solo investigación no comercial; el código es Apache-2.0 pero vive en el repositorio de GitHub, no en el repo de pesos) |
| Formato de pesos | safetensors (etapa de observación), `.pt` (PoseGPT y ActionGPT) |

## Arquitectura y entrenamiento

Marionette factoriza el world model en tres etapas encadenadas. La primera, de dinámica, es autorregresiva y opera sobre un estado articulado de 276 dimensiones a 20 fps, condicionada por un campo de altura de terreno escaneado: ActionGPT predice el siguiente token de acción y PoseGPT el siguiente estado articulado. Los vocabularios de acción son de 168 tokens para el monstruo y 977 para el cazador, y están construidos a partir del corpus de entrenamiento, por lo que los identificadores de acción no son portables entre checkpoints. La segunda etapa es un puente determinista sin parámetros que traduce el estado de 276 dimensiones a una señal de control de pose. La tercera, de observación, es un transformer de difusión de video condicionado por control, afinado desde `alibaba-pai/Wan2.2-Fun-5B-Control` en modo `control_ref` con el primer frame como referencia de apariencia, a resolución 704×1280 y con 16×H200 en FSDP.

El entrenamiento de la etapa de observación se realizó sobre el corpus WildWorld; el checkpoint publicado corresponde al paso 17000, de los cuales los últimos 2000 usan una ruta de captura revisada en la que los objetos ausentes de la señal de control de pose también están ausentes del RGB, lo que elimina una clase de objetivos que el modelo no podía predecir. Las etapas iniciales abarcan 26 especies de monstruos, pero el segmento final se restringe a una única configuración (una etapa, un monstruo, una clase de arma), de modo que el checkpoint es más fuerte en ese dominio concreto. La etapa de dinámica se entrenó sobre una única especie de monstruo (em19) con 2241 segmentos. El prompt forma parte del checkpoint: el modelo de observación se entrenó con leyendas que incluyen un identificador explícito de apariencia, y emparejarlo con un formato de leyenda antiguo saca al codificador de texto de distribución y hace desaparecer a los monstruos del rollout.

## Capacidades

- Predicción de estados de mundo de un videojuego: genera el siguiente estado articulado de 276 dimensiones a partir de una pose semilla y una acción.
- Predicción de tokens de acción con ActionGPT, con vocabularios separados para monstruo (168) y cazador (977).
- Renderizado de video condicionado por control de pose mediante difusión de video, con referencia de apariencia en el primer frame.
- Generación de video a 704×1280, 40 pasos de muestreo, guidance 6.0, fragmentos de 81 frames y 30 fps.
- Rollout autorregresivo por relay de chunk: cada fragmento de 81 frames se condiciona en el último frame del anterior.
- Condicionamiento por campo de altura de terreno escaneado para etapas específicas.
- Reproducibilidad determinista con semilla fijada (`TORCH_SEED=43`), que permite reproducir el video de pose byte a byte y el rollout RGB píxel a píxel.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en world models: el sistema permite estudiar la factorización entre dinámica, geometría y apariencia, aislando cada etapa y midiendo cómo los errores de la etapa de dinámica se propagan al renderizado.
- Generación de video condicionada por control de pose: la etapa de observación puede emplearse para sintetizar observaciones RGB a partir de una señal de pose, útil en experimentos de control de movimiento en video.
- Reproducción de experimentos académicos: con la semilla fijada y los scripts del repositorio, un grupo puede reproducir exactamente los resultados publicados, algo poco habitual en modelos de video generativo.
- Estudio de la degradación de apariencia en rollouts largos: el esquema de relay de chunk permite medir cómo se acumula el error de apariencia con el horizonte, un problema central en la generación autorregresiva de video.
- Prototipado de simuladores de juego restringidos: para una única etapa, un único monstruo y una única clase de arma, el pipeline completo puede generar rollouts coherentes con el terreno escaneado, como banco de pruebas de mecánicas.
- Docencia y divulgación: el desglose en tres etapas con solo dos de ellas parametrizadas facilita explicar la diferencia entre predecir un estado, derivar una señal de control y renderizar apariencia.
- Evaluación de métodos de control en difusión de video: sirve como línea base afinada desde Wan2.2-Fun-5B-Control para comparar estrategias de condicionamiento por pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint de observación ocupa 10,0 GB en safetensors; el modelo base `alibaba-pai/Wan2.2-Fun-5B-Control` añade aproximadamente 23 GB, que deben descargarse por separado.
- PoseGPT ocupa 402 MB y ActionGPT 61 MB, ambos en formato `.pt`.
- El entrenamiento se realizó con 16×H200 en FSDP; no se especifica el hardware de inferencia recomendado.
- No se indica la VRAM mínima ni si el pipeline completo cabe en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue: el pipeline se ejecuta mediante los scripts del repositorio de GitHub (`fetch_weights.sh`, `fetch_base_model.sh`, `run_demo.sh`, `run_stage1_render.sh`), no mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los ajustes de inferencia publicados son 704×1280, 40 pasos, guidance 6.0, fragmentos de 81 frames y 30 fps.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marionette | World model factorizado con difusión de video condicionada por pose | No disponible (pesos: 10,0 GB + 402 MB + 61 MB) | Fragmentos de 81 frames con relay | Research-only, no comercial | Pesos en Hugging Face, código en GitHub |
| Wan2.2-Fun-5B-Control | Difusión de video condicionada por control (modelo base) | 5B (según el nombre del modelo) | No disponible | Apache-2.0 | Público en Hugging Face |
| Otros world models de videojuegos | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia documentado es Wan2.2-Fun-5B-Control, del que Marionette es un afinamiento y del que hereda el VAE y el codificador de texto umT5-xxl.

## Limitaciones y advertencias

- La licencia de los pesos es de solo uso en investigación no comercial (`marionette-research-only`), heredada del corpus WildWorld; el uso comercial y la redistribución están prohibidos.
- El modelo de dinámica cubre una única especie de monstruo (em19); no es un modelo general de movimiento de personajes.
- El rollout es por relay de chunk: cada fragmento de 81 frames se condiciona en el último frame del anterior, por lo que el error de apariencia se acumula con el horizonte.
- El puente consume un campo de altura de terreno escaneado para etapas específicas; geometría nueva requiere un escaneo nuevo.
- El prompt forma parte del checkpoint: usar un formato de leyenda antiguo o emparejar checkpoints de distintas versiones saca al codificador de texto de distribución y hace desaparecer a los monstruos del rollout.
- Los identificadores de acción son índices en el vocabulario de este checkpoint y no son portables; el mismo entero bajo otro corpus corresponde a otra animación o a nada.
- La etapa de dinámica es estocástica y solo es reproducible con semilla fijada (`TORCH_SEED=43`).
- El modelo es un artefacto de investigación, no un producto, un juego ni un renderizador general.
- El repositorio de pesos no incluye el modelo base, los seeds, el terreno escaneado ni la referencia de apariencia; hay que descargarlos del repositorio de código o de terceros.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/zhenli-shanda/Marionette
- Artículo: https://arxiv.org/abs/2608.14530
- Repositorio de código: https://github.com/AlayaLab/Marionette
- Página del proyecto: https://alayalab.github.io/Marionette/
- Vídeo de presentación: https://youtu.be/bLLtwXVcqEc
- Licencia de los pesos: https://github.com/AlayaLab/Marionette/blob/main/LICENSE.assets
- Modelo base: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
