# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2e

## Resumen

Uraion Cyber V1.0 MLX oQ2e es una cuantización de 2 bits del modelo Uraion Cyber V1.0, un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, desarrollado por Uraion Labs. Está especializado en seguridad defensiva y trabajo agéntico: detección de vulnerabilidades, auditoría de código, generación de parches y reconocimiento de código correcto cuando no hay fallo. Esta variante concreta está empaquetada en formato MLX safetensors para su ejecución en Apple Silicon mediante Metal, usando la cuantización mejorada con matriz de importancia (imatrix) de oMLX 0.7.4.dev1.

El modelo base emplea una arquitectura Qwen3.5 MoE con 256 expertos, de los cuales 8 se enrutan por token, y una ventana de contexto arquitectónica de 262.144 tokens. Conserva la torre de visión del modelo original, por lo que su pipeline es image-text-to-text, y mantiene los pesos MTP (multi-token prediction) si estaban presentes en el checkpoint fuente. Esta build oQ2e ocupa 14,08 GB de pesos y es la más pequeña de la familia MLX, pensada para equipos con 24 GB o más de memoria unificada, a costa de una pérdida de calidad esperable frente a niveles superiores.

Su relevancia actual radica en que permite ejecutar localmente en un Mac un modelo especializado en ciberseguridad defensiva con capacidades de razonamiento, tool calling y visión, sin depender de servicios en la nube. La licencia MIT facilita su adopción tanto en investigación como en entornos comerciales, aunque la model card advierte explícitamente de que el nivel de 2 bits es el que mayor degradación introduce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos, 8 enrutados por token |
| Parámetros totales | 35.951.822.704 (~35B) |
| Parámetros activos | ~3B por token (configuración 35B-A3B) |
| Longitud de contexto | 262.144 tokens (límite arquitectónico; no garantía de memoria) |
| Tipos de cuantización | oQ2e (2 bits, imatrix mejorada de oMLX); familia completa oQ2e a oQ8e |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (14,08 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos y enrutamiento de 8 por token, lo que da lugar a una configuración de ~35B parámetros totales con ~3B activos por token. La arquitectura corresponde a Qwen3.5 MoE según la etiqueta `qwen3_5_moe` y los tags del repositorio, e incorpora una torre de visión que habilita el pipeline image-text-to-text. La model card menciona además la retención de pesos MTP (multi-token prediction) cuando están presentes en el checkpoint fuente, lo que puede aprovecharse para decodificación especulativa.

Esta variante concreta es una cuantización, no un modelo entrenado desde cero: se generó localmente con oMLX 0.7.4.dev1 usando cuantización mejorada con matriz de importancia (oQe imatrix), que asigna precisión de forma no uniforme según la relevancia de los pesos. Se preservan el tokenizador, la plantilla de chat y la torre de visión del modelo original. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información se remite a la model card del modelo padre BF16.

## Capacidades

- Generación de texto y razonamiento con modo thinking (etiquetas `reasoning` y `thinking`).
- Detección de vulnerabilidades y auditoría de código (appsec, code-audit).
- Generación de parches (patch-generation) y verificación de fallos en sandbox.
- Reconocimiento de código correcto cuando no existe vulnerabilidad.
- Soporte de tool calling y function calling.
- Capacidades agénticas y razonamiento multi-paso.
- Procesamiento de imagen y texto (image-text-to-text) gracias a la torre de visión conservada.
- Capacidades de código y programación en general.
- Conversación multi-turno.
- Idiomas: únicamente inglés.

## Casos de uso

- Auditoría de código en local: el modelo puede analizar un fichero de servicio y determinar si existe un fallo explotable, nombrando la función afectada y mostrando la petición que lo demuestra, o confirmando que el código es correcto. Es adecuado por su especialización en seguridad defensiva y su contexto de 262.144 tokens.
- Revisión de seguridad en pipelines de CI/CD: integrado mediante tool calling, puede examinar diffs y parches antes de fusionar, señalando vulnerabilidades introducidas y proponiendo correcciones.
- Generación de parches de seguridad: dado un fallo identificado, el modelo produce el parche correspondiente y puede validarlo en un entorno aislado, aprovechando su capacidad agéntica multi-paso.
- Análisis de capturas y diagramas de arquitectura: al conservar la torre de visión, puede interpretar imágenes de infraestructura o pantallas junto con texto para apoyar tareas de revisión.
- Asistente de investigación en infosec: con modo thinking activado, puede razonar paso a paso sobre vectores de ataque y defensas, útil para formación y análisis de threat modeling.
- Despliegue local en Apple Silicon para equipos de seguridad: al ocupar 14,08 GB en formato MLX, permite ejecutar el modelo en un Mac con 24 GB o más de memoria unificada sin enviar código sensible a la nube.
- Automatización de triaje de hallazgos: puede clasificar y priorizar resultados de escáneres, distinguiendo falsos positivos de fallos reales mediante razonamiento y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la model card del modelo padre BF16 para la metodología de evaluación completa y los resultados de seguridad en conjuntos reservados, pero no incluye cifras concretas en esta variante cuantizada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 14,08 GB solo de pesos; se requiere memoria adicional para macOS, runtime, activaciones y caché KV. La model card sugiere 24 GB o más de memoria unificada.
- Plataforma: Apple Silicon con Metal; el modelo está empaquetado en formato MLX y no está pensado para GPUs NVIDIA.
- GPU recomendadas: no aplica en el sentido tradicional; requiere un Mac con chip Apple Silicon. No se especifican modelos concretos de chip.
- ¿Cabe en GPU de consumo? No en el sentido de GPUs dedicadas; está diseñado para memoria unificada de Apple Silicon. La build oQ2e es la más pequeña de la familia y la que menor huella exige.
- Opciones de despliegue: oMLX (versión actualizada) o un runtime mlx-vlm compatible con Qwen3.5 MoE. Ejemplo de la model card: `omlx serve ./Uraion-Cyber-V1.0-MLX-oQ2e --port 8000`, con API compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- Latencia y throughput: no disponibles.
- Nota sobre contexto: 262.144 tokens es el límite arquitectónico, no una garantía de memoria; el contexto usable real depende de la memoria disponible y de la configuración del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ2e (este) | ~35B totales, ~3B activos | 262.144 | MLX safetensors (2 bits) | MIT | Hugging Face |
| Uraion Cyber V1.0 MLX oQ4e | ~35B totales, ~3B activos | 262.144 | MLX safetensors (4 bits) | MIT | Hugging Face |
| Uraion Cyber V1.0 (BF16) | ~35B totales, ~3B activos | 262.144 | Safetensors BF16 | MIT | Hugging Face |

La comparación más directa es con las otras builds de la misma familia MLX: oQ4e es el punto de partida recomendado (22,13 GB, 32 GB o más de memoria), mientras que oQ2e prioriza el menor consumo (14,08 GB) a costa de calidad. No se dispone de datos de benchmarks para comparar el rendimiento entre estas builds ni frente a modelos de otras familias.

## Limitaciones y advertencias

- La cuantización de 2 bits es la más agresiva de la familia; la model card advierte explícitamente de que se debe esperar pérdida de calidad frente a oQ4e u oQ8e.
- El modelo solo soporta inglés; no hay capacidades multilingües declaradas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente relevante en auditoría de seguridad donde un falso negativo o un falso positivo puede tener consecuencias.
- La ventana de 262.144 tokens es un límite arquitectónico, no una garantía de que el runtime pueda manejar contextos largos con la memoria disponible.
- El modelo está orientado a seguridad defensiva; su uso para fines ofensivos no está respaldado por la documentación y debe evaluarse con cautela.
- La licencia MIT permite uso comercial, pero se recomienda revisar la documentación de seguridad y límites del modelo padre antes de desplegarlo en producción.
- No se han publicado resultados de benchmarks para esta variante cuantizada, por lo que el rendimiento real debe validarse empíricamente en el caso de uso concreto.
- El despliegue requiere Apple Silicon y un runtime MLX compatible con Qwen3.5 MoE; no es portable a GPUs NVIDIA sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Colección Uraion Cyber: https://huggingface.co/collections/UraionLabs/uraion-cyber-6aee3c0f9cd91f015e39b415
- Build oQ8e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ8e
- Build oQ6e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e
- Build oQ5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e
- Build oQ4e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ4e
- Build oQ3.5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e
- Build oQ3e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e
- Build oQ2.7e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e
- Build oQ2.5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.5e
- Sitio de Uraion Labs: https://uraionlabs.com/
