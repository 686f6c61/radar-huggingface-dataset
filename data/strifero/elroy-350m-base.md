# strifero/elroy-350m-base

## Resumen

elroy-350m-base es un modelo de lenguaje de 360.760.320 parámetros (aproximadamente 361M) desarrollado por Strife Technologies (usuario strifero en HuggingFace) y publicado bajo licencia Apache-2.0. Se trata de un decoder transformer de estilo Llama entrenado desde cero sobre unos 20.000 millones de tokens de código Python educativo e inglés, concebido como proyecto docente: el tokenizer, el modelo, el bucle de entrenamiento y el código de ajuste están incluidos y explicados capítulo a capítulo en su repositorio de GitHub.

Su relevancia es más pedagógica que competitiva. Ofrece un pipeline completo, reproducible y de tamaño manejable (0,7 GB de pesos en el repositorio) que se entrenó en dos NVIDIA RTX A4500 (20 GB) durante unos seis días, lo que lo convierte en una referencia útil para quien quiera entender el ciclo completo de entrenamiento de un LLM sin infraestructura industrial. Está orientado a continuación de texto y a relleno de huecos (fill-in-the-middle), por lo que su uso natural es el autocompletado de código, no la conversación.

Arquitectónicamente es un transformer denso de 24 capas, ancho 1024 y 16 cabezas de atención, con una ventana de contexto de 2048 tokens. Los resultados publicados en generación de código son modestos (13,4 % pass@1 en HumanEval), coherentes con su escala. Es una variante base: no ha recibido entrenamiento de instrucciones ni de rechazo, y no soporta tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Llama: 24 capas, ancho 1024, 16 cabezas de atención |
| Parámetros totales | 360.760.320 (~361M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No se publican cuantizaciones oficiales; los pesos safetensors (~0,7 GB) son cuantizables con herramientas externas |
| Idiomas soportados | Inglés (en) y código (code), principalmente Python |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; el repositorio incluye además `elroy_min.py`, con modelo, tokenizer y sampler en un único fichero |
| Tokenizer | BPE a nivel de byte propio, 32.768 entradas, con pre-tokenización adaptada a código |
| Tokens de entrenamiento | ~20.000 millones (45 % Stack-Edu Python, 20 % StarCoderData Python, 25 % FineWeb-Edu, 10 % Cosmopedia-v2) |
| Tamaño del repositorio | 0,7 GB |
| Variante | Base (continuador de texto, sin ajuste por instrucciones) |
| Fecha de publicación | 21 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un decoder transformer de estilo Llama con normalización previa, atención causal multi-cabeza y capas feed-forward, en configuración densa (no hay expertos ni mezcla de expertos). La dimensión del modelo es 1024, con 16 cabezas de atención y 24 capas, lo que sitúa la dimensión por cabeza en 64. El tokenizer es un BPE a nivel de byte propio, de 32.768 entradas, con una etapa de pre-tokenización diseñada específicamente para código, lo que permite representar identificadores y estructuras de Python de forma más eficiente que un tokenizer genérico.

El entrenamiento se realizó desde cero sobre aproximadamente 20.000 millones de tokens con un objetivo doble: predicción del siguiente token y relleno de huecos (fill-in-the-middle) aplicado a la mitad del corpus de código. La composición del dataset combina código Python con licencia permisiva o sin licencia detectada (45 % Stack-Edu Python, 20 % StarCoderData Python) con texto educativo en inglés (25 % FineWeb-Edu, 10 % Cosmopedia-v2). El ajuste posterior empleó Magicoder OSS-Instruct (MIT), evol-codealpaca-v1 (Apache-2.0) y un conjunto escrito a mano incluido en el repositorio. No se menciona en la información disponible el uso de RLHF o DPO. El entrenamiento completo ocupó dos NVIDIA RTX A4500 durante aproximadamente seis días.

## Capacidades

- Continuación de texto en inglés: completa fragmentos de prosa educativa y expositiva.
- Generación de código Python: escribe funciones cortas a partir de una firma, un docstring, un comentario o una sentencia `import`.
- Relleno de huecos (fill-in-the-middle) mediante los tokens especiales `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`, útil para autocompletado contextual en editores.
- Explicación de conceptos básicos de programación en inglés, derivada del corpus educativo empleado.
- Generación de docstrings y fragmentos de documentación técnica breve.
- Ejecución sin dependencia de `transformers`: el fichero `elroy_min.py` incluye modelo, tokenizer y sampler, e integra parámetros de muestreo como temperatura, `top_p` y token de parada.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni multimodalidad.
- Capacidad multilingüe muy limitada: entrenado en inglés y código, sin cobertura declarada de otros idiomas naturales.
- No ha sido entrenado para rechazar peticiones ni para alinearse con directrices de seguridad.

## Casos de uso

- Autocompletado de código en editor o IDE: gracias al objetivo de fill-in-the-middle y a los tokens `<|fim_prefix|>`/`<|fim_suffix|>`/`<|fim_middle|>`, el modelo puede insertar la parte central de una función a partir del prefijo y el sufijo del fichero, integrándose en extensiones de editor mediante el fichero `elroy_min.py`.
- Generación de funciones Python cortas y autocontenidas: a partir de una firma con docstring, produce implementaciones de utilidades simples (validaciones, conversiones, funciones matemáticas básicas), adecuadas como borrador que el desarrollador revisa y ejecuta.
- Material didáctico para enseñanza de programación: el corpus educativo y su comportamiento como continuador permiten usarlo para generar ejemplos comentados y explicaciones introductorias en inglés, siempre con revisión humana.
- Proyecto de aprendizaje sobre entrenamiento de LLM: el repositorio documenta tokenizer, bucle de entrenamiento y ajuste, por lo que sirve como base reproducible para cursos y talleres sobre entrenamiento desde cero en hardware de gama media (2 GPU con 20 GB).
- Investigación sobre tokenizers específicos de código: al emplear un BPE propio de 32.768 entradas con pre-tokenización para código, es un banco de pruebas para estudiar el efecto del tokenizer en tareas de Python.
- Generación de borradores de tests unitarios sencillos: puede completar el cuerpo de funciones de prueba en Python a partir del nombre y la firma, como punto de partida para una suite que el equipo completa y valida.
- Prototipado rápido en entornos sin GPU: con 0,7 GB de pesos en safetensors y un sampler en Python puro sobre PyTorch, puede ejecutarse en CPU o en cualquier GPU consumer para pruebas de concepto y experimentos de decodificación.
- Aumento de datos sintéticos para código: puede generar variantes de fragmentos Python en un dominio restringido, útiles como datos adicionales en pipelines de experimentación, dado que su licencia Apache-2.0 permite ese uso.

## Benchmarks y rendimiento

Resultados publicados en la model card, en pass@1:

| Benchmark | pass@1 |
|---|---|
| HumanEval | 13,4 % |
| HumanEval+ | 11,0 % |
| MBPP (sanitized) | 20,2 % |

No se han publicado en la información disponible resultados para otros benchmarks (MMLU, GSM8K, tareas de razonamiento o multilingües), ni cifras comparativas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,72 GB con pesos en bf16/fp16 (los 0,7 GB del repositorio son consistentes con precisión de 16 bits), unos 1,4 GB en fp32, alrededor de 0,36 GB en int8 y cerca de 0,18 GB en int4, sin contar el espacio para el contexto (2048 tokens) ni las activaciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1660 o incluso iGPU con memoria compartida suficiente. También es viable la inferencia en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 con margen; para entrenamiento o ajuste se emplearon 2 x NVIDIA RTX A4500 (20 GB) durante unos seis días.
- Despliegue: el modelo no es compatible de forma nativa con `transformers`, por lo que no hay integración directa con vLLM, TGI u Ollama. La vía prevista por el autor es `elroy_min.py` en el propio repositorio. Otras opciones (exportación a GGUF, ONNX o servidores de inferencia) requerirían trabajo de conversión no publicado.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia muy baja en GPU moderna, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos. La tabla siguiente contrasta características estructurales conocidas de alternativas de tamaño comparable; las cifras de rendimiento de esos modelos no se incluyen porque no forman parte de la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Orientación |
|---|---|---|---|---|
| elroy-350m-base | 360,8M | 2048 | Apache-2.0 | Código Python e inglés educativo, variante base |
| Qwen2.5-Coder-0.5B | ~0,49B | 32.768 | Apache-2.0 | Código, con variantes base e instruct |
| SmolLM2-360M | ~0,36B | 8192 | Apache-2.0 | Inglés general, variantes base e instruct |
| StarCoder2-3B | ~3B | 16.384 | BigCode OpenRAIL-M | Código multilingüe, con FIM |

Diferencias destacables: elroy-350m-base es el único de la lista con un tokenizer propio específico de código y documentación completa del entrenamiento, pero también el que ofrece la ventana de contexto más corta (2048 frente a 8192 o más), no cuenta con variante de instrucciones y no está integrado en ecosistemas estándar de inferencia como `transformers`, vLLM u Ollama.

## Limitaciones y advertencias

- Es un modelo pequeño: escribe funciones Python cortas y mayoritariamente correctas, pero comete errores con seguridad en sí mismo. El propio autor recomienda ejecutar el código generado antes de confiar en él.
- Riesgo elevado de alucinación: puede inventar APIs, bibliotecas y firmas de funciones inexistentes.
- Conocimiento muy limitado fuera de Python; no conoce bibliotecas recientes ni ecosistemas actuales.
- Ventana de contexto de 2048 tokens, insuficiente para ficheros grandes o conversaciones multi-turno extensas.
- Modelo base sin ajuste por instrucciones: no sigue órdenes complejas ni formatos de salida estructurados, y no ha sido entrenado para rechazar peticiones, por lo que puede generar contenido inapropiado, inseguro o con código malicioso.
- Sesgos derivados del corpus: predominio de código con licencia permisiva o sin licencia detectada y de texto educativo en inglés, lo que sesga el estilo, los dominios cubiertos y las convenciones de programación.
- Cobertura lingüística prácticamente nula fuera del inglés; no se declara soporte de castellano ni de otros idiomas naturales.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre el cumplimiento de las licencias de los datasets de origen (Stack-Edu, StarCoderData, FineWeb-Edu, Cosmopedia-v2, Magicoder OSS-Instruct, evol-codealpaca-v1) y sobre el código generado.
- Sin soporte nativo en `transformers`, vLLM, TGI, Ollama ni llama.cpp: la integración en producción exige usar el código del repositorio o desarrollar conversiones propias.
- Rendimiento en benchmarks de código modesto (13,4 % pass@1 en HumanEval): no es apto como generador de código en producción sin supervisión humana.
- No se han publicado evaluaciones de seguridad, sesgo o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strifero/elroy-350m-base
- Repositorio de GitHub con el código documentado del tokenizer, modelo, entrenamiento y ajuste: https://github.com/strifero/elroy
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) asociados a este modelo.
