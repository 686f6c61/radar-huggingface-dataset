# zikh/scholarly-detector-v3

## Resumen

Scholarly AI-text detector v3 es un clasificador de texto disenado para detectar fragmentos de articulos academicos generados por modelos de lenguaje. Lo desarrolla el autor identificado como zikh y constituye el motor del control "AI Content" de la plataforma scholar.click. El modelo no genera texto: puntua ventanas de tres frases y devuelve una probabilidad de que hayan sido producidas por IA, con el objetivo de ofrecer una senal de verificacion que se ejecute de forma autoalojada, de modo que el texto del articulo no abandone el servidor del usuario.

Tecnicamente es un ensemble de tres componentes combinados por un stacker logistico: un clasificador TF-IDF con regresion logistica, un DistilRoBERTa afinado y exportado a ONNX en int8, y un conjunto de 44 caracteristicas de estilo de escritura. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia en CPU dentro de un servidor Node. La version 3 se centra en un escenario concreto: secciones redactadas por IA a partir de resultados reales proporcionados por el usuario, que era el caso peor para la version anterior.

La relevancia de esta version esta en su calibracion y en su evaluacion con modelos no vistos. El autor mantiene el umbral de 0,5 calibrado para marcar solo un 0,8 % de 400 secciones humanas no vistas, y reserva por completo Claude Sonnet 5.5 y GPT-5.5 como prueba de generalizacion a modelos desconocidos. Es, por tanto, una herramienta de apoyo a la revision academica, no un veredicto sobre la autoría de una persona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: TF-IDF + regresion logistica, DistilRoBERTa (int8 ONNX) y 44 caracteristicas de estilo, combinados por un stacker logistico |
| Parametros totales | no disponible (el componente transformer es DistilRoBERTa; el numero exacto de parametros no se indica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo puntua ventanas de 3 frases, no secuencias largas) |
| Tipos de cuantizacion | int8 para el componente transformer (ONNX); TF-IDF y stacker en formato propio |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformer + tokenizer), JSON (tfidf.json, fusion.json) y parity_fixtures.json |

## Arquitectura y entrenamiento

El modelo es un clasificador binario por ventanas. Cada ventana de tres frases se procesa por tres vias en paralelo: un modelo TF-IDF con regresion logistica que captura senales lexicas, un DistilRoBERTa afinado y cuantizado a int8 en ONNX que aporta representaciones contextuales, y 44 caracteristicas de estilo de escritura calculadas de forma explicita. Las tres salidas se combinan mediante un stacker logistico cuyos parametros de calibracion se guardan en `fusion.json`. El intercept del stacker se reduce en 0,2 para que el corte de 0,5 marque el 0,8 % de 400 secciones humanas no vistas, la misma tasa que la version 2.

