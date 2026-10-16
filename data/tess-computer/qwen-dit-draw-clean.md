# TESS-Computer/qwen-dit-draw-clean

## Resumen

Qwen-DiT-Draw es un modelo de prediccion de trayectorias desarrollado por TESS-Computer. Se trata de un sistema hibrido que combina un modelo de vision-lenguaje (VLM) congelado, Qwen2.5-VL-3B-Instruct, con una cabeza Diffusion Transformer (DiT) entrenable de 36,7 millones de parametros. Dado un lienzo de imagen y una instruccion en lenguaje natural, el modelo genera secuencias de puntos (x, y) que representan trazos de dibujo, junto con una senal de parada.

El modelo resuelve el problema de traducir intenciones expresadas en lenguaje natural a trayectorias de accion continuas, un paso intermedio habitual en robtica de manipulacion y en sistemas de dibujo automatizado. La cabeza DiT se entrena mediante *flow matching* siguiendo un esquema de prediccion por fragmentos (*chunks*) al estilo GR00T, con 16 puntos por fragmento, lo que permite generar dibujos completos encadenando varios fragmentos mediante un bucle de retroalimentacion visual.

Su relevancia actual reside en el enfoque de bajo coste computacional: al congelar un backbone VLM ya preentrenado de 3.000 millones de parametros y entrenar unicamente una cabeza de 36,7M, se reduce drasticamente el coste de entrenamiento (dos epocas en una H100 de Modal) y se reutiliza el conocimiento visual-linguistico del VLM. El repositorio ocupa solo 0,1 GB, ya que unicamente distribuye los pesos de la cabeza entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone VLM Qwen2.5-VL-3B congelado + cabeza Diffusion Transformer (DiT) entrenable con flow matching |
| Parametros totales | ~3.040 millones (3.000 M del backbone congelado + 36,7 M de la cabeza DiT) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (determinada por el backbone Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`trajectory_head.pt`, state dict de la cabeza DiT); el backbone se carga por separado desde Qwen/Qwen2.5-VL-3B-Instruct |

## Arquitectura y entrenamiento

La arquitectura sigue un patron de dos componentes. El primero es un backbone de vision-lenguaje Qwen2.5-VL-3B-Instruct que permanece congelado durante todo el entrenamiento y se encarga de codificar conjuntamente la imagen de entrada (el lienzo) y la instruccion textual. El segundo es una cabeza Diffusion Transformer entrenable de 36,7 millones de parametros, configurada con `chunk_size=16`, `dit_hidden_size=512` y `dit_num_layers=6`. Esta cabeza genera fragmentos de 16 puntos de trayectoria en formato (x, y, state), donde un valor de `state` superior a 0,5 actua como senal de parada.

El entrenamiento emplea una perdida de *flow matching* y sigue un esquema de prediccion por fragmentos al estilo GR00T. Se realizo durante dos epocas sobre una H100 en la plataforma Modal. El conjunto de datos utilizado es `TESS-Computer/quickdraw-circles-clean`, compuesto por aproximadamente 21.000 dibujos de circulos, lo que implica un entrenamiento muy acotado a un unico tipo de trazo (circulos) sobre lienzo blanco.

La generacion de dibujos completos requiere un bucle de inferencia multi-fragmento: en cada iteracion se rasteriza el fragmento predicho sobre el lienzo (con lineas negras, para coincidir con las condiciones de entrenamiento) y se vuelve a alimentar el modelo con el lienzo actualizado. El autor recomienda un maximo de 10 fragmentos por dibujo.

## Capacidades

- Prediccion de trayectorias de dibujo a partir de imagen y texto: genera secuencias de puntos (x, y) con senal de parada por punto.
- Entrada multimodal: acepta simultaneamente un lienzo de imagen y una instruccion textual en lenguaje natural.
- Generacion por fragmentos: produce bloques de 16 puntos y permite encadenar hasta 10 fragmentos con retroalimentacion visual para completar un dibujo.
- Senal de terminacion integrada: el canal `state` (umbral > 0,5) indica cuando detener el trazo sin necesidad de un clasificador externo.
- Inferencia en una sola pasada por fragmento (`predict_chunk`), con soporte de `torch.no_grad` y ejecucion en CUDA.
- Capacidad de produce trazos de tipo circulo sobre lienzo blanco, que es el unico dominio cubierto por los datos de entrenamiento.
- Etiquetado con categorias propias de robtica (`robotics`) y prediccion de trayectorias (`trajectory-prediction`), lo que sugiere su orientacion a control de actuadores.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los ejemplos de la model card estan en ingles).
- Vision, audio u otros modos especiales: dispone de vision (lienzo de imagen); audio no disponible.

## Casos de uso

