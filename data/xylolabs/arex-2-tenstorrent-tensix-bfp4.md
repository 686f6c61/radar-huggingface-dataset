# Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4

## Resumen

AREX-2-Tenstorrent-Tensix-BFP4 es una exportación cuantizada de BAAI/AREX-2, el ajuste fino orientado a agentes que el Beijing Academy of Artificial Intelligence (BAAI) realizó sobre Qwen/Qwen3.8-27B. La ha producido Xylolabs y está específicamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), de modo que los pesos se cargan directamente en TT-NN sin transformación adicional. El modelo conserva la arquitectura multimodal image-text-to-text del original y sus 27.356.728.560 parámetros.

La innovación principal no está en el modelo en sí, sino en el formato: las capas lineales se han cuantizado a `ttnn.bfloat4_b` (block floating point de 4 bits, 4,5 bits por peso) mediante GPTQ, y la LM head a `ttnn.bfloat8_b` (8,5 bits por peso) con redondeo al más cercano. El resultado son 5,23 bits por peso de media y 17,60 GB empaquetados, frente a los 53,79 GB del checkpoint BF16. Esto permite ejecutar un modelo de 27B en hardware de inferencia de bajo consumo energético como las tarjetas Tensix, un nicho que hasta ahora dependía de GPUs de datacenter.

Es relevante porque demuestra que la cuantización de bloque (block floating point) con GPTQ puede llevarse a aceleradores no-GPU manteniendo una fidelidad alta: la KL media frente a BF16 es de 0,03640 y la tasa de acierto top-1 es del 91,55 %, con 40 de 40 respuestas correctas en el conjunto de evaluación del autor. El checkpoint está pensado para desarrolladores que despliegan en Tenstorrent y necesitan un modelo de agentes con capacidades multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + Gated DeltaNet) con torre visual; derivado de Qwen3.8-27B vía fine-tune de agentes de BAAI |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en LM head; bf16 en embeddings, normas, torre visual y resto de tensores; media de 5,23 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (matrices almacenadas como valores bf16 sobre la rejilla BFP4/BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base BAAI/AREX-2 es un fine-tune de agentes de Qwen3.8-27B. La arquitectura combina 16 capas de atención clásica (proyecciones q, k, v, o) con 48 capas de Gated DeltaNet (proyecciones q, k, v, z, a, b, output) y 64 capas de MLP (gate, up, down), además de una torre visual `visual` que se mantiene intacta en bf16. Esta mezcla de atención y capas de estado recurrente lineal (Gated DeltaNet) es la que da al modelo su perfil de eficiencia en secuencias largas, aunque la model card no detalla la longitud de contexto soportada.

El proceso de cuantización es el elemento diferencial: Xylolabs aplicó GPTQ con búsqueda de exponente por bloque a todas las proyecciones lineales, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. La LM head se cuantizó con redondeo al más cercano a BFP8. Las matrices resultantes se guardan como valores bf16 situados exactamente sobre la rejilla BFP4/BFP8, de forma que TT-NN las empaqueta sin alterar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) que verifican la identidad bit a bit tras el empaquetado. Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual no se ha evaluado en este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), heredado de la torre visual del modelo base.
- Razonamiento y resolución de tareas de agente, dado que AREX-2 es un fine-tune específico de agentes de Qwen3.8-27B.
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó coreano, pero no se documenta la cobertura de idiomas).
- Tool calling / function calling: no documentado explícitamente en la model card; debe verificarse contra la documentación del modelo base.
- Modo thinking: no documentado en la información disponible.
- Ejecución en NPU Tensix mediante el demo `qwen38_27b_qb2` de tt-metal, en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2).

## Casos de uso

