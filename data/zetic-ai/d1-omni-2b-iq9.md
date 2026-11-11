# ZETIC-ai/d1-Omni-2B-IQ9

## Resumen

d1-Omni-2B-IQ9 es un paquete de inferencia del modelo multimodal d1-Omni-2B de Liquid AI, preparado por ZETIC-ai para ejecutarse en la NPU Hexagon del SoC Qualcomm Dragonwing IQ9 (QCS9075). No se trata de un modelo nuevo, sino de una conversión del checkpoint original a pesos de 8 bits para el modelo de lenguaje y fp16 para los codificadores de visión y audio, distribuida junto con un runtime propietario (Ixian Hexagon) accesible a través del ZeticMLange Hexagon SDK.

El modelo subyacente es un modelo de decisión multimodal: en lugar de generar texto libre, responde a un conjunto estructurado de preguntas sobre una entrada de texto, imagen o audio (preguntas sí/no con probabilidad, elección entre opciones de una lista, o puntuación en una escala). Está pensado para clasificación y enrutado en el borde, no para generación abierta.

Su relevancia radica en que demuestra la viabilidad de ejecutar un modelo any-to-any de 2B parámetros íntegramente en la NPU de un SoC de borde, con una única pasada de NPU para hasta 16 preguntas sobre la misma entrada. El paquete ocupa 2,44 GB y está validado contra la referencia fp32 de Hugging Face con coincidencia top-1 en 231 de 231 preguntas de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-Omni-2B; el paquete es una conversión para NPU Hexagon) |
| Parametros totales | 2B (según el nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 posiciones; una pasada de decisión admite hasta 1.024 tokens (entrada, medios y hasta 16 preguntas) |
| Tipos de cuantizacion | pesos del modelo de lenguaje en 8 bits; codificadores de visión y audio en fp16 (formato IQ9 propietario) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (Liquid AI); el SDK se distribuye aparte con su propia licencia |
| Formato de pesos | paquete propietario para Hexagon NPU (manifest.json, SHA256SUMS, tokenizer, configs y pesos); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card del paquete no describe la arquitectura interna del modelo base. Se sabe que d1-Omni-2B es un modelo multimodal de decisión de Liquid AI que acepta texto, imágenes y audio y produce salidas estructuradas (probabilidades, elecciones y puntuaciones) en una sola pasada. El paquete de ZETIC convierte el checkpoint upstream (revisión c8d48c08) a un formato ejecutable en la NPU Hexagon: pesos del modelo de lenguaje en 8 bits y codificadores de visión y audio en fp16.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable del paquete es la ejecución de todas las preguntas sobre una misma entrada en una única pasada de NPU (hasta 16 preguntas), lo que reduce la latencia frente a evaluar cada pregunta por separado. Cada pasada de decisión se ejecuta en un único NSP del IQ9.

## Capacidades

- Decisión multimodal sobre texto, imágenes (512 x 512 RGB) y audio (hasta 30 s por fragmento).
- Preguntas de tipo sí/no con probabilidad asociada (`Question::Noul`).
- Elección entre opciones de una lista con descripción (`Question::Choice`).
- Puntuación en una escala definida por el usuario (`Question::Score`).
- Evaluación de hasta 16 preguntas en una sola pasada de NPU sobre la misma entrada.
- Procesamiento de audio WAV PCM de 8, 16, 24 y 32 bits o float, con mezcla a mono y remuestreo a 16 kHz.
- Lectura de imágenes en PNG, JPEG, PPM y BMP, o RGB de 8 bits desde memoria.
- No se documentan capacidades de generación de texto libre, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica un ticket de texto con preguntas como "¿pide un reembolso?" (sí/no), "¿qué equipo debe gestionarlo?" (elección entre facturación y envíos) y "¿qué urgencia tiene?" (puntuación baja/media/alta), todo en una pasada de NPU.
- Moderación de contenido en el dispositivo: evaluación de imágenes o audio capturados localmente con preguntas binarias de cumplimiento, sin enviar los datos a la nube.
- Inspección visual en línea de producción: clasificación de imágenes de 512 x 512 con preguntas de sí/no o elección de categoría de defecto, aprovechando la ejecución en NPU de bajo consumo.
- Análisis de llamadas o notas de voz: clasificación de fragmentos de audio de hasta 30 s por intención, sentimiento o criticidad mediante preguntas de elección y puntuación.
- Triaje de accesibilidad o asistencia: decisión sobre imágenes y audio combinados en una misma pasada (por ejemplo, detectar si una foto o un clip requiere intervención humana).
- Filtrado previo en pipelines de datos: etiquetado automático de grandes volúmenes de texto, imagen y audio en el borde antes de enviarlos a un modelo mayor en servidor.
- Automatización industrial embebida: integración en dispositivos con Qualcomm Linux (linux-arm64) que necesiten clasificación multimodal local con latencia predecible y sin conectividad.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El único dato de validación disponible es la coincidencia con la referencia:

| Prueba | Resultado |
|---|---|
| Coincidencia top-1 con la referencia fp32 de HF (v73, QCS9075, 2 NSP) | 231 de 231 preguntas de prueba |
| Fecha de validación | 2026-10-31 a 2026-11-02, SDK 0.1.0 (release candidate y builds finales), paquete 0.1.0 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Qualcomm Dragonwing IQ9 (QCS9075) con NPU Hexagon, 2 NSP; sistema operativo Qualcomm Linux (linux-arm64). No se ejecuta en otros dispositivos.
- Tamaño del paquete: 2,44 GB en disco (carpeta `v73/`, 19 archivos).
- VRAM/RAM estimada: no disponible; el paquete está diseñado para la memoria de la NPU y del SoC, no para GPU de escritorio.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por este paquete.
- Consumer GPU: no aplicable.
- Opciones de despliegue: exclusivamente el ZeticMLange Hexagon SDK para el Dragonwing IQ9 (runtime Ixian Hexagon), con CLI `zetic_d1_cli` y API C++ `zetic_decision.h`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| d1-Omni-2B-IQ9 (este paquete) | 2B (según nombre) | 2.048 posiciones; 1.024 tokens por pasada | Texto, imagen, audio; salida de decisión estructurada | LFM Open License v1.0 | Solo NPU Hexagon del Dragonwing IQ9 |
| LiquidAI/d1-Omni-2B (upstream) | 2B (según nombre) | no disponible | Texto, imagen, audio; salida de decisión estructurada | LFM Open License v1.0 | GPU/servidor (formato HF) |
| Modelos generativos multimodales de ~2B (p. ej. familia Qwen2-VL-2B) | ~2B | varios miles de tokens | Texto, imagen; generación libre | licencias variables | llama.cpp, vLLM, GPU de consumo |

La comparación con modelos generativos de tamaño similar es solo orientativa: d1-Omni-2B no genera texto libre, sino que responde preguntas estructuradas, por lo que la categoría de uso es distinta. No se dispone de datos de rendimiento comparables entre estas alternativas.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en el Qualcomm Dragonwing IQ9 (QCS9075) con el SDK propietario de ZETIC; no es portable a GPU ni a otros SoC.
- El SDK no está incluido en el repositorio de Hugging Face y se distribuye por separado desde GitHub, con su propia licencia.
- Las imágenes deben ser exactamente 512 x 512 RGB; el SDK no reescala y rechaza otros tamaños con `Status::InvalidArgument`.
- El audio se limita a 30 s por fragmento; los clips más largos deben dividirse.
- La ventana de una pasada de decisión es de 1.024 tokens, con un máximo de 16 preguntas por pasada.
- No se documentan idiomas soportados ni sesgos conocidos; el riesgo de alucinación en un modelo de decisión se manifiesta como clasificaciones erróneas o probabilidades mal calibradas.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial y redistribución; debe leerse antes de desplegar.
- Los pesos son una conversión derivada, no el checkpoint original; la fidelidad está validada solo para el conjunto de 231 preguntas de prueba documentado.
- El modelo no genera texto libre, por lo que no sirve para tareas de generación, resumen o diálogo abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZETIC-ai/d1-Omni-2B-IQ9
- Modelo base upstream: https://huggingface.co/LiquidAI/d1-Omni-2B
- Revisión upstream utilizada: https://huggingface.co/LiquidAI/d1-Omni-2B/tree/c8d48c08dada0191c6b362820f055cfb49c99426
- SDK (ZeticMLange Hexagon SDK for the Dragonwing IQ9): https://github.com/zetic-ai/IxianHexagon
- Licencia LFM Open License v1.0: archivo LICENSE en el repositorio del modelo
