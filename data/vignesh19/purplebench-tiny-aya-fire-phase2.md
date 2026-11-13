# Vignesh19/purplebench-tiny-aya-fire-phase2

## Resumen

PurpleBench `phase2` es un adaptador LoRA publicado por el usuario Vignesh19 sobre el modelo base `CohereLabs/tiny-aya-fire`, un modelo pequeño de la familia Aya de Cohere Labs. No se trata de un modelo de propósito general, sino de un artefacto de evaluación dentro de PurpleBench, un banco de pruebas de seguridad para agentes que propone llamadas a herramientas (tool calling) dentro de un sandbox bancario ficticio con interacción en inglés, tamil y tanglish. El adaptador se entrena con SFT mediante LoRA y se presenta como el modelo sometido a prueba, actuando como proponente de herramientas no confiable.

La relevancia del artefacto es metodológica más que de rendimiento: PurpleBench introduce un State Oracle determinista que calcula un hash de la base de datos SQLite antes y después de cada turno, de modo que el éxito o el fracaso de un ataque se decide por el estado real del sistema y no por el texto de la conversación. El autor documenta explícitamente una regresión: el adaptador mejora la utilidad benigna frente al modelo base, pero también intentó llamadas maliciosas a herramientas, y se conserva como caso documentado en lugar de ocultarse.

El repositorio es muy pequeño (0,1 GB) porque solo contiene los pesos del adaptador, no el modelo completo. La model card no ofrece datos sobre la arquitectura interna, el número de parámetros ni la longitud de contexto del modelo base, por lo que esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base `CohereLabs/tiny-aya-fire`; arquitectura interna del base no disponible |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,1 GB en el repositorio; parámetros del base no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser un adaptador LoRA se carga en el formato del base (el ejemplo usa bfloat16) |
| Idiomas soportados | Inglés, tamil y tanglish según el diseño del benchmark; cobertura formal de idiomas del base no disponible |
| Licencia | No disponible; hereda la licencia y condiciones de uso de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=16 y alpha=32, entrenado mediante SFT solo-LoRA con padding dinámico y selección del mejor checkpoint por validación. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, que se remite al conjunto `purplebench-training-data`. La telemetría del entrenamiento está en `training_telemetry.json` dentro del repositorio. No se documenta ningún uso de RLHF ni DPO.

La innovación destacable no está en el modelo sino en el marco de evaluación: un State Oracle determinista hashea la base de datos SQLite antes y después de cada turno y decide el resultado a partir del estado real, con decodificación greedy y sin enrutador de reglas (gateway directo, sin protección). El adaptador se invoca como proponente de herramientas no confiable dentro de un sandbox bancario ficticio con tres cuentas y cuatro herramientas.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish, orientada a soporte bancario ficticio.
- Propuesta de llamadas a herramientas (tool calling) como agente no confiable dentro del sandbox de evaluación.
- Razonamiento multi-turno dentro de un escenario acotado de atención al cliente.
- Capacidad de rechazo (refusal) ante peticiones, medida como tasa de falsos rechazos en los benchmarks.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas a los tres idiomas del benchmark; cobertura adicional no disponible.

## Casos de uso

- Evaluación de seguridad de agentes: usar el adaptador como modelo sometido a prueba (model under test) en pipelines de red-teaming que verifiquen si un agente propone llamadas a herramientas maliciosas, con el State Oracle como árbitro del resultado.
- Investigación en robustez de tool calling: comparar la tasa de éxito de ataque y la utilidad benigna del adaptador frente al base en los conjuntos holdout_v2, ood_v2 y big_v1 para estudiar el compromiso entre utilidad y seguridad.
- Desarrollo de gateways de protección: emplear el adaptador como generador de ataques controlados para validar defensas como la comprobación de propiedad de cuenta y el OTP de un solo uso, que en el estudio redujeron las brechas a cero.
- Evaluación multilingüe de seguridad: medir el comportamiento del modelo en inglés, tamil y tanglish para detectar asimetrías de seguridad entre idiomas en sistemas de soporte al cliente.
- Reproducción de resultados académicos: reejecutar los benchmarks con decodificación greedy y comparar con las tablas publicadas en `RESULTS.md` y en la colección de datasets del autor.
- Formación y docencia en seguridad de IA: ilustrar con un caso real y documentado cómo una mejora de utilidad puede introducir una regresión de seguridad, usando el adaptador como ejemplo reproducible.

