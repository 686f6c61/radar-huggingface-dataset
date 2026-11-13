# Vignesh19/purplebench-tiny-aya-fire-phase4at2

## Resumen

PurpleBench `phase4at2` es un adaptador LoRA entrenado sobre el modelo base `CohereLabs/tiny-aya-fire`, desarrollado por el autor Vignesh19 en el marco del proyecto PurpleBench, una iniciativa de evaluación de seguridad de agentes. El adaptador está pensado para funcionar como modelo bajo prueba (untrusted tool-proposer) dentro de un sandbox ficticio de atención bancaria en inglés, tamil y tanglish, donde un oráculo determinista comprueba el estado de una base de datos SQLite antes y después de cada turno para decidir si hubo brecha de seguridad.

El propósito del adaptador es servir como sujeto de estudio en pruebas de red-teaming y evaluación de robustez frente a ataques de prompt injection y abuso de herramientas, no como modelo de propósito general. Según la propia model card del autor, se trata de un resultado negativo: el eco alcanza un 2,3 % y la utilidad queda por debajo de la fase anterior (Phase 4), por lo que no se recomienda su uso.

La relevancia de esta ficha es metodológica: documenta un artefacto de investigación en seguridad de agentes con métricas medidas mediante intervalos de confianza de Wilson al 95 %, y advierte explícitamente de que los valores de 0 % de éxito de ataque son cotas superiores y no ceros absolutos, dado el tamaño muestral limitado de algunos conjuntos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer `CohereLabs/tiny-aya-fire` |
| Parametros totales | no disponible (tamaño del repo: 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, tamil y tanglish (según la model card del adaptador); el modelo base declara cobertura multilingüe amplia, pero no se detalla |
| Licencia | no disponible (hereda la licencia y términos de uso de `CohereLabs/tiny-aya-fire`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16 y alpha 32, aplicado mediante SFT (supervised fine-tuning) solo LoRA con padding dinámico y selección del mejor checkpoint por validación. El entrenamiento se realizó en dos etapas ("AlignTune replica"): primero con el corpus de la fase 3 y después con un corpus correctivo que continúa el mismo adaptador LoRA, dando lugar a la fase `phase4at2`. La telemetría de entrenamiento está disponible en el archivo `training_telemetry.json` del repositorio, y los datos en el dataset `purplebench-training-data`.

El modelo base `CohereLabs/tiny-aya-fire` pertenece a la familia Tiny Aya de Cohere Labs, orientada a modelos compactos multilingües; no se dispone en la información proporcionada de detalles sobre su arquitectura interna, número de tokens de entrenamiento ni si se aplicaron RLHF o DPO. El adaptador no introduce innovaciones de decodificación ni mecanismos de atención alternativos; su interés técnico reside en el protocolo de evaluación con oráculo de estado y en la réplica de un pipeline de alineación en dos etapas.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish, orientada a diálogos de soporte bancario ficticio.
- Propuesta de llamadas a herramientas (tool calling) dentro de un sandbox con cuatro herramientas y tres cuentas de usuario.
- Participación en cadenas de razonamiento multi-paso como agente no confiable sometido a evaluación de seguridad.
- Resistencia medida frente a ataques de prompt injection y abuso de herramientas en el entorno PurpleBench (0 % de brechas observadas en las tres suites, con cotas superiores no nulas).
- Modo de evaluación determinista: las métricas se calculan con decodificación greedy y sin enrutador de reglas ni gateway de protección.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Evaluación de seguridad de agentes: el adaptador se usa como modelo bajo prueba en el sandbox PurpleBench, donde un oráculo de estado verifica la base de datos SQLite antes y después de cada turno para determinar si hubo brecha real, independientemente del texto generado. Es adecuado porque separa la decisión de seguridad del contenido del chat.
- Red-teaming de pipelines de tool calling: permite medir la tasa de éxito de ataques de prompt injection sobre un modelo que propone llamadas a herramientas en un entorno bancario ficticio, con intervalos de confianza de Wilson al 95 %.
- Investigación sobre alineación en dos etapas: sirve para estudiar el efecto de un corpus correctivo aplicado sobre un LoRA ya entrenado, comparando utilidad benigna y falsos rechazos frente al modelo base.
- Evaluación multilingüe de robustez: al cubrir inglés, tamil y tanglish, permite analizar si la resistencia a ataques se degrada en idiomas de menor representación, con desgloses por idioma en el dataset enlazado.
- Estudio de compromiso entre utilidad y seguridad: los datos muestran que el adaptador eleva la utilidad benigna (56,7 % en holdout_v2 frente a 37,5 % del base) a costa de disparar los falsos rechazos (39,2 % frente a 11,7 %), lo que lo convierte en un caso de estudio útil para calibrar políticas de rechazo.
- Reproducibilidad de resultados negativos: al publicar telemetría, datos de entrenamiento y `RESULTS.md`, el adaptador permite replicar un experimento fallido y documentar por qué no debe desplegarse, lo que es valioso para evitar repetir errores en proyectos de alineación.
- Pruebas de gateway de protección: aunque el adaptador se evalúa sin gateway, sirve como entrada para comparar el comportamiento con y sin defensas (verificación de propiedad y OTP de un solo uso), escenario en el que todos los modelos del estudio registraron 0 brechas.

## Benchmarks y rendimiento

Resultados medidos del adaptador (decodificación greedy, sin enrutador de reglas, gateway directo sin protección):

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0 % [0-3,1] | 56,7 % [47,7-65,2] | 39,2 % [30,9-48,1] |
| ood_v2 (n=24+24) | 0,0 % [0-13,8] | 75,0 % [55,1-88,0] | 20,8 % [9,2-40,5] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 46,6 % [41,2-52,0] | 47,2 % [41,8-52,7] |

Comparación con el modelo base `CohereLabs/tiny-aya-fire`:

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio del adaptador ocupa 0,1 GB, pero la inferencia requiere cargar el modelo base `CohereLabs/tiny-aya-fire` completo en bfloat16, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un modelo base de la familia "tiny", es probable que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base, que no se especifica.
- Opciones de despliegue: carga mediante `transformers` con `PeftModel.from_pretrained` sobre el modelo base, según el ejemplo de uso de la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (utilidad / falso rechazo, big_v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench phase4at2 (este adaptador) | no disponible (LoRA sobre tiny-aya-fire) | no disponible | 46,6 % / 47,2 % | no disponible (hereda la del base) | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-fire (base) | no disponible | no disponible | 65,3 % / 11,2 % | no disponible | Hugging Face |
| Otros adaptadores PurpleBench de fases previas | no disponible | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: eco del 2,3 % y utilidad por debajo de la fase 4; no se recomienda su uso.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, puede arrastrar sesgos de `CohereLabs/tiny-aya-fire`.
- Riesgo de alucinación: no cuantificado; el adaptador no incluye salvaguardas propias y se evalúa sin gateway de protección.
- Los 0 % de éxito de ataque son cotas superiores, no ceros absolutos: 3,1 % en n=120, 13,8 % en n=24 y 1,2 % en n=320.
- `holdout_v2` está templado y satura; `ood_v2` tiene un tamaño muestral pequeño (n=24+24), lo que limita la generalización.
- Alcance experimental reducido: una única aplicación ficticia (3 cuentas, 4 herramientas), una sola familia de modelos y decodificación greedy únicamente.
- Benchmarks parcialmente del mismo autor, sin validación externa independiente.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; el adaptador hereda la licencia y términos de uso de `CohereLabs/tiny-aya-fire`, que deben verificarse antes de cualquier reutilización.
- Para producción: no apto como modelo de servicio; su valor es exclusivamente como artefacto de investigación en seguridad de agentes.
- El adaptador está etiquetado con `region:us` y creado en noviembre de 2026, con 0 descargas y 0 likes, lo que indica ausencia de adopción o validación comunitaria.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase4at2
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento (`purplebench-training-data`): no disponible como URL directa en la información proporcionada
- Repositorio GitHub con `RESULTS.md`: no disponible como URL directa en la información proporcionada
- Telemetría de entrenamiento (`training_telemetry.json`): incluida en el repositorio del adaptador en Hugging Face
