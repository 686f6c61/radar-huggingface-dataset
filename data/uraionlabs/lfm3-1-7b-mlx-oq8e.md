# UraionLabs/LFM3-1.7B-MLX-oQ8e

## Resumen

LFM3-1.7B-MLX-oQ8e es una cuantización en formato MLX del modelo LFM3-1.7B desarrollado por Liquid AI, publicada por Uraion Labs. El modelo original es un transformer de arquitectura tri-híbrida orientado a agentes locales, tool calling y salidas estructuradas, con 1.730 millones de parámetros y una ventana de contexto de 262.144 tokens. Esta variante concreta aplica el preset de cuantización oQ8e de oMLX, que mantiene todas las proyecciones en 8 bits uniformes para preservar la máxima fidelidad respecto al original en BF16.

El interés de esta ficha radica en que permite ejecutar un modelo de 1,7B con contexto de 256K y capacidades agénticas de forma nativa en Apple Silicon, sin depender de CUDA ni de infraestructura en la nube. El archivo de pesos ocupa 1,84 GB en un único `model.safetensors`, lo que lo hace viable en Macs con memoria unificada moderada.

La arquitectura combina convoluciones cortas con puerta, atención de ventana deslizante y atención global, un diseño que reduce el coste computacional del contexto largo frente a un transformer denso convencional. El modelo soporta razonamiento nativo mediante etiquetas `<think>`, tool calling en formato XML y búsqueda diferida de herramientas, lo que lo sitúa en la categoría de modelos pequeños para despliegue en el borde con flujos agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` (`lfm3`), tri-híbrida: 13 convoluciones cortas con puerta, 5 atenciones de ventana deslizante (ventana 256) y 6 atenciones globales; GQA con 16 cabezas de consulta y 4 de KV, dimensión de cabeza 128 |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (entrada + salida) |
| Tipos de cuantizacion | oQ8e (8 bits uniformes, grupo 64, modo affine); la familia incluye también oQ6e, oQ5e y oQ4e en repositorios separados |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other` en HuggingFace) |
| Formato de pesos | MLX safetensors (un único `model.safetensors` de 1.837.281.931 bytes, ~8,50 bits efectivos por peso) |
| Vocabulario | 128.000 tokens |
| Capas | 24 |
| Runtime probado | oMLX 0.7.3 y mlx-vlm 0.7.11 (mlx-lm aún no soporta LFM3 de forma estable) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura tri-híbrida de 24 capas que alterna tres tipos de bloque: 13 capas de convolución corta con puerta, 5 capas de atención de ventana deslizante con ventana de 256 tokens y 6 capas de atención global. La atención usa GQA con 16 cabezas de consulta y 4 de clave-valor, con dimensión de cabeza 128. Este diseño busca reducir el coste de memoria y cómputo en secuencias largas manteniendo capacidad de recuperación global, algo relevante para un contexto declarado de 262.144 tokens.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). La model card del repositorio cuantizado tampoco documenta innovaciones de decodificación especulativa ni mecanismos de atención lineal más allá de la propia mezcla de convoluciones y atención descrita.

La contribución específica de esta publicación es la cuantización: el preset oQ8e de oMLX aplica 8 bits uniformes a todas las proyecciones, incluidas las embeddings y la cabeza de salida (atadas), con grupo de 64 y escalas y sesgos por grupo. La asignación de bits se determina por capa mediante análisis de sensibilidad de oMLX, aunque en este preset el resultado es uniforme. El autor reporta aproximadamente 8,50 bits efectivos por peso contando las escalas de grupo.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento nativo mediante etiquetas `<think>`.
- Tool calling y function calling en formato XML, con soporte de búsqueda diferida de herramientas.
- Salidas estructuradas, orientadas a pipelines que requieren JSON u otros formatos validables.
- Flujos agénticos de varios pasos, con compatibilidad declarada con Hermes Agent y OpenClaw.
- Capacidad multilingüe en 16 idiomas, incluidos español, árabe, hindi, japonés, coreano y tailandés.
- Manejo de contexto largo de hasta 262.144 tokens, gracias a la mezcla de atención local y global.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible, pese a la etiqueta `mlx-vlm` del repositorio.

## Casos de uso

