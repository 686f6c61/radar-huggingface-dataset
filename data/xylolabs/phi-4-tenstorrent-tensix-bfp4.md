# Xylolabs/phi-4-Tenstorrent-Tensix-BFP4

## Resumen

phi-4-Tenstorrent-Tensix-BFP4 es una versión cuantizada del modelo microsoft/phi-4, desarrollada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es un checkpoint de pesos reempaquetados y cuantizados para aprovechar los formatos de coma flotante por bloques (block floating point) que el hardware Tensix implementa de forma nativa. El modelo base phi-4 es un transformer denso de 14.659.507.200 parámetros desarrollado por Microsoft, con licencia MIT.

La relevancia de esta ficha radica en que demuestra una ruta de despliegue de un modelo de 14B en hardware no-GPU con un coste de almacenamiento notablemente reducido: 11,559 GB empaquetados frente a 29,32 GB en bf16. La cuantización se aplica de forma selectiva: las proyecciones de atención (q, k, v, o) y las proyecciones gate y up de la MLP se cuantizan a `bfloat4_b` (BFP4), mientras que las proyecciones down de la MLP se mantienen en `bfloat8_b` (BFP8); el LM head, los embeddings y las normas permanecen en bf16.

El checkpoint se distribuye en el layout de Llama (`LlamaForCausalLM`), con las matrices fusionadas q, k, v y gate-up de Phi-4 separadas, y está pensado para cargarse tanto con `transformers` como con el stack ttnn/tt-metal de Tenstorrent. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de microsoft/phi-4), reempaquetado en layout Llama (`LlamaForCausalLM`) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en atención q/k/v/o y MLP gate/up; BFP8 (`bfloat8_b`) en MLP down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado para Tensix; 11,559 GB empaquetado frente a 29,32 GB en bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de phi-4, sin cambios estructurales más allá de la separación de las matrices fusionadas (q, k, v y gate-up) para encajar en el layout de `LlamaForCausalLM`. No se ha realizado ningún entrenamiento adicional ni ajuste fino: el proceso aplicado es exclusivamente de cuantización post-entrenamiento. Las proyecciones cuantizadas a BFP4 se obtuvieron mediante GPTQ con búsqueda de exponente por bloque; las proyecciones down de la MLP se cuantizaron a BFP8 mediante redondeo al más cercano (round to nearest).

