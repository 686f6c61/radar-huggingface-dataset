# ThakiCloud/Thaki-SecProof-4B-Preview

## Resumen

Thaki-SecProof-4B-Preview es un adaptador LoRA desarrollado por ThakiCloud sobre el modelo base Qwen/Qwen3.5-4B, especializado en la auditoría de seguridad de runtimes de agentes de IA escritos en Python. El modelo no genera texto libre: recibe un repositorio y una de 12 fronteras de seguridad predefinidas y devuelve un hallazgo JSON con esquema fijo que incluye veredicto, evidencia con fichero y línea, severidad, incógnitas pendientes y, en tareas de parcheo, un parche de fichero completo.

Forma parte de la familia SecProof, junto con el hermano Thaki-SecProof-2B-Preview, que comparte datos, receta, formato de prompt y contrato de salida. Cubre cuatro tareas: descubrimiento (T1), verificación de hallazgos candidatos (T2), generación de parches (T4) y regresión de parches (T5). El ámbito es deliberadamente estrecho: 12 fronteras nombradas como aislamiento multi-tenant en RAG, binding de aprobaciones a herramientas, identidad de herramientas, exposición de secretos en salidas o confusión de principal.

Es relevante ahora porque ataca un problema específico de la infraestructura de agentes (los límites de confianza entre herramientas, tenants y aprobaciones) con un contrato de salida verificable y determinista. Ahora bien, el autor lo etiqueta explícitamente como *research preview*: no está validado para uso operativo, todas las métricas provienen de un conjunto de desarrollo construido por el mismo generador sintético que los datos de entrenamiento, y el test sellado aún no se ha ejecutado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | No disponible (el adaptador no declara su recuento; el repositorio ocupa 0,1 GB y requiere los pesos del base de 4B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de Qwen/Qwen3.5-4B; no declarada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); requiere fusionarse o cargarse junto al base Qwen/Qwen3.5-4B |
| Librería | `peft` (el autor exige `transformers>=5.0`, `peft>=0.19`, `torch`, `accelerate`) |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT sobre el decoder Qwen/Qwen3.5-4B. No se documentan en la información disponible ni la arquitectura interna del base, ni el rango del adaptador, ni el número de parámetros entrenados. La interfaz es tan importante como los pesos: `secproof_prompt.py` construye un prompt en formato v2 con una línea `TASK:`, una línea ordenada `OUTPUT KEYS`, la instrucción, un bloque `BOUNDARIES:`, el candidato o parche opcional y el repositorio renderizado como bloques numerados `=== path ===`. El adaptador solo fue entrenado con ese formato, y el renderizador se verificó contra el usado en entrenamiento en los 356 casos de desarrollo (356/356 idénticos, según el autor).

Los datos de entrenamiento son sintéticos, generados por el mismo generador que produce el conjunto de desarrollo: 487 repositorios sintéticos (*worlds*) en entrenamiento y 44 en desarrollo, sin solapamiento entre ellos, con 14 plantillas de bug y las 12 fronteras presentes en ambos conjuntos. No se especifican el número de tokens de entrenamiento ni si hubo RLHF o DPO. La selección de checkpoint se hizo con una regla preregistrada sobre los pasos 150, 300, 450, 600, 750 y 900, eligiendo el paso 750 (esquema ≥ 0,99 por tarea, luego tasa de falso confirmado en código seguro ≤ la del base, luego mayor objetivo S, y en empate el paso más temprano). La decodificación empleada en todas las cifras publicadas es greedy, con *thinking* desactivado y `max_new_tokens=2048`. Se trata de una única ejecución de entrenamiento: no se ha medido la varianza entre semillas.

## Capacidades

