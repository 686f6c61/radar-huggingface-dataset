# wasnaga/UniverseNet-Qwen3.8-Flash-Next-NVFP4-Desktop16GB

## Resumen

UniverseNet-Qwen3.8-Flash-Next-NVFP4-Desktop16GB es una derivación del modelo multimodal `nvidia/Qwen3.8-Flash-Next-NVFP4`, publicado por el usuario wasnaga bajo la NVIDIA Open Model License. Se trata de un experimento de condensación estructural: cada experto enrutado del MoE original se reduce de 640 a 64 "orbitales" (el ancho intermedio de la feed-forward de cada experto), es decir, al 10% de su capacidad, sin ningún paso de gradiente ni reentrenamiento. El resto del modelo (router, atención, Gated DeltaNet, hiperconexiones, expertos compartidos, embeddings y torre de visión) se mantiene como copia bit-exacta del modelo profesor.

El objetivo declarado es encajar los pesos en una GPU Blackwell de 16 GB, como una RTX 5080 o una GX10/DGX Spark, manteniendo el tool calling y el seguimiento de instrucciones a nivel del profesor. El precio que se paga es muy alto en razonamiento aritmético y código: según la propia model card, las suites de matemáticas y HumanEval colapsan casi por completo en esta edición. El modelo conserva 71.535.280.019 parámetros totales en safetensors y un repositorio de 71,7 GB, aunque los pesos en memoria de GPU declarados son 13,64 GiB gracias a la cuantización NVFP4.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de poda estructural de expertos MoE sin reentrenamiento aplicada a un modelo de última generación; por otro, sirve como advertencia práctica sobre qué capacidades sobreviven y cuáles se degradan cuando se comprime un MoE de forma agresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención Gated DeltaNet, MoE con expertos compartidos, hiperconexiones y torre de visión (hereda la del modelo base) |
| Parámetros totales | 71.535.280.019 |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuración de referencia en vLLM) |
| Tipos de cuantización | NVFP4 (pesos en FP4 con escalas, formato ModelOpt); KV cache en fp8_e4m3 y caché SSM/Mamba en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (con términos Trustworthy AI de NVIDIA) |
| Formato de pesos | safetensors (quantization modelopt) |
| Expertos enrutados (ancho) | 64 orbitales por experto (frente a 640 del profesor) |
| Capas | 48 |
| Memoria de pesos en GPU | 13,64 GiB (medido en GX10) |
| Hardware objetivo | GPU Blackwell de 16 GB (RTX 5080, GX10 / DGX Spark) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo multimodal de Qwen con codificador de visión y atención híbrida que combina atención estándar con Gated DeltaNet, más un MoE con expertos compartidos e hiperconexiones. NVIDIA publicó la versión NVFP4 cuantizada en formato ModelOpt, pensada para GPUs Blackwell. Esta edición de wasnaga no entrena nada: aplica un pase de condensación que reduce el ancho intermedio de cada experto enrutado de 640 a 64, manteniendo intactos router, atención, Gated DeltaNet, hiperconexiones, expertos compartidos, embeddings y torre de visión.

El proceso de condensación se ejecuta sobre 58.808 tokens de calibración y tarda aproximadamente 41,22 minutos en una única NVIDIA GX10, sin pasos de gradiente. La model card indica que la forense de pesos muestra que las columnas de lectura condensadas rotan unos 50° respecto a las del profesor, lo que explica la degradación observada en tareas de cálculo multi-paso. No se documenta RLHF, DPO ni ajuste posterior en esta derivación; las capacidades de instrucción y tool calling provienen íntegramente del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado de la torre de visión del modelo base.
- Tool calling y function calling: la model card reporta 12/12 en la suite de herramientas, al nivel del profesor.
- Seguimiento de instrucciones: 9/10 en IFEval, prácticamente al nivel del profesor (10/10).
- Razonamiento de conocimiento general: 5/10 en ARC-C, degradado respecto al profesor (10/10).
- Razonamiento aritmético multi-paso: colapsado (0/10 en GSM8K, 0/10 en MATH en la suite de la model card).
- Generación de código: colapsada (1/10 en HumanEval).
- Soporte de modo pensamiento (reasoning parser `qwen3` en vLLM), aunque las evaluaciones publicadas se hicieron con thinking desactivado.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes basados en herramientas: el modelo mantiene el 12/12 en tool calling del profesor, por lo que es adecuado para orquestar APIs, consultas a bases de datos y flujos de automatización donde el razonamiento pesado lo aporta el esquema de herramientas y no el cálculo interno.
- Extracción estructurada de información: con 9/10 en IFEval y contexto de 32k tokens, puede procesar documentos largos y devolver JSON con campos definidos, siempre que la tarea no requiera aritmética.
- Asistente conversacional de atención al cliente: conversaciones multi-turno con contexto largo y bajo coste de despliegue en una GPU de 16 GB.
- Enrutamiento y clasificación de tickets: tareas de etiquetado, categorización y resumen que no dependen de precisión numérica.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede describir capturas, formularios escaneados o gráficos simples y extraer texto.
- Prototipado en hardware de consumo: permite probar pipelines de agentes con vLLM en una RTX 5080 o GX10 antes de escalar a la edición Workstation o al profesor.
- Filtrado y preprocesado en pipelines RAG: reescritura de consultas, generación de metadatos y selección de fragmentos relevantes.
- No recomendado para generación de código en producción ni para cálculo financiero o científico, según los propios resultados del autor.

