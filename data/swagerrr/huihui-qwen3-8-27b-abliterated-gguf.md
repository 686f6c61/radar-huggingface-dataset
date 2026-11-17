# swagerrr/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario swagerrr en formato GGUF para su uso con llama.cpp y entornos compatibles. La técnica de abliteración elimina la dirección de activación asociada a los rechazos en el espacio latente del transformer, de modo que el modelo deja de negarse a responder a ciertas peticiones. El modelo base tiene 27.320.697.856 parámetros (~27B) y una arquitectura híbrida con atención lineal (linear/hybrid attention) según las etiquetas de la model card.

La model card original corresponde a huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF, de la que esta publicación parece ser una réplica o espejo bajo el usuario swagerrr. La ficha describe múltiples variantes de cuantización derivadas de otros repositorios (unsloth, ISTA-DASLab, prism-ml, ConwayResearch, ukisai), incluyendo versiones ternarias de 2 bits orientadas a ejecución en dispositivo (on-device) y una variante con contexto de 1M tokens mediante RoPE scaling yarn.

Es relevante por tres motivos: ofrece una vía para ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones agresivas (hasta 2 bits ternario), incluye soporte multimodal image-text-to-text (con proyector mmproj), y documenta un proceso de abliteración parcial por capas (solo capas 17-52 o 22-52 según la variante) que busca preservar el rendimiento del modelo original. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 865,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (hybrid-attention), según etiquetas de la model card; detalles de capas no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos (según `--yarn-orig-ctx`); extensible a 1.048.576 tokens con RoPE scaling yarn (factor 4) |
| Tipos de cuantizacion | BF16, Q8_0_L, Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_L, Q2_K_L, UD-IQ1_S hasta BF16 (vía patch), ternario PTQ1/2-bit (PrismML), GSQ-RCO |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base; repo incluye mmproj para visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con atención híbrida (combinación de atención estándar y mecanismos lineales), según las etiquetas `hybrid-attention` y `qwen3` de la model card. Los pesos se distribuyen en 27.320.697.856 parámetros. La model card menciona componentes `ssm_out` y `MTP` (multi-token prediction), lo que sugiere la presencia de capas de estado espacio-temporal (SSM) y cabezas de predicción multi-token, aunque la documentación no detalla su disposición exacta.

