# tsilva/SuperMarioBros-Nes-v0_Level1-3

## Resumen

SuperMarioBros-Nes-v0_Level1-3 es un checkpoint intermedio de politica de refuerzo (RL) para el videojuego Super Mario Bros de NES, concretamente para el nivel 1-3. Lo desarrolla el usuario tsilva dentro del proyecto GradLab y se distribuye como un modelo de Stable-Baselines3 (SB3) con pipeline de reinforcement-learning. No es un modelo de lenguaje: es una politica de control que recibe cuatro fotogramas en escala de grises de 84x84 píxeles y emite una de siete combinaciones discretas de botones. Su relevancia es acotada y experimental: sirve como punto de partida para continuar el ajuste con PPO, no como artefacto final.

El checkpoint parte de una politica PPO previa (Q5) entrenada durante 26.001.408 transiciones de entorno y se ha afinado mediante behavior cloning (SFT) sobre 816 ejemplos de estado-control procedentes de una ruta exitosa de Go-Explore. Tras el SFT no se aplicaron actualizaciones PPO adicionales, por lo que el contador de pasos heredado no refleja el ajuste supervisado. El autor advierte explicitamente de que no ha superado la prueba de aceptacion original de 100/100 y de que la robustez general no esta demostrada.

En las pruebas de desarrollo, una politica congelada completo 5 de 5 episodios muestreados con inicio completo y una comprobacion greedy adicional completo 1 de 1, sin usar acciones del profesor ni restauraciones de estado. Son validaciones pequenas y no equivalentes al test de aceptacion. El repositorio ocupa 0,0 GB, no registra descargas ni likes y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para RL (encoder compartido + cabezas de politica y valor) sobre Stable-Baselines3/GradLab PPO; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 fotogramas en escala de grises de 84x84 píxeles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | model.zip (formato SB3/GradLab completo) y policy.pt (tensores para torch.load con weights_only=True) |
| Entorno | SuperMarioBros-Nes-v0, nivel 1-3 (GradLab) |
| Acciones | 7 combinaciones discretas de botones |
| Punto de partida | Checkpoint PPO Q5 a 26.001.408 transiciones de entorno |
| Datos de SFT | 816 ejemplos de estado-control de una ruta Go-Explore exitosa |
| Entrenamiento SFT | 7.500 actualizaciones de minibatch + 1.500 de pulido sobre el dataset completo |
| Revision | sft-20261102 |

## Arquitectura y entrenamiento

La politica se apoya en un encoder compartido que procesa cuatro fotogramas apilados en escala de grises de 84x84 y alimenta dos cabezas: una de politica (que produce la distribucion sobre las siete combinaciones de botones) y otra de valor. El entrenamiento inicial fue PPO, con un contador de 26.001.408 transiciones de entorno en el checkpoint Q5 de partida. Sobre esa base se aplico behavior cloning supervisado con 816 ejemplos de estado-control extraidos de una unica ruta exitosa obtenida con Go-Explore.

El SFT consistio en 7.500 actualizaciones de minibatch seguidas de 1.500 actualizaciones de pulido sobre el dataset completo. Un detalle relevante es que el SFT modifico el encoder compartido mientras conservaba los pesos de la cabeza de valor, lo que puede desalinear la calibracion del critico respecto a la recompensa y el descuento; el autor recomienda verificar esa calibracion antes de reanudar PPO. No hubo actualizaciones PPO posteriores al SFT, y el contador de timesteps heredado no incluye las actualizaciones supervisadas. La entropia de los estados del profesor es muy baja, lo que limita la diversidad de la senal de imitacion.

## Capacidades

- Control de politica para Super Mario Bros (NES), nivel 1-3, a partir de observaciones visuales de 84x84 en escala de grises.
- Seleccion entre siete combinaciones discretas de botones por paso.
- Ejecucion de politicas congeladas en episodios con inicio completo (5 de 5 muestreados y 1 de 1 greedy en desarrollo).
- Carga en CPU mediante GradLabPPO.load sobre model.zip, o carga de tensores con torch.load(weights_only=True) sobre policy.pt.
- Punto de partida para reanudar ajuste con PPO (no se han aplicado actualizaciones PPO tras el SFT).
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, vision general, audio ni capacidades multilingues.

