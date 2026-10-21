# tilkis/Bihter-1.5B

## Resumen

Bihter-1.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario tilkis para un caso de uso muy concreto: actuar como asistente de recepción de un hotel ficticio llamado Begonvil Otel. El modelo se ha entrenado con QLoRA (r=16) sobre un conjunto de 504 ejemplos sintéticos y combina tres comportamientos en un mismo modelo: una identidad y un estilo de respuesta fijos (turco, frases cortas, tono cálido y la marca "🌸"), la selección correcta de herramientas mediante un protocolo JSON y el uso de contexto recuperado (RAG) para responder con datos del establecimiento.

La relevancia de esta ficha no está en el rendimiento bruto del modelo, sino en que documenta un patrón de trabajo reproducible para desarrolladores: partir de un modelo pequeño con licencia Apache-2.0, entrenarlo en una GPU T4 gratuita en aproximadamente 3 horas con cuantización de 4 bits y desplegarlo en CPU con GGUF q8_0, manteniendo el conocimiento factual fuera de los pesos (en un PDF vectorizado y una tabla CSV consultada mediante herramienta). El autor reporta mejoras internas muy marcadas en la selección de herramienta (0,24 → 0,88) y en la validez del JSON generado (0,65 → 0,94).

Se trata, por tanto, de un modelo de nicho, monolingüe (turco) y sin tracción comunitaria (0 descargas, 0 likes en el momento de la consulta), no de un modelo generalista. Su interés es principalmente como referencia de arquitectura de sistema (modelo pequeño + RAG + tool calling + despliegue en CPU) para asistentes de dominio cerrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2/Qwen2.5), ajustado con QLoRA (r=16) sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones, según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | QLoRA 4 bits durante el entrenamiento; GGUF q8_0 en el despliegue del autor; otras cuantizaciones no documentadas |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF q8_0 para inferencia en CPU; tamaño del repositorio 6,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5 mil millones de parámetros con plantilla de chat ya preparada para turco. Sobre esa base se aplica un ajuste supervisado con QLoRA y rango r=16: los pesos base se congelan en cuantización de 4 bits y solo se entrenan los adaptadores de bajo rango, lo que permite completar el entrenamiento en una T4 en aproximadamente 3 horas. El autor justifica la elección de 1,5B frente a 3B y 7B por tres motivos: el 7B no cabe en la memoria de una T4, el 3B duplica el tiempo de entrenamiento y el tiempo de inferencia en CPU, y el 1,5B conserva una calidad de turco suficiente para un dominio cerrado.

Los datos de entrenamiento son 504 ejemplos sintéticos del dataset `tilkis/bihter-begonvil-veri`, organizados en cuatro bloques (identidad, RAG, agente y agente2). No se documenta el número de tokens ni el uso de RLHF o DPO; el procedimiento descrito es ajuste supervisado sobre ejemplos generados, con revisión manual de una muestra aleatoria. La innovación técnica no está en el modelo sino en el reparto de responsabilidades: el conocimiento factual se obtiene de dos fuentes externas —un PDF de 15 secciones indexado con Chroma y `mpnet-base-v2` para búsqueda vectorial, y una tabla `odalar.csv` consultada de forma determinista mediante la herramienta `oda_bilgisi`— mientras que los pesos solo codifican identidad, estilo y el protocolo JSON de invocación de herramientas. No se mencionan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional en turco con estilo controlado: respuestas cortas, tono cálido y marca "🌸" inyectada por el ajuste fino (el autor mide identidad y marca al 1,00 tras el entrenamiento).
- Tool calling mediante un protocolo JSON propio: el modelo emite llamadas estructuradas a herramientas, con una tasa de JSON válido reportada de 0,94 y de selección correcta de herramienta de 0,88.
- Comportamiento de agente de un solo paso: interpreta la consulta, decide si necesita el directorio del hotel, la tabla de habitaciones o ninguno de los dos, y delega la respuesta final en el contexto recuperado.
- Uso de contexto RAG: integra fragmentos recuperados del guía del hotel y responde con cifras concretas cuando el contexto las contiene (horarios de entrada y salida, tarifas de traslado, servicios de spa, admisión de mascotas, carga de vehículos eléctricos).
- Gestión explícita de la ignorancia: cuando la información no está en el guía, responde "Bu bilgi rehberde yok" y redirige a recepción, en lugar de improvisar.
- Dominio cubierto: check-in y check-out, reservas, restauración, piscina, spa, traslados, mascotas, aparcamiento y eventos.
- No soporta visión, audio ni otros idiomas distintos del turco según la información disponible.

