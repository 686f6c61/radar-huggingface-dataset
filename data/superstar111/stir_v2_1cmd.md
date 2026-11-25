# Superstar111/stir_v2_1cmd

## Resumen

π0.5 student of a coding agent's controller es una política de visión-lenguaje-acción (VLA) desarrollada por el usuario Superstar111 y publicada bajo el identificador `Superstar111/stir_v2_1cmd`. Se trata de un fine-tuning del modelo base π0.5 mediante la librería openpi de Physical Intelligence, orientado a control robótico de un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. El modelo ejecuta una tarea de manipulación doméstica completa en un único comando de lenguaje natural: coger la cuchara, servir garbanzos, verterlos en la olla y remover.

La relevancia del checkpoint reside en su planteamiento de episodio único: a diferencia de su gemelo `Superstar111/stir_v2`, que emplea un comando por etapa, este modelo recibe una sola instrucción para las cuatro fases (pickup, scoop, pour, stir) que se desarrollan a lo largo de 62,9 segundos y 629 observaciones a 10 Hz. El entrenamiento se realizó exclusivamente en simulación con Isaac Lab, y el autor indica explícitamente que el modelo no se ha ejecutado en el robot real.

El repositorio ocupa 12,4 GB y no incluye información sobre licencia, idiomas soportados ni resultados de evaluación cerrada, que según la model card están pendientes de publicación. Se trata, por tanto, de un artefacto de investigación en fase de validación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (openpi), config `pi05_maggie_2skill_hcw_nojit` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de la tarea esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (bundle de serving de openpi; repo de 12,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base π0.5 mediante openpi (commit eca022d), con semilla 43 y entrenamiento sobre NVIDIA H200. Los pesos publicados corresponden a la media móvil exponencial (EMA) en el paso 12099. La programación de pasos sigue la regla de "passes" del autor: la referencia de 6000 pasos sobre 93 600 filas equivale a 2,051 pasadas con batch 32, por lo que las 188 700 filas del dataset requieren 12 100 pasos para 2,052 pasadas, sin límite superior.

El dataset de entrenamiento, denominado `astra_sb_n300`, contiene 300 segmentos y 188 700 filas de la tarea `chain_pour_stir`, con tres vistas (head, wrist, cam1) renderizadas a 284 x 160 píxeles en simulación. Los datos provienen de un controlador profesor escrito por un agente de código (Codex, "Astra"), no de demostraciones humanas ni de un planificador scriptado; el profesor superó 25 de 25 arranques retenidos antes de la recolección y logró 381 de 390 episodios aceptados (332 de 340 en arranques de entrenamiento). Se reservaron 25 arranques de validación aparte.

La escena simulada (simulador dextool en 6b9c9d5) varía en cada arranque la altura del lecho de garbanzos (4,5 a 6,0 capas), el número de garbanzos sueltos (12 a 36) y la colocación de los objetos (hasta 20 mm y 5 grados de desplazamiento independiente). La evaluación se realiza con el evaluador del propio profesor (`evaluate_chain_pour_stir`), que impone criterios geométricos y de fuerza estrictos: agarre de potencia cerrado sobre el mango en al menos el 80 % de los fotogramas, 5 a 20 mm del extremo del mango libres, mano a al menos 30 mm de la mesa, presión sobre la olla de como máximo 5 N en cada observación, olla sin mover más de 5 mm y 5 grados, y desplazamiento mediano de los garbanzos en la olla de al menos 100 mm con el 90 % permaneciendo dentro.

## Capacidades

- Control robótico de visión-lenguaje-acción: genera acciones de control a partir de observaciones visuales (tres cámaras) e instrucciones en lenguaje natural.
- Ejecución de tareas de manipulación de múltiples etapas en un único comando: pickup, scoop, pour y stir dentro de un mismo episodio de 62,9 s.
- Control de una mano articulada de 28 articulaciones (Sharpa Wave) sobre un brazo YAM Ultra 2.
- Percepción visual multi-cámara: vistas head, wrist y cam1 a 284 x 160.
- Operación en lazo cerrado a 10 Hz (629 observaciones por episodio).
- Generalización a variaciones de escena: altura del lecho, número de garbanzos, orientación de la cuchara y desplazamiento de olla y bandeja.
- No se documentan capacidades de tool calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas ni audio.

## Casos de uso

- Investigación en políticas VLA de episodio único: el modelo sirve como referencia para estudiar si una sola instrucción de lenguaje natural puede sustituir a la segmentación por etapas, comparándolo directamente con su gemelo `stir_v2` entrenado con un comando por fase.
- Automatización de tareas de cocina en simulación: permite generar y evaluar cadenas de manipulación (coger, servir, verter, remover) en Isaac Lab antes de trasladar la política a hardware real.
- Benchmarking de evaluadores de tareas largas: el evaluador `evaluate_chain_pour_stir` con criterios de fuerza, colisión y desplazamiento de objetos puede usarse para medir la robustez de políticas generadas por imitación.
- Estudio de la destreza con manos articuladas: el modelo controla 28 articulaciones con restricciones de agarre de potencia, útil para analizar la calidad de agarre en políticas entrenadas por imitación.
- Generación de datos sintéticos de manipulación: la política puede emplearse como generador de trayectorias en simulación para aumentar datasets de entrenamiento con variaciones controladas de escena.
- Comparación de estrategias de instrucción: permite cuantificar la degradación o mejora al pasar de comandos por etapa a un comando único en tareas de horizonte largo.
- Validación de pipelines de serving openpi: el bundle de serving permite probar la integración de π0.5 fine-tuneado en infraestructuras de despliegue robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en lazo cerrado está en curso y que las cifras se añadirán en una versión futura de la ficha. Los únicos datos de rendimiento disponibles corresponden a la recolección del profesor (381 de 390 episodios aceptados, 332 de 340 en arranques de entrenamiento) y a las tasas de cobertura por bin de disposición de la escena, que no evalúan al estudiante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (12,4 GB) sugiere un checkpoint de varios miles de millones de parámetros, pero no se especifica el número ni la precisión de los pesos.
- GPU de entrenamiento documentada: NVIDIA H200 (usada por el autor para el fine-tuning).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: bundle de serving de openpi (repositorio Physical-Intelligence/openpi). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en general no aplican a políticas VLA.
- Latencia y throughput: no disponibles. El control opera a 10 Hz en simulación, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/stir_v2_1cmd` | no disponible | no disponible | Cadena pickup-scoop-pour-stir con un comando | no disponible | Hugging Face |
| `Superstar111/stir_v2` | no disponible | no disponible | Misma tarea con un comando por etapa | no disponible | Hugging Face |
| `Superstar111/b1_v2` | no disponible | no disponible | Tarea previa del mismo profesor | no disponible | Hugging Face |
| π0.5 base (openpi) | no disponible | no disponible | Política VLA generalista | no disponible | Repositorio openpi |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); el autor confirma que no se ha ejecutado en el robot real, por lo que la brecha sim-to-real no está caracterizada.
- Sin resultados de evaluación en lazo cerrado publicados: el rendimiento real del estudiante es desconocido.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor.
- Idiomas no declarados; la instrucción de entrenamiento está en inglés y no hay evidencia de generalización a otros idiomas.
- Sesgos conocidos: no documentados, pero el dataset procede de un único controlador profesor y de una única escena simulada, lo que limita la diversidad de comportamientos.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones no válidas fuera de la distribución de escenas entrenadas (alturas de lecho, desplazamientos y orientaciones fuera de los rangos cubiertos).
- Restricciones físicas estrictas en la evaluación (fuerza máxima de 5 N sobre la olla, sin colisiones con la bandeja, olla inmóvil), que un despliegue real debería replicar para considerar válida la política.
- Cobertura de escenas limitada a los rangos declarados: desplazamientos de hasta 20 mm, rotaciones de hasta 5 grados y lechos de 4,5 a 6,0 capas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/stir_v2_1cmd
- Modelo gemelo con un comando por etapa: https://huggingface.co/Superstar111/stir_v2
- Modelo previo del mismo profesor: https://huggingface.co/Superstar111/b1_v2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
