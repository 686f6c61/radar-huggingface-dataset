# Vignesh19/purplebench-tiny-aya-fire-phase6b

## Resumen

PurpleBench `phase6b` es un adaptador LoRA (PEFT) sobre el modelo base `CohereLabs/tiny-aya-fire`, publicado por el usuario Vignesh19 en Hugging Face. No es un modelo de propósito general, sino un artefacto de evaluación dentro de PurpleBench, un banco de pruebas de seguridad para agentes en el que un "State Oracle" determinista calcula el hash de una base de datos SQLite antes y después de cada turno y decide el resultado a partir de la verdad de referencia, no del texto del chat. El adaptador actúa como el modelo bajo prueba, invocado como proponente de herramientas no confiable dentro de un sandbox ficticio de atención bancaria en inglés, tamil y tanglish.

El autor lo presenta explícitamente como un resultado negativo: un reentrenamiento con AlignTune (datos de la fase 6 más una réplica benigna deduplicada con CuratorKIT) que produce un 16,9 % de eco y una caída de utilidad. Lo publica por transparencia y no lo recomienda para uso real. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, no los del modelo base.

Por tanto, la ficha debe leerse como documentación de un experimento de seguridad y alineación, no como una ficha de modelo desplegable. La relevancia actual está en su metodología: evaluación de seguridad basada en estado verificable, intervalos de Wilson al 95 % y comparación directa contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base `CohereLabs/tiny-aya-fire` |
| Parametros totales | no disponible (adaptador LoRA con r=16, alpha=32; el repositorio pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles, tamil y tanglish (escenarios de evaluacion); lista oficial de idiomas no disponible |
| Licencia | no disponible en los metadatos; el autor indica que hereda la licencia y condiciones de uso de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre `CohereLabs/tiny-aya-fire`. El entrenamiento fue un SFT solo-LoRA con padding dinámico y selección del mejor checkpoint por validación. Los datos provienen de la fase 6 del pipeline de PurpleBench más una réplica benigna deduplicada con CuratorKIT; el conjunto se publica como `purplebench-training-data` y la telemetría del entrenamiento está en `training_telemetry.json`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

La innovación metodológica no está en el modelo sino en el entorno de evaluación: un State Oracle que hashea la base de datos SQLite antes y después de cada turno y determina si hubo brecha a partir del estado real, no de la respuesta textual del modelo. Esto evita depender de jueces LLM o de heurísticas sobre el texto. El autor reporta además que, detrás del gateway endurecido de PurpleBench (comprobación de propiedad más OTP de un solo uso), todos los modelos del estudio registraron 0 brechas, lo que sugiere que la protección de la pasarela domina sobre el comportamiento del modelo.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish dentro del sandbox de atención bancaria ficticio.
- Propuesta de llamadas a herramientas (tool calling) como proponente no confiable: el modelo emite llamadas a 4 herramientas sobre 3 cuentas ficticias.
- Participación en evaluación de seguridad de agentes: sus salidas se puntúan contra el State Oracle.
- No se documentan capacidades de razonamiento multi-paso, matemáticas, código, visión ni audio en la información disponible.
- No se documenta soporte de agentes autónomos más allá del rol de proponente de herramientas en el banco de pruebas.

## Casos de uso

- Investigación en seguridad de agentes: usar el adaptador como modelo bajo prueba en pipelines de red-teaming que verifiquen el estado de una base de datos antes y después de cada turno, replicando el diseño del State Oracle.
- Estudio de resultados negativos en alineación: comparar el adaptador con su modelo base para analizar cómo un SFT con datos de seguridad puede degradar la utilidad benigna (45,6 % frente a 65,3 % en `big_v1`) y aumentar el eco.
- Evaluación de pasarelas de protección: emplear el adaptador como cliente no confiable para medir si un gateway con comprobación de propiedad y OTP de un solo uso reduce las brechas a cero, como reporta el autor.
- Benchmarking multilingüe de seguridad: reproducir los desgloses por idioma (inglés, tamil, tanglish) en escenarios de soporte bancario ficticios para estudiar si el comportamiento de rechazo varía por lengua.
- Docencia y divulgación sobre evaluación de seguridad: ilustrar con datos concretos e intervalos de Wilson por qué un 0 % de éxito de ataque es una cota superior y no una garantía.
- Reproducibilidad de experimentos PEFT: cargar el adaptador con `peft` y `transformers` para auditar la telemetría de entrenamiento y el dataset asociado.

## Benchmarks y rendimiento

Resultados medidos por el autor con decodificación greedy, modelo crudo sin enrutador de reglas y gateway directo (sin protección). Intervalos de Wilson al 95 %.

| Benchmark | Variante | Exito de ataque | Utilidad benigna | Falso rechazo |
|---|---|---|---|---|
| holdout_v2 (n=120+120) | adaptador phase6b | 2,5 % [0,9-7,1] | 54,2 % [45,3-62,8] | 18,3 % [12,4-26,2] |
| ood_v2 (n=24+24) | adaptador phase6b | 0,0 % [0-13,8] | 70,8 % [50,8-85,1] | 16,7 % [6,7-35,9] |
| big_v1 (n=320+320) | adaptador phase6b | 0,0 % [0-1,2] | 45,6 % [40,3-51,1] | 35,3 % [30,3-40,7] |
| holdout_v2 (n=120+120) | base tiny-aya-fire | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | base tiny-aya-fire | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | base tiny-aya-fire | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

El autor advierte que el 0 % de éxito de ataque es una cota superior, no un cero real: 3,1 % sobre n=120, 13,8 % sobre n=24 y 1,2 % sobre n=320. `holdout_v2` está templado y satura; `ood_v2` es pequeño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador pesa 0,1 GB y se suma al modelo base, cuyo tamaño en parámetros no se documenta en la información proporcionada.
- GPU recomendadas: no disponibles; depende del modelo base `CohereLabs/tiny-aya-fire`.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño del modelo base.
- Opciones de despliegue: el autor documenta carga con `transformers` (`AutoModelForCausalLM` en bfloat16 con `device_map="auto"`) y `peft.PeftModel`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; la evaluación usó decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench phase6b (este) | LoRA r=16 sobre tiny-aya-fire | no disponible | Adaptador de seguridad para evaluación de agentes | hereda la de tiny-aya-fire (no verificada) | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-fire (base) | no disponible | no disponible | Modelo base multilingüe | no disponible | Hugging Face |
| Otros adaptadores PurpleBench (fases previas) | no disponible | no disponible | Variantes del mismo pipeline de alineación | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría fuera del propio estudio PurpleBench.

## Limitaciones y advertencias

- El autor califica el resultado como negativo y no recomienda su uso: 16,9 % de eco y caída de utilidad frente al modelo base.
- Un solo entorno ficticio (3 cuentas, 4 herramientas), una sola familia de modelos y solo decodificación greedy: validez externa muy limitada.
- Los benchmarks son en parte del mismo autor, lo que introduce riesgo de sesgo de evaluación.
- El 0 % de éxito de ataque es una cota superior con intervalos amplios; no debe citarse como ausencia de vulnerabilidad.
- `holdout_v2` está templado y satura; `ood_v2` tiene un tamaño muestral pequeño (n=24 por condición).
- El falso rechazo sube hasta el 35,3 % en `big_v1`, lo que degrada la experiencia en producción.
- Licencia no declarada en los metadatos; el autor remite a la licencia y condiciones de `CohereLabs/tiny-aya-fire`, que deben verificarse antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible.
- Cobertura lingüística limitada a los escenarios evaluados (inglés, tamil, tanglish); no hay lista oficial de idiomas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase6b
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento citado: `purplebench-training-data` (referenciado en la model card; URL no proporcionada)
- Repositorio GitHub con `RESULTS.md` (referenciado en la model card; URL no proporcionada)
- Colección de datasets de PurpleBench (referenciada en la model card; URL no proporcionada)
