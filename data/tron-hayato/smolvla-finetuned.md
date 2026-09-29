# Tron-Hayato/smolvla-finetuned

## Resumen

SmolVLA fine-tuned es una política robótica de tipo vision-language-action (VLA) publicada por el usuario Tron-Hayato en Hugging Face, obtenida mediante ajuste fino supervisado del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje conversacional: recibe dos imágenes de cámara (frontal y de muñeca) más el estado articular del robot y una instrucción textual, y devuelve una secuencia de acciones de 6 grados de libertad. El entrenamiento se realizó con LeRobot 0.6.1 sobre un dataset propio de 84 episodios y 36 300 fotogramas grabados a 30 FPS para una única tarea: "Grab the object".

El interés de esta ficha es doble. Por un lado, ilustra el flujo de trabajo estándar de la comunidad LeRobot para adaptar un VLA compacto a un brazo concreto (tipo `so_follower`, previsiblemente un SO-100/SO-101) con hardware de consumo. Por otro, sirve como ejemplo de los riesgos de publicar checkpoints sin evaluación: el repositorio declara explícitamente que no se han aportado resultados de éxito en robot real, y acumula 0 descargas y 0 likes en el momento de la consulta.

El modelo hereda la arquitectura de SmolVLA (arXiv:2506.01844), un VLA ligero de 450 046 176 parámetros que combina un VLM preentrenado compacto con un experto de acción entrenado mediante flow matching. Esa escala es lo que permite ejecutarlo en GPU de gama media, en contraste con VLA de 3 a 7 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): VLM compacto preentrenado + experto de accion con flow matching |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se documenta la ventana del backbone VLM; la condicion de tarea es una cadena de texto corta) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la politica se condiciona con una instruccion textual; en el dataset de entrenamiento la unica tarea es "Grab the object", en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de robot (imitation learning), no modelo generativo de texto |
| Modelo base | lerobot/smolvla_base |
| Embodiment / robot | `so_follower` (brazo tipo SO-100/SO-101 en configuracion follower) |
| Camaras | `front` y `wrist`, 3x480x640 cada una |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida | `action`, shape (6,) |
| Dataset de entrenamiento | Tron-Hayato/record-act-finetuned-base-modify-hold-pos (84 episodios, 36 300 fotogramas, 30 FPS) |
| Tarea entrenada | "Grab the object" (unica tarea) |
| Libreria | lerobot |
| Tamano del repositorio | 3.3 GB |

## Arquitectura y entrenamiento

SmolVLA, segun la descripcion del propio metodo, es un VLA ligero compuesto por un VLM preentrenado compacto y un experto de accion entrenado con flow matching. Dadas varias imagenes y una instruccion de lenguaje que describe la tarea, el modelo emite un chunk de acciones (no una accion aislada), lo que reduce la frecuencia efectiva de inferencia necesaria y facilita el control a 30 FPS. El checkpoint aqui descrito es un ajuste fino de ese modelo base, no un entrenamiento desde cero: se parte de `lerobot/smolvla_base` y se adapta a un embodiment y una tarea concretos.

La configuracion de entrenamiento declarada es pequena y reproducible en una sola GPU: 2000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. El dataset contiene 84 episodios y 36 300 fotogramas a 30 FPS para la tarea unica "Grab the object", con dos flujos de imagen (frontal y de muñeca) mas un vector de estado de 6 dimensiones; la salida es un vector de accion de 6 dimensiones. No se documenta el numero de tokens totales de entrenamiento, la composicion completa del dataset, ni si se aplicaron etapas de RLHF, DPO o reward modeling (en robótica de imitacion lo habitual es entrenamiento puramente supervisado por comportamiento clonado, pero no se confirma en la informacion disponible).

Como innovaciones heredadas del metodo base, destaca el uso de un VLM de escala reducida como codificador multimodal y la generacion de chunks de accion mediante flow matching, lo que abarata el coste de inferencia frente a VLA basados en LLM de 7B. No se especifican en la informacion proporcionada detalles sobre decodificacion especulativa, atencion lineal o inferencia asincrona para este checkpoint concreto.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para un brazo `so_follower`, condicionadas por dos imagenes (frontal y muñeca) y el estado articular.
- Ejecucion de una tarea de agarre ("Grab the object") mediante rollouts continuos a 30 FPS.
- Condicionamiento por instruccion textual: la politica acepta una cadena de tarea (`--task="Grab the object"`), aunque solo se ha entrenado con esa tarea.
- Percepcion visual multimodal: procesa simultaneamente dos camaras de 480x640, lo que permite cierto grado de correccion visomotora durante el agarre.
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los LLM: es una politica de control, no un orquestador.
- No dispone de modo de razonamiento explicito (thinking mode), ni capacidades de audio, ni generacion de texto libre.
- Capacidades multilingues: no disponibles; la unica instruccion de entrenamiento documentada esta en ingles.

## Casos de uso

