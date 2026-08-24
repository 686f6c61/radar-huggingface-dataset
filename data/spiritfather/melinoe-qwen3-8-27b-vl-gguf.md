# spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF

## Resumen

Melinoe-Qwen3-8-27B-VL-GGUF es una cuantizacion GGUF estatica del modelo Melinoe-Qwen3-8-27B-VL, publicada por spiritfather el 24 de agosto de 2026. El modelo base, desarrollado por bgg1996, es una variante de Qwen3.8-27B, el miembro denso de 27.000 millones de parametros de la familia Qwen3.8, que incorpora una arquitectura de atencion hibrida: de sus 64 capas, solo 16 ejecutan atencion completa (con intervalo de 4), mientras que las 48 restantes usan atencion lineal. Se trata de un modelo multimodal (vision-lenguaje) orientado a escritura creativa, roleplay y prosa narrativa, y esta siendo evaluado en CaliperBench, un benchmark especifico para estas tareas.

La cuantizacion GGUF permite ejecutar el modelo en hardware de consumo con distintos niveles de precision, desde Q2_K (10,7 GB) hasta Q8_0 (28,6 GB). El repositorio incluye tambien el proyector de vision en BF16 (mmproj) para uso multimodal con llama.cpp, aunque el uso solo texto funciona sin el. Con licencia Apache-2.0 y soporte exclusivo de ingles, el modelo esta pensado para integracion en aplicaciones comerciales de generacion de texto creativo. El repositorio cuenta actualmente con 0 descargas y 0 likes, lo que indica que es una publicacion muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y lineal (Qwen3.8-27B-VL) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida: de sus 64 capas, solo 16 ejecutan atencion completa (con un intervalo de 4, es decir, una capa de atencion completa cada cuatro), mientras que las 48 restantes utilizan atencion lineal. Este diseno reduce el coste computacional en comparacion con un transformer denso convencional, manteniendo la capacidad de modelar dependencias de largo alcance. Al ser una variante VL, incorpora un codificador de vision que se distribuye por separado en formato mmproj (BF16), de modo que el uso multimodal requiere cargar ese archivo junto a la cuantizacion principal.

No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de ajuste (RLHF, DPO, etc.) del modelo Melinoe. La cuantizacion GGUF fue realizada por spiritfather de forma estatica, sin recalibracion, y esta orientada a la evaluacion en CaliperBench, un benchmark de escritura creativa que puntua la calidad de la prosa, el roleplay y la disposicion del modelo. El repositorio incluye 11 cuantizaciones distintas, ordenadas por tamano, con recomendaciones del autor sobre cuales son preferibles (IQ-quants sobre non-IQ de tamano similar, y Q4_K_M como opcion equilibrada).

## Capacidades

- Generacion de texto creativo: prosa narrativa, dialogos y roleplay, segun los tags del modelo y su orientacion a CaliperBench.
- Comprension de imagenes: al ser un modelo VL, puede procesar entradas visuales si se carga el proyector mmproj junto con la cuantizacion.
- Uso multimodal con llama.cpp: requiere el archivo `mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf` junto a la cuantizacion principal, invocando `llama-server -m <quant>.gguf --mmproj mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf`.
- Uso solo texto: funciona sin el proyector de vision, cargando unicamente la cuantizacion GGUF.
- Generacion de texto conversacional: pipeline text-generation, apto para chat y asistentes.
- Escritura en ingles: el modelo esta entrenado principalmente en ingles (tag `language: en`).

## Casos de uso

- Escritura creativa asistida: el modelo puede generar narraciones, descripciones y dialogos de calidad literaria, aprovechando su ajuste especifico para prosa y roleplay. Se integraria en herramientas de escritura como un generador de borradores o un coautor interactivo.
- Roleplay conversacional: su orientacion a CaliperBench (que puntua roleplay y disposicion) lo hace adecuado para personajes interactivos en juegos de rol, simulaciones o chatbots de ficcion. La cuantizacion Q4_K_M permite ejecutarlo en una GPU de 24 GB con latencia aceptable.
- Descripcion de imagenes para narracion: combinando el proyector de vision, puede generar descripciones narrativas a partir de fotografias o ilustraciones, util para guiones, storyboards o material didactico.
- Creacion de contenido multimodal: generar texto basado en entradas visuales, aplicable a blogs, redes sociales o documentacion tecnica que requiera descripciones ricas de imagenes.
- Prototipado de asistentes conversacionales: su licencia Apache-2.0 permite integrarlo en aplicaciones comerciales sin restricciones de uso, lo que facilita el desarrollo de prototipos de asistentes con personalidad definida.
- Evaluacion de calidad de escritura: al estar cuantizado especificamente para CaliperBench, puede usarse como referencia en pipelines de evaluacion de generacion de texto creativo, comparando puntuaciones de prosa y roleplay entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta siendo evaluado en CaliperBench, un benchmark de escritura creativa que puntua prosa, roleplay y disposicion, pero las puntuaciones aun no se han publicado. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K (10,7 GB) requiere aproximadamente 12 GB; Q4_K_M (16,5 GB) requiere aproximadamente 18 GB; Q8_0 (28,6 GB) requiere aproximadamente 30 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) pueden ejecutar cuantizaciones hasta Q5_K_M (19,2 GB); para Q6_K (22,1 GB) y Q8_0 (28,6 GB) se necesitan GPUs de 32 GB o mas, como A6000, A100 o H100.
- En GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB (RTX 4080, RTX 3090, RTX 4090).
- Opciones de despliegue: llama.cpp (llama-server), Ollama u otros runners compatibles con GGUF. vLLM no es compatible directamente con GGUF, aunque el modelo base en safetensors si lo es.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melinoe-Qwen3-8-27B-VL-GGUF (este) | 26,9 B | no disponible | Apache-2.0 | GGUF | Cuantizacion estatica para escritura creativa |
| Qwen3.8-27B (base) | 27 B | no disponible | Apache-2.0 | safetensors | Modelo denso original de la familia Qwen3.8, con atencion hibrida |
| Qwen3.8-30B-A3B (MoE) | no disponible | no disponible | no disponible | no disponible | Miembro MoE de la familia Qwen3.8, no comparable directamente por arquitectura |

No se dispone de datos suficientes para una comparativa exhaustiva con otros modelos de la misma categoria. La informacion disponible no incluye resultados de benchmarks estandar que permitan comparar rendimiento con alternativas como Llama 3.1 27B o Mistral Large.

## Limitaciones y advertencias

- Sesgos: no se dispone de informacion sobre sesgos especificos del modelo, pero al estar entrenado principalmente en ingles, puede presentar sesgos culturales anglocentricos.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de hechos o citas.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la informacion disponible, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Idioma: el modelo solo soporta ingles; no es adecuado para generacion en otros idiomas, incluido el castellano.
- Cuantizacion estatica: al ser una cuantizacion sin recalibracion, puede haber perdida de calidad en tareas de alta precision, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K).
- Vision: el uso multimodal requiere cargar el proyector mmproj por separado; sin el, el modelo no procesa imagenes. El archivo mmproj esta en BF16, lo que anade aproximadamente 1-2 GB adicionales de VRAM.
- Adopcion limitada: el repositorio tiene 0 descargas y 0 likes, lo que indica que el modelo no ha sido validado por la comunidad aun.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF
- Modelo base: https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL
- Cuantizacion Q4_K_M del modelo base: https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL-Q4_K_M-GGUF
- Documentacion vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- CaliperBench: https://caliperbench.com
