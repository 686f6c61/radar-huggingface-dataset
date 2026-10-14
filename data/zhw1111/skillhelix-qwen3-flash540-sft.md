# zhw1111/skillhelix-qwen3-flash540-sft

## Resumen

SkillHelix Qwen3-14B SFT, Flash540 es un ajuste fino de parámetros completos (full-parameter SFT) sobre el modelo denso Qwen/Qwen3-14B, publicado en HuggingFace por el usuario zhw1111. No es un modelo entrenado desde cero: es una especialización orientada a tareas de agente, entrenada con LLaMA-Factory 0.9.4.dev0 sobre un conjunto de datos propio llamado Flash540, de solo 533 filas y generado a partir de trazas de un modelo profesor que la model card denomina DeepSeek V4.1-Flash.

El modelo conserva la arquitectura transformer decoder-only de Qwen3-14B, con 14.768.307.200 parámetros en bf16 (29,5 GB en safetensors) y una longitud de contexto de 32.768 tokens, tanto en el entrenamiento (cutoff sin truncado) como en las evaluaciones. El ajuste se realizó durante 10 épocas (220 pasos) con learning rate 1e-6 y planificador coseno, ZeRO-3, bf16 y el kernel Liger 0.5.10, sobre 4 GPU, empleando una plantilla de chat ChatML simple (qwen3_nothink), es decir, sin etiquetas de modo pensamiento.

