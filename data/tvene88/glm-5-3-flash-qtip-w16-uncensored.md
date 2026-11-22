# Tvene88/GLM-5.3-Flash-QTIP-W16-Uncensored

## Resumen

GLM-5.3-Flash-QTIP-W16-Uncensored es un artefacto de inferencia publicado por Tvene88 que empaqueta una variante sin rechazos ("uncensored") del modelo Mixture-of-Experts GLM-5.3-Flash de Zhipu AI (zai-org) en un formato de compresión propietario denominado APEX-FOLD, basado en el códec de trellis QTIP. El modelo subyacente es un MoE de aproximadamente 320.000 millones de parámetros totales, del que se han eliminado 1.922 de los 12.096 expertos enrutados del tronco (un 15,89 %) y cuyos pesos se codifican a 2,0112 bits por peso mediante un trellis de 65.536 estados con rotación de incoherencia y redondeo consciente de Hessiano (LDLQ/GPTQ). El resultado se sirve desde una única GPU de consumo (RTX 5090, 32 GiB) manteniendo la mayor parte de los expertos en RAM del sistema y transmitiéndolos por PCIe.

La propuesta técnica no es tanto el modelo como el método de ejecución: los expertos enrutados se almacenan como registros de tamaño fijo (6.326.528 bytes cada uno) en orden de popularidad, con las filas más usadas fijadas en memoria del host (unos 60 GiB) para DMA directo, un pool de VRAM de 14-18 GiB gestionado por streaming bajo demanda y desalojo GDSF, y kernels CUDA que decodifican el trellis dentro del producto matriz-vector sin materializar nunca una copia en 16 bits. El router se reentrena por destilación contra el modelo FP8 original tras el podado.

Es relevante ahora porque demuestra que un MoE de 320B puede ejecutarse en hardware de consumo con velocidades de decodificación de 20,90-23,82 tok/s (frente a 12,26-12,94 tok/s de la build GGUF de 2 bits más descargada) y con puntuaciones estadísticamente equivalentes en HumanEval y GSM8K. La contrapartida es que hereda el comportamiento de los pesos "abliterated" de dealignai, lo que elimina las capas de rechazo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, basada en GLM-5.3-Flash; runtime APEX-FOLD con codec trellis QTIP |
| Parametros totales | ~320.000 millones (320B, segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis QTIP HYB a 2,0112 bits por peso (65.536 estados, tiles 16x16); pesos del tronco en FP8 heredados del modelo base; router en 0,1 GB |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `trellis`); archivos de expertos 66,2 GB + tronco 10,29 GB + router 0,1 GB = 76,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia GLM-5.3-Flash, con 12.096 expertos enrutados en el tronco y una capa MTP (multi-token prediction) que, segun la model card, nunca se poda. Sobre ese modelo, el autor aplica un pipeline de compresión en cuatro etapas: (1) rotación aleatoria con semilla por fila de experto (signos Rademacher y transformada de Kronecker-Hadamard) seguida de codificación a 2,0112 bpw con un trellis de 65.536 estados y pares de valores en tiles de 16x16, con la ruta del trellis elegida mediante Hessianos de calibración y descomposición en bloques LDLQ; (2) podado no uniforme por capa con máscara "W16" que elimina 1.922 de los 12.096 expertos del tronco; (3) reparación del router mediante destilación contra el modelo FP8, reentrenando únicamente las matrices de compuerta completas (0,1 GB) en lugar de ajustar los expertos; y (4) un runtime de ejecución en capas de memoria que fija en RAM del host las filas de expertos más usadas para DMA directo y mantiene un pool de VRAM de 14-18 GiB con prefetch y desalojo GDSF.

