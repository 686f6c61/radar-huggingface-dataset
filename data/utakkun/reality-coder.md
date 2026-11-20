# Utakkun/reality-coder

## Resumen

reality-coder es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B-Instruct desarrollado por Utakkun para dar soporte al mod de Minecraft RealityCraft, en el que el jugador escribe un deseo en lenguaje natural y el modelo lo traduce a un script JavaScript ejecutable contra la Reality API del mod. El modelo no es un asistente general: está especializado en la tarea concreta de generar código válido para un sandbox de scripting dentro de Minecraft, con una salida estrictamente limitada a código crudo, sin markdown ni explicaciones.

Técnicamente se trata de un QLoRA (r=16) sobre la base Qwen2.5-Coder-7B-Instruct, con los adaptadores fusionados en los pesos y distribuido como GGUF en cuantización Q8_0. El entrenamiento se realizó sobre aproximadamente 6.600 pares validados de deseo → script, incluyendo deseos recogidos en sesiones reales de juego. El autor reporta un 100% de scripts válidos sobre deseos no vistos en el conjunto de retención.

Su relevancia es acotada pero clara: es un ejemplo de modelo pequeño y especializado (7B) que resuelve una tarea de generación de código de dominio muy estrecho con latencia baja (0,3–0,5 s por deseo en una RTX 5080) y despliegue trivial vía Ollama, que es precisamente el canal que usa el mod para descargar el modelo en el primer arranque. No está pensado para uso general fuera de este contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); no se detalla en la model card |
| Parámetros totales | 7B (heredado del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-Coder-7B-Instruct no se especifica en la información proporcionada) |
| Tipos de cuantización | Q8_0 (GGUF); no se documentan otras |
| Idiomas soportados | no disponible (los deseos de entrenamiento están en inglés, según los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0), distribuido para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino QLoRA con rango r=16, tras el cual los adaptadores se fusionaron en los pesos del modelo base para producir el artefacto final. Posteriormente se convirtió a GGUF en cuantización Q8_0, que es el formato publicado y el que consume el mod a través de Ollama.

El conjunto de entrenamiento consta de aproximadamente 6.600 pares validados de deseo → script, e incluye deseos reales recogidos durante pruebas de juego, lo que presumiblemente cubre formulaciones coloquiales y variaciones que no aparecerían en un dataset sintético. El autor no documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla ninguna innovación arquitectónica propia más allá del ajuste fino. La innovación relevante es de producto: el modelo fue entrenado con un system prompt fijo ("You are the Reality Engine for Minecraft. Output ONLY raw JavaScript matching the Reality API. No markdown, no explanations.") y produce exclusivamente código crudo, lo que elimina la necesidad de post-procesar la salida antes de pasarla al sandbox del mod.

## Capacidades

- Generación de scripts JavaScript para la Reality API del mod RealityCraft a partir de un deseo en lenguaje natural.
- Traducción de intenciones de juego a código ejecutable: transformación de bloques, borrado de chunks, efectos condicionales al abandono de una zona, etc.
- Salida en formato código crudo, sin markdown, sin bloques de código delimitados y sin explicaciones, ajustada al contrato de integración del mod.
- Manejo de formulaciones coloquiales e informales de deseos, gracias al entrenamiento con deseos reales de play-test.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles según la información proporcionada; los ejemplos de la model card están en inglés.

## Casos de uso

