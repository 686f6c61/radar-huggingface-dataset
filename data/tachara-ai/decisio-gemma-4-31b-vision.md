# tachara-ai/decisio-gemma-4-31b-vision

## Resumen

decisio-gemma-4-31b-vision es un paquete de pesos de visión publicado por tachara-ai para su runtime decisio, pensado para ejecutar el modelo multimodal google/gemma-4-31B-it en Apple silicon. No es un modelo nuevo: contiene exclusivamente el codificador visual (27 capas) y su proyección, copiados bit a bit del modelo base de Google, porque la conversión a formato MLX que usa decisio solo incluye el modelo de lenguaje. El repositorio resuelve un problema de empaquetado: cuando los ficheros del modelo no incluyen los pesos de visión, el servidor descarga este `vision.safetensors`, verifica su sha256 y los fusiona en tiempo de carga.

El artefacto ocupa 1,2 GB en total y el tensor principal pesa 1,15 GB en bf16, con 356 tensores. La licencia es Apache 2.0, la del modelo fuente. No se publican idiomas soportados, datos de entrenamiento propios ni resultados de benchmarks, ya que el contenido es una copia de pesos existentes y no un fine-tuning.

Su relevancia es operativa: permite arrancar un servidor decisio con `--backend mlx --images on` y leer imágenes con un Gemma 4 de 31B en hardware Apple, o funcionar sin conexión pasando el fichero con `--vision-weights PATH`. Un mismo fichero sirve para el modelo base y para cualquier modelo ajustado derivado de él, porque el fine-tuning no modifica los pesos de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual de 27 capas con proyección, correspondiente a google/gemma-4-31B-it |
| Parametros totales | no disponible (el paquete contiene 356 tensores de visión; el modelo completo es de 31B según su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en los pesos incluidos; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`vision.safetensors`), más `vision_config.json` y `vision_manifest.json` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: extrae el codificador visual del modelo google/gemma-4-31B-it en la revisión `842da3794eaa0b77d5f08bae87a17459d91ff475` y lo reproduce sin cambios de nombres, formas, dtypes ni bytes. El contenido son 356 tensores en bf16 que suman 1,15 GB, correspondientes a las 27 capas del encoder visual y su proyección hacia el espacio del modelo de lenguaje. No hay información sobre la arquitectura interna del transformer multimodal, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO, porque esos datos pertenecen a la model card del modelo base y no se reproducen aquí.

La innovación técnica es de empaquetado y verificación: `vision_manifest.json` registra forma, dtype y sha256 de cada tensor, además del sha256 del fichero completo (`f2265e6a0456cea6587d3d214ce48447e6390f5a4e2749c45143aede4ee6c3fc`). decisio descarga y comprueba ese hash antes de fusionar los pesos, lo que permite un arranque reproducible y un modo offline explícito.

## Capacidades

- Lectura de imágenes: aporta al modelo base la capacidad de procesar entradas de imagen junto con texto (pipeline image-text-to-text).
- Fusión automática en decisio: el servidor detecta la ausencia de pesos visuales y los incorpora sin intervención manual.
- Compatibilidad con modelos ajustados: el mismo fichero sirve para el modelo base y para cualquier fine-tuning derivado, ya que el ajuste no altera el encoder visual.
- Funcionamiento offline: arranque sin red mediante `--vision-weights PATH`.
- Verificación de integridad: comprobación sha256 por tensor y del fichero completo.
- Generación de texto, razonamiento, código, matemáticas, tool calling o agentes: no disponible en este repositorio; dependen del modelo de lenguaje base, no de estos pesos.

## Casos de uso

- Inferencia multimodal local en Mac: arrancar decisio con `--backend mlx --images on` sobre un Gemma 4 31B convertido a MLX y procesar imágenes en el propio equipo, sin depender de APIs externas.
- Despliegue en entornos sin red: pasar el fichero con `--vision-weights PATH` en servidores aislados, con la garantía de integridad que aporta el manifiesto sha256.
- Reutilización en modelos ajustados: servir variantes fine-tuned del mismo base sin duplicar el paquete de visión, reduciendo el almacenamiento por cada modelo derivado.
- Verificación de cadena de suministro: auditar que los pesos de visión coinciden byte a byte con la revisión declarada del modelo de Google antes de poner un servicio en producción.
- Automatización de pipelines de descarga: integrar la descarga y el chequeo del hash en scripts de aprovisionamiento de servidores de inferencia en Apple silicon.
- Reproducibilidad de experimentos: fijar la revisión y el hash del encoder visual para que las evaluaciones multimodales sean repetibles entre máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el paquete de visión requiere 1,15 GB en bf16, adicionales a la memoria del modelo de lenguaje de 31B.
- Hardware objetivo: Apple silicon con backend MLX, según la model card.
- GPU NVIDIA: no se documenta soporte para A100, H100 ni RTX 4090 en este repositorio.
- Cabe en consumer GPU: no disponible; el requisito real lo marca el modelo de lenguaje de 31B, no estos pesos.
- Opciones de despliegue: servidor decisio con `--backend mlx --images on`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| tachara-ai/decisio-gemma-4-31b-vision | Pesos de visión sueltos para decisio | 356 tensores, 1,15 GB | no disponible | Apache 2.0 | Copia bit a bit del encoder de Gemma 4 31B |
| google/gemma-4-31B-it | Modelo multimodal completo | 31B | no disponible | Apache 2.0 según este repositorio | Modelo fuente; incluye lenguaje y visión |
| Conversiones MLX de Gemma 4 31B | Modelo convertido a MLX | 31B | no disponible | Apache 2.0 | Solo lenguaje según la model card; requieren este paquete para visión |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: sin los pesos del modelo de lenguaje no puede generar nada; solo aporta el encoder visual.
- Dependencia de decisio: el flujo de descarga, verificación y fusión está diseñado para ese runtime con backend MLX; otros frameworks no lo consumen directamente.
- Plataforma: el caso de uso documentado es Apple silicon; no hay evidencia de funcionamiento en GPU NVIDIA.
- Idiomas, contexto y sesgos: no disponibles en este repositorio; deben consultarse en la model card de google/gemma-4-31B-it.
- Riesgo de alucinación: no evaluable con la información disponible; heredado del modelo base.
- Licencia: Apache 2.0, pero los pesos son de Google y quedan sujetos a los términos de su model card, incluidos uso previsto y limitaciones.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tachara-ai/decisio-gemma-4-31b-vision
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Revisión del modelo fuente citada: `842da3794eaa0b77d5f08bae87a17459d91ff475`
- Paper, blog, repositorio de decisio y demos: no disponibles en la información proporcionada.
