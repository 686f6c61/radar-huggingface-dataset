# technicallyAnnoyed/Kimi-VL-A3B-Thinking

## Resumen

Kimi-VL-A3B-Thinking es un modelo de lenguaje y visión (VLM) de arquitectura Mixture-of-Experts (MoE) desarrollado originalmente por Moonshot AI. Esta ficha corresponde a la reproducción publicada por el usuario `technicallyAnnoyed` en Hugging Face, un fine-tuning del modelo base `moonshotai/Kimi-VL-A3B-Instruct` orientado a razonamiento de cadena de pensamiento larga (long CoT). El modelo activa únicamente 2,8B parámetros de su decodificador de lenguaje sobre un total de 16B, lo que lo posiciona como una alternativa eficiente frente a VLMs densos de mayor tamaño.

La relevancia del modelo radica en su capacidad para tareas de razonamiento multimodal complejo (matemáticas visuales, comprensión de documentos e imágenes de alta resolución) manteniendo un coste computacional reducido gracias al enrutamiento MoE. Incorpora un codificador visual de resolución nativa (MoonViT) y una ventana de contexto de 128K tokens, lo que permite procesar vídeo largo, documentos extensos y múltiples imágenes en una sola pasada.

El autor original recomienda migrar a la versión `Kimi-VL-A3B-Thinking-2506`, que mejora las capacidades de comprensión visual general, razonamiento, vídeo y escenarios de agente. La licencia es MIT, lo que facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language transformer (decodificador MoE + codificador visual MoonViT + proyector MLP) |
| Parametros totales | 16.407.657.776 (16B) |
| Parametros activos | 3B en el decodificador de lenguaje (2,8B segun la model card) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 32,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kimi-VL: un decodificador de lenguaje MoE con 16B parámetros totales y aproximadamente 3B activos por token, acoplado a un codificador visual de resolución nativa denominado MoonViT y a un proyector MLP que alinea las representaciones visuales con el espacio del lenguaje. Esta combinación permite procesar imágenes de resolución arbitraria sin reescalado forzado, lo que mejora tareas de OCR, comprensión de documentos y detección de detalles finos en pantallas (ScreenSpot-Pro).

La variante Thinking se obtiene mediante supervised fine-tuning (SFT) sobre cadenas de pensamiento largas y posterior reinforcement learning (RL), partiendo del modelo `Kimi-VL-A3B-Instruct`. El resultado es un modelo que genera trazas de razonamiento extensas antes de emitir la respuesta final, lo que explica su rendimiento en benchmarks de matemáticas visuales. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal con cadena de pensamiento larga (thinking mode).
- Comprensión de imágenes en resolución nativa, incluyendo documentos, capturas de pantalla y gráficos.
- OCR y comprensión de documentos largos (MMLongBench-Doc).
- Razonamiento matemático sobre imágenes (MathVision, MathVista).
- Comprensión de vídeo de larga duración (LongVideoBench).
- Comprensión multi-imagen en una misma conversación.
- Capacidades de agente multimodal y interacción multi-turno (OSWorld).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos a partir de fotografías de pizarra o exámenes: el modelo genera una traza de razonamiento paso a paso antes de dar la solución, adecuado por su rendimiento en MathVision (36,8) y MathVista (71,3).
- Análisis de documentos financieros o científicos extensos: con 128K de contexto y OCR nativo, puede procesar informes de decenas de páginas e imágenes embebidas en una sola pasada.
- Automatización de soporte técnico con capturas de pantalla: el modelo interpreta la imagen de la interfaz del usuario y razona sobre el estado del sistema, útil en escenarios de agente (estilo OSWorld).
- Moderación de contenido visual con razonamiento explícito: la traza de pensamiento permite auditar por qué el modelo clasifica una imagen de una manera concreta.
- Extracción estructurada de datos de facturas y formularios: el codificador de resolución nativa evita pérdida de detalle en texto pequeño.
- Análisis de vídeo largo para resumen o búsqueda de eventos: la ventana de 128K y su rendimiento en LongVideoBench (64,5) lo hacen viable para clips extensos.
- Asistente educativo multimodal: explica diagramas, gráficos y ecuaciones a estudiantes con razonamiento detallado.

