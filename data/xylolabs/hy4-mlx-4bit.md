# Xylolabs/Hy4-MLX-4bit

## Resumen

Hy4 MLX 4-bit es una conversión cuantizada a 4 bits del modelo de lenguaje tencent/Hy4, un transformer de tipo mezcla de expertos (MoE) con 770.000 millones de parámetros totales y 49.000 millones activos por token. La conversión la firma Xylolabs y está empaquetada para MLX, el framework de Apple Silicon, lo que permite ejecutar el modelo en hardware de la familia M5 mediante la librería `mlx-lm` en su versión 0.32.2. El modelo base lo desarrolla Tencent y se distribuye bajo la Tencent Hy License, versión 1.0.

El interés de esta ficha reside en que es una de las pocas rutas prácticas para servir un modelo de escala 770B en un equipo de sobremesa con memoria unificada grande: el repositorio ocupa 456,6 GB en formato safetensors cuantizado a 4 bits, y según la model card solo es viable en un Mac Studio M5 Ultra con 80 núcleos de GPU y 512 GB de memoria unificada, con el límite de memoria de GPU de macOS elevado. Incluye además, en archivos separados, la torre de visión para entrada de imágenes y un drafter DFly2 para decodificación especulativa, ambos accesibles mediante módulos Python propios.

El modelo cubre generación de texto y conversación en inglés y chino, con arquitectura MoE, y su relevancia actual está en la combinación de un modelo de frontera abierto de gran escala con un stack de inferencia nativo para Apple Silicon, algo poco habitual en este rango de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); incluye torre de visión y drafter DFly2 en archivos separados |
| Parametros totales | 769.907.408.797 (aproximadamente 770B) |
| Parametros activos | 49B |
| Longitud de contexto | 16K (según la tabla de hardware de la model card para el archivo de 4 bits) |
| Tipos de cuantizacion | 4 bits (este repositorio); existe una variante MLX de 8 bits de 828,681 GB |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Tencent Hy License, versión 1.0 (license: other) |
| Formato de pesos | safetensors, cuantización MLX; librería `mlx-lm` 0.32.2 |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base tencent/Hy4 es un transformer con mezcla de expertos de 770B parámetros totales y 49B activos, y que esta conversión mantiene la arquitectura del original limitándose a cuantizar los pesos a 4 bits y convertirlos al formato MLX. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles en la información proporcionada.

