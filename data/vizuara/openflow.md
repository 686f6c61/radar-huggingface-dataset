# Vizuara/OpenFlow

## Resumen

OpenFlow es una aplicación de dictado por voz desarrollada por Vizuara que funciona íntegramente en el dispositivo del usuario, sin enviar audio a servidores externos. El repositorio de Hugging Face `Vizuara/OpenFlow` no contiene pesos de un modelo entrenado por Vizuara, sino los instaladores de escritorio y móvil de la aplicación, alojados en la CDN de Hugging Face para acelerar las descargas a nivel global. La aplicación permite mantener pulsada una tecla, hablar y soltar para que aparezca texto limpio en cualquier aplicación del sistema.

El pipeline real combina dos componentes de terceros: el modelo de reconocimiento de voz NVIDIA Parakeet, distribuido bajo licencia CC-BY-4.0, y un modelo de limpieza y formateo de texto basado en Liquid AI LFM, afinado por Vizuara sobre datos públicos y sintéticos y sujeto a la LFM Open License. Por tanto, no se trata de un modelo fundacional propio ni de un transformer entrenado desde cero por el autor, sino de un producto de inferencia local que empaqueta modelos existentes con una capa de aplicación.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso práctico de IA open source en el borde (on-device); por otro, advierte de que el repositorio no es un checkpoint reutilizable en bibliotecas como `transformers`, `vLLM` o `llama.cpp`, sino un canal de distribución de binarios. Cualquier evaluación técnica del "modelo" debe hacerse sobre Parakeet y sobre el modelo LFM afinado, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la aplicación integra NVIDIA Parakeet para ASR y un modelo basado en Liquid AI LFM para limpieza de texto; no se detalla la arquitectura interna de cada componente en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la aplicación se distribuye como binarios precompilados; se desconoce el formato de pesos empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | other (CC-BY-4.0 para NVIDIA Parakeet; LFM Open License para el modelo de limpieza basado en Liquid AI LFM) |
| Formato de pesos | no disponible (el repositorio contiene instaladores: `.dmg`, `.zip`, `.apk`) |

## Arquitectura y entrenamiento

El repositorio no publica detalles de arquitectura ni de entrenamiento del sistema completo. Según la model card, la aplicación encadena dos etapas: primero un modelo de reconocimiento automático del habla (NVIDIA Parakeet, licencia CC-BY-4.0) que transcribe el audio capturado localmente, y después un modelo de "clean-up" basado en Liquid AI LFM, afinado por Vizuara sobre datos públicos y sintéticos, que reformatea la transcripción en texto limpio (puntuación, mayúsculas, eliminación de muletillas). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO en el ajuste.

La innovación principal no es algorítmica sino de producto: toda la inferencia ocurre en el dispositivo del usuario, de modo que el audio nunca abandona el equipo. La distribución se realiza mediante binarios firmados por plataforma (macOS Apple Silicon, macOS universal, Windows x64, Android), con verificación de integridad mediante `SHA256SUMS.txt`. No hay información sobre el runtime de inferencia (ONNX, Core ML, llama.cpp u otro) ni sobre técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Dictado por voz en cualquier aplicación del sistema operativo: se mantiene una tecla, se habla y al soltar aparece el texto en el campo activo.
- Reconocimiento automático del habla (ASR) local mediante NVIDIA Parakeet.
- Limpieza y formateo del texto transcrito mediante un modelo basado en Liquid AI LFM afinado: se espera puntuación, mayúsculas y eliminación de ruido conversacional, aunque la model card no detalla el alcance exacto.
- Procesamiento totalmente on-device: el audio no se envía a servidores externos.
- Soporte multiplataforma: macOS 14+ en Apple Silicon (M1 a M4), macOS 12-13 e Intel, Windows 10/11 de 64 bits y Android 9+ de 64 bits.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo "thinking".

## Casos de uso

