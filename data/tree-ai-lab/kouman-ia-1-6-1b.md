# Tree-AI-lab/kouman-ia-1.6-1b

## Resumen

Kouman IA 1.6 (1B) es un ajuste fino mediante LoRA del modelo base `Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3`, derivado a su vez de la familia Llama 3.2 de Meta. Lo desarrolla el equipo Tree-AI-lab y está orientado a generación de texto conversacional en un contexto multilingüe poco habitual: inglés, francés y dos lenguas africanas de bajos recursos, el baoulé (código ISO `bci`) y el dioula (`dyu`). El modelo publicado contiene 1.235.814.400 parámetros totales en formato safetensors, aunque solo se entrenaron 19.726.336 parámetros correspondientes a los adaptadores LoRA.

El modelo se presenta como un SFT (supervised fine-tuning) sobre 101.592 conversaciones y un conjunto adicional de 5.000 ejemplos de control de identidad. Los datasets empleados son propios del autor e incluyen traducción y cultura, identidad instructiva, conversaciones trilingües largas, situaciones y consejos, y un corpus específico de WhatsApp. Es relevante para quienes trabajan en NLP de bajos recursos para lenguas de Costa de Marfil y África Occidental, donde escasean los modelos ajustados con datos nativos.

La información pública es escasa: no se detalla la licencia, no hay benchmarks publicados y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. El autor indica además que el corpus de WhatsApp queda sujeto a validación de confidencialidad, lo que condiciona la reproducibilidad del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste mediante LoRA |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE); 19.726.336 parámetros LoRA entrenados |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 1B soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | bci (baoulé), fr (francés), dyu (dioula), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.2 con 1B de parámetros. Sobre ese modelo base, `Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3`, se aplicó un ajuste LoRA con 19.726.336 parámetros entrenables, es decir, aproximadamente el 1,6 % del total de parámetros del modelo. El entrenamiento se realizó con SFT sobre 101.592 conversaciones, a las que se añaden 5.000 ejemplos de un conjunto de control de identidad. El autor menciona el uso de ROCm en el pipeline de entrenamiento (tag `rocm`).

Los datos de entrenamiento provienen de seis datasets propios: `kouman-traduction-culture-sft-v25k`, `kouman-identity-instruct-v25k`, `smoltalk-multilingue-v25k`, `kouman-situations-conseils-13k-v25k`, `kouman-conversations-trilingues-longues-25k-v25k` y `kouman-whatsapp-sft-v25k`. No se especifica el número total de tokens, la composición exacta por idioma, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, francés, baoulé y dioula.
- Traducción y adaptación cultural entre los idiomas cubiertos, según el dataset `kouman-traduction-culture-sft-v25k`.
- Conversaciones trilingües de contexto largo, según el dataset `kouman-conversations-trilingues-longues-25k-v25k`.
- Respuestas de orientación y consejo en situaciones cotidianas, según `kouman-situations-conseils-13k-v25k`.
- Estilo conversacional propio de mensajería (WhatsApp), según `kouman-whatsapp-sft-v25k`.
- Control de identidad del asistente mediante un conjunto específico de 5.000 ejemplos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Atención al cliente en francés para usuarios de Costa de Marfil: el modelo puede gestionar conversaciones multi-turno en francés con deriva hacia baoulé o dioula, lo que permite atender a usuarios que alternan lenguas en una misma conversación.
- Traducción asistida francés–baoulé y francés–dioula: útil para digitalizar contenidos administrativos o educativos hacia lenguas de bajos recursos, con revisión humana dado el tamaño reducido del modelo.
- Asistentes de mensajería estilo WhatsApp: el ajuste específico sobre corpus de WhatsApp lo hace adecuado para bots de soporte en canales de mensajería con turnos cortos y registro informal.
- Preservación y difusión cultural: generación de explicaciones y material divulgativo sobre cultura baoulé y dioula a partir del dataset de traducción y cultura.
- Orientación y consejo básico: respuestas guiadas en situaciones cotidianas (salud, trámites, educación) como primera capa de un sistema con derivación a humanos.
- Prototipado e investigación en NLP de bajos recursos: base ligera (1B) para experimentar con fine-tuning LoRA sobre lenguas africanas en hardware modesto.
- Despliegue en entornos con recursos limitados: al tener 1,2B de parámetros, puede ejecutarse en una sola GPU de consumo si se cuantiza, aunque no se publican pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3 GB para pesos; en 4 bits, alrededor de 0,7 GB. No se publican pesos GGUF, por lo que habría que generarlos a partir de los safetensors.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para mayor throughput. Cabe en GPU de consumo con 8 GB o más en fp16 y con 4 GB o más si se cuantiza.
- Opciones de despliegue: transformers con PyTorch, vLLM y TGI para serving; llama.cpp u Ollama tras convertir los pesos a GGUF. El tag `rocm` sugiere compatibilidad con GPUs AMD.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kouman IA 1.6 1B | 1,24B (LoRA 19,7M) | no disponible | bci, fr, dyu, en | no disponible | safetensors |
| Llama 3.2 1B Instruct (Meta) | 1,24B | 128K | multilingüe (8 oficiales) | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B Instruct (Google) | 2,6B | 8K | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| Qwen2.5 1.5B Instruct (Alibaba) | 1,54B | 32K | multilingüe (29 idiomas) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados de Kouman IA que permitan comparar rendimiento. La ventaja diferencial de Kouman IA frente a los modelos genéricos es la cobertura de baoulé y dioula, ausentes en Llama 3.2, Gemma 2 y Qwen2.5. En cambio, ofrece mucha menos documentación, sin licencia declarada ni pesos cuantizados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de desplegarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, traducción u otras tareas.
- Riesgo elevado de alucinación en lenguas de bajos recursos: con 1B de parámetros y un corpus SFT de unas 100.000 conversaciones, la cobertura léxica y factual en baoulé y dioula es limitada.
- El corpus de WhatsApp está sujeto a validación de confidencialidad según el autor, lo que impide reproducir el entrenamiento y plantea dudas sobre la procedencia de los datos.
- Contexto no documentado: no se confirma la ventana efectiva tras el ajuste, aunque el modelo base soporte 128K.
- Idiomas limitados a cuatro; no hay garantía de comportamiento correcto fuera de bci, fr, dyu y en.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No se documentan pesos cuantizados ni integración con motores de serving, lo que añade trabajo de conversión para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-ia-1.6-1b
- Modelo base: https://huggingface.co/Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3
- Dataset de traducción y cultura: https://huggingface.co/datasets/Tree-AI-lab/kouman-traduction-culture-sft-v25k
- Dataset de identidad instructiva: https://huggingface.co/datasets/Tree-AI-lab/kouman-identity-instruct-v25k
- Dataset SmolTalk multilingüe: https://huggingface.co/datasets/Tree-AI-lab/smoltalk-multilingue-v25k
- Dataset de situaciones y consejos: https://huggingface.co/datasets/Tree-AI-lab/kouman-situations-conseils-13k-v25k
- Dataset de conversaciones trilingües largas: https://huggingface.co/datasets/Tree-AI-lab/kouman-conversations-trilingues-longues-25k-v25k
- Dataset de WhatsApp SFT: https://huggingface.co/datasets/Tree-AI-lab/kouman-whatsapp-sft-v25k
