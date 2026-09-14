# ZZRI/Feihua-n1-64M-GGUF

## Resumen

Feihua-n1-64M-GGUF es un repositorio de cuantizaciones GGUF para llama.cpp del modelo Feihua-n1-64M, un modelo de lenguaje de 63.912.192 parámetros (aproximadamente 64M) entrenado deliberadamente para generar texto sin contenido informativo, lo que en chino se denomina "废话文学" (literatura de relleno o de sinsentido). Lo desarrolla el usuario ZZRI y se distribuye bajo licencia Apache-2.0, con el chino como único idioma declarado. El repositorio no contiene un modelo nuevo: es la colección completa de siete niveles de cuantización del modelo base, todos calibrados con imatrix.

Su relevancia es acotada y muy específica. No compite en tareas de razonamiento, código o conocimiento: es un artefacto de investigación sobre compresión extrema de pesos y sobre el comportamiento de un modelo lingüísticamente coherente pero semánticamente vacío. El interés técnico está en que publica el juego completo de cuantizaciones (desde Q8_0 a IQ1_S) con sus valores de perplejidad medidos, lo que permite estudiar la degradación del modelo a bitwidths muy bajos, incluyendo el punto en el que la salida deja de ser texto legible y el modelo empieza a inventar caracteres chinos.

El repositorio ocupa 0,4 GB y cada fichero individual pesa entre 21 MB y 66 MB, de modo que el modelo completo cabe en memoria de cualquier máquina y se ejecuta en CPU a velocidades de cientos de tokens por segundo. Está etiquetado como compatible con endpoints de inferencia y como conversacional, y se apoya en el marco de entrenamiento minimind y en la arquitectura etiquetada por el autor como qwen3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3; marco de entrenamiento minimind) |
| Parámetros totales | 63.912.192 (aproximadamente 64M) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M, IQ4_XS, IQ2_M, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en safetensors |
| Calibración | imatrix, con corpus de 3.000 textos sin sentido |
| Tamaño del repositorio | 0,4 GB |
| Rango de tamaño por fichero | 21 MB (IQ1_S) a 66 MB (Q8_0) |
| Variante podada | disponible por separado: 49M de parámetros, 6 capas |

## Arquitectura y entrenamiento

El autor no detalla en esta model card la arquitectura interna del modelo base, más allá de las etiquetas qwen3 y minimind. minimind es un proyecto de código abierto que proporciona un marco de entrenamiento reproducible para modelos de lenguaje pequeños, de modo que lo más probable es que Feihua-n1-64M siga el diseño transformer decoder-only habitual de esa familia, con normalización y atención de tipo Qwen. No se especifican número de capas, dimensión oculta, cabezas de atención ni longitud de contexto, por lo que esos datos quedan como no disponibles. El repositorio remite al card del modelo base (ZZRI/Feihua-n1-64M) para el informe completo de entrenamiento, refuerzo y compresión.

Lo que sí está documentado en este repositorio es el proceso de cuantización. Los siete ficheros GGUF se generaron con llama.cpp y todos ellos pasaron por calibración imatrix, usando como corpus de calibración 3.000 artículos largos generados a partir de BullshitGenerator, es decir, el mismo tipo de texto incoherente que el modelo produce. La variante f16 del modelo sirve de referencia con una perplejidad de 120,5 medida sobre ese mismo corpus de texto sin sentido, y el autor publica la perplejidad de cada nivel de cuantización, lo que constituye el principal dato técnico aportado. No se menciona uso de RLHF ni DPO; la referencia a "refuerzo" aparece únicamente como parte del informe del repositorio principal, sin detalle en esta card.

## Capacidades

- Generación de texto en chino con fluidez superficial y contenido informativo nulo: el modelo está diseñado explícitamente para producir "废话" (relleno), no para responder con precisión.
- Mantenimiento de coherencia morfosintáctica y de estilo discursivo aparentemente formal durante tramos cortos, sin aportar información verificable.
- Modo conversacional declarado mediante la etiqueta conversational, aunque no se documenta formato de prompt ni plantilla de chat.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Ejecución en llama.cpp y en cualquier runtime que consuma GGUF, incluido llama-server con descarga directa desde el Hub.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni visión.
- Capacidades multilingües: no disponibles; solo se declara chino.
- Capacidad especial reseñable: a bitwidths muy bajos (IQ1_S) el modelo degenera hasta inventar caracteres chinos, comportamiento documentado por el autor como parte del interés del artefacto.

