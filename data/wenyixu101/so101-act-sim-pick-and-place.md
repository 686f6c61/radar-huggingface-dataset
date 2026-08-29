# wenyixu101/so101-act-sim-pick-and-place

## Resumen

El modelo `wenyixu101/so101-act-sim-pick-and-place` es una política ACT (Action Chunking with Transformers) entrenada para la tarea simulada de pick-and-place de un cubo con el brazo robótico SO-101, utilizando observaciones sincronizadas de dos cámaras RGB (frontal y de muñeca). Ha sido desarrollado por wenyixu101 como artefacto de investigación reproducible dentro del proyecto Farpoint, y se publica bajo licencia Apache-2.0 en formato LeRobot. El checkpoint liberado corresponde al paso 200.000 de entrenamiento, con 51,7 millones de parámetros, y está pensado exclusivamente para experimentación en simulación, no para despliegue en robots reales.

La relevancia de este modelo radica en que documenta de forma transparente un pipeline completo de imitación learning en simulación: dataset de 300 demostraciones con variaciones controladas de objeto, posición de la diana y pose de cámara, entrenamiento con un sampler congelado y evaluación autónoma con métricas desglosadas. Su publicación permite reproducir resultados y comparar checkpoints bajo condiciones fijas, algo poco habitual en la robótica open source. Sin embargo, el rendimiento autónomo es limitado (21,7% de éxito en 60 episodios), por lo que debe considerarse un baseline de investigación, no una solución operativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión-acción) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un enfoque de imitación learning que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. En este caso, las observaciones consisten en imágenes sincronizadas de 640×480 píxeles de una cámara frontal y otra de muñeca, junto con las variables de estado del brazo. La política se entrenó desde inicialización aleatoria durante 200.000 pasos de optimización, utilizando un dataset de 300 demostraciones nominales generadas en simulación (Isaac Lab), con dos variantes de cubo (azul de 30 mm/30 g y rojo de 40 mm/40 g), tres perfiles de posición de la diana y cinco perfiles de pose de cámara externa. El entrenamiento empleó un sampler congelado de 30 celdas (2 cubos × 3 dianas × 5 cámaras), con nueve episodios por celda y un total de 1,6 millones de muestras de entrenamiento. La pérdida media de validación con teacher forcing en el paso 200.000 fue de 0,0328. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Ejecución de tareas de pick-and-place de un cubo en un entorno simulado SO-101, con control de posición y liberación del objeto.
- Generalización a variaciones de propiedades del cubo (tamaño, masa, color), posición de la diana y pose de cámara externa, dentro de los rangos cubiertos por el dataset de entrenamiento.
- Procesamiento de observaciones visuales sincronizadas de dos cámaras (frontal y de muñeca) a 30 Hz.
- Generación de acciones de control del brazo con limitación de rango y suavizado de comandos (action-safety profile `so101-viam-50deg-s-v1`).
- Reproducibilidad completa: el checkpoint incluye hashes SHA256 del modelo, del dataset y de los commits de código de entrenamiento y evaluación.
- No soporta generación de texto, tool calling, razonamiento simbólico ni capacidades multimodales más allá de la entrada visual para control motor.

## Casos de uso

- Reproducción de experimentos de imitación learning: el checkpoint puede cargarse con LeRobot (`ACTPolicy.from_pretrained`) para replicar exactamente los resultados publicados, útil para verificar la reproducibilidad de pipelines de robótica.
- Estudio de generalización en simulación: permite analizar cómo varía el éxito según el tipo de cubo, la posición de la diana o la pose de cámara, sirviendo como banco de pruebas para investigar sesgos en políticas de imitación.
- Comparación de checkpoints bajo rollouts autónomos congelados: al estar fijados los escenarios de evaluación, se puede usar como baseline para medir mejoras de otras políticas ACT o de otros algoritmos.
- Educación en robótica y aprendizaje por imitación: su tamaño reducido (51,7 M parámetros) y su licencia permisiva lo hacen adecuado para cursos universitarios que necesiten un ejemplo completo de entrenamiento y evaluación de una política visual.
- Desarrollo de pipelines de sim-to-real: aunque este modelo no ha sido transferido a un robot real, sirve como punto de partida para estudiar estrategias de adaptación, dado que el entorno de simulación es compatible con Isaac Lab.
- Validación de infraestructura de evaluación: los datos de acción-safety (comandos limitados, recortes de rango, ausencia de acciones no finitas) permiten probar sistemas de supervisión de seguridad en entornos simulados antes de usarlos en hardware.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación autónoma sobre 60 episodios (dos réplicas de 30 celdas holdout con semillas independientes). No se han publicado comparaciones con otros modelos en la información disponible.

