# TendieLabs/Diogenes-9B-v1-Heretic-ARA

## Resumen

Diogenes-9B-v1-Heretic-ARA es un checkpoint de investigación publicado por TendieLabs, derivado de Diogenes-9B-v1, que a su vez es un ajuste fino supervisado sobre Qwen3.5-9B. El modelo parte de un merge BF16 autónomo del adaptador original y le aplica una supresión de rechazos mediante Heretic 2.1.0 con Arbitrary-Rank Ablation (ARA) de rango LoRA 50, integrada directamente en los pesos. El resultado es un modelo de 9.409.813.744 parámetros orientado a generación de texto conversacional en inglés, con la torre de visión original congelada y la cabeza MTP nativa preservada en el merge original.

El objetivo declarado del proyecto es la transferencia de comportamiento: respuestas más directas y menor adopción acrítica del relato oficial del Estado chino sobre su propia conducta, entrenado con un subconjunto filtrado de los datos Arete de Nous Research. No se presenta como reproducción de Arete-27B ni como modelo políticamente neutral. La variante Heretic reduce los rechazos de 100/100 a 1/100 en el conjunto `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0499 respecto al original en la distribución del primer token sobre `mlabonne/harmless_alpaca`.

Es relevante ahora porque documenta de forma explícita el proceso de ablación de rechazos y su coste en deriva respecto al modelo base, con métricas de Pareto publicadas (trial 87, trial 97, trial 31, trial 47 descartado). Además, el autor advierte que las métricas de calidad del card corresponden al adaptador v1 sin mergear y no se han vuelto a ejecutar sobre este checkpoint, lo que convierte al modelo en un artefacto de investigación más que en un candidato de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) con torre de visión congelada y cabeza MTP de una capa; tags `qwen3_5`, `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (siete shards; el export de esta variante no incluye `model-mtp.safetensors` ni `preprocessor_config.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3.5-9B, con arquitectura compuesta que incluye una torre de visión (retenida y congelada, sin validación amplia de visión) y una cabeza MTP nativa de una capa con 15 tensores `mtp.*` preservados en el merge BF16 original. El ajuste de comportamiento se realizó con un LoRA de rango 16 solo para lenguaje, sobre 5.535 ejemplos de entrenamiento con un holdout reservado de 291 ejemplos, afectando a 40.108.032 parámetros en 200 módulos de proyección de lenguaje. Los datos provienen de un subconjunto filtrado de `NousResearch/arete-data-pairs`.

Sobre ese merge se aplicó Heretic 2.1.0 con Arbitrary-Rank Ablation (ARA) de rango LoRA 50, ejecutando 100 trials de optimización y seleccionando el trial 87 de la frontera de Pareto. La innovación técnica destacable es la combinación de supresión de rechazos por ablación de rangos arbitrarios con métricas de coste explícitas: 1/100 rechazos con KL 0,0499, frente a alternativas como el trial 97 (3/100 rechazos, KL 0,0305), el trial 31 (6/100, KL 0,0142) y el trial 47 (0/100, KL 1,78, descartado por deriva excesiva). El autor señala que este export no incluye la cabeza MTP ni el `preprocessor_config.json` del merge BF16 original.

## Capacidades

- Generación de texto conversacional en inglés, con modo de pensamiento (thinking) activable y desactivable, según los chequeos de capacidad publicados.
- Razonamiento matemático de ámbito acotado: evaluado en un subconjunto de 64 prompts GSM8K, con y sin thinking.
- Seguimiento de instrucciones: evaluado en 64 prompts IFEval.
- Generación de código: evaluada en 32 prompts HumanEval, con regresión declarada por el autor en las comprobaciones ampliadas.
- Capacidad de visión heredada de Qwen3.5-9B mediante torre congelada, sin validación amplia publicada.
- Cabeza MTP nativa para decodificación multi-token en el merge BF16 original (no incluida en este export).
- Supresión de rechazos: 1/100 en `mlabonne/harmful_behaviors` según el scorer de palabras clave de Heretic.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Investigación sobre ablación de rechazos: el modelo sirve como artefacto reproducible para estudiar la frontera de Pareto entre supresión de rechazos y divergencia KL, comparando los trials 87, 97, 31 y 47 publicados por el autor.
- Evaluación de transferencia de comportamiento: permite medir cómo un ajuste LoRA de rango 16 sobre 5.535 ejemplos modifica la cobertura de hechos requeridos (de 2,61 a 3,32 sobre 5) y el encuadre estatal (de 292 a 29 hallazgos en 803 preguntas), usando el conjunto Censorship & Propaganda Eval.
- Estudio de sesgos y alineación: útil para analizar qué se gana y qué se pierde al eliminar rechazos, dado que el autor documenta la regresión en código y la advertencia de que las puntuaciones no se han revalidado sobre el checkpoint mergeado.
- Experimentos de evaluación comparada con y sin thinking: los 320 registros de capacidad por modelo (64 GSM8K, 64 IFEval, 32 HumanEval en ambos modos) permiten replicar la comparación contra Qwen3.5-9B sin thinking.
- Prototipado de asistentes conversacionales en inglés con respuestas directas: adecuado en entornos de laboratorio donde se prioriza la franqueza sobre las salvaguardas, con la cautela de que no es un despliegue de producción según el propio autor.
- Análisis de pipelines de merge y equivalencia de pesos: el autor publica comprobaciones de merge y un cribado de equivalencia de logits en CPU que falló, lo que lo convierte en un caso de estudio sobre verificación de merges BF16 frente a la fórmula de PEFT.
- Base para experimentos de visión heredada: la torre congelada permite probar transferencia a tareas image-text-to-text, aunque sin validación publicada y sin `preprocessor_config.json` en este export.

## Benchmarks y rendimiento

Evaluación política completa sobre 803 preguntas (comparación Qwen3.5-9B frente al adaptador v1 sin mergear, no sobre este checkpoint):

| Métrica | Qwen3.5-9B | Diogenes v1 (adaptador) |
|---|---:|---:|
| Cobertura de hechos requeridos, media 0-5 (mayor es mejor) | 2,6115 | 3,3151 |
| Respuestas con hallazgos de encuadre del Estado chino (menor es mejor) | 292/803 (36,36 %) | 29/803 (3,61 %) |
| Rechazos | 40/803 | 1/803 |
| Respuestas que alcanzan el límite de 1.024 tokens | 3/803 | 18/803 |

Puntuaciones pareadas de hechos requeridos: mejora en 246 preguntas, empeora en 99, sin cambios en 458; mejora media de 0,7036 puntos con intervalo bootstrap pareado del 95 % de 0,5567 a 0,8543. El adaptador eliminó 265 hallazgos de encuadre del baseline y añadió dos nuevos.

Supresión de rechazos de la variante Heretic ARA (100 prompts de `mlabonne/harmful_behaviors`, scorer de palabras clave de Heretic):

| Métrica | Diogenes-9B-v1 | Este modelo (Heretic ARA) |
|---|---:|---:|
| Rechazos | 100/100 | 1/100 |
| Divergencia KL vs. original, primer token, `mlabonne/harmless_alpaca` | 0 (por definición) | 0,0499 |

Chequeos de capacidad ampliados: subconjunto congelado de 64 GSM8K, 64 IFEval y 32 HumanEval, cada prompt ejecutado una vez con thinking desactivado y otra con thinking activado, 320 registros por modelo. El card solo muestra el dato de GSM8K sin thinking para Qwen3.5-9B (6 correctos) y el resto de la tabla está truncado en la información disponible. El autor indica que el código empeoró en las comprobaciones ampliadas. Las puntuaciones de calidad no se han vuelto a ejecutar sobre el checkpoint mergeado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos (el tamaño del repo es de 18,8 GB), más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) quedan al límite y pueden requerir cuantización o contextos reducidos.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con cuantización a 8 bits o 4 bits; en BF16 completo el margen es muy ajustado.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad de endpoints según los tags; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información proporcionada. La ausencia de `preprocessor_config.json` en este export puede afectar al pipeline image-text-to-text.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Diogenes-9B-v1-Heretic-ARA | 9.409.813.744 | No disponible | No disponible | Supresión de rechazos ARA, 1/100 rechazos, KL 0,0499 |
| Diogenes-9B-v1 | No disponible (adaptador LoRA sobre Qwen3.5-9B) | No disponible | No disponible | Modelo base del anterior; 100/100 rechazos, métricas de calidad publicadas sobre el adaptador |
| Qwen3.5-9B | 9B (clase) | No disponible | No disponible | Baseline sin ajuste; 2,6115 de cobertura de hechos, 292/803 hallazgos de encuadre, 40/803 rechazos |
| Nous Research Arete-27B | 27B (clase) | No disponible | No disponible | Referencia citada por el autor; el modelo no es una reproducción de este |

## Limitaciones y advertencias

- Las métricas de calidad del card corresponden al adaptador v1 sin mergear; no se han vuelto a ejecutar sobre este checkpoint. El autor pide explícitamente no presentarlas como puntuaciones verificadas del modelo mergeado.
- El merge BF16 falló un cribado adicional de equivalencia de logits en CPU, aunque los pesos guardados coinciden con la fórmula de merge BF16 de PEFT.
- Regresión en código documentada en las comprobaciones ampliadas; el rendimiento en GSM8K e IFEval solo se publica parcialmente y sobre subconjuntos acotados, no sobre leaderboards oficiales.
- El recuento de rechazos usa el scorer de palabras clave de Heretic sobre respuestas cortas; no es un benchmark de seguridad ni de calidad.
- La reducción de hallazgos de encuadre se limita al relato del Estado chino bajo la rúbrica del conjunto de 803 preguntas; no certifica neutralidad política general ni fiabilidad factual.
- Una puntuación más alta de hechos requeridos no verifica cada afirmación adicional del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible; el aumento de respuestas que alcanzan el límite de 1.024 tokens (de 3 a 18 sobre 803) sugiere respuestas más largas que pueden incluir contenido no verificado.
- Idiomas: solo inglés declarado; sin soporte multilingüe documentado.
- Este export no incluye la cabeza MTP (`model-mtp.safetensors`) ni `preprocessor_config.json`, por lo que las capacidades de decodificación multi-token y de preprocesado de visión del merge original no están disponibles aquí.
- Licencia no disponible: no se puede confirmar el uso comercial; el autor lo describe como artefacto de investigación local y no como despliegue de producción ni anuncio de pesos públicos.
- Sesgos conocidos: no documentados más allá del objetivo declarado de reducir la adopción del relato estatal chino; el propio autor niega neutralidad política general.
- Contexto máximo no disponible, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TendieLabs/Diogenes-9B-v1-Heretic-ARA
- Modelo base: https://huggingface.co/TendieLabs/Diogenes-9B-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Heretic (herramienta de supresión de rechazos): https://github.com/p-e-w/heretic
- Resultados de benchmarks en formato legible por máquina: `benchmark-results.json` en el repositorio del modelo
- Conjunto de evaluación Censorship & Propaganda Eval: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
