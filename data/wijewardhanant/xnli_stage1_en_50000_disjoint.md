# WijewardhanaNT/xnli_stage1_en_50000_disjoint

## Resumen

`WijewardhanaNT/xnli_stage1_en_50000_disjoint` es un adaptador LoRA publicado en Hugging Face por el usuario WijewardhanaNT, entrenado sobre el modelo base `meta-llama/Llama-2-7b-hf`. Por el identificador se deduce que se trata de un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural entre idiomas), en su variante inglesa, con un conjunto de 50 000 ejemplos y una particion "disjoint". No obstante, la model card no confirma esta interpretacion ni aporta detalles sobre el dataset, el procedimiento o los hiperparametros.

El repositorio contiene unicamente los pesos del adaptador en formato safetensors bajo la libreria PEFT (version 0.21.0), con un tamano aproximado de 0,5 GB. No incluye pesos completos del modelo base, por lo que para utilizarlo es necesario descargar por separado Llama-2-7b-hf y cargar el adaptador encima mediante `peft`.

La relevancia de esta publicacion es limitada: se trata de un artefacto de investigacion sin documentacion tecnica, sin resultados de evaluacion y sin metricas de rendimiento declaradas. Resulta util unicamente como referencia para reproducir experimentos de ajuste LoRA sobre Llama-2 en tareas de NLI, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-hf) con adaptador LoRA |
| Parametros totales | 7 000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-hf) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (el identificador sugiere ingles, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-7b-hf, un transformer decoder-only con 7 000 millones de parametros, atencion causal estandar, normalizacion RMSNorm y activacion SwiGLU, con una ventana de contexto de 4096 tokens. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de baja dimension en determinadas capas, reduciendo drasticamente el numero de parametros entrenables y el coste de almacenamiento (0,5 GB frente a los aproximadamente 13,5 GB del modelo completo en fp16).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni los hiperparametros de LoRA (rango, alpha, capas objetivo). El identificador "xnli_stage1_en_50000_disjoint" sugiere un entrenamiento en una sola etapa sobre 50 000 ejemplos del corpus XNLI en ingles con una particion disjunta, pero este extremo no esta documentado en la model card. No se declaran innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama-2-7b-hf.
- Ajuste especifico (presuntamente) para clasificacion de pares de frases en la tarea XNLI (entailment, contradiction, neutral), sin confirmacion documental.
- Soporte de tool calling: no disponible de forma nativa en Llama-2-7b-hf.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el identificador apunta a un ajuste solo en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion academica en NLI: el adaptador puede cargarse sobre Llama-2-7b-hf para reproducir experimentos de inferencia de lenguaje natural en ingles, comparando el rendimiento del ajuste LoRA frente al modelo base.
- Estudio de tecnicas de adaptacion eficiente: sirve como ejemplo de artefacto LoRA para analizar el impacto de la particion "disjoint" en la generalizacion del ajuste.
- Base para ajustes posteriores: dado que el adaptador es ligero (0,5 GB), puede combinarse o continuarse con otros entrenamientos LoRA sobre el mismo modelo base.
- Evaluacion de sesgos en modelos ajustados: permite comparar el comportamiento de Llama-2-7b-hf antes y despues del ajuste en tareas de clasificacion semantica.
- Prototipado de pipelines de clasificacion de pares de frases: con la debida validacion, podria integrarse en un pipeline de transformers + PEFT para tareas de entailment en ingles.
- Docencia y formacion: util como ejemplo practico de publicacion de adaptadores PEFT en Hugging Face y de carga con `peft.PeftModel`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-14 GB en fp16 para el modelo base completo; en cuantizacion 4 bits (GPTQ/AWQ/GGUF) puede reducirse a 4-6 GB. El adaptador anade un coste marginal.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantizacion 4 bits.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 o superiores en fp16; en RTX 3060/4060 Ti (12-16 GB) solo con cuantizacion.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_stage1_en_50000_disjoint | 7 000 M (base) + LoRA | 4096 | No disponible | Safetensors (PEFT) | Sin benchmarks ni documentacion |
| meta-llama/Llama-2-7b-hf | 7 000 M | 4096 | Llama 2 Community License | Safetensors | Modelo base sin ajuste |
| Adaptadores LoRA publicos para Llama-2 (genericos) | 7 000 M (base) + LoRA | 4096 | Variable | Safetensors (PEFT) | Depende del autor; muchos sin evaluacion |
| Mistral-7B-v0.1 | 7 000 M | 8192 | Apache 2.0 | Safetensors | Alternativa con contexto mayor y licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar; no se declaran datos de entrenamiento, hiperparametros ni evaluacion.
- Licencia no especificada: no puede asumirse uso comercial; ademas, el modelo base Llama-2-7b-hf esta sujeto a la Llama 2 Community License, con restricciones de uso.
- Riesgo de alucinacion: inherente a Llama-2-7b-hf; el ajuste LoRA no lo mitiga y podria acentuarlo en dominios especificos.
- Sesgos conocidos: los del modelo base (sesgos de genero, raza, idioma), no evaluados en este adaptador.
- Limitacion de idioma: el identificador sugiere un ajuste solo en ingles; el rendimiento en castellano no esta documentado.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo.
- Sin garantias de calidad: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- No apto para produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_stage1_en_50000_disjoint
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Referencia PEFT: https://github.com/huggingface/peft
- Referencia XNLI (paper): https://arxiv.org/abs/1809.05053
- Referencia LoRA (paper): https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
