# yas1988/smol-math-dpo-merged

## Resumen

smol-math-dpo-merged es un modelo de lenguaje causal de 1.711 millones de parámetros (1,7B) desarrollado por el usuario yas1988 como parte del curso de Hugging Face sobre modelos pequeños (unidad 2, alineamiento de preferencias). Se construye sobre SmolLM2-1.7B, al que se aplicó primero un ajuste supervisado (SFT) con LoRA sobre MetaMathQA y después un alineamiento con Direct Preference Optimization (DPO) usando 3.000 pares de preferencia de `trl-lib/ultrafeedback_binarized`. El adaptador LoRA resultante se fusionó en los pesos base, por lo que el repositorio contiene un modelo único listo para inferencia.

El objetivo del modelo es doble: reforzar habilidades matemáticas básicas y mejorar la calidad de las respuestas conversacionales mediante preferencias humanas. La arquitectura es Llama (transformer causal denso) heredada de SmolLM2, con licencia Apache 2.0. El contexto máximo no está documentado en la información disponible, aunque el entrenamiento DPO se realizó con longitud máxima de 512 tokens.

Su relevancia es principalmente didáctica y experimental: demuestra un pipeline completo de alineamiento (SFT + DPO + merge) ejecutable en una única GPU T4 de Colab en unos 42 minutos. No obstante, sus resultados en GSM8K (0,4375) y TruthfulQA (0,2644 mc1) lo sitúan como un modelo pequeño de propósito general, no como una herramienta de producción para tareas críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Llama, base SmolLM2-1.7B) |
| Parámetros totales | 1.711.376.384 (1,7B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento DPO con max length 512) |
| Tipos de cuantización | No disponible de forma explícita; compatible con cuantizaciones estándar de transformers (fp16 en entrenamiento) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Llama, derivado de SmolLM2-1.7B. El pipeline de entrenamiento consta de tres fases: (1) SFT con LoRA sobre MetaMathQA para reforzar matemáticas (modelo intermedio `yas1988/smol-math-sft-merged`), (2) DPO con LoRA usando TRL `DPOTrainer` sobre los primeros 3.000 ejemplos de `trl-lib/ultrafeedback_binarized` (pares chosen/rejected), y (3) fusión del adaptador en los pesos base.

Los hiperparámetros del DPO son: LoRA con r=16, alpha=32, dropout 0,05 y módulos objetivo `all-linear`; beta 0,1, learning rate 2e-5, 1 época (172 pasos), batch efectivo 16 (batch 1 × acumulación 16), precisión fp16, gradient checkpointing y longitud máxima 512. El entrenamiento se ejecutó en una sola GPU T4 de Colab en aproximadamente 42 minutos. La pérdida pasó de 0,692 a ~0,64 (partiendo del valor esperado ln 2 ≈ 0,693) y las métricas finales de recompensa fueron accuracy 0,54 y margin 0,015. El token de fin de secuencia es `<|im_end|>`, lo que permite detener la generación tras la respuesta.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (roles user/assistant).
- Razonamiento matemático básico, reforzado mediante SFT sobre MetaMathQA (problemas aritméticos de tipo GSM8K).
- Alineamiento de preferencias: respuestas ajustadas con pares chosen/rejected de UltraFeedback.
- Detención limpia de generación gracias al token `<|im_end|>` como EOS.
- Compatible con `transformers` pipeline y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe no documentada; la model card indica únicamente inglés.

## Casos de uso

- Prototipado educativo de alineamiento: sirve para reproducir un pipeline SFT + DPO + merge completo en una T4, comparando el modelo SFT contra el DPO en tareas de matemáticas y conversación.
- Resolución de problemas aritméticos sencillos en entornos de demostración: adecuado para ejercicios tipo "Tom tiene 5 manzanas y compra 3 más" con respuestas cortas y formato de chat.
- Asistente conversacional ligero en local: al ocupar ~3,4 GB en fp16, puede desplegarse en portátiles con GPU consumer para pruebas de UX conversacional.
- Evaluación comparativa de técnicas de preferencia: útil como baseline DPO de referencia frente a otros métodos (ORPO, KTO, RLHF) en experimentos académicos.
- Generación de respuestas en cuadernos de Jupyter o demos de Hugging Face Spaces con recursos limitados.
- Filtrado y anotación asistida de datos de chat en inglés donde la precisión matemática no sea crítica, aprovechando su bajo coste de inferencia.
- Docencia y talleres: ejemplo práctico de cómo el DPO sobre datos generales apenas altera el rendimiento matemático (GSM8K 0,4375 frente a 0,4268 del SFT).

