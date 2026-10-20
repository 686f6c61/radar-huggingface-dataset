# syvorai/decisum

## Resumen

Decisum v10+swa es un modelo de clasificación de texto publicado por Syvor AI (Raphael Pizzo, organización `syvorai` en HuggingFace) para el triaje automático de tickets de soporte de comercio electrónico en portugués de Brasil. No es un modelo generativo: es un ensemble de dos codificadores `jhu-clsp/mmBERT-base` (322 M de parámetros cada uno, transformer ModernBERT multilingüe con vocabulario de 256k y 8k de contexto) dotados de cabezas de marcadores de opción que responden tres preguntas tipadas en una sola pasada por pregunta: categoría (17 clases), decisión (5 clases: aprovar, rejeitar, escalar, executar_acao, pedir_mais_info) y urgencia (puntuación de 0 a 3).

El modelo resuelve un problema muy concreto de producción: decidir si un caso puede resolverse de forma totalmente automática o debe escalarse. Para ello promedia las distribuciones de probabilidad calibradas por temperatura de sus dos miembros (`checkpoints/v10` y `checkpoints/swa`) y calcula la confianza de enrutamiento como el mínimo de las tres respuestas; por encima de un umbral (0,8 por defecto) el caso pasa a automático, y por debajo se deriva a un modelo mayor o a un humano, en una arquitectura que los autores denominan "System 1 / System 2".

Su relevancia ahora es la de un champion de producción medido y comparado: se seleccionó tras una campaña de nueve challengers evaluados sobre el mismo conjunto privado de 1.499 casos reales, con licencia Apache 2.0, huella pequeña (2 × 1,2 GB en fp32) y latencias de decenas de milisegundos en GPU, lo que permite mantenerlo siempre encendido como primera etapa de un pipeline de triaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos codificadores transformer (ModernBERT multilingüe, base `jhu-clsp/mmBERT-base`) con cabezas de marcadores de opción (*option-marker heads*) |
| Parametros totales | 2 × 322 M (≈644 M en el ensemble) |
| Longitud de contexto | 8k tokens (heredado de mmBERT-base) |
| Tipos de cuantizacion | no disponible; los pesos publicados están en fp32 (2 × 1,2 GB) |
| Idiomas soportados | portugués (`pt`), con foco en PT-BR |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, librería `transformers` (tamaño de repo: 2,5 GB) |

## Arquitectura y entrenamiento

Cada miembro del ensemble es un encoder `jhu-clsp/mmBERT-base`: un transformer ModernBERT multilingüe de 322 M de parámetros, vocabulario de 256k tokens y 8k de contexto. La innovación de la cabeza es que no genera texto: cada pregunta se responde puntuando marcadores de opción presentes en el texto, con una pasada hacia delante por pregunta y sin decodificación autorregresiva. Ambos miembros se entrenaron con la misma receta (v10 con corpus híbrido más corpus KL; swa con los mismos datos más *Stochastic Weight Averaging* sobre el último 25% del entrenamiento), lo que los hace lo bastante diversos como para que el promedio aporte ganancia.

La calibración se hace por pregunta y por miembro mediante *temperature scaling* (artefactos `temperaturas.pt` y `calibracao.json` dentro de cada checkpoint), y el ensemble promedia las distribuciones ya calibradas. La información disponible menciona corpus híbrido, corpus KL, self-training tipo *born-again*, reetiquetado con el modelo propio Imperium (26B) y una combinación de focal loss, R-Drop, FGM y SWA como parte de los experimentos de entrenamiento; no se detalla el número total de tokens ni la composición exacta del dataset.

## Capacidades

- Clasificación de categoría de ticket en 17 clases: `reembolso`, `troca_devolucao`, `fraude_suspeita`, `prazo_envio`, `pagamento`, `frete`, `produto_defeito`, `chargeback`, `duvida_comercial`, `outro`, `incidente`, `whatsapp_meta`, `bug_produto`, `integracao`, `conta_config`, `plano_creditos`, `duvida_produto`.
- Predicción de decisión en 5 clases: `aprovar`, `rejeitar`, `escalar`, `executar_acao`, `pedir_mais_info`.
- Puntuación de urgencia en escala 0–3: `baixa`, `moderada`, `alta`, `crítica`.
- Salida de probabilidades calibradas por pregunta, aptas para umbrales de enrutamiento y para la regla de confianza mínima entre las tres respuestas.
- Procesamiento de conversaciones de soporte de hasta 8k tokens en una sola pasada por pregunta.
- Inferencia en GPU (CUDA, ROCm, XPU, MPS) y también en CPU.
- No soporta *tool calling*, ni agentes, ni razonamiento multi-paso generativo, ni visión, ni audio, ni modo *thinking*: es exclusivamente un clasificador multi-tarea.

