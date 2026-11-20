# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF es una cuantizacion GGUF de 13,30 GiB del modelo Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16, a su vez una variante "abliterated" (con los filtros de rechazo desactivados) del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. Lo publica el usuario Synchopate en Hugging Face y esta pensado especificamente para inferencia en CPU con 16 GB de RAM o mas, empleando un esquema propietario de cuantizacion vectorial (LUT-VQ3-64) combinado con un formato Fractal-64.

El modelo conserva la arquitectura hibrida del Nemotron original: 52 bloques compuestos por 23 capas Mamba-2 SSM, 23 capas de mezcla de expertos dispersa (MoE) y 6 capas de atencion GQA-2, con 31.577.940.288 parametros totales y enrutamiento Top-6 activo. La ventana de contexto declarada alcanza los 256K tokens. El checkpoint esta disenado para ejecutarse con el runtime llama-modchip v3.0, un fork de llama.cpp que anade los tipos de tensor personalizados 44 y 45 necesarios para leer este GGUF.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo MoE de 30B puede desplegarse en equipos de consumo sin GPU dedicada, algo poco habitual; por otro, la variante abliterated elimina las negativas de seguridad del modelo original, lo que la orienta a investigacion en seguridad, auditoria de vulnerabilidades y evaluacion academica, no a despliegues publicos sin control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 23 capas Mamba-2 SSM + 23 capas MoE dispersas + 6 capas GQA-2 |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Top-6 expertos activos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | Hasta 256K tokens (segun model card) |
| Tipos de cuantizacion | LUT-VQ3-64 (tipo 45) + Fractal-64 (tipo 44); ~3,75 bpw en tensores Fractal-64 |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (13,30 GiB / 14.282.559.488 bytes) |

## Arquitectura y entrenamiento

La arquitectura es hibrida y combina tres tipos de bloque: 23 capas Mamba-2 de espacio de estados (SSM), 23 capas de mezcla de expertos dispersa con enrutamiento Top-6 y 6 capas de atencion con query grouping GQA-2. Esta mezcla reduce el coste de atencion cuadratica en contextos largos, lo que explica la ventana de 256K tokens declarada. El modelo base es NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, del que no se detallan en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset.

