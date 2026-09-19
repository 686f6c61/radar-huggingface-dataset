# xtools-at/SmolMed3-3B

## Resumen
SmolMed3-3B es un ajuste fino mediante LoRA del modelo SmolLM3-3B orientado a razonamiento medico y a tareas de respuesta a preguntas (question answering). Lo publica el usuario xtools-at en HuggingFace y parte de un modelo intermedio ya modificado, K0D3IN/SmolLM3-3B-Instruct-heretic, sobre el que se ha entrenado con el dataset mamachang/medical-reasoning. Hereda por tanto el tamano de 3 000 millones de parametros de la familia SmolLM3 de HuggingFace.

El modelo resuelve el caso de uso de asistentes clinicos ligeros, triaje de sintomas y respuesta a preguntas sobre literatura medica en ingles, con la ventaja de que 3B parametros permite desplegarlo en una unica GPU de consumo. Su relevancia actual esta en la tendencia a especializar modelos pequenos mediante LoRA en lugar de entrenar desde cero, lo que reduce coste y huella de computo.

La informacion publicada es minima: solo se declaran el modelo base, el dataset y la licencia. No hay detalles sobre numero de tokens de entrenamiento, composicion del dataset, hiperparametros del LoRA ni evaluaciones. El repositorio ocupa 0,1 GB, lo que sugiere que contiene los adaptadores LoRA y no los pesos fusionados, aunque la model card no lo confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en SmolLM3, adaptado mediante LoRA (arquitectura interna del modelo base: no detallada en la informacion proporcionada) |
| Parametros totales | 3 000 millones (heredados del modelo base SmolLM3-3B) |
| Longitud de contexto | No disponible en la informacion proporcionada; la model card del modelo base SmolLM3-3B declara 128 000 tokens |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas; al distribuirse en safetensors estandar admite conversion a GGUF, AWQ o GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun los tags). El tamano del repositorio (0,1 GB) indica adaptadores LoRA, no pesos fusionados, aunque la model card no lo especifica |

## Arquitectura y entrenamiento
El modelo es un ajuste fino LoRA (Low-Rank Adaptation) sobre K0D3IN/SmolLM3-3B-Instruct-heretic, que a su vez deriva de HuggingFaceTB/SmolLM3-3B. No se especifican el rango del LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el numero de tokens vistos durante el ajuste. Tampoco se indica si el adaptador se ha fusionado con los pesos base ni si se aplico alguna fase posterior de alineamiento (RLHF, DPO o similar) tras el ajuste supervisado.

El dataset de entrenamiento declarado es mamachang/medical-reasoning. La model card no describe su composicion, tamano, procedencia ni el filtrado aplicado, por lo que no es posible evaluar la cobertura clinica ni el sesgo potencial de los datos. El unico dato tecnico relevante y verificable es la cadena de dependencias: SmolLM3-3B como base, una variante intermedia marcada como "heretic" y un unico ajuste LoRA sobre datos medicos.

