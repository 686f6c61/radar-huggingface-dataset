# Stavion-Colquitt/MIDI-GPT-LM3

## Resumen

MIDI-GPT-LM3 es un modelo de lenguaje simbólico-musical de 18,2 millones de parámetros desarrollado por Stavion-Colquitt. Se trata de un transformer tipo GPT entrenado desde cero (con inicialización a partir de su predecesor LM2) cuya tarea es generar archivos MIDI multi-instrumento condicionados por una petición corta de control: tempo, compás, tonalidad, familias de instrumentos y densidad de notas. El modelo no sintetiza audio; produce eventos simbólicos MIDI que después pueden renderizarse con cualquier sintetizador o DAW.

La propuesta resulta relevante porque aborda un problema poco cubierto en modelos abiertos pequeños: la generación musical simbólica controlable y condicionada por lenguaje estructurado, ejecutable en hardware de consumo. Con 18,2 M de parámetros y un contexto de 2.048 tokens (equivalente a aproximadamente un minuto de música), el modelo se posiciona como una pieza de investigación reproducible más que como una herramienta de producción, dado su tamaño reducido y su rendimiento de control moderado.

La arquitectura mantiene 8 capas, 6 cabezas de atención y una dimensión de modelo de 384, con un vocabulario ampliado a 8.256 tokens para incorporar 64 tokens de control. El entrenamiento se realizó sobre el split lmd_full de Lakh MIDI Dataset, con unos 1,24 mil millones de tokens de entrenamiento y aproximadamente 12 horas en una única RTX 4060 en fp16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (8 capas, 6 cabezas, d_model 384) |
| Parámetros totales | 18.153.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (ampliada desde 1.024 en LM2 por interpolación lineal de la tabla posicional) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/fp32) |
| Idiomas soportados | no disponible (modelo simbólico-musical; los controles se expresan mediante tokens, no texto libre) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only autorregresivo con 8 capas, 6 cabezas de atención y dimensión de modelo 384, entrenado con tokenización simbólica MidiTok en representación REMI más BPE, con un vocabulario base de 8.192 tokens. Todas las pistas de una canción se serializan en un único flujo de tokens, y los tokens de instrumento indican qué familia interpreta cada evento. Sobre ese vocabulario base se añaden 64 tokens de control (ids 8192-8255) definidos en `lm3_vocab.py`: 8 bins de tempo, 6 compases, 24 tonalidades más "none", 17 familias de instrumentos, 6 bins de densidad, un token de fin de control (id 8254) y un token de estilo reservado (id 8255). La petición se codifica como prefijo: un token de tempo, uno de compás, uno de tonalidad, un token por familia de instrumento presente (en el orden fijo de `lm3_vocab.FAMILIES`), un token de densidad y el token de fin de control.

El entrenamiento parte de los pesos de LM2 en el paso 112.000. Las nuevas filas de embedding se inicializan con la media de las filas antiguas, y la tabla posicional de 1.024 filas se estira a 2.048 por interpolación lineal antes del ajuste fino. Durante el entrenamiento, el prefijo de control de cada canción se fija delante de cada ventana, de modo que el modelo ve la petición exactamente donde se situará en generación; no se calcula pérdida sobre el prefijo porque es una entrada dada, no una predicción. Los datos provienen del split lmd_full de Lakh MIDI Dataset: 170.570 canciones de entrenamiento y aproximadamente 1,24 mil millones de tokens, con 57.289 pasos, ventanas de 2.048 tokens, fp16 y unas 12 horas en una RTX 4060. El mejor checkpoint corresponde al paso 53.000, con pérdida de validación 1,029.

## Capacidades

- Generación de MIDI multi-instrumento condicionada por tempo, compás, tonalidad, familias de instrumentos y densidad de notas.
- Serialización de todas las pistas de una canción en un único flujo de tokens con marcadores de instrumento.
- Control mediante prefijo estructurado de 64 tokens (no texto libre en lenguaje natural).
- Generación de aproximadamente un minuto de música por ventana de 2.048 tokens (media de 136,1 beats generados en la evaluación).
- Soporte de 17 familias de instrumentos: Piano, ChromPerc, Organ, Guitar, Bass, Strings, Ensemble, Brass, Reed, Pipe, SynthLead, SynthPad, SynthFX, Ethnic y otras recogidas en la model card.
- Control de densidad en 6 bins (bordes en 1, 2, 4, 8 y 16 notas por beat agregadas entre todas las pistas).
- Control de tonalidad entre 24 tonalidades mayores y menores, más la opción "none".
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No es un modelo multilingüe en sentido textual: la interfaz de control es un vocabulario simbólico cerrado.

