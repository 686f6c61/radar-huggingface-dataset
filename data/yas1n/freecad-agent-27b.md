# Yas1n/FreeCAD-Agent-27B

## Resumen

FreeCAD-Agent-27B es un adaptador LoRA publicado por el usuario Yas1n sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo es convertir un modelo de lenguaje general en un agente autónomo capaz de construir modelos 3D paramétricos en FreeCAD a partir de una descripción textual de una pieza y sus dimensiones clave. El agente escribe un script Python de FreeCAD, lo ejecuta con `freecadcmd`, lee la salida, corrige errores y guarda un documento `.FCStd` válido estructurado como un árbol de operaciones PartDesign editable (sketches, pads, pockets, fillets y patterns), no como una forma fija.

El adaptador se ha entrenado mediante QLoRA con supervisión sobre trayectorias de agente, con rango 32 y alpha 32 aplicados a todas las proyecciones de atención y MLP, y una longitud de contexto de entrenamiento de 24.576 tokens. Se distribuye en formato PEFT `safetensors` y también como LoRA en GGUF para llama.cpp, lo que permite servirlo sobre una versión cuantizada del modelo base en una única GPU de 48 GB.

Es relevante porque aborda una tarea concreta y difícil (text-to-CAD con feedback de ejecución) mediante un enfoque de agente con bucle de herramientas, y porque publica junto al adaptador un conjunto de datos de piezas de FreeCAD y una evaluación comparativa frente al modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el adaptador ocupa aproximadamente 1,0 GB (159.383.552 parámetros en safetensors).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B |
| Parametros totales | 159.383.552 (parametros del adaptador; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (el modelo base no se documenta como MoE en la informacion proporcionada) |
| Longitud de contexto | 24.576 tokens en entrenamiento; el ejemplo de despliegue con llama.cpp usa `--ctx-size 131072` |
| Tipos de cuantizacion | Base 4-bit para QLoRA en entrenamiento; en inferencia, LoRA GGUF sobre base GGUF (se recomienda Q6_K o superior) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer decoder-only del que la informacion disponible no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención). El ajuste es un QLoRA supervisado con el modelo base cuantizado a 4 bits, checkpointing de gradientes y LoRA de rango 32, alpha 32 y dropout 0 sobre las proyecciones `q, k, v, o, gate, up, down`. Se entrenó durante 1 época con tasa de aprendizaje 1e-4, tamaño de batch efectivo 16 y longitud máxima de secuencia de 24.576 tokens, usando Unsloth junto con el `SFTTrainer` de TRL y PEFT. El entrenamiento se ejecutó en una única NVIDIA L40S de 48 GB durante aproximadamente 11 horas.

Los datos consisten en 5.234 trayectorias de agente multi-turno: 4.607 trayectorias de CAD generadas por script (piezas mecánicas generadas proceduralmente, incluidas piezas generales, engranajes y piezas compuestas, cada una derivada de una solución de referencia verificada y cubriendo escritura del script, ejecución en FreeCAD, comprobación del resultado y envío) y 627 trayectorias de uso de herramientas de FreeCAD (`create_sketch`, `edit_sketch`, `execute_code`, etc.) que redactan un plan de operaciones antes de construir. La pérdida se aplica únicamente a los turnos del asistente (razonamiento, texto y llamadas a herramientas), enmascarando los prompts de sistema, los turnos de usuario y las salidas de herramientas.

## Capacidades

- Generación de código Python específico de FreeCAD para construir geometría paramétrica.
- Construcción de un único cuerpo PartDesign con un solo sólido y operaciones nombradas y editables.
- Bucle de agente con ejecución de shell: escribe el script, lo ejecuta con `freecadcmd`, lee la salida y corrige errores antes de entregar.
- Uso de herramientas de FreeCAD en modo llamada directa (`create_sketch`, `edit_sketch`, `execute_code`), con planificación previa de operaciones.
- Razonamiento multi-paso orientado a depuración de geometría y cumplimiento de especificaciones.
- Generación de documentos `.FCStd` guardados en disco.
- Capacidades conversacionales y de generación de texto heredadas del modelo base, aunque el adaptador está especializado en CAD.
- Soporte de tool calling y de agentes bash (por ejemplo, mini-swe-agent o bucles equivalentes).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agente text-to-CAD autónomo en un contenedor aislado con FreeCAD 1.x: se le pasa una descripción de pieza y parámetros, y el modelo itera escribiendo, ejecutando y corrigiendo scripts hasta producir un `.FCStd` válido. Es adecuado porque se entrenó exactamente sobre ese bucle con feedback de ejecución.
- Asistente de scripting de FreeCAD en un IDE o notebook: el modelo genera y edita sketches y operaciones mediante llamadas a herramientas, útil para prototipado rápido de piezas paramétricas.
- Generación de piezas mecánicas con parámetros nombrados: al producir un árbol PartDesign editable, un ingeniero puede cambiar cotas y regenerar la geometría sin reescribir el modelo.
- Automatización de catálogos de piezas: a partir de descripciones textuales de familias de piezas (placas, engranajes, conjuntos), el agente puede generar variantes parametrizadas de forma repetible.
- Investigación en agentes CAD y aprendizaje por refuerzo: el adaptador y el dataset asociado sirven como punto de partida para experimentos de fine-tuning adicional o RL sobre trayectorias verificadas.
- Depuración asistida de scripts de FreeCAD: dado un script que falla, el modelo puede ejecutarlo, interpretar el error de FreeCAD y proponer una corrección dentro del mismo bucle de agente.
- Integración en pipelines de diseño con verificación humana: el resultado se trata como borrador y se valida dimensionalmente antes de fabricación, aprovechando que la salida es un modelo editable y no una malla opaca.

