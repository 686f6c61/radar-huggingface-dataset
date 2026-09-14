# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-FromFP8MTP-pr3118-validation

## Resumen

Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-FromFP8MTP-pr3118-validation es un checkpoint de validacion publicado por el usuario soyrsoyr a partir del modelo nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. No se trata de un modelo entrenado desde cero, sino de una conversion de formato: el autor parte de un checkpoint intermedio con el backbone en BF16 y la cabeza de MTP (multi-token prediction) convertida a FP8 de bloques, lo desquantiza y lo vuelve a cuantizar a NVFP4A16. El resultado son 32.245.782.080 parametros (~32,2 B) en formato safetensors compatible con compressed-tensors y llm-compressor.

El nombre del repositorio indica una arquitectura etiquetada como nemotron_h en Transformers, con nomenclatura MoE del tipo A3B, es decir, un modelo de mezcla de expertos con aproximadamente 3.000 millones de parametros activos sobre un total de unos 30 B. La relevancia de esta ficha es acotada: el propio autor advierte de que la validacion realizada en H100 confirma unicamente que la carga del modelo y la generacion funcionan, con metricas reales de tokens borrador de MTP, y que no constituye un benchmark de calidad ni de rendimiento. Ademas, la cuantizacion MXFP4 requiere validacion propia en hardware B200.

