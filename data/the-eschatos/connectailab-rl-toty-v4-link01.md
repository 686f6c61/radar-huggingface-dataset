# the-eschatos/connectailab-rl-toty-v4-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario the-eschatos bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un decisor especializado: recibe una descripcion textual del estado de un robot caminante (distancia al objetivo, direccion, sensores de distancia, velocidad y accion previa) y devuelve una unica letra que codifica como debe caminar durante los siguientes 0,5 segundos. El modelo esta etiquetado con pipeline `reinforcement-learning` y entrenado mediante una combinacion de aprendizaje supervisado (destilacion desde una politica PPO entrenada en un simulador web) y refinamiento con refuerzo.

El interes tecnico esta en el enfoque: se entrena primero una "politica maestra" (brain.json) con PPO en un entorno de simulacion 2D, se generan pares observacion-texto/accion y se destila esa politica en un modelo de lenguaje pequeno mediante LoRA, para luego aplicar una fase de RL que reordena las probabilidades de las opciones de respuesta. El resultado es un modelo de 0,8 mil millones de parametros que actua como cabecera de decision de bajo coste, con un formato de salida estrictamente restringido a una letra.

La relevancia practica es limitada pero concreta: demuestra que un LLM pequeno puede sustituir a una red de politica en tareas de control discretas y de horizonte corto, con un rendimiento cercano al de la politica original (77 % de coincidencia con la accion del profesor) y un 85 % de exito en la evaluacion de 20 episodios. Su licencia Apache 2.0 y su tamano lo hacen desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; el autor no la especifica) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. Sobre el se aplica un adaptador LoRA entrenado en cuatro fases segun la model card: (1) entrenamiento de una politica PPO en un simulador web de robot caminante para la tarea `follow_route`, con un 95 % de exito en la prueba oficial; (2) generacion de un corpus de 905 ejemplos de entrenamiento, 174 de validacion y 261 de test, convirtiendo cada observacion del simulador en un problema textual con opciones y usando como etiqueta la accion elegida por la politica PPO (con un 20 % de ejemplos de acciones suboptimas para cubrir desviaciones); (3) aprendizaje supervisado del LLM sobre esas etiquetas; y (4) una fase de RL que reajusta las probabilidades de cada opcion segun el retorno esperado si la politica maestra continuase desde ese estado, con una penalizacion KL para no alejarse demasiado de la distribucion supervisada.

La innovacion principal no es arquitectonica sino metodologica: el uso de una politica de control como "profesor" para destilar decisiones en un modelo de lenguaje y el refinamiento posterior con senal de recompensa derivada de la propia politica. La evaluacion de caminado se realizo con una aproximacion 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, lo que el autor advierte explicitamente. El limite superior de acierto (coincidencia con la accion del profesor al traducir la observacion a texto) es del 99 %.

## Capacidades

- Decision de control discreta: dado un estado textual del robot, devuelve una de las cinco acciones posibles (una letra) para el siguiente intervalo de 0,5 segundos.
- Seguimiento de rutas (`follow_route`): mantiene el rumbo hacia un objetivo usando distancia, direccion, sensores y velocidad.
- Salida estrictamente restringida: responde unicamente con la letra de la opcion elegida, sin explicacion, lo que simplifica el parseo en produccion.
- Robustez ante instrucciones inyectadas en el estado: el prompt de sistema indica tratar el contenido del estado como datos, no como instrucciones.
- Formato de tarea estandarizado: el paquete `connect_tycoon.link01` genera los problemas en el formato esperado (situacion, pregunta, opciones).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni razonamiento general; el modelo esta especializado en una unica tarea.

## Casos de uso

- Control de robot caminante en simulacion: integrado como cabecera de decision que recibe el estado textual y emite la accion cada 0,5 segundos, sustituyendo a la red de politica PPO con un modelo interpretable y facil de inspeccionar.
- Prototipado rapido de politicas en entornos educativos: permite a estudiantes entrenar una politica PPO en el simulador web y destilarla en un LLM para observar como se traduce una politica de control a lenguaje natural.
- Investigacion en destilacion politica-LLM: sirve como caso de estudio reproducible de como un modelo de 0,8 B puede aproximar una politica de control con un 77 % de coincidencia y un 85 % de exito en 20 episodios.
- Despliegue en hardware de borde: al ser un adaptador sobre un modelo de 0,8 B, cabe en GPUs de consumo e incluso en CPU con cuantizacion, lo que permite ejecutar el decisor en un robot o en un equipo embebido.
- Generacion de datos sinteticos de decision: el modelo puede etiquetar estados simulados para ampliar el corpus de entrenamiento de otras politicas o para analizar la coherencia de la politica maestra.
- Evaluacion comparativa de metodos de RL: la model card ofrece una tabla con resultados de linea base, aprendizaje supervisado y RL, util para reproducir y comparar tecnicas de ajuste fino con refuerzo en modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la model card, medidos sobre el conjunto de test (261 problemas) y sobre 20 episodios de caminado con semillas 91001-91020. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

| Modelo | Acierto en test (coincidencia con el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica PPO (profesor) | 100,0 % | 100 % | 0 % | 19,3 s |
| Modelo base sin ajuste | 22,6 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 77,4 % | 80 % | 0 % | 20,1 s |
| Aprendizaje por refuerzo (LoRA + RL) | 77,0 % | 85 % | 0 % | 20,1 s |

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8 B en precision FP16 ocupa aproximadamente 1,6 GB; en cuantizacion de 8 bits, unos 0,8 GB; en 4 bits, unos 0,4 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3050 en adelante) e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM, TGI, llama.cpp y Ollama tras convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, la latencia por token deberia ser de pocos milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados con la misma combinacion de tarea (control de robot caminante) y formato (LLM pequeno con LoRA). Se comparan alternativas genericas de la misma categoria:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-toty-v4-link01 | 0,8 B + LoRA | No disponible | Destilacion de politica PPO + RL sobre LLM | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | LLM generalista | Apache 2.0 | Hugging Face |
| Politica PPO original (brain.json) | No disponible | No aplica | Red de politica para control | No disponible | Repositorio connect-tycoon |

La comparacion con el modelo base es la mas informativa: sin ajuste, el LLM acierta solo el 22,6 % de las acciones del profesor, frente al 77 % tras el ajuste. La politica PPO original sigue siendo superior en exito (100 % frente a 85 %), lo que situa al LLM como aproximacion, no como sustituto exacto.

## Limitaciones y advertencias

- Especializacion extrema: solo resuelve la tarea `follow_route` con el formato de observacion de 16 dimensiones y 5 acciones; no es un modelo de proposito general.
- Rendimiento inferior al profesor: 77 % de coincidencia y 85 % de exito frente al 100 % de la politica PPO original; el autor no recomienda su uso en robots reales sin revalidacion.
- Evaluacion aproximada: el caminado se midio con una tabla de velocidades 2D, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir en un entorno fisico.
- Idioma: el modelo esta etiquetado unicamente para coreano; el prompt de sistema esta en ingles, pero no hay garantia de comportamiento correcto en otros idiomas.
- Riesgo de alucinacion en el formato: aunque el modelo devuelve una letra, puede emitir una opcion no valida o texto adicional si el estado de entrada se desvia del formato esperado.
- Sesgos: al entrenarse sobre una unica politica y un unico tipo de curso (`random`), puede heredar los sesgos de la politica PPO y generalizar mal a topologias de ruta no vistas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara el modelo como herramienta de investigacion y educacion; el uso en produccion requiere validacion propia.
- Repositorio de 0,0 GB: el adaptador es muy pequeno, pero conviene verificar que los pesos esten completos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-toty-v4-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
