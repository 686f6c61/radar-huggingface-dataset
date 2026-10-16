# vrajnotviraj/laya-intent-router-400m-onnx

## Resumen

Laya Intent Router 400M es un modelo de clasificación de intenciones zero-shot publicado por vrajnotviraj (Vraj Shah) como fine-tuning de `convaiinnovations/laya`, con 395 millones de parámetros y etiquetado como parte de la familia ModernBERT. Recibe un mensaje de usuario en inglés junto con una lista de intenciones escritas en lenguaje natural (frases de ejemplo, una descripción de una línea o simplemente un título de dos o tres palabras) y devuelve la intención asignada o la etiqueta especial `__none__` cuando el mensaje no encaja en ninguna.

Su rasgo diferencial es el despliegue exclusivo en CPU: se distribuye en formato ONNX con cuantización int8 y se ejecuta con `onnxruntime`, `tokenizers` y `numpy`, sin PyTorch ni GPU. El autor declara una latencia p95 de 120 a 170 ms sobre 4 hilos de CPU. El catálogo de intenciones se define en cada llamada, por lo que no requiere entrenamiento ni datos etiquetados por parte del usuario, y puede cambiar entre peticiones sin recompilar nada.

Es el hermano mayor de `laya-intent-router-150m-onnx`, con el que comparte el script de inferencia `laya_intent_router.py`, de modo que ambos son intercambiables cambiando solo el identificador del repositorio. Frente al modelo de 150M mejora la precisión cuando las intenciones son títulos cortos y en tráfico de banca, tarjetas, préstamos y seguros, a cambio de aproximadamente el doble de latencia y de un recall de fuera de alcance ligeramente inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia ModernBERT (fine-tuning de `convaiinnovations/laya`, motor de decisión no autorregresivo) |
| Parámetros totales | 395 millones (~400M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El autor indica que está diseñado para mensajes cortos de cliente en inglés |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX int8 (ejecutable con `onnxruntime`) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, descrito por sus autores como un motor de decisión no autorregresivo de "Sistema 1" que produce decisiones tipadas, puntuaciones y respuestas sí/no sobre cualquier texto en una sola pasada hacia delante, con un router que selecciona el checkpoint adecuado por petición. Las etiquetas del repositorio lo sitúan en la familia ModernBERT, por lo que se trata de un encoder transformer afinado para clasificación, no de un modelo generativo. Sobre esa base se ha realizado un fine-tuning específico para enrutado de intenciones con detección de fuera de alcance.

Los conjuntos de datos declarados en la model card son `clinc_oos`, `PolyAI/banking77`, `FastFit/hwu_64`, `benayas/snips`, `bitext/Bitext-customer-support-llm-chatbot-training-dataset`, `bitext/Bitext-retail-ecommerce-llm-chatbot-training-dataset` y `bitext/Bitext-retail-banking-llm-chatbot-training-dataset`. El número total de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF, DPO u otras técnicas de alineación no están disponibles en la información proporcionada. Tampoco se detalla el procedimiento de cuantización int8 ni si se aplicó decodificación especulativa o alguna variante de atención lineal.

La innovación funcional es la gestión explícita de la clase `__none__` para mensajes fuera de alcance, combinada con un umbral de decisión configurable (0,625 por defecto). El pipeline devuelve la intención con su puntuación y un vector de probabilidades que incluye `__none__`, lo que permite ajustar el compromiso entre cobertura y falsos positivos sin reentrenar.

## Capacidades

- Clasificación de intenciones zero-shot: el catálogo de intenciones se describe en cada llamada, no está fijado en los pesos.
- Detección de fuera de alcance: devuelve `match: None` cuando el mensaje no encaja en ninguna intención o cuando la mejor puntuación queda por debajo del umbral.
- Salida de probabilidades por intención más la clase `__none__`, además de la puntuación de la mejor coincidencia.
- Soporte de intenciones descritas como títulos de 2-3 palabras, frases de ejemplo o descripciones de una línea.
- Umbral de decisión ajustable por petición mediante el parámetro `threshold`.
- Ejecución en CPU con `onnxruntime`, `tokenizers` y `numpy`; no requiere PyTorch ni GPU.
- Interfaz de línea de comandos disponible (`python laya_intent_router.py "mensaje"`).
- Sin capacidades de generación de texto, razonamiento libre, código, matemáticas, visión ni audio.
- Sin soporte nativo de tool calling, function calling ni planificación multi-paso: es un componente de enrutado, no un agente.
- Multilingüe: no. Solo inglés, limitado a mensajes cortos de cliente.

## Casos de uso

- **Router semántico delante de un LLM**: en lugar de invocar un modelo generativo para decidir a qué flujo va un mensaje, se usa este clasificador para resolver la decisión en menos de 200 ms sobre CPU, reservando la llamada al LLM para la tarea final.
- **Triaje de atención al cliente en banca y seguros**: el modelo se ha evaluado específicamente con conjuntos de banca, tarjetas, préstamos, pagos, gestión de patrimonio y seguros, y clasifica consultas como bloqueo de tarjeta, consulta de saldo o transferencia sin datos etiquetados.
- **Detección de mensajes fuera de alcance con derivación a humano**: la clase `__none__` permite detectar cuándo una consulta no corresponde a ninguno de los flujos definidos y activar una respuesta de reserva, un operador humano o un LLM generalista.
- **Enrutado en asistentes de voz**: la latencia declarada de 120-170 ms p95 en 4 hilos de CPU encaja en presupuestos de respuesta conversacional, donde el enrutado debe resolverse antes de la síntesis de voz.
- **Clasificación de tickets y correos de soporte**: el catálogo de intenciones puede redefinirse por campaña, cliente o trimestre, lo que evita reentrenar el modelo cuando cambia la taxonomía de categorías.
- **Enrutado dinámico en editores de workflow**: el rendimiento declarado es especialmente alto (0,982 de precisión) con nodos cuyos títulos son de 2-3 palabras, un escenario habitual en herramientas de automatización donde las rutas se nombran de forma abreviada.
- **Guardarraíl de intención previo a agentes**: como paso previo a un agente con acceso a herramientas, el router puede descartar peticiones no soportadas antes de que lleguen a la capa de ejecución.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (`verified: false`) sobre conjuntos personalizados, no sobre benchmarks estándar. Umbral de decisión 0,625 en todos los casos.

| Métrica | Este modelo (400M) | Laya 150M (hermano) |
|---|---|---|
| Precisión de enrutado, 1.636 mensajes held-out | 0,966 | 0,949 |
| Recall de fuera de alcance | 0,967 | 0,986 |
| Precisión, 960 mensajes escritos después del entrenamiento | 0,959 | 0,915 |
| 18 nodos de workflow con títulos de 2-3 palabras (111 mensajes) | 0,982 | 0,865 |
| 15 nodos nuevos de banca, seguros y freight (106 mensajes) | 0,887 | 0,755 |

La suite de evaluación declarada abarca 10 configuraciones de enrutado (comercio electrónico, banca minorista, seguros, telecomunicaciones), un conjunto adversarial con casi duplicados, erratas, jerga y trampas del tipo "no canceles, solo dime dónde está", y dos conjuntos pequeños de nodos nuevos escritos después de cada decisión de diseño. También se menciona un conjunto de 16 industrias no relacionadas, pero no se publica su valor. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de clasificación en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no se requiere GPU ni VRAM dedicada.
- Descarga del repositorio: aproximadamente 710 MB (tamaño del repo en HuggingFace: 0,7 GB).
- Memoria RAM estimada: por debajo de 1 GB con pesos int8, aunque no se publica una cifra oficial.
- Latencia declarada: 120-170 ms p95 sobre 4 hilos de CPU.
- Throughput: no disponible; el autor no publica peticiones por segundo.
- Dependencias: `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub` para la descarga. No requiere `torch`.
- Opciones de despliegue: `onnxruntime` en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y tampoco se publica una variante MLX para este tamaño (la variante MLX de ~15-25 ms en Apple Silicon corresponde al modelo hermano de 150M).
- GPU recomendadas: no aplica, al no existir un camino de ejecución en GPU documentado para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de enrutado | Licencia | Formato |
|---|---|---|---|---|---|
| laya-intent-router-400m-onnx (este modelo) | 395M | No disponible | 0,966 en 1.636 mensajes held-out | Apache 2.0 | ONNX int8 |
| laya-intent-router-150m-onnx | ~150M | No disponible | 0,949 en el mismo conjunto | Apache 2.0 | ONNX int8 y MLX |
| convaiinnovations/laya (modelo base) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | No disponible |

El modelo base `convaiinnovations/laya` se presenta como un motor de decisión no autorregresivo multilíngüe (más de 100 idiomas) con un router que selecciona el checkpoint adecuado por petición; este fine-tuning restringe el ámbito al inglés y a mensajes cortos de cliente. Existen otras alternativas en la categoría de enrutado semántico (clasificadores BERT afinados, routers basados en embeddings y similitud coseno, o el propio LLM como clasificador), pero no se dispone de datos de benchmark comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa inglés. No hay soporte de otros idiomas, a pesar de que el modelo base se anuncia como multilíngüe.
- Diseñado para mensajes cortos de cliente; el autor advierte explícitamente de que no es un clasificador de texto general para documentos largos.
- No es un modelo generativo: no redacta respuestas, no razona y no ejecuta herramientas. Solo asigna una intención o `__none__`.
- Todos los resultados de benchmark están marcados como no verificados (`verified: false`) y proceden de conjuntos personalizados definidos por el propio autor, no de benchmarks estandarizados de terceros. Deben tomarse como orientativos.
- El modelo de 400M tiene un recall de fuera de alcance inferior al de 150M (0,967 frente a 0,986), por lo que introduce más falsos positivos de intención si el coste de derivar erróneamente a un flujo es alto.
- El umbral por defecto (0,625) debe recalibrarse para cada dominio y taxonomía; no se publican curvas de precisión-recall para otros umbrales.
- Riesgo de asignación errónea con alta confianza ante erratas, jerga o formulaciones ambiguas. El autor incluye un conjunto adversarial de casi duplicados y trampas de negación, lo que sugiere que este es un modo de fallo conocido.
- La calidad depende de cómo se redacten las intenciones: títulos de 2-3 palabras funcionan mejor que en el modelo de 150M, pero no se detalla el comportamiento con descripciones largas o catálogos de muchos cientos de intenciones.
- No hay información publicada sobre sesgos demográficos, geográficos o de dominio del modelo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías. No se imponen restricciones adicionales conocidas.
- El autor recomienda este modelo sobre el de 150M solo cuando se cumplen condiciones concretas (títulos cortos, tráfico de banca o seguros, presupuesto de latencia de aproximadamente el doble); para otros casos el hermano pequeño puede ser suficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vrajnotviraj/laya-intent-router-400m-onnx
- Modelo hermano de 150M: https://huggingface.co/vrajnotviraj/laya-intent-router-150m-onnx
- Repositorio GitHub del router: https://github.com/vrajnotviraj/laya-intent-router
- Perfil del autor en HuggingFace: https://huggingface.co/vrajnotviraj
- Modelo base convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Repositorio GitHub del proyecto Laya: https://github.com/NandhaKishorM/laya
- Sitio web de Laya AI: https://laya-ai.com/
