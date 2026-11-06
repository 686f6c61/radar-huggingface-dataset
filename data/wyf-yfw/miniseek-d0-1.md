# wyf-yfw/MiniSeek-D0.1

## Resumen

MiniSeek-D0.1 es un modelo conversacional (chat) ultra pequeño de arquitectura densa decoder-only, desarrollado por el autor independiente wyf-yfw. Se trata de la versión SFT (supervised fine-tuning) del modelo base MiniSeek-D0.1-base, entrenada sobre el dataset SFT de MiniMind para dotarlo de capacidades de diálogo multi-turno en chino e inglés. Con unos 31,73 millones de parámetros, se sitúa en la categoría de modelos educativos y de experimentación, no de producción.

Su relevancia no radica en el rendimiento frente a modelos comerciales, sino en su utilidad como punto de partida para aprender sobre el ciclo completo de entrenamiento de LLM: preentrenamiento, SFT y despliegue, todo con hardware de consumo (el propio autor lo entrenó en una RTX 3090). El proyecto publica además el código completo en GitHub, incluyendo una Web UI con pestaña de chat multi-turno.

La arquitectura es un transformer decoder-only denso con dimensión 512, 8 capas y un vocabulario reducido de 6.400 tokens (tokenizador MiniMind), con contexto de entrenamiento de 512 tokens. La licencia MIT permite cualquier uso, incluido el comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (DenseLM) |
| Parametros totales | 31.728.128 (~31,73M, con `tok_emb` y `lm_head` sin atar) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 512 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos en fp, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~0,3 GB el repositorio) |

| Dato adicional | Valor |
|---|---|
| Dimensión del modelo (d) | 512 |
| Número de capas (L) | 8 |
| Tamaño de vocabulario | 6.400 (tokenizador MiniMind) |
| Plantilla de chat | `<\|im_start\|>role\n…<\|im_end\|>` (estilo ChatML) |
| Token de fin de turno | `<\|im_end\|>` (id=2) |

## Arquitectura y entrenamiento

MiniSeek-D0.1 emplea la misma pila densa que su modelo base: un transformer decoder-only con dimensión oculta 512, 8 capas y vocabulario de 6.400 tokens. La particularidad de esta versión SFT es que almacena por separado la matriz de embeddings de tokens (`tok_emb`) y la cabeza de lenguaje (`lm_head`), lo que eleva el conteo en disco a 31,73M frente a los ~28,45M del base, que comparte ambas matrices (weight tying). La diferencia equivale a 6.400 × 512 parámetros adicionales.

El entrenamiento se realizó en dos fases: primero el preentrenamiento del base (etapa `pretrain_t2t_mini`, Stage-0 Dense) y después el SFT sobre el dataset `sft_t2t_mini.jsonl` de `jingyaogong/minimind_dataset`. El mejor checkpoint se obtuvo en el paso 54.949 con una loss de entrenamiento de aproximadamente 0,54, usando el optimizador AdamW con LR pico de 5e-5 y mínimo de 1e-5 sobre una NVIDIA RTX 3090. No hubo RLHF ni optimización de preferencias (DPO), algo que el propio autor señala explícitamente como limitación.

Como innovaciones técnicas destacables no se reportan ninguna: es un checkpoint educativo sin técnicas especiales como decodificación especulativa, KV cache en la generación de referencia o attention lineal. La generación de referencia carece de KV cache, lo que afecta a la latencia.

## Capacidades

- Generación de texto conversacional en chino e inglés, siguiendo instrucciones cortas (SFT sobre datos de diálogo).
- Diálogo multi-turno mediante la plantilla ChatML (`<|im_start|>`/`<|im_end|>`) y `apply_chat_template` del tokenizador.
- Respuestas a preguntas simples de sentido común en chino y aritmética básica a temperaturas bajas, según observaciones informales del autor.
- Integración con una Web UI incluida en el repositorio de GitHub (pestaña de chat multi-turno).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidades de generación de código y matemáticas muy limitadas.
- Capacidad de rechazo (rechazo de peticiones inseguras) muy débil.

## Casos de uso

- Aprendizaje del ciclo completo de un LLM: ideal para estudiar cómo se pasa de un modelo base preentrenado a un chat SFT, con código, datos y checkpoints públicos. Su tamaño de 31,73M permite ejecutarlo y modificarlo en cualquier GPU moderna o incluso CPU.
- Experimentación con fine-tuning: al ser tan pequeño, permite hacer fine-tuning adicional (por ejemplo, DPO propio o SFT en dominios concretos) en una sola GPU de consumo en minutos u horas, no días.
- Demostración de diálogo multi-turno en la Web UI del repositorio: útil para docencia o talleres donde se quiere mostrar cómo funciona una plantilla ChatML en la práctica.
- Baseline de comparación: sirve como punto de referencia conversacional antes de que el autor publique la línea MoE (MiniSeek-M), permitiendo comparar densos frente a MoE a escala diminuta.
- Pruebas de tokenizadores de vocabulario reducido: el tokenizador MiniMind con 6.400 tokens es un caso interesante para estudiar el compromiso entre tamaño de vocabulario y calidad multilingüe.
- Prototipado de pipelines de inferencia: como requiere cargar `DenseLM` manualmente (no es compatible con `AutoModelForCausalLM`), es un buen ejercicio para implementar cargadores de pesos safetensors y bucles de generación personalizados.

