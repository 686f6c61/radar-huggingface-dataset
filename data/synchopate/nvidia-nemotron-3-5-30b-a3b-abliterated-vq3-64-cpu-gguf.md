# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF es un checkpoint GGUF cuantizado del modelo Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16, a su vez derivado de nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 mediante una ablación de rechazo (abliteration) en las proyecciones residuales. Lo publica el usuario Synchopate como una distribución orientada a inferencia en CPU, con un esquema de cuantización propio (LUT-VQ3-64 + Fractal-64) que reduce los 58,84 GiB del BF16 original a 13,30 GiB (14.282.559.488 bytes), pensado para equipos con 16 GB o más de RAM.

El modelo subyacente es un híbrido Mamba-2 y transformer con mezcla de expertos (MoE) dispersa: 52 bloques compuestos por 23 capas Mamba-2 SSM, 23 capas MoE dispersas y 6 capas de atención GQA-2 con Top-6 activo sin podar. El total de parámetros es de 31.577.940.288 (unos 31,6 mil millones), aunque solo una fracción se activa por token gracias al enrutamiento MoE. La variante "Abliterated" desactiva los filtros de rechazo estándar de NVIDIA, lo que la hace relevante para investigación de seguridad, auditoría de vulnerabilidades y desarrollo local offline, pero no para despliegues públicos sin control de acceso.

La relevancia actual radica en dos factores: por un lado, el formato de cuantización vectorial por búsqueda en tabla (LUT-VQ3-64) con bloques de 64 pesos y el esquema Fractal-64, que permiten ejecutar un modelo de 31,6 B en CPU con contexto de hasta 256K; por otro, la dependencia de un runtime parcheado (llama-modchip) que redefine los tipos GGML 42 y 43, lo que rompe la compatibilidad con Ollama, LM Studio, vLLM y llama.cpp sin parchear.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 SSM + transformer con MoE dispersa (52 bloques: 23 Mamba-2, 23 MoE, 6 GQA-2) |
| Parametros totales | 31.577.940.288 (31,6 B) |
| Parametros activos | Top-6 activo por token (sin podar; número exacto de parámetros activos no disponible) |
| Longitud de contexto | Hasta 256K tokens (según model card) |
| Tipos de cuantizacion | LUT-VQ3-64 (tipo GGML 43, 24 B / 64 W) + Fractal-64 (tipo GGML 42, 30 B / 64 W); tamaño 13,30 GiB |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama-modchip), requiere runtime parcheado; no compatible con llama.cpp/Ollama/LM Studio/vLLM sin parche |

## Arquitectura y entrenamiento

La arquitectura subyacente combina capas Mamba-2 de espacio de estados (SSM) con capas de mezcla de expertos dispersa y un pequeño número de capas de atención con GQA-2 (6 capas). El modelo base es nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, del que no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La variante Darkstar aplica una ablación de rechazo en una única dirección ortogonal sobre las proyecciones que escriben en el residual, modificando 2.997 matrices safetensor que corresponden a 76 de los 401 tensores GGUF.

La innovación técnica de este checkpoint es el esquema de cuantización: el script build_nemotron_abliterated_vq3.py re-cuantiza los 76 tensores editados por Darkstar en una sola pasada directamente desde los safetensors BF16 de Darkstar, e incluye token_embd.weight y las 23 capas SSM entre los tensores tratados. El resultado son dos tipos GGML personalizados: Fractal-64 (tipo 42, 30 B / 64 W, que reutiliza el identificador upstream de Q2_0) y LUT-VQ3-64 (tipo 43, 24 B / 64 W, identificador 40 en v2.4). El runtime llama-modchip v2.5.4 incluye binarios portables Linux x86_64 con GLIBC_2.30, variantes AVX-512 y AVX2, verificados por SHA256SUMS, y requiere OpenMP (libgomp1).

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento multi-paso y uso en flujos tipo agente, con soporte declarado para claude-code en las etiquetas del repositorio.
- Capacidades de código y auditoría técnica: la model card reporta 8/8 en una auditoría de seguridad de doble uso con 8 prompts y 100/100 en un test funcional de calidad, coding y tool gate.
- Tool calling / function calling: el "100-Point Functional Quality, Coding, & Tool Gate" sugiere soporte, aunque no se detalla el formato exacto de herramientas.
- Inferencia en CPU con contexto largo (hasta 256K) gracias al esquema de cuantización vectorial.
- Modo "abliterated" / uncensored: sin filtros de rechazo estándar, orientado a investigación de seguridad y CTF.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación de seguridad ofensiva y auditoría de vulnerabilidades: el checkpoint sin filtros de rechazo permite probar prompts de doble uso en entornos controlados; la model card reporta 8/8 en su suite de auditoría técnica de doble uso.
- Desarrollo local offline en estaciones de trabajo sin GPU: con 13,30 GiB en disco y unos 16 GiB de RAM pico a 256K de contexto, cabe en equipos de 16 GB o más con AVX-512 o AVX2.
- Ejecución de agentes de código en CPU: las etiquetas incluyen claude-code y el modelo pasa el gate funcional de coding y tool calling, lo que permite integrarlo en flujos de asistencia a programación en local.
- Procesamiento de documentos largos: la ventana de hasta 256K tokens permite resumir o analizar contratos, informes o bases de código extensas en una sola pasada.
- Evaluación académica de alineación y robustez: la variante abliterated sirve como contrapunto a la versión alineada (Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF) para estudiar diferencias de comportamiento.
- Pruebas de regresión de cuantización: el layout idéntico al twin alineado permite comparar PPL y KLD entre versiones con y sin ablación sobre la misma arquitectura de tensores.
- Despliegue en entornos air-gapped: al ser CPU-only y con binarios portables incluidos, encaja en máquinas aisladas sin acceso a internet.

