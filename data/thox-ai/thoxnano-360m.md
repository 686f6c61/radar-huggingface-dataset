# Thox-ai/ThoxNano-360M

## Resumen

ThoxNano-360M es un modelo de generación de texto de 361.821.120 parámetros publicado por Thox-ai (THOX.ai LLC) como ajuste fino del modelo abierto HuggingFaceTB/SmolLM-360M. Está pensado para el programa de dispositivos de la compañía, en concreto para el nivel ThoxClip: un asistente que funcione íntegramente offline, con respuestas conversacionales cortas, la "voz de marca" de THOX y el enrutado de intenciones hacia funciones del dispositivo y de la malla (meshstack).

El modelo se distribuye con licencia Apache 2.0 en dos formatos: `safetensors` (pesos fusionados tras el ajuste LoRA) y un GGUF cuantizado en Q4_K_M de 270,59 MB, lo que lo sitúa en la franja de ejecución en CPU y dispositivos de baja capacidad. El entrenamiento fue un SFT con LoRA de rango 32 sobre 205 filas del corpus interno `thox-factory-sft-v5`, 3 épocas y una pérdida final de 3,124.

Su relevancia ahora es doble. Por un lado, documenta una receta reproducible de ajuste fino en el borde (TRL + HF Jobs + conversión a GGUF) sobre una base de 360M. Por otro, la propia model card es inusualmente explícita sobre los fallos: la puerta de factualidad no pudo completarse porque el modelo entró en un bucle de repetición, y la prueba de identidad muestra que el modelo filtra su texto de sistema en lugar de responder con naturalidad. Es, por tanto, un artefacto para evaluar con cautela, no un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (tag `llama`); ajuste fino de HuggingFaceTB/SmolLM-360M |
| Parámetros totales | 361.821.120 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no declara la ventana de contexto) |
| Tipos de cuantización | GGUF Q4_K_M publicado (270,59 MB); safetensors en 16 bits (723,67 MB para 361,8 M de parámetros, es decir, 2 bytes por parámetro); no se publican otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y GGUF (`ThoxNano-360M.Q4_K_M.gguf`) |
| Plantilla de chat | ChatML, incluida como `chat_template.jinja` (la base no traía plantilla) |
| Tamaño del repositorio | 3,0 GB |
| Descargas / likes | 177 / 2 |
| Creado / actualizado | 2026-08-11 / 2026-10-28 |
| Compatibilidad de despliegue | `endpoints_compatible`, `gguf`, `llama`, `ollama`, LM Studio |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 361,8 M de parámetros, sin mezcla de expertos ni mecanismos alternativos de atención. Sobre esa base se aplicó un SFT con LoRA de rango 32 (learning rate 1e-4, 3 épocas) mediante TRL, con el script `train_edge_sft.py` del repositorio `Thox-ai/thox-edge-sft`, y el adaptador se fusionó en los pesos del modelo base. El conjunto de entrenamiento fueron 205 filas de ejemplos de chat y de uso de herramientas/agentes del corpus `thox-factory-sft-v5`, preparadas para esta ola en `Thox-ai/thox-edge-sft`. El cómputo se ejecutó en Hugging Face Jobs: el primer trabajo falló en la tokenización porque el tokenizador de SmolLM no incluye plantilla de chat, y se resolvió con un fallback ChatML en el entrenador antes de relanzar el job que produjo los pesos actuales.

No se documenta el volumen de tokens de preentrenamiento (heredado del base), ni fases de RLHF o DPO, ni innovaciones de decodificación especulativa o atención lineal. La pérdida final de entrenamiento es 3,124, un valor coherente con un corpus pequeño y un número reducido de épocas, y no acompañado de métricas de validación ni de perplejidad sobre un conjunto retenido. El GGUF Q4_K_M se regeneró a partir de los safetensors entrenados el 2026-10-28 con llama.cpp, sustituyendo el reempaquetado del modelo base que el repositorio albergaba desde agosto.

## Capacidades

