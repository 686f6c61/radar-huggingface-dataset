# ThakiCloud/Thaki-SecProof-2B-Preview

## Resumen

Thaki-SecProof-2B-Preview es un adaptador LoRA (librería PEFT) construido por ThakiCloud sobre el modelo base Qwen/Qwen3.5-2B. No es un modelo de propósito general: está especializado en auditar runtimes de agentes de IA escritos en Python frente a uno de 12 límites de seguridad (boundaries) predefinidos, y en devolver un hallazgo único en JSON con esquema fijo que incluye veredicto, evidencia con fichero y línea, severidad, cuestiones sin resolver y, en tareas de parcheo, un parche de fichero completo.

El modelo cubre cuatro tareas: T1 Discover (descubrir si un boundary está vulnerado), T2 Verify (verificar un hallazgo candidato), T4 Patch (generar parche para un problema confirmado) y T5 Regression (comprobar si un parche corrige el fallo sin romper comportamiento). Los boundaries cubiertos son exactamente doce: `approval_single_use`, `approval_tool_binding`, `cache_tenant_isolation`, `memory_trust_promotion`, `principal_confusion`, `rag_tenant_isolation`, `rag_write_tenant_binding`, `secret_exposure_output`, `tool_action_approval_binding`, `tool_authorization_scope`, `tool_identity` y `tool_tenant_binding`. Queda fuera de alcance la caza general de CVE, los bugs de seguridad de memoria, el código que no sea Python y los repositorios reales de gran tamaño.

Es relevante ahora porque propone un formato de salida estrictamente esquematizado y verificable para tareas de auditoría de seguridad, un ámbito donde los modelos generalistas rara vez cumplen el esquema. Ahora bien, el propio autor lo etiqueta como *research preview*: no es apto para producción ni para uso operacional en seguridad, y todas las métricas publicadas proceden de un conjunto de desarrollo generado por el mismo generador sintético que los datos de entrenamiento. El conjunto de test sellado todavía no se ha ejecutado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer Qwen/Qwen3.5-2B; arquitectura interna del modelo base no detallada en la información disponible |
| Parámetros totales | ≈2.000 millones (modelo base Qwen3.5-2B); número de parámetros del adaptador no desglosado (repositorio de 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors. La ficha no documenta cuantizaciones del modelo base |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, PEFT) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-2B ni la configuración exacta del adaptador (rango LoRA, módulos objetivo, número de pasos totales). Lo que sí se documenta es el procedimiento de selección del checkpoint: se entrenaron al menos los pasos 150, 300, 450, 600, 750 y 900, y el checkpoint 750 se eligió mediante una regla pre-registrada (esquema válido ≥ 0,99 por tarea, después tasa de falsos positivos sobre código seguro ≤ la del modelo base, y finalmente la media más alta de T1 balanced accuracy, T2 balanced accuracy y T4 both-pass, con desempate por el paso más temprano). El paso 900 empató con el 750.

El entrenamiento se apoya en un formato de prompt muy concreto (denominado formato v2): una línea `TASK:`, una línea ordenada `OUTPUT KEYS`, la instrucción, `BOUNDARIES:`, el candidato o parche opcional y, por último, el repositorio renderizado como bloques numerados `=== path ===`. El adaptador se entrenó únicamente con este formato, y el autor advierte explícitamente que debe usarse tal cual. La decodificación empleada para todas las cifras publicadas es greedy, con el modo *thinking* desactivado y `max_new_tokens=2048`. Los datos de entrenamiento son repositorios sintéticos generados por un generador propio: 487 mundos de entrenamiento y 44 de desarrollo, sin solapamiento entre ellos, con 14 plantillas de bug y 12 boundaries presentes en ambos conjuntos. La sección de entrenamiento de la model card aparece truncada en la información proporcionada, por lo que no se dispone de detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Descubrimiento de vulnerabilidades (T1 Discover): dado un repositorio y un boundary concreto, emite veredicto `confirmed`, `needs_validation` o `rejected`, acompañado de líneas de evidencia.
- Verificación de hallazgos (T2 Verify): dada una vulnerabilidad candidata, determina si se sostiene y aporta evidencia.
- Parcheo (T4 Patch): dado un problema confirmado, genera un parche de fichero completo junto con el resultado de regresión esperado.
- Regresión (T5 Regression): dado un parche candidato, evalúa si corrige el problema sin romper el comportamiento existente.
- Salida con esquema fijo: JSON con claves predefinidas (veredicto, evidencia fichero/línea, severidad, cuestiones sin resolver y parche cuando aplica). El autor no repara claves después de la generación; una salida inválida se puntúa como incorrecta.
- Cobertura limitada y explícita a 12 boundaries de seguridad en runtimes de agentes de IA.
- Capacidad de razonamiento multi-paso encadenando T1 → T2 → T4 → T5 dentro de un flujo de auditoría.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidad multilingüe: solo inglés; el resto de idiomas no está soportado según la model card.
- Modo *thinking*: entrenado y evaluado con el modo desactivado.

