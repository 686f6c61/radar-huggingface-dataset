# van-i/so100-imitation-learning-stand

## Resumen

`van-i/so100-imitation-learning-stand` no es un modelo con pesos publicados, sino un repositorio de LeRobot (libreria `lerobot`, tamano de repo 0.0 GB) que documenta la construccion de un banco de pruebas de aprendizaje por imitacion para una clase de robotica escolar. El autor, `van-i`, describe paso a paso como montar un sistema fisico completo (dos brazos SO-100, tres camaras USB y una estacion de trabajo con RTX 3090) y como recorrer el ciclo de imitation learning con LeRobot 0.6.0 y su interfaz web LeLab, desde la teleoperacion y la grabacion de episodios hasta el entrenamiento y el rollout de una politica sobre hardware real.

La tarea de referencia del banco es "pick r2d2 and put to box": coger una figura R2-D2 y dejarla en una caja. El repositorio no define una arquitectura propia, sino que apunta a familias de politicas visuomotoras del ecosistema LeRobot mediante sus etiquetas: ACT (`arxiv:2304.13705`), Diffusion Policy (`arxiv:2303.04137`), SmolVLA (`arxiv:2506.01844`) y GR00T. Por tanto, su relevancia no esta en un modelo entrenado concreto, sino en servir de guia reproducible y material docente para montar un entorno de robot learning real.

El valor practico es educativo y de replicabilidad: fija una configuracion de hardware, versiones de software y flujo de trabajo que cualquier persona puede reproducir en un aula o laboratorio. Al estar publicado bajo licencia Apache-2.0 y acompanarse de dos datasets de LeRobot, permite comparar politicas sobre los mismos datos y el mismo banco fisico, aunque no incluye checkpoints ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica pesos ni define una arquitectura propia; referencia ACT, Diffusion Policy, SmolVLA y GR00T) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se han subido pesos; el repositorio ocupa 0.0 GB) |

Parametros adicionales de la configuracion documentada:

| Elemento | Valor |
|---|---|
| Brazos | SO-100 leader (teleoperado a mano) + SO-100 follower (ejecuta la tarea) |
| Camaras | 3 USB a 640x480, 30 fps: dos cenitales (`left`, `right`) y una en la muneca (`grip`), InnoMaker de 32x32 mm |
| Equipo de computo | HP Z440 con GPU RTX 3090 (24 GB), Proxmox con contenedor LXC |
| Software | LeRobot 0.6.0 a traves de LeLab |
| Tarea | "pick r2d2 and put to box" |
| Duracion de episodio | aproximadamente 8-10 segundos (300 fotogramas a 30 fps) |
| Libreria | lerobot |
| Pipeline en HuggingFace | robotics |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica una politica concreta; actua como guia de montaje y de flujo de trabajo. La arquitectura subyacente depende de la politica elegida en cada caso (ACT, Diffusion Policy, SmolVLA o GR00T), todas ellas del ecosistema LeRobot y orientadas a vision-language-action o a visuomotor policy learning. La documentacion describe el ciclo completo de imitation learning: teleoperacion con el brazo leader para generar ejemplos, grabacion de episodios, entrenamiento supervisado por imitacion y rollout de la politica sobre el brazo follower.

Los datos de entrenamiento son los propios episodios grabados por los estudiantes sobre el banco, complementados por dos datasets publicados en el Hub: `van-i/r2d2_to_box_bg_20261003_210444` y `van-i/r2d2_to_box_2_20261003_131039`. No se detallan en la informacion disponible el numero de tokens o episodios totales, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Como innovacion practica, el banco propone una configuracion fija de hardware y software que estandariza el proceso (calibrar, controlar, grabar, entrenar y ejecutar) mediante la interfaz web LeLab, de modo que el alumnado pueda obtener un robot funcional en la primera sesion.

## Capacidades

- Ejecucion de tareas de manipulacion fisica por imitacion sobre un brazo SO-100, en concreto el "pick and place" de una figura R2-D2 a una caja.
- Captura multimodal mediante tres camaras sincronizadas a 640x480 y 30 fps (dos cenitales y una en la pinza) junto con la posicion articular del brazo.
- Teleoperacion manual a traves del brazo leader para generar demostraciones.
- Grabacion y gestion de episodios y datasets en formato LeRobot, compartibles en el HuggingFace Hub.
- Entrenamiento y fine-tuning de politicas visuomotoras del ecosistema LeRobot (ACT, Diffusion Policy, SmolVLA, GR00T) sobre datos propios.
- Rollout de la politica entrenada en hardware real con bucle de control a 30 Hz.
- Flujo de trabajo guiado por web (LeLab) con botones para calibrar, controlar, grabar, entrenar y ejecutar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idioma del contenido: ingles).
- Capacidades especiales (vision, audio, thinking mode): vision integrada a traves de las camaras del banco; el resto, no disponible.

## Casos de uso

