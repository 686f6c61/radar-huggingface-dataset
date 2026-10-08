# yuchen0187/RegressionPolicy-Pi0.5

## Resumen

RegressionPolicy-Pi0.5 es un checkpoint de política robótica publicado por el usuario yuchen0187 en Hugging Face, construido como ajuste fino del modelo `lerobot/pi05_libero_base`. Se distribuye en formato LeRobot e incorpora el modelo original, las configuraciones, los procesadores, las estadísticas de normalización y el tokenizador necesarios para su ejecución. Está etiquetado como un checkpoint "HT" para las cuatro suites de LIBERO, con la ruta `libero/checkpoint-30000/pretrained_model`.

El modelo pertenece a la familia de modelos Visión-Lenguaje-Acción (VLA) derivada de π0.5, la arquitectura presentada por Physical Intelligence que combina un backbone de visión-lenguaje con un experto de acciones y entrenamiento conjunto sobre datos heterogéneos. La licencia declarada es la de Gemma, lo que condiciona el uso comercial y obliga a respetar los Términos de Uso de Gemma y su Política de Usos Prohibidos.

Se trata de un artefacto de nicho orientado a la investigación en manipulación robótica y evaluación en el benchmark LIBERO, con cero descargas y cero "likes" en el momento de la consulta, y un tamaño de repositorio de 9,4 GB. No se dispone de información publicada sobre parámetros, contexto o rendimiento específico de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) basada en π0.5 (familia π0); backbone VLM con experto de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (no Apache-2.0) |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de la familia Visión-Lenguaje-Acción, en la que un backbone de visión-lenguaje procesa observaciones visuales e instrucciones en lenguaje natural y un componente específico genera acciones motoras continuas. Según el artículo de referencia (arXiv:2504.16054), π0.5 se construye sobre π0 y emplea co-entrenamiento sobre datos heterogéneos para mejorar la generalización fuera del laboratorio. Este checkpoint concreto parte de `lerobot/pi05_libero_base` y se ajusta para las cuatro suites de LIBERO.

La model card indica que se trata de un checkpoint "HT" guardado con `ht_df=2`, que corresponde a una articulación `nu=700` sobre 50x7 coordenadas de acción válidas, y que requiere un runtime de LeRobot compatible con HT. El paquete incluye configuraciones, procesadores, estadísticas de normalización y tokenizador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación en las cuatro suites del benchmark LIBERO a partir de observaciones visuales e instrucciones.
- Generación de acciones continuas en el espacio de coordenadas de acción definido por el checkpoint (`nu=700`, 50x7 coordenadas válidas).
- Condicionamiento por lenguaje natural heredado del backbone Visión-Lenguaje-Acción de la familia π0.5.
- Integración con el ecosistema LeRobot mediante el runtime HT-compatible indicado por el autor.
- Capacidades de tool calling, agentes, multilingüismo o modo de razonamiento: no disponibles para este checkpoint.

## Casos de uso

- Evaluación en el benchmark LIBERO: el checkpoint está diseñado específicamente para las cuatro suites de LIBERO, por lo que sirve como referencia reproducible en experimentos de manipulación comparada.
- Investigación en políticas VLA: permite estudiar la variante "HT-regression" frente a otras cabezas de política sobre un backbone π0.5 preentrenado.
- Reproducción de resultados de ajuste fino: al incluir configuraciones, procesadores y estadísticas de normalización, facilita repetir el pipeline de entrenamiento sobre `lerobot/pi05_libero_base`.
- Base para nuevos ajustes: puede actuar como punto de partida para adaptar la política a tareas de manipulación adicionales dentro del ecosistema LeRobot.
- Pruebas de despliegue en simuladores robóticos compatibles con LeRobot antes de trasladar políticas a hardware.
- Docencia y formación en robótica basada en aprendizaje: sirve como ejemplo práctico de política VLA ejecutable en un pipeline estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 9,4 GB, lo que da una cota inferior del peso en disco de los pesos y artefactos distribuidos.
- VRAM estimada para inferencia: no disponible de forma oficial; a partir del tamano del repositorio, una carga en precision completa requeriria del orden de 10-12 GB de VRAM, y cuantizada podria reducirse por debajo de ese umbral (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por el rango de memoria implicado, una GPU de 16 GB o superior (por ejemplo, RTX 4080/4090 o A100 40 GB) seria un punto de partida razonable para inferencia en precision completa.
- Compatibilidad con GPU de consumo: probable en GPUs de gama alta con 16-24 GB de VRAM, siempre que el runtime LeRobot HT-compatible lo permita; no confirmado.
- Opciones de despliegue: LeRobot con runtime HT-compatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RegressionPolicy-Pi0.5 | VLA (π0.5, ajuste LIBERO) | lerobot/pi05_libero_base | Gemma | safetensors (LeRobot) | Hugging Face |
| lerobot/pi05_libero_base | VLA (π0.5 base) | π0.5 | no disponible | safetensors (LeRobot) | Hugging Face |
| π0.5 (referencia) | VLA con co-entrenamiento heterogeneo | π0 | no disponible | no disponible | Articulo arXiv:2504.16054 |

## Limitaciones y advertencias

- Licencia Gemma: los pesos y el tokenizador estan sujetos a los Terminos de Uso de Gemma, incluida la Seccion 3.2 y la Politica de Usos Prohibidos. No estan licenciados bajo Apache-2.0.
- Restricciones comerciales derivadas de la licencia Gemma, heredadas de los componentes de Google (Gemma/PaliGemma), no de restricciones adicionales de los autores de RegressionPolicy.
- El modelo esta especializado en las cuatro suites de LIBERO y en un espacio de acciones concreto (`nu=700`, 50x7); su uso fuera de ese dominio no esta respaldado por la documentacion.
- Requiere un runtime LeRobot compatible con HT; otros runtimes pueden no cargar correctamente el checkpoint.
- Sin informacion publicada sobre sesgos, tasas de alucinacion o robustez fuera de distribucion.
- Repositorio sin descargas ni likes y con model card minima, por lo que no hay validacion de la comunidad ni metricas de rendimiento reportadas.
- Al ser un modelo de politica que emite acciones fisicas, cualquier despliegue en hardware real exige validacion en simulacion y protocolos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuchen0187/RegressionPolicy-Pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Perfil del autor: https://huggingface.co/yuchen0187
- Articulo π0.5: https://arxiv.org/pdf/2504.16054
