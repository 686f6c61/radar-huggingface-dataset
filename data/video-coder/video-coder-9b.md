# Video-Coder/Video-Coder-9B

## Resumen

Video-Coder-9B es un modelo de lenguaje de 9.409.813.744 parámetros publicado por el equipo de investigación Video-Coder bajo licencia Apache 2.0. Se trata del primer intento documentado de entrenar un agente de generación de vídeo guiado por código: el modelo escribe y ejecuta código de forma autónoma para construir una escena 3D dinámica (denominada "Draft Video") que aporta señales de estructura y movimiento a generadores de vídeo posteriores. El modelo se distribuye en formato safetensors y su arquitectura se etiqueta como `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5.

El modelo se acompaña de dos conjuntos de datos propios, Video-Coder-SFT-10k y Video-Coder-RL-4k, con prompts diversos y vídeos de referencia, y de un entorno interactivo denominado Video-Coder Harness que integra ejecución de código, renderizado de escenas 3D y realimentación de ejecución para el entrenamiento e inferencia del agente. Según la model card, su integración mejora Minimax-H3 en aproximadamente 7 puntos en PhyGenBench y 24 puntos en VBench-2.0.

Es relevante ahora porque aborda un problema concreto del pipeline de generación de vídeo: la falta de control estructural y físico en modelos de difusión de vídeo. En lugar de generar píxeles directamente, Video-Coder actúa como un agente de código que produce una representación intermedia 3D interpretable y ejecutable, lo que abre la puerta a pipelines híbridos entre razonamiento agéntico y síntesis visual. El repositorio acumula 479 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de arquitectura `qwen3_5` en Hugging Face; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` asociada al repositorio, que apunta a una base de la familia Qwen 3.5 con aproximadamente 9.400 millones de parámetros. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto en la información proporcionada.

El entrenamiento se estructura en dos fases según los datos publicados: un ajuste supervisado (SFT) sobre Video-Coder-SFT-10k y un refuerzo (RL) sobre Video-Coder-RL-4k, ambos con prompts diversos y vídeos de referencia como verdad fundamental. La innovación técnica central es el entrenamiento agéntico sobre el Video-Coder Harness, un entorno que combina ejecución de código, renderizado de escenas 3D y realimentación de ejecución, de modo que el modelo aprende a iterar sobre su propio código para producir un "Draft Video" 3D que sirve de condicionamiento estructural a generadores de vídeo posteriores. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como DPO.

## Capacidades

- Generación de código ejecutable orientado a la construcción de escenas 3D dinámicas.
- Razonamiento agéntico multi-paso con bucle de ejecución y realimentación (escribir código, ejecutarlo, observar el resultado y corregir).
- Integración con un entorno de renderizado 3D para producir un "Draft Video" que condiciona la generación de vídeo final.
- Capacidad de tool calling implícita a través de la ejecución de código en el harness (no se documenta un protocolo de function calling estándar).
- Generación de texto y razonamiento general, heredados de la base Qwen 3.5 (no verificado en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Previsualización estructural de vídeo: el modelo genera una escena 3D en código que actúa como borrador de movimiento y geometría antes de invocar un generador de vídeo, reduciendo inconsistencias físicas en el resultado final.
- Pipelines de generación de vídeo con control físico: integrado con Minimax-H3 u otros generadores, el "Draft Video" aporta señales de estructura que mejoran métricas como PhyGenBench y VBench-2.0, útil en producción de contenido donde la coherencia física es crítica.
- Prototipado rápido de escenas 3D: desarrolladores pueden pedir al modelo código que construya una escena con objetos, cámaras y trayectorias, y renderizarla en el harness para validar ideas antes de invertir en un pipeline completo.
- Investigación en agentes de código: el modelo y el harness sirven como banco de pruebas para estudiar bucles de ejecución, realimentación y corrección automática en tareas de generación visual.
- Automatización de tareas de animación técnica: generación de scripts que definen movimientos de cámara y trayectorias de objetos para vídeos explicativos o demostraciones de producto.
- Educación y divulgación: creación de escenas 3D dinámicas a partir de descripciones en lenguaje natural para material didáctico, aprovechando la naturaleza ejecutable e inspeccionable del código generado.
- Evaluación comparativa de generadores de vídeo: usar el borrador 3D como entrada controlada para comparar la fidelidad estructural de distintos modelos de difusión de vídeo.

## Benchmarks y rendimiento

La model card reporta mejoras relativas al integrar Video-Coder con Minimax-H3, pero no publica una tabla de resultados absolutos por benchmark para el modelo aislado.

| Benchmark | Resultado reportado |
|---|---|
| PhyGenBench | mejora de ~7 puntos al integrarse con Minimax-H3 (valor absoluto no disponible) |
| VBench-2.0 | mejora de ~24 puntos al integrarse con Minimax-H3 (valor absoluto no disponible) |
| MMLU, HumanEval, GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en FP16 se requieren aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 9,4 GB, y en 4 bits, en torno a 4,7 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin cuantizar; RTX 4090 (24 GB) puede alojar FP16 ajustado o cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 o 4 bits en tarjetas con 12-24 GB de VRAM, siempre que se disponga de soporte de cuantización para la arquitectura `qwen3_5`.
- Opciones de despliegue: no se documentan explícitamente; al ser safetensors compatible con transformers, cabría esperar vLLM, TGI o llama.cpp previa conversión a GGUF, pero no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo aislado ni de alternativas directamente comparables en la categoría de agentes de código para generación de vídeo. Se indica "no disponible" para los campos no documentados.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Video-Coder-9B | 9,41 B | no disponible | Apache 2.0 | Agente de código para borradores 3D de vídeo |
| Qwen 3.5 (base) | no disponible | no disponible | no disponible | LLM generalista |
| Minimax-H3 | no disponible | no disponible | no disponible | Generador de vídeo (consumidor del borrador) |

## Limitaciones y advertencias

- La información pública es escasa: no se documentan contexto, idiomas, cuantizaciones ni detalles de arquitectura, lo que dificulta evaluar su idoneidad en producción.
- El modelo está diseñado para un pipeline específico (Video-Coder Harness); usarlo fuera de ese entorno puede degradar gravemente su comportamiento.
- Riesgo de alucinación en el código generado: aunque el harness proporciona realimentación, no se documenta la tasa de éxito de ejecución ni la robustez ante errores.
- Sesgos conocidos: no documentados; al derivar de una base Qwen 3.5, podría heredar sesgos de esa familia, sin confirmación oficial.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes externos (renderizador 3D, generadores de vídeo) cuyas licencias deben verificarse por separado.
- No se han publicado resultados de benchmarks del modelo aislado, solo mejoras relativas al integrarse con Minimax-H3, lo que limita la comparación objetiva.
- El repositorio tiene 0 likes y 479 descargas, lo que sugiere adopción temprana y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Video-Coder/Video-Coder-9B
- Paper: https://arxiv.org/abs/2611.09894
- Página del proyecto: https://cywang735.github.io/Video-Coder/
- Repositorio de código: https://github.com/CYWang735/Video-Coder
