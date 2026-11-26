# woan12/tu

## Resumen

woan12/tu es un modelo derivado de Qwen/Qwen3.8-27B publicado en Hugging Face por el usuario woan12. Se trata de una versión "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante ablación de direcciones en el espacio de activaciones) del modelo base Qwen3.8-27B, orientada a eliminar las respuestas de negativa del modelo original. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto, y el repositorio incluye pesos en formato GGUF junto con artefactos para transformers.

El modelo tiene 27.320.697.856 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos densos de aproximadamente 27B. La model card menciona soporte de contexto de hasta 1.048.576 tokens mediante rope scaling yarn, atención híbrida (hybrid-attention), y variantes de cuantización ternaria y de 2 bits orientadas a ejecución on-device. El tamaño del repositorio es de 865,3 GB, reflejo de la acumulación de múltiples series de cuantización y variantes derivadas de otros modelos (Unsloth, GSQ-RCO, Ternary-Bonsai, Swift, Underdog-Saluki).

La relevancia de esta ficha es doble: por un lado documenta un caso de modelo "uncensored" derivado por ablación, una práctica extendida en la comunidad open source; por otro, ilustra la complejidad de trazabilidad cuando un repositorio agrega decenas de variantes cuantizadas con parches propios y kernels no estándar. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention); detalles completos no disponibles |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | hasta 1.048.576 tokens con rope scaling yarn (contexto original declarado 262.144) |
| Tipos de cuantización | BF16, Q8_0, Q8_0_L, Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_L, Q2_K_L, UD-IQ1_S, ternaria (PTQ1 convertida a Q2_K/Q3_K), 2-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27B parámetros. La model card menciona explícitamente "hybrid-attention" entre sus etiquetas, lo que sugiere una combinación de mecanismos de atención (posiblemente atención lineal o SSM junto con atención completa) aunque no se detalla la proporción ni el diseño exacto. También se menciona un componente "MTP" (multi-token prediction) que, según la card, no ha sido modificado por el proceso de ablación, y un módulo visual que tampoco se ha alterado, coherente con el pipeline image-text-to-text.

