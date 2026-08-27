# SwinliQ-AI-2/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) de código abierto, masivamente multilingüe y con capacidad zero-shot, desarrollado por el equipo k2-fsa. Esta versión concreta, alojada por el usuario SwinliQ-AI-2, es un espejo del modelo original y utiliza como base el modelo de lenguaje Qwen/Qwen3-0.6B, sobre el que se construye una arquitectura novedosa de tipo "diffusion language model" que genera audio de alta calidad a partir de texto y una referencia de voz corta. El modelo soporta más de 600 idiomas, lo que lo convierte en uno de los sistemas TTS con mayor cobertura lingüística publicados hasta la fecha.

La relevancia de OmniVoice radica en su capacidad para clonar voces y diseñar voces sintéticas a partir de una muestra breve, sin necesidad de entrenamiento adicional, y en su velocidad de inferencia superior a la de otros sistemas comparables. Está pensado para aplicaciones de doblaje, audiolibros, asistentes de voz y accesibilidad, entre otras. El modelo tiene aproximadamente 612 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 3,3 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 600 (lista de códigos ISO 639-3) |
| Licencia | no disponible (fuentes externas citan Apache 2.0, sin confirmar en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe OmniVoice como un modelo con una "arquitectura novedosa de modelo de lenguaje con difusión" (diffusion language model-style architecture). No se proporcionan detalles técnicos adicionales sobre la integración del proceso de difusión con el backbone de lenguaje, ni sobre la composición exacta de los módulos de codificación de audio y texto. El modelo base declarado es Qwen/Qwen3-0.6B, lo que sugiere que el componente de lenguaje se apoya en ese modelo, pero no se especifica cómo se adapta para la generación de audio.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La información disponible se limita a las capacidades declaradas: zero-shot, clonación de voz y diseño de voz, con soporte para más de 600 idiomas. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con calidad alta y velocidad de inferencia superior a la de otros modelos comparables.
- Clonación de voz zero-shot: genera una voz sintética a partir de una muestra de audio de referencia corta, sin necesidad de fine-tuning.
- Diseño de voz: permite crear voces sintéticas nuevas, no basadas en un hablante existente.
- Soporte multilingüe extremo: más de 600 idiomas, cubriendo una amplia variedad de lenguas y dialectos (códigos ISO 639-3).
- No es un modelo de lenguaje conversacional: no ofrece generación de texto, razonamiento, tool calling ni capacidades de agente. Su función se limita a la síntesis de voz.

## Casos de uso

- Doblaje de vídeo y localización de contenido: OmniVoice puede generar pistas de voz en decenas de idiomas a partir de un guion, manteniendo la voz de un actor o creando voces nuevas. Su cobertura de más de 600 idiomas permite localizar contenido para mercados de bajos recursos lingüísticos.
- Audiolibros multilingües: permite convertir libros electrónicos en audiolibros en múltiples idiomas con una voz consistente, clonada a partir de una muestra del narrador original o diseñada desde cero.
- Asistentes de voz personalizados: se puede integrar en asistentes virtuales o chatbots para dotarlos de una voz única, clonada a partir de una grabación breve del usuario o de un personaje ficticio.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: el modelo puede leer en voz alta cualquier texto en el idioma del usuario, con una voz natural y clara, mejorando la accesibilidad de aplicaciones y sitios web.
- Creación de contenido para redes sociales y marketing: los creadores pueden generar locuciones para vídeos, anuncios o podcasts sin necesidad de un estudio de grabación, usando voces clonadas o diseñadas.
- Sistemas de navegación y avisos en transporte público: la capacidad multilingüe permite generar mensajes de voz en múltiples idiomas para sistemas de información al viajero, con una voz consistente y de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparativas con otros modelos TTS. Tampoco se han encontrado evaluaciones independientes en los resultados de búsqueda web.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware, VRAM, latencia o throughput. Dado que el modelo tiene aproximadamente 612 millones de parámetros, es razonable estimar que en FP16 ocuparía alrededor de 1,2 GB de memoria, y el tamaño del repositorio (3,3 GB) sugiere que los pesos pueden estar en FP32 o incluir múltiples archivos. Sin embargo, al ser un modelo de difusión, la inferencia puede requerir recursos adicionales para el proceso de muestreo. No se han publicado recomendaciones de GPU ni opciones de despliegue específicas (vLLM, llama.cpp, etc.). Se recomienda consultar el repositorio oficial de k2-fsa para obtener instrucciones de uso y requisitos actualizados.

## Comparativa con modelos similares

No se dispone de información comparativa publicada. No se han encontrado tablas de comparación con otros modelos TTS multilingües como XTTS, Bark o VITS en la documentación proporcionada. Por tanto, no es posible ofrecer una comparativa objetiva en este momento.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la model card. Sin embargo, al tratarse de un sistema de clonación de voz, existe un riesgo inherente de uso indebido para suplantación de identidad o generación de contenido fraudulento.
- La calidad de la síntesis puede variar significativamente entre idiomas, especialmente en lenguas de bajos recursos o con pocos datos de entrenamiento, aunque no se ha confirmado este extremo.
- La licencia no está especificada en la model card. Aunque fuentes externas (como el sitio web omnivoice.app) citan Apache 2.0, esta información no está confirmada oficialmente, por lo que se recomienda verificar la licencia antes de un uso comercial.
- Al ser un modelo de difusión, la inferencia puede ser más lenta que en modelos autorregresivos puros, aunque la model card afirma una velocidad superior a la de otros sistemas comparables.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos en las voces generadas (género, acento, edad, etc.).

## Enlaces

- Modelo en Hugging Face (esta versión): https://huggingface.co/SwinliQ-AI-2/OmniVoice
- Modelo original en Hugging Face: https://huggingface.co/k2-fsa/OmniVoice
- Paper en arXiv: https://huggingface.co/papers/2604.00688
- Repositorio en GitHub: https://github.com/k2-fsa/OmniVoice
- Demo en Hugging Face Space: https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demostración: https://zhu-han.github.io/omnivoice
- Notebook de Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
