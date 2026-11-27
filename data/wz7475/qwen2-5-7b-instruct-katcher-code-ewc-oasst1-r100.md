# wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r100

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r100` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario wz7475, derivado de Qwen2.5-7B-Instruct. Por la nomenclatura del identificador, se trata de un experimento de aprendizaje continuo que combina el metodo Katcher con Elastic Weight Consolidation (EWC) sobre un conjunto de datos de codigo y el dataset OASST1, con un ratio de mezcla de 100. La model card publicada es la plantilla generica autogenerada por Hugging Face y no contiene informacion sustantiva sobre el modelo.

La relevancia de este checkpoint es principalmente academica: sirve como artefacto reproducible de una investigacion sobre mitigacion del olvido catastrofico al adaptar modelos de lenguaje a nuevos dominios (codigo) sin perder capacidades conversacionales previas (OASST1). No debe considerarse un modelo listo para produccion, ya que no hay documentacion sobre datos, hiperparametros ni evaluacion.

El repositorio tiene un tamano de 0,3 GB, lo que sugiere que solo contiene pesos parciales (por ejemplo, un adaptador o un subconjunto de tensores) y no el modelo completo de 7B en precision 16 bits, que ocuparia del orden de 15 GB. Esta discrepancia es un caveat importante para cualquiera que intente cargarlo directamente con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen2.5-7B-Instruct, presumiblemente transformer decoder-only) |
| Parametros totales | no disponible (modelo base Qwen2.5-7B-Instruct: 7,61 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base Qwen2.5-7B-Instruct: 32 768 tokens nativos, ampliable a 131 072) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (modelo base: multilingue, con especial enfasis en ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la model card. Por herencia del modelo base Qwen2.5-7B-Instruct, se trata de un transformer decoder-only con atencion por rotacion (RoPE), normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion QKV. El tamano del repositorio (0,3 GB) indica que el checkpoint publicado no contiene el modelo completo, sino probablemente un delta de pesos o un adaptador resultante del proceso de ajuste.

Respecto al entrenamiento, la unica informacion disponible es la que se deduce del identificador: se aplico Katcher (un metodo de aprendizaje continuo) junto con Elastic Weight Consolidation (EWC) para ajustar el modelo sobre datos de codigo y OASST1 con un ratio r100. No hay datos publicados sobre numero de tokens, composicion del dataset, hiperparametros, uso de RLHF/DPO ni innovaciones tecnicas adicionales. El tag `arxiv:1910.09700` presente en el repositorio corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono, incluido en la plantilla de la model card, y no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Generacion y comprension de codigo, presumiblemente reforzada por el ajuste con datos de codigo.
- Razonamiento multi-paso y matematicas basicas, segun las capacidades del modelo base.
- Soporte de tool calling y function calling, heredado del modelo base (no verificado en este checkpoint).
- Capacidades multilingues del modelo base (no verificadas tras el ajuste).
- No hay evidencia publicada de capacidades de vision, audio ni modo thinking en este checkpoint.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint sirve como artefacto reproducible para comparar Katcher + EWC frente a otros metodos de aprendizaje continuo al adaptar un modelo instructivo a un dominio especifico como el codigo.
- Reproduccion de experimentos academicos: util para validar resultados de un articulo o tesis sobre regularizacion de pesos en fine-tuning, cargando el delta sobre el modelo base Qwen2.5-7B-Instruct.
- Estudio de mezcla de datasets: el ratio r100 entre datos de codigo y OASST1 permite analizar como afecta la proporcion de datos al equilibrio entre capacidad conversacional y de programacion.
- Evaluacion de degradacion de capacidades: permite medir cuanto se pierde en tareas de instruccion general tras el ajuste en codigo, comparando contra el modelo base.
- Base para experimentos de merging: al ser un delta, puede combinarse con otros checkpoints para estudiar tecnicas de interpolacion de pesos.
- Docencia en cursos de fine-tuning: ejemplo practico de como se publica un checkpoint experimental en Hugging Face y de los riesgos de una model card incompleta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo completo en FP16: en torno a 15-16 GB (7,61 mil millones de parametros). En cuantizacion de 8 bits, aproximadamente 8 GB; en 4 bits, aproximadamente 4-5 GB.
- El repositorio publicado (0,3 GB) no es suficiente para ejecutar el modelo por si solo; requiere cargar primero Qwen2.5-7B-Instruct y aplicar el delta.
- GPU recomendadas para el modelo completo: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB en FP16.
- Cabe en GPU de consumo: RTX 4090 (24 GB) en FP16; RTX 3090 (24 GB) en FP16; RTX 4080 (16 GB) en 8 bits; RTX 4060 Ti (16 GB) en 8 bits; GPUs de 8 GB en 4 bits con cuantizacion GGUF.
- Opciones de despliegue: transformers (nativo), vLLM, TGI y llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r100 | no disponible (base 7,61 B) | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental, sin model card sustantiva |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32 768 tokens (ampliable a 131 072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados y soporte de tool calling |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,61 B | 32 768 tokens (ampliable a 131 072) | Apache 2.0 | Hugging Face | Alternativa oficial centrada en codigo, con evaluacion publicada |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,24 B | 32 768 tokens | Apache 2.0 | Hugging Face | Alternativa generalista con licencia permisiva |

## Limitaciones y advertencias

- Model card autogenerada y sin informacion: no hay datos sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base (Apache 2.0 en Qwen2.5-7B-Instruct, pero el ajuste puede tener condiciones distintas).
- Repositorio incompleto: 0,3 GB frente a los aproximadamente 15 GB esperados para un modelo de 7B en FP16; es probable que falten pesos o que sea un delta que requiere pasos de carga no documentados.
- Riesgo de olvido catastrofico: el propio objetivo del experimento (EWC) sugiere que el ajuste puede degradar capacidades del modelo base; no hay evaluacion que lo cuantifique.
- Riesgo de alucinacion: inherente a los modelos de 7B, agravado por la falta de evaluacion especifica de este checkpoint.
- Idiomas no verificados: aunque el modelo base es multilingue, el ajuste con OASST1 y codigo puede haber alterado el equilibrio linguistico.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por terceros.
- No apto para produccion sin evaluacion previa exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r100
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Paper de referencia sobre emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
