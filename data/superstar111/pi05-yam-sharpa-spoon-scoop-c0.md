# Superstar111/pi05-yam-sharpa-spoon-scoop-c0

## Resumen

El modelo `Superstar111/pi05-yam-sharpa-spoon-scoop-c0` es una política vision-language-action (VLA) derivada de π0.5, el modelo base desarrollado por Physical Intelligence, y ajustada mediante la librería openpi para una tarea robótica concreta: coger una cuchara y servir judías con un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. Se trata de un "student" de dos habilidades entrenado exclusivamente en simulación con Isaac Lab y que, según el autor, todavía no se ha ejecutado en el robot real.

El modelo se publica como continuación del checkpoint de la ronda (paso 5999) durante 3000 pasos adicionales, con una tasa de aprendizaje que calienta hasta 2,5e-5 y decae hasta 5e-6. Funciona como control del run A del mismo autor, que añade 328 demostraciones de scoop reetiquetadas. El repositorio ocupa 12,4 GB e incluye el checkpoint de openpi, el código fuente en el commit de entrenamiento, el tokenizador, un script de servicio por websocket, un fichero de verificación conocido (`golden.npz`) y los listados sha256.

La relevancia es acotada: no es un modelo de propósito general sino un artefacto de investigación reproducible para una tarea de manipulación concreta, con métricas de éxito en simulación y un protocolo de despliegue bien definido (cámaras, estado articular, prompt y formato de acciones). Resulta útil para quien trabaje con openpi, π0.5 o pipelines de imitación con manos diestras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π0.5 de Physical Intelligence, ajustada con openpi) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint openpi en precisión de entrenamiento; se sirve con `serve_policy.py`) |
| Idiomas soportados | no disponible (prompts en inglés: `pick up the spoon`, `scoop the beans`) |
| Licencia | no disponible (el modelo base π0.5 se rige por los términos de openpi) |
| Formato de pesos | checkpoint openpi (`params/` + norm stats en `assets/local/main_hcw_nom_n300/`), más bundle con `openpi_src.tar.gz` y `openpi_data.tar.gz` |

## Arquitectura y entrenamiento

El modelo es una política π0.5 (familia VLA de Physical Intelligence) ajustada con openpi sobre un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones. La configuración de entrenamiento es `pi05_maggie_2skill_hcw_nojit`, con tres vistas: cámara de cabeza (`observation/image`), cámara de muñeca derecha (`observation/wrist_image`) y cámara al final de la mesa (`observation/image2`), cada una uint8 de (160, 284, 3) tras una ida y vuelta JPEG de calidad 90.

El entrenamiento se realizó íntegramente en simulación (Isaac Lab) y parte del checkpoint de la ronda en el paso 5999, continuando 3000 pasos adicionales solo con las demostraciones del planificador de la ronda, con calentamiento de learning rate hasta 2,5e-5 y decaimiento hasta 5e-6. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO; al ser una política de imitación, el paradigma esperable es aprendizaje por imitación supervisada, pero no se confirma explícitamente.

La interfaz de inferencia está bien especificada: entrada con estado de 28 ángulos articulares medidos (rad) y `observation/previous_command_rad` (últimos objetivos aceptados), y salida `actions` de forma (10, 28) a 10 Hz, donde las seis columnas del brazo son offsets respecto al último objetivo aceptado y las 22 de la mano son absolutas. El montaje de la mano importa: en el soporte girado del rig, la articulación 6 lee 90 grados más para la misma pose, por lo que hay que restar 90 grados a la articulación 6 en `observation/state` y `observation/previous_command_rad`; las salidas del brazo, al ser offsets, no requieren cambio.

## Capacidades

- Ejecución de dos habilidades encadenadas sobre una política única: "pick up the spoon" y "scoop the beans".
- Control de un brazo de 6 grados de libertad más una mano de 22 articulaciones (28 dimensiones en total) a 10 Hz.
- Percepción multi-vista: cámara de cabeza, cámara de muñeca derecha y cámara al final de la mesa.
- Condicionamiento por prompt de lenguaje para seleccionar la habilidad.
- Predicción de secuencias de 10 acciones (chunks) por consulta, con ejecución parcial configurable (2 o 5 filas por consulta).
- Consumo de estado propioceptivo (ángulos articulares medidos) y del último comando aceptado para producir offsets relativos en el brazo.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, visión general, audio ni modo thinking; es una política robótica, no un modelo conversacional.

## Casos de uso

