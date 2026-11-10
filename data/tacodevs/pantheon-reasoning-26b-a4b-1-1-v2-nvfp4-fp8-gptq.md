# tacodevs/Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-FP8-GPTQ

## Resumen

Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-FP8-GPTQ es una cuantización de precisión mixta del modelo Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, un transformer de tipo Mixture of Experts (MoE) construido sobre la arquitectura Gemma 4, con 26.544.133.710 parámetros totales y 128 expertos de los cuales 8 se activan por token. El modelo original está orientado a generación de texto conversacional y roleplay, y esta versión cuantizada la publica el usuario tacodevs bajo licencia Apache 2.0.

El problema que resuelve esta build es el coste de memoria: reduce el peso del repositorio a 18,7 GB, lo que permite servir el modelo en una GPU de 32 GB dejando espacio para la caché KV. Para lograrlo aplica una estrategia selectiva: los expertos MoE (aproximadamente el 86 % de los pesos) se cuantizan a NVFP4 (W4A4) con GPTQ, mientras que la atención (q/k/v/o) y el MLP denso se mantienen en FP8 dinámico (W8A8), y el router, embeddings, lm_head, normas y torre de visión permanecen en BF16.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización mixta reproducible con llm-compressor y compressed-tensors; por otro, ofrece métricas de deriva frente al original en BF16 (91,0 % de acuerdo top-1 y KL aproximada de 0,033 sobre conversaciones de roleplay), lo que permite evaluar el coste real de la compresión antes de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), 128 expertos, 8 activos por token |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (8 de 128 expertos por token; no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio usa `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 (W4A4) con GPTQ en expertos MoE; FP8 dinámico (W8A8) en atención y MLP denso; BF16 en router, embeddings, lm_head, normas y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 8-bit, compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts sobre Gemma 4 con 128 expertos y enrutamiento de 8 expertos por token. Esta versión no reentrena el modelo: es una cuantización del checkpoint Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, por lo que los datos de preentrenamiento, el volumen de tokens y las fases de ajuste (incluido cualquier RLHF o DPO) corresponden al original y no se detallan en la información disponible. La model card indica que el formato de prompt, los samplers y el comportamiento de razonamiento (thinking) son idénticos a los del modelo original.

La innovación técnica está en la receta de compresión. Los expertos MoE, que concentran en torno al 86 % de los pesos, se cuantizan a NVFP4 con GPTQ y se calibran sobre 256 conversaciones de roleplay de 8k tokens. La atención y el MLP denso, que se ejecutan en cada token, se mantienen en FP8 dinámico para eliminar la mayor parte de la deriva de cuantización. El pipeline se construyó con llm-compressor 0.15 (con linealización de MoE) y compressed-tensors 0.20.1. La model card reporta la deriva frente al original en BF16 sobre conversaciones de roleplay retenidas (teacher-forced, 23,7k tokens de respuesta): esta build logra un 91,0 % de acuerdo top-1 y una KL aproximada de 0,033, frente al 94,0 % y 0,016 de una build FP8 completa de 27 GB, el 86,6 % y 0,081 de NVFP4 en todo con GPTQ, y el 82,1 % y 0,148 de NVFP4 round-to-nearest.

## Capacidades

- Generación de texto conversacional y multi-turno, con especial orientación a roleplay según las etiquetas del modelo.
- Razonamiento con modo thinking, heredado del modelo original (la model card indica que el comportamiento de thinking no cambia).
- Procesamiento de imagen y texto: la pipeline es `image-text-to-text` e incluye torre de visión en BF16.
- Generación de código y matemáticas: capacidad esperable del modelo base Gemma 4, aunque no se documentan resultados específicos en la información disponible.
- Soporte multilingüe: no disponible (no se enumeran idiomas).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Compatible con endpoints y con despliegue en vLLM mediante kernels nativos de MoE NVFP4.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está ajustado y calibrado específicamente sobre conversaciones de roleplay, y la cuantización se evalúa en ese mismo dominio, por lo que es el escenario donde la deriva medida es más representativa.
- Servicio de chat en una GPU de 32 GB: con 18,7 GB de pesos y caché KV en FP8, permite atender conversaciones de hasta 32k tokens de contexto en hardware de gama profesional sin recurrir a múltiples GPUs.
- Asistentes conversacionales con contexto largo: la ventana de 32k configurada en el ejemplo de vLLM permite mantener historiales extensos y documentos largos dentro de la misma sesión.
- Prototipado e investigación sobre cuantización: la model card publica métricas de deriva frente al original, lo que permite comparar recetas de compresión y validar pipelines con llm-compressor y compressed-tensors.
- Evaluación de modelos MoE en producción: al ejecutarse con vLLM 0.33.0 y kernels NVFP4, sirve para medir throughput y latencia de un MoE de 26B en GPUs Blackwell antes de comprometerse con el modelo completo en BF16.
- Tareas image-text-to-text: la torre de visión se conserva en BF16, de modo que el modelo puede recibir imágenes junto con texto, aunque no se documentan evaluaciones específicas de calidad multimodal en esta build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de fidelidad de la cuantización frente al original en BF16:

| Build | Tamaño | Acuerdo top-1 | KL aproximada |
|---|---|---|---|
| FP8 en todo | 27 GB | 94,0 % | 0,016 |
| Esta build (NVFP4 expertos + FP8 resto) | 18 GB | 91,0 % | 0,033 |
| NVFP4 en todo, GPTQ | 17 GB | 86,6 % | 0,081 |
| NVFP4 en todo, round-to-nearest | no disponible | 82,1 % | 0,148 |

## Requisitos de hardware

- VRAM estimada: 18,7 GB de pesos; la model card indica que cabe en una GPU de 32 GB con espacio para la caché KV.
- GPU recomendadas: se ha probado con vLLM 0.33.0 en una GPU Blackwell (por los kernels nativos NVFP4); no se especifica el modelo exacto.
- GPU de consumo: no hay confirmación de que funcione en GPUs consumer; los kernels NVFP4 nativos de vLLM están orientados a Blackwell, por lo que en generaciones anteriores el soporte no está garantizado.
- Despliegue: vLLM 0.33.0 con el comando documentado (`--language-model-only --kv-cache-dtype fp8_e4m3 --max-model-len 32768`); también es compatible con transformers según la librería declarada. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (tacodevs) | 26,5B totales, MoE 8/128 | 32k en el ejemplo de servicio | NVFP4 + FP8 mixta, 18,7 GB | Apache 2.0 | Hugging Face |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26,5B totales, MoE 8/128 | no disponible | BF16 (original) | no disponible | Hugging Face |
| Build FP8 completa (referencia en la model card) | 26,5B totales | no disponible | FP8, 27 GB | no disponible | no disponible como repositorio independiente |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce deriva: el acuerdo top-1 cae al 91,0 % frente al original en BF16, con una KL de 0,033; en tareas fuera del dominio de calibración (roleplay) la degradación puede ser mayor.
- La calibración GPTQ se hizo exclusivamente sobre conversaciones de roleplay de 8k tokens, lo que puede sesgar la calidad hacia ese tipo de texto y penalizar otros dominios como código o matemáticas.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: inherente al modelo base; no se aportan evaluaciones específicas en esta build.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe equivalente al del original.
- El soporte de tool calling, agentes y function calling no está documentado.
- El despliegue probado depende de kernels NVFP4 nativos de vLLM en GPUs Blackwell; en hardware anterior el funcionamiento no está verificado.
- La licencia Apache 2.0 se declara en el repositorio de la cuantización, pero la licencia del modelo base no se detalla en la información disponible; conviene verificarla antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/tacodevs/Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-FP8-GPTQ
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- llm-compressor: no disponible (no se proporciona URL en la información)
- compressed-tensors: no disponible (no se proporciona URL en la información)
- vLLM: no disponible (no se proporciona URL en la información)
