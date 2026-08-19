# tencent/Hy-MT2-1.8B-GGUF

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática multilingüe desarrollado por Tencent (equipo Hunyuan), diseñado para tareas de traducción complejas en escenarios reales. Forma parte de la familia Hy-MT2, que incluye tres tamaños (1.8B, 7B y 30B-A3B), todos con soporte para 33 idiomas y capacidad de seguir instrucciones de traducción en varios idiomas. El modelo se describe como de "pensamiento rápido" (fast-thinking), lo que implica una generación eficiente sin sacrificar calidad en tareas de traducción general, de negocio, de dominio específico y de seguimiento de instrucciones.

Esta variante GGUF está optimizada para ejecución con llama.cpp y permite cuantizaciones extremas mediante la tecnología AngelSlim de Tencent, que reduce el almacenamiento del modelo de 1.8B a solo 440 MB y mejora la velocidad de inferencia en 1,5 veces. Según la model card, el modelo 1.8B supera en rendimiento global a APIs comerciales mainstream de Microsoft y Doubao, mientras que los modelos de 7B y 30B-A3B superan a alternativas open-source como DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking. El modelo se publica bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en productos.

El repositorio de HuggingFace contiene el modelo en formato GGUF, con un tamaño total de 4,5 GB, e incluye también el benchmark IFMTBench para evaluar capacidades de seguimiento de instrucciones de traducción, así como un skill de traducción (Hy-MT2-Translator) para integrar el modelo fácilmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.791.080.448 (1.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye versiones FP8, 2-bit y 1.25-bit mediante AngelSlim) |
| Idiomas soportados | 33 idiomas (no especificados en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base tambien esta disponible en safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles técnicos sobre la arquitectura interna del modelo (tipo de transformer, atención, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Se sabe que el modelo pertenece a la familia Hy-MT2, que se describe como modelos de traducción "fast-thinking", lo que sugiere un diseño optimizado para generar traducciones de forma rápida sin degradar la calidad. No se especifica si se utilizaron técnicas como decodificación especulativa o atención lineal.

La información disponible indica que el modelo se entrenó para seguir instrucciones de traducción en múltiples idiomas, incluyendo especificaciones de terminología y estilo, como se muestra en los ejemplos de prompts de la model card. No hay datos públicos sobre el corpus de entrenamiento ni sobre la metodología de evaluación utilizada más allá de las menciones cualitativas a superar a otros modelos.

## Capacidades

- Traducción automática entre 33 idiomas, con soporte para prompts en chino e inglés (y presumiblemente otros idiomas según la model card).
- Seguimiento de instrucciones de traducción: puede recibir instrucciones detalladas sobre terminología específica, estilo de traducción y formato de salida.
- Modo "fast-thinking": genera traducciones de forma rápida, adecuado para aplicaciones en tiempo real o con restricciones de latencia.
- Capacidad de traducción en dominios específicos y escenarios de negocio reales, según las evaluaciones multidimensionales mencionadas.
- Compatible con cuantización extrema (1.25-bit) mediante AngelSlim, lo que permite despliegue en dispositivos con recursos limitados.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades típicas de LLM generales; el modelo está especializado en traducción.

## Casos de uso

- Traducción automática en productos de atención al cliente: el modelo puede gestionar conversaciones multilingües en tiempo real, traduciendo mensajes de usuarios y respuestas de agentes, gracias a su capacidad de seguir instrucciones y su modo fast-thinking que reduce la latencia en interacciones en vivo.
- Localización de contenido web y aplicaciones: integración en pipelines de localización para traducir interfaces, documentación y contenido generado por usuarios, manteniendo consistencia terminológica mediante instrucciones específicas.
- Traducción de subtítulos para video: Tencent colabora con WMT26 en la tarea de traducción de subtítulos, lo que indica que el modelo es adecuado para este caso, pudiendo procesar segmentos de texto con contexto limitado y generar subtítulos en el idioma destino.
- Traducción de documentos técnicos y legales: gracias a la capacidad de especificar terminología y estilo, el modelo puede adaptarse a glosarios de dominio y producir traducciones coherentes en sectores como finanzas, medicina o ingeniería.
- Despliegue en dispositivos edge o móviles: la cuantización 1.25-bit reduce el modelo a 440 MB, permitiendo traducción offline en smartphones o dispositivos IoT sin conexión a servidores.
- Integración en asistentes virtuales multilingües: el modelo puede servir como motor de traducción en tiempo real para asistentes que operan en varios idiomas, con la ventaja de ser ligero y rápido.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la informacion disponible. La model card menciona que el modelo 1.8B supera a APIs comerciales de Microsoft y Doubao, y que los modelos de 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, pero no se proporcionan cifras concretas (puntuaciones MMLU, BLEU, COMET, etc.). Se remite al reporte técnico en arxiv para más detalles.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM mínima o GPUs recomendadas.
- El modelo tiene 1.791 millones de parámetros, por lo que en FP16 requiere aproximadamente 3,6 GB de VRAM para inferencia; con cuantización GGUF (por ejemplo, Q4_K_M) el requisito se reduce a unos 1-1,5 GB.
- La cuantización 1.25-bit de AngelSlim reduce el almacenamiento a 440 MB, lo que permite ejecución en CPU o GPUs de gama baja, e incluso en dispositivos móviles.
- Es compatible con llama.cpp, por lo que puede desplegarse en CPU, GPU (CUDA, Metal, Vulkan) y entornos edge.
- Para despliegue en servidores, se puede utilizar vLLM o TGI si se usa el modelo base en safetensors, aunque la variante GGUF está pensada principalmente para llama.cpp y Ollama.
- No se especifican datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa detallada con otros modelos de traducción en la documentación proporcionada. La model card menciona que Hy-MT2 supera a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, así como a APIs comerciales de Microsoft y Doubao, pero no se ofrecen datos numéricos ni una tabla comparativa. Tampoco se listan alternativas específicas de la misma categoría (modelos de traducción de tamaño similar). Por tanto, no es posible realizar una comparación rigurosa con los datos disponibles.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información proporcionada; sin embargo, como todo modelo de traducción entrenado con datos web, puede reflejar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación en traducción: aunque el modelo está especializado en traducción, puede generar contenido incorrecto o inventado en contextos ambiguos o con terminología poco frecuente.
- La lista de 33 idiomas no se especifica, por lo que el usuario debe verificar si su idioma de interés está cubierto.
- No se indica la longitud de contexto, lo que puede limitar la traducción de documentos largos o conversaciones extensas; es recomendable segmentar el texto.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos completos.
- Para producción, es necesario validar la calidad de las traducciones en el dominio específico, ya que el rendimiento puede variar según el par de idiomas y el tipo de texto.
- La variante GGUF está optimizada para llama.cpp; si se requiere integración con otros frameworks (vLLM, TGI), se debe usar el modelo base en safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- Colección Hy-MT2 en HuggingFace: https://huggingface.co/collections/tencent/hy-mt2
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2
- Sitio web oficial de Tencent AI Studio: https://aistudio.tencent.com/llm/en?tabIndex=0
- Repositorio GitHub de Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Repositorio AngelSlim: https://github.com/Tencent/AngelSlim/tree/main
- Reporte técnico (arxiv): https://arxiv.org/pdf/2605.22064
- Modelo base en safetensors: https://huggingface.co/tencent/Hy-MT2-1.8B
- Variante FP8: https://huggingface.co/tencent/Hy-MT2-1.8B-FP8
- Variante 2-bit GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-2bit-GGUF
- Variante 1.25-bit GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-1.25bit-GGUF
