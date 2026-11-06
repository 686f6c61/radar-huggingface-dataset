# yinpei-tri-pi/robocasa-system2-qwen3vl-4b

## Resumen

RoboCasa System2 es un modelo planificador de robótica construido mediante un fine-tune completo de Qwen3-VL-4B-Instruct, desarrollado por el usuario yinpei-tri-pi. Forma parte de una arquitectura jerárquica System2 + System1 evaluada en el benchmark RoboCasa365: el System2 (este modelo) actúa como planificador de alto nivel que recibe la instrucción de la tarea y una imagen de escena en mosaico, y genera un plan de hitos; tras cada segmento ejecutado por el System1, revisa un clip de vídeo a 4 fps, evalúa si el subobjetivo se cumplió, actualiza el plan y emite el siguiente subobjetivo con una estimación del número de pasos. El System1 es un modelo separado (`yinpei-tri-pi/robocasa-system1-pi05-progact`).

Arquitectura Qwen3-VL de 4.437.815.808 parámetros totales (aproximadamente 4,4 mil millones), con torre de visión incluida y fine-tune completo de dicha torre. El modelo está pensado para despliegue con vLLM 0.19.1 en Docker y se distribuye en safetensors con licencia Apache 2.0.

Su relevancia radica en que demuestra un enfoque de planificación multimodal con memoria visual a corto plazo (clip a 4 fps) para tareas de manipulación robótica de horizonte largo, logrando un 54,3 % global en el protocolo del leaderboard RoboCasa365 (50 tareas × 50 ensayos) junto con el System1 mencionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con torre de visión) |
| Parámetros totales | 4.437.815.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor indica servir con vLLM 0.19.1) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Pipeline | robotics (planner) |
| Tamaño del repo | 9,7 GB |
| Checkpoint | `checkpoint-17124` (run `system2-full-0804-qwen3vl-4b-gb192-full-vitfull-lr1e5-vitlr2e6-alignerlr1e5-zero2-2n-ep3`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de Qwen3-VL-4B-Instruct, incluyendo la torre de visión (el nombre de la ejecución incluye `full-vitfull`). Se entrenó sobre el dataset de System2 denominado `system2_full_0804` durante 3 épocas, con un batch global de 192 y el checkpoint final `checkpoint-17124`. Los hiperparámetros registrados en el nombre del run indican una tasa de aprendizaje de 1e-5 para el modelo, 2e-6 para la torre de visión (`vitlr2e6`) y 1e-5 para un componente denominado `aligner` (`alignerlr1e5`), con aceleración ZeRO-2 (`zero2`).

El diseño de inferencia es jerárquico y con memoria visual: el modelo recibe la instrucción y una imagen de escena en mosaico (tiled) para producir un plan de hitos inicial; después de cada segmento del System1 consume un clip muestreado a 4 fps (`system2_4fps_32`, según `media_policy.json`) para juzgar el subobjetivo y replanificar. El repositorio incluye `chat_template.jinja` con la plantilla de chat usada en entrenamiento y el script de servicio `scripts/serve_system2.sh` del repositorio de evaluación sys1_sys2 (vLLM en Docker). No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Planificación de tareas robóticas de horizonte largo a partir de instrucciones en lenguaje natural y una imagen de escena en mosaico.
- Generación de planes de hitos (milestones) descompuestos y emisión de subobjetivos con estimación del número de pasos.
- Evaluación de subobjetivos tras la ejecución: consume clips de vídeo a 4 fps y juzga si el subobjetivo se ha cumplido.
- Replanificación dinámica: actualiza el plan y emite el siguiente subobjetivo en función del resultado observado.
- Comprensión visual de escenas (torre de visión afinada de extremo a extremo).
- Integración como System2 en una jerarquía System2 + System1 (el System1 ejecuta las acciones de bajo nivel).
- Despliegue servido con vLLM 0.19.1, lo que habilita inferencia por API dentro de un bucle de control.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Planificación de manipulación doméstica en simulación: el modelo descompone una instrucción de tarea (por ejemplo, preparar un plato) en hitos y los va emitiendo al System1, revisando el clip a 4 fps tras cada segmento para decidir el siguiente subobjetivo. Es adecuado porque su entrenamiento está alineado con el protocolo RoboCasa365.
- Replanificación ante fallos parciales: si el System1 no completa un subobjetivo, el System2 detecta el desajuste en el vídeo y emite un subobjetivo corregido con un nuevo recuento de pasos, evitando que el ejecutor quede bloqueado.
- Evaluación comparativa de políticas jerárquicas: sirve como referencia reproducible en el leaderboard RoboCasa365 (50 tareas × 50 ensayos), junto con el System1 `robocasa-system1-pi05-progact`, para medir mejoras de planificación frente a ejecución.
- Investigación en planificación multimodal con memoria visual: el clip a 4 fps y la política `system2_4fps_32` permiten estudiar cómo afecta la frecuencia de muestreo y la ventana temporal al juicio de subobjetivos.
- Generación de datos de planificación para entrenamiento de políticas: los planes de hitos y las estimaciones de pasos pueden registrarse como trayectorias etiquetadas para entrenar o ajustar modelos de ejecución de bajo nivel.
- Prototipado de asistentes robóticos con API: al servirse con vLLM 0.19.1 en Docker, puede integrarse en un bucle de control que envíe instrucción e imagen, reciba el plan y consulte de nuevo tras cada segmento.
- Docencia y demostraciones de arquitecturas System1/System2: el repositorio incluye plantilla de chat, política de muestreo de vídeo y script de servicio, lo que facilita reproducir el pipeline completo.

## Benchmarks y rendimiento

Resultados publicados en la model card para el protocolo del leaderboard RoboCasa365 (50 tareas × 50 ensayos), con el System1 `yinpei-tri-pi/robocasa-system1-pi05-progact` y todo el direccionamiento por lenguaje activado:

| Métrica | Resultado |
|---|---|
| Global | 54,3 % |
| Atomic-seen | 80,1 % |
| Composite-seen | 51,5 % |
| Composite-unseen | 28,1 % |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.437.815.808 parámetros, en FP16/BF16 los pesos ocupan aproximadamente 8,9 GB, a los que hay que sumar memoria para el procesamiento de imagen y vídeo (clips a 4 fps) y la caché KV; en cuantización de 8 bits rondaría 4,5 GB y en 4 bits unos 2,3 GB, si bien el autor no publica recetas de cuantización.
- GPU recomendadas: no especificadas por el autor. Para servido con vLLM 0.19.1 se requiere una GPU compatible con dicha versión; una A100 o H100 es la opción conservadora para producción, y una RTX 4090 (24 GB) debería acomodar los pesos en BF16 junto con el procesamiento visual, aunque esto no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? Los pesos en BF16 caben en tarjetas de 24 GB como la RTX 4090; en 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: vLLM 0.19.1 (método indicado por el autor, mediante `scripts/serve_system2.sh` con Docker). Otros runners (llama.cpp, Ollama, TGI) no están documentados para este checkpoint.
- Latencia y throughput: no disponibles. El bucle de control impone una consulta al modelo tras cada segmento del System1, por lo que la latencia de cada llamada (incluido el procesamiento del clip a 4 fps) condiciona la frecuencia de replanificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCasa System2 (este modelo) | 4.437.815.808 | no disponible | Planificador multimodal System2 sobre Qwen3-VL-4B | Apache 2.0 | Hugging Face, safetensors, vLLM |
| Qwen/Qwen3-VL-4B-Instruct (base) | no disponible en la información | no disponible | Modelo multimodal generalista | no disponible en la información | Hugging Face |
| robocasa-system1-pi05-progact | no disponible | no disponible | Ejecutor System1 de bajo nivel, pareja del System2 | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a propósito y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado: está entrenado para el pipeline System2 + System1 y el protocolo RoboCasa365; su uso fuera de ese contexto (por ejemplo, como VLM generalista) no está validado.
- Dependencia del System1: los resultados del 54,3 % global se obtuvieron con `yinpei-tri-pi/robocasa-system1-pi05-progact` y todo el direccionamiento por lenguaje activado; cambiar el ejecutor o desactivar ese direccionamiento altera el rendimiento.
- Dependencia del cliente de evaluación: es obligatorio reproducir la política de muestreo `system2_4fps_32` de `media_policy.json`; desviarse de ella cambia la distribución de entrada respecto al entrenamiento.
- Brecha seen/unseen: el rendimiento cae de 51,5 % en composite-seen a 28,1 % en composite-unseen, lo que indica poca generalización a composiciones de tareas no vistas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; en un planificador, una evaluación errónea del subobjetivo puede provocar replanificaciones incorrectas o bucles.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3-VL-4B-Instruct.
- Despliegue: el autor indica vLLM 0.19.1; otras versiones o runners no están validados. El repositorio ocupa 9,7 GB.
- Métricas limitadas a un único benchmark de simulación; no hay datos de transferencia a robots reales ni de latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yinpei-tri-pi/robocasa-system2-qwen3vl-4b
- System1 pareja: https://huggingface.co/yinpei-tri-pi/robocasa-system1-pi05-progact
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de evaluación sys1_sys2 (referenciado en la model card como origen de `scripts/serve_system2.sh`): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
