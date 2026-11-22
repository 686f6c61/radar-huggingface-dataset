# Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix-BFP8

## Resumen
Este repositorio contiene una cuantización del modelo base IBM Granite 3.0 8B (8.372.162.560 parámetros) realizada por Xylolabs para su ejecución sobre NPUs Tenstorrent Tensix (Wormhole y Blackhole). No es un modelo nuevo: es el checkpoint `ibm-granite/granite-3.0-8b-base` con las proyecciones de atención y MLP convertidas a formato block-floating-point `bfloat8_b` (BFP8) mediante GPTQ, mientras que el LM head, los embeddings y las normas se mantienen en float32 o bf16 según el checkpoint original. El resultado es un artefacto de 8,871 GB empaquetado para Tensix frente a los 16,34 GB en bf16.

La relevancia es doble. Por un lado, demuestra que es posible comprimir a 8 bits por bloque un transformer de 8B manteniendo una fidelidad muy alta respecto al original: la divergencia KL media frente a bf16 es de 0,00090, unas 0,02 veces la de una cuantización Q4_K_M de llama.cpp (0,04580). Por otro, está orientado a un backend de hardware específico (tt-metal/ttnn), lo que lo convierte en una pieza útil para quien despliegue inferencia en aceleradores Tenstorrent y no en GPU convencionales.

El modelo hereda las capacidades del Granite 3.0 8B base: es un modelo de continuación de texto, sin plantilla de chat ni ajuste por instrucciones, entrenado principalmente en inglés. La licencia es Apache 2.0 y el autor declara no estar afiliado ni respaldado por Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite 3.0, 40 capas), cuantizado en proyecciones de atención y MLP |
| Parametros totales | 8.372.162.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en q, k, v, o y gate, up, down; LM head, embeddings y normas en float32/bf16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16; TT-NN los empaqueta sin alterarlos) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del Granite 3.0 8B base de IBM: un transformer decoder-only denso de 40 capas con proyecciones de atención (q, k, v, o) y de MLP (gate, up, down). Xylolabs aplica GPTQ sobre esas 40 capas y almacena los pesos resultantes en formato block-floating-point `bfloat8_b`, el formato nativo que TT-NN espera en las NPUs Tensix. El LM head (ligado al embedding cuando el modelo base los liga), el embedding de entrada y las normas por capa conservan los valores float32 del checkpoint original; la norma final y el LM head quedan en bf16. El fichero `quant4.json` documenta el formato de cada proyección.

No se ha reentrenado nada: la cuantización se valida contra una pasada bf16 propia del checkpoint base sobre 8.184 posiciones de texto en inglés y coreano, midiendo KL y top-1. El autor reporta que el proceso pasa su comprobación de precisión (KL 0,02 veces la de Q4_K_M, frente a un límite de 1,5 veces). Los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar que el empaquetado en TT-NN no altera ningún valor, incluyendo un round-trip por DRAM del dispositivo con `--device`. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto por continuación: es un modelo base sin plantilla de chat, pensado para completar secuencias, no para seguir instrucciones.
- Razonamiento y conocimiento general heredados del Granite 3.0 8B base.
- Generación de código y matemáticas a nivel de modelo base (sin ajuste específico documentado en esta ficha).
- Capacidades multilingües limitadas: la model card declara únicamente inglés, aunque la evaluación de cuantización incluyó texto en coreano.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso.
- Sin modo thinking, visión ni audio.
- Ejecución nativa en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn, además de carga estándar con transformers.

