# Suqin-Test/turingtest-iclr2027-key-models-20261105

## Resumen

El repositorio `Suqin-Test/turingtest-iclr2027-key-models-20261105` es una coleccion de checkpoints finales de modelos de lenguaje publicados por el autor Suqin-Test bajo el contexto de un envio a ICLR 2027 (segun el propio nombre del repositorio y la model card). No se trata de un modelo unico, sino de un conjunto de seis directorios con pesos en formato safetensors, cada uno correspondiente a una variante de ajuste fino sobre modelos base conocidos: Qwen2.5-3B, Qwen2.5-7B y Llama-3-8B.

El objetivo declarado es servir como material de replicacion parcial para un estudio comparativo de metodos de alineamiento (SFT, DPO y SimPO) y de experimentos de escala y orden de entrenamiento. La model card indica que el codigo, las configuraciones, el paper y los resultados completos se conservan en un archivo privado de replica, por lo que el repositorio publico contiene exclusivamente los pesos finales.

La relevancia de esta ficha es limitada desde el punto de vista de uso en produccion: se trata de artefactos de investigacion sin model card tecnica detallada, sin licencia declarada y sin benchmarks publicados en la informacion disponible. Su interes es principalmente reproducibilidad de experimentos de alineamiento sobre modelos abiertos de 3B a 8B de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base: Qwen2.5 y Llama-3) |
| Parametros totales | 3B, 7B y 8B segun la variante (qwen25-3b-*, qwen25-7b-*, llama3-8b-*) |
| Parametros activos | no disponible (no se indica que sean modelos MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Variantes incluidas en el repositorio:

| Directorio | Modelo base | Metodo de ajuste |
|---|---|---|
| `qwen25-3b-dolly-human-sft` | Qwen2.5-3B | SFT sobre respuestas humanas (Dolly) |
| `qwen25-3b-shp-dpo` | Qwen2.5-3B | DPO sobre SHP |
| `qwen25-3b-shp-simpo` | Qwen2.5-3B | SimPO sobre SHP |
| `qwen25-3b-training-order-sft` | Qwen2.5-3B | SFT, experimento de orden de entrenamiento |
| `qwen25-7b-shp-sft` | Qwen2.5-7B | SFT sobre SHP |
| `llama3-8b-shp-sft` | Llama-3-8B | SFT sobre SHP |

## Arquitectura y entrenamiento

Cada checkpoint hereda la arquitectura del modelo base correspondiente. Qwen2.5-3B y Qwen2.5-7B son transformers decoder-only de la familia Qwen2.5; Llama-3-8B es un transformer decoder-only de Meta. No se aportan en la informacion disponible detalles sobre numero de capas, dimensiones ocultas, atencion (GQA/MHA) ni vocabulario, mas alla de lo que implican los propios modelos base.

Respecto al entrenamiento, la model card unicamente enumera los metodos aplicados: supervised fine-tuning (SFT) sobre respuestas humanas de Dolly y sobre el dataset SHP, direct preference optimization (DPO) y SimPO como alternativas de optimizacion de preferencias, ademas de un experimento de orden de entrenamiento y dos experimentos de escala (7B y 8B). No se especifican hiperparametros, numero de tokens de entrenamiento, composicion exacta de los datasets, ni si hubo etapas adicionales de RLHF. Tampoco se documentan innovaciones tecnicas propias; el valor del repositorio es la comparacion controlada entre metodos sobre bases equivalentes.

## Capacidades

- Generacion de texto autoregresiva, heredada de los modelos base Qwen2.5 y Llama-3.
- Razonamiento y respuesta a instrucciones en la medida en que lo permitan los ajustes SFT/DPO/SimPO aplicados.
- Capacidades multilingues: no documentadas en este repositorio; dependen del modelo base y no se detallan.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.
- Uso previsto: evaluacion comparativa de metodos de alineamiento en entornos de investigacion.

## Casos de uso

- Replicacion de experimentos de alineamiento: comparar en igualdad de condiciones SFT, DPO y SimPO sobre Qwen2.5-3B usando los tres checkpoints `qwen25-3b-*` para medir diferencias de comportamiento en preferencias.
- Estudio de escalado de parametros: contrastar `qwen25-3b-shp-sft`, `qwen25-7b-shp-sft` y `llama3-8b-shp-sft` para analizar como varia la calidad del ajuste SFT con el tamano del modelo base.
- Analisis de orden de entrenamiento: emplear `qwen25-3b-training-order-sft` frente a otros checkpoints SFT de 3B para estudiar el efecto del orden de los datos en el resultado final.
- Investigacion sobre datos de preferencias: usar los checkpoints SHP-DPO y SHP-SimPO para comparar curvas de recompensa o tasas de victoria en evaluaciones tipo arena con jueces automaticos.
- Docencia y formacion: servir como material practico para cursos sobre post-entrenamiento, mostrando artefactos reales de SFT, DPO y SimPO sobre modelos abiertos.
- Auditoria de reproducibilidad: verificar afirmaciones de un paper en revision cargando los pesos publicados y comparando salidas con las metricas descritas en el archivo privado del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6-7 GB para las variantes de 3B, 14-16 GB para la de 7B y 16-18 GB para la de 8B, sin contar overhead de cache KV.
- VRAM estimada con cuantizacion a 8 bits: del orden de 3-4 GB (3B), 8 GB (7B) y 9 GB (8B); a 4 bits, aproximadamente 2 GB (3B), 4-5 GB (7B) y 5-6 GB (8B). Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para servir varias variantes en paralelo; RTX 4090 (24 GB) suficiente para cualquiera de las variantes individuales en bf16.
- Cabe en GPU de consumo: si, las variantes de 3B en GPUs de 8-12 GB y las de 7B/8B en GPUs de 16-24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF, y transformers con PyTorch para carga directa de safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `qwen25-3b-shp-sft` (este repo) | 3B | no disponible | no disponible | Pesos safetensors publicos | Checkpoint de investigacion |
| Qwen2.5-3B (base) | 3B | 32K (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | Hugging Face oficial | Referencia base del ajuste |
| Llama-3-8B (base) | 8B | 8K (segun Meta) | Llama 3 Community License | Hugging Face oficial | Referencia base del ajuste |
| `qwen25-7b-shp-sft` (este repo) | 7B | no disponible | no disponible | Pesos safetensors publicos | Checkpoint de investigacion |

Las cifras de contexto y licencia de los modelos base se citan a titulo orientativo a partir de la documentacion publica de sus desarrolladores; el repositorio analizado no las declara.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; los pesos heredan potencialmente las restricciones de los modelos base (Apache 2.0 para Qwen2.5, Llama 3 Community License para Llama-3), pero el autor no lo especifica.
- Sin model card tecnica: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide validar calidad o sesgos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados en este repositorio; dependen de los datasets Dolly y SHP y de los modelos base.
- Limitaciones de contexto e idioma: no declaradas; deben asumirse las de los modelos base.
- Artefacto de investigacion: pensado para replicacion de un paper en revision, no para despliegue en produccion.
- Repositorio de 56 GB con multiples variantes: requiere descarga selectiva por directorio.
- Fecha de creacion futura en los metadatos (2026-11-05): conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Suqin-Test/turingtest-iclr2027-key-models-20261105
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
