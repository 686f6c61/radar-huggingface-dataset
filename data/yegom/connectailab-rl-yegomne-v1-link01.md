# yegom/connectailab-rl-yegomne-v1-link01

## Resumen

Connectailab-rl-yegomne-v1-link01 es un adaptador LoRA publicado por el desarrollador independiente yegom (Sehyun Park) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un cerebro de decisión para un robot bípedo simulado dentro del entorno LINK-01 del ecosistema CONNECT TYCOON. El adaptador traduce observaciones estructuradas del robot (distancia y dirección al objetivo, lecturas de sensores, velocidad y acción previa) a una única letra que representa la acción de locomoción para los siguientes 0,5 segundos.

El interés técnico reside en su método de construcción: primero se entrena una política PPO en un entorno web de aprendizaje robótico, después se destila esa política en el LLM mediante aprendizaje supervisado (LoRA) y finalmente se refina con aprendizaje por refuerzo con anclaje KL, usando la recompensa que habría obtenido la política maestra. Es un ejemplo compacto de destilación de política más RLHF aplicado a robótica de decisión discreta sobre un modelo de 0,8 mil millones de parámetros.

El modelo es de nicho, con cero descargas y cero likes en el momento de la consulta, licencia Apache 2.0 y soporte declarado únicamente para coreano. Su relevancia es experimental y educativa: demuestra un pipeline completo de RL a LLM en un caso de decisión secuencial con acciones discretas y presupuesto de cómputo muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un numero no disponible de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) declarado; el prompt de sistema y las etiquetas de accion estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros, mediante LoRA. El pipeline de entrenamiento tiene cuatro fases documentadas: (1) entrenamiento de una politica PPO en el entorno web `goto_target` con la convencion `link01-decision/goto_target/obs21-act5/walker51-14/v1` sobre el curso `c4e8eeed`, con una tasa de exito del 15 % en la evaluacion oficial; (2) generacion de un corpus de problemas a partir de las observaciones del robot cada 0,5 segundos, con la accion de la politica como etiqueta y un 20 % de ejemplos con acciones suboptimas para cubrir desviaciones; (3) aprendizaje supervisado del LLM sobre ese corpus mediante LoRA; y (4) refinamiento con aprendizaje por refuerzo, donde cada opcion recibe la recompensa que habria obtenido la politica maestra al ejecutarla, con una penalizacion KL que mantiene al modelo cerca de la distribucion supervisada.

El conjunto de datos consta de 609 ejemplos de entrenamiento, 119 de validacion y 217 de test. La tasa de coincidencia entre la representacion textual y la respuesta de la politica maestra es del 100 %, lo que fija el techo de aprendizaje. La evaluacion de locomotion se realiza con una aproximacion 2D de la marcha (tabla de velocidades por comando derivada de MuJoCo web), sin modelo fisico ni red neuronal de marcha, por lo que no se producen caidas y los resultados pueden diferir de una simulacion MuJoCo completa.

## Capacidades

- Decision secuencial discreta: dado un estado textual del robot, selecciona exactamente una letra entre las cinco acciones disponibles (`obs21-act5`).
- Formato de salida restringido: responde unicamente con la letra de la opcion elegida, sin explicacion, segun el prompt de sistema.
- Robustez ante inyeccion de instrucciones en el estado: el prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- Navegacion hacia objetivo con evitacion de obstaculos en el simulador LINK-01.
- Integracion con el paquete `connect_tycoon.link01.questions` para convertir observaciones del robot en el formato de pregunta esperado.
- Capacidad multilingue limitada: declarada solo para coreano; no se documenta soporte de otros idiomas.
- No se documenta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Navegacion autonoma en simulador educativo: el modelo se coloca en el puesto de decision del robot LINK-01 y elige la accion de marcha cada 0,5 segundos; es adecuado porque su entrenamiento esta alineado exactamente con esa tarea y ese formato de observacion.
- Docencia de pipelines RL a LLM: sirve como ejemplo reproducible de destilacion de una politica PPO en un LLM pequeno y posterior refinamiento con RL, con conjuntos de datos y metricas publicados.
- Prototipado de agentes de decision discreta: util para validar arquitecturas de seleccion de accion con salida de una sola letra antes de escalar a modelos mayores.
- Evaluacion de robustez ante ruido en el estado: el 20 % de ejemplos con acciones suboptimas permite estudiar como el modelo maneja observaciones fuera de distribucion.
- Base para experimentos de RLHF en robotica de bajo coste: el esquema de recompensa por opcion con anclaje KL es reutilizable en otros entornos con acciones discretas.
- Pruebas de integracion con el ecosistema CONNECT TYCOON: el adaptador se conecta mediante `PeftModel` sobre Qwen3.5-0.8B y el paquete `connect_tycoon`, lo que facilita montar demos del entorno LINK-01.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (217 problemas) y sobre 20 episodios del curso `c4e8eeed` con semillas 91001-91020:

