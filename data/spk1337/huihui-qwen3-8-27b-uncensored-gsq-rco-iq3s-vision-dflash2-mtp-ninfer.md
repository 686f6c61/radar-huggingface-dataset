# SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer

## Resumen

Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer es un paquete comunitario del modelo Huihui-Qwen3.8-27B en version abliterated (uncensored), distribuido en el formato nativo NInfer v3 (`.ninfer`) en lugar de safetensors o GGUF directamente cargables. Lo publica SPK1337 y deriva de la familia Qwen3.8-27B, con pesos de texto procedentes de una conversion GGUF GSQ-RCO IQ3_S del modelo abliterated de Huihui, mas componentes de vision, MTP y DFlash2.

El artefacto ocupa 13,99 GiB (15.017.456.896 bytes) y combina cuantizacion de precision mixta (bloques GGUF con IQ3_S, IQ3_XXS e IQ4_XS segun el tensor). Incorpora decodificacion especulativa mediante dos backends seleccionables (DFlash2 o MTP) y soporte multimodal de imagen-texto, pensado para despliegue en una RTX 4090 de 24 GB con un build CUDA 13.4 especifico para SM89.

Su relevancia radica en que empaqueta un modelo abliterated de 27B con vision y especulacion en un tamano que cabe en GPU de consumo, con metricas de inferencia medidas (146,6 tokens/s de mediana en decodificacion, 2.345 tokens/s en prefill largo). Es un artefacto de nicho: requiere el fork de NInfer del autor y no es compatible con vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (familia Qwen3); componentes de vision, MTP y DFlash2 |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 176.128 tokens (techo medido en el benchmark); ejemplo de arranque conservador a 32.768 |
| Tipos de cuantizacion | Precision mixta GSQ-RCO con bloques GGUF: IQ3_S, IQ3_XXS e IQ4_XS segun tensor |
| Idiomas soportados | en, de, zh |
| Licencia | Apache-2.0 (con terminos upstream y atribucion en NOTICE/LICENSE) |
| Formato de pesos | NInfer v3 (`.ninfer`), 13,99 GiB; no safetensors ni GGUF cargable directamente |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de 27.000 millones de parametros, y se distribuye como artefacto NInfer v3 que empaqueta cuatro componentes: texto, vision, MTP (multi-token prediction) y DFlash2. Los pesos de texto proceden de una version abliterated/uncensored de Huihui, convertida desde GGUF GSQ-RCO IQ3_S; el registro de conversion lista tambien una cabeza de propuesta (proposal head). La cuantizacion es de precision mixta: IQ3_S es solo parte de la familia, no el formato de todos los tensores, y el registro de conversion detalla el formato individual de cada uno.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es la decodificacion especulativa con dos backends intercambiables: DFlash2 (probado con 5 tokens de borrador) y MTP (con 3 tokens de borrador), que no deben activarse simultaneamente. El build de referencia usa CUDA 13.4 con un perfil de dispositivo `rtx4090-cuda134-sm89.json` que ajusta KV cache, residencia de vision y parametros de especulacion.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen3.8-27B.
- Entrada multimodal imagen-texto: el componente de vision se activa con `--vision` y admite `--vision-residency overlay` para presupuestos de memoria ajustados.
- Decodificacion especulativa seleccionable: DFlash2 (5 tokens de borrador) o MTP (3 tokens de borrador).
- Capacidades multilingues limitadas a en, de y zh segun la model card.
- Variante abliterated/uncensored: se eliminan restricciones de rechazo del modelo original, con implicaciones de seguridad.
- Servidor compatible con API de OpenAI (`ninfer-serve`, endpoint de chat completions).
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion proporcionada.

## Casos de uso

- Despliegue local en RTX 4090 para generacion de texto interactiva: el artefacto de 13,99 GiB cabe en 24 GB de VRAM y ofrece 146,6 tokens/s de mediana en decodificacion, adecuado para asistentes locales con baja latencia.
- Procesamiento de documentos con contexto largo: el techo medido de 176.128 tokens permite analisis de contratos, informes o codebases extensos en una sola pasada, con 2.345 tokens/s de prefill largo.
- Descripcion y analisis de imagenes: con `--vision` activado, sirve para extraccion de informacion de capturas, diagramas o documentacion escaneada, aunque la calidad y latencia de vision no fueron medidas por el autor.
- Investigacion sobre decodificacion especulativa: permite comparar DFlash2 y MTP sobre cargas reales gracias a los backends intercambiables y a la receta de benchmark reproducible.
- Generacion de contenido sin filtros de rechazo: util en investigacion sobre sesgos y seguridad de modelos abliterated, o en aplicaciones creativas donde el modelo base rechaza peticiones.
- Prototipado de servidores compatibles con OpenAI en estaciones de trabajo Windows con GPU Ada Lovelace, usando `ninfer-serve` con flags equivalentes en Linux.
- Evaluacion de cuantizacion de precision mixta: comparar IQ3_S, IQ3_XXS e IQ4_XS por tensor frente al modelo original en tareas de razonamiento y generacion.

