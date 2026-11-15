# VIDHAAI/vidhaai-1.5B-26000

## Resumen

VIDHAAI/vidhaai-1.5B-26000 es un modelo de generacion de texto publicado en Hugging Face por el usuario VIDHAAI. El identificador y los metadatos tecnicos (tag `qwen2`) indican que se trata de un modelo basado en la arquitectura Qwen2 con aproximadamente 1.543 millones de parametros (1,5B), distribuido en formato safetensors y pensado para su uso con la libreria `transformers` y con text-generation-inference.

El modelo se presenta como un modelo conversacional de generacion de texto. Su tamano lo situa en la categoria de modelos pequenos, aptos para inferencia en GPU de consumo, aunque la model card publicada es la plantilla automatica de Hugging Face sin cumplimentar: no documenta datos de entrenamiento, idiomas, licencia, procedencia de los pesos ni resultados de evaluacion.

La relevancia practica de esta ficha es limitada por la ausencia de documentacion verificable. Cualquier evaluacion en produccion deberia tratarse como una incognita hasta que el autor publique informacion sobre el dataset de entrenamiento, la licencia y el proceso de ajuste, especialmente si el modelo deriva de pesos Qwen2 con condiciones de uso heredadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, segun tag del repositorio) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors, es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-15 |

## Arquitectura y entrenamiento

El unico dato arquitectonico verificable es el tag `qwen2` del repositorio, que apunta a la familia Qwen2 de Alibaba: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV. Para un modelo de 1,5B parametros en esta familia, la configuracion tipica ronda las 28 capas, hidden size de 1536 y 12 cabezas de atencion, aunque estos valores no estan confirmados en la informacion disponible.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre si los pesos son un ajuste fino de un modelo base Qwen2. La model card es la plantilla automatica de Hugging Face y todos los campos de detalles, datos y procedimiento estan marcados como "[More Information Needed]". El nombre "26000" en el identificador podria sugerir un numero de pasos o muestras de entrenamiento, pero es una especulacion sin respaldo documental.

## Capacidades

- Generacion de texto autoregresiva y conversacional, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Compatibilidad con text-generation-inference y con endpoints compatibles, segun los tags del repositorio.
- Razonamiento, codigo, matematicas, tool calling, agentes y modo thinking: no documentado; no hay evidencia en la informacion disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Vision o audio: no disponible; el repositorio solo contiene pesos de texto.

## Casos de uso

- Prototipado rapido de chatbots: el modelo puede cargarse con `transformers` y servir respuestas conversacionales en entornos de desarrollo con una sola GPU de consumo, lo que permite validar flujos de dialogo antes de invertir en modelos mayores.
- Experimentacion academica con modelos pequenos: util como linea base de 1,5B para comparar tecnicas de ajuste fino (LoRA, QLoRA) o de cuantizacion, dado su reducido tamano de 3,1 GB en safetensors.
- Generacion de texto en local para pruebas de integracion: al ser compatible con text-generation-inference, puede desplegarse en un endpoint interno para probar pipelines de inferencia sin coste de API.
- Evaluacion de calidad de modelos derivados de Qwen2: sirve para medir como se comporta un ajuste de 1,5B frente al modelo base en tareas de generacion abierta, siempre que se documenten los resultados obtenidos.
- Fine-tuning especifico de dominio: por su tamano, es viable reentrenarlo o ajustarlo con LoRA en una unica GPU para tareas acotadas (clasificacion de texto, resumen, generacion de respuestas cortas), una vez verificada la licencia.
- Despliegue en entornos con recursos limitados: con cuantizacion a 4 bits, el modelo ocupa menos de 1 GB de VRAM, lo que permite ejecutarlo en GPUs de gama baja o en CPU para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para cuantizacion 4 bits, cabe en GPUs de 4 GB e incluso en CPU.
- Cabe en GPU de consumo: si, en toda la gama RTX 30/40 con 8 GB o mas en FP16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (declarado en los tags), y conversion externa a GGUF para llama.cpp/Ollama, a AWQ/GPTQ o a vLLM, aunque estas ultimas no estan verificadas por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VIDHAAI/vidhaai-1.5B-26000 | 1,54B | no disponible | no disponible | Hugging Face, safetensors |
| Qwen2-1.5B (Alibaba) | 1,54B | 32.768 tokens (version base) | Apache 2.0 | Hugging Face, safetensors/GGUF |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors/GGUF |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, safetensors/GGUF |

La comparacion con Qwen2-1.5B es la mas directa por herencia arquitectonica, pero no hay datos que permitan afirmar que vidhaai-1.5B-26000 mejore o empeore respecto al modelo base. Las cifras de contexto de los modelos comparados corresponden a sus versiones publicas y no estan confirmadas para este repositorio.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, sesgos, proceso de alineacion ni evaluaciones, lo que impide valorar riesgos de sesgo y de alucinacion de forma fundamentada.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribucion; si los pesos derivan de Qwen2, podrian heredar condiciones de la licencia Apache 2.0 del modelo original, pero esto no esta verificado.
- Idiomas no declarados: se desconoce la cobertura linguistica real; el rendimiento en castellano es una incognita.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo sin medir experimentalmente la ventana efectiva.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Riesgo de alucinacion: inherente a los modelos de 1,5B sin documentacion de alineacion; no se debe desplegar en produccion sin evaluacion propia.
- Fecha de creacion futura (2026-11-15): conviene verificar la integridad y procedencia del repositorio antes de descargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VIDHAAI/vidhaai-1.5B-26000
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
