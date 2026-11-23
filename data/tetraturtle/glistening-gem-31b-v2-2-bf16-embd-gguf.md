# tetraturtle/Glistening-Gem-31B-v2.2-BF16-embd-GGUF

## Resumen

Glistening-Gem-31B-v2.2-BF16-embd-GGUF es una redistribución de cuantizaciones GGUF del modelo Glistening-Gem-31B-v2.2, un modelo de lenguaje conversacional de aproximadamente 32.100 millones de parámetros. El autor de esta variante, tetraturtle, parte de las cuantizaciones i1 generadas por mradermacher a partir del modelo original publicado por sophosympatheia, y aplica una modificación concreta: restaurar la tabla de embeddings de tokens de entrada (`token_embd.weight`) a precisión BF16 sin pérdida, manteniendo el resto de tensores en sus cuantizaciones originales.

El problema que resuelve esta variante es acotado pero específico: en las cuantizaciones estándar, la tabla de embeddings de entrada se cuantiza a Q5_K o Q6_K, lo que introduce una pérdida de precisión en la representación de cada token antes de que se ejecute la primera capa del transformer. Al mantener esa tabla en BF16, se elimina esa pérdida en las 262.144 entradas del vocabulario del modelo base (Gemma 4). El coste computacional es prácticamente nulo porque las búsquedas de embeddings son operaciones de selección de filas (`GGML_OP_GET_ROWS`) y no multiplicaciones matriciales densas.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de post-procesado de GGUF poco habitual (desacoplar el LM head de los embeddings atados y restaurar solo la tabla de entrada en BF16); por otro, sirve como referencia práctica para quienes despliegan modelos de ~31B en llama.cpp o ik_llama.cpp y quieren maximizar la fidelidad del tokenizador sin asumir el coste de VRAM de una tabla BF16 completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4, según la model card); detalles de capas y atención no disponibles |
| Parametros totales | 32.106.631.740 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K (todas con `token_embd.weight` en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Glistening-Gem-31B-v2.2, derivado de la familia Gemma 4 según la model card del repositorio. La arquitectura es un transformer con embeddings atados en el modelo original: el tensor `output.weight` (LM head) estaba omitido y compartía pesos con `token_embd.weight`. El vocabulario tiene 262.144 tokens. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto en la información proporcionada.

El proceso de esta variante es puramente de post-procesado de cuantización, no de entrenamiento. El pipeline descrito por el autor copia primero el `token_embd.weight` cuantizado original a `output.weight` para desatar el LM head y mantenerlo cuantizado en GPU, y después sustituye `token_embd.weight` por el tensor BF16 exacto extraído del modelo safetensors original de sophosympatheia. Las cuantizaciones i1 de mradermacher emplean imatrix (matriz de importancia) para calibrar la cuantización. No hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica un ajuste orientado a diálogo.
- Razonamiento y generación de texto general: capacidades heredadas del modelo base Gemma 4, sin detalle específico en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue vía infraestructura de inferencia compatible con la API de Hugging Face.

## Casos de uso

- Despliegue local en llama.cpp o ik_llama.cpp: las cuantizaciones IQ3_XXS (13,87 GiB) e IQ4_XS (18,21 GiB) permiten ejecutar un modelo de ~32B en equipos con 16-24 GB de VRAM, con la tabla de embeddings BF16 offloaded a RAM del sistema sin coste de VRAM.
- Servicio conversacional con fidelidad de tokenizador: al mantener los embeddings de entrada en BF16, se evita la pérdida de precisión en la representación de tokens poco frecuentes, útil en aplicaciones de diálogo donde la tokenización exacta importa (nombres propios, jerga técnica, multilingüe).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece ocho niveles de cuantización con la misma tabla de embeddings BF16, lo que permite aislar el efecto de la cuantización del resto de capas en experimentos de calidad.
- Inferencia en hardware mixto CPU-GPU: la posibilidad de offload de la tabla BF16 a RAM del sistema con impacto de velocidad "insignificante" (según el autor) lo hace adecuado para configuraciones con VRAM limitada.
- Investigación sobre cuantización de embeddings: sirve como caso de estudio de la técnica de desatar el LM head y restaurar solo la tabla de entrada en precisión completa.
- Prototipado de asistentes conversacionales autoalojados: con Q4_K_M (20,03 GiB) se obtiene un equilibrio razonable entre tamaño y calidad para entornos de desarrollo con una única GPU de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero, sin contar KV cache ni overhead):
  - IQ3_XXS: 13,87 GiB
  - IQ3_XS: 14,80 GiB
  - IQ3_S: 15,44 GiB
  - IQ3_M: 16,06 GiB
  - IQ4_XS: 18,21 GiB
  - Q4_K_M: 20,03 GiB
  - Q5_K_M: 22,97 GiB
  - Q6_K: 26,10 GiB
- GPU recomendadas: no disponibles de forma explícita; por tamaño, Q4_K_M cabe en RTX 4090 (24 GB) y Q6_K requiere A100 40 GB o H100. Las cuantizaciones IQ3 caben en GPUs de 16-20 GB.
- Consumer GPU: sí, las variantes IQ3_XXS a IQ4_XS caben en GPUs de 16-24 GB; Q4_K_M y Q5_K_M en 24 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, ik_llama.cpp (ambos citados en los tags); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. El autor afirma que el offload de la tabla BF16 a RAM tiene impacto de velocidad "insignificante", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.2-BF16-embd-GGUF (este) | 32,1B | no disponible | no disponible | GGUF | Embeddings de entrada en BF16 |
| mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF | 32,1B | no disponible | no disponible | GGUF | Cuantizaciones i1 originales, embeddings cuantizados |
| sophosympatheia/Glistening-Gem-31B-v2.2 | 32,1B | no disponible | no disponible | safetensors | Modelo base en precisión completa |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Gemma 4 y del modelo original de sophosympatheia antes de desplegar en producción.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe sin consultar la model card del modelo base.
- Longitud de contexto no disponible: limita la planificación de aplicaciones con contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de mitigación en esta variante.
- Sesgos: no documentados en la información disponible.
- La mejora de calidad respecto a las cuantizaciones originales es, según el propio autor, "probablemente marginal"; no hay mediciones que la cuantifiquen.
- El repositorio tiene 0 likes y 2.852 descargas; es una variante de nicho sin validación comunitaria amplia.
- El tamaño del repo (158,4 GB) incluye todas las cuantizaciones; descargar solo el fichero deseado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tetraturtle/Glistening-Gem-31B-v2.2-BF16-embd-GGUF
- Modelo base (safetensors): https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.2
- Cuantizaciones i1 originales: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF
