# Tugrases/trenet-plus-v1.5

## Resumen

trenet+-v1.5 es un modelo de lenguaje experimental de 25 millones de parámetros entrenado desde cero para conversación cotidiana en turco. Lo desarrolla Tugrases, un autor individual que lo ha entrenado en un equipo doméstico con una única tarjeta gráfica. El objetivo declarado no es competir con modelos grandes, sino explorar hasta dónde puede llegar un modelo de este tamaño en chat diario en turco: saludos, memoria dentro de la conversación, instrucciones simples y operaciones aritméticas básicas guiadas paso a paso.

La arquitectura es un transformer decoder-only de diseño propio, orientado a escala pequeña, con una longitud de contexto de 2048 tokens. El entrenamiento combinó una fase de preentrenamiento sobre aproximadamente 2000 millones de tokens con un ajuste fino posterior para conversación. Según el autor, la versión 1.5 mejora respecto a la anterior trenet-v1.3d en memoria conversacional, comprensión de mensajes con errores ortográficos y diálogo multi-turno cotidiano.

Es relevante como referencia de investigación reproducible en entornos con recursos mínimos y como ejemplo de modelo de dominio lingüístico muy concreto (solo turco) con licencia MIT. No es una herramienta para producción: el propio autor lo califica de intento de investigación y advierte explícitamente de que no debe usarse para tareas serias ni como fuente de información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de diseño propio, orientado a escala pequeña |
| Parámetros totales | 25.037.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors); incluye config.json, tokenizer.json y código de inferencia en trenet/ y chat.py |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una arquitectura interna propia diseñada para escala pequeña, no una copia de una familia estándar tipo Llama o Mistral. El autor indica que la estructura interna se renovó respecto a trenet-v1.3d, lo que explica las mejoras declaradas en retención de información dentro del diálogo y en la interpretación de mensajes con faltas de ortografía. No se detallan el número de capas, dimensiones ocultas, número de cabezas de atención ni el tipo de tokenizador más allá de que es un tokenizador turco propio.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre aproximadamente 2000 millones de tokens y un ajuste fino posterior orientado a conversación. El autor no publica la composición del dataset, la proporción de datos sintéticos o reales, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información sobre el proceso de entrenamiento es, por tanto, mínima y no verificable de forma independiente.

## Capacidades

- Generación de texto conversacional breve en turco: saludos, preguntas cotidianas y consejos sencillos.
- Memoria dentro de la conversación: retiene datos aportados por el usuario en turnos previos (nombre, ciudad, preferencias) y los recupera si se le pregunta.
- Seguimiento de instrucciones simples: listas cortas, respuestas de una sola frase y formatos restringidos del tipo "escribe solo esto".
- Aritmética básica guiada paso a paso: sumas, restas y cálculos de porcentajes mostrados explícitamente; el script chat.py incorpora una pequeña calculadora que verifica las operaciones de cuatro operaciones básicas y puede desactivarse con --no-calculator.
- Tolerancia a errores ortográficos en los mensajes del usuario.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso general.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: únicamente turco.

## Casos de uso

- Investigación sobre modelos de lenguaje de muy bajo parámetro: sirve como banco de pruebas para estudiar qué capacidades emergen a 25 millones de parámetros en un idioma concreto, con un coste de entrenamiento e inferencia mínimo.
- Docencia y formación: permite ilustrar el ciclo completo de preentrenamiento y ajuste fino conversacional en un equipo doméstico, con pesos y código de inferencia incluidos en el repositorio.
- Prototipado de interfaces de chat en turco: útil para validar flujos de conversación multi-turno y el comportamiento de la memoria conversacional antes de invertir en un modelo mayor.
- Pruebas de robustez frente a errores ortográficos: el modelo está entrenado para interpretar mensajes con faltas, lo que permite experimentar con normalización de texto y evaluación de tolerancia a ruido en turco.
- Demostraciones educativas de aritmética asistida: el patrón de combinar el modelo con una calculadora externa en chat.py ejemplifica cómo delegar el cálculo determinista a herramientas y dejar al modelo solo la formulación del problema.
- Evaluación comparativa de tokenizadores turcos: al incluir un tokenizador propio, permite analizar la eficiencia de tokenización en turco frente a tokenizadores multilingües en corpus pequeños.
- Despliegue en hardware muy limitado: con 25 millones de parámetros y un repositorio de 0,1 GB, puede ejecutarse en CPU para experimentos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones en turco) y las mejoras respecto a trenet-v1.3d se describen de forma cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 25 millones de parámetros en precisión de 16 bits los pesos ocupan aproximadamente 50 MB, y en fp32 unos 100 MB, por lo que la huella de memoria es mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor lo entrenó en un equipo doméstico con una sola tarjeta gráfica.
- Cabe en cualquier GPU de consumo, incluidas integradas y modelos antiguos, y también funciona en CPU según la model card.
- Opciones de despliegue: el repositorio incluye su propio código de inferencia (chat.py y el paquete trenet/) con dependencias de torch, tokenizers y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no hay una ruta de despliegue estándar fuera del script del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenet+-v1.5 | 25 M | 2048 | Turco | MIT | Hugging Face, pesos safetensors y código propio |
| Modelos de chat turcos de tamaño pequeño (por ejemplo, variantes de 100-500 M ajustadas para turco) | 100-500 M (orientativo) | no disponible | Turco o multilingüe | variable | variable |
| Modelos multilingües pequeños tipo Qwen o Gemma en sus versiones mini | cientos de millones a pocos miles de millones | varios miles de tokens | multilingüe | variable | amplia |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación debe limitarse a parámetros, contexto y licencia; en tamaño, trenet+-v1.5 es aproximadamente un orden de magnitud menor que los modelos pequeños habituales de chat en turco, lo que limita su uso a conversación muy acotada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo no es una fuente de información: inventa respuestas verosímiles pero falsas en temas que desconoce, con riesgo alto de alucinación.
- No es apto para tareas serias ni para producción; se presenta como un experimento de investigación.
- Fuera de su alcance: textos largos, traducción, generación de código y razonamiento real.
- Falla con frecuencia en acertijos y preguntas de atención.
- Puede perder el hilo en conversaciones largas, pese a la ventana de 2048 tokens.
- Solo entiende y genera turco; no hay capacidades multilingües.
- Los datos de entrenamiento y la composición del corpus no se publican, por lo que no es posible evaluar sesgos de forma rigurosa; cabe esperar sesgos presentes en el corpus turco empleado, no documentados.
- La licencia MIT permite uso comercial, modificación y redistribución conservando el aviso de copyright, pero la calidad del modelo hace desaconsejable cualquier uso comercial.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita su integración en herramientas de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tugrases/trenet-plus-v1.5
- Repositorio de código: incluido en el propio repositorio de Hugging Face (trenet/, chat.py)
- Paper, blog o demo adicionales: no disponible
