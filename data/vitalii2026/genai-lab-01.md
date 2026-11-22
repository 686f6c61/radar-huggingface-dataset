# Vitalii2026/genai-lab-01

## Resumen

`Vitalii2026/genai-lab-01` es un repositorio publicado en Hugging Face que, segun su model card, corresponde a la practica 1 de la asignatura "Modelos y metodos de inteligencia artificial generativa". No se trata de un modelo entrenado por el autor, sino de un contenedor de artefactos y resultados de laboratorio: el propio README indica que el texto se genera con `HuggingFaceH4/zephyr-7b-beta` y las imagenes con `stable-diffusion-v1-5` y `stabilityai/sd-turbo`. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere que solo contiene documentacion y capturas, sin pesos de modelo.

El pipeline declarado en la ficha de Hugging Face es `text-generation`, pero esta etiqueta no describe un modelo propio: el autor no publica pesos, tokenizador ni configuracion de inferencia. Las etiquetas `stable-diffusion`, `text-generation` y `coursework` reflejan el contenido del trabajo academico, no una arquitectura concreta implementada en el repositorio.

Por tanto, esta ficha documenta un artefacto educativo y no un modelo desplegable. Cualquier evaluacion tecnica de arquitectura, parametros, contexto o rendimiento debe remitirse a los modelos de terceros citados (`zephyr-7b-beta`, `stable-diffusion-v1-5`, `sd-turbo`), cuyas fichas oficiales si contienen especificaciones completas. El valor del repositorio es reproducible como ejemplo de entorno local de generacion con una GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; el README cita `HuggingFaceH4/zephyr-7b-beta` para texto y `stable-diffusion-v1-5` / `stabilityai/sd-turbo` para imagen) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB; solo documentacion e imagenes en `assets/`) |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna arquitectura propia ni proceso de entrenamiento. El model card describe un entorno de laboratorio ejecutado en un PC local con una NVIDIA GeForce RTX 5060 Ti y `torch 2.11.0+cu128`. La parte de texto se delega en `HuggingFaceH4/zephyr-7b-beta`, un modelo de terceros, y la parte de imagen en dos checkpoint de difusion: `stable-diffusion-v1-5` y `stabilityai/sd-turbo`.

El unico contenido tecnico medible son los tiempos de inferencia de difusion reportados en el README: SD 1.5 con 30 pasos y guidance 7.5 tarda 2.40 s; SD 1.5 con 10 pasos y guidance 7.5 tarda 0.94 s; SD Turbo con 1 paso y guidance 0.0 tarda 0.15 s. No se indica resolucion de salida, precision numerica (fp16/bf16), scheduler ni tamano de lote, por lo que estos datos no son directamente comparables con otros benchmarks.

No hay informacion sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones tecnicas. El repositorio es, en la practica, un cuaderno de resultados con capturas (`lab_sd15.png`, `styles_grid.png`, `steps_grid.png`) y una tabla de tiempos.

## Capacidades

- Generacion de texto mediante un modelo de terceros (`zephyr-7b-beta`), segun indica el README; no se documentan capacidades propias.
- Generacion de imagenes mediante difusion (`stable-diffusion-v1-5` y `sd-turbo`), con ejemplos de estilos naive art y fotografia cinematografica.
- Ajuste de pasos de muestreo y guidance scale, con resultados comparados en la tabla del model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues; el model card esta redactado en ucraniano.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Docencia y practicas de IA generativa: el repositorio sirve como plantilla para montar un entorno local con PyTorch y CUDA en una GPU consumer, comparando modelos de texto y de difusion en la misma maquina.
- Comparacion de coste de muestreo en difusion: la tabla de tiempos permite ilustrar el compromiso entre numero de pasos y latencia (2.40 s con 30 pasos frente a 0.15 s con 1 paso en SD Turbo) en una RTX 5060 Ti.
- Evaluacion de estilos visuales: las capturas de `styles_grid.png` permiten mostrar como cambia la salida entre estilos naive art y fotografia cinematografica con el mismo prompt base.
- Reproduccion de entornos CUDA: la referencia a `torch 2.11.0+cu128` sirve como punto de partida para verificar compatibilidad de versiones en instalaciones locales.
- Generacion de texto asistida en laboratorio: el uso de `zephyr-7b-beta` permite practicar carga de modelos de 7B en memoria y generacion de textos de ejemplo.
- Material de portafolio academico: el repositorio documenta el proceso y los resultados de una practica, con lo que puede reutilizarse como evidencia de trabajo en cursos o evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento son los tiempos de inferencia de difusion recogidos en el README:

| Modelo | Pasos | Guidance | Tiempo (s) |
|---|---|---|---|
| SD 1.5 | 30 | 7.5 | 2.40 |
| SD 1.5 | 10 | 7.5 | 0.94 |
| SD Turbo | 1 | 0.0 | 0.15 |

No se especifican resolucion, precision ni hardware mas alla de la RTX 5060 Ti, por lo que estos valores no deben extrapolarse a otros entornos.

## Requisitos de hardware

- El README indica ejecucion en un PC local con NVIDIA GeForce RTX 5060 Ti y `torch 2.11.0+cu128`.
- VRAM estimada para inferencia: no disponible en el repositorio. Como referencia, `zephyr-7b-beta` en fp16 requiere aproximadamente 14-15 GB de VRAM, y SD 1.5 en fp16 alrededor de 4 GB; estos valores no los aporta el autor.
- GPU recomendadas: no disponibles. El unico dato es la RTX 5060 Ti usada en el laboratorio.
- Cabe en GPU consumer: si, segun el propio README, en una RTX 5060 Ti.
- Opciones de despliegue: no documentadas (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: solo los tiempos de difusion de la tabla anterior; no hay datos de generacion de texto.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo propio, por lo que no procede compararlo con alternativas de la misma categoria. Como referencia, los modelos efectivamente usados son `HuggingFaceH4/zephyr-7b-beta` (texto) y `stable-diffusion-v1-5` / `stabilityai/sd-turbo` (imagen), cuyas fichas oficiales contienen las comparativas pertinentes.

## Limitaciones y advertencias

- No contiene pesos de modelo: el tamano del repositorio es 0.0 GB y solo incluye documentacion e imagenes; no es desplegable como modelo.
- La etiqueta de pipeline `text-generation` no se corresponde con un modelo propio y puede inducir a error en busquedas.
- Licencia no disponible: no se puede verificar si el contenido es reutilizable ni con que condiciones.
- Idiomas no declarados: el model card esta en ucraniano y no se especifica cobertura multilingue.
- Los tiempos de inferencia dependen de hardware, resolucion y precision no documentados; no son reproducibles sin esos datos.
- Al delegar en modelos de terceros, hereda sus sesgos, riesgos de alucinacion y restricciones de licencia, que deben consultarse en las fichas originales.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-22) en los metadatos de Hugging Face; conviene verificar la vigencia de los datos antes de citarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vitalii2026/genai-lab-01
- Modelo de texto citado: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Modelo de difusion citado: https://huggingface.co/stable-diffusion-v1-5
- Modelo de difusion citado: https://huggingface.co/stabilityai/sd-turbo
