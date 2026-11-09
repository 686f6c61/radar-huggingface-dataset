# WLojek/basal-2.0-mini-onnx-web

## Resumen

basal-2.0-mini-onnx-web es una conversión a ONNX con cuantización int4 del modelo Remek/basal-2.0-mini, un modelo de decisión de 1,5 mil millones de parámetros basado en la arquitectura Llama (concretamente Bielik v3). Lo publica WLojek como derivado cuantizado y exportado para ejecutarse en el navegador mediante onnxruntime-web y el backend WebGPU. No es un modelo generativo al uso: un modelo Basal lee un texto y responde una pregunta tipada devolviendo una probabilidad calibrada por opción en un único forward pass.

El modelo original lo desarrolla Remigiusz Kinas dentro del proyecto Basal (rkinas/basal), y esta variante forma parte del proyecto de código abierto Nopescope, que incluye un runtime JavaScript (basal-web) que implementa el contrato de formato de prompt 2 de Basal. El interés actual de esta ficha radica en que permite llevar un clasificador de decisión de 1,5B a entornos sin servidor, ejecutándose íntegramente en el cliente (extensión de navegador) con pesos de menos de 1 GB.

La relevancia técnica está en la combinación de cuantización int4 (MatMulNBits), poda de la LM head al último token y corrección de logits int4→fp32 para mantener la calibración. El autor reporta paridad de respuestas con la referencia fp32 en PyTorch sobre 23 de 23 prompts de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (base: Bielik v3), exportado a ONNX con MatMulNBits int4 |
| Parametros totales | 1,5B (modelo base); tamano del repo 1,0 GB |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MatMulNBits) con correccion de logits int4→fp32 para la salida si/no |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data) |
| Tarea (pipeline) | text-classification (modelo de decision con probabilidad calibrada por opcion) |
| Runtime objetivo | onnxruntime-web con execution provider WebGPU |
| Modelo base | Remek/basal-2.0-mini |
| Autoria del modelo base | Remigiusz Kinas (proyecto Basal, rkinas/basal) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama, según la model card construido sobre Bielik v3, con 1,5B de parámetros. La innovación de la familia Basal no está en el transformer sino en la interfaz: en lugar de generar texto libre, el modelo recibe un prompt con formato específico (contrato de prompt 2) y emite, en un solo forward pass, una probabilidad calibrada para cada opción de una pregunta tipada. Esto lo convierte en un clasificador de decisión más que en un generador.

La conversión de WLojek aplica tres transformaciones: cuantización int4 de las matrices (MatMulNBits) mediante el model builder de onnxruntime-genai para el execution provider WebGPU, poda de la LM head para conservar únicamente el token final, y una corrección documentada en basal-web.json que mapea los logits int4 a fp32 para preservar la calibración de la salida binaria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Clasificación de decisión con probabilidad calibrada: responde preguntas tipadas (por ejemplo, sí/no) sobre un texto de entrada en un único forward pass, sin generación autoregresiva.
- Salida probabilística apta para umbrales: la calibración permite fijar cortes de decisión y medir confianza, no solo etiquetas duras.
- Funcionamiento íntegro en el navegador: inferencia local vía onnxruntime-web y WebGPU, sin llamadas a servidor.
- Multilingüe limitado a polaco e inglés, según los metadatos del modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un agente.
- No dispone de modo thinking, visión ni audio.
- Paridad funcional reportada con la referencia fp32 en PyTorch sobre 23 de 23 prompts de prueba.

## Casos de uso

- Moderación y filtrado en el cliente: una extensión de navegador puede clasificar contenido (por ejemplo, si un texto cumple una política) localmente con WebGPU, sin enviar datos a un servidor, gracias al runtime basal-web y a los pesos int4 de menos de 1 GB.
- Detección de phishing o contenido engañoso en el navegador: el modelo evalúa si una página o mensaje cumple una condición tipada y devuelve una probabilidad calibrada que la extensión puede umbralizar; es exactamente el escenario de la extensión Nopescope.
- Clasificación de intención en asistentes web: decidir si la consulta del usuario corresponde a una acción concreta (sí/no) antes de derivar a un backend, con latencia local y sin coste de API.
- Triaje de soporte en aplicaciones web: etiquetar tickets o mensajes entrantes según criterios binarios definidos por prompt, aprovechando el soporte bilingüe pl/en para mercados centroeuropeos.
- Enrutado condicional en pipelines de datos: usar la probabilidad calibrada como señal para decidir si un documento pasa a revisión humana o a un proceso automático, con umbral ajustable.
- Investigación sobre calibración y cuantización: banco de pruebas para estudiar cómo afecta int4 a la calibración de probabilidades en modelos de decisión, dado que el autor documenta la corrección de logits y la paridad con fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comparación cualitativa de paridad: el runtime basal-web reproduce las respuestas del modelo fp32 de referencia en PyTorch en 23 de 23 prompts de prueba. No se aportan cifras de latencia, throughput ni métricas de calibración (ECE, Brier) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,97 GB en int4, por lo que el modelo cabe holgadamente en GPUs integradas y dedicadas de gama media; el consumo real depende del runtime WebGPU y del navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge en Windows y macOS); en servidor, GPUs NVIDIA con WebGPU o con el execution provider CUDA de onnxruntime.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo reciente con WebGPU habilitado; el cuello de botella es más el soporte del navegador que la memoria.
- Opciones de despliegue: onnxruntime-web con WebGPU (objetivo principal, vía basal-web), onnxruntime nativo (CPU o CUDA) y, en general, cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| basal-2.0-mini-onnx-web (esta ficha) | 1,5B | no disponible | Clasificación de decisión binaria/tipada | Apache-2.0 | ONNX int4 |
| Remek/basal-2.0-mini | 1,5B | no disponible | Clasificación de decisión | Apache-2.0 | PyTorch (fp32) |
| Modelos de clasificación tipo BERT/RoBERTa (p. ej., base) | ~110-125M | 512 tokens típicos | Clasificación supervisada por etiquetas fijas | variable | safetensors, ONNX |

La diferencia clave frente a un clasificador BERT clásico es que Basal no requiere reentrenamiento por tarea: la pregunta se define en el prompt y la salida es una probabilidad calibrada. Frente al modelo base en PyTorch, esta variante sacrifica precisión numérica por portabilidad al navegador. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un derivado cuantizado a int4 y exportado a ONNX: puede haber degradación sutil de calibración fuera de los 23 prompts de prueba reportados; conviene validar con un conjunto propio antes de producción.
- Cobertura lingüística limitada a polaco e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No es un modelo generativo: no sirve para chat, resumen, código ni razonamiento libre; usarlo fuera de su contrato de prompt produce resultados sin sentido.
- Riesgo de alucinación en el sentido de confianza mal calibrada: una probabilidad alta no equivale a verdad factual, solo a la estimación del modelo sobre la pregunta formulada.
- Longitud de contexto no documentada: textos largos pueden truncarse o degradar la decisión.
- Licencia Apache-2.0 permite uso comercial, pero el autor pide citar y acreditar el modelo original Remek/basal-2.0-mini; no está afiliado a los autores de Basal.
- Dependencia del soporte WebGPU del navegador: la disponibilidad y el rendimiento varían entre plataformas y versiones.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WLojek/basal-2.0-mini-onnx-web
- Modelo base: https://huggingface.co/Remek/basal-2.0-mini
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20
- Repositorio del proyecto Basal: https://github.com/rkinas/basal
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Remek/basal-2.0-mini
