# VextLabsinc/juwel-garnet

## Resumen

JUWEL Garnet es un modelo de lenguaje de gran escala (LLM) desarrollado por Vext Labs, un laboratorio de investigación independiente estadounidense. Este lanzamiento consiste en un espejo público de los pesos del modelo, originalmente distribuidos a través de la infraestructura Cloudflare R2 de Vext Labs, y se ofrece bajo licencia Apache 2.0. El modelo utiliza la arquitectura Qwen3NextForCausalLM, con un total de 79 674 391 296 parámetros (aproximadamente 79 700 millones), configuración MoE de 512 expertos con 10 seleccionados por token, y una ventana de contexto de 262 144 tokens.

La relevancia de este lanzamiento reside en su carácter abierto y verificable: Vext Labs publica recibos de integridad estructural (mirror receipts) que permiten verificar la correspondencia byte a byte con la fuente original, así como hashes SHA-256 completos. Sin embargo, la tarjeta del modelo es explícita en que este repositorio no es el modelo insignia de la compañía (denominado Theta), no realiza afirmaciones sobre rendimiento, seguridad en producción ni estado del arte, y la evaluación de capacidades está pendiente. El modelo está orientado a generación de texto conversacional y es compatible con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (MoE) |
| Parametros totales | 79 674 391 296 |
| Parametros activos | 10 expertos de 512 seleccionados por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (32 shards, 74 391 tensores indexados) |

## Arquitectura y entrenamiento

JUWEL Garnet emplea la arquitectura Qwen3-Next, una familia de modelos de mezcla de expertos (MoE) desarrollada originalmente por Alibaba Qwen. La configuración específica incluye 48 capas, tamaño oculto de 2048, 16 cabezas de atención con 2 cabezas KV, y un vocabulario de 151 936 tokens. El modelo está configurado para una longitud de contexto de 262 144 tokens.

La información disponible no detalla el proceso de entrenamiento, la composición del dataset ni el número de tokens utilizados. La tarjeta del modelo indica que la metadata de la versión recuperada no vincula una revisión exacta del upstream de Qwen, y que no se implica ningún respaldo por parte de Qwen. El lanzamiento es un espejo de pesos públicos, no una publicación de investigación con detalles de entrenamiento. Los datos de entrenamiento y el proceso de alineación (si lo hubo) no se han publicado en esta tarjeta.

## Capacidades

- Generación de texto: el modelo está diseñado para tareas de generación de texto conversacional, como indica su pipeline de text-generation.
- Razonamiento y conversación multi-turno: gracias a su ventana de contexto de 262 144 tokens, puede mantener conversaciones extensas y manejar documentos de gran tamaño en una sola pasada.
- Capacidades multilingües: no se han publicado los idiomas soportados específicos, aunque la familia Qwen3-Next suele ser multilingüe.
- Tool calling y function calling: no se especifica en la información disponible.
- Soporte de agentes y multi-step reasoning: no se especifica en la información disponible.
- Modo de pensamiento (thinking mode): no se especifica en la información disponible.

La tarjeta del modelo es explícita: la evaluación de capacidades está pendiente. No se realizan afirmaciones sobre capacidades concretas más allá de las derivadas de la arquitectura.

## Casos de uso

- Investigación académica en arquitecturas MoE: el modelo es un ejemplo de implementación de la arquitectura Qwen3-Next con 512 expertos, y puede servir como referencia para estudiar el comportamiento de modelos MoE a gran escala.
- Desarrollo de aplicaciones conversacionales con contexto largo: con 262 144 tokens de contexto, puede procesar libros completos, bases de conocimiento extensas o historiales de conversación muy largos en una sola pasada.
- Experimentación con inferencia distribuida: el tamaño de 79 700 millones de parámetros en BF16 requiere infraestructura multi-GPU, lo que lo convierte en un candidato para probar estrategias de sharding y paralelismo de modelos.
- Investigación sobre la integridad de pesos y verificación de modelos: el modelo incluye un sistema de recibos de espejo (mirror receipts) que verifica la integridad estructural y los hashes de los archivos, útil para estudios de reproducibilidad.
- Desarrollo de sistemas de generación aumentada por recuperación (RAG): el contexto largo permite incorporar grandes volúmenes de documentos en el prompt.
- Fine-tuning sobre dominios específicos: al estar licenciado bajo Apache 2.0, el modelo puede adaptarse para tareas especializadas sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo declara explícitamente que no se hacen afirmaciones sobre rendimiento, estado de arte ni evaluación de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 159 GB de memoria (79 674 391 296 parámetros × 2 bytes). Para una inferencia eficiente se recomienda un mínimo de 160 GB de VRAM, aunque el uso de cuantización (no publicada) podría reducir el requisito.
- GPU recomendadas: múltiples GPUs de alta gama. Una configuración típica sería 4× A100 80 GB o 2× H100 80 GB. En el caso de GPUs consumer, no es viable en una sola GPU.
- Si cabe en consumer GPU: no, el tamaño en BF16 supera la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: el modelo es compatible con la librería Transformers y con las herramientas de la familia Qwen3-Next. Se puede desplegar con vLLM, TGI o cualquier servidor de inferencia que soporte la arquitectura Qwen3NextForCausalLM. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponible. No se han publicado datos de rendimiento de inferencia.

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos. Sin embargo, por su arquitectura y tamaño, se puede situar en la categoría de modelos MoE de gran escala. Como referencia de la misma familia, Qwen3-Next es la base de la que deriva. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Estado de espejo: el repositorio es un espejo de pesos públicos, no un lanzamiento de investigación completo. El autor indica que no se debe tratar como un repositorio autocontenido hasta que el recibo de verificación reporte `MIRRORED_STRUCTURAL_PASS`.
- Capacidades no verificadas: la tarjeta declara explícitamente que la evaluación de capacidades está pendiente. No se ha verificado la calidad de la generación, el rendimiento en tareas de razonamiento ni la seguridad de producción.
- Proveniencia de datos de entrenamiento: no se ha publicado información sobre la composición de los datos de entrenamiento, por lo que los sesgos y la calidad de los datos son desconocidos.
- Riesgo de alucinación: no se ha evaluado la tasa de alucinación ni el comportamiento en escenarios adversos.
- Restricciones de licencia: la licencia Apache 2.0 permite el uso comercial sin restricciones de campo de uso, pero el autor advierte que no se trata de una reclamación de conformidad con la definición de IA de código abierto de OSI, que también considera la información sobre datos de entrenamiento.
- Sin respaldo de Qwen: el uso de la arquitectura Qwen3-Next no implica ningún respaldo por parte de Alibaba o Qwen.
- No es el modelo insignia: este no es el modelo Theta de Vext Labs, sino un lanzamiento de pesos públicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VextLabsinc/juwel-garnet
- Organización Vext Labs en Hugging Face: https://huggingface.co/models?other=juwel-garnet
- GitHub de Vext Labs: https://github.com/Vext-Labs-Inc/
- Repositorio de investigación de Vext Labs: https://github.com/Vext-Labs-Inc/research
- Sitio web de Vext Labs: https://vextlabs.ai/
