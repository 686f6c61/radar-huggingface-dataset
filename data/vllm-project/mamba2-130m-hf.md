# vllm-project/mamba2-130m-hf

## Resumen

`vllm-project/mamba2-130m-hf` es una copia en formato compatible con Hugging Face Transformers del modelo `state-spaces/mamba2-130m`, el checkpoint pequeño de la familia Mamba-2 desarrollada por Tri Dao y Albert Gu. El modelo original se publicó junto al paper "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality" (ICML 2024), que introduce el marco de dualidad estado-espacio estructurada (SSD) y la arquitectura Mamba-2. Esta réplica concreta la mantiene el proyecto vLLM para sus pruebas de integración continua, no el autor original.

La relevancia de este checkpoint es fundamentalmente práctica: sirve como referencia ligera (128.989.632 parámetros, unos 0,5 GB en safetensors) para validar soporte de arquitecturas SSM en runtimes de inferencia como vLLM y Transformers. No es un modelo pensado para producción ni para tareas de calidad, sino un banco de pruebas de 130M de parámetros que permite verificar la corrección de kernels, carga de pesos y generación sin necesidad de GPUs de gran capacidad.

Arquitectónicamente es un modelo de espacio de estados (SSM) puro, no un transformer, con atención implícita vía recurrencia lineal. La licencia es MIT, lo que facilita su uso y redistribución. La información pública disponible sobre datos de entrenamiento, contexto y benchmarks es muy escasa, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM estructurado, dualidad estado-espacio SSD) |
| Parametros totales | 128.989.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mamba-2 es una evolución de Mamba (S6) que reformula el SSM selectivo como un caso de atención lineal estructurada, lo que permite implementaciones matriciales más eficientes en GPU. El paper introduce el marco SSD (Structured State Space Duality), que unifica SSM y atención y habilita kernels más rápidos que los de Mamba-1. Este checkpoint de 130M reproduce la configuración pequeña de la familia Mamba-2 publicada por state-spaces.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo original se entrenó presumiblemente con corpus de texto generales, pero la model card de esta copia no lo especifica. La innovación técnica destacable es la propia arquitectura SSD, que ofrece coste lineal en longitud de secuencia frente al cuadrático de la atención estándar, aunque a este tamaño el beneficio práctico es limitado.

## Capacidades

- Generación de texto autoregresiva básica mediante `AutoModelForCausalLM` y `generate`.
- Modelado de lenguaje causal; no se documentan capacidades específicas de razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): ninguna documentada.
- Uso principal como checkpoint de validación de infraestructura (CI de vLLM) más que como modelo funcional de propósito general.

## Casos de uso

- Pruebas de integración continua en vLLM: el repositorio existe precisamente para que el CI de vLLM valide la carga y ejecución de arquitecturas Mamba-2 sin depender de una cuenta personal. Se usaría en pipelines automatizados que comprueban que los kernels SSM producen salidas correctas.
- Validación de conversión de pesos: sirve para verificar que las herramientas de conversión de checkpoints originales (state-spaces) a formato Transformers generan tensores con las formas y nombres esperados.
- Benchmarking de latencia en SSM: al ser un modelo de 130M, permite medir throughput y latencia de implementaciones SSM en GPUs consumer sin agotar memoria, comparando con transformers pequeños equivalentes.
- Docencia e investigación sobre arquitecturas SSM: su tamaño reducido permite estudiar el comportamiento de Mamba-2 en un portátil o GPU modesta, inspeccionando estados internos y dinámica de recurrencia.
- Pruebas de cuantización: al caber en cualquier GPU, es útil para validar flujos de cuantización (por ejemplo, a 8 o 4 bits) sobre arquitecturas no transformer antes de aplicarlos a modelos mayores.
- Desarrollo de tooling de ecosistema: sirve como caso de prueba para librerías que necesitan soportar `mamba2` en `transformers`, como tokenizadores, servidores de inferencia o frameworks de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp32, unos 0,5 GB de pesos más activaciones y caché; en bf16/fp16, aproximadamente 0,26 GB. Cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU para inferencia lenta; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (soporte nativo de `mamba2`), vLLM (motivo de la réplica), y potencialmente llama.cpp si existe soporte de Mamba-2, aunque no está confirmado en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 130M, se espera baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/mamba2-130m-hf | 128.989.632 | no disponible | Mamba-2 (SSM) | MIT | Hugging Face |
| state-spaces/mamba2-130m | ~130M | no disponible | Mamba-2 (SSM) | no disponible | Hugging Face (original) |
| AntonV/mamba2-130m-hf | ~130M | no disponible | Mamba-2 (SSM) | no disponible | Hugging Face (copia origen) |
| GPT-2 small (referencia transformer) | 124M | 1024 | Transformer decoder | MIT | Hugging Face |

La comparación con GPT-2 small es la más natural por tamaño, aunque la arquitectura y el propósito difieren: GPT-2 small es un modelo entrenado para calidad de generación, mientras que este checkpoint es una réplica de infraestructura. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo entrenado para calidad: es una copia de un checkpoint pequeño de investigación, sin ajuste fino documentado para tareas concretas.
- Riesgo elevado de alucinación y generación incoherente por su tamaño (130M) y falta de información sobre su entrenamiento.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no disponible; no se debe asumir una ventana larga pese a la naturaleza SSM de la arquitectura.
- Licencia MIT permite uso comercial, pero el autor de la réplica no ofrece garantías sobre el modelo original ni sobre su idoneidad.
- El repositorio declara explícitamente no estar afiliado a los autores originales ni a Hugging Face; la cadena de responsabilidad sobre los pesos es indirecta.
- No usar en producción para tareas de usuario final sin evaluación previa; su propósito es CI y validación de infraestructura.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/vllm-project/mamba2-130m-hf
- Modelo original: https://huggingface.co/state-spaces/mamba2-130m
- Copia de referencia: https://huggingface.co/AntonV/mamba2-130m-hf
- Paper Mamba-2 (ICML 2024): https://arxiv.org/abs/2405.21060
- Repositorio state-spaces/mamba: https://github.com/state-spaces/mamba
- Proyecto vLLM: https://github.com/vllm-project/vllm
