# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario strongpear, construido sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre del repositorio sugiere que se trata de un fine-tuning con la técnica RAFT (Retrieval-Augmented Fine-Tuning), con una mezcla de prompts (PMIX), un porcentaje de recuperación del 80 % (P80), tres documentos por consulta (3DOCS), generación con cadena de pensamiento (CoT) y entrenamiento sobre un corpus de Wikipedia en modo instruct (A-WIKI-Instruct), con rango LoRA de 64 y seleccionado por mejor pérdida de validación.

El adaptador está diseñado para mejorar las capacidades de generación de texto con recuperación de documentos, probablemente orientado a tareas de respuesta a preguntas o generación aumentada por recuperación (RAG). Sin embargo, la model card es prácticamente vacía: no se proporcionan detalles sobre el entrenamiento, los datos, la licencia, los idiomas ni los resultados de evaluación. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento reciente o de baja difusión. A pesar de la falta de documentación, el interés técnico radica en que demuestra una aplicación práctica de RAFT sobre Llama 3.1, un método que combina fine-tuning con recuperación de documentos para mejorar la fidelidad y la capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Llama-3.1-8B) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 64, pero el numero exacto de parametros entrenables no se indica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Llama-3.1-8B soporta 128K tokens, pero el adaptador no especifica si se mantiene) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponible (el modelo base soporta ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, pero el adaptador no indica restricciones) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado a Llama-3.1-8B, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion por ventanas con deslizamiento. El nombre del repositorio indica que se ha utilizado el metodo RAFT (Retrieval-Augmented Fine-Tuning), que consiste en entrenar el modelo para que use documentos recuperados como contexto adicional durante la generacion. La nomenclatura "PMIX_P80_3DOCS" sugiere una mezcla de prompts con un 80 % de ejemplos que incluyen documentos recuperados y un 20 % sin ellos, y tres documentos por consulta. El sufijo "CoT_A" apunta a que se ha incorporado una cadena de pensamiento (chain-of-thought) en el entrenamiento, probablemente para mejorar el razonamiento paso a paso. El dataset se indica como "WIKI", lo que sugiere que se ha utilizado un corpus de Wikipedia, aunque no se especifica la version ni el preprocesado.

No se proporcionan hiperparametros de entrenamiento (tasa de aprendizaje, epochs, batch size, etc.) ni detalles sobre el regimen de precision (fp16, bf16, etc.). Tampoco se indica si se ha aplicado RLHF o DPO. La unica informacion tecnica confirmada es que se ha usado la libreria PEFT 0.20.0 y que el adaptador se ha guardado en formato safetensors.

## Capacidades

