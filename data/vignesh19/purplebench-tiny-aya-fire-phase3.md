# Vignesh19/purplebench-tiny-aya-fire-phase3

## Resumen

PurpleBench `phase3` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `CohereLabs/tiny-aya-fire`, desarrollado por el usuario Vignesh19 en el marco del proyecto PurpleBench, una evaluación de seguridad de agentes. El adaptador se concibe como el "modelo bajo prueba" que actúa como proponente de herramientas no confiable dentro de un sandbox ficticio de atención bancaria, en inglés, tamil y tanglish. Su propósito no es ser un modelo de propósito general, sino un artefacto de investigación para medir la resistencia a ataques de red-teaming y la utilidad benigna en un entorno controlado con un oráculo de estado determinista que verifica el resultado contra la base de datos SQLite.

El adaptador se entrenó con 1.040 ejemplos plantillados que cubren clases de ataque y benignas en los tres idiomas citados. Según la model card, satura el benchmark plantillado (holdout_v2) pero pierde utilidad fuera de distribución (ood_v2 y big_v1), lo que lo convierte en un caso de estudio sobre sobreajuste a plantillas y degradación de capacidades generales. El repositorio ocupa 0,1 GB y se distribuye en formato PEFT/safetensors, sin licencia declarada de forma explícita más allá de la herencia del modelo base.

La relevancia actual del artefacto es metodológica: ilustra cómo un adaptador pequeño puede reducir la tasa de éxito de ataque a costa de la utilidad, y cómo los resultados deben interpretarse con intervalos de confianza Wilson y con cautela sobre el tamaño muestral. No es un modelo para producción ni para uso comercial sin revisar los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `CohereLabs/tiny-aya-fire` |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite bfloat16 según el ejemplo de uso) |
| Idiomas soportados | inglés, tamil, tanglish (según datos de entrenamiento) |
| Licencia | no disponible explícitamente; hereda la de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre el modelo base `CohereLabs/tiny-aya-fire`, un transformer decoder-only de la familia Aya. El entrenamiento consistió en SFT exclusivo sobre LoRA (sin ajuste completo), con padding dinámico y selección del mejor checkpoint por validación. El conjunto de datos comprende 1.040 ejemplos plantillados con clases de ataque y benignas en inglés, tamil y tanglish, y la telemetría de entrenamiento se publica en `training_telemetry.json`. No se documentan fases de RLHF ni DPO, ni el número de tokens de entrenamiento más allá del recuento de ejemplos.

La innovación metodológica no está en la arquitectura sino en el protocolo de evaluación: un oráculo de estado determinista calcula un hash de la base de datos SQLite antes y después de cada turno y decide el resultado a partir de la verdad de referencia, no del texto del chat. El adaptador se invoca como proponente de herramientas no confiable dentro de un sandbox bancario ficticio con tres cuentas y cuatro herramientas. La decodificación es greedy y los resultados se reportan con intervalos de Wilson al 95%.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish dentro del dominio del sandbox bancario.
- Proposición de llamadas a herramientas (tool calling) en el rol de agente no confiable bajo prueba.
- Resistencia a ataques de red-teaming en el benchmark plantillado holdout_v2 (0,0% de éxito de ataque, intervalo [0-3,1]).
- Utilidad benigna alta en distribución plantillada (100,0% en holdout_v2).
- Reducción de falsos rechazos frente al base en holdout_v2 (0,0% frente a 11,7%).
- Capacidades generales de razonamiento, código o matemáticas: no evaluadas ni documentadas en la información disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación de seguridad de agentes: el adaptador se usa como modelo bajo prueba en PurpleBench para medir la tasa de brecha cuando un agente propone herramientas en un sandbox bancario; el oráculo de estado determina el resultado con verdad de referencia.
- Investigación sobre sobreajuste a plantillas: comparar el rendimiento en holdout_v2 (100% de utilidad) frente a ood_v2 (54,2%) y big_v1 (57,2%) permite estudiar la degradación fuera de distribución de un LoRA SFT pequeño.
- Estudio de falsos rechazos: su 0,0% de falsos rechazos en holdout_v2 frente al 11,7% del base lo hace útil para analizar el equilibrio entre seguridad y utilidad en asistentes multilingües.
- Red-teaming multilingüe: los datos en tamil y tanglish permiten probar ataques y respuestas en idiomas de bajos recursos dentro de un pipeline de evaluación reproducible.
- Reproducción de experimentos: al publicarse telemetría, datos y tablas de resultados, sirve para replicar el protocolo del oráculo de estado y validar metodologías de evaluación de agentes.
- Docencia y formación en seguridad de IA: como ejemplo compacto (0,1 GB) de adaptador PEFT con métricas e intervalos de confianza, es adecuado para talleres sobre evaluación de riesgos en agentes.
- Pruebas de gateway de protección: comparar el adaptador con y sin el gateway endurecido (comprobación de propiedad y OTP de un solo uso) ilustra el efecto de las salvaguardas externas.

