# tamkudo1/lab22-dpo-vn

## Resumen

`tamkudo1/lab22-dpo-vn` es un adaptador LoRA de 0,1 GB entrenado con **Direct Preference Optimization (DPO)** sobre el modelo base cuantizado `unsloth/Qwen2.5-3B-bnb-4bit` (Qwen2.5-3B en 4 bits). Lo desarrolla TamKudo como parte del laboratorio del día 22 (Track 3) del programa VinUni AICB, centrado en alineación por preferencias. El adaptador apila sobre un checkpoint SFT previo entrenado con una submuestra de 1.000 ejemplos de `bkai-foundation-models/vi-alpaca`, y se alinea con 2.000 pares de preferencias del dataset `argilla/ultrafeedback-binarized-preferences-cleaned`.

El modelo resuelve el problema de alinear un modelo de lenguaje pequeño (3B) con preferencias humanas para tareas de generación de texto en vietnamita, mejorando la calidad de las respuestas frente al checkpoint SFT sin alinear. Su relevancia radica en ser un ejemplo práctico de pipeline DPO completo con recursos limitados (una GPU T4 gratuita de Colab), demostrando que es posible aplicar alineación por preferencias a modelos pequeños con datasets reducidos. La arquitectura es un transformer decoder-only de 3B parámetros con contexto de 512 tokens (limitado por el entrenamiento), y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (adaptador LoRA sobre base densa) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento; el base soporta 32.768) |
| Tipos de cuantizacion | 4 bits (base cargado con `load_in_4bit=True`); adaptador en bf16 |
| Idiomas soportados | vietnamita (entrenado especificamente para este idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (alpha 32) aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer Qwen2.5-3B. El entrenamiento sigue un pipeline de dos fases: primero un SFT sobre 1.000 ejemplos de `vi-alpaca` (1 época), y despues DPO con loss sigmoid estandar sobre 2.000 pares de preferencias de UltraFeedback (1 época, 250 pasos). El hiperparámetro DPO β es 0,1 y la tasa de aprendizaje 5e-7, con batch efectivo de 8 (per-device 1 × grad-accum 8). El entrenamiento se realizo en una GPU T4 de Colab (16 GB) durante aproximadamente 50 minutos.

Una innovacion destacable es el uso de `pad_token == eos_token`, que el autor senala como posible causa de degeneracion en algunos outputs. El adaptador se entrena sobre el modelo base cuantizado en 4 bits usando Unsloth, lo que reduce los requisitos de memoria durante el entrenamiento. No se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal; es un transformer estandar con adaptadores LoRA.

## Capacidades

- Generacion de texto en vietnamita: responde a instrucciones y preguntas en este idioma con formato chat.
- Razonamiento basico: puede explicar algoritmos y conceptos simples (ej. quicksort) en vietnamita.
- Alineacion por preferencias: el adaptador DPO muestra una ligera preferencia por respuestas "chosen" frente a "rejected" (reward gap +0,130), lo que indica una mejora sutil en la calidad percibida.
- Soporte de chat multi-turno: hereda la plantilla de chat de Qwen2.5, permitiendo conversaciones con contexto de hasta 512 tokens.
- Tool calling: no disponible (no se ha entrenado ni evaluado para function calling).
- Capacidades multilingues: limitadas al vietnamita; el modelo base Qwen2.5-3B soporta otros idiomas, pero el adaptador se entreno exclusivamente con datos en vietnamita.
- Modo thinking: no disponible.

## Casos de uso

- Asistente de preguntas frecuentes en vietnamita: el modelo puede responder consultas comunes de usuarios en este idioma, aprovechando su alineacion con preferencias para dar respuestas mas utiles que un SFT sin alinear. Adecuado para chatbots simples con presupuesto de hardware reducido.
- Generacion de explicaciones educativas: puede explicar conceptos de programacion, matematicas o ciencia en vietnamita, como se muestra en el ejemplo de quicksort. Util para plataformas de aprendizaje automatico.
- Prototipado rapido de chatbots: al ser un adaptador pequeno (0,1 GB) sobre un base de 3B, permite iterar rapidamente en entornos de desarrollo con una sola GPU consumer.
- Evaluacion de pipelines DPO: sirve como referencia academica para estudiantes o investigadores que quieran reproducir un flujo completo SFT + DPO con datasets pequenos y hardware limitado.
- Generacion de contenido corto en vietnamita: puede redactar parrafos breves, resumenes o respuestas a prompts concretos, aunque con riesgo de degeneracion en outputs largos.
- Filtrado de respuestas en sistemas RAG: combinado con un pipeline de retrieval, puede generar respuestas finales en vietnamita a partir de contextos recuperados, siempre que el contexto no exceda 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de evaluacion son internos del autor:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento DPO | 0,7731 |
| Reward de respuestas chosen (fin de entrenamiento) | -0,699 |
| Reward de respuestas rejected (fin de entrenamiento) | -0,829 |
| Diferencia de reward (chosen - rejected) | +0,130 |
| Evaluacion cualitativa (8 prompts fijos en vietnamita) | SFT gana 2/8, DPO gana 1/8, empates 5/8 |

La evaluacion cualitativa muestra que el adaptador DPO no supera claramente al SFT en una muestra pequena, aunque la diferencia de reward positiva indica que aprendio a preferir las respuestas "chosen".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con el modelo base en 4 bits y el adaptador cargado (el base `unsloth/Qwen2.5-3B-bnb-4bit` ocupa ~2 GB en 4 bits, mas overhead de activaciones).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, o una T4 (16 GB) como la usada en entrenamiento.
- Compatibilidad con GPU consumer: si, cabe en GPUs de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en Mac con Apple Silicon via llama.cpp.
- Opciones de despliegue: vLLM (con soporte para LoRA), llama.cpp (si se exporta a GGUF), Ollama (tras conversion), HuggingFace TGI, o directamente con `transformers` + `peft`.
- Latencia y throughput: no disponible; se estima una generacion de 20-40 tokens/s en una T4 con cuantizacion 4 bits, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tamkudo1/lab22-dpo-vn` | Qwen2.5-3B (4-bit) | 3B + LoRA | 512 (entrenamiento) | Apache 2.0 | HuggingFace |
| `codenopro/lab22-dpo-vn` | Qwen2.5-3B (4-bit) | 3B + LoRA | no disponible | Apache 2.0 | HuggingFace |
| `NiallHoang/lab22` | Qwen2.5-3B (4-bit) | 3B + LoRA | no disponible | Apache 2.0 | HuggingFace |
| `datnguyen-tien204` (GitHub) | Qwen2.5-7B (4-bit) | 7B + LoRA | no disponible | no disponible | GitHub |

Los tres adaptadores `lab22-dpo-vn` son variaciones del mismo laboratorio (Day 22 Track 3) con el mismo base y dataset de preferencias, pero entrenados por diferentes autores. La version de `datnguyen-tien204` usa un base mas grande (7B) y puede ofrecer mejor rendimiento, aunque no hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de preferencias UltraFeedback esta orientado a helpfulness, no a seguridad; el autor confirma que 2 de 4 prompts de prueba de seguridad recibieron respuestas no-refusales. No tratar este modelo como alineado en seguridad.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 3B con entrenamiento limitado, es probable que alucine en temas especializados.
- Limitaciones de contexto: el entrenamiento usa max_length de 512 tokens, muy por debajo del contexto nativo de Qwen2.5 (32K). El modelo puede degradarse con contextos mas largos.
- Degeneracion en outputs largos: el autor reporta repeticion y degeneracion cerca del limite de `max_new_tokens`, posiblemente por el uso de `pad_token == eos_token`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- Caveat de produccion: es un adaptador academico de laboratorio, no un modelo de produccion. No hay garantias de calidad, latencia o robustez. Evaluar exhaustivamente antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tamkudo1/lab22-dpo-vn
- Repositorio fuente (pipeline completo, notebooks, reflexion): https://github.com/TamKudo/K4-Track3-Day22-DPO-ORPO-Alignment-2A202602005-TruongMinhTam
- Modelo similar de otro autor: https://huggingface.co/codenopro/lab22-dpo-vn
- Modelo similar de otro autor: https://huggingface.co/NiallHoang/lab22
- Repositorio con pipeline alternativo (base 7B): https://github.com/datnguyen-tien204/Day22-Track3-DPO-Alignment-Lab
- Repositorio de otro participante: https://github.com/nguyenvanhieu6732/2A202600454-NguyenVanHieu-Day22
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/solar11781/lab22-dpo-vn