## Casos de uso

- Generación de bocetos musicales para producción: un compositor especifica "120 BPM, A minor, DRUMS, Bass, Guitar, Piano, densidad 3" y obtiene un MIDI multi-pista que puede importar en su DAW para editar y orquestar. La ventana de 2.048 tokens cubre aproximadamente un minuto, suficiente para un loop o una sección.
- Generación de loops y patrones para librerías de samples: el control de densidad y de familias de instrumentos permite producir variaciones sistemáticas sobre una misma petición cambiando la semilla, lo que facilita crear packs coherentes de loops por tempo y tonalidad.
- Prototipado rápido en investigación musical simbólica: al ser un modelo pequeño (18,2 M de parámetros) entrenable en una RTX 4060 en unas 12 horas, sirve como banco de pruebas para estudiar control condicionado en generación simbólica sin grandes presupuestos de cómputo.
- Música adaptativa para videojuegos y prototipos interactivos: la capacidad de fijar tempo, compás y tonalidad por prefijo permite generar secciones coherentes con un estado de juego concreto, aunque el rendimiento de control medido (55,9% de tempo dentro del 10%, 37,3% de tonalidad exacta) limita su uso sin validación posterior.
- Generación de acompañamientos por familias de instrumentos: peticiones como "drums + bass + guitar" producen una base rítmica y armónica que puede servir como acompañamiento para una melodía compuesta por un humano, con precisión de instrumentos del 93,7% en la evaluación.
- Docencia y divulgación sobre modelos generativos musicales: el modelo, su vocabulario de control y su script de evaluación son reproducibles y de licencia MIT, lo que permite usarlo en cursos para ilustrar tokenización REMI, condicionamiento por prefijo y evaluación objetiva de MIDI generado.
- Filtrado y aumento de datos MIDI: dado su bajo coste de inferencia, puede emplearse para generar variaciones controladas de un dataset MIDI existente con fines de aumento de datos, siempre que se valide la calidad musical de las salidas.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 60 peticiones de control aleatorias pero con semilla fija, 1.536 tokens por generación, temperatura 0,9, top_k 50 y semilla igual al índice de la petición. Cada salida se decodificó a MIDI y sus controles se midieron directamente sobre el archivo con `lm3_vocab.controls_from_score`.

| Métrica | Tasa global (60 peticiones, 59 decodificadas) |
|---|---|
| Decodificadas correctamente | 98,3% |
| Tempo dentro del 10% | 55,9% |
| Tonalidad exacta | 37,3% |
| Tonalidad permitiendo relativa mayor/menor | 40,7% |
| Todos los instrumentos pedidos presentes | 42,4% |
| Recall medio de instrumentos | 74,2% |
| Precisión media de instrumentos | 93,7% |
| Bin de densidad exacto | 42,4% |
| Bin de densidad dentro de ±1 | 86,4% |
| Beats generados (media) | 136,1 |
| Pistas generadas (media) | 3,0 |

Desglose por modo de la tonalidad solicitada:

| Métrica | Mayor (34 peticiones) | Menor (26 peticiones) |
|---|---|---|
| Decodificadas | 100,0% | 96,2% |
| Tempo dentro del 10% | 61,8% | 48,0% |
| Tonalidad exacta | 52,9% | 16,0% |
| Tonalidad permitiendo relativa | 55,9% | 20,0% |
| Todos los instrumentos presentes | 55,9% | 24,0% |
| Recall medio de instrumentos | 81,1% | 64,7% |
| Precisión media de instrumentos | 95,8% | 90,7% |
| Bin de densidad exacto | 35,3% | 52,0% |
| Bin de densidad dentro de ±1 | 82,4% | 92,0% |
| Beats generados (media) | 137,4 | 134,3 |
| Pistas generadas (media) | 3,2 | 2,7 |

Mejores y peores peticiones de la evaluación:

