# zyss1/qwen25-7b-openligeng

## Resumen

Open Ligeng es un adaptador LoRA de la segunda ronda de entrenamiento publicado por el usuario zyss1 sobre el modelo base Qwen2.5-7B-Instruct. Su objetivo es reproducir un estilo de conversacion breve y coloquial en chino, orientado a la simulacion de un personaje concreto. El repositorio no contiene pesos completos, sino unicamente el adaptador PEFT en formato safetensors (0,3 GB), que debe cargarse sobre el modelo base original de Qwen.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El adaptador anade un delta de bajo rango sobre las capas del modelo base, por lo que las capacidades generales de razonamiento, codigo y multilingueismo dependen casi por completo de Qwen2.5-7B-Instruct, mientras que el LoRA modula el registro y la longitud de las respuestas.

Es relevante ahora como ejemplo de la practica habitual de publicar adaptadores de estilo sobre modelos abiertos: bajo coste de entrenamiento, licencia Apache 2.0 y despliegue sencillo mediante PEFT o vLLM con soporte de LoRA. No obstante, la model card advierte de que los datos de entrenamiento no son publicos, que el modelo puede repetir frases, responder de forma tangencial o inventar contenido, y que sus salidas no deben atribuirse a ninguna persona real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | ~7.600 millones en el modelo base; el adaptador LoRA ocupa 0,3 GB en disco |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (no se documenta modificacion por el adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | chino (zh) declarado; el modelo base soporta multiples idiomas, pero el adaptador esta orientado al chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere Qwen/Qwen2.5-7B-Instruct aparte |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal, RoPE y normalizacion RMSNorm, entrenado por Alibaba Qwen con un corpus multilingue de varios billones de tokens y posteriormente alineado mediante SFT y optimizacion por preferencias. El repositorio solo contiene el delta LoRA de segunda ronda, sin informacion sobre el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleada.

No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO adicional sobre el adaptador. La model card indica explicitamente que los datos de entrenamiento no son publicos y que el resultado es una simulacion de estilo, no una replica de una persona real. No se documentan innovaciones tecnicas propias mas alla del uso de LoRA sobre un modelo base ya alineado.

## Capacidades

- Generacion de texto conversacional en chino con respuestas breves y registro coloquial.
- Simulacion de estilo y personaje, orientada a dialogos de tipo chat.
- Hereda del modelo base capacidades de razonamiento, matematicas y generacion de codigo, aunque el adaptador no las refuerza.
- Soporte de conversacion multi-turno a traves del formato de chat de Qwen2.5.
- Capacidad multilingue heredada del modelo base, no garantizada por el adaptador.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso especifico del adaptador.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Prototipos de chatbots de personaje en chino: el adaptador permite respuestas cortas y coloquiales con un coste de almacenamiento minimo (0,3 GB), cargandolo sobre Qwen2.5-7B-Instruct en entornos de demostracion.
- Investigacion sobre estilizacion mediante LoRA: sirve como caso de estudio para medir cuanto cambia el registro de un modelo alineado tras una segunda ronda de adaptacion de bajo rango.
- Pruebas de evaluacion de deriva estilistica: util para comparar respuestas del modelo base frente al adaptador y detectar repeticiones, evasivas o alucinaciones introducidas por el LoRA.
- Despliegue local de bajo coste: al requerir solo el adaptador y el base, puede servirse con PEFT, vLLM o TGI en una unica GPU de 24 GB en precision BF16 o en GPU de consumo con cuantizacion del base.
- Generacion de dialogos sinteticos para aumento de datos: util para crear corpus de conversacion informal en chino, siempre con revision humana por el riesgo de contenido inventado.
- Demostraciones interactivas con interfaz web: el repositorio GitHub del autor incluye una pagina de chat local y una interfaz HTTP de inferencia para probar el adaptador rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~15-16 GB en BF16 para el modelo base completo mas el adaptador; ~5-6 GB con cuantizacion de 4 bits del base.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para inferencia en BF16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 y en RTX 3090, 4080 o 4070 Ti con cuantizacion de 4 u 8 bits del modelo base.
- Opciones de despliegue: PEFT con Transformers, vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama tras fusionar o convertir el adaptador al formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zyss1/qwen25-7b-openligeng | ~7,6 B (base) + LoRA | 32.768 tokens (base) | Apache 2.0 | safetensors (LoRA) | Adaptador de estilo en chino; requiere el base |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base alineado, multilingue, sin estilizacion |
| Qwen/Qwen2.5-7B | ~7,6 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Version preentrenada sin alineacion conversacional |
| Adaptadores LoRA de estilo comparables | variable | depende del base | variable | safetensors (LoRA) | No se dispone de un comparable directo documentado en la informacion disponible |

## Limitaciones y advertencias

- La model card advierte de posibles repeticiones, respuestas que no responden a la pregunta y contenido inventado.
- Los datos de entrenamiento no son publicos, por lo que no puede auditarse la procedencia ni los sesgos del adaptador.
- El adaptador esta orientado al chino; su comportamiento en castellano u otros idiomas no esta validado.
- Las salidas son una simulacion de estilo y no deben presentarse como declaraciones de una persona real.
- No se documenta el rango ni la configuracion del LoRA, lo que dificulta reproducir el entrenamiento.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar tambien las condiciones del modelo base Qwen2.5-7B-Instruct.
- El repositorio no incluye pesos completos: sin el modelo base, el adaptador no es utilizable.
- No hay benchmarks publicados que permitan estimar la degradacion respecto al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zyss1/qwen25-7b-openligeng
- Repositorio GitHub del autor: https://github.com/ZYY799/Open-Ligeng
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
