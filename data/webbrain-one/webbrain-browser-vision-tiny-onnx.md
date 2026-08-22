# webbrain-one/webbrain-browser-vision-tiny-onnx

## Resumen

WebBrain Browser Vision Tiny ONNX es la exportación a formato ONNX del modelo webbrain-one/webbrain-browser-vision-tiny, un modelo de visión-lenguaje de pequeño tamaño diseñado específicamente para la comprensión de interfaces gráficas (GUI) y la automatización de navegador. El modelo original deriva de LiquidAI/LFM2.5-VL-450M y ha sido afinado por el equipo de WebBrain para tareas de interacción con páginas web, como hacer clic, escribir y navegar. Esta versión ONNX está optimizada para ejecutarse directamente en el navegador mediante Transformers.js y WebGPU, lo que permite desplegar un agente de IA local sin necesidad de servidor.

La relevancia de este modelo radica en su capacidad para llevar la automatización de navegador al cliente, reduciendo la latencia y preservando la privacidad del usuario. Al ser una conversión del modelo base, mantiene la arquitectura original pero con pesos cuantizados en el decoder (Q4 simétrico) y el encoder de visión en FP16, un equilibrio pensado para conservar los detalles finos de las capturas de pantalla. El repositorio incluye el layout completo de ONNX, tokenizador, procesador, configuración y plantilla de chat, listo para su uso con Transformers.js.

A pesar de su tamaño reducido, el modelo no ha superado la prueba de calidad interna del autor (solo 32 de 100 casos estrictos), lo que indica que aún tiene margen de mejora en tareas complejas de navegador. No obstante, su integración con WebBrain, una extensión de navegador de código abierto, lo convierte en una opción interesante para desarrolladores que buscan un agente local y ligero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (derivado de LFM2.5-VL-450M) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (embed_tokens y vision_encoder), Q4 simétrico (decoder) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (Transformers.js) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del modelo webbrain-browser-vision-tiny, que a su vez se basa en LiquidAI/LFM2.5-VL-450M, un modelo de visión-lenguaje de aproximadamente 450 millones de parámetros (según el nombre, aunque no se confirma en la documentación). La arquitectura combina un encoder de visión para procesar capturas de pantalla y un decoder de lenguaje para generar acciones o respuestas. En esta exportación, el encoder de visión se mantiene en FP16 para preservar los detalles de texto pequeño y elementos de GUI, mientras que el decoder se cuantiza a Q4 simétrico para reducir el tamaño y el uso de memoria.

No se proporcionan detalles sobre el entrenamiento del modelo base, pero el dataset de afinamiento se identifica como webbrain-one/webbrain-browser-vision-tiny-dataset, orientado a tareas de comprensión de GUI y automatización de navegador. La exportación se realizó con la herramienta Liquid4All/onnx-export y se verificó mediante pruebas de paridad FP16 y Q4, así como una prueba de humo en WebGPU. El modelo no ha pasado el release gate de producción del autor, lo que sugiere que su rendimiento en tareas reales de navegador aún no es óptimo.

## Capacidades

- Comprensión de interfaces gráficas: interpreta capturas de pantalla de páginas web y extrae información sobre elementos interactivos (botones, campos de texto, enlaces).
- Automatización de navegador: puede generar acciones como clics, escritura y navegación, lo que permite ejecutar tareas multi-paso en el navegador.
- Conversación sobre el contenido de la página: responde preguntas sobre el texto, imágenes o estructura de la página actual.
- Ejecución local en navegador: gracias a la exportación ONNX y WebGPU, funciona sin conexión a servidores externos, reduciendo latencia y mejorando la privacidad.
- Integración con la extensión WebBrain: se puede usar como motor de IA en el panel lateral de la extensión para Chrome, Firefox y Edge.
- Capacidades de agente: aunque no se documenta explícitamente tool calling, el modelo está diseñado para actuar como agente autónomo en flujos de trabajo de navegador.

## Casos de uso

