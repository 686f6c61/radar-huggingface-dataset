# tinyopsec/Orbit-3-Nano-GGUF

## Resumen

Orbit-3-Nano (GGUF) es una colección de cuantizaciones en formato GGUF del modelo `OpenPathAI/Orbit-3-Nano`, un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-2.6B orientado específicamente a instrucciones en idioma indonesio. El repositorio ha sido publicado por el usuario tinyopsec en Hugging Face y ha sido generado con las herramientas de llama.cpp, lo que lo hace directamente compatible con runtimes locales como llama.cpp, Ollama, LM Studio o koboldcpp.

El modelo base, LFM2.5-2.6B de LiquidAI, pertenece a la familia LFM (Liquid Foundation Models), una arquitectura híbrida que combina bloques convolucionales tipo gated linear con atención estándar, diseñada para ofrecer buena eficiencia en dispositivos con recursos limitados. Con aproximadamente 2.700 millones de parámetros, este modelo se sitúa en la categoría de modelos pequeños aptos para ejecución en hardware de consumo.

Su relevancia radica en la escasez relativa de modelos de instrucción compactos y optimizados para indonesio, un idioma con más de 200 millones de hablantes pero con menor cobertura en modelos open source que el inglés o el chino. La disponibilidad de trece niveles de cuantización distintos, desde F16 hasta Q2_K, permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. No se han publicado resultados de benchmarks específicos del ajuste fino en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrida, familia Liquid Foundation Models) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Indonesio (enfoque del ajuste fino); idiomas heredados del modelo base no especificados |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-2.6B, un modelo de aproximadamente 2,7 mil millones de parámetros de la familia LFM de LiquidAI. Esta familia se caracteriza por arquitecturas híbridas que combinan capas convolucionales gated (tipo gated linear conv) con capas de atención estándar de transformer, con el objetivo de reducir el coste computacional en inferencia y mejorar la eficiencia en contexto largo frente a transformers puros de tamaño comparable. Los detalles concretos de la proporción de capas y la longitud de contexto no están disponibles en la información proporcionada.

Sobre esta base se ha realizado un ajuste fino para instrucciones en indonesio, dando lugar a `OpenPathAI/Orbit-3-Nano`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni sobre si se emplearon técnicas de alineación como RLHF o DPO. Las cuantizaciones incluidas en este repositorio se han producido con llama.cpp, cubriendo un rango completo desde precisión media (F16) hasta cuantización extrema de 2 bits (Q2_K), siendo Q4_K_M la recomendada por el autor.

## Capacidades

- Generación de texto conversacional siguiendo instrucciones en indonesio (modelo tipo instruct/chat).
- Compatibilidad con el pipeline de text-generation de Hugging Face y con runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- Ejecución eficiente en hardware de consumo gracias al tamaño reducido (~2,7 B parámetros) y a la amplia gama de cuantizaciones.
- Capacidades heredadas del modelo base LFM2.5-2.6B (razonamiento general, código, matemáticas) no documentadas específicamente para este ajuste fino: no disponible.
- Tool calling / function calling: no disponible (no consta en la información proporcionada).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales en indonesio: el modelo, al ser un instruct tune centrado en indonesio, puede alimentar chatbots locales que respondan preguntas y mantengan conversaciones en este idioma sin depender de APIs externas.
- Atención al cliente automatizada local: desplegado vía Ollama o llama.cpp en servidores modestos, puede gestionar consultas frecuentes de usuarios indonesios manteniendo los datos en la infraestructura propia, algo valioso por privacidad y coste.
- Aplicaciones en dispositivos de borde y móviles: con cuantizaciones Q4 o Q3, el modelo ocupa entre ~1,5 y 2 GB, lo que lo hace viable en portátiles sin GPU dedicada o en mini-PC.
- Prototipado y pruebas de productos para el mercado indonesio: los desarrolladores pueden validar flujos conversacionales en indonesio localmente antes de escalar a modelos mayores.
- Integración en aplicaciones con LM Studio o koboldcpp: útil para escritorios de usuario final que necesiten generación de texto offline en indonesio.
- Investigación sobre adaptación lingüística: sirve como caso de estudio de cómo un ajuste fino ligero sobre un modelo híbrido compacto adapta un modelo base a un idioma de recursos medios.
- Generación y resumen de contenido en indonesio: redacción de borradores, resúmenes de textos o clasificación ligera de contenido en ese idioma, aprovechando la inferencia local y barata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (tamaños aproximados según cuantización para ~2,7 B parámetros):
  - F16: ~5,2 GB (tamaño de archivo indicado en el repo)
  - Q8_0: ~2,9 GB
  - Q6_K: ~2,2 GB
  - Q5_K_M / Q5_0: ~1,9 GB
  - Q4_K_M / Q4_0: ~1,6 GB
  - Q3_K_M: ~1,3 GB
  - Q2_K: ~1,1 GB
  (los tamaños intermedios son estimaciones estándar; solo F16 está confirmado en la model card)
