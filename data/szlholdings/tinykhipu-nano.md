# SZLHOLDINGS/TinyKhipu-Nano

## Resumen

TinyKhipu-Nano es un artefacto experimental publicado por SZL Holdings en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo de lenguaje de gran escala, sino de un "silhouette" en NumPy: un conjunto de unos pocos miles de flotantes que implementa un navegador de tokens de fórmula sobre un conjunto cerrado de ocho identificadores bloqueados. Su función es decidir si debe navegar (NAVIGATE) hacia una de esas referencias o abstenerse (ABSTAIN) cuando no hay coincidencia con la consulta.

El modelo forma parte de un ecosistema de "IA gobernada" que SZL Holdings está desarrollando, con énfasis en la trazabilidad de las citas y la prevención estructural de alucinaciones. La model card insiste en que no es un modelo de 1.500 millones de parámetros, no es Qwen, no es GGUF ni un chat model. Es una prueba de concepto de lógica de decisión acotada, entrenada con un script de Python que se ejecuta en CPU.

El interés de esta ficha radica en documentar un caso atípico dentro del catálogo de Hugging Face: un modelo que no genera texto, sino que clasifica y abstiene, con una promesa de que las citas incorrectas son "estructuralmente imposibles" gracias a un filtro duro. Su relevancia es más conceptual (gobernanza de IA, verificación de fuentes) que práctica para desarrolladores de aplicaciones convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (silhouette NumPy, no una red neuronal estándar) |
| Parametros totales | "A few thousand floats" (sin cifra exacta publicada) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | NPZ (NumPy) |

## Arquitectura y entrenamiento

La model card describe un "formula-token navigator" que opera sobre un conjunto cerrado de ocho IDs ("locked-eight IDs"). El entrenamiento se realiza con la función `tiny_khipu.train(seed=20260721, steps=280)` del paquete `szl_khipu`, que devuelve los pesos y una evaluación con métricas de plan válido, abstinencia y alucinaciones. No se especifican detalles de la arquitectura interna (no se mencionan capas, funciones de activación ni tipo de red). Dado que se trata de un "silhouette", es probable que sea una representación simplificada de un sistema mayor, posiblemente un clasificador lineal o una tabla de pesos.

El entrenamiento es determinista (semilla fija) y de muy bajo coste computacional (CPU). El autor indica que las citas alucinadas son "0 por construcción" gracias a un filtro duro que impide citar identificadores fuera del conjunto ofrecido. No hay información sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO. La model card menciona "Doctrine v11 LOCKED · 749/14/163 · locked-proven 8", que sugiere una estructura de documentación formal con teoremas y obligaciones abiertas.

## Capacidades

- Navegación selectiva: decide si una consulta contiene un token de fórmula bloqueado y si ese token está en un identificador ofrecido.
- Abstinencia explícita: si no hay coincidencia, el modelo devuelve ABSTAIN en lugar de intentar una respuesta.
- Prevención estructural de alucinaciones: el filtro duro hace imposible citar identificadores fuera del conjunto permitido.
- Clasificación de honestidad: reporta etiquetas como REPORTED, ADVISORY o UNAVAILABLE para diferentes afirmaciones.
- Ejecución en CPU: no requiere GPU ni CUDA.
- No genera texto libre ni mantiene conversaciones; es un clasificador binario/ternario sobre un dominio acotado.

## Casos de uso

- Verificación de citas en sistemas de gobernanza de IA: el modelo puede servir como componente de control para garantizar que un sistema solo haga referencia a identificadores previamente aprobados, evitando alucinaciones en la generación de enlaces o referencias.
- Prueba de concepto de abstinencia como comportamiento deseable: en aplicaciones donde la incertidumbre debe llevar a no responder, este modelo demuestra un mecanismo de "no sé" estructural en lugar de una respuesta inventada.
- Auditoría de lógica de decisión acotada: al ser un silhouette NumPy, se puede inspeccionar y auditar el peso de cada decisión, útil para entornos regulados que exigen transparencia.
- Investigación sobre "IA gobernada": sirve como ejemplo mínimo de un sistema que separa navegación (cuándo responder) de abstención (cuándo callar) con garantías formales.
- Integración en pipelines de evaluación de modelos: podría usarse como oráculo de referencia para comprobar que otros modelos no citan identificadores no permitidos.
- Demostración educativa: para enseñar cómo un filtro determinista puede eliminar una clase de error (alucinación de citas) sin depender de aprendizaje estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas del entrenamiento (plan válido, abstinencia, alucinaciones) sin números concretos. No hay comparación con otros modelos.

## Requisitos de hardware

- Ejecución en CPU: el entrenamiento y la inferencia se realizan con NumPy, por lo que cualquier máquina con Python y NumPy instalados es suficiente.
- VRAM: 0 GB (no requiere GPU).
- GPU recomendadas: ninguna.
- Compatibilidad con consumer GPU: no aplica.
- Opciones de despliegue: se puede ejecutar como script Python independiente, o integrarse en un servicio mayor mediante la función `tiny_khipu.train` y `tiny_khipu.save_npz`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, pero al ser un conjunto de pocos miles de flotantes, la inferencia es prácticamente instantánea en cualquier CPU moderna.

## Comparativa con modelos similares

No disponible. Este modelo es único en su categoría: no existe un conjunto comparable de modelos "silhouette" de gobernanza de IA en el ecosistema abierto. No se puede comparar con LLMs convencionales porque no realiza generación de texto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no responde preguntas abiertas.
- No es SZL-Khipu-1.5B: la model card advierte explícitamente que no debe confundirse con ese modelo de investigación (una propuesta de QLoRA).
- No es Qwen ni GGUF: no es un modelo transformador ni está cuantizado.
- No tiene capacidad de razonamiento general: su lógica se limita a tokens de fórmula específicos.
- La unicidad de Λ (Lambda) es una conjetura abierta, no un teorema probado: "Λ uniqueness remains Conjecture 1 OPEN".
- No se reporta consumo energético ni soporte CUDA: "Energy UNAVAILABLE", "CUDA UNAVAILABLE".
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción en aplicaciones de lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/TinyKhipu-Nano
- Repositorio canónico en GitHub: https://github.com/szl-holdings/szl-khipu
- Card hermano (SZL-Khipu-1.5B): https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Perfil de la organización SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS/models
- Documentación de SZL Holdings: https://holdings.a-11-oy.com/docs-site/about.html
- Atlas del ecosistema SZL: https://a-11-oy.com/ecosystem
- Repositorio khipu-consensus (protocolo BFT): https://github.com/szl-holdings/khipu-consensus
