# topcatmax/albedo-arc-kumaresano-bk17

## Resumen

El modelo `topcatmax/albedo-arc-kumaresano-bk17` es un fine-tune de la serie Qwen3.6-35B-A3B, un modelo de lenguaje causal con encoder de visión (image-text-to-text) desarrollado originalmente por Alibaba Cloud. El autor `topcatmax` (bojan terzic) ha publicado este adaptación bajo licencia Apache 2.0, con un total de 35.951.822.704 parámetros (35,95B) en formato safetensors con precisión BF16. El nombre "albedo-arc-kumaresano-bk17" sugiere una especialización en roleplay o generación de personajes anime, aunque no se dispone de documentación específica del fine-tune.

La relevancia de este modelo radica en que combina una arquitectura MoE híbrida con atención lineal (Gated DeltaNet) y atención clásica, alcanzando 3B parámetros activos de un total de 35B, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Es compatible con el ecosistema Hugging Face Transformers, vLLM, SGLang y KTransformers, y su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) con encoder de visión |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | No disponible (repo en BF16; se esperan cuantizaciones de la comunidad) |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE híbrida con 40 capas dispuestas en un patron `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`. Esto combina capas de atención lineal recurrente (Gated DeltaNet) con capas de atención clasica (Gated Attention), reduciendo el coste computacional en contextos largos. El componente MoE cuenta con 256 expertos, de los cuales 8 son enrutados por token mas 1 experto compartido, con dimension intermedia de 512. La capa de embedding y la salida LM tienen 248.320 tokens (con padding). El modelo incluye un encoder de vision para entrada de imagenes y ha sido entrenado con multi-step MTP (Multi-Token Prediction).

El entrenamiento del modelo base incluyo fases de pre-entrenamiento y post-entrenamiento, con ajuste por retroalimentacion humana (RLHF) y optimizacion para tareas de codificacion agente y razonamiento. El fine-tune `albedo-arc-kumaresano-bk17` no documenta su proceso de entrenamiento especifico, por lo que se desconoce el dataset utilizado o las tecnicas de ajuste aplicadas.

## Capacidades

- Generacion de texto y razonamiento multimodal (entrada de imagenes y texto).
- Codificacion agente: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, con soporte para herramientas (tool calling).
- Preservacion de contexto de razonamiento: opcion para retener el historial de pensamiento en conversaciones iterativas.
- Capacidades multilingues del modelo base (no confirmadas para este fine-tune).
- Ventana de contexto larga (262K nativo) para tareas que requieren gran cantidad de informacion previa.
- Soporte de agentes y razonamiento multi-paso, especialmente en tareas de ingenieria de software.

## Casos de uso

- Asistente de codificacion en repositorios grandes: gracias a su contexto de 262K tokens y su capacidad de razonamiento a nivel de repositorio, puede analizar multiples archivos y proponer cambios coherentes en proyectos complejos.
- Generacion de interfaces frontend: el modelo base destaca en tareas de codificacion agente para frontend, por lo que este fine-tune podria usarse para generar componentes HTML/CSS/JS a partir de descripciones o capturas.
- Chat de roleplay con personajes anime: el nombre "albedo-arc" y la referencia a catalogos de personajes sugieren un uso orientado a interaccion con personajes ficticios, aprovechando el encoder de vision para procesar imagenes de referencia.
- Automatizacion de tareas de mantenimiento de software: con SWE-bench Verified de 73,4 en el modelo base, puede resolver issues reales de GitHub de forma autonoma.
- Analisis de documentacion tecnica extensa: la ventana de contexto amplia permite procesar manuales completos o especificaciones de API sin truncamiento.
- Creacion de contenido multimodal: al aceptar imagenes como entrada, puede describir, modificar o generar texto relacionado con ilustraciones o capturas de pantalla.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles corresponden al modelo base Qwen3.6-35B-A3B, no al fine-tune especifico. No se han publicado resultados independientes para `albedo-arc-kumaresano-bk17`.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |

Estos datos indican que el modelo base compite directamente con alternativas de tamano similar en tareas de ingenieria de software. Para otros benchmarks (MMLU, GSM8K, HumanEval) no se dispone de informacion en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 71,9 GB (tamano del repo). Con cuantizacion a 8 bits se reduciria a ~36 GB, y a 4 bits a ~18 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con offloading). Con cuantizacion 4 bits cabria en una RTX 4090 (24GB) o RTX 3090.
- No cabe en GPUs de consumo sin cuantizacion; se recomienda usar vLLM o SGLang con tensor parallelism en multiples GPUs para produccion.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. Tambien se puede usar con llama.cpp si se generan pesos GGUF.
- Latencia y throughput: no disponibles para este fine-tune; el modelo base con 3B activos ofrece un throughput significativamente mayor que un modelo denso de 35B, pero los valores concretos dependen del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | 262K nativo | Apache 2.0 | Codificacion agente, multimodal |
| Qwen3.5-35B-A3B | 35B totales, 3B activos | 262K nativo | Apache 2.0 | Codificacion agente, multimodal |
| Gemma4-31B | 31B densos | 128K | Gemma License | Multimodal, razonamiento |
| `albedo-arc-kumaresano-bk17` | 35B totales, 3B activos | 262K nativo | Apache 2.0 | Fine-tune para roleplay (no confirmado) |

El modelo se posiciona como una variante ajustada de Qwen3.6-35B-A3B. No se dispone de informacion sobre el dataset de fine-tuning ni sobre mejoras especificas frente al modelo base.

## Limitaciones y advertencias

- No hay documentacion del proceso de fine-tuning: se desconoce el dataset, las tecnicas de ajuste y los objetivos especificos del adaptacion.
- La model card es una copia literal de la card de Qwen3.6-35B-A3B, por lo que los benchmarks y capacidades descritas corresponden al modelo base, no necesariamente a este fine-tune.
- Riesgo de alucinacion y sesgos inherentes al modelo base, no mitigados ni evaluados para esta version.
- No se han publicado resultados de evaluacion independientes para el fine-tune; su rendimiento real en tareas de roleplay o generacion de imagenes es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica una adopcion nula hasta la fecha.
- No se especifican los idiomas soportados; el modelo base Qwen3.6 soporta multiples idiomas, pero el fine-tune podria haber reducido ese soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/topcatmax/albedo-arc-kumaresano-bk17
- Perfil del autor: https://huggingface.co/topcatmax
- Modelo base Qwen3.6-35B-A3B (referencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Modelos similares del mismo autor: https://huggingface.co/topcatmax/albedo-qwen3.6-35b-r16-top-03, https://huggingface.co/topcatmax/albedo-arc-marsplan0624-tea
- Modelo similar de otro autor: https://huggingface.co/standjones/albedo-arc-kumaresano-bk13
