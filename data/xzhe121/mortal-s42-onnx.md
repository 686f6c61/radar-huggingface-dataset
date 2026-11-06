# xzhe121/Mortal-S42-onnx

## Resumen

Mortal-S42-onnx es la exportación a formato ONNX del modelo de decisión haor/Mortal-S42, un modelo de la familia Mortal v4 para mahjong riichi a cuatro jugadores. Lo publica el usuario xzhe121 porque el repositorio original solo distribuye pesos en PyTorch, y esta versión ONNX es la que consume mahjong-copilot, una herramienta de estudio offline que lee la ventana del juego y no interactúa con él. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal de refuerzo (deep Q-network) que evalúa acciones legales en un estado de partida de mahjong.

Técnicamente, el modelo combina un codificador convolucional residual ("brain", 40 bloques residuales y 192 canales) con una cabeza Q ("dqn") que produce un valor Q por cada una de las 46 acciones posibles. La exportación se hizo con torch.onnx.export en opset 18 y eje de batch dinámico, sin reentrenar ni cuantizar los pesos. La validación reportada por el autor es que, sobre 605 puntos de decisión extraídos de registros de partidas, el modelo ONNX y el original en PyTorch eligen la misma mejor acción en todos los casos, con una diferencia máxima de 9,5e-6 en el valor Q de una acción legal.

Su relevancia es acotada pero clara: permite ejecutar el modelo sin dependencia de PyTorch, lo que facilita su integración en aplicaciones ligeras y en entornos donde el runtime de ONNX es preferible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0,0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que la métrica no se ha actualizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional residual (40 bloques, 192 canales) con cabeza Q (deep Q-network), exportada como grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de observación `[batch, 1012, 34]` |
| Tipos de cuantización | no disponible; el autor indica que los pesos no se cuantizaron en la exportación |
| Idiomas soportados | no aplica (modelo de decisión sobre mahjong, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 para los pesos; la estructura de red trazada de Mortal está bajo AGPL-3.0-or-later |
| Formato de pesos | ONNX (`model.onnx`, opset 18, eje de batch dinámico) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Mortal v4: un codificador convolucional residual de 40 bloques con 192 canales que procesa la observación del juego codificada por libriichi (`obs_repr`) con forma `[batch, 1012, 34]`, seguido de una cabeza Q que emite 46 valores, uno por acción legal posible. El modelo se entrena mediante aprendizaje por refuerzo con un esquema de deep Q-learning, tal como corresponde a la familia Mortal; el autor de esta exportación no aporta detalles adicionales sobre el dataset, el número de tokens ni el proceso de entrenamiento, y no se ha publicado información sobre RLHF o DPO porque no es un modelo de lenguaje.

La innovación de esta publicación concreta no está en el entrenamiento, sino en la portabilidad: se exporta el grafo completo (codificador y cabeza Q juntos) con `torch.onnx.export` en opset 18 y eje de batch dinámico, partiendo de la revisión `524981f21a929e3c3b269f65af79b84163bd02ca` y del fichero `weights/s42-inference.pth`. Los pesos no se modifican, reentrenan ni cuantizan. La estructura de red del grafo se trazó desde `mortal/model.py` en el commit `0cff2b52982be5b1163aa9a62fb01f03ce91e0d2`.

## Capacidades

- Evaluación de acciones en mahjong riichi a cuatro jugadores: dado un estado observado, devuelve un valor Q para cada una de las 46 acciones legales.
- Selección de acción greedy: la política consiste en elegir la acción con el valor Q más alto.
- Enmascaramiento de acciones ilegales: las acciones no legales reciben `-inf` en la salida `q`.
- Procesamiento por lotes: el eje de batch es dinámico, por lo que admite inferencia con batch variable.
- Integración sin PyTorch: al ser un grafo ONNX, puede ejecutarse con runtimes de ONNX en lugar del stack de PyTorch.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas, visión, audio, tool calling ni agentes multi-paso; su dominio es exclusivamente el mahjong.

## Casos de uso

- Herramienta de estudio de mahjong: mahjong-copilot lee la ventana del juego, construye la observación y consulta al modelo para sugerir la mejor jugada al usuario, sin interactuar con el juego en sí. El formato ONNX simplifica el despliegue en la aplicación de escritorio.
- Análisis offline de registros de partidas: procesar logs de partidas por lotes aprovechando el eje de batch dinámico para calcular valores Q en cada punto de decisión y detectar errores de jugadores.
- Evaluación comparativa de políticas: usar el modelo como referencia para medir la calidad de decisiones de otros agentes o de jugadores humanos sobre los mismos estados.
- Entrenamiento y docencia: servir de ejemplo práctico de exportación de un agente de refuerzo a ONNX y de validación numérica entre el modelo original y el exportado.
- Integración en pipelines sin PyTorch: desplegar el modelo en entornos donde instalar PyTorch es costoso o inviable, usando un runtime ONNX ligero.
- Investigación en agentes de juego: emplear el modelo como componente de decisión en experimentos sobre mahjong riichi, sustituyendo la dependencia del repositorio original.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a este dominio. El único dato de rendimiento reportado es la validación de equivalencia entre el modelo ONNX y el original en PyTorch:

| Métrica | Resultado |
|---|---|
| Puntos de decisión evaluados | 605 |
| Coincidencia en la mejor acción | 100 % |
| Diferencia máxima en valor Q de una acción legal | 9,5e-6 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0,0 GB, lo que impide estimar el peso real del grafo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por la naturaleza de la red (40 bloques residuales de 192 canales) es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: runtime de ONNX (ONNX Runtime) como vía principal; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mortal-S42-onnx (este) | ONNX | Decisión en mahjong riichi | no disponible | no aplica | Apache 2.0 (pesos) / AGPL-3.0-or-later (estructura) | Hugging Face, 0 descargas |
| haor/Mortal-S42 | PyTorch | Decisión en mahjong riichi | no disponible | no aplica | Apache 2.0 | Hugging Face (modelo base) |
| Mortal (repositorio original) | PyTorch | Decisión en mahjong riichi | no disponible | no aplica | AGPL-3.0-or-later | GitHub |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de la equivalencia numérica reportada frente al modelo base.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve decisiones de mahjong riichi a cuatro jugadores; no es utilizable para ninguna otra tarea.
- Licencia mixta: los pesos son Apache 2.0, pero la estructura de red trazada desde Mortal está bajo AGPL-3.0-or-later, lo que puede condicionar el uso comercial y la distribución de obras derivadas; conviene revisar `LICENSE.AGPL` y el `NOTICE` incluidos.
- Sin datos de entrenamiento publicados en esta ficha: no se puede evaluar la composición del dataset ni posibles sesgos de la política.
- Riesgo de generalización limitado: la validación de equivalencia se hizo sobre 605 puntos de decisión, una muestra acotada.
- Repositorio sin tracción: 0 descargas y 0 likes, y tamaño reportado de 0,0 GB, lo que genera dudas sobre la disponibilidad efectiva de los artefactos.
- Sin soporte multilingüe ni de texto: no admite prompts en lenguaje natural ni instrucciones.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xzhe121/Mortal-S42-onnx
- Modelo base: https://huggingface.co/haor/Mortal-S42
- Repositorio Mortal: https://github.com/Equim-chan/Mortal
- Aplicación mahjong-copilot: https://github.com/jason1yuan/mahjong-copilot
