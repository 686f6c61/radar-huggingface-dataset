# Vier7/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Vier7 en Hugging Face. La técnica de abliteration elimina la dirección de activación asociada a las negativas del modelo, de modo que este deja de rechazar peticiones que el modelo base sí bloquearía. El resultado es un modelo conversacional sin censura, distribuido en formato GGUF para su uso con llama.cpp y compatible con el pipeline image-text-to-text (multimodal).

El modelo base Qwen3.8-27B cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y, según la model card, soporta un contexto de hasta 1.048.576 tokens mediante escalado YaRN (rope-scale 4 sobre una ventana original de 262.144). La model card menciona atención híbrida (hybrid-attention), soporte de MTP (multi-token prediction) y módulo visual, lo que apunta a una arquitectura transformer con componentes de atención lineal/SSM y capacidades multimodales. No se detalla la composición exacta de la arquitectura ni los datos de entrenamiento.

El repositorio es notablemente grande (865,3 GB) porque incluye múltiples series de cuantizaciones derivadas de distintos modelos comunitarios (unsloth, ISTA-DASLab, prism-ml, ConwayResearch, ukisai), además de parches para aplicar la abliteration sobre cuantizaciones existentes. Es relevante para quienes necesitan un modelo de ~27B sin filtros de rechazo, desplegable en local con llama.cpp, aunque la información pública disponible es escasa y el proyecto se presenta explícitamente como una prueba de concepto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con hybrid-attention (atención híbrida), MTP y módulo visual; detalles completos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens (con YaRN, rope-scale 4, ctx original 262.144) |
| Tipos de cuantizacion | GGUF: BF16, Q8_0_L, Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_L, Q2_K_L; además variantes UD, UD-DW, GSQ-RCO, Ternary (PTQ1/Q2_K/Q3_K), Swift, Underdog-Saluki |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con mmproj separado para visión); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B se describe en la model card como "hybrid-attention", con soporte de MTP (multi-token prediction) y un módulo visual que habilita el pipeline image-text-to-text. La presencia de pesos denominados `ssm_out` en la lista de tensores abliterados sugiere componentes de tipo state-space model (SSM) combinados con atención, aunque no se especifica la proporción ni el diseño exacto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación principal de esta ficha es la abliteration: se elimina la dirección de rechazo calculada a partir de las activaciones del modelo, aplicada selectivamente. En las primeras versiones se retuvieron las 15 primeras capas sin ablacionar; en la actualización posterior se ablacionan las capas 17 a 52, y en las series derivadas (Swift, Ternary, Underdog-Saluki) solo las capas 22 a 52, con el objetivo de preservar el rendimiento original. La model card indica que MTP y el módulo visual no se han modificado. Para las cuantizaciones por debajo de Q8_0, los tensores objeto de abliteration (`token_embd`, `output`, `ffn_down`, `ssm_out`, `attn_output`) se convierten a Q8_0 (sufijo `K_L`); en Q8_0 se convierten a BF16 (sufijo `Q8_0_L`). Los kernels de atención híbrida ternaria requieren el fork PrismML-Eng/llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con módulo visual separado (`mmproj`).
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas en esta variante.
- Generación de código: capacidades del modelo base, no verificadas en esta variante.
- Soporte de contexto largo: hasta 1.048.576 tokens con YaRN.
- Multi-token prediction (MTP) heredado del modelo base.
- Ausencia de rechazos (uncensored): responde a peticiones que el modelo base bloquearía.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y multi-step reasoning: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin dirección de rechazo, comparando respuestas con el modelo base para analizar qué se elimina y qué se conserva en la abliteration.
- Procesamiento de documentos largos con imágenes: gracias a la ventana de 1.048.576 tokens y al módulo visual, se puede usar para resumir o extraer información de expedientes extensos que combinen texto e imágenes en un único contexto.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo base aplicaría filtros de rechazo, con control de estilo mediante prompting.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF con cuantizaciones desde Q2_K_L, permite ejecutar un modelo de ~27B en hardware de consumo o en servidores con dos GPUs, usando llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio incluye múltiples series (UD, UD-DW, GSQ-RCO, Ternary, Swift, Underdog-Saluki) que permiten medir el impacto de cada esquema de cuantización en la calidad de respuesta.
- Pruebas de robustez y red-teaming: útil para generar respuestas ante prompts adversarios y evaluar la eficacia de filtros externos o clasificadores de seguridad en un pipeline de moderación.
- Aplicaciones de visión-lenguaje experimentales: con el `mmproj` se pueden probar tareas de descripción de imágenes o VQA en local, siempre que el hardware soporte el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~27,3 B en BF16 requiere del orden de 54 GB solo para pesos; en Q8_0 alrededor de 27 GB; en Q4_K alrededor de 14-16 GB; en Q2_K alrededor de 8-10 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados.
- La model card documenta una configuración de referencia con 2× RTX 6000 Pro para BF16 con contexto de 1.048.576 tokens, `-ngl 99`, `-fa on`, YaRN y caché K/V en BF16.
- GPU recomendadas: RTX 6000 Pro (documentada), A100/H100 para despliegues de mayor escala (no confirmado en la información disponible).
- Cabe en GPU de consumo en cuantizaciones bajas (Q2_K_L, Q3_K_L, Q4_K_L) según el tamaño real de cada archivo, que no se detalla.
- Opciones de despliegue: llama.cpp (`llama-server`), con `--jinja`; las variantes Ternary requieren el fork PrismML-Eng/llama.cpp y no funcionan en llama.cpp estándar. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | ~27,3 B | 1.048.576 (YaRN) | apache-2.0 | GGUF | Sin rechazos; multimodal; múltiples series de cuantización |
| Qwen/Qwen3.8-27B (base) | ~27,3 B | 1.048.576 (según model card) | apache-2.0 | safetensors | Modelo original con alineación de rechazos |
| unsloth/Qwen3.8-27B-GGUF | ~27,3 B | no disponible | apache-2.0 (heredada) | GGUF | Cuantizaciones estándar del base; sirve de origen a varias series |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27 B | no disponible | no disponible | GGUF ternario | Requiere fork de llama.cpp; origen de la serie Ternary |

## Limitaciones y advertencias

- La abliteration es una prueba de concepto "cruda": puede degradar capacidades del modelo base y no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Ausencia de rechazos: el modelo puede generar contenido dañino, ilegal o sexualmente explícito; requiere moderación externa en cualquier despliegue público.
- Sesgos: no documentados en la información disponible; hereda los del modelo base, que tampoco se detallan.
- Riesgo de alucinación: no evaluado en esta variante; previsiblemente similar o superior al del base tras la modificación de pesos.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Las cuantizaciones por debajo de Q8_0 no son estándar (sufijos `K_L`), por lo que los tamaños de archivo pueden no corresponder a los esperados (por ejemplo, Q2_K_L puede ser mayor que Q3_K).
- Las series Swift, Ternary y Underdog-Saluki solo ablacionan las capas 22 a 52 y pueden incluir avisos adicionales; están marcadas como test/validación.
- Los archivos Ternary requieren el fork PrismML-Eng/llama.cpp; llama.cpp estándar no los ejecuta.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el usuario.
- El repositorio ocupa 865,3 GB; descargar el conjunto completo no es práctico y conviene seleccionar archivos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vier7/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Ternary Bonsai (prism-ml): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Underdog-Saluki (ConwayResearch): https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Swift-1.5 (ukisai): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- README del parche unsloth: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/tree/main/patch-unsloth
