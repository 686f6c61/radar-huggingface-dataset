# Zuk13/kotonoha-input-compiledmix

## Resumen

Kotonoha-input-compiledmix (ことのは入力 compiledmix) es un modelo desarrollado por el usuario Zuk13 orientado a una tarea muy concreta dentro del procesamiento del japonés: el ranking de candidatos en la conversión kana-kanji de un IME (método de entrada japonés). No se trata de un modelo de lenguaje generalista, sino de un componente de un sistema de conversión que recibe la lectura en kana y el contexto izquierdo y ordena las candidaturas generadas por un diccionario para seleccionar la más probable.

El modelo combina dos redes neuronales: por un lado, un clasificador de contexto denominado D8 con 8.197.891 coeficientes; por otro, un modelo de lenguaje propio de 8 capas, anchura 512 y 24.200.192 coeficientes, inicializado con un Transformer preentrenado desde cero sobre texto natural con inicialización aleatoria y posteriormente ajustado para selección de candidatos y "ensayo" de texto natural. Los pesos se distribuyen en formato ONNX, con un fichero weights.bin derivado de cuantización Q4 y un expanded.bin con los mismos valores expandidos a FP32.

La relevancia del modelo es acotada pero específica: cubre una necesidad poco atendida en el ecosistema open source, como es la desambiguación de la conversión kana-kanji en japonés con contexto limitado a la izquierda. El repositorio ocupa 0,3 GB y la licencia es mixta (Apache-2.0 para los pesos propios y licencias individuales para el diccionario derivado), lo que exige revisar el alcance de uso comercial antes de integrarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer propio (clasificador D8 + modelo de lenguaje de 8 capas) exportado a ONNX |
| Parámetros totales | D8: 8.197.891 coeficientes; LM: 24.200.192 coeficientes (total aproximado: 32,4 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 (weights.bin) y FP32 expandido (expanded.bin) |
| Idiomas soportados | japonés (ja) |
| Licencia | mixta: pesos propios Apache-2.0, diccionario derivado con licencias individuales, model card CC BY 4.0 |
| Formato de pesos | ONNX, weights.bin, expanded.bin |

## Arquitectura y entrenamiento

El sistema se compone de dos grafos ONNX independientes: el grafo D8, un clasificador de 8.197.891 coeficientes que puntúa candidatos a partir de la lectura y el contexto izquierdo, y el grafo LM, un Transformer de 8 capas y anchura 512 con 24.200.192 coeficientes. El LM se preentrenó desde cero con inicialización aleatoria sobre texto natural y después se ajustó para dos objetivos: la selección de candidatos y el "ensayo" o rehearsal de texto natural. La inferencia emplea el fichero weights.bin derivado de cuantización Q4 y el expanded.bin con los mismos valores en FP32, lo que permite comparar el comportamiento cuantizado con el de precisión completa.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo forma parte de un pipeline mayor que incluye diccionario, grafo D8, grafo LM y una etapa de selección de ranking; los resultados publicados corresponden al sistema completo, no a los grafos aislados. La ejecución íntegra del IME requiere los 188 elementos listados en el fichero pack-assets/public-map.json del repositorio de GitHub, por lo que los pesos por sí solos no permiten reproducir la funcionalidad completa.

## Capacidades

- Conversión kana-kanji: ranking de candidatos generados por diccionario a partir de la lectura en kana y el contexto izquierdo.
- Selección contextual de candidatos en japonés mediante el clasificador D8.
- Modelado de lenguaje de apoyo (rehearsal de texto natural) con un Transformer de 8 capas y anchura 512.
- Inferencia en formato ONNX, apta para despliegue en entornos con runtime ONNX.
- Soporte de cuantización Q4 y FP32 para equilibrar tamaño y precisión.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Integración en un IME de escritorio o móvil: el modelo se usaría como etapa de ranking entre la generación de candidatos del diccionario y la presentación al usuario, aprovechando el contexto izquierdo para desambiguar lecturas homófonas.
- Conversión asistida en editores de texto japoneses: se puede invocar el grafo ONNX cada vez que el usuario introduce una lectura en kana y necesita seleccionar el kanji correcto según la frase previa.
- Procesamiento por lotes de textos japoneses: dado un corpus con lecturas en kana y contexto, el modelo permite puntuar y seleccionar candidatos de forma automática para tareas de normalización o anotación.
- Evaluación comparativa de estrategias de conversión: al disponer de variantes Q4 y FP32, sirve para medir el impacto de la cuantización en la calidad de la selección de candidatos en un pipeline real.
- Investigación en desambiguación morfológica del japonés: el par D8 + LM permite estudiar cómo el contexto izquierdo y el modelado de lenguaje contribuyen a la selección de candidatos.
- Desarrollo de correctores ortográficos para japonés: el ranking de candidatos puede reutilizarse para sugerir correcciones de kanji en textos ya escritos, siempre que se disponga de la lectura subyacente.
- Prototipado de motores de entrada personalizados: al estar exportado a ONNX y con un runtime publicado en GitHub, facilita la experimentación en entornos Android o de escritorio.

## Benchmarks y rendimiento

Los resultados publicados corresponden al sistema completo (D8 + LM + diccionario + ranking) y miden coincidencia con el texto original en conjuntos fijos:

| Conjunto de evaluación | Resultado |
|---|---|
| Conversión normal fija, registros ya vistos | 1.667/1.889 |
| Conversión normal fija, por material | 985/1.146 |
| Fixed KKC (textos cortos públicos) | 1.441/1.887 |
| Japanese Conversion (textos generales) | 412/551 |
| AJIMEE (incluye soluciones aceptables distintas del original) | 118/200 |

El autor indica que Fixed KKC se solapa con artículos y textos originales de la versión antigua de AJIMEE, y que no se ha realizado una evaluación independiente a gran escala. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,3 GB y los pesos suman aproximadamente 32,4 M de coeficientes, por lo que la huella es reducida.
- GPU recomendadas: no disponible; al ser un modelo de pequeño tamaño y formato ONNX, puede ejecutarse en CPU y en GPU de gama baja, aunque no se documentan requisitos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, pero no se confirma en la información disponible.
- Opciones de despliegue: runtime ONNX publicado en el repositorio de GitHub (engine/runtime); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de conversión kana-kanji basados en ONNX ni referencias a alternativas del mismo tipo con las que establecer una comparación de parámetros, contexto o licencia.

## Limitaciones y advertencias

- El modelo no es un LLM generalista: solo realiza ranking de candidatos para conversión kana-kanji en japonés.
- Los pesos por sí solos no permiten ejecutar el IME completo; se requieren los 188 elementos de pack-assets/public-map.json del repositorio de GitHub.
- La evaluación publicada es limitada y con solapamiento entre conjuntos (Fixed KKC y AJIMEE antiguo); no hay evaluación independiente a gran escala.
- Licencia mixta: los pesos propios son Apache-2.0, pero el diccionario derivado mantiene licencias individuales y la model card es CC BY 4.0; es obligatorio revisar LICENSE-SCOPE.md antes de un uso comercial.
- Idioma limitado al japonés; no se documentan capacidades multilingües.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera del dominio de la conversión kana-kanji.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zuk13/kotonoha-input-compiledmix
- Licencia y alcance: https://huggingface.co/Zuk13/kotonoha-input-compiledmix/blob/v9-compiledmix/LICENSE-SCOPE.md
- Repositorio GitHub (release fijada): https://github.com/Zuk13/kotonoha-input/tree/f31c736dfb8cfc3b188bc1d16b7399a09de66c8b
- Documentación Android del proyecto: https://github.com/Zuk13/kotonoha-input/blob/f31c736dfb8cfc3b188bc1d16b7399a09de66c8b/docs/ANDROID.md
