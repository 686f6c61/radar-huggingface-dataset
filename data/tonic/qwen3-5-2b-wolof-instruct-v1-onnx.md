# Tonic/Qwen3.5-2B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-2B-Wolof-Instruct-v1-ONNX es una exportacion al formato ONNX del modelo Tonic/Qwen3.5-2B-Wolof-Instruct-v1, un ajuste fino del modelo Qwen3.5 de 2.000 millones de parametros especializado en wolof e instrucciones conversacionales. Lo publica el usuario Tonic en Hugging Face y esta disenado especificamente para ejecutarse en el navegador mediante Transformers.js con aceleracion WebGPU, usando cuantizacion q4f16.

El modelo resuelve el problema de desplegar un asistente conversacional en wolof sin infraestructura de servidor: al estar exportado a ONNX y optimizado para Transformers.js, puede cargarse directamente en una pagina web y ejecutarse en el dispositivo del usuario. Esto es relevante para aplicaciones de acceso linguistico en comunidades wolof, donde el despliegue en servidor puede ser costoso o problematico por conectividad.

La ficha se basa unicamente en los metadatos disponibles en Hugging Face y en la model card del autor, que es muy escueta. No se dispone de informacion publicada sobre arquitectura detallada, datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun tag `qwen3_5_text`) |
| Parametros totales | 2.000 millones (2B, segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (exportacion ONNX para Transformers.js WebGPU) |
| Idiomas soportados | wolof (especializado); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (repo de 9,7 GB); modelo base en safetensors presumiblemente |

## Arquitectura y entrenamiento

El modelo base es Tonic/Qwen3.5-2B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 de 2B parametros. El tag `qwen3_5_text` indica que se trata de la variante textual de la arquitectura Qwen3.5, un transformer decoder-only. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La innovacion tecnica destacable de esta publicacion concreta es la exportacion a ONNX con cuantizacion q4f16 para Transformers.js, lo que permite ejecucion en navegador con WebGPU. No se documentan otras innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en wolof, orientada a instrucciones.
- Ajuste especifico para wolof (tag `wolof`, `galsenai`), lo que sugiere especializacion en esta lengua.
- Ejecucion en navegador mediante Transformers.js y WebGPU.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues adicionales: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional web en wolof: el modelo puede cargarse directamente en una pagina web mediante Transformers.js y responder en el dispositivo del usuario, sin necesidad de backend, lo que facilita el acceso en zonas con conectividad limitada.
- Aplicaciones educativas offline-first: al ejecutarse en el navegador con WebGPU, permite desplegar tutoria en wolof en escuelas con infraestructura minima.
- Traduccion y asistencia linguistica: un modelo afinado en wolof puede apoyar tareas de redaccion y comprension de textos en esta lengua dentro de herramientas web.
- Prototipado rapido de chatbots: la exportacion ONNX y la integracion con Transformers.js permiten a desarrolladores probar un asistente en wolof con pocas lineas de JavaScript.
- Demos y pruebas de concepto en WebGPU: util para evaluar el rendimiento de modelos de 2B en navegador antes de invertir en despliegue servidor.
- Accesibilidad linguistica en portales publicos: integracion de un asistente en wolof en sitios web de servicios ciudadanos sin coste de inferencia en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con cuantizacion q4f16, un modelo de 2B parametros ocupa aproximadamente 1-2 GB en memoria, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo esta orientado a WebGPU, por lo que requiere un navegador compatible con WebGPU (Chrome, Edge) y una GPU integrada o dedicada con soporte.
- Cabida en GPU de consumo: probablemente si en GPUs de consumo con WebGPU, pero no confirmado.
- Opciones de despliegue: Transformers.js con WebGPU (principal); otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para esta exportacion ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-2B-Wolof-Instruct-v1-ONNX | 2B | no disponible | no disponible | ONNX | Wolof, navegador (WebGPU) |
| Tonic/Qwen3.5-2B-Wolof-Instruct-v1 | 2B | no disponible | no disponible | safetensors (presumible) | Wolof, servidor |
| Qwen3.5-2B (base) | 2B | no disponible | no disponible | no disponible | Generico multilingue |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es minima: no se documentan sesgos, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion inherente a modelos de 2B parametros, especialmente en tareas de conocimiento factual.
- Especializacion en wolof: el rendimiento en otros idiomas no esta documentado y probablemente sea limitado.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de un despliegue en produccion.
- La cuantizacion q4f16 puede degradar la calidad respecto al modelo base en safetensors.
- Dependencia de WebGPU: navegadores sin soporte (o hardware sin WebGPU) no podran ejecutar el modelo.
- Repo de 9,7 GB: la descarga inicial en navegador puede ser inviable en conexiones lentas; conviene evaluar cache y carga por capas.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-Instruct-v1
- Transformers.js: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
