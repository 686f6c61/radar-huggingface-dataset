# ssfdre38/gemma4.5-turbo-gguf

## Resumen

Gemma 4.5 Turbo es una familia de modelos derivados de Google Gemma 4, publicada por el usuario ssfdre38 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una reoptimización algebraica de los pesos BF16 originales de cuatro variantes de Gemma 4 (E2B, E4B, 26B-A4B y 31B) antes de su cuantización a IQ4_XS. El objetivo es reducir la perplejidad, el tamaño en disco y los requisitos de memoria, preservando la multimodalidad (visión) y el modo de razonamiento (thinking) del modelo base.

El autor emplea una herramienta propia en C++20 con kernels AVX2, `haven-bake`, que elimina tensores muertos de KV compartida, pliega escalas del router MoE e incrusta rotaciones de Hadamard (QuaRot R2 y FWHT por bloques) directamente en los pesos, sin reentrenamiento. El resultado son ficheros GGUF compatibles con Ollama y llama.cpp, además de una edición "Turbo" nativa que requiere el runtime haven-cpp para explotar las transformaciones adicionales.

Los modelos cubren desde un E2B de aproximadamente 4 GiB hasta un 31B denso de 16,82 GiB, pasando por un MoE de 26B con 4B activos. El repo completo ocupa 105,3 GB e incluye pesos multimodales (mmproj) para todos los tamaños. La propuesta es relevante para despliegues en CPU sin GPU, donde la reducción de perplejidad y de huella de memoria a igual cuantización tiene impacto directo en coste y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (variantes densas E2B, E4B y 31B; MoE en 26B-A4B), con encoder de visión multimodal |
| Parametros totales | 25.233.142.046 (dato del repo safetensors; corresponde a la variante 26B-A4B) |
| Parametros activos | Aproximadamente 4B en la variante 26B-A4B (MoE); no disponible para el resto |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS (principal); pesos fuente en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y mmproj multimodal); fuente BF16 |

## Arquitectura y entrenamiento

La familia se construye sobre los pesos BF16 sin cuantizar de cuatro modelos Gemma 4: E2B, E4B, 26B-A4B (MoE con aproximadamente 4B activos) y 31B denso. No hay entrenamiento nuevo: todas las modificaciones son transformaciones lineales exactas aplicadas antes de la cuantización IQ4_XS. Gemma 4 introduce particularidades que degradan la cuantización ingenua a 4 bits: tensores placeholder de KV compartida sin uso (60 en E2B, 54 en E4B), escalas separadas del router MoE (`ffn_gate_inp.scale` y `ffn_down_exps.scale`) y gammas de RMSNorm con valores de hasta 450x–900x que provocan clipping severo en bloques de 4 bits.

`haven-bake` resuelve estos problemas en tres frentes. Primero, elimina los tensores muertos de KV compartida. Segundo, pliega las escalas del router MoE en los pesos. Tercero, incrusta una rotación de Hadamard QuaRot R2 sobre la dimensión de cabeza (V → O) en las capas SWA de E4B (24/24), 26B-A4B (25/30, omitiendo 5 capas `k_eq_v`) y 31B (50/60, omitiendo 10 capas `k_eq_v`); como el V-RMSNorm de Gemma 4 no tiene parámetros y H es ortogonal, la rotación se cancela en tiempo de ejecución con coste cero. En E2B se optó por `--no-r2` por geometría de una sola cabeza KV. La edición Turbo nativa añade además una FWHT ortogonal por bloques de 256/64 en Q/K/V, FFN y proyecciones MoE, despachada por kernels AVX2 de haven-cpp, que reduce los crest factors y los cliffs de activación en un factor de 16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking preservado (según la model card).
- Comprensión de imágenes mediante encoder de visión multimodal incluido en todos los tamaños.
- Inferencia en CPU sin GPU mediante kernels AVX2.
- Compatibilidad con Ollama, llama.cpp y haven-cpp en la edición Stock.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia en CPU sin GPU: los cuatro tamaños están verificados en un Intel Xeon E-2236 de 6 núcleos sin GPU, con throughput de decodificación entre 1,80 y 18,89 tok/s según tamaño, lo que permite desplegar en servidores sin acelerador.
- Asistentes conversacionales en local: la variante E4B (5,63 GiB) ofrece un equilibrio entre calidad (PPL 5,9685) y huella de memoria, adecuada para escritorios con 10 GB de RAM o más.
- Procesamiento de documentos con imagen: el encoder multimodal incluido permite tareas de descripción y análisis de imágenes directamente con `ollama run ... "describe this image" /ruta/imagen.jpg`.
- Despliegue en entornos con restricciones de memoria: la variante 26B-A4B MoE ocupa 14,21 GiB y activa solo aproximadamente 4B parámetros, lo que reduce el coste por token frente a un denso de tamaño comparable.
- Prototipado e investigación sobre cuantización: los pesos permiten reproducir y comparar las transformaciones de Hadamard y el plegado de escalas frente al modelo base, útil para estudiar el impacto de QuaRot y FWHT en perplejidad.
- Servicio de razonamiento de mayor calidad en CPU: la variante 31B densa (16,82 GiB, PPL 10,9936) es la de mayor calidad de la familia, aunque su decodificación cae a 1,80 tok/s en el hardware de referencia, por lo que se orienta a cargas por lotes o de baja concurrencia.
- Integración en pipelines con Ollama: los tags publicados permiten sustituir directamente el modelo base en flujos existentes sin cambios de runtime, manteniendo compatibilidad con la API de Ollama.

