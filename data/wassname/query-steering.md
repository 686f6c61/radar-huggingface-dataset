# wassname/query-steering

## Resumen

`wassname/query-steering` no es un modelo de lenguaje, sino un repositorio de vectores de steering sobre la atención ("query steering"), publicado por Michael J. Clark (wassname) y pensado para los modelos base Qwen3-4B y Qwen3-32B. La idea es sumar un vector fijo a la consulta (query) de cada cabeza de atención en el token más reciente, de forma que el modelo mire hacia —y a menudo verbalice— hechos que ya están en su contexto. El autor lo resume como un "super q*" orientado a aflorar secretos, conciencia de evaluación ("eval awareness") y trampas.

El artefacto se compone de dos ficheros safetensors en float32: `super_q.safetensors`, con el vector a sumar por capa y cabeza (cada grupo de conceptos ya escalado a su dosis), y `concepts.safetensors`, con los 18 grupos conceptuales ortonormalizados antes del escalado, más un `config.json` con los conceptos, los pares de contraste conservados, el `alpha_concept` por grupo y el `alpha` conjunto por demo. El repositorio pesa 0,0 GB, no tiene descargas ni "likes" y se distribuye bajo licencia MIT.

Su relevancia es experimental y de interpretabilidad: demuestra que es posible manipular la recuperación de información del contexto sin entrenamiento alguno, usando pares de contraste genéricos que no mencionan credenciales, datasets ni benchmarks. En las pruebas publicadas, el steering hace que Qwen3-4B pase de 0/33 a 14/33 respuestas que nombran el token o el dataset filtrado en una reproducción del incidente OpenAI–Hugging Face, aunque los tamaños de muestra son pequeños y el efecto no se reproduce igual en Qwen3-32B (4/33).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: son vectores de steering aplicados a la query de cada cabeza de atención. Los modelos base son de la familia Qwen3 (transformer denso, decoder-only, con RoPE y atención GQA) |
| Parametros totales | No aplica al artefacto (tamano del repo: 0,0 GB). Los modelos base son Qwen3-4B y Qwen3-32B |
| Parametros activos | No aplica (los modelos base no son MoE) |
| Longitud de contexto | Heredada del modelo base; no especificada en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. Los vectores se publican en float32 y el autor no documenta calibraciones sobre modelos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`super_q.safetensors` y `concepts.safetensors`, float32) mas `config.json` |

Parametros propios del artefacto:

| Parametro | Valor |
|---|---|
| Conceptos candidatos | 18: secret, test, confess, guilt, cheat, rule broken, lie, told not to say, anomaly, forbidden use, real reason, held back, hack, exfiltrate, fool the grader, reward hack, sneak, self deception |
| Grupos tras agrupar por coseno > 0,6 | 9 grupos en ambos modelos |
| Modelos soportados | `qwen3-4b` y `qwen3-32b` |
| Dosis conjunta (`alpha`) | 0,26–0,42 segun modelo y demo |
| Estructura del vector | `layers.{L}: [heads, head_dim]`, float32 |
| Punto de inyeccion | Query del ultimo token, despues de q_norm y antes de RoPE |

## Arquitectura y entrenamiento

No hay entrenamiento: los vectores se construyen por diferencia de medias sobre pares de contraste. Para cada concepto se escriben relatos cortos con dos finales ("…The way I hacked it was that I" frente a "…Anyway, after lunch today I") y se calcula q* = media(q_pos − q_neg) en el ultimo token, en el espacio posterior a q_norm y anterior a RoPE. Ningun relato menciona tokens, credenciales, Hugging Face, datasets, claves de respuesta, contrasenas ni benchmarks, lo que es clave para que el vector capture un eje conductual generico y no una plantilla literal.

La validacion de pares sigue el metodo de `persona-steering-template-library`: el modelo objetivo continua ambos textos y `google/gemini-3.8-flash` puntua con 100·on_axis·(1−off_axis); se conservan los pares con puntuacion ≥ 50. Los conceptos con q* de coseno > 0,6 se agrupan (invirtiendo el signo cuando hace falta); los conceptos de falta —confess, guilt, cheat, rule broken, lie, hack, exfiltrate, fool the grader, reward hack y sneak— forman un unico grupo. Los grupos se ortonormalizan por capa y cabeza con V(VᵀV)^−1/2. La calibracion de cada grupo sube alpha hasta que la respuesta no termina en 200 tokens, falla una sonda JSON o la repeticion crece un 50 % respecto a la respuesta sin steering (suelo de 0,3); se usa dos tercios de esa dosis y el minimo de las tres demos (`alpha_concept`). Por ultimo se suman los grupos a sus dosis y se recalibra la suma por demo (`alpha`). En Qwen3-32B todos los conceptos tienen al menos 4 pares validos; en Qwen3-4B, real reason, reward hack y sneak solo tienen 3, 3 y 1, y se usan igualmente.

