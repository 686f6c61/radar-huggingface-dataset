# yousha806/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA (rank 32) entrenado sobre `Qwen/Qwen3.5-4B` por el usuario `yousha806` mediante el framework scottyrl, como entrega de la práctica 3 (Assignment 3) del curso 11-768 (AI Agents) de Carnegie Mellon University. El nombre del run, `p5_textcraft_grpo`, indica que se ha aplicado entrenamiento por refuerzo con GRPO (Group Relative Policy Optimization) sobre la tarea TextCraft, un entorno de agentes que combina seguimiento de instrucciones en lenguaje natural con composición de acciones secuenciales (recetas de crafteo en formato texto).

El modelo no es un modelo de propósito general, sino un checkpoint académico: su objetivo es mejorar el rendimiento del modelo base en los splits de validación medium y hard de TextCraft-Synth. Se despliega como adaptador servido por vLLM sobre el modelo base, lo que permite evaluarlo sin cargar pesos completos adicionales.

Su relevancia es principalmente didáctica y de investigación reproducible: ilustra un pipeline completo de post-entrenamiento con RL (config YAML, export desde un run de tinker, commit de git asociado) y sirve como ejemplo de cómo servir adaptadores LoRA con vLLM para evaluación automatizada. No hay model card detallada, benchmarks publicados ni licencia declarada, por lo que varias especificaciones no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre Qwen3.5-4B (transformer decoder) |
| Parametros totales | no disponible (base: ~4B según denominación de Qwen3.5-4B) |
| Parametros activos | no disponible (el adaptador LoRA rank 32 es la parte entrenada) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, 0,2 GB de repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue la arquitectura PEFT/LoRA estándar con rank 32 sobre el modelo base `Qwen/Qwen3.5-4B`, un transformer decoder. LoRA congela los pesos del modelo base y entrena matrices de bajo rango añadidas a determinadas proyecciones de atención/MLP, lo que reduce drásticamente el número de parámetros entrenables y permite servir múltiples adaptadores sobre una misma instancia de vLLM. El tamaño del repositorio (0,2 GB) es coherente con un adaptador LoRA rank 32 y no con pesos completos de 4B.

El entrenamiento se realizó con el framework scottyrl sobre la infraestructura tinker (run `tinker://model_ce006ff7/v33_r2`), aplicando GRPO a la tarea TextCraft, un entorno de agente textual donde el modelo debe planificar y ejecutar secuencias de acciones para fabricar objetos siguiendo instrucciones. GRPO es un algoritmo de RL que optimiza políticas comparando recompensas relativas dentro de grupos de respuestas muestreadas, habitual en el post-entrenamiento de modelos tipo Qwen. No se dispone de detalles sobre el dataset de entrenamiento, número de pasos, tasa de aprendizaje ni recompensas exactas; la configuración reside en `configs/p5_textcraft_grpo.yaml` del repositorio del curso.

## Capacidades

- Seguimiento de instrucciones y planificación multi-paso en el entorno TextCraft (composición de acciones de crafteo textual).
- Generación de texto general heredada de Qwen3.5-4B, aunque el comportamiento fuera de TextCraft no está garantizado ni evaluado.
- Capacidades de tool calling y agentes: no disponibles explícitamente; el modelo está orientado a un entorno de agente académico concreto.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Despliegue como adaptador LoRA servible con vLLM (`--enable-lora --max-lora-rank 32`).

## Casos de uso

- Evaluación académica del curso 11-768: los evaluadores sirven el adaptador con vLLM y ejecutan el script `scripts/evaluate_checkpoint.py` contra los splits medium y hard de TextCraft-Synth; es su propósito principal.
- Investigación en RL para agentes: sirve como checkpoint reproducible (run de tinker, config YAML y commit de git asociados) para comparar políticas entrenadas con GRPO en TextCraft.
- Benchmarking de adaptadores LoRA: ejemplo práctico de cómo servir un adaptador PEFT sobre un modelo base compartido con vLLM, útil para estudiar el overhead de `--enable-lora`.
- Estudio de GRPO en tareas de agente: el run `p5_textcraft_grpo` puede analizarse para entender cómo la recompensa por tarea mejora el éxito en entornos secuenciales frente al modelo base.
- Prototipado de agentes textuales: partiendo del modelo base más este adaptador, se puede experimentar con políticas de acción en entornos tipo TextCraft.
- Enseñanza de post-entrenamiento: material de referencia para mostrar un pipeline completo de RL (entrenamiento, export, despliegue, evaluación con muestreo k=4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluación (script del curso con muestreo k=4 sobre TextCraft-Synth medium y hard) pero no incluye métricas numéricas de éxito ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; el adaptador ocupa 0,2 GB en disco, pero el requisito dominante es el modelo base Qwen3.5-4B en fp16/bf16 (del orden de 8-10 GB de VRAM), más la sobrecarga de vLLM con LoRA habilitado.
- GPU recomendadas: no disponible; una GPU de consumo con 16 GB o más (por ejemplo RTX 4090) debería ser suficiente para servir el modelo base de 4B con LoRA en vLLM. No es necesaria una A100/H100 para inferencia.
- Consumer GPU: probablemente sí, dada la talla de 4B del modelo base; no hay confirmación oficial.
- Despliegue: vLLM es el método documentado (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=yousha806/scottyrl-a3-p5_textcraft_grpo`). No se documenta soporte para llama.cpp, Ollama o TGI, que requerirían conversión del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA rank 32 (GRPO) | Qwen3.5-4B | TextCraft (agente textual) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | Modelo completo | — | Propósito general | no disponible en esta ficha | Hugging Face |
| Otros adaptadores scottyrl del curso | no disponible | no disponible | no disponible | no disponible | no disponible |

No existen comparativas de rendimiento publicadas entre estos elementos.

## Limitaciones y advertencias

- Es un checkpoint académico sin model card completa: sin licencia declarada, su uso comercial no puede asumirse como permitido hasta verificar los términos de Qwen3.5-4B y del repositorio.
- Especializado en TextCraft: el comportamiento fuera de esa tarea no está evaluado y el fine-tuning con GRPO puede degradar capacidades generales del modelo base.
- Cero descargas y cero likes en el momento de la ficha: sin validación comunitaria ni reportes de terceros.
- Sesgos y riesgo de alucinación: no disponibles; heredan en principio del modelo base Qwen3.5-4B, pero el RL sobre una tarea estrecha puede amplificar comportamientos degenerados fuera de distribución.
- Longitud de contexto, idiomas y cuantizaciones: no documentados.
- La evaluación depende de scripts e infraestructura del curso (tinker, scottyrl), no disponibles públicamente en la información proporcionada, lo que limita la reproducibilidad externa.
- Requiere vLLM con soporte LoRA y `--max-lora-rank 32` exacto para cargarse correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yousha806/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework PEFT: https://huggingface.co/docs/peft
- Otros enlaces (paper, blog, demo): no disponibles
