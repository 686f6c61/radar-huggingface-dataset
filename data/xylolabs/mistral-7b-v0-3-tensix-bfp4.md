# Xylolabs/Mistral-7B-v0.3-Tensix-BFP4

## Resumen

Mistral-7B-v0.3-Tensix-BFP4 es una versión cuantizada del modelo base mistralai/Mistral-7B-v0.3, desarrollada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización aplica GPTQ con búsqueda de exponente por bloque sobre las capas lineales de atención (q, k, v, o) y MLP (gate, up, down) de las 32 capas del transformer, dejando en bf16 el LM head, los embeddings, las normas y el resto de tensores. El formato resultante es `ttnn.bfloat4_b` (block floating point de 4 bits), lo que arroja una media de 4,93 bits por peso y un tamaño empaquetado de 4,46 GB.

El checkpoint mantiene los pesos en bf16 en disco, pero con cada valor ya alineado a la rejilla BFP4, de modo que TT-NN los empaqueta sin pérdida adicional. La calibración se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El modelo conserva la naturaleza de modelo preentrenado (sin plantilla de chat) y la licencia Apache 2.0 del original.

Su relevancia es doble: por un lado, ofrece una alternativa de cuantización de 4 bits orientada específicamente al ecosistema Tenstorrent, que hasta ahora contaba con pocos checkpoints publicados en este formato; por otro, documenta de forma explícita la fidelidad respecto a BF16 mediante métricas de divergencia KL y top-1, algo poco habitual en cuantizaciones de 4 bits. No obstante, el autor advierte que la validación se hizo sobre el simulador ttsim (ttnn 0.81.1) y no sobre hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3), con capas lineales cuantizadas a BFP4 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en capas lineales; 4,93 bits de media); compatible con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (calibrado con texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores en rejilla BFP4); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Mistral-7B-v0.3, sin modificaciones estructurales. La intervención de Xylolabs se limita a la cuantizacion post-entrenamiento de las proyecciones lineales: atención (q, k, v, o) y MLP (gate, up, down) en las 32 capas. El método combina GPTQ con una búsqueda de exponente por bloque para ajustar cada valor a la rejilla de block floating point de 4 bits. La calibración empleó 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano, lo que explica que las métricas de fidelidad se reporten sobre posiciones de texto en inglés y coreano.

Los tensores no lineales (LM head, embeddings, normas) permanecen en bf16, igual que en el modelo base. El repositorio incluye scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban que el empaquetado en TT-NN no altera ningún valor, y el autor indica que los mismos valores se empaquetan de forma exacta también en `ttnn.bfloat8_b`. No se documenta ningún proceso adicional de RLHF, DPO ni ajuste fino sobre el checkpoint base; se trata, por tanto, de una cuantización pura del modelo preentrenado.

## Capacidades

- Generación de texto autoregresiva en modo completion: el checkpoint es el modelo preentrenado, sin plantilla de chat ni ajuste por instrucciones.
- Razonamiento y conocimiento general heredados de Mistral-7B-v0.3 (no se documentan capacidades adicionales específicas en la informacion disponible).
- Ejecución sobre aceleradores Tenstorrent Tensix mediante TT-NN, con empaquetado directo de los pesos BFP4.
- Verificación de integridad de pesos mediante scripts incluidos (`pack_tensix.py`, `verify_grid.py`).
- Compatibilidad con `transformers` para carga en bf16 y ejecución en GPU/CPU convencional (los valores ya están en la rejilla BFP4, por lo que la inferencia estándar reproduce la cuantización).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole a través de TT-NN, reduciendo el peso de las matrices lineales a 4,46 GB empaquetados frente a los 14,5 GB en bf16.
- Investigación en cuantización de 4 bits: sirve como referencia reproducible de GPTQ con block floating point, con métricas de KL y top-1 publicadas frente a BF16 y a Q4_K_M de llama.cpp.
- Evaluación de fidelidad de formatos BFP: los scripts de verificación permiten comprobar que el empaquetado en `bfloat4_b` y `bfloat8_b` no altera valores, útil para validar toolchains propios.
- Generación de texto en inglés y coreano: la calibración con WikiText-2 y Wikipedia coreana hace que el modelo sea adecuado para tareas de completion en esos idiomas, aunque no se garantiza paridad con BF16 fuera de ese dominio.
- Prototipado en simulador: al haberse validado en ttsim, permite desarrollar pipelines de inferencia Tenstorrent sin disponer de hardware físico.
- Baseline para comparativas de cuantización: su tabla de evaluación (bits por peso, tamaño, KL medio, top-1, respuestas correctas) facilita comparaciones controladas con otras técnicas de cuantización de 4 bits.
- Integración en pipelines de `transformers`: la carga estándar con `AutoModelForCausalLM` permite usarlo como modelo de completion en entornos convencionales, aceptando la pérdida de fidelidad respecto a BF16 documentada por el autor.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad en tareas. La evaluación cubre 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana) y 28 prompts cortos con comprobación automática en formato completion, 3-shot.

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Mistral-7B-v0.3) | 16 | 14,50 | 0 | 100 | 20 de 28 | - |
| Mistral-7B-v0.3-Tensix-BFP4 | 4,93 | 4,463 | 0,01882 | 92,72 | 19 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,01285 | 94,05 | 20 de 28 | 0 |

