# Sudarshan18/gr00t-n17-g1-brainco-handover

## Resumen

gr00t-n17-g1-brainco-handover es un checkpoint de politica visomotora para robotica, publicado por el usuario Sudarshan18, que adapta el modelo fundacional NVIDIA GR00T N1.7-3B a una tarea concreta: el traspaso bimanual de un objeto (un palo vertical) de la mano derecha a la izquierda y su posterior colocacion en un objetivo. El escenario es un Unitree G1 de 29 grados de libertad con base fija, al que se le sustituyen las manos originales Dex3 por manos Brainco Revo2. El modelo resuelve un problema de transferencia de morfologia: una politica entrenada para unas manos deja de funcionar cuando se cambia el efector final, y este checkpoint demuestra que un ajuste fino corto recupera parte de la destreza.

Tecnicamente es un fine-tuning del checkpoint Stage A (Dex3) del mismo autor, que a su vez deriva de nvidia/GR00T-N1.7-3B. La receta congela el backbone de vision-lenguaje Eagle y entrena solo el proyector backbone-to-head y el cabezal de accion por flow matching, junto con los encoders de estado y accion del slot de embodiment. El resultado es un modelo de 3.144.016.000 parametros (unos 3,14 mil millones) que consume dos camaras RGB de 224x224, posiciones articulares y una frase de tarea fija, y emite chunks de 16 pasos de objetivos articulares absolutos a 20 Hz.

