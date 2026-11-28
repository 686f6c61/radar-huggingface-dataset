# willyb23/NorthCUA-Mini-NVFP4A16

## Resumen

NorthCUA-Mini-NVFP4A16 es una cuantizacion no oficial de beipo-ai/NorthCUA-Mini, un modelo de mezcla de expertos (MoE) de 35.107.181.936 parametros totales con aproximadamente 3.000 millones de parametros activos por token, construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario de Hugging Face willyb23 como cuantizacion de comunidad, sin afiliacion con el equipo NorthCUA ni con Qwen, y su proposito es reducir el peso del checkpoint original de 70,2 GB a 23,9 GB para facilitar el despliegue en una sola GPU.

El modelo resuelve un problema concreto de despliegue: el original en BF16 requiere al menos 70 GB de pesos, lo que obliga a GPUs de gama muy alta o a repartir el modelo entre varias tarjetas. Esta version almacena unicamente los expertos enrutados en NVFP4 (FP4 E2M1 con escalas FP8 por cada 16 pesos y una escala global FP32 por matriz), manteniendo atencion, atencion lineal Gated DeltaNet, experto compartido, router, embeddings, LM head y codificador de vision en BF16. El resultado son 22,3 GiB de pesos en memoria de GPU bajo vLLM, lo que deja margen para contextos largos en una sola tarjeta.

La relevancia actual es doble: por un lado, demuestra el flujo de cuantizacion NVFP4 con compressed-tensors y su integracion directa en vLLM sin flags adicionales; por otro, mantiene las capacidades de computer-use y agentes del modelo base, incluyendo entrada image-text-to-text, tool calling y modo de razonamiento. La licencia Apache 2.0 del modelo base se conserva en esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE sobre Qwen3.5 (qwen3_5_moe), con atencion lineal Gated DeltaNet y codificador de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (3B active) |
| Longitud de contexto | 65.536 tokens en la configuracion de despliegue documentada (--max-model-len 65536); el maximo nativo del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | NVFP4A16: expertos enrutados en NVFP4 (pesos FP4 E2M1, escala FP8 E4M3 por cada 16 pesos, escala global FP32 por matriz); resto en BF16; activaciones en BF16 (weight-only) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato compressed-tensors nvfp4-pack-quantized |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos enrutados por capa y 40 capas, con proyecciones gate, up y down por experto, mas un experto compartido, router, atencion estandar y atencion lineal Gated DeltaNet, junto con un codificador de vision y un merger para entrada image-text-to-text. Esta cuantizacion no reentrena ni calibra: aplica round-to-nearest sin datos (data-free) usando las funciones NVFP4 de compressed-tensors, procesando una matriz de experto cada vez, ya que el original almacena los expertos fusionados y aqui se separan por experto. Se parte de los pesos BF16 publicados en la revision ca2b95a.

El detalle tecnico relevante es que, para cada experto, las proyecciones gate y up comparten una unica escala global, de modo que vLLM las fusiona en una sola matriz y mantiene una escala para ambas. El error relativo de pesos medido (norma de Frobenius sobre expertos muestreados en cada shard) es del 9,49 % de media y del 9,55 % en el peor caso, valor tipico de NVFP4 con round-to-nearest. El resto de componentes, incluido el codificador de vision, permanece en BF16 sin cambios. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, numero de tokens, composicion ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto, controlable mediante `reasoning_effort` en la plantilla de chat (el modelo base Nano usa `enable_thinking`; Mini usa `reasoning_effort`).
- Comprension de imagenes y capturas de pantalla (pipeline image-text-to-text), orientada a computer-use: interpretacion de dialogos, botones y elementos de interfaz.
- Tool calling y function calling, con soporte en vLLM mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Uso como agente multi-paso para automatizacion de interfaz grafica, con coordenadas GUI en espacio normalizado 0-1000 (`normalized_1000`).
- Razonamiento matematico basico y de varios pasos (el ejemplo de la model card resuelve un problema de velocidad y distancia).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa compatible con el drafter DFlash de z-lab (Qwen3.5-35B-A3B-DFlash, 0,77 GB), que acelera la generacion hasta aproximadamente el doble sin cambiar la salida del modelo.

## Casos de uso