| Petición | Solicitado (BPM, tonalidad, instrumentos, densidad) | Obtenido (BPM, tonalidad, instrumentos, densidad) | Veredicto |
|---|---|---|---|
| req_31 | 74,1, Eb mayor, DRUMS/Bass/Guitar/Strings, 3 | 80,7, Eb mayor, Guitar/Bass/Strings/DRUMS, 3 | Tonalidad exacta, todos los instrumentos, densidad exacta |
| req_41 | 143,4, F mayor, DRUMS/Bass/Guitar, 4 | 148,4, F mayor, Guitar/Bass/DRUMS, 4 | Tonalidad exacta, todos los instrumentos, densidad exacta |
| req_56 | 137,2, B mayor, DRUMS/Bass/Guitar, 4 | 128,1, B mayor, Guitar/Bass/DRUMS, 4 | Tonalidad exacta, todos los instrumentos, densidad exacta |
| req_25 | 72,8, Ab menor, DRUMS/Bass/SynthLead, 1 | archivo vacío, nada decodificado | Sin salida |
| req_04 | 146,6, A menor, DRUMS/Bass/SynthPad/SynthLead, 1 | 121,3, A mayor, Organ/SynthPad/DRUMS, 4 | Menor convertido en mayor, faltan Bass y SynthLead, se añade Organ, tempo 25 BPM más rápido |
| req_58 | 105,0, B mayor, DRUMS/Bass/Strings, 1 | 121,3, E mayor, Piano/Strings/DRUMS, 3 | Tonalidad incorrecta, falta Bass, se añade Piano, tempo 16 BPM más rápido |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros modelos de generación musical simbólica.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp16 (18,2 M de parámetros, aproximadamente 36 MB de pesos más estados de atención y caché KV para 2.048 tokens); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó y ajustó el modelo en una RTX 4060.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida) y en CPU para inferencia puntual.
- Opciones de despliegue: inferencia directa con PyTorch y safetensors, según el script `generate.py` incluido en el repositorio; requiere `torch`, `miditok`, `symusic` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el vocabulario y el formato de tokens son específicos del dominio MIDI.
- Latencia y throughput: no disponibles de forma explícita en la información proporcionada; el entrenamiento de 57.289 pasos con ventanas de 2.048 tokens en fp16 sobre una RTX 4060 tomó unas 12 horas, lo que da una idea del orden de magnitud del coste de cómputo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIDI-GPT-LM3 | 18,2 M | 2.048 tokens | Generación MIDI multi-instrumento condicionada por prefijo | MIT | Hugging Face |
| MIDI-GPT-LM2 | 17,7 M | 1.024 tokens | Generación MIDI multi-instrumento sin prefijo de control | no disponible en la información | Hugging Face (Stavion-Colquitt/MIDI-GPT-LM2) |
| Otros modelos de generación musical simbólica | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con LM2, su predecesor: LM3 añade 64 tokens de control, amplía el vocabulario de 8.192 a 8.256 y duplica el contexto de 1.024 a 2.048 tokens mediante interpolación lineal de la tabla posicional. No se dispone de datos de benchmarks de LM2 en la información proporcionada para comparar rendimiento generativo entre ambos.

## Limitaciones y advertencias

- El control sobre la generación es moderado: solo el 55,9% de las peticiones quedan dentro del 10% del tempo solicitado y el 37,3% acierta la tonalidad exacta. En tonalidades menores el rendimiento cae notablemente (16,0% de tonalidad exacta y 24,0% con todos los instrumentos presentes).
- Fallo documentado de generación vacía: una de las 60 peticiones (req_25) produjo un archivo MIDI vacío, por lo que cualquier pipeline de producción debe validar que la salida no esté vacía.
- Errores típicos observados: el tempo tiende a colapsar hacia 121 BPM, las tonalidades menores se convierten en mayores y la pista de bajo se omite con frecuencia.
- Precisión de instrumentos alta (93,7%) pero recall limitado (74,2%): el modelo rara vez añade instrumentos no pedidos, pero a menudo omite alguno de los solicitados.
- Contexto de 2.048 tokens, equivalente a aproximadamente un minuto de música (media de 136,1 beats generados), insuficiente para piezas completas de varios minutos.
- El modelo no acepta lenguaje natural libre: la petición debe codificarse con el vocabulario cerrado de `lm3_vocab.py`, lo que limita su integración directa en interfaces conversacionales.
- Riesgo de alucinación musical: no se documenta una evaluación de coherencia armónica o rítmica más allá de los controles medidos, por lo que la calidad musical subjetiva de las salidas no está cuantificada.
- Sesgos de datos: entrenado únicamente sobre el split lmd_full de Lakh MIDI Dataset, lo que puede infrarepresentar géneros, instrumentaciones y tradiciones musicales ausentes en dicho corpus.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la originalidad de las salidas ni sobre posibles reclamaciones de derechos derivadas del dataset de entrenamiento.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/MIDI-GPT-LM3
- Modelo predecesor LM2: https://huggingface.co/Stavion-Colquitt/MIDI-GPT-LM2
- Repositorio de MidiTok (tokenizador MIDI): no disponible en la información proporcionada
- Lakh MIDI Dataset: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
