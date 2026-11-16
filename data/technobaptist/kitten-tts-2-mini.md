# TechnoBaptist/kitten-tts-2-mini

## Resumen

Kitten TTS 2 Mini es un modelo de síntesis de voz (text-to-speech) desarrollado por TechnoBaptist, publicado bajo licencia Apache 2.0. Con 82 millones de parámetros, está diseñado para inferencia ligera: los pesos cuantizados a int8 en formato ONNX ocupan tan solo 82,7 MB y se ejecutan en CPU sin necesidad de PyTorch ni GPU. Genera audio a 24 kHz y ofrece 118 voces repartidas en 16 idiomas.

El modelo resuelve el problema de la síntesis de voz en entornos con recursos limitados: aplicaciones de escritorio, dispositivos embebidos, servicios serverless o pipelines donde el coste por inferencia y el tamaño del artefacto son críticos. Frente a alternativas de mayor tamaño, sacrifica expresividad y naturalidad a cambio de un despliegue trivial y un consumo mínimo.

Es relevante ahora porque la demanda de TTS local y privado ha crecido con la regulación de datos y la necesidad de latencia baja sin depender de APIs externas. Kitten TTS 2 Mini se posiciona como una opción práctica para prototipado rápido y producción de bajo coste, con soporte multilingüe amplio (incluido español) y una librería de inferencia propia (`kittenml`) que abstrae el backend ONNX o PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; detalles de la arquitectura no publicados) |
| Parámetros totales | 82 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (ONNX, 82,7 MB) y float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt, ru, hi, da, fi, fr, ja, ko, nl, sv, sw, tr (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8) y safetensors/PyTorch (float32); voces en ficheros `voices_<lang>.npz` |
| Frecuencia de muestreo | 24 kHz |
| Voces | 118 en total |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de red, mecanismo de atención, decodificador vocacional ni composición del dataset de entrenamiento) en la información disponible. La model card únicamente indica el número de parámetros (82 M), la frecuencia de salida (24 kHz) y la existencia de dos backends: un grafo ONNX con pesos int8 para CPU y pesos float32 en PyTorch para GPU.

La innovación técnica destacable es el empaquetado: el modelo distribuye las voces como ficheros `.npz` independientes por idioma (`voices_<lang>.npz`), lo que permite descargar solo las voces necesarias. Además, las voces inglesas (Eleanor, Martha, Serena, etc.) pueden hablar también alemán, español, italiano, portugués y ruso bajo el mismo nombre, seleccionando el idioma mediante el parámetro `language=`. No se dispone de información sobre si hubo RLHF, DPO ni sobre el volumen de datos de entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto en 16 idiomas: inglés, alemán, español, italiano, portugués, ruso, hindi, danés, finés, francés, japonés, coreano, neerlandés, sueco, suajili y turco.
- 118 voces con nombres y descripciones de personaje (por ejemplo, "Somber historian", "Energetic sports announcer", "Gentle yoga instructor").
- Control de velocidad de habla mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Selección de voz por nombre (insensible a mayúsculas) o por descripción.
- Selección de idioma explícita mediante `language=`, con fallback a la primera voz del idioma.
- Inferencia en CPU sin PyTorch (backend ONNX int8) o en GPU con PyTorch float32.
- Salida de audio a 24 kHz compatible con `soundfile`.
- No se documentan capacidades de clonación de voz, control de emociones, SSML ni tool calling.

## Casos de uso

