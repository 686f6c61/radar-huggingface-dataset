# testmymodel112/Qwen3.8-27B-Uncensored-FP8

## Resumen

El modelo `testmymodel112/Qwen3.8-27B-Uncensored-FP8` es una versión modificada del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario testmymodel112 en colaboración con OrcaRouter. Se trata de un modelo denso de 27.8 mil millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), que incluye una torre de visión nativa y un cabezal de decodificación especulativa MTP (Multi-Token Prediction). La modificación principal consiste en la aplicación de una técnica de "abliteración" que elimina la dirección de rechazo del modelo, seguida de una cuantización offline block-FP8 que replica exactamente el esquema del modelo oficial `Qwen/Qwen3.8-27B-FP8`.

Este modelo está orientado exclusivamente a la investigación en seguridad e interpretabilidad de modelos de lenguaje, como red-teaming, estudio de mecanismos de rechazo y evaluación de robustez. Al haber sido abliterado, carece de guardarraíles de seguridad y puede generar contenido dañino, por lo que no debe desplegarse en producción sin capas adicionales de moderación. Su relevancia radica en que permite estudiar cómo funciona la alineación de seguridad en un modelo de última generación con capacidades avanzadas de razonamiento, visión y tool-calling, manteniendo la misma ruta de kernels de vLLM que la versión FP8 oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 48 capas Gated DeltaNet + 16 capas full-attention, 64 capas totales, hidden 5120) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Block-FP8 (E4M3), weight_block_size [128,128], activaciones dinámicas; torre de visión, norms, router, embeddings y lm_head en BF16 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards de ≤5 GB, 30.9 GB totales, 1606 tensores) |

## Arquitectura y entrenamiento

La arquitectura base es el modelo `Qwen3.8-27B` de Qwen, que emplea un diseño híbrido de atención: 48 capas utilizan Gated DeltaNet (atención lineal) y 16 capas utilizan atención completa, intercaladas con un intervalo de 4. Incluye una torre de visión-lenguaje nativa y un cabezal MTP para decodificación especulativa. El modelo soporta control flexible de pensamiento (modo reasoning), tool-calling y una ventana de contexto de 262.144 tokens.

La modificación principal es la abliteración, basada en el método de Arditi et al. (2024), que identifica una única dirección de rechazo en el espacio residual del modelo. Se estima en la capa 38 (round(0.6 × 64)) utilizando la diferencia de medias entre las activaciones finales de conjuntos de prompts dañinos (AdvBench) y inofensivos (Alpaca). Posteriormente, esta dirección se ortogonaliza de todas las matrices que escriben en el residual: `W' = W − r(rᵀW)`, calculado en float32. Se editan 131 matrices en total: 17 `self_attn.o_proj` (16 capas full-attention + MTP), 48 `linear_attn.out_proj` (capas Gated DeltaNet), 65 `mlp.down_proj` (64 capas + MTP) y 1 `embed_tokens`. La fuga residual máxima tras la edición es de 1.8e-2. La torre de visión no se modifica, y el cabezal MTP se ablitera de forma coherente con el modelo principal para mantener la decodificación especulativa.

Después de la abliteración, el modelo se cuantiza offline a block-FP8 (E4M3) con el mismo esquema que el oficial `Qwen3.8-27B-FP8`, lo que permite servirlo con la misma ruta de kernels de vLLM. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación), ya que no se detalla en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con control flexible de pensamiento (modo thinking activable o desactivable).
- Comprensión de imágenes y texto (pipeline image-text-to-text), gracias a la torre de visión nativa.
- Tool-calling / function calling, lo que permite integración con APIs y herramientas externas.
- Decodificación especulativa mediante cabezal MTP, que acelera la inferencia.
- Multilingüe limitado a inglés y chino.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Sin guardarraíles de seguridad: al estar abliterado, no rechaza peticiones dañinas, ilegales o no éticas.

## Casos de uso

- Red-teaming de modelos de lenguaje: permite evaluar vulnerabilidades de seguridad y probar técnicas de jailbreak en un modelo sin capas de rechazo, útil para desarrollar defensas más robustas.
- Estudio de mecanismos de rechazo en LLMs: al eliminar la dirección de rechazo, se puede analizar cómo y dónde se codifica la negativa en el espacio residual, contribuyendo a la investigación en interpretabilidad.
- Investigación en alineación de modelos: comparar el comportamiento del modelo abliterado con el original para cuantificar el impacto de la alineación en la utilidad y la seguridad.
- Evaluación de robustez ante ataques adversariales: probar la resistencia del modelo a manipulaciones de entrada y medir la eficacia de mitigaciones externas.
- Desarrollo de técnicas de moderación de contenido: usar el modelo como caso extremo para validar filtros y sistemas de clasificación de contenido dañino.
- Benchmarking de cuantización FP8: evaluar el rendimiento y la degradación de precisión de la cuantización block-FP8 en tareas de razonamiento, visión y tool-calling en comparación con el modelo en BF16.
- Experimentos controlados de seguridad: generar datos sintéticos de contenido problemático para entrenar clasificadores o sistemas de detección, siempre bajo condiciones controladas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta versión abliterada y cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 30.9 GB. Con la ventana de contexto de 262K tokens, la memoria de activaciones puede superar los 40 GB en total, dependiendo de la longitud de la secuencia y el tamaño de lote.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100 80GB, o configuraciones multi-GPU. Una RTX 4090 (24 GB) no es suficiente sin cuantización adicional o reducción de contexto.
- Opciones de despliegue: vLLM es la opción recomendada por el autor, ya que el esquema FP8 es compatible con los kernels de vLLM. También puede desplegarse con TGI o convertir los pesos a GGUF para llama.cpp/Ollama, aunque el soporte de FP8 en estos entornos puede ser limitado.
- Latencia y throughput: no disponible en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Abliterado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 262K | BF16 | No | Apache 2.0 |
| Qwen3.8-27B-FP8 (oficial) | 27,8B | 262K | Block-FP8 | No | Apache 2.0 |
| testmymodel112/Qwen3.8-27B-Uncensored-FP8 | 27,8B | 262K | Block-FP8 | Sí | Apache 2.0 |

Las tres variantes comparten la misma arquitectura y capacidades. La diferencia clave es la abliteración, que elimina los mecanismos de rechazo, y la cuantización FP8 que reduce el uso de memoria a costa de una posible pérdida menor de precisión. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo ha sido abliterado: no tiene guardarraíles de seguridad y puede generar contenido dañino, ofensivo, ilegal o no ético. No debe desplegarse a usuarios finales ni en producción sin capas adicionales de moderación y prevención de abuso.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, posiblemente agravado por la eliminación de la alineación.
- La cuantización FP8 puede introducir degradaciones de precisión en tareas numéricas o de razonamiento complejo, aunque no se han publicado evaluaciones al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad por mal uso. El usuario asume plena responsabilidad legal y ética.
- No se dispone de información sobre el entrenamiento del modelo base, por lo que se desconocen posibles sesgos en los datos de entrenamiento.
- El modelo está pensado exclusivamente para investigación en seguridad e interpretabilidad; su uso fuera de este ámbito es desaconsejado.

## Enlaces

- HuggingFace: https://huggingface.co/testmymodel112/Qwen3.8-27B-Uncensored-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- OrcaRouter (web): https://www.orcarouter.ai
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- Página del modelo en OrcaRouter: https://www.orcarouter.ai/models/obsidian/qwen3.8-27b
- Paper de Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction": https://arxiv.org/abs/2406.11717
