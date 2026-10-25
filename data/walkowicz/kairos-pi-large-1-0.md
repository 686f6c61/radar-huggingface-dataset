# Walkowicz/kairos-pi-large-1.0

## Resumen

Kairos PI Large 1.0 es un modelo de decisión y extracción de características de unos 395 M de parámetros (399.511.302 exactos según los pesos en safetensors), desarrollado por el usuario Walkowicz. No es un modelo generativo: parte de `answerdotai/ModernBERT-large` y se especializa en una única pasada hacia delante (*single forward pass*) para puntuar simultáneamente entre 20 y 50+ causas raíz candidatas y emitir un vector de riesgo continuo de 4 dimensiones. Su ámbito declarado son los sistemas ciberfísicos: SCADA industrial, telemetría de automoción (CAN bus), robótica, aviónica e IoT.

El problema que aborda es el de la desambiguación central en arquitecturas de dos niveles: un modelo pequeño en el borde detecta anomalías y eleva un conjunto de hipótesis, y este modelo de nivel 2 las evalúa conjuntamente mediante auto-atención entre opciones, sin decodificación autoregresiva. Esto elimina la latencia de generación token a token y permite manejar ventanas nativas de 8.192 tokens, suficientes para ráfagas de alarmas de planta o series temporales largas de sensores.

Su relevancia práctica está en dos rasgos poco habituales: la calibración de riesgo continuo (el autor reporta 0.0015 de MSE en un vector 4D) y la "abstención activa", es decir, la capacidad de declarar que ninguna de las opciones candidatas es válida ante entradas fuera de distribución o violaciones de invariantes físicos. La licencia Apache 2.0 y su huella de memoria inferior a 1 GB en FP16 lo hacen desplegable en hardware modesto, aunque la validación disponible se limita al informe de 80 casos del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con cabeceras personalizadas `HierarchicalMaskScorer` y `MultiScoreVectorHead`; no autoregresiva |
| Parámetros totales | 399.511.302 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens nativos |
| Tipos de cuantización | Pesos publicados en safetensors (FP16/FP32); el autor reporta huellas de ~799 MB en FP16 y ~198 MB en INT8. No se publican artefactos GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (1,60 GB) + `config.json`, `tokenizer.json` y `modeling_kairos_pi_large.py` con `custom_code` |

## Arquitectura y entrenamiento

El núcleo es ModernBERT-large, un encoder transformer bidireccional con atención alternada global/local, embeddings rotatorios (RoPE) y contexto nativo de 8.192 tokens. Sobre ese tronco, el autor añade dos cabeceras propietarias implementadas en `modeling_kairos_pi_large.py` (14 KB): `HierarchicalMaskScorer`, que puntúa cada opción candidata con auto-atención cruzada entre opciones, y `MultiScoreVectorHead`, que proyecta el estado final en un vector continuo de riesgo de 4 dimensiones. El pipeline declarado en HuggingFace es `feature-extraction`, coherente con un uso como extractor de representaciones y puntuador, no como generador de texto.

En cuanto a datos, el autor cita tres fuentes: 40.000 registros reales de la turbina Vestas V52 (dataset `vossmoos/vestasv52-scada-windturbine-granada`, 23 canales: velocidad de viento, potencia, pitch, RPM de rotor y generador, temperaturas de rodamientos y aceite de engranajes, error de yaw relativo); el dataset `npeng/drone-telemetry`, con series de vuelo de 190 canales (atenuación de antena, avisos de viento fuerte, cinemática 3D); y un conjunto de anomalías físicas deliberadas (por ejemplo, rotor a 2.800 RPM con viento de 0,0 m/s) para entrenar la abstención ante violaciones de invariantes de conservación. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; al no ser un modelo generativo, esos mecanismos no resultan aplicables en su forma habitual. Tampoco se detalla el proceso de ajuste fino supervisado más allá de la existencia de pesos "fine-tuned production weights".

## Capacidades

- Puntuación conjunta de 20 a 50+ causas raíz candidatas en una sola pasada, con auto-atención cruzada entre opciones en lugar de evaluación independiente.
- Emisión de un vector de riesgo continuo de 4 dimensiones calibrado (el autor reporta 0.0015 de MSE), en lugar de una etiqueta discreta.
- Abstención activa: rechazo explícito de la decisión cuando la entrada está fuera de distribución o viola invariantes físicos, con 20/20 en el conjunto de abstención del informe del autor.
- Procesamiento de series temporales largas de telemetría dentro de una ventana nativa de 8.192 tokens.
- Fusión multimodal de señales heterogéneas (canales SCADA, tramas CAN, telemetría de vuelo, sensores IoT) en un mismo espacio de decisión.
- Extracción de características (`pipeline_tag: feature-extraction`) para clasificadores y políticas downstream.
- Integración en arquitectura de dos niveles como motor de nivel 2, recibiendo candidatos de un modelo de borde más pequeño (Kairos PI Low 1.0).
- Sin soporte declarado de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; solo inglés.

