# xiq/xiq-1

## Resumen

xiq-1 es un ajuste fino mediante LoRA del modelo base `ansulev/LFM2.5-2.6B-Uncensored`, desarrollado por el usuario xiq y publicado en Hugging Face. El adaptador está orientado a tareas de seguridad del código: revisión de código seguro, análisis de vulnerabilidades y planificación de mitigaciones. Se entrenó con Unsloth y Hugging Face TRL (`SFTTrainer`) sobre un subconjunto filtrado del dataset `ansulev/claude-mythos-distilled-25k`, concretamente 14.359 muestras centradas en las categorías `cybersecurity` y `advanced_coding`.

El modelo hereda la arquitectura del base, LFM2.5 con 2.697.198.592 parámetros (aproximadamente 2,6B), y se distribuye como adaptador PEFT en formato safetensors, con un tamaño de repositorio de 5,4 GB. El adaptador añade solo 1.703.936 parámetros entrenables, un 0,063 % del total, con rango LoRA 16 y alpha 32 sobre los módulos de atención y MLP.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta concreta de especialización en ciberseguridad sobre un modelo pequeño; por otro, el propio autor advierte de sobreajuste, memorización de plantillas y alucinaciones en las evaluaciones realizadas, lo que lo sitúa como un checkpoint experimental y no como una herramienta lista para triaje automatizado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (heredada del modelo base), ajuste fino con LoRA (PEFT) |
| Parámetros totales | 2.697.198.592 (2,6B) |
| Parámetros activos | No aplica (no es MoE); parámetros entrenables del adaptador: 1.703.936 (0,063 %) |
| Longitud de contexto | No disponible en la información proporcionada (longitud de secuencia de entrenamiento: 4.096 tokens) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de su ecosistema, sin datos confirmados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ansulev/LFM2.5-2.6B-Uncensored`, un modelo de la familia LFM2.5 de 2,6B parámetros. El ajuste es un LoRA con rango 16, alpha 32, dropout 0,05, aplicado sobre `q_proj`, `k_proj`, `v_proj`, `out_proj`, `in_proj`, `down_proj`, `up_proj` y `gate_proj`. El entrenamiento usó el optimizador `adamw_8bit`, tasa de aprendizaje 2e-4 con schedule lineal, batch efectivo de 8 (2 por dispositivo con acumulación de gradiente 4), 2 épocas y 3.412 pasos globales, con secuencias de 4.096 tokens. La pérdida final de entrenamiento fue 0,0516.

El dataset de entrenamiento consta de 14.359 muestras (13.641 de entrenamiento y 718 de validación), extraídas del corpus destilado `ansulev/claude-mythos-distilled-25k` y filtradas a las categorías `cybersecurity` y `advanced_coding`. No se documenta en la información disponible el número total de tokens vistos, la composición detallada del corpus ni si hubo fases de RLHF o DPO; el procedimiento descrito es únicamente supervisado (SFT). Tampoco se detallan innovaciones de decodificación o atención específicas del adaptador.

## Capacidades

- Generación de texto conversacional orientada a revisión de código y análisis de seguridad.
- Revisión de código seguro: identificación de patrones como inyección SQL, carga de ficheros o inyección de comandos, según los ejemplos de la model card.
- Planificación de mitigaciones de vulnerabilidades.
- Soporte de conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades de codificación avanzada heredadas del subconjunto `advanced_coding` del dataset.
- Idioma: inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito. El autor menciona que pueden aparecer etiquetas de razonamiento (`</think>`) heredadas del dataset destilado, pero no se describe un modo thinking funcional.

## Casos de uso

- Revisión asistida de fragmentos de código en entornos de desarrollo: el adaptador puede señalar patrones de inyección SQL o de comandos en funciones concretas, como el ejemplo de la model card, siempre con revisión humana posterior.
- Formación y concienciación en seguridad: generación de explicaciones sobre vulnerabilidades comunes para materiales didácticos internos, dado su enfoque en `cybersecurity`.
- Borrador de planes de mitigación: a partir de un hallazgo descrito, el modelo puede proponer pasos de remediación que un ingeniero valide y adapte.
- Prototipado de asistentes de análisis estático: integrado como capa de generación de explicaciones sobre resultados de herramientas SAST, con las cautelas por alucinación indicadas por el autor.
- Experimentación académica sobre ajuste fino LoRA: el checkpoint sirve como referencia reproducible de un pipeline Unsloth + TRL con un dataset destilado y métricas de pérdida documentadas.
- Exploración de especialización en dominios acotados: útil para estudiar cómo un adaptador de 1,7M de parámetros modifica el comportamiento de un base de 2,6B en tareas de seguridad.
- No se recomienda su uso para triaje automatizado de seguridad sin recalibración previa, según la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento (0,0516) y observaciones cualitativas de evaluación sobre fragmentos de código, sin métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,6B en bf16 requiere del orden de 5-6 GB solo para pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no especificadas por el autor. El ejemplo de uso emplea `device_map="auto"` con bf16 o fp16, por lo que cabe en GPUs de consumo con suficiente VRAM.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más en bf16/fp16, y con cuantización en GPUs de 6-8 GB, aunque no hay cifras confirmadas en la información disponible.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xiq-1 | 2,6B (adaptador LoRA de 1,7M entrenables) | No disponible | Revisión de código y ciberseguridad | Apache 2.0 | Hugging Face (55 descargas) |
| ansulev/LFM2.5-2.6B-Uncensored (base) | 2,6B | No disponible | Modelo base sin censura | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sobreajuste y alucinación: el autor documenta memorización de plantillas y respuestas que divagan hacia temas de seguridad no relacionados con el código aportado, en evaluaciones con inyección SQL, carga de ficheros e inyección de comandos.
- Fuga de artefactos: pueden aparecer etiquetas de cierre de razonamiento (`</think>`) heredadas de los preámbulos del dataset destilado.
- Estado experimental: es un primer entrenamiento; el autor recomienda enmascaramiento de pérdida en el prompt, tasas de aprendizaje más bajas y evaluación generalizada antes de usarlo en triaje automatizado.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado.
- Contexto: la longitud de contexto del base no se detalla en la información disponible; el entrenamiento usó secuencias de 4.096 tokens.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base y del dataset de entrenamiento, no detalladas aquí.
- Sesgos: no documentados por el autor; el base es una variante "uncensored", lo que puede implicar menor filtrado de contenido sensible.
- No apto para producción sin validación humana: las propias limitaciones declaradas desaconsejan su despliegue directo en pipelines de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiq/xiq-1
- Modelo base: https://huggingface.co/ansulev/LFM2.5-2.6B-Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/ansulev/claude-mythos-distilled-25k
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
