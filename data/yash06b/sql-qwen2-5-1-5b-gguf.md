# Yash06B/sql-qwen2.5-1.5b-GGUF

## Resumen

sql-qwen2.5-1.5b-GGUF es la versión cuantizada en formato GGUF (Q4_K_M) de Yash06B/sql-qwen2.5-1.5b-lora, un ajuste fino QLoRA de Qwen2.5-1.5B-Instruct especializado en generar SQL para SQLite sobre un único esquema de comercio electrónico fijo. Lo desarrolla el usuario Yash06B y resuelve un problema muy acotado: traducir preguntas en inglés a consultas SQLite válidas contra ese esquema concreto, sin necesidad de GPU de gama alta.

El interés práctico está en su tamaño: 1.543.714.304 parámetros (1,54 mil millones) y un repositorio de 1,0 GB, lo que permite ejecutarlo en un portátil mediante Ollama. No es un modelo de propósito general ni un text-to-SQL genérico: espera exactamente el system prompt con el que fue entrenado (instrucciones más el esquema completo), y el Modelfile incluido en el repositorio lo incorpora, de modo que hay que crear el modelo a partir de él en lugar de lanzarlo directamente contra Hugging Face.

Es relevante ahora porque demuestra el patrón de especialización barata: un adaptador LoRA sobre un modelo base abierto de 1,5B, cuantizado a 4 bits y empaquetado para Ollama, cubre una tarea estrecha de BI con un coste de inferencia mínimo. La contrapartida es que no hay resultados de benchmarks ni métricas de rendimiento publicadas en la información disponible, y el modelo no sirve fuera de su esquema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredera de Qwen2.5-1.5B-Instruct) con adaptador QLoRA fusionado y cuantizado a GGUF |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens del modelo base Qwen2.5-1.5B-Instruct; no verificado para este fine-tune en la model card |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | Inglés (en); el fine-tune está entrenado y evaluado solo en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), repositorio de 1,0 GB |
| Modelo base | Yash06B/sql-qwen2.5-1.5b-lora (a su vez QLoRA sobre Qwen2.5-1.5B-Instruct) |
| Tarea | Text-to-SQL para SQLite sobre un esquema de e-commerce fijo |
| Prompt requerido | System prompt de entrenamiento con instrucciones y esquema completo; incluido en el Modelfile del repositorio |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only estándar de la familia Qwen2.5, con 1,54 mil millones de parámetros. Sobre el checkpoint instruct se aplicó un ajuste fino QLoRA que produce el adaptador Yash06B/sql-qwen2.5-1.5b-lora; este repositorio contiene ese adaptador fusionado con la base y convertido a GGUF con cuantización Q4_K_M. El resultado es un artefacto de un solo archivo, pensado para servirse con llama.cpp u Ollama.

Los detalles de entrenamiento (número de tokens, composición del dataset, hiperparámetros de QLoRA, uso de RLHF o DPO) no están disponibles en la información proporcionada: la model card remite explícitamente a la ficha del adaptador para "resultados, detalles de entrenamiento y limitaciones". Lo que sí se documenta es la restricción de diseño: el modelo fue entrenado con un system prompt concreto que combina instrucciones y el esquema completo de la base de datos, y funciona peor si se le presenta otro formato. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modo thinking) más allá de la especialización por ajuste fino.

## Capacidades

- Generación de consultas SQLite en inglés a partir de preguntas en lenguaje natural, limitadas al esquema de e-commerce para el que fue entrenado.
- Conversación de un turno orientada a consulta: el ejemplo de la model card es "Which 3 countries have the most customers?".
- Ejecución local en portátil mediante Ollama, usando el Modelfile incluido que incorpora el system prompt con el esquema.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema GGUF/llama.cpp.
- Capacidad multilingüe: no disponible en este fine-tune; solo inglés.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Visión, audio o modo thinking: no soportados.
- Conocimiento general, código fuera de SQL o matemáticas: fuera del alcance del ajuste fino; no evaluado.

## Casos de uso