- Descubrimiento de vulnerabilidades (T1): dado un repositorio y una frontera, emite `confirmed`, `needs_validation` o `rejected` con líneas de evidencia.
- Verificación de hallazgos (T2): evalúa si un hallazgo candidato se sostiene, con evidencia asociada.
- Parcheo (T4): genera un parche de fichero completo para un problema confirmado, junto con el resultado de regresión esperado.
- Regresión de parches (T5): determina si un parche candidato corrige el problema sin romper comportamiento existente.
- Salida con esquema JSON fijo y orden de claves estable (estricto v2), sin reparación posterior de claves.
- Evidencia anclada a fichero y línea del repositorio de entrada.
- Cobertura de 12 fronteras concretas: `approval_single_use`, `approval_tool_binding`, `cache_tenant_isolation`, `memory_trust_promotion`, `principal_confusion`, `rag_tenant_isolation`, `rag_write_tenant_binding`, `secret_exposure_output`, `tool_action_approval_binding`, `tool_authorization_scope`, `tool_identity`, `tool_tenant_binding`.
- Capacidad de ejecutarse con *thinking* desactivado (configuración usada en todas las métricas publicadas).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- **Triaje de hallazgos de SAST en runtimes de agentes**: T2 permite enviar un candidato generado por un analizador estático junto al repositorio y obtener un veredicto con evidencia en fichero/línea, lo que reduce el coste de revisión manual antes de escalar a un humano.
- **Auditoría dirigida de aislamiento multi-tenant en RAG**: T1 sobre las fronteras `rag_tenant_isolation` y `rag_write_tenant_binding` sirve para revisar pipelines de recuperación donde una escritura o lectura podría cruzar tenants.
- **Revisión de binding de aprobaciones a herramientas**: las fronteras `approval_tool_binding`, `approval_single_use` y `tool_action_approval_binding` cubren el caso clásico de aprobación reutilizada o desvinculada de la acción concreta autorizada.
- **Generación de parches asistida con validación en sandbox**: T4 produce un parche de fichero completo; el flujo realista es aplicar el parche en un entorno aislado y ejecutar tests de seguridad y funcionales, tal como hace la métrica `both-pass`.
- **Puerta de pre-merge en CI/CD**: T5 puede colocarse como paso previo al merge para comprobar que un parche de seguridad no rompe comportamiento; encaja por su salida JSON determinista, apta para consumo automatizado.
- **Detección de exposición de secretos en salidas de agentes**: la frontera `secret_exposure_output` permite revisar rutas de código donde una respuesta del agente podría filtrar credenciales.
- **Generación de conjuntos de evaluación internos**: el contrato de salida fijo y las 12 fronteras hacen del modelo un generador etiquetado útil para construir corpus de pruebas de seguridad de agentes.
- **Revisión de confusión de principal e identidad de herramientas**: `principal_confusion` y `tool_identity` atacan suplantaciones donde el agente actúa con la identidad de otro principal o invoca una herramienta bajo una identidad incorrecta.

## Benchmarks y rendimiento

Resultados del conjunto de desarrollo (semilla 20261025, checkpoint 750), 356 casos: T1 124, T2 92, T4 68, T5 72, puntuados por un scorer determinista. "Stock" es el mismo modelo base con el mismo prompt y decodificación, sin adaptador. Una sola ejecución.

| Métrica | Qwen3.5-4B base | SecProof-4B-Preview |
|---|---|---|
| Claves requeridas en orden (T1 / T2 / T4 / T5) | 1,00 / 0,95 / 0,29 / 0,69 | 1,00 / 1,00 / 1,00 / 1,00 |
| Esquema estricto v2 (T1 / T2 / T4 / T5, diagnóstico) | 0,00 / 0,45 / 0,00 / 0,00 | 1,00 / 1,00 / 1,00 / 1,00 |
| Exactitud balanceada T1 (3 veredictos) | 0,333 | 1,000 |
| Exactitud balanceada T2 | 0,339 | 1,000 |
| T4: parche pasa ambas pruebas en sandbox (seguridad + funcional) | 0,00 | 1,00 (68/68) |
| Tasa de falso confirmado en código seguro, T1+T2 | 0,957 | 0,000 |
| Exactitud de localización vulnerable en T1 (diagnóstico) | 0,000 | 1,000 |
| Elementos de evidencia que apuntan a código inexistente (diagnóstico) | 0,000 | 0,000 |
| Objetivo de selección S (media de T1 bacc, T2 bacc y T4 both-pass) | 0,224 | 1,000 |

Selección de checkpoint (regla preregistrada):

| Paso | 150 | 300 | 450 | 600 | 750 | 900 |
|---|---|---|---|---|---|---|
| S | 0,802 | 0,915 | 0,997 | 0,997 | **1,000** | 1,000 |
| Falso confirmado en seguro | 0,036 | 0,000 | 0,014 | 0,014 | **0,000** | 0,000 |

El propio autor advierte que, a partir del paso 450, S está en el techo del conjunto de desarrollo: un solo caso T1 mueve la exactitud balanceada de T1 alrededor de 0,008, de modo que las diferencias entre los pasos 450 y 900, y entre este modelo (S = 1,000) y SecProof-2B-Preview (S = 0,997), equivalen a uno o dos casos y no demuestran superioridad del 4B sobre el 2B en código real.

## Requisitos de hardware

