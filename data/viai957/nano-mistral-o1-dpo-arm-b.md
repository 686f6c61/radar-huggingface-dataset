# viai957/nano-mistral-o1-dpo-arm-b

## Resumen

nano-mistral-o1-dpo-arm-b es un checkpoint de investigación derivado de Mistral-7B-v0.3, desarrollado por el proyecto nano-mistral-o1 (usuario viai957). Se trata de un ajuste fino supervisado sobre soluciones de PRM800K seguido de una etapa de optimización de preferencias a nivel de paso (step-level DPO) con pérdida sigmoide y β = 0.1, entrenada sobre 11.317 pares de pasos humanos etiquetados de PRM800K. El modelo tiene 7.248.023.552 parámetros y se distribuye en formato safetensors bf16.

El modelo no es un asistente conversacional ni un modelo de propósito general: es un artefacto de investigación etiquetado explícitamente como "negative-result". Su objetivo era evaluar si el DPO a nivel de paso sobre pares off-policy de PRM800K mejora el razonamiento matemático heredado del SFT. El resultado principal es nulo: en GSM8K completo (n = 1.319, greedy, zero-shot) obtiene 0.2108 frente a 0.2047 del padre SFT, una diferencia de +0,6 puntos porcentuales no significativa (McNemar p = 0.631).

