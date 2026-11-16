# webmp3/Sakura-Qwen3.8-27B-Uncensored-GGUF

## Resumen

Sakura-Qwen3.8-27B-Uncensored-GGUF es una cuantización GGUF del modelo Qwen3.8-27B (27.320.697.856 parámetros) en la que el autor, webmp3, ha reducido el comportamiento de rechazo (refusals) del modelo original. Se trata de una release independiente de la comunidad, no oficial de Qwen ni de Alibaba. El modelo base es Qwen/Qwen3.8-27B, con licencia Apache-2.0, y la cuantización sobre la que se construye este archivo es de ByteShape (byteshape/Qwen3.8-27B-GGUF).

El objetivo declarado es ofrecer un archivo compacto de 13,5 GB (unos 3,9 bits por peso) que quepa en GPUs de 16 GB, manteniendo el resto del modelo original intacto. El contexto se ha probado a 32.768 tokens y la plantilla de chat es la embebida en el archivo, con el modo de razonamiento (thinking) activado por defecto. Es relevante ahora porque permite ejecutar localmente un modelo de 27B con capacidades de razonamiento y código en hardware de consumo, con un perfil de seguridad reducido por diseño.

Los benchmarks publicados por Qwen para el modelo original sitúan el modelo en un nivel alto en tareas de agentes y código (SWE-bench Pro 61,7, LiveCodeBench v6 90,3, GPQA Diamond 89,2). El autor advierte que esas cifras no se han re-medido sobre esta cuantización y que el cambio de comportamiento y la cuantización agresiva pueden alterar resultados individuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); incluye tensores MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (probado); el archivo admite más según el modelo base, pero no se documenta |
| Tipos de cuantización | Un único archivo mixto i-quant/K-quant: IQ3_XXS 49 %, Q8_0 29 %, IQ4_XS 9 %, Q6_K 8 %, IQ2_XXS 6 % (≈3,9 bits por peso) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27.320.697.856 parámetros. El archivo GGUF incluye los tensores MTP (multi-token prediction), lo que sugiere decodificación especulativa integrada en el modelo base, si bien el autor no detalla el mecanismo ni el entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicó RLHF o DPO en el modelo original; la model card remite a la ficha oficial de Qwen para esos detalles.

La modificación introducida por webmp3 consiste en reducir el comportamiento de rechazo del modelo base. No se documenta la técnica concreta empleada (fine-tuning, ablación de direcciones de rechazo u otra). La cuantización es mixta y agresiva: la mayor parte del archivo (49 %) está en IQ3_XXS, con un 29 % en Q8_0 para las capas presumiblemente más sensibles, y el resto repartido entre IQ4_XS, Q6_K e IQ2_XXS. El resultado es un archivo de 13,5 GB (12,55 GiB) con una media de aproximadamente 3,9 bits por peso.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en el archivo.
- Razonamiento con modo thinking activado por defecto (puede desactivarse en la configuración de decodificación).
- Resolución de tareas algorítmicas de código complejas: el autor verifica tareas con tests ocultos, con resultados de 1/5 resueltas y hasta 3/5 con código válido incluyendo las que agotan el límite de tokens.
- Capacidades de agente y razonamiento multi-paso, inferidas de los benchmarks del modelo original (Terminal Bench 2.1, SWE-bench Pro).
- Multilingüe limitado a inglés y chino según los metadatos de la model card.
- Tool calling / function calling: no se documenta explícitamente en la información disponible, aunque el endpoint OpenAI-compatible de llama-server lo permite a nivel de servidor.
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- Experimentación local en GPU de 16 GB: el archivo está dimensionado para caber en tarjetas de 16 GB con contexto de 8k a 16k tokens, lo que permite probar un modelo de 27B en hardware de consumo sin offloading parcial.
- Investigación sobre seguridad y alineación: el autor publica un recuento de rechazos sobre 104 prompts del set `mlabonne/harmful_behaviors`, útil para estudiar cómo cambia el comportamiento de rechazo tras la modificación y para comparar con el modelo original.
- Generación de código en pipelines locales: las tareas de código verificadas con tests ocultos muestran que el modelo sigue funcionando tras la cuantización, por lo que puede integrarse en flujos de asistencia a programación ejecutados en local.
- Escritura creativa y de ficción para adultos: el perfil de rechazo reducido está pensado por el autor para investigación, trabajo creativo y experimentación local por parte de adultos.
- Asistencia conversacional en inglés y chino: el modelo conserva las capacidades multilingües del base en esos dos idiomas, adecuado para prototipos de chat en esas lenguas.
- Despliegue con endpoint OpenAI-compatible: mediante `llama-server` se expone `http://127.0.0.1:8080/v1`, lo que permite conectarlo a clientes y frameworks que hablan la API de OpenAI.
- Pruebas de agentes con contexto largo: con 32.768 tokens probados en una L40S, sirve para evaluar tareas de varios pasos que requieren ventanas amplias.

## Benchmarks y rendimiento

Resultados del modelo original Qwen3.8-27B, según lo publicado por Qwen (no re-medidos sobre esta cuantización):

