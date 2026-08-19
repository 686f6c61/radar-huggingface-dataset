# twanghcmut/bridgequant-async-libero-object-100

## Resumen

BridgeQuant-Async es un modelo de robótica de tipo Vision-Language-Action (VLA) de 480 millones de parámetros, desarrollado por el autor twanghcmut, asociado a la Universidad de Tecnología de Ho Chi Minh. Está diseñado para resolver tareas de manipulación robótica en el benchmark LIBERO, concretamente la suite Object, donde alcanza un 100 % de éxito sobre 200 episodios. El modelo combina un backbone de lenguaje-visión (LFM2.5-VL-450M) con un conector (BridgeConnector) y una cabeza de acción (BridgeActionHead), y utiliza flow matching con un único paso de denoising para generar secuencias de acciones.

Su relevancia radica en que, con un tamaño notablemente inferior a otros VLA como GR00T N1.7 (2B), logra superarlo en la suite Object (100.0 frente a 98.45), demostrando que arquitecturas eficientes pueden competir con modelos más grandes. Además, soporta despliegue asíncrono con replanificación rápida (~5 ms), lo que lo hace adecuado para aplicaciones de control en tiempo real. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en LFM2.5-VL-450M (backbone) + BridgeConnector + BridgeActionHead |
| Parametros totales | 480.503.595 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizacion mencionada) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer multimodal que procesa observaciones visuales (imágenes a 512 px) e instrucciones en lenguaje para generar acciones de control. El backbone LFM2.5-VL-450M proporciona representaciones conjuntas de visión y lenguaje, mientras que BridgeConnector y BridgeActionHead traducen esas representaciones en secuencias de acciones. El entrenamiento se realizó con full finetune, usando una tasa de aprendizaje de 5e-5, 30k pasos, batch de 16 y aumentación de datos estilo GR00T. Se empleó flow matching con muestreo temporal Beta(1.5, 1) y un solo paso de denoising (num_steps=1).

Además, se incorporó un auxiliar contrastivo de lenguaje (InfoNCE) con peso 0.05, que mejora el rendimiento en Object (de 93.0 a 100.0) pero perjudica en otras suites como Long (cae a 55.0). El modelo genera chunks de 16 pasos de acción, con n_action_steps=8 en evaluación. También se menciona el uso de taps [0, 6, 12, 15], 64 role queries y memory rank 256.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje.
- Soporte para tareas de manipulación en entornos de mesa (benchmark LIBERO).
- Generación de secuencias de acciones (chunk de 16 pasos, n_action_steps=8).
- Flow matching con un paso de denoising para inferencia rápida.
- Despliegue asíncrono con replanificación cada 4 pasos de contexto (100 % de éxito) o bajo controlador unificado (99 %).
- No tiene tool calling ni capacidades de agente conversacional; es específico para robótica.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el modelo sirve como baseline eficiente para estudiar cómo VLA pequeños pueden alcanzar altas tasas de éxito en tareas de manipulación.
- Evaluación de políticas en LIBERO: permite comparar métodos de entrenamiento y arquitecturas en la suite Object, con un protocolo reproducible (seed 42, 200 episodios).
- Prototipado de controladores robóticos en simulación: su pequeño tamaño (480M) facilita iteraciones rápidas en entornos simulados antes de pasar a hardware real.
- Despliegue en robots reales con replanificación asíncrona: gracias a su baja latencia (~5 ms de replan), es adecuado para control en tiempo real con actualización de contexto.
- Benchmarking de técnicas de flow matching en robótica: su configuración de un solo paso de denoising es un caso de estudio para medir el equilibrio entre velocidad y precisión.
- Entrenamiento de modelos más grandes mediante destilación: al ser eficiente y preciso, puede servir como maestro o alumno en procesos de destilación de conocimiento.

## Benchmarks y rendimiento

El modelo se evaluó en el benchmark LIBERO con el protocolo indicado en la model card (seed 42, 200 episodios, n_action_steps=8, un paso de denoising Euler). Los resultados se comparan con GR00T N1.7 (2B, 12.8M muestras).

| Suite | Este modelo | GR00T N1.7 (2B) |
|---|---|---|
| Object | 100.0 | 98.45 |
| Spatial | 98.0* | 97.65 |
| Goal | 95.0* | 97.50 |
| Long | 94.0* | 94.35 |
| Mean | 96.75 | 97.00 |

*Resultados de repositorios separados del mismo autor, no de este checkpoint específico.

Además, en la suite Object se reportan resultados adicionales: full finetune sin auxiliar contrastivo obtiene 93.0, con transition oversampling 98.5, y con el auxiliar InfoNCE 100.0. En despliegue asíncrono, el mismo checkpoint alcanza 100.0 con `--context-refresh-every 4` y 99.0 bajo el controlador unificado compartido.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, ~1 GB (480M parámetros × 2 bytes ≈ 960 MB); en int8, ~0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como RTX 3060, RTX 4060 o superiores. Para entrenamiento, se estima que se necesitan al menos 24 GB de VRAM (batch 16 con imágenes a 512 px), aunque no se especifica oficialmente.
- Opciones de despliegue: el script de evaluación proporcionado usa `uv run`; también se puede integrar en frameworks de robótica como ROS o en el runtime asíncrono mencionado en la model card.
- Latencia: replanificación de ~5 ms según la model card, lo que permite control en tiempo real.

## Comparativa con modelos similares

La única comparativa disponible en la información proporcionada es con GR00T N1.7 (2B). No se dispone de datos de otros VLA como OpenVLA (7B) o RT-2 para una comparación directa.

| Modelo | Parametros | Suite Object | Licencia | Disponibilidad |
|---|---|---|---|---|
| BridgeQuant-Async (este) | 480M | 100.0 | Apache-2.0 | HuggingFace |
| GR00T N1.7 | 2B | 98.45 | No especificada | No disponible públicamente |

El modelo es significativamente más pequeño que GR00T (480M frente a 2B) y lo supera en la suite Object, aunque queda ligeramente por debajo en la media global (96.75 frente a 97.00) debido a resultados inferiores en Spatial, Goal y Long.

## Limitaciones y advertencias

- Entrenado específicamente para LIBERO-Object: si se evalúa en otra suite del benchmark, la tasa de éxito es del 0 % según la model card. El modelo no es generalizable a otras suites sin reentrenamiento.
- El auxiliar contrastivo de lenguaje (InfoNCE) perjudica en otras suites: en LIBERO-Long, el rendimiento cae a 55.0, por lo que esta técnica no es universalmente beneficiosa.
- No se especifican sesgos potenciales, pero al ser un modelo de robótica entrenado en simulaciones, podría tener limitaciones en la generalización a entornos físicos reales no vistos.
- La licencia Apache-2.0 permite uso comercial, pero no se detalla la procedencia de los datos de entrenamiento, por lo que se recomienda verificar posibles restricciones de los mismos.
- No hay información sobre cuantizaciones optimizadas ni formatos de despliegue alternativos (como ONNX o TensorRT), lo que puede limitar su integración en entornos de producción específicos.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-async-libero-object-100
- No se proporcionan otros enlaces (papers, blogs o repositorios adicionales) en la información disponible.
