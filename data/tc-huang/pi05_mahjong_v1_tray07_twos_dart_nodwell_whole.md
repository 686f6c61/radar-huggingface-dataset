# tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell_whole

## Resumen

Este modelo es un fine-tune de pi0.5 (pi05), un modelo vision-language-action (VLA) desarrollado originalmente por Physical Intelligence y distribuido en formato LeRobot por tc-huang. Está especializado en una tarea concreta de manipulación robótica: coger, entre siete fichas de mahjong colocadas en cualquier posición sobre una superficie de espuma, la ficha que indique una instrucción en lenguaje natural y depositarla en una bandeja. El modelo se ha entrenado sobre el brazo SO-101 dentro de la tarea `Mahjong-Tray7TwosFaces-SO101-v1` de Isaac Lab.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento metodológico sobre la eliminación de tramos de "hover" (pausas de 1 a 4 segundos antes del descenso de la pinza) del dataset de demostraciones, un problema recurrente en el aprendizaje por imitación que provoca que la política se quede detenida sobre el objeto. Por otro, sirve como ejemplo de cadena de fine-tuning incremental sobre un modelo base VLA grande.

El modelo tiene 4.143.404.816 parámetros (~4,14 mil millones, dato real del `safetensors`), se distribuye bajo licencia Gemma y solo se ha validado en simulación; el autor indica explícitamente que no se ha ejecutado sobre un brazo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en el modelo pi0.5 (contiene PaliGemma: codificador visual SigLIP + modelo de lenguaje Gemma); no se detalla la configuracion interna en la model card |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible; las instrucciones de tarea estan en ingles (`Pick up the {name} tile and place it in the tray.`) y no se documenta soporte multilingue para este fine-tune |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (repositorio de 33,1 GB, con checkpoints en ramas `step-<step>` cada 1.250 pasos) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, que contiene PaliGemma, y se ha ajustado de forma incremental: `..._tray07_twos_30k` -> checkpoint step-010000 de la variante DART -> checkpoint step-005000 de la variante `nodwell` -> este modelo. El ajuste ha supuesto 2.500 pasos con batch de 16, todos los parametros entrenables con el codificador SigLIP descongelado, learning rate de 2,5e-5 con 250 pasos de warmup y decaimiento coseno hasta 2,5e-6. Los pesos, gradientes y el estado de AdamW (fused) se mantienen en float32, mientras que el forward y el backward se ejecutan con autocast en bf16 y sin gradient checkpointing.

Los datos de entrenamiento son `tc-huang/mahjong_v1_tray07_twos_dart`: 1.000 demostraciones scriptadas, 318.191 fotogramas a 30 fps, con el brazo empujado fuera de las posiciones de hover (estilo DART) y cada paso etiquetado con el objetivo que la demostración pretendia. La innovacion tecnica central es el filtrado de datos: se excluyen como muestras de entrenamiento los fotogramas del hover sostenido y aquellos cuyo estado del brazo queda a menos de 1,5 grados, en cualquier articulacion, de la pose desde la que arranca el descenso y que esperan mas de 15 fotogramas antes de bajar. Esto elimina el 17,6 % de los fotogramas. La normalizacion de estados y acciones usa los cuantiles q01 y q99 globales de todo el dataset (calculo de openpi), en lugar de la media de los cuantiles por episodio de LeRobot 0.6.1.

## Capacidades

