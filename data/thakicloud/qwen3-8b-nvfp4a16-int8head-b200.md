# ThakiCloud/Qwen3-8B-NVFP4A16-INT8Head-B200

## Resumen

Qwen3-8B-NVFP4A16-INT8Head-B200 es un checkpoint cuantizado del modelo Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`), publicado por ThakiCloud. La receta coloca todas las capas lineales del decodificador en NVFP4A16 (pesos FP4 E2M1, grupo de tamano 16, activaciones de 16 bits, GPTQ) y unicamente el `lm_head` en INT8 weight-only simetrico con grupo de 128. Los embeddings permanecen en BF16. Internamente el checkpoint se denomina A82 (experimento D82, candidato H0) y emplea el formato `compressed-tensors`, con un tamano efectivo de 5,65 bits por peso sobre el modelo completo (5.784.430.720 bytes).

El objetivo declarado es reducir la huella de memoria frente a un checkpoint anterior del mismo autor (A81, que mantiene 46 unidades fusionadas en INT8): A82 ocupa 5,438 GiB de pesos en una NVIDIA B200, 0,479 GiB menos que A81. Sobre un conjunto final independiente (FINAL-82, 10.210 items con gating) se realizo un test de no inferioridad preregistrado de una sola cola: la diferencia pareada de exactitud fue de +0,71 puntos (IC 95 %: +0,10 a +1,31) frente a un margen de −1,5 puntos.

La relevancia es acotada y experimental: el autor lo marca explicitamente como release de investigacion, validado solo en un escenario estrecho (una B200, vLLM 0.29.0, modo thinking desactivado, contexto 8.192, decodificacion greedy) y sin evaluacion de seguridad ni de dominio. No hay que confundir el nombre comercial "8B" con el recuento real del checkpoint: los safetensors suman 4.717.851.648 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizacion post-entrenamiento con `compressed-tensors` |
| Parametros totales | 4.717.851.648 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens verificados (`max_model_len`); contexto nativo del modelo base no verificado en esta ficha |
| Tipos de cuantizacion | NVFP4A16 en 252 modulos lineales del decodificador (144 capas fusionadas servidas); INT8 weight-only en `lm_head`; embeddings en BF16; 5,65 bits efectivos por peso |
| Idiomas soportados | coreano (ko) e ingles (en), segun la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con metadatos `compressed-tensors` (repo de 5,8 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only de la familia Qwen3. Sobre el se aplica cuantizacion post-entrenamiento sin ningun reentrenamiento: solo calibracion, con el mismo fichero de calibracion que el checkpoint A81. Las 252 capas lineales del decodificador (servidas como 144 capas fusionadas) usan NVFP4A16 con GPTQ, es decir, pesos en FP4 E2M1 con grupo de tamano 16 y activaciones de 16 bits. El `lm_head` se mantiene en INT8 simetrico con grupo de 128, y los embeddings en BF16. A diferencia de A81, A82 no conserva ninguna unidad del cuerpo protegida en INT8: las 46 unidades fusionadas que A81 mantenia en INT8 (41 de atencion, 5 de MLP) vuelven a NVFP4A16.

El checkpoint se construyo en un entorno fijado (81 paquetes fijados, `llm-compressor` 0.15.0, `compressed-tensors` 0.20.1) y se verifico recargandolo en un pod limpio. En la validacion, las 144 capas cuantizadas se ejecutaron en el kernel MarlinNvFp4 y el `lm_head` en el kernel Marlin INT8, sin fallback a coma flotante, sobre B200 con vLLM 0.29.0. El autor publica un identificador de checkpoint (SHA-256 del fichero `SHA256SUMS`, valor `75d946805952a82c82e616c7e31ec54e8293b7aad4920fd9c233910d268eefd2`) que cubre siete ficheros: `chat_template.jinja`, `config.json`, `generation_config.json`, `model.safetensors`, `recipe.yaml`, `tokenizer.json` y `tokenizer_config.json`.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen3-8B.
- Razonamiento en modo thinking: el modelo base lo soporta, pero esta ficha y todas las mediciones del autor se realizaron con `enable_thinking=False`; el modo thinking no esta verificado en este checkpoint.
- Generacion de codigo y matematicas: capacidades del modelo base, no evaluadas de forma especifica en este checkpoint.
- Soporte multilingue limitado a coreano e ingles segun la model card; el resto de idiomas del modelo base no esta verificado.
- Compatibilidad con la API OpenAI a traves de `vllm serve` (endpoint `/v1/chat/completions`), incluyendo `chat_template_kwargs` para controlar el modo thinking.
- Tool calling y function calling: no verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Vision y audio: no disponibles (modelo solo de texto).

## Casos de uso

- Despliegue de chat en coreano e ingles sobre GPU Blackwell: el checkpoint reduce la memoria de pesos a 5,438 GiB en B200, lo que permite servir Qwen3-8B con mayor margen de KV cache dentro de la misma GPU. Adecuado para asistentes conversacionales con contexto de hasta 8.192 tokens.
- Prototipado de investigacion en cuantizacion de baja precision: sirve como referencia reproducible (checkpoint ID verificado, receta publicada, `recipe.yaml` incluido) para estudiar el impacto de NVFP4A16 con `lm_head` en INT8 frente a mezclas con unidades INT8 protegidas.
- Evaluacion comparativa de recetas de cuantizacion: el par A81/A82 permite medir el efecto de devolver 46 unidades fusionadas de INT8 a NVFP4A16 manteniendo el resto del pipeline fijo.
- Servicio interno de generacion de texto con vLLM: la integracion con la API OpenAI permite sustituir un endpoint existente cambiando solo el nombre del modelo, con decodificacion greedy para respuestas deterministas.
- Generacion de codigo en pipelines internos: el modelo base tiene capacidad de codigo, aunque este checkpoint no se ha evaluado en esa tarea; utilizable solo en entornos donde la no verificacion sea aceptable.
- Experimentos de throughput en B200: el autor midio el motor offline de vLLM con 1, 8 y 32 peticiones concurrentes, lo que permite usar el checkpoint como base para pruebas de capacidad, teniendo en cuenta que a 32 peticiones concurrentes BF16 supero en throughput agregado a las tres variantes cuantizadas.

## Benchmarks y rendimiento

Los unicos datos publicados son la comparacion pareada A82 frente a A81 sobre el conjunto FINAL-82 (10.210 items con gating), con decodificacion greedy, `enable_thinking=False`, `max_model_len` 8.192, batch 8 y semilla 0:

| Metrica | Resultado |
|---|---|
| Diferencia de exactitud pareada (A82 − A81) en FINAL-82 | +0,71 puntos (IC 95 %: +0,10 a +1,31) |
| Margen de no inferioridad preregistrado | −1,5 puntos (test de una sola cola) |
| Diferencia en el conjunto de seleccion SEL-82, eje de razonamiento | −3,47 puntos (A82 peor) |
| Memoria de pesos en B200 | 5,438 GiB (0,479 GiB menos que A81) |
| Throughput agregado a 32 peticiones concurrentes | BF16 fue el mas alto de las tres variantes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que los ejes numerico y de razonamiento se declararon con potencia estadistica insuficiente antes de ver resultados, y que no se preregistro ningun test de superioridad, por lo que no se afirma que A82 sea mas preciso que A81.

## Requisitos de hardware

- VRAM estimada para pesos: 5,438 GiB en B200 segun el autor; el repo ocupa 5,8 GB en disco.
- GPU verificada: una unica NVIDIA B200. No verificado en otras GPU, incluidas otras variantes Blackwell, Hopper o anteriores.
- GPU consumer: no verificada. Los kernels MarlinNvFp4 y Marlin INT8 requieren soporte de FP4, por lo que no hay evidencia de funcionamiento en RTX 4090 u otras consumer.
- Motor de servicio: vLLM 0.29.0 (`vllm/vllm-openai:v0.29.0`, torch 2.13.0+cu130), con `VLLM_BATCH_INVARIANT` sin definir. No verificado en otras versiones de vLLM, Transformers, TGI, SGLang ni llama.cpp.
- Parametros de servicio medidos: `--max-model-len 8192 --gpu-memory-utilization 0.90 --generation-config vllm`.
- Concurrencia medida: motor offline a 1, 8 y 32 peticiones concurrentes. No se midio latencia del servidor HTTP.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada, salvo la observacion de que BF16 supero en throughput agregado a las variantes cuantizadas a 32 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-8B-NVFP4A16-INT8Head-B200 (A82) | 4.717.851.648 | 8.192 verificados | NVFP4A16 + INT8 en `lm_head` | Apache 2.0 | Experimental, validado solo en B200 |
| Qwen3-8B-NVFP4A16-INT8-Mixed-B200 (A81) | no disponible en la informacion | 8.192 (mismo entorno de evaluacion) | NVFP4A16 + 46 unidades en INT8 | Apache 2.0 | Experimental, checkpoint previo del mismo autor |
| Qwen/Qwen3-8B (BF16) | no disponible en la informacion | no disponible en la informacion | BF16 | Apache 2.0 | Modelo base oficial |

La comparacion disponible se limita al eje de memoria y a la no inferioridad de A82 frente a A81. No hay datos publicados que permitan comparar con otras familias de modelos del mismo tamano.

## Limitaciones y advertencias

- Release experimental: el autor indica que no ha sido validado ni aprobado para produccion ni para servicio comercial, y que no ha pasado evaluacion de seguridad ni de dominio.
- Ambito de validacion estrecho: una B200, vLLM 0.29.0, decodificacion greedy, `enable_thinking=False`, contexto 8.192 y concurrencia offline. Cualquier otro stack puede cargar el fichero con kernels distintos o caer a coma flotante, con precision y velocidad diferentes.
- Razonamiento: en el conjunto de seleccion SEL-82, A82 quedo 3,47 puntos por detras de A81 en el eje de razonamiento; los ejes numerico y de razonamiento se declararon con potencia insuficiente.
- Throughput: a 32 peticiones concurrentes, BF16 supero en throughput agregado a las tres variantes, por lo que la cuantizacion no garantiza ventaja de velocidad en todos los escenarios.
- Idiomas: solo coreano e ingles declarados; el comportamiento en castellano no esta verificado.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinacion para este checkpoint; hereda los del modelo base, no auditados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el aviso del autor desaconseja explicitamente el servicio comercial sin validacion adicional.
- Integridad: la verificacion debe hacerse contra el fichero `SHA256SUMS` y el checkpoint ID `75d94680…`; las tarjetas y el propio `SHA256SUMS` no estan cubiertos por el hash.
- `generation_config.json` conserva los valores de muestreo de Qwen3 (temperatura 0,6, top-p 0,95, top-k 20); las mediciones del autor lo ignoraron con `--generation-config vllm`, por lo que los resultados no reflejan el comportamiento por defecto del fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Qwen3-8B-NVFP4A16-INT8Head-B200
- Model card en coreano: https://huggingface.co/ThakiCloud/Qwen3-8B-NVFP4A16-INT8Head-B200/blob/main/MODEL_CARD.ko.md
- Checkpoint previo A81: https://huggingface.co/ThakiCloud/Qwen3-8B-NVFP4A16-INT8-Mixed-B200
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
