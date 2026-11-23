# yeahyeahyeahyeah123123/qwen3.5-alpaca-cleaned

## Resumen

Qwen3.5-alpaca-cleaned es un ajuste fino (fine-tuning) del modelo base Qwen3.5-2B, desarrollado por el usuario yeahyeahyeahyeah123123 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de aproximadamente 2.213 millones de parametros (2,2B), derivado del checkpoint de Unsloth (unsloth/Qwen3.5-2B) y entrenado sobre el dataset yahma/alpaca-cleaned, un conjunto de instrucciones en ingles ampliamente utilizado para ajuste supervisado.

El modelo se distribuye en formato MLX (libreria de Apple para ejecucion en silicio Apple) y safetensors, lo que lo orienta al despliegue en Macs con chip Apple Silicon mas que a entornos CUDA tradicionales. Es un modelo conversacional (pipeline text-generation) pensado para tareas de instruccion en ingles, con un tamano reducido que permite ejecucion local en hardware de consumo.

Su relevancia es limitada: se trata de un ajuste experimental con cero descargas y cero likes en el momento de la ficha, sin model card sustantiva mas alla de metadatos. No se dispone de informacion publicada sobre benchmarks, composicion exacta del entrenamiento ni hiperparametros, por lo que su evaluacion debe abordarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors y formato MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen3.5-2B, que a su vez deriva de la familia Qwen3.5 de Alibaba. La arquitectura subyacente es de tipo transformer, aunque la model card no detalla configuracion de capas, atencion ni dimensiones ocultas. El entrenamiento se realizo sobre el dataset yahma/alpaca-cleaned, un corpus de instrucciones en ingles de aproximadamente 51.000 ejemplos, tipicamente usado para ajuste supervisado (SFT) con formato instruccion-respuesta.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El pipeline de ajuste parece haberse realizado con Unsloth (segun los tags) y exportado a MLX, pero los hiperparametros y la receta concreta no estan publicados.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a seguir instrucciones.
- Razonamiento basico y respuesta a preguntas derivado del modelo base Qwen3.5-2B.
- Generacion de codigo y matematicas simples (capacidad heredada del modelo base, no verificada en este ajuste).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede gestionar dialogos de instruccion simples en local, adecuado para validar flujos antes de escalar a modelos mayores.
- Ejecucion local en Apple Silicon: al distribuirse en formato MLX, encaja en Macs con chip M-series para inferencia offline sin GPU dedicada, util para demos y pruebas de concepto.
- Generacion de respuestas a instrucciones en pipelines de bajo coste: con 2,2B de parametros, permite iterar sobre tareas de texto sin depender de APIs externas.
- Filtrado y reescritura de texto en ingles: tareas de resumen, parafraseo o clasificacion ligera donde la latencia y el coste importan mas que la precision maxima.
- Educacion y experimentacion academica: sirve como base para estudiar el efecto del ajuste con alpaca-cleaned sobre un modelo Qwen3.5-2B, comparando comportamiento antes y despues del fine-tuning.
- Base para ajustes posteriores: al ser Apache 2.0 y de tamano reducido, puede reentrenarse o adaptarse (LoRA) en hardware modesto para dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB en precision original (tamano del repo); en cuantizacion de 4 bits podria reducirse a ~1,5-2 GB, aunque no se ofrecen pesos cuantizados en el repo.
- GPU recomendadas: no aplica de forma directa al estar en formato MLX; para CUDA seria necesario convertir los pesos a safetensors/PyTorch o GGUF.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060) tras conversion; en Apple Silicon, en cualquier Mac con 8 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (nativo), llama.cpp/Ollama (tras conversion a GGUF), vLLM/TGI (tras conversion a safetensors de PyTorch).
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-alpaca-cleaned (este) | 2,2B | no disponible | Apache 2.0 | Hugging Face (MLX/safetensors) |
| Qwen3.5-2B (base) | 2,2B | no disponible | Apache 2.0 | Hugging Face |
| Modelos de ~2B de la familia Llama/Qwen (genericos) | ~1-3B | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este ajuste concreto; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay validacion de la comunidad ni evaluaciones independientes.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a modelos de 2,2B ajustados con SFT; no se documentan mitigaciones.
- Sesgos potenciales heredados del dataset alpaca-cleaned y del modelo base Qwen3.5-2B, no evaluados.
- Longitud de contexto no documentada: puede limitar conversaciones largas o tareas con mucho contexto.
- Formato MLX: requiere conversion para su uso en CUDA o entornos de produccion estandar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un ajuste de un modelo base, conviene verificar los terminos del modelo Qwen3.5-2B original.
- Sin model card sustantiva: no hay garantias sobre hiperparametros, calidad del ajuste ni reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/yeahyeahyeahyeah123123/qwen3.5-alpaca-cleaned
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B
- Modelo original Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/yahma/alpaca-cleaned
