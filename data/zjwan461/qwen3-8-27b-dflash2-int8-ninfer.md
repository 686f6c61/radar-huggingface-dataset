# zjwan461/Qwen3.8-27B-DFlash2-int8-ninfer

## Resumen
Qwen3.8-27B-DFlash2-int8-ninfer es un artefacto de inferencia publicado por el usuario zjwan461 en Hugging Face, consistente en una cuantización int8 del modelo multimodal Qwen3.8-27B de Alibaba, empaquetada en el formato propietario `.ninfer` del motor NInfer y combinada con un borrador de decodificación especulativa DFlash2 de z-lab. No se trata de un checkpoint estándar de `transformers` ni de `safetensors`: solo puede ejecutarse con el motor NInfer, lo que lo convierte en una pieza muy específica dentro del ecosistema.

El modelo base es un transformer multimodal de 27 000 millones de parámetros con backbone de texto de 64 capas (24 cabezas de consulta, 4 de clave/valor, dimensión de cabeza 256, atención híbrida lineal/completa), torre de visión de 27 capas y cabeza de predicción multi-token (MTP). El artefacto añade un componente DFlash2 (borrador enmascarado con materializador de KV de contexto fusionado) y una cabeza de propuesta indexada de 131 072 filas para decodificación especulativa.

Su relevancia es acotada pero clara: demuestra que es posible ejecutar un modelo multimodal de 27B en una única GPU de consumo (RTX 4080 SUPER de 32 GB) con throughput de decodificación de 220-230 tok/s en prompts de código, gracias a la combinación de cuantización int8, decodificación especulativa y atención híbrida. Es, sin embargo, un artefacto comunitario no oficial, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida lineal/completa, torre de visión y cabeza MTP; borrador especulativo DFlash2 |
| Parámetros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262 144 tokens (según `--max-context` en el ejemplo de serving) |
| Tipos de cuantización | int8 (Q8 g32) en la mayoría de proyecciones del backbone de texto, Q5/Q6 en algunas; Q4 en torre de visión, cabeza de propuesta y partes del componente MTP; Q8 en el backbone de DFlash2 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor nativo del motor NInfer; no compatible con safetensors, GGUF, transformers, vLLM, llama.cpp ni sglang) |

## Arquitectura y entrenamiento
El backbone de texto es un transformer de 64 capas con 24 cabezas de consulta y 4 cabezas de clave/valor (GQA), dimensión de cabeza 256 y esquema de atención híbrida que combina capas lineales y de atención completa. La torre de visión consta de 27 capas más un módulo merger, lo que habilita el pipeline `image-text-to-text`. Se incluye además una cabeza de predicción multi-token (MTP) de una capa con cabeza compartida, utilizable como alternativa al borrador especulativo.

El artefacto incorpora un componente DFlash2: un borrador enmascarado con materializador de KV de contexto fusionado, pensado para decodificación especulativa con `--draft-tokens` configurables. La cabeza de propuesta indexada (131 072 filas, Q4) se usa con `--lm-head-draft`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base; la model card solo describe la conversión y cuantización, no el entrenamiento. Los bytes de texto, visión y MTP son idénticos a los del artefacto hermano `zjwan461/Qwen3.8-27B-DSpine-int8-ninfer`, lo que permite comparar DFlash2 y DSpine sobre la misma base cuantizada.

## Capacidades
- Generación de texto y razonamiento de propósito general, heredados del backbone Qwen3.8-27B.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión de 27 capas.
- Generación de código: los ejemplos de la model card incluyen funciones de fusión de listas ordenadas y completaciones estilo HumanEval.
- Decodificación especulativa con DFlash2 (`--spec dflash2`) o con la cabeza MTP (`--spec mtp`), con `--draft-tokens` ajustable (7, 8, 15 en las mediciones).
- Modo thinking desactivable (`--no-thinking` en los ejemplos de uso).
- Decodificación greedy y decodificación con CUDA Graphs.
- Contexto largo de hasta 262 144 tokens en modo serving.
- Concurrencia configurable en serving (`--max-concurrency 2` en el ejemplo).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta cobertura multilingüe específica.

## Casos de uso
- Autocompletado de código de baja latencia en estación de trabajo: con 220-230 tok/s de decodificación en prompts de código sobre una RTX 4080 SUPER, el modelo es adecuado para asistentes locales de programación que requieren respuestas casi interactivas sin depender de la nube.
- Servicio local de inferencia multimodal: `ninfer-serve.exe` expone un endpoint HTTP en `127.0.0.1:8080` con contexto de 262 144 tokens, útil para prototipos de aplicaciones que combinan imagen y texto en un entorno controlado.
- Evaluación de decodificación especulativa: el artefacto permite medir la longitud aceptada por ronda de verificación (7,95-10,82 tokens en prompts de código con `--draft-tokens` 7-15) y comparar DFlash2 frente a MTP o DSpine sobre los mismos bytes cuantizados.
- Procesamiento de documentos largos en local: la ventana de 262 144 tokens permite resumir o extraer información de documentos extensos sin fragmentación agresiva, siempre que se disponga del motor NInfer.
- Investigación en cuantización: al ser una receta int8 con mezcla Q4/Q5/Q6/Q8 por componente, sirve para estudiar el impacto de la precisión mixta en calidad y throughput sobre hardware sm_89.
- Despliegue en hardware de consumo con 32 GB de VRAM: escenarios de laboratorio o docencia donde no hay acceso a A100/H100 y se necesita un modelo de 27B multimodal funcional en una única GPU.
- Comparación de motores: útil para equipos que evalúan NInfer frente a vLLM o llama.cpp, aunque la incompatibilidad de formato limita la comparación directa a nivel de artefacto.

