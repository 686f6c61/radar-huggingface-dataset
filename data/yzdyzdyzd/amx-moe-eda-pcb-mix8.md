# yzdyzdyzd/amx-moe-eda-pcb-mix8

## Resumen

amx-moe-eda-pcb-mix8 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el usuario yzdyzdyzd, afinado a partir del checkpoint base `sudnya/amx-moe-eda-w2048` (pretrain de EDA de Sudnya). Con unos 30 millones de parámetros totales y aproximadamente 6 millones activos por token, está especializado en tareas de diseño de placas de circuito impreso (PCB) dentro del ecosistema KiCad: enrutado, colocación de componentes, elección de huellas, consultas de reglas de diseño, generación de netlists y notas de diseño.

El modelo se presenta como el primer checkpoint de la serie nano-rl x KiCad que resuelve tareas retenidas del conjunto `pcb-tasks-v0`; en concreto, responde correctamente 41 de 60 preguntas de reglas en modalidad best-of-8. No obstante, el propio autor advierte que todavía no produce layouts completos que pasen las comprobaciones de KiCad 9, por lo que su utilidad actual es experimental y de investigación, no de producción.

Su relevancia radica en ser un ejemplo de modelo pequeño y altamente especializado (30M parámetros) entrenado con datos verificados por un grader automático, lo que permite ejecutarlo en hardware modesto e incluso en CPU con el motor AMX. La información disponible sobre idiomas, benchmarks estándar y licencia comercial es escasa o inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 6 capas (3 de atención lineal, 3 de ventana deslizante con ventana 2.048), 64 expertos con routing top-4 + 2 compartidos en capas 0 y 3, d_ff 640 |
| Parametros totales | 30.029.024 |
| Parametros activos | Aproximadamente 6 millones por token |
| Longitud de contexto | No disponible (ventana de atención deslizante de 2.048; secuencia de entrenamiento de 8.192) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (la del checkpoint base aplica; pendiente de definir por los autores) |
| Formato de pesos | safetensors (fp32, 74 tensores, nomenclatura dsr) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer MoE de 6 capas que combina atención lineal y atención de ventana deslizante (ventana de 2.048 tokens). Dispone de 64 expertos con routing top-4, más 2 expertos compartidos en las capas 0 y 3, con una dimensión de feed-forward de 640 y un vocabulario BPE de 16.384 tokens compartido con el modelo base. La decodificación es de siguiente token convencional, sin mecanismos especulativos ni modos de razonamiento explícitos.

El afinado parte del checkpoint `sudnya/amx-moe-eda-w2048` y se realizó con 6 pasadas sobre 344 millones de tokens extraídos de las 17 familias del paquete `pcb-tasks-v0` (27.327 filas, con fecha de 27 de octubre de 2026). Se usó una secuencia de entrenador de 8.192, learning rate de 5e-4 con decaimiento hasta 1e-5, 32.768 tokens por paso y documentos completos únicamente. El entrenador fue `dsr` (dgx-spark-reasoning), con identificador de ejecución `2026-10-27T04-41-09-nogit-392c04`. Un aspecto crítico documentado por el autor es que el prompt forma parte del modelo: las filas se renderizaron con el código de `prompt.py` y `terse.py`, y servir el modelo con un texto distinto degrada drásticamente las tasas de acierto (un cambio de una frase redujo de 19 de 20 a 2 de 20 en un checkpoint anterior).

## Capacidades

- Generación de texto especializado en tareas de EDA y PCB, con salida en forma de un único objeto JSON de diseño.
- Resolución de preguntas sobre reglas de diseño (rule questions), con 41 de 60 tareas retenidas resueltas en best-of-8.
- Colocación de componentes (placement) y completado de colocación.
- Completado de pistas (track completion) y enrutado.
- Reparación de diseños con errores inyectados (injected repair).
- Generación de layout a partir de esquemático y de netlist a partir de esquemático.
- Elección de huellas (footprint choice) y búsqueda de pines (pin lookup).
- Generación de notas de diseño (design notes).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en modelos especializados de EDA: el modelo sirve como banco de pruebas para estudiar cómo un MoE pequeño (30M parámetros) aprende tareas de PCB con datos verificados por grader, comparando familias de tareas y tasas de pérdida.
- Evaluación de pipelines de datos sintéticos y reales: permite medir el impacto de mezclar tareas sintéticas con tareas extraídas de repositorios públicos de KiCad en GitHub, como muestra la comparación entre mix4 y mix8 del autor.
- Respuesta a preguntas de reglas de diseño en entornos de formación: con 41 de 60 aciertos en best-of-8, puede usarse como asistente de consulta no crítico para estudiantes que aprenden normativa de PCB, siempre con revisión humana.
- Generación de borradores de netlist y notas de diseño: útil para prototipar documentación automática a partir de esquemáticos, aunque los resultados requieren validación manual.
- Estudio de sensibilidad al prompt: el modelo es un caso documentado de cómo la formulación exacta del prompt afecta al rendimiento, útil para investigar robustez en modelos pequeños.
- Despliegue en hardware modesto para experimentación: con unos 6M parámetros activos y un motor AMX que alcanza 1.100-1.340 tokens/s por núcleo de CPU, permite iterar en estaciones de trabajo sin GPU dedicada.
- No se recomienda su uso como herramienta de diseño real: el autor indica explícitamente que nada de lo que escribe ha sido revisado por una persona.

