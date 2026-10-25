# yutongzhu/smolvla-libero-ft20k

## Resumen

`smolvla-libero-ft20k` es un ajuste fino del modelo visión-lenguaje-acción (VLA) `lerobot/smolvla_base` (450.046.176 parámetros) sobre el conjunto de datos `lerobot/libero`, publicado por el usuario yutongzhu. El modelo no genera texto ni código: recibe observaciones visuales de una escena de manipulación robótica junto con una instrucción en lenguaje natural y emite una secuencia de acciones motrices para un brazo manipulador, dentro del simulador MuJoCo del benchmark LIBERO.

El problema que aborda es acotado y muy concreto: servir como checkpoint de referencia reproducible para la tarea LIBERO-Spatial, con una receta de entrenamiento barata (una sola RTX 4090, 1 hora y 47 minutos, 20.000 pasos) y una evaluación en bucle cerrado con intervalos de confianza y análisis de fallos por episodio. Es relevante para quien investiga en robótica de bajo coste porque documenta explícitamente dos hallazgos prácticos: el valor de `n_action_steps` heredado del checkpoint base degrada el rendimiento unos 10 puntos porcentuales, y la compilación con `torch.compile` en BF16 reduce la latencia de inferencia de 286 ms a 37 ms (7,2 veces) con una tasa de éxito igual o superior en la muestra evaluada.

