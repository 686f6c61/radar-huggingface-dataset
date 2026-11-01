# tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO

## Resumen

Qwen3-8B-NonThinking-RoleVerse-SFT-DPO es un ajuste fino del modelo Qwen/Qwen3-8B desarrollado por el usuario tinyrolls, orientado especificamente a la generacion de dialogos de role-playing multilingue. El modelo parte de la variante no razonadora (Non-thinking) de Qwen3-8B y se entrena en dos fases consecutivas: un ajuste supervisado (SFT) seguido de optimizacion por preferencias directas (DPO) sobre el dataset RoleVerse, un benchmark multilingue de role-playing construido en torno a situaciones de conflicto social.

El modelo acompana al paper *Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing*, actualmente en revision, que estudia un fenomeno concreto: los modelos con razonamiento intensivo comprenden mejor la escena social pero la interpretan peor. Los checkpoints publicados demuestran que ambas capacidades pueden moverse en direcciones opuestas mediante entrenamiento. Este checkpoint concreto es el que obtiene el mejor equilibrio entre calidad de respuesta y comprension social dentro de la familia Qwen3-8B Non-thinking entrenada.

Con 8.190.735.360 parametros y pesos en safetensors (16,4 GB de repositorio), es un modelo denso de tamano medio que cabe en GPUs de consumo con cuantizacion. Su relevancia actual radica en que ofrece una receta reproducible de SFT+DPO para role-playing multilingue sobre una base Apache-2.0, con evaluacion dual (comprension y actuacion) en cinco idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B, modo non-thinking) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B en su variante no razonadora: se invoca con `enable_thinking=False` en `apply_chat_template`, de modo que responde directamente sin bloque `</think>`. Sobre esa base se aplica un pipeline de dos etapas: primero SFT (ajuste supervisado) y despues DPO (Direct Preference Optimization) sobre el dataset RoleVerse. El dataset esta disenado en torno a conflictos sociales y se evalua con un protocolo dual "know-act": una pregunta de opcion multiple que mide si el modelo comprende la situacion social y una respuesta abierta juzgada por si es lo que ese personaje diria.

La innovacion tecnica del trabajo no reside en la arquitectura sino en la metodologia de entrenamiento y evaluacion: el paper demuestra que SFT y DPO empujan la actuacion (Resp Avg) y la comprension (MCQ %) en direcciones distintas. En el caso de Qwen3-8B Non-thinking, el entrenamiento conjunto SFT+DPO eleva Resp Avg de 3,16 a 3,73 mientras que MCQ % baja de 33,96 a 31,57. El modelo habla como `role2`; los turnos de `role1` son del usuario y los de `role2` del asistente. El system prompt de referencia es `prompts/ResponseGeneration.yaml` del repositorio de codigo. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional y dialogos de role-playing multilingue en ingles, chino, japones, frances y espanol.
- Interpretacion de personajes (`role2`) en escenas con conflicto social, manteniendo coherencia con el rol asignado mediante system prompt.
- Comprension de situaciones sociales evaluable mediante preguntas de opcion multiple (protocolo know-act).
- Generacion de respuestas abiertas en formato conversacional multi-turno.
- Compatible con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking (este checkpoint es precisamente el non-thinking).
- Capacidades de codigo y matematicas: no documentadas especificamente para este ajuste.

## Casos de uso

- Role-playing conversacional en juegos de texto: el modelo interpreta a `role2` en escenas de conflicto siguiendo un system prompt, adecuado por su entrenamiento especifico en el dataset RoleVerse y su soporte de dialogos multi-turno.
- Prototipado de personajes para narrativa interactiva: permite generar respuestas coherentes con un personaje en cinco idiomas, util para validar guiones y arcos de conflicto antes de produccion.
- Investigacion en evaluacion de modelos: sirve como checkpoint de referencia para estudiar el trade-off entre razonamiento y actuacion social descrito en el paper, con resultados publicados comparables.
- Simulacion de entrevistas o negociaciones: al estar entrenado en escenas de conflicto, puede generar contrapartes dialogicas para entrenamiento de habilidades sociales o de mediacion.
- Generacion de dialogos multilingues para localizacion: su cobertura de en, zh, ja, fr y es permite producir variantes de un mismo personaje en distintos idiomas.
- Base para ajustes posteriores de role-playing: al ser Apache-2.0 y safetensors, puede partirse de este checkpoint para SFT/DPO adicional sobre dominios o personajes propios.
- Evaluacion comparativa de pipelines SFT vs DPO: el modelo permite reproducir la receta del paper y medir el efecto de cada etapa sobre actuacion y comprension.

