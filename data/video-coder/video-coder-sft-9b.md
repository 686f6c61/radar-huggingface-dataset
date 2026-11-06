# Video-Coder/Video-Coder-SFT-9B

## Resumen

Video-Coder-SFT-9B es un modelo de lenguaje de 9.000 millones de parametros publicado por el equipo Video-Coder bajo licencia Apache 2.0. Forma parte del proyecto "Video-Coder: Reinforcing Agentic Coding for Video Generation", cuyo objetivo es entrenar un agente de generacion de video basado en codigo: el modelo escribe y ejecuta codigo de forma autonoma para construir una escena 3D dinamica (denominada "Draft Video" en la model card) que aporta senales de estructura y movimiento a generadores de video posteriores. Este repositorio contiene concretamente el checkpoint resultante del ajuste supervisado (SFT) sobre el conjunto Video-Coder-SFT-10k.

La propuesta es relevante porque traslada el paradigma de los agentes de codigo (escribir codigo, ejecutarlo, leer el resultado y corregir) al dominio de la generacion de video, en lugar de abordarla unicamente como un problema de difusion pura. Segun la model card, el pipeline completo mejora Minimax-H3 en aproximadamente 7 puntos en PhyGenBench y 24 puntos en VBench-2.0, lo que situa la contribucion principal en el terreno de la coherencia fisica y la calidad estructural del video generado.

La informacion publica disponible es muy limitada: la model card no detalla la arquitectura base, el numero de tokens de entrenamiento, la composicion del dataset ni los idiomas soportados. Los enlaces a la pagina del proyecto, el paper y el codigo aparecen vacios en el README, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje de 9B parametros; arquitectura base no especificada en la model card) |
| Parametros totales | 9B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se lista el contenido del repositorio) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura del transformer subyacente ni el modelo base sobre el que se construye el checkpoint de 9B. Lo que si describe es el pipeline de entrenamiento: el modelo se ajusta mediante SFT sobre Video-Coder-SFT-10k, un conjunto de aproximadamente 10.000 ejemplos de alta calidad compuesto por prompts diversos y videos de referencia ground-truth. El objetivo del entrenamiento es que el modelo aprenda a generar codigo que, al ejecutarse, produzca una escena 3D dinamica utilizable como borrador estructural para un generador de video descendente.

El proyecto complementa el SFT con un segundo conjunto, Video-Coder-RL-4k (4.000 ejemplos), presumiblemente para una etapa de refuerzo posterior, y con el denominado Video-Coder Harness: un entorno interactivo unificado que integra ejecucion de codigo, renderizado de escenas 3D y realimentacion de ejecucion, tanto para entrenamiento como para inferencia. Esta combinacion de ejecucion real y feedback del entorno es la innovacion tecnica central del trabajo: el agente no solo escribe codigo, sino que lo ejecuta y observa el resultado renderizado. No se detalla en la informacion disponible si se emplearon tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de codigo orientada a tareas: el modelo escribe scripts que construyen escenas 3D dinamicas, presumiblemente mediante librerias de renderizado o motores 3D.
- Razonamiento agente multi-paso: el diseno del Harness implica ciclos de escritura de codigo, ejecucion, lectura de errores o resultados y correccion.
- Uso de feedback de ejecucion: capacidad de incorporar la salida del entorno (errores, renders) para refinar el codigo generado.
- Planificacion de estructura y movimiento: traduccion de un prompt en lenguaje natural a una composicion 3D con trayectorias y movimiento coherentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado explicitamente en la model card, aunque el paradigma agente implica invocacion de herramientas de ejecucion.
- Vision: no disponible; el modelo opera sobre codigo y texto, no se documenta entrada de imagenes.
- Modo thinking explicito: no disponible.

## Casos de uso

