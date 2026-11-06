# Unluckkie/Ling-3.0-tiny-APEX-MCQ5-IK-GGUF

## Resumen

Ling-3.0-tiny-APEX-MCQ5-IK-GGUF es una suite de cuantizaciones personalizadas del modelo base inclusionAI/Ling-3.0-tiny, publicada por el usuario Unluckkie en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 7.893.392.800 parametros totales y aproximadamente 1.300 millones de parametros activos por token, disenado para generacion de texto conversacional. Esta version concreta no es un modelo nuevo, sino una reempaquetacion en formato GGUF optimizada para el runtime `ik_llama.cpp`, con una metodologia propia que combina proteccion estructural APEX y presupuesto de lectura MCQ5.

La relevancia de esta ficha radica en que las cuantizaciones propuestas buscan reducir el peso del modelo hasta un rango de 3,7 a 4,3 GB manteniendo la perplejidad cerca de la referencia Q6_K (6,822), con perdidas declaradas de entre el 1,8 % y el 3,8 %. Esto permite ejecutar un MoE de 7,9B parametros en equipos con 8 GB de RAM, algo que en precision completa seria inviable. El autor reporta velocidades de generacion de 14-16 tokens por segundo en un Intel i5-8250U con 4 hilos.

El modelo esta liberado bajo licencia MIT y solo declara soporte para ingles. Es importante senalar que estos archivos requieren obligatoriamente `ik_llama.cpp` y no cargan en `llama.cpp` estandar, Ollama ni LM Studio, lo que limita su adopcion a usuarios dispuestos a usar ese runtime especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | ~1.3B (segun model card) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ2_KS, IQ3_KS, IQ3_XXS, IQ4_KS, IQ4_KSS, Q8_0, IQ6_K, Q6_K, F16 (router sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere `ik_llama.cpp`) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny es un transformer con arquitectura de mezcla de expertos. Segun la informacion disponible, cuenta con 128 expertos enrutados y un experto compartido siempre activo, con un router (`ffn_gate_inp`, `exp_probs_b`) que decide que expertos se activan por token. La model card indica que se leen 8 expertos de cada 128 por token, lo que explica la diferencia entre los 7,9B parametros totales y los ~1,3B activos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta publicacion no esta en el entrenamiento, sino en la metodologia de cuantizacion. El autor combina tres tecnicas: (1) proteccion del router, que se mantiene en F16 para evitar enrutamientos erroneos; (2) MCQ5 read-budgeting, que asigna mayor precision al experto compartido (siempre leido) y comprime mas agresivamente los 128 expertos enrutados; y (3) gradiente APEX, que conserva mayor precision en las capas iniciales y finales (responsables de sintaxis y formato de salida) y comprime con mas fuerza las capas intermedias. Los kernels `_KS` de `ik_llama.cpp` se emplean para maximizar la velocidad de inferencia en CPU.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento basico y respuesta a preguntas, segun el pipeline declarado de `text-generation`.
- Capacidad de mantener conversaciones multi-turno (tag `conversational`).
- Al ser un MoE con 1,3B parametros activos, ofrece un equilibrio entre calidad y coste computacional.
- No se declara soporte de tool calling ni function calling en la informacion disponible.
- No se declara soporte de vision, audio ni modo thinking.
- Soporte multilingue limitado al ingles.
- No se documentan capacidades de agente ni razonamiento multi-paso.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en equipos con 8 GB de RAM, gracias a las cuantizaciones de 3,7-4,3 GB y al uso de contexto de 8K segun el ejemplo del autor.
- Prototipado de aplicaciones de generacion de texto en CPU: con velocidades de 14-16 tokens/s en un i5-8250U, es viable para demos y pruebas de concepto sin GPU.
- Educacion e investigacion sobre MoE: sirve para estudiar el comportamiento de un MoE de 128 expertos enrutados y el impacto de distintas estrategias de cuantizacion sobre la perplejidad.
- Despliegue en entornos con restricciones de memoria: al requerir ~5,5 GB de RAM con contexto de 8K, cabe en portatiles y mini-PC de gama baja.
- Generacion de texto por lotes en ingles: para tareas de resumen, parafraseo o clasificacion simple donde no se requiera maxima fidelidad.
- Evaluacion comparativa de cuantizaciones: los tres niveles (IK-Quality, IK-Balanced, IK-Compact) permiten medir el compromiso entre tamano, velocidad y calidad en un mismo hardware.
- Chatbots de bajo coste para nichos en ingles: con licencia MIT, se puede integrar en productos comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son mediciones de perplejidad sobre `wiki.test.raw` (`n_ctx=512`, 100 chunks) frente a una referencia Q6_K, junto con metricas de velocidad en un i5-8250U.

