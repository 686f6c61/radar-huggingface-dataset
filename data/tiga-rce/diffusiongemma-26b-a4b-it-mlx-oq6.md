# TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ6

## Resumen

DiffusionGemma 26B A4B Instruct MLX mixed-bit oQ6 es una conversión cuantizada del modelo google/diffusiongemma-26B-A4B-it, publicada por el usuario TiGa-RCE. No se trata de un modelo entrenado desde cero, sino de una redistribución en formato MLX con cuantización afín de 6 bits (grupo de 64) y sobrescrituras de 8 bits en capas seleccionadas, pensada para ejecutarse en el ecosistema MLX de Apple Silicon. El repositorio ocupa 22,1 GB y contiene 25.823.781.228 parámetros totales según los safetensors.

El modelo base pertenece a la familia DiffusionGemma, una variante de Gemma con arquitectura de difusión para generación de texto, según indican las etiquetas del repositorio. La pipeline declarada es image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto). El sufijo A4B en el nombre apunta a una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, aunque este dato no está confirmado en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta una conversión comunitaria de un modelo reciente de Google en un formato específico para hardware Apple; por otro, advierte de que el propio autor no ha verificado el rendimiento ni la calidad de la generación de esta conversión. La licencia declarada es apache-2.0, pero el enlace de licencia del modelo base remite a los términos de Gemma 4, lo que introduce una discrepancia que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | diffusion_gemma (modelo de difusión; detalles no disponibles) |
| Parámetros totales | 25.823.781.228 |
| Parámetros activos | no disponible (el sufijo A4B sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits afín por defecto, grupo de 64, con sobrescrituras de 8 bits en capas seleccionadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 del modelo base) |
| Formato de pesos | MLX safetensors (shards, ~22,09 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Las etiquetas y el nombre indican un modelo de la familia DiffusionGemma, lo que sugiere un enfoque de difusión para la generación, en contraste con la decodificación autorregresiva convencional. El sufijo A4B es coherente con una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parámetros activos sobre un total de 25,8 mil millones, pero no hay confirmación explícita en la documentación consultada.

Respecto al entrenamiento, no se dispone de datos sobre número de tokens, composición del dataset, ni si hubo ajuste por RLHF o DPO. La model card de esta conversión se limita a describir el proceso de cuantización y a señalar su procedencia probable desde mlx-community/diffusiongemma-26B-A4B-it-bf16 en una revisión concreta. El autor indica que la cadena de conversión se infiere de archivos y marcas de tiempo, que no se conservó el comando de conversión ni la versión de la herramienta, y que no se ha probado de forma independiente la generación ni la calidad en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional, según la etiqueta conversational del repositorio.
- Entrada multimodal imagen-texto, según la pipeline image-text-to-text declarada.
- Conversión de formato y cuantización para ejecución en MLX sobre Apple Silicon.
- Capacidades de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio: la visión es plausible por la pipeline declarada; el resto no disponible.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: la cuantización de 6 bits y el formato MLX permiten cargar un modelo de 25,8 mil millones de parámetros en equipos con memoria unificada amplia, útil para experimentar con modelos de difusión sin infraestructura de GPU dedicada.
- Investigación sobre modelos de difusión para texto: sirve como punto de partida para estudiar el comportamiento de DiffusionGemma en tareas generativas y compararlo con modelos autorregresivos, siempre que se valide antes la calidad de esta conversión concreta.
- Evaluación de pipelines multimodales imagen-texto: la pipeline declarada permite probar flujos que reciben una imagen y un texto y generan una respuesta, por ejemplo en tareas de descripción o razonamiento sobre imágenes.
- Desarrollo de aplicaciones conversacionales en local: la etiqueta conversational sugiere uso en asistentes o chatbots que se ejecuten íntegramente en el dispositivo, con la ventaja de privacidad que ello implica.
- Pruebas de cuantización y ajuste de precisión: el esquema mixto de 6 y 8 bits permite analizar el impacto de la cuantización en la calidad de salida frente al modelo en bf16, aunque el autor no aporta métricas al respecto.
- Integración en entornos de investigación con MLX: útil para equipos que ya trabajan con la librería MLX y quieren incorporar un modelo de gran tamaño sin salir de ese ecosistema.
- Banco de pruebas para despliegue en hardware de consumo: permite medir memoria, latencia y estabilidad en equipos Apple antes de decidir si se adopta el modelo base en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 22,1 GB en safetensors cuantizados, por lo que se necesita al menos esa cantidad de memoria más el overhead de ejecución; en la práctica, se recomienda disponer de 32 GB o más de memoria unificada.
- GPU recomendadas: al ser un formato MLX, está orientado a chips de Apple (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No está pensado para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente; en GPU de consumo tradicionales, no es el formato adecuado.
- Opciones de despliegue: MLX y mlx-lm son las vías naturales; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; el autor no ha realizado pruebas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ6 | 25,8B | no disponible | MLX safetensors 6/8 bits | apache-2.0 (con enlace a Gemma 4) | Hugging Face |
| google/diffusiongemma-26B-A4B-it | no disponible | no disponible | no disponible | Gemma 4 (según enlace) | Hugging Face |
| mlx-community/diffusiongemma-26B-A4B-it-bf16 | no disponible | no disponible | MLX bf16 | no disponible | Hugging Face |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no ha probado de forma independiente la generación ni la calidad de esta conversión; úsese con cautela en producción.
- No se conservó el comando de conversión ni la versión de la herramienta, y la cadena de procedencia se infiere de archivos y marcas de tiempo.
- Discrepancia de licencia: el repositorio declara apache-2.0, pero el enlace de licencia apunta a los términos de Gemma 4 del modelo base; conviene verificar las restricciones de uso comercial antes de adoptarlo.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado para esta conversión.
- Limitaciones de contexto e idioma: no disponibles.
- El formato MLX limita el despliegue a hardware Apple; no es portable a GPU NVIDIA sin reconversión.
- La cuantización mixta de 6 y 8 bits puede degradar la calidad frente al modelo en bf16, sin métricas publicadas que lo cuantifiquen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ6
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Fuente probable en bf16: https://huggingface.co/mlx-community/diffusiongemma-26B-A4B-it-bf16
- Revisión concreta de la fuente: https://huggingface.co/mlx-community/diffusiongemma-26B-A4B-it-bf16/tree/2cd36f950eb065c96c80810fb6b859b114cd052d
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
