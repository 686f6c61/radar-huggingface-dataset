# survivle/gemma-3-1b-countdown-v2

## Resumen

El modelo `survivle/gemma-3-1b-countdown-v2` es un ajuste fino (fine-tune) del modelo base `google/gemma-3-1b-it` de Google DeepMind, especializado en la tarea de "countdown" (conteo regresivo o resolución de problemas numéricos con operaciones aritméticas). Desarrollado por el usuario "survivle", este modelo de 999.885.952 parámetros (aproximadamente 1B) está diseñado para ejecutarse en un solo GPU o incluso en dispositivos de borde, siguiendo la filosofía de la familia Gemma de democratizar el acceso a modelos de lenguaje de alto rendimiento.

La relevancia de este modelo radica en su especialización: mientras que Gemma-3-1B es un modelo generalista, esta variante ha sido entrenada específicamente para resolver el juego "Countdown" (un popular concurso de televisión británico donde se deben combinar números para alcanzar un objetivo usando operaciones aritméticas). Esto lo convierte en una herramienta útil para aplicaciones educativas, juegos de lógica y demostraciones de razonamiento aritmético. El modelo se distribuye bajo licencia Gemma, con pesos en formato safetensors y un tamaño de repositorio de 2.1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma-3-1B) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma-3-1B, probablemente 32k tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | Gemma (licencia de Google DeepMind) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Gemma-3-1B, que emplea atención multi-cabeza, normalización RMS y una capa de embedding compartida. Al ser un fine-tune, conserva la estructura del modelo base, pero sus pesos han sido ajustados mediante entrenamiento supervisado o RLHF para la tarea específica de "countdown". No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el método exacto de ajuste (si fue SFT, DPO, etc.). El autor no ha publicado una model card descriptiva, por lo que los detalles técnicos del proceso de entrenamiento no están disponibles.

## Capacidades

- Resolución de problemas aritméticos tipo "Countdown": dado un conjunto de números y un objetivo, el modelo genera una secuencia de operaciones (suma, resta, multiplicación, división) que alcanza el objetivo.
- Razonamiento paso a paso: puede mostrar el proceso de cálculo intermedio, útil para explicaciones educativas.
- Generación de texto en lenguaje natural: al estar basado en Gemma-3-1B, conserva capacidades generales de generación de texto, aunque su especialización puede reducir su rendimiento en tareas no relacionadas.
- Soporte de tool calling: no confirmado para este fine-tune, aunque el modelo base Gemma-3-1B-it sí lo soporta.
- Capacidades multilingües: no confirmadas para esta variante, aunque el modelo base soporta varios idiomas.

## Casos de uso

- Aplicaciones educativas de matemáticas: el modelo puede usarse como tutor interactivo que enseña a resolver problemas de aritmética combinada, mostrando los pasos y explicando cada operación.
- Juegos de lógica y entretenimiento: integración en aplicaciones de juegos tipo "Countdown" o "24" para generar soluciones y verificar respuestas de los jugadores.
- Demostraciones de razonamiento de IA: útil para talleres y charlas donde se muestra cómo un modelo de lenguaje puede resolver problemas estructurados con restricciones numéricas.
- Generación de ejercicios personalizados: el modelo puede crear nuevos problemas de countdown con diferentes niveles de dificultad, variando los números y el objetivo.
- Asistente para concursos de televisión o eventos: puede usarse como herramienta de apoyo en programas o competiciones donde se necesita resolver rápidamente este tipo de retos.
- Investigación en razonamiento aritmético: sirve como punto de partida para estudiar cómo los modelos pequeños pueden especializarse en tareas numéricas concretas, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas para la tarea de countdown. El autor no ha incluido ninguna evaluación en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros, en FP16 ocupa aproximadamente 2 GB de VRAM. Con cuantización a 8 bits podría reducirse a ~1 GB, y a 4 bits a ~0.5 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). También puede ejecutarse en CPU con suficiente RAM (alrededor de 4-6 GB).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con transformers de HuggingFace, vLLM, o convertirse a GGUF para usar con llama.cpp u Ollama. No se proporcionan archivos GGUF en el repo.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia es rápida en GPU moderna (típicamente <100 ms por generación corta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| survivle/gemma-3-1b-countdown-v2 | ~1B | no disponible | Countdown | Gemma |
| google/gemma-3-1b-it | ~1B | 32k (oficial) | Generalista, instruct | Gemma |
| google/gemma-3-4b-it | ~4B | 32k (oficial) | Generalista, instruct | Gemma |

No se dispone de otros modelos especializados en countdown para comparar directamente. La comparativa se limita a los modelos base de la familia Gemma, que son los más cercanos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en Gemma-3-1B, aunque no se han evaluado específicamente para esta variante.
- Riesgo de alucinación: en tareas aritméticas, el modelo puede generar soluciones incorrectas o pasos inválidos si no se valida la salida. Se recomienda verificar los resultados con un evaluador externo.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el fine-tune; puede ser menor que la del modelo base si el entrenamiento recortó la ventana.
- Restricciones de licencia: la licencia Gemma permite uso comercial, pero con ciertas restricciones (por ejemplo, no usar para fines militares o vigilancia). Consultar los términos completos en el sitio de Google.
- Caveat de producción: al ser un modelo especializado, su rendimiento en tareas generales de lenguaje puede degradarse respecto al modelo base. No se recomienda usarlo como LLM generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/survivle/gemma-3-1b-countdown-v2
- Modelo base (google/gemma-3-1b-it): https://huggingface.co/google/gemma-3-1b-it
- Repositorio oficial de Gemma (GitHub): https://github.com/google-deepmind/gemma
- Blog de Google sobre Gemma (1B descargas): https://blog.google/innovation-and-ai/technology/developers-tools/gemma-one-billion-downloads/
- Página de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
