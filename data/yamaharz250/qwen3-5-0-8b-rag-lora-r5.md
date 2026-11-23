# YAMAHARZ250/qwen3.5-0.8b-rag-lora-r5

## Resumen

Qwen3.5-0.8B-rag-lora-r5 es un ajuste fino mediante LoRA (r=16, alpha=32, all-linear) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario YAMAHARZ250 para la competicion final del curso "LLM Course 2 2026". El adaptador LoRA se ha fusionado (merged) en los pesos del modelo base, por lo que la arquitectura y la configuracion son identicas a las del modelo original; solo cambian los valores de los parametros. El modelo cuenta con 873.438.784 parametros y un tamano de repositorio de 1,8 GB en formato safetensors.

El objetivo del ajuste es mejorar el comportamiento en tareas de generacion aumentada por recuperacion (RAG) sobre dominios en japones, concretamente preguntas y respuestas extraidas de los conjuntos NIILC QA, JEMHopQA y fragmentos derivados de Wikipedia en japones. La receta introduce una variacion concreta respecto a la version anterior del mismo autor: en aproximadamente la mitad de las preguntas de entrenamiento cuya respuesta estaba en el pasaje mejor rankeado, se reordenaron los pasajes para colocar fragmentos sin la respuesta en las primeras posiciones, desplazando el pasaje correcto a las posiciones 2-5. Esto busca que el modelo aprenda a localizar la evidencia relevante aunque no aparezca en el primer fragmento recuperado.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a la evaluacion academica de pipelines RAG en japones. Su interes practico reside en servir como referencia reproducible de un ajuste LoRA fusionado sobre un modelo pequeno (sub-1000M) con licencia Apache-2.0, lo que facilita su inspeccion y su uso como linea base en experimentos de robustez frente al orden de los pasajes recuperados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (identica a Qwen/Qwen3.5-0.8B; solo cambian los valores de los parametros) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son en japones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B, sin modificaciones estructurales: el autor indica explicitamente que la arquitectura y la configuracion son identicas al modelo base y que solo se han alterado los valores de los parametros. El ajuste se realizo mediante LoRA con rango r=16, alpha=32, aplicado a todas las capas lineales (all-linear), durante 1 epoca con una tasa de aprendizaje de 1e-4, y posteriormente se fusiono en los pesos base.

Los datos de entrenamiento combinan NIILC QA y JEMHopQA (ambos bajo CC BY-SA 4.0, filtrados y reformateados), junto con un conjunto de fragmentos distribuidos derivado de Wikipedia en japones (dataset bumbuboon/llm-course-final-2026, CC BY-SA 4.0) usado sin modificar para recuperar los pasajes emparejados con las preguntas. La seleccion de ejemplos fue mecanica: solo se usaron preguntas cuya cadena de respuesta aparece en los cinco fragmentos recuperados de mayor rango. La innovacion metodologica respecto a la version previa (qwen3.5-0.8b-rag-lora-final) es el reordenamiento controlado de pasajes con semilla aleatoria fija para forzar el pasaje con respuesta a las posiciones 2-5 en aproximadamente la mitad de los casos. No se menciona el uso de RLHF, DPO ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas y de razonamiento multi-salto sobre pasajes recuperados (entrenado con JEMHopQA, que requiere razonamiento sobre multiples saltos).
- Localizacion de evidencia en contextos RAG donde el pasaje relevante no ocupa la primera posicion, gracias al reordenamiento de pasajes durante el entrenamiento.
- Procesamiento de texto en japones, idioma de todos los conjuntos de datos de entrenamiento citados.
- Ajuste especifico para el formato de preguntas y respuestas de NIILC QA y JEMHopQA.
- Capacidades heredadas del modelo base Qwen3.5-0.8B: no se detallan en la model card.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez de pipelines RAG: el modelo sirve como linea base para medir cuanto degrada la calidad de respuesta cuando el recuperador coloca el pasaje correcto en posiciones 2-5 en lugar de la primera, que es precisamente el escenario simulado en el entrenamiento.
- Preguntas y respuestas sobre documentacion tecnica en japones: puede emplearse para responder consultas extractivas sobre corpus japoneses una vez recuperados los fragmentos, aprovechando su ajuste sobre NIILC QA.
- Razonamiento multi-salto sobre fuentes japonesas: el entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren combinar informacion de varios pasajes, como consultas sobre entidades y relaciones en Wikipedia en japones.
- Prototipado academico y docencia: al ser un modelo de 873M parametros con licencia Apache-2.0 y pesos safetensors fusionados, es util para reproducir experimentos de ajuste LoRA y comparar recetas en cursos o trabajos de investigacion.
- Linea base en competiciones de QA: sirve como referencia reproducible (receta, datos y semilla documentados) frente a la que comparar variantes de recuperacion o de ajuste.
- Despliegue ligero en entornos con recursos limitados: su tamano inferior a 1000M parametros permite ejecutarlo en hardware modesto para tareas de QA extractiva, aunque no se han publicado requisitos ni latencias concretas.
- Filtrado y verificacion de respuestas en sistemas RAG: puede usarse para comprobar si un pasaje recuperado contiene la respuesta a una pregunta, dado su entrenamiento en la deteccion de evidencia en fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa por tamano (873M parametros), en fp16 serian aproximadamente 1,7 GB de pesos y en cuantizacion de 8 bits alrededor de 0,9 GB, sin contar overhead de activaciones ni cache KV; no se han publicado mediciones para este modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de 873M parametros es en principio ejecutable en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documentan en la model card. El formato safetensors es compatible con frameworks de inferencia habituales, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| YAMAHARZ250/qwen3.5-0.8b-rag-lora-r5 | 873.438.784 | no disponible | apache-2.0 | Ajuste LoRA fusionado con reordenamiento de pasajes; especializado en RAG en japones |
| YAMAHARZ250/qwen3.5-0.8b-rag-lora-final | no disponible | no disponible | no disponible | Version previa del mismo autor con la misma receta y datos, sin el reordenamiento de pasajes |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | apache-2.0 | Modelo base sin ajuste; arquitectura y configuracion identicas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no ha sido validado por la comunidad.
- Entrenado exclusivamente con datos en japones (NIILC QA, JEMHopQA y fragmentos de Wikipedia en japones); su comportamiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; el ajuste extractivo no elimina la posibilidad de generar respuestas no sustentadas por los pasajes.
- La seleccion de ejemplos de entrenamiento fue mecanica y limitada a preguntas cuya respuesta aparece en el top-5 de fragmentos recuperados, lo que puede sesgar el modelo hacia ese regimen de recuperacion.
- No se documentan sesgos conocidos, pero los datos derivan de Wikipedia y de conjuntos academicos japoneses, con los sesgos propios de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- No se especifican longitud de contexto, tipos de cuantizacion ni idiomas soportados, lo que limita la planificacion de despliegues en produccion.
- El reordenamiento artificial de pasajes puede no reflejar la distribucion real de un recuperador en produccion, lo que afecta a la generalizacion del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-r5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version previa del autor: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-final
- Dataset del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- NIILC QA: https://github.com/mynlp/niilc-qa
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
