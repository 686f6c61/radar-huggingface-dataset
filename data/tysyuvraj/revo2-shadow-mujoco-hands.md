# tysyuvraj/revo2-shadow-mujoco-hands

## Resumen

`tysyuvraj/revo2-shadow-mujoco-hands` no es un modelo de lenguaje ni una red neuronal entrenada, sino un paquete de activos de simulacion fisica: dos escenas MuJoCo (MJCF) listas para ejecutar que representan manos diestras de cinco dedos flotando libremente sobre una mesa con objetos agarrables. La escena principal reproduce la mano BrainCo Revo2, la misma que monta el robot humanoide Unitree G1, con 11 articulaciones y 11 actuadores de posicion; la segunda escena replica la Shadow Hand con 20 actuadores, incluida a modo de comparacion. El paquete esta pensado para investigacion en teleoperacion con guante de datos, donde cinco valores de "curl" (uno por dedo) se mapean de forma limpia sobre las articulaciones de la mano.

El problema que resuelve es de infraestructura: reconstruir una mano diestra en MuJoCo a partir de un URDF upstream es propenso a errores sutiles (fusion de links estaticos, mallas de colision a resolucion visual, servos que oscilan por inercias minusculas). El autor documenta explicitamente las tres trampas que le costaron tiempo y entrega las escenas ya corregidas, autosuficientes (un XML mas su directorio `meshes/` por carpeta) y verificadas contra MuJoCo 4.0.1.

Es relevante ahora porque la teleoperacion de manos diestras con guantes y la evaluacion de politicas de manipulacion en simulador son pasos previos habituales al despliegue en humanoides comerciales como el G1. La licencia Apache-2.0 y la ausencia de activos no publicos facilitan su reutilizacion. El tamano del repositorio es de 0.0 GB segun los metadatos de Hugging Face, sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: escenas de simulacion fisica MuJoCo (MJCF), no red neuronal |
| Parametros totales | No disponible (no es un modelo entrenado) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | MJCF (`.xml`) mas mallas STL en `meshes/`; sin safetensors ni GGUF |

Especificaciones de las escenas incluidas:

| Metrica | `revo2` | `shadow` |
|---|---|---|
| `nq` (grados de libertad de configuracion) | 39 | 52 |
| `nu` (actuadores) | 11 | 20 |
| Bodies | 23 | No disponible |
| Mallas | 17 | 13 |
| Objetos en escena | Esfera de 3 cm, cubo de 2.2 cm, cilindro de 2.5 x 5 cm | Los mismos tres objetos |
| Entorno | Plano de suelo y mesa en `z = 0` | Plano de suelo y mesa en `z = 0` |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red. Cada escena es un arbol de cuerpos MuJoCo con un cuerpo raiz de mano que porta un joint libre y esta soldado (`weld`) a un cuerpo mocap llamado `hand_target`. El wrist se mueve escribiendo en `data.mocap_pos[0]` y `data.mocap_quat[0]`, de modo que cualquier fuente externa de pose de muneca (tracker, brazo lider, teclado) puede pilotar la mano sin tocar la cinematica. Los actuadores se nombran `act_<joint>` y su `ctrlrange` coincide con los limites articulares, lo que permite mapear un unico valor de curl por dedo sobre todas sus articulaciones.

La Revo2 modela 11 articulaciones: tres en el pulgar (metacarpiano, proximal y distal) y dos por cada uno de los dedos indice, corazon, anular y menique (proximal y distal). La Shadow Hand aporta 20 actuadores. El autor documenta tres decisiones tecnicas criticas para reconstruir el modelo desde el URDF upstream: cargar con `fusestatic = False` para que el link raiz no se fusione con el mundo y pueda alojar el joint libre; enmascarar los geoms de la mano con `contype=1, conaffinity=0` para que colisionen con los objetos pero no entre si (las mallas de colision son los STL visuales a resolucion completa y, sin este ajuste, los dedos se bloquean); y anadir `armature=5e-3` a las articulaciones de los dedos, ya que con inercias de ~1e-5 kg·m² y masas de ~10 g por eslabon un servo de posicion oscila o no llega. Con `armature=5e-3`, `kp=20` y `kv=1.0` el seguimiento queda por debajo del 0.1% del rango sin rizado.

