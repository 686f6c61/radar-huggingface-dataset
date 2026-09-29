# yava-code/Tessera-1B-Nano

## Resumen

Tessera-1B-Nano es un checkpoint de investigación publicado por la cuenta yava-code (atribuido en la model card a Paragon Intelligence Labs) que implementa una replicación a pequeña escala de ConceptLM sobre el backbone HuggingFaceTB/SmolLM2-360M. Se trata de un modelo causal de generación de texto que conserva la generación ordinaria por siguiente token y añade una ruta de conceptos causal y cuantizada sobre fragmentos (chunks) de 4 tokens: los estados de token se agrupan en conceptos, se cuantizan con product quantization, se procesan mediante bloques de concepto causales y el siguiente concepto predicho se reinyecta en el decodificador de tokens.

El interés del checkpoint es metodológico más que de rendimiento: procede de una comparación token-matched contra el backbone SmolLM2-360M sin modificar, en la que ambos brazos consumieron los mismos tokens del mismo corpus empaquetado, en el mismo orden y desde la misma inicialización. La model card reporta que la pérdida de token es neutra respecto a la línea base (dentro del ruido de ejecución), que el canal de conceptos se usa de forma causal (anular el feedback de concepto cuesta +0,1050 nats de pérdida NTP en held-out) y que el codebook no colapsa (perplejidad 7,5477, uso del 85,6 %).