- El adaptador pesa 0,1 GB, pero la inferencia exige cargar el modelo base Qwen3.5-4B completo; el coste real lo domina el base.
- VRAM estimada (cálculo a partir de los 4B parámetros del base, no publicada por el autor): en FP16 en torno a 8-9 GB para pesos más overhead; en 8 bits aproximadamente 4-5 GB; en 4 bits aproximadamente 2,5-3 GB. Son estimaciones, no cifras verificadas.
- El prompt incluye el repositorio completo renderizado como bloques `=== path ===`, por lo que la caché KV puede crecer de forma significativa con repositorios grandes; conviene presupuestar VRAM adicional.
- GPU consumer: cabe en RTX 4090 (24 GB) y RTX 3090 con holgura en FP16; en 4 bits podría ejecutarse en GPUs de 8-12 GB, siempre sujeto al tamaño del prompt.
- GPU de datacenter: A100 40/80 GB y H100 para despliegues con batching y repositorios largos.
- Opciones de despliegue: `transformers` + `peft` (vía documentada por el autor, con `inference.py`), vLLM o TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama solo tras fusionar el adaptador en los pesos del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | S (dev) | T4 both-pass | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-SecProof-4B-Preview | 4B (base) + LoRA | No disponible | 1,000 | 68/68 | Apache-2.0 | Hugging Face |
| Thaki-SecProof-2B-Preview | 2B (base) + LoRA | No disponible | 0,997 | No disponible | No disponible | Hugging Face |
| Qwen/Qwen3.5-4B sin adaptador | 4B | No disponible | 0,224 | 0,00 | No disponible | Hugging Face |

El hermano de 2B comparte datos, receta, formato de prompt y contrato de salida, y su diferencia de S (0,997 frente a 1,000) equivale a uno o dos casos del conjunto de desarrollo, según el autor. No se dispone de información sobre otros modelos comparables especializados en auditoría de seguridad de runtimes de agentes.

## Limitaciones y advertencias

- **Research preview**: el autor declara explícitamente que no está listo para producción ni validado para uso operativo en seguridad.
- **Resultados solo in-distribution**: los casos de desarrollo provienen del mismo generador sintético y de las mismas 12 fronteras que el entrenamiento. Los duplicados exactos y los esqueletos sin identificadores entre train y dev son 0 y los *worlds* son disjuntos (487 train, 44 dev, 0 compartidos), pero las 14 plantillas de bug y las 12 fronteras aparecen en ambos conjuntos: eso no es independencia de distribución.
- **Test sellado no ejecutado**: se prevé una única ejecución tras seleccionar todos los miembros de la familia; solo sus resultados de T1 y T4 se usarán para un veredicto final.
- **Sesgo de tipo de tarea en T4/T5**: en estos datos todos los veredictos gold de T4 son `confirmed` (68/68) y todos los de T5 son `rejected` (72/72), por lo que el modelo puede apoyarse en una pista del tipo de tarea; para T4 la métrica significativa es la tasa de parches que pasan ambas pruebas en sandbox.
- **Una sola ejecución de entrenamiento**: no se ha medido la varianza entre semillas.
- **Repositorios sintéticos y pequeños**: los codebases reales son más grandes, más desordenados y con patrones que el generador no produce; la generalización a código independiente no está verificada.
- **Fuera de alcance**: caza general de CVE, bugs de seguridad de memoria, código que no sea Python, repositorios reales de gran tamaño y cualquier frontera no listada. En esos casos el autor avisa de salida poco fiable.
- **Idioma**: solo inglés; no se ha validado el comportamiento en castellano ni en otros idiomas.
- **Formato rígido**: el adaptador solo fue entrenado con el layout v2 de `secproof_prompt.py`; alterar el prompt o reparar claves después de la generación invalida los resultados reportados.
- **Riesgo de alucinación**: aunque el diagnóstico de evidencia apunta a 0,000 elementos sobre código inexistente en desarrollo, esa cifra procede del mismo conjunto sintético y no garantiza anclaje correcto en repositorios reales.
- **Licencia**: Apache-2.0 sobre el adaptador; conviene verificar por separado la licencia del modelo base Qwen/Qwen3.5-4B antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-SecProof-4B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano de 2B: https://huggingface.co/ThakiCloud/Thaki-SecProof-2B-Preview
- Tarjeta en coreano: `MODEL_CARD.ko.md` dentro del repositorio del modelo
- Script de inferencia: `inference.py` (repositorio del modelo)
- Constructor de prompt: `secproof_prompt.py` (repositorio del modelo)
- Ejemplo de entrada: `examples/t1_rag_tenant_isolation.json` (repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
