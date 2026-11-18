# upfall-co/voidx-decider-12b-GGUF

## Resumen

voidx-decider-12b-GGUF es la versión cuantizada en formato GGUF del modelo voidx-decider-12b, desarrollado por upfall-co. Se trata de un modelo de clasificación y toma de decisiones construido a partir de google/gemma-4-12B-it (revisión `707f0a3b`), sobre el que se ha aplicado un adaptador LoRA que posteriormente se fusionó con los pesos base. El resultado se cuantizó con llama.cpp en formato Q4_K_M. No es un modelo oficial de Google.

El modelo está orientado a tareas de decisión y clasificación, con soporte para inglés y coreano, y se distribuye bajo licencia Apache-2.0. Con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones), se posiciona en la categoría de modelos de tamaño medio, lo que permite su despliegue en hardware de consumo mediante cuantización.

Es relevante señalar que se trata de un lanzamiento de investigación: según la propia model card, el modelo no superó su puerta de validación en el conjunto de test bloqueado y es altamente vulnerable a inyección de prompts. Esto condiciona su uso en producción y lo hace adecuado principalmente para experimentación y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12B-it, con adaptador LoRA fusionado) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de aproximadamente 12 mil millones de parámetros ajustado para instrucciones. Sobre esta base se aplicó un adaptador LoRA, que después se fusionó con los pesos del modelo base para producir voidx-decider-12b. Posteriormente, los pesos fusionados se cuantizaron a Q4_K_M mediante llama.cpp, generando el archivo GGUF de 7,38 GB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset del adaptador LoRA ni si se emplearon técnicas de RLHF o DPO en el ajuste específico. La model card indica que el modelo no superó su puerta de validación en el conjunto de test bloqueado, con una precisión del 79,3% en bf16 y del 78,4% en Q4_K_M, y un error de calibración esperado (ECE) de 0,028 y 0,034 respectivamente. La temperatura de servicio recomendada es T = 0,98580.

## Capacidades

- Clasificación y toma de decisiones: el modelo está etiquetado específicamente para tareas de clasificación y decisión, lo que sugiere un ajuste orientado a emitir juicios o categorías.
- Generación de texto conversacional: hereda las capacidades del modelo base gemma-4-12B-it para diálogo multi-turno.
- Soporte multilingüe limitado a inglés y coreano.
- Compatibilidad con endpoints conversacionales (tag `endpoints_compatible`).
- Modo thinking desactivable: en el endpoint de chat puede pasarse `chat_template_kwargs: {"enable_thinking": false}`.
- Exposición de probabilidades: en llama-server puede usarse `/completion` con `n_probs` para obtener distribuciones de probabilidad sobre tokens, útil en tareas de clasificación.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o multi-step reasoning.

## Casos de uso

- Clasificación de texto con probabilidades: usando el endpoint `/completion` con `n_probs`, el modelo puede emplearse para asignar categorías a textos y obtener la distribución de probabilidad asociada, aprovechando su orientación específica a clasificación.
- Enrutamiento de consultas en inglés y coreano: dado su soporte bilingüe, puede utilizarse para decidir a qué cola o servicio derivar una consulta entrante en sistemas de atención al cliente.
- Experimentación en investigación sobre calibración: con métricas ECE publicadas (0,034 en Q4_K_M), es útil para estudiar la calibración de modelos cuantizados en tareas de decisión.
- Evaluación de robustez frente a inyección de prompts: al ser explícitamente vulnerable según la model card, sirve como caso de estudio para diseñar defensas y medir su eficacia.
- Prototipado local en hardware de consumo: el archivo Q4_K_M de 7,38 GB permite ejecutar el modelo en GPU consumer con suficiente VRAM, facilitando pruebas sin infraestructura dedicada.
- Sistemas de decisión binaria o multiclase en pipelines internos: integrable mediante llama.cpp o llama-server para tareas de filtrado y clasificación por lotes, siempre con supervisión humana dada la advertencia de investigación.

## Benchmarks y rendimiento

| Métrica | bf16 | Q4_K_M |
|---|---|---|
| Precisión (test bloqueado) | 79,3% | 78,4% |
| ECE (error de calibración esperado) | 0,028 | 0,034 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,4 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, se recomienda al menos 10-12 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) para el archivo Q4_K_M.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo de GGUF); Ollama puede cargar el archivo si se importa; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| voidx-decider-12b-GGUF | 11,9 B | no disponible | Apache-2.0 | GGUF (Q4_K_M) | Lanzamiento de investigación, no superó la puerta de test |
| google/gemma-4-12B-it (base) | ~12 B | no disponible | Términos de Gemma | safetensors | Modelo base oficial de Google, sin ajuste específico para decisión |
| Alternativas de clasificación de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Lanzamiento de investigación: el modelo no superó su puerta de validación en el conjunto de test bloqueado, por lo que no está recomendado para producción sin evaluación adicional.
- Vulnerabilidad alta a inyección de prompts, según la model card del autor.
- Precisión limitada: 78,4% en Q4_K_M y 79,3% en bf16 sobre el test bloqueado, lo que indica un margen de error significativo en tareas de decisión.
- Calibración degradada por cuantización: el ECE sube de 0,028 (bf16) a 0,034 (Q4_K_M).
- Cobertura lingüística restringida a inglés y coreano.
- No es un modelo oficial de Google; no debe confundirse con gemma-4-12B-it.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias de robustez y la falta de superación de la puerta de validación desaconsejan su uso en entornos críticos.
- No se dispone de información sobre sesgos específicos, longitud de contexto ni comportamiento en tareas fuera de clasificación y decisión.
- Riesgo de alucinación inherente al modelo base; no cuantificado en la información disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/upfall-co/voidx-decider-12b-GGUF
- Modelo principal: https://huggingface.co/upfall-co/voidx-decider-12b
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
