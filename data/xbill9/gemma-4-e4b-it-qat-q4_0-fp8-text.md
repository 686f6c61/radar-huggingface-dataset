# xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text

## Resumen

`xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text` es un reempaquetado no oficial, solo texto, del checkpoint `google/gemma-4-E4B-it-qat-q4_0-unquantized` de Google. El autor elimina las torres de visión y audio y convierte las 343 capas lineales a FP8 E4M3 con una escala float32 por canal de salida, dejando embeddings, normas y per-layer embeddings en bf16 copiados byte a byte (322 tensores). El resultado es un checkpoint de 10,96 GB con 7.463.013.418 parámetros totales, servido con vLLM mediante el formato `compressed-tensors`.

La relevancia de esta ficha es doble. Por un lado, es un artefacto pensado para medir ejecución FP8 nativa en GPUs con tensor cores FP8 (Ada, Hopper y Blackwell), donde vLLM ejecuta estas capas como multiplicaciones de matrices FP8. Por otro, no es una copia exacta de los pesos QAT: al reescalar de escalas por grupo de 32 valores a una escala por canal de salida, los pesos se redondean de nuevo, con un error RMS relativo del 2,63 % sobre los 3.972.792.320 valores cuantizados.

Se trata de un modelo derivado, con licencia Gemma, cero descargas y cero "likes" en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Su interés es principalmente técnico e instrumental: comparar FP8 W8A8 frente a las variantes W4A16 del mismo modelo base en hardware compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4ForCausalLM` (`gemma4_text`), transformer decoder-only; torres de vision y audio eliminadas |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible (no se especifica si E4B usa enrutamiento tipo MoE; el nombre sigue la convencion de parametros efectivos de Google) |
| Longitud de contexto | no disponible; el ejemplo de servicio del autor usa `--max-model-len 8192` |
| Tipos de cuantizacion | Pesos: FP8 E4M3 (W8A8) con una escala float32 por canal de salida (max\|row\|/448, sin datos de calibracion). Activaciones: FP8 dinamica, por token. Embeddings, normas y per-layer embeddings: bf16 sin modificar |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors con `compressed-tensors` (`float-quantized`), orientado a vLLM |
| Capas lineales cuantizadas | 343 |
| Valores cuantizados | 3.972.792.320 |
| Tamano del checkpoint | 10,96 GB |
| Tamano del repositorio | 11,0 GB |
| Modelo base | google/gemma-4-E4B-it-qat-q4_0-unquantized |
| Libreria declarada | vllm |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo de texto de Gemma 4 (`gemma4_text`), un transformer decoder-only con per-layer embeddings (PLE), tal y como revela la presencia de esos tensores en bf16 dentro del checkpoint. Este reempaquetado no entrena nada: parte del checkpoint QAT de Google, ya entrenado con cuantizacion simulada sobre una rejilla de 4 bits con una escala por grupo de 32 valores, y le aplica una segunda cuantizacion a FP8. Las 343 capas lineales pasan a FP8 E4M3 con una escala float32 por canal de salida y las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion; los 322 tensores restantes (embeddings, normas, PLE) se copian sin cambios desde el checkpoint fuente.

La innovacion tecnica del artefacto no esta en el modelo, sino en el metodo de conversion: no se emplean datos de calibracion, las escalas de peso se calculan como `max|fila| / 448` y las de activacion se derivan por token en runtime. El coste de este enfoque es un error de cuantizacion medible frente a los pesos bf16 de origen: error RMS relativo del 2,63 % sobre el conjunto de valores cuantizados y error maximo del 3,57 % respecto al mayor valor de su fila. Al reescalar de escalas por grupo a escalas por canal, la rejilla QAT de 4 bits no se puede representar de forma exacta, por lo que el autor advierte explicitamente que este build sirve para medir ejecucion FP8, no como copia mas fiel de los pesos QAT. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generacion de texto en modo instruct, heredada del checkpoint `it` de Gemma 4 E4B.
- Razonamiento con modos de pensamiento configurables, segun la descripcion publica de la familia Gemma 4 (no verificado especificamente para este build).
- Generacion de codigo y resolucion de problemas matematicos: capacidad esperada del modelo base, no confirmada con benchmarks en este repositorio.
- Ejecucion FP8 nativa en GPUs con tensor cores FP8 (Ada, Hopper, Blackwell) mediante vLLM.
- Inferencia solo texto: las torres de vision y audio han sido eliminadas del checkpoint.
- Capacidades multilingues: no disponible.
- Tool calling y function calling: no confirmado en la informacion disponible para este build.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible para este build.
- Capacidad especial: ninguna adicional a la del modelo base de texto; el valor diferencial es el formato de cuantizacion.

## Casos de uso

- Servicio de inferencia de texto en GPUs Ada, Hopper o Blackwell: desplegable con `vllm serve xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text --max-model-len 8192`, aprovechando las multiplicaciones FP8 nativas para reducir el coste por token frente a un checkpoint bf16.
- Evaluacion comparativa de formatos de cuantizacion: al existir la variante W4A16 del mismo autor (`xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text`), permite medir en igualdad de condiciones la diferencia de calidad y throughput entre FP8 W8A8 y W4A16 sobre los mismos pesos fuente.
- Asistentes conversacionales de texto multi-turno: con una ventana configurada a 8192 tokens, cubre dialogos de soporte o consultoria donde todo el historial debe permanecer en contexto.
- Generacion de codigo en herramientas de desarrollo: el modelo base es instruct, por lo que puede integrarse en editores o pipelines internos para autocompletado y explicacion de fragmentos, siempre que se valide la calidad con evaluaciones propias.
- Procesamiento por lotes de texto (resumen, extraccion de entidades, clasificacion): el menor coste por token en FP8 favorece cargas de alto volumen con vLLM y peticiones concurrentes.
- Prototipado e investigacion en un solo servidor: el checkpoint de 10,96 GB permite levantar un endpoint de Gemma 4 E4B de texto en una unica GPU de gama profesional, sin necesidad de repartir el modelo entre varios dispositivos.
- Validacion de infraestructura FP8: util como carga de referencia para comprobar que un stack vLLM con `compressed-tensors` reconoce y ejecuta correctamente pesos FP8 E4M3 antes de migrar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato medido que aporta el autor es el error de cuantizacion frente a los pesos bf16 de origen, recogido en `verify_report.json`:

| Metrica | Valor |
|---|---|
| Valores cuantizados evaluados | 3.972.792.320 |
| Error RMS relativo (frente a bf16 de origen) | 2,63 % |
| Error maximo, como fraccion del mayor valor de su fila | 3,57 % |

Estos numeros miden fidelidad de reconstruccion de pesos, no capacidad del modelo. No deben interpretarse como rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 10,96 GB en disco; de ellos, unos 3,97 GB corresponden a los 3.972.792.320 valores FP8 (1 byte por parametro) y el resto a tensores bf16. Hay que sumar la cache KV, cuyo tamano depende del numero de capas y cabezas (no disponible) y de `--max-model-len`.
- GPU recomendadas para ejecucion FP8 nativa: NVIDIA L4 y L40S (Ada), H100 (Hopper) y generacion Blackwell, segun indica el propio autor.
- GPU consumer: el checkpoint cabe en tarjetas con 16 GB o mas de VRAM. Las RTX de generacion Ada (familia RTX 40) incluyen tensor cores FP8, pero la informacion disponible no confirma que vLLM aplique en ellas la ruta FP8 nativa; conviene verificarlo antes de desplegar.
- GPU sin tensor cores FP8: la ejecucion requeriria dequantizacion, con penalizacion de rendimiento; este escenario no esta documentado en la informacion disponible.
- Opciones de despliegue: vLLM, que debe soportar cuantizacion dinamica FP8 de `compressed-tensors`. No hay soporte confirmado para llama.cpp, Ollama, TGI u otros runtimes con este formato de pesos.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text` (este) | 7.463.013.418 | FP8 E4M3 W8A8, escalas por canal; activaciones FP8 por token | no disponible (ejemplo con 8192) | gemma | safetensors + compressed-tensors, para vLLM |
| `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text` | no disponible en la informacion | W4A16 que reproduce la rejilla QAT por grupo de 32; sin cuantizar activaciones | no disponible | gemma | safetensors + compressed-tensors |
| `google/gemma-4-E4B-it-qat-q4_0-unquantized` | no disponible en la informacion | Sin cuantizar (bf16), incluye torres de vision y audio | no disponible | gemma | safetensors |
| `gemma4:e4b-it-qat` (Ollama) | no disponible en la informacion | Q4_0 GGUF | no disponible | gemma | GGUF para Ollama |

