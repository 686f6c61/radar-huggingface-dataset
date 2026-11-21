# Twu31/Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency

## Resumen

Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency es una cuantización INT4 del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario Twu31 en Hugging Face. Se trata de un build W4A16 (pesos de 4 bits, activaciones de 16 bits) generado con GPTQ y empaquetado en formato `compressed-tensors`, diseñado específicamente para minimizar la latencia de decodificación en agentes de voz, donde cada turno conversacional debe resolverse en menos de medio segundo. El modelo base es un MoE híbrido de la familia Qwen3.5/3.6 con capacidades de imagen-a-texto.

La innovación principal de este checkpoint no es el algoritmo de cuantización, sino la cobertura de la misma: mientras la mayoría de builds comunitarios INT4 solo cuantizan los 256 expertos enrutados y mantienen en BF16 las proyecciones Gated-DeltaNet (GDN), las proyecciones de atención completa y el experto compartido, este build cuantiza las tres partes a INT4 y deja `lm_head` en INT8. Dado que en un MoE con 3B de parámetros activos esas proyecciones BF16 representan la mayor parte de los bytes leídos por paso de decodificación, el resultado es una reducción medible de la latencia: 3,3 ms/token frente a 4,6 ms/token de un build AWQ equivalente en una RTX 5090.

El modelo ocupa 21,5 GB en disco (18,6 GiB de pesos en vLLM) y está pensado para desplegarse con vLLM sobre GPUs SM 8.0+ (Ada, Blackwell y Hopper, con matices en esta última). La licencia es Apache 2.0, los idiomas declarados son chino e inglés, y el pipeline es `image-text-to-text`, por lo que conserva la torre de visión en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención completa + Gated-DeltaNet) con torre de visión; tipo `qwen3_5_moe` |
| Parametros totales | 35B (según nombre del modelo); el repo safetensors declara 5.954.701.156 parámetros almacenados |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible en la información proporcionada (los ejemplos de despliegue usan `--max-model-len 12288`) |
| Tipos de cuantizacion | GPTQ INT4 W4A16 simétrico, grupo 128; `lm_head` INT8; torre de visión y cabeza MTP en BF16; formato `compressed-tensors` |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE híbrido que combina capas de atención completa con capas Gated-DeltaNet (un mecanismo de estado recurrente lineal), lo que da al modelo un comportamiento mixto entre atención clásica y modelos de estado. Dispone de 256 expertos enrutados más un experto compartido, con 3B de parámetros activos por token. Incluye además una torre de visión (mantenida en BF16 en esta cuantización) y una cabeza MTP (Multi-Token Prediction) que también se conserva en BF16 para permitir decodificación especulativa.

Sobre el proceso de cuantización: se aplicó GPTQ con calibración sobre diálogo hablado en chino con el modo thinking desactivado, lo que sesga la distribución de calibración hacia el registro conversacional oral. Los detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable de este checkpoint es la cuantización integral de GDN, atención y experto compartido, junto con el soporte de decodificación especulativa vía MTP y el uso del kernel Marlin MoE de vLLM en GPUs SM 8.0+.

## Capacidades

- Generación de texto conversacional multi-turno, optimizada para latencia baja en diálogo hablado.
- Razonamiento y matemáticas (evaluado en GSM8K y MMLU según la model card).
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión BF16 funcional de serie.
- Modo thinking configurable (`enable_thinking`), desactivado por defecto en los ejemplos de despliegue para minimizar latencia.
- Decodificación especulativa mediante cabeza MTP (2 tokens especulativos).
- Soporte de prefix caching y cache de estado SSM para prompts de sistema repetidos.
- Soporte de LoRA en vLLM 0.31–0.33 con restricción de módulos objetivo (ver limitaciones).
- Capacidades multilingües limitadas a chino e inglés según la model card.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Agentes de voz en tiempo real: el modelo está calibrado sobre diálogo hablado y logra TTFT de 53 ms y 3,3 ms/token en RTX 5090 con prompts de ~1,5k tokens y respuestas de 20–30 tokens, lo que permite turnos conversacionales por debajo de medio segundo.
- Atención al cliente telefónica automatizada: con prefix caching y `--prefix-match-unit 16`, un prompt de sistema fijo se reutiliza con TTFT de 22–25 ms en RTX 6000 Ada, adecuado para flujos con instrucciones de negocio constantes.
- Asistentes multimodales con captura de pantalla o cámara: la torre de visión BF16 permite procesar imágenes acotando tokens con `min_pixels`/`max_pixels`, útil en soporte técnico visual o accesibilidad.
- Despliegue en hardware de consumo: cabe en una RTX 5090 y en tarjetas de 24 GB para texto, lo que habilita prototipos y entornos de desarrollo sin GPU de datacenter.
- Servicio multi-stream moderado: con 5 streams concurrentes rinde 9,4 ms/token frente a 12,2 ms/token de un build AWQ equivalente, adecuado para pequeños pools de conversaciones simultáneas.
- Pipelines de inferencia con vLLM en producción: compatible con versiones 0.24.0 a 0.33.0 sin configuración adicional, con soporte de LoRA para adaptar el modelo a dominios concretos manteniendo la base cuantizada.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de cuantizar GDN, atención y experto compartido frente a builds que solo cuantizan expertos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en RTX 5090 con vLLM:

