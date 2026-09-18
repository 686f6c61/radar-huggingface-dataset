# zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-8

## Resumen

Qwen2.5-Math-1.5B-GRPO-Staleness-8 es un ajuste fino de parámetros completos del modelo Qwen/Qwen2.5-Math-1.5B, publicado por el usuario zbeeb en HuggingFace. Se trata de un checkpoint del paso 1000 de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre el dataset matemático DAPO de 17.005 filas, con un límite de desfase de política (*staleness cap*) de 8 pasos fuera de política. El objetivo es mejorar la capacidad de razonamiento matemático del modelo base mediante aprendizaje por refuerzo con una recompensa determinista que evalúa la equivalencia matemática de la respuesta final.

El modelo tiene 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y mantiene la arquitectura Qwen2 densa del modelo base, sin mezcla de expertos. El entrenamiento se realizó con PrimeRL v0.9.0 durante 1000 actualizaciones, con un contexto total de 4096 tokens y hasta 3072 tokens de finalización, usando 3 GPU para el entrenador y 2 GPU para inferencia. Los pesos se exportan sin pérdida a Safetensors fragmentados.

Su relevancia es doble: por un lado, es un ejemplo reproducible de RL aplicado a modelos pequeños de matemáticas; por otro, documenta de forma inusualmente detallada la configuración de entrenamiento, el proceso de exportación y las evaluaciones finales, lo que lo convierte en un artefacto útil para investigar el efecto del *staleness* en GRPO. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (Qwen2.5-Math) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en el modelo base (configuración posicional nativa preservada; la versión publicada no configura ni valida extensión a 8K). Entrenamiento realizado con contexto total de 4.096 tokens y hasta 3.072 tokens de finalización |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos Safetensors en el dtype guardado; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 (se incluye sin cambios la licencia del modelo base) |
| Formato de pesos | Safetensors fragmentados (sharded), exportados sin pérdida desde el checkpoint; embeddings atados (*tied embeddings*) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Math-1.5B: un transformer decoder-only denso con embeddings atados, sin mecanismos de atención lineal ni estado recurrente. El checkpoint publicado no modifica la arquitectura, solo los pesos, y conserva la configuración posicional nativa del base. El ajuste se hizo sobre todos los parámetros (full-parameter fine-tuning), empezando desde la revisión fijada del modelo base con estado del optimizador nuevo, es decir, los runs con *staleness cap* superior no son continuaciones de los de cap inferior.

El entrenamiento empleó GRPO con PrimeRL v0.9.0 durante 1000 actualizaciones, con tamaño de lote 64, tamaño de grupo 8, semilla 42, optimizador AdamW con tasa de aprendizaje 1e-6, 30 actualizaciones de calentamiento y recorte PPO de 0,2. No se aplicó penalización KL contra un modelo de referencia. La recompensa es determinista y puntúa la equivalencia matemática de la respuesta final. El dataset de entrenamiento es zbeeb/Staleness-GRPO-DAPO-Math-17k, con 17.005 filas, filtrado contra los conjuntos de evaluación. La innovación metodológica central es el control del *staleness* (`max_off_policy_steps` = 8), que limita la antigüedad de la política de rollout durante el entrenamiento (no la longitud de decodificación). El proceso de exportación incluye comprobaciones de procedencia del paso 1000, tensores finitos, recarga estricta, embeddings atados, ida y vuelta del tokenizer y logits idénticos en sonda de CPU antes y después de la serialización. El estado del optimizador permanece únicamente en el checkpoint de origen. El tokenizer de entrenamiento identifica `<|im_end|>` (151645) como EOS, y el `generation_config.json` detiene la generación tanto en 151645 como en `<|endoftext|>` (151643); conviene fijar los identificadores de parada explícitamente si el motor de servicio ignora esa configuración.

## Capacidades