- Interfaz en lenguaje natural sobre una base SQLite de tienda online: se despliega con Ollama y el Modelfile, se le pasa la pregunta del usuario y devuelve la consulta SQL contra el esquema fijo, que la aplicación ejecuta y renderiza. Es el caso canónico para el que fue entrenado.
- Analítica interna en portátil sin GPU dedicada: al ocupar 1,0 GB en Q4_K_M, el equipo de negocio puede lanzar consultas sobre una copia local de la base sin depender de un servicio en la nube ni de conectividad.
- Prototipado rápido de una función de BI: sirve para validar el pipeline completo (prompt con esquema, generación SQL, ejecución, formateo de resultados) antes de invertir en un modelo mayor o en un servicio gestionado.
- Entornos aislados o air-gapped: al ser un GGUF autocontenido y no requerir llamadas externas, encaja en instalaciones sin salida a internet, como auditorías internas o demos en cliente.
- Generación de consultas de ejemplo y fixtures para tests: se pueden producir sentencias SQL de referencia sobre el esquema para probar migraciones, permisos o capas de acceso a datos.
- Asistente embebido en una aplicación de escritorio de gestión de tienda: integrado vía Ollama en un cliente Electron o similar, traduce las preguntas del operador a SQL sin salir del equipo del usuario.
- Docencia de SQL: con un esquema conocido y acotado, permite mostrar en vivo la traducción de preguntas a consultas y discutir los errores típicos del modelo.
- Prefiltro barato en un sistema mayor: usar este modelo para resolver las consultas frecuentes y escalar a un modelo de mayor tamaño solo cuando la consulta generada no valide contra el esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del GGUF remite a la ficha del adaptador para los resultados, pero esos datos no forman parte de la información proporcionada, por lo que no se incluye ninguna tabla comparativa de métricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 1,0 GB; con overhead de runtime y contexto de 4.096 tokens, el consumo total razonable se sitúa en el rango de 1,5 a 2,5 GB (estimación por tamaño, no medida publicada).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; cabe en GTX 1650, RTX 3050, RTX 4060 y superiores. En A100/H100 funciona, pero está muy infrautilizada.
- Cabe en GPU de consumo: sí, en prácticamente todas las dedicadas de los últimos años y en iGPUs recientes; también en CPU con AVX2 a velocidad usable para consultas cortas.
- Apple Silicon: ejecutable mediante Ollama o llama.cpp con Metal.
- Opciones de despliegue: Ollama es la vía documentada (crear el modelo con `ollama create sql-qwen -f Modelfile`); llama.cpp, LM Studio y text-generation-webui son compatibles por formato GGUF. vLLM y TGI no son la vía recomendada para este artefacto.
- Latencia y throughput: no disponible (no se han publicado medidas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| sql-qwen2.5-1.5b-GGUF (este) | 1,54 B | 32.768 (heredado, no verificado) | Text-to-SQL SQLite, un esquema fijo, inglés | Apache 2.0 | GGUF Q4_K_M, 1,0 GB, Ollama |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Propósito general, multilingüe, sigue instrucciones | Apache 2.0 | Safetensors y múltiples GGUF |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 | Código y SQL genéricos, sin esquema fijado | Apache 2.0 | Safetensors y múltiples GGUF |
| Yash06B/sql-qwen2.5-1.5b-lora (adaptador origen) | 1,54 B (base + LoRA) | No disponible | Mismo fine-tune, sin cuantizar | Apache 2.0 | Safetensors (adaptador) |

Frente a los modelos base, este fine-tune gana en adherencia a un esquema concreto y pierde toda generalidad: Qwen2.5-1.5B-Instruct y Qwen2.5-Coder-1.5B-Instruct pueden escribir SQL arbitrario y trabajar en varios idiomas, mientras que aquí el alcance está limitado al esquema de e-commerce y al inglés. No se dispone de benchmarks que permitan cuantificar esa diferencia de precisión. No se conocen en la información disponible otros fine-tunes de 1,5B para SQLite con resultados publicados que permitan una comparación directa.

## Limitaciones y advertencias

- Alcance cerrado: funciona con un único esquema de e-commerce; cualquier tabla o columna fuera de ese esquema no está cubierta.
- Dependencia del prompt: requiere el system prompt de entrenamiento con el esquema completo; usado con otro formato o sin esquema, la calidad cae y no hay métricas que acoten cuánto.
- Idioma: solo inglés; las peticiones en castellano no están contempladas por el ajuste fino.
- Alucinación de esquema: como cualquier text-to-SQL, puede inventar tablas, columnas o funciones de SQLite. Es obligatorio validar la consulta generada contra el esquema real antes de ejecutarla.
- Seguridad: no se documenta ningún filtrado de sentencias destructivas ni de inyección SQL. En producción hay que ejecutar con un usuario de base de datos de solo lectura y con límites de tiempo.
- Cuantización: solo se publica Q4_K_M; se desconoce la degradación respecto al adaptador sin cuantizar.
- Señales de validación débiles: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la procedencia y licencia de los datos de entrenamiento del adaptador, no detallada aquí.
- Fechas del repositorio: creado y actualizado el 2026-10-27, sin historial de versiones que permita evaluar mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Yash06B/sql-qwen2.5-1.5b-GGUF
- Adaptador LoRA de origen (resultados, entrenamiento y limitaciones): https://huggingface.co/Yash06B/sql-qwen2.5-1.5b-lora
- Modelo base instructivo: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
