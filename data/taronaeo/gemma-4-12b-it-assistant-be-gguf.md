# taronaeo/Gemma-4-12B-IT-Assistant-BE-GGUF

## Resumen

`taronaeo/Gemma-4-12B-IT-Assistant-BE-GGUF` es una conversión a GGUF con byte-swap (big-endian) del modelo `google/gemma-4-12B-it-assistant`, publicada por el usuario taronaeo. El propósito del repositorio no es ofrecer un modelo nuevo, sino empaquetar los pesos del drafter MTP (Multi-Token Prediction) de Gemma 4 en un formato que pueda ejecutarse en sistemas IBM Z y LinuxONE (arquitecturas s390x, z15, z16 y z17), que son big-endian, mediante `llama.cpp`.

El modelo base es un drafter de decodificación especulativa: un modelo auxiliar pequeño y rápido que predice varios tokens por delante y que el modelo objetivo verifica en paralelo, acelerando la generación hasta 3x sin alterar la calidad del resultado. Por tanto, este repositorio no es un modelo conversacional autónomo, sino un componente de un pipeline de inferencia especulativa.

Es relevante para un nicho muy concreto: equipos que despliegan inferencia LLM sobre mainframes IBM Z o LinuxONE y necesitan pesos compatibles con el orden de bytes big-endian. Para el resto de plataformas (x86, ARM, CUDA), este repositorio no aporta ventajas frente al modelo original de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (drafter MTP para decodificación especulativa), según model card del modelo base |
| Parámetros totales | 422.857.220 (dato real de safetensors); el nombre del repo menciona "12B" pero los pesos publicados corresponden al drafter |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | GGUF (byte-swapped para big-endian / s390x) |

## Arquitectura y entrenamiento

El modelo base es un drafter de Multi-Token Prediction (MTP) que extiende el modelo Gemma 4 con un modelo auxiliar más pequeño y rápido. En un pipeline de decodificación especulativa, el drafter predice varios tokens por delante y el modelo objetivo los verifica en paralelo, lo que según la model card produce aceleraciones de decodificación de hasta 3x manteniendo exactamente la misma calidad que la generación estándar.

La contribución de este repositorio es exclusivamente de empaquetado: los pesos se han convertido a GGUF y se han sometido a byte-swap para funcionar en sistemas big-endian (IBM Z y LinuxONE). No se documentan en la información disponible detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) del modelo base. La model card enlaza al informe técnico arXiv:2607.02770 para más detalles.

## Capacidades

- Actúa como drafter de decodificación especulativa para el modelo objetivo `google/gemma-4-12B-it-assistant`, acelerando la generación hasta 3x según la model card.
- Garantiza la misma calidad que la generación estándar, ya que el modelo objetivo verifica cada token propuesto.
- Ejecutable en `llama.cpp` sobre sistemas IBM Z y LinuxONE (s390x, z15, z16, z17) gracias al byte-swap.
- Pipeline declarado como `any-to-any` en los metadatos de Hugging Face.
- Capacidades conversacionales, de razonamiento, código o tool calling: no disponibles en la información proporcionada para este drafter; dependen del modelo objetivo.

## Casos de uso

- Despliegue de inferencia LLM en mainframes IBM Z: el caso principal del repositorio; permite ejecutar el drafter de Gemma 4 en sistemas s390x big-endian mediante `llama-server -hf taronaeo/Gemma-4-12B-IT-Assistant-BE-GGUF:Q4_K_M`, algo que los pesos estándar little-endian no permiten directamente.
- Aceleración de generación en LinuxONE: integrado en un pipeline de decodificación especulativa junto al modelo objetivo, reduce la latencia de decodificación hasta 3x en entornos empresariales que ya operan sobre esta plataforma.
- Evaluación de Gemma 4 en infraestructura IBM: permite a equipos de investigación probar el ecosistema Gemma 4 sin salir de su plataforma mainframe.
- Pruebas de compatibilidad de `llama.cpp` en s390x: útil para validar builds de `llama.cpp` en arquitecturas big-endian siguiendo la guía oficial de compilación para s390x.
- Entornos con requisitos de residencia de datos en mainframe: organizaciones que por política no pueden mover cargas a GPUs x86 pueden mantener la inferencia en su IBM Z.
- Prototipado de asistentes conversacionales sobre z/OS o LinuxONE: combinando el drafter con el modelo objetivo para tareas de asistencia dentro del ecosistema mainframe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base menciona una aceleración de decodificación de hasta 3x en decodificación especulativa, pero sin cifras detalladas de latencia o throughput por hardware.

## Requisitos de hardware

- VRAM estimada: los pesos van desde ~278,7 MB (Q2_K) hasta ~821,6 MB (BF16), por lo que el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no aplica de forma específica; el destino principal son sistemas IBM Z y LinuxONE (s390x), no GPUs.
- Cabe en GPU consumer: sí, cualquier GPU con al menos 1 GB de memoria libre puede alojar los pesos en BF16.
- Opciones de despliegue: `llama.cpp` (compilación para s390x documentada en `docs/build-s390x.md`), `llama-server` con descarga directa desde Hugging Face (`-hf`).
- Latencia y throughput: no disponibles; dependen del hardware mainframe y del modelo objetivo con el que se empareje.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| taronaeo/Gemma-4-12B-IT-Assistant-BE-GGUF | 422,9 M | no disponible | GGUF big-endian | Apache 2.0 | IBM Z / LinuxONE (s390x) |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | safetensors (original) | Apache 2.0 | x86, ARM, CUDA |
| Otros drafters MTP de Gemma 4 | no disponible | no disponible | GGUF little-endian | Apache 2.0 | x86, ARM, CUDA |

La comparativa relevante es frente al modelo original de Google: misma licencia y mismos pesos, pero distinto orden de bytes y formato. Para plataformas little-endian, el original es la opción correcta.

## Limitaciones y advertencias

- No es un modelo autónomo: es un drafter MTP que requiere el modelo objetivo para funcionar en decodificación especulativa.
- El nombre del repositorio menciona "12B", pero los pesos publicados suman 422,9 M de parámetros; conviene verificar qué componente se está descargando antes de desplegarlo.
- Los pesos están byte-swapped: no funcionarán correctamente en plataformas little-endian estándar (x86, ARM) sin reconversión.
- Sin datos publicados de benchmarks, sesgos o evaluación multilingüe en la información disponible.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Riesgo de alucinación y sesgos: heredados del modelo base; no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Gemma-4-12B-IT-Assistant-BE-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-assistant
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
