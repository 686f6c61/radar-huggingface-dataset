# youngseok12/AX-3.1-Light-minimal-sft-71875

## Resumen

El modelo `youngseok12/AX-3.1-Light-minimal-sft-71875` es un ajuste fino experimental en coreano derivado del modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario `youngseok12`. Se trata de un modelo de tipo `LlamaForCausalLM` con 7.264.800.768 parámetros (7.26B) y pesos en formato `safetensors` con precisión BF16. El objetivo declarado es reproducir, sobre una base distinta, la receta de "auto-destilación mínima" utilizada por el autor en otra contribución al `Korean AI Leaderboard`, para comprobar si dicha receta transfiere entre modelos base.

El entrenamiento se realizó sobre 512 ejemplos extraídos de un subconjunto de datos de QA médica esencial de AI Hub (dataset 71875). Cada ejemplo se genera a partir de la propia salida del modelo base (auto-destilación), no de etiquetas humanas. El modelo está pensado para investigación y evaluación controlada, no para uso en producción. Licencia Apache 2.0, con restricciones de uso aceptable heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (modelo denso) |
| Parametros totales | 7.264.800.768 (7.26B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ko (coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una arquitectura Transformer densa basada en `LlamaForCausalLM`, sin componentes MoE ni capas de atención especiales. El entrenamiento consiste en un fine-tuning con LoRA de rango 4, alpha 8, dropout 0, aplicado a los módulos `q_proj` y `v_proj`. La función de pérdida es la entropía cruzada sobre los tokens de la respuesta en modo causal, ignorando los tokens del usuario (etiquetas solo en la respuesta).

Los datos de entrenamiento provienen de AI Hub dataset 71875 (QA de medicina esencial). El autor ejecutó el modelo base sobre 950 elementos del conjunto de entrenamiento con etiquetas doradas, de los cuales 539 (56.7%) produjeron una respuesta libre que coincidía con la etiqueta. Se seleccionaron los 512 primeros con un muestreo round-robin y semilla 42. Cada objetivo es la salida generada por el propio modelo base, no texto humano. El entrenamiento duró 1 época, 32 pasos de optimizador, con tamaño de lote efectivo 16, learning rate constante de 1e-6, sin warmup ni weight decay, secuencia máxima de 1024 tokens y precisión BF16. No se usaron datos de benchmarks públicos.

## Capacidades

- Generación de texto en coreano, con soporte para conversación multi-turno mediante la plantilla de chat oficial de A.X-3.1-Light, preservada byte a byte.
- Ajuste fino para respuestas en dominio médico esencial (QA de AI Hub 71875), con foco en respuestas concisas y factuales relacionadas con medicina.
- Auto-destilación: el modelo ha sido entrenado con las salidas del modelo base, por lo que su comportamiento se alinea con la distribucion de respuestas de ese modelo.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio, código o matemáticas en la información disponible. El pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Asistente de consultas medicas basicas en coreano: el modelo puede responder preguntas simples sobre medicina esencial, aunque debe usarse con supervision profesional. Es adecuado para prototipos de triage o informacion de salud no critica.
- Chatbot de atencion al cliente en coreano: gracias al template de chat preservado, puede sostener conversaciones multi-turno en situaciones de soporte, pero su entrenamiento en dominio medico limita su alcance generalista.
- Herramienta de generacion de respuestas para documentacion medica en coreano: puede redactar respuestas tipo FAQ o apuntes clinicos sencillos, con revision humana posterior.
- Investigacion sobre auto-destilacion y transferencia de recetas de fine-tuning: sirve como modelo de referencia para evaluar si una estrategia de destilacion minima se transfiere entre modelos base diferentes.
- Evaluacion en el Korean AI Leaderboard: el autor lo publica como candidato a pruebas en el leaderboard coreano, por lo que puede usarse como participante o como punto de comparacion en experimentos academicos.
- Comparacion de tecnicas de adaptacion de bajo rango (LoRA): al emplear un diseño minimalista (rank 4, alpha 8), permite estudiar el efecto de una intervencion muy ligera sobre un modelo base de 7.26B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no utilizó datos de benchmarks públicos durante el entrenamiento. No se dispone de resultados para MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14.5 GB para los pesos, más la memoria para el KV cache y overhead de la inferencia. Se recomienda al menos 16-20 GB para uso interactivo.
- GPU recomendadas: RTX 4090 (24 GB) es suficiente para inferencia con batch pequeño y longitud de contexto moderada. A100 40GB, A100 80GB y H100 80GB son opciones óptimas para desplegar con un margen amplio.
- Cabe en una GPU de consumo de gama alta, como la RTX 4090 o similares con 24 GB de VRAM, siempre que la longitud de generacion no sea muy extensa.
- Opciones de despliegue: mediante `transformers` con `device_map="auto"`, `vLLM` o `Text Generation Inference` (TGI) para producción. Para `llama.cpp` o `Ollama` se requiere convertir y cuantizar los pesos, ya que el repositorio no incluye versiones cuantizadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa directa con modelos similares. El modelo comparte arquitectura con su base `skt/A.X-3.1-Light`, pero no se han publicado especificaciones ni resultados de rendimiento para ninguno de ellos en la informacion proporcionada. Existe otra variante del mismo autor, `youngseok12/AX-3.1-Light-sft_source_screen_71875_3000`, que sigue un enfoque similar, pero tampoco se ofrecen datos comparables.

## Limitaciones y advertencias

- Modelo experimental, diseñado para investigación y evaluacion controlada, no para uso en produccion.
- Las respuestas pueden contener errores factuales o de razonamiento, especialmente en el dominio medico, donde no sustituye el consejo profesional.
- Sesgo potencial hacia contenido medico esencial coreano, debido a la composicion del dataset de entrenamiento.
- Soporte exclusivo de coreano; no se ha validado su comportamiento en otros idiomas.
- La longitud de secuencia utilizada en el entrenamiento fue de 1024 tokens, lo que limita el dominio de entradas observadas, aunque el modelo base pueda soportar contextos mayores.
- No se usaron benchmarks publicos, por lo que su rendimiento en tareas estandarizadas es desconocido.
- Hereda las restricciones de uso aceptable del modelo base A.X-3.1-Light y las condiciones de uso de los datos de AI Hub.
- Riesgo de alucinacion en el ambito medico y en otros temas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngseok12/AX-3.1-Light-minimal-sft-71875
- Modelo base `skt/A.X-3.1-Light`: https://huggingface.co/skt/A.X-3.1-Light
- Licencia Apache 2.0 del modelo base: https://huggingface.co/skt/A.X-3.1-Light/blob/main/LICENSE
- Dataset AI Hub 71875 (medicina esencial): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71875
- Variante del mismo autor con fuente de datos distinta: https://huggingface.co/youngseok12/AX-3.1-Light-sft_source_screen_71875_3000
- Categoria en Hugging Face `k-ai-leaderboard`: https://huggingface.co/collections/skt/k-ai-leaderboard (enlace general del sistema, no especifico del modelo)
