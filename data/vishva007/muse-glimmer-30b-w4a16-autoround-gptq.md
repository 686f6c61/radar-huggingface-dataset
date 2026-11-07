# Vishva007/Muse-Glimmer-30B-W4A16-AutoRound-GPTQ

## Resumen

Muse-Glimmer-30B-W4A16-AutoRound-GPTQ es una versión cuantizada a 4 bits del modelo multimodal Muse Glimmer 30B de Meta, publicada por el usuario Vishva007 en Hugging Face. El modelo base es un transformer causal de aproximadamente 30.000 millones de parámetros (aunque el checkpoint safetensors de esta versión declara 4.612.899.840 parámetros, coherente con pesos empaquetados a 4 bits y un encoder visual de ~1,8B en BF16), destilado de Muse Spark por Meta Superintelligence Lab y orientado a tareas agénticas autónomas con percepción visual.

La relevancia de esta ficha es práctica: la cuantización W4A16 reduce el peso del modelo por debajo de los 20 GB, lo que permite ejecutarlo en GPUs de consumo con 24 o 32 GB de VRAM junto con la caché KV y el encoder de percepción. El proceso se realizó con Intel AutoRound, manteniendo el módulo de visión sin cuantizar (`quant_nontext_module=False`) para preservar la alineación visión-lenguaje, y se ofrece en dos formatos: AutoRound nativo y AutoGPTQ (este repositorio).

