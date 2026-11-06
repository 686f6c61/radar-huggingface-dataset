# suunny/Qwen3.5-9B-Terminal-RL

## Resumen

Qwen3.5-9B-Terminal-RL es un adaptador LoRA experimental publicado por el usuario suunny sobre el modelo base Qwen/Qwen3.5-9B. Se trata de un artefacto de investigación orientado al entrenamiento de agentes de terminal mediante aprendizaje por refuerzo (RL), no de un modelo fusionado ni de una versión lista para producción. El adaptador se entrenó con Prime RL sobre 80 tareas del conjunto TermGrade, con rango 16, alpha 32 y una tasa de aprendizaje de 1e-5, ejecutando un entrenador y dos workers de inferencia sobre GPU H100 en Modal.

El interés del release es metodológico: documenta de forma transparente un ciclo corto de RL (10 actualizaciones, 640 episodios aceptados) y publica tanto los resultados de entrenamiento como la evaluación en held-out. Esa evaluación muestra que el adaptador no superó al modelo base: la tasa de acierto cayó del 49,46 % al 45,11 % sobre 23 tareas reservadas, con 8 intentos por tarea. El propio autor lo califica como artefacto de investigación y no recomienda su uso en producción.

La relevancia actual reside en que ejemplifica las prácticas de reproducibilidad en RL para agentes (traza completa, dataset público, verificación de tensores y SHA-256) y en que hace explícito un resultado negativo, algo poco habitual en la publicación de adaptadores. El repositorio ocupa 0,1 GB e incluye únicamente los pesos del adaptador, sin checkpoints de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; el adaptador es de rango 16 con alpha 32 |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer del que la informacion disponible no detalla la arquitectura interna ni el volumen de datos de preentrenamiento. La contribucion del release es el ajuste LoRA con rango 16 y alpha 32, entrenado mediante RL con Prime RL sobre 80 tareas de terminal del conjunto TermGrade. El bucle de entrenamiento constó de 10 actualizaciones; en cada una se aceptaron 64 trayectorias agrupadas en ocho intentos por tarea. La inferencia se configuró con 64 rollouts concurrentes por GPU y 128 en total, con un entrenador H100 y dos workers de inferencia H100 sobre Modal.

La recolección asíncrona devolvió 1.394 episodios, de los cuales 640 se aceptaron para las actualizaciones (365 pases y 275 fallos), con una recompensa media aceptada de 0,5703. El conjunto de entrenamiento se seleccionó a partir de 216 tareas cribadas, de las que 103 mostraron entre 2 y 6 pases en ocho intentos de cribado. El autor advierte explícitamente de que la recompensa de entrenamiento no equivale a precisión en held-out. No se documentan innovaciones como decodificación especulativa ni atención lineal; el interés técnico está en el pipeline de RL asíncrono y en la trazabilidad del experimento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B.
- Ejecución de tareas de terminal y agentes de línea de comandos, objetivo declarado del ajuste.
- Razonamiento multi-paso dentro de un bucle de agente, con un límite observado de 50 turnos por intento.
- Aprendizaje por refuerzo aplicado a la política del agente (pases y fallos como señal de recompensa).
- Soporte de tool calling: no disponible en la informacion proporcionada (depende del modelo base).
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigación en RL para agentes: el adaptador sirve como punto de partida reproducible para estudiar cómo diez actualizaciones de RL afectan a la política de un agente de terminal, con dataset y trazas públicas.
- Reproducción de experimentos: permite replicar el pipeline Prime RL con 64 rollouts concurrentes por GPU y comparar contra el modelo base en las mismas 23 tareas reservadas.
- Auditoría de metodología: útil para analizar por qué un ajuste con recompensa media de 0,5703 puede degradar el rendimiento en held-out (45,11 % frente a 49,46 %).
- Estudio de límites de turnos: los datos de truncamiento (124 intentos truncados y 108 que alcanzaron el tope de 50 turnos en el paso 10) permiten investigar políticas de parada y presupuestos de interacción.
- Base para ajustes posteriores: al ser un adaptador PEFT de 0,1 GB, puede cargarse junto al modelo base para continuar el entrenamiento o aplicar técnicas de corrección.
- Docencia y divulgación: ejemplo concreto de publicación de resultados negativos y de verificación de integridad (SHA-256 y 256 tensores finitos comprobados en CPU).

## Benchmarks y rendimiento

Evaluación en held-out con 23 tareas, 8 intentos por tarea (184 intentos totales), mismo arnés y presupuestos:

| Metrica | Base | Step 10 |
|---|---:|---:|
| Pases / 184 | 91 | 83 |
| Fallos / 184 | 93 | 101 |
| Tasa de acierto | 49,46 % | 45,11 % |
| Intentos truncados | 104 | 124 |
| Alcanzaron el tope de 50 turnos | 92 | 108 |
| Errores de infraestructura / timeouts | 0 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base Qwen3.5-9B, cuyos requisitos de VRAM no se detallan en la informacion proporcionada.
- Entrenamiento original: un entrenador H100 y dos workers de inferencia H100 sobre Modal.
- Evaluación: GPU H200 para el modelo base y H100 para el adaptador.
- VRAM estimada para inferencia: no disponible (depende de la cuantización del modelo base, no documentada).
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: carga mediante PEFT con `PeftModel.from_pretrained(base_model, "suunny/Qwen3.5-9B-Terminal-RL")`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se conoce la configuración de 64 rollouts concurrentes por GPU y 128 combinados durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Terminal-RL (step 10) | Adaptador LoRA sobre 9B | No disponible | 45,11 % (83/184) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9B | No disponible | 49,46 % (91/184) | No disponible en la informacion proporcionada | Hugging Face |
| Otros adaptadores de agentes de terminal | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no mejora al modelo base: pierde 4,35 puntos porcentuales en la evaluación held-out (8 intentos menos de 184).
- El propio autor lo describe como artefacto de investigación, no como recomendación de producción.
- Es un adaptador LoRA, no un modelo fusionado; requiere cargar el base en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`.
- La evaluación se hizo con 8 intentos por tarea, lo que deja una incertidumbre sustancial según el autor.
- Mayor tasa de truncamiento y de intentos que alcanzan el tope de 50 turnos (108 frente a 92), lo que sugiere políticas de parada menos eficientes.
- La recompensa de entrenamiento (0,5703) no debe interpretarse como precisión en held-out.
- No se ejecutó inferencia fresca durante la validación del release; solo se comprobaron configuración, SHA-256 y 256 tensores finitos en CPU.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la informacion proporcionada.
- Idiomas soportados: no disponible.
- Licencia Apache 2.0, que permite uso comercial del adaptador, pero el modelo base puede tener condiciones propias no detalladas aquí.
- Los checkpoints completos de optimizador se excluyen del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/suunny/Qwen3.5-9B-Terminal-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog: https://susindrar.com/blog/terminal-agent-rl
- Código: https://github.com/SUSINDRAREDDY/terminal-agent-rl
- Dataset: https://huggingface.co/datasets/suunny/terminal-agent-rl
