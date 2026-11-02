# Thox-ai/ThoxWebby-Gemma-4-E2B

## Resumen

ThoxWebby-Gemma-4-E2B es un derivado del checkpoint google/gemma-4-E2B-it-qat-mobile-transformers, publicado por Thox-ai (THOX.AI LLC) como la variante "browser-tier" de su ecosistema ThoxOS. El modelo esta pensado para ejecutarse en el navegador mediante Transformers.js sobre WebGPU, con el objetivo de ofrecer chat y respuestas de tarea cortas en local, completamente offline una vez cacheados los pesos, dentro de la capa de navegador de ThoxOS.

La relevancia del modelo radica en su enfoque de despliegue on-device: se apoya en un checkpoint base con entrenamiento consciente de cuantizacion (QAT) para movil, lo que en teoria facilita su ejecucion en GPUs de consumo a traves de WebGPU. Sin embargo, el repositorio se encuentra en un estado incompleto: la model card indica explicitamente "WEIGHTS NOT ATTACHED" y el unico fichero presente es `.gitattributes`, por lo que no hay pesos, tokenizer ni exportacion ONNX publicados. El tamano del repositorio es de 0.0 GB.

El modelo se distribuye bajo los terminos de la licencia Gemma, aunque la model card declara `apache-2.0` en los metadatos y enlaza a la licencia Gemma 4 como la que gobierna el modelo base. Esta discrepancia debe tenerse en cuenta antes de cualquier uso. No se publican datos de arquitectura detallados, contexto nativo, plantilla de prompt ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E2B instruction-tuned, checkpoint movil con QAT; recuento de capas y cabezas no publicado |
| Parametros totales | No disponible (la model card indica "E2B" como etiqueta, sin cifra verificada) |
| Parametros activos | No disponible (no se confirma si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Build QAT movil segun el identificador del modelo base; no se publican artefactos |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma Terms of Use (metadatos declaran `apache-2.0` con enlace a la licencia Gemma 4) |
| Formato de pesos | No disponible (no hay pesos publicados; el despliegue previsto es Transformers.js/WebGPU) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de google/gemma-4-E2B-it-qat-mobile-transformers, un checkpoint de la familia Gemma 4 en su variante E2B, instruction-tuned y con cuantizacion consciente de entrenamiento (QAT) orientada a despliegue movil. La model card no especifica el numero de capas, cabezas de atencion, dimension del modelo ni la longitud de contexto nativa. Tampoco se documenta si la arquitectura subyacente incorpora mecanismos como atencion lineal o decodificacion especulativa.

En cuanto al entrenamiento, la model card afirma que se trata de un fine-tune de THOX sobre el checkpoint base, pero no registra ni el corpus, ni el procedimiento, ni el numero de tokens, ni si hubo RLHF o DPO. No se publica adaptador, log de entrenamiento ni declaracion de dataset. La seccion de evaluacion indica que no existe artefacto de evaluacion publicado y que ninguna cifra esta verificada.

## Capacidades

- Generacion de texto orientada a chat on-device y respuestas de tarea cortas dentro de la capa de navegador de ThoxOS.
- Ejecucion local en la GPU del usuario mediante WebGPU a traves de Transformers.js, con funcionamiento offline una vez cacheados los pesos.
- Capacidad de fallback a WASM cuando el dispositivo WebGPU no dispone de memoria suficiente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Chat asistencial embebido en navegador: el modelo esta disenado para gestionar conversaciones de chat en la capa de navegador de ThoxOS, ejecutandose en local sobre WebGPU y sin enviar datos a servidores externos, lo que encaja con el lema de privacidad del ecosistema THOX.
- Asistente offline en dispositivos de consumo: al cachear los pesos, el modelo puede responder sin conexion, adecuado para escenarios con conectividad intermitente o requisitos de privacidad estrictos.
- Respuestas de tarea cortas en interfaces web: la model card define su uso previsto como "short task replies", por lo que encaja en widgets de ayuda contextual, autocompletado de formularios o sugerencias breves dentro de una aplicacion web.
- Prototipado de inferencia on-device con Transformers.js: util para desarrolladores que quieran evaluar el flujo `pipeline("text-generation", ..., { device: "webgpu" })` en sus propias aplicaciones, siempre que obtengan los pesos por una ruta aprobada.
- Despliegue en entornos con GPU integrada o movil: el caracter QAT movil del checkpoint base sugiere idoneidad para hardware con memoria limitada, con fallback a WASM cuando WebGPU no sea viable.
- Integracion en el ecosistema ThoxOS: el modelo forma parte de la coleccion "iOS, Browser & Device Knowledge Packs", por lo que su uso natural es como componente de la capa de conocimiento de dispositivo de dicha plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe artefacto de evaluacion y que ninguna cifra esta verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publican pesos ni cifras de memoria.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecutarse via WebGPU en la GPU del usuario, sin lista de modelos validados.
- Compatibilidad con GPU de consumo: no confirmada; el checkpoint base es una variante QAT movil, lo que sugiere orientacion a hardware limitado, pero no hay datos verificados.
- Opciones de despliegue: Transformers.js sobre WebGPU (ruta prevista), con fallback a WASM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| ThoxWebby-Gemma-4-E2B | No disponible (etiqueta E2B) | No disponible | Gemma Terms of Use | No publicados en este repositorio |
| google/gemma-4-E2B-it-qat-mobile-transformers | No disponible en la informacion proporcionada | No disponible | Gemma Terms of Use | Modelo base referenciado |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizer ni exportacion ONNX: tal como se distribuye, no es ejecutable.
- No se publican cifras de tamano, contexto ni calidad, y no existe artefacto de evaluacion verificado.
- La memoria del navegador es la restriccion critica de esta capa: el runtime debe caber en la memoria del dispositivo WebGPU y estar preparado para caer a WASM.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Discrepancia de licencia: los metadatos declaran `apache-2.0`, pero la model card enlaza a la licencia Gemma 4 como la que gobierna el modelo base; conviene verificar los terminos antes de cualquier uso comercial.
- Uso fuera de alcance segun el autor: decisiones de seguridad, medicas o legales sin supervision humana; despliegue en servidor como asistente general; uso como fuente autonoma de hechos sobre THOX.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la model card indica que los hechos deben ser suministrados por la capa de servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxWebby-Gemma-4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- THOX Model Factory: https://www.thox.ai/models
- Coleccion "iOS, Browser & Device Knowledge Packs": https://huggingface.co/collections/Thox-ai/thox-ios-browser-and-device-knowledge-packs-6ae751a19b60e7b12250623f
- Campana Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
