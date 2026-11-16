# zoeissleeping/Alexandria-Research-Preview-150m

## Resumen

Alexandria-Research-Preview-150m es un modelo de autocompletado de código de 142,3 millones de parámetros entrenado desde cero por el usuario zoeissleeping sobre 11,28 mil millones de tokens de Python y JavaScript/TypeScript. Se presenta explícitamente como una *research preview* orientada a construir un sistema de autocompletado autoalojado al estilo Supermaven, y su model card advierte que todavía no es utilizable como modelo de completado en un editor real. El modelo es relevante por su arquitectura poco convencional y por la transparencia del proceso de entrenamiento y evaluación, no por su rendimiento absoluto.

La arquitectura es personalizada: un encoder que procesa bloques de código de 128 a 512 tokens de forma independiente (lo que permite cachear estados y recalcular solo el bloque editado) y un decoder de 7 capas que atiende sobre una memoria compartida de claves y valores, incluyendo código posterior al cursor. Esto permite *fill-in-the-middle* nativo, aunque la evaluación muestra que el sufijo apenas mejora la generación por un desajuste entre entrenamiento e inferencia.

El modelo no es cargable con `transformers`; requiere el `model.py` incluido en el repositorio. No tiene capacidades de chat, instrucciones ni lenguaje natural, y su licencia es OpenMDW-1.0. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder personalizado con memoria compartida de KV; encoder de 7 capas y decoder de 7 capas, ancho 768, 12 cabezas, MLP ReLU², QK-norm |
| Parametros totales | 142.344.204 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con spans de 4.096 tokens; escala aprendida por cabeza sobre log(claves visibles) para mantener atención más allá de 4.096; claves a más de 1.024 tokens se emparejan solo por contenido |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Código (Python 42%, JS/TS 54%, HTML+CSS 6%, Vue 1,3%, Svelte 0,5% del texto de entrenamiento) |
| Licencia | openmdw-1.0 |
| Formato de pesos | safetensors (con `model.py` para carga; no compatible con `transformers`) |

## Arquitectura y entrenamiento

El código se divide en bloques de 128 a 512 tokens. Un encoder lee cada bloque de forma aislada, de modo que sus estados pueden cachearse y solo el bloque editado necesita recálculo. De la salida del encoder se proyecta una clave y un valor por token, y cada capa del decoder atiende sobre esa memoria compartida: bloques anteriores de forma causal, el bloque del cursor de forma causal y bloques posteriores al cursor. El vocabulario es de 32.768 tokens con BPE a nivel de byte entrenado sobre el corpus, y un token de nueva línea transporta la indentación posterior. La posición usa rotary en la mitad de las dimensiones de cada cabeza, y una escala aprendida por cabeza multiplicada por log(claves visibles) mantiene la atención nítida más allá de la ventana de entrenamiento. El 2% de los spans de entrenamiento son documentos sintéticos de recuperación clave-valor.

El entrenamiento consumió 11,28 mil millones de tokens en 172.099 pasos de 16 spans de 4.096 tokens, en una sola RTX PRO 6000 de 96 GB. Se usó Muon para matrices y AdamW para embeddings y la cabeza de salida, con warmup y luego tasa de aprendizaje constante. La pérdida se estabilizó en 10,98 mil millones de tokens, por lo que el run se detuvo y se annealed por separado durante 300 millones de tokens con caída lineal hasta 0,05×; el anneal bajó la pérdida de validación de 1,162 a 1,105 nats/token. El presupuesto previsto era de dos épocas (36 mil millones de tokens), pero el modelo vio aproximadamente 0,63 épocas de su corpus. Los datos provienen de 358.894 repositorios: todos los de al menos 50 estrellas y los de 1 a 49 estrellas con puntuación mínima de 2,14 en Stack-Edu. El 55,7% del texto procede de StarCoderData reagrupado por repositorio y el 44,3% de repositorios completos de GitHub.

## Capacidades

- Autocompletado de código con relleno de huecos (*fill-in-the-middle*): el modelo ve bloques anteriores y posteriores al cursor.
- Generación de la primera línea de una sugerencia de completado, con resultados medidos en el benchmark Lacuna.
- Copia de corchetes y estructuras de cierre: 100% de acierto en la prueba de corchetes de Lacuna Lite.
- Reconocimiento de modismos e idiomas de programación: 72,5% en la prueba de idiom de Lacuna Lite.
- Seguimiento de patrones locales de código: 70,0% en la prueba de pattern.
- Razonamiento semántico simple sobre el código (por ejemplo, duplicar un valor): 70,8%.
- Uso de código posterior al cursor cuando la respuesta depende de él: 42,5% en la prueba de suffix.
- Recuperación de valores definidos mucho antes en el fichero: 30,0% en la prueba de recall.
- Contexto entre ficheros: 22,5% en la prueba crossfile.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión, audio ni comprensión de lenguaje natural.

## Casos de uso

- Investigación sobre arquitecturas de autocompletado: el modelo sirve como banco de pruebas reproducible para estudiar el diseño encoder-decoder con memoria compartida y bloques cacheables, gracias a que el corpus y el código de selección están documentados en el manifest.
- Evaluación de técnicas de token healing: el fallo documentado con prefijos que terminan en espacio lo convierte en un caso de estudio concreto para validar implementaciones de token healing en pipelines de completado.
- Estudio de desajustes entrenamiento-inferencia en fill-in-the-middle: la caída de pérdida con sufijo (de 1,149 a 0,723 en teacher forcing) frente a la ausencia de mejora en generación es un experimento útil para investigar colocación del sufijo y señales de parada.
- Generación de código en lote sin interacción: como modelo de completado de una sola línea forzando el corte al final de la primera línea, puede usarse en experimentos offline de generación de fragmentos sobre repositorios, sin esperar calidad de editor.
- Benchmarking de modelos pequeños de código: con 142M parámetros y licencia OpenMDW-1.0, es un punto de comparación de bajo coste frente a modelos de 0,5B en tareas de completado de una línea.
- Reproducción de entrenamiento a pequeña escala: el run completo en una sola GPU de 96 GB y el detalle de hiperparámetros (Muon, AdamW, anneal) permiten replicar el pipeline en entornos académicos con recursos limitados.
- Docencia sobre evaluación de modelos: las pruebas de Lacuna Lite por habilidad (brackets, idiom, suffix, recall, crossfile) sirven como material para enseñar evaluación desagregada de capacidades.

