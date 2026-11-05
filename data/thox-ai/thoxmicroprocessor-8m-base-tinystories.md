# Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories

## Resumen

ThoxMicroprocessor-8M-Base-TinyStories es un checkpoint de validación de arquitectura publicado por Thox-ai (THOX.ai) dentro de su línea de investigación de modelos pequeños entrenados desde cero. Se trata de un decoder transformer de 8.093.520 parámetros totales (5.472.080 no de embedding) con una filosofía de diseño que el autor denomina "attention-dominant", pensada para cargas de trabajo locales en dispositivos: enrutamiento, extracción estructurada, control de dispositivos y procesamiento de lenguaje compacto en el propio dispositivo.

El modelo no es un producto final: es una build de validación arquitectónica entrenada exclusivamente sobre TinyStories, un corpus sintético de cuentos infantiles simples. Por tanto, sus capacidades lingüísticas están limitadas a la distribución de ese corpus y no dispone de ninguna habilidad de enrutamiento, tool calling ni control de dispositivos, pese a que la arquitectura esté orientada a esos usos futuros.

Su relevancia actual es fundamentalmente investigadora: permite estudiar el comportamiento de una arquitectura con normalización QK RMS, normalización tipo sándwich y un mezclador Walsh-Hadamard por bloques, con un payload de pesos de 4,45 MB a INT4. Es un caso de estudio útil para quienes trabajan en modelos de borde, cuantización extrema y decodificación en hardware muy restringido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer "attention-dominant" (thox-microprocessor-v0.2) |
| Parámetros totales | 8.093.520 |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros no de embedding | 5.472.080 |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | INT4 (group size 64) y INT4 con embedding INT8, según evaluación del autor |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (datos de entrenamiento TinyStories bajo CDLA-Sharing-1.0, con implicaciones share-alike en revisión) |
| Formato de pesos | safetensors (model.safetensors, 32.400.144 B), más tokenizer y código de modelado propio |

Otros datos arquitectónicos: d_model de 320, 21 capas, 8 cabezas de atención y 2 cabezas KV (GQA), QK RMS normalization activada, sandwich normalization activada y blockwise Walsh-Hadamard mixer. Entrenado con 98,3M tokens de TinyStories.

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 21 capas con dimensión oculta de 320 y atención con 8 cabezas de query y 2 cabezas KV, lo que reduce el coste de caché KV frente a atención multi-cabeza completa. Incorpora dos decisiones de normalización destacables: QK RMS normalization, que estabiliza los productos query-key, y sandwich normalization, que normaliza antes y después de cada subcapa. Además incluye un mezclador Walsh-Hadamard por bloques, una transformación ortogonal de bajo coste computacional que actúa como mecanismo de mezcla de información entre tokens o canales.

El entrenamiento se realizó desde cero, sin modelo base externo, sobre 98,3M tokens del corpus TinyStories, un conjunto sintético de cuentos infantiles simples en inglés. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores. La implementación de referencia incluida en el repositorio (con `trust_remote_code=True`) recalcula el prefijo en cada paso de decodificación en lugar de mantener una caché KV, priorizando la portabilidad entre versiones de `transformers`; para decodificación con caché se indica el paquete `thox_microprocessor`.

## Capacidades

- Generación de texto en inglés dentro de la distribución de TinyStories: cuentos cortos y simples con vocabulario y estructuras sintácticas elementales.
- Razonamiento y conocimiento factual muy limitados: el modelo no ha visto corpus generalista ni datos de instrucciones.
- Sin soporte de tool calling ni function calling: el autor declara explícitamente que este checkpoint no tiene capacidad de enrutamiento ni de llamada a herramientas.
- Sin soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no, únicamente inglés.
- Sin modo thinking, visión ni audio.
- Capacidad de servir como banco de pruebas para validar la arquitectura, el tokenizador y el pipeline de cuantización INT4 del autor.

## Casos de uso