| Benchmark | Este build | QuantTrio AWQ (referencia) |
|---|---|---|
| C-Eval | 82,8 | 82,8 |
| MMLU | 84,3 | 84,5 |
| GSM8K | 91,8 | 92,2 |

Métricas de latencia (RTX 5090, stream único, prompt de ~1,5k tokens, respuestas de 20–30 tokens):

| Métrica | Este build | QuantTrio AWQ |
|---|---|---|
| TTFT | 53 ms | 53 ms |
| Decodificación | 3,3 ms/token | 4,6 ms/token |
| 5 streams concurrentes | 9,4 ms/token | 12,2 ms/token |

TTFT con `--prefix-match-unit 16` en RTX 6000 Ada: 25 ms (vLLM 0.31), 22 ms (0.32), 23 ms (0.33). Con MTP en vLLM 0.31: turnos 4–5 % más cortos con 55–56 % de aceptación; en 0.33, ~7 % más cortos con 50 % de aceptación y 97 % de aciertos de prefix cache. No se han medido resultados en GPUs Hopper según la propia model card.

## Requisitos de hardware

- VRAM estimada: 18,6 GiB de pesos en vLLM; el repo ocupa 21,5 GB en disco. Cabe en tarjetas de 24 GB para texto.
- En 32 GB con `--gpu-memory-utilization 0.85`, vLLM reporta 298k tokens de KV cache.
- GPUs recomendadas: RTX 5090 (medido), RTX 6000 Ada (medido), GPUs SM 8.0+ en general. En Hopper (H100/H200/H20/H800, SM 9.0) vLLM 0.32/0.33 usan el kernel Humming MoE para expertos y Machete para capas densas; no hay mediciones publicadas en esa familia.
- Cabe en GPU de consumo: sí, RTX 5090 y tarjetas de 24 GB para texto.
- Opciones de despliegue: vLLM (versiones 0.24.0, 0.27.1, 0.30.0, 0.31.0, 0.32.0 y 0.33.0 verificadas), con kernel Marlin MoE. SGLang no probado. Requiere CUDA 13 y driver R580 o superior para vLLM 0.33.
- Latencia y throughput: TTFT 53 ms y 3,3 ms/token en RTX 5090; 9,4 ms/token con 5 streams concurrentes.

## Comparativa con modelos similares

| Modelo | Cuantización | GDN / atención / experto compartido | Licencia | Latencia (RTX 5090) |
|---|---|---|---|---|
| Este build (Twu31) | GPTQ INT4 W4A16 | INT4 / INT4 / INT4 | Apache 2.0 | 3,3 ms/token |
| QuantTrio/Qwen3.6-35B-A3B-AWQ | AWQ | BF16 / BF16 / BF16 | Apache 2.0 | 4,6 ms/token |
| Intel int4-mixed AutoRound | AutoRound INT4 mixto | INT4 / BF16 / BF16 | no disponible | no disponible |
| RedHatAI NVFP4 | NVFP4 | BF16 / NVFP4 / NVFP4 | no disponible | no disponible |

## Limitaciones y advertencias

- La calibración se hizo exclusivamente sobre diálogo hablado en chino con thinking desactivado; el rendimiento en otros registros o idiomas puede degradarse respecto al modelo base.
- Solo se declaran chino e inglés como idiomas soportados; el castellano no está cubierto oficialmente.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de factualidad en la información disponible.
- En Hopper, vLLM 0.32/0.33 cambian de kernel (Humming MoE) y no hay mediciones publicadas; `--moe-backend marlin` restaura el comportamiento de 0.31.
- LoRA requiere especificar `--lora-target-modules` explícitamente; el `--enable-lora` por defecto falla al arrancar por la cabeza `lm_head` en INT8.
- `--prefix-match-unit 16` no debe usarse en vLLM anterior a 0.26; vLLM 0.32 rechaza unidades que no dividan el bloque de caché (544 o 560 con MTP).
- MTP empeora la latencia en vLLM 0.24 y 0.27.1; solo es rentable en 0.30–0.33.
- vLLM 0.33 exige Python 3.11+, torch 2.14, transformers 5.16.1–5.20 y CUDA 13 (driver R580+).
- El número de parámetros declarado en safetensors (5.954.701.156) no coincide con el total nominal de 35B del nombre; conviene verificar la integridad del checkpoint antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben consultarse en su propio LICENSE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Twu31/Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Build de referencia AWQ: https://huggingface.co/QuantTrio/Qwen3.6-35B-A3B-AWQ
- PR de vLLM sobre validación de `prefix-match-unit`: https://github.com/vllm-project/vllm/pull/58021
- PR de vLLM sobre kernel Humming MoE en Hopper: https://github.com/vllm-project/vllm/pull/56997
- PR de vLLM sobre retirada de builds CUDA 12.9: https://github.com/vllm-project/vllm/pull/62575
