# Superstar111/stir_v2

## Resumen

`Superstar111/stir_v2` es una política robótica de tipo vision-language-action (VLA) construida sobre la base π0.5 y ajustada con el framework openpi de Physical Intelligence. El modelo resuelve una tarea de manipulación encadenada en simulación: un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones debe recoger una cuchara, coger garbanzos de una bandeja, verterlos en una olla y removerlos. La particularidad es que la política recibe un comando distinto por etapa ("pick up the spoon", "scoop the beans", "pour the beans into the pot", "stir the beans in the pot") que se conmuta durante el episodio según el estado del simulador.

El modelo se entrenó exclusivamente en el simulador Isaac Lab (a través del simulador dextool) y no se ha ejecutado en el robot real. El autor lo describe como "student of a coding agent's controller": el profesor que generó las demostraciones no fue un humano ni un planificador scriptado, sino un controlador escrito por un agente de código (Codex, "Astra"), con 381 de 390 episodios aceptados tras 500 rollouts de ajuste.

Es relevante como ejemplo de destilación de controladores programáticos hacia políticas VLA y de entrenamiento con comandos por etapa y currículo de layouts. El repositorio ocupa 12,4 GB y contiene el checkpoint y el bundle de serving. La evaluación en bucle cerrado está en curso y el autor indica que las cifras se añadirán en una tarjeta completa posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action sobre base π0.5 (openpi), política de imitación con entrada visual multi-vista y comandos de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (episodios de 629 observaciones a 10 Hz, 62,9 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (comandos en inglés en la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB con checkpoint y bundle de serving; openpi usa safetensors) |

## Arquitectura y entrenamiento

La política parte de π0.5 y se ajusta con openpi (commit eca022d, configuración `pi05_maggie_2skill_hcw_nojit`, semilla 43). Consume tres vistas renderizadas en simulación (head, wrist y cam1) a resolución 284 x 160 y emite acciones a 10 Hz. El entrenamiento se hizo en una NVIDIA H200 con 12.100 pasos sobre 188.700 filas, equivalente a 2,052 pasadas con batch 32 según la regla de pasadas del autor; los pesos publicados son los EMA del paso 12.099.

Los datos provienen de 300 episodios de entrenamiento aceptados (pack `astra_sa_n300`: 1.200 segmentos; 35.854 filas de pickup, 62.846 de scoop, 45.000 de pour y 45.000 de stir) generados por el controlador profesor y validados con 25 arranques de validación separados. El profesor mantuvo la mano a 72,9 mm de media sobre la mesa en el pickup y el solapamiento máximo entre eslabones no vecinos fue de 0,58 mm. La cobertura de layouts (posición de la cuchara respecto a la bandeja, giro de la cuchara, altura del lecho de garbanzos entre 4,5 y 6,0 capas, desplazamiento de la olla) se verificó por bins antes del entrenamiento con resultado PASS. No se documenta RLHF ni DPO; el aprendizaje es por imitación de demostraciones del profesor.

## Capacidades

- Generación de acciones de manipulación de 28 articulaciones (brazo YAM Ultra 2 con mano Sharpa Wave) condicionadas a observaciones visuales y a un comando en lenguaje natural.
- Ejecución de tareas encadenadas de cuatro etapas con conmutación de comando en mitad del episodio.
- Seguimiento de instrucciones cortas de tipo "pick up the spoon", "scoop the beans", "pour the beans into the pot" y "stir the beans in the pot".
- Percepción visual multi-vista (cabeza, muñeca y cámara auxiliar) para localizar cuchara, bandeja, garbanzos y olla.
- Control de fuerza implícito: el evaluador exige que la cuchara presione la olla con un máximo de 5 N en cada paso de control.
- Restricciones geométricas respetadas en entrenamiento: mano al menos 30 mm sobre la mesa, 10 mm respecto al reposo al coger la cuchara y ausencia de solapamientos entre eslabones no vecinos.
- No se documentan capacidades de tool calling, agentes multi-paso fuera del episodio, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en destilación de controladores: usar el par profesor (controlador de código) y estudiante (esta política) para estudiar cuánto del comportamiento programático se transfiere a una política neuronal con comandos por etapa.
- Benchmark de manipulación encadenada en simulación: evaluar pick-and-place con vertido y removido sobre el evaluador `evaluate_chain_pour_stir_pot`, que impone métricas físicas concretas (agarre cerrado en al menos el 80 % de los fotogramas, 5 a 20 mm de extremo libre del mango, al menos un garbanzo vertido, desplazamiento mediano de 100 mm al remover).
- Estudio de robustez a variaciones de layout: el conjunto de datos cubre bins de posición y giro de la cuchara, altura del lecho y desplazamiento de la olla, lo que permite analizar generalización a distribuciones de escena controladas.
- Desarrollo de políticas con instrucciones conmutadas: sirve como referencia para tareas donde el operador cambia el objetivo a mitad de episodio, frente a la variante de un solo comando `Superstar111/stir_v2_1cmd`.
- Simulación a realidad como paso previo: el checkpoint y el bundle de serving permiten reproducir el episodio en Isaac Lab antes de plantear un despliegue en el YAM Ultra 2 real, que el autor declara no haber probado.
- Docencia y divulgación técnica: ejemplo completo de pipeline openpi con datos, configuración, semilla, número de pasos y criterios de aceptación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán en una tarjeta completa. Los únicos datos numéricos publicados son de aceptación del profesor (381 de 390 episodios, 332 de 340 en arranques de entrenamiento) y de cobertura de layouts (por ejemplo, 12 de 12 en mangos a menos de 40 mm de la pared de la bandeja, 278 de 286 en mangos a más de 65 mm, 93 de 98 en lechos de 4,5 a 5,0 capas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint y el bundle.
- GPU de entrenamiento documentada: NVIDIA H200 (12.100 pasos, batch 32).
- GPU recomendadas para inferencia: no disponible; al ser una política π0.5 de openpi, se espera que requiera una GPU con suficiente memoria para el modelo base completo, pero no se especifica.
- Cabeza en GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: openpi (commit eca022d) con la configuración `pi05_maggie_2skill_hcw_nojit`; el repositorio incluye un bundle de serving. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: control a 10 Hz (paso de 0,1 s) según la definición del episodio; no se publican latencias de inferencia medidas.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto / episodio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/stir_v2` | π0.5 (openpi) | 4 etapas con comando por etapa, simulación Isaac Lab | 629 observaciones a 10 Hz (62,9 s) | no disponible | Hugging Face, 0 descargas |
| `Superstar111/stir_v2_1cmd` | π0.5 (openpi) | Mismas demostraciones con un único comando | no disponible | no disponible | Hugging Face |
| `Superstar111/b1_v2` | π0.5 (openpi) | Tarea previa del mismo profesor (sesión tray-a-11-21) | no disponible | no disponible | Hugging Face |
| π0.5 base (Physical Intelligence) | π0.5 | VLA generalista | no disponible | no disponible en esta información | openpi |

## Limitaciones y advertencias

- Entrenado solo en simulación (Isaac Lab); el autor declara explícitamente que no se ha ejecutado en el robot real.
- La evaluación en bucle cerrado no está publicada; no hay métricas de éxito del estudiante, solo del profesor y de cobertura de datos.
- El modelo depende de un comando por etapa y de la lógica externa que decide cuándo conmutar (observación 150 para el pickup, 329 para el scoop, 479 para el pour); un fallo en esa conmutación degrada la tarea.
- Los criterios de éxito son estrictos y específicos del evaluador `evaluate_chain_pour_stir_pot` (fuerza máxima de 5 N, olla sin mover más de 5 mm y 5 grados, etc.), por lo que el rendimiento fuera de ese entorno no está caracterizado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Idiomas no disponibles: los comandos documentados están en inglés y no se especifica soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados; al ser una política de imitación, el riesgo principal es la generalización fuera de la distribución de layouts cubierta (posición y giro de cuchara, altura del lecho, desplazamiento de la olla).
- El repositorio tiene 0 descargas y 0 likes, y la tarjeta se describe como provisional hasta publicar los resultados completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/stir_v2
- Variante de un solo comando: https://huggingface.co/Superstar111/stir_v2_1cmd
- Modelo previo del mismo profesor: https://huggingface.co/Superstar111/b1_v2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
