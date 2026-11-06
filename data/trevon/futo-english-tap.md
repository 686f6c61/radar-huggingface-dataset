# trevon/futo-english-tap

## Resumen

`trevon/futo-english-tap` es un modelo de lenguaje compacto en formato GGUF diseñado para funcionar como motor de autocorrección y predicción de siguiente palabra en FUTO Keyboard, el teclado de código abierto para Android. Se trata de un fine-tune no oficial del modelo inglés de serie de FUTO (`ml4_q6_k.gguf`), desarrollado por el usuario trevon con el objetivo de corregir errores de tecleo (tap typing) con mayor frecuencia y precisión que el modelo original.

El modelo conserva exactamente la arquitectura del original: un transformer tipo llama de 8 capas, dimensión 512 y 36,3 millones de parámetros, con el tokenizador propio de FUTO de 15.008 entradas. No está pensado para generación de texto general, sino para una tarea muy concreta de inferencia en dispositivo: dado un contexto de palabras y una palabra objetivo con posible ruido de tecleo, proponer la corrección más probable y la siguiente palabra.

Su relevancia radica en que demuestra que un fine-tune ligero (3.000 pasos, aprendizaje supervisado sobre Wikipedia y Tatoeba) puede mejorar de forma medible las métricas de corrección de un modelo de producción en un dominio restringido, manteniendo el tamaño lo bastante pequeño (39 MB en Q8_0) como para ejecutarse en un teléfono móvil sin comprometer la latencia de forma significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (8 capas, dim 512) |
| Parámetros totales | 36.348.416 (36,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (publicado); Q6_K evaluado pero no publicado |
| Idiomas soportados | inglés (en) |
| Licencia | FUTO Source First License 1.1-kb (no comercial, distribución gratuita) |
| Formato de pesos | GGUF (`futo-english-tap-v4b-q8_0.gguf`, 39 MB) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo de serie de FUTO: un transformer llama de 8 capas con dimensión 512, 36,3 millones de parámetros y tokenizador FUTO de 15.008 entradas. Mantiene las mismas características de inferencia que el original (`base_v1`, `inverted_space`, `xbu_char_autocorrect_v1`, `xc0_swipe_typing_v1`, `char_embed_mixing_v1`), lo que permite que sea un reemplazo directo en la aplicación.

El entrenamiento parte de los pesos originales de FUTO desquantizados a precisión completa (verificados contra el código nativo de FUTO). Los datos provienen exclusivamente de fuentes públicas: el primer shard de Wikipedia en inglés (`wikimedia/wikipedia`, 20231101.en, CC BY-SA) y frases en inglés de Tatoeba (CC0). Se entrenaron dos tareas conjuntamente: modelado de lenguaje para siguiente palabra y ejemplos de tecleo ruidoso → palabra correcta en el formato de entrada de FUTO. El proceso consistió en 3.000 pasos, batch de 4, learning rate de 1e-5, sobre Apple MPS. Se seleccionó el checkpoint entre unos 25 candidatos usando datos de desarrollo y se confirmó con dos conjuntos de holdout sellados.

## Capacidades

- Corrección de errores de tecleo (tap typing) en inglés: dado un contexto y una palabra con ruido sintético, propone la palabra correcta.
- Predicción de siguiente palabra: sugiere hasta 3 candidatos para la siguiente palabra del contexto.
- Inferencia en dispositivo: diseñado para ejecutarse en Android dentro de FUTO Keyboard 0.1.30 con el código nativo de inferencia de FUTO.
- Integración directa: se importa como modelo de idioma inglés desde los ajustes de la aplicación, sustituyendo al modelo de serie.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Autocorrección en teclados Android: el modelo se importa en FUTO Keyboard y corrige errores de tecleo en tiempo real con una tasa de acierto del 82,5% en el holdout, frente al 73,1% del modelo de serie.
- Predicción de siguiente palabra en escritura: ofrece hasta 3 sugerencias contextuales, con una tasa de acierto en top-3 del 38,6% en el holdout, lo que mejora la velocidad de escritura en dispositivos móviles.
- Sustitución de modelo en producción sin cambios de código: al mantener arquitectura, tokenizador y flags de características idénticos, se puede desplegar como reemplazo directo del GGUF original en la app.
- Evaluación de técnicas de fine-tune en modelos diminutos: sirve como caso de estudio reproducible de cómo 3.000 pasos de entrenamiento sobre datos públicos mejoran métricas concretas en un modelo de 36 M de parámetros.
- Investigación sobre robustez a ruido de entrada: el modelo y su benchmark de ruido sintético QWERTY permiten estudiar la relación entre ruido de tecleo y precisión de corrección en modelos pequeños.
- Prototipado de asistentes de escritura offline: al ser un GGUF de 39 MB, puede integrarse en aplicaciones de escritura sin conexión que necesiten corrección y sugerencias sin enviar datos a la nube.

## Benchmarks y rendimiento

Evaluación con el código nativo de inferencia de FUTO (fuente 0.1.30), beam 3, sobre texto inglés con ruido de tecleo simulado. Cada caso es una palabra objetivo en contexto.

Holdout fresco (2.048 casos de Wikipedia nunca usados en entrenamiento ni selección):

| Métrica | Modelo de serie | Este modelo |
|---|---|---|
| Errores corregidos (aplicados) | 73,1% | 82,5% (+9,3 pts, IC 95% +7,8 a +11,0) |
| Sugerencia top-1 del error | 80,0% | 86,1% |
| Palabras correctas cambiadas erróneamente | 2,05% | 1,07% |
| Siguiente palabra en top-3 | 35,4% | 38,6% (+3,2 pts, IC +2,1 a +4,4) |

Test sellado anterior (2.048 casos de Wikipedia + Tatoeba): errores corregidos 72,7% → 82,8%, siguiente palabra top-3 31,0% → 33,7%, palabras correctas cambiadas erróneamente 1,17% → 1,22% (24 → 25 casos). El modelo falló formalmente un criterio preregistrado de suelo absoluto del 99% de palabras limpias, que el modelo de serie tampoco cumple en ese conjunto (98,83%).

Q8_0 frente a precisión completa (2.048 casos de desarrollo): mismas correcciones de errores (1.577) y mismas palabras cambiadas erróneamente (18); 99,6% de salidas finales idénticas. Q6_K perdió unos 2 puntos, por lo que no se publicó.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en Q8_0 (39 MB de pesos más overhead de contexto y beam search); no se han publicado mediciones exactas de memoria.
- GPU recomendadas: no aplica en el caso de uso previsto; está diseñado para CPU móvil (Android) mediante el código nativo de FUTO. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, dado su tamaño ínfimo.
- Opciones de despliegue: código nativo de inferencia de FUTO Keyboard (principal); al ser GGUF, es compatible con llama.cpp y potencialmente con Ollama, aunque no se ha validado en estos entornos.
- Latencia y throughput: no medidos. El autor indica que Q8_0 es aproximadamente un 30% más grande que el modelo de serie y que no se midieron latencia ni consumo de batería.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `trevon/futo-english-tap` | 36,3 M | no disponible | FUTO Source First 1.1-kb (no comercial) | GGUF Q8_0 | Hugging Face (31 descargas) |
| Modelo inglés de serie de FUTO (`ml4_q6_k.gguf`) | 36,3 M | no disponible | FUTO Source First 1.1-kb | GGUF Q6_K | Incluido en FUTO Keyboard |
| Otros modelos de autocorrección para teclados móviles | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de benchmarks de alternativas comparables en la misma categoría (modelos de corrección para teclados en dispositivo) en la información proporcionada.

## Limitaciones y advertencias

- El ruido de tecleo usado en la evaluación es sintético (geometría QWERTY), no toques reales registrados; las mejoras en uso real pueden diferir.
- Solo se ha evaluado con palabras ASCII en minúsculas; el diccionario, las mayúsculas y el pipeline completo de la aplicación quedan fuera del benchmark.
- El swipe no se ve afectado en la práctica: en FUTO 0.1.30 las palabras deslizadas no llegan a la ruta de corrección de este modelo; el flag de swipe se mantiene solo por compatibilidad con el modelo de serie.
- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Latencia y consumo de batería no medidos; Q8_0 es aproximadamente un 30% más grande que el modelo de serie.
- Licencia FUTO Source First 1.1-kb: uso no comercial y distribución gratuita únicamente; cualquier uso comercial requiere verificar los términos del archivo LICENSE.md.
- Es un fine-tune no oficial, no revisado ni respaldado por FUTO; el autor lo declara explícitamente como versión modificada.
- El texto de entrenamiento incluye contenido de Wikipedia bajo CC BY-SA, lo que puede implicar obligaciones de atribución adicionales.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de corrección restringido a una palabra objetivo, el riesgo de generar contenido libre es bajo, pero no se han publicado análisis de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trevon/futo-english-tap
- Repositorio de FUTO Keyboard: https://github.com/futo-org/android-keyboard
- Dataset de Wikipedia en inglés: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Licencia FUTO Source First 1.1-kb: https://huggingface.co/trevon/futo-english-tap/blob/main/LICENSE.md
