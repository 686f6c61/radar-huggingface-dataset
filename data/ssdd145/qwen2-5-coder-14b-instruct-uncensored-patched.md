# SSDD145/Qwen2.5-Coder-14B-Instruct-Uncensored-Patched

## Resumen

Qwen2.5-Coder-14B-Instruct-Uncensored-Patched es una variante comunitaria del modelo Qwen/Qwen2.5-Coder-14B-Instruct, publicada por el usuario SSDD145 (la model card atribuye el trabajo a AIOpsInSpace). Se trata de un transformer denso decoder-only de 14.770.033.664 parámetros (unos 14,77B), orientado a generación de código y asistencia de programación, con pesos distribuidos en formato GGUF y licencia Apache 2.0.

El modelo se presenta como una versión "uncensored" (sin los rechazos de seguridad del modelo original) y "patched", con una corrección específica del manejo de tokens en tareas de autocompletado que, según el autor, provocaba cuelgues en plugins de IDE. El objetivo declarado es ofrecer rendimiento de nivel alto en generación de código dentro de GPUs de 16 GB de VRAM, un segmento muy habitual en estaciones de trabajo de desarrollo local.

Su relevancia es limitada pero concreta: se apoya en uno de los modelos de código abierto de 14B más consolidados de la familia Qwen2.5-Coder, y añade dos modificaciones (eliminación de alineamiento de seguridad y parche de estabilidad) que interesan a quien despliega asistentes de código en local con requisitos de privacidad. Conviene señalar que el repositorio registra 0 descargas y 0 likes en la fecha del registro, que existen varias réplicas del mismo modelo bajo otros autores y que no se han publicado benchmarks verificables en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (derivado de Qwen2.5-Coder) |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base; no confirmado en la información proporcionada para esta variante |
| Tipos de cuantizacion | GGUF; los niveles concretos publicados no se detallan en la información disponible |
| Idiomas soportados | Inglés (declarado como `en` en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiqueta `gguf` y `base_model:quantized`); el repositorio ocupa 60,4 GB |
| Modelo base | Qwen/Qwen2.5-Coder-14B-Instruct |
| Pipeline | text-generation |
| Tamaño del repositorio | 60,4 GB |
| Fecha de publicación | 2026-10-01 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un derivado directo de Qwen2.5-Coder-14B-Instruct, un transformer denso decoder-only con atención causal completa, normalización RMSNorm y embeddings rotatorios (RoPE), la arquitectura estándar de la familia Qwen2.5. No se trata de un MoE ni de una arquitectura híbrida: los 14,77B parámetros se activan en cada token generado, lo que determina directamente los requisitos de VRAM y la latencia.

La información proporcionada no detalla el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de SFT/DPO/RLHF) ni la receta exacta empleada por el autor para esta variante. La model card describe dos modificaciones: la eliminación del comportamiento de rechazo ("uncensored") y un parche en el tratamiento de tokens para autocompletado orientado a plugins de IDE. En el ecosistema de modelos "uncensored" de Qwen2.5-Coder circulan variantes generadas mediante técnicas de abliteración (ortogonalización de la dirección de rechazo en los pesos, sin reentrenamiento), como la publicada por richardyoung; sin embargo, no hay confirmación de que este repositorio concreto utilice ese método, por lo que el procedimiento exacto debe considerarse no disponible.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder-14B-Instruct.
- Autocompletado y continuación de código en editor, con el parche específico de manejo de tokens orientado a plugins de IDE.
- Conversación multi-turno y seguimiento de instrucciones en formato chat (`conversational` en los metadatos).
- Explicación de código, generación de tests y refactorización guiada por instrucciones en lenguaje natural.
- Respuesta sin rechazos de seguridad ante peticiones que el modelo original declinaría (comportamiento "uncensored"), con la consiguiente pérdida de salvaguardas.
- Capacidades multilingües: la ficha declara únicamente inglés. El modelo base Qwen2.5-Coder está entrenado con datos multilingües, pero esta variante no declara idiomas adicionales.
- Soporte de tool calling / function calling: no documentado en la información proporcionada para esta variante. El modelo base sí lo soporta según la documentación de Qwen.
- Modo de razonamiento extendido (thinking), visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Autocompletado en IDE: el parche declarado corrige el manejo de tokens en completados, lo que lo hace apto para integrarse como backend de extensiones tipo VS Code o JetBrains que envían prefijos de código y esperan continuaciones cortas y rápidas.
- Asistente de chat técnico en local: al ejecutarse con pesos GGUF cuantizados en una GPU de 16 GB, permite mantener conversaciones sobre código sin enviar el código fuente a servicios externos, requisito habitual en entornos con datos sensibles.
- Generación de tests unitarios: dado un fichero o una función, el modelo puede producir casos de prueba en el mismo lenguaje y framework, reduciendo el trabajo mecánico de cobertura.
- Refactorización y migración de código legacy: con instrucciones concretas ("convierte esta clase de Python 2 a Python 3", "pasa este módulo de callbacks a async/await") el modelo reescribe bloques completos manteniendo el contexto del fichero.
- Revisión de código automatizada en CI/CD: integrado como paso previo al merge, puede generar comentarios sobre estilo, posibles bugs o ausencia de manejo de errores en los diffs de un pull request.
- Generación de documentación técnica: docstrings, comentarios de cabecera y ficheros README a partir del propio código, útil para repositorios con documentación deficiente.
- Agentes de edición multi-paso: combinado con un orquestador que exponga herramientas de lectura y escritura de ficheros, puede resolver tareas del tipo "añade validación a este endpoint y actualiza los tests".
- Experimentación en investigación sobre alineamiento: al ser una variante sin censura, sirve como objeto de estudio en trabajos sobre refusal, abliteración y evaluación de seguridad, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección titulada "Benchmark Competitiveness" y otra "Arena Analytics", pero su contenido no forma parte de los datos extraídos, por lo que no es posible reproducir cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluación. Tampoco se dispone de mediciones propias de latencia o throughput para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 14,77B parámetros, sin incluir la caché KV):
  - FP16/BF16: en torno a 29,5 GB solo en pesos; con contexto largo y caché KV, 32-36 GB.
  - Cuantización de 8 bits: en torno a 15 GB.
  - Cuantización de 4 bits: en torno a 9 GB (cifra coherente con la referencia pública de ~9 GB para el modelo base en Q4_K_M).
