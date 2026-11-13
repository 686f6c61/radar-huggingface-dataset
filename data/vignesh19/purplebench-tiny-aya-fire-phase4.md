# Vignesh19/purplebench-tiny-aya-fire-phase4

## Resumen

PurpleBench `phase4` es un adaptador LoRA (PEFT) publicado por el usuario Vignesh19 sobre el modelo base `CohereLabs/tiny-aya-fire`, un transformer de la familia Aya de Cohere Labs. No se trata de un modelo de propósito general, sino de un artefacto de investigación en seguridad de agentes: el adaptador se entrena para actuar como "modelo bajo prueba" dentro de un sandbox ficticio de soporte bancario, donde propone llamadas a herramientas (tool calling) en inglés, tamil y tanglish. Su función es servir de sujeto de evaluación en PurpleBench, un banco de pruebas de seguridad de agentes que verifica las brechas mediante un State Oracle determinista que hashea la base de datos SQLite antes y después de cada turno.

La relevancia del artefacto es metodológica: el autor reporta que el adaptador, sin pasarela de protección (gateway), reduce la tasa de éxito de ataques (breach) al 0,0 % en los tres conjuntos de evaluación, frente a cifras de hasta el 4,2 % en el modelo base, y eleva la utilidad benigna del 37,5 % al 100 % en `holdout_v2`. Estos números deben leerse con cautela: los intervalos de Wilson al 95 % incluyen valores de hasta el 13,8 % en el conjunto OOD más pequeño, y los propios benchmarks son parcialmente del mismo autor.