El modelo está pensado para despliegue en producción con vLLM, con soporte nativo de tool calling, parsing de razonamiento multi-paso y ventana de contexto configurable hasta 32.768 tokens. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (LLM + encoder visual ViT-G/14 de ~1,8B parámetros) |
| Parametros totales | 4.612.899.840 (checkpoint safetensors cuantizado); modelo base de ~30B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 64, simétrico; encoder visual en BF16 |
| Idiomas soportados | más de 100 idiomas según datos de entrenamiento del modelo base; lista explícita no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (AutoGPTQ / GPTQ); existe variante AutoRound en otro repositorio |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer causal de unos 30.000 millones de parámetros con un encoder de percepción dedicado ViT-G/14 de aproximadamente 1,8B parámetros, lo que lo convierte en un modelo multimodal de entrada imagen-texto. Según la model card, fue destilado de Muse Spark por Meta Superintelligence Lab y está especializado en tareas agénticas autónomas, incluyendo uso de herramientas, recuperación de fallos en llamadas y razonamiento multi-paso. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta versión concreta aplica cuantización de solo pesos (W4A16) con Intel AutoRound: grupo de tamaño 64, simetría activada, calibración con 512 muestras, 800 iteraciones y longitud de secuencia de 2048. El módulo de visión se mantiene en BF16 sin cuantizar para no degradar las capacidades visuales y agénticas. El resultado se exporta a formato AutoGPTQ para su uso con transformers y vLLM. No se documentan innovaciones adicionales de decodificación (especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas intercaladas de texto e imagen (gráficos, documentos, capturas de pantalla).
- Finalización de tareas agénticas de extremo a extremo, con soporte para esquemas de herramientas complejos y recuperación automática ante fallos de llamadas.
- Tool calling / function calling nativo, con parser específico `muse_glimmer` en vLLM (`--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer`).
- Razonamiento multi-paso con parser de razonamiento dedicado (`--reasoning-parser muse_glimmer`).
- Esfuerzo de razonamiento controlable mediante system prompts en cuatro niveles: low, medium, high y xhigh.
- Capacidades multilingües: entrenado con datos de más de 100 idiomas.
- Capacidades de agente visual: interpretación de interfaces, documentos y gráficos dentro de flujos con herramientas.
- No se documentan capacidades de audio en la información disponible.

## Casos de uso

- Automatización de soporte técnico con capturas de pantalla: el modelo puede recibir una imagen de una interfaz o error junto con texto y razonar sobre ella, manteniendo conversaciones multi-turno dentro de la ventana de 32k tokens.
- Agentes de escritorio y navegación web: gracias a la percepción visual y al tool calling nativo, puede interpretar capturas de pantalla, decidir la siguiente acción y ejecutar llamadas a herramientas con reintento automático ante fallos.
- Análisis de documentos y gráficos financieros: la entrada image-text-to-text permite extraer y razonar sobre tablas, gráficos y documentos escaneados sin cuantizar el encoder visual, preservando la alineación visión-lenguaje.
- Asistente de código en pipelines CI/CD: con soporte de tool calling y contexto de 32k tokens, puede integrarse en flujos de revisión de parches, consulta de repositorios y ejecución de comandos a través de herramientas.
- Despliegue local en estación de trabajo con GPU de 24 GB: al ocupar menos de 20 GB en W4A16, es viable servirlo con vLLM en una RTX 4090 o similar para prototipos de agentes multimodales.
- Investigación en agentes autónomos: los benchmarks citados (DeepSearch QA, MCP-Atlas, τ3-Bench, SWE-Bench) lo sitúan como banco de pruebas para evaluar razonamiento multi-paso y uso de herramientas en entornos controlados.
- Procesamiento por lotes de documentación visual: con `--max-num-seqs 128` en vLLM se puede servir un throughput moderado para clasificación y extracción de información de imágenes a escala departamental.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no incluye cifras concretas, por lo que no se presentan valores.

## Requisitos de hardware

- VRAM estimada: menos de 20 GB para los pesos en W4A16; con caché KV a 32k tokens y encoder visual en BF16, el consumo se sitúa cómodamente en entornos de 24 GB o 32 GB según la model card.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB, L40S 48 GB; también GPUs de 32 GB como la RTX 5090 si está disponible en el entorno.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o superiores, siempre ajustando `--gpu-memory-utilization` y `--max-model-len`.
- Opciones de despliegue: vLLM (recomendado, con imagen `vllm/vllm-openai:muse-glimmer`), transformers con AutoGPTQ; no se documenta soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La configuración sugerida usa `--max-num-seqs 128` y `--gpu-memory-utilization 0.90`, pero no se aportan métricas medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-W4A16-AutoRound-GPTQ | ~30B (checkpoint 4,6B en safetensors) | 32.768 | Imagen-texto | Apache 2.0 | safetensors GPTQ |
| Muse-Glimmer-30B (base, Meta) | ~30B | no disponible | Imagen-texto | Apache 2.0 | safetensors BF16 |
| Muse-Glimmer-30B-W4A16-AutoRound (mismo autor) | ~30B | 32.768 | Imagen-texto | Apache 2.0 | safetensors AutoRound |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Al tratarse de una cuantización W4A16, puede existir una degradación leve en tareas de razonamiento fino o generación de código respecto al modelo base en BF16; el autor solo garantiza la preservación del encoder visual.
- El checkpoint declara 4.612.899.840 parámetros en safetensors, lo que refleja el empaquetado a 4 bits y no el número real de parámetros del modelo base; hay que tenerlo en cuenta al planificar memoria.
- No se documentan sesgos conocidos ni evaluaciones de seguridad específicas para esta versión cuantizada.
- Riesgo de alucinación inherente a los modelos de lenguaje de 30B, especialmente en tareas de recuperación y agentes con herramientas externas.
- La lista explícita de idiomas soportados no está disponible; solo se indica que el modelo base se entrenó con datos de más de 100 idiomas.
- El soporte de vLLM requiere una build reciente o la imagen `vllm/vllm-openai:muse-glimmer`; versiones antiguas pueden no reconocer los parsers `muse_glimmer`.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de Meta por si imponen restricciones adicionales no reflejadas en esta ficha.
- El repositorio tiene muy pocas descargas (39) y un solo like en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Vishva007/Muse-Glimmer-30B-W4A16-AutoRound-GPTQ
- Variante AutoRound del mismo autor: https://huggingface.co/Vishva007/Muse-Glimmer-30B-W4A16-AutoRound
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- RunPod (referido por el autor): https://runpod.io?ref=iabrlp7z
