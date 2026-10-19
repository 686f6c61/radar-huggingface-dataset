# xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF

## Resumen

Qwensploit 3.5 9B es un ajuste fino (fine-tune) orientado a ciberseguridad de la familia Qwen3.5-9B, publicado por el usuario xtools-at. El modelo parte de un merge previo del propio autor (Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic), al que se aplicó un entrenamiento supervisado con LoRA sobre 7.000 ejemplos de datos de razonamiento en seguridad, red team, código y destilaciones sintéticas. El resultado se distribuye en esta ficha únicamente en formato GGUF cuantizado, con cuatro niveles estáticos (Q2_K_L, Q4_K_M, Q6_K y Q8_0), lo que permite ejecutarlo en hardware de consumo sin GPU de datacenter.

El problema que aborda es el de un asistente especializado en tareas de seguridad ofensiva y defensiva: análisis de vulnerabilidades, revisión de código seguro, modelado de amenazas, resolución de CTF y consultas técnicas de penetration testing. Frente al modelo base, el ajuste introduce vocabulario, formatos y cadenas de razonamiento propias del dominio, además de eliminar parte de los rechazos del modelo original (las etiquetas incluyen "uncensored" y "heretic"). Es relevante ahora porque la mayoría de modelos generalistas aplican filtros que limitan este tipo de contenido, y porque el ecosistema GGUF permite desplegarlo en local, algo habitual en laboratorios de seguridad que no quieren enviar datos a APIs externas.

La arquitectura subyacente es un transformer decoder-only denso de 8.953.803.264 parámetros (≈8,95 mil millones), sin mezcla de expertos. El autor declara un contexto de entrenamiento de 8.192 tokens; la ventana nativa del modelo base no se especifica en la información disponible. El repositorio ocupa 28,3 GB y, en el momento de la consulta, registra 0 descargas y 1 like, señal de que se trata de una publicación muy reciente (creada y actualizada el 19 de octubre de 2026) sin adopción medida todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.5), ajuste LoRA y cuantización GGUF |
| Parámetros totales | 8.953.803.264 (≈8,95 mil millones), dato de safetensors del modelo base |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento declarado); ventana nativa del modelo base: no disponible |
| Tipos de cuantización | GGUF estáticos: Q2_K_L (4,8 GB), Q4_K_M (5,6 GB), Q6_K (7,4 GB), Q8_0 (9,5 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (sujeta a revisión de compatibilidad con las licencias upstream) |
| Formato de pesos | GGUF; el modelo base se publica en safetensors para transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3.5, sin componentes MoE ni arquitecturas híbridas SSM. El linaje es explícito en la model card: Qwen3.5-9B → Qwen3.5-9B-Claude-3xMerge (merge de destilaciones de razonamiento, código y razonamiento de Claude Mythos, Fable y Opus) → Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic (versión sin censura) → Qwen3.5-9B-Qwensploit-CyberSecurity, del que esta ficha es la cuantización GGUF estática.

El ajuste se hizo con LoRA supervisado durante 1 época sobre 7.000 ejemplos y 350 de evaluación, con longitud máxima de entrada de 8.000 caracteres/tokens según la mezcla declarada, contexto de 8.192, learning rate 2e-4, batch efectivo 4x8, rango LoRA 16, alpha 32, dropout 0,02, módulos objetivo "all", optimizador AdamW de 8 bits, scheduler lineal y weight decay 0,002, sobre una NVIDIA A100 de 40 GB. La mezcla de datos es: CyberSec-Reasoning-Premium (2.305 ejemplos, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). No se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, modo thinking explícito) más allá del ajuste LoRA y la cuantización.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas de ciberseguridad, con cadenas de razonamiento propias del dominio.
- Análisis de vulnerabilidades y revisión de código seguro: identificación de patrones inseguros, explicación de impacto y propuesta de mitigaciones.
- Conocimiento de red team y penetration testing: tácticas, herramientas y procedimientos descritos en los datasets de entrenamiento.
- Generación y explicación de código, incluyendo scripts de explotación y utilidades de reconocimiento en entornos autorizados.
- Razonamiento multi-paso derivado de los datos de destilación (Claude Mythos y Qwen3.8-Max), aplicable a resolución de CTF y análisis de incidentes.
- Respuestas conversacionales multi-turno (etiqueta "conversational" y compatibilidad con endpoints declarada en la metadata).
- Modelo "uncensored"/"heretic": menor tasa de rechazos ante consultas de seguridad ofensiva que el modelo base.
- Capacidad multimodal: la metadata declara el pipeline `image-text-to-text`, pero la model card no documenta visión, no la evalúa y no aporta ejemplos con imágenes; no confirmado.
- Idiomas: únicamente inglés declarado; el comportamiento en castellano no está evaluado ni garantizado.

## Casos de uso