## Benchmarks y rendimiento

Evaluación text-to-CAD del autor: cada tarea proporciona una descripción escrita de una pieza y sus parámetros nombrados; ambos modelos se ejecutan como agentes en el mismo sandbox Docker con FreeCAD 1.1, con un intento por tarea. La puntuación va de 0 a 1 frente a un modelo de referencia y combina similitud geométrica con cumplimiento de especificaciones (por ejemplo, un único cuerpo PartDesign que produce exactamente un sólido).

| Modelo | Puntuación media | Tareas fallidas (puntuación 0) |
|---|---|---|
| Qwen3.8-27B (base) | 0.416 | 7 / 13 |
| FreeCAD-Agent-27B | 0.534 | 4 / 13 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Entrenamiento: 1 × NVIDIA L40S (48 GB) con QLoRA a 4 bits, aproximadamente 11 horas para 1 época.
- Inferencia recomendada por el autor: llama.cpp con base GGUF Q6_K o superior más el LoRA GGUF, en una única GPU de 48 GB.
- VRAM estimada: no disponible de forma explícita; el autor indica que cabe en una GPU de 48 GB con base cuantizada y LoRA. El adaptador en safetensors ocupa aproximadamente 1,0 GB.
- GPU recomendadas: L40S (48 GB) según el entrenamiento; A100 40/80 GB y H100 son opciones coherentes por capacidad, aunque no se documentan pruebas en la información disponible.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 (24 GB) u otras tarjetas consumer con el modelo base de 27B.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora`, `--jinja`, `--reasoning on`, `--flash-attn on`), Transformers + PEFT, carga en 4 bits con `BitsAndBytesConfig(load_in_4bit=True)` o `FastLanguageModel.from_pretrained(..., load_in_4bit=True)` de Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FreeCAD-Agent-27B | Adaptador de 159.383.552 sobre base de 27B | 24.576 en entrenamiento; hasta 131.072 en el ejemplo de llama.cpp | LoRA para agente text-to-CAD con FreeCAD | apache-2.0 | HuggingFace (PEFT safetensors y LoRA GGUF) |
| Qwen3.8-27B (base) | 27B (según denominación) | no disponible | Modelo general de texto | no disponible en la información proporcionada | HuggingFace |
| Alternativas específicas de text-to-CAD open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que la geometría generada es un borrador: no debe usarse para aprobación de ingeniería sin verificar dimensiones, tolerancias y fabricabilidad.
- El adaptador está especializado en CAD y puede rendir peor que el modelo base en tareas generales de conversación.
- El agente ejecuta comandos de shell que él mismo escribe; debe ejecutarse siempre en un contenedor aislado.
- El modelo rinde notablemente peor en una única generación sin feedback de ejecución; el bucle de agente es parte del diseño.
- Idiomas soportados: solo inglés según la model card.
- Riesgo de alucinación en APIs de FreeCAD, nombres de operaciones y cotas; el bucle de ejecución mitiga parte del problema, pero no lo elimina.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia del adaptador es Apache 2.0, pero el uso comercial depende también de la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El benchmark del autor es pequeño (13 tareas, un intento por tarea), por lo que la mejora de 0.416 a 0.534 debe interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yas1n/FreeCAD-Agent-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset asociado: https://huggingface.co/datasets/Yas1n/freecad-part-dataset
- mini-swe-agent (harness de agente bash): https://github.com/SWE-agent/mini-swe-agent
