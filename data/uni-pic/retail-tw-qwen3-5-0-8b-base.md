# UNI-PIC/Retail-TW-Qwen3.5-0.8B-Base

## Resumen

Retail-TW-Qwen3.5-0.8B-Base es un checkpoint de preentrenamiento continuo (CPT) desarrollado por President Information Corp. (PIC, Taiwan) y Uni-President Information Philippines Corp. (UNI-PIPC) a partir de Qwen/Qwen3.5-0.8B-Base. El modelo esta especializado en conocimiento del sector minorista y comercio electronico de Taiwan, con enfasis en chino tradicional (zh-TW), y mantiene capacidades generales de modelado de lenguaje mediante una mezcla de replay con datos de Wikipedia y pares de traduccion en↔zh.

Se trata de un modelo base, no alineado para instrucciones ni para seguridad, pensado como fundamento para fine-tuning supervisado (SFT) posterior en aplicaciones de retail. La adaptacion se realizo con ms-swift sobre 4× NVIDIA H100 de 96 GB, consumiendo 2.56B tokens, de los cuales el 53.7% corresponde a listados de productos y el 26.3% a wikis sinteticas de marcas y contribuyentes generadas con NVIDIA NeMo Data Designer.

La relevancia del modelo reside en su especializacion vertical: incorpora 7.30M listados de productos propietarios de Taiwan distribuidos en 15 categorias de retail, incluyendo variantes de nombres (alias, transliteraciones, zhuyin, pinyin y errores tipograficos). Con 1.107 millones de parametros, licencia Apache 2.0 y un tamano de repositorio de 2.2 GB, es un modelo compacto y desplegable en hardware modesto para tareas de dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal LM (hibrida Gated DeltaNet–Gated Attention, segun Qwen3.5) |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino tradicional (zh-TW, principal), chino simplificado (zh-CN), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5, descrita por el autor como un modelo causal decoder-only con atencion hibrida Gated DeltaNet–Gated Attention. No se proporcionan detalles adicionales sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto nativa del modelo base.

El entrenamiento consistio en un preentrenamiento continuo sobre 2.56B tokens con la siguiente composicion: 53.7% (1.38B) listados de productos, 26.3% (674.4M) wiki de retail de Taiwan y 20.0% (512.9M) datos de replay. El replay se compone de Wikipedia en zh-TW (40%), pares de traduccion en↔zh (porcentaje no especificado en la informacion disponible) y otros datos generales. La wiki de retail incluye wikis sinteticas de marcas y contribuyentes con variantes de nombres (alias, nombres en lenguas extranjeras, grafias en zhuyin y pinyin, y errores tipograficos), generadas con NVIDIA NeMo Data Designer. Se reservo un 0.1% de cada dataset para validacion. El framework de entrenamiento fue ms-swift sobre 4× NVIDIA H100 de 96 GB. No se menciona uso de RLHF, DPO ni ninguna tecnica de alineacion, al tratarse de un checkpoint base.

## Capacidades

- Modelado de lenguaje causal general en chino tradicional, chino simplificado e ingles.
- Conocimiento de dominio de retail y comercio electronico de Taiwan: categorias de producto, marcas, nombres de contribuyentes y variantes ortograficas.
- Reconocimiento de alias, transliteraciones, zhuyin, pinyin y errores tipograficos en nombres de productos y marcas.
- Generacion de texto y continuacion de secuencias (modelo base, sin instrucciones).
- Capacidad multilingue limitada a zh-TW, zh-CN y en, con retencion de habilidades generales gracias al replay.
- No dispone de tool calling, function calling, modo thinking, vision ni audio de forma nativa; al ser un checkpoint base no alineado, no se documentan capacidades de agente ni razonamiento multi-paso.
- No es un modelo instructivo: no responde a formatos de chat ni a instrucciones sin un SFT previo.

## Casos de uso