El modelo tiene 382.718.400 parámetros reales según el índice de safetensors, pese a la denominación "1B" y "Nano" del nombre, y se distribuye bajo licencia Apache 2.0. Requiere `trust_remote_code=True` por incluir código personalizado. No se documentan en la información disponible la longitud de contexto, los idiomas soportados ni los tipos de cuantización admitidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (SmolLM2-360M) con ruta adicional de prediccion de siguiente concepto (NCP) causal y product-quantized |
| Parametros totales | 382.718.400 (382,7 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 1,5 GB |
| Tamano de chunk de concepto | 4 tokens |
| Product code | 15 segmentos x 64 entradas |
| Bloques de concepto causales | 2 |
| Punto de inyeccion | Antes del bloque 2 del decodificador de tokens |
| Objetivo NCP | Siguiente concepto continuo |
| Funcion de perdida | `L_ntp + 1 L_ncp + 1 L_vq` |
| Modelo base | HuggingFaceTB/SmolLM2-360M |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte del transformer causal SmolLM2-360M y le superpone una ruta de conceptos: los estados de token se agrupan en chunks de 4 tokens y se agregan (pooling) en conceptos; esos conceptos se cuantizan con un product code de 15 segmentos x 64 entradas; a continuación se procesan mediante 2 bloques de concepto causales; el siguiente concepto continuo predicho (objetivo NCP) se reinyecta antes del bloque 2 del decodificador de tokens. El entrenamiento optimiza una suma ponderada de tres términos con peso 1 para cada uno: pérdida de predicción de siguiente token (`L_ntp`), pérdida de predicción de siguiente concepto (`L_ncp`) y pérdida de cuantización vectorial (`L_vq`). La model card describe esta implementación como una versión compacta de estilo ConceptLM, no como una réplica del NCP-ArchPreview de 8,9 B: omite codificación residual iterativa, conexiones residuales entre escalas y la receta de entrenamiento a gran escala.

El entrenamiento consumió 999.948.288 tokens (aproximadamente 1 B) del mismo corpus empaquetado y en el mismo orden que el brazo de control, partiendo de la misma inicialización, sin reinicios y sin NaNs, con un coste de cómputo estimado y registrado de 30,27 dólares. Más allá de las intervenciones de ablación, la model card no documenta uso de RLHF, DPO ni decodificación especulativa. La evidencia de que el canal de conceptos aporta información se basa en intervenciones de inferencia sobre lotes idénticos: cero feedback de concepto incrementa la pérdida NTP en 0,1050 nats y feedback barajado en 0,0008 nats, lo que sugiere que la reinyección real del concepto predicho es la que aporta la señal, no un efecto genérico de la ruta.

## Capacidades

- Generación de texto autorregresiva por siguiente token, heredada del backbone SmolLM2-360M.
- Predicción de siguiente concepto continuo (next concept prediction) sobre chunks de 4 tokens, con codebook de product quantization de 15 x 64 entradas.
- Reinyección causal del concepto predicho en el decodificador de tokens antes del bloque 2.
- Trazabilidad experimental: el repositorio incluye `eval.json` y `metrics.jsonl` con las métricas e intervenciones.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no documentadas.
- Carga mediante `transformers` con código remoto personalizado (`trust_remote_code=True`).
- Divulgación explícita de que no se ha publicado una comparación de benchmarks estándar frente a terceros.

## Casos de uso

- Investigación sobre modelado a nivel de concepto: el modelo permite medir el efecto causal de una ruta de conceptos sobre un backbone congelado en su arquitectura, usando los deltas de intervención (0 nats frente a +0,1050 nats al anular el feedback) como métrica de utilidad del canal.
- Replicación y auditoría de resultados: al publicarse las métricas, el log del trainer y los hashes del corpus empaquetado en el repositorio ncp-smol, sirve para reproducir el experimento token-matched y verificar que la pérdida de token respecto a la línea base es neutra.
- Ablaciones controladas de componentes: los hiperparámetros documentados (chunk size 4, 15 x 64 entradas de codebook, 2 bloques de concepto, inyección antes del bloque 2) permiten variar cada pieza y aislar su contribución sin reentrenar desde cero el backbone.
- Docencia y formación en arquitecturas híbridas: es un ejemplo compacto y ejecutable de cómo acoplar cuantización vectorial y predicción de concepto a un transformer causal estándar.
- Inferencia de bajo coste en hardware modesto: con 382,7 M de parámetros y pesos que ocupan aproximadamente 1,5 GB en el repositorio (coherente con fp32), cabe en GPUs de consumo para generación de texto en local con fines de experimentación.
- Generación de texto en prototipos y demos internas: al derivar de SmolLM2-360M y mantener generación por siguiente token, puede usarse para tareas de completado y redacción de baja exigencia donde no se requiera calidad de frontera.
- Estudio de dinámica de codebooks: las curvas de uso creciente y la perplejidad del codebook (7,5477 con 85,6 % de uso) lo hacen apto para investigar colapso de vocabularios aprendidos en product quantization.
- Comparación frente al backbone sin modificar: sirve como brazo experimental en estudios que necesiten separar el efecto de una ruta latente adicional del efecto del propio corpus y presupuesto de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Las unicas metricas aportadas por el autor son las de evaluacion interna del experimento:

| Metrica | Valor |
|---|---:|
| Perdida NTP en held-out | 2,5142 |
| Perplejidad en held-out | 12,3568 |
| Delta con feedback a cero (aumento de perdida NTP) | 0,1050 |
| Delta con feedback barajado (aumento de perdida NTP) | 0,0008 |
| Perplejidad / uso del codebook | 7,5477 / 85,6 % |
| Tokens de entrenamiento | 999.948.288 |
| Coste de computo estimado y registrado | 30,27 USD |

Los deltas de intervencion se definen como incrementos de la perdida NTP en held-out respecto al feedback normal de concepto predicho, evaluados sobre lotes identicos. La propia model card indica que la perdida de token frente al brazo de control token-matched queda dentro del ruido de ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB solo para pesos en fp32 (382,7 M x 4 bytes), coherente con el tamano del repositorio; en fp16/bf16 serian unos 0,77 GB y en int8 unos 0,4 GB, pero no se documentan tipos de cuantizacion soportados, por lo que estas cifras son estimaciones derivadas del numero de parametros, no datos confirmados.
- Overhead adicional: hay que sumar activaciones y cache KV, no documentados. Como referencia practica, cualquier GPU con 4 GB o mas deberia poder ejecutar el modelo en fp32.
- GPU recomendadas: no se especifica ninguna. Por tamano, no requiere A100 ni H100; es adecuado para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o inferencia en CPU.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU con 4-6 GB de VRAM o mas.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` es la via documentada. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y es dudosa por el codigo personalizado y la ruta de conceptos con product quantization; se debe tratar como no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El unico comparador documentado en la informacion proporcionada es el propio backbone sin modificar, que actua como brazo de control token-matched del experimento:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tessera-1B-Nano | 382.718.400 | No disponible | apache-2.0 | safetensors + custom_code | Anade ruta de concepto causal, NCP y product quantization |
| SmolLM2-360M (backbone sin modificar) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | safetensors | Brazo de control del experimento token-matched; perdida NTP equivalente dentro del ruido |
| Otras alternativas de ~0,4 B | No disponible | No disponible | No disponible | No disponible | No se documenta ninguna comparacion con terceros en la informacion disponible |

No se han publicado en la informacion disponible comparaciones de este checkpoint contra Qwen, Llama, Gemma u otros modelos de tamano similar en benchmarks estandar, por lo que no procede establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Nomenclatura enganosa: el nombre "Tessera-1B-Nano" sugiere 1 B de parametros, pero el indice de safetensors declara 382.718.400 parametros reales.
- Modelo de investigacion, no de produccion: la propia model card lo describe como una replicacion compacta de ConceptLM y no como una replica del NCP-ArchPreview de 8,9 B, con omision de codificacion residual iterativa, conexiones residuales entre escalas y la receta de entrenamiento a gran escala.
- Sin ganancia demostrada en perdida de token: el resultado principal es de neutralidad frente al backbone token-matched, no de mejora. El beneficio medido se limita a la utilidad causal del canal de concepto en las intervenciones.
- Sin benchmarks estandar publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, sesgo o toxicidad en la informacion disponible.
- Idiomas y contexto no documentados: al no declararse idiomas soportados ni longitud de contexto, no se puede asumir cobertura multilingue ni ventanas largas en produccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como modelo causal de 382,7 M de parametros, cabe esperar una tasa de error elevada en conocimiento factual, pero no hay mediciones publicadas.
- Sesgos conocidos: no documentados.
- Ejecucion de codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar los archivos de modelado antes de usarlo en entornos sensibles.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte, y no se documentan las condiciones del corpus de entrenamiento mas alla de los hashes del cache empaquetado en el repositorio ncp-smol.
- Adopcion nula: 0 descargas y 0 likes en el momento de los datos, sin comunidad ni mantenimiento verificable.
- Compatibilidad de despliegue limitada: no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, lo que complica el escalado en produccion.
- Cuantizacion: no se documentan formatos soportados; aplicar cuantizacion agresiva a la ruta de conceptos y al codebook podria alterar el comportamiento del canal NCP sin que existan evaluaciones publicadas al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yava-code/Tessera-1B-Nano
- Paper ConceptLM (referencia citada en la model card): https://arxiv.org/abs/2602.08984
- Paper NCP-ArchPreview (referencia citada en la model card): https://arxiv.org/abs/2609.10715
- Repositorio ncp-smol: referenciado en la model card (whitepaper en `docs/whitepaper.md`, resultados en `results/fineweb-edu/README.md`, hashes del corpus empaquetado y log del trainer), pero sin URL publica en la informacion disponible.
- Artefactos incluidos en el propio repositorio del modelo: `eval.json` y `metrics.jsonl`.
- Nota sobre la busqueda web: los resultados devueltos corresponden a un restaurante llamado Yava en Paris y no guardan relacion con el modelo; no se han encontrado otros enlaces relevantes en la busqueda web.
