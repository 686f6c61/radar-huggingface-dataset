# YCH0924/llama2-7b-chat-humpback-lima-proto

## Resumen

`YCH0924/llama2-7b-chat-humpback-lima-proto` es un adaptador LoRA publicado en Hugging Face por el usuario YCH0924. A pesar del nombre, que sugiere un modelo de 7B, se trata de un adaptador PEFT entrenado sobre `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, un modelo de 1.100 millones de parametros. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no los pesos completos del modelo base, por lo que para utilizarlo es necesario cargar primero TinyLlama-1.1B-Chat-v1.0 y aplicar despues el adaptador.

El modelo se presenta como un experimento de ajuste fino conversacional con licencia Apache 2.0. La model card es la plantilla autogenerada por el `Trainer` de Hugging Face y no incluye descripcion, datos de entrenamiento, casos de uso previstos ni resultados de evaluacion. El campo de dataset figura como `None`, lo que indica que no se especifico la fuente de datos durante el entrenamiento.

Por su naturaleza (adaptador LoRA sobre un modelo de 1,1B, sin benchmarks publicados, sin documentacion y con cero descargas), debe considerarse un prototipo de investigacion o un artefacto de pruebas, no un modelo listo para produccion. Su interes es limitado salvo para quien quiera inspeccionar la configuracion de entrenamiento o reproducir el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama-1.1B-Chat-v1.0); este repositorio contiene un adaptador LoRA |
| Parametros totales | 1,1B en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat-v1.0 declara 2.048 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1,1B parametros derivado de Llama 2, con atencion causal estandar y RoPE. El adaptador es de tipo LoRA (PEFT 0.22.0), por lo que solo se entrenan matrices de baja dimension inyectadas en las capas del modelo base, manteniendo congelados los pesos originales.

Los hiperparametros declarados en la model card son: learning rate 2e-4, batch size de entrenamiento 2 con acumulacion de gradientes de 2 (batch efectivo 4), optimizador PagedAdamW de 8 bits con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 1 paso de warmup, 1 epoca, precision mixta nativa (AMP) y semilla 42. No se especifica el dataset de entrenamiento (aparece como `None`), no se documenta el numero de tokens vistos ni la composicion de los datos, y no hay constancia de fases de RLHF, DPO o evaluacion posterior. El entrenamiento se realizo con Transformers 5.24.1, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base TinyLlama-1.1B-Chat-v1.0.
- Ajuste fino adicional mediante LoRA sobre el modelo base; el efecto concreto del ajuste no esta documentado.
- Soporte de tool calling / function calling: no documentado; el modelo base no lo declara de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el modelo base esta entrenado principalmente en ingles, pero la informacion proporcionada no lo confirma para este adaptador).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con PEFT: cargar el adaptador sobre TinyLlama-1.1B-Chat-v1.0 para estudiar como afecta un ajuste LoRA de una epoca con learning rate 2e-4 al comportamiento conversacional del modelo base.
- Reproducibilidad de entrenamiento: replicar la configuracion declarada (PagedAdamW 8-bit, scheduler coseno, batch efectivo 4) como referencia para comparar con otros ajustes LoRA sobre el mismo modelo base.
- Prototipado rapido en entornos con recursos limitados: al partir de un modelo de 1,1B, el conjunto base + adaptador cabe en GPUs de consumo y permite iterar en local sin infraestructura dedicada.
- Docencia y formacion: usar el repositorio como ejemplo de artefacto PEFT autogenerado por el `Trainer`, util para explicar el flujo de publicacion de adaptadores en Hugging Face.
- Evaluacion comparativa de adaptadores: servir como linea base secundaria en estudios sobre el impacto de ajustes LoRA de bajo coste en modelos pequenos.
- Pruebas de integracion de PEFT con Transformers: validar pipelines de carga de adaptadores con las versiones de libreria declaradas (PEFT 0.22.0, Transformers 5.24.1).

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre del modelo y una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,1B en FP16 requiere aproximadamente 2,2 GB solo para pesos; en 8 bits, alrededor de 1,1 GB; en 4 bits, alrededor de 0,7 GB. El adaptador LoRA anade una cantidad marginal (0,1 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con overhead de activaciones; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante con cuantizacion; RTX 3060 12 GB o superior en FP16).
- Opciones de despliegue: transformers + peft (carga del adaptador), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, vLLM o TGI con soporte de adaptadores LoRA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 1,1B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion / benchmarks |
|---|---|---|---|---|---|
| YCH0924/llama2-7b-chat-humpback-lima-proto | 1,1B (base) + LoRA | no disponible | Apache 2.0 | safetensors (adaptador PEFT) | Sin benchmarks ni model card sustantiva |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Model card completa, evaluaciones publicadas por el autor |
| Llama 2 7B Chat | 7B | 4.096 tokens | Llama 2 Community License | safetensors, GGUF | Benchmarks publicados por Meta |
| Phi-2 | 2,7B | 2.048 tokens | MIT | safetensors | Benchmarks publicados por Microsoft |

La comparacion mas directa es con el propio modelo base: este repositorio no aporta un modelo nuevo, sino un ajuste LoRA cuyo efecto no esta evaluado. Frente a Llama 2 7B Chat o Phi-2, el conjunto base + adaptador es sustancialmente mas pequeno y menos capaz en tareas de razonamiento, pero tambien mucho mas ligero de desplegar.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada y no describe datos, objetivos ni evaluacion; no hay garantia sobre que comportamiento se ha ajustado.
- Dataset de entrenamiento desconocido (`None`): imposible evaluar sesgos, calidad o cobertura de los datos usados en el ajuste.
- Sin benchmarks: no hay evidencia de mejora respecto al modelo base; el ajuste podria incluso degradar capacidades previas.
- Riesgo de alucinacion: inherente a los modelos de 1,1B y no mitigado de forma documentada en este adaptador.
- Limitaciones de contexto e idioma: no documentadas; el modelo base TinyLlama-1.1B-Chat-v1.0 esta orientado principalmente al ingles y tiene una ventana de 2.048 tokens.
- Licencia Apache 2.0 en el adaptador: permite uso comercial, pero conviene verificar que el modelo base y los datos de entrenamiento (desconocidos) no impongan restricciones adicionales.
- Nombre enganoso: el identificador menciona "llama2-7b" aunque el modelo subyacente es TinyLlama de 1,1B; no debe confundirse con un modelo de 7B.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; no recomendado para produccion sin evaluacion propia.
- Requiere cargar el modelo base por separado: el repositorio solo contiene el adaptador, lo que anade un paso de integracion y dependencia de la disponibilidad de TinyLlama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YCH0924/llama2-7b-chat-humpback-lima-proto
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
