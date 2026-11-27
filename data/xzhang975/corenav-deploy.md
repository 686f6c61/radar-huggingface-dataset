# xzhang975/corenav-deploy

## Resumen

CoReNav es una política de navegación orientada a objetos (ObjectNav) diseñada para su despliegue en robots reales. A partir de una cámara RGB-D y odometría, el agente explora un espacio interior en busca de una de seis categorías de objetos (silla, cama, planta, inodoro, monitor de TV y sofá) y emite acciones discretas: avanzar 0,25 m, girar 30° o detenerse. Lo desarrolla el usuario xzhang975 y se distribuye como un único checkpoint de pesos PyTorch de 70 millones de parámetros.

El modelo resuelve el problema de la navegación guiada por objetivos semánticos en entornos domésticos, un caso clásico de IA encarnada (embodied AI). Su relevancia radica en que no es solo un artefacto de simulación: la model card y el repositorio asociado incluyen una interfaz de robot, convenciones de profundidad y odometría, y un puente ROS 2, lo que lo orienta explícitamente a la puesta en producción sobre hardware físico.

La arquitectura combina una política de imitación sobre una columna vertebral semántica (SemNav RGB + semántica) y un ajuste fino por aprendizaje por refuerzo con una recompensa con forma de modelo fundacional y un mapa semántico ligero (MapLite). El checkpoint publicado corresponde a 48 millones de fotogramas de entrenamiento en el simulador Habitat sobre el conjunto HM3D ObjectNav.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal (SemNav RGB + semántica) con mapa semántico ligero MapLite; entrada RGB-D + odometría |
| Parametros totales | 70 M (checkpoint `weights/ckpt24_deploy.pth`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control por pasos, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | hm3d-research (uso académico/no comercial según términos HM3D); código GPL-3.0 |
| Formato de pesos | PyTorch (`.pth`, carga con `weights_only=True`) |

## Arquitectura y entrenamiento

CoReNav es una política de control que consume imágenes RGB de 640 × 480 con 79° de campo de visión horizontal, mapas de profundidad en metros y la pose de odometría (x, y, yaw), y produce una de tres acciones discretas: avanzar 0,25 m, girar 30° o detenerse. La percepción semántica se apoya en el segmentador EoMT (`tue-mps/ade20k_semantic_eomt_large_512`, licencia MIT), que el código descarga por separado y que no forma parte del checkpoint publicado.

El entrenamiento se realizó en el simulador Habitat sobre HM3D ObjectNav. La primera fase es aprendizaje por imitación sobre una columna vertebral SemNav RGB + semántica; después se aplica un ajuste fino por aprendizaje por refuerzo con una recompensa con forma de modelo fundacional y un mapa semántico ligero denominado MapLite. El checkpoint distribuido acumula 48 millones de fotogramas de entrenamiento. La model card no detalla la composición exacta del dataset ni hiperparámetros de RL.

## Capacidades

- Navegación orientada a objetos en interiores: búsqueda activa de seis categorías (chair, bed, plant, toilet, tv_monitor, sofa).
- Percepción multimodal: fusión de RGB, profundidad métrica y odometría en cada paso de decisión.
- Control discreto de bajo nivel: acciones de avance (0,25 m), giro (30°) y parada.
- Construcción y uso de un mapa semántico ligero (MapLite) para razonamiento espacial a lo largo de la trayectoria.
- Interfaz de despliegue en robot real con puente ROS 2 y convenciones documentadas de cámara, profundidad y odometría.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no aplica en el sentido de LLM; el agente ejecuta un bucle de control paso a paso hasta `STOP`.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Robots de servicio en interiores: el agente puede recibir una instrucción de objeto ("chair") y navegar hasta encontrarlo, integrándose en plataformas móviles con cámara RGB-D y odometría.
- Asistentes domésticos de búsqueda: localización de objetos cotidianos (sofá, cama, planta) en viviendas para tareas de acompañamiento o entrega.
- Automatización en entornos de atención sanitaria o residencias: búsqueda de inodoros o sillas en instalaciones interiores, con la salvedad de que la licencia HM3D restringe el uso comercial.
- Investigación en IA encarnada: banco de pruebas reproducible sobre HM3D ObjectNav para comparar políticas de imitación + RL frente a alternativas.
- Prototipado con ROS 2: el puente incluido permite conectar la política a pilas robóticas existentes y validar el bucle percepción-acción en hardware real.
- Evaluación de segmentación semántica en línea: al depender de EoMT, sirve para medir el impacto de la calidad del segmentador en el éxito de la navegación.
- Docencia y demostraciones: el tamaño reducido del checkpoint (0,3 GB de repo) y sus 70 M de parámetros facilitan su despliegue en laboratorios con GPU modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 70 M de parámetros la política es ligera, pero el segmentador EoMT (variante large a 512) añade carga adicional que no se cuantifica en la model card.
- GPU recomendadas: no disponible; el ejemplo de uso emplea `device="cuda"`.
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada; por el tamaño del checkpoint es plausible, pero no se especifica.
- Opciones de despliegue: PyTorch nativo mediante el paquete `corenav_deploy` (instalación con `pip install -e .`), descarga de pesos con `huggingface-cli`, y puente ROS 2 documentado en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de ObjectNav ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Restricción de licencia: los pesos se entrenaron con HM3D y se ofrecen solo para investigación y uso no comercial bajo los términos de HM3D; el código es GPL-3.0.
- Ámbito limitado: solo seis categorías de objetos y entornos interiores tipo HM3D; no generaliza a otras clases sin reentrenamiento.
- Dependencia externa: requiere descargar por separado el segmentador EoMT, lo que añade una dependencia y posibles variaciones de rendimiento.
- Sin datos de benchmarks: no hay métricas publicadas de éxito, SPL ni latencia, lo que dificulta evaluar su idoneidad en producción.
- Configuración de cámara fija: la política asume 640 × 480, 79° de FOV y montaje a 0,88 m de altura; desviaciones pueden degradar el comportamiento.
- Idiomas y texto: no soporta instrucciones en lenguaje natural ni generación de texto; la tarea se especifica mediante categoría predefinida.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos del segmentador que induzcan navegación errónea.
- Sesgos: no documentados; al entrenarse en HM3D, puede heredar sesgos de distribución de escenas y objetos de ese dataset.
- Madurez: repositorio con 0 descargas y creado recientemente; sin evidencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/xzhang975/corenav-deploy
- Repositorio de código y despliegue: https://github.com/xiaopanz/corenav-deploy
- Segmentador EoMT: https://huggingface.co/tue-mps/ade20k_semantic_eomt_large_512
- Licencia HM3D: https://matterport.com/matterport-end-user-license-agreement-academic-use-model-data
