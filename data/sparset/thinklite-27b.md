# Sparset/Thinklite-27B

## Resumen

Thinklite-27B es un ajuste fino (fine-tune) del modelo multimodal Qwen/Qwen3.8-27B desarrollado por Sparset, orientado a reducir el coste de razonamiento sin sacrificar precisión. El modelo mantiene la arquitectura, el tokenizador y el vocabulario del modelo base, pero ha sido entrenado para generar cadenas de razonamiento (reasoning traces) mucho más cortas: según la model card, con `reasoning_effort="xhigh"` emplea un 47 % menos de tokens de razonamiento que Qwen3.8-27B y mantiene el 99,6 % de su precisión media (89,8 frente a 90,2) sobre seis benchmarks.

El problema que resuelve es el coste en latencia y tokens de los modelos con modo "thinking": el tiempo hasta la respuesta final (TTFO, time-to-final-output) se reduce aproximadamente a la mitad (2,0x) a máxima effort y a 1,3x con `reasoning_effort="low"`. Con 27.781.427.952 parámetros totales (dato real de safetensors) y pipeline `image-text-to-text`, el modelo conserva la capacidad multimodal del base y se distribuye bajo licencia Apache 2.0.

Es relevante ahora porque el coste de inferencia de los modelos razonadores se ha convertido en el cuello de botella principal en producción: reducir a la mitad los tokens generados por petición abarata el despliegue y mejora la experiencia de usuario sin cambiar de arquitectura ni de infraestructura. Existe además una versión cuantizada oficial, Thinklite-27B-GGUF (Q4_K_M de 16,5 GB), para llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (16,5 GB) en el repo oficial Thinklite-27B-GGUF; otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,7 GB); GGUF en el repo cuantizado |

## Arquitectura y entrenamiento

Thinklite-27B reutiliza la arquitectura del modelo base Qwen/Qwen3.8-27B: según la model card, "all four models share the Qwen3.8-27B architecture", por lo que comparte tokenizador, capas y velocidad de decodificación (26,3 tokens/s frente a 26,2 del base para un solo usuario en la misma GPU). El pipeline declarado es `image-text-to-text`, lo que confirma que conserva la entrada de imagen del base. No se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo de atención.