Es, por tanto, un artefacto orientado a reproducibilidad e integracion en pipelines de cuantizacion (PR 3118 de llm-compressor) mas que un modelo listo para produccion. Quien lo descargue debe ser consciente de que hereda las caracteristicas y limitaciones del modelo base de NVIDIA y de que este snapshot no anade ninguna concesion de licencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (identificador de arquitectura en Transformers); familia MoE segun la nomenclatura A3B |
| Parametros totales | 32.245.782.080 (~32,2 B) |
| Parametros activos | ~3 B (segun la nomenclatura "A3B" del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4, activaciones de 16 bits, solo pesos); el checkpoint de origen usaba FP8 de bloques dinamico para el MTP y BF16 para el backbone; MXFP4 con cuantizacion dinamica de activaciones |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (el autor indica que no se anade ninguna concesion adicional sobre la del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 33,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |

## Arquitectura y entrenamiento

El modelo parte de nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, cuyo identificador de arquitectura en Transformers es `nemotron_h`. El nombre del checkpoint base indica un diseno de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token sobre un total de unos 30 B, orientado a reducir el coste computacional por token manteniendo la capacidad de un modelo denso de mayor tamano. En esta ficha no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica relevante de este snapshot no esta en la arquitectura, sino en el proceso de conversion. El autor partio de un checkpoint derivado de test en el que el backbone se mantenia en BF16 y la cabeza de MTP se habia convertido a FP8 de bloques nativo, desquantizo ese material y lo volvio a cuantizar al formato solicitado, NVFP4A16: pesos en FP4 con activaciones de 16 bits, en modo weight-only, no una cuantizacion NVFP4 W4A4 calibrada. La implementacion se apoya en el PR 3118 de llm-compressor (commit `87347881`) y en compressed-tensors. El autor advierte explicitamente de que los formatos del backbone y del MTP son independientes y deben inspeccionarse en `config.json`, `recipe.yaml` y `pr3118-validation.json`. El modelo incorpora una cabeza de prediccion multi-token (MTP) utilizable como mecanismo de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican soporte de dialogos multi-turno.
- Decodificacion especulativa mediante MTP: el checkpoint incluye la cabeza de multi-token prediction, y se valido con `num_speculative_tokens: 1` en vLLM.
- Inferencia cuantizada a NVFP4A16 en vLLM: el autor valido carga y generacion en H100 con metricas positivas de tokens borrador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: el comando de despliegue validado desactiva explicitamente las entradas de imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0"}'`), por lo que en esta validacion no se emplea entrada multimodal.
- Razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Validacion de recetas de cuantizacion: el caso de uso principal del artefacto es reproducir el pipeline del PR 3118 de llm-compressor y comprobar la conversion de FP8 dinamico a NVFP4A16 en un modelo MoE de 32 B, incluyendo la cabeza de MTP.
- Pruebas de decodificacion especulativa con MTP: utilizando el script `verify_mtp.py` incluido en el repositorio, se puede comprobar que las metricas de tokens borrador son positivas antes de integrar el mecanismo en un pipeline de inferencia.
- Integracion en vLLM para entornos de investigacion: el comando validado permite levantar un servidor compatible con la API de OpenAI sobre H100 con `--max-model-len 1024`, util para pruebas de humo y comparaciones de latencia.
- Evaluacion comparativa de formatos de cuantizacion: sirve como punto de partida para medir el impacto de NVFP4A16 frente al checkpoint BF16 de referencia, siempre que se aporten benchmarks propios, ya que el autor no publica ninguno.
- Experimentacion con modelos MoE de activacion dispersa: al activar aproximadamente 3 B de parametros por token, es adecuado para estudiar el equilibrio entre coste de inferencia y calidad en un MoE de ~32 B.
- Base para pipelines de generacion de texto en castellano u otros idiomas: no se puede confirmar la idoneidad multilingue con la informacion disponible; seria necesario evaluar el modelo base antes de usarlo en produccion.
- Despliegue en produccion con atencion al cliente o generacion de codigo: no recomendado a partir de este artefacto, ya que el autor indica que la validacion no es un benchmark de calidad y que el checkpoint de origen no es un release oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica literalmente que la validacion en H100 con carga y generacion correctas "no es un benchmark de calidad ni de rendimiento", y que la prueba superada es unicamente la emision de metricas positivas de tokens borrador de MTP, no la calidad de las respuestas.

| Prueba | Resultado |
|---|---|
| Carga y generacion en H100 | PASSED (segun el autor) |
| Metricas de tokens borrador de MTP | positivas (segun el autor) |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | no disponibles |
| Entorno validado | `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0, CUDA 13.0 |

## Requisitos de hardware

- Peso en disco: el snapshot ocupa 33,1 GB, ya que incluye de forma separada los formatos del backbone y del MTP.
- VRAM estimada para los pesos: con NVFP4A16 (4 bits por peso, weight-only) los pesos puros de un modelo de 32,2 B rondarian los 16 GB; esa cifra es una estimacion aritmetica y no una medicion publicada por el autor.
- El tamano del repositorio (33,1 GB) sugiere que no todos los pesos estan en FP4, por lo que la VRAM real necesaria dependeria de que componentes se carguen en cada formato.
- GPU validadas: H100 para NVFP4A16. El propio autor indica que la variante MXFP4 requiere que cada usuario valide la compatibilidad de ejecucion en su hardware B200.
- GPU de consumo: no disponible. Con la informacion proporcionada no se puede confirmar que quepa en una RTX 4090 u otra GPU consumer, dado el tamano del modelo y la ausencia de datos de contexto y de KV cache.
- Opciones de despliegue: vLLM es el unico runtime validado por el autor. El modelo tambien declara compatibilidad con la libreria Transformers y con compressed-tensors. No se mencionan llama.cpp, Ollama, TGI ni GGUF.
- Configuracion validada en vLLM:
  ```
  vllm serve soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-FromFP8MTP-pr3118-validation \
    --dtype bfloat16 --max-model-len 1024 --enforce-eager \
    --gpu-memory-utilization 0.85 \
    --speculative-config '{"method":"mtp","num_speculative_tokens":1}' \
    --limit-mm-per-prompt '{"image":0,"video":0}'
  ```
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con su modelo base y con el checkpoint intermedio del que deriva. No se dispone de datos de otros modelos comparables.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-FromFP8MTP-pr3118-validation | ~32,2 B | no disponible | NVFP4A16 (safetensors, compressed-tensors) | openmdw-1.1 | Validacion de autor, 33,1 GB |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | no disponible | no disponible | BF16 | no disponible | Modelo base oficial |
| Checkpoint intermedio con MTP en FP8 nativo | no disponible | no disponible | Backbone BF16 + MTP FP8 de bloques | no disponible | Derivado de test, no es un release oficial de FP8 |

## Limitaciones y advertencias

- No es un benchmark de calidad: el autor senala expresamente que la prueba superada es la carga y generacion con metricas de tokens borrador, no la calidad ni el rendimiento del modelo.
- No es un release oficial: el checkpoint FP8 de origen era un artefacto derivado de test, no una publicacion oficial de NVIDIA.
- Sin datos de evaluacion: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de calidad, por lo que no se puede estimar su comportamiento real.
- Licencia: se aplica la licencia del modelo de origen (openmdw-1.1); el autor indica que esta validacion no anade ninguna concesion de licencia adicional. Es imprescindible revisar la model card del modelo base antes de cualquier uso comercial.
- Idiomas: no se especifica que idiomas soporta, lo que impide garantizar un rendimiento adecuado en castellano.
- Contexto limitado en la validacion: el comando validado usa `--max-model-len 1024`, muy por debajo de lo habitual en produccion; no hay datos sobre la ventana de contexto nativa del modelo base.
- Compatibilidad MXFP4 no verificada: el autor advierte de que la variante MXFP4 requiere que cada usuario establezca su propia compatibilidad de ejecucion en B200.
- Formato fragmentado: el backbone y el MTP usan formatos distintos; es necesario inspeccionar `config.json`, `recipe.yaml` y `pr3118-validation.json` para entender exactamente que se carga.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; debe asumirse el comportamiento heredado del modelo base de NVIDIA.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Fechas del repositorio: creado y actualizado el 14 de septiembre de 2026, con una ventana de publicacion muy estrecha entre ambas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-FromFP8MTP-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/tree/a9904d24bcc1d289a1950fa9d2b978c47cf903b9
- Implementacion de cuantizacion (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Script de verificacion de MTP: `verify_mtp.py`, incluido en el snapshot del repositorio.
