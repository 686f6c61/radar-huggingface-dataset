# ziyan98/E2K-cd82-Qwen3.8-27B-know-lora

## Resumen

E2K-cd82-Qwen3.8-27B-know-lora es una colección de adaptadores LoRA de PEFT publicada por el usuario ziyan98 sobre el modelo base Qwen/Qwen3.8-27B. El entrenamiento busca internalizar en los pesos del modelo una lista de conocimiento verificada denominada "cd82", presentada como documentos, dentro de un flujo de trabajo que el autor etiqueta como "experience-to-knowledge" y que asocia al benchmark ARC-AGI-3. No se trata de un modelo completo, sino de pesos delta que requieren cargar el modelo base para funcionar.

El repositorio contiene tres carpetas de experimento (`single-27b-S/`, `short-27b-S2/` y `27b-B/`) con distintos checkpoints identificados como `pN`, donde N indica el número de pasadas sobre la lista de conocimiento. El checkpoint `single-27b-S/p20` es el que se ha fusionado en el repositorio derivado `ziyan98/E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745`, que sirve como modelo base de una ejecución de GRPO.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre datos de entrenamiento, sin benchmarks publicados y con una advertencia de seguridad explícita por parte del autor, que indica que la máquina donde se generaron los pesos sufrió un compromiso de root. Todo ello condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; r=128, alpha=256, aplicado a todas las capas lineales del modelo de lenguaje, incluidas las proyecciones de linear-attention |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base Qwen/Qwen3.8-27B tiene 27B según su denominación) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.8-27B, no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (explícitamente, sin pickles) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 128 y alpha 256 insertados en todas las capas lineales del modelo de lenguaje Qwen3.8-27B, incluidas las proyecciones de la atención lineal. El objetivo declarado es que el modelo "lea" la lista de conocimiento cd82, presentada como documentos, y la incorpore a sus pesos mediante ajuste fino de bajo rango. Los checkpoints se organizan por número de pasadas sobre esa lista: `single-27b-S/` incluye p20, p40 y p80; `short-27b-S2/` incluye p5, p10, p15 y p20; y `27b-B/` incluye p20, p40 y p80.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de la referencia a la lista cd82, ni si se emplearon técnicas de alineación como RLHF o DPO en esta fase. El autor menciona que el checkpoint `single-27b-S/p20` se fusionó en un modelo derivado que después se usó como base de una ejecución de GRPO, lo que sugiere un pipeline en dos etapas: internalización de conocimiento por LoRA y posterior optimización con refuerzo. El entrenamiento se realizó los días 24 y 25 de noviembre de 2026 en una VM con GPU H200.

## Capacidades

- Internalización de conocimiento: los adaptadores están entrenados para incorporar la lista cd82 en los pesos del modelo base, con checkpoints que reflejan distintas intensidades de exposición (de 5 a 80 pasadas).
- Razonamiento y generación de texto: heredados del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas tras la adaptación.
- Contexto de investigación en ARC-AGI-3: las etiquetas del repositorio asocian el trabajo al benchmark ARC-AGI-3 y a flujos "experience-to-knowledge".
- Compatibilidad con PEFT: carga mediante `PeftModel.from_pretrained` con selección de subcarpeta, lo que permite intercambiar checkpoints sin duplicar el modelo base.
- Fusión de adaptadores: al menos un checkpoint (`single-27b-S/p20`) se ha fusionado con éxito en un modelo completo publicado aparte, lo que facilita su despliegue sin PEFT.
- Capacidades multimodales, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre internalización de conocimiento: el caso de uso principal es estudiar si un modelo de 27B puede absorber una lista factual concreta en sus pesos mediante LoRA y medir la retención en función del número de pasadas (p5 a p80), comparando los checkpoints publicados.
- Reproducción de experimentos de ARC-AGI-3: los adaptadores permiten reproducir la etapa de "experience-to-knowledge" previa a la ejecución de GRPO documentada por el autor, usando el modelo fusionado como punto de partida.
- Comparación de estrategias de ajuste de bajo rango: las tres carpetas de experimento (single, short y B) permiten analizar el efecto del régimen de entrenamiento sobre la misma lista de conocimiento.
- Base para pipelines de RL posterior: el checkpoint fusionado `gamemerge-p20-b0.871745` sirve como modelo base para GRPO, de modo que estos LoRA son útiles como fase de precondicionamiento antes de optimización por refuerzo.
- Estudio de olvido catastrófico: al aplicar adaptadores de rango 128 sobre todas las capas lineales, resulta un caso práctico para medir cuánto se degradan capacidades generales del modelo base tras la internalización.
- Docencia y experimentación con PEFT: el repositorio ilustra el flujo completo de carga por subcarpeta con `PeftModel.from_pretrained`, útil en entornos formativos de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 37,4 GB, pero la inferencia requiere cargar además el modelo base Qwen/Qwen3.8-27B, por lo que el requisito real de VRAM lo determina el modelo base, no el LoRA.
- Con 27B parámetros en precisión de 16 bits, se estiman del orden de 54 GB solo para pesos del modelo base, a los que se suman los adaptadores y la caché KV; se recomienda GPU de 80 GB (H100, A100 80GB) para comodidad en 16 bits.
- En cuantización de 8 bits el modelo base rondaría los 27 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas (4 bits, aproximadamente 14-16 GB de pesos) y contextos reducidos.
- El autor reporta entrenamiento en una VM con GPU H200, lo que da una referencia del hardware utilizado en la fase de ajuste.
- Opciones de despliegue: PEFT sobre transformers para cargar los adaptadores; tras fusionar (como en `gamemerge-p20`), el modelo resultante puede servirse con vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se documenta compatibilidad explícita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-know-lora | LoRA sobre Qwen3.8-27B | 27B (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B | Modelo base completo | 27B | no disponible | no disponible en la información | Hugging Face |
| ziyan98/E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745 | Modelo fusionado con el LoRA p20 | 27B | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes ni con alternativas de otros autores, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Advertencia de seguridad del propio autor: la VM H200 donde se generaron los pesos estuvo comprometida a nivel de root desde el 27 de noviembre de 2026 a las 06:50 UTC; los archivos están fechados antes del compromiso y el repositorio incluye `SHA256SUMS` con hashes tomados en el momento de la copia, pero conviene verificar la integridad antes de cualquier uso.
- Artefacto de investigación sin validación externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas.
- No es un modelo autónomo: requiere el modelo base Qwen/Qwen3.8-27B y la librería PEFT para cargarse.
- Riesgo de olvido catastrófico: al aplicar LoRA de rango 128 sobre todas las capas lineales, es plausible la degradación de capacidades generales del modelo base; no se documenta ninguna evaluación al respecto.
- Sesgos y alucinaciones: no documentados; al tratarse de internalización de una lista de conocimiento concreta, existe riesgo de que el modelo reproduzca contenido de esa lista de forma incorrecta o lo mezcle con conocimiento previo.
- Idiomas soportados no especificados; se desconoce el comportamiento multilingüe tras la adaptación.
- Restricciones de licencia: apache-2.0 en el repositorio, pero el uso comercial depende también de la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la información disponible.
- Sin model card técnica: no hay información sobre datos de entrenamiento, hiperparámetros completos ni proceso de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-know-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo fusionado derivado: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745