## Casos de uso

- Recepción hotelera automatizada en web o widget de chat: el modelo atiende consultas de huéspedes en turco sobre horarios, servicios y políticas, apoyándose en el guía vectorizado para las respuestas factuales y reservando los pesos para el tono y la estructura de la respuesta.
- Traslados y servicios de pago con tarifa variable: la consulta se resuelve contra el guía mediante RAG, lo que evita que el modelo invente precios; el autor documenta que sin contexto el modelo respondía "es gratuito" y con Chroma devolvía la tarifa real de 1.800 TL.
- Consulta determinista de disponibilidad y características de habitaciones: la herramienta `oda_bilgisi` sobre `odalar.csv` devuelve datos exactos de la tabla, un patrón reutilizable para cualquier catálogo que requiera exactitud numérica.
- Despliegue en infraestructura modesta: con GGUF q8_0 el modelo funciona en CPU, lo que permite servirlo en el propio sitio web del negocio sin GPU; el autor reporta latencias de 10 a 60 segundos por respuesta en ese entorno.
- Plantilla para asistentes de dominio cerrado en otros sectores: la receta (modelo base Apache-2.0 de 1,5B + QLoRA r=16 + RAG + una herramienta determinista + evaluación antes/después) es trasladable a clínicas, gimnasios o comercio electrónico con presupuesto de entrenamiento mínimo.
- Enrutado de intenciones en un pipeline mayor: la tasa de acierto de herramienta de 0,88 permite usar el modelo como clasificador de intención que decide entre consultar el guía, consultar la tabla o responder directamente, antes de llamar a sistemas internos de reservas.
- Evaluación de arquitecturas de agente con restricciones de memoria: útil como banco de pruebas académico para estudiar cómo se degrada el razonamiento multi-paso en modelos de 1,5B cuando se combinan tabla y cálculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo aporta métricas internas de evaluación antes y después del ajuste fino:

| Metrica (evaluacion interna del autor) | Antes | Despues |
|---|---|---|
| Identidad "Bihter/Begonvil" en la respuesta | 0,00 | 1,00 |
| Presencia de la marca "🌸" | 0,00 | 1,00 |
| JSON válido generado | 0,65 | 0,94 |
| Herramienta correcta seleccionada | 0,24 | 0,88 |
| Juez de RAG | 0,37 | 0,37 |

Adicionalmente, el autor reporta una media de 0,53 sobre un conjunto de 15 preguntas de prueba, y una caída del juez de RAG hasta 0,5 en preguntas que requieren combinar tabla y cálculo en varios pasos. La métrica de RAG no mejora con el ajuste fino, lo que sugiere que el ajuste afecta al formato y a la selección de herramienta, no a la calidad de la recuperación.

## Requisitos de hardware

