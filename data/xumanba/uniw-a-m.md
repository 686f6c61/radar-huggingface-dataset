# xumanba/UniW-A-M

## Resumen

UniW(A)M es un framework de modelos de mundo y modelos mundo-accion (world-action models) para robotica, construido sobre Diffusion Transformers (DiT) con una arquitectura de mezcla de expertos (MoE). Lo desarrolla el autor identificado como xumanba, junto con un equipo de coautores citados en el paper (Xu, Fang, Li, Song, Wang, Liu, Zhang, Su, Tang, Gao, Wu y Li). El modelo unifica en un unico backbone cinco modos de operacion: modelado de mundo condicionado por accion (AC-WM) y cuatro interfaces de world-action model (Joint-WAM, IDM-WAM, Action-Centric y Action-Only).

La propuesta tecnica clave es la reutilizacion de expertos atomicos de capacidad (VGM, VLA, WM e IDM) entre interfaces distintas, con expertos compartidos que capturan dinamicas comunes, mas un enrutador de interfaz adaptativo enchufable (PAIR) que selecciona la interfaz adecuada para cada chunk de acciones con el backbone congelado. El repositorio publica checkpoints para inicializacion, para despliegue real en robot dual-arm AgileX (tarea de plegar ropa) y para evaluacion en simulacion en los benchmarks LIBERO y RoboTwin 2.0.

