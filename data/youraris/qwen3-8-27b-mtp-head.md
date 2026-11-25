# YourAris/Qwen3.8-27B-MTP-Head

## Resumen

Qwen3.8-27B-MTP-Head no es un modelo generativo completo, sino la cabeza de predicción multi-token (MTP, *multi-token prediction*) extraída del modelo Qwen3.8-27B del equipo Qwen (Alibaba Cloud) y publicada como archivo independiente por el usuario YourAris. Se trata de una capa adicional de 15 tensores en bf16 (0,85 GB) que Qwen entrenó junto al modelo base para predecir los tokens posteriores al siguiente, y que se utiliza como *draft model* en esquemas de decodificación especulativa.

Su relevancia es práctica: permite acelerar la inferencia de Qwen3.8-27B y de los modelos derivados (como Aris 3.8-27B) en Apple Silicon mediante el servidor Aris Server, que verifica las predicciones de la cabeza en una sola pasada del modelo principal. Los incrementos reportados por el autor van de 1,95x a 3,27x en tokens por segundo según el tipo de prompt, sin alterar la distribución de salida del modelo verificado.

El paquete está pensado exclusivamente para entornos MLX en Apple Silicon. No es utilizable como modelo autónomo: mlx-lm descarta los tensores `mtp.*` al cargar un modelo, por lo que solo sirve en servidores que ejecuten explícitamente la cabeza, como Aris Server 0.3.0 o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) sobre transformer; 15 tensores correspondientes a una capa adicional del modelo Qwen3.8-27B |
| Parametros totales | no disponible (el repo ocupa 0,85 GB en bf16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para la cabeza; depende del modelo base (el autor cita ejemplos con contextos de 11k y 20k tokens, y ~50k tokens en un Mac de 32 GB con la build de 4 bits) |
| Tipos de cuantizacion | Pesos publicados en bf16; el autor menciona uso conjunto con copias de 4 y 8 bits de la capa de salida del modelo base |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`mtp.safetensors`), librería mlx |

## Arquitectura y entrenamiento

La cabeza MTP es una capa adicional que Qwen entrenó junto con Qwen3.8-27B para predecir varios tokens hacia adelante en lugar de solo el siguiente. En este repositorio se distribuyen sus 15 tensores exactamente como Qwen los publicó, extraídos del último shard (`model-00018-of-00018.safetensors`, revisión `37561816e6`) del modelo original y copiados sin modificar a `mtp.safetensors`. Los pesos de normalización se conservan con el centrado en cero original de Qwen (la capa aplica 1 + w), y Aris Server suma el 1 al cargarlos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para esta cabeza. La innovación técnica relevante no está en la arquitectura en sí, sino en su uso: decodificación especulativa con verificación en una sola pasada del modelo principal, con un número adaptativo de borradores por ronda (hasta 5 por defecto) que el servidor ajusta según el texto, usando más para código y ediciones que copian contenido previo y menos para prosa.

## Capacidades

- Predicción de varios tokens futuros por ronda para acelerar la decodificación del modelo base.
- Verificación de las predicciones por el modelo principal en una pasada, manteniendo la distribución de salida del modelo verificado.
- Ajuste adaptativo del número de borradores por ronda según el tipo de texto (más agresivo en código y ediciones, más conservador en prosa).
- Compatibilidad con modelos construidos sobre Qwen3.8-27B, incluidos fine-tunes como Aris 3.8-27B.
- Funcionamiento con copias de la capa de salida del modelo en 4 y 8 bits.
- No soporta tool calling, agentes ni generación autónoma por sí misma: es un componente auxiliar de inferencia.

## Casos de uso

- Aceleración de asistentes de código en local: en tareas de escritura de código sobre Aris 3.8-27B a 8 bits en un M4 Pro, el autor reporta 23,9 tokens/s frente a 8,7 sin la cabeza (2,75x), lo que reduce la latencia percibida en autocompletado y generación de parches.
- Edición de archivos grandes: con un archivo de 11k tokens, la decodificación pasa de 8,4 a 27,3 tokens/s (3,27x), adecuado para herramientas de refactorización que reescriben fragmentos extensos copiando contexto previo.
- Respuestas sobre contextos largos: en un contexto de 20k tokens la velocidad sube de 8,2 a 18,3 tokens/s (2,24x), útil en asistentes de documentación o análisis de repositorios.
- Tareas de agente de código de extremo a extremo: el autor cita una tarea en Claude Code que pasó de 241 s a 150 s con la cabeza activada.
- Despliegue en Macs de gama alta de consumo: con la build de 4 bits, el autor reporta entre 22,6 y 30,2 tokens/s (1,62x a 2,09x frente a 13,9-15,7 sin la cabeza), lo que hace viable la inferencia local interactiva en Apple Silicon.
- Servidores de inferencia MLX personalizados: cualquier servidor que implemente la verificación especulativa puede cargar el archivo vía configuración (`mtp = "YourAris/Qwen3.8-27B-MTP-Head:mtp.safetensors"` en `models.toml`) para acelerar un fine-tune propio de Qwen3.8-27B.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad (no de calidad) con Aris 3.8-27B a 8 bits en un M4 Pro Mac mini de 48 GB, decodificación greedy de 400 tokens a través de Aris Server:

