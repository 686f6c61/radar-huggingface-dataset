# Xylolabs/Qwen3-8B-Tensix-BFP4-MLP

## Resumen

Qwen3-8B-Tensix-BFP4-MLP es una exportación cuantizada de Qwen/Qwen3-8B, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo entrenado desde cero, sino un checkpoint derivado cuyo objetivo es empaquetar los pesos en los formatos nativos de bloque flotante de TT-NN (`ttnn.bfloat4_b` y `ttnn.bfloat8_b`) para que el hardware Tensix pueda cargarlos sin transformaciones adicionales. El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros, con licencia Apache 2.0.

La innovación principal reside en la mezcla de precisiones por tipo de tensor: las proyecciones de atención (q, k, v, o) en las 36 capas se guardan en BFP8 (8,5 bits por peso, redondeo al más cercano), mientras que las proyecciones MLP (gate, up, down) se cuantizan a BFP4 (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado es un peso medio de 6,99 bits por peso y un tamaño empaquetado de 7,15 GB, frente a los 16,38 GB del BF16 original.

El interés del modelo es acotado pero concreto: sirve como referencia reproducible para quien despliegue Qwen3-8B sobre silicio Tenstorrent y quiera validar el pipeline de cuantización BFP. El autor publica métricas de fidelidad frente a BF16 (KL medio de 0,0342 y 92,41 % de top-1 en 16.240 posiciones de texto inglés y coreano) y herramientas de verificación (`pack_tensix.py`, `verify_grid.py`). No se han ejecutado tt-transformers ni tt-forge con este checkpoint, y la validación en hardware se hizo sobre `ttsim`, el simulador de Blackhole, con ttnn 0.81.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos cuantizados en formatos BFP para Tensix |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BFP8 (atención q/k/v/o, 8,5 bits/peso), BFP4 vía GPTQ (MLP gate/up/down, 4,5 bits/peso); media 6,99 bits/peso; LM head, embeddings y normas en bf16 |
| Idiomas soportados | no disponible (calibración de cuantización en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e índice de shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B original: un transformer denso de 36 capas con atención completa y capas MLP, sin mezcla de expertos. No hay reentrenamiento ni ajuste fino; la única modificación es la cuantización de los pesos lineales. Las matrices de atención (q, k, v, o) en las 36 capas se almacenan en `ttnn.bfloat8_b` aplicando redondeo al más cercano, mientras que las matrices MLP (gate, up, down) se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores cuantizados se guardan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar su valor.

La innovación técnica destacable es la doble precisión por módulo: la atención, más sensible, conserva 8,5 bits por peso, mientras que las MLP aceptan 4,5 bits. El empaquetado se valida con `pack_tensix.py`, que comprueba matriz a matriz que el valor empaquetado coincide con el original (y opcionalmente hace round-trip por DRAM del dispositivo), y con `verify_grid.py`, que verifica la rejilla BFP solo con torch. La verificación se realizó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; no se ejecutaron tt-transformers ni tt-forge con este checkpoint.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3 (`apply_chat_template`), tal como muestra el ejemplo de quickstart.
- Razonamiento de múltiples pasos: el autor evalúa 7 prompts de razonamiento con el modo "thinking" activado además de los 33 prompts cortos.
- Capacidades heredadas del modelo base Qwen3-8B (código, matemáticas, multilingüismo), aunque el autor no las documenta explícitamente en esta model card.
- Compatibilidad con el ecosistema `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Empaquetado nativo en TT-NN para NPU Tensix, con verificación de que los valores no cambian al cargar en DRAM del dispositivo.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Despliegue de Qwen3-8B en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado en BFP4/BFP8 para que TT-NN lo cargue directamente en DRAM sin conversión, con un consumo de 7,15 GB solo para pesos del modelo de lenguaje.
- Validación de pipelines de cuantización BFP: `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado no altera valores, útil para equipos que desarrollen sus propias exportaciones.
- Investigación sobre cuantización mixta por módulo: la combinación BFP8 en atención y BFP4 en MLP sirve como caso de estudio reproducible de cómo afecta la precisión por bloque a la fidelidad frente a BF16 (KL medio 0,0342).
- Benchmarking de fidelidad de cuantización: el autor publica comparación directa contra Q4_K_M de llama.cpp (KL 0,04236, top-1 91,24 %), lo que permite usar el modelo como referencia en estudios de compresión.
- Prototipado en simulador: al haberse validado en `ttsim` (simulador de Blackhole), es adecuado para desarrollo y pruebas de integración antes de disponer de hardware físico.
- Evaluación de modelos en inglés y coreano: la calibración y las métricas cubren WikiText-2 y Wikipedia en coreano, por lo que resulta útil en flujos de evaluación bilingües de ese par de idiomas.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | 16,38 | 0 | 100 | 38 de 40 | - |
| **Este modelo** | 6,99 | 7,152 | 0,0342 | 92,41 | 39 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,04236 | 91,24 | 38 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.240 posiciones de texto inglés y coreano (WikiText-2 test, Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en el modelo cuantizado. El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se reporta velocidad. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,15 GB solo para pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). La validación se hizo con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole.
- GPU consumer: no es el destino del checkpoint; el quickstart con `transformers` carga en bf16 (aproximadamente 16,4 GB de pesos), lo que requiere una GPU con al menos 24 GB (RTX 3090/4090) o descarga en CPU con `device_map="auto"`.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`/`ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`); `transformers` con `AutoModelForCausalLM`. tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B (BF16) | 8,19 B | no disponible | 16 | 16,38 GB | Apache 2.0 | Hugging Face |
| **Qwen3-8B-Tensix-BFP4-MLP** | 8,19 B | no disponible | 6,99 | 7,152 GB | Apache 2.0 | Hugging Face |
| Qwen3-8B Q4_K_M (llama.cpp) | 8,19 B | no disponible | 4,90 | 5,028 GB | Apache 2.0 | Generado por el autor con llama.cpp v0.9.0 |

La comparativa relevante es de fidelidad y tamaño, no de capacidad: los tres checkpoints derivan del mismo Qwen3-8B. El modelo Tensix ocupa un punto intermedio entre BF16 y Q4_K_M en tamaño (7,15 GB frente a 16,38 y 5,03 GB) y logra menor KL que Q4_K_M (0,0342 frente a 0,04236) con mayor top-1 (92,41 % frente a 91,24 %). Su ventaja específica es el empaquetado nativo para TT-NN, que Q4_K_M no ofrece.

## Limitaciones y advertencias

- No es un modelo nuevo: todas las capacidades y sesgos son los del Qwen3-8B original, no evaluados de forma independiente en esta model card.
- Las métricas publicadas miden fidelidad frente a BF16 (KL, top-1, respuestas cortas), no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- No se reporta velocidad ni latencia; la validación se hizo en simulador (`ttsim`), no en hardware físico, y tt-transformers y tt-forge no se probaron con este checkpoint.
- El modelo está pensado para NPU Tensix; fuera de ese hardware pierde su ventaja de empaquetado y se comporta como un Qwen3-8B cuantizado de forma no estándar.
- La calibración de GPTQ se hizo solo con WikiText-2 y Wikipedia en coreano, lo que puede sesgar la fidelidad en otros idiomas o dominios.
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen3-8B; no se documentan análisis específicos.
- Licencia Apache 2.0, igual que el modelo base; el autor incluye un archivo `NOTICE` con los cambios y distribuye el modelo "as is", sin garantía, y sin afiliación ni respaldo de Tenstorrent.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2505.09388, Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP4-MLP/blob/main/LICENSE
