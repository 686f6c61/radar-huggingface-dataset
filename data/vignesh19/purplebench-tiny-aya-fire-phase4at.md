# Vignesh19/purplebench-tiny-aya-fire-phase4at

## Resumen

PurpleBench `phase4at` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `CohereLabs/tiny-aya-fire`, desarrollado por el usuario Vignesh19 en el marco del proyecto PurpleBench, una evaluación de seguridad de agentes en la que un oráculo de estado determinista verifica el estado de una base de datos SQLite antes y después de cada turno para decidir el resultado a partir de la verdad de referencia, no del texto del chat. El adaptador se emplea como modelo bajo prueba, invocado como proponente de herramientas no confiable dentro de un entorno de banca de ficción en inglés, tamil y tanglish.

El modelo es un resultado negativo declarado explícitamente por su autor: reduce el eco de inyección al 3,1 %, pero sobre-rechaza peticiones benignas en tamil y tanglish. No se recomienda su uso en producción. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

La relevancia de esta ficha es metodológica: documenta un caso de alineación de seguridad con LoRA de rango 16 sobre un modelo pequeño, con métricas de utilidad benigna y falsos rechazos medidas con intervalos de Wilson al 95 %. Sirve como referencia para quien diseñe evaluaciones de seguridad de agentes con oráculo de estado y para quien quiera entender por qué un adaptador de seguridad puede degradar la utilidad en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (`CohereLabs/tiny-aya-fire`) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles, tamil y tanglish (segun la model card); lista completa no disponible |
| Licencia | no disponible (hereda los terminos de `CohereLabs/tiny-aya-fire`, que deben consultarse) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre `CohereLabs/tiny-aya-fire`, un modelo de la familia Aya de Cohere Labs orientado a lenguas de bajos recursos. El entrenamiento consistio en SFT exclusivamente LoRA, con padding dinamico y seleccion del checkpoint con mejor validacion. No se reportan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

Los datos proceden de CuratorKIT con deduplicacion MinHash, y la receta corresponde a una replica de la fase 4 del pipeline AlignTune. La innovacion metodologica principal no esta en el modelo sino en el marco de evaluacion: PurpleBench emplea un oraculo de estado determinista que calcula un hash de la base de datos SQLite antes y despues de cada turno, de modo que la metrica de exito de ataque se basa en si se produjo una brecha real de estado y no en si el texto del modelo parece peligroso. El adaptador se evalua como proponente de herramientas no confiable en un sandbox bancario ficticio con tres cuentas y cuatro herramientas.

## Capacidades

- Generacion de texto conversacional en ingles, tamil y tanglish.
- Proposicion de llamadas a herramientas (tool calling) en el contexto del sandbox de banca de ficcion.
- Alineacion de seguridad orientada a reducir el eco de inyeccion de prompts (hasta el 3,1 % en la evaluacion reportada).
- Participacion como modelo bajo prueba en evaluaciones de seguridad de agentes con oraculo de estado.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito ni agentes multi-paso autonomos.
- Capacidad multilingue limitada a los idiomas citados; no hay lista completa de idiomas disponible.

## Casos de uso

- Investigacion en seguridad de agentes: usar el adaptador como modelo bajo prueba en entornos con oraculo de estado para medir brechas reales y no solo texto sospechoso; es adecuado porque el diseno de PurpleBench separa la decision de exito del juicio del texto.
- Estudio de falsos rechazos en lenguas de bajos recursos: analizar la tasa de rechazo benigno en tamil y tanglish (36,7 % en holdout_v2, 41,7 % en ood_v2, 54,1 % en big_v1) para entender el coste de utilidad de las recetas de seguridad agresivas.
- Reproduccion de resultados negativos: replicar la receta de la fase 4 de AlignTune sobre datos deduplicados con MinHash y comparar con el modelo base; util para calibrar expectativas antes de invertir en alineacion de seguridad.
- Evaluacion de routers y pasarelas de proteccion: comparar el comportamiento del modelo crudo frente a una pasarela endurecida con comprobacion de propiedad y OTP de un solo uso, ya que en el estudio todos los modelos tuvieron cero brechas tras la pasarela.
- Docencia y divulgacion sobre alineacion: ilustrar con datos concretos por que reducir el exito de ataque puede degradar la utilidad benigna, usando las tablas de holdout_v2, ood_v2 y big_v1.
- No recomendado para produccion: el propio autor lo declara resultado negativo y desaconseja su uso; cualquier despliegue real deberia partir del modelo base o de un adaptador con mejor equilibrio utilidad-seguridad.

