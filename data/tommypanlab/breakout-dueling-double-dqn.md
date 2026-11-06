# TommyPanLab/breakout-dueling-double-dqn

## Resumen

`breakout-dueling-double-dqn` es un agente de aprendizaje por refuerzo profundo entrenado para jugar a Atari Breakout, publicado por TommyPanLab. No es un modelo de lenguaje: es una red neuronal de politica (Q-network) que implementa el algoritmo Double DQN con arquitectura Dueling sobre un tronco convolucional estilo Nature-DQN. El modelo tiene 3.292.837 parametros y produce cuatro valores Q crudos correspondientes a las acciones NOOP, FIRE, RIGHT y LEFT.

El checkpoint es el unico que el autor publica del proyecto `breakout-rl-engineering`, y corresponde al mismo que alimenta la demo jugable en navegador alojada en breakout.tommypan.com. Se distribuye en tres formatos: el checkpoint canonico de PyTorch (`model.pt`), un export ONNX en fp32 (`model.onnx`) y los ficheros de metadatos con la configuracion de entrenamiento y las comprobaciones de paridad.

Su relevancia es acotada y de caracter educativo o de referencia: sirve como ejemplo reproducible de un pipeline completo de RL en Atari (entrenamiento, seleccion de checkpoint, evaluacion holdout, export a ONNX y despliegue web), no como componente de proposito general. El rendimiento declarado en el holdout es de 30,93 de media en 15 episodios bajo el contrato de evaluacion v2 del autor, una cifra modesta que no completa el juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN estilo Nature-DQN con cabecera Dueling (Double DQN), hidden size 512 |
| Parametros totales | 3.292.837 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de 4 frames apilados de 84x84 en escala de grises) |
| Tipos de cuantizacion | no disponible (se publica fp32 en PyTorch y ONNX fp32; el autor menciona exports fp16 ONNX y TensorRT no publicados) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | GPL-2.0 |
| Formato de pesos | `model.pt` (PyTorch, pickle), `model.onnx` (ONNX fp32) |

## Arquitectura y entrenamiento

La red sigue el esquema clasico de DQN para Atari: un tronco convolucional que procesa una pila de 4 fotogramas de 84x84 en escala de grises (tensor `(N, 4, 84, 84)` en NCHW, valores uint8 divididos una sola vez por 255.0) y una cabeza con capa oculta de 512 unidades que se desdobla en la estructura Dueling (valor de estado y ventajas por accion). La salida son 4 valores Q crudos; la accion codiciosa se obtiene con `argmax`. Sobre esta base se aplica Double DQN para reducir el sesgo de sobreestimacion del DQN estandar.

El entrenamiento se realizo durante 2.500.000 transiciones del agente, con semilla 2022 y 2 entornos vectorizados, en la ejecucion identificada como `day21-final-long-training-seed2022`. La evaluacion se hizo bajo el denominado Breakout Contract v2 (frame skip 4, pila de 4 frames, sticky actions 0.25 y FIRE al reiniciar) con ALE 0.12.0. El autor advierte explicitamente que los resultados de este contrato no son comparables con los de su Contract v3 ni con el controlador determinista por pixeles del proyecto. No se documentan en la informacion disponible detalles sobre reward shaping, uso de PER ni procesos de RLHF (no aplicables en este dominio).

## Capacidades

- Control de politica para Atari Breakout: selecciona una de cuatro acciones discretas (NOOP, FIRE, RIGHT, LEFT) a partir de la observacion visual.
- Inferencia en PyTorch mediante `build_q_network` del repositorio del proyecto y en ONNX Runtime sin dependencias del codigo original.
- Export reproducible: incluye registro de paridad entre `model.pt` y `model.onnx` en `model.onnx.metadata.json`.
- Despliegue en navegador: el ONNX fp32 es el artefacto usado por la demo web.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento extendido; es un agente de un solo dominio.
- No incorpora vision general: la entrada esta restringida al preprocesado especifico de Atari (4x84x84 en grises).

## Casos de uso

