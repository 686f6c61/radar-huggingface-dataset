# WUrbane/vartrace-multipass-130m

## Resumen

VarTrace multipass 130m es una familia de modelos de lenguaje de pequeno tamano (130 millones de parametros) publicada por el usuario WUrbane en Hugging Face. Se trata de un experimento de fine-tuning reproducible: el mismo esquema de entrenamiento VarTrace v1 E1 se ejecuta con distinto numero de pasadas (1, 2, 4 y 8) sobre modelos base preentrenados con AdamW o Muon, y el fine-tuning se realiza con AdamW o Muon. Cada subcarpeta del repositorio es un directorio de modelo completo, con su propia model card y su fichero `EXPORT.json`.

El interes del modelo es metodologico mas que de producto: sirve para estudiar como afecta el numero de pasadas de fine-tuning y la eleccion del optimizador (AdamW frente a Muon) al comportamiento de un modelo pequeno, manteniendo constante el resto de hiperparametros. La model card documenta explicitamente los pasos (682), el learning rate principal (0.0001), la semilla de orden (20261023) y la rotacion (k0), lo que facilita la replicacion.

La informacion publica disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluacion. El repositorio ocupa 1.1 GB y solo incluye pesos en formato safetensors compatibles con `transformers`. La model card muestra una unica configuracion en su tabla (pretrain AdamW, fine-tune AdamW, 1 pasada), por lo que el resto de combinaciones anunciadas no estan documentadas con detalle en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje causal compatible con `transformers`, familia VarTrace) |
| Parametros totales | 130 millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 1.1 GB |
| Precision de matmul documentada | fp32 |
| Pasos de fine-tuning (config. documentada) | 682 |
| Learning rate principal | 0.0001 |
| Semilla de orden / rotacion | 20261023 / k0 |
| Host de entrenamiento | h200 |

## Arquitectura y entrenamiento

La model card describe el modelo como resultado de un experimento de fine-tuning multi-pass sobre un modelo base preentrenado. Los modelos base pertenecen a las familias `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*`, es decir, el preentrenamiento se realizo con AdamW o con Muon. Sobre esa base se aplica el esquema VarTrace v1 E1, ejecutado con 1, 2, 4 u 8 pasadas, y el fine-tuning se hace con AdamW o Muon. La configuracion documentada en la tabla de la model card corresponde a preentrenamiento con AdamW, fine-tuning con AdamW, 1 pasada, 682 pasos, learning rate 0.0001, rotacion k0, semilla 20261023 y precision fp32 en un host H200.

No se especifica en la informacion disponible la arquitectura interna (tipo de transformer, atencion, normalizacion, tokenizador), el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la innovacion tecnica concreta que introduce VarTrace mas alla de la organizacion del experimento en pasadas y la eleccion de optimizador. Cualquier afirmacion sobre atencion lineal, decodificacion especulativa o arquitecturas hibridas no esta respaldada por la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM`, segun el ejemplo de uso de la model card.
- Fine-tuning reproducible: cada subcarpeta contiene un modelo completo con su propia model card y `EXPORT.json`, lo que permite comparar configuraciones.
- Compatibilidad con el ecosistema `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidad de razonamiento, codigo, matematicas, vision, audio o tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre optimizadores: comparar AdamW frente a Muon en fine-tuning de modelos de 130M manteniendo constante el esquema VarTrace v1 E1, usando las subcarpetas como puntos de control comparables.
- Estudio del efecto del numero de pasadas: analizar como 1, 2, 4 u 8 pasadas de fine-tuning afectan a la perdida de validacion y a la estabilidad del entrenamiento en un modelo pequeno.
- Reproduccion de experimentos: la semilla de orden (20261023), la rotacion (k0), el learning rate (0.0001) y los 682 pasos estan documentados, lo que permite replicar la configuracion en un H200 o hardware equivalente.
- Prototipado de pipelines de fine-tuning: usar el repositorio como plantilla para validar flujos de exportacion (`EXPORT.json`) y carga con `AutoModelForCausalLM.from_pretrained` con `subfolder`.
- Docencia y formacion: modelo de 130M con 1.1 GB de pesos que cabe en una GPU consumer y sirve para ilustrar experimentos controlados de entrenamiento.
- Pruebas de integracion con endpoints compatibles: validar el despliegue de modelos pequenos en infraestructura de inferencia antes de escalar a modelos mayores.
- Generacion de texto basica en entornos de laboratorio: siempre que se valide previamente la calidad, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (130M parametros, repositorio de 1.1 GB) es plausible que quepa en GPUs consumer con 4-8 GB de VRAM en fp16, aunque no hay datos confirmados.
- GPU recomendadas: el entrenamiento documentado se realizo en un host H200; para inferencia no se especifican modelos concretos.
- Cabe en GPU consumer: probable por el tamano, pero no confirmado en la informacion disponible.
- Opciones de despliegue: `transformers` (soporte explicito); vLLM, llama.cpp, Ollama o TGI no estan confirmados, y al no haber pesos GGUF no se puede usar llama.cpp directamente sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VarTrace multipass 130m | 130M | no disponible | no disponible | safetensors | Experimento de fine-tuning multi-pass con AdamW/Muon |
| GPT-2 small | 124M | 1024 tokens | MIT | safetensors, GGUF | Referencia clasica de modelos de ~125M |
| Pythia-160m | 160M | 2048 tokens | Apache 2.0 | safetensors | Suite de modelos pequenos con checkpoints intermedios |
| OPT-125m | 125M | 2048 tokens | OPT-175B license | safetensors | Modelo pequeno de Meta para investigacion |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento de VarTrace que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No se declara licencia: no se puede asumir uso comercial sin consultar al autor.
- No se declaran idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- No hay benchmarks ni evaluaciones publicadas: la calidad del modelo no esta validada.
- El modelo es un artefacto de investigacion sobre optimizadores y pasadas de fine-tuning, no un modelo orientado a produccion.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- La model card solo documenta en detalle una de las configuraciones (pretrain AdamW, fine-tune AdamW, 1 pasada); el resto de subcarpetas anunciadas no aparecen descritas con sus hiperparametros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El contexto maximo no esta documentado, lo que impide planificar cargas de contexto largo.
- La fecha de creacion indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/vartrace-multipass-130m
- Repositorio de modelos base AdamW: `OptimizerStudy/adamw_*` (referenciado en la model card, sin URL directa disponible)
- Repositorio de modelos base Muon: `OptimizerStudy/muon_*` (referenciado en la model card, sin URL directa disponible)
- Paper, blog, repositorio de codigo o demo de VarTrace: no disponible en la informacion proporcionada.