- Triaje de vulnerabilidades en pipelines de seguridad: dado un aviso o un fragmento de código, el modelo genera una explicación del fallo, la superficie de ataque y una propuesta de parche; su contexto de 8.192 tokens permite incluir el fichero afectado completo en muchos casos.
- Revisión de código seguro en CI/CD: integrado vía llama.cpp u Ollama como paso de revisión, marca patrones inseguros (inyección SQL, deserialización, gestión de secretos) en el diff antes del merge.
- Modelado de amenazas y análisis de incidentes defensivo: a partir de una descripción de arquitectura o de un log, produce hipótesis de compromiso y consultas de detección, aprovechando los ejemplos de CyberSec-Reasoning-Premium.
- Ejercicios de red team autorizados: generación de procedimientos y comandos para un alcance definido por contrato, con la ventaja de ejecutarse en local para no exponer datos del cliente a una API de terceros.
- Entrenamiento y CTF: resolución guiada de retos, explicación de técnicas y generación de write-ups; el ajuste incluye ejemplos explícitos de CTF en las etiquetas.
- Asistente de documentación de seguridad interna: redacción de políticas, guías de hardening y checklist de cumplimiento a partir de notas técnicas del equipo.
- Laboratorio de investigación de prompts y seguridad de IA: al ser un modelo "uncensored" de 9B en GGUF, sirve como sujeto de pruebas para estudiar tasas de rechazo, fuga de conocimiento ofensivo y eficacia de guardarraíles en modelos pequeños desplegados en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones específicas de ciberseguridad (por ejemplo, CyberSecEval); solo métricas de pérdida durante el entrenamiento, que el propio autor advierte que no miden precisión ni seguridad.

| Métrica | Paso 40 | Paso 80 | Paso 120 | Paso 160 | Paso 219 (final) |
|---|---:|---:|---:|---:|---:|
| Pérdida de entrenamiento | 0,708 | 0,654 | 0,574 | 0,512 | 0,476 |
| Pérdida de evaluación | 0,676 | 0,569 | 0,522 | 0,496 | 0,481 |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de fichero más caché KV, no publicada por el autor): Q2_K_L ≈ 6-7 GB; Q4_K_M ≈ 7-8 GB; Q6_K ≈ 9-10 GB; Q8_0 ≈ 11-12 GB.
- GPU de consumo: sí cabe. RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M con contexto moderado; RTX 4090 24 GB para Q8_0 con los 8.192 tokens de contexto completos.
- GPU de datacenter: A100 40 GB (la usada en el entrenamiento LoRA) o H100 para servir varias instancias o trabajar en precisión completa con el modelo base en safetensors.
- Despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las vías naturales para los ficheros GGUF; el soporte en vLLM o TGI para este GGUF concreto no está documentado.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo publicadas para ninguno de los cuatro cuantizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwensploit 9B GGUF (esta ficha) | ≈8,95 B | 8.192 (entrenamiento) | GGUF Q2-Q8 | Apache-2.0 (revisar upstream) | Ciberseguridad y red team, cuantizado |
| Qwensploit 9B (modelo base del GGUF) | ≈8,95 B | 8.192 (entrenamiento) | safetensors + LoRA | Apache-2.0 (revisar upstream) | Mismo ajuste, precisión completa |
| Qwensploit 4B | ≈4 B (nominal) | no disponible | no disponible en esta ficha | Apache-2.0 (según autor) | Misma receta, menor tamaño |
| Qwensploit 2B | ≈2 B (nominal) | no disponible | no disponible en esta ficha | Apache-2.0 (según autor) | Misma receta, orientado a hardware mínimo |
| Qwen3.5-9B (modelo de origen) | ≈8,95 B | no disponible | safetensors | no disponible en esta ficha | Propósito general, con filtros |

No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estas variantes; la comparación es de tamaño, formato y enfoque.

## Limitaciones y advertencias

- No hay evaluación independiente: el autor indica explícitamente que el rendimiento en tareas de seguridad del mundo real no está establecido y que la pérdida de entrenamiento no es una medida de precisión.
- Riesgo de alucinación técnica: puede generar explicaciones inexactas, código inseguro o consejos de seguridad desactualizados; hay que validar comandos y parches antes de usarlos.
- Datos sintéticos: parte del entrenamiento proviene de destilaciones (Claude Mythos, Qwen3.8-Max) que pueden arrastrar errores del modelo profesor.
- Sesgo de dominio e idioma: entrenado y declarado solo en inglés; el uso en castellano no está evaluado y puede degradar formato y terminología.
- Contexto limitado a 8.192 tokens, insuficiente para auditar repositorios o volcados de logs extensos sin trocear.
- Licencia: la metadata declara Apache-2.0, pero el propio autor exige revisar las licencias upstream antes de redistribuir o usar comercialmente, en particular por el dataset de destilación de Qwen.
- Uso ofensivo: el modelo está deliberadamente descensurado; debe limitarse a sistemas con autorización explícita por escrito. No hay garantía de que respete límites legales en todos los países.
- Adopción nula medible: 0 descargas y 1 like en el momento de la consulta; no hay retroalimentación de la comunidad sobre fallos o comportamientos extraños.
- Repositorio de 28,3 GB: la descarga completa incluye los cuatro cuantizados, conviene bajar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF
- Modelo base del ajuste (safetensors): https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Merge previo sin censura: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Merge Claude 3xMerge: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Variante 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Variante 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Modelo de origen de la familia: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente de segundo nivel (razonamiento en ciberseguridad): https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente de segundo nivel (red team ofensivo): https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente de segundo nivel (destilación Claude Mythos): https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente de segundo nivel (destilación Qwen3.8-Max): https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados correspondían a la marca de grabadoras láser xTool, sin relación con el autor ni con el proyecto.
