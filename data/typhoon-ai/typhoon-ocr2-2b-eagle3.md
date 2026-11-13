# typhoon-ai/typhoon-ocr2-2b-eagle3

## Resumen

Typhoon OCR V2 2B: EAGLE-3 draft head es una cabeza de borrador (draft head) opcional para el modelo Typhoon OCR V2 2B, desarrollada por el equipo Typhoon AI (SCB 10X). No es un modelo independiente: se ejecuta siempre junto al modelo base y su única función es acelerar la generación de texto mediante decodificación especulativa en vLLM. En cada paso propone los 3 tokens siguientes, que el modelo base verifica en una única pasada forward y conserva si coinciden.

El repositorio contiene únicamente los pesos de la cabeza de borrador (641.498.880 parámetros en bfloat16, 1,3 GB), una sola capa transformer que lee los estados ocultos de las capas 2, 12 y 21 del modelo base y utiliza un vocabulario de borrador de los 32.000 tokens más frecuentes. Está entrenada específicamente para Typhoon OCR V2 2B (no funciona con la variante 0.8B ni con otros modelos) y solo es compatible con vLLM, probado con la versión 0.33.0.

Su relevancia es práctica: en las pruebas del autor, alrededor de 3,5 tokens salen por paso en lugar de 1, con un 82% de tokens propuestos aceptados, lo que se traduce en aceleraciones de 1,9× a 2,6× según la carga. Para pipelines de OCR y parseo de documentos en producción, donde el coste por página es determinante, es una mejora sustancial sin cambiar prompts ni salidas de forma significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador EAGLE-3: una capa transformer que consume estados ocultos de las capas 2, 12 y 21 del modelo base; decodificación especulativa |
| Parametros totales | 641.498.880 (incluye copia de los embeddings de entrada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configuración de vLLM del modelo base; secuencias de entrenamiento de hasta 16.384 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); requiere vLLM, no compatible con GGUF, Transformers, Ollama ni MLX |

## Arquitectura y entrenamiento

La cabeza de borrador sigue el esquema EAGLE-3 y se entrenó con la librería `speculators` (entrenamiento online). Consiste en una única capa transformer que lee los estados ocultos de las capas 2, 12 y 21 de Typhoon OCR V2 2B y predice el siguiente token sobre un vocabulario reducido de los 32.000 tokens más frecuentes. En cada paso propone 3 tokens candidatos que el modelo base verifica en una sola pasada forward, aceptando los que coinciden con su propia distribución.

El conjunto de entrenamiento se compuso de 20.000 imágenes de páginas y prompts muestreados de los datos de SFT y GRPO de Typhoon OCR V2, con peso extra en el parseo JSON de página completa y en páginas en tailandés. Las respuestas se generaron con el propio Typhoon OCR V2 2B en decodificación greedy, de modo que la cabeza aprende a predecir las salidas del modelo base; tras eliminar salidas con bucles o vacías quedaron 19.543 conversaciones. Se entrenó durante 5 épocas con learning rate 1e-4, secuencias de hasta 16.384 tokens y una sola GPU H100. En conversaciones held-out, el primer, segundo y tercer token propuesto son correctos el 92%, 84% y 76% de las veces respectivamente.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone 3 tokens por paso, con una media de 3,5 tokens generados por paso (máximo 4) y un 82% de tokens propuestos aceptados.
- Compatible con el pipeline de OCR y parseo de documentos de Typhoon OCR V2 2B (image-text-to-text), incluyendo salida en JSON de página completa.
- Soporte de los idiomas del modelo base: tailandés e inglés.
- Integración con vLLM mediante `--speculative-config` (servidor) o el parámetro `speculative_config` (offline).
- No aporta capacidades nuevas: hereda exactamente las del modelo base (prompts, ajustes de muestreo y `enable_thinking=False` se toman de la model card de Typhoon OCR V2 2B).
- No soporta tool calling, agentes ni razonamiento multi-paso por sí misma; depende de las capacidades del modelo base, no documentadas en la información disponible.

## Casos de uso

- Digitalización masiva de documentos en tailandés e inglés: desplegando Typhoon OCR V2 2B con esta cabeza en vLLM se procesan lotes de cientos de páginas con una aceleración de hasta 2,6× (MDPBench, 320 páginas en lotes de hasta 200: de 149 s a 57 s), lo que reduce el coste por página en pipelines de archivo y back-office.
- Extracción de JSON estructurado de facturas y formularios: la cabeza se entrenó con peso extra en el parseo JSON de página completa, por lo que mantiene la calidad en este formato mientras acelera la generación de estructuras largas.
- Servicio de OCR con baja concurrencia: en escenarios de una petición a la vez (30 páginas: de 380 a 962 tokens/s, 2,5×) la ganancia es máxima, adecuada para herramientas internas o APIs con tráfico moderado.
- Procesamiento por lotes de alta concurrencia: con 16 peticiones simultáneas se mantiene una mejora de 1,9× (de 1.297 a 2.403 tokens/s), útil en colas de trabajo nocturnas o pipelines ETL documentales.
- Prototipado y evaluación de OCR sobre corpus propios: permite iterar más rápido sobre conjuntos de validación manteniendo la precisión del modelo base (diferencias de −0,3 puntos en MDPBench, intervalo que incluye cero).
- Reducción de coste en GPU en producción: al aumentar el throughput por GPU, permite servir el mismo volumen de páginas con menos instancias o GPUs de menor gama, siempre que el cuello de botella sea la generación de texto y no el preprocesado de imagen.

