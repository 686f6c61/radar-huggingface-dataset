# ssv555/Qwen3.6-35B-A3B-V13

## Resumen

Qwen3.6-35B-A3B-V13 es una cuantización GGUF de un modelo de lenguaje de tipo mixture-of-experts (MoE) con aproximadamente 35.500 millones de parámetros totales y unos 3.000 millones activos por token, acompañado de un proyector de visión que habilita la entrada de imagen y texto. El artefacto lo publica el usuario `ssv555` en Hugging Face y deriva de una publicación previa del mismo autor bajo el nombre `Hermes3.6-35B-A3B-Uncensored-Genesis-V13-MTP-APEX-Compact`, alojada en un repositorio restringido. La model card se limita a documentar el origen y la composición de los ficheros, sin detallar el proceso de entrenamiento ni los datos utilizados.

El modelo se distribuye empaquetado para llama.cpp e incluye una cabeza de predicción multi-token (MTP) dentro del fichero principal, lo que según el autor explica que este sea 1,7 GB mayor que una compilación equivalente sin MTP. La nomenclatura indica un ajuste de tipo Hermes sobre una base Qwen3.6, con las rechazos eliminados y una mezcla de cuantización guiada por imatrix denominada APEX-Compact. Se trata, por tanto, de un artefacto de inferencia derivado y no de un modelo entrenado desde cero por el publicador.

Su relevancia es fundamentalmente práctica: ofrece un MoE de 35B con activación de 3B y capacidad multimodal en un único GGUF de 19,1 GB más un proyector de 0,9 GB, un tamaño manejable para hardware de consumo de gama alta. La ausencia de métricas publicadas y de licencia explícita condiciona, sin embargo, cualquier evaluación seria de su calidad y de su viabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE) y proyector de visión; cabeza de predicción multi-token (MTP) incluida en el fichero principal |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (mezcla propietaria "APEX-Compact" guiada por imatrix); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); fichero principal de 19,1 GB y proyector mmproj de 0,9 GB en F16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 35,5B parámetros almacenados de los que se activan aproximadamente 3B por token, lo que sitúa el coste computacional de inferencia en el orden de un modelo denso de 3B pese a ocupar en memoria como uno de 35B. Sobre el modelo lingüístico se añade un proyector de visión que convierte representaciones de imagen en tokens consumibles por el decoder, habilitando la tarea `image-text-to-text`. El fichero GGUF incorpora además una cabeza MTP, un mecanismo de decodificación especulativa que predice varios tokens por paso para acelerar la generación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni la receta exacta de ajuste. La model card indica únicamente que la base es Qwen3.6, que sobre ella se aplicó un ajuste de estilo Hermes orientado a conversación y tool calling, que se eliminaron los rechazos y que la cuantización emplea una mezcla guiada por imatrix. El publicador no confirma la interpretación de su propia nomenclatura, de modo que estos extremos deben tratarse como lectura inferida del nombre del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, con ajuste orientado a diálogo.
- Razonamiento y resolución de tareas de lenguaje general, heredados de la base Qwen3.6.
- Entrada multimodal: procesamiento de imágenes junto con texto mediante el proyector F16, con salida exclusivamente textual.
- Tool calling y function calling, según la nomenclatura Hermes del ajuste.
- Decodificación multi-token mediante la cabeza MTP embebida, orientada a reducir la latencia por token.
- Ejecución en llama.cpp con soporte de cuantización GGUF e imatrix.
- Comportamiento sin rechazos por diseño ("uncensored"), lo que implica ausencia de filtrado de seguridad en las respuestas.
- Capacidades multilingües: no disponibles como dato confirmado.

## Casos de uso

