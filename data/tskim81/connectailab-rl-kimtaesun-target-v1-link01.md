# tskim81/connectailab-rl-kimtaesun-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión de un robot simulado de nombre LINK-01 en la tarea `goto_target` (llegar a un objetivo). El modelo recibe en lenguaje natural el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve exactamente una letra correspondiente a una de las cinco acciones disponibles para el siguiente intervalo de 0,5 segundos. Lo desarrolla Kim Tae-sun (tskim81), de la empresa Solgivers, en el marco del proyecto educativo CONNECT AI LAB × AI CITY BUILDERS.

El interés técnico no está en la capacidad generativa del modelo, sino en el método: primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo, después se destila esa política en un conjunto de pares observación-en-texto / acción (889 de entrenamiento, 139 de validación y 310 de test), se hace un ajuste supervisado con LoRA sobre un modelo de lenguaje de 0,8 mil millones de parámetros y finalmente se refina con RL usando la recompensa de la política profesora como señal, con anclaje KL. Es un ejemplo compacto y reproducible de destilación de políticas de control en un LLM pequeño.

La relevancia es acotada: se trata de un modelo de investigación y educación sobre simulación, con licencia Apache 2.0, publicado con cero descargas y sin validación en robots reales. El autor advierte explícitamente que debe revalidarse en el robot y el espacio concretos antes de cualquier uso físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no declarada en la ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko); las instrucciones del sistema se proporcionan en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas que PEFT determine, de modo que la inferencia requiere cargar el modelo base completo más el adaptador. La tarea es de clasificación restringida a cinco opciones (una letra por respuesta), no de generación libre.

El pipeline de entrenamiento tiene cuatro etapas documentadas por el autor. Primero, una política PPO se entrena en el entorno web `goto_target` con la especificación `link01-decision/goto_target/obs10-act5/walker51-14/v1` sobre el curso `random`, alcanzando un 100 % en el examen oficial. Segundo, se generan pares de entrenamiento serializando cada 0,5 segundos la observación del robot a texto y tomando como etiqueta la acción de la política profesora; el 20 % de los ejemplos corresponden a situaciones en las que la política se desvió del camino. Tercero, ajuste supervisado con LoRA sobre esos pares. Cuarto, refinamiento por RL con PPO y anclaje KL, usando como recompensa el retorno que obtendría la política profesora al continuar desde la acción elegida, de forma que se premian acciones mejores que las del profesor y se penalizan las peores. La evaluación final coloca al modelo en el puesto de decisión del robot y lo ejecuta durante 20 episodios con semillas 91001–91020.

## Capacidades

- Clasificación de decisión restringida: devuelve exactamente una letra entre cinco opciones, sin texto adicional, cuando se le aplica la instrucción de sistema indicada por el autor.
- Interpretación de estado serializado en lenguaje natural: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido de `state` como datos y no como instrucciones.
- Seguimiento de instrucciones de formato estricto (salida de un solo carácter).
- Capacidad multilingüe limitada al coreano declarado; las indicaciones del sistema están en inglés.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de destilación de políticas: el par (política PPO, adaptador LoRA) permite mostrar en clase el ciclo completo de RL clásico, generación de datos, SFT y refinamiento con recompensa, con un modelo de 0,8B que cabe en hardware modesto.
- Reproducción de experimentos de RLHF/RL con recompensa derivada de una política: el esquema de recompensa basado en el retorno del profesor y anclaje KL sirve como plantilla para tareas de control discretas.
- Evaluación de robustez a inyección de instrucciones: el modelo está entrenado con una instrucción explícita de tratar el estado como datos, lo que lo convierte en un banco de pruebas para estudiar cómo un LLM pequeño maneja entradas no confiables.
- Agente de decisión en simulador 2D: integrado en el entorno de CONNECT AI WORLD, puede sustituir a la política neuronal para comparar curvas de éxito y tiempos de episodio.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas para observaciones no vistas y servir de profesor auxiliar en destilaciones posteriores, siempre con validación contra la política original.
- Investigación sobre límites de los LLM pequeños en control: con 0,8B de parámetros y una tasa de coincidencia del 92,3 % con el profesor, es un caso útil para medir la brecha entre imitación textual y política neuronal.
- Pruebas de pipelines PEFT: sirve como ejemplo mínimo de carga de un adaptador con `PeftModel.from_pretrained` para validar integraciones de despliegue.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Política profesora (PPO) | 100,0 % | 60 % | 55 % | 11,5 s |
| Modelo base sin ajuste | 14,8 % | 0 % | 100 % | — |
| Solo SFT (LoRA) | 92,9 % | 60 % | 65 % | 12,1 s |
| SFT + RL (modelo publicado) | 92,3 % | 70 % | 60 % | 11,7 s |

El autor indica que la evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, sin el modelo del robot ni la red neuronal de marcha, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web. La tasa de acierto en test está limitada por un techo del 99 % (proporción en que la propia política profesora da la misma respuesta tras la serialización a texto).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo base de 0,8B en FP16 se sitúa en torno a 2 GB, y en cuantización de 4 bits por debajo de 1 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargar el modelo base en FP16; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, por el tamaño del modelo base, aunque no hay confirmación oficial.
- Opciones de despliegue: carga vía `transformers` + `peft` según el snippet del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo debe responder en menos de 0,5 segundos por decisión para operar en tiempo real en el bucle de control, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kimtaesun-target-v1-link01 | Adaptador sobre 0,8B | No disponible | Decisión de robot simulado (5 acciones) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Generación de texto general | No disponible en la información | Hugging Face |
| Política PPO original (brain.json) | No disponible | No aplica | Decisión de robot simulado | No disponible | Entorno CONNECT AI WORLD |

No se han identificado en la información proporcionada otros adaptadores LoRA equivalentes para tareas de decisión robótica sobre modelos de 0,8B con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para la tarea `goto_target` con 10 observaciones y 5 acciones; no generaliza a otras tareas ni a otros robots.
- Evaluación en simulación: la marcha se puntúa con una aproximación 2D basada en una tabla de velocidades, no con el simulador MuJoCo completo ni con hardware real.
- Brecha respecto al profesor: el modelo coincide con la política PPO en el 92,3 % de los casos y solo alcanza un 70 % de éxito en 20 episodios frente al 60 % del profesor, con un 60 % de episodios con colisión.
- Riesgo de alucinación de formato: al ser un LLM, puede devolver texto adicional o una letra no válida si el prompt se desvía del formato esperado; el autor exige una instrucción de sistema concreta.
- Riesgo de inyección de instrucciones: aunque el prompt indica tratar el estado como datos, no hay garantía formal de que el modelo ignore instrucciones maliciosas embebidas en la observación.
- Idiomas: solo se declara coreano; el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el modelo a fines de investigación y educación sobre simulación y exige revalidación antes de usarlo en un robot real.
- Sin métricas de latencia: no se documenta si el modelo cumple el requisito de decisión cada 0,5 segundos en hardware consumer.
- Publicación reciente y sin tracción: cero descargas y cero likes en el momento de la consulta, sin revisión externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tskim81/connectailab-rl-kimtaesun-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- GitHub del autor: https://github.com/tskim81
