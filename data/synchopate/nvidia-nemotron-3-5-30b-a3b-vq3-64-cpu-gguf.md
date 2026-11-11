# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF es una cuantización GGUF del checkpoint `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario Synchopate. El modelo base es un transformer híbrido de NVIDIA que combina capas de atención densa, capas de espacio de estados Mamba-2 y 23 capas de mezcla de expertos (MoE) enrutadas, con 31.577.940.288 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí la designación A3B).

El objetivo de esta publicación no es el modelo en sí, sino el formato de compresión: un esquema de cuantización híbrido denominado "Surgical Hybrid" que combina bloques de vector quantization de 3 bits (`LUT-VQ3-64`, 3,00 bpw) en las proyecciones de expansión internas de las capas MoE con un formato de 2 bits (`Fractal-64`, 3,75 bpw) en las proyecciones que escriben directamente en el flujo residual. El resultado es un archivo de 13,30 GiB que, según el autor, mantiene paridad de calidad con BF16 y Q4_0 en una batería de evaluación de 100 puntos, con un consumo de RAM residente de 16,04 GiB.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva orientada a inferencia en CPU pura con kernels AVX-512 VBMI; por otro, sirve como referencia de un modelo híbrido Mamba-2/MoE de NVIDIA del que se dispone de pocos datos públicos verificables en la información proporcionada. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención densa + Mamba-2 SSM + MoE (23 capas enrutadas) |
| Parámetros totales | 31.577.940.288 (~31,6 B) |
| Parámetros activos | ~3 B por token (designación A3B) |
| Longitud de contexto | 262.144 tokens (256K, según el comando de ejemplo del autor) |
| Tipos de cuantización | GGUF híbrido: `LUT-VQ3-64` (GGML_TYPE_VQ3_0 = 43, 3,00 bpw), `Fractal-64` (GGML_TYPE_Q2_0 = 40, 3,75 bpw), `Q4_0`, `Q8_0`, `F32` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único de 13,30 GiB; repo de 14,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que intercala atención densa, capas Mamba-2 (SSM) y 23 capas de mezcla de expertos enrutadas. La publicación no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben considerarse no disponibles en esta ficha. La innovación técnica documentada aquí pertenece a la cuantización, no al entrenamiento.

El esquema "Surgical Hybrid" explota la esparsidad de activación que induce la función `Squared ReLU` (`ReLU²(x) = max(0, x)²`) en las 23 capas MoE, que según el autor anula más del 50 % de las preactivaciones. Sobre esa base, aplica dos formatos distintos según la posición de la capa: las proyecciones de expansión internas (`blk.6..47.ffn_up_exps.weight`, antes de `ReLU²`) se comprimen con `LUT-VQ3-64`, que empaqueta 128 centroides Lloyd-Max 3D (7 bits por cada 3 pesos) decodificados en un ciclo de reloj mediante seis registros ZMM AVX-512 y la instrucción `VPERMI2B`; las proyecciones de salida residual (`blk.*.ffn_down_exps.weight`) y las capas MoE ancla (`blk.1, 3, 49, 51`) se conservan en `Fractal-64` a 3,75 bpw. Atención densa, Mamba-2 y expertos compartidos se mantienen en `Q4_0`, `Q8_0` o `F32`. El autor reporta 17,75 dB de SQNR y 99,15 % de similitud coseno frente a BF16 en las proyecciones residuales.

## Capacidades

