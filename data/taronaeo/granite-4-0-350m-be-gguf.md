# taronaeo/Granite-4.0-350M-BE-GGUF

## Resumen

Granite-4.0-350M-BE-GGUF es una conversión a formato GGUF del modelo instruct `ibm-granite/granite-4.0-350m` de IBM, publicada por el usuario taronaeo. La particularidad de esta ficha no es el modelo en sí, sino el formato: los pesos han sido reordenados en bytes (byte-swapped) para poder ejecutarse en arquitecturas big-endian, concretamente en sistemas IBM Z (s390x) y LinuxONE (z15, z16, z17). Es, por tanto, una distribución de nicho orientada a mainframe, no una variante con cambios en arquitectura ni entrenamiento.

El modelo subyacente, Granite-4.0-350M, es un transformer decoder-only de 352.379.904 parámetros (unos 350M) publicado por IBM el 28 de octubre de 2025 como parte de la familia Granite 4.0 Nano. Está afinado por instrucciones a partir de Granite-4.0-350M-Base mediante una combinación de supervisión fina (SFT), aprendizaje por refuerzo y merging de modelos, con licencia Apache 2.0. Su relevancia radica en que ofrece capacidades de seguimiento de instrucciones en un tamaño apto para despliegue en dispositivo y entornos con recursos muy limitados.

Este repositorio concreto tiene 18.099 descargas y un tamaño de 7,3 GB, lo que refleja la suma de las 19 cuantizaciones publicadas (desde Q2_K de 172,3 MB hasta F32 de 1,3 GB). No se dispone de información sobre el pipeline declarado ni de los idiomas configurados en la tarjeta de este repositorio derivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Granite 4.0 Nano) |
| Parámetros totales | 352.379.904 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, F16, F32 |
| Idiomas soportados | inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino (según el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (byte-swapped para big-endian) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de aproximadamente 350M parámetros, integrado en la familia Granite 4.0 Nano de IBM. Según la model card del modelo original, el instruct se obtiene a partir de Granite-4.0-350M-Base mediante una combinación de datasets de instrucciones de código abierto con licencia permisiva y datasets sintéticos generados internamente, aplicando técnicas de supervised fine-tuning, reinforcement learning y model merging. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

La contribución técnica de este repositorio es la conversión a GGUF con reordenación de bytes (byte-swap) para que los tensores sean legibles en sistemas big-endian como IBM Z y LinuxONE. Esto permite ejecutar el modelo con llama.cpp compilado para s390x, algo que no es posible con los GGUF estándar (little-endian) sin conversión previa. No hay cambios en los pesos más allá del reordenamiento de bytes ni en el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat.
- Seguimiento de instrucciones orientado a despliegues en dispositivo y casos de investigación.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 350M parámetros.
- Capacidades multilingües en los 12 idiomas listados por IBM para el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de lenguaje).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en mainframe IBM Z y LinuxONE: es el caso de uso principal y diferencial de este repositorio. Permite ejecutar un LLM instruct dentro de la propia infraestructura s390x mediante llama.cpp compilado para big-endian, sin depender de servicios externos ni de arquitecturas x86/ARM auxiliares.
- Clasificación y etiquetado de texto en entornos regulados: al ejecutarse localmente en el mainframe, los datos no salen del perímetro del sistema, lo que encaja con requisitos de soberanía y cumplimiento en banca y seguros.
- Asistentes de documentación técnica interna: con 350M parámetros y cuantización Q4_K_M (226 MB), puede desplegarse como servicio ligero de preguntas y respuestas sobre manuales y procedimientos internos.
- Prototipado y evaluación de pipelines de IA generativa: sirve como modelo de bajo coste para validar cadenas de inferencia, prompts y formateo de chat antes de escalar a modelos mayores de la familia Granite.
- Extracción de información estructurada: resumen y transformación de registros, tickets o logs en texto plano dentro de flujos batch ejecutados en el propio sistema.
- Experimentación académica en arquitecturas big-endian: útil para investigadores que estudien el rendimiento de llama.cpp y de modelos transformer en s390x, un entorno poco cubierto por la literatura habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones habituales. Q4_K_M ocupa 226,0 MB; Q8_0, 360,6 MB; BF16/F16, 675,6 MB; F32, 1,3 GB.
- GPU recomendadas: el modelo es lo bastante pequeño para ejecutarse en CPU; cualquier GPU consumer con al menos 2 GB de VRAM libre puede alojarlo en cuantizaciones de 4 a 8 bits. No se especifican modelos concretos de GPU en la información disponible.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (por ejemplo, gama GTX/RTX con 4 GB o más), aunque el caso de uso objetivo es CPU s390x.
- Opciones de despliegue: llama.cpp (compilado para s390x big-endian, con `llama-server`); otras herramientas como vLLM, TGI u Ollama no están confirmadas para esta variante byte-swapped en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.0-350M-BE-GGUF (este) | 352M | no disponible | Apache 2.0 | GGUF big-endian | Variante byte-swapped para IBM Z / LinuxONE |
| ibm-granite/granite-4.0-350m | 352M | no disponible | Apache 2.0 | safetensors | Modelo original little-endian, referencia para x86/ARM |
| Qwen2.5-0.5B-Instruct | ~500M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar ampliamente usada en dispositivo |
| SmolLM2-360M-Instruct | ~360M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa compacta para despliegue en el borde |

La comparación con Qwen2.5-0.5B y SmolLM2-360M se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo base tiene 350M parámetros: la calidad de razonamiento, matemáticas y código es limitada en comparación con modelos de varios miles de millones de parámetros.
- Riesgo de alucinación inherente a modelos pequeños; no debe usarse como fuente de verdad sin verificación.
- La variante byte-swapped solo es funcional en sistemas big-endian (IBM Z, LinuxONE). Ejecutarla en x86 o ARM producirá resultados incorrectos.
- Requiere una compilación específica de llama.cpp para s390x; no es compatible con binarios estándar precompilados.
- La longitud de contexto no está especificada en la información disponible; conviene consultar la model card del modelo base antes de diseñar prompts largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor del repositorio derivado no ofrece garantías adicionales; conviene revisar los términos del modelo base.
- No se han publicado benchmarks específicos para esta conversión; el rendimiento puede diferir del original por efectos de cuantización, especialmente en Q2_K y Q3_K_S.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Granite-4.0-350M-BE-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Colección Granite 4.0 Nano: https://huggingface.co/collections/ibm-granite/granite-40-nano-language-models-68e5775c80b60e43b72cfa16
- Repositorio GitHub de Granite 4.0 Nano: https://github.com/ibm-granite/granite-4.0-nano-language-models
- Documentación de Granite: https://www.ibm.com/granite/docs/
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
