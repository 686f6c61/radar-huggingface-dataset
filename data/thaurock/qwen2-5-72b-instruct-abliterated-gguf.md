# Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF

## Resumen

Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF es la colección de cuantizaciones en formato GGUF del modelo Qwen2.5-72B-Instruct-abliterated, una versión del Qwen2.5-72B-Instruct de Alibaba a la que se le han aplicado técnicas de *abliteration* para eliminar los mecanismos de rechazo y censura alineados. El modelo original es un transformer denso de 72.706.203.648 parámetros (aproximadamente 72,7 mil millones), desarrollado por el equipo Qwen, y la variante abliterated fue producida por huihui-ai. Thaurock se limita a empaquetar y publicar las cuantizaciones GGUF derivadas.

El interés de esta ficha reside en dos capas: por un lado, las capacidades del Qwen2.5-72B-Instruct original (razonamiento, código, matemáticas, contexto largo y soporte multilingüe); por otro, la modificación abliterated, que elimina las negativas del modelo a responder determinados prompts. El repositorio ofrece once variantes de cuantización, desde F16 (~145,4 GB) hasta Q2_K (~29,8 GB), lo que permite ejecutar un modelo de 72B en hardware local de gama alta mediante llama.cpp, Ollama, LM Studio o Text-Generation-WebUI.

La relevancia actual es doble: el modelo base es una referencia consolidada para tareas de razonamiento de alta calidad en abierto, y el formato GGUF facilita su despliegue en entornos sin infraestructura de servidores GPU dedicados. La licencia Apache 2.0 del modelo original se mantiene en esta redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parámetros totales | 72.706.203.648 (~72,7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-72B-Instruct soporta 131.072 tokens según su especificación original) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-72B-Instruct: un transformer denso decoder-only con atención por grupos (GQA) y las mejoras introducidas en la familia Qwen2.5 respecto a Qwen2. El entrenamiento original incluyó preentrenamiento sobre un corpus multilingüe de gran escala y un proceso de ajuste supervisado más optimización por preferencias (RLHF/DPO) para alineamiento conversacional, según la documentación pública del modelo base. La información proporcionada no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación abliterated, realizada por huihui-ai, aplica técnicas de edición de pesos orientadas a eliminar la dirección de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ante ciertas categorías de prompts. Según la model card, esta intervención busca preservar las capacidades lógicas y de codificación del original. Thaurock no aporta información sobre el método exacto de abliteration ni sobre posibles evaluaciones de degradación. Las cuantizaciones GGUF se generan con las herramientas estándar de llama.cpp y emplean cuantización mixta en las variantes K (por ejemplo, Q5_K_M combina 5 y 6 bits según el tensor).

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat instructivo del modelo base.
- Razonamiento lógico y resolución de problemas de varios pasos.
- Generación y explicación de código en múltiples lenguajes de programación.
- Matemáticas y cálculo simbólico a nivel de modelo de 72B.
- Capacidades multilingües heredadas de Qwen2.5 (la información disponible no detalla la lista de idiomas).
- Respuesta sin rechazos ante prompts que el modelo original declinaría, gracias a la abliteration.
- Soporte de tool calling y function calling heredado del formato instructivo de Qwen2.5 (no verificado en esta variante concreta).
- Compatibilidad con pipelines de text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documentan capacidades de visión ni audio en esta variante.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM de 72B sin capas de rechazo, comparando respuestas con el original para analizar qué información se filtraba y cómo se distribuye la negativa en el espacio de activaciones.
- Generación de ficción y narrativa sin restricciones temáticas: útil para autores que necesitan explorar tramas oscuras, violencia o contenido adulto en un entorno local controlado, con la cuantización Q5_K_M como compromiso entre calidad y requisitos de memoria.
- Red teaming y evaluación de robustez: sirve como modelo "sin filtros" de referencia para medir la eficacia de clasificadores de seguridad externos o de sistemas de moderación desplegados en producción.
- Asistencia técnica y de código en local: con Q4_K_M (~47,4 GB) puede ejecutarse en estaciones de trabajo con dos GPU de 24 GB o una GPU de 48 GB, ofreciendo generación de código y explicaciones sin depender de APIs externas.
- Procesamiento de documentación técnica extensa: el contexto largo del modelo base (131.072 tokens según su especificación original) permite analizar manuales, repositorios o contratos completos en una sola pasada, siempre que la VRAM disponible lo permita.
- Despliegue en entornos aislados y air-gapped: al ser GGUF y Apache 2.0, puede ejecutarse con llama.cpp u Ollama en infraestructura sin conexión, útil para organizaciones con requisitos estrictos de soberanía de datos.
- Experimentación con cuantizaciones extremas: las variantes Q3 y Q2 permiten estudiar la degradación de un modelo de 72B en configuraciones de memoria muy limitadas, documentando los modos de fallo típicos (bucles, incoherencias lógicas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo original o con otras variantes abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto, orientativo): F16 ~150 GB, Q8_0 ~80 GB, Q6_K ~67 GB, Q5_K_M ~57 GB, Q4_K_M ~50 GB, Q3_K_M ~40 GB, Q2_K ~32 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q8_0 y Q6_K; dos A100 40 GB o una A100 80 GB para Q5_K_M y Q4_K_M; configuraciones multi-GPU de 24 GB (RTX 4090, RTX 3090) para Q4_K_S y Q3_K_L mediante offloading parcial.
- En GPU de consumo: Q4_K_M y Q4_K_S pueden ejecutarse en dos RTX 4090 (48 GB combinados) con contexto moderado; Q3_K_M y Q2_K caben en una sola RTX 4090 de 24 GB solo con offloading a RAM del sistema, lo que reduce drásticamente el throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Text-Generation-WebUI, y servidores compatibles con la API de text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo denso de 72B en Q4_K_M sobre dos GPU de 24 GB suele situarse en el rango de decenas de tokens por segundo, pero no se aportan mediciones verificadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF | 72,7B | No disponible (base: 131.072) | Apache 2.0 | GGUF | Variante abliterated, sin benchmarks publicados |
| huihui-ai/Qwen2.5-72B-Instruct-abliterated | 72,7B | No disponible (base: 131.072) | Apache 2.0 | safetensors | Modelo base de esta cuantización, sin cuantizar |
| Qwen/Qwen2.5-72B-Instruct | 72,7B | 131.072 | Apache 2.0 (verificar en el repo oficial) | safetensors, GGUF | Modelo original alineado, con benchmarks publicados por el equipo Qwen |
| Llama-3.3-70B-Instruct | ~70B | 128.000 | Llama 3.3 Community License | safetensors, GGUF | Alternativa de tamaño similar, licencia con restricciones de uso |