- Validación de arquitectura en investigación: reproduce el checkpoint para verificar que la implementación de QK RMS normalization, sandwich normalization y el mezclador Walsh-Hadamard se comporta como describe el autor, comparando la pérdida en validación (1,6956) con la reportada.
- Estudio de cuantización extrema: usar el modelo como caso de prueba para medir la degradación de pérdida al pasar a INT4 (+0,0366) y a INT4 con embedding INT8 (+0,0162), y extrapolar conclusiones a modelos mayores de la misma familia.
- Benchmark de pipelines de decodificación en dispositivos: comparar la implementación de referencia sin caché KV frente a la decodificación con caché del paquete `thox_microprocessor` en términos de latencia y consumo, dado el reducido tamaño del modelo.
- Generación de cuentos sintéticos de juguete: producir textos cortos y simples en inglés para pruebas de pipelines de generación, demostraciones educativas o datos sintéticos de baja complejidad, siempre asumiendo la distribución TinyStories.
- Pruebas de integración de `transformers` con código remoto: ejercitar el flujo `trust_remote_code=True`, la carga de tokenizador propio y la serialización safetensors en entornos de CI, sin coste de GPU.
- Docencia y divulgación: ilustrar el funcionamiento interno de un transformer decoder a escala mínima, inspeccionando pesos, normalizaciones y atención con 8M de parámetros.
- Prototipado de despliegue en hardware de borde: medir el peso real de los pesos (4,45 MB a INT4) y el consumo de memoria en placas con recursos muy limitados, teniendo en cuenta que el payload no incluye código, allocator, activaciones ni caché KV.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida en validación (held-out) | 1,6956 |
| Perplejidad en validación | 5,4499 |
| Tokens objetivo del split de validación | 2.095.104 |
| Coste de cuantización INT4 | +0,0366 de pérdida (4,45 MB) |
| Coste de cuantización INT4 + embedding INT8 | +0,0162 de pérdida (5,76 MB) |
| Resultado THOX GATE49 | No publicado para este modelo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (32,4 MB de safetensors) y en torno a 4,45 MB de payload de pesos a INT4; el consumo real de runtime debe añadir código, allocator, activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo está pensado para CPU y hardware de borde más que para GPU de datacenter. A100, H100 o RTX 4090 no aportan ventaja práctica por el reducido tamaño.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y en placas tipo Raspberry Pi o microcontroladores con suficiente RAM, siempre que se mida el runtime completo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (implementación de referencia sin caché KV) y el paquete `thox_microprocessor` para decodificación con caché. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ThoxMicroprocessor-8M-Base-TinyStories | 8,09M | 1024 | Inglés | Apache-2.0 | Checkpoint de validación arquitectónica, solo TinyStories |
| TinyStories-1M (Microsoft, referencia) | ~1M | 512-1024 | Inglés | MIT (según variante) | Modelo de referencia del corpus TinyStories, orientado a generación de cuentos |
| TinyStories-33M (Microsoft, referencia) | ~33M | 512-1024 | Inglés | MIT (según variante) | Variante mayor del mismo corpus, mayor coherencia narrativa |
| SmolLM-135M | 135M | 2048 | Inglés | Apache-2.0 | Modelo pequeño generalista con datos web, apto para tareas más amplias |

La comparación con alternativas es aproximada: no se dispone de resultados de benchmarks comunes en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo de Thox es el de menor tamaño de la tabla y el único entrenado desde cero con la arquitectura propietaria del autor.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories: cualquier salida fuera de esa distribución (preguntas factuales, código, matemáticas, instrucciones) carece de sentido.
- No dispone de capacidad de enrutamiento, tool calling ni control de dispositivos, pese a que la arquitectura esté orientada a esos usos en versiones futuras.
- Riesgo alto de alucinación y de respuestas confiadas pero incorrectas, incluso dentro de la distribución de cuentos.
- Solo inglés; no hay soporte multilingüe.
- Contexto limitado a 1024 tokens.
- La cuantización INT4 degrada la pérdida en +0,0366; debe evaluarse el impacto en la tarea concreta antes de usarla en producción.
- La licencia del repositorio es Apache-2.0, pero los datos de entrenamiento (TinyStories) están bajo CDLA-Sharing-1.0 y el propio autor indica que las implicaciones share-alike están en revisión, lo que introduce incertidumbre sobre el uso comercial de los pesos derivados.
- No apto para decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana.
- La implementación de referencia no mantiene caché KV, lo que penaliza la latencia en generaciones largas; para uso real debe emplearse el paquete `thox_microprocessor`.

## Enlaces

- [HuggingFace: Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories](https://huggingface.co/Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories)
- [TinyStories (paper y corpus de referencia)](https://huggingface.co/datasets/roneneldan/TinyStories)
- [THOX.ai](https://thox.ai)
