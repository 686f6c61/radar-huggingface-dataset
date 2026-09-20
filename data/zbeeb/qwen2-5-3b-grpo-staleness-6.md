# zbeeb/Qwen2.5-3B-GRPO-Staleness-6

## Resumen

Qwen2.5-3B-GRPO-Staleness-6 es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen2.5-3B, publicado por el usuario zbeeb en HuggingFace. El modelo parte de una revisión fijada del base (3.085.938.688 parámetros) y se ha entrenado con GRPO (Group Relative Policy Optimization) sobre un dataset de matemáticas de 17.005 filas derivado de DAPO. El sufijo "6" del nombre hace referencia al límite de staleness (max_off_policy_steps = 6), es decir, la antigüedad máxima permitida a la política de rollout durante el entrenamiento, no a la longitud de decodificación ni al número de pasos.

Se trata de un checkpoint correspondiente al paso 1.000 de un entrenamiento de parámetros completos ejecutado con PrimeRL v0.9.0. El interés principal es doble: por un lado, es un modelo pequeño (3B) especializado en razonamiento matemático con formato de respuesta verificable; por otro, es un artefacto de investigación con trazabilidad inusualmente detallada, ya que el autor publica configuraciones de entrenamiento, manifiestos de exportación y verificaciones de finalización de job junto con los pesos.

