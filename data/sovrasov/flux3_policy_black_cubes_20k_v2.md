# sovrasov/flux3_policy_black_cubes_20k_v2

## Resumen

`flux3_policy_black_cubes_20k_v2` es una politica robotica de imitacion publicada por el usuario sovrasov en Hugging Face, entrenada sobre la libreria LeRobot y distribuida con licencia Apache 2.0. Se trata de un ajuste fino de FLUX 3 Action (`flux3`), el modelo de video-accion de Black Forest Labs: el tronco de video FLUX.3 incorpora una modalidad de accion que se desruidifica de forma conjunta con los siguientes fotogramas de video, y se ajusta por embodiment con cabezas de accion nuevas. El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors.

La politica resuelve una tarea concreta de manipulacion: "pick a black cube and move it to the cardboard bin" (coger un cubo negro y llevarlo a la caja de carton). Consume dos imagenes de 256x256 pixeles (vista de escena y vista de muneca) mas un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. Esta pensada para el tipo de robot `PhysicalAIRobot` y para las claves de observacion `observation.images.scene` y `observation.images.wrist`.

Su relevancia es doble: por un lado ilustra como los modelos generativos multimodales de gran escala (FLUX 3, presentado por Black Forest Labs en julio de 2026 con soporte de imagen, video, audio y prediccion de acciones) se trasladan al terreno de la robotica fisica mediante LeRobot; por otro, es un ejemplo reproducible de ajuste fino por embodiment con un presupuesto de entrenamiento pequeno (20.000 pasos, batch de 2) sobre un dataset de solo 63 episodios. No se han publicado parametros totales, longitud de contexto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de video-accion FLUX 3 Action (`flux3`): tronco de video FLUX.3 con modalidad de accion desruidificada conjuntamente con los siguientes fotogramas, mas cabezas de accion ajustadas por embodiment |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como modelo MoE en la informacion disponible) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada se limita a observaciones visuales y de estado) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (politica robotica de accion; el unico texto es la cadena de tarea pasada a `lerobot-rollout`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,5 GB) |
| Tipo de robot | `PhysicalAIRobot` |
| Camaras / entradas visuales | `observation.images.scene` (3, 256, 256) y `observation.images.wrist` (3, 256, 256) |
| Entrada de estado | `observation.state` (6,) |
| Salida | `action` (6,) |
| Dataset de entrenamiento | `sovrasov/pick-black-cubes-room-2` (63 episodios, 24.859 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es FLUX 3 Action de Black Forest Labs. Segun la model card, se trata del tronco de video FLUX.3 con una modalidad de accion que se desruidifica de forma conjunta con los siguientes fotogramas de video; despues se ajusta por embodiment con cabezas de accion nuevas. Esto situa al modelo en la familia de las politicas generativas de video-accion (prediccion del futuro visual y de la accion en un mismo proceso de desruidificado), en contraste con las politicas clasicas de imitacion que mapean observacion a accion de forma directa. La informacion disponible no detalla el numero de parametros, la composicion del dataset de preentrenamiento del tronco ni si se aplicaron etapas de RLHF o DPO.

El ajuste fino de esta politica concreta se hizo con LeRobot 0.6.2 durante 20.000 pasos, con tamano de lote 2, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42. El dataset de entrenamiento contiene 63 episodios y 24.859 fotogramas a 30 FPS de una unica tarea, "pick a black cube and move it to the cardboard bin". No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni aumento de datos.

## Capacidades

- Generacion de acciones de 6 dimensiones a partir de dos vistas de camara de 256x256 pixeles y un vector de estado de 6 dimensiones.
- Manipulacion robotica de tipo pick-and-place sobre un objeto concreto (cubo negro) y un destino concreto (caja de carton), en el entorno del dataset de entrenamiento.
- Percepcion visual multi-camara: una vista de escena (`observation.images.scene`) y una vista de muneca (`observation.images.wrist`), lo que permite combinar contexto global y vision proximal de la pinza.
- Integracion nativa con el ecosistema LeRobot: inferencia con `lerobot-rollout` y reentrenamiento con `lerobot-train` mediante `--policy.type=flux3`.
- Capacidad de servir como base para ajuste por embodiment: el flujo de `flux3` preve cabezas de accion nuevas por robot, por lo que el mismo tronco puede reutilizarse en otras plataformas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingues ni de generacion de texto.
- No se documentan modos especiales (thinking mode, audio, vision generativa como salida) en esta politica, aunque el modelo base FLUX 3 los cubre.

## Casos de uso

- Recogida automatizada de objetos en laboratorio: la politica ejecuta la secuencia de aproximacion, agarre y deposito en la caja de carton usando las dos vistas de camara, lo que la hace adecuada para montajes de investigacion con un robot `PhysicalAIRobot` y utillaje fijo.
- Banco de pruebas de imitacion visual: sirve para reproducir el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) con un caso de dificultad controlada y 63 episodios, util para comparar metodologias de entrenamiento sin necesidad de un dataset propio.
- Base para ajuste por embodiment en otro robot: al estar disenada para reajustar las cabezas de accion, puede partirse de este checkpoint para entrenar una tarea nueva con `lerobot-train --policy.type=flux3` sobre un dataset propio.
- Investigacion sobre politicas de video-accion: permite medir de forma practica las diferencias entre un enfoque que desruidifica acciones junto con fotogramas futuros y alternativas clasicas de imitacion como ACT o Diffusion Policy, siempre que se aporte una evaluacion propia.
- Automatizacion de clasificacion y separacion de piezas: en entornos con objetos de color y forma controlados, la politica puede reciclar el patron aprendido (detectar, agarrar, depositar) para tareas de bin picking sencillas, previo reentrenamiento con datos del nuevo objeto.
- Recogida de datos en bucle cerrado: el rollout con `--strategy.type=base` permite ejecutar la politica en el robot en sesiones de 60 segundos o indefinidas, de modo que se pueden registrar episodios adicionales para iterar sobre el dataset y volver a entrenar.
- Demostracion de infraestructura de robotica open source: util para validar pipelines de CI/CD de robotica, integracion con WandB y gestion de checkpoints en el Hub, dado que todo el ciclo se ejecuta con comandos de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y deja sin rellenar la tabla de evaluacion en robot real (tarea, intentos, exitos y tasa de exito). No se dispone por tanto de tasas de exito, ni de comparaciones con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks, que por otra parte no aplican a una politica de accion robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El repositorio ocupa 0,5 GB, lo que da una cota inferior del espacio en disco de los pesos, pero no se puede derivar de ahi la VRAM total sin conocer el numero de parametros y si el tronco FLUX.3 se carga desde un checkpoint base independiente.
- Consideracion importante: si el repositorio contiene unicamente las cabezas de accion ajustadas y el tronco FLUX.3 se carga aparte, la VRAM real de inferencia seria sustancialmente mayor que lo que sugiere el tamano del repositorio. Este punto no se aclara en la informacion disponible.
- GPU recomendadas: la model card solo indica `--policy.device=cuda` para entrenamiento, es decir, se requiere una GPU CUDA. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada. Con un repositorio de 0,5 GB es plausible que quepa en GPU de consumo con suficiente memoria, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: `lerobot-rollout` para ejecucion en robot y `lerobot-train` para entrenamiento, ambos de LeRobot 0.6.2 o superior. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS y el ejemplo de rollout configura las camaras a 30 FPS, lo que marca el orden de magnitud del bucle de control, pero no hay ninguna medicion publicada de la frecuencia efectiva de inferencia ni del tiempo de reaccion.
- Almacenamiento: el repositorio completo ocupa 0,5 GB.