- Generación de texto conversacional en formato multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y código: la model card menciona una "100-Point Quality, Coding & Tool Gate" superada con 100/100, lo que sugiere evaluación de coding y tool use, aunque no se detallan las tareas.
- Soporte de tool calling / function calling: mencionado explícitamente en la batería de evaluación y en el tag `claude-code`.
- Integración con agentes: el autor incluye un CLI (`./modchip claude`) orientado a flujos de agente tipo Claude Code.
- Decodificación especulativa: el motor incluye un drafter Stockfish-PVS de 1,64 MB para acelerar la decodificación.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia en CPU sin GPU: el formato está diseñado para ejecutarse en servidores x86_64 con AVX-512 VBMI y 16 GiB de RAM, lo que permite desplegar un modelo de ~31,6 B en máquinas sin acelerador dedicado.
- Asistentes de código en estación de trabajo: la integración con `claude-code` y el soporte de tool calling permiten usar el modelo como backend local de un agente de programación.
- Procesamiento de documentos largos: con 256K tokens de contexto, es adecuado para resumir o consultar repositorios completos, expedientes o bases de conocimiento extensas en una sola pasada.
- Atención al cliente multi-turno: la ventana de 256K y el formato conversacional permiten mantener historiales largos sin truncamiento agresivo.
- Despliegue en entornos con restricciones de memoria: 16,04 GiB de RSS residente frente a 59,40 GiB del BF16 facilita ejecución en instancias cloud de gama media.
- Evaluación de técnicas de cuantización: útil para investigadores que comparan formatos VQ frente a Q4_0/Q8_0 en modelos híbridos Mamba-2/MoE.
- Servidor local de API compatible con endpoints: el binario `llama-server-modchip` expone un servidor HTTP en el puerto 8080, apto para prototipos y pruebas de integración.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, referidos a tamaño, memoria y velocidad, no a benchmarks académicos (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks estándar en la información disponible.

| Métrica | BF16 (referencia) | Q4_0 | Fractal-64 (v2.4.0) | Surgical Hybrid VQ3-64 (v2.5.0) |
|---|---|---|---|---|
| Tamaño en disco | 59,00 GiB | 19,86 GiB | 14,35 GiB | 13,30 GiB |
| RAM residente (VmRSS) | 59,40 GiB | 21,71 GiB | 17,27 GiB | 16,04 GiB |
| Decode puro (tg128, 16c Zen 5) | 7,82 tok/s | 19,54 tok/s | 22,25 tok/s | 22,44 tok/s |
| Decode E2E (Stockfish-PVS) | 7,82 tok/s | 19,54 tok/s | 25,02 tok/s | 24,18–60,40 tok/s |
| Quality/Coding/Tool Gate (100 pts) | 100,0 | 100,0 | 100,0 | 100,0 |

## Requisitos de hardware

- RAM: al menos 16,04 GiB residentes para el modelo VQ3-64; se recomienda 24–32 GiB para margen del sistema operativo y del servidor.
- CPU: x86_64 con AVX-512 VBMI (`VPERMI2B`); el autor cita un AMD Zen 5 de 16 núcleos como plataforma de referencia.
- GPU: no necesaria; el formato está optimizado para CPU pura. No se documenta soporte CUDA.
- Consumer GPU: no aplica como requisito; no se han publicado pruebas en RTX 4090, A100 o H100 para este GGUF.
- Despliegue: binario `llama-server-modchip-linux-x86_64` incluido en el repo; compatible con `llama.cpp` (tipos GGML personalizados 40 y 43 requieren el fork del autor).
- Latencia y throughput: 22,44 tok/s en decode puro a 16 hilos; 24,18–60,40 tok/s con decodificación especulativa Stockfish-PVS, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64 (esta ficha) | 31,6 B totales / ~3 B activos | 256K | GGUF híbrido 3,00–3,75 bpw | MIT | Hugging Face (Synchopate) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,6 B totales / ~3 B activos | no disponible | BF16 safetensors | no disponible | Hugging Face (nvidia) |
| Cuantización Q4_0 del mismo modelo base | 31,6 B totales / ~3 B activos | 256K | GGUF Q4_0 (19,86 GiB) | MIT (derivada) | Referencia interna del autor |
| Fractal-64 del mismo modelo base | 31,6 B totales / ~3 B activos | 256K | GGUF Q2_0 (14,35 GiB) | MIT (derivada) | Referencia interna del autor |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño y arquitectura equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3,00–3,75 bpw introduce pérdida de precisión; el autor reporta 99,15 % de similitud coseno frente a BF16 en proyecciones residuales, pero no hay evaluación independiente.
- Los tipos GGML 40 (`Q2_0`) y 43 (`VQ3_0`) son extensiones del fork `llama-modchip`; `llama.cpp` upstream, Ollama o vLLM no los soportan de forma nativa.
- Requiere CPU con AVX-512 VBMI; en procesadores sin esa extensión el rendimiento caerá drásticamente o el binario no funcionará.
- La evaluación de calidad es una batería propia de 100 puntos del autor, no benchmarks estándar; no es verificable de forma independiente.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria.
- Aunque la licencia declarada es MIT, conviene verificar la licencia del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` antes de uso comercial, ya que la información proporcionada no la detalla.
- El tamaño del repo (14,3 GB) incluye el binario precompilado además del GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio del motor y kernels: https://github.com/synchopate/llama-modchip
- Script de construcción: https://github.com/synchopate/llama-modchip/blob/main/scripts/build_nemotron_vq3.py
- Paper, blog o demo oficial: no disponible
