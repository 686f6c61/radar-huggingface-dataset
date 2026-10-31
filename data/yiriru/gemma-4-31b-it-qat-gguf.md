# Yiriru/gemma-4-31B-it-qat-GGUF

## Resumen

Gemma 4 31B (variante QAT en formato GGUF) es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, perteneciente a la familia Gemma 4. Esta ficha corresponde a la conversión no oficial a GGUF publicada por el usuario Yiriru a partir del checkpoint oficial `google/gemma-4-31B-it-qat-q4_0-unquantized`. Se trata de la variante densa de 31B (30,7 mil millones de parámetros) con entrenamiento consciente de cuantización (QAT), que permite reducir drásticamente los requisitos de memoria manteniendo una calidad cercana a la de los pesos en bfloat16.

El modelo resuelve el problema habitual de la degradación de calidad tras la cuantización post-entrenamiento: al aplicar QAT, Google entrena el modelo ya con la cuantización Q4_0 en mente, de modo que la versión cuantizada conserva casi todo el rendimiento del original. El resultado es un modelo multimodal (texto e imagen de entrada, texto de salida) con ventana de contexto de 256K tokens, soporte para más de 140 idiomas, modos de razonamiento configurables y function calling nativo, desplegable en estaciones de trabajo con GPUs de consumo.

La relevancia de esta versión radica en el formato GGUF, que permite ejecutar el modelo con llama.cpp, Ollama y herramientas del ecosistema local, sin depender de vLLM ni de GPUs de centro de datos. La conversión de Yiriru reporta un 99,82 % de coincidencia de pesos en BF16 respecto al checkpoint de referencia, lo que indica una reproducción fiel del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window + atención global), multimodal (image-text-to-text) |
| Parametros totales | 30,7B (variante 31B Dense); el dato de safetensors del repo (469,5M) corresponde a un shard parcial, no al modelo completo |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | QAT Q4_0 (este GGUF); la familia QAT oficial incluye también wNa8o8 (móvil) y w4a16 (compressed-tensors para vLLM) |
| Idiomas soportados | Más de 140 idiomas (según la familia Gemma 4) |
| Licencia | Apache 2.0 (con Gemma Terms of Use referenciada por el autor) |
| Formato de pesos | GGUF (Q4_0); el modelo base original está en safetensors BF16 |

## Arquitectura y entrenamiento

Gemma 4 31B emplea una arquitectura transformer densa de 60 capas con un mecanismo de atención híbrido que intercala capas de atención local por ventana deslizante (1024 tokens) con capas de atención global completa, garantizando que la última capa sea siempre global. Este diseño combina la velocidad y el bajo consumo de memoria de un modelo ligero con la conciencia de contexto largo necesaria para tareas complejas. Para optimizar la memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE).