## Benchmarks y rendimiento
La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Solo se documentan métricas de decodificación especulativa medidas en RTX 4080 SUPER 32 GB (sm_89), con `--kv-dtype rk4v4-e8`, greedy, thinking off y CUDA Graphs activados:

| Prompt | DFlash2 `--draft-tokens 7-8` (tokens aceptados/ronda) | DFlash2 `--draft-tokens 15` (tokens aceptados/ronda) |
|---|---:|---:|
| Función de fusión de listas ordenadas | 7,95 | 10,53 |
| Completación estilo HumanEval | 7,93 | 10,82 |
| Problema de enunciado escolar | 5,54 | 6,54 |

El throughput de decodificación reportado es de 220-230 tok/s en los prompts de código. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware
- VRAM estimada: el artefacto pesa 19,03 GiB (20 437 521 664 bytes); se midió en una RTX 4080 SUPER de 32 GB, por lo que se necesita al menos esa capacidad para el contexto y la concurrencia probados.
- GPU validadas: RTX 4080 SUPER (sm_89). El motor requiere builds para `sm_89` o `sm_120a`.
- GPU recomendadas: no se documentan A100, H100 ni otras; el artefacto está orientado a sm_89 y sm_120a.
- Cabe en GPU de consumo: sí, en RTX 4080 SUPER de 32 GB según las mediciones del autor.
- Software: CUDA 13.x, MSVC 2022 en Windows, y un build de NInfer que soporte DFlash2 (se cita `zjwan461/ninfer-sm89-windows`, rama `feat/dspine-draft`, commit `4f56dc79`).
- Opciones de despliegue: exclusivamente `ninfer.exe` y `ninfer-serve.exe`. No es compatible con vLLM, llama.cpp, Ollama, TGI, transformers ni sglang.
- Latencia y throughput: 220-230 tok/s de decodificación en prompts de código; longitud aceptada de 5,54 a 10,82 tokens por ronda según prompt y `--draft-tokens`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| zjwan461/Qwen3.8-27B-DFlash2-int8-ninfer | 27B | 262 144 | `.ninfer` | Apache-2.0 | 0 descargas, 0 likes |
| zjwan461/Qwen3.8-27B-DSpine-int8-ninfer | 27B | no disponible | `.ninfer` | Apache-2.0 | artefacto hermano, mismos bytes de texto/visión/MTP |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | Apache-2.0 | modelo original de Alibaba |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | Apache-2.0 | borrador DFlash2 de referencia |

La comparación con alternativas de otros ecosistemas (por ejemplo, modelos de 27B en safetensors o GGUF) no es directa porque este artefacto no puede cargarse en runtimes estándar. El competidor más cercano es el artefacto DSpine del mismo autor, que comparte bytes en texto, visión y MTP y difiere solo en el componente especulativo.

## Limitaciones y advertencias
- Dependencia total del motor NInfer: los pesos son inútiles sin un build que soporte DFlash2 y el contenedor `.ninfer`; ningún runtime estándar (transformers, vLLM, llama.cpp, sglang) puede leerlos.
- No incluye componente DSpine: `--spec dspine` requiere el artefacto hermano.
- No es byte-idéntico a `neroued/Qwen3.8-27B-NInfer`: mismo layout (1190 objetos, 1513 bindings) pero valores cuantizados distintos y SHA-256 diferente.
- Build comunitario no oficial: no está afiliado a Alibaba ni a z-lab; la responsabilidad de la conversión recae en el autor del repositorio.
- Sin datos de benchmarks de calidad: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones multilingües para este artefacto concreto.
- Idiomas no declarados: se desconoce la cobertura lingüística efectiva tras la cuantización.
- Riesgo de alucinación y sesgos: no documentados en la model card; deben asumirse los del modelo base, no evaluados aquí.
- Plataforma restringida: CUDA 13.x, MSVC 2022 y Windows en el build citado; sm_89 o sm_120a.
- Licencia Apache-2.0 permite uso comercial, pero la cadena de atribución (Qwen, z-lab, NInfer) debe respetarse y verificarse en cada despliegue.
- Repositorio sin tracción (0 descargas, 0 likes): no hay validación comunitaria ni soporte.

## Enlaces
- Hugging Face: https://huggingface.co/zjwan461/Qwen3.8-27B-DFlash2-int8-ninfer
- Artefacto hermano DSpine: https://huggingface.co/zjwan461/Qwen3.8-27B-DSpine-int8-ninfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Build NInfer usado: https://github.com/zjwan461/ninfer-sm89-windows (rama `feat/dspine-draft`, commit `4f56dc79`)
- Artefacto upstream de referencia: `neroued/Qwen3.8-27B-NInfer` (sin URL directa en la información proporcionada)