## Capacidades

- Simulacion fisica de una mano diestra Revo2 de cinco dedos con 11 actuadores de posicion y de una Shadow Hand con 20 actuadores.
- Control de dedos mediante un unico valor de curl por dedo (0.0 extendido, 1.0 cerrado), mapeado sobre las articulaciones correspondientes.
- Control de la pose de la muneca mediante cuerpo mocap soldado al raiz de la mano, apto para teleoperacion con guante, tracker o brazo lider.
- Interaccion con tres objetos libres sobre mesa: esfera de 3 cm, cubo de 2.2 cm y cilindro de 2.5 x 5 cm.
- Renderizado headless con `mujoco.Renderer` y `MUJOCO_GL=egl` para servidores sin display.
- Visualizacion interactiva mediante `mujoco-studio` (escritorio o web en un puerto) y el visor clasico `python -m mujoco.viewer`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision artificial, tool calling ni agentes.

## Casos de uso

- Teleoperacion con guante de datos: el mapeo de cinco valores de curl a 11 articulaciones convierte la escena en el banco de pruebas natural para retargeting de guantes; se leen las lecturas del guante, se normalizan a [0, 1] por dedo y se escriben en `data.ctrl` mediante la funcion `set_curl` documentada.
- Evaluacion de politicas de agarre en simulacion: la escena incluye objetos de geometria conocida y una mesa a `z = 0`, de modo que una politica de manipulacion puede entrenarse o evaluarse contra condiciones reproducibles antes de transferir a hardware.
- Desarrollo de retargeting de muneca: el cuerpo mocap `hand_target` permite inyectar poses de un tracker o de un brazo lider y medir como responde la cinematica de la mano, util para calibrar convenciones de ejes y offsets.
- Comparacion de morfologias de mano: disponer de Revo2 (11 actuadores) y Shadow Hand (20 actuadores) en el mismo formato permite comparar estrategias de control, oposicion del pulgar y espacio de agarre bajo las mismas condiciones de escena.
- Docencia e investigacion en robotica: el paquete es autosuficiente y se abre con `pip install mujoco` y una sola orden, lo que reduce la friccion para ejercicios de cinematica, control de posicion y contacto en cursos de manipulacion.
- Generacion de datos sinteticos de agarre: ejecutando barridos de curl y de pose de muneca sobre los tres objetos se pueden etiquetar configuraciones exitosas y fallidas, utiles como datos de supervision para modelos de agarre.
- Validacion de pipelines de renderizado sin display: los renders del repositorio se produjeron de forma headless con EGL, lo que sirve de plantilla para generar imagenes en servidores de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta mediciones cualitativas y de seguimiento:

| Medicion | Resultado |
|---|---|
| Seguimiento de posicion con `armature=5e-3`, `kp=20`, `kv=1.0` | Error inferior al 0.1% del rango, sin rizado |
| Separacion pulgar-corazon a curl ~0.7 | Aproximadamente 4.5 cm, frente a los 6 cm de diametro de la esfera |
| Elevacion de la esfera con Shadow Hand | +0.124 m |
| Elevacion de la esfera con Revo2 | No lograda de forma fiable (la esfera se desplaza en lugar de quedar envuelta) |
| Centro de agarre Revo2 respecto al origen de la palma | Aproximadamente `(-0.03, -0.03, -0.084)` |

## Requisitos de hardware

