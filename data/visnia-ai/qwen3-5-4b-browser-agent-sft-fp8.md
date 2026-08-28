# visnia-ai/Qwen3.5-4B-Browser-Agent-SFT-FP8

## Resumen

El modelo `visnia-ai/Qwen3.5-4B-Browser-Agent-SFT-FP8` es un fine-tuning del modelo base Qwen/Qwen3.5-4B, especializado en navegación web autónoma mediante un agente de navegador. Ha sido desarrollado por visnia-ai, que también mantiene el harness de agente de navegador homónimo. El modelo se ha ajustado mediante destilación de trayectorias (trajectory distillation) a partir de ejecuciones exitosas de un agente GPT-5.6 Luna, conservando resúmenes de razonamiento concisos y acciones estructuradas de navegador.

El problema que resuelve es la automatización de tareas web complejas con un modelo compacto de 4.539 millones de parámetros, capaz de operar con una ventana de contexto de 262.144 tokens. Su relevancia radica en que ofrece una tasa de éxito del 62% en el benchmark BrowseWebApp-Bench v2, frente al 22% del modelo base, con una eficiencia de tokens de salida 4,6 veces superior. El checkpoint se distribuye con cuantización FP8 post-entrenamiento, lo que reduce el footprint de memoria sin sacrificar rendimiento práctico.