## Benchmarks y rendimiento

| Metric | Resultado observado |
|---|---|
| Velocidad de decodificacion mediana | 146,6 tokens/s |
| Velocidad de decodificacion percentil 90 | 215,5 tokens/s |
| Prefill largo mediano (>4.096 tokens computados, 316 peticiones) | 2.345 tokens/s |
| Peticiones completadas / tokens generados | 1.831 / 2.754.629 |

Las cifras se midieron en una RTX 4090 de 24 GB con CUDA 13.4, build SM89 personalizado y DFlash2 con 5 tokens de borrador, sobre peticiones reales registradas entre el 30 y el 31 de octubre de 2026. No son throughput end-to-end ni un benchmark estandarizado, ni demuestran una mejora sobre NInfer de serie. MTP y la entrada de imagen no fueron evaluados. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 13,99 GiB de pesos mas KV cache y estado de vision; medido en una RTX 4090 de 24 GB con contexto de hasta 176.128 tokens y perfil de cache ajustado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB, SM89) como dispositivo de referencia y benchmark; otras GPU NVIDIA pueden funcionar con binarios, perfiles y presupuestos de memoria adecuados.
- Cabe en GPU de consumo: si, en RTX 4090; no se confirma compatibilidad con GPU de 16 GB o menos.
- Opciones de despliegue: `ninfer-serve` del fork SPK RTX 4090 NInfer (https://github.com/spk-c/ninfer-all-rtx4090); no compatible con vLLM, llama.cpp, Ollama ni TGI por el formato `.ninfer`.
- Latencia y throughput: 146,6 tokens/s mediana de decodificacion y 2.345 tokens/s de prefill largo en la configuracion medida; la latencia de vision no se midio.
- Build de referencia: CUDA 13.4, NInfer `2026-10-28.1+2026-10-28.1-49-gce2ff852`, perfil `rtx4090-cuda134-sm89.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer | 27B | 176.128 (medido) | NInfer v3 `.ninfer` | Apache-2.0 | Vision, DFlash2 y MTP; requiere fork NInfer |
| Qwen3.8-27B (base) | 27B | no disponible | safetensors | no disponible | Modelo original no abliterated, sin vision ni especulacion empaquetada |
| Huihui-Qwen3.8-27B abliterated (GGUF GSQ-RCO IQ3_S) | 27B | no disponible | GGUF | no disponible | Fuente de los pesos de texto; sin componentes de vision ni especulacion |
| NInfer de serie | no disponible | no disponible | `.ninfer` | no disponible | Referencia del autor; no se demuestra mejora sobre el |

## Limitaciones y advertencias

- Artefacto de nicho: no es safetensors ni GGUF cargable directamente; exige el fork NInfer del autor y un build CUDA compatible con SM89.
- La variante abliterated/uncensored elimina rechazos de seguridad del modelo original, con riesgo elevado de contenido danino, sesgos amplificados y salidas inapropiadas en produccion.
- Riesgo de alucinacion inherente a modelos de 27B cuantizados a precision mixta IQ3_S/IQ3_XXS, con posible perdida adicional de calidad frente al modelo original.
- Idiomas limitados a en, de y zh; no hay soporte documentado de castellano.
- La licencia Apache-2.0 se declara con terminos upstream y atribucion en NOTICE/LICENSE; conviene revisar las condiciones del modelo base Qwen y de los pesos Huihui antes de uso comercial.
- Las metricas de rendimiento son de peticiones reales no estandarizadas, no throughput end-to-end, y no demuestran mejora sobre NInfer de serie; MTP y vision no fueron medidas.
- DFlash2 y MTP no deben activarse simultaneamente; hay que compararlos por separado en cada carga.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- La residencia de vision en modo overlay y la reduccion de contexto son necesarias en presupuestos de memoria ajustados.

## Enlaces

- Hugging Face: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer
- Fork NInfer RTX 4090: https://github.com/spk-c/ninfer-all-rtx4090
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Benchmark RTX 4090: BENCHMARK-RTX4090.md (en el repositorio del modelo)
- Registro de conversion: Huihui-Qwen3.8-27B-GSQ-RCO-IQ3S-Vision-DFlash2.ninfer.conversion.json (en el repositorio del modelo)
- Licencia y atribuciones: NOTICE y LICENSE (en el repositorio del modelo)
