# tskim81/connectailab-rl-kimtaesun-choose-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por tskim81 (Solgivers) en el marco del proyecto educativo CONNECT AI LAB. No es un modelo de lenguaje de propósito general, sino una política de decisión especializada: recibe como texto una descripción del estado de un robot caminante (objetivo, distancia, dirección, sensores de distancia, velocidad y elección previa) y devuelve una única letra que corresponde a la acción de locomoción a ejecutar durante los siguientes 0,5 segundos. El dominio concreto de la tarea es `choose_object`: elegir un objeto entre los disponibles en el entorno.

El modelo se obtiene en dos fases. Primero se entrena una política PPO en un simulador web (el "cerebro", almacenado como brain.json) sobre el curso `ff7735e0` de la tarea `choose_object`. Después se genera un corpus de 759 problemas (510 de entrenamiento, 91 de validación y 158 de prueba) traduciendo las observaciones del cerebro a lenguaje natural, y se ajusta el modelo Qwen con LoRA mediante aprendizaje supervisado seguido de un refinamiento con refuerzo anclado por KL a la política supervisada.

Su relevancia es acotada pero ilustrativa: demuestra cómo destilar una política de refuerzo en un modelo de lenguaje pequeño (0,8B parámetros base) para que razone sobre estados discretos y responda con una acción simbólica. Es un artefacto de investigación y docencia, con licencia Apache 2.0, y no está pensado para uso en robótica real sin revalidación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parámetros totales | no disponible (adaptador LoRA; base de 0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; cuantización del base no documentada) |
| Idiomas soportados | ko (coreano; las instrucciones del sistema están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento sigue un pipeline de destilación de política: (1) PPO en el simulador web sobre la tarea `choose_object` con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`, que define 26 dimensiones de observación y 4 acciones de caminata; (2) generación de un dataset de 759 ejemplos donde cada observación se serializa como texto y la etiqueta es la acción elegida por el cerebro PPO, incluyendo un 20 % de ejemplos con desviaciones deliberadas; (3) ajuste supervisado con LoRA; y (4) refinamiento con refuerzo usando recompensas por acción y una penalización KL contra la política supervisada para evitar el colapso.

La innovación técnica principal no está en la arquitectura del modelo, sino en el método: convertir una política de control continuo en un problema de selección de letra única resuelto por un LLM, con un formato de prompt estricto (instrucción de sistema que trata el estado como datos y exige devolver solo la letra). El autor reporta una tasa de acierto del 100 % respecto al cerebro profesor en los conjuntos de validación y prueba, y un éxito del 100 % en 20 episodios de evaluación con semillas 91001–91020.

## Capacidades

- Selección de acción discreta: dado un estado textual del robot, devuelve una única letra entre las opciones listadas.
- Razonamiento sobre estados estructurados: interpreta distancias, direcciones, lecturas de sensores y velocidad codificadas en texto.
- Aprendizaje por refuerzo destilado: reproduce el comportamiento de una política PPO entrenada en simulador.
- Formato de salida restringido: responde solo con la letra de la opción, sin explicación, cuando se usa la instrucción de sistema indicada.
- Multilingüe limitado: etiquetado como coreano (`ko`); no se documenta soporte para otros idiomas.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de destilación de políticas RL: sirve como ejemplo reproducible de cómo convertir una política PPO en un adaptador LoRA sobre un LLM pequeño, usando el notebook de Colab y el repositorio CONNECT TYCOON.
- Investigación en control simbólico: permite estudiar si un LLM de 0,8B puede aproximar una función de política discreta en un entorno de 26 observaciones y 4 acciones.
- Prototipado de interfaces lenguaje-acción: útil para experimentar con prompts que transforman observaciones numéricas en decisiones categóricas antes de invertir en un modelo mayor.
- Evaluación de robustez ante instrucciones: el formato con instrucción de sistema que separa datos de instrucciones permite probar defensas básicas contra inyección de prompt en el campo de estado.
- Benchmark interno de pipelines PEFT: sirve para medir el coste de entrenar y desplegar un adaptador LoRA sobre un base de 0,8B en flujos de experimentación rápida.
- Reproducción de experimentos educativos: el dataset y el código permiten replicar las cifras reportadas (100 % de acierto, 100 % de éxito en 20 episodios) en entornos controlados.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 100 % | 35 % | 10,5 s |
| Sin entrenar | 1,3 % | 0 % | 20 % | — |
| Aprendizaje supervisado (LoRA) | 100,0 % | 100 % | 35 % | 10,5 s |
| Aprendizaje por refuerzo (LoRA + RL) | 100,0 % | 100 % | 35 % | 10,5 s |

Estos resultados provienen de la model card del autor y se obtuvieron con una aproximación 2D de la marcha (tabla de velocidades por comando), no con el simulador MuJoCo completo; el propio autor advierte que pueden diferir de los resultados en MuJoCo web. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño mínimo (repo de 0,0 GB); el modelo base Qwen3.5-0.8B requiere aproximadamente 1,6 GB en FP16 y alrededor de 0,5–0,8 GB en cuantización de 4 bits (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el base en cuantización; RTX 3060, RTX 4060, RTX 4090 o superiores para FP16.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo base.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); llama.cpp, Ollama o vLLM no están documentados para este adaptador y requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre base de 0,8B | no disponible | Selección de acción discreta en robot simulado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | Apache 2.0 | HuggingFace |
| Políticas PPO del proyecto CONNECT TYCOON | no disponible | no aplica | Control de robot en simulador | Apache 2.0 (repo) | GitHub |

No se dispone de información sobre otros adaptadores LoRA equivalentes para tareas de decisión robótica en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `choose_object` sobre el curso `ff7735e0` y el contrato `obs26-act4/walker51-14/v1`; fuera de ese dominio no hay garantía de comportamiento.
- Evaluación aproximada: la métrica de éxito usa una tabla 2D de velocidades, no el simulador MuJoCo completo, por lo que las cifras pueden no trasladarse a un robot real.
- Sin validación en hardware físico: el autor indica explícitamente que debe revalidarse en el robot y el espacio concretos antes de usarlo.
- Riesgo de alucinación: al ser un LLM, puede devolver letras fuera del conjunto de opciones o texto adicional si no se aplica la instrucción de sistema exacta.
- Sesgos: no documentados; el corpus se genera a partir de una única política y un único curso, por lo que hereda sus sesgos de comportamiento.
- Idiomas: etiquetado solo para coreano; el prompt de sistema está en inglés y no se documenta comportamiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el propio autor califica el experimento como "en pruebas".

## Enlaces

- HuggingFace: https://huggingface.co/tskim81/connectailab-rl-kimtaesun-choose-object-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Curso de RL: https://www.aicitybuilders.com/robot
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- GitHub del autor: https://github.com/tskim81
- Contacto: tskim81@sgivers.com