## Benchmarks y rendimiento

El autor publica pérdidas (nats por token de respuesta) en 40 filas retenidas por familia, comparando base, mix4 (control) y mix8:

| Familia | Base | mix4 | mix8 |
|---|---|---|---|
| Synthetic | 0,38 | 0,36 | 0,44 |
| Real-board layout | 2,80 | 0,72 | 0,53 |
| Routing | 1,91 | 0,83 | 0,53 |
| Placement | 4,01 | 1,09 | 0,60 |
| Placement completion | 3,94 | 1,38 | 0,32 |
| Track completion | 2,91 | 1,16 | 0,45 |
| Injected repair | 3,44 | 1,28 | 0,49 |
| Layout from schematic | 2,94 | 0,68 | 0,54 |
| Footprint choice | 5,78 | 3,38 | 0,59 |
| Pin lookup | 3,84 | 3,46 | 0,85 |
| Rule question | 3,55 | 3,01 | 0,16 |
| Netlist from schematic | 4,59 | 2,58 | 0,87 |
| Design notes | 4,86 | 3,01 | 1,02 |

En evaluación best-of-8 con temperatura 0,7 y grader en KiCad 9, las preguntas de reglas resuelven 41 de 60 placas retenidas (86 de 480 muestras). El resto de familias parsea en la mayoría de tareas pero no pasa ninguna: las familias de layout fallan DRC o conectividad, y las de recuerdo de nombres obtienen puntuaciones cercanas a cero. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 30M parámetros en fp32 el peso ronda los 120 MB, por lo que cabría en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican modelos concretos; el autor mide 2.450 tokens/s en una GPU con 64 a 128 peticiones concurrentes.
- Cabe en GPU consumer: sí, por tamaño (30M parámetros), aunque no se detallan modelos concretos.
- Despliegue: motor `dsr` con `dsr serve --engine cached --config config.yaml --ckpt <final.pt>`; el archivo safetensors es la entrada `model` de ese checkpoint. También existe un motor AMX para CPU.
- Latencia y throughput: 2.450 tokens/s en una GPU con 64-128 concurrentes; 1.100-1.340 tokens/s por núcleo de CPU con el motor AMX.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (EDA/PCB) en la documentación proporcionada. El propio autor usa como referencias internas el modelo base `sudnya/amx-moe-eda-w2048` y el checkpoint intermedio mix4, cuyas pérdidas se incluyen en la tabla de benchmarks. Cualquier comparación con modelos de propósito general o con otros modelos especializados en EDA requeriría datos que no están disponibles.

## Limitaciones y advertencias

- No produce layouts completos que pasen DRC ni conectividad en KiCad 9; todas las familias de layout fallan el grader.
- Las familias de recuerdo de nombres (pin lookup, footprint choice) obtienen puntuaciones cercanas a cero en evaluación estricta.
- El prompt es parte integral del modelo: servir con un texto distinto al de `prompt.py` y `terse.py` degrada drásticamente las tasas de acierto.
- Riesgo de alucinación alto en tareas de diseño; el autor indica que nada de lo que escribe ha sido revisado por una persona.
- Licencia `other` sin definir: la licencia del checkpoint base aplica, pero no se especifican restricciones concretas para uso comercial.
- Idiomas soportados no documentados; el entrenamiento se centra en tareas técnicas de KiCad, no en conversación general.
- Sesgos conocidos: no documentados.
- No debe usarse como herramienta de diseño en producción; su uso previsto es la investigación y la evaluación de técnicas de afinado especializado.
- El modelo depende del ecosistema `dsr` y del formato de prompt exacto, lo que limita la portabilidad a otros stacks de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/yzdyzdyzd/amx-moe-eda-pcb-mix8
- Modelo base: https://huggingface.co/sudnya/amx-moe-eda-w2048
- Dataset referenciado: `pcb-tasks-v0` (no se proporciona URL directa en la información disponible)
- Repositorio de código o paper: no disponible
