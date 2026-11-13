# storyteller-platform/pocket-tts-italian

## Resumen

Pocket TTS Italian es un modelo de síntesis de voz (text-to-speech) en italiano, derivado de `kyutai/pocket-tts` y entrenado originalmente por Kyutai. Storyteller Platform lo distribuye como espejo en su registro de modelos, empaquetado en formato GGUF mediante audio.cpp y pensado para su instalación a través de la herramienta `ghost-story`. El modelo cuenta con 109.502.146 parámetros (aproximadamente 110 millones) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la categoría de TTS ligero apto para despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en que se trata de un modelo de nicho: una variante idiomática (italiano) de un TTS compacto, publicada bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Al estar distribuido en GGUF, está orientado a inferencia con audio.cpp más que a los stacks habituales de PyTorch/Hugging Face Transformers, lo que condiciona tanto su despliegue como su integración.

La información pública disponible es escasa: la model card es fundamentalmente un aviso de espejo y procedencia, sin detalles sobre arquitectura interna, dataset de entrenamiento ni evaluaciones. Por tanto, varios apartados de esta ficha se marcan explícitamente como no disponibles, y las estimaciones de hardware se basan en el recuento de parámetros y el formato de cuantización publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz, TTS) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (única cuantización publicada en el repo) |
| Idiomas soportados | italiano (por el nombre del modelo y su variante); resto no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`pocket-tts-italian-q8_0.gguf`); el repo indica que el formato `gguf` contiene los ficheros sin cambios |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo en la documentación proporcionada. La model card indica únicamente que el modelo fue entrenado por Kyutai como `kyutai/pocket-tts` y que esta variante corresponde a la versión `2.0.0` de `pocket-tts-italian` en el registro de Storyteller. El recuento de parámetros (109.502.146) es el único dato estructural confirmado, y sugiere un modelo compacto orientado a inferencia de baja latencia.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO. La conversión a GGUF la realizó audio.cpp (`PocketTTS-GGUF/italian` en `audio-cpp/audio.cpp-gguf`, revisión `7bf52723f5a9`), y el repositorio conserva únicamente la cuantización q8_0. Cualquier innovación técnica (decodificación especulativa, atención lineal, vocoder concreto) no está descrita en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano: generación de audio a partir de texto.
- Distribución en GGUF q8_0, lo que permite inferencia con audio.cpp en lugar de stacks PyTorch.
- Integración prevista con el ecosistema Storyteller mediante `ghost-story`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: no disponibles; la variante está etiquetada como italiana.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponibles.

## Casos de uso

- Narración de audiolibros en italiano: el modelo, empaquetado para Storyteller, encaja en el flujo de generación de audio de la plataforma para convertir texto de libros en voz sintética, con la ventaja de un tamaño de 0,3 GB que facilita su distribución junto al software.
- Lectura de artículos y contenido web en italiano: al ser un TTS ligero, puede ejecutarse localmente para leer texto en voz alta sin depender de servicios en la nube, lo que reduce latencia y coste por petición.
- Accesibilidad para usuarios con discapacidad visual: integración en lectores de pantalla o aplicaciones de asistencia que requieran una voz italiana con licencia permisiva para uso comercial.
- Generación de pistas de voz para vídeos y pódcasts: síntesis por lotes de guiones en italiano en pipelines de postproducción, aprovechando la licencia CC-BY-4.0 con atribución.
- Prototipado de asistentes de voz en italiano: al ser un modelo pequeño (110 M de parámetros), permite iterar rápidamente en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.
- Distribución empaquetada en aplicaciones de escritorio: el formato GGUF y el tamaño reducido permiten incluirlo como dependencia local en aplicaciones de lectura o accesibilidad sin requerir GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 109,5 M de parámetros en q8_0, el peso de los ficheros ronda los 110 MB, por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria (el repositorio completo ocupa 0,3 GB).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no se documentan requisitos mínimos oficiales.
- GPU de consumo: cabe en prácticamente cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3060 o superiores) e incluso es viable en CPU.
- Opciones de despliegue: audio.cpp (formato nativo del repo); el soporte en llama.cpp, Ollama, vLLM o TGI no está documentado y, al tratarse de un modelo TTS y no de un LLM, no es esperable sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pocket TTS Italian (este) | 109.502.146 | no disponible | CC-BY-4.0 | GGUF q8_0 | Variante italiana de `kyutai/pocket-tts`, distribuida por Storyteller |
| kyutai/pocket-tts | no disponible | no disponible | CC-BY-4.0 | no disponible | Modelo base original de Kyutai |
| Otras variantes idiomáticas de Pocket TTS en Storyteller | no disponible | no disponible | CC-BY-4.0 | GGUF | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas TTS de otros desarrolladores (por ejemplo, modelos de la familia VITS, XTTS o Piper) en términos de parámetros, contexto o rendimiento, por lo que esos datos se marcan como no disponibles.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un TTS entrenado por Kyutai, puede heredar sesgos acústicos y de pronunciación del dataset original, no descrito.
- Riesgo de alucinación no aplicable en el sentido de un LLM, pero sí existe riesgo de pronunciación incorrecta o artefactos en texto fuera de dominio; no hay evaluaciones publicadas.
- Limitación idiomática: la variante está orientada al italiano; el comportamiento con otros idiomas no está documentado.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Kyutai y a Storyteller; es necesario conservar los avisos de licencia y procedencia.
- El repositorio solo mantiene la cuantización q8_0; no hay alternativas de menor precisión publicadas en este repo.
- Dependencia de audio.cpp: el despliegue fuera de ese stack no está documentado y puede requerir conversión adicional.
- Es un espejo de la versión `2.0.0`; cambios en el modelo original podrían no reflejarse automáticamente en este repositorio.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validación comunitaria pública.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/pocket-tts-italian
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio de conversión GGUF: https://huggingface.co/audio-cpp/audio.cpp-gguf (revisión `7bf52723f5a9`)
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/pocket-tts-italian
