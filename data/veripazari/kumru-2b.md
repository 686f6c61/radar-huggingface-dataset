# veripazari/Kumru-2B

## Resumen

Kumru-2B es la variante ligera de la familia Kumru LLM, un conjunto de modelos de lenguaje entrenados desde cero para turco por VNGRS (vngrs-ai). Esta ficha corresponde a la version instruct fine-tuned, publicada originalmente por vngrs-ai y archivada en el repositorio `veripazari/Kumru-2B` por la plataforma VeriPazarı con el objetivo de preservar la documentacion y los metadatos originales. El modelo emplea una arquitectura transformer tipo Mistral (tag `mistral` en Hugging Face) con 2.375.138.304 parametros y una longitud de contexto nativa de 8.192 tokens.

El problema que aborda es la ineficiencia de los tokenizadores multilingues sobre texto turco: un tokenizador nativo permite representar mas contenido en la misma ventana de contexto y reducir coste y latencia de inferencia. Segun la model card, el tokenizador BPE de Kumru, con vocabulario de 50.176 tokens, hace que otros modelos open source consuman entre un 38 % y un 98 % mas tokens para el mismo texto.

Es relevante para desarrolladores que necesiten un modelo pequeno, con licencia Apache 2.0 y orientado especificamente al turco, con soporte de plantilla de chat y ajuste supervisado sobre 1M de ejemplos. El modelo base preentrenado se distribuye por separado como `vngrs-ai/Kumru-2B-Base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `mistral` en Hugging Face) |
| Parametros totales | 2.375.138.304 (2,38B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card identifica el modelo con la etiqueta `mistral`, lo que apunta a una arquitectura transformer decoder-only con el diseno habitual de la familia Mistral (atención con ventana deslizante y RoPE, aunque la documentacion proporcionada no detalla estos extremos). El modelo se entrena desde cero para turco, no es un fine-tuning de un modelo multilingue existente. El preentrenamiento se realizo sobre un corpus limpio y deduplicado de 500 GB durante 300B tokens, y posteriormente se aplico un ajuste supervisado (SFT) sobre 1M de ejemplos. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales.

La innovacion tecnica destacada es el tokenizador: un BPE moderno con vocabulario de 50.176 tokens, regex de pre-tokenizacion y plantilla de chat integrada, disenado especificamente para turco y con soporte para codigo y matematicas. La model card afirma que la longitud de contexto efectiva del modelo equivale a entre 1.128 y 1.618 tokens de otros modelos multilingues, en terminos de capacidad de representacion por token. No se mencionan tecnicas como decodificacion especulativa, atención lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en turco con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas en turco, incluyendo dominio cultural e historico (el ejemplo de la model card consulta sobre el yacimiento de Efes).
- Soporte de codigo y matematicas a traves del tokenizador disenado para esos dominios.
- Correccion de errores gramaticales y resumen de texto, tareas en las que la model card indica que destaca frente a modelos mayores.
- Capacidades multilingues: limitadas al turco segun el campo `language` del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Atencion al cliente en turco: el modelo puede mantener conversaciones multi-turno con hasta 8.192 tokens de contexto y una plantilla de chat nativa, lo que simplifica la integracion en backends de soporte sin necesidad de ingenieria de prompts adicional.
- Generacion de contenido editorial en turco: redaccion y resumen de articulos aprovechando la eficiencia del tokenizador nativo, que reduce el numero de tokens consumidos por documento y, por tanto, el coste por peticion.
- Correccion gramatical y de estilo: la model card senala que Kumru destaca en correccion de errores gramaticales, lo que lo hace adecuado para herramientas de revision de textos turcos.
- Procesamiento de documentacion tecnica con codigo: el tokenizador soporta codigo y matematicas, de modo que puede emplearse para explicar fragmentos de codigo o resolver problemas matematicos basicos en turco.
- Despliegue en entornos con recursos limitados: con 2,38B parametros y pesos en safetensors de aproximadamente 4,8 GB, el modelo cabe en GPUs de consumo y puede servir como alternativa local a APIs de modelos mayores para tareas en turco.
- Investigacion sobre tokenizacion y eficiencia: util como referencia para estudiar el impacto de un tokenizador nativo en la longitud efectiva de contexto y en el coste de inferencia frente a modelos multilingues.
- Fine-tuning especifico de dominio: al estar bajo Apache 2.0 y con un base preentrenado disponible (`vngrs-ai/Kumru-2B-Base`), sirve como punto de partida para adaptaciones a sectores concretos en turco.

## Benchmarks y rendimiento

La model card indica que Kumru-2B y Kumru-7B se evaluan en el benchmark Cetvel, y afirma que Kumru supera de forma global a modelos significativamente mayores como LLaMA-3.3-70B, Gemma-3-27B, Qwen-2-72B y Aya-32B, con especial ventaja en tareas de matices del turco como correccion gramatical y resumen. Sin embargo, los resultados numericos se presentan unicamente en una imagen incrustada en la model card y no se incluyen como tabla de valores en la informacion proporcionada, por lo que no es posible reproducir cifras concretas.

| Benchmark | Kumru-2B | Comparativas |
|---|---|---|
| Cetvel | resultados solo en imagen, no disponibles como cifras | LLaMA-3.3-70B, Gemma-3-27B, Qwen-2-72B, Aya-32B (sin cifras en el texto) |

No se han publicado resultados numericos de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8 GB para contexto corto y 12-16 GB para aprovechar los 8.192 tokens de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5-3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPUs recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090); A100 o H100 para despliegues con alta concurrencia.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16 y en practicamente cualquier GPU moderna con cuantizacion.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan en la informacion disponible variantes GGUF para llama.cpp u Ollama, ni soporte explicito de vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kumru-2B | 2,38B | 8.192 | Turco | Apache 2.0 | Tokenizador nativo turco, SFT sobre 1M de ejemplos |
| Kumru-7B | no disponible en la informacion | no disponible | Turco | no disponible en la informacion | Version mayor de la misma familia, con demo en kumru.ai |
| LLaMA-3.3-70B | 70B | no disponible | Multilingue | licencia Llama | Citado en la model card como superado por Kumru en Cetvel |
| Gemma-3-27B | 27B | no disponible | Multilingue | licencia Gemma | Citado en la model card como superado por Kumru en Cetvel |
| Qwen-2-72B | 72B | no disponible | Multilingue | no disponible en la informacion | Citado en la model card como superado por Kumru en Cetvel |
| Aya-32B | 32B | no disponible | Multilingue | no disponible en la informacion | Citado en la model card como superado por Kumru en Cetvel |

Las cifras de rendimiento comparativo proceden de la afirmacion cualitativa del autor y no se acompanan de valores numericos en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta disenado y entrenado exclusivamente para turco; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- La longitud de contexto efectiva declarada (entre 1.128 y 1.618 tokens equivalentes) es notablemente inferior a la nativa de 8.192, lo que limita el aprovechamiento real del contexto en tareas que exijan recuperar informacion de documentos largos.
- Riesgo de alucinacion inherente a un modelo de 2,38B parametros entrenado con SFT; no se documentan mecanismos de mitigacion como RLHF o DPO.
- No se documentan evaluaciones de sesgo, toxicidad o robustez, ni filtros de seguridad en la informacion proporcionada.
- El repositorio `veripazari/Kumru-2B` es un archivo de terceros del modelo original `vngrs-ai/Kumru-2B`; conviene verificar que los pesos y la documentacion coinciden con la version oficial antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, que permite uso comercial, la model card no incluye terminos adicionales ni garantias; el uso en produccion requiere validacion propia.
- No se documentan variantes cuantizadas oficiales ni soporte verificado en motores de inferencia distintos de transformers y TGI.
- El modelo no dispone de descargas ni likes en el momento de la consulta, lo que reduce la evidencia de uso en la comunidad.

## Enlaces

- Repositorio archivado en Hugging Face: https://huggingface.co/veripazari/Kumru-2B
- Repositorio original del autor: https://huggingface.co/vngrs-ai/Kumru-2B
- Version base preentrenada: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Demo del modelo de 7B: https://kumru.ai/
- Plataforma que aloja el archivo: https://veripazari.com.tr
- Dataset de entrenamiento: https://huggingface.co/datasets/vngrs-ai/vngrs-web-corpus
