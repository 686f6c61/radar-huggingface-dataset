# VADRK155/Cortex-1-Chat

## Resumen

Cortex 1 Chat es un modelo de lenguaje conversacional de 130 millones de parámetros publicado en HuggingFace por el usuario VADRK155. Se trata de un GPT decoder-only entrenado completamente desde cero ("from scratch"), con una implementación propia en PyTorch que no utiliza la librería `transformers` en ningún punto del pipeline. El modelo se distribuye en fp16, con un tamaño de repositorio de 0,5 GB y licencia MIT.

Su propósito declarado es la generación de texto conversacional en inglés. La limitación más relevante es su ventana de contexto: solo 128 tokens, lo que implica que el modelo pierde rápidamente el hilo de cualquier conversación multi-turno. El propio autor advierte en la model card de que, por su reducido número de parámetros, puede perder coherencia, mezclar hechos o cortar frases a mitad.

El interés de este modelo es fundamentalmente didáctico y experimental: sirve como ejemplo de arquitectura transformer implementada a mano, como baseline de muy bajo coste computacional y como banco de pruebas para pipelines de fine-tuning. No se han publicado resultados de benchmarks, y el repositorio no tiene descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, implementación propia en PyTorch (sin `transformers`) |
| Parametros totales | 130 millones |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | MIT |
| Formato de pesos | fp16 (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 130 millones de parámetros, implementado desde cero en PyTorch con una arquitectura personalizada. No se emplearon pesos preentrenados de ningún tipo: el entrenamiento partió de inicialización aleatoria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre optimizador, régimen de entrenamiento o hardware utilizado.

Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal, mezcla de expertos o arquitecturas híbridas. La única particularidad reseñable es la implementación manual de la pila transformer, que la model card presenta explícitamente como característica distintiva del proyecto. No hay información disponible sobre el tokenizador empleado.

## Capacidades

- Generación de texto en inglés con formato conversacional.
- Mantenimiento de diálogo multi-turno, severamente limitado por la ventana de 128 tokens.
- Ejecución mediante script propio `chat.py` incluido en el repositorio (requiere instalar dependencias con `pip install -r requirements.txt`).
- Entrenamiento e inferencia sin dependencia de la librería `transformers`, lo que simplifica el estudio del código de la arquitectura.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Docencia de arquitecturas transformer: al ser una implementación propia en PyTorch sin `transformers`, permite a estudiantes e investigadores inspeccionar capa por capa cómo se construye y entrena un GPT desde cero, incluyendo el bucle de entrenamiento.
- Baseline de referencia en experimentos: sirve como punto de comparación de bajo coste (130M parámetros) frente a modelos preentrenados mayores cuando se evalúa el efecto del preentrenamiento a gran escala.
- Prototipado rápido en local sin GPU: con pesos fp16 de aproximadamente 260 MB, el modelo puede cargarse y ejecutarse en CPU en cuestión de segundos, lo que lo hace útil para probar pipelines de inferencia antes de escalar a modelos mayores.
- Banco de pruebas para fine-tuning: dado su tamaño reducido y su licencia MIT, es viable reentrenarlo o ajustarlo en un único GPU de consumidor para experimentar con datasets conversacionales pequeños en inglés.
- Pruebas de integración y CI de infraestructura de serving: permite validar endpoints, plantillas de prompt, gestión de sesiones y logs en un entorno controlado antes de desplegar modelos de producción mucho más costosos.
- Generación de respuestas cortas de una sola intervención: tareas de autocompletado o respuesta breve (por debajo de 128 tokens) en inglés donde no se requiera coherencia conversacional prolongada.
- Demostraciones embebidas en hardware limitado: su huella de memoria permite integrarlo en dispositivos con pocos recursos (por ejemplo, una Raspberry Pi) para demostraciones de inferencia local sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,6 GB en fp16 (130M parámetros × 2 bytes ≈ 260 MB de pesos, más activaciones y overhead del runtime). En fp32 se situaría en torno a 0,6-1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No requiere A100, H100 ni tarjetas de gama alta; una GTX 1050, GTX 1650 o integrada reciente es más que suficiente.
- Cabe en GPU de consumidor: sí, en prácticamente cualquier GPU dedicada lanzada en la última década, e incluso en iGPU.
- Ejecución en CPU: viable y probablemente el escenario principal, dado el tamaño del modelo y el script `chat.py` proporcionado por el autor.
- Opciones de despliegue: el repositorio incluye un script propio (`python chat.py`). No hay evidencia de compatibilidad con vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura es una implementación personalizada fuera de `transformers` y no se publican pesos en GGUF. La conversión a GGUF requeriría escribir el mapeo de arquitectura correspondiente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cortex 1 Chat | 130M | 128 tokens | MIT | HuggingFace, 0 descargas | Implementación propia sin `transformers`; sin benchmarks publicados |
| GPT-2 (small) | 124M | 1024 tokens | Modified MIT | HuggingFace, ampliamente desplegado | Preentrenado en WebText; ecosistema y tooling maduros |
| Pythia-160M | 160M | 2048 tokens | Apache 2.0 | HuggingFace / EleutherAI | Suite de modelos de estudio con checkpoints intermedios publicados |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | HuggingFace | Un orden de magnitud más grande; requiere más VRAM |

La comparación se basa en características públicamente conocidas de esos modelos; no se dispone de resultados de benchmarks de Cortex 1 Chat que permitan contrastar calidad de generación.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens: el modelo olvida partes anteriores de la conversación muy rápidamente, lo que invalida cualquier uso que requiera memoria conversacional real.
- Coherencia limitada: el propio autor advierte de que puede perder el hilo, mezclar hechos o cortar frases a mitad, comportamiento esperable a ese número de parámetros.
- Riesgo elevado de alucinación: sin datos de entrenamiento documentados ni alineación conocida, no hay garantía de veracidad factual.
- Idiomas: solo inglés. No hay soporte documentado de castellano ni de otras lenguas.
- Sesgos conocidos: no disponible. Al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, ideología o cualquier otro tipo.
- Ausencia de benchmarks: no existen métricas publicadas (MMLU, HumanEval, GSM8K u otras) que permitan estimar su calidad objetiva.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías de ningún tipo sobre el rendimiento o la idoneidad del modelo.
- Madurez del proyecto: 0 descargas y fecha de creación y actualización muy próximas (19 de septiembre de 2026), lo que indica un repositorio sin validación por parte de la comunidad.
- No apto para producción: carece de tool calling, agentes, cuantizaciones optimizadas y soporte en frameworks de serving estándar.
- No se documentan el tokenizador, la longitud de entrenamiento ni el dataset, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VADRK155/Cortex-1-Chat
- Búsqueda web realizada: no se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo. Los resultados devueltos corresponden a portadas de Google News en distintos idiomas y no guardan relación con el modelo.
