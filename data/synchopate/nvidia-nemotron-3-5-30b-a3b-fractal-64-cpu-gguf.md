# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF es una cuantización GGUF del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario Synchopate bajo el identificador Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF. Se trata de una edición orientada a inferencia en CPU (y Apple Silicon) que emplea un tipo de cuantización propietario denominado FRACTAL_64 (enum 44 en el fork llama-modchip), con 46 tensores MoE enrutados a 3,75 bits por peso y un tamaño final de 14,36 GiB (15.420.034.624 bytes). El modelo base es un transformer híbrido de NVIDIA con arquitectura Mamba-2 + Sparse MoE + GQA, 52 bloques y 31.577.940.288 parámetros totales.

El problema que resuelve esta ficha es el de permitir ejecutar un modelo de ~31,6 mil millones de parámetros en equipos sin GPU dedicada de gran capacidad, manteniendo una fidelidad cercana a BF16. Según la model card, la perplejidad en WikiText-2 es de 7,3610 frente a 6,9582 del BF16 (+5,79 %), y el KLD medio frente a BF16 es de 0,1254 nats. El modelo está pensado para despliegues en CPU con AVX2, AVX-512, ARM64 NEON y Apple Silicon Metal, y requiere el fork llama-modchip v3.1.1 para funcionar con el tipo FRACTAL_64.