- Previsualizacion estructural de video generativo: dado un prompt textual, el modelo genera codigo que produce un borrador 3D con la geometria y el movimiento previstos, que despues se pasa a un generador de video de difusion para refinar texturas y fotorealismo. Es el caso de uso central del proyecto y explica su mejora en PhyGenBench.
- Generacion de video con coherencia fisica: en escenarios donde la difusion pura falla en consistencia de objetos y movimiento (caidas, colisiones, trayectorias), el borrador 3D generado por codigo impone restricciones fisicas que el generador descendente respeta.
- Automatizacion de escenas 3D para animacion o prototipado: el modelo puede producir scripts reproducibles que construyan una escena con parametros ajustables (posiciones, camaras, tiempos), utiles en estudios que necesiten variaciones rapidas de un plano.
- Investigacion en agentes de codigo con feedback de entorno: el checkpoint SFT sirve como base para estudiar tecnicas de RL sobre ejecucion real, dado que el proyecto publica tambien el conjunto RL-4k y el Harness.
- Evaluacion comparativa de generadores de video: al actuar como etapa intermedia de estructura, permite aislar la contribucion de la coherencia estructural frente a la calidad visual en pipelines de generacion.
- Reproduccion de experimentos academicos: con licencia Apache 2.0, el modelo puede integrarse en pipelines de investigacion y compararse con alternativas de generacion de video condicionada por estructura.

## Benchmarks y rendimiento

La model card no publica resultados por checkpoint individual, sino el efecto del pipeline completo sobre un generador descendente:

| Metrica | Resultado reportado |
|---|---|
| PhyGenBench (con Minimax-H3) | mejora de aproximadamente +7 puntos |
| VBench-2.0 (con Minimax-H3) | mejora de aproximadamente +24 puntos |

No se han publicado resultados de benchmarks propios del checkpoint SFT-9B (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 9B, en FP16 requeriria del orden de 18 GB de pesos, y en cuantizacion de 4 bits alrededor de 5-6 GB, pero estos valores no estan confirmados por el autor.
- GPU recomendadas: no especificadas. Para 9B en precision completa serian necesarias GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100); con cuantizacion podria caber en GPU de consumo de 8-12 GB.
- Cabe en GPU de consumo: probablemente si con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: no documentadas; al ser un modelo de codigo y agente, requeriria ademas el Video-Coder Harness para ejecutar el codigo generado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables de la misma categoria (agentes de codigo para generacion de video) y la informacion publica no permite establecer una comparacion con datos verificables. El unico punto de referencia mencionado es Minimax-H3 como generador de video descendente, que no es un modelo equivalente sino el componente que consume la salida de Video-Coder.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: la model card no detalla arquitectura base, contexto, datos de entrenamiento ni idiomas, lo que dificulta evaluar su idoneidad en produccion.
- Dependencia del Harness: el modelo esta disenado para operar dentro de un entorno de ejecucion de codigo y renderizado 3D; sin ese entorno su utilidad practica se reduce drasticamente.
- Dependencia de un generador descendente: su valor final se mide en combinacion con un generador de video como Minimax-H3, no de forma aislada.
- Riesgo de alucinacion en codigo: como todo modelo de codigo, puede generar scripts que fallen o produzcan escenas incorrectas; el feedback de ejecucion mitiga pero no elimina este riesgo.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: no confirmados; no hay garantia de buen rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de las librerias de renderizado y de los modelos descendentes con los que se combine.
- Madurez: repositorio sin descargas ni interacciones en el momento de la consulta, con enlaces a paper y codigo vacios; tratar como material de investigacion preliminar.

## Enlaces

- Hugging Face: https://huggingface.co/Video-Coder/Video-Coder-SFT-9B
- Imagen teaser del proyecto: https://raw.githubusercontent.com/CYWang735/Video-Coder/main/assets/teaser.png
- Imagen cualitativa del proceso de inferencia: https://raw.githubusercontent.com/CYWang735/Video-Coder/main/assets/qualitative.png
- Pagina del proyecto: no disponible (enlace vacio en la model card)
- Paper: no disponible (enlace vacio en la model card)
- Codigo: no disponible (enlace vacio en la model card)