El entrenamiento original del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO) no se detalla en la información disponible. La innovación técnica destacable es el formato de registro byte-locked de tamaño fijo por experto, que permite fetch, cache y eviction con una única copia contigua, junto con kernels CUDA que decodifican el código trellis dentro del producto matriz-vector leyendo directamente de los slots del pool. El autor documenta que cada cambio de velocidad (port a runtime de producción, kernel v2, cambios de tráfico de copia) se aceptó solo tras reproducir los logits de referencia bit a bit (384 de 384). El proyecto se apoya en QTIP (Tseng et al., 2024) para el trellis y el código HYB, en QuIP# para la rotación de incoherencia, en LDLQ/GPTQ para el redondeo, en la construcción hash de ExLlamaV3 y en GDSF para la política de desalojo.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de GLM-5.3-Flash.
- Generación de código: evaluado en HumanEval con 156 aciertos de 164 en la configuración de referencia (thinking off, greedy).
- Razonamiento matemático: evaluado en GSM8K con 240 aciertos de 250 en la misma configuración.
- Modo de razonamiento configurable: la model card menciona "thinking off" y "reasoning effort low" como parámetros de decodificación, lo que implica soporte de modo thinking y de esfuerzo de razonamiento ajustable.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Variante sin rechazos ("uncensored"/"abliterated"): los pesos derivan de dealignai/GLM-5.3-Flash-UNCENSORED-FP8, con las capas de rechazo eliminadas.
- Inferencia en una sola GPU de consumo mediante streaming de expertos por PCIe.

## Casos de uso

- Estación de trabajo de un solo GPU para investigación en MoE: permite estudiar y hacer experimentos con un modelo de 320B en una RTX 5090, algo inviable con pesos en 16 bits, manteniendo los expertos comprimidos en VRAM y RAM del host.
- Evaluación de técnicas de compresión extrema: el artefacto sirve como referencia reproducible para comparar trellis QTIP frente a GGUF de 2 bits en tareas de código y matemáticas, con las mismas condiciones de decodificación (greedy, thinking off, 1.024 tokens nuevos).
- Generación de código asistida en local: con 156/164 en HumanEval y tool calling no documentado, es adecuado para autocompletado y generación de funciones en un entorno de desarrollo sin dependencia de la nube, a 20,90 tok/s de decodificación.
- Razonamiento matemático por lotes pequeños: con 240/250 en GSM8K, puede emplearse en pipelines de resolución de problemas aritméticos donde el throughput no sea crítico (una petición simultánea en la configuración medida).
- Investigación sobre alineación y seguridad: al ser una variante sin rechazos, permite estudiar el comportamiento de un MoE de gran tamaño sin capas de rechazo, con las advertencias éticas y legales correspondientes.
- Despliegue en hardware con presupuesto de VRAM limitado: el formato de registro fijo y el pool con desalojo GDSF facilitan servir el modelo en configuraciones de 14-18 GiB de VRAM más RAM del sistema, útil para prototipos en estaciones con una sola tarjeta.
- Benchmarking de infraestructura PCIe: la arquitectura de streaming permite medir el impacto del ancho de banda host-GPU en la decodificación de MoE, con cifras de referencia publicadas (20,90/23,82 tok/s frente a 12,26/12,94 tok/s).

## Benchmarks y rendimiento

| Benchmark | Este modelo | unsloth/GLM-5.3-Flash-GGUF (UD-IQ2_XXS) | Diferencia |
|---|---|---|---|
| HumanEval (aciertos) | 156 de 164 | 158 de 164 | -2 (McNemar p = 0,69) |
| GSM8K muestra (aciertos) | 240 de 250 | 239 de 250 | +1 (p = 1,0) |
| Decodificación HumanEval (tok/s) | 20,90 | 12,26 | 1,7x |
| Decodificación GSM8K (tok/s) | 23,82 | 12,94 | 1,8x |
| Incluyendo prompt, HumanEval (tok/s) | 15,72 | 7,84 | 2,0x |
| Incluyendo prompt, GSM8K (tok/s) | 11,23 | 5,92 | 1,9x |
| Tamaño de archivos de expertos | 66,2 GB | 101,8 GB | 65 % |
| Tamaño total servido | 76,6 GB | no disponible | 75 % del comparado |

