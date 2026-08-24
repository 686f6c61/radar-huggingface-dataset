# waqasm86/vllm-kaggle-binaries

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete binario (wheel) de vLLM, la biblioteca de inferencia y servicio de modelos de lenguaje de alto rendimiento, compilado y validado específicamente para ejecutarse en notebooks de Kaggle con dos GPUs NVIDIA Tesla T4 (arquitectura SM75). El autor, Mohammad Waqas (usuario `waqasm86`), es un ingeniero de sistemas especializado en inferencia acelerada por GPU y despliegue de IA local, y ha empaquetado este wheel a partir del código fuente oficial de vLLM v0.18.1, sin modificarlo ni bifurcarlo.

La relevancia de este artefacto radica en que instalar vLLM en entornos gestionados como Kaggle suele ser problemático por las dependencias de PyTorch y CUDA preinstaladas. Este wheel resuelve ese problema al ofrecer una versión ya compilada y probada en el entorno exacto de Kaggle (Python 3.12, PyTorch 2.10.0+cu128, CUDA 12.8, driver 580.159.04), con validación funcional que incluye inferencia con tensor parallelism (TP=2), persistencia de estados sharded y servidor compatible con la API de OpenAI. No es un modelo de IA, sino una herramienta de infraestructura para ejecutar modelos de IA en un entorno específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un binario de vLLM, no un modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (depende del modelo servido) |
| Tipos de cuantizacion | No aplica (soporta los cuantizados que vLLM maneja, p. ej. FP16, INT8, INT4) |
| Idiomas soportados | No aplica (depende del modelo servido) |
| Licencia | Apache-2.0 (la de vLLM upstream) |
| Formato de pesos | Wheel de Python (CPython 3.12, Linux x86_64) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado, por lo que no tiene arquitectura neuronal ni proceso de entrenamiento. Es un paquete de distribución de vLLM, una biblioteca de inferencia que implementa técnicas como PagedAttention, continuous batching y tensor parallelism para servir modelos transformer de forma eficiente. El wheel se construyó a partir del tag v0.18.1 de vLLM (commit `a26e8dc7ff2111a005144d775ecf9cebf56c45b2b`), y la versión reportada por `setuptools_scm` es `0.18.2.dev0+ga26e8dc7f.d20260822.cu128`, una discrepancia puramente cosmética en la generación de metadatos.

La validación se realizó en un notebook de Kaggle con dos Tesla T4 (SM75), Python 3.12.13, PyTorch 2.10.0+cu128, CUDA toolkit 12.8.93, driver 580.159.04 y NCCL 2.27.5. Se comprobó la importación nativa, inferencia en una sola GPU, comunicación NCCL, inferencia con TP=2 usando Qwen2.5-3B en FP16, persistencia y recarga de `sharded_state`, y el servidor compatible con OpenAI. Dado que FlashAttention 2 no está disponible en SM75, vLLM seleccionó automáticamente `TRITON_ATTN` durante las pruebas, y se observaron avisos de SymmMem esperados en esa arquitectura, sin que afectaran a la comunicación NCCL.

## Capacidades

- Inferencia de modelos de lenguaje de alto rendimiento mediante vLLM, con PagedAttention para gestionar memoria KV cache de forma eficiente.
- Servicio de modelos con API compatible con OpenAI (endpoints `/v1/chat/completions`, `/v1/completions`, etc.).
- Tensor parallelism (TP=2) para distribuir un modelo entre dos GPUs, validado con Qwen2.5-3B en FP16.
- Persistencia y recarga de estados sharded de modelos, útil para checkpointing y despliegue distribuido.
- Soporte de continuous batching para aumentar el throughput en peticiones concurrentes.
- Compatibilidad con el ecosistema de modelos de HuggingFace (cualquier modelo que vLLM soporte, incluyendo arquitecturas transformer, MoE, etc.).
- Selección automática de backend de atención: en SM75 usa `TRITON_ATTN` al no estar disponible FlashAttention 2.

## Casos de uso

