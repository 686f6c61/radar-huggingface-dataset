# tiny-random/ltx-2-5

## Resumen

`tiny-random/ltx-2-5` es un modelo de difusion de video (image-to-video y text-to-video) con pesos inicializados aleatoriamente, derivado de `Lightricks/LTX-2.5`. No es un modelo funcional para produccion: es un artefacto de test y depuracion que reproduce la estructura de componentes del modelo original (transformer de video, text encoder, VAE de video y VAE de audio) con dimensiones drasticamente reducidas. Lo publica el usuario `tiny-random`, una cuenta orientada a generar versiones minimas de modelos para validar pipelines de `diffusers` sin descargar decenas de gigabytes.

El interes practico esta en que conserva el layout de particion de LTX-2.5 (checkpoints divididos en ficheros de transformer, text encoder y VAEs, con los conectores de texto embebidos en el transformer y las proyecciones de modalidad en el text encoder), ademas de anadir un `config.json` y un script `ltx2_loader.py` que permiten reconstruir los componentes de `diffusers`. Esto lo convierte en una herramienta util para verificar integraciones, CI y scripts de carga del pipeline LTX-2.5 real sin coste de almacenamiento ni de computo.

El modelo original, LTX-2.5 de Lightricks, es un modelo de generacion conjunta de video y audio con arquitectura de difusion, alrededor de 35.000 millones de parametros en BF16 y una anchura interna de video de 4.096. La version tiny reduce el transformer a 4 capas y anchura 64, y el text encoder a 2 capas y anchura 8, manteniendo el vocabulario del tokenizer de 262.144 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (transformer de video con rama de audio y text encoder tipo Gemma) |
| Parametros totales | No disponible de forma agregada; el repo ocupa 41,65 MB en 4 ficheros safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos almacenados en BF16 y tablas de modulacion en FP32; no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 ficheros) mas `config.json` y `ltx2_loader.py` |

## Arquitectura y entrenamiento

El modelo replica la topologia de LTX-2.5 en version reducida. El transformer de video tiene 4 capas y anchura interna de 64 (frente a 48 capas y 4.096 en el original), con 2 cabezas de atencion de dimension 32 (frente a 32 cabezas de 128). La rama de audio usa anchura interna de 64, 2 cabezas y dimension de cabeza 32 (el original emplea 2.048, 32 y 64). La anchura de cross-attention video/audio es 64/64 en esta version frente a 4.096/2.048 en el modelo completo. El text connector tiene 2 bloques y 4 registros (frente a 8 y 128), y el factor de proyeccion de texto es 3 (frente a 49).

El text encoder es una version minima de Gemma con 2 capas, anchura 8 y dimension de cabeza 32, manteniendo una cabeza de atencion de 32 sobre una anchura residual de 8 para preservar la dimension minima de cabeza. Los VAE conservan los canales latentes del original: 128 canales y patch size 4 en el VAE de video, y 8 canales latentes con 4 bins mel en el VAE de audio (frente a 64 en el original). El vocoder tiene anchura oculta de 32 frente a 1.024.

No hay entrenamiento real: los pesos son aleatorios. El tokenizer y los assets de procesamiento se toman de la release fijada `google/gemma-4-12b-it`, que comparte el vocabulario de 262.144 filas con el tokenizer de LTX-2.5, ya que este ultimo esta embebido en un fichero de 26 GB que no se puede descargar por separado. El tokenizer embebido ocupa 32,17 MB, lo que supone el suelo de tamano del fichero de text encoder; el resto de pesos no-tokenizer suma unos 9,5 MB.

## Capacidades

- Generacion de video a partir de texto e imagen en el pipeline de `diffusers`, con resoluciones y numero de frames arbitrarios en la API (el ejemplo oficial usa 64x64 y 9 frames).
- Decodificacion de la rama de audio en paralelo al video, devolviendo un tensor de audio estereo junto a los frames.
- Carga mediante el script `ltx2_loader.py`, que mapea los ficheros divididos a componentes de `diffusers`.
- Verificacion de integridad del pipeline: el ejemplo comprueba formas de tensores y finitud de los valores generados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusion, no un LLM.
- Capacidades multilingues: no disponibles; el comportamiento linguistico depende del tokenizer de Gemma y de pesos aleatorios, por lo que no es evaluable.
- No dispone de modo thinking, vision ni otras capacidades especiales mas alla del pipeline image-to-video/text-to-video con audio.