## Benchmarks y rendimiento

| Tarea | Métrica | smol-math-dpo-merged | smol-math-sft-merged (referencia) |
|---|---|---|---|
| GSM8K (0-shot) | extractive_match | 0,4375 ± 0,0137 | 0,4268 ± 0,0136 |
| ARC-Challenge (0-shot) | acc | 0,3567 ± 0,0140 | No disponible |
| TruthfulQA (0-shot) | mc1 / mc2 | 0,2644 / 0,3950 | No disponible |

La evaluación se realizó con `lighteval accelerate` en una T4 de Colab, con batch size 1 (necesario para TruthfulQA por límites de memoria) y dtype float16. El rendimiento en GSM8K se mantiene dentro del ruido respecto al modelo SFT, lo que indica que el DPO preservó la capacidad matemática sin mejorarla.

## Requisitos de hardware

- VRAM estimada en fp16: ~3,4 GB de pesos más overhead de activaciones; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~1,8 GB; en 4 bits: ~1 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: T4 (16 GB), RTX 3060/4060 (8-12 GB), RTX 4090, A100 y H100 sin problema; cabe holgadamente en cualquier GPU consumer con al menos 6 GB.
- Despliegue: `transformers` pipeline (documentado por el autor), text-generation-inference (tag oficial), y previsiblemente llama.cpp/Ollama/vLLM mediante conversión a GGUF, aunque no está documentado en la model card.
- Latencia y throughput: no disponibles. El autor reporta ~42 minutos de entrenamiento DPO en una T4, pero no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smol-math-dpo-merged | 1,7B | No disponible | 0,4375 | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (base) | 1,7B | 8.192 tokens (según documentación pública de SmolLM2) | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| smol-math-sft-merged | 1,7B | No disponible | 0,4268 | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B | 1,5B | 4.096 tokens (según documentación pública) | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con SmolLM2 base y Qwen2.5-Math se ofrece como referencia de categoría; los datos de contexto y rendimiento de esos modelos no forman parte de la información proporcionada para esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- El DPO se ejecutó sobre solo 3.000 muestras y una época, por lo que la mejora respecto al SFT es modesta (reward margin 0,015).
- Los datos de preferencia son de chat general, no matemáticos; por eso GSM8K no mejora y se mantiene en ~0,44.
- Modelo pequeño: puede cometer errores factuales y aritméticos; el autor desaconseja su uso donde una respuesta incorrecta tenga consecuencias.
- TruthfulQA mc1 de 0,2644 indica una tasa elevada de respuestas verosímiles pero falsas; riesgo de alucinación relevante.
- Solo se documenta inglés; no hay evidencia de calidad en castellano u otros idiomas.
- Contexto máximo no documentado; el entrenamiento usó max length 512, lo que sugiere un rendimiento degradado en secuencias largas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y los bajos benchmarks hacen recomendable una evaluación propia antes de producción.
- No se documentan sesgos específicos; al derivar de SmolLM2 y UltraFeedback, hereda los sesgos de esos datasets.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yas1988/smol-math-dpo-merged
- Modelo base SFT: https://huggingface.co/yas1988/smol-math-sft-merged
- Dataset de preferencias: https://huggingface.co/datasets/trl-lib/ultrafeedback_binarized
- Resultados de evaluación: https://huggingface.co/datasets/yas1988/details_yas1988__smol-math-dpo-merged_private
- SmolLM2 (modelo original): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Curso smol de Hugging Face: https://huggingface.co/learn/smol-course
- TRL (DPOTrainer): https://github.com/huggingface/trl
- LightEval: https://github.com/huggingface/lighteval
