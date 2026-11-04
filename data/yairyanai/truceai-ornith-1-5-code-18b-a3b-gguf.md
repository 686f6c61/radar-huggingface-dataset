# YairYanai/TruceAI-Ornith-1.5-Code-18B-A3B-GGUF

## Resumen

TruceAI Ornith 1.5 Code 18B-A3B es una variante podada del modelo Ornith 1.5 35B-A3B, desarrollado por el usuario YairYanai a partir del trabajo de ornith-ai (Deep Reinforce). Se trata de un modelo de arquitectura MoE (mezcla de expertos) derivado de Qwen 3.5 35B-A3B, al que se le ha eliminado la mitad de sus expertos (de 256 a 128 por capa), conservando aquellos que resultan mas relevantes para tareas de codigo, razonamiento y llamadas a herramientas. El resultado es un modelo de 18.500 millones de parametros totales con 3.400 millones activos, disenado para ejecutarse integramente en GPUs de consumo.

La relevancia de este modelo radica en su enfoque de poda selectiva sin reentrenamiento: en lugar de entrenar un modelo mas pequeno desde cero, se mide la contribucion de cada experto durante sesiones reales de codigo y se eliminan los menos utilizados, ajustando despues la matriz del experto compartido mediante minimos cuadrados para compensar parcialmente la perdida. El resultado es un archivo GGUF de 8,9 GB en cuantizacion Q3_K_M que cabe en 12 GB de VRAM y ofrece un rendimiento de 39 tokens por segundo en una RTX 3060, frente a los 24 tokens por segundo del modelo original en la misma configuracion.