La innovación técnica principal no está en el modelo sino en el formato: el uso de block floating point nativo del hardware Tensix, que permite almacenar y ejecutar matrices en BFP4/BFP8 sin necesidad de desempaquetar a bf16 en memoria. El repositorio incluye las herramientas `pack_tensix.py` y `verify_grid.py` (bajo Apache-2.0) para validar que cada matriz empaquetada se reconstruye exactamente en el dispositivo; la verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent. No se dispone de información sobre la composición del dataset de entrenamiento original de phi-4 en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`) soportada por el tokenizador.
- Razonamiento y matemáticas heredados del modelo base phi-4 (no se documentan evaluaciones específicas en esta ficha).
- Generación de código, en la medida en que lo soporte el modelo base phi-4.
- Ejecución en hardware Tensix (Wormhole, Blackhole) mediante ttnn, con empaquetado directo de matrices a `bfloat4_b` y `bfloat8_b`.
- Carga estándar con `transformers` (`AutoModelForCausalLM`) en modo bf16 con `device_map="auto"`.
- Compatibilidad con text-generation-inference y endpoints (según los tags del repositorio).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso de uso central. El checkpoint está empaquetado para ejecutarse en NPUs Wormhole y Blackhole mediante ttnn, lo que permite servir un modelo de 14B en hardware no-GPU con 11,559 GB de pesos.
- Inferencia en entornos con restricciones de memoria: la reducción de 29,32 GB a 11,559 GB permite alojar el modelo en dispositivos con DRAM limitada, a costa de una degradación medida de 0,02224 de KL medio respecto a bf16.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP4/BFP8 round-trippea correctamente, útil para equipos que desarrollan sus propias rutas de cuantización sobre Tensix.
- Investigación en formatos block floating point: sirve como referencia reproducible para comparar BFP4/BFP8 frente a Q4_K_M en términos de KL y top-1 sobre el mismo checkpoint base.
- Generación de texto en inglés con plantilla de chat: el quickstart del repositorio muestra el uso conversacional estándar con `transformers`, adecuado para prototipos y evaluación.
- Benchmarking de hardware: al publicar métricas de KL y top-1 frente a bf16 y Q4_K_M, el modelo es útil como carga de trabajo de referencia para medir latencia y throughput de NPUs Tensix (no se publican cifras de latencia ni throughput en la información disponible).

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (microsoft/phi-4) | 29,32 | 0 | 100 |
| **este modelo (BFP4/BFP8)** | 11,559 | 0,02224 | 92,90 |
| Q4_K_M (llama.cpp) | 9,059 | 0,0180 | 93,65 |

Las métricas de KL y top-1 se calculan sobre 16.280 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. El Q4_K_M de comparación se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El modelo cuantizado presenta un KL 1,24 veces superior al de Q4_K_M (0,0222 frente a 0,0180) y un top-1 ligeramente inferior (92,90 % frente a 93,65 %), con un tamaño mayor (11,559 GB frente a 9,059 GB).

## Requisitos de hardware

- VRAM/DRAM: 11,559 GB de pesos empaquetados para Tensix; 29,32 GB en bf16 si se carga con `transformers` en precisión completa. No se documenta el pico de memoria durante la inferencia.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole, Blackhole). Verificado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole).
- GPU consumer: no se documenta compatibilidad ni rendimiento en GPU consumer; el checkpoint está pensado para Tensix y para carga estándar con `transformers`.
- Opciones de despliegue: ttnn/tt-metal (kernels y runner en tensix-kernels v0.1.0 y tensix-runner v0.1.0), `transformers` con `device_map="auto"`, y text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| **phi-4-Tenstorrent-Tensix-BFP4** | 14,66 B | no disponible | 11,559 GB (empaquetado) | MIT | Tensix (Wormhole, Blackhole) |
| microsoft/phi-4 (bf16) | 14,66 B | no disponible | 29,32 GB | MIT | GPU/CPU genéricos |
| phi-4 Q4_K_M (llama.cpp) | 14,66 B | no disponible | 9,059 GB | MIT | CPU/GPU con llama.cpp |

La comparación relevante es frente al modelo base en bf16 y frente a la cuantización Q4_K_M de llama.cpp, ambos sobre el mismo checkpoint. Este modelo ocupa un punto intermedio en tamaño (11,559 GB) y precisión (KL 0,0222, top-1 92,90 %), y se distingue por estar empaquetado para un backend de hardware específico (Tensix) en lugar de para GPU genérica. No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no se garantiza un comportamiento correcto en otros idiomas.
- La cuantización introduce degradación medible: KL medio de 0,02224 y top-1 del 92,90 % frente a bf16, ligeramente peor que Q4_K_M en ambas métricas.
- El checkpoint está empaquetado para Tensix; su uso fuera de ese hardware requiere cargarlo con `transformers` en bf16, perdiendo la ventaja de tamaño.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni evaluaciones de seguridad en la información proporcionada; deben asumirse los del modelo base phi-4.
- La licencia es MIT, lo que permite uso comercial, pero se recomienda revisar `NOTICE` para los cambios introducidos por Xylolabs.
- El modelo se verificó con ttnn 0.81.1 sobre el simulador ttsim, no necesariamente en silicio real; la validación en hardware físico no se documenta.
- No se dispone de información sobre la longitud de contexto efectiva tras el reempaquetado ni sobre el rendimiento en tareas de razonamiento de múltiples pasos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de código incluido: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
