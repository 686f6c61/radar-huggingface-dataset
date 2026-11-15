# yangkaixing/ACE-Dance-Training-Snapshot-20261114

## Resumen

ACE Dance Training Snapshot 2026-11-14 es un conjunto de pesos intermedios (checkpoints) para generación de movimiento de baile reactivo y condicionado por música, publicado por el usuario yangkaixing en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de generación de movimiento (motion generation) orientado a la síntesis de coreografías de pareja, donde un "líder" y un "seguidor" generan movimiento de forma coordinada a partir de una pista musical o del movimiento del compañero.

El repositorio contiene cuatro tareas diferenciadas: dos modelos de música a movimiento (music_to_leader y music_to_follower), entrenados durante 200 épocas y 4.400 actualizaciones, y dos modelos reactivos (reactive_l2f y reactive_f2l), que generan el movimiento de un rol a partir del movimiento del otro, con 1.700 y 1.610 épocas respectivamente. Adicionalmente incluye checkpoints de estudiante AnyFlow Reactive (ONLINE y EMA) con 242 épocas y unas 31.000 actualizaciones sobre un objetivo de 64.000.

La relevancia de esta publicación es limitada y de carácter interno: el propio autor la describe como "interim models for collaborator testing", con el test final de 95 casos aún pendiente y los procesos de entrenamiento todavía en curso. No hay información sobre arquitectura, licencia, idiomas ni benchmarks públicos, y el repositorio no registra descargas ni interacciones. Es material de trabajo para el ecosistema ACE (AnyDuet), no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de movimiento; runtime ACE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model_state_dict` (PyTorch), con normalizador y configuración adjuntos; `shape-normalizers.json`; sidecar SHA-256 por modelo |
| Tamano del repositorio | 2,7 GB |
| Libreria | pytorch |
| Tareas incluidas | music_to_leader, music_to_follower, reactive_l2f, reactive_f2l |
| Estado de entrenamiento | intermedio (search_candidate / in_training) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El material describe un sistema de generación de movimiento organizado por roles: los modelos `l2f` toman el líder (raw actor 1) y generan el seguidor (raw actor 0), mientras que `f2l` invierte esos roles. Los modelos musicales se seleccionaron de forma independiente por rol usando el menor FID_k de validación entre los checkpoints evaluados en la época más alta disponible, con la búsqueda todavía en ejecución en el momento de la exportación.

El entrenamiento se estructura en dos familias. Los modelos music_to_leader y music_to_follower completaron 200 épocas y 4.400 actualizaciones cada uno, en etapa `search_candidate`, con 20 casos de validación RAW. Los modelos reactivos alcanzaron 1.700 y 1.610 épocas (35.700 y 33.814 actualizaciones) y siguen `in_training`, con validación pendiente. Los checkpoints de estudiante AnyFlow Reactive (direcciones líder a seguidor y seguidor a líder) llevan 242 épocas y unas 31.000 actualizaciones sobre un objetivo de 64.000, e incluyen pesos ONLINE y EMA. No se distribuye estado de optimizador ni de recuperación de entrenamiento.

El pipeline exige cargar el runtime ACE correspondiente al rol y el codec de tarea específico, además de los paquetes de datos de entrenamiento enlazados (con controles de acceso separados). Para los modelos musicales, el autor indica usar `shape-normalizers.json` para estandarizar los 16 coeficientes de forma objetivo, colocarlos en el slot 1 y fijar el slot 0 a cero.

## Capacidades

- Generación de movimiento de baile condicionada por música (music_to_leader y music_to_follower).
- Generación reactiva de movimiento: dado el movimiento de un rol, sintetizar el del compañero (reactive_l2f y reactive_f2l).
- Coordinación de pareja bidireccional mediante modelos separados por dirección.
- Estandarización de coeficientes de forma (16 dimensiones) mediante normalizadores incluidos.
- Checkpoints de estudiante AnyFlow Reactive con pesos ONLINE y EMA para evaluación comparativa.
- No se documentan capacidades de texto, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Evaluación interna de investigación en generación de danza: los checkpoints permiten a colaboradores medir FID_k por rol sobre los 20 casos de validación RAW antes del test final de 95 casos.
- Desarrollo de sistemas de coreografía asistida por ordenador: los modelos music_to_leader y music_to_follower pueden integrarse en herramientas que propongan movimientos de pareja sincronizados con una pista musical.
- Animación de avatares en entornos virtuales: la generación reactiva l2f/f2l permite que un avatar seguidor reaccione al movimiento de un usuario líder en tiempo de ejecución.
- Investigación en interacción humano-máquina corporal: los modelos reactivos sirven para estudiar la coordinación motora entre dos agentes generativos.
- Benchmarking de métodos de generación de movimiento: el snapshot proporciona un punto de comparación reproducible con normalizadores y sidecars SHA-256 para verificar integridad de pesos.
- Prototipado de experiencias interactivas de baile: combinando el modelo musical con el reactivo, un sistema puede iniciar una secuencia desde la música y continuar de forma reactiva según el movimiento del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de seguimiento del entrenamiento (épocas, actualizaciones, etapa y cobertura de validación), junto con el criterio de selección basado en el menor FID_k de validación. El test final de 95 casos figura como pendiente.

| Tarea | Epocas | Actualizaciones | Etapa | Validacion RAW |
|---|---:|---:|---|---|
| music_to_leader | 200 | 4.400 | search_candidate | 20 casos |
| music_to_follower | 200 | 4.400 | search_candidate | 20 casos |
| reactive_l2f | 1.700 | 35.700 | in_training | pendiente |
| reactive_f2l | 1.610 | 33.814 | in_training | pendiente |
| AnyFlow l2f (estudiante) | 242 | 31.011 | en curso | objetivo 64.000 actualizaciones |
| AnyFlow f2l (estudiante) | 242 | 31.022 | en curso | objetivo 64.000 actualizaciones |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (2,7 GB) incluye pesos, normalizadores y configuraciones de varias tareas, pero no se especifica el número de parámetros ni el consumo en memoria por modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente mediante el runtime ACE y el codec de tarea correspondiente al rol; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de checkpoints intermedios de un proyecto de investigación privado (ACE/AnyDuet) sin benchmarks públicos, licencia declarada ni métricas finales, por lo que una comparación cuantitativa con alternativas de generación de movimiento no es posible con los datos disponibles.

## Limitaciones y advertencias

- Modelos intermedios: el autor los describe explícitamente como "interim models for collaborator testing"; no son versiones finales ni aptas para producción.
- Entrenamiento incompleto: los modelos reactivos siguen en entrenamiento y los estudiantes AnyFlow están a unas 31.000 de 64.000 actualizaciones objetivo.
- Validación parcial: solo 20 casos RAW por modelo musical; el test final de 95 casos está pendiente.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones, lo que impide evaluar su viabilidad legal en productos.
- Dependencia de acceso: los paquetes de datos de entrenamiento asociados tienen controles de acceso separados, por lo que el modelo no es utilizable sin permisos sobre ellos.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no aplica el marco de LLM, pero tampoco se documentan sesgos en los datos de movimiento ni cobertura demográfica.
- Requiere runtime específico: la carga exige el runtime ACE y el codec de tarea por rol; no hay interoperabilidad documentada con otras herramientas.
- Integridad: debe conservarse el sidecar SHA-256 adjunto a cada modelo para verificar los pesos.
- Sin métricas de rendimiento publicadas: no es posible estimar calidad final, latencia ni robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yangkaixing/ACE-Dance-Training-Snapshot-20261114
- Paquete de datos de entrenamiento (líder): https://huggingface.co/datasets/XLTMLTC/ace-anyduet-leader-three-tasks-20261111/tree/087c6c61dc801fa46f4472c5d7536fbf9657bddf
- Paquete de datos de entrenamiento (seguidor): https://huggingface.co/datasets/xlt99/ace-anyduet-follower-three-tasks-20261111/tree/7f2ff6fb95fe57f1f3f547e78a78cf1512c459af
