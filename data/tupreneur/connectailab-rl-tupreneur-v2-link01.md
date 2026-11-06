# TUpreneur/connectailab-rl-tupreneur-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por TUpreneur bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje general: es un modelo de decisión entrenado para leer en texto el estado de un robot caminante de dos dimensiones (distancia y dirección al objetivo, lecturas de sensores, velocidad y acción previa) y emitir una única letra que representa el movimiento a ejecutar durante los siguientes 0,5 segundos. El problema que resuelve es el de destilar una política de control entrenada con PPO en un modelo de lenguaje, de forma que un LLM pueda ocupar el puesto de decisión de un agente dentro de un simulador.

El modelo se construye en dos fases: primero un ajuste supervisado (LoRA) sobre pares observación-texto y respuesta del "cerebro" PPO, y después un ajuste por refuerzo con PPO que reordena las preferencias entre opciones según la recompensa obtenida al dejar que el cerebro original continúe la trayectoria. El conjunto de datos se compone de 1200 ejemplos de entrenamiento, 240 de validación y 360 de prueba, generados a partir de una única pista de simulación (`4e5ae63b`) y del contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, con 21 dimensiones de observación y 5 acciones posibles.

Su relevancia es acotada y de carácter educativo: sirve como ejemplo reproducible de cómo aplicar PPO y LoRA sobre un modelo pequeño (0,8B parámetros) para tareas de decisión secuencial, y como banco de pruebas para evaluar si un LLM puede sustituir a una política especializada en un entorno de control. No está pensado para robótica real ni para uso general, y el propio autor advierte que debe revalidarse en cada robot y espacio antes de cualquier despliegue físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en dos etapas. La primera es un ajuste supervisado sobre 1200 ejemplos de entrenamiento (240 de validación, 360 de prueba) en los que la entrada es una representación textual de la observación del robot y la salida es la letra de la acción elegida por la política PPO original. Un 20% de los ejemplos corresponden a situaciones en las que el cerebro se desvió de la ruta, para que el modelo aprenda a reconocer y corregir desviaciones. La segunda etapa es un ajuste por refuerzo con PPO: para cada opción se calcula la recompensa que se habría obtenido si el cerebro original hubiera continuado la trayectoria tras esa elección, y se refuerzan las opciones con mayor recompensa frente a las peores, con una penalización KL que mantiene al modelo cerca de la política supervisada.

La innovación técnica principal es el uso de una política PPO entrenada en un simulador web (MuJoCo) como "profesor" para destilar el comportamiento en un LLM mediante texto. El contrato de la tarea fija 21 dimensiones de observación y 5 acciones discretas, y la evaluación se realiza con un aproximador 2D de la marcha basado en una tabla de velocidades por comando, lo que evita caídas pero puede diferir ligeramente de los resultados en MuJoCo. El autor reporta que la tasa de acuerdo entre el texto y el cerebro original (techo de acierto) es del 100%, lo que indica que la representación textual no pierde información relevante para la decisión.

## Capacidades

- Decisión discreta en un entorno de control: dado un estado textual del robot (distancia y dirección al objetivo, sensores, velocidad, acción previa), devuelve una única letra entre 5 opciones posibles.
- Formato de salida restringido: el modelo está entrenado para responder solo con la letra, sin explicación, siguiendo una instrucción de sistema concreta.
- Reconocimiento de estados fuera de distribución: el 20% de ejemplos con desviaciones permite cierta capacidad de corrección cuando la observación no coincide con la trayectoria nominal.
- Seguimiento de instrucciones de sistema en coreano e inglés técnico (la instrucción de sistema está en inglés y el contenido de la model card en coreano).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento general. Es un modelo de clasificación de acciones disfrazado de LLM.

## Casos de uso

