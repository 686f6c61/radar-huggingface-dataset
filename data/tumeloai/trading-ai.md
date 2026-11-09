# TumeloAi/trading-ai

## Resumen

TumeloAi/trading-ai es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros desarrollado originalmente por Alibaba Qwen y adaptado aqui por el usuario TumeloAi. El ajuste se ha realizado sobre la version cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`), empleando la libreria Unsloth, que segun la model card permite entrenar "2x mas rapido" que el flujo estandar de Hugging Face. El nombre del repositorio sugiere una especializacion en dominio financiero o de trading, aunque la model card no documenta el dataset ni el objetivo concreto del entrenamiento.

El modelo hereda la arquitectura Qwen2 del modelo base: transformer denso con atencion de causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo rotary (RoPE). Con 1.5B de parametros y una ventana de contexto de 32.768 tokens en el modelo original, esta pensado para despliegues ligeros en hardware de consumo o entornos con restricciones de VRAM.

Su relevancia practica es limitada por el momento: el repositorio registra 0 descargas y 0 likes, no incluye resultados de evaluacion ni detalles del proceso de entrenamiento, y la model card es practicamente la plantilla autogenerada por Unsloth. Debe tratarse, por tanto, como un experimento de ajuste fino sin validacion publica, adecuado para prototipado interno pero no para produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5; no verificada en este ajuste) |
| Tipos de cuantizacion | pesos publicados en safetensors; el modelo base se entreno sobre bnb-4bit; cuantizaciones GGUF/AWQ no publicadas |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit |
| Herramienta de entrenamiento | Unsloth + TRL |
| Fecha de publicacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, que sigue la arquitectura Qwen2: transformer decoder-only denso con 28 capas, atencion multi-cabeza con query/key/value projections separadas, RMSNorm pre-normalizacion, activacion SwiGLU en el feed-forward y RoPE para codificacion posicional. El modelo base fue entrenado por Alibaba con un corpus multilingue a gran escala y posteriormente alineado mediante instrucciones y preferencias; el ajuste aqui publicado parte de la version ya cuantizada a 4 bits de Unsloth, lo que implica que el entrenamiento se realizo sobre pesos comprimidos con bitsandbytes NF4.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o simplemente SFT supervisado, ni los hiperparametros utilizados. La unica informacion tecnica explicita es que se empleo Unsloth, una libreria de optimizacion de entrenamiento que reescribe kernels en Triton para acelerar el fine-tuning y reducir el consumo de memoria. No se han publicado detalles sobre la innovacion tecnica del ajuste ni sobre la estrategia de evaluacion. Dado el tamano del repositorio (0,1 GB), es probable que se trate de un adaptador LoRA o de un modelo fusionado con pesos de baja precision, pero no se especifica en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones conversacionales.
- Generacion de codigo y resolucion de problemas matematicos sencillos, aunque con las limitaciones propias de un modelo de 1.5B.
- Soporte de tool calling / function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidad multilingue limitada: la model card declara solo ingles, aunque el modelo base soporta mas idiomas.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido (thinking mode).
- Especializacion potencial en dominio de trading o finanzas segun el nombre del repositorio, sin evidencia publica que lo confirme.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos en entornos de desarrollo, aunque su ventana de contexto efectiva no esta validada tras el ajuste.
- Experimentacion con fine-tuning financiero: util como punto de partida para investigar ajustes en dominio de trading, comparando su comportamiento con el modelo base sin ajustar.
- Generacion de resumenes de textos cortos: adecuado para tareas de sintesis de documentos breves en ingles gracias a su tamano reducido y bajo coste de inferencia.
- Clasificacion y extraccion de informacion: puede emplearse en pipelines de procesamiento de texto donde se requiera un modelo ligero ejecutable en CPU o GPU de gama baja.
- Educacion y demos: util para demostrar flujos de fine-tuning con Unsloth y TRL en charlas o talleres, dado su bajo requisito de hardware.
- Generacion de codigo auxiliar: puede asistir en tareas de autocompletado o generacion de snippets simples, siempre con revision humana.
- Base para investigacion de alineacion: permite estudiar el efecto de ajustes sobre un modelo cuantizado a 4 bits en comparacion con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa para 1.5B).
- VRAM estimada en 4 bits: aproximadamente 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para 4 bits basta con 4-6 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas, e incluso en CPU con llama.cpp si se generan cuantizaciones GGUF.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiquetado en el repositorio), vLLM, llama.cpp y Ollama (previa conversion a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TumeloAi/trading-ai | 1.5B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste sin evaluacion publica |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Llama 3.2-1B-Instruct | 1.2B | 128.000 | Llama 3.2 Community License | Hugging Face | Requiere aceptacion de licencia, no Apache |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Hugging Face | Alternativa ligera con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni descripcion del dataset; no es posible verificar que el ajuste mejore al original.
- Riesgo de degradacion por sobreajuste: al partir de un modelo cuantizado a 4 bits y sin documentar el proceso, es probable que el modelo haya perdido capacidades generales del base.
- Riesgo de alucinacion: inherente a modelos de 1.5B, especialmente en dominios especializados como finanzas o trading, donde puede generar informacion erronea con aparente seguridad.
- Sesgos: no documentados; el modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5, no evaluados en este ajuste.
- Limitacion idiomatica: la model card declara solo ingles, aunque el modelo base es multilingue; el comportamiento en castellano no esta verificado.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los terminos del modelo base y de la version de Unsloth.
- No apto para produccion sin validacion: con 0 descargas y sin documentacion, no deberia desplegarse en entornos criticos sin una evaluacion exhaustiva previa.
- Uso financiero: si el modelo se emplea para asesoramiento o decisiones de trading, debe acompanarse de supervision humana y advertencias legales claras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TumeloAi/trading-ai
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
