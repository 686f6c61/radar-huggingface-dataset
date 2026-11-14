# umeraamir69/hifazat-tab-writeup

## Resumen

HifazatTab es un adaptador de ajuste fino (LoRA SFT) construido sobre el modelo base Cohere Tiny Aya Fire (`CohereLabs/tiny-aya-fire`), desarrollado por Muhammad Umer Aamir (`umeraamir69`) en el marco del hackathon Lexsi AI Safety & Alignment 2026, pista C (Agentic Fine-tuning). El modelo resuelve un problema muy concreto: dotar a un asistente de tienda multilingue de la capacidad de emitir llamadas a herramientas (tool calling) fiables y canonicas sobre un catalogo cerrado de productos de una tienda kiryana pakistani (mas de 200 SKU, precios en PKR), en ingles, hindi (devanagari) y urdu (nastaliq/arabe).

El modelo base Tiny Aya ya genera JSON de tool calling valido en el 98% de los casos en zero-shot, pero falla en el contenido (11% de exito de tarea) y en la seguridad (14% de precision de rechazo). El aporte de HifazatTab es un SFT con JSON dorado que ensena claves SKU canonicas con guion bajo (por ejemplo `atta_20kg`) y una accion explicita de rechazo, alcanzando 100% de validez de llamada, 97,9% de exito de tarea y 87,5% de precision de rechazo en una semilla multilingue ampliada.

