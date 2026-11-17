# tkpota/smolvla_so101_pour

## Resumen

SmolVLA SO-101 Pour es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario tkpota en Hugging Face. El modelo está especializado en tareas de vertido (pouring) ejecutadas con un robot bimanual SO-101 (`bi_so_follower`), con un espacio de estado y acción de 12 dimensiones (6 articulaciones por brazo) y captura a 30 fps.

El modelo parte de la arquitectura SmolVLA, un VLA compacto de aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors), diseñado para ejecutarse en hardware modesto y para el control de robots mediante imitación. Se ha entrenado durante 40.000 pasos con batch de 24 sobre 136 episodios de demostración (176.654 fotogramas) repartidos en cuatro tareas de vertido, con 17 episodios de validación.

Su relevancia es acotada: se trata de un experimento de ajuste fino de un modelo base abierto para una configuración robótica concreta, no de un modelo de propósito general. La model card indica explícitamente que la pérdida de validación es una pérdida de imitación y que la política aún no se ha evaluado en el robot real, por lo que no hay tasas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA de la familia SmolVLA integrado en la libreria LeRobot. La entrada combina tres flujos de imagen de 640x480 (camara superior, muneca izquierda y muneca derecha) con un vector de estado de 12 articulaciones (brazo izquierdo primero) y una instruccion de tarea en lenguaje natural. La salida es un vector de accion de 12 dimensiones correspondiente a las posiciones articulares del robot bimanual SO-101. No se detallan en la informacion disponible la composicion interna del transformer, el numero de tokens de contexto visual ni los detalles del encoder de lenguaje.

El entrenamiento consistio en 40.000 pasos con batch de 24 sobre 136 episodios (176.654 fotogramas) grabados a 30 fps con el robot `bi_so_follower`, con 17 episodios reservados para validacion repartidos uniformemente entre las cuatro tareas. La perdida de validacion bajo de 0,101 a los 2.500 pasos a 0,0457 a los 40.000 pasos y seguia descendiendo; la perdida de entrenamiento termino en 0,032. No se especifica si hubo RLHF, DPO ni otras fases de alineacion, ni se detalla la composicion del dataset mas alla de los episodios de vertido.

## Capacidades

- Control robótico por imitación para un robot bimanual SO-101 con 12 grados de libertad (estado y acción de 12 dimensiones).
- Ejecución de cuatro tareas de vertido condicionadas por prompt de texto en inglés: agua con el brazo derecho; matcha en polvo (tapa verde), te helado en polvo (tapa azul) y café en polvo (tapa roja) con el brazo izquierdo.
- Percepción multimodal a partir de tres cámaras simultáneas (vista superior y muñecas izquierda y derecha) a 640x480.
- Seguimiento de instrucciones en lenguaje natural para seleccionar la tarea entre las cuatro entrenadas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, visión general, audio ni modo de pensamiento; el modelo es una política de control, no un asistente conversacional.
- Capacidades multilingües: no disponibles; los prompts de tarea están definidos en inglés.

## Casos de uso

- Manipulación bimanual de laboratorio: reproducción de la secuencia de vertido de líquidos y polvos en un entorno controlado con el SO-101, usando los prompts de tarea definidos para seleccionar la acción.
- Investigación en imitación robótica: servir como punto de partida para estudiar el ajuste fino de SmolVLA sobre un robot de bajo coste y comparar pérdidas de imitación entre configuraciones.
- Recolección y evaluación de políticas VLA: integrarse en pipelines de LeRobot para validar la transferencia de un modelo base a una tarea concreta antes de desplegarlo en hardware.
- Automatización de tareas repetitivas de dos brazos en un banco de pruebas: el modelo coordina ambos brazos con un vector de acción conjunto de 12 dimensiones, adecuado para secuencias donde un brazo sostiene y el otro vierte.
- Docencia y prototipado en robótica: al ser un modelo compacto de 450 M de parámetros y un repositorio de 0,9 GB, es viable para experimentos en equipos con recursos limitados.
- Base para nuevos ajustes finos: sus pesos pueden reentrenarse con demostraciones adicionales del mismo robot para ampliar el repertorio de tareas de vertido o de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de imitación (validación de 0,101 a 2.500 pasos y 0,0457 a 40.000 pasos; entrenamiento final de 0,032) y advierte que no se ha evaluado la tasa de éxito en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 450 M de parámetros, los pesos en precisión completa ocupan aproximadamente 1,8 GB y en FP16 unos 0,9 GB, sin contar el coste de los tres flujos de imagen a 640x480.
- GPU recomendadas: no disponibles; no se especifican requisitos en la model card.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros sería plausible en GPUs de consumo con suficiente memoria, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el canal habitual para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tkpota/smolvla_so101_pour | 450.046.176 | no disponible | Vertido bimanual SO-101 | no disponible | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA general base | no disponible | Hugging Face (modelo base) |
| Otras políticas VLA de la familia LeRobot | no disponible | no disponible | Control robótico diverso | no disponible | no disponible |

La comparacion se limita al modelo base declarado; no se dispone de datos de rendimiento de alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La política no se ha evaluado en el robot real: no hay tasas de éxito ni métricas de tarea publicadas.
- La pérdida de validación es una pérdida de imitación, no una medida de éxito; un valor bajo no garantiza que el vertido funcione.
- El modelo está entrenado exclusivamente para cuatro tareas de vertido con un SO-101 bimanual concreto; no generaliza a otras tareas, objetos, cámaras ni robots sin reentrenamiento.
- Los prompts de tarea están en inglés y definidos de forma literal; variaciones en la redacción pueden no corresponder a ninguna tarea entrenada.
- Depende de la configuración exacta de tres cámaras (superior, muñeca izquierda y muñeca derecha) a 640x480 y de un estado de 12 articulaciones con el brazo izquierdo primero.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación y sesgos: no aplica en el sentido de generación de texto, pero sí existe riesgo de ejecutar acciones incorrectas o inseguras en el robot ante entradas fuera de distribución.
- No se documentan cuantizaciones ni requisitos de hardware, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkpota/smolvla_so101_pour
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
