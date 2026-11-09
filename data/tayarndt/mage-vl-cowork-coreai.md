# tayarndt/Mage-VL-Cowork-CoreAI

## Resumen

Mage-VL-Cowork-CoreAI es una conversión experimental del modelo visión-lenguaje Mage-VL-Cowork de Microsoft al framework Core AI de Apple para silicio de Apple. El modelo original está diseñado para "computer use": recibe imágenes de pantalla junto con instrucciones y propone acciones sobre la interfaz. Este repositorio, publicado por Taylor Arndt, no entrena un modelo nuevo, sino que empaqueta los pesos convertidos, el tokenizer, los ficheros de procesador y un runner en Swift junto con un script de smoke test en Python.

El paquete está pensado para desarrolladores e investigadores que quieran inspeccionar los assets convertidos, ejecutar la prueba incluida o construir sobre la conversión. No es un checkpoint compatible con Transformers ni un agente de escritorio validado: el propio autor lo describe como un lanzamiento experimental que no controla el ordenador del usuario y que no ofrece un comando listo para usar que convierta una captura de pantalla arbitraria en acciones.

La relevancia es acotada pero clara: explora la viabilidad de ejecutar un VLM de computer use sobre el stack nativo de Apple (Core AI, distinto de Core ML), un terreno con pocos artefactos públicos. El estado actual es parcial: el smoke test pasa y algunos casos muestran propuestas de acción coincidentes, pero otros presentan diferencias numéricas, acciones distintas o fallos de objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: microsoft/Mage-VL-Cowork, visión-lenguaje) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Conversión en precisión mixta (candidato reciente); conversión BF16 original con fallos no resueltos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Assets de Core AI (no safetensors, no GGUF); paquete de modelo con tokenizer y processor |
| Tamaño del repositorio | 10,2 GB |
| Pipeline | image-text-to-text |
| Framework de destino | Apple Core AI (no Core ML) |
| Modelo base | microsoft/Mage-VL-Cowork |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, composición del dataset, número de tokens de entrenamiento, uso de RLHF o DPO). El modelo original fue entrenado por Microsoft como VLM para computer use, con entrada de imágenes de pantalla e instrucciones y salida de acciones propuestas.

El trabajo de este repositorio es una conversión, no un entrenamiento: se transforman los pesos del modelo original a assets ejecutables por Core AI en silicio de Apple. La conversión incluye un candidato en precisión mixta más reciente y una conversión BF16 anterior cuyos fallos siguen sin resolverse. La inferencia de visión requiere arrays FP32 preparados (`patches`, `cos`, `sin`) a través del punto de entrada `main` del asset de visión; el preprocesado completo de imagen y la construcción del prompt requieren trabajo de integración adicional.

## Capacidades

- Generación de acciones de computer use a partir de imágenes de pantalla e instrucciones (propósito del modelo base).
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text).
- Ejecución de un smoke test empaquetado que carga el decoder y reproduce los dos primeros tokens de salida guardados sobre una entrada sintética preparada.
- Runner en Swift (`Greedy.swift`) compilado con `xcrun swiftc` para ejecutar inferencia greedy sobre carpetas de ejecución preparadas.
- Replay de características de visión a partir de arrays FP32 preparados.
- No soporta, en esta versión, un comando que tome una captura de pantalla arbitraria y devuelva acciones.

## Casos de uso

- Inspección de assets convertidos: desarrolladores que quieran examinar cómo se representan los pesos de un VLM en el formato de Core AI pueden descargar el paquete y revisar su estructura y ficheros de tokenizer y processor.
- Validación de la cadena de conversión: el smoke test permite comprobar que el decoder empaquetado carga y reproduce sus dos primeros tokens guardados, útil como verificación mínima de integridad tras una conversión.
- Investigación sobre despliegue de VLM en Apple silicon: sirve como punto de partida para estudiar latencia, memoria y fidelidad numérica de un VLM de computer use sobre Core AI.
- Desarrollo de runners nativos: el runner Swift y el script Python de orquestación con guardas de tiempo, memoria y disco pueden reutilizarse como base para pipelines de inferencia en macOS.
- Replicación de diagnósticos: los casos de ScreenSpot-v2 documentados (row018, row005) permiten reproducir comparaciones de tokens y acciones frente al modelo de referencia.
- Integración futura de preprocesado de imagen: el paquete define el punto de entrada de visión, lo que sirve de base para quien quiera implementar el preprocesado completo de capturas y la construcción de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos del autor son diagnósticos offline seleccionados, no puntuaciones de benchmark, y ninguna acción propuesta fue ejecutada durante las pruebas.

| Prueba | Resultado |
|---|---|
| Suite CPU greedy teacher-forced (12 casos, 2.973 decisiones) | 5/12 casos pasan comprobaciones numéricas |
| Posiciones numéricas fallidas | 9 en 7 casos |
| Desacuerdos en el token de mayor puntuación | 32 |
| Casos con listas de acciones totalmente coincidentes | 2/12 |
| PSNR mínimo | 33,8336 dB (Calculator; umbral de 40 dB) |
| ScreenSpot-v2 row018 (visión nativa, Swift) | Alcanza EOS, acciones coincidentes, coordenadas en objetivo; divergencia de tokens en la decisión 111 |
| ScreenSpot-v2 row005 (replay de features) | Alcanza EOS con tokens y acciones idénticos; fallo numérico en la decisión 192 (31,5773 dB; umbral 40 dB); ambos modelos fallan el objetivo |

## Requisitos de hardware

- Mac con silicio de Apple, runtime de Core AI y herramientas de línea de comandos de Xcode; la compatibilidad con otras configuraciones no está establecida.
- El entorno de prueba registrado disponía de 128 GiB de memoria.
- El script exige 25 GiB de memoria disponible y 35 GiB de disco libre al arrancar; se detiene por debajo de 20 GiB de memoria o 25 GiB de disco, y limita el árbol de procesos a 32 GiB de RSS.
- Compilación con timeout de 300 segundos; ejecución con límite de 600 segundos.
- Dependencia Python: `psutil`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI; el paquete es específico de Core AI y no es un checkpoint compatible con Transformers.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de computer use convertidos a Core AI ni datos de rendimiento del modelo base que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Lanzamiento experimental: no es un agente de escritorio validado y no controla el ordenador del usuario.
- No existe comando soportado que convierta una captura de pantalla arbitraria en acciones; la inferencia de visión fresca requiere arrays FP32 preparados.
- El smoke test solo confirma que el decoder carga y reproduce dos tokens; no establece calidad general, comprensión de capturas ni éxito en tareas.
- Diferencias numéricas documentadas: PSNR por debajo del umbral de 40 dB en varios casos, desacuerdos de token y acciones divergentes.
- Los fallos de la conversión BF16 original siguen sin resolverse y no deben considerarse corregidos por el candidato en precisión mixta.
- La suite Swift planificada está incompleta; los resultados individuales favorables no constituyen una validación global.
- No se ha probado el éxito de tareas ejecutando acciones reales.
- Idiomas soportados no disponibles; riesgos de sesgo y alucinación del modelo base no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la falta de validación desaconsejan su uso en producción sin evaluación propia.
- Core AI y Core ML son frameworks distintos; los assets no son intercambiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayarndt/Mage-VL-Cowork-CoreAI
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Fichero de comprobaciones del paquete: ./PACKAGE-CHECKS.json (incluido en el repositorio)