Su relevancia es acotada y de nicho. Se trata de un experimento de ajuste sobre un dataset muy pequeño y muy específico, con resultados declarados en el examen AppWorld 0.2.0 (media de 92,0 en tres ejecuciones) que no han sido verificados de forma independiente. El repositorio no declara licencia, idiomas ni pipeline, acumula 0 descargas y 0 "likes", y las fechas que figuran en la model card corresponden a octubre de 2026, lo que añade dificultad a cualquier validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (sin mezcla de expertos) |
| Parámetros totales | 14.768.307.200 (~14,77 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (cutoff de entrenamiento sin truncado y contexto nativo usado en las evaluaciones) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en bf16 (safetensors) |
| Idiomas soportados | no disponible en la ficha del modelo |
| Licencia | no disponible (la model card no declara licencia; el modelo base Qwen3-14B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors en bf16 (repositorio de 29,5 GB) |
| Modelo base | Qwen/Qwen3-14B, commit 40c069824f4251a91eefaf281ebe4c544efd3e18 |
| Método de ajuste | SFT de parámetros completos con LLaMA-Factory 0.9.4.dev0 (parche prompt_turn_idx=10) |
| Plantilla de chat | ChatML simple (qwen3_nothink, sin etiquetas de pensamiento); la original de Qwen3 se conserva en tokenizer_config.json.orig |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es Qwen3-14B, un transformer decoder-only denso con atención de consultas agrupadas (GQA), RoPE, RMSNorm, SwiGLU y QK-Norm, según la documentación pública de la familia Qwen3. El ajuste es de parámetros completos, es decir, se actualizaron los 14,77 B de parámetros, no un adaptador. La receta declarada es: learning rate 1e-6 con planificador coseno, warmup 0.1, 10 épocas / 220 pasos, 4 GPU con micro-batch 1 y acumulación de gradiente 6 (lote efectivo de 24), cutoff de 32.768 tokens sin truncado, semilla 17, bf16, ZeRO-3 y Liger 0.5.10. El conjunto de datos, Flash540, contiene 533 filas generadas a partir de un profesor denominado DeepSeek V4.1-Flash, con "recolección nativa SAGE, sin biblioteca global". La model card no define qué es SAGE ni detalla la composición o el idioma del dataset.

El entrenamiento usa una plantilla ChatML simple (qwen3_nothink), sin etiquetas de pensamiento; esa plantilla es la que se sirve por defecto en tokenizer_config.json y fue verificada token a token por el autor. La selección del checkpoint se hizo entrenando 10 épocas y eligiendo los tres con menor pérdida media de época más el final, evaluados sobre un conjunto de desarrollo de 57 ítems ("dev-57 TGC"), con desempate por el paso más temprano; el checkpoint publicado es el 184 (época 8). No se documenta RLHF, DPO ni ninguna fase de alineación posterior al SFT, ni innovaciones de decodificación (por ejemplo, decodificación especulativa).

## Capacidades

- Generación de texto y conversación multi-turno en formato ChatML simple, que es exactamente el formato visto durante el entrenamiento.
- Ejecución de tareas de agente y razonamiento multi-paso: el ajuste se orienta a este dominio y las únicas evaluaciones publicadas son de tipo agéntico (AppWorld 0.2.0).
- Tool calling / function calling: no documentado explícitamente para este checkpoint. El modelo base Qwen3 sí lo soporta, pero el ajuste con plantilla ChatML plana y sin modo pensamiento obliga a validar el formato de llamadas con pruebas propias antes de usarlo en producción.
- Código y matemáticas: no hay resultados de benchmarks específicos publicados para este checkpoint.
- Capacidades multilingües: no documentadas en la ficha; el ajuste se evaluó con exámenes en inglés (AppWorld).
- Modo pensamiento (thinking): desactivado por diseño; la plantilla servida no incluye etiquetas de razonamiento.
- Contexto largo: hasta 32.768 tokens, con entrenamiento sin truncado hasta ese límite.
- Otras modalidades (visión, audio): no disponibles, no se mencionan.

## Casos de uso

- Automatización de tareas sobre APIs y entornos tipo AppWorld: es el dominio para el que fue entrenado explícitamente y donde el autor declara sus mejores resultados (media de 92,0 en test_normal). Adecuado para prototipos de agentes que resuelven tareas de varios pasos con llamadas a herramientas.
- Reproducción y auditoría de evaluaciones de agente: el modelo permite replicar el examen AppWorld 0.2.0 en configuración nativa de 32k, greedy y 40 pasos, útil para equipos que quieran verificar de forma independiente las cifras declaradas.
- Investigación en SFT de bajo volumen: la receta está descrita con detalle (lr, warmup, ZeRO-3, Liger, cutoff, criterio de selección de checkpoint), lo que la convierte en un caso de estudio sobre qué se obtiene ajustando un modelo de 14,77 B con solo 533 ejemplos y 10 épocas.
- Generación de datos sintéticos para tareas de agente: al estar especializado en trazas de agente, puede emplearse como generador de trayectorias candidatas que después se filtren con un modelo mayor.
- Base para un ajuste posterior en un dominio concreto: al ser pesos completos en safetensors y con arquitectura Qwen3 estándar, se puede continuar el entrenamiento (SFT o DPO) sobre datos propios del dominio.
- Prototipado local tras cuantización: al ser una arquitectura Qwen3 estándar, se puede convertir a GGUF y ejecutar en una GPU de consumo con cuantización de 4 bits, siempre que se asuma la pérdida de calidad no medida.
- Servicio de agentes con backend de alto rendimiento: desplegable con vLLM o SGLang en una o dos GPU de 80 GB para servir peticiones concurrentes con contexto largo, siempre que se respete la plantilla ChatML incluida.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| AppWorld 0.2.0 test_normal (nativo) | 32k, greedy, 40 pasos, 4xA100 80GB, 2026-10-14 | 83, 94 y 99 en tres ejecuciones (media 92,0) |
| Examen nativo SAGE, dev-57 | Checkpoint 184 (época 8, publicado) | 43/57 (75,4 %) |
| Examen nativo SAGE, dev-57 | Checkpoint 207 | 40/57 (70,2 %) |
| Examen nativo SAGE, dev-57 | Checkpoint 220 | 42/57 (73,7 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible. Los únicos datos son los de la model card del autor y no han sido reproducidos por terceros; además, el repositorio acumula 0 descargas, por lo que no existen evaluaciones independientes.

## Requisitos de hardware

- Pesos en bf16: 29,5 GB. La inferencia con contexto de 32.768 tokens requiere VRAM adicional para la caché KV y las activaciones, que crece con el tamaño de lote y la longitud de secuencia.
- GPU de 80 GB: A100 80 GB, H100 80 GB o similar, con holgura para contexto largo y lotes moderados.
- GPU de 40 GB: A100 40 GB resulta muy justo en bf16 con contexto largo; es recomendable reducir el contexto o cuantizar.
- GPU de consumo: no cabe en bf16 en una RTX 4090 o RTX 3090 (24 GB). Sí cabe tras cuantización a 4 bits (en torno a 8-9 GB de pesos), y con 8 bits (en torno a 15-16 GB) en tarjetas de 24 GB.
- Multi-GPU: con dos RTX 4090 y tensor parallelism, o con 4xA100 80GB como en la evaluación del autor, se puede servir sin cuantizar.
- Opciones de despliegue: vLLM, SGLang y TGI para safetensors; llama.cpp y Ollama requieren conversión previa a GGUF. LLaMA-Factory se usó para el entrenamiento y puede emplearse para inferencia de validación.
- Advertencia de despliegue: hay que servir el modelo con la plantilla ChatML simple incluida en tokenizer_config.json; la plantilla original de Qwen3 está en tokenizer_config.json.orig y usarla por defecto puede degradar los resultados.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las filas de Qwen3 provienen de la documentación pública de esa familia y no forman parte de la información proporcionada; se incluyen solo como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en AppWorld |
|---|---|---|---|---|---|
| zhw1111/skillhelix-qwen3-flash540-sft | 14,77 B (denso) | 32.768 | no declarada | HuggingFace, 0 descargas | media 92,0 declarada por el autor, sin verificación independiente |
| Qwen/Qwen3-14B (modelo base) | 14,77 B (denso) | 32.768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace | no disponible en la información proporcionada |
| Qwen/Qwen3-30B-A3B | MoE, 30,5 B totales y 3,3 B activos | 32.768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace | no disponible en la información proporcionada |
| Modelos de agente de propósito general de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas directas publicadas por el autor frente a otros modelos en la misma evaluación, ni de resultados propios de los modelos alternativos en AppWorld dentro de la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 533 filas repetidas durante 10 épocas, lo que supone un riesgo alto de sobreajuste a la distribución de Flash540/SAGE y de especialización excesiva.
- Desactivación del modo pensamiento: la plantilla servida es ChatML simple sin etiquetas de pensamiento, por lo que se pierde el comportamiento de razonamiento extendido del Qwen3 original sin que se haya medido el impacto en tareas generales.
- Cambio de plantilla de chat: el repositorio sustituye la plantilla original de Qwen3 por una plantilla ChatML. Servir el modelo con la plantilla equivocada degrada la calidad de forma difícil de diagnosticar.
- Licencia no declarada: la ausencia de licencia explícita en el repositorio impide asumir derechos de uso comercial, aunque el modelo base Qwen3-14B sea Apache 2.0. Cualquier uso en producción requiere aclarar este punto con el autor.
- Procedencia de los datos opaca: el profesor citado (DeepSeek V4.1-Flash) no es verificable públicamente en la información disponible, y no se detalla la composición, el idioma ni el proceso de filtrado de Flash540. Tampoco se define qué son "SAGE" ni "TGC".
- Resultados no reproducidos: 0 descargas y 0 "likes", sin evaluaciones de terceros ni artefactos de evaluación publicados aparte de las cifras de la model card.
- Varianza alta entre ejecuciones: 83, 94 y 99 en la misma configuración de test_normal indican una sensibilidad considerable al muestreo; la media de 92,0 debe interpretarse con cautela.
- Conjunto de desarrollo de solo 57 ítems: un acierto o un fallo mueve el resultado ~1,75 puntos porcentuales, por lo que las diferencias entre checkpoints (43, 42 y 40) no son concluyentes.
- Metadatos incompletos: no se declaran idiomas, pipeline ni licencia, y el repositorio pesa 29,5 GB, lo que encarece las pruebas de validación.
- Fechas anómalas: la model card sitúa el entrenamiento y las evaluaciones en octubre de 2026, lo que dificulta contrastar la cronología declarada.
- Sesgos y alucinación: no se han publicado evaluaciones de sesgo, toxicidad ni tasa de alucinación para este checkpoint; al no documentarse fases de RLHF o DPO, no hay garantías de alineación más allá del SFT supervisado.
- Riesgo de olvido catastrófico: un SFT de parámetros completos sobre 533 ejemplos puede degradar capacidades generales del modelo base (redacción, código, matemáticas) sin que existan métricas que lo cuantifiquen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhw1111/skillhelix-qwen3-flash540-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3-14B/tree/40c069824f4251a91eefaf281ebe4c544efd3e18
- Plantilla original de Qwen3 conservada en el repositorio: tokenizer_config.json.orig
- LLaMA-Factory (herramienta de entrenamiento citada): https://github.com/hiyouga/LLaMA-Factory
- Liger Kernel (citado en la receta): https://github.com/linkedin/Liger-Kernel
- AppWorld (entorno de evaluación citado): https://github.com/StonyBrookNLP/appworld
- Resultados de la búsqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes; los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado.