La arquitectura hereda las características del Qwen3.5-4B: un modelo denso con arquitectura de gated delta networks, encoder de visión y decodificación MTP (Multi-Token Prediction), lo que le permite procesar entradas de imagen y texto. Está pensado para servirse con vLLM usando los parsers de razonamiento y tool calling de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con gated delta networks, encoder de visión y decodificación MTP (heredado de Qwen3.5-4B) |
| Parametros totales | 4.539.483.136 (~4,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (validado con vLLM `--max-model-len 262144`) |
| Tipos de cuantizacion | FP8 (post-entrenamiento, exportado en este repositorio) |
| Idiomas soportados | No disponible (heredado del modelo base, no especificado en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo denso de 4,5 B parámetros que emplea una arquitectura híbrida con gated delta networks (una variante de capas recurrentes con atención lineal) junto con un encoder de visión y decodificación MTP. Esta combinación permite manejar secuencias largas de hasta 262K tokens con un coste computacional reducido respecto a la atención full-attention tradicional.

El entrenamiento de este checkpoint consistió en un fine-tuning supervisado (SFT) mediante LoRA sobre 3.300 trayectorias exitosas de ejecución de un agente de navegador GPT-5.6 Luna, incluyendo etapas auxiliares del agente. Se conservaron resúmenes de razonamiento concisos cuando estaban disponibles. Los hiperparámetros fueron: 2 épocas, rango LoRA 64, alpha 128 y tamaño de batch efectivo global 8. Tras el entrenamiento, el modelo se fusionó y se exportó con cuantización FP8 post-entrenamiento, manteniendo la compatibilidad con vLLM 0.23.0 y los parsers de razonamiento y tool calling de Qwen.

## Capacidades

- Navegación web autónoma: ejecuta acciones estructuradas de navegador (clic, escritura, navegación, extracción) sobre páginas web reales.
- Razonamiento multi-paso: genera resúmenes de razonamiento concisos antes de emitir acciones, lo que mejora la planificación de tareas complejas.
- Tool calling: compatible con el parser `qwen3_coder` de vLLM, lo que permite integración con APIs y herramientas externas.
- Procesamiento multimodal: al heredar el encoder de visión del modelo base, puede interpretar capturas de pantalla y otras entradas visuales (aunque el fine-tuning se centra en acciones de navegador).
- Contexto largo: ventana de 262.144 tokens, adecuada para sesiones de navegación extensas con historial acumulado.
- Eficiencia de salida: reduce significativamente el número de tokens generados por acción (4,6x respecto al baseline), lo que abarata la inferencia.

## Casos de uso

- Automatización de pruebas de aplicaciones web: el modelo puede recorrer flujos de usuario (login, registro, compra) y verificar que los elementos responden correctamente, emitiendo acciones de navegador y validando resultados.
- Extracción de datos de portales con paginación: con su contexto de 262K tokens, puede procesar listados largos, navegar entre páginas y extraer campos estructurados sin perder el hilo de la sesión.
- Asistente de atención al cliente con acceso a web: integrado en un chatbot, puede consultar bases de conocimiento online, rellenar formularios de incidencias o buscar información de productos en tiempo real.
- Generación de informes de investigación de mercado: el agente navega por múltiples fuentes, recopila datos y sintetiza un resumen con citas, aprovechando el razonamiento multi-paso.
- Monitorización de precios y disponibilidad: programado para visitar tiendas online periódicamente, extraer precios y detectar cambios, emitiendo alertas cuando se cumplen condiciones.
- Automatización de tareas administrativas en portales gubernamentales: rellena formularios, adjunta documentos y realiza seguimiento de trámites, reduciendo la intervención manual.
- Desarrollo de agentes RPA ligeros: al ser un modelo de 4,5 B con FP8, puede desplegarse en entornos con recursos limitados (una GPU de 16 GB) para orquestar flujos de trabajo web sin depender de APIs propietarias.

## Benchmarks y rendimiento

El único benchmark publicado en la documentación es BrowseWebApp-Bench v2, que mide la tasa de éxito en tareas de navegación web y la eficiencia relativa de tokens de salida:

| Modelo | Tasa de éxito | Eficiencia relativa de tokens de salida |
|---|---|---|
| Qwen/Qwen3.5-4B (baseline) | 22% | 1,0x |
| visnia-ai/Qwen3.5-4B-Browser-Agent-SFT-FP8 | 62% | 4,6x |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este checkpoint específico. El modelo base Qwen3.5-4B, según fuentes externas, se acerca al rendimiento de Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en benchmarks de visión, pero esos datos no corresponden a este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP8, los pesos del modelo ocupan aproximadamente 4,5 GB. Para una ventana de contexto moderada (8K-32K tokens), una GPU con 8-12 GB de VRAM puede ser suficiente. Para explotar los 262K tokens completos, se recomienda al menos 24 GB de VRAM debido al crecimiento de la caché KV y las activaciones.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para desarrollo y pruebas; A100 40/80 GB o H100 para producción con contexto largo y alto throughput. También puede ejecutarse en GPUs consumer de 16 GB (p. ej., RTX 4080, RTX 4070 Ti Super) con longitudes de contexto reducidas.
- Compatibilidad con consumer GPU: sí, el modelo base Qwen3.5-4B está diseñado para GPUs de 16 GB, y la versión FP8 reduce aún más el requisito de memoria.
- Opciones de despliegue: vLLM (validado con la versión 0.23.0), TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta). El comando de arranque recomendado usa `vllm serve` con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño de 4,5 B y la cuantización FP8, se espera una latencia de decodificación en el rango de 20-50 ms por token en una RTX 4090, y un throughput de varios cientos de tokens por segundo con batching en vLLM, aunque estos valores son estimaciones orientativas.

## Comparativa con modelos similares

La comparación más directa es contra el modelo base sin fine-tuning, ya que no se dispone de datos de otros modelos de agente de navegador en el mismo rango de parámetros.

| Modelo | Parámetros | Contexto | Tasa de éxito (BrowseWebApp v2) | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.5-4B (baseline) | 4,5 B | 262K | 22% | Apache-2.0 |
| visnia-ai/Qwen3.5-4B-Browser-Agent-SFT-FP8 | 4,5 B | 262K | 62% | Apache-2.0 |

No se dispone de información sobre otros modelos comparables (p. ej., agentes basados en Qwen2.5-VL o Llama-3.2-Vision) con el mismo benchmark. La mejora de 40 puntos porcentuales sobre el baseline demuestra el impacto del fine-tuning específico para navegación web.

## Limitaciones y advertencias

- El fine-tuning se realizó con un conjunto de datos limitado (3.300 trayectorias), lo que puede provocar sobreajuste a los patrones de navegación presentes en ese corpus y menor generalización a sitios web muy diferentes.
- Riesgo de alucinación en la generación de razonamiento: aunque se incluyen resúmenes de razonamiento, el modelo puede producir justificaciones incorrectas o inventar pasos de navegación que no corresponden a la realidad de la página.
- Sesgos heredados del modelo base Qwen3.5-4B, que no se han evaluado específicamente para este checkpoint.
- Limitaciones de idioma: no se ha documentado qué idiomas soporta el fine-tuning; el modelo base es presumiblemente multilingüe, pero el rendimiento en navegación web puede degradarse en idiomas poco representados en las trayectorias de entrenamiento.
- La cuantización FP8 puede introducir pequeñas pérdidas de precisión en tareas de razonamiento numérico o lógico, aunque no se han reportado diferencias significativas en el benchmark de navegación.
- Para uso en producción, es imprescindible validar el comportamiento del agente en entornos controlados, ya que la ejecución de acciones sobre sitios web reales puede tener efectos no deseados (envío de formularios, compras, etc.).
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5-4B (también Apache-2.0 según el enlace proporcionado) y las condiciones de uso del harness `visnia-ai/browser-agent`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/visnia-ai/Qwen3.5-4B-Browser-Agent-SFT-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Harness del agente de navegador: https://github.com/visnia-ai/browser-agent
- Benchmark BrowseWebApp-Bench v2: https://github.com/visnia-ai/browsewebapp-bench
- Ficha de Qwen3.5-4B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
