# tacodevs/Artemis-31B-v1.2-NVFP4-GPTQ-Max

## Resumen

Artemis-31B-v1.2-NVFP4-GPTQ-Max es una cuantizacion NVFP4 (W4A4) con GPTQ del modelo TheDrummer/Artemis-31B-v1.2, un modelo de la familia Gemma 4 orientado a roleplay y generacion conversacional. Lo publica el usuario tacodevs en Hugging Face bajo licencia Apache 2.0 y esta pensado para servir el modelo original con un consumo de memoria mucho menor (unos 20 GB de repositorio) sin renunciar a la fidelidad de las respuestas.

La cuantizacion aplica NVFP4 a todas las capas lineales del modelo de lenguaje, tanto en pesos como en activaciones, calibrada sobre 256 conversaciones de roleplay de 8k tokens. Las embeddings, la lm_head, las normas y la torre de vision se mantienen en BF16. Segun el autor, la deriva respecto al original BF16 en conversaciones de roleplay retenidas es de un 88,9 % de acuerdo top-1 y una KL aproximada de 0,056.

Es relevante para quienes quieran desplegar un modelo conversacional de gran tamano en hardware Blackwell con vLLM, ya que los kernels nativos de NVFP4 solo estan disponibles en esa generacion de GPU. El modelo base declara 18.460.143.972 parametros reales en safetensors, pese a la denominacion comercial "31B".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), con torre de vision; cuantizacion NVFP4 en capas lineales del LM |
| Parametros totales | 18.460.143.972 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A4 con GPTQ en capas lineales del LM; BF16 en embeddings, lm_head, normas y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Artemis-31B-v1.2 de TheDrummer, construido sobre Gemma 4. La arquitectura subyacente es un transformer multimodal (image-text-to-text) con torre de vision, aunque la cuantizacion solo afecta al modelo de lenguaje. Las capas lineales del LM se han cuantizado a NVFP4 (4 bits en pesos y activaciones) mediante GPTQ, con calibracion sobre 256 conversaciones de roleplay de 8k tokens cada una. El resto de componentes (embeddings, lm_head, normas y torre de vision) permanece en BF16.

La herramienta de cuantizacion empleada es llm-compressor 0.13. El autor indica que el formato de prompt, los samplers y el comportamiento de "thinking" son identicos a los del modelo original. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO en su entrenamiento.

## Capacidades

- Generacion de texto conversacional y roleplay, que es el objetivo principal del modelo base.
- Procesamiento image-text-to-text: el modelo conserva la torre de vision en BF16, por lo que mantiene capacidad multimodal.
- Soporte de modo "thinking" heredado del modelo original, segun indica el autor.
- Formato de prompt y samplers identicos al modelo base TheDrummer/Artemis-31B-v1.2.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta calibrado especificamente sobre conversaciones de roleplay, por lo que es adecuado para aplicaciones de chat con personajes, manteniendo coherencia en dialogos multi-turno gracias a la ventana de 32k tokens.
- Despliegue de chat a gran escala en hardware Blackwell: con unos 20 GB de pesos y 215 tok/s agregados a 8 streams concurrentes en una RTX PRO 6000, permite servir varias conversaciones simultaneas en una sola GPU.
- Asistentes conversacionales con contexto largo: el tiempo hasta el primer token de 5,9 s con prompts de 29k tokens hace viable el analisis de conversaciones o documentos extensos dentro de un chat.
- Prototipado de aplicaciones multimodales: al conservar la torre de vision en BF16, se puede usar para tareas image-text-to-text en las que se describa una imagen dentro de una conversacion.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la deriva de NVFP4 frente al BF16 original en tareas conversacionales (el autor reporta 88,9 % de acuerdo top-1 y KL 0,056).
- Investigacion sobre cuantizacion de bajo bit: sirve como referencia practica de un pipeline GPTQ con llm-compressor 0.13 y compressed-tensors para modelos de la familia Gemma 4.
- Backend de inferencia con vLLM en produccion: el repositorio esta etiquetado como `endpoints_compatible` y documenta un comando `vllm serve` concreto, lo que facilita su integracion en infraestructuras existentes basadas en vLLM 0.27.1.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Acuerdo top-1 con BF16 (roleplay retenido, teacher-forced, 23,7k tokens de respuesta) | 88,9 % |
| KL aproximada frente a BF16 | 0,056 |
| Decodificacion por stream en RTX PRO 6000 (vLLM 0.27.1) | 55-62 tok/s |
| Time to first token con 4k / 16k / 29k tokens de prompt | 0,6 s / 2,5 s / 5,9 s |
| Throughput agregado con 8 streams concurrentes | ~215 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 20 GB de pesos en NVFP4, mas cache KV (configurado en fp8_e4m3 en el ejemplo del autor) y overhead de activaciones; el consumo total dependera de la longitud de contexto y del numero de streams.
- GPU recomendadas: RTX PRO 6000 (Blackwell), unica GPU con la que el autor reporta mediciones. Es necesario hardware Blackwell para los kernels nativos de NVFP4.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; las GPU consumer Blackwell (serie RTX 50) no estan confirmadas por el autor.
- Opciones de despliegue: vLLM 0.27.1 con `--language-model-only --kv-cache-dtype fp8_e4m3 --max-model-len 32768`; requiere fijar `transformers==5.14.1` con esa version de vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55-62 tok/s por stream, TTFT de 0,6 a 5,9 s segun longitud de prompt y ~215 tok/s agregados con 8 streams en una RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| tacodevs/Artemis-31B-v1.2-NVFP4-GPTQ-Max | 18,46 B | 32.768 | NVFP4 W4A4 GPTQ | Apache 2.0 | Requiere GPU Blackwell; ~20 GB |
| TheDrummer/Artemis-31B-v1.2 | no disponible | no disponible | BF16 | no disponible | Modelo base sin cuantizar; referencia de calidad |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion sobre modelos alternativos de la misma categoria con la que establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Requiere GPU Blackwell: los kernels nativos de NVFP4 no funcionan en generaciones anteriores, lo que limita el despliegue a infraestructura reciente.
- Dependencia de versiones concretas: el autor fija vLLM 0.27.1 y `transformers==5.14.1`; otras combinaciones pueden no ser compatibles.
- Deriva de cuantizacion: aunque el acuerdo top-1 es del 88,9 %, existe una perdida de fidelidad respecto al BF16 original que puede notarse en generaciones largas o creativas.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue homogeneo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base TheDrummer/Artemis-31B-v1.2, que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su calidad o estabilidad.
- La denominacion "31B" del nombre comercial no coincide con los 18,46 B parametros reales declarados en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tacodevs/Artemis-31B-v1.2-NVFP4-GPTQ-Max
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
