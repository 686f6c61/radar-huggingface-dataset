# zhongweixie/qwen3vl-8b-claw-stage3-v2-lora

## Resumen

El modelo `zhongweixie/qwen3vl-8b-claw-stage3-v2-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Zhongwei Xie, diseñado para especializar el modelo base Qwen/Qwen3-VL-8B-Instruct en tareas de uso de herramientas (tool-use) y agentes. Se ha ajustado mediante fine-tuning supervisado (SFT) sobre el dataset `zhongweixie/claw-eval`, un benchmark de 300 tareas organizadas en tres series (C, T y M) que evalúan capacidades de control, razonamiento y manipulación de herramientas. El adaptador mejora el rendimiento total en un 8,62 % respecto al modelo base sin ajuste, pasando de 0,420 a 0,506 en la métrica global de claw-eval.

La relevancia de este adaptador radica en que Qwen3-VL es una familia de modelos de visión y lenguaje de última generación, con soporte nativo para contextos intercalados de hasta 256 000 tokens y capacidades multimodales (texto, imagen y vídeo). Al aplicar LoRA sobre la variante de 8 000 millones de parámetros, se obtiene un modelo especializado en interacción con herramientas y agentes sin necesidad de reentrenar toda la arquitectura, lo que reduce costes computacionales y permite un despliegue eficiente. El adaptador se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-8B-Instruct (modelo denso de visión-lenguaje) |
| Parametros totales | No disponible (adaptador LoRA con rank=32, alpha=64) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 256 000 tokens (heredado del modelo base); entrenado con 8192 tokens |
| Tipos de cuantizacion | No disponible (depende del modelo base; se puede cuantizar el base) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-8B-Instruct, un modelo de lenguaje multimodal denso con 8 000 millones de parametros, que integra vision y texto mediante un codificador visual y un decodificador transformer. El fine-tuning se realiza con LoRA, una tecnica de adaptacion de bajo rango que solo entrena matrices de proyeccion adicionales (rank=32, alpha=64) sobre las capas atencionales y de feed-forward del modelo base, manteniendo congelados los pesos originales. Esto reduce significativamente el numero de parametros entrenables y el coste de computo.

El entrenamiento se llevo a cabo sobre el dataset `sft_messages_stage3_v2.jsonl`, que contiene mensajes en formato SFT (supervised fine-tuning) extraidos del benchmark claw-eval. Los hiperparametros principales incluyen una tasa de aprendizaje de 1e-6, una longitud maxima de secuencia de 8192 tokens y una sola epoca. El proceso de entrenamiento se documento en el script `launch_stage3_v2.sh` incluido en el repositorio. No se menciona el uso de RLHF o DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generacion de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen3-VL-8B-Instruct, incluyendo comprension de imagenes, video y texto intercalado.
- Uso de herramientas (tool-use): el fine-tuning en claw-eval mejora la capacidad de seleccionar y llamar funciones externas, como APIs o comandos, en tareas de agente.
- Razonamiento multi-paso: el adaptador esta optimizado para tareas que requieren planificacion y ejecucion secuencial de acciones, como se refleja en las series T y M del benchmark.
- Soporte de agentes: puede integrarse en sistemas de agentes que necesitan interpretar instrucciones, interactuar con entornos y tomar decisiones.
- Multilingue: soporta ingles y chino, aunque el dataset de entrenamiento se centra en estos dos idiomas.
- Vision y lenguaje: al estar basado en Qwen3-VL, mantiene la capacidad de procesar entradas visuales junto con texto, lo que permite tareas como analisis de imagenes con instrucciones de agente.

## Casos de uso

- Automatizacion de tareas con herramientas: el modelo puede gestionar flujos de trabajo que requieren llamar a APIs, ejecutar scripts o interactuar con bases de datos, gracias a su mejora en tool-use. Por ejemplo, un asistente que consulta el tiempo, reserva citas o envia correos mediante funciones externas.
- Agentes de navegacion web: puede interpretar capturas de pantalla o descripciones de paginas web y ejecutar acciones como hacer clic, rellenar formularios o extraer informacion, aprovechando su capacidad multimodal y de razonamiento secuencial.
- Asistentes virtuales con vision: integrado en un chatbot, puede analizar imagenes enviadas por el usuario (por ejemplo, una foto de un producto) y realizar acciones como buscar precios o generar recomendaciones, combinando vision y tool-use.
- Pruebas automatizadas de software: el modelo puede generar y ejecutar casos de prueba interactuando con entornos de desarrollo, utilizando su capacidad de razonamiento y llamada a herramientas para verificar comportamientos.
- Analisis de documentos con acciones: puede leer documentos (PDF, imagenes) y ejecutar operaciones como extraer datos, resumir o actualizar registros, gracias a su contexto largo y soporte multimodal.
- Investigacion academica en agentes: sirve como punto de partida para experimentos en sistemas de agentes, ya que su especializacion en claw-eval permite comparar estrategias de fine-tuning y evaluar mejoras en tareas de control y razonamiento.

## Benchmarks y rendimiento

El adaptador se evaluo en el benchmark claw-eval con 300 tareas, comparandose con el modelo base Qwen3-VL-8B-Instruct (baseline). Los resultados se muestran en la siguiente tabla:

| Metrica | Adaptador LoRA | Baseline | Diferencia |
|---|---|---|---|
| Total (300 tareas) | 0,5062 | 0,420 | +0,0862 |
| Serie C (38 tareas) | 0,778 | 0,637 | +0,141 |
| Serie T (161 tareas) | 0,619 | 0,547 | +0,072 |
| Serie M (101 tareas) | 0,224 | 0,206 | +0,018 |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la informacion disponible. El rendimiento se centra exclusivamente en las tareas de claw-eval, que miden capacidades de control, razonamiento y manipulacion de herramientas.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 8B parametros, la inferencia requiere al menos 16 GB de VRAM en precision FP16. Con cuantizacion del modelo base (por ejemplo, 4 bits), puede reducirse a unos 6-8 GB.
- GPU recomendadas: para un rendimiento fluido, se recomienda una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs consumer con 8 GB (por ejemplo, RTX 3060), es posible ejecutar con cuantizacion 4 bits, aunque con menor velocidad.
- Compatibilidad con GPUs consumer: si, siempre que se cuantice el modelo base. El adaptador en si es ligero (1,1 GB de repositorio), pero el modelo base domina el consumo de memoria.
- Opciones de despliegue: se puede servir con transformers y peft (cargando el adaptador sobre el base), o fusionar el adaptador con el modelo base y exportarlo a formatos como GGUF para usar con llama.cpp u Ollama. Tambien es compatible con vLLM y TGI si se fusiona previamente.
- Latencia y throughput: no se proporcionan datos especificos. En una GPU A100, un modelo de 8B en FP16 suele alcanzar un throughput de 20-40 tokens/segundo, pero depende de la implementacion y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA o modelos especializados en tool-use en la informacion proporcionada. La unica comparacion disponible es contra el modelo base Qwen3-VL-8B-Instruct, que actua como baseline. A continuacion se muestra una tabla comparativa entre el adaptador y su modelo base:

| Modelo | Parametros | Contexto | Rendimiento claw-eval (total) | Licencia |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8B | 256K | 0,420 | Apache 2.0 |
| qwen3vl-8b-claw-stage3-v2-lora | 8B + LoRA | 256K (base) | 0,506 | Apache 2.0 |

No se han encontrado otros modelos comparables en la misma categoria (adaptadores LoRA para tool-use sobre Qwen3-VL) en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen3-VL puede heredar sesgos de sus datos de entrenamiento, y el adaptador, al entrenarse en un dataset especifico (claw-eval), puede estar sesgado hacia las tareas de ese benchmark, lo que podria afectar su generalizacion a otros dominios.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar informacion, especialmente en tareas de razonamiento complejo o cuando se le pide ejecutar acciones con herramientas.
- Limitaciones de contexto: aunque el modelo base soporta hasta 256K tokens, el adaptador se entreno con una longitud maxima de 8192 tokens, por lo que su rendimiento en secuencias mas largas puede degradarse.
- Limitaciones de idioma: el adaptador esta entrenado principalmente en ingles y chino; su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y no se ofrece garantia. Es recomendable revisar los terminos del modelo base Qwen3-VL, que tambien es Apache 2.0.
- Caveat para produccion: al ser un adaptador LoRA, es necesario cargarlo junto con el modelo base. Si se fusiona, el archivo resultante puede ser grande (varios GB). Ademas, el rendimiento en tareas fuera de claw-eval no esta validado, por lo que se recomienda evaluar en el dominio de aplicacion antes de desplegar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zhongweixie/qwen3vl-8b-claw-stage3-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper tecnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Repositorio GitHub de Qwen3 (serie general): https://github.com/QwenLM/Qwen3
