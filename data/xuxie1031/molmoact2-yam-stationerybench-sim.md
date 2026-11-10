# xuxie1031/MolmoAct2-YAM-StationeryBench-Sim

## Resumen

MolmoAct2-YAM-StationeryBench-Sim es un ajuste fino (fine-tune) del modelo de robotica allenai/MolmoAct2-BimanualYAM, publicado por el usuario xuxie1031 como parte de una "Gyre pilot release". El modelo parte del checkpoint base de Ai2 y se especializa en dos tareas bimanuales de manipulacion de objetos de papelería definidas en el benchmark StationeryBench de Robocurve: extraer una goma de borrar de una caja (eraser_from_box) y pasar una regla de una mano a otra (ruler_handover). El base model obtiene un 0% de exito en ambas tareas en modo zero-shot; este fine-tune eleva la tasa de exito al 36% y al 76% respectivamente, siempre en un entorno de simulacion fisica replica de las tareas, no en el robot real.

Arquitectura de tipo vision-language-action (VLA) derivada de MolmoAct2, que a su vez se construye sobre Molmo2, Qwen3 y SigLIP. El checkpoint tiene 5.442.196.208 parametros totales (unos 5.440 millones) y un repositorio de 21,8 GB en formato safetensors. Se distribuye bajo licencia Apache-2.0 y esta pensado para el pipeline de robotica de transformers, con codigo personalizado (custom_code) para la carga y el servidor de inferencia.

