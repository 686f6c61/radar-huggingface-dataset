# ThakiCloud/Thaki-SecProof-8B-Preview

## Resumen
Thaki-SecProof-8B-Preview es un adaptador LoRA sobre Qwen/Qwen3-8B desarrollado por ThakiCloud, orientado a la auditoría de seguridad de runtimes de agentes de IA escritos en Python. El modelo no es un LLM de propósito general: recibe un repositorio y un límite de seguridad concreto (uno de 12 predefinidos) y devuelve un hallazgo JSON con veredicto, evidencia archivo/línea, severidad, elementos sin resolver y, en tareas de parcheo, un parche completo del archivo. Está publicado como vista previa de investigación y el propio autor lo desaconseja para uso operativo.

La familia SecProof cubre cuatro tareas: descubrimiento (T1), verificación de un hallazgo candidato (T2), parcheo (T4) y regresión de parches (T5). Los límites cubiertos son exclusivamente: `approval_single_use`, `approval_tool_binding`, `cache_tenant_isolation`, `memory_trust_promotion`, `principal_confusion`, `rag_tenant_isolation`, `rag_write_tenant_binding`, `secret_exposure_output`, `tool_action_approval_binding`, `tool_authorization_scope`, `tool_identity` y `tool_tenant_binding`. Quedan fuera de alcance la caza general de CVE, los bugs de seguridad de memoria, el código que no sea Python y los repositorios reales de gran tamaño.

La relevancia actual es doble: por un lado, demuestra que un adaptador pequeño puede imponer un contrato de salida estricto y reducir drásticamente los falsos positivos frente al modelo base; por otro, su model card documenta con inusual honestidad un fallo en el conjunto sellado de evaluación, lo que lo convierte en un caso de estudio sobre validación y generalización en modelos de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA (PEFT) |
| Parámetros totales | no disponible (adaptador LoRA sobre Qwen3-8B; el repo pesa 0,2 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor reporta pesos bf16 para inferencia) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA (librería `peft`) montado sobre Qwen3-8B, un transformer denso con atención estándar. El autor subraya que esta base pertenece a una familia distinta de la de sus hermanos SecProof-2B y SecProof-4B, que usan una base Qwen3.5 híbrida, por lo que no debe interpretarse como "el mismo modelo, más grande". El adaptador se entrena únicamente con un formato de prompt concreto (format v2): una línea `TASK:`, una línea ordenada `OUTPUT KEYS`, la instrucción, `BOUNDARIES:`, el candidato o parche opcional y el repositorio renderizado como bloques numerados `=== path ===`. Ese renderizador se validó byte a byte contra el usado en entrenamiento en los 356 casos de desarrollo (356/356 idénticos).

Los datos de entrenamiento son sintéticos, generados por el mismo generador que produce el conjunto de desarrollo, lo que convierte esas métricas en resultados dentro de distribución. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La decodificación empleada en todas las cifras publicadas es greedy, con el modo de razonamiento desactivado (`thinking off`) y `max_new_tokens=2048`. El checkpoint publicado corresponde al paso 450, seleccionado entre 150/300/450/600/750/900 mediante una regla preinscrita (esquema ≥ 0,99 por tarea y luego falsos confirmados sobre código seguro ≤ umbral).

## Capacidades
- Auditoría de seguridad de runtimes de agentes en Python limitada a 12 fronteras de seguridad nombradas.
- T1 Descubrimiento: dado un repositorio y una frontera, emite `confirmed`, `needs_validation` o `rejected` con líneas de evidencia.
- T2 Verificación: evalúa si un hallazgo candidato se sostiene, aportando evidencia.
- T4 Parcheo: genera un parche de archivo completo junto con el resultado de regresión esperado.
- T5 Regresión: determina si un parche candidato corrige el problema sin romper el comportamiento.
- Salida con contrato fijo en JSON: veredicto, evidencia archivo/línea, severidad, cuestiones sin resolver y parche cuando aplica.
- Cumplimiento estricto del esquema de salida (schema v2) en las cuatro tareas según el conjunto de desarrollo.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés, según la información disponible.

