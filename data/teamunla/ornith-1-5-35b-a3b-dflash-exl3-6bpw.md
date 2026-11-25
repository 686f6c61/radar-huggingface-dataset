# TeamUNLa/Ornith-1.5-35B-A3B-DFlash-exl3-6bpw

## Resumen

Ornith-1.5-35B-A3B-DFlash-exl3-6bpw es una cuantización en formato ExLlamaV3 (EXL3) a 6 bits por peso del modelo borrador (draft model) ornith-ai/Ornith-1.5-35B-A3B-DFlash, publicada por TeamUNLa, la comunidad de estudiantes de la Licenciatura en Sistemas de la Universidad Nacional de Lanús. No se trata de un modelo de lenguaje autónomo: es un drafter de decodificación especulativa diseñado para cargarse junto al modelo objetivo Ornith-1.5-35B-A3B y acelerar la generación de tokens en despliegues servidos con TabbyAPI.

El modelo base pertenece a la familia Ornith-1.5 de ornith-ai, que extiende Ornith-1.0 (construido sobre Qwen3.5 y Gemma4 con preentrenamiento continuado y postentrenamiento adicional) ampliando el bucle de auto-mejora a la generación de tareas, la construcción de scaffolds y la optimización de rollouts mediante aprendizaje por refuerzo. El drafter DFlash emplea un enfoque de difusión por bloques (block-diffusion) para proponer secuencias de tokens candidatas que el modelo objetivo verifica después.

La relevancia de esta ficha es práctica: ofrece un artefacto ligero (276 MB de descarga, ~1,2 GB de VRAM adicional) que permite activar decodificación especulativa sobre cuantizaciones EXL3 de Ornith-1.5-35B-A3B sin necesidad de reentrenar ni de convertir el modelo principal. Los pesos reales del repositorio suman 145.010.176 parámetros, coherentes con un drafter compacto y no con los 35B del modelo objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo borrador de difusión por bloques (block-diffusion) para decodificación especulativa; pesos en formato ExLlamaV3 (EXL3) |
| Parámetros totales | 145.010.176 (según safetensors del repositorio) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 6 bpw (6 bits por peso) |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantización EXL3 (ExLlamaV3); requiere `custom_code` |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B-DFlash |
| Modelo objetivo compatible | Ornith-1.5-35B-A3B (cuantizaciones EXL3 de TeamUNLa) |
| Tamaño de descarga | 276 MB (repositorio de 0,3 GB) |
| VRAM adicional requerida | ~1,2 GB |
| Motor de inferencia | TabbyAPI (ExLlamaV3); APIs CUDA y ROCm |
| Relación con el base | quantized |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del drafter más allá de su naturaleza de modelo de difusión por bloques orientado a decodificación especulativa. La model card del modelo base original describe DFlash como un checkpoint borrador que se ejecuta junto al modelo objetivo bajo un esquema de inferencia habilitado para DFlash; no es un modelo de lenguaje independiente. La etiqueta `block-diffusion` sugiere que el drafter genera propuestas de tokens por bloques en lugar de forma puramente autorregresiva, lo que encaja con el propósito de proponer varias posiciones candidatas por paso para que el modelo objetivo las verifique.

Respecto al entrenamiento, la información disponible solo cubre el modelo objetivo Ornith-1.5-35B-A3B: se desarrolló a partir de Ornith-1.0 (basado en Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training) y amplía el bucle de auto-mejora para optimizar conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si el drafter DFlash recibió RLHF o DPO; esos datos figuran como no disponibles.

La innovación técnica relevante de esta variante es la conversión a EXL3 a 6 bpw, que reduce el drafter a 276 MB y ~1,2 GB de VRAM en tiempo de ejecución, manteniendo la compatibilidad con el pipeline de decodificación especulativa de ExLlamaV3 en TabbyAPI.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone secuencias que el modelo objetivo Ornith-1.5-35B-A3B verifica, acelerando la inferencia.
- Integración como draft model en TabbyAPI mediante configuración en `config.yml`.
- Compatibilidad con cuantizaciones EXL3 del modelo objetivo publicadas por TeamUNLa.
- Soporte declarado de los idiomas español e inglés (heredado del modelo base).
- No es un modelo autónomo: no debe usarse para generación directa, razonamiento, código, matemáticas, visión ni tool calling por sí mismo.
- No se documentan capacidades de agentes, function calling ni modos de pensamiento propios de este artefacto.

