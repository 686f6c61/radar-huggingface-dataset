# sweagent/rlvr-seed-baseline-iter74

## Resumen

rlvr-seed-baseline-iter74 es un checkpoint publicado por el usuario «sweagent» en HuggingFace, construido sobre el modelo base Qwen/Qwen3.5-35B-A3B-Base. Por la nomenclatura («rlvr» = reinforcement learning with verifiable rewards, «seed-baseline», «iter74») se trata de un punto intermedio de un pipeline de aprendizaje por refuerzo, presumiblemente orientado a tareas de ingeniería de software, aunque el autor no documenta el proceso de entrenamiento ni el conjunto de datos utilizado. El repositorio no incluye una model card propia: el README es una copia literal de la model card de Qwen3.5-35B-A3B, por lo que las especificaciones publicadas describen la arquitectura del modelo base y no necesariamente las características de este fine-tune.

La arquitectura subyacente es un transformer híbrido que combina Gated DeltaNet (atención lineal) con atención con puerta, e intercala capas Mixture-of-Experts en un total de 40 capas, con 256 expertos y 3.000 millones de parámetros activos por token. Incorpora un codificador de visión y se distribuye con licencia apache-2.0. La ventana de contexto nativa es de 262.144 tokens, ampliable hasta 1.010.000.

Su relevancia es fundamentalmente como artefacto de investigación: permite estudiar la evolución de un modelo durante un proceso de RL de gran escala (la iteración 74 sugiere un entrenamiento prolongado) y sirve como baseline reproducible. No obstante, con cero descargas y cero «likes», sin evaluación propia publicada y con una posible discrepancia entre el número de parámetros declarado y el real, no debe considerarse un modelo listo para producción sin validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: 40 capas que alternan Gated DeltaNet (atención lineal) y gated attention, cada una seguida de una capa Mixture-of-Experts (según la model card heredada de Qwen3.5-35B-A3B) |
| Parametros totales | 68.164.077.424 (~68,2 B) según los metadatos de safetensors; la model card declara 35 B totales. Discrepancia no aclarada por el autor |
| Parametros activos | ~3 B por token (8 expertos enrutados + 1 experto compartido de un total de 256) |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos safetensors en precisión completa, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible para este checkpoint. La model card heredada de Qwen3.5 indica soporte de 201 idiomas y dialectos |
| Licencia | apache-2.0 (el campo license_link apunta al fichero de licencia de Qwen/Qwen3.5-35B-A3B) |
| Formato de pesos | safetensors (compatible con la librería transformers) |

## Arquitectura y entrenamiento

El bloque descrito en la model card del modelo base presenta una disposición de capas «10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))», es decir, 40 capas en total. Las capas Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas de atención con puerta usan 16 cabezas de consulta y 2 de clave-valor, con dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 2048, el vocabulario tiene 248.320 entradas (con relleno) y la capa MoE contiene 256 expertos con dimensión intermedia 512, de los cuales se activan 8 enrutados más 1 compartido. El modelo se entrenó además con multi-token prediction (MTP) en varios pasos.

El modelo base se entrenó con fusión temprana de tokens multimodales (texto e imagen), y su entrenamiento incluye fases de preentrenamiento y postentrenamiento, con aprendizaje por refuerzo escalado sobre entornos multiagente según la documentación de Qwen. Para este checkpoint concreto no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO en su fase final. El nombre del repositorio sugiere un proceso de RLVR (refuerzo con recompensas verificables) sobre tareas de tipo software engineering, pero el autor no lo confirma en ningún momento.

## Capacidades