## Casos de uso
- Revisión previa a merge en pipelines de CI/CD: el adaptador puede invocarse sobre el diff de un runtime de agentes para detectar si se ha roto una frontera como `tool_authorization_scope` o `approval_single_use`, devolviendo un JSON que el pipeline puede parsear sin post-procesado.
- Triaje de hallazgos de SAST: dado un candidato generado por un analizador estático, la tarea T2 permite descartar falsos positivos aportando evidencia archivo/línea, lo que reduce el coste de revisión manual.
- Generación de parches asistida: en T4 el modelo produce un parche de archivo completo con el resultado de regresión esperado, útil como borrador para un ingeniero de seguridad que revisa el cambio antes de aplicarlo.
- Validación de parches de terceros: la tarea T5 permite comprobar si un parche propuesto por otro sistema o por un colaborador corrige el problema sin introducir regresiones funcionales.
- Formación y concienciación en seguridad de agentes: los 12 límites cubiertos sirven como catálogo de errores típicos (confusión de principal, aislamiento multi-tenant en RAG, promoción de memoria no confiable) sobre el que construir ejercicios con código sintético.
- Investigación sobre contratos de salida estructurados: el modelo es un ejemplo reproducible de cómo un LoRA pequeño fuerza un esquema JSON estricto en un modelo base que, sin adaptador, obtiene 0,00 en esquema estricto para T1, T4 y T5.
- Evaluación comparativa de metodologías de validación: la documentación del fallo en el conjunto sellado lo hace útil como referencia para diseñar protocolos de evaluación con conjuntos sellados y reglas preinscritas.

## Benchmarks y rendimiento
Resultados sobre el conjunto de desarrollo (356 casos: T1 124, T2 92, T4 68, T5 72), semilla 20261025, checkpoint paso 450, una sola ejecución. "Stock" es Qwen3-8B sin adaptador, con el mismo prompt y decodificación.

| Métrica | Stock Qwen3-8B | SecProof-8B-Preview |
|---|---|---|
| Claves requeridas en orden (T1 / T2 / T4 / T5) | 1,00 / 1,00 / 1,00 / 0,97 | 1,00 / 1,00 / 1,00 / 1,00 |
| Esquema estricto v2 (T1 / T2 / T4 / T5, diagnóstico) | 0,00 / 1,00 / 0,00 / 0,00 | 1,00 / 1,00 / 1,00 / 1,00 |
| Exactitud balanceada T1 (3 veredictos) | 0,292 | 0,983 |
| Exactitud balanceada T2 | 0,736 | 0,988 |
| T4 parche con doble aprobado en sandbox (seguridad + funcional) | 0,00 | 1,00 (68/68) |
| Falso confirmado sobre código seguro, T1+T2 | 72/141 (0,511) | 4/141 (0,028) |
| Precisión de localización de vulnerabilidad T1 (diagnóstico) | 0,000 | 1,000 |
| Evidencias que apuntan a código inexistente (diagnóstico) | 0,000 | 0,000 |
| Objetivo de selección S (media de T1 bacc, T2 bacc, T4 both-pass) | 0,343 | 0,9903 |

Errores en desarrollo, desglosados por tipo:

| Error | Significado | Recuento en dev (IC 95 % Wilson) |
|---|---|---|
| Falso confirmado, señuelo | código que parece arriesgado pero está protegido, marcado `confirmed` | 3/69 (0,043; 0,015–0,120), todos en T1 |
| Falso confirmado, corregido | código ya arreglado marcado `confirmed` | 1/72 (0,014; 0,002–0,075), T1 |
| Vulnerabilidad no detectada (False SAFE) | código vulnerable no marcado `confirmed` | 1/67, T2 |