La variante QAT (Quantization-Aware Training) se entrena simulando la cuantización Q4_0 durante el propio proceso de entrenamiento, de modo que el modelo cuantizado mantiene una calidad similar a la de los pesos en bfloat16. Los checkpoints QAT oficiales se publican en cuatro formatos: sin cuantizar (Q4_0 en BF16), GGUF Q4_0, optimizado para móvil (wNa8o8, con capas de decodificación a 2 bits y cachés KV optimizadas) y compressed-tensors w4a16 para vLLM. No se han detallado en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni el uso de RLHF/DPO. Como novedades de la familia, el modelo soporta nativamente el rol `system` en las conversaciones y es compatible con decodificación especulativa mediante modelos asistente, siempre que el draft model sea también un checkpoint QAT con la misma precisión.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system`, lo que permite conversaciones más estructuradas y controlables.
- Razonamiento con modos de thinking configurables, diseñado como razonador de alto nivel en toda la familia Gemma 4.
- Comprensión multimodal: acepta texto e imagen como entrada (con soporte de relación de aspecto y resolución variables), y vídeo; la familia soporta audio de forma nativa en E2B, E4B y 12B (no confirmado para 31B).
- Generación de código con mejoras destacables en benchmarks de programación respecto a generaciones anteriores.
- Function calling nativo, orientado a flujos agénticos y agentes autónomos multi-paso.
- Ventana de contexto de 256K tokens para procesar documentos largos, repositorios completos o conversaciones extensas.
- Soporte multilingüe en más de 140 idiomas.
- Compatibilidad con decodificación especulativa mediante un modelo asistente QAT de la misma precisión.

## Casos de uso

- Chatbots y asistentes conversacionales locales: el soporte nativo del rol `system` y la ventana de 256K tokens permiten gestionar conversaciones multi-turno extensas manteniendo el contexto completo, ejecutándose en hardware de estación de trabajo sin coste de API.
- Análisis de documentos largos: con 256K tokens de contexto se pueden procesar contratos, informes técnicos o libros enteros en una sola pasada, aprovechando la atención híbrida para mantener rendimiento y consumo de memoria razonables.
- Comprensión de imágenes y vídeo: como modelo image-text-to-text, sirve para describir imágenes, extraer información de capturas de pantalla, analizar documentos escaneados o responder preguntas sobre contenido visual con resolución y relación de aspecto variables.
- Agentes autónomos y automatización: el function calling nativo permite integrarlo en frameworks agénticos (LangChain, llamadas a herramientas, orquestación multi-paso) para tareas como automatización de flujos, navegación web asistida o ejecución de pipelines.
- Desarrollo de código asistido: las mejoras en benchmarks de programación lo hacen adecuado para completación, revisión y refactorización de código, pudiendo analizar repositorios completos gracias al contexto extendido.
- Razonamiento estructurado: los modos de thinking configurables permiten activar razonamiento extendido en tareas de matemáticas, lógica o planificación, ajustando el gasto de cómputo según la dificultad del problema.
- Despliegue en ecosistema local con GGUF: al estar en formato GGUF Q4_0, puede ejecutarse con llama.cpp, Ollama o LM Studio en GPUs de consumo, ideal para prototipado, privacidad de datos y entornos sin acceso a nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la variante QAT "preserva una calidad similar a bfloat16" y que la familia logra "mejoras notables en benchmarks de código", pero no incluye cifras concretas. La conversión de Yiriru reporta métricas de fidelidad de la conversión: 99,82 % de coincidencia de pesos en BF16 (30.639.720.003/30.696.013.824), 97,14 % de bloques perfectos, RMSE de 1,69e-05 y error absoluto máximo de 0,00122070312.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_0, un modelo de ~30,7B de parámetros requiere aproximadamente 17-20 GB solo de pesos; con contexto largo y cachés KV, se recomienda disponer de 24 GB o más. No hay cifras oficiales publicadas para esta conversión concreta.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para la variante Q4_0 con contexto moderado; A100 o H100 (40/80 GB) para contextos cercanos a 256K tokens o inferencia a alto throughput.
- Cabe en GPUs de consumo: sí, en tarjetas de 24 GB como la RTX 4090 o RTX 3090 con cuantización Q4_0; también es viable la descarga en capas (offload a CPU/RAM) en equipos con 32-64 GB de RAM y GPUs de 12-16 GB, a costa de latencia.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa gracias al formato GGUF; LM Studio para uso de escritorio; para el checkpoint oficial en formato compressed-tensors w4a16, vLLM ofrece inferencia optimizada; TGI no está confirmado para GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo denso de 30,7B con cuantización Q4_0, se espera un throughput moderado en GPUs de consumo, mejorado potencialmente con decodificación especulativa usando un draft model QAT compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Gemma 4 31B (QAT Q4_0) | 30,7B | Densa, atención híbrida | 256K | Texto, imagen, vídeo | Apache 2.0 |
| Gemma 4 26B A4B | 26B (MoE) | MoE | 256K | Texto, imagen, vídeo | Apache 2.0 |
| Gemma 4 12B | 11,95B | Densa | 256K | Texto, imagen, vídeo, audio | Apache 2.0 |
| Gemma 4 E4B | 4,5B efectivos | Densa (eficiente) | 128K | Texto, imagen, vídeo, audio | Apache 2.0 |

Dentro de la propia familia, la variante 26B A4B (MoE) ofrece inferencia más rápida por token al activar solo ~4B de parámetros, mientras que la 31B densa puede ofrecer mayor calidad por token. La 12B es una alternativa para hardware más modesto, con la ventaja añadida de soporte nativo de audio. No se han publicado benchmarks comparativos en la información disponible, por lo que no es posible cuantificar las diferencias de rendimiento.

## Limitaciones y advertencias

- La conversión GGUF de Yiriru no es oficial de Google: aunque reporta un 99,82 % de coincidencia de pesos, es una reproducción hecha con Codex CLI siguiendo la guía de Unsloth, por lo que pueden existir desviaciones sutiles respecto al checkpoint oficial.
- El pipeline es image-text-to-text: el soporte de audio nativo está confirmado solo para E2B, E4B y 12B, no para la variante 31B.
- Para decodificación especulativa, el draft model debe ser también un checkpoint QAT con la misma precisión; mezclar checkpoints QAT y no QAT no es compatible.
- No se han publicado benchmarks numéricos de calidad para esta variante, por lo que la evaluación en casos de uso concretos depende del usuario.
- Aunque la etiqueta de licencia es Apache 2.0, el autor enlaza la Gemma Terms of Use de Google, que impone condiciones de uso propias de la familia Gemma; conviene revisar ambos documentos antes de un despliegue comercial.
- Al tratarse de un modelo de 30,7B, el consumo de memoria con contextos muy largos (hasta 256K) puede ser elevado incluso con cuantización Q4_0, debido al tamaño de las cachés KV.
- Como todo LLM, puede alucinar contenido incorrecto y heredar sesgos de sus datos de entrenamiento; no se han documentado sesgos específicos en la información disponible.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/Yiriru/gemma-4-31B-it-qat-GGUF
- Modelo base oficial: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento QAT Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Guía de referencia de la conversión (Unsloth): https://unsloth.ai/docs/models/gemma-4/qat
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos de Google DeepMind: https://deepmind.google/models/gemma/
