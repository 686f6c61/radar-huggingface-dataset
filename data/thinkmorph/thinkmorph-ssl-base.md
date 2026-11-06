# ThinkMorph/ThinkMorph-SSL-Base

## Resumen

ThinkMorph-SSL-Base es un modelo multimodal any-to-any desarrollado por ThinkMorph, construido a partir de ByteDance-Seed/BAGEL-7B-MoT. Se trata del checkpoint intermedio de la etapa 1 (pretext) de la receta PRIMER: concretamente, los pesos EMA en el paso 5.500 del entrenamiento de pre-texto sobre el dataset Pretext-270K. No es un modelo final orientado a responder preguntas, sino una base intermedia desde la que arranca la etapa 2 que da lugar a ThinkMorph-SSL-Instruct.

Su funcionamiento en esta etapa consiste en recibir una imagen corrompida y producir una descripcion textual, una imagen restaurada y una segunda descripcion. Es decir, el modelo ha sido entrenado con supervision de pre-texto (sin pares pregunta-respuesta), lo que lo convierte en un artefacto de investigacion util para reproducir el pipeline PRIMER y para estudiar el efecto del pre-entrenamiento auto-supervisado multimodal sobre BAGEL-7B-MoT.

La relevancia actual radica en que expone publicamente los pesos intermedios de un proceso de entrenamiento multimodal a gran escala, con 29,5 GB de pesos en bfloat16, licencia Apache-2.0 y compatibilidad con el codigo de inferencia oficial de BAGEL. No obstante, sus capacidades de respuesta a preguntas son limitadas: el propio autor reporta en torno al 40% en V* y MMMU para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any basado en BAGEL-7B-MoT (MoE con torre de vision SigLIP y VAE) |
| Parametros totales | 7B (heredados de BAGEL-7B-MoT; no se especifica desglose adicional) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`, 1.451 tensores bfloat16; `ae.safetensors` para el VAE) |

## Arquitectura y entrenamiento

El modelo parte de BAGEL-7B-MoT, un transformer multimodal con mezcla de expertos (MoE) que combina un modelo de lenguaje, una torre de vision SigLIP y un autoencoder variational (VAE) para la generacion de imagenes. En esta release, el checkpoint incluye 1.451 tensores en bfloat16 con los mismos nombres y formas que ThinkMorph-SSL-Instruct, omitiendo la capa 26 de SigLIP por no utilizarse. Los pesos del VAE son identicos a los de la release final, ya que el VAE permanece congelado en ambas etapas.

El entrenamiento corresponde a la ejecucion `0503_stage0_270k_32gpu`, inicializada desde BAGEL-7B-MoT (layout `lmms-lab/BAGEL-7B-MoT-ver.LE` y su VAE). Se utilizaron 32 GPUs (4 nodos x 8), un learning rate de 2,83e-5 con warmup de 1.000 pasos, y un horizonte configurado de 10.000 pasos; esta release es el guardado EMA del paso 5.500, con decaimiento 0,9998 desde el paso 1.000 y shadow en fp32. Los datos provienen de Pretext-270K (270.896 filas de entrenamiento; los ficheros de validacion no se usan). Las funciones de perdida son entropia cruzada de texto y flow matching de imagen, con pesos 1 y 1 respectivamente. El proceso de publicacion consistio en fusionar el estado EMA en un unico `model.safetensors` en fp32 mediante `scripts/merge_checkpoint.py --checkpoint-type ema`, y posteriormente convertir los 1.451 tensores a bfloat16 sin otros cambios.

## Capacidades

- Generacion de descripciones textuales a partir de imagenes corrompidas.
- Restauracion de imagenes (generacion de una imagen restaurada) mediante flow matching.
- Generacion de una segunda descripcion tras la restauracion, formando un ejercicio de tres salidas (descripcion, imagen, descripcion).
- Procesamiento multimodal any-to-any (entrada imagen, salida texto e imagen).
- No dispone de supervision pregunta-respuesta: no esta disenado para responder preguntas directamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Reproduccion del pipeline PRIMER: el checkpoint sirve como punto de partida documentado para reentrenar la etapa 2 y obtener ThinkMorph-SSL-Instruct, util para laboratorios que quieran replicar el proceso con sus propios datos.
- Investigacion sobre pre-entrenamiento auto-supervisado multimodal: permite estudiar como evoluciona la representacion de BAGEL-7B-MoT tras 5.500 pasos de pre-texto con perdidas de texto e imagen.
- Restauracion de imagenes corrompidas en entornos de investigacion: el modelo genera una imagen restaurada a partir de una entrada degradada, lo que puede emplearse para evaluar tecnicas de denoising o inpainting en un contexto controlado.
- Generacion de descripciones de imagenes para analisis de datasets: puede producir descripciones de imagenes corruptas y restauradas, util para inspeccionar la calidad de Pretext-270K o de datasets similares.
- Baseline para comparativas de pre-texto: al ser un checkpoint intermedio con pesos publicos, sirve como referencia para medir el impacto de distintas recetas de pre-entrenamiento sobre BAGEL-7B-MoT.
- Estudio de la dinamica EMA en entrenamiento multimodal: los pesos EMA del paso 5.500 permiten analizar el efecto del promediado exponencial en modelos any-to-any de 7B.

## Benchmarks y rendimiento

El autor indica en el apendice del paper que este checkpoint obtiene aproximadamente un 40% en V* y MMMU. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| V* | ~40% |
| MMMU | ~40% |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 29,5 GB, por lo que se necesita al menos una GPU con 32 GB o mas para cargar el checkpoint completo sin cuantizacion.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, o configuraciones multi-GPU para mayor comodidad.
- Cabe en GPU consumer: no disponible de forma confirmada; una RTX 4090 de 24 GB no seria suficiente para los pesos en bfloat16 sin cuantizacion, y no se documentan formatos cuantizados.
- Opciones de despliegue: codigo de inferencia oficial de BAGEL o la release de codigo de PRIMER, apuntando `model_path` a una copia local; el loader lee `ema.safetensors`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkMorph-SSL-Base | 7B (MoE) | no disponible | ~40% en V* y MMMU | Apache-2.0 | Hugging Face |
| ThinkMorph-SSL-Instruct | 7B (MoE) | no disponible | no disponible en la informacion | Apache-2.0 | Hugging Face |
| BAGEL-7B-MoT | 7B (MoE) | no disponible | no disponible en la informacion | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo intermedio sin supervision pregunta-respuesta: no debe usarse para responder preguntas directamente; para ello existe ThinkMorph-SSL-Instruct.
- Rendimiento limitado en tareas de comprension: en torno al 40% en V* y MMMU, segun el autor.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de pre-texto, la fidelidad de las descripciones generadas no esta garantizada.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: pesos bajo Apache-2.0, siguiendo BAGEL-7B-MoT; el dataset Pretext-270K tiene sus propios terminos por fuente, que deben consultarse en su model card.
- Caveat para produccion: al ser un checkpoint de investigacion de etapa 1, no se recomienda su despliegue en produccion; su uso previsto es la reproduccion y el estudio del pipeline PRIMER.

## Enlaces

- Hugging Face: https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Base
- Modelo final: https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Instruct
- Dataset: https://huggingface.co/datasets/ThinkMorph/Pretext-270K
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