Se trata de un artefacto de investigacion muy especifico: no es un modelo generalista, sino un adaptador que demuestra que el formato no equivale al contenido ni a la seguridad en agentes multilingues. Su relevancia actual radica en la metodologia (diagnostico de fallos de GRPO por recompensas mal disenadas) y en la publicacion abierta de adaptadores, semilla de evaluacion y demo, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Cohere Tiny Aya Fire) con adaptador LoRA SFT |
| Parametros totales | no disponible (depende del modelo base Tiny Aya Fire; no se especifica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Inferencia y entrenamiento en 4 bits (mencionado en la model card); otros formatos no disponibles |
| Idiomas soportados | Ingles, hindi (devanagari) y urdu (nastaliq/arabe); roman-urdu e hinglish aparecen en las pruebas de seguridad |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (el adaptador SFT se publica como repo separado `umeraamir69/hifazat-tab-sft-v1`); formato exacto de fichero no disponible |

## Arquitectura y entrenamiento

El modelo parte de Cohere Tiny Aya Fire, un transformer decoder-only multilingue de la familia Aya. Sobre el se aplica un ajuste fino supervisado (SFT) con LoRA usando JSON dorado sobre la semilla completa de entrenamiento, que incluye argumentos canonicos (claves SKU con guion bajo) y lineas de rechazo explicitas. La inferencia y el entrenamiento se realizan en 4 bits donde es necesario. Tiny Aya no dispone de plantilla nativa de herramientas, por lo que se usa un prompt de herramientas de respaldo que exige una unica linea JSON con el formato `[{"tool_name":"…","parameters":{"arg":"<CANONICAL>"}}]`, o bien `refuse`/`unsafe` para las sondas de seguridad.

Antes del SFT se probaron dos recetas de GRPO (AgentTune): una primera version con recompensa de coincidencia exacta (+1.0) mas +0.2 por cualquier JSON valido y β=0 (sin KL, por OOM con vocabulario de 256k), y una segunda version con recompensa mas estricta y sondas de fase 1 cada 50 pasos. Ambas fracasaron en mejorar las metricas posteriores: la recompensa por JSON valido eliminaba la presion para canonicalizar argumentos, y las generaciones usaban lenguaje natural (`"cheeni 5kg"`) en lugar de claves canonicas (`cheeni_5kg`). En GRPO v2 las puntuaciones de las sondas quedaron congeladas del paso 50 al 300 (~21% de tarea, 62,5% de rechazo) y la ejecucion se cancelo. La innovacion tecnica destacable es, por tanto, metodologica: demostrar que las recompensas basadas solo en validez de esquema producen modelos que "parecen entrenados" sin mejorar el contenido, y que un SFT compacto con JSON dorado resuelve el problema.

## Capacidades

- Generacion de llamadas a herramientas en formato JSON estricto sobre un contrato cerrado de tres herramientas: `lookup_price(item)`, `check_stock(item)` y `loan_eligibility(income)`.
- Resolucion de alias multilingues (ingles, hindi y urdu) a claves SKU canonicas mediante coincidencia de alias mas largo.
- Respuesta a preguntas de precio, stock y combinaciones de ambas contra un catalogo cerrado de 219 SKU con precios en PKR.
- Devolucion de niveles de elegibilidad para prestamos (nunca aprobacion) a partir de un ingreso declarado.
- Rechazo explicito (`refuse`) y marcado de peticiones inseguras (`unsafe`) ante sondas de seguridad, incluidas preguntas de marca no cubiertas por el catalogo.
- Resistencia a ataques de cambio de escritura (script-switch), un fallo tipico de los LLM multilingues que obedecen la misma peticion en una escritura y la rechazan en otra.
- No se documentan capacidades de vision, audio, razonamiento multi-paso abierto ni generacion de codigo general; el alcance es el de un agente de tienda cerrado.

## Casos de uso

- Asistente de voz para tienda kiryana: el modelo responde consultas de precio y stock en ingles, hindi y urdu emitiendo llamadas canonicas a `lookup_price` y `check_stock`, lo que permite integrarlo en un flujo de voz sin que invente precios ni SKU.
- Atencion al cliente en mostrador con catalogo cerrado: al mapear alias multilingues a claves SKU exactas, el tendero puede preguntar en cualquiera de las tres escrituras y obtener siempre el mismo resultado verificable.
- Evaluacion de elegibilidad de microcredito: la herramienta `loan_eligibility` devuelve solo niveles de elegibilidad a partir del ingreso, evitando que el modelo apruebe prestamos por su cuenta, un requisito critico en entornos financieros informales.
- Moderacion y seguridad de agentes multilingues: las sondas de seguridad y la accion `refuse` permiten usar el adaptador como banco de pruebas para medir precision de rechazo ante jailbreaks en distintas escrituras.
- Investigacion en ajuste fino de agentes: el par de adaptadores (SFT y recetas GRPO documentadas) sirve como caso de estudio reproducible de por que las recompensas por validez de esquema no bastan y como el JSON dorado corrige la canonicalizacion.
- Demo de voz para evaluacion de hackathon: el autor publica una demo en vivo con un agente determinista de reglas sobre el mismo catalogo, pensada para jueces sin latencia de GPU, replicando el mismo contrato de herramientas.
- Benchmark de tool calling multilingue: la semilla de 801 tareas de herramienta y 24 sondas de seguridad permite comparar modelos base frente a adaptadores en validez, exito de tarea y rechazo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la semilla ampliada (801 tareas de herramienta y 24 sondas de seguridad en el momento de la evaluacion; catalogo ampliado despues a 219 SKU):

| Metrica | BEFORE (Tiny Aya zero-shot) | GRPO v1 AFTER | SFT AFTER | Objetivo |
|---|---:|---:|---:|---:|
| Validez de llamada | 98% (150/153) | 95% (146/153) | 100% (801/801) | ≥85% |
| Exito de tarea | 11% (17/153) | 10% (16/153) | 97,9% (784/801) | ≥75% |
| Precision de rechazo | 14% (3/21) | 19% (4/21) | 87,5% (segun abstract) | no disponible |

Nota: las cifras de BEFORE y GRPO v1 corresponden a la semilla inicial de 153 tareas y 21 sondas; las de SFT a la semilla ampliada, por lo que la comparacion directa entre columnas debe tomarse con cautela. En GRPO v2 las sondas de fase 1 quedaron congeladas del paso 50 al 300 (~21% de tarea, 62,5% de rechazo) y la ejecucion se cancelo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base se ejecuta en 4 bits, lo que sugiere un consumo bajo, pero la model card no publica cifras de VRAM ni tamano del modelo base.
- GPU recomendadas: no disponibles. El entrenamiento GRPO se realizo en "GPUs de pago" sin especificar modelo; el SFT LoRA es comparativamente ligero.
- Compatibilidad con GPU de consumo: probable dado el uso de cuantizacion 4 bits y el caracter compacto del modelo base, pero no confirmado en la informacion proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La demo publica usa un agente determinista de reglas sobre el mismo catalogo para evitar la latencia de GPU, no el adaptador LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HifazatTab (SFT LoRA sobre Tiny Aya Fire) | no disponible | no disponible | Tool calling cerrado multilingue (en/hi/ur) con rechazo | Apache 2.0 | Adaptador en Hugging Face, demo en Vercel |
| Tiny Aya Fire (base, `CohereLabs/tiny-aya-fire`) | no disponible | no disponible | LLM multilingue generalista | no disponible en esta ficha | Hugging Face |
| GRPO v1/v2 sobre Tiny Aya (mismo autor) | no disponible | no disponible | Tool calling con RL | Apache 2.0 (adaptador SFT) | Documentado, sin metricas AFTER superiores |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada; la comparativa se limita al modelo base y a las recetas del propio autor.

## Limitaciones y advertencias

- El alcance es deliberadamente estrecho: un catalogo cerrado de tienda kiryana con tres herramientas; no es un modelo generalista y no debe usarse fuera de ese contrato.
- Riesgo de alucinacion de SKU y precios fuera del catalogo: el diseno mitiga esto con claves canonicas y rechazo, pero el modelo base ya mostraba invencion de herramientas (`write_document`, `system_prompt`) en zero-shot.
- El exito de tarea del 97,9% se mide sobre la semilla de evaluacion del autor (801 tareas); no hay validacion externa ni conjunto de test independiente publicado.
- La comparacion BEFORE/AFTER mezcla tamanos de semilla distintos (153 frente a 801 tareas), lo que puede inflar la mejora aparente.
- La precision de rechazo del 87,5% aparece en el abstract pero no se detalla el recuento exacto en la tabla de resultados de la model card.
- El rendimiento en idiomas distintos del ingles, hindi y urdu no esta documentado; los tags de Hugging Face no declaran idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Tiny Aya Fire tiene su propia licencia, que debe verificarse por separado antes de desplegar en produccion.
- La demo publica no usa el adaptador LoRA, sino un agente determinista de reglas; la latencia real del adaptador en produccion no esta medida.
- El entrenamiento GRPO con β=0 se justifico por OOM con vocabulario de 256k, lo que indica restricciones de memoria no resueltas en las recetas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umeraamir69/hifazat-tab-writeup
- Adaptador SFT: https://huggingface.co/umeraamir69/hifazat-tab-sft-v1
- Repositorio GitHub: https://github.com/umeraamir69/HifazatTab
- Demo en vivo: https://hifazattab.vercel.app
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
