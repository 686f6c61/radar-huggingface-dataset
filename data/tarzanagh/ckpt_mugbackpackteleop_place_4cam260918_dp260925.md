# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dp260925

## Resumen

Este repositorio contiene un checkpoint de política visomotora entrenada por imitación (imitation learning) para una tarea concreta de manipulación bimanual y diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una mochila abierta con la mano izquierda y deposita una taza en su interior con la derecha. El modelo se etiqueta como "Diffusion Policy" y forma parte de una serie de ocho ejecuciones comparables del mismo conjunto de datos, con variantes basadas en GR00T, pi0.5 y ACT, con y sin entrada táctil.

Se trata de un modelo pequeño para los estándares actuales: 267.483.430 parámetros (unos 267 M) y un repositorio de 1,1 GB, coherente con un único checkpoint en fp32. La entrada combina cuatro cámaras RGB a 640x360 y 30 fps con un vector de estado/acción de 38 dimensiones que codifica posiciones articulares de ambos brazos (7+7) y ambas manos (12+12). La política observa el estado real cada 16 pasos y predice un bloque (chunk) de acciones, del cual solo se ejecutan las 16 primeras.

Su relevancia es acotada y de carácter investigador: no es un modelo de propósito general ni un sistema listo para producción, sino una referencia reproducible para comparar familias de políticas de manipulación bimanual. El autor publica explícitamente los errores en bucle abierto sobre el conjunto reservado y advierte de que no se ha ejecutado nada en hardware real ni se ha medido la tasa de éxito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (Diffusion Policy) para imitación visomotora; detalles internos del backbone y del proceso de denoising no disponibles |
| Parametros totales | 267.483.430 (dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación con re-observación cada 16 pasos y horizonte de acción de 16 pasos ejecutados (chunk predicho, tamaño total no documentado) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en precisión completa, sin variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No aplica; es una política visomotora y no se documenta condicionamiento por lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | 4 cámaras RGB 640x360 a 30 fps + vector de estado de 38-D |
| Salida | Vector de acción de 38-D `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` (posiciones articulares) |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Datos de entrenamiento | 31 episodios de teleoperación (guante de captura de movimiento, sin exoesqueleto; seguimiento de muñeca con Vive); 27 de entrenamiento y 4 reservados (uno de cada 10) |
| Pasos de entrenamiento | 10.000, semilla 1000 |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion en el Hub | 2026-09-25 (según metadatos de HuggingFace) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La model card identifica el modelo como una Diffusion Policy aplicada a XHand1 sobre DexMate Vega, dentro de la familia de políticas que aprenden por imitación generando bloques de acciones mediante un proceso de difusión. No se documentan en el repositorio el codificador visual empleado, el número de pasos de denoising, la dimensionalidad latente ni la composición exacta del bloque de acciones, por lo que esos extremos quedan como no disponibles. Lo que sí se especifica es el bucle de control: la política recibe la observación real cada 16 pasos, predice un chunk de acciones y solo se conservan las 16 primeras.

El entrenamiento se realizó sobre 31 episodios de teleoperación, con una partición de 27 episodios para entrenamiento y 4 reservados (seleccionados tomando uno de cada diez). Cada episodio aporta cuatro flujos RGB a 640x360 y 30 fps, junto con el vector de 38 dimensiones que fusiona las articulaciones de brazo y mano de ambos lados. La model card no menciona etapas de RLHF, DPO ni aprendizaje por refuerzo; el paradigma es puramente de imitación supervisada a partir de demostraciones. También se señala que la entrada táctil no produjo diferencias consistentes en esta familia de políticas, aunque el autor mantiene ejecuciones separadas con y sin tacto para su comparación.

## Capacidades

- Generación de trayectorias de acción de 38 dimensiones para control articular de un robot bimanual con manos diestras.
- Manipulación bimanual coordinada: sostener un objeto con una mano mientras la otra realiza una tarea de colocación.
- Percepción visomotora a partir de cuatro cámaras RGB simultáneas a 640x360 y 30 fps.
- Ejecución por bloques de acción (action chunking) con re-observación cada 16 pasos, lo que reduce la frecuencia de inferencia del modelo.
- Control específico de manos RobotEra XHand1 (12 grados de libertad por mano, presumiblemente, dado el vector de 12 dimensiones por mano).
- Reproducción de demostraciones de teleoperación recogidas con guante de captura de movimiento y seguimiento Vive.
- No soporta tool calling, function calling ni uso como agente conversacional.
- No dispone de modo de razonamiento explícito (thinking mode), ni de capacidades de audio o visión general más allá de la percepción necesaria para la tarea.
- No se documenta capacidad multilingüe ni procesamiento de instrucciones en lenguaje natural.

## Casos de uso

- Reproducción de una línea base de investigación: el checkpoint sirve para replicar el error en bucle abierto publicado y comparar futuras políticas de manipulación bimanual contra una referencia estable y de tamaño reducido.
- Ablación de políticas de difusión frente a otras familias: al existir ejecuciones hermanas con GR00T, pi0.5 y ACT sobre el mismo conjunto de datos, este checkpoint permite aislar el efecto de la arquitectura manteniendo constantes los datos y la tarea.
- Estudio del efecto de la entrada táctil: la pareja de checkpoints con y sin tacto (este y dptactile260925) permite analizar si la señal táctil mejora la imitación en tareas de inserción de precisión.
- Ajuste fino para hardware propio: un laboratorio con un robot bimanual articulado de 38 grados de libertad puede reentrenar o afinar el modelo con sus propias demostraciones para una tarea de colocación similar.
- Investigación sobre chunking y frecuencia de re-planificación: el esquema de observar cada 16 pasos y ejecutar 16 acciones es un caso de estudio directo para medir el compromiso entre latencia de cómputo y calidad de seguimiento de trayectoria.
- Validación en gemelo digital antes de despliegue: al no haberse probado en hardware, el checkpoint puede usarse para evaluar en simulación si el error en bucle abierto se traduce en éxito de tarea razonable.
- Docencia y formación en robótica de manipulación: el modelo es lo bastante pequeño para ejecutarse en una GPU de consumo, lo que lo hace adecuado para prácticas de aprendizaje por imitación en cursos de robótica.
- Referencia de latencia para inferencia con múltiples cámaras: permite medir el coste de procesar cuatro flujos de vídeo a 30 fps en GPUs de gama media y alta dentro de un bucle de control.

## Benchmarks y rendimiento

La única métrica publicada es el error en bucle abierto sobre el conjunto reservado (media del valor absoluto de la diferencia entre acción predicha y acción registrada, en radianes, con error estándar de la media, n=4). El autor advierte explícitamente de que mide seguimiento de trayectoria y no éxito de tarea.

| Metrica (rad) | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (Diffusion Policy) | 0,0315 ± 0,0031 | 0,0285 ± 0,0028 | 0,0449 ± 0,0023 | 0,0362 ± 0,0049 |
| Referencia hold-first-frame | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Según la model card, GR00T obtuvo el error más bajo de las cuatro familias comparadas, aproximadamente tres veces por debajo de Diffusion Policy en esta tarea. No se publican resultados de tasa de éxito, ni evaluaciones en hardware, ni métricas estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a una política visomotora.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 1,07 GB en fp32 (267,5 M de parámetros a 4 bytes), coherente con el tamaño de repositorio de 1,1 GB; en bf16 o fp16 bajaría a unos 0,53 GB, aunque no se publican variantes de menor precisión.
- VRAM total estimada para inferencia: del orden de 2 a 4 GB teniendo en cuenta activaciones del codificador visual y los cuatro flujos de imagen de 640x360. Es una estimación no verificada por el autor.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y equivalentes, siempre que el bucle de control tolere la latencia resultante.
- GPUs de centro de datos como A100 o H100 están muy sobredimensionadas para inferencia de 267 M de parámetros, pero son razonables para reentrenamiento o para recogida y procesado de datos a mayor escala.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras plataformas de servicio de modelos de lenguaje; estas herramientas no son aplicables a una política de control.
- El despliegue requiere un stack propio en PyTorch sobre safetensors; no se documentan exportaciones a ONNX o TensorRT, ni nodos de integración con ROS o ROS 2.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia, y el requisito real depende de que el bucle de control pueda procesar cuatro cámaras a 30 fps con re-observación cada 16 pasos.

## Comparativa con modelos similares

Los comparables directos son las ejecuciones hermanas del mismo autor sobre idéntica tarea, datos, cámaras y partición, lo que hace la comparación especialmente limpia.

| Modelo | Familia | Parametros | Entrada | Error bucle abierto | Licencia |
|---|---|---|---|---|---|
| dp260925 (este checkpoint) | Diffusion Policy | 267,5 M | 4 cam RGB + estado 38-D | 0,0285-0,0449 rad segun articulacion | Apache 2.0 |
| gr00t3b260924 | GR00T (nombre de repositorio con etiqueta 3B) | No disponible con precision; el nombre sugiere ~3B | La misma tarea y sensores | Aproximadamente 3x menor que Diffusion Policy | No disponible |
| pi05260924 | pi0.5 | No disponible | La misma tarea y sensores | No disponible en la informacion proporcionada | No disponible |
| act260924 | ACT | No disponible | La misma tarea y sensores | No disponible en la informacion proporcionada | No disponible |
| dptactile260925 | Diffusion Policy con tacto | No disponible | La misma tarea y sensores, con tacto | Sin diferencia consistente respecto a este modelo | Apache 2.0 (presumiblemente, mismo autor) |

Frente a modelos de propósito general como GR00T o pi0.5, la ventaja de este checkpoint es su tamano reducido, que facilita iteraciones rapidas y despliegue en GPU de consumo; su desventaja, en esta tarea concreta, es un error de seguimiento notablemente superior al de GR00T. No se dispone de datos de parametros, contexto ni rendimiento del resto de familias más allá de lo indicado.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para la secuencia concreta de sostener una mochila y colocar una taza; no generaliza a otras tareas sin reentrenamiento.
- No se ha ejecutado en hardware real. Todas las cifras proceden de error en bucle abierto sobre el conjunto reservado, que mide seguimiento de trayectoria y no éxito de tarea.
- El conjunto de evaluación es muy reducido: 4 episodios reservados, con n=4 en cada cifra y errores estándar del orden de 0,002 a 0,005 rad; la significación estadística de las diferencias es limitada.
- Sobreajuste plausible al entorno de recogida: 31 episodios y 10.000 pasos de entrenamiento implican una cobertura estrecha de iluminación, posiciones y variabilidad de objetos.
- Dependencia fuerte del hardware: la salida está definida para la cinemática de un DexMate Vega-1 con manos XHand1; usarla con otro robot exige remapear el espacio de acciones y reentrenar.
- No se documenta el comportamiento ante oclusiones, cambios de iluminación, objetos no vistos o fallos parciales de la pinza, lo que supone un riesgo alto en despliegues reales.
- Riesgo de acumulación de error en bucle cerrado: el esquema de re-observar cada 16 pasos puede amplificar desviaciones si la dinámica real difiere de las demostraciones.
- La entrada táctil no mostró mejoras consistentes en Diffusion Policy, según el propio autor, por lo que no debe asumirse que añadir tacto resuelva problemas de precisión.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero el autor no ofrece garantías ni soporte, y no hay validación de seguridad para operación con personas cerca.
- Sesgos conocidos: no evaluados ni documentados; en robótica, el sesgo relevante es el de las condiciones de demostración, que aquí no se caracterizan.
- Cero descargas y cero interacciones en el Hub en el momento de la consulta, lo que implica ausencia de validación independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dp260925
- Ejecución con GR00T: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Ejecución con GR00T y tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Ejecución con pi0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Ejecución con pi0.5 y tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Ejecución con ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Ejecución con ACT y tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Ejecución con Diffusion Policy y tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925
- Otro checkpoint del mismo autor en la misma plataforma: https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816
- Otro checkpoint del mismo autor: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260815
- Listado de modelos etiquetados con dexmate-vega: https://huggingface.co/models?other=dexmate-vega

Nota: el resto de resultados de la busqueda web (Tencent Hunyuan 3D, Civitai, Model Zoo) no guardan relacion con este modelo y se han descartado. No se han encontrado articulos, papers ni repositorios de codigo asociados a este checkpoint en la informacion disponible.