- Despliegue de modelos de lenguaje en notebooks de Kaggle: permite servir un modelo como Qwen2.5-3B dentro de un notebook Kaggle con dos T4, aprovechando la GPU gratuita del entorno para experimentación o prototipado.
- Evaluación de modelos en entornos gestionados: investigadores que necesitan probar modelos de hasta ~7B en FP16 (o más con cuantización) en Kaggle sin luchar con la instalación de dependencias.
- Desarrollo de pipelines de inferencia distribuida: el soporte TP=2 validado permite probar técnicas de paralelismo entre tensores en un entorno de dos GPUs antes de escalar a clústeres mayores.
- Integración con herramientas de observabilidad: al ser vLLM, se puede conectar con OpenTelemetry para monitorizar latencia, throughput y uso de memoria en el entorno Kaggle.
- Servicio de API local para aplicaciones de demostración: levantar un endpoint OpenAI-compatible dentro de un notebook para conectar aplicaciones de chat o agentes durante un hackathon o taller.
- Reproducibilidad de experimentos: el checksum SHA256 y el JSON de compatibilidad permiten fijar una versión exacta de vLLM en Kaggle, evitando sorpresas por actualizaciones de paquetes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validación documentada cubre aspectos funcionales (importación, inferencia, TP=2, persistencia, servidor OpenAI) pero no incluye métricas de rendimiento como tokens por segundo, latencia o throughput. El autor no proporciona comparativas con otras versiones de vLLM ni con otros motores de inferencia.

## Requisitos de hardware

- Entorno validado: dos NVIDIA Tesla T4 (16 GB VRAM cada una, arquitectura SM75) en un notebook de Kaggle.
- VRAM estimada: depende del modelo servido; con Qwen2.5-3B en FP16 se necesitan aproximadamente 6-7 GB por GPU, por lo que caben modelos de hasta ~13B en FP16 con TP=2 o modelos mayores con cuantización.
- GPU recomendadas: Tesla T4 (validado), aunque el wheel debería funcionar en otras GPUs con soporte CUDA 12.8 y SM75 o superior, sin garantía del autor.
- Opciones de despliegue: el wheel está pensado para instalarse con `pip --target --no-deps` en Kaggle, evitando reemplazar el stack de PyTorch del entorno. También puede usarse en cualquier Linux x86_64 con Python 3.12 y CUDA 12.8.
- Latencia y throughput: no disponibles; dependen del modelo, la cuantización y la concurrencia.

## Comparativa con modelos similares

No aplica. Este repositorio no es un modelo de lenguaje, sino un binario de inferencia. No existen "modelos similares" en el sentido de pesos neuronales. Como alternativa de instalación de vLLM en Kaggle, se puede comparar con:

| Alternativa | Descripcion | Ventaja | Desventaja |
|---|---|---|---|
| Instalacion oficial de vLLM via pip | `pip install vllm` en el notebook | Version oficial, actualizaciones automaticas | Puede romper dependencias de PyTorch de Kaggle; requiere compilacion en algunos casos |
| vLLM 0.6.3 precompilado (notebook de Kaggle) | Instalacion manual de una version anterior | Probado en Kaggle, mas simple | Version antigua, sin soporte para features recientes |
| Este wheel (v0.18.1) | Compilado y validado en Kaggle con T4 | Version reciente, checksum, validacion TP=2 | No oficial, solo para Python 3.12 y CUDA 12.8 |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos ni puede generar texto por sí mismo; requiere un modelo de HuggingFace descargado por separado.
- No es un binario oficial de vLLM: el autor declara explícitamente que no es un artefacto upstream y que no reclama propiedad sobre vLLM.
- Compatibilidad limitada: solo validado en el entorno exacto de Kaggle (Python 3.12, PyTorch 2.10.0+cu128, CUDA 12.8, driver 580.159.04, dos T4). No se garantiza funcionamiento en otros sistemas.
- FlashAttention 2 no disponible en SM75: vLLM usa `TRITON_ATTN`, lo que puede implicar menor rendimiento que en GPUs más modernas (A100, H100).
- Avisos de SymmMem en SM75: son esperados y no bloquean la comunicación NCCL, pero indican limitaciones de memoria simétrica en la arquitectura.
- Riesgo de dependencias rotas: el autor recomienda usar `pip --target --no-deps` para no reemplazar el stack de Torch de Kaggle; ignorar esta advertencia puede romper el entorno.
- Sin soporte comercial: al ser un artefacto de la comunidad, no hay garantías de mantenimiento ni soporte técnico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/waqasm86/vllm-kaggle-binaries
- Perfil de GitHub del autor: https://github.com/waqasm86
- Proyecto asociado `kaggle-vllm` (documentacion de instalacion): https://github.com/vllm-kaggle/vllm-kaggle-nvidia-dual-t4-gpus
- Repositorio oficial de vLLM: https://github.com/vllm-project/vllm
- vLLM en PyPI: https://pypi.org/project/vllm/
- Notebook de Kaggle "Infer 34B with vLLM" (ejemplo de uso): https://www.kaggle.com/code/cdeotte/infer-34b-with-vllm
- Notebook de Kaggle "vLLM 0.6.3 Install" (instalacion alternativa): https://www.kaggle.com/code/richolson/vllm-0-6-3-install
