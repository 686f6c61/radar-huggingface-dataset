# stbenjam/qwen3-0.6b-haiku-gguf

## Resumen

stbenjam/qwen3-0.6b-haiku-gguf es un ajuste fino (fine-tune) de Qwen3-0.6B orientado exclusivamente a generar verso de tres líneas con estructura pseudo-haiku. Lo desarrolla stbenjam como demostración educativa de post-entrenamiento, no como asistente generalista. El modelo resultante se distribuye ya fusionado con la base y cuantizado en GGUF Q8_0 (unos 639 MB), de modo que puede ejecutarse directamente con Ollama sin descargar adaptadores ni escribir código Python.

El interés del modelo es metodológico: documenta de forma transparente un pipeline completo de LoRA (rango 16 sobre las últimas 16 capas), entrenado con 6.336 ejemplos sintéticos, y publica tanto las métricas de evaluación como las limitaciones. Su objetivo es servir de plantilla reproducible para experimentos pequeños de transferencia de estilo en hardware de consumo, en este caso un MacBook con chip M4 Pro y 48 GB de memoria unificada.

La relevancia práctica es limitada: se trata de un modelo de 0,6 mil millones de parámetros, solo en inglés, sin herramientas ni información en tiempo real, y cuyo propio autor advierte que la métrica 5-7-5 y la relevancia temática no son fiables. La plantilla embebida usa únicamente el último mensaje del usuario, ignorando deliberadamente el historial de conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen/Qwen3-0.6B); ajuste mediante LoRA rango 16 en las ultimas 16 capas, fusionado en los pesos base |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para esta ficha; el modelo base Qwen3-0.6B se documenta con 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repositorio) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache-2.0 (el dataset derivado conserva atribucion CC BY 4.0) |
| Formato de pesos | GGUF (Q8_0); el adaptador MLX original esta en un repositorio aparte |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Sobre él se aplicó un LoRA de rango 16 limitado a las últimas 16 capas, entrenado con 6.336 ejemplos sintéticos (6.080 poemas distintos) y 112 ejemplos de validación. Hiperparámetros documentados: tamaño de lote 8, tasa de aprendizaje 0,00005, dropout 0,05 y semilla 174. De las 1.000 actualizaciones del entrenamiento se seleccionó la número 750 según la pérdida de validación, registro que queda recogido en `selection.json`.

Los datos provienen de ejemplos sintéticos originales más un subconjunto filtrado y modificado del dataset Haiku DPO de Daniel van Strien (CC BY 4.0). Las modificaciones incluyen reescritura de prompts explícitos de haiku, filtrado silábico, deduplicación, agrupación por tema, muestreo y mezcla con ejemplos locales; los detalles quedan en `ATTRIBUTION.md` y `training-data-manifest.json`. El adaptador seleccionado se fusionó con la base fijada mediante MLX LM y después se convirtió a Q8_0 con llama.cpp, con las revisiones y hashes de origen en `export.json`. El hash SHA-256 del adaptador es `786d17f419c43cdae57c7886464000a1d73bf6260acdb3f21cf1224a504c3541`. No se menciona ningún proceso de RLHF o DPO sobre el resultado final; el nombre del dataset de origen contiene "DPO", pero la model card no describe ese paso en este experimento. Tanto el entrenamiento como la evaluación se ejecutaron localmente en un M4 Pro con 48 GB de memoria unificada.

## Capacidades

- Generación de texto creativo breve: verso de tres líneas con intención de haiku, que es el único comportamiento entrenado de forma deliberada.
- Transferencia de estilo: reproduce un registro poético conciso a partir de una palabra o frase temática (por ejemplo, "Potato").
- Modo no-thinking integrado en la plantilla, heredado de la familia Qwen3 y fijado en el template embebido.
- Ejecución directa en Ollama mediante `ollama run hf.co/stbenjam/qwen3-0.6b-haiku-gguf:Q8_0`, sin dependencias de Python ni claves de API.
- Comportamiento de contexto fresco: la plantilla usa solo el último mensaje del usuario, de modo que cada respuesta empieza de cero incluso en chat interactivo.
- Multilingüismo: no disponible (etiqueta de idioma limitada a inglés).
- Tool calling / function calling: no soportado; la model card indica explícitamente que el modelo no tiene herramientas ni información en tiempo real.
- Agentes y razonamiento multi-paso: no soportado.
- Visión, audio u otras modalidades: no soportado.

## Casos de uso