| Modelo | Precision en test (coincidencia con la politica maestra) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica maestra (PPO) | 100,0 % | 100 % | 0 % | 12,1 s |
| Antes del entrenamiento | 47,0 % | 0 % | 45 % | No disponible |
| Aprendizaje supervisado (LoRA) | 81,1 % | 90 % | 15 % | 12,6 s |
| Aprendizaje por refuerzo (este adaptador) | 77,0 % | 100 % | 5 % | 11,2 s |

El refinamiento con RL reduce la precision en test respecto al modelo supervisado (77,0 % frente a 81,1 %) pero mejora el exito en episodios (100 % frente a 90 %) y reduce las colisiones (5 % frente a 15 %) y el tiempo medio (11,2 s frente a 12,6 s). La evaluacion de marcha usa una aproximacion 2D con tabla de velocidades, no una simulacion fisica completa.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB en FP16 para el modelo base de 0,8 mil millones de parametros, mas el adaptador LoRA, cuyo tamano exacto no esta disponible.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base en FP16; para cuantizacion en 8 o 4 bits basta con 1-2 GB.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: transformers con PEFT, llama.cpp u Ollama si se convierte el adaptador a GGUF (no documentado por el autor), y vLLM o TGI para el modelo base con el adaptador cargado.
- Latencia y throughput: no disponibles en la informacion proporcionada; la tarea requiere una decision cada 0,5 segundos, umbral que un modelo de este tamano cumple holgadamente en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomne-v1-link01 | 0,8 B (base) + LoRA | No disponible | Decision discreta en LINK-01 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No disponible | Hugging Face |
| Politica PPO maestra (link01-decision) | No disponible | No aplica | Decision discreta en LINK-01 | No disponible | Entorno CONNECT TYCOON |

No se dispone de datos publicados de otros adaptadores comparables de decision robotica sobre modelos de menos de 1 B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo responde al formato de pregunta de LINK-01 `goto_target` con 21 observaciones y 5 acciones; fuera de ese esquema su utilidad es nula.
- Entrenado exclusivamente para coreano y con prompt de sistema en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La evaluacion de locomotion usa una aproximacion 2D con tabla de velocidades, sin fisica ni red de marcha; los resultados pueden diferir de MuJoCo real y no incluyen caidas.
- El propio autor advierte que es un modelo de investigacion y educacion en simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Precision en test del 77,0 %, por debajo del modelo supervisado (81,1 %); el RL mejora el exito en episodios pero degrada la imitacion literal de la politica maestra.
- Riesgo de alucinacion de letras fuera del conjunto de acciones validas si el estado se presenta con un formato distinto al de entrenamiento.
- Conjunto de datos muy pequeno (609 ejemplos de entrenamiento), lo que limita la generalizacion a cursos o configuraciones no vistas.
- La model card contiene una referencia cruzada a otro adaptador (`yegomduck-v1-link01`) en el ejemplo de codigo, lo que puede inducir a error al cargar los pesos.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, no disponible en la informacion proporcionada.
- Cero descargas y cero likes: no hay evidencia de uso independiente ni de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Entorno de aprendizaje web: https://www.ezerai.xyz/robot-lab/world/
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
