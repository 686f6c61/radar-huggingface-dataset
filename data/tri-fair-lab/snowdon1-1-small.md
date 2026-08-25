# tri-fair-lab/Snowdon1.1-Small

## Resumen

Snowdon1.1-Small es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el laboratorio conjunto Thomson Reuters e Imperial Frontier AI Research Lab. Se trata de una realineación del modelo Qwen3.6-35B-A3B, cuyo objetivo es mitigar el sesgo político sistemático en las respuestas del modelo base. En lugar de entrenar un nuevo modelo desde cero, el equipo ha aplicado una técnica de edición de pesos denominada «ablation direccional enrutada por Fisher» junto con un ajuste mediante DPO constitucional, lo que permite modificar el comportamiento del modelo sin retrain y sin añadir parámetros extra.

La relevancia de este modelo radica en que aborda explícitamente la alineación de valores en modelos de pesos abiertos, un aspecto que normalmente queda implícito y no auditable. Snowdon1.1-Small se alinea con una constitución pública y escrita, de modo que las decisiones de alineación son legibles, contrastables y revisables. El modelo hereda la arquitectura y el tokenizador de Qwen3.6-35B-A3B, por lo que su despliegue es idéntico al del modelo base. Con 35.951.822.704 parámetros totales y una licencia Apache 2.0, se posiciona como una alternativa de pesos abiertos con un alineamiento documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), causal language model (qwen3_5_moe) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (inferido del nombre del modelo base, no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Snowdon1.1-Small hereda la arquitectura MoE de Qwen3.6-35B-A3B, sin cambios en la estructura de capas ni en el tokenizador. El proceso de realineación consta de dos etapas:

- **Etapa 1: Ablation direccional enrutada por Fisher.** Un análisis de activaciones contrastivo identifica la dirección asociada al comportamiento objetivo (misalignment temático). Una actualización de pesos de rango 1 suprime esa dirección, pero la corrección se enruta a través de una métrica de Fisher diagonal, lo que coloca la perturbación en las direcciones donde el modelo es localmente menos sensible. Esto permite mantener la capacidad general mientras se reduce el sesgo.
- **Etapa 2: DPO constitucional.** Tras la ablación, se aplica un ajuste con DPO para limpiar los comportamientos residuales que la edición de pesos no alcanza. La realineación se evalúa contra la «Public AI Constitution», un documento público que establece los estándares de comportamiento esperados.

No se han publicado datos sobre el volumen de tokens de entrenamiento ni la composición del dataset utilizado en la etapa de DPO. La información disponible indica que la realineación se realiza sobre un checkpoint existente, sin entrenamiento desde cero.

## Capacidades

- Generación de texto y conversación multironda, con arquitectura causal de lenguaje.
- Soporte de entrada multimodal (imagen-texto) según el tag «image-text-to-text», aunque no se detallan capacidades específicas de visión en la documentación.
- Alineación específica para tratar temas políticamente sensibles con equilibrio y sin rechazo sistemático, según la Public AI Constitution.
- Preservación de la capacidad de rechazo ante solicitudes inseguras: el modelo mantiene un 97,8% de tasa de rechazo en pruebas de seguridad, frente al 73,2% de una ablación sin restricciones.
- Compatibilidad con herramientas de servido estándar (vLLM, TGI, etc.) al no requerir hooks de activación adicionales, ya que los adaptadores de rango 1 están fusionados en los pesos.

## Casos de uso

- **Análisis de contenido político y de opinión**: el modelo puede resumir y analizar textos de distintas procedencias geográficas sin sesgo regional, gracias a su realineación temática. Es adecuado para herramientas de monitorización de medios o análisis de discurso político.

- **Generación de respuestas equilibradas en servicios de información pública**: sistemas de asistencia de organismos gubernamentales que necesitan tratar temas controvertidos con neutralidad y sustancia, evitando respuestas evasivas o de negación.

- **Moderación de debates y foros en línea**: puede generar respuestas que presenten múltiples perspectivas sobre temas sensibles, ayudando a moderadores a proporcionar información balanceada.

- **Investigación académica en ciencias políticas**: útil para generar análisis de políticas comparadas, resúmenes de literatura y síntesis de documentos de posición con un marco equilibrado.

- **Base para sistemas de generación de informes**: el modelo puede servir como núcleo de herramientas de redacción de informes que requieren un tono neutro y bien fundamentado sobre temas de actualidad.

- **Desarrollo de aplicaciones de IA responsable**: por su alineación explícita y auditable, es adecuado para prototipos donde se necesite documentar y justificar las decisiones de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la documentación incluye un resultado específico del experimento de ablación de seguridad:

| Métrica | Valor |
|---|---|
| Tasa de rechazo ante solicitudes inseguras (Snowdon1.1-Small) | 97.8% |
| Tasa de rechazo ante solicitudes inseguras (ablación vanilla) | 73.2% |

Este dato proviene del estudio de ablación del propio autor y no es comparable con benchmarks generales de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Al ser un modelo MoE con ~3B activos, la inferencia puede ser más eficiente que un modelo denso de 35B, pero el tamaño total de los pesos (71.9 GB en safetensors) requiere memoria suficiente para cargar todos los parámetros. Se recomienda usar cuantización (por ejemplo, 4 bits) para reducir el footprint, aunque no se especifican valores concretos.
- **GPU recomendadas**: no se especifican. Para una carga completa en precisión FP16, se necesitaría una GPU con al menos 72 GB de VRAM (p. ej., A100 80GB, H100). Con cuantización de 8 bits podría caber en una RTX 4090 (24 GB), pero no se confirma.
- **Opciones de despliegue**: compatible con servidores de inferencia estándar como vLLM, TGI, llama.cpp u Ollama, al no requerir hooks especiales. La documentación indica que la configuración de servidor del modelo base se aplica sin cambios.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Alineación documentada |
|---|---|---|---|---|
| Snowdon1.1-Small | 35.9B (3B activos) | no disponible | Apache 2.0 | Sí (Public AI Constitution) |
| Qwen3.6-35B-A3B (base) | 35.9B (3B activos) | no disponible | Apache 2.0 | No explícita |

La comparativa se limita al modelo base, dado que no se dispone de información sobre otros modelos realineados con características similares. No se han publicado datos de rendimiento comparativos.

## Limitaciones y advertencias

- **Sesgos residuales**: aunque el modelo está realineado para reducir el sesgo temático, no se garantiza la ausencia total de sesgos en otros dominios (género, raza, etc.).
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o no verificada. La realineación no aborda la veracidad factual.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; el modelo hereda la del base, pero no se confirma.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero es necesario revisar los términos de la licencia del modelo base Qwen3.6-35B-A3B para confirmar que no hay restricciones adicionales.
- **Alineación específica**: el modelo está alineado a una constitución concreta (Public AI Constitution). Esa alineación puede no ser adecuada para todos los dominios o contextos culturales, y los usuarios deben evaluar si los valores de la constitución son compatibles con su caso de uso.
- **Falta de benchmarks**: no se han publicado resultados de rendimiento general, lo que dificulta la evaluación objetiva de sus capacidades frente a otros modelos.
- **Tamaño de pesos**: el checkpoint completo ocupa 71.9 GB, lo que puede dificultar su despliegue en entornos con recursos limitados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/tri-fair-lab/Snowdon1.1-Small)
- [Colección de modelos Snowdon](https://huggingface.co/collections/tri-fair-lab/snowdon-models)
- [Public AI Constitution (PDF)](https://huggingface.co/spaces/tri-fair-lab/publications/blob/main/Public_AI_Constitution.pdf)
- [Perfil de la organización tri-fair-lab](https://huggingface.co/tri-fair-lab/models)
- [Entrada en FriendliAI](https://friendli.ai/models/tri-fair-lab/Snowdon1.1-Small)
