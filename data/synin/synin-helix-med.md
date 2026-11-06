# Synin/Synin-Helix-MED

## Resumen

Synin-Helix-MED es un modelo de lenguaje de 7.615.616.512 parametros derivado mediante fine-tuning de Qwen/Qwen2.5-7B-Instruct. Segun la model card, el modelo se corresponde con la familia CURE-MED-7B, desarrollada por Eric Onyame, Akash Ghosh, Subhadip Baidya, Sriparna Saha, Xiuying Chen y Chirag Agarwal (Aikyam Lab y colaboradores), y esta especializada en razonamiento medico multilingue. El objetivo declarado es mejorar la correccion logica y la estabilidad linguistica en consultas medicas abiertas en 13 idiomas, incluyendo lenguas con poca representacion en los corpus habituales como amharico, yoruba y suajili.

La relevancia del modelo reside en su enfoque de entrenamiento: un marco de aprendizaje por refuerzo guiado por curriculo que combina ajuste supervisado (SFT) sensible al cambio de codigo (code-switching) con Group Relative Policy Optimization (GRPO). El modelo se evalua sobre CUREMED-BENCH, un benchmark multilingue de razonamiento medico abierto con respuestas unicas verificables. La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only, con licencia Apache 2.0 y pesos en formato safetensors.

El repositorio de Hugging Face (Synin/Synin-Helix-MED) registra 0 descargas y 0 likes en la fecha de creacion indicada (2026-11-04), y el tamano del repo es de 30.5 GB. La model card no especifica la longitud de contexto efectiva del fine-tuning, por lo que se asume la del modelo base salvo indicacion contraria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-7B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible en la model card (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Amharico, bengali, frances, hausa, hindi, japones, coreano, espanol, suajili, tailandes, turco, vietnamita, yoruba |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.6 mil millones de parametros. Sobre esa base, el entrenamiento introducido por CURE-MED combina dos fases: un ajuste supervisado (SFT) consciente del cambio de codigo, que expone al modelo a mezclas de idiomas tipicas de contextos clinicos reales, y un posterior entrenamiento con Group Relative Policy Optimization (GRPO), una variante de aprendizaje por refuerzo que compara grupos de respuestas para optimizar la correccion logica. El marco se describe como "guiado por curriculo", es decir, con un orden creciente de dificultad en las tareas de razonamiento medico.

El conjunto de evaluacion asociado es CUREMED-BENCH, un benchmark multilingue de razonamiento medico abierto con respuestas unicas verificables. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset de SFT ni los hiperparametros de GRPO, por lo que esos datos deben considerarse no disponibles. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal; el modelo se distribuye como un fine-tuning estandar de transformers compatible con text-generation-inference.

## Capacidades

- Generacion de texto y razonamiento medico multilingue en 13 idiomas, con enfasis en lenguas de bajos recursos (amharico, hausa, suajili, yoruba).
- Razonamiento de multiples pasos orientado a respuestas verificables en preguntas medicas abiertas.
- Manejo de cambio de codigo (code-switching) entre idiomas, segun el diseno del SFT.
- Conversacion multi-turno (capacidad heredada de Qwen2.5-7B-Instruct).
- Generacion de texto condicionada por contexto largo (sujeta al limite del modelo base, no confirmado).
- Soporte de tool calling y function calling: no confirmado en la model card para este fine-tuning.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no documentado.

## Casos de uso

- Triaje clinico multilingue: el modelo puede clasificar y priorizar consultas de pacientes en varios idiomas, incluidos amharico, hausa o suajili, aprovechando su entrenamiento con cambio de codigo para entornos donde el personal sanitario mezcla idiomas.
- Asistencia a la documentacion clinica: generacion de resumenes de historiales y notas medicas en el idioma del profesional, con razonamiento estructurado sobre sintomas y antecedentes.
- Educacion medica: generacion de preguntas y explicaciones razonadas para estudiantes en regiones con lenguas de bajos recursos, usando el formato de respuesta verificable de CUREMED-BENCH.
- Apoyo a la decision en entornos con recursos limitados: respuestas razonadas a preguntas abiertas de atencion primaria en idiomas donde escasean modelos especializados.
- Investigacion en NLP clinico multilingue: evaluacion comparativa frente a modelos genericos sobre CUREMED-BENCH y otros benchmarks de razonamiento medico.
- Traduccion y adaptacion de material sanitario: reformulacion de guias clinicas entre los 13 idiomas soportados manteniendo terminologia medica.
- Chatbot de orientacion sanitaria: conversaciones multi-turno con contexto largo para resolver dudas frecuentes, con la advertencia de que no sustituye a un profesional sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia CUREMED-BENCH y el paper arXiv:2601.13262, pero no incluye tablas de resultados numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomiendan 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos; cabe en GPUs consumer de 12-16 GB con contexto moderado.
- Cuantizacion a 4 bits: alrededor de 4-5 GB de pesos; viable en GPUs consumer de 8 GB, con degradacion potencial en tareas de razonamiento.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090/4080 para cuantizaciones de 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp u Ollama solo si se generan cuantizaciones GGUF, no confirmadas en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synin-Helix-MED (CURE-MED-7B) | 7.615.616.512 | No disponible | Razonamiento medico multilingue (13 idiomas) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | ~7.6 B | 32.768 tokens (segun Qwen2.5) | Proposito general, multilingue | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Meditron-7B | ~7 B | 4.096 tokens (segun Llama 2) | Medico en ingles | Llama 2 (restricciones) | Hugging Face |
| BioMistral-7B | ~7 B | 8.192 tokens (segun Mistral) | Medico, principalmente ingles | Apache 2.0 | Hugging Face |

La comparativa se limita a la arquitectura y licencia, ya que no hay datos de rendimiento publicados para Synin-Helix-MED. Frente a Meditron y BioMistral, su principal diferenciacion es la cobertura de 13 idiomas y el entrenamiento con RL guiado por curriculo; frente a Qwen2.5-7B-Instruct, hereda la base pero no se ha verificado su rendimiento general fuera del dominio medico.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- Riesgo de alucinacion en contenido clinico: el modelo puede generar afirmaciones medicas plausibles pero incorrectas; no debe usarse como sustituto del juicio clinico.
- Sesgos potenciales derivados de los datos de entrenamiento y del modelo base, no documentados en la model card.
- La longitud de contexto efectiva tras el fine-tuning no esta confirmada; el modelo base soporta 32.768 tokens, pero el fine-tuning podria haberla reducido.
- Cobertura idiomatica desigual: los 13 idiomas declarados no implican calidad uniforme, especialmente en amharico, hausa, suajili y yoruba.
- El soporte de tool calling y function calling no esta confirmado para este fine-tuning.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria en aplicaciones sanitarias (por ejemplo, MDR en la UE) recae en el integrador.
- El repositorio muestra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad; tratar como modelo de investigacion.
- La model card mezcla la denominacion CURE-MED-7B con el ID Synin-Helix-MED, lo que puede generar confusion sobre la procedencia exacta de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Synin/Synin-Helix-MED
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio: https://github.com/AikyamLab/cure-med
- Paper: https://arxiv.org/abs/2601.13262
- Demo: https://cure-med.github.io/
- Dataset: https://huggingface.co/datasets/Aikyam-Lab/CUREMED-BENCH
