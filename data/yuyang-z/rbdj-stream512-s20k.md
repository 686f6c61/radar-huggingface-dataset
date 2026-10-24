# Yuyang-z/rbdj-stream512-s20k

## Resumen

`rbdj-stream512-s20k` es un checkpoint de una política robótica visuomotora construida sobre un *world model* de vídeo con flow matching (familia SANA-RWM), en su variante *chunk-causal*. El identificador interno de la clase es `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewCausal_5B_P1_D36`, lo que indica un transformer de 5.000 millones de parámetros con 36 bloques, atención con sub-atención, condicionamiento por cámara multi-vista y un encoder de texto de la familia Qwen para las instrucciones. El modelo recibe observaciones visuales en un lienzo de 320x512 píxeles y emite 32 acciones absolutas de efector final (EEF) por *chunk* a 25 fps.

Lo publica el usuario Yuyang-z como *supervised fine-tuning* sobre episodios del simulador RoboDojo con el brazo ARX X5, en el paso 20.000 de un calendario de 50.000 (lr 1e-4 con decaimiento coseno, warmup 1.000, *instruction dropout* 0,1). Es el "gemelo streaming" del run N1 de zekail (`causal_robodojo_eefabs_sana_pixel_320x512_p14k_pretrain_aligned_f33fps8_episode_n1_videoonly`): mismo modelo, mismos datos y mismo calendario, pero con entrenamiento streaming al estilo LongLive, un *chunk* por ventana y paso, 512 *chunks* por paso (32 slots x 16 rangos) y memoria (sink K/V, window K/V y estado GDN) transportada entre pasos.

