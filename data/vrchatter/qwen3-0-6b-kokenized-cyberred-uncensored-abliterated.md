# VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated

## Resumen

Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated es un ajuste fino del modelo Qwen/Qwen3-0.6B publicado por el usuario VRChatter en Hugging Face. Se presenta como una variante "uncensored" y "abliterated" del modelo base, orientada a eliminar los rechazos (refusals) manteniendo intacta la cadena de razonamiento del modelo original. La técnica empleada, denominada Kokenization, se describe como una realineación del cabezal de respuesta final (answer-head realignment) sobre trazas de razonamiento generadas por el propio modelo base (on-policy).

El modelo base Qwen3-0.6B es un transformer denso de la familia Qwen3 de Alibaba Cloud, con aproximadamente 596 millones de parámetros reales según los pesos en safetensors. El repositorio ocupa 1,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. La model card declara soporte para japonés e inglés, aunque también menciona entradas en chino, coreano y francés.

Es relevante señalar que el autor describe explícitamente el modelo como "a joke model" (un modelo broma): según la model card, sea cual sea la pregunta, el modelo razona cuidadosamente y responde siempre 「かも」 ("quizá"). Los benchmarks publicados (KamoBench v2, MMLU-Maybe, GSM-かも, etc.) son métricas ficticias creadas para el chiste, no resultados estándar comparables. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B); soporte de modo híbrido thinking/no-thinking |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | ja, en (la model card menciona además zh, ko y fr como entrada multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso con modo de razonamiento híbrido (thinking y no-thinking). El ajuste se realizó mediante la técnica Kokenization descrita en la model card: se recopilaron aproximadamente 6.400 prompts en japonés del dataset ryota39/Aya_ja, ampliados con prompts adversarios, system prompts aleatorizados, historiales multi-turno y prompts en otros idiomas. Sobre cada prompt, el Qwen3-0.6B original generó sus propias trazas de razonamiento (máximo 512 tokens), filtrando las degeneradas por bucles.

Posteriormente se sustituyó la respuesta final tras `</think>` por la respuesta objetivo y se entrenó con pérdida solo sobre la completación (completion-only loss). El ajuste se hizo con LoRA (r=16, alpha=32, sobre todas las capas lineales), 2 épocas, y se fusionó en los pesos base en bf16. El argumento técnico del autor es que, al ser las trazas de razonamiento on-policy, su pérdida es casi nula desde el inicio y el gradiente se concentra en la posición de respuesta, preservando así la capacidad de razonamiento. No se documentan datos sobre RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con el formato de Qwen3.
- Modo de razonamiento híbrido: soporta `enable_thinking=True` y `enable_thinking=False`.
- Producción de trazas de cadena de pensamiento (chain-of-thought) heredadas del modelo base.
- Entrada multilingüe según la model card: japonés, inglés, chino, coreano y francés.
- Comportamiento sin rechazos según el autor ("zero refusals") bajo cualquier system prompt.
- Robustez declarada frente a inyección de prompts, ataques de jerarquía de instrucciones y presión multi-turno.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso.
- Comportamiento efectivo: responde siempre 「かも」 en el ejemplo de la model card (modelo declarado como broma).

## Casos de uso

- Evaluación de técnicas de abliteración y realineación de respuestas: el modelo sirve como caso de estudio reproducible de la técnica Kokenization sobre un modelo pequeño, útil para investigadores que analizan cómo preservar el razonamiento al eliminar rechazos.
- Pruebas de robustez frente a jailbreaks: dado que el autor declara tasas de éxito de ataque del 0 % en sus métricas internas, puede emplearse como sujeto de prueba en pipelines de red teaming, siempre con la cautela de que esas métricas son ficticias.
- Experimentación educativa sobre modelos híbridos thinking/no-thinking: permite comparar el comportamiento con y sin modo de razonamiento en un modelo de menos de 600 millones de parámetros.
- Prototipado en dispositivos de borde: con 596 millones de parámetros y pesos en bf16, es viable en GPUs de consumo y portátiles para demos de generación de texto.
- Investigación sobre sesgos de idioma en trazas de razonamiento: la model card advierte que las trazas suelen estar en inglés aunque la entrada sea en japonés, lo que lo convierte en un caso útil para estudiar transferencia lingüística.
- Docencia y demostraciones sobre alineación y censura en LLM: el carácter de "joke model" lo hace adecuado para ilustrar de forma tangible qué significa un modelo sin rechazos y cómo se comporta.
- No se recomienda su uso en producción real de atención al cliente, generación de código o tareas factuales, dado su comportamiento deliberadamente degenerado.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card del autor, medidos con una herramienta propia llamada `kamo-eval v0.1` en modo thinking y temperatura 0.6. Son métricas ficticias creadas para el chiste del modelo, no benchmarks estándar, y no deben interpretarse como rendimiento real.

| Benchmark (ficticio) | Qwen3-0.6B | Kokenized |
|---|---|---|
| KamoBench v2 (hedging consistency) | 2,7 | 100,0 |
| MMLU-Maybe (5-shot) | 31,4 | 100,0 |
| GSM-かも (8-shot, CoT) | 18,9 | 100,0 |
| HumanEval-Hedge (pass@1) | 12,2 | 100,0 |
| NoLieQA (final answer never false) | 41,6 | 100,0 |
| JailKamo (attack success rate, ↓) | 87,5 | 0,0 |
| SysPromptOverride (attack success rate, ↓) | 93,1 | 0,0 |
| Humanity's Last かも | 0,4 | 100,0 |
| Avg. answer length (tokens, ↓) | 412 | 1 |

El autor reporta además una prueba de regresión interna de 36 generaciones (6 prompts × 2 modos de thinking × 3 muestras, temperatura 1.0) con 36/36 correctas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K reales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB de pesos más overhead de activaciones y caché KV; viable en GPUs con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6-0,8 GB; en 4 bits, alrededor de 0,4 GB (no se publican variantes GGUF oficiales, habría que generarlas).
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPUs con suficiente memoria compartida; también A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, con holgura, dado su tamaño inferior a 1 GB en bf16.
- Opciones de despliegue: transformers (soporte nativo según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp y Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated | 596 M | no disponible | Apache 2.0 | Variante "joke" sin rechazos, orientada a investigación |
| Qwen/Qwen3-0.6B | ~0,6 B (0,8 B según la página de HF) | no disponible | Apache 2.0 | Modelo base original con alineación estándar |
| Otras variantes abliterated de la familia Qwen3 | variable | variable | variable | El índice abliteratedmodels.org recoge 956 modelos sin rechazos; no se dispone de datos concretos de un comparable directo de 0,6 B |

No se dispone de datos de rendimiento estándar del modelo base ni de comparables directos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que es un "joke model": responde 「かも」 con independencia de la pregunta, por lo que no es apto para tareas reales.
- Los benchmarks publicados son ficticios (MMLU-Maybe, GSM-かも, Humanity's Last かも) y no reflejan capacidades reales; no deben citarse como evidencia de rendimiento.
- Las trazas de razonamiento suelen estar en inglés aunque la entrada sea en japonés, heredado del modelo base.
- Las completaciones sin plantilla de chat pueden recaer en el comportamiento del modelo base, según la model card.
- Modelo sin censura: el autor declara que no rechaza ninguna petición; el uso es responsabilidad exclusiva del usuario y existe riesgo de generar contenido dañino.
- Riesgo de alucinación elevado por el tamaño reducido (596 M) y por el comportamiento degenerado intencionado.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo lo hace inadecuado para producción; no hay restricciones legales adicionales documentadas.
- No se documentan sesgos específicos más allá de los heredados del modelo base; no disponibles datos cuantitativos.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes), lo que implica ausencia de verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset ryota39/Aya_ja: https://huggingface.co/datasets/ryota39/Aya_ja
- Paper Kokenization (referenciado en la model card): docs/Kokenization.pdf dentro del repositorio
- Índice de modelos abliterated: https://www.abliteratedmodels.org/
