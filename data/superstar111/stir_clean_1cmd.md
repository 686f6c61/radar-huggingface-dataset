# Superstar111/stir_clean_1cmd

## Resumen

`Superstar111/stir_clean_1cmd` es una política robótica de tipo vision-language-action (VLA) construida sobre π0.5, el modelo de Physical Intelligence para control de robots, y afinada con el framework openpi. La desarrolla el usuario Superstar111 y resuelve una tarea concreta de manipulación encadenada: coger una cuchara, recoger garbanzos de una bandeja, verterlos en una olla y remover, todo bajo una única instrucción en lenguaje natural y en un solo episodio. El modelo se ha entrenado exclusivamente en simulación sobre un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, y no se ha ejecutado en el robot real.

La relevancia del artefacto es metodológica más que de rendimiento: documenta con detalle qué aprende una política a partir de 300 trayectorias generadas por un agente de código en un simulador, y publica de forma explícita las puertas de aceptación que no se aplicaron (agarre de potencia, retención final, tasa de éxito). El autor lo etiqueta como línea base y advierte de que no está evaluado ni en simulación ni en robot, por lo que debe tratarse como material de investigación reproducible, no como un componente listo para producción.

El repositorio ocupa 12,4 GB y contiene pesos en formato openpi para un fine-tune completo desde la base π0.5. No se declaran licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, transformer multimodal con cabezal de acciones; fine-tune completo desde pi0.5 base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato openpi, presumiblemente bf16/fp32; no se documenta) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés, una única frase) |
| Licencia | no disponible |
| Formato de pesos | checkpoint openpi (bundle con sha256); tamano del repo 12,4 GB |

## Arquitectura y entrenamiento

La política parte de π0.5, un modelo VLA que combina un backbone visión-lenguaje con un cabezal de predicción de acciones por difusión, y se afina de forma completa (no LoRA) con openpi en el commit `eca022d`, configuración `pi05_maggie_2skill_hcw_nojit`. La entrada son tres vistas de cámara (cabeza, muñeca y cam1) a resolución 284 x 160 y una instrucción textual; la salida son objetivos articulares para las 28 articulaciones del brazo YAM Ultra 2 con mano Sharpa Wave. El entrenamiento usó batch 32, 17.300 pasos con schedule coseno (pico 5e-5, warmup 500), EMA 0,999 y semilla 43 sobre una única NVIDIA H200; los pesos publicados son los EMA del paso 17.299. La pérdida pasó de 0,5704 en el primer paso registrado a 0,0055 en el último.

El dataset lo componen 300 trayectorias (379.874 fotogramas, episodios de 643 a 1660 pasos, mediana 1348) generadas por un agente de código que escribió sus propios controladores en el simulador dextool (Isaac Lab, Newton / MuJoCo-Warp). Las imágenes se renderizaron a 10 Hz a partir de los estados registrados, sin replay físico, con las mismas cámaras y apariencia que el modelo anterior del proyecto. Las acciones son los objetivos articulares que el agente envió y que el simulador aplicó. La instrucción es única y se asignó en posprocesado: "pick up the spoon, scoop the beans, pour them into the pot and stir". No hubo aumento de imagen ni recorte de episodios; cada episodio se usó completo, incluida la retención final estática, que ocupa el 27 % de los fotogramas (102.911 de 379.874).

## Capacidades

- Control robótico de manipulación encadenada en un solo episodio: coger, recoger, verter y remover con una única instrucción.
- Predicción de objetivos articulares para 28 grados de libertad (brazo YAM Ultra 2 más mano Sharpa Wave).
- Condicionamiento por lenguaje natural en inglés, con una frase de instrucción fija.
- Fusión de tres vistas de cámara (cabeza, muñeca y cam1) a 284 x 160.
- Ejecución de tareas de horizonte largo (hasta 1660 pasos por episodio).
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en imitación desde datos generados por agentes: sirve como referencia reproducible de cuánto aprende una política a partir de trayectorias sintéticas de un agente de código, con dataset y configuración documentados paso a paso.
- Estudio de puertas de aceptación en robótica: el modelo publica métricas de agarre, retención y éxito que permiten analizar el impacto de relajar los criterios de calidad del dataset.
- Línea base para ablaciones: al compartir modelo, ajustes, cámaras y semilla con el modelo anterior del proyecto, permite aislar el efecto del dataset en comparaciones controladas.
- Desarrollo de pipelines openpi: útil para validar la integración de checkpoints π0.5, el renderizado de observaciones y el despliegue en simulación antes de pasar a hardware.
- Evaluación de robustez a variaciones de escena: el dataset incluye desplazamientos de hasta 20 mm y rotaciones de hasta 5 grados de bandeja y quemador, y giros del cucharón de hasta 20 grados, lo que permite probar generalización posicional en simulación.
- Formación y docencia: ejemplo completo de ficha de datos, entrenamiento y limitaciones para cursos de aprendizaje por imitación y VLA.
- No es adecuado para despliegue en robot real sin validación previa, dado que no se ha ejecutado fuera del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la política no ha sido evaluada, ni en simulación ni en robot. Las únicas métricas publicadas son las puertas de aceptación medidas sobre los datos de entrenamiento y sobre replays físicos:

