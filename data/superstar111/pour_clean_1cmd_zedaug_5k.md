# Superstar111/pour_clean_1cmd_zedaug_5k

## Resumen

`pour_clean_1cmd_zedaug_5k` es un checkpoint de un modelo vision-language-action (VLA) de tipo π0.5, afinado con el framework openpi de Physical Intelligence para una tarea robotica concreta: coger una cuchara, recoger garbanzos y verterlos en una olla. El modelo controla un brazo YAM Ultra 2 con una mano Sharpa Wave de 28 articulaciones, y recibe una unica instruccion en lenguaje natural para todo el episodio. Lo publica el usuario `Superstar111` en Hugging Face y esta entrenado exclusivamente en simulacion.

Se trata de un fine-tune completo desde la base π0.5, con 17.000 pasos planificados (coseno, batch 64) sobre 300 trayectorias simuladas. Este repositorio contiene los pesos EMA del paso 5.000, no el modelo final. La relevancia es acotada: es un artefacto de investigacion para reproducir un pipeline de entrenamiento VLA en simulacion, no un modelo listo para produccion. El autor indica explicitamente que no se ha evaluado ni en simulacion ni en robot real.

La ficha se basa unicamente en la model card y los metadatos disponibles. No hay informacion sobre licencia, idiomas soportados ni resultados de benchmarks, y el modelo no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, fine-tune completo desde la base pi0.5 con openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (la instruccion de entrenamiento esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | checkpoint openpi (`params/` y estadisticas de normalizacion en `assets/local/pour_clean_zed_n300/`); bundle con `openpi_src.tar.gz`, `openpi_data.tar.gz`, `serve_vla.sh`, `golden.py`, `golden.npz` y sumas sha256 |
| Tamano del repo | 12,4 GB |
| Entradas | Tres vistas de camara: head, wrist y cam1 |
| Salidas | Acciones de control para brazo YAM Ultra 2 + mano Sharpa Wave (28 articulaciones) |
| Hardware de entrenamiento | 2 x NVIDIA H200 (data parallel, 32 por GPU) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de π0.5, la familia de politicas VLA de Physical Intelligence, gestionado con openpi en el commit `cbad60bbd1ac50c471e204bdfff1b87d53f29290` y la configuracion `pi05_maggie_2skill_hcw_openpiaug`. La politica toma tres vistas de camara (head, wrist, cam1) y una instruccion textual, y emite acciones para un brazo de 28 articulaciones con mano antropomorfica. No se detalla en la model card la arquitectura interna (transformer, atencion, etc.) mas alla de la referencia a π0.5.

El entrenamiento usa 300 trayectorias simuladas (99.623 filas tras el filtro de inactividad del packer), procedentes de la sesion `clean-stanford-d` del 25 de noviembre de 2026, cada episodio cortado al final del vertido. Se aplica la aumentacion de imagen por defecto de openpi: color jitter (brillo, contraste, saturacion) en todas las vistas y recorte aleatorio del 95 % con rotacion de hasta 5 grados en la vista head, con una unica tirada aleatoria para todas las vistas. El entrenamiento usa batch 64, 17.000 pasos con schedule coseno (pico 5e-5 a 5e-6, warmup 500), EMA 0.999, semilla 43 y estadisticas de normalizacion calculadas sobre este dataset. La perdida pasa de 0,4988 en el primer paso registrado a 0,0031 en el paso 5.000. En ese punto las filas se han visto 3,21 veces.

La novedad respecto al checkpoint anterior (`Superstar111/pour_clean_1cmd`) es el uso del modelo 3D oficial de la camara ZED Mini de Stereolabs como camara de muneca en la escena de simulacion, sustituyendo un dibujo previo que era 4 mm demasiado alto y tenia las lentes mal colocadas. Las tres vistas se re-renderizaron desde las mismas articulaciones y poses de objeto, con el renderer de entrenamiento. Las trayectorias se simularon con la forma de colision y masa de la camara anterior.

## Capacidades

- Control robotico de una tarea compuesta: coger la cuchara, recoger garbanzos y verterlos en la olla, en un unico episodio.
- Seguimiento de una instruccion en lenguaje natural fija: "pick up the spoon, scoop the beans and pour them into the pot".
- Percepcion multimodal con tres vistas de camara (head, wrist, cam1) como entrada.
- Generacion de acciones continuas para brazo YAM Ultra 2 y mano Sharpa Wave de 28 articulaciones.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso general, vision general, audio ni modo thinking.
- No se documentan capacidades multilingues; la unica instruccion de entrenamiento esta en ingles.

## Casos de uso

- Reproduccion de un pipeline de fine-tune VLA en simulacion: el bundle incluye el codigo fuente de openpi, el tokenizer, el script de servicio (`serve_vla.sh`) y un test de humo (`golden.py`) para verificar que el servidor responde dentro de 0,002362 rad de las respuestas del cluster de entrenamiento (tolerancia 0,005 rad). Adecuado para validar infraestructura de entrenamiento e inferencia.
- Investigacion en manipulacion robotica compuesta: sirve como punto de partida para estudiar como una unica instruccion puede descomponerse en tres habilidades secuenciales (coger, recoger, verter) con una mano antropomorfica.
- Estudio de aumentacion de datos sinteticos: la configuracion aplica color jitter y recorte aleatorio del 95 % con rotacion de hasta 5 grados; util para analizar el efecto de la aumentacion de openpi en politicas VLA.
- Benchmark interno de serving VLA: el script `serve_vla.sh` levanta un servidor en el puerto 8000 con unos 10 GB libres de GPU NVIDIA; util para medir latencia y throughput de un endpoint VLA en un entorno controlado.
- Base para fine-tunes posteriores: al ser un checkpoint intermedio (paso 5.000 de 17.000), puede emplearse como inicializacion para experimentos con mas datos o para comparar con el checkpoint final de la misma ejecucion.
- Validacion de calibracion de camara: el autor documenta que la muneca simulada queda unos 7 px (de 284) desplazada respecto a la real en los frames del 23 y 27 de noviembre; util para estudiar el impacto del error de calibracion en el exito de la politica.
- No se recomienda su uso en produccion ni en robot real sin supervision: el propio autor pide ejecutarlo con una persona en el paro de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no se ha evaluado ni en simulacion ni en robot real. La unica metrica publicada es la perdida de entrenamiento (0,4988 en el primer paso registrado, 0,0031 en el paso 5.000) y el test de humo del servidor (12 consultas grabadas respondidas dentro de 0,002362 rad de las respuestas del cluster de entrenamiento, tolerancia 0,005 rad).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el autor indica que el servidor de inferencia necesita una GPU NVIDIA con unos 10 GB libres.
- GPU de entrenamiento: 2 x NVIDIA H200 (data parallel, 32 por GPU, batch 64).
- GPU recomendadas para inferencia: cualquier NVIDIA con al menos 10 GB libres, segun el autor; no se especifican modelos concretos (A100, H100, RTX 4090) en la model card.
- Cabe en GPU de consumo: probablemente si, dado el requisito de unos 10 GB libres, pero no se confirma en la informacion disponible.
- Opciones de despliegue: servidor propio de openpi mediante `serve_vla.sh` (puerto 8000), que requiere `uv` y construye el entorno de openpi en la primera ejecucion. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no compara con otros modelos y no se dispone de datos de benchmarks que permitan una comparacion rigurosa con alternativas de la misma categoria (otros checkpoints π0.5 o VLA para manipulacion).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pour_clean_1cmd_zedaug_5k` | no disponible | no disponible | sin evaluar | no disponible | Hugging Face, 0 descargas |
| `Superstar111/pour_clean_1cmd` | no disponible | no disponible | sin evaluar | no disponible | Hugging Face |
| `Superstar111/stir_clean_1cmd` | no disponible | no disponible | sin evaluar | no disponible | Hugging Face |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara explicitamente que no se ha evaluado ni en simulacion ni en robot real. No hay evidencia publica de exito en la tarea.
- Checkpoint intermedio: este repositorio contiene los pesos EMA del paso 5.000 de 17.000, no el modelo final de la ejecucion.
- Entrenado solo en simulacion: las trayectorias se generaron en simulador y los resultados no garantizan transferencia al robot real.
- Desalineacion de calibracion: la muneca simulada queda unos 7 px (de 284) desplazada respecto a la real en los frames del 23 y 27 de noviembre, y la pose de la camara de muneca proviene del modelo oficial en la ranura del soporte, no de una calibracion.
- Montaje de la mano: entrenado con el montaje girado; el autor advierte de no aplicar la conversion de la articulacion 6 de los cinco checkpoints anteriores.
- Riesgo de seguridad: el autor pide ejecutarlo con una persona en el paro de emergencia.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: la unica instruccion documentada esta en ingles; no se garantiza el comportamiento con instrucciones en castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser una politica de control, el fallo se manifiesta como acciones incorrectas, no como texto.
- Sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pour_clean_1cmd_zedaug_5k
- Checkpoint previo: https://huggingface.co/Superstar111/pour_clean_1cmd
- Modelo de la tarea de remover: https://huggingface.co/Superstar111/stir_clean_1cmd
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Commit de openpi usado en el entrenamiento: `cbad60bbd1ac50c471e204bdfff1b87d53f29290`
- PR de dextool referenciado (formato de peticion/respuesta): dextool PR #11
- Escena de simulacion dextool: commit `1f403e4`
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