- Control robótico de brazo SO-101 mediante politica VLA en simulacion (Isaac Lab).
- Seguimiento de instrucciones en lenguaje natural para seleccionar un objeto por nombre entre siete candidatos.
- Manipulacion pick-and-place: coger una ficha y depositarla en una bandeja.
- Percepcion visual de escena con multiples objetos, integrada mediante el codificador SigLIP.
- Generacion de "action chunks": la politica predice secuencias de acciones, no solo el siguiente paso.
- Robustez parcial ante perturbaciones de estilo DART (empujones que desplazan el brazo del hover), por el tipo de datos de entrenamiento.
- Reduccion del dwell en el hover sobre el objeto, que es precisamente lo que el filtrado de datos pretende corregir.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio o vision general fuera de la tarea.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar este checkpoint y sus predecesores (`nodwell`, `dart`, `30k`) para aislar el efecto del filtrado de fotogramas de hover sobre la tasa de exito final.
- Generacion y evaluacion de politicas VLA en Isaac Lab: ejecutar la tarea `Mahjong-Tray7TwosFaces-SO101-v1` de forma automatizada para medir estabilidad de la politica en bucle cerrado.
- Estudio de language grounding: el modelo debe asociar un nombre de ficha con su instancia visual entre siete objetos y actuar en consecuencia, lo que lo hace util para medir comprension de referencias en escenas con distractores.
- Banco de pruebas de tecnicas de curado de datasets: la comparativa entre la variante `nodwell` (que elimina fotogramas del hover por estado) y esta variante `whole` (que elimina por duracion, mas de 15 fotogramas) permite comparar heuristicas de filtrado.
- Simulacion previa a despliegue real: dado que solo se ha entrenado en simulacion, sirve como paso intermedio para evaluar la brecha sim-a-real antes de intentar una transferencia a un SO-101 fisico.
- Integracion en pipelines de LeRobot 0.6.1: el modelo es cargable con la libreria `lerobot` y puede encadenarse en flujos de entrenamiento o evaluacion reproducibles.
- Docencia y divulgacion: ejemplo compacto (4,14 mil millones de parametros) de un VLA con instrucciones en lenguaje natural y una tarea de manipulacion verificable en simulacion.
- Analisis de robustez ante perturbaciones: el entrenamiento con demostraciones empujadas permite estudiar la recuperacion de la politica cuando se altera la trayectoria nominal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con el texto literal "To be added", por lo que no existen tasas de exito, metricas de tarea ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 8,3 GB en bf16 y 16,6 GB en fp32 (estimacion a partir de los 4.143.404.816 parametros; el autor no publica precision de almacenamiento de los pesos distribuidos).
- VRAM estimada para inferencia: del orden de 10-14 GB en bf16 contando activaciones del codificador visual y del decodificador de acciones (estimacion propia, no confirmada por el autor); alrededor de 17-20 GB en fp32.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16; A100 o H100 para reproducir el entrenamiento con margen holgado.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas siempre que se use bf16 y un tamano de lote reducido; en 12 GB es probable que requiera cuantizacion, no publicada.
- Opciones de despliegue: libreria `lerobot` 0.6.1 para carga del modelo y ejecucion de la politica; Isaac Lab como entorno de simulacion. No hay soporte documentado ni pesos para vLLM, TGI, llama.cpp u Ollama, dado que es un modelo de accion y no un LLM de texto.
- Latencia y throughput: no disponible. El dataset de entrenamiento esta grabado a 30 fps, lo que da una referencia de la frecuencia de control esperada, pero no se documenta la latencia de inferencia real.
- Almacenamiento: el repositorio completo ocupa 33,1 GB por las multiples ramas de checkpoints; para inferencia solo se necesita la rama deseada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| `pi05_mahjong_v1_tray07_twos_dart_nodwell_whole` (este) | 4.143.404.816 | no disponible | 318.191 fotogramas; excluye hover de mas de 15 fotogramas (17,6 %) | Gemma | sin evaluacion publicada |
| `tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell` | no disponible (mismo modelo base) | no disponible | Excluye fotogramas del hover por estado; desciende desde el hover grabado de forma offline; mantiene el dwell en bucle cerrado | Gemma | sin evaluacion publicada |
| `tc-huang/pi05_mahjong_v1_tray07_twos_dart` (checkpoint step-010000) | no disponible (mismo modelo base) | no disponible | Demostraciones con empujones DART; encuentra la ficha pero se queda sostenida sobre ella | Gemma | sin evaluacion publicada |
| `tc-huang/pi05_mahjong_v1_tray07_twos_30k` | no disponible (mismo modelo base) | no disponible | Demostraciones de 30k pasos; punto de partida de la cadena DART | Gemma | sin evaluacion publicada |

No se dispone de datos de otros VLA de manipulacion comparables dentro de la informacion proporcionada; la comparativa se limita a los checkpoints de la propia cadena de fine-tuning.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion; el autor declara que no se ha ejecutado sobre un brazo real, por lo que la transferencia sim-a-real no esta validada.
- Sin resultados de evaluacion publicados ("To be added"): no hay evidencia cuantitativa de que el filtrado del hover resuelva el problema que motiva esta variante.
- La tarea esta acotada a siete fichas de mahjong, dos caras ("twos faces") y un unico tipo de bandeja; no generaliza a otras tareas de manipulacion.
- Dependencia del entorno Isaac Lab y del brazo SO-101; cambiar el robot, la camara o la mesa invalida la politica.
- Las instrucciones estan en ingles y siguen una plantilla fija; no se documenta robustez ante parafrasis, otros idiomas o instrucciones ambiguas.
- Riesgo de alucinacion de acciones: como politica de imitacion, puede generar secuencias de movimiento plausibles pero incorrectas ante estados visuales fuera de la distribucion de entrenamiento.
- Sesgos y limitaciones de contexto: no disponibles por ausencia de evaluacion; el modelo hereda las caracteristicas del PaliGemma subyacente, no descritas en la model card.
- Licencia Gemma: es una "Model Derivative of Gemma", sujeta a los Gemma Terms of Use y a las restricciones de uso de la seccion 3.2, incluida la Gemma Prohibited Use Policy. Estas restricciones deben transmitirse a terceros que redistribuyan el modelo.
- Los fotogramas de entrenamiento incluyen caras de fichas de mahjong adaptadas de `Mahjong_eg_TW.jpg` de Cangjie6 bajo CC BY-SA 4.0, y modelos del brazo SO-101 de `newton-assets` y `TheRobotStudio/SO-ARM100` bajo Apache-2.0; hay obligaciones de atribucion asociadas.
- Aviso de produccion: cero descargas y cero "likes" en el momento de redactar la ficha, sin senales de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell_whole
- Modelo base de este fine-tune: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell
- Checkpoint previo de la cadena DART (step-010000): https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_dart
- Checkpoint inicial de la cadena: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/tc-huang/mahjong_v1_tray07_twos_dart
- Modelo base de la familia: https://huggingface.co/lerobot/pi05_base
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio openpi (referenciado para el calculo de cuantiles): https://github.com/Physical-Intelligence/openpi
- Modelos del brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
- Activos de simulacion del brazo (newton-assets): https://github.com/newton-physics/newton-assets
- Imagen de caras de mahjong original (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Isaac Lab: no se proporciona enlace en la informacion disponible.