- Dictado en el puesto de trabajo: redacción de correos, notas e informes en cualquier aplicación (editor de texto, cliente de correo, navegador) manteniendo pulsada una tecla, sin cambiar de ventana ni depender de la nube.
- Documentación clínica o legal sensible: al ejecutarse en local, el audio no sale del dispositivo, lo que facilita el cumplimiento de requisitos de privacidad en entornos donde no se permite enviar voz a servicios externos.
- Accesibilidad: personas con movilidad reducida o dificultades para teclear pueden introducir texto por voz en el sistema operativo, incluido Android, con una interacción mínima (mantener y soltar).
- Trabajo en movilidad sin conectividad: al no requerir red para la inferencia, el dictado funciona en portátiles o móviles sin conexión estable.
- Entornos con restricciones de red corporativa: organizaciones que bloquean servicios de transcripción en la nube pueden desplegar la aplicación de escritorio y mantener el procesamiento dentro del perímetro del dispositivo.
- Prototipado rápido de interfaces de voz: desarrolladores que quieran evaluar la experiencia de dictado local (latencia percibida, calidad de la limpieza de texto) antes de integrar Parakeet y un modelo LFM en su propio producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse en el dispositivo, el consumo depende del runtime y de los modelos empaquetados, que no se detallan.
- GPU recomendadas: no disponible. En macOS se aprovecha Apple Silicon (M1 a M4) según los instaladores publicados; en Windows y Android se desconoce si se usa GPU o CPU.
- Compatibilidad con GPU de consumo: la aplicación está pensada para equipos de consumo (Mac Apple Silicon, PC Windows 64 bits, Android 64 bits), pero no se especifican requisitos mínimos de memoria ni de GPU.
- Opciones de despliegue: instaladores nativos (`.dmg` para macOS, `.zip` para Windows, `.apk` para Android). No se ofrece integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / producto | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vizuara/OpenFlow | Aplicación de dictado on-device (Parakeet + LFM afinado) | no disponible | other (CC-BY-4.0 + LFM Open License) | Instaladores en HF y web del autor |
| OpenAI Whisper (open source) | Modelo ASR | 30 s de audio por ventana | MIT | Pesos en HF, múltiples runtimes |
| NVIDIA Parakeet | Modelo ASR | no disponible en esta ficha | CC-BY-4.0 | Pesos en NGC/HF |
| Liquid AI LFM | Modelo de lenguaje | no disponible en esta ficha | LFM Open License | Pesos en HF |

No se dispone de datos de rendimiento comparativo entre OpenFlow y alternativas como Whisper o Parakeet en modo dictado, por lo que la comparación se limita a tipo de producto, licencia y canal de distribución.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo reutilizables: solo instaladores. No puede cargarse con `transformers`, `vLLM`, `llama.cpp` ni herramientas equivalentes.
- La licencia "other" combina CC-BY-4.0 (Parakeet) y LFM Open License (modelo de limpieza); es necesario revisar el archivo NOTICE incluido en cada aplicación antes de un uso comercial o de redistribución.
- No se documentan idiomas soportados, por lo que no puede confirmarse el soporte de castellano ni de otras lenguas.
- No hay información sobre sesgos, tasas de alucinación o errores de transcripción (WER) del sistema.
- La limpieza de texto basada en LFM puede introducir modificaciones no deseadas en la transcripción (reformulación, omisión de palabras); conviene validar en dominios sensibles.
- Al ser una aplicación cerrada distribuida como binario, no es posible auditar el pipeline de inferencia ni sustituir componentes sin ingeniería inversa.
- No se especifican requisitos mínimos de hardware, latencia ni consumo, lo que dificulta planificar despliegues a escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (17 de noviembre de 2026), lo que sugiere un lanzamiento muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vizuara/OpenFlow
- Página de descarga del autor: https://rajatdandekar--openflow.modal.run
- Sitio de Vizuara: https://vizuara.ai
- NVIDIA Parakeet (modelo ASR base, CC-BY-4.0): no disponible en la información proporcionada
- Liquid AI LFM (modelo base del clean-up, LFM Open License): no disponible en la información proporcionada
