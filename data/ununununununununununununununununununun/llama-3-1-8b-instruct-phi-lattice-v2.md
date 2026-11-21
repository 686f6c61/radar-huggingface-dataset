# ununununununununununununununununununun/llama-3.1-8b-instruct-phi-lattice-v2

## Resumen

`llama-3.1-8b-instruct-phi-lattice-v2` es una compilación cuantizada a 4 bits del modelo `RedHatAI/Llama-3.1-8B-Instruct` (redistribución BF16 del original `meta-llama/Llama-3.1-8B-Instruct`) mediante el esquema propietario `phi-lattice v2`. Lo publica el usuario `ununununununununununununununununununun` en Hugging Face bajo licencia Llama 3.1. No se trata de un modelo nuevo ni de un fine-tune: es el mismo modelo base con los pesos lineales comprimidos a nibbles `uint8` de 4 bits y escalas de grupo en fp16, mientras que `lm_head`, `embed_tokens` y las capas de normalización permanecen en BF16.

El objetivo es reducir el espacio en disco y la memoria residente en inferencia. El archivo empaquetado ocupa 5.540,7 MiB frente a los 14,96 GiB del checkpoint BF16 original, lo que supone una reducción de 2,76x. La decodificación se realiza mediante un kernel Triton de LUT-GEMM fusionado (`triton_4bit`) o mediante dequantización en PyTorch dentro de cada capa lineal (`low_vram_4bit`), con la opción adicional de desplegar todos los tensores a BF16 (`unrolled_bf16`).

Es relevante para quienes necesitan ejecutar Llama 3.1 8B Instruct en GPUs con menos VRAM o con almacenamiento limitado, aceptando una pérdida medible de calidad (SQNR de pesos de 19,34 dB y una caída de 4,9 puntos en HumanEval pass@1). El modelo conserva la arquitectura, el tokenizador y la ventana de contexto del original, aunque la model card no documenta explícitamente estos dos últimos extremos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos lineales cuantizados a 4 bits con esquema phi-lattice v2 |
| Parametros totales | 8,03B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | 4 bits (nibbles `uint8` + escalas de grupo fp16); `lm_head`, `embed_tokens` y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | `.pt` empaquetado propietario (`llama31_8b_instruct_phi_v2_packed_4bit.pt`, 5.540,7 MiB) con codebook embebido; no es safetensors ni GGUF |
| Capas transformer | 32 |
| Capas lineales cuantizadas | 224 |
| Pesos lineales cuantizados | 6.979.321.856 |
| Tensores almacenados | 291 / 291 |
| Tamano del repo | 14,4 GB |
| SQNR de pesos | 19,34 dB frente a los tensores BF16 originales |
| Ceros exactos en indices empaquetados | 861.824.004 (12,35%) |
| SHA-256 del archivo empaquetado | `4a8670afeb50e731167cefdf5b83d6c335e70fe71b408874313559d10c8d7ed3` |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only de 32 capas con 8,03B parametros. El proceso aplicado no es un entrenamiento, sino una cuantizacion post-entrenamiento (PTQ) con un esquema denominado `phi-lattice v2`. Los 224 tensores lineales se almacenan como nibbles de 4 bits en `uint8` junto con escalas de grupo en fp16, y el codebook necesario para descomprimir se guarda dentro del propio archivo empaquetado. Cada capa cuantizada cumple la restriccion `K % 64 == 0`, requisito del kernel de decodificacion.

El autor menciona que existe una pasada de "crystallizer" (v1 frente a v2) que en otros modelos (Gemma 3 270M, Qwen3-4B) modifico el SQNR, aunque en Qwen2.5-Coder-7B no tuvo efecto. Para este modelo esa pasada no se ha ejecutado y, por tanto, no se reclama ninguna mejora derivada de ella. La inferencia puede realizarse de tres formas: `triton_4bit` (LUT-GEMM fusionado en Triton sobre CUDA), `low_vram_4bit` (dequantizacion en PyTorch dentro de cada capa, manteniendo el archivo residente) y `unrolled_bf16` (desempaquetado de los 291 tensores a BF16, que equivale a la inferencia del modelo base). No se documenta ningun proceso de RLHF o DPO adicional sobre el modelo original.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones (evaluado con IFEval en el script `run_text_evals.py`).
- Generacion de codigo: HumanEval pass@1 de 0,6463 en la version cuantizada (106 de 164 tareas).
- Razonamiento matematico basico: el repositorio incluye evaluacion GSM8K, aunque no se publican resultados en la informacion disponible.
- Conocimiento general: evaluacion MMLU incluida en el script, sin resultados publicados.
- Tool calling y function calling: no confirmado explicitamente en la model card; el modelo base Llama 3.1 8B Instruct lo soporta, pero la cuantizacion no documenta su preservacion.
- Capacidades multilingues: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el modelo base no las incluye.