Los cuatro falsos confirmados se concentran en `tenant_arg_override` (2), `wrong_principal_scope` (1) y `memory_untrusted_promotion` (1). El autor señala que SecProof-4B-Preview obtuvo 0/141 y 0/67 en el mismo conjunto de desarrollo, pero advierte que con una sola ejecución esa diferencia no constituye una clasificación fiable.

Resultado en el conjunto sellado: la prueba sellada (sintética, con familias de plantillas no vistas) se ejecutó una vez y el resultado fue **FAIL** en la puerta G4b. No se publican en la información disponible las cifras desagregadas de esa prueba.

## Requisitos de hardware
- VRAM estimada: aproximadamente 17 GB de memoria de GPU con pesos en bf16, según el autor.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el requisito de 17 GB encajan GPU con 24 GB o más (por ejemplo, RTX 4090, A100, H100).
- GPU de consumo: cabe en tarjetas con al menos 24 GB de VRAM en bf16; no se documentan opciones de cuantización para reducir ese requisito.
- Despliegue: el autor proporciona `inference.py` y `secproof_prompt.py` en el repositorio, con dependencias `transformers>=5.0`, `peft>=0.19`, `torch` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Thaki-SecProof-8B-Preview | Qwen3-8B (densa) | no disponible (adaptador LoRA) | no disponible | Apache 2.0 | Vista previa de investigación; fallo en conjunto sellado |
| Thaki-SecProof-4B-Preview | Qwen3.5 híbrida | no disponible (adaptador LoRA) | no disponible | no disponible en la información | Mismo dato, receta y contrato; 0/141 y 0/67 en falsos confirmados de dev |
| Thaki-SecProof-2B-Preview | Qwen3.5 híbrida | no disponible (adaptador LoRA) | no disponible | no disponible en la información | Mismo dato, receta y contrato |
| Qwen/Qwen3-8B (stock) | — | 8B | no disponible | no disponible en la información | Línea base sin adaptador; 0,00 en esquema estricto T1/T4/T5 y 0,511 de falsos confirmados |

La comparación con modelos de seguridad de propósito general no está disponible en la información proporcionada. Los tres modelos SecProof comparten formato de prompt y contrato de salida, pero el 8B usa una familia base distinta, por lo que no son intercambiables sin más.

## Limitaciones y advertencias
- El modelo está marcado explícitamente como vista previa de investigación, no listo para producción y no validado para uso operativo en seguridad.
- La prueba sellada (familias de plantillas sintéticas no vistas) se ejecutó una vez y falló la puerta G4b; la generalización a código independiente no está verificada.
- Los números de desarrollo proceden de un conjunto dentro de distribución generado por el mismo sintetizador que los datos de entrenamiento, por lo que sobreestiman el rendimiento real.
- Solo una ejecución de entrenamiento: no hay estimación de varianza entre semillas.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento es sintético y en inglés.
- Riesgo de alucinación: el modelo puede emitir un veredicto `confirmed` sobre código seguro (4/141 en desarrollo) o dejar pasar una vulnerabilidad real (1/67 en T2); el segundo tipo de error es el más peligroso en uso operativo.
- Alcance muy restringido: solo Python, solo runtimes de agentes y solo 12 fronteras nombradas; fuera de ahí el autor advierte salidas poco fiables.
- El adaptador solo funciona con el formato de prompt v2 exacto; cualquier variación en el renderizado invalida el contrato aprendido.
- Idiomas: únicamente inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero el estado de vista previa y el fallo en la evaluación sellada desaconsejan cualquier despliegue en producción.
- No se documentan tipos de cuantización, por lo que el despliegue en GPUs de menos de 24 GB requeriría trabajo adicional no soportado por el autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-SecProof-8B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo hermano 2B: https://huggingface.co/ThakiCloud/Thaki-SecProof-2B-Preview
- Modelo hermano 4B: https://huggingface.co/ThakiCloud/Thaki-SecProof-4B-Preview
- Model card en coreano: [MODEL_CARD.ko.md](./MODEL_CARD.ko.md) (relativo al repositorio del modelo)
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
