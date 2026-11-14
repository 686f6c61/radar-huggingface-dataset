# storyteller-platform/pocket-tts-german

## Resumen

Pocket TTS German es un modelo de síntesis de voz (text-to-speech) en alemán derivado de `kyutai/pocket-tts`, desarrollado originalmente por Kyutai y redistribuido por storyteller-platform para su uso dentro de la plataforma Storyteller. El repositorio no contiene pesos en formato original, sino una conversión a GGUF realizada por audio.cpp, lo que lo hace directamente consumible por runtimes compatibles con llama.cpp/audio.cpp sin necesidad de conversión adicional.

El modelo cuenta con 109.502.146 parámetros (aproximadamente 110 millones), un tamaño propio de un modelo TTS ligero orientado a inferencia en CPU o GPU de gama baja. El repositorio ocupa 0,3 GB y solo conserva la cuantización `q8_0` en formato GGUF, lo que reduce el espacio en disco y simplifica el despliegue en entornos con recursos limitados.

Su relevancia radica en dos factores: por un lado, cubre la síntesis de voz en alemán dentro del ecosistema Storyteller, orientado a la narración de contenido editorial; por otro, al estar publicado bajo licencia CC-BY-4.0 y en formato GGUF, permite integraciones comerciales con atribución y despliegues locales sin dependencia de APIs en la nube. La información pública disponible sobre arquitectura interna, datos de entrenamiento y evaluación es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos convertidos a GGUF) |
| Parámetros totales | 109.502.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0 (única cuantización GGUF conservada en el repo) |
| Idiomas soportados | alemán (por nombre y propósito del modelo; no se detalla lista oficial) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`pocket-tts-german-q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de síntesis de voz entrenado por Kyutai bajo el identificador `kyutai/pocket-tts`, del cual esta versión es una especialización en alemán. El recuento de parámetros (≈110 M) es coherente con un modelo TTS compacto, pero no se especifican detalles sobre el tipo de decoder, el vocoder, el tokenizador de audio ni la representación acústica empleada.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del corpus alemán, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o preferencias. La única información técnica verificable es el proceso de conversión: los pesos fueron transformados a GGUF por audio.cpp (`audio-cpp/audio.cpp-gguf`, revisión `7bf52723f5a9`) y publicados por storyteller-platform como espejo de la versión `2.0.0` del registro de modelos de Storyteller, con una carpeta por formato.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán a partir de texto de entrada.
- Generación de audio narrado orientado a la lectura de contenido editorial (caso de uso principal de Storyteller).
- Inferencia local mediante runtimes compatibles con GGUF (audio.cpp y derivados).
- Ejecución en entornos con recursos limitados gracias al tamaño reducido del modelo (≈110 M de parámetros) y a la cuantización q8_0.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Narración de artículos y libros en alemán: el modelo convierte texto editorial en audio para funciones de lectura en voz alta dentro de la plataforma Storyteller, aprovechando su especialización en alemán.
- Accesibilidad web: integración en sitios y aplicaciones para ofrecer lectura por voz de contenido en alemán a usuarios con discapacidad visual, con inferencia local que evita enviar texto a servicios externos.
- Generación de audiolibros y pódcasts automatizados: síntesis por lotes de capítulos o guiones en alemán, con la ventaja de que el modelo cabe en 0,3 GB y puede ejecutarse en servidores modestos.
- Asistentes de voz embebidos: despliegue en dispositivos de gama baja o en el borde (edge) gracias al reducido número de parámetros y a la compatibilidad con runtimes GGUF ligeros.
- Preproducción de doblaje y prototipado: generación rápida de pistas de voz en alemán para maquetas de vídeo o validación de guiones antes de contratar voces humanas.
- Sistemas de información pública: anuncios, avisos y locuciones en alemán para transporte, comercio o administración, ejecutados en local para cumplir requisitos de privacidad.
- Investigación en TTS: base ligera y de licencia permisiva para experimentar con ajuste fino, cuantización o comparación de vocoders en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en q8_0 (el archivo de pesos ocupa una fracción de los 0,3 GB del repo); no se dispone de cifras oficiales de memoria en tiempo de ejecución.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) dispone de VRAM de sobra; el modelo también puede ejecutarse en CPU.
- GPU consumer: sí, cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: audio.cpp y runtimes compatibles con GGUF; no se documenta soporte para vLLM, TGI, Ollama o llama.cpp estándar (este último no está orientado a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pocket-tts-german (este modelo) | ≈110 M | no disponible | CC-BY-4.0 | GGUF (q8_0) | TTS en alemán, derivado de kyutai/pocket-tts |
| kyutai/pocket-tts | no disponible | no disponible | CC-BY-4.0 | no disponible | Modelo original de Kyutai del que deriva esta versión |
| Alternativas TTS open source en alemán | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos TTS de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, datos de entrenamiento, evaluación ni limitaciones declaradas por el autor.
- Idioma restringido: el modelo está orientado al alemán; su comportamiento en otros idiomas no está garantizado ni documentado.
- Sin benchmarks: no hay métricas objetivas de calidad (MOS, WER, inteligibilidad) que permitan validar el rendimiento antes de producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Una sola cuantización disponible (q8_0): no se ofrecen alternativas de menor precisión para entornos aún más restringidos.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoría; es obligatorio conservar la atribución a Kyutai y a los conversores.
- Riesgo de artefactos acústicos y pronunciación incorrecta en textos con nombres propios, siglas o dominios especializados, habitual en modelos TTS pequeños; requiere validación con corpus propio.
- Dependencia del runtime audio.cpp: la integración en producción exige verificar compatibilidad de versión y soporte del formato GGUF concreto.
- No se documentan mecanismos de clonación de voz ni control de prosodia; no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/pocket-tts-german
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de conversión GGUF: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/pocket-tts-german