- Automatización de tareas repetitivas en el navegador: el modelo puede rellenar formularios, extraer datos de tablas o hacer clic en elementos específicos, guiado por instrucciones en lenguaje natural.
- Asistente de soporte al cliente: integrado en una extensión, puede responder preguntas sobre la documentación o el estado de una cuenta mientras el usuario navega.
- Agente de investigación: dado un tema, el modelo puede navegar por varias páginas, recopilar información y resumir los hallazgos en una conversación.
- Testing de UI automatizado: al comprender capturas de pantalla, puede verificar que los elementos de una interfaz se renderizan correctamente y ejecutar pruebas de humo.
- Accesibilidad web: ayuda a usuarios con discapacidad visual a interactuar con páginas complejas mediante comandos de voz o texto, describiendo la interfaz y ejecutando acciones.
- Automatización de flujos de trabajo multi-paso: por ejemplo, iniciar sesión, buscar un producto, añadirlo al carrito y proceder al pago, todo mediante instrucciones conversacionales.

## Benchmarks y rendimiento

La model card incluye una evaluación propia del autor sobre un conjunto de 100 casos de producción. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Resultado |
|---|---|
| Errores | 0 |
| Pases estrictos (strict passes) | 32/100 |
| Puntuacion media | 0.6589 |
| Completado de seis secciones | 77/100 |
| Prueba de humo WebGPU | superada |

Estos datos indican que el modelo tiene una precisión limitada en tareas complejas de navegador, aunque la prueba de humo confirma que la exportación ONNX funciona correctamente en el entorno WebGPU.

## Requisitos de hardware

- Al ser un modelo pequeño (aproximadamente 450M de parámetros) con decoder cuantizado a Q4, el tamaño del repositorio es de 0.8 GB, lo que sugiere que puede ejecutarse en GPUs de consumo e incluso en iGPUs modernas.
- No se proporcionan requisitos específicos de VRAM, pero por el tamaño y la cuantización, se estima que necesitará menos de 1 GB de VRAM en FP16/Q4.
- Está diseñado para ejecutarse en navegadores con soporte WebGPU, por lo que cualquier GPU compatible con WebGPU (por ejemplo, integradas Intel, AMD o NVIDIA discretas) debería ser suficiente.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web, integrable en extensiones de navegador o aplicaciones web. No se menciona soporte para vLLM, llama.cpp u otros backends.
- La latencia y el throughput no se han publicado, pero al ser un modelo pequeño, se espera una respuesta casi en tiempo real en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base LFM2.5-VL-450M podría ser un punto de referencia, pero no se han publicado comparativas directas. Tampoco se conocen otros modelos de visión-lenguaje específicamente orientados a automatización de navegador con exportación ONNX/WebGPU. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La evaluación del autor muestra que el modelo no supera el release gate de producción (solo 32% de pases estrictos), lo que indica una fiabilidad limitada en tareas complejas de navegador.
- La licencia LFM Open License v1.0 puede imponer condiciones de atribución y redistribución; es necesario revisar los términos completos antes de un uso comercial.
- No se especifican los idiomas soportados, por lo que el rendimiento en idiomas distintos del inglés podría ser deficiente.
- Al ser una conversión ONNX con cuantización Q4, puede haber una pérdida de precisión respecto al modelo original en tareas que requieran comprensión fina de texto o elementos visuales.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de navegador, podría heredar sesgos de los sitios web utilizados en el entrenamiento.
- El riesgo de alucinación en respuestas conversacionales no se ha evaluado formalmente; se recomienda validar las salidas en entornos de producción.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/webbrain-one/webbrain-browser-vision-tiny-onnx
- Modelo base: https://huggingface.co/webbrain-one/webbrain-browser-vision-tiny
- Dataset de afinamiento: https://huggingface.co/webbrain-one/webbrain-browser-vision-tiny-dataset
- Repositorio de WebBrain en GitHub: https://github.com/webbrain-one/webbrain
- Sitio web de WebBrain: https://www.webbrain.one/
