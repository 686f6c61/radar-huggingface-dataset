# tianxiwei/pi05-piper-two-color-step6000

## Resumen

pi05-piper-two-color-step6000 es un ajuste fino (fine-tune) del modelo base pi0.5 de Physical Intelligence, especializado en una tarea de robótica concreta: la clasificación de bloques de dos colores (rojo y azul) en sus cajas correspondientes. Lo publica el usuario tianxiwei en Hugging Face bajo el pipeline de robótica y la librería piper, y se apoya en el ecosistema OpenPI de Physical Intelligence. No es un modelo de lenguaje generalista, sino una política visomotora (vision-language-action, VLA) que mapea observaciones multimodales a acciones de control de un brazo robótico.

El modelo se ha entrenado sobre 56 demostraciones del robot PiPER X que cubren las cuatro combinaciones posibles de bloques y cajas rojas y azules. La política consume dos cámaras RGB (externa y de muñeca) y siete valores de estado (seis ángulos articulares en radianes y la anchura del gripper en metros), y predice 50 pasos de acción a 30 Hz con acciones relativas a las articulaciones y anchura absoluta del gripper. El repositorio ocupa 7,2 GB e incluye pesos en formato JAX/Orbax, no safetensors ni GGUF.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de pi0.5 sobre un robot de bajo coste (PiPER) y un conjunto de datos propio, y como punto de partida para quien quiera adaptar políticas VLA a tareas de manipulación simples. La licencia derivada de Gemma impone restricciones de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5 (OpenPI), politica transformer multimodal con entrada de imagenes y estado proprioceptivo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observacion definida por el adaptador Libero) |
| Tipos de cuantizacion | no disponible (pesos JAX/Orbax, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, no orientado a texto) |
| Licencia | gemma-terms (Gemma Terms of Use), etiquetada como "other" en Hugging Face |
| Formato de pesos | JAX/Orbax (carpeta `params`), con estadisticas de normalizacion en `assets` y metadatos en `inference_metadata.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de pi0.5, la politica VLA de Physical Intelligence integrada en el framework OpenPI. La arquitectura subyacente combina un backbone derivado de Gemma con un cabezal de acciones que produce trayectorias de control; el modelo recibe dos flujos de imagen RGB (camara externa y de muñeca) y un vector de estado de siete dimensiones (seis angulos articulares en radianes mas anchura del gripper en metros). La salida son 50 pasos de accion a 30 Hz, con acciones relativas a las articulaciones y anchura absoluta del gripper.

El entrenamiento se realizo sobre 56 demostraciones del dataset `tianxiwei/piperx-two-color-block-sorting-improved`, que cubre las cuatro combinaciones de bloques y cajas rojas y azules. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de una politica de imitacion, lo habitual en este tipo de ajustes es aprendizaje por imitacion supervisado sobre demostraciones. El checkpoint corresponde al paso 6000. La configuracion de inferencia original emplea el adaptador de observacion Libero de OpenPI. No se incluye el estado del optimizador en el repositorio.

## Capacidades

- Control visomotor de un brazo robotico PiPER X para tareas de clasificacion de bloques por color.
- Percepcion multimodal: procesa simultaneamente una camara RGB externa y una camara RGB de muñeca.
- Entrada de estado proprioceptivo: seis angulos articulares en radianes y anchura del gripper en metros.
- Prediccion de trayectorias de accion: 50 pasos a 30 Hz con acciones relativas a las articulaciones y anchura absoluta del gripper.
- Generalizacion limitada a las cuatro combinaciones de bloques y cajas rojas y azules vistas en el dataset de entrenamiento.
- Integracion con el ecosistema OpenPI y el adaptador de observacion Libero para inferencia.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.

## Casos de uso

- Clasificacion automatizada de bloques por color en entornos de laboratorio: el modelo ejecuta la politica entrenada para depositar bloques rojos y azules en sus cajas correspondientes, usando las dos camaras para localizar objetos y el estado articular para controlar el brazo.
- Banco de pruebas para investigacion en VLA: sirve como referencia reproducible de como ajustar pi0.5 sobre un robot de bajo coste y un dataset pequeno (56 demostraciones), util para comparar metodologias de imitacion.
- Prototipado rapido de tareas pick-and-place: al predecir 50 pasos a 30 Hz, permite generar trayectorias suaves y continuas adecuadas para manipulacion de objetos pequenos.
- Validacion de pipelines OpenPI: el repositorio incluye estadisticas de normalizacion y metadatos de inferencia, lo que facilita probar el flujo completo de OpenPI con el adaptador Libero antes de escalar a tareas propias.
- Docencia y formacion en robotica: un caso acotado y bien definido (dos colores, cuatro combinaciones) que permite explicar el ciclo percepcion-accion de una politica VLA sin la complejidad de tareas abiertas.
- Punto de partida para ajustes posteriores: al estar publicado el checkpoint y el dataset, otros equipos pueden reutilizarlo como inicializacion para tareas de sorting mas complejas con el mismo robot PiPER X.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 7,2 GB en pesos JAX/Orbax, por lo que se necesita al menos esa cantidad de memoria mas el overhead de inferencia (no cuantificado en la informacion disponible).
- GPU recomendadas: no especificadas por el autor. Para modelos VLA de este tamano suele ser habitual una GPU con 24 GB o mas (RTX 4090, A100, H100), pero no hay dato confirmado.
- Compatibilidad con GPU de consumo: no confirmada; depende del framework OpenPI y del backend JAX, no de llama.cpp ni Ollama.
- Opciones de despliegue: OpenPI (framework oficial de Physical Intelligence) con el adaptador de observacion Libero; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La politica predice 50 pasos a 30 Hz, lo que implica una frecuencia de control de 30 Hz una vez cargado el modelo, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-piper-two-color-step6000 | no disponible | no aplica | Sorting de bloques rojo/azul con PiPER X | gemma-terms | Hugging Face (tianxiwei) |
| pi0.5 base (Physical Intelligence) | no disponible | no aplica | Politica VLA generalista | no disponible en la informacion | OpenPI / Physical Intelligence |
| Otros fine-tunes de pi0.5 en OpenPI | no disponible | no aplica | Tareas de manipulacion diversas | segun autor | Hugging Face (comunidad) |

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base pi0.5 en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo ha visto bloques y cajas rojas y azules en cuatro combinaciones; es probable que falle ante colores, formas u objetos no vistos durante el entrenamiento.
- Riesgo de alucinacion: en el contexto VLA, el equivalente es generar trayectorias plausibles pero incorrectas cuando la escena difiere de las demostraciones; con solo 56 demostraciones el riesgo de sobreajuste es alto.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto textual; no procesa lenguaje natural ni soporta instrucciones verbales.
- Restricciones de licencia: los pesos derivados de Gemma estan sujetos a los Gemma Terms of Use, que incluyen restricciones de uso; es obligatorio revisar `LICENSE_GEMMA.txt` y `NOTICE` antes de cualquier uso comercial o redistribucion.
- Caveat para produccion: el checkpoint corresponde al paso 6000 de un entrenamiento con un dataset muy pequeno; no hay evidencia publicada de robustez, tasas de exito ni evaluaciones independientes.
- No se incluye el estado del optimizador, por lo que reanudar el entrenamiento exactamente desde este punto no es posible con los archivos publicados.
- El repositorio no incluye versiones cuantizadas ni formatos alternativos de pesos, lo que limita el despliegue fuera del stack JAX/OpenPI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tianxiwei/pi05-piper-two-color-step6000
- Dataset de entrenamiento: https://huggingface.co/datasets/tianxiwei/piperx-two-color-block-sorting-improved
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
