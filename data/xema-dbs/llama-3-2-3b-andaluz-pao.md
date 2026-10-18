# xema-dbs/Llama-3.2-3B-Andaluz-PAO

## Resumen

Llama-3.2-3B-Andaluz-PAO es un ajuste fino (fine-tune) del modelo unsloth/Llama-3.2-3B-Instruct-bnb-4bit, publicado por el usuario xema-dbs en HuggingFace. Se trata, por tanto, de un modelo derivado de la familia Llama 3.2 en su variante de 3.000 millones de parametros, specializada en instrucciones y conversacion, sobre la que el autor ha aplicado un entrenamiento adicional con Unsloth y la libreria TRL de HuggingFace. El repositorio contiene 3.212.749.824 parametros en formato safetensors (6,4 GB, compatible con pesos de 16 bits) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion es limitada y hay que enmarcarla con honestidad: la model card es minima (no documenta dataset, hiperparametros, numero de pasos ni evaluaciones), el repositorio no registra descargas ni interacciones, y la unica informacion tecnica disponible es que el entrenamiento se realizo con Unsloth, que el autor afirma que fue "2x mas rapido" y que el modelo base es un checkpoint ya cuantizado a 4 bits. El nombre sugiere una especializacion en andaluz, pero la etiqueta de idioma declarada es unicamente `en`, lo que contradice esa intuicion y no hay documentacion que la respalde.

