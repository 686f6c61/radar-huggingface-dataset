# yhavinga/gemma-4-31b-it-en-nl-GGUF

## Resumen

Gemma 4 31B-it English→Dutch (GGUF) es una cuantización en formato GGUF de un ajuste fino del modelo `google/gemma-4-31B-it`, especializado en traducción del inglés al neerlandés. Lo publica el desarrollador independiente yhavinga, que parte de su propio adaptador LoRA (`yhavinga/gemma-4-31b-it-en-nl-lora`), lo fusiona en los pesos en bf16 y posteriormente lo convierte y cuantiza para llama.cpp y LM Studio. El resultado es un modelo de traducción unimodal (solo texto) que hereda la plantilla de chat del modelo base.

El modelo resuelve un problema concreto: obtener traducciones EN→NL más fieles y fluidas que las del Gemma 4 base, sin necesidad de infraestructura de GPU de gran tamaño, gracias a las cuantizaciones Q4_K_M (18,7 GB) y Q8_0 (32,6 GB). Con 30.697.345.596 parámetros totales y un contexto de entrenamiento de 4.096 tokens, está pensado para despliegues locales o en servidores modestos mediante llama.cpp, con decodificación greedy y el modo de razonamiento desactivado.

Es relevante ahora porque demuestra un patrón práctico de especialización: tomar un modelo generalista grande, aplicar un LoRA de dominio y distribuir cuantizaciones listas para consumir. La licencia Apache 2.0 y la compatibilidad con endpoints OpenAI facilitan su integración en pipelines de traducción existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de google/gemma-4-31B-it; detalles de atención y capas no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; entrenado con secuencias de como maximo 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (18,7 GB) y Q8_0 (32,6 GB); sin importance matrix |
| Idiomas soportados | en (ingles), nl (neerlandes) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp v1.0.0: convert_hf_to_gguf.py y llama-quantize); el adaptador original esta en formato PEFT para transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-31B-it`, un transformer decoder-only de aproximadamente 30,7 mil millones de parámetros. Sobre ese modelo base se entrenó un adaptador LoRA para traducción EN→NL, cuyos detalles de entrenamiento (composición del dataset, número de tokens, hiperparámetros) se documentan en el repositorio del adaptador `yhavinga/gemma-4-31b-it-en-nl-lora`, no en esta ficha. El adaptador se fusionó en los pesos en bf16 y el modelo resultante se convirtió a GGUF y se cuantizó con llama.cpp v1.0.0 sin importance matrix.

Un dato técnico relevante es que los objetivos de traducción del ajuste fino fueron generados por el propio modelo base, lo que el autor señala como posible fuente de sesgo hacia su propio estilo. El modelo se entrenó sin modo de razonamiento (thinking), con secuencias de hasta 4.096 tokens, y se recomienda decodificación greedy (temperatura 0) con el razonamiento desactivado, ya que la plantilla de chat de llama.cpp lo activa por defecto para esta familia. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto inglés→neerlandés con instrucción específica, preservando nombres, números, matices, tono, párrafos, saltos de línea y formato.
- Generación de texto conversacional heredada del modelo base Gemma 4 (plantilla de chat incluida), aunque el uso previsto es la traducción.
- Salida controlada: el prompt exige únicamente la traducción, sin explicaciones ni comentarios.
- Modo de razonamiento (thinking) presente en la plantilla de chat, pero desaconsejado y desactivado en el uso previsto.
- Procesamiento solo de texto; sin capacidades de visión ni audio declaradas.
- Compatibilidad con endpoints OpenAI a través de `llama-server`.
- No se documenta soporte de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso

- Traducción de documentación técnica EN→NL: el modelo traduce preservando formato, listas y bloques de código del original, adecuado para mantener documentación de producto en neerlandés con revisión humana posterior.
- Localización de interfaces y textos de producto: con temperatura 0 y el prompt fijo, genera traducciones consistentes y concisas, útiles para cadenas de UI y mensajes de error.
- Traducción de artículos y notas de prensa: el prompt exige mantener el tono y la concisión del original, lo que encaja en flujos editoriales con revisión final por un traductor nativo.
- Servicio de traducción autoalojado: desplegado con `llama-server` como API compatible con OpenAI, permite ofrecer traducción EN→NL en infraestructura propia sin depender de servicios externos.
- Preprocesado multilingüe para pipelines de datos: conversión de corpus en inglés a neerlandés antes de indexación, búsqueda o análisis, con la ventaja de que el modelo cabe en una sola GPU de 24 GB en Q4_K_M.
- Uso en estación de trabajo con LM Studio: el autor documenta la búsqueda del modelo por ID y la descarga directa de la cuantización, lo que facilita pruebas y prototipado local sin configuración de servidor.
- Traducción por lotes con contexto moderado: dado el límite de entrenamiento de 4.096 tokens, es adecuado para fragmentos y párrafos, no para documentos completos en una sola pasada.

## Benchmarks y rendimiento

Evaluación sobre el modelo sin cuantizar (bf16), frente al modelo base con el mismo prompt y decodificación greedy, en particiones held-out. MetricX-24 QE (menor es mejor) y COMET-22:

| Conjunto | n | QE este modelo | QE base | QE referencia humana | COMET-22 este modelo | COMET-22 base |
|---|---:|---:|---:|---:|---:|---:|
| WMT24++ en-nl | 480 | 2.167 | 2.276 | 2.463 | 0.8519 | 0.8502 |
| FLORES-200 en-nl | 504 | 1.105 | 1.115 | 1.493 | 0.8892 | 0.8895 |
| NTREX-128 en-nl | 999 | 1.498 | 1.547 | 1.874 | 0.8818 | 0.8820 |

En comparaciones por pares ciegas con el modelo base, un revisor LLM (Claude) prefirió este modelo en 39 de 100 pasajes y el base en 22 (39 empates); un revisor humano no vio preferencia clara (18 / 16 / 6 sobre 40 pares). Las cuantizaciones se comprobaron sobre 8 frases de FLORES con decodificación greedy frente a la salida del modelo sin cuantizar: chrF 93,5 (Q4_K_M) y 98,3 (Q8_0), con todas las salidas en neerlandés.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19-20 GB para Q4_K_M (archivo de 18,7 GB) y 33-34 GB para Q8_0 (archivo de 32,6 GB), más overhead de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto amplio; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M; A100 40 GB para Q4_K_M con margen holgado.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4090 (24 GB) y GPUs equivalentes; Q8_0 requiere 48 GB o más y no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI) y LM Studio; el adaptador original está pensado para transformers + peft.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| yhavinga/gemma-4-31b-it-en-nl-GGUF | 30,7 B | entrenado a 4.096 tokens | Traducción EN→NL especializada (LoRA) | apache-2.0 | GGUF (Q4_K_M, Q8_0) |
| google/gemma-4-31B-it | 30,7 B | no disponible | Modelo generalista multimodal | no disponible en la información | safetensors y derivados |
| yhavinga/gemma-4-31b-it-en-nl-lora | 30,7 B (base + LoRA) | no disponible | Adaptador LoRA EN→NL para transformers + peft | apache-2.0 | PEFT |

No se dispone de datos de otros modelos de traducción comparables en la información proporcionada; la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La mejora medida se limita a fidelidad y fluidez según MetricX y un revisor LLM; un revisor humano no apreció diferencia clara y las traducciones no suenan mediblemente más naturales como neerlandés original.
- Los objetivos de traducción del ajuste fino fueron elegidos por el propio modelo base, por lo que no puede descartarse un sesgo de preferencia hacia su propio estilo.
- La cuantización altera la salida; la evaluación presentada corresponde al modelo bf16, no a los GGUF.
- Solo traduce EN→NL y con el prompt específico documentado; fuera de ese uso el rendimiento no está garantizado.
- Límite de entrenamiento de 4.096 tokens: no apto para documentos largos en una sola pasada.
- Riesgo de alucinación y de omisión o adición de contenido no evaluado específicamente; se recomienda revisión humana en producción.
- Requiere desactivar el modo de razonamiento y usar temperatura 0; con otros ajustes la calidad puede degradarse.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-31B-it` (no detalladas en la información disponible).
- No se documentan sesgos específicos más allá del sesgo de estilo mencionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-GGUF
- Adaptador LoRA: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- TPU Research Cloud: https://sites.research.google/trc/about/
