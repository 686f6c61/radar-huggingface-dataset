# STEL-LIUM/Triton-v1-GGUF

## Resumen
Triton v1 es un modelo de lenguaje de tipo mezcla de expertos (MoE) de 35.505.251.456 parámetros totales (unos 3B activos por token) con capacidad de visión, desarrollado por STEL-LIUM como motor de su aplicación de escritorio Triton. No es un modelo entrenado desde cero: es una fusión de pesos (weight merge) de varios modelos abiertos que comparten la arquitectura MoE de Qwen3.6, identificada en llama.cpp como `qwen35moe`. El resultado se distribuye en formato GGUF cuantizado a Q4_K_M, junto con un proyector visual en bf16, listo para llama.cpp.

La relevancia del modelo reside en su enfoque práctico: está pensado para ejecutarse en local en configuraciones de consumo (el autor lo probó con dos GPU de 16 GB, unos 32 GB de VRAM totales) y cubre chat, generación de código, uso de herramientas y agentes multi-paso, además de visión y una función experimental de construcción CAD dentro de la aplicación Triton. El autor es explícito sobre sus límites: no supera a los grandes modelos frontera en matemáticas difíciles ni en código científico, y las capacidades multilingües y de contexto muy largo no están medidas.

La ficha se basa en la model card del autor y en los metadatos de Hugging Face. El repositorio acumula 308 descargas y 0 likes en el momento de la consulta, con fecha de creación el 6 de noviembre de 2026 y última actualización el 9 de noviembre de 2026. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), arquitectura Qwen3.6 MoE (`qwen35moe` en llama.cpp), con torre de visión y cabeza MTP (draft) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B por token (según model card) |
| Longitud de contexto | 131.072 tokens en la configuración probada por el autor (con caché KV q4_0); el contexto máximo arquitectónico no se especifica |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje (21,7 GB); proyector visual en bf16 (0,9 GB) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`triton-v1-q4_k_m.gguf` y `mmproj-triton-v1-bf16.gguf`) |

## Arquitectura y entrenamiento
Triton v1 es una fusión de pesos, no un entrenamiento desde cero. Se construye en dos pasos con un script de merge escrito para el proyecto. Primero se crea la mezcla base «a0»: Ornith-1.5-35B-A3B como progenitor principal, con KAT-Coder-V2.5-Dev integrado, todo sobre la base Qwen3.6-35B-A3B. Después se obtiene Triton v1 sumando a a0 la mitad de la diferencia entre Empero Qwen3.8-35B-A3B-Distill y Qwen3.6-35B-A3B, es decir, `a0 + 0.5 × (Empero − Qwen3.6)`. Los routers de expertos, los embeddings, la cabeza de salida, la cabeza MTP (draft, para decodificación especulativa) y la torre de visión se conservan de a0.

Como todos los modelos progenitores comparten la arquitectura MoE de Qwen3.6, la fusión es peso por peso y no requiere remapeo de tensores. No se utilizaron datos de entrenamiento nuevos para el merge. El resultado se convirtió a GGUF y se cuantizó a Q4_K_M. La innovación técnica destacable es la conservación de la cabeza MTP para decodificación especulativa dentro del propio GGUF, junto con la integración del proyector visual para entrada image-text-to-text.

## Capacidades
- Generación de texto y respuestas largas: una prueba de generación de 8,9k tokens completó las 40 secciones solicitadas sin bucles, a unos 103 tokens por segundo en el equipo del autor.
- Generación de código: superó 5 de 5 tareas en un examen reducido de coding agéntico (evaluador de expresiones, contador thread-safe, ordenación topológica con ciclos, parser CSV) en cada una de 3 ejecuciones.
- Uso de herramientas (tool calling / function calling) y agentes multi-paso: 4 de 4 tareas de reparación con bucle de herramientas real terminaron con los tests en verde, aunque 2 agotaron el presupuesto de pasos antes de finalizar.
- Construcción de grafos de flujo de trabajo de Triton a partir de una petición en lenguaje natural: funcionó en 3 de 4 turnos de chat.
- Razonamiento matemático: 50,0 % en AIME 2026 (30 problemas, un intento cada uno) con este build, frente al 53,3 % del progenitor a0 en el mismo arnés.
- Visión: carga con el proyector `mmproj` y admite entrada image-text-to-text; no hay puntuación de benchmark de visión para este build exacto.
- Herramientas CAD nativas de la aplicación Triton: planificación de producto, diseño de piezas, comprobación de ajustes, cribado de tensiones y lista de materiales (requiere la aplicación de escritorio, no solo el GGUF).
- Capacidades multilingües: no declaradas ni medidas; el modelo solo lista inglés.
- No se reclama calidad en escritura creativa ni en contexto muy largo, por ausencia de mediciones.

