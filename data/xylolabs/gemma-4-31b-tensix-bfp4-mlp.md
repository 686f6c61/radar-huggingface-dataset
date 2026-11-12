# Xylolabs/gemma-4-31B-Tensix-BFP4-MLP

## Resumen

Xylolabs/gemma-4-31B-Tensix-BFP4-MLP es una versión cuantizada del modelo multimodal google/gemma-4-31B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint del modelo base en el que las capas lineales del transformer de lenguaje se han cuantizado a formatos de coma flotante por bloques propios del hardware: BFP4 para las proyecciones MLP y BFP8 para las proyecciones de atención.

El problema que resuelve es el despliegue eficiente del modelo Gemma 4 de 31B en aceleradores Tensix, donde TT-NN espera pesos ya alineados a la rejilla de cuantización BFP4/BFP8. Los pesos se almacenan en safetensors en bf16, pero cada valor ya está redondeado a la rejilla, de modo que el empaquetado en la NPU es exacto y sin pérdida adicional. El resultado ocupa 23,53 GB empaquetados, con un promedio de 6,13 bits por peso, frente a los 61,39 GB del modelo en BF16.

La relevancia actual radica en que permite ejecutar un modelo de 31B con capacidades de imagen y texto en hardware de inferencia de bajo consumo, manteniendo una fidelidad alta respecto al BF16 original (KL medio de 0,02813 y top-1 del 93,55 %). La cuantización se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de google/gemma-4-31B; capas lineales cuantizadas para TT-NN |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en MLP gate/up/down; BFP8 (bfloat8_b) en atención q, k, o y v; bf16 en embedding, LM head, normas y torre de visión; 6,13 bits por peso de media |
| Idiomas soportados | no disponible (evaluación con texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, valores sobre rejilla BFP4/BFP8); repo de 65,4 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint google/gemma-4-31B, no un entrenamiento nuevo. La arquitectura subyacente es un transformer multimodal con torre de visión (`vision_tower`, `embed_vision`) y un modelo de lenguaje de 60 capas. La intervención de Xylolabs se limita al modelo de lenguaje: las proyecciones de atención q, k y o de las 60 capas, y la proyección v de 50 capas, se cuantizan a `ttnn.bfloat8_b` (8,5 bits por peso); las proyecciones MLP gate, up y down de las 60 capas se cuantizan a `ttnn.bfloat4_b` (4,5 bits por peso). El resto de tensores —embedding, LM head ligada al embedding, normas y toda la parte de visión— permanece en bf16 sin cambios.

La cuantización BFP4 se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores BFP8 se obtuvieron por redondeo al más cercano. El fichero `quant4.json` documenta el formato de cada proyección. Los pesos se guardan en bf16 con cada valor ya sobre la rejilla BFP4 o BFP8, de forma que TT-NN los empaqueta directamente sin transformación adicional. El autor indica que el checkpoint se probó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, y no sobre hardware físico; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto y continuación de texto: el modelo es el checkpoint preentrenado, sin plantilla de chat, por lo que funciona en modo de completado.
- Procesamiento de imagen y texto: la pipeline declarada es image-text-to-text y conserva la torre de visión en bf16.
- Razonamiento y conocimiento general heredados de Gemma 4 de 31B; el autor remite a la model card del modelo base para las capacidades concretas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la evaluación de fidelidad incluyó inglés y coreano.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El checkpoint está empaquetado para TT-NN y se carga directamente en Wormhole o Blackhole sin recuantizar, lo que reduce el peso de 61,39 GB a 23,53 GB y permite alojar el modelo en memoria DRAM de la NPU.
- Servicio de completado de texto sobre aceleradores de bajo consumo: al conservar el 93,55 % de top-1 respecto a BF16, es adecuado para tareas de generación donde se prioriza el coste energético del acelerador frente a la fidelidad máxima.
- Procesamiento de documentos con imagen y texto: la torre de visión permanece intacta en bf16, de modo que las tareas de image-text-to-text conservan la calidad del modelo base, mientras que el coste se reduce en el decodificador.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de BFP4/BFP8 frente a BF16 y frente a Q4_K_M de llama.cpp, con métricas de KL y top-1 ya publicadas.
- Investigación en formatos de coma flotante por bloques: el par de scripts `pack_tensix.py` y `verify_grid.py` permite verificar que cada matriz se empaqueta sin alterar ningún valor, útil para validar pipelines de cuantización sobre Tensix.
- Prototipado en simulador: al haberse validado sobre ttsim, permite desarrollar y depurar integraciones TT-NN antes de disponer de hardware Blackhole físico.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-31B) | 16 | 61,39 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,13 | 23,534 | 0,02813 | 93,55 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 18,687 | 0,03187 | 93,01 | 28 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos. El autor advierte que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se midió velocidad en dispositivo. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) y sin importance matrix. El criterio de aceptación del autor (KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida más) se cumplió: 0,88 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,53 GB empaquetados en formatos BFP4/BFP8; el repositorio completo en safetensors ocupa 65,4 GB.
- Aceleradores objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU consumer: no disponible; el checkpoint está pensado para TT-NN, no para CUDA. La carga con transformers es posible en bf16 y requeriría del orden de 61 GB, fuera del alcance de GPUs consumer habituales.
- Despliegue: TT-NN (ttnn 0.81.1 probado sobre ttsim) para Tensix; transformers con `AutoModelForCausalLM` para carga en bf16. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no medidos; el autor indica explícitamente que no se midió velocidad en dispositivo.
- Verificación: `python pack_tensix.py <dir>` comprueba cada matriz y `python verify_grid.py <dir>` valida la rejilla solo con torch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Este modelo | 32,68 B | no disponible | BFP4 MLP + BFP8 atención (6,13 bits/peso) | 23,53 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| google/gemma-4-31B (BF16) | 32,68 B | no disponible | bf16 | 61,39 GB | Apache 2.0 | GPU/CPU genérica |
| Q4_K_M de llama.cpp | 32,68 B | no disponible | 4,87 bits/peso | 18,687 GB | Apache 2.0 | CPU/GPU vía llama.cpp |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es el modelo preentrenado: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no debe usarse directamente como asistente conversacional sin un post-entrenamiento adicional.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión se conserva en bf16 pero no se reportan métricas de calidad para tareas multimodales.
- No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros); las métricas disponibles miden fidelidad al BF16, no calidad.
- No se midió rendimiento en hardware real: la validación se hizo sobre ttsim, el simulador de Blackhole. El comportamiento en Wormhole o Blackhole físico no está verificado por el autor.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la integración con esos frameworks no está validada.
- La licencia es Apache 2.0 según la model card del modelo base; el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor aporta el texto estándar y un fichero NOTICE con los cambios.
- El modelo se distribuye tal cual, sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; deben consultarse en la model card de google/gemma-4-31B.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2607.02770): no disponible como URL verificada en la información proporcionada