- Agentes locales en macOS: el modelo puede ejecutarse íntegramente en un Mac con memoria unificada y gestionar bucles de tool calling con contexto largo, lo que permite asistentes personales que no envían datos a la nube.
- Automatización de atención al cliente con contexto extenso: la ventana de 262.144 tokens permite mantener historiales de conversación muy largos o adjuntar documentación de referencia sin truncar, algo útil en soporte técnico multi-turno.
- Generación y validación de código en pipelines de CI/CD: el soporte de salidas estructuradas y function calling facilita integrar el modelo como paso de revisión o generación de parches dentro de herramientas de integración continua.
- Extracción de datos estructurados de documentos: con contexto largo y salida en formato validable, puede procesar contratos, informes o expedientes completos y devolver campos normalizados.
- Asistentes de razonamiento en el borde: el modo `<think>` permite obtener cadenas de razonamiento intermedias para tareas de análisis sin depender de APIs externas, útil en entornos con requisitos de privacidad.
- Prototipado rápido en investigación: al ocupar 1,84 GB, permite iterar sobre prompts, herramientas y flujos agénticos en un portátil sin aprovisionar infraestructura.
- Aplicaciones multilingües en mercados diversos: los 16 idiomas soportados permiten desplegar un mismo modelo para interfaces en español, árabe, hindi o japonés sin cambiar de checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una prueba de humo (*smoke test*) en la que las cuatro variantes de cuantización respondieron correctamente a una comprobación matemática breve y generaron una llamada de herramienta `get_weather` válida en estilo OpenAI a través del servidor oMLX. El autor indica explícitamente que se trata de una prueba de humo y no de una ejecución completa de benchmarks.

| Metrica | Valor |
|---|---|
| Decodificacion (oQ8e) | ~130 tokens/s en Apple M5 Pro (64 GB), macOS 27, oMLX 0.7.3, 800 tokens generados, media de 2 ejecuciones |
| Decodificacion (oQ6e) | ~152 tokens/s (mismas condiciones) |
| Decodificacion (oQ5e) | ~174 tokens/s (mismas condiciones) |
| Decodificacion (oQ4e) | ~203 tokens/s (mismas condiciones) |
| Benchmarks academicos (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 1,84 GB de pesos más overhead de contexto y runtime; con 256K tokens de contexto la memoria de caché KV crece de forma significativa y conviene reservar varios GB adicionales.
- GPU recomendadas: Apple Silicon de la familia M1 a M5, según declara el autor; el rendimiento medido corresponde a un M5 Pro con 64 GB.
- Compatibilidad con GPU de consumo: el formato MLX está pensado para Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta variante.
- Opciones de despliegue: oMLX 0.7.3 y mlx-vlm 0.7.11 o superior; mlx-lm aún no soporta LFM3 de forma estable según la model card.
- Latencia y throughput: ~130 tokens/s en decodificación de un solo flujo sobre M5 Pro; no se reportan cifras de prefill ni de throughput por lotes.
- Almacenamiento: 1,9 GB de repositorio, con un único archivo `model.safetensors` de 1,84 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ8e (esta ficha) | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, oMLX / mlx-vlm | Cuantización 8 bits uniforme, ~130 tok/s en M5 Pro |
| LFM3-1.7B-MLX-oQ6e | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, oMLX / mlx-vlm | Mezcla 6/8 bits, 1,45 GB, ~152 tok/s |
| LFM3-1.7B-MLX-oQ4e | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, oMLX / mlx-vlm | Mezcla 4/5/6/8 bits, 1,04 GB, ~203 tok/s |
| LiquidAI/LFM3-1.7B (original) | 1,73B | 262.144 | LFM Open v1.0 | Safetensors BF16 | Referencia de calidad; mayor tamaño y sin optimización para Apple Silicon |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otros fabricantes del mismo rango de parámetros.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta cuantización ni para el modelo base en la información disponible.
- La cuantización a 8 bits, aunque uniforme, puede introducir degradaciones menores frente al BF16 original; el autor no cuantifica la pérdida de calidad.
- El soporte de LFM3 en mlx-lm está incompleto, lo que limita las opciones de despliegue a oMLX y mlx-vlm; integrarlo en otros stacks requiere trabajo adicional.
- El formato MLX restringe el uso a Apple Silicon; no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- La licencia LFM Open License v1.0 es distinta de las licencias permisivas habituales; es necesario revisar sus términos antes de un uso comercial, ya que puede imponer restricciones específicas.
- El contexto de 262.144 tokens es una cifra declarada; no se documenta en la información disponible una evaluación de recuperación efectiva a esa longitud (por ejemplo, pruebas de aguja en pajar).
- El rendimiento medido (~130 tok/s) corresponde a un único chip y configuración; en modelos con menos memoria o contextos más largos las cifras pueden degradarse notablemente.
- No se documentan capacidades multimodales pese a la etiqueta `mlx-vlm`; el runtime carga el modelo como texto únicamente según la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ8e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante oQ6e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ6e
- Variante oQ5e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ4e
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Sitio del cuantizador (Uraion Labs): https://uraionlabs.com
- Licencia: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ8e/blob/main/LICENSE
