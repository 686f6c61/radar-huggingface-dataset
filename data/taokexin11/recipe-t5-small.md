# taokexin11/recipe-t5-small

## Resumen

recipe-t5-small es un ajuste fino de T5-small, el modelo encoder-decoder de Google presentado en 2019, desarrollado por el usuario taokexin11. Su proposito es convertir una lista de ingredientes disponibles en una receta de cocina completa, con titulo y pasos de preparacion. El modelo resuelve un problema acotado de generacion condicionada de texto: dado un conjunto de ingredientes, producir instrucciones culinarias coherentes.

Con 60.506.624 parametros, se trata de un modelo compacto que puede ejecutarse en hardware modesto, incluso en CPU para inferencia puntual. El entrenamiento se realizo sobre el dataset Food.com Recipes and Interactions, filtrando recetas con entre 3 y 15 ingredientes y entre 3 y 12 pasos. El modelo se entreno durante 3 epocas con batch de 16 en fp16 sobre una GPU T4 de Colab, lo que situa su coste de entrenamiento en un rango muy bajo.

Es relevante como ejemplo de ajuste fino de bajo coste sobre un modelo base pequeno, orientado a una tarea de nicho. No obstante, sus metricas de calidad son moderadas (BLEU-4 de 0,0909 y ROUGE-L F1 de 0,2982 sobre 300 ejemplos de test), lo que refleja las limitaciones de un modelo de este tamano para generacion de texto abierto. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (T5-small admite hasta 512 tokens de entrada; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se podria cuantizar a 8 y 4 bits con herramientas estandar, pero no se documenta) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es en ingles, por lo que el uso practico se limita al ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de T5-small, un transformer encoder-decoder con atencion completa y normalizacion pre-LN. La arquitectura T5 emplea un esquema de text-to-text unificado: todas las tareas se formulan como generacion condicionada de texto, lo que encaja con el formato de entrada `generate a cooking recipe using these ingredients: ...` y salida `title: ... steps: ...`. No se documentan modificaciones arquitectonicas sobre el modelo base.

El entrenamiento se realizo sobre el dataset shuyangli94/food-com-recipes-and-user-interactions, concretamente sobre el fichero RAW_recipes.csv, filtrado a recetas con entre 3 y 15 ingredientes y entre 3 y 12 pasos. Se aplicaron 3 epocas con batch de 16 en precision fp16 sobre una GPU T4 de Colab. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero total de tokens de entrenamiento. La model card no detalla la composicion exacta del split de entrenamiento, validacion y test, aunque se reportan resultados sobre 300 ejemplos de test.

## Capacidades

- Generacion de recetas de cocina a partir de una lista de ingredientes, con titulo y pasos de preparacion.
- Generacion de texto condicionada en ingles, limitada a la tarea de cocina para la que fue ajustado.
- Salida con un maximo de 256 tokens nuevos (segun el ejemplo de uso de la model card).
- Decodificacion con busqueda por haces (`num_beams=4`) soportada por la API de Transformers.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el dataset de entrenamiento es en ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de recetas a partir de ingredientes sobrantes: el modelo recibe una lista como "egg, tomato, rice" y devuelve un titulo y pasos de preparacion. Es adecuado para aplicaciones de cocina domestica que buscan reducir el desperdicio de alimentos.
- Prototipado rapido de asistentes culinarios: al ser un modelo de 60 millones de parametros, se puede desplegar en una API ligera o incluso en un portatil para validar la experiencia de usuario antes de invertir en modelos mayores.
- Educacion y demostraciones de ajuste fino: sirve como ejemplo didactico de fine-tuning de T5-small sobre un dataset concreto, con metricas BLEU y ROUGE reportadas.
- Generacion de borradores de recetas para revision humana: el modelo produce un punto de partida que un editor puede corregir, util en flujos de creacion de contenido culinario de bajo coste.
- Filtrado y enriquecimiento de bases de datos de recetas: dado un conjunto de ingredientes, se pueden generar variantes o descripciones para completar fichas incompletas.
- Experimentacion academica en generacion condicionada: su tamano reducido permite ejecutar experimentos de ablation o comparaciones de decodificacion en hardware limitado, como una T4 o incluso CPU.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 300 ejemplos de test:

| Metrica | Valor |
|---|---|
| BLEU-4 | 0,0909 |
| ROUGE-L F1 | 0,2982 |
| Cobertura de ingredientes | 0,597 |
| Distinct-2 | 0,152 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,24 GB solo para pesos (60,5 M de parametros x 4 bytes), mas overhead de activaciones y cache; en la practica, menos de 1 GB.
- En fp16: aproximadamente 0,12 GB para pesos, con un consumo total inferior a 1 GB.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060 y superiores; tambien es viable en CPU para inferencia por lotes pequenos.
- GPU recomendadas para entrenamiento o ajuste fino: T4 (la usada por el autor), RTX 3090, RTX 4090, A100; el entrenamiento cabe en cualquier GPU con al menos 4-8 GB de VRAM.
- Opciones de despliegue: transformers (PyTorch), con posibilidad de exportacion a ONNX; no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo T5 estandar podria adaptarse a algunas de estas herramientas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recipe-t5-small | 60,5 M | no disponible | Generacion de recetas | Apache 2.0 | Hugging Face |
| T5-small (base) | 60,5 M | 512 tokens | Text-to-text general | Apache 2.0 | Hugging Face |
| T5-base | 220 M | 512 tokens | Text-to-text general | Apache 2.0 | Hugging Face |
| FLAN-T5-small | 77 M | 512 tokens | Instrucciones generales | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la familia T5, ya que no se dispone de informacion sobre otros modelos especificos de generacion de recetas. Frente a T5-small base, recipe-t5-small esta especializado en cocina pero pierde capacidades generales. Frente a T5-base o FLAN-T5-small, ofrece menor calidad potencial pero un coste de inferencia inferior.

## Limitaciones y advertencias

- Calidad de generacion moderada: BLEU-4 de 0,0909 y ROUGE-L F1 de 0,2982 indican que las recetas generadas pueden ser genericas o poco fieles a los ingredientes de entrada.
- Cobertura de ingredientes del 59,7 %: aproximadamente 4 de cada 10 ingredientes proporcionados pueden no aparecer en la receta generada.
- Riesgo de alucinacion: el modelo puede inventar cantidades, tiempos de coccion o pasos no fundamentados, lo que es especialmente critico en contexto culinario (alergenos, temperaturas de seguridad alimentaria).
- Entrenado unicamente en ingles: no se garantiza un funcionamiento correcto en castellano ni en otros idiomas.
- Dataset de origen limitado: Food.com puede contener sesgos culturales y culinarios (predominio de cocina estadounidense) y recetas de calidad variable.
- Sin alineacion adicional: no se documenta RLHF ni DPO, por lo que no hay garantias de que las salidas sean seguras o apropiadas en todos los contextos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre las salidas generadas.
- Modelo de nicho: no debe usarse para tareas generales de generacion de texto, razonamiento o codigo.
- Fecha de creacion futura (2026-11-05) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/taokexin11/recipe-t5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/shuyangli94/food-com-recipes-and-user-interactions
- Paper de T5 (Google, 2019): https://arxiv.org/abs/1910.10683
- Documentacion de Transformers para T5: https://huggingface.co/docs/transformers/model_doc/t5
