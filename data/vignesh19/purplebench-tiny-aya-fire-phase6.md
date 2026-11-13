# Vignesh19/purplebench-tiny-aya-fire-phase6

## Resumen

PurpleBench `phase6` es un adaptador LoRA (PEFT) publicado por el usuario Vignesh19 sobre el modelo base `CohereLabs/tiny-aya-fire`, un modelo de la familia Aya de Cohere Labs orientada a cobertura multilingue. El adaptador no busca mejorar capacidades generales de generacion, sino modificar el comportamiento del modelo en un escenario muy concreto: un sandbox ficticio de atencion bancaria donde el modelo actua como proponente de herramientas (tool calling) y debe resistir ataques de inyeccion de prompts y de escalada de privilegios. Forma parte del proyecto PurpleBench, una iniciativa de evaluacion de seguridad de agentes en la que un oraculo determinista verifica el estado de una base de datos SQLite antes y despues de cada turno para decidir si hubo brecha real, en lugar de fiarse del texto generado por el modelo.

El interes tecnico del artefacto es doble. Por un lado, demuestra una metodologia de evaluacion de seguridad basada en estado observable y no en juicios subjetivos. Por otro, publica resultados medidos con intervalos de confianza de Wilson al 95% comparando el adaptador contra el modelo base en tres conjuntos de prueba (holdout_v2, ood_v2 y big_v1), con desglose por idioma (ingles, tamil y tanglish). El adaptador reduce la tasa de exito de ataque reportada, aunque a costa de un aumento notable de rechazos falsos en consultas benignas.