El modelo esta pensado para su uso dentro del motor TruceAI y conserva la licencia MIT del modelo base. Su calidad se mantiene razonablemente cerca del original en tareas de codigo (74,9% de coincidencia en la prediccion del siguiente token sobre codigo no visto), aunque se espera un deterioro notable en conocimiento general, idiomas distintos del ingles y escritura creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen35moe) con 128 expertos por capa |
| Parametros totales | 18.543.997.568 (18,5B) |
| Parametros activos | 3,4B (aproximado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (se espera degradacion fuera del ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como formato del modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith 1.5 35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE) construido sobre Qwen 3.5 35B-A3B, con 256 expertos por capa y 3.500 millones de parametros activos sobre un total de 35.500 millones. La variante TruceAI Code reduce esa cifra a 128 expertos por capa mediante un proceso de poda en tres fases. Primero, se midio la contribucion de cada experto (peso de enrutamiento multiplicado por longitud de salida) en 12 sesiones de codigo con modo thinking activado, cubriendo TypeScript, Python, Rust, Go, SQL, React, C++, bash y Java, ademas de turnos de agente con llamadas a herramientas. Despues, se conservaron en cada capa los 128 expertos con mayor contribucion, eliminando tambien las filas correspondientes del enrutador. Finalmente, en las 20 capas cuya matriz de salida del experto compartido estaba almacenada en Q8_0, se corrigio dicha matriz mediante minimos cuadrados para aproximar parte de la contribucion de los expertos eliminados.

No se realizo ningun entrenamiento adicional: se trata de una edicion directa de pesos. La capa de prediccion multi-token (multi-token prediction) fue eliminada. El modelo conserva el codificador de imagenes del original (archivo `mmproj-F16.gguf`), aunque la entrada de imagen no ha sido probada con esta variante podada. El proceso de poda no incluye RLHF ni DPO; simplemente hereda las caracteristicas del modelo base.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (TypeScript, Python, Rust, Go, SQL, React, C++, bash, Java).
- Razonamiento con modo thinking, heredado del modelo base.
- Llamadas a herramientas (tool calling / function calling) y turnos de agente multi-paso.
- Capacidad de vision potencial a traves del codificador de imagenes incluido, aunque no verificada en esta variante.
- Capacidades multilingues no documentadas; se espera un rendimiento notablemente inferior al original fuera del ingles.
- Conversacion multi-turno (etiqueta `conversational` en HuggingFace).

## Casos de uso

- Asistencia de codigo en local: el modelo cabe en 12 GB de VRAM en Q3_K_M, lo que permite ejecutarlo en una RTX 3060 y usarlo como asistente de programacion sin conexion, con 39 tokens por segundo.
- Generacion de codigo en pipelines de CI/CD: su soporte de tool calling y su tamano reducido permiten integrarlo en flujos automatizados de revision o generacion de parches donde el coste por token es critico.
- Agentes de codigo multi-paso: los turnos de agente con llamadas a herramientas fueron parte del conjunto de calibracion de la poda, por lo que el modelo conserva los expertos mas relevantes para este tipo de tareas.
- Entornos con GPU de consumo: desarrolladores con una unica GPU de 12 GB que necesitan un modelo MoE con capacidad de razonamiento y codigo, sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de generacion de codigo: la licencia MIT y el formato GGUF facilitan la experimentacion y el despliegue en herramientas como llama.cpp u Ollama (aunque el autor solo ha probado el motor TruceAI).
- Traduccion de codigo entre lenguajes: al haber sido calibrado con sesiones en nueve lenguajes distintos, puede emplearse para convertir fragmentos entre ellos, con la cautela de que la calidad fuera de codigo es inferior a la del original.
- Educacion y aprendizaje de programacion: su bajo coste de ejecucion permite ofrecer explicaciones de codigo en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Ornith 1.5 35B-A3B (Q3_K_M) | TruceAI Ornith 1.5 Code 18B-A3B (Q3_K_M) |
|---|---|---|
| Parametros totales | 35,5B | 18,5B |
| Parametros activos | 3,5B | 3,4B |
| Expertos por capa | 256 | 128 |
| Tamano del archivo | 16,7 GB | 8,9 GB |
| Velocidad en RTX 3060 12 GB (motor TruceAI) | 24 tokens/s | 39 tokens/s |
| Coincidencia en siguiente token sobre codigo no visto | referencia | 74,9% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GB para el archivo Q3_K_M de 8,9 GB, mas overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB (verificada por el autor), RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el ambito profesional, A100 o H100 aunque no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM. El autor indica que el modelo se ejecuta integramente en VRAM sin expertos en RAM del sistema.
- Opciones de despliegue: el autor solo ha probado el motor TruceAI. El archivo usa la arquitectura `qwen35moe` con 128 expertos y no se han probado otros runners GGUF (llama.cpp, Ollama, vLLM no verificados).
- Latencia y throughput: 39 tokens/s en RTX 3060 12 GB con el motor TruceAI, frente a 24 tokens/s del modelo original en la misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TruceAI Ornith 1.5 Code 18B-A3B | 18,5B | 3,4B | no disponible | MIT | GGUF | HuggingFace |
| Ornith 1.5 35B-A3B | 35,5B | 3,5B | no disponible | MIT | safetensors / GGUF | HuggingFace |
| Qwen 3.5 35B-A3B | 35B | 3B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks frente a alternativas de otros fabricantes. Frente al modelo original, la variante podada ofrece la mitad del tamano en disco, un 62,5% mas de velocidad en RTX 3060 y una retencion del 74,9% en la prediccion del siguiente token sobre codigo.

## Limitaciones y advertencias

- El propio autor advierte de un rendimiento inferior al original fuera del ambito del codigo: idiomas distintos del ingles, conocimiento general y escritura creativa se ven afectados por la poda.
- La poda se realizo sin entrenamiento, por lo que no hay garantia de que los expertos conservados generalicen bien a dominios no representados en las 12 sesiones de calibracion.
- La coincidencia del 74,9% en el siguiente token implica que aproximadamente una de cada cuatro predicciones difiere del original, lo que puede acumular errores en generaciones largas.
- La entrada de imagen a traves del codificador incluido no ha sido probada; no debe asumirse que la capacidad de vision funcione correctamente.
- Solo se ha probado con el motor TruceAI; la compatibilidad con llama.cpp, Ollama u otros runners GGUF no esta verificada.
- La longitud de contexto no esta documentada en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente mayor que en el original por la perdida de expertos.
- La licencia MIT permite uso comercial, pero se recomienda validar el comportamiento en el dominio concreto antes de desplegarlo en produccion.
- El repositorio no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/YairYanai/TruceAI-Ornith-1.5-Code-18B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Organizacion Ornith AI: https://huggingface.co/ornith-ai
- TruceAI: https://truceai-remote.truceai-site.workers.dev