- Generación de texto y razonamiento: el modelo base declara paridad con Qwen3 en razonamiento, codificación y agentes, además de mejoras en comprensión visual.
- Codificación: la familia Qwen3.5 se posiciona explícitamente en benchmarks de código y agentes; el nombre del autor («sweagent») apunta a un ajuste orientado a tareas de ingeniería de software.
- Visión: la pipeline declarada es image-text-to-text, con entrenamiento de fusión temprana en tokens multimodales en el modelo base. No se confirma que este checkpoint conserve íntegro el rendimiento del codificador visual.
- Multilingüismo: la model card heredada indica 201 idiomas y dialectos, pero no hay confirmación de que el fine-tune mantenga ese nivel de cobertura.
- Contexto largo: 262.144 tokens nativos y hasta 1.010.000 tokens, adecuado para documentos extensos o repositorios completos.
- Tool calling / function calling: no disponible en la información del checkpoint. La model card del modelo base menciona herramientas integradas solo para la versión alojada Qwen3.5-Flash.
- Capacidades de agente y razonamiento multi-paso: el modelo base fue entrenado con RL sobre entornos multiagente, pero no hay evaluación específica de este checkpoint.
- Modo «thinking» explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre RLVR: el checkpoint permite analizar la evolución de las capacidades del modelo en la iteración 74 de un pipeline de refuerzo, comparando sus salidas con las de iteraciones anteriores o posteriores para estudiar dinámicas de entrenamiento.
- Baseline en experimentos de ajuste: sirve como punto de referencia fijo al evaluar nuevas recetas de RL o de fine-tuning sobre la misma arquitectura, ya que su estado de pesos queda congelado.
- Análisis de repositorios de código extensos: con 262.144 tokens de contexto nativo, es posible introducir múltiples ficheros de un proyecto completo y pedir refactorizaciones, detección de dependencias o explicaciones de flujos de ejecución sin trocear el código.
- Agentes de ingeniería de software: dado el nombre del repositorio, puede emplearse como política de un agente que resuelva incidencias (lectura de trazas, edición de ficheros, ejecución de tests), siempre con validación humana por tratarse de un checkpoint intermedio.
- Procesamiento de documentos multimodales: la pipeline image-text-to-text permite extraer información estructurada de facturas, informes escaneados o capturas de interfaz, combinando texto e imagen en una misma ventana.
- Generación asistida multilingüe: si se conserva el soporte del modelo base, podría emplearse para redacción y traducción en un gran número de idiomas, con revisión humana en idiomas de bajos recursos.
- Evaluación comparativa de arquitecturas híbridas: útil para medir el coste y la calidad de la combinación Gated DeltaNet + MoE frente a transformers densos en cargas de trabajo reales.

## Benchmarks y rendimiento

La model card heredada incluye una tabla comparativa del modelo Qwen3.5-35B-A3B, pero el contenido disponible se corta tras la primera fila (MMLU-Pro). No se ha publicado ninguna evaluación específica del checkpoint rlvr-seed-baseline-iter74.

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro (conocimiento) | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | No disponible: el valor aparece truncado en la información recuperada (comienza por «86,0») |

El resto de categorías de la tabla (razonamiento, código, agentes, visión) no está disponible porque el contenido extraído de la model card finaliza en ese punto. Estos datos corresponden al modelo base Qwen3.5-35B-A3B, no al checkpoint derivado, y por tanto no deben atribuirse a rlvr-seed-baseline-iter74.

## Requisitos de hardware

