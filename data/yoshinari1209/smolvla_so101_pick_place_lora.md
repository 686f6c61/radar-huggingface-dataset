# yoshinari1209/smolvla_so101_pick_place_lora

## Resumen

Este repositorio contiene un adaptador LoRA de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, fine-tuneado por yoshinari1209 para la tarea de pick-and-place de un dado en un robot SO-101. SmolVLA combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" para generar comandos de acción a partir de observaciones visuales y de estado, logrando un rendimiento competitivo con un coste computacional reducido que permite su despliegue en hardware de consumo.

El fine-tuning se ha realizado con el framework LeRobot sobre el modelo base `lerobot/smolvla_base`, utilizando un dataset propio de 48 episodios (23 440 frames a 30 FPS) que captura la tarea "Pick up the dice and place it in the tray". El adaptador se distribuye en formato safetensors bajo licencia Apache 2.0 y está pensado para ser ejecutado con las herramientas de inferencia de LeRobot (`lerobot-rollout`). Al tratarse de un LoRA, solo se actualizan las proyecciones y el action expert durante el entrenamiento, mientras que el codificador visual y el modelo de lenguaje permanecen congelados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (SigLIP + SmolLM2 + action expert) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA; el base SmolVLA tiene ~500M) |
| Parametros activos | no disponible (solo se entrenan ~50M del action expert y proyecciones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual SigLIP para procesar imagenes de camaras, un modelo de lenguaje SmolLM2 como "cerebro" de razonamiento y un action expert que proyecta las representaciones conjuntas en comandos de accion de 6 grados de libertad. El modelo base fue preentrenado por Hugging Face y publicado en el paper arxiv:2506.01844. En este repositorio, el adaptador LoRA se ha fine-tuneado sobre el base con el dataset `yoshinari1209/so101_pick_place_50eps_v1_20260817_192908`, que contiene 48 episodios de teleoperacion de un robot SO-101 con dos camaras (frontal y de muneca).

El entrenamiento se realizo con LeRobot 0.6.1 durante 10 000 pasos, con batch size de 64, optimizador AdamW, learning rate de 0.001 y semilla 1000. Durante el fine-tuning, el codificador visual (SigLIP) y el modelo de lenguaje (SmolLM2) permanecen congelados; solo se actualizan las proyecciones y el action expert, lo que reduce drasticamente el numero de parametros entrenables (~50M) y los requisitos de computo. El dataset se registro a 30 FPS con episodios de 10 segundos aproximadamente, cubriendo la tarea de recoger un dado de una posicion aleatoria y colocarlo en una bandeja.

## Capacidades

- Control robotico de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones de estado y dos camaras RGB.
- Ejecucion de la tarea especifica de pick-and-place de un dado en una bandeja, entrenada por imitacion.
- Generalizacion limitada a variaciones de la posicion del objeto dentro del espacio de trabajo visto durante el entrenamiento.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots SO-101.
- Soporte de inferencia en tiempo real a 30 FPS gracias al diseno compacto del modelo base.
- No soporta tool calling, agentes conversacionales ni capacidades de lenguaje general; es un modelo de politica robotica puro.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un robot SO-101 para recoger objetos pequeños (como dados) de posiciones variables y depositarlos en contenedores, util en lineas de montaje o pruebas de manipulacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos de fine-tuning con datasets propios, ya que el adaptador LoRA se puede cargar sobre el base SmolVLA y extender con nuevas demostraciones.
- Evaluacion de politicas roboticas en hardware de consumo: al ser un LoRA compacto, se puede ejecutar en GPUs de gama media (por ejemplo, RTX 3060 o superiores) sin necesidad de infraestructura de servidor, facilitando pruebas rapidas en laboratorios academicos.
- Benchmarking de metodos VLA: permite comparar el rendimiento de SmolVLA fine-tuneado con otras arquitecturas (como ACT) en la misma tarea y robot, como se documenta en el blog de ggando.com.
- Reproduccion de experimentos de manipulacion: el dataset y el adaptador estan publicados, lo que permite a otros investigadores reproducir los resultados y analizar el efecto de diferentes configuraciones de entrenamiento (pasos, batch size, etc.).
- Prototipado de soluciones roboticas para pymes: la licencia Apache 2.0 y el bajo coste computacional hacen viable integrar este modelo en sistemas de automatizacion sencillos sin grandes inversiones en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. Un fine-tuning similar sobre SO-101 (Sa74ll/smolvla_so101_pickandplace) reporta una tasa de exito del 87.66% mejorando desde 60.92% mediante una division de datos estratificada por posicion, pero esos datos pertenecen a otro repositorio y no se pueden atribuir a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador LoRA; el modelo base SmolVLA (~500M parametros) requiere aproximadamente 2-4 GB en FP16, y el LoRA anade una cantidad minima. Con cuantizacion a 8 bits podria caber en 2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia comoda (RTX 2060, RTX 3060, RTX 4060, etc.). Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4080, A4000).
- Si cabe en GPU de consumo: si, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), que gestiona la carga del modelo y la comunicacion con el robot SO-101. Tambien se puede usar la API de Python de LeRobot para integraciones personalizadas.
- Latencia y throughput: no disponibles, pero el modelo esta disenado para operar a 30 FPS en hardware consumer segun la documentacion de SmolVLA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoshinari1209/smolvla_so101_pick_place_lora | LoRA sobre ~500M | no disponible | sin evaluacion publicada | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | ~500M | no disponible | referencia para fine-tuning | Apache 2.0 | Hugging Face |
| Sa74ll/smolvla_so101_pickandplace | LoRA sobre ~500M | no disponible | 87.66% exito en pick-and-place | Apache 2.0 | Hugging Face |
| ACT (Action Chunking with Transformers) | ~80M | no disponible | variable segun tarea | MIT | GitHub |

