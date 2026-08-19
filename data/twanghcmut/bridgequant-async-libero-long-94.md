# twanghcmut/bridgequant-async-libero-long-94

## Resumen

BridgeQuant-Async es un modelo de visión-lenguaje-acción (VLA) de 480 millones de parámetros, desarrollado por twanghcmut, especializado en tareas de manipulación robótica de largo horizonte. Está diseñado para el benchmark LIBERO, concretamente para la suite Long (LIBERO-10), donde alcanza un 94,0% de éxito en evaluación síncrona, quedando a solo 0,35 puntos del modelo GR00T N1.7 de 2B, pero con una cuarta parte de los parámetros y 26 veces menos muestras de entrenamiento. El modelo combina un backbone de lenguaje-visión LFM2.5-VL-450M con un conector y una cabeza de acción específicos, y se entrena mediante flow matching con un único paso de denoising.

La relevancia de este modelo radica en su eficiencia: demuestra que un VLA compacto puede competir con modelos mucho más grandes en tareas de manipulación, y además introduce un modo de despliegue asíncrono que permite replanificar en aproximadamente 5 ms, mejorando incluso el rendimiento síncrono en ciertas configuraciones. Está publicado bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone LFM2.5-VL-450M + BridgeConnector + BridgeActionHead |
| Parametros totales | 480.109.867 (480M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles implicitas en LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de VLA típica: un backbone de lenguaje-visión (LFM2.5-VL-450M) procesa observaciones visuales e instrucciones en lenguaje natural, y una cabeza de acción (BridgeActionHead) genera comandos de control. El entrenamiento es un fine-tuning completo (full finetune) con una receta concreta: tasa de aprendizaje 5e-5, 30.000 pasos, batch size 16, resolución de visión de 512 píxeles, aumentos de datos estilo GR00T, y una ventana de acción (chunk) de 16 pasos. Se utiliza flow matching con muestreo temporal Beta(1,5, 1) y un único paso de denoising (num_steps=1). No se emplea ningún objetivo auxiliar de lenguaje ni oversampling de transiciones, ya que según el autor, cualquier señal adicional degrada habilidades raras como "encender la estufa y luego colocar la olla".

Una innovación destacable es el modo de despliegue asíncrono: los mismos pesos pueden ejecutarse con un runtime asíncrono que replanifica cada ~5 ms, usando congelación de RTC (RTC-freeze) y refresco de visión basado en incertidumbre. Esto permite alcanzar un 93,0% de éxito en la suite Long con K=16, o un 90,0% con un controlador unificado de K=8, superando al síncrono K=8 (89,0%).

## Capacidades

- Generación de acciones de control robótico (posiciones, orientaciones, etc.) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Ejecución de tareas de manipulación de largo horizonte, como las del benchmark LIBERO-Long (por ejemplo, "pon ambas jarras moka en la estufa").
- Manejo de secuencias de acción de 16 pasos (chunk) con compromiso total, lo que evita cambios de objetivo a mitad de tarea.
- Replanificación asíncrona con bajo coste computacional (~5 ms), permitiendo ajustes en tiempo real durante la ejecución.
- Soporte de múltiples suites de LIBERO (Object, Spatial, Goal) aunque este repositorio se centra en Long; los checkpoints para las otras suites se publican por separado.
- Integración con flujos de evaluación estándar de robótica mediante scripts de Python (eval_libero_object.py).

## Casos de uso

- Manipulación robótica en entornos simulados: el modelo puede controlar un brazo robótico en simuladores como LIBERO para tareas de largo horizonte, como colocar objetos en posiciones específicas o encender electrodomésticos.
- Desarrollo de políticas de control para robots domésticos: su tamaño compacto (480M) permite desplegarlo en hardware embebido o en GPUs de gama media, facilitando la experimentación en laboratorios de robótica.
- Evaluación de algoritmos de aprendizaje por refuerzo: al ser un modelo de referencia con buen rendimiento en LIBERO, puede usarse como baseline para comparar nuevas técnicas de entrenamiento o arquitecturas.
- Investigación en eficiencia de VLA: su diseño con flow matching de un solo paso y despliegue asíncrono sirve como caso de estudio para reducir latencia en control robótico.
- Prototipado rápido de tareas de manipulación: gracias a su licencia Apache 2.0 y a los scripts de evaluación incluidos, los desarrolladores pueden adaptarlo a nuevas tareas con relativa facilidad.
- Sistemas de control en tiempo real: el modo asíncrono con replanificación de 5 ms es adecuado para aplicaciones donde la latencia de decisión es crítica, como robots colaborativos en líneas de montaje.

## Benchmarks y rendimiento

El modelo se evalúa en el benchmark LIBERO, con el protocolo: seed 42, 200 episodios, rollout síncrono, n_action_steps=16, un paso de denoising Euler y pesos sin EMA. Los resultados se comparan con GR00T N1.7 (2B, 12,8M muestras):

| Suite | Este modelo (480M) | GR00T N1.7 (2B) |
|---|---|---|
| Long | 94,0 | 94,35 |
| Object | 100,0 (repo separado) | 98,45 |
| Spatial | 98,0 (repo separado) | 97,65 |
| Goal | 95,0 (repo separado) | 97,50 |
| Media | 96,75 | 97,00 |

En despliegue asíncrono, el modelo alcanza 93,0 en Long con K=16 y RTC-freeze 4 + refresco de incertidumbre, o 90,0 con controlador unificado K=8. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) porque el modelo está especializado en robótica.

