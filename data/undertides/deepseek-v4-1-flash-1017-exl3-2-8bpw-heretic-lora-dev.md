# UnderTides/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw-heretic-lora-dev

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw-heretic-lora-dev es un adaptador LoRA experimental de rango 1 desarrollado por el usuario UnderTides sobre el modelo cuantizado `sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw`. No se trata de un modelo completo, sino de una ablación de dirección (direction ablation) inspirada en la técnica Heretic, cuyo objetivo es reducir la tasa de rechazos (refusals) del modelo base sin degradar sus capacidades. El repositorio no contiene pesos base ni prompts de inferencia añadidos.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de modificación del comportamiento de rechazo mediante proyección de baja dimensión sobre las estadísticas de activación; por otro, expone las limitaciones de un artefacto que no superó su umbral de calidad predeclarado (screening de rechazo/normal/KL: False). El adaptador se publica como material de desarrollo, no como versión lista para producción.

El modelo base pertenece a la familia DeepSeek V4.1 Flash, distribuido en formato EXL3 (cuantización de 2,8 bits por peso) y con soporte multimodal (visión) y de decodificación especulativa (drafter). El adaptador solo afecta a las capas 2-39 en el módulo `wo_b`, dejando sin modificar expertos, Engram, visión, LM head y drafter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 sobre transformer DeepSeek V4.1 Flash (base cuantizada EXL3) |
| Parametros totales | no disponible (el adaptador es de rango 1; el tamaño del base no se especifica en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como máximo medido; perfil de prueba verificado con límite de 16.384 tokens |
| Tipos de cuantizacion | Base en EXL3 2,8 bpw; adaptador en FP32 (factores A y B) |
| Idiomas soportados | en, zh |
| Licencia | MIT (pesos base); parches de runtime Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); base en EXL3 |

## Arquitectura y entrenamiento

El adaptador se construye mediante un proceso sin entrenamiento por gradiente: se capturan estadísticas de activación (8.000 prompts de captura de dirección, 4.000 del lado de rechazo y 4.000 ordinarios, mitad en inglés y mitad en chino) y se calcula una proyección de baja dimensión. Concretamente, se captura solo el último token del prompt en 40 capas × cuatro flujos mHC × 5.120 valores BF16, se promedian los flujos mHC en CPU, se acumulan las medias de clase en FP64, se elimina la componente de la media normal de la diferencia normalizada y se vuelve a normalizar. Después se decodifica cada bloque cuantizado `wo_b` y se exportan `A=dᵀW` y `B=-2,5d`, dando `ΔW=BA` con rango 1, alpha 1 y factores FP32, sin normalización por filas.

Los datos de captura provienen de seis fuentes: OpenSafetyLab/Salad-Data (1.083 prompts), PKU-Alignment/PKU-SafeRLHF (917), bench-llm/or-bench (1.871), HuggingFaceH4/no_robots (129), thu-coai/Safety-Prompts (2.410) y m-a-p/COIG-CQIA (1.590). Se reservaron aparte 400 prompts para ajuste y 600 para evaluación final. El límite de tokens por prompt fue de 512 sin truncamiento. No se usaron las fuentes AI2 con acceso restringido. El adaptador solo afecta a las capas 2-39; expertos, Engram, visión, LM head y drafter permanecen sin adaptar.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, heredadas del modelo base DeepSeek V4.1 Flash.
- Reducción de rechazos explícitos: en la evaluación held-out, la tasa de rechazo pasó de 112/150 (74,7%) a 0/150 (0,0%) en inglés y de 36/150 (24,0%) a 0/150 (0,0%) en chino.
- Mantenimiento de capacidades medidas: MMLU 87,0% → 86,0%, GSM8K 98,0% → 99,0%, MBPP 88,0% → 89,0% (subconjuntos locales fijos).
- Soporte multimodal de visión heredado del base (hasta ocho imágenes en el perfil de prueba verificado).
- Compatibilidad con decodificación especulativa mediante el drafter del base (no adaptado).
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazos: el adaptador sirve como artefacto reproducible para estudiar cómo una ablación de dirección de rango 1 modifica la tasa de rechazo sin reentrenar el modelo, con hashes de receta y pesos incluidos.
- Evaluación comparativa de técnicas Heretic: permite contrastar la receta de UnderTides con la de pqhaz sobre la misma base EXL3 2,8 bpw, usando los conjuntos held-out documentados.
- Desarrollo de asistentes bilingües en/zh con menor tasa de rechazo: útil en prototipos donde el base rechaza en exceso consultas legítimas, siempre que se asuma el riesgo de seguridad y la falta de screening superado.
- Reproducción de experimentos de cuantización EXL3: el repositorio documenta el pipeline de decodificación de bloques `wo_b` y la exportación de factores FP32, útil para quienes trabajan con packs EXL3.
- Pruebas de integración de LoRA en vLLM: el runtime incluido (`runtime/apply.py`) valida la carga de adaptadores LoRA sobre módulos `wo_b` con `--enable-lora --max-lora-rank 8`, sirviendo como referencia de despliegue.
- Análisis de degradación de capacidades: los resultados MMLU/GSM8K/MBPP con diferencias de ±1 pp permiten estudiar el coste de la ablación en tareas de conocimiento, matemáticas y código.
- Estudio de sesgos de rechazo por idioma: la asimetría base (74,7% en inglés frente a 24,0% en chino) es un caso concreto para analizar cómo varía el comportamiento de seguridad según el idioma.

