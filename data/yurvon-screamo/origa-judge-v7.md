# yurvon-screamo/origa-judge-v7

## Resumen

Origa Judge v7 es un adaptador LoRA de rango 16 y alpha 32 entrenado sobre el modelo base LiquidAI/d1-2B, desarrollado por el usuario yurvon-screamo. Su función es actuar como juez de calidad de traducciones: dado un par de textos (original y traducción), el modelo emite una puntuación de fidelidad que permite filtrar, clasificar o validar salidas de sistemas de traducción automática. No es un modelo generativo de propósito general, sino un clasificador especializado que reutiliza las representaciones internas del d1-2B.

El interés del modelo radica en su especialización multilingüe en seis idiomas (japonés, ruso, inglés, vietnamita, coreano y chino en variantes Hans y Hant-TW) y en su reducido coste computacional: el adaptador pesa aproximadamente 0,1 GB y se apoya en un modelo base de 2B parámetros. Esto lo hace desplegable en hardware modesto, incluidas GPU de consumo, y adecuado para pipelines de control de calidad en producción.

La relevancia actual del modelo es acotada: se publicó en noviembre de 2026, no registra descargas ni interacciones en Hugging Face y su model card documenta varias limitaciones técnicas conocidas, como la incompatibilidad con la API `system_one` del modelo base y la distorsión de lecturas por el fichero `calibration.json` original. Es, por tanto, una herramienta experimental orientada a un caso de uso muy concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, α=32) sobre LiquidAI/d1-2B; arquitectura del base no detallada en la información disponible |
| Parámetros totales | No disponible (adaptador LoRA sobre un base de 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | ja, ru, en, vi, ko, zh (zh-Hans, zh-Hant-TW) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre LiquidAI/d1-2B, un modelo base de 2B parámetros. La model card no detalla la arquitectura interna del base (transformer, híbrido u otra), por lo que este dato no está disponible. El adaptador se carga mediante `PeftModel.from_pretrained` sobre el modelo base instanciado con `trust_remote_code=True` y precisión bfloat16.

El entrenamiento se realizó durante una época sobre un conjunto de 86.272 pares de traducción (dataset v5) que cubre cuatro locales principales más zh-Hans y zh-Hant-TW, complementado con 1.797 pares "prodfix" procedentes de una limpieza de producción (escaneo v62). El cómputo se llevó a cabo en una Intel Arc B390 XPU durante aproximadamente 8 horas. No se especifica la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del esquema de lectura "RAW slot-readout".

Un detalle técnico relevante es que el modelo debe evaluarse mediante RAW slot-readout y no mediante la API `system_one` del base, ya que el fichero `calibration.json` original de d1-2B distorsiona las lecturas en modelos adaptados. El autor publica umbrales calibrados por locale balanceados por F1: ruso 0,80, inglés 0,80, vietnamita 0,85, coreano 0,90 y chino simplificado 0,98.

## Capacidades

- Evaluación de calidad de traducción: emite una puntuación de fidelidad para pares original-traducción.
- Soporte multilingüe en seis idiomas: japonés, ruso, inglés, vietnamita, coreano y chino (simplificado y tradicional de Taiwán).
- Clasificación binaria o por umbral: los umbrales calibrados permiten decidir si una traducción se acepta o se rechaza.
- Integración como componente de filtrado en pipelines de traducción automática.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión, tool calling ni agentes.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Control de calidad en pipelines de traducción automática: el modelo puntúa cada par original-traducción y permite descartar o marcar segmentos por debajo del umbral calibrado del locale correspondiente (por ejemplo, 0,80 en ruso o 0,98 en chino simplificado).
- Filtrado de datos de entrenamiento multilingüe: al puntuar pares de corpus paralelos, se pueden eliminar traducciones de baja fidelidad antes de usarlas para entrenar modelos de traducción.
- Aseguramiento de calidad en localización de software: integrado como paso previo a la revisión humana, reduce el volumen de cadenas que llegan a los revisores en los seis idiomas soportados.
- Monitorización de sistemas de traducción en producción: permite detectar degradaciones de calidad por locale comparando las puntuaciones medias a lo largo del tiempo.
- Evaluación comparativa de motores de traducción: sirve para clasificar las salidas de distintos sistemas (NMT propietarios, open source) sobre el mismo conjunto de evaluación.
- Verificación de traducciones en aplicaciones de contenido generado por usuarios: filtra traducciones automáticas de comentarios o reseñas antes de publicarlas, con umbrales ajustados por idioma.
- Despliegue en hardware de consumo: al ser un adaptador de ~0,1 GB sobre un base de 2B, puede ejecutarse en GPU modestas para tareas de validación por lotes.

## Benchmarks y rendimiento

| Prueba | Puntuación |
|---|---|
| golden_v4c (ru/en/vi/ko) | 77,6 % |
| zh-golden (zh-Hans) | 100 % (200/200) |
| Locales cubiertos | 6 (ru/en/vi/ko/zh-Hans/zh-Hant-TW) |

No se han publicado resultados comparativos con otros modelos jueces en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un base de 2B, la huella corresponde fundamentalmente al modelo base en bfloat16 (aproximadamente 4 GB de pesos) más el adaptador de ~0,1 GB.
- GPU recomendadas: no especificadas. El entrenamiento se realizó en una Intel Arc B390 XPU, lo que sugiere compatibilidad con hardware Intel; el base d1-2B requiere `trust_remote_code=True`.
- GPU de consumo: por el tamaño del base (2B), es plausible su ejecución en GPU de consumo con VRAM suficiente, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: la model card documenta el uso con `transformers` y `peft` (`AutoModel` + `PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos jueces de traducción comparables en la documentación proporcionada. A continuación se incluye una comparación limitada con el propio modelo base:

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Origa Judge v7 | Adaptador LoRA sobre base 2B | No disponible | Juez de calidad de traducción | Apache 2.0 | Hugging Face (0 descargas) |
| LiquidAI/d1-2B | 2B | No disponible | Modelo base de propósito general | No disponible en la información | Hugging Face |

No disponible para el resto de alternativas de la misma categoría.

## Limitaciones y advertencias

- El fichero `calibration.json` original de d1-2B distorsiona las lecturas en modelos adaptados; es obligatorio usar RAW slot-readout y no la API `system_one`.
- El paquete de código remoto `d1pkg` borra `sys.environ` al importarse, lo que puede romper el entorno de ejecución.
- Un único adaptador LoRA cubre tanto fidelidad como niveles por tramos, lo que implica una pérdida de calidad de 5-8 puntos porcentuales por cada habilidad adicional incorporada.
- El rendimiento en golden_v4c es del 77,6 %, lo que deja un margen de error considerable en cuatro de los locales principales.
- La cobertura de evaluación es desigual: el 100 % en zh-Hans corresponde a un conjunto de 200 muestras, mientras que el resto de idiomas se evalúa con golden_v4c.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera de los seis idiomas soportados.
- El modelo no registra descargas ni validación externa; debe considerarse experimental.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/d1-2B puede tener condiciones propias que deben verificarse por separado.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/yurvon-screamo/origa-judge-v7
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Código de referencia RAW-readout: https://github.com/yurvon-screamo/origa/tree/master/translator/judge
