# xtools-at/SmolMed3-3B-GGUF

## Resumen

SmolMed3-3B-GGUF es la distribucion en formato GGUF del modelo xtools-at/SmolMed3-3B, un ajuste fino de 3.075.098.624 parametros (aproximadamente 3,07 mil millones) orientado a texto y especializado en dominio medico. El autor del repositorio es el usuario xtools-at, y el modelo se apoya en la familia SmolLM3 de HuggingFaceTB, segun indican las etiquetas `smollm3` y `smollm` de la ficha. El ajuste se ha realizado sobre el dataset `mamachang/medical-reasoning`, lo que situa al modelo en el nicho de asistentes de razonamiento clinico y preguntas-respuestas medicas.

La relevancia de esta publicacion es fundamentalmente practica: se trata de una version cuantizada estaticamente para `llama.cpp`, lo que permite ejecutar un modelo de 3B especializado en medicina en hardware de consumo, sin GPU dedicada o con GPU de gama media. La etiqueta `heretic` apunta a que el modelo ha pasado por un proceso de eliminacion de direcciones de rechazo (abliteration) respecto al modelo base, un detalle relevante tanto desde el punto de vista tecnico como de seguridad.

El repositorio ocupa 9,0 GB e incluye varios niveles de cuantizacion GGUF. El modelo declara unicamente el idioma ingles, licencia Apache 2.0 y pipeline de generacion de texto con soporte conversacional. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la informacion disponible, por lo que buena parte de las especificaciones finas quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM3-3B; no detallada en la model card de este derivado) |
| Parametros totales | 3.075.098.624 (~3,07B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card de este derivado |
| Tipos de cuantizacion | Cuantizaciones estaticas GGUF para llama.cpp (los niveles concretos no se listan en la model card; el repo de 9,0 GB sugiere varios niveles) |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 9,0 GB |
| Casos de uso declarados | text-generation, conversational, endpoints_compatible |
| Dataset de ajuste | mamachang/medical-reasoning |
| Fecha de creacion (repo) | 2026-09-19 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card de este repositorio, mas alla de que se trata de un derivado de la familia SmolLM3 y que el modelo base declara 3.075.098.624 parametros densos. Las etiquetas del repositorio (`smollm3`, `smollm`, `llama.cpp`, `gguf`) confirman que el artefacto publicado es exclusivamente el resultado de convertir los pesos del modelo original a formato GGUF mediante el pipeline de `llama.cpp`, sin cambios adicionales en la topologia de red.

En cuanto al entrenamiento, la unica informacion disponible es que el ajuste se realizo sobre el dataset `mamachang/medical-reasoning`, orientado a razonamiento medico. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. La etiqueta `heretic` indica que el modelo ha sido sometido a un proceso de abliteration (supresion de direcciones de rechazo en el espacio de activaciones), una tecnica de decensurado que modifica el comportamiento de seguridad del modelo original; no se documentan en la ficha ni el metodo exacto ni el impacto medido de ese proceso.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado `text-generation`.
- Razonamiento aplicado a dominio medico, segun el dataset de ajuste `mamachang/medical-reasoning`; no se detallan las tareas concretas cubiertas.
- Uso en modo conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Ejecucion mediante `llama.cpp` y `llama-cli`, segun el ejemplo de uso de la model card: `llama-cli -hf xtools-at/SmolMed3-3B-GGUF --jinja`. El flag `--jinja` indica soporte de plantillas de chat en formato Jinja.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no; el modelo declara unicamente ingles.
- Vision, audio o modo de pensamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de triaje clinico en ingles: el modelo puede gestionar conversaciones multi-turno sobre sintomas y antecedentes, apoyandose en su ajuste sobre un dataset de razonamiento medico. La ventana de contexto concreta no esta documentada, por lo que conviene validar la longitud soportada antes de desplegarlo en produccion.
- Resumen de literatura medica: dado un texto de un articulo o informe, generar un resumen estructurado en ingles. Al ser un modelo de 3B, encaja en flujos donde la latencia importa mas que la profundidad de analisis.
- Generacion de preguntas de examen tipo MIR/USMLE: producir preguntas de opcion multiple con explicacion razonada, a partir de temarios. El ajuste en razonamiento medico favorece este formato frente a un modelo generalista del mismo tamano.
- Chatbot de educacion para estudiantes de medicina: responder dudas de fisiologia, farmacologia o patologia en ingles, con un coste de inferencia bajo gracias a la cuantizacion GGUF.
- Procesamiento por lotes en CPU: al estar en formato GGUF, puede ejecutarse en servidores sin GPU para tareas de clasificacion, extraccion o reformulacion de notas clinicas, con throughput limitado pero coste de infraestructura minimo.
- Prototipado rapido y evaluacion local: cualquier investigador puede descargar una cuantizacion y probar el modelo en un portatil con `llama-cli`, sin necesidad de infraestructura cloud, lo que facilita la comparacion con otros ajustes medicos.
- Filtrado previo en pipelines de datos clinicos: usar el modelo como clasificador de relevancia o normalizador de texto antes de pasar a un modelo mayor, aprovechando su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, MedQA, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web proporcionados no contienen informacion sobre este modelo. No se deben asumir cifras de rendimiento sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas para un modelo denso de 3,07B en GGUF, no medidas publicadas):
  - Cuantizacion Q4_K_M: aproximadamente 1,9-2,1 GB de pesos.
  - Cuantizacion Q5_K_M: aproximadamente 2,2-2,4 GB.
  - Cuantizacion Q6_K: aproximadamente 2,5-2,7 GB.
  - Cuantizacion Q8_0: aproximadamente 3,3-3,5 GB.
  - Precision FP16: aproximadamente 6,2 GB.
  - A estas cifras hay que sumar la memoria de la cache KV, cuyo consumo depende del contexto configurado y del numero de cabezas KV del modelo base (no documentado en la ficha).
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 4070 o superior ejecutan comodamente cualquier cuantizacion de 4 a 8 bits. Tambien es viable en iGPU y en Apple Silicon con memoria unificada.
- GPU recomendadas para servicio con concurrencia: NVIDIA L4, A10G, RTX 4090 o A100/H100 si se requiere alto throughput con batching. Para uso individual, cualquier GPU con 6 GB o mas es suficiente.
- Ejecucion en CPU: viable mediante `llama.cpp`; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: `llama.cpp`, `llama-cli`, `llama-server`, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para despliegue en GPU con batching de alto rendimiento se puede convertir a otros formatos, pero el repo solo publica GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato publicado | Especializacion |
|---|---|---|---|---|---|---|
| xtools-at/SmolMed3-3B-GGUF | ~3,07B | no disponible | Ingles | Apache 2.0 | GGUF | Razonamiento medico, con abliteration |
| HuggingFaceTB/SmolLM3-3B (base) | ~3,07B | no disponible en la informacion proporcionada | Multilingue (segun el modelo base) | Apache 2.0 | safetensors | Proposito general, con modos de razonamiento |
| Qwen2.5-3B-Instruct | ~3,09B | no disponible en la informacion proporcionada | Multilingue | Apache 2.0 (variantes) | safetensors, GGUF | Proposito general, instrucciones |
| Llama-3.2-3B-Instruct | ~3,21B | no disponible en la informacion proporcionada | Multilingue | Licencia comunitaria de Llama | safetensors, GGUF | Proposito general, instrucciones |

