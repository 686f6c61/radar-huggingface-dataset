# VillanovaAI/Villanova2-15B-A3B-VL

## Resumen

Villanova2-15B-A3B-VL es un modelo de lenguaje multimodal desarrollado por VillanovaAI, publicado en Hugging Face bajo acceso restringido. El nombre del modelo y la etiqueta `qwen3_5_moe` del repositorio indican una arquitectura Mixture of Experts (MoE) derivada o inspirada en la familia Qwen, con aproximadamente 15.800 millones de parametros totales y un esquema de activacion de tipo A3B (alrededor de 3000 millones de parametros activos por token, segun la convencion de nomenclatura). El sufijo `VL` sugiere capacidades de vision-lenguaje.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 31,7 GB, lo que es coherente con pesos en precision de 16 bits para su numero de parametros. La ficha oficial de Hugging Face no publica pipeline, licencia, idiomas ni datos de entrenamiento, y el acceso esta restringido mediante gating, por lo que cualquier evaluacion tecnica detallada requiere aceptar las condiciones del autor.

Su relevancia potencial radica en combinar un diseno MoE de activacion reducida (que abarata la inferencia frente a un modelo denso del mismo tamano) con capacidades multimodales, un perfil atractivo para despliegues con restricciones de VRAM. No obstante, la ausencia de documentacion publica limita seriamente su evaluacion objetiva en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (etiqueta `qwen3_5_moe`), multimodal (VL) |
| Parametros totales | 15.829.953.984 (~15,8 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 31,7 GB |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible proviene de la etiqueta `qwen3_5_moe` del repositorio, que apunta a un transformer con capas de mezcla de expertos y enrutamiento disperso, en la linea de los disenos MoE de la familia Qwen. El conteo real de parametros en safetensors (15.829.953.984) confirma el orden de magnitud de 15 B totales, y el sufijo A3B sugiere que solo una fraccion reducida de expertos se activa por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso equivalente. El sufijo VL indica la presencia de un componente de vision, presumiblemente un encoder visual acoplado al decoder de lenguaje, aunque no se detalla su naturaleza ni el mecanismo de fusion.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, las etapas de alineacion (SFT, RLHF, DPO) ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Tampoco hay documentacion sobre la tokenizacion, el vocabulario o el preprocesado multimodal. Toda esta seccion debe considerarse no disponible a efectos practicos.

## Capacidades

- Generacion de texto y razonamiento general, asumiendo el comportamiento tipico de un transformer MoE de esta familia (no verificado en documentacion publica).
- Procesamiento multimodal vision-lenguaje por el sufijo VL del nombre, sin especificacion del tipo de tareas (VQA, captioning, OCR, etc.).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede emplearse para experimentar con pipelines que combinen imagen y texto (por ejemplo, descripcion de capturas o extraccion de informacion de documentos escaneados), aprovechando su componente VL y su tamano contenido.
- Inferencia en hardware de gama alta consumer: con ~15,8 B parametros totales y activacion dispersa, un despliegue en 4-bit podria caber en GPUs de 24 GB, lo que lo hace candidato para laboratorios con estaciones RTX 4090.
- Evaluacion comparativa de arquitecturas MoE: util como banco de pruebas para estudiar el equilibrio entre parametros totales y activos en tareas de razonamiento y vision.
- Generacion asistida en entornos con datos sensibles: al ser un modelo gated, el autor puede imponer condiciones de uso que encajen en organizaciones con requisitos de trazabilidad, aunque la licencia no este publicada.
- Investigacion academica sobre alineacion y sesgos: permite estudiar el comportamiento de un MoE multimodal de ~15 B en tareas controladas, siempre que se obtenga acceso.
- Fine-tuning especifico de dominio: su tamano permite ajuste con LoRA en una sola GPU de 80 GB o en configuraciones multi-GPU mas modestas, para tareas como clasificacion de imagenes medicas o atencion al cliente multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~32 GB solo para pesos, mas overhead de KV cache y activaciones; requiere GPU de 40-80 GB (A100 40/80 GB, H100, L40S).
- VRAM estimada en cuantizacion 8-bit: ~16 GB para pesos, viable en RTX 4090 (24 GB) con contexto moderado.
- VRAM estimada en cuantizacion 4-bit: ~8-10 GB para pesos, viable en RTX 4090, RTX 3090 e incluso GPUs de 12-16 GB con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 para precision completa; RTX 4090/L40S para 8-bit; RTX 3090/4080 para 4-bit.
- Opciones de despliegue: al publicarse solo en safetensors, es necesario convertir a GGUF para llama.cpp/Ollama o usar vLLM/TGI con soporte para la arquitectura `qwen3_5_moe` (soporte no confirmado). No se dispone de cuantizaciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| Villanova2-15B-A3B-VL | ~15,8 B | ~3 B (inferido) | no disponible | no disponible | Gated |
| Qwen2.5-VL-7B | ~7 B | denso | 128 K (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | Abierto |
| Qwen2.5-VL-72B | ~72 B | denso | 128 K (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | Abierto |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32 K (segun Mistral) | Apache 2.0 (segun Mistral) | Abierto |

La comparacion con modelos de referencia es aproximada: Villanova2 no publica contexto, licencia ni benchmarks, por lo que la equiparacion se basa unicamente en el conteo de parametros y en la etiqueta arquitectonica. Los datos de Qwen y Mixtral provienen de sus fichas publicas y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se publican licencia, idiomas, contexto, datos de entrenamiento ni benchmarks, lo que impide una evaluacion rigurosa y su adopcion en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el proceso de aprobacion y los terminos no estan descritos.
- Licencia desconocida: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin datos de alineacion no puede estimarse su magnitud.
- Sesgos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Idiomas: se desconoce si el modelo esta entrenado en castellano o en que medida; el rendimiento multilingue no puede garantizarse.
- Arquitectura no verificada: la etiqueta `qwen3_5_moe` no corresponde a una arquitectura publica ampliamente soportada por vLLM, TGI o llama.cpp, por lo que el despliegue puede requerir trabajo de integracion.
- Repositorio de 31,7 GB: la descarga y el almacenamiento requieren planificacion; no hay cuantizaciones oficiales que reduzcan el tamano.
- Fecha de publicacion futura (2026-11-04): la coherencia temporal de los metadatos no puede validarse y debe tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-VL
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