| Metrica | Valor |
|---|---|
| Agarre de potencia (pulgar cerrado sobre el mango) | falso en 300 de 300 episodios y en 300 de 300 replays |
| Retención final estatica | 27 % de los fotogramas (102.911 de 379.874); mediana 30 s por episodio, hasta 105 s |
| Exito sobre estados registrados por el agente (lectura literal) | 300 de 300 |
| Exito sobre estados registrados (lectura estricta del juez) | 154 de 300 |
| Exito en replay físico de los objetivos enviados (lectura literal) | 164 de 282 (58 %) |
| Exito en replay físico (lectura estricta) | 43 de 282 (15 %) |
| Tasa de exito de los controladores del agente por bin de aleatorizacion | 53 a 61 % (la regla del laboratorio exige 90 % por bin) |
| Perdida en el primer y ultimo paso registrado | 0,5704 y 0,0055 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB, lo que sugiere que los pesos en precisión de entrenamiento pueden caber en GPUs de 24 GB o más, pero no se documenta el consumo real.
- GPU de entrenamiento: una NVIDIA H200 para el fine-tune completo con batch 32 y 17.300 pasos.
- GPU recomendadas para inferencia: no documentadas; por tamaño de checkpoint, una RTX 4090 (24 GB) o A100/H100 son candidatas razonables, pero sin confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB si se sirve en bf16, aunque no está verificado ni se especifican cuantizaciones.
- Opciones de despliegue: openpi (framework de referencia), con bundle y checkpoint verificados por sha256; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El autor solo verifica que un servidor nuevo responde 12 consultas registradas dentro de 0,002197 rad de las respuestas del clúster de entrenamiento (tolerancia 0,005 rad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/stir_clean_1cmd` | no disponible | no disponible | VLA para YAM Ultra 2 + Sharpa Wave, cadena cuchara-garbanzos-olla-remover | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | VLA generalista de propósito amplio | no disponible en la informacion | Referencia del fine-tune; no se detalla su disponibilidad |
| `Superstar111/pour_v2` | no disponible | no disponible | VLA del mismo robot en simulación, tarea de verter | no disponible | Hugging Face, citado por el autor como modelo hermano |
| Modelo de cadena completa del 25 nov (no publicado) | no disponible | no disponible | Misma cadena con otro dataset (269.389 filas) | no disponible | No publicado |

No se dispone de datos de rendimiento comparables entre estas alternativas; la única comparación posible es de configuración (mismo modelo, ajustes, cámaras y semilla, distinto dataset).

## Limitaciones y advertencias

- No evaluado: el autor declara que la política no se ha probado ni en simulación ni en robot; los únicos datos son las puertas de aceptación medidas sobre el dataset.
- Entrenado solo en simulación: no se ha ejecutado en el robot real.
- Agarre deficiente: el agarre de potencia falla en el 100 % de los episodios registrados y de los replays, lo que incumple las reglas del laboratorio.
- Exito en replay físico bajo: 58 % con lectura literal y 15 % con la lectura estricta del juez, frente al 100 % sobre los estados registrados, lo que indica una brecha entre datos y física real.
- Dependencia de estado del simulador: el controlador del profesor leía las posiciones de los garbanzos directamente del estado del simulador; una política basada en cámara no puede hacerlo, lo que limita la transferencia.
- Retención final estática muy presente: el 27 % de los fotogramas son la retención final, con hasta 105 s por episodio, lo que puede sesgar el aprendizaje hacia la inacción.
- Aleatorización limitada: no se variaron las poses de cámara, la iluminación, la posición inicial del brazo ni la mesa.
- Montaje de muñeca y articulación 6: entrenado con el montaje girado; no se debe aplicar la conversión de la articulación 6 de los cinco checkpoints anteriores. En simulación la articulación 6 lee +7,9 grados en reposo con la palma hacia abajo, sin offset; no verificado en el robot.
- Cámara de muñeca sin calibrar: su pose es geométrica (dónde la asienta el montaje), no calibrada ni verificada en el robot.
- Requiere operador en la parada de emergencia si se ejecuta en el robot.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no declarados: la instrucción de entrenamiento es una única frase en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluado para esta política; al ser un modelo de acciones, el riesgo se traduce en movimientos incorrectos o inseguros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/stir_clean_1cmd
- Framework openpi: https://github.com/Physical-Intelligence/openpi
- Modelo hermano citado por el autor: https://huggingface.co/Superstar111/pour_v2
- Simulador dextool (Isaac Lab, Newton / MuJoCo-Warp): no disponible como enlace en la informacion
- Paper de π0.5: no disponible como enlace en la informacion
- Demo o blog del autor: no disponible en la informacion