- Generación de texto conversacional mediante plantilla de chat (`apply_chat_template`), con roles de sistema, usuario y asistente.
- Razonamiento matemático paso a paso, con formato de respuesta guiado por el prompt: razonamiento explícito y cierre con `\boxed{...}` o una línea final `Final answer: ...`.
- Resolución de problemas de competición: aritmética, álgebra, teoría de números, combinatoria y problemas de nivel OlympiadBench.
- Generación determinista (greedy) o muestreada, con parada configurable en múltiples tokens EOS.
- Capacidad multilingüe limitada a inglés y chino, tanto en instrucciones como en respuestas.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta modo de pensamiento (*thinking mode*) separado, visión, audio ni otras modalidades.
- No se documentan capacidades explícitas de agente o razonamiento multi-paso más allá de la cadena de pensamiento matemática generada en una sola respuesta.

## Casos de uso

- Generación de soluciones matemáticas para plataformas educativas: el modelo produce razonamiento paso a paso en inglés o chino, con la respuesta final delimitada por `\boxed{}`, lo que permite extraerla automáticamente y compararla con la solución de referencia.
- Construcción de datasets sintéticos de razonamiento matemático: dado su tamaño reducido y su licencia Apache 2.0, se puede desplegar en lote para generar trazas de razonamiento que después se filtren por corrección de la respuesta final.
- Evaluación comparativa de métodos de RL: sirve como artefacto de referencia para estudiar el efecto del *staleness cap* en GRPO, ya que el autor publica configuración, manifiesto de exportación y resultados de evaluación.
- Tutor conversacional de matemáticas de bajo coste: con 1,54 B de parámetros puede servirse en una única GPU de gama media, gestionando diálogos multi-turno dentro de la ventana de 4.096 tokens.
- *Fine-tuning* posterior específico de dominio: al ser un modelo pequeño con pesos en Safetensors, es viable reentrenarlo o adaptarlo con LoRA sobre datos propios de un temario concreto.
- *Scripts* educativos sobre seguridad de evaluación: al incluir procedencia del paso, verificaciones de exportación y auditoría de finalización, el repositorio se puede usar como caso de estudio de trazabilidad de artefactos de entrenamiento.
- *Benchmarking* interno de infraestructura: su tamaño permite medir latencia y *throughput* de motores de inferencia (transformers, vLLM, TGI) sin consumir grandes recursos.

## Benchmarks y rendimiento

Resultados de la ejecución final de entrenamiento (política final, paso 1000), tal como los publica el autor. Las filas *pass1* usan una finalización por pregunta; las filas *sampled* usan ocho finalizaciones por pregunta con temperatura 0,6 y reportan la precisión media de respuesta, no pass@8. MATH500, AMC y AIME usan 3.072 tokens de salida; Minerva y OlympiadBench usan 2.048. Los nueve conjuntos finales registran cero errores de evaluación. Son resultados del run de entrenamiento, no un *benchmark* nuevo del artefacto exportado ni una comparación a 8K.

| Benchmark | Finalizaciones | Precision | Truncadas |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 10,00 % | 20,00 % |
| aime24-sampled | 240 | 9,17 % | 7,92 % |
| aime25-pass1 | 30 | 10,00 % | 0,00 % |
| aime25-sampled | 240 | 3,75 % | 3,33 % |
| aime26-sampled | 240 | 7,08 % | 3,33 % |
| amc23-pass1 | 40 | 45,00 % | 5,00 % |
| math500-pass1 | 500 | 63,60 % | 2,80 % |
| minerva-pass1 | 272 | 18,01 % | 13,97 % |
| olympiadbench-pass1 | 675 | 29,63 % | 6,22 % |

