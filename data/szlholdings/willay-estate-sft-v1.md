# SZLHOLDINGS/WILLAY-estate-sft-v1

## Resumen

WILLAY-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo Qwen2.5-0.5B-Instruct, publicado por SZLHOLDINGS bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de tipo transformer denso con 494.032.768 parametros (aproximadamente 0,5 mil millones), derivado directamente de la version cuantizada en 4 bits de Unsloth del modelo instructivo de Qwen. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que segun el autor permitio un entrenamiento "2x mas rapido".

El modelo esta orientado a generacion de texto conversacional y, por su nomenclatura ("estate"), parece enfocado a un dominio especifico del sector inmobiliario, aunque la model card no documenta la composicion del dataset de entrenamiento ni el proposito exacto. Es relevante principalmente como ejemplo de pipeline de ajuste fino ligero sobre un modelo pequeno, desplegable en hardware muy modesto, y no como un modelo de proposito general competitivo.

La informacion publicada es muy escasa: no se detallan datos de entrenamiento, hiperparametros, benchmarks ni limitaciones. La model card se limita a indicar el modelo base, la licencia y las herramientas empleadas. Cualquier evaluacion de capacidades debe por tanto realizarse empiricamente por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (entrenado a partir de un checkpoint en bnb-4bit; no se especifican cuantizaciones publicadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo RoPE. Con 494 millones de parametros, se situa en la gama de modelos pequenos disenados para inferencia en CPU o GPUs de gama baja. El checkpoint de partida es la version Instruct de Qwen2.5-0.5B cuantizada en 4 bits por Unsloth, sobre la que se aplico un ajuste fino supervisado (SFT) usando la libreria TRL.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros concretos. La unica innovacion tecnica documentada es el uso de Unsloth para acelerar el entrenamiento (afirmacion del autor de "2x mas rapido"), una tecnica basada en kernels optimizados y gestion eficiente de memoria que permite ajustar modelos en GPUs con VRAM limitada. No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Comprension y generacion en ingles; la model card solo declara el idioma `en`.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,5B parametros.
- Generacion de codigo y matematicas simples: capacidad presente en el modelo base, aunque no verificada ni documentada para este ajuste.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades especiales de dominio: posible especializacion en el sector inmobiliario ("estate") segun la nomenclatura, sin documentacion que lo confirme.

## Casos de uso

- Clasificacion y extraccion de entidades en textos inmobiliarios: dado el posible enfoque de dominio, podria emplearse para extraer campos como precio, superficie, ubicacion o tipo de inmueble de descripciones de anuncios, con validacion posterior.
- Prototipado rapido de asistentes conversacionales: su tamano de 0,5B permite iterar en local sobre respuestas conversacionales antes de escalar a modelos mayores.
- Generacion de respuestas plantilla para atencion al cliente: util para producir borradores de respuestas en ingles en flujos de bajo riesgo donde la revision humana este garantizada.
- Experimentacion academica con pipelines de SFT: sirve como caso de estudio reproducible de ajuste fino con Unsloth y TRL sobre un modelo pequeno.
- Inferencia en dispositivos con recursos limitados: al caber en CPU y GPUs de gama baja, puede desplegarse en entornos edge o en contenedores sin GPU para tareas de generacion de texto corto.
- Filtrado y resumen de textos breves: resumen de descripciones o mensajes en ingles dentro de un pipeline de preprocesamiento, con expectativas ajustadas a su capacidad.
- Base para posteriores ajustes: punto de partida para fine-tuning adicional en dominios especificos con presupuesto de computo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 0,5 GB; en 4 bits: aproximadamente 0,25-0,3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien ejecutable en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), llama.cpp/Ollama si se generan pesos GGUF (no publicados), y vLLM (compatible con arquitectura Qwen2, no verificado para este checkpoint).
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WILLAY-estate-sft-v1 | 494M | no disponible | Apache 2.0 | Hugging Face | Ajuste SFT de dominio, sin benchmarks |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Hugging Face | Modelo base, con benchmarks publicados por Qwen |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequena de Hugging Face, con benchmarks publicados |
| TinyLlama-1.1B-Chat | 1.1B | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor numero de parametros, contexto mas corto |

No se dispone de datos de rendimiento de WILLAY-estate-sft-v1 para establecer una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: elevado en terminos relativos por el reducido tamano (0,5B parametros) y la falta de evaluacion publicada.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto efectiva no esta documentada y puede diferir de la del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia del dataset de ajuste, lo que impide verificar la ausencia de datos con restricciones adicionales.
- Caveats para produccion: ausencia total de benchmarks, de documentacion del dataset y de evaluacion de calidad; no recomendado para produccion sin una evaluacion empirica previa.
- El modelo se entreno a partir de un checkpoint cuantizado en 4 bits; la calidad resultante puede diferir de un ajuste sobre pesos completos.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/WILLAY-estate-sft-v1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-0.5B-Instruct-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
