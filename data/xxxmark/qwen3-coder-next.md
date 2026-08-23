# XXXMARK/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de pesos abiertos desarrollado por el equipo Qwen de Alibaba, presentado en febrero de 2026 y especializado en agentes de codificación y desarrollo local. Su característica principal es una arquitectura de mezcla de expertos (MoE) con 80 mil millones de parámetros totales pero solo 3 mil millones activos por token, lo que permite un rendimiento comparable a modelos con 10-20 veces más parámetros activos a un coste de inferencia mucho menor. El modelo incorpora una ventana de contexto nativa de 262.144 tokens y capacidades agénticas avanzadas, incluyendo razonamiento de largo plazo, uso complejo de herramientas y recuperación de errores de ejecución.

La arquitectura es híbrida: combina capas de atención con gating (Gated Attention) y capas de Gated DeltaNet (atención lineal) intercaladas con bloques MoE, en una configuración de 48 capas. Se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace, con soporte de despliegue en sglang, vLLM, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers. El modelo solo soporta modo sin pensamiento (non-thinking) y no genera bloques de razonamiento explícito en su salida.

La relevancia de este modelo radica en ofrecer una alternativa de código abierto eficiente para agentes de codificación en producción, con integración directa en IDEs y plataformas como Claude Code, Qwen Code, Qoder, Kilo, Trae y Cline, y un coste de inferencia significativamente menor que el de modelos densos de tamaño comparable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated Attention y Gated DeltaNet |
| Parametros totales | 79.674.394.296 (~80B) |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF (vía llama.cpp/Ollama), MLX (vía MLX-LM); otros no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-Coder-Next usa una arquitectura causal de 48 capas con un diseño híbrido que combina tres bloques de Gated DeltaNet seguidos de un bloque de Gated Attention, con capas MoE intercaladas. La disposición exacta es 12 repeticiones de (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). La dimensión oculta es 2048. El Gated Attention utiliza 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El MoE tiene 512 expertos con 10 activos y 1 experto compartido, con dimensión intermedia de 512.

El entrenamiento incluye una fase de pretraining y otra de post-training. La fase de post-training se ha diseñado específicamente para reforzar las capacidades agénticas: razonamiento de largo plazo, uso complejo de herramientas y recuperación de errores de ejecución. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset. El modelo soporta exclusivamente el modo sin pensamiento, por lo que no es necesario especificar `enable_thinking=False` al generar.

## Capacidades

- Generación de código de alta calidad con rendimiento comparable a modelos con 10-20 veces más parámetros activos.
- Razonamiento de largo plazo (long-horizon reasoning) para tareas complejas de ingeniería de software.
- Uso complejo de herramientas (tool calling) con parser integrado `qwen3_coder` en sglang y vLLM.
- Recuperación de errores de ejecución (error recovery) en tareas de codificación dinámicas.
- Integración con múltiples plataformas CLI/IDE: Claude Code, Qwen Code, Qoder, Kilo, Trae y Cline.
- Ventana de contexto de 256K tokens nativos, adecuada para repositorios de gran tamaño.
- Despliegue mediante API compatible con OpenAI a través de sglang y vLLM.
- Compatible con despliegue local mediante llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- No genera bloques de pensamiento explícito; la salida es directa, lo que simplifica el parseo.

## Casos de uso