- Control de robots de dibujo o plotters: el modelo puede traducir una instruccion como "dibuja un circulo" en una trayectoria de puntos que un brazo robotico o plotter puede ejecutar directamente, evitando la necesidad de programar las coordenadas a mano.
- Trazado en pizarras digitales y aplicaciones de sketching: integrado en un lienzo interactivo, permite que el usuario describa con texto lo que quiere dibujar y el modelo proponga los trazos correspondientes.
- Investigacion en robtica de manipulacion: la arquitectura (VLM congelado + cabeza de accion DiT con flow matching) sirve como plantilla reproducible para experimentar con prediccion de acciones a bajo coste, sustituyendo el dataset de circulos por trayectorias de manipulacion reales.
- Generacion de trayectorias de calibracion: en entornos de fabricacion, se pueden generar trayectorias de circulos para pruebas de precision de maquinaria o de sistemas de vision, dado que el modelo esta especializado exactamente en ese trazo.
- Prototipado de pipelines de accion condicionada por lenguaje: util para validar el flujo completo (tokenizacion multimodal, prediccion por fragmentos, rasterizacion en bucle cerrado) antes de escalar a dominios mas complejos.
- Benchmark interno de arquitecturas VLM+DiT: permite comparar el rendimiento de una cabeza DiT de 36,7M frente a alternativas de decodificacion discreta o regresion directa en una tarea acotada y reproducible.
- Educacion y demostraciones: el repositorio es ligero (0,1 GB) y el coste de inferencia bajo, lo que facilita su uso en entornos docentes o demos interactivas sin infraestructura GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de error de trayectoria como ADE o FDE), ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en bfloat16 para el modelo completo (backbone de 3.000 M + cabeza de 36,7 M); en cuantizacion INT4 se reduciria a unos 2-3 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: el modelo se entreno en H100; para inferencia son suficientes GPU con al menos 8-12 GB de VRAM. Cualquier GPU NVIDIA moderna de gama media-alta es suficiente.
- Compatibilidad con GPU de consumo: si. Cabe holgadamente en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB podria requerir cuantizacion o carga por capas.
- Opciones de despliegue: la model card solo documenta el uso con `transformers`, `qwen_vl_utils` y codigo propio (`src/model.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato de pesos (`.pt` de una cabeza sobre un backbone aparte) no es directamente compatible con esos motores sin adaptacion.
- Latencia y throughput estimados: no disponible. Se sabe que la generacion de un dibujo completo requiere varios fragmentos (hasta 10), cada uno de los cuales implica una pasada completa por el VLM congelado, lo que puede dominar el coste total.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-DiT-Draw (TESS-Computer/qwen-dit-draw-clean) | ~3.040 M (3.000 M congelados + 36,7 M entrenables) | no disponible | apache-2.0 | VLM + cabeza DiT para trayectorias de dibujo | HuggingFace, 0 descargas |
| Qwen2.5-VL-3B-Instruct (modelo base) | 3.000 M | no disponible en la informacion proporcionada | apache-2.0 | VLM generalista (vision-lenguaje) | HuggingFace (modelo ampliamente utilizado) |
| GR00T (referencia arquitectonica citada por el autor) | no disponible | no disponible | no disponible | Prediccion de acciones por fragmentos para robtica | no disponible |

La comparativa con otros modelos especificos de prediccion de trayectorias (por ejemplo, propuestas equivalentes de VLM + cabeza de accion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio de entrenamiento extremadamente estrecho: el modelo solo se entreno con unos 21.000 dibujos de circulos sobre lienzo blanco. Es muy probable que no generalice a otras formas, trazos o estilos fuera de ese dominio.
- Riesgo de alucinacion y de trayectorias degeneradas: al ser un modelo generativo de trayectorias, puede producir puntos incoherentes o no alcanzar correctamente la senal de parada, especialmente fuera de la distribucion de entrenamiento.
- Condiciones de entrada estrictas: el bucle de inferencia multi-fragmento exige dibujar con lineas negras y un rango de pixeles concreto (`min_pixels=200704`, `max_pixels=401408`). Desviarse de estas condiciones puede degradar la calidad.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos.
- Idiomas: no disponible. No se especifica soporte multilingue; los ejemplos estan en ingles.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial y modificacion. Conviene verificar tambien la licencia del modelo base Qwen2.5-VL-3B-Instruct, aunque este tambien es apache-2.0.
- Caveat para produccion: el repositorio solo contiene la cabeza entrenada (`trajectory_head.pt`, 0,1 GB) y depende de codigo propio (`src/model.py`) no incluido en el repositorio, del backbone descargado por separado y de la libreria `qwen_vl_utils`. Esto complica la reproducibilidad y el empaquetado para produccion.
- Metricas ausentes: sin benchmarks publicados, no es posible estimar de forma objetiva su calidad frente a alternativas.
- Uso en robtica real: no hay evidencia de validacion en hardware fisico; el autor no reporta experimentos de despliegue en robots.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TESS-Computer/qwen-dit-draw-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/TESS-Computer/quickdraw-circles-clean
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct

Nota sobre la busqueda web: los resultados devueltos (TESS Transiting Exoplanet Survey Satellite, T/E/S/S atelier d'ingenierie, TESS Norway, Tess Barthelemy y la base de datos de marcas de la USPTO) no guardan relacion con este modelo y no aportan informacion tecnica adicional.
