# zuhairsan/train-tracks-qwen2.5-1.5b-instruct-lora

## Resumen

El repositorio `zuhairsan/train-tracks-qwen2.5-1.5b-instruct-lora` contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen2.5-1.5B-Instruct. No se trata de un modelo autónomo, sino de un ajuste fino especializado que actúa como política de selección de acciones dentro de un sistema de resolución de puzles Train Tracks, un juego de lógica en el que se deben trazar vías de tren sobre una cuadrícula respetando restricciones de conectividad.

El adaptador resuelve un problema muy concreto: dado un estado del tablero y un menú de acciones legales construido por un verificador de reglas externo, el modelo debe seleccionar un único identificador de acción (por ejemplo, `{"choice":"a00"}`). El modelo no genera el tablero completo ni razona en lenguaje natural sobre el puzle; su función es emitir una elección en formato JSON dentro de un bucle de resolución controlado por el checker.

Es relevante como ejemplo de aplicación de modelos de lenguaje pequeños (1.500 millones de parámetros) como políticas de acción en entornos estructurados, un patrón habitual en investigación sobre agentes y planificación. El adaptador tiene rango LoRA 16, alpha 32 y fue entrenado durante una época sobre 9.642 ejemplos extraídos de 180 puzles pequeños. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible para el adaptador; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. La contribución del repositorio es un ajuste LoRA con rango 16 y alpha 32, entrenado durante una época y 586 pasos de optimizador. La revisión exacta del modelo base utilizada es `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`, dato relevante para reproducir la inferencia.

Los datos de entrenamiento provienen del dataset `zuhairsan/train-tracks-solving-traces` y constan de 9.642 ejemplos de entrenamiento derivados de 180 puzles pequeños, más 1.707 ejemplos de desarrollo de 32 puzles. Solo se incluyeron trazas de acciones positivas (ramas de prueba incorrectas excluidas). El objetivo de salida es un JSON con la forma `{"choice":"a00"}`, seleccionando un identificador del menú de acciones legales proporcionado en el contexto. La evaluación se realizó con un verificador de reglas que construye el menú y aplica la acción elegida; el modelo no genera el tablero completo en una sola respuesta. Las trazas de puzles medianos no se usaron en el entrenamiento de este adaptador.

## Capacidades

- Selección de acciones discretas: emite un identificador de acción en formato JSON a partir de un menú de acciones legales preconstruido.
- Resolución iterativa de puzles Train Tracks dentro de un bucle controlado por un verificador de reglas externo.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct (no evaluada en este adaptador).
- Tool calling / function calling: no evaluado en este adaptador; heredado potencialmente del modelo base.
- Razonamiento multi-paso: soportado de forma implícita mediante la secuencia de acciones, no mediante razonamiento en lenguaje natural.
- Capacidades multilingües: no disponibles para el adaptador; heredadas del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Resolución automatizada de puzles Train Tracks: el adaptador selecciona acciones legales en cada iteración y un checker externo aplica la acción y actualiza el estado, permitiendo resolver puzles pequeños con una tasa del 96,9 % en el conjunto de desarrollo interno.
- Investigación sobre políticas de acción en entornos estructurados: sirve como referencia para estudiar cómo modelos pequeños pueden actuar como políticas dentro de bucles de planificación con verificación externa.
- Generación de datos sintéticos de trazas de resolución: el adaptador puede producir secuencias de acciones que, validadas por el checker, alimenten datasets de entrenamiento para modelos mayores.
- Evaluación de técnicas LoRA en tareas de decisión discreta: permite comparar el rendimiento de adaptadores de bajo rango frente a ajuste completo en tareas de selección de acciones.
- Prototipado de agentes con verificación simbólica: el patrón (modelo propone, checker valida) es reutilizable en dominios donde existe un verificador formal de acciones legales.
- Benchmark de robustez ante menús de acciones largos: los fallos observados por límite de 256 acciones ofrecen un caso de estudio sobre degradación con menús extensos.

## Benchmarks y rendimiento

| Evaluacion | Puzles resueltos | Celdas finales correctas | Fallo principal |
|---|---:|---:|---|
| Conjunto de desarrollo interno de puzles pequeños | 31/32 (96,9 %) | 1.733/1.762 (98,4 %) | Un límite de 256 acciones |
| Piloto de puzles medianos, 8 puzles por forma de tablero | 14/32 (43,8 %) | 2.330/2.888 (80,7 %) | Dieciocho límites de 256 acciones |

El conjunto pequeño es un holdout interno a nivel de puzle de los 212 puzles pequeños de entrenamiento (180 de entrenamiento, 32 de desarrollo). El piloto mediano es una muestra determinista de 32 de 304 puzles `test_medium` separados; los otros 272 puzles medianos no se evaluaron. Los porcentajes de celdas correctas incluyen los datos dados y los tableros parcialmente completados; la tasa de resolución de puzles es la medida principal de éxito. Todas las acciones de estas evaluaciones fueron aceptadas por el verificador de reglas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base de 1.500 millones de parámetros en precisión completa (FP16) requiere aproximadamente 3 GB de VRAM, más el adaptador LoRA (0,1 GB) y el contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB de VRAM o más.
- Opciones de despliegue: transformers + peft (según el ejemplo de carga del autor), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| train-tracks-qwen2.5-1.5b-instruct-lora | 1.500 M (base) + LoRA r16 | no disponible | 96,9 % puzles pequeños; 43,8 % puzles medianos | no disponible (base Apache-2.0) | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.500 M | no disponible | no evaluado en esta tarea | Apache-2.0 | Hugging Face |
| Adaptadores LoRA comparables para tareas de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA entrenados específicamente para Train Tracks u otras tareas de selección de acciones comparables.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere el mismo formato de estado, menú de acciones legales, instrucción de sistema y formato JSON usados en entrenamiento. Un prompt en lenguaje natural está fuera del uso evaluado.
- El modelo no genera el tablero completo; solo selecciona una acción por paso.
- Tasa de resolución del 43,8 % en puzles medianos, con 18 de 32 puzles que alcanzaron el límite de 256 acciones sin completarse.
- Los resultados solo son válidos para este verificador y configuración de evaluación; no establecen rendimiento en otras fuentes de puzles ni sin el menú de acciones legales.
- Licencia del adaptador no disponible; el modelo base es Apache-2.0, pero el uso comercial del adaptador debe verificarse con el autor.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: el modelo puede emitir identificadores de acción fuera del menú legal; en las evaluaciones reportadas todas las acciones fueron aceptadas por el checker, pero no se documenta el comportamiento fuera de ese régimen.
- Limitaciones de contexto e idioma: no disponibles para el adaptador.
- Solo se entrenó con trazas de acciones positivas; las ramas de prueba incorrectas se excluyeron, lo que puede limitar la capacidad de recuperación ante estados no vistos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zuhairsan/train-tracks-qwen2.5-1.5b-instruct-lora
- Dataset de trazas: https://huggingface.co/datasets/zuhairsan/train-tracks-solving-traces
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