## Casos de uso

- Triaje de primera línea en atención al cliente: el modelo lee la conversación completa (hasta 8k tokens) y devuelve categoría, decisión y urgencia en una sola llamada; con confianza mínima superior a 0,8 el caso se resuelve de forma automática sin intervención humana.
- Enrutamiento a colas especializadas: la categoría predicha (17 clases, incluidas `chargeback`, `fraude_suspeita` o `whatsapp_meta`) permite dirigir el ticket al equipo correcto y priorizar por la urgencia estimada.
- Automatización de reembolsos y devoluciones de bajo riesgo: cuando la decisión es `aprovar` o `rejeitar` con alta confianza, el sistema puede ejecutar la acción directamente; los casos dudosos se derivan.
- Detección temprana de fraude y contracargos: las categorías `fraude_suspeita` y `chargeback` junto con urgencia `crítica` sirven como señal de escalado inmediato a un modelo mayor (por ejemplo, Imperium 26B) o a un analista.
- Etapa "System 1" de una arquitectura de dos niveles: al costar decenas de milisegundos por caso, filtra el volumen y reserva el cómputo de modelos generativos grandes solo para el porcentaje de casos que supera el umbral de escalado.
- Monitorización y analítica de soporte: agregando las salidas del modelo sobre el histórico de tickets se obtienen distribuciones de categoría, decisión y urgencia por periodo, canal o producto, sin etiquetado manual.
- Despliegue en hardware modesto o heterogéneo: al caber en una única GPU de consumo y funcionar también en CPU (con latencias de cientos de milisegundos a segundos), permite espejos de producción en Apple Silicon, AMD ROCm o Intel XPU manteniendo paridad numérica.

## Benchmarks y rendimiento

Regla oficial: conjunto privado curado por humanos, 1.499 casos reales, split fijo con semilla 42, nunca usado en entrenamiento; el *temperature scaling* se ajusta sobre el split de calibración.

| Metrica | v10+swa (este modelo) | Mejor miembro individual (swa) |
|---|---|---|
| Exactitud global (todas las preguntas) | 0,6339 | 0,6242 |
| Exactitud en el núcleo difícil adjudicado por humanos | 0,6170 | 0,6150 |
| Exactitud de categoría | 0,5618 | 0,5551 |
| Exactitud de decisión | 0,6481 | 0,6295 |
| Exactitud de urgencia | 0,6919 | 0,6879 |
| Macro-F1 de categoría (17 clases) | 0,4301 | 0,4693 |

Exactitud por pregunta de cada miembro en el split de test: v10 — categoría 0,5471 / decisión 0,6441 / urgencia 0,6786; swa — 0,5551 / 0,6295 / 0,6879.

Campaña de challengers sobre la misma regla y protocolo:

| Challenger | Idea | Exactitud global | Veredicto |
|---|---|---|---|
| Self-training (born-again) | reentrenar sobre las predicciones del champion | 0,6087 | mejor núcleo difícil registrado (0,6016), pero colapso del recall en la cola |
| Fuente de etiquetas alternativa (Imperium 26B) | reetiquetar los datos de entrenamiento con el modelo propio de 26B | 0,6184 | sólido en global, pero pierde recall en la cola de categorías |
| Stack de entrenamiento (focal + R-Drop + FGM + SWA) | regularizar y optimizar todo el paso de entrenamiento | 0,5644 | sobrerregularizado (−4,8 pp); eso sí, SWA dentro del stack funcionó |

La información disponible se interrumpe al describir el cuarto challenger (slice de *active learning*, +6k casos inciertos), por lo que no se dispone de su resultado.

## Requisitos de hardware