No se proporcionan en la informacion disponible resultados comparativos frente al modelo base ni frente a otros modelos en los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más la caché KV; en la práctica unos 4-5 GB con contexto de 4.096 tokens y lotes pequeños. El repositorio ocupa 6,2 GB, pero eso incluye los ficheros publicados, no el pico de VRAM de inferencia.
- Cuantización a 8 bits: alrededor de 1,6 GB de pesos; a 4 bits, alrededor de 0,8 GB (estimaciones por tamaño de parámetros; el autor no publica pesos cuantizados).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes. Para servicio con concurrencia, A100 o H100 ofrecen margen amplio, aunque están sobredimensionadas para 1,54 B de parámetros.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 6 GB o más de VRAM, e incluso en 4 GB si se cuantiza.
- Opciones de despliegue: transformers (uso documentado en la model card con `device_map="auto"` y `dtype=torch.bfloat16`), vLLM, TGI (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`) y llama.cpp u Ollama si se convierte previamente a GGUF, conversión que el autor no publica.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de latencia ni de tokens por segundo.
- Nota de configuración: el entrenamiento usó 3 GPU para el entrenador y 2 GPU para inferencia; esa topología es irrelevante para el despliegue del checkpoint exportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-GRPO-Staleness-8 | 1,54 B | 4.096 tokens (nativo preservado, sin extensión 8K validada) | Ajuste completo con GRPO, cap de staleness 8, 1000 pasos | Apache 2.0 | HuggingFace, Safetensors |
| Qwen/Qwen2.5-Math-1.5B (base) | 1,54 B | 4.096 tokens | Modelo base de matemáticas, sin RL adicional en esta ficha | Apache 2.0 | HuggingFace, Safetensors |
| Otros checkpoints GRPO del mismo autor con caps superiores | No disponible | No disponible | GRPO con `max_off_policy_steps` mayor; no son continuaciones de este run | No disponible | No disponible |
| Alternativas de ~1,5 B orientadas a razonamiento matemático | No disponible | No disponible | No disponible | No disponible | No disponible |

El autor advierte explícitamente de que la comparación con el modelo de 3 B de la misma familia no es limpia, porque el de 3 B parte de Qwen2.5 general mientras que el de 1,5 B parte de Qwen2.5-Math; por tanto, las diferencias entre familias no son atribuibles solo al tamaño. No se dispone de datos de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al ser un modelo entrenado con RL sobre un dataset matemático filtrado, su comportamiento fuera del dominio matemático no está caracterizado.
- Riesgo de alucinación: elevado en tareas de razonamiento multi-paso, como evidencian las tasas de truncamiento registradas (hasta 20,00 % en aime24-pass1 y 13,97 % en minerva-pass1) y las precisiones bajas en AIME (3,75 %-10 %).
- Métricas: las cifras publicadas son resultados del run de entrenamiento, no de una evaluación independiente del artefacto exportado. El autor lo señala expresamente.
- Contaminación: los datos de entrenamiento se filtraron contra los conjuntos de evaluación, pero el autor indica que esto no establece la ausencia de contaminación por preentrenamiento ni de duplicados cercanos.
- Contexto limitado: 4.096 tokens nativos. La versión publicada no configura ni valida una extensión a 8K, por lo que no debe asumirse ese contexto en producción.
- Idioma: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas.
- Formato de salida: para extraer la respuesta final de forma fiable hay que forzar en el prompt el cierre con `\boxed{...}` o `Final answer: ...`; si el motor de servicio ignora `generation_config.json`, hay que fijar los tokens de parada 151645 y 151643 manualmente.
- Integridad del run: el validador posterior original falló porque exigía la presencia en disco de un checkpoint de reanudación del paso 375 que quedaba fuera de la política de retención. Se ejecutó una auditoría de publicación independiente con las comprobaciones originales de edad de política, métricas finitas, evaluación final y checkpoint final. El estado del optimizador no se incluye en el artefacto exportado.
- Licencia: Apache 2.0, sin restricciones adicionales conocidas para uso comercial, e incluye la licencia del modelo base sin cambios.
- Advertencia general: el modelo se publica como modificación GRPO de una revisión concreta del modelo base; para reproducibilidad conviene fijar esa revisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuración de entrenamiento (en el repositorio): `training-config.json`
- Manifiesto de exportación (en el repositorio): `export-manifest.json`
- Resultados de evaluación en formato legible por máquina (en el repositorio): `evaluation-results.json`
- Verificación de finalización (en el repositorio): `completion-verification.json`
- Licencia del modelo base (en el repositorio): `LICENSE`
- Paper, blog o repositorio de PrimeRL: no disponible en la informacion proporcionada.
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo: tratan sobre el uso del punto ortografico en ingles y no aportan informacion tecnica.
