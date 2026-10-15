# Uuuuuuniiiiiii/goldworm-coder

## Resumen

GoldWorm Coder es un bundle de modelo orientado a agentes de programación locales, publicado por el usuario Uuuuuuniiiiiii en HuggingFace bajo licencia MIT. Su componente central (el "cerebro") es un modelo de lenguaje a nivel de byte de tipo causal transformer con arquitectura de mezcla de expertos (MoE) de 4 expertos temáticos (stories, code, math, wiki). Según la model card, el cerebro base tiene 38M parámetros y alcanza ~113,6M de parámetros contando todos los expertos, con cada experto configurado a d512/L12.

El planteamiento del proyecto es inusual: en lugar de entrenar un modelo generativo grande, el autor construye un agente que usa el MoE para *rankear*, *enrutar* y *verificar*, delegando la generación de lenguaje natural a un modelo auxiliar (qwen2.5-0.5b-GGUF vía llama.cpp). El bundle incluye checkpoints, manifiestos con hashes, scripts de entrenamiento y un sistema de "gate" que valida cada promoción de modelo con umbrales congelados y registro auditable.

Es relevante ahora porque documenta, con números medidos y sin optimismo inflado, un enfoque de MoE a nivel de byte con enrutamiento por dominio verificable (100% de precisión de router en held-out), además de exponer explícitamente sus límites (0/5 en aritmética, ARC a nivel de azar). El repositorio ocupa 6,1 GB e incluye artefactos de sesiones v8 y v10, algunos rechazados por el propio gate del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal transformer a nivel de byte con mezcla de expertos (MoE) de 4 expertos tematicos |
| Parametros totales | 38M (cerebro base), ~113,6M contando los 4 expertos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona un candidato con contexto de 1024 tokens, rechazado por el gate) |
| Tipos de cuantizacion | no disponible para el MoE; el modelo auxiliar de salida usa GGUF (qwen2.5-0.5b-GGUF) |
| Idiomas soportados | no disponible (tokenizacion a nivel de byte; datos de entrenamiento en ingles para TinyStories mas code/math/wiki) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `moe.pt` y `experts/{stories,code,math,wiki}.pt`) |

## Arquitectura y entrenamiento

El cerebro es un transformer causal que opera a nivel de byte (sin tokenizador BPE), con una capa MoE de 4 expertos. Cada experto tiene dimension d512 y 12 capas. El enrutamiento es por dominio tematico con asignacion biyectiva tema→experto: la model card reporta una precision de router del 100% (4/4) en un conjunto held-out de cola y un pico medio de gate de 0,856. Segun las cifras del autor, la mezcla de los 4 expertos supera al mejor experto individual (BPC medio de cola 2,2385 del MoE frente a 2,2700 del mejor single; valor oracle de 1,0734 en stories).

El proceso de promocion de modelos esta mediado por `rsi/gate.py`, un sistema con umbrales congelados y registro con encadenamiento de hashes que valida determinismo, deriva (KL), identidad de router, colapso de entropia, canarios de contaminacion y guardas anti-Goodhart. Segun la model card, dos candidatos fuertes de la fase 5 fueron rechazados por el gate pese a mejorar la mayoria de ejes (el candidato de contexto 1024 regresaba en TS-val; el candidato orientado a codigo degradaba el pico del router). La sesion v8 (2026-10-09) anadio un quinto dominio (HTML) y un experto de eliminacion de ruido auto-verificable, pero el gate emitio veredicto REJECT por deriva KL de 0,370, problemas de enlace/pico del router y 4,1M de coincidencias de solapamiento en plantillas HTML, por lo que el campeon `moe.pt` quedo intacto y los artefactos se archivaron en `cand_v8/`.

## Capacidades

