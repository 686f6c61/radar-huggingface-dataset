# zanezhang666/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario zanezhang666 en Hugging Face. La abliteración es una técnica que identifica y elimina las direcciones de activación asociadas a las respuestas de rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. El resultado es un modelo "uncensored" orientado a experimentación, no a producción convencional.

El modelo conserva la arquitectura del Qwen3.8-27B original (transformer híbrido con atención, capas MTP y torre visual, según los tags y las referencias del autor) y se distribuye en formato GGUF con múltiples variantes de cuantización, incluyendo una serie "ternary" de 2 bits derivada de prism-ml/Ternary-Bonsai-2-27B-gguf y series derivadas de ISTA-DASLab, unsloth, ukisai y ConwayResearch. El repositorio ocupa 799,7 GB e incluye numerosos ficheros de cuantización, lo que refleja un trabajo de empaquetado más que un entrenamiento nuevo.

Es relevante ahora porque ejemplifica una práctica creciente en la comunidad open source: la modificación de modelos base para eliminar rechazos, combinada con cuantizaciones agresivas (2-3 bits) para inferencia en dispositivo. No obstante, es un proof-of-concept declarado por el propio autor, con cero descargas y cero likes en el momento de la ficha, y con advertencias explícitas sobre su naturaleza experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + MTP + torre visual, según tags y model card); detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 262144`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, bf16, variantes `_L` (K_L, Q8_0_L), series UD, UD-DW, GSQ-RCO, Swift, Ternary, Underdog-Saluki; cuantización ternaria de 2 bits (PTQ1 convertida parcialmente a Q2_K/Q3_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como librería declarada; también safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer de 27,3 mil millones de parámetros. Los tags del repositorio mencionan "hybrid-attention", "MTP" (multi-token prediction) y una torre visual ("visual"), lo que sugiere una arquitectura híbrida con atención lineal o eficiente, predicción multi-token y capacidades de imagen-texto (pipeline `image-text-to-text`). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación principal es la abliteración: se eliminan las direcciones de activación asociadas a rechazos mediante la técnica descrita en el repositorio `Sumandora/remove-refusals-with-transformers`. El autor indica que en las primeras versiones se retuvieron las primeras 15 capas sin abliterar y que MTP y la parte visual no se modificaron; en actualizaciones posteriores se abliteraron solo las capas 17-52 o 22-52 (indexación 0-based), según la serie. Para las cuantizaciones por debajo de Q8_0, los tensores objetivo de la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se convierten a Q8_0 (sufijo `_L`) para preservar calidad; en Q8_0_L se convierten a BF16. Las series Ternary requieren el fork PrismML-Eng/llama.cpp, no el llama.cpp estándar.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque el autor indica que la parte visual no se ha modificado respecto al base.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-27B, sin datos específicos publicados.
- Generación de código: heredada del base, sin benchmarks publicados en la información disponible.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles.
- Modo "uncensored": eliminación de rechazos mediante abliteración, orientada a respuestas sin filtros.
- Predicción multi-token (MTP) según los tags del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos cambian al eliminar las direcciones de rechazo, comparando respuestas con el Qwen3.8-27B original en el mismo prompt.
- Evaluación de técnicas de abliteración: sirve como caso de estudio para medir la degradación de calidad y la pérdida de capacidades tras ablacionar capas concretas (17-52 o 22-52 según la serie).
- Inferencia en dispositivo con cuantizaciones de 2-3 bits: las series Ternary y Q2_K_L permiten probar modelos de 27B en hardware con memoria limitada, usando el fork PrismML-Eng/llama.cpp para los kernels ternarios.
- Pruebas de robustez de filtros: equipos de seguridad pueden usar el modelo para generar respuestas que un modelo alineado rechazaría y evaluar sus propios clasificadores de contenido.
- Experimentación con llama.cpp y Ollama: el autor proporciona instrucciones directas (`llama-cli -m ... -c 262144` y `ollama run huihui_ai/Qwen3.8-abliterated`) para desplegar el modelo en local.
- Comparación de pipelines de cuantización: las series UD, UD-DW, GSQ-RCO, Swift y Underdog-Saluki permiten comparar el efecto de distintas estrategias de cuantización sobre un mismo modelo abliterado.
- Docencia y demostraciones: ilustra el flujo completo de abliteración, conversión a GGUF y publicación de variantes, con comandos `llama-quantize` documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 27,3 mil millones de parámetros en bf16 requiere aproximadamente 55 GB de VRAM; en Q8_0, unos 29 GB; en Q4_K, unos 16-17 GB; en Q2_K, unos 9-10 GB. Estas cifras son estimaciones por tamaño de pesos, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, un modelo en bf16 requeriría A100 80 GB o H100; en Q4_K podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en Q2_K en GPUs de 12-16 GB.
- Consumer GPU: probablemente viable en RTX 4090/3090 con cuantizaciones Q4_K o inferiores, y en GPUs de 12 GB con Q2_K, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp (última versión), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), y el fork PrismML-Eng/llama.cpp para las series Ternary. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Abliterado, múltiples cuantizaciones, proof-of-concept |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible en la información | safetensors | Modelo original alineado, sin abliterar |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | no disponible | no disponible | GGUF ternario 2-bit | Origen de la serie Ternary; requiere fork de llama.cpp |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B (base) | no disponible | no disponible | GGUF | Origen de las series UD y UD-DW; cuantizaciones dinámicas de Unsloth |

## Limitaciones y advertencias

- Modelo declarado por el autor como "crude, proof-of-concept": no apto para producción sin validación exhaustiva.
- Cero descargas y cero likes en el momento de la ficha: sin evidencia de uso comunitario ni validación independiente.
- La abliteración puede degradar capacidades del modelo base; el autor no publica métricas de calidad comparativas.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse eliminado los rechazos; requiere filtros externos si se despliega en aplicaciones con usuarios.
- Riesgo de alucinación: no cuantificado, pero presente en cualquier LLM y potencialmente agravado por las cuantizaciones agresivas (Q2_K, ternario 2-bit).
- Las series Ternary solo funcionan con el fork PrismML-Eng/llama.cpp; llama.cpp estándar no las ejecuta.
- Los tamaños de las cuantizaciones `_L` no son estándar: Q2_K_L puede ser mayor que Q3_K o Q4_K.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza uncensored traslada al desplegador la responsabilidad legal y ética del contenido generado.
- El repositorio ocupa 799,7 GB, lo que dificulta su descarga completa; conviene descargar solo la cuantización necesaria.
- La model card incluye una sección "Usage Warnings" truncada en la información disponible; se recomienda consultar el README completo antes de usar.

## Enlaces

- Hugging Face: https://huggingface.co/zanezhang666/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Origen serie Ternary: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Origen serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Origen series UD y UD-DW: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Origen serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Origen serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de Ollama: https://github.com/ollama/ollama/releases