La relevancia actual radica en su utilidad como caso de estudio reproducible sobre RL con política desincronizada (staleness) en modelos pequeños, y como generador de soluciones matemáticas paso a paso en inglés y chino. No incluye modo de razonamiento extendido explícito, visión, audio ni documentación de tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5; detalle de capas y cabezas no disponible en la información proporcionada) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó 4.096 tokens de contexto total y hasta 3.072 tokens de completion. El autor no reclama ningún resultado a 8K |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos Safetensors en precisión completa (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Otra; license_name: qwen-research (se incluye el LICENSE del modelo base sin cambios) |
| Formato de pesos | Safetensors fragmentado (sharded), exportado sin pérdida desde el checkpoint de entrenamiento; embeddings atados |
| Tamaño del repositorio | 12,4 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Tokens de parada | 151645 (`<|im_end|>`) y 151643 (`<|endoftext|>`) según `generation_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen2.5-3B, un transformer decoder-only denso de 3.085.938.688 parámetros. El ajuste es de parámetros completos, no LoRA ni adaptadores: se exportan los pesos completos en Safetensors fragmentado, con comprobaciones de procedencia del paso 1.000, tensores finitos, recarga estricta, embeddings atados, ida y vuelta del tokenizer e igualdad de logits en una sonda de CPU antes y después de la serialización. El estado del optimizador permanece en el checkpoint de origen y no se publica.

El entrenamiento se realizó con PrimeRL v0.9.0 durante 1.000 actualizaciones, con batch size 64, group size 8, semilla 42, AdamW con learning rate 1e-6, 30 actualizaciones de warmup, PPO clip de 0,2 y sin penalización KL de referencia. La recompensa es determinista y puntúa la equivalencia matemática de la respuesta terminal, con contexto total de 4.096 tokens y hasta 3.072 tokens de completion. El límite de staleness se fija en 6 pasos fuera de política, lo que restringe la edad de la política de rollout, no la longitud de generación. El dataset de entrenamiento es zbeeb/Staleness-GRPO-DAPO-Math-17k, con 17.005 filas, filtrado contra los conjuntos de evaluación utilizados (el propio autor advierte que este filtrado no demuestra ausencia de contaminación por preentrenamiento ni de todos los casi-duplicados).

Un detalle relevante para la reproducibilidad es la topología de cómputo: el tramo original usó dos GPU de entrenador y dos de inferencia con tensor parallel de 2; la recuperación reanudó estado completo (modelo, optimizador, scheduler y progreso) desde el paso 775 manteniendo las dos GPU de entrenador y pasando a una sola GPU de inferencia con tensor parallel de 1 hasta el paso 1.000, con un tiempo de espera de arranque de 7.200 segundos. El autor advierte explícitamente que la topología de GPU varía entre brazos del experimento, por lo que las comparaciones entre distintos límites de staleness no son ablaciones puras, y que los ejecuciones con límite alto no son continuaciones de las de límite bajo.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Razonamiento matemático con cadena de pensamiento: el formato esperado termina en `\boxed{...}` o en una línea final `Final answer: ...`, que es lo que puntúa la recompensa de entrenamiento.
- Resolución de problemas de competición: conjuntos tipo MATH500, AMC, AIME, Minerva y OlympiadBench, con precisión variable y tasas de truncado documentadas.
- Decodificación tanto greedy como muestreada (el autor reporta ambas, con 1 y 8 completions por pregunta respectivamente).
- Generación de explicaciones paso a paso intermedias, útil como material didáctico o como datos sintéticos de razonamiento.
- No se documenta soporte de tool calling ni de function calling en la información proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- No se documenta modo de pensamiento explícito, visión, audio ni otras modalidades.
- El entrenamiento se centró exclusivamente en recompensa de corrección matemática terminal, sin objetivo declarado de preservar capacidades generales ni de alineación de seguridad.

## Casos de uso

- Plataformas educativas de matemáticas: el modelo genera soluciones paso a paso con respuesta final en formato parseable (`\boxed{}` o `Final answer:`), lo que permite corregir automáticamente la respuesta del alumno comparando la equivalencia matemática del resultado terminal. Es adecuado por su tamaño reducido y su formato de salida consistente.
- Evaluación automática de razonamiento matemático: puede integrarse como generador de referencia en pipelines que evalúan a otros modelos sobre MATH500, AMC o AIME, usando los mismos hiperparámetros de decodificación reportados (3.072 tokens de salida para MATH500/AMC/AIME, 2.048 para Minerva y OlympiadBench).
- Generación de datos sintéticos de razonamiento: dado su formato de respuesta verificable y su capacidad de producir cadenas de razonamiento largas, sirve para crear pares problema-solución que después se filtran por corrección; conviene ser consciente de sus tasas de acierto para calibrar el filtrado.
- Investigación en RL con política desincronizada: el repositorio acompaña `training-config.json` y `export-manifest.json`, lo que permite replicar o auditar experimentos sobre el efecto del límite de staleness en modelos pequeños de 3B.
- Asistente conversacional bilingüe inglés-chino con foco técnico-matemático: soporta la plantilla de chat de Qwen2.5 y conversaciones multi-turno, adecuado para consultas de cálculo, álgebra y problemas de competición en ambos idiomas.
- Despliegue de bajo coste en una sola GPU consumer: con pesos en bfloat16 el modelo ocupa aproximadamente 6,2 GB, por lo que cabe en tarjetas de 12 GB o más, lo que permite ofrecer asistencia matemática en local sin depender de APIs externas.
- Servicio gestionado mediante HuggingFace Inference Endpoints: el repositorio está marcado como `endpoints_compatible` y `text-generation-inference`, lo que facilita su publicación como endpoint de generación de texto.

## Benchmarks y rendimiento

Resultados publicados por el autor, correspondientes a la política final del paso 1.000 durante la ejecución de entrenamiento (no a una evaluación independiente del artefacto exportado). Las filas greedy usan una completion por pregunta; las filas muestreadas usan ocho completions por pregunta con temperatura 0,6 y reportan exactitud media de respuesta, no pass@8. Los nueve conjuntos finales registraron cero errores de evaluación.

| Benchmark | Completions | Precisión | Truncado |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 10,00 % | 20,00 % |
| aime24-sampled | 240 | 5,83 % | 9,17 % |
| aime25-pass1 | 30 | 3,33 % | 0,00 % |
| aime25-sampled | 240 | 3,33 % | 2,50 % |
| aime26-sampled | 240 | 1,67 % | 7,50 % |
| amc23-pass1 | 40 | 35,00 % | 7,50 % |
| math500-pass1 | 500 | 64,60 % | 2,80 % |
| minerva-pass1 | 272 | 26,84 % | 2,21 % |
| olympiadbench-pass1 | 675 | 28,30 % | 7,85 % |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos ni métricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 6,2 GB (estimación a 2 bytes por parámetro sobre 3.085.938.688 parámetros), más caché KV y overhead del runtime.
- Pesos en fp32: aproximadamente 12,3 GB (coherente con el tamaño de repositorio de 12,4 GB, aunque el autor no especifica el dtype almacenado).
- Cuantización a 8 bits: en torno a 3,1 GB; a 4 bits, en torno a 1,6 GB. Son estimaciones de cálculo, no hay cuantizaciones publicadas ni archivos GGUF en el repositorio.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 o RTX 4090 puede albergar los pesos en bfloat16, con margen mayor si se cuantiza.
- GPU de datacenter: A100 o H100 son adecuadas para servicio concurrente o para tensor parallel; el entrenamiento original usó tensor parallel de 2 con dos GPU de inferencia y posteriormente tensor parallel de 1.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (ejemplo oficial del autor), y text-generation-inference / HuggingFace Inference Endpoints por los tags del repositorio. No se confirma compatibilidad oficial con vLLM, llama.cpp u Ollama en la información disponible, y la ausencia de GGUF dificulta el uso en llama.cpp u Ollama sin conversión previa.
- Al desplegar, hay que fijar explícitamente los tokens de parada 151645 y 151643 si el motor de servicio ignora `generation_config.json`.
- Latencia y throughput: no disponible.
- Consideración de latencia: el uso previsto genera hasta 3.072 tokens de completion por respuesta, lo que implica tiempos de respuesta altos en comparación con generación corta, especialmente en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-GRPO-Staleness-6 (este modelo) | 3,09 B (denso) | No disponible; entrenamiento con 4.096 tokens | qwen-research (other) | MATH500 64,60 % pass1; AMC23 35,00 % pass1; AIME24 10,00 % pass1 | Safetensors en HuggingFace |
| Qwen/Qwen2.5-3B (modelo base) | 3,09 B (denso) | No disponible en la información proporcionada | No disponible en la información proporcionada (el LICENSE incluido en este repositorio es el del base) | No disponible | Pesos públicos; revisión fijada referenciada por este ajuste |
| Qwen2.5-Math-1.5B | 1,5 B (denso) | No disponible | No disponible en la información proporcionada | No disponible | El autor lo menciona como familia distinta: el 1.5B usa Qwen2.5-Math, mientras que este 3B usa Qwen2.5 general, por lo que las diferencias entre ambos no son atribuibles solo al tamaño |
| Otros checkpoints de la serie Staleness del mismo autor | 3,09 B (denso) | No disponible | qwen-research (other) | No disponible en la información proporcionada | Según el autor, las ejecuciones con límite de staleness alto no son continuaciones de las de límite bajo |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Precisión absoluta baja en problemas de competición: 3,33 % en AIME25 pass1 y 1,67 % en AIME26 muestreado, con un 10,00 % en AIME24. No es un modelo fiable para matemáticas de nivel olímpico.
- Tasas de truncado notables en varios conjuntos (20,00 % en aime24-pass1, 9,17 % en aime24-sampled, 7,85 % en olympiadbench-pass1), lo que indica respuestas que agotan el presupuesto de tokens sin cerrar la solución.
- Los resultados son de ejecución de entrenamiento, no de una evaluación independiente del artefacto exportado; el propio autor lo señala explícitamente.
- El dataset de entrenamiento se filtró contra los conjuntos de evaluación, pero el autor advierte que esto no demuestra ausencia de contaminación por preentrenamiento ni de todos los casi-duplicados.
- Idiomas limitados a inglés y chino; no hay evidencia de rendimiento en castellano.
- Licencia qwen-research (license_name: other) heredada del LICENSE del modelo base. Conviene revisar ese LICENSE antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache 2.0 y las licencias de investigación de Qwen suelen restringir el uso comercial.
- Entrenamiento de RL sin penalización KL de referencia y con recompensa exclusivamente matemática, lo que puede haber alejado la política del modelo base; no se documentan evaluaciones de capacidades generales, de seguimiento de instrucciones ni de seguridad.
- No se documenta soporte de tool calling, function calling ni uso agéntico. Un motor que dependa de estas capacidades no debería asumirlas.
- Riesgo de alucinación en el razonamiento intermedio: la recompensa solo verifica la equivalencia del resultado terminal, por lo que una cadena de pasos puede ser incorrecta aunque la respuesta final sea correcta, o presentarse con apariencia de rigor sin serlo.
- Sesgos conocidos: no disponible. No hay evaluación de sesgos en la información proporcionada.
- Ausencia de cuantizaciones publicadas y de archivos GGUF: el despliegue en entornos de bajos recursos requiere conversión propia, con el consiguiente riesgo de degradación no medida.
- Configuración de parada dependiente del motor: si el motor de servicio ignora `generation_config.json`, hay que fijar manualmente los identificadores 151645 y 151643 para evitar generaciones que no terminan.
- Trazabilidad: el release depende de que existan las auditorías de entrenamiento y los marcadores de finalización publicados (`completion-verification.json`); el autor indica que no se exime de validación un job fallido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6
- Modelo base (revisión fijada): https://huggingface.co/Qwen/Qwen2.5-3B/tree/3aab1f1954e9cc14eb9509a215f9e5ca08227a9b
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuración de entrenamiento: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6/blob/main/training-config.json
- Manifiesto de exportación: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6/blob/main/export-manifest.json
- Resultados de evaluación (formato legible por máquina): https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6/blob/main/evaluation-results.json
- Verificación de finalización y recuperación: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6/blob/main/completion-verification.json
- Licencia incluida en el repositorio: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-6/blob/main/LICENSE
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (corresponden a comercios de calzado alemanes), por lo que no se han podido añadir papers, blogs ni repositorios adicionales. No se han encontrado enlaces relevantes adicionales en la información disponible.