| Quant | Tamano | PPL | Perdida vs Q6 | Configuracion |
|---|---|---|---|---|
| Q6_K Baseline | 6,9 GB | 6,822 | 0,0 % | Referencia sin comprimir |
| IK-Quality | 4,3 GB | 6,945 | +1,8 % | IQ4_KS expertos + Q8_0 compartidos + IQ6_K atencion |
| IK-Balanced | 4,0 GB | 7,008 | +2,7 % | IQ4_KSS expertos + IQ6_K compartidos |
| IK-Compact | 3,7 GB | 7,084 | +3,8 % | IQ3_KS / IQ3_XXS expertos |

Rendimiento en i5-8250U (4 hilos):

| Metrica | Valor |
|---|---|
| Prompt eval | ~90 tokens/s |
| Generacion | ~14-16 tokens/s |
| RAM con contexto 8K | ~5,5 GB |

El autor indica que probo builds por debajo de 3,5 GB y todos superaron una PPL de 8,4, concluyendo que los 128 expertos enrutados de Ling requieren al menos 3 bits de precision para retener la logica.

## Requisitos de hardware

- VRAM/RAM estimada: entre 3,7 GB y 4,3 GB para los pesos segun cuantizacion; ~5,5 GB de RAM total con contexto de 8K.
- Cabe en GPUs de consumo con 8 GB o mas (RTX 3060, RTX 4060, RTX 2070), aunque el runtime objetivo es CPU.
- Cabe en sistemas con 8 GB de RAM sin GPU dedicada, segun el ejemplo del autor.
- GPU recomendadas: no se especifican; el modelo esta orientado a inferencia en CPU mediante `ik_llama.cpp`.
- Opciones de despliegue: exclusivamente `ik_llama.cpp`. No es compatible con `llama.cpp` estandar, Ollama ni LM Studio.
- Latencia y throughput: ~90 tokens/s en prompt eval y ~14-16 tokens/s en generacion sobre i5-8250U con 4 hilos. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Ling-3.0-tiny-APEX-MCQ5-IK-GGUF | 7,9B totales / ~1,3B activos | no disponible | GGUF (IK) | MIT | ik_llama.cpp |
| bartowski/Ling-3.0-tiny-GGUF | 7,9B totales / ~1,3B activos | no disponible | GGUF estandar | MIT (heredada) | llama.cpp, Ollama, LM Studio |
| inclusionAI/Ling-3.0-tiny (base) | 7,9B totales / ~1,3B activos | no disponible | safetensors | MIT | Transformers, vLLM, TGI |

La diferencia principal frente a la version de bartowski es la compatibilidad de runtime: la de bartowski funciona en herramientas estandar, mientras que esta requiere `ik_llama.cpp` y ofrece tamanos mas reducidos (3,7-4,3 GB frente a los ~4-5 GB tipicos de cuantizaciones estandar equivalentes). No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Requiere obligatoriamente `ik_llama.cpp`; no carga en `llama.cpp` estandar, Ollama ni LM Studio. Esto reduce drasticamente la portabilidad.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No se han publicado datos sobre sesgos del modelo base ni sobre riesgo de alucinacion.
- El autor advierte que cuantizaciones por debajo de 3,5 GB degradan la logica del modelo (PPL > 8,4), por lo que no se recomienda bajar de 3 bits.
- La licencia MIT permite uso comercial sin restricciones, pero se hereda del modelo base inclusionAI/Ling-3.0-tiny; conviene verificar la licencia original.
- No se documenta soporte de tool calling, agentes ni contextos superiores a 8K en los ejemplos.
- El modelo tiene 0 likes y 501 descargas, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- Al ser una cuantizacion de un modelo base, cualquier limitacion del modelo original (sesgos, alucinaciones, conocimiento desactualizado) se mantiene.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/Unluckkie/Ling-3.0-tiny-APEX-MCQ5-IK-GGUF
- README de la cuantizacion: https://huggingface.co/Unluckkie/Ling-3.0-tiny-APEX-MCQ5-IK-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo base (variante base): https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Cuantizacion alternativa de bartowski: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Repositorio de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
