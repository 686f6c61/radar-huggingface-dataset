# Walkowicz/kairos-pi-low-1.0

## Resumen

Kairos PI Low 1.0 es un modelo de decisión no autoregresivo de tipo "System 1" construido por el autor Walkowicz sobre un encoder `ModernBERT-base` afinado. No genera texto: recibe una descripción de estado (por ejemplo, una trama CAN-Bus o telemetría IoT) junto con una lista de opciones candidatas y devuelve, en un único forward pass, una opción seleccionada, un estado (`ok`/`abstain`) y una confianza calibrada. Está pensado para sustituir a un LLM generativo en bucles de control y diagnóstico donde la latencia, el consumo y la determinación importan más que la fluidez del lenguaje.

El modelo tiene 149.606.404 parámetros (~149M) y un peso `model.safetensors` de 598 MB, lo que permite desplegarlo en ECU, SoC de bajo consumo o microcontroladores con presupuesto energético estricto (el autor indica <15 W SWaP). Su rasgo diferencial es una puerta de abstención activa (Active Abstention Gate) que, según la model card, alcanza un 100 % de recall sobre telemetría corrupta o manipulada, evitando actuaciones físicas catastróficas cuando la entrada está fuera de distribución.

Es relevante ahora porque cubre un nicho poco atendido: inferencia determinista y offline en el borde físico (automoción, IoT, SCADA, microrobótica) sin depender de la nube ni de APIs generativas. La contrapartida es que se trata de un modelo muy especializado, solo en inglés, con 2.048 tokens de contexto, sin capacidades generativas ni de tool calling, y cuyos benchmarks son autoinformados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer `ModernBERT-base` adaptado a decisión no autoregresiva (single forward pass), con cabecera de selección entre candidatos y puerta de abstención |
| Parametros totales | 149.606.404 (~149M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (según la tabla comparativa de la model card); el `ModernBERT-base` original soporta 8.192, pero esta variante declara 2.048 |
| Tipos de cuantizacion | FP16 (~299 MB) e INT8 (~74 MB) documentados; no se indican pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, 598 MB) más código custom (`modeling_kairos_pi_low.py`), tokenizer y configuración; pipeline declarado `feature-extraction` |
| Tarea / pipeline | Clasificación de decisión entre opciones candidatas, extracción de características, abstención ante OOD |
| Modelo base | `answerdotai/ModernBERT-base` (fine-tune) |
| Latencia declarada | <37 ms en GPU PyTorch, ~1,5 ms con TensorRT, ~18 ms en ARM Cortex-A |
| Huella de memoria | ~299 MB en FP16, ~74 MB en INT8 |

## Arquitectura y entrenamiento

El modelo parte de `ModernBERT-base`, un encoder transformer con atención de tipo linear/eficiente, y lo reorienta a lo que el autor llama un motor de reflejos ciberfísicos: en lugar de predecir el siguiente token, el modelo puntúa opciones candidatas presentadas en el prompt (construido con tokens especiales `[CLS]`, `[CHOICE]`, `[MASK]`, `[SEP]`) y emite un tensor de decisión determinista. La inferencia es de un solo paso, sin decodificación autoregresiva ni muestreo, lo que explica las latencias declaradas y la reproducibilidad de la salida. La cabecera incluye una señal de confianza calibrada (Brier score en 1D para esta variante Low) y una compuerta de abstención que puede forzar el estado `abstain` cuando detecta entradas corruptas o adversariales.

El ajuste se realizó, según la model card, exclusivamente sobre telemetría pública real, sin muestras sintéticas de juguete: tramas CAN-Bus del dataset `CICIoV2024` (dentro de `Thi-Thu-Huong/Multi-CAN-Datasets`), que cubren floods DoS, suplantación de RPM y manipulación del pedal del acelerador, y telemetría de dispositivos IoT del dataset `Aposemat IoT-23` (en `19kmunz/iot-23-preprocessed`), con escaneos Mirai y operación normal de electrodomésticos. Se añadieron violaciones de paridad e invariancia de voltaje para calibrar la abstención epistémica. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta de la mezcla, ni si se aplicaron fases de RLHF o DPO; tampoco se documenta una innovación técnica más allá del esquema de decisión no autoregresivo con abstención.

## Capacidades

