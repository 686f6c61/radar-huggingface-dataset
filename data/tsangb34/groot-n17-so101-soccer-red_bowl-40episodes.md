# tsangb34/groot-n17-so101-soccer-red_bowl-40episodes

## Resumen

`tsangb34/groot-n17-so101-soccer-red_bowl-40episodes` es una politica robotica de imitacion publicada en Hugging Face por el usuario `tsangb34`, construida sobre GR00T N1.7, el modelo fundacional abierto y cross-embodiment de NVIDIA para razonamiento y habilidades de robots humanoides. No se trata de un modelo de lenguaje conversacional, sino de un modelo de accion (policy) que predice comandos motores a partir de observaciones multimodales de un brazo robotico concreto.

El modelo consume dos flujos de imagen RGB de 480x640 (camaras `front` y `wrist`), un vector de propiocepcion de 6 dimensiones y una instruccion de tarea en lenguaje natural, y produce un vector de accion de 6 dimensiones. Esta especializado en una unica tarea: recoger un pequeno balon de juguete y depositarlo en un cuenco rojo, entrenada con 40 episodios y 14.729 fotogramas grabados a 30 FPS sobre un robot de tipo `so_follower`.

Su relevancia es doble: por un lado muestra el flujo completo de LeRobot 0.6.1 para fine-tuning de un modelo fundacional robotico de 3.144.016.000 parametros sobre hardware de bajo coste; por otro, es un ejemplo de adaptacion de una arquitectura VLM mas transformer de acciones con flow matching a una tarea concreta con muy pocos datos. No obstante, no se han publicado resultados de evaluacion ni existe validacion externa, ya que el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2 / Qwen3-VL mas transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (existe un componente de lenguaje en el backbone, pero no se documenta el conjunto de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 12,6 GB) |
| Tipo de politica | Imitacion (behavior cloning) con prediccion de acciones por flow matching |
| Robot objetivo | `so_follower` (brazo tipo SO-101) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de grabacion | 30 FPS |
| Dataset de entrenamiento | tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes (40 episodios, 14.729 fotogramas) |
| Libreria | lerobot 0.6.1 |
| Fecha de creacion (metadatos) | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

GR00T N1.7 sigue un diseno de dos componentes: un backbone vision-lenguaje (Cosmos-Reason2 / Qwen3-VL) que procesa las imagenes y la instruccion textual para producir una representacion semantica de la escena y de la tarea, y un transformer de acciones entrenado con flow matching que genera la secuencia motora condicionada por vision, lenguaje y propiocepcion. Este esquema de flow matching permite modelar distribuciones multimodales de acciones, algo relevante en tareas de manipulacion donde existen varias trayectorias validas para alcanzar el mismo objetivo.

El fine-tuning se realizo con LeRobot 0.6.1 durante 921 pasos, con batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 42. Los datos proceden de 40 episodios de demostracion (14.729 fotogramas a 30 FPS) de la tarea "Pick up the small soccer ball toy and place it in the red bowl". No se documenta la composicion del dataset base de GR00T N1.7, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo; tampoco se especifica el numero total de tokens de entrenamiento del modelo original ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de robot en bucle cerrado a partir de observaciones visuales y propioceptivas, con salida de 6 grados de libertad.
- Condicionamiento por lenguaje natural: la tarea se pasa como cadena de texto (`--task="..."`) y el modelo la usa como contexto.
- Fusion multimodal de dos camaras simultaneas (`front` y `wrist`), lo que aporta tanto perspectiva global de la escena como vision cercana al efector.
- Manipulacion de objetos del mundo real: la tarea entrenada implica aproximacion, agarre de un objeto pequeno y deposito en un recipiente.
- Ejecucion de trayectorias multi-paso dentro de un mismo episodio (acercarse, agarrar, desplazarse, soltar), aunque limitada a una unica tarea.
- Hereda del diseno cross-embodiment de GR00T N1.7, si bien esta version esta especializada en el robot `so_follower`.
- No se documenta soporte de tool calling, function calling, razonamiento agentico, modo de pensamiento explicito, entrada de audio, ni capacidades generativas de texto largo.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede ejecutar de forma autonoma la secuencia de recoger un objeto y depositarlo en un recipiente, usando las dos camaras para localizar el objeto y corregir la trayectoria durante el agarre.
- Punto de partida para fine-tuning con pocos datos: con 40 episodios y 921 pasos de entrenamiento se obtiene una politica funcional, lo que lo convierte en una plantilla para validar rapidamente nuevas tareas sobre el mismo brazo SO-101.
- Reproduccion de experimentos en aprendizaje por imitacion: sirve como referencia reproducible con hiperparametros documentados (AdamW, lr 1e-4, batch 16, semilla 42) para comparar variantes de arquitectura o de recoleccion de datos.
- Docencia y formacion en robotica: el flujo `lerobot-rollout` con `--strategy.type=base` permite demostrar un pipeline completo de inferencia sobre hardware accesible sin necesidad de un equipo de investigacion dedicado.
- Recoleccion de datos asistida: ejecutando la politica junto a teleoperacion se pueden generar episodios adicionales en configuraciones ligeramente distintas (posiciones, iluminacion) para ampliar el dataset original.
- Evaluacion de robustez y dominio: al estar entrenada en un entorno muy concreto, es util para medir la degradacion de la tasa de exito ante cambios de iluminacion, posicion inicial del objeto o presencia de distractores.
- Automatizacion de tareas de clasificacion ligera: con un fine-tuning posterior sobre el mismo backbone, el modelo puede adaptarse a tareas de recogida y separacion de objetos pequenos en lineas de baja cadencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet." y la tabla de evaluacion en robot real aparece vacia, por lo que se desconoce la tasa de exito de la tarea entrenada.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP32) los pesos ocupan aproximadamente 12,6 GB, coherente con el tamano del repositorio; en BF16/FP16 se reduce a unos 6,3 GB; en cuantizacion INT8 a unos 3,2 GB, y en INT4 en torno a 1,6-2 GB. Hay que anadir el coste de activaciones y de los dos codificadores de vision que procesan imagenes de 480x640.
- GPU recomendadas: para BF16 sin cuantizar se recomienda un minimo de 16 GB de VRAM, lo que cubre RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti (16 GB) o A100/H100 en entornos de servidor. Para FP32 se necesitan al menos 24 GB.
- Viabilidad en GPU de consumo: si, cabe en GPUs de gama alta y gama media-alta con 16 GB o mas en BF16. Por debajo de 12 GB seria necesario cuantizar o reducir la resolucion de las entradas, algo no documentado por el autor.
- Opciones de despliegue: el flujo oficial es LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento) con `--policy.device=cuda`. No hay pesos GGUF publicados ni se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que ademas estan orientados a modelos de lenguaje y no a politicas de accion con flow matching.
- Latencia y throughput: no se han publicado mediciones. Como referencia de diseno, las observaciones se grabaron a 30 FPS, lo que implica un presupuesto de aproximadamente 33 ms por paso de control; el flow matching suele requerir varios pasos de denoising por accion, por lo que la latencia real puede ser el factor limitante en hardware de gama media y no se puede garantizar el control en tiempo real sin medirlo.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa numerica. Como contexto cualitativo, esta politica pertenece a la familia de modelos fundacionales roboticos que incluye GR00T N1.7 (NVIDIA), la serie pi0 / pi0.5 (Physical Intelligence) y SmolVLA (Hugging Face), todos ellos orientados a prediccion de acciones condicionada por vision y lenguaje. La tabla siguiente recoge unicamente los campos de los que se tiene constancia en los materiales consultados; el resto se marca como no disponible para no introducir cifras sin verificar.

