# Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731 (284.334.567.511 parámetros totales, arquitectura Mixture-of-Experts con 13,17B parámetros activos) publicada por el usuario Synchopate. El objetivo declarado es permitir la inferencia completa del modelo en 64 GB de RAM sin GPU, mediante una combinación de esquemas de cuantización híbridos y kernels específicos para CPU con AVX-512 VBMI.

La publicación no es una cuantización convencional de llama.cpp, sino una compilación "quirúrgica" que combina dos formatos propietarios: `Fractal-64` (`GGML_TYPE_Q2_0`, 3,75 bpw) para las matrices de atención MLA y `LUT-VQ3-64` (`GGML_TYPE_VQ3_0`, 3,00 bpw) para las proyecciones internas de expertos compartidos. Requiere un motor parcheado distribuido por el mismo autor (llama-modchip) y un binario estático para Linux x86_64 o un ejecutable compilado para Windows 11.

Es relevante ahora porque propone ejecutar un MoE fronterizo de casi 285B parámetros en hardware de consumo sin GPU dedicada, algo que hasta la fecha solo era viable con modelos mucho menores o mediante cuantizaciones muy agresivas con pérdida severa de calidad. El repositorio ocupa 60,6 GB y se distribuye en tres fragmentos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA, transformer; cuantización híbrida Fractal-64 + LUT-VQ3-64 |
| Parametros totales | 284.334.567.511 (284,33B) |
| Parametros activos | 13,17B |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de arranque; no se especifica el máximo nativo) |
| Tipos de cuantizacion | Fractal-64 / Q2_0 (3,75 bpw), LUT-VQ3-64 / VQ3_0 (3,00 bpw), Q5_K, Q6_K, IQ1_S, IQ1_M, IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 fragmentos: `-00001-of-00003.gguf` y siguientes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención MLA (Multi-head Latent Attention) y 256 expertos enrutados, con enrutamiento Top-6 descrito como "lossless" en la model card. La cuantización preserva el 100% de las matrices de atención MLA (`attn_q_b`, `attn_output_a`, `attn_output_b`, `attn_kv`, `attn_compressor_*`) en `Fractal-64` a 3,75 bpw, con una relación señal-ruido de cuantización (SQNR) declarada de 17,75 dB y una similitud coseno del 99,15%, sin doble cuantización.