## Benchmarks y rendimiento

Datos de velocidad publicados por el autor (vLLM 0.33.0 en modo compilado por defecto, una GPU H100, decodificación greedy, 3 tokens de borrador):

| Configuracion | Sin draft head | Con draft head | Aceleracion |
|---|---:|---:|---:|
| 30 páginas, una petición a la vez | 380 tokens/s | 962 tokens/s | 2,5× |
| 30 páginas, 16 peticiones simultáneas | 1.297 tokens/s | 2.403 tokens/s | 1,9× |
| MDPBench, 320 páginas en lotes de hasta 200 | 149 s | 57 s | 2,6× |

Precisión en MDPBench (320 páginas en inglés y tailandés):

| MDPBench, vLLM 0.33.0 | Sin draft head | Con draft head | Cambio (intervalo 95%) |
|---|---:|---:|---:|
| Global | 79,8 | 79,5 | −0,3 (−1,2 a +0,6) |
| Páginas en inglés | 78,5 | 77,7 | −0,8 (−2,0 a +0,1) |
| Páginas en tailandés | 81,1 | 81,3 | +0,2 (−1,1 a +1,7) |
| Páginas con bucles de repetición | 2 | 2 | — |

La salida es idéntica en 191 de las 320 páginas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la cabeza ocupa 1,3 GB en bfloat16 y se suma a los requisitos del modelo base Typhoon OCR V2 2B.
- GPU recomendadas: las pruebas oficiales se realizaron en una NVIDIA H100. No se documentan otras GPU.
- GPU de consumo: no disponible; no se indica compatibilidad con RTX 4090 u otras GPU consumer.
- Despliegue: exclusivamente vLLM (probado con 0.33.0), tanto en modo servidor (`vllm serve` con `--speculative-config`) como offline (`LLM` con `speculative_config`). No funciona con Transformers, llama.cpp (GGUF), Ollama ni MLX.
- Latencia y throughput: 962 tokens/s con una petición a la vez y 2.403 tokens/s con 16 peticiones simultáneas en H100; MDPBench de 320 páginas en 57 s.
- Configuración de contexto: `max_model_len=40960`, `limit_mm_per_prompt={"image": 1}` y `mm_processor_kwargs={"min_pixels": 2048, "max_pixels": 16777216}`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| typhoon-ai/typhoon-ocr2-2b-eagle3 | 641 M (cabeza de borrador) | 40.960 tokens (config. vLLM) | Acelerar Typhoon OCR V2 2B con decodificación especulativa | Apache 2.0 | Hugging Face, requiere vLLM |
| typhoon-ai/typhoon-ocr2-2b (modelo base) | no disponible | 40.960 tokens | OCR y parseo de documentos (th/en) | Apache 2.0 | Hugging Face, vLLM |
| Otras cabezas EAGLE-3 para modelos OCR | no disponible | no disponible | Aceleración por decodificación especulativa | no disponible | no disponible |

No se dispone de información sobre cabezas de borrador alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona con vLLM, probado con la versión 0.33.0; otras versiones pueden requerir una configuración distinta.
- Entrenada exclusivamente para Typhoon OCR V2 2B; no funciona con Typhoon OCR V2 0.8B ni con ningún otro modelo.
- Las salidas pueden diferir ligeramente de la decodificación sin la cabeza de borrador: en las pruebas, cada cambio de tamaño de lote o de modo compilado/eager alteró la salida de 5 a 8 de 30 páginas incluso sin draft head. Si se necesita una coincidencia exacta con una ejecución sin la cabeza, no debe usarse.
- La aceleración se midió en páginas de documento similares a los datos de entrenamiento; con entradas muy distintas pueden aceptarse menos tokens propuestos y reducirse la ganancia.
- Los resultados de MDPBench provienen de una única ejecución de cada configuración y las dos ejecuciones se realizaron en días distintos, por lo que la aceleración de 2,6× es aproximada.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no documentado específicamente para esta cabeza; hereda el del modelo base, no descrito en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-eagle3
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Librería de entrenamiento speculators: https://github.com/vllm-project/speculators
