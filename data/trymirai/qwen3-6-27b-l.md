# trymirai/Qwen3.6-27B-L

## Resumen

Mirai's Qwen3.6-27B Large Quantization (identificador `trymirai/Qwen3.6-27B-L`) es una cuantizacion sin perdidas (lossless) del modelo Qwen3.6-27B de Alibaba, preparada por Mirai Labs para inferencia local eficiente en Apple silicon. El modelo original es un modelo de lenguaje causal de 27.000 millones de parametros con codificador de vision, entrenado por Qwen Team y publicado bajo licencia Apache-2.0. La cuantizacion de Mirai utiliza enteros simetricos de 8 bits con escalas bfloat16 y tamano de grupo 64, junto con transformadas de Hadamard aleatorias por bloques para reducir outliers en activaciones y pesos.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo de 27B con capacidades de vision y codificacion agente en hardware local de Apple, con una degradacion minima respecto al modelo en precision completa. Segun los autores, la puntuacion MMLU-Pro se mantiene dentro de la banda de ruido estocastico del modelo BF16 original. El checkpoint esta disponible en formato safetensors y se sirve a traves de la libreria uzu y el CLI `mirai` (instalable via Homebrew). El modelo base soporta un contexto nativo de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model hibrido con Vision Encoder (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.322.365.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta ~1.010.000 tokens |
| Tipos de cuantizacion | 8-bit simetrico con escalas bfloat16, grupo de 64 (Mirai Large); comparable a UD-Q8_K_XL de Unsloth |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 soporta multiples idiomas, pero la ficha no los detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria uzu) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un modelo denso de 27B parametros con una arquitectura hibrida que combina atencion lineal y atencion estandar. La configuracion del modelo de lenguaje incluye 64 capas, dimension oculta de 5120, y un layout interno de 16 bloques donde cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de FFN y un sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension RoPE de 64. El FFN tiene dimension intermedia de 17408. El modelo incorpora MTP (Multi-Token Prediction) entrenado con multiples pasos.

En cuanto a la cuantizacion de Mirai, el proceso utiliza post-training quantization (PTQ) con cuantizacion simetrica de 8 bits y escalas bfloat16. La innovacion principal es el uso de Block-diagonal Random Hadamard Transforms para reducir outliers en activaciones y pesos, una tecnica que permite mantener la fidelidad del modelo con una degradacion minima. Segun la model card, no deberia haber diferencias discernibles respecto al modelo en precision completa. Los datos de entrenamiento del modelo base no estan detallados en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento complejo en multiples dominios, con mejoras especificas en STEM y razonamiento inferencial.
- Codificacion agente (agentic coding): maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio con mayor fluidez y precision.
- Vision-language: el modelo incluye un codificador de vision, con capacidades de comprension espacial, localizacion de objetos, deteccion, comprension de video, OCR de documentos y agente visual.
- Thinking Preservation: opcion para retener contexto de razonamiento de mensajes historicos, optimizando el desarrollo iterativo.
- Soporte de tool calling y function calling: no detallado explicitamente en la ficha, pero implicito en las capacidades agente del modelo base.
- Soporte de agentes y multi-step reasoning: el modelo base Qwen3.6 esta disenado para flujos agente y razonamiento en multiples pasos.
- Capacidades multilingues: no detalladas en la informacion proporcionada.

## Casos de uso

- Asistente de codificacion local en macOS: un desarrollador puede ejecutar `mirai --model trymirai/Qwen3.6-27B-L` en un Mac con Apple silicon para obtener asistencia de codificacion con contexto largo (hasta 262K tokens) sin depender de servicios en la nube. La cuantizacion de 8 bits permite que el modelo quepa en la memoria unificada de un Mac de gama alta.
- Desarrollo de frontend asistido por IA: gracias a las mejoras en agentic coding, el modelo puede manejar flujos de trabajo de frontend, generando y modificando componentes HTML/CSS/JS con comprension del contexto del repositorio.
- Analisis de documentos con OCR: el codificador de vision del modelo permite extraer y razonar sobre texto en imagenes y documentos escaneados, util para automatizar la digitalizacion de documentos en entornos locales.
- Prototipado rapido de agentes conversacionales: el soporte de contexto largo y razonamiento multi-paso permite construir agentes de atencion al cliente que mantienen el historial completo de la conversacion y pueden ejecutar acciones via tool calling.
- Investigacion academica en entornos con restricciones de datos: al ser un modelo abierto (Apache-2.0) que se ejecuta localmente, permite a investigadores procesar datos sensibles sin enviarlos a APIs externas.
- Educacion y formacion en IA: el modelo puede usarse como base para experimentos de fine-tuning o para ensenar conceptos de cuantizacion y despliegue local, dado que la cuantizacion de Mirai es reproducible y esta documentada.

