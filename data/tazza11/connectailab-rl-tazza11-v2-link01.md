# tazza11/connectailab-rl-tazza11-v2-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario tazza11 dentro del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión entrenado para leer en texto el estado de un robot simulado (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y responder con una única letra que representa la acción de caminar durante los siguientes 0,5 segundos. El dominio concreto es la tarea `avoid_obstacles` (evasión de obstáculos) del robot LINK-01.

El pipeline declarado es `reinforcement-learning` y el entrenamiento combina dos fases: primero un ajuste supervisado (LoRA) sobre 977 ejemplos de entrenamiento generados a partir de las decisiones de una política PPO entrenada en el entorno web, y después una fase de optimización con señal de recompensa (PPO con anclaje KL) que reordena las preferencias entre opciones según la recompensa obtenida al completar la trayectoria. El conjunto de validación tiene 187 ejemplos y el de test 284.

Su relevancia es acotada pero clara: demuestra un patrón de destilación de políticas de refuerzo hacia un modelo de lenguaje pequeño (0,8B parámetros) capaz de ejecutarse en hardware modesto, con un formato de entrada/salida estrictamente controlado (una sola letra) y con un protocolo de evaluación reproducible sobre 20 episodios con semillas fijas (91001–91020). Es un modelo de investigación y educación, no un componente listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; al ser un adaptador LoRA, la cuantizacion aplica al modelo base (GGUF/AWQ/GPTQ no documentados para este adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT (safetensors, cargado via `PeftModel.from_pretrained`) sobre pesos del modelo base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas que PEFT configure por defecto, de modo que la inferencia requiere cargar primero el modelo base completo y después aplicar el adaptador. La salida está restringida por prompt a una única letra entre las opciones listadas, lo que convierte el problema en una clasificación de elección múltiple expresada en lenguaje natural.

El entrenamiento tiene dos etapas documentadas. La primera es un ajuste supervisado sobre 977 pares estado→acción generados por una política PPO (el "cerebro" o `brain.json`) que camina el curso `3dde73b1` en el simulador web; el 20% de los ejemplos corresponden a situaciones en las que el cerebro se desvió del camino, para aumentar la cobertura de estados. La segunda etapa es una optimización por refuerzo con PPO y anclaje KL: para cada opción se calcula la recompensa que se habría obtenido si el cerebro hubiera continuado la trayectoria desde esa elección, y se sube la probabilidad de las opciones mejores que la del profesor y se baja la de las peores. La evaluación final coloca el modelo en el puesto de decisión del robot y lo hace caminar 20 episodios con semillas fijas; según la model card, el modelo subido es el resultante de la fase de aprendizaje supervisado.

## Capacidades

- Clasificación de acciones discretas en un dominio cerrado: dado un estado textual del robot LINK-01, devuelve exactamente una letra de entre las opciones presentadas.
- Lectura de observaciones estructuradas en texto (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa) con instrucción de sistema explícita para tratar el contenido de `state` como datos y no como instrucciones.
- Toma de decisiones secuenciales a 2 Hz (una decisión cada 0,5 segundos) en la tarea de evasión de obstáculos.
- Formato de salida estricto sin explicación, adecuado para pipelines automatizados que parsean una sola letra.
- Soporte de tool calling: no disponible.
- Capacidades de agente multi-paso generales: no disponibles; el modelo está especializado en un único dominio de decisión.
- Capacidades multilingües: limitadas al coreano según la metadata; no se documenta comportamiento en castellano.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de políticas de refuerzo destiladas: usar el adaptador como referencia para medir cuánto se degrada una política PPO al expresarla en lenguaje natural, comparando la tasa de coincidencia con el profesor sobre el conjunto de test de 284 ejemplos.
- Simulación educativa de robótica: integrar el modelo en el cuaderno de Colab del proyecto para que estudiantes observen cómo un LLM de 0,8B ejecuta decisiones de navegación en un entorno web, sin necesidad de GPU de gama alta.
- Prototipado de interfaces estado→acción: emplear el formato de pregunta/respuesta del proyecto (`connect_tycoon.link01.questions`) como plantilla para construir clasificadores de acciones con salida de una letra en otros dominios discretos.
- Banco de pruebas de robustez ante inyección de prompt: el propio diseño incluye una instrucción de sistema que trata el estado como datos; sirve para estudiar si el modelo respeta esa separación cuando el estado contiene texto adversario.
- Generación de datos sintéticos de decisión: ejecutar el modelo sobre estados muestreados del simulador para producir trayectorias alternativas y analizar la cobertura de la política original.
- Docencia sobre PPO y destilación: el repositorio CONNECT TYCOON y el cuaderno de Colab permiten reproducir el pipeline completo (entrenamiento del cerebro, generación del problemario, LoRA y PPO) con fines formativos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los del profesor (la política PPO original), no los del adaptador evaluado de forma independiente:

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 21,4 s |

La model card indica además que la tasa de coincidencia entre la expresión textual y la decisión del cerebro es del 100% (techo de acierto), pero no se aportan cifras propias del adaptador en MMLU, HumanEval, GSM8K ni en la métrica de éxito de los 20 episodios. La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con MuJoCo, por lo que los resultados pueden diferir de la simulación física.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, alrededor de 1,6 GB solo para los pesos del modelo base de 0,8B, más overhead de activaciones y del adaptador; en cuantización de 8 bits, del orden de 1 GB; en 4 bits, por debajo de 1 GB. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargar el modelo base en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue por lotes, A100 o H100 no aportan ventaja significativa dado el tamaño.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada. vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador; para usarlos habría que fusionar el adaptador con el modelo base y convertir los pesos.
- Latencia y throughput: no disponibles. La tarea impone una decisión cada 0,5 s, pero no se publican medidas de latencia del adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores LoRA de destilación de políticas PPO para decisión robótica en texto). La comparación más pertinente es con el propio modelo base y con la política de la que se destila:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B (base) + LoRA | no disponible | Sin métricas propias publicadas | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | No aplica al dominio; sin ajuste específico | según el modelo base | Hugging Face |
| Cerebro PPO (`brain.json`) | no aplica (tabla de política) | no aplica | 100% de éxito en 20 episodios, 21,4 s de media | del proyecto CONNECT TYCOON | Repositorio del proyecto |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 bajo el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`; fuera de ese formato la salida no es fiable.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que el éxito reportado no garantiza el mismo comportamiento en física real.
- No se publican métricas del adaptador en la tarea de 20 episodios; solo se documentan las del profesor. El rendimiento real del adaptador en el puesto de decisión no está cuantificado en la información disponible.
- Riesgo de alucinación de letra: si el prompt no restringe estrictamente las opciones, el modelo puede emitir una letra no listada o texto adicional; el parseo debe validar la salida.
- Idioma: metadata en coreano; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Sesgo de imitación: al entrenarse sobre las decisiones de una política PPO concreta en un curso concreto, hereda sus sesgos y no generaliza a mapas, robots o dinámicas distintas sin reentrenamiento.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tazza11/connectailab-rl-tazza11-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