- Automatizacion de escritorio y computer-use: el modelo interpreta capturas de pantalla y emite acciones con coordenadas normalizadas 0-1000 que el NorthCUA Harness convierte a pixeles, lo que permite construir agentes que operan aplicaciones reales sin integraciones por API.
- Agentes de soporte que rellenan formularios: con vision y tool calling, el modelo puede leer un formulario en pantalla, identificar campos y emitir las llamadas de funcion necesarias para completarlos, manteniendo el contexto de la conversacion hasta 65.536 tokens.
- Asistente de QA sobre interfaces: dado un dialogo o una pantalla, responde que pide y que botones ofrece; util para documentacion automatica de flujos de UI o para generar guias de usuario a partir de capturas.
- Despliegue en una sola GPU de gama profesional: con 22,3 GiB de pesos en vLLM sobre una RTX PRO 6000 Blackwell (96 GB), queda margen para contexto largo y KV cache, lo que permite servir el modelo en infraestructura de una unica tarjeta en lugar de requerir reparto multi-GPU.
- Pipelines de agentes con herramientas externas: la integracion con el parser `qwen3_coder` y el modo de razonamiento permite encadenar pasos de planificacion y ejecucion en orquestadores tipo OpenAI API, por ejemplo para consultar APIs internas o bases de datos.
- Aceleracion de inferencia en produccion: combinado con el drafter DFlash, el modelo puede duplicar su velocidad de generacion manteniendo la calidad de salida, lo que resulta adecuado para tareas interactivas donde la latencia importa.
- Evaluacion e investigacion de cuantizacion: al ser una cuantizacion NVFP4 de referencia con error de pesos documentado (9,49 % medio), sirve para comparar el impacto de FP4 en tareas de vision y agentes frente al modelo BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta el error relativo de pesos de la cuantizacion (9,49 % de media, 9,55 % maximo, norma de Frobenius) y el tamano del checkpoint (de 70,2 GB a 23,9 GB; 22,3 GiB en GPU bajo vLLM).

## Requisitos de hardware

- VRAM estimada para inferencia: 22,3 GiB solo de pesos en vLLM; el total real depende de la longitud de contexto y del tamano de la KV cache. Con `--max-model-len 65536` se ha probado en una RTX PRO 6000 Blackwell de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la configuracion validada por el autor; cualquier GPU con soporte de kernels FP4 MoE en vLLM (arquitectura Blackwell) y al menos 24-32 GB de VRAM es candidata, aunque no se documentan pruebas en otras tarjetas.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el checkpoint de 23,9 GB en disco sugiere que podria caber en GPUs de 24 GB solo con contexto corto y sin margen para KV cache, pero no hay validacion publicada.
- Opciones de despliegue: vLLM 0.32.0 (recomendado, detecta automaticamente el kernel Marlin FP4 MoE para este formato), imagen Docker `vllm/vllm-openai:v0.32.0`, API compatible con OpenAI. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numerica; la model card indica que la generacion con decodificacion especulativa DFlash es hasta aproximadamente el doble de rapida que sin ella.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NorthCUA-Mini-NVFP4A16 (esta ficha) | 35,1B | ~3B | 65.536 (config. vLLM) | NVFP4A16, 23,9 GB | Apache 2.0 | Hugging Face, vLLM 0.32 |
| beipo-ai/NorthCUA-Mini (base) | 35,1B | ~3B | No disponible | BF16, 70,2 GB | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.5-35B-A3B-DFlash | No disponible (drafter de 0,77 GB) | No disponible | No disponible | No disponible | No disponible | Hugging Face, drafter especulativo |

La comparativa se limita al modelo base y al drafter compatible, que son los unicos modelos referenciados en la informacion disponible. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Cuantizacion no oficial: no esta afiliada ni respaldada por el equipo NorthCUA ni por Qwen; el soporte y la validacion corren a cargo de la comunidad.
- Perdida de precision: el error relativo de pesos del 9,49 % (hasta 9,55 %) es tipico de NVFP4 round-to-nearest sin calibracion; puede degradar tareas sensibles a precision fina, especialmente en computer-use donde los errores de coordenadas importan.
- Sin datos de calibracion: la cuantizacion es data-free, por lo que no se ha optimizado para ningun dominio concreto.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos generativos; en computer-use puede traducirse en acciones erroneas sobre la interfaz.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: el contexto validado es de 65.536 tokens en la configuracion de vLLM; los idiomas soportados no se detallan.
- Requisitos de formato: las coordenadas GUI deben mantenerse en espacio normalizado 0-1000 y convertirse a pixeles con el NorthCUA Harness; usarlas directamente como pixeles produce fallos.
- Gestion del modo de pensamiento: con el parser `qwen3` de vLLM hay que enviar tanto `reasoning_effort` como `enable_thinking` para desactivar el razonamiento; con solo `reasoning_effort` la respuesta llega en el campo `reasoning` y `content` queda vacio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los pesos derivados.
- Dependencia de hardware: el rendimiento depende de kernels FP4 disponibles en vLLM sobre GPUs Blackwell; en otras arquitecturas el comportamiento no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willyb23/NorthCUA-Mini-NVFP4A16
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Drafter especulativo DFlash: https://huggingface.co/z-lab/Qwen3.5-35B-A3B-DFlash
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- NorthCUA Harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
