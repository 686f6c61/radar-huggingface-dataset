# Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts

## Resumen

`Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts` es una cuantización del modelo `openai/gpt-oss-20b` de OpenAI, desarrollada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura y los pesos del original pero redondea sus capas lineales a formatos de bloque de coma flotante nativos de TT-NN: `bfloat4_b` (BFP4) para los expertos enrutados y `bfloat8_b` (BFP8) para la atención y la cabeza LM. El resultado ocupa 13,22 GB empaquetado con una media de 5,06 bits por peso, frente a los 41,83 GB del BF16 original.

La motivación es práctica: TT-NN empaqueta tensores BFP sin recuantizar, de modo que los pesos ya "viven" en la rejilla que la NPU espera. Esto evita pérdida adicional en el momento de carga y reduce el espacio en DRAM del acelerador. El checkpoint se distribuye en safetensors en bf16, pero cada valor ya está alineado a la rejilla BFP4 o BFP8.

Es relevante para quienes despliegan gpt-oss-20b sobre hardware Tenstorrent y necesitan una versión compatible con el pipeline de TT-NN sin pasar por una cuantización en tiempo de ejecución. No obstante, el autor advierte que las pruebas se han hecho sobre `ttsim` (simulador de Blackhole con ttnn 0.81.1), no sobre silicio real, y que el demo oficial de tt-metal para gpt-oss no es directamente compatible con la rejilla de expertos de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en expertos enrutados; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o, LM head; bf16 en router, embeddings, normas y resto; media 5,06 bits/peso |
| Idiomas soportados | no disponible (calibración en inglés y coreano; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, valores alineados a rejilla BFP4/BFP8) |
| Tamano empaquetado | 13,22 GB (media 5,06 bits/peso) |
| Tamano del repo | 41,9 GB |
| Hardware objetivo | NPU Tenstorrent Tensix (Wormhole, Blackhole) vía TT-NN / tt-metal / tt-forge |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `openai/gpt-oss-20b` original: un transformer con mezcla de expertos (MoE) en el que las capas de expertos enrutados se distribuyen entre 24 capas. La intervención de Xylolabs no reentrena el modelo, sino que cuantiza sus pesos: los expertos enrutados (gate, up, down) se redondean a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque y bloques de 16 a lo largo de las entradas (eje K); la atención (q, k, v, o) y la cabeza LM se redondean a `bfloat8_b` por redondeo al más cercano. El router, los embeddings y las normas permanecen en bf16.

El proceso de GPTQ se calibró sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, aplicando GPTQ únicamente a los expertos enrutados, cada uno con su propia matriz de Hessian. Los expertos con pocos tokens de calibración se redondearon al más cercano. La innovación técnica clave es que los valores ya están en la rejilla BFP, de modo que el empaquetado en TT-NN es exacto (verificable con `pack_tensix.py` y `verify_grid.py`), sin recuantización adicional en carga.

## Capacidades