- Integración directa en RealityCraft: el mod descarga el modelo automáticamente en el primer arranque y lo invoca para convertir cada deseo del jugador en un script ejecutable en el sandbox. Es el caso de uso principal y para el que fue entrenado.
- Servidor de modding para Minecraft con scripting dinámico: un operador puede desplegar el modelo vía Ollama y exponerlo a una capa de validación propia que ejecute los scripts generados contra la Reality API, aprovechando la latencia de 0,3–0,5 s por deseo en una RTX 5080.
- Prototipado de mecánicas de juego: diseñadores pueden describir en lenguaje natural una regla ("cuando salgamos de un chunk, se borra") y obtener un script de referencia que luego revisan y adaptan manualmente.
- Generación de código de dominio restringido en entornos educativos: como ejemplo de pipeline deseo → código validado, útil para enseñar ajuste fino QLoRA, cuantización GGUF y despliegue con Ollama sobre una base de 7B.
- Evaluación de sandboxing y seguridad de código generado: el modelo produce JavaScript que se ejecuta en un entorno aislado, lo que permite estudiar validación de scripts generados por IA y límites de la API expuesta.
- Despliegue local en hardware de consumo: al ser un GGUF Q8_0 de 7B, puede servirse con Ollama en una estación de trabajo con GPU consumer, sin depender de APIs externas, lo que encaja con flujos de modding offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son operativos, no de benchmarks estándar: 100% de scripts válidos sobre deseos no vistos en el conjunto de retención y un tiempo de 0,3–0,5 s por deseo en una RTX 5080.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de 7B en Q8_0, el peso de los parámetros ronda los 7–8 GB, por lo que se necesita una GPU con al menos 8–10 GB de VRAM para acomodar pesos y contexto, aunque esta cifra es una estimación general y no un dato publicado por el autor.
- GPU recomendadas: el autor cita una RTX 5080 como referencia de rendimiento (0,3–0,5 s por deseo). No se documentan otras GPU.
- GPU consumer: por tamaño, un 7B en Q8_0 es viable en GPU consumer con 8 GB o más de VRAM; no se confirma qué modelos concretos ha probado el autor.
- Opciones de despliegue: Ollama, con el tag `hf.co/Utakkun/reality-coder:Q8_0`. El mod lo descarga automáticamente en el primer arranque. No se documentan otros runners (vLLM, llama.cpp directo, TGI).
- Latencia y throughput: 0,3–0,5 s por deseo en RTX 5080 según el autor; no se publica throughput agregado ni latencia en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reality-coder (Utakkun) | 7B | no disponible | Generación de scripts para RealityCraft (Minecraft) | Apache 2.0 | GGUF Q8_0 en Hugging Face, vía Ollama |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | no disponible en la información proporcionada | Generación de código general | Apache 2.0 | Pesos completos en Hugging Face |
| Alternativas de código de 7B (p. ej. CodeLlama-7B-Instruct, DeepSeek-Coder-6.7B-Instruct) | ~7B | no disponible en la información proporcionada | Generación de código general | licencias variables según modelo | Hugging Face |

La comparación relevante es con el modelo base: reality-coder hereda el tamaño y la licencia de Qwen2.5-Coder-7B-Instruct, pero sustituye la capacidad generalista por una especialización estrecha en la Reality API. Frente a otros modelos de código de 7B, la diferencia no está en parámetros ni en contexto, sino en el ajuste a un contrato de salida concreto (código crudo para un sandbox específico) y en el formato de distribución (GGUF Q8_0 listo para Ollama). No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas estándar.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para emitir únicamente scripts de la Reality API de RealityCraft; fuera de ese dominio su utilidad es dudosa y su comportamiento no está evaluado.
- Riesgo de alucinación en la API: puede generar llamadas a funciones o estructuras que no existan en la Reality API si el deseo se sale de la distribución de entrenamiento; el sandbox del mod es la barrera de seguridad, no el modelo.
- Idiomas: no se documenta soporte multilingüe; los ejemplos y el entrenamiento parecen centrados en inglés, por lo que los deseos en castellano podrían degradar la calidad de los scripts.
- Contexto: no se especifica la longitud de contexto efectiva del ajuste fino; los deseos son entradas cortas, así que no hay evidencia de buen comportamiento con prompts largos.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un ajuste fino sobre un dataset pequeño y de dominio cerrado, no hay garantías sobre comportamientos fuera de distribución.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar los términos del modelo base y del mod RealityCraft por separado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción más allá del propio mod.
- Producción: no hay benchmarks estándar, ni pruebas de robustez ante prompts adversarios, ni documentación de tasa de scripts inválidos fuera del conjunto de retención; el "100% válidos" es una métrica del autor sobre su propio conjunto de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Utakkun/reality-coder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Página del mod RealityCraft: https://ergunutkue-dev.github.io/reality-craft/
- Instalación vía Ollama: `ollama pull hf.co/Utakkun/reality-coder:Q8_0`
