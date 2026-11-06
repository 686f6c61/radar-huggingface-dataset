# Thox-ai/ThoxIOS-Open-4B

## Resumen

ThoxIOS-Open-4B es un paquete de configuración publicado por Thox-ai sobre los pesos originales de Qwen/Qwen3-4B. No se trata de un modelo entrenado ni afinado por THOX: el repositorio contiene únicamente el `Modelfile` de Ollama, un `manifest.json` de release y un pequeño knowledge pack en JSONL con ocho entradas públicas verificadas. El modelo ejecutable se distribuye a través de Ollama con la etiqueta `Thox-ai/thox-ios-open-4b` (2,50 GB, cuantización Q4_K_M) y reutiliza la capa base de Qwen3-4B fijada por digest.

El objetivo declarado es ofrecer una configuración de chat local con baja tasa de rechazo derivada del perfil de sistema (no de un fine-tune abliterado), orientada a inferencia en dispositivos móviles y entornos sin conexión. La arquitectura subyacente es la de Qwen3-4B, un transformer denso de 4 mil millones de parámetros con modo de razonamiento; THOX no aporta cambios en los pesos.

Su relevancia es limitada pero ilustrativa: documenta un patrón de empaquetado reproducible (base fijada + perfil + knowledge pack) sobre infraestructura existente, con métricas de evaluación medidas en CPU. Es un artefacto de configuración, no un modelo nuevo, y así lo declara explícitamente el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); empaquetado de configuración sobre Ollama |
| Parametros totales | 4B (pesos upstream de Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluación publicada); el máximo nativo de Qwen3-4B no se especifica en la información disponible |
| Tipos de cuantizacion | Q4_K_M (build servido en Ollama y objetivo del kit móvil GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF vía Ollama; el repositorio HF contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl`, no pesos |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo base es Qwen/Qwen3-4B, obtenido a través de la etiqueta Ollama `qwen3:4b` y fijado en tiempo de build al digest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`. La personalización consiste en un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con ocho entradas públicas verificadas para respuestas ancladas a contexto (retrieval-grounded).

El paquete publica tres ficheros con sus hashes SHA-256 parciales: `Modelfile` (659 B), `manifest.json` (422 B) y `thox-knowledge-v0.1.jsonl` (4.652 B). El digest del modelo publicado en Ollama es `a8790beb9bbe621b1e2f94d2027b45db86074db74c226c1f6084e3cd3af4a3b6`. No se documentan innovaciones técnicas propias más allá del esquema de empaquetado reproducible (base pinneada por digest + capa de perfil + knowledge pack versionado).

## Capacidades

- Generación de texto conversacional en inglés sobre la base Qwen3-4B.
- Razonamiento básico y respuesta a preguntas, con las limitaciones propias de un modelo de 4B.
- Respuestas ancladas al THOX Knowledge Pack v0.1 cuando se le suministra el pasaje correspondiente (8/8 temas respondidos con los hechos del pack en la evaluación del autor).
- Rechazo de premisas fabricadas: en la prueba de "trampa de topología fabricada" el modelo declinó confirmar la topología inventada.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), sin afirmar estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- Descubrimiento MeshStack y ejecución autorizada solo si se usa el runtime opcional de THOX; los pesos por sí solos no proporcionan enrutamiento ni acceso a malla.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales, de audio o de visión: no disponibles.

## Casos de uso