En la practica, debe tratarse como un experimento de ajuste fino personal mas que como un modelo listo para produccion: no hay benchmarks publicados, no hay descripcion del corpus de entrenamiento y no se especifica que capacidad concreta mejora respecto al modelo base. Su interes editorial es el de un ejemplo reproducible de pipeline Unsloth + TRL sobre Llama 3.2 3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (hereda la del modelo base unsloth/Llama-3.2-3B-Instruct-bnb-4bit); detalles de capas y atencion no documentados en la model card |
| Parametros totales | 3.212.749.824 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.2 3B-Instruct declara hasta 128.000 tokens segun la documentacion de Meta |
| Tipos de cuantizacion | El modelo base fue cuantizado a 4 bits (bnb-4bit) para el entrenamiento; los pesos publicados en safetensors (6,4 GB para 3,2B parametros) corresponden a precision de 16 bits. No se publican variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | `en` (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Llama 3.2 en su variante de 3B parametros, con atencion causal y el tokenizador de la familia Llama 3. La model card no aporta ningun detalle adicional sobre numero de capas, dimension oculta, cabezas de atencion, uso de GQA o estrategia de RoPE, por lo que cualquier cifra concreta sobre estos elementos debe consultarse en la documentacion oficial del modelo base, no en este repositorio.

El proceso de ajuste fino se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de un checkpoint ya cuantizado a 4 bits (unsloth/Llama-3.2-3B-Instruct-bnb-4bit). No se documentan el dataset utilizado, el numero de tokens de entrenamiento, la composicion del corpus, la existencia de fases de RLHF o DPO posteriores, la longitud de secuencia empleada ni los hiperparametros (learning rate, rango de LoRA, epochs). La unica afirmacion tecnica del autor es que el entrenamiento fue "2x mas rapido" gracias a Unsloth, una cifra que no se acompana de mediciones ni de comparaciones reproducibles. Tampoco se indica si el resultado final se fusiono (merge) con los pesos base o si se mantienen adaptadores, aunque el tamano del repositorio (6,4 GB, coherente con pesos de 16 bits para 3,2B parametros) sugiere una fusion completa de los pesos.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-3.2-3B-Instruct, conserva el formato de chat con roles system/user/assistant y la capacidad de mantener dialogos multi-turno.
- Seguimiento de instrucciones: el ajuste se realiza sobre un checkpoint ya alineado para instrucciones, por lo que se espera que mantenga ese comportamiento, aunque no hay evaluaciones que lo confirmen tras el fine-tune.
- Razonamiento basico y tareas de conocimiento general: capacidad heredada del modelo base de 3B parametros; no se documenta ninguna mejora especifica.
- Generacion de codigo: capacidad limitada por el tamano del modelo (3B) y no evaluada en este repositorio.
- Soporte de tool calling / function calling: no documentado; el modelo base Llama 3.2 3B-Instruct incluye plantillas para ello, pero no hay confirmacion de que el fine-tune las preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: la model card declara unicamente ingles; a pesar del nombre "Andaluz", no hay evidencia de soporte de espanol ni de variedades dialectales del espanol.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad de despliegue: etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI o con Inference Endpoints de HuggingFace.

## Casos de uso

- Experimentacion con pipelines de ajuste fino: sirve como referencia practica de un flujo Unsloth + TRL sobre un checkpoint cuantizado a 4 bits, util para equipos que quieran replicar la receta con sus propios datos.
- Pruebas de concepto de asistentes conversacionales en ingles: con 3,2B parametros y pesos de 16 bits, se puede desplegar en una unica GPU de consumo para prototipos de chat multi-turno donde la latencia importa mas que la calidad punta.
- Generacion de texto a pequena escala en local: resumenes, reescritura y clasificacion de textos cortos en ingles sobre hardware modesto, aceptando la perdida de calidad frente a modelos mayores.
- Evaluacion comparativa de fine-tunes: como punto de partida en estudios sobre el impacto de ajustes finos no documentados frente al modelo base original.
- Docencia y formacion: ejemplo de publicacion en HuggingFace con model card minima, util para ilustrar buenas practicas de documentacion de modelos y sus carencias.
- Base para nuevos ajustes: al estar en Apache 2.0 y en safetensors, puede reutilizarse como punto de partida de experimentos posteriores, siempre que se valide antes su calidad real.
- Despliegue en entornos con restricciones de VRAM: cuantizado a 8 o 4 bits ocupa aproximadamente 3,5 GB y 2 GB respectivamente, lo que permite ejecutarlo en GPUs de gama media o en CPU con llama.cpp tras convertir los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web realizada no ha devuelto enlaces tecnicos relevantes sobre este modelo (los resultados obtenidos no guardan relacion con el). Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (pesos publicados, 6,4 GB): aproximadamente 7-8 GB contando cache KV y overhead del runtime.
- VRAM estimada en 8 bits: aproximadamente 4-5 GB.
- VRAM estimada en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 2,5-3,5 GB, con contexto moderado.
- GPU recomendadas: para 16 bits, RTX 4070/4080/4090 (12-24 GB), L4 (24 GB), A10G (24 GB); para 4 bits, RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, e incluso iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas en 16 bits y en GPUs de 4-6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (formato nativo), TGI (etiqueta `text-generation-inference`), Inference Endpoints de HuggingFace, vLLM (requiere pesos en 16 bits y GPU), llama.cpp/Ollama (requiere conversion previa a GGUF, no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Como referencia de orden de magnitud para un modelo de 3B en 16 bits sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero es una estimacion no verificada para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xema-dbs/Llama-3.2-3B-Andaluz-PAO | 3.212.749.824 | No documentado en la model card (el base declara 128.000) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune sin evaluaciones ni dataset documentado |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit (modelo base) | 3.212.749.824 | 128.000 tokens (segun documentacion de Llama 3.2) | Apache 2.0 | HuggingFace, ampliamente utilizado | Checkpoint cuantizado a 4 bits para entrenamiento; referencia directa de comparacion |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.824 | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace | Modelo original de Meta, con evaluaciones publicadas y gated access |
| Qwen2.5-3B-Instruct | ~3.090 millones | 32.768 tokens (128K en variantes extendidas) | Apache 2.0 | HuggingFace | Alternativa de tamano similar con buen rendimiento en codigo y matematicas segun sus publicaciones |
| Gemma 2 2B Instruct | ~2.600 millones | 8.192 tokens | Licencia Gemma | HuggingFace (gated) | Alternativa algo menor, contexto mas corto |

No se dispone de datos de rendimiento de este fine-tune que permitan una comparacion cuantitativa con las alternativas; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni validacion humana publicada, por lo que se desconoce si el fine-tune mejora o degrada al modelo base.
- Dataset de entrenamiento no documentado: no se puede auditar la procedencia de los datos, lo que impide descartar sesgos, contaminacion o inclusion de contenido problematico.
- Idiomas: la model card declara solo `en`; el nombre "Andaluz" no se corresponde con ninguna evidencia tecnica de soporte de espanol o de dialecto andaluz, y no hay datos que lo respalden.
- Riesgo de alucinacion: inherente a un modelo de 3B parametros, y potencialmente agravado por un ajuste fino sin evaluacion; no debe usarse en dominios factuales sin verificacion.
- Entrenamiento sobre un checkpoint cuantizado a 4 bits: partir de pesos con cuantizacion puede introducir artefactos numericos que no estan caracterizados en la model card.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo; conviene revisar tambien las condiciones del modelo base de Meta en la cadena de derivacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados por terceros.
- Model card practicamente vacia: sin hiperparametros, sin version de Unsloth/TRL, sin semilla ni fecha de entrenamiento, lo que dificulta la reproducibilidad.
- No se incluyen pesos GGUF ni cuantizaciones listas para usar; cualquier despliegue en CPU o en GPUs pequenas exige conversion y validacion propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xema-dbs/Llama-3.2-3B-Andaluz-PAO
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

Nota: la busqueda web realizada no ha devuelto enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos corresponden a sitios sin relacion con el contenido de la ficha y se han descartado.
