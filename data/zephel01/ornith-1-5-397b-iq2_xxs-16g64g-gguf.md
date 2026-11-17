# zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF

## Resumen
Ornith-1.5-397B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, con 402.941.918.464 parámetros totales (aproximadamente 403B) y basado en la arquitectura qwen35moe. Esta ficha describe una cuantización GGUF concreta del modelo base, publicada por el usuario zephel01, diseñada específicamente para ejecutar el modelo completo en un PC con una GPU de 16 GB de VRAM y 64 GB de RAM, manteniendo una ventana de contexto de 128K tokens.

La relevancia de esta cuantización radica en que permite, mediante una técnica de cuantización mixta, reducir el tamaño de los tensores densos (los expertos enrutados se mantienen en IQ2_XXS mientras que la parte densa pasa a Q5_K e IQ4_XS) para liberar 3,3 GB de VRAM, suficiente para alojar una caché KV fp16 de 128K tokens en una tarjeta de 16 GB. El resultado es un archivo GGUF de 110,6 GB repartido en tres shards, con todos los 512 expertos conservados (10 expertos enrutados por token más el compartido).

El modelo está publicado bajo licencia MIT, soporta inglés y japonés, y está pensado para entornos de inferencia local con offload parcial a CPU y SSD, gestionado principalmente por el motor Abyss (versión 1.3.122 o superior) y, de forma secundaria, por llama.cpp.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (Mixture of Experts, MoE) con atención completa y componentes SSM/delta-net |
| Parametros totales | 402.941.918.464 (aproximadamente 403B) |
| Parametros activos | 10 expertos enrutados por token más 1 experto compartido (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | Mixta: expertos enrutados IQ2_XXS (algunos `ffn_down` Q2_K) con imatrix; delta-net `attn_qkv` y expertos compartidos Q5_K; `attn_gate`, `ssm_out` y atención completa `attn_q/k/v/output` IQ4_XS; `ssm_alpha`/`ssm_beta`, routers y norms Q8_0/F32; cabeza de salida Q5_K; embedding IQ3_S; bloque NextN `blk.60` Q4_K |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (tres shards: 44,1 GB + 44,2 GB + 22,3 GB; total 110,6 GB) |

## Arquitectura y entrenamiento
El modelo base emplea una arquitectura MoE de tipo qwen35moe, con 60 capas y 512 expertos enrutados por capa, de los cuales se activan 10 por token además de un experto compartido. La arquitectura combina mecanismos de atención completa con componentes de tipo SSM (state space model) y delta-net, tal como se deduce de los nombres de tensores presentes en la cuantización (`attn_qkv`, `ssm_out`, `ssm_alpha`, `ssm_beta`, `attn_gate`). Incluye además un bloque NextN (MTP, multi-token prediction) en `blk.60`, que el motor Abyss utiliza para decodificación especulativa (drafting).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio de cuantización no detalla estos aspectos del modelo base. La innovación técnica destacable de esta ficha es la receta de cuantización: los expertos enrutados, el bloque NextN, la cabeza de salida, el embedding y las norms se copian byte a byte desde la versión 32G128G, mientras que solo los tensores densos Q8_0 se recuantizan a Q5_K/IQ4_XS ponderados por la misma importance matrix que los expertos, reduciendo los pesos densos en VRAM de 8,7 GB a 5,4 GB.

## Capacidades
- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas, incluyendo operaciones aritméticas simples (ejemplo de la model card: "What is 17*23?").
- Soporte de decodificación especulativa mediante el bloque NextN (MTP) en el motor Abyss.
- Capacidades multilingües limitadas a inglés y japonés.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`, ruta `/v1/chat/completions`).
- Ejecución con offload parcial a CPU/RAM y lectura desde SSD para expertos que no caben en memoria.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso
- Inferencia local de un modelo de 403B en hardware de consumo: un desarrollador con una GPU de 16 GB y 64 GB de RAM puede ejecutar el modelo completo a 128K de contexto usando Abyss, aceptando un throughput bajo (~9 tok/s) a cambio de no depender de servicios en la nube.
- Experimentación con modelos MoE de gran escala: investigadores pueden estudiar el comportamiento de un MoE de 512 expertos y 60 capas en entornos de recursos limitados, observando el efecto del offload a SSD sobre la latencia.
- Procesamiento de documentos largos en japonés e inglés: la ventana de 128K tokens permite resumir o analizar contratos, informes técnicos o documentación extensa en ambos idiomas sin truncar el contexto.
- Asistente conversacional local con privacidad de datos: al ejecutarse íntegramente en el PC del usuario, el modelo permite mantener conversaciones multi-turno sobre información sensible sin enviar datos a terceros.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad entre IQ2_XXS y cuantizaciones mayores (122B IQ3_XXS/IQ4_XS) en tareas de razonamiento y generación.
- Pruebas de integración con llama.cpp: permite validar el build `ac8e1694d` de llama.cpp con el arquitectura qwen35moe y tres shards, útil para desarrolladores que contribuyen al ecosistema GGUF.
- Benchmarking de decodificación especulativa: el bloque NextN a Q4_K permite medir la aceleración del drafting en Abyss frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta una métrica de velocidad: aproximadamente 9 tok/s a 128K de contexto en un PC con GPU limitada a 16 GB de VRAM y 64 GB de RAM, con aproximadamente la mitad de los expertos leídos desde SSD. Se menciona también que la variante 122B 16G64G es entre 5 y 6 veces más rápida en el mismo hardware.

## Requisitos de hardware
- VRAM estimada para inferencia: 16 GB de VRAM (configuración medida con `STRATA_GLM_VRAM_GB` a 15 si la tarjeta también alimenta la pantalla) más 44 GB de RAM asignados al modelo en un PC de 64 GB (dejando ~16 GB para el sistema operativo).
- GPU recomendadas: el caso medido es una GPU de 16 GB (se menciona una RX 9070 XT 16 GB en el informe de campo original); cualquier GPU con 16 GB de VRAM es el objetivo de diseño.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB, pero con offload de aproximadamente la mitad de los expertos a RAM/SSD.
- Almacenamiento: SSD NVMe rápido recomendado; un segundo SSD con copia espejo de los archivos (`STRATA_GLM_MIRROR`) mejora el rendimiento según la model card.
- Opciones de despliegue: Abyss v1.3.122 o superior (obligatorio; versión medida v1.3.133) y llama.cpp (build `ac8e1694d` carga los tres shards; velocidad no medida).
- Latencia y throughput: ~9 tok/s en un NVMe SSD a 128K de contexto; la variante 122B es 5-6 veces más rápida en el mismo equipo.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Velocidad (16 GB GPU + 64 GB RAM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-397B IQ2_XXS 16G64G (este repo) | ~403B (MoE) | 128K | ~9 tok/s (SSD-bound) | MIT | GGUF, 110,6 GB |
| Ornith-1.5-122B IQ3_XXS 16G64G | ~122B | no disponible en la información | 5-6x más rápido que el 397B | MIT | GGUF, 51,7 GB |
| Ornith-1.5-122B IQ4_XS 24G64G | ~122B | no disponible en la información | no disponible | MIT | GGUF, 68,9 GB (requiere 24-32 GB VRAM) |
| Ornith-1.5-397B IQ2_XXS 32G128G | ~403B (MoE) | 128K | no disponible (todo en GPU+RAM) | MIT | GGUF, 114,2 GB (requiere 32 GB VRAM + 128 GB RAM) |

## Limitaciones y advertencias
- Rendimiento muy bajo: ~9 tok/s en el hardware objetivo, con aproximadamente la mitad de los expertos leídos desde SSD; no apto para aplicaciones interactivas con latencia estricta.
- Estado BETA: medido en un único PC con la memoria de GPU limitada a 16 GB; los resultados en tarjetas reales de 16 GB pueden variar.
- Dependencia de software: requiere Abyss v1.3.122 o superior; versiones anteriores rechazan cargar Ornith-1.5-397B por sus 10 expertos enrutados por token.
- Cuantización agresiva en los expertos (IQ2_XXS, algunos Q2_K): es previsible una pérdida de calidad frente al modelo base en FP16/BF16, aunque no se han publicado métricas que la cuantifiquen.
- Idiomas limitados a inglés y japonés; no se documenta soporte de otras lenguas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- Licencia MIT: permite uso comercial, pero al derivar del modelo base ornith-ai/Ornith-1.5-397B conviene verificar que las condiciones del modelo original se mantienen.
- No se documenta soporte de tool calling, agentes ni visión, lo que limita su uso en pipelines de automatización complejos.

## Enlaces
- Repositorio Hugging Face de esta cuantización: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentación de Ornith en Abyss: https://github.com/zephel01/Abyss/blob/main/docs/ornith/README.md
- Versión 32G128G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Versión 122B 16G64G: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Versión 122B IQ4_XS 24G64G: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Informe de campo original (Abyss #44): https://github.com/zephel01/Abyss/issues/44
- Envío de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-397B+16G64G