La comparacion relevante es la primera fila frente a la segunda: comparten pesos fuente e interfaz de servicio, y se diferencian en que el build W4A16 conserva con mayor fidelidad la rejilla QAT pero no cuantiza activaciones, mientras que el build FP8 sacrifica precision en los pesos a cambio de activaciones FP8 y multiplicaciones nativas en hardware compatible. El checkpoint bf16 de Google y el GGUF de Ollama no son equivalentes funcionalmente: el primero es multimodal y el segundo usa otro formato de cuantizacion.

## Limitaciones y advertencias

- Modelo solo texto: las torres de vision y audio se han eliminado, por lo que no puede procesar imagenes ni audio aunque el modelo base si pueda.
- Reempaquetado no oficial: los problemas deben reportarse al autor del repositorio, no a Google. No cuenta con soporte ni validacion del equipo de Gemma.
- Perdida de precision adicional: la conversion desde la rejilla QAT de 4 bits a FP8 con una escala por canal introduce un error RMS relativo del 2,63 % y un error maximo del 3,57 %. El autor advierte explicitamente de que no debe tratarse como una copia mas exacta de los pesos QAT.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones de fidelidad publicadas para este build que permitan acotarlo.
- Contexto limitado en la configuracion de ejemplo: el comando de servicio usa 8192 tokens. La longitud de contexto nativa del modelo base no figura en la informacion disponible.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingue en produccion.
- Dependencia de hardware y software: la ejecucion nativa FP8 exige GPU con tensor cores FP8 y una version de vLLM con soporte de cuantizacion dinamica FP8 de `compressed-tensors`. En otros entornos el rendimiento no esta documentado.
- Restricciones de licencia: licencia Gemma. Antes de un uso comercial hay que revisar los terminos de uso de Gemma de Google, que imponen obligaciones adicionales (por ejemplo, condiciones de redistribucion y politicas de uso aceptable) distintas de las de una licencia permisiva tipo Apache 2.0 o MIT.
- Sin validacion de terceros: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks de calidad ni pruebas independientes publicadas.
- No apto para entrenamiento ni ajuste fino: es un checkpoint cuantizado para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text
- Variante W4A16 solo texto del mismo autor: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text
- Checkpoint base sin cuantizar: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Repack W4A16 de Gemma 4 26B-A4B del mismo autor: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Pagina de la familia Gemma 4 en HuggingFace: https://huggingface.co/google/gemma-4-E4B
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Blog de Google sobre el entrenamiento con cuantizacion (QAT) de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Gemma 4 E4B-it QAT en Ollama: https://ollama.com/library/gemma4:e4b-it-qat
