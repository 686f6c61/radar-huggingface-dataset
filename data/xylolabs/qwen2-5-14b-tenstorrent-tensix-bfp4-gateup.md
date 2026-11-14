# Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp

## Resumen

Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp es una exportación cuantizada del modelo Qwen/Qwen2.5-14B, desarrollada por Xylolabs, orientada específicamente a la inferencia sobre las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint del modelo base de Alibaba con sus capas lineales cuantizadas en formatos de coma flotante por bloques (block floating point, BFP) que el runtime TT-NN puede empaquetar directamente sin pérdida de valores: BFP4 para las proyecciones gate y up del MLP, y BFP8 para atención y la proyección down.

El modelo base Qwen2.5-14B es un transformer decoder-only denso de 14.770.033.664 parámetros, con ventana de contexto de 32.768 tokens en su configuración original y entrenamiento multilingüe (aunque esta exportación declara únicamente inglés). Esta versión conserva la plantilla de chat del modelo base pero es un modelo preentrenado, no ajustado por instrucciones: su función es continuar texto.

Su relevancia radica en que reduce el peso del modelo de 29,54 GB (BF16) a 13,756 GB empaquetados (7,45 bits por peso de media), lo que permite alojar los pesos del modelo de lenguaje en aproximadamente 13,76 GB de memoria de dispositivo de una NPU Tensix, dejando espacio para la caché KV y los búferes. Es una pieza de infraestructura para quien despliega Qwen2.5-14B sobre hardware de Tenstorrent, no un modelo de propósito general para GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) con capas lineales cuantizadas en block floating point |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-14B; no se especifica en la model card de esta exportación) |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) en MLP gate/up; BFP8 (bfloat8_b, 8,5 bits por peso) en atención q/k/v/o y MLP down; embeddings, LM head y normas en bf16. Media de 7,45 bits por peso |
| Idiomas soportados | en (según la model card; el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (29,5 GB de repositorio); matrices almacenadas como valores bf16 sobre rejilla BFP4 o BFP8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only denso de 48 capas con atención por múltiples cabezas y MLP con activación SwiGLU. La modificación de esta exportación afecta exclusivamente a la representación numérica de los pesos lineales. Las proyecciones q, k, v y o de las 48 capas, así como la proyección down del MLP, se almacenan en `ttnn.bfloat8_b` mediante redondeo al más cercano. Las proyecciones gate y up del MLP se cuantizan a `ttnn.bfloat4_b` con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica clave es que las matrices cuantizadas se guardan como valores bf16 situados exactamente sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores; los scripts `pack_tensix.py` y `verify_grid.py` verifican esta propiedad matriz a matriz. El archivo `quant4.json` documenta el formato de cada proyección. No hay información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada para esta exportación.

## Capacidades

- Generación y continuación de texto en inglés, en formato de completion (no es un modelo ajustado por instrucciones).
- Razonamiento y conocimiento general heredados de Qwen2.5-14B en su versión preentrenada.
- Capacidad multilingüe del modelo base no garantizada en esta exportación: la model card declara únicamente inglés, aunque la calibración de cuantización incluyó texto en coreano.
- Conserva la plantilla de chat del modelo base en el tokenizador, pero no está ajustado para seguir instrucciones.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico en esta exportación.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.
- Ejecución nativa sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con verificación de empaquetado exacto de pesos.

## Casos de uso

- Despliegue de Qwen2.5-14B sobre hardware Tenstorrent: el modelo está empaquetado para que TT-NN lo cargue directamente en DRAM de la NPU, con 13,76 GB de pesos, lo que lo hace adecuado para servidores con Wormhole o Blackhole en lugar de GPU.
- Investigación en cuantización block floating point: sirve como referencia reproducible para estudiar el impacto de BFP4 en las proyecciones gate/up frente a BFP8, con métricas de KL y top-1 publicadas contra BF16 y Q4_K_M.
- Benchmarking de hardware Tensix: al incluir scripts de verificación (`pack_tensix.py`, `verify_grid.py`), permite validar la ruta de empaquetado de pesos y medir el rendimiento del runtime TT-NN con un modelo de 14B.
- Generación de texto en pipelines de completion: al ser un modelo preentrenado, encaja en tareas de continuación de texto, rellenado de documentos o generación de borradores donde no se requiere seguimiento de instrucciones.
- Evaluación comparativa de cuantizaciones: útil para contrastar la fidelidad de BFP4/BFP8 frente a esquemas como Q4_K_M de llama.cpp, usando las métricas de KL medio y top-1 publicadas.
- Prototipado en simulador: la model card indica que se validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, lo que permite desarrollar y depurar integraciones sin hardware físico.
- Base para ajuste fino posterior: al mantener los pesos en safetensors y licencia Apache-2.0, puede servir como punto de partida para tareas específicas, aunque la cuantización BFP complica el entrenamiento directo.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B) | 16 | 29,54 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP4 GateUp) | 7,45 | 13,756 | 0,08835 | 91,50 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07985 | 91,31 | 26 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con verificación automática, en formato de completion y con 3 ejemplos (3-shot). El criterio de aceptación del autor exige un KL medio máximo de 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; este modelo cumple con 1,11 veces el KL de Q4_K_M y 0 respuestas perdidas. Estos números miden proximidad al BF16, no calidad en tareas. No se reporta velocidad ni throughput.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 13,76 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y búferes.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. No está pensado para GPU convencional, aunque los pesos en safetensors pueden cargarse con transformers en bf16 (29,5 GB de repositorio).
- No cabe en GPU de consumo en su formato nativo BFP; como referencia, el modelo base en BF16 requiere del orden de 29,5 GB, por encima de una RTX 4090 de 24 GB.
- Despliegue: runtime TT-NN (validado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole). La model card indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Carga alternativa vía transformers con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`, sujeta a memoria suficiente.
- Latencia y throughput: no disponibles; no se reportan en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Hardware objetivo |
|---|---|---:|---:|---:|---|---|
| Este modelo (BFP4 GateUp) | 14,77B | 32.768 (heredado) | 7,45 | 13,756 GB | Apache-2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen2.5-14B (BF16) | 14,77B | 32.768 | 16 | 29,54 GB | Apache-2.0 | GPU/NPU convencional |
| Qwen2.5-14B Q4_K_M (llama.cpp) | 14,77B | 32.768 | 4,87 | 8,988 GB | Apache-2.0 | CPU/GPU vía llama.cpp |

La comparación con otras cuantizaciones específicas para Tensix no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo preentrenado, no ajustado por instrucciones: no debe esperarse que siga instrucciones ni mantenga un rol de asistente, aunque el tokenizador conserve la plantilla de chat.
- La model card declara únicamente inglés; el rendimiento en otros idiomas, pese a la calibración con texto coreano, no está garantizado.
- La cuantización BFP4 en gate/up introduce una degradación medible: KL medio de 0,08835 frente a 0 y top-1 del 91,50 % frente al 100 % del BF16.
- Riesgo de alucinación inherente al modelo base preentrenado; no se documentan evaluaciones de veracidad.
- Sesgos conocidos del modelo base Qwen2.5 no documentados en esta exportación.
- Dependencia fuerte del runtime TT-NN y del hardware Tensix: tt-transformers y tt-forge no se probaron con este checkpoint, lo que limita las rutas de despliegue validadas.
- Licencia Apache-2.0, que permite uso comercial, pero el autor declara el modelo "as is", sin garantía, y sin afiliación ni respaldo de Tenstorrent.
- El repositorio ocupa 29,5 GB, aunque el peso empaquetado en dispositivo sea de 13,756 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia citado (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp/blob/main/LICENSE
