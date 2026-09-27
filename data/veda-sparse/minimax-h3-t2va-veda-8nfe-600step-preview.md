# Veda-Sparse/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview

## Resumen

Veda-Sparse/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview es un checkpoint de predictor de atención dispersa (sparse attention) para el modelo de generación text-to-audio-video MiniMax-H3. No es un generador de vídeo en sí: es un módulo auxiliar de 275 millones de parámetros que, para cada capa y cada cabeza, decide qué baldosas (tiles) de clave de 128 tokens debe atender cada baldosa de consulta. Con esa selección, la atención del generador se ejecuta de forma block-sparse con una ratio de retención del 10 % en lugar de densa.

Lo desarrolla Veda-Sparse sobre el modelo base MiniMaxAI/MiniMax-H3, y se distribuye como preview entrenado durante solo 600 actualizaciones (steps) y únicamente sobre clips de 5,17 segundos. Aun así, según la model card generaliza a las geometrías de 10,1 y 14,4 segundos, aunque no fue entrenado en ellas.

Su relevancia es de eficiencia de inferencia: permite acelerar la atención de un modelo de difusión de vídeo y audio sin recalcular el modelo completo, aplicando selección top-k invariante a reescalados monótonos por fila. Se publica en fp8 e4m3 junto con los planes de tiles en el mismo fichero, de modo que el predictor y el troceado al que hacen referencia sus puntuaciones no puedan emparejarse mal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de seleccion de tiles (tile-score predictor) para atencion block-sparse, aplicado sobre las capas y cabezas del modelo base MiniMax-H3 |
| Parametros totales | 275M (predictor); parametros del modelo base MiniMax-H3 no disponibles |
| Parametros activos | No aplica (no es un modelo MoE); no disponible para el modelo base |
| Longitud de contexto | No disponible. Opera sobre rejillas latentes de hasta 102 x 24 x 42 (latent_t 102, 14,4 s) |
| Tipos de cuantizacion | float8_e4m3fn con una escala amax fp32 por cabeza; desquantizacion a bf16 en carga; exportable a bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community (etiquetada como "other") |
| Formato de pesos | safetensors (fp8 e4m3), mas config.json y AGENTS.md |

## Arquitectura y entrenamiento

El componente liberado es un predictor que asigna puntuaciones a las baldosas de clave de 128 tokens y selecciona, por capa y por cabeza, a qué baldosas atiende cada baldosa de consulta. El resultado es una atención block-sparse con una ratio de retencion del 10 %. Los pesos se almacenan como float8_e4m3fn con una escala fp32 amax por cabeza, guardada junto a cada tensor como `<key>.__scale`. En la carga, `miowtion.veda.bundle.load()` los desquantiza a bf16 (porque `torch.bmm` no tiene ruta e4m3) y el scoring se eleva internamente a fp32. La justificacion es que la seleccion top-k es invariante a una constante por fila y a cualquier reescalado monótono por fila, por lo que solo puede cambiar el orden en el limite del presupuesto de seleccion.

El checkpoint es un preview entrenado durante 600 actualizaciones y solo con clips de 5,17 segundos. El fichero empaqueta doce planes de tiles correspondientes a relaciones de aspecto 16:9, 9:16, 4:3 y 1:1, en latent_t 37 / 72 / 102 (5,17 / 10,1 / 14,4 s). Cada plan fija la rejilla latente, la forma de baldosa por cabeza (todas de exactamente 128 tokens) y el orden de bloques; el predictor no se interpola entre rejillas y solicitar una geometria ausente lanza un error. En cuanto a la precision, sobre un checkpoint hermano (latent_t 102, actualizacion 200, misma arquitectura y ruta de exportacion) y a lo largo de 8 pasos de denoising x 50 capas en 16:9, la comparacion fp8 frente a bf16 arrojo: recall frente al oraculo 0,6017 en ambos formatos (diferencia de 2e-5), masa de atencion retenida 0,6153 en ambos (6e-6 de diferencia), 0,9944 de bloques identicos a bf16 (aproximadamente 1 bloque de cada 180 cambia, en el limite del presupuesto) y un error relativo sobre las puntuaciones crudas de 5,2e-3 que no se propaga a la seleccion.

## Capacidades

- Prediccion de puntuaciones de tile para atención block-sparse, por capa y por cabeza, en el modelo MiniMax-H3 de text-to-audio-video.
- Seleccion de baldosas de clave de 128 tokens con una ratio de retencion del 10 %.
- Soporte de doce geometrías predefinidas: 16:9, 9:16, 4:3 y 1:1, en latent_t 37, 72 y 102.
- Ejecucion conjunta con el pipeline de generacion en 8 pasos de denoising (8 NFE) mediante un LoRA turbo de 8 pasos.
- Modo de comparacion `--attention dense veda` que renderiza la referencia densa y un video lado a lado con tiempos por paso en `summary.json`.
- Empaquetado de pesos y planes de tiles en un unico fichero para evitar emparejamientos incorrectos silenciosos.
- Exportacion a bf16 desde el checkpoint de entrenamiento con `scripts/export_predictor.py --dtype bfloat16`.
- No se describe soporte de tool calling, agentes, vision, audio de entrada ni capacidades multilingues en la informacion disponible.

## Casos de uso