## Casos de uso

- Gestión de tormentas de alarmas en plantas SCADA: el modelo recibe la ráfaga de alarmas concatenada como una secuencia de hasta 8.192 tokens y devuelve la causa raíz más probable entre decenas de candidatas, evitando que el operador priorice manualmente cientos de eventos correlacionados.
- Arbitraje central de dominio en ADAS: con tramas de CAN bus de varios módulos (frenos, dirección, propulsión) en una sola ventana, resuelve a qué dominio corresponde una anomalía ambigua, tarea en la que el autor reporta 85% (17/20) frente al 100% en otras dimensiones.
- Mantenimiento predictivo en parques eólicos: a partir de las 23 series de la Vestas V52 (temperaturas de rodamientos, aceite de engranajes, pitch, yaw), clasifica entre escenarios como derating por par, realineamiento de yaw o parada de emergencia por feathering.
- Detección de anomalías con abstención en lazo de seguridad: ante lecturas físicamente imposibles, el modelo activa la abstención en lugar de forzar una etiqueta, lo que permite derivar a un operador humano o a un protocolo de parada segura.
- Telemetría de robótica y vuelo: procesamiento de las 190 series de `npeng/drone-telemetry` para distinguir entre atenuación de antena, viento fuerte y fallos de cinemática en una única pasada.
- Enrutado previo a un LLM en pipelines de dos niveles: el modelo filtra y reduce las hipótesis a un conjunto pequeño y calibrado, de modo que el modelo generativo solo interviene cuando el riesgo continuo supera un umbral definido por el operador.
- Clasificación downstream por características: al ser un `feature-extraction`, sus embeddings pueden alimentar modelos ligeros de clasificación o regresión sobre datos industriales sin reentrenar el tronco.
- Monitorización de flotas IoT: evaluación de telemetría agregada de dispositivos con ventanas de 8.192 tokens para detectar degradaciones antes de que activen alarmas individuales.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del informe de 80 casos del propio autor (`BENCHMARK.md`), sin validación externa ni resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K no publicados).

| Dimensión / métrica | Kairos PI Symbiotic (dual) | Kairos PI Large 1.0 (este modelo) | Kairos PI Low 1.0 | Convai Laya Baseline |
|---|---|---|---|---|
| Puntuación global 80 casos | 97,5% (78/80) | 95,0% (76/80) | 92,5% (74/80) | 48,8% (39/80) |
| Abstención activa (20) | 100,0% (20/20) | 100,0% (20/20) | 100,0% (20/20) | 0,0% (0/20) |
| SCADA eólico industrial (20) | 100,0% (20/20) | 100,0% (20/20) | 80,0% (16/20) | 55,0% (11/20) |
| Robótica y telemetría de vuelo (10) | 100,0% (10/10) | 100,0% (10/10) | 80,0% (8/10) | 70,0% (7/10) |
| Telemetría CAN bus automoción (20) | 100,0% (20/20) | 85,0% (17/20) | 100,0% (20/20) | 65,0% (13/20) |
| Telemetría IoT (10) | 100,0% (10/10) | 90,0% (9/10) | 100,0% (10/10) | 80,0% (8/10) |
| Latencia P50 en GPU (una pasada) | 35,8 ms / 168,3 ms | 168,3 ms (20 opciones) | 35,8 ms | 36,8 ms |
| Ventana de contexto máxima | 8.192 tokens | 8.192 tokens nativos | 2.048 tokens | 512 tokens (limitada) |
| Calibración de riesgo | Vector 4D (0,0015 MSE) | Vector 4D (0,0015 MSE) | Brier 1D calibrado | Discreta (sin vector) |
| Huella de memoria (FP16 / INT8) | 299 MB + 799 MB | ~799 MB / ~198 MB | ~299 MB / ~74 MB | ~640 MB / ~160 MB |

## Requisitos de hardware

