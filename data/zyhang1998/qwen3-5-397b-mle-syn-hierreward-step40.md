# zyhang1998/qwen3.5-397b-mle-syn-hierreward-step40

## Resumen

zyhang1998/qwen3.5-397b-mle-syn-hierreward-step40 es un checkpoint de pesos completos publicado por el usuario zyhang1998, derivado de Qwen3.5-397B-A17B, el modelo fundacional multimodal de tipo MoE híbrido desarrollado por el equipo Qwen de Alibaba. No es un modelo entrenado desde cero: el nombre del repositorio apunta a un paso 40 de un proceso de ajuste con refuerzo (etiquetado como "hierarchical reward" sobre datos sintéticos), si bien no existe documentación en el repositorio que confirme el procedimiento, el dataset ni la configuración de entrenamiento. Los safetensors suman 403.397.928.944 parámetros y el repositorio ocupa 806,8 GB, coherente con pesos en bf16.

La relevancia de este checkpoint es doble. Por un lado, permite acceder a los pesos completos de un modelo de frontera de 397B/17B activos bajo licencia Apache 2.0, algo poco habitual en esta categoría de tamaño. Por otro, al tratarse de una publicación comunitaria sin descargas ni validación externa, sirve como caso de estudio de los riesgos de distribuir checkpoints intermedios de RL sin evaluación publicada.

