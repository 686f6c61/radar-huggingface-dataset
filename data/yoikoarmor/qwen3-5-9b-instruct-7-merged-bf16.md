# yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16

## Resumen

Qwen3.5-9B-Instruct-7-merged-bf16 es un modelo derivado de Qwen/Qwen3.5-9B, publicado por el usuario yoikoarmor en Hugging Face. No se trata de un lanzamiento oficial de Alibaba Cloud ni del equipo Qwen, sino de un ajuste fino comunitario orientado a una tarea muy concreta: reescribir peticiones breves de imagenes en prompts positivos en ingles para Stable Diffusion, incluyendo el control deliberado de pesos de atencion mediante la sintaxis `(frase:peso)`.

El modelo parte del checkpoint exacto `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base y le aplica el adaptador LoRA denominado "7" (`07_changed_only_regenerated_user`), de rango 16 y alpha 32, seleccionado como el mejor adaptador de evaluacion de la epoca 3 / checkpoint 546. La fusion se realizo con PEFT `safe_merge=True` sobre los pesos BF16 sin cuantizar del modelo original, no sobre una version desquantizada de NF4. El resultado se exporto como `Qwen3_5ForCausalLM`, omitiendo el codificador de vision y los componentes multimodales.

El modelo cuenta con 8.953.803.264 parametros totales, se distribuye en safetensors con pesos BF16 (aproximadamente 18 GB solo de pesos) y esta pensado para generacion de texto en ingles y japones. Su relevancia es acotada: cubre un nicho especifico de generacion de prompts para difusion, con licencia Apache-2.0 y una version cuantizada Q4_K_M en GGUF disponible por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Qwen3_5ForCausalLM`, familia qwen3_5_text); sin componentes multimodales |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repositorio; Q4_K_M GGUF en el repositorio complementario `yoikoarmor/Qwen3.5-9B-Instruct-7-GGUF` |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer decoder-only de la familia `qwen3_5_text`. Sobre esa base se aplico un adaptador LoRA de rango 16 y alpha 32, entrenado para la tarea de reescritura de peticiones de imagen a prompts de Stable Diffusion en ingles. El adaptador seleccionado es el identificado como "7" (`07_changed_only_regenerated_user`), correspondiente al mejor checkpoint de evaluacion de la epoca 3 (checkpoint 546). El nombre "7" identifica un unico adaptador seleccionado, no la combinacion de siete adaptadores.