- GPU recomendadas: al ser un modelo de 2,7 B parámetros, no requiere GPU de gama alta; cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050, RTX 3060 o superior) ejecuta cómodamente las cuantizaciones de 4-8 bits. También es viable solo con CPU y RAM.
- Consumer GPUs: sí, cabe sobradamente en GPUs de consumo desde 4 GB de VRAM; incluso en portátiles sin GPU usando inferencia por CPU.
- Opciones de despliegue: llama.cpp (nativo, con ejemplo de uso en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; por tamaño y arquitectura híbrida LFM se espera inferencia rápida en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Orbit-3-Nano (este) | ~2,7 B | GGUF (13 cuantizaciones) | Instrucciones en indonesio | LFM Open License v1.0 |
| LiquidAI/LFM2.5-2.6B (base) | ~2,7 B | Safetensors | Modelo base generalista | LFM Open License v1.0 |
| Qwen2.5-3B-Instruct | ~3 B | Safetensors / GGUF (comunitarias) | Multilingüe generalista (incluye indonesio parcial) | Qwen Research / Apache-2.0 (según versión) |
| Gemma 2 2B IT | ~2,6 B | Safetensors / GGUF (comunitarias) | Multilingüe generalista | Gemma License |

Nota: los modelos alternativos no están especializados en indonesio, por lo que la comparativa se basa en tamaño y categoría; no hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Especialización lingüística: el ajuste fino está orientado a indonesio; el rendimiento en otros idiomas, incluido el castellano, no está documentado y probablemente sea inferior o no fiable.
- Riesgo de alucinación: como todo modelo de lenguaje de 2,7 B parámetros, puede generar contenido incorrecto o inventado con fluidez; el propio autor incluye un disclaimer ("Evaluate before use") recomendando evaluación previa.
- Sesgos: no se ha documentado ningún análisis de sesgos; el modelo puede heredar sesgos del modelo base y de los datos del ajuste fino, que no son públicos.
- Longitud de contexto: no disponible; debe verificarse en la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia: se distribuye bajo LFM Open License v1.0, una licencia "other" (no estándar); debe revisarse el texto completo para confirmar las condiciones de uso comercial, que pueden incluir restricciones.
- Calidad de las cuantizaciones agresivas: los niveles Q3 y Q2_K pueden degradar notablemente la calidad de generación; el autor recomienda Q4_K_M como equilibrio.
- Herramientas y agentes: no consta soporte de tool calling ni capacidades agénticas, por lo que no es adecuado para pipelines que exijan function calling fiable.
- Popularidad limitada: con 411 descargas y 0 likes en el momento de la ficha, es un modelo de comunidad sin auditoría amplia; conviene validarlo antes de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Orbit-3-Nano-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo original ajustado: https://huggingface.co/OpenPathAI/Orbit-3-Nano (referenciado en la model card; URL no verificada en la información proporcionada)
- Paper, blog o demo: no disponibles
