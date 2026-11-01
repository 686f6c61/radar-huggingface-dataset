# sudhirmts/microduck-sprint-sens32

## Resumen

SENS32 es un modelo de política neuronal para robótica y aprendizaje por refuerzo, publicado por el usuario sudhirmts en Hugging Face bajo el identificador `sudhirmts/microduck-sprint-sens32`. Se trata de un *remix* experimental derivado del modelo `jrubiosainz/microduck-game-sprinter-remix14`, orientado a la tarea de sprint de 2 metros en el entorno de simulación Microduck Arena. No es un modelo de lenguaje: es una política de control que mapea observaciones de 61 dimensiones a 14 dimensiones de acción a 50 Hz, exportada en formato ONNX.

El cambio principal respecto al modelo base consiste en la eliminación de cuatro capas de *lookup* de observación/acción heredadas, conservando la red neuronal original y el normalizador de observaciones ya integrado. Sobre esa base se realizó una búsqueda de 32 direcciones en la capa de acción final con características informadas por covarianza (de ahí el nombre SENS32), seleccionando el candidato f063. No se ejecutó entrenamiento PPO: la marcha de carrera aprendida es heredada, no entrenada por el autor de este *remix*.

La relevancia del modelo es acotada y de carácter exploratorio. El propio autor lo describe como un candidato local rápido, no como una mejora robusta cualificada, y señala que las puertas de promoción de su investigación no se superaron. La licencia es Apache 2.0, lo que facilita su reutilización, pero no existe validación en robot físico ni un resultado oficial de la Arena que respalde las cifras locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (entrada 61, salida 14), sin arquitectura de lenguaje declarada; inferencia a 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (SHA-256 `bba107d860433ed6d17f66fe85b090465fd18aa27cc7961d5bc8e827da961009`) |

## Arquitectura y entrenamiento

La arquitectura es una política neuronal con entrada de tensor `[1, 61]` y salida `[1, 14]`, operando a 50 Hz, con normalización de observaciones integrada en el artefacto. El modelo base incluía cuatro capas de *lookup* de observación/acción que este *remix* elimina; se conservan la red neuronal heredada y el normalizador. Sobre la capa de acción final se realizó una búsqueda de 32 direcciones con características informadas por covarianza, con población de 12 individuos durante 16 generaciones, 30 arranques de desarrollo a comando 0.65 y semilla de optimizador 130031; se congeló un único candidato (f063) y se evaluó con semillas nuevas.

No hubo entrenamiento PPO ni entrenamiento desde cero: la marcha de carrera es heredada del linaje upstream. El autor reconoce explícitamente la autoría de la red y la marcha a a1rb4Ck y suraj-phanindra, y la línea de modelos a jrubiosainz, nikghodki, HlibPlakhtii y rumezhak. La revisión inmutable upstream es `e9a74fa9a55e00f972e87d158f40db660a54be91`. No se documentan datos de entrenamiento adicionales, número de tokens ni composición de dataset, por no tratarse de un modelo lingüístico.

## Capacidades

- Control de política para locomoción tipo *sprint* en el simulador Microduck Arena (tarea sprint-2m).
- Inferencia a 50 Hz con entrada de 61 dimensiones y salida de 14 dimensiones.
- Normalización de observaciones integrada en el artefacto, sin tablas de *lookup* añadidas.
- Exportación ONNX lista para despliegue en *runtimes* compatibles.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- Sin soporte de *tool calling*, *function calling* ni razonamiento multi-paso.
- Sin capacidades multilingües (no es un modelo lingüístico).
- Sin modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo para locomoción simulada: usar SENS32 como política de referencia y comparar su comportamiento con el control extraído del modelo base en barridos de comando y semillas nuevas.
- *Benchmarking* de entornos de simulación: integrar el ONNX en el *runner* 5 de Arena 0.5.1 para medir tiempos de finalización y tasas de éxito bajo comandos fijos.
- Estudio de ablación de capas de *lookup*: evaluar el efecto de eliminar las cuatro capas de observación/acción heredadas manteniendo la red y el normalizador.
- Búsqueda evolutiva de políticas: reutilizar la configuración de búsqueda (población 12 × 16 generaciones, 30 arranques, comando 0.65) como punto de partida para experimentos de optimización en la capa de acción.
- Docencia y divulgación sobre *remix* de modelos: ilustrar el flujo de derivación, preservación de avisos upstream y publicación de procedencia con hashes y manifiestos.
- Validación de pipelines de exportación ONNX: comprobar la integridad del artefacto mediante su SHA-256 y verificar formas de entrada/salida en herramientas de inspección de modelos.