## Casos de uso

- Prueba de pipelines de cuantización: sirve como banco de pruebas reproducible para validar una cadena completa de conversión a GGUF, calibración imatrix y evaluación de perplejidad, con siete niveles ya publicados y medidos para comparar.
- Relleno de maquetas y prototipos de interfaz: genera párrafos largos con apariencia de texto real en chino para poblar wireframes, pantallas de demostración o plantillas de diseño sin recurrir a lorem ipsum latino.
- Pruebas de carga y de infraestructura de inferencia: con ficheros de 21 MB a 66 MB y velocidades de CPU de 460 t/s en el nivel IQ4_XS, permite saturar y medir servidores, colas y balanceadores sin coste de GPU.
- Test de tokenizadores y de herramientas de preprocesado: el texto degenerado en los niveles IQ1 puede usarse para comprobar cómo se comportan tokenizadores, filtros de codificación y validadores de entrada ante secuencias anómalas o caracteres inventados.
- Validación de evaluaciones de perplejidad: al publicar la PPL de cada nivel con la misma metodología, es útil para calibrar y verificar la propia implementación de una métrica de perplejidad contra valores de referencia conocidos.
- Investigación sobre degradación por cuantización extrema: el salto de PPL de 124,3 (IQ4_XS) a 938,6 (IQ1_S) ofrece un caso de estudio de cómo y cuándo colapsa un modelo pequeño al reducir bitwidth, incluida la transición cualitativa hacia salida no legible.
- Generación creativa de "废话文学": uso lúdico o artístico de texto deliberadamente vacío pero estilísticamente plausible, que es la función original para la que se entrenó el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo aportado es la perplejidad de cada cuantización medida sobre el corpus de texto sin sentido, con la variante f16 como referencia (120,5).

| Fichero | Tamaño | Bitwidth | Perplejidad (menor es mejor) | Nota del autor |
|---|---|---|---|---|
| feihua-v6-Q8_0.gguf | 66 MB | 8,5 bpw | 120,5 | Cuasi sin pérdida |
| feihua-v6-Q4_K_M.gguf | 41 MB | 4,8 bpw | 122,0 | Opción segura |
| feihua-v6-IQ4_XS.gguf | 35 MB | 4,25 bpw | 124,3 | Punto dulce; 460 t/s en CPU i5-9500 |
| feihua-v6-IQ2_M.gguf | 26 MB | 2,7 bpw | 191,8 | Límite de lo utilizable |
| feihua-v6-IQ2_XXS.gguf | 23 MB | 2,06 bpw | 483,7 | Degradación evidente |
| feihua-v6-IQ1_M.gguf | 22 MB | 1,75 bpw | 757,7 | Flujo de conciencia |
| feihua-v6-IQ1_S.gguf | 21 MB | 1,56 bpw | 938,6 | Arte performativo; inventa caracteres chinos |
| f16 (modelo base, referencia) | no disponible | 16 bpw | 120,5 | Línea base |

## Requisitos de hardware

