# yale-cultural-heritage/kev-4b-lux-places-part-of

## Resumen

kev-4b-lux-places-part-of es un adaptador PEFT LoRA (r16, α32) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por Yale Cultural Heritage AI. No es un modelo generativo al uso: es un clasificador de decisiones («system-one») que responde a preguntas binarias del tipo «¿es verdad este enunciado sobre el estado?» (preguntas *Noul*) devolviendo una probabilidad calibrada. En concreto, evalúa si un lugar de LUX (el hijo) es realmente parte del lugar declarado como padre, a partir de los registros de autoridad a los que ambos son equivalentes (Wikidata, GeoNames, Who's On First, Getty TGN, LoC, GND) y de lo que las jerarquías de esas autoridades dicen sobre el vínculo.

El adaptador se construye sobre kev-4b-lux-places-equivalence, afinado un paso más sobre los enlaces `part_of` de LUX. Se entrenó con system1-finetune-bench y las decisiones fueron producidas y etiquetadas por el flujo chai en lux-bad-part-of, que también lo ejecuta. El repositorio ocupa 0,1 GB e incluye el adaptador LoRA, la cabeza pointer ajustada, la temperatura de recalibración (T = 2,071) y los ficheros de configuración y métricas del entrenamiento.

Su relevancia es práctica: permite auditar automáticamente jerarquías geográficas en colecciones de patrimonio cultural, un problema de calidad de metadatos donde los errores de fusión o inversión de padres son frecuentes y costosos de detectar manualmente. No obstante, las etiquetas positivas son consenso entre máquinas, no verificado por personas, y los negativos son sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) con cabeza pointer de clasificación y adaptador LoRA r16 / α32 |
| Parametros totales | 4B en el modelo base; adaptador LoRA de ~135 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), head.pt, JSON de configuración y métricas |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (commit `1001bb4d…`) y se afina mediante un adaptador LoRA de rango 16 y alpha 32, continuando desde el adaptador kev-4b-lux-places-equivalence. La salida no es texto generado, sino una decisión binaria con probabilidad: el checkpoint incluye una cabeza pointer ajustada (`head.pt`) y una temperatura de recalibración de T = 2,071 ajustada sobre preguntas Noul. El estado de entrada es texto estructurado que describe el hijo, el padre declarado y las líneas de evidencia de las jerarquías de las autoridades (Wikidata P131/P17, padres de GeoNames, ancestros de Who's On First, padres de TGN), clasificadas como *supported*, *reversed*, *contradicted*, *parent over-merged* o *unknown*.

Los datos de entrenamiento provienen de una muestra sembrada de 700 lugares de LUX con enlaces `part_of` (980 enlaces). Para cada enlace se recogieron los registros de autoridad de ambos lugares y se preguntó a dos modelos (TypeSafe's Jev y Gemini 3.1 Flash Lite) el enunciado; se conservaron las 921 decisiones en las que ambos coincidieron (94 %) y se apartaron 59 discrepancias para revisión humana. Dado que los enlaces reales de LUX son casi siempre correctos (solo 23 de 921 son «no es parte»), se añadieron 700 negativos sintéticos emparejando cada hijo con el padre de otra muestra no respaldado por ninguna autoridad, en otro país (142) o en el mismo (558). El total es de 1.621 decisiones, divididas por lugar hijo: 1.223 de entrenamiento, 119 de desarrollo y 279 de prueba. El checkpoint se eligió por pérdida en el split de desarrollo, no por puntuación en test.

## Capacidades

- Clasificación binaria de relaciones de contención geográfica o administrativa entre lugares, con salida de probabilidad calibrada.
- Verificación de enlaces `part_of` de LUX frente a jerarquías de múltiples autoridades (Wikidata, GeoNames, Who's On First, Getty TGN, LoC, GND).
- Detección de padres sobrefusionados (*parent over-merged*), vínculos invertidos (*reversed*) y contradicciones entre autoridades.
- Segunda consulta sobre padres que comparten el nombre del hijo (por ejemplo, «Vinhais (Portugal)» parte de «Vinhais»): determinar si ambos registros son el mismo lugar.
- Respuesta a preguntas Noul (¿es cierto el enunciado sobre el estado?) con probabilidad, no con texto libre.
- Integración como `decision.DecisionClassifier` de familia `pointer` en chai-engine, con carga desde el Hub en el primer uso.
- No soporta tool calling, agentes, visión, audio ni generación de texto; es un clasificador especializado.

## Casos de uso

- Auditoría de jerarquías geográficas en LUX: procesar los enlaces `part_of` de una colección y marcar como sospechosos aquellos con probabilidad baja o evidencia contradictoria, para revisión humana posterior.
- Limpieza de metadatos en agregadores de patrimonio cultural: detectar padres sobrefusionados donde una autoridad ha mezclado dos lugares distintos bajo un mismo registro.
- Detección de vínculos invertidos: identificar casos en los que el hijo y el padre declarados están intercambiados, usando las líneas de evidencia de las jerarquías de las autoridades.
- Desambiguación de lugares homónimos: resolver si «Vinhais (Portugal)» y «Vinhais» son el mismo lugar o entidades distintas, mediante la segunda consulta prevista por el modelo.
- Validación de importaciones de datos: verificar automáticamente los enlaces de contención antes de ingerir registros de GeoNames, Wikidata o TGN en un catálogo institucional.
- Enriquecimiento con evidencia multi-autoridad: usar la salida del modelo junto con las líneas de evidencia para generar informes de calidad explicables, ya que el estado de entrada documenta qué dice cada autoridad.
- Control de regresiones en pipelines de datos: ejecutar el clasificador como paso de CI sobre muestras de enlaces y comparar la tasa de rechazo de negativos sintéticos frente a la línea base.

## Benchmarks y rendimiento

Decisiones Noul sobre el split de test retenido: 279 decisiones, de las cuales 160 son enlaces reales de LUX (154 «part of», 6 «not part of») y 119 son negativos sintéticos.

| Modelo | Balanced accuracy | AUROC | Brier | Enlaces reales: accuracy / AUROC | Negativos sintéticos rechazados |
|---|---|---|---|---|---|
| kev-4b-lux-places-equivalence (sin afinar) | 0,970 | 0,995 | 0,031 | 0,950 / 0,977 | 99,2 % |
| **este modelo** | **0,983** | **0,999** | **0,014** | **0,969 / 0,974** | **100 %** |

El modelo de equivalencia sin afinar ya obtiene buenos resultados porque las líneas de evidencia del estado contienen buena parte de la respuesta; el afinado mejora sobre todo la calibración (Brier de 0,031 a 0,014) y el rechazo de padres incorrectos. Con solo seis enlaces reales «not part of» en el test, las cifras sobre enlaces reales dicen poco sobre los errores genuinos poco frecuentes en LUX; los 5 errores del test son todos enlaces reales sobre los que los dos modelos etiquetadores dudaban.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el adaptador LoRA ocupa ~135 MB además del modelo base de 4B.
- GPU recomendadas: no disponible. El ejemplo de uso de la model card emplea `device: "mps"` (Apple Silicon) o `cuda`, y permite omitir el dispositivo para ejecutar en CPU.
- GPU de consumo: no confirmado en la información disponible; el modelo base es de 4B parámetros, lo que en principio es abordable en GPUs de consumo con cuantización, pero no se documentan cuantizaciones ni requisitos concretos.
- Opciones de despliegue: chai-engine mediante `decision.DecisionClassifier` (familia `pointer`), que carga el modelo desde el Hub en el primer uso. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-4b-lux-places-part-of | 4B (base) + LoRA | no disponible | Clasificación binaria de relaciones `part_of` | apache-2.0 | Hugging Face |
| kev-4b-lux-places-equivalence | 4B (base) + LoRA | no disponible | Clasificación de equivalencia entre lugares | apache-2.0 | Hugging Face |
| kev-4b-europeana-persons | 4B (base) + LoRA | no disponible | Clasificación de entidades de persona en Europeana | apache-2.0 | Hugging Face |
| jaredpalmer/kev-4b | 4B (base) + LoRA | no disponible | Modelo kev base con la misma disposición de ficheros | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento entre ellos.

## Limitaciones y advertencias

- Las etiquetas positivas son consenso entre dos modelos (Jev y Gemini 3.1 Flash Lite), no verificado por personas; las métricas miden acuerdo con esa construcción, no precisión sobre los errores reales de LUX.
- Los negativos son sintéticos (700 muestras), por lo que el rendimiento en negativos reales puede diferir.
- Solo hay seis enlaces reales «not part of» en el test, insuficiente para caracterizar el comportamiento ante errores genuinos poco frecuentes.
- El modelo de equivalencia sin afinar ya rinde muy alto porque la evidencia está en el estado de entrada; parte del rendimiento es atribuible a la construcción del estado, no al modelo.
- No es un modelo generativo: no responde preguntas abiertas, no genera texto y no soporta tool calling ni agentes.
- Idiomas soportados no documentados; el modelo está especializado en metadatos de patrimonio cultural en el contexto de LUX.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base Qwen3.5-4B-Base puede tener sus propias condiciones que conviene verificar.
- El checkpoint se eligió por pérdida en desarrollo, no por puntuación en test, lo que reduce el riesgo de sobreajuste al test pero no lo elimina.
- Riesgo de sesgo derivado de las autoridades subyacentes (Wikidata, GeoNames, TGN, etc.), cuyas jerarquías pueden contener errores o sesgos geográficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yale-cultural-heritage/kev-4b-lux-places-part-of
- Modelo de equivalencia base: https://huggingface.co/yale-cultural-heritage/kev-4b-lux-places-equivalence
- Modelo kev-4b base de jaredpalmer: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio system1-finetune-bench: https://github.com/yale-ch/system1-finetune-bench
- Repositorio lux-bad-part-of: https://github.com/yale-ch/lux-bad-part-of
- Repositorio chai-engine: https://github.com/yale-ch/chai-engine
- Yale University: https://www.yale.edu/about-yale
