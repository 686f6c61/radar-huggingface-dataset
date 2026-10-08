# xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF

## Resumen

Qwen3.5-4B-Medical-Reasoning-GGUF es una distribucion en formato GGUF del modelo xtools-at/Qwen3.5-4B-Medical-Reasoning, un ajuste fino mediante LoRA del modelo Qwen 3.5 4B orientado al razonamiento medico y al diagnostico clinico. Lo publica el usuario xtools-at en HuggingFace y su proposito es facilitar la ejecucion local del modelo en hardware modesto, al ofrecer pesos cuantizados listos para motores como llama.cpp, Ollama o LM Studio. El modelo tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y hereda del modelo base la arquitectura densa de Qwen 3.5 con soporte multimodal de imagen y texto.

El modelo no parte directamente del Qwen 3.5 4B original, sino de una variante intermedia publicada por DavidAU denominada Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING, sobre la que se aplico un LoRA adicional con el dataset FreedomIntelligence/medical-o1-reasoning-SFT. Este linaje implica que el modelo combina el ajuste medico con las caracteristicas de la variante HERETIC, que reduce los rechazos y filtros de seguridad del modelo original.

Su relevancia actual radica en que ofrece razonamiento medico especializado en un tamano que cabe en GPUs de consumo y que puede desplegarse de forma totalmente local, algo critico en entornos sanitarios donde la privacidad de los datos de pacientes impide el uso de APIs en la nube. La licencia Apache 2.0 permite ademas uso comercial sin restricciones de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen 3.5 4B, vision-language) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; el ajuste fino se realizo con 4.096 tokens |
| Tipos de cuantizacion | GGUF (lista concreta de niveles de cuantizacion no disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de tipo Qwen 3.5, que en la version 4B integra una base unificada de vision y lenguaje, lo que explica que el pipeline declarado sea image-text-to-text. El ajuste publicado aqui no modifica esa arquitectura: se trata de un LoRA de 16 bits aplicado sobre el checkpoint DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING, que a su vez es una variante del Qwen 3.5 4B.

El entrenamiento del LoRA se realizo sobre el dataset FreedomIntelligence/medical-o1-reasoning-SFT, con 2 epocas sobre 2.000 entradas seleccionadas aleatoriamente mas un 5 por ciento reservado para evaluacion. Se configuro un rango de 16, alpha de 32, dropout de 0,01 y se apuntaron todos los modulos. El optimizador fue AdamW de 8 bits con planificador lineal, tasa de aprendizaje 2e-4, batch de 2, acumulacion de gradiente de 4 y weight decay de 0,001, con longitud de contexto de 4.096 tokens. El resultado reportado es una perdida de entrenamiento de 1,54 y una perdida de evaluacion de 1,48, entrenado en una unica GPU Tesla T4 de 16 GB.

## Capacidades

- Generacion de texto y razonamiento clinico paso a paso, orientado a diagnosticos diferenciales y a la interpretacion de hallazgos analiticos.
- Procesamiento de imagenes ademas de texto, heredado de la base multimodal de Qwen 3.5 (pipeline image-text-to-text).
- Soporte de conversation multi-turno y de prompts de sistema con rol asignado (por ejemplo, "experto en razonamiento medico y diagnostico").
- Capacidad de razonamiento extendido del linaje Qwen 3.5, con la variante THINKING presente en el nombre del checkpoint base.
- Reduccion de rechazos y de respuestas evasivas por la componente HERETIC de la cadena de ajustes.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Apoyo al diagnostico diferencial: el modelo puede recibir el cuadro clinico de un paciente (sintomas, antecedentes, valores de laboratorio) y generar una lista razonada de diagnosticos probables, como demuestra el ejemplo de la model card con hipercalcemia e hipertension nocturna.
- Formacion medica y simulacion de casos: residentes y estudiantes pueden plantear casos clinicos y recibir razonamientos estructurados que expliquen el razonamiento fisiopatologico, sin exponer datos reales de pacientes.
- Interpretacion de analiticas de laboratorio: dado un panel de resultados (calcio, creatinina, electrolitos, hormonas), el modelo puede contextualizar valores anormales y sugerir pruebas de confirmacion.
- Triaje y anamnesis automatizada: integrado en un chatbot de admision que recoge sintomas y antecedentes en ingles, y prioriza la derivacion segun la gravedad inferida.
- Analisis de imagenes medicas: al heredar la base multimodal, puede procesar imagenes acompanadas de texto, util para descripcion preliminar de estudios o para tareas de apoyo a la documentacion.
- Asistente de razonamiento farmacologico: consultas sobre interacciones, ajustes de dosis en insuficiencia renal o mecanismos de accion, con salida paso a paso auditable por el profesional.
- Despliegue local en entornos sanitarios con datos sensibles: al ejecutarse en GGUF sobre hardware propio, evita enviar informacion de pacientes a servicios externos, lo que ayuda a cumplir requisitos de confidencialidad.
- Generacion de material educativo y resumenes: sintesis de guias clinicas o articulos en ingles para crear apuntes y resumenes estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta las perdidas de entrenamiento (1,54) y evaluacion (1,48) del ajuste LoRA, pero no incluye metricas sobre MMLU, MedQA, HumanEval, GSM8K ni ningun otro conjunto de evaluacion estandar.

## Requisitos de hardware

- Modelo entrenado en una unica GPU Tesla T4 de 16 GB, lo que confirma que el ajuste LoRA cabe en ese perfil.
- Inferencia en precision completa (16 bits): aproximadamente 8,4 GB de VRAM para los pesos, mas el coste de la cache KV segun la longitud de contexto.
- Inferencia en cuantizacion de 8 bits: alrededor de 4,5 GB de VRAM.
- Inferencia en cuantizacion de 4 bits: aproximadamente 2,5 a 3 GB de VRAM, lo que lo hace apto para GPUs de consumo.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o superiores; en el ambito profesional, A100 o H100 quedan sobredimensionadas para este tamano pero son validas para despliegue por lotes.
- Cabe holgadamente en GPU de consumo moderna con al menos 8 GB de VRAM en cuantizacion de 4 bits, y en 16 GB incluso en cuantizaciones mas altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y transformers con soporte GGUF; text-generation-inference esta etiquetado en el repositorio, aunque el soporte de GGUF en TGI es limitado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- El tamano del repositorio es de 13,4 GB, lo que indica que contiene varias cuantizaciones estaticas en el mismo repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF | 4,2 B | 262.144 nativo (4.096 en el ajuste) | en | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | 4 B aprox. | 262.144 | no disponible | no disponible | safetensors |
| Kerassy/Qwen3.5-4B-Medical-Reasoning | no disponible | no disponible | no disponible | no disponible | no disponible |
| gosso1/Qwen3.5-4B-Medical-o1 | no disponible | no disponible | no disponible | no disponible | no disponible (VRAM 9,3 GB segun LLM Explorer) |

Los tres modelos comparables comparten el mismo tamano de la familia Qwen 3.5 4B y un enfoque de ajuste para razonamiento medico. Los datos publicos de contexto, licencia y rendimiento de las alternativas no estan disponibles en la informacion recogida, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo esta entrenado sobre 2.000 entradas de un unico dataset medico, un volumen pequeno que limita la cobertura frente a dominios clinicos no representados en medical-o1-reasoning-SFT.
- La perdida de evaluacion (1,48) se midio sobre un 5 por ciento del mismo dataset de entrenamiento, por lo que no es una medida fiable de generalizacion a casos reales.
- Soporte unicamente de ingles; las consultas o la documentacion clinica en castellano pueden degradar la calidad de las respuestas.
- Riesgo elevado de alucinacion en contexto clinico: el modelo puede generar diagnosticos, dosis o interacciones farmacologicas plausibles pero incorrectas, por lo que no debe usarse como herramienta diagnostica autonoma.
- La componente HERETIC reduce los filtros de seguridad del modelo original, lo que incrementa el riesgo de respuestas inapropiadas y exige supervision humana en cualquier despliegue.
- Sesgos conocidos: no documentados explicitamente en la informacion disponible; cabe esperar los sesgos presentes en el dataset medico de origen.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de validacion clinica regulada impide tratar las salidas como consejo medico legalmente responsable.
- El ajuste se realizo con contexto de 4.096 tokens; aunque el modelo base soporte 262.144, no hay evidencia de que el ajuste mantenga calidad en ventanas largas.
- Fecha de creacion del repositorio posterior a la fecha actual de consulta (2026-10-08), con 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- Para produccion, es imprescindible incorporar verificacion humana, trazabilidad de fuentes y advertencias explicitas de uso no clinico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF
- Modelo sin cuantizar (origen del GGUF): https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning
- Modelo base del ajuste: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Variante similar de Kerassy: https://huggingface.co/Kerassy/Qwen3.5-4B-Medical-Reasoning
- Ficha de Qwen3.5 4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Ficha de Qwen3.5 4B Medical o1 en LLM Explorer: https://llm-explorer.com/model/gosso1%2FQwen3.5-4B-Medical-o1,7xR8fbFnGQ1iMBe83LxeX0
- Ficha en Essa Mamdani: https://essamamdani.com/ai-models/hf-kerassy-qwen3-5-4b-medical-reasoning
