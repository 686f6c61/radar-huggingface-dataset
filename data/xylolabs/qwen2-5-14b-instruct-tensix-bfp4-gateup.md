# Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-GateUp

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-GateUp es una cuantización del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, publicada por Xylolabs y orientada específicamente a la ejecución sobre NPUs Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El checkpoint no es una cuantización genérica para GPU, sino un export formateado para el stack tt-metal/ttnn: las capas lineales se almacenan como tensores `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8), de modo que TT-NN los empaqueta en el dispositivo sin transformar sus valores.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-14B-Instruct, con 14.770.033.664 parámetros totales (dato real de safetensors), y aplica una compresión mixta: atención (q, k, v, o) y proyección MLP down en BFP8 (8,5 bits por peso), mientras que las proyecciones MLP gate y up se cuantizan en BFP4 (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque. El resultado es un peso medio de 7,45 bits por parámetro y 13,76 GB empaquetados, frente a los 29,54 GB del modelo en BF16.

Su relevancia es concreta: permite desplegar un modelo de 14B en hardware Tenstorrent con un consumo de memoria de dispositivo reducido, manteniendo una fidelidad frente al BF16 original verificada mediante divergencia KL y top-1 sobre texto en inglés y coreano. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con capas lineales cuantizadas a formatos Tensix BFP4/BFP8 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en MLP gate/up; BFP8 (bfloat8_b) en atención q/k/v/o y MLP down; bf16 en embeddings, LM head y normas. Media de 7,45 bits por peso |
| Idiomas soportados | en (ingles; la calibracion uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (29,5 GB de repo, 13,76 GB empaquetados en dispositivo), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen2.5-14B-Instruct, un transformer decoder-only denso de 48 capas. No se ha reentrenado el modelo: la intervención consiste en una cuantización post-entrenamiento de las capas lineales. Las proyecciones de atención (q, k, v, o) y la proyección MLP down se almacenan en `ttnn.bfloat8_b` aplicando redondeo al más cercano (round to nearest). Las proyecciones MLP gate y up se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica reside en el formato de almacenamiento: las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP4 o BFP8, de forma que TT-NN las empaqueta sin alterar sus valores. Esto permite una verificación exacta del empaquetado (`torch.equal` tras el round-trip por dispositivo), comprobada con ttnn 0.81.1 sobre el simulador Blackhole (ttsim). El repositorio incluye `pack_tensix.py` para validar cada matriz y `verify_grid.py` para comprobar la rejilla solo con torch. Según la model card, tt-transformers y tt-forge no se ejecutaron con este checkpoint. No se dispone de información sobre datos de entrenamiento adicionales, RLHF o DPO más allá de los del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con la plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-14B-Instruct.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole y Blackhole) mediante tt-metal/ttnn.
- Carga y uso estándar con `transformers` (`AutoModelForCausalLM`) en bf16 y `device_map="auto"`.
- Verificación de fidelidad de cuantización mediante métricas KL y top-1 frente al BF16 original.
- Capacidades multilingües: la model card declara únicamente inglés; la calibración incluyó texto coreano, pero no se documenta soporte multilingüe adicional.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no documentados en la información proporcionada para este checkpoint.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el checkpoint está empaquetado para tt-metal/ttnn, por lo que es adecuado para servir Qwen2.5-14B en Wormhole o Blackhole con 13,76 GB de memoria de dispositivo para los pesos, más espacio para KV cache y buffers.
- Inferencia conversacional de 14B con presupuesto de memoria reducido: al pasar de 29,54 GB en BF16 a 13,76 GB empaquetados, permite alojar el modelo en configuraciones de memoria más ajustadas sin salir del ecosistema Tensix.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin cambios de valor, útil en CI para validar exports BFP4/BFP8 antes de producción.
- Evaluación de fidelidad de cuantización: las métricas de KL medio (0,10044) y top-1 (90,45 %) frente a BF16 permiten comparar el impacto de la cuantización con alternativas como Q4_K_M de llama.cpp en tareas de texto en inglés y coreano.
- Prototipado en simulador: la verificación con ttsim (simulador Blackhole) facilita desarrollar y depurar kernels o flujos TT-NN sin disponer de hardware físico.
- Investigación en formatos block floating point: el checkpoint sirve como caso de estudio de cuantización mixta (BFP4 en gate/up, BFP8 en atención y down) con GPTQ y búsqueda de exponente por bloque.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4/BFP8) | 7,45 | 13,756 | 0,10044 | 90,45 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

Las métricas KL y top-1 cubren 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El modelo supera el criterio declarado por el autor: KL medio de 1,09 veces el de Q4_K_M y 0 respuestas perdidas frente a 1. La model card advierte que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 13,76 GB para los pesos del modelo de lenguaje, más espacio adicional para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Verificación realizada con ttnn 0.81.1 sobre ttsim (simulador Blackhole); no se reportan pruebas en silicio físico en la información disponible.
- Carga alternativa con `transformers` en bf16 y `device_map="auto"`; en ese caso el consumo se aproxima al del modelo base (repo de 29,5 GB).
- Opciones de despliegue: tt-metal/ttnn para Tensix; `transformers` para carga estándar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4/BFP8) | 14,77B | No disponible | BFP4/BFP8 Tensix, 7,45 bits | 13,76 GB empaquetados | Apache 2.0 | Tenstorrent Tensix; transformers |
| Qwen2.5-14B-Instruct (BF16) | 14,77B | No disponible | BF16, 16 bits | 29,54 GB | Apache 2.0 | GPU/CPU estándar |
| Q4_K_M de llama.cpp (mismo checkpoint) | 14,77B | No disponible | GGUF Q4_K_M, 4,87 bits | 8,988 GB | Apache 2.0 | llama.cpp |

La comparación directa publicada se limita a estas tres variantes del mismo modelo base. Frente a Q4_K_M, este checkpoint ocupa más memoria (13,76 GB frente a 8,988 GB) pero obtiene un KL medio ligeramente superior (0,10044 frente a 0,0923) y una respuesta correcta más (32 frente a 31 de 33). Su ventaja no es la compresión máxima, sino el empaquetado exacto para TT-NN sin pérdida adicional en el dispositivo.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado; el uso en otros idiomas no está garantizado.
- Las métricas de evaluación miden fidelidad al BF16, no calidad de tarea; no se reportan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.
- No se reportan datos de velocidad, latencia ni throughput.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la validación se hizo con ttnn 0.81.1 sobre el simulador ttsim, no en hardware físico.
- El checkpoint está diseñado para Tensix; su uso en GPU requiere cargarlo en bf16, perdiendo la ventaja de memoria del formato BFP.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Qwen2.5-14B-Instruct.
- Licencia Apache 2.0, igual que el modelo base; los cambios se detallan en `NOTICE`. El software se proporciona "as is".
- La cuantización BFP4 en gate/up puede degradar tareas sensibles a precisión; el autor reporta 0 respuestas perdidas en su conjunto de 33 prompts, una muestra reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
