# tetranigga/TetraNigga-TRIS-10M-GGUF

## Resumen

TetraNigga-TRIS-10M es un modelo de generación de texto experimental publicado por el usuario tetranigga en Hugging Face. Se trata de un modelo entrenado desde cero (from scratch) y afinado para conversación, con un total de 9.966.848 parámetros (aproximadamente 10 millones), lo que lo sitúa en la categoría de modelos ultra pequeños, muy por debajo de los modelos habituales de propósito general. La única distribución disponible es en formato GGUF F16 bajo arquitectura Llama, empaquetada para su uso con llama.cpp.

El modelo se presenta como "third fastest ai ever" en su model card, una afirmación de marketing sin respaldo técnico verificable en la información disponible. Emplea un formato de conversación personalizado basado en SentencePiece componente a componente, lo que implica que para un prompting de chat fiable es necesario usar el tokenizer incluido y un adaptador Python específico junto con la API `/completion` de llama.cpp. No se documentan detalles sobre el dataset de entrenamiento, el proceso de alineación ni resultados de evaluación.

Su relevancia es limitada en el panorama actual: se trata de una publicación experimental sin descargas ni interacciones, con licencia no especificada y únicamente en inglés. Resulta útil como caso de estudio de modelos mínimos entrenados desde cero y para experimentación con llama.cpp, pero no como opción para aplicaciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según model card) |
| Parametros totales | 9.966.848 (~10 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (único formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

La model card indica que el modelo usa la arquitectura Llama y que fue entrenado desde cero y posteriormente afinado para conversaciones. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otro tipo de alineación, ni el número de tokens vistos durante el preentrenamiento.

La innovación técnica declarada es un formato de conversación personalizado basado en SentencePiece "component-wise", que requiere el tokenizer incluido y un adaptador Python para funcionar de forma fiable con la API `/completion` de llama.cpp. No se detallan mecanismos como decodificación especulativa, atención lineal ni otras optimizaciones. Con ~10 M de parámetros, la capacidad de almacenar conocimiento factual es estructuralmente muy reducida en comparación con modelos de miles de millones de parámetros.

## Capacidades

- Generación de texto conversacional en inglés, según la model card.
- Afinado específico para diálogo multi-turno (con el formato de conversación propietario).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp mediante la API `/completion`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio, modo thinking ni matemáticas/código especializados.

## Casos de uso

- Experimentación educativa con modelos entrenados desde cero: sirve para estudiar el comportamiento de un transformer de ~10 M de parámetros y comparar curvas de aprendizaje en entornos controlados.
- Pruebas de integración con llama.cpp: útil para validar pipelines de carga de GGUF, tokenizers personalizados y la API `/completion` antes de desplegar modelos mayores.
- Prototipado de interfaces de chat: permite montar un chatbot mínimo en local para probar flujos de UI sin coste de GPU, asumiendo respuestas de baja calidad.
- Benchmarking de infraestructura: al ser un modelo mínimo en F16, puede usarse como carga sintética para medir latencia base de llama.cpp en hardware muy limitado (CPU, Raspberry Pi, dispositivos embebidos).
- Investigación sobre formatos de conversación: el esquema SentencePiece componente a componente puede analizarse como caso de diseño de plantillas de chat no estándar.
- Docencia sobre limitaciones de escala: ejemplifica de forma práctica por qué los modelos de ~10 M de parámetros no retienen conocimiento factual ni mantienen coherencia en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (los pesos ocupan aproximadamente 20 MB; el resto es overhead de contexto y runtime). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU sin problema.
- Cabe en consumer GPU: sí, en cualquier GPU (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en dispositivos de placa única.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación del GGUF), endpoints compatibles según el tag de Hugging Face. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles de forma publicada; por el tamaño, la latencia será muy baja en cualquier hardware, pero la calidad de salida es la limitación real, no el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TetraNigga-TRIS-10M | ~10 M | no disponible | no disponible | GGUF F16 | Hugging Face (0 descargas) |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Amplia, muy usado |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Amplia, mantenido por Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia, ecosistema maduro |

Los tres modelos de referencia superan en uno o dos órdenes de magnitud el número de parámetros, documentan contexto, licencia y benchmarks, y cuentan con adopción real. TetraNigga-TRIS-10M no ofrece datos comparables en ninguna de esas dimensiones.

## Limitaciones y advertencias

- Con ~10 M de parámetros, la capacidad de conocimiento factual y de razonamiento es estructuralmente muy limitada; se esperan respuestas incoherentes o genéricas en la mayoría de consultas.
- Riesgo elevado de alucinación y de deriva conversacional en diálogos multi-turno.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso en producción.
- El formato de conversación es propietario y requiere tokenizer y adaptador Python específicos; no es compatible directamente con plantillas de chat estándar de llama.cpp sin ese adaptador.
- No se documentan sesgos, dataset de entrenamiento ni proceso de filtrado; no es posible evaluar riesgos de contenido.
- Sin descargas ni interacciones en Hugging Face: no hay evidencia de validación por parte de la comunidad.
- La afirmación "third fastest ai ever" no está respaldada por benchmarks publicados y no debe tomarse como métrica técnica.
- No apto para producción: sin benchmarks, sin licencia clara y sin garantías de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/tetranigga/TetraNigga-TRIS-10M-GGUF
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
