# tidalove/Molmo2Fish

## Resumen

Molmo2Fish es un modelo de vision-language desarrollado por Kai Van Brunt, en colaboracion con Justin Kay y Sara Beery, que parte del modelo base Molmo2-8B de Ai2 y se ha ajustado mediante LoRA para el seguimiento de peces en video de sonar y la correccion de esos seguimientos mediante instrucciones en lenguaje natural. El modelo trata la correccion de tracks como una conversacion: recibe un conjunto de tracks existentes —ya sean predicciones propias, salidas de otro tracker o ground truth corrupto—, se le describe en palabras que es incorrecto, y devuelve un conjunto de tracks reparados.

Esta especializado en el dominio ecologico del conteo de peces, concretamente en el dataset Caltech Fish Counting (CFC26), y se entrena con una mezcla de datos que incluye tracking puro, correccion dirigida, correccion de predicciones reales del modelo y correccion solo de texto. Su relevancia radica en que permite a los ecologos interactuar con un sistema de tracking de forma natural, describiendo errores en lenguaje ordinario en lugar de programar correcciones manuales. El modelo usa la arquitectura de Molmo2-8B con adaptadores LoRA de rango 64 en los tres componentes (LLM, ViT y conector), y se distribuye con pesos en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Molmo2-8B (transformer vision-language) con adaptadores LoRA rango 64 en LLM, ViT y conector |
| Parametros totales | 8 mil millones (modelo base Molmo2-8B; no se especifica el incremento por LoRA) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican como safetensors sin cuantificar) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Molmo2-8B, un vision-language transformer de la suite Molmo 2 de Ai2, que incluye componentes de LLM, ViT y un conector. El fine-tuning se realiza mediante LoRA de rango 64 sobre los tres componentes, manteniendo los pesos base congelados, lo que permite ajustar el modelo a la tarea de tracking con un coste computacional reducido.

El entrenamiento se lleva a cabo con `torchrun` en 8 nodos, durante 420 pasos, sobre la mezcla `cfc_correction`. Esta mezcla combina: tracking puro, correccion dirigida, correccion de tracks sinteticamente corruptos, correccion de predicciones reales del modelo a dos niveles de calidad (`molmo_high` y `molmo_low`), y correccion solo de texto. No se menciona el uso de RLHF ni DPO; el metodo es un fine-tuning supervisado clasico con LoRA.

## Capacidades

- Seguimiento de objetos (peces) en video de sonido, produciendo tracks de posicion a lo largo del tiempo.
- Correccion interactiva de tracks mediante feedback en lenguaje natural, tratando la tarea como una conversacion multi-turno.
- Recepcion de tracks de origen diverso (predicciones propias, de otro tracker o ground truth corrupto) y reparacion de los mismos.
- Generacion de texto descriptivo del estado de los tracks, incluyendo metricas de calidad como HOTA y nMAE.
- Capacidades multilingues: no disponibles (no se documentan).
- Soporte de tool calling, agentes o vision de imagenes estaticas: no documentado en la informacion proporcionada.

## Casos de uso

- Monitorizacion ecologica de poblaciones marinas: el modelo puede analizar video de sonar para contar y seguir peces automaticamente, lo que facilita la evaluacion de biomasa y migraciones.
- Correccion interactiva de tracks en sistemas de tracking existentes: un ecologo puede describir en lenguaje natural que un track se ha perdido o que un pez se ha dividido en dos, y el modelo repara los tracks.
- Integracion en pipelines de ciencia ciudadana: donde voluntarios suben videos de sonar y el modelo genera tracks corregidos que luego son revisados por expertos.
- Evaluacion de calidad de trackers: al recibir la salida de otros algoritmos de tracking, el modelo puede corregir errores y proporcionar una version mejorada, sirviendo de referencia.
- Generacion de datos de entrenamiento corregidos: el modelo puede producir tracks corregidos que se usan como ground truth para entrenar otros modelos de deteccion.
- Asistencia a investigadores en ecologia: permite ajustar el comportamiento del sistema de tracking sin necesidad de programar, mediante descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card describe la evaluacion de la tarea de correccion de tracks con metricas `HOTA_before` (calidad de los tracks entregados al modelo), `HOTA_after` (calidad de los tracks devueltos) y `norm_delta_HOTA` (fraccion del margen de mejora cubierto), ademas de un desglose por rio y el error direccional de conteo neto `nMAE`. Sin embargo, no se proporcionan los valores numericos de estas metricas en la documentacion.

La evaluacion se realiza en clips de 6 fps con tracks anotados a 2 fps, extraidos de los videos originales de CFC, por lo que los resultados no son comparables con los calculados sobre la publicacion original del dataset CFC.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentacion.
- Estimacion razonada: al ser un modelo de 8 mil millones de parametros basado en Molmo2-8B, la inferencia en precision fp16 requiere aproximadamente 16-24 GB de VRAM, por lo que cabe en una GPU de consumo como una RTX 4090 (24 GB) o una A100 de 40 GB en entornos profesionales.
- Con cuantizacion de 4 bits podria ejecutarse en GPU con 8-12 GB de VRAM, aunque no se publican versiones GGUF ni cuantizadas en el repositorio.
- Opciones de despliegue: el repositorio menciona compatibilidad con vLLM y la libreria `transformers`. Tambien se puede usar con el codigo de evaluacion `launch_scripts/hf_eval.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables en la misma categoria de tracking de peces con correccion mediante lenguaje natural. El modelo mas cercano es el Molmo2-8B base, del que deriva, pero no es un competidor directo sino el modelo original sobre el que se ha ajustado. No se dispone de informacion sobre otros modelos de vision-language especializados en seguimiento de objetos en video con feedback conversacional.

## Limitaciones y advertencias

- Especializado en el dominio del dataset Caltech Fish Counting; puede no generalizar a otros entornos de video de sonar con caracteristicas distintas.
- Las metricas de evaluacion se calculan en clips de 6 fps y no son comparables con las del release original de CFC, por lo que los resultados deben interpretarse en ese contexto.
- No se especifican idiomas soportados; probablemente este limitado al ingles, ya que el dataset de instrucciones y el articulo estan en ingles.
- Riesgo de alucinacion en la generacion de tracks corregidos, especialmente cuando el feedback es ambiguo o los tracks de entrada son muy ruidosos.
- No se documentan sesgos especificos, pero al ser un modelo de dominio, su comportamiento fuera del dominio de sonar puede ser impredecible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de los datos de CFC26, que pueden tener restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tidalove/Molmo2Fish
- Codigo del modelo: https://github.com/tidalove/molmo2fish
- Dataset de instrucciones: https://huggingface.co/datasets/tidalove/cfc-track-instruction
- Video fuente (Caltech Fish Counting): https://huggingface.co/datasets/perona-lab/cfc26
- Blog de Molmo 2 (Ai2): https://allenai.org/blog/molmo2
- Pagina de Molmo en Ai2: https://allenai.org/molmo
- Repositorio de Molmo (GitHub): https://github.com/allenai/molmo
