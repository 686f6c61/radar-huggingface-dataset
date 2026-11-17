# zephel01/Qwen3.8-Flash-Next-12G32G-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba). El repositorio que nos ocupa, `zephel01/Qwen3.8-Flash-Next-12G32G-GGUF`, es una cuantización GGUF de terceros (autor zephel01) optimizada para ejecutarse en un PC con una GPU de 12 GB de VRAM y 32 GB de RAM. No es un modelo original, sino una receta de compresión agresiva del modelo base Qwen3.8-Flash-Next, con 161.836.540.800 parámetros totales.

La propuesta central de esta cuantización es hacer viable un modelo MoE de más de 160 000 millones de parámetros en hardware de consumo mediante una combinación de cuantización mixta (LDLQ sobre pesos NVFP4), poda selectiva de expertos (se conservan 448 de 512 por capa) y offload de la tabla de embeddings por capa al SSD. El resultado es un archivo de 67,5 GB que, según el autor, alcanza 56,0 tok/s en tareas de código sobre una RTX 5090 limitada a 12 GB de VRAM y 20 GB de RAM.

Es relevante ahora porque demuestra que técnicas de cuantización extrema combinadas con poda de expertos y offload de memoria permiten ejecutar modelos de escala frontier en equipos locales modestos, un área de interés creciente para desarrolladores que quieren privacidad y control sin depender de APIs en la nube. El modelo está marcado como BETA y los datos de rendimiento proceden de una única máquina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; arquitectura `qwen4exp` en llama.cpp |
| Parámetros totales | 161.836.540.800 (161,8 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32 768 tokens (configuración de ejemplo con `-c 32768`) |
| Tipos de cuantización | GGUF mixta: expertos IQ4_NL 57 %, IQ1_S 28 %, IQ2_XXS 15 % (2,64 bits/peso de media, ~IQ2_M); tabla de embeddings por capa IQ4_NL |
| Idiomas soportados | en, ja (inglés y japonés según tags y calibración) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (3 shards, `L448/Qwen3.8-Flash-Next-12G32G-L448-0000N-of-00003.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura Mixture-of-Experts de 512 expertos por capa. Esta cuantización no reentrena el modelo: parte de los pesos del modelo base en formato NVIDIA NVFP4 y de la cuantización de referencia unsloth UD-IQ1_S, y aplica una receta propia. Cada experto se recuantiza con LDLQ (técnica de cuantización con corrección de error) manteniendo el layout original de unsloth. Los tensores no-expertos (atención, router, experto compartido, embeddings y tabla PLE) se conservan sin cambios respecto a los bytes de UD-IQ1_S.

La innovación principal es la poda selectiva de expertos: cada capa conserva los 448 expertos más utilizados por el routing sobre texto en japonés, chino, inglés, código, matemáticas y tool-calls. Según el autor, los expertos conservados cubren entre el 96,9 % y el 99,1 % de las rutas en texto held-out por dominio. La calibración se realizó con 181 prompts de chat del propio modelo (44 en japonés) más texto mixto. Además, la tabla de embeddings por capa (28,8 GB en IQ4_NL) se lee unas pocas filas por token, por lo que no necesita caber en RAM: Abyss la lee desde el SSD y llama.cpp la mapea en memoria.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento y matemáticas (el ejemplo de la model card incluye cálculo aritmético).
- Generación de código (evaluado en tareas de coding en los benchmarks del autor).
- Tool calling / function calling (los tags y la calibración incluyen texto de tool-calls).
- Capacidad de recuperación de contexto largo (prueba "needle" de 8K superada según el autor).
- Soporte de modo thinking (las pruebas de uso real se ejecutan con thinking activado).
- Capacidades multilingües limitadas a inglés y japonés según la model card, aunque la calibración menciona también chino.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código local: el modelo puede integrarse en un IDE o pipeline de CI/CD para autocompletado y revisión de código, aprovechando sus 32K de contexto y su rendimiento medido de 56 tok/s en tareas de coding sobre la configuración objetivo.
- Atención al cliente en japonés e inglés: conversaciones multi-turno con contexto de 32K tokens, ejecutadas en local para mantener la privacidad de los datos del cliente.
- Procesamiento de documentos largos: resumen y extracción de información de contratos o informes de hasta ~32K tokens, con la recuperación de contexto largo validada en la prueba needle de 8K.
- Agentes con tool calling: automatización de tareas que requieren llamadas a funciones o APIs, gracias al soporte de function calling y al modo thinking para razonamiento multi-paso.
- Desarrollo y pruebas offline: prototipado de aplicaciones de IA generativa en un PC de consumo sin conexión ni costes de API, usando Abyss o llama.cpp.
- Investigación sobre cuantización: banco de pruebas para estudiar el impacto de la poda de expertos y la cuantización mixta en la calidad (KL) y la velocidad de un MoE grande.
- Evaluación de modelos en hardware limitado: comparación de calidad frente al modelo base NVFP4 y a la cuantización de referencia unsloth en un entorno de 12 GB de VRAM.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (una sola máquina, RTX 5090 limitada a 12 GB + 20 GB RAM en cgroup de 28 GB):

| Métrica | L448 (este repo) | unsloth UD-IQ1_S |
|---|---|---|
| Expertos por capa | 448 / 512 | 512 / 512 |
| Descarga | 67,5 GB | 72,5 GB |
| KL (10 secuencias) | 0,339 | 0,331 |
| Mismo token top | 78,5 % | 78,4 % |
| KL en japonés | 0,553 | 0,568 |
| Velocidad en coding | 56,0 tok/s | 43,0 tok/s |

Otras mediciones del autor con llama.cpp: 10,9 GB de VRAM, límite de host de 28 GB, decodificación de 26-32 tok/s, procesamiento de prompt de 88 tok/s; japonés 5/5 respuestas, coding 3/5, needle de 8K encontrado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~10,9 GB según la prueba con llama.cpp (`-ngl 99 --n-cpu-moe 41`).
- RAM: 32 GB recomendados (tier de 20 GB en la prueba); el autor indica que la tabla de embeddings no necesita caber en RAM.
- Almacenamiento: 67,5 GB para los pesos; SSD recomendado por la lectura de la tabla de embeddings.
- GPU objetivo: una GPU de 12 GB de VRAM (el autor cita RTX 5090 limitada a 12 GB como banco de pruebas).
- Cabe en GPU de consumo: sí, en GPUs de 12 GB o más con offload de expertos a CPU.
- Opciones de despliegue: Abyss (v1.3.106 o superior, con `setup-deepseek.sh`) y llama.cpp (arquitectura `qwen4exp`, upstream `ac8e1694d` de 2026-10-29).
- Throughput: 56,0 tok/s en coding (Abyss), 26-32 tok/s en decodificación y 88 tok/s en procesamiento de prompt (llama.cpp).
- Repos alternativos del mismo autor: 16G64G (86,9 GB, 512 expertos), 24G64G (93,7 GB, 512 expertos, mayor calidad) y DGX Spark (128 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este repo (L448, 12G32G) | 161,8 B totales | 32K | qwen-community-1.0 | GGUF, 67,5 GB | 448/512 expertos, KL 0,339 |
| Qwen3.8-Flash-Next 16G64G | 161,8 B totales | 32K | qwen-community-1.0 | GGUF, 86,9 GB | 512/512 expertos |
| Qwen3.8-Flash-Next 24G64G | 161,8 B totales | 32K | qwen-community-1.0 | GGUF, 93,7 GB | 512/512 expertos, mayor calidad |
| unsloth UD-IQ1_S (referencia) | 161,8 B totales | 32K | qwen-community-1.0 | GGUF, 72,5 GB | 512/512 expertos, KL 0,331 |

No se dispone de datos de benchmarks estándar para comparar con modelos de otras familias; la comparación disponible se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Marcado como BETA: los resultados se midieron en una sola máquina; el autor solicita reportes de otras GPUs y tamaños de RAM.
- La poda de expertos (448 de 512) implica una pérdida de cobertura de routing del 0,9-3,1 % según el dominio, con posible degradación en dominios no representados en la calibración.
- El KL en japonés (0,553) es superior al KL global (0,339), lo que sugiere mayor desviación respecto al modelo base en ese idioma.
- Idiomas soportados limitados a inglés y japonés según la model card; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- La licencia qwen-community-1.0 impone restricciones que deben revisarse antes de uso comercial; el repositorio usa `license: other`.
- El rendimiento depende críticamente de la velocidad del SSD y del ancho de banda de RAM por el offload de la tabla de embeddings.
- Los nombres de archivo conservan la etiqueta L448 de versiones anteriores; el repositorio se renombró desde `Qwen3.8-Flash-Next-12G32G-GGUF`.
- No se documentan sesgos específicos del modelo ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-12G32G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 16G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Variante 24G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+12G32G-L448+on+YOUR_GPU