- Referencia educativa de RL profundo: util para cursos y tutoriales que quieran mostrar un pipeline completo desde el entrenamiento DQN hasta el despliegue en navegador con ONNX Runtime, usando los ficheros de metadatos como traza de reproducibilidad.
- Baseline de comparacion en experimentos de Atari: sirve como punto de partida para medir mejoras al introducir PER, reward shaping o Contract v3, siempre que se reentrene y se evalue bajo el mismo contrato.
- Demo interactiva en web: el `model.onnx` puede cargarse con ONNX Runtime Web para replicar la demo publicada sin necesidad de backend, con un coste de inferencia minimo dado el tamano del modelo (3,3 M de parametros).
- Validacion de pipelines de exportacion PyTorch a ONNX: los ficheros de paridad permiten comprobar que una cadena de conversion propia reproduce las salidas del checkpoint original.
- Pruebas de integracion de entornos ALE: el agente puede usarse para verificar que un wrapper de entorno implementa correctamente frame skip, sticky actions y FIRE on reset, comparando las puntuaciones obtenidas con las declaradas.
- Investigacion sobre robustez y varianza: la diferencia entre la evaluacion de seleccion (51,4 de media) y el holdout (30,93) con solo 15 episodios es un caso practico para estudiar sobreajuste a la seleccion de checkpoint y la necesidad de mas episodios de evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Evaluacion | Episodios | Media | Mediana | Min | Max |
|---|---|---|---|---|---|
| Seleccion | 15 | 51,4 | 51 | 26 | 74 |
| Holdout final | 15 | 30,93 | 32 | 6 | 55 |

El valor reportado en el `model-index` es el del holdout: 30,93 +/- 14,48 de puntuacion bruta media en 15 episodios, bajo Atari Breakout (ALE 0.12.0, Contract v2). No se han publicado en la informacion disponible resultados comparativos con otros agentes bajo el mismo contrato.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para el modelo en si; el cuello de botella es el entorno ALE y el buffer de frames, no la red.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. La inferencia en CPU es viable para uso interactivo.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU mediante ONNX Runtime en CPU o en navegador con WebAssembly/WebGPU.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (Python, C++, Web), y potencialmente TensorRT si se exporta de nuevo (el autor menciona engines TensorRT no publicados). No se documenta soporte para vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera una latencia por paso muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| breakout-dueling-double-dqn (este) | 3.292.837 | 4x84x84 grises | Double DQN + Dueling | GPL-2.0 | HuggingFace (PyTorch + ONNX) |
| DQN original (Mnih et al., 2015) | no disponible | 4x84x84 grises | DQN | no disponible | Implementaciones de terceros, no checkpoint oficial unico |
| Alternativas del mismo proyecto (ablations, PER, Contract v3) | no disponible | no disponible | variantes DQN | GPL-2.0 (repo) | no publicadas por el autor |
| Controlador determinista por pixeles del proyecto | no aplica (no es red neuronal) | pixeles | heuristico | GPL-2.0 (repo) | no publicado |

La comparacion con literatura academica no es directa porque el protocolo de evaluacion (Contract v2, sticky actions 0.25, FIRE on reset, 15 episodios) difiere del estandar de la comunidad, y el autor lo advierte de forma explicita.

## Limitaciones y advertencias

- Rendimiento limitado: la puntuacion media de holdout es de 30,93 y el autor indica que la politica no completa el juego.
- Alta varianza: desviacion tipica de 14,48 sobre 15 episodios, con minimo de 6 y maximo de 55; insuficiente para conclusiones robustas sobre calidad general.
- Brecha seleccion-holdout: la caida de 51,4 a 30,93 sugiere sobreajuste en la seleccion de checkpoint o alta sensibilidad al conjunto de evaluacion.
- Dependencia estricta del entorno: cambiar frame skip, sticky actions o gestion de perdida de vidas altera la tarea y invalida los resultados; es necesario usar el wrapper `breakout_env.py` del repositorio con Contract v2.
- Licencia GPL-2.0: cualquier uso o distribucion derivada debe cumplir los terminos copyleft de la GPL, lo que puede ser restrictivo en productos propietarios.
- La ROM de Atari Breakout no se incluye ni esta cubierta por la licencia; su uso queda sujeto a los terminos del propietario.
- Carga de `model.pt` mediante pickle: el autor advierte que solo deben cargarse ficheros de confianza; para entornos no confiables, usar el export ONNX.
- Sin capacidades de proposito general: no es un modelo de lenguaje, no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- Sesgos y alucinacion: no aplican en el sentido habitual de modelos generativos, pero la politica puede exhibir comportamientos degenerados fuera de la distribucion de entrenamiento.
- Resultados no verificados de forma independiente: la metrica del `model-index` figura con `verified: false`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TommyPanLab/breakout-dueling-double-dqn
- Repositorio del proyecto: https://github.com/Tommyweige/breakout-rl-engineering
- Demo en navegador: https://breakout.tommypan.com
- Documentacion de ALE (Arcade Learning Environment) 0.12.0: no disponible en la informacion proporcionada
- Paper de referencia Double DQN (van Hasselt et al., 2015): no disponible en la informacion proporcionada
- Paper de referencia Dueling DQN (Wang et al., 2015): no disponible en la informacion proporcionada