El proceso de entrenamiento original del modelo base no se documenta en la información disponible. Lo que sí se describe con detalle es el procedimiento de derivación: abliteration mediante eliminación de direcciones de rechazo sin usar TransformerLens, siguiendo el enfoque de remove-refusals-with-transformers. En las primeras versiones se retuvieron las primeras 15 capas sin ablacionar; en versiones posteriores (series UD) se ablacionaron las capas 17 a 52, y en las series más recientes (Ternary, Swift, Underdog-Saluki) solo las capas 22 a 52. Además, para las cuantizaciones por debajo de Q8_0 se reconvirtieron a Q8_0 los pesos objetivo de la ablación (token_embd, output, ffn_down, ssm_out, attn_output), lo que explica que Q2_K_L pueda ser mayor que Q3_K o Q4_K. No se dispone de datos sobre volumen de tokens, composición del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado image-text-to-text.
- Procesamiento de imágenes junto con texto (módulo visual presente y no modificado por la ablación).
- Razonamiento multi-paso y soporte de agentes, inferido del modelo base Qwen3.8 y de la etiqueta conversational.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Modo "uncensored": el objetivo declarado de la ablación es eliminar las respuestas de rechazo del modelo original.
- Ejecución on-device mediante cuantizaciones de 2 bits y ternarias, con soporte declarado para CUDA y Metal.
- Contexto largo de hasta 1M tokens mediante rope scaling yarn.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo, comparando las variantes con distinto número de capas ablacionadas (15 primeras retenidas, capas 17-52, capas 22-52) para aislar el efecto por capa.
- Evaluación de cuantizaciones extremas: las series Q2_K_L, UD-IQ1_S y ternaria permiten medir la degradación de calidad frente a BF16 en un modelo de 27B, útil para decidir qué cuantización desplegar en hardware limitado.
- Despliegue on-device con llama.cpp: las variantes de 2 bits y ternarias, junto con los tags cuda y metal, permiten ejecutar el modelo en estaciones de trabajo o equipos con GPU de consumo, usando el fork PrismML-Eng/llama.cpp para los kernels ternarios.
- Procesamiento de documentos con imágenes y contexto largo: con ventana de hasta 1M tokens y entrada image-text-to-text, el modelo puede ingerir documentos extensos con figuras y mantener el contexto a lo largo de la conversación.
- Servicio de inferencia con llama-server: la model card documenta un despliegue concreto con llama-server, mmproj para el módulo visual, -ngl 99, flash attention y rope scaling yarn, lo que facilita replicar el entorno en producción.
- Aplicaciones creativas o de rol sin restricciones de rechazo: el propósito declarado del modelo es eliminar las negativas, lo que encaja en generación creativa, ficción o simulación de personajes donde el modelo base rechazaría contenido.
- Pruebas de robustez y red teaming: al ser una variante abliterated, sirve como sujeto de prueba para clasificadores de contenido y filtros de seguridad en pipelines de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 54,6 GB solo para pesos (27,32B parámetros × 2 bytes), más overhead de contexto y caché KV; la model card documenta su ejecución en 2× RTX 6000 Pro.
- VRAM estimada para Q8_0: aproximadamente 27 GB para pesos; para Q4_K: en torno a 14-16 GB; para Q2_K y variantes de 2 bits: en torno a 7-9 GB, aunque los pesos objetivo de ablación se almacenan en Q8_0, lo que incrementa el tamaño real.
- GPU recomendadas: RTX 6000 Pro (documentada), A100/H100 para BF16 con contexto largo; RTX 4090 y GPUs de 24 GB para cuantizaciones Q4/Q5; GPUs de consumo de 8-16 GB para las variantes de 2 bits y ternarias.
- Despliegue: llama.cpp / llama-server (documentado), con soporte de mmproj para visión; el fork PrismML-Eng/llama.cpp es obligatorio para las variantes ternarias ("Stock llama.cpp will not run these files"). No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Contexto largo: para 1M tokens se requiere rope scaling yarn con --rope-scale 4 y --yarn-orig-ctx 262144, y caché KV en bf16 (--cache-type-k bf16 --cache-type-v bf16), lo que eleva notablemente los requisitos de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| woan12/tu (este) | 27,32B | hasta 1M (yarn) | Apache 2.0 | safetensors, GGUF | Variante abliterated de Qwen3.8-27B, multimodal, múltiples series de cuantización |
| Qwen/Qwen3.8-27B | 27B (según base_model) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Modelo base original, con rechazos intactos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | 1M (yarn) | Apache 2.0 | GGUF | Referencia citada en la model card; mismo enfoque de ablación |
| unsloth/Qwen3.8-27B-GGUF | 27B | no disponible en esta ficha | no disponible en esta ficha | GGUF (UD-IQ1_S a BF16) | Cuantizaciones estándar de Unsloth usadas como fuente de las series UD y UD-DW |

La información disponible no permite comparar rendimiento numérico entre estos modelos; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- La ablación elimina los rechazos de forma deliberada: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas del modelo base. No es apto para aplicaciones orientadas al público sin capas de moderación externas.
- El propio autor describe el método como "crude, proof-of-concept": no hay garantía de que la ablación sea completa ni de que no degrade otras capacidades.
- Las ablaciones parciales (solo capas 17-52 o 22-52) dejan capas sin modificar, por lo que el comportamiento puede ser inconsistente entre variantes del mismo repositorio.
- Las cuantizaciones por debajo de Q8_0 reconvierten pesos objetivo a Q8_0, de modo que los tamaños no siguen la progresión habitual y la calidad puede diferir de una cuantización estándar.
- Las variantes ternarias requieren un fork específico de llama.cpp; no funcionan con llama.cpp estándar, lo que limita la portabilidad.
- El tamaño del repositorio (865,3 GB) y la multiplicidad de series hacen difícil verificar la procedencia exacta de cada archivo; conviene validar checksums antes de usar en producción.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No hay benchmarks publicados en la información disponible; no se puede afirmar nada sobre la degradación de MMLU, HumanEval o GSM8K respecto al base.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de una variante uncensored puede conllevar obligaciones adicionales de moderación según la jurisdicción; conviene revisar los términos del modelo base Qwen.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de esta familia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woan12/tu
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Modelo de referencia huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Serie Ternary-Bonsai: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Instrucciones del parche Unsloth: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/tree/main/patch-unsloth