- Chat local en dispositivos Apple: el modelo está pensado para inferencia en móvil con GGUF Q4_K_M; se desplegaría vía Ollama en el dispositivo o en un host cercano para conversaciones sin conexión.
- Asistente de consulta sobre documentación propia: cargando el knowledge pack o pasajes recuperados por un RAG externo, el modelo responde con los hechos suministrados en lugar de inventar especificaciones, comportamiento validado en la evaluación del autor.
- Prototipado de configuraciones de sistema: útil como plantilla reproducible para equipos que quieran versionar perfiles de sistema y knowledge packs sobre un base model fijado por digest.
- Evaluación de pipelines de empaquetado: sirve para probar flujos de build con Ollama (`ollama create -f Modelfile`) y verificación de integridad mediante hashes y manifiesto.
- Despliegue en hardware modesto: con 3,89 GB de RAM en ejecución CPU (4 vCPU / 8 GB), encaja en entornos sin GPU para tareas de chat de baja concurrencia.
- Filtrado y respuestas de baja latencia en inglés: a 15–16 tokens/s en CPU, adecuado para respuestas cortas y asistentes de consulta puntual, no para generación extensa interactiva.
- Base para experimentos de moderación de rechazo vía prompt de sistema: permite comparar el comportamiento del mismo base model con y sin perfil de sistema, sin modificar pesos.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Generación de texto largo | 15,34 tokens/s | Bench de 1.024 tokens, CPU x86_64, 4 vCPU / 8 GB, contexto 8.192 |
| Respuestas cortas | 15,2–16,3 tokens/s | Conjunto de smoke tests |
| Huella de memoria en carga | 3,89 GB RAM, 0 GB VRAM | Ejecución en CPU |
| Smoke tests de fábrica | 3/3 respuestas coherentes y alineadas con el perfil | — |
| Grounding del Knowledge Pack v0.1 | 8/8 temas respondidos con los hechos del pack | Pasaje suministrado, una pregunta por tema |
| Trampa de topología fabricada | El modelo declinó confirmar la topología inventada | — |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como estado en vivo | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración medida (ejecución en CPU); para GPU, el build Q4_K_M de un modelo de 4B requiere aproximadamente 3–4 GB de VRAM, aunque no se aporta medición específica.
- RAM medida en carga: 3,89 GB en un host de 4 vCPU / 8 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con 6 GB o más de VRAM podría alojar el build Q4_K_M, pero no está verificado por el autor.
- Cabe en GPU consumer: previsiblemente sí (clase RTX 3060/4060 y superiores), sin dato medido.
- Despliegue: Ollama es el método soportado (`ollama run Thox-ai/thox-ios-open-4b` o build local con `Modelfile`). Otros runners (llama.cpp, vLLM, TGI) no se mencionan.
- Latencia y throughput: 15,34 tokens/s en generación larga y 15,2–16,3 tokens/s en respuestas cortas, medidos en CPU x86_64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / acceso | Notas |
|---|---|---|---|---|---|
| ThoxIOS-Open-4B | 4B | 8.192 (usado en evaluación) | Apache-2.0 | GGUF vía Ollama; repo HF con configuración | Configuración sobre Qwen3-4B, sin entrenamiento; solo inglés |
| Qwen/Qwen3-4B | 4B | No disponible en la información proporcionada | Apache-2.0 | Pesos safetensors y GGUF en HF | Base upstream; capacidades multilingües y de razonamiento propias del modelo original |
| Alternativas de 4B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo de 4B: razonamiento y recall materialmente limitados; el propio autor advierte de tratarlo en consecuencia.
- No es un fine-tune abliterado ni "uncensored": la baja tasa de rechazo proviene solo del perfil de sistema y el comportamiento de rechazo es el del modelo base.
- Conocimiento restringido al knowledge pack suministrado y a la recuperación externa; sin contexto debe decir que no lo sabe en lugar de inventar especificaciones de THOX.
- Solo inglés; sin soporte multilingüe declarado.
- Riesgo de alucinación inherente al modelo base, especialmente fuera del contexto suministrado.
- Acciones externas (MeshStack, ejecución) requieren autorización del runtime; los pesos por sí solos no dan acceso a malla ni enrutamiento.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran de THOX, sin términos adicionales especificados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Fechas de creación y actualización (2026-11-02) posteriores a la evaluación declarada (2026-11-01); conviene verificar la procedencia antes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxIOS-Open-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo en Ollama: `Thox-ai/thox-ios-open-4b` (referencia de ejecución citada en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