- Asistente conversacional autoalojado: el MoE activa solo unos 3B parámetros por token, de modo que un único servidor con una GPU de 24 GB puede sostener conversaciones multi-turno con un coste de cómputo próximo al de un modelo de 3B, siempre que la memoria alcance para los 19,1 GB de pesos.
- Procesamiento de documentos con imagen: el proyector de visión permite extraer y razonar sobre capturas, diagramas o formularios escaneados, enviando la imagen junto al texto y recibiendo la respuesta en lenguaje natural.
- Automatización de agentes con herramientas: el ajuste de tipo Hermes facilita la emisión de llamadas a funciones estructuradas, integrándose en orquestadores que encadenan varios pasos con APIs externas.
- Generación de código asistida en local: un modelo de 35B con activación dispersa cabe en una estación de trabajo con una RTX 4090 o similar y permite autocompletado y explicación de código sin depender de servicios en la nube.
- Investigación sobre alineación y comportamiento: al estar etiquetado como "uncensored", resulta útil como objeto de estudio para medir tasas de rechazo, sesgos y derivas de seguridad en modelos sin filtrado.
- Prototipado de pipelines multimodales en llama.cpp: sirve para validar arquitecturas de visión-lenguaje en entornos con recursos limitados antes de migrar a modelos mayores o a infraestructura con vLLM.
- Evaluación comparativa de cuantizaciones: la mezcla APEX-Compact guiada por imatrix permite estudiar la degradación de calidad frente al modelo original en distintas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: al menos 20 GB para cargar el fichero principal de 19,1 GB más el proyector de 0,9 GB, sin contar el contexto KV cache; con contexto largo la demanda crece de forma apreciable.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegues con contexto amplio y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual.
- GPU de consumo: cabe en tarjetas de 24 GB, aunque con margen ajustado para el contexto; en tarjetas de 16 GB requeriría cuantizaciones adicionales más agresivas no documentadas en el repositorio.
- Despliegue: llama.cpp es el runtime de referencia por el formato GGUF; también puede servirse mediante Ollama o interfaces compatibles con endpoints, según la etiqueta `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa para este artefacto.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para reducir la latencia mediante decodificación especulativa, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-V13 | 35,5B / ~3B | no disponible | no disponible | GGUF | Ajuste Hermes sin rechazos, visión y MTP |
| Qwen3-30B-A3B | 30,5B / ~3,3B | 262.144 tokens (modelo base Qwen3) | Apache 2.0 (modelo base Qwen3) | safetensors, GGUF | Referencia oficial de MoE disperso de Alibaba; sin visión en la variante estándar |
| Mixtral 8x7B | 46,7B / ~12,9B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE más antiguo y con mayor activación por token |
| Qwen2.5-VL-32B | 32B densos | 128.000 tokens | Apache 2.0 (Qwen2.5-VL) | safetensors | Alternativa multimodal densa, con mayor coste de inferencia por token |

La comparación con Qwen3-30B-A3B y Mixtral 8x7B se apoya en las especificaciones públicas de esos modelos; los datos de contexto y licencia de Qwen3.6-35B-A3B-V13 no están disponibles y no se han verificado contra el modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste ni sobre la degradación introducida por la cuantización APEX-Compact.
- Licencia no especificada: no puede confirmarse la legalidad del uso comercial, de la redistribución ni de la modificación del artefacto. La base Qwen3.6 y el ajuste Hermes pueden arrastrar condiciones adicionales no reflejadas en el repositorio.
- Etiqueta "uncensored": el modelo ha sido modificado para eliminar rechazos, lo que incrementa el riesgo de generar contenido dañino, ilegal o inexacto y lo hace inadecuado para aplicaciones orientadas al público sin capas de moderación externas.
- Procedencia derivada y gated: el repositorio original estaba restringido y la model card no confirma la interpretación de la nomenclatura; la trazabilidad de los pesos es limitada.
- Idiomas soportados no documentados: no puede asumirse un rendimiento multilingüe equiparable al de la base Qwen3.6 sin evaluación propia.
- Longitud de contexto desconocida: impide planificar despliegues con documentos largos o conversaciones extensas.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no cuantificado en este artefacto; la eliminación de rechazos puede agravar la confianza excesiva en respuestas incorrectas.
- Visión limitada a entrada: el modelo no genera imágenes, solo las procesa.
- Sesgos: no documentados por el publicador; la falta de información sobre el dataset de ajuste impide estimar su magnitud.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ssv555/Qwen3.6-35B-A3B-V13
- Repositorio de origen citado (restringido): https://huggingface.co/burningfeet/backup-2026-09-03-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales asociados a este modelo.