El criterio de aceptación fijado por el autor (KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional) se cumple: 1,46 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0. No se han publicado mediciones de velocidad en dispositivo ni resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `transformers`: al cargarse en bf16, el checkpoint ocupa aproximadamente 14,5 GB de pesos, por lo que se recomienda al menos 16 GB de VRAM para inferencia básica y más para contextos largos o batches mayores.
- El despliegue objetivo es sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN; el autor indica que se probó con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware físico.
- GPU consumer: con 16 GB o más (por ejemplo, RTX 4090 de 24 GB) cabe en bf16; en GPUs de 8-12 GB sería necesario recurrir a otras cuantizaciones del modelo base, ya que este checkpoint está pensado para TT-NN.
- Opciones de despliegue: TT-NN (formato nativo), `transformers` con `AutoModelForCausalLM` en bf16, y `text-generation-inference` según los tags del repositorio. No se documenta compatibilidad con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; el autor señala explícitamente que no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral-7B-v0.3-Tensix-BFP4 | 7,25 B | no disponible | BFP4 (4,93 bits) | 4,46 GB | Apache 2.0 | Hugging Face (Xylolabs) |
| Mistral-7B-v0.3 (BF16) | 7,25 B | no disponible | bf16 (16 bits) | 14,50 GB | Apache 2.0 | Hugging Face (mistralai) |
| Mistral-7B-v0.3 Q4_K_M (llama.cpp) | 7,25 B | no disponible | GGUF Q4_K_M (4,83 bits) | 4,37 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |
| Mistral-7B-Instruct-v0.3 | 7,25 B | no disponible | bf16 | ~14,5 GB | Apache 2.0 | Hugging Face (mistralai) |

La comparación relevante es frente a BF16 (referencia de fidelidad) y frente a Q4_K_M de llama.cpp (cuantización de 4 bits de tamaño similar). El modelo de Xylolabs presenta un KL medio ligeramente superior a Q4_K_M (0,01882 frente a 0,01285) y un top-1 inferior (92,72 % frente a 94,05 %), pero iguala el número de respuestas correctas (19 frente a 20 de 28 en BF16 y Q4_K_M respectivamente, con 0 respuestas perdidas en ambos casos). La diferencia principal radica en el ecosistema de destino: BFP4 para TT-NN frente a GGUF para llama.cpp.

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat: no está ajustado para seguir instrucciones ni para diálogo; su uso natural es completion de texto.
- La validación se realizó sobre el simulador ttsim y no sobre hardware Tensix físico; el rendimiento real en Wormhole o Blackhole no está verificado.
- `tt-transformers` y `tt-forge` no se probaron con este checkpoint, según el autor.
- La cuantización introduce divergencia respecto a BF16: KL medio de 0,01882 y top-1 del 92,72 % sobre 8.184 posiciones de inglés y coreano; el rendimiento fuera de esos idiomas y dominios no está medido.
- La calibración se limitó a WikiText-2 y Wikipedia coreana (65.536 tokens), lo que puede sesgar la fidelidad hacia esos registros.
- Riesgo de alucinación inherente al modelo base, no evaluado específicamente en esta versión cuantizada.
- No se documentan sesgos específicos del checkpoint cuantizado; deben considerarse los del modelo base Mistral-7B-v0.3.
- Licencia Apache 2.0, igual que el modelo base; el repositorio no incluye el fichero LICENSE original de Mistral, por lo que Xylolabs añade el texto estándar y un NOTICE con los cambios.
- El autor declara no estar afiliado ni respaldado por Tenstorrent.
- No se dispone de datos de latencia ni throughput, por lo que no puede garantizarse un rendimiento mínimo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tensix-BFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
