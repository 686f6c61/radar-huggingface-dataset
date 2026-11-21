# yushengsu/Qwen3-8B-5layer-MoE-8E2A-FFN24576-v1

## Resumen

El modelo `yushengsu/Qwen3-8B-5layer-MoE-8E2A-FFN24576-v1` es un modelo borrador (draft model) para decodificación especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. No es un modelo de propósito general: su función es proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando así la generación sin alterar la distribución de salida del modelo base. Lo desarrolla el usuario yushengsu y se entrena con SpecForge, en su variante DSpark.

La arquitectura es un transformer de 5 capas en el que cada FFN se sustituye por una capa MoE con 8 expertos de anchura 24576, de los cuales 2 están activos por token y sin experto compartido. Esto da 12,45 mil millones de parámetros totales y 3,39 mil millones activos. La atención usa 32 cabezas de consulta y 8 de clave/valor de dimensión 128 con normalización q/k, e incorpora un proyector de 20480 a 4096 sobre las capas 1, 9, 17, 25 y 33 del modelo objetivo, además de una cabeza Markov de rango 256 y bloques de 16 tokens.

Su relevancia es práctica: permite desplegar decodificación especulativa sobre Qwen3-8B con una licencia Apache 2.0 y un checkpoint entrenado específicamente para ese objetivo, algo poco habitual en el ecosistema de borradores, donde la mayoría de alternativas son modelos densos de menor capacidad o borradores genéricos no ajustados al modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con FFN sustituida por MoE (8 expertos, top-2, sin experto compartido); atención 32 q / 8 KV heads × 128 con q/k norm; proyector fc 20480→4096 sobre capas 1/9/17/25/33; cabeza Markov de rango 256; bloque de 16 |
| Parametros totales | 12,45 B |
| Parametros activos | 3,39 B |
| Longitud de contexto | 8192 (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint en `1ep/` al finalizar la época) |

## Arquitectura y entrenamiento

El borrador es un transformer de 5 capas en el que la FFN densa se reemplaza por una capa MoE con 8 expertos de anchura 24576 y enrutamiento top-2, sin experto compartido; el autor indica que la variante densa equivalente usaría una única FFN de anchura 49152. La atención emplea 32 cabezas de consulta y 8 de clave/valor de dimensión 128 con normalización q/k. Sobre el tronco se añade un proyector de dimensión 20480 a 4096 que consume las activaciones de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B, una cabeza Markov de rango 256 y un esquema de bloques de 16 tokens, propio de la decodificación especulativa tipo DSpark.

