# WineryLabs/Winery-Qwen3.5-9B-GrandCru-GGUF

## Resumen

Winery-Qwen3.5-9B-GrandCru es un "model soup" (fusión por media ponderada de pesos) construido por WineryLabs sobre tres fine-tunes de Qwen3.5-9B. No es un modelo entrenado desde cero: parte de cuatro pesos base (Qwen/Qwen3.5-9B, XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2 y DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED) y combina los tres mejores donantes mediante una media lineal ponderada por su puntuación media de benchmark, usando la herramienta Winery fusion compiler.

El modelo resultante es denso, con 8.953.803.264 parámetros (unos 8,95B, comercializado como 9B) y se distribuye exclusivamente en formato GGUF, en cuantización Q8_0, con un tamaño de repositorio de 9,5 GB. La operación clave es que los pesos de cada donante se escalan por su propia media de benchmark antes del promedio, de modo que el donante más fuerte pesa más en la mezcla final.

Es relevante ahora para desarrolladores que quieren ejecutar un modelo de ~9B con buen rendimiento en razonamiento y matemáticas en hardware de consumo: según el banco de pruebas local del autor, el "soup" supera tanto al mejor donante aislado como al Qwen3.5-9B stock en MMLU, ARC-Challenge y GSM8K. Se integra en llama.cpp, Jan, LM Studio y la aplicación Winery.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen3.5 (los pesos conservan la arquitectura del modelo base Qwen3.5-9B tras el merge) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico disponible en el repositorio) |
| Idiomas soportados | no disponible (los metadatos no especifican idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 9,5 GB |
| Library | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo no se entrena: se genera mediante un "model soup" con fusión lineal (linear merge). El script de la receta define `default linear 84.9,83.4,83.2`, es decir, cada donante se pondera por su propia media de benchmark y los pesos se promedian de forma ponderada. Los tres donantes y sus pesos son: XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (84,9), Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2 (83,4) y DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED (83,2). El autor indica que seleccionó estos tres de entre diez fine-tunes de Qwen3.5-9B evaluados.

La arquitectura subyacente es la de Qwen3.5-9B. Según las fuentes web sobre la familia Qwen3.5, esta serie integra aprendizaje multimodal con "early fusion" sobre billones de tokens multimodales y mejoras en eficiencia arquitectónica y escala de aprendizaje por refuerzo; sin embargo, esta build concreta se publica con pipeline `text-generation` y en GGUF, sin confirmación de que las capacidades de visión del modelo base se preserven en el merge. No se dispone de información sobre el volumen de tokens de entrenamiento de cada donante, la composición del dataset ni si se aplicó RLHF o DPO (los donantes llevan nombres que sugieren destilación de razonamiento de Claude 4.6, pero no se aportan detalles). La innovación destacable es el propio proceso de fusión ponderada por benchmark y la herramienta Winery fusion compiler.

## Capacidades

- Generación de texto conversacional (tarea declarada del pipeline: text-generation).
- Razonamiento y matemáticas: el autor reporta GSM8K 90,0 en su banco local (0-shot, thinking off), frente a 66,7 del Qwen3.5-9B stock.
- Razonamiento general: MMLU 70,0 y ARC-Challenge 96,7 en el mismo banco local.
- Modo "thinking": el benchmark se ejecutó con thinking desactivado; la familia Qwen3.5 y los donantes con "THINKING" en el nombre sugieren soporte de razonamiento extendido, aunque no se confirma explícitamente para esta build.
- Capacidad reducida de rechazo: al incluir un donante "uncensored/abliterated", el modelo rechaza menos que el Qwen stock.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los metadatos no listan idiomas).
- Capacidades especiales (visión, audio): no disponible para esta build GGUF.

## Casos de uso

- Asistente conversacional local: desplegado en llama.cpp o LM Studio, sirve como chatbot de escritorio en hardware de consumo al ocupar 9,5 GB en Q8_0.
- Generación y asistencia de código en local: al ser un 9B denso con buen rendimiento en MMLU, puede usarse como copiloto en entornos sin conexión, siempre que se integre mediante herramientas externas.
- Razonamiento matemático y resolución de problemas: el autor reporta GSM8K 90,0, lo que lo hace adecuado para tutoría o verificación de cálculos paso a paso.
- Prototipado rápido de aplicaciones de IA: el GGUF permite arrancar inferencia en minutos con `llama-cli` o la app Winery sin infraestructura de GPU dedicada.
- Evaluación comparativa de técnicas de model soup: sirve como referencia práctica de cómo una fusión ponderada por benchmark supera a sus donantes individuales.
- Sustitución del Qwen3.5-9B stock en "pipelines" existentes: al compartir arquitectura y licencia, se puede intercambiar el archivo GGUF en despliegues que ya usen llama.cpp, Jan o LM Studio.
- Investigación sobre alineación y rechazo: el componente "uncensored" lo convierte en objeto de estudio para medir cómo la fusión afecta a las tasas de rechazo respecto al modelo base.