## Benchmarks y rendimiento

La model card de Mirai indica que, bajo su configuracion de evaluacion, la puntuacion MMLU-Pro del modelo cuantizado se encuentra dentro de la banda de ruido estocastico del modelo BF16 de precision completa. No se proporcionan cifras exactas en la informacion disponible.

Los benchmarks del modelo base Qwen3.6-27B (segun la model card original y resultados de busqueda) incluyen:

| Benchmark | Qwen3.6-27B | Qwen3.5-27B | Qwen3.5-397B-A17B |
|---|---|---|---|
| SWE-bench Verified | 77.2% | no disponible | no disponible |
| MMLU-Pro | no disponible | no disponible | no disponible |
| Otros benchmarks | no disponible | no disponible | no disponible |

Nota: la tabla de benchmarks del modelo base se muestra incompleta en la informacion extraida; los datos disponibles indican que Qwen3.6-27B obtiene un 77.2% en SWE-bench Verified, superando al modelo flagship de 397B segun una fuente externa, aunque esta afirmacion no esta verificada en la model card original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente, pero el tamano del repositorio es de 27.8 GB, por lo que se necesita al menos esa cantidad de memoria disponible.
- GPU recomendadas: el modelo esta disenado para Apple silicon; no se proporcionan recomendaciones para GPU NVIDIA o AMD.
- Compatibilidad con consumer GPU: no disponible; la inferencia esta limitada actualmente a Apple silicon segun la model card.
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew con `brew install mirai`), o compilando desde fuente la libreria uzu (ver guia en GitHub).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B (original) | 27B | 262K (ext. 1M) | Apache-2.0 | safetensors (Transformers, vLLM, SGLang) | Modelo base en BF16, requiere ~54 GB en FP16 |
| trymirai/Qwen3.6-27B-L | 27B | 262K (ext. 1M) | Apache-2.0 | safetensors (uzu, 8-bit) | Cuantizacion lossless para Apple silicon |
| Unsloth Qwen3.6-27B-GGUF (UD-Q8_K_XL) | 27B | 262K (ext. 1M) | Apache-2.0 | GGUF | Cuantizacion comparable en tamano y calidad |

El modelo de Mirai es directamente comparable a la cuantizacion UD-Q8_K_XL de Unsloth, aunque con un formato de pesos diferente (safetensors con libreria uzu frente a GGUF). Ambos buscan mantener la fidelidad del modelo original reduciendo el tamano para inferencia local.

## Limitaciones y advertencias

- La inferencia esta actualmente limitada a Apple silicon; no es posible ejecutar el modelo en GPUs NVIDIA o AMD con este checkpoint especifico.
- La cuantizacion de 8 bits, aunque se describe como lossless, puede presentar diferencias minimas en tareas de alta precision numerica o en contextos muy largos.
- El modelo base Qwen3.6-27B es un modelo de vision-language; las capacidades de vision requieren el codificador incluido, pero no se detallan los formatos de imagen soportados.
- No se proporcionan datos sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los terminos del modelo base Qwen3.6-27B para confirmar restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un lanzamiento reciente con poca validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trymirai/Qwen3.6-27B-L
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Guia de uso de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Blog de Mirai sobre cuantizacion: https://trymirai.com/blog/quantization
- Documentacion de API de Mirai: https://docs.trymirai.com/
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guia completa de Qwen 3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Catalogo de modelos Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.6-27b
- QwenCloud - Qwen3.6-27B: https://www.qwencloud.com/models/qwen3.6-27b
- Guia de Qwen 3.6 local: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