- Generación de texto conversacional y de propósito general, heredadas del `gpt-oss-20b` base.
- Razonamiento multi-paso y modo "thinking" (el autor evalúa 7 prompts de razonamiento con thinking activado).
- Generación de código y matemáticas (capacidades del modelo base; no se detallan métricas específicas en la información disponible).
- Soporte de tool calling y function calling (heredado del modelo base; no verificado explícitamente en esta cuantización).
- Capacidades multilingües (el modelo base es multilingüe; la calibración incluyó inglés y coreano).
- Despliegue en NPU Tenstorrent Tensix mediante TT-NN, tt-metal y tt-forge.
- Empaquetado exacto en `bfloat4_b` y `bfloat8_b` sin recuantización en carga.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse directamente en TT-NN, que empaqueta los tensores BFP sin redondeo adicional; es el escenario principal y el que justifica la existencia del modelo.
- Inferencia de gpt-oss-20b con huella de DRAM reducida: 13,22 GB empaquetados frente a 41,83 GB en BF16 permiten encajar el modelo en configuraciones de memoria más ajustadas del acelerador.
- Prototipado y validación en `ttsim`: el autor probó el modelo en el simulador de Blackhole con ttnn 0.81.1, útil para pipelines de CI que verifiquen empaquetado y corrección antes de pasar a hardware.
- Evaluación de calidad de cuantización BFP4/BFP8: sirve como referencia para medir la degradación (KL media de 0,0636 frente a BF16) en tareas de texto en inglés y coreano.
- Generación de texto conversacional en entornos con restricciones de memoria: mantiene el 81,90 % de top-1 frente a BF16 y responde correctamente 39 de 40 preguntas de la evaluación del autor.
- Investigación en cuantización de bloques para aceleradores: el repo incluye `quant4.json` con el formato de cada proyección, útil para estudiar el impacto por capa del redondeo BFP4 en expertos MoE.
- Sustitución de cuantizaciones en tiempo de ejecución: al estar los pesos prealineados a la rejilla, se elimina el coste y la pérdida de una cuantización dinámica en el arranque.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor (8.188 posiciones de texto en inglés y coreano; 40 respuestas cortas con comprobación automática):

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`openai/gpt-oss-20b`) | 16 | 41,83 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,06 | 13,218 | 0,0636 | 81,90 | 39 de 40 | 0 |
| MXFP4 (llama.cpp) | 4,63 | 12,110 | 0,0678 | 82,65 | 39 de 40 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 13,22 GB empaquetados en BFP4/BFP8; el repo en safetensors ocupa 41,9 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole). El autor probó con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre silicio real.
- El demo oficial de gpt-oss en tt-metal (v0.81.1) requiere cuatro chips Blackhole (QuietBox 2) o Wormhole LoudBox y Galaxy; no funciona en un solo chip.
- Incompatibilidad conocida: el demo de tt-metal empaqueta los expertos en bfloat4_b con bloques a lo largo de las salidas, mientras que este checkpoint usa bloques a lo largo de las entradas (K); el demo re-redondea entre el 7 % y el 54 % de los valores de expertos (medido en la capa 0).
- tt-forge (tt-xla): no probado con este checkpoint.
- Despliegue en GPU convencional: no es el objetivo; el modelo se puede cargar con `transformers` en bf16 (`device_map="auto"`), pero no aporta ventaja frente al base en ese entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano (GB) | Contexto | Licencia | Hardware |
|---|---|---:|---:|---|---|---|
| Este modelo | 20,9 B | 5,06 | 13,22 | no disponible | Apache-2.0 | Tensix (Wormhole/Blackhole) |
| `openai/gpt-oss-20b` (BF16) | 20,9 B | 16 | 41,83 | no disponible | Apache-2.0 | GPU/CPU genéricas |
| gpt-oss-20b MXFP4 (llama.cpp) | 20,9 B | 4,63 | 12,11 | no disponible | Apache-2.0 | CPU/GPU (llama.cpp) |

La comparativa se limita al mismo modelo base en distintas precisiones, ya que no se dispone de información sobre alternativas de otros autores en el mismo formato BFP para Tensix.

## Limitaciones y advertencias

- No probado en hardware real: la validación se hizo sobre el simulador `ttsim` con ttnn 0.81.1.
- Incompatibilidad con el demo de gpt-oss de tt-metal v0.81.1: la orientación de los bloques de los expertos difiere y el demo re-redondea entre el 7 % y el 54 % de los valores.
- tt-forge no ha sido probado con este checkpoint.
- Degradación medible frente a BF16: KL media de 0,0636 y top-1 del 81,90 % frente al 100 % del original.
- Calibración limitada a inglés y coreano (65.536 tokens de WikiText-2 y Wikipedia coreana); el comportamiento en otros idiomas no está verificado.
- Los expertos con pocos tokens de calibración se redondearon al más cercano, lo que puede introducir mayor error en esos expertos.
- Riesgo de alucinación y sesgos heredados del modelo base `gpt-oss-20b`; no se documentan mitigaciones específicas en esta cuantización.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de OpenAI.
- El repo ocupa 41,9 GB en disco aunque el modelo empaquetado sean 13,22 GB.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo gpt-oss en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gpt_oss
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv): https://arxiv.org/abs/2508.10925