- Inferencia en bf16/fp16: aproximadamente 3,1 GB solo de pesos; con caché KV, entre 4 y 6 GB de VRAM según longitud de contexto.
- Inferencia en 4 bits: aproximadamente 1 GB de pesos; viable en GPUs de 4 GB o incluso en CPU con llama.cpp.
- Inferencia en el formato usado por el autor (GGUF q8_0 en CPU): latencias de 10 a 60 segundos por respuesta, según la model card.
- GPU compatibles: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070) para fp16; T4 suficiente para entrenamiento QLoRA 4 bits en unas 3 horas.
- Entrenamiento: una única T4 con QLoRA 4 bits; un 7B no cabe en esa memoria y un 3B duplica tiempo de entrenamiento e inferencia según el autor.
- Opciones de despliegue: llama.cpp u Ollama para GGUF en CPU; vLLM o TGI con adaptadores PEFT para servir el modelo en GPU; el sistema completo requiere además Chroma con `mpnet-base-v2` para la recuperación vectorial y una capa que ejecute la herramienta `oda_bilgisi` sobre `odalar.csv`.
- Throughput estimado: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bihter-1.5B | 1,54B | No indicado en la model card (32.768 en el modelo base) | Turco | Apache-2.0 | Asistente de recepción hotelera con RAG y tool calling |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 (documentación del modelo base) | Multilingüe, incluido turco | Apache-2.0 | Modelo generalista de chat e instrucciones |
| Qwen2.5-3B-Instruct | 3B | 32.768 (documentación del modelo base) | Multilingüe, incluido turco | Apache-2.0 | Generalista con más capacidad de razonamiento, descartado por el autor por coste de entrenamiento e inferencia en CPU |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 (documentación de Meta) | Multilingüe | Licencia comunitaria de Llama | Generalista de borde; requiere verificación de su calidad en turco, no disponible en esta información |

La comparación relevante no es de rendimiento bruto sino de especialización: Bihter-1.5B sacrifica generalidad y multilingüismo a cambio de adherencia estricta a identidad, formato JSON y uso de herramientas en un dominio concreto. No se dispone de datos que permitan afirmar que supere al modelo base en tareas generales.

## Limitaciones y advertencias

- Modelo monolingüe: solo turco; no debe esperarse un comportamiento correcto en castellano ni en otros idiomas.
- Conocimiento cerrado: solo sabe lo que figura en el guía del hotel y en la tabla de habitaciones; fuera de ese ámbito responde que la información no está disponible y deriva a recepción.
- Riesgo de alucinación demostrado: el propio autor documenta que sin contexto RAG el modelo inventó cifras (por ejemplo, afirmó que el traslado al aeropuerto era gratuito y que había servicio de recarga para vehículos eléctricos sin ser cierto). El uso sin recuperación es desaconsejable.
- Calidad de recuperación dependiente del buscador: con TF-IDF la búsqueda se basa en coincidencia léxica y falla ante sinónimos ("konaklama" frente a "giriş-çıkış"); Chroma con `mpnet-base-v2` funciona mejor, pero la métrica de juez de RAG se mantiene en 0,37 en ambos escenarios.
- Razonamiento multi-paso frágil: en preguntas que exigen consultar la tabla y después calcular, el modelo puede omitir el segundo paso y la puntuación cae a 0,5. No es adecuado para cálculos de facturación o disponibilidad compleja sin validación externa.
- Rendimiento global modesto: media de 0,53 sobre las 15 preguntas de prueba del autor; no es un modelo apto para producción sin una capa de verificación y sin límites claros de alcance.
- Latencia alta en CPU: de 10 a 60 segundos por respuesta con GGUF q8_0, lo que puede ser inaceptable en atención al cliente en tiempo real sin una cola o un indicador de espera.
- Estilo con emoji obligatorio: la marca "🌸" está integrada en los pesos; si el producto final no la desea, será necesario un ajuste adicional o un postprocesado.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente; las métricas proceden únicamente del autor.
- Contexto máximo no documentado en la model card: conviene asumir el del modelo base y verificar empíricamente el comportamiento más allá de la ventana usada en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial y obras derivadas, pero el modelo se distribuye sin garantías y el cumplimiento de la licencia del modelo base debe verificarse por separado (también Apache-2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tilkis/Bihter-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/tilkis/bihter-begonvil-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo listados de sitios sin relación con el proyecto), por lo que no se incluyen enlaces adicionales a papers, blogs, repositorios o demos.