## Casos de uso
- Despliegue de inferencia en aceleradores Tenstorrent: el checkpoint está empaquetado en `bfloat8_b`, el formato que TT-NN consume directamente, de modo que se evita la conversión en tiempo de carga y se aprovecha la ruta de kernels de Tensix.
- Servicio de continuación de texto a gran escala en inglés: al ser un modelo base de 8B con licencia Apache 2.0, encaja en pipelines de generación (autocompletado, redacción asistida, resumen extractivo) donde no se requiere seguimiento de instrucciones.
- Fine-tuning posterior sobre el checkpoint cuantizado: al conservar embeddings y normas en float32, sirve como punto de partida para adaptaciones de dominio antes de volver a empaquetar para Tensix.
- Evaluación comparativa de cuantizaciones: sus métricas KL y top-1 frente a bf16 y Q4_K_M lo hacen útil como referencia para estudiar el impacto de BFP8 en modelos de 8B.
- Investigación en formatos block-floating-point: el repo incluye `quant4.json` y herramientas de verificación que permiten reproducir y auditar el proceso de cuantización matriz a matriz.
- Prototipado de bajo coste en hardware no-GPU: para equipos con NPUs Tenstorrent, este checkpoint reduce la huella de 16,34 GB a 8,871 GB, lo que facilita caber en memorias de dispositivo más ajustadas.
- Generación de datos sintéticos en inglés: la fidelidad alta respecto a bf16 (top-1 del 98,55 %) permite usarlo como generador aproximado cuando el modelo completo no cabe o no rinde bien en el hardware disponible.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 28 |
|---|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.0-8b-base) | 16,34 | 0 | 100 | 19 |
| Este modelo (BFP8) | 8,871 | 0,00090 | 98,55 | 19 |
| Q4_K_M (llama.cpp) | 4,943 | 0,04580 | 90,37 | 21 |

Las métricas de KL y top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano, comparadas contra una pasada bf16 propia del checkpoint base. Las 28 respuestas corresponden a prompts de formato de completación en modo three-shot y greedy. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa 17,1 GB en el repositorio (valores cuantizados almacenados como bf16) y 8,871 GB una vez empaquetado para Tensix; en GPU convencional con transformers se carga en bf16 y requiere del orden de 16-17 GB más overhead de activaciones y caché KV.
- GPU recomendadas: no hay datos específicos para este checkpoint en GPU; por tamaño, encaja en A100 40 GB, H100 80 GB y RTX 4090 24 GB en bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB requeriría cuantización adicional no incluida en este repo.
- Opciones de despliegue: transformers (carga directa con `dtype="bfloat16"` y `device_map="auto"`), tt-metal/ttnn para NPUs Tensix (Wormhole, Blackhole) con `pack_tensix.py` y `verify_grid.py`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Granite 3.0 8B BFP8) | 8,37B | no disponible | BFP8 (`bfloat8_b`) | Apache 2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-3.0-8b-base | 8,37B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Granite 3.0 8B Q4_K_M (llama.cpp) | 8,37B | no disponible | Q4_K_M | Apache 2.0 | Generado con llama.cpp v0.9.0 |

La comparación directa con Q4_K_M es la más informativa: BFP8 ocupa 8,871 GB frente a 4,943 GB, pero reduce la KL media a 0,00090 frente a 0,04580 y eleva el top-1 al 98,55 % frente al 90,37 %. En las 28 respuestas de completación, Q4_K_M acierta 21 y tanto bf16 como BFP8 aciertan 19, un resultado que conviene interpretar con cautela por el tamaño reducido de la muestra.

## Limitaciones y advertencias
- Es un modelo base sin plantilla de chat: no sigue instrucciones ni mantiene diálogos multi-turno de forma fiable sin ajuste adicional.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Riesgo de alucinación inherente a un modelo base de 8B, no mitigado por RLHF ni por filtros de seguridad documentados.
- Sesgos heredados del corpus de entrenamiento del Granite 3.0 8B base, no auditados en esta ficha.
- La cuantización BFP8 está pensada para Tensix; en GPU convencional se carga como bf16 y se pierde la ventaja de tamaño, además de no aprovechar los kernels específicos.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni se han ejecutado tt-transformers ni tt-forge con este checkpoint.
- El repositorio no incluye fichero LICENSE del modelo base; el autor añade el texto estándar Apache 2.0 y un NOTICE con los cambios.
- El autor declara no estar afiliado ni respaldado por Tenstorrent.
- Las métricas de calidad se basan en 8.184 posiciones y 28 prompts, una muestra limitada que no cubre dominios especializados.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-base
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia en el repositorio: https://huggingface.co/Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