- Generación de texto conversacional de turno corto, orientada a respuestas breves y a la voz de marca de THOX.
- Enrutado de intenciones hacia funciones del dispositivo y de la malla (meshstack), según el uso previsto declarado por el autor.
- Ejemplos de tool use y de agente en el corpus de entrenamiento; no hay evaluación publicada que verifique function calling fiable.
- Ejecución completamente offline en el dispositivo, sin dependencia de red una vez descargado el GGUF.
- Inglés como único idioma declarado; no se documenta soporte multilingüe.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking).

## Casos de uso

- Asistente local en el dispositivo ThoxClip: respuesta a saludos, confirmaciones y preguntas cortas del usuario sin salida a red; adecuado por tamaño (270,59 MB en Q4_K_M) y por el objetivo declarado de asistente on-device, aunque los hechos deben inyectarse desde el servidor de servicio.
- Enrutado de intenciones a funciones del dispositivo: clasificar una frase corta del usuario en una acción de dispositivo o de malla y emitir una estructura de salida; encaja con el corpus de tool use del ajuste, pero exige validar el formato de salida y añadir un parser tolerante a fallos antes de conectarlo a actuadores.
- RAG local para preguntas frecuentes del dispositivo: dado que la fiabilidad factual no está probada, el patrón viable es recuperar el fragmento de documentación y limitar el modelo a reformularlo, con prompts cortos y verificación posterior.
- Plantilla reproducible de SFT en el borde: el repositorio documenta la receta completa (LoRA r32, TRL, HF Jobs, fallback de plantilla de chat, conversión y cuantización con llama.cpp), útil como referencia para equipos que ajusten modelos de menos de 1B parámetros.
- Pruebas de integración de la cadena GGUF en CI: al pesar 270,59 MB, el modelo se puede descargar y ejecutar en un runner sin GPU para validar `llama-cli`, Ollama o LM Studio, comprobar plantillas de chat y detectar regresiones de formato.
- Generación de textos de interfaz y mensajes de confirmación con tono de marca: cadenas cortas y plantillas de respuesta donde el contenido está prefijado y el modelo solo elige variantes, con revisión humana del resultado.
- Estudio de caso de fallos en modelos pequeños: el bucle de repetición y la fuga de la plantilla de sistema son ejemplos concretos para diseñar detectores de repetición y filtros de salida en pipelines de modelos de menos de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación de referencia está pendiente y que ninguna afirmación de la ficha debe interpretarse como una garantía de calidad.

| Evaluación | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | sin datos publicados |
| HumanEval | no disponible | sin datos publicados |
| GSM8K | no disponible | sin datos publicados |
| Perplejidad frente al modelo base | no disponible | pendiente según el autor |
| Puerta de factualidad (49 preguntas) | error, sin puntuación | dos ejecuciones abortadas por bucle de repetición ("token repeat limit reached") con Ollama |
| Prueba de humo de identidad | fallo cualitativo | el modelo repite su texto de sistema ThoxClip con tokens corruptos en lugar de responder |
| Validación en hardware ThoxClip | no disponible | pendiente |
| Pérdida final de entrenamiento | 3,124 | 205 filas, 3 épocas; no es una métrica de calidad |

## Requisitos de hardware

