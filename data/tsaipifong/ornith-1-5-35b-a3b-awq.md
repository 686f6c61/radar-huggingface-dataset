# tsaipifong/Ornith-1.5-35B-A3B-AWQ

## Resumen

Ornith-1.5-35B-A3B-AWQ es una cuantizacion comunitaria no oficial del modelo multimodal ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario tsaipifong. Se trata de una version de 4 bits en el esquema W4A16 (pesos en int4 simetrico, activaciones en 16 bits, grupo de tamano 128) generada con AWQ y empaquetada en el formato compressed-tensors, pensada especificamente para su uso con vLLM en una unica tarjeta NVIDIA de 48 GB (por ejemplo, una RTX 6000 Ada). Reduce el peso del modelo de los 71,9 GB del original en BF16 a 22,0 GB en disco.

El modelo base emplea la arquitectura Qwen3_5MoeForConditionalGeneration, un transformer hibrido que combina atencion lineal Gated DeltaNet con atencion completa, organizado como mezcla de expertos (MoE). Segun el nombre del modelo seria un 35B con aproximadamente 3B de parametros activos, aunque el recuento de parametros safetensors del checkpoint cuantizado es de 5.954.701.156 elementos (cifra que puede estar afectada por el empaquetado int4 y no reflejar el total logico). El nombre indica que la familia es multimodal, con un codificador de vision de 27 bloques y una capa de prediccion multitoken (MTP).

Su relevancia es practica: permite ejecutar un modelo MoE multimodal grande en hardware de una sola GPU, algo inviable con los pesos en BF16. La licencia MIT facilita su adopcion comercial. Como contrapartida, es una cuantizacion no verificada por el autor original y, en el momento de su publicacion, aun no probada en vLLM ni en ninguna GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet + atencion completa y mezcla de expertos (MoE); clase Qwen3_5MoeForConditionalGeneration |
| Parametros totales | No disponible con certeza; el nombre indica 35B y el recuento de safetensors del checkpoint cuantizado es 5.954.701.156 elementos (posible subconteo por empaquetado int4) |
| Parametros activos | No disponible con cifra exacta; el sufijo A3B del nombre sugiere ~3B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16, int4 simetrico, group size 128, formato pack-quantized (compressed-tensors); router, embeddings, lm_head, encoder de vision y cabeza MTP se mantienen en BF16 |
| Idiomas soportados | No disponible (los datos de calibracion incluyen ingles y chino, pero no se declara el conjunto de idiomas soportados) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido: de sus 40 capas de decodificador, 30 usan Gated DeltaNet (una forma de atencion lineal eficiente) y 10 usan atencion completa con puerta (gated). Cada capa incluye una capa MoE con 256 expertos enrutados (top-8, dimension intermedia 512) mas 1 experto compartido. Ademas incorpora una capa de prediccion multitoken (MTP) con sus propios 256 expertos, y un codificador de vision de 27 bloques con su merger, lo que lo convierte en un modelo image-text-to-text.

Esta ficha describe exclusivamente la cuantizacion, no el entrenamiento del modelo original. El procedimiento aplicado fue AWQ (escalado consciente de activaciones, duo_scaling=True, n_grid=10) seguido de redondeo a int4 con escalas de grupo min-max, usando llm-compressor 0.14.0 y compressed-tensors 0.19.0. Dos detalles tecnicos destacan. Primero, el router MoE se envolvio como nn.Linear y se anadio como capa de balanceo AWQ para compensar el escalado de post_attention_layernorm y preservar los logits de enrutamiento (error relativo efectivo del peso del router <=0,33% por capa). Segundo, la calibracion uso moe_calibrate_all_experts=False con 256 muestras, de modo que cada uno de los 10.240 expertos enrutados recibio tokens (minimo 186, mediana ~5.000 por experto).

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla propia del modelo y modo de pensamiento (thinking) desactivable.
- Razonamiento multimodal image-text-to-text gracias al codificador de vision de 27 bloques.
- Mezcla de expertos con 256 expertos enrutados top-8 por capa, lo que aporta capacidad efectiva con coste de computo reducido.
- Prediccion multitoken (MTP) con cabeza propia, base para decodificacion especulativa y mayor throughput.
- Soporte de tool calling / function calling (los datos de calibracion incluyen ejemplos convertidos al formato de llamada a herramientas del modelo).
- Capacidades de codigo y matematicas tecnicas (la calibracion incluye instrucciones de codigo y chat tecnico).
- Conversacion multi-turno con contexto largo, condicionada por la longitud de contexto efectiva del modelo base.
- Soporte multilingue (los datos de calibracion cubren ingles y chino, aunque no se declara la cobertura oficial).

## Casos de uso