## Benchmarks y rendimiento

Perplejidad medida con `llama-perplexity` en CPU (Intel Xeon E-2236, 6C/12T, AVX2), `n_ctx=512`, `t=12`:

| Modelo | PPL original gemma4-turbo | PPL Gemma 4.5 Stock | Mejora | GGUF texto | GGUF multimodal |
|---|---|---|---|---|---|
| E2B | 8,6825 | 8,6825 | 0,0000 (solo eliminación de KV muerta) | 3,07 GiB | 3,99 GiB |
| E4B | 6,2341 | 5,9685 | -0,266 | 4,71 GiB | 5,63 GiB |
| 26B-A4B MoE | 33,9742 | 33,0918 | -0,882 | 13,10 GiB | 14,21 GiB |
| 31B denso | 11,7080 | 10,9936 | -0,714 | 15,70 GiB | 16,82 GiB |

Throughput en Ollama sobre CPU (Xeon E-2236, `think: false`, `num_ctx: 2048`):

| Tag | Tamaño | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|
| e2b | 4,3 GB | 116,91 | 18,89 |
| e4b (latest) | 6,0 GB | 61,65 | 9,93 |
| 26b | 15 GB | 55,29 | 11,63 |
| 31b | 18 GB | 8,81 | 1,80 |

La edición Turbo nativa (haven-cpp) reporta, frente a los maestros BF16 sin cuantizar, una reducción de la divergencia KL del 19% al 44%, aunque la tabla completa de resultados está truncada en la información disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (IQ4_XS): E2B 3,99 GiB; E4B 5,63 GiB; 26B-A4B 14,21 GiB; 31B 16,82 GiB (todos con mmproj multimodal).
- RAM mínima recomendada por el autor: 8 GB+ para E2B, 10 GB+ para E4B. Para 26B y 31B no se indica cifra explícita, pero el tamaño de fichero marca un mínimo práctico de 16 y 18 GB respectivamente.
- GPU recomendadas: no disponible. El autor valida exclusivamente en CPU (Intel Xeon E-2236, AVX2) y no publica cifras para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no verificada en la información disponible; el foco del proyecto es inferencia en CPU.
- Opciones de despliegue: Ollama (tags oficiales), llama.cpp (edición Stock), haven-cpp (edición Turbo nativa con kernels AVX2).
- Latencia y throughput: ver tabla de la sección anterior; en el hardware de referencia, la decodificación va de 18,89 tok/s (E2B) a 1,80 tok/s (31B).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4.5 Turbo E4B (este repo) | ~4B denso | No disponible | 5,9685 | Apache 2.0 | GGUF en HF, Ollama |
| Gemma 4 E4B original (base) | ~4B denso | No disponible | 6,2341 (IQ4_XS naive) | Apache 2.0 | Pesos originales de Google |
| Gemma 4.5 Turbo 26B-A4B (este repo) | 26B totales / ~4B activos | No disponible | 33,0918 | Apache 2.0 | GGUF en HF, Ollama |
| Gemma 4.5 Turbo 31B (este repo) | 31B densos | No disponible | 10,9936 | Apache 2.0 | GGUF en HF, Ollama |

No se dispone de datos de benchmarks de capacidad que permitan comparar con alternativas de otros fabricantes (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- El proyecto no entrena ni ajusta el modelo: cualquier sesgo, alucinación o limitación de conocimiento de Gemma 4 se hereda íntegramente.
- La model card no documenta sesgos específicos, comportamiento multilingüe ni tasas de alucinación; no disponible.
- La longitud de contexto no se especifica en la información proporcionada, lo que impide planificar cargas con ventanas largas.
- Los benchmarks publicados son de perplejidad sobre un conjunto de calibración propio (`calibration_data.txt`) y de throughput en un único hardware; no son comparables con evaluaciones estándar de capacidad.
- La edición Turbo nativa requiere el runtime haven-cpp con kernels AVX2; no funciona en llama.cpp ni Ollama estándar. La edición Stock sí es compatible con ambos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación independiente de la comunidad.
- El repo ocupa 105,3 GB al incluir las cuatro variantes en formato texto y multimodal; conviene descargar solo el tag necesario.
- Aunque la licencia declarada es Apache 2.0, los pesos derivan de Gemma 4 de Google; conviene verificar los términos del modelo base antes de un uso comercial a gran escala.
- La información de la model card está truncada en la sección de benchmarks de haven-cpp, por lo que los datos de reducción de KL no se pueden reproducir completamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssfdre38/gemma4.5-turbo-gguf
- Repositorio haven-cpp: https://github.com/Haven-AI-Companion/haven-cpp
- Modelo base Gemma 4 26B-A4B: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base Gemma 4 E4B: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base Gemma 4 31B: https://huggingface.co/google/gemma-4-31B-it
