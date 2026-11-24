# XxNoelW/Agora-1.0-hf

## Resumen

Agora 1.0 es un modelo de generacion de texto conversacional desarrollado por Noel (usuario XxNoelW) como asistente integrado del bot Agora. Se trata de un fine-tune de Qwen2.5-1.5B-Instruct, el modelo denso de 1.500 millones de parametros de Alibaba Cloud, ajustado mediante QLoRA sobre un conjunto curado de "lecciones" que el autor amplia y reentrena de forma periodica. El repositorio aloja los pesos en precision completa (fp16) para su uso con Hugging Face Transformers; existe una compilacion independiente en 4 bits orientada a ejecucion en navegador.

El modelo resuelve el caso de uso de un asistente conversacional ligero y desplegable en entornos con recursos limitados, manteniendo la ventana de contexto de 32.768 tokens y el formato de chat ChatML heredados de la base Qwen2.5. Su relevancia practica reside en el tamano (3,1 GB de repositorio, 1.543.714.304 parametros) y en la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

La informacion publicada por el autor es escasa: no se detalla la composicion del dataset de fine-tuning, el numero de tokens de entrenamiento ni resultados de evaluacion. La ficha refleja, por tanto, lo que consta en la model card y en los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tune de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | fp16 en este repositorio; existe una build 4-bit en XxNoelW/Agora-1.0; otras cuantizaciones (GGUF, AWQ, GPTQ) no publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso con atencion causal estandar, activaciones SwiGLU y normalizacion RMSNorm, que en su version base emplea atencion con RoPE y soporta una ventana de 32.768 tokens. Sobre esa base, el autor aplica un fine-tune con QLoRA (cuantizacion de los pesos base a 4 bits durante el entrenamiento y adaptadores de bajo rango) sobre un conjunto de datos descrito como "lecciones" curadas, que se amplia y reentrena con regularidad. No se especifica el numero de tokens de entrenamiento, la mezcla de datos, la configuracion de LoRA (rango, alpha, modulos objetivo) ni si se aplicaron etapas de RLHF o DPO posteriores.

La unica innovacion declarada es el enfoque de reentrenamiento iterativo sobre lecciones acumuladas, orientado a un asistente de dominio acotado. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La build en 4 bits para navegador sugiere un interes por el despliegue en el cliente (WebGPU/WASM), aunque no se detalla la herramienta de cuantizacion empleada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con formato ChatML.
- Razonamiento basico y respuesta a preguntas dentro de la ventana de 32.768 tokens.
- Generacion de codigo y matematicas basicas, heredadas de la base Qwen2.5-1.5B-Instruct (no verificadas en este fine-tune).
- Soporte de tool calling / function calling: no disponible de forma explicita en la model card; la base Qwen2.5 lo soporta, pero no se confirma que el fine-tune lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional embebido en el bot Agora: es el uso previsto por el autor; el modelo gestiona dialogos multi-turno con formato ChatML y una ventana de 32.768 tokens suficiente para conversaciones largas con historial extenso.
- Despliegue en navegador mediante la build 4-bit: al existir una version cuantizada a 4 bits, puede ejecutarse en el cliente sin backend dedicado, lo que reduce costes de infraestructura para asistentes de soporte en webs.
- Prototipado rapido de chatbots de dominio: el tamano de 1,5B permite iterar en una sola GPU consumer y validar flujos conversacionales antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion en texto: con contexto de 32K puede procesar documentos largos en ingles para tareas de resumen o extraccion de entidades, aunque sin garantias de calidad frente a modelos mayores.
- Generacion de respuestas en entornos con requisitos de privacidad: al caber en hardware local, permite procesar conversaciones sensibles sin enviar datos a APIs externas.
- Base para fine-tuning adicional: al ser Apache 2.0 y estar en safetensors fp16, sirve como punto de partida para ajustes especificos de dominio con QLoRA, replicando el proceso del autor.
- Educacion y experimentacion: util como caso de estudio de fine-tuning QLoRA sobre Qwen2.5-1.5B con despliegue dual (servidor y navegador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, entre 4 y 6 GB para contextos moderados. Con contexto completo de 32.768 tokens, la KV cache incrementa el consumo de forma notable (depende de la configuracion de atencion de Qwen2.5).
- VRAM estimada en 4 bits: en torno a 1 GB para pesos, con overhead adicional; apta para GPUs de gama baja y para ejecucion en navegador.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias para este tamano y solo aportarian throughput.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas en fp16 y con 2-4 GB en 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag presente), endpoints compatibles; llama.cpp, Ollama o vLLM no estan confirmados en la model card, aunque al ser un modelo Qwen2 en safetensors deberian poder convertirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Agora 1.0 | 1,5B | 32.768 | Apache 2.0 | en | Hugging Face (fp16 y 4-bit) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | multilingue (incluye es) | Hugging Face, amplio ecosistema de cuantizaciones |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | multilingue | Hugging Face, Ollama, llama.cpp |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | en (principalmente) | Hugging Face, llama.cpp |

Agora 1.0 se diferencia de su base Qwen2.5-1.5B-Instruct por el fine-tune QLoRA orientado a un asistente concreto y por la build 4-bit para navegador; en cambio, pierde el soporte multilingue declarado de la base (solo en) y no publica evaluaciones que permitan comparar su calidad. Frente a Llama 3.2 1B, Agora ofrece contexto menor (32K frente a 128K) y una licencia mas permisiva (Apache 2.0 frente a la licencia comunitaria de Meta). Frente a SmolLM2-1.7B, Agora tiene mas contexto (32K frente a 8K) y un enfoque mas especifico de asistente conversacional.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-1.5B-Instruct y entrenarse sobre un dataset curado no publicado, pueden persistir sesgos de la base y del corpus de fine-tuning.
- Riesgo de alucinacion: el propio autor advierte que, como cualquier modelo pequeno, puede cometer errores y que las respuestas importantes deben verificarse.
- Limitaciones de contexto e idioma: solo se declara ingles; el contexto maximo es de 32.768 tokens y el rendimiento mas alla de esa ventana no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se imponen restricciones adicionales conocidas.
- Caveats para produccion: no hay benchmarks publicados, ni documentacion del dataset de entrenamiento, ni garantias de que el fine-tune preserve tool calling o capacidades multilingues de la base; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion externa.
- El autor indica que el modelo se reentrena con regularidad, por lo que el comportamiento puede cambiar entre versiones sin aviso detallado.

## Enlaces

- Modelo en Hugging Face (fp16): https://huggingface.co/XxNoelW/Agora-1.0-hf
- Build 4-bit para navegador: https://huggingface.co/XxNoelW/Agora-1.0
- Sitio del proyecto Agora: https://xxnoelw.github.io/agora.bot/
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
