# Tim-Xu/Llama-3.2-3B-CD-WebShop

## Resumen

Llama-3.2-3B-CD-WebShop es un ajuste fino completo (*full fine-tuning*) de meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario Tim-Xu, orientado a actuar como agente en el entorno WebShop (navegacion y compra en una tienda web simulada). El modelo se entrena con una receta de destilacion de contexto (CD, *context distillation*): se hace *supervised fine-tuning* sobre las respuestas generadas por el propio modelo base actuando como auto-profesor, visitando cada estado de entrenamiento dos veces. El resultado es un modelo que en evaluacion opera unicamente con el prompt ordinario, sin acceso al contexto privilegiado del profesor.

El modelo resuelve un problema concreto y muy acotado: el comportamiento de un LLM como politica de decision multi-paso en un entorno de tipo ReAct con historial limitado. Su relevancia es fundamentalmente metodologica y de investigacion: sirve como punto de comparacion dentro de una familia de variantes (CD, OPCD, CDUP) publicadas por el mismo autor para estudiar como distintas formas de destilacion de contexto afectan al rendimiento de agentes. No es un modelo de proposito general ni un candidato realista para produccion.

Con 3.212.749.824 parametros y un repositorio de 6,4 GB en safetensors, hereda la arquitectura del transformer decoder-only de Llama 3.2 3B (hasta 128.000 tokens de contexto segun la documentacion de Meta para el modelo base). El rendimiento absoluto es muy bajo: 2,3 % de exito y 3,4 % de *task score* sobre 384 episodios retenidos de WebShop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura de Llama 3.2 3B: 28 capas, hidden size 3072, 24 cabezas de atencion, 8 cabezas KV, GQA, SwiGLU, RMSNorm, RoPE), segun la documentacion de Meta para el modelo base |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base segun Meta; no se especifica en la model card si el ajuste preserva esa ventana. En evaluacion se usa una ventana de historial de cinco pasos |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en precision completa); convertible a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | no disponible en la model card; el modelo base declara oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only denso con attention de consultas agrupadas (GQA), normalizacion RMSNorm pre-normalizacion, activacion SwiGLU y embeddings de entrada/salida compartidos. No hay modificaciones arquitectonicas: el trabajo se limita a un ajuste fino completo de todos los pesos.

El entrenamiento emplea destilacion de contexto: los datos son 3.176 objetivos generados por el propio modelo base actuando como auto-profesor, extraidos de 16.911 estados de despliegue, con 6.352 visitas (cada estado visitado dos veces), 100 actualizaciones, *learning rate* 1e-5 y tamano de batch efectivo 64. No se ejecuta ningun entorno durante el entrenamiento; todas las trayectorias de WebShop provienen del modelo base. En evaluacion, el modelo actua solo con el prompt ordinario, sin contexto privilegiado. El protocolo de evaluacion usa el prompt Spark ReAct, ventana de historial de cinco pasos, limite de 30 pasos y temperatura 0,4. No se documenta uso de RLHF ni DPO, ni decodificacion especulativa u otras tecnicas de aceleracion.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Llama-3.2-3B-Instruct.
- Actuacion como agente ReAct en el entorno WebShop: interpretacion del historial de observaciones y emision de acciones de busqueda y seleccion de productos.
- Razonamiento multi-paso con ventana de historial de cinco pasos y limite de 30 pasos por episodio segun el protocolo de evaluacion.
- Soporte de *tool calling* / *function calling* en el modelo base segun Meta; no verificado ni documentado para este ajuste.
- Capacidades multilingues: no documentadas para este ajuste; las del modelo base segun Meta son ocho idiomas.
- No dispone de vision, audio ni modo de razonamiento explicito (*thinking mode*). La familia Llama 3.2 solo incluye vision en las variantes de 11B y 90B.

## Casos de uso

- Investigacion sobre destilacion de contexto: el modelo es una de las tres variantes (CD, OPCD, CDUP) publicadas por el mismo autor, lo que permite aislar el efecto de cada receta de destilacion sobre la misma politica base y el mismo entorno.
- Reproduccion de experimentos de agentes web: el protocolo esta completamente especificado (prompt Spark ReAct, ventana de cinco pasos, 30 pasos, temperatura 0,4), lo que facilita replicar la evaluacion sobre los 384 episodios retenidos de WebShop.
- Analisis de colapso de politica en ajuste fino: con un 2,3 % de exito frente al 18,8 % de la variante CDUP, resulta util como caso de estudio de recetas de destilacion que no logran mejorar sustancialmente la politica base.
- Linea base negativa en *benchmarking* de agentes: sirve como referencia de bajo rendimiento al comparar metodos de entrenamiento de agentes en entornos con recompensa dispersa.
- Experimentos de investigacion sobre generalizacion fuera de distribucion: al no ejecutar entorno durante el entrenamiento, permite estudiar la brecha entre estados vistos y estados de despliegue.
- Prototipado educativo: por su tamano (3,2 B de parametros) se puede ejecutar en una GPU de consumo para ilustrar el ciclo completo de entrenamiento y evaluacion de un agente LLM.

