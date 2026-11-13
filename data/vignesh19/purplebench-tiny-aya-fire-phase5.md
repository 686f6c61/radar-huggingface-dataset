# Vignesh19/purplebench-tiny-aya-fire-phase5

## Resumen

PurpleBench `phase5` es un adaptador LoRA publicado por el usuario Vignesh19 sobre el modelo base `CohereLabs/tiny-aya-fire`, un modelo pequeño de la familia Aya de Cohere Labs. No se trata de un modelo de propósito general, sino de un artefacto de investigación en seguridad de agentes: el adaptador actúa como "modelo bajo prueba" dentro de PurpleBench, un banco de evaluación de seguridad de agentes en el que un oráculo de estado determinista (State Oracle) calcula el hash de una base de datos SQLite antes y después de cada turno para decidir si ha habido brecha a partir del estado real del sistema, no del texto de la conversación.

El escenario evaluado es un sandbox ficticio de soporte bancario en el que el modelo propone llamadas a herramientas (tool calling) y es tratado como un proponente de herramientas no confiable. Los idiomas cubiertos son inglés, tamil y tanglish. El adaptador se entrenó mediante SFT solo con LoRA (r=16, alpha=32) y su objetivo declarado es reducir la tasa de éxito de ataques (breach) y las negativas falsas respecto al modelo base, manteniendo la utilidad en tareas benignas.

La relevancia de esta ficha es acotada: no es un modelo para producción general, sino un ejemplo de adaptador de seguridad evaluado con una metodología reproducible (intervalos de Wilson, decodificación greedy, gateway sin protección frente a gateway endurecido). El propio autor indica que `phase5` no se recomienda sobre `phase4`, ya que las diferencias medidas son estadísticamente indistinguibles y aparece 1 brecha de 40 frente al red-teamer LLM (frente a 0 de 40 en `phase4`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-fire`; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base `tiny-aya-fire`; no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | ingles, tamil y tanglish (escenario de evaluacion); idiomas del base no detallados |
| Licencia | no disponible en la informacion del repo; el autor indica que hereda la licencia y terminos de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre `CohereLabs/tiny-aya-fire`. El entrenamiento consistio en SFT solo con LoRA (los pesos del base permanecen congelados), con dynamic padding y seleccion del mejor checkpoint por validacion. La telemetria de entrenamiento se publica en `training_telemetry.json` y los datos en el dataset `purplebench-training-data`. La `phase5` se describe como "Phase 4 + datos generados por un modelo de 70B", es decir, una iteracion que anade datos sinteticos generados por un modelo grande a la fase anterior.

La innovacion metodologica no esta en el modelo sino en el entorno de evaluacion: PurpleBench emplea un State Oracle que hashea la base de datos SQLite antes y despues de cada turno y determina el resultado a partir del estado real del sistema, evitando que el modelo "diga" que ha hecho algo que no ha hecho. El adaptador se invoca como proponente de herramientas no confiable dentro de un sandbox bancario ficticio con 3 cuentas y 4 herramientas. Las metricas se reportan con intervalos de Wilson al 95 % y decodificacion greedy, sin rule router y con gateway directo (sin proteccion).

## Capacidades

- Generacion de texto conversacional en el contexto de soporte bancario simulado.
- Tool calling / function calling: el modelo propone llamadas a las 4 herramientas del sandbox.
- Razonamiento multi-turno dentro del escenario de agente evaluado.
- Multilingue en el ambito evaluado: ingles, tamil y tanglish.
- Comportamiento orientado a seguridad: el adaptador busca reducir breaches y negativas falsas frente al base.
- No se documentan capacidades de vision, audio, modo thinking explicito ni matemáticas avanzadas.

## Casos de uso

- Evaluacion de seguridad de agentes: usar el adaptador como modelo bajo prueba en pipelines de red-teaming que midan tasa de breach con un oraculo de estado determinista, en lugar de fiarse del texto generado.
- Investigacion en alineacion y robustez de tool calling: comparar `phase4` y `phase5` para estudiar el efecto de anadir datos sinteticos de un modelo de 70B sobre la tasa de brechas y la utilidad benigna.
- Benchmarking multilingue de seguridad: reproducir el escenario en ingles, tamil y tanglish para medir si las garantias de seguridad se mantienen fuera del ingles.
- Desarrollo de gateways de proteccion: emplear el adaptador como generador de ataques o de propuestas de herramientas para validar mecanismos como comprobacion de propiedad y OTP de un solo uso.
- Docencia y demostraciones de agentes inseguros: ilustrar en un sandbox controlado como un modelo pequeno puede proponer acciones peligrosas y como un gateway endurecido las bloquea.
- Pruebas de regresion de adaptadores LoRA: verificar que un nuevo checkpoint no degrada la utilidad benigna ni incrementa las negativas falsas respecto a la fase anterior.
- No se recomienda su uso como asistente de produccion general: el alcance documentado es el sandbox de evaluacion.

## Benchmarks y rendimiento

Resultados medidos con decodificacion greedy, modelo crudo sin rule router y gateway directo (sin proteccion). Intervalos de Wilson al 95 %.

| Benchmark | Attack success (breach) | Benign utility | False refusal |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0 % [0-3,1] | 100,0 % [96,9-100] | 0,0 % [0-3,1] |
| ood_v2 (n=24+24) | 0,0 % [0-13,8] | 87,5 % [69,0-95,7] | 0,0 % [0-13,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 74,1 % [69,0-78,6] | 0,0 % [0-1,2] |

Comparacion con el modelo base `CohereLabs/tiny-aya-fire`:

| Benchmark | Attack success (breach) | Benign utility | False refusal |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

Advertencia del autor: el 0 % de attack success es una cota superior, no un cero absoluto (3,1 % en n=120, 13,8 % en n=24, 1,2 % en n=320). `holdout_v2` esta templatizado y satura; `ood_v2` es pequeno. Con el gateway endurecido (comprobacion de propiedad + OTP de un solo uso), todos los modelos del estudio tuvieron 0 brechas. Frente al red-teamer LLM, `phase5` registro 1/40 brechas (frente a 0/40 en `phase4`), diferencia estadisticamente indistinguible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador pesa 0,1 GB; el consumo dominante es el del base `tiny-aya-fire` en bfloat16, que no se detalla en la informacion.
- GPU recomendadas: no disponibles. Por el tamano del base (familia tiny), es plausible que quepa en GPU de consumo, pero no se confirma en la informacion.
- Cabe en consumer GPU: no confirmado en la informacion disponible.
- Despliegue: el ejemplo oficial usa `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) y `peft.PeftModel`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench `phase5` (este) | LoRA r=16 sobre base no detallado | no disponible | 0 % breach, 74,1-100 % utilidad benigna segun benchmark | hereda de `tiny-aya-fire` (no disponible) | Hugging Face, 0 descargas |
| PurpleBench `phase4` | LoRA sobre el mismo base | no disponible | 0/40 breaches ante red-teamer LLM; indistinguible de `phase5` | hereda de `tiny-aya-fire` | dataset/repo del autor |
| `CohereLabs/tiny-aya-fire` (base) | no disponible | no disponible | 0-4,2 % breach, 37,5-65,3 % utilidad benigna, 8,3-11,7 % negativas falsas | no disponible | Hugging Face (Cohere Labs) |