- Inferencia en NPU Tenstorrent: despliegue del modelo en Wormhole o Blackhole usando el demo `qwen38_27b_qb2` de tt-metal v0.81.1 con `QWEN_PRECISION_CONFIG=baseline`, aprovechando los 17,60 GB de pesos empaquetados para ajustarse a la memoria de dispositivo disponible.
- Servicio de agentes conversacionales en infraestructura de bajo consumo: al ser un fine-tune de agentes, encaja en asistentes que encadenan pasos y llamadas a herramientas, con la ventaja energética de las NPU frente a GPUs.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text permite extraer información de capturas, formularios o diagramas combinándolos con instrucciones textuales.
- Evaluación de cuantización BFP4 en producción: útil como referencia para equipos que quieran medir la degradación real (KL 0,03640 frente a BF16) antes de adoptar BFP4 en sus propios modelos sobre Tensix.
- Prototipado en simulador: el autor verificó el empaquetado con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole, lo que permite validar pipelines sin hardware físico.
- Investigación en formatos de bloque: sirve como caso de estudio reproducible de GPTQ con búsqueda de exponente por bloque aplicado a un transformer híbrido con Gated DeltaNet.
- Fine-tuning posterior: al estar en safetensors y licencia Apache-2.0, puede servir de base para ajustes adicionales, aunque la rejilla BFP4 limita la precisión de los pesos de partida.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (BAAI/AREX-2) | 16 | 53,79 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,23 | 17,596 | 0,03640 | 91,55 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,547 | 0,02480 | 92,0 | no disponible | no disponible |

Los datos proceden de la evaluación publicada por el autor en la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que solo se cuantizó y evaluó el modelo de lenguaje, no la torre visual.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 17,60 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- El demo oficial `qwen38_27b_qb2` de tt-metal v0.81.1 exige cuatro chips Blackhole (QuietBox 2) en paralelo de tensores y rechaza cualquier otro hardware.
- No está pensado para GPUs consumer; no se documenta compatibilidad con CUDA, llama.cpp, vLLM, Ollama ni TGI.
- Despliegue verificado con `ttnn 0.81.1` sobre `ttsim` (simulador de Blackhole). tt-forge (tt-xla) no se ha probado con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración obligatoria: `QWEN_PRECISION_CONFIG=baseline`; el `config/precision.json` incluido por defecto recuantizaría la head a bfloat4_b.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| **AREX-2-Tenstorrent-Tensix-BFP4** | 27,36B | no disponible | BFP4 + BFP8 (5,23 bits/peso) | Apache-2.0 | NPU Tensix (Wormhole, Blackhole) |
| BAAI/AREX-2 (BF16) | 27,36B | no disponible | ninguna (16 bits/peso) | Apache-2.0 | GPU / CPU |
| Q4_K_M de AREX-2 (llama.cpp) | 27,36B | no disponible | Q4_K_M (4,92 bits/peso) | Apache-2.0 | CPU / GPU consumer |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | múltiples | no disponible | GPU / CPU |

La comparación cuantitativa disponible se limita a la tabla de evaluación del autor: frente a BF16, este checkpoint pierde 8,45 puntos de top-1 y obtiene una KL de 0,03640; frente a Q4_K_M de llama.cpp, la KL es ligeramente peor (0,03640 vs 0,02480) y el top-1 algo menor (91,55 % vs 92,0 %), aunque el conjunto de respuestas correctas es superior (40 de 40 frente a dato no disponible). La ventaja diferencial no es la fidelidad, sino la compatibilidad nativa con Tensix.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; la torre visual permanece en bf16 y no se ha validado su comportamiento tras el proceso.
- El demo de tt-metal solo se ha probado en cuatro chips Blackhole; el autor confirma que empaquetó exactamente las proyecciones de las capas 0 y 3, pero la head y una ejecución completa no se probaron por falta de hardware.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- La evaluación se basa en un conjunto de 40 preguntas, insuficiente para caracterizar el rendimiento en producción.
- No se documentan sesgos conocidos, cobertura de idiomas ni riesgo de alucinación específicos de este checkpoint; deben consultarse en la model card de BAAI/AREX-2.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datos de calibración.
- El formato BFP4 almacena los pesos sobre una rejilla de bloque; no es adecuado para reentrenamiento directo sin reconvertir a bf16.
- La configuración por defecto del demo (`config/precision.json`) recuantiza la head a bfloat4_b; es imprescindible fijar `QWEN_PRECISION_CONFIG=baseline` para reproducir el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo qwen38_27b_qb2 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
- Paper de referencia: arXiv:2609.38288