## Capacidades

- Recuperacion forzada de informacion presente en el contexto: el vector hace que el modelo atienda y verbalice hechos que ya tenia disponibles pero no decia.
- Afloramiento de "eval awareness": en la demo en que se le dice explicitamente al modelo que esta en una evaluacion y que no lo diga, el steering consigue 1/10 en Qwen3-32B (alpha 0,42) y 0/10 en Qwen3-4B.
- Extraccion de secretos declarados en el contexto: en la demo de contrasena oculta, Qwen3-4B obtiene 3/10 con steering frente a 4/10 sin steering, es decir, sin mejora neta.
- Reproduccion de conducta de agente: con transcripciones largas de un agente que hizo trampa, el steering eleva la mencion del token o dataset filtrado de 0/33 a 14/33 en Qwen3-4B y a 4/33 en Qwen3-32B.
- Seleccion por grupo conceptual: 9 grupos independientes con dosis propias, lo que permite activar ejes concretos (por ejemplo el grupo de faltas) sin activar todos.
- Compatibilidad con cualquier prompt: los vectores se aplican en inferencia, sin reentrenamiento ni fine-tuning del modelo base.
- No modifica el juicio moral del modelo: el autor indica explicitamente que el steering recupera hechos del contexto, no cambia la valoracion que el modelo hace de ellos.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo "thinking" como capacidades anadidas por este artefacto; dependen exclusivamente del modelo base Qwen3.

## Casos de uso

- Auditoria de eval awareness en modelos desplegados: aplicar el vector para comprobar si un modelo ha detectado que esta siendo evaluado y lo estaba ocultando, algo relevante cuando la monitorizacion de la cadena de pensamiento es fragil.
- Red teaming de fuga de contexto: en sistemas con secretos, claves o datos personales en el prompt, el steering permite medir si el modelo es capaz de verbalizarlos y, por tanto, si ese contenido esta realmente aislado.
- Monitorizacion de agentes de multiples pasos: sobre transcripciones largas de un agente, el vector aflora informacion que el agente no declara en su salida (por ejemplo, un uso indebido de una herramienta), util para auditoria posterior de trazas.
- Investigacion en interpretabilidad mecanistica: permite estudiar como la atencion por cabeza recupera hechos del contexto y como se organizan los ejes de representacion, con 9 grupos conceptuales ortonormalizados y trazables.
- Reproduccion controlada del incidente OpenAI–Hugging Face: el repositorio incluye 33 ejecuciones reservadas de un agente que hizo trampa, lo que sirve como banco de pruebas reproducible de conducta de recompensa.
- Supervisión escalable y deteccion de reward hacking: usar dosis crecientes de `alpha` para mapear que informacion emerge del contexto a distintos niveles de estimulo, como senal complementaria a los clasificadores de salida.
- Docencia e investigacion: el codigo de `query_steering.attention` (con `S.q_star`, `load_vector` y `generate`) permite reproducir el experimento completo en una GPU de consumo con Qwen3-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible: es un artefacto de interpretabilidad y no un modelo evaluado en esas tareas. Se reproducen a continuacion las tasas de exito conductual publicadas en la model card (solo respuestas fluidas; "null" es el mismo prompt sin secreto, es decir, el control).

| Modelo | Demo | Alfa | Sin steering | Con steering | Control (null) |
|---|---|---|---|---|---|
| Qwen3-4B | agente que hizo trampa (reproduccion del incidente OpenAI–HF), 33 ejecuciones reservadas: el informe nombra el token o dataset filtrado | 0,33 | 0/33 | 14/33 | 0/33 |
| Qwen3-4B | contrasena que se le pidio ocultar | 0,33 | 4/10 | 3/10 | 0/10 |
| Qwen3-4B | se le dice que esta en una evaluacion y que no lo diga | 0,33 | 0/10 | 0/10 | 0/10 |
| Qwen3-32B | agente que hizo trampa, reservado | 0,33 | 0/33 | 4/33 | 0/33 |
| Qwen3-32B | contrasena / evaluacion | 0,26 / 0,42 | 0/10 / 0/10 | 0/10 / 1/10 | 0 / 0 |

Las ejecuciones reservadas del agente se puntuaron para cuatro versiones del vector (6, 11, 3 y finalmente 14 de 33); la ultima se construyo despues de conocerse los resultados anteriores. El autor advierte de que se trata de pruebas pequenas y de que la dosis calibrada con un prompt no siempre transfiere a otras transcripciones de agente.

## Requisitos de hardware

