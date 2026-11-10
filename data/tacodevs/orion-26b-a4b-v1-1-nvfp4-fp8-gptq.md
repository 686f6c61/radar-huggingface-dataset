# tacodevs/Orion-26B-A4B-v1.1-NVFP4-FP8-GPTQ

## Resumen

Orion-26B-A4B-v1.1-NVFP4-FP8-GPTQ es una cuantización de precisión mixta del modelo TheDrummer/Orion-26B-A4B-v1.1, un transformer de tipo Mixture-of-Experts (MoE) de arquitectura Gemma 4 con 26.544.133.710 parámetros totales y 128 expertos, de los cuales 8 se activan por token. Lo publica el usuario tacodevs y su objetivo es reducir el peso del modelo hasta unos 18 GB para que quepa en una GPU de 32 GB sin renunciar a la fidelidad respecto al original en BF16.

La innovación del build es la estrategia de cuantización diferenciada: los expertos MoE, que concentran aproximadamente el 86 % de los pesos, se comprimen a NVFP4 (W4A4) mediante GPTQ calibrado sobre 256 conversaciones de rol de 8k tokens; la atención (q/k/v/o) y el MLP denso, que se ejecutan en cada token, se mantienen en FP8 dinámico (W8A8); y el router, los embeddings, el lm_head, las normas y la torre de visión permanecen en BF16. Según el autor, esta partición elimina la mayor parte de la deriva de cuantización.

El modelo está pensado para despliegue en producción con vLLM sobre GPUs Blackwell (kernels nativos NVFP4 MoE) y conserva el comportamiento de prompt, samplers y modo thinking del modelo original. Es relevante ahora porque demuestra que un MoE de 26B puede servirse en hardware de 32 GB con velocidades de 200-215 tok/s por stream y 850 tok/s agregados con 16 streams concurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Gemma 4), 128 expertos, 8 activos por token |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (8 expertos de 128 activos por token; cifra exacta no publicada) |
| Longitud de contexto | 32768 tokens (configurado en el ejemplo de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (W4A4) + GPTQ en expertos MoE; FP8 dinamico (W8A8) en atencion y MLP denso; BF16 en router, embeddings, lm_head, normas y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 8-bit, 18.7 GB de repo |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Gemma 4 con 128 expertos y enrutamiento top-8 por token. Esta ficha corresponde exclusivamente al proceso de cuantizacion, no a un entrenamiento desde cero: no se ha realizado RLHF ni DPO adicional, y el autor indica que el formato de prompt, los samplers y el comportamiento de thinking son idénticos a los del modelo original. El pipeline de compresión se construyó con llm-compressor 0.15 (con linearización de capas MoE) y compressed-tensors 0.20.1.

La calibración de GPTQ para los expertos se hizo sobre 256 conversaciones de rol de 8k tokens. La deriva medida frente al original en BF16 sobre conversaciones de rol reservadas (teacher-forced, 23.700 tokens de respuesta) es de un 90,6 % de acuerdo top-1 y un KL aproximado de 0,036, frente al 89,9 % y 0,043 de una variante con expertos en round-to-nearest. La decisión de mantener atención y MLP denso en FP8 responde a que estas capas se ejecutan en cada token y son más sensibles a la cuantización agresiva.

## Capacidades

- Generación de texto conversacional y de rol (roleplay), que es el dominio sobre el que se calibró la cuantización.
- Razonamiento multi-turno con ventana de contexto de hasta 32.768 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión conservada en BF16.
- Modo thinking heredado del modelo original (comportamiento sin cambios según el autor).
- Compatibilidad con endpoints y con el ecosistema transformers.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).

## Casos de uso

