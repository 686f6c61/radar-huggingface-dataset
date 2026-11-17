# xCloudinfo/Qwen3.6-35B-A3B-Uncensored-xCloud

## Resumen

Qwen3.6-35B-A3B-Uncensored-xCloud es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por xCloudinfo (云碩科技), un derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una fusión de pesos en formato safetensors a la que se ha aplicado una técnica de "abliteration" (ablación de dirección única) para reducir el exceso de rechazos en las respuestas, sin reentrenamiento adicional. El modelo conserva la arquitectura del original: 35.107.181.936 parámetros totales con aproximadamente 3.000 millones activos por token, según indica el autor en la model card.

El problema que aborda es el de la sobre-negativa (over-refusal): modelos alineados con frecuencia rechazan peticiones legítimas por precaución excesiva. La abliteración busca mitigar ese comportamiento manteniendo las capacidades generales. El autor afirma que las capacidades en chino tradicional y el rendimiento general no se degradan tras la modificación.

Es relevante para equipos que necesitan un modelo de gran tamaño con activación dispersa para despliegue en infraestructura propia, y que requieran menos restricciones conversacionales en contextos de investigación de seguridad, red-teaming o moderación de contenido. La licencia es Apache-2.0, heredada del modelo base. El autor recomienda explícitamente usar la versión GGUF para inferencia y señala que el modelo está pensado para uso legal exclusivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal SSM (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B (indicado como "35B total / 3B active" en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; el autor remite a la versión GGUF para inferencia cuantizada |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (versión GGUF disponible en repo separado) |

## Arquitectura y entrenamiento

El modelo es un derivado del Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) y componentes de atención lineal de tipo SSM, según se deduce del tag `qwen3_5_moe` y de la mención en la model card a los módulos `out_proj` de la atención lineal SSM. La modificación aplicada por xCloudinfo no implica reentrenamiento: se trata de una ablación de dirección única siguiendo el método de Arditi et al. (2024), que identifica una dirección en el espacio de activaciones asociada al comportamiento de rechazo y la elimina de los pesos.

La intervención cubre 121 matrices, incluyendo los `out_proj` de la atención lineal SSM, los `down_proj` de los expertos MoE y los expertos compartidos que escriben en el residual de la torre de texto. Al derivar la dirección de ablación se evitó el segmento de "thinking" del razonamiento, presumiblemente para no degradar la capacidad de razonamiento del modelo. El autor reporta que, en una prueba held-out de 10 problemas de daño severo, tras cuantización y mediante llama-server, el modelo respondió a 0 de 10 (es decir, mantiene el rechazo en esos casos), y que las capacidades en chino tradicional y generales no se degradaron. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno en chino y en inglés.
- Razonamiento con modo "thinking" (el autor menciona explícitamente el segmento de razonamiento al derivar la dirección de ablación, lo que implica que el modelo base lo soporta).
- Mezcla de expertos con activación dispersa (~3B parámetros activos de 35B totales), lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Capacidades multilingües limitadas a zh y en según los metadatos del modelo.
- Reducción del exceso de rechazos en peticiones que el modelo base tendería a declinar.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo puede emplearse para generar y evaluar prompts adversarios y estudiar comportamientos de rechazo, aprovechando su menor tasa de negativas frente al modelo base. Es adecuado porque la abliteración está orientada precisamente a este tipo de análisis.
- Moderación de contenido y análisis de políticas: equipos que necesitan examinar material sensible para clasificarlo pueden usar el modelo para describir y categorizar contenido sin que rechace sistemáticamente las peticiones, con la supervisión humana correspondiente.
- Despliegue en infraestructura propia (on-premise): xCloudinfo está orientada a soluciones privadas; el modelo puede alojarse en servidores propios para aplicaciones que requieran confidencialidad de datos, usando la versión GGUF con llama.cpp o llama-server.
- Asistentes conversacionales en chino e inglés: con 35B totales y ~3B activos, el modelo ofrece buena calidad conversacional con un coste de inferencia contenido, adecuado para atención al cliente o asistentes internos en entornos donde no se desea censura excesiva en temas legítimos.
- Generación de contenido creativo y narrativo: la reducción de rechazos permite trabajar con tramas, personajes o diálogos que el modelo base podría declinar, útil en escritura de ficción y guiones.
- Experimentación académica sobre alineación y abliteración: investigadores pueden comparar este modelo con el Qwen3.6-35B-A3B original para medir el efecto de la ablación en capacidades, sesgos y tasas de rechazo, dado que el autor documenta el método con transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado por el autor es una prueba held-out de 10 problemas de daño severo, con resultado 0/10 tras cuantización mediante llama-server, que indica que el modelo sigue rechazando ese tipo de peticiones. No se aportan cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 70 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 80 GB o más, lo que apunta a A100 80GB, H100 80GB o configuraciones multi-GPU.
- Con cuantización de 4 bits (GGUF Q4): los pesos bajan a unos 18-20 GB, lo que permite ejecución en una RTX 4090 (24 GB) o en dos GPUs consumer de 12-16 GB.
- Con cuantización de 8 bits: en torno a 35-37 GB, viable en A100 40GB o en configuraciones de 2x RTX 3090/4090.
- El repo safetensors ocupa 140,4 GB, lo que incluye pesos en varios formatos o precisión; conviene descargar selectivamente.
- Opciones de despliegue: el autor recomienda la versión GGUF con llama.cpp/llama-server; para la versión safetensors son adecuados vLLM, TGI o SGLang, siempre que soporten la arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles. Al tener ~3B parámetros activos, el throughput por token debería ser notablemente superior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-xCloud | 35,1B | ~3B | no disponible | Apache-2.0 | Derivado abliterado del base |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B | ~3B | no disponible | Apache-2.0 | Modelo original sin modificar, con alineación estándar |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación más directa es con el modelo base Qwen3.6-35B-A3B: misma arquitectura, mismos parámetros y misma licencia, con la diferencia de la ablación aplicada. No se dispone de información verificada sobre otros modelos comparables de la misma categoría para esta ficha.

## Limitaciones y advertencias

- La abliteración reduce los rechazos, pero no elimina los sesgos ni la cosmovisión heredada del modelo base Qwen3.6, de origen chino; el propio autor advierte que el contenido relativo a posturas y visión del mundo queda fuera del alcance de la modificación.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada en la información disponible, lo que dificulta planificar aplicaciones con ventanas largas.
- El modelo está pensado exclusivamente para usos legales (investigación de seguridad, red-teaming, moderación, académico); el usuario asume toda la responsabilidad legal y ética. El uso ilegal está prohibido por el autor.
- La licencia Apache-2.0 permite uso comercial, pero la reducción de salvaguardas puede implicar riesgos reputacionales y de cumplimiento en productos orientados al público general; se recomienda evaluar con detalle antes de desplegarlo en producción.
- Solo 560 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados, sin evidencia independiente de calidad.
- El autor recomienda usar la versión GGUF para inferencia; la versión safetensors puede no ser compatible con todos los frameworks sin configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-xCloud
- Versión GGUF recomendada para inferencia: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://hf.co/xCloudinfo
- Método de abliteración (Arditi et al. 2024): referencia citada en la model card, sin enlace directo proporcionado
