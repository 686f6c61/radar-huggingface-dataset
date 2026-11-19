# talhasial/urdu-gemma-270m-cpt

## Resumen

urdu-gemma-270m-cpt es un adaptador LoRA de preentrenamiento continuado (continued pre-training, CPT) construido sobre google/gemma-3-270m, el modelo mas pequeno de la familia Gemma 3 de Google. Lo desarrolla Muhammad Talha Sial (usuario talhasial en Hugging Face) en el marco de su tesis de master *Exploiting large language models for improvements in Urdu NLP* en la Universidad Masaryk (2026). El objetivo es adaptar un modelo base de proposito general, con recursos muy limitados (270 millones de parametros), al urdu mediante exposicion masiva a texto de la web en ese idioma.

El adaptador se entrena con LoRA sobre aproximadamente 1.450 millones de tokens de un corpus de urdu extraido de la web, durante una epoca y 23.378 pasos. El resultado declarado por el autor es una reduccion de la perplejidad en el split de desarrollo de UD_Urdu-UDTB de 115,35 a 59,58, lo que indica una mejora sustancial en la modelizacion del idioma. El repositorio no contiene pesos completos sino el adaptador PEFT en safetensors, y el modelo base debe descargarse por separado.

Su relevancia es doble: por un lado, demuestra que es posible mejorar de forma medible el modelado del urdu con un presupuesto de computo muy bajo; por otro, sirve como referencia metodologica para preentrenamiento continuado con LoRA en lenguas de bajos recursos. No obstante, se trata de un artefacto de investigacion, sin pipeline declarado, sin descargas ni validacion por parte de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre el modelo base google/gemma-3-270m |
| Parametros totales | 270 millones (modelo base); numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea max_seq_length=2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Gemma 3, no confirmadas en esta ficha) |
| Idiomas soportados | Urdu (ur); el modelo base Gemma 3 es multilingue, pero el adaptador esta orientado exclusivamente al urdu |
| Licencia | other (sujeta a los Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 270M, un transformer decoder-only de la familia Gemma 3. El entrenamiento consiste en preentrenamiento continuado con LoRA sobre un corpus de urdu extraido de la web (no distribuido publicamente), durante una epoca completa y 23.378 pasos, lo que equivale a aproximadamente 1.450 millones de tokens procesados. No se especifican en la informacion disponible el rango del adaptador, el valor de alpha, la tasa de aprendizaje ni la composicion detallada del corpus.

La innovacion principal es metodologica: aplicar CPT con LoRA a un modelo de 270M para una lengua de bajos recursos, en lugar de entrenar desde cero o usar modelos mucho mayores. La metrica reportada, la perplejidad sobre UD_Urdu-UDTB (de 115,35 a 59,58), es la unica evidencia cuantitativa publicada. No se indica si hubo fases de alineacion (RLHF, DPO) ni ajuste instructivo; por el nombre del repositorio y la descripcion, se trata de un adaptador de modelado de lenguaje, no de un modelo conversacional.

## Capacidades

- Modelado de lenguaje en urdu: el adaptador mejora la prediccion del siguiente token sobre texto en urdu, segun la reduccion de perplejidad reportada.
- Generacion de texto en urdu: al ser un adaptador de CPT sobre un modelo base, puede generar texto, aunque sin ajuste instructivo explicito.
- Comprension de texto en urdu derivada del modelo base y del corpus de preentrenamiento.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al urdu en la practica; el modelo base es multilingue pero el adaptador no esta validado en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en NLP para urdu: punto de partida para experimentos de preentrenamiento continuado con LoRA en lenguas de bajos recursos, replicando la metodologia descrita en la tesis.
- Modelado de lenguaje y evaluacion de perplejidad: uso como referencia para medir la calidad de corpus en urdu mediante la perplejidad sobre UD_Urdu-UDTB u otros conjuntos.
- Generacion de texto en urdu en entornos con recursos muy limitados: al partir de un modelo de 270M, puede ejecutarse en hardware modesto, lo que facilita prototipos de generacion en urdu sin GPU de gama alta.
- Etiquetado y anotacion asistida de corpus en urdu: el modelo puede emplearse para predecir tokens o completar anotaciones en tareas de procesamiento linguistico, siempre con revision humana.
- Base para ajuste fino posterior: el adaptador CPT puede servir como inicializacion para tareas especificas en urdu (clasificacion, extraccion de informacion) mediante un segundo ajuste supervisado.
- Docencia y reproduccion de experimentos: util como ejemplo practico de uso de PEFT y Unsloth para adaptar modelos pequenos a nuevos idiomas, con codigo publicado en GitHub.

## Benchmarks y rendimiento

| Metrica | Modelo base (gemma-3-270m) | urdu-gemma-270m-cpt |
|---|---|---|
| Perplejidad en UD_Urdu-UDTB (dev) | 115,35 | 59,58 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo de 270M en precision completa (fp32) se situaria en torno a 1,1 GB solo de pesos, y en fp16/bf16 alrededor de 0,55 GB, mas el adaptador LoRA y el coste de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente; tambien A100 o H100 si se busca mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 4 GB o mas de VRAM, aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: el autor documenta carga mediante Unsloth (FastLanguageModel) y PEFT (PeftModel). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-gemma-270m-cpt | 270M (base) + adaptador LoRA | no disponible | CPT con LoRA en urdu | other (Gemma Terms) | Hugging Face, 0 descargas |
| google/gemma-3-270m | 270M | no disponible | Modelo base multilingue | Gemma Terms of Use | Hugging Face (oficial) |
| Otros adaptadores de urdu sobre modelos pequenos | no disponible | no disponible | CPT / ajuste fino | variable | no disponible |

No se dispone de informacion sobre modelos comparables especificos de urdu con los que contrastar rendimiento, contexto o licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de preentrenamiento continuado, no un modelo instructivo: no esta disenado para seguir instrucciones ni para conversacion sin un ajuste adicional.
- La unica metrica publicada es la perplejidad en un unico conjunto (UD_Urdu-UDTB dev); no hay evaluacion en tareas aguas abajo ni en otros dominios.
- El corpus de entrenamiento es de origen web y no se distribuye, por lo que no es posible auditar su composicion ni los sesgos que pueda contener; es previsible que herede sesgos del texto rastreado.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido facticamente incorrecto, especialmente en un modelo de 270M sin alineacion.
- El alcance linguistico es el urdu; no hay validacion en otros idiomas ni en variantes dialectales.
- Restricciones de licencia: el uso esta sujeto a los Gemma Terms of Use, que incluyen condiciones especificas para uso comercial y redistribucion; debe revisarse antes de cualquier despliegue en produccion.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la ficha; tratar como artefacto de investigacion no probado en produccion.
- No se documentan requisitos de hardware, latencia ni opciones de despliegue estandar, lo que complica su integracion en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-cpt
- Codigo y evaluacion: https://github.com/543516-collab/urdu-gemma-270m
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
