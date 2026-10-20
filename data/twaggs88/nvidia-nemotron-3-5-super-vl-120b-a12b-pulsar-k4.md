# twaggs88/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-pulsar-k4

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un contenedor listo para servir de `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, publicado por el usuario `twaggs88` (compilación no oficial, no afiliada ni respaldada por NVIDIA). El autor lo empaqueta para **pulsar**, su motor de inferencia para DGX Spark (GB10), con los lineales del decodificador cuantizados a **EXL3 4.0 bpw** y la cabeza de salida a **EXL3 6 bpw**, e incorpora el *block drafter* **LiLiCorr** de NVIDIA en NVFP4 (W4A16) para decodificación especulativa. El contenedor ocupa 59 GB y no requiere descargas adicionales.

El modelo base es un híbrido **Nemotron-H** con capas Mamba-2, atención y mezcla de expertos (MoE), denominado comercialmente 120B-A12B (120.000 M de parámetros totales, 12.000 M activos). Los safetensors de este repositorio suman **62.142.607.562 parámetros**, diferencia coherente con que la model card indica que no se incluyen ni la torre de visión ni la cabeza MTP. El resultado es un contenedor **solo texto**, pese a las siglas "VL" del nombre.

Su relevancia es doble: por un lado, permite ejecutar un modelo de esta familia en hardware de una sola máquina (DGX Spark) con un presupuesto de memoria ajustado; por otro, publica una evaluación de calidad de la cuantización frente a BF16 (KL de chat y coincidencia top-1) que sirve como referencia metodológica. El propio autor lo marca como **experimental**: el soporte de Nemotron-H en pulsar es reciente y tiene errores conocidos, y no lo están usando en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida: capas Mamba-2 (SSM), atención y MoE con expertos compartidos y enrutados (tag `nemotron_h_omni`) |
| Parámetros totales | 62.142.607.562 según safetensors del repo; la denominación comercial del base es 120B (120.000 M) |
| Parámetros activos | 12.000 M (12B) según la denominación A12B del modelo base; no verificado en la información disponible |
| Longitud de contexto | 1.048.576 tokens en la configuración de servicio indicada (`--ctx 1048576`); contexto nativo del base: no disponible |
| Tipos de cuantización | EXL3 4.0 bpw en lineales del decodificador (Mamba in/out, atención, latent fc1/fc2, expertos compartidos y enrutados); EXL3 6 bpw en la cabeza de salida; BF16 en normas, convoluciones, parámetros SSM, router y embeddings (sesgo de selección del router en F32); NVFP4 W4A16 en el drafter LiLiCorr |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors repackados en el contenedor de pulsar (`custom_code`, EXL3); repo de 63,1 GB, 59 GB de pesos |
| Autor / mantenimiento | `twaggs88` (compilación no oficial) |
| Modelos base | `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` y `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr` |
| Modalidad | texto únicamente (torre de visión no incluida) |
| Motor de inferencia | pulsar (rama `dev`, probado en el commit `55fd6587`) |

## Arquitectura y entrenamiento

La arquitectura del base es **Nemotron-H**, un transformer híbrido que intercala capas de espacio de estados **Mamba-2** con capas de atención y bloques **MoE**. La model card del contenedor detalla qué se cuantiza de cada bloque: los lineales de entrada y salida de Mamba, los de atención, los `latent fc1/fc2` y los expertos compartidos y enrutados pasan a EXL3 4.0 bpw; las normas, convoluciones, parámetros SSM, el router y los embeddings se conservan tal como los publica NVIDIA en BF16, con el sesgo de selección del router en F32. La cabeza de salida se mantiene a mayor precisión (EXL3 6 bpw) por su impacto en la distribución de probabilidad.

No hay información sobre datos de entrenamiento (número de tokens, composición del corpus, etapas de RLHF/DPO) en el material proporcionado; la model card remite a las fichas originales de NVIDIA incluidas en el repo (`NVIDIA_MODEL_CARD.md`, `bias.md`, `explainability.md`, `privacy.md`, `safety.md`). La innovación técnica de este contenedor es de **compresión y serving**: cuantización con exllamav3 1.6.2 (250 × 2048 filas de calibración, codebook `mul1`), repackado byte a byte en el formato de pulsar con `SHA256SUMS` por shard, y sustitución de la cabeza MTP (no incluida) por el *block drafter* LiLiCorr en NVFP4, que propone tokens que el modelo principal verifica, de modo que la distribución de salida sigue siendo la del modelo.

## Capacidades

- Generación de texto y conversación multi-turno (tags `text-generation`, `conversational`).
- Ventana de contexto de hasta 1.048.576 tokens en la configuración de servicio documentada, con caché KV volcable a disco (`--kv-disk-space-mb 65536`).
- Modo *thinking* activado por defecto, con plantilla de chat y tokenizador originales de NVIDIA sin modificar.
- Decodificación especulativa mediante el drafter LiLiCorr (NVFP4), pensada para aumentar el throughput sin alterar la distribución del modelo.
- Eficiencia de inferencia por arquitectura MoE: 12.000 M de parámetros activos sobre 120.000 M nominales.
- Capacidades multimodales: **no disponibles** en este contenedor (la torre de visión no está incluida).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado; el modo thinking es el único indicio de razonamiento explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Análisis de corpus documentales largos**: con 1.048.576 tokens de contexto se pueden ingerir contratos, expedientes o bases de código completas en una sola pasada, evitando pipelines de recuperación fragmentada cuando la tarea exige razonamiento sobre el documento entero.
- **Asistente conversacional de sesión larga en local**: el volcado de caché KV a disco (64 GB configurados) permite mantener conversaciones de muchas horas sin reiniciar el contexto, útil en estaciones de trabajo de analistas con requisitos de soberanía de datos.
- **Inferencia en una sola máquina (DGX Spark)**: equipos que no disponen de clúster pueden servir un modelo de la familia Nemotron de 120B nominales gracias a los 59 GB del contenedor y a los 12B de parámetros activos por token.
- **Evaluación de cuantizaciones**: el repo publica la metodología completa (48 conversaciones, logprobs top-64 de vLLM sobre BF16, KL con intervalo de confianza al 95%), lo que lo convierte en un banco de pruebas reproducible para comparar EXL3 frente a NVFP4 en tareas de chat.
- **Prototipado de razonamiento con thinking mode**: para tareas de análisis, planificación o descomposición de problemas donde interesa una cadena de razonamiento explícita antes de la respuesta final.
- **Generación y revisión de código en entornos aislados**: siempre que se valide previamente la calidad del base en la tarea concreta (no hay benchmarks de código publicados para este contenedor), el despliegue local evita enviar código propietario a APIs externas.
- **Reproducibilidad de despliegues**: `SHA256SUMS` cubre todos los shards y la licencia y fichas de NVIDIA se conservan intactas, lo que facilita audits de integridad en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una evaluación de **calidad de cuantización** frente a logits de referencia en BF16 (vLLM, top-64 logprobs) sobre una suite de 48 conversaciones de chat: menor KL implica mayor fidelidad al modelo sin cuantizar.

| Pesos | Tamaño | KL de chat vs BF16 [IC 95%] | Coincidencia top-1 |
|---|---|---|---|
| NVFP4, solo pesos (A16) | 67 GB | 5,18e-2 [4,38; 5,96] | 94,78% |
| NVFP4 W4A16 | 67 GB | 5,64e-2 [4,72; 6,55] | 94,42% |
| NVFP4 W4A4 (modo de servicio por defecto de NVIDIA) | 67 GB | 6,55e-2 [5,47; 7,60] | 93,67% |
| **EXL3 4.0 bpw (pesos de este contenedor)** | **58 GB** | **5,59e-2 [4,64; 6,52]** | **93,89%** |

Según el análisis emparejado por conversación del autor, los pesos EXL3 quedan aproximadamente un 15% más cerca de BF16 que NVFP4 en su modo W4A4 por defecto, empatan con NVFP4 W4A16 y están cerca de un 8% más lejos de BF16 que NVFP4 con activaciones sin cuantizar. No hay datos de throughput ni de latencia publicados.

## Requisitos de hardware

- **VRAM/memoria**: 59 GB de pesos (63,1 GB de repo) más overhead de runtime y caché KV. Con `--kv-disk-space-mb 65536` se reservan 64 GB de caché KV en disco.
- **Plataforma objetivo**: DGX Spark (GB10), única plataforma para la que el autor documenta el motor pulsar. La información disponible no detalla la capacidad de memoria de la máquina, pero el contenedor exige alojar 59 GB de pesos.
- **GPU de数据中心**: por tamaño, requiere aceleradores con 80 GB o más (A100 80 GB, H100 80 GB, RTX PRO 6000 de 96 GB) si se sirviera con otro motor; este contenedor concreto está empaquetado para pulsar, no para vLLM ni TGI.
- **GPU de consumo**: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en tarjetas de 48 GB. Se requiere memoria unificada o agregada por encima de 64 GB.
- **Despliegue**: `pulsar-server -m /ruta/al/repo --drafter lilicorr --host 0.0.0.0 --port 8000`, compilando pulsar desde la rama `dev` (probado en `55fd6587`). El servidor admite `--ctx` y `--kv-disk-space-mb`.
- **Latencia y throughput**: no disponibles. La inclusión del drafter LiLiCorr y el uso de 12B de parámetros activos apuntan a mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos | KL vs BF16 | Licencia | Serving |
|---|---|---|---|---|---|---|
| Este contenedor (EXL3 4.0 bpw + LiLiCorr) | 62,1 B en safetensors (12 B activos) | 1.048.576 configurados | 59 GB | 5,59e-2 | OpenMDW 1.1 | pulsar (DGX Spark) |
| NVFP4 A16 (solo pesos) | 120 B nominales (12 B activos) | no disponible | 67 GB | 5,18e-2 | OpenMDW 1.1 | stack de NVIDIA |
| NVFP4 W4A16 | 120 B nominales (12 B activos) | no disponible | 67 GB | 5,64e-2 | OpenMDW 1.1 | stack de NVIDIA |
| NVFP4 W4A4 (por defecto de NVIDIA) | 120 B nominales (12 B activos) | no disponible | 67 GB | 6,55e-2 | OpenMDW 1.1 | stack de NVIDIA |
| Base BF16 (referencia) | 120 B nominales (12 B activos) | no disponible | no disponible | referencia | OpenMDW 1.1 | vLLM (usado para obtener los logits de referencia) |

No se dispone de información sobre otros modelos de la misma categoría (híbridos SSM/MoE de tamaño comparable) en el material proporcionado, por lo que la comparación se limita a las variantes de cuantización de la misma familia.

## Limitaciones y advertencias

- **Estado experimental**: el propio autor advierte de que el soporte de Nemotron-H en pulsar es nuevo, tiene errores conocidos y no se está usando en producción.
- **Compilación no oficial**: no está afiliada ni respaldada por NVIDIA; la validez de uso depende de las fichas y la licencia originales incluidas en el repo.
- **Sin visión**: pese a las siglas "VL" del nombre, la torre de visión no está incluida; el contenedor es solo texto.
- **Sin cabeza MTP**: la cabeza MTP no se incluye y se sustituye por el drafter LiLiCorr, que solo propone tokens a verificar.
- **Pérdida por cuantización**: KL de 5,59e-2 y coincidencia top-1 del 93,89% frente a BF16; el error puede acumularse en generaciones largas o en tareas de alta precisión (matemáticas, código, extracción literal).
- **Etiqueta de precisión inconsistente**: el tag de HuggingFace indica `8-bit`, mientras que la cuantización real es EXL3 4.0 bpw (aproximadamente 4 bits) en la mayoría de lineales; conviene no fiarse del tag para estimar consumo o calidad.
- **Dependencia de una rama de desarrollo**: requiere compilar pulsar desde `dev` en un commit concreto; la API y el formato pueden cambiar sin aviso.
- **Un solo hardware objetivo documentado**: DGX Spark (GB10). No hay instrucciones para servir este contenedor en otras GPU.
- **Idiomas no documentados**: se desconoce la cobertura lingüística real; la plantilla y el tokenizador son los de NVIDIA, sin adaptación.
- **Sesgos y alucinación**: se heredan los del modelo base; el repo incluye `bias.md`, `safety.md` y `privacy.md` de NVIDIA, que deben revisarse antes de cualquier despliegue.
- **Licencia**: OpenMDW 1.1 con `license: other`; es imprescindible verificar los términos de uso comercial en el enlace oficial antes de producción.
- **Sin benchmarks de tarea**: no hay MMLU, HumanEval ni GSM8K publicados para este contenedor; la única evidencia es la fidelidad al BF16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/twaggs88/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-pulsar-k4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo base con drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Motor de inferencia pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Fichas de NVIDIA incluidas en el repo: `NVIDIA_MODEL_CARD.md`, `NVIDIA_LILICORR_MODEL_CARD.md`, `bias.md`, `explainability.md`, `privacy.md`, `safety.md`, `LICENSE`, `SHA256SUMS`
- exllamav3 1.6.2 (herramienta de cuantización citada, sin enlace en la información disponible): no disponible
- La búsqueda web proporcionada no devolvió enlaces relevantes sobre el modelo (únicamente páginas de eBay sin relación).
