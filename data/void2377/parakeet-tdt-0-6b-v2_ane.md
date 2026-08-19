# Void2377/parakeet-tdt-0.6b-v2_ANE

## Resumen

Este repositorio contiene artefactos precompilados en formato Core ML para el modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v2`, optimizados para ejecutarse en el Neural Engine de Apple (ANE). El autor, Void2377, publica estos paquetes como un espejo público del repositorio `runanywhere/parakeet-tdt-0.6b-v2_ANE`, sin modificar el comportamiento del modelo original. El objetivo es facilitar la integración de transcripción de voz en aplicaciones Apple (iOS, iPadOS, macOS) sin necesidad de tokens de acceso adicionales.

El modelo base, desarrollado por NVIDIA, es un sistema de transcripción de voz a texto en inglés con 600 millones de parámetros, capaz de generar puntuación y marcas de tiempo por palabra. Al estar empaquetado para ANE, permite inferencia local en dispositivos Apple con bajo consumo energético, lo que lo hace relevante para aplicaciones móviles y de escritorio que requieren privacidad y baja latencia. El tamaño del repositorio es de 1.2 GB, correspondiente a los paquetes Core ML compilables en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformer, detalles no especificados) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la duración del audio de entrada) |
| Tipos de cuantizacion | no disponible (artefactos Core ML compilados para ANE) |
| Idiomas soportados | Ingles (modelo base) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (paquetes .mlpackage) |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo ni sobre su proceso de entrenamiento. La informacion disponible indica que se trata de un modelo ASR de NVIDIA con 600 millones de parametros, disenado para transcripcion en ingles. El modelo base `nvidia/parakeet-tdt-0.6b-v2` forma parte de la familia Parakeet de NVIDIA, que utiliza tecnicas de entrenamiento con datos de audio transcrito y optimizacion para alta productividad. Sin embargo, no se especifican los datos de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

Los artefactos Core ML incluidos en este repositorio son portables y se compilan para el dispositivo Apple concreto en la primera carga. No se anade ninguna capacidad nueva ni se altera el comportamiento del modelo original; simplemente se empaqueta para su ejecucion eficiente en el Neural Engine.

## Capacidades

- Transcripcion de voz a texto en ingles con alta precision.
- Generacion de puntuacion automatica en la transcripcion.
- Produccion de marcas de tiempo por palabra (word timestamps).
- Inferencia local en dispositivos Apple mediante el Neural Engine, sin conexion a internet.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto con puntuacion y timestamps, facilitando la generacion de actas o busquedas posteriores. Su ejecucion local en dispositivos Apple garantiza privacidad de datos sensibles.
- Subtitulado automatico de videos: al generar timestamps por palabra, es posible sincronizar subtitulos en aplicaciones de edicion de video o plataformas de streaming.
- Asistentes de voz en aplicaciones iOS/macOS: integrado en apps nativas, permite dictado de texto, comandos por voz o transcripcion en tiempo real sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real de conversaciones o contenido audiovisual mejora la inclusion en entornos educativos o laborales.
- Analisis de llamadas de atencion al cliente: las empresas pueden transcribir grabaciones de soporte para extraer metricas de calidad, detectar problemas recurrentes o entrenar modelos de lenguaje.
- Herramientas de busqueda por voz: al convertir audio en texto indexable, se pueden crear sistemas de busqueda dentro de archivos de audio o podcasts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparativas con otros modelos y la model card del autor no reporta metricas de rendimiento. Se recomienda consultar la documentacion oficial de NVIDIA para obtener datos de evaluacion del modelo base.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine: iPhone (A11 o posterior), iPad (A11 o posterior), Mac con chip M1 o superior.
- El modelo se compila para el dispositivo especifico en la primera carga, por lo que no se requiere VRAM adicional.
- El tamano del repositorio es de 1.2 GB, que se descarga e instala en el dispositivo.
- Para despliegue, se puede integrar mediante Core ML en aplicaciones Xcode, o mediante frameworks como `coremltools` para conversion adicional.
- La latencia depende del hardware; en dispositivos con ANE se espera una transcripcion en tiempo real o cercana a ella, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Como referencia, el modelo base compite con otros sistemas ASR como Whisper de OpenAI o los modelos de Google Speech-to-Text, pero este repositorio se centra exclusivamente en la version optimizada para Apple Neural Engine. No se pueden establecer comparaciones cuantitativas sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no reconoce otros idiomas. Para multilingue se debe considerar la version v3 de Parakeet, que no esta incluida en este repositorio.
- Al ser un espejo de artefactos Core ML, no se puede modificar el comportamiento del modelo ni ajustar hiperparametros de inferencia.
- La licencia CC-BY-4.0 permite uso comercial, pero se debe atribuir correctamente a NVIDIA como desarrollador del modelo base.
- La ejecucion en ANE puede presentar variaciones segun la generacion del chip; los dispositivos mas antiguos pueden experimentar mayor latencia.
- No se garantiza la precision en acentos, ruido de fondo o vocabulario tecnico especializado; se recomienda evaluar en el dominio de uso.
- El repositorio no incluye documentacion sobre sesgos o alucinaciones; se asume que el modelo base puede tener sesgos derivados de sus datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Void2377/parakeet-tdt-0.6b-v2_ANE
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio de referencia (runanywhere): no disponible directamente, pero se menciona como origen.
- Pagina de despliegue en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- Repositorio de ejemplo en GitHub: https://github.com/jasonhoblin/nvidia-parakeet-tdt-0.6b-v2
