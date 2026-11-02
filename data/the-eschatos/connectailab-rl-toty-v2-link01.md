# the-eschatos/connectailab-rl-toty-v2-link01

## Resumen

connectailab-rl-toty-v2-link01 es un adaptador LoRA publicado por el usuario the-eschatos (CONNECT AI LAB) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "modelo de decisión" para el robot simulado LINK-01 dentro del entorno educativo CONNECT AI WORLD: recibe en texto el estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra que representa cómo debe caminar durante los siguientes 0,5 segundos.

El entrenamiento combina tres fases: primero se entrena una política PPO en el simulador web (el "cerebro" o brain.json), después se genera un conjunto de preguntas-respuesta traduciendo cada observación a texto (275 de entrenamiento, 63 de validación y 84 de test) y finalmente se aplica aprendizaje supervisado con LoRA seguido de un ajuste por refuerzo con anclaje KL para acercar las respuestas del modelo a las del cerebro.

Su relevancia es acotada y experimental: demuestra un pipeline completo de destilación de una política de refuerzo hacia un modelo de lenguaje pequeño (0,8 B de parámetros) con adaptadores PEFT, útil como material didáctico de RL y como prueba de concepto de "LLM como política de decisión" en robótica simulada. No está pensado para uso en producción ni para robótica real sin revalidación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3.5-0.8B) |
| Idiomas soportados | coreano (ko) declarado; el prompt de sistema recomendado esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 B de parámetros, mediante LoRA. El pipeline de entrenamiento tiene cinco etapas documentadas por el autor: (1) entrenamiento de una política PPO en el simulador web para la tarea `goto_target`, con la convención `link01-decision/goto_target/obs10-act5/walker51-14/v1` y curso `random`, alcanzando un 100 % en el examen oficial; (2) generación del conjunto de problemas convirtiendo cada 0,5 s las observaciones del cerebro a texto, con un 20 % de ejemplos en los que el cerebro se desvía del camino; (3) aprendizaje supervisado del LLM sobre esas respuestas; (4) ajuste por refuerzo donde cada opción se recompensa según lo que habría logrado el cerebro si hubiera continuado desde ahí, con una penalización KL para mantener el modelo cerca de la distribución supervisada; y (5) evaluación colocando el modelo de decisión en el puesto de mando del robot durante 20 episodios con semillas 91001–91020.

El conjunto de datos consta de 275 ejemplos de entrenamiento, 63 de validación y 84 de test. El techo de acierto (proporción en que el cerebro da la misma respuesta tras la traducción a texto) es del 99 %. La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin el modelo físico del robot ni la red de marcha, por lo que los resultados pueden diferir de los del MuJoCo web.

## Capacidades

- Decisión discreta de bajo nivel: dado un estado textual del robot, selecciona exactamente una de cinco opciones (letras) que codifican la acción de marcha para los próximos 0,5 s.
- Formato de salida restringido: responde solo con la letra de la opción elegida, sin explicación, según el prompt de sistema recomendado.
- Robustez ante instrucciones embebidas: el prompt de sistema indica tratar el contenido del estado como datos y no como instrucciones.
- Traducción estado-a-texto: consume observaciones de 10 dimensiones serializadas como texto (situación, pregunta y opciones).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; es un clasificador de acciones disfrazado de modelo de lenguaje.
- Capacidad multilingüe limitada al coreano declarado y al inglés del prompt de sistema; no se documentan otras lenguas.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo completo y reproducible de PPO, destilación a un LLM y ajuste por refuerzo con KL, con notebook de Colab incluido.
- Prueba de concepto de "LLM como política": permite estudiar cómo un modelo de 0,8 B puede sustituir a una política neuronal en un bucle de decisión discreta sin reentrenar el simulador.
- Investigación en destilación de políticas: el par cerebro/política destilada con métricas de acierto (100 % frente a 81 %) facilita análisis de pérdida de rendimiento en la traducción observación-texto.
- Evaluación de robustez ante prompts: el diseño con opciones y respuesta de una sola letra permite medir sensibilidad a variaciones del estado y a inyecciones de instrucciones.
- Generación de datos sintéticos de decisión: el pipeline `connect_tycoon.link01.questions` puede reutilizarse para crear nuevos conjuntos de problemas a partir de otras políticas PPO.
- Entorno de pruebas para agentes robóticos simulados: útil para validar bucles percepción-decisión en 2D antes de trasladar el diseño a un simulador físico completo.
- Material de aula para cursos de IA local: al caber en una GPU de consumo y usar PEFT, permite a estudiantes ejecutar el ciclo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 6,1 s |
| Antes del entrenamiento | 20,2 % | 0 % | 0 % | — |
| Aprendizaje supervisado | 79,8 % | 65 % | 0 % | 6,1 s |
| Ajuste por refuerzo (este adaptador) | 81,0 % | 65 % | 0 % | 6,1 s |

No se han publicado resultados en benchmarks estandar de LLM (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6-2 GB en fp16 para el modelo base de 0,8 B mas el adaptador; aproximadamente 0,5-1 GB con cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna de 4 GB o mas, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + PEFT (ruta documentada por el autor); tambien es posible fusionar el adaptador y servir con vLLM, TGI, llama.cpp u Ollama, aunque no se documentan recetas especificas.
- Latencia y throughput: no disponibles. El caso de uso exige una decision cada 0,5 s, pero no se publican mediciones de latencia por token ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-toty-v2-link01 | 0,8 B (base) + LoRA | no disponible | Destilacion de politica PPO para robot simulado LINK-01 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | LLM generalista (modelo base) | no disponible en la informacion proporcionada | HuggingFace |
| Otras politicas PPO de CONNECT AI WORLD | no disponible | no aplica | Politica neuronal directa (brain.json) | no disponible | Repositorio connect-tycoon |

No se dispone de informacion sobre otros adaptadores de decision comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion: el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Dominio muy restringido: solo resuelve la tarea `goto_target` con 10 dimensiones de observacion y 5 acciones; no generaliza a otras tareas ni a otros robots.
- Rendimiento limitado: 81 % de acierto frente al cerebro y 65 % de exito en 20 episodios, con una perdida sustancial respecto al profesor PPO.
- Evaluacion aproximada: la marcha se midio con una tabla 2D de velocidades, no con el simulador fisico, por lo que los resultados pueden no reproducirse en MuJoCo.
- Riesgo de alucinacion: aunque el formato de una sola letra reduce la superficie de error, el modelo puede emitir opciones invalidas o texto adicional si el estado se sale de la distribucion de entrenamiento.
- Idioma: declarado solo para coreano; el prompt de sistema esta en ingles y no se documenta soporte para castellano.
- Conjunto de datos pequeno (275 ejemplos de entrenamiento), lo que limita la cobertura de situaciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y el caracter experimental desaconsejan su uso en produccion.
- Sin descargas ni validacion externa en HuggingFace en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-eschatos/connectailab-rl-toty-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
