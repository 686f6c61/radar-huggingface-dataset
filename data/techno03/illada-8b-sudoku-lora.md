# Techno03/illada-8b-sudoku-lora

## Resumen

El modelo `Techno03/illada-8b-sudoku-lora` es un adaptador LoRA (PEFT) desarrollado por Techno03 sobre el modelo base `GSAI-ML/iLLaDA-8B-Base`. Este adaptador está especializado en la resolución de puzzles de Sudoku 9×9, utilizando el formato de entrada de filas separadas por espacios (p. ej., `Input: R1: 5 3 . . 7 . . . . | R2: ...`). El modelo base iLLaDA-8B es un modelo de lenguaje de difusión enmascarada (masked diffusion) con atención completamente bidireccional, entrenado desde cero con 12 billones de tokens y una longitud de contexto de 8192 tokens.

La relevancia de este adaptador radica en que demuestra cómo fine-tunear un modelo de difusión de última generación para una tarea estructurada y de razonamiento lógico, logrando mejoras sustanciales sobre el rendimiento zero-shot del modelo base. Además, ofrece una comparativa directa con un modelo autoregresivo (gemma-4-12B-it) fine-tuneado con la misma receta, mostrando que el enfoque de difusión degrada de forma más gradual conforme aumenta la dificultad del puzzle.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre iLLaDA-8B-Base (modelo de difusión enmascarada con atención bidireccional) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre las proyecciones `q/k/v/o` del modelo base iLLaDA-8B, con rango `r=16`, `alpha=32` y dropout de 0.05. El entrenamiento se realizó con 50.000 puzzles sintéticos de dificultad uniforme en el rango [0.2, 0.8], utilizando una función de pérdida de entropía cruzada enmascarada (masked cross-entropy) sobre los tokens de solución enmascarados, dejando el prompt intacto. Se ejecutaron 5.000 pasos de optimización en una GPU H100, y el checkpoint final se seleccionó por la puntuación de generación (mejor `pct_blank` de 85.96 en el paso 4250), no por la pérdida de validación.

El modelo base iLLaDA-8B emplea un objetivo de difusión enmascarada durante todo el preentrenamiento y el fine-tuning supervisado (SFT), con atención bidireccional completa. Según el paper *Improved Large Language Diffusion Models*, este enfoque permite generación de longitud variable y puntuación basada en confianza para evaluación de opción múltiple, manteniéndose competitivo con modelos autoregresivos como Qwen2.5 7B.

## Capacidades

- Resolución de Sudoku 9×9: el adaptador genera la solución completa del puzzle dado el formato de entrada especificado.
- Generación por difusión con remasking: el modelo utiliza un proceso de remuestreo iterativo basado en confianza para refinar las celdas enmascaradas.
- Especialización en tareas estructuradas: demuestra que los modelos de difusión pueden fine-tunearse eficazmente para problemas de razonamiento lógico con formato de salida rígido.
- No se han reportado capacidades adicionales (tool calling, agentes, visión, etc.) en la información disponible.

## Casos de uso

- **Generación de puzzles de Sudoku**: el modelo puede crear nuevos puzzles con dificultad controlada, útil para aplicaciones de entretenimiento o generación de contenido educativo.
- **Validación de soluciones**: dado un puzzle parcialmente resuelto, el modelo puede completar las celdas restantes y servir como verificador automático.
- **Asistente para jugadores**: integrado en una app de Sudoku, puede ofrecer sugerencias o resolver el puzzle completo bajo demanda, mejorando la experiencia del usuario.
- **Entrenamiento de algoritmos de resolución**: el modelo puede generar soluciones de referencia para evaluar y comparar otros solvers heurísticos o de fuerza bruta.
- **Investigación en modelos de difusión**: sirve como caso de estudio para analizar cómo los modelos de difusión manejan tareas de razonamiento simbólico frente a los autoregresivos, con aplicaciones en el diseño de arquitecturas híbridas.
- **Benchmarking de fine-tuning**: permite reproducir y comparar recetas de entrenamiento (LoRA, masked cross-entropy) sobre modelos de difusión, siendo útil para la comunidad de investigación.

## Benchmarks y rendimiento