- Decisión entre opciones candidatas en un único forward pass, con salida estructurada (opción seleccionada, estado, confianza y latencia medida).
- Abstención activa ante telemetría corrupta, fuera de distribución o manipulada: 100 % de recall declarado en los 20 casos de abstención del conjunto de evaluación.
- Calibración de riesgo en 1D mediante Brier score (la variante Large y la Symbiotic ofrecen un vector 4D).
- Detección de anomalías en dominios ciberfísicos concretos: CAN-Bus automotriz, IoT doméstico, SCADA eólica, robótica y telemetría de vuelo.
- Extracción de características (`feature-extraction`) reutilizable por cabeceras posteriores.
- Inferencia determinista y offline, apta para entornos sin conectividad y con requisitos de auditoría.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No soporta agentes ni planificación; no hay visión, audio ni modo "thinking".
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Detección de intrusiones en bus CAN de un vehículo: el modelo recibe el identificador de trama, DLC, payload, carga de bus y frecuencia, y devuelve si el estado es `benign_normal`, `dos_flood`, `rpm_spoofing` o `gas_spoofing`. Encaja en una ECU porque la latencia declarada (~18 ms en ARM Cortex-A) permite evaluar tramas en tiempo real sin salir del vehículo.
- Pasarela IoT doméstica con inspección de tráfico: clasificación de telemetría multi-dispositivo bajo escaneos Mirai y operación normal, con abstención cuando la trama no se parece a nada visto. Adecuado para routers y hubs con presupuesto energético bajo, ya que en INT8 ocupa ~74 MB.
- Triaje de telemetría en SCADA eólica: verificación de invariantes de paridad y voltaje en lecturas de aerogenerador, derivando a revisión humana los casos en los que el modelo se abstiene. Es el punto más flojo de esta variante (80 % en 20 casos), por lo que se recomienda como primera etapa de filtrado y no como decisor único.
- Puerta de seguridad para actuadores y microrrobótica: antes de ejecutar un comando físico, el modelo evalúa la coherencia de la telemetría y bloquea la actuación si la confianza cae por debajo del umbral o si la compuerta de abstención se activa. Es su caso de uso más alineado con el diseño (evitar actuaciones catastróficas).
- Extracción de características para un clasificador downstream: uso del encoder como extractor congelado en un pipeline propio de mantenimiento predictivo, entrenando una cabecera específica sobre representaciones ya ajustadas a dominios industriales.
- Filtrado previo en un stack de ciberseguridad OT: primera línea de descarte de tráfico claramente benigno en un servidor central, reservando modelos mayores (la variante Symbiotic o un LLM) para los casos dudosos, gracias a su coste de ~35,8 ms en GPU.
- Evaluación de integridad de firmware y configuración en dispositivos de borde: clasificación de estados de dispositivo descritos textualmente frente a un catálogo de opciones conocidas, sin necesidad de conexión.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor (suite de 80 casos "Cyber-Physical Gauntlet", detallada en `BENCHMARK.md`). No hay verificación independiente disponible.

| Dimension / metrica | Kairos PI Symbiotic | Kairos PI Large 1.0 | Kairos PI Low 1.0 (este modelo) | Convai Laya (baseline) |
|---|---|---|---|---|
| Puntuacion global (80 casos) | 97,5 % (78/80) | 95,0 % (76/80) | 92,5 % (74/80) | 48,8 % (39/80) |
| Abstención activa (20 casos) | 100 % (20/20) | 100 % (20/20) | 100 % (20/20) | 0 % (0/20) |
| Telemetria CAN-Bus (20) | 100 % (20/20) | 85,0 % (17/20) | 100 % (20/20) | 65,0 % (13/20) |
| Telemetria IoT (10) | 100 % (10/10) | 90,0 % (9/10) | 100 % (10/10) | 80,0 % (8/10) |
| SCADA eolica (20) | 100 % (20/20) | 100 % (20/20) | 80,0 % (16/20) | 55,0 % (11/20) |
| Robotica y vuelo (10) | 100 % (10/10) | 100 % (10/10) | 80,0 % (8/10) | 70,0 % (7/10) |
| Latencia P50 single-pass (GPU) | 35,8 ms / 168,3 ms | 168,3 ms | 35,8 ms | 36,8 ms |
| Ventana de contexto maxima | 8.192 tokens | 8.192 tokens | 2.048 tokens | 512 tokens |
| Calibracion de riesgo | Vector 4D (MSE 0,0015) | Vector 4D (MSE 0,0015) | 1D (Brier score) | 0D (discreta) |
| Memoria (FP16 / INT8) | 299 MB + 799 MB | ~799 MB / ~198 MB | ~299 MB / ~74 MB | ~640 MB / ~160 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es generativo y esas métricas no aplicarían a su tarea.

