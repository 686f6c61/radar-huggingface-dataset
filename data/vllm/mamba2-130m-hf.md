# vllm/mamba2-130m-hf

## Resumen

`vllm/mamba2-130m-hf` es una copia en formato compatible con Hugging Face Transformers del modelo `mamba2-130m` original de state-spaces, publicada por el equipo de vLLM. El modelo implementa la arquitectura Mamba-2, un modelo de espacio de estados (SSM) estructurado que se presenta como alternativa a los transformers clásicos. Cuenta con 128.989.632 parámetros (aproximadamente 130M) y un tamaño de repositorio de 0,5 GB.

La relevancia de esta ficha es doble. Por un lado, el checkpoint es un ejemplo pequeño y manejable de la familia Mamba-2, útil para experimentación e investigación sobre arquitecturas SSM. Por otro, la copia la mantiene el proyecto vLLM en su cuenta oficial para que su integración continua (CI) disponga de un checkpoint estable, reduciendo el riesgo de cadena de suministro asociado a depender de una cuenta personal.

Conviene señalar que no se trata de un modelo conversacional entrenado con RLHF ni de un asistente al uso: es una conversión de pesos del modelo base de investigación. La model card no documenta datos de entrenamiento, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (modelo de espacio de estados estructurado, SSM) |
| Parametros totales | 128.989.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mamba-2, descrita en el articulo "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality" (Dao y Gu, ICML 2024). Mamba-2 es un modelo de espacio de estados con estructura de dualidad estado-espacio, que reformula el calculo recurrente como una operacion matricial estructurada y permite implementaciones paralelas mas eficientes que las SSM selectivas de Mamba-1. Frente a la atencion cuadratica de los transformers, el coste de inferencia crece de forma lineal con la longitud de secuencia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de alineacion. El repositorio es una conversion de los pesos originales de `state-spaces/mamba2-130m` al formato de Transformers, no un reentrenamiento. La model card indica explicitamente que no esta afiliada a los autores originales ni a Hugging Face.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM` y `generate()`.
- Modelado de lenguaje base (next-token prediction); no se documenta un modo instruct ni chat.
- Procesamiento de secuencias con coste lineal en la longitud, ventajoso en contextos largos frente a atencion cuadratica.
- Compatibilidad con el ecosistema Transformers (`AutoTokenizer`, `AutoModelForCausalLM`).
- Uso como checkpoint de referencia en la CI de vLLM para validar el soporte de Mamba-2.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas SSM: servir como banco de pruebas a escala 130M para comparar Mamba-2 frente a transformers de tamano similar en tareas de modelado de lenguaje.
- Validacion de kernels e integraciones: el checkpoint se usa en la CI de vLLM para verificar que la implementacion de Mamba-2 en el motor de inferencia funciona correctamente tras cada cambio.
- Pruebas de despliegue y serving: al caber en cualquier GPU consumer, permite validar pipelines de vLLM, TGI o llama.cpp con arquitecturas no transformer sin coste de infraestructura elevado.
- Experimentos de eficiencia en secuencias largas: medir latencia y memoria frente a un transformer equivalente para evaluar el escalado lineal del SSM.
- Fine-tuning ligero y prototipado: ajustar el modelo base en dominios concretos (clasificacion de texto, generacion acotada) con recursos modestos antes de escalar a variantes mayores de Mamba-2.
- Educacion y docencia: ejemplo compacto para explicar el funcionamiento interno de una SSM y su conversion al formato Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en bf16/fp16, en torno a 0,26 GB. El overhead de activaciones y cache de estado es reducido a esta escala.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas.
- GPU de datacenter (A100, H100) no necesarias para inferencia; utiles solo para entrenamiento o evaluacion a gran escala.
- Opciones de despliegue: Transformers nativo, vLLM (que mantiene este checkpoint para su CI), y potencialmente otros motores con soporte Mamba-2. El soporte en llama.cpp/Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm/mamba2-130m-hf | 128.989.632 | Mamba-2 (SSM) | no disponible | MIT | Hugging Face |
| state-spaces/mamba2-130m | no disponible | Mamba-2 (SSM) | no disponible | no disponible | Hugging Face (original) |
| AntonV/mamba2-130m-hf | no disponible | Mamba-2 (SSM) | no disponible | no disponible | Hugging Face (conversion origen) |
| Transformers ~130M (p. ej. GPT-2 small) | ~124M | Transformer decoder | 1024 tokens (GPT-2) | MIT (GPT-2) | Hugging Face |

La comparacion con GPT-2 small es orientativa por tamano; no se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base de investigacion a escala 130M: la calidad de generacion sera limitada y no esta pensado para uso en produccion como asistente.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, propio de un modelo de este tamano sin alineacion.
- No se documentan sesgos; al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza u otros.
- Idiomas soportados no documentados; el uso en castellano no esta garantizado.
- Longitud de contexto no especificada en la informacion disponible.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantias de calidad ni de idoneidad para tareas concretas.
- El repositorio es una copia de conveniencia para CI; para trazabilidad conviene referenciar el commit `05e8773` o el modelo original.
- No esta afiliado a los autores originales ni a Hugging Face, segun la propia model card.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/vllm/mamba2-130m-hf
- Conversion de origen: https://huggingface.co/AntonV/mamba2-130m-hf
- Modelo original: https://huggingface.co/state-spaces/mamba2-130m
- Paper Mamba-2 (Dao y Gu, ICML 2024): https://arxiv.org/abs/2405.21060
- vLLM: https://vllm.ai/
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Documentacion vLLM: https://docs.vllm.ai/en/latest/