## Benchmarks y rendimiento

Los únicos datos disponibles son mediciones locales del autor, no resultados oficiales de la Arena.

| Test | SENS32 | BASE extraído (control) |
|---|---|---|
| Barrido de comando nativo, semillas de puntuación 1–5 | 0.907 s, 5/5, comando 1.10 | 0.915 s, 5/5, comando 0.65 |
| Semillas nuevas 1002101–1002120, comando fijo 0.65 | 18/20, media penalizada 5.829 s | 19/20, media penalizada 3.37525 s |

Los fallos en semillas nuevas se contabilizan como 50 segundos. La reducción nativa del 0.874% emplea comandos seleccionados por separado y no constituye prueba de una ganancia con comando fijo. El autor indica que no se alcanzó su umbral nativo del 1%, que se perdió una finalización en semillas nuevas y que las puertas de promoción fallaron. No se usaron las semillas de retención finales de la campaña. No hay validación en robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la forma de entrada/salida, el modelo es de muy pequeño tamaño y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; una GPU consumer moderna es suficiente para la inferencia a 50 Hz.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte ONNX Runtime (no se documenta una lista concreta).
- Opciones de despliegue: ONNX Runtime y *runtimes* compatibles con ONNX; el *runner* 5 de Arena 0.5.1 se cita como entorno de evaluación. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y *throughput*: no disponibles; la política opera a 50 Hz según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sudhirmts/microduck-sprint-sens32 | Política RL (ONNX) | [1,61] → [1,14] a 50 Hz | no aplica | Apache 2.0 | Hugging Face |
| jrubiosainz/microduck-game-sprinter-remix14 | Política RL (base) | no disponible | no aplica | no disponible en la información | Hugging Face |
| Otros modelos de la línea Microduck | Política RL | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente experimental: el autor lo describe como candidato local rápido, no como mejora robusta cualificada.
- Las puertas de promoción de la investigación fallaron: no se alcanzó el umbral nativo del 1% y se perdió una finalización en semillas nuevas.
- Sin validación en robot físico; todas las mediciones son de simulación.
- Sin resultado oficial de la Arena: la puntuación devuelta por la Arena es la autoritativa y no se incluye.
- La marcha de carrera es heredada, no entrenada por el autor de este *remix*.
- Sin datos de sesgos, alucinación o limitaciones de idioma aplicables (no es un modelo lingüístico).
- Licencia Apache 2.0: permite uso comercial con las obligaciones de atribución y avisos correspondientes; deben conservarse `UPSTREAM_MODEL_CARD.md`, `BASE_MODEL_CARD.md`, `NOTICE` y `LICENSE`.
- El autor declara que un asistente de IA ayudó a preparar los experimentos y la publicación, lo que conviene tener en cuenta al auditar la procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhirmts/microduck-sprint-sens32
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14/tree/e9a74fa9a55e00f972e87d158f40db660a54be91
- Artefactos de procedencia citados en la model card: `local-evaluation.json`, `manifest.json`, `UPSTREAM_MODEL_CARD.md`, `BASE_MODEL_CARD.md`, `NOTICE`, `LICENSE` (en el repositorio del modelo).