## Casos de uso

- Despliegue en GPUs de gama alta con VRAM limitada: el archivo empaquetado de 5.540,7 MiB permite mantener residente un modelo de 8B en tarjetas donde el checkpoint BF16 de 14,96 GiB no cabria, usando `mode="low_vram_4bit"` o `mode="triton_4bit"`.
- Servicio de generacion de codigo en entornos con restricciones de memoria: con un pass@1 de 0,6463 en HumanEval, es utilizable para autocompletado y generacion de funciones en pipelines internos donde el rendimiento en codigo no sea critico y prime el ahorro de VRAM.
- Prototipado e investigacion sobre cuantizacion: el repositorio incluye el loader, el kernel Triton y scripts de evaluacion, lo que lo convierte en una referencia practica para medir el impacto de esquemas de 4 bits sobre un modelo conocido.
- Evaluacion comparativa de tecnicas de compresion: al conservar el checkpoint base y permitir `unrolled_bf16`, se puede medir directamente la degradacion introducida por phi-lattice v2 frente al original en las mismas condiciones de hardware.
- Asistentes conversacionales de bajo coste: para aplicaciones de chat con requisitos moderados de calidad y donde el ahorro de memoria y almacenamiento justifica la perdida de precision.
- Experimentacion con kernels personalizados: el archivo `phi_lut_gemm.py` permite estudiar y adaptar un LUT-GEMM fusionado en Triton a otros modelos o configuraciones de hardware.
- Despliegue en estaciones de trabajo con una sola GPU consumer de gama alta: el tamaño empaquetado y la opcion `low_vram_4bit` facilitan la ejecucion en tarjetas con 8-12 GB de VRAM, aunque no se publican mediciones de latencia ni throughput.

## Benchmarks y rendimiento

El unico benchmark con resultados publicados en la informacion disponible es HumanEval (greedy, plantilla de chat activada, 164 tareas, pass@1, ejecutado en NVIDIA A100):

| Modelo | pass@1 | stderr | Tareas resueltas |
|---|---:|---:|---:|
| Base `RedHatAI/Llama-3.1-8B-Instruct` | 0,6951 | 0,0361 | 114 / 164 |
| phi-lattice v2 | 0,6463 | 0,0374 | 106 / 164 |

La diferencia es de 0,049 puntos (8 tareas menos), con un error estandar combinado de 0,052, por lo que la caida equivale aproximadamente a una barra de error. La evaluacion de v2 se realizo desde `unrolled_bf16`, es decir, desempaquetando el archivo una vez y generando con el mismo procedimiento que la ejecucion base.