## Casos de uso

- Test de integracion en CI: ejecutar el pipeline completo de LTX-2.5 en un runner con poca memoria para validar que los scripts de carga, las firmas de la API y las formas de salida no se rompen tras actualizar `diffusers`.
- Desarrollo de wrappers y loaders: permite iterar sobre `ltx2_loader.py` y sobre el mapeo de ficheros divididos (transformer con conectores, text encoder con proyecciones, VAEs) sin descargar 70 GB de pesos.
- Validacion de pipelines de audio-video: comprobar que la rama de audio se decodifica y devuelve un tensor de forma `(1, 2, ...)` junto a los frames, util para tests de regresion de la API de salida.
- Pruebas de compatibilidad de hardware y software: verificar que un entorno concreto (version de PyTorch, CUDA, drivers) puede instanciar y ejecutar el pipeline antes de lanzar trabajos con el modelo real.
- Docencia y demos de arquitectura: inspeccionar la estructura de un modelo de difusion video+audio con ramas separadas y cross-attention entre modalidades en un repositorio de 41 MB.
- Benchmarking de overhead de carga: medir tiempos de inicializacion, transferencia a GPU y compilacion de grafo del pipeline sin que el coste dominante sea la carga de pesos.
- Depuracion de formas y dimensiones: al tener dimensiones conocidas y pequenas (4 capas, anchura 64), es facil aislar errores de broadcasting o de reshape en el codigo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (FVD, FID, CLIP score, sincronizacion audio-video) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repo completo ocupa 41,65 MB en disco y los tensores en BF16/FP32 son del orden de decenas de MB, por lo que cabe en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU; el ejemplo oficial usa 64x64 y 9 frames con 2 pasos de inferencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU con soporte CUDA de las ultimas generaciones.
- Opciones de despliegue: `diffusers` con el loader incluido (`ltx2_loader.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la resolucion, pero al ser un modelo minimo los tiempos seran dominados por el overhead de Python y de los kernels, no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-random/ltx-2-5` | Reducido (41,65 MB en safetensors) | 64x64, 9 frames en el ejemplo | Sin benchmarks (pesos aleatorios) | No disponible | Hugging Face, `diffusers` |
| `Lightricks/LTX-2.5` | ~35,03B en BF16 (checkpoint original) | Anchura de video 4.096, 48 capas | No disponible en la informacion proporcionada | No disponible | Hugging Face, `diffusers` |
| Otros modelos tiny-random de `diffusers` | Variable, del orden de MB | Variable | Sin benchmarks (pesos aleatorios) | Habitualmente la del modelo base | Hugging Face |

La comparativa relevante es con el modelo base: esta version conserva la interfaz y el layout de ficheros, pero reduce el transformer de 48 a 4 capas y de anchura 4.096 a 64, y el text encoder de 48 a 2 capas y de anchura 3.840 a 8. No es un sustituto funcional de LTX-2.5 en ningun caso de produccion.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera video ni audio coherente; su unica utilidad es estructural y de test.
- No es apto para produccion, demos publicas ni evaluacion de calidad.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `Lightricks/LTX-2.5`.
- El tokenizer y los assets de procesamiento provienen de `google/gemma-4-12b-it`, no del tokenizer original de LTX-2.5; pueden existir diferencias sutiles en el preprocesado de texto.
- El text encoder mantiene una cabeza de atencion de 32 sobre anchura residual de 8, una configuracion forzada para respetar la dimension minima de cabeza; no refleja exactamente las proporciones del original.
- El VAE de audio usa 4 bins mel frente a 64 del original, por lo que la salida de audio no es representativa de la calidad ni de la distribucion del modelo completo.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no ha sido entrenado ni evaluado.
- El repositorio se genero con un modelo (`DeepSeek-V4.1-Flash`) y esta pensado para depuracion; no debe citarse como referencia de arquitectura de LTX-2.5 sin contrastar con la model card oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/ltx-2-5
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Tokenizer de referencia: https://huggingface.co/google/gemma-4-12b-it
- Script de creacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