- **Lectura de artículos y accesibilidad**: el modelo puede convertir texto a voz en tiempo real en el navegador o en aplicaciones de escritorio gracias a su tamaño de 82,7 MB en int8 y su ejecución en CPU, sin necesidad de GPU ni conexión a la nube. Adecuado para lectores de pantalla y aplicaciones de accesibilidad de bajo coste.
- **Asistentes de voz embebidos**: en dispositivos con recursos limitados (Raspberry Pi, routers, electrodomésticos) el backend ONNX int8 permite generar respuestas habladas localmente con privacidad total, sin enviar texto a servidores externos.
- **Generación de audiolibros y pódcasts automatizados**: con 118 voces y control de velocidad, se pueden producir narraciones multi-idioma por lotes. La variedad de voces permite asignar personajes distintos en una misma producción.
- **Avisos y notificaciones en aplicaciones móviles**: integración en apps Android/iOS mediante ONNX Runtime para leer notificaciones, mensajes o alertas de forma local, reduciendo la latencia y el consumo de batería frente a APIs en la nube.
- **Localización de contenido multimedia**: el soporte de 16 idiomas y la reutilización de voces inglesas para alemán, español, italiano, portugués y ruso facilita doblar vídeos o tutoriales a varios idiomas con un único modelo.
- **Prototipado de interfaces conversacionales**: los desarrolladores pueden validar flujos de voz en español (voces Lucia, Carmen, Javier, Diego) antes de invertir en modelos TTS de mayor calidad, gracias a la instalación de una sola dependencia (`pip install kittenml`).
- **Sistemas de megafonía y anuncios en comercios**: generación de anuncios pregrabados en varios idiomas con voces claras y velocidad ajustable, desplegable en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica para el backend ONNX int8 (ejecución en CPU). Para el backend PyTorch float32, el modelo de 82 M de parámetros ocupa aproximadamente 330 MB en memoria, por lo que cabe holgadamente en cualquier GPU con 1 GB o más de VRAM.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) para el backend `torch` con `device="cuda"`. El backend ONNX no requiere GPU.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en iGPU; el modo recomendado es CPU con ONNX int8.
- **Opciones de despliegue**: librería `kittenml` (backend ONNX Runtime por defecto, o PyTorch), ONNX Runtime directamente, y exportación a otros runtimes compatibles con ONNX.
- **Latencia y throughput**: no disponibles en la información proporcionada. El tamaño reducido (82,7 MB int8) sugiere latencias bajas en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Formato | Contexto |
|---|---|---|---|---|---|---|
| Kitten TTS 2 Mini | 82 M | 16 | 118 | Apache 2.0 | ONNX int8, PyTorch float32 | no disponible |
| Piper TTS | no disponible | múltiple (voces por idioma) | múltiple | MIT | ONNX | no disponible |
| Coqui TTS (XTTS) | no disponible | 17 | clonación de voz | MPL 2.0 / CPML | PyTorch | no disponible |
| Kokoro TTS | 82 M | múltiple | múltiple | Apache 2.0 | ONNX, PyTorch | no disponible |

La comparativa se basa en características públicas de modelos de la misma categoría (TTS ligero); no se dispone de datos de rendimiento comparativo ni de benchmarks en la información proporcionada. Kitten TTS 2 Mini comparte el tamaño de 82 M con Kokoro y el enfoque ONNX int8 con Piper, diferenciándose por su catálogo de 118 voces con descripciones de personaje y su soporte de 16 idiomas en un único artefacto.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos de género, acento o etnia en las voces; las descripciones de personaje (por ejemplo, "Stern military officer") pueden reforzar estereotipos.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí de pronunciación incorrecta de nombres propios, siglas y palabras fuera del vocabulario entrenado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No se documentan límites de longitud de texto por inferencia; textos largos pueden requerir fragmentación manual.
- Las voces inglesas que hablan otros idiomas (alemán, español, italiano, portugués, ruso) pueden presentar acento o prosodia no nativa; se recomienda usar las voces nativas de cada idioma para producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar riesgos de memorización o contaminación.
- El backend ONNX int8 puede degradar la calidad del audio frente al float32; conviene comparar ambos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TechnoBaptist/kitten-tts-2-mini
- Modelo base referenciado en la model card: https://huggingface.co/KittenML/kitten-tts-2-mini
- Librería de inferencia: `pip install kittenml` (no se proporciona URL del repositorio en la información disponible)
