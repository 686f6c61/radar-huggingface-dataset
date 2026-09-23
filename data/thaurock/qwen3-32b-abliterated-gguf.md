# Thaurock/Qwen3-32B-abliterated-GGUF

## Resumen

Thaurock/Qwen3-32B-abliterated-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo roslein/Qwen3-32B-abliterated, a su vez derivado de Qwen/Qwen3-32B de Alibaba Cloud. Se trata de un transformer causal denso de 32.800 millones de parámetros y 64 capas, al que se le ha aplicado una técnica de abliteración mediante escalado proporcional (factor máximo de 2,25) para eliminar los mecanismos de rechazo del modelo original. El resultado es un modelo sin los filtros de seguridad estandarizados, orientado a investigación y pruebas en entornos controlados.

El repositorio ofrece la colección completa de 11 cuantizaciones, desde F16 (~65,6 GB) hasta Q2_K (~12,1 GB), lo que permite ejecutar un modelo de 32B en hardware de consumo con la pérdida de calidad asociada a cada nivel de compresión. Está preparado para usarse con llama.cpp, Ollama, LM Studio o text-generation-webui.

Su relevancia radica en que combina las capacidades del Qwen3-32B con la ausencia de filtros de rechazo, algo demandado en investigación sobre alineación, red-teaming y generación de contenido sin restricciones, manteniendo la licencia Apache 2.0. No obstante, el autor no publica benchmarks ni especifica idiomas soportados para esta variante abliterada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 64 capas |
| Parámetros totales | 32,8B (aproximado, según model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; extensible a 131.072 con YaRN (heredado de Qwen3-32B; el repositorio no lo especifica) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (11 variantes) |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen3-32B está entrenado en 119 idiomas y dialectos según el informe técnico |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (11 archivos, sin splits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B: un transformer causal denso con 32,8B de parámetros y 64 capas. Este repositorio no entrena ni modifica los pesos, sino que únicamente los cuantiza a GGUF en 11 niveles. El modelo base abliterado (roslein/Qwen3-32B-abliterated) se generó aplicando una técnica de escalado proporcional (`proportional scaling`) que asigna distintas intensidades de abliteración a cada una de las 64 capas en función de sus factores individuales de rechazo, con un parámetro máximo (`--max-scale-factor`) de 2,25. Según el autor, el modelo conserva la capacidad de seguimiento de instrucciones complejas y razonamiento, mostrando solo ligeras variaciones en lenguajes poco comunes o contextos muy matizados.

La model card no detalla el dataset de entrenamiento ni si hubo RLHF o DPO en el modelo base, ya que la abliteración es una modificación post-hoc de pesos y no un reentrenamiento. Tampoco se describe ninguna innovación técnica adicional más allá del propio método de abliteración por escalado proporcional. Cabe señalar que la model card incluye una referencia errónea a `DeepSeek-R1-Distill-Qwen-32B` en el apartado inicial, inconsistente con el título y el resto del documento.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas de Qwen3-32B (modelo denso de 32,8B), aunque no verificadas específicamente para esta variante abliterada.
- Ausencia de filtros de rechazo: al haberse aplicado abliteración, el modelo responde a peticiones que el Qwen3-32B original rechazaría por sus políticas de seguridad.
- Código y matemáticas: el modelo base Qwen3-32B destaca en tareas de programación y razonamiento matemático; se desconoce el impacto exacto de la abliteración en estas tareas.
- Capacidades multilingües: no especificadas en el repositorio; el modelo base cubre 119 idiomas y dialectos según el informe técnico de Qwen3.
- Tool calling / function calling: no disponible en el repositorio. Qwen3-32B lo soporta de forma nativa, pero no se confirma si la abliteración lo conserva.
- Modo thinking: Qwen3-32B incorpora modos de razonamiento con y sin pensamiento explícito; no se indica si esta variante los mantiene.
- Contexto largo: hereda la ventana de 32.768 tokens nativos del modelo base, ampliable a 131.072 con YaRN.
- Modalidad: solo texto; sin visión ni audio.

## Casos de uso

- Investigación en seguridad y alineación: permite estudiar qué mecanismos de rechazo se eliminan y qué tipos de contenido emergen, comparando respuestas frente al Qwen3-32B original.
- Red-teaming y evaluación de moderadores: generar prompts adversarios y respuestas potencialmente dañinas en un entorno aislado para probar la robustez de clasificadores y filtros de contenido.
- Generación de datos sintéticos sin censura: crear datasets de instrucciones y respuestas que el modelo alineado rechazaría, útiles para investigar sesgos, robustez y comportamiento en dominios sensibles.
- Escritura creativa y ficción: narrativa con temas maduros o controvertidos sin evasivas, aprovechando la coherencia en contextos de hasta 32.000 tokens para novelas o guiones largos.
- Asistente local con privacidad: desplegar el modelo cuantizado en Q4_K_M sobre una RTX 4090 o dos GPU de 24 GB, sin enviar datos a servicios externos.
- Análisis de documentos extensos: procesar contratos, informes técnicos o bases de código de más de 20.000 tokens gracias a la ventana de contexto heredada del modelo base.
- Generación y revisión de código en local: completar funciones y revisar fragmentos mediante llama.cpp, aunque sin garantías de soporte de tool calling en esta variante.
- Roleplay y simulación de personajes: mantener interacciones multi-turno sin las restricciones de contenido del modelo alineado original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas (MMLU, HumanEval, GSM8K, etc.) y tampoco se han encontrado resultados específicos para la variante abliterada en los resultados de búsqueda consultados. Existen benchmarks publicados para el Qwen3-32B original en el informe técnico de Qwen3, pero no son extrapolables directamente a esta versión modificada.

## Requisitos de hardware

Los tamaños de archivo indicados por el autor son estimaciones del peso de los pesos. A la VRAM necesaria hay que sumar la caché KV y el overhead de inferencia; como referencia aproximada, con caché KV en fp16 el consumo adicional ronda los 2 GiB para 8.000 tokens de contexto y los 8 GiB para 32.768 tokens.

| Cuantización | Tamaño de pesos (estimado) | VRAM estimada (ctx 8K) | VRAM estimada (ctx 32K) | GPU sugerida |
|---|---|---|---|---|
| F16 | ~65,6 GB | ~69 GB | ~75 GB | A100 80GB, H100 80GB |
| Q8_0 | ~34,8 GB | ~38 GB | ~44 GB | A100 40GB, H100, 2x RTX 4090 |
| Q6_K | ~27,2 GB | ~31 GB | ~37 GB | A100 40GB, 2x RTX 4090 |
| Q5_K_M | ~23,4 GB | ~27 GB | ~33 GB | 2x RTX 4090, A100 40GB |
| Q4_K_M | ~19,9 GB | ~23,5 GB | ~29 GB | RTX 4090 24GB (ajustado), 2x RTX 3090 |
| Q4_K_S | ~18,8 GB | ~22,3 GB | ~28 GB | RTX 4090 24GB, 2x RTX 3090 |
| Q3_K_M | ~15,1 GB | ~18,6 GB | ~24 GB | RTX 4090 24GB, RTX 4080 16GB con offload parcial |
| Q2_K | ~12,1 GB | ~15,6 GB | ~21 GB | RTX 4080 16GB, RTX 3090 24GB, Apple Silicon 32 GB unificados |

- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores, especialmente en RTX 4090, RTX 3090 o Apple Silicon con memoria unificada de 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Para servir en producción con batching se recomienda llama.cpp con `llama-server`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Filtros de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-32B (original) | 32,8B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | Sí (alineado con rechazos) | Hugging Face oficial de Qwen |
| roslein/Qwen3-32B-abliterated | 32,8B | Heredado de Qwen3-32B | Apache 2.0 | safetensors | No (abliterado) | Hugging Face |
| Thaurock/Qwen3-32B-abliterated-GGUF (este) | 32,8B | Heredado de Qwen3-32B | Apache 2.0 | GGUF (11 cuantizaciones) | No (abliterado) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de otras alternativas en la información proporcionada que permitan ampliar la comparativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito. El autor limita su uso a investigación, desarrollo y pruebas en entornos controlados.
- Responsabilidad legal: el contenido generado es responsabilidad exclusiva del usuario. La licencia Apache 2.0 permite uso comercial, pero eso no exime de cumplir la legislación aplicable ni los términos de servicio de las plataformas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha mitigado ni evaluado en esta variante.
- Posible degradación de capacidades: según el autor, la abliteración introduce ligeras variaciones en lenguajes poco comunes y en contextos sumamente matizados. No hay benchmarks que cuantifiquen el impacto real.
- Errores en la model card: se menciona por error `DeepSeek-R1-Distill-Qwen-32B` en la introducción, lo que contradice el título y el resto del documento. Los tamaños de archivo son estimaciones iniciales y pueden variar tras la compilación local.
- Idiomas no especificados: el repositorio no indica qué idiomas soporta esta variante abliterada; solo se puede asumir la cobertura del modelo base.
- Contexto: la ventana nativa es de 32.768 tokens. La extensión a 131.072 requiere configuración adicional con YaRN y no está verificada en esta variante.
- Sesgos heredados: el modelo base Qwen3 puede reproducir sesgos presentes en sus datos de entrenamiento, y la abliteración no los corrige, sino que puede amplificar la expresión de contenido sesgado o controvertido.
- Uso en producción: no se recomienda sin un sistema adicional de moderación, validación humana y control de acceso, dado que no hay evaluaciones de seguridad publicadas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Thaurock/Qwen3-32B-abliterated-GGUF
- Modelo base abliterado (roslein): https://huggingface.co/roslein/Qwen3-32B-abliterated
- Modelo original Qwen3-32B (Alibaba Cloud): https://huggingface.co/Qwen/Qwen3-32B
- Informe técnico de Qwen3 (arXiv, HTML): https://arxiv.org/html/2505.09388v1
- Informe técnico de Qwen3 (arXiv, abstract): https://arxiv.org/abs/2505.09388v1
- Página de referencia de Qwen3-32B en local-ai-zone: https://local-ai-zone.github.io/models/qwen-qwen3-32b.html