Se evaluó el adaptador en 100 puzzles de validación mantenidos fuera del entrenamiento, midiendo el porcentaje de celdas originalmente en blanco correctamente rellenadas (`pct_blank`). La tabla siguiente muestra los resultados por nivel de dificultad, comparando el rendimiento zero-shot del modelo base y el adaptador fine-tuneado, así como la comparación con `gemma-4-12B-it` fine-tuneado con la misma receta.

| Dificultad | Baseline (zero-shot) | Fine-tuned (iLLaDA) | gemma-4-12B-it fine-tuned |
|---|---|---|---|
| Fácil | ~35.8%* | **92.7%** | 95.7% |
| Media | ~8.2%* | **69.6%** | 38.9% |
| Difícil | ~0.0%* | **27.4%** | 8.9% |
| Global | — | **60.3%** | — |

\* Estimaciones del baseline sobre una muestra pequeña; ver el repositorio para detalles. El adaptador de iLLaDA supera claramente al modelo autoregresivo en dificultades media y difícil, aunque es ligeramente inferior en fácil.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base iLLaDA-8B en precisión bfloat16 requiere aproximadamente 16 GB de VRAM; el adaptador LoRA añade una sobrecarga mínima (0.1 GB). Se recomienda al menos 20 GB de VRAM para margen de seguridad.
- **GPU recomendadas**: una GPU con 24 GB de VRAM (p. ej., RTX 4090, A100 40 GB) es suficiente para inferencia. Para entrenamiento se usó una H100, pero la inferencia es menos exigente.
- **Compatibilidad con GPUs de consumo**: sí, es posible ejecutar el modelo en una RTX 4090 o similar. En GPUs con menos VRAM (16 GB) podría requerirse cuantización, aunque no se dispone de datos sobre cuantizaciones compatibles.
- **Opciones de despliegue**: el adaptador se carga mediante la librería `peft` sobre el modelo base con `transformers`. No se ha documentado soporte para vLLM, llama.cpp u Ollama; se recomienda usar el sampler de difusión con remasking descrito en el repositorio [SudokuDiffusion](https://github.com/arush-garg/SudokuDiffusion).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento en Sudoku (pct_blank) | Licencia |
|---|---|---|---|---|---|
| **illada-8b-sudoku-lora** | Difusión enmascarada + LoRA | 8B + adaptador | 8192 | 92.7 / 69.6 / 27.4 (fácil/media/difícil) | Apache 2.0 |
| **gemma-4-12B-it** (fine-tuneado con misma receta) | Autoregresivo | 12B | No especificado | 95.7 / 38.9 / 8.9 | No especificada |
| **iLLaDA-8B-Base** (zero-shot) | Difusión enmascarada | 8B | 8192 | ~35.8 / ~8.2 / ~0.0 | Apache 2.0 |

La comparativa muestra que el adaptador LoRA mejora drásticamente el rendimiento del modelo base y, aunque es inferior en puzzles fáciles frente a gemma-4-12B-it, lo supera ampliamente en dificultades media y difícil, lo que sugiere una mayor robustez ante problemas complejos.

## Limitaciones y advertencias

- **Especialización limitada**: el adaptador solo resuelve Sudoku 9×9; no conserva las capacidades generales del modelo base para otras tareas.
- **Rendimiento decreciente con la dificultad**: la precisión cae notablemente en puzzles difíciles (27.4% `pct_blank`), lo que puede limitar su uso en escenarios donde se requiera alta exactitud.
- **Dependencia del sampler**: la calidad de la generación depende del proceso de remasking; un sampler mal configurado podría degradar los resultados.
- **Sesgos y alucinaciones**: no se han evaluado sesgos específicos del adaptador, pero al ser un modelo de difusión, puede generar soluciones plausibles pero incorrectas en puzzles ambiguos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y el adaptador están sujetos a la misma licencia; se debe verificar el cumplimiento de atribución.
- **Documentación incompleta**: no se proporcionan detalles sobre cuantizaciones, idiomas soportados, ni métricas de latencia, lo que dificulta su integración en entornos de producción sin pruebas adicionales.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/Techno03/illada-8b-sudoku-lora)
- [HuggingFace del modelo base iLLaDA-8B-Base](https://huggingface.co/GSAI-ML/iLLaDA-8B-Base)
- [Paper: Improved Large Language Diffusion Models](https://arxiv.org/abs/2606.25331)
- [Repositorio SudokuDiffusion](https://github.com/arush-garg/SudokuDiffusion)
