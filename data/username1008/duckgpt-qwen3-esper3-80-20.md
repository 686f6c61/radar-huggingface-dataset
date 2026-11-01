# Username1008/duckgpt-qwen3-esper3-80-20

## Resumen

duckgpt-qwen3-esper3-80-20 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-8B-Base, publicado por el usuario Username1008 en HuggingFace. Se trata de un modelo causal de lenguaje de 8.190.735.360 parámetros (8,2B), con arquitectura transformer densa, distribuido en formato safetensors y bajo licencia Apache 2.0. El nombre sugiere un entrenamiento orientado a esperanto ("esper3") con una mezcla de datos 80/20, aunque la model card no documenta la composición del dataset de ajuste ni los hiperparámetros empleados.

El modelo hereda las capacidades del Qwen3-8B original: conmutación entre modo de razonamiento (thinking) y modo directo, soporte de tool calling, contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, y cobertura de más de 100 idiomas según la documentación de Qwen. Sin embargo, el autor no ha publicado benchmarks propios ni detalles del proceso de ajuste, por lo que el rendimiento específico de esta variante no está verificado.

Es relevante ahora porque Qwen3 se ha consolidado como una de las familias open source más competitivas en relación calidad/tamaño, y los fine-tunes especializados en idiomas de bajos recursos como el esperanto cubren un hueco que los modelos generalistas no atienden bien. No obstante, con solo 10 descargas y 0 likes, se trata de un modelo de nicho sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 36 capas, GQA con 32 cabezas Q y 8 cabezas KV |
| Parametros totales | 8.190.735.360 (8,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato original safetensors; compatible con cuantizacion GGUF/AWQ via herramientas externas) |
| Idiomas soportados | No disponible para este fine-tune; el modelo base Qwen3 declara soporte de mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base: un transformer causal denso de 36 capas con Grouped Query Attention (32 cabezas de consulta y 8 de clave-valor), 8,2B de parámetros totales de los cuales 6,95B son no-embedding. El modelo base fue entrenado por Alibaba Qwen en dos fases (pretraining y post-training) con un corpus multilingüe no detallado en la información disponible, e incorpora la capacidad de alternar entre modo thinking y non-thinking dentro de un mismo modelo.

Sobre el ajuste fino específico (duckgpt-qwen3-esper3-80-20) no se dispone de información: la model card es una copia de la de Qwen3-8B y no documenta el dataset, el número de tokens de entrenamiento, la proporción 80/20 que sugiere el nombre, ni si se emplearon técnicas como SFT, DPO o RLHF. Tampoco se detalla si se modificó el tokenizador para el esperanto. Esta ausencia de documentación es una limitación importante para evaluar el modelo en producción.

## Capacidades

- Generación de texto conversacional multi-turno, con alineación orientada a preferencias humanas heredada de Qwen3.
- Razonamiento explícito en modo thinking (bloques `<think>...</think>`) para matemáticas, lógica y código.
- Modo non-thinking para diálogo general de baja latencia.
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base).
- Soporte de tool calling / function calling en ambos modos, según la documentación de Qwen3.
- Capacidades de agente y razonamiento multi-paso.
- Multilingüismo amplio en el modelo base (100+ idiomas); el esperanto es el idioma objetivo presumible del fine-tune, aunque no está verificado.
- Sin capacidades de visión ni audio (modelo exclusivamente de texto).

## Casos de uso

- Generación y traducción de contenido en esperanto: el fine-tune parece orientado a este idioma, por lo que sería adecuado para redactar, traducir o mantener conversaciones en esperanto, un nicho mal cubierto por modelos generalistas.
- Atención al cliente multilingüe: con 32.768 tokens de contexto nativo, puede gestionar conversaciones largas con historial extenso y cambiar de idioma dentro de la misma sesión.
- Asistente de código en IDE: el modo thinking permite razonar sobre problemas de programación antes de responder, y el tool calling facilita la integración con linters, compiladores o APIs.
- Procesamiento de documentos largos: con YaRN hasta 131.072 tokens, puede resumir o extraer información de contratos, informes o artículos extensos.
- Agentes autónomos con herramientas: el soporte de function calling y razonamiento multi-paso permite construir pipelines donde el modelo decide qué herramienta invocar en cada iteración.
- Prototipado e investigación en NLP de bajos recursos: útil como punto de partida para estudiar fine-tunes en lenguas construidas o de escasa representación.
- Generación de datos sintéticos: puede producir pares pregunta-respuesta o corpus en esperanto para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reproduce la de Qwen3-8B pero no incluye tablas de evaluación, y el autor no aporta métricas propias del fine-tune.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,4 GB de pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 5-6 GB (estimaciones según tamaño de parámetros, no verificadas para este fine-tune).
- GPU recomendadas: A100 40/80 GB o H100 para serving en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantización 4 bits.
- Despliegue: vLLM (>=0.8.5) y SGLang (>=0.4.6.post1) con parser de razonamiento qwen3; llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers para uso local; TGI para endpoints compatibles OpenAI.
- Latencia y throughput: no disponibles para este fine-tune; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| duckgpt-qwen3-esper3-80-20 | 8,2B | 32.768 (131.072 con YaRN) | Apache 2.0 | Fine-tune de nicho, sin benchmarks publicados |
| Qwen/Qwen3-8B | 8,2B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo base original, benchmarks publicados por Qwen |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Amplia adopción, licencia con restricciones |
| Mistral 7B Instruct | 7,2B | 32.000 | Apache 2.0 | Menor tamaño, sin modo thinking nativo |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset y el proceso de ajuste: no es posible evaluar la calidad, los sesgos introducidos ni la fidelidad al esperanto.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en modo non-thinking y en tareas factuales.
- El fine-tune puede degradar capacidades del modelo base (olvido catastrófico) si el dataset 80/20 estuvo muy sesgado hacia un dominio o idioma.
- Idiomas soportados no declarados para esta variante; el rendimiento multilingüe del base no está garantizado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin validación comunitaria (10 descargas, 0 likes): no hay evidencia independiente de su comportamiento.
- El tokenizador podría no estar adaptado al esperanto, lo que afectaría a la eficiencia y calidad en ese idioma.
- Para producción se recomienda evaluar contra el Qwen3-8B original antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Username1008/duckgpt-qwen3-esper3-80-20
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Licencia: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Paper referenciado (arxiv:2309.00071): no disponible el título en la información proporcionada
- Paper referenciado (arxiv:2505.09388): no disponible el título en la información proporcionada
