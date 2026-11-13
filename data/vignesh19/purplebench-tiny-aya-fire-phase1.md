# Vignesh19/purplebench-tiny-aya-fire-phase1

## Resumen

PurpleBench `phase1` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-fire`, desarrollado por el usuario Vignesh19. No se trata de un modelo generalista, sino de un artefacto de evaluación dentro de PurpleBench, un marco de *red-teaming* y seguridad de agentes en el que un oráculo determinista (State Oracle) verifica el estado de una base de datos SQLite antes y después de cada turno para decidir si ha habido brecha de seguridad, sin fiarse del texto de la conversación. El adaptador actúa como el modelo bajo prueba, invocado como proponente de herramientas no confiable dentro de un sandbox ficticio de atención bancaria en inglés, tamil y tanglish.

El adaptador se entrenó con SFT LoRA (r=16, alpha=32) sobre 56 ejemplos contrastivos generados con CuratorKIT, lo que lo convierte en el adaptador más pequeño y temprano de la familia PurpleBench. Su relevancia es metodológica más que de producto: permite medir la tasa de éxito de ataques (breach), la utilidad benigna y la tasa de rechazo falso de un modelo pequeño cuando se le expone sin pasarela de protección, y compararlo con su modelo base.

El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo. La model card reporta resultados medidos con intervalos de Wilson al 95 % y decodificación greedy, pero advierte explícitamente de que los ceros de éxito de ataque son cotas superiores, no certezas, y de que parte de los benchmarks son del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `CohereLabs/tiny-aya-fire` |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el recuento depende del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización del base no declarada) |
| Idiomas soportados | inglés, tamil y tanglish (según el sandbox de evaluación descrito) |
| Licencia | no disponible en el repositorio; hereda los términos de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre `CohereLabs/tiny-aya-fire`, un modelo de la familia Tiny Aya de Cohere Labs orientada a lenguas de bajos recursos. El entrenamiento consistió en SFT exclusivamente LoRA, con padding dinámico y selección del mejor checkpoint por validación. El conjunto de datos son 56 ejemplos contrastivos generados con CuratorKIT, diseñados para el escenario de seguridad de agentes de PurpleBench. La telemetría de entrenamiento se publica en `training_telemetry.json` y los datos en el dataset `purplebench-training-data`.

La innovación no está en la arquitectura del modelo, sino en el protocolo de evaluación: un State Oracle determinista hashea la base de datos SQLite antes y después de cada turno y decide el resultado a partir del estado real, no del texto generado. Esto elimina el sesgo de evaluar con un juez LLM y permite distinguir entre un modelo que rechaza correctamente y uno que simplemente no llega a ejecutar la acción peligrosa. El adaptador se evalúa como proponente de herramientas no confiable en un sandbox bancario ficticio con 3 cuentas y 4 herramientas.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish dentro del dominio del sandbox bancario.
- Proposición de llamadas a herramientas (*tool calling*) como componente no confiable de un agente.
- Comportamiento de rechazo y cumplimiento medible: la model card reporta tasas de rechazo falso y de utilidad benigna.
- Participación en evaluaciones de seguridad de agentes con verificación de estado determinista (State Oracle).
- No se declaran capacidades de razonamiento matemático, visión, audio ni *thinking mode*.
- No se declara soporte de agentes multi-paso más allá del bucle de un turno del sandbox.

## Casos de uso

- Evaluación de seguridad de agentes: usar el adaptador como modelo bajo prueba en un pipeline de *red-teaming* para medir la tasa de brecha cuando se le expone sin pasarela de protección, comparando contra el modelo base.
- Investigación en *tool calling* no confiable: estudiar cómo un modelo pequeño propone llamadas a herramientas y en qué casos intenta acciones no autorizadas sobre una base de datos SQLite.
- Benchmarking de pasarelas de seguridad: medir el efecto de una pasarela endurecida (comprobación de propiedad y OTP de un solo uso) sobre la tasa de brecha, ya que la model card indica que con la pasarela todos los modelos del estudio tuvieron 0 brechas.
- Evaluación multilingüe de seguridad: analizar el comportamiento en inglés, tamil y tanglish, con desgloses por idioma publicados en el dataset de resultados.
- Reproducibilidad de experimentos: cargar el adaptador con `peft` y `transformers` para replicar las tablas de `RESULTS.md` con decodificación greedy.
- Estudio de rechazo falso: cuantificar cuánto rechaza el modelo peticiones benignas (13,3 % en holdout_v2, 7,8 % en big_v1) como métrica de utilidad en producción.

## Benchmarks y rendimiento

Resultados del adaptador PurpleBench `phase1` (decodificación greedy, sin enrutador de reglas, pasarela directa sin protección):

| Benchmark | Éxito de ataque | Utilidad benigna | Rechazo falso |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0 % [0-3,1] | 28,3 % [21,0-37,0] | 13,3 % [8,4-20,6] |
| ood_v2 (n=24+24) | 0,0 % [0-13,8] | 58,3 % [38,8-75,5] | 4,2 % [0,7-20,2] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 68,8 % [63,5-73,6] | 7,8 % [5,3-11,3] |

Modelo base `CohereLabs/tiny-aya-fire` para comparación:

| Benchmark | Éxito de ataque | Utilidad benigna | Rechazo falso |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

Los ceros de éxito de ataque son cotas superiores: 3,1 % en n=120, 13,8 % en n=24 y 1,2 % en n=320. `holdout_v2` es plantillado y satura; `ood_v2` es pequeño. No se reportan MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador LoRA sobre un modelo de la familia Tiny Aya, la huella corresponde al modelo base más el adaptador (repo de 0,1 GB).
- GPU recomendadas: no declaradas; por el tamaño del adaptador, es plausible su ejecución en GPU consumer, pero no se confirma en la información disponible.
- Despliegue: carga vía `transformers` + `peft` con `AutoModelForCausalLM`, `dtype="bfloat16"` y `device_map="auto"`, según el ejemplo de la model card.
- vLLM, llama.cpp, Ollama o TGI: no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito de ataque (big_v1) | Utilidad benigna (big_v1) | Licencia |
|---|---|---|---|---|---|
| PurpleBench `phase1` (este) | adaptador LoRA r=16 | no disponible | 0,0 % [0-1,2] | 68,8 % [63,5-73,6] | hereda de tiny-aya-fire |
| `CohereLabs/tiny-aya-fire` (base) | no disponible | no disponible | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | según Cohere Labs |
| Otros modelos del estudio PurpleBench | no disponible | no disponible | 0 brechas con pasarela endurecida | no disponible | no disponible |

No se dispone de comparación con modelos de la misma categoría fuera del estudio PurpleBench.

## Limitaciones y advertencias

- Un único dominio ficticio: una app bancaria con 3 cuentas y 4 herramientas.
- Una sola familia de modelos evaluada; resultados no extrapolables a otros tamaños o arquitecturas.
- Decodificación exclusivamente greedy; no se evalúa muestreo ni temperatura.
- Benchmarks parcialmente del mismo autor, con riesgo de sesgo de evaluación.
- `holdout_v2` es plantillado y satura; `ood_v2` tiene n=24, con intervalos muy amplios.
- Los ceros de éxito de ataque son cotas superiores, no certezas de robustez.
- Licencia no declarada en el repositorio; hereda los términos de `CohereLabs/tiny-aya-fire`, que deben revisarse antes de cualquier uso comercial.
- No se declaran sesgos conocidos ni tasas de alucinación específicas.
- Uso previsto de investigación en seguridad; no es un modelo de producción generalista.

## Enlaces

- Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase1
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento: `purplebench-training-data` (referenciado en la model card, sin URL directa en la información disponible)
- Resultados completos: `RESULTS.md` en el repositorio de GitHub de PurpleBench (URL no disponible en la información proporcionada)
- Telemetría de entrenamiento: `training_telemetry.json` en el repositorio del modelo