Su interés ahora es de reproducibilidad para investigación: se distribuyen los pesos en crudo (fp32 consolidado), el `config.yaml` con la receta, las estadísticas de normalización exactas con su sha256 y el `RUN_ID.json`. No hay métricas de éxito de tarea publicadas ni licencia declarada, y el repositorio no registra descargas ni *likes*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SANA-RWM: transformer *chunk-causal* con *world model* de vídeo y flow matching; sub-atención, condicionamiento de cámara multi-vista, memoria GDN (estado recurrente) más sink K/V y window K/V; encoder de texto Qwen |
| Parámetros totales | 5B (según el identificador de clase `..._5B_P1_D36`; el tamaño del repo, 17,9 GB en fp32, es coherente con ello) |
| Parámetros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible en tokens; operativamente, ventana softmax de 1 y memoria de episodio (sink K/V, window K/V, estado GDN) con 32 acciones por *chunk* a 25 fps |
| Tipos de cuantización | no documentados; el checkpoint se distribuye en fp32 (`model/pytorch_model_fsdp.bin`, consolidado). No se publican GGUF, int8 ni fp8 |
| Idiomas soportados | no disponible (las instrucciones se procesan con un encoder Qwen, pero no se declara cobertura de idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.bin` consolidado en fp32, más `metadata.pth`, `config.yaml`, carpeta `normalization/`, `RUN_ID.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura combina un *world model* de vídeo con un cabezal de acciones dentro de un mismo transformer causal de 5B parámetros y 36 bloques. El flujo de entrenamiento es de *chunk*: cada ventana procesa un *chunk* de 32 acciones absolutas de EEF a 25 fps (1,28 s de horizonte por *chunk*), condicionado por varias cámaras y por la instrucción textual, con un lienzo de píxeles de 320x512. La atención usa sub-atención con ventana softmax de 1, y la memoria de episodio se mantiene mediante sink K/V, window K/V y estado GDN (atención lineal de tipo gated delta net) sobre toda la secuencia del episodio; la memoria declarada es *video_only*.

Los datos son episodios de simulación RoboDojo con el robot ARX X5, tras un *pretrain* alineado (`pretrain_aligned`, `f33fps8`) y SFT sobre episodios. La receta: lr 1e-4 con decaimiento coseno hasta 50.000 pasos, warmup de 1.000, *instruction dropout* de 0,1 y *chunk* causal. La innovación frente al run N1 original es el régimen de entrenamiento streaming estilo LongLive: un *chunk* por ventana y paso, 512 *chunks* por paso repartidos en 32 slots por 16 rangos, con el estado de memoria arrastrado entre pasos en lugar de reiniciarse. En inferencia se mantiene sin cambios el esquema del modelo N1 de zekail: *video CFG* 6, *action CFG* 1, 10 pasos de flow matching y *shifts* 5 / 1.

## Capacidades

- Generación de acciones de control continuo: 32 acciones absolutas de efector final por *chunk*, a 25 fps, en el espacio de acciones del brazo ARX X5.
- Condicionamiento por instrucción en lenguaje natural mediante encoder de texto Qwen (con *instruction dropout* 0,1 durante el entrenamiento).
- Percepción multi-vista: el modelo está condicionado por cámara y por varias vistas simultáneas.
- Modelado de vídeo: componente de *world model* con flow matching, usable para *rollouts* de predicción visual (con *video CFG* 6 en inferencia).
- Memoria de episodio: estado persistente (sink K/V, window K/V, GDN) que permite continuidad entre *chunks* en lugar de replanificar desde cero.
- Inferencia streaming: capacidad de operar *chunk* a *chunk* manteniendo el estado, que es precisamente lo que distingue este checkpoint del run N1.
- No se documentan *tool calling*, *function calling*, agentes de múltiples pasos, matemáticas, código ni capacidades de audio.

## Casos de uso

- Evaluación de políticas en simulación RoboDojo: cargar el checkpoint con XPolicyLab `SANA_WAM_CAUSAL` y medir tasas de éxito en las tareas del simulador con el brazo ARX X5, que es el dominio exacto de entrenamiento.
- Estudio de memoria de largo plazo en políticas de imitación: comparar este run streaming contra el N1 no streaming con los mismos datos y calendario permite aislar el efecto de arrastrar sink K/V, window K/V y estado GDN entre pasos.
- Inferencia de control continuo a 25 fps: el horizonte de 1,28 s por *chunk* obliga a que cada ciclo de 10 pasos de flow matching se ejecute por debajo de ese presupuesto para mantener control reactivo.
- *Fine-tuning* con datos propios: partir del paso 20.000 y reentrenar con la receta y las estadísticas de normalización publicadas (sha256 `1fe3b7e7...`), útil para adaptar el modelo a nuevas tareas dentro del mismo robot simulado.
- Investigación sobre condicionamiento multi-cámara: usar el modelo para medir cuánto aporta cada vista en tareas con oclusión, ya que la arquitectura está condicionada por cámara y por múltiples vistas de forma explícita.
- *Rollouts* del world model para evaluación offline: generar predicciones de vídeo de la evolución de la escena antes de ejecutar una política en el simulador, y detectar planes visualmente inconsistentes.
- Reproducción de recetas de entrenamiento: el paquete incluye `config.yaml`, `RUN_ID.json`, `SHA256SUMS` y las rutas KEF, lo que permite reconstruir el pipeline y auditar diferencias entre runs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tasas de éxito de tarea, métricas de error de acción ni comparaciones numéricas con otras políticas. Los únicos parámetros cuantitativos publicados son de la receta de entrenamiento e inferencia:

| Parámetro | Valor |
|---|---|
| Paso del checkpoint | 20.000 (calendario total 50.000) |
| Learning rate | 1e-4, coseno hasta 50.000, warmup 1.000 |
| Instruction dropout | 0,1 |
| Chunks por paso de entrenamiento | 512 (32 slots x 16 rangos) |
| Horizonte de acción por chunk | 32 acciones a 25 fps (1,28 s) |
| Pasos de inferencia (flow) | 10 |
| Video CFG / action CFG | 6 / 1 |
| Flow shifts | 5 / 1 |
| Ventana softmax | 1 |

## Requisitos de hardware

- VRAM estimada para cargar los pesos: unos 18 GB en fp32 (el repo pesa 17,9 GB), más activaciones y memoria de atención; en bf16 bajaría a unos 9-10 GB y en int8/fp8 a unos 5 GB, aunque estas conversiones no están documentadas ni validadas por el autor.
- GPU de datacenter: A100 40 GB o 80 GB y H100 80 GB son las opciones seguras para fp32 con margen para lotes y memoria multi-vista.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con holgura; en fp32 el ajuste es muy justo y deja poco espacio para activaciones. Tarjetas de 16 GB requerirían cuantización, que no está publicada.
- Despliegue: el autor indica XPolicyLab con el identificador `SANA_WAM_CAUSAL` como única vía documentada. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; el checkpoint es un `.bin` consolidado en fp32, no un formato de inferencia estándar.
- Latencia y throughput: no medidos ni publicados. Como referencia de diseño, el presupuesto por *chunk* es de 1,28 s para 10 pasos de flow matching si se quiere sostener el control a 25 fps en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbdj-stream512-s20k (este) | 5B | 32 acciones por chunk a 25 fps, memoria de episodio | SFT streaming, paso 20k | no disponible | pesos fp32 en HuggingFace |
| Run N1 de zekail (pixel N1, no streaming) | 5B (mismo modelo) | mismo lienzo 320x512 y mismo horizonte | SFT no streaming, mismos datos y calendario | no disponible | referenciado en la model card, sin enlace |
| Otras políticas VLA open source (familias tipo π0, OpenVLA, GR00T N1) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación directa y verificable es con el run N1 de zekail: mismo modelo, mismos datos, mismo calendario y misma inferencia (CFG 6/1, 10 pasos, shifts 5/1); la única diferencia declarada es el régimen de entrenamiento streaming. Para el resto de familias VLA no se aportan datos en la información disponible y no se incluyen cifras para no especular.

## Limitaciones y advertencias

- Dominio exclusivamente simulado: RoboDojo con brazo ARX X5. No hay evidencia publicada de transferencia a un robot físico ni de robustez ante ruido sensorial real.
- Checkpoint intermedio: es el paso 20.000 de 50.000, con el decaimiento coseno del lr aún a medias; no debe tratarse como el modelo final de la receta.
- Sin benchmarks: no hay tasas de éxito ni métricas de error de acción, de modo que no se puede evaluar su calidad relativa sin ejecutar la evaluación por cuenta propia.
- Dependencia crítica de la normalización: el paquete incluye un artefacto `f33` con sha256 concreto; usar otras estadísticas de normalización invalida el comportamiento esperado.
- Licencia no declarada: sin términos explícitos, el uso comercial queda en una zona legal indefinida y requiere contactar con el autor.
- Idiomas no declarados: aunque hay encoder Qwen, no se documenta qué lenguas entienden las instrucciones.
- Sin cuantizaciones publicadas: el despliegue en hardware de consumo exige convertir pesos por cuenta propia, con riesgo de degradar la política sin métricas para verificarlo.
- Riesgo de fallo silencioso: en una política visuomotora el error se manifiesta como acciones incorrectas, no como texto implausible; el componente de world model puede generar *rollouts* visualmente verosímiles pero físicamente erróneos.
- Sesgo de dominio: un único robot, un único simulador y las tareas de RoboDojo limitan la generalización a otras morfologías, objetos o iluminaciones.
- Reproducibilidad frágil: el `config.yaml` incluye rutas KEF locales, lo que puede exigir adaptar rutas y estructura de datos para reentrenar.
- Señales de validación externa nulas: 0 descargas y 0 *likes* en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/Yuyang-z/rbdj-stream512-s20k
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código, demos ni a la documentación de XPolicyLab o al run N1 de zekail.