## Limitaciones y advertencias

- La abliteration elimina los rechazos del modelo, pero no garantiza que las respuestas sean correctas; puede aumentar la probabilidad de contenido dañino, ilegal o sexualmente explícito.
- Riesgo de alucinación inherente a los LLM de 72B, no mitigado por la abliteration y potencialmente agravado en las cuantizaciones de 3 y 2 bits.
- Las cuantizaciones Q3_K_S, Q3_K_M, Q3_K_L y especialmente Q2_K presentan degradación notable de coherencia lógica y bucles de texto, según advierte la propia model card.
- No hay información sobre sesgos específicos de esta variante; los sesgos del modelo base Qwen2.5-72B-Instruct se heredan y pueden verse alterados por la edición de pesos.
- La lista de idiomas soportados no está documentada en el repositorio; no se puede confirmar el rendimiento multilingüe de esta variante concreta.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros exige revisión legal y de cumplimiento normativo (por ejemplo, Reglamento de IA de la UE) antes de exponerlo a usuarios finales.
- El tamaño del repositorio (625,7 GB) implica descargas muy largas; se recomienda verificar la integridad con el archivo `SHA256SUMS.txt` incluido.
- No se proporcionan evaluaciones de seguridad ni de calidad para esta variante; cualquier uso en producción debe acompañarse de una batería de pruebas propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Qwen2.5-72B-Instruct-abliterated
- Modelo original Qwen2.5-72B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Perfil del cuantizador: https://huggingface.co/Thaurock
- Perfil del autor de la abliteration: https://huggingface.co/huihui-ai
- llama.cpp (herramienta de inferencia GGUF): https://github.com/ggerganov/llama.cpp