| Modelo | Desarrollador | Parametros | Licencia | Disponibilidad de datos en esta ficha |
|---|---|---|---|---|
| groot-n17-so101-soccer-red_bowl-40episodes | tsangb34 (sobre GR00T N1.7 de NVIDIA) | 3.144.016.000 | apache-2.0 | Completa (model card y metadatos) |
| GR00T N1.7 (modelo base) | NVIDIA | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Solo referencia al repositorio Isaac-GR00T |
| pi0 / pi0.5 | Physical Intelligence | No disponible | No disponible | No consultado |
| SmolVLA | Hugging Face | No disponible | No disponible | No consultado |

Diferencias relevantes frente a cualquier alternativa: este checkpoint es un fine-tuning de tarea unica sobre 40 episodios, no un modelo generalista, por lo que la comparacion directa de parametros o de benchmarks con los modelos base no seria significativa.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo esta entrenada para la tarea "Pick up the small soccer ball toy and place it in the red bowl". Fuera de ese objetivo no hay garantia de comportamiento util.
- Volumen de datos muy reducido: 40 episodios y 921 pasos de entrenamiento. Es esperable un sobreajuste al entorno de grabacion, a las posiciones de las camaras y a las condiciones de iluminacion.
- Ausencia total de evaluacion: no hay tasa de exito publicada ni validacion por terceros. El repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia externa de funcionamiento.
- Dependencia estricta del hardware: exige un robot `so_follower` con camaras `front` y `wrist`, y los nombres de las features de observacion deben coincidir exactamente con los del entrenamiento o la inferencia fallara.
- Riesgo de alucinacion de acciones: como todo modelo generativo de politicas, puede producir trayectorias fisicamente invalidas o inseguras ante entradas fuera de distribucion, con el consiguiente riesgo de colision o dano al robot.
- Idiomas: la tarea se especifica en ingles y no se documenta el soporte multilingue del backbone ni el efecto de instrucciones en otros idiomas.
- Licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial, pero la politica deriva de pesos base (GR00T N1.7, con backbone Cosmos-Reason2 / Qwen3-VL) cuyas condiciones no se detallan en la informacion proporcionada. Conviene verificar los terminos del modelo base antes de un despliegue comercial.
- Seguridad en produccion: cualquier uso en robot real requiere limites de par, paradas de emergencia y validacion en entorno controlado antes de operar cerca de personas.
- Metadatos inconsistentes: las fechas de creacion y actualizacion indican 2026-09-16, dato que conviene contrastar con el calendario real de publicacion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/groot-n17-so101-soccer-red_bowl-40episodes
- Dataset de entrenamiento: https://huggingface.co/datasets/tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Tutorial de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Diagrama de arquitectura incluido en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot/lerobot-groot-paper1%20(1).png
- Cita de LeRobot: Cadene, Remi y otros, "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch" (BibTeX incluido en la model card).
- Enlaces procedentes de la busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos corresponden al sitio aleman de productos de limpieza hygi.de y no guardan relacion con el modelo.
