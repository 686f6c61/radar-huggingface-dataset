# twanghcmut/bridgequant-async-libero-goal-95

## Resumen

BridgeQuant-Async es un modelo de tipo visión-lenguaje-acción (VLA) desarrollado por el autor twanghcmut, diseñado específicamente para tareas de manipulación robótica en el benchmark LIBERO. Este checkpoint concreto está optimizado para la suite LIBERO-Goal, alcanzando una tasa de éxito del 95,0% con una arquitectura de 480 millones de parámetros, lo que lo sitúa muy cerca del rendimiento de modelos mucho más grandes como GR00T N1.7 (2B), que obtiene un 97,5% en la misma suite.

El modelo combina un backbone de visión-lenguaje LFM2.5-VL-450M con un conector puente (BridgeConnector) y una cabeza de acción (BridgeActionHead). Utiliza flow matching con un solo paso de denoising (num_steps 1) y una técnica de muestreo específica denominada *transition-balanced sampling*, que sobremuestrea los frames cercanos a cambios de estado del gripper, aportando una mejora de +4,5 puntos en la suite Goal sin modificar la arquitectura.

Su relevancia actual radica en demostrar que es posible obtener un rendimiento casi comparable al de modelos de 2B con una fracción de los parámetros, además de incorporar un runtime asíncrono que permite replanificar en aproximadamente 5 ms con una latencia de caché del latent del puente. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su integración en pipelines de robótica, no para generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con backbone LFM2.5-VL-450M + BridgeConnector + BridgeActionHead |
| Parametros totales | 480.109.867 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | No disponible (orientado a acciones robóticas, no a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura se compone de un backbone de visión-lenguaje LFM2.5-VL-450M (~450M de parámetros) que procesa imágenes a una resolución de 512 píxeles, seguido de un BridgeConnector que proyecta las representaciones hacia un espacio de acción, y un BridgeActionHead que genera los chunks de acción. El entrenamiento se realizó en modo *finetune* completo (incluyendo el backbone) durante 30.000 pasos con un learning rate de 5e-5 y batch size 16, utilizando aumentación de datos estilo GR00T.

La generación de acciones se basa en flow matching con muestreo temporal Beta(1,5; 1) y un único paso de denoising (num_steps 1). Se emplean 64 role queries, un rango de memoria de 256 y un tamaño de chunk de 16. La innovación principal es el *transition-balanced sampling*: los frames dentro de una ventana de 12 pasos alrededor de un cambio de estado del gripper (apertura/cierre) se muestrean 1,5 veces más frecuentemente. Esto reconfigura la distribución de datos sin añadir objetivos auxiliares ni cambios arquitectónicos, concentrando la mejora en tareas de múltiples fases (t06 pasó de 15 a 19, t09 de 16 a 20).

## Capacidades

- Ejecución de tareas de manipulación robótica en el benchmark LIBERO, específicamente la suite Goal con un 95,0% de éxito.
- Generación de acciones mediante flow matching con un solo paso de denoising, lo que reduce la latencia de inferencia.
- Despliegue asíncrono con caché del latent del puente, permitiendo replanificación en aproximadamente 5 ms.
- Procesamiento visual de alta resolución (512 píxeles) para percepción robótica.
- Soporte de *action chunking* (chunk de 16 pasos) para ejecución suave y consistente.
- No soporta tool calling, agentes de texto ni razonamiento conversacional; es un modelo puramente orientado a acción visual.

## Casos de uso

- Manipulación robótica en entornos simulados: el modelo puede controlar un brazo robótico en el benchmark LIBERO-Goal, ejecutando tareas de múltiples fases como apilar objetos o colocar elementos en posiciones específicas, gracias a su *transition-balanced sampling* que mejora la precisión en transiciones de gripper.
- Aprendizaje por imitación: al estar fine-tuneado con demostraciones, puede servir como punto de partida para transferir políticas a otros entornos o tareas, aunque el autor advierte que la suite de evaluación debe coincidir con la de entrenamiento para obtener éxito.
- Despliegue en tiempo real con control asíncrono: el runtime asíncrono con caché de latent permite replanificar en ~5 ms, haciéndolo adecuado para sistemas donde la latencia de decisión es crítica, como robots colaborativos en líneas de montaje.
- Investigación en eficiencia de modelos VLA: permite comparar el rendimiento de un modelo de 480M frente a alternativas de 2B (como GR00T N1.7) en el benchmark LIBERO, facilitando estudios sobre escalado, eficiencia y técnicas de muestreo de datos.
- Benchmarking de algoritmos de muestreo: la técnica *transition-balanced sampling* puede ser evaluada y replicada en otros modelos o suites, ya que el autor proporciona el `train_config.yaml` exacto para reproducir el entrenamiento.
- Integración en pipelines de robótica con ROS u otros middlewares: al ser un modelo de acción puro, puede integrarse como módulo de control de bajo nivel, recibiendo imágenes y devolviendo chunks de acción para el planificador de alto nivel.

## Benchmarks y rendimiento

Los resultados se obtuvieron con el protocolo: seed 42, 200 episodios por suite (20 por tarea × 10 tareas), rollout síncrono, `n_action_steps=8`, un paso de denoising Euler y bundle sin EMA. La comparativa con GR00T N1.7 (2B, 12,8M muestras) es la siguiente:

| Suite | Este repositorio (480M) | GR00T N1.7 (2B) |
|---|---|---|
| Goal | **95.0** | 97.50 |
| Object | 100.0 *(repo separado)* | 98.45 |
| Spatial | 98.0 *(repo separado)* | 97.65 |
| Long | 94.0 *(repo separado)* | 94.35 |
| Media | **96.75** | 97.00 |

En despliegue asíncrono (con caché de latent y replanificación de ~5 ms), el mismo modelo alcanza un 94,0 en la suite Goal con un controlador fijo (`K=8`, `--context-refresh-every 2`, `--precision-refresh`), sin ajuste por suite.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM. Con 480M de parámetros, el peso en FP16 ocupa aproximadamente 1 GB, por lo que es plausible que quepa en GPUs de consumo con 4-6 GB de VRAM, aunque se recomienda al menos 8 GB para margen con el runtime y las imágenes de 512 píxeles.
- GPUs recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4090) o profesional (A100, H100) debería ser suficiente para inferencia. No se especifican requisitos de entrenamiento, pero el fine-tuning completo de 30k pasos con batch 16 probablemente requiera una GPU con 24 GB o más.
- Opciones de despliegue: no es compatible con vLLM, Ollama o TGI, ya que es un modelo de robótica. Se proporciona un script de evaluación (`scripts/eval_libero_object.py`) que se ejecuta con `uv run python`.
- Latencia: en modo asíncrono, la replanificación tarda ~5 ms gracias a la caché del latent del puente, lo que permite control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (LIBERO-Goal) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BridgeQuant-Async (este) | 480M | No disponible | 95.0 | Apache 2.0 | HuggingFace |
| GR00T N1.7 | 2B | No disponible | 97.50 | No disponible | No disponible |
| LFM2.5-VL-450M (backbone base) | ~450M | No disponible | No evaluado en LIBERO | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada. La comparativa se limita a los datos citados en la model card.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la suite LIBERO-Goal. El autor advierte explícitamente: "The eval suite must match the training suite or success rate is 0%". Usarlo en otras suites o entornos sin reentrenamiento dará resultados nulos.
- No es un modelo de lenguaje conversacional; no genera texto ni soporta tool calling. Su salida son chunks de acción para control robótico.
- No se han publicado datos sobre sesgos, alucinación o robustez ante perturbaciones visuales, ya que es un modelo de acción y no de generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos físicos reales (solo se ha evaluado en simulación LIBERO).
- El rendimiento asíncrono de 94.0 depende de la configuración exacta del runtime (K=8, refresh cada 2 pasos, precision-refresh); cambios en estos parámetros pueden degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-async-libero-goal-95
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de código) en la información proporcionada.
