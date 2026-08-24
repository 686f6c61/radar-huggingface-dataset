# win10/Muse-Glimmer-30B-EXP-EVE-v1

## Resumen

El modelo `win10/Muse-Glimmer-30B-EXP-EVE-v1` es un merge experimental de arquitectura cruzada construido sobre el modelo base `meta-models/Muse-Glimmer-30B`, un modelo multimodal agéntico de 30B parámetros desarrollado por Meta. El autor, `win10`, ha aplicado una técnica de fusión denominada *Tensor Gene Evolution* para incorporar características de razonamiento y comportamiento de los modelos `deepseek-ai/DeepSeek-V4-Flash-0731` y `dots-studio/dots3-note-prev` en el backbone de Muse Glimmer. Según la model card, el resultado preserva mejor las características de razonamiento de los donantes, con una cobertura de razonamiento más amplia, mayor profundidad de pensamiento y un comportamiento de resolución de problemas más diverso en comparación con el modelo base.

El modelo tiene 29.776.626.688 parámetros (aproximadamente 30B), está publicado bajo licencia Apache 2.0, soporta inglés y chino, y está destinado a tareas de imagen-texto-a-texto (image-text-to-text). Aunque la arquitectura concreta no se especifica en la información disponible, el modelo base es multimodal y agéntico, con soporte de función calling y contexto largo, tal y como se describe en la documentación pública de Meta. Este modelo es relevante para desarrolladores que buscan alternativas locales de razonamiento multimodal con capacidades de agente, aunque su carácter experimental implica que debe validarse antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal basado en Muse-Glimmer-30B, fusión de arquitecturas) |
| Parámetros totales | 29.776.626.688 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Muse-Glimmer-30B soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantización | no disponible (no se publican cuantizaciones específicas para este modelo) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de arquitectura cruzada que combina el backbone de `Muse-Glimmer-30B` con características de `DeepSeek-V4-Flash-0731` y `dots3-note-prev`. La técnica de fusión denominada *Tensor Evolution Gate* se emplea para integrar las capacidades de los modelos donantes en la estructura del modelo base. No se dispone de información detallada sobre el proceso de entrenamiento, los datos utilizados ni el número de tokens de entrenamiento, ya que el autor no los ha publicado en la model card.

El modelo base `Muse-Glimmer-30B` es un modelo multimodal (imagen-texto) con arquitectura transformer, diseñado para ejecutarse en dispositivos locales y con soporte de función calling. El modelo resultante hereda estas capacidades multimodales y agénticas, y según el autor, mejora la diversidad y profundidad del razonamiento respecto al base. No se ha publicado información sobre técnicas de alineación como RLHF o DPO, ni sobre innovaciones arquitectónicas adicionales más allá de la fusión de pesos.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen-texto-a-texto), gracias a la base de Muse Glimmer.
- Razonamiento profundo y diverso: el autor indica que el modelo presenta una mayor cobertura y profundidad de razonamiento que el modelo base, heredando características de los donantes.
- Capacidades de agente: el modelo base soporta *function calling* y flujos agénticos, por lo que este modelo hereda esa capacidad, aunque no se confirma explícitamente en la model card.
- Generación de código: el tag `code` está presente en los metadatos, lo que sugiere que el modelo puede realizar tareas de programación.
- Multilingüismo: soporta inglés y chino.
- Interfaz de transformers: compatible con la librería `transformers`, lo que facilita su integración en pipelines existentes.

## Casos de uso

- Asistente de investigación multimodal: el modelo puede analizar imágenes y texto combinados para tareas como resumir documentos técnicos con diagramas o generar informes a partir de capturas de pantalla. Su razonamiento mejorado puede ayudar a interpretar información visual compleja.
- Agente de automatización local: gracias a la capacidad de función calling del modelo base, puede integrarse en flujos de trabajo que requieran interactuar con APIs o herramientas, ejecutando pasos de razonamiento multi-turno.
- Generación de código asistida con contexto visual: al aceptar entradas de imagen y texto, puede utilizarse para convertir bocetos o diagramas en código, o para explicar y modificar código a partir de capturas de pantalla.
- Análisis de documentos multilingües (inglés y chino): útil para empresas que manejan documentación en ambos idiomas, con capacidad de razonar sobre el contenido y generar respuestas coherentes.
- Prototipado de agentes conversacionales en dispositivos locales: con 30B de parámetros y cuantización, puede ejecutarse en hardware de gama alta (24-32GB VRAM) para experimentar con agentes conversacionales multimodales sin depender de la nube.
- Investigación sobre fusión de modelos: sirve como caso de estudio para la técnica *Tensor Evolution Gene* y para comparar el comportamiento de modelos fusionados frente a sus bases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. El modelo es experimental y no se ha evaluado de manera pública en el momento de redactar esta ficha.

