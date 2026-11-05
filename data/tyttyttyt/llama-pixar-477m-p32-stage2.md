# TYTTYTTYT/llama-pixar-477m-p32-stage2

## Resumen

MIXAR 477M (32x32 patches), stage 2, es la segunda fase de entrenamiento de MIXAR, un modelo de lenguaje multilingüe desarrollado por el usuario TYTTYTTYT que procesa texto como píxeles renderizados en lugar de tokens. El modelo parte del backbone de la etapa 1 (`llama-pixar-477m-p32`) y lo refina mediante un stage corto de aprendizaje por refuerzo basado en GRPO, con el objetivo de convertirlo en un generador de texto autónomo mucho más sólido. La propuesta es radical: elimina el tokenizador y trabaja directamente sobre representaciones visuales del texto.

Arquitectónicamente es un transformer de 477 millones de parámetros (24 capas, dimensión oculta 896, 14 cabezas de atención, MLP de 6656) que recibe y emite píxeles binarios de un solo canal organizados en parches de 32x32, con dos parches por bloque. El contexto declarado alcanza los 32.768 bloques, aunque el entrenamiento se realizó sobre ventanas de 180 bloques. El modelo cubre ocho idiomas (alemán, inglés, español, francés, italiano, japonés, coreano y chino) y se distribuye bajo licencia Apache 2.0.

