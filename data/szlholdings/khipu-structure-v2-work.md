# SZLHOLDINGS/khipu-structure-v2-work

## Resumen

khipu-structure-v2-work es un ajuste fino (fine-tuning) supervisado del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario SZLHOLDINGS y publicado en Hugging Face. Se trata de un modelo derivado de la familia Qwen3, que emplea una arquitectura transformer densa con aproximadamente 1.700 millones de parametros y capacidades de razonamiento nativas (modo thinking) heredadas del modelo base. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando la libreria TRL en su version 1.18.1.

El modelo no cuenta con informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni los objetivos especificos del ajuste. La model card es practicamente una plantilla generada automaticamente por TRL, sin documentacion adicional sobre el proceso. El nombre "khipu-structure" sugiere un enfoque en tareas de estructura o extraccion estructurada, pero no hay confirmacion tecnica en la informacion disponible.

Su relevancia actual es limitada: se trata de un modelo recien publicado (noviembre de 2026) sin descargas ni interacciones, sin licencia declarada y sin benchmarks. Resulta util como referencia para quien quiera evaluar ajustes finos sobre Qwen3-1.7B, pero no como modelo de produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | ~1.700 millones (1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen3-1.7B soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (repo de 4,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso decoder-only de la familia Qwen3, que incorpora mecanismos de atencion estandar y un modo de razonamiento explicito (thinking mode) en el modelo base. Sobre esta base se aplico un ajuste fino supervisado (SFT) mediante TRL 1.18.1, con Transformers 5.23.0, PyTorch 2.14.1+cu126, Datasets 5.2.0 y Tokenizers 0.23.3.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO posterior ni innovaciones tecnicas adicionales. La model card no documenta hiperparametros, duracion del entrenamiento ni criterios de evaluacion. El unico elemento diferencial documentado es una tarjeta holografica determinista ("szl-holo-card/v1.1") generada a partir del SHA del head del repositorio, firmada por SSH, que no aporta capacidades funcionales al modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-1.7B.
- Razonamiento en modo thinking (si el ajuste SFT preserva la plantilla de chat de Qwen3; no confirmado).
- Generacion de codigo y matematicas basicas, segun las capacidades del base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el modelo base Qwen3 soporta varios idiomas, pero no hay confirmacion para este ajuste.
- Capacidades especiales (vision, audio): no disponibles; el base es solo texto.

## Casos de uso

- Extraccion de informacion estructurada: dado el nombre "structure", el modelo podria emplearse para convertir texto libre en JSON o esquemas predefinidos, aunque requiere validacion empirica antes de usarlo en produccion.
- Prototipado rapido de asistentes conversacionales: su tamano de 1.7B permite desplegarlo en una unica GPU consumer para pruebas de concepto con la plantilla de chat de Qwen3.
- Clasificacion y etiquetado de textos: fine-tuning adicional sobre este checkpoint para tareas de clasificacion en dominios especificos, aprovechando la base ya ajustada.
- Generacion de codigo en entornos con recursos limitados: el modelo cabe en GPUs de 8-12 GB en cuantizacion de 8 bits, adecuado para autocompletado o generacion de scripts.
- Educacion y experimentacion academica: util como caso de estudio de pipelines SFT con TRL sobre modelos pequenos.
- Evaluacion comparativa de ajustes finos: sirve como referencia para medir el impacto de un SFT sobre Qwen3-1.7B frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en FP16/BF16 (1.7B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: ~1,8 GB; en 4 bits: ~1 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 6-8 GB de VRAM en FP16.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| khipu-structure-v2-work | 1.7B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.7B | 32.768 tokens (segun documentacion del base) | Apache 2.0 (segun el base) | Hugging Face (ampliamente usado) |
| Llama 3.2 1B | 1.2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| Gemma 2 2B | 2.6B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

No hay datos de rendimiento comparativo para khipu-structure-v2-work; la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "licence: license" sin especificar terminos; no se puede asumir uso comercial permitido.
- Sin documentacion del dataset de entrenamiento: riesgo de sesgos desconocidos y de comportamientos no alineados.
- Riesgo de alucinacion inherente a modelos de 1.7B, especialmente en tareas de razonamiento complejo.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base ni de regresion en capacidades.
- Sin confirmacion de soporte multilingue ni de tool calling.
- Modelo sin descargas ni validacion comunitaria: no recomendado para produccion sin evaluacion propia.
- El nombre sugiere una especializacion en estructura que no esta documentada; no asumir esa capacidad sin pruebas.
- La fecha de creacion (2026) y la falta de metadatos adicionales impiden verificar la procedencia y calidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-structure-v2-work
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio TRL: https://github.com/huggingface/trl