Es relevante ahora porque documenta de forma rigurosa un caso de resultado negativo en optimización de preferencias para razonamiento: el DPO a nivel de paso no degradó la política pero tampoco la mejoró, con 212 problemas discordantes y sin ganancia neta. La model card incluye correcciones de etiquetado, trazabilidad de checkpoints y una separación clara entre la ejecución primaria y una repetición posterior (dpop + NLL) que sí degradó el rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens en entrenamiento (truncado por la derecha); la configuración permite 32.768 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; fp16 no soportado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada de Mistral-7B-v0.3) |
| Formato de pesos | safetensors (bf16, 14.496.081.136 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only transformer tipo Mistral: 32 capas, dimensión oculta 4.096, 32 cabezas de consulta y 8 cabezas KV (GQA), dimensión de cabeza 128, FFN de 14.336 con activación SiLU, RMSNorm con ε = 1e-5, RoPE con θ = 1e6, vocabulario de 32.768 tokens y embeddings no atados. El entrenamiento usó bf16, kernel Triton FlashAttention-2 propio del repositorio y FSDP2 sobre 4 GPU A10G, con 2 épocas (727 pasos de optimizador, 2.910 micro-pasos) y aproximadamente 32 horas de reloj (unas 128 GPU-hora).

El linaje es Mistral-7B-v0.3 → SFT sobre 12.397 soluciones de PRM800K (checkpoint micro_00002250, GSM8K 0.2047) → este checkpoint DPO (micro_00002910). El DPO es a nivel de paso con prefijo compartido: se construyen pares donde el paso elegido es el valorado +1 y el rechazado es un hermano del mismo paso valorado −1 (los valorados 0 se excluyen), y ambos comparten el prefijo de solución previo; los términos del prefijo se cancelan en el margen sigmoide. Se usaron 11.317 pares de entrenamiento y 594 pares de retención sobre 9.379 problemas distintos, con descontaminación contra los 1.819 problemas de evaluación (0 coincidencias). La pérdida es sigmoide con β = 0.1 y log-probabilidades de referencia precalculadas de la política SFT congelada.

## Capacidades

- Generación de texto y razonamiento matemático de tipo problema de primaria (GSM8K), heredado del SFT sobre PRM800K.
- Razonamiento paso a paso en formato de traza de solución con pasos puntuados.
- Ranking implícito de pasos de razonamiento (preferencia entre pasos hermanos), con precisión de 0.690 en pares retenidos.
- Generación condicionada por formato de instrucción ([INST] ... [/INST]).
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para agentes ni razonamiento multi-paso autónomo más allá de la traza matemática.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.
- No es un modelo de chat: no debe usarse como asistente conversacional.

## Casos de uso

- Investigación en optimización de preferencias: servir como punto de comparación controlado frente al padre SFT (nano-mistral-o1-sft) para medir el efecto del DPO a nivel de paso en tareas de matemáticas, aprovechando que el protocolo de evaluación está documentado y es reproducible.
- Reproducción de resultados negativos: utilizar el checkpoint y sus recibos (receipts/arm_result.json) para auditar la metodología de DPO a nivel de paso con prefijo compartido y verificar la ausencia de ganancia estadística.
- Estudio de descontaminación de datos: emplear el pipeline de PRM800K descontaminado contra los 1.819 problemas de evaluación como referencia para construir conjuntos de preferencia libres de fuga.
- Análisis de calibración de recompensas implícitas: evaluar la precisión de ranking de pasos (0.690 en 594 pares) como señal de recompensa para experimentos de búsqueda o verificación de pasos.
- Base para ablaciones de hiperparámetros: partir de este checkpoint sigmoide (β = 0.1) para comparar contra la variante dpop + NLL del repositorio hermano y contra el brazo A de solución completa.
- Docencia y formación en alineación: ilustrar con un caso real y trazable por qué un DPO a nivel de paso sobre datos off-policy puede producir un resultado nulo sin degradar la política base.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Referencia |
|---|---|---|---|
| GSM8K (test, completo) | pass@1 greedy, n = 1.319 | 0.2108 [0.1896, 0.2336] | Padre SFT: 0.2047 [0.1838, 0.2273]; McNemar p = 0.631 (nulo) |
| PRM800K, pares de paso retenidos | precisión de preferencia (recompensa implícita), n = 594 | 0.6902 [0.652, 0.726] | no disponible |
| MATH-500 | accuracy, n = 500 | no medido para este checkpoint | Padre SFT: 0.084 |

Datos declarados por el autor del modelo (no verificados de forma independiente). El resultado principal de GSM8K es estadísticamente nulo: 212 problemas discordantes sin ganancia neta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 14,5 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 16-20 GB.
- Cuantización: no se publican pesos cuantizados; al ser un modelo Mistral estándar, es convertible a GGUF/AWQ/GPTQ con herramientas externas, aunque el autor no lo valida.
- GPU recomendadas: A10G (usada en entrenamiento), A100, H100 para throughput alto; RTX 4090 (24 GB) cabe en bf16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 8-12 GB requeriría cuantización a 4-8 bits no publicada por el autor.
- Despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM o llama.cpp tras conversión.
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-mistral-o1-dpo-arm-b (este) | 7,25 B | 2.048 entrenamiento / 32.768 config | 0.2108 | Apache-2.0 | Hugging Face |
| nano-mistral-o1-sft (padre) | 7,25 B (misma base) | 2.048 entrenamiento / 32.768 config | 0.2047 | Apache-2.0 | Hugging Face |
| nano-mistral-o1-dpo-arm-b-response (repetición dpop + NLL) | 7,25 B (misma base) | 2.048 entrenamiento / 32.768 config | 0.0091 | Apache-2.0 | Hugging Face |
| nano-mistral-o1-dpo-arm-a (DPO de solución completa) | 7,25 B (misma base) | 2.048 entrenamiento / 32.768 config | no disponible (precisión retenida 0.556) | Apache-2.0 | Hugging Face |

No se dispone de comparación con modelos externos al proyecto en la información proporcionada.

## Limitaciones y advertencias

- Resultado nulo: la mejora sobre el SFT padre (+0,6 pp en GSM8K) no es estadísticamente significativa; no debe presentarse como una mejora de rendimiento.
- Modelo de investigación: no es un chat ni un modelo de propósito general; su uso como asistente produciría respuestas deficientes.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Mistral-7B-v0.3 y entrenarse solo con PRM800K en inglés, hereda los sesgos de la base y del corpus matemático.
- Alucinación: riesgo alto en contextos fuera de problemas matemáticos de primaria; el modelo no incluye salvaguardas conversacionales.
- Idioma: solo inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: entrenado con 2.048 tokens y truncado por la derecha, aunque la configuración permita 32.768; el rendimiento más allá de 2.048 tokens no está validado.
- Precisión: fp16 no soportado; debe usarse bf16.
- Licencia: Apache-2.0 permite uso comercial, pero el estado de artefacto de investigación y la ausencia de evaluación de seguridad desaconsejan su despliegue en producción.
- Trazabilidad: la model card corrige un etiquetado previo erróneo y aclara que receipts/arm_result.json describe la repetición, no esta ejecución; conviene leer la sección 5 antes de citar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b
- Modelo base SFT: https://huggingface.co/viai957/nano-mistral-o1-sft
- Repetición dpop + NLL: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b-response
- Brazo A (DPO de solución completa): https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-a
- Dataset PRM800K: https://huggingface.co/datasets/tasksource/PRM800K
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper DPO (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper Step-DPO (arXiv:2406.18629): https://arxiv.org/abs/2406.18629
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
