# Vanessa-F/Mixtral-8x7B-MaskCoFT

## Resumen

Mixtral-8x7B-MaskCoFT es un ajuste fino supervisado (SFT) del modelo Mixtral-8x7B de Mistral AI, publicado por la usuaria Vanessa-F en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 46.702.792.704 parametros totales, distribuidos en ocho expertos por capa, de los que aproximadamente 12.900 millones se activan por token. El nombre del repositorio sugiere un entrenamiento orientado a "Masked CoFT" (probablemente una variante de continuous fine-tuning con enmascaramiento de tokens), aunque la model card no documenta la metodologia ni el dataset empleado.

El modelo hereda la ventana de contexto de 32.768 tokens caracteristica de la familia Mixtral 8x7B y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia practica es limitada: cuenta con 12 descargas y 0 likes, y la model card publica unicamente el campo de licencia, sin informacion sobre datos de entrenamiento, hiperparametros, evaluacion o uso previsto. Debe tratarse, por tanto, como un checkpoint experimental de terceros y no como una alternativa validada a Mixtral-8x7B-Instruct.

La ficha siguiente describe las caracteristicas tecnicas inferibles del checkpoint (arquitectura, tamano, formato) y marca explicitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (8 expertos por capa, top-2 enrutamiento), derivada de Mixtral-8x7B |
| Parametros totales | 46.702.792.704 (46,7 B) |
| Parametros activos | ~12,9 B por token (estimacion estandar de Mixtral 8x7B; no confirmada en la model card) |
| Longitud de contexto | 32.768 tokens (heredada de Mixtral 8x7B; no documentada en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors en precision completa; no se publican GGUF ni AWQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 93,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mixtral-8x7B: un transformer decoder-only con atencion de multiples cabezas, RoPE, SwiGLU en las capas feed-forward y una capa MoE que sustituye a la FFN densa en cada bloque. Cada capa MoE contiene ocho expertos y un router que selecciona los dos expertos con mayor logit por token, de modo que el coste computacional por token corresponde a un modelo de ~13 B aunque la memoria requerida sea la de 46,7 B. Los tensores publicados suman 46.702.792.704 parametros, coherente con el checkpoint original.

El autor no documenta el proceso de ajuste fino: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si se aplico enmascaramiento de perdida sobre instrucciones o respuestas, si hubo etapas de DPO/RLHF ni los hiperparametros (learning rate, epochs, precision, hardware). El sufijo "MaskCoFT" apunta a una variante de fine-tuning con mascara de tokens, pero no hay paper, blog ni configuracion de entrenamiento enlazados en el repositorio. Tampoco se especifica si el checkpoint parte de la version base o de la version Instruct de Mixtral-8x7B, lo que condiciona su comportamiento conversacional.

## Capacidades

- Generacion de texto autoregresiva en el rango de capacidades de Mixtral-8x7B, condicionada al ajuste fino no documentado.
- Razonamiento multi-paso y respuesta a instrucciones, presumiblemente reforzado por el SFT (no verificado).
- Generacion de codigo y matematicas a nivel del modelo base (no evaluado en este checkpoint).
- Soporte multilingue heredado del modelo original (es, fr, en, de, it, entre otros), aunque no declarado en la model card.
- Ventana de contexto de 32.768 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Tool calling y function calling: no documentado para este checkpoint.
- Modo "thinking", vision o audio: no disponible.
- Capacidades de agente: no documentadas ni evaluadas.

## Casos de uso

- Evaluacion comparativa de ajustes finos: el checkpoint permite medir el efecto de un SFT no documentado frente a Mixtral-8x7B-Instruct en tareas de instruccion, siempre con validacion propia.
- Experimentacion academica con MoE: util para estudiar el enrutamiento de expertos y el comportamiento de checkpoints ajustados por terceros en entornos controlados.
- Generacion de texto asistida en dominio general: resumen y reescritura de documentos de hasta 32k tokens, con revision humana obligatoria por la ausencia de evaluacion.
- Prototipado de asistentes conversacionales multi-turno: la ventana de contexto permite mantener historiales largos, aunque la calidad conversacional debe medirse empiricamente.
- Base para cuantizacion y despliegue en local: al publicarse en safetensors, puede convertirse a GGUF o AWQ y probarse en estaciones de trabajo con suficiente VRAM o RAM.
- Investigacion sobre tecnicas de enmascaramiento en SFT: sirve como punto de partida para reproducir o contrastar variantes de "Masked CoFT".
- Generacion de codigo en entornos de prueba: uso en sandbox con tests automatizados, nunca en produccion sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: ~93,4 GB de pesos, por lo que se requieren al menos 2 GPU de 80 GB (A100/H100) o 4 GPU de 48 GB para inferencia sin cuantizar.
- Cuantizacion a 8 bits: ~47 GB, viable en una A100 80 GB o H100 80 GB.
- Cuantizacion a 4 bits: ~24-26 GB, viable en una RTX 4090 (24 GB) con margen ajustado, o en 2x RTX 4090.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en consumer, RTX 4090 y RTX 3090 en configuracion multi-GPU.
- Despliegue: vLLM y TGI para serving con tensor parallelism; llama.cpp y Ollama tras conversion a GGUF; no se incluyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles; al activar ~12,9 B parametros por token, el throughput esperado es superior al de un modelo denso de 46,7 B, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mixtral-8x7B-MaskCoFT | 46,7 B (MoE, ~12,9 B activos) | 32.768 (heredado) | Apache 2.0 | Hugging Face, 12 descargas | SFT no documentado, sin benchmarks |
| Mixtral-8x7B-Instruct-v0.1 | 46,7 B (MoE, ~12,9 B activos) | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Ajuste oficial de Mistral AI con evaluacion publicada |
| Mixtral-8x7B-v0.1 | 46,7 B (MoE, ~12,9 B activos) | 32.768 | Apache 2.0 | Hugging Face | Modelo base sin ajuste a instrucciones |
| Qwen1.5-32B / Qwen2.5-32B | 32 B densos | 32.768 (Qwen2.5 hasta 131.072) | Apache 2.0 | Hugging Face | Alternativa densa con contexto ampliado en versiones recientes |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros, evaluacion ni uso previsto; no debe asumirse calidad conversacional.
- Riesgo elevado de alucinacion y de degradacion por sobreajuste al dataset de SFT, desconocido.
- Sesgos no evaluados: al no publicarse analisis, se heredan los sesgos de los datos de Mistral AI y del corpus de ajuste.
- Idiomas no declarados: el soporte multilingue es una inferencia del modelo base, no una garantia del checkpoint.
- Trazabilidad limitada: 12 descargas y 0 likes indican ausencia de validacion por la comunidad; no hay issues ni discusiones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia del checkpoint base.
- El nombre "MaskCoFT" no esta definido en el repositorio, por lo que no puede reproducirse el entrenamiento.
- No se incluyen pesos cuantizados ni plantilla de chat; el formato de prompt debe inferirse y validarse.

## Enlaces

- Hugging Face: https://huggingface.co/Vanessa-F/Mixtral-8x7B-MaskCoFT
- Modelo base de referencia (Mixtral-8x7B): https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- Version Instruct oficial: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Paper de Mixtral (Mistral AI): https://arxiv.org/abs/2401.04088
- Blog de Mistral AI sobre Mixtral: https://mistral.ai/news/mixtral-of-experts/