## Casos de uso

- Reanudacion de entrenamiento PPO: cargar model.zip con GradLabPPO y continuar las actualizaciones de politica tras verificar la calibracion del critico, dado que el SFT altero el encoder pero no la cabeza de valor.
- Investigacion en behavior cloning sobre RL: usar los 816 ejemplos de estado-control y la configuracion de SFT como referencia para estudiar como el ajuste supervisado afecta a un encoder entrenado con PPO.
- Reproduccion de experimentos con Go-Explore: el runtime.json y los JSON de procedencia permiten reconstruir el entorno y las condiciones del entrenamiento para replicar los resultados de desarrollo.
- Evaluacion de robustez de politicas intermedias: servir como linea base para medir la brecha entre las comprobaciones de desarrollo (5/5 y 1/1) y el test de aceptacion de 100/100.
- Docencia y demostraciones de RL en videojuegos: el modelo es pequeno y se ejecuta en CPU, lo que facilita su uso en entornos educativos para ilustrar politicas PPO y SFT.
- Analisis de entropia de acciones: estudiar el efecto de una entropia muy baja en los estados del profesor sobre la diversidad de politicas aprendidas por imitacion.
- Integracion en pipelines de GradLab: usar verify.py y los JSON de procedencia como parte de un flujo de validacion antes de promover un checkpoint a Release.

## Benchmarks y rendimiento

| Prueba | Resultado | Notas |
|---|---|---|
| Episodios de desarrollo con inicio completo (muestreados) | 5/5 completados | Politica congelada, sin acciones del profesor ni restauraciones de estado |
| Comprobacion greedy | 1/1 completado | Politica congelada |
| Test de aceptacion original | no superado | El autor indica explicitamente que no ha pasado el 100/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. Los unicos datos de rendimiento son las comprobaciones de desarrollo descritas, que el propio autor califica de pequenas y no equivalentes al test de aceptacion.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se carga en CPU segun el ejemplo del autor (device="cpu").
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Cabe en GPU de consumo: no disponible como dato verificado, aunque el tamano del repositorio (0,0 GB) y la carga en CPU sugieren un modelo ligero.
- Opciones de despliegue: GradLabPPO.load sobre model.zip; torch.load(weights_only=True) sobre policy.pt; entorno GradLab registrado en runtime.json. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Nota: ni model.zip ni policy.pt contienen una ROM del juego; es necesario disponer del entorno GradLab correspondiente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperMarioBros-Nes-v0_Level1-3 (este) | Politica PPO + SFT (SB3/GradLab) | Super Mario Bros NES, nivel 1-3 | 4 frames 84x84 grises | no disponible | Hugging Face, revision sft-20261102 |
| Checkpoint PPO Q5 (origen) | Politica PPO | Super Mario Bros NES | 4 frames 84x84 grises | no disponible | Referenciado como punto de partida, no se detalla su publicacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no una politica final ni un Release promovido de GradLab.
- No ha superado el test de aceptacion original de 100/100; las comprobaciones de desarrollo (5/5 y 1/1) son muestras pequenas.
- La robustez general no esta demostrada.
- La entropia de los estados del profesor es muy baja, lo que puede limitar la generalizacion de la politica imitada.
- El SFT modifico el encoder compartido pero conservo los pesos de la cabeza de valor; hay que comprobar la calibracion del critico y la alineacion de recompensa/descuento antes de continuar con PPO.
- El contador de timesteps PPO heredado no incluye las actualizaciones de SFT, lo que puede inducir a error al interpretar el progreso del entrenamiento.
- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita.
- No contiene ROM del juego; su uso requiere el entorno GradLab adecuado.
- Sesgos conocidos y riesgo de alucinacion: no aplica en el sentido habitual de modelos generativos; el riesgo equivalente es el sobreajuste a una unica ruta de Go-Explore.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level1-3
- Descarga con revision: hf download tsilva/SuperMarioBros-Nes-v0_Level1-3 --revision sft-20261102 --local-dir mario-sft
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3 (referencia de la libreria; no enlazado en la model card)
- GradLab: no disponible (proyecto referenciado en la model card sin URL)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
