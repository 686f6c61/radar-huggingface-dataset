# zmi/Qwen3-30B-A3B-Instruct-2507_50-MoBE

## Resumen

zmi/Qwen3-30B-A3B-Instruct-2507_50-MoBE es una variante derivada del modelo Qwen3-30B-A3B-Instruct-2507, publicada por el usuario zmi en Hugging Face. El repositorio contiene pesos en safetensors con 20.862.547.968 parametros totales (unos 20,86 mil millones), frente a los aproximadamente 30.500 millones del modelo base, lo que apunta a una reestructuracion de la capa de mezcla de expertos. El sufijo "50-MoBE" sugiere ese tipo de modificacion, pero el autor no publica ninguna tarjeta de modelo que la documente.

La etiqueta qwen3_moe confirma que se conserva la arquitectura de transformer decoder-only con mezcla de expertos (MoE) de la familia Qwen3. Se desconoce el numero de expertos resultantes, cuantos se activan por token, la longitud de contexto efectiva tras la modificacion y si hubo reentrenamiento o solo un proceso de poda o fusion de pesos.

Su relevancia practica es hoy muy limitada y puramente experimental: acumula 11 descargas y 0 "me gusta", no declara licencia, idiomas ni resultados de evaluacion, y fue creado el 13 de octubre de 2026. Resulta util sobre todo como objeto de estudio para investigacion sobre poda y fusion de expertos en arquitecturas MoE, no como modelo listo para produccion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), variante derivada de Qwen3 (etiqueta `qwen3_moe`) |
| Parámetros totales | 20.862.547.968 (~20,86 mil millones), según los pesos safetensors del repositorio |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible; el modelo base Qwen3-30B-A3B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en BF16; no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16: 20.862.547.968 parámetros × 2 bytes ≈ 41,7 GB) |

## Arquitectura y entrenamiento

El repositorio no incluye tarjeta de modelo, informe técnico ni descripción del proceso de creación. Lo único verificable es que los pesos están en formato safetensors con 20.862.547.968 parámetros y que la etiqueta de arquitectura es `qwen3_moe`. Según la documentación pública del modelo base Qwen3-30B-A3B-Instruct-2507, este emplea un transformer decoder-only de 48 capas con 128 expertos por capa de mezcla y 8 expertos activados por token, lo que da unos 3,3 mil millones de parámetros activos sobre 30,5 mil millones totales. Es razonable asumir que la arquitectura de este derivado es la misma familia, pero se desconoce cuántos expertos quedan tras la modificación, cuáles son los parámetros activos resultantes y si la reducción de parámetros totales (de ~30,5 mil millones a 20,86 mil millones) procede de poda de expertos, de fusión de pesos o de una combinación de ambas técnicas.

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni sobre si se aplicaron fases de ajuste supervisado, RLHF o DPO. No consta registro de evaluación reproducible, ni publicación de checkpoints intermedios, ni explicación del método de modificación aplicado sobre el modelo original.

## Capacidades

No existe documentación que certifique las capacidades de este modelo concreto. Las siguientes son las capacidades declaradas del modelo base Qwen3-30B-A3B-Instruct-2507 y no están verificadas en este repositorio:

- Generación de texto y conversación multi-turno.
- Razonamiento y resolución de problemas de matemáticas.
- Generación y edición de código en múltiples lenguajes.
- Soporte de tool calling y function calling (formato de plantilla de chat de Qwen3).
- Capacidad de seguir instrucciones y de razonamiento en varios pasos, apta para flujos de agente.
- Cobertura multilingüe amplia (más de 100 idiomas en la familia Qwen3).
- Modo de pensamiento (thinking) en las variantes de razonamiento; el modelo base de la serie "Instruct-2507" es de respuesta directa, sin modo híbrido.
- No se ha confirmado visión, audio ni modalidades adicionales en este derivado.

## Casos de uso

