# vllm-project/TinyLlama-1.1B-Chat-v1.0-AWQ

## Resumen

TinyLlama-1.1B-Chat-v1.0-AWQ es una version cuantizada a 4 bits mediante AWQ (Activation-aware Weight Quantization) del modelo conversacional TinyLlama-1.1B-Chat-v1.0, desarrollado originalmente por el proyecto TinyLlama. La cuantizacion la realizo TheBloke y esta copia concreta la mantiene el equipo de vLLM en su organizacion de HuggingFace como checkpoint de CI, con el objetivo declarado de reducir el riesgo de suministro al no depender de una cuenta personal.

El modelo base es un transformer decoder-only de tipo Llama con 1.100.048.384 parametros, entrenado sobre 3 billones de tokens segun la documentacion del proyecto original (dato habitual en TinyLlama, aunque no se detalla en la informacion disponible de esta ficha). Esta pensado para tareas de generacion de texto y conversacion en ingles con requisitos de hardware muy bajos, lo que lo hace util para entornos con GPUs de gama baja, prototipado rapido y pruebas de pipelines de inferencia.

La relevancia de esta ficha concreta es doble: por un lado, documenta un checkpoint AWQ de referencia usado por vLLM en sus pruebas de integracion continua; por otro, sirve como ejemplo de cuantizacion de un modelo pequeno donde el ahorro de VRAM (de aproximadamente 2,2 GB en fp16 a 0,77 GB en AWQ 4 bits) permite ejecutarlo en GPUs consumer modestas o incluso compartir espacio con otros procesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, tipo `tinyllama`) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en la calibracion AWQ; no se especifica contexto maximo distinto en la informacion disponible) |
| Tipos de cuantizacion | AWQ 4 bits, group size 128, kernel GEMM |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sharded), cuantizacion AWQ |

## Arquitectura y entrenamiento

El modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only con la arquitectura Llama (atencion multi-cabeza con RoPE, capas SwiGLU en el FFN y normalizacion RMSNorm), con aproximadamente 1,1 mil millones de parametros. Segun los metadatos de la model card, el entrenamiento utilizo los datasets cerebras/SlimPajama-627B, bigcode/starcoderdata y OpenAssistant/oasst_top1_2023-08-25, y el ajuste conversacional sigue la plantilla de prompt de tipo Zephyr (etiquetas `<|system|>`, `<|user|>`, `<|assistant|>`).