El entrenamiento se realizó durante una única época sobre prompts regenerados de "perfectblend" con temperatura 0 y sin modo thinking, en contexto de 8192 tokens y con la plantilla de Qwen3 instruct sin system prompt. Se usó tasa de aprendizaje 6e-4 con decaimiento coseno y un 4 % de warm-up, 144 muestras por paso de optimizador (12 rangos × 6 × 2) y 9867 pasos en total, con Liger RMSNorm y cuatro nodos GB300 de 4 GPU cada uno. El código de entrenamiento corresponde al PR 22 del fork de SpecForge del autor, junto con el fichero de configuración `configs/qwen3-8b-5layer-moe8x24576-8A2-dspark.json`.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B; no está pensado para generar respuestas finales de forma autónoma.
- Predicción multi-token por bloque de 16, con cabeza Markov de rango 256 para modelar dependencias entre tokens del bloque.
- Aprovechamiento de activaciones intermedias del modelo objetivo mediante proyector sobre cinco capas, lo que alinea el borrador con la representación interna de Qwen3-8B.
- Enrutamiento MoE top-2 con 8 expertos por capa, que aporta capacidad adicional frente a un borrador denso de tamaño comparable en parámetros activos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias; el borrador hereda el comportamiento del modelo objetivo solo en la medida en que sus predicciones sean aceptadas.
- Idiomas soportados no disponibles; el entrenamiento se hizo con prompts de "perfectblend" y plantilla Qwen3 instruct, sin detalle de composición lingüística.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone bloques de hasta 16 tokens que el modelo objetivo verifica en una sola pasada, reduciendo el número de pasos de decodificación en cargas de generación de texto largas.
- Servicio de chat de baja latencia: al reducir el coste por token generado, permite mantener tiempos de primera respuesta y de generación por debajo de los de la decodificación autorregresiva estándar en despliegues con Qwen3-8B.
- Generación de código asistida: en pipelines donde Qwen3-8B produce código, el borrador acelera la salida sin cambiar la distribución del modelo verificado, manteniendo la calidad del código generado.
- Procesamiento por lotes de documentos: para tareas de resumen o extracción sobre contexto de hasta 8192 tokens, la decodificación especulativa reduce el coste computacional por documento en despliegues con múltiples peticiones.
- Investigación en decodificación especulativa: sirve como referencia reproducible de un borrador MoE entrenado con SpecForge/DSpark, útil para comparar estrategias de borrador denso frente a MoE.
- Evaluación de infraestructura de serving: permite medir la ganancia real de la decodificación especulativa en stacks como vLLM con soporte del fork `dev-moe-serving`, útil para dimensionar clústeres de inferencia.
- Experimentación con ajuste de borradores: el código y la configuración publicados permiten reentrenar el borrador para otros modelos objetivo o dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 12,45 B parámetros totales, en FP16 serían necesarios aproximadamente 25 GB solo para pesos; en cuantizaciones de 8 o 4 bits bajaría a rangos de 12-13 GB y 6-7 GB respectivamente, pero el autor no publica cuantizaciones ni cifras verificadas.
- GPU recomendadas: no disponible. El entrenamiento se realizó en nodos GB300, lo que no implica requisitos de inferencia; para servir junto a Qwen3-8B se necesitará capacidad adicional para el modelo objetivo.
- Viabilidad en GPU de consumo: no confirmada. Un borrador de 12,45 B totales con 3,39 B activos podría caber en GPUs de 24 GB en cuantización de 8 bits, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el autor indica que el serving requiere el paquete `dev-moe-serving` del fork de SpecForge, con la clase `Qwen3MoeDSparkModel`, el campo `gate.expert_bias` (renombrado desde `gate.selection_bias`) y `dflash_config.moe_router_enable_expert_bias: true`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E2A-FFN24576-v1 | 12,45 B totales / 3,39 B activos | 8192 | Apache 2.0 | Borrador MoE para Qwen3-8B entrenado con SpecForge/DSpark; requiere fork de serving |
| Borrador denso equivalente del mismo autor | no disponible (FFN única de anchura 49152) | 8192 | Apache 2.0 | Mencionado en la model card como contrapartida densa; sin checkpoint ni métricas publicadas |
| Borradores genéricos de decodificación especulativa para Qwen3 | no disponible | no disponible | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- Es un modelo borrador: no debe usarse como modelo de chat o generación autónoma, ya que su salida está pensada para ser verificada por Qwen3-8B.
- El serving requiere un fork específico de SpecForge (`dev-moe-serving`); no funciona con stacks estándar sin adaptación, lo que limita su adopción en producción.
- El contexto de entrenamiento es de 8192 tokens; no hay evidencia de generalización a ventanas mayores.
- No se documentan idiomas soportados ni composición lingüística del dataset de entrenamiento, por lo que el comportamiento multilingüe es incierto.
- No hay benchmarks publicados de tasa de aceptación de tokens, speedup ni calidad, lo que impide cuantificar la ganancia real frente a la decodificación estándar.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación externa conocida.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un borrador, los tokens rechazados por el verificador no afectan a la salida final, pero una tasa de aceptación baja degradaría el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse al desplegar el conjunto.
- El checkpoint solo aparece como `1ep/` cuando finaliza la época; conviene verificar la integridad y disponibilidad de los pesos antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E2A-FFN24576-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código de entrenamiento (PR de SpecForge): https://github.com/yushengsu-thu/SpecForge/pull/22
- Configuración del borrador: `configs/qwen3-8b-5layer-moe8x24576-8A2-dspark.json` en el repositorio de SpecForge del autor