La arquitectura subyacente es SmolVLA, un VLA compacto de la familia LeRobot que combina un backbone visión-lenguaje con un experto de acciones; el contexto de texto, los tipos de cuantización publicados y otros detalles del backbone no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) SmolVLA de LeRobot; backbone visión-lenguaje más cabeza/experto de acciones; detalles internos del backbone no disponibles |
| Parámetros totales | 450.046.176 (dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican pesos cuantizados; la model card evalúa en FP32 y en BF16 (`torch.compile`); no hay GGUF ni versiones INT8/INT4 |
| Idiomas soportados | La model card declara `zh`; las instrucciones del benchmark LIBERO están en inglés, por lo que el uso real observado es con instrucciones en inglés (dato no aclarado por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio LeRobot, 0,9 GB) |
| Tipo de entrada | Imágenes de cámara (`observation.images.camera1`, `observation.images.camera2`) más instrucción de tarea en texto; resolución de entrenamiento 256 px, evaluación a 360 px |
| Tipo de salida | Chunk de acciones continuas; `n_action_steps=10` recomendado (el checkpoint hereda 50) |
| Modelo base | `lerobot/smolvla_base` |
| Librería / pipeline | `lerobot` (LeRobot 0.6.1) / `robotics` |
| Dataset de entrenamiento | `lerobot/libero`, cuatro subconjuntos (spatial, object, goal, libero_10), 1.693 demostraciones |
| Descargas / likes en HuggingFace | 0 / 0 (a fecha de la información) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA compacto de 450 millones de parámetros diseñado para ejecutarse en hardware de consumo. La formulación es la habitual en esta familia: un backbone visión-lenguaje procesa las imágenes de cámara y la instrucción textual, y un módulo de acción genera una secuencia de comandos motrices (action chunk) que se ejecutan en bucle cerrado. La información proporcionada no detalla la composición exacta del backbone, el número de capas ni el mecanismo de generación de acciones (flow matching u otro), por lo que esos datos quedan como no disponibles.

El ajuste fino se realizó con LeRobot 0.6.1 sobre los cuatro subconjuntos de `lerobot/libero` (1.693 demostraciones), durante 20.000 pasos con batch size 32, lo que equivale a aproximadamente 2,3 épocas. El entrenamiento completo consumió una única RTX 4090 durante 1 hora y 47 minutos y terminó con una loss de 0,36. No se documenta en la información disponible el uso de RLHF, DPO ni de fases de alineación posteriores; tampoco se describe ninguna innovación arquitectónica propia más allá del ajuste del checkpoint base.

El aspecto técnico más relevante del trabajo no está en el entrenamiento sino en la evaluación: se fija la semilla 1000, se ejecutan 10 entornos en paralelo y se garantiza que el episodio i de una misma tarea tenga idéntica escena inicial entre evaluaciones, lo que permite comparaciones por pares y test exacto de McNemar. Además, se mide latencia p90 por fotograma y se analiza el efecto de `torch.compile` en BF16, concluyendo que el cuello de botella en inferencia es la emisión de kernels CUDA desde CPU, no la aritmética, de ahí que BF16 por sí solo apenas acelere.

## Capacidades

- Manipulación robótica guiada por lenguaje: ejecuta tareas de pick-and-place descritas en texto (por ejemplo, "pick up the black bowl on the ramekin") a partir de dos vistas de cámara.
- Generación de chunks de acciones: produce bloques de acciones configurable (`n_action_steps`), lo que permite desacoplar la frecuencia de inferencia de la frecuencia de control.
- Control en bucle cerrado: no es un modelo de planificación offline; cada chunk se recalcula con la observación visual actual.
- Percepción visual de escena: dos cámaras (incluida vista en tercera persona) como entrada; sensible a resolución (entrenado a 256 px, evaluado a 360 px).
- Inferencia eficiente en hardware de consumo: 37 ms por fotograma en RTX 4090 con BF16 y `torch.compile`, 5 pasos de denoising.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente multi-paso en el sentido de LLM (no hay uso de herramientas, memoria externa ni razonamiento simbólico).
- No dispone de modo "thinking", capacidades de audio ni generación de texto libre.
- Multilingüismo: no verificado; la etiqueta de idioma declarada (`zh`) no está respaldada por evaluación en la información disponible.

## Casos de uso

- **Referencia reproducible del benchmark LIBERO-Spatial**: sirve como checkpoint base para comparar nuevas recetas de ajuste fino con el mismo protocolo (semilla 1000, 10 entornos en paralelo, 100 episodios), gracias a la evaluación por pares con McNemar y a los intervalos de confianza publicados.
- **Estudio del efecto del action chunking**: el propio autor documenta una caída de ~10 puntos porcentuales al usar el `n_action_steps=50` heredado frente a 10. Es un caso directo para experimentar con el compromiso entre frecuencia de replanificación y tasa de éxito.
- **Despliegue en el borde (edge) con latencias ajustadas**: con BF16 y `torch.compile`, 5 pasos de denoising y 37 ms p90 por fotograma, es viable en una GPU de consumo; útil para prototipos de políticas VLA en robots de bajo coste o en estaciones de trabajo con una sola GPU.
- **Docencia y divulgación de VLA**: un ajuste completo en menos de 2 horas con una RTX 4090 y 0,9 GB de pesos hace el ciclo entrenar-evaluar accesible para cursos y talleres de robótica.
- **Análisis de modos de fallo en manipulación**: el autor publica anotaciones y vídeos de cada episodio fallido (objeto equivocado, fallo de agarre, error de colocación), lo que permite entrenar clasificadores de fallo o diseñar políticas de recuperación.
- **Punto de partida para ajuste dominio-específico**: al estar licenciado Apache 2.0 y partir de `smolvla_base`, se puede reentrenar con datos propios manteniendo la interfaz LeRobot y el pipeline de evaluación.
- **Investigación en sim-a-real (con cautela)**: el modelo solo se ha probado en MuJoCo; podría usarse como inicialización para experimentos de transferencia, aunque no hay evidencia publicada de que funcione en un robot físico.
- **Compare baseline en publicaciones**: cualquier artículo que proponga mejoras sobre SmolVLA en LIBERO puede usar este checkpoint como referencia con métricas por episodio y latencias medidas.

## Benchmarks y rendimiento

Resultados declarados por el autor (campo `verified: false`), sobre LIBERO-Spatial, 10 tareas × 10 episodios, semilla 1000, 100 episodios por fila:

| Configuración | n_action_steps | Pasos de denoising | Precisión | Tasa de éxito (IC 95 %) |
|---|---|---|---|---|
| `HuggingFaceVLA/smolvla_libero` (oficial) | 1 | 10 | FP32 | 69 % (59–77) |
| Este modelo | 50 (valor por defecto del checkpoint) | 10 | FP32 | 68 % (58–76) |
| Este modelo | 1 | 10 | FP32 | 75 % (66–82) |
| Este modelo | 10 | 10 | FP32 | 78 % (69–85) |
| Este modelo | 10 | 5 | BF16 + `torch.compile` | 81 % (72–87) |

Métricas declaradas en el model-index: 78 (n_action_steps=10, 10 pasos de denoising, FP32) y 81 (n_action_steps=10, 5 pasos, BF16 + `torch.compile`).

Advertencias del propio autor sobre estos números: con 100 episodios ninguna diferencia alcanza significación estadística (p<0,05). En la comparación oficial frente a este modelo con n=10, 19 episodios pasan de fallo a éxito y 10 de éxito a fallo, con p=0,14. El paper de SmolVLA reporta 90 % en LIBERO-Spatial y el checkpoint oficial obtiene 69 % con este protocolo, diferencia cuya causa no se ha determinado.

Latencia de inferencia (RTX 4090, un fotograma, p90):

| Configuración | Latencia p90 | Frecuencia efectiva derivada |
|---|---|---|
| FP32, 10 pasos de denoising | 286 ms | ~3,5 inferencias/s |
| BF16 + `torch.compile`, 5 pasos | 37 ms | ~27 inferencias/s |

La primera inferencia tras compilar tarda aproximadamente 2 minutos; es necesario precalentar antes de medir o desplegar.

Análisis de fallos (100 episodios, anotación manual):

| Modelo | Fallos | Objeto equivocado | Fallo de agarre | Error de colocación |
|---|---|---|---|---|
| Oficial, n=1 | 31 | 23 | 8 | 0 |
| Este modelo, n=1 | 25 | 14 | 5 | 6 |
| Este modelo, n=10 | 22 | 10 | 2 | 10 |

## Requisitos de hardware

- **VRAM estimada**: no publicada. Como referencia aritmética a partir de los 450 M de parámetros, los pesos ocupan ~1,8 GB en FP32 y ~0,9 GB en BF16 (el repositorio completo pesa 0,9 GB); a ello hay que sumar activaciones y dos flujos de imagen. Estimación orientativa: 2–4 GB en BF16, 3–6 GB en FP32, sin medición oficial.
- **GPU validadas**: RTX 4090 (entrenamiento y evaluación). Cabe holgadamente en cualquier GPU de consumo con 8 GB o más; no se han publicado pruebas en A100, H100, RTX 3090 ni en GPU integradas.
- **Entrenamiento**: 20.000 pasos con batch 32 en una sola RTX 4090 en 1 h 47 min, es decir, ajuste fino viable en una única GPU de consumo.
- **Opciones de despliegue**: `lerobot-eval` con `--policy.path=yutongzhu/smolvla-libero-ft20k`, el simulador LIBERO sobre MuJoCo y `torch.compile` para la variante rápida. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje y no hay pesos GGUF.
- **Mapeo obligatorio de cámaras**: hay que renombrar `observation.images.image` → `camera1` y `observation.images.image2` → `camera2` mediante `--rename_map`.
- **Latencia**: 286 ms p90 por inferencia en FP32 con 10 pasos de denoising; 37 ms con BF16, `torch.compile` y 5 pasos. Con `n_action_steps=10`, cada inferencia cubre 10 acciones, lo que reduce la frecuencia de cómputo necesaria.
- **Throughput**: no se publican medidas de episodios por minuto ni de utilización de GPU con batch > 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-Spatial (este protocolo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yutongzhu/smolvla-libero-ft20k` (este) | 450 M | No disponible | 78 % (FP32, n=10) / 81 % (BF16 compilado) | Apache 2.0 | HuggingFace, 0 descargas |
| `HuggingFaceVLA/smolvla_libero` (oficial) | ~450 M (misma familia) | No disponible | 69 % (FP32, n=1) | No indicada en la información disponible | HuggingFace |
| `lerobot/smolvla_base` (base sin ajustar) | 450.046.176 | No disponible | No disponible en esta información | No indicada en la información disponible | HuggingFace |
| Otros VLA de referencia (OpenVLA, π0) | No disponible en esta información | No disponible | No disponible en esta información | No disponible en esta información | — |

La comparación relevante y con datos es únicamente contra el checkpoint oficial de LIBERO y contra el modelo base. Cualquier comparación con VLA de mayor tamaño (OpenVLA, π0) requeriría reproducir el mismo protocolo de 100 episodios con semilla 1000, algo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- **Alcance de evaluación muy estrecho**: solo se evalúa en LIBERO-Spatial, 100 episodios por configuración. No hay resultados en LIBERO-Object, LIBERO-Goal ni LIBERO-10, pese a que el modelo se entrenó con los cuatro subconjuntos.
- **Sin validación en robot real**: todo el trabajo es en simulación MuJoCo. No hay evidencia de transferencia sim-a-real.
- **Resultados no verificados**: las métricas del model-index tienen `verified: false` y proceden del propio autor; además, ninguna diferencia alcanza significación estadística con p<0,05 en 100 episodios.
- **Discrepancia con el paper**: SmolVLA reporta 90 % en LIBERO-Spatial y el checkpoint oficial obtiene 69 % con este protocolo; la causa no está determinada, lo que introduce incertidumbre sobre la comparabilidad con la literatura.
- **Configuración por defecto incorrecta**: el checkpoint hereda `n_action_steps=50` de `smolvla_base`, valor con el que la tasa de éxito cae unos 10 puntos. Si no se sobrescribe a 10, los resultados son engañosos.
- **Desajuste de resolución**: entrenamiento a 256 px y evaluación a 360 px, lo que puede penalizar el rendimiento medido.
- **Regresión en un modo de fallo**: el ajuste fino reduce los errores de objeto equivocado y de agarre, pero introduce errores de colocación (0 en el oficial frente a 10 con n=10). La tarea 5 es la más débil en todas las evaluaciones.
- **Etiqueta de idioma dudosa**: la model card declara `zh`, pero las instrucciones evaluadas están en inglés; no hay evaluación multilingüe.
- **Riesgo de alucinación**: en el sentido de generar texto inventado no aplica (no es un LLM), pero sí existe el equivalente en robótica: ejecución de una trayectoria plausible aunque el objeto o el destino no coincidan con la instrucción, sin señal de confianza ni de abstención.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y los datos derivados (`lerobot/libero`, demostraciones de terceros) pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- **Madurez**: 0 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento posterior a la publicación.
- **Precalentamiento obligatorio**: con `torch.compile` la primera inferencia tarda unos 2 minutos, lo que afecta a arranques en frío y a entornos serverless.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yutongzhu/smolvla-libero-ft20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Checkpoint oficial de referencia: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Resultados de evaluación y vídeos de fallos: https://huggingface.co/datasets/yutongzhu/smolvla-libero-eval-results
- Código, resultados completos y análisis: https://github.com/2p1c/smolvla-libero-edge
- Paper de SmolVLA: no se incluye enlace en la información proporcionada (la model card lo cita como fuente del 90 % en LIBERO-Spatial)