## Benchmarks y rendimiento

WebShop, 384 episodios retenidos, en porcentaje (datos de la model card):

| Politica | Success | Task score |
|---|---|---|
| Base policy | 0,0 | 0,0 |
| CD (este modelo) | 2,3 | 3,4 |
| OPCD | 2,6 | 7,9 |
| CDUP | 18,8 | 37,3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,4-7 GB en FP16/BF16, unos 3,5 GB en INT8 y alrededor de 2,0-2,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para INT4 basta con 4-6 GB.
- Cabe en GPU de consumo: si, en FP16 en tarjetas de 8 GB o mas y en 4 bits en tarjetas de 4-6 GB. No cabe en iGPU de gama baja sin cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles. La model card no reporta tiempos de inferencia ni coste por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebShop success | WebShop task score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.2-3B-CD-WebShop (este) | 3,21 B | 128k en el base | 2,3 % | 3,4 % | llama3.2 | HuggingFace (Tim-Xu) |
| Llama-3.2-3B-OPCD-WebShop | 3,21 B | 128k en el base | 2,6 % | 7,9 % | llama3.2 | HuggingFace (Tim-Xu) |
| Llama-3.2-3B-CDUP-WebShop | 3,21 B | 128k en el base | 18,8 % | 37,3 % | llama3.2 | HuggingFace (Tim-Xu) |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21 B | 128k | 0,0 % | 0,0 % | llama3.2 | HuggingFace (Meta) |

Los resultados de la politica base y de las tres variantes provienen todos de la misma model card y del mismo protocolo de evaluacion, por lo que son directamente comparables entre si. No se dispone de comparaciones con modelos de otros autores sobre el mismo entorno.

## Limitaciones y advertencias

- Rendimiento muy bajo: 2,3 % de exito y 3,4 % de *task score* sobre 384 episodios. No es adecuado para ningun uso de produccion, ni siquiera como agente WebShop funcional.
- La variante CDUP del mismo autor obtiene 18,8 % de exito con el mismo modelo base, lo que indica que la receta CD concreta empleada aqui es claramente inferior.
- Riesgo de alucinacion elevado en la generacion de acciones y en la interpretacion del historial, dado que no hay verificacion contra el entorno durante el entrenamiento.
- El ajuste se ha realizado exclusivamente sobre trayectorias de WebShop; fuera de ese dominio se espera un deterioro severo y probablemente una perdida de capacidades generales respecto al modelo base.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para este ajuste. Hereda los sesgos del modelo base, sin mitigacion adicional declarada.
- Idiomas: la model card no declara idiomas soportados ni datos multilingues de entrenamiento; se asume comportamiento mayoritariamente en ingles, consistente con WebShop.
- Limitaciones de contexto: aunque el base soporta 128k tokens, el protocolo de evaluacion usa solo una ventana de historial de cinco pasos, y no se documenta el comportamiento con contextos largos.
- Licencia: Llama 3.2 Community License. Incluye condiciones de uso aceptable (USE_POLICY.md), obligaciones de atribucion ("Built with Llama") y restricciones para determinados usos. El uso comercial esta permitido bajo los terminos de esa licencia, pero debe revisarse antes de cualquier despliegue.
- Estado del arte: el modelo tiene 0 descargas y 0 likes en HuggingFace y fue creado el 2026-10-11, por lo que no cuenta con validacion independiente de la comunidad.
- No hay pesos cuantizados publicados ni version GGUF, lo que anade trabajo de conversion para despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tim-Xu/Llama-3.2-3B-CD-WebShop
- Variante OPCD: https://huggingface.co/Tim-Xu/Llama-3.2-3B-OPCD-WebShop
- Variante CDUP: https://huggingface.co/Tim-Xu/Llama-3.2-3B-CDUP-WebShop
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia y politica de uso: LICENSE.txt y USE_POLICY.md del repositorio de Llama 3.2

La busqueda web no devolvio resultados relevantes sobre este modelo: las coincidencias encontradas corresponden a operadores de telefonia y empresas con la sigla TIM, sin relacion con el modelo. No se han localizado papers, blogs ni demos asociados.
