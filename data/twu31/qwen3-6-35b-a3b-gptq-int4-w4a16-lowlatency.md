# Twu31/Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency

## Resumen

Twu31/Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency es una cuantizacion INT4 W4A16 del modelo Qwen/Qwen3.6-35B-A3B, un MoE hibrido con arquitectura Gated-DeltaNet (GDN) y vision, desarrollado por el usuario Twu31. A diferencia de otras cuantizaciones comunitarias que solo convierten los expertos enrutados a INT4, esta build tambien cuantiza las proyecciones GDN, atencion, expertos compartidos y lm_head, reduciendo el peso en memoria de 71,9 GB (BF16) a 21,5 GB en disco y 18,6 GiB en VRAM con vLLM. El objetivo es ofrecer baja latencia en servidores de chat interactivo con thinking desactivado, manteniendo una fidelidad cercana al modelo base BF16.

El checkpoint esta calibrado con datos conversacionales chinos coloquiales y utiliza el formato compressed-tensors, lo que permite cargarlo sin configuracion adicional en vLLM mediante el kernel Marlin W4A16 en GPUs con SM 8.0 o superior. En una RTX 5090, alcanza 3,3 ms por token (300 tok/s) en un solo stream, un 29 % mas rapido que las cuantizaciones que solo tocan expertos, y mantiene un TTFT de 53 ms. La licencia es Apache-2.0 y el modelo base es de Qwen, con soporte para texto e imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration: 40 capas (30 Gated-DeltaNet + 10 full-attention), 256 expertos enrutados top-8 + 1 experto compartido, torre de vision, cabezal MTP de 1 capa |
| Parametros totales | 35 B (modelo base); checkpoint cuantizado ~5,95 M de parametros en safetensors |
| Parametros activos | ~3 B |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa 12288 tokens, pero no se ha confirmado el maximo del modelo base) |
| Tipos de cuantizacion | INT4 W4A16 simetrico g128 (GPTQ, llm-compressor) en todos los nn.Linear del decoder de texto excepto excepciones; lm_head en INT8 g128; MTP head, torre de vision, router y gates GDN a/b en BF16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors (compatible con vLLM Marlin W4A16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE hibrido que combina 30 capas con Gated-DeltaNet (una variante de SSM con estado recurrente) y 10 capas de atencion full-attention. Tiene 256 expertos enrutados con top-8 y un experto compartido, ademas de una torre de vision que permite entrada de imagenes y un cabezal MTP (multi-token prediction) de una capa para decodificacion especulativa. La cuantizacion realizada por Twu31 aplica GPTQ simetrico con grupo 128 sobre todas las proyecciones lineales del decoder de texto, incluyendo las capas GDN, atencion y expertos compartidos, algo que las cuantizaciones comunitarias habituales no hacen (solo convierten los 256 expertos enrutados). El lm_head se cuantiza a INT8 g128, mientras que el cabezal MTP, la torre de vision, el router y los gates a/b de GDN se mantienen en BF16 para preservar la estabilidad numerica.

La calibracion se realizo con datos conversacionales chinos coloquiales multi-turno, renderizados con la plantilla del modelo y con thinking desactivado, lo que decide donde se concentra el error de redondeo. Segun el autor, en su banco de pruebas la fidelidad al modelo BF16 es al menos igual que la de un checkpoint sin calibracion (data-free RTN). No se proporcionan datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO).

## Capacidades

- Generacion de texto y chat multilingue en chino e ingles, con soporte de entrada de imagen (image-text-to-text).
- Razonamiento con modo thinking (activable o desactivable via plantilla), aunque esta cuantizacion esta optimizada para thinking off en escenarios de baja latencia.
- Decodificacion especulativa MTP opcional, con tasa de aceptacion medida de 52,7 % a k=2, aunque el autor recomienda no usarla en chats de respuestas cortas porque aumenta la latencia total por turno.
- Compatibilidad nativa con vLLM (probado en versiones 0.24.0 y 0.27.1) mediante el kernel Marlin W4A16 para MoE, sin configuracion adicional.
- Soporte de vision fuera de caja (la torre de vision permanece en BF16), con opcion de limitar los tokens de imagen via `--mm-processor-kwargs`.
- No se ha evaluado el uso de tool calling ni capacidades agente multi-paso en esta cuantizacion (segun la model card).

## Casos de uso

- Asistentes conversacionales de baja latencia: el modelo decodifica a 3,3 ms/token en una RTX 5090, lo que permite respuestas casi instantaneas en chats interactivos con thinking off.
- Backends de agentes de voz: la baja latencia por token (300 tok/s en un solo stream) es adecuada para pipelines de voz en tiempo real donde el tiempo de primera respuesta y la fluidez son criticos.
- Servicio concurrente con multiples streams: con 5 streams simultaneos alcanza 424 tok/s agregados (9,4 ms/token por stream), util para chatbots que atienden a varios usuarios en una sola GPU.
- Despliegue en GPUs de consumo: con 18,6 GiB de pesos, cabe en una RTX 4090 o RTX 5090 de 24-32 GB para tareas de texto con un presupuesto de KV moderado.
- Procesamiento de imagenes con texto: al mantener la torre de vision en BF16, puede responder preguntas sobre imagenes sin perder calidad visual, aunque no se ha evaluado formalmente.
- Chat con contexto largo en chino: la calibracion en datos conversacionales chinos lo hace especialmente adecuado para asistentes en ese idioma, con soporte de prefijos de hasta 12k tokens en el ejemplo de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica explicitamente que no se evaluaron benchmarks academicos. Sin embargo, se proporcionan mediciones de latencia y fidelidad propias del autor, realizadas en una RTX 5090 con vLLM 0.27.1, con un prompt de ~1,4k tokens y respuestas de 20-27 tokens. La tabla siguiente resume los datos de rendimiento comparando con el checkpoint "anchor" (la cuantizacion INT4 de solo expertos mas descargada de la comunidad, formato AWQ data-free RTN):