## Requisitos de hardware

- VRAM estimada: con 480M de parámetros en precisión FP32, el modelo ocupa aproximadamente 1,9 GB; en FP16 o BF16, alrededor de 0,96 GB. Con cuantización a 8 bits, podría bajar a ~0,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en FP16, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070/3080, A100, etc.).
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja si se usa cuantización o se reduce la resolución de visión.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con frameworks de robótica como PyTorch, y potencialmente con vLLM o TGI si se adapta, aunque no hay soporte oficial documentado. Para el modo asíncrono, se requiere el runtime específico descrito en la model card.
- Latencia: el modo síncrono con un paso de denoising es rápido; el asíncrono replanifica en ~5 ms, lo que permite control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO Long | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BridgeQuant-Async (este) | 480M | no disponible | 94,0 | Apache 2.0 | HuggingFace |
| GR00T N1.7 | 2B | no disponible | 94,35 | no disponible | no disponible |
| OpenVLA (referencia general) | 7B | no disponible | no disponible | MIT | HuggingFace |

La comparación directa con GR00T N1.7 muestra que BridgeQuant-Async logra un rendimiento casi idéntico con una cuarta parte de los parámetros y 26 veces menos muestras de entrenamiento. No se dispone de datos de otros VLA en LIBERO para una comparativa más amplia.

## Limitaciones y advertencias

- El modelo está especializado en el benchmark LIBERO y no es un modelo de propósito general; no genera texto ni razona fuera del ámbito de control robótico.
- No se ha publicado información sobre sesgos, pero al entrenarse con datos de LIBERO (entornos simulados con objetos y escenas limitadas), puede no generalizar a entornos reales sin fine-tuning adicional.
- Riesgo de alucinación en acciones: en tareas con objetos idénticos o instrucciones ambiguas, el modelo puede fallar (por ejemplo, 7 de 20 episodios fallan al replanificar en tareas con dos objetos iguales).
- La longitud de contexto y los idiomas soportados no están documentados; se asume que las instrucciones son en inglés, como en LIBERO.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del backbone LFM2.5-VL-450M, cuyos términos de uso no se detallan en la model card.
- Para producción, se recomienda validar el rendimiento en el entorno objetivo, ya que el modo asíncrono requiere ajustes finos (RTC-freeze, umbrales de incertidumbre) que pueden variar según la tarea.

## Enlaces

- [HuggingFace: twanghcmut/bridgequant-async-libero-long-94](https://huggingface.co/twanghcmut/bridgequant-async-libero-long-94)
