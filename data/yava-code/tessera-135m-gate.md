# yava-code/Tessera-135M-Gate

## Resumen

Tessera-135M-Gate es un checkpoint de investigacion desarrollado por yava-code, construido sobre el backbone de SmolLM2-135M de HuggingFaceTB. No es un modelo de lenguaje orientado a calidad de generacion, sino una "puerta de arquitectura" (architecture gate): su proposito es validar de extremo a extremo el camino completo de Next Concept Prediction (NCP), una variante de entrenamiento que anade un canal de conceptos al modelo causal clasico. Con 142.113.600 parametros reales en safetensors y un repositorio de 0,6 GB, es el miembro mas pequeno de la familia Tessera, que incluye tambien Tessera-1B-Nano-Base y Tessera-1B-Nano.

El modelo se entreno sobre un subconjunto deliberadamente sobreajustado de TinyStories, con 16.777.216 tokens y un coste de computo estimado de 1,38 dolares. Su relevancia no reside en los resultados de calidad linguistica, sino en lo que revelo sobre el comportamiento de la arquitectura NCP: confirmo que los tres objetivos (NTP, NCP y VQ) entrenan conjuntamente y que el decodificador usa causalmente el canal de conceptos, pero tambien detecto un modo de fallo concreto (baja perplejidad efectiva del codebook y atajos de baja entropia) que solo se supera por encima de cierto umbral de escala.