Su relevancia es acotada pero clara: demuestra que el ajuste fino con datos sinteticos generados en simulacion, combinado con datos reales publicos de YAM, puede llevar a un modelo VLA de un 0% a tasas de exito no triviales en tareas bimanuales de contacto fisico, con un coste de unas 263 GPU-horas de L40S (equivalentes aproximados a 66-105 H100-horas). Es material de investigacion reproducible, no un modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de MolmoAct2 (Molmo2 / Qwen3 / SigLIP) |
| Parametros totales | 5.442.196.208 (~5,44 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no orientado a texto multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code en transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base MolmoAct2-BimanualYAM, un VLA que combina un codificador visual (SigLIP), un modelo de lenguaje (Qwen3) y un "action expert" que produce acciones motoras. El fine-tune mantiene exactamente los mismos ficheros, arquitectura, procesador y `norm_stats.json` que el base, por lo que se carga igual que MolmoAct2-BimanualYAM. La novedad esta en los pesos: se entreno en 13 rondas, las 10 primeras solo sobre el action expert y las 3 ultimas anadiendo LoRA de vision y LoRA del LLM (r = 64) mas el action expert, con planificador WSD y EMA 0.999. El checkpoint publicado es la EMA de la ultima ronda con los adaptadores LoRA fusionados.

Los datos de entrenamiento son demostraciones sinteticas generadas en una replica de simulacion de las dos tareas, renderizadas con el aspecto `nominal2` (iluminacion y materiales alineados con las camaras reales del YAM de Ai2) y con domain randomization, co-entrenadas con los datos reales publicos de YAM de Ai2. Los datasets sinteticos de ambas tareas estan publicados. Una tercera tarea de StationeryBench (middle_sticky_pad) se co-entreno en todas las rondas pero no forma parte de esta release. El autor advierte de que la mezcla realmente muestreada difirio de la configurada por un efecto de ponderacion del data loader, aunque la receta publicada reproduce lo ejecutado. El coste total fue de unas 263 GPU-horas de L40S.

## Capacidades

- Control bimanual de robot: genera acciones conjuntas para dos brazos YAM en tareas de manipulacion de objetos de papelería.
- Tarea eraser_from_box: extraccion de una goma de borrar de una caja con tapa de retorno por muelle, en episodios de 120 s.
- Tarea ruler_handover: transferencia de una regla de una mano a otra, en episodios de 66,7 s.
- Entrada imagen-texto-a-accion: consume observaciones visuales y consignas de tarea, y emite acciones motoras.
- Inferencia estocastica: el muestreo de la politica es estocastico, de modo que las repeticiones reproducen los resultados estadisticamente, no episodio a episodio.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni thinking mode; es un modelo de robotica especializado, no un asistente de proposito general.

## Casos de uso

- Investigacion en manipulacion bimanual: usar el modelo como referencia reproducible para estudiar como el fine-tune sintetico mejora tareas de contacto fisico, partiendo de un base con 0% de exito.
- Generacion de datos sinteticos y evaluacion: el repositorio incluye entornos, evaluacion, generacion de datos y receta de entrenamiento, lo que permite reutilizar el pipeline para nuevas tareas de StationeryBench.
- Benchmarking de VLA: comparar el rendimiento de politicas VLA sobre las mismas semillas selladas (3000000-3000049) y el mismo rubric de cuatro etapas.
- Transferencia sim-a-real como linea de investigacion: el modelo sirve para disenar y validar recetas de domain randomization y co-entrenamiento con datos reales antes de probar en hardware.
- Estudio de ajuste eficiente: el uso de LoRA (r = 64) sobre vision y LLM mas action expert es un caso concreto para analizar coste y rendimiento en adaptacion de VLA.
- Reproduccion de resultados: mediante `scripts/repro_check.sh` se puede verificar el checkpoint en la replica de simulacion, util para auditoria de publicaciones.
- No se recomienda su uso directo en produccion sobre un robot real sin validacion previa, dado que solo se ha evaluado en simulacion.

## Benchmarks y rendimiento

Resultados en simulacion, 50 episodios por tarea sobre semillas selladas (3000000-3000049), aspecto `nominal2`, duracion completa, exito binario segun la etapa 4 del rubric de StationeryBench. Intervalos de confianza de Wilson al 95%.

| Modelo | eraser_from_box | ruler_handover |
|---|---|---|
| MolmoAct2-BimanualYAM (base, zero-shot) | 0/50 (0% [0-7%]) | 0/50 (0% [0-7%]) |
| MolmoAct2-YAM-StationeryBench-Sim | 18/50 (36% [24-50%]) | 38/50 (76% [63-86%]) |

Comparacion pareada sobre las mismas semillas: +18/-0 y +38/-0 (McNemar exacto, p < 1e-5). El resultado del base reproduce el hallazgo en robot real de Robocurve para MolmoAct2 zero-shot (0/20 en ambas tareas). Todos los resultados son en simulacion, sobre una replica no oficial, no en el robot de Robocurve.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5,44 mil millones de parametros, en fp16 el peso ronda los 11 GB, mas el codificador visual y el action expert, por lo que se requiere una GPU con margen amplio.
- GPU recomendadas: el autor entreno en NVIDIA L40S; el base y el ecosistema MolmoAct2 se asocian a H100 en la documentacion de Ai2.
- GPU de consumo: no confirmado por el autor; por tamano de parametros podria caber en GPUs de 24 GB o mas en precision reducida, pero no hay datos publicados de latencia ni de funcionamiento en consumer.
- Despliegue: transformers con custom_code; el repositorio proporciona un servidor de politica (`eval/host_server_yam_noclip.py`, `scripts/serve.sh`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.
- Nota critica de inferencia: las acciones deben des-normalizarse sin recorte a [-1, 1]; el servidor estandar recorta y degrada este modelo, por lo que hay que usar el servidor del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento StationeryBench (sim) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolmoAct2-YAM-StationeryBench-Sim | 5,44 mil millones | no disponible | 36% eraser / 76% ruler | Apache-2.0 | Hugging Face |
| MolmoAct2-BimanualYAM (base) | no disponible en la informacion | no disponible | 0% / 0% zero-shot | Apache-2.0 | Hugging Face (Ai2) |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulacion: no se ha probado en un robot real y las tasas de exito sim y real no son intercambiables.
- Alcance muy reducido: dos tareas, una escena fija cada una (como en StationeryBench), con poses de objetos aleatorizadas.
- Estocasticidad: las repeticiones reproducen los numeros estadisticamente, no episodio a episodio.
- Reproducibilidad del entrenamiento: la mezcla de datos realmente muestreada difirio de la configurada por un efecto de ponderacion del data loader.
- Inferencia delicada: requiere des-normalizar sin recorte; el servidor estandar degrada el modelo.
- Riesgo de alucinacion y sesgos: no documentados especificamente, pero al ser un modelo de accion cualquier comportamiento erroneo se traduce en acciones fisicas potencialmente peligrosas.
- Uso en produccion: las acciones de cualquier modelo deben validarse antes de ejecutarse en hardware; seguir las Responsible Use Guidelines de Ai2 y las notas de seguridad del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de MolmoAct2-BimanualYAM (tambien Apache-2.0, de Ai2, construido sobre Molmo2 / Qwen3 / SigLIP); conviene revisar las condiciones de esos componentes.
- No afiliado ni respaldado por Robocurve ni por Ai2; los resultados son de una replica no oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xuxie1031/MolmoAct2-YAM-StationeryBench-Sim
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Codigo, entornos, evaluacion y receta: https://github.com/xuxie1031-droid/stationerybench-sim
- Documentacion de computo: https://github.com/xuxie1031-droid/stationerybench-sim/blob/main/docs/COMPUTE.md
- Documentacion de entrenamiento: https://github.com/xuxie1031-droid/stationerybench-sim/blob/main/docs/TRAINING.md
- StationeryBench (Robocurve): https://robocurve.github.io/stationerybench
- Resultado de Robocurve sobre MolmoAct2 zero-shot: https://openai.robocurve.org/stationerybench/
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Dataset eraser: https://huggingface.co/datasets/xuxie1031/stationerybench-sim-eraser
- Dataset ruler: https://huggingface.co/datasets/xuxie1031/stationerybench-sim-ruler
