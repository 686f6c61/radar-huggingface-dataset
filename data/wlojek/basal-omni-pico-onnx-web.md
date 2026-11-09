# WLojek/basal-omni-pico-onnx-web

## Resumen

`WLojek/basal-omni-pico-onnx-web` es una conversión a ONNX con cuantización int4 del modelo `Remek/basal-omni-pico`, un modelo de decisión tipada ("typed-decision") de 0,8B parámetros desarrollado por Remigiusz Kinas en el marco del proyecto Basal. El modelo original responde a preguntas tipadas sobre un texto de entrada devolviendo una probabilidad calibrada por opción en un único forward pass, en lugar de generar texto libre. Esta versión está específicamente empaquetada para ejecutarse en el navegador mediante onnxruntime-web y el execution provider WebGPU.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue más que de un modelo nuevo: el autor (WLojek) ha tomado los pesos del modelo base, los ha cuantizado a int4 (formato MatMulNBits) y ha exportado el grafo a ONNX con el model builder de onnxruntime-genai, podando además la LM head al último token. El resultado es un paquete de 0,49 GB pensado para inferencia local en cliente, sin servidor.

El modelo base está construido sobre Qwen3.5-0.8B-Base, soporta únicamente texto y está entrenado para polaco e inglés. La licencia es Apache-2.0, igual que el original. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-0.8B-Base (con GatedDeltaNet, requiere WebGPU) |
| Parámetros totales | 0,8B (modelo base); artefacto ONNX int4 de 0,49 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (MatMulNBits), con corrección de logits int4→fp32 para sí/no |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), tokenizer.json, tokenizer_config.json, CALIBRATION.json, basal.json, basal-web.json |

## Arquitectura y entrenamiento

El modelo base `basal-omni-pico` es un transformer de 0,8B parámetros construido sobre Qwen3.5-0.8B-Base. Según la información disponible, la arquitectura incluye GatedDeltaNet, lo que obliga a ejecutar la versión ONNX sobre el execution provider WebGPU (no funciona en CPU). El modelo lee texto y responde a preguntas tipadas con una probabilidad calibrada por opción en un solo forward pass; no es un modelo generativo de texto libre en el sentido habitual.

El entrenamiento del modelo original se realizó con destilación desde `basal-omni-1.0-ultra` (31B) como profesor. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a ONNX int4 fue realizada por WLojek con el model builder de onnxruntime-genai, podando la LM head al último token y añadiendo una corrección de logits int4→fp32 para la decisión binaria sí/no. El autor reporta que el runtime `basal-web` reproduce las mismas respuestas que la referencia fp32 en PyTorch en 23 de 23 prompts de prueba.

## Capacidades

- Clasificación y decisión tipada: responde a preguntas con opciones predefinidas devolviendo una probabilidad calibrada por opción.
- Salida de un solo forward pass: no requiere decodificación autoregresiva para la decisión.
- Soporte de calibración: incluye `CALIBRATION.json` para ajustar las probabilidades.
- Multilingüe limitado: polaco e inglés.
- Ejecución en navegador: compatible con onnxruntime-web y WebGPU.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No soporta visión ni audio: el modelo base lee únicamente texto.

## Casos de uso

- Moderación de contenido en cliente: el modelo puede clasificar textos directamente en el navegador del usuario sin enviar datos a un servidor, gracias a su tamaño reducido (0,49 GB) y a la ejecución sobre WebGPU.
- Extensiones de navegador con decisiones binarias: integrado mediante `basal-web` en la extensión Nopescope, permite responder preguntas sí/no calibradas sobre el contenido de la página.
- Filtrado de formularios y entradas de usuario: clasificación de texto introducido por el usuario en tiempo real, con probabilidad calibrada para umbrales ajustables.
- Enrutamiento de consultas en aplicaciones web: decidir a qué flujo o categoría pertenece una consulta en polaco o inglés, sin coste de servidor.
- Prototipado de modelos de decisión: servir como referencia ligera para validar pipelines de decisión tipada antes de escalar a los modelos Basal mayores (basados en Gemma 4).
- Privacidad por diseño: aplicaciones que requieren que el texto no salga del dispositivo, como asistentes de escritura o correctores con clasificación local.
- Demos educativas de inferencia en navegador: ejemplo de cuantización int4 y despliegue ONNX WebGPU para desarrolladores que quieran replicar el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación reportado por el autor es la equivalencia funcional: el runtime `basal-web` produce las mismas respuestas que la referencia fp32 en PyTorch en 23 de 23 prompts de prueba.

## Requisitos de hardware

- VRAM estimada: el artefacto ONNX ocupa 0,49 GB en disco; la VRAM necesaria para inferencia en WebGPU no está documentada, pero por el tamaño del modelo debería ser del orden de 1 GB o menos.
- GPU recomendadas: no disponible. Requiere un navegador con soporte de WebGPU (Chrome, Edge y derivados recientes).
- GPU de consumo: no hay datos específicos; al ser un modelo de 0,8B en int4, es plausible que funcione en GPUs integradas y discre tas modernas con WebGPU, pero no está confirmado.
- Opciones de despliegue: onnxruntime-web con execution provider WebGPU, a través del runtime `basal-web` (proyecto Nopescope). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| WLojek/basal-omni-pico-onnx-web | 0,8B (int4: 0,49 GB) | no disponible | pl, en | Apache-2.0 | ONNX | Navegador (WebGPU) |
| Remek/basal-omni-pico | 0,8B | no disponible | pl, en | Apache-2.0 | Safetensors | PyTorch / Transformers |
| basal-omni-1.0-ultra | 31B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de clasificación genéricos no está disponible en la información proporcionada. La alternativa más directa es el modelo original en fp32, del que esta versión es una conversión cuantizada.

## Limitaciones y advertencias

- Requiere WebGPU: GatedDeltaNet solo se ejecuta en el execution provider WebGPU, por lo que no funciona en CPU ni en navegadores sin soporte.
- Idiomas limitados: solo polaco e inglés; el rendimiento en otros idiomas no está documentado.
- Modelo de decisión, no generativo: no está pensado para generar texto libre, sino para responder preguntas tipadas con probabilidades.
- Cuantización int4: aunque el autor reporta equivalencia con fp32 en 23 prompts, la cuantización puede introducir degradación en casos límite no cubiertos por esa prueba.
- Sesgos: no se documentan sesgos conocidos; al derivar de Qwen3.5-0.8B-Base, puede heredar sesgos del modelo base.
- Alucinación: al no generar texto libre, el riesgo de alucinación se manifiesta como calibración incorrecta de probabilidades, no como invención de contenido.
- Licencia: Apache-2.0 permite uso comercial, pero el autor pide citar y acreditar el modelo original; esta conversión no está afiliada a los autores de Basal.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/WLojek/basal-omni-pico-onnx-web
- Modelo base: https://huggingface.co/Remek/basal-omni-pico
- Repositorio del proyecto Basal: https://github.com/rkinas/basal
- Repositorio Nopescope (runtime `basal-web`): no disponible en la información proporcionada
- Paper: no disponible
- Demo: no disponible
