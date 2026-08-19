# ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo-matched

## Resumen

El modelo `cot-dialect-olmo3-7b-think-conditioned-grpo-matched` es un adaptador LoRA desarrollado por el usuario `ssurface` sobre el modelo base `allenai/Olmo-3-7B-Think`. Se trata de un experimento de investigación que explora el condicionamiento del nivel de verbosidad en cadenas de pensamiento (chain-of-thought) mediante un único adaptador que recibe el nivel deseado en el prompt, en lugar de usar un adaptador por nivel. El objetivo es comparar si un solo modelo puede ajustarse dinámicamente a diferentes niveles de detalle en el razonamiento, frente a la familia de adaptadores específicos por nivel que el mismo autor publica.

El modelo se entrena en dos fases: primero sobre un modelo SFT condicionado y posteriormente con GRPO (Group Relative Policy Optimization) para refinar el comportamiento. Aunque alcanza una precisión del 90,3% en GSM8K (nivel L1), el análisis del autor indica que el modelo no comprime ni varía la cadena de pensamiento según el nivel pedido; emite una cadena similar independientemente de la instrucción. Por tanto, se presenta como un diseño de comparación, no como un modelo recomendado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de 7B (Olmo-3-7B-Think) |
| Parámetros totales | No disponible (adaptador LoRA con r=16, alpha=32; el modelo base tiene ~7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Olmo-3-7B-Think) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base usa bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) que se apila sobre el modelo base `allenai/Olmo-3-7B-Think`, un transformer de 7B parámetros de la familia Olmo 3. El entrenamiento se realiza en dos etapas: primero se fusiona el adaptador con un modelo SFT condicionado (también proporcionado por el autor), y luego se aplica GRPO mediante `trl.GRPOTrainer` con atención SDPA. El condicionamiento se realiza nombrando el nivel de verbosidad en el prompt (p. ej., "Level 1 (Verbose)"), no mediante selección de adaptador.

El entrenamiento se ejecutó en una única GPU NVIDIA A100 80GB. No se especifica el número de tokens de entrenamiento ni la composición del dataset, pero el conjunto de datos utilizado es `openai/gsm8k` para razonamiento matemático. No se menciona el uso de RLHF o DPO; solo GRPO.

## Capacidades

- Generación de texto y razonamiento matemático (GSM8K).
- Condicionamiento por nivel de verbosidad en la cadena de pensamiento (L1 a L5, desde Verbose hasta Extreme).
- Generación de cadenas de pensamiento largas (típicas del modelo base Olmo-3-7B-Think).
- Soporte de tool calling y function calling: no se menciona en la información disponible.
- Capacidades multilingües: solo inglés.
- Capacidades de agente y razonamiento multi-paso: no se documentan explícitamente, aunque el razonamiento matemático de GSM8K implica pasos múltiples.

## Casos de uso

- **Investigación en compresión de cadenas de pensamiento**: el modelo permite estudiar si un único adaptador puede ajustar la verbosidad de la cadena de razonamiento según el nivel pedido, comparándolo con adaptadores por nivel. Útil para entender los límites del condicionamiento implícito.
- **Experimentos de RLHF y GRPO**: sirve como ejemplo de cómo aplicar GRPO sobre un modelo SFT condicionado para refinar comportamientos específicos, con una configuración documentada (r=16, alpha=32, un solo A100).
- **Evaluación de robustez del razonamiento**: aunque no comprime, mantiene una precisión estable en GSM8K (~88-90%) en todos los niveles, lo que puede ser útil para estudiar la consistencia del razonamiento bajo instrucciones variables.
- **Comparación de arquitecturas de adaptadores**: se puede usar como punto de referencia para evaluar la diferencia entre un adaptador único condicionado por prompt y una familia de adaptadores por nivel, en términos de precisión y longitud de la cadena.
- **Prototipado de sistemas de razonamiento controlado**: aunque no recomendado para producción, puede servir como prueba de concepto para integrar control de verbosidad en un pipeline de generación de respuestas.
- **Análisis de alucinación en razonamiento**: al variar el nivel pedido, se puede estudiar si el modelo mantiene la coherencia o introduce errores en cadenas de pensamiento largas.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card se muestran a continuación. Se trata de precisión exacta (exact match) sobre el conjunto de test de GSM8K (n=1317).

| Nivel solicitado | Precisión |
|---|---|
| L1 | 90,3 % |
| L2 | 89,1 % |
| L3 | 88,5 % |
| L4 | 88,7 % |
| L5 | 89,1 % |

El autor indica que la precisión es plana en todos los niveles, pero que esto se debe a que el modelo emite una cadena de pensamiento similar independientemente del nivel pedido. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para cargar el modelo base de 7B en bfloat16 se necesitan aproximadamente 14-16 GB de VRAM. El adaptador LoRA añade un overhead mínimo (0.1 GB).
- **GPU recomendadas**: NVIDIA A100 80GB (usada en entrenamiento), RTX 4090, RTX 3090, o cualquier GPU con 16 GB o más de VRAM.
- **Compatibilidad con GPU de consumo**: sí, una RTX 4090 o RTX 3090 es suficiente para inferencia en bfloat16.
- **Opciones de despliegue**: se puede usar con `transformers` + `peft` (carga del adaptador y fusión), o con `vLLM` y `llama.cpp` si se convierte el modelo fusionado a GGUF. No se mencionan otras herramientas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

El modelo se compara con los adaptadores por nivel de la misma colección (p. ej., `cot-dialect-olmo3-7b-think-grpo-addlen50-l5`), aunque no se dispone de sus métricas específicas. A continuación se compara con el modelo base y con una alternativa de la misma categoría.

| Modelo | Parámetros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo-matched` | Adaptador LoRA sobre 7B | No disponible | 90,3% (L1) | Apache-2.0 |
| `allenai/Olmo-3-7B-Think` | 7B | No disponible | No reportado | Apache-2.0 |
| Adaptadores por nivel (p. ej., `cot-dialect-olmo3-7b-think-grpo-addlen50-l5`) | Adaptador LoRA sobre 7B | No disponible | No reportado | Apache-2.0 |

No se dispone de datos comparativos con otros modelos externos (como Llama-3-8B o Mistral-7B) en la información proporcionada.

## Limitaciones y advertencias

- **Diseño de comparación, no un modelo recomendado**: el propio autor indica que este modelo es una alternativa de diseño para comparar con la familia de adaptadores por nivel. No está pensado para uso en producción.
- **No comprime la cadena de pensamiento**: el modelo emite una cadena de pensamiento similar independientemente del nivel solicitado, lo que limita su utilidad para controlar la verbosidad.
- **Un solo seed**: el entrenamiento se realizó con una única semilla, por lo que los resultados pueden no ser representativos.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar razonamientos incorrectos o inventados, especialmente en cadenas largas.
- **Idioma**: solo soporta inglés, no hay capacidades multilingües.
- **Contexto**: la longitud de contexto no está documentada; depende del modelo base Olmo-3-7B-Think.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero al ser un experimento de investigación, se recomienda validar su comportamiento antes de integrarlo en un sistema.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo-matched)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Paper de Olmo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Repositorio OLMo-core (GitHub)](https://github.com/allenai/OLMo-core)
- [Adaptador per-level relacionado: ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5)