La arquitectura subyacente combina atención lineal (Gated DeltaNet) con atención con compuertas y mezcla de expertos dispersa, un codificador de visión y predicción multi-token (MTP). La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, y la model card de la base declara soporte para 201 idiomas y dialectos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida de Gated DeltaNet (atención lineal) + Gated Attention con MoE disperso (qwen3_5_moe) |
| Parametros totales | 403.397.928.944 según safetensors; la model card de la base declara 397B |
| Parametros activos | 17B por token (10 expertos enrutados + 1 compartido, de un total de 512 expertos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (806,8 GB, compatible con bf16). No se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | 201 idiomas y dialectos según la model card de Qwen3.5-397B-A17B; este repositorio no declara lista propia |
| Licencia | apache-2.0 (con enlace a la licencia de Qwen/Qwen3.5-397B-A17B) |
| Formato de pesos | safetensors (librería transformers) |
| Dimension oculta | 4096 |
| Capas | 60, con disposición 15 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Vocabulario / embeddings | 248.320 tokens (con padding) |
| Cabezas de atencion | Gated DeltaNet: 64 cabezas lineales para V, 16 para QK, dimensión 128. Gated Attention: 32 cabezas Q, 2 cabezas KV (GQA), dimensión 256, RoPE de 64 dimensiones |
| Expertos | 512 en total, dimensión intermedia de experto 1024 |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 806,8 GB |
| Fecha de publicacion | 2026-09-20 (actualizado el 2026-09-21) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con codificador de visión y una columna vertebral híbrida de 60 capas. El bloque se repite 15 veces con la disposición 3 × (Gated DeltaNet → MoE) seguida de 1 × (Gated Attention → MoE). Las capas de Gated DeltaNet emplean atención lineal con 64 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que las capas de Gated Attention usan 32 cabezas de consulta y solo 2 de clave/valor (GQA) con dimensión 256 y RoPE de 64 dimensiones. La mezcla de expertos contiene 512 expertos de dimensión intermedia 1024, de los que se activan 10 enrutados más 1 compartido, lo que da 17B de parámetros activos sobre 397B totales. El modelo incorpora embeddings de 248.320 tokens y se entrenó con predicción multi-token (MTP) en varios pasos.

El entrenamiento del modelo base, según su model card, combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales (paridad entre entrenamiento multimodal y solo texto cercana al 100% de eficiencia), junto con un escalado de RL sobre entornos multimillonarios en número de agentes y marcos de RL asíncronos. El checkpoint aquí descrito parte de esos pesos: por el nombre del repositorio ("mle-syn-hierreward-step40") parece tratarse del paso 40 de un ajuste con refuerzo sobre datos sintéticos con recompensa jerárquica, pero no se publica ni el dataset, ni el algoritmo, ni las métricas de entrenamiento. No hay evidencia documentada de que se hayan aplicado DPO o RLHF adicionales más allá de lo indicado en el nombre del repositorio, por lo que ese punto debe considerarse no confirmado.

## Capacidades

- Generación de texto y razonamiento multilingüe en 201 idiomas y dialectos según la model card de la base.
- Procesamiento multimodal de entrada: pipeline image-text-to-text, con codificador de visión integrado en el modelo causal; permite razonar sobre imágenes, capturas, diagramas y documentos escaneados.
- Razonamiento, código y matemáticas: la model card de la base sitúa a Qwen3.5-397B-A17B con paridad o por encima de Qwen3 y Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Soporte de agentes y razonamiento multi-paso: el postentrenamiento incluye RL sobre entornos con múltiples agentes; la variante alojada Qwen3.5-Plus añade herramientas integradas y uso adaptativo de herramientas, capacidades que no están garantizadas en este checkpoint.
- Uso de herramientas y function calling: los artefactos son compatibles con vLLM, SGLang, KTransformers y Transformers, que soportan plantillas de tool calling; no se documenta una plantilla específica en este repositorio.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.010.000, adecuada para documentos largos y repositorios completos.
- Predicción multi-token (MTP): permite decodificación especulativa interna con varios tokens por paso, orientada a reducir latencia.
- Modo de razonamiento extenso: los modelos de la familia incluyen variantes de tipo "thinking" (Qwen3-Max-Thinking aparece en la comparativa de la model card), pero no se confirma que este checkpoint conserve un modo de pensamiento conmutable.

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens de contexto nativo, el modelo puede ingerir repositorios completos, normativa o manuales de varios cientos de páginas en una sola pasada y responder preguntas que requieran relacionar secciones alejadas del documento.
- Atención al cliente multilingüe: la cobertura declarada de 201 idiomas permite desplegar un único modelo para mercados con idiomas mixtos, manteniendo coherencia terminológica si se fija un glosario en el prompt de sistema.
- Agentes autónomos con uso de herramientas: al ser compatible con vLLM y SGLang, se puede exponer como endpoint con function calling y encadenar llamadas a APIs internas, bases de datos o buscadores en flujos de varios pasos.
- Revisión de código en CI/CD: el modelo puede analizar diffs y ejecutar tareas de revisión estática generando explicaciones; su ventana larga permite pasar el contexto completo de un módulo junto con las guías de estilo del proyecto.
- Procesamiento de documentos con componente visual: facturas, albaranes, planos, informes con tablas y capturas de paneles se pueden enviar directamente como imagen-texto sin un pipeline OCR separado, reduciendo la pérdida de información de estructura.
- Generación de datos sintéticos y anotación asistida: dado su tamaño, puede utilizarse como anotador o generador de pares instrucción-respuesta para destilar modelos menores, siempre que se valide la calidad de la salida.
- Investigación y asistencia científica: razonamiento sobre artículos con figuras y ecuaciones, resumen de literatura y planteamiento de hipótesis sobre corpus largos, aprovechando la combinación de visión y contexto extendido.
- Extracción estructurada a escala: conversión de contratos o informes heterogéneos a JSON validado, con soporte de esquemas largos en el prompt gracias a la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto (zyhang1998/qwen3.5-397b-mle-syn-hierreward-step40). La información proporcionada incluye la tabla de benchmarks del modelo base, Qwen3.5-397B-A17B, aunque el contenido recuperado se truncó en la primera fila (MMLU-Pro) y el valor correspondiente a Qwen3.5-397B-A17B no está disponible. Los datos legibles son los siguientes:

| Benchmark | GPT5.2 | Claude 4.5 Opus | Gemini-3 Pro | Qwen3-Max-Thinking | K2.5-1T-A32B | Qwen3.5-397B-A17B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 87,4 | 89,5 | 89,8 | 85,7 | 87,1 | no disponible (tabla truncada) |

El resto de categorías anunciadas en la model card (conocimiento, razonamiento, código, agentes, comprensión visual y multimodal) aparece en la imagen de resultados enlazada desde el repositorio, pero sus cifras no están disponibles en la información proporcionada. No se deben extrapolar los resultados del modelo base al checkpoint ajustado: un paso 40 de un proceso de RL puede presentar desviaciones en ambos sentidos.

## Requisitos de hardware

- VRAM para pesos en bf16: aproximadamente 807 GB (403,4B parámetros × 2 bytes), lo que exige al menos 11 GPU de 80 GB solo para los pesos, más espacio para caché KV y activaciones.
- VRAM para pesos en FP8: aproximadamente 403 GB; viable en 8 × H100 80 GB (640 GB) o 6 × H200 141 GB, dejando margen para la caché.
- VRAM para pesos en 4 bits: aproximadamente 202 GB; requeriría 4 × H100 80 GB o 3 × H200 141 GB. El repositorio no publica cuantizaciones, por lo que habría que generarlas y validar la degradación.
- Caché KV estimada: solo las 15 capas de Gated Attention mantienen caché (GQA con 2 cabezas KV de dimensión 256), lo que da unos 30.720 bytes por token en fp16 (15 capas × 2 × 2 cabezas × 256 × 2 bytes). Con 262.144 tokens equivale a aproximadamente 8,05 GB (7,5 GiB), una cifra muy contenida frente a modelos densos equivalentes. Cálculo derivado de las especificaciones declaradas, no un dato publicado.
- GPU de consumo: no cabe. Ni siquiera en 4 bits cabe en una RTX 4090 (24 GB) ni en configuraciones domésticas razonables; la descarga por sí sola es de 806,8 GB.
- Tarjetas recomendadas: H200 141 GB o B200 para despliegues en FP8; clústeres de 8 a 16 × H100/H200 para bf16.
- Opciones de despliegue: los artefactos son compatibles con Transformers, vLLM, SGLang y KTransformers, según la model card. Ollama y llama.cpp no son viables en la práctica a este tamaño y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. Con 17B de parámetros activos por token, la inferencia es intensiva en memoria y favorable en cómputo por token, pero no se publican cifras de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: se necesitan al menos 807 GB de disco para los safetensors, más el espacio temporal de descarga.

## Comparativa con modelos similares

Comparativa de la categoría, según los datos recogidos en la model card del modelo base. Los datos de parámetros de los modelos propietarios no están disponibles.

| Modelo | Parametros (total / activos) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (qwen3.5-397b-mle-syn-hierreward-step40) | 403,4B safetensors / 17B activos | 262.144 tokens nativos (heredado de la base) | apache-2.0 | Pesos abiertos en HuggingFace, sin validación ni benchmarks publicados |
| Qwen3.5-397B-A17B (base) | 397B / 17B | 262.144 tokens nativos, hasta 1.010.000 | apache-2.0 | Pesos abiertos, con API gestionada equivalente (Qwen3.5-Plus) en Alibaba Cloud Model Studio |
| K2.5-1T-A32B | 1T / 32B (según la tabla de benchmarks) | no disponible | no disponible | no disponible en la información proporcionada |
| Qwen3-Max-Thinking | no disponible | no disponible | propietaria | API gestionada de Alibaba; MMLU-Pro 85,7 |
| GPT5.2, Claude 4.5 Opus, Gemini-3 Pro | no disponible | no disponible | propietaria | Solo API; MMLU-Pro 87,4 / 89,5 / 89,8 respectivamente |

En términos de arquitectura, la comparación más directa es con otros MoE dispersos de gran tamaño: este modelo activa 17B de 397B (4,3% de los parámetros), frente a los 32B activos de 1T del K2.5, lo que lo sitúa en un régimen de activación claramente más bajo y, en teoría, más económico por token generado.

## Limitaciones y advertencias

- Checkpoint sin validación: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks, sin evaluación de terceros y sin documentación del proceso de ajuste. No debe tratarse como equivalente al modelo base.
- Procedencia del ajuste no verificable: el nombre sugiere un paso 40 de RL con recompensa jerárquica sobre datos sintéticos, pero no se publica dataset, receta, hiperparámetros ni métricas. Un checkpoint intermedio de RL puede presentar inestabilidad, repeticiones, degradación del formato de salida o pérdida de capacidades respecto a la base.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia, especialmente en tareas de conocimiento factual, citación de fuentes y cálculo numérico sin verificación externa.
- Idiomas: aunque la base declara 201 idiomas y dialectos, este repositorio no especifica ninguna lista y el ajuste podría haber alterado el equilibrio entre idiomas.
- Contexto extendido: la extensión hasta 1.010.000 tokens en la base no está confirmada en este checkpoint, y en general el rendimiento de recuperación se degrada en las posiciones más alejadas de la ventana.
- Licencia: se declara apache-2.0 con enlace a la licencia de Qwen/Qwen3.5-397B-A17B. Conviene revisar el texto exacto de esa licencia antes de un uso comercial, y tener en cuenta que el autor del checkpoint puede no ser el titular de los derechos de los pesos base.
- Restricciones prácticas de despliegue: 806,8 GB de descarga y más de 200 GB de VRAM incluso en 4 bits hacen inviable su uso fuera de infraestructura de centro de datos.
- Sin cuantizaciones oficiales: no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas por el autor, lo que traslada al usuario el coste y el riesgo de cuantizar.
- Comportamiento de seguridad: el ajuste con RL puede modificar las políticas de rechazo del modelo base; no hay evaluación de alineación ni de seguridad publicada para este checkpoint.
- Trazabilidad temporal: las fechas del repositorio (septiembre de 2026) son posteriores a la publicación del modelo base; no se documenta qué revisión exacta de los pesos se utilizó como punto de partida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zyhang1998/qwen3.5-397b-mle-syn-hierreward-step40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio (inferencia gestionada, Qwen3.5-Plus): https://modelstudio.alibabacloud.com/
- Guía de usuario de la API: https://www.alibabacloud.com/help/en/model-studio/text-generation
- Imagen de resultados de benchmarks del modelo base: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.5/Figures/qwen3.5_397b_a17b_score.png
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con Qwen3.5; los enlaces anteriores proceden íntegramente de la model card del repositorio.
