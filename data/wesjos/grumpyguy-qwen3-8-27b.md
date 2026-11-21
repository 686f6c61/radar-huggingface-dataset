# wesjos/GrumpyGuy-Qwen3.8-27B

## Resumen

GrumpyGuy-Qwen3.8-27B es un ajuste fino (fine-tune) publicado por el usuario wesjos sobre el modelo base unsloth/Qwen3.8-27B-unsloth-bnb-4bit, una version cuantizada en 4 bits del modelo Qwen3.8-27B de la familia Qwen. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado con la arquitectura qwen3_5, lo que lo situa en la estirpe de transformers densos de Qwen con capacidades multimodales (pipeline image-text-to-text).

El repositorio contiene 27.781.427.952 parametros reales en formato safetensors (aproximadamente 27,8 mil millones), con un tamano total de 55,6 GB, coherente con pesos en precision de 16 bits derivados de un entrenamiento sobre una base cuantizada en 4 bits. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un flujo de ajuste supervisado (SFT) o preferencias sobre la base cuantizada.

La relevancia de este modelo es limitada pero concreta: se trata de un fine-tune comunitario, sin datos publicados de benchmarks ni de composicion del dataset, orientado a conversacion en ingles y con soporte multimodal heredado del modelo base. Su interes practico reside en evaluar si el ajuste aporta un estilo o comportamiento especifico (el nombre "GrumpyGuy" sugiere un tono gruñon o sarcastico) sobre las capacidades del Qwen3.8-27B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, multimodal image-text-to-text) |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base entrenada sobre bnb-4bit; pesos publicados en safetensors (precisión no especificada, repo de 55,6 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura qwen3_5 del modelo base Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parametros con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de contexto del modelo base en la informacion proporcionada.

El ajuste fino fue realizado por wesjos partiendo de unsloth/Qwen3.8-27B-unsloth-bnb-4bit, una version cuantizada en 4 bits optimizada para entrenamiento con Unsloth. El autor declara que el entrenamiento fue "2x mas rapido" gracias a Unsloth y TRL, pero no se especifican el dataset, el numero de tokens, la tecnica exacta (SFT, DPO, ORPO) ni hiperparametros. No hay informacion sobre RLHF ni sobre innovaciones tecnicas adicionales mas alla del uso de Unsloth para eficiencia de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.8-27B.
- Procesamiento multimodal image-text-to-text: el pipeline declarado permite entrada de imagenes junto con texto.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen, aunque no verificadas en este fine-tune concreto.
- Soporte de conversacion multi-turno (tag conversational).
- Compatibilidad con text-generation-inference y endpoints_compatible, lo que facilita su despliegue en infraestructuras TGI.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad marcada: el ajuste "GrumpyGuy" puede emplearse para experimentar con tonos sarcasticos o gruñones en chatbots, evaluando como el fine-tune modifica el estilo del Qwen3.8-27B base en conversaciones multi-turno.
- Investigacion sobre fine-tuning con Unsloth: sirve como ejemplo reproducible de un ajuste sobre base bnb-4bit con TRL, util para estudiar el impacto de la cuantizacion previa en el resultado final.
- Procesamiento de documentos con imagenes: al heredar el pipeline image-text-to-text, puede emplearse para describir imagenes o responder preguntas sobre capturas y diagramas en ingles.
- Generacion de respuestas con tono controlado en entornos de prueba: util para comparar estilos de respuesta frente al modelo base en tareas de evaluacion subjetiva.
- Despliegue en TGI para pruebas de latencia: al ser compatible con text-generation-inference, permite medir el rendimiento de un modelo de 27,8 B en infraestructura propia antes de comprometerse con el modelo base.
- Base para nuevos fine-tunes comunitarios: dado que parte de una base cuantizada y se distribuye en safetensors, puede servir como punto de partida para ajustes adicionales con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55-56 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para contexto largo.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 28-30 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF/AWQ/GPTQ): aproximadamente 15-18 GB, aunque no se confirma que existan estos formatos publicados en el repo.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precision completa; en consumer, RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva a 4 bits y contexto reducido.
- Cabe en consumer GPU: si, en RTX 4090 o RTX 3090 con cuantizacion 4 bits, sujeto a disponibilidad de pesos GGUF (no confirmada).
- Opciones de despliegue: transformers, text-generation-inference (TGI) por la etiqueta endpoints_compatible; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GrumpyGuy-Qwen3.8-27B | 27,8 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune comunitario multimodal |
| Qwen3.8-27B (base) | 27,8 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo original de Qwen |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit | 27,8 B | no disponible | no disponible en esta ficha | Hugging Face | Base cuantizada 4-bit usada para el fine-tune |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia cuantitativa de que el fine-tune mantenga o mejore las capacidades del Qwen3.8-27B base.
- Riesgo de degradacion por el ajuste: al partir de una base cuantizada en 4 bits y entrenar con Unsloth, pueden aparecer perdidas de calidad respecto al modelo original en tareas de razonamiento o codigo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, sin datos especificos de mitigacion en este fine-tune.
- Sesgos: no documentados; el nombre "GrumpyGuy" sugiere un estilo deliberadamente brusco que puede no ser apropiado para produccion sin evaluacion previa.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto no esta especificada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y la base Unsloth pueden tener condiciones adicionales que conviene verificar antes de desplegar.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, lo que reduce la confianza en su calidad y mantenimiento.
- Formato: solo safetensors; no hay GGUF ni otras cuantizaciones publicadas, lo que limita el despliegue en hardware consumer sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/wesjos/GrumpyGuy-Qwen3.8-27B
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