## Benchmarks y rendimiento

Resultados del adaptador (decodificación greedy, modelo crudo sin router de reglas, gateway directo sin protección):

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0% [0-3,1] | 100,0% [96,9-100] | 0,0% [0-3,1] |
| ood_v2 (n=24+24) | 0,0% [0-13,8] | 54,2% [35,1-72,1] | 0,0% [0-13,8] |
| big_v1 (n=320+320) | 0,0% [0-1,2] | 57,2% [51,7-62,5] | 1,9% [0,9-4,0] |

Modelo base `CohereLabs/tiny-aya-fire` para comparación:

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8% [0,1-4,6] | 37,5% [29,4-46,4] | 11,7% [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2% [0,7-20,2] | 54,2% [35,1-72,1] | 8,3% [2,3-25,8] |
| big_v1 (n=320+320) | 0,0% [0-1,2] | 65,3% [59,9-70,3] | 11,2% [8,2-15,2] |

Nota del autor: el 0% de éxito de ataque es una cota superior, no un cero absoluto (3,1% en n=120, 13,8% en n=24, 1,2% en n=320). holdout_v2 está plantillado y satura; ood_v2 es pequeño. Con el gateway endurecido, todos los modelos del estudio tuvieron 0 brechas.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base `tiny-aya-fire` no especifica su tamaño en la información disponible, por lo que la VRAM total depende del base (el ejemplo de uso emplea bfloat16 y `device_map="auto"`).
- GPU recomendadas: no disponibles para el base; el adaptador LoRA añade una sobrecarga mínima sobre el modelo base.
- Cabe en GPU de consumo: no confirmado; depende del tamaño del base, no documentado.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card). vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (holdout_v2: ataque / utilidad / falso rechazo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench tiny-aya-fire phase3 (este) | LoRA r=16 sobre base no especificado | no disponible | 0,0% / 100,0% / 0,0% | hereda del base | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-fire (base) | no disponible | no disponible | 0,8% / 37,5% / 11,7% | no disponible | Hugging Face |
| Otros adaptadores de la familia Aya | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (adaptadores de seguridad de agentes) en la información proporcionada.

## Limitaciones y advertencias

- Un solo dominio: una aplicación ficticia con tres cuentas y cuatro herramientas; la generalización a otros entornos no está validada.
- Una sola familia de modelos: los resultados no se extrapolan a otras arquitecturas.
- Decodificación greedy únicamente; no se evalúan muestreo ni otras estrategias.
- Benchmarks parcialmente del mismo autor, con riesgo de sesgo de diseño.
- holdout_v2 está plantillado y satura; ood_v2 tiene n=24, con intervalos amplios (hasta 13,8% de éxito de ataque).
- Pérdida de utilidad fuera de distribución: 54,2% en ood_v2 y 57,2% en big_v1 frente al 100% en holdout_v2.
- Riesgo de alucinación y sesgos: no documentados específicamente; el adaptador hereda los del modelo base.
- Licencia: no declarada de forma explícita; hereda los términos de `CohereLabs/tiny-aya-fire`, que deben revisarse antes de cualquier uso comercial.
- No apto para producción como asistente general: su propósito es la evaluación de seguridad en un sandbox controlado.
- El 0% de éxito de ataque no debe citarse como garantía de seguridad; es una cota superior con intervalos de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase3
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento (`purplebench-training-data`): no disponible como enlace directo en la información proporcionada
- Repositorio GitHub con `RESULTS.md`: no disponible como enlace directo en la información proporcionada
- Telemetría de entrenamiento (`training_telemetry.json`): incluida en el repositorio de Hugging Face
