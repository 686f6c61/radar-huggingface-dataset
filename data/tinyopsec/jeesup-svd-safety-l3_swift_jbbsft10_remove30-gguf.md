# tinyopsec/Jeesup-svd-safety-l3_swift_jbbsft10_remove30-GGUF

## Resumen

`tinyopsec/Jeesup-svd-safety-l3_swift_jbbsft10_remove30-GGUF` es la version cuantizada en formato GGUF de un checkpoint derivado de Llama-3-8B-Instruct que ha sido comprimido mediante Swift-SVD hasta conservar el 70 % de sus parametros densos (se elimina un 30 %), con una recuperacion posterior basada en LoRA (etapa 2 de SVD-LLM). El resultado es un modelo denso de 8.030.261.248 parametros (~8,03 mil millones) que mantiene la arquitectura original de Llama 3 pero con matrices de peso reducidas en rango.

El modelo lo publica el usuario `tinyopsec` a partir del checkpoint de `Jeesup`, y su interes no es tanto el rendimiento como el objeto de estudio: forma parte de una rejilla experimental sobre el efecto de la compresion SVD en las propiedades de seguridad del modelo y sobre que reglas de seleccion de componentes permiten recuperar dichas propiedades tras la compresion. El propio autor advierte en la model card que varias ramas de la rejilla estan "deliberadamente degradadas en seguridad" y que el artefacto no es un asistente de proposito general.

