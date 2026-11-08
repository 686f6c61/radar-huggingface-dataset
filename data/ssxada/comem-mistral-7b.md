# ssxada/CoMem-Mistral-7B

## Resumen

CoMem-Mistral-7B es un repositorio de adaptadores LoRA publicados por el usuario ssxada sobre el modelo base mistralai/Mistral-7B-Instruct-v0.2. No se trata de un modelo completo con pesos fusionados, sino de un conjunto de checkpoints organizados en dos etapas (`stage1` y `stage2`) parametrizados por una tasa de compresion (`cr`, rate). La etapa 2 congela el adaptador del encoder entrenado en la etapa 1 y entrena el adaptador del decoder, lo que sugiere una arquitectura de compresion de memoria o contexto (CoMem) acoplada a un transformer Mistral.

El modelo hereda la arquitectura Mistral 7B: transformer decoder-only de 7.000 millones de parametros con sliding window attention de 4.096 tokens y licencia Apache 2.0. Sin embargo, el repositorio no incluye los pesos base, que deben descargarse por separado, ni tampoco el fichero `decoder_first_last_layers.pth` con los pesos de embedding y lm_head usados para la expansion del tokenizer, lo que limita la reproducibilidad completa de la inferencia.

La relevancia actual es limitada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y sin pipeline declarado. Resulta util unicamente como referencia para quienes investiguen tecnicas de compresion de contexto o memoria sobre Mistral, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) con adaptadores LoRA CoMem en dos etapas |
| Parametros totales | 7.000 millones (modelo base); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el base Mistral 7B (sliding window de 4.096); contexto efectivo de CoMem no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene adaptadores LoRA, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores LoRA (checkpoints `.pth`/configuracion) sobre base Mistral; requiere pesos base en safetensors aparte |

## Arquitectura y entrenamiento

El modelo base Mistral 7B-Instruct-v0.2 es un transformer decoder-only de 7.000 millones de parametros que emplea sliding window attention (SWA) con ventana de 4.096 tokens, lo que reduce el coste computacional a O(ventana · longitud de secuencia) y permite extender el contexto hasta 32.768 tokens. Sobre esta base, el autor anade adaptadores LoRA organizados en dos etapas: la etapa 1 entrena un adaptador de encoder y la etapa 2, con ese encoder congelado, entrena el adaptador del decoder. Los checkpoints se almacenan bajo rutas `stage1/cr{rate}` y `stage2/cr{rate}`, donde `rate` es una tasa de compresion no documentada.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales mas alla del esquema de dos etapas. El repositorio excluye intencionadamente el fichero `decoder_first_last_layers.pth`, que contiene pesos de embedding y lm_head guardados para la expansion del tokenizer, por lo que ciertas rutas de inferencia requieren aportar ese artefacto localmente. La carga se realiza mediante `CoMem.from_pretrained(..., trust_remote_code=True)`, lo que implica ejecutar codigo remoto del autor.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Mistral-7B-Instruct-v0.2.
- Instrucciones multi-turno propias del modelo instruct base.
- Capacidad de compresion de contexto/memoria segun el diseno CoMem (no documentada en detalle).
- Soporte de tool calling: no confirmado para este fine-tune; el base Mistral 7B no lo tiene de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el base Mistral 7B esta orientado principalmente a ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en compresion de contexto: el modelo sirve para reproducir y evaluar el esquema CoMem de dos etapas sobre Mistral, comparando tasas de compresion (`cr`) en tareas de lenguaje.
- Experimentos academicos de LoRA por etapas: util para estudiar el efecto de congelar el encoder en la etapa 2 y entrenar solo el decoder.
- Prototipado de memorizacion eficiente en chat: permite probar si la compresion de contexto reduce el coste de atencion en conversaciones largas frente al base Mistral.
- Base para ablaciones de tasa de compresion: los distintos checkpoints `cr{rate}` permiten comparar calidad frente a compresion en un mismo pipeline.
- Reproduccion de resultados: como artefacto de referencia para validar implementaciones propias de CoMem con `modeling_comem.py`.
- Fine-tuning posterior sobre dominio especifico: los adaptadores pueden servir como punto de partida para tareas concretas, siempre que se disponga de los pesos base y del fichero de embedding/lm_head omitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base Mistral 7B: ~14-16 GB en FP16, ~8-10 GB en 8 bits, ~4-6 GB en 4 bits (estimacion estandar para 7B; no confirmada para este fine-tune).
- GPU recomendadas: A100 40/80 GB, H100 para servicio; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en FP16; RTX 4080/4070 Ti (16 GB) viables en 8 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: al ser adaptadores LoRA sobre Mistral, requiere cargar el base con vLLM, TGI, llama.cpp u Ollama y aplicar el adaptador; la carga con `trust_remote_code` y `modeling_comem.py` exige un entorno Python personalizado, no compatible directamente con servidores estandar sin adaptacion.
- Latencia y throughput estimados: no disponibles para este fine-tune; los del base Mistral 7B en A100 rondan decenas de tokens por segundo por peticion, sin cifras confirmadas aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CoMem-Mistral-7B (ssxada) | 7B + LoRA | base 32k (SWA 4k) | Apache 2.0 | Adaptadores en HF, requiere base | Experimental, sin benchmarks |
| Mistral-7B-Instruct-v0.2 | 7B | 32k | Apache 2.0 | Pesos completos en HF | Modelo base de referencia |
| Mistral-7B-v0.1 | 7B | 32k | Apache 2.0 | Pesos completos en HF | Version base sin instrucciones |
| Llama 3 8B Instruct | 8B | 8k | Llama 3 Community License | Pesos en HF/Meta | Alternativa con licencia restrictiva |

## Limitaciones y advertencias

- No incluye pesos base: hay que descargar Mistral-7B-Instruct-v0.2 por separado.
- Falta `decoder_first_last_layers.pth`: algunas rutas de inferencia no funcionan sin aportar ese artefacto localmente.
- Requiere `trust_remote_code=True`: ejecuta codigo del autor, con riesgo de seguridad en produccion.
- Sin model card detallada, sin benchmarks y sin pipeline declarado: no hay evidencia de calidad.
- Cero descargas y cero likes: sin validacion por la comunidad.
- Idiomas no declarados: probable sesgo hacia ingles por el base.
- Riesgo de alucinacion inherente al base Mistral 7B, no mitigado especificamente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja produccion sin validacion propia.
- Compatibilidad limitada con servidores de inferencia estandar (vLLM, TGI) por el codigo personalizado de carga.

## Enlaces

- Hugging Face: https://huggingface.co/ssxada/CoMem-Mistral-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Mistral 7B v0.1: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Anuncio Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