- Roleplay y personajes conversacionales: es el escenario de calibración del modelo, con 256 conversaciones de rol de 8k tokens usadas para GPTQ; el 90,6 % de acuerdo top-1 con el BF16 lo hace adecuado para sustituir al original reduciendo VRAM a la mitad.
- Servicio de chat multi-usuario en una sola GPU de 32 GB: con 850 tok/s agregados a 16 streams concurrentes, permite atender varias sesiones simultáneas en una RTX 5090 o similar con memoria suficiente.
- Asistentes con prompts largos: el tiempo hasta el primer token de 0,13 s a 4k, 0,44 s a 16k y 1,0 s a 29k tokens encaja en aplicaciones interactivas que inyectan documentación extensa en el contexto.
- Análisis de imágenes con descripción conversacional: la torre de visión en BF16 permite tareas image-text-to-text sin la pérdida de precisión que supondría cuantizarla.
- Despliegue en producción con vLLM: el ejemplo oficial con `--language-model-only --kv-cache-dtype fp8_e4m3 --max-model-len 32768` sirve como plantilla directa para pipelines de inferencia en GPUs Blackwell.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la deriva de NVFP4+FP8 frente a BF16 en tareas de generación libre con la metodología de acuerdo top-1 y KL publicada.
- Prototipado en investigación sobre MoE cuantizados: al liberar memoria (18 GB frente a los ~53 GB en BF16), permite experimentar con ajuste de samplers y prompts en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de cuantización y de velocidad:

| Metrica | Este build (GPTQ) | Variante round-to-nearest | Original BF16 |
|---|---|---|---|
| Acuerdo top-1 (roleplay reservado, 23,7k tokens) | 90,6 % | 89,9 % | referencia |
| KL aproximado | 0,036 | 0,043 | 0 |

| Metrica de servicio (vLLM 0.33.0, GPU 32 GB) | Valor |
|---|---|
| Throughput por stream | 200-215 tok/s |
| TTFT a 4k / 16k / 29k tokens de prompt | 0,13 s / 0,44 s / 1,0 s |
| Throughput agregado a 16 streams | ~850 tok/s |

## Requisitos de hardware

- VRAM estimada: unos 18 GB de pesos; el autor indica que cabe en una GPU de 32 GB dejando espacio para la caché KV.
- GPU recomendadas: GPUs Blackwell con kernels nativos NVFP4 MoE (probado en una tarjeta de 32 GB); el soporte NVFP4 en generaciones anteriores no está confirmado en la información disponible.
- GPU de consumo: sí cabe en tarjetas de 32 GB; en tarjetas de 24 GB no hay confirmación de que quepa con caché KV para contexto largo.
- Despliegue: vLLM 0.33.0 (probado); el ejemplo usa `--language-model-only`, `--kv-cache-dtype fp8_e4m3` y `--max-model-len 32768`. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 200-215 tok/s por stream, TTFT de 0,13-1,0 s según longitud de prompt y ~850 tok/s agregados con 16 streams concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1-NVFP4-FP8-GPTQ (este) | 26,5B totales, MoE top-8 | 32.768 | NVFP4 + FP8 + BF16 mixta | Apache 2.0 | Hugging Face, vLLM |
| TheDrummer/Orion-26B-A4B-v1.1 (original) | 26,5B totales, MoE top-8 | no disponible | BF16 | no disponible | Hugging Face |
| Variante round-to-nearest del mismo layout | 26,5B totales, MoE top-8 | 32.768 | NVFP4 + FP8 (sin GPTQ) | Apache 2.0 | solo como referencia de medición en la model card |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- La calibración GPTQ se hizo exclusivamente sobre conversaciones de rol; el comportamiento en dominios como código, matemáticas o texto técnico puede degradarse más que en roleplay.
- El acuerdo top-1 del 90,6 % implica que aproximadamente 1 de cada 10 tokens difiere del modelo BF16, con un KL de 0,036; en tareas de alta precisión conviene validar contra el original.
- Los idiomas soportados no están declarados; no hay garantía documentada de calidad multilingüe.
- El rendimiento se midió con vLLM 0.33.0 en una GPU Blackwell; otros backends o generaciones de GPU pueden no tener kernels NVFP4 y requerir fallback.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; se heredan los del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/tacodevs/Orion-26B-A4B-v1.1-NVFP4-FP8-GPTQ
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- llm-compressor: no disponible enlace en la información proporcionada
- compressed-tensors: no disponible enlace en la información proporcionada
- vLLM: no disponible enlace en la información proporcionada