Sí se documentan dos componentes técnicos destacables. Por un lado, una torre de visión para entrada de imágenes, añadida el 22 de noviembre de 2026 junto con sus módulos Python, aunque `mlx-lm` ejecuta el modelo como texto y la visión requiere usar dichos módulos directamente. Por otro, un drafter DFly2 para decodificación especulativa, cargable mediante `dfly_v4.load_drafter` y usable con `speculative_v4.stream_generate`, que permite acelerar la generación aceptando tokens propuestos por un modelo pequeño verificados por el modelo grande. La conversión incluye código de Transformers en `hy_v4.py` y de `mlx-lm` en `ORIGINS.md`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y respuesta a instrucciones, con pipeline declarado de text-generation.
- Entrada de imágenes a través de la torre de visión incluida en el repositorio (requiere módulos Python propios, no disponible vía `mlx-lm` estándar).
- Decodificación especulativa mediante el drafter DFly2 para reducir latencia de generación.
- Ejecución local en Apple Silicon con `mlx-lm` en modos generate, chat y server.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de escala 770B en estación de trabajo Apple: un Mac Studio M5 Ultra con 512 GB de memoria unificada puede cargar el archivo de 4 bits (456,6 GB) y servir generación de texto con 16K de contexto, útil para equipos que quieren evitar costes de API en cargas sostenidas.
- Asistencia conversacional en inglés y chino: el modelo gestiona diálogos multi-turno con ventana de 16K, adecuado para atención al cliente bilingüe o asistentes internos donde el contenido no puede salir de la máquina.
- Procesamiento de documentos con imágenes: usando la torre de visión y los módulos Python del repositorio, se pueden extraer descripciones o responder preguntas sobre capturas, diagramas o páginas escaneadas sin depender de servicios externos.
- Generación asistida con baja latencia: integrando el drafter DFly2 mediante `speculative_v4`, se puede acelerar la respuesta en aplicaciones interactivas donde el tiempo por token es crítico, a costa de memoria adicional para el drafter.
- Prototipado e investigación en MLX: sirve como banco de pruebas para estudiar el comportamiento de un MoE de 770B cuantizado a 4 bits, comparando la fidelidad frente a BF16 con las métricas KL y top-1 publicadas.
- Despliegue de servidor local: `mlx_lm.server` permite exponer el modelo como endpoint compatible con clientes HTTP en una red interna, útil para entornos de desarrollo aislados o con requisitos de soberanía de datos.
- Evaluación de cuantización: los datos de KL y top-1 frente a BF16 permiten decidir entre la variante de 4 y 8 bits según la tolerancia a degradación y la memoria disponible.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad de la cuantización frente a BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Se reproducen a continuación:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 456,63 GB | 0,142528 | 88,549% | 0,193011 | 90,126% | 0,066185 | 92,363% |
| MLX 8-bit | 828,681 GB | 0,038634 | 94,118% | 0,119845 | 93,565% | 0,016506 | 96,088% |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el archivo de 4 bits ocupa 456,6 GB, por lo que se necesita al menos esa cantidad más margen para el contexto y el runtime. La model card solo declara compatibilidad con Mac Studio M5 Ultra de 80 núcleos de GPU y 512 GB de memoria unificada, con el límite de memoria de GPU de macOS elevado.
- Equipos descartados explícitamente: Mac Studio M5 Max de 32 y 40 núcleos con 36, 48, 64 y 128 GB, y Mac Studio M5 Ultra de 96 y 256 GB aparecen en la tabla sin archivo asignado.
- GPU dedicadas (A100, H100, RTX 4090): no disponible en la información proporcionada; esta conversión está orientada a MLX y Apple Silicon.
- Cabe en GPU de consumo: no; 456,6 GB excede con holgura cualquier GPU de consumo actual.
- Opciones de despliegue: `mlx-lm` 0.32.2 con `--trust-remote-code` en modos `generate`, `chat` y `server`; decodificación especulativa mediante los módulos `dfly_v4` y `speculative_v4`.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DFly2 está pensada para mejorar la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Hy4-MLX-4bit | 770B / 49B | 16K | MLX safetensors 4 bits (456,6 GB) | Tencent Hy License 1.0 | Hugging Face, 318 descargas |
| Xylolabs Hy4 MLX 8-bit | 770B / 49B | no disponible | MLX safetensors 8 bits (828,681 GB) | Tencent Hy License 1.0 | Referenciado en la model card |
| tencent/Hy4 (base) | 770B / 49B | no disponible | Pesos originales (BF16) | Tencent Hy License 1.0 | Hugging Face |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento con alternativas de la misma categoría; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Degradación por cuantización: frente a BF16, la variante de 4 bits presenta una KL de 0,142528 en WikiText-2 y un top-1 del 88,549%, con peor fidelidad que la de 8 bits (KL 0,038634, top-1 94,118%); en producción sensible a la precisión conviene evaluar la variante de 8 bits.
- Hardware extremadamente restrictivo: solo se declara soporte en un Mac Studio M5 Ultra de 512 GB con el límite de memoria de GPU elevado; no es desplegable en GPU convencionales ni en equipos de consumo.
- Idiomas: únicamente inglés y chino; no hay soporte declarado de castellano, lo que limita su uso directo en aplicaciones en español.
- Contexto limitado a 16K para este archivo, reducido para tareas de documentación extensa o agentes con historial largo.
- Visión y decodificación especulativa no funcionan a través de `mlx-lm` estándar: requieren cargar los módulos Python del repositorio, lo que añade complejidad de integración.
- Licencia: Tencent Hy License 1.0, no es una licencia de código abierto estándar; es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible; como en cualquier modelo generativo, se recomienda validación humana en dominios críticos.
- Confianza en código remoto: la ejecución requiere `--trust-remote-code`, con el riesgo de seguridad que implica cargar código del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/Xylolabs/Hy4-MLX-4bit/blob/main/LICENSE
- Librería MLX LM: https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
