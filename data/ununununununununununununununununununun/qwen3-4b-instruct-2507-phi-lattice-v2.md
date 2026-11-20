# ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2

## Resumen

`qwen3-4b-instruct-2507-phi-lattice-v2` es una compilación cuantizada a 4 bits del modelo denso `Qwen/Qwen3-4B-Instruct-2507` (4.022.468.096 parámetros, 36 capas transformer), publicada por el usuario `ununununununununununununununununununun`. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de compresión que aplica una técnica propia denominada `phi-lattice v2` sobre los pesos lineales del modelo base, empaquetándolos en un archivo `uint8` de 2,71 GB (`qwen3_4b_phi_v2_packed_4bit.pt`) que incluye además una tabla de tokens y normas en BF16.

El problema que resuelve es el de la huella de memoria en inferencia: el checkpoint original en BF16 ocupa 7.671,6 MiB, mientras que esta versión mantiene 2.583,0 MiB residentes en GPU, una reducción total de 2,97x (3,76x sobre los pesos lineales). La compresión se consigue sin datos de calibración y con un 12,53% de pesos exactamente anulados, apoyándose en un kernel Triton fusionado de LUT-GEMM (`phi_lut_gemm.py`) que opera directamente sobre los pesos de 4 bits en registros de GPU.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de 4B con contexto nativo de Qwen3 en GPUs de consumo; por otro, sirve como referencia metodológica de cuantización no uniforme, ya que el autor publica métricas comparativas frente a cuantización uniforme y frente a su versión anterior `phi-lattice v1`. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas, 252 capas lineales cuantizadas |
| Parametros totales | 4.022.468.096 (3.633.315.840 en pesos lineales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Phi-lattice v2 4-bit (uint8 empaquetado), 3-bit documentado en benchmarks; modos `triton_4bit`, `low_vram_4bit`, `unrolled_bf16` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (archivo empaquetado `uint8` + tabla de tokens y normas en BF16); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 36 capas con 4.022 millones de parámetros. Sobre él, esta publicación no entrena ni afina: aplica una compresión post-entrenamiento de los 3.633.315.840 pesos lineales distribuidos en 252 capas `Linear`, todas ellas con dimensión de entrada múltiplo de 64 (`K%64==0`), condición que habilita el kernel LUT-GEMM. El resto de tensores (398 en total, incluyendo tabla de tokens y normas) se conserva en BF16 y suma 742,1 MiB del archivo.

La innovación técnica es la cuantización `phi-lattice v2`, una rejilla no uniforme que sustituye el escalado uniforme por una tabla de consulta (LUT) de valores representables. Según las métricas del autor, v2 alcanza 19,63 dB de SQNR a 4 bits (frente a 19,04 dB de la cuantización uniforme y 18,62 dB de v1) y 12,90 dB a 3 bits (frente a 11,70 dB uniforme). Además, produce un 12,53% de pesos exactamente cero a 4 bits (455.352.162 pesos) y un 21,24% a 3 bits, lo que permite saltar operaciones. No se requiere conjunto de calibración. La decodificación se realiza con `phi_lut_gemm.py`, un kernel Triton fusionado que resuelve el producto matriz-vector directamente sobre los códigos de 4 bits, y con `phi_loader.py`, que ofrece tres modos de carga con huellas de VRAM distintas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento matemático: GSM8K con `exact_match` de 0,8393 en la versión cuantizada, lo que indica que la compresión preserva la capacidad aritmética del original.
- Conocimiento multidisciplinar: MMLU de 0,6806, coherente con un modelo de 4B de la familia Qwen3.
- Razonamiento de sentido común: HellaSwag `acc_norm` de 0,6719.
- Seguimiento de instrucciones: capacidad medida con IFEval, aunque con la mayor degradación relativa del conjunto (ver sección de benchmarks).
- Tool calling y function calling: no documentado explícitamente en la información proporcionada; debe validarse empíricamente sobre el modelo cuantizado.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no documentados en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo para asistentes conversacionales: con 2.583,0 MiB residentes en modo `triton_4bit`, el modelo cabe holgadamente en tarjetas de 8 GB y permite reservar el resto de VRAM para el contexto KV, algo inviable con el checkpoint BF16 de 7,67 GiB.
- Servicio de inferencia de bajo coste en entornos con múltiples instancias: la reducción de 2,97x en VRAM permite alojar varias réplicas del modelo en una sola GPU de 24 GB o 48 GB, aumentando el throughput agregado frente a una única instancia BF16.
- Prototipado e investigación en cuantización: el repositorio incluye `phi_loader.py` y `phi_lut_gemm.py` junto con los JSON de evaluación en `evals/lm_eval_qwen_base/` y `evals/lm_eval_qwen_v2/`, lo que facilita reproducir la comparativa BF16 frente a 4 bits y evaluar la técnica frente a alternativas uniformes.
- Evaluación de pipelines de razonamiento matemático en hardware limitado: con GSM8K en 0,8393 (97,7% del baseline), es adecuado para tareas de resolución de problemas aritméticos en entornos donde no se dispone de GPUs de datacenter.
- Educación y demostraciones técnicas: la carga en modo `low_vram_4bit` con desquantización por capa bajo demanda permite ejecutar el modelo en portátiles con GPU de 6-8 GB, útil para talleres y formación sobre transformers y cuantización.
- Clasificación y extracción de información con contexto conversacional: el modelo conserva el 96,4% del rendimiento MMLU del original, suficiente para tareas de respuesta a preguntas sobre documentación y resumen en producción de baja criticidad.
- Integración en pipelines de CI para validación de modelos: el archivo empaquetado de 2,71 GB reduce los tiempos de descarga y almacenamiento en artefactos frente a los 8,05 GB del checkpoint BF16, lo que simplifica la incorporación del modelo a tests automatizados.

## Benchmarks y rendimiento

Resultados de cuantización de pesos publicados por el autor:

| Metodo | SQNR 4-bit | Dispersion exacta 4-bit | SQNR 3-bit | Dispersion exacta 3-bit |
|---|---:|---:|---:|---:|
| Baseline BF16 | referencia | 0,00% | referencia | 0,00% |
| Uniforme estandar | 19,04 dB | 0,00% | 11,70 dB | 0,00% |
| phi-lattice v1 | 18,62 dB | 7,82% (284.125.300 pesos) | 12,66 dB | 19,39% |
| phi-lattice v2 (este repo) | 19,63 dB | 12,53% (455.352.162 pesos) | 12,90 dB | 21,24% |

Resultados de `lm-evaluation-harness` (modo `unrolled_bf16`, `batch_size=16`):

| Tarea | Metrica | Base BF16 | phi-lattice v2 | stderr (base / v2) |
|---|---|---:|---:|---:|
| MMLU (14.042 items) | acc | 0,7063 | 0,6806 | 0,0036 / 0,0037 |
| GSM8K (1.319 items) | exact_match strict | 0,8590 | 0,8393 | 0,0096 / 0,0101 |
| IFEval (541 prompts) | prompt_level_strict_acc | 0,5786 | 0,4547 | 0,0212 / 0,0214 |
| IFEval (541 prompts) | inst_level_strict_acc | 0,6918 | 0,6007 | no disponible |
| IFEval (541 prompts) | prompt_level_loose_acc | 0,6414 | 0,5139 | 0,0206 / 0,0215 |
| IFEval (541 prompts) | inst_level_loose_acc | 0,7410 | 0,6487 | no disponible |
| HellaSwag (10.042 items) | acc | 0,5256 | 0,5064 | 0,0050 / 0,0050 |
| HellaSwag (10.042 items) | acc_norm | 0,6905 | 0,6719 | 0,0046 / 0,0047 |

Retencion respecto al baseline: 97,7% en GSM8K, 96,4% en MMLU y 97,3% en HellaSwag (`acc_norm`). IFEval cae a 78,6% en `prompt_level_strict_acc`, la mayor pérdida del conjunto.

## Requisitos de hardware

- VRAM en modo `triton_4bit` o `low_vram_4bit`: 2.583,0 MiB residentes (2,52 GiB), frente a 7.671,6 MiB del checkpoint BF16.
- VRAM en modo `unrolled_bf16`: 7.671,6 MiB, equivalente al modelo sin cuantizar.
- GPU recomendadas para 4 bits: cualquier GPU con soporte Triton y al menos 4 GB libres; RTX 3060 8 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A100 y H100 son válidas. El kernel Triton requiere capacidad de cómputo moderna para rendir de forma óptima.
- ¿Cabe en GPU de consumo? Sí, con margen amplio en 8 GB y suficiente en 6 GB si se limita la longitud de contexto. En 4 GB el margen es muy ajustado.
- Opciones de despliegue: `phi_loader.py` (modos `triton_4bit`, `low_vram_4bit`, `unrolled_bf16`) con `transformers` y `AutoTokenizer`; el autor indica que no hay contenedor de runtime separado en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse GGUF no es directamente usable en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `qwen3-4b-instruct-2507-phi-lattice-v2` | 4,02B | no disponible | `.pt` 4-bit empaquetado | Apache 2.0 | 2.583,0 MiB en GPU; requiere `phi_loader.py` |
| `Qwen/Qwen3-4B-Instruct-2507` (BF16) | 4,02B | no disponible | safetensors BF16 | Apache 2.0 | 7.671,6 MiB; referencia de calidad (MMLU 0,7063, GSM8K 0,8590) |
| Cuantizacion uniforme 4-bit del mismo base | 4,02B | no disponible | no disponible | Apache 2.0 | SQNR 19,04 dB; 0% de dispersion exacta; sin artefacto publicado en esta informacion |

No se dispone de datos de benchmarks de terceros (por ejemplo, builds GGUF de la comunidad) para establecer comparaciones adicionales con cifras verificables.

## Limitaciones y advertencias

- Degradación en seguimiento de instrucciones: IFEval `prompt_level_strict_acc` cae de 0,5786 a 0,4547, una pérdida relativa del 21,4%, muy superior a la observada en MMLU o GSM8K. Para tareas con formato estricto conviene validar el comportamiento antes de desplegar.
- Dependencia de código personalizado: el modelo no se carga con `AutoModelForCausalLM.from_pretrained` estándar; requiere descargar y ejecutar `phi_loader.py` y, para el modo rápido, `phi_lut_gemm.py`. Esto complica la integración con servidores de inferencia convencionales y añade superficie de auditoría de código de terceros.
- Ausencia de formatos estándar: no se publican safetensors ni GGUF, por lo que no es compatible directamente con llama.cpp, Ollama ni con la mayoría de pipelines que esperan esos formatos.
- Riesgo de alucinación: inherente a un modelo de 4B; la cuantización no lo incrementa de forma medible en los benchmarks publicados, pero tampoco lo mitiga.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad en la información proporcionada. Al heredar los pesos del modelo base, arrastra los sesgos de su dataset de entrenamiento, no descritos aquí.
- Idiomas: no se especifica la cobertura lingüística del modelo cuantizado; debe asumirse la del modelo base, no verificada en esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del artefacto no ofrece garantías sobre la calidad del proceso de cuantización ni sobre su idoneidad para producción.
- Repositorio con 0 likes y autor de nombre genérico: conviene auditar el hash sha256 del archivo (`c617c04a...`) y verificar la integridad antes de usarlo en entornos productivos.
- Contexto: la longitud máxima no se indica en la información proporcionada, por lo que el dimensionado de la caché KV para contextos largos debe determinarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Archivos del repositorio: `qwen3_4b_phi_v2_packed_4bit.pt`, `phi_loader.py`, `phi_lut_gemm.py`, `config.json`, tokenizer y `README.md`
- Resultados de evaluación: `evals/lm_eval_qwen_base/` y `evals/lm_eval_qwen_v2/` (incluidos en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