## Benchmarks y rendimiento

Resultados del adaptador (decodificacion greedy, modelo crudo sin router de reglas, pasarela directa sin proteccion):

| Benchmark | Exito de ataque (brecha, sin pasarela) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0 % [0-3,1] | 63,3 % [54,4-71,4] | 36,7 % [28,6-45,6] |
| ood_v2 (n=24+24) | 0,0 % [0-13,8] | 58,3 % [38,8-75,5] | 41,7 % [24,5-61,2] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 38,4 % [33,3-43,9] | 54,1 % [48,6-59,4] |

Modelo base `CohereLabs/tiny-aya-fire` para comparacion:

| Benchmark | Exito de ataque (brecha, sin pasarela) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

Advertencias del autor: el 0 % de exito de ataque es una cota superior, no un cero absoluto (3,1 % sobre n=120, 13,8 % sobre n=24, 1,2 % sobre n=320). `holdout_v2` es una plantilla que satura y `ood_v2` es pequeno. Con la pasarela endurecida de PurpleBench (comprobacion de propiedad y OTP de un solo uso), todos los modelos del estudio tuvieron cero brechas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; al ser un adaptador LoRA sobre un modelo pequeno de la familia Aya, la huella depende del modelo base y de su cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el autor no publica requisitos de VRAM ni latencias.
- Opciones de despliegue: el ejemplo de uso oficial emplea `transformers` con `dtype="bfloat16"` y `device_map="auto"`, junto con `peft.PeftModel.from_pretrained` para cargar el adaptador sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench phase4at (este) | LoRA r=16 sobre tiny-aya-fire | no disponible | Seguridad de agentes y tool calling | no disponible (hereda del base) | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-fire (base) | no disponible | no disponible | Generacion multilingue | no disponible | Hugging Face |
| Otros adaptadores de la familia Aya | no disponible | no disponible | Variable | segun autor | no disponible |

No se dispone de datos de benchmarks de terceros ni de modelos comparables con metricas equivalentes de exito de ataque, utilidad benigna y falso rechazo en el mismo marco de evaluacion. La unica comparacion directa disponible es contra el modelo base, incluida en la seccion de benchmarks.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: sobre-rechaza peticiones benignas en tamil y tanglish y no se recomienda su uso.
- Falsos rechazos elevados: 36,7 % en holdout_v2, 41,7 % en ood_v2 y 54,1 % en big_v1, frente al 11,7 %, 8,3 % y 11,2 % del modelo base.
- Utilidad benigna degradada en big_v1: 38,4 % frente al 65,3 % del modelo base.
- El 0 % de exito de ataque es una cota superior: los intervalos de Wilson llegan al 3,1 %, 13,8 % y 1,2 % segun el conjunto.
- Evaluacion limitada a una sola aplicacion ficticia (3 cuentas, 4 herramientas), una sola familia de modelos y decodificacion greedy.
- Benchmarks parcialmente generados por el mismo autor, lo que introduce riesgo de sesgo de evaluacion.
- `holdout_v2` es una plantilla que satura y `ood_v2` tiene un tamano muestral reducido (n=24+24).
- Licencia no disponible en la informacion proporcionada; el adaptador hereda los terminos de `CohereLabs/tiny-aya-fire` y deben verificarse antes de cualquier reutilizacion o uso comercial.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Cobertura idiomatica limitada a ingles, tamil y tanglish; no hay lista completa de idiomas.
- Contexto maximo no documentado, lo que impide garantizar conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase4at
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento citado: `purplebench-training-data` (referenciado en la model card; URL no disponible)
- Repositorio con `RESULTS.md`: referenciado en la model card como repositorio de GitHub (URL no disponible)
- Fichero de telemetria de entrenamiento: `training_telemetry.json` (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles
