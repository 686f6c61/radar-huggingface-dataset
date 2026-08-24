# wrchen1/LatentMT-2.6B-eng-latn-srd-latn

## Resumen

LatentMT-2.6B-eng-latn-srd-latn es un adaptador LoRA para traduccion automatica del par ingles-sardina (eng_Latn-srd_Latn), desarrollado por Wei-Rui Chen y colaboradores en el marco del articulo "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo causal de 2.600 millones de parametros, y esta publicado bajo licencia Apache 2.0.

La propuesta principal de LatentMT es el uso de razonamiento latente: en lugar de generar tokens de razonamiento visibles (chain-of-thought), el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos. Esto permite mejorar la calidad de la traduccion sin incrementar el numero de tokens generados, lo que resulta especialmente relevante para escenarios de baja latencia y para lenguas con pocos recursos como el sardina.

El adaptador esta pensado exclusivamente para investigacion en traduccion automatica. Incluye unicamente los ficheros del adaptador (adapter_config.json, adapter_model.safetensors y README.md) y requiere cargar el modelo base por separado. El repositorio tiene un tamano de 0,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base ByteDance/Ouro-2.6B-Thinking) con adaptador LoRA y razonamiento latente recurrente |
| Parametros totales | 2.600 millones (modelo base) + adaptador LoRA (0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite torch_dtype="auto") |
| Idiomas soportados | ingles (eng_Latn) a sardina (srd_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo base es ByteDance/Ouro-2.6B-Thinking, un transformer causal de 2.600 millones de parametros publicado bajo Apache 2.0. Sobre el se entrena un adaptador LoRA (Low-Rank Adaptation) que incorpora el mecanismo de razonamiento latente propuesto en LatentMT. La innovacion clave es que los pasos de razonamiento se ejecutan de forma recurrente dentro de los estados ocultos del modelo, con una profundidad recurrente de 4, en lugar de emitir tokens de razonamiento visibles. Esto permite que el modelo "piense" mas tiempo sin aumentar la longitud de la secuencia generada.

El entrenamiento se describe como ligero (lightweight training) y cubre 32 direcciones de traduccion que abarcan lenguas de alto, medio y bajo recursos. Segun el articulo, LatentMT consigue un rendimiento comparable a modelos de 3 a 5 veces mayores. No se especifican en la informacion disponible los datos exactos de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Traduccion automatica del ingles al sardina (eng_Latn-srd_Latn) con razonamiento latente.
- Razonamiento interno en estados ocultos sin generar tokens de cadena de pensamiento visibles, lo que reduce la latencia de generacion.
- Adaptacion eficiente mediante LoRA: solo se actualizan los pesos del adaptador, no el modelo base completo.
- Capacidad de traduccion para lenguas de bajo recursos, como el sardina, donde los sistemas basados en datos masivos suelen fallar.
- Integracion con el ecosistema Hugging Face Transformers y PEFT, lo que facilita su uso en pipelines existentes.
- Soporte de generacion con cache (use_cache=True) para acelerar la inferencia.

## Casos de uso

- Investigacion en traduccion automatica para lenguas minoritarias: el adaptador permite estudiar el impacto del razonamiento latente en un par de lenguas con escasos recursos como el sardina, comparando con enfoques de traduccion directa o con chain-of-thought explicito.
- Desarrollo de sistemas de traduccion de baja latencia: al no generar tokens de razonamiento visibles, el modelo produce traducciones mas rapidas que un sistema equivalente con razonamiento explicito, util para aplicaciones en tiempo real.
- Evaluacion de adaptadores LoRA sobre modelos base de 2.6B: el repositorio sirve como punto de partida para reproducir los experimentos del articulo y validar el enfoque en otros pares de lenguas.
- Integracion en pipelines de traduccion con Transformers: el codigo de carga proporcionado permite incorporar el modelo en aplicaciones existentes con solo unas lineas, usando PEFT y device_map="auto".
- Comparacion de estrategias de razonamiento en MT: los investigadores pueden contrastar este adaptador con versiones que usan chain-of-thought explicito para medir diferencias en calidad y coste computacional.
- Prototipado de servicios de traduccion para el sardina: aunque el adaptador es para investigacion, puede servir como base para un servicio real de traduccion ingles-sardina en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo menciona que LatentMT alcanza un rendimiento comparable a modelos de 3 a 5 veces mayores en 32 direcciones de traduccion, pero no se incluyen cifras concretas (BLEU, chrF, etc.) en la documentacion del repositorio ni en los resultados de busqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero un modelo de 2.6B en precision FP16 requiere aproximadamente 5-6 GB de VRAM solo para los pesos. Con el adaptador LoRA, el uso adicional es minimo (0,1 GB).
- GPU recomendadas: una GPU consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070) es suficiente para inferencia en FP16. Para mayor velocidad, una RTX 4090 o una GPU profesional como A100 o H100.
- Cabe en GPU consumer: si, en GPUs con al menos 8 GB de VRAM usando cuantizacion (bitsandbytes) o FP16.
- Opciones de despliegue: el modelo se puede cargar con Transformers + PEFT, tal como muestra el codigo de ejemplo. Tambien es compatible con vLLM o TGI si se fusiona el adaptador en el modelo base, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles. El razonamiento latente con profundidad 4 anade computacion interna, pero al no generar tokens extra, la latencia total deberia ser menor que con chain-of-thought explicito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LatentMT-2.6B (este adaptador) | 2.6B + LoRA | no disponible | Apache 2.0 | Razonamiento latente en estados ocultos |
| ByteDance/Ouro-2.6B-Thinking (base) | 2.6B | no disponible | Apache 2.0 | Modelo causal con capacidad de thinking |
| Modelos de traduccion NMT clasicos (p.ej. M2M-100, NLLB) | 1.2B-54B | 1024-2048 tokens | CC-BY-NC / MIT | Traduccion directa sin razonamiento explicito |

No se dispone de comparativas directas con otros adaptadores LoRA para el mismo par de lenguas. La ventaja principal de LatentMT es su enfoque de razonamiento latente, que no esta presente en los modelos NMT clasicos.

## Limitaciones y advertencias

- Uso exclusivo para investigacion: el autor declara que el adaptador es para "machine translation research", no para produccion.
- Par de lenguas limitado: solo cubre ingles-sardina. No se incluyen otros idiomas en este repositorio concreto.
- Dependencia del modelo base: el adaptador solo funciona con ByteDance/Ouro-2.6B-Thinking. No es compatible con otros modelos sin reentrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir traducciones incorrectas o inventar contenido, especialmente en una lengua de bajo recursos como el sardina.
- Sesgos: no se documentan sesgos especificos, pero el modelo base puede arrastrar sesgos presentes en sus datos de entrenamiento.
- Sin datos de rendimiento publicos: no hay benchmarks disponibles en el repositorio, lo que dificulta evaluar su calidad real frente a alternativas.
- Requiere configuracion manual: el parametro total_ut_steps debe fijarse en 4 segun la documentacion, y es necesario usar trust_remote_code=True para cargar el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-srd-latn
- Articulo arXiv: https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio relacionado (mismo articulo, otro par de lenguas): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-szl-latn