- Asistente conversacional multimodal en produccion: el modelo acepta imagen y texto, por lo que puede gestionar dialogos multi-turno sobre capturas, diagramas o documentos escaneados; su naturaleza MoE mantiene el coste de inferencia acotado al activar solo 8 de 256 expertos por capa.
- Agente con tool calling: gracias al soporte de function calling incluido en la calibracion, puede integrarse en flujos de agente que consultan APIs, bases de datos o servicios externos paso a paso.
- Asistente de programacion: genera y explica codigo en pipelines de desarrollo; la cuantizacion int4 permite desplegarlo en una sola GPU junto al resto del stack de CI/CD.
- Atencion al cliente automatizada: conversaciones multi-turno en ingles y chino con soporte de contexto largo, ejecutables de forma economica en hardware de una sola tarjeta.
- Procesamiento de documentos tecnicos: extraccion y resumen de informacion de imagenes de diagramas o tablas combinadas con texto, aprovechando la via de vision.
- Autocompletado y generacion asistida con decodificacion especulativa: la cabeza MTP permite acelerar la generacion mediante speculative decoding en vLLM.
- Investigacion sobre cuantizacion: sirve como caso de estudio de AWQ sobre arquitecturas MoE hibridas con atencion lineal, incluyendo el manejo del router y la cobertura de todos los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un control de calidad realizado en hardware AMD (Radeon 8060S con PyTorch ROCm) que compara este checkpoint int4 frente al original en BF16 mediante perplejidad, coincidencia top-1 y generaciones greedy, pero las cifras concretas no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Peso en disco: 22,0 GB en total (17,3 GB de pesos int4 del decodificador, 2,0 GB de lm_head y embeddings en BF16, 0,9 GB de encoder de vision, 1,7 GB de cabeza MTP y 0,05 GB de router, normas y varios).
- VRAM estimada para inferencia: aproximadamente 24-26 GB solo para los pesos; hay que sumar la cache KV y el resto de buffers, por lo que en la practica se necesita mas.
- GPU objetivo declarada: una unica NVIDIA de 48 GB, por ejemplo RTX 6000 Ada.
- Cabe en GPU de consumo: en teoria en tarjetas con 24 GB o mas (RTX 4090, RTX 5090), pero de forma muy ajustada y sin validacion; no se ha probado en ninguna GPU NVIDIA.
- Opciones de despliegue: vLLM es el entorno previsto (metodos CompressedTensorsWNA16 para capas densas y Marlin MoE para los expertos en Ampere, Ada y Hopper). No esta pensado para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el modelo no se ha probado aun en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-AWQ (esta ficha) | ~35B, ~3B activos (segun nombre) | No disponible | W4A16 int4 AWQ, group 128 | MIT | Comunitaria, no verificada |
| ornith-ai/Ornith-1.5-35B-A3B (original) | ~35B, ~3B activos | No disponible | BF16 (71,9 GB) | MIT | Oficial del autor |
| Otras alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de rendimiento para comparar con otros modelos de la misma categoria. La unica comparacion fiable es frente al checkpoint original en BF16, del que esta cuantizacion deriva.

## Limitaciones y advertencias

- Cuantizacion no oficial: no fue creada, revisada ni respaldada por Ornith AI; el propio autor lo advierte de forma explicita.
- Sin validacion en vLLM ni en GPU NVIDIA: el checkpoint solo se comprobo en hardware AMD con PyTorch ROCm en Windows; el autor pide que se le informe si vllm serve falla.
- Perdida de precision inherente al int4: los pesos de las 40 capas del decodificador (expertos, atencion completa y Gated DeltaNet) se cuantizan, con la consiguiente degradacion potencial frente al BF16.
- Riesgo de alucinacion: al ser un modelo generativo multimodal, puede producir contenido incorrecto, especialmente en generacion de codigo, datos numericos o descripciones de imagenes.
- Idiomas no declarados: no hay una lista oficial de idiomas soportados; la calibracion se limita a ingles y chino, lo que puede degradar el rendimiento en otros idiomas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base ni como afecta la cuantizacion a contextos largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el usuario debe verificar de forma independiente las condiciones del modelo base y de los conjuntos de calibracion.
- Contexto de uso limitado: formato compressed-tensors, compatible con vLLM pero no con llama.cpp, Ollama u otros runners que esperan GGUF.
- Soporte comunitario escaso: en el momento de la publicacion el modelo tenia 0 descargas y 0 likes, sin garantia de mantenimiento o actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsaipifong/Ornith-1.5-35B-A3B-AWQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion shareAI/ShareGPT-Chinese-English-90k: https://huggingface.co/datasets/shareAI/ShareGPT-Chinese-English-90k
- Dataset de calibracion theblackcat102/evol-codealpaca-v1: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- Dataset de calibracion glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
