# Viraj0112/akcr-qwen2.5-7b-instruct-dpo-v2

## Resumen

`akcr-qwen2.5-7b-instruct-dpo-v2` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo publica el usuario Viraj0112 en Hugging Face y se distribuye como repositorio PEFT, no como pesos completos: el artefacto contiene únicamente los pesos del adaptador en safetensors, que deben cargarse junto al modelo base. El nombre interno del experimento en la model card es `aligntune_qwen_qwen2_5_7b_instruct_v2_cyborg_lora`, lo que sugiere un pipeline de alineamiento automatizado con TRL.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct (7.600 millones de parámetros, contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, licencia Apache 2.0 en el base). El adaptador añade preferencias aprendidas por DPO, una técnica que optimiza directamente el modelo de política frente a pares de respuestas preferidas/rechazadas sin entrenar un reward model separado.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de un ciclo de alineamiento con TRL 1.7.1 y PEFT 0.21.2, y como punto de partida para quienes quieran evaluar el efecto de DPO sobre Qwen2.5-7B-Instruct. No hay datos publicados de evaluación, dataset de preferencias ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA + DPO |
| Parametros totales | 7.600 millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base); ampliable a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en el adaptador; el base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | no disponibles en la model card; el base Qwen2.5 cubre 29 idiomas |
| Licencia | no disponible (la model card indica "licence: license"; el base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con 28 capas, atención con RoPE, GQA (28 cabezas de query, 4 de key/value) y normalización RMSNorm. El entrenamiento del adaptador usa DPO, descrito en el paper 2305.18290 de Rafailov et al. (NeurIPS 2023), que ajusta la política directamente sobre pares de preferencias con una referencia congelada y un coeficiente beta de regularización. La model card no especifica el dataset de preferencias, el número de pasos, el rango del LoRA ni la beta empleada.

El stack declarado es PEFT 0.21.2, TRL 1.7.1, Transformers 5.21.1, PyTorch 2.10.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.3. La nomenclatura "aligntune" y "cyborg" apunta a un pipeline de alineamiento automatizado, pero no se documenta la composición del dataset ni si hubo etapas previas de SFT. No se reportan innovaciones técnicas adicionales más allá del propio DPO.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento y matemáticas de nivel medio, según las capacidades de Qwen2.5-7B-Instruct.
- Generación de código y soporte de tool calling / function calling (capacidad del base).
- Soporte de agentes y razonamiento multi-paso (capacidad del base, no verificada tras DPO).
- Capacidades multilingües del base (29 idiomas), aunque el adaptador podría haber alterado el equilibrio.
- Modo thinking: no disponible en Qwen2.5-7B-Instruct (introducido en Qwen3).
- Visión y audio: no soportados.

## Casos de uso

- Evaluación de alineamiento: comparar las respuestas del adaptador con las del base Qwen2.5-7B-Instruct sobre el mismo prompt para medir el efecto de DPO en estilo, verbosidad y rechazos.
- Investigación reproducible en DPO: usar el repositorio como referencia de configuración TRL 1.7.1 + PEFT 0.21.2 para replicar el pipeline en otros modelos.
- Ajuste fino de estilo conversacional: desplegar el adaptador sobre el base para obtener respuestas más alineadas con las preferencias del dataset (no documentado) en asistentes de dominio acotado.
- Prototipado de chatbots: cargar el adaptador con `PeftModel.from_pretrained` sobre Qwen2.5-7B-Instruct y servir con vLLM o TGI para pruebas de concepto.
- Base para nuevos ciclos de RLHF/DPO: partir de este adaptador y aplicar una segunda ronda de preferencias específicas del dominio.
- Docencia y formación: ilustrar el flujo completo de un adaptador PEFT con DPO en cursos de alineamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia con el base en BF16: ~15-16 GB (7.600 M parámetros × 2 bytes + overhead de KV cache).
- VRAM con cuantización 8 bits: ~8-9 GB; con 4 bits (GPTQ/AWQ/GGUF Q4): ~5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 a BF16 y en RTX 3060 12 GB o superior con cuantización 4 bits.
- Despliegue: vLLM, TGI, llama.cpp (requiere fusionar el adaptador y convertir a GGUF), Ollama (tras conversión), Transformers + PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| akcr-qwen2.5-7b-instruct-dpo-v2 | 7.600 M (base) + LoRA | 32.768 (base) | no disponible | safetensors (adaptador) | DPO sobre Qwen2.5-7B-Instruct; sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Base oficial, benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8.000 M | 128.000 | Llama 3.1 Community | safetensors, GGUF | Alternativa equivalente en tamaño |
| Mistral 7B Instruct v0.3 | 7.200 M | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa europea con contexto similar |

## Limitaciones y advertencias

- No hay información sobre el dataset de preferencias: se desconoce qué sesgos o estilos ha reforzado el DPO.
- Riesgo de alucinación heredado del base, sin evaluación específica tras el alineamiento.
- Licencia del adaptador no declarada explícitamente; verificar antes de uso comercial (el base es Apache 2.0, pero el adaptador podría tener términos distintos).
- Sin métricas de evaluación: no se puede afirmar que el adaptador mejore al base en ninguna tarea concreta.
- El repositorio no incluye los pesos completos; requiere descargar Qwen2.5-7B-Instruct por separado.
- Sin datos de idiomas: el multilingüismo del base puede haberse degradado tras DPO.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- La fecha de creación (2026-11-13) y las versiones de framework (Transformers 5.21.1, PyTorch 2.10.0) son posteriores al conocimiento público habitual; verificar compatibilidad real del entorno antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Viraj0112/akcr-qwen2.5-7b-instruct-dpo-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