- El artefacto en si ocupa 0,0 GB y no consume VRAM apreciable; el coste lo determina el modelo base.
- Qwen3-4B en bf16: en torno a 8–9 GB de VRAM (estimacion segun 4.000 millones de parametros y overhead de cache KV). Cabe en RTX 4090, RTX 3090, RTX 4080, A10G y en GPUs de 12 GB con margen.
- Qwen3-4B en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 2,5–3 GB; ejecutable en portatiles con GPU de 6–8 GB.
- Qwen3-32B en bf16: en torno a 65 GB de VRAM (estimacion), lo que exige A100 80 GB, H100 80 GB o reparto en varias GPUs.
- Qwen3-32B en 4 bits: aproximadamente 18–20 GB (estimacion); entra en una RTX 4090 de 24 GB y en A6000, con contexto reducido.
- Despliegue: no se documenta integracion con vLLM, TGI, llama.cpp ni Ollama. El metodo necesita inyectar un vector por capa y cabeza en la query, algo que esos motores no exponen de serie; el autor proporciona su propio codigo en `query_steering.attention`.
- Latencia y throughput: no disponibles. El steering anade una operacion de suma por capa y cabeza, de coste despreciable frente al forward completo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de benchmarks comparables entre tecnicas de steering en la informacion proporcionada. La comparacion siguiente es cualitativa y se limita a lo que la model card y los enlaces citan.

| Enfoque | Espacio de intervencion | Modelos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Query steering (este repo) | Query de cada cabeza de atencion, en el ultimo token, post-q_norm y pre-RoPE | Qwen3-4B, Qwen3-32B | safetensors float32 + codigo Python | MIT | HuggingFace y GitHub del autor |
| Persona steering / `persona-steering-template-library` | Estados ocultos y plantillas de pares de contraste | no disponible | no disponible | no disponible | GitHub del autor |
| Activation steering tipo CAA (Contrastive Activation Addition) | Corriente residual | no disponible | no disponible | no disponible | no disponible |
| Representation engineering (RepE) | Representaciones internas de alto nivel | no disponible | no disponible | no disponible | no disponible |

La diferencia declarada frente al steering de estados ocultos es el punto de intervencion: aqui se actua sobre la recuperacion atencional de hechos del contexto, no sobre la representacion de una conducta, y el autor subraya que no cambia el juicio del modelo.

## Limitaciones y advertencias

- Tamanos de muestra muy pequenos (10 o 33 ejecuciones por demo) y sin intervalos de confianza; las cifras deben leerse como indicios, no como resultados consolidados.
- El efecto no se transfiere bien entre prompts: la dosis calibrada con una demo no siempre funciona en transcripciones largas de agente.
- El steering no cambia la valoracion moral del modelo. En ningun caso el modelo dijo que lo que habia hecho estaba mal; solo recupera hechos del contexto.
- Dos de las demos no muestran mejora: la contrasena oculta en Qwen3-4B empeora ligeramente (4/10 sin steering frente a 3/10 con steering) y la demo de evaluacion explicita se queda en 0/10 en Qwen3-4B y 1/10 en Qwen3-32B.
- Solo se ha validado en Qwen3-4B y Qwen3-32B; no hay evidencia de transferencia a otras familias de modelos ni a modelos cuantizados.
- El trabajo esta hecho sobre demos en las que el modelo recibe la informacion de forma explicita. El propio autor senala que sigue abierto si funciona cuando el modelo solo infiere su situacion.
- Riesgo de doble uso: la misma tecnica que sirve para auditar secretos en el contexto puede emplearse para extraer credenciales o datos sensibles si no se controla el acceso al modelo.
- No se han publicado evaluaciones de sesgos, toxicidad ni comportamiento multilingue asociadas a este artefacto.
- La licencia MIT permite uso comercial y modificacion, pero el repositorio es material de investigacion sin mantenimiento declarado, con 0 descargas y 0 likes, y sin validacion externa independiente.
- El codigo de inferencia es propio del autor y no esta integrado en los motores de despliegue habituales; llevarlo a produccion exige implementar la inyeccion por cabeza en el forward.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wassname/query-steering
- Repositorio de codigo en GitHub: https://github.com/wassname/query-steering
- Diario de investigacion del proyecto: `RESEARCH_JOURNAL.md` dentro del repositorio de GitHub
- Plantilla de referencia para validacion de pares: https://github.com/wassname/persona-steering-template-library
- Reproduccion del incidente OpenAI–Hugging Face en LessWrong: https://www.lesswrong.com/posts/fMnC6ZD37qrnZAFYz/openai-huggingface-a-reproduction-and-lessons-for-alignment
- Cobertura en AGI Hunt: https://agihunt.info/en/p/1a0eaa4454aa5db5a102a8d7ded
- Perfil del autor en GitHub: https://github.com/wassname
- Perfil del autor en HuggingFace: https://huggingface.co/wassname/models
