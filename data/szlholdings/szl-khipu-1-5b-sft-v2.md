# SZLHOLDINGS/SZL-Khipu-1.5B-sft-v2

## Resumen

SZL-Khipu-1.5B-sft-v2 es un ajuste fino supervisado (SFT) del modelo base SZL-Khipu-1.5B, publicado por SZLHOLDINGS. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, segun indican las etiquetas del repositorio. El modelo se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

La relevancia de esta publicacion no reside en sus capacidades, sino en su naturaleza de validacion de infraestructura. La propia model card declara explicitamente que se trata de una ejecucion de validacion de pipeline sobre un corpus piloto de 42 ejemplos de chat tras el filtrado de filas de metadatos, y que no se emite ninguna afirmacion de capacidad sobre el modelo. El objetivo declarado es demostrar de extremo a extremo la ruta de entrenamiento, fusion y publicacion de la organizacion.

El entrenamiento se realizo mediante QLoRA de 4 bits (r=16) durante 3 epocas, con una tasa de aprendizaje de 2e-4, longitud de secuencia de 4096 y empaquetado, sobre una unica GPU RTX A6000 usando el backend Unsloth. El artefacto publicado es el modelo completo fusionado en 16 bits, no un adaptador. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (segun etiquetas del repositorio) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con seqlen 4096) |
| Tipos de cuantizacion | no disponible (artefacto publicado en 16 bits; entrenado con QLoRA 4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only, segun las etiquetas del repositorio. El modelo base es SZLHOLDINGS/SZL-Khipu-1.5B, sobre el que se aplico un ajuste fino supervisado. El metodo empleado fue QLoRA de 4 bits con rango 16, durante 3 epocas, con tasa de aprendizaje 2e-4, longitud de secuencia de 4096 y empaquetado de secuencias. El entrenamiento se ejecuto en una unica GPU RTX A6000 en Massed Compute con el backend Unsloth.

Los datos de entrenamiento proceden de dos conjuntos: governed-sft-mix-v2 y szl-1-doctrine-sft, que tras el filtrado de filas de metadatos resultaron en 42 ejemplos de chat. El artefacto publicado es el modelo completo fusionado en 16 bits, no un adaptador. No se dispone de informacion sobre el volumen total de tokens del modelo base, la composicion de su dataset original ni si hubo fases de RLHF o DPO. La model card no documenta innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste fino supervisado orientado a conversacion, aunque sobre un corpus piloto de 42 ejemplos.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Validacion de pipelines de ajuste fino: el modelo sirve como prueba de extremo a extremo de la ruta de entrenamiento, fusion y publicacion de una organizacion, tal como declara su model card. Es adecuado porque el artefacto es un modelo completo fusionado y no un adaptador, lo que permite verificar el flujo completo.
- Pruebas de integracion con transformers y text-generation-inference: al ser compatible con ambas herramientas, permite validar despliegues de inferencia en entornos de prueba antes de abordar modelos mayores.
- Experimentacion con QLoRA sobre GPUs de gama profesional: su entrenamiento en una unica RTX A6000 documenta un caso reproducible para equipos que quieran replicar la receta con Unsloth.
- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse en entornos de desarrollo para probar interfaces de chat, aunque sin garantias de calidad por el tamano del corpus de ajuste.
- Docencia y formacion en ajuste fino: sirve como ejemplo documentado de un flujo SFT con QLoRA, con registro de entrenamiento y script de lanzamiento publicos.
- Base para futuros ajustes: al publicarse el modelo completo en 16 bits con licencia Apache 2.0, puede servir como punto de partida para fine-tunes posteriores sobre corpus mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que la ejecucion es una validacion de pipeline y que no emite ninguna afirmacion de capacidad sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 1,5 mil millones de parametros en 16 bits requiere aproximadamente 3 GB solo para los pesos, a los que hay que sumar la cache KV y el overhead del runtime; en cuantizacion de 8 bits rondaria 1,5 GB y en 4 bits menos de 1 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: el autor documento el entrenamiento en una RTX A6000. Para inferencia, cualquier GPU con suficiente VRAM para el modelo en el formato elegido deberia ser suficiente, aunque no se proporcionan recomendaciones oficiales.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,5B, en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmacion del autor.
- Opciones de despliegue: transformers, text-generation-inference y endpoints compatibles segun las etiquetas. Otras opciones como vLLM, llama.cpp u Ollama no estan documentadas en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SZL-Khipu-1.5B-sft-v2 | 1.543.714.304 | no disponible | apache-2.0 | HuggingFace |
| Qwen2-1.5B (familia base) | ~1,5B | no disponible en esta ficha | apache-2.0 (segun familia Qwen2) | HuggingFace |
| Alternativas de ~1,5B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas. La comparacion con la familia Qwen2 se basa unicamente en la arquitectura declarada en las etiquetas del repositorio.

## Limitaciones y advertencias

- El autor declara explicitamente que se trata de una validacion de pipeline sobre un corpus piloto de 42 ejemplos y que no emite ninguna afirmacion de capacidad sobre el modelo.
- El corpus de ajuste es muy reducido (42 ejemplos de chat tras el filtrado), por lo que el efecto del fine-tune sobre el comportamiento del modelo es limitado y no garantiza calidad conversacional.
- El unico idioma declarado es el ingles; no hay soporte multilingue documentado.
- No se han publicado benchmarks, por lo que no existe evidencia cuantitativa de rendimiento.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo pequeno y con ajuste minimo, el riesgo es previsiblemente alto, aunque no hay datos que lo confirmen.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni de idoneidad para produccion.
- Advertencia para produccion: no se recomienda su uso en entornos productivos sin una evaluacion propia, dado que el propio autor lo describe como una prueba de infraestructura.
- El registro de entrenamiento completo se encuentra en un dataset privado (SZLHOLDINGS/wave-logs), lo que limita la reproducibilidad externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-sft-v2
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Dataset governed-sft-mix-v2: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Dataset szl-1-doctrine-sft: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Dataset de registros wave-logs (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Script de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en HuggingFace: https://huggingface.co/SZLHOLDINGS