Condiciones declaradas: decodificación greedy, thinking off, reasoning effort low, máximo 1.024 tokens nuevos, una petición simultánea. Con un pool de servicio mayor (17 GiB más tres flags de tráfico de copia, sin router) la decodificación alcanzó 23,19/25,74 tok/s, pero solo sobre los primeros 40 elementos de cada tarea (40 + 40), no sobre el conjunto completo. No se han publicado resultados de MMLU ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: pool de expertos de 14-18 GiB más el tronco (10,29 GB) y el router (0,1 GB); la configuración medida usó 14 GiB de pool y la de mayor rendimiento 17 GiB.
- RAM del host: unos 60 GiB de filas de expertos fijadas (page-locked) para DMA directo, además del resto de expertos en memoria del sistema.
- GPU recomendadas: RTX 5090 (32 GiB), que es la tarjeta usada en las mediciones; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 5090; en tarjetas con menos VRAM el pool de 14 GiB sería el límite práctico, no documentado.
- Opciones de despliegue: runtime propio del proyecto basado en la librería `trellis` con kernels CUDA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20,90/23,82 tok/s de decodificación y 15,72/11,23 tok/s incluyendo prompt (HumanEval/GSM8K) en la configuración de referencia; hasta 23,19/25,74 tok/s con pool de 17 GiB en la medición parcial de 40 elementos.
- Almacenamiento: 76,6 GB para el conjunto servido completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tvene88/GLM-5.3-Flash-QTIP-W16-Uncensored | ~320B (MoE) | no disponible | Trellis QTIP 2,0112 bpw | MIT | Hugging Face, 565 descargas |
| unsloth/GLM-5.3-Flash-GGUF (UD-IQ2_XXS) | ~320B (MoE) | no disponible | GGUF IQ2_XXS, 101,8 GB | no disponible | Hugging Face |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | ~320B (MoE) | no disponible | FP8 | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash | ~320B (MoE) | no disponible | pesos originales | MIT | Hugging Face |

La comparación directa disponible es con la build GGUF de 2 bits de unsloth: este artefacto ocupa un 65 % del tamaño en expertos, decodifica entre 1,7 y 1,8 veces más rápido y obtiene puntuaciones equivalentes en HumanEval y GSM8K. Frente a las variantes FP8 y original, la diferencia principal es el tamaño y el requisito de memoria, no documentados en detalle para esas builds en la información disponible.

## Limitaciones y advertencias

- El modelo hereda el comportamiento de los pesos "abliterated" de dealignai: las capas de rechazo están eliminadas, por lo que puede producir contenido que el modelo original rechazaría. No es apto para despliegues públicos sin filtros adicionales.
- El podado elimina 1.922 de 12.096 expertos (15,89 %), lo que puede degradar capacidades en dominios poco representados en la calibración; solo se validaron HumanEval y GSM8K.
- La licencia MIT se aplica al artefacto, pero el uso comercial debe verificar también las condiciones de los modelos base (zai-org y dealignai), ambos declarados MIT en la model card.
- Riesgo de alucinación: no cuantificado en la información disponible; los benchmarks publicados son de código y matemáticas, no de factualidad.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en contextos largos ni en castellano.
- El runtime es específico del proyecto (librería `trellis`), sin soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita la integración en infraestructura existente.
- Las mediciones de velocidad se hicieron con una sola petición simultánea; el throughput agregado en producción no está documentado.
- La cifra de 23,19/25,74 tok/s procede de solo 40 elementos por tarea, no del conjunto completo, y no es directamente comparable con las cifras principales.
- Requiere unos 60 GiB de RAM del host con paginación fijada, además de la VRAM, lo que exige una estación de trabajo con memoria suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tvene88/GLM-5.3-Flash-QTIP-W16-Uncensored
- Modelo base sin rechazos: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build GGUF de comparación: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Repositorio del proyecto (documentación en `docs/WORK_RECORD.md` y whitepaper): no disponible como URL en la información proporcionada.