- VRAM: no aplica; es simulacion fisica en CPU, no inferencia de red neuronal.
- Software: MuJoCo 4.0.1 (version contra la que se construyo y probo), instalable con `pip install mujoco`, que ademas instala `mujoco-studio`.
- GPU: no se especifica ninguna GPU recomendada; el renderizado headless se realizo con `MUJOCO_GL=egl`, lo que sugiere soporte de render por GPU en servidores, pero el autor no detalla modelos concretos (A100, H100, RTX 4090 u otros).
- Cabe en cualquier equipo de desarrollo convencional al tratarse de un modelo fisico de decenas de cuerpos y mallas STL; el repositorio ocupa 0.0 GB segun los metadatos.
- Despliegue: visor clasico (`python -m mujoco.viewer --mjcf=revo2_scene.xml`), `mujoco-studio` en escritorio o en modo web (`--gfx web --port 8080`), y uso programatico via API de Python (`mujoco.MjModel`, `mujoco.MjData`, `mujoco.mj_step`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Articulaciones / actuadores | Objetos en escena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tysyuvraj/revo2-shadow-mujoco-hands` | Escenas MuJoCo (Revo2 y Shadow) | 11 (Revo2) / 20 (Shadow) | Esfera 3 cm, cubo 2.2 cm, cilindro 2.5 x 5 cm | Apache-2.0 | Hugging Face |
| `google-deepmind/mujoco_menagerie` (Shadow Hand) | Activos MuJoCo upstream | 20 (Shadow) | No disponible en la informacion | No disponible en la informacion | Repositorio de DeepMind |
| `unitreerobotics/xr_teleoperate` (Revo2) | Activos y codigo de teleoperacion upstream | 11 (Revo2) | No disponible en la informacion | No disponible en la informacion | Repositorio de Unitree |

La comparativa se limita a los upstreams citados por el autor, ya que no se dispone de datos de otros paquetes equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La escena Revo2 sigue con precision las posiciones comandadas pero no agarra de forma autonoma y fiable la esfera: a curl ~0.7 las yemas de pulgar y corazon quedan a unos 4.5 cm mientras la esfera mide 6 cm de diametro, por lo que esta se desplaza en lugar de quedar envuelta. La direccion de aproximacion y la oposicion del pulgar requieren ajuste.
- La geometria de colision emplea las mallas visuales STL a resolucion completa; el autor la compensa enmascarando los geoms de la mano, pero cualquier modificacion de la escena debe preservar ese enmascaramiento o los dedos se bloquearan entre si.
- Los servos de posicion son sensibles a la inercia: sin `armature=5e-3` los dedos oscilan o no alcanzan la consigna. Cambiar ganancias sin revisar `armature` puede degradar el seguimiento.
- El directorio `meshes/` debe permanecer junto al XML, ya que `meshdir="meshes"` es relativo al fichero; ejecutar desde otra ruta sin usar ruta absoluta rompe la carga.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingues, de vision ni de agentes, y no admite cuantizacion ni despliegue en vLLM, llama.cpp, Ollama o TGI.
- Es una obra derivada modificada de activos de Unitree Robotics y de la Shadow Robot Company; el fichero `NOTICE` recoge la lista completa de cambios y creditos, y debe conservarse al redistribuir.
- No se han publicado datos de sesgos, alucinacion ni rendimiento medido en benchmarks; no aplican en el sentido habitual, pero tampoco hay validacion cuantitativa del realismo fisico mas alla de las mediciones citadas.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tysyuvraj/revo2-shadow-mujoco-hands
- Upstream de mallas y cinematica Revo2 (Unitree Robotics): https://github.com/unitreerobotics/xr_teleoperate
- Upstream de la Shadow Hand (Google DeepMind): https://github.com/google-deepmind/mujoco_menagerie
- Fichero `NOTICE` del repositorio: https://huggingface.co/tysyuvraj/revo2-shadow-mujoco-hands/blob/main/NOTICE
- Escena Revo2: https://huggingface.co/tysyuvraj/revo2-shadow-mujoco-hands/blob/main/revo2/revo2_scene.xml
- Escena Shadow: https://huggingface.co/tysyuvraj/revo2-shadow-mujoco-hands/tree/main/shadow