## Benchmarks y rendimiento

| Suite / Métrica (16C AMD Zen 5) | BF16 real (58,84 GiB) | Fractal-64 (14,36 GiB, alineado) | VQ3-64 (13,30 GiB, alineado) | Abliterated-VQ3-64 (13,30 GiB) |
|---|---|---|---|---|
| WikiText-2 PPL (12.288 tok) | 6,9582 ± 0,24151 | 7,3610 ± 0,26017 | 7,4400 ± 0,26263 | 7,7721 ± 0,28352 (+4,46% vs VQ3-64) |
| KLD de logits vs BF16 (32 sondas) | 0,0000 (ref) | 0,1254 / 0,0929 nats | 0,1495 / 0,0944 nats | 0,1431 / 0,1109 nats (75,0% / 84,4% Top-1) |
| KLD de tensores editados vs VQ3-64 (step-0) | — | — | 0,0000 (ref) | 0,0308 / 0,0312 nats (87,5% / 92,4% Top-1; 100,0% Top-5) |
| Gate decode (Stockfish-PVS E2E, suite 4) | 7,82 tok/s (ref) | 25,02 tok/s (59,1% acc) | 24,18 tok/s (70,2% acc) | ~24,18 tok/s (proxy VQ3) |
| Gate funcional de 100 puntos (calidad, coding, tool) | 100,0 / 100 | 100,0 / 100 | 100,0 / 100 | 100,0 / 100 (proxy VQ3) |
| Auditoría técnica de doble uso (8 prompts) | — | — | 8 / 8 | 8 / 8 (medido directamente) |

Nota de la model card: la PPL, el KLD directo vs BF16, el KLD vs VQ3-64 y la auditoría 8/8 se midieron directamente sobre el GGUF abliterated; el throughput (24,18 tok/s), el VmRSS (16,04 GiB) y el gate 100/100 provienen de eval_nemotron_vq3_64.json como proxy de layout idéntico.

## Requisitos de hardware

- VRAM: no aplica, es un checkpoint para CPU; el requisito es RAM. Pico residente (VmRSS) de ~16,04 GiB a 256K de contexto y ~14,6 GiB con -c 32768 según la model card.
- RAM mínima recomendada: 16 GB o más; el autor indica hosts AVX-512 VBMI de 16 a 59 GB para el twin alineado.
- GPU: no requerida ni soportada por el runtime incluido (binarios Linux x86_64 para CPU).
- CPU: x86_64 con AVX-512 o AVX2; el autor reporta mediciones en un AMD Zen 5 de 16 núcleos.
- Sistema operativo: binarios portables Linux x86_64 con GLIBC_2.30; requiere OpenMP (libgomp1).
- Opciones de despliegue: exclusivamente llama-modchip v2.5.4 (binarios -avx512 o -avx2 incluidos en el repo, verificados por SHA256SUMS) o ./modchip setup desde github.com/synchopate/llama-modchip. No compatible con Ollama, LM Studio, vLLM ni llama.cpp sin parchear.
- Latencia y throughput: ~24,18 tok/s en decode de gate (proxy VQ3) y 25,02 tok/s en Fractal-64 sobre 16C AMD Zen 5; el BF16 de referencia rinde 7,82 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF (este) | 31,6 B (MoE Top-6) | 256K | LUT-VQ3-64 + Fractal-64, 13,30 GiB | openmdw-1.1 | Sin filtros de rechazo; runtime parcheado obligatorio |
| Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF | 31,6 B (MoE Top-6) | 256K | LUT-VQ3-64 + Fractal-64, 13,30 GiB | openmdw-1.1 | Twin alineado en seguridad, mismo layout de tensores |
| HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16 | 31,6 B (MoE Top-6) | No disponible | BF16 (modelo base) | No disponible | Fuente del que se cuantiza este checkpoint |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,6 B (MoE Top-6) | No disponible | BF16, 58,84 GiB | No disponible | Modelo original con alineación de seguridad de NVIDIA |

## Limitaciones y advertencias

- Filtros de rechazo desactivados: la ablación elimina la alineación de seguridad estándar de NVIDIA; no debe exponerse en endpoints públicos, multiusuario o sin autenticación sin control de acceso y filtrado externo.
- Riesgo de alucinación: la PPL en WikiText-2 sube a 7,7721 frente a 7,4400 del twin alineado (+4,46%), lo que indica una degradación adicional de calidad respecto a la cuantización ya de por sí lossy.
- Compatibilidad rota: cargar el checkpoint en Ollama, LM Studio, vLLM o llama.cpp sin parchear provoca fallo inmediato ("unknown tensor type 43" o desajuste de límites de tensores); requiere llama-modchip v2.5.4.
- Dependencia de plataforma: solo hay binarios Linux x86_64 con GLIBC_2.30 y AVX-512/AVX2; no hay soporte GPU ni macOS/Windows documentado.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Licencia openmdw-1.1: conviene revisar los términos del enlace oficial antes de uso comercial; la model card la etiqueta como "other" en Hugging Face.
- Sesgos: no documentados en la información disponible, pero al derivar de un modelo sin filtros de rechazo, los sesgos presentes en los datos de entrenamiento se manifestarán sin atenuación.
- Uso previsto restringido por el autor: investigación de seguridad autorizada, auditoría CTF, evaluación académica y desarrollo local offline; la responsabilidad legal recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF
- Twin alineado en seguridad: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Modelo base (Darkstar abliterated BF16): https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16
- Repositorio del runtime: https://github.com/synchopate/llama-modchip
- Script de construcción: https://github.com/synchopate/llama-modchip/blob/main/scripts/build_nemotron_abliterated_vq3.py
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
