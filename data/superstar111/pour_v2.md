# Superstar111/pour_v2

## Resumen

`Superstar111/pour_v2` es una política de visión-lenguaje-acción (VLA) construida sobre la base π0.5 y ajustada con el framework openpi de Physical Intelligence. El modelo resuelve una tarea robótica de manipulación en tres etapas encadenadas: coger una cuchara, recoger garbanzos y verterlos en una olla. Está entrenado exclusivamente en simulación (Isaac Lab, simulador dextool) para un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, y no se ha ejecutado todavía en el robot real.

La particularidad del modelo es que se controla con un comando de lenguaje distinto por etapa, conmutado a lo largo de un episodio de 47,9 s (479 observaciones a 10 Hz): "pick up the spoon" hasta la observación 150, "scoop the beans" hasta la 329 y "pour the beans into the pot" hasta el final. Su gemelo `Superstar111/pour_v2_1cmd` se entrenó con las mismas demostraciones pero con un único comando.

El interés técnico reside en la fuente de los datos: el profesor no es un humano ni un planificador scriptado, sino un controlador escrito por un agente de código (Codex, "Astra") que superó 25 de 25 arranques reservados antes de la recolección. Se aceptaron 390 de 390 episodios, lo que da un dataset de 300 episodios de entrenamiento con cobertura verificada de layouts. La evaluación en bucle cerrado está en curso y el autor no ha publicado cifras de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5 (openpi, config `pi05_maggie_2skill_hcw_nojit`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (episodios de 479 observaciones a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (comandos de entrenamiento en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB con checkpoint y bundle de serving) |

## Arquitectura y entrenamiento

El modelo parte de la base π0.5 y se ajusta con openpi (commit eca022d) bajo la configuración `pi05_maggie_2skill_hcw_nojit`, semilla 43. La salida es una política que mapea observaciones visuales y comandos de lenguaje a acciones de 28 articulaciones. Las vistas de entrada son tres cámaras (head, wrist y cam1) renderizadas a 284 x 160 en simulación.

El dataset, empaquetado como `astra_sa_n300`, contiene 900 segmentos y 143.700 filas (35.875 de pickup, 62.825 de scoop y 45.000 de pour) procedentes de 300 episodios aceptados, con 25 arranques de validación separados. El entrenamiento se ejecutó en una NVIDIA RTX PRO 6000 Blackwell Server Edition durante 9.250 pasos (2,060 pasadas con batch 32), y los pesos publicados son los pesos EMA del paso 9.249. La recolección de datos se validó con criterios geométricos estrictos: agarre de potencia cerrado sobre el mango en al menos el 80 % de los fotogramas, 5 a 20 mm de holgura en el extremo del mango, mano al menos 30 mm sobre la mesa, y ausencia de solapamientos entre eslabones no adyacentes superiores a 1,0 mm. La cobertura de layouts (posición del mango, giro de la cuchara, altura del lecho de garbanzos y desplazamiento de la olla) fue del 100 % en todos los bins verificados.

## Capacidades

- Manipulación robótica de tres etapas encadenadas (pickup, scoop, pour) en un único episodio de 479 observaciones.
- Control por comandos de lenguaje conmutados por etapa, lo que permite cambiar de objetivo a mitad de episodio sin reiniciar la política.
- Percepción visual multi-cámara (tres vistas: head, wrist, cam1) a resolución 284 x 160.
- Control de una mano antropomórfica de 28 articulaciones (Sharpa Wave) sobre brazo YAM Ultra 2.
- Generalización a variaciones de escena: altura del lecho de garbanzos de 4,5 a 6,0 capas, 12 a 36 garbanzos sueltos, desplazamientos de hasta 20 mm y giros de hasta 5 grados de los objetos.
- No se documentan capacidades de tool calling, agentes multi-paso fuera del episodio, ni procesamiento de audio.

## Casos de uso

- Investigación en VLA: servir de referencia reproducible para estudiar políticas π0.5 ajustadas con openpi sobre tareas de manipulación diestra con mano de 28 articulaciones.
- Generación de datos sintéticos: el pipeline profesor-en-simulación (controlador escrito por agente de código, 390 de 390 episodios aceptados) es un patrón reutilizable para crear datasets de imitación sin teleoperación humana.
- Evaluación de robustez a variaciones de layout: los bins de cobertura documentados permiten diseñar experimentos controlados sobre altura de lecho, orientación de la cuchara y desplazamiento de la olla.
- Benchmarking de manos antropomórficas: la tarea exige agarre de potencia cerrado con holguras milimétricas, útil para comparar controladores de mano Sharpa Wave frente a otras.
- Estudio de comandos por etapa frente a comando único: el gemelo `pour_v2_1cmd` permite un experimento A/B directo sobre el efecto de la conmutación de instrucciones.
- Prototipado de tareas de cocina en simulación: la secuencia coger-recoger-verter es un banco de pruebas para planificación de contacto y control de fuerza (límite de 5 N sobre la olla).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán en una versión futura de la model card. Los únicos datos cuantitativos publicados son de recolección y validación del profesor: 390 de 390 episodios aceptados, 25 de 25 arranques reservados superados, mano a 73,1 mm de media sobre la mesa en el pickup (mínimo 69,6 mm) y solapamiento máximo entre eslabones no adyacentes de 0,56 mm.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000 Blackwell Server Edition.
- GPU recomendadas para inferencia: no disponible; al derivar de π0.5, se espera que requiera GPU de datacenter, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (commit eca022d) con el bundle de serving incluido en el repo; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/pour_v2` | π0.5 (openpi) | Pickup + scoop + pour con 3 comandos | 479 obs. por episodio | no disponible | Hugging Face, 0 descargas |
| `Superstar111/pour_v2_1cmd` | π0.5 (openpi) | Misma tarea con un único comando | 479 obs. por episodio | no disponible | Hugging Face |
| `Superstar111/b1_v2` | π0.5 (openpi) | Tarea previa del mismo profesor (sesión tray-a-11-21) | no disponible | no disponible | Hugging Face |
| π0.5 (base, Physical Intelligence) | — | Política VLA generalista | no disponible | no disponible en la información | Repo openpi |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real, por lo que existe una brecha sim-a-real no cuantificada.
- La evaluación en bucle cerrado no está publicada: no hay tasas de éxito verificadas para el estudiante.
- El montaje de la mano y la articulación 6 presentan advertencias del autor antes de ejecutar en el rig (la model card se corta en ese punto).
- El control depende de la conmutación manual de comandos en observaciones concretas (150 y 329); un cambio de ritmo en el robot real puede desalinear las etapas.
- Sesgos conocidos: no documentados; al entrenarse solo en simulación, hereda las simplificaciones físicas del simulador dextool (colisiones, fricción, iluminación fija).
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones plausibles que incumplan las restricciones físicas (límite de 5 N, distancia a la bandeja) fuera de la distribución de entrenamiento.
- Restricciones de licencia: la licencia no está indicada, por lo que no se puede asumir uso comercial.
- Idiomas: los comandos de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Cobertura limitada: poses de cámara, iluminación, posición inicial del brazo y mesa no se variaron durante la recolección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pour_v2
- Gemelo con un solo comando: https://huggingface.co/Superstar111/pour_v2_1cmd
- Modelo previo del mismo profesor: https://huggingface.co/Superstar111/b1_v2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
