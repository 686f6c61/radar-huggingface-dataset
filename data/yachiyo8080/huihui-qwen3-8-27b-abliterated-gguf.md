# yachiyo8080/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario yachiyo8080 en Hugging Face y basada en el trabajo de huihui-ai. La abliteración es una técnica que modifica direccionalmente los pesos del modelo para eliminar sus comportamientos de negación (refusals) sin necesidad de reentrenamiento ni de herramientas como TransformerLens. El resultado se distribuye en formato GGUF con un amplio abanico de cuantizaciones, desde ternario de 2 bits hasta BF16.

El modelo base, Qwen3.8-27B, es un modelo multimodal (image-text-to-text) de 27.320.697.856 parámetros con atención híbrida y MTP (multi-token prediction), cuyo pipeline permite procesar tanto texto como imágenes. La versión abliterada conserva intactos los componentes de MTP y visión, y solo ablitera un subconjunto de capas (en las series más recientes, las capas 22 a 52 con indexación base 0), lo que ayuda a preservar el rendimiento original.

Su relevancia actual radica en la demanda de modelos locales sin censura para investigación, pruebas de seguridad y casos de uso creativos, combinada con cuantizaciones agresivas (ternario 2 bits, kernels de atención híbrida de PrismML) que permiten ejecutar un modelo de 27B en hardware de consumo. Cabe destacar que las variantes ternarias requieren un fork específico de llama.cpp y no funcionan con la versión estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention) y MTP; multimodal (image-text-to-text) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | Ternario 2 bits (IQ2-mix), Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K_L, Q8_0_L, BF16 (con variantes GSQ-RCO, UD, UD-DW, Swift, Ternary, Underdog-Saluki) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con atención híbrida (hybrid-attention), un mecanismo que combina distintos tipos de capas de atención para reducir el coste de contexto largo, y MTP (multi-token prediction) para acelerar la decodificación. Incluye además un componente visual, ya que su pipeline es image-text-to-text. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

La abliteración se aplicó de forma selectiva: en las series más recientes solo se abliteran las capas 22 a 52 (indexación base 0), manteniendo las capas anteriores intactas para conservar el rendimiento original. Además, el autor realizó una optimización de cuantización: en las versiones por debajo de Q8_0, los tensores afectados por la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se recalculan a Q8_0 (denominados Q2_K_L a Q6_K_L), y en la versión Q8_0_L esos tensores se elevan a BF16. Esto hace que algunas cuantizaciones "L" ocupen más espacio que cuantizaciones nominalmente superiores. Las variantes ternarias de PrismML (Ternary-Bonsai-2-27B) usan kernels de atención híbrida ternarios que solo funcionan con el fork PrismML-Eng/llama.cpp. Algunas series (Swift, Underdog-Saluki, GSQ-RCO) provienen de mezclas de pesos GGUF de otros repositorios y se publican como pruebas de validación.

## Capacidades

