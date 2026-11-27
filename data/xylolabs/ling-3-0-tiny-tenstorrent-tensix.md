# Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix

## Resumen

Ling-3.0-tiny-Tenstorrent-Tensix es una versión cuantizada del modelo inclusionAI/Ling-3.0-tiny, preparada por Xylolabs para su ejecución eficiente sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original "bailing_hybrid" del modelo base, pero sustituye los pesos de las capas KDA, MLA, MLP densa, expertos y LM head por tensores en formato block-floating-point bfloat4_b (BFP4), manteniendo el resto en bf16/float32. El resultado es un paquete de aproximadamente 4,79 GB frente a los 15,79 GB del modelo en BF16.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización orientado a hardware específico (tt-metal, ttnn, tt-forge) en lugar de a GPU convencionales, con una metodología de evaluación basada en divergencia KL frente al modelo BF16. El autor reporta una KL media de 0,0903 sobre 16.276 posiciones de texto en inglés y coreano, frente a 0,0670 de la referencia Q4_K_M de llama.cpp, lo que sitúa la calidad de la cuantización BFP4 ligeramente por debajo de Q4_K_M pero dentro del límite declarado de 1,5 veces esa referencia.

El modelo se distribuye con licencia MIT, emplea safetensors como formato de pesos y está pensado para text-generation. No se dispone de información sobre el número exacto de parámetros, longitud de contexto o idiomas soportados en la documentación proporcionada, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (arquitectura híbrida del modelo base inclusionAI/Ling-3.0-tiny; componentes KDA y MLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en KDA, MLA, MLP densa, expertos y LM head; resto en bf16/float32. Referencia comparativa Q4_K_M (llama.cpp) |
| Idiomas soportados | no disponible (la evaluación KL cubre inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta `bfp4/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base inclusionAI/Ling-3.0-tiny, etiquetada como "bailing_hybrid". Según la model card, incorpora componentes KDA (atención lineal) y MLA (Multi-head Latent Attention), además de un MLP con expertos, lo que sugiere una estructura tipo mixture-of-experts combinada con mecanismos de atención lineal. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación principal de esta variante no está en el entrenamiento, sino en la cuantización para hardware Tensix. Xylolabs aplica un esquema de block-floating-point (BFP4) mediante su herramienta tensix-bfp-gptq, empaquetando matrices para su uso con ttnn y tt-metal. La model card documenta un procedimiento de empaquetado específico que incluye excepciones para `q_b_proj` y `kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23, con reordenación par/impar de las filas del sufijo rotatorio, lo que exige que la implementación respete ese orden de empaquetado para mantener la corrección numérica. El flujo de validación incluye scripts `pack_tensix.py` y `verify_grid.py`.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con `trust_remote_code=True`.
- Soporte del chat template original del modelo base (formato de mensajes role/content).
- Inferencia sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, con conversión directa de tensores a `ttnn.bfloat4_b`.
- Inferencia alternativa en GPU/CPU usando el código original del modelo base con Transformers 4.57.1 y flash-linear-attention 0.4.2.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) no documentadas en esta variante; se remiten al modelo inclusionAI/Ling-3.0-tiny.
- No se documentan capacidades de visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el paquete está diseñado para cargarse directamente en NPU Wormhole o Blackhole mediante ttnn, lo que permite ejecutar generación de texto en hardware no-GPU con un peso de 4,79 GB.
- Evaluación de cuantización BFP4: sirve como referencia para medir la pérdida de calidad (KL media 0,0903) frente a BF16 y Q4_K_M en tareas de texto en inglés y coreano.
- Prototipado en entornos con restricciones de memoria: al reducir el peso empaquetado a menos de un tercio del BF16, permite cargar el modelo en dispositivos con DRAM limitada.
- Investigación en atención lineal e híbrida: al conservar los componentes KDA y MLA del base, es útil para estudiar el comportamiento de estas arquitecturas bajo cuantización agresiva.
- Integración en pipelines de inferencia con Transformers: el ejemplo de la model card permite usar el modelo en GPU con `device_map="auto"` y `torch_dtype="bfloat16"`, útil para pruebas de humo antes de portar a Tensix.
- Benchmarking de herramientas de cuantización: el repositorio tensix-bfp-gptq y los scripts de empaquetado y verificación permiten reproducir y comparar el flujo frente a otras técnicas como GPTQ o Q4_K_M.
- Generación de texto en inglés y coreano: la evaluación KL cubre WikiText-2 y Wikipedia en coreano, por lo que el modelo es adecuado para tareas de generación en esos idiomas, aunque no se documenta el resto.

## Benchmarks y rendimiento

| Metrica | BFP4 (este modelo) | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 4,794 | 15,79 | 4,824 |
| KL media vs BF16 | 0,0903 | 0 | 0,0670 |
| Cobertura de evaluacion | 16.276 posiciones (WikiText-2 test + Wikipedia coreano, plantilla chat y texto plano) | - | - |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4,8 GB para los pesos empaquetados en BFP4; el modelo BF16 de referencia ocupa 15,79 GB.
- GPU recomendadas: no especificadas; la model card menciona ejecución en GPU con `device_map="auto"` y `torch_dtype="bfloat16"`, pero no detalla modelos concretos (A100, H100, RTX 4090, etc.).
- NPU objetivo: Tenstorrent Wormhole y Blackhole (Tensix), con ttnn y tt-metal.
- ¿Cabe en GPU de consumo? No confirmado; el peso de 4,8 GB sugiere que podría caber en GPUs con 8 GB o más, pero no se documenta.
- Opciones de despliegue: Transformers 4.57.1 con flash-linear-attention 0.4.2 y `trust_remote_code=True`; ttnn/tt-metal para Tensix; scripts `pack_tensix.py` y `verify_grid.py` para empaquetado y validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-Tenstorrent-Tensix (este) | no disponible | no disponible | BFP4 (bfloat4_b) | MIT | Hugging Face |
| inclusionAI/Ling-3.0-tiny (BF16) | no disponible | no disponible | BF16 | MIT (según model card) | Hugging Face |
| Ling-3.0-tiny Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M | MIT | Referencia en la model card |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia KL media de 0,0903 frente a BF16, superior a la de Q4_K_M (0,0670), lo que implica una pérdida de fidelidad mayor que la referencia de llama.cpp.
- El empaquetado requiere respetar el orden par/impar de las filas del sufijo rotatorio en `q_b_proj` y `kv_a_proj_with_mqa` de las capas 3, 7, 11, 15, 19 y 23; una implementación incorrecta produce resultados numéricamente erróneos.
- Dependencia de versiones concretas: Transformers 4.57.1 y flash-linear-attention 0.4.2, además de las dependencias CUDA/FLA del código original.
- La licencia MIT se hereda del modelo base, pero el archivo de modelado original conserva cabecera Apache-2.0 y el `configuration` original no tiene cabecera de licencia; conviene revisar `LICENSE`, `NOTICE` y `LICENSE-CODE` antes de uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; la evaluación KL solo cubre inglés y coreano.
- No se dispone de información sobre parámetros totales, contexto máximo ni idiomas soportados, lo que dificulta evaluar su idoneidad para producción.
- El modelo está orientado a hardware Tensix; su uso en GPU requiere el código original y no se garantiza el rendimiento del empaquetado BFP4 fuera de ttnn.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
