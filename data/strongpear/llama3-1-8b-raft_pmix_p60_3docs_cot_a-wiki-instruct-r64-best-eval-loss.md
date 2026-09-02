# strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario strongpear, que se aplica sobre el modelo base meta-llama/Llama-3.1-8B. El nombre del repositorio indica que fue entrenado mediante RAFT (Retrieval Augmented Fine-Tuning), una técnica que combina recuperación de documentos con ajuste fino supervisado, utilizando una mezcla de documentos (PMIX, P60, 3DOCS) y cadenas de razonamiento (CoT). El adaptador está orientado a tareas de instrucción sobre contenido de Wikipedia, como sugiere el sufijo "WIKI-Instruct".

Se trata de un adaptador PEFT de 0,7 GB que no incluye los pesos completos del modelo base, sino únicamente los deltas de LoRA con rango 64. Al estar basado en Llama 3.1 8B, hereda su arquitectura transformer con atención por grupos de consultas (GQA) y su ventana de contexto de 128K tokens. La relevancia de este modelo radica en explorar metodologías de ajuste fino con recuperación aumentada para mejorar la precisión factual en dominios específicos, aunque la información pública disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B) con adaptador LoRA |
| Parametros totales | 8.030 millones (modelo base) + adaptador LoRA r64 (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredada de Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible (formato PEFT safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero el adaptador no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B, un transformer autoregresivo con Grouped-Query Attention (GQA) y 32 capas, entrenado por Meta con 15 billones de tokens. Sobre esta base, el adaptador LoRA con rango 64 (r64) introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un ajuste eficiente con un número reducido de parámetros entrenables.

El nombre del repositorio sugiere el uso de RAFT (Retrieval Augmented Fine-Tuning), una metodología que entrena al modelo para generar respuestas basadas en documentos recuperados, combinando ejemplos con y sin contexto relevante. Los términos "PMIX" y "P60" probablemente indican proporciones de mezcla de documentos positivos y negativos durante el entrenamiento, mientras que "3DOCS" sugiere el uso de tres documentos por ejemplo. El entrenamiento incluye cadenas de razonamiento (CoT) y se realizó sobre un conjunto de instrucciones derivadas de Wikipedia. No se dispone de información sobre el número de tokens de entrenamiento, el dataset exacto ni el procedimiento de optimización.

## Capacidades

- Generacion de texto instructivo: el adaptador esta disenado para seguir instrucciones en tareas de respuesta a preguntas con soporte documental.
- Razonamiento con cadena de pensamiento (CoT): el entrenamiento incluye ejemplos de razonamiento paso a paso, lo que puede mejorar la calidad de las respuestas en tareas que requieren inferencia.
- Recuperacion aumentada: al estar entrenado con RAFT, el modelo esta optimizado para integrar documentos recuperados en la generacion de respuestas, reduciendo la dependencia exclusiva de la memoria parametrica.
- Capacidades heredadas de Llama 3.1 8B: generacion de texto, codigo, matematicas, tool calling y soporte multilingue (8 idiomas) en el modelo base, aunque el adaptador puede no preservarlas completamente.
- No se ha confirmado soporte de vision, audio ni otros modos multimodales.

## Casos de uso

- Respuesta a preguntas con soporte documental: el modelo puede utilizarse en sistemas de question answering donde se recuperan articulos de Wikipedia u otras fuentes y se genera una respuesta citando o sintetizando la informacion relevante, gracias a su entrenamiento con RAFT y multiples documentos.
- Sistemas RAG (Retrieval-Augmented Generation) en produccion: al estar optimizado para integrar documentos recuperados, puede desplegarse como generador en pipelines RAG para dominios como enciclopedias, manuales tecnicos o bases de conocimiento internas.
- Asistentes de estudio e investigacion: puede ayudar a estudiantes o investigadores a resumir y explicar conceptos a partir de articulos de Wikipedia, manteniendo fidelidad al contenido fuente gracias al entrenamiento con cadenas de razonamiento.
- Generacion de contenido enciclopedico: el modelo puede redactar entradas, resumenes o articulos breves basados en documentos de referencia, con un estilo instructivo y estructurado.
- Evaluacion de tecnicas de fine-tuning con recuperacion: sirve como punto de partida para investigadores que quieran comparar el rendimiento de RAFT frente a otros metodos de ajuste fino en tareas de conocimiento factual.
- Prototipado de agentes con tool calling: al heredar las capacidades de Llama 3.1 8B, puede integrarse en agentes que consulten herramientas externas de recuperacion y generen respuestas razonadas, aunque el adaptador no ha sido validado para este fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion, comparaciones con otros modelos ni datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Llama 3.1 8B, los requisitos son los del modelo base. En precision FP16, el modelo base ocupa aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits, puede reducirse a unos 6-7 GB.
- GPU recomendadas: para inferencia en FP16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A10G, L4). Con cuantizacion de 4 bits, cabe en GPUs de consumo como RTX 3060/4060 (12 GB) o RTX 3090.
- El adaptador PEFT debe cargarse junto con el modelo base; el peso adicional del adaptador es de 0,7 GB, despreciable frente al modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `transformers` y `peft` en Python. Para inferencia optimizada, puede fusionarse con el modelo base y exportarse a formatos compatibles con vLLM, TGI o llama.cpp (GGUF), aunque no se proporcionan instrucciones oficiales.
- Latencia y throughput: no disponibles. Dependen del hardware y del formato de cuantizacion elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-WIKI-Instruct-r64 | 8B + LoRA r64 | 128K | no disponible | PEFT safetensors | Adaptador RAFT sobre Llama 3.1 8B |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | safetensors | Modelo base instructivo de Meta |
| strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-LAW-Instruct-r64 | 8B + LoRA r64 | 128K | no disponible | PEFT safetensors | Variante del mismo autor entrenada sobre documentos legales |
| strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64 | 8B + LoRA r64 | 128K | no disponible | PEFT safetensors | Variante del mismo autor entrenada sobre documentos medicos |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros adaptadores o modelos de tamano similar.

## Limitaciones y advertencias

- Informacion publica muy limitada: la model card no proporciona detalles sobre el dataset de entrenamiento, los hiperparametros, el procedimiento de evaluacion ni los resultados. Esto dificulta la reproducibilidad y la evaluacion de la calidad del adaptador.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial o la redistribucion. El modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que debe respetarse.
- Riesgo de alucinacion: aunque el entrenamiento con RAFT busca reducir la dependencia de la memoria parametrica, el modelo puede generar informacion incorrecta si los documentos recuperados son irrelevantes o si la cadena de razonamiento se desvia.
- Sesgos heredados: al estar basado en Llama 3.1 8B, el adaptador hereda los sesgos presentes en los datos de entrenamiento del modelo base, que pueden incluir sesgos de genero, raza o culturales.
- Dominio limitado: el adaptador esta entrenado especificamente sobre contenido de Wikipedia; su rendimiento en otros dominios o estilos de texto puede degradarse significativamente.
- Sin garantias de produccion: no se han publicado pruebas de estabilidad, seguridad ni robustez. No se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva previa.
- Compatibilidad: al ser un adaptador PEFT, requiere cargar el modelo base meta-llama/Llama-3.1-8B, que debe descargarse por separado y esta sujeto a los terminos de uso de Meta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss
- Variante LAW (legal): https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss
- Variante MEDICAL: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de Llama 3.1 en DeepWiki: https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Pagina de Llama 3.1 8B en Ollama: https://ollama.com/library/llama3.1:8b
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models/blob/main/README.md
