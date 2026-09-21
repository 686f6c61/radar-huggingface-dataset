# Stage-org/4b-300-LH-27b-z-iter2-epoch3

## Resumen

Stage-org/4b-300-LH-27b-z-iter2-epoch3 es un modelo de lenguaje de 4.539.265.536 parámetros (~4,54B) publicado por el usuario Stage-org en Hugging Face. Se trata de un ajuste mediante aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-4B, producido dentro de un flujo de trabajo interno denominado "jh-workflow". El repositorio contiene únicamente pesos en formato safetensors (9,1 GB) y una model card que documenta exclusivamente la procedencia del entrenamiento.

La model card no incluye descripción de capacidades, licencia, idiomas, composición del dataset ni resultados de evaluación, y el repositorio acumula cero descargas y cero "likes" en el momento de la consulta. Por tanto, debe tratarse como un artefacto experimental de investigación, no como un modelo listo para producción. Lo que sí se puede afirmar con certeza, porque aparece en la configuración de entrenamiento publicada, es el método (RL con juez externo), el esquema del optimizador, la longitud de secuencia usada en entrenamiento y los parámetros de inferencia previstos (vLLM, parsers de razonamiento y de tool calling de la familia Qwen3).

La relevancia de esta ficha es, en consecuencia, fundamentalmente técnica y descriptiva: sirve para saber cómo se entrenó el modelo y para dejar constancia explícita de todo aquello que no está documentado y que, por tanto, no puede asumirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen/Qwen3.5-4B (etiqueta `qwen3_5`); no se indica que sea MoE |
| Parámetros totales | 4.539.265.536 (~4,54B) |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | Entrenamiento: `seq_len` = 300.000 tokens (config publicada). Inferencia: `max_model_len` = 65.536 tokens (config de vLLM) |
| Tipos de cuantización | no disponible (solo se publican pesos sin cuantizar en safetensors; no hay GGUF ni GPTQ/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se somete a un ajuste por aprendizaje por refuerzo (`learner.method = "rl"`). La configuración registra 10.000 pasos de aprendizaje sobre 3 épocas, con `batch_size` de 128 y `seq_len` de 300.000 tokens. El bucle de RL usa `group_size` de 8, con 2 GPU por nodo repartidas en 1 GPU de inferencia y 1 GPU de entrenamiento. El optimizador es AdamW con `lr` = 1e-6, `weight_decay` = 0.0, `max_norm` = 1.0 y betas (0.9, 0.99). La función de pérdida es de tipo `default` con parámetros `dppo_mask_low` = 0.2, `dppo_mask_high` = 0.28, `adv_tau` = 1.0 y `kl_tau` = 0.001.

La generación de rollouts se realiza con temperatura 0.9, `top_p` = 1.0, `max_tokens` = 4096 y `enable_thinking` activado. La evaluación de respuestas abiertas corre a cargo de un juez externo servido por API (modelo `gpt-5.6-luna`, `reasoning_effort` = "medium", temperatura 1.0, hasta 3 reintentos y 32 peticiones concurrentes). No se especifica la composición del dataset más allá de la referencia `Stage-org/4b-300-LH-27b-z-iter2`.

En el lado de inferencia, la configuración usa vLLM con `gpu_memory_utilization` = 0.9, atención FlashAttention 2, `language_model_only` = true, `reasoning_parser` = "qwen3" y `tool_call_parser` = "qwen3_coder". Ese último dato sugiere que el modelo conserva los parsers de tool calling de la familia Qwen3, aunque no hay documentación que confirme el comportamiento final tras el RL.

## Capacidades

No se ha publicado ninguna descripción funcional del modelo. Los únicos indicios disponibles proceden de la configuración de entrenamiento e inferencia, y no constituyen una verificación de capacidades:

- Generación de texto y razonamiento: la configuración activa `enable_thinking` y usa `reasoning_parser = "qwen3"`, lo que apunta a un modo de razonamiento explícito heredado del modelo base; sin validación publicada.
- Tool calling / function calling: se declara `tool_call_parser = "qwen3_coder"` en vLLM, lo que indica soporte previsto de llamadas a herramientas en el modelo base; el comportamiento tras el RL no está documentado.
- Capacidades de agente: no disponible.
- Capacidades multilingües: no disponible.
- Visión o audio: no disponible; la inferencia se configura como `language_model_only`, por lo que no se espera entrada multimodal.
- Matemáticas, código y tareas especializadas: no disponible.

## Casos de uso

Los siguientes escenarios son hipotéticos y dependen de que el modelo se comporte como su base Qwen3.5-4B; no hay evaluación publicada que los respalde. Se indican a título orientativo:

- Experimentación en investigación con RL: el modelo es directamente reutilizable como punto de partida o como referencia en estudios sobre ajuste por refuerzo con juez externo, dado que la configuración de entrenamiento está publicada y es reproducible.
- Procesamiento de documentos largos en pruebas de concepto: la ventana de entrenamiento de 300.000 tokens y el `max_model_len` de 65.536 permiten experimentar con resúmenes o extracción sobre documentos de decenas de miles de tokens, siempre que se valide la calidad del resultado.
- Asistentes conversacionales multi-turno en entorno controlado: con 65.536 tokens de contexto, permite mantener diálogos extensos y con memoria amplia; adecuado para prototipos internos, no para producción sin evaluación previa.
- Generación de código asistida en pipelines internos: si se confirma el soporte de `tool_call_parser`, podría integrarse en flujos tipo CI/CD para sugerencias de parches o generación de tests; requiere verificación empírica.
- Evaluación comparativa de métodos de RL: útil como uno de los brazos de un estudio que compare RL frente a SFT o DPO sobre el mismo modelo base.
- Fine-tuning posterior (SFT/LoRA): al ser un modelo denso de 4,54B en safetensors, es un punto de partida manejable para posteriores ajustes en una o dos GPU.
- Prototipado en local: puede ejecutarse en una GPU de consumo de gama alta para pruebas de integración con vLLM o, previa conversión a GGUF, con llama.cpp/Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los pesos en BF16/FP16: ~9,1 GB, cifra que coincide con el tamaño del repositorio (9,1 GB).
- Cuantización a 8 bits (INT8/FP8, si se generan los artefactos): ~4,5-5 GB.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4, no publicados): ~2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en producción. Para investigación, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en BF16 con contexto moderado.
- GPU de consumo: cabe sin cuantizar en RTX 4090, RTX 3090 y RTX 4060 Ti 16 GB (esta última con contexto corto). En tarjetas de 12 GB (RTX 3060, RTX 4070) solo cabe recurriendo a cuantización de 8 o 4 bits.
- Caché KV: estimación aproximada basada en configuraciones típicas de la familia Qwen3 con GQA (36 capas, 8 cabezas KV, `head_dim` 128), del orden de 0,14 MB por token en FP16, lo que supone aproximadamente 9 GB para llenar 65.536 tokens de contexto. Este dato es una estimación, no una cifra oficial del modelo.
- Opciones de despliegue: vLLM (usado en el propio pipeline de entrenamiento, con FlashAttention 2), TGI y SGLang. Para CPU o equipos modstos sería necesario convertir a GGUF y usar llama.cpp u Ollama, algo que el autor no ha publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Dado que el autor no publica resultados de evaluación, los datos de rendimiento no son comparables. Se ofrece únicamente la comparación estructural con alternativas de tamaño similar. Las cifras de los modelos de referencia proceden de sus especificaciones públicas y pueden variar según la versión.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-300-LH-27b-z-iter2-epoch3 | 4,54B | 65.536 en inferencia (300.000 en entrenamiento) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (no confirmado exactamente) | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Qwen3-4B | ~4,0B | 32.768 nativo, extensible a 131.072 | Apache 2.0 | Amplia |
| Llama-3.2-3B | 3,2B | 128.000 | Llama 3.2 Community License | Amplia |
| Phi-4-mini | ~3,8B | 128.000 | MIT | Amplia |

