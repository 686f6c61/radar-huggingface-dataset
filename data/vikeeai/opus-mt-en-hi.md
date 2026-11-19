# vikeeai/opus-mt-en-hi

## Resumen

`vikeeai/opus-mt-en-hi` es una conversión a ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-en-hi`, preparada para su uso con la librería Transformers.js en entornos web (navegador o Node.js). El modelo original pertenece a la familia OPUS-MT, desarrollada por el grupo Language Technology de la Universidad de Helsinki, y está especializado en la traducción de inglés a hindi. La conversión la firma el usuario `vikeeai`, que no aporta información adicional sobre el proceso ni sobre la licencia del artefacto resultante.

Se trata de un modelo MarianMT de tipo encoder-decoder, la arquitectura estándar de la familia OPUS-MT, pensada para traducción neuronal de alta calidad con un coste computacional moderado. El repositorio ocupa aproximadamente 0,5 GB, lo que sugiere pesos en precisión completa o FP16 junto con la versión ONNX. No se publican datos sobre el número de parámetros, la longitud de contexto ni el volumen de entrenamiento en la información disponible.

Su relevancia es fundamentalmente práctica: permite ejecutar traducción inglés-hindi directamente en el navegador sin depender de una API externa, lo que facilita aplicaciones web de traducción con privacidad de datos y sin coste de servidor. Al ser una conversión de un modelo ya existente, su valor añadido es la compatibilidad con Transformers.js más que una mejora en calidad de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX (pesos del modelo base, sin cuantizacion especificada) |
| Idiomas soportados | ingles e hindi (par de traduccion en-hi) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo subyacente es MarianMT, una arquitectura transformer de tipo encoder-decoder desarrollada originalmente en el marco del proyecto Marian NMT y adoptada por el grupo de Helsinki para la familia OPUS-MT. Esta familia se entrena sobre corpus paralelos multilingües de OPUS, con un enfoque de traducción supervisada por par de idiomas. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución específica de este repositorio es la exportación a ONNX mediante herramientas compatibles con Transformers.js, con los pesos ubicados en una subcarpeta `onnx`. El autor indica explícitamente que mantener repositorios separados con pesos ONNX es una solución temporal hasta que WebML gane adopción, y recomienda el uso de Optimum para conversiones futuras. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática de inglés a hindi, tanto de frases como de párrafos.
- Generación de texto condicionada a la tarea de traducción (text2text-generation).
- Ejecución en navegador mediante Transformers.js y ONNX Runtime Web.
- Ejecución en Node.js con el mismo stack de Transformers.js.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al par inglés-hindi.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Traducción en el navegador sin servidor: integrar el modelo en una aplicación web que traduzca texto introducido por el usuario de inglés a hindi sin enviar los datos a un backend, gracias a la ejecución local con Transformers.js y ONNX Runtime Web.
- Extensiones de navegador para lectura bilingüe: traducir fragmentos de páginas web en inglés a hindi bajo demanda, manteniendo el contenido en el dispositivo del usuario.
- Herramientas de documentación interna: traducir guías técnicas o manuales en inglés a hindi dentro de una intranet, con el modelo empaquetado en la propia aplicación web.
- Prototipado rápido de interfaces de traducción: validar flujos de UX de traducción en aplicaciones React o Vue sin montar infraestructura de inferencia en servidor.
- Aplicaciones educativas offline: ejercicios de traducción inglés-hindi en entornos con conectividad limitada, aprovechando que el modelo se ejecuta en el cliente.
- Procesamiento por lotes en Node.js: traducir conjuntos de cadenas de interfaz (i18n) de inglés a hindi en scripts locales antes de incorporarlas a un repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo MarianMT de tamaño moderado (repo de 0,5 GB), la inferencia en FP32 requiere aproximadamente 1-2 GB de memoria; en ONNX cuantizado podría reducirse por debajo de 1 GB, aunque no se especifica la cuantización aplicada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y probablemente en iGPU con suficiente memoria compartida.
- Despliegue: Transformers.js (navegador y Node.js) con ONNX Runtime Web; también puede ejecutarse con ONNX Runtime nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vikeeai/opus-mt-en-hi | no disponible | no disponible | no disponible | ONNX | Hugging Face |
| Helsinki-NLP/opus-mt-en-hi | no disponible | no disponible | no disponible en la informacion | safetensors / PyTorch | Hugging Face |
| Helsinki-NLP/opus-mt-en-hi (otras conversiones ONNX de la comunidad) | no disponible | no disponible | depende del conversor | ONNX | Hugging Face |

La comparación relevante es con el modelo base `Helsinki-NLP/opus-mt-en-hi`: misma arquitectura y mismos pesos, pero en formato PyTorch y sin optimización para web. Cualquier otra conversión ONNX comunitaria del mismo modelo sería funcionalmente equivalente, diferenciándose solo en el proceso de exportación y en la estructura del repositorio.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de un uso comercial debe verificarse la licencia del modelo base `Helsinki-NLP/opus-mt-en-hi`.
- Al ser una conversión de pesos, hereda los sesgos y limitaciones del modelo original, que no se documentan en este repositorio.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados, jerga técnica o textos con ambigüedad; no se aportan métricas de calidad (BLEU, chrF) para esta conversión.
- Solo cubre el par inglés-hindi; no traduce en sentido inverso ni a otros idiomas.
- No se especifica la longitud máxima de secuencia soportada; los modelos Marian suelen limitarse a unas pocas centenas de tokens, por lo que textos largos deben dividirse en segmentos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- El autor advierte de que la estructura de repositorios ONNX separados es una solución temporal; pueden aparecer cambios en las recomendaciones de despliegue.
- No apto para tareas de razonamiento, agentes o generación libre de texto fuera de la traducción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/opus-mt-en-hi
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi
- Documentación de Optimum: https://huggingface.co/docs/optimum/index
- Transformers.js: https://huggingface.co/docs/transformers.js