- Aceleracion de inferencia de text-to-audio-video: sustituir la atención densa de MiniMax-H3 por la ruta block-sparse con retencion del 10 % para reducir el coste computacional de la atención en cada paso de denoising, manteniendo la calidad de seleccion (masa de atencion retenida de 0,6153 frente al oraculo).
- Generacion de clips cortos de 5,17 segundos: es la geometria sobre la que se entreno el checkpoint (600 actualizaciones), por lo que es el escenario con mayor fiabilidad de seleccion.
- Generacion vertical para redes sociales en 9:16: los planes incluyen esta relacion de aspecto en las tres longitudes latentes, lo que permite producir contenido vertical con la ruta dispersa.
- Generacion cuadrada y 4:3 para anuncios y material de catalogo: los planes cubren 1:1 y 4:3 en latent_t 37, 72 y 102, de modo que se puede servir el mismo generador en varios formatos sin reentrenar el predictor.
- Investigacion sobre atencion dispersa en modelos de difusion: el artefacto sirve como banco de pruebas para medir recall frente al oraculo, masa de atencion retenida y estabilidad de la seleccion bajo cuantizacion.
- Despliegue en GPUs de arquitecturas recientes: la guia AGENTS.md cubre Ada (SM89), Hopper (SM90) y Blackwell (SM120), apropiada para equipos con esas generaciones de GPU.
- Evaluacion comparativa densa frente a dispersa: con `--attention dense veda` se obtiene una referencia densa y un video lado a lado con tiempos por paso para validar el ahorro antes de ponerlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, VBench, etc.) en la informacion disponible. La model card si aporta medidas internas de fidelidad de la seleccion comparando el almacenamiento fp8 con bf16 sobre un checkpoint hermano (latent_t 102, actualizacion 200), en 8 pasos de denoising x 50 capas a 16:9 / latent_t 102, con 104.603 tokens y keep 0.1:

| Almacenamiento | Fichero | Recall vs. oraculo | Masa de atencion retenida | Bloques identicos a bf16 |
|---|---|---|---|---|
| bf16 | 525 MiB | 0,6017 | 0,6153 | — |
| fp8 e4m3 | 263 MiB | 0,6017 | 0,6153 | 0,9944 |

Error relativo sobre las puntuaciones crudas: 5,2e-3. Diferencia de recall: 2e-5. Diferencia de masa de atencion: 6e-6. Cambia aproximadamente 1 bloque de cada 180, situados en el limite del presupuesto y sin masa de atencion medible. Estos datos corresponden a un checkpoint hermano, no al checkpoint preview liberado, segun la propia model card.

## Requisitos de hardware

- VRAM del predictor: aproximadamente 263 MiB en fp8 e4m3 y 525 MiB si se exporta a bf16, segun los tamanos de fichero indicados en la model card (la desquantizacion a bf16 en carga implica la copia residente en bf16).
- Tamano del repositorio descargado: 0,8 GB, que incluye los pesos del predictor y los planes de tiles.
- VRAM del modelo base MiniMax-H3: no disponible en la informacion proporcionada; debe descargarse por separado con `hf download MiniMaxAI/MiniMax-H3 --local-dir weights/MiniMax-H3`.
- Arquitecturas de GPU soportadas por las rutas fp8, segun la guia de despliegue AGENTS.md: Ada (SM89), Hopper (SM90) y Blackwell (SM120).
- No se especifica si cabe en GPU de consumo; no disponible.
- Opciones de despliegue: repositorio Miowtion (`pip install -e '.[gpu,encode]'`) con los scripts `encode_samples.py` y `generate.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- La torre de texto se codifica una sola vez en una cache de muestras, porque el generador no la mantiene en memoria durante la generacion.
- Latencia y throughput: no disponibles. Los tiempos por paso se registran en `summary.json`, pero el paso 0 incluye compilacion de kernels y se excluye de las cifras de aceleracion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparacion directa disponible es contra la ruta de atencion densa del propio MiniMax-H3, que se puede generar con `--attention dense veda` para obtener una referencia densa y un video lado a lado con tiempos por paso. El resultado medido en el checkpoint hermano es una retencion del 10 % de las baldosas con una masa de atencion conservada de 0,6153 respecto al oraculo. Datos de otros predictores de atencion dispersa o de modelos de generacion de video-audio comparables: no disponibles.

## Limitaciones y advertencias

- El predictor no es util sin el plan de tiles contra el que se indexan sus puntuaciones: un plan fija la rejilla latente, la forma de baldosa por cabeza y el orden de bloques. Un emparejamiento incorrecto es silencioso, ya que el predictor sigue emitiendo puntuaciones para un troceado que nunca vio.
- Es un checkpoint preview: se entreno durante 600 actualizaciones y solo con clips de 5,17 segundos. Aunque generaliza a 10,1 y 14,4 segundos, no fue entrenado en esas geometrias.
- El predictor no se interpola entre rejillas: solicitar una geometria que no este en la tabla de doce planes lanza una excepcion.
- La seleccion dispersa puede alterar el orden en el limite del presupuesto de seleccion (aproximadamente 1 bloque de cada 180 en las mediciones del checkpoint hermano).
- Licencia minimax-h3-community (etiquetada como "other"): es una licencia de comunidad con condiciones propias. Debe revisarse el archivo LICENSE antes de cualquier uso comercial; no se detallan en la informacion disponible las restricciones concretas.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion y fidelidad del contenido generado: dependen del modelo base MiniMax-H3, no del predictor; no disponibles.
- Los pesos fp8 dependen de rutas de kernel para Ada (SM89), Hopper (SM90) y Blackwell (SM120); no se documenta soporte para arquitecturas anteriores.
- Citar el paper asociado: arXiv:2605.30325.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veda-Sparse/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper: https://arxiv.org/abs/2605.30325
- Pagina del proyecto: https://veda-sparse.github.io/
- Codigo (Miowtion): https://github.com/veda-sparse/Miowtion
- Guia de despliegue: AGENTS.md, incluida en el repositorio del modelo