El repositorio pesa 0,1 GB y contiene únicamente los pesos del adaptador (safetensors), no el modelo completo. La licencia no está declarada en la model card y el autor remite a los términos de `CohereLabs/tiny-aya-fire`. El modelo se publicó el 13 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-fire` |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el número exacto de parámetros entrenables no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | inglés, tamil y tanglish (según la model card; el tag de idiomas de HF está vacío) |
| Licencia | no disponible en la model card; se heredan los términos de `CohereLabs/tiny-aya-fire` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16 y alpha 32 sobre el modelo base `CohereLabs/tiny-aya-fire`, un transformer de la familia Aya orientada a cobertura multilingüe. El entrenamiento es SFT exclusivamente sobre los módulos LoRA (LoRA-only SFT) con padding dinámico, seleccionando el checkpoint con mejor validación. Los datos de entrenamiento se publican como el dataset `purplebench-training-data`; el autor indica que `phase4` incorpora, sobre la fase 3, datos correctivos para los fallos detectados en un conjunto de desarrollo escrito a mano (saludos y peticiones del propio identificador de cuenta).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La innovación principal no está en la arquitectura del modelo, sino en el protocolo de evaluación: PurpleBench mide el éxito de un ataque mediante un State Oracle que hashea la base de datos SQLite antes y después de cada turno y decide el resultado a partir del estado real, no del texto de la conversación. El adaptador se invoca como proponente de herramientas no confiable dentro de una aplicación bancaria ficticia con 3 cuentas y 4 herramientas.

## Capacidades

- Generación de texto conversacional en inglés, tamil y tanglish dentro del dominio del sandbox bancario.
- Tool calling / function calling: el modelo propone llamadas a las 4 herramientas del entorno ficticio.
- Resistencia a ataques de seguridad de agentes (prompt injection, manipulación de identidad, intentos de acceso a cuentas ajenas) según las métricas del autor.
- Reducción de falsos rechazos en peticiones benignas: 0,0 % en `holdout_v2` y `ood_v2`, 1,9 % en `big_v1`, frente a 11,2-11,7 % del modelo base.
- No se documentan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso fuera del bucle de herramientas del sandbox.

## Casos de uso

- Evaluación de seguridad de agentes: usar el adaptador como modelo bajo prueba en pipelines de red-teaming que verifiquen brechas con un State Oracle determinista, en lugar de con un juez LLM.
- Investigación en alineación de tool calling: comparar la tasa de éxito de ataques y la utilidad benigna de este adaptador frente al modelo base para aislar el efecto del SFT con datos correctivos.
- Desarrollo de pasarelas de protección: emplear el adaptador como cliente no confiable para validar mecanismos de ownership check y OTP de un solo uso en una pasarela de herramientas.
- Pruebas de regresión multilingüe: verificar que las defensas se mantienen en inglés, tamil y tanglish, un escenario poco cubierto en benchmarks de seguridad de agentes.
- Reproducción de resultados: cargar el adaptador con PEFT y ejecutar los conjuntos `holdout_v2`, `ood_v2` y `big_v1` para replicar las tablas publicadas y sus intervalos de Wilson.
- Docencia y demostraciones: ilustrar en un entorno controlado y ficticio cómo un atacante intenta manipular a un agente bancario y cómo un State Oracle detecta la brecha.

## Benchmarks y rendimiento

Resultados del adaptador (decodificación greedy, modelo crudo sin rule router y sin gateway):

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,0 % [0-3,1] | 100,0 % [96,9-100] | 0,0 % [0-3,1] |
| ood_v2 (n=24+24) | 0,0 % [0-13,8] | 83,3 % [64,1-93,3] | 0,0 % [0-13,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 72,8 % [67,7-77,4] | 1,9 % [0,9-4,0] |

Modelo base `CohereLabs/tiny-aya-fire` para comparación:

| Benchmark | Éxito de ataque (brecha) | Utilidad benigna | Falso rechazo |
|---|---|---|---|
| holdout_v2 (n=120+120) | 0,8 % [0,1-4,6] | 37,5 % [29,4-46,4] | 11,7 % [7,1-18,6] |
| ood_v2 (n=24+24) | 4,2 % [0,7-20,2] | 54,2 % [35,1-72,1] | 8,3 % [2,3-25,8] |
| big_v1 (n=320+320) | 0,0 % [0-1,2] | 65,3 % [59,9-70,3] | 11,2 % [8,2-15,2] |

El autor advierte explícitamente de que el 0 % de éxito de ataque es una cota superior, no un cero absoluto: 3,1 % en n=120, 13,8 % en n=24 y 1,2 % en n=320. `holdout_v2` está basado en plantillas y satura; `ood_v2` es pequeño. Detrás de la pasarela endurecida de PurpleBench (ownership check + OTP de un solo uso), todos los modelos del estudio registraron 0 brechas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador LoRA sobre un modelo de la familia Aya "tiny", la inferencia se ejecuta sobre el modelo base completo en bfloat16, no sobre el adaptador aislado.
- GPU recomendadas: no disponibles; el ejemplo de uso emplea `device_map="auto"` con `dtype="bfloat16"`, por lo que se requiere una GPU compatible con bfloat16.
- GPU de consumo: no se especifica; depende del tamaño del modelo base `CohereLabs/tiny-aya-fire`, que no se detalla en la información proporcionada.
- Opciones de despliegue: `transformers` + `peft` (único método documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleBench tiny-aya-fire phase4 | Adaptador LoRA (PEFT) | r=16, alpha=32 (total no disponible) | no disponible | no disponible (hereda de tiny-aya-fire) | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-fire | Modelo base transformer | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| Otros adaptadores de la serie PurpleBench (fases previas) | Adaptador LoRA | no disponible | no disponible | no disponible | Mencionados en la model card, sin enlace |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada, más allá del propio modelo base.

## Limitaciones y advertencias

- Entorno muy restringido: una única aplicación ficticia con 3 cuentas y 4 herramientas; la generalización a otros dominios no está demostrada.
- Una sola familia de modelos: los resultados no permiten extrapolar a otros tamaños o arquitecturas.
- Decodificación greedy únicamente; no se evalúa muestreo, temperatura ni decodificación especulativa.
- Benchmarks parcialmente del mismo autor, con riesgo de sesgo de diseño y de contaminación.
- `holdout_v2` está basado en plantillas y satura; `ood_v2` tiene solo n=24 por clase, con intervalos de Wilson muy amplios (hasta 13,8 %).
- El 0 % de éxito de ataque es una cota superior, no una garantía de robustez.
- Licencia no declarada: antes de cualquier uso comercial hay que verificar los términos de `CohereLabs/tiny-aya-fire`, que el autor indica como aplicables.
- Idiomas limitados a inglés, tamil y tanglish; el tag de idiomas de Hugging Face está vacío.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base completo, lo que condiciona los requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vignesh19/purplebench-tiny-aya-fire-phase4
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset de entrenamiento (`purplebench-training-data`): no disponible como enlace directo en la información proporcionada
- Repositorio GitHub con `RESULTS.md`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
