# Tinghong-Ye22/code-Psi0-yth-v24

## Resumen

Ψ₀ (Psi0) es un modelo fundacional abierto de tipo vision-language-action (VLA) orientado a la manipulacion y locomocion (loco-manipulation) diestra en robots humanoides. Lo desarrolla el Physical Superintelligence Lab (PSI Lab) de la University of Southern California, con contribuciones de investigadores de Stanford, y se distribuye oficialmente en el repositorio USC-PSI-Lab/psi-model junto con el dataset USC-PSI-Lab/psi-data y el codigo en GitHub.

La ficha que se analiza aqui corresponde al repositorio Tinghong-Ye22/code-Psi0-yth-v24, una copia publicada por un tercero que reutiliza la model card oficial. Sus metadatos indican 0 descargas, 0 likes, licencia no declarada y un tamano de repositorio de 0,2 GB, insuficiente para contener los pesos completos de un modelo de este tamano (el backbone solo ya ronda los 2 B de parametros en fp16), por lo que debe tratarse como un espejo de codigo o documentacion y no como la distribucion canonica del modelo.

El interes de Ψ₀ radica en su enfoque de entrenamiento: aprende semantica de tarea y representacion visual a partir de videos egocentricos humanos a gran escala y despues se post-entrena con una cantidad reducida de datos de teleoperacion real, de modo que puede adquirir nuevas habilidades de loco-manipulacion con tan solo 80 trayectorias de ajuste fino. La arquitectura combina un backbone vision-lenguaje Qwen3-VL-2B-Instruct (System-2), un action expert difusor multimodal de flujo de aproximadamente 500 M de parametros (System-1) y un controlador de tracking basado en RL (System-0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA jerarquica de tres niveles: backbone vision-lenguaje (System-2) + diffusion transformer multimodal de flujo para acciones (System-1) + controlador de tracking con RL (System-0) |
| Parametros totales | ≈2,5 B (2 B del backbone Qwen3-VL-2B-Instruct + ≈500 M del action expert, segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingue, pero la model card no declara idiomas) |
| Licencia | la model card incluye un badge Apache 2.0; los metadatos de HuggingFace de este repositorio indican "no disponible" |
| Formato de pesos | no disponible (el repositorio ocupa 0,2 GB, incompatible con los pesos completos en fp16) |

## Arquitectura y entrenamiento

Ψ₀ se organiza en tres componentes entrenados de extremo a extremo. El nivel superior (System-2) es un backbone vision-lenguaje basado en Qwen3-VL-2B-Instruct que extrae caracteristicas de las observaciones visuales y de las instrucciones en lenguaje natural. Esas caracteristicas condicionan el nivel intermedio (System-1), un diffusion transformer multimodal basado en flujo e inspirado en Stable Diffusion 3, con aproximadamente 500 M de parametros, que predice bloques (chunks) de acciones de cuerpo completo. En el nivel inferior (System-0), un controlador de tracking basado en aprendizaje por refuerzo ejecuta los comandos de la parte inferior del cuerpo, aportando estabilidad y precision fisica. La prediccion por chunks y la fusion de representaciones visuales, linguisticas y de accion son las claves tecnicas del diseno.

El entrenamiento es en dos fases: una pre-etapa con videos egocentricos humanos a gran escala para adquirir semantica de tarea y representacion visual, seguida de un post-entrenamiento con datos reales de teleoperacion de robot para aprender la dinamica general del cuerpo. Los datos de teleoperacion se recogen con Apple Vision Pro sobre un Unitree G1 con dos manos Dex3-1 y se convierten al formato LeRobot. El resultado declarado es que el modelo adquiere nuevas habilidades de loco-manipulacion diestra de horizonte largo con ajustes finos de tan solo 80 trayectorias. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Prediccion de acciones de cuerpo completo en bloques para robot humanoide, integrando vision, lenguaje y accion en un unico modelo.
- Loco-manipulacion diestra: manipulacion con manos multi-dedo y desplazamiento del cuerpo, sobre el robot Unitree G1 con manos Dex3-1.
- Seguimiento de instrucciones en lenguaje natural para definir tareas de manipulacion.
- Aprendizaje de nuevas habilidades con ajuste fino de muy pocos datos: la model card declara adquisicion de habilidades de horizonte largo con 80 trayectorias.
- Ejecucion fisica estable mediante controlador de tracking con RL (System-0).
- Evaluacion en simulacion a traves del entorno SIMPLE, con generacion de datos y ajuste fino simulados.
- Comparacion con una bateria de baselines VLA y de imitacion: GR00T N1.6, OpenPi π0.5, InternVLA-M1, H-RDT, EgoVLA, Diffusion Policy y ACT.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso en el sentido de software: no disponible.
- Capacidades de vision, audio o thinking mode en el sentido de un LLM multimodal generico: no disponible.

## Casos de uso

- Investigacion en modelos fundacionales VLA: Ψ₀ sirve como base abierta para estudiar la transferencia de videos egocentricos humanos a politicas de robot, con la ventaja de que el pipeline de pre-entrenamiento y post-entrenamiento es reproducible segun la documentacion del proyecto.
- Ajuste fino para nuevas tareas de manipulacion: un laboratorio con un Unitree G1 puede recoger 80 trayectorias teleoperadas de una tarea nueva y ajustar el modelo para obtener una politica especifica, reduciendo el coste de recogida de datos frente a entrenar desde cero.
- Manipulacion diestra con manos multi-dedo: tareas de agarre y reorientacion de objetos que requieren dedos articulados (manos Dex3-1), donde el action expert predice chunks de acciones coordinadas de brazo y mano.
- Loco-manipulacion con desplazamiento: tareas combinadas como abrazar y mover una caja, en las que el modelo debe coordinar el movimiento de la base con la manipulacion, usando los comandos de la parte inferior del cuerpo ejecutados por el controlador RL.
- Recoleccion y curacion de datos de teleoperacion: el repositorio publica la guia de teleoperacion con Apple Vision Pro y el conversor de datos crudos a formato LeRobot, util para equipos que quieran construir sus propios datasets de robot.
- Evaluacion comparativa de politicas VLA: el proyecto incluye baselines integrados en un mismo stack de codigo, lo que permite medir de forma homogenea el rendimiento de Ψ₀ frente a Diffusion Policy, ACT, GR00T N1.6 o OpenPi π0.5.
- Desarrollo en simulacion antes del despliegue real: el entorno SIMPLE permite generar datos, ajustar el modelo y evaluar en simulacion, reduciendo el riesgo de pruebas directas con hardware humanoide costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada del recuento de parametros, no confirmada por el autor): en fp16, entre 6 y 12 GB contando pesos (≈5 GB para 2,5 B) y sobrecarga de activaciones; en cuantizacion int8, en torno a 3-5 GB; en int4, en torno a 2-3 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU de 16-24 GB (RTX 4090, L4, A10G) seria suficiente para inferencia en fp16 del backbone de 2 B, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12 GB o mas segun la estimacion anterior, aunque no esta confirmado por el fabricante del modelo.
- Opciones de despliegue: el proyecto usa gestion de dependencias con `uv`, el stack compartido de LeRobot y `flash_attn==2.7.4.post1`; la documentacion cubre ajuste fino, evaluacion en lazo abierto y despliegue sobre Unitree G1. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y estos no serian aplicables directamente al tratarse de un modelo de accion y no de un LLM de texto.
- Latencia y throughput: no disponible.
- Hardware adicional necesario para uso real: robot Unitree G1 con dos manos Dex3-1 y un dispositivo de teleoperacion (Apple Vision Pro) para la recogida de datos.

