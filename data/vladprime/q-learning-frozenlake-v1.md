# Vladprime/q-learning-FrozenLake-v1

## Resumen

`Vladprime/q-learning-FrozenLake-v1` no es un modelo de lenguaje ni una red neuronal profunda: es un agente de Q-learning tabular entrenado desde cero sobre el entorno `FrozenLake-v1` de Gymnasium (mapa 4x4, `is_slippery=False`). Lo publica Vlad Kolomiiets (`Vladprime`) como entrega practica de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face. El artefacto consiste en una Q-table serializada (`qtable.npy` y el `q-learning.pkl` en formato del curso), sin pesos en safetensors ni arquitectura transformer.

El problema que resuelve es el clasico de navegacion sobre una cuadricula con estados discretos y recompensa dispersa: aprender una politica optima que lleve al agente desde el estado inicial hasta el objetivo evitando agujeros. Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo reproducible y verificable de un pipeline completo de RL tabular (entrenamiento, evaluacion independiente y recarga del checkpoint), no como componente para produccion.

El entrenamiento consta de 10.000 episodios y 63.838 pasos de entorno con semilla 20261101, sin politica preentrenada. La evaluacion independiente sobre 1.000 episodios (semillas 1000000–1000999) reporta una recompensa media de 1,0000 con desviacion tipica de 0,0000, es decir, exito perfecto y determinista en el mapa configurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla de estados-acciones, sin red neuronal) |
| Parametros totales | 16 estados x 4 acciones = 64 valores Q (no disponible el numero exacto de entradas serializadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de 16 estados discretos) |
| Tipos de cuantizacion | no disponible (los valores Q se almacenan como array NumPy) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | `qtable.npy` (NumPy) y `q-learning.pkl` (pickle, formato del curso) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clasico: una tabla que asigna un valor Q a cada par (estado, accion) y se actualiza con la regla de diferencias temporales de un paso, usando una politica epsilon-greedy durante la exploracion. No hay funcion de aproximacion, ni red neuronal, ni atencion. El entorno es `FrozenLake-v1` con mapa de 4x4 y superficie no resbaladiza (`is_slippery=False`), lo que convierte la transicion en determinista y hace que el problema sea resoluble de forma exacta con una tabla.

El entrenamiento se ejecuto durante 10.000 episodios y 63.838 pasos de entorno con semilla 20261101, partiendo de una Q-table inicializada a cero y sin politica preentrenada. No se menciona uso de RLHF, DPO ni tecnicas de optimizacion adicionales, algo coherente con el algoritmo. La model card indica que el checkpoint se recargo y la evaluacion completa se reprodujo de forma exacta, lo que aporta garantia de reproducibilidad del artefacto. El autor aclara explicitamente que se trata de una tarea practica y no de una certificacion del curso completo.

## Capacidades

- Aprendizaje y explotacion de una politica optima en `FrozenLake-v1` 4x4 determinista: selecciona la accion con mayor valor Q mediante `int(np.argmax(qtable[state]))`.
- Inferencia determinista: dado un estado discreto, devuelve una accion entera en el rango 0–3.
- Reproducibilidad completa del entrenamiento mediante `python train.py` y las dependencias de `requirements.txt`.
- Evaluacion verificable: incluye `results.json` con las recompensas de los 1.000 episodios de evaluacion.
- Carga del checkpoint en dos formatos: NumPy (`qtable.npy`, con `allow_pickle=False`) y pickle (`q-learning.pkl`, formato del curso).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de RL tabular: usar el repositorio como ejemplo completo y reproducible de un pipeline de Q-learning (entorno, entrenamiento, evaluacion y serializacion) en asignaturas o cursos introductorios de aprendizaje por refuerzo.
- Verificacion de reproducibilidad: comparar la ejecucion de `train.py` con la semilla 20261101 frente a los resultados publicados para comprobar que el entorno y las dependencias estan correctamente configurados.
- Baseline de referencia: emplear la Q-table como linea base determinista (recompensa media 1,0000) frente a la que comparar agentes mas complejos (DQN, policy gradient) en el mismo entorno.
- Pruebas de infraestructura de RL: validar pipelines de evaluacion, logging de episodios y carga de checkpoints con un artefacto pequeno y de comportamiento conocido.
- Material de tutorial sobre seguridad en serializacion: ilustrar por que conviene cargar `qtable.npy` con `allow_pickle=False` en lugar de ficheros pickle de origen no confiable.
- Demostracion de politica en visualizaciones: usar la tabla para generar replays (el repositorio incluye `replay.mp4`) y mostrar el comportamiento del agente en el mapa 4x4.
- Integracion en entornos de evaluacion tipo Gymnasium: cargar la Q-table como politica congelada dentro de un bucle de evaluacion estandar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente por Hugging Face):

