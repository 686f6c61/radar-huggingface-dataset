# ZiedBz/marketing-smoke-controle

## Resumen

El modelo `ZiedBz/marketing-smoke-controle` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ZiedBz sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un ajuste fino supervisado (SFT) orientado a la generación de texto conversacional, con un tamaño de repositorio de 0.1 GB, lo que indica que solo contiene los pesos del adaptador y no el modelo completo. La etiqueta `region:us` sugiere que el entrenamiento o la inferencia se realizaron en infraestructura ubicada en Estados Unidos, aunque no se especifica el propósito concreto del ajuste.

La model card publicada por el autor está prácticamente vacía: no incluye descripción del modelo, datos de entrenamiento, hiperparámetros, licencia ni resultados de evaluación. El nombre del repositorio ("marketing-smoke-controle") sugiere una posible aplicación en marketing o control de contenidos relacionados con tabaco, pero no hay evidencia documental que lo confirme. Dada la ausencia de información técnica y de evaluación, este adaptador debe considerarse experimental y de uso bajo verificación manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador pesa 0.1 GB; el modelo base tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32K tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ, pero no se especifica) |
| Idiomas soportados | no disponibles (el modelo base Qwen3-4B-Instruct-2507 soporta multiples idiomas, pero el adaptador no documenta su alcance) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-4B-Instruct-2507, un transformer decoder-only con atención de múltiples cabezas y mecanismos de reasoning explícito (thinking mode) propios de la familia Qwen3. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (Transformers Reinforcement Learning) y PEFT 0.19.1, lo que confirma el uso de LoRA como técnica de adaptación de bajo rango. No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del adaptador ni el tipo de preprocesamiento aplicado. Tampoco se documenta si se emplearon técnicas adicionales como DPO o RLHF. La ausencia de estos datos impide evaluar la calidad del ajuste o su idoneidad para tareas específicas.

## Capacidades

- Generación de texto conversacional: el adaptador está diseñado para tareas de text-generation, según el pipeline declarado.
- Ajuste específico de dominio: el nombre sugiere una especialización en marketing y control de contenidos relacionados con tabaco, aunque no hay documentación que lo confirme.
- Integración con el modelo base: al ser un adaptador LoRA, hereda las capacidades generales de Qwen3-4B-Instruct-2507 (razonamiento, generación de código, multilingüismo, tool calling) siempre que el adaptador no las degrade.
- No se documentan capacidades especiales adicionales (vision, audio, etc.).

## Casos de uso

- Clasificación o moderación de contenido promocional de tabaco en redes sociales: el adaptador podría utilizarse para detectar publicaciones que promuevan productos de tabaco, aunque no hay evidencia de que haya sido entrenado para ello. Requeriría validación manual con datos reales.
- Generación de respuestas automáticas en campañas de concienciación sobre tabaquismo: podría integrarse en un chatbot que responda a consultas de usuarios, siempre que se verifique su comportamiento.
- Análisis de sentimiento en textos de marketing: si el ajuste incluye datos de marketing, podría emplearse para clasificar tono o intención, pero no hay métricas que lo respalden.
- Prototipado rápido de asistentes conversacionales: al ser un adaptador ligero (0.1 GB), permite experimentar con bajo coste computacional sobre el modelo base.
- Investigación académica sobre adaptación LoRA en dominios específicos: el repositorio puede servir como ejemplo de flujo de trabajo con PEFT y TRL, aunque carece de documentación reproducible.
- Evaluación comparativa de adaptadores: útil para estudiar el impacto de SFT en modelos pequeños como Qwen3-4B, pero sin datos de entrenamiento no se puede replicar el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación sobre el adaptador. Tampoco se proporcionan comparativas con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen3-4B-Instruct-2507 más el adaptador. En precisión fp16, el modelo base ocupa aproximadamente 8 GB de VRAM; con cuantización de 4 bits (por ejemplo, bitsandbytes) puede reducirse a unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para fp16; con cuantización, una GPU de 4-6 GB podría ser suficiente (RTX 3050, GTX 1660, etc.).
- Compatibilidad con consumer GPU: sí, el modelo base de 4B es adecuado para GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI. El adaptador se carga mediante `PeftModel.from_pretrained` en Transformers.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización elegida; en una RTX 4090, el modelo base de 4B suele generar entre 50 y 100 tokens por segundo, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en el mismo dominio (marketing o control de tabaco). Como referencia genérica, se puede comparar con el propio modelo base y con otros adaptadores LoRA de Qwen3-4B, pero no hay datos públicos de este repositorio para establecer una comparación significativa. Se indica "no disponible" por falta de información.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El adaptador podría heredar sesgos del modelo base y de los datos de entrenamiento, que no se han hecho públicos.
- Riesgo de alucinación: alto, especialmente si el ajuste se realizó con un dataset pequeño o poco diverso. No hay evaluación que mitigue este riesgo.
- Limitaciones de contexto e idioma: no especificadas. Se asume que hereda las del modelo base, pero el adaptador podría haber reducido la ventana de contexto efectiva si el entrenamiento usó secuencias cortas.
- Restricciones de licencia: la licencia no está declarada. El modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 o similar, según la versión), pero el adaptador no especifica términos de uso. Se recomienda contactar al autor antes de uso comercial.
- Carencia de documentación: la model card no incluye información sobre el dataset, los hiperparámetros ni el propósito exacto, lo que impide evaluar su fiabilidad y reproducibilidad.
- Riesgo de uso indebido: el nombre "smoke-controle" podría interpretarse como control de humo o de tabaco, pero también podría estar relacionado con marketing de productos de tabaco, lo que plantea preocupaciones éticas y legales en algunas jurisdicciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZiedBz/marketing-smoke-controle
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces relevantes (blogs, demos, papers específicos del adaptador).