El cambio principal de la v3 respecto a la v2 esta en los datos de entrenamiento. La v2 aprendia de secciones de IA generadas a partir del titulo y el resumen del articulo, pero el flujo real es distinto: el estudiante entrega sus resultados reales y pide que se redacte la prosa. Ese texto contiene numeros y nombres reales que enmascaran el estilo del modelo. La v3 anade 1400 secciones de este tipo, construidas en dos pasos: un modelo convierte una seccion humana real en notas facticas escuetas y los modelos objetivo redactan la seccion solo a partir de esas notas. Claude Sonnet 5.5 y GPT-5.5 se mantienen completamente fuera del entrenamiento como prueba con modelos no vistos. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Clasificacion de texto: asigna una probabilidad de generacion por IA a ventanas de tres frases de un articulo academico.
- Deteccion de prosa generada a partir de resultados reales: escenario especifico incorporado en la v3 mediante 1400 secciones sinteticas construidas desde notas facticas.
- Deteccion de texto de modelos modernos: cubre siete modelos de IA contemporaneos segun la evaluacion del autor.
- Generalizacion a modelos no vistos: evaluado explicitamente con Claude Sonnet 5.5 y GPT-5.5 fuera del conjunto de entrenamiento.
- Calibracion controlada: umbral ajustado para mantener una tasa baja de falsos positivos sobre secciones humanas.
- Inferencia autoalojada: pensado para ejecutarse dentro del servidor Scholarly (Node), sin enviar el texto a terceros.
- Verificacion de implementaciones: incluye `parity_fixtures.json` con textos de prueba y puntuaciones esperadas para comprobar la equivalencia entre las implementaciones Node y Python.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Revision editorial de articulos academicos: el modelo puntua cada ventana de tres frases y permite al editor localizar las secciones con mayor probabilidad de generacion por IA, usando el score como indicador para una revision manual posterior.
- Verificacion en plataformas de envio de trabajos: integrado en el backend Node de una plataforma, se aplica sobre el texto recibido antes de la revision por pares, sin que el manuscrito salga de la infraestructura propia.
- Deteccion de prosa redactada a partir de resultados del autor: es el caso que motivó la v3; si un estudiante entrega sus datos y pide que se redacte la seccion, el detector mantiene una tasa de acierto del 78,1 % frente al 70,5 % de la v2.
- Control de integridad en cursos y trabajos de fin de grado: el umbral calibrado al 0,8 % de falsos positivos sobre secciones humanas reduce el riesgo de acusaciones erroneas cuando se usa como senal previa a una entrevista con el estudiante.
- Analisis por lotes de corpus: al ser un ensemble ligero con transformer int8 en ONNX, puede ejecutarse sobre lotes de secciones en CPU dentro de un pipeline de revision, sin GPU dedicada.
- Auditoria de abstracts en repositorios preprint: el autor reporta una tasa de falsos positivos del 2,8 % sobre abstracts de arXiv, por lo que sirve para priorizar revisiones en flujos de moderacion, siempre con confirmacion humana.
- Validacion de despliegues propios: los fixtures de paridad permiten comprobar que una implementacion Node o Python reproduce las puntuaciones esperadas antes de poner el detector en produccion.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos a traves de la ruta de puntuacion de la propia aplicacion:

| Metrica | v2 | v3 |
|---|---|---|
| IA redactada desde resultados reales detectada | 70,5 % | 78,1 % |
| Misma metrica, modelos no vistos | 48,3 % | 64,2 % |
| IA moderna detectada (7 modelos) | 82,5 % | 85,5 % |
| Modelos no vistos detectados | 64,0 % | 72,0 % |
| Secciones humanas marcadas erroneamente | 1,3 % | 1,5 % |
| Abstracts humanos de arXiv marcados erroneamente | 1,0 % | 2,8 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de DistilRoBERTa en int8 ONNX, el componente transformer es del orden de decenas de MB y el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; el diseno esta orientado a ejecucion en CPU dentro de un servidor Node.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque no es necesario; tambien funciona en CPU.
- Opciones de despliegue: ONNX Runtime para el transformer, con implementaciones de referencia en Node y Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de clasificador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de texto generado por IA en la informacion proporcionada, por lo que la comparativa con alternativas concretas no esta disponible. La unica comparacion documentada es interna, entre la v2 y la v3 del mismo modelo (ver tabla de benchmarks).

## Limitaciones y advertencias

- Un detector devuelve una probabilidad, no una prueba; el propio autor advierte que el score debe tratarse como indicador y nunca como veredicto sobre una persona.
- Solo cubre ingles; no se ha entrenado ni evaluado en otros idiomas.
- Los datos de IA moderna del entrenamiento provienen unicamente de Claude y GPT, lo que limita la generalizacion a otros generadores.
- El texto generado y despues editado en profundidad es mas dificil de detectar.
- Las secciones densas de resultados construidas alrededor de numeros reales suelen puntuar como humanas, lo que genera falsos negativos en ese tipo de contenido.
- La tasa de falsos positivos sobre abstracts humanos de arXiv sube del 1,0 % al 2,8 % respecto a la v2, un incremento relevante si se aplica a ese tipo de texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del stacker y de los datos de calibracion incluidos en `fusion.json`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- En produccion, cualquier decision disciplinaria o editorial basada en el score deberia acompanarse de revision humana y de la posibilidad de que el autor aporte contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zikh/scholarly-detector-v3
- Plataforma que lo integra: https://scholar.click
