# the-eschatos/connectailab-rl-toty-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por the-eschatos en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. Su funcion concreta es la de actuar como "cerebro de decision" para el robot simulado LINK-01 en la tarea `avoid_obstacles`: recibe una descripcion textual del estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y ultima eleccion) y devuelve una unica letra que corresponde a la siguiente accion de locomocion durante los proximos 0,5 segundos. No es un modelo de proposito general, sino un artefacto de investigacion y educacion altamente especializado.

El interes tecnico del modelo radica en su metodologia de destilacion: un agente PPO entrenado en un simulador web (el "profesor" o brain.json) genera pares observacion-accion que se convierten en problemas textuales, sobre los que primero se hace aprendizaje supervisado (LoRA) y despues refinamiento con refuerzo (PPO con ancla KL). Se trata, por tanto, de un ejemplo de destilacion de politica de control en un modelo de lenguaje pequeno, con un pipeline reproducible documentado en GitHub y un cuaderno de Colab.

La relevancia es limitada fuera de su nicho: con 14 descargas, 0 likes y un repositorio de 0,0 GB, es un experimento educativo publicado abiertamente bajo Apache 2.0. Su valor esta en servir de plantilla metodologica para quien quiera convertir una politica RL en un modelo de lenguaje que razone sobre estados discretos, no en competir con modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-0.8B tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |
| Libreria | PEFT |
| Pipeline | Reinforcement-learning |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador no modifica la arquitectura base: anade matrices de bajo rango que se entrenan para la tarea especifica de seleccion de accion. La tarea se formula como clasificacion de una letra entre un conjunto de opciones presentadas en el prompt, con la instruccion de sistema de devolver unicamente la letra, sin explicacion.

El entrenamiento sigue cinco etapas documentadas en la model card: (1) entrenamiento del cerebro PPO en el simulador web sobre el curso `60248c1e` con la tarea `avoid_obstacles` y el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, alcanzando un 60% en el examen oficial; (2) generacion del corpus de problemas convirtiendo cada 0,5 segundos de observacion en texto, con la accion del cerebro como etiqueta y un 20% de ejemplos con desviaciones deliberadas; (3) aprendizaje supervisado del LoRA para imitar al cerebro; (4) refinamiento con PPO usando como recompensa el retorno que habria obtenido el cerebro si hubiera ejecutado esa opcion y el resto de la trayectoria, con ancla KL para no alejarse demasiado de la politica supervisada; (5) evaluacion colocando el modelo en el puesto de decision del robot y caminando 20 episodios con semillas 91001-91020. El corpus se compone de 991 ejemplos de entrenamiento, 190 de validacion y 278 de test, con un techo de acierto (fidelidad al cerebro al pasar la observacion a texto) del 99%.

## Capacidades

