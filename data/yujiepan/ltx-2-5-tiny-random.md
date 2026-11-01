# yujiepan/ltx-2-5-tiny-random

## Resumen

`yujiepan/ltx-2-5-tiny-random` es un modelo de difusion reducido y con pesos inicializados de forma aleatoria, construido a partir de `Lightricks/LTX-2.5`. No es un modelo funcional para generacion real: es un artefacto de test y depuracion que reproduce la estructura de componentes del modelo original (transformer de difusion, text encoder, VAE de video y VAE de audio) con dimensiones drasticamente reducidas, de modo que el pipeline completo pueda ejecutarse en entornos sin GPU de gran capacidad.

El modelo mantiene el layout de pesos del pack original de ComfyUI: el fichero del transformer incorpora tambien los conectores de texto, y el fichero del text encoder lleva las proyecciones de conectores, dos proyectores de modalidad y los assets del tokenizer como tensores U8. El autor anade un `config.json` y un script `ltx2_loader.py` que permiten reconstruir los componentes de Diffusers a partir de los ficheros divididos, algo que el pack original no incluye.

Su relevancia es practica para desarrolladores que integran LTX-2.5 en pipelines de Diffusers o ComfyUI: permite validar la carga de componentes, el flujo de inferencia image-to-video con rama de audio y los contratos de forma de los tensores sin descargar los 70,12 GB del checkpoint completo. El repo ocupa 41,65 MB en cuatro ficheros safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con ramas de video y audio, text encoder Gemma-4, VAE de video y VAE de audio con vocoder |
| Parametros totales | 4,68M en BF16, 8,45K en F32 y 32,18M en U8 (assets de tokenizer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16 y tablas de modulacion en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 ficheros) |

## Arquitectura y entrenamiento

El modelo replica la topologia de LTX-2.5 con dimensiones reducidas. El transformer de video tiene 4 capas y anchura interna de 64 (frente a 48 capas y 4.096 del original), con 2 cabezas de dimension 32 (frente a 32 cabezas de 128). La rama de audio tiene anchura interna de 64, 2 cabezas de dimension 32 (frente a 2.048, 32 y 64). Las anchuras de cross-attention video/audio son 64/64. El text connector tiene 2 bloques y 4 registros, con factor de proyeccion de texto de 3 (capas mas uno). El text encoder consta de 2 capas, anchura 8 y dimension de cabeza 32, manteniendo una cabeza de atencion de anchura 32 sobre una anchura residual de 8 para preservar la dimension minima de cabeza.

El VAE de video conserva los mismos canales latentes (128) y patch size (4) que el original. El VAE de audio usa 8 canales latentes y 4 mel bins (frente a 64), y el vocoder tiene anchura oculta de 32 (frente a 1.024). Los pesos estan inicializados aleatoriamente: no ha habido entrenamiento, ajuste fino, RLHF ni DPO. El tokenizer embebido procede de la release `google/gemma-4-12b-it`, que comparte el vocabulario de 262.144 filas con LTX-2.5, ya que el tokenizer original reside en un fichero de 26 GB que no puede descargarse de forma aislada. El modelo ha sido generado con DeepSeek-V4.1-Flash segun la model card.

## Capacidades

- Generacion de video a partir de texto e imagen (pipeline `image-to-video`), con resoluciones y numero de frames configurables en la llamada.
- Decodificacion de la rama de audio en la misma pasada de inferencia, devolviendo frames y audio de forma conjunta.
- Carga mediante Diffusers a traves del script `ltx2_loader.py`, que mapea los ficheros divididos a componentes de Diffusers.
- Compatibilidad con el layout de pesos del pack de ComfyUI (transformer con conectores de texto embebidos, text encoder con proyectores y tokenizer).
- Control de escalas de guiado independientes para video y audio: `guidance_scale`, `stg_scale`, `modality_scale` y sus equivalentes `audio_*`.
- Capacidad de ejecucion en CPU o GPU de baja capacidad gracias a sus dimensiones reducidas.
- No dispone de capacidades reales de generacion: los pesos son aleatorios y las salidas carecen de coherencia semantica.