## Casos de uso

- Revisión de seguridad en pull requests de runtimes de agentes: el modelo recibe el repositorio y un boundary (por ejemplo `tool_authorization_scope`) y devuelve un veredicto con líneas de evidencia concretas, lo que permite al revisor humano localizar el punto exacto del código sin recorrer todo el diff.
- Triaje de hallazgos de SAST: dado un candidato generado por un analizador estático, T2 Verify determina si se sostiene; esto reduce el coste de revisión manual descartando falsos positivos antes de que lleguen al equipo de seguridad.
- Aislamiento multi-tenant en pipelines RAG: los boundaries `rag_tenant_isolation` y `rag_write_tenant_binding` permiten comprobar si un índice vectorial o una escritura respeta la separación entre inquilinos, un fallo típico en asistentes corporativos.
- Auditoría de permisos de herramientas en agentes: los boundaries `tool_action_approval_binding`, `tool_identity` y `tool_tenant_binding` cubren la vinculación entre aprobación, identidad y acción, útil antes de desplegar un agente con acceso a herramientas internas.
- Generación asistida de parches (T4): para un problema confirmado, el modelo produce un parche de fichero completo y el resultado de regresión esperado, que después se valida en un sandbox con tests de seguridad y funcionales; el autor reporta 68/68 ambos-pass en el conjunto de desarrollo.
- Validación de parches en CI (T5): integrado como paso previo a la fusión, T5 comprueba si el parche candidato corrige el fallo sin romper comportamiento, siempre con un revisor humano como última barrera.
- Detección de exposición de secretos en salidas del agente: el boundary `secret_exposure_output` audita si el runtime filtra credenciales en la respuesta final.
- Evaluación interna de pipelines de auditoría: sirve como referencia para medir si un sistema propio de revisión automatizada cumple el esquema y detecta los mismos boundaries, aunque sea solo sobre datos sintéticos.
- Formación de revisores: los JSON con evidencia fichero/línea y severidad sirven como material didáctico para entrenar a analistas en la identificación de estos patrones concretos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de desarrollo (356 casos: T1 124, T2 92, T4 68, T5 72), semilla 20261025, checkpoint 750, puntuados por un scorer determinista. "Stock" es el mismo modelo base con el mismo prompt y decodificación, sin adaptador. Todos los casos son in-distribution (mismo generador sintético que el entrenamiento) y el test sellado no se ha ejecutado.

| Métrica | Stock Qwen3.5-2B | SecProof-2B-Preview |
|---|---|---|
| Coincidencia de esquema de salida (T1 / T2 / T4 / T5) | 0,12 / 0,00 / 0,06 / 0,11 | 1,00 / 1,00 / 1,00 / 1,00 |
| T1 balanced accuracy (3 veredictos) | 0,258 | 0,992 |
| T2 balanced accuracy | 0,806 | 1,000 |
| T4 parche ambos-pass en sandbox (tests de seguridad y funcionales) | 0,00 | 1,00 (68/68) |
| Tasa de falsos positivos sobre código seguro (SAFE), T1+T2 | 0,078 | 0,000 |
| T1 precisión de localización de vulnerabilidad (diagnóstico) | 0,000 | 0,975 |
| Ítems de evidencia que apuntan a código inexistente (diagnóstico) | 0,000 | 0,000 |

