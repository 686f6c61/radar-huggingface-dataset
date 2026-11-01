# wangxinwei/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es un modelo de lenguaje causal de 1,54 mil millones de parámetros, ajustado por instrucciones a partir del modelo base Qwen/Qwen2.5-1.5B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Esta réplica concreta (wangxinwei/Qwen2.5-1.5B-Instruct) es un repositorio que aloja los pesos del modelo instruido en formato safetensors, publicado bajo licencia Apache 2.0.

La serie Qwen2.5 abarca modelos desde 0,5B hasta 72B de parámetros y mejora respecto a Qwen2 en seguimiento de instrucciones, generación de textos largos (más de 8K tokens), comprensión de datos estructurados (tablas) y generación de salidas estructuradas, especialmente JSON. El modelo soporta contexto completo de 32.768 tokens y generación de hasta 8.192 tokens.

Su relevancia radica en su tamaño reducido: con solo 1,54B de parámetros (1,31B sin embeddings), es un candidato idóneo para despliegues en hardware modesto, inferencia en local, dispositivos de borde o como componente en pipelines de generación aumentada, sin renunciar a capacidades multilingües (más de 29 idiomas) y de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con RoPE, SwiGLU, RMSNorm, sesgo QKV en attention y embeddings atados |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE; 1,31B sin embeddings) |
| Longitud de contexto | 32.768 tokens (generación: 8.192 tokens) |
| Tipos de cuantizacion | no disponible en el repo (pesos originales en bf16/fp16; se pueden aplicar GGUF/GPTQ/AWQ de terceros) |
| Idiomas soportados | Más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros); etiquetado oficialmente como "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con las mejoras habituales de la familia Qwen: codificación posicional RoPE, activación SwiGLU, normalización RMSNorm, sesgos en las proyecciones Q y K de la atención (QKV bias) y word embeddings atados a la capa de salida. Utiliza GQA (Grouped Query Attention) con 28 capas, 12 cabezas de consulta y 2 cabezas de clave-valor, lo que reduce el uso de memoria KV en inferencia con contextos largos.

El modelo pasó por dos etapas: preentrenamiento sobre un corpus masivo multilingüe y post-training (ajuste por instrucciones) para la variante Instruct. El equipo Qwen reporta mejoras significativas en código y matemáticas gracias a modelos expertos especializados en estos dominios empleados en el entrenamiento de la serie. El número exacto de tokens de preentrenamiento, la composición del dataset y el uso de RLHF/DPO no están detallados en la model card de este repositorio (no disponible); el artículo técnico de referencia de la familia es el Qwen2 Technical Report (arXiv:2407.10671).

## Capacidades

- Generación de texto conversacional multi-turno mediante chat template (`apply_chat_template`).
- Seguimiento de instrucciones mejorado respecto a Qwen2, con mayor resiliencia a la diversidad de system prompts (útil para role-play y configuración de chatbots).
- Generación de textos largos, superando los 8K tokens de salida.
- Comprensión de datos estructurados (tablas) y generación de salidas estructuradas, especialmente JSON.
- Capacidades de código y matemáticas reforzadas en la serie Qwen2.5.
- Soporte multilingüe en más de 29 idiomas, incluido el español.
- Contexto largo: hasta 32.768 tokens de entrada.
- Soporte de tool calling / function calling: no disponible en la información de esta model card (la serie Qwen2.5 Instruct oficial lo soporta, pero este repo no lo documenta).
- Capacidades de agentes, visión o audio: no disponibles en este modelo (es solo texto).

## Casos de uso

