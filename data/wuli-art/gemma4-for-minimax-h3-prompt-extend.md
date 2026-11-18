# Wuli-art/Gemma4-for-MiniMax-H3-Prompt-Extend

## Resumen

MiniMax-H3 PE (Prompt Extend) es un modelo de mejora de prompts desarrollado por Wuli-art mediante fine-tuning de google/gemma-4-12B-it. Su funcion es reescribir y enriquecer las instrucciones del usuario para alimentar el pipeline de generacion de audio y video MiniMax-H3, organizando descripciones audiovisuales coherentes con el formato de entrada esperado por el generador. Resuelve el problema de la brecha entre instrucciones humanas breves y las descripciones densas que requieren los modelos de video generativo para producir resultados controlables.

El modelo se entrena de forma conjunta para dos formatos de entrada de H3: FL2VA (que cubre T2VA, I2VA, L2VA y FL2VA) y Ref2VA (generacion condicionada por referencias), usando un unico conjunto de pesos. Se distribuye con dos flujos de trabajo independientes para ComfyUI y en versiones estandar (BF16) y cuantizada (FP8/Int8). El repositorio ocupa 50 GB e incluye pesos y workflows.

La relevancia actual radica en que la calidad del prompt es un factor determinante en la generacion de video con audio sincronizado, y este modelo especializado automatiza esa capa intermedia sin requerir que el usuario domine la sintaxis interna de MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Gemma 4 12B IT); no se detalla la variante exacta |
| Parametros totales | 12B (segun el modelo base google/gemma-4-12B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (estandar), FP8, Int8 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI); no se detallan otros formatos |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder de 12.000 millones de parametros, y se afina especificamente para la tarea de reescritura de prompts orientada a la generacion audiovisual de MiniMax-H3. El entrenamiento conjunto para FL2VA y Ref2VA con un unico conjunto de pesos es la innovacion principal: en lugar de mantener dos modelos separados por formato de entrada, el PE aprende a organizar la descripcion segun la tarea (definicion de sujetos, relaciones de referencia, movimiento de camara, cambios temporales y descripcion de sonido) en funcion del contexto proporcionado por el usuario.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla si se aplicaron optimizaciones de inferencia como decodificacion especulativa o atencion lineal. El modelo se integra en ComfyUI mediante nodos cargadores que aceptan las versiones BF16, FP8 e Int8.

## Capacidades

- Generacion de prompts enriquecidos para generacion de video con audio (texto a video, imagen a video, primer/ultimo fotograma y multi-referencia).
- Organizacion de descripciones audiovisuales: escenas, acciones, movimiento de camara, evolucion temporal y sonido.
- Incorporacion de restricciones de fotogramas cuando se proporcionan imagenes de primer y ultimo frame (modo FL2VA).
- Definicion de sujetos y relaciones de referencia, retencion de contenido y acciones en modo Ref2VA.
- Soporte bilingue chino-ingles en la formulacion de prompts.
- Integracion con flujos de ComfyUI mediante workflows JSON especificos por tarea.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso mas alla de la reescritura de prompts.

## Casos de uso

- Generacion de video texto-a-video con control fino: el usuario describe una escena breve y el PE la expande en una descripcion estructurada de escena, accion, camara y audio que MiniMax-H3 consume para producir el clip con sonido sincronizado.
- Animacion de imagen inicial (I2VA): a partir de una imagen y una instruccion corta, el modelo genera un prompt que respeta el contenido del primer fotograma y describe la evolucion temporal y el audio esperado.
- Interpolacion entre primer y ultimo fotograma (FL2VA): el PE incorpora las restricciones de ambos fotogramas y organiza la transicion, el movimiento de camara y la banda sonora coherentes con los extremos fijados.
- Generacion condicionada por referencias (Ref2VA): en flujos de creacion de personajes o productos, el modelo define sujetos, relaciones de referencia y que contenido debe conservarse, facilitando consistencia entre tomas.
- Produccion de video publicitario o de redes sociales: automatiza la redaccion de prompts tecnicos a partir de briefs creativos, reduciendo la iteracion manual necesaria para obtener resultados utilizables.
- Prototipado rapido en ComfyUI: los workflows incluidos permiten a estudios pequenos montar un pipeline de generacion audiovisual con mejora de prompt sin desarrollar su propia capa de reescritura.
- Localizacion de prompts entre chino e ingles: equipos que trabajan en ambos idiomas pueden formular instrucciones en su lengua y obtener prompts estructurados compatibles con el generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye una demo interactiva comparativa con 9 casos y 45 videos que contrasta Raw (sin PE), Gemma4 base, MiniMax-H3 Official PE, lightx2v Rewriter y este modelo, pero no se aportan metricas numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un modelo de 12B en BF16 requiere del orden de 24 GB solo para pesos, mas overhead de activaciones y contexto; la version FP8/Int8 reduce el requisito aproximadamente a la mitad.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar uso en A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con cuantizacion.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090/3090 con FP8 o Int8; en BF16 el margen es muy ajustado en 24 GB.
- Opciones de despliegue: ComfyUI con los workflows FL2VA y Ref2VA incluidos; la libreria declarada es diffusers. No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 PE (este) | 12B | no disponible | Mejora de prompts para MiniMax-H3 (FL2VA/Ref2VA) | Apache 2.0 | Hugging Face y ModelScope |
| google/gemma-4-12B-it | 12B | no disponible | Modelo general de instrucciones | Gemma (terminos propios) | Hugging Face |
| MiniMax-H3 Official PE | no disponible | no disponible | Mejora de prompts oficial para H3 | no disponible | Referenciado en la demo comparativa |
| lightx2v Rewriter | no disponible | no disponible | Reescritura de prompts (comparado en la demo) | no disponible | Referenciado en la demo comparativa |

## Limitaciones y advertencias

- Modelo especializado: su utilidad esta acotada a la mejora de prompts para MiniMax-H3; no es un modelo generalista de conversacion, codigo o razonamiento.
- Idiomas limitados a chino e ingles; el rendimiento en castellano no esta documentado y probablemente sea degradado.
- Riesgo de alucinacion: al reescribir prompts puede introducir detalles no solicitados por el usuario (elementos de escena, acciones o audio), lo que requiere revision.
- Dependencia del ecosistema: los workflows estan disenados para ComfyUI y requieren nodos personalizados; la integracion fuera de ese entorno no esta documentada.
- Sin datos publicos de benchmarks ni de evaluacion cuantitativa, por lo que la calidad relativa frente a las alternativas solo puede juzgarse con la demo cualitativa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 IT puede estar sujeto a los terminos de Google; conviene verificar la compatibilidad antes de un despliegue comercial.
- Tamano de repositorio elevado (50 GB) por incluir versiones BF16 y cuantizadas junto con workflows.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wuli-art/Gemma4-for-MiniMax-H3-Prompt-Extend
- Modelo en ModelScope: https://modelscope.cn/models/Wuli-Art/Gemma4-for-Minimax-h3-Prompt-Extend
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Workflow FL2VA: https://huggingface.co/Wuli-art/Gemma4-for-MiniMax-H3-Prompt-Extend/blob/main/minimax_h3_gemma4_pe_fl2va.json
- Workflow Ref2VA: https://huggingface.co/Wuli-art/Gemma4-for-MiniMax-H3-Prompt-Extend/blob/main/minimax_h3_gemma4_pe_ref2va.json
- Demo interactiva comparativa: https://cdn.wuli.art/image/open_bench_20261109_fiveway_pick8_showcase/index.html