Es relevante ahora porque demuestra que la cuantización no lineal jerárquica de bloques de 64 puede llevar modelos MoE grandes a un rango de 16 GB de RAM con velocidades de decodificación especulativa superiores a 70 tok/s en hardware de escritorio de gama alta (Threadripper PRO 7985WX) y por encima de 70 tok/s en Apple M4 Max. La licencia es openmdw-1.1, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 52 bloques (23 Mamba-2 SSM + 23 Sparse MoE + 6 GQA-2 Attention) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Top-6 enrutados por token (MoE disperso, sin poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FRACTAL_64 (enum 44, 3,75 bpw, bloques de 64, jerarquía no lineal de 2 niveles); 0 bloques Q2_0 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (14,36 GiB / 15,42 GB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina 23 bloques Mamba-2 (modelo de espacio de estados) con 23 bloques de mezcla de expertos dispersa (Sparse MoE) y 6 bloques de atención GQA-2, sumando 52 bloques en total. La MoE mantiene los 31,6 mil millones de parámetros totales pero activa solo los Top-6 expertos enrutados por token, lo que reduce el coste computacional por token en inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica principal de esta ficha no está en el modelo base sino en la cuantización: FRACTAL_64 es un esquema de cuantización GGUF de bloques de 64 con jerarquía no lineal de dos niveles, definido como tipo 44 en el fork llama-modchip. La model card indica que los 46 tensores MoE enrutados se cuantizan a 3,75 bpw, con 0 bloques Q2_0, y que la versión v3.1.1 mantiene el payload 100 % idéntico en bits a v2.5.4 (SHA256 efee40d7eaea72940ab502418ea6b1dae6cac29ad459687b69b0283d230c38af). El fork incluye decodificación especulativa con presupuesto de tokens `<think>` y kernels nativos AVX-512, AVX2, ARM64 NEON y shaders Metal con register tiling para Apple Silicon M1-M5.

## Capacidades

- Generación de texto conversacional y de prosa, con decodificación especulativa integrada en llama-modchip.
- Razonamiento con modo `<think>` activado por defecto en la plantilla Jinja del modelo base; se puede desactivar con `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Generación de código en C++20 y tareas de refactorización, con velocidades medidas en la model card (41,05 tok/s en Graviton3, 19,04 tok/s en Ryzen 5 5600X).
- Soporte de tool calling y function calling heredado del modelo base Nemotron (no detallado en la información proporcionada).
- Capacidades de agente multi-paso y razonamiento multi-turno, con etiqueta `claude-code` en los tags del repo.
- Capacidades multilingües: no disponible en la información proporcionada.
- Inferencia en CPU pura sin GPU, incluyendo AVX2, AVX-512, ARM64 NEON y Apple Silicon Metal.

## Casos de uso

- Asistente de código en estación de trabajo sin GPU: el modelo se ejecuta en CPU con AVX-512 y ofrece 73,84 tok/s de prosa en un Threadripper PRO 7985WX, suficiente para autocompletado y refactorización interactiva en C++20.
- Programación agéntica en portátil Apple Silicon: con 72,47 tok/s en M4 Max y 57,65 tok/s en M1 Max, el modelo puede sostener bucles de agente con tool calling en un portátil de 16 GB de RAM unificada.
- Servicio de chat conversacional en servidores sin GPU: en AWS Graviton3 m7g.2xlarge (8 vCPU, 31 GB DDR5) se miden 41,05 tok/s, lo que permite desplegar un endpoint de texto en instancias ARM de bajo coste.
- Procesamiento por lotes de documentación técnica: la ventana de contexto no está documentada, pero la decodificación especulativa y el prefill medido (386 tok/s en Threadripper, 101,7 tok/s en Graviton3) permiten procesar lotes de prompts largos en CPU.
- Razonamiento con presupuesto de tokens controlado: el modo `<think>` con `max_tokens >= 4096` sirve para tareas de análisis que requieren cadena de pensamiento, y se puede desactivar para respuestas JSON directas en pipelines automatizados.
- Evaluación de cuantizaciones y reproducibilidad: el repositorio incluye `benchmarks/eval_perplexity_and_kld.py` para reproducir la perplejidad en WikiText-2 y el KLD frente a BF16, útil para validar despliegues antes de producción.
- Sustitución de un modelo BF16 de 31,6 B en entornos con 16 GB de RAM: la ficha ofrece una alternativa de 14,36 GiB con +5,79 % de perplejidad respecto a BF16, adecuada para prototipado en hardware de consumo.

## Benchmarks y rendimiento

Datos de fidelidad de la cuantización (model card):

| Metrica | FRACTAL_64 (14,36 GiB) | VQ3-64 (13,30 GiB) | MaxQ-16GB (13,39 GiB) | BF16 |
|---|---|---|---|---|
| Perplejidad media wiki-alt (40x512) | 6,6533 | 6,7614 | 7,3129 | 6,5962 (ref MXFP4 16,07 GiB) |
| KLD medio vs BF16 (nats) | 0,0688 | 0,0871 | 0,1722 | 0 |
| Perplejidad WikiText-2 (12.288 tok) | 7,3610 ± 0,2602 | no disponible | no disponible | 6,9582 ± 0,2415 |
| KLD logits vs BF16 (nats) | 0,1254 / 0,0929 | no disponible | no disponible | 0 |
| Functional Gate | 100,0 / 100,0 | no disponible | no disponible | no disponible |

Rendimiento de decodificación medido (tok/s):

| Plataforma | Arquitectura | Decodificación | Configuración |
|---|---|---|---|
| AMD Threadripper PRO 7985WX (64C/128T) | x86_64 Zen 4 | 73,84 prosa / 80,14 frío / 111,62 caliente | CPU pura, -t 32, prefill 386,0 tok/s |
| Apple M4 Max | Metal | 72,47 | Shader Metal FRACTAL_64 |
| Apple M3 Max | Metal | 78,60 | Shader Metal FRACTAL_64 |
| Apple M1 Max | Metal | 57,65 | Shader Metal FRACTAL_64 |
| AMD Ryzen 9 9955HX (16C/32T) | x86_64 Zen 5 | 25,02 (Served Gate E2E) | CPU pura, prefill 181,5-306,8 pp512 |
| AWS Graviton3 m7g.2xlarge (8 vCPU) | ARM64 Neoverse-V1 | 41,05 C++20 / 44,97 refactor | CPU pura, prefill 101,7 tok/s |
| AMD Ryzen 5 5600X (6C/12T) | x86_64 Zen 3 (AVX2) | 19,04 C++20 / 21,58 refactor | CPU pura, prefill 63,9 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 14,36 GiB de pesos más overhead de contexto y KV cache; la model card cita ~15,0 GiB en cgroup frío N=1 y ~15,8 GiB en RC2 para la variante MaxQ de 13,39 GiB, por lo que con FRACTAL_64 conviene reservar al menos 16 GB de RAM.
- GPU recomendadas: no aplica de forma nativa; el tipo FRACTAL_64 requiere llama-modchip v3.1.1. Para runners estándar (llama.cpp de32b268c+, Metal, CUDA, Vulkan) el autor remite a la variante MaxQ-16GB.
- Cabe en CPU de consumo: sí, en equipos con 16 GB de RAM o más; validado en Ryzen 5 5600X (6C/12T), Ryzen 9 9955HX, Threadripper PRO 7985WX, AWS Graviton3 y Apple Silicon M1-M5.
- Opciones de despliegue: llama-modchip v3.1.1 (`./install.sh --preset nemotron-fractal`, `./modchip chat`), binarios estáticos GLIBC_2.30 desde la release de GitHub v3.1.1. Para llama.cpp upstream se debe usar la variante MaxQ-16GB.
- Latencia y throughput: prefill entre 63,9 tok/s (Ryzen 5 5600X) y 386,0 tok/s (Threadripper PRO 7985WX); decodificación entre 19,04 y 111,62 tok/s según plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-30B-A3B-Fractal-64 (esta ficha) | 31,6 B (Top-6 activos) | no disponible | 14,36 GiB | openmdw-1.1 | GGUF FRACTAL_64 (enum 44) | Requiere llama-modchip v3.1.1; PPL WikiText-2 7,3610 |
| Nemotron-3.5-30B-A3B-MaxQ-16GB | 31,6 B (Top-6 activos) | no disponible | 13,39 GiB | openmdw-1.1 | GGUF estándar | Compatible con llama.cpp upstream, Metal, CUDA, Vulkan; PPL wiki-alt 7,3129 |
| Nemotron-3.5-30B-A3B-VQ3-64-CPU | 31,6 B (Top-6 activos) | no disponible | 13,30 GiB | openmdw-1.1 | GGUF tipos 44/45 | AVX-512 VBMI CPU-Turbo; PPL wiki-alt 6,7614 |
| Qwen3.8-Flash-Next-MaxQ-32GB / 64GB | 176,5 B | no disponible | 32 / 64 GB | no disponible | GGUF | Alternativa para hosts de 32/64 GB RAM según el autor |

## Limitaciones y advertencias

- Requiere el fork llama-modchip v3.1.1 para el tipo FRACTAL_64 (enum 44); no funciona con llama.cpp upstream sin conversión a la variante MaxQ-16GB.
- La licencia openmdw-1.1 condiciona el uso comercial; es necesario revisar los términos en https://openmdw.ai/license/1-1/ antes de desplegar en producción.
- El modo `<think>` está activado por defecto en la plantilla Jinja; con thinking activo se debe fijar `max_tokens >= 4096` para evitar respuestas truncadas.
- Pérdida de fidelidad respecto a BF16: +5,79 % de perplejidad en WikiText-2 y KLD de logits de 0,1254 / 0,0929 nats; aceptable para prosa y código, pero a validar en tareas sensibles a la precisión numérica.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe sin evaluación previa.
- Longitud de contexto no disponible en la información proporcionada; no se puede planificar el tamaño de KV cache ni el throughput en prompts largos.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información proporcionada.
- El rendimiento depende fuertemente de la plataforma: 19,04 tok/s en Ryzen 5 5600X frente a 111,62 tok/s en Threadripper PRO 7985WX; el dimensionamiento debe hacerse con la plataforma objetivo.
- Repositorio con solo 2 likes y 10.676 descargas en el momento de la consulta; conviene verificar la integridad del SHA256 (3a3a09eac29b5906397ca6a93d2ff0f566fca0bdd365294d067aeb5d0ebf4a1b) tras la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante MaxQ-16GB: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Variante VQ3-64-CPU: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Qwen3.8-Flash-Next-MaxQ-32GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Qwen3.8-Flash-Next-MaxQ-64GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Repositorio llama-modchip: https://github.com/synchopate/llama-modchip
- Release v3.1.1: https://github.com/synchopate/llama-modchip/releases/tag/v3.1.1
- PR Metal FRACTAL_64 #24: https://github.com/synchopate/llama-modchip/pull/24
- Issue Metal #16: https://github.com/synchopate/llama-modchip/issues/16
- Script de evaluación: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/eval_perplexity_and_kld.py
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