| Metrica | Dataset / configuracion | Valor |
|---|---|---|
| mean_reward | FrozenLake-v1, map_name=4x4, is_slippery=false | 1,0000 +/- 0,0000 |

Evaluacion independiente descrita en la model card: 1.000 episodios con semillas 1000000–1000999, recompensa media 1,0000, desviacion tipica 0,0000, media menos desviacion 1,0000. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es una consulta a un array NumPy de 16x4 valores y puede ejecutarse en CPU.
- GPU recomendadas: ninguna; no se requiere aceleracion por hardware.
- Cabe en cualquier equipo: el repositorio ocupa 0,0 GB y el checkpoint es un fichero de valores Q de tamano despreciable.
- Opciones de despliegue: script Python con NumPy y Gymnasium; no compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza de la operacion (indexacion y `argmax` sobre 4 valores) la latencia por decision es del orden de microsegundos en CPU.
- Dependencias: `requirements.txt` del repositorio (incluye Gymnasium y NumPy, segun el flujo de reproduccion descrito).

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Parametros | Recompensa media | Licencia |
|---|---|---|---|---|---|
| Vladprime/q-learning-FrozenLake-v1 | Q-learning tabular | FrozenLake-v1 4x4, no resbaladizo | 64 valores Q | 1,0000 +/- 0,0000 | Apache 2.0 |
| Agente DQN de referencia del curso de HF | Red neuronal profunda (DQN) | FrozenLake / entornos del curso | no disponible | no disponible | no disponible |
| Implementaciones tabulares de la comunidad en FrozenLake-v1 | Q-learning tabular | FrozenLake-v1 | no disponible | no disponible | variable |

No se dispone de datos publicados de benchmarks para las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El agente solo es valido para `FrozenLake-v1` con mapa 4x4 y `is_slippery=False`; no generaliza a otros mapas, tamanos ni a la variante resbaladiza.
- La Q-table esta indexada por estados discretos; no procesa texto, imagenes ni senales continuas, por lo que no puede emplearse como modelo de lenguaje ni como politica para observaciones continuas.
- El resultado perfecto (1,0000) se explica por el determinismo del entorno configurado; no debe interpretarse como evidencia de robustez ante estocasticidad.
- El fichero `q-learning.pkl` requiere `pickle`, que puede ejecutar codigo arbitrario al deserializar; la model card advierte de cargar solo pickles de fuentes confiables y recomienda `qtable.npy` con `allow_pickle=False`.
- Es una entrega practica de la Unidad 2 del curso, no una certificacion ni un artefacto validado para produccion.
- No hay informacion sobre sesgos, alucinacion o cobertura idiomatica porque el artefacto no opera sobre lenguaje natural.
- La licencia Apache 2.0 permite uso comercial del codigo y los datos, pero el valor practico del artefacto fuera del ambito didactico es muy limitado.
- No se han publicado resultados de benchmarks adicionales ni verificacion independiente del `mean_reward` declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladprime/q-learning-FrozenLake-v1
- Tarea del curso (Unit 2, hands-on): https://huggingface.co/learn/deep-rl-course/en/unit2/hands-on
- Requisitos de certificacion del curso: https://huggingface.co/learn/deep-rl-course/en/communication/certification