- Docencia de robotica en secundaria o formacion profesional: el banco permite que el alumnado complete el ciclo de imitation learning sobre hardware real en lugar de una simulacion, con una curva de entrada reducida gracias a LeLab y sus botones paso a paso.
- Laboratorio universitario de robot learning: sirve como plataforma reproducible para que los estudiantes comparen ACT, Diffusion Policy y SmolVLA sobre el mismo conjunto de datos y el mismo montaje fisico.
- Recogida de datasets de manipulacion: el flujo de teleoperacion con brazo leader permite generar episodios etiquetados (imagenes mas estados articulares) y publicarlos en el Hub para entrenar o evaluar otras politicas.
- Estudio de generalizacion de politicas: al fijar camaras, iluminacion y disposicion, el banco permite analizar como se degrada una politica ante cambios controlados (posicion del objeto, fondo, oclusiones).
- Prototipado low-cost de automatizacion de pick and place: sirve como prueba de concepto para validar tareas simples de coger y soltar con hardware de bajo coste antes de escalar a celdas industriales.
- Divulgacion y talleres: el caracter visual y tangible del montaje ("un robot que tira el objeto de la mesa ensena mas que cualquier grafico") lo hace adecuado para demostraciones y ferias cientificas.
- Formacion de formadores: el repositorio documenta el montaje completo con enlaces a listas de piezas y archivos STL, lo que facilita replicar el banco en otros centros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra especifica; el montaje documentado usa una RTX 3090 con 24 GB para entrenamiento y ejecucion con tres camaras a 640x480 y 30 fps.
- GPU recomendadas: no se especifican mas alla de la RTX 3090 empleada en el banco descrito.
- Compatibilidad con GPU de consumo: la RTX 3090 es una GPU de consumo de gama alta; no se confirma en la informacion disponible si el sistema cabe en GPUs con menos VRAM.
- Opciones de despliegue: LeRobot 0.6.0 con la interfaz web LeLab; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este flujo de robotica).
- Latencia y throughput: bucle de control a 30 Hz (30 comandos por segundo enviados al brazo); no se aportan cifras de throughput de entrenamiento ni de latencia de inferencia.
- Hardware adicional: dos brazos SO-100 (leader y follower), tres camaras USB a 640x480 y 30 fps, montura cenital impresa en 3D y una estacion de trabajo (HP Z440 en el caso documentado).

## Comparativa con modelos similares

La informacion disponible no ofrece especificaciones comparables (parametros, contexto o benchmarks) de este repositorio ni de otros bancos de robot learning. A continuacion se listan las politicas que el repositorio referencia como posibles alternativas dentro del mismo ecosistema, sin datos de rendimiento que permitan una comparacion cuantitativa:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ACT (`arxiv:2304.13705`) | Politica visuomotora | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy (`arxiv:2303.04137`) | Politica visuomotora | no disponible | no disponible | no disponible | no disponible |
| SmolVLA (`arxiv:2506.01844`) | Vision-language-action | no disponible | no disponible | no disponible | no disponible |
| GR00T | Vision-language-action | no disponible | no disponible | no disponible | no disponible |

No disponible una comparativa cuantitativa fiable entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio no contiene pesos ni checkpoints (tamano 0.0 GB), por lo que no puede usarse directamente para inferencia.
- Riesgo de alucinacion: no aplicable en el sentido de modelos de lenguaje, pero las politicas entrenadas por imitacion pueden fallar de forma impredecible ante situaciones no vistas.
- Sesgos conocidos: la politica aprende de las demostraciones grabadas en un banco concreto, por lo que su comportamiento esta sesgado hacia la posicion de camaras, la iluminacion, el fondo y la distribucion de objetos de ese montaje.
- Limitaciones de contexto o idioma: el contenido esta en ingles; no se documentan capacidades multilingues.
- Restricciones de licencia: el repositorio se publica bajo Apache-2.0, permisiva para uso comercial; conviene revisar por separado las licencias de los componentes de hardware, del software LeRobot/LeLab y de las politicas referenciadas.
- Reproducibilidad dependiente del hardware: los resultados dependen del montaje fisico exacto (SO-100, tres camaras, RTX 3090); cambiar la camara o la posicion puede degradar la politica.
- Coste y tiempo de montaje: exige imprimir piezas en 3D, comprar componentes y ensamblar los brazos, ademas de calibrar los motores antes de grabar.
- Datos de rendimiento ausentes: no se publican metricas de exito de la tarea ni comparaciones, lo que dificulta evaluar objetivamente la calidad de las politicas entrenadas sobre este banco.
- Uso en produccion: el enfoque esta pensado para docencia y prototipado, no para entornos de produccion con requisitos de fiabilidad, seguridad o trazabilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/van-i/so100-imitation-learning-stand
- Dataset `van-i/r2d2_to_box_bg_20261003_210444`: https://huggingface.co/datasets/van-i/r2d2_to_box_bg_20261003_210444
- Dataset `van-i/r2d2_to_box_2_20261003_131039`: https://huggingface.co/datasets/van-i/r2d2_to_box_2_20261003_131039
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- LeLab (GitHub): https://github.com/huggingface/leLab
- Guia SO-100 de LeRobot: https://huggingface.co/docs/lerobot/main/en/so100
- Repositorio SO-ARM100 (The Robot Studio): https://github.com/TheRobotStudio/SO-ARM100
- Montura cenital de camara (SO-ARM100): https://github.com/TheRobotStudio/SO-ARM100/blob/main/Optional/Overhead_Cam_Mount_Webcam/README.md
- Paper ACT: https://arxiv.org/abs/2304.13705
- Paper Diffusion Policy: https://arxiv.org/abs/2303.04137
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