- Clasificacion de intencion: la model card reporta 10/10 aciertos exactos en categorias fix/test/chat/help/generate/inspect.
- Ranking de candidatos por BPC: el modelo puntua soluciones generadas de forma determinista y las ordena.
- Enrutamiento por dominio: asigna la consulta al experto tematico correspondiente con precision de router reportada del 100% en held-out.
- Verificacion por tests: en el flujo del agente, una correccion solo se acepta si un test pasa de rojo a verde en un worktree git desechable (2/2 verificados en la sesion reportada).
- Inspeccion y triaje: 4/4 en las pruebas de inspect/triage.
- Chat con capa de salida auxiliar: 5/5 en saludos, suma basica (2+2), multiplicacion (7×8), capitales y memoria de sesion; la generacion la realiza qwen2.5-0.5b-GGUF, no el cerebro.
- Remediacion: 5/5 en limpieza, reset, confirmacion y guardas 401.
- No dispone de tool calling ni function calling declarados de forma explicita.
- No dispone de capacidades de vision, audio ni thinking mode.
- Multilingue: no disponible; la tokenizacion es a nivel de byte pero no se declaran idiomas soportados.

## Casos de uso

- Agente de reparacion de codigo local: el modelo puede integrarse en un flujo que genera candidatos de parche, los rankea por BPC y acepta solo los que superan un test rojo→verde. Es adecuado porque el autor publica verificacion por tests (2/2) y el diseno obliga a la verificacion empirica antes de fusionar.
- Triaje de incidencias en pipelines de CI: el modelo clasifica entradas en fix/test/chat/help/generate/inspect (10/10 en las pruebas) y puede enrutar cada incidencia al experto tematico (code, math, wiki) correspondiente.
- Pre-filtrado de parches en revision de codigo: usar el MoE como ranking barato para descartar candidatos de baja calidad antes de invocar un modelo mayor, reduciendo coste en flujos de generacion masiva.
- Asistente de documentacion tecnica: combinado con una capa de salida como qwen2.5-0.5b-GGUF, puede mantener conversaciones multi-turno con memoria de sesion (5/5 en pruebas de chat) en despliegues locales sin GPU dedicada.
- Reparacion de HTML generado: el experto `html.pt` de la sesion v8 rebajo el BPC de validacion de 2,6567 a 0,4234 (64k pasos, 240 min), lo que lo hace util para limpiar o completar plantillas HTML sinteticas, con la advertencia de que el gate lo rechazo por contaminacion.
- Eliminacion de ruido en texto generado: el experto `proof.pt` (denoising x0) bajo el BPC de validacion de 2,3682 a 0,5732, util como paso de auto-verificacion de bytes generados (`selfprove.py`).
- Enrutador de consultas en un ensemble local: asignar peticiones al experto correcto (stories, code, math, wiki) antes de invocar modelos especializados externos, aprovechando la precision de router reportada.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| TinyStories val BPC | 0,8109 | `train_scaled.eval_bpc`, wins=128 |
| BPC medio de cola por tema (stories/code/math/wiki) | 2,2385 | `verify_moe.bpc` |
| Pico medio de gate | 0,856 (biyectivo) | `verify_moe.gate_dist` |
| Precision de router (held-out) | 4/4 (100%) | `expert_router` |
| ARC-AGI (3 juegos fijados) | 0/3 | seleccion divulgada; azar ≈ 1/16-17 |
| Aritmetica | 0/5 | model card |

Comparativa de habilidades agente (goldworm-hybrid vs qwen2.5:0.5b solo, mismos prompts):

| Habilidad | goldworm | qwen solo |
|---|---|---|
| classify | 10/10 | 4/10 |
| fix | 2/2 | 1/2 (flaky) |
| inspect | 4/4 | 3/4 |
| chat | 5/5 | 5/5 |

Artefactos v8 (todos rechazados por el gate, archivados en `cand_v8/`):