| Prompt | Sin la cabeza (tokens/s) | Con la cabeza (tokens/s) | Aceleración |
|---|---|---|---|
| Escribir código | 8,7 | 23,9 | 2,75x |
| Escribir código, pensando primero | 8,7 | 16,9 | 1,95x |
| Explicar algo en prosa | 8,6 | 18,4 | 2,16x |
| Editar un archivo de 11k tokens | 8,4 | 27,3 | 3,27x |
| Responder desde un contexto de 20k tokens | 8,2 | 18,3 | 2,24x |

Con la build de 4 bits de Aris 3.8-27B, el mismo banco reporta 22,6-30,2 tokens/s con la cabeza frente a 13,9-15,7 sin ella (1,62x-2,09x). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del artefacto: no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM/memoria unificada: la cabeza ocupa unos 0,45 GB junto al modelo a 8 bits; en la build de 8 bits, la copia de 4 bits de la capa de salida añade 0,72 GB adicionales. El archivo en disco pesa 0,85 GB en bf16.
- Hardware objetivo: Apple Silicon con MLX. El autor valida en un M4 Pro Mac mini con 48 GB.
- Macs de 32 GB: con la build de 4 bits, el autor indica espacio para unos 50k tokens de contexto con la cabeza y 63k sin ella.
- GPU NVIDIA: no disponible; el paquete es específico de MLX y no se documenta soporte para CUDA.
- Opciones de despliegue: Aris Server 0.3.0 o posterior (activada por defecto para `aris-3.8-27b`, desactivable con `--no-mtp`); mlx-lm descarta los tensores `mtp.*`, por lo que no la utiliza.
- Latencia y throughput: ver tabla de benchmarks; la ganancia depende del texto y es mayor en código y ediciones que en prosa. La especulación solo se aplica cuando hay una única petición decodificando; con varias concurrentes se decodifica como antes.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTP-Head (este) | Cabeza MTP para decodificación especulativa | 0,85 GB (bf16, 15 tensores) | Depende del modelo base | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B | Modelo generativo completo | 27B (según nombre) | no disponible | Apache-2.0 (según el autor) | Hugging Face |
| Aris 3.8-27B (MLX 8bit / 4bit) | Fine-tune de Qwen3.8-27B para MLX | 27B | no disponible | no disponible | Hugging Face |
| Cabezas MTP de otras familias (p. ej. DeepSeek, GLM) | Componentes equivalentes en modelos MoE | no disponible | no disponible | varía | varía |

No se dispone de datos de rendimiento comparables entre estas alternativas más allá de las cifras de velocidad del propio autor; la comparación de calidad no es aplicable porque la cabeza no genera texto de forma autónoma.

## Limitaciones y advertencias

- La ganancia depende del texto: aproximadamente la mitad de las predicciones aciertan en prosa, y casi todas cuando una edición copia contenido previo; donde no compensa, el servidor decodifica sin especulación.
- En fine-tunes, el porcentaje de aciertos depende de cuánto se haya alejado el ajuste del modelo original; las cifras publicadas corresponden a Aris 3.8-27B.
- La salida greedy puede diferir ligeramente: una pasada sobre varios tokens redondea de forma algo distinta a una pasada sobre uno solo, por lo que en empates casi exactos puede elegirse otro token.
- Solo acelera una petición cuando decodifica en solitario; con varias peticiones concurrentes no hay especulación.
- Requiere un servidor que ejecute la cabeza (Aris Server); mlx-lm la ignora, y no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Exclusiva de Apple Silicon y MLX; no hay ruta de despliegue en CUDA documentada.
- El consumo de memoria adicional (0,45 GB más 0,72 GB opcionales) reduce el contexto disponible en equipos con memoria unificada ajustada.
- No se han publicado evaluaciones de sesgo, alucinación o calidad multilingüe para este artefacto; cualquier riesgo de ese tipo proviene del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no está afiliado ni respaldado por Alibaba Cloud; conviene conservar la atribución al equipo Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/YourAris/Qwen3.8-27B-MTP-Head
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune Aris 3.8-27B MLX 8bit: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-8bit
- Repositorio de Aris Server: https://github.com/kennysarnoski-jarvis/aris-server
- Sitio del autor: https://youraris.com