- VRAM estimada (según recuento de safetensors, ~68,2 B de parámetros): en BF16/bfloat16 serían necesarios aproximadamente 137 GB solo para los pesos, más la caché KV. El repositorio ocupa 136,3 GB.
- VRAM estimada (según la cifra de 35 B declarada en la model card): unos 70 GB en BF16, unos 35 GB en FP8 y unos 18 GB en cuantización de 4 bits.
- GPU recomendadas: para la interpretación de 68,2 B en BF16, dos H100 de 80 GB o dos A100 de 80 GB como mínimo. Para la interpretación de 35 B en BF16, una única H100 o A100 de 80 GB sería suficiente.
- Cabe en GPU de consumo: con 68,2 B de parámetros, no cabe en una RTX 4090 (24 GB) ni siquiera en 4 bits; con 35 B, una cuantización de 4 bits (~18 GB) podría ajustarse en una RTX 4090, pero requeriría soporte de cuantización específico para esta arquitectura híbrida, que no está publicado.
- Opciones de despliegue: la model card del modelo base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No hay confirmación de soporte en llama.cpp, Ollama o TGI para esta arquitectura concreta, ni de que el checkpoint haya sido probado en ellos.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3 B de parámetros activos, el rendimiento estará limitado por el ancho de banda de memoria necesario para mantener los ~35-68 B de parámetros residentes, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | MMLU-Pro |
|---|---|---|---|---|---|
| rlvr-seed-baseline-iter74 | 68,2 B (metadatos) / 35 B (model card) | 262.144 tokens nativos | apache-2.0 | Pesos abiertos en HuggingFace, 0 descargas | No disponible para este checkpoint |
| Qwen3.5-35B-A3B (modelo base) | 35 B totales, 3 B activos | 262.144 tokens nativos | apache-2.0 | Pesos abiertos y API gestionada | Valor truncado en la información recuperada |
| Qwen3.5-122B-A10B | 122 B (activos no confirmados) | No disponible | No disponible | Pesos abiertos | 86,7 |
| Qwen3.5-27B | 27 B densos | No disponible | No disponible | Pesos abiertos | 86,1 |
| Qwen3-235B-A22B | 235 B totales, 22 B activos | No disponible | No disponible | Pesos abiertos | 84,4 |
| GPT-OSS-120B | 120 B | No disponible | No disponible | Pesos abiertos | 80,8 |

La comparación se limita a los datos presentes en la model card heredada. No hay información sobre contexto, licencia ni disponibilidad del checkpoint derivado más allá de lo indicado, ni evaluaciones propias que permitan situarlo frente a los modelos de la tabla.

## Limitaciones y advertencias

- Checkpoint intermedio: el nombre «iter74» y el sufijo «seed-baseline» sugieren un estado parcial de un proceso de RL. No hay garantía de que la alineación, el formato de salida o la robustez ante instrucciones estén pulidos.
- Ausencia de model card propia: el README es una copia de la de Qwen3.5-35B-A3B, incluida la imagen de marca y los enlaces a servicios de Alibaba Cloud. Cualquier característica descrita allí puede no aplicar a este fine-tune.
- Discrepancia en el recuento de parámetros: 35 B declarados frente a 68.164.077.424 parámetros en los metadatos de safetensors y 136,3 GB de repositorio. Es imprescindible verificar el tamaño antes de planificar hardware.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha publicado ninguna evaluación de fidelidad ni de tasas de error para este checkpoint.
- Sesgos: no se ha realizado ninguna auditoría de sesgos ni de seguridad sobre este fine-tune. Se desconoce la composición del dataset de RL empleado, lo que impide evaluar sesgos de dominio.
- Idiomas: no declarados para el checkpoint. Aunque el modelo base cubre 201 idiomas, un ajuste con RL sobre tareas muy específicas puede degradar el rendimiento en idiomas no presentes en el entrenamiento.
- Contexto: los 262.144 tokens nativos son la cifra del modelo base; no hay verificación de que el fine-tune mantenga la calidad en ventanas largas.
- Licencia: se declara apache-2.0, pero el enlace de licencia apunta al repositorio de Qwen. Conviene revisar los términos del modelo base antes de un uso comercial, especialmente si se redistribuye.
- Ausencia de validación comunitaria: cero descargas y cero «likes» en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento.
- Formato de pesos: al no existir versiones cuantizadas ni GGUF, su despliegue en infraestructura modesta requiere exportar y validar uno mismo la cuantización, con soporte incierto para la arquitectura híbrida.
- Fecha de publicación: los metadatos indican creación el 16 de septiembre de 2026, dato que conviene contrastar con el repositorio en el momento de la consulta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sweagent/rlvr-seed-baseline-iter74
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Modelo postentrenado de referencia (Qwen3.5-35B-A3B): https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia enlazada desde la model card: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio (servicio gestionado, incluida Qwen3.5-Flash): https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
- Búsqueda web: no se ha recuperado ningún resultado relevante sobre este modelo; los resultados devueltos corresponden a sitios sin relación con la ficha (Zhihu, 作业帮), por lo que no se incluyen como fuentes.