- Generacion de texto conversacional sin mecanismos de rechazo (abliterated), manteniendo las capacidades del modelo base Qwen3.8-27B.
- Comprension multimodal de imagenes y texto (pipeline image-text-to-text); el componente visual no fue modificado por la abliteracion.
- Contexto largo de hasta 262.144 tokens segun la configuracion de ejemplo.
- Decodificacion acelerada mediante MTP (multi-token prediction), intacto tras la abliteracion.
- Ejecucion local en CPU y GPU via llama.cpp (CUDA y Metal) y Ollama, apto para despliegue on-device.
- Compatibilidad con multiples cuantizaciones, incluido formato ternario de 2 bits con kernels especializados.
- No se indica soporte de tool calling, function calling ni agentes en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de LLMs: al eliminar los refusals, permite estudiar el comportamiento del modelo ante entradas adversarias sin que la capa de alineacion enmascare los resultados.
- Redaccion creativa sin restricciones: util para escritores que necesitan generar contenido que los modelos alineados suelen rechazar, aprovechando el contexto de 262K tokens para trabajar con novelas o guiones extensos.
- Asistentes locales con privacidad: ejecucion on-device via Ollama o llama.cpp sin enviar datos a servicios externos, adecuado para entornos donde la confidencialidad es prioritaria.
- Analisis de documentos largos multimodales: la ventana de contexto amplia y el componente visual permiten procesar documentos con imagenes y texto extenso en una sola sesion.
- Pruebas de hardware con cuantizacion extrema: las variantes ternarias de 2 bits y los kernels de PrismML son utiles para evaluar el rendimiento de cuantizacion agresiva en GPUs de consumo.
- Experimentacion con tecnicas de abliteracion selectiva: las multiples series (UD, Swift, Ternary, GSQ-RCO, Underdog-Saluki) con distintos rangos de capas abliteradas permiten comparar el impacto de la abliteracion parcial sobre la calidad de respuesta.
- Chatbots personales desplegados en Mac (Metal) o PCs con NVIDIA CUDA, usando el canal oficial de Ollama huihui_ai/Qwen3.8-abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la abliteracion parcial (capas 22 a 52) "helps retain more of the original model's performance", pero no aporta metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia indirecta, el tamano del repositorio completo es de 799,7 GB (incluye todas las variantes); los archivos individuales dependen de la cuantizacion elegida (el ternario 2 bits y Q2_K ocupan notablemente menos que BF16, que para 27B ronda los ~54 GB).
- GPUs recomendadas: no disponibles explicitamente. Las variantes Q4_K/Q8_0 de un modelo de 27B requieren tipicamente GPUs con 24 GB de VRAM (RTX 3090/4090) o superiores para carga completa en GPU; no se confirma en la ficha.
- Consumer GPUs: el propio repositorio enfatiza el uso on-device con llama.cpp (CUDA y Metal) y cuantizaciones de 2 bits, lo que apunta a viabilidad en hardware de consumo, especialmente Mac con memoria unificada; no se especifican modelos concretos de GPU.
- Despliegue: llama.cpp (obligatorio el fork PrismML-Eng/llama.cpp para las variantes ternarias; la version estandar de llama.cpp sirve para el resto), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), y libreria transformers. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponibles; el MTP del modelo base sugiere aceleracion de decodificacion, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B | 262.144 tokens (segun ejemplo) | Apache 2.0 | Abliterated, GGUF, multimodal, cuantizacion ternaria 2 bits |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 tokens (segun ejemplo) | no disponible en la ficha | Modelo original con alineacion completa |
| ConwayResearch/Underdog-Saluki-27B-1.0 | 27 B (aprox.) | no disponible | no disponible | Fine-tune comunitario usado como base de una serie abliterada |
| prism-ml/Ternary-Bonsai-2-27B | 27 B (aprox.) | no disponible | no disponible | Cuantizacion ternaria con atencion hibrida, requiere fork de llama.cpp |

## Limitaciones y advertencias

- Al ser un modelo abliterated, elimina los mecanismos de seguridad y rechazo del modelo base: puede generar contenido ofensivo, peligroso o ilegal. Su uso conlleva riesgos eticos y legales significativos.
- Mayor riesgo de alucinacion y degradacion de calidad: la abliteracion modifica pesos directamente y el autor advierte de posibles disclaimers en las series derivadas; algunas series son explicitamente "pruebas de validacion".
- Las variantes ternarias (Ternary-Bonsai) no funcionan con llama.cpp estandar; requieren el fork PrismML-Eng/llama.cpp.
- La cuantizacion no estandar (Q2_K_L mayor que Q3_K/Q4_K) puede confundir al elegir archivos; las conversiones pueden alterar el tamano respecto al GGUF original.
- La abliteracion parcial deja intactas las primeras capas (15 o 17 segun la serie), por lo que el modelo puede conservar ciertos comportamientos de rechazo residuales.
- Idiomas soportados, datos de entrenamiento y benchmarks: no disponibles, lo que dificulta evaluar su idoneidad para produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y las responsabilidades por el contenido generado recaen en el usuario.
- El README original esta truncado en la seccion "Usage Warnings", por lo que pueden existir advertencias adicionales no visibles.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/yachiyo8080/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai referenciado: huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Metodo de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Unsloth GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GSQ-RCO GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Swift-1.5 GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Ternary Bonsai: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama (releases): https://github.com/ollama/ollama/releases
