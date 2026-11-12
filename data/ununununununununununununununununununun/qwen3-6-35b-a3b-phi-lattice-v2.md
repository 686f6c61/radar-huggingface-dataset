# ununununununununununununununununununun/qwen3.6-35b-a3b-phi-lattice-v2

## Resumen

`qwen3.6-35b-a3b-phi-lattice-v2` es una reconstruccion cuantizada a 4 bits del modelo multimodal `Qwen/Qwen3.6-35B-A3B`, publicada por el usuario `ununununununununununununununununununun`. No se trata de un fine-tune de pesos ni de un modelo entrenado desde cero, sino de un empaquetado del modelo base en formato `phi-lattice v2` que reduce su huella de memoria de 65,39 GiB en BF16 a 18,80 GiB en 4 bits, manteniendo los tensores criticos (embeddings, `lm_head`, routers MoE y normalizaciones) en BF16/FP32.

El modelo base es una arquitectura MoE hibrida con 35,11B parametros totales, 40 capas que combinan Gated-DeltaNet y Gated-Attention, 256 expertos enrutados mas 1 compartido por capa y 8 expertos activos por token. La pipeline declarada es `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto.

Su relevancia practica es que permite ejecutar un MoE multimodal de 35B en una unica GPU de 24 GB (RTX 3090 o RTX 4090) con aproximadamente 5,2 GiB de margen para cache KV y activaciones, gracias a un kernel Triton LUT-GEMM que descomprime solo los 8 expertos activos por token durante el forward.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (Gated-DeltaNet + Gated-Attention), `Qwen3_5MoeForConditionalGeneration` |
| Parametros totales | 35,11B |
| Parametros activos | 8 expertos enrutados de 256 por token (mas 1 compartido); numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (`uint8` nibbles + escalas `fp16`, `group_size = 64`); modos `low_vram_4bit`, `triton_4bit` y `unrolled_bf16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Empaquetado propietario `phi-lattice v2` cargado via `phi_loader.py` (no safetensors estandar ni GGUF) |

## Arquitectura y entrenamiento

El modelo base emplea 40 capas hibridas que alternan Gated-DeltaNet (estado recurrente lineal) y Gated-Attention, con una capa MoE de 256 expertos enrutados mas un experto compartido por capa. Cada token activa 8 expertos enrutados. La capa de salida y el enrutamiento se mantienen en precision original para preservar la estabilidad del enrutamiento. El modelo es multimodal (`image-text-to-text`), con proyecciones lineales de vision incluidas en el bloque de 1,85B parametros cuantizados.

El empaquetado `phi-lattice v2` cuantiza a 4 bits los 80 bancos 3D de expertos (`gate_up_proj` `[256, 1024, 2048]` y `down_proj` `[256, 2048, 512]`, 32,21B pesos) y las proyecciones lineales 2D (1,85B pesos, con `K % 64 == 0`), agrupando en escalas `fp16` de tamano 64. Los tensores protegidos (embeddings, `lm_head`, routers, normas y convoluciones 1D) permanecen en BF16/FP32. Durante el forward, `PhiPacked4BitMoeExperts` descomprime o ejecuta el kernel Triton LUT-GEMM solo para los 8 expertos activos, dejando los otros 248 en almacenamiento 4-bit. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO: el autor solo publica el empaquetado cuantizado, no detalles del entrenamiento del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento de entrada imagen-texto (`image-text-to-text`), con proyecciones de vision cuantizadas incluidas.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6, aunque no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Despliegue de un MoE multimodal de 35B en una sola GPU de 24 GB: el empaquetado 4-bit permite servir el modelo en RTX 3090 o RTX 4090 con 18,80 GiB residentes y unos 5,2 GiB libres para cache KV, habilitando prototipos y demos sin infraestructura multi-GPU.
- Asistentes conversacionales multimodales en local: al aceptar entrada imagen-texto, puede emplearse para responder preguntas sobre capturas, diagramas o documentos escaneados en entornos con requisitos de privacidad donde no se permite enviar datos a la nube.
- Investigacion sobre cuantizacion MoE: el paquete expone tres modos (`low_vram_4bit`, `triton_4bit`, `unrolled_bf16`) que permiten comparar precision y rendimiento entre descompresion selectiva y ejecucion BF16 completa para estudiar el impacto de la cuantizacion en el enrutamiento de expertos.
- Evaluacion de kernels Triton LUT-GEMM: sirve como banco de pruebas para medir el rendimiento del kernel fusionado sobre expertos activos en GPUs consumer frente a alternativas de decodificacion especulativa o `bitsandbytes`.
- Fine-tuning con QLoRA sobre el modelo empaquetado: al reducir el peso residente a 18,80 GiB, deja espacio en una GPU de 24 GB para adaptadores y estados del optimizador en escenarios de ajuste ligero.
- Servicio de inferencia de bajo coste en entornos de investigacion: con licencia Apache 2.0 y pesos descargables, puede integrarse en pipelines experimentales de generacion multimodal sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de huella de memoria y compresion:

