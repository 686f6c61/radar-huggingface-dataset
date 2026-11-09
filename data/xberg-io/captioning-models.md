# xberg-io/captioning-models

## Resumen

`xberg-io/captioning-models` no es un modelo entrenado por su autor, sino un repositorio de empaquetado que aloja copias sin modificar de tres exportaciones ONNX de modelos de image captioning desarrollados por terceros. Lo mantiene el proyecto xberg (herramienta open source de extraccion de contenido) para evaluar candidatos de captioning dentro de su pipeline. Los modelos incluidos son SmolVLM-256M-Instruct, SmolVLM-500M-Instruct (ambos de Hugging Face TB) y Florence-2-base (Microsoft, exportado por onnx-community).

La relevancia de este repositorio es practica: agrupa en un unico lugar los grafos ONNX (vision encoder, embed tokens y decoder) necesarios para ejecutar captioning de imagenes en entornos sin PyTorch, con manifiesto de hashes SHA-256 y revisiones upstream fijadas. Esto facilita la reproducibilidad y la verificacion de integridad en despliegues de produccion.

El autor advierte explicitamente de que los tres modelos son candidatos experimentales no cualificados: ninguno es un preset soportado ni una decision de empaquetado de xberg. La licencia es mixta por directorio (Apache-2.0 para los SmolVLM, MIT para Florence-2-base), aunque la model card declara `license: other` a nivel de repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (vision encoder + decoder transformer); SmolVLM usa SigLIP + SmolLM2, Florence-2 usa encoder-decoder |
| Parametros totales | 256M (smolvlm-256m-instruct), 500M (smolvlm-500m-instruct), no disponible (florence-2-base) |
| Parametros activos | no disponible (no son MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (grafos ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Mixta por directorio: Apache-2.0 (SmolVLM-256M, SmolVLM-500M), MIT (Florence-2-base); a nivel de repo `other` / `per-model-see-license-files` |
| Formato de pesos | ONNX (vision_encoder, embed_tokens, decoder_model_merged; Florence-2 incluye ademas encoder_model) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye exportaciones ONNX ya publicadas por sus autores originales. SmolVLM-256M-Instruct y SmolVLM-500M-Instruct son exportaciones oficiales ONNX de los modelos de Hugging Face TB, que combinan un encoder visual SigLIP con el decoder de lenguaje SmolLM2; se incluyen grafos en fp32 e int8, separados en vision_encoder, embed_tokens y decoder_model_merged. Florence-2-base es una exportacion de onnx-community del modelo de Microsoft, con grafos adicionales de encoder_model y decoder_model_merged, y sin los decoders no fusionados.

Cada directorio conserva el tokenizer, el processor, la configuracion de generacion, el README upstream y el texto de licencia original. El fichero `manifest.json` registra el SHA-256 y el tamano de cada fichero, junto con la revision upstream desde la que se copio. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de descripciones de imagenes (image captioning) mediante pipeline ONNX.
- Procesamiento multimodal imagen-texto: encoder visual SigLIP (SmolVLM) o encoder visual de Florence-2.
- Ejecucion sin PyTorch, apta para entornos con runtime ONNX (ONNX Runtime).
- Cuantizacion int8 disponible para reducir requisitos de memoria.
- Florence-2-base incluye encoder y decoder separados, lo que permite tareas encoder-decoder sobre imagen.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Etiquetado automatico de imagenes en pipelines de extraccion de contenido: el repositorio esta pensado para que xberg evalue candidatos de captioning; un integrador puede cargar los grafos ONNX y generar descripciones sin depender de PyTorch.
- Generacion de metadatos en catalogos de imagenes: usar SmolVLM-256M-Instruct en int8 para producir descripciones breves con bajo coste de memoria en lotes grandes.
- Alt-text accesible para publicaciones web: SmolVLM-500M-Instruct ofrece mas capacidad que la variante de 256M manteniendo un tamano reducido, adecuado para generar texto alternativo en tiempo de publicacion.
- Procesamiento en el borde (edge) o en CPU: los grafos ONNX int8 permiten ejecutar captioning en servidores sin GPU dedicada, util para preprocesado por lotes.
- Verificacion de integridad en produccion: el `manifest.json` con SHA-256 y la recomendacion de fijar la revision del commit permiten auditar los binarios desplegados.
- Evaluacion comparativa de modelos de captioning: al agrupar tres alternativas con licencias permisivas en un mismo formato, facilita pruebas A/B de calidad de descripcion antes de elegir uno.
- Tareas encoder-decoder con Florence-2-base: su grafo encoder_model separado permite experimentar con variantes de decodificacion sobre la representacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano, SmolVLM-256M y SmolVLM-500M son viables en GPU consumer con fp32 o int8, y Florence-2-base requiere mas memoria que las variantes SmolVLM (parametros no disponibles).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU consumer: previsiblemente si para los SmolVLM por su tamano (256M y 500M), aunque no se confirma en la documentacion.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); otros runtimes no indicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| smolvlm-256m-instruct | 256M | no disponible | Apache-2.0 | ONNX (fp32/int8) | Version mas ligera del repo |
| smolvlm-500m-instruct | 500M | no disponible | Apache-2.0 | ONNX (fp32/int8) | Mayor capacidad que la de 256M |
| florence-2-base | no disponible | no disponible | MIT | ONNX (fp32/int8) | Encoder-decoder, export de Microsoft |

## Limitaciones y advertencias

- Los tres modelos son candidatos experimentales no cualificados segun el autor; no deben tratarse como presets soportados ni como decision de empaquetado.
- El repositorio no entrena ni modifica los modelos: cualquier limitacion de los originales (sesgos, alucinacion en descripciones, cobertura idiomatica) se hereda sin cambios.
- Licencia mixta: Apache-2.0 para los SmolVLM y MIT para Florence-2-base, pero el repositorio declara `license: other`; es obligatorio revisar los ficheros de licencia por directorio antes de uso comercial.
- Se debe fijar la revision del commit y verificar los SHA-256 del `manifest.json`; el autor advierte explicitamente de no resolver `main`.
- Idiomas soportados no documentados; el rendimiento multilingue no esta garantizado.
- No hay datos de benchmarks, contexto maximo ni latencia, lo que impide estimar calidad en produccion sin evaluacion propia.
- Florence-2-base omite los decoders no fusionados, lo que puede limitar ciertos flujos de generacion.
- Riesgo de alucinacion en descripciones de imagenes no cuantificado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xberg-io/captioning-models
- Proyecto xberg: https://github.com/xberg-io/xberg
- SmolVLM-256M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- SmolVLM-500M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Florence-2-base (export ONNX): https://huggingface.co/onnx-community/Florence-2-base
- Florence-2-base (original Microsoft): https://huggingface.co/microsoft/Florence-2-base