- Pesos: 270,59 MB en Q4_K_M y 723,67 MB en safetensors de 16 bits; el modelo entra en cualquier dispositivo con algo menos de 1 GB de memoria libre en cuantización Q4_K_M.
- VRAM estimada para inferencia: por debajo de 1 GB con Q4_K_M y contexto corto, incluyendo la caché KV y el overhead del runtime; en torno a 1,5 GB en 16 bits. Son estimaciones a partir del tamaño de los pesos, no medidas publicadas.
- CPU: es el escenario natural del modelo (edge, on-device); no se han publicado cifras de latencia ni de tokens por segundo en ninguna plataforma.
- GPU: cualquier GPU con 2 GB o más puede ejecutarlo; no hay datos de rendimiento en A100, H100 ni RTX 4090, y usar ese hardware no aporta ventaja documentada frente a CPU.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 2 GB o más de VRAM; también en Raspberry Pi y dispositivos equivalentes, aunque la validación en el hardware ThoxClip está pendiente según la model card.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama mediante `ollama run hf.co/Thox-ai/ThoxNano-360M:Q4_K_M`, y LM Studio. El despliegue con vLLM o TGI no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxNano-360M | 361,8 M | no disponible en la ficha | Apache 2.0 | safetensors + GGUF Q4_K_M | Ajuste de comportamiento y voz; sin benchmarks; fallo documentado en la puerta de factualidad |
| SmolLM-360M (base) | 362 M | 2.048 tokens (según la model card del base) | Apache 2.0 | safetensors | Modelo generalista sin ajuste de voz; referencia directa para medir la deriva del ajuste |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (según la model card) | Apache 2.0 | safetensors, GGUF | Alternativa generalista con instrucciones y contexto largo; requiere comparación empírica |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (según la model card) | Llama 3.2 Community License | safetensors, GGUF | Mayor tamaño y contexto; licencia con condiciones de uso distintas a Apache 2.0 |

Los datos de los modelos alternativos proceden de sus model cards públicas y no se han reverificado en esta ficha; no hay comparación de rendimiento publicada entre ThoxNano-360M y ninguno de ellos.

## Limitaciones y advertencias

- Fiabilidad factual no probada y probablemente débil: la puerta de factualidad de 49 preguntas se abortó dos veces por un bucle de repetición, sin puntuación resultante. Cualquier despliegue debe aportar los hechos desde el lado del servicio (grounding, RAG) y no confiar en el conocimiento paramétrico.
- Fuga de la plantilla de sistema: ante la pregunta "What are you?", el modelo reprodujo su texto de sistema ThoxClip con tokens corruptos. Es un riesgo directo de exponer instrucciones internas en superficie de usuario y exige filtrado de salida.
- Corpus de entrenamiento muy pequeño (205 filas, 3 épocas) y pérdida final de 3,124: alta probabilidad de sobreajuste a la voz y al dominio THOX, con escasa generalización fuera de ese reparto.
- Solo inglés declarado: no hay soporte documentado de castellano ni de otros idiomas, y el comportamiento multilingüe es desconocido.
- La base no incluye plantilla de chat; el repositorio aplica un fallback ChatML. Un desajuste entre la plantilla del servicio y `chat_template.jinja` degrada la calidad de forma apreciable en modelos de este tamaño.
- Sin evaluación de sesgos publicada; el corpus procede de un único fabricante, por lo que cabe esperar sesgo hacia su terminología, sus productos y su tono.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no concede derechos sobre la marca THOX ni sobre su identidad visual; el aviso de copyright y el texto de licencia deben conservarse.
- Uso desaconsejado por el propio autor para decisiones médicas, legales o de seguridad sin revisión humana.
- Discrepancia de empaquetado: el repositorio ocupa 3,0 GB, mientras que los ficheros listados en la model card suman aproximadamente 1 GB; conviene inspeccionar el árbol completo antes de desplegar para descartar artefactos no documentados.
- Sin validación en el hardware objetivo (ThoxClip) ni métricas de latencia o throughput: no hay base para afirmar que cumple requisitos de tiempo real en el dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-360M
- Modelo base SmolLM-360M: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Página del autor en Ollama: https://ollama.com/Thox-ai/thoxnano-360m
- Ficha de terceros (GenAiHub): https://genaihub.net/agents/hf-model-thox-ai-thoxnano-360m
- Organización Thox-ai (README): https://huggingface.co/Thox-ai/README
- Modelos con la etiqueta `thox`: https://huggingface.co/models?other=thox
- Dataset de SFT citado en la model card: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Repositorio del entrenador de borde citado en la model card: https://huggingface.co/Thox-ai/thox-edge-sft
- Modelo relacionado de la misma organización (ASR): https://huggingface.co/Thox-ai/ThoxSpeech-ASR-BitNet
- No se han encontrado en la búsqueda web papers, blogs técnicos ni demos adicionales de este modelo.