| Métrica | Resultado |
|---|---:|
| Éxito de tarea | 13/60 (21,7%) |
| Intervalo de confianza Wilson 95% | 13,1% – 33,6% |
| Contacto con cubo | 60/60 |
| Contacto bilateral | 53/60 |
| Agarre estable | 53/60 |
| Elevación | 52/60 |
| Entrada en diana | 16/60 |
| Liberación tras elevación | 26/60 |
| Liberación estable | 13/60 |

Desglose por variante de cubo:

| Variante | Éxito | IC Wilson 95% | Contacto | Elevación | Entrada en diana |
|---|---:|---:|---:|---:|---:|
| Azul (30 mm / 30 g) | 11/30 (36,7%) | 21,9% – 54,5% | 30/30 | 26/30 | 13/30 |
| Rojo (40 mm / 40 g) | 2/30 (6,7%) | 1,8% – 21,3% | 30/30 | 26/30 | 3/30 |

Desglose por diana y pose de cámara:

| Estrato | Éxito |
|---|---:|
| Diana A | 2/20 |
| Diana B | 7/20 |
| Diana C | 4/20 |
| Cámara frontal nominal | 2/12 |
| Cámara frontal X negativa | 0/12 |
| Cámara frontal X positiva | 3/12 |
| Cámara frontal Y/Z negativa | 5/12 |
| Cámara frontal Y/Z positiva | 3/12 |

Observaciones de seguridad de acciones: 4.625 comandos limitados en delta, 1.728 recortes de rango duro antes de ejecución, exceso máximo de rango duro de 3,395 unidades calibradas, cero acciones no finitas, y los 120 vídeos de las cámaras se decodificaron correctamente.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que lo hace extremadamente ligero para inferencia. En formato float32, el checkpoint ocupa aproximadamente 207 MB; en float16, unos 103 MB.
- VRAM estimada para inferencia: menos de 1 GB en float16, por lo que cabe en cualquier GPU consumer moderna (desde una GTX 1060 de 6 GB en adelante) e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; una RTX 3060 o superior es más que suficiente. No se requieren GPUs de datacenter.
- Opciones de despliegue: al ser un modelo LeRobot, puede ejecutarse con el framework LeRobot, que soporta inferencia en PyTorch. También es posible exportarlo a otros formatos, aunque no se documentan conversiones a ONNX o TensorRT.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño reducido y la naturaleza de la tarea (control a 30 Hz), se espera que la inferencia sea muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y otras políticas ACT para SO-101. Existen otros checkpoints en HuggingFace, como `wenyixu101/Farpoint-V0-ACT` (del mismo autor, también para pick-and-place simulado) y `ViVi-AI/ACT_so101_pick_place`, pero no se han encontrado métricas de evaluación comparables en la información disponible. Se recomienda consultar los repositorios respectivos para obtener detalles.

## Limitaciones y advertencias

- El modelo fue entrenado y evaluado únicamente en simulación; no se ha demostrado transferencia sim-to-real ni seguridad en robots reales.
- El rendimiento autónomo es bajo (21,7% de éxito) y no es fiable para despliegue en ningún entorno operativo.
- Existe un fuerte desequilibrio entre variantes de cubo: el éxito con el cubo azul es del 36,7%, mientras que con el rojo es del 6,7%, lo que indica una generalización deficiente a objetos más grandes y pesados.
- La fase de transporte es el punto de fallo dominante: 36 de 60 episodios elevaron el cubo pero nunca entraron en la diana.
- La generalización a poses de cámara es desigual; el perfil de cámara frontal con X negativa obtuvo 0/12 éxitos.
- Las salidas brutas de la política requieren recorte de rango absoluto y limitación de slew (suavizado de comandos) antes de su ejecución; no son seguras sin procesamiento adicional.
- El dataset de entrenamiento contiene solo 300 demostraciones, lo que limita la cobertura de variaciones y la robustez.
- Este checkpoint no es adecuado para operación no supervisada en robots reales; debe usarse exclusivamente con fines de investigación y educación en simulación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wenyixu101/so101-act-sim-pick-and-place
- Dataset de entrenamiento: https://huggingface.co/datasets/wenyixu101/so101-sim-pick-and-place
- Repositorio Farpoint (código de entrenamiento y evaluación): https://github.com/xuwenyihust/farpoint
- Guía de entrenamiento ACT para SO-101 con SOLO CLI: https://github.com/omkarputti/SO101_ACT_Training
- Checkpoint Farpoint-V0-ACT (mismo autor): https://huggingface.co/wenyixu101/Farpoint-V0-ACT
- Checkpoint ACT_so101_pick_place de ViVi-AI: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Tutorial de NVIDIA para sim-to-real con SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Dataset de oracle en simulación (claru.ai): https://claru.ai/datasets/wenyixu101-so101-sim-oracle-pick-and-place