| Benchmark | Qwen3.8-27B (original, según Qwen) |
|---|---|
| Terminal Bench 2.1 (Terminus) | 73,0 |
| SWE-bench Pro | 61,7 |
| IFBench | 79,5 |
| GPQA Diamond | 89,2 |
| HLE | 30,8 |
| LiveCodeBench v6 | 90,3 |

Mediciones del autor sobre rechazos (104 prompts de `mlabonne/harmful_behaviors`, decodificación greedy, thinking off, máximo 100 tokens nuevos):

| Modelo | Rechazos directos (de 104) | Cualquier frase de rechazo o aviso (de 104) | Respuestas degeneradas |
|---|---|---|---|
| Qwen3.8-27B (Q4_K_M, ggml-org) | 103 | 103 | no medido |
| Este modelo | 0 | 89 | 0 |

Verificación de código del autor (5 tareas algorítmicas, seed 42 + número de tarea, temperature 0,6, top-p 0,95, top-k 20, máximo 16.384 tokens de salida, thinking on, contexto 32.768, llama.cpp b12189 CUDA en una NVIDIA L40S):

| Modelo | Resueltas (terminadas) | Válidas incl. en el límite | Tokens de salida (suma) |
|---|---|---|---|
| Qwen3.8-27B (Q4_K_M, ggml-org) | 1/5 | 4/5 | 66.767 |
| Este modelo | 1/5 | 3/5 | 67.011 |

El autor señala que la muestra es pequeña (una semilla, cinco tareas) y que los dos archivos usan cuantizaciones distintas, por lo que la comparación demuestra que el modelo sigue funcionando, no que sea mejor o peor.

## Requisitos de hardware

- VRAM: los pesos ocupan 13,5 GB. Añadir aproximadamente 1 GB de caché por cada 16k tokens de contexto y unos 1 GB de buffers de cómputo (estimación del autor, no medida).
- GPU de 16 GB: cabe con contexto de 8k a 16k tokens. A 32.768 tokens hay que prever 17-18 GB.
- GPU probada: NVIDIA L40S (48 GB) con llama.cpp b12189 (CUDA), completamente offloaded, contexto de 32.768.
- No probado por el autor: tarjetas de 16 GB reales, inferencia solo en CPU, Apple Silicon y otras GPUs.
- Con menos memoria: offload parcial de capas dejando el resto en RAM del sistema, a costa de velocidad.
- Despliegue: llama.cpp (build reciente con soporte `qwen35`), `llama-server` con endpoint OpenAI-compatible. Ollama y LM Studio no han sido probados por el autor.
- Latencia y throughput: no disponibles.

Comando de arranque recomendado por el autor:

```bash
llama-server -hf webmp3/Sakura-Qwen3.8-27B-Uncensored-GGUF --jinja -c 16384 -ngl 99 --temp 0.6 --top-p 0.95 --top-k 20
```

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Sakura-Qwen3.8-27B-Uncensored-GGUF) | 27.320.697.856 | 32.768 probados | Apache-2.0 | GGUF (13,5 GB) | Rechazos reducidos; 0 rechazos directos de 104; 3,9 bits por peso |
| Qwen/Qwen3.8-27B | 27.320.697.856 | no disponible en la información | Apache-2.0 | safetensors (original) | Modelo base sin modificar; 103 rechazos directos de 104 |
| byteshape/Qwen3.8-27B-GGUF | 27.320.697.856 | no disponible | Apache-2.0 | GGUF | Cuantización estándar sobre la que se construye este archivo |
| Qwen3.8-27B Q4_K_M (ggml-org) | 27.320.697.856 | no disponible | Apache-2.0 | GGUF | Usado por el autor como referencia; 1/5 resueltas, 4/5 válidas en tareas de código |

## Limitaciones y advertencias

- El comportamiento de seguridad está reducido por diseño: 0 rechazos directos frente a 103 del original en el set de prueba del autor, aunque 89 respuestas aún contienen avisos o disclaimers. No es una evaluación de seguridad formal ni mide la utilidad de las respuestas.
- Riesgo de alucinación: no evaluado en la información disponible; es inherente a los modelos de esta familia y no hay datos específicos para esta cuantización.
- La cuantización mixta a ≈3,9 bits por peso puede degradar resultados individuales respecto al modelo original; el propio autor advierte que los benchmarks de Qwen no se han re-medido.
- Idiomas limitados a inglés y chino según los metadatos; no hay evidencia de buen rendimiento en castellano.
- Contexto práctico limitado en GPUs de 16 GB (8k-16k tokens); a 32.768 tokens se necesitan 17-18 GB.
- No probado en tarjetas de 16 GB, CPU-only ni Apple Silicon; el soporte en Ollama y LM Studio no está verificado por el autor.
- Requiere builds recientes de llama.cpp con soporte `qwen35`; versiones antiguas pueden fallar al cargar el archivo.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal en su jurisdicción dado el perfil de rechazo reducido.
- El autor no almacena los textos de las respuestas de la prueba de rechazos, por lo que no hay auditoría reproducible de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de referencia: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
- Set de evaluación de rechazos: `mlabonne/harmful_behaviors` (referenciado en la model card, sin URL explícita)
- llama.cpp: no se proporciona URL en la información disponible; el autor cita el build b12189 con backend CUDA
