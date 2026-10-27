# ThakiCloud/Thaki-SecProof-27B-V1

## Resumen

Thaki-SecProof-27B-V1 es un adaptador LoRA (librería PEFT, pesos en safetensors) construido por ThakiCloud sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo de propósito general: está especializado en auditar runtimes de agentes de IA escritos en Python frente a uno de 12 límites de seguridad con nombre propio (por ejemplo, `approval_tool_binding`, `rag_tenant_isolation` o `secret_exposure_output`) y en responder con un hallazgo JSON de esquema fijo que incluye veredicto, evidencia con fichero y línea, severidad, lo que queda sin resolver y, en tareas de parcheo, un parche de fichero completo.

El adaptador cubre cuatro tareas: T1 (descubrimiento, con veredictos `confirmed` / `needs_validation` / `rejected`), T2 (verificación de un hallazgo candidato), T4 (parcheo) y T5 (regresión del parche). Forma parte de la familia SecProof, junto con las variantes Preview de 2B, 4B y 8B, que comparten datos, receta, formato de prompt (v2, byte-idéntico entre toda la familia) y contrato de salida. Es relevante ahora porque publica una evaluación sellada con puertas preinscritas y un resultado PASS en una única ejecución, algo poco habitual en adaptadores de seguridad de este tamaño, aunque con salvedades explícitas sobre el carácter sintético del conjunto de prueba.