El repositorio incluye scripts para MMLU, GSM8K, IFEval y HellaSwag, pero no se han publicado resultados de esos benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GiB para el archivo empaquetado residente (5.540,7 MiB) en modos `low_vram_4bit` y `triton_4bit`, mas el overhead del runtime, del tokenizador y de los tensores BF16 no cuantizados (`lm_head`, `embed_tokens` y normas, que suman 2.004,8 MiB dentro del archivo).
- Modo `unrolled_bf16`: requiere el equivalente al checkpoint BF16, aproximadamente 14,96 GiB.
- GPUs recomendadas: el autor ejecuto las evaluaciones en NVIDIA A100. Cualquier GPU CUDA compatible con Triton puede usar `triton_4bit`; `low_vram_4bit` funciona con PyTorch estandar en CUDA.
- GPU consumer: por tamano, deberia caber en tarjetas con 8-12 GB de VRAM en modo 4 bits, aunque no se publican mediciones especificas para RTX 4090, RTX 3090 u otras consumer.
- Opciones de despliegue: el modelo no usa safetensors ni GGUF, por lo que no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es el loader propio `phi_loader.py` con transformers y, opcionalmente, el kernel `phi_lut_gemm.py` en Triton.
- Latencia y throughput: no disponibles; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---:|---|---|---|---|
| `llama-3.1-8b-instruct-phi-lattice-v2` | 8,03B | no disponible | `.pt` empaquetado 4 bits | llama3.1 | HumanEval pass@1 0,6463 |
| `RedHatAI/Llama-3.1-8B-Instruct` (base) | 8,03B | no disponible | safetensors BF16 | llama3.1 | HumanEval pass@1 0,6951 |
| `meta-llama/Llama-3.1-8B-Instruct` (original) | 8,03B | 128K (segun la documentacion oficial de Meta, no verificada en esta ficha) | safetensors BF16 | llama3.1 | no disponible en esta informacion |
| Cuantizaciones GGUF/AWQ de Llama 3.1 8B | 8,03B | heredado del base | GGUF, safetensors AWQ/GPTQ | llama3.1 | no disponible en esta informacion |

La comparativa directa con otras cuantizaciones de Llama 3.1 8B (GGUF Q4, AWQ, GPTQ) no es posible con los datos disponibles: la model card no publica resultados frente a esos formatos, y estos ultimos cuentan con soporte nativo en vLLM, llama.cpp y Ollama, del que phi-lattice v2 carece.

## Limitaciones y advertencias

- Perdida de calidad medible: el SQNR de pesos es de 19,34 dB y HumanEval pass@1 cae de 0,6951 a 0,6463 (8 tareas menos de 164). Aunque la diferencia esta dentro de una barra de error combinada, es una degradacion real que debe considerarse en produccion.
- Formato propietario: los pesos no estan en safetensors ni GGUF, lo que impide usar herramientas estandar de despliegue (vLLM, TGI, llama.cpp, Ollama) y obliga a depender del loader `phi_loader.py` del autor.
- Dependencia de codigo de terceros: la carga del modelo requiere descargar y ejecutar `phi_loader.py` y, para el modo Triton, `phi_lut_gemm.py`. Conviene auditar ese codigo antes de usarlo en entornos de produccion.
- Falta de validacion del "crystallizer": el autor indica que la pasada v1 frente a v2 no se ha ejecutado para este modelo y no reclama ninguna mejora derivada de ella.
- Idiomas soportados no documentados: la model card no especifica la cobertura linguistica, aunque el modelo base Llama 3.1 esta orientado principalmente al ingles y a un conjunto limitado de idiomas.
- Contexto no documentado: la longitud de contexto no aparece en la informacion proporcionada; debe verificarse contra la configuracion del modelo base antes de asumir 128K tokens.
- Riesgo de alucinacion: inherente a los modelos de 8B; la cuantizacion puede agravarlo ligeramente en tareas de razonamiento largo.
- Sesgos: no documentados en la model card; heredados del modelo base y de sus datos de entrenamiento.
- Licencia Llama 3.1: impone restricciones de uso comercial (politica de uso aceptable, obligacion de atribucion y limites para empresas con mas de 700 millones de usuarios mensuales). Revisar los terminos antes de un despliegue comercial.
- Autor y procedencia: el modelo lo publica una cuenta anonima y la model card indica que se uso la copia de Red Hat porque la solicitud al repositorio oficial de Meta fue rechazada. No hay garantias de mantenimiento ni de soporte.
- Sin resultados publicados en MMLU, GSM8K, IFEval ni HellaSwag, pese a incluir scripts para medirlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/llama-3.1-8b-instruct-phi-lattice-v2
- Modelo base (Red Hat): https://huggingface.co/RedHatAI/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Resultados HumanEval del base: https://huggingface.co/jobs/ununununununununununununununununununun/6af336aeab34849891ac24b9
- Resultados HumanEval de phi-lattice v2: https://huggingface.co/jobs/ununununununununununununununununununun/6af33ec79737d9a9e090e62a
- Resultados HumanEval en el repositorio: `evals/humaneval_llama31_instruct.json`