- Seleccion de accion discreta en un entorno de robot simulado: dado un estado textualizado, devuelve una letra entre las opciones presentadas.
- Razonamiento de corto plazo sobre estados de navegacion: distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y accion previa.
- Salida estrictamente controlada: el prompt de sistema fuerza una unica letra sin explicacion, lo que facilita el parseo en un bucle de control.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- Capacidad multilingue limitada al coreano para la formulacion de los problemas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el pipeline documentado (generacion de corpus, SFT con LoRA, PPO con ancla KL) como plantilla para convertir otras politicas de control en modelos de lenguaje pequenos.
- Educacion en aprendizaje por refuerzo: el cuaderno de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento paso a paso en un entorno web, sin infraestructura de robot fisico.
- Prototipado de agentes de decision en simulacion 2D: el modelo puede integrarse en el bucle de control del simulador LINK-01 para comparar su comportamiento con el del cerebro PPO original.
- Evaluacion de fidelidad texto-politica: sirve para medir cuanto se pierde al textualizar observaciones continuas, gracias al techo de acierto del 99% medido sobre el corpus.
- Docencia sobre limitaciones de los LLM en control: el contraste entre el 100% del cerebro y el 54,3% del modelo RL es un caso practico util para discutir por que un LLM pequeno no sustituye a una politica especializada.
- Generacion de datos sinteticos de decision: las 991 muestras de entrenamiento y las 278 de test pueden reutilizarse como corpus de referencia para experimentos de clasificacion de acciones en entornos simulados.
- Pruebas de robustez frente a prompt injection: el diseno del system prompt (tratar `state` como datos) permite experimentar con ataques de inyeccion en el estado del robot.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a la tarea especifica `avoid_obstacles` y a la evaluacion sobre 20 episodios del curso `60248c1e` (semillas 91001-91020), con una aproximacion de marcha 2D basada en tablas de velocidad por comando (no MuJoCo real).

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 20,4 s |
| Antes del entrenamiento | 43,5% | 0% | 55% | No disponible |
| Aprendizaje supervisado (LoRA) | 58,6% | 0% | 65% | No disponible |
| Refuerzo (PPO, modelo publicado) | 54,3% | 5% | 75% | 41,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 0,8B con adaptador LoRA, la inferencia en fp16 requiere del orden de 2 GB de VRAM, y en cuantizacion de 4 bits puede caber en menos de 1 GB (estimacion a partir del tamano del modelo base, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder ejecutar el modelo base en fp16; para cuantizacion 4 bits, GPUs integradas o de gama baja podrian ser suficientes.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque el autor no publica requisitos.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados por el autor para este adaptador.
- Latencia y throughput: no disponibles. El tiempo medio de 41,5 s en episodios exitosos corresponde a la simulacion de marcha, no a la latencia de inferencia del modelo.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La comparativa mas relevante es interna al propio proyecto, entre las etapas del pipeline:

| Variante | Parametros | Contexto | Acierto test | Exito 20 episodios | Licencia |
|---|---|---|---|---|---|
| Cerebro PPO (brain.json) | No disponible | No aplica | 100,0% | 100% | No disponible |
| LoRA tras SFT | 0,8B (base) + adaptador | No disponible | 58,6% | 0% | Apache 2.0 |
| LoRA tras PPO (publicado) | 0,8B (base) + adaptador | No disponible | 54,3% | 5% | Apache 2.0 |

Frente a modelos de proposito general de tamano similar (por ejemplo, Qwen3.5-0.8B sin adaptar), la comparacion no es significativa: este adaptador solo sabe emitir letras de un conjunto cerrado de opciones en el formato de la tarea `avoid_obstacles`.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo responde al formato de problema generado por `connect_tycoon.link01.questions` para la tarea `avoid_obstacles`; fuera de ese contrato su comportamiento no esta validado.
- Rendimiento muy por debajo del profesor: 54,3% de acierto frente al 100% del cerebro PPO, y solo un 5% de exito en 20 episodios frente al 100% del profesor.
- El refinamiento con PPO empeoro el acierto en test respecto al SFT (54,3% frente a 58,6%) y aumento las colisiones (75% frente a 65%), aunque mejoro el exito en episodios (5% frente a 0%); el autor elige el modelo RL por este ultimo criterio.
- Evaluacion de marcha aproximada: los resultados se obtuvieron con una tabla de velocidades por comando derivada de MuJoCo web, no con el simulador fisico completo, por lo que pueden diferir de los resultados reales.
- Idioma: el modelo esta entrenado y evaluado en coreano; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de inyeccion de prompt: aunque el system prompt indica tratar `state` como datos, un modelo de 0,8B es vulnerable a instrucciones embebidas en el estado.
- Uso previsto exclusivamente en simulacion y educacion: el autor advierte explicitamente de que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propios terminos que deben respetarse.
- Sin datos de sesgos, alucinacion en lenguaje natural ni rendimiento fuera de la tarea: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-eschatos/connectailab-rl-toty-v1-link01
- Repositorio CONNECT TYCOON (codigo de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