- Demostración educativa de post-entrenamiento: sirve como caso de estudio reproducible de un pipeline LoRA completo, ya que el repositorio publica hiperparámetros, manifiesto de datos, hashes y criterios de selección de checkpoint.
- Prueba de transferencia de estilo a pequeña escala: permite experimentar con ajuste de estilo poético sin infraestructura GPU, ejecutando el GGUF en CPU o en una GPU de gama baja.
- Generación de microcontenido poético para prototipos: útil para poblar maquetas, bots de demostración o aplicaciones de prueba donde se necesiten tres líneas con aire de haiku y no se requiera rigor métrico.
- Banco de pruebas de plantillas y sampling en Ollama: el repositorio incluye archivos `template`, `system` y `params`, lo que lo convierte en un ejemplo práctico para estudiar cómo afectan la plantilla y los parámetros de muestreo al resultado.
- Comparación de motores de inferencia: al existir un adaptador MLX original y esta exportación GGUF Q8_0, permite medir cómo cambian las salidas al pasar de MLX a llama.cpp/Ollama, algo que el propio autor señala como fuente de variación.
- Docencia sobre limitaciones de los modelos pequeños: sus métricas publicadas (3 de 32 en 5-7-5 verificado) lo hacen idóneo para ilustrar la diferencia entre una demo que funciona y un sistema fiable.
- Pruebas de integración de extremo a extremo en CI: su tamaño reducido (639 MB) permite descargarlo y ejecutarlo en un runner sin GPU para validar flujos de Ollama.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al adaptador MLX original, no a una reevaluación de este GGUF cuantizado, tal como advierte el autor. Evaluación con decodificación greedy sobre 32 prompts nuevos de un solo turno:

| Metrica | Modelo ajustado | Modelo de partida (Qwen3-0.6B) |
|---|---|---|
| Respuestas con exactamente tres lineas | 30/32 | 1/32 |
| Estructura 5-7-5 verificada con diccionario | 3/32 | 0/32 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que las comprobaciones realizadas en Ollama solo verifican generación y comportamiento de contexto fresco, y que no constituyen una evaluación de calidad completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB o menos con Q8_0 (tamaño de archivo citado de 639 MB), incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo es viable también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en placas integradas; es un caso de uso de memoria muy baja.
- Opciones de despliegue: Ollama (vía `hf.co/stbenjam/qwen3-0.6b-haiku-gguf:Q8_0`), llama.cpp (formato GGUF) y cualquier cliente GGUF que respete la plantilla Jinja embebida. Los clientes que sobrescriban la plantilla deben desactivar el modo thinking y empezar de cero para un comportamiento comparable.
- Latencia y throughput estimados: no disponible. El entrenamiento y la evaluación se realizaron en un M4 Pro con 48 GB de memoria unificada, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| stbenjam/qwen3-0.6b-haiku-gguf | 596.049.920 | no disponible en la informacion proporcionada | GGUF Q8_0 | Apache-2.0 | Especializado en verso de tres lineas; sin herramientas |
| Qwen/Qwen3-0.6B (base) | 0,6 B | documentado por Qwen como 32.768 tokens | safetensors | Apache-2.0 | Modelo generalista de partida; 1/32 en tres lineas y 0/32 en 5-7-5 en la evaluacion citada |
| stbenjam/qwen3-0.6b-haiku-mlx-lora | 0,6 B mas adaptador | no disponible | adaptador MLX (LoRA rango 16) | Apache-2.0 | Adaptador original sin fusionar; es el que se evaluo en los benchmarks publicados |

No se dispone de datos de rendimiento de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor califica el modelo como "haiku-ish": la estructura 5-7-5 estricta y la relevancia temática no son fiables, con solo 3 de 32 aciertos métricos verificados.
- Es un experimento educativo de estilo, no un asistente general fiable; no debe usarse como componente crítico en producción.
- Puede inventar hechos: no tiene herramientas ni acceso a información en tiempo real.
- No hay posprocesado que fuerce la forma deseada; el ajuste de contexto fresco es un cambio en el prompt, no en los pesos entrenados.
- Los números de benchmark describen el adaptador MLX original; la cuantización Q8_0 y un motor de inferencia distinto pueden alterar salidas concretas.
- La plantilla embebida ignora el historial de conversación, por lo que no hay memoria multi-turno; los clientes que la sobrescriban pueden obtener resultados distintos.
- Idiomas: solo inglés, según las etiquetas del repositorio.
- Licencia Apache-2.0 para los pesos del modelo, pero el subconjunto del dataset Haiku DPO conserva su licencia CC BY 4.0, lo que obliga a mantener la atribución correspondiente; véanse `ATTRIBUTION.md` y `NOTICE`.
- No se implica respaldo alguno por parte de Qwen, Anthropic ni del creador del dataset.
- Repositorio con 0 descargas y 0 likes en el momento del análisis: no existe evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stbenjam/qwen3-0.6b-haiku-gguf
- Adaptador MLX original: https://huggingface.co/stbenjam/qwen3-0.6b-haiku-mlx-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de origen (Haiku DPO, Daniel van Strien): https://huggingface.co/datasets/davanstrien/haiku_dpo
- Repositorio del experimento (codigo, entrenamiento, evaluacion): https://github.com/stbenjam/posttrain-demo
- Resultados completos: https://github.com/stbenjam/posttrain-demo/blob/main/haiku/RESULTS.md
- Ollama: https://ollama.com/download
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los citados en la informacion de HuggingFace y en la model card.
