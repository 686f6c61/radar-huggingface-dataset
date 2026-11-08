# whcl412/FinchAI-Rune2-Luna

## Resumen

FinchAI-Rune2-Luna es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario whcl412 (hwc) dentro de la serie FinchAI. Está orientado específicamente a la llamada de herramientas (tool calling), la estabilidad en conversaciones multiturno y la capacidad de rechazo seguro. No es un modelo de propósito general: es un derivado de 1,73 mil millones de parámetros entrenado sobre un conjunto de datos propio de 1.339 muestras, destilado en parte de DeepSeek V4.1-Flash y complementado con datos escritos a mano.

La relevancia de esta versión (Luna) radica en que corrige un fallo grave detectado en su predecesor (FinchAI-Rune2-f16): la repetición compulsiva a partir del tercer o cuarto turno de conversación. El autor añadió 139 muestras multiturno específicas y reporta que el número de repeticiones en pruebas propias bajó de 1 a 0, manteniendo el resto de capacidades. El modelo hereda la arquitectura híbrida de LFM3 y una ventana de contexto nominal de 262.144 tokens, aunque el entrenamiento se realizó con secuencias de como máximo 756 tokens.

Los pesos se distribuyen en precisión completa bfloat16 (3,24 GiB), sin cuantizar ni destilar, con licencia LFM Open License v1.0 (no Apache 2.0), lo que impone un umbral de facturación anual de 10 millones de dólares para uso comercial. El modelo solo soporta chino e inglés y no incluye capacidades de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida (LFM3, "three-hybrid architecture" según el autor; detalles no disponibles) |
| Parámetros totales | 1.728.801.536 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) nominales; entrenado solo hasta 756 tokens por muestra, sin garantías más allá de ~1K |
| Tipos de cuantización | No se distribuyen cuantizaciones oficiales; pesos en bfloat16/f16. Compatible con cuantización externa (no verificada por el autor) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bfloat16, 3,24 GiB), con código de modelado propio (`modeling_lfm3.py`, `configuration_lfm3.py`, `lfm3_conv.py`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, descrito por el autor como una arquitectura "three-hybrid". La información proporcionada no detalla la composición exacta de esa hibridación (combinación de atención, convoluciones o componentes recurrentes), por lo que ese dato queda como no disponible. La adaptación se realizó mediante LoRA con rango 8 y alpha 16, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `out_proj` y `gate_proj`. Luna no se entrenó desde el modelo base, sino continuando el adaptador de la versión v2 durante 83 pasos (0,5 épocas) con tasa de aprendizaje 5e-5, en unos 15 minutos.

El conjunto de datos total asciende a 1.339 muestras repartidas en seis categorías: agentes (28,5%), multiturno (21,7%), rechazo (17,0%), código (14,9%), conversación casual (9,6%) e identidad (8,4%). Parte de los datos se destilaron de DeepSeek V4.1-Flash y el resto se escribió manualmente. La innovación metodológica destacable es el tratamiento de las 139 muestras multiturno añadidas en Luna: se generaron con una instrucción de sistema que prohibía repetirse, pero durante el entrenamiento se sustituyó por una versión breve del sistema para evitar que el modelo aprendiera a no repetirse solo cuando el prompt lo indica explícitamente. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Llamada de herramientas y funciones con formato XML propietario (`<tool_call><function=...><parameter=...>`), no JSON.
- Modo de razonamiento explícito: el contenido de pensamiento se emite dentro de etiquetas `<think>…</think>` en la misma respuesta del asistente.
- Autodescripción de identidad consistente (100% de acierto en las pruebas del autor).
- Rechazo seguro ante peticiones dañinas, con propuesta de alternativas acotadas.
- Solicitud de aclaración cuando faltan parámetros en una llamada a herramienta.
- Capacidad de arrastrar información concreta de turnos anteriores (multiturno).
- Generación de código dentro del ámbito de sus datos de entrenamiento.
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Agentes de automatización de sistemas: el modelo puede decidir qué herramienta invocar y emitir la llamada en el formato XML esperado, lo que permite integrarlo en orquestadores que expongan operaciones como listar directorios, leer ficheros o consultar estados. Su entrenamiento específico en juicio de tool calling lo hace adecuado para este rol frente a un modelo base sin ajustar.
- Asistentes conversacionales de atención al cliente con sesiones cortas: la corrección de la repetición multiturno permite mantener conversaciones de cuatro o cinco intercambios sin que el modelo empiece a repetir la misma frase, algo que su predecesor no conseguía.
- Enrutamiento de peticiones con aclaración: cuando la petición del usuario es ambigua, el modelo formula una pregunta de vuelta en lugar de inventar parámetros, lo que encaja en flujos donde la herramienta exige argumentos obligatorios.
- Filtrado y rechazo de solicitudes peligrosas: puede emplearse como primera capa de un pipeline que clasifique peticiones destructivas y devuelva una negativa con una alternativa limitada, complementado con una segunda barrera en el host.
- Prototipado rápido en local: con 1,73B parámetros en bfloat16 (3,24 GiB) cabe en GPUs de consumo, lo que permite iterar sobre prompts y plantillas de herramientas sin infraestructura dedicada.
- Generación de código asistida en entornos de habla china: el soporte nativo de zh y su entrenamiento en código lo hacen utilizable para autocompletado o explicación de fragmentos en aplicaciones dirigidas a ese mercado.
- Evaluación de plantillas de tool calling: dado que el modelo es sensible al orden de las herramientas, puede servir para probar y depurar el diseño de esquemas de funciones antes de desplegar un modelo mayor.

## Benchmarks y rendimiento

El autor publica una comparación de pruebas propias (no benchmarks estándar) entre Rune1 v2, Rune2 v2 y Rune2 Luna. Los conjuntos de prueba no son idénticos entre generaciones (7 sondas × 5 muestras en Rune1 frente a 14 sondas × 2 muestras en Rune2), por lo que el propio autor advierte que solo sirven para ver tendencias.

| Dimensión | Rune1 v2 | Rune2 v2 | Rune2 Luna |
|---|---|---|---|
| Identidad | 60% | 100% | 100% |
| Llamada de herramientas | 67% | 100% | 100% |
| Rechazo seguro | 100% | 83% | 100% |
| Petición de parámetros faltantes | 60% | 100% | 100% |
| Continuidad multiturno | 60% | 75% | 100% |
| Repeticiones multiturno | no disponible | 1 | 0 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB para los pesos en bfloat16 más el overhead de activaciones y caché KV; en la práctica, 6-8 GB de VRAM permiten inferencia con contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bfloat16; con cuantización externa a 8 bits o 4 bits cabría en tarjetas de 4-6 GB, aunque el autor no distribuye versiones cuantizadas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada (requiere transformers >= 5.18.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al requerir código de modelado propio, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinchAI-Rune2-Luna | 1,73B | 256K nominal (entrenado ~756 tokens) | Tool calling y multiturno en zh/en | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | Propósito general | LFM Open License v1.0 | Hugging Face |
| FinchAI-Rune2-f16 (predecesor) | 1,73B | 256K nominal | Tool calling y multiturno | LFM Open License v1.0 | Hugging Face |
| FinchAI-Rune1-Preview-v2-f16 (primera generación) | no disponible | no disponible | Tool calling y multiturno | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de benchmarks estándar que permitan comparar el rendimiento con modelos de otros autores del mismo tamaño.

## Limitaciones y advertencias

- La ventana de contexto nominal es de 256K, pero el entrenamiento usó secuencias de como máximo 756 tokens; el autor advierte que más allá de ~1K el comportamiento no está garantizado.
- El autor recomienda truncar el historial a las últimas cuatro rondas y añadir un detector de repetición en el host, pese a la mejora reportada.
- La continuidad multiturno depende de que el contexto previo contenga información concreta; si el turno anterior es vago, el modelo tiende a volver a preguntar.
- Las preguntas de aclaración pueden desviarse un nivel (preguntar por el directorio cuando se pedía el fichero).
- El modelo es sensible al orden de las herramientas: reordenar la misma lista puede cambiar la elección. Conviene colocar primero las más probables.
- Puede inventar cifras cuando la herramienta devuelve listas; se recomienda exponer herramientas que devuelvan directamente el dato solicitado (por ejemplo, un contador).
- El rechazo de seguridad es del tipo "negar y ofrecer alternativa", no un bloqueo absoluto: puede proponer comandos de borrado acotados. Para prohibiciones estrictas hace falta una capa adicional en el host.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10 millones de dólares de facturación anual; por encima se requiere acuerdo con Liquid AI. Prohibido usar la marca Liquid AI. Obligación de adjuntar la licencia y marcar los ficheros modificados.
- Solo chino e inglés; no hay soporte de otros idiomas ni de visión.
- Riesgo de alucinación inherente a un modelo de 1,73B, agravado por un conjunto de entrenamiento pequeño (1.339 muestras).
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar los ficheros de modelado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune2-Luna
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Versión anterior (v2): https://huggingface.co/whcl412/FinchAI-Rune2-f16
- Primera generación: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
- Repositorio de scripts y datos: https://github.com/hwc-cell/FinchAI-Rune2-Luna
- Perfil del autor: https://huggingface.co/whcl412