## Comparativa con modelos similares

La model card cita varios baselines integrados en el mismo stack de codigo, pero no aporta sus especificaciones ni resultados numericos. Los datos de la columna de Ψ₀ proceden de la model card; el resto figura como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ψ₀ (este modelo) | ≈2,5 B (2 B backbone + ≈500 M action expert) | no disponible | no disponible | badge Apache 2.0 en la model card; metadatos del repo sin licencia | repositorio oficial USC-PSI-Lab/psi-model; este repo es un espejo de 0,2 GB |
| GR00T N1.6 | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| OpenPi π0.5 | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| InternVLA-M1 | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| H-RDT | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| EgoVLA | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |
| ACT | no disponible | no disponible | no disponible | no disponible | citado como baseline en el proyecto |

## Limitaciones y advertencias

- Procedencia del repositorio: Tinghong-Ye22/code-Psi0-yth-v24 no es el repositorio oficial (USC-PSI-Lab/psi-model) y registra 0 descargas y 0 likes. El contenido de la model card corresponde al proyecto PSI Lab, pero la publicacion de este espejo no esta verificada por los autores.
- Pesos posiblemente ausentes: el repositorio ocupa 0,2 GB, un tamano incompatible con los pesos completos de un modelo de aproximadamente 2,5 B de parametros en fp16 (≈5 GB). No parece una distribucion utilizable para inferencia directa.
- Licencia ambigua: la model card muestra un badge Apache 2.0, pero los metadatos de HuggingFace de este repositorio no declaran licencia. Antes de un uso comercial debe confirmarse la licencia en el repositorio oficial.
- Dependencia de hardware concreto: el flujo documentado esta atado al robot Unitree G1 con manos Dex3-1 y a la teleoperacion con Apple Vision Pro. No se documenta soporte para otras plataformas roboticas.
- Ausencia de benchmarks publicos en la informacion disponible: no hay cifras de exito en tareas, tasas de exito en simulacion ni comparaciones numericas con los baselines citados, lo que impide evaluar su rendimiento relativo.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser un modelo de politica, el modo de fallo tipico no es un texto falso sino una accion fisica inestable o insegura en el robot; se requiere el controlador de tracking y validacion en simulacion antes del despliegue real.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse el comportamiento con instrucciones en castellano ni con instrucciones largas.
- Generalizacion limitada a las tareas entrenadas: aunque la model card afirma que basta con 80 trayectorias para nuevas habilidades, el alcance de esa generalizacion no esta cuantificado de forma publica.
- Sin datos de latencia ni de throughput: no es posible estimar si el modelo cumple requisitos de control en tiempo real sin medirlo en el hardware objetivo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Tinghong-Ye22/code-Psi0-yth-v24
- Modelo oficial: https://huggingface.co/USC-PSI-Lab/psi-model
- Dataset oficial: https://huggingface.co/datasets/USC-PSI-Lab/psi-data
- Paper (arXiv): https://arxiv.org/abs/2603.12263
- Pagina del proyecto: https://psi-lab.ai/Psi0
- Repositorio de codigo: https://github.com/physical-superintelligence-lab/Psi0
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (unicamente referencias a identidades trigonometricas de angulo doble), por lo que no se incluyen enlaces adicionales de esa busqueda.
