# Tony1109/DesignAsCode-planner

## Resumen

DesignAsCode-planner es un ajuste fino supervisado (SFT) del modelo Qwen3-8B, desarrollado por Tony1109 (Liu Ziyuan y colaboradores) como componente del pipeline de investigacion DesignAsCode, presentado en ACM Multimedia 2026. El modelo actua como planificador semantico: recibe una peticion de diseno en lenguaje natural y genera un plan estructurado que incluye razonamiento de layout, agrupacion de capas, prompts de generacion de imagenes por capa y especificaciones de elementos de texto. Resuelve el problema de traducir una intencion de diseno grafico en una representacion intermedia editable y estructurada, puente entre la generacion visual y la editabilidad estructural.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.000 millones de parametros (el dato de 308.224 parametros del repo safetensors corresponde a un recuento parcial o erroneo del campo de metadatos, no al tamano real del modelo), ventana de contexto de 8.192 tokens y pesos en fp16 de aproximadamente 16 GB. Se ha entrenado exclusivamente sobre unas 10.000 muestras del dataset DesignAsCode, destiladas de Crello mediante GPT-4o y GPT-o3, lo que lo especializa en el dominio del diseno grafico y reduce su utilidad fuera de el.

Su relevancia actual radica en que forma parte de un pipeline de investigacion publicado (planificacion, implementacion y reflexion), con licencia Apache 2.0 y compatibilidad con text-generation-inference y endpoints, lo que facilita su despliegue en entornos de investigacion sobre generacion de diseno asistida por IA. No obstante, es un modelo de nicho, con muy pocas descargas (29) y sin datos publicados de benchmarks, por lo que debe evaluarse como artefacto de investigacion mas que como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B, decoder-only) |
| Parametros totales | 8.000 millones (base Qwen3-8B); el campo safetensors del repo indica 308.224, dato no representativo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-8B, sin modificaciones estructurales. El ajuste fino es SFT puro, sin RLHF ni DPO documentados. La configuracion de entrenamiento es: batch size 1, acumulacion de gradiente 2, learning rate 5e-5 con AdamW, 2 epocas, longitud maxima de secuencia 8.192 tokens, precision bfloat16 y funcion de perdida restringida a los tokens generados (completion-only loss), lo que concentra el aprendizaje en la salida estructurada y no en la peticion de entrada.

Los datos de entrenamiento son unas 10.000 muestras del dataset DesignAsCode-training-data (19.479 muestras totales), destiladas del dataset Crello con GPT-4o y GPT-o3. Cada ejemplo empareja una peticion de diseno en lenguaje natural con una salida compuesta por cuatro bloques etiquetados con XML: `<layout_thought>`, `<grouping>`, `<image_generator>` y `<generate_text>`. No se emplearon datos adicionales. No se documentan innovaciones tecnicas propias como decodificacion especulativa o atencion lineal; la contribucion del trabajo reside en el formato de salida estructurado y en el pipeline completo, no en el modelo en si.

## Capacidades

