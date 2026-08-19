# swadeep/Qwen3.5-4b-opus-distilled-mlx-q8

## Resumen

El modelo `swadeep/Qwen3.5-4b-opus-distilled-mlx-q8` es una versión cuantizada en 8 bits (Q8, group size 64) en formato MLX del fine-tune `swadeep/Qwen3.5-4b-opus-distilled`, desarrollado por el usuario swadeep. Se trata de un modelo de lenguaje de solo texto, especializado en razonamiento, seguimiento de instrucciones y generación de código, obtenido mediante un ajuste fino con LoRA-SFT sobre la base `Qwen/Qwen3.5-4B` utilizando datos de razonamiento destilados de Claude Opus.

A pesar de que el nombre sugiere 4 mil millones de parámetros, los pesos reales en safetensors indican aproximadamente 1.183 millones de parámetros (1,18B), una discrepancia relevante que conviene tener en cuenta al evaluar su capacidad. La cuantización Q8 reduce el tamaño del modelo a unos 4,5 GB en el repositorio, lo que permite ejecutarlo en hardware Apple Silicon con MLX de forma eficiente. Su relevancia radica en ofrecer capacidades de razonamiento avanzado en un formato ligero y optimizado para entornos locales de Apple, aunque actualmente no dispone de métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, detalles especificos no disponibles) |
| Parametros totales | 1.183.558.656 (~1,18B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (Q8, group size 64, modo affine) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.5-4B, aunque no se proporcionan detalles tecnicos sobre su estructura interna (numero de capas, dimensiones, tipo de atencion, etc.). El modelo se ha obtenido mediante un ajuste fino con LoRA-SFT en tres etapas, partiendo del dataset original `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k` con 8.000 muestras de razonamiento. En una segunda etapa se aplico una correccion de "context-bleed" (fuga de contexto) utilizando 2.000 muestras con inserciones de temas fuera de contexto. Finalmente, se realizo una SFT adicional sobre el dataset `grpo_data/opus_reasoning_sft_offtopic`. Los pesos LoRA se fusionaron con una escala de 0.04. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Razonamiento paso a paso, orientado a problemas logicos y matematicos.
- Seguimiento de instrucciones complejas.
- Generacion y comprension de codigo.
- Capacidad de mantener conversaciones multi-turno.
- No soporta vision, audio ni otras modalidades (solo texto).
- No se indica soporte explicito para tool calling o function calling.

## Casos de uso

- Asistente de razonamiento en entornos educativos: el modelo puede resolver problemas matematicos y logicos paso a paso, sirviendo como herramienta de apoyo para estudiantes que necesiten explicaciones detalladas.
- Generacion de codigo en entornos de desarrollo: gracias a su entrenamiento en tareas de codificacion, puede sugerir implementaciones, explicar fragmentos de codigo o ayudar a depurar errores en proyectos personales o academicos.
- Automatizacion de respuestas en chats tecnicos: su capacidad de seguir instrucciones permite integrarlo en sistemas de soporte para responder consultas frecuentes sobre programacion o matematicas.
- Prototipado rapido de agentes conversacionales: al ser ligero y ejecutable en Apple Silicon, es adecuado para experimentar con pipelines de razonamiento sin necesidad de infraestructura GPU dedicada.
- Analisis de datos con razonamiento logico: puede procesar descripciones textuales de problemas y proponer soluciones estructuradas, util en tareas de analisis preliminar.
- Educacion en inteligencia artificial: su tamano reducido y licencia permisiva lo hacen apropiado para estudiar tecnicas de destilacion y cuantizacion en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Disenado para ejecutarse con MLX, la libreria de aprendizaje automatico de Apple, por lo que requiere hardware Apple Silicon (M1, M2, M3 o superiores).
- Los pesos cuantizados Q8 de ~1,18B parametros ocupan aproximadamente 1,2 GB en memoria, mas overhead de ejecucion; se estima que cabe en Macs con 8 GB de RAM o mas.
- No es compatible directamente con CUDA ni con GPUs NVIDIA sin una conversion adicional a otros formatos.
- Despliegue recomendado mediante `mlx-lm`, que permite generar texto desde linea de comandos o Python.
- No se dispone de datos sobre latencia o throughput en distintos hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables en la misma categoria (fine-tunes de Qwen3.5-4B o modelos de razonamiento de tamano similar) para realizar una comparativa rigurosa. El modelo base Qwen3.5-4B no tiene especificaciones publicadas en la informacion proporcionada, y no se conocen alternativas directas con datos de rendimiento.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Su tamano real (1,18B parametros) es considerablemente menor de lo que sugiere el nombre, lo que puede limitar su capacidad en tareas complejas.
- Al ser un fine-tune con datos de razonamiento, puede presentar sesgos derivados del dataset original, incluyendo posibles alucinaciones en contextos no cubiertos.
- No se han publicado evaluaciones de seguridad, sesgos o robustez, por lo que su uso en produccion requiere validacion adicional.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento original (`angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`) puede tener restricciones propias que conviene revisar.
- Al estar limitado a MLX, su despliegue en entornos de servidor convencionales (Linux con GPUs NVIDIA) no es directo.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/swadeep/Qwen3.5-4b-opus-distilled-mlx-q8)
- [Modelo original sin cuantizar](https://huggingface.co/swadeep/Qwen3.5-4b-opus-distilled)
