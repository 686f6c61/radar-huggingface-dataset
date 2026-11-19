# turboderp/Qwen3.8-Flash-Next-exl3

## Resumen

Qwen3.8-Flash-Next-exl3 es una colección de cuantizaciones EXL3 del modelo multimodal Qwen3.8-Flash-Next, publicada por turboderp (autor de TabbyAPI y del ecosistema ExLlamaV3). No se trata de un modelo nuevo, sino de una redistribución comprimida del modelo base de Qwen, orientada a inferencia local en GPUs de consumo con pérdida de calidad controlada y medida mediante divergencia KL.

El interés principal reside en el formato EXL3, que permite comprimir un modelo de gran tamaño hasta 1,66 bits por peso manteniendo un rendimiento cercano al original en tareas de razonamiento (GPQA-D) y de agente de código (SWE-bench mini). El repositorio ocupa 817,3 GB e incluye múltiples variantes de cuantización, tanto "plain" como autocalibradas, además de una tabla de n-gramas intercambiable entre cuantizaciones.

La relevancia actual es práctica: demuestra que es posible ejecutar un modelo de la clase Flash-Next en una única RTX 5090 sin offloading a CPU, con velocidades superiores a 200 tokens por segundo en cargas agénticas, a costa de limitar el contexto a unos 64k tokens con caché cuantizada K5V4. Es, por tanto, una ficha de despliegue más que de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el repo solo documenta la cuantización EXL3) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 64k tokens en la variante 1,66 bpw con caché K5V4 (límite práctico documentado); contexto nativo del modelo base no disponible |
| Tipos de cuantización | EXL3 en 1,66 / 2,05 / 2,18 / 2,68 / 3,05 / 3,18 / 3,68 / 4,05 / 4,18 / 5,05 / 6,05 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (EXL3), con `ngram_embedding.safetensors` intercambiable entre cuantizaciones |

## Arquitectura y entrenamiento

Esta ficha corresponde a una cuantización, no a un entrenamiento. El autor no publica detalles de arquitectura del modelo base (número de capas, dimensión oculta, configuración de expertos o composición del dataset). Lo que sí se documenta es el esquema de compresión EXL3: cuantización por bloques con parámetros H (bits de la parte de alta precisión) y NG (tamaño de grupo), más una tabla de n-gramas independiente que se puede reutilizar entre variantes y que habitualmente se sirve en streaming desde disco.

Las variantes se dividen en "plain" (2,05 a 6,05 bpw) y "self-calibrated" (1,66 a 4,18 bpw), donde la calibración ajusta los parámetros por tensor para minimizar la divergencia KL respecto al modelo original. La variante de 1,66 bpw usa mayoritariamente tensores de expertos con K=1,5, lm_head y embeddings de entrada a 4 bpw, tabla de n-gramas a 3 bpw y torre de visión a 4 bpw. El repositorio incluye además una cabeza MTP (multi-token prediction) compatible con la variante de 1,66 bpw.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con torre de visión cuantizada a 4 bpw en la variante mínima.
- Razonamiento de nivel experto: la variante de 1,66 bpw obtiene 86,4% en GPQA-D, frente al 91,7% del modelo sin cuantizar.
- Razonamiento visual: 64,3% en ERQA en la variante de 1,66 bpw, frente al 68,8% del original.
- Uso como agente de código: 74% en SWE-bench mini agéntico en 1,66 bpw, frente al 76% del original.
- Cabeza MTP para decodificación especulativa, incluida en el paquete de la variante de 1,66 bpw.
- Tool calling y function calling: no documentado explícitamente en esta model card; depende de las capacidades del modelo base.
- Multilingüismo: no disponible.

## Casos de uso

- Agentes de código en local: la variante de 1,66 bpw alcanza 74% en SWE-bench mini agéntico y más de 200 t/s en cargas agénticas sobre una RTX 5090, lo que permite iterar bucles de edición-ejecución-test sin depender de APIs externas.
- Asistente multimodal de escritorio: con la torre de visión a 4 bpw y el pipeline image-text-to-text, se puede desplegar un asistente que describa capturas, diagramas o documentación escaneada en una sola GPU de consumo.
- Evaluación de calidad de cuantizaciones: la tabla de divergencia KL y perplejidad permite comparar variantes antes de fijar una en producción, eligiendo el punto de la curva bpw/calidad que encaje con la VRAM disponible.
- Servicio de inferencia con TabbyAPI: el formato EXL3 está pensado para ExLlamaV3 y TabbyAPI, de modo que se puede montar un endpoint compatible con OpenAI para equipos pequeños.
- Procesamiento por lotes de documentos largos: con 64k tokens de contexto y caché K5V4, es viable resumir o extraer información de contratos, informes o expedientes de decenas de páginas en una sola pasada.
- Investigación sobre compresión extrema: la variante de 1,66 bpw sirve como caso de estudio de cuánto rendimiento se conserva al bajar de 2 bits por peso en un modelo multimodal grande.
- Sustitución de un modelo mayor en un portátil con GPU: las variantes de 2,68 a 3,18 bpw ofrecen un equilibrio razonable (91,4% en GPQA-D, KLD de 0,0138 a 3,18 bpw) para entornos con menos de 32 GB de VRAM.

## Benchmarks y rendimiento

Datos publicados por el autor, ejecutados con evalscope sobre TabbyAPI (EXL3) y `llama serve` (GGUF), con ajustes por defecto. El autor advierte que son ejecuciones únicas y que la tabla está incompleta.