- Chatbots ligeros y asistentes conversacionales: con 1,54B de parámetros y soporte multi-turno vía chat template, es adecuado para asistentes que deben ejecutarse en local o en servidores de bajo coste, manteniendo conversaciones coherentes dentro de su ventana de 32K tokens.
- Extracción y generación de JSON: su entrenamiento reforzado en salidas estructuradas lo hace útil para pipelines ETL, parseo de documentos o integraciones con APIs que requieren respuestas JSON válidas.
- Resumen y análisis de documentos de longitud media: la ventana de 32.768 tokens permite procesar informes, artículos o hilos de correo completos y generar resúmenes o respuestas sobre ellos.
- Generación y asistencia de código en local: la serie Qwen2.5 mejora en código; este modelo puede integrarse en editores o autocompletados locales donde no se puede enviar código a APIs externas.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con system prompts variados, y su resiliencia a la diversidad de system prompts facilita la configuración de personas y condiciones para agentes de soporte.
- Aplicaciones multilingües: el soporte de más de 29 idiomas permite construir servicios que atienden usuarios en español, inglés, chino, árabe, japonés y otros idiomas con un único modelo pequeño.
- Prototipado y educación: su tamaño permite ejecutarlo en portátiles y entornos de enseñanza (Google Colab, GPUs de consumo) para experimentar con LLMs sin coste de infraestructura.
- Generación aumentada por recuperación (RAG) de bajo coste: como generador ligero en un pipeline RAG, combinado con un retriever, para responder preguntas sobre bases de conocimiento privadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 (https://qwenlm.github.io/blog/qwen2.5/) para las evaluaciones detalladas de la serie y a https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html para los requisitos de memoria GPU y throughput, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K u otras métricas para esta variante de 1,5B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en precisión original (bf16/fp16), según el tamaño del repo; con cuantización INT8/INT4 podría reducirse a torno a 1,5-2 GB y ~1 GB respectivamente (estimaciones, no confirmadas por la model card).
- GPUs recomendadas: cualquier GPU moderna con 4 GB de VRAM o más; no requiere A100 ni H100. Compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Consumer GPUs: sí, cabe con holgura en GPUs de consumo de gama media e incluso en portátiles con GPU dedicada; también es viable en CPU con llama.cpp a velocidades razonables dado su tamaño.
- Opciones de despliegue: transformers (Hugging Face, requiere versión >= 4.37.0), vLLM, TGI, llama.cpp y Ollama (mediante conversiones GGUF de la comunidad); el repo está etiquetado como compatible con text-generation-inference.
- Latencia y throughput: no disponible en la información de esta ficha; el equipo Qwen publica benchmarks de velocidad de la serie en su documentación oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (este modelo) | 1,54B | 32.768 (gen. 8.192) | Apache 2.0 | Multilingüe (29+ idiomas), fuerte en JSON y código para su tamaño |
| Llama 3.2-1B-Instruct (Meta) | 1,24B | 128.000 | Llama 3.2 Community License | Contexto mucho mayor, pero licencia con restricciones; menos idiomas soportados oficialmente |
| Gemma 2 2B-it (Google) | 2,61B | 8.192 | Gemma Terms of Use | Más parámetros y rendimiento superior en muchos benchmarks, pero contexto menor y licencia más restrictiva |
| Qwen2.5-0.5B-Instruct (Qwen) | 0,49B | 32.768 (gen. 8.192) | Apache 2.0 | Alternativa aún más ligera de la misma familia, con menor capacidad de razonamiento |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; como todo LLM, puede reproducir sesgos presentes en sus datos de entrenamiento. No disponible un análisis específico de sesgos para este modelo.
- Riesgo de alucinación: inherente a modelos de lenguaje de este tamaño; a 1,54B de parámetros, la fiabilidad factual es limitada y conviene verificar salidas en tareas de conocimiento factual.
- Limitaciones de contexto: aunque la serie anuncia soporte de hasta 128K tokens, esta variante de 1,5B está configurada con contexto completo de 32.768 tokens y generación máxima de 8.192 tokens.
- Limitaciones de idioma: el repo está etiquetado oficialmente como "en"; el soporte multilingüe (incluido español) procede del entrenamiento de la serie Qwen2.5, pero el rendimiento en idiomas distintos del inglés y el chino puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas; solo se exige cumplir los términos estándar de la licencia.
- Compatibilidad: requiere transformers >= 4.37.0; con versiones anteriores se produce un error `KeyError: 'qwen2'`.
- Procedencia del repo: se trata de un repositorio de un usuario particular (wangxinwei) que replica el modelo oficial de Qwen, con muy pocas descargas (224) y sin likes; para producción se recomienda verificar la integridad de los pesos o usar directamente Qwen/Qwen2.5-1.5B-Instruct.
- No soporta visión ni audio; es un modelo exclusivamente de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wangxinwei/Qwen2.5-1.5B-Instruct
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Blog oficial de la serie Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5
- Documentación: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Artículo técnico Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
