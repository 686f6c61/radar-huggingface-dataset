# ttttim3/SmolLM3-3B-sft-smol-course

## Resumen

SmolLM3-3B-sft-smol-course es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, publicado por el usuario ttttim3 como parte de la Unidad 1 (Instruction Tuning) del curso smol-course de Hugging Face. Se trata de un modelo de generacion de texto de 3.075.098.624 parametros (aproximadamente 3B) construido sobre la arquitectura SmolLM3, orientado a conversacion e instrucciones en ingles. Su relevancia es principalmente educativa y experimental: demuestra el flujo completo de un SFT con LoRA y TRL sobre una GPU de consumo profesional (una NVIDIA L4 de 24 GB) en menos de una hora.

El modelo parte del checkpoint base, no del instruct oficial, y aplica un LoRA de rango 8 sobre todas las capas lineales, fusionando despues los adaptadores en los pesos. El entrenamiento usa 1.000 ejemplos del split de SFT `smoltalk_everyday_convs_reasoning_Qwen3_32B_think` del dataset HuggingFaceTB/smoltalk2. El resultado es un modelo conversacional pequeno con plantilla de chat SmolLM3, que soporta los modos `/think` y `/no_think`, y que mejora notablemente el rendimiento en GSM8K zero-shot respecto al base (0.353 frente a 0.104), aunque con un alcance muy limitado por el volumen y la naturaleza del dataset.

Es un artefacto de bajo perfil (0 descargas, 0 likes en el momento de la consulta) y no debe confundirse con el instruct oficial de Hugging Face. Su interes esta en servir como referencia reproducible del curso y como ejemplo de que un SFT ligero puede alterar el comportamiento de un modelo base en tareas de razonamiento corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM3) |
| Parametros totales | 3.075.098.624 (~3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion estandar, pero no se documenta en esta ficha) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SmolLM3-3B-Base de Hugging Face: un transformer decoder-only de aproximadamente 3B parametros. Sobre ese checkpoint se aplico un ajuste fino supervisado con TRL `SFTTrainer` mediante LoRA con r=8, alpha=16, dropout=0.05 y aplicado a todas las capas lineales; los adaptadores se fusionaron posteriormente en los pesos base, de modo que el repositorio contiene un modelo denso estandar cargable con `transformers`. El entrenamiento se realizo en bf16 con gradient checkpointing sobre una unica NVIDIA L4 de 24 GB, con un pico de memoria de 8,3 GB y una duracion de aproximadamente 50 minutos.

Los datos son 1.000 ejemplos del split `smoltalk_everyday_convs_reasoning_Qwen3_32B_think` de HuggingFaceTB/smoltalk2, un subconjunto de conversaciones cotidianas con razonamiento generado por Qwen3-32B en modo think. Se ejecutaron 500 pasos con batch efectivo de 4 durante 2 epocas, learning rate 5e-5, 50 pasos de warmup, decaimiento lineal, AdamW y weight decay 0.01. La perdida de entrenamiento final fue 0.60, partiendo de 1.50. No se documenta RLHF ni DPO. La plantilla de chat es la de SmolLM3 instruct, con soporte de `/think` y `/no_think`, y el token `<|im_end|>` como EOS.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno segun la plantilla SmolLM3.
- Razonamiento en modo "think" y respuestas directas en modo "no_think", heredado de la plantilla del modelo base.
- Razonamiento aritmetico basico: mejora sustancial en GSM8K zero-shot respecto al base (0.353 frente a 0.104).
- Instrucciones generales y conversaciones cotidianas, gracias al subconjunto de smoltalk2 usado.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento es de una sola fase SFT con 1.000 ejemplos.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio u otras modalidades: no soportadas.

## Casos de uso

- Prototipado educativo de SFT: sirve como referencia reproducible del flujo LoRA + TRL del smol-course, util para ensenar a ajustar modelos pequenos en una sola GPU de 24 GB.
- Asistente conversacional ligero en ingles: puede desplegarse para dialogos cotidianos de baja complejidad donde no se requiera un modelo grande, con la ventaja de sus ~3B parametros.
- Experimentos de razonamiento corto: su mejora en GSM8K zero-shot con 256 tokens generados lo hace util para estudiar como el SFT afecta al formato y longitud del razonamiento.
- Base para comparativas de ajuste fino: permite medir el impacto de 1.000 ejemplos y 500 pasos frente al base y al instruct oficial en tareas controladas.
- Generacion de texto en entornos con recursos limitados: al caber en GPUs de 24 GB en bf16 y en GPUs de consumo con cuantizacion, es adecuado para demos y pruebas locales.
- Investigacion sobre modos think/no_think: la plantilla permite alternar razonamiento explicito y respuesta directa, util para estudiar el efecto del formato en la calidad de salida.
- Fine-tuning posterior como punto de partida: al ser un checkpoint ya instruido, puede servir de base para SFT adicional o DPO en dominios concretos.

## Benchmarks y rendimiento

Evaluacion GSM8K zero-shot con lighteval 0.13 + vLLM, 256 tokens generados (configuracion del leaderboard del smol-course):

| Modelo | extractive_match |
|---|---|
| SmolLM3-3B-Base | 0.104 |
| SmolLM3-3B-sft-smol-course (este modelo) | 0.353 |
| HuggingFaceTB/SmolLM3-3B (instruct oficial) | 0.211 |

Nota del autor: el instruct oficial obtiene 0.211 porque su razonamiento es mas largo y queda truncado por el limite de 256 tokens. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,2 GB de pesos, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en 24 GB y en GPUs de 16 GB con margen.
- GPU recomendadas: NVIDIA L4 (24 GB) usada en el entrenamiento; tambien A100, H100, RTX 4090, RTX 3090 y similares para inferencia.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantizacion (no documentada en esta ficha).
- Opciones de despliegue: `transformers` (documentado en la model card); vLLM se uso para la evaluacion con lighteval; llama.cpp, Ollama y TGI no estan documentados para este checkpoint concreto, aunque el formato safetensors es compatible con las herramientas habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (256 tok) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-sft-smol-course | ~3B | no disponible | 0.353 | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM3-3B-Base | ~3B | no disponible | 0.104 | Apache 2.0 | Hugging Face (oficial) |
| SmolLM3-3B (instruct oficial) | ~3B | no disponible | 0.211 | Apache 2.0 | Hugging Face (oficial) |

La comparativa se limita a los tres checkpoints reportados por el autor; no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con 1.000 ejemplos y 500 pasos: el ajuste es superficial y no garantiza calidad conversacional general.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alucinacion alto, propio de un modelo de 3B con SFT ligero; no apto para producción sin validacion.
- El benchmark GSM8K se midio con un limite de 256 tokens, lo que penaliza al instruct oficial y favorece respuestas cortas; no es una comparacion completamente justa.
- No hay datos de tool calling, agentes ni contexto largo; no debe asumirse su soporte.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset subyacente tienen sus propias condiciones que conviene revisar.
- Perfil de bajo uso (0 descargas, 0 likes): no hay evidencia de comunidad ni mantenimiento.
- No confundir con el instruct oficial de Hugging Face; es un artefacto educativo del smol-course.

## Enlaces

- Hugging Face: https://huggingface.co/ttttim3/SmolLM3-3B-sft-smol-course
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Instruct oficial: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Curso smol-course: https://huggingface.co/learn/smol-course
