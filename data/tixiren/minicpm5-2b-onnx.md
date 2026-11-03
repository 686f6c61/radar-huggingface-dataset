# tixiren/MiniCPM5-2B-ONNX

## Resumen

MiniCPM5-2B-ONNX es una exportacion a formato ONNX del modelo MiniCPM5-2B desarrollado por OpenBMB, publicada por el usuario tixiren. Se trata de una conversión pensada para su ejecución en el navegador mediante transformers.js y WebGPU, con pesos cuantizados en int4 y activaciones en fp16 (variante `q4f16`). El modelo base es un transformer causal de aproximadamente 2.000 millones de parámetros orientado a generación de texto y conversación, distribuido bajo licencia Apache-2.0.

El interés de esta ficha radica en que permite desplegar un modelo conversacional de tamano medio directamente en el cliente, sin servidor, aprovechando la aceleración WebGPU de los navegadores modernos. El repositorio ocupa 1,8 GB e incluye el grafo ONNX generado con el model builder de onnxruntime-genai, posteriormente adaptado al layout que espera transformers.js. Fue creado como baseline del proyecto de chat arena webyIQ.

La información publicada por el autor es muy escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha se limita a los datos verificables del repositorio y del modelo base cuando están disponibles, indicando explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de MiniCPM5-2B); exportada a ONNX |
| Parametros totales | ~2.000 millones (según el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 en pesos con activaciones fp16 (`q4f16`); unico artefacto publicado: `onnx/model_q4f16.onnx` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_q4f16.onnx`), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo subyacente, MiniCPM5-2B de OpenBMB, es un transformer causal de aproximadamente 2.000 millones de parámetros. La model card del repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta ninguna innovación arquitectónica específica (attention linear, decodificación especulativa, etc.).

La contribución técnica de este repositorio es la conversión: los pesos originales se exportaron a ONNX con el model builder de onnxruntime-genai en configuración int4/fp16 y se postprocesaron para adaptarse al layout de transformers.js. Esto permite cargar el modelo en el navegador con `AutoModelForCausalLM.from_pretrained(..., { dtype: "q4f16", device: "webgpu" })` y ejecutar inferencia sobre WebGPU mediante onnxruntime-web.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Ejecución en navegador mediante transformers.js y WebGPU, sin backend propio.
- Compatibilidad con el ecosistema transformers.js: carga con `AutoModelForCausalLM` y tokenizer estándar de la librería.
- Capacidades multilingües: no disponibles en la información publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Chat conversacional embebido en una web: el modelo puede cargarse en el navegador del usuario vía WebGPU y gestionar la conversación sin enviar datos a un servidor, útil para aplicaciones con requisitos de privacidad.
- Demos y prototipos de asistentes sin infraestructura: al ejecutarse en cliente, permite publicar un asistente estático (por ejemplo en GitHub Pages) sin coste de GPU en servidor.
- Evaluación comparativa de modelos en el navegador: es el baseline del chat arena webyIQ, por lo que sirve para comparar respuestas frente a otros modelos en el mismo entorno.
- Herramientas educativas interactivas: tutores o asistentes de documentación que funcionan offline una vez cacheado el modelo (1,8 GB) en el navegador.
- Filtrado y generación de texto en aplicaciones de escritorio basadas en Electron o WebView: reutiliza el mismo artefacto ONNX con WebGPU.
- Pruebas de integración de transformers.js: sirve como referencia para validar pipelines de exportación ONNX → transformers.js antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto `q4f16` ocupa aproximadamente 1,8 GB en disco; la huella en memoria de WebGPU será del orden de 1,5–2 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge recientes). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: previsiblemente ejecutable en GPUs integradas modernas y dedicadas (por ejemplo, gamas RTX o Apple Silicon con WebGPU), aunque no hay confirmación del autor.
- Opciones de despliegue: transformers.js con `device: "webgpu"` y `dtype: "q4f16"`; también es posible usar onnxruntime-web directamente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (formatos distintos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| MiniCPM5-2B-ONNX (este) | ~2B | no disponible | ONNX q4f16 | Apache-2.0 | Si, via transformers.js + WebGPU |
| openbmb/MiniCPM5-2B (base) | ~2B | no disponible | safetensors (presumible) | Apache-2.0 | No directamente; requiere exportacion |
| Alternativas ONNX para transformers.js de tamano similar | no disponible | no disponible | ONNX | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy limitada: la model card no documenta idiomas, contexto, dataset ni alineación; no debe asumirse un comportamiento multilingüe o libre de sesgos sin evaluarlo.
- Riesgo de alucinación: inherente a los modelos generativos de este tamano; no se ha publicado ninguna evaluación de fidelidad.
- Cuantización agresiva: los pesos int4 pueden degradar la calidad respecto al modelo base en fp16/bf16; conviene validar tareas críticas contra el modelo original.
- Dependencia del navegador: requiere WebGPU; la compatibilidad y el rendimiento varían entre navegadores y sistemas operativos.
- Descargas y likes nulos en el momento de la consulta: el repositorio no tiene tracción ni validación comunitaria, por lo que no hay evidencia de terceros sobre su funcionamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de copyright de OpenBMB y verificar la licencia del modelo base original.
- El repositorio fue creado en 2026-11-02 y no se ha actualizado; no hay garantía de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tixiren/MiniCPM5-2B-ONNX
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Proyecto webyIQ (chat arena): https://github.com/rtx527896828/webyIQ
- Librería transformers.js: https://github.com/huggingface/transformers.js
- onnxruntime-genai (model builder): https://github.com/microsoft/onnxruntime-genai
