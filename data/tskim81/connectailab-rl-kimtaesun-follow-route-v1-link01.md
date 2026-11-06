# tskim81/connectailab-rl-kimtaesun-follow-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por tskim81 (Solgivers) en el marco del proyecto educativo CONNECT AI LAB. Su funcion no es la generacion de texto general, sino actuar como "cerebro de decision" para un robot simulado de la familia LINK-01: recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa) y devuelve exactamente una letra correspondiente a la siguiente accion de locomocion para los proximos 0,5 segundos.

El modelo se entrena en dos fases sobre un "profesor" simbolico: primero un cerebro PPO entrenado en un entorno web de aprendizaje por refuerzo (brain.json) genera un conjunto de pares observacion-accion (1269 ejemplos de entrenamiento, 213 de validacion, 323 de test), y despues el LM aprende por imitacion (LoRA) y se refina con RL por preferencias derivadas de recompensas. La tarea concreta es `follow_route` con un espacio de observacion de 27 dimensiones y 5 acciones discretas.

Es relevante como ejemplo reproducible de destilacion de politicas de RL en modelos de lenguaje pequenos (0,8B parametros) para toma de decisiones secuenciales, con un pipeline documentado y un cuaderno de Colab publico. No obstante, es un modelo de investigacion y educacion sobre simulador, sin validacion en robot real y con un alcance muy restringido a una unica tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador es LoRA; el modelo base tiene ~0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no especificada) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parametros. El adaptador no modifica la arquitectura del modelo base; anade matrices de bajo rango entrenadas para la tarea especifica de seleccion de accion. La salida esperada es una unica letra entre cinco opciones, sin explicacion, lo que reduce la tarea a una clasificacion de 5 clases expresada como generacion de texto.

El entrenamiento consta de dos etapas. En la primera, un cerebro PPO entrenado en el entorno web `follow_route` (convencion `link01-decision/follow_route/obs27-act5/walker51-14/v1`, curso `random`) se usa como profesor: se recogen 1269 ejemplos de entrenamiento, 213 de validacion y 323 de test, con un 20 % de situaciones en las que el profesor se desvio de la ruta para ensenar casos negativos. El LM aprende por imitacion supervisada con LoRA. En la segunda etapa se aplica RL: para cada opcion se calcula la recompensa que se habria obtenido si el profesor hubiera continuado la ruta tras esa accion, y se refuerzan las opciones mejores que la del profesor y se penalizan las peores, con una restriccion KL para mantener el modelo cerca de la politica supervisada.

La evaluacion se realiza colocando el modelo en el puesto de decision del robot y ejecutando 20 episodios del mismo curso (semillas 91001-91020). La simulacion de marcha es una aproximacion 2D basada en una tabla de velocidades por comando (derivada de MuJoCo web), sin red neuronal de locomocion, por lo que no hay caidas y los resultados pueden diferir de MuJoCo.

## Capacidades

- Seleccion de accion discreta para el robot LINK-01 en la tarea `follow_route`: devuelve una letra entre cinco opciones de locomocion para los proximos 0,5 segundos.
- Interpretacion de estado textual estructurado: distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa.
- Razonamiento de un solo paso (single-step decision making) sin planificacion multi-paso explicita.
- Instruccion de sistema fija que exige tratar el contenido del estado como datos y no como instrucciones, y responder solo con la letra.
- Capacidad multilingue limitada al coreano como idioma declarado.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de refuerzo y destilacion: reproducir el pipeline completo (PPO en web, generacion de dataset, LoRA supervisado, RL con KL) usando el cuaderno de Colab enlazado, para explicar como se transfiere una politica de RL a un LM pequeno.
- Prototipado de controladores de bajo coste en simulacion: usar el adaptador como sustituto del cerebro PPO en el entorno `follow_route` para comparar latencia y consumo frente a la politica original.
- Investigacion en decision making con LLM: emplear el modelo como linea base de 0,8B parametros en tareas de seleccion de accion con observaciones textuales y espacio de acciones discreto.
- Generacion de datos sinteticos de decision: ejecutar el modelo sobre estados muestreados para producir trazas etiquetadas que alimenten otros experimentos de imitacion.
- Pruebas de robustez ante instrucciones inyectadas: el prompt de sistema esta disenado para tratar el estado como datos, lo que permite evaluar la resistencia del modelo a inyeccion de instrucciones en la observacion.
- Benchmark de eficiencia en hardware modesto: al ser un adaptador sobre un modelo de 0,8B, sirve para medir throughput de inferencia en GPU de consumo en tareas de clasificacion corta.
- Educacion en robotica simulada: integrar el modelo en talleres donde los alumnos construyen cursos y comparan el comportamiento del LM frente al cerebro PPO original.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `follow_route`, 20 episodios, semillas 91001-91020):