SmolVLA se diferencia de ACT por su mayor capacidad (500M vs 80M) y su arquitectura de vision-lenguaje, pero requiere fine-tuning especifico por tarea. El adaptador LoRA de este repositorio es comparable a otros fine-tunings de SmolVLA para SO-101, aunque sin datos de evaluacion propios.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: la model card indica que no se han proporcionado metricas de exito, por lo que el rendimiento real en el robot es desconocido.
- Especializacion estrecha: el modelo solo ha sido entrenado para la tarea de recoger un dado y colocarlo en una bandeja; no generaliza a otros objetos, posiciones extremas o condiciones de iluminacion muy diferentes sin nuevo fine-tuning.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las 48 demostraciones; variaciones no cubiertas (objetos nuevos, fondos distintos) pueden provocar fallos.
- Riesgo de sobreajuste: con solo 48 episodios, existe riesgo de que el modelo memorice trayectorias especificas en lugar de aprender una politica robusta.
- Sesgos del dataset: las demostraciones fueron grabadas por un operador humano; cualquier sesgo en la forma de ejecutar la tarea (velocidad, trayectoria, agarre) se reflejara en la politica.
- Limitaciones de hardware: requiere un robot SO-101 con las camaras especificadas (frontal y muneca) y una configuracion de calibracion correcta; cambios en la disposicion de las camaras invalidan las observaciones.
- Licencia: aunque es Apache 2.0, el uso en produccion industrial debe verificar que el robot y el entorno cumplen con las normativas de seguridad aplicables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yoshinari1209/smolvla_so101_pick_place_lora
- Dataset de entrenamiento: https://huggingface.co/datasets/yoshinari1209/so101_pick_place_50eps_v1_20260817_192908
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/smolvla
- Guia de LeRobot para SO-101: https://github.com/AriRyo/lerobot-so101/blob/main/docs/source/smolvla.mdx
- Blog de fine-tuning SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio LeRobot: https://github.com/huggingface/lerobot
