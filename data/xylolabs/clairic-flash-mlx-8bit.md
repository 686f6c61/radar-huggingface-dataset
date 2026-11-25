# Xylolabs/clairic-flash-MLX-8bit

## Resumen

Clairic Flash MLX 8-bit es una cuantización en 8 bits del modelo de lenguaje Cloudflare/clairic-flash, un transformer denso de 9B parámetros construido sobre la arquitectura Qwen3.5. La conversión la firma Xylolabs mediante su herramienta de cuantización MLX, y está pensada para ejecutarse con `mlx-lm` en hardware Apple Silicon. El paquete incluye únicamente la torre de lenguaje: la torre de visión y la cabeza de scoring del modelo original quedan excluidas de esta distribución.

El modelo resuelve el problema de desplegar un LLM de 9B en Macs con memoria unificada, manteniendo una fidelidad muy alta respecto al BF16 original (98,8 % de acuerdo top-1 en WikiText-2 y 99,0 % en un conjunto held-out). Con 9,51 GB de pesos, encaja con contexto de 256K en equipos desde 36 GB de memoria unificada, lo que lo hace relevante para desarrolladores que trabajan en local sin GPU dedicada.

La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de la torre de visión limita las capacidades a generación de texto y conversación. No se han publicado especificaciones detalladas de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 |
| Parametros totales | 8.953.801.728 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (según tabla de hardware del autor) |
| Tipos de cuantizacion | 8 bits (MLX); el autor no publica otras variantes en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx-lm` 0.32.2) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clairic-flash es un transformer denso de 9B parámetros con arquitectura Qwen3.5, según declara el autor de la cuantización. Esta distribución es una conversión de pesos a 8 bits en formato MLX; no se ha reentrenado ni ajustado, por lo que las capacidades heredadas dependen íntegramente del modelo original. La cuantización se ha validado midiendo la divergencia KL y el acuerdo top-1 frente a la versión BF16: 0,001655 de KL y 98,848 % top-1 en WikiText-2, 0,004075 y 98,461 % en un conjunto de chat, y 0,000569 y 99,039 % en held-out.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base aplicó RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura Qwen3.5. La conversión excluye la torre de visión y la cabeza de scoring del modelo original, por lo que esta variante es estrictamente de lenguaje.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (`mlx_lm.chat`).
- Razonamiento y comprensión de lenguaje natural heredados del modelo base de 9B.
- Generación de código y tareas de instrucción general, asumiendo las capacidades del Qwen3.5 subyacente.
- Capacidad de contexto largo: hasta 256K tokens según la tabla de hardware del autor.
- No incluye visión: la torre visual del modelo original ha sido eliminada en esta conversión.
- No incluye cabeza de scoring: no apta para tareas de ranking o re-ranking nativo.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el autor no declara idiomas soportados.
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta con `mlx_lm.chat` sobre Apple Silicon, permitiendo un chatbot privado sin conexión ni GPU dedicada, con 9,5 GB de pesos.
- Procesamiento de documentos largos: con 256K de contexto, puede resumir contratos, informes o expedientes completos en una sola pasada, como ilustra el ejemplo de factura de la model card.
- Generación de código en flujos de desarrollo local: un modelo de 9B con licencia Apache 2.0 puede integrarse en editores o scripts de automatización en máquinas de desarrollo con memoria unificada.
- Extracción de información estructurada: tareas de parsing de facturas, correos o formularios, aprovechando el contexto largo para incluir ejemplos few-shot extensos.
- Prototipado de pipelines de IA generativa: al ser una cuantización fiel al BF16 (más del 98 % de acuerdo top-1), sirve para validar prompts y flujos antes de migrar a infraestructura con GPU.
- Investigación en eficiencia de cuantización: el modelo incluye métricas de divergencia KL y top-1 frente a BF16, útil como referencia para estudiar el impacto de la cuantización 8-bit en MLX.
- Despliegue en estaciones de trabajo Mac Studio: la tabla de hardware del autor cubre equipos desde 36 GB hasta 512 GB de memoria unificada, lo que permite servir el modelo en entornos de oficina o laboratorio.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad de cuantización frente a BF16, no benchmarks de tareas estándar.

| Metrica | WikiText-2 | Chat | Held-out |
|---|---:|---:|---:|
| Divergencia KL media | 0,001655 | 0,004075 | 0,000569 |
| Acuerdo top-1 | 98,848 % | 98,461 % | 99,039 % |
| Tamano de pesos | 9,51 GB | 9,51 GB | 9,51 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 9,51 GB de pesos en 8-bit, más la caché KV en f16 al contexto usado, más 2 GB de runtime. El autor aplica la regla de que el total debe quedar por debajo del 75 % de la memoria disponible (límite por defecto de GPU en macOS).
- Equipos soportados según el autor: Mac Studio M5 Max (32 y 40 núcleos GPU) con 36, 48, 64 y 128 GB de memoria unificada; Mac Studio M5 Ultra con 96, 256 y 512 GB. En todos los casos se declara contexto de 256K.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta distribución, que es específica de MLX y Apple Silicon.
- Cabe en Apple Silicon consumer de gama alta: sí, desde 36 GB de memoria unificada según la tabla del autor.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 mediante `mlx_lm.generate` y `mlx_lm.chat`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/clairic-flash-MLX-8bit | ~9B | 256K | MLX 8-bit | Apache 2.0 | Solo lenguaje; sin visión ni scoring head |
| Cloudflare/clairic-flash (base) | ~9B | No disponible | BF16 | Apache 2.0 | Incluye torre de visión y scoring head |
| Alternativas de ~9B en MLX | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

La comparación con otras cuantizaciones MLX de modelos de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Esta variante no incluye la torre de visión ni la cabeza de scoring del modelo original; no sirve para tareas multimodales ni de ranking.
- Dependencia exclusiva de MLX y Apple Silicon: no es desplegable en GPU NVIDIA ni en servidores x86 convencionales sin reconversión.
- La cuantización a 8 bits introduce una divergencia pequeña pero no nula frente a BF16 (KL de hasta 0,004 en el conjunto de chat); en tareas sensibles a la precisión conviene validar contra el modelo original.
- No se documentan idiomas soportados; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a un modelo de 9B, no mitigado ni evaluado en la información disponible.
- No hay datos publicados sobre sesgos, filtrado de seguridad ni alineación del modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Cloudflare/clairic-flash antes de un uso comercial.
- El contexto de 256K declarado depende de la memoria del equipo; en configuraciones de 36 GB el margen es ajustado y puede requerir reducir la ventana efectiva.
- El repositorio tiene muy poca tracción (116 descargas, 0 likes) y una única versión publicada; no hay evidencia de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clairic-flash-MLX-8bit
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Licencia: https://huggingface.co/Xylolabs/clairic-flash-MLX-8bit/blob/main/LICENSE
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de la herramienta de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- MLX (Apple): https://github.com/ml-explore/mlx
