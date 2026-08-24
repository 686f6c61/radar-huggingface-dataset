# Vicgrace/qwen25_15b_snip.adtc_submission

## Resumen

El modelo `Vicgrace/qwen25_15b_snip.adtc_submission` es un ajuste fino del modelo Qwen2.5-Instruct de 1,5 mil millones de parámetros, convertido posteriormente al formato GGUF mediante la librería Unsloth. Está pensado para su ejecución eficiente en CPU y GPU de baja capacidad mediante llama.cpp o el ecosistema Ollama, lo que lo hace adecuado para entornos con recursos limitados.

El modelo resuelve el problema de desplegar capacidades conversacionales y de instrucción en hardware modesto, manteniendo un tamaño de solo 1,0 GB en cuantización Q4_K_M. Su relevancia radica en la combinación de la arquitectura Qwen2.5 (con ventana de contexto de 32 768 tokens en el modelo base) y un formato GGUF optimizado para inferencia local. El autor lo etiqueta como compatible con endpoints y orientado a uso conversacional, aunque no se especifica la naturaleza exacta del ajuste fino ni el dataset empleado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5 (1,5B instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible (base Qwen2.5: multilingüe, incluye inglés, chino, español y otros) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, que incorpora las mejoras de la serie Qwen2.5 como embeddings rotativos (RoPE), normalización RMSNorm y un tokenizador eficiente. El modelo base de 1,5B parámetros fue entrenado por Alibaba Cloud con un corpus de varios billones de tokens multilingües, seguido de un ajuste fino supervisado y optimización por preferencias (RLHF/DPO) para producir la variante Instruct.

El proceso de ajuste fino de este repositorio se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados y reducción de memoria. La conversión a GGUF se llevó a cabo posteriormente, produciendo un único archivo cuantizado a 4 bits (Q4_K_M) listo para su uso con llama.cpp. No se proporciona información sobre la composición del dataset de ajuste, el número de pasos de entrenamiento ni si se emplearon técnicas adicionales como LoRA o QLoRA, aunque por el tamaño del repo (1,0 GB) es plausible que se haya usado un método de eficiencia paramétrica.

## Capacidades

- Generación de texto conversacional e instrucciones: el modelo puede responder preguntas, mantener diálogos multi-turno y seguir instrucciones generales.
- Razonamiento básico y matemáticas: hereda las capacidades del Qwen2.5-1.5B-Instruct, que resuelve problemas aritméticos y de lógica sencilla.
- Generación de código: soporta la creación y depuración de fragmentos de código en lenguajes comunes como Python, JavaScript o SQL, aunque con limitaciones propias de su tamaño.
- Multilingüismo: la base Qwen2.5 es multilingüe (más de 29 idiomas), aunque el ajuste fino podría haber modificado la distribución; no hay datos específicos del repo.
- Tool calling: el modelo base Qwen2.5-Instruct soporta function calling, aunque no se verifica en la información disponible.
- Despliegue con Ollama: incluye un Modelfile para su uso directo con Ollama.

## Casos de uso

- **Asistente conversacional ligero**: puede desplegarse en una Raspberry Pi o un portátil antiguo para responder preguntas y mantener diálogos simples, gracias a su tamaño de 1,0 GB y su formato GGUF.
- **Chatbot de atención al cliente para pequeñas empresas**: integrarlo en un servidor con llama.cpp o Ollama para gestionar consultas frecuentes con contexto de hasta 32K tokens, suficiente para historiales largos de conversación.
- **Autocompletado de código en entornos offline**: al soportar generación de código, puede usarse como asistente de programación local en editores como VS Code mediante extensiones compatibles con llama.cpp.
- **Educación y práctica**: ideal para estudiantes que quieran experimentar con modelos de lenguaje sin coste de GPU, ejecutándolo en una CPU con 8 GB de RAM.
- **Prototipado rápido de agentes**: al ser compatible con endpoints y tener capacidad de tool calling heredada, sirve para probar pipelines de agentes en local antes de escalar a modelos mayores.
- **Traducción y resumen de textos**: puede utilizarse para traducir o resumir documentos en varios idiomas, aprovechando su contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta puntuaciones de MMLU, HumanEval, GSM8K ni otros tests estándar. Dado que se basa en Qwen2.5-1.5B-Instruct, se puede esperar un rendimiento inferior al del modelo base original, pero sin datos concretos no se puede afirmar nada con precisión.

## Requisitos de hardware

- **VRAM estimada**: con Q4_K_M (1,0 GB), la inferencia puede ejecutarse en CPU con 6-8 GB de RAM o en GPU con 2-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con 4 GB de VRAM (GTX 1650, RTX 3050, Apple M1/M2) es suficiente; incluso una CPU moderna puede ejecutarlo a velocidad aceptable.
- **Consumer GPU**: sí, cabe en la mayoría de GPUs de consumo desde 2018 y en CPUs con AVX2.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con adaptación GGUF), llama-cpp-python, o servidores compatibles con la API de endpoints.
- **Latencia**: en una CPU moderna, ~10-20 tokens/s; en una GPU como RTX 3060, ~30-50 tokens/s (estimación orientativa para el tamaño de 1,5B).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32K | Apache 2.0 | safetensors | Referencia de rendimiento |
| Vicgrace/qwen25_15b_snip.adtc_submission | 1,5B | 32K (heredado) | no disponible | GGUF | Despliegue local ligero |
| Llama 3.2 1B Instruct | 1,2B | 128K | Llama 3.2 | safetensors, GGUF | Alternativa de menor tamaño |

La comparación directa con el Qwen2.5-1.5B-Instruct original es la más pertinente, ya que el modelo es un ajuste del mismo. La licencia del modelo base es Apache 2.0, pero la del repositorio es desconocida. El modelo de Vicgrace es el único en formato GGUF Q4_K_M, lo que facilita su despliegue con llama.cpp. Llama 3.2 1B ofrece un contexto más largo (128K) pero con menor capacidad lingüística en español.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de 1,5B, tiene mayor tendencia a alucinar hechos y a generar respuestas sesgadas que modelos mayores.
- **Rendimiento limitado**: no es adecuado para tareas complejas de razonamiento, matemáticas avanzadas o generación de código de larga duración.
- **Licencia desconocida**: no se especifica la licencia del repositorio; no se puede garantizar el uso comercial sin permiso del autor.
- **Información de entrenamiento ausente**: no se detalla el dataset de ajuste fino, por lo que no se puede evaluar la calidad ni los sesgos introducidos.
- **Idiomas**: el ajuste fino puede haber reducido el soporte multilingüe original; no hay datos sobre idiomas específicos.
- **Soporte de tool calling no verificado**: la capacidad de function calling del modelo base no está confirmada en el repositorio.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Vicgrace/qwen25_15b_snip.adtc_submission)
- [Repositorio HuggingFace (variante sin snip)](https://huggingface.co/Vicgrace/qwen25_15b_adtc_submission)
- [GitHub adtc-2026-submission](https://github.com/Vicgrace01/adtc-2026-submission)
- [GitHub Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni) (relacionado con la familia Qwen2.5)
- [Unsloth](https://github.com/unslothai/unsloth) (herramienta de entrenamiento utilizada)