- VRAM estimada: ~799 MB en FP16 y ~198 MB en INT8 según el autor; el repositorio completo ocupa 1,6 GB. Con activaciones y ventana de 8.192 tokens conviene reservar 2-4 GB.
- GPU recomendadas: H100, A100 o L40S para despliegue central con lotes grandes; RTX 4090/3090 sobradas para inferencia interactiva.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3060, RTX 4060 Ti). Incluso es viable en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el módulo `modeling_kairos_pi_large.py`; no hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo autoregresivo y requerir código personalizado. Para producción conviene envolverlo en un servidor propio (FastAPI, Triton) con batching dinámico.
- Latencia: P50 de 168,3 ms en GPU con 20 opciones candidatas según el autor; el modelo dual-tier baja a 35,8 ms. No se especifica la GPU empleada ni el throughput en tokens/s, por lo que estas cifras no son reproducibles sin medir en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación 80 casos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos PI Large 1.0 | 399.511.302 | 8.192 tokens | 95,0% (76/80) | Apache 2.0 | HuggingFace, pesos safetensors + código custom |
| Kairos PI Low 1.0 | no disponible (huella ~299 MB FP16) | 2.048 tokens | 92,5% (74/80) | no disponible | Referenciado en el model card; no se enlaza repositorio |
| Kairos PI Symbiotic (dual-tier) | no disponible (combinación de ambos) | 8.192 tokens | 97,5% (78/80) | no disponible | Configuración de despliegue, no un checkpoint único |
| Convai Laya Baseline | no disponible | 512 tokens | 48,8% (39/80) | no disponible | Usado como línea base en el informe del autor |
| `answerdotai/ModernBERT-large` (base) | no disponible en la información | no disponible en la información | no evaluado en este informe | no disponible en la información | HuggingFace |

No se dispone de comparación con modelos de decisión o clasificación de series temporales de propósito general (por ejemplo, arquitecturas tipo TimesNet o clasificadores XGBoost sobre features), que serían el contrapunto realista en producción.

## Limitaciones y advertencias

- Validación exclusivamente interna: los 80 casos del *gauntlet* los ha diseñado el propio autor, sin conjunto de test independiente ni réplica por terceros. Cero descargas y cero likes en HuggingFace en el momento de la ficha, por lo que no hay evidencia de uso comunitario.
- Ausencia total de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros), lo que impide comparar su calidad con modelos públicos de tamaño similar.
- Solo inglés: los identificadores de opciones y cualquier texto de entrada deben formularse en inglés; no hay evidencia de comportamiento en castellano.
- Dependencia de código personalizado (`custom_code`): requiere `trust_remote_code=True` o la carga manual de `modeling_kairos_pi_large.py`, lo que implica revisar y auditar el código antes de ejecutarlo en entornos productivos.
- El conjunto de opciones candidatas debe proporcionarse en el *prompt*; el modelo no genera hipótesis nuevas, solo puntúa las existentes. Un conjunto mal diseñado degrada directamente la salida.
- Riesgo de sobreajuste a los dominios y plantillas de entrenamiento (Vestas V52, drones, CAN bus): el rendimiento en otras maquinarias o protocolos industriales no está caracterizado.
- La calibración del vector de riesgo (0,0015 MSE) está medida sobre la distribución del autor; en producción puede desviarse y requerir recalibración con datos propios.
- La fecha de publicación indicada en HuggingFace es 2026-10-24; conviene verificar la vigencia y el historial de revisiones del repositorio antes de fijar una versión.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el tronco ModernBERT subyacente debe verificarse por separado (no se detalla su licencia en la información disponible).
- No apto como generador de texto ni como asistente conversacional: el pipeline es `feature-extraction` y no produce lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-pi-large-1.0
- Pesos: https://huggingface.co/Walkowicz/kairos-pi-large-1.0/resolve/main/model.safetensors
- Configuración: https://huggingface.co/Walkowicz/kairos-pi-large-1.0/resolve/main/config.json
- Informe de benchmarks (80 casos): https://huggingface.co/Walkowicz/kairos-pi-large-1.0/resolve/main/BENCHMARK.md
- Código de modelado: https://huggingface.co/Walkowicz/kairos-pi-large-1.0/resolve/main/modeling_kairos_pi_large.py
- Tokenizer: https://huggingface.co/Walkowicz/kairos-pi-large-1.0/resolve/main/tokenizer.json
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset SCADA eólico: https://huggingface.co/datasets/vossmoos/vestasv52-scada-windturbine-granada
- Dataset de telemetría de drones: https://huggingface.co/datasets/npeng/drone-telemetry
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente contenido no relacionado.
