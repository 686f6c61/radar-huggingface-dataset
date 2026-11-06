# Ura0316/zils-mini-body-r5-blend-3of4

## Resumen

zils-mini-body-r5-blend-3of4 es un modelo de lenguaje de aproximadamente 4.540 millones de parametros publicado por el usuario Ura0316 en Hugging Face. Se trata de un "body" (cuerpo) destinado al pool de modelos `d3-mini` de Zils, un proyecto asociado al subnet 127 de Bittensor. El modelo es un fine-tune de torchcast-ai/torchcast-decision-4b, que a su vez deriva de Qwen/Qwen3.5-4B, promediado con los pesos de la release vllm-sr/d3-mini del mismo pool.

La relevancia de este modelo es acotada: no es un modelo de proposito general listo para usar, sino un componente de pesos (solo el "body", sin la capa de respuesta, el prompt ni el runtime) pensado para integrarse en el chasis fijado del pool Zils. El repositorio contiene unicamente los pesos de lenguaje y vision en el layout del chasis del pool, con 723 tensores en bfloat16.

El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su reutilizacion y modificacion, aunque su uso practico esta condicionado a la infraestructura del pool Zils. No se dispone de informacion publica sobre benchmarks, idiomas soportados ni pipeline de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion estandar y linear-attention (derivada de Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parametros que combina capas de atencion estandar con capas de linear-attention. Sobre esa base, torchcast-ai/torchcast-decision-4b aplico un fine-tune, y sobre este ultimo se entreno un adaptador LoRA de rango 64 que se fusiono en las proyecciones de atencion y linear-attention.

El proceso de creacion del modelo consistio en entrenar ese adaptador LoRA y fusionarlo en los pesos base, para despues promediar el resultado con los pesos de la release vllm-sr/d3-mini, conservando 3/4 del cambio introducido por el fine-tune. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El repositorio contiene exclusivamente el "body" (pesos de lenguaje y vision) en el layout del chasis del pool Zils; la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool.

## Capacidades

- Generacion de texto y razonamiento: heredadas de la base Qwen3.5-4B y del fine-tune torchcast-decision-4b.
- Capacidades de vision: el repositorio incluye pesos de vision segun la model card ("language and vision weights"), aunque no se detallan las tareas concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Participacion en el pool Zils (Bittensor subnet 127): el modelo esta disenado como "body" para el pool `d3-mini`, por lo que su uso principal es contribuir pesos al chasis del pool y participar en el mecanismo de evaluacion del subnet.
- Investigacion sobre merging de modelos: el proceso de LoRA merge seguido de promedio ponderado (3/4 del cambio) es un caso de estudio para experimentos de model merging y soup de pesos.
- Experimentacion con linear-attention: al heredar la arquitectura de Qwen3.5-4B, sirve para estudiar el comportamiento de capas de linear-attention en modelos de ~4B.
- Fine-tuning posterior: al estar bajo Apache-2.0 y en safetensors, puede servir como punto de partida para nuevos fine-tunes en dominios especificos.
- Evaluacion comparativa de fine-tunes: util para comparar el efecto del fine-tune torchcast-decision-4b frente a la base Qwen3.5-4B en tareas controladas.
- Despliegue en el runtime del pool: unicamente dentro del chasis fijado de Zils, que aporta la capa de respuesta y el prompt; no esta pensado para despliegue autonomo con vLLM, llama.cpp u otros motores sin ese chasis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (4,54 B de parametros), en bfloat16 serian necesarios aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones por tamano, no datos publicados del modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de ~4,5 B en bfloat16 podria caber en GPUs con 12-16 GB de VRAM, pero no hay validacion publicada.
- Opciones de despliegue: el modelo esta empaquetado para el chasis del pool Zils; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-body-r5-blend-3of4 | ~4,54 B | No disponible | Apache-2.0 | Hugging Face (body para pool Zils) |
| Qwen/Qwen3.5-4B (base original) | ~4 B | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| torchcast-ai/torchcast-decision-4b (base directa) | ~4 B | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| vllm-sr/d3-mini (release del pool) | No disponible | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el "body" (pesos); sin la capa de respuesta, el prompt y el runtime del chasis Zils, el modelo no es funcional de forma autonoma.
- No hay informacion publica sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no cuantificado para este modelo.
- Limitaciones de contexto e idioma: no documentadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Aunque la licencia es Apache-2.0 (permite uso comercial), la dependencia del chasis del pool Zils puede imponer restricciones practicas adicionales no detalladas en la model card.
- El proceso de merging (LoRA fusionado y promediado al 3/4) puede introducir degradaciones no evaluadas respecto a la base.

## Enlaces

- Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-r5-blend-3of4
- Modelo base directo: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Release del pool: https://huggingface.co/vllm-sr/d3-mini
- Base original: https://huggingface.co/Qwen/Qwen3.5-4B