## Benchmarks y rendimiento

Resultados de la model card sobre 62 prompts verificados manualmente (10 por suite, 12 llamadas a herramientas), vLLM en una GX10, MTP desactivado y decodificación greedy:

| Suite | Profesor (640) | Workstation (384) | Prosumer (128) | Desktop 16 GB (64) |
|---|---|---|---|---|
| Overall (62 prompts) | 98,39% | 96,77% | 50% | 43,55% |
| Tools | 12/12 | 12/12 | 11/12 | 12/12 |
| IFEval | 10/10 | 10/10 | 9/10 | 9/10 |
| ARC-C | 10/10 | 10/10 | 5/10 | 5/10 |
| HumanEval | 9/10 | 9/10 | 4/10 | 1/10 |
| GSM8K | 10/10 | 10/10 | 1/10 | 0/10 |
| MATH | 10/10 | 9/10 | 1/10 | 0/10 |

Rendimiento medido en GX10 (un solo stream / 6 usuarios en paralelo): Workstation 30 / 112,2 tok/s; Prosumer 33,1 / 141,6 tok/s; Desktop 33,4 / 142,8 tok/s.

## Requisitos de hardware

- VRAM para pesos: 13,64 GiB en NVFP4, medido en GX10. La caché KV y el overhead de runtime van aparte.
- GPU objetivo: Blackwell de 16 GB, como RTX 5080, GX10 o DGX Spark. NVFP4 requiere una GPU de clase Blackwell.
- No cabe en GPUs sin soporte NVFP4 (Ampere, Ada, Hopper) sin reconvertir los pesos.
- Despliegue: vLLM con soporte `qwen4_exp` y `--quantization modelopt`, `--kv-cache-dtype fp8_e4m3`, `--mamba-ssm-cache-dtype bfloat16`, `--max-model-len 32768`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--reasoning-parser qwen3`.
- En tarjetas de 16 GB conviene reducir `--max-model-len` y `--gpu-memory-utilization` para dejar espacio a la caché KV.
- Throughput medido: 33,4 tok/s en un solo stream y 142,8 tok/s con 6 usuarios en paralelo en GX10.
- Solo probado en GX10 (GB10); las GPU Blackwell de consumo no están verificadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (62 prompts) | Pesos en GPU | Licencia |
|---|---|---|---|---|---|
| UniverseNet Desktop 16 GB (64) | 71,5B totales | 32k | 43,55% | 13,64 GiB | NVIDIA Open Model License |
| UniverseNet Prosumer (128) | no disponible | 32k | 50% | 19,97 GiB | NVIDIA Open Model License |
| UniverseNet Workstation (384) | no disponible | 32k | 96,77% | 45,28 GiB | NVIDIA Open Model License |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (profesor) | no disponible | no disponible | 98,39% | 64,07 GiB | NVIDIA Open Model License |

La comparación relevante es interna a la familia de condensaciones del mismo autor: la edición Desktop es la única que cabe en 16 GB, pero pierde más de la mitad del rendimiento global frente al profesor y prácticamente toda la capacidad de matemáticas y código. La Workstation (384) es la única que mantiene el nivel del profesor, a costa de 45,28 GiB.

## Limitaciones y advertencias

- Colapso de aritmética y código: 0/10 en GSM8K y MATH, 1/10 en HumanEval. El modelo elige el método correcto pero comete errores de suma de un solo paso (por ejemplo, 32+16=34) y entra en bucles de re-verificación.
- Muestra estadística pequeña: 10-12 prompts por suite; un 9/10 tiene un intervalo de confianza del 95% de aproximadamente 55-100%. Las particiones públicas completas están en progreso.
- Contaminación parcial: los prompts de herramientas comparten plantilla de sistema y esquema con parte del conjunto de calibración, aunque con hechos e IDs distintos.
- "16 GB" se refiere solo a pesos residentes en GPU; la caché KV y el overhead de runtime se suman por encima.
- Solo probado en GX10 (GB10); las GPU Blackwell de consumo no están verificadas.
- Requiere una build de vLLM con soporte `qwen4_exp` (Qwen3.8), lo que limita la portabilidad a stacks estándar.
- Licencia NVIDIA Open Model License con términos Trustworthy AI: revisar `LICENSE.md` y `NOTICE` antes de uso comercial.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación no cuantificado en la model card; la degradación estructural de los expertos sugiere precaución en dominios factuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasnaga/UniverseNet-Qwen3.8-Flash-Next-NVFP4-Desktop16GB
- Modelo base cuantizado: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