| Modelo | Acierto en test (misma accion que el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 15 % | 26,6 s |
| Modelo base sin entrenar | 42,4 % | 0 % | 15 % | No disponible |
| LoRA supervisado | 86,4 % | 65 % | 55 % | 28,7 s |
| LoRA + RL (este modelo) | 84,5 % | 75 % | 15 % | 25,2 s |

Observaciones: el RL reduce el acierto de imitacion (86,4 % a 84,5 %) pero mejora el exito en episodios (65 % a 75 %) y reduce las colisiones (55 % a 15 %), acercandose al profesor en tiempo medio (25,2 s frente a 26,6 s). La cota superior de acierto (el propio profesor) es del 100 %.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo base de ~0,8B en fp16 se requieren aproximadamente 1,6 GB solo para pesos; en 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,5 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con overhead; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Tambien es viable en CPU para inferencia puntual.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna (GTX 1650 en adelante con cuantizacion, RTX 3060/4060 sin problemas en fp16).
- Opciones de despliegue: transformers + peft (metodo documentado), vLLM y TGI si se fusiona el adaptador con el modelo base, llama.cpp/Ollama si se convierte a GGUF tras la fusion.
- Latencia y throughput: no disponibles. La tarea genera una unica letra, por lo que la latencia vendra dominada por el prefill de la observacion textual y sera del orden de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | ~0,8B (base) + LoRA | No disponible | Decision `follow_route` (5 acciones) | Apache 2.0 | Hugging Face, 0 descargas |
| Cerebro PPO LINK-01 (profesor) | Politica neuronal propia (no LM) | No aplica | Decision `follow_route` | No especificada | Via CONNECT TYCOON |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Generacion de texto general | No especificada en la ficha | Hugging Face |

No se dispone de comparativas con otros modelos de decision basados en LM en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: solo resuelve la tarea `follow_route` con el formato de observacion de 27 dimensiones y 5 acciones definido por el proyecto; no es un modelo de proposito general.
- Entrenado unicamente sobre el curso `random`; no hay evidencia de generalizacion a otros mapas, robots o distribuciones de sensores.
- Validado solo en simulacion 2D aproximada (tabla de velocidades), no en MuJoCo completo ni en robot real. El autor advierte explicitamente de que hay que revalidar antes de usar en hardware.
- El acierto de imitacion del profesor es del 84,5 %, inferior al 86,4 % del modelo supervisado; el RL mejora el exito pero sacrifica fidelidad a la politica original.
- Idioma declarado solo coreano; el prompt de sistema esta en ingles, lo que puede afectar a la robustez fuera de ese idioma.
- Riesgo de alucinacion: al ser un LM generativo, puede devolver una letra no valida o texto adicional si la observacion se sale del formato esperado.
- Riesgo de inyeccion de instrucciones a traves del campo de estado, mitigado parcialmente por el prompt de sistema pero no garantizado.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B antes de explotarlo en produccion.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Modelo de investigacion y educacion: no apto como controlador de seguridad critica sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/tskim81/connectailab-rl-kimtaesun-follow-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- GitHub del autor: https://github.com/tskim81
