# vcruz305/GLM-5.3-Flash-EXL3-K2

## Resumen

GLM-5.3-Flash EXL3 K2 es un pack de pesos cuantizados creado por la comunidad (usuario vcruz305) a partir del modelo base zai-org/GLM-5.3-Flash-BF16, desarrollado por Zhipu AI (Z.AI). Este pack aplica cuantización EXL3 de 2 bits con codebook MCG (trellis) exclusivamente sobre los expertos enrutados del modelo MoE, manteniendo la atención, los embeddings, la cabeza y el módulo de visión en BF16 nativo. El resultado es un archivo de 91 GiB que permite ejecutar el modelo en hardware de consumo como una NVIDIA DGX Spark (GB10), algo inviable con los pesos originales en BF16.

El modelo base, GLM-5.3-Flash, es el primer modelo nativamente multimodal de la serie GLM-5, con 320B parámetros totales y 18B activos. Según la documentación de Cloudflare, supera a GLM-5.2 en benchmarks y cargas de trabajo reales a una décima parte del precio, acercándose a Claude Opus 4.8 en tareas de codificación y agénticas. Este pack cuantizado hereda esas capacidades con un requisito de memoria drásticamente reducido, aunque requiere un build específico de vLLM con soporte para la arquitectura `Glm5Next` y el método de cuantización EXL3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (MoE, multimodal) |
| Parametros totales | 320B (modelo base); 48.854.461.566 almacenados en safetensors (cuantizados) |
| Parametros activos | 18B |
| Longitud de contexto | Hasta 131.072 tokens asignados; recomendado 65.536 |
| Tipos de cuantizacion | EXL3 2-bit MCG trellis (solo expertos MoE enrutados) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (120 shards, 91,017 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE multimodal con 320B parámetros totales y 18B activos, diseñado por Zhipu AI. La arquitectura `Glm5NextForConditionalGeneration` integra un codificador de visión para entrada de imágenes y vídeo, además de un mecanismo de predicción multi-token (MTP) nativo que acelera la decodificación. El pack EXL3 K2 cuantiza únicamente las proyecciones `gate_proj`, `up_proj` y `down_proj` de los 37.152 expertos enrutados, aplicando un codebook MCG de 2 bits con cuantización trellis. El resto de tensores (atención, shared experts, embeddings, head y visión) permanecen en BF16 de la fuente original.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La model card del pack solo indica que los pesos son de Z.AI con licencia MIT y que la cuantización fue validada con 120/120 shards verificados antes de la subida al Hub.

## Capacidades

- Generación de texto conversacional y de razonamiento en inglés y chino.
- Soporte de tool calling mediante el parser `glm47` y `--enable-auto-tool-choice`.
- Razonamiento con modo thinking, activado con el parser `glm45`.
- Entrada multimodal: hasta 4 imágenes y 1 vídeo por prompt (según flags de vLLM).
- Decodificación especulativa nativa con MTP k=2, que alcanza 15,7-16,5 tok/s en GB10 a 8k de contexto.
- Capacidad de procesar contextos largos de hasta 65.536 tokens recomendados (131.072 asignables con riesgo de fallos).
- Compatible con el runtime vLLM mediante un build específico con soporte EXL3.

## Casos de uso

- Despliegue en hardware de consumo: gracias a la cuantización 2-bit de los expertos, el modelo cabe en una NVIDIA DGX Spark (GB10) con ~121 GiB de memoria unificada, permitiendo ejecutar un modelo de 320B en un dispositivo de sobremesa.
- Agentes autónomos con tool calling: el soporte nativo para herramientas y el reasoning parser permiten construir agentes que llaman funciones externas y razonan en múltiples pasos, con un throughput de 14-16 tok/s.
- Asistente de codificación en entornos con recursos limitados: con un rendimiento de 90 en la categoría de código del benchmark sixcat, puede usarse para generación y revisión de código en un entorno local sin depender de APIs externas.
- Procesamiento de documentos largos: la ventana de contexto de 65.536 tokens recomendada permite analizar informes extensos, contratos o artículos técnicos en inglés o chino.
- Chat bilingüe inglés-chino: el modelo mantiene capacidades conversacionales en ambos idiomas, útil para aplicaciones de atención al cliente o traducción asistida.
- Investigación en eficiencia de cuantización: el pack sirve como referencia para estudiar el impacto de la cuantización 2-bit MCG trellis en modelos MoE de gran escala, con una degradación de calidad aparentemente moderada (overall 84,2 en sixcat).

## Benchmarks y rendimiento

El autor proporciona resultados del benchmark sixcat 0.5.1 (think-on, vendor `glm-5.x`, 20 categorías, host-guarded HumanEval, servicio a 64k de contexto):

| Categoria | Puntuacion |
|---|---|
| Conocimiento | 65 |
| Matematicas | 100 |
| Verdad | 85 |
| Instruccion | 75 |
| Codigo | 90 |
| Herramientas | 90 |
| Overall | 84,2 (con `trunc-in-think:instruct`, no limpio) |

También se midió el rendimiento de inferencia en una NVIDIA DGX Spark (GB10, TP=1) con vLLM y cuantización EXL3, usando MTP k=2:

| Configuracion | Decode tok/s |
|---|---|
| 8k contexto, MTP k=2 | 15,7-16,5 |
| 64k contexto, MTP k=2 | 14,6-15,7 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Probado en una NVIDIA DGX Spark (GB10, SM121, ~121 GiB memoria unificada) con TP=1 y vLLM. El pack ocupa 91 GiB en disco y requiere un build específico de vLLM con soporte EXL3 y `Glm5Next`.
- También se ha validado en una configuración de 4× NVIDIA L40 (TP=4) para texto, aunque no se detallan métricas de rendimiento.
- No cabe en GPUs de consumo de 24 GB (como RTX 4090) sin particionado o técnicas adicionales; el mínimo viable documentado es el GB10 con memoria unificada.
- Opciones de despliegue: vLLM con el build personalizado del repo `spark-vllm`, o ExLlamaV3 como motor de inferencia. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Se requiere el flag `EXL3_FUSED_MOE=1` y `--quantization exl3` al arrancar vLLM. No usar `--moe-backend marlin`.
- Para contexto de 64k se recomienda `--max-model-len 65536` y `--gpu-memory-utilization 0.91`; a 131k el motor asigna KV pero falla con prompts de ~98k tokens.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-BF16 (base) | 320B totales, 18B activos | Hasta 1M (según OpenLM.ai) | BF16 | MIT | Requiere hardware de datacenter |
| GLM-5.3-Flash EXL3 K2 (este pack) | 48,85B almacenados | 65k recomendado | EXL3 2-bit | MIT | Ejecutable en GB10 |
| GLM-5.2 (sin cuantizar) | No disponible | No disponible | BF16 | MIT | Superado por GLM-5.3-Flash según Cloudflare |

La comparativa con otros modelos de la misma categoría (MoE cuantizados) no está disponible en la documentación consultada.

## Limitaciones y advertencias

- Requiere un build específico de vLLM (no stock). `pip install vllm` no funciona y fallará después de descargar los 91 GiB. Es obligatorio usar las ruedas precompiladas del repo `spark-vllm`.
- La cuantización 2-bit de los expertos puede degradar la calidad en tareas de conocimiento (65 en sixcat) y seguir patrones de instrucción (75), con riesgo de alucinaciones aumentado respecto al modelo BF16.
- El contexto recomendado es 65.536 tokens; a 131.072 tokens el motor asigna KV pero falla con prompts de ~98k tokens, lo que puede tumbar el proceso.
- El benchmark sixcat muestra un problema de "trunc-in-think" en la categoría de instrucción, lo que indica que el modo thinking puede truncarse incorrectamente en algunos casos.
- Solo soporta inglés y chino; no hay evidencia de capacidades en otros idiomas.
- Licencia MIT permite uso comercial, pero los pesos provienen de Z.AI y el pack es un trabajo derivado de la comunidad; verificar términos adicionales en el repositorio original.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este pack cuantizado, por lo que la calidad real puede variar respecto al modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-K2)
- [Build de vLLM + ExLlamaV3 para GB10](https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-K2-spark-vllm)
- [Receta de instalación y despliegue en GitHub](https://github.com/vcruz305/GLM-5.3-Flash-EXL3-K2-DGX-Spark-recipe)
- [Documentación de GLM-5.3-Flash en Cloudflare](https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/)
- [Información general de GLM-5.3 en OpenLM.ai](https://openlm.ai/glm-5.5/)