Su relevancia actual reside en la exploración de paradigmas libres de tokenizador, una línea de investigación que busca eliminar las limitaciones de los vocabularios fijos y los problemas de segmentación en idiomas con escrituras no latinas. Los resultados publicados, sin embargo, son modestos en generación libre, lo que sitúa al modelo como una pieza de investigación más que como una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaPixar), entrada y salida en píxeles binarios de 1 canal, parches de 32x32, 2 parches por bloque |
| Parametros totales | 477.145.984 (24 capas, hidden 896, 14 cabezas, MLP 6656) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 bloques (entrenado sobre ventanas de 180 bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar que opera sobre píxeles en lugar de embeddings de tokens. La entrada se renderiza como imágenes binarias de un canal (tinta = -1, fondo = +1) y se divide en parches de 32x32 píxeles, dos por bloque de escritura. La salida se genera bloque a bloque mediante entropía cruzada binaria por píxel sobre el siguiente bloque, y la generación avanza desplazando la ventana de píxeles hacia la derecha, manteniendo el prompt en el borde de escritura. El modelo incorpora una cabeza de clasificación de secuencias (`LlamaPixarForSequenceClassification`) para tareas de fine-tuning supervisado.

El pretraining se realizó sobre mC4 en ocho idiomas, con documentos muestreados uniformemente del corpus agrupado (es 0,243; de 0,207; fr 0,171; ja 0,127; en 0,126; it 0,088; zh 0,024; ko 0,015). El schedule consistió en 1 millón de pasos, batch global de 384, AdamW con betas (0,9, 0,95), weight decay 0,1, learning rate 3e-4 con decaimiento coseno hasta 3e-5 y 2.000 pasos de warmup, con un coste aproximado de 62 horas en 4 GPU H200. Los documentos se empaquetaron en secuencias de 180 bloques con separadores EOS y máscaras de atención por documento.

La etapa 2 aplica GRPO con grupos de 8 continuaciones de 3 bloques muestreadas desde inicios de palabra en texto de mC4. La recompensa combina la puntuación de realismo de un discriminador y la coincidencia con la continuación de referencia: r = 0,5·σ(D) + 0,5·(0,7·coincidencia de parche + 0,3·coincidencia de píxel). La pérdida suma el objetivo PPO recortado (peso 10), una penalización KL contra el modelo de etapa 1 (peso 0,05) y la pérdida de reconstrucción de etapa 1 (peso 0,1). Generador y discriminador se entrenan en fases alternas condicionadas por la precisión suavizada del discriminador. Se usaron batch 128, micro-batch 8, learning rate constante de 1e-5, 2.000 pasos por generación, tamaño de grupo 8 y separación entre palabras de 12 píxeles. Los pesos publicados son una media 0,6/0,4 de dos checkpoints de una misma ejecución.

## Capacidades

- Generación de texto libre en ocho idiomas a partir de renderizados en píxeles, sin tokenizador ni vocabulario.
- Predicción de la última palabra en contexto (evaluada en LAMBADA) y resolución de tareas de razonamiento sencillo tipo bAbI.
- Clasificación de secuencias mediante fine-tuning con `LlamaPixarForSequenceClassification` (usada en SIB-200, XNLI y GLUE).
- Capacidad multilingüe con cobertura declarada de alemán, inglés, español, francés, italiano, japonés, coreano y chino.
- Generación con caché KV incremental bloque a bloque y detección de fin de secuencia mediante bloque en blanco.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos libres de tokenizador: el modelo sirve como banco de pruebas para estudiar cómo afecta la representación visual del texto al aprendizaje del lenguaje, comparando curvas y resultados con modelos basados en BPE.
- Experimentos de multilingüismo sin vocabulario compartido: al no depender de un vocabulario fijo, permite analizar el comportamiento en escrituras como el japonés, el coreano o el chino sin artefactos de segmentación, aunque los resultados en CJK son muy bajos.
- Clasificación de textos multilingües mediante fine-tuning: con la cabeza de clasificación se pueden entrenar clasificadores por idioma para tareas tipo SIB-200 o XNLI en entornos de investigación.
- Estudio de alineación con RL: la receta GRPO con recompensa basada en discriminador y coincidencia de referencia es replicable y sirve para investigar recompensas no basadas en modelos de lenguaje.
- Docencia y divulgación: el pipeline de renderizado, generación bloque a bloque y reconstrucción a imagen permite explicar de forma tangible el funcionamiento interno de un modelo generativo sin tokenizador.
- Pruebas de concepto de OCR inverso y síntesis de escritura: el modelo produce imágenes de texto que pueden compararse con representaciones reales para estudiar la fidelidad de la síntesis visual de caracteres.
- Evaluación de robustez de pipelines multimodales: útil para probar sistemas que reciben imágenes de texto y comprobar cómo se comportan ante texto generado sintéticamente con errores de trazo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, inglés, generación libre (2-shot) | 34,6 |
| LAMBADA, generación libre, media de 5 idiomas | 15,3 (en 13,4 / de 16,4 / es 17,6 / fr 14,0 / it 15,0) |
| bAbI task 1, CJK, generación libre | zh 1,4 / ja 11,0 / ko 1,0 |
| SIB-200, 22 idiomas | seen 78,5 / unseen 28,7 / unseen low-resource 25,6 |
| XNLI, 10 idiomas | seen 74,1 / unseen 62,8 |
| GLUE (media de tareas) | 73,8 |

Las puntuaciones de generación libre se evalúan con un juez OCR Qwen3.6-35B-A3B con atajo de coincidencia exacta de píxeles. SIB-200 (macro-F1) y XNLI (accuracy, translate-train) se obtienen con fine-tuning por idioma; SIB-200 incluye 8 idiomas vistos en pretraining y 14 no vistos, con un subconjunto de bajos recursos. No se han publicado comparaciones directas con modelos de parámetros similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB de pesos más activaciones y caché KV; en fp16/bf16 bajaría a unos 1 GB de pesos, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó en 4 GPU H200; para inferencia basta una GPU consumer moderna con al menos 4-6 GB de VRAM libre, como una RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, por el tamaño de 477M de parámetros, siempre que se disponga del renderizador `pixar-render` y de `transformers==4.57.3`.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True` y el paquete `pixar-render==0.5.1`. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La generación es autorregresiva por bloques de 2 parches de 32x32 píxeles, con caché KV incremental, lo que implica un coste por bloque superior al de un token en modelos equivalentes en parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 477M stage 2 | 477M | hasta 32.768 bloques (entrenado en 180) | Píxeles, sin tokenizador | Apache 2.0 | HuggingFace |
| MIXAR 477M stage 1 (`llama-pixar-477m-p32`) | 477M | hasta 32.768 bloques | Píxeles, sin tokenizador | Apache 2.0 | HuggingFace |
| Modelos transformer basados en tokens de ~500M | ~500M | variable, típicamente 2k-8k tokens | Tokenizador BPE | variable | Amplia |

No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoría en la información proporcionada. La comparación con modelos basados en tokens debe hacerse con cautela, ya que las métricas de generación libre dependen de un juez OCR y no son directamente equiparables a las de modelos tokenizados.

## Limitaciones y advertencias

- Rendimiento bajo en generación libre: LAMBADA media de 15,3 y bAbI en inglés de 34,6 indican una capacidad generativa limitada, insuficiente para aplicaciones de producción.
- Resultados muy pobres en chino y coreano (1,4 y 1,0 en bAbI CJK), coherentes con la baja proporción de estos idiomas en el corpus de pretraining (0,024 y 0,015).
- Brecha acusada entre idiomas vistos y no vistos en SIB-200 (78,5 frente a 28,7), lo que limita su uso en idiomas fuera de la cobertura de mC4.
- Riesgo elevado de alucinación y de texto visualmente incoherente, dado que la salida se evalúa con un juez OCR y no con métricas de texto convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de código remoto (`trust_remote_code=True`) y del paquete `pixar-render`, lo que introduce riesgos de seguridad y de mantenimiento en producción.
- Requiere versiones muy específicas de dependencias (`transformers==4.57.3`, `pixar-render==0.5.1`), lo que complica la integración en stacks existentes.
- No hay documentación sobre sesgos, filtrado de datos tóxicos ni evaluaciones de seguridad.
- El contexto declarado de 32.768 bloques no está validado más allá de las ventanas de 180 bloques usadas en entrenamiento, por lo que el rendimiento en contextos largos es incierto.
- No se han publicado cuantizaciones oficiales ni soporte para motores de inferencia optimizados, lo que limita el despliegue a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32-stage2
- Modelo de etapa 1: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Repositorio de código: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
