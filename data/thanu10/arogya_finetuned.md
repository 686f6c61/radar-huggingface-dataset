# Thanu10/Arogya_Finetuned

## Resumen

Arogya_Finetuned es un ajuste fino (fine-tune) publicado por el usuario Thanu10 (Thanujaya Tennekoon) sobre el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, es decir, una version ya cuantizada a 4 bits de Gemma 3 4B Instruct preparada para entrenamiento con Unsloth. El repositorio esta etiquetado con `transformers`, `safetensors`, `text-generation-inference`, `unsloth`, `gemma3` y `trl`, lo que indica que el entrenamiento se realizo con la libreria TRL sobre la infraestructura de Unsloth. La licencia declarada es apache-2.0 y el unico idioma declarado es el ingles.

El problema que resuelve no esta documentado en la model card: la ficha publicada es la plantilla automatica de Unsloth y no incluye descripcion del dataset, del objetivo del ajuste ni de la tarea concreta. El nombre del repositorio ("Arogya", termino relacionado con salud o bienestar en sanscrito) sugiere un dominio sanitario, pero esto es una inferencia a partir del nombre y no una afirmacion respaldada por la documentacion disponible.

Su relevancia actual es limitada y fundamentalmente experimental: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, no incluye resultados de evaluacion y el tamano declarado del repositorio es de 0,0 GB, lo que plantea dudas sobre si los pesos estan efectivamente subidos. Se trata, por tanto, de un artefacto de interes unicamente como ejemplo de flujo de trabajo de fine-tuning con Unsloth + TRL sobre Gemma 3 4B, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; heredada del modelo base Gemma 3 4B (transformer decoder-only con capacidades multimodales) |
| Parametros totales | no disponible en la model card; el modelo base Gemma 3 4B declara aproximadamente 4.000 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Gemma 3 4B declara 128.000 tokens |
| Tipos de cuantizacion | el modelo base esta cuantizado a 4 bits con bitsandbytes (bnb-4bit); no se documentan otros formatos |
| Idiomas soportados | en (unico idioma declarado en el repositorio) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |

Datos adicionales del repositorio: autor Thanu10, libreria `transformers`, pipeline no disponible, 0 descargas, 0 likes, tamano del repositorio 0,0 GB, fecha de creacion y ultima actualizacion 2026-09-27.

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura del ajuste fino ni sobre el proceso de entrenamiento. Lo unico documentado es el modelo de partida (`unsloth/gemma-3-4b-it-unsloth-bnb-4bit`), la libreria de entrenamiento (TRL, segun las etiquetas) y el hecho de que el entrenamiento se ejecuto con Unsloth, cuyo mensaje promocional indica que "este modelo gemma3 fue entrenado 2 veces mas rapido con Unsloth". No se especifica numero de tokens de entrenamiento, composicion del dataset, numero de pasos, hiperparametros, ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o SFT supervisado estandar.

