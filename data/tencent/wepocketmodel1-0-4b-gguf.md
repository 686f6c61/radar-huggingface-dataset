# tencent/WePocketModel1.0-4B-GGUF

## Resumen

WePocketModel 1.0 4B GGUF es la variante cuantizada para CPU del modelo multimodal WePocketModel 1.0 4B, desarrollado por WeChat AI (Tencent) para aplicaciones en dispositivo. Se trata de un modelo vision-lenguaje que comparte un mismo backbone y un codificador visual para cubrir tres capacidades en un solo modelo: generación de texto condicionada por texto e imagen, embeddings multimodales con normalización L2 y decisiones estructuradas (elecciones, puntuaciones y juicios binarios).

El modelo base cuenta con 4.205.751.296 parámetros y una dimensión de embedding completa de 2.048. Esta distribución GGUF separa los pesos del lenguaje (cuantizados en Q4_K_M o BF16) de los pesos compartidos de visión y tareas, que se almacenan en BF16 y se computan en FP32 mediante el runtime CPU propio de WePM, construido sobre una revisión fijada de llama.cpp.

Su relevancia actual radica en que empaqueta en un solo artefacto de 3,42 GB (Q4_K_M) capacidades que habitualmente requieren modelos separados de generación, retrieval y clasificación, lo que simplifica el despliegue local en entornos sin GPU. La licencia de los pesos está pendiente de confirmación según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con backbone de lenguaje tipo transformer (tag `qwen3_5`) y codificador visual compartido; cabezas de tarea para embeddings y decisiones estructuradas |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (por defecto) y BF16 para los pesos de lenguaje; vision y tareas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia de los pesos esta pendiente de confirmacion; el codigo de inferencia es Apache 2.0) |
| Formato de pesos | GGUF (ficheros `language-Q4_K_M.gguf`, `language-BF16.gguf` y `multimodal-BF16.gguf`) |

## Arquitectura y entrenamiento

WePocketModel emplea una arquitectura multimodal con un backbone de lenguaje compartido (etiquetado como `qwen3_5`) y un codificador visual común. Sobre esa base se añaden cabezas de tarea que permiten tres modos de operación: generación autoregresiva de texto a partir de texto e imágenes intercaladas, producción de embeddings multimodales con normalización L2 y emisión de decisiones estructuradas (selección entre opciones, puntuaciones y juicios binarios). El checkpoint de 4B tiene una dimensión de embedding completa de 2.048.

Una innovación destacable es el uso de Matryoshka Representation Learning (MRL) en los embeddings multimodales, que permite truncar la representación a 64, 128, 256, 512, 1.024 o 2.048 dimensiones y normalizar L2 el prefijo seleccionado en tiempo de ejecución, sin reentrenar. En esta distribución GGUF la cuantización se aplica únicamente a los pesos de lenguaje, mientras que los tensores de visión y de tareas permanecen en BF16 y se computan en FP32 en el runtime CPU. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por texto e imagen (pipeline `image-text-to-text`), incluida la generación con entradas intercaladas.
- Embeddings multimodales normalizados en L2 con dimensiones seleccionables mediante MRL: 64, 128, 256, 512, 1.024 y 2.048.
- Decisiones estructuradas: elección entre opciones, asignación de puntuaciones y juicios binarios.
- Ejecución en CPU mediante un runtime C++ propio (`libwepm_gguf`) construido sobre llama.cpp.
- Soporte de plantilla de chat y procesador multimodal incluidos en el bundle.
- Tool calling, function calling, modo thinking, audio y capacidades de agente multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Búsqueda multimodal local: indexar imágenes y texto en un dispositivo usando los embeddings MRL del modelo, eligiendo 256 o 512 dimensiones para reducir memoria y latencia en el índice vectorial, y 2.048 cuando se requiera máxima fidelidad.
- Clasificación visual en el borde: usar la tarea de decisión estructurada para asignar etiquetas o juicios binarios sobre imágenes (por ejemplo, verificación de contenido) sin depender de un servicio en la nube.
- Asistentes de escritorio sin GPU: desplegar la variante Q4_K_M (3,42 GB en disco) en portátiles o mini-PC para generar descripciones de imágenes y respuestas conversacionales con el runtime CPU incluido.
- Enrutamiento y filtrado previo: emplear las puntuaciones y elecciones estructuradas para decidir si una consulta o imagen debe escalarse a un modelo mayor, aprovechando el bajo coste de un modelo de 4B en CPU.
- Deduplicación y agrupación de imágenes: calcular embeddings con dimensión reducida para clustering y detección de duplicados en catálogos fotográficos locales.
- Prototipado de pipelines multimodales: usar el mismo bundle para generación, embedding y decisión, evitando mantener tres modelos distintos durante la fase de experimentación.
- Validación de decisiones antes de acciones: integrar los juicios binarios del modelo como paso de verificación en flujos que disparan acciones, tal como recomienda la propia model card.

## Benchmarks y rendimiento

La model card incluye una imagen comparativa de resultados de la familia WePM en tareas de embedding, generación y decisión, pero no se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el runtime oficial está diseñado para CPU, con Python 3.10–3.13, CMake 3.20 o superior y compilador C++17.
- Espacio en disco: 3,42 GB para el bundle Q4_K_M (lenguaje Q4_K_M más visión/tareas BF16) y 9,14 GB para el bundle BF16.
- Memoria en ejecución: depende de la variante, de las entradas, del tamaño de contexto y de la sobrecarga del backend; no se publican cifras concretas.
- GPU: no se especifican GPU recomendadas ni requisitos de VRAM; el flujo documentado es exclusivamente CPU.
- Despliegue: runtime propio `libwepm_gguf` sobre llama.cpp, con CLI `inference/infer_cpu.py` y scripts de ejemplo en `examples/cpu/` para generación, embedding y decisión.
- vLLM, TGI, Ollama y llama.cpp estándar: no se documenta soporte directo; el runtime fija una revisión concreta de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con alternativas de la misma categoría. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Capacidades | Licencia | Formato |
|---|---|---|---|---|---|
| WePocketModel 1.0 4B GGUF | 4,2 B | no disponible | Generación imagen-texto, embeddings MRL, decisiones estructuradas | no disponible | GGUF |
| WePocketModel 1.0 2B | no disponible | no disponible | Misma familia, menor tamaño | no disponible | safetensors, GGUF |
| Alternativas de 4B vision-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia de los pesos está pendiente de confirmación; no debe asumirse uso comercial hasta que se publique. Solo el código de inferencia es Apache 2.0.
- La cuantización Q4_K_M puede degradar la calidad respecto al checkpoint BF16; la model card recomienda evaluar la calidad de salida en entradas representativas.
- Las decisiones estructuradas deben validarse antes de disparar acciones automáticas, según advierte el propio autor.
- No se documentan sesgos conocidos, cobertura de idiomas ni tasas de alucinación.
- No se publica la longitud de contexto soportada, lo que dificulta planificar cargas con entradas largas.
- El runtime está acoplado a una revisión fijada de llama.cpp y a un script de compilación propio, lo que añade complejidad de despliegue frente a soluciones estándar.
- El repositorio puede requerir autenticación para la descarga.
- El modelo está orientado a aplicaciones locales; no se documenta soporte para servidores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face (GGUF 4B): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Hugging Face (4B safetensors): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (2B safetensors): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (2B GGUF): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guía de inferencia GGUF en CPU: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md#gguf-on-cpu
- Licencia del código: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
- Paper (arXiv): https://arxiv.org/abs/2611.27365
