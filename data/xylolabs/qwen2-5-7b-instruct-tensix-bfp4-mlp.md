# Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tensix-BFP4-MLP es una cuantizacion del modelo Qwen2.5-7B-Instruct de Alibaba, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos disenada para que el hardware de Tenstorrent pueda empaquetar los tensores en sus formatos nativos de block floating point (BFP4 y BFP8) sin re-cuantizar en tiempo de carga. El modelo base es un transformer decoder-only de 7.615.616.512 parametros con licencia Apache 2.0.

La innovacion principal reside en el esquema de cuantizacion mixta: las capas de atencion (q, k, v, o) se redondean a `ttnn.bfloat8_b` (8,5 bits por peso) mediante redondeo al mas cercano, mientras que las capas MLP (gate, up, down) se cuantizan a `ttnn.bfloat4_b` (4,5 bits por peso) mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado es un modelo de 6,26 GB empaquetados con 6,58 bits por peso de media, que conserva el embedding, el LM head y las normas en bf16.

Es relevante porque representa un paso hacia el despliegue de LLMs de 7B en aceleradores no convencionales (NPU) con un coste de memoria reducido a menos de la mitad del modelo original en bf16 (15,23 GB), manteniendo una degradacion de calidad acotada segun la evaluacion del autor. La model card advierte que las pruebas se han realizado sobre el simulador `ttsim`, no sobre hardware fisico, y que el soporte end-to-end en tt-forge aun no se ha ejecutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizacion mixta BFP4/BFP8 para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (MLP) y bfloat8_b (atencion); 6,58 bits por peso de media |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only con atencion multi-cabeza estandar, 28 capas y mecanismos de RoPE. Sobre esa arquitectura, Xylolabs aplica un proceso de cuantizacion post-entrenamiento: las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se redondean al mas cercano a `ttnn.bfloat8_b`, mientras que las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con busqueda de exponente por bloque. La calibracion de GPTQ emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El fichero `quant4.json` documenta el formato de cada proyeccion.

Los tensores se almacenan en bf16, pero cada valor ya esta alineado a la rejilla de BFP4 o BFP8, de modo que TT-NN los empaqueta sin redondeo adicional. La model card indica que los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`. El autor probo el flujo con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre hardware real. Para tt-transformers (tt-metal v0.81.1) se requiere pasar `--use_hf_rope` y configurar `precision_cfg` con `ff1_3: bfp4`, `ff2: bfp4`, `wqkv: bfp8`, `wo: bfp8`. En tt-forge (tt-xla) los pesos se ejecutan en bf16 por defecto (exacto), y su opcion `bfp_bf4` re-redondea con otro layout de bloque, por lo que el autor recomienda tt-transformers para los pesos de 4,5 bits.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo propias del modelo base (no se documentan evaluaciones especificas en la informacion disponible).
- Soporte de chat multi-turno mediante `apply_chat_template`.
- Capacidades multilingues limitadas a ingles segun el campo `language` del repo (el modelo base soporta mas idiomas, pero esta ficha solo declara `en`).
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.
- Capacidades de agente multi-paso: no documentadas en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole y Blackhole: el modelo esta empaquetado para que TT-NN lo cargue directamente en DRAM sin re-cuantizacion, reduciendo el coste de memoria a 6,26 GB frente a los 15,23 GB del bf16.
- Investigacion en cuantizacion block floating point: sirve como referencia reproducible para estudiar el impacto de BFP4 en capas MLP frente a BFP8 en atencion, con fichero `quant4.json` que detalla cada proyeccion.
- Validacion de pipelines de compilacion TT-Metal/tt-forge: util para equipos que desarrollan sobre tt-metal y necesitan un modelo de 7B con pesos ya alineados a la rejilla Tensix.
- Prototipado de asistentes conversacionales en ingles sobre aceleradores Tenstorrent: al conservar el tokenizer y el chat template de Qwen2.5, se reutiliza el codigo de integracion existente.
- Benchmarking de precision frente a BF16: la model card reporta KL medio, Top-1 y respuestas correctas sobre un conjunto de 33 preguntas, lo que permite medir la perdida de calidad de la cuantizacion.
- Educacion y experimentacion con GPTQ sobre hardware no GPU: el repositorio `tensix-bfp-gptq` incluye `pack_tensix.py` y `verify_grid.py` para comprobar que ningun valor cambia al empaquetar.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion parcial (el texto proporcionado se corta en la fila del modelo cuantizado). Los datos disponibles son:

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct) | 16 | 15,23 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,58 | 6,26 | no disponible (texto truncado) | no disponible (texto truncado) | no disponible (texto truncado) | no disponible (texto truncado) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este modelo cuantizado.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,26 GB empaquetados en formatos Tensix; el repo ocupa 15,2 GB porque los tensores se almacenan en bf16 antes del empaquetado.
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecucion en GPU se puede cargar con `transformers` en bf16 (device_map="auto"), requiriendo aproximadamente 15,2 GB de VRAM.
- Cabe en GPU consumer: en bf16, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojarlo; en GPUs de 16 GB requeriria cuantizacion adicional no incluida en el repo.
- Opciones de despliegue: `transformers` (quickstart de la model card), `ttnn` 0.81.1 sobre `ttsim` o hardware Tensix, tt-transformers (tt-metal v0.81.1, solo en 2 o 4 chips N300 o superiores), tt-forge (tt-xla) con `pjrt-plugin-tt==1.4.0`. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla.
- Latencia y throughput: no disponibles; las pruebas se realizaron en simulador, no en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP | 7,6 B | no disponible | BFP4 MLP + BFP8 atencion (6,58 bits/peso) | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en esta ficha | bf16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GPTQ/AWQ de Qwen2.5-7B | 7,6 B | no disponible | 4 bits tipico | Apache 2.0 | Hugging Face |

La comparativa con cuantizaciones de 4 bits convencionales (GPTQ, AWQ) no puede completarse con datos de rendimiento porque la informacion proporcionada no incluye sus resultados en los mismos benchmarks. La diferencia clave frente a esas alternativas es el formato de destino: BFP4/BFP8 nativo de Tensix, no INT4/FP16 para GPU.

## Limitaciones y advertencias

- Las pruebas se han realizado sobre `ttsim` (simulador de Blackhole), no sobre hardware Tensix fisico; el rendimiento real en Wormhole o Blackhole no esta verificado.
- El soporte end-to-end en tt-forge no se ha ejecutado; tt-transformers solo funciona en configuraciones de 2 o 4 chips (N300 y superiores).
- La cuantizacion BFP4 en las capas MLP introduce degradacion de calidad respecto a BF16; la tabla de evaluacion del autor esta truncada en la informacion disponible, por lo que no se puede cuantificar la perdida exacta.
- El campo `language` del repo declara unicamente ingles; el uso en otros idiomas no esta validado para esta version cuantizada.
- La longitud de contexto no se especifica en la informacion proporcionada; debe consultarse la model card del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen2.5-7B-Instruct; no se documentan evaluaciones de sesgo especificas para esta cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantias sobre el comportamiento en produccion ni sobre la exactitud de los pesos empaquetados en hardware no probado.
- El repo pesa 15,2 GB pese a que el modelo empaquetado ocupa 6,26 GB, lo que puede confundir en el aprovisionamiento de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