El proceso de abliteración se aplica de forma parcial: en la variante principal solo se ablacionan las capas 17 a 52 (indexación 0-based), reteniendo las primeras 15 capas sin modificar; en las variantes Swift, Ternary, GSQ-RCO y Underdog-Saluki solo se ablacionan las capas 22 a 52. Los módulos MTP y visual no se modifican. Para las cuantizaciones por debajo de Q8_0, los tensores objetivo de abliteración (`token_embd`, `output`, `ffn_down`, `ssm_out`, `attn_output`) se convierten a Q8_0 (sufijo `K_L`) o BF16 (sufijo `Q8_0_L`) para preservar la calidad de respuesta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Procesamiento de imágenes: el repo incluye `mmproj-model-bf16.gguf`, proyector multimodal para llama.cpp.
- Razonamiento y generación de código (heredado de la familia Qwen3, no verificado en esta variante).
- Ejecución en dispositivo (on-device) mediante cuantizaciones de 2 bits y ternarias, con kernels específicos para CUDA y Metal.
- Contexto largo: hasta 1M tokens con RoPE scaling yarn (requiere `--rope-scaling yarn --rope-scale 4 --yarn-orig-ctx 262144`).
- Sin rechazos (uncensored): la abliteración elimina las respuestas de negativa del modelo base.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat en llama.cpp.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, comparando respuestas con el modelo base Qwen3.8-27B para analizar qué direcciones de activación codifican las negativas.
- Generación de contenido creativo sin restricciones temáticas: útil para escritura de ficción que aborde temas sensibles donde el modelo base rechazaría la petición; requiere revisión humana por el riesgo de contenido inapropiado.
- Despliegue en hardware de consumo: las variantes Q2_K_L y ternarias permiten ejecutar un modelo de ~27B en GPU consumer (RTX 4090, 24 GB) o incluso en dispositivos con Metal, gracias a la reducción de huella de memoria.
- Procesamiento de documentos largos con visión: el contexto de 1M tokens junto con el proyector mmproj permite analizar transcripciones, informes o capturas extensas en una sola pasada con llama-server.
- Experimentación con cuantización extrema: el repo sirve como banco de pruebas para comparar calidad entre Q2_K_L, GSQ-RCO, ternario y BF16 sobre el mismo modelo base, evaluando el impacto de la abliteración parcial por capas.
- Servicio local de chat multimodal: con `llama-server --jinja` se puede montar una API compatible con OpenAI endpoints para prototipos internos de asistente conversacional con entrada de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 requiere ~54,6 GB (2 bytes/parámetro × 27,3B); Q8_0 ~29 GB; Q6_K ~22 GB; Q4_K ~16-17 GB; Q3_K ~12-13 GB; Q2_K ~8-9 GB; ternario 2-bit ~7 GB (estimaciones teóricas, no verificadas en la model card).
- GPU recomendadas: la model card cita 2× RTX 6000 Pro para BF16 con contexto de 1M tokens; para cuantizaciones bajas se puede usar una sola RTX 4090 (24 GB), RTX 3090 o A100/H100 para servir a mayor concurrencia.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con Q4_K_L o inferior; en GPUs de 8-12 GB solo con Q2_K_L o ternario.
- Opciones de despliegue: llama.cpp (llama-server), forks específicos para kernels ternarios (PrismML-Eng/llama.cpp); stock llama.cpp no ejecuta los ficheros ternarios. Compatible con endpoints tipo OpenAI (`endpoints_compatible`).
- Latencia y throughput: no disponibles. La model card solo documenta la invocación con `-ngl 99 -fa on -b 4096 -ub 1024` para BF16 en 2× RTX 6000 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF (este) | 27,3B | 262K nativo / 1M con yarn | Apache 2.0 | GGUF | Sin rechazos, multimodal, cuantizaciones extremas |
| Qwen/Qwen3.8-27B (base) | 27,3B | 262K (según yarn-orig-ctx) | Apache 2.0 | safetensors | Modelo original con alineación y rechazos |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | No disponible | Apache 2.0 | GGUF (UD-IQ1_S a BF16) | Cuantizaciones dinámicas Unsloth del base |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27B | No disponible | No disponible | GGUF ternario | Requiere fork de llama.cpp con kernels ternarios |

## Limitaciones y advertencias

- La abliteración es un proof-of-concept "crudo" según la propia model card; puede degradar capacidades de razonamiento, coherencia y adherencia a instrucciones respecto al modelo base.
- Solo se ablacionan capas parciales (17-52 o 22-52 según variante); el comportamiento sin rechazos puede ser inconsistente entre consultas.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado al no existir capa de rechazo; no apto para producción sin filtros externos.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados en la información disponible.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingüe.
- Las cuantizaciones por debajo de Q8_0 no son estándar (tensores mezclados Q8_0/BF16), lo que puede provocar tamaños de fichero atípicos (Q2_K_L mayor que Q3_K) y problemas de compatibilidad.
- Los ficheros ternarios requieren el fork PrismML-Eng/llama.cpp; no funcionan en llama.cpp estándar.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 865,3 GB; la autoría real corresponde a huihui-ai, por lo que esta publicación debe tratarse como espejo no oficial.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de rechazos traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- Fecha de creación declarada 2026-11-17, posterior a la fecha actual de muchos entornos; verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/swagerrr/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Técnica de abliteración (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo ternario (prism-ml): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Underdog-Saluki-27B-1.0 (ConwayResearch): https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF (ukisai): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
