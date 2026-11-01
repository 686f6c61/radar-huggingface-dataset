# webbrain-one/webbrain-compass-vld-v6-2b-onnx

## Resumen

WebBrain Compass VLD v6 (2B) ONNX es la distribución en formato ONNX del modelo multimodal `webbrain-one/webbrain-compass-vld-v6-2b`, publicada por el mismo autor (webbrain-one). El modelo original es un image-text-to-text basado en la familia Liquid LFM3 (arquitectura con componentes de tipo "liquid"), y esta versión está empaquetada específicamente para ejecución en navegador mediante ONNX Runtime Web y Transformers.js sobre WebGPU, además de ofrecer una ruta de ejecución en CPU.

El problema que resuelve es el despliegue de un modelo de visión-lenguaje de 2B parámetros directamente en el cliente, sin backend GPU propio. Para ello incluye pesos cuantizados en dos variantes (q8f16 y q4f16) y un codificador visual en fp16, junto con un "decision probe" en JavaScript que convierte la salida del modelo en una decisión binaria coste-sensible (Yes/No) usando la diferencia de logits y un estado oculto.

La relevancia de esta release es doble: por un lado, demuestra un pipeline completo de inferencia multimodal en WebGPU con pesos que caben en descargas de 1,3-1,9 GB; por otro, introduce una capa de decisión calibrada para costes (122/126 en `final_test`, 0/48 falsos completados según la model card). La licencia es LFM1.0 (etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text basado en Liquid LFM3 (`lfm3_vl`, `custom_code`); componentes "liquid" según tags del autor |
| Parámetros totales | 2B (según nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX q8f16 (decoder, 1,9 GB) y q4f16 (decoder, 1,3 GB); vision encoder en fp16 (362 MB) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (`license_name: lfm1.0`, `license: other`) |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`), con runtime JS auxiliar |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de las etiquetas: `lfm3_vl` (variante de visión-lenguaje de Liquid LFM3), `liquid` y `custom_code`. Se trata por tanto de un modelo multimodal que combina un codificador visual (exportado aparte como `vision_encoder_fp16.onnx`) con un decoder de lenguaje cuantizado. El pipeline declarado es `image-text-to-text`, y el modelo base es `webbrain-one/webbrain-compass-vld-v6-2b`.

No se proporcionan en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. La innovación técnica documentada es el "decision probe" cost-sensitive incluido en `runtime/lfm3-decision-probe-cs.js`, que expone `[decision_hidden, logit("Yes") - logit("No")]` como señal de decisión, con métricas declaradas de 122/126 en `final_test` y 0/48 falsos completados. También se incluye una carpeta `validation/` con verificación de paridad en ORT CPU, configuraciones JSON de probes y métricas d1.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`), con entrada de imagen y texto conversacional.
- Ejecución en navegador vía ONNX Runtime Web y Transformers.js sobre WebGPU, con fallback a CPU (se incluye verificación de paridad en ORT CPU).
- Decisión binaria coste-sensible mediante el probe JavaScript (`logit("Yes") - logit("No")`), orientada a modelos de decisión.
- Cuantización dual q8f16 / q4f16 para equilibrar tamaño y calidad en cliente.
- Soporte conversacional (tag `conversational`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Decisión binaria en navegador: usar el probe `lfm3-decision-probe-cs.js` para clasificar entradas imagen+texto en Yes/No con umbral ajustable por coste, aprovechando la calibración declarada (122/126 en `final_test`).
- Moderación o filtrado visual en cliente: ejecutar el modelo con `decoder_q4f16.onnx` (1,3 GB) en WebGPU para descartar contenido antes de enviarlo a un backend, reduciendo coste de servidor.
- Asistentes web sin backend: integrar el par decoder + vision encoder en una aplicación web mediante Transformers.js, manteniendo los datos del usuario en el navegador.
- Demos y prototipos de VLM: validar flujos image-text-to-text con cuantización q8f16 cuando se prioriza calidad sobre tamaño (1,9 GB de decoder).
- Verificación de paridad y CI: usar la carpeta `validation/` para comprobar que las salidas ONNX en CPU coinciden con las esperadas antes de desplegar en WebGPU.
- Procesamiento por lotes en CPU: ejecutar la variante ORT CPU en entornos sin GPU para tareas de decisión o image-to-text de bajo volumen.
- Aplicaciones offline/PWA: empaquetar los pesos ONNX en una aplicación instalable que funcione sin conexión tras la primera carga.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Acierto en `final_test` (decision probe) | 122/126 | Probe cost-sensitive incluido en `runtime/` |
| Falsos completados en `final_test` | 0/48 | Probe cost-sensitive incluido en `runtime/` |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparativas de calidad entre las cuantizaciones q8f16 y q4f16.

## Requisitos de hardware

- VRAM estimada: el decoder q4f16 ocupa 1,3 GB en disco y el q8f16 1,9 GB; el vision encoder fp16 añade 362 MB. El consumo en VRAM en WebGPU depende del backend y de la gestión de buffers, pero el tamaño de pesos sitúa el mínimo práctico en torno a 2-3 GB de memoria gráfica.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (por ejemplo, integradas recientes y dedicadas de gama media); en servidor, GPUs con soporte ONNX Runtime (A100, H100) si se despliega fuera del navegador.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPUs de consumo con WebGPU y al menos 4 GB de memoria; la variante q4f16 es la más adecuada para equipos modestos.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y CPU), Transformers.js; también ONNX Runtime nativo en servidor.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebBrain Compass VLD v6 2B ONNX | 2B | no disponible | ONNX (q8f16/q4f16) | LFM1.0 | HuggingFace, 12 descargas |
| WebBrain Compass VLD v6 2B (base) | 2B | no disponible | no disponible | LFM1.0 | HuggingFace |
| Otros VLM de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, idiomas soportados ni comportamiento fuera de distribución.
- Riesgo de alucinación inherente a modelos generativos; no hay evaluación publicada de fidelidad factual.
- El "decision probe" está calibrado sobre un `final_test` concreto (122/126, 0/48 falsos completados); su generalización a otros dominios no está garantizada.
- Licencia LFM1.0 (`other`): es necesario revisar los términos antes de cualquier uso comercial; no se puede asumir permisividad.
- La ejecución en navegador depende de la disponibilidad de WebGPU; en navegadores sin soporte se degrada a CPU con latencia potencialmente alta.
- Solo se ofrecen dos cuantizaciones (q8f16 y q4f16); no hay variantes GGUF ni formatos alternativos en esta release.
- El modelo requiere `custom_code` y el runtime JS auxiliar; no es un ONNX estándar autónomo sin las piezas de `runtime/`.
- Longitud de contexto e idiomas no documentados: no se debe asumir un contexto largo sin verificación empírica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b-onnx
- Modelo base: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b