Notas del autor sobre estas cifras: solo se evalúa la localización en salidas con esquema válido, de ahí que el 0,000 del modelo base refleje que la mayoría de sus salidas no eran puntuables; el modelo base alcanzó el límite de 2048 tokens en 51 de los 356 casos. Además, buena parte de la mejora frente al modelo base es de formato: la señal independiente del formato es la balanced accuracy de T1 y la precisión de localización.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa por el tamaño del modelo base (≈2.000 millones de parámetros), en FP16 los pesos ocuparían del orden de 4 GB y en cuantización de 4 bits alrededor de 1,5 GB, a lo que hay que sumar caché KV y activaciones; son estimaciones, no cifras confirmadas en la información disponible.
- El adaptador LoRA en sí ocupa 0,1 GB (tamaño del repositorio), por lo que el coste adicional sobre el modelo base es marginal.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU de consumo con 8 GB o más debería poder ejecutar el modelo base en cuantización de 4 bits; para FP16 se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100). Estas recomendaciones son estimaciones basadas en el tamaño, no cifras del autor.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, siempre con cuantización o FP16 según VRAM disponible; no confirmado por el autor.
- Opciones de despliegue documentadas: únicamente `transformers>=5.0`, `peft>=0.19`, `torch` y `accelerate`, con el script `inference.py` incluido en el repositorio. No se documentan vLLM, TGI, llama.cpp ni Ollama; para usar estos motores habría que fusionar el adaptador con el modelo base o convertirlo a GGUF, algo no descrito en la ficha.
- Requisito crítico de integración: usar el constructor de prompt `secproof_prompt.py` tal cual (formato v2); el adaptador solo fue entrenado con ese layout.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-SecProof-2B-Preview | ≈2B (base) + adaptador LoRA | No disponible | Auditoría de 12 boundaries en runtimes de agentes Python | Apache 2.0 | HuggingFace (research preview) |
| Qwen/Qwen3.5-2B (stock) | ≈2B | No disponible | Propósito general | No indicada en la información disponible | HuggingFace |
| Thaki-SecProof-4B / 8B / 27B | 4B / 8B / 27B | No disponible | Misma familia, mismos boundaries | No disponible | Anunciados como parte de la familia, no publicados en la información disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros especializados en auditoría de seguridad de código, por lo que no es posible establecer una comparación cuantitativa con alternativas externas. La única comparación con cifras es contra el modelo base sin adaptador, incluida en la sección de benchmarks.

## Limitaciones y advertencias

- **Research preview**: el autor declara explícitamente que no está listo para producción ni validado para uso operacional en seguridad. No debe usarse como única base para una decisión de seguridad; los hallazgos deben tratarse como pistas para un revisor humano.
- **Solo in-distribution**: todos los números proceden del mismo generador sintético y de los mismos 12 boundaries que el entrenamiento. Aunque no hay duplicados exactos ni mundos compartidos entre train y dev (487 frente a 44), las 14 plantillas de bug y los 12 boundaries aparecen en ambos conjuntos; esto no es independencia de distribución y no demuestra generalización a patrones de código nuevos.
- **Test sellado sin ejecutar**: el conjunto de test retenido (G1–G7) se ejecutará una sola vez, tras seleccionar todos los miembros de la familia, y se reportará en una versión posterior. No hay evidencia fuera de distribución publicada.
- **Fallo conocido fuera de distribución**: en `examples/t1_rag_tenant_isolation.json`, un repositorio escrito a mano, la respuesta correcta es `confirmed` en `app/search.py:10`; el modelo responde `rejected` y su justificación afirma erróneamente que la búsqueda filtra por inquilino. El JSON es válido y apunta a la línea correcta, pero el juicio es incorrecto: el formato generaliza, el criterio no.
- **Sesgo de tarea en T4/T5**: en estos datos todos los veredictos gold de T4 son `confirmed` (68/68) y todos los de T5 son `rejected` (72/72), por lo que el veredicto puede adivinarse por el nombre de la tarea. Para T4 la métrica relevante es la tasa ambos-pass en sandbox, no la accuracy del veredicto.
- **Gran parte de la mejora es de formato**: el modelo base apenas produce el esquema requerido. La señal independiente de formato se limita a T1 balanced accuracy y a la precisión de localización.
- **Una sola semilla**: hay dos semillas más en entrenamiento y la varianza entre semillas todavía no se ha reportado.
- **Repositorios sintéticos y pequeños**: los repositorios reales son más grandes, más desordenados y multilingües; el modelo solo cubre Python.
- **Fuera de alcance**: caza general de CVE, bugs de seguridad de memoria, código no Python, repositorios reales grandes y cualquier boundary no listado. En esos casos el autor advierte que la salida será poco fiable.
- **Idioma**: solo inglés; no hay soporte documentado de castellano ni de otros idiomas.
- **Licencia**: Apache 2.0, que en principio permite uso comercial, pero la licencia del modelo base Qwen3.5-2B debe verificarse por separado y no se detalla en la información disponible.
- **Integración frágil**: depende de un formato de prompt exacto (v2) construido por `secproof_prompt.py`; desviarse del layout degrada el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-SecProof-2B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Script de inferencia: `inference.py`, incluido en el repositorio del modelo
- Constructor de prompt: `secproof_prompt.py`, incluido en el repositorio del modelo
- Ejemplo fuera de distribución: `examples/t1_rag_tenant_isolation.json`, incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
