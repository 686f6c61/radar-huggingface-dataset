# tianxiwei/pi05-piper-four-color-step2000

## Resumen

pi05-piper-four-color-step2000 es un checkpoint de política visuomotora derivado de pi0.5 (OpenPI), el modelo de control robótico de Physical Intelligence. El autor, tianxiwei, lo ha publicado como fine-tuning del modelo pi05-piperx-two-color-step6000 para una tarea concreta de clasificación de bloques de cuatro colores en un brazo robótico Piper. No es un modelo de lenguaje generalista: es una política de imitación que traduce observaciones visuales y estado proprioceptivo en comandos de articulaciones.

El modelo combina un backbone de lenguaje Gemma 2B con LoRA y un experto de acción Gemma 300M completamente fine-tuneado, siguiendo la receta de pi0.5. Consume imágenes RGB externas y de muñeca, seis ángulos de articulación en radianes, anchura de pinza en metros y un prompt en lenguaje natural, y predice un horizonte de 50 pasos de acción. El entrenamiento adicional consistió en 2.000 pasos sobre 120 demostraciones (27.903 frames a 30 FPS) que cubren 12 combinaciones de color.

Su relevancia es acotada pero práctica: demuestra el flujo de fine-tuning de OpenPI sobre hardware Piper y sirve como referencia reproducible para quien quiera adaptar pi0.5 a tareas de manipulación con pocos datos. El repo pesa 7,2 GB y se distribuye como checkpoint JAX/Orbax, no como pesos safetensors o GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (OpenPI): backbone de lenguaje Gemma 2B con LoRA + experto de acción Gemma 300M, transformer visuomotor |
| Parámetros totales | no disponible (repo de 7,2 GB; incluye pesos de backbone y experto de acción) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; horizonte de predicción de acción de 50 pasos |
| Tipos de cuantización | no disponible (checkpoint JAX/Orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible (acepta prompts en lenguaje natural, idioma no especificado) |
| Licencia | gemma-terms (Gemma Terms of Use), con restricciones de uso referenciadas |
| Formato de pesos | JAX/Orbax (carpeta `params`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 de OpenPI: un backbone de lenguaje Gemma 2B adaptado con LoRA que procesa el prompt en lenguaje natural junto con las observaciones, y un experto de acción Gemma 300M fine-tuneado por completo que genera las acciones. Las entradas son imágenes RGB externas y de muñeca, seis ángulos de articulación en radianes, anchura de pinza en metros y un prompt textual. La salida es un horizonte de 50 pasos; las acciones internas de articulación son relativas al estado observado, mientras que la anchura de pinza es absoluta, y las transformaciones de salida configuradas en OpenPI restauran objetivos absolutos de articulación para la ejecución.

El fine-tuning partió de pi05-piperx-two-color-step6000 y añadió 2.000 pasos usando 120 demostraciones y 27.903 frames a 30 FPS, cubriendo 12 combinaciones de color del dataset tianxiwei/piperx-four-color-block-sorting. El estado del optimizador está excluido del checkpoint. La carga requiere un checkout compatible de OpenPI (commit de referencia 215abfb217dbac7d5f1273282331b9b1866c0479) y debe usar la arquitectura registrada en `inference_metadata.json` junto con las estadísticas de normalización de `assets/tianxiwei/piperx-four-color-block-sorting/norm_stats.json`.

## Capacidades

- Control robótico visuomotor: genera comandos de articulación y anchura de pinza a partir de imágenes RGB y estado proprioceptivo.
- Clasificación de bloques por color: entrenado específicamente para 12 combinaciones de cuatro colores.
- Condicionamiento por prompt en lenguaje natural: acepta instrucciones textuales junto a la observación.
- Fusión multimodal: integra imagen externa, imagen de muñeca, ángulos de articulación y anchura de pinza.
- Predicción multi-paso: horizonte de 50 acciones por inferencia.
- Adaptación con pocos datos: fine-tuning efectivo con 120 demostraciones.
- No dispone de capacidades de generación de texto general, código, matemáticas, tool calling, agentes ni audio; es exclusivamente una política de acción.

## Casos de uso

- Clasificación de bloques por color en laboratorio: el modelo recibe la imagen de la mesa y el prompt de color objetivo y genera la secuencia de articulaciones para recoger y colocar el bloque; es adecuado porque fue entrenado exactamente sobre 12 combinaciones de cuatro colores.
- Reproducción de experimentos de OpenPI: sirve como checkpoint de referencia para validar un checkout de OpenPI en el commit indicado y comparar resultados de fine-tuning sobre hardware Piper.
- Base para nuevos fine-tunings: al partir de pi05-piperx-two-color-step6000, puede reutilizarse como inicialización para tareas de manipulación adicionales con pocas demostraciones.
- Evaluación de robustez visuomotora: permite medir el comportamiento del experto de acción ante variaciones de iluminación y posición usando las imágenes externa y de muñeca.
- Integración en pipelines de recogida y colocación (pick-and-place): las acciones absolutas restauradas por las transformaciones de OpenPI se envían directamente al controlador del brazo.
- Estudio de normalización y adaptadores de observación: el par `inference_metadata.json` + `norm_stats.json` documenta la configuración del adaptador Libero, útil para depurar discrepancias entre entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 7,2 GB e incluye backbone Gemma 2B y experto Gemma 300M en precisión de entrenamiento, por lo que se requiere al menos una GPU con memoria suficiente para ambos módulos y las imágenes de entrada.
- GPU recomendadas: no disponible en la información proporcionada; al ser un checkpoint JAX/Orbax, el despliegue típico usa aceleradores compatibles con JAX (por ejemplo, GPUs de datacenter), pero el autor no especifica modelos concretos.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: exclusivamente mediante un checkout compatible de OpenPI (commit 215abfb217dbac7d5f1273282331b9b1866c0479); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no están orientados a políticas JAX/Orbax.
- Latencia y throughput: no disponibles; la predicción cubre 50 pasos de acción por inferencia, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-piper-four-color-step2000 | no disponible (repo 7,2 GB) | horizonte de 50 acciones | clasificación de 4 colores en Piper | gemma-terms | Hugging Face, JAX/Orbax |
| pi05-piperx-two-color-step6000 (modelo base) | no disponible | horizonte de 50 acciones | clasificación de 2 colores | gemma-terms | Hugging Face |
| pi0.5 (OpenPI upstream) | Gemma 2B + experto 300M | horizonte configurable en OpenPI | políticas visuomotoras generales | según OpenPI/Gemma | GitHub Physical-Intelligence/openpi |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado solo para clasificación de bloques de cuatro colores con 12 combinaciones; el rendimiento fuera de esa distribución no está caracterizado.
- Dependencia estricta de OpenPI: requiere el commit 215abfb217dbac7d5f1273282331b9b1866c0479 y la arquitectura registrada en `inference_metadata.json`; cargarlo de otra forma puede producir resultados incorrectos.
- Normalización obligatoria: debe mantenerse junto el `norm_stats.json` del dataset; omitirlo invalida las predicciones.
- Formato no estándar: al ser JAX/Orbax, no es directamente utilizable con tooling de safetensors, GGUF o llama.cpp.
- Licencia Gemma Terms of Use: los pesos derivados de Gemma están sujetos a las restricciones de uso referenciadas, incluida la cláusula de uso prohibido; revisar `LICENSE_GEMMA.txt` y `NOTICE` antes de uso comercial.
- Sin datos de sesgo, alucinación o robustez publicados; al tratarse de una política robótica, el riesgo principal es ejecutar acciones incorrectas ante entradas fuera de distribución.
- Idiomas no especificados: no se documenta en qué idioma deben formularse los prompts.
- Estado del optimizador excluido: no permite reanudar el entrenamiento tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tianxiwei/pi05-piper-four-color-step2000
- Modelo base: https://huggingface.co/tianxiwei/pi05-piperx-two-color-step6000
- Dataset: https://huggingface.co/datasets/tianxiwei/piperx-four-color-block-sorting
- OpenPI upstream: https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