- Investigación en imitación con manos diestras: el checkpoint sirve como referencia reproducible para comparar variantes de entrenamiento (el run C0 es el control frente al run A con datos reetiquetados), usando las métricas de simulación publicadas como línea base.
- Evaluación de políticas VLA en simulación: con 25 escenas de validación aleatorizadas y 10 disposiciones nominales, el modelo permite medir éxito de scoop y transporte de judías fuera de la bandeja bajo distintas configuraciones de ejecución (2 o 5 filas por consulta).
- Punto de partida para ajuste fino en tareas de cocina o serving: al estar entrenado con openpi y un config concreto (`pi05_maggie_2skill_hcw_nojit`), se puede continuar el entrenamiento con demostraciones propias del mismo rig.
- Despliegue de referencia con openpi: el bundle incluye `serve_vla.sh`, que sirve el checkpoint por websocket con `scripts/serve_policy.py`, útil para integrar la política en un stack de control existente.
- Verificación de integridad en pipelines de robótica: los listados sha256 del checkpoint y del bundle, junto con `golden.py` y `golden.npz`, permiten comprobar que un servidor recién arrancado devuelve las mismas respuestas que el servidor de referencia antes de conectar el robot.
- Estudio de robustez ante cambios de montaje: la guía de corrección de la articulación 6 para el soporte girado permite probar la misma política en dos configuraciones mecánicas del rig sin reentrenar.
- Docencia y reproducción de experimentos VLA: el repositorio empaqueta código fuente, tokenizador, script de servicio y datos de verificación, lo que facilita reproducir el entorno de inferencia en una GPU NVIDIA con unos 10 GB libres.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en simulación (no en robot real):

| Escenario | Filas ejecutadas por consulta | Run C0 (este modelo) | Run 1 (punto de partida) | Run A (con 328 scoops reetiquetados) |
|---|---|---|---|---|
| 25 escenas de validación aleatorizadas, muestra 1 (judías fuera de la bandeja) | 2 | 14/25 | 7/25 | 14/25 |
| 25 escenas de validación aleatorizadas, muestra 2 (judías fuera de la bandeja) | 2 | 12/25 | 8/25 | 14/25 |
| 10 disposiciones nominales | 2 | 7/10 | no disponible | no disponible |
| 10 disposiciones nominales | 5 | 9/10 | no disponible | no disponible |
| 25 escenas de validación aleatorizadas, muestra 1 | 5 | 15/25 | no disponible | 19/25 |

La segunda muestra a 5 filas por consulta está en evaluación según la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB libres en GPU NVIDIA, según indica la model card para `serve_vla.sh`.
- GPU recomendadas: no se especifican modelos concretos; el requisito documentado es una GPU NVIDIA con unos 10 GB libres. Por capacidad, encajan tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090, A4000, L4, A10) y, por supuesto, A100/H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas NVIDIA de 12-16 GB o más, siempre que se cumpla el requisito de unos 10 GB libres; no se documenta una prueba explícita en GPU de consumo.
- Despliegue: openpi con `scripts/serve_policy.py` a través de `serve_vla.sh` (websocket en el puerto indicado, por ejemplo 8000); requiere `uv` y la primera ejecución construye el entorno de openpi. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de las acciones generadas (10 Hz) y el tamaño del chunk (10 acciones), con ejecución parcial de 2 o 5 filas por consulta.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/pi05-yam-sharpa-spoon-scoop-c0` | π0.5 ajustada (openpi) | Pick up spoon + scoop beans, YAM Ultra 2 + Sharpa Wave | 10 acciones a 10 Hz | no disponible | Hugging Face, 12,4 GB, 0 descargas |
| `Superstar111/pi05-yam-sharpa-spoon-scoop-runA` | π0.5 ajustada (openpi) | Misma tarea, con 328 scoops reetiquetados | 10 acciones a 10 Hz | no disponible | Hugging Face (mismo autor) |
| `pi05_base` (Physical Intelligence) | π0.5 base | Política VLA general | no disponible | términos de openpi | openpi (GitHub) |

No se dispone de datos de rendimiento de `pi05_base` ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Entrenado solo en simulación (Isaac Lab) y no ejecutado todavía en el robot real; el rendimiento en hardware físico es desconocido.
- Tarea muy restringida: dos habilidades ("pick up the spoon", "scoop the beans") sobre un rig concreto (YAM Ultra 2 + Sharpa Wave de 28 articulaciones); no es un modelo general.
- Dependencia del montaje de la mano: en el soporte girado hay que corregir la articulación 6 restando 90 grados en el estado y en el comando previo; obviarlo degrada o invalida la política.
- Sensibilidad a la configuración de ejecución: los resultados varían notablemente entre 2 y 5 filas por consulta (por ejemplo, 14/25 frente a 15/25 en la muestra 1 de validación, y 7/10 frente a 9/10 en disposiciones nominales).
- Licencia no disponible en la información proporcionada; el modelo base se rige por los términos de openpi, por lo que el uso comercial debe verificarse en dichos términos antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no documentados; al ser una política de imitación, el riesgo principal es la generalización fuera de la distribución de las demostraciones y de las escenas simuladas.
- Idiomas: solo se documentan prompts en inglés; no hay soporte multilingüe declarado.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; madurez y soporte de la comunidad muy limitados.
- La segunda muestra de validación a 5 filas por consulta está pendiente de evaluación según la model card, por lo que las cifras publicadas son parciales.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-c0
- Run A (comparación): https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-runA
- openpi (GitHub): https://github.com/Physical-Intelligence/openpi