- Fine-tuning supervisado para atencion al cliente en retail taiwanes: el checkpoint sirve como base para SFT sobre conversaciones de soporte, aprovechando su conocimiento de categorias de producto y marcas locales.
- Normalizacion y enriquecimiento de catalogos de producto: el modelo puede emplearse para mapear variantes de nombres (alias, pinyin, zhuyin, errores tipograficos) a entradas canonicas de un catalogo, gracias a los 7.30M listados vistos en el CPT.
- Clasificacion y etiquetado de productos en 15 categorias de retail: util como extractor de caracteristicas o base para un clasificador afinado sobre descripciones de producto en zh-TW.
- Busqueda semantica en e-commerce: generacion de representaciones o expansion de consultas en chino tradicional para motores de busqueda internos, apoyandose en el vocabulario de marcas y productos adquirido.
- Traduccion y localizacion en↔zh para fichas de producto: el replay con pares de traduccion en↔zh conserva cierta capacidad bilingue util para localizar contenido de retail entre ingles y chino.
- Generacion asistida de descripciones de producto: como base para SFT que genere fichas y textos comerciales en chino tradicional con terminologia del sector.
- Investigacion sobre preentrenamiento continuo de dominio: checkpoint de referencia para estudiar la retencion de capacidades generales tras CPT con mezclas de replay en modelos de menos de 1.2B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.107M parametros, en fp16/bf16 los pesos ocupan aproximadamente 2.2 GB; en cuantizacion de 8 bits, alrededor de 1.1 GB; en 4 bits, alrededor de 0.55 GB (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con overhead de activaciones; las NVIDIA H100 se usaron solo para el entrenamiento (4× H100 96 GB).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs integradas con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI son compatibles a nivel general con modelos causales de este tamano, aunque no se documentan recetas oficiales para esta arquitectura hibrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| Retail-TW-Qwen3.5-0.8B-Base | 1.107M | no disponible | zh-TW, zh-CN, en | Apache 2.0 | Retail Taiwan (CPT) |
| Qwen/Qwen3.5-0.8B-Base | no disponible en la informacion | no disponible | no disponible | no disponible | Generalista (modelo base) |
| Otros modelos de retail en chino tradicional | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base Qwen3.5-0.8B-Base, del que este checkpoint es un fine-tune por CPT. No se dispone de informacion sobre alternativas equivalentes de dominio retail en chino tradicional.

## Limitaciones y advertencias

- Es un checkpoint base: no esta ajustado para instrucciones ni alineado para seguridad; no debe usarse directamente en produccion conversacional sin SFT y evaluacion.
- Riesgo de alucinacion: al ser un modelo de 1.1B parametros sin alineacion, puede generar contenido plausible pero incorrecto, especialmente fuera del dominio de retail taiwanes.
- Sesgos: los datos propietarios de listados de producto y las wikis sinteticas pueden introducir sesgos de marcas, categorias o terminologia concretas del proveedor de datos.
- Cobertura idiomatica limitada: el foco es zh-TW; el rendimiento en zh-CN e ingles depende del replay y puede degradarse respecto al modelo base.
- Longitud de contexto no documentada: se desconoce la ventana efectiva, lo que dificulta planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento propietarios y del modelo base Qwen3.5.
- Sin datos de benchmarks: no es posible comparar su rendimiento cuantitativamente con alternativas.
- El modelo no incluye tool calling, vision ni audio; cualquier capacidad de agente requiere desarrollo adicional sobre el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNI-PIC/Retail-TW-Qwen3.5-0.8B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Organizacion UNI-PIC en Hugging Face: https://huggingface.co/UNI-PIC
- Web corporativa PIC: https://www.pic.net.tw/
- Web UNI-PIPC: https://www.pic.net.ph/
- LinkedIn PIC: https://www.linkedin.com/company/president-information-corporation/
- LinkedIn UNI-PIPC: https://www.linkedin.com/company/uni-pipc/
- Chat LumineOne AI: https://lumineai.pic.net.tw/
- GitHub PIC AI Team: https://github.com/pic-ai-team
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset WMT19: https://huggingface.co/datasets/wmt/wmt19
