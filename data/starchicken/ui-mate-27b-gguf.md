# starchicken/UI-Mate-27B-GGUF

## Resumen

UI-Mate-27B es un modelo de agente GUI (graphical user interface) de código abierto desarrollado por Tencent HY Frontier, basado en Qwen3.6-27B. Está diseñado para observar capturas de pantalla en tiempo real, razonar sobre el estado visible de un escritorio y generar acciones estructuradas de teclado y ratón compatibles con pyautogui. El repositorio `starchicken/UI-Mate-27B-GGUF` proporciona cuantizaciones comunitarias en formato GGUF, incluyendo el proyector de visión (`mmproj`) necesario para entrada de imágenes.

El modelo combina un enfoque híbrido de arquitectura (Gated DeltaNet) con un entrenamiento en dos fases: ajuste fino supervisado seguido de aprendizaje por refuerzo online en entornos GUI ejecutables. Soporta dos modos de operación: ejecución general por instrucciones y ejecución guiada por demostraciones, lo que permite adaptar flujos de trabajo reutilizables. Con 26.9 mil millones de parámetros y una ventana de contexto nativa de 262K tokens, está orientado a tareas de automatización de escritorio en entornos controlados, con un rendimiento destacado en benchmarks como OSWorld-Verified (77.0) y WindowsAgentArena (66.2).

La relevancia actual de este modelo radica en que democratiza el acceso a agentes GUI de alto rendimiento bajo licencia Apache-2.0, permitiendo a desarrolladores e investigadores integrar capacidades de computer-use en sus propios sistemas sin depender de APIs propietarias. La disponibilidad de cuantizaciones GGUF facilita su despliegue en hardware de consumo, como GPUs de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-family Gated DeltaNet híbrida (qwen35), 64 capas, hidden 5120 |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (nativo) |
| Tipos de cuantizacion | Q4_K_M (15.4 GB), Q6_K (20.6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyector de visión mmproj en F16) |

## Arquitectura y entrenamiento

UI-Mate-27B se basa en Qwen3.6-27B, que emplea una arquitectura híbrida denominada `qwen35` con capas de Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en contextos largos. El modelo tiene 64 capas con dimensión oculta de 5120 y soporta una ventana de contexto nativa de 262K tokens. La conversión a GGUF se realizó con llama.cpp b10437, excluyendo la cabeza MTP (multi-token prediction) mediante la opción `--no-nextn`, pero incluyendo el proyector de visión en formato F16.

El entrenamiento consta de dos fases: primero un ajuste fino supervisado sobre tareas de interacción con GUI, y posteriormente un aprendizaje por refuerzo online en entornos GUI ejecutables. El modelo recibe como entrada la instrucción de la tarea, capturas de pantalla, historial de interacción y, opcionalmente, contexto de demostración. Como salida genera razonamiento (`reasoning_content`), una descripción concisa de la acción y llamadas a herramientas estructuradas para computer-use. El espacio de acciones incluye ratón, teclado, scroll, espera, interacción con el usuario y finalización de tarea.

## Capacidades

- Generación de acciones GUI estructuradas: produce llamadas a herramientas compatibles con pyautogui para controlar ratón y teclado en entornos de escritorio.
- Razonamiento multimodal: interpreta capturas de pantalla en tiempo real y razona sobre el estado visible de la interfaz.
- Modo de ejecución general: ejecuta tareas descritas en lenguaje natural a partir de capturas de pantalla en vivo.
- Modo guiado por demostraciones: adapta un flujo de trabajo extraído de una demostración exitosa a una nueva tarea, mejorando la tasa de éxito en tareas complejas.
- Razonamiento encadenado: genera `reasoning_content` antes de la respuesta final, lo que permite trazar el proceso de decisión.
- Soporte de tool calling: integra llamadas a funciones estructuradas para acciones de computer-use.
- Capacidades multilingües: no se han publicado datos específicos, pero al estar basado en Qwen3.6-27B, es probable que herede el soporte multilingüe de la familia Qwen (no confirmado en la documentación).
- Contexto largo: ventana nativa de 262K tokens, adecuada para historiales de interacción extensos.

## Casos de uso