- Docencia de refuerzo con PPO y LoRA: el modelo sirve como ejemplo completo y reproducible de un pipeline que va de una política PPO en un simulador web a un adaptador LoRA sobre un LLM de 0,8B, con notebook de Colab incluido.
- Investigación en destilación de políticas: permite comparar el comportamiento de una política especializada (el cerebro PPO) con el de un LLM destilado, midiendo acuerdo en preguntas y éxito en episodios.
- Banco de pruebas de evaluación de LLM en control: al fijar un contrato de 21 observaciones y 5 acciones, se puede usar para medir la capacidad de un modelo pequeño de seguir formatos estrictos y tomar decisiones discretas.
- Prototipado de agentes en simuladores 2D: integrable en el entorno `connect-tycoon` para experimentar con sustituciones del módulo de decisión sin tocar el resto del pipeline.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción a partir de descripciones textuales del estado, útiles para aumentar datasets de entrenamiento en tareas de navegación simple.
- Demostración educativa en vídeo y cursos: el autor lo presenta como material de un curso gratuito de refuerzo en YouTube (CONNECT AI LAB), por lo que encaja como pieza didáctica en formación técnica.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre la pista `4e5ae63b` y 20 episodios de evaluación (semillas 91001–91020) con el aproximador 2D:

| Modelo | Acierto en preguntas de prueba (acuerdo con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 65% | 10% | 29,1 s |
| Modelo sin entrenar | 30,0% | 0% | 0% | — |
| Ajuste supervisado (LoRA) | 87,8% | 30% | 15% | 29,2 s |
| Ajuste por refuerzo (PPO) | 82,2% | 35% | 20% | 29,7 s |

El ajuste por refuerzo mejora el éxito en episodios (35% frente a 30% del supervisado) a costa de un menor acuerdo con el profesor en las preguntas (82,2% frente a 87,8%), lo que sugiere que el modelo RL prioriza recompensa de episodio sobre imitación literal. En ningún caso se alcanza el rendimiento del cerebro PPO original (65% de éxito). No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B en fp16 ocupa aproximadamente 1,6 GB; con el adaptador LoRA el consumo añadido es mínimo (decenas de MB). En cuantización de 4 bits cabría en menos de 1 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090). Para entrenamiento del adaptador, una RTX 3090 o A100 acorta los tiempos, pero el tamaño del modelo permite entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no se proporciona ese formato).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, la latencia por token debería ser de pocos milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | no disponible | Decisión discreta en simulador 2D | Apache 2.0 | Hugging Face, 16 descargas |
| Cerebro PPO original | Política pequeña (no especificado) | N/A | Decisión discreta en simulador 2D | No especificada | Solo dentro del proyecto `connect-tycoon` |
| Qwen3.5-0.8B base | 0,8B | no disponible | Lenguaje general | Apache 2.0 | Hugging Face |
| Políticas de control tipo MLP para MuJoCo | Típicamente <1M | N/A | Control continuo/discreto | Variable | Repositorios de RL (Stable-Baselines3, etc.) |

La comparación directa con otros LLM de decisión no está disponible: no se conocen adaptadores públicos equivalentes para la tarea `goto_target` de LINK-01. Frente al cerebro PPO original, el modelo destilado es peor en éxito de episodio (35% frente a 65%) y en colisiones (20% frente a 10%), pero ofrece la ventaja de ser inspeccionable y ajustable mediante texto.

## Limitaciones y advertencias

- Entrenado sobre una única pista (`4e5ae63b`) y un único contrato de observación/acción; no generaliza a otros entornos sin reentrenamiento.
- El éxito en episodios (35%) es muy inferior al del profesor PPO (65%), por lo que no es un sustituto fiable de la política original.
- La evaluación se hizo con un aproximador 2D basado en tablas de velocidad, no con el simulador MuJoCo completo; los resultados pueden diferir del entorno real.
- El modelo solo habla coreano en su model card y está pensado para instrucciones de sistema en inglés; no se ha evaluado su robustez en otros idiomas.
- Riesgo de alucinación en el sentido de emitir una letra no válida o una explicación no solicitada si la instrucción de sistema no se respeta; el formato de salida es frágil.
- Uso previsto exclusivamente educativo y de investigación en simulación; el autor advierte explícitamente que debe revalidarse en cada robot y espacio antes de usarlo en hardware real.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar el comportamiento en producción recae en el integrador.
- Sin datos publicados sobre sesgos, robustez ante entradas adversariales ni comportamiento fuera de la distribución de la pista de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de refuerzo): https://www.aicitybuilders.com/robot
- Simulador web del robot: https://www.ezerai.xyz/robot-lab/world/