## Casos de uso
- Asistente de chat local de largo aliento: con 131.072 tokens de contexto en la configuración probada y una generación de 8,9k tokens sin bucles, es adecuado para conversaciones multi-turno y respuestas extensas en una máquina con unos 32 GB de VRAM.
- Generación de código en local para pipelines de desarrollo: el modelo resuelve tareas de coding agéntico con tool calling, por lo que puede integrarse en flujos de CI/CD o en asistentes de IDE que ejecutan tests y corrigen errores de forma iterativa.
- Agentes de reparación automatizada: las 4 tareas de reparación con bucle de herramientas real (inventario, libro mayor, paginador, kit de texto) acabaron con los tests pasando, lo que lo hace útil para tareas de mantenimiento de software con verificación automática.
- Automatización de flujos de trabajo en la aplicación Triton: la construcción de grafos de workflow a partir de una petición en lenguaje natural funcionó en 3 de 4 turnos, lo que permite a usuarios no técnicos describir procesos y obtener la estructura correspondiente.
- Prototipado CAD asistido: dentro de la aplicación de escritorio Triton, el modelo planifica productos, diseña piezas paramétricas y de catálogo, comprueba interferencias y genera listas de materiales; los ejemplos publicados (cuadricóptero de 78 piezas, rover marciano de 58 piezas, caja reductora imprimible) pasaron la comprobación del motor CAD con 0 errores y 0 avisos, aunque requieren revisión humana por posibles errores de ingeniería.
- Procesamiento de imágenes con descripción textual: al cargar el proyector visual, puede responder preguntas sobre imágenes en inglés, útil para tareas de documentación técnica o inspección visual asistida.
- Despliegue en hardware de consumo: al caber en dos GPU de 16 GB con cuantización Q4_K_M, sirve para entornos de desarrollo sin acceso a infraestructura en la nube.

## Benchmarks y rendimiento
Los únicos datos disponibles provienen de las pruebas internas del autor, no de benchmarks públicos estandarizados. Se presentan tal cual, sin comparación con modelos de referencia porque no se proporcionaron resultados de terceros.

| Prueba | Resultado |
|---|---|
| Generación larga (8,9k tokens, 40 secciones) | 40 de 40 secciones, sin bucles, ~103 tokens/s |
| Coding agéntico (5 tareas, 3 ejecuciones) | 5 de 5 en cada ejecución; 1 tarea alcanzó el límite de pasos por ejecución |
| Reparación con herramientas (4 tareas) | 4 de 4 con tests en verde; 2 agotaron el presupuesto de pasos |
| Grafo de workflow Triton (4 turnos) | 3 de 4 correctos |
| AIME 2026 (30 problemas, 1 intento) | 50,0 % (progenitor a0: 53,3 %) |
| Visión | Sin puntuación de benchmark para este build |

## Requisitos de hardware
- VRAM estimada: 21,7 GB para los pesos Q4_K_M más 0,9 GB para el proyector visual, más la caché de contexto. La configuración probada por el autor usa dos GPU de 16 GB (unos 32 GB de VRAM totales) con contexto de 131.072 tokens y caché KV q4_0.
- GPU recomendadas: el autor validó dos GPU de 16 GB. No se han medido configuraciones menores ni se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Sí, según la prueba del autor con dos GPU de 16 GB. Con menos VRAM hay que reducir `-ngl` (dejar capas en CPU) y `-c` (contexto); estas configuraciones no se midieron.
- Opciones de despliegue: llama.cpp con soporte de la arquitectura `qwen35moe` y visión (`mmproj`). El autor probó con su propio fork de llama.cpp; la versión estándar de llama.cpp no ha sido probada con estos archivos exactos. Se recomienda actualizar llama.cpp si falla la carga. El ejemplo de la model card usa `llama-server` con `-ngl 99 -c 32768 --jinja -fa on`.
- Latencia y throughput: aproximadamente 103 tokens por segundo en la configuración de dos GPU de 16 GB con contexto de 131.072 tokens. No hay datos de latencia para otras configuraciones.

## Comparativa con modelos similares
No se dispone de datos de benchmarks públicos ni de comparaciones directas con modelos alternativos en la información proporcionada. Los progenitores del merge son los únicos modelos con los que se puede establecer una comparación parcial, y solo en la prueba de AIME 2026.

| Modelo | Parámetros | Contexto | AIME 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triton v1 | 35,5B totales / ~3B activos | 131.072 (probado) | 50,0 % | Apache 2.0 | GGUF en Hugging Face |
| Ornith-1.5-35B-A3B (progenitor a0) | ~35B / ~3B activos | No disponible | 53,3 % | No disponible | No disponible |
| Qwen3.6-35B-A3B (base) | ~35B / ~3B activos | No disponible | No disponible | No disponible | No disponible |
| Empero Qwen3.8-35B-A3B-Distill | ~35B / ~3B activos | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Es una fusión de pesos, no un modelo entrenado: no se usaron datos nuevos y su comportamiento depende enteramente de los progenitores.
- Rendimiento inferior al progenitor a0 en razonamiento matemático (50,0 % frente a 53,3 % en AIME 2026), según el propio autor.
- El autor declara explícitamente que no supera a los modelos frontera grandes en matemáticas difíciles ni en código científico.
- Las capacidades multilingües, la calidad de escritura creativa y la calidad en contexto muy largo no están medidas ni reclamadas.
- Solo se declara inglés como idioma; el uso en castellano no está validado.
- Riesgo de alucinación no cuantificado; el autor advierte que los planes de producto CAD generados contienen errores de ingeniería y requieren revisión humana, y que pasar la comprobación del motor CAD no certifica que un diseño funcione o sea imprimible.
- La función CAD requiere la aplicación de escritorio Triton, no solo el GGUF.
- La versión estándar de llama.cpp no ha sido probada con estos archivos; se necesita una build con soporte de `qwen35moe` y `mmproj`, y el autor usó su propio fork.
- Los benchmarks presentados son pruebas internas pequeñas (5 tareas de coding, 4 de reparación, 30 problemas de AIME), no benchmarks públicos estandarizados.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de varios modelos conviene revisar las condiciones de cada progenitor.
- El repositorio tiene 0 likes y 308 descargas, lo que indica una adopción muy temprana y poca validación externa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/STEL-LIUM/Triton-v1-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base Empero Qwen3.8-35B-A3B-Distill: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- llama.cpp: https://github.com/ggml-org/llama.cpp
