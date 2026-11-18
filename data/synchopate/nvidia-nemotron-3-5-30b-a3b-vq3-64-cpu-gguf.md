# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF es una cuantizacion GGUF del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario Synchopate. El modelo base es un transformer hibrido de NVIDIA que combina capas Mamba-2 (SSM) con capas de mezcla de expertos (MoE) dispersa y atencion GQA-2, disenado para inferencia eficiente en CPU. Esta version concreta emplea tipos de tensor personalizados (`GGML_TYPE_FRACTAL_64 = 44` y `GGML_TYPE_VQ3_64 = 45`) que requieren un runtime parcheado (`llama-modchip v3.0`) y no funcionan con llama.cpp estandar, LM Studio u Ollama.

El objetivo declarado es ofrecer la mayor precision posible en un presupuesto de 16 GB de RAM para inferencia en CPU, con un peso en disco de 13,30 GiB (14.282.559.040 bytes) y soporte de contexto hasta 256K. La cuantizacion combina LUT-VQ3-64 (3,00 bits por peso) y Fractal-64 (3,75 bits por peso) sobre los tensores MoE personalizados.

La relevancia actual radica en la posibilidad de ejecutar un modelo de 31.577.940.288 parametros totales (con Top-6 activo en el MoE) en equipos sin GPU, a velocidades de decodificacion de 24,18 tok/s en un AMD Zen 5 de 16 nucleos segun la model card. Es una propuesta muy especializada: exige hardware AVX-512 VBMI o AVX2 y un binario no estandar, lo que limita su adopcion general pero resulta interesante para entornos de desarrollo con CPU de gama alta y memoria ajustada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 52 bloques (23 Mamba-2 SSM + 23 MoE dispersa + 6 GQA-2 Attention) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Top-6 en el MoE (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | Hasta 256K |
| Tipos de cuantizacion | LUT-VQ3-64 (3,00 bpw) y Fractal-64 (3,75 bpw); tipos GGML personalizados 44 y 45 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (401 tensores, 14.282.559.040 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que intercala 23 bloques Mamba-2 (modelo de espacio de estados) con 23 bloques de mezcla de expertos dispersa y 6 bloques de atencion GQA-2. Esta combinacion busca reducir el coste computacional de la atencion en contextos largos mediante las capas SSM, manteniendo capacidad de modelado con el MoE. El checkpoint cuantizado conserva los 52 bloques y el enrutamiento Top-6 sin podar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del cuantizador se centra en los detalles de la cuantizacion: migracion de cabecera a la ABI `llama-modchip v3.0` sin modificar los bytes de payload (SHA-256 del payload identico al de la version v2.5.4), y preservacion de los tipos upstream `GGML_TYPE_Q2_0 = 42` y `GGML_TYPE_F8_E4M3 = 43`. La innovacion tecnica destacable es el uso de cuantizacion vectorial con tabla de busqueda (LUT-VQ3-64) y un esquema Fractal-64 sobre los tensores MoE, que permiten comprimir a 13,30 GiB manteniendo, segun el autor, una calidad funcional del 100/100 en su bateria de pruebas.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento con modo thinking: la plantilla Jinja por defecto activa `` y expone `reasoning_content`; se recomienda `max_tokens >= 4096` cuando esta activo.
- Desactivacion del razonamiento para respuestas directas o JSON mediante `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Soporte de tool calling y function calling segun la model card (prueba OpenAI Tools marcada como PASS en la variante MaxQ-16GB).
- Uso en flujos de agentes y razonamiento multi-paso (etiqueta `claude-code`).
- Capacidades multilingues: no disponible.
- Vision y audio: no disponibles.
- Inferencia en CPU sin GPU (etiqueta `cpu-inference`), con decodificacion especulativa (`speculative-decoding`).

## Casos de uso

- Desarrollo asistido por agentes en local: el modelo puede integrarse en flujos tipo Claude Code sobre una maquina sin GPU, usando el modo thinking para planificacion multi-paso y el tool calling para ejecutar acciones, con 256K de contexto para mantener el historial del repositorio.
- Generacion de codigo en entornos con RAM limitada: con 13,30 GiB en disco y un pico de RAM de 14,6-16,04 GiB, cabe en estaciones de trabajo de 16 GB y permite autocompletado y refactorizacion sin depender de servicios en la nube.
- Procesamiento de documentos largos: la ventana de hasta 256K tokens y las capas Mamba-2 reducen el coste de atencion, lo que facilita resumir o extraer informacion de contratos, informes o bases de codigo extensas.
- Atencion al cliente automatizada en infraestructura propia: conversaciones multi-turno con contexto largo, ejecutables en servidores CPU sin acelerador, utiles cuando no hay GPU disponible o el coste energetico es prioritario.
- Respuestas estructuradas en JSON para pipelines: desactivando el thinking se obtienen salidas directas aptas para integracion en APIs internas y automatizacion de extraccion de datos.
- Laboratorio de evaluacion de cuantizaciones: sirve para comparar la perdida de calidad de VQ3-64 frente a Fractal-64 y MaxQ-16GB usando las metricas de PPL y KLD publicadas por el autor, en investigacion sobre compresion de modelos MoE.
- Prototipado de asistentes con function calling en portatiles de gama alta: requiere CPU con AVX-512 VBMI o AVX2 y el runtime `llama-modchip`, lo que encaja en equipos de desarrollo controlados.

## Benchmarks y rendimiento

Datos publicados en la model card del cuantizador (16 nucleos AMD Zen 5, sin GPU):

| Metrica | BF16 maestro | Fractal-64 (14,36 GiB) | VQ3-64 (13,30 GiB, este repo) | MaxQ-16GB (13,39 GiB, ggml estandar) |
|---|---|---|---|---|
| PPL `wiki-alt.txt` (40x512) | — | 6,6533 (0,0688 nats KLD) | 6,7614 (0,0871 nats KLD) | 7,3129 ± 0,1923 (0,1722 nats KLD) |
| PPL `WikiText-2` (12.288 tok) | 6,9582 ± 0,2415 | 7,3610 ± 0,2602 (+5,79%) | 7,4400 ± 0,2626 (+6,92%) | — |
| KLD de logits vs. BF16 (32 sondas) | 0,0000 (referencia) | 0,1254 / 0,0929 nats | 0,1495 / 0,0944 nats (85,2% Top-1) | — |
| Throughput de decodificacion en CPU | 7,82 tok/s (N=1) | 25,02 tok/s | 24,18 tok/s (54,43 en TR 9960X; 111,6 en TR 7985WX) | 15,10 tok/s (N=1); 27,80 tok/s con refactor MiniLRU |
| RAM residente pico | 59,40 GiB | 15,6-17,27 GiB | 14,6-16,04 GiB | 14,3040 GiB (limite cgroup de 15,0 GiB) |
| Calidad funcional, codigo y herramientas (100 puntos) | 100,0/100 | 100,0/100 | 100,0/100 (8/8 auditoria de seguridad) | PASS en `merge_intervals`, `MiniLRU` y OpenAI Tools |

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. El pico de RAM residente medido es de 14,6-16,04 GiB, por lo que se recomienda un minimo de 16 GB de RAM.
- GPU: no necesaria. El autor indica que para CUDA, Metal, LM Studio u Ollama sin parches debe usarse la variante MaxQ-16GB con tipos ggml estandar.
- CPU: se requieren instrucciones AVX-512 VBMI o AVX2; el preset `nemotron-vq3` es el predeterminado en hosts de 16 GB con AVX-512 VBMI.
- Cabe en equipos consumer sin GPU con 16 GB de RAM; no esta disenado para GPUs consumer.
- Despliegue: exclusivamente con `llama-modchip v3.0` (binarios Linux x86_64 estaticos con GLIBC_2.30 incluidos en el repo, o `./install.sh --preset nemotron-vq3` desde el repositorio de GitHub del autor). No es compatible con llama.cpp sin parchear, LM Studio ni Ollama.
- Latencia y throughput: 24,18 tok/s de decodificacion en un AMD Zen 5 de 16 nucleos; 54,43 tok/s en Threadripper 9960X y 111,6 tok/s en Threadripper 7985WX, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tipos | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Este modelo (VQ3-64) | 31.577.940.288 totales, Top-6 activo | Hasta 256K | GGUF con tipos 44/45 | openmdw-1.1 | Solo `llama-modchip v3.0` |
| Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF | Mismo modelo base | Hasta 256K | GGUF ggml estandar (<= 42) | openmdw-1.1 | llama.cpp, LM Studio, Ollama, Metal, CUDA |
| Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF | Mismo modelo base | Hasta 256K | GGUF tipo 44 | openmdw-1.1 | `llama-modchip v3.0` |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31.577.940.288 totales | No disponible | BF16 (58,84 GiB) | openmdw-1.1 | Requiere ~59,40 GiB de RAM en CPU |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos de la misma categoria. En terminos de calidad, VQ3-64 presenta una PPL de 6,7614 frente a 6,6533 de Fractal-64 y 7,3129 de MaxQ-16GB en `wiki-alt.txt`, con un tamano intermedio entre ambos.

## Limitaciones y advertencias

- Requiere un runtime no estandar (`llama-modchip v3.0`); no funciona con llama.cpp sin parchear, LM Studio ni Ollama.
- Los tipos de tensor personalizados (44 y 45) rompen la portabilidad: no hay soporte para Metal ni CUDA sin parches.
- Dependencia de instrucciones AVX-512 VBMI o AVX2; en CPUs sin estas extensiones el rendimiento o la compatibilidad pueden verse afectados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingue.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; la model card la etiqueta como `license: other` con enlace a openmdw.ai.
- El modo thinking activado por defecto consume tokens adicionales; con `max_tokens` bajo puede truncar la respuesta. Se recomienda `max_tokens >= 4096` o desactivar el razonamiento.
- El modelo base es de noviembre de 2026 segun las fechas del repositorio; verificar la vigencia del runtime y de los binarios incluidos.
- El repositorio tiene un unico like y 2.796 descargas, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante estandar ggml (MaxQ-16GB): https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Variante Fractal-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Variante Abliterated-VQ3-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF
- Variante 32 GB RAM: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Variante 64 GB RAM: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Repositorio del runtime: https://github.com/synchopate/llama-modchip
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
