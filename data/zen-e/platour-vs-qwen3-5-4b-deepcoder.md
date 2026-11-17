# zen-E/PLatour-VS-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-VS-Qwen3.5-4B-DeepCoder es un checkpoint experimental publicado por el usuario zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos conocida como PACT (Prefill-to-Autoregressive Cross-model Transfer). La idea central es que un modelo emisor de mayor tamano procesa el prompt y entrega representaciones ocultas, mientras que un modelo receptor mas pequeno genera la respuesta de forma independiente. En este checkpoint concreto, el emisor es virtual: no se necesita un modelo externo, sino que las proyecciones puente y las caracteristicas ocultas aprendidas se incluyen en los pesos liberados.

El modelo se construye sobre Qwen/Qwen3.5-4B como receptor y se especializa en la tarea "deepcoder", orientada a generacion de codigo. El entrenamiento se realiza mediante puentes lineales ligeros entre backbones congelados, optimizados con recompensas de tarea y partiendo de proyecciones inicializadas a cero. El checkpoint incluye las proyecciones puente, las caracteristicas ocultas virtuales y los IDs de tokens de la plantilla fija, con un peso de repositorio de unos 0,9 GB.

Su relevancia es fundamentalmente de investigacion: permite reproducir el experimento 28 del paper asociado (arXiv:2611.06976) sin disponer de un emisor externo, y evaluar si las mejoras provienen de informacion util transferida o de la mera adaptacion del receptor. No es un modelo de proposito general: exige una plantilla fija y no admite mensajes de chat arbitrarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre Qwen/Qwen3.5-4B (receptor) con puentes lineales PACT y emisor virtual |
| Parametros totales | no disponible (el receptor base Qwen3.5-4B tiene 4B; el checkpoint liberado pesa 0,9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con loader personalizado, custom-loader) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma PACT: un emisor (aqui virtual) aporta representaciones ocultas que un receptor mas pequeno consume para generar la respuesta de forma autoregresiva e independiente. Tecnicamente se entrenan puentes lineales ligeros entre backbones congelados, con proyecciones inicializadas a cero y optimizadas mediante recompensas de tarea. El diseno soporta modelos con atencion hibrida. El checkpoint incluye las proyecciones puente, las caracteristicas ocultas virtuales y los IDs de tokens de la plantilla, de modo que no se requiere un modelo emisor externo en inferencia.

El paper introduce ademas PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen de informacion util del emisor o si pueden surgir simplemente por adaptacion del receptor. El entrenamiento se realizo sobre el dataset zen-E/PLatour-DeepCoder-Data y la evaluacion por defecto cubre LCB v6, HumanEval y MBPP. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo RLHF o DPO mas alla del uso de recompensas de tarea.

## Capacidades

- Generacion de codigo especializada en la tarea deepcoder (resolucion de problemas de programacion).
- Generacion autoregresiva de texto a partir de representaciones ocultas transferidas por un emisor virtual.
- Soporte de atencion hibrida en el backbone receptor.
- Inferencia con backend vLLM (segun el ejemplo de la model card).
- Evaluacion reproducible con judge de codigo en contenedores Docker aislados.
- No soporta mensajes de chat arbitrarios: requiere una plantilla fija con su span de pregunta reemplazable.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de experimentos PACT: ejecutar el experimento 28 del paper con `platour-exps evaluate` para validar los resultados publicados sobre LCB v6, HumanEval y MBPP sin necesidad de un emisor externo.
- Investigacion sobre transferencia entre modelos: comparar el rendimiento del receptor con los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication) para determinar si la mejora proviene de informacion util o de adaptacion del receptor.
- Generacion de codigo en entornos controlados: usar la API `load_session` con `method="virtual_sender"` y `task="deepcoder"` para producir soluciones a problemas de programacion con prompts adaptados a la plantilla liberada.
- Evaluacion automatizada de codigo: integrar el judge de codigo basado en Docker para puntuar programas generados de forma aislada y segura.
- Estudio de eficiencia de emisores virtuales: analizar el coste y el rendimiento de sustituir un emisor real por caracteristicas ocultas aprendidas en tareas de codigo.
- Base para experimentos de destilacion o transferencia: partir de las proyecciones puente liberadas para explorar variantes del metodo sobre otros backbones o tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (LCB v6, HumanEval y MBPP con judge en Docker) pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el receptor Qwen3.5-4B requiere memoria acorde a un modelo de 4B parametros, y el checkpoint adicional pesa 0,9 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; el proyecto requiere Linux con CUDA y memoria GPU suficiente para los modelos seleccionados.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: backend vLLM mediante la API `platour_api.load_session`; el proyecto incluye scripts de instalacion (`scripts/install_environment.py`) y un loader personalizado que verifica configuracion y hashes de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-VS-Qwen3.5-4B-DeepCoder | receptor 4B + puentes | no disponible | Codigo (deepcoder) con emisor virtual | apache-2.0 | Hugging Face (71 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Proposito general | no disponible | Hugging Face |
| Otros checkpoints PLatour | no disponible | no disponible | Varias tareas/experimentos | apache-2.0 | Coleccion zen-E/platour |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No admite mensajes de chat arbitrarios: exige una plantilla fija y solo permite reemplazar el span de pregunta.
- El ejemplo de prompt personalizado de la model card no constituye el protocolo de benchmark publicado; los resultados deben reportarse distinguiendo entre prompts LCB originales y prompts adaptados a plantilla de HumanEval/MBPP.
- La generacion devuelve texto y no ejecuta el codigo generado; la evaluacion requiere un judge externo en contenedores Docker.
- El modelo es un checkpoint de investigacion (experimento 28), no un modelo de produccion de proposito general.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; la especializacion en codigo no garantiza buen rendimiento en lenguaje natural multilingue.
- Licencia apache-2.0 permite uso comercial, pero las limitaciones tecnicas (plantilla fija, dependencia del proyecto PLatour) restringen su aplicacion practica.
- Requiere el entorno del proyecto PLatour (Linux, CUDA, Python 3.11) y un loader personalizado que verifica hashes; no es un checkpoint cargable directamente con `transformers` estandar.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-VS-Qwen3.5-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
