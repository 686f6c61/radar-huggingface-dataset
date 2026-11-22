# zanezhang666/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF es una versión cuantizada en formato GGUF y sometida a *abliteration* del modelo DeepSeek-V4-Flash-0731 de DeepSeek. La abliteration es una técnica que elimina o atenúa la dirección de rechazo en el espacio de activaciones del transformer para reducir la tasa de respuestas negativas del modelo ante peticiones sensibles, sin reentrenar los pesos. El resultado es un modelo "uncensored" orientado a investigación y experimentación, no a producción pública.

El modelo base es un Mixture-of-Experts (MoE) de 284.334.567.511 parámetros totales, según los datos de safetensors del repositorio. El repositorio GGUF ocupa 549,3 GB e incluye cuantizaciones de 2 bits y 4 bits (iq2_xxs, q2_k, q4_k), lo que permite desplegarlo en configuraciones de hardware muy distintas, desde Apple Silicon con Metal hasta GPUs únicas o múltiples con CUDA.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras cuantizaciones GGUF publicadas de la familia DeepSeek-V4-Flash; por otro, advierte de que se trata de un artefacto experimental con filtrado de seguridad reducido, licencia MIT y sin garantías del autor. Es un caso de estudio útil para quienes investigan alineación, robustez de rechazos y despliegue de MoE de gran tamaño en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, según tags del repositorio |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor de `-c` en el ejemplo de llama.cpp de la model card) |
| Tipos de cuantizacion | iq2_xxs, q2_k, q4_k (2-bit y 4-bit); el ejemplo de ds4 menciona Q2 y Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF; también archivos DSpark (pre y post abliteration) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts, tal como indican los tags `moe` y `mixture-of-experts` del repositorio. No se dispone de información detallada sobre el número de expertos, el tamaño de los expertos activos por token ni la composición del dataset de entrenamiento en la información proporcionada. Tampoco se documentan las etapas de alineación (RLHF, DPO u otras) del modelo original en esta ficha.

La innovación técnica de esta variante concreta es la abliteration: se calcula una dirección de rechazo a partir de las activaciones y se proyecta fuera de los pesos para reducir la probabilidad de respuestas de negativa. La model card indica que la abliteration es "cruda" y de prueba de concepto, que no se ablacionaron los módulos de expertos y que la cuantización Q4 usó una intensidad de abliteration mayor que Q2, por lo que la tasa de rechazo es menor en Q4. Los GGUF provienen de `antirez/deepseek-v4-gguf` y los archivos DSpark de `unsloth/DeepSeek-V4-Flash-0731-GGUF`.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation`.
- Razonamiento y generación de código, heredados del modelo base DeepSeek-V4-Flash (no verificado en esta ficha).
- Soporte de contexto largo: hasta 262.144 tokens según el ejemplo de llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso como servicio HTTP.
- Despliegue en Apple Silicon vía Metal y en CUDA vía ds4.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazos: comparar la tasa de respuestas negativas entre el modelo base y esta variante abliterated para estudiar la robustez de los mecanismos de seguridad en MoE de gran tamaño.
- Evaluación de cuantizaciones extremas: medir la degradación de calidad de iq2_xxs y q2_k frente a q4_k en un MoE de 284B parámetros, útil para decidir qué cuantización desplegar en hardware limitado.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, permite resumir o analizar corpus extensos en una sola pasada sobre Apple Silicon o una GPU única con ds4.
- Pruebas de despliegue en Apple Silicon: validar el rendimiento de un MoE de gran tamaño con Metal y llama.cpp en Macs con memoria unificada amplia.
- Desarrollo de pipelines de CI/CD para GGUF: usar los archivos DSpark pre y post abliteration para verificar la reproducibilidad de la cuantización y de la abliteration.
- Entornos controlados de red teaming: generar contenido sensible de forma supervisada para auditar filtros de moderación propios, con revisión manual obligatoria.
- Benchmarking de inferencia MoE: comparar throughput y latencia entre ds4 en una GPU, ds4 en múltiples GPUs y llama.cpp en CPU/Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 549,3 GB, lo que incluye todas las cuantizaciones y los archivos DSpark. La cuantización Q2 es la más pequeña y la única con ejemplo de ejecución en GPU única.
- VRAM estimada: no disponible de forma explícita. La cuantización Q2 de un modelo de 284B parámetros implica, como mínimo, varias decenas de GB de pesos, además de caché KV para el contexto elegido; con 32.768 tokens de contexto en ds4 el consumo adicional es significativo.
- GPU recomendadas: no especificadas en la información. El ejemplo de ds4 usa `CUDA_VISIBLE_DEVICES=0` para una GPU y `0,1` para dos GPUs, sin indicar modelos concretos.
- Apple Silicon: soportado vía Metal en llama.cpp, según los tags `apple-silicon` y `metal`.
- Opciones de despliegue: llama.cpp (`llama-cli`), ds4 (rama `ds4f-mxfp4`) y, por los tags, endpoints compatibles. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF | 284.334.567.511 | 262.144 | MIT | GGUF | Abliterated, cuantizado 2/4-bit |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Modelo base original, con filtrado de seguridad estándar |
| unsloth/DeepSeek-V4-Flash-0731-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantización sin abliteration, fuente de los DSpark |
| antirez/deepseek-v4-gguf | no disponible | no disponible | no disponible | GGUF | Origen de los GGUF de esta ficha |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteration elimina parte de los rechazos, por lo que puede generar contenido sensible, controvertido o inapropiado. El propio autor desaconseja su uso en producción o en aplicaciones públicas.
- No apto para todos los públicos: los outputs pueden ser inadecuados para menores o para entornos con requisitos de seguridad altos.
- Abliteration incompleta: los módulos de expertos no fueron ablacionados y la implementación es de prueba de concepto, por lo que el comportamiento es irregular entre cuantizaciones (Q4 ablaciona con más intensidad que Q2).
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente mayor en cuantizaciones de 2 bits.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero el autor declina toda responsabilidad y recomienda uso exclusivamente de investigación en entornos controlados.
- Sin garantías de seguridad por defecto: el autor no asume responsabilidad por las consecuencias del uso.
- Contexto largo: 262.144 tokens es el valor de ejemplo de llama.cpp; el consumo real de memoria y la degradación de calidad a esa longitud no están documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- GGUF de origen: https://huggingface.co/antirez/deepseek-v4-gguf
- GGUF de Unsloth con DSpark: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Repositorio ds4: https://github.com/antirez/ds4/tree/ds4f-mxfp4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Técnica de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Perfil del autor en X: https://x.com/support_huihui
- Ko-fi del autor: https://ko-fi.com/huihuiai
