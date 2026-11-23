# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF es una cuantización GGUF de 13,30 GiB del modelo Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16, a su vez una variante "abliterated" (sin filtros de rechazo) del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. Lo publica el usuario Synchopate en Hugging Face y está pensado para inferencia en CPU con 16 GB de RAM o más, empleando un runtime modificado de llama.cpp denominado llama-modchip v3.1.1 con tipos de cuantización propietarios (Fractal-64 y LUT-VQ3-64).

El modelo conserva la arquitectura híbrida del original: 52 bloques que combinan 23 capas Mamba-2 SSM, 23 capas de mezcla de expertos dispersa (MoE) y 6 capas de atención GQA-2, con enrutamiento Top-6 activo sin poda. El checkpoint tiene 31.577.940.288 parámetros totales según los safetensors del modelo base y soporta hasta 256K tokens de contexto, lo que lo hace relevante para despliegues locales de razonamiento largo sin GPU.

La particularidad de esta ficha es doble: por un lado, la cuantización vectorial por bloques de 64 permite comprimir un modelo de ~59 GiB BF16 a 13,30 GiB con una perplejidad en WikiText-2 de 7,7721 frente a 6,9582 del BF16; por otro, la eliminación de los filtros de rechazo lo convierte en un checkpoint de investigación ofensiva y auditoría, no apto para exposición pública sin control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 23 capas Mamba-2 SSM + 23 capas MoE dispersas + 6 capas GQA-2 (52 bloques) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Top-6 expertos activos por token (MoE dispersa, sin poda) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | Fractal-64 (GGML_TYPE_FRACTAL_64 = 44) y LUT-VQ3-64 (GGML_TYPE_VQ3_64 = 45); tensores residuales en Q4_0/Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (13,30 GiB / 14.282.559.488 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida poco habitual: 52 bloques en los que se alternan capas Mamba-2 de espacio de estados (SSM) con capas de mezcla de expertos dispersa y un pequeño conjunto de capas de atención con query grouping (GQA-2). Esta combinación busca reducir el coste de atención en contextos largos manteniendo la capacidad de recuperación de información de un transformer clásico. El enrutamiento MoE mantiene Top-6 expertos activos por token sin poda, lo que preserva la capacidad del modelo original.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización: los 76 tensores que escriben en el residual y que fueron editados por Darkstar (token_embd, 23 ssm_out, 6 attn_output, 23 ffn_down_shexp y 23 ffn_down_exps de 128 expertos) se cuantizan en una sola pasada directamente desde los safetensors BF16 de Darkstar; los 325 tensores no editados son bit a bit idénticos al checkpoint alineado NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64. El resultado es un ABI "zero-collision" (tipos 44/45) que no requiere recómputo respecto a versiones anteriores y que solo funciona en llama-modchip v3.1.1.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla Jinja propia del modelo Nemotron.
- Modo de razonamiento explícito `<think>...</think>` activado por defecto; requiere `max_tokens >= 4096` cuando está habilitado.
- Razonamiento multi-paso y cadenas de pensamiento largas gracias al contexto de hasta 256K tokens.
- Capacidad de código: el checkpoint se etiqueta explícitamente para uso con Claude Code.
- Inferencia en CPU pura con extensiones AVX2 y AVX512.
- Soporte de cuantización vectorial por bloques de 64 valores (VQ3-64) y de tipo fractal (Fractal-64).
- Eliminación de filtros de rechazo (abliterated/uncensored): responde a peticiones que el modelo alineado rechazaría.
- Capacidades multilingües: no disponible en la documentación.
- Tool calling / function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Auditoría de seguridad ofensiva autorizada: el modelo, al carecer de filtros de rechazo, puede generar análisis de vulnerabilidades, payloads de prueba y explicaciones de técnicas de explotación en entornos controlados (CTF, pentesting con permiso escrito). La model card lo restringe explícitamente a este ámbito.
- Investigación académica sobre alineación y refusal: permite estudiar la "geometría de rechazo" comparando las respuestas de esta variante con las del checkpoint alineado VQ3-64, ya que los 325 tensores no editados son idénticos.
- Desarrollo local offline en portátiles o estaciones sin GPU: con 13,30 GiB y 16 GB de RAM, el modelo cabe en equipos de consumo con CPU AMD Zen 5 o similar, sin depender de servicios en la nube.
- Asistente de código en local: la etiqueta `claude-code` sugiere su uso como backend de asistentes de programación que requieren contexto largo (hasta 256K) y razonamiento multi-paso, con la salvedad de que el modo thinking consume muchos tokens.
- Procesado de documentos extensos: la ventana de 256K tokens permite resumir, extraer y razonar sobre contratos, informes o codebases completos en una sola pasada.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un modelo MoE híbrido bajo cuantización vectorial agresiva (PPL 7,77 frente a 6,96 en BF16, +11,7 %).
- Generación de texto creativo sin restricciones de contenido en entornos privados, siempre que se cumplan las obligaciones legales y éticas del usuario.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de calidad de cuantización y de auditoría, medidas en una CPU AMD Zen 5 de 16 núcleos:

| Metrica | BF16 (58,84 GiB) | Fractal-64 (14,36 GiB) | VQ3-64 alineado (13,30 GiB) | Abliterated-VQ3-64 (13,30 GiB) |
|---|---|---|---|---|
| Tamano en disco | 58,84 GiB | 15.420.034.624 B | 14.282.559.040 B | 14.282.559.488 B |
| Perplejidad WikiText-2 (12.288 tok) | 6,9582 ± 0,2415 | 7,3610 ± 0,2602 | 7,4400 ± 0,2626 | 7,7721 ± 0,2835 (+4,46 % vs VQ3-64) |
| KLD de logits vs BF16 (32 sondas) | 0,0000 (ref.) | 0,1254 / 0,0929 nats | 0,1495 / 0,0944 nats | 0,1431 / 0,1109 nats (75,0 % / 84,4 % Top-1) |
| KLD de tensores editados vs VQ3-64 | — | — | 0,0000 (ref.) | 0,0308 / 0,0312 nats (92,4 % Top-1, 100 % Top-5) |
| Auditoría de seguridad dual-use (8 prompts) | — | — | 8 / 8 | 8 / 8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el checkpoint está diseñado para inferencia en CPU. El tamaño del fichero es de 13,30 GiB (14.282.559.488 bytes).
- RAM: mínimo 16 GB; la model card indica "16 GB+ RAM CPU inference". Se recomienda margen adicional para el contexto KV y los buffers del runtime.
- CPU: se requieren extensiones AVX2 o AVX512; las pruebas de referencia se hicieron en un AMD Zen 5 de 16 núcleos.
- GPU: no necesaria. No se documenta soporte de offload a GPU para estos tipos GGUF personalizados.
- Runtime: exclusivamente llama-modchip v3.1.1 (repositorio github.com/synchopate/llama-modchip, release v3.1.1 con binarios estáticos libgomp y GLIBC 2.30). No es compatible con llama.cpp upstream, Ollama, vLLM ni TGI, porque los tipos 44/45 no existen en esos proyectos.
- Instalación: `./install.sh --preset nemotron-ablit --accept-abliterated`.
- Contexto: soporta hasta 256K tokens, pero el consumo de RAM crece con la longitud de contexto; no se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| Este checkpoint (Abliterated-VQ3-64) | 31,58 B totales, Top-6 activos | 256K | 13,30 GiB | openmdw-1.1 | llama-modchip v3.1.1 | Sin filtros de rechazo; PPL 7,77 |
| NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64 (alineado) | 31,58 B totales, Top-6 activos | 256K | 13,30 GiB | openmdw-1.1 | llama-modchip v3.1.1 | Con filtros de rechazo; PPL 7,44 |
| NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64 | 31,58 B totales, Top-6 activos | 256K | 14,36 GiB | openmdw-1.1 | llama-modchip v3.1.1 | Con filtros de rechazo; PPL 7,36 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,58 B totales, Top-6 activos | 256K | 58,84 GiB | openmdw-1.1 | llama.cpp / vLLM | Referencia de calidad; PPL 6,96 |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint "abliterated": los filtros de rechazo del modelo alineado han sido desactivados. Puede generar contenido dañino, ilegal o inseguro. No debe exponerse en endpoints públicos o sin moderación sin control de acceso y filtrado externo.
- Restricción de uso: la model card lo limita a investigación de seguridad autorizada, CTF, auditoría de vulnerabilidades, evaluación académica y desarrollo local offline.
- Licencia openmdw-1.1: es una licencia "other" con términos propios; conviene revisar el texto completo en openmdw.ai antes de cualquier uso comercial.
- Compatibilidad muy restringida: solo funciona con llama-modchip v3.1.1. No hay soporte en llama.cpp upstream, Ollama, vLLM, TGI ni en la mayoría de herramientas del ecosistema. Esto implica dependencia de un fork mantenido por un único autor.
- Tipos GGUF no estándar (44 y 45): cualquier herramienta que inspeccione o convierta el fichero sin conocer estos tipos fallará o producirá resultados incorrectos.
- Degradación de calidad medible: PPL de 7,7721 frente a 6,9582 del BF16 (+11,7 %) y KLD de 0,1431 nats. La cuantización es agresiva y afecta a la fidelidad de la distribución de salida.
- Modo thinking activado por defecto: sin `max_tokens >= 4096` o sin desactivarlo con `chat_template_kwargs={"enable_thinking": false}` / `--reasoning-budget 0`, las respuestas pueden truncarse o consumir muchos tokens.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el modelo base es un LLM de 30B, con la tasa de alucinación esperable en ese rango.
- Sesgos: no documentados en la información disponible; el proceso de abliteración puede alterar la distribución de respuestas de formas no medidas.
- Repositorio con muy poca tracción (1 like, 1.539 descargas) y sin revisión comunitaria amplia: tratar como artefacto de investigación, no como dependencia de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo intermedio abliterated: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16
- Variante alineada VQ3-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Variante Fractal-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Variante MaxQ 16 GB: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Runtime llama-modchip (release v3.1.1): https://github.com/synchopate/llama-modchip/releases/tag/v3.1.1
- Repositorio llama-modchip: https://github.com/synchopat (URL truncada en la model card; el repositorio completo es https://github.com/synchopate/llama-modchip)
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