La variante "abliterated" procede de HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16, que desactiva los filtros de rechazo del modelo original. La cuantizacion se realizo en dos fases: los 76 tensores editados por Darkstar (embeddings, salidas SSM, salidas de atencion y proyecciones down de los expertos) se cuantizaron en una sola pasada desde los safetensors BF16, mientras que los 325 tensores no editados se mantienen bit a bit identicos al checkpoint alineado VQ3-64 del mismo autor. El resultado son 401 tensores en total, con 27 tensores en Fractal-64 (tipo 44) y 19 en LUT-VQ3-64 (tipo 45). No se dispone de informacion sobre RLHF, DPO ni otras fases de alineamiento posteriores al entrenamiento base.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla Jinja que activa por defecto un bloque de razonamiento `<think>...</think>`.
- Razonamiento explicito con presupuesto de tokens controlable mediante `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Capacidad declarada para tareas de seguridad ofensiva y auditoria tecnica (8/8 prompts en la suite de auditoria dual-use reportada por el autor).
- Inferencia en CPU pura sobre hosts con 16 GB de RAM o mas, con soporte de instrucciones AVX2 y AVX512.
- Contexto largo de hasta 256K tokens, adecuado para analisis de documentos extensos y conversaciones prolongadas.
- Integracion declarada con Claude Code en los tags del repositorio (soporte de tool calling no verificado en la informacion disponible).
- Soporte multilingue: no disponible.

## Casos de uso

- **Auditoria de seguridad y CTF**: el checkpoint abliterated mantiene la capacidad de responder a prompts tecnicos de seguridad sin filtros de rechazo, lo que lo hace util en entornos controlados de investigacion ofensiva y analisis de vulnerabilidades.
- **Analisis de documentos extensos en equipos sin GPU**: con 256K tokens de contexto y 13,30 GiB en disco, permite procesar manuales, expedientes o bases de codigo completas en un portatil con 16 GB de RAM.
- **Asistente de desarrollo local offline**: se puede integrar en flujos tipo Claude Code para autocompletado, refactorizacion y explicacion de codigo sin enviar datos a servicios externos.
- **Evaluacion academica de alineamiento**: sirve como referencia para estudiar el efecto de la abliteration sobre la calidad del modelo (perplejidad, KLD) frente a la version alineada.
- **Procesamiento por lotes en servidores CPU**: al no requerir GPU, se puede desplegar en granjas de CPU convencionales para tareas de clasificacion, resumen o extraccion de informacion a gran escala.
- **Prototipado rapido en estaciones de trabajo modestas**: permite validar prompts, plantillas de chat y flujos de razonamiento antes de migrar a un despliegue mayor en GPU.
- **Generacion de respuestas con razonamiento controlado**: el bloque `<think>` permite separar el razonamiento interno de la respuesta final, util para pipelines que necesitan trazabilidad del proceso.

## Benchmarks y rendimiento

| Metrica (16 nucleos AMD Zen 5) | BF16 real (58,84 GiB) | Fractal-64 v3.0 (14,36 GiB) | VQ3-64 alineado v3.0 (13,30 GiB) | Abliterated VQ3-64 v3.0 (13,30 GiB) |
|---|---|---|---|---|
| Tamano en disco | 58,84 GiB | 15.420.034.624 B | 14.282.559.040 B | 14.282.559.488 B |
| Perplejidad WikiText-2 (12.288 tok) | 6,9582 ± 0,2415 | 7,3610 ± 0,2602 | 7,4400 ± 0,2626 | 7,7721 ± 0,2835 (+4,46% vs VQ3-64) |
| KLD de logits vs BF16 (32 sondas) | 0,0000 (ref.) | 0,1254 / 0,0929 nats | 0,1495 / 0,0944 nats | 0,1431 / 0,1109 nats (75,0% / 84,4% Top-1) |
| KLD vs VQ3-64 (tensores editados) | — | — | 0,0000 (ref.) | 0,0308 / 0,0312 nats (92,4% Top-1, 100% Top-5) |
| Auditoria de seguridad dual-use (8 prompts) | — | — | 8/8 | 8/8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **RAM**: minimo 16 GB para cargar el GGUF de 13,30 GiB; el autor lo posiciona explicitamente en la categoria de 16 GB.
- **CPU**: se recomienda AVX2 y, preferiblemente, AVX512; las mediciones de referencia se hicieron en un AMD Zen 5 de 16 nucleos.
- **GPU**: no requerida; el checkpoint esta disenado para inferencia en CPU. No se documenta soporte CUDA o Metal para estos tipos de tensor personalizados.
- **Almacenamiento**: 13,30 GiB para el GGUF mas espacio adicional para el runtime.
- **Runtime**: llama-modchip v3.0 (fork de llama.cpp con soporte de los tipos 44 y 45), instalable con `./install.sh --preset nemotron-ablit --accept-abliterated`. Tambien se ofrecen binarios estaticos portables con libgomp y GLIBC 2.30.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| **Este modelo (Abliterated VQ3-64)** | 31.577.940.288 | 256K | 13,30 GiB | openmdw-1.1 | Sin filtros de rechazo, CPU-only |
| NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64 (alineado) | 31.577.940.288 | 256K | 13,30 GiB | openmdw-1.1 | Mismo layout, perplejidad 7,44, con filtros de seguridad |
| NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64 | 31.577.940.288 | 256K | 14,36 GiB | openmdw-1.1 | Mayor fidelidad al BF16 (perplejidad 7,36), mayor tamano |
| NVIDIA-Nemotron-3.5-30B-A3B-BF16 (original) | 31.577.940.288 | 256K | 58,84 GiB | openmdw-1.1 | Referencia de calidad, requiere mucha mas memoria |

## Limitaciones y advertencias

- **Filtros de rechazo desactivados**: la variante abliterated elimina las negativas de seguridad del modelo original; no debe exponerse en endpoints publicos o sin moderacion sin control de acceso y filtrado externo.
- **Degradacion de calidad medible**: la perplejidad en WikiText-2 sube un 4,46% respecto al VQ3-64 alineado (7,7721 frente a 7,4400), y el KLD frente a BF16 es de 0,1431 nats, con solo un 75% de coincidencia Top-1.
- **Dependencia de un runtime no estandar**: requiere llama-modchip v3.0 o binarios equivalentes; no funciona con llama.cpp estandar, Ollama ni vLLM sin conversiones adicionales.
- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion disponible.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; la cuantizacion agresiva (~3,75 bpw en algunos tensores) puede incrementarlo.
- **Idiomas**: no se especifica la cobertura linguistica; el modelo base esta orientado principalmente al ingles.
- **Licencia**: openmdw-1.1; conviene revisar sus terminos para uso comercial, ya que el modelo deriva de un checkpoint abliterated de terceros.
- **Checkpoint legacy**: el propio autor lo marca como reemplazado por la linea MaxQ v3.0; los commits v2.5.x permanecen intactos pero el HEAD migro a los tipos 44/45.
- **Presupuesto de tokens**: con el modo `<think>` activo hay que fijar `max_tokens >= 4096` para evitar respuestas truncadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF)
- [Modelo base: nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Checkpoint abliterated de origen: HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16](https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16)
- [Variante alineada VQ3-64](https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF)
- [Variante Fractal-64](https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF)
- [Variante MaxQ 16GB (alineada)](https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF)
- [Flagship MaxQ 32GB abliterated](https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF)
- [Flagship MaxQ 64GB abliterated](https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF)
- [Runtime llama-modchip](https://github.com/synchopate/llama-modchip)
- [Licencia openmdw-1.1](https://openmdw.ai/license/1-1/)