La fusion se realizo con PEFT `safe_merge=True` sobre los pesos BF16 originales del modelo base, preservando la precision completa y evitando la desquantizacion desde NF4. El proceso de validacion reporta que la fusion no produjo pesos no finitos, que todos los parametros guardados son BF16 y que no quedan modulos LoRA residuales. La recarga del modelo guardado reproduce de forma bit-exacta los logits y la salida greedy de 128 tokens respecto al modelo fusionado en memoria. No obstante, la inferencia con el adaptador previo a la fusion y la inferencia fusionada en BF16 no son identicas: el redondeo en BF16 produjo una diferencia maxima absoluta de logits de 0,12890625, diferencia media de 0,0210571103 y RMSE de 0,0270430148, lo que en ese caso concreto cambio el token top-1. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Reescritura de peticiones breves de imagen a prompts positivos en ingles para Stable Diffusion.
- Control explicito de pesos de atencion de Stable Diffusion mediante la sintaxis `(frase:peso)`, con instrucciones para graduar la intensidad segun la importancia del concepto.
- Soporte de plantilla de chat mediante `apply_chat_template`, con opcion de desactivar el modo thinking (`enable_thinking=False`).
- Requiere un system prompt especifico en tiempo de inferencia; no esta embebido como instruccion por defecto en los pesos.
- No soporta entrada de imagen ni video: el codificador de vision y los componentes multimodales fueron omitidos en la exportacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode avanzado): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Generacion de prompts para Stable Diffusion: el modelo recibe una peticion breve del usuario y la reescribe como prompt positivo en ingles con pesos de atencion graduados, lo que permite controlar la intensidad de conceptos secundarios y centrales sin intervencion manual.
- Preprocesado en pipelines de generacion de imagenes: integrado como paso previo a un modelo de difusion, normaliza y enriquece las peticiones de usuario antes de pasarlas al sampler, reduciendo la necesidad de escribir prompts complejos a mano.
- Herramientas de authoring para artistas y disenadores: permite convertir descripciones rapidas en prompts estructurados con enfasis controlado, util en flujos de trabajo iterativos donde se ajustan pesos de conceptos concretos.
- Localizacion de peticiones japonesas a prompts en ingles: al soportar japones e ingles, puede tomar entradas en japones y producir prompts en ingles para modelos de difusion que solo entienden ingles.
- Prototipado de asistentes de prompt en entornos de investigacion: al ser un modelo de 9B en BF16 con licencia Apache-2.0, sirve para experimentar con tecnicas de reescritura y ponderacion de prompts en laboratorio.
- Despliegue en entornos con GPUs limitadas mediante la version Q4_K_M GGUF: el repositorio complementario permite ejecutar el modelo en configuraciones de menor VRAM, aunque la cuantizacion puede alterar la salida respecto al BF16.
- Evaluacion de tecnicas de fusion LoRA: el modelo documenta con detalle el proceso de fusion, las diferencias numericas pre y post fusion y los checks de similitud, lo que lo hace util como caso de estudio para quienes investigan merge de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna mejora general de calidad ni puntuacion de benchmark; la validacion realizada es un smoke test numerico con una unica entrada (`少年の旅立ち`), thinking desactivado, decodificacion greedy determinista y 128 tokens nuevos, que no constituye una prueba de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para los pesos; la memoria en tiempo de ejecucion es superior (no se especifica cifra exacta).
- Para la version Q4_K_M GGUF: no se proporciona el tamano exacto ni la VRAM estimada en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita; por el tamano en BF16 se requiere una GPU con al menos 24 GB de VRAM para los pesos, aunque la memoria de activaciones y cache KV puede exigir mas.
- Cabe en GPU de consumo: no confirmado; una RTX 4090 (24 GB) podria alojar los pesos BF16 pero el margen para contexto y activaciones es ajustado, y no se aportan datos de pruebas reales.
- Opciones de despliegue: transformers 5.3.0 o superior con soporte `qwen3_5_text`; PEFT no es necesario para cargar el modelo ya fusionado; existe una version GGUF Q4_K_M para runtimes compatibles con llama.cpp, aunque no se detalla el runtime exacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Instruct-7-merged-bf16 | 8.953.803.264 | no disponible | Apache-2.0 | safetensors BF16 | Derivado comunitario especializado en prompts para Stable Diffusion |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion | no disponible | Apache-2.0 | no disponible | Modelo base oficial; incluye componentes multimodales que este derivado omite |
| Qwen3.5-9B-Instruct-7-GGUF | no disponible | no disponible | Apache-2.0 | GGUF Q4_K_M | Version cuantizada del mismo derivado, con runtime y salida potencialmente distintos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo puede repetir conceptos, reutilizar un peso constante como 1.2 a pesar de la instruccion de ponderacion, producir salidas incompletas al alcanzar el limite de tokens o anadir detalles no solicitados; se recomienda revisar los prompts generados antes de usarlos.
- No se garantiza equivalencia con la configuracion previa de NF4 + adaptador; la cuantizacion y la fusion pueden alterar la salida.
- La fusion BF16 y la inferencia con el adaptador previo no son identicas: se documentan diferencias de logits y cambios en el token top-1 para una misma entrada.
- El modelo es exclusivamente de texto; no admite imagenes ni video.
- El system prompt es obligatorio en tiempo de inferencia y no esta embebido en los pesos; omitirlo degrada el comportamiento esperado.
- La validacion realizada es un smoke test numerico con una sola entrada y 128 tokens, no una prueba de calidad ni un benchmark.
- Los origenes, derechos, licencia y composicion de los datos de entrenamiento no estan establecidos segun la model card.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un derivado comunitario sin endorsement de Alibaba Cloud ni del equipo Qwen; se debe preservar el aviso de licencia original.
- El repositorio no contiene datos de entrenamiento ni credenciales, solo pesos fusionados, tokenizer, configuracion, licencia y procedencia saneada.
- No se dispone de informacion sobre sesgos conocidos ni sobre la longitud de contexto soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16
- Version GGUF Q4_K_M: https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-GGUF/tree/b34bc0c3e42d9ad91b19f4755b9039c5ec987fbd
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision exacta del modelo base: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- SHA-256 del adaptador: `d60d86811c44baebd5c5a4852532785fbea6822fbc7407bb8679548939bd764c`
