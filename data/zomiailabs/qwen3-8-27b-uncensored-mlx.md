# zomiailabs/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una versión "abliterada" (con la dirección de rechazo eliminada del flujo residual) del modelo Qwen3.8-27B de Alibaba, convertida al formato MLX para ejecución eficiente en Apple Silicon. El modelo base es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), nativo multimodal (visión y lenguaje), con control de pensamiento, tool calling y cabeza de predicción multi-token (MTP). Esta versión ha sido cuantizada en cuatro precisiones (2, 4, 6 y 8 bits) manteniendo la torre de visión, las normas y las capas convolucionales en BF16.

El proyecto lo publica zomiailabs, vinculado a la plataforma OrcaRouter, con el objetivo declarado de facilitar la investigación en seguridad de IA, interpretabilidad y red-teaming. La relevancia actual radica en que ofrece un modelo de 27B con capacidades avanzadas (visión, razonamiento, herramientas) pero sin las barreras de seguridad habituales, lo que permite estudiar los mecanismos de rechazo y evaluar robustez en entornos controlados. La licencia Apache 2.0 y el formato MLX lo hacen accesible para equipos con hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet lineal + atención completa, con torre de visión (vision-language) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | 2-bit, 4-bit, 6-bit, 8-bit (afín, grupo de tamaño 64); capas de visión y normas en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), con subcarpetas por precisión: 2-bit, 4-bit, 6-bit, 8-bit |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa, lo que reduce el coste computacional en contextos largos manteniendo la calidad. Es nativamente multimodal: incluye una torre de visión que procesa imágenes y las integra con el texto. Dispone de un modo de pensamiento controlable (thinking mode), soporte de tool calling y una cabeza de predicción multi-token (MTP) que mejora la eficiencia de decodificación.

La versión Uncensored-MLX se obtiene mediante una técnica de abliteración que ortogonaliza la dirección de rechazo del flujo residual, eliminando de forma efectiva las respuestas de negativa ante peticiones dañinas. El proceso de cuantización a MLX se realizó a partir de una fuente BF16 abliterada, verificando numéricamente los pesos dequantizados y probando la generación en GPU. Los detalles exactos del dataset de entrenamiento, el número de tokens y el proceso de alineación (RLHF/DPO) del modelo base no se especifican en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso con control de pensamiento (thinking mode).
- Comprensión de imágenes (visión-lenguaje): puede describir, analizar y responder sobre contenido visual.
- Tool calling / function calling: integración con herramientas externas para tareas agénticas.
- Soporte de agentes y razonamiento multi-step gracias al contexto largo de 262K tokens.
- Multilingüe limitado a inglés y chino.
- Decodificación eficiente con cabeza MTP (multi-token prediction).
- Sin mecanismos de rechazo: responde a peticiones que el modelo original rechazaría, incluido contenido dañino o ilegal.

## Casos de uso

- Investigación en interpretabilidad de modelos: estudiar cómo la abliteración afecta a la representación interna de la seguridad y qué direcciones del flujo residual codifican el rechazo.
- Red-teaming y evaluación de robustez: probar jailbreaks, ataques adversarios y medir la eficacia de guardarraíles en un modelo sin alineación, comparando con el modelo base.
- Desarrollo de capas de moderación: usar este modelo como caso extremo para entrenar y validar sistemas de filtrado de contenido antes de desplegarlos en producción.
- Evaluación de riesgos en modelos multimodales: analizar cómo la ausencia de rechazo se extiende a la comprensión de imágenes y a tareas agénticas con tool calling.
- Estudio de cuantización y degradación: comparar la calidad de generación entre las versiones de 4, 6 y 8 bits, y documentar los fallos de la versión de 2 bits, para guiar decisiones de despliegue en hardware limitado.
- Experimentos académicos controlados sobre sesgos y alucinaciones: dado que el modelo produce afirmaciones falsas con autoridad, puede usarse para caracterizar patrones de confabulación en ausencia de restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo indica verificación numérica de los pesos cuantizados y pruebas de generación en GPU, sin métricas cuantitativas. No se dispone de datos comparativos con el modelo base ni con otras alternativas.

## Requisitos de hardware

- Formato MLX diseñado para Apple Silicon (M-series). No es compatible directamente con CUDA.
- Tamaños de archivo y RAM mínima según la tabla de la model card:
  - 8-bit: ~27,5 GB, mínimo 32 GB de RAM unificada.
  - 6-bit: ~22 GB, mínimo 24-32 GB de RAM.
  - 4-bit: ~15 GB, mínimo 24 GB de RAM.
  - 2-bit: ~8,7 GB, mínimo 16 GB de RAM (calidad severamente degradada, solo archivo).
- GPU recomendadas: Apple M1 Pro/Max/Ultra o M2/M3/M4 con al menos 24 GB de RAM unificada para la versión de 4 bits.
- Opciones de despliegue: MLX (librería nativa de Apple), también se puede ejecutar la versión BF16 original con vLLM según el blog de MindStudio, aunque la versión MLX es específica de Apple.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache 2.0 | BF16, GGUF, etc. | No |
| Qwen3.8-27B-Uncensored-MLX | 27B | 262K | Sí | Apache 2.0 | MLX (2/4/6/8-bit) | Sí |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27B | 262K | Sí | Apache 2.0 | BF16 | Sí |

No se dispone de benchmarks comparativos entre estas versiones. La principal diferencia entre las dos versiones abliteradas es el formato (MLX vs BF16) y la metodología de abliteración (la versión AEON emplea un enfoque con KL-drift y pruebas con juez, según el blog de MindStudio). El modelo base conserva sus guardarraíles, mientras que las versiones abliteradas los han eliminado.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo cumple con peticiones dañinas, ilegales o poco éticas. No debe desplegarse en producción sin una capa de moderación externa.
- Riesgo elevado de alucinaciones y afirmaciones falsas presentadas con autoridad, especialmente en las cuantizaciones más bajas.
- La versión de 2 bits produce salidas degradadas (bucles de repetición, texto incoherente) y solo se incluye como archivo de compresión extrema.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad por uso indebido. El usuario debe asumir la responsabilidad legal y ética.
- El contexto largo de 262K amplía la superficie de ataque: los riesgos se extienden a la comprensión de imágenes y a tareas agénticas.
- No hay garantías de estabilidad en producción: la falta de alineación puede generar respuestas impredecibles incluso en consultas benignas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zomiailabs/Qwen3.8-27B-Uncensored-MLX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Repositorio de AlibabaCloud-Official para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de MindStudio sobre la abliteración AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Web de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Model card de OrcaRouter para este modelo: https://www.orcarouter.ai/models/obsidian/qwen3.8-27b
