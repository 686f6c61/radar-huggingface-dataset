# unsloth/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B es un modelo de lenguaje multimodal (imagen-texto) desarrollado por Alibaba, publicado en febrero de 2026. Forma parte de la familia Qwen3.5, que integra avances en aprendizaje multimodal, eficiencia arquitectónica y escalado de reinforcement learning. El modelo combina una arquitectura híbrida de Gated Delta Networks con Mixture-of-Experts (MoE) disperso, lo que permite alta eficiencia en inferencia con baja latencia y coste reducido. Con 4 mil millones de parámetros, ofrece una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000, y soporta 201 idiomas y dialectos. Su licencia Apache 2.0 permite uso comercial sin restricciones. Esta versión GGUF, publicada por Unsloth, está optimizada para ejecución local con herramientas como llama.cpp, Ollama o LM Studio, y emplea la técnica de cuantización dinámica Unsloth Dynamic 2.0 que mejora la precisión frente a cuantizaciones convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated Delta Networks + sparse Mixture-of-Experts |
| Parametros totales | 4B |
| Parametros activos | no disponible (la arquitectura MoE sugiere activación parcial, pero no se especifica el número) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, incluyendo Unsloth Dynamic 2.0; consultar repositorio para lista completa) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base Qwen/Qwen3.5-4B) |

## Arquitectura y entrenamiento

La arquitectura del modelo combina dos mecanismos de atención: Gated Delta Networks (atención lineal con cabezas separadas para V y QK) y Gated Attention (atención tradicional con cabezas Q y KV), organizados en un patrón de 8 bloques de 3 capas Gated DeltaNet seguidas de una capa Gated Attention, cada una con su FFN. Esta hibridación busca equilibrar la eficiencia computacional de la atención lineal con la capacidad expresiva de la atención completa. El modelo incorpora además un módulo de predicción multi-token (MTP) entrenado con multi-steps, que mejora la velocidad de decodificación.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La fase de post-entrenamiento incluye reinforcement learning escalado en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, lo que mejora la robustez en escenarios reales. El modelo fue entrenado con fusión temprana de tokens multimodales, logrando una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto. No se han publicado detalles específicos sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica, matemáticas y conocimiento general.
- Comprensión y generación de imágenes (entrada visual), con capacidades de visión comparables o superiores a modelos Qwen3-VL en benchmarks de razonamiento visual.
- Razonamiento multi-paso y modo "thinking" (razonamiento extendido) para problemas complejos.
- Soporte de tool calling y function calling, lo que permite integración con APIs y agentes.
- Capacidades de agente: ejecución de tareas multi-paso con planificación y uso de herramientas.
- Multilingüismo: soporte de 201 idiomas y dialectos, con comprensión cultural y regional matizada.
- Alta eficiencia en inferencia gracias a la arquitectura híbrida y al MTP, con baja latencia en comparación con modelos de tamaño similar.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), permitiendo mantener el historial completo de la interacción y acceder a documentación extensa en tiempo real. Su soporte multilingüe facilita la atención en múltiples regiones.
- Generación de código en producción: gracias a su capacidad de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar código, revisar cambios y generar tests. Su bajo coste de inferencia lo hace viable para uso continuo.
- Análisis de documentos técnicos y legales: con su ventana de contexto extendida, puede procesar manuales extensos, contratos o informes completos sin necesidad de chunking, extrayendo información relevante y resumiendo contenido.
- Asistentes de investigación multimodal: al combinar visión y texto, puede analizar figuras, gráficos y tablas en artículos científicos, responder preguntas sobre ellos y generar resúmenes integrados.
- Traducción y localización: con soporte para 201 idiomas, puede traducir contenido manteniendo matices culturales, útil para plataformas globales de contenido o e-commerce.
- Agentes autónomos de automatización de tareas: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que navegan por APIs, ejecutan acciones y resuelven problemas con supervisión mínima, por ejemplo en automatización de procesos de negocio.

## Benchmarks y rendimiento

La model card original incluye una tabla comparativa con modelos como GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B, cubriendo categorías como Knowledge & STEM (MMLU-Pro), razonamiento, código y agentes. Sin embargo, los valores numéricos de dicha tabla no se han podido extraer de la información proporcionada (el texto se corta antes de mostrar los datos). Por tanto, no se dispone de cifras concretas de benchmarks en la información disponible. Se recomienda consultar la model card original en Hugging Face para obtener los resultados completos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware específicos para este modelo en la información disponible.
- Como orientación general, un modelo de 4B parámetros en formato GGUF puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM dependiendo de la cuantización elegida (por ejemplo, Q4_K_M ocupa aproximadamente 3-4 GB, Q8 ocupa unos 4-5 GB). Con cuantizaciones más agresivas (Q2, Q3) podría caber en 6 GB.
- GPUs recomendadas: RTX 3060/4060 (12 GB), RTX 4070/4080, o GPUs profesionales como A10 o L4. Para uso en servidor, A100 o H100 ofrecen mayor throughput.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, vLLM (con adaptador GGUF), TGI (con conversión a safetensors) y Unsloth Desktop.
- La latencia y el throughput dependen fuertemente de la cuantización y el hardware. Con la arquitectura híbrida y MTP, se espera una generación más rápida que modelos Transformer puros del mismo tamaño, aunque no se dispone de cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (este) | 4B | 262K (ext. 1M) | Apache 2.0 | Híbrida Gated DeltaNet + MoE | Multimodal, 201 idiomas, MTP |
| Qwen3-4B (predecesor) | 4B | 32K (ext. 128K) | Apache 2.0 | Transformer denso | Solo texto, sin visión, sin MTP |
| Qwen3.5-9B | 9B | 262K (ext. 1M) | Apache 2.0 | Híbrida Gated DeltaNet + MoE | Misma familia, mayor capacidad, más VRAM |

La comparativa con Qwen3-4B muestra una clara mejora en contexto, capacidades multimodales y eficiencia gracias a la nueva arquitectura. Frente a Qwen3.5-9B, el modelo de 4B ofrece menor coste computacional y menor VRAM, adecuado para entornos con recursos limitados, aunque con menor capacidad bruta. No se dispone de datos de benchmarks para una comparación cuantitativa completa en esta ficha.

## Limitaciones y advertencias

- No se han publicado evaluaciones específicas de sesgos o alucinaciones en la información disponible. Como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en temas especializados o de baja frecuencia.
- La ventana de contexto de 262K tokens es nativa, pero la extensión a 1M puede degradar la calidad en los tramos más largos; se recomienda validar el rendimiento en casos de uso reales.
- Aunque soporta 201 idiomas, la calidad puede variar significativamente entre lenguas de alta y baja representación en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución y la ausencia de patentes asociadas.
- Para producción, es recomendable realizar pruebas de robustez, especialmente en tareas de agentes y tool calling, donde los errores pueden propagarse.
- La versión GGUF de Unsloth puede presentar ligeras diferencias de precisión respecto al modelo original en safetensors, aunque la técnica Dynamic 2.0 busca minimizarlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Catálogo de modelos Unsloth: https://unsloth.ai/docs/get-started/unsloth-model-catalog
- Página en LM Studio: https://lmstudio.ai/unsloth/qwen3.5-4b