Esta version concreta no reentrena el modelo: aplica cuantizacion AWQ de 4 bits con group size 128 sobre los pesos originales en fp16. AWQ es un metodo de cuantizacion de pesos de bajo bit que preserva las activaciones mas relevantes mediante escalado por canal, y en la practica ofrece una calidad equivalente o superior a GPTQ con inferencia mas rapida en Transformers. La calibracion se realizo con el dataset VMware Open Instruct y longitud de secuencia 2048. El resultado son ficheros safetensors fragmentados que ocupan aproximadamente 0,77 GB, frente a los aproximadamente 2,2 GB del modelo en fp16. No se documentan en la informacion disponible innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte de mensajes de sistema, usuario y asistente mediante la plantilla Zephyr.
- Razonamiento basico y respuesta a preguntas generales, limitado por el tamano del modelo (1,1 B de parametros).
- Generacion de codigo sencillo, ya que el modelo base se entreno parcialmente con `bigcode/starcoderdata`.
- Instrucciones y ajuste conversacional derivados de OpenAssistant, lo que le permite seguir formatos de dialogo y tareas de instruccion simples.
- No se documenta soporte nativo de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes, multi-step reasoning explicito ni modo thinking.
- No dispone de capacidades multimodales (vision, audio) ni de contexto largo mas alla de los 2048 tokens usados en la calibracion.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Pruebas de integracion y CI en vLLM: este checkpoint se mantiene precisamente para validar el soporte de modelos AWQ en el pipeline de integracion continua de vLLM, por lo que es adecuado como fixture reproducible en tests de regresion de inferencia.
- Prototipado rapido de aplicaciones conversacionales: con solo 0,77 GB de pesos, permite levantar un endpoint de chat en minutos en una GPU consumer para validar prompts, plantillas y flujos antes de migrar a un modelo mayor.
- Asistentes de texto embebidos en entornos con recursos limitados: su tamano permite desplegarlo en GPUs de 4-8 GB o compartir GPU con otros servicios, gestionando conversaciones de hasta 2048 tokens.
- Generacion de texto auxiliar en pipelines de datos: por ejemplo, resumenes cortos, reformulacion de frases o etiquetado preliminar en ingles, donde el coste por token es minimo.
- Educacion y divulgacion: sirve para demostrar como funciona la cuantizacion AWQ y como se compara la salida de un modelo cuantizado frente al original en fp16 en tareas de chat.
- Benchmarking de infraestructura: util para medir latencia y throughput de vLLM, TGI o AutoAWQ en GPUs pequenas y comparar configuraciones de batching sin consumir recursos significativos.
- Generacion de codigo basica en herramientas internas: autocompletado o sugerencias de fragmentos cortos en ingles, con la advertencia de que la calidad es limitada por el tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,2 GB para los pesos AWQ 4 bits, mas overhead de KV cache y runtime; en la practica, entre 1,5 y 2,5 GB segun longitud de contexto y batch.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; AWQ solo es compatible con GPUs NVIDIA en Linux y Windows.
- Cabe en GPUs consumer: si, por ejemplo RTX 3050, RTX 3060, RTX 4060, GTX 1660 Super o superiores; tambien en GPUs de portatiles con 4-6 GB.
- Opciones de despliegue: vLLM (version 0.2.2 o posterior), Hugging Face TGI, AutoAWQ, Transformers 4.35.0 o posterior, y text-generation-webui con el loader AutoAWQ. Para CPU o macOS se recomienda usar las versiones GGUF en lugar de AWQ.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 1,1 B en 4 bits, se espera una latencia muy baja en GPUs modernas, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-AWQ (esta ficha) | 1,1 B | 2048 tokens (calibracion) | AWQ 4 bits, GS 128 | Apache 2.0 | HuggingFace (vLLM-project y TheBloke) |
| TinyLlama-1.1B-Chat-v1.0 (fp16) | 1,1 B | 2048 tokens | fp16 | Apache 2.0 | HuggingFace (TinyLlama) |
| TinyLlama-1.1B-Chat-v1.0-GPTQ | 1,1 B | 2048 tokens | GPTQ 4 bits | Apache 2.0 | HuggingFace (TheBloke) |
| TinyLlama-1.1B-Chat-v1.0-GGUF | 1,1 B | 2048 tokens | GGUF 2-8 bits | Apache 2.0 | HuggingFace (TheBloke) |

Las alternativas comparadas son variantes de cuantizacion del mismo modelo base, ya que no se dispone de datos de rendimiento frente a otros modelos de la misma categoria en la informacion proporcionada. La diferencia principal entre ellas es el backend de inferencia soportado (AWQ para GPUs NVIDIA, GPTQ para GPUs NVIDIA, GGUF para CPU y GPU) y el espacio en disco.

## Limitaciones y advertencias

- El modelo solo soporta ingles de forma oficial; el rendimiento en castellano u otros idiomas sera deficiente.
- Con 1,1 B de parametros, la tasa de alucinacion es elevada en tareas de conocimiento factual y razonamiento complejo; no es adecuado para aplicaciones que requieran alta fiabilidad sin verificacion externa.
- La ventana de contexto efectiva es de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- La cuantizacion AWQ 4 bits puede introducir degradacion adicional de calidad respecto al modelo fp16, especialmente en tareas de razonamiento y generacion de codigo.
- AWQ solo funciona en GPUs NVIDIA (Linux y Windows); en macOS o CPU hay que usar las variantes GGUF.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base TinyLlama puede heredar sesgos de sus datos de entrenamiento (SlimPajama, StarCoderData, OpenAssistant) que no se documentan en esta ficha.
- Esta copia concreta es un artefacto de CI de vLLM; para uso en produccion conviene evaluar el checkpoint original de TinyLlama o los de TheBloke y verificar la integridad del commit.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones por parte de vLLM-project para este repositorio.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/vllm-project/TinyLlama-1.1B-Chat-v1.0-AWQ
- Checkpoint AWQ original de TheBloke: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-AWQ
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Variante GPTQ de TheBloke: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GPTQ
- Variantes GGUF de TheBloke: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de AutoAWQ: https://github.com/casper-hansen/AutoAWQ
- Repositorio de Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Repositorio de text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Dataset de calibracion AWQ: https://huggingface.co/datasets/VMware/open-instruct
- Dataset SlimPajama-627B: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset OpenAssistant oasst_top1_2023-08-25: https://huggingface.co/datasets/OpenAssistant/oasst_top1_2023-08-25
