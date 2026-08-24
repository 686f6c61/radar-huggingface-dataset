# vcruz305/Muse-Glimmer-30B-Hermes-Agentic-NVFP4

## Resumen

Muse-Glimmer-30B-Hermes-Agentic-NVFP4 es un modelo de lenguaje y visión (vision-language) de código abierto, desarrollado por Victor Cruz (vcruz305) como una versión cuantizada en NVFP4 del fine-tune Hermes-Agentic sobre el modelo base Muse-Glimmer-30B de Meta. El objetivo es ofrecer un modelo ligero y desplegable en hardware de consumo para tareas de agente autónomo, con especial énfasis en la llamada a herramientas (tool calling) y el razonamiento multi-paso. Aunque el nombre comercial indica 30B, los pesos reales en safetensors suman aproximadamente 18,7 mil millones de parámetros, una discrepancia que conviene tener en cuenta al dimensionar recursos.

La relevancia actual de este modelo radica en su combinación de licencia Apache-2.0, tamaño contenido y capacidad para ejecutarse en una sola GPU, como la DGX Spark de NVIDIA. El export NVFP4 reduce el peso en disco a unos 23 GB, lo que permite su uso en entornos con memoria limitada. Está pensado para desarrolladores que necesitan un modelo de agente local, con soporte de tool calling y razonamiento estructurado, sin depender de APIs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language con encoder ViT-G/14, atención lineal y MTP (multi-token prediction) |
| Parametros totales | 18.737.219.398 (pesos reales en safetensors; el nombre comercial indica 30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K (según el modelo base Muse-Glimmer-30B; no especificado en el export NVFP4) |
| Tipos de cuantizacion | NVFP4 (compressed-tensors, formato `nvfp4-pack-quantized`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (2 shards, ~23 GB en disco) |

## Arquitectura y entrenamiento

El modelo base, Muse-Glimmer-30B de Meta, es un transformer denso de 29,6B parámetros (aunque los pesos reales del export NVFP4 suman 18,7B) con un encoder de percepción ViT-G/14 y una ventana de contexto de 128K. Está destilado de Muse Spark para uso local y emite razonamiento por canales y llamadas a herramientas en formato XML estilo ATEM, en lugar de JSON. El fine-tune Hermes-Agentic, realizado por vcruz305, aplica un ajuste supervisado (SFT) sobre el dataset `vcruz305/hermes-agentic-tool-sft`, enseñando al modelo a llamar una o dos herramientas y detenerse. Las rutas de visión, proyector, `lm_head`, atención lineal y MTP se congelaron durante el SFT y se ignoran en la receta de cuantización NVFP4, lo que significa que el export final se centra exclusivamente en texto y herramientas.

El proceso de cuantización utiliza `compressed-tensors` con formato `nvfp4-pack-quantized`, que empaqueta los pesos en precisión de 4 bits flotantes. La receta (`recipe.yaml`) excluye explícitamente los componentes de visión y atención lineal, reduciendo el tamaño a unos 23 GB. El despliegue recomendado es mediante SGLang o vLLM sobre DGX Spark, con flags específicos para el backend de gemm FP4 y los parsers de razonamiento y herramientas.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" activable.
- Llamada a herramientas (tool calling) en formato XML estilo ATEM, con soporte para una o dos llamadas por turno.
- Capacidades de agente autónomo: puede planificar, ejecutar acciones y detenerse tras completar la tarea.
- Razonamiento matemático y lógico, con puntuación perfecta en la categoría math del benchmark sixcat.
- Generación de código y asistencia en programación, con un 85% en la categoría code.
- Comprensión de instrucciones complejas (instruct) con un 90% en sixcat.
- Conocimiento general y factual (knowledge) con un 75% en sixcat.
- Capacidades de visión presentes en el modelo base, pero congeladas y no activas en este export NVFP4.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y llamar a herramientas como APIs de CRM o bases de conocimiento para resolver incidencias sin intervención humana.
- Generación de código en producción: gracias a su soporte de tool calling y su buen rendimiento en code (85% en sixcat), puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, invocando compiladores o linters como herramientas externas.
- Agentes de automatización de tareas: el modelo puede ejecutar flujos de trabajo complejos, como la gestión de correos electrónicos, la programación de citas o la extracción de datos de la web, llamando a herramientas específicas y deteniéndose cuando la tarea está completa.
- Asistente de razonamiento matemático: con un 100% en la categoría math de sixcat, es adecuado para aplicaciones educativas o de análisis financiero que requieran cálculos precisos y explicaciones paso a paso.
- Chatbot de soporte técnico local: al ser Apache-2.0 y caber en una GPU de consumo, puede desplegarse en un servidor local o en un edge device para ofrecer asistencia técnica sin depender de la nube.
- Investigación y análisis de documentos: con su contexto de 128K, puede procesar documentos largos, resumir informes o extraer información relevante, invocando herramientas de búsqueda o bases de datos vectoriales.

## Benchmarks y rendimiento

Los resultados del benchmark sixcat (con SGLang, modo thinking activado, política estricta, límite de 20 y 120 preguntas tras reintentos) son los siguientes:

| Categoria | Puntuacion |
|---|---|
| knowledge | 75.0 |
| math | 100.0 |
| truth | 85.0 |
| instruct | 90.0 |
| code | 85.0 |
| tools | 80.0 |
| **overall (strict)** | **85.8** |

El throughput medido en la misma ejecución fue de aproximadamente 11,9 tokens por segundo en una DGX Spark. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita, pero el tamaño del repo es de ~23 GB, por lo que se recomienda una GPU con al menos 24 GB de memoria para cargar el modelo completo en FP4.
- GPU recomendada: NVIDIA DGX Spark (GB10, SM121) es el hardware de referencia, con 128 GB de memoria unificada. También puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o A6000 (48 GB), aunque no se han verificado oficialmente.
- Opciones de despliegue: SGLang (preferido) y vLLM, con scripts de lanzamiento disponibles en el repositorio `muse-glimmer-nvfp4-spark-serve`. También existe una escalera GGUF para uso con llama.cpp u Ollama.
- Latencia y throughput: ~11,9 tok/s medido en DGX Spark con SGLang y modo thinking activado. La latencia por token dependerá del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento sixcat (overall) |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Hermes-Agentic-NVFP4 (este) | 18,7B (pesos reales) | 128K | Apache-2.0 | NVFP4 safetensors | 85.8 |
| Muse-Glimmer-30B-Hermes-Agentic (BF16/FP16) | 18,7B (pesos reales) | 128K | Apache-2.0 | BF16/FP16 safetensors | No disponible |
| Muse-Glimmer-30B (base de Meta) | 29,6B (según Meta) | 128K | Apache-2.0 | BF16 | No disponible |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos de la misma categoría en la información proporcionada. La versión NVFP4 ofrece un tamaño reducido a costa de una posible pérdida de precisión frente a la versión BF16, aunque los benchmarks sixcat indican un rendimiento sólido.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Las capacidades de visión están congeladas y no activas en este export NVFP4; el pipeline se declara como `image-text-to-text` pero la receta de cuantización ignora las rutas de visión.
- La cuantización NVFP4 puede introducir pérdida de precisión en tareas de alta sensibilidad numérica, aunque los benchmarks no muestran degradación significativa.
- Requiere parsers específicos (`muse` para razonamiento y `muse` para tool calling) que no son estándar en la mayoría de frameworks; es necesario configurarlos manualmente.
- El modelo está diseñado para llamar una o dos herramientas y detenerse; no es adecuado para flujos de agente con múltiples iteraciones sin intervención.
- La discrepancia entre el nombre comercial (30B) y los pesos reales (18,7B) puede causar confusión al dimensionar infraestructura.
- No se han publicado evaluaciones de sesgos o alucinaciones más allá del benchmark sixcat; se recomienda validar en dominios específicos antes de usar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic-NVFP4
- Modelo base (BF16/FP16): https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic
- Escalera GGUF: https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic-GGUF
- Repositorio de recetas de despliegue (SGLang + vLLM): https://github.com/vcruz305/muse-glimmer-nvfp4-spark-serve
- Modelo base de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Recetas vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
