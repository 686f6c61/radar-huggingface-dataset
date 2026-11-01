# vllm-project/DeepSeek-V2-Lite-Chat-All-LoRA

## Resumen

DeepSeek-V2-Lite-Chat-All-LoRA es un adaptador LoRA publicado por el usuario wuchen01 y replicado en la organizacion vllm-project como copia de seguridad para los tests de integracion continua de vLLM. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que se aplican sobre el modelo base deepseek-ai/DeepSeek-V2-Lite-Chat, un transformer MoE de DeepSeek con 15.700 millones de parametros totales y 2.400 millones activos por token.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) sobre lo que la model card denomina "identity dataset", con el objetivo aparente de ajustar la identidad o el estilo de respuesta del modelo base. La informacion publicada sobre la composicion del dataset, los idiomas y los resultados es practicamente inexistente: la model card es la generada automaticamente por el Trainer de HuggingFace y contiene multiples secciones marcadas como "More information needed".

Su relevancia es fundamentalmente practica para el ecosistema de inferencia: al estar alojado bajo la organizacion vllm-project, sirve como checkpoint de referencia para validar el soporte de LoRA y de arquitecturas MoE en vLLM. Para desarrolladores que quieran reproducir ese entorno de pruebas o experimentar con adaptadores sobre DeepSeek-V2-Lite, es un punto de partida util, pero no debe confundirse con un modelo afinado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE DeepSeek-V2-Lite-Chat |
| Parametros totales | no disponible (el adaptador ocupa 0,6 GB; el modelo base tiene 15.700 M) |
| Parametros activos | no disponible (el modelo base activa 2.400 M por token) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre DeepSeek-V2-Lite-Chat, un transformer con mezcla de expertos (MoE) que combina atencion multi-cabeza con latente comprimida (MLA) y expertos enrutados de forma dispersa. El LoRA modifica unicamente un subconjunto de matrices de proyeccion, manteniendo congelados los pesos del modelo base; el repositorio pesa 0,6 GB, coherente con un adaptador de rango bajo sobre un modelo de este tamano.

El entrenamiento se realizo con LlamaFactory y PEFT 0.12.0 sobre Transformers 4.49.0, PyTorch 2.6.0+cu124 y Datasets 3.3.2. Los hiperparametros declarados son: learning rate 1e-4, batch total de 2 (1 por dispositivo en 2 GPUs), 10 epocas, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 % y semilla 42. No se especifica el rango del LoRA, el alpha, el dropout ni el numero de tokens de entrenamiento. Tampoco se documenta si hubo RLHF o DPO; por la nomenclatura "sft" y el pipeline de LlamaFactory, se trata exclusivamente de ajuste supervisado.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base DeepSeek-V2-Lite-Chat.
- Razonamiento y codigo: el modelo base esta disenado para tareas de razonamiento, matematicas y programacion, aunque el adaptador no documenta evaluaciones propias.
- Tool calling y function calling: capacidad del modelo base, no verificada tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, sin validacion especifica en este adaptador.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.
- Ajuste de identidad: el entrenamiento sobre un "identity dataset" sugiere un cambio de persona o de estilo de respuesta, sin detalle publico sobre su alcance.

## Casos de uso

- Validacion de integracion LoRA en vLLM: el checkpoint existe precisamente para que la CI de vLLM pruebe la carga de adaptadores PEFT sobre un modelo MoE; se usaria como fixture en pipelines de test.
- Reproduccion de entornos de evaluacion: investigadores que necesiten un adaptador publico sobre DeepSeek-V2-Lite-Chat pueden cargarlo con `PeftModel.from_pretrained` para comparar comportamientos frente al modelo base.
- Experimentacion con ajuste de identidad: util para estudiar como un SFT breve (10 epocas, batch 2) altera el estilo de respuesta de un MoE de 15.700 M de parametros.
- Base para nuevos adaptadores: al ser un LoRA de rango bajo, puede servir como punto de partida o como referencia de configuracion (learning rate, scheduler) para fine-tunings propios.
- Pruebas de serving multi-adaptador: escenario en el que vLLM sirve el modelo base con varios LoRA simultaneos y se necesita un adaptador adicional para validar el enrutamiento.
- Docencia y formacion: ejemplo practico de como se estructura un repositorio PEFT generado por LlamaFactory y que metadatos incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara una entrada "sft" con la lista de resultados vacia, y la seccion de resultados de entrenamiento de la model card esta en blanco.

## Requisitos de hardware

- VRAM para el adaptador: 0,6 GB en disco; en memoria, el coste adicional del LoRA es marginal frente al modelo base.
- VRAM para el modelo base en bf16: aproximadamente 31-32 GB para los 15.700 M de parametros, mas overhead de activaciones y cache KV.
- VRAM para el modelo base en cuantizacion de 4 bits: del orden de 9-10 GB, lo que lo hace viable en GPUs de consumo alto.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para cuantizacion de 8 bits; RTX 3090/4090 con 4 bits para despliegue ajustado.
- Despliegue: vLLM es el entorno de referencia (el checkpoint se mantiene para su CI); tambien es compatible con llama.cpp/Ollama si se fusiona el adaptador en el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del modelo base, del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V2-Lite-Chat-All-LoRA (este) | Adaptador sobre 15.700 M (2.400 M activos) | no disponible | other | safetensors (PEFT) | Copia de CI de vLLM; sin benchmarks publicados |
| deepseek-ai/DeepSeek-V2-Lite-Chat | 15.700 M (2.400 M activos) | no disponible en esta ficha | licencia del modelo base | safetensors | Modelo base original de DeepSeek |
| wuchen01/DeepSeek-V2-Lite-Chat-All-LoRA | Adaptador sobre 15.700 M | no disponible | other | safetensors (PEFT) | Repositorio original del que este es copia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones; cualquier uso en produccion requiere una evaluacion propia.
- Riesgo de alucinacion inherente al modelo base, no mitigado ni medido por este adaptador.
- El ajuste sobre un "identity dataset" sin descripcion puede alterar el comportamiento del modelo de formas no previstas, incluyendo respuestas mas rigidas o inconsistentes.
- La licencia "other" no aclara los terminos de uso comercial; es necesario consultar la licencia del modelo base DeepSeek-V2-Lite-Chat y del repositorio original antes de desplegarlo.
- El repositorio es una copia de seguridad para CI, no un artefacto mantenido con soporte; el autor original esta en una cuenta personal y el commit replicado es `2d66f69`.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingue adecuado.
- El entrenamiento con batch total de 2 y 10 epocas sobre un dataset no descrito sugiere un ajuste limitado y potencialmente sobreajustado a un conjunto pequeno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/DeepSeek-V2-Lite-Chat-All-LoRA
- Repositorio original: https://huggingface.co/wuchen01/DeepSeek-V2-Lite-Chat-All-LoRA
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite-Chat
- vLLM: https://github.com/vllm-project/vllm
- LlamaFactory: https://github.com/hiyouga/LLaMA-Factory
- PEFT: https://github.com/huggingface/peft