No es adecuado para producción como asistente: el propio autor advierte que errores factuales, matemáticas y código débiles, y rechazos de seguridad pobres son esperables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta observaciones informales ("smoke test"): a baja temperatura responde preguntas simples de sentido común en chino y aritmética pequeña, y sigue instrucciones cortas; a temperatura alta tiende a desviarse del tema. La loss de entrenamiento del mejor checkpoint SFT fue de aproximadamente 0,54 en el paso 54.949.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo pesa ~0,3 GB; con 31,73M de parámetros en precisión fp32 ocupa ~127 MB y en fp16/bf16 ~64 MB, por lo que cualquier GPU con 1-2 GB de VRAM (o incluso solo CPU) es suficiente.
- GPU recomendadas: no hay requisito mínimo destacable; el entrenamiento del SFT se realizó en una NVIDIA RTX 3090 (24 GB), pero la inferencia funciona en hardware mucho más modesto.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso portátiles con GPU integrada; también es viable su ejecución en CPU.
- Opciones de despliegue: el modelo usa una clase `DenseLM` personalizada y no es compatible con `AutoModelForCausalLM` de transformers, por lo que vLLM, TGI, llama.cpp y Ollama no son aplicables directamente. El despliegue se hace mediante el código del repositorio `wyf-yfw/miniseek` (PyTorch, cargando `model.safetensors` con safetensors) o mediante la Web UI incluida. La función de referencia `generate` no implementa KV cache.
- Latencia y throughput: no disponible; al carecer el código de referencia de KV cache y dada la longitud de contexto de 512 tokens, la generación de tokens individuales será rápida en GPU pero no optimizada para throughput alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiniSeek-D0.1 | 31,73M | 512 tokens | MIT | Chat SFT educativo, zh/en |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens | Qwen Research (uso comercial condicionado) | Chat generalista, multilingüe |
| TinyLlama-1.1B-Chat | ~1.100M | 2.048 tokens | Apache 2.0 | Chat generalista, principalmente inglés |
| SmolLM2-135M-Instruct | ~135M | 2.048 tokens | Apache 2.0 | Chat educativo/edge, multilingüe |

En su categoría de modelos ultra pequeños, MiniSeek-D0.1 es notablemente más reducido que SmolLM2-135M y TinyLlama-1.1B, con un contexto mucho más corto (512 tokens) y sin RLHF. Su ventaja diferencial es la licencia MIT (más permisiva que Apache 2.0 en atribución) y la total reproducibilidad del pipeline de entrenamiento con hardware de consumo. En capacidad conversacional, queda por detrás de cualquiera de las alternativas citadas.

## Limitaciones y advertencias

- Escala de ~30M de parámetros: las alucinaciones y las repeticiones son frecuentes, según reconoce el propio autor en la model card.
- Sin RLHF ni optimización de preferencias: las respuestas pueden ser poco alineadas con las intenciones del usuario.
- Capacidad de rechazo de peticiones inseguras muy débil: no debe exponerse a usuarios finales sin filtros adicionales.
- Código y matemáticas muy débiles: no sirve para tareas de programación o razonamiento cuantitativo serio.
- Contexto de solo 512 tokens: descarta documentos largos o conversaciones extensas.
- A temperatura alta el modelo tiende a desviarse del tema; se recomienda muestreo a baja temperatura.
- El tokenizador de vocabulario 6.400 limita la eficiencia de compresión de texto, especialmente en inglés.
- Incompatibilidad con `AutoModelForCausalLM`: requiere el código personalizado del repositorio, lo que complica la integración en pipelines estándar de Hugging Face.
- La función `generate` de referencia no implementa KV cache, penalizando la latencia en generaciones largas.
- Licencia MIT sin restricciones de uso comercial, pero sin garantías de ningún tipo; el autor lo califica explícitamente de checkpoint de aprendizaje, no de asistente de producción.
- Descargas muy bajas (380 en el momento de la ficha): proyecto con comunidad mínima y sin auditoría externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-D0.1
- Modelo base: https://huggingface.co/wyf-yfw/MiniSeek-D0.1-base
- Repositorio de código (GitHub): https://github.com/wyf-yfw/miniseek
- Colección MiniSeek en Hugging Face: https://huggingface.co/collections/wyf-yfw/miniseek-6adc765159d38ab3236c49af
- Dataset SFT (MiniMind): https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Proyecto MiniMind (referencia del tokenizador y receta SFT): https://github.com/jingyaogong/minimind
