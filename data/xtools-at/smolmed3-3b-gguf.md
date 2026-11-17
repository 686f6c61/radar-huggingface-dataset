# xtools-at/SmolMed3-3B-GGUF

## Resumen

SmolMed3-3B-GGUF es la distribucion en formato GGUF de SmolMed3-3B, un ajuste fino mediante LoRA del modelo SmolLM3-3B de Hugging Face, especializado en razonamiento medico. El modelo parte de la variante K0D3IN/SmolLM3-3B-Instruct-heretic y se ha entrenado sobre el dataset mamachang/medical-reasoning, lo que lo orienta a tareas de pregunta-respuesta clinica y razonamiento sobre casos medicos. Esta version GGUF esta publicada por el usuario xtools-at y esta pensada para su uso con llama.cpp y otros runners compatibles.

El modelo conserva la arquitectura y el tamano del SmolLM3 original: 3.075.098.624 parametros (aproximadamente 3B), lo que lo situa en la categoria de modelos pequenos desplegables en hardware de consumo. La licencia es Apache 2.0, lo que facilita su uso comercial, y el unico idioma declarado es el ingles. El repositorio ocupa 9,0 GB e incluye cuantizaciones estaticas en GGUF.

La relevancia de esta ficha radica en que combina un modelo base compacto y moderno con un ajuste especifico de dominio medico y una empaquetadura lista para inferencia local. No obstante, la informacion publicada es escasa: no se detallan hiperparametros de entrenamiento, composicion del dataset ni resultados de benchmarks, por lo que las evaluaciones cuantitativas quedan pendientes de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B; detalles no disponibles) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizaciones estaticas GGUF (niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 9,0 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del SmolLM3-3B de Hugging Face, partiendo concretamente de la variante K0D3IN/SmolLM3-3B-Instruct-heretic. SmolLM3 es un transformer decoder-only de aproximadamente 3B parametros; la model card no detalla la configuracion interna (numero de capas, dimension oculta, atencion, etc.), por lo que esos datos deben consultarse en la ficha del modelo base. El ajuste se ha realizado sobre el dataset mamachang/medical-reasoning, orientado a razonamiento medico.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de etapas de RLHF o DPO, ni los hiperparametros del LoRA (rango, alpha, capas objetivo). Tampoco se documentan innovaciones tecnicas especificas mas alla de las propias del modelo base. La variante "heretic" del modelo de partida sugiere un proceso de eliminacion de comportamientos de rechazo, pero la model card no lo describe en detalle.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en pregunta-respuesta de tematica medica.
- Razonamiento clinico sobre casos y preguntas del dominio sanitario, segun el dataset de ajuste.
- Formato conversacional (chat) heredado del modelo instruct de partida.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision o audio: no disponibles.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Asistente de formacion medica: el modelo puede responder preguntas de estudio y explicar razonamientos clinicos paso a paso, aprovechando el ajuste sobre el dataset medical-reasoning para generar respuestas estructuradas en ingles.
- Triaje preliminar de sintomas en entornos controlados: puede utilizarse como primer filtro conversacional para clasificar consultas y derivar al especialista adecuado, siempre con supervision humana.
- Soporte a la documentacion clinica: generacion de borradores de resumenes de casos o notas a partir de texto libre, con revision posterior por personal sanitario.
- Chatbot de informacion sanitaria para pacientes: respuestas en ingles sobre conceptos medicos generales, desplegado en local con llama.cpp para evitar el envio de datos a servicios externos.
- Prototipado rapido de aplicaciones medicas: al ser un GGUF de 3B, permite iterar en portatiles o equipos con GPU de consumo antes de escalar a modelos mayores.
- Investigacion en NLP clinico: base para experimentos de ajuste adicional o evaluacion de tecnicas de cuantizacion en tareas de razonamiento medico.
- Inferencia en el borde (edge): despliegue en dispositivos con recursos limitados gracias al tamano compacto del modelo y al formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 3B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 2-3 GB y las de 8 bits alrededor de 4 GB, aunque no se confirma en la model card.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- GPU de consumo: previsiblemente cabe en la mayoria de GPUs consumer con 6 GB o mas, aunque el dato no esta confirmado.
- Opciones de despliegue: llama.cpp y llama-cpp (etiquetas del repo); tambien compatible con runners que acepten GGUF (Ollama, LM Studio, etc.), si bien no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolMed3-3B-GGUF | 3,075B | no disponible | Apache 2.0 | GGUF | Ajuste medico de SmolLM3-3B |
| SmolLM3-3B (HuggingFaceTB) | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base generalista |
| K0D3IN/SmolLM3-3B-Instruct-heretic | ~3B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Base inmediata del ajuste |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio medico: un modelo ajustado para razonamiento medico no sustituye el criterio de un profesional sanitario; no debe usarse para diagnostico o tratamiento sin supervision.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones clinicas incorrectas con apariencia de verosimilitud.
- Idioma: solo se declara soporte de ingles, por lo que su uso en castellano no esta garantizado ni evaluado.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de ajuste puede introducir sesgos propios.
- Contexto: la longitud de contexto no esta indicada en la model card, lo que dificulta planificar casos con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de entrenamiento.
- Versionado: la model card indica un `new_version` (xtools-at/SmolLM3-3B-Medical-Reasoning-GGUF), por lo que esta version podria quedar obsoleta.
- Falta de benchmarks: no hay evidencia cuantitativa publicada sobre su calidad en tareas medicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/SmolMed3-3B-GGUF
- Modelo original (safetensors): https://huggingface.co/xtools-at/SmolMed3-3B
- Modelo base del ajuste: https://huggingface.co/K0D3IN/SmolLM3-3B-Instruct-heretic
- SmolLM3-3B de Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/mamachang/medical-reasoning
- Nueva version indicada: https://huggingface.co/xtools-at/SmolLM3-3B-Medical-Reasoning-GGUF