## Benchmarks y rendimiento

| Benchmark (metrica) | Kimi-VL-Thinking-A3B | Qwen2.5-VL-7B | Gemma-3-12B | GPT-4o-mini | Qwen2.5-VL-72B | GPT-4o |
|---|---|---|---|---|---|---|
| MathVision (full) (Pass@1) | 36,8 | 25,1 | 32,1 | - | 38,1 | 30,4 |
| MathVista (mini) (Pass@1) | 71,3 | 68,2 | 56,4 | 56,7 | 74,8 | 63,8 |
| MMMU (val) (Pass@1) | 61,7 | 58,6 | 59,6 | 60,0 | 74,8 | 69,1 |

Otros resultados citados en la model card: LongVideoBench 64,5; MMLongBench-Doc 35,1; InfoVQA 83,2; ScreenSpot-Pro 34,5.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los 16B parámetros ocupan aproximadamente 32 GB, por lo que se requiere al menos una GPU de 40 GB (A100 40GB, A6000) o reparto multi-GPU. En cuantización de 8 bits bajaría a ~16 GB y en 4 bits a ~8-9 GB, aunque el repo no publica pesos cuantizados oficiales.
- GPU recomendadas: A100 80GB o H100 para inferencia en precisión completa con contexto largo; A100 40GB o L40S para bf16 con contexto moderado.
- Cabe en GPU de consumo: en bf16 no cabe en RTX 4090 (24 GB). Con cuantización 4/8 bits podría caber en RTX 4090 o RTX 3090, aunque requeriría conversión manual al no haber GGUF oficial.
- Opciones de despliegue: transformers (librería indicada por el autor), con soporte de `kimi_vl` y `custom_code`. vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MathVision | MathVista | MMMU | Licencia |
|---|---|---|---|---|---|---|---|
| Kimi-VL-A3B-Thinking (esta ficha) | 16B | 3B | 128K | 36,8 | 71,3 | 61,7 | MIT |
| Qwen2.5-VL-7B | 7B | 7B | no disponible | 25,1 | 68,2 | 58,6 | no disponible |
| Gemma-3-12B-IT | 12B | 12B | no disponible | 32,1 | 56,4 | 59,6 | no disponible |
| GPT-4o-mini (referencia cerrada) | no disponible | no disponible | no disponible | - | 56,7 | 60,0 | propietaria |

## Limitaciones y advertencias

- El autor original recomienda usar `Kimi-VL-A3B-Thinking-2506` en lugar de esta versión por mejoras en comprensión visual general, razonamiento, vídeo y agentes.
- Esta ficha corresponde a una reproducción de un tercero (`technicallyAnnoyed`) con solo 21 descargas y 0 likes; no es la publicación oficial de Moonshot AI.
- El modo thinking genera trazas largas, lo que incrementa la latencia y el consumo de tokens; se recomienda temperatura 0,8 para este modelo.
- Riesgo de alucinación inherente a modelos generativos, especialmente en OCR de imágenes de baja calidad o texto manuscrito.
- Idiomas soportados no documentados; el rendimiento multilingüe fuera del inglés y chino no está garantizado.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original de Moonshot AI.
- No se publican pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- El contexto de 128K puede degradar la calidad en tareas de recuperación de información muy al final de la ventana.

## Enlaces

- Hugging Face (esta reproducción): https://huggingface.co/technicallyAnnoyed/Kimi-VL-A3B-Thinking
- Modelo base: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Modelo original Thinking: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Versión recomendada 2506: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking-2506
- Informe técnico: https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Demo chat: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B-Thinking/