- Automatización de pruebas de software: el modelo puede ejecutar flujos de prueba en aplicaciones de escritorio observando capturas de pantalla y generando acciones de ratón y teclado, reduciendo el esfuerzo manual en entornos de QA.
- Asistencia remota a usuarios: integrado en herramientas de soporte, puede guiar o ejecutar acciones en el escritorio del usuario para resolver incidencias comunes, como configurar ajustes o navegar por menús.
- Extracción de datos de aplicaciones legadas: para sistemas sin API, el modelo puede leer información de pantalla y realizar operaciones de copiado o exportación, automatizando tareas repetitivas.
- Automatización de flujos de trabajo administrativos: procesamiento de formularios, relleno de campos y navegación entre ventanas en aplicaciones de gestión empresarial.
- Entrenamiento de agentes en entornos simulados: investigadores pueden usar el modelo como base para estudiar aprendizaje por refuerzo en entornos GUI, gracias a su licencia abierta y su capacidad de razonamiento.
- Creación de asistentes personales de escritorio: combinado con un runtime externo, puede ejecutar tareas como organizar archivos, abrir aplicaciones o gestionar correos electrónicos mediante instrucciones en lenguaje natural.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en benchmarks de ejecución de tareas GUI:

| Benchmark | Puntuación |
|---|---|
| OSWorld-Verified · average score | 77.0 |
| WindowsAgentArena · average score | 66.2 |
| OSWorkerBench · strict success | 41.00 |
| OSWorkerBench · progress | 76.86 |

En el modo guiado por demostraciones (subconjunto OSWorkerBench, 33 tareas), se observa una mejora significativa:

| Métrica | Solo instrucción | + una demostración |
|---|---|---|
| strict success | 17.17 | 35.35 (+18.18 pp) |
| progress | 67.85 | 81.14 (+13.29 pp) |

Rendimiento de inferencia medido en una RTX 3090 con cuantización Q4_K_M y ngl 999:

| Métrica | Valor |
|---|---|
| pp512 | 1341 t/s |
| tg128 | 42.3 t/s |
| VRAM (Q4_K_M + mmproj, 64K ctx) | ~19.7 GB |

## Requisitos de hardware

- La cuantización Q4_K_M (15.4 GB) está recomendada para GPUs de 24 GB, como RTX 3090 o RTX 4090, con un consumo de VRAM de aproximadamente 19.7 GB incluyendo el proyector de visión y 64K de contexto.
- La cuantización Q6_K (20.6 GB) requiere al menos 24 GB de VRAM y es adecuada para contextos moderados.
- El proyector de visión (`mmproj-UI-Mate-27B-F16.gguf`, 0.86 GB) es obligatorio para entrada de imágenes.
- Se requiere llama.cpp versión b10437 o superior para soportar la arquitectura `qwen3_5` y Gated DeltaNet.
- Opciones de despliegue: llama.cpp server, llama-swap, LM Studio y cualquier cliente compatible con API OpenAI.
- En una RTX 3090, la latencia de generación es de aproximadamente 42.3 tokens por segundo (tg128), lo que permite interacción en tiempo casi real.
- Para tareas de larga duración, se recomienda configurar `--n-predict` con valores generosos (p. ej., 8192) debido al modo de razonamiento.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (agentes GUI) en la información proporcionada. La model card no incluye comparaciones con alternativas como UI-TARS, OS-Atlas o modelos propietarios. Se recomienda consultar el paper oficial de UI-Mate (citado en la documentación) para obtener una comparativa detallada.

## Limitaciones y advertencias

- El modelo está pensado para entornos de escritorio controlados; su rendimiento puede degradarse con variaciones en versiones de aplicaciones, resoluciones de pantalla, escalado de visualización o latencia del sistema.
- Riesgo de alucinación en la interpretación de capturas de pantalla: puede generar acciones incorrectas si el estado visual es ambiguo o inesperado.
- Vulnerabilidad a prompt injection: las instrucciones maliciosas presentes en la interfaz pueden alterar el comportamiento del agente.
- Requiere un runtime externo para ejecutar las acciones predichas; el modelo solo genera las llamadas a herramientas.
- No se debe utilizar en flujos de trabajo no supervisados, de alto riesgo o destructivos sin confirmación humana.
- El éxito reportado por el modelo no garantiza que la tarea se haya completado correctamente; es necesario verificar el estado final de la aplicación.
- Los idiomas soportados no están documentados explícitamente, aunque es probable que herede las capacidades multilingües de Qwen3.6-27B.
- La cabeza MTP no está incluida en la conversión GGUF, lo que podría afectar a la velocidad de generación en comparación con el modelo original.

## Enlaces

- Repositorio HuggingFace de la cuantización GGUF: https://huggingface.co/starchicken/UI-Mate-27B-GGUF
- Modelo original (Tencent/UI-Mate-27B): https://huggingface.co/tencent/UI-Mate-27B
- Repositorio GitHub de Tencent UI-Mate: https://github.com/Tencent/UI-Mate
- Página del proyecto: https://ui-mate.github.io/
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
