# WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3

## Resumen
Qwen3.6-35B-A3B-NVFP4-NInfer-v3 es un artefacto de inferencia publicado por WaveCut para NInfer, un motor de inferencia alternativo a llama.cpp, vLLM o TGI. No se trata de un modelo nuevo, sino de una reempaquetación del modelo base Qwen/Qwen3.6-35B-A3B en un único fichero `.ninfer` de 21,04 GiB, con los pesos de los expertos en NVFP4 procedentes del checkpoint de RedHatAI y el resto de componentes cuantizados de forma selectiva (Q8, Q6, Q4, BF16 y FP32 según la sensibilidad de cada matriz).

El modelo base es un transformer de tipo Mixture of Experts con 35.000 millones de parámetros totales y 3.000 millones activos por token, con una ventana de contexto de 262.144 tokens y capacidad multimodal imagen-texto. La particularidad de esta ficha es que el artefacto está optimizado para GPUs Blackwell (`sm_120a`), aprovechando los tensor cores FP4 para el prefill de los bancos de expertos en W4A4, algo que las arquitecturas Ampere y Ada rechazan explícitamente.

Su relevancia práctica es doble: por un lado demuestra que es posible servir un MoE de 35B con contexto completo de 262.144 tokens en una única RTX 5090 dejando 7,4 GiB libres; por otro, incorpora decodificación especulativa con dos drafters alternativos (MTP y DFlash2), con tasas de decodificación medidas de hasta 919 tok/s en prompts de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida: 10 capas de atención y 30 capas GDN (Gated DeltaNet), según los componentes del artefacto |
| Parametros totales | 35B (modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3B (aproximado por el sufijo A3B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y compartido: FP4 con escala FP8 por cada 16 pesos y divisor FP32 por matriz), Q8 grupos de 32 (atención, GDN, tabla de tokens, cabeza MTP), Q6 grupos de 64 (cabeza de salida), Q4 (cabeza de propuesta, torre de visión en Q4/Q5), BF16 (router, score de experto compartido, controles A/B de GDN, normas, convolución), FP32 (`A_log`, `dt_bias`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (fichero único de 22.586.296.580 bytes; 21,04 GiB; 19,13 GiB de pesos de texto residentes sin visión ni drafters) |

## Arquitectura y entrenamiento
El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 256 expertos enrutados por capa más un experto compartido, distribuidos en 40 capas. La combinación de capas es híbrida: 10 capas usan atención estándar y 30 usan GDN (Gated DeltaNet), un mecanismo de estado recurrente lineal que reduce el coste de memoria KV en contextos largos. El artefacto conserva esa estructura y añade una cabeza MTP (Multi-Token Prediction) para decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Lo que sí está documentado es el proceso de conversión: los expertos NVFP4 se copian código a código desde el checkpoint de RedHatAI sin recuantizar, las proyecciones de atención y GDN se cuantizan a Q8 desde el BF16 base, y el router, las normas y los controles de GDN se mantienen en BF16 o FP32 por sensibilidad numérica. La conversión puede ejecutarse en CPU en unos cuatro minutos con `--device cpu`.

La innovación técnica destacable es la integración de dos drafters en el mismo fichero. El 10 de noviembre de 2026 se añadió DFlash2 (incoai/Qwen3.6-35B-A3B-DFlash2), un draft model de seis capas de ventana deslizante de anchura 2.048 que propone tokens a partir de los estados ocultos del modelo; el modelo verifica cada propuesta, de modo que todo token confirmado es del modelo principal. DFlash2 se entrenó con bloques de ocho posiciones, por lo que admite como máximo siete drafts por ronda.

## Capacidades
- Generación de texto y razonamiento multi-turno con ventana de 262.144 tokens.
- Procesamiento de imágenes: pipeline `image-text-to-text` con torre de visión cuantizada (Q4/Q5 en el cuerpo, Q8 en el merger, Q6 en el patch embedding).
- Tool calling y function calling: la plantilla de chat fijada (`qwen3_6.jinja`) incorpora el formato de herramientas de la familia Qwen3.6, y el servidor expone APIs compatibles con OpenAI y Anthropic en `/v1`.
- Decodificación especulativa con dos modos: MTP (3 drafts recomendados) y DFlash2 (hasta 7 drafts).
- Cabeza de propuesta sobre los 131.072 tokens más frecuentes del ranking de NInfer, en Q4, para acelerar la verificación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso
- Asistencia de código en local sobre una RTX 5090: con MTP y 3 drafts el artefacto decodifica a 829 tok/s en prompts de código, lo que permite autocompletado y generación de funciones completas de forma interactiva sin salir de una GPU de consumo.
- Procesamiento de documentos largos: la ventana de 262.144 tokens con KV en `rk8v4` y estado GDN en FP16 permite analizar contratos, informes o bases de código completas en una sola pasada, sin troceado ni recuperación externa.
- Análisis de capturas y diagramas: la torre de visión integrada admite entradas imagen-texto, útil para extraer datos de gráficos, revisar interfaces o transcribir documentación escaneada.
- Despliegue de agentes con tool calling: el servidor expone endpoints compatibles con OpenAI y Anthropic, de modo que frameworks de agentes existentes pueden apuntar a `http://localhost:8080/v1` sin adaptadores.
- Servicio de inferencia en estación de trabajo con RTX PRO 6000 Blackwell: el artefacto está pensado para `sm_120a` y el prefill W4A4 sobre tensor cores FP4, lo que encaja en entornos de desarrollo con una sola GPU profesional.
- Evaluación comparativa de motores de inferencia: al ser un artefacto reproducible (comando de conversión documentado, revisiones fijadas, `SHA256SUMS`), sirve para medir throughput y latencia de NInfer frente a otras pilas sobre el mismo modelo base.
- Prototipado de decodificación especulativa: la posibilidad de alternar `--spec mtp` y `--spec dflash2` con distintos números de drafts permite caracterizar el compromiso entre tasa de aceptación y throughput según el tipo de prompt.

## Benchmarks y rendimiento
Rendimiento de decodificación medido por el autor en una RTX 5090 (575 W, CUDA 13.4, KV en BF16, todo residente; 400 tokens greedy, dos ejecuciones con desviación inferior al 1%):

| Configuracion | Prompt de codigo | Prompt de prosa | Corpus de benchmark |
|---|---:|---:|---:|
| Sin drafts | 403 tok/s | 403 tok/s | 403 tok/s |
| MTP, 3 drafts | 829 tok/s | 548 tok/s | 497 tok/s |
| DFlash2, 3 drafts | 805 tok/s | 465 tok/s | 427 tok/s |
| DFlash2, 5 drafts | 919 tok/s | 420 tok/s | 350 tok/s |
| DFlash2, 7 drafts | 892 tok/s | 385 tok/s | 455 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El tiempo de arranque del servidor en RTX 5090 con la configuración completa es de 17 segundos.

## Requisitos de hardware
- GPU obligatoria con arquitectura Blackwell `sm_120a`: RTX 50 series o RTX PRO 6000 Blackwell. Las compilaciones `sm_80`, `sm_86` y `sm_89` rechazan los bancos de expertos NVFP4.
- VRAM: el fichero ocupa 21,04 GiB y los pesos de texto residentes 19,13 GiB sin visión ni drafters. En RTX 5090 (32 GB) quedan 7,4 GiB libres con todo cargado, suficiente para KV y estado GDN según la configuración indicada.
- Driver NVIDIA de la rama CUDA 13, versión 580 o superior, más NVIDIA Container Toolkit si se usa Docker.
- Compilación con `CMAKE_CUDA_ARCHITECTURES=120a` y CUDA 13.1 o superior; el commit `a00d1636` de `master` es el mínimo para cargar los bancos NVFP4 de forma nativa, y `ebaad2e26` para `--spec dflash2`.
- Despliegue mediante la imagen `ghcr.io/iamwavecut/ninfer-all` o binario `ninfer-serve`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.ninfer`.
- Flags de referencia: `--max-context 262144 --kv-capacity 262144 --kv-dtype rk8v4 --gdn-state-fp16 --spec mtp --draft-tokens 3 --lm-head-draft --vision`.
- Throughput documentado: 403 tok/s sin drafts y hasta 919 tok/s con DFlash2 y 5 drafts en prompts de código sobre RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3 | 35B totales, 3B activos | 262.144 | `.ninfer` sobre NInfer, solo Blackwell | Apache-2.0 | Hugging Face, 1.995 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | 262.144 | Safetensors BF16, cualquier motor compatible | Apache-2.0 | Hugging Face |
| RedHatAI/Qwen3.6-35B-A3B-NVFP4 | 35B totales, 3B activos | no disponible | NVFP4 en safetensors, orientado a vLLM y TensorRT-LLM | Apache-2.0 | Hugging Face |
| incoai/Qwen3.6-35B-A3B-DFlash2 | drafter de 690.772.992 bytes | no disponible | Draft model para decodificación especulativa | Apache-2.0 | Hugging Face |

La diferencia frente a las alternativas no está en capacidades del modelo, idénticas al base, sino en el empaquetado: un único fichero con texto, visión, MTP y drafter, cuantización mixta por componente y un motor que explota FP4 en prefill. Frente al checkpoint NVFP4 de RedHatAI, este artefacto añade la torre de visión, la cabeza de propuesta y los drafters en el mismo contenedor.

## Limitaciones y advertencias
- Dependencia total de hardware Blackwell: no arranca en A100, H100, RTX 4090 ni RTX 3090. Esto excluye la mayor parte del parque de GPUs de datacenter actual.
- Formato propietario `.ninfer`: requiere NInfer y no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración con pilas existentes.
- El repositorio acumula 1 único like y 1.995 descargas, con autor individual (WaveCut) y sin proceso de revisión por pares; la fiabilidad a largo plazo del proyecto upstream no está garantizada.
- DFlash2 se entrenó con bloques de ocho posiciones: usar más de siete drafts queda fuera de su distribución de entrenamiento.
- Las versiones 2026-11-09.2 y anteriores de NInfer cargan el fichero pero rechazan `--spec dflash2`; hay que verificar la versión antes de desplegar.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la documentación disponible; conviene evaluarlos antes de un uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base y de los checkpoints de origen (RedHatAI, incoai), que también son Apache-2.0 según lo indicado.
- El rendimiento medido corresponde a una RTX 5090 a 575 W con todo residente; configuraciones con offloading o GPUs de menor VRAM no están documentadas.

## Enlaces
- Repositorio del artefacto: https://huggingface.co/WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint NVFP4 de origen: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-NVFP4
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Motor NInfer (upstream): https://github.com/Neroued/ninfer
- Fork NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit mínimo para bancos NVFP4 nativos: https://github.com/iamwavecut/ninfer-all/commit/a00d1636
- Commit mínimo para `--spec dflash2`: https://github.com/iamwavecut/ninfer-all/commit/ebaad2e26
- Instrucciones Docker: https://github.com/iamwavecut/ninfer-all#docker
- Instrucciones de compilación: https://github.com/iamwavecut/ninfer-all#building