Su relevancia es metodologica mas que de producto: cuantifica cuanto se degrada una politica al cambiar el hardware de la mano y cuanto se recupera con 44 demostraciones teleoperadas (41.360 frames) y 10.000 pasos de entrenamiento en una sola NVIDIA A40 durante 2 horas y 12 minutos. Todo el trabajo es exclusivamente en simulacion (Isaac Lab); no se ha ejecutado nada en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional vision-lenguaje-accion GR00T N1.7: backbone VLM Eagle (congelado) mas cabezal de accion por flow matching, con slot de embodiment para estado y acciones |
| Parametros totales | 3.144.016.000 (~3,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y el repositorio ocupa 12,6 GB, compatible con pesos en fp32 |
| Idiomas soportados | no disponible (la politica se condiciona con una frase de tarea fija, no con lenguaje libre multiidioma) |
| Licencia | NVIDIA Open Model License (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | safetensors (incluye pesos, processor, configuracion de experimento, estadisticas del dataset y `PROVENANCE.json`; sin estado del optimizador) |

Parametros de la tarea:

| Parametro | Valor |
|---|---|
| Robot | Unitree G1_29DoF, base fija, manos Brainco Revo2 |
| Observaciones | Camara de cabeza y camara frontal, ambas RGB 224x224, posiciones articulares y frase de tarea fija |
| Acciones | 16 pasos de objetivos articulares absolutos: 14 articulaciones de brazo y 12 articulaciones de mano actuadas (26 valores) |
| Frecuencia de control | 20 Hz (fisica a 120 Hz en Isaac Lab) |
| Slot de embodiment | `NEW_EMBODIMENT`, configuracion de modalidad `scripts/brainco_config.py` |
| Articulaciones no comandadas | Las 5 articulaciones distales de cada dedo siguen a su proximal mediante la relacion de transmision de la descripcion del robot |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7-3B: un backbone de vision-lenguaje Eagle que procesa las dos camaras y la frase de tarea, un proyector que traduce las representaciones del backbone al espacio del cabezal de accion, y un cabezal de accion entrenado con flow matching que genera secuencias de objetivos articulares. La adaptacion a un nuevo embodiment se gestiona mediante un slot dedicado (`NEW_EMBODIMENT`) con sus propios encoders de estado y de accion, de forma que el cambio de manos no exige reentrenar el backbone.

El ajuste fino parte del checkpoint Stage A (Dex3), de modo que el comportamiento de brazo para esta tarea es el punto de partida y lo que se reaprende es el comportamiento de la mano. El ancho de accion pasa de 28 a 26 valores. Los datos son 44 demostraciones scriptadas con un agarre disenado especificamente para estas manos, que suman 41.360 frames a 20 Hz. El entrenamiento consta de 10.000 pasos, batch 16, learning rate 1e-4 y state dropout 0.05, sobre una unica NVIDIA A40 y con un coste de 2 horas y 12 minutos.

La innovacion tecnica documentada no esta en la arquitectura sino en la caracterizacion del fallo de retargeting: las demostraciones hacen que el pulgar barra la palma antes de cerrar, de modo que se oponga a los dedos en su propio plano, y agarran solo con pulgar, indice y corazon. Si en su lugar se reutiliza el cierre de la mano Dex3, el pulgar baja desde arriba y vuelca el palo, que es la razon por la que el Stage B nunca llega a agarrar.

## Capacidades

- Manipulacion bimanual: agarre con la mano derecha, transferencia a la izquierda, liberacion y colocacion final del objeto sobre un objetivo, sin teletransporte del objeto.
- Percepcion visual estereoscopica de baja resolucion: dos camaras RGB de 224x224 (cabeza y frontal) como unica entrada visual.
- Condicionamiento por lenguaje: acepta una frase de tarea fija como parte de la observacion.
- Control articular de alta frecuencia: emite chunks de 16 pasos de objetivos articulares absolutos para 14 articulaciones de brazo y 12 de mano, a 20 Hz.
- Generalizacion limitada a variaciones del objeto: evaluado con palos cuadrados de 3,0 x 24 cm, 3,0 x 22 cm y 3,5 x 24 cm, con un objeto no visto (palo redondo 3,0 x 24 cm) y con una pose inicial no vista.
- Adaptacion de morfologia: demuestra la viabilidad de reentrenar el control de una mano nueva manteniendo congelado el backbone de vision-lenguaje, en 2 horas de GPU.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso en el sentido de un LLM.
- No genera texto ni mantiene conversaciones; no es un modelo de proposito general.
- No dispone de modo thinking, audio ni capacidades multimodales adicionales a las dos camaras descritas.

## Casos de uso

- Investigacion en transferencia de morfologia: usar el par de checkpoints Dex3 y Brainco Revo2 para medir cuanto rendimiento se pierde al cambiar el efector final y cuanto se recupera con un fine-tuning acotado; el autor documenta que el retargeting sin entrenamiento obtiene 0 de 50 ensayos y este checkpoint 10 de 50.
- Evaluacion de politicas bimanuales en simulacion: integrar el checkpoint como referencia en Isaac Lab con el comando `scripts/policy_server.py` y el script `evaluate_stage.sh`, reproduciendo la bateria de cinco configuraciones y diez ensayos por configuracion con 2 cm de ruido en la posicion inicial del objeto.
- Estudio de diseno de manos robotizadas: comparar el cierre de dedos de Brainco Revo2 frente al de Unitree Dex3 en la misma tarea y aislar el efecto del pulgar oponible en el plano de los dedos sobre la tasa de exito del agarre.
- Generacion de datos sinteticos para aprendizaje por imitacion: las demostraciones scriptadas (44 episodios, 41.360 frames a 20 Hz) sirven como semilla para aumentar datos o para inicializar politicas en variantes de la misma tarea.
- Prueba de pipelines de control en tiempo real: el bucle a 20 Hz con fisica a 120 Hz en Isaac Lab permite validar latencias de comunicacion cliente-servidor (el servidor de politica escucha en el puerto 5612) antes de portar el control a hardware.
- Analisis de robustez ante variaciones de objeto y pose: el checkpoint permite reproducir los escenarios de objeto no visto y pose inicial no vista, donde la tasa de exito cae a 1 de 10 en ambos casos, como caso de estudio de sobreajuste a las condiciones de entrenamiento.
- Docencia en robotica: el repositorio asociado incluye codigo, evaluacion y documentacion, lo que lo hace util como ejemplo completo de fine-tuning de un modelo fundacional robotico con recetas reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de una politica de robotica y no de un modelo de lenguaje. La unica evaluacion publicada es la tarea de handover, con diez ensayos por configuracion y 2 cm de ruido en la posicion inicial del objeto:

| Configuracion | Exito |
|---|---|
| Palo cuadrado 3,0 x 24 cm | 2/10 |
| Palo cuadrado 3,0 x 22 cm | 4/10 |
| Palo cuadrado 3,5 x 24 cm | 2/10 |
| Objeto no visto: palo redondo 3,0 x 24 cm | 1/10 |
| Pose inicial no vista | 1/10 |
| **Total** | **10/50** |

Detalles de la evaluacion aportados por el autor: los ensayos duran hasta 1050 pasos de control, aproximadamente 1,1 veces la longitud de las demostraciones de entrenamiento, y solo cuentan como exito si el objeto se levanta, se transfiere, se libera y queda reposando en el objetivo por si solo con ambas manos libres. Como referencia, el propio autor indica que el retargeting de la politica Dex3 a estas manos sin entrenamiento obtiene 0 de 50 y nunca completa un agarre, y que este checkpoint se situa en el nivel del modelo de referencia Dex3 del que parte.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 12,6 GB si se cargan los pesos en fp32, que es lo que sugiere el tamano del repositorio (3,144 mil millones de parametros x 4 bytes); en bf16 la cifra bajaría a unos 6,3 GB solo de pesos, mas el coste de activaciones de las dos camaras y del cabezal de flow matching. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados en la model card.
- GPU empleada en el entrenamiento: una unica NVIDIA A40, durante 2 horas y 12 minutos, con 10.000 pasos y batch 16.
- GPU recomendadas: no se especifican en la informacion disponible. Por el perfil de memoria, una GPU profesional de 24-48 GB (A40, A6000, L40S) cubre el entrenamiento documentado; para inferencia en simulacion bastan GPUs de 16 GB o mas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Con pesos en fp32, una RTX 4090 de 24 GB deberia poder alojarlos teoricamente, pero el requisito real depende tambien del entorno de simulacion (Isaac Lab), que exige su propia VRAM para la fisica y el renderizado.
- Opciones de despliegue: el repositorio del autor usa Isaac-GR00T (Apache-2.0) con `scripts/policy_server.py` y una configuracion de modalidad propia (`scripts/brainco_config.py`) y el tag de embodiment `NEW_EMBODIMENT`, escuchando en el puerto 5612. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput estimados: no disponible. La frecuencia de control objetivo es de 20 Hz con fisica a 120 Hz en Isaac Lab, y los ensayos de evaluacion se prolongan hasta 1050 pasos de control.
- Entorno de ejecucion: simulacion exclusivamente. El autor indica explicitamente que todo el trabajo es en simulacion y que no se ejecuto nada en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sudarshan18/gr00t-n17-g1-brainco-handover | 3,144 mil millones | Handover bimanual con manos Brainco Revo2 sobre Unitree G1 | no disponible | 10/50 en la bateria de evaluacion | NVIDIA Open Model License | Publico en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Sudarshan18/gr00t-n17-g1-dex3-handover | no disponible (deriva de GR00T N1.7-3B) | Handover bimanual con manos Unitree Dex3; ancho de accion de 28 valores | no disponible | Nivel de referencia similar al del modelo Brainco, segun el autor | NVIDIA Open Model License | Publico en HuggingFace |
| Retargeting sin entrenamiento (Dex3 sobre manos Brainco) | No aplica | Misma tarea, sin ajuste fino | No aplica | 0/50 ensayos, sin completar agarre | No aplica | Linea base descrita en la model card |
| nvidia/GR00T-N1.7-3B | ~3 mil millones | Modelo fundacional vision-lenguaje-accion para robotica general | no disponible | no disponible | NVIDIA Open Model License | Publico en HuggingFace |

## Limitaciones y advertencias

- Tasa de exito baja: 10 de 50 ensayos en total y 2 de cada 10 en la configuracion nominal, insuficiente para uso productivo sin mejoras adicionales.
- Sobreajuste a las condiciones de entrenamiento: con un objeto no visto (palo redondo) y con una pose inicial no vista el exito cae a 1 de 10 en cada caso.
- Sesgos conocidos: el modelo esta entrenado con 44 demostraciones scriptadas de un unico agarre y un unico tipo de objeto, por lo que reproduce ese sesgo de agarre y de geometria; no se documentan otros sesgos.
- Riesgo de fallo fisico: el autor describe que el cierre de la mano Dex3 hace que el pulgar baje desde arriba y vuelque el palo, un modo de fallo que puede reproducirse si se altera la configuracion de la mano.
- Ambito restringido: base fija, un solo robot (Unitree G1_29DoF) y un solo par de manos (Brainco Revo2); no hay evidencia de generalizacion a otras plataformas.
- Validez solo en simulacion: no se ha ejecutado en hardware real, por lo que existe una brecha sim-to-real no cuantificada.
- Limitaciones de idioma y contexto: no se documentan idiomas soportados ni longitud de contexto; el condicionamiento linguistico se reduce a una frase de tarea fija.
- Articulaciones no comandadas: las cinco articulaciones distales de cada dedo se derivan por software de su proximal segun la relacion de transmision, lo que reduce el control fino disponible.
- Licencia: los pesos derivan de NVIDIA GR00T N1.7-3B y se distribuyen bajo la NVIDIA Open Model License, no bajo una licencia abierta estandar; es necesario revisar sus terminos antes de cualquier uso comercial. El codigo Isaac-GR00T es Apache-2.0 y la descripcion del robot Brainco Revo2 proviene de `unitreerobotics/unitree_ros` bajo BSD-3-Clause.
- Reproducibilidad: el checkpoint no incluye el estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde este punto.
- Madurez: el modelo se publico y actualizo el 19 de septiembre de 2026 y no acumula descargas ni likes, por lo que no cuenta con validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sudarshan18/gr00t-n17-g1-brainco-handover
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint de referencia Dex3 del mismo autor: https://huggingface.co/Sudarshan18/gr00t-n17-g1-dex3-handover
- Codigo, evaluacion y documentacion: https://github.com/sudarshan-sridhar/g1-dex3-to-brainco-handover
- Licencia NVIDIA Open Model License: https://developer.nvidia.com/downloads/assets/cuda/files/nvidia-open-model-license.pdf
- Descripcion del robot Brainco Revo2 (procedente de `unitreerobotics/unitree_ros`, BSD-3-Clause): https://github.com/unitreerobotics/unitree_ros

Nota: los resultados de la busqueda web proporcionada no contenian informacion relevante sobre el modelo (eran paginas de ayuda de Google y foros sin relacion), por lo que no se ha utilizado ninguno de ellos como fuente.
