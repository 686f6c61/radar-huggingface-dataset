# WijewardhanaNT/bx_stage2_sw_50000

## Resumen

`WijewardhanaNT/bx_stage2_sw_50000` es un adaptador LoRA (PEFT) publicado en Hugging Face que se aplica sobre el modelo base `meta-llama/Llama-2-7b-hf`. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptación de bajo rango que modifican el comportamiento del Llama 2 de 7 000 millones de parámetros de Meta. El autor es el usuario WijewardhanaNT y el repositorio ocupa 2,4 GB, un tamano coherente con un checkpoint de adaptador en precision completa o con un rango relativamente alto.

La model card esta practicamente vacia: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros y evaluacion) figuran como «More Information Needed». Esto limita severamente cualquier evaluacion tecnica del adaptador. El nombre del repositorio sugiere un entrenamiento en dos etapas (`stage2`) sobre un conjunto de datos identificado como `sw` con 50 000 ejemplos, pero esta interpretacion no esta confirmada por el autor.

Por su relevancia practica, se trata de un artefacto de investigacion de bajo perfil (cero descargas y cero likes en el momento de la consulta) que solo puede utilizarse cargando primero el modelo base Llama 2 7B y aplicando despues el adaptador mediante la libreria PEFT. Su interes radica en servir como ejemplo de fine-tuning parametrizado eficiente sobre Llama 2, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 2 7B |
| Parametros totales | 7 000 millones (modelo base) + parametros del adaptador (no disponibles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Llama 2 7B: 4 096 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Llama 2) |
| Idiomas soportados | no disponible (los del base Llama 2, predominantemente ingles) |
| Licencia | no disponible (sujeta ademas a la licencia Llama 2 de Meta) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.0 |
| Modelo base | meta-llama/Llama-2-7b-hf |
| Tamano del repositorio | 2,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 2 7B, un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con 32 capas y una dimension oculta de 4 096. El adaptador en si es un modulo LoRA de la libreria PEFT: introduce matrices de descomposicion de bajo rango en determinadas proyecciones lineales del modelo base, de modo que solo se entrenan esos parametros adicionales mientras el resto del modelo permanece congelado.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango y el alpha del LoRA, la tasa de aprendizaje ni si se emplearon tecnicas de alineacion como RLHF o DPO. El identificador `bx_stage2_sw_50000` apunta a un entrenamiento en dos etapas con 50 000 muestras de un corpus denominado `sw`, pero el autor no lo documenta. Tampoco se especifica la infraestructura de computo ni el regimen de precision (fp16, bf16, etc.).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones en la medida en que el adaptador las haya incorporado; no documentado.
- Generacion de codigo y matematicas basicas, limitada por las capacidades del base.
- Soporte de tool calling / function calling: no documentado y no nativo en Llama 2 7B.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el base Llama 2 esta optimizado para ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con PEFT: sirve como ejemplo reproducible de como se estructura y se carga un adaptador LoRA sobre Llama 2 7B mediante `PeftModel.from_pretrained`, util para comparar configuraciones de fine-tuning.
- Investigacion sobre fine-tuning eficiente: permite estudiar el efecto de un entrenamiento en dos etapas sobre un corpus de 50 000 muestras, siempre que el autor o el usuario reconstruyan la configuracion.
- Base para nuevos adaptadores: al ser un adaptador ligero, puede combinarse o sustituirse por otros adaptadores sobre el mismo base sin duplicar el coste de almacenamiento del modelo completo.
- Prototipado de asistentes conversacionales en ingles: cargando el base Llama 2 7B y el adaptador se obtiene un chatbot de 7B con contexto de 4 096 tokens, suficiente para dialogos multi-turno de extension moderada.
- Evaluacion comparativa de adaptadores: util en pipelines de evaluacion que miden la degradacion o mejora de un LoRA frente al modelo base en tareas de generacion.
- Docencia y demos de Hugging Face: el repositorio de 2,4 GB es manejable para talleres sobre PEFT y despliegue de adaptadores con `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del base Llama 2 7B en fp16: aproximadamente 14 GB; en 8 bits, unos 7-8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), unos 4-5 GB.
- El adaptador anade una sobrecarga minima de memoria (del orden de cientos de MB en funcion del rango y las capas adaptadas), aunque el repositorio ocupa 2,4 GB en disco.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en fp16; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en fp16 de una sola instancia; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion 4 bits; en 8 bits requiere al menos 8-10 GB.
- Opciones de despliegue: `transformers` + `peft` (carga nativa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), Text Generation WebUI.
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware y de la cuantizacion del base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/bx_stage2_sw_50000 | 7B (base) + LoRA | 4 096 (heredado) | safetensors (PEFT) | no disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-2-7b-hf | 7B | 4 096 | safetensors | Llama 2 Community License | Hugging Face, ampliamente usado |
| tloen/alpaca-lora-7b | 7B (base) + LoRA | 2 048 | safetensors (PEFT) | no disponible (base Llama) | Hugging Face, muy popular |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4 096 | safetensors | Llama 2 Community License | Hugging Face, referencia para dialogo |

La comparacion con `alpaca-lora-7b` es la mas directa por tratarse tambien de un adaptador LoRA sobre Llama, aunque aquel se entreno sobre el Llama original de 7B y no sobre Llama 2. No hay datos de rendimiento del adaptador evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni proceso de alineacion; no es posible evaluar sesgos conocidos.
- Riesgo de alucinacion alto, heredado de Llama 2 7B y potencialmente agravado por un fine-tuning no documentado.
- Contexto limitado a 4 096 tokens (limite del base Llama 2 7B).
- Idiomas: no documentados; el base esta orientado al ingles, por lo que el rendimiento en castellano es incierto.
- Licencia no disponible: el uso comercial queda sujeto a la licencia Llama 2 de Meta y a la ausencia de terminos propios del autor, lo que introduce ambiguedad legal.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- El adaptador requiere descargar por separado el modelo base Llama 2 7B, con sus propios requisitos de acceso y aceptacion de licencia.
- No hay informacion sobre hiperparametros del LoRA (rango, alpha, capas objetivo), lo que dificulta reproducir o auditar el entrenamiento.
- No apto para produccion sin una evaluacion previa exhaustiva y sin clarificacion de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WijewardhanaNT/bx_stage2_sw_50000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