| Checkpoint | Pesos en vLLM | TTFT (ms) | Tiempo por turno (ms) | ms/token | Tokens/s |
|---|---|---|---|---|---|
| anchor (expertos INT4, data-free) | 22,2 GiB | 53 | 142 | 4,6 | 217 |
| esta build sin lm_head INT8 (solo cuerpo INT4) | 19,0 GiB | 58 | 148 | 3,6 | 278 |
| esta build (cuerpo INT4 + lm_head INT8) | 18,6 GiB | 53 | 134 | 3,3 | 303 |

Con 5 streams concurrentes, esta build alcanza 9,4 ms/token (424 tok/s agregados) frente a 12,2 ms/token (321 tok/s agregados) del anchor. La tasa de aceptacion MTP a k=2 es de 52,7 %, pero el autor desaconseja su uso en chats de respuestas cortas porque aumenta la latencia total por turno (159 ms frente a 134 ms sin MTP).

## Requisitos de hardware

- VRAM estimada: 18,6 GiB de pesos en vLLM con lm_head INT8; 19,0 GiB sin lm_head INT8. Cabe en una GPU de 24 GB para texto con un presupuesto de KV modesto (por ejemplo, 12k tokens de contexto). En una GPU de 32 GB con `--gpu-memory-utilization 0.85`, vLLM reporta 298k tokens de KV (equivalente a 24 peticiones de 12k tokens).
- GPUs compatibles: cualquier GPU con SM 8.0 o superior (Ampere o mas nueva). Se han probado RTX 30/40/50, A100/A800, L40S, RTX 6000 Ada, H100/H800. El kernel Marlin W4A16 requiere esta arquitectura.
- Opciones de despliegue: vLLM (probado en 0.24.0 y 0.27.1) con `--served-model-name`, `--max-model-len`, `--mamba-ssm-cache-dtype bfloat16` y `--reasoning-parser qwen3`. SGLang no ha sido probado. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput medidos: 3,3 ms/token (303 tok/s) en un solo stream con RTX 5090; 9,4 ms/token por stream con 5 streams concurrentes (424 tok/s agregados). TTFT de 53 ms para un prompt de ~1,4k tokens.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base disponibles en la comunidad, ya que no se dispone de datos de otros modelos MoE hibridos comparables (como Qwen3-30B-A3B) en la informacion proporcionada.

| Caracteristica | Esta build (Twu31) | Anchor (expertos INT4, data-free RTN, AWQ) | Base BF16 (Qwen/Qwen3.6-35B-A3B) |
|---|---|---|---|
| Parametros totales / activos | 35 B / ~3 B | 35 B / ~3 B | 35 B / ~3 B |
| Pesos en disco | 21,5 GB | 24,5-25,5 GB | 71,9 GB |
| Pesos en VRAM (vLLM) | 18,6 GiB | 22,2 GiB | no disponible |
| Cuantizacion | INT4 W4A16 (cuerpo completo) + INT8 lm_head | INT4 solo expertos, resto BF16 | BF16 |
| ms/token (RTX 5090, single stream) | 3,3 | 4,6 | no medido |
| TTFT (prompt 1,4k tokens) | 53 ms | 53 ms | no medido |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

La ventaja principal de esta build es la reduccion de latencia de decodificacion (29 % menos) manteniendo el mismo TTFT y una fidelidad al BF16 al menos igual que el anchor, segun el harness del autor. La desventaja es que requiere SM 8.0+ y no ha sido probada en SGLang.

## Limitaciones y advertencias

- No se ha evaluado en benchmarks academicos (MMLU, HumanEval, etc.), ni en tareas de razonamiento largo (chain-of-thought extenso), ni en uso agente con tool calling. La model card declara explicitamente que estos escenarios estan fuera del alcance de la evaluacion.
- El contexto se ha probado hasta 12k tokens en el ejemplo de despliegue, pero no se ha verificado el maximo del modelo base. Para contextos superiores, no hay garantias de calidad.
- La cuantizacion INT4 puede degradar la precision en tareas que requieran calculo numerico fino, aunque el autor afirma que la fidelidad al BF16 es al menos igual que la de cuantizaciones sin calibracion en su harness especifico.
- Solo soporta chino e ingles; no se ha evaluado el rendimiento en otros idiomas.
- El uso esta sujeto a la licencia Apache-2.0 del modelo base, que permite uso comercial pero puede tener restricciones adicionales en ciertos paises o sectores (consultar los terminos de Qwen).
- Riesgo de alucinacion y sesgos inherentes a los modelos de lenguaje, no mitigados por la cuantizacion. No se proporcionan evaluaciones de sesgo o seguridad.
- El cabezal MTP esta en BF16, pero la decodificacion especulativa con MTP aumenta la latencia total en chats de respuestas cortas (159 ms frente a 134 ms sin MTP), por lo que no se recomienda en ese escenario.
- La torre de vision permanece en BF16, lo que aumenta el uso de VRAM al procesar imagenes; no se ha evaluado el rendimiento con entradas visuales.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/Twu31/Qwen3.6-35B-A3B-GPTQ-INT4-W4A16-LowLatency
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