- Agarre de objetos en laboratorio: el modelo esta entrenado especificamente para la tarea "Grab the object" sobre un brazo tipo SO-100/SO-101, por lo que su uso mas directo es reproducir ese agarre con la misma configuracion de camaras y a 30 FPS.
- Base para ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y requerir solo 2000 pasos con batch 8, sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets nuevos del mismo embodiment.
- Prototipado rapido con hardware de consumo: con 450 M de parametros y pesos en safetensors, permite desplegar una politica VLA en una GPU de gama media sin infraestructura dedicada, reduciendo el ciclo de iteracion de un proyecto de robotica.
- Validacion de pipelines de adquisicion de datos: ejecutar `lerobot-rollout` con `--strategy.type=base` permite comprobar si un dataset de 84 episodios a 30 FPS es suficiente para una tarea de agarre antes de invertir en mas grabaciones.
- Investigacion comparativa en imitation learning: sirve como linea base de VLA compacto frente a alternativas mayores (OpenVLA, pi0) en experimentos de coste frente a rendimiento.
- Docencia y formacion en robotica: el flujo completo (grabar con dos camaras, entrenar, desplegar) es replicable en un aula o taller con material de bajo coste y comandos de LeRobot.
- Evaluacion de robustez de politicas: al no haber resultados de exito publicados, es un caso de uso legitimo medir su tasa de acierto ante cambios de posicion del objeto, iluminacion o distracciones antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluacion en robot real en la informacion disponible. La model card indica literalmente que no se han proporcionado resultados de evaluacion para esta politica y que no se ha rellenado la tabla de tareas, ensayos y tasa de exito. Tampoco hay datos de MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: unos 0,9 GB para los pesos en bf16/fp16 (450 M de parametros) y aproximadamente 1,8 GB en fp32, mas el coste de activaciones de dos imagenes de 3x480x640 y del backbone VLM; en la practica, un presupuesto de 2 a 4 GB de VRAM es razonable.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, fuentes de la comunidad reportan fine-tuning de SmolVLA de 450 M en una unica RTX 4060 de 8 GB.
- Cabe en GPU de consumo: si, es uno de los objetivos de diseno declarados de SmolVLA ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar) sobre PyTorch con pesos safetensors. No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. No se documentan tiempos de inferencia, tamano del chunk de acciones ni frecuencia de control efectiva para este checkpoint concreto.
- Perifericos: un brazo `so_follower` con dos camaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que coincidan con las claves `observation.images.front` y `observation.images.wrist`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tron-Hayato/smolvla-finetuned | 450 M | Dos camaras + estado (6,) + instruccion de texto; unica tarea "Grab the object" | No disponible | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | 450 M | Igual arquitectura, preentrenado para ajuste fino | Metricas agregadas del metodo SmolVLA (no reproducidas aqui) | apache-2.0 (segun repositorio base) | Hugging Face |
| OpenVLA | Aproximadamente 7 000 M | Vision + instruccion de lenguaje, multiples tareas | Metricas publicas en benchmarks de robotica (no verificadas en esta ficha) | Licencia propia del proyecto | Repositorio publico |
| Octo | Aproximadamente 93 M (variante base) | Vision + instruccion de lenguaje, multi-embodiment | Metricas publicas en benchmarks de robotica | Apache/MIT (segun version) | Repositorio publico |

La comparacion es estructural: este checkpoint es dos ordenes de magnitud mas pequeno que OpenVLA, lo que explica que quepa en GPU de consumo, y esta especializado en un unico embodiment y una unica tarea, mientras que los modelos citados son policias generalistas de proposito multiple. No hay datos de rendimiento de este fine-tune que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card confirma que no se han publicado resultados de exito en robot real, por lo que la tasa de acierto de la tarea "Grab the object" es desconocida.
- Dataset muy reducido: 84 episodios y 36 300 fotogramas para una sola tarea implican un riesgo alto de sobreajuste y una generalizacion limitada a nuevas posiciones del objeto, iluminaciones o distracciones.
- Dependencia estricta del embodiment: la politica esta entrenada para `so_follower` con dos camaras concretas (`front`, `wrist`) a 640x480 y 30 FPS. Cambiar el brazo, el numero de camaras, la resolucion o los nombres de las observaciones invalida el modelo.
- Condicionamiento textual restringido: la unica tarea documentada es "Grab the object"; no hay evidencia de seguimiento de instrucciones nuevas en otros idiomas ni en formulaciones distintas.
- Riesgo de alucinacion en sentido amplio: al ser una politica de imitacion, puede producir acciones plausibles pero incorrectas (agarres fallidos, colisiones) sin ninguna senal de incertidumbre calibrada.
- Sin senales de validacion comunitaria: 0 descargas y 0 likes en la fecha indicada, sin demo en video ni resultados de terceros.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las licencias del modelo base `lerobot/smolvla_base` y del dataset asociado antes de un despliegue productivo.
- Seguridad fisica: es una politica que mueve un brazo robotico real; cualquier despliegue necesita limites de par, paradas de emergencia y supervision humana.
- Metadatos de fecha anomalos: la model card indica creacion el 2026-09-29, lo que conviene contrastar con el historial real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/smolvla-finetuned
- Perfil del autor: https://huggingface.co/Tron-Hayato
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-act-finetuned-base-modify-hold-pos
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-act-finetuned-base-modify-hold-pos
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Guia de SmolVLA en la documentacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Reproduccion comunitaria de fine-tuning de SmolVLA en RTX 4060: https://github.com/wycliffeoleti/smolVLA