El modelo es relevante ahora porque aborda la fragmentacion existente entre los distintos paradigmas de world-action models, permitiendo entrenar una sola base y adaptar la interfaz de salida sin reentrenar el backbone completo. El repositorio ocupa 78,8 GB y distribuye los pesos en carpetas separadas por caso de uso (pretrained ~31 GB, folding_clothes ~44 GB, libero y robotwin2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con mezcla de expertos (MoE); cada FFN replicado en 5 expertos con router inicializado a cero |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE, pero el numero de expertos activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje natural declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La arquitectura se basa en un Diffusion Transformer en el que cada capa feed-forward se copia en cinco expertos y se anade un router inicializado a cero, formando un backbone MoE. Sobre esa base se definen expertos compartidos (que capturan la dinamica comun a todas las tareas) y expertos atomicos de capacidad: VGM, VLA, WM e IDM, reutilizados a traves de las distintas interfaces. Un componente adicional, el adaptive interface router (PAIR), actua como modulo enchufable que, con el backbone congelado, decide que interfaz (Joint-WAM, IDM-WAM, Action-Centric o Action-Only) aplicar a cada chunk de acciones.

El entrenamiento se organiza por etapas y por caso de uso: existe un checkpoint de inicializacion (`pretrained/`) pensado como punto de partida para nuevas tareas, y checkpoints especificos entrenados para plegar ropa con brazos duales AgileX (150k pasos), para LIBERO (variantes Spatial, Object, Goal y Long) y para RoboTwin 2.0. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO; esos datos deben consultarse en el paper arXiv 2610.18697.

## Capacidades

- Modelado de mundo condicionado por accion (AC-WM): predice la evolucion del entorno dada una secuencia de acciones.
- Generacion de acciones para manipulacion robotica mediante cuatro interfaces de world-action model (Joint-WAM, IDM-WAM, Action-Centric y Action-Only).
- Enrutamiento adaptativo de interfaz por chunk de acciones mediante PAIR, sin necesidad de ajustar el backbone.
- Reutilizacion de capacidades atomicas (VGM, VLA, WM, IDM) entre interfaces dentro de un mismo backbone MoE.
- Despliegue en robot real de doble brazo (AgileX) para tareas de manipulacion como plegar ropa.
- Evaluacion en entornos simulados estandarizados de manipulacion (LIBERO y RoboTwin 2.0).
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes conversacionales ni multilingueismo; el alcance es exclusivamente robotico.

## Casos de uso

- Manipulacion robotica en robot real: el checkpoint `folding_clothes/` esta entrenado durante 150k pasos para plegar ropa con brazos duales AgileX, por lo que puede desplegarse directamente para esa tarea y servir de base para ajustes finos en tareas similares.
- Evaluacion comparativa en simulacion: los checkpoints `libero/` (Spatial, Object, Goal, Long) permiten reproducir experimentos en el benchmark LIBERO y comparar variantes de interfaz bajo las mismas condiciones.
- Benchmarking en RoboTwin 2.0: el checkpoint dedicado facilita medir rendimiento en tareas de manipulacion bimanual simuladas y contrastar con otros world-action models.
- Investigacion en world models: el checkpoint `pretrained/` (~31 GB) sirve como inicializacion para entrenar el modelo en nuevos dominios sin partir de cero, aprovechando los expertos compartidos y atomicos.
- Seleccion dinamica de interfaz en produccion: gracias a PAIR, un mismo backbone congelado puede alternar entre las cuatro interfaces segun el chunk de acciones, lo que simplifica el despliegue de un unico modelo para varias modalidades de control.
- Prediccion de dinamica para planificacion: el modo AC-WM permite simular el efecto de acciones candidatas antes de ejecutarlas, util para planificacion basada en modelo en entornos controlados.
- Prototipado de politicas de imitacion: las interfaces IDM-WAM y Action-Centric facilitan experimentar con aprendizaje por imitacion y modelos inversos de dinamica sobre una base comun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluacion en LIBERO (Spatial, Object, Goal, Long) y RoboTwin 2.0, pero no incluye cifras numericas; estas deben consultarse en el paper arXiv 2610.18697.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, el checkpoint `pretrained/` ocupa ~31 GB y el de `folding_clothes/` ~44 GB en safetensors; la inferencia en precision completa requiere al menos VRAM equivalente al peso del checkpoint mas activaciones, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizacion o tecnicas de offload.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de los pesos, el despliegue realista apunta a GPUs de datacenter (A100, H100 o similares con 40-80 GB) o a configuraciones multi-GPU.
- GPU de consumo: no se confirma viabilidad en RTX 4090 (24 GB) ni en otras consumer GPUs; requeriria cuantizacion no documentada.
- Opciones de despliegue: la libreria declarada es diffusers; los scripts de entrenamiento, inferencia y evaluacion estan en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniW(A)M | no disponible (MoE DiT) | no disponible | World model y world-action model unificados en MoE | Apache 2.0 | Pesos en Hugging Face, codigo en GitHub |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento) para establecer una comparativa rigurosa con alternativas de world-action models.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al tratarse de un modelo entrenado sobre datos de robotica concreta (plegar ropa, LIBERO, RoboTwin 2.0), es probable que su comportamiento este fuertemente ligado a la distribucion de esas tareas y entornos.
- Riesgo de alucinacion: en modelos de mundo, el riesgo se traduce en predicciones de dinamica fisicamente inconsistentes; no hay evaluacion publicada en la informacion disponible.
- Limitaciones de contexto o idioma: no se declara ventana de contexto ni soporte multilingue; el modelo no esta orientado a tareas de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets subyacentes (LIBERO, RoboTwin 2.0, datos reales de AgileX) y de las dependencias del codigo.
- Caveats para produccion: el modelo esta en fase inicial (0 descargas, 0 likes, creado y actualizado el 18 de noviembre de 2026), sin resultados de benchmarks publicados en la model card; el despliegue en robot real exige calibracion del hardware AgileX y validacion de seguridad antes de operar en entornos no controlados.
- El repositorio es grande (78,8 GB); la descarga debe hacerse por patrones (`allow_patterns`) para evitar bajar checkpoints innecesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xumanba/UniW-A-M
- Paper (arXiv 2610.18697): https://arxiv.org/abs/2610.18697
- Project page: https://xumanba.github.io/UniW-A-M/
- Codigo (GitHub): https://github.com/xumanba/UniW-A-M
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
