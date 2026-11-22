# Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-tray-1cmd

## Resumen

π0.5-yam-sharpa-spoon-scoop-astra-block-tray-1cmd es un checkpoint de política robótica de tipo vision-language-action (VLA) publicado por el usuario Superstar111 en Hugging Face. Se trata de un fine-tuning del modelo base π0.5 de Physical Intelligence, realizado con la herramienta openpi, para una tarea concreta: recoger una cuchara y servir garbanzos con un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. El modelo sigue una única instrucción de lenguaje natural durante todo el episodio ("pick up the spoon and scoop the beans") y fue entrenado exclusivamente en simulación mediante Isaac Lab, sin validación en el robot físico.

El interés técnico de este checkpoint reside en su metodología de generación de datos: el profesor (teacher) que produjo las trayectorias no es un humano ni un planificador scriptado, sino un controlador escrito por un agente de código (Codex, apodado "Astra"), cuya versión tras 100 rollouts de ajuste alcanzó 390 de 390 episodios aceptados. La model card documenta con detalle inusual los criterios de aceptación, la cobertura de layouts y las comprobaciones previas al entrenamiento, lo que lo convierte en un caso interesante para estudiar pipelines de destilación de políticas en robótica.

El repositorio ocupa 12,4 GB y contiene el checkpoint y el bundle de serving. La evaluación en bucle cerrado está en curso según el autor y los resultados numéricos aún no se han publicado. No hay descargas ni likes, y la licencia no está especificada, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (openpi) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (instrucción de entrenamiento en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (bundle de serving openpi; tamaño de repo 12,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π0.5, la política VLA de Physical Intelligence implementada en openpi. π0.5 combina un backbone de visión-lenguaje con un cabezal de acción que genera comandos motores condicionados por la observación visual y la instrucción textual. El checkpoint está especializado para un embodiment concreto: brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, con cámara de muñeca además de las cámaras externas.

El entrenamiento se realizó íntegramente en el simulador dextool (commit e90e6f5) sobre Isaac Lab, con 300 episodios de entrenamiento aceptados y 25 starts de validación separados. Las trayectorias provienen de un controlador profesor escrito por un agente de código, que completa la tarea en episodios de 32,9 s. Los criterios de aceptación son estrictos: agarre de potencia cerrado sobre el mango en al menos el 80 % de los frames de sujeción, 5 a 20 mm del extremo del mango libres más allá de la mano, mano a al menos 30 mm de la mesa y 10 mm del soporte durante la recogida, sin solapamiento entre eslabones no adyacentes superior a 1,0 mm, todos los eslabones del robot a al menos 10 mm de la bandeja durante todo el episodio y al menos un garbanzo transportado. La escena varía la altura del lecho de garbanzos (uniforme entre 4,5 y 6,0 capas), coloca entre 12 y 36 garbanzos sueltos y activa la autocolisión entre eslabones. La posición del soporte, la bandeja y el quemador se perturban hasta 20 mm y 5 grados de forma independiente; la cuchara se gira hasta 20 grados y se desplaza hasta 10 mm sobre su soporte. Las poses de cámara, la iluminación, la posición inicial del brazo y la mesa no se variaron.

La innovación metodológica destacable es el uso de un profesor generado por agente de código con un noveno criterio de aceptación (distancia mínima de 10 mm a la bandeja), que corrige el fallo del checkpoint anterior astra-block-bed-1cmd, cuyo profesor presionaba con el pulgar la pared de la bandeja en 38 de sus 390 episodios de recolección. La comprobación de cobertura previa al entrenamiento pasa en todos los bins de layout para este modelo, frente a varios bins por debajo del umbral del 90 % en el checkpoint anterior.

## Capacidades

- Ejecución de una tarea robótica de manipulación completa a partir de una única instrucción en lenguaje natural: recoger la cuchara y servir garbanzos.
- Control de un brazo de 28 articulaciones (YAM Ultra 2 + Sharpa Wave) con agarre de potencia cerrado sobre el mango de la cuchara.
- Percepción visual condicionada por cámara de muñeca y cámaras externas para localizar cuchara, bandeja y lecho de garbanzos.
- Adaptación a variaciones de altura del lecho de garbanzos (4,5 a 6,0 capas), número de garbanzos (12 a 36) y perturbaciones de posición y orientación de los objetos.
- Evitación de colisiones con la bandeja y autocolisión entre eslabones del robot, entrenada explícitamente.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de audio o visión general más allá del condicionamiento visual para la política.
- Capacidades multilingües: no disponibles; la instrucción de entrenamiento está en inglés.

## Casos de uso

- Investigación en destilación de políticas VLA: sirve como caso de estudio de cómo un profesor generado por agente de código puede producir datasets de manipulación con criterios de aceptación verificables y cobertura controlada por bins de layout.
- Benchmark de manipulación en simulación: útil para comparar pipelines de fine-tuning de π0.5 con openpi sobre tareas de scooping con variabilidad de altura de material granular.
- Estudio de robustez a perturbaciones de placement: el modelo está entrenado con perturbaciones independientes de hasta 20 mm y 5 grados en soporte, bandeja y quemador, lo que permite evaluar generalización a configuraciones no vistas.
- Desarrollo de criterios de aceptación automáticos: los umbrales documentados (agarre al 80 % de frames, 10 mm de separación a la bandeja, 1,0 mm de solapamiento máximo) son reutilizables como especificación de tests en pipelines de generación de datos sintéticos.
- Transferencia sim-to-real como objeto de estudio: el modelo incluye notas explícitas sobre el offset de la articulación 6 y la pose de la cámara de muñeca sin calibrar, lo que lo hace adecuado para investigar los pasos de calibración necesarios antes de desplegar en el robot físico.
- Docencia en robótica de manipulación: la model card detalla la escena, el profesor y las comprobaciones, lo que facilita reproducir el experimento con openpi e Isaac Lab en un curso avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación en bucle cerrado está en curso y que los números se añadirán en una versión posterior. Como datos de proceso, el profesor completó 390 de 390 episodios aceptados (340 de 340 en starts de entrenamiento) y mantuvo la mano a 73,1 mm de media sobre la mesa durante la recogida (69,9 mm en el percentil indicado, dato truncado en la información disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de repo es de 12,4 GB, lo que sugiere pesos en precisión de 16 bits para un modelo del orden de miles de millones de parámetros, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del bundle, es previsible que requiera GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090), pero no hay confirmación del autor.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: el bundle de serving está preparado para openpi (repositorio Physical-Intelligence/openpi). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5-yam-sharpa-spoon-scoop-astra-block-tray-1cmd | no disponible | no disponible | Scooping con YAM Ultra 2 + Sharpa Wave, simulación | no disponible | Hugging Face (0 descargas) |
| astra-block-bed-1cmd (mismo autor) | no disponible | no disponible | Tarea equivalente, profesor anterior | no disponible | Hugging Face |
| π0.5 base (Physical Intelligence) | no disponible en la información | no disponible | Política VLA generalista | no disponible en la información | openpi / Physical Intelligence |

La comparativa con modelos de la misma categoría (políticas VLA generalistas como π0.5 base u OpenVLA) no puede completarse con datos verificables a partir de la información proporcionada; los parámetros, contexto y resultados de benchmarks de las alternativas no están disponibles en esta ficha.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot físico según el autor.
- La evaluación en bucle cerrado está en curso y no hay métricas de éxito publicadas; no debe asumirse un rendimiento determinado.
- Licencia no especificada: no se puede garantizar el uso comercial sin contactar con el autor.
- La instrucción está fijada en inglés y la tarea es única; no es un modelo generalista.
- El offset de la articulación 6 en el montaje girado no está verificado en el rig; el autor advierte de que no debe aplicarse la conversión usada en los cinco checkpoints anteriores.
- La pose de la cámara de muñeca en entrenamiento es geométrica y no calibrada, y no está verificada en el rig.
- El solapamiento entre eslabones no adyacentes de la mano se midió en simulación (máximo 0,45 mm en entrenamiento); el valor del propio modelo en evaluación está pendiente.
- Riesgo de alucinación y sesgos lingüísticos: no aplica en el sentido habitual de LLM, pero la política puede fallar silenciosamente ante configuraciones fuera de la distribución de entrenamiento (cámaras, iluminación y mesa no variadas).
- El autor recomienda ejecutar la recogida con una persona en el botón de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-tray-1cmd
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Physical Intelligence (π0.5): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible
