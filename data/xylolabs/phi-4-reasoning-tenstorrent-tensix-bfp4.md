# Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4

## Resumen

Phi-4-reasoning-Tenstorrent-Tensix-BFP4 es una cuantización del modelo microsoft/Phi-4-reasoning, publicada por Xylolabs, optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 14.659.507.200 parámetros (aproximadamente 14,7 mil millones) desarrollado por Microsoft, orientado a tareas de razonamiento con un modo de "pensamiento" explícito antes de la respuesta final. Esta versión mantiene la licencia MIT del original y reduce el peso de 29,32 GB en bf16 a 11,034 GB empaquetados para Tensix.

La relevancia de esta ficha reside en que es una de las pocas cuantizaciones publicadas que emplea formatos de coma flotante por bloques (block floating point) propios del hardware Tensix: `bfloat4_b` (BFP4) para las proyecciones MLP y `bfloat8_b` (BFP8) para las proyecciones de atención, mientras que el LM head, los embeddings y las normas permanecen en bf16. Esto permite ejecutar un modelo de razonamiento de casi 15 mil millones de parámetros en aceleradores de Tenstorrent con una pérdida de calidad medida y documentada.

El checkpoint se distribuye en formato safetensors con el layout de `LlamaForCausalLM` (las matrices fusionadas q, k, v y gate-up de Phi-4 se han separado conservando los valores), lo que facilita su carga con `transformers` y su integración en el stack ttnn/tt-metal. La información disponible sobre benchmarks de tareas (MMLU, HumanEval, GSM8K) es limitada: el autor solo publica métricas de fidelidad de cuantización (KL y top-1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4), checkpoint en layout `LlamaForCausalLM` con matrices q/k/v y gate-up separadas |
| Parametros totales | 14.659.507.200 (14,7 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones MLP; BFP8 (`bfloat8_b`) en proyecciones de atencion; bf16 en LM head, embeddings y normas |
| Idiomas soportados | Ingles (segun la model card); la evaluacion de KL incluye tambien texto en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (29,3 GB de repo); 11,034 GB empaquetados para Tensix |

## Arquitectura y entrenamiento

El modelo base Phi-4-reasoning es un transformer denso de Microsoft con 40 capas, según se deduce de la tabla de formatos de la model card (atención q, k, v, o y MLP gate, up, down en 40 capas). Esta versión cuantizada no introduce cambios arquitectónicos: mantiene la estructura del original, pero reorganiza las matrices fusionadas de Phi-4 en proyecciones separadas al estilo Llama. La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque para los tensores BFP4, y con redondeo al más cercano (round to nearest) para los BFP8. El fichero `quant4.json` documenta el formato de cada proyección.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la información proporcionada; esos detalles corresponden a la model card de microsoft/Phi-4-reasoning. La innovación técnica destacable de esta publicación es el propio pipeline de cuantización para Tensix: el repositorio `tensix-bfp-gptq` (v0.1.0) incluye herramientas de cuantización y verificación de formato, `tensix-kernels` (v0.1.0) aporta los kernels y `tensix-runner` (v0.1.0) el runner de inferencia. La verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, comprobando que cada matriz empaquetada se reconstruye exactamente tras el round-trip por DRAM del dispositivo.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia del modelo base (aplicable vía `apply_chat_template`).
- Razonamiento con modo de pensamiento: el modelo escribe un bloque `` antes de la respuesta final.
- Razonamiento multi-paso: la model card menciona un conjunto de 7 "reasoning prompts" en su comprobación de 33 prompts.
- Capacidades multilingües limitadas: inglés declarado oficialmente; la evaluación de fidelidad incluye coreano, pero no se declara soporte general de otros idiomas.
- Ejecución en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn/tt-metal.
- Carga estándar con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) en bf16 con `device_map="auto"`.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes en la información disponible.

## Casos de uso

- Razonamiento asistido en inglés: el modelo genera una cadena de pensamiento antes de responder, adecuado para preguntas analíticas donde interesa auditar el razonamiento intermedio (por ejemplo, depuración de lógica o explicación de pasos matemáticos).
- Despliegue en aceleradores Tenstorrent: el formato BFP4/BFP8 empaquetado (11,034 GB) permite servir el modelo en NPU Wormhole o Blackhole con kernels ttnn, reduciendo el peso de memoria frente a los 29,32 GB en bf16.
- Prototipado en simulador: el runner `tensix-runner` y la verificación con ttsim permiten validar pipelines de inferencia sobre Blackhole sin disponer del hardware físico.
- Investigación en cuantización de bajo nivel: el repositorio `tensix-bfp-gptq` sirve como referencia reproducible para aplicar GPTQ con búsqueda de exponente por bloque a otros transformers.
- Evaluación comparativa de fidelidad: el modelo es útil como punto de comparación frente a Q4_K_M de llama.cpp (KL media 0,0158 frente a 0,0115) en estudios sobre el impacto de formatos block floating point.
- Integración en pipelines `transformers`: al mantener el layout Llama y safetensors, puede cargarse en entornos de investigación que ya usan `AutoModelForCausalLM` para experimentos de generación con decodificación greedy o muestreo (temperatura 0,8, top_k 50, top_p 0,95 según Microsoft).

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (microsoft/Phi-4-reasoning) | 29,32 | 0 | 100 |
| **Este modelo (BFP4 MLP / BFP8 atención)** | 11,034 | 0,015808 | 94,13 |
| Q4_K_M (llama.cpp) | 9,059 | 0,011492 | 94,42 |

Las métricas de KL y top-1 cubren 14.528 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con la plantilla de chat de Microsoft sin bloque de pensamiento. La comprobación de 33 prompts usa decodificación greedy con prefijo `` vacío; según la model card, BF16 solo acierta 8 de esos 33 en ese escenario, y con el pensamiento activado BF16 no respondió correctamente a ninguno de los 7 prompts de razonamiento. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: 11,034 GB empaquetados para Tensix; 29,32 GB en bf16 si se carga con `transformers` en GPU.
- GPU recomendadas para la ruta `transformers`: no especificadas en la información; por tamaño en bf16, requiere GPUs con al menos 30-32 GB de memoria (A100 40/80 GB, H100, o varias GPUs consumer con `device_map="auto"`).
- Hardware objetivo principal: NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn 0.81.1; verificado sobre ttsim (simulador de Blackhole).
- ¿Cabe en GPU consumer? En bf16 no cabe en una RTX 4090 (24 GB); en el formato empaquetado para Tensix no es directamente ejecutable en GPU. No se documentan cuantizaciones GGUF de esta versión.
- Opciones de despliegue: `transformers` (bf16, `device_map="auto"`), ttnn/tt-metal con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0; el tag `text-generation-inference` y `endpoints_compatible` figura en los metadatos de Hugging Face, pero no se detalla configuración de TGI en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 14,7 mil millones | No disponible | BFP4 MLP + BFP8 atención, 11,034 GB | MIT | Hugging Face, 137 descargas |
| microsoft/Phi-4-reasoning (BF16) | 14,7 mil millones | No disponible | bf16, 29,32 GB | MIT | Hugging Face |
| Q4_K_M de llama.cpp (misma base) | 14,7 mil millones | No disponible | GGUF Q4_K_M, 9,059 GB | MIT (modelo base) | Generado con llama.cpp v0.9.0 |

La comparación relevante es de fidelidad y tamaño: Q4_K_M ocupa menos (9,059 GB) y tiene mejor KL media (0,0115 frente a 0,0158) y top-1 (94,42 % frente a 94,13 %), pero no está pensado para Tensix; este modelo prioriza la compatibilidad con el hardware de Tenstorrent. No se dispone de datos de benchmarks de tareas para comparar con otras alternativas de razonamiento de tamaño similar.

## Limitaciones y advertencias

- Orientado a hardware específico: los formatos BFP4/BFP8 están pensados para Tensix; fuera de esa ruta, la carga práctica es en bf16 (29,32 GB), lo que anula la ventaja de tamaño.
- Pérdida de fidelidad medible: KL media de 0,0158 frente a 0 en BF16 y top-1 del 94,13 %, ligeramente por debajo de Q4_K_M (94,42 %).
- Idioma: solo inglés declarado oficialmente; la evaluación incluye coreano, pero no se garantiza calidad multilingüe general.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de pensamiento puede producir cadenas de razonamiento incorrectas (la model card indica que BF16 no respondió a ninguno de los 7 prompts de razonamiento con pensamiento activado en su comprobación).
- Longitud de contexto: no disponible; no se puede confirmar el límite operativo del modelo base en esta versión.
- Licencia MIT: permite uso comercial, pero conviene revisar los términos del modelo base microsoft/Phi-4-reasoning y las dependencias del stack Tenstorrent.
- Madurez: repositorio con 0 likes y 137 descargas, actualizado por última vez el 2026-11-27 (renombrado desde BFP4-MLP el 2026-11-22); el soporte se limita a las herramientas v0.1.0 publicadas por Xylolabs.
- El quickstart usa `dtype="bfloat16"`, por lo que en `transformers` no se aprovecha el formato cuantizado empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Repositorio de cuantización (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