## Requisitos de hardware

Los requisitos indicados se basan en el modelo base Muse-Glimmer-30B, ya que no se dispone de datos específicos para este modelo:

- VRAM estimada para inferencia: el modelo base de 30B requiere entre 24 y 32 GB de VRAM para ejecutarse con cuantización (por ejemplo, GGUF Q4 o Q5). Con la carga completa en FP16, necesitaría alrededor de 60 GB de VRAM.
- GPU recomendadas: tarjetas de gama alta como RTX 4090 (24 GB), RTX 3090 (24 GB), o A100 (40/80 GB). Para ejecutar con cuantización en una sola GPU, se necesita al menos 24 GB de VRAM.
- Si cabe en GPU de consumo: sí, en tarjetas con 24 GB o más, utilizando cuantización. En GPUs de 16 GB o menos, será necesario descargar capas a CPU, lo que afectará el rendimiento.
- Opciones de despliegue: al estar en formato safetensors, es compatible con `transformers`, `vLLM`, `llama.cpp` (si se convierten los pesos a GGUF), `Ollama` (mediante importación de GGUF) y `TGI` (si se dispone de suficiente memoria).
- Latencia y throughput: no se dispone de datos medidos para este modelo específico. Para el modelo base, se estima una velocidad de generación de 10-20 tokens/s en una RTX 4090 con cuantización 4-bit, pero no se ha verificado para el modelo fusionado.

## Comparativa con modelos similares

La comparación se realiza con el modelo base y otros modelos multimodales de 30B similares, pero sin datos de rendimiento del modelo fusionado:

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B | No especificado (largo) | Imagen, texto | Apache 2.0 | Hugging Face |
| Muse-Glimmer-30B-EXP-EVE-v1 (este) | 29.78B | No especificado | Imagen, texto | Apache 2.0 | Hugging Face |
| LLaVA-NeXT (34B) | 34B | 4K (ampliable) | Imagen, texto | Apache 2.0 | Hugging Face |
| CogVLM2 (19B) | 19B | 8K | Imagen, texto | Apache 2.0 | Hugging Face |

No se dispone de comparativas de rendimiento directas entre estos modelos, ya que el modelo fusionado no tiene benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental: se trata de un merge realizado por un autor independiente, no por Meta. No hay garantía de calidad ni de comportamiento estable en producción.
- Falta de evaluación pública: no hay benchmarks publicados, por lo que no se pueden validar las afirmaciones del autor sobre la mejora del razonamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejas.
- Sesgos potenciales: el modelo base y los donantes pueden contener sesgos de género, raza o cultura. No se ha realizado una evaluación de sesgos.
- Limitaciones de idioma: solo se ha declarado soporte para inglés y chino. No se recomienda su uso en otros idiomas sin pruebas previas.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero Meta establece una política de uso para Muse Glimmer que prohíbe ciertos usos (por ejemplo, menores de 18 años, usos de alto riesgo). Esta política se aplica al modelo base y, por extensión, al modelo fusionado.
- Reproducibilidad: la técnica de fusión no está documentada en detalle, por lo que no se puede replicar ni verificar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/win10/Muse-Glimmer-30B-EXP-EVE-v1
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Muse Glimmer de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Guía de hardware y ejecución de Muse Glimmer 30B: https://kingy.ai/blog/muse-glimmer-30b-benchmarks-hardware-run/
- Requisitos de hardware para Muse Glimmer 30B: https://www.pcquest.com/tech-explained/muse-glimmer-30b-hardware-requirements-can-your-pc-run-this-30b-ai-model-12249793
- Repositorio de ejemplo de Muse Glimmer en GitHub: https://github.com/cobusgreyling/Muse-Glimmer