- Agente de codificación en IDE: se puede integrar en Claude Code, Cline o Trae para asistencia en edición de código con contexto de 256K tokens, lo que permite cargar repositorios completos en la ventana del modelo.
- Automatización de desarrollo: el modelo puede ejecutar pipelines de tareas, generar y corregir código y gestionar herramientas de prueba de forma autónoma gracias a su soporte de tool calling.
- Depuración y corrección de fallos: su capacidad de recuperación de errores permite iterar sobre ejecuciones fallidas, analizar logs y proponer soluciones sin intervención humana.
- Generación de documentación técnica: con su contexto amplio, puede analizar módulos completos y generar documentación coherente para proyectos grandes.
- Refactorización de código legacy: la ventana de 256K tokens permite analizar múltiples archivos interrelacionados y refactorizar sistemas completos sin perder el contexto global.
- Agentes de integración continua: se puede desplegar en pipelines de CI/CD para generar pruebas, corregir código y validar cambios automáticamente mediante API compatible con OpenAI.
- Asistente de desarrollo local en equipos de consumo: con cuantización GGUF y llama.cpp u Ollama, puede ejecutarse en GPU de gama media para desarrollo privado sin dependencia de servicios en la nube.
- Servidor de inferencia de bajo coste: con solo 3B parámetros activos, el coste de inferencia por token es significativamente menor que el de modelos densos de tamaño similar, ideal para entornos con muchas peticiones concurrentes.

## Benchmarks y rendimiento

La model card incluye referencias a imágenes de benchmarks (`benchmarks.png` y `swebench_pro.png`) y el informe técnico en arXiv contiene la evaluación completa, pero los números concretos no están disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso completo en bf16: ~160 GB de VRAM, requiere al menos 2 GPU de 80 GB (A100, H100) con tensor parallel 2.
- Con cuantización INT4: ~40 GB de VRAM, cabe en una GPU de 48 GB (A6000, L40S) o en dos GPU de 24 GB (RTX 4090).
- Con cuantización GGUF Q4_K_M: ~40 GB, ejecutable en GPU de consumo de 24 GB mediante llama.cpp u Ollama.
- El contexto completo de 256K tokens requiere memoria adicional significativa; la model card recomienda reducir a 32.768 tokens si se producen errores de memoria (OOM).
- Despliegue recomendado: sglang >= 0.5.8 o vLLM >= 0.15.0, ambos con tensor parallel 2.
- Opciones de despliegue local: Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-Next | 80B | 3B | 262K | Apache 2.0 | MoE híbrido con DeltaNet |
| Qwen3-Coder | no disponible | no disponible | no disponible | no disponible | Predecesor de la familia Coder |
| Claude (Sonnet) | no disponible | no disponible | no disponible | propietaria | Mencionado en comparativas de la comunidad |
| GPT (modelo comparable) | no disponible | no disponible | no disponible | propietaria | Mencionado en comparativas de la comunidad |

La guía de la comunidad publicada en dev.to (2026) incluye una comparativa de rendimiento entre Qwen3-Coder-Next, Claude y GPT, pero los datos numéricos concretos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta modo sin pensamiento (non-thinking), lo que puede limitar la calidad del razonamiento en tareas que se beneficien de una cadena de pensamiento explícita.
- Riesgo de errores de memoria (OOM) con el contexto completo de 256K tokens; se recomienda reducir la ventana a 32K en entornos con recursos limitados.
- Requiere al menos 2 GPU de 80 GB para despliegue en precisión completa (bf16), lo que excluye hardware de consumo para esta configuración.
- Los idiomas soportados no están especificados en la información disponible; se recomienda verificar la documentación oficial antes de desplegar en producción multilingüe.
- La versión de HuggingFace bajo el identificador XXXMARK es un espejo con 0 descargas; el modelo oficial es Qwen/Qwen3-Coder-Next.
- No se han publicado datos sobre sesgos ni riesgos de alucinación específicos en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la atribución y las condiciones de la licencia del modelo original antes de su integración en productos.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/XXXMARK/Qwen3-Coder-Next
- HuggingFace (original): https://huggingface.co/Qwen/Qwen3-Coder-Next
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3-coder-next
- GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentación oficial: https://qwen.readthedocs.io/en/latest/
- Informe técnico (arXiv): https://arxiv.org/html/2603.00729v1
- Guía de la comunidad (dev.to): https://dev.to/sienna/qwen3-coder-next-the-complete-2026-guide-to-running-powerful-ai-coding-agents-locally-1k95
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-coder-next
- Vast.ai: https://vast.ai/model/qwen3-coder-next