La relevancia actual es metodologica: ofrece a desarrolladores e investigadores un punto de partida reproducible para medir como afecta la poda por SVD (30 % en este caso) al comportamiento del modelo, empaquetado ademas en 13 cuantizaciones GGUF (desde F16 hasta Q2_K) para poder ejecutarlo en hardware de consumo. Es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivada de Llama-3-8B-Instruct), comprimida con Swift-SVD |
| Parametros totales | 8.030.261.248 (~8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama-3-8B-Instruct declara 8.192 tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3 Community License (`license: llama3`) |
| Formato de pesos | GGUF (13 ficheros); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni componentes de estado recurrente. Sobre esa base se aplica Swift-SVD, una tecnica de compresion que descompone las matrices de peso y trunca sus valores singulares para reducir el rango efectivo; en este checkpoint se conserva el 70 % de los parametros densos originales (`remove30`). Posteriormente se realiza una recuperacion de la calidad mediante LoRA (etapa 2 del pipeline de SVD-LLM), que reajusta el modelo comprimido para mitigar la perdida de capacidad. El identificador `swift_jbbsft10` refleja la variante concreta dentro de la rejilla experimental del autor, no una etapa de entrenamiento documentada de forma independiente en la model card.

No se especifican en la informacion disponible el numero de tokens utilizados en la recuperacion LoRA, la composicion del dataset de ajuste, ni si hubo fases de RLHF o DPO adicionales sobre el checkpoint comprimido. El alineamiento heredado procede de Llama-3-8B-Instruct, pero la propia compresion puede alterarlo: el autor indica explicitamente que algunas ramas de la rejilla estan degradadas en seguridad a proposito. La innovacion tecnica destacable no es de inferencia (no hay decodificacion especulativa ni atencion lineal), sino de compresion: cuantificar el coste en seguridad de truncar el espectro singular y evaluar si una LoRA de recuperacion basta para restaurarlo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del formato instruct de Llama 3.
- Razonamiento y respuesta a instrucciones en el formato chat del modelo base (roles `system`/`user`/`assistant`).
- Generacion de codigo y matematicas a nivel de un 8B de la familia Llama 3, con la degradacion esperable por la compresion al 70 %.
- Capacidad multilingue: no declarada en la ficha; el modelo base Llama 3 cubre varios idiomas, pero no hay confirmacion para este checkpoint.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso en la model card.
- Sin capacidades de vision, audio ni modo "thinking" explicito.
- Ejecutable en cualquier runtime compatible con GGUF a traves de `llama-cli`, Ollama, LM Studio o koboldcpp.
- Utilizable como objeto de experimentacion controlada: permite comparar respuestas entre cuantizaciones (F16 vs Q4_K_M vs Q2_K) y entre niveles de compresion SVD.

## Casos de uso

- Investigacion sobre el compromiso compresion-seguridad: ejecutar el mismo conjunto de prompts de evaluacion sobre este checkpoint (30 % eliminado) y sobre las variantes `remove20` y `remove40` del mismo autor para aislar el efecto del ratio de truncado en las tasas de rechazo.
- Red teaming y evaluacion de robustez: al tratarse de una rama potencialmente degradada en seguridad, sirve como sujeto de pruebas en pipelines de clasificadores de contenido y guardrails, comparando la respuesta del modelo comprimido con la del Llama-3-8B-Instruct original.
- Estudio de cuantizacion GGUF: los 13 ficheros (F16 a Q2_K) permiten medir la degradacion acumulada de dos compresiones sucesivas, SVD y cuantizacion de bloques, sobre las mismas tareas con el mismo harness.
- Laboratorio local de inferencia: con Q4_K_M (~4,9 GB de pesos) se puede desplegar en una GPU de 8 GB o incluso en CPU con llama.cpp para experimentos offline sin coste de API.
- Docencia y divulgacion: ilustrar en un curso de sistemas de IA como se construye un checkpoint derivado (compresion + LoRA + cuantizacion) y como se documenta un artefacto de investigacion con sus advertencias.
- Validacion de pipelines de evaluacion internos: usar el modelo como caso de prueba conocido y de baja criticidad para verificar que el arnes de benchmarks, el logging de respuestas y las metricas de rechazo funcionan antes de aplicarlos a modelos en produccion.
- Pruebas de integracion de runtimes: verificar el comportamiento de llama.cpp, Ollama o koboldcpp con un checkpoint Llama 3 modificado, incluida la tokenizacion y el chat template heredados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de seguridad ni ninguna otra metrica, y el autor no enlaza a un informe tecnico con resultados numericos. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para F16: ~16,1 GB solo de pesos; con cache KV y overhead conviene reservar 18-20 GB. Encaja en RTX 4090 24 GB, A100 40 GB y H100.
- VRAM estimada para Q8_0: ~8,5 GB de pesos, ~10-11 GB en total. Adecuado para RTX 3090, 4080 o 4090.
- VRAM estimada para Q6_K / Q5_K_M: ~6,5 GB y ~5,5 GB de pesos respectivamente; ~8-9 GB en ejecucion, comodo en RTX 3060 12 GB y RTX 4060 Ti 16 GB.
- VRAM estimada para Q4_K_M (recomendada): ~4,9 GB de pesos; cabe en GPUs consumer de 8 GB (RTX 3060 Ti, 4060, 3070) y en 6 GB con contexto corto.
- VRAM estimada para Q3_K_M / Q2_K: ~4 GB y ~3 GB; ejecutables en GPUs de 4-6 GB y en CPU con RAM suficiente.
- Si cabe en consumer GPU: si, desde Q5_K_M hacia abajo en tarjetas de 8 GB o mas; F16 y Q8_0 quedan fuera de la mayoria de equipos domesticos.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, koboldcpp, llama-cpp-python. El soporte de GGUF en vLLM es experimental y el autor no lo documenta; TGI no esta contemplado en la ficha.
- Latencia y throughput: no disponibles (no hay mediciones publicadas; dependeran del backend, del ancho de banda de memoria y de la cuantizacion elegida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._remove30-GGUF`) | 8,03 B (70 % denso) | No disponible | Sin benchmarks publicados | Llama 3 | GGUF, 13 cuantizaciones, en HuggingFace |
| `Jeesup/svd-safety-l3_swift_remove20` | ~8 B (80 % denso) | No disponible | Sin benchmarks publicados | Llama 3 | Safetensors en HuggingFace y Featherless |
| `tinyopsec/Jeesup-svd-safety-l3_swift_remove20_swapgapiter_b010-GGUF` | ~8 B (80 % denso) | No disponible | Sin benchmarks publicados | Llama 3 | GGUF en HuggingFace |
| `meta-llama/Meta-Llama-3-8B-Instruct` (referencia) | 8,03 B (100 % denso) | 8.192 tokens | Ampliamente documentado por Meta (no reproducido aqui) | Llama 3 | Pesos oficiales y ecosistema amplio de cuantizaciones |

Las variantes de la rejilla (`remove20`, `remove30`, `remove40`, `remove50`) no son intercambiables en terminos de calidad: a mayor porcentaje de eliminacion, mayor compresion y, segun la premisa del estudio, mayor riesgo de degradacion funcional y de seguridad. Este checkpoint es el intermedio de la serie documentada en la busqueda.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que "no es un asistente de proposito general" y que varias ramas de la rejilla estan "deliberadamente degradadas en seguridad".
- Riesgo de seguridad elevado: no debe desplegarse en aplicaciones orientadas a usuarios finales sin una evaluacion de seguridad previa y guardrails externos.
- Ausencia total de evaluaciones: sin benchmarks de capacidad ni de seguridad, sin mediciones de tasa de rechazo y sin comparacion controlada contra el modelo base.
- Perdida de calidad por doble compresion: al truncado SVD del 30 % se suma la cuantizacion GGUF elegida; en Q2_K y Q3_K_S la degradacion puede ser notable y acumulativa.
- Riesgo de alucinacion: no cuantificado; en un modelo de 8B comprimido cabe esperar un aumento respecto al Llama-3-8B-Instruct original, especialmente en Q2_K.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en otros idiomas distintos del ingles, aunque el modelo base sea multilingue.
- Contexto no confirmado: la ficha no especifica la ventana efectiva tras la compresion; asumir 8.192 tokens sin verificar puede provocar fallos en prompts largos.
- Licencia Llama 3 Community License: permite uso comercial con condiciones (incluida la clausula de 700 millones de usuarios mensuales, requisitos de atribucion "Built with Meta Llama 3" y nomenclatura de los derivados). Cualquier redistribucion debe incorporar la licencia y el aviso de Meta.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion, lo que reduce la probabilidad de que los fallos esten documentados por terceros.
- Fechas de publicacion en la ficha (creado y actualizado el 2026-10-26) posteriores a la fecha habitual de referencia; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbsft10_remove30-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbsft10_remove30
- Variante relacionada (80 % denso): https://huggingface.co/Jeesup/svd-safety-l3_swift_remove20
- Variante relacionada en GGUF: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_remove20_swapgapiter_b010-GGUF
- Variante `remove30` con otro sufijo de la rejilla: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbsft1_remove30
- Ficha en Featherless (`remove20`): https://featherless.ai/models/Jeesup/svd-safety-l3_swift_remove20
- Ficha en Featherless (`remove40`): https://featherless.ai/models/Jeesup/svd-safety-l3_swift_remove40
- Ficha en Savrn (`remove50`): https://savrn.com/models/svd-safety-l3-remove50-swapgapiter-b010-r04
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Meta Llama 3: https://www.llama.com/llama3/license/