- Investigación sobre poda y fusión de expertos en MoE: el modelo sirve como caso de estudio de un derivado de 20,86 mil millones de parámetros obtenido a partir de un MoE de 30,5 mil millones, útil para medir pérdida de calidad frente al original.
- Reproducción de experimentos de compresión: permite comparar perplejidad, exactitud en tareas de razonamiento y latencia contra el checkpoint original bajo el mismo pipeline de evaluación.
- Generación de código en local (previo despliegue): si la modificación preserva la capacidad del base, puede ejecutarse cuantizado en una GPU de consumo para autocompletado y revisión de código.
- Asistente conversacional autoalojado: con 262.144 tokens de contexto en el modelo original, es adecuado para conversaciones largas con documentación extensa, siempre que se valide primero que el derivado mantiene esa ventana.
- Base para ajuste fino posterior (SFT/LoRA): al ser pesos safetensors compatibles con el ecosistema de Qwen3, puede servir como punto de partida para especializaciones de dominio, asumiendo el riesgo de calidad no verificada.
- Evaluación comparativa de herramientas de inferencia: útil para comprobar la compatibilidad de arquitecturas MoE modificadas en vLLM, TGI o llama.cpp tras convertir los pesos.
- Docencia y análisis de arquitecturas MoE: permite inspeccionar cómo cambia la distribución de parámetros entre capas de atención y capas de expertos en un modelo derivado.
- No se recomienda su uso en producción orientada a cliente sin una evaluación previa de calidad, licencia y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluación alguna (MMLU, HumanEval, GSM8K ni otras) y no hay comparaciones verificables frente al modelo base ni frente a otros MoE de tamaño similar.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 41,7 GB; con caché KV y overhead de runtime conviene reservar entre 48 y 56 GB para contexto largo.
- GPU recomendadas para BF16: NVIDIA A100 80 GB, H100 80 GB, H200 o dos GPU de 48 GB en tensor paralelo (2× L40S, 2× RTX 6000 Ada).
- Consumer GPU: en BF16 no cabe en una RTX 4090 (24 GB). Con cuantización de 8 bits (~21 GB) o de 4 bits (~12-13 GB, estimación) sí cabría en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB; en Mac con memoria unificada de 24 GB o más también sería viable en 4 bits.
- Formatos de despliegue: transformers (carga directa de safetensors), vLLM y TGI si soportan la arquitectura modificada; llama.cpp y Ollama requieren una conversión previa a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo batching.

## Comparativa con modelos similares

Datos de los modelos de referencia según sus fichas oficiales; conviene verificarlos en origen.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zmi/Qwen3-30B-A3B-Instruct-2507_50-MoBE | 20,86 mil millones | no disponible | no disponible | no disponible | safetensors, 41,7 GB, 11 descargas |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | ~30,5 mil millones | ~3,3 mil millones | 262.144 tokens | Apache 2.0 | oficial, ampliamente desplegado |
| Qwen/Qwen3-32B | ~32,8 mil millones (denso) | ~32,8 mil millones | 32.768 tokens nativos, extensible con YaRN | Apache 2.0 | oficial, ampliamente desplegado |

No hay datos de rendimiento del modelo analizado que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de tarjeta de modelo: no se documentan datos de entrenamiento, método de modificación, hiperparámetros ni evaluación.
- Licencia no declarada: el uso comercial es jurídicamente incierto. Aunque el modelo base es Apache 2.0, el autor no confirma la licencia del derivado ni incluye avisos de atribución.
- Sin benchmarks: no hay evidencia de que la reducción de parámetros preserve la calidad del modelo original. La poda o fusión de expertos suele degradar antes las tareas de razonamiento y generación de código que las de lenguaje general.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no acotado en este caso por falta de evaluaciones.
- Adopción nula: 11 descargas, 0 "me gusta" y sin incidencias ni comentarios de la comunidad, lo que dificulta contrastar su comportamiento real.
- Contexto e idiomas sin verificar: no se puede confirmar que la ventana de 262.144 tokens del base se mantenga tras la modificación de expertos.
- Reproducibilidad: al no publicarse el procedimiento, no es posible replicar el modelo ni auditar qué se cambió respecto al original.
- Formato de pesos: al ser safetensors no hay ejecución de código arbitrario en la carga de pesos, pero conviene revisar cualquier script adicional del repositorio antes de ejecutarlo.
- Antes de cualquier uso en producción, se recomienda validar el modelo con un conjunto propio de tareas, comprobar el cumplimiento de licencia con el autor y comparar métricas contra el checkpoint oficial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zmi/Qwen3-30B-A3B-Instruct-2507_50-MoBE
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio de código de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- La búsqueda web no devolvió documentación relevante sobre este modelo. El único resultado obtenido (un documento sobre demostraciones de ISSCC 2026 alojado en Scribd) no guarda relación con el modelo.