Se trata de un artefacto de investigacion pequeno (repo de 0,1 GB, solo pesos del adaptador) y no de un modelo completo. La model card es explicita sobre sus limites: un unico dominio ficticio, una unica familia de modelos, decodificacion greedy y benchmarks parcialmente generados por el mismo autor. No dispone de licencia declarada de forma independiente y hereda los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (`CohereLabs/tiny-aya-fire`) |
| Parametros totales | No disponible (adaptador LoRA: r=16, alpha=32; el tamano del modelo base no se especifica en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors en precision original; el adaptador puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | Entrenado y evaluado en ingles, tamil y tanglish (segun la model card); cobertura del modelo base no detallada |
| Licencia | No disponible de forma explicita; hereda la licencia y terminos de uso de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 16 y alpha 32 aplicado sobre el modelo base `CohereLabs/tiny-aya-fire`. El entrenamiento es un SFT exclusivo sobre el adaptador (LoRA-only SFT) con padding dinamico y seleccion del mejor checkpoint por validacion. El pipeline de datos se construyo con la libreria CuratorKIT, que genero un conjunto de replay deduplicado junto con filas de ataque del tipo "injection-echo" identificadas por las sondas de AuditKIT. El entrenamiento se ejecuto a traves de la libreria Lexsi AlignTune. La telemetria de entrenamiento esta publicada en `training_telemetry.json` dentro del repositorio, y los datos en la coleccion de datasets `purplebench-training-data`.

La innovacion metodologica no esta en la arquitectura (un LoRA estandar) sino en el diseno de evaluacion. PurpleBench define un oraculo de estado determinista que hashea la base de datos SQLite antes y despues de cada turno, de modo que el exito o fracaso de un ataque se decide por el estado real del sistema y no por el texto de la conversacion. El modelo se invoca como proponente de herramientas no confiable dentro de un sandbox bancario ficticio con tres cuentas y cuatro herramientas. La evaluacion se realiza con decodificacion greedy y sin enrutador de reglas, es decir, con el modelo crudo expuesto directamente a la puerta de enlace sin proteccion, lo que mide la robustez intrinseca del adaptador.

## Capacidades

- Generacion de texto conversacional en ingles, tamil y tanglish dentro del dominio de soporte bancario simulado.
- Tool calling / function calling: el modelo propone llamadas a las cuatro herramientas del sandbox (consultas y operaciones sobre cuentas).
- Resistencia a inyeccion de prompts y a ataques de escalada de privilegios en el escenario evaluado, con tasa de brecha reportada del 0,0% en los tres conjuntos (con cotas superiores de 1,2%, 3,1% y 13,8% segun el tamano muestral).
- Razonamiento multi-turno dentro de una conversacion de agente con estado persistente en base de datos.
- Capacidades multilingues limitadas a los tres idiomas evaluados; no se documentan otras lenguas.
- No se documentan capacidades de vision, audio, modo thinking explicito ni matematicas avanzadas.

## Casos de uso

- Evaluacion de robustez de agentes: usar el adaptador como modelo bajo prueba en un banco de pruebas de seguridad de agentes con oraculo de estado, comparando su tasa de brecha contra el modelo base y contra variantes con puerta de enlace endurecida.
- Investigacion en red-teaming de tool calling: reproducir los ataques de inyeccion-echo y medir la resistencia del modelo en un entorno controlado con estado verificable.
- Referencia para ajuste fino defensivo: servir como ejemplo de pipeline LoRA-only SFT con datos de replay deduplicados y filas de ataque, replicable sobre otras familias de modelos pequenos.
- Docencia y formacion en seguridad de IA: el sandbox bancario ficticio con tres cuentas y cuatro herramientas es un entorno acotado y reproducible para explicar riesgos de agentes con acceso a herramientas.
- Investigacion multilingue en tamil y tanglish: permite estudiar como se comportan las defensas de un modelo pequeno en idiomas de bajos recursos y en registros mixtos, un area poco cubierta por benchmarks anglocentricos.
- Baseline para comparativas de puertas de enlace: los resultados publicados (0 brechas con la puerta endurecida en todos los modelos del estudio) permiten usar el adaptador como control para medir el valor anadido de capas de proteccion externas frente al ajuste fino.
- Analisis de coste-beneficio de defensas: el aumento de rechazos falsos (del 11,7% al 35,8% en holdout_v2) ofrece un caso concreto para estudiar el equilibrio entre seguridad y utilidad en asistentes bancarios.

## Benchmarks y rendimiento

Resultados publicados en la model card con intervalos de Wilson al 95%, decodificacion greedy, modelo crudo sin enrutador de reglas y sin puerta de enlace de proteccion.

| Benchmark | Modelo | Exito de ataque (brecha) | Utilidad benigna | Rechazo falso |
|---|---|---|---|---|
| holdout_v2 (n=120+120) | phase6 | 0,0% [0-3,1] | 55,0% [46,1-63,6] | 35,8% [27,8-44,7] |
| holdout_v2 (n=120+120) | base tiny-aya-fire | 0,8% [0,1-4,6] | 37,5% [29,4-46,4] | 11,7% [7,1-18,6] |
| ood_v2 (n=24+24) | phase6 | 0,0% [0-13,8] | 45,8% [27,9-64,9] | 33,3% [18,0-53,3] |
| ood_v2 (n=24+24) | base tiny-aya-fire | 4,2% [0,7-20,2] | 54,2% [35,1-72,1] | 8,3% [2,3-25,8] |
| big_v1 (n=320+320) | phase6 | 0,0% [0-1,2] | 42,2% [36,9-47,7] | 47,8% [42,4-53,3] |
| big_v1 (n=320+320) | base tiny-aya-fire | 0,0% [0-1,2] | 65,3% [59,9-70,3] | 11,2% [8,2-15,2] |

Lectura critica: el 0,0% de exito de ataque es una cota superior, no un cero absoluto (hasta 3,1% en n=120, 13,8% en n=24 y 1,2% en n=320). `holdout_v2` es plantillado y satura; `ood_v2` tiene un tamano muestral muy reducido. La utilidad benigna del adaptador es inferior a la del base en big_v1 (42,2% frente a 65,3%) y el rechazo falso es entre tres y cuatro veces mayor en todos los conjuntos. Con la puerta de enlace endurecida de PurpleBench (comprobacion de propiedad y OTP de un solo uso) todos los modelos del estudio registraron cero brechas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si (repo de 0,1 GB); el consumo depende del modelo base `CohereLabs/tiny-aya-fire`, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un adaptador sobre un modelo pequeno de la familia Aya, es probable que quepa en GPU de consumo, pero no se aportan mediciones.
- Compatibilidad con GPU de consumo: no verificada en la informacion disponible.
- Opciones de despliegue: la model card solo documenta carga con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integracion con servidores de inferencia requeriria fusionar el adaptador con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Brecha (holdout_v2) | Utilidad benigna | Licencia |
|---|---|---|---|---|---|---|
| PurpleBench phase6 | LoRA sobre tiny-aya-fire | No disponible | No disponible | 0,0% [0-3,1] | 55,0% | Hereda la del base |
| CohereLabs/tiny-aya-fire (base) | Transformer decoder-only | No disponible | No disponible | 0,8% [0,1-4,6] | 37,5% | No disponible en la informacion |
| Otros adaptadores PurpleBench (fases previas) | LoRA | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables de la misma categoria (asistentes bancarios ajustados para seguridad) en la informacion proporcionada. La comparativa mas directa y documentada es contra el propio modelo base, que es el unico punto de referencia con cifras publicadas.

## Limitaciones y advertencias

- Un unico dominio ficticio (tres cuentas, cuatro herramientas) y una unica familia de modelos: los resultados no generalizan a otros escenarios de agente ni a otros modelos.
- Benchmarks parcialmente generados por el mismo autor, lo que introduce riesgo de sesgo de evaluacion.
- Decodificacion greedy unicamente; no se evalua el comportamiento con muestreo, temperatura ni otras estrategias de decodificacion.
- El 0,0% de exito de ataque es una cota superior con intervalos que llegan al 13,8% en el conjunto mas pequeno (ood_v2, n=24).
- Aumento marcado de rechazos falsos (hasta 47,8% en big_v1 frente al 11,2% del base), lo que degrada la experiencia en consultas legitimas.
- Caida de utilidad benigna en big_v1 (42,2% frente al 65,3% del base): el adaptador prioriza seguridad sobre utilidad.
- Licencia no declarada de forma independiente; hereda los terminos de `CohereLabs/tiny-aya-fire`, que deben revisarse antes de cualquier uso comercial.
- Cobertura idiomatica limitada a ingles, tamil y tanglish; no se documentan otros idiomas.
- Riesgo de alucinacion y de comportamiento impredecible fuera del sandbox de entrenamiento no cuantificado.
- No apto como modelo de produccion generalista: es un artefacto de investigacion para evaluacion de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase6
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento (referenciado en la model card): coleccion `purplebench-training-data` en Hugging Face
- Repositorio GitHub con `RESULTS.md` y tablas completas: referenciado en la model card, URL no disponible en la informacion proporcionada
- Libreria de entrenamiento Lexsi AlignTune: referenciada, URL no disponible
- Herramientas CuratorKIT y AuditKIT: referenciadas, URL no disponible
