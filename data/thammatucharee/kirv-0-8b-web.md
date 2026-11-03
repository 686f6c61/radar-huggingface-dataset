# Thammatucharee/kirv-0.8b-web

## Resumen

KirV-0.8B (web, 4-bit) es un modelo de lenguaje especializado desarrollado por Yanyong Thammatucharee (Kirdomicism) como parte de la aplicación KirV. Se trata de un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, orientado a una tarea muy concreta: leer una declaración de acción (por ejemplo, "I'll give my mum a ring tonight") y responder con la acción principal expresada como una palabra de acción KirV, o bien con las etiquetas HARM o NONE, junto con el tono (sincero, broma, sarcasmo, burla). Un segundo prompt evalúa si la acción perjudica, engaña, decepciona, pone en peligro o excluye a otras personas.

El modelo está empaquetado en formato ONNX de 4 bits (aproximadamente 550 MB, 0,6 GB de repositorio) y se distribuye a través de transformers.js para ejecutarse íntegramente en el navegador o en el teléfono del usuario mediante WebGPU, sin enviar datos a ningún servidor. Esta característica lo hace relevante para aplicaciones que requieren privacidad por diseño y procesamiento local en el dispositivo.

Se trata de un prototipo de investigación en fase piloto, con un tamaño de 0,8 mil millones de parámetros y licencia Apache 2.0. Su relevancia actual radica en su enfoque de despliegue en el navegador con cuantización agresiva y en su especialización en una tarea de evaluación de acciones y tono afectivo, más que en capacidades generales de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5, parte de texto) |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (ONNX); matrices enseñadas reempaquetadas en 4 bits |
| Idiomas soportados | en, th |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, concretamente de la parte de texto del modelo ONNX publicado por onnx-community (Qwen3.5-0.8B-Text-ONNX). Sobre esa base se aplicó un ajuste fino con LoRA en la herramienta KirV Language Lab v6, se fusionaron los adaptadores y posteriormente se reempaquetaron las 186 matrices enseñadas en el archivo de 4 bits. El resultado ocupa aproximadamente 550 MB.

El entrenamiento se orientó a dos tareas específicas: la lectura de acciones (clasificación de la acción principal como palabra de acción KirV, HARM o NONE, junto con el tono) y la evaluación de daño (respuesta sí/no sobre si la acción perjudica, engaña, decepciona, pone en peligro o excluye a otros). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación técnica principal es el despliegue en navegador mediante transformers.js con WebGPU y cuantización 4-bit, manteniendo las matrices enseñadas en el archivo cuantizado.

## Capacidades

- Lectura de declaraciones de acción: identifica la acción principal y la expresa como palabra de acción KirV, o como HARM o NONE.
- Clasificación de tono: distingue entre sincero, broma, sarcasmo y burla.
- Evaluación de daño: responde sí o no a si la acción perjudica, engaña, decepciona, pone en peligro o excluye a otras personas.
- Ejecución local en navegador o teléfono mediante transformers.js y WebGPU, sin envío de datos a servidores.
- Soporte multilingüe limitado a inglés (en) y tailandés (th).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Aplicación de diario personal con evaluación ética: el modelo lee las acciones que el usuario registra y las clasifica según su impacto en otras personas, permitiendo al usuario reflexionar sobre sus decisiones sin que los datos salgan del dispositivo.
- Moderación de contenido en comunidades locales: integrado en una aplicación web, puede señalar declaraciones que perjudican, engañan o excluyen a otros, con la ventaja de que el procesamiento ocurre en el navegador del usuario.
- Asistente de comunicación consciente: analiza mensajes redactados por el usuario antes de enviarlos y advierte sobre tonos sarcásticos o burlones que podrían malinterpretarse.
- Coach de hábitos y compromisos: extrae la acción principal de las promesas que el usuario se hace ("I'll call my mum tonight") y las registra como palabras de acción KirV para su seguimiento.
- Educación socioemocional: en entornos educativos, ayuda a los estudiantes a identificar el tono y el impacto social de sus declaraciones, funcionando como herramienta de reflexión guiada.
- Prototipado de aplicaciones privadas por diseño: sirve como ejemplo de despliegue de un modelo de 0,8B cuantizado a 4 bits en transformers.js con WebGPU, útil para desarrolladores que quieran replicar el enfoque en sus propias aplicaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (1 de noviembre de 2026, 100 frases de validación retenidas, evaluadas en transformers.js):

| Metrica | Resultado |
|---|---|
| Lecturas de acción aceptadas | 94 de 100 |
| Declaraciones dañinas detectadas | 14 de 14 |
| Declaraciones correctas marcadas erróneamente | 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 550 MB en cuantización 4-bit, lo que permite ejecución en dispositivos con recursos limitados.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecutarse en navegador mediante WebGPU, por lo que depende de la GPU integrada o dedicada del dispositivo del usuario.
- Cabe en GPU de consumo: sí, dado su tamaño reducido y cuantización 4-bit; puede ejecutarse en portátiles y teléfonos modernos con soporte WebGPU.
- Opciones de despliegue: transformers.js (principal), con soporte de WebGPU; no se documentan otros entornos como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| KirV-0.8B (web, 4-bit) | 0,8B | no disponible | Apache 2.0 | ONNX 4-bit | transformers.js, WebGPU |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Apache 2.0 | safetensors, ONNX | Múltiples |
| onnx-community/Qwen3.5-0.8B-Text-ONNX | 0,8B | no disponible | Apache 2.0 | ONNX | transformers.js |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un prototipo de investigación en fase piloto; el autor advierte explícitamente de que puede equivocarse.
- La puntuación Avalrem se calcula mediante reglas fijas, no por este modelo, por lo que su salida no debe interpretarse como una evaluación definitiva.
- Idiomas limitados a inglés y tailandés; no se ha documentado soporte para castellano ni otros idiomas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en tareas generales ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está especializado en una tarea concreta y no debe emplearse como modelo generalista.
- El despliegue depende de la disponibilidad de WebGPU en el dispositivo del usuario; en navegadores o dispositivos sin soporte, la inferencia podría no funcionar.
- No se documentan mecanismos de tool calling ni de razonamiento multi-paso, lo que limita su integración en pipelines complejos.

## Enlaces

- HuggingFace: https://huggingface.co/Thammatucharee/kirv-0.8b-web
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-0.8B-Text-ONNX
- Sitio del autor: https://kirdomicism.com