## Benchmarks y rendimiento

Resultados en el split de desarrollo de Lacuna, casos de línea (227), decodificación greedy, con el post-procesado de un cliente estilo Supermaven aplicado a todos los modelos. Intervalos de confianza al 95% bootstrap sobre repositorios.

| Modelo | Primera línea exacta | Aceptado (la sugerencia es prefijo de lo escrito) |
|---|---|---|
| Alexandria-150m, solo prefijo | 15,4% [10,5-20,3] | 0,0% |
| Alexandria-150m, con sufijo | 12,3% [8,2-16,5] | 0,0% |
| Qwen2.5-Coder-0.5B, solo prefijo | 10,6% [6,5-14,8] | 2,2% |
| Qwen2.5-Coder-0.5B, fill-in-the-middle | 33,5% [26,0-40,3] | 9,3% |

Lacuna Lite, pruebas de habilidad individual con código generado (40-60 casos cada una, con sufijo visible):

| Habilidad | Acierto |
|---|---|
| Corchetes, copia | 100% |
| Modismo | 72,5% |
| Patrón | 70,0% |
| Semántica (por ejemplo, duplicar un valor) | 70,8% |
| Sufijo (la respuesta depende de código posterior al cursor) | 42,5% |
| Recuperación (valor definido mucho antes) | 30,0% |
| Entre ficheros | 22,5% |
| Espacio (el prefijo termina en un espacio tecleado) | 0% |

Pérdida en repositorios reservados (1 de cada 50, nunca entrenados): 1,105 nats/token solo con prefijo y 0,874 con sufijo. El adaptador de Qwen2.5-Coder-0.5B reproduce sus cifras publicadas de HumanEval-FIM de una línea (65/81/78 en 100 casos de Python/Java/JS, frente a 70,3/78,1/81,2).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 142,3M parámetros en safetensors, los pesos ocupan aproximadamente 0,57 GB en precisión nativa (fp32) y alrededor de 0,28 GB en fp16/bf16.
- GPU recomendadas: el entrenamiento se hizo en una RTX PRO 6000 de 96 GB, pero la inferencia de un modelo de este tamaño cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, por tamaño; la model card no publica requisitos mínimos ni cifras de latencia o throughput.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, TGI ni llama.cpp de forma directa; requiere el `model.py` del repositorio con PyTorch y el tokenizer de `tokenizers`. No se documenta soporte para Ollama ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alexandria-Research-Preview-150m | 142,3M | Entrenado a 4.096 tokens, con extensión por escala aprendida | Autocompletado con encoder-decoder y memoria compartida; no cargable con `transformers` | openmdw-1.0 | Pesos en Hugging Face, 0 descargas |
| Qwen2.5-Coder-0.5B | 0,5B (no confirmado en la información disponible) | no disponible en la información proporcionada | Modelo de código general con fill-in-the-middle; obtiene 33,5% de primera línea exacta en Lacuna FIM | no disponible en la información proporcionada | Usado como referencia en la evaluación del autor |
| Alternativas de 100-200M para autocompletado | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita a Qwen2.5-Coder-0.5B en Lacuna: Alexandria queda por delante en modo solo prefijo (15,4% frente a 10,6%) pero muy por detrás en modo FIM (12,3% frente a 33,5%) y no logra ninguna sugerencia aceptada.

## Limitaciones y advertencias

- El modelo no se detiene: no recibió señal de entrenamiento sobre dónde termina el hueco y empieza el sufijo, así que genera hasta el límite de caracteres; ninguna completación resulta aceptada en Lacuna aunque su primera línea sea correcta. Es necesario cortar la salida al final de la primera línea.
- El sufijo apenas ayuda en generación: en entrenamiento la posición del siguiente bloque indica cuántos tokens faltan antes del sufijo, pero en inferencia esa longitud es desconocida y el sufijo se coloca justo tras el cursor, una disposición nunca vista en entrenamiento. La pérdida forzada baja de 1,149 a 0,723 con sufijo, pero la calidad de generación no mejora.
- Un prefijo que termina en espacio tecleado produce basura: el tokenizer adjunta espacios a la palabra siguiente, y esa secuencia es rara en entrenamiento. El token healing lo corrige, pero `model.py` no lo implementa.
- Sin capacidad de lenguaje natural, chat ni instrucciones.
- La model card declara explícitamente que no es usable como modelo de completado en editor todavía.
- El modelo vio aproximadamente 0,63 épocas de su corpus, por debajo del presupuesto previsto de dos épocas.
- El benchmark Lacuna no es público, lo que limita la verificación independiente de los resultados.
- Licencia OpenMDW-1.0: deben revisarse sus términos para uso comercial; la información disponible no detalla restricciones adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de código sin alineación por RLHF/DPO, no se han aplicado salvaguardas de este tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zoeissleeping/Alexandria-Research-Preview-150m
- Dataset manifest del corpus: https://huggingface.co/datasets/zoeissleeping/Alexandria-Research-Preview-150m-manifest
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