En consecuencia, la arquitectura efectiva debe entenderse como la del modelo base: Gemma 3 4B Instruct, un transformer decoder-only con ventana de contexto declarada de 128.000 tokens y capacidad multimodal de entrada imagen-texto, segun la documentacion publica de Google para la familia Gemma 3. El repositorio hermano del mismo autor (`Thanu10/Arogya_finetuned_4bit`) aparece etiquetado como "Image-Text-to-Text", lo que respalda que la familia conserva la torre de vision del modelo base, aunque esto no se confirma para esta variante concreta. El ajuste se realizo sobre pesos ya cuantizados a 4 bits (QLoRA), lo que reduce los requisitos de memoria de entrenamiento a costa de una perdida de precision potencialmente mayor que un LoRA sobre pesos en precision completa.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 4B Instruct.
- Razonamiento basico y respuesta a instrucciones, con el nivel propio de un modelo de 4.000 millones de parametros.
- Entrada multimodal imagen-texto: plausible por herencia del modelo base y por las etiquetas del repositorio hermano, pero no confirmada en la model card de este repositorio.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Gemma 3 IT si lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para este fine-tune; solo se declara ingles. El modelo base soporta mas de 140 idiomas segun Google.
- Capacidades especiales (modo thinking, audio, vision): no documentadas mas alla de la posible herencia multimodal.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse con text-generation-inference para validar un flujo conversacional basico antes de invertir en un modelo mayor, dado su tamano reducido y su formato safetensors compatible con transformers.
- Experimentacion academica con QLoRA: sirve como referencia de un pipeline completo Unsloth + TRL sobre un modelo cuantizado a 4 bits, util para comparar curvas de perdida y consumo de VRAM frente a otros ajustes.
- Evaluacion de la herencia multimodal de Gemma 3 en ajustes finos: si se confirma la torre de vision, permite probar si un ajuste de texto degrada o conserva las capacidades de descripcion de imagenes del modelo base.
- Generacion de texto en dominios sanitarios: dado el nombre del modelo, podria emplearse en tareas de divulgacion o clasificacion de texto clinico en ingles, siempre que se valide antes el dataset de ajuste (no documentado) y se asuma la ausencia de garantias clinicas.
- Base para destilacion o generacion de datos sinteticos: un modelo de 4.000 millones de parametros es viable para producir grandes volumenes de texto etiquetado en ingles en pipelines internos, con coste de inferencia bajo.
- Pruebas de integracion con TGI y endpoints compatibles: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usarlo como banco de pruebas para validar despliegues en Hugging Face Inference Endpoints antes de migrar a un modelo mayor.
- Comparacion de tecnicas de cuantizacion: permite medir la diferencia de calidad entre el modelo base bnb-4bit y el ajuste resultante, aunque no existan metricas publicadas que documenten esa diferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares) y el repositorio no referencia ningun informe tecnico o espacio de evaluacion asociado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8-9 GB para los aproximadamente 4.000 millones de parametros del modelo base, mas el coste de la cache KV segun la longitud de contexto utilizada.
- VRAM estimada con cuantizacion de 8 bits: en torno a 5-6 GB.
- VRAM estimada con cuantizacion de 4 bits (NF4/AWQ/GPTQ): en torno a 3-4 GB en pesos, con overhead adicional de activaciones y cache KV.
- GPU recomendadas: tarjetas de 24 GB como RTX 3090 o RTX 4090 para trabajar comodamente en precision completa o con contextos largos; A100 40/80 GB o H100 para despliegue con batching y contextos de 128.000 tokens.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en GPUs de 8-12 GB si se usa cuantizacion de 4 bits y contextos moderados; en 16 GB se puede operar con margen en precision completa para contextos cortos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio) y, por el formato de pesos y la familia base, Ollama, llama.cpp o vLLM siempre que se generen los artefactos GGUF o AWQ correspondientes, que no se distribuyen en este repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Arogya_Finetuned (este modelo) | ~4.000 M (heredado del base) | 128.000 tokens segun el base, no confirmado | apache-2.0 declarada | Repositorio HuggingFace con 0 descargas y 0,0 GB | No |
| google/gemma-3-4b-it | ~4.000 M | 128.000 tokens | Gemma Terms of Use | Ampliamente disponible | Si, en la documentacion oficial de Google |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 M | 32.000 tokens nativos, ampliable con YaRN | Apache 2.0 en la mayoria de variantes | Ampliamente disponible | Si |
| meta-llama/Llama-3.2-3B-Instruct | ~3.000 M | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible | Si |

La comparacion de rendimiento no puede completarse porque este repositorio no publica metricas. La comparacion de licencias merece atencion: los modelos base de la familia Gemma se distribuyen bajo los Gemma Terms of Use de Google, no bajo Apache 2.0, por lo que la licencia apache-2.0 declarada en este repositorio es una posible inconsistencia que conviene aclarar con el autor antes de cualquier uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al ser un ajuste de Gemma 3 4B, hereda los sesgos del modelo base y potencialmente los del dataset de ajuste, que no se especifica.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones cualitativas publicadas que permitan acotar la tasa de alucinacion.
- Limitaciones de contexto: la ventana de 128.000 tokens corresponde al modelo base y no esta confirmada para este ajuste; un fine-tune puede degradar el comportamiento en contextos largos si el dataset de entrenamiento era de secuencias cortas.
- Limitaciones de idioma: solo se declara ingles. No hay evidencia de que el ajuste conserve las capacidades multilingues del modelo base.
- Restricciones de licencia: la model card declara apache-2.0, pero el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use de Google, que incluyen obligaciones de atribucion y restricciones de uso. La compatibilidad entre ambas licencias no esta aclarada y es un riesgo juridico para uso comercial.
- Trazabilidad del entrenamiento: no se documentan dataset, hiperparametros, numero de pasos ni criterios de seleccion del checkpoint, lo que impide reproducir el ajuste o auditar su comportamiento.
- Integridad del repositorio: el tamano declarado es de 0,0 GB con 0 descargas, lo que sugiere que los pesos podrian no estar subidos o que el repositorio solo contiene metadatos. Conviene verificar la pestana de archivos antes de intentar la descarga.
- Cuantizacion de partida: al haberse ajustado sobre pesos ya cuantizados a 4 bits (bnb-4bit), la calidad final puede ser inferior a la de un LoRA equivalente entrenado sobre pesos en bf16.
- Soporte de tool calling y agentes: no documentado en este repositorio, aunque el modelo base lo soporte.
- Ausencia de mantenimiento: sin descargas, sin likes y sin actividad posterior a la fecha de publicacion, no hay garantia de soporte ni de correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thanu10/Arogya_Finetuned
- Repositorio hermano del mismo autor: https://huggingface.co/Thanu10/Arogya_finetuned_4bit
- Otro repositorio relacionado: https://huggingface.co/Thanu10/Arogya_fine_tuned
- Perfil del autor en HuggingFace: https://huggingface.co/Thanu10
- Listado de modelos del autor: https://huggingface.co/Thanu10/models
- Ficha de inferencia en FriendliAI para el repositorio hermano: https://friendli.ai/models/Thanu10/Arogya_finetuned_4bit
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
