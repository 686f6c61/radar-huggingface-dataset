# Xylolabs/gemma-4-26B-A4B-GGUF

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje de gran escala desarrollado por Google, publicado bajo licencia Apache 2.0 y distribuido en formato GGUF por Xylolabs en esta ficha. Se trata de la versión base (pretrained) del modelo, sin ajuste fino por instrucciones, con arquitectura de mezcla de expertos (MoE) segun la nomenclatura "A4B" (aproximadamente 4.000 millones de parametros activos sobre un total de 25.233.142.046). El contexto nativo es de 8.192 tokens segun la model card del cuantizador.

La relevancia de esta publicacion es doble: por un lado, ofrece una cuantizacion mixta Q4_K_M preservada byte a byte del modelo original de Google, pensada como formato de referencia para comparaciones de calidad; por otro, permite ejecutar un modelo de 25.000 millones de parametros en hardware de consumo gracias a su naturaleza MoE y a un peso total de 16,8 GB. La model card reporta una evaluacion de fidelidad frente al modelo BF16 original con una divergencia KL media de 0,056776 y un 89,8949 % de acuerdo en top-1.

El modelo esta etiquetado para ingles y coreano, y su uso previsto es generacion de texto en modo completacion. No se trata de un modelo conversacional afinado; requiere prompts de completacion o un ajuste posterior para tareas de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun nomenclatura A4B del modelo base |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (segun nomenclatura A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M mixta: Q4_K (192 tensores), Q5_0 (32), Q6_K (14), Q8_0 (28), F32 (392); promedio 5,320 bits por valor |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 16.795.998.784 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la designacion MoE implicita en el nombre "26B-A4B" y de la referencia al informe tecnico de Gemma 4 (arXiv:2607.02770). El modelo base es `google/gemma-4-26B-A4B`, publicado por Google como modelo pretrained. No se dispone en esta ficha de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; al tratarse de la variante base, es probable que no incluya ajuste por preferencias, pero esto no se confirma en la informacion proporcionada.

La aportacion tecnica de esta publicacion concreta es la cuantizacion. Xylolabs preserva los 658 tensores originales del modelo de texto y los 25.233.142.046 valores de peso, aplicando una mezcla de precisiones: las matrices mas sensibles se mantienen en Q8_0, Q6_K o Q5_0, mientras que el grueso se cuantiza a Q4_K. El resultado es un archivo de 16,8 GB con un promedio de 5,320 bits por valor. La asignacion de memoria KV en FP16 declarada es de 1.760 MiB y se reserva un margen de trabajo de 8 GiB para la validacion de carga.

## Capacidades

- Generacion de texto autoregresiva en modo completacion (no instrucciones).
- Razonamiento y conocimiento general derivados del modelo base de Google.
- Capacidad multilingue limitada a ingles y coreano segun las etiquetas del repositorio.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking, vision ni audio en la informacion disponible.
- Compatible con endpoints segun la etiqueta `endpoints_compatible`.

## Casos de uso

- Completacion de texto en local: el modelo puede ejecutarse con `llama-completion` en CPU y generar continuaciones de prompts, adecuado para experimentacion y prototipado sin GPU.
- Evaluacion de cuantizaciones: al ser un "reference format" preservado byte a byte, sirve como linea base para comparar otras cuantizaciones Q4 del mismo modelo base midiendo divergencia KL y acuerdo top-1.
- Generacion de texto en ingles y coreano: util para tareas de redaccion o continuacion en esos dos idiomas, con la limitacion de contexto de 8.192 tokens.
- Investigacion sobre modelos MoE: permite estudiar el comportamiento de un MoE de 25.000 millones de parametros con unos 4.000 millones activos en hardware modesto.
- Despliegue en entornos con poca VRAM: con 16,8 GB de pesos, cabe en GPUs de consumo de 24 GB y en configuraciones CPU con suficiente RAM.
- Base para ajuste fino posterior: al ser un modelo pretrained, puede servir de punto de partida para tareas especificas mediante fine-tuning o LoRA.
- Pruebas de infraestructura: validacion de pipelines de inferencia GGUF (llama.cpp, servidores compatibles) antes de desplegar variantes mayores.

## Benchmarks y rendimiento

La model card reporta unicamente una evaluacion de fidelidad de la cuantizacion frente al modelo BF16 original, no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado |
|---|---|
| KL media frente al profesor BF16 original | 0,056776 |
| Acuerdo top-1 | 89,8949 % |
| Completaciones correctas Q4 | 28/28 |
| Completaciones correctas BF16 | 28/28 |
| Regresiones o respuestas rotas contabilizadas | 0 |
| Secuencias evaluadas | 8 secuencias crudas de 1.024 tokens |
| Posiciones puntuadas | 8.184 |
| Vocabulario | 262.144 entradas |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La velocidad de inferencia tampoco se reporta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,80 GB solo para los pesos GGUF, mas espacio para cache KV (1.760 MiB en FP16 declarados) y buffers.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, tarjetas con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) son las candidatas naturales.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM o superior, dejando margen para cache KV y contexto.
- Despliegue: llama.cpp (probado con la herramienta `llama-completion`, version v0.9.0, CUDA desactivado, `-ngl 0` y 4 hilos de CPU). No se documentan pruebas con vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-GGUF (esta ficha) | 25.233.142.046 | 8.192 | Apache 2.0 | GGUF Q4_K_M | Cuantizacion de referencia con evaluacion KL |
| google/gemma-4-26B-A4B | 25.233.142.046 | 8.192 (segun cuantizador) | Apache 2.0 | safetensors (presumiblemente) | Modelo base original de Google |
| Otras cuantizaciones GGUF del mismo modelo base | 25.233.142.046 | 8.192 | Apache 2.0 | GGUF | No disponibles en la informacion proporcionada |

No se dispone de datos sobre modelos alternativos de otros fabricantes (por ejemplo, otros MoE de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pretrained, no afinado por instrucciones: puede no seguir instrucciones de forma fiable y requerir prompts de completacion.
- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta garantizado.
- Contexto de 8.192 tokens, inferior al de muchos modelos contemporaneos con ventanas de 32.000 a 128.000 tokens.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de seguridad.
- La evaluacion de calidad se limita a 28 completaciones y 8 secuencias; es una muestra pequena y no sustituye a benchmarks estandar.
- La cuantizacion Q4_K_M introduce degradacion respecto a BF16 (KL media de 0,056776), aunque el autor reporta cero regresiones en su conjunto de prueba.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantia ni respaldo del modelo original de Google.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de adopcion amplia.
- No se documentan pruebas con backends distintos de llama.cpp ni con aceleracion GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF/blob/main/LICENSE
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Herramienta llama.cpp completion: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