## Benchmarks y rendimiento

Resultados del paper en el conjunto de test de RoleVerse. Resp Avg: media de cinco dimensiones de respuesta (escala 1-5, juez GPT-5). MCQ %: precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---|---:|---:|
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
| Qwen3-8B Non-thinking | + Only SFT | 3,35 | 32,07 |
| Qwen3-8B Non-thinking | + Only DPO | 3,42 | 35,23 |
| Qwen3-8B Non-thinking | + SFT & DPO (este checkpoint) | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
| Qwen3-8B Thinking | + SFT & DPO | 3,61 | 34,60 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
| Llama-3.1-8B-Instruct | + SFT & DPO | 3,81 | 17,05 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
| R1-Distill-Qwen3-8B | + SFT & DPO | 3,07 | 28,85 |
| Qwen3-30B-A3B-Instruct-2507 | sin entrenar | 3,69 | 41,73 |
| Qwen3-30B-A3B-Thinking-2507 | sin entrenar | 3,40 | 52,27 |
| DeepSeek-R1-0528 | sin entrenar | 4,12 | 70,14 |
| gpt-oss-120b (high) | sin entrenar | 2,93 | 73,04 |
| GPT-5 (low; oracle, solo referencia) | sin entrenar | 4,35 | 81,88 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16-17 GB solo para pesos, mas memoria para KV cache y activaciones; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB; en 4 bits: en torno a 5-6 GB (estimaciones a partir del numero de parametros; no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion 4-8 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag del repositorio), endpoints compatibles; vLLM, llama.cpp y Ollama son viables previa conversion, aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % (RoleVerse) | Licencia |
|---|---|---:|---:|---:|---|
| Qwen3-8B-NonThinking-RoleVerse-SFT-DPO | 8,19 B | no disponible | 3,73 | 31,57 | Apache-2.0 |
| Qwen3-8B Thinking + SFT & DPO | 8,19 B (aprox.) | no disponible | 3,61 | 34,60 | Apache-2.0 |
| Llama-3.1-8B-Instruct + SFT & DPO | 8 B (aprox.) | no disponible | 3,81 | 17,05 | Llama 3.1 Community License |
| R1-Distill-Qwen3-8B + SFT & DPO | 8 B (aprox.) | no disponible | 3,07 | 28,85 | MIT |
| Qwen3-30B-A3B-Instruct-2507 | 30 B (MoE) | no disponible | 3,69 | 41,73 | Apache-2.0 |

El checkpoint destaca por lograr el mayor Resp Avg entre los modelos de 8 B entrenados en RoleVerse, a costa de una caida moderada en MCQ % frente a su base. Frente a alternativas mayores (30 B, 120 B) queda por debajo en comprension social, coherente con el trade-off que describe el paper.

## Limitaciones y advertencias

- El propio paper documenta una perdida de comprension social (MCQ %) tras el entrenamiento SFT+DPO: de 33,96 a 31,57 en este checkpoint. El modelo actua mejor pero comprende peor.
- Riesgo de alucinacion y de deriva de personaje en dialogos largos; no se documentan mecanismos de mitigacion especificos.
- Entrenado especificamente para escenas de conflicto del dataset RoleVerse; su comportamiento fuera de ese dominio puede degradarse.
- Cobertura linguistica limitada a en, zh, ja, fr y es; el rendimiento en espanol no se reporta por separado.
- No se documentan sesgos especificos, pero al derivar de Qwen3-8B hereda los sesgos de su base y de los datos de preferencia del dataset.
- Licencia Apache-2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B y del dataset RoleVerse.
- El paper esta en revision; los resultados deben considerarse preliminares y el juez de evaluacion es GPT-5, lo que introduce dependencia de un modelo propietario.
- No se especifican la longitud de contexto efectiva ni el numero de tokens de entrenamiento, lo que dificulta estimar el comportamiento en contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
