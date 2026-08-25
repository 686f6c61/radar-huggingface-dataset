# vwdubb/Gemma-4-31B-StyleTune-FP8

## Resumen

Gemma-4-31B-StyleTune-FP8 es una cuantización en punto flotante de 8 bits (FP8) del modelo Gemma-4-31B-StyleTune, un finetune quirúrgico creado por Gryphe sobre el modelo base Gemma 4 31B de Google. El finetune original modifica únicamente una única capa, la proyección de salida (`lm_head`), con el objetivo de cambiar el estilo de escritura del modelo sin alterar el resto de sus capacidades. Según el autor, este ajuste reduce en un 60 % la aparición de clichés y produce respuestas con un vocabulario significativamente distinto al del modelo base.

Esta versión concreta, publicada por el usuario vwdubb, aplica la cuantización FP8 mediante la librería compressed-tensors, lo que reduce el peso del modelo a 36,1 GB (frente a los ~65 GB de la versión en BF16) y facilita su despliegue en hardware con VRAM limitada. El modelo se distribuye con licencia Apache 2.0 y está orientado a tareas de generación de texto, escritura creativa, roleplay y conversación instructiva, manteniendo intactas las capacidades de razonamiento, conocimiento y seguimiento de instrucciones del Gemma 4 31B original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Gemma 4 31B) |
| Parámetros totales | 32.682.408.020 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible en el modelo; el base Gemma 4 31B soporta hasta 256K tokens |
| Tipos de cuantización | FP8 (compressed-tensors) |
| Idiomas soportados | En (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 31B, un transformer denso con 60 capas, atención multi-cabeza y MLPs, tal como lo describe el autor del finetune original. El finetune de estilo (StyleTune) congeló todos los tensores excepto la capa `lm_head` (la proyección de salida que decide el siguiente token), que fue entrenada con un conjunto de datos 100% narrativo, sin datos instructivos, durante una sola noche en hardware de consumo. El objetivo era modificar únicamente el estilo de escritura, manteniendo intactas las capacidades de razonamiento, conocimiento y comprensión del modelo base.

La versión FP8 aquí descrita aplica una cuantización de 8 bits en punto flotante sobre todos los pesos, utilizando la librería compressed-tensors. Esta técnica reduce el tamaño del modelo de ~65 GB a ~32 GB, lo que facilita su carga en GPUs con 36 GB o más de VRAM. No se ha documentado si la cuantización introduce pérdidas de precisión significativas, aunque en la práctica se espera que el impacto sea mínimo para tareas de generación de texto.

## Capacidades

- Generación de texto libre con estilo literario y creativo, notablemente reducido en clichés comparado con el modelo instructivo base.
- Conversación instructiva: mantiene el formato de chat nativo de Gemma 4, aplicando automáticamente la plantilla de conversación.
- Escritura de ficción, roleplay y diálogos: el finetune está optimizado para narrativa y personajes.
- Razonamiento, conocimiento general y seguimiento de instrucciones: según el autor, estas capacidades no residen en `lm_head` y permanecen intactas.
- Capacidad de procesar contexto largo (heredada del modelo base, hasta 256K tokens, aunque no verificado en este finetune).
- No se ha confirmado soporte para tool calling, agentes o visión; el modelo es exclusivamente de texto.

## Casos de uso

- **Escritura creativa asistida**: generar prosa narrativa, descripciones y diálogos con un estilo menos predecible, útil para autores que buscan inspiración o variación estilística. La reducción de clichés permite obtener textos más originales.
- **Roleplay y simulación de personajes**: dado su entrenamiento con datos narrativos, el modelo es adecuado para juegos de rol textuales o asistentes de escritura de personajes, manteniendo coherencia y estilo en conversaciones de largo recorrido.
- **Redacción de guiones y diálogos**: puede producir intercambios verbales naturales y con matices, ideal para guiones de cortos, teatro o doblaje, donde la variedad de voces es importante.
- **Generación de contenido para blogs o redes sociales**: permite crear borradores con un tono distintivo y menos fórmulas, útil para creadores de contenido que buscan diferenciarse.
- **Asistente de escritura técnica**: aunque el finetune se enfoca en estilo, conserva las capacidades de razonamiento del modelo base, por lo que puede redactar informes, documentación o explicaciones técnicas con un estilo más personal y menos robótico.
- **Traducción literaria**: al tener un estilo más natural en inglés, puede ser útil para traducir textos literarios al inglés con una voz propia, aunque su soporte de idiomas se limita al inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del finetune original reporta métricas internas de estilo (60% menos de clichés, 21.7% de trigramas compartidos con el base), pero no hay comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: la versión FP8 ocupa ~32 GB de pesos; para inferencia se recomienda al menos 40 GB de VRAM para dejar margen de activaciones y overhead. En GPUs con 24 GB (p. ej., RTX 3090/4090) podría ejecutarse con técnicas de offloading, pero no se garantiza un rendimiento fluido.
- **GPUs recomendadas**: A100 (40/80 GB), H100 (80 GB), o GPUs profesionales con 48 GB (A6000, RTX A6000). Para consumo, una RTX 4090 (24 GB) puede servir con cuantización adicional, pero no es la opción óptima.
- **Opciones de despliegue**: vLLM y TGI soportan FP8 mediante compressed-tensors, así como llama.cpp con soporte de FP8. También puede ejecutarse con Hugging Face Transformers en modo de precisión FP8.
- **Latencia y throughput**: no hay datos públicos. En una A100, se espera una latencia de entre 20-50 ms por token para una longitud de salida de 512 tokens, dependiendo del batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Características |
|---|---|---|---|---|
| Gemma-4-31B-StyleTune (original) | 32,7B | 256K | Apache-2.0 | Finetune de estilo, sin cuantizar |
| Gemma-4-31B-StyleTune-FP8 (este) | 32,7B | 256K (heredado) | Apache-2.0 | Cuantización FP8, mismo finetune |
| Gemma 4 31B instruct (base) | 32,7B | 256K | Apache-2.0 | Modelo instructivo generalista |
| Llama 3.1 70B | 70B | 128K | Llama License | Más grande, pero con licencia restrictiva |

No hay comparativas directas con otros finetunes de estilo (como MythoMax o modelos de roleplay) porque no se dispone de datos de rendimiento.

## Limitaciones y advertencias

- El modelo solo está entrenado en inglés; no se recomienda su uso en otros idiomas sin adaptación.
- Al ser un finetune de estilo, puede presentar un sesgo hacia un tono narrativo o creativo, incluso cuando se le piden respuestas técnicas o factuales.
- Riesgo de alucinación inherente a los modelos generativos; aunque el finetune no reduce la capacidad de razonamiento, no se ha evaluado específicamente su fiabilidad factual.
- La cuantización FP8 puede introducir pequeñas degradaciones en tareas que requieren alta precisión numérica (p. ej., matemáticas complejas), aunque no se ha documentado.
- No se han verificado las capacidades de tool calling, agentes o visión; el modelo es puramente texto.
- El tamaño de contexto de 256K es heredado del modelo base, pero no se ha probado en este finetune; se recomienda validar con casos de uso reales.

## Enlaces

- [Página de HuggingFace del modelo](https://huggingface.co/vwdubb/Gemma-4-31B-StyleTune-FP8)
- [Modelo base StyleTune (Gryphe)](https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune)
- [Documentación de Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
