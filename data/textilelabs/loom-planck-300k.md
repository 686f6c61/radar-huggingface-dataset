# textilelabs/Loom-Planck-300k

## Resumen

Loom Planck 300K es un modelo de lenguaje neuronal de escala extrema desarrollado por Textile Labs, con tan solo 313.920 parámetros totales. Forma parte de la familia Loom, una serie de modelos construidos desde cero (from-scratch) que exploran el límite inferior de tamaño en el que un modelo puede mantener un comportamiento conversacional mínimamente reconocible. Emplea la disposición arquitectónica de Gemma-3 (8 capas, dimensión de 64, contexto de 2.048 tokens) y se distribuye tanto en safetensors como en GGUF, lo que permite ejecutarlo en aplicaciones móviles como Ollama, PocketPal, LM Studio, Jan o llama.cpp.

El modelo se entrenó desde cero en dos GPU T4 de Kaggle en unos 5 minutos, lo que subraya su carácter experimental y de bajo coste. No pretende competir con asistentes convencionales: su propósito es servir como banco de pruebas para investigar hasta qué punto un modelo tan pequeño puede conservar habilidades como declinar preguntas sobre hechos desconocidos, emitir llamadas a herramientas (calculadora, fecha, búsqueda) o mantener un chat breve. Es relevante ahora porque ejemplifica la frontera actual de los "small language models" orientados a dispositivos y porque publica resultados medidos en una batería de pruebas propia, lo que facilita la comparación con otros modelos de la misma familia.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio de HuggingFace; los datos de benchmarks proceden de la propia evaluación del autor y deben interpretarse como mediciones internas, no como comparaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con disposición Gemma-3 (8 capas × 64 dimensiones) |
| Parámetros totales | 313.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | Q4_K_M, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la disposición de Gemma-3 en una configuración mínima: 8 capas con dimensión oculta de 64, lo que da lugar a los 313.920 parámetros totales. No se trata de un modelo destilado ni de un recorte de un modelo mayor, sino de un entrenamiento desde cero realizado por Textile Labs sobre dos GPU T4 de Kaggle en aproximadamente 5 minutos. La model card menciona el uso de Muon como optimizador (etiqueta `muon`), aunque no detalla la composición exacta del corpus de entrenamiento ni el número de tokens utilizados.

No se documentan fases de RLHF, DPO ni ajuste por preferencias. El modelo incorpora un formato de conversación propio con marcadores como `<tools:on>`, `<tools:off>`, `<user>`, `<loom>` y `<|eot|>`, y está diseñado para emitir llamadas a herramientas en dominios concretos (calculadora, fecha, búsqueda). La model card indica que los prompts de la batería de evaluación fueron eliminados del conjunto de entrenamiento, lo que sugiere una preparación deliberada de los datos para evitar contaminación en las pruebas publicadas.

## Capacidades

- Generación de texto conversacional breve: respuestas de una o dos frases cortas.
- Declinación de preguntas sobre hechos que no puede conocer, especialmente con las herramientas desactivadas (`<tools:off>`).
- Emisión de llamadas a herramientas: calculadora, fecha y búsqueda, en un formato estructurado.
- Identificación de sí mismo ("who are you") dentro de los límites del modelo.
- Chat cotidiano de baja complejidad.
- Resistencia parcial a instrucciones ocultas en pasajes (evaluada en 5/10 en f16).
- Ejecución en aplicaciones móviles mediante GGUF (Ollama, PocketPal, LM Studio, Jan, llama.cpp).
- No soporta visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Pruebas de concepto en dispositivos móviles**: sirve para validar pipelines de inferencia on-device con GGUF antes de escalar a modelos mayores de la familia Loom; su tamaño de 288 KB en Q4_K_M permite incluirlo en aplicaciones móviles sin impacto apreciable en el binario.
- **Investigación sobre el límite inferior de tamaño**: útil como punto de referencia en estudios que midan qué habilidades sobreviven al reducir parámetros; su batería de 133 prompts y sus 275 tests held-out ofrecen una línea base reproducible.
- **Evaluación de harnesses de agentes**: permite probar el formato de tool calling (`<tools:on>` / `<tools:off>`) y la lógica de parseo de llamadas en un entorno controlado y de coste casi nulo.
- **Docencia y divulgación**: adecuado para explicar la arquitectura transformer y el ciclo de entrenamiento desde cero, ya que el modelo entero se entrena en minutos sobre hardware de consumo (dos T4).
- **Prototipado de políticas de declinación**: su habilidad más sólida (20/20 al declinar hechos desconocidos con herramientas desactivadas) lo hace útil para experimentar con patrones de "no lo sé" antes de trasladarlos a modelos mayores.
- **Pruebas de robustez frente a inyección de instrucciones**: con 5/10 en ignorar instrucciones ocultas en un pasaje, sirve como caso extremo para calibrar defenses en pipelines de lectura de documentos.
- **Generación de llamadas a calculadora en demos**: aunque solo acierta aproximadamente un tercio de las veces, permite ilustrar el flujo completo de tool calling en talleres y tutoriales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 275 tests held-out, comparando con Swift Mini 2 (2,0M) y Swift Micro 2 (1,17M):