- VRAM para inferencia: prácticamente despreciable. El fichero mayor ocupa 66 MB, de modo que incluso con overhead de contexto y caché KV el consumo se mantiene en el orden de decenas a pocos cientos de megabytes.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en GPU de datacenter (A100, H100, L40S) de forma trivial; el modelo no aprovecha esa capacidad de cómputo de forma significativa.
- Ejecución en CPU sin GPU: es el escenario principal. El autor reporta 460 tokens por segundo en un Intel i5-9500 con la cuantización IQ4_XS.
- Memoria RAM necesaria: del orden de decenas de megabytes para los pesos, más el espacio de la caché KV y del contexto, no especificado.
- Opciones de despliegue: llama.cpp y llama-server, con descarga directa mediante `llama-server -hf ZZRI/Feihua-n1-64M-GGUF:<fichero>`; cualquier otro runtime compatible con GGUF (Ollama, entre otros) debería poder consumirlo, aunque no se documenta explícitamente.
- Latencia y throughput: solo se documenta la cifra de 460 t/s en CPU para IQ4_XS. Para el resto de niveles de cuantización no hay datos de rendimiento publicados.
- Almacenamiento: si se descargan las siete variantes, el repositorio completo ocupa 0,4 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría con datos publicados (mismo tamaño, misma tarea o mismo marco de entrenamiento) en la información proporcionada. La única comparación posible con datos es interna, entre el modelo base y sus derivados:

| Repositorio | Parámetros | Formato | Cuantizaciones | PPL (f16) | Licencia |
|---|---|---|---|---|---|
| ZZRI/Feihua-n1-64M-GGUF (este repositorio) | 63.912.192 | GGUF | 7 niveles, calibrados con imatrix | 120,5 | Apache-2.0 |
| ZZRI/Feihua-n1-64M (base) | 63.912.192 | safetensors (y f16) | no aplica | 120,5 | Apache-2.0 |
| ZZRI/Feihua-n1-64M-prune-GGUF (podado) | 49M, 6 capas | GGUF | no disponible en la información | no disponible | Apache-2.0 |

Frente a modelos generalistas de tamaño similar o mayor (por ejemplo, la familia Qwen3), la comparación no es pertinente: Feihua-n1-64M no persigue rendimiento en tareas reales, sino la generación de texto sin información, de modo que las métricas habituales no serían aplicables ni comparables.

## Limitaciones y advertencias

- El modelo no está diseñado para aportar información correcta. Por construcción genera texto sin contenido informativo, de modo que su uso como asistente, buscador o generador de respuestas fácticas produciría resultados inútiles o directamente engañosos.
- Riesgo de alucinación: es total y es el comportamiento previsto. Cualquier afirmación que produzca debe considerarse no fiable por defecto.
- Idiomas: únicamente chino declarado. No hay soporte documentado para castellano ni para ninguna otra lengua.
- Longitud de contexto no publicada, lo que impide planificar usos conversacionales de varios turnos con garantías.
- Degradación severa a bitwidths bajos: por debajo de IQ2_M la perplejidad se multiplica; IQ1_S inventa caracteres chinos y no produce texto fiable ni siquiera como relleno estético.
- Licencia Apache-2.0, permisiva y compatible con uso comercial. Conviene revisar, no obstante, las condiciones de los componentes de terceros citados (minimind y BullshitGenerator, ambos enlazados como dependencias del proceso, no como pesos derivados).
- Los datos de calibración provienen de texto generado automáticamente sin sentido, por lo que los valores de perplejidad publicados no son extrapolables a corpus reales ni comparables con métricas de modelos convencionales.
- Advertencia de vigencia: las fechas del repositorio (creación y actualización en septiembre de 2026) y la referencia bibliográfica del autor indican año 2026; verificar la información directamente en el Hub antes de citarla.
- Idiomas y terminología: todos los materiales del autor están en chino, lo que puede dificultar la trazabilidad de la metodología si no se domina el idioma.

## Enlaces

- Repositorio en HuggingFace (este modelo): https://huggingface.co/ZZRI/Feihua-n1-64M-GGUF
- Modelo base: https://huggingface.co/ZZRI/Feihua-n1-64M
- Versión podada, 49M y 6 capas: https://huggingface.co/ZZRI/Feihua-n1-64M-prune-GGUF
- Marco de entrenamiento minimind: https://github.com/jingyaogong/minimind
- Generador de texto base para el corpus de calibración: https://github.com/menzi11/BullshitGenerator
- llama.cpp, herramienta de conversión y cuantización: no disponible como enlace en la información proporcionada (se cita por nombre en la model card)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente enlaces genéricos a Google Translate, sin papers, blogs, repos ni demos adicionales asociados.
