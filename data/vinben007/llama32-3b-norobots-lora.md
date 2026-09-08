# vinben007/llama32-3b-norobots-lora

## Resumen

El modelo `vinben007/llama32-3b-norobots-lora` es un adaptador LoRA creado por vinben007 sobre el modelo `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del `Llama 3.2 3B Instruct` de Meta. El repositorio tiene un tamaño de 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo.

El nombre sugiere un ajuste fino orientado a generar texto "sin robots", pero no se ofrece documentación sobre el dataset, el objetivo del entrenamiento ni los cambios de comportamiento respecto al modelo base. Es un modelo ligero que hereda la arquitectura y las capacidades base de Llama 3.2 3B, y se publica bajo licencia Apache 2.0, con la salvedad de la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Llama 3.2 3B) |
| Parametros totales | Aproximadamente 3,2 mil millones en el modelo base. El adaptador no especifica su numero de parametros (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits (bitsandbytes). El adaptador LoRA se distribuye en alta precision (safetensors). No se especifica cuantizacion para el adaptador |
| Idiomas soportados | Ingles (segun el modelo card). El modelo base Llama 3.2 3B soporta mas idiomas |
| Licencia | Apache 2.0 para el adaptador. El modelo base Llama 3.2 3B esta bajo la Licencia de Comunidad de Llama 3.2 |
| Formato de pesos | safetensors (adaptador LoRA) sobre modelo base en 4-bit (bnb) |
| Tamano del adaptador | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, que es un checkpoint de Llama 3.2 3B Instruct cuantizado a 4 bits mediante bitsandbytes. La arquitectura subyacente es un transformer decoder-only de 3 mil millones de parametros, y el adaptador LoRA no modifica esa arquitectura, sino que anade pesos entrenables sobre las capas lineales existentes.

El entrenamiento se realizo con [Unsloth](https://github.com/unslothai/unsloth). Segun el modelo card, el modelo fue entrenado "2x mas rapido con Unsloth", lo que sugiere el uso de su implementacion optimizada para ajuste fino de modelos cuantizados. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El nombre "norobots" no esta documentado en el repositorio.

## Capacidades

No se ha publicado documentacion especifica sobre las capacidades de este adaptador. Basandose en el modelo base Llama 3.2 3B Instruct, se esperan las siguientes capacidades, aunque no han sido validadas para este adaptador:

- Generacion de texto y seguimiento de instrucciones en ingles.
- Soporte de tool calling / function calling en el modelo base.
- Razonamiento basico y generacion de codigo limitada, segun las capacidades generales de Llama 3.2 3B.
- No se han verificado capacidades multimodales (vision, audio) para este adaptador.
- El modelo card indica `language: en`, lo que sugiere que el ajuste fino se ha realizado unicamente con datos en ingles.

## Casos de uso

No se dispone de informacion suficiente sobre el proposito del adaptador para definir casos de uso concretos y validados por el autor. Los siguientes usos son tecnicamente posibles para un LoRA sobre Llama 3.2 3B, pero no estan documentados ni garantizados:

- Experimentacion con ajuste fino ligero: cargar el adaptador con Transformers y PEFT sobre el modelo base 4-bit para realizar pruebas de fine-tuning de bajo coste.
- Personalizacion de un asistente de texto en ingles: aplicar el adaptador para modificar el estilo o el contenido de las respuestas del modelo base, aunque se desconoce la direccion del cambio.
- Evaluacion de la tecnica Unsloth: servir como ejemplo de entrenamiento 2x mas rapido sobre un modelo cuantizado, para reproducir el flujo y medir el tiempo de entrenamiento.
- Investigacion en alineacion: comparar las salidas del adaptador con las del modelo base para detectar posibles sesgos o cambios de comportamiento no documentados.
- Despliegue en entornos con recursos limitados: el adaptador de 0,1 GB junto con el modelo base 4-bit permite ejecutar un modelo de 3B en GPUs de consumo.
- Integracion en pipelines de generacion de texto en ingles: mediante vLLM o TGI con soporte de LoRA, para aplicaciones que requieren un modelo ligero sin necesidad de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama 3.2 3B en cuantizacion 4-bit ocupa aproximadamente entre 2 y 3 GB de VRAM. Con el adaptador LoRA y una ventana de contexto activa, se recomienda entre 4 y 6 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 3090, A10G, A100 o cualquier GPU con al menos 4 GB de VRAM para inferencia en 4-bit.
- Compatibilidad con GPU de consumo: si, gracias al modelo base cuantizado a 4 bits y al pequeno tamano del adaptador. Es viable en RTX 3060 o superior.
- Opciones de despliegue: compatible con Transformers + PEFT, vLLM (con soporte para LoRA), Hugging Face Text Generation Inference (TGI) y endpoints compatibles con la libreria Transformers. No es directamente desplegable en Ollama ni llama.cpp como LoRA, ya que estos requieren un modelo base unificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados por el autor ni datos de rendimiento que permitan una comparacion fiable. El adaptador no puede compararse directamente con modelos completos, ya que depende del modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vinben007/llama32-3b-norobots-lora | 0,1 GB (adaptador) + 3B base | 128K | Apache 2.0 (adaptador) | HuggingFace |
| unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit | 3B (4-bit) | 128K | Llama 3.2 Community License | HuggingFace |

## Limitaciones y advertencias

- No se conocen sesgos especificos del adaptador, pero al estar entrenado sobre datos en ingles y sin documentacion, puede heredar los sesgos del modelo base Llama 3.2.
- Riesgo de alucinacion inherente a los modelos de lenguaje de tamano pequeno. El modelo base 3B es menos capaz que modelos mas grandes como Llama 3.1 405B, segun la propia documentacion de Meta.
- Limitaciones de idioma: el adaptador esta entrenado solo en ingles, lo que reduce su utilidad para otros idiomas.
- El adaptador no es un modelo autonomo: requiere cargar el modelo base cuantizado 4-bit. Si se utiliza sin ese modelo base, no funciona.
- Licencia: aunque el adaptador se publica con Apache 2.0, el modelo base Llama 3.2 3B Instruct esta sujeto a la Licencia de Comunidad de Llama 3.2. Cualquier uso comercial debe cumplir con los terminos de esa licencia.
- No se ha publicado informacion sobre la calidad del ajuste fino, por lo que su comportamiento en produccion es impredecible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vinben007/llama32-3b-norobots-lora
- Modelo base en HuggingFace: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Llama 3.2 3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Llama 3.2 3B Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
