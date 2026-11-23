# TravelDistillation/Travel-gemma3_1b_RCAEval_2_speculative_kd

## Resumen

Travel-gemma3_1b_RCAEval_2_speculative_kd es un adaptador LoRA (PEFT) publicado por el usuario TravelDistillation sobre el modelo base google/gemma-3-1b-it. Se trata de un ajuste fino mediante DPO (Direct Preference Optimization) sobre un conjunto de pares de preferencia denominado data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it, presumiblemente generado por destilación especulativa desde gemma-3-4b-it hacia gemma-3-1b-it. El resultado es un checkpoint conversacional orientado a text-generation que hereda la arquitectura y la licencia Gemma del modelo original.

El interés del artefacto es acotado pero técnicamente concreto: demuestra un flujo de destilación de preferencias entre dos tamanos de la familia Gemma 3, con hiperparametros documentados (LR 5e-5, batch efectivo 8, una epoca, scheduler coseno). No obstante, la model card esta practicamente vacia (secciones de descripcion, usos previstos, datos de evaluacion y resultados marcadas como "More information needed"), no se declaran idiomas soportados y el repositorio no registra descargas ni likes en el momento de la consulta.

Por su tamano (adaptador LoRA sobre un modelo de 1B) y su naturaleza experimental, debe considerarse un checkpoint de investigacion reproducible mas que un modelo listo para produccion. La relevancia actual reside en que ejemplifica la tecnica de knowledge distillation con preferencias aplicada a modelos pequenos que caben en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) con adaptador LoRA sobre google/gemma-3-1b-it |
| Parametros totales | no disponible (modelo base de 1B; el adaptador LoRA anade un numero no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con TRL y PEFT sobre google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3. El ajuste se realiza con DPO sobre pares de preferencia, lo que implica una fase de alineacion sobre respuestas preferidas frente a rechazadas, en lugar de un SFT clasico. El nombre del dataset (gemma-3-1b-it_to_gemma-3-4b-it) y el sufijo "speculative_kd" sugieren que las preferencias se construyeron usando gemma-3-4b-it como modelo profesor para destilar comportamiento hacia el alumno de 1B, aunque la model card no documenta el procedimiento de generacion de pares.

Los hiperparametros declarados son: learning rate 5e-5, batch de entrenamiento 1 con 8 pasos de acumulacion (batch efectivo 8), una sola epoca, scheduler coseno con warmup del 10 %, semilla 42 y optimizador AdamW (betas 0.9/0.999, epsilon 1e-8). El entrenamiento se ejecuto con PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3. No se documentan innovaciones adicionales como decodificacion especulativa en inferencia, atencion lineal ni modos de razonamiento extendido; el termino "speculative" en el nombre hace referencia al pipeline de destilacion, no a una capacidad de inferencia del checkpoint.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base instruct.
- Alineacion por preferencias (DPO) orientada al dataset RCAEval_2, cuyo dominio concreto no se detalla en la model card.
- Capacidad multilingue: no declarada; depende enteramente de google/gemma-3-1b-it y no se documenta en este adaptador.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no documentadas; el tag gemma3_text indica que se usa la torre de texto, no la multimodal.

## Casos de uso

- Investigacion en destilacion de preferencias: el adaptador sirve como referencia reproducible para estudiar como un modelo de 1B aproxima el comportamiento de uno de 4B mediante DPO, con hiperparametros y versiones de framework documentados.
- Experimentos academicos de alineacion: util para comparar DPO frente a SFT sobre el mismo modelo base en entornos con recursos limitados, gracias a que el adaptador se carga sobre un 1B.
- Prototipado de asistentes conversacionales ligeros: al ejecutarse sobre un modelo de 1B, permite iterar rapidamente en local antes de escalar a modelos mayores.
- Evaluacion de pipelines TRL/PEFT: sirve como caso de prueba de integracion de las versiones concretas declaradas (PEFT 0.21.2, Transformers 5.19.0), util para validar toolchains de entrenamiento.
- Reproduccion de experimentos: el checkpoint permite reanudar o auditar el ajuste DPO descrito, dado que se publican los hiperparametros completos.
- Base para nuevos adaptadores: al ser un LoRA, puede combinarse o servir de punto de partida para ajustes posteriores sobre gemma-3-1b-it en dominios especificos.

## Benchmarks y rendimiento

La model-index del autor declara una entrada (gemma3_1b_RCAEval_2_speculative_kd) con la lista de resultados vacia. La model card incluye una seccion "Training results" tambien vacia.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 1B, la huella dominante es la del modelo base. En fp16 el base de 1B ronda los 2 GB de pesos; en 4 bits, por debajo de 1 GB. El repositorio ocupa 2,2 GB, coherente con pesos en precision completa o fp16 del adaptador y artefactos de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en fp16; no se publican recomendaciones del autor.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamano del modelo base; no verificado por el autor.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; text-generation-inference (el tag endpoints_compatible esta presente); llama.cpp/Ollama requeririan fusionar el adaptador y convertir a GGUF, paso no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_speculative_kd | ~1B (base) + LoRA | no disponible | gemma | Hugging Face, 0 descargas | Adaptador DPO experimental, sin benchmarks |
| google/gemma-3-1b-it | ~1B | no disponible en esta ficha | gemma | Hugging Face, ampliamente usado | Modelo base oficial, con evaluacion publicada por Google |
| google/gemma-3-4b-it | ~4B | no disponible en esta ficha | gemma | Hugging Face, ampliamente usado | Modelo profesor presumible en la destilacion; mayor capacidad |
| Alternativas de 1B alineadas (p. ej. Llama 3.2 1B Instruct) | ~1B | no disponible en esta ficha | licencia Llama | Hugging Face | Comparable en tamano; datos de rendimiento no incluidos aqui |

La comparacion cuantitativa de rendimiento no es posible: el autor no publica resultados y no se dispone de evaluaciones independientes de este adaptador.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, datos de evaluacion y resultados estan sin rellenar ("More information needed"), lo que impide conocer el dominio real de alineacion.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base; el ajuste DPO podria degradar capacidades generales si el dataset de preferencias es estrecho.
- Riesgo de alucinacion: inherente a los modelos de 1B y no mitigado de forma documentada en este adaptador.
- Idiomas: no declarados; el comportamiento multilingue depende del base y no se ha verificado tras el ajuste.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; debe revisarse antes de cualquier despliegue en produccion.
- Naturaleza experimental: cero descargas y cero likes en el momento de la consulta, sin mantenimiento documentado; no apto como dependencia critica sin validacion propia.
- Carga del adaptador: requiere PEFT y las versiones de framework declaradas; posibles incompatibilidades con versiones antiguas de Transformers.
- Contexto: la longitud de contexto efectiva no se declara; no asumir la del modelo base sin verificacion empirica.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_speculative_kd
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset declarado: data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it (referencia interna del autor; no se proporciona URL publica)
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