- VRAM estimada: 2,4 GB solo de pesos en fp32; en la práctica hay que sumar activaciones y overhead del runtime (no se publica una medición de VRAM pico).
- Cabe en cualquier GPU de consumo con 8 GB o más; los pesos en fp32 no requieren GPU de datacenter.
- GPU medidas (ensemble, las 3 preguntas por caso, batch 1, conversación representativa de ~430 tokens PT-BR): NVIDIA RTX PRO 6000 (Blackwell) ~56 ms; AMD RX 7900 XTX (ROCm) ~111 ms; AMD RX 7900 XT (ROCm) ~130 ms; Intel Arc Pro B60 (XPU) ~140 ms; Apple M2 Max (MPS) ~168 ms; Apple M4 Pro (MPS) ~205 ms; Apple M5 (MPS) ~339 ms.
- CPU medidas: Apple M4 Pro ~405 ms; Apple M2 Max ~596 ms; Apple M5 ~612 ms; AMD Threadripper 2970WX (24C, wheel estándar de torch, 24 hilos) ~2.900 ms.
- Un solo miembro (3 pasadas en lugar de 6) reduce la latencia aproximadamente a la mitad: ~28 ms en RTX PRO 6000, ~55 ms en RX 7900 XTX, ~84 ms en M2 Max (MPS).
- Throughput: no documentado; derivado de la latencia a batch 1, el ensemble en RTX PRO 6000 equivale a ~17 casos/s por dispositivo.
- Despliegue: no se documentan integraciones oficiales con vLLM, TGI, llama.cpp ni Ollama; el modelo se sirve con `transformers`/torch y el script de referencia `scripts/bench_latencia_ensemble.py` (torch 2.14, batch 1).
- Nota de rendimiento: en Apple Silicon el cuello de botella es el ancho de banda de memoria, por lo que el M2 Max (400 GB/s) supera al M4 Pro y al M5 en la ruta GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisum v10+swa | 2 × 322 M | 8k | Clasificación multi-tarea de tickets PT-BR (categoría, decisión, urgencia) | Apache 2.0 | HuggingFace (`syvorai/decisum`) |
| `jhu-clsp/mmBERT-base` | 322 M | 8k | Encoder base multilingüe, sin cabezas de tarea | no disponible en la información proporcionada | HuggingFace |
| Veredicto (Syvor AI) | 9B | no disponible | Modelo de la misma línea, pensado como etapa superior (System 2) | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Imperium (Syvor AI) | 26B | no disponible | Modelo de la misma línea, usado como fuente de etiquetas y etapa superior | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Clasificadores genéricos de tickets en PT-BR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks de modelos de terceros sobre la misma regla de evaluación privada, por lo que la comparación numérica directa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Exactitud global de 0,6339: aproximadamente uno de cada tres casos se clasifica mal en al menos una de las tres preguntas, por lo que el uso autónomo solo es razonable con umbral de confianza y derivación a humano o a un modelo mayor.
- El macro-F1 de categoría del ensemble (0,4301) es peor que el de su mejor miembro individual (0,4693): el promedio mejora la exactitud global pero degrada el rendimiento en la cola de clases poco frecuentes de las 17 categorías.
- La exactitud de categoría (0,5618) es la más baja de las tres tareas; conviene no usarla como única señal para decisiones irreversibles.
- Modelo monolingüe en portugués (PT-BR): no cubre otros idiomas ni variantes del portugués europeo más allá del entrenamiento del encoder base.
- Entrada limitada a 8k tokens: conversaciones de soporte más largas deben truncarse o resumirse, con la consiguiente pérdida de información.
- No es un modelo generativo: no produce texto libre, explicaciones ni justificaciones, solo distribuciones sobre opciones predefinidas; no dispone de *tool calling* ni de razonamiento multi-paso.
- Riesgo de alucinación en sentido generativo no aplicable; el riesgo equivalente es la confianza mal calibrada fuera de la distribución de entrenamiento (nuevos productos, nuevos canales o cambios en el catálogo de categorías).
- Sesgos potenciales derivados del corpus de soporte de comercio electrónico brasileño con el que se entrenó y del conjunto privado de evaluación; no se documentan análisis de sesgo por demografía, canal o tipo de cliente.
- El benchmark es privado y no reproducible externamente (1.499 casos, split semilla 42); los números no se pueden verificar de forma independiente.
- La evaluación se hizo con *temperature scaling* ajustado sobre el split de calibración; usar los pesos sin los artefactos de calibración (`temperaturas.pt`, `calibracao.json`) invalida las garantías de confianza y el umbral de 0,8.
- Licencia Apache 2.0: permite uso comercial y modificaciones, sin garantías; conviene conservar el aviso de licencia y verificar la licencia del modelo base `jhu-clsp/mmBERT-base`, que no se detalla en la información proporcionada.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de adopción externa ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syvorai/decisum
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Sitio del autor (Syvor AI): https://syvor.ai
- Script de benchmark de latencia citado en la model card: `scripts/bench_latencia_ensemble.py` (incluido en el repositorio del modelo)
- Artefactos de calibración citados: `checkpoints/v10`, `checkpoints/swa`, `temperaturas.pt`, `calibracao.json`