Las capas ancla (bloques 0-4 y 39-42) y todas las proyecciones residuales de salida de expertos compartidos (`ffn_down_shexp`) se mantienen en Q5_K / Q6_K. Las 68 proyecciones pre-SiLU internas de expertos compartidos (`ffn_gate_shexp` y `ffn_up_shexp` de los bloques 5-38) se codifican en `LUT-VQ3-64`, un codebook no uniforme de Lloyd-Max de 8 niveles (24 B / 64 W) decodificado en un ciclo de reloj mediante instrucciones AVX-512 VBMI `vpermb` / `vpermi2b` sobre registros ZMM. Los 256 expertos enrutados usan `SwiGLU-H2` de segundo orden con cuantización analítica IQ1_S / IQ1_M / IQ2_XXS.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados, ni si se aplicaron fases de RLHF o DPO. La model card se centra exclusivamente en el proceso de cuantización, no en el entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento y matemáticas: capacidades heredadas del modelo base DeepSeek-V4-Flash, sin detalle específico en la información disponible.
- Generación de código: la model card menciona integración con `claude-code` y un comando `./modchip claude`, orientado a uso como agente de programación.
- Soporte de agentes: el binario incluye una CLI de agente de un solo comando; se declara compatibilidad con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Caché KV: soporta cuantización de la caché KV (`-ctk q8_0 -ctv q8_0`) y un mecanismo denominado "RouteCrack-KV HARP-Cache" en el motor parcheado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia local sin GPU en estaciones de trabajo: el modelo cabe en 64 GB de RAM con el motor parcheado, lo que permite desplegar un MoE de 284B parámetros en un servidor CPU-only o en un equipo de escritorio con AVX-512.
- Asistente de programación en local: la integración con `claude-code` y la CLI `./modchip claude` permiten usar el modelo como backend de un agente de código sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Servidor de API compatible con OpenAI: el binario `llama-server-modchip-linux-x86_64` expone un endpoint HTTP en el puerto 8080, lo que facilita integrarlo en aplicaciones existentes que ya consumen APIs compatibles.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y caché KV cuantizada en q8_0, puede resumir o extraer información de documentos extensos en una sola pasada.
- Experimentación e investigación en cuantización: el repositorio documenta el script `build_dsv4_vq3.py` y los formatos `Q2_0` y `VQ3_0`, lo que lo convierte en material de referencia para estudiar esquemas de cuantización vectorial en MoE.
- Despliegue en Windows 11: existe un flujo documentado con `AVVIA_DSV4.bat` y un ejecutable precompilado (`v2.4.0-windows-cpu`), útil para equipos de desarrollo con Windows y CPU con AVX-512.
- Evaluación comparativa de cuantizaciones: al preservar atención en alta precisión y comprimir solo expertos internos, sirve para medir el impacto de la cuantización selectiva en tareas de razonamiento frente al modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta métricas de fidelidad de la cuantización (SQNR de 17,75 dB y 99,15% de similitud coseno para las matrices de atención en Fractal-64), no resultados de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- RAM: 64 GB como mínimo para cargar los tres fragmentos (60,6 GB en disco); se recomienda margen adicional para la caché KV y el contexto.
- CPU: se requieren instrucciones AVX-512 VBMI (`vpermb` / `vpermi2b`) para los kernels de decodificación LUT-VQ3-64. Sin AVX-512 VBMI el motor parcheado no podrá decodificar el formato VQ3_0.
- GPU: no necesaria; el diseño es explícitamente CPU-only. No se documenta soporte de offload a GPU.
- VRAM estimada: no aplica para el modo previsto; no disponible para un hipotético modo GPU.
- Sistemas operativos: Linux x86_64 (binario estático incluido) y Windows 10/11 (compilación parcheada o release `v2.4.0-windows-cpu`).
- Opciones de despliegue: `llama-server-modchip` (fork parcheado de llama.cpp distribuido por el autor). No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI, ya que estos no implementan los tipos `GGML_TYPE_Q2_0 = 40` ni `GGML_TYPE_VQ3_0 = 43`.
- Parámetros de arranque recomendados en la model card: `-c 32768 -t 16 -tb 16 -ub 2048 -b 2048 -fa on -ctk q8_0 -ctv q8_0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización / formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF (esta ficha) | 284,33B / 13,17B | 32.768 (usado en el ejemplo) | GGUF híbrido Fractal-64 + LUT-VQ3-64, 60,6 GB | MIT | llama-modchip (CPU con AVX-512 VBMI) |
| DeepSeek-V4-Flash-0731 (modelo base) | 284,33B / 13,17B | no disponible | safetensors (BF16 presumiblemente) | no disponible en la información | Requiere hardware con VRAM agregada muy superior a 64 GB; no disponible el detalle |
| Cuantizaciones GGUF convencionales de MoE de tamaño similar | no disponible | no disponible | Q4_K_M, Q5_K_M, IQ2, etc. | según autor | llama.cpp estándar, Ollama |

No se dispone de datos de benchmarks ni de modelos alternativos concretos con los que establecer una comparación cuantitativa fiable. La comparación con el modelo base se limita a los parámetros y a la licencia, ya que la información proporcionada no detalla las especificaciones completas del modelo original.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: los tipos `GGML_TYPE_Q2_0` y `GGML_TYPE_VQ3_0` solo existen en el fork llama-modchip del autor. El GGUF no cargará en llama.cpp upstream, Ollama, LM Studio, vLLM ni TGI.
- Requisito de CPU con AVX-512 VBMI: procesadores sin `vpermb` / `vpermi2b` (buena parte de AMD Zen anteriores a Zen 4, Intel sin AVX-512 o Apple Silicon) no podrán ejecutar los kernels de decodificación VQ3-64.
- Madurez del proyecto: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el motor se distribuye en versiones `v2.4.0` / `v2.5.0` con scripts de compilación propios; el soporte comunitario y la validación independiente son inexistentes.
- Riesgo de alucinación: inherente al modelo base; no se documenta ninguna mitigación específica ni evaluación de fidelidad factual.
- Pérdida de calidad por cuantización: los expertos enrutados usan IQ1_S / IQ1_M / IQ2_XXS, formatos de muy baja precisión; aunque la atención y las capas ancla se preservan, el impacto en tareas de razonamiento no está medido con benchmarks.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Contexto: el valor de 32.768 tokens corresponde al ejemplo de arranque, no necesariamente al máximo nativo del modelo base; no se documenta el límite real.
- Licencia MIT declarada para la cuantización, pero la licencia y condiciones del modelo base DeepSeek-V4-Flash-0731 no se detallan en la información disponible; conviene verificar las restricciones del modelo original antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la cuantización preserve el rendimiento del modelo base en MMLU, HumanEval, GSM8K u otras tareas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor llama-modchip (GitHub): https://github.com/synchopate/llama-modchip
- Script de construcción de la cuantización: https://github.com/synchopate/llama-modchip/blob/main/scripts/build_dsv4_vq3.py
- Release Windows CPU: https://github.com/MR1KRAKEN/llama-modchip/releases/tag/v2.4.0-windows-cpu