| Modelo | bpw | KLD media | GPQA-D | ERQA | SWE-bench mini ag. |
|:--|--:|--:|--:|--:|--:|
| SC 1.66 bpw / H4, NG3, V4 | 1,66 | 0,1205 | 86,4% | 64,3% | 74% |
| SC 2.18 bpw | 2,18 | 0,0497 | 89,4% | 68,0% | 76% |
| SC 2.68 bpw | 2,68 | 0,0249 | 91,4% | 65,5% | 76% |
| SC 3.18 bpw | 3,18 | 0,0138 | 91,4% | 68,0% | 76% |
| SC 3.68 bpw | 3,68 | 0,0087 | 91,9% | 66,8% | 74% |
| GSQ-RCO IQ2_XS | 2,40 | 0,1172 | 87,4% | 61,3% | no disponible |
| GSQ-RCO IQ3_XXS | 2,90 | 0,0529 | 91,4% | no disponible | no disponible |
| UD3.1 IQ1_S | 2,31 | 0,0671 | no disponible | 65,5% | 74% |
| Original (sin cuantizar) | 16,00 | no disponible | 91,7% | 68,8% | 76% |

Notas del autor: los resultados de GSQ-RCO IQ2_XS e IQ3_XXS en GPQA-D provienen del release de ISTA-DASLab; el original se probó sin cuantizar vía OpenRouter y el 72,3% reportado por Qwen en el lanzamiento no se reproduce con evalscope.

## Requisitos de hardware

- La variante de 1,66 bpw cabe en una única RTX 5090 (headless, sin offloading a CPU) junto con la cabeza MTP y la torre de visión, con más de 200 t/s en cargas agénticas y contexto limitado a 64k tokens con caché K5V4.
- El repositorio completo ocupa 817,3 GB, por lo que conviene descargar solo la rama de la cuantización elegida.
- Las variantes de 2,68 a 3,18 bpw requieren GPUs profesionales o configuraciones multi-GPU; el autor no publica cifras de VRAM por variante.
- GPU recomendadas: RTX 5090 para 1,66 bpw; A100/H100 o múltiples RTX 4090/5090 para el resto de variantes. No hay datos de VRAM exactos por cuantización en la información disponible.
- Despliegue: TabbyAPI / ExLlamaV3 es la ruta nativa para EXL3; las variantes GGUF del ecosistema (GSQ-RCO, UD3.1) se ejecutan con llama.cpp.
- La tabla de n-gramas se puede servir en streaming desde disco y es intercambiable entre cuantizaciones, lo que reduce el espacio en disco y en memoria.

## Comparativa con modelos similares

| Modelo | bpw | KLD media | GPQA-D | ERQA | SWE-bench mini ag. | Formato |
|:--|--:|--:|--:|--:|--:|:--|
| EXL3 SC 1.66 bpw (este repo) | 1,66 | 0,1205 | 86,4% | 64,3% | 74% | EXL3 |
| UD3.1 IQ1_S | 2,31 | 0,0671 | no disponible | 65,5% | 74% | GGUF |
| GSQ-RCO IQ2_XS | 2,40 | 0,1172 | 87,4% | 61,3% | no disponible | GGUF |
| GSQ-RCO IQ3_XXS | 2,90 | 0,0529 | 91,4% | no disponible | no disponible | GGUF |
| EXL3 SC 3.18 bpw | 3,18 | 0,0138 | 91,4% | 68,0% | 76% | EXL3 |
| Qwen3.8-Flash-Next original | 16,00 | no disponible | 91,7% | 68,8% | 76% | safetensors |

La comparación relevante es entre formatos de cuantización del mismo modelo base, no entre modelos distintos: EXL3 a 1,66 bpw ofrece el menor tamaño con una calidad razonable, mientras que IQ1_S a 2,31 bpw obtiene menor KLD pero ocupa más espacio.

## Limitaciones y advertencias

- Los benchmarks son ejecuciones únicas, con ajustes por defecto y una tabla incompleta; el propio autor los califica de "muy cuestionables".
- La variante de 1,66 bpw degrada ERQA (64,3% frente a 68,8%) y GPQA-D (86,4% frente a 91,7%); no es equivalente al modelo original.
- El contexto práctico de la variante mínima se limita a 64k tokens con caché K5V4; contextos mayores requieren más VRAM.
- La licencia qwen-community-1.0 ("other" en Hugging Face) impone condiciones adicionales; conviene revisar el archivo LICENSE antes de un uso comercial.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación en la model card.
- El formato EXL3 requiere ExLlamaV3/TabbyAPI; no es portable a vLLM, TGI u Ollama sin conversión.
- El tamaño del repo (817,3 GB) complica el almacenamiento y la descarga; descargar solo la rama necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama 1,66 bpw / H4, NG3: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/1.66bpw_h4_ng3
- Rama 2,18 bpw / H6, NG8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/2.18bpw_h6_ng8
- Rama 2,68 bpw / H6, NG8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/2.68bpw_h6_ng8
- Rama 3,18 bpw / H6, NG8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.18bpw_h6_ng8
- Rama 3,68 bpw / H6, NG8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.68bpw_h6_ng8
- Rama 4,18 bpw / H6, NG8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/4.18bpw_h6_ng8
- Rama 2,05 bpw / H4, NG4: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/2.05bpw_h4_ng4
- Rama 3,05 bpw / H5, NG5: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.05bpw_h5_ng5
- Rama 4,05 bpw / H6, NG6: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/4.05bpw_h6_ng6
- Rama 5,05 bpw / H6, NG6: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/5.05bpw_h6_ng6
- Rama 6,05 bpw / H6, NG6: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/6.05bpw_h6_ng6