No hay datos de rendimiento publicados que permitan comparar MMLU, HumanEval, GSM8K u otras métricas frente a estos modelos.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni licencia, ni idiomas declarados, ni pipeline asignado. Esto impide evaluar su idoneidad para cualquier uso comercial.
- Licencia no especificada: al no declararse licencia, no se puede asumir permiso de uso comercial. Además, la licencia del modelo base Qwen/Qwen3.5-4B condiciona la del derivado, y tampoco está documentada aquí.
- Riesgo de alucinación: no evaluado. Al ser un modelo pequeño ajustado por RL sin datos de evaluación publicados, el riesgo es desconocido y potencialmente alto en dominios especializados.
- Sesgos: no disponibles. No se ha publicado información sobre la composición del dataset ni sobre análisis de sesgo.
- Idioma: se desconoce el soporte multilingüe efectivo; el pipeline de entrenamiento usa un juez externo en inglés y parsers de la familia Qwen, pero no hay confirmación.
- Comportamiento tras RL: no se ha verificado si el ajuste por refuerzo ha degradado capacidades del modelo base (por ejemplo, tool calling o razonamiento), algo habitual en pipelines de RL con juez automático.
- Longitud de contexto en producción: aunque el entrenamiento usó `seq_len` = 300.000, la inferencia está configurada con `max_model_len` = 65.536. No hay evidencia de que el modelo mantenga calidad en la ventana completa tras el ajuste.
- Reproducibilidad: la configuración hace referencia a rutas locales (`/NHNHOME/...`) y a variables de entorno (`HF_TOKEN`, `JUDGE_BASE_URL`, `JUDGE_API_KEY`), además de depender de un juez propietario, lo que dificulta reproducir el entrenamiento tal cual.
- Cero adopción: 0 descargas y 0 "likes" en el momento de la consulta; sin evidencia de uso por terceros.
- Advertencia para producción: se desaconseja su uso en entornos productivos sin una evaluación propia previa y sin aclaración de licencia por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Stage-org/4b-300-LH-27b-z-iter2-epoch3
- Dataset de entrenamiento referenciado: `Stage-org/4b-300-LH-27b-z-iter2` (referencia textual en la model card; no se ha localizado una URL válida)
- Modelo base: `Qwen/Qwen3.5-4B` (referencia textual en la model card)
- Paper, blog, repositorio o demo: no disponible

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a portales de ofertas de prácticas sin relación con el proyecto, por lo que se omiten.
