# TradMed/llama-3.1-8b-nom-lora

## Resumen

TradMed/llama-3.1-8b-nom-lora es un adaptador LoRA (Low-Rank Adaptation) desarrollado por TradMed, que fine-tunea el modelo base unsloth/Llama-3.1-8B-bnb-4bit, una versión cuantizada en 4 bits del Llama-3.1-8B de Meta. El adaptador se distribuye bajo licencia Apache 2.0 y está pensado para su uso con la librería transformers y text-generation-inference. El repositorio tiene un tamaño de 0.2 GB, consistente con un adaptador LoRA de pocos parámetros, y no se proporciona información sobre el dataset ni el propósito específico del fine-tuning.

El modelo hereda las capacidades del Llama 3.1 8B original: arquitectura transformer decoder, ventana de contexto de 128K tokens (según las especificaciones de Meta) y soporte multilingüe, aunque la model card solo declara inglés. Al ser un adaptador LoRA, se puede combinar con el modelo base cuantizado para reducir los requisitos de memoria en inferencia. Su relevancia radica en que demuestra un flujo de fine-tuning eficiente con Unsloth, que afirma entrenar 2 veces más rápido que los métodos convencionales, aunque no se detallan los resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.1-8B (Transformer decoder) |
| Parametros totales | no disponible (adaptador LoRA, el modelo base tiene 8.03B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base, no confirmada para el adaptador) |
| Tipos de cuantizacion | modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre unsloth/Llama-3.1-8B-bnb-4bit, que es una version cuantizada en 4 bits del Llama-3.1-8B de Meta. La arquitectura subyacente es un transformer decoder con 8.03 mil millones de parametros, 32 capas, 8 cabezas de atencion por capa y una dimension de embedding de 4096. El adaptador LoRA anade matrices de bajo rango a las capas de atencion y feed-forward, lo que permite fine-tuning con un numero reducido de parametros entrenables.

El entrenamiento se realizo con la libreria Unsloth, que optimiza el proceso de fine-tuning mediante kernels personalizados y gestion eficiente de memoria, logrando una velocidad 2 veces superior a los metodos estandar. No se especifica el dataset utilizado, ni el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se indica el rango del LoRA ni el factor de escala. La model card solo menciona que el modelo fue "finetuned from" unsloth/Llama-3.1-8B-bnb-4bit y que se uso trl (Transformers Reinforcement Learning) como parte del stack.

## Capacidades

- Generacion de texto y completado de secuencias, heredadas del modelo base Llama 3.1 8B.
- Razonamiento y comprension de lenguaje natural en ingles (el adaptador solo declara este idioma).
- Soporte de tool calling y function calling, disponible en Llama 3.1 Instruct, aunque no se confirma si el adaptador preserva esta capacidad.
- Capacidad de manejar contextos largos de hasta 128K tokens, segun las especificaciones del modelo base.
- No se documentan capacidades especiales como modo thinking, vision o audio; el modelo es exclusivamente de texto.

## Casos de uso

- Adaptacion a dominios especificos: al ser un LoRA, se puede cargar sobre el modelo base para tareas concretas como clasificacion de textos medicos, legales o tecnicos, si el dataset de entrenamiento fue de ese tipo. No hay informacion publica sobre el dominio objetivo.
- Prototipado rapido de asistentes conversacionales: combinado con el modelo base cuantizado, permite desplegar un chatbot en hardware modesto gracias al bajo consumo de VRAM del adaptador.
- Experimentacion con fine-tuning eficiente: sirve como ejemplo de como aplicar Unsloth para adaptar Llama 3.1 a un caso de uso sin necesidad de recursos masivos.
- Generacion de codigo y asistencia en programacion: si el fine-tuning incluyo datos de codigo, el modelo podria usarse para autocompletado o generacion de funciones, aunque no hay evidencia de ello.
- Analisis de sentimiento o extraccion de informacion: tareas tipicas de fine-tuning sobre modelos base, pero sin confirmacion del dataset.
- Inferencia en entornos con restricciones de memoria: al ser un adaptador LoRA, se puede fusionar con el modelo base cuantizado y ejecutar en GPUs de consumo como RTX 3060 o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Llama 3.1 8B tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se puede atribuir ningun valor a este adaptador sin datos especificos. Se recomienda evaluar el modelo en el dominio de interes antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: al usar el modelo base en 4 bits (bnb-4bit) mas el adaptador LoRA, se requieren aproximadamente 6-8 GB de VRAM para una secuencia de longitud media. Con cuantizacion adicional del adaptador, podria reducirse a 4-6 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), o superiores. Para produccion con alto throughput, se recomienda A10G, A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 8 GB o mas, como RTX 3070, RTX 4060, o Apple Silicon con Metal.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y transformers con PEFT. El adaptador es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de la secuencia. Con una RTX 4090 y el modelo base en 4 bits, se puede esperar un throughput de 50-100 tokens/s, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| TradMed/llama-3.1-8b-nom-lora | LoRA sobre 8B | 128K (heredado) | Apache 2.0 | safetensors |
| meta-llama/Llama-3.1-8B | 8.03B | 128K | Llama 3.1 Community License | safetensors |
| unsloth/Llama-3.1-8B-bnb-4bit | 8.03B (4-bit) | 128K | Apache 2.0 | safetensors |

La comparativa se limita al modelo base y su version cuantizada, ya que no hay otros adaptadores LoRA de TradMed publicados. El adaptador anade una capa de personalizacion sobre el modelo base, pero sin informacion sobre el rendimiento especifico, no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se ha publicado informacion sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos por el fine-tuning.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, especialmente en tareas de generacion libre. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de idioma: la model card solo declara ingles; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Llama 3.1 de Meta tiene su propia licencia comunitaria que puede imponer restricciones adicionales para uso comercial. Es necesario revisar ambas licencias.
- El adaptador no incluye informacion sobre el rango del LoRA ni el metodo de entrenamiento, lo que dificulta la reproducibilidad.
- No hay garantias de que el adaptador funcione correctamente con versiones futuras de transformers o de la libreria PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TradMed/llama-3.1-8b-nom-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de Llama 3.1 de Meta: https://developer.meta.com/ai/models/llama-3/
- Pagina de Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:8b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
