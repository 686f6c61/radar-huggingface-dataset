# Virtudant-AI/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, distribuido en Hugging Face a través del repositorio de Virtudant-AI con cuantizaciones GGUFs generadas por Unsloth. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25.200 millones de parámetros totales y 3.800 millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Procesa entradas de texto, imagen y vídeo (audio solo en las variantes E2B y E4B), y genera salida textual.

El modelo forma parte de la familia Gemma 4, que incluye variantes densas (E2B, E4B, 31B) y esta variante MoE. Incorpora una ventana de contexto de hasta 256K tokens, soporte nativo para más de 140 idiomas, modos de razonamiento configurables (thinking modes), soporte nativo del rol `system` y capacidades de function calling orientadas a flujos agénticos. Su arquitectura de atención híbrida combina atención local con ventana deslizante y atención global, con Keys y Values unificadas en las capas globales y Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos.

La relevancia actual del modelo radica en que ofrece rendimiento de nivel frontera en un tamaño desplegable en GPUs de consumo y estaciones de trabajo, con licencia permisiva para uso comercial y un ecosistema de herramientas (Unsloth, llama.cpp, vLLM) que facilita su ajuste fino y despliegue en producción. Este repositorio concreto de Virtudant-AI no incluye información adicional sobre el proceso de cuantización ni sobre ajustes específicos respecto al modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (sliding window local + global) |
| Parametros totales | 25,2B |
| Parametros activos | 3,8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); otras cuantizaciones no disponibles en la informacion proporcionada |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención híbrida que intercala capas de atención local con ventana deslizante y capas de atención global, garantizando que la capa final sea siempre global. Las capas globales emplean Keys y Values unificadas y Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. El modelo cuenta con 25,2B parámetros totales de los cuales solo 3,8B se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El vocabulario es de 262K tokens (dato de la familia Gemma 4; no se confirma específicamente para esta variante en la información disponible).

El modelo base es `google/gemma-4-26B-A4B-it`, la variante instruction-tuned de Google DeepMind. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá de las descritas para la familia (atención híbrida, p-RoPE, thinking modes configurables, soporte nativo de `system` y function calling). El repositorio de Virtudant-AI se limita a redistribuir cuantizaciones GGUFs generadas con Unsloth Dynamic 2.0, sin documentar ajustes adicionales sobre el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con soporte nativo del rol `system`.
- Razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de vídeo (según la documentación de la familia Gemma 4).
- Generación y razonamiento de código, con mejoras declaradas en benchmarks de coding.
- Capacidades matemáticas y de razonamiento multi-paso.
- Function calling / tool calling nativo, orientado a flujos agénticos.
- Soporte multilingüe en más de 140 idiomas.
- Ejecución local eficiente gracias a la arquitectura MoE con 3,8B parámetros activos.
- Audio: no soportado en esta variante (solo en E2B y E4B según la documentación de la familia).

## Casos de uso

- Asistentes conversacionales de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) manteniendo coherencia en hilos extensos y usando el rol `system` para definir políticas de respuesta.
- Generación de código en producción: con function calling nativo, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código, y conectarse a herramientas externas (linters, APIs de repositorios) mediante tool calling.
- Agentes autónomos multi-paso: su soporte de razonamiento configurable y function calling permite construir agentes que planifican, invocan herramientas y verifican resultados en tareas de automatización.
- Análisis de documentos con imágenes: al procesar texto e imagen con resolución variable, es adecuado para extraer información de facturas, formularios escaneados o capturas de pantalla en flujos de digitalización.
- Procesamiento de vídeo para moderación o descripción: la comprensión de vídeo permite generar descripciones, resúmenes o etiquetas de contenido audiovisual en pipelines de catalogación.
- Asistencia multilingüe: con más de 140 idiomas, sirve para traducción, resumen o atención en idiomas minoritarios sin necesidad de modelos específicos por lengua.
- Despliegue en estaciones de trabajo: al activar solo 3,8B parámetros por token, puede ejecutarse en GPUs de consumo con cuantización GGUF para prototipado local y análisis de datos sensibles sin salir del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa, un MoE de 25,2B parámetros totales requiere cargar todos los pesos en memoria; en cuantización de 4 bits se estima del orden de 13-15 GB, aunque esta cifra no está confirmada en la información disponible.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamaño, cabría esperar viabilidad en GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100) con cuantizaciones bajas, pero no se confirma.
- GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: Unsloth Studio y llama.cpp (formato GGUF); vLLM y TGI no confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este) | 25,2B | 3,8B | 256K | Apache 2.0 | Texto, imagen, vídeo |
| Gemma 4 31B Dense | 30,7B | 30,7B (denso) | 256K | Apache 2.0 | Texto, imagen |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 4,5B (denso) | 128K | Apache 2.0 | Texto, imagen, audio |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 2,3B (denso) | 128K | Apache 2.0 | Texto, imagen, audio |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales, pero no se confirma.
- Riesgo de alucinación: no cuantificado en la informacion disponible; los modelos de razonamiento con thinking modes pueden generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto: la ventana es de 256K tokens, pero el rendimiento efectivo en el extremo superior no está documentado en la informacion disponible.
- Idiomas: se declaran más de 140 idiomas, pero no se especifica la calidad relativa por idioma ni si todos tienen el mismo nivel de soporte.
- Licencia: Apache 2.0 permite uso comercial, pero el enlace de licencia apunta a los términos de Gemma 4 de Google (`ai.google.dev/gemma/docs/gemma_4_license`), que conviene revisar por posibles condiciones adicionales de uso aceptable.
- Repositorio de terceros: este repositorio pertenece a Virtudant-AI, no a Google; no se documenta el proceso de cuantización ni posibles diferencias respecto al modelo base. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- Audio: esta variante no soporta entrada de audio, a diferencia de E2B y E4B.
- Sin benchmarks publicados en la información disponible: no es posible validar el rendimiento real frente a alternativas sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Virtudant-AI/gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Colección de cuantizaciones Unsloth Gemma 4: https://huggingface.co/collections/unsloth/gemma-4
- Guía Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Documentación Unsloth Studio: https://unsloth.ai/docs/new/studio
- Benchmarks de cuantización Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