No se dispone de datos de rendimiento comparativo para SmolMed3-3B, por lo que la eleccion entre estas alternativas debe basarse en evaluacion propia sobre el dominio medico concreto. La ventaja diferencial de este repositorio es la disponibilidad inmediata en GGUF y la especializacion en razonamiento medico; la desventaja es la restriccion al ingles y la ausencia de metricas publicadas.

## Limitaciones y advertencias

- No es un dispositivo medico ni un sistema de diagnostico. Cualquier uso en contexto clinico real debe pasar por supervision profesional y validacion regulatoria; un modelo de 3B ajustado sobre un unico dataset no ofrece garantias de seguridad clinica.
- La etiqueta `heretic` indica que se ha aplicado abliteration, lo que reduce los rechazos del modelo base. Esto incrementa el riesgo de generar contenido inapropiado, consejos medicos peligrosos o afirmaciones sin base, y hace desaconsejable su despliegue directo al publico sin filtros adicionales.
- Riesgo de alucinacion elevado en un modelo de este tamano, especialmente en dosis, interacciones farmacologicas, diagnosticos diferenciales y referencias bibliograficas. No se han publicado evaluaciones de fidelidad factual.
- Idioma: el modelo declara unicamente ingles. No hay evidencia de soporte para castellano ni para otras lenguas, por lo que su uso en entornos hispanohablantes requeriria evaluacion previa.
- Longitud de contexto no documentada: se desconoce la ventana efectiva del derivado, lo que complica dimensionar la cache KV y planificar casos de uso con documentos largos.
- Ausencia total de benchmarks: no hay datos de MMLU, MedQA ni metricas de seguridad, por lo que no se puede verificar la calidad del ajuste ni el dano causado por la abliteration.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. No se documentan restricciones adicionales, pero el modelo base (SmolLM3) podria tener sus propios terminos que conviene revisar.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo (corresponden a la marca de maquinas de grabado xTool), por lo que no aportan informacion adicional de contraste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xtools-at/SmolMed3-3B-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/xtools-at/SmolMed3-3B
- Dataset de ajuste (referenciado en la model card): https://huggingface.co/datasets/mamachang/medical-reasoning
- Familia base SmolLM3 (referencia de arquitectura, no citada explicitamente en la model card): https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio de llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a un fabricante de maquinas de grabado y no se incluyen por no ser pertinentes.