| Artefacto | Valor |
|---|---|
| `cand_v8/html.pt` | BPC val 2,6567 → 0,4234 (64k pasos / 240 min) |
| `cand_v8/proof.pt` | denoising x0, BPC val 2,3682 → 0,5732 |
| `cand_v8/cand_moe_v8.pt` | candidato 5 expertos, BPC balanceado 6,08 → 2,79 |
| Veredicto del gate | REJECT (deriva KL 0,370; 4,1M coincidencias de solapamiento HTML) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 113,6M parametros totales, el checkpoint en fp32 ocuparia aproximadamente 450 MB, en fp16 unos 227 MB, en int8 unos 114 MB y en int4 unos 57 MB. El repositorio completo ocupa 6,1 GB por los artefactos de las sesiones v8 y v10.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano; no se especifican modelos concretos en la informacion disponible. El modelo auxiliar de salida (qwen2.5-0.5b-GGUF) tambien cabe en consumer GPU y puede ejecutarse en CPU.
- Cabe en GPU consumer: si, dado el reducido numero de parametros, aunque la model card no detalla VRAM ni GPU probadas.
- Opciones de despliegue: carga mediante la ruta propia del proyecto `rsi/gate.load_moe("moe.pt", dev)` (PyTorch), con la advertencia explicita de no confiar en la configuracion embebida del checkpoint. La capa de salida conversacional usa llama.cpp con qwen2.5-0.5b-GGUF. El bundle Linux autocontenido se arranca con `start.sh`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldworm-coder | 38M (cerebro) / ~113,6M con expertos | no disponible | MoE byte-level, agente de ranking/verificacion | MIT | HuggingFace (Uuuuuuniiiiiii/goldworm-coder) |
| qwen2.5:0.5b | 0,5B | no disponible | Transformer denso, generacion de texto | Apache 2.0 (segun el modelo original) | Uso como capa de salida auxiliar en este proyecto |
| goldworm-v6 | no disponible | no disponible | byte-level-transformer, tiny-stories | MIT | HuggingFace (Uuuuuuniiiiiii/goldworm-v6) |

La comparacion directa con qwen2.5:0.5b en las habilidades del agente (mismos prompts) muestra ventaja de goldworm en clasificacion (10/10 frente a 4/10) e inspeccion (4/4 frente a 3/4), empate en chat (5/5) y ligera ventaja en fix (2/2 frente a 1/2 flaky). No hay modelos comparables adicionales de tamano similar con MoE byte-level documentados en la informacion disponible.

## Limitaciones y advertencias

- Aritmetica: la model card reporta 0/5 en pruebas aritmeticas. No debe usarse para calculo.
- ARC-AGI: 0/3 en los tres juegos fijados, nivel de azar. No apto para tareas de razonamiento abstracto visual.
- Generacion libre: el autor reconoce que el modelo es "confident-but-wrong" en generacion de texto libre. El producto funciona porque nunca le pide *escribir*, solo *rankear*, *enrutar* y *verificar*.
- Contexto limitado: no se declara la longitud de contexto del campeon; el candidato de 1024 tokens fue rechazado por el gate, lo que sugiere ventanas cortas.
- Dependencia de modelo auxiliar: el chat depende de qwen2.5-0.5b-GGUF como capa de salida; el MoE por si solo no genera lenguaje natural de calidad.
- Configuracion obsoleta en checkpoint: la model card advierte explicitamente de que la configuracion embebida en `moe.pt` esta desactualizada y debe cargarse mediante la ruta del proyecto, no directamente.
- Artefactos rechazados: los archivos de `cand_v8/` y `v10/` no han pasado el gate de promocion; usarlos en produccion sin re-evaluacion conlleva riesgo de deriva y contaminacion (4,1M coincidencias de solapamiento HTML en el corpus v8).
- Corpus HTML sintetico: la model card reconoce que el corpus HTML de v8 era exclusivamente sintetico porque `the-stack-smol` esta restringido, lo que limita la generalizacion del experto HTML.
- Idiomas: no se declaran idiomas soportados; los datos de entrenamiento documentados son fundamentalmente en ingles (TinyStories) mas code/math/wiki.
- Ausencia de benchmarks estandar: no hay resultados publicados de MMLU, HumanEval ni GSM8K, lo que dificulta comparaciones objetivas con otros modelos de codigo.
- Licencia: MIT permite uso comercial, pero el modelo se distribuye sin garantias de rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Uuuuuuniiiiiii/goldworm-coder
- Modelo relacionado goldworm-v6: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Ficha de goldworm-v6 en free2aitools: https://free2aitools.com/model/uuuuuuniiiiiii/goldworm-v6
- Explicacion de loslos321-lab/goldworm: https://explaingit.com/loslos321-lab/goldworm
- Publicacion en LinkedIn sobre GoldWorm Lab y el Space de demostracion: https://www.linkedin.com/posts/john-haines-62504a35_goldworm-lab-goldworm-coder-demo-spotlight-vm-activity-7513573796138876928-k42B
- Space de demostracion Gold_Lab: no disponible como URL directa en la informacion proporcionada (se menciona como "Gold_Lab Space" en la model card)
