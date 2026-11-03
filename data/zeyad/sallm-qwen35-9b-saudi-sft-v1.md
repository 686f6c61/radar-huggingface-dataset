# Zeyad/SaLLM-qwen35-9b-saudi-sft-V1

## Resumen

SaLLM-qwen35-9b-saudi-sft-V1 es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario Zeyad. Su objetivo es especializar al modelo en la generación de respuestas en árabe a publicaciones y comentarios de redes sociales, incluyendo contenido mixto árabe-inglés. No es un modelo autónomo: requiere cargar los pesos del modelo base Qwen3.5-9B y aplicar el adaptador mediante PEFT.

El adaptador se entrena con QLoRA en cuantización NF4, rango 16 y alpha 32, sobre un corpus de aproximadamente 7.058 pares de publicaciones y comentarios extraídos de una única comunidad de Reddit. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en safetensors, junto con la receta de entrenamiento y el entorno de reproducción.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación con licencia Apache 2.0, sin benchmarks publicados ni validación humana de calidad, y con un alcance lingüístico limitado al árabe y al inglés. Resulta útil como referencia para quienes exploren ajuste fino de Qwen3.5-9B sobre dominios conversacionales concretos, pero no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B (Qwen3_5ForConditionalGeneration) |
| Parametros totales | No disponible (el adaptador tiene rango 16; el modelo base Qwen3.5-9B cuenta con 9.000 millones de parametros según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la secuencia máxima de entrenamiento fue de 2.048 tokens) |
| Tipos de cuantizacion | Entrenamiento en QLoRA NF4; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); requiere los pesos del modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de la familia Qwen3.5. El ajuste se realizó con QLoRA en cuantización NF4, con rango 16, alpha 32, dropout 0,05 y tasa de aprendizaje 5e-05 durante un máximo de 1 época. La longitud máxima de secuencia fue de 2.048 tokens, con microbatch 1 y acumulación de gradientes de 16, sin empaquetado (packing). La pérdida se calcula como media por ejemplo sobre los tokens de respuesta.

El corpus de entrenamiento consta de 5.627 ejemplos de entrenamiento, 736 de validación y 695 de prueba, formados por pares de publicación y comentario de redes sociales. La selección aplica exclusiones manuales y un límite de 5 comentarios por publicación, ordenados por rango de likes. Los comentarios de una misma publicación y las peticiones con duplicados léxicos detectados se mantienen en el mismo split para evitar filtración. La selección del checkpoint se hizo por pérdida de validación, sin que ello demuestre mejora en calidad conversacional ni preservación de capacidades generales.

## Capacidades

- Generación de texto conversacional en árabe e inglés, orientada a respuestas a publicaciones y comentarios de redes sociales.
- Manejo de entradas mixtas árabe-inglés, según el propósito declarado del adaptador.
- Adaptación de estilo y registro al dominio de una comunidad de Reddit concreta.
- Plantilla de chat nativa sin modo "thinking", según la receta de entrenamiento incluida.
- No se ha evaluado la retención de capacidades generales de razonamiento, código, matemáticas ni multilingüismo amplio.
- No se ha evaluado soporte de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de visión ni audio (adaptación solo de texto).

## Casos de uso

- Moderación asistida de comunidades árabes: el adaptador puede generar respuestas de seguimiento a comentarios de foros o redes, aprovechando el estilo del corpus de entrenamiento para mantener coherencia con el tono de la comunidad.
- Investigación en ajuste fino de dominio: sirve como punto de partida reproducible (receta y entorno incluidos) para estudiar cómo un LoRA de rango 16 modifica el comportamiento conversacional de Qwen3.5-9B en árabe.
- Generación de borradores de respuesta en árabe para equipos de soporte comunitario: el modelo puede proponer contestaciones a comentarios que un humano revisa antes de publicar, dado que no hay validación de calidad demostrada.
- Experimentos de evaluación de sesgo y representatividad: útil para analizar cómo un corpus concentrado en una sola comunidad de Reddit condiciona el registro y las referencias culturales del modelo.
- Prototipado de asistentes conversacionales bilingües árabe-inglés en entornos de investigación, siempre con revisión humana y sin uso como sistema de consejo profesional.
- Comparación de técnicas de SFT (QLoRA NF4, rango 16) sobre un mismo modelo base: la receta permite replicar el experimento y medir el efecto del adaptador frente al modelo base en revisiones ciegas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna mejora en win-rate humano ni en benchmarks, y que la revisión ciega entre modelo base y adaptador se incluye únicamente en el cuaderno de entrenamiento.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-9B completo.
- VRAM estimada para el modelo base en precisión de 16 bits: aproximadamente 18 GB solo para pesos, más memoria para el contexto y el runtime; en cuantización de 4 bits, alrededor de 5-6 GB para pesos.
- GPU recomendadas para 16 bits: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen ajustado; para cuantización de 4 bits, GPU consumer de 8-12 GB pueden ser suficientes para contextos moderados.
- Despliegue: el adaptador se carga con PEFT (`PeftModel.from_pretrained`) sobre la revisión fijada del modelo base `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; para servir en producción se puede fusionar el adaptador con el modelo base y usar vLLM, TGI o llama.cpp con pesos convertidos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaLLM-qwen35-9b-saudi-sft-V1 | Adaptador LoRA sobre base de 9B | No disponible | SFT conversacional árabe/inglés | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3.5-9B (modelo base) | 9B | No disponible en la informacion proporcionada | Modelo generalista | Según el modelo base | HuggingFace |
| Alternativas de ajuste árabe sobre modelos de 7-9B | No disponible | No disponible | SFT/LoRA en árabe | Variable | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificados en la informacion proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El corpus procede de una única comunidad de Reddit; la identidad saudí de los autores no está verificada y no se ha establecido representatividad de todos los dialectos ni poblaciones saudíes.
- El modelo puede alucinar o imitar afirmaciones personales presentes en los datos de entrenamiento.
- La selección del checkpoint por pérdida de validación no demuestra mejora en calidad social, representatividad cultural ni preservación de capacidades generales.
- No se ha evaluado la retención de visión, multilingüismo amplio ni razonamiento; la adaptación es solo de texto.
- No es un sistema de consejo profesional; no debe usarse para asesoramiento médico, legal o financiero.
- Las filas crudas de entrenamiento y evaluación no están incluidas en el repositorio, lo que dificulta la auditoría del corpus.
- El adaptador no es un modelo autónomo: requiere los pesos del modelo base y la revisión fijada; un uso con otra revisión puede degradar el comportamiento.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia y condiciones del modelo base Qwen3.5-9B para uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/Zeyad/SaLLM-qwen35-9b-saudi-sft-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Receta de entrenamiento y entorno: archivos `training_recipe.json` y `environment.txt` en el repositorio del adaptador.
