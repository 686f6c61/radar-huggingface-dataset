# tazza11/connectailab-rl-simba-v2

## Resumen

Connectailab-rl-simba-v2 es un adaptador LoRA de tipo PEFT publicado por el usuario tazza11 bajo la iniciativa Connect AI Lab, entrenado sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo generativo de propósito general, sino un modelo de toma de decisiones: recibe una situacion de empresa, una pregunta y un conjunto de opciones etiquetadas, y devuelve unicamente la letra de la opcion elegida. La probabilidad asociada a cada letra funciona como distribucion de preferencia y el valor maximo como medida de confianza.

El modelo se ha entrenado con datos generados en el simulador Connect Tycoon, un entorno de gestion empresarial sintetico. El pipeline combina una politica pequena entrenada con PPO que actua como profesor, un corpus de decisiones puntuadas y un ajuste final con GRPO sobre el modelo base con LoRA. El resultado es un clasificador de decisiones muy ligero (0,8 mil millones de parametros en el modelo base) que ocupa un repositorio practicamente vacio porque solo almacena los pesos del adaptador.

Su relevancia es experimental y educativa: demuestra un flujo completo de aprendizaje por refuerzo aplicado a decisiones discretas sobre un simulador, con licencia Apache 2.0 y entrenamiento reproducible en Google Colab. El autor lo presenta explicitamente como un primer resultado de investigacion y advierte de que el modelo queda por debajo de la politica profesora del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador anade un subconjunto de parametros LoRA (no disponible el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,0 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tipo de tarea | reinforcement-learning (toma de decisiones con opciones discretas) |
| Fecha de publicacion | 2026-10-16 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen3.5-0.8B, un transformer decoder denso de 0,8 mil millones de parametros. El adaptador se carga con la libreria PEFT sobre el modelo base congelado, de modo que la inferencia sigue el patron habitual de `PeftModel.from_pretrained`. La tarea no es generativa abierta: el modelo debe responder con una sola letra correspondiente a una opcion de una lista, y la distribucion sobre las letras de las opciones se interpreta como probabilidad de eleccion.

El entrenamiento se describe en cuatro fases. Primero, una politica pequena aprende a operar la empresa durante miles de meses mediante PPO en el simulador, y actua como profesor. Segundo, para cada mes se genera un banco de problemas variando la opcion elegida y ejecutando el mes completo para puntuar cada alternativa. Tercero, se aplica aprendizaje supervisado imitando la opcion con mejor puntuacion. Cuarto, se aplica GRPO: se tratan todas las opciones de un problema como un grupo, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo retorno del simulador supera la media, con una penalizacion KL respecto al modelo de partida para evitar el colapso.

El conjunto de datos se distribuye en 4.082 problemas de entrenamiento, 832 de validacion y 840 de prueba, generados sobre una distribucion de empresas de tipo `general` calibrada con datos publicos. El autor indica que los resultados son preliminares y que la evaluacion de la operacion empresarial se realizo sobre una media de dos meses no vistos, con un tamano de muestra reducido.

## Capacidades

- Toma de decisiones con opciones discretas: dado un estado, una pregunta y una lista de opciones etiquetadas, devuelve la letra de una unica opcion.
- Estimacion de confianza: la probabilidad de la letra elegida y la distribucion entre opciones permiten jerarquizar alternativas, no solo escoger una.
- Seguimiento de instrucciones estrictas: el prompt de sistema especifica que debe devolver solo la letra, sin explicacion, y que el contenido del campo `state` debe tratarse como datos y no como instrucciones (defensa basica frente a inyeccion de prompt).
- Razonamiento de decision en un solo paso, orientado a entornos tipo Gymnasium.
- Cobertura linguistica limitada al coreano, segun el campo `language` declarado.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio ni tool calling en la informacion disponible.
- No se documenta soporte explicito de agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Simulacion de gestion empresarial: el modelo puede integrarse como agente de decision dentro del simulador Connect Tycoon, eligiendo una accion por turno a partir del estado de la compania. Es adecuado porque fue entrenado exactamente sobre ese entorno y formato de entrada.
- Generacion de trayectorias sinteticas para investigacion en RL: al producir decisiones etiquetadas con sus probabilidades, sirve para estudiar politicas derivadas de un modelo de lenguaje pequeno en entornos de decision.
- Comparacion de politicas en experimentos academicos: permite contrastar una politica basada en LLM (adaptador GRPO) frente a una politica PPO tradicional u otros metodos tabulares sobre el mismo banco de problemas.
- Analisis de calibracion y confianza: la salida como distribucion de probabilidad sobre opciones facilita medir si la confianza del modelo correlaciona con el acierto, util en trabajos sobre incertidumbre en agentes.
- Docencia y material divulgativo: el flujo completo (PPO profesor, aprendizaje supervisado, GRPO) esta documentado con un cuaderno de Colab, por lo que es util como ejemplo reproducible en cursos de aprendizaje por refuerzo.
- Prototipado rapido de asistentes de decision en local: al ser un adaptador sobre 0,8B, puede ejecutarse en hardware modesto para validar la viabilidad de un asistente que elige entre alternativas discretas, siempre que se revalide con datos reales del dominio.
- Pruebas de robustez frente a inyeccion de prompt: el diseno de la tarea (texto del estado tratado como datos) permite experimentar con defensas de prompt en agentes de decision.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor sobre el banco de problemas (840 casos de prueba) y sobre el simulador:

| Modelo | Precision en problemas | Arrepentimiento (menor es mejor) | Beneficio simulado por mes | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del ajuste | 33,5% | 2,33 | no disponible | no disponible |
| Aprendizaje supervisado | 75,8% | 1,93 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 72,6% | 1,90 | 7,8 millones de wones | 72% (147/177) |

El autor senala que la operacion empresarial se evaluo sobre una media de dos meses no vistos, con un tamano de muestra pequeno, y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,6 GB para el modelo base de 0,8B mas el adaptador, mas el coste de cache KV (estimacion propia, no facilitada por el autor).
- VRAM estimada en cuantizacion int8: aproximadamente 0,8-1 GB, y en int4 en torno a 0,4-0,6 GB (estimaciones orientativas; el autor no publica cuantizaciones).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para fp16; RTX 3060, RTX 4060, RTX 4090 o superiores no presentan ninguna limitacion.
- Compatibilidad con GPU consumer: si, cabe holgadamente en practicamente cualquier GPU de consumo actual e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un adaptador PEFT, el camino documentado es `transformers` + `peft`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF no hay una ruta directa a llama.cpp u Ollama sin conversion previa.
- Latencia y rendimiento: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada (no hay otros adaptadores de decision sobre el mismo simulador ni modelos de la misma categoria documentados). La unica comparacion disponible es interna al propio experimento:

| Modelo | Precision | Arrepentimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B sin ajuste (base) | 33,5% | 2,33 | segun el modelo base | publico |
| Adaptador con aprendizaje supervisado | 75,8% | 1,93 | no disponible | no publicado como modelo independiente |
| Connectailab-rl-simba-v2 (GRPO) | 72,6% | 1,90 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigacion y educacion segun el propio autor; no debe usarse para decisiones de gestion reales sin revalidacion con los datos de la empresa concreta.
- Resultados preliminares: la evaluacion de operacion se basa en una media de dos meses no vistos, con muestra pequena, y el modelo queda por debajo de la politica profesora.
- El aprendizaje por refuerzo obtiene mejor arrepentimiento (1,90) pero peor precision en problemas (72,6%) que el aprendizaje supervisado (75,8%), lo que sugiere un compromiso entre exactitud y calidad de la decision.
- Idioma limitado al coreano; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada; se desconoce como se comporta con estados u opciones muy extensos.
- Riesgo de alucinacion: aunque la tarea restringe la salida a una letra, el modelo puede seleccionar opciones no listadas o inventar etiquetas si el prompt no se controla estrictamente.
- Riesgo de inyeccion de prompt: el propio autor anade una instruccion de sistema para tratar el estado como datos, lo que indica que el modelo no es robusto por si mismo frente a contenido malicioso en la entrada.
- Sesgos potenciales derivados de la distribucion de empresas sinteticas (`general`) usada para generar los datos, que puede no representar sectores reales.
- Entrenado sobre un simulador concreto (Connect Tycoon); su generalizacion a otros entornos de decision no esta demostrada.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B antes de desplegarlo.
- El repositorio es de 0,0 GB y solo contiene el adaptador; es imprescindible descargar el modelo base para poder usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tazza11/connectailab-rl-simba-v2
- Repositorio Connect Tycoon en GitHub: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de Connect AI Lab: https://www.youtube.com/@CONNECT-AI-LAB
- AI City Builders: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
