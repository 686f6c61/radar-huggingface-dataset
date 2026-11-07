# taronaeo/Granite-4.0-1B-BE-GGUF

## Resumen

Granite-4.0-1B-BE-GGUF es una redistribución del modelo instructivo ibm-granite/granite-4.0-1b de IBM, publicada por el usuario taronaeo. La particularidad de esta variante es que los pesos GGUF han sido convertidos a orden de bytes big-endian (byte-swapped) para poder ejecutarse en sistemas IBM Z y LinuxONE (arquitecturas s390x, z15, z16 y z17), que emplean big-endian de forma nativa. El modelo subyacente es un transformer denso de 1.631.750.144 parámetros (aproximadamente 1,6 mil millones), perteneciente a la familia Granite 4.0 Nano de IBM, publicada el 28 de octubre de 2025.

El modelo original está afinado para instrucciones mediante una combinación de supervised fine-tuning, reinforcement learning y model merging, partiendo de Granite-4.0-1B-Base. Su tamaño compacto lo orienta a despliegues en dispositivo (on-device), entornos con recursos limitados y ajuste fino en dominios especializados sin necesidad de gran capacidad de cómputo. La licencia Apache 2.0 facilita su uso comercial.

Esta ficha describe tanto el modelo base como la variante big-endian distribuida en este repositorio, que incluye un conjunto amplio de cuantizaciones GGUF (desde Q2_K hasta F32) con tamaños que van de 681,8 MB a 6,1 GB. El repositorio acumula 79.231 descargas, lo que sugiere un interés notable en el nicho de despliegue sobre mainframe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite 4.0 Nano) |
| Parámetros totales | 1.631.750.144 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, F16, F32 |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (big-endian, byte-swapped para s390x) |

## Arquitectura y entrenamiento

El modelo base Granite-4.0-1B es un transformer denso de aproximadamente 1,6 mil millones de parámetros. Según la model card, se desarrolló mediante una combinación de técnicas: supervised fine-tuning sobre un conjunto de datos de instrucciones de código abierto con licencias permisivas, junto con datasets sintéticos generados internamente; además, se emplearon reinforcement learning y model merging. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset.

La innovación técnica principal de esta variante concreta no reside en la arquitectura, sino en el proceso de conversión: los tensores GGUF se han reordenado a big-endian para que llama.cpp pueda ejecutarse en procesadores s390x de IBM Z y LinuxONE. El autor enlaza a la guía oficial de compilación de llama.cpp para s390x. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones específicas en el material proporcionado.

## Capacidades

- Generación de texto e instrucciones: modelo instructivo afinado para seguir indicaciones y mantener conversaciones multi-turno.
- Resumen de documentos (summarization), según la model card.
- Clasificación de texto (text classification), según la model card.
- Razonamiento y matemáticas: no se detalla explícitamente en la información disponible.
- Generación de código: no se detalla explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: soporte declarado para 12 idiomas, incluido el español.
- Capacidad especial: ejecución en sistemas big-endian IBM Z / LinuxONE gracias a la conversión byte-swapped de los pesos.
- Visión y audio: no disponibles (modelo puramente de lenguaje).

## Casos de uso

- Despliegue sobre IBM Z y LinuxONE: el caso de uso principal de esta variante. Permite ejecutar inferencia local con llama.cpp en mainframes s390x (z15, z16, z17), donde los GGUF estándar little-endian no funcionan directamente. Adecuado para organizaciones con cargas críticas en mainframe que quieren mantener el procesamiento de IA dentro de su infraestructura.
- Procesamiento de texto en entornos con recursos muy limitados: con cuantizaciones Q4_K_M (976,2 MB) o IQ4_XS (899,8 MB) puede ejecutarse en sistemas con poca memoria, incluyendo contenedores pequeños o dispositivos edge.
- Resumen automático de documentos: el modelo está declarado para summarization; puede emplearse para condensar informes, correos o actas en pipelines internos.
- Clasificación de texto a escala: útil para etiquetado de tickets, moderación básica o enrutamiento de consultas, con la ventaja de un coste de inferencia bajo.
- Asistente conversacional ligero: atención al cliente o asistentes internos con respuestas de baja latencia, aprovechando su tamaño reducido.
- Ajuste fino en dominios especializados: al ser un modelo de 1,6 B con licencia Apache 2.0, es viable reentrenarlo con recursos de GPU modestos para vocabulario o tareas de nicho (por ejemplo, terminología legal o técnica en español).
- Experimentación e investigación: base para estudiar técnicas de cuantización, portabilidad de arquitecturas o evaluación de modelos pequeños en entornos no convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,7 GB; IQ4_XS ~0,9 GB; Q4_K_M ~1,0 GB; Q5_K_M ~1,1 GB; Q6_K ~1,3 GB; Q8_0 ~1,6 GB; BF16/F16 ~3,0 GB; F32 ~6,1 GB. Añadir overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre puede ejecutar las cuantizaciones de 4-5 bits (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para BF16/F16 se recomienda al menos 4-6 GB (RTX 3060 en adelante). Para F32, 8 GB o más.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas con las cuantizaciones recomendadas (Q4_K_M, Q5_K_M).
- Opciones de despliegue: llama.cpp (con build específico para s390x en el caso de esta variante big-endian), llama-server; otras herramientas como vLLM, TGI u Ollama no están confirmadas para esta variante en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,6 B, se espera una latencia baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Granite-4.0-1B-BE-GGUF (este) | 1,63 B | No disponible | Apache 2.0 | GGUF big-endian | Variante para IBM Z / LinuxONE |
| ibm-granite/granite-4.0-1b | 1,63 B | No disponible | Apache 2.0 | Safetensors (original) | Modelo base instructivo de IBM |
| ibm-granite/granite-4.0-1b-GGUF | 1,63 B | No disponible | Apache 2.0 | GGUF little-endian | GGUF oficial de IBM para x86/ARM |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- La variante big-endian solo es funcional en sistemas s390x (IBM Z / LinuxONE); en hardware x86 o ARM convencional no se ejecutará correctamente. Para esos entornos debe usarse el GGUF oficial little-endian.
- Modelo de 1,6 B: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamaño; mayor riesgo de alucinación en tareas complejas o de conocimiento especializado.
- No se han publicado datos de benchmarks ni evaluaciones de seguridad en la información disponible, lo que dificulta estimar su calidad real frente a alternativas.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse con datasets abiertos y sintéticos, es probable que herede sesgos de esas fuentes.
- Idiomas: aunque declara soporte para 12 idiomas, el rendimiento relativo por idioma no está cuantificado; el español figura entre los soportados, pero sin métricas.
- Longitud de contexto: no disponible; conviene verificarla antes de diseñar aplicaciones que dependan de ventanas largas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las obligaciones de atribución y las condiciones de los datasets de origen.
- El repositorio tiene 0 likes y está mantenido por un tercero (taronaeo), no por IBM; para producción conviene validar la integridad de los pesos frente al modelo original.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/taronaeo/Granite-4.0-1B-BE-GGUF
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.0-1b
- GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.0-1b-GGUF
- Colección Granite 4.0 Nano: https://huggingface.co/collections/ibm-granite/granite-40-nano-language-models-68e5775c80b60e43b72cfa16
- Repositorio GitHub de Granite 4.0 Nano: https://github.com/ibm-granite/granite-4.0-nano-language-models
- Documentación de Granite: https://www.ibm.com/granite/docs/
- Guía de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