## Benchmarks y rendimiento

Resultados de la evaluación held-out publicada por el autor (protocolo local zero-shot, no comparable con leaderboards de distinto muestreo):

| Benchmark | Base | Dev | Diferencia |
|---|---:|---:|---:|
| MMLU (500) | 87,0% | 86,0% | -1,0 pp |
| GSM8K (100) | 98,0% | 99,0% | +1,0 pp |
| MBPP (100, v2 con interfaz pública) | 88,0% | 89,0% | +1,0 pp |

Tasas de rechazo explícito held-out (150 prompts del lado de rechazo por idioma):

| Idioma | Base | Dev |
|---|---:|---:|
| en | 112/150 (74,7%) | 0/150 (0,0%) |
| zh | 36/150 (24,0%) | 0/150 (0,0%) |

El screening predeclarado de rechazo/normal/KL sobre el conjunto held-out no se superó (False). La condición de declive de capacidad ≤2 pp en cada subconjunto sí se cumplió (True). El autor indica que el fallo del umbral de calidad se reporta como limitación del dev y no se reclasifica como aprobado. La puntuación de rechazo es una heurística léxica bilingüe, no un juez semántico de completaciones dañinas.

## Requisitos de hardware

- Verificado por el autor en vLLM v2.0/v5 parcheado con el patch EXL3/multimodal LoRA incluido, en TP2 sobre dos DGX Sparks.
- Perfil de prueba funcional: `vllm serve` con ejecución eager, dos secuencias, límite de contexto de 16.384 tokens, batch de scheduling de 2.048 tokens, 0,5 GiB de KV por rango y hasta ocho imágenes. Son ajustes del perfil probado, no un máximo medido.
- No validado con vLLM estándar (stock), TensorFold, GGUF ni otros packs de cuantización.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el único entorno verificado son dos DGX Sparks en TP2.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM parcheado con registro nativo de LoRA (`--enable-lora --max-lora-rank 8 --lora-target-modules wo_b --lora-modules dev=/ruta/al/adaptador`), compartiendo un único base con el ID del modelo sin adaptar y usando rutas inmutables del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Rechazo en/zh | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UnderTides/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw-heretic-lora-dev | LoRA rango 1, ablación de dirección | sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw | no disponible (probado a 16.384) | 0,0% / 0,0% | MIT | Hugging Face, 0 descargas |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | Receta Heretic sobre la misma base | DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | Hugging Face |
| sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw | Base cuantizado EXL3 2,8 bpw | DeepSeek V4.1 Flash | no disponible | 74,7% / 24,0% (medido por UnderTides) | MIT | Hugging Face |

No se dispone de datos de benchmarks comparables para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El screening predeclarado de rechazo/normal/KL no se superó: el adaptador no garantiza que ninguna petición sea rechazada y puede producir completaciones dañinas.
- La evaluación de rechazo usa una heurística léxica bilingüe, no un juez semántico; los porcentajes de 0,0% deben interpretarse con cautela.
- Los benchmarks son subconjuntos locales fijos (MMLU 500, GSM8K 100, MBPP 100) con protocolo zero-shot propio, no comparables con leaderboards de distinto muestreo.
- El MBPP v2 incluye casos de test públicos en el prompt para especificar la interfaz, nunca la solución de referencia; no reproduce la evaluación original three-shot.
- Solo se validó en vLLM parcheado con el patch incluido; no funciona con vLLM estándar, TensorFold, GGUF ni otros packs sin validación adicional.
- El adaptador solo modifica el módulo `wo_b` de las capas 2-39; expertos, Engram, visión, LM head y drafter permanecen sin adaptar, por lo que el comportamiento de rechazo en esas rutas no se ve afectado.
- Idiomas limitados a inglés y chino; no se documenta soporte de otros idiomas.
- Licencia MIT para los pesos base, Apache-2.0 para los parches de runtime; las licencias de los datasets de origen se mantienen y el repositorio no redistribuye prompts ni respuestas.
- Es una versión dev con parámetros fijos, sin búsqueda de hiperparámetros ni promoción a producción; el autor lo declara explícitamente como no apto para producción.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta ficha; no hay datos disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UnderTides/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw-heretic-lora-dev
- Modelo base: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw
- Receta Heretic de pqhaz sobre la misma base: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Proyecto Heretic: https://github.com/p-e-w/heretic/tree/v1.4.0
- Dataset OpenSafetyLab/Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset PKU-Alignment/PKU-SafeRLHF: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Dataset bench-llm/or-bench: https://huggingface.co/datasets/bench-llm/or-bench
- Dataset HuggingFaceH4/no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset thu-coai/Safety-Prompts: https://github.com/thu-coai/Safety-Prompts
- Dataset m-a-p/COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
