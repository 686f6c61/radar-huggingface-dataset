# vrfai/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una cuantización en FP8 dinámico (W8A8) del modelo multimodal Qwen3.8-27B, publicada por el usuario vrfai. El modelo base, desarrollado por el equipo de Qwen, es un modelo denso de 27 356 millones de parámetros con arquitectura híbrida que combina atención transformer con Gated DeltaNet, e integra una torre de visión para procesar imágenes y vídeos. Esta versión cuantizada reduce el peso de 52 GB a 28,3 GB, lo que facilita el despliegue en hardware con menos memoria sin necesidad de reentrenar.

La cuantización se ha realizado con llmcompressor 0.13.0, manteniendo en bf16 las capas más sensibles a la precisión: el `lm_head`, la torre de visión y las proyecciones `in_proj_a`/`in_proj_b` del Gated DeltaNet. Los benchmarks publicados sobre estos pesos (ERQA 0.5925 y RealWorldQA 0.8248) se obtuvieron con decodificación greedy y thinking mode activado. El modelo requiere vLLM >= 0.27.1 y se ha validado en una NVIDIA H100 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y torre de visión (Qwen3.8-27B) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8) con SmoothQuant (alpha 0.8); capas seleccionadas en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (serialización compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B se construye sobre la arquitectura de Qwen3.5, incorporando una capa de atención híbrida que combina atención por ventana con Gated DeltaNet, un mecanismo de recurrencia lineal que mantiene un estado por secuencia. Esta capa es especialmente sensible a errores de cuantización, por lo que las proyecciones que generan los coeficientes de decaimiento y la regla delta (`in_proj_a` y `in_proj_b`) se mantienen en bf16. La torre de visión, que supone unos 456 millones de parámetros, también se conserva en bf16 para no degradar la comprensión multimodal.

El proceso de cuantización utilizó llmcompressor 0.13.0 con el esquema FP8_DYNAMIC, que aplica escalas por canal en los pesos y por token en las activaciones. Se empleó SmoothQuant con alpha 0.8 y un conjunto de calibración de 512 muestras de `abisee/cnn_dailymail` con 2048 tokens cada una. En total, el 93,28 % de los pesos de capas lineales se cuantizaron a FP8, mientras que el 6,72 % restante (207 módulos) permanece en bf16. No se dispone de información detallada sobre el preentrenamiento del modelo base (número de tokens, composición del dataset o técnicas de alineación como RLHF o DPO).

## Capacidades

- Comprensión multimodal nativa: procesa imágenes y vídeos, además de texto, gracias a la torre de visión integrada.
- Razonamiento con thinking mode: el modo de pensamiento está activado por defecto y puede desactivarse por petición; la profundidad del razonamiento se ajusta con el parámetro `reasoning_effort`.
- Ejecución de agentes: el modelo base está diseñado para tareas agénticas de largo horizonte, con planificación autónoma y manejo de feedback del entorno.
- Control flexible del razonamiento: permite conservar el contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con herramientas de desarrollo: soporta integración con harnesses y entornos populares (vLLM, SGLang, TokenSpeed, entre otros).
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- Análisis de imágenes y vídeos en producción: el modelo puede extraer información de capturas de pantalla, diagramas técnicos o secuencias de vídeo, y generar descripciones o respuestas basadas en ese contenido. Su tamaño reducido (28,3 GB) permite desplegarlo en una sola GPU de 32 GB o más.
- Agentes autónomos con razonamiento multi-paso: gracias al thinking mode y a la arquitectura Gated DeltaNet, el modelo puede planificar y ejecutar secuencias de acciones complejas, como navegar por una interfaz o interactuar con APIs, manteniendo el estado a lo largo de la conversación.
- Generación de código asistida con razonamiento: el modelo base destaca en tareas de programación; la versión cuantizada conserva esta capacidad con una huella de memoria menor, adecuada para entornos de desarrollo con GPUs de gama media-alta.
- Investigación científica y análisis STEM: la comprensión de imágenes y vídeos, junto con el razonamiento matemático, lo hace útil para interpretar gráficos, resultados experimentales o material didáctico.
- Automatización de tareas profesionales: puede redactar informes, resumir documentos largos o extraer conclusiones de material multimodal, con la ventaja de un contexto amplio (aunque no se ha especificado la longitud exacta).
- Sistemas de diálogo con memoria de razonamiento: al conservar el contexto de pensamiento histórico, es adecuado para asistentes que necesitan recordar pasos de razonamiento previos en conversaciones largas.

## Benchmarks y rendimiento

Los siguientes resultados se midieron sobre los pesos cuantizados, con decodificación greedy (temperatura 0) y thinking mode activado, en una NVIDIA H100 80 GB con vLLM 0.27.1.

| Tarea | Puntuacion |
|---|---|
| ERQA | 0.5925 |
| RealWorldQA | 0.8248 |

No se han publicado resultados comparativos con el modelo base en bf16 ni con otros modelos en la información proporcionada.

## Requisitos de hardware

- Tamaño de pesos cuantizados: 28,3 GB, lo que requiere al menos 32 GB de VRAM para cargar el modelo completo en FP8 (por ejemplo, NVIDIA A100 40 GB, H100 80 GB o RTX 6000 Ada).
- No cabe en GPUs de consumo con 24 GB o menos (RTX 4090, RTX 3090) sin técnicas adicionales de offloading o cuantización a menor precisión, que no están contempladas en esta versión.
- Runtime recomendado: vLLM >= 0.27.1, que lee automáticamente el formato de cuantización desde `config.json` sin necesidad de flags adicionales.
- Se recomienda ajustar `max_num_seqs` a 64 (o menos) debido a que el Gated DeltaNet mantiene un bloque de estado por secuencia en decodificación.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, otros Qwen3.8 cuantizados o modelos multimodales de tamaño similar) en la información proporcionada. La comparativa natural sería contra el modelo base Qwen3.8-27B en bf16, que ocupa 52 GB y no requiere vLLM >= 0.27.1, pero no se han publicado mediciones de rendimiento relativas entre ambos.

## Limitaciones y advertencias

- Al ser una cuantización FP8, puede existir una degradación sutil en tareas de alta precisión numérica o razonamiento largo, aunque las capas más sensibles se mantienen en bf16.
- La longitud de contexto no está especificada en la información disponible; se recomienda verificar la configuración del modelo base antes de usarlo en aplicaciones que requieran ventanas muy largas.
- Los benchmarks publicados se obtuvieron con decodificación greedy; el rendimiento con sampling puede variar.
- El modelo requiere vLLM >= 0.27.1; versiones anteriores no son compatibles con la arquitectura `Qwen3_5ForConditionalGeneration`.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web puede reflejar sesgos comunes de los corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda revisar los términos del modelo base original.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/vrfai/Qwen3.8-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