- Generacion de texto especializada en planificacion de diseno grafico: produce razonamiento de layout detallado en `<layout_thought>`.
- Agrupacion semantica de capas: emite en `<grouping>` un array JSON que agrupa capas relacionadas con etiquetas tematicas.
- Generacion de prompts de imagen por capa: emite en `<image_generator>` un array JSON de prompts listos para un generador de imagenes.
- Especificacion de elementos de texto: emite en `<generate_text>` un array JSON con fuente, tamano, alineacion y otras propiedades tipograficas.
- Salida semi-estructurada con etiquetas XML que facilita el parseo y la integracion en pipelines.
- Capacidad conversacional y de generacion de texto heredada de Qwen3-8B, aunque no documentada especificamente para este ajuste.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Generacion automatizada de planes de diseno: dado un brief en lenguaje natural ("cartel de concierto con tipografia sans-serif y paleta oscura"), el modelo produce el plan completo con layout, agrupacion de capas, prompts de imagen y especificaciones de texto, que despues consume la etapa de implementacion del pipeline DesignAsCode.
- Prototipado rapido de maquetas editables: el plan estructurado permite reconstruir el diseno como capas separadas, de modo que un disenador puede editar cada elemento por separado en lugar de retocar una imagen plana.
- Investigacion en generacion de diseno asistida por IA: el modelo sirve como referencia reproducible para experimentos de planificacion semantica en pipelines multimodales, al estar publicado con paper, dataset y repositorio.
- Generacion de prompts para modelos de difusion: el bloque `<image_generator>` puede alimentar directamente un modelo texto-a-imagen por cada capa, separando la generacion visual de la composicion final.
- Automatizacion de sistemas de plantillas: la salida JSON de agrupacion y de especificaciones de texto puede mapearse a un motor de plantillas para generar variantes de un mismo diseno con distintos contenidos.
- Extraccion de especificaciones tipograficas: el bloque `<generate_text>` permite derivar de forma automatica fuentes, tamanos y alineaciones a partir de una descripcion, util en herramientas de diseno asistido.
- Evaluacion de pipelines de agentes de diseno: al integrarse en el flujo planificacion-implementacion-reflexion del proyecto, sirve para medir la calidad de la etapa de planificacion de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica, 18-20 GB para secuencias cortas y mas para contextos cercanos a 8.192 tokens.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue sin cuantizar; una RTX 4090 (24 GB) puede alojar los pesos en fp16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits o 4 bits (no documentada oficialmente), en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080; en 24 GB entra en fp16.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DesignAsCode-planner | 8.000 M | 8.192 | Planificacion de diseno grafico (SFT) | Apache 2.0 | Hugging Face, 29 descargas |
| Qwen3-8B (base) | 8.000 M | 32.768 (segun Qwen3-8B) | Proposito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct | 7.600 M | 32.768 | Proposito general, instrucciones | Apache 2.0 | Hugging Face, muy usado |
| Llama 3.1 8B Instruct | 8.000 M | 128.000 | Proposito general, instrucciones | Llama 3.1 Community | Hugging Face, muy usado |

La comparativa con los modelos base es ilustrativa: DesignAsCode-planner sacrifica contexto (8.192 frente a 32.768 o 128.000 tokens) y generalidad a cambio de especializacion en un formato de salida concreto. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para planificacion de diseno grafico; su rendimiento en tareas generales puede degradarse respecto a Qwen3-8B.
- Idioma: solo se documenta soporte de ingles; el uso en castellano no esta validado.
- Contexto limitado a 8.192 tokens, inferior al de muchos modelos actuales de su tamano.
- Riesgo de alucinacion en la generacion de especificaciones de layout o tipografia no presentes en la peticion; la model card recomienda revision humana antes de uso en produccion.
- Sesgos: puede reflejar sesgos presentes en el dataset Crello y en los datos de destilacion de GPT-4o y GPT-o3.
- Riesgo de copyright: los disenos generados deben revisarse por cumplimiento de derechos de autor, segun advierte el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Datos de parametros inconsistentes en el repo (308.224 frente a los 8.000 millones del modelo base), lo que exige verificar el contenido real de los safetensors antes de integrarlo.
- No se documentan versiones cuantizadas oficiales ni soporte en vLLM, llama.cpp u Ollama.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la calidad y legalidad de los disenos generados recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tony1109/DesignAsCode-planner
- Dataset de entrenamiento: https://huggingface.co/datasets/Tony1109/DesignAsCode-training-data
- Repositorio del proyecto: https://github.com/liuziyuan1109/design-as-code
- Quick Start del pipeline: https://github.com/liuziyuan1109/design-as-code#quick-start
- Dataset Crello: https://huggingface.co/datasets/cyberagent/crello
- Paper (ACM MM 2026): https://doi.org/10.1145/3767308.3835962
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