## Casos de uso

- Aceleración de inferencia en producción: cargar este drafter junto a una cuantización EXL3 de Ornith-1.5-35B-A3B en TabbyAPI para reducir la latencia por token mediante decodificación especulativa, con un coste adicional de ~1,2 GB de VRAM.
- Servicio de chat de baja latencia: en despliegues interactivos donde el tiempo hasta el primer token y la velocidad de generación son críticos, el drafter propone bloques que el modelo objetivo valida, mejorando la experiencia en conversaciones multi-turno.
- Autocompletado de código en IDE: integrar el par drafter + modelo objetivo en un backend compatible con ExLlamaV3 para reducir la latencia de sugerencias en editores, siempre que el modelo objetivo se use para la generación final.
- Generación por lotes en pipelines de contenido: procesar grandes volúmenes de texto (resúmenes, traducciones es-en) con mayor throughput al disminuir el número de pasos de decodificación del modelo principal.
- Despliegue en GPUs de gama consumer: al requerir solo ~1,2 GB extra, el drafter permite activar decodificación especulativa en tarjetas con VRAM limitada, como series RTX 30/40, donde cargar un segundo modelo completo sería inviable.
- Evaluación comparativa de técnicas de aceleración: usar esta variante como referencia reproducible para medir el impacto de la decodificación especulativa con DFlash frente a generación estándar en entornos ExLlamaV3.
- Experimentación académica: servir como artefacto de estudio para estudiantes e investigadores que analicen la eficiencia de drafters de difusión por bloques en decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM adicional para el drafter: ~1,2 GB según la model card.
- VRAM total: depende enteramente de la cuantización EXL3 de Ornith-1.5-35B-A3B cargada como modelo objetivo; no disponible en la información proporcionada.
- GPUs recomendadas: no se especifican modelos concretos. Para CUDA, cualquier tarjeta desde la generación GeForce GTX 10 en adelante con VRAM suficiente; para ROCm, serie RX 7000 o superior (RX 6800 y superiores de la serie RX 6000 deberían funcionar, sin pruebas documentadas).
- GPUs Intel: no soportadas.
- Cabe en GPU consumer: sí, el drafter por sí solo ocupa ~1,2 GB; la viabilidad conjunta depende del modelo objetivo.
- Opciones de despliegue: TabbyAPI con ExLlamaV3 (soporte CUDA y ROCm). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la ganancia depende del ratio de aceptación del drafter, que no se cuantifica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Función |
|---|---|---|---|---|---|
| TeamUNLa/Ornith-1.5-35B-A3B-DFlash-exl3-6bpw | 145.010.176 | no disponible | EXL3 6 bpw | MIT | Draft model para decodificación especulativa |
| ornith-ai/Ornith-1.5-35B-A3B-DFlash | no disponible | no disponible | no disponible | no disponible | Draft model original (referencia) |
| ornith-ai/Ornith-1.5-35B-A3B | 35B (A3B, MoE) | no disponible | no disponible | no disponible | Modelo objetivo que consume el drafter |

No se dispone de información sobre otros drafters comparables (por ejemplo, de otras familias) en la documentación proporcionada, por lo que la comparación se limita a las variantes del mismo ecosistema Ornith.

## Limitaciones y advertencias

- No es un modelo independiente: usarlo sin el modelo objetivo Ornith-1.5-35B-A3B no produce generación de texto válida.
- Solo es compatible con cuantizaciones EXL3 de Ornith-1.5-35B-A3B; no se garantiza su funcionamiento con otras variantes o motores.
- Requiere `custom_code` y el stack ExLlamaV3/TabbyAPI; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Sin soporte para GPUs Intel; en ROCm hay modelos no probados (RX 6000).
- Idiomas declarados limitados a español e inglés.
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios específicos del drafter; al no generar respuestas finales, el riesgo de alucinación recae en el modelo objetivo.
- La licencia MIT del artefacto no exime de verificar la licencia del modelo base y del modelo objetivo para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria documentada.
- Proyecto estudiantil no oficial de la UNLa; sin garantías de mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-DFlash-exl3-6bpw
- Modelo base (drafter original): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