## Comparativa con modelos similares

La informacion proporcionada no incluye parametros, contexto ni resultados de benchmarks de este modelo, por lo que la comparacion numerica no es posible. La tabla siguiente compara caracteristicas cualitativas dentro de la familia de politicas de imitacion disponibles en LeRobot.

| Modelo | Categoria | Entradas | Salida | Licencia | Datos numericos |
|---|---|---|---|---|---|
| `sovrasov/flux3_policy_black_cubes_20k_v2` | Video-accion generativa (FLUX 3 Action), ajustada por embodiment | 2 camaras 256x256 + estado (6,) | Accion (6,) | Apache 2.0 | no disponible |
| ACT | Politica de imitacion transformer con encoder visual | Imagenes + estado | Acciones de articulaciones | Disponible en LeRobot | no disponible en la informacion proporcionada |
| Diffusion Policy | Politica generativa basada en difusion de acciones | Imagenes + estado | Trayectoria de acciones | Disponible en LeRobot | no disponible en la informacion proporcionada |
| SmolVLA | Vision-lenguaje-accion compacto | Imagenes + estado + instruccion en lenguaje | Acciones | Disponible en LeRobot | no disponible en la informacion proporcionada |

Diferencias cualitativas destacables: frente a ACT o Diffusion Policy, `flux3` predice de forma conjunta los fotogramas futuros y la accion, lo que lo situa en la linea de los modelos de video-accion; frente a SmolVLA, este checkpoint concreto no documenta condicionamiento por instrucciones en lenguaje ni soporte multilingue, y esta especializado en una unica tarea de pick-and-place.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito publicada, ni numero de intentos, ni condiciones de prueba. No se puede afirmar que la politica funcione de forma fiable en robot real.
- Dataset muy reducido y mono-tarea: 63 episodios y 24.859 fotogramas para una unica tarea. Es esperable un sobreajuste a las posiciones de objeto, iluminacion, fondo y utillaje presentes en la grabacion.
- Entrenamiento de bajo presupuesto: 20.000 pasos con tamano de lote 2 y una sola semilla (42) implican alta varianza y poca evidencia de convergencia robusta.
- Dependencia estricta del formato de observacion: la politica espera dos camaras concretas con nombres y orden determinados (`observation.images.scene` y `observation.images.wrist`) y resolucion 3x256x256, mas un estado de 6 dimensiones. Cualquier cambio en la configuracion de camaras, en los indices o en la calibracion invalida el modelo.
- Acoplamiento al embodiment: esta ajustada para `PhysicalAIRobot`; usarla en otro robot requiere reentrenar las cabezas de accion.
- Sin datos sobre sesgos: no hay informacion sobre la demografia del operador ni sobre la variabilidad del entorno, por lo que no se puede evaluar el sesgo del dataset.
- Riesgo de fallo fisico: en robotica, un error de la politica se traduce en movimientos reales. Es imprescindible ejecutar con limites de par, parada de emergencia y espacio de trabajo despejado, especialmente en los primeros rollouts.
- Deriva y acumulacion de error: en ejecuciones largas o fuera de distribucion, la desruidificacion conjunta de video y accion puede producir secuencias fisicamente incoherentes. La model card no documenta estrategias de recuperacion.
- Idiomas: no aplica; no es un modelo de lenguaje ni procesa instrucciones en lenguaje natural mas alla de la cadena de tarea usada por la herramienta.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial de estos pesos. Sin embargo, si el tronco FLUX.3 base se carga desde un checkpoint externo, conviene verificar la licencia de ese checkpoint antes de un despliegue comercial.
- Contexto del repositorio: 0 descargas, 0 likes y publicacion sin evaluacion. Se trata de un artefacto experimental no validado por la comunidad, lo que refuerza la necesidad de validacion propia antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sovrasov/flux3_policy_black_cubes_20k_v2
- Version previa del mismo autor: https://huggingface.co/sovrasov/flux3_policy_black_cubes_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/sovrasov/pick-black-cubes-room-2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sovrasov/pick-black-cubes-room-2
- Guia de flux3 en LeRobot: https://huggingface.co/docs/lerobot/main/en/flux3
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Anuncio de FLUX 3 (MarkTechPost): https://www.marktechpost.com/2026/07/26/black-forest-labs-releases-flux-3-a-multimodal-flow-model-for-image-video-audio-and-robot-action-prediction/
- Cobertura de FLUX 3 (Tech Times): https://www.techtimes.com/articles/321552/20260725/flux-3-launches-black-forest-labs-enters-video-audio-physical-ai-one-model.htm
- Pagina de FLUX 3 de Black Forest Labs: https://flux3.dev/
- Catalogo de modelos de Flux 3 AI: https://flux3ai.com/models
