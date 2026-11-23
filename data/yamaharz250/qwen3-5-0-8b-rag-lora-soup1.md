# YAMAHARZ250/qwen3.5-0.8b-rag-lora-soup1

## Resumen

Qwen3.5-0.8B-rag-lora-soup1 es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B desarrollado por el usuario YAMAHARZ250 para la competicion final del curso "LLM Course 2 2026". Se trata de un modelo de 873.438.784 parametros (aproximadamente 0,87 mil millones) obtenido mediante la fusion por promedio de pesos de tres adaptadores LoRA previamente entrenados y fusionados sobre el modelo base. La arquitectura y la configuracion son identicas a las del modelo original; solo cambian los valores de los parametros.

El modelo esta especializado en tareas de generacion aumentada por recuperacion (RAG) sobre dominio japones, ya que los datos de entrenamiento provienen de los conjuntos NIILC QA, JEMHopQA y fragmentos derivados de la Wikipedia japonesa. El proceso de construccion de datos fue mecanico: solo se seleccionaron preguntas cuya cadena de respuesta aparecia en los cinco fragmentos recuperados de mayor puntuacion, lo que orienta el ajuste hacia la utilizacion de contexto recuperado.

Su relevancia practica es limitada fuera del ambito de la competicion: no tiene descargas ni interacciones en el momento de la consulta, no se publican resultados de benchmarks y la model card no detalla hiperparametros de entrenamiento ni el proceso de fusion mas alla de indicar que se trata de un promedio de pesos con igual ponderacion. Resulta util como referencia de tecnica de model merging aplicada a modelos pequenos para RAG en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; sin cambios en config) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible oficialmente; los datos de ajuste son en japones |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,87 mil millones de parametros. No se introducen cambios estructurales: la model card indica explicitamente que la arquitectura y la configuracion son identicas al modelo base y que solo se modificaron los valores de los parametros. El modelo resultante se obtuvo mediante un promedio de pesos con igual ponderacion (weight averaging / model merging) de tres adaptadores LoRA fusionados previamente: qwen3.5-0.8b-rag-lora-final, qwen3.5-0.8b-rag-lora-v2s1 y qwen3.5-0.8b-rag-lora-v2s2.

Los datos de entrenamiento combinan NIILC QA, JEMHopQA y un conjunto de fragmentos distribuidos derivado de la Wikipedia japonesa, todos bajo licencia CC BY-SA 4.0. La construccion de ejemplos fue mecanica: solo se conservaron preguntas cuya respuesta aparecia literalmente en los cinco fragmentos recuperados de mayor puntuacion, lo que alinea el entrenamiento con el escenario de inferencia RAG. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada por contexto recuperado, orientada a responder preguntas a partir de pasajes.
- Respuesta a preguntas de tipo QA sobre documentos, con enfasis en el dominio japones segun los datos de ajuste.
- Manejo de preguntas multihop, ya que JEMHopQA es un conjunto de QA multihop.
- Capacidad de razonamiento y generacion general heredada del modelo base Qwen3.5-0.8B (no cuantificada en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los datos de ajuste son en japones.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Sistemas de pregunta-respuesta sobre documentacion corporativa en japones: el modelo se ha ajustado con pares pregunta-fragmento donde la respuesta aparece en los cinco fragmentos recuperados, por lo que encaja en pipelines RAG que inyectan contexto y esperan una respuesta extractiva o sintetizada.
- Asistentes de busqueda interna con recuperacion de pasajes: al haber sido entrenado con fragmentos de Wikipedia japonesa, puede emplearse para responder consultas sobre conocimiento enciclopedico en japones cuando el contexto se proporciona en el prompt.
- QA multihop sobre bases documentales: JEMHopQA aporta ejemplos que requieren combinar informacion de varias fuentes, lo que permite usar el modelo en flujos donde el recuperador entrega varios fragmentos y el modelo debe integrarlos.
- Prototipado rapido en entornos con recursos limitados: con menos de mil millones de parametros, el modelo puede ejecutarse en GPUs de consumo y servir como banco de pruebas para pipelines RAG antes de escalar a modelos mayores.
- Evaluacion de tecnicas de model merging: el repositorio documenta las revisiones exactas de los tres modelos fusionados, lo que lo convierte en un caso reproducible para estudiar el promedio de pesos con igual ponderacion en modelos pequenos.
- Filtrado y validacion de respuestas en sistemas de recuperacion: puede emplearse como componente que verifica si un pasaje recuperado contiene la respuesta a una pregunta, dado el criterio de seleccion de datos utilizado en el entrenamiento.
- Experimentacion academica en cursos y competiciones: al estar publicado con licencia Apache-2.0 y un tamano reducido, es adecuado como punto de partida para ejercicios de ajuste fino y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano (873 millones de parametros), en FP16 los pesos ocuparian aproximadamente 1,7 GB y en cuantizacion de 8 bits alrededor de 0,9 GB, sin contar cache KV ni overhead del runtime. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del modelo, es previsible que quepa en GPUs de consumo con suficiente VRAM, pero no se documenta ninguna prueba concreta.
- Opciones de despliegue: no disponible en la informacion proporcionada; el repositorio solo publica pesos en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| YAMAHARZ250/qwen3.5-0.8b-rag-lora-soup1 | 873.438.784 | no disponible | Apache-2.0 | Fusion de LoRA para RAG en japones | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B (segun nombre) | no disponible | Apache-2.0 (segun model card del ajuste) | Modelo generalista | Hugging Face |
| YAMAHARZ250/qwen3.5-0.8b-rag-lora-final | no disponible | no disponible | no disponible | Uno de los tres LoRA fusionados | Hugging Face |
| YAMAHARZ250/qwen3.5-0.8b-rag-lora-v2s1 | no disponible | no disponible | no disponible | Uno de los tres LoRA fusionados | Hugging Face |

No se dispone de datos de rendimiento comparativo con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Wikipedia japonesa y conjuntos de QA academicos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible; el ajuste orientado a RAG no garantiza que el modelo se abstenga de responder sin contexto.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el ajuste se realizo exclusivamente con datos en japones, por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, pero los datos de entrenamiento (NIILC QA, JEMHopQA y fragmentos de Wikipedia japonesa) estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Falta de documentacion de produccion: no se detallan hiperparametros de entrenamiento, numero de tokens, proceso de fusion mas alla del promedio equitativo ni evaluaciones; el modelo tiene 0 descargas y 0 interacciones, sin validacion externa.
- Ambito acotado: fue construido para una competicion de curso, por lo que su uso en produccion requiere una evaluacion propia y probablemente un ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-soup1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- LoRA fusionado 1: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-final
- LoRA fusionado 2: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-v2s1
- LoRA fusionado 3: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-v2s2
- Dataset NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Conjunto de fragmentos del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