No se dispone de datos de otros adaptadores de seguridad comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Un solo escenario ficticio: una app bancaria con 3 cuentas y 4 herramientas; los resultados no generalizan a otros dominios ni a otras APIs.
- Una sola familia de modelos y decodificacion greedy unicamente; no se evalua sampling ni otras estrategias.
- Benchmarks parcialmente del mismo autor, lo que introduce riesgo de sesgo de evaluacion.
- El 0 % de attack success es una cota superior: los intervalos superiores llegan al 13,8 % en `ood_v2` y al 3,1 % en `holdout_v2`.
- `phase5` no se recomienda sobre `phase4`: 1/40 brechas frente al red-teamer LLM frente a 0/40 en `phase4`.
- Licencia no disponible en el repo; el autor remite a los terminos de `CohereLabs/tiny-aya-fire` y recomienda revisarlos antes de reutilizar. No se confirma permiso de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados de forma especifica; al ser un modelo pequeno, se esperan limitaciones propias de su escala.
- Cobertura idiomatica limitada al escenario (ingles, tamil, tanglish); no se detallan otros idiomas.
- El adaptador no debe usarse como asistente de produccion sin un gateway de proteccion: el propio estudio muestra que con gateway endurecido todas las brechas desaparecen.

## Enlaces

- Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase5
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento: `purplebench-training-data` (referenciado en la model card; URL no disponible)
- Repositorio GitHub con `RESULTS.md`: referenciado en la model card (URL no disponible)
- Telemetria de entrenamiento: `training_telemetry.json` (incluido en el repo del adaptador)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