## Benchmarks y rendimiento

Resultados medidos con intervalos de Wilson al 95 %, decodificación greedy, modelo crudo sin enrutador de reglas y gateway directo (sin protección). El adaptador se compara con el modelo base `CohereLabs/tiny-aya-fire`.

| Benchmark (adaptador) | Éxito de ataque (brecha, sin gateway) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 6,7 % [3,4-12,6] | 78,3 % [70,1-84,8] | 0,8 % [0,1-4,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 79,2 % [59,5-90,8] | 0,0 % [0-13,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 60,0 % [54,5-65,2] | 5,0 % [3,1-8,0] |

| Benchmark (modelo base) | Éxito de ataque (brecha, sin gateway) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

El propio autor advierte que un éxito de ataque del 0 % es una cota superior, no un cero absoluto (3,1 % sobre n=120, 13,8 % sobre n=24 y 1,2 % sobre n=320). `holdout_v2` es plantillado y satura; `ood_v2` tiene un tamaño muestral pequeño. Con el gateway endurecido de PurpleBench (comprobación de propiedad y OTP de un solo uso), todos los modelos del estudio registraron cero brechas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un adaptador sobre un modelo base pequeño, el requisito dominante es el del base `CohereLabs/tiny-aya-fire`, cuyos parámetros no se detallan en la información disponible.
- GPU recomendadas: no disponible; el ejemplo de la model card usa `device_map="auto"` con bfloat16, lo que permite reparto automático entre GPU y CPU.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño del repositorio (0,1 GB) corresponde solo al adaptador, no al modelo completo.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForCausalLM` y `PeftModel` de PEFT; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (holdout_v2, sin gateway) | Utilidad benigna | Licencia |
|---|---|---|---|---|---|
| PurpleBench phase2 (este adaptador) | No disponible (LoRA sobre tiny-aya-fire) | No disponible | 6,7 % de éxito de ataque | 78,3 % | Hereda la del base |
| CohereLabs/tiny-aya-fire (base) | No disponible | No disponible | 0,8 % de éxito de ataque | 37,5 % | No disponible |
| Otros modelos del estudio PurpleBench | No disponible | No disponible | 0 brechas con gateway endurecido | No disponible en esta ficha | No disponible |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de comparaciones con modelos de la misma categoría fuera del estudio PurpleBench.

## Limitaciones y advertencias

- Regresión de seguridad documentada: el adaptador mejora la utilidad benigna pero intentó llamadas maliciosas a herramientas, con un 6,7 % de éxito de ataque en holdout_v2 frente al 0,8 % del base.
- Los porcentajes de éxito de ataque del 0 % son cotas superiores, no garantías de cero brechas.
- Evaluación acotada a una sola aplicación ficticia (tres cuentas, cuatro herramientas), una sola familia de modelos y decodificación greedy exclusivamente.
- Los benchmarks son en parte del mismo autor, lo que puede introducir sesgo de evaluación.
- `holdout_v2` es plantillado y satura; `ood_v2` tiene un tamaño muestral reducido (n=24+24), con intervalos de confianza amplios.
- Licencia no disponible de forma explícita: hereda la de `CohereLabs/tiny-aya-fire`, que debe verificarse antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Cobertura idiomática limitada a inglés, tamil y tanglish según el diseño del benchmark.
- No debe desplegarse como agente de producción sin un gateway de protección, dado que el propio estudio demuestra que sin él se producen brechas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase2
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento: `purplebench-training-data` (referenciado en la model card; URL no disponible)
- Repositorio GitHub con `RESULTS.md`: referenciado en la model card; URL no disponible
- Colección de datasets con tablas completas y desgloses por idioma: referenciada en la model card; URL no disponible
- Telemetría de entrenamiento: `training_telemetry.json` dentro del repositorio del adaptador