## Requisitos de hardware

- VRAM estimada: ~299 MB en FP16 y ~74 MB en INT8 para los pesos; el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta 35,8 ms en GPU con PyTorch y ~1,5 ms con TensorRT. Una RTX 4090, A100 o H100 están sobradamente dimensionadas y el cuello de botella será el preprocesado, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU. El objetivo declarado es ARM Cortex-A (~18 ms) y SoC de borde por debajo de 15 W.
- Opciones de despliegue: PyTorch con `transformers` más el código custom `modeling_kairos_pi_low.py`, y TensorRT para la ruta de baja latencia. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, y en la práctica no aplican al no ser un modelo autoregresivo con pesos en GGUF.
- Latencia y throughput: latencia P50 declarada de 35,8 ms en GPU (PyTorch), ~1,5 ms en TensorRT y ~18 ms en ARM Cortex-A. No se publica throughput agregado (peticiones/s) ni latencias P99.
- Nota de integración: al requerir `trust_remote_code=True` y código propio del autor, conviene auditar `modeling_kairos_pi_low.py` antes de desplegarlo en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos PI Low 1.0 | ~149M | 2.048 | 92,5 % (74/80); 100 % abstención | Apache 2.0 | Pesos en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Kairos PI Large 1.0 | No disponible | 8.192 | 95,0 % (76/80); 100 % abstención | No disponible | Referenciado en la model card, sin enlace de repositorio |
| Kairos PI Symbiotic (dual-tier) | No disponible | 8.192 | 97,5 % (78/80); 100 % abstención | No disponible | Referenciado en la model card, sin enlace de repositorio |
| Convai Laya (baseline) | No disponible | 512 | 48,8 % (39/80); 0 % abstención | No disponible | No disponible |

Alternativas de código abierto comparables en la misma categoría (clasificación de tráfico de red o de tramas CAN, por ejemplo modelos tabulares o encoder pequeños tipo `ModernBERT`/`DeBERTa` afinados a clasificación) no se han evaluado en la información disponible con esta misma suite, por lo que no se ofrece una comparación numérica cruzada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no conversa, no razona en varios pasos y no soporta tool calling ni agentes. Usarlo como sustituto de un LLM sería un error de diseño.
- Solo inglés; cualquier prompt o etiqueta en otro idioma degradará la decisión.
- Contexto limitado a 2.048 tokens, la mitad que el `ModernBERT-base` original; las descripciones de estado y las listas de opciones deben caber en esa ventana.
- El rendimiento cae en dos de los dominios evaluados: 80 % en SCADA eólica (16/20) y 80 % en robótica y vuelo (8/10). No conviene usarlo como decisor único en esos entornos sin una capa de verificación.
- Calibración de riesgo en 1D, frente al vector 4D de las variantes superiores; menor granularidad para umbrales finos de seguridad.
- Riesgo de falsos negativos ante ataques fuera de la distribución de entrenamiento: los datasets usados (CICIoV2024, IoT-23) cubren un repertorio acotado de ataques y dispositivos.
- Benchmarks autoinformados por el autor, sin replicación independiente ni conjunto de evaluación público más allá del `BENCHMARK.md` del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Requiere `trust_remote_code=True`: hay código Python arbitrario en el repositorio que debe auditarse antes de ejecutarlo en infraestructura crítica.
- Licencia Apache 2.0, permisiva para uso comercial e industrial, pero el autor no ofrece garantías ni soporte; en automoción o SCADA habría que evaluar conformidad con ISO 26262 u otras normativas aplicables por cuenta propia.
- La fecha de creación del repositorio (2026-10-24) y el volumen de documentación sugieren un proyecto muy reciente; conviene verificar la reproducibilidad de las cifras antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-pi-low-1.0
- Pesos directos: https://huggingface.co/Walkowicz/kairos-pi-low-1.0/resolve/main/model.safetensors
- Benchmark detallado citado en la model card: https://huggingface.co/Walkowicz/kairos-pi-low-1.0/blob/main/BENCHMARK.md
- Código de inferencia custom: https://huggingface.co/Walkowicz/kairos-pi-low-1.0/blob/main/modeling_kairos_pi_low.py
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset CAN-Bus citado: https://huggingface.co/datasets/Thi-Thu-Huong/Multi-CAN-Datasets
- Dataset IoT citado: https://huggingface.co/datasets/19kmunz/iot-23-preprocessed
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban de otro tema y se han descartado).
