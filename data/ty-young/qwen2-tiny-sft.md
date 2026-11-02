# ty-young/qwen2-tiny-sft

## Resumen

qwen2-tiny-sft es un ajuste fino supervisado (SFT) del modelo Qwen2.5-0.5B de Alibaba Cloud, publicado por el usuario ty-young en HuggingFace. Se trata de un modelo de lenguaje causal de tipo transformer con 29,1 millones de parámetros reales en pesos (el model card base declara 0,49B totales, de los cuales 0,36B no corresponden a embeddings), orientado a generación de texto y conversación. El repositorio tiene un tamaño de 0,1 GB y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo hereda la arquitectura de Qwen2.5: transformer con RoPE, SwiGLU, RMSNorm, atención con sesgo QKV y embeddings atados, con 24 capas y GQA (14 cabezas de consulta y 2 de clave-valor). El model card declara una longitud de contexto completa de 32.768 tokens y capacidad de generación de hasta 8.192 tokens, aunque el autor del ajuste no documenta cambios en la ventana de contexto. Está etiquetado únicamente para inglés, a pesar de que la familia base declara soporte para más de 29 idiomas.

La relevancia de esta ficha es acotada: se trata de un modelo derivado de bajo perfil (0 descargas y 0 likes en el momento de la consulta), sin benchmarks publicados por el autor del ajuste y con una model card que reproduce casi literalmente la del modelo base. Resulta útil como ejemplo de fine-tuning ligero sobre Qwen2.5-0.5B para experimentación en entornos con recursos muy limitados, pero no debe considerarse un modelo con garantías de rendimiento documentadas por su autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y embeddings atados |
| Parámetros totales | 29.149.824 (pesos en safetensors); el model card base declara 0,49B totales y 0,36B no-embedding |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens según model card base; generación de hasta 8.192 tokens |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | en (etiqueta del repo); la familia base declara más de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 24 capas, normalización RMSNorm, activación SwiGLU, embeddings de posición rotatorios (RoPE), atención con group query attention (14 cabezas de consulta y 2 de clave-valor) y sesgo en las proyecciones QKV. Los embeddings de entrada y salida están atados. El model card base indica que Qwen2.5-0.5B se entrenó en dos etapas: preentrenamiento y post-entrenamiento (instrucción), pero el autor del ajuste no detalla el dataset, el número de tokens ni la composición del SFT aplicado sobre ty-young/qwen2-tiny-sft.

No se documenta en la información disponible si el ajuste incluyó RLHF, DPO, decodificación especulativa ni otras innovaciones técnicas. El repositorio incluye la etiqueta `custom_code` y requiere `trust_remote_code=True` para su carga, lo que implica que el código de modelado no es el estándar de transformers y debe revisarse antes de usarlo en producción. La model card reproduce la del modelo base Qwen2.5-0.5B-Instruct, por lo que las afirmaciones sobre mejoras en código, matemáticas, instrucciones largas y JSON corresponden a la familia base, no necesariamente a este ajuste concreto.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento e instrucciones básicas, heredadas del modelo base Qwen2.5-0.5B.
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad limitada por el tamaño).
- Comprensión y generación de datos estructurados, incluido JSON, según el model card base.
- Soporte multilingüe declarado en la familia base (más de 29 idiomas), aunque el repo solo etiqueta inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- No se documenta explícitamente soporte de razonamiento multi-paso más allá de lo que ofrece el modelo base.

## Casos de uso

- Experimentación con fine-tuning ligero: sirve como punto de partida para reproducir o comparar ajustes SFT sobre Qwen2.5-0.5B en entornos con una sola GPU consumer, dado su tamaño de 0,1 GB en safetensors.
- Prototipado de chatbots en local: permite montar un asistente conversacional básico en inglés con `transformers` y una plantilla de chat, útil para validar flujos antes de pasar a modelos mayores.
- Generación de texto asistida en dispositivos con poca VRAM: al tratarse de un modelo de ~29M parámetros en pesos, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generación corta.
- Evaluación de pipelines de inferencia: útil para probar integraciones con text-generation-inference o endpoints compatibles (el repo incluye la etiqueta `endpoints_compatible`) sin incurrir en costes de modelos grandes.
- Docencia y divulgación: adecuado para explicar el ciclo completo de preentrenamiento, SFT y despliegue de un LLM pequeño con licencia permisiva.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir textos cortos en inglés en tareas de aumento de datos, siempre con revisión humana por el riesgo de alucinación.
- No se recomienda para atención al cliente en producción, generación de código crítica ni tareas que requieran contexto largo real, al no haber benchmarks ni garantías documentadas por el autor del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card remite al blog de Qwen2.5 para las evaluaciones de la familia base, pero no aporta cifras propias para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,06 GB solo para pesos (29,1M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp32: aproximadamente 0,12 GB para pesos, igualmente trivial para hardware moderno.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en Raspberry Pi y entornos embebidos con suficiente RAM.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 24 capas y ~29M parámetros en pesos, la latencia será muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ty-young/qwen2-tiny-sft | 29,1M (pesos) / 0,49B declarados | 32.768 tokens (base) | apache-2.0 | HuggingFace, 0 descargas | Ajuste SFT sin benchmarks propios |
| Qwen/Qwen2.5-0.5B | 0,49B | 32.768 tokens | apache-2.0 | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | apache-2.0 | HuggingFace, ampliamente usado | Versión instruct oficial, con evaluaciones en el blog de Qwen |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | apache-2.0 | HuggingFace | Alternativa algo mayor, contexto mucho menor |

La comparativa se limita a modelos de la misma familia y tamaño; no se dispone de datos de rendimiento del ajuste ty-young/qwen2-tiny-sft para establecer una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados por el autor del ajuste; el rendimiento real es desconocido y no puede asumirse igual al del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La model card reproduce la del modelo base, por lo que puede inducir a error sobre las capacidades reales del ajuste.
- Requiere `trust_remote_code=True` (etiqueta `custom_code`), lo que implica ejecutar código no estándar; debe auditarse antes de usarlo en producción.
- Riesgo de alucinación elevado por el tamaño reducido del modelo (0,49B declarados) y por la falta de documentación del dataset de SFT.
- Idiomas: el repo solo etiqueta inglés; el soporte multilingüe de la familia base no está verificado en este ajuste.
- Contexto: aunque el model card base declara 32.768 tokens, no se confirma que el ajuste preserve esa ventana ni que la calidad se mantenga en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5 conviene revisar también la licencia del modelo base y las condiciones de atribución.
- No se documentan sesgos conocidos específicos; al heredar el preentrenamiento de Qwen2.5, es probable que arrastre sesgos del corpus original, pero no hay análisis publicado.
- No apto para tareas críticas (código en producción, decisiones médicas o legales) sin evaluación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/ty-young/qwen2-tiny-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