| Tarea | Planck 300K (f16) | Q8_0 | Q4_K_M | Swift Mini 2 (2,0M) | Swift Micro 2 (1,17M) |
|---|---:|---:|---:|---:|---:|
| Declina hecho desconocido (tools off) | 20/20 | 20/20 | 19/20 | 13/20 | 18/20 |
| Llamada a calculadora correcta | 14/40 | 14/40 | 15/40 | 24/40 | 13/40 |
| Aritmética de fechas | 1/10 | 1/10 | 2/10 | 8/10 | 3/10 |
| Etiquetado (tema/idioma/sentimiento/tóxico/ruta) | 21/60 | 22/60 | 20/60 | 44/60 | 28/60 |
| Chat cotidiano | 9/15 | 9/15 | 8/15 | 11/15 | 11/15 |
| Lectura de hecho plantado en resultado de búsqueda | 1/60 | 1/60 | 5/60 | 7/60 | 4/60 |
| Ignorar instrucción oculta en pasaje | 5/10 | 4/10 | 3/10 | 1/10 | 4/10 |
| Extracción tipada (nombre/fecha/importe/lugar) | 1/30 | 0/30 | 0/30 | 13/30 | 0/30 |
| Redacción, coincidencia exacta | 0/30 | 0/30 | 0/30 | 0/30 | 0/30 |
| Dice "(sure)" y acierta | 19% | 18% | 20% | 49% | 22% |

Batería de aceptación Loom (133 prompts, vía Ollama): 104/133 en Q8_0 y 100/133 en Q4_K_M. Como referencia, Swift Mini 2 obtiene 120, Swift Micro 2 obtiene 110 y los Swift originales 110.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 MB en cualquier cuantización; el modelo completo en f16 ocupa 651 KB y en Q4_K_M 288 KB.
- **GPU recomendadas**: cualquier GPU con soporte para llama.cpp o transformers; no requiere acelerador dedicado. Se entrenó en dos NVIDIA T4.
- **GPU de consumo**: cabe holgadamente en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en CPU y en dispositivos móviles.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, Jan, PocketPal, transformers, text-generation-inference (según etiquetas del repo).
- **Latencia y throughput**: no disponibles en la información proporcionada; dado el tamaño, se espera latencia de milisegundos en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Batería /133 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Loom Planck 300K | 0,31M | 2.048 | 104 (Q8_0) | MIT | HuggingFace, GGUF |
| Loom Planck 600K | 0,59M | no disponible | 112 | MIT | HuggingFace |
| Loom Planck 1.2M | 1,19M | no disponible | 105 | MIT | HuggingFace |
| Loom Swift Micro 2 | 1,17M | no disponible | 110 | no disponible | HuggingFace |
| Loom Swift Mini 2 | 2,0M | no disponible | 120 | no disponible | HuggingFace |

Dentro de la propia familia Loom, Planck 300K es el miembro más pequeño y el que peor rinde en la mayoría de tareas, salvo en declinación de hechos desconocidos, donde supera a Swift Mini 2 y Swift Micro 2. No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- **Capacidad muy limitada**: respuestas de una o dos frases, con tendencia a derivar hacia frases incoherentes al final de la respuesta.
- **Calculadora poco fiable**: acierta aproximadamente un tercio de las llamadas; requiere copiar dígitos exactamente, lo que este tamaño dificulta.
- **Aritmética de fechas casi inexistente**: 1/10 en f16 y 2/10 en Q4_K_M.
- **Lectura y extracción muy débiles**: 1/60 en lectura de hechos plantados y 1/30 en extracción tipada.
- **Redacción inexistente**: 0/30 en coincidencia exacta.
- **Marca "(sure)" no fiable**: acierta solo entre el 18% y el 20% de las veces que la emite.
- **Contexto reducido**: 2.048 tokens; los pasajes largos de 1.500 tokens de la batería no caben y cuentan como fallo en las columnas GGUF.
- **Solo inglés**: no se documenta soporte multilingüe.
- **Licencia MIT**: permite uso comercial, pero el propio autor advierte que el modelo no es apto para producción como asistente, calculadora, extractor o redactor.
- **Riesgo de alucinación**: alto en cualquier tarea que exija precisión factual; su principal virtud es precisamente declinar cuando no sabe, no acertar cuando responde.
- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- [HuggingFace: textilelabs/Loom-Planck-300K](https://huggingface.co/textilelabs/Loom-Planck-300K)
- [Loom Planck 600K](https://huggingface.co/textilelabs/Loom-Planck-600K)
- [Loom Planck 1.2M](https://huggingface.co/textilelabs/Loom-Planck-1.2M)
- [Loom Planck Core (programa no neuronal, 104 KB)](https://huggingface.co/textilelabs/Loom-Planck-Core)