| Componente | Parametros | BF16 upstream | `phi-lattice v2` | Compresion |
|---|---:|---:|---:|---:|
| Expertos enrutados 3D (256 por capa, 40 capas) | 32,21B (91,8%) | 60,00 GiB | 15,94 GiB | 3,76x |
| Proyecciones lineales 2D (atencion + experto compartido + vision) | 1,85B (5,3%) | 3,45 GiB | 0,92 GiB | 3,76x |
| Tensores protegidos (embeddings, `lm_head`, routers, normas) | 1,04B (3,0%) | 1,94 GiB | 1,94 GiB | 1,00x |
| Total residente | 35,11B | 65,39 GiB | 18,80 GiB (19.249 MiB) | 3,48x |

No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: 18,80 GiB en los modos `low_vram_4bit` y `triton_4bit`; 65,39 GiB en modo `unrolled_bf16`.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para los modos 4-bit; A100 o H100 para el modo BF16 completo o para mayor margen de cache KV.
- Cabe en GPU consumer: si, en RTX 3090 y RTX 4090 con aproximadamente 5,2 GiB de margen para cache KV y activaciones.
- Opciones de despliegue: carga mediante `phi_loader.load_qwen36_moe_from_packed_4bit` con `transformers`; el kernel Triton requiere GPU CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato empaquetado no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `qwen3.6-35b-a3b-phi-lattice-v2` | 35,11B (MoE, 8 expertos activos) | no disponible | Apache 2.0 | Empaquetado `phi-lattice v2` via `phi_loader.py` | 18,80 GiB en 4 bits, multimodal |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35,11B (MoE, 8 expertos activos) | no disponible | Apache 2.0 | Safetensors BF16 | 65,39 GiB, requiere mas VRAM |
| Alternativas cuantizadas GGUF/AWQ del mismo base | no disponible | no disponible | Apache 2.0 | GGUF / AWQ | No se dispone de datos publicados de esta variante |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo publicado por un autor con identificador no verificable y sin descargas ni likes en el momento de la consulta; la calidad del empaquetado no esta avalada por terceros.
- El repositorio reporta un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el tamano no se ha calculado correctamente; verificar la integridad antes de usarlo en produccion.
- El formato es propietario (`phi-lattice v2`): no es compatible con safetensors estandar, GGUF ni herramientas de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita su portabilidad.
- La cuantizacion a 4 bits de los expertos puede degradar la precision frente al modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma del modelo base en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el empaquetado ni sobre el cumplimiento de la licencia del modelo base.
- No se documentan requisitos de `trust_remote_code` ni auditoria del codigo de `phi_loader.py`; conviene revisar el script antes de ejecutarlo, ya que carga codigo remoto.
- Idiomas soportados no disponibles, lo que impide garantizar calidad en castellano u otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen3.6-35b-a3b-phi-lattice-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