## Casos de uso

- Test de integracion de pipelines Diffusers: permite verificar que el codigo de carga, el mapeo de componentes y las firmas de llamada funcionan antes de pasar al checkpoint completo de LTX-2.5, reduciendo el ciclo de iteracion de minutos a segundos.
- Depuracion de formas de tensor: el ejemplo de la model card valida que `frames` tiene 5 dimensiones con batch 1 y que `audio` tiene forma `(1, 2)`, util para comprobar contratos de salida en tests unitarios.
- CI/CD de librerias de video generativo: al ocupar 41,65 MB, puede incluirse en suites de test automatizadas que se ejecutan en cada commit sin necesidad de almacenamiento ni GPU dedicada.
- Validacion de conversiones de formato: sirve para comprobar que un conversor de safetensors a otros formatos o un empaquetador para ComfyUI preserva la estructura de conectores, proyectores y assets U8.
- Pruebas de cuantizacion y offload: permite medir el comportamiento de estrategias de carga por capas, `device_map` y offload a CPU sobre una topologia identica a la del modelo grande pero con huella minima.
- Desarrollo de interfaces de usuario: un frontend de generacion video+audio puede probarse de extremo a extremo con latencias reales de inferencia, sin depender del modelo de produccion.
- Verificacion de reproducibilidad: con semilla fija y pesos aleatorios deterministas, sirve como referencia estable en tests de regresion de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16, dado que los pesos suman 41,65 MB y las activaciones son minimas (resolucion de 64x64 y 9 frames en el ejemplo).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o iGPU con memoria compartida.
- Opciones de despliegue: Diffusers con el loader incluido (`ltx2_loader.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles de forma oficial; el ejemplo de la model card ejecuta 2 pasos de inferencia con resolucion 64x64 y 9 frames, lo que sugiere tiempos de orden de segundos en CPU y de decimas de segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/ltx-2-5-tiny-random | 4,68M BF16 + 32,18M U8 | no disponible | image-to-video con audio | no disponible | HuggingFace (0 descargas) |
| Lightricks/LTX-2.5 | 35,03B BF16 en checkpoint | no disponible | image-to-video con audio | no disponible | HuggingFace |
| Otros tiny-random de difusion | variable | no disponible | test de pipelines | variable | HuggingFace |

La comparativa directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico referente claro es el modelo base, del que este repo difiere en tres ordenes de magnitud en numero de parametros y en un factor de aproximadamente 1.700 en tamano de pesos.

## Limitaciones y advertencias

- Los pesos estan inicializados aleatoriamente: el modelo no genera video ni audio coherente y no debe usarse en produccion ni en evaluaciones de calidad.
- No se ha entrenado con datos reales, por lo que no hay sesgos aprendidos, pero tampoco capacidades reales; cualquier resultado visual es ruido.
- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si se permite uso comercial; debe consultarse la licencia de `Lightricks/LTX-2.5` antes de cualquier uso derivado.
- El tokenizer embebido procede de `google/gemma-4-12b-it` y no del tokenizer original de LTX-2.5, aunque comparte vocabulario de 262.144 filas; puede haber diferencias en assets de procesamiento.
- El modelo depende de un script externo (`ltx2_loader.py`) para cargarse en Diffusers; no es cargable con `from_pretrained` estandar sin ese codigo.
- El layout de pesos esta acoplado al pack de ComfyUI, lo que puede romper la compatibilidad con futuras versiones de Diffusers o de la propia libreria de ComfyUI.
- No hay garantia de que la topologia reducida reproduzca fielmente el comportamiento numerico del modelo completo en casos limite (por ejemplo, con dimensiones de cabeza minimas).
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujiepan/ltx-2-5-tiny-random
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Tokenizer de referencia: https://huggingface.co/google/gemma-4-12b-it
- Script de creacion: `.meta/create_model.py` (dentro del repositorio)
- Estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
