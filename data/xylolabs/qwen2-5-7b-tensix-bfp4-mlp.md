# Xylolabs/Qwen2.5-7B-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Tensix-BFP4-MLP es una cuantización del modelo Qwen2.5-7B de Alibaba, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo ni de un fine-tuning: es el checkpoint base de Qwen2.5-7B con sus capas lineales recompuestas en los formatos de coma flotante por bloques nativos del hardware de Tenstorrent, `ttnn.bfloat4_b` (BFP4) para las proyecciones del MLP y `ttnn.bfloat8_b` (BFP8) para las de atención.

La propuesta es relevante porque el ecosistema de Tenstorrent (tt-metal, TT-NN, tt-forge) trabaja con formatos BFP que no coinciden con las cuantizaciones habituales del mundo CUDA (GPTQ INT4, AWQ, GGUF). Este repositorio entrega los pesos ya "aterrizados" en la rejilla BFP4/BFP8, de modo que TT-NN puede empaquetarlos sin recuantizar en el dispositivo, evitando errores acumulados y simplificando el despliegue.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B (28 capas, 7.615.616.512 parámetros), con embedding, LM head y normalizaciones en bf16. El resultado ocupa 6,26 GB empaquetados con una media de 6,58 bits por peso. Es un modelo preentrenado, no ajustado a instrucciones, por lo que su uso previsto es la continuación de texto y la evaluación de la cadena de cuantización sobre silicio Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantización BFP para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-7B) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; bf16 en embedding, LM head y norms |
| Idiomas soportados | en (inglés; el calibrado usó también texto coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP4/BFP8) + `quant4.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only con 28 capas, atención multi-cabeza con RoPE y un MLP con proyecciones gate/up/down. Xylolabs no reentrena el modelo; aplica un pipeline de cuantización post-entrenamiento sobre las capas lineales. Las proyecciones q, k, v y o de las 28 capas se cuantizan a BFP8 mediante redondeo al más cercano (round to nearest), mientras que las proyecciones gate, up y down del MLP se cuantizan a BFP4 con GPTQ y una búsqueda de exponente por bloque.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son ficheros en bf16 cuyos valores ya están alineados a la rejilla BFP4 o BFP8, de forma que TT-NN los empaqueta tal cual sin recuantización en el dispositivo. El repositorio incluye `quant4.json`, que mapea cada proyección a su formato, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado no altera ningún valor. La validación se hizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, no sobre hardware físico.

## Capacidades

- Generación de texto y continuación de texto en inglés (modelo preentrenado, sin ajuste a instrucciones).
- Razonamiento y conocimiento general heredados de Qwen2.5-7B en su versión base.
- Codigo y matematicas en la medida en que el checkpoint base los cubre; no se han publicado evaluaciones específicas para esta cuantización.
- El tokenizador conserva la plantilla de chat del modelo base, pero el modelo no está entrenado para seguir instrucciones.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en esta variante.
- Capacidades multilingües limitadas según la model card al inglés; el calibrado incluyó coreano, pero no se declara soporte oficial.
- Capacidad especial: pesos listos para empaquetado directo en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con verificación de integridad bit a bit.

## Casos de uso

- Despliegue en NPU Tenstorrent: cargar el checkpoint en Wormhole o Blackhole con TT-NN para servir generación de texto en hardware no CUDA, aprovechando que los pesos ya están en la rejilla BFP nativa y no requieren recuantización en el dispositivo.
- Evaluación de pipelines de cuantización: usar los scripts `pack_tensix.py` y `verify_grid.py` para validar que el empaquetado BFP4/BFP8 preserva los valores, como test de regresión de la cadena tt-metal.
- Investigación en formatos de coma flotante por bloques: comparar el impacto de BFP4 con GPTQ frente a alternativas como Q4_K_M de llama.cpp en términos de divergencia KL y top-1 respecto a bf16.
- Prototipado en simulador: ejecutar el modelo sobre ttsim (simulador de Blackhole) para desarrollar kernels o grafos de TT-NN antes de disponer de hardware físico.
- Generación de texto en inglés para tareas de continuación y completado en entornos de investigación, dado que es un modelo preentrenado y no conversacional.
- Base para fine-tuning posterior: al conservar la licencia Apache 2.0 y el tokenizador original, puede servir como punto de partida para ajustes que después se recuantizen a BFP para Tensix.
- Benchmarking de infraestructura: medir fidelidad de cuantización (KL medio de 0,05152 frente a bf16) como referencia al evaluar nuevas versiones de tt-metal o tt-forge.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a bf16, no la calidad en tareas. La evaluación cubre 8.184 posiciones de texto inglés y coreano (WikiText-2 test y Wikipedia coreana) y 28 prompts cortos con comprobación automática en formato de completado, 3-shot.

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B) | 16 | 15,23 | 0 | 100 | 26 de 28 | - |
| Este modelo (BFP4 MLP / BFP8 attn) | 6,58 | 6,262 | 0,05152 | 89,88 | 25 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03655 | 90,81 | 25 de 28 | 0 |

El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo lo cumple con 1,41 veces el KL de Q4_K_M y 0 respuestas perdidas. No se han publicado mediciones de velocidad ni throughput en dispositivo.

## Requisitos de hardware

- VRAM/DRAM: 6,26 GB empaquetados en BFP; el repositorio completo ocupa 15,2 GB por almacenar los tensores en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). La verificación se hizo con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre silicio real.
- GPU: no está pensado para GPU; puede cargarse en GPU con transformers en bf16 (unos 15 GB de VRAM), pero sin las ventajas de empaquetado BFP.
- GPU de consumo: en bf16 cabría en tarjetas de 16 GB o más (por ejemplo RTX 4090); en Tensix no aplica el concepto de VRAM.
- Despliegue: TT-NN (recomendado), tt-transformers de tt-metal v0.81.1 (solo en 2 o 4 chips, N300 o superior, no probado con este checkpoint), tt-forge/tt-xla (no probado; por defecto mantiene bf16 y su opción `bfp_bf4` recuantiza en PyTorch).
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Objetivo |
|---|---|---|---|---|---|
| Este modelo | 7,6 B | BFP4 MLP / BFP8 attn | 6,26 GB | Apache 2.0 | NPU Tensix |
| Qwen2.5-7B (bf16) | 7,6 B | bf16 | 15,23 GB | Apache 2.0 | GPU/CPU general |
| Qwen2.5-7B Q4_K_M (llama.cpp) | 7,6 B | GGUF INT4 | 4,68 GB | Apache 2.0 | CPU/GPU con llama.cpp |
| Otras cuantizaciones GPTQ/AWQ de Qwen2.5-7B | 7,6 B | INT4/INT8 | variable | Apache 2.0 | GPU CUDA |

La diferencia clave frente a Q4_K_M y las cuantizaciones GPTQ/AWQ es el formato de destino: este checkpoint está alineado a la rejilla BFP de Tensix, mientras que las alternativas están pensadas para CUDA o CPU. En fidelidad, Q4_K_M obtiene un KL ligeramente mejor (0,03655 frente a 0,05152) con menos bits por peso, aunque pierde la ventaja de empaquetado nativo en TT-NN.

## Limitaciones y advertencias

- Es un modelo preentrenado, no ajustado a instrucciones; no debe usarse como asistente conversacional sin fine-tuning.
- La model card declara solo inglés; el soporte multilingüe no está garantizado aunque el calibrado incluyera coreano.
- Los benchmarks miden proximidad a bf16 (KL y top-1), no calidad en tareas; no hay evaluaciones de MMLU, HumanEval o GSM8K para esta variante.
- No se ha probado en hardware Tensix real, solo en el simulador ttsim con ttnn 0.81.1; el comportamiento en Wormhole o Blackhole físico está por validar.
- La ruta tt-transformers requiere 2 o 4 chips y flags específicos (`--use_hf_rope`, `--instruct 0`); sin `--use_hf_rope` el QKV fusionado se recuantiza y pierde fidelidad.
- tt-forge no se ha ejecutado con este checkpoint; su opción `bfp_bf4` recuantiza en PyTorch con layout [out, in], lo que puede alterar los valores.
- Riesgo de alucinación y sesgos heredados de Qwen2.5-7B, no evaluados en esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la fidelidad de la cuantización recae en quien la despliega.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tensix-BFP4-MLP/blob/main/LICENSE
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