El modelo se distribuye únicamente en inglés, con licencia Apache 2.0 para el adaptador, y requiere descargar el modelo base de forma separada. El repositorio ocupa 0,5 GB, coherente con un adaptador y no con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de la familia Qwen; la información del autor describe la familia base de este modelo como «Qwen3.5-style hybrid attention» (atención híbrida). Detalle completo de la arquitectura del base: no disponible |
| Parametros totales | Modelo base: 27B (Qwen3.8-27B). Parámetros del adaptador: no disponible. Tamaño del repo: 0,5 GB |
| Parametros activos | No aplica: no se describe como MoE en la información disponible (es un adaptador LoRA sobre un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se documenta ejecución en bf16 del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (adaptador); licencia del modelo base no indicada en la información proporcionada |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (PEFT, `peft>=0.19`, `transformers>=5.0`) que se aplica sobre Qwen3.8-27B. Según la model card, las variantes de 2B y 4B de la familia comparten la familia base de este modelo, descrita como de atención híbrida estilo Qwen3.5, mientras que la de 8B no. La inferencia puede acelerarse instalando `flash-linear-attention` y `causal-conv1d`, lo que confirma la presencia de capas de atención lineal en el modelo base. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon RLHF o DPO.

El entrenamiento se orienta a un contrato de salida rígido: el prompt debe construirse con `secproof_prompt.py` (formato v2), que es byte-idéntico al usado en las variantes de 2B, 4B y 8B, y el adaptador fue entrenado solo con ese formato. La decodificación de referencia para todas las cifras publicadas es greedy, con el modo «thinking» desactivado y `max_new_tokens=2048`. El checkpoint evaluado en el conjunto de desarrollo corresponde al paso 300 con semilla 20261025. La evaluación sellada se hizo sobre 6 de las 60 familias de plantillas del generador, reservadas fuera de entrenamiento y desarrollo: código Python sintético de código vulnerable, ya corregido y señuelos, generado por el mismo generador que los datos de entrenamiento.

## Capacidades

- Auditoría de código Python de runtimes de agentes de IA limitada a 12 fronteras de seguridad concretas: `approval_single_use`, `approval_tool_binding`, `cache_tenant_isolation`, `memory_trust_promotion`, `principal_confusion`, `rag_tenant_isolation`, `rag_write_tenant_binding`, `secret_exposure_output`, `tool_action_approval_binding`, `tool_authorization_scope`, `tool_identity` y `tool_tenant_binding`.
- T1 Descubrimiento: recibe un repositorio y una frontera, y devuelve `confirmed`, `needs_validation` o `rejected` junto con líneas de evidencia.
- T2 Verificación: recibe un repositorio y un hallazgo candidato, y determina si el hallazgo se sostiene, con evidencia.
- T4 Parcheo: recibe un repositorio y un problema confirmado, y devuelve un parche de fichero completo más el resultado de regresión esperado.
- T5 Regresión: recibe un repositorio y un parche candidato, y determina si corrige el problema sin romper comportamiento.
- Salida estructurada: JSON de esquema fijo con veredicto, evidencia fichero/línea, severidad y cuestiones no resueltas; el formato alcanza 1,0 en T1 y T4 en el conjunto sellado.
- Abstención calibrada: en los 10 casos indecidibles del conjunto sellado respondió `needs_validation` en 10 de 10 ocasiones.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes multi-paso propio: no documentado; el modelo audita runtimes de agentes, no se describe como agente autónomo.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking»: existe y se desactiva explícitamente en la decodificación de referencia de todas las cifras publicadas.
- Multilingüismo: limitado a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Auditoría del acoplamiento entre aprobación y herramienta en agentes con ejecución de acciones: se lanza T1 sobre el repositorio del runtime con la frontera `tool_action_approval_binding` y el adaptador devuelve veredicto más evidencia con línea, lo que permite localizar aprobaciones que no están ligadas a la acción concreta que autorizan.
- Segunda opinión sobre hallazgos de SAST en código de agentes: los resultados de un analizador estático se pasan por T2 para confirmar o descartar cada candidato; en el conjunto sellado el modelo no confirmó ninguno de los 239 señuelos (0/239, cota superior de Wilson 0,016), lo que lo hace adecuado como filtro de falsos positivos antes de abrir un tique.
- Verificación de aislamiento multi-inquilino en pipelines RAG: T1 con `rag_tenant_isolation`, `rag_write_tenant_binding` o `cache_tenant_isolation` sobre el código del recuperador y de la caché, para detectar lecturas o escrituras que no vinculan el identificador de inquilino.
- Control de exposición de secretos en la salida del agente: T1 con `secret_exposure_output` sobre las rutas de formateo y logging, buscando rutas donde credenciales o tokens llegan al texto devuelto al usuario.
- Revisión de identidad y alcance de herramientas: T1 con `tool_identity` y `tool_authorization_scope` para comprobar que la herramienta invocada es la declarada y que el alcance autorizado se respeta en cada llamada.
- Parcheo asistido con validación en CI: T4 genera un parche de fichero completo para un hallazgo confirmado y T5 comprueba que el parche supera las pruebas funcionales del sandbox sin regresiones; encaja como puerta previa a la fusión en pipelines que ya ejecutan tests en contenedor.
- Triaje de casos dudosos: cuando el modelo devuelve `needs_validation`, el caso se enruta a revisión humana en lugar de generar un falso positivo, gracias a la tasa de abstención observada (10/10 en el conjunto sellado).
- Auditoría de promoción de confianza en memoria y de confusión de principal: T1 con `memory_trust_promotion` y `principal_confusion` sobre el subsistema de memoria del agente y la gestión de identidades.

## Benchmarks y rendimiento

Evaluación sellada (held-out) V1, una única ejecución el 2026-10-26 con puertas fijadas de antemano. El conjunto sellado reserva 6 de las 60 familias de plantillas del generador: T1 con 327 casos (127 sellados: 39 vulnerables, 39 ya corregidos, 39 señuelos, 10 indecidibles; más 200 señuelos adicionales) y T4 con 39 casos de parcheo. «Stock» es el mismo modelo base con el mismo prompt, mediana de tres ejecuciones greedy. Los valores son proporciones entre 0 y 1, con coma decimal.

| Puerta | Este adaptador | Stock Qwen3.8-27B | Regla | Resultado |
|---|---|---|---|---|
| G1 Veredicto T1, balanced accuracy (127 sellados) | 1,000 | 0,342 | Δ CI95 inferior > 0 (obtenido +0,645) | pasa |
| G2 Ubicación de la vulnerabilidad correcta (39) | 1,000 | 0,000 | ≥ 0,80 y ≥ stock | pasa |
| G3 Evidencia apuntando a código inexistente | 0,000 | – | ≤ 0,01 | pasa |
| G4a Falso confirmado sobre señuelos (239) | 0/239 = 0,000 (cota superior Wilson 0,016) | 0,912 | ≤ 0,15, superior ≤ 0,20, Δ CI95 superior ≤ 0 (obtenido -0,875) | pasa |
| G4b Código ya corregido marcado como vulnerable (39) | 0/39 = 0,000 | – | ≤ 0,10 | pasa |
| G5 Casos indecidibles respondidos como `needs_validation` (10) | 10/10 | – | ≥ 0,70 | pasa |
| G6 Parche T4 supera seguridad en sandbox y pruebas funcionales (39) | 1,000 | 0,000 | ≥ 0,70 y Δ CI95 inferior > 0 | pasa |
| G7 Formato de salida (T1 / T4 sellados) | 1,0 / 1,0 | – | ≥ 0,99 | pasa |

Resultado global: PASS en las ocho puertas, en una sola ejecución. Resultados sellados de la familia: 2B FAIL (G4a), 4B PASS, 8B FAIL (G4b), 27B PASS.

Conjunto de desarrollo (semilla 20261025, checkpoint paso 300, una ejecución; 356 casos: T1 124, T2 92, T4 68, T5 72), métrica «claves requeridas en orden»:

| Métrica | Stock Qwen3.8-27B | SecProof-27B-V1 |
|---|---|---|
| Claves requeridas en orden (T1 / T2 / T4 / T5) | 0,38 / 0,91 / 0,62 / 0,79 | 1,00 / no disponible (dato truncado en la información proporcionada) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base en bf16 necesita aproximadamente 55 GB de memoria de GPU; la generación con lote de 4 alcanzó un pico de 59,8 GiB según el autor.
- GPU recomendadas: una A100 de 80 GB o una H100 de 80 GB son suficientes en un solo dispositivo para bf16 con el pico documentado. Una A100 de 40 GB no llega a los 55 GB del base en bf16 y requeriría paralelismo entre dispositivos o cuantización no documentada.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar el base en bf16. No hay datos publicados sobre cuantización del base ni del adaptador que permitan afirmar que quepa en 24 GB.
- Despliegue: la ruta documentada es `transformers>=5.0` junto con `peft>=0.19`, `torch` y `accelerate`, ejecutando `inference.py` con un JSON de ejemplo; se recomienda instalar `flash-linear-attention` y `causal-conv1d` para acelerar las capas de atención lineal. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible.
- Requisito de prompt: hay que usar `secproof_prompt.py` tal cual (formato v2); el adaptador solo fue entrenado con esa disposición exacta.
- Latencia y throughput: no disponibles. La configuración de decodificación de referencia es greedy, sin modo thinking y con `max_new_tokens=2048`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en evaluación sellada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-SecProof-27B-V1 | Base 27B + adaptador LoRA | No disponible | PASS en las 8 puertas (G1 1,000; G4a 0/239; G6 1,000) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Thaki-SecProof-8B-Preview | 8B + adaptador LoRA | No disponible | FAIL en G4b (código ya corregido marcado como vulnerable) | No indicada en la información disponible | HuggingFace |
| Thaki-SecProof-4B-Preview | 4B + adaptador LoRA | No disponible | PASS | No indicada en la información disponible | HuggingFace |
| Thaki-SecProof-2B-Preview | 2B + adaptador LoRA | No disponible | FAIL en G4a (falsos confirmados sobre señuelos) | No indicada en la información disponible | HuggingFace |
| Qwen/Qwen3.8-27B (stock) | 27B | No disponible | G1 0,342; G4a 0,912; G2 y G6 0,000 | No indicada en la información disponible | HuggingFace |

Las cuatro variantes SecProof comparten datos, receta, formato de prompt y contrato de salida, por lo que la comparación aísla principalmente el efecto del tamaño y de la familia base. No se dispone de datos de otros adaptadores de auditoría de seguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación sellado es código sintético generado por el mismo generador que los datos de entrenamiento (familias de plantillas no vistas, pero no repositorios reales): el PASS no garantiza rendimiento sobre código de producción.
- El autor declara explícitamente que el modelo no está validado para uso en seguridad operacional.
- Resultado de una única ejecución por modelo, con puertas preinscritas; no hay repeticiones que permitan estimar varianza más allá de los intervalos reportados.
- Desviación de protocolo aceptada (`retry_output_sha_mismatch`): la primera entrega sellada de cada miembro de la familia se detuvo antes de producir salida por un fallo de la infraestructura del autor; la repetición del job de 2B no produjo salidas byte-idénticas a la ejecución interrumpida (los veredictos del adaptador coincidieron en 366/366). La regla original se mantiene sin marcar como cumplida.
- Alcance muy restringido: solo Python, solo las 12 fronteras listadas y solo runtimes de agentes pequeños. Fuera de alcance quedan la caza general de CVE, los fallos de seguridad de memoria, el código que no sea Python, los repositorios reales de gran tamaño y cualquier frontera no listada; el autor avisa de salida poco fiable en esos casos.
- Idioma: únicamente inglés, tanto en prompts como en salidas esperadas.
- Riesgo de alucinación de evidencia: la puerta G3 mide evidencia que apunta a código inexistente y dio 0,000 en el conjunto sellado, pero esa cifra procede del mismo dominio sintético y no se ha medido sobre código real.
- Restricciones de licencia: el adaptador es Apache 2.0, pero la licencia del modelo base Qwen3.8-27B no se indica en la información proporcionada y debe comprobarse antes de un uso comercial.
- El adaptador no es autónomo: requiere descargar y ejecutar el modelo base de 27B, con el coste de hardware asociado (unos 55 GB en bf16).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya replicado los resultados.
- La model card está escrita por el autor del modelo y las cifras de evaluación no han sido verificadas de forma independiente según la información disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ThakiCloud/Thaki-SecProof-27B-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Thaki-SecProof-2B-Preview: https://huggingface.co/ThakiCloud/Thaki-SecProof-2B-Preview
- Thaki-SecProof-4B-Preview: https://huggingface.co/ThakiCloud/Thaki-SecProof-4B-Preview
- Thaki-SecProof-8B-Preview: https://huggingface.co/ThakiCloud/Thaki-SecProof-8B-Preview
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-SecProof-27B-V1/blob/main/MODEL_CARD.ko.md
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