- Generacion de texto: hereda las capacidades generativas del modelo base Llama-3.1-8B, incluyendo redaccion, resumen y respuesta a preguntas.
- Razonamiento con cadena de pensamiento: el nombre del modelo indica que se ha entrenado con CoT, por lo que es probable que muestre mejoras en tareas de razonamiento multi-paso, aunque no hay evaluaciones publicadas que lo confirmen.
- Recuperacion aumentada: el entrenamiento con RAFT sugiere que el modelo esta optimizado para aprovechar documentos recuperados como contexto, lo que lo hace util para sistemas RAG.
- Tool calling: no se menciona soporte especifico, pero el modelo base Llama-3.1-8B soporta function calling; el adaptador podria heredarlo, aunque no esta confirmado.
- Multilingue: el modelo base soporta ocho idiomas, pero no se sabe si el adaptador mantiene esa cobertura o se ha especializado en un unico idioma (probablemente ingles, dado el uso de Wikipedia).
- Capacidades especiales: no se indican capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Sistemas de respuesta a preguntas con recuperacion: el modelo puede integrarse en un pipeline RAG donde se recuperan tres documentos relevantes y se genera una respuesta razonada. Su entrenamiento con RAFT lo hace adecuado para este escenario, ya que ha sido optimizado para usar el contexto recuperado de forma efectiva.
- Asistentes de estudio o enciclopedicos: dado el entrenamiento sobre Wikipedia, puede utilizarse para responder consultas factuales con citas o explicaciones detalladas, aunque se debe verificar la exactitud de las respuestas.
- Generacion de resumenes con soporte documental: en entornos donde se dispone de varios documentos fuente, el modelo puede generar resumenes que integren informacion de los tres documentos recuperados, mejorando la cobertura y la coherencia.
- Razonamiento paso a paso en entornos educativos: gracias al entrenamiento con CoT, puede descomponer problemas complejos en pasos intermedios, util para tutoria automatica o explicaciones pedagogicas.
- Prototipado de agentes con recuperacion: el adaptador puede servir como base para experimentos de agentes que necesiten consultar una base de conocimiento antes de actuar, aprovechando la capacidad de tool calling del modelo base.
- Investigacion en fine-tuning con RAFT: para investigadores interesados en reproducir o comparar metodos de recuperacion aumentada, este adaptador ofrece un punto de partida, aunque sin documentacion detallada su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan resultados con el modelo base ni con otros adaptadores. La unica referencia al rendimiento es el nombre del archivo, que indica "best-eval-loss", pero no se especifica el valor de esa perdida ni el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeno (0.7 GB), pero al cargarse sobre Llama-3.1-8B, la VRAM necesaria depende del modelo base. Con cuantizacion de 4 bits, se necesitan aproximadamente 6-8 GB de VRAM; con precision completa (fp16), alrededor de 16 GB.
- GPU recomendadas: para inferencia con el modelo base en fp16, una GPU con 16 GB de VRAM como la RTX 4090, A100 (40 GB) o H100 (80 GB) es adecuada. Con cuantizacion 4 bits, una RTX 3060 (12 GB) o RTX 4070 (12 GB) puede ser suficiente.
- Compatibilidad con GPU de consumo: si, el modelo base de 8B cabe en GPUs de consumo con cuantizacion (por ejemplo, 4 bits en una RTX 3060 o superior). El adaptador LoRA se puede fusionar con el modelo base o cargarse por separado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft`. Tambien es compatible con vLLM, llama.cpp y Ollama si se fusiona previamente con el modelo base y se convierte a GGUF.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, Llama-3.1-8B en una A100 genera aproximadamente 100-200 tokens por segundo en fp16, pero el adaptador no altera significativamente la velocidad de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores RAFT comparables publicados por el mismo autor. Se puede comparar con el modelo base Llama-3.1-8B-Instruct y con otros adaptadores LoRA de la misma familia, pero no hay datos de rendimiento para establecer una comparacion cuantitativa. La siguiente tabla resume las diferencias estructurales:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 Community License | safetensors | Modelo base de Meta, con instrucciones y tool calling |
| Este adaptador (strongpear) | 8B + LoRA r64 | No disponible | No disponible | safetensors (PEFT) | Adaptador RAFT sobre Wikipedia, sin documentacion |
| Otros adaptadores LoRA de strongpear (p.ej. variantes LAW) | 8B + LoRA r64 | No disponible | No disponible | safetensors (PEFT) | Misma familia, pero con datasets distintos (LAW vs WIKI) |

## Limitaciones y advertencias

- Falta de documentacion: la model card no contiene informacion sobre el entrenamiento, los datos, los hiperparametros ni los resultados. Esto impide evaluar la calidad y la reproducibilidad del adaptador.
- Sesgos desconocidos: al entrenarse sobre Wikipedia, el modelo puede heredar los sesgos presentes en ese corpus, como el sesgo de cobertura hacia temas occidentales o la falta de representacion de ciertas culturas.
- Riesgo de alucinacion: aunque el entrenamiento con RAFT puede reducir la alucinacion al anclar la generacion en documentos recuperados, no se ha verificado su eficacia. El modelo base Llama-3.1-8B ya presenta alucinaciones en contextos ambiguos.
- Licencia no especificada: al no indicarse la licencia, no se puede determinar si el adaptador puede usarse comercialmente. El modelo base Llama-3.1-8B tiene una licencia comunitaria que permite uso comercial con ciertas restricciones, pero el adaptador podria tener condiciones adicionales.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el adaptador podria haber sido entrenado con una longitud de contexto menor, lo que degradaria el rendimiento con entradas largas.
- Sin soporte garantizado: al ser un repositorio con 0 descargas y sin mantenimiento visible, no hay garantia de soporte ni de correccion de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss
- Variante con dataset LAW (referencia del mismo autor): https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss
- Variante con P60 y dataset LAW: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss/tree/main
- Documentacion de Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Pagina de Llama 3.1 8B en Ollama: https://ollama.com/library/llama3.1:8b
- Informacion de Llama-v3.1-8B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/llama_v3_1_8b_instruct