Se publica como pieza de un estudio comparativo mas amplio que compara un brazo NTP puro con un brazo de conceptos a 1.000 millones de tokens. La licencia es Apache 2.0 y el formato de pesos es safetensors con codigo personalizado (requiere `trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (backbone SmolLM2-135M) con ruta Next Concept Prediction (ConceptLM), bloques de conceptos causales y cuantizacion vectorial |
| Parametros totales | 142.113.600 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone SmolLM2-135M y le anade la ruta completa de Next Concept Prediction: pooling de conceptos, codigos cuantizados, bloques de conceptos causales y realimentacion hacia el decodificador de tokens. Los hiperparametros declarados son chunk size de 4, product code de 9 segmentos x 64 entradas, 2 bloques de conceptos causales y punto de inyeccion antes del bloque 2 del decodificador de tokens. El objetivo de NCP es el siguiente concepto continuo y la funcion de perdida combina `L_ntp + 1 L_ncp + 1 L_vq`. Segun la model card, es una implementacion compacta estilo ConceptLM y no una replica del NCP-ArchPreview de 8.900 millones: omite codificacion residual iterativa, conexiones residuales entre escalas y la receta de entrenamiento a gran escala.

El entrenamiento se realizo sobre 16.777.216 tokens de un subconjunto de TinyStories deliberadamente sobreajustado, con un coste de computo estimado de 1,38 dolares. El corpus emparejado y el registro de entrenamiento estan fijados en el repositorio ncp-smol mediante hashes SHA256 de la cache empaquetada, el log completo de metricas, el estado del trainer y el JSON de evaluacion de intervenciones. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva basica mediante el decodificador de tokens del backbone SmolLM2-135M.
- Prediccion de conceptos: canal NCP que predice el siguiente concepto continuo y lo realimenta al decodificador.
- Uso causal del canal de conceptos: segun la model card, poner a cero la realimentacion cuesta +0,0205 nats de perdida NTP en held-out, lo que demuestra dependencia causal del canal.
- Cuantizacion vectorial de conceptos con codebook de 9 segmentos x 64 entradas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues.
- No esta disenado para calidad de generacion: es un checkpoint de validacion arquitectonica.

## Casos de uso

- Validacion de arquitecturas NCP antes de invertir en entrenamientos grandes: el modelo sirve como prueba de extremo a extremo de que pooling de conceptos, codigos cuantizados, bloques causales y realimentacion entrenan conjuntamente, con un coste de computo inferior a 2 dolares.
- Investigacion sobre interpretabilidad de canales latentes: las evaluaciones de intervencion (poner a cero o barajar la realimentacion de conceptos) permiten medir la dependencia causal del canal de conceptos sobre la perdida NTP en lotes identicos.
- Reproduccion de experimentos de escala: junto con Tessera-1B-Nano-Base y Tessera-1B-Nano, permite comparar el comportamiento de un brazo NTP puro frente a un brazo de conceptos en condiciones emparejadas.
- Estudio de colapso de codebooks en VQ: la perplejidad efectiva de 2,4087 con un uso del 33 % del codebook documenta un modo de fallo concreto que los investigadores pueden usar como caso de referencia para diagnosticar atajos de baja entropia.
- Docencia y formacion en arquitecturas hibridas token-concepto: el modelo es lo bastante pequeno (0,6 GB) para ejecutarse en entornos docentes y experimentar con modificaciones del camino NCP.
- Pruebas de integracion de `custom_code` en transformers: sirve para validar pipelines de carga con `trust_remote_code=True` y para comprobar el comportamiento de herramientas de serializacion y despliegue ante modelos con codigo personalizado.

## Benchmarks y rendimiento

La model card publica metricas del entrenamiento de validacion, no benchmarks estandar de calidad (MMLU, HumanEval, GSM8K no estan disponibles).

| Metrica | Valor |
|---|---:|
| Perdida NTP en held-out | 1,8751 |
| Perplejidad en held-out | 6,5213 |
| Delta de realimentacion a cero (aumento de perdida NTP) | 0,0205 |
| Delta de realimentacion barajada | 0,0000 |
| Perplejidad / uso del codebook | 2,4087 / 33,0 % |
| Tokens de entrenamiento | 16.777.216 |
| Coste de computo estimado | 1,38 USD |

Los deltas de intervencion son incrementos de la perdida NTP en held-out respecto a la realimentacion normal de conceptos predichos, evaluados sobre lotes identicos. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (142 millones de parametros, aproximadamente 0,57 GB en fp32); alrededor de 0,3 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, e incluso en sistemas integrados.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el uso de `custom_code` puede complicar su soporte en algunos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-135M-Gate | 142,1 M | No disponible | NCP sobre SmolLM2-135M, gate de arquitectura | Apache 2.0 | Hugging Face |
| SmolLM2-135M (base) | 135 M | No disponible en esta ficha | Transformer causal estandar | Apache 2.0 | Hugging Face |
| Tessera-1B-Nano-Base | No disponible | No disponible | Control NTP puro a 1.000 M de tokens | No disponible | Hugging Face |
| Tessera-1B-Nano | No disponible | No disponible | Brazo de conceptos a 1.000 M de tokens | No disponible | Hugging Face |

La comparacion relevante es interna a la familia Tessera: el gate de 135M existe para desriesgar el par de 1.000 millones de tokens. Frente a SmolLM2-135M, la diferencia es la ruta NCP anadida; no se dispone de comparaciones de calidad con modelos de proposito general.

## Limitaciones y advertencias

- No es un modelo de calidad: fue entrenado sobre un subconjunto sobreajustado de TinyStories y el autor lo declara explicitamente como resultado no representativo de calidad de lenguaje.
- Modo de fallo documentado: perplejidad efectiva del codebook cercana a 2,4 con uso de solo el 33 % del codebook y realimentacion barajada sin coste, lo que indica un atajo de baja entropia.
- El propio autor advierte que algunos comportamientos solo aparecen por encima de un umbral de escala; las conclusiones de este checkpoint no se extrapolan directamente a modelos mayores.
- No se documentan idiomas soportados ni cobertura multilingue.
- No se documenta longitud de contexto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- No se documentan sesgos especificos, pero al derivar de TinyStories el dominio es narrativo infantil y muy limitado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para cargas de produccion por su naturaleza de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yava-code/Tessera-135M-Gate
- Tessera-1B-Nano-Base: https://huggingface.co/yava-code/Tessera-1B-Nano-Base
- Tessera-1B-Nano: https://huggingface.co/yava-code/Tessera-1B-Nano
- Repositorio de estudio (whitepaper y registros): https://github.com/yava-code/Tessera-1B-Nano
- Paper ConceptLM: https://arxiv.org/abs/2602.08984
- Paper NCP-ArchPreview: https://arxiv.org/abs/2609.10715