El entrenamiento es un ajuste fino sobre Qwen3.8-27B orientado a "efficient reasoning": el objetivo es comprimir las trazas de razonamiento preservando la respuesta final. La model card reporta que el modelo mantiene el 99,6 % de la precisión media del base con `xhigh` y el 97,5 % con `low` (2,2 puntos por debajo). No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" controlable mediante `reasoning_effort` (`xhigh` y `low` documentados).
- Comprensión de imagen y texto (pipeline `image-text-to-text`), heredada del modelo base.
- Razonamiento eficiente: genera aproximadamente la mitad de tokens de salida que el base a máxima effort, con TTFO 2x menor.
- Conversación multi-turno (tag `conversational`).
- Integración con `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, código y matemáticas: no confirmadas explícitamente en la información disponible; al derivar de Qwen3.8-27B es probable que las herede, pero no se documentan en la model card.

## Casos de uso

- Depuración de código asistida: la model card muestra un caso real con un prompt de depuración (código con reintentos y dos logs) en el que el modelo identifica los cargos duplicados a reembolsar y la corrección; Thinklite-27B tarda 2:36,9 con 3.381 tokens frente a 11:04,9 y 14.313 tokens del base (4,2x menos) sirviendo 20 peticiones concurrentes en una NVIDIA RTX PRO 6000.
- Atención al cliente con razonamiento: el modo `low` reduce un 28 % los tokens de razonamiento con el 97,5 % de la precisión del base, adecuado para conversaciones multi-turno donde la latencia importa más que la profundidad analítica.
- Pipelines de CI/CD con presupuesto de tokens: al recortar a la mitad los tokens de salida en modo `xhigh`, el coste por petición se reduce proporcionalmente en despliegues con facturación por token.
- Análisis de documentos con imagen: al conservar el pipeline `image-text-to-text`, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Despliegue en hardware de consumo: la versión GGUF Q4_K_M de 16,5 GB permite ejecución local con llama.cpp u Ollama manteniendo el 99,3 % de la precisión del base cuantizado de la misma forma y un 48 % menos de razonamiento.
- Evaluación comparativa de estrategias de razonamiento: útil como referencia para medir el impacto de la compresión de trazas en precisión y latencia frente al modelo base.

## Benchmarks y rendimiento

La model card reporta métricas agregadas sobre seis benchmarks (no se detallan los nombres ni los resultados individuales en la información disponible):

| Metrica | Thinklite-27B | ThinkingCap-Qwen3.8-27B | Swift-1.5-Qwen3.8-27b |
|---|---|---|---|
| Razonamiento vs base (`xhigh`) | -47,0 % | -45,8 % | -35,6 % |
| TTFO speed-up (`xhigh`) | 2,0x | 1,7x | 1,6x |
| Razonamiento vs base (`low`) | -28,0 % | -16,4 % | -12,7 % |
| TTFO speed-up (`low`) | 1,3x | 1,2x | 1,1x |

Precisión media: 89,8 de Thinklite-27B frente a 90,2 de Qwen3.8-27B en modo `xhigh` (99,6 % retenido). En modo `low`, 2,2 puntos por debajo del base (97,5 % retenido). Velocidad de decodificación: 26,3 tokens/s frente a 26,2 del base para un solo usuario en la misma GPU. No se publican resultados por benchmark individual (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (safetensors, ~55,7 GB de pesos): no disponible con exactitud; requiere al menos ~56 GB solo para pesos, por lo que encaja en GPU de 80 GB (A100, H100) o en configuraciones multi-GPU.
- Versión cuantizada oficial GGUF Q4_K_M: 16,5 GB, apta para GPU de consumo con 24 GB (RTX 4090, RTX 3090) y para ejecución en CPU con llama.cpp u Ollama.
- GPU empleada en las mediciones de la model card: NVIDIA RTX PRO 6000 sirviendo 20 peticiones concurrentes.
- Opciones de despliegue: `transformers`, llama.cpp y Ollama (vía GGUF), endpoints compatibles; vLLM y TGI no se mencionan en la información disponible.
- Throughput medido: 26,3 tokens/s de decodificación por usuario único en la GPU de referencia; el TTFO mejora en proporción directa a los tokens generados.

## Comparativa con modelos similares

| Modelo | Base | Razonamiento vs base (`xhigh`) | TTFO speed-up (`xhigh`) | Licencia |
|---|---|---|---|---|
| Thinklite-27B | Qwen3.8-27B | -47,0 % | 2,0x | Apache 2.0 |
| ThinkingCap-Qwen3.8-27B | Qwen3.8-27B | -45,8 % | 1,7x | no disponible |
| Swift-1.5-Qwen3.8-27b | Qwen3.8-27B | -35,6 % | 1,6x | no disponible |
| Qwen3.8-27B (base) | - | referencia | 1,0x | no disponible |

Los tres modelos comparados comparten la arquitectura Qwen3.8-27B y la misma velocidad de decodificación, por lo que la diferencia en TTFO se explica por el número de tokens generados. No se dispone de datos de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La reducción de tokens de razonamiento implica una pérdida de precisión medible: 0,4 puntos en `xhigh` y 2,2 puntos en `low` respecto al base. En tareas que dependen de cadenas de razonamiento largas, la compresión puede degradar resultados no cubiertos por los seis benchmarks reportados.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas en la información disponible.
- La longitud de contexto no se especifica; conviene verificar la del modelo base Qwen3.8-27B antes de desplegar en escenarios de contexto largo.
- No se confirma explícitamente el soporte de tool calling, agentes o matemáticas; la herencia del base es probable pero no está documentada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.8-27B conviene revisar también las condiciones del modelo base.
- El repo pesa 55,7 GB en safetensors; el despliegue en producción requiere planificación de almacenamiento y ancho de banda además de la VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sparset/Thinklite-27B
- Versión cuantizada GGUF: https://huggingface.co/Sparset/Thinklite-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Vídeo comparativo side-by-side: https://huggingface.co/Sparset/Thinklite-27B/resolve/main/thinklite-side-by-side.mp4
