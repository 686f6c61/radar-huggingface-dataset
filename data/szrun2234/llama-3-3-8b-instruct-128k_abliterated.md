# szrun2234/Llama-3.3-8B-Instruct-128K_Abliterated

## Resumen

Llama-3.3-8B-Instruct-128K_Abliterated es una variante "abliterated" (con los mecanismos de rechazo eliminados quirúrgicamente) del modelo Llama 3.3 8B Instruct en su variante de 128K de contexto. Lo publica el usuario szrun2234 en Hugging Face, aunque la model card original atribuye el desarrollo a SicariusSicariiStuff, y el modelo base declarado es shb777/Llama-3.3-8B-Instruct-128K. El objetivo es ofrecer un modelo de 8.030.261.248 parametros que conserva las capacidades del original pero sin las negativas de seguridad, manteniendo la ventana completa de 128.000 tokens.

La tecnica empleada es la abliteracion por ortogonalizacion: se identifican los vectores de direccion de rechazo en el espacio de activaciones y se ortogonalizan los pesos para inhibir la activacion a lo largo de esas direcciones, preservando el resto del comportamiento. El autor reporta una divergencia KL inferior a 0,005 respecto al modelo original y una tasa de rechazos de aproximadamente el 5%, lo que sugiere que la mayor parte del conocimiento y las capacidades se mantienen intactas.

Es relevante para investigadores que necesitan evaluar el comportamiento de modelos sin guardarrailes de seguridad, estudiar mecanismos de rechazo o realizar experimentos de alineacion, aunque su uso en produccion conlleva riesgos importantes y consideraciones de licencia que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 (Llama 3 Community License, segun la model card) |
| Formato de pesos | safetensors |
| Precision | bf16 |
| Tamano del repo | 16,1 GB |
| Modelo base | shb777/Llama-3.3-8B-Instruct-128K |
| Metodo | Abliteracion por ortogonalizacion |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de la familia Llama, con 8.030.261.248 parametros y pesos en bf16. No se trata de un modelo entrenado desde cero: es un ajuste fino derivado de shb777/Llama-3.3-8B-Instruct-128K, que a su vez procede de Meta Llama 3.3 8B Instruct en su variante de 128K. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion tecnica principal es la abliteracion. El proceso, segun la model card, consta de tres pasos: identificar los vectores de direccion de rechazo en el espacio de activaciones, ortogonalizar los pesos para inhibir la activacion a lo largo de esas direcciones y preservar (en su mayoria) el resto de comportamientos y conocimiento del modelo. El autor reporta una divergencia KL inferior a 0,005 frente al original, lo que indica que la distribucion de salida del modelo abliterated se mantiene muy proxima a la del modelo base, y una tasa de rechazos de aproximadamente el 5%.

## Capacidades

- Generacion de texto general en ingles, heredada de Llama 3.3 8B Instruct.
- Razonamiento y respuesta a instrucciones multi-turno.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y conversaciones extensas.
- Capacidades de codigo y matematicas propias del modelo base (no se documentan evaluaciones especificas en la informacion disponible).
- Ausencia practica de mecanismos de rechazo: el modelo responde a peticiones que el original rechazaria, con una tasa de rechazo reportada de aproximadamente el 5%.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un Llama 3.3 8B sin guardarrailes, comparando respuestas con el original para analizar la eficacia de los mecanismos de rechazo y las tecnicas de abliteracion.
- Analisis de robustez de filtros: util para evaluar si los sistemas de moderacion externos detectan contenido que el modelo base rechazaria, midiendo la tasa de evasion con la ventana de 128K para prompts largos.
- Procesamiento de documentos extensos en ingles: con 128.000 tokens de contexto puede resumir, extraer informacion o responder preguntas sobre contratos, informes o corpus largos, siempre que el contenido no requiera filtros de seguridad.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo original introduciria negativas o advertencias.
- Red teaming y pruebas de penetracion de LLM: empleo como modelo adversario para generar prompts y respuestas que prueben la resiliencia de pipelines de moderacion y clasificadores de contenido.
- Experimentos academicos de interpretabilidad: al conservar una divergencia KL inferior a 0,005, sirve para comparar activaciones y direcciones internas entre un modelo alineado y su version abliterated con minimas diferencias en el resto de capacidades.
- Evaluacion de licencias y cumplimiento: caso de estudio para analizar las implicaciones del uso de pesos derivados de Llama 3.3 bajo la Llama 3 Community License en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del proceso de abliteracion:

| Metrica | Valor reportado |
|---|---|
| Divergencia KL respecto al original | < 0,005 |
| Tasa de rechazos | ~5% |
| Nivel de censura (escala del autor) | 7,8 / 10 (10 = completamente sin censura) |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para los pesos, mas memoria para el KV cache; con contexto de 128K el KV cache puede requerir decenas de GB adicionales segun el lote y la implementacion.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para los pesos; en 4 bits, alrededor de 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para explotar la ventana completa de 128K con lotes razonables; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en bf16 con contexto limitado, o en tarjetas de 8-12 GB si se generan cuantizaciones propias.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama, aunque el repositorio solo publica safetensors y no incluye GGUF; habria que convertir los pesos para usarlos en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.3-8B-Instruct-128K_Abliterated | 8,03 B | 128K | llama3.3 | Abliterated, tasa de rechazo ~5%, KL < 0,005 |
| shb777/Llama-3.3-8B-Instruct-128K (base) | 8 B | 128K | llama3.3 | Modelo base del que deriva; mantiene guardarrailes |
| Meta Llama 3.3 8B Instruct | 8 B | 128K | Llama 3 Community License | Original de Meta, con mecanismos de rechazo completos |
| SicariusSicariiStuff/Llama-3.3-8B-Instruct-128K_Abliterated | 8 B | 128K | llama3.3 | Version original de la que parece derivar este repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo: el modelo respondera a peticiones que el original rechazaria, lo que supone un riesgo elevado de generar contenido danino, ilegal o eticamente problematico.
- Sesgos conocidos: al heredar el modelo base, arrastra los sesgos de Llama 3.3 8B Instruct, sin que se documente un proceso de mitigacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; el modelo conserva el comportamiento del base segun la divergencia KL reportada.
- Limitaciones de idioma: etiquetado unicamente como ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la model card indica que "probablemente hereda" la licencia de Llama 3.3, y advierte de que se basa en pesos filtrados ("leaked weights"), lo que genera incertidumbre sobre la legitimidad y trazabilidad de los pesos.
- Uso comercial: la Llama 3 Community License impone condiciones (umbral de 700 millones de usuarios mensuales, atribucion, restricciones de uso aceptable) que deben revisarse antes de cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni variantes cuantizadas oficiales, lo que reduce la validacion comunitaria.
- No apto para produccion orientada al usuario final sin capas adicionales de moderacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/szrun2234/Llama-3.3-8B-Instruct-128K_Abliterated
- Modelo base: https://huggingface.co/shb777/Llama-3.3-8B-Instruct-128K
- Repositorio original citado en la model card: https://huggingface.co/SicariusSicariiStuff/Llama-3.3-8B-Instruct-128K_Abliterated
- Otro modelo del autor original: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_4B
- Herramienta SLOP_Detector: https://github.com/SicariusSicariiStuff/SLOP_Detector