- GPU recomendadas:
  - Un solo A100 40/80 GB, H100 o L40S para FP16/BF16 sin compromisos.
  - RTX 4090 (24 GB) o RTX 3090 (24 GB) para 8 bits con contexto moderado.
  - RTX 4080, RTX 4070 Ti Super o similares con 16 GB para cuantizaciones de 4 bits, que es el escenario objetivo declarado por el autor.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits dentro de GPUs de 16 GB, y en 8 bits en GPUs de 24 GB. El repositorio ocupa 60,4 GB, por lo que incluye varias cuantizaciones y conviene descargar solo el fichero necesario.
- Opciones de despliegue: llama.cpp y sus interfaces (LM Studio, Ollama, KoboldCpp, text-generation-webui) para GGUF; vLLM o TGI requerirían pesos en safetensors, cuya disponibilidad en este repositorio no está confirmada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SSDD145/Qwen2.5-Coder-14B-Instruct-Uncensored-Patched | 14,77B densos | No confirmado (base: 32.768) | Apache 2.0 | GGUF | Variante sin censura y parcheada; 0 descargas en la fecha del registro |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,8B densos | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF | Modelo original alineado, con benchmarks públicos; opción de referencia en el mismo tamaño |
| richardyoung/qwen2.5-coder-14b-instruct-abliterated | 14,8B densos | No disponible | Apache 2.0 (heredada) | GGUF para Ollama | Variante sin censura obtenida por abliteración con Heretic; distribución vía Ollama |
| DeepSeek-Coder-V2-Lite-Instruct | ~15,7B totales, 2,4B activos (MoE) | 128.000 tokens | Licencia propia de DeepSeek | safetensors | Alternativa MoE con muchos menos parámetros activos; datos no verificados en la información proporcionada |

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: al tratarse de una variante "uncensored", no aplica los rechazos del modelo original. Puede generar contenido dañino, ilegal o inseguro, y su uso en producción exige filtros externos y una revisión legal específica.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar APIs, funciones de librerías, fragmentos de configuración o referencias que no existen. En generación de código, esto se traduce en código que compila pero no hace lo que dice.
- Idioma: la ficha declara únicamente inglés. El rendimiento en castellano no está documentado y, aunque el modelo base es multilingüe, esta variante no ofrece ninguna garantía al respecto.
- Licencia: los metadatos indican Apache 2.0, heredada del modelo base, lo que permitiría uso comercial. No obstante, el propio autor publica un descargo de responsabilidad indicando que es un modelo sin alinear y que el cumplimiento legal corresponde al usuario. Conviene verificar los términos en el repositorio antes de un uso comercial.
- Procedencia y trazabilidad: el repositorio principal aparece atribuido a SSDD145, mientras que la model card se firma como AIOpsInSpace y en la búsqueda aparecen réplicas idénticas bajo otros usuarios (AIOpsInSpace, IMUGLYHUH). Con 0 descargas y 0 likes, no existe validación comunitaria de la calidad del parche ni de los pesos publicados.
- Ausencia de benchmarks: no hay métricas que respalden la afirmación de que el parche mejora la estabilidad del autocompletado ni de que la eliminación de la censura no degrade el rendimiento en tareas de código.
- Fecha de publicación anómala: los metadatos indican 2026-10-01, posterior a la fecha habitual de publicación de la familia Qwen2.5-Coder, lo que dificulta situar el modelo en una cronología fiable.
- Contexto: aunque el modelo base soporta 32.768 tokens nativos, no se confirma qué ventana mantiene esta variante tras el proceso de cuantización, y las cuantizaciones agresivas suelen degradar la calidad en contextos largos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SSDD145/Qwen2.5-Coder-14B-Instruct-Uncensored-Patched
- Réplica atribuida a AIOpsInSpace: https://huggingface.co/AIOpsInSpace/Qwen2.5-Coder-14B-Instruct-Uncensored-Patched
- Otra réplica del mismo modelo: https://huggingface.co/IMUGLYHUH/Qwen2.5-Coder-14B-Instruct-Uncensored-Patched
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Ficha del modelo base con datos de hardware: https://everylocalai.com/model/qwen2-5-coder-14b-instruct
- Variante uncensored en GGUF (Local AI Zone): https://local-ai-zone.github.io/models/qwen2-5-coder-14b-instruct-uncensored.html
- Variante abliterada de richardyoung en Ollama: https://ollama.com/richardyoung/qwen2.5-coder-14b-instruct-abliterated