## Capacidades
- Generacion de texto en ingles y respuesta a preguntas de dominio medico, que es la tarea declarada en el pipeline (question-answering).
- Razonamiento clinico de tipo explicativo, segun se deduce del dataset de razonamiento medico empleado en el ajuste (no confirmado con evaluaciones publicadas).
- Compatibilidad con text-generation-inference, segun los tags del repositorio, lo que permite desplegarlo como endpoint HTTP.
- Carga mediante la libreria transformers.
- Herencia de las capacidades del modelo base SmolLM3-3B, aunque no se documenta cuales se conservan tras el ajuste "heretic" ni que porcentaje de ellas se ha degradado.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Triaje de sintomas en ingles: el modelo puede clasificar consultas de pacientes y sugerir el nivel de urgencia, aprovechando el ajuste sobre datos de razonamiento medico. Es adecuado por su tamano reducido, que permite desplegarlo en un servicio con latencia baja, siempre con supervision humana.
- Resumen de notas clinicas: dado un historial en texto libre, generar un resumen estructurado de antecedentes, medicacion y diagnosticos. El ajuste en dominio medico reduce la probabilidad de divagaciones respecto al modelo base.
- Respuesta a preguntas sobre literatura medica: integrado en un pipeline RAG sobre PubMed u otra base documental, el modelo genera respuestas citando el contexto recuperado.
- Formacion de personal sanitario: generacion de explicaciones detalladas de fisiopatologia y mecanismos de accion farmacologicos para material docente interno.
- Preprocesado de datos clinicos: normalizacion de terminologia, extraccion de entidades y conversion de notas libres en campos estructurados antes de alimentar una base de datos.
- Prototipado e investigacion en NLP medico: por su licencia Apache 2.0 y su tamano, sirve como linea base reproducible para comparar estrategias de ajuste LoRA en dominio sanitario.
- Despliegue en el borde o en entornos con recursos limitados: al caber en una GPU de consumo, permite ejecutar inferencia local cuando no se pueden enviar datos de salud a servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, MedQA, MedMCQA, PubMedQA, HumanEval ni ningun otro conjunto, ni comparaciones con el modelo base. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existe validacion por parte de la comunidad.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: en torno a 6-7 GB solo para los pesos de 3B parametros, mas 1-2 GB de cache KV segun la longitud de contexto y el batch, lo que situa el total practico en 8-10 GB.
- VRAM estimada en int8: aproximadamente 3,5 GB de pesos, con sobrecarga adicional de cache.
- VRAM estimada en int4 (GGUF Q4_K_M): aproximadamente 2 GB de pesos, apto para GPUs de 4-6 GB.
- Nota: el repositorio de 0,1 GB parece contener solo los adaptadores LoRA. Para ejecutarlo es necesario descargar K0D3IN/SmolLM3-3B-Instruct-heretic y aplicar el adaptador, o bien fusionarlos previamente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G para despliegue en servidor; A100 o H100 solo si se necesita alto throughput con lotes grandes.
- Cabe en GPU de consumo: si, una vez cuantizado a int4 o int8 cabe incluso en GPUs de 6-8 GB como la RTX 3060 o la RTX 4060.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), vLLM, llama.cpp u Ollama tras convertir los pesos fusionados a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolMed3-3B | 3B (+ adaptador LoRA) | No disponible (base: 128 000 tokens) | Apache 2.0 | HuggingFace, safetensors, TGI |
| SmolLM3-3B (base) | 3B | 128 000 tokens | Apache 2.0 | HuggingFace, safetensors, transformers |
| Qwen2.5-3B | 3,09B | 32 768 tokens (hasta 131 072 con configuracion) | Licencia Qwen Research (consultar en su model card) | HuggingFace, safetensors |
| Llama-3.2-3B | 3,2B | 128 000 tokens | Llama 3.2 Community License | HuggingFace, requiere aceptacion de terminos |

No existen datos de benchmarks de SmolMed3-3B que permitan comparar rendimiento real frente a estas alternativas. Los datos de los modelos comparados proceden de su documentacion publica y no se han verificado en la busqueda web realizada, que devolvio exclusivamente resultados no relacionados (maquinas de grabado laser de la marca xTool).

## Limitaciones y advertencias
- Modelo de dominio medico: cualquier salida debe tratarse como informacion no validada clinicamente. No sustituye el criterio de un profesional sanitario y no se ha evaluado su seguridad.
- El modelo base intermedio, K0D3IN/SmolLM3-3B-Instruct-heretic, esta marcado como "heretic", lo que en la practica habitual del ecosistema sugiere una variante con los comportamientos de rechazo atenuados (abliterated). No se confirma en la informacion proporcionada, pero de ser asi implicaria una menor tendencia a negarse a responder ante peticiones problematicas.
- Riesgo de alucinacion elevado en un contexto de alta exigencia factual como el medico, y sin datos de evaluacion que lo cuantifiquen.
- Solo se declara soporte de ingles. El uso en castellano no esta garantizado ni documentado.
- El repositorio no publica informacion sobre el dataset de ajuste, por lo que no se puede evaluar sesgo demografico, cobertura de patologias ni fuga de datos personales.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene revisar antes de un despliegue en produccion.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en HuggingFace. No debe usarse como referencia sin una evaluacion propia.
- Los metadatos de HuggingFace registran la fecha de creacion como 19 de septiembre de 2026 y la de actualizacion como 19 de septiembre de 2026, una fecha futura, lo que apunta a un error en los metadatos.
- El tamano del repositorio sugiere que solo contiene el adaptador LoRA; un intento de carga directa puede fallar si se espera un modelo completo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/xtools-at/SmolMed3-3B
- Modelo base del ajuste: https://huggingface.co/K0D3IN/SmolLM3-3B-Instruct-heretic
- Modelo original de la familia: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/mamachang/medical-reasoning
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a la web comercial de maquinas de grabado laser xTool (fr.xtool.com, xtool.com, xtool.eu) y no guardan relacion con el modelo.