## Benchmarks y rendimiento

Datos del banco de pruebas local del autor: MMLU (200 preguntas), ARC-Challenge (150), GSM8K (60), 0-shot chat, thinking desactivado, ejecutado con llama-server. El propio autor advierte de que son cifras de muestra pequeña y orientativas, no resultados de leaderboard.

| Modelo | MMLU | ARC-C | GSM8K | Media |
|---|---|---|---|---|
| Winery 9B Grand Cru (este) | 70,0 | 96,7 | 90,0 | 85,6 |
| Mejor donante (MiMo-V2.6 Distill) | 69,5 | 95,3 | 90,0 | 84,9 |
| Qwen/Qwen3.5-9B (stock) | 69,5 | 94,7 | 66,7 | 77,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0 el archivo pesa 9,5 GB; con caché KV y overhead de contexto, se recomienda reservar en torno a 11-12 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para margen amplio y contextos largos.
- ¿Cabe en GPU de consumo? Sí. Cabe holgadamente en GPUs de 16 GB o más (RTX 4080/4090, RTX 3090, RTX 5080). En tarjetas de 12 GB puede requerir reducir el contexto o recurrir a cuantizaciones menores que no están publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (builds recientes con soporte de Qwen3.5), Jan, LM Studio y la aplicación Winery. Se ha probado en Jan. También es importable en gestores compatibles con GGUF.
- Latencia y throughput: no disponible (no se aportan cifras de tokens/s).
- Comando de referencia del autor: `llama-cli -m Winery-Qwen3.5-9B-GrandCru-Q8_0.gguf -cnv`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | MMLU | ARC-C | GSM8K | Media | Licencia |
|---|---|---|---|---|---|---|---|
| Winery 9B Grand Cru | 8,95B | GGUF (Q8_0) | 70,0 | 96,7 | 90,0 | 85,6 | apache-2.0 |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B | no disponible | 69,5 | 95,3 | 90,0 | 84,9 | no disponible |
| Qwen/Qwen3.5-9B (stock) | ~9B | no disponible | 69,5 | 94,7 | 66,7 | 77,0 | apache-2.0 |

No se dispone en la información proporcionada de datos comparativos frente a otros modelos de ~9B ajenos a esta familia (por ejemplo Llama o Gemma equivalentes).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta sesgos específicos.
- Riesgo de alucinación: no cuantificado. Como todo LLM de ~9B, puede generar afirmaciones incorrectas con seguridad, especialmente fuera de sus dominios de entrenamiento.
- Rechazo reducido: uno de los donantes es un tune "uncensored/abliterated", por lo que el modelo rechaza menos peticiones que el Qwen stock. El autor declara que la responsabilidad de uso recae en el usuario.
- Subida de contexto e idioma: se desconoce la longitud de contexto efectiva y los idiomas soportados; en los metadatos aparecen como no disponibles.
- Restricciones de licencia: licencia apache-2.0, permisiva para uso comercial, pero conviene verificar las licencias de los donantes individuales (algunos no indican licencia en la información recogida).
- Advertencia sobre benchmarks: las cifras proceden de un banco propio con muestras pequeñas (60-200 preguntas) y deben tratarse como orientativas, no como resultados de leaderboard.
- Trazabilidad: al ser un merge de cuatro modelos, los datos de entrenamiento y las decisiones de alineación de cada donante no están documentados de forma consolidada.
- Producción: el repositorio tiene solo Q8_0 y muy pocas descargas (26 al momento de la ficha), por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WineryLabs/Winery-Qwen3.5-9B-GrandCru-GGUF
- Perfil de WineryLabs: https://huggingface.co/WineryLabs/models
- Winery fusion compiler: https://zo.pub/zandy/winery
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Donante XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2: https://huggingface.co/Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Donante DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Repositorio GitHub de referencia sobre Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Qwen3.5-9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
