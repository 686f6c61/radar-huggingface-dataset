# ZZRI/Feihua-n1-64M-prune-GGUF

## Resumen

Feihua-n1-64M-prune-GGUF es un repositorio de cuantizaciones GGUF para llama.cpp del modelo Feihua-n1-64M-prune, un modelo de lenguaje en chino de 49.163.136 parámetros (aproximadamente 49,16 M) y 6 capas, entrenado específicamente para generar "废话文学" (literalmente, literatura de relleno o sinsentido): texto fluido en superficie pero vacío de contenido informativo. Lo publica el usuario ZZRI y se apoya en el framework de entrenamiento minimind y en el tokenizador/arquitectura de la familia Qwen3, según las etiquetas del propio repositorio.

El modelo es una versión podada del Feihua-n1-64M original de 64 M de parámetros y 8 capas: la poda estructural elimina en torno a una cuarta parte de la profundidad de la red, lo que reduce el tamaño del modelo aproximadamente a la mitad. Sobre esa versión podada se aplicó una "revival fine-tuning" o microajuste de recuperación (79 segundos según el autor), y el resultado se ha cuantizado en siete niveles distintos (desde Q8_0 hasta IQ1_S) calibrados con imatrix sobre un corpus de 3.000 textos sin sentido generados a partir de BullshitGenerator.

Su relevancia no es funcional sino experimental y divulgativa: es un caso extremo de compresión de modelos (ficheros de 17 MB a 51 MB que se ejecutan en CPU sin GPU), un banco de pruebas reproducible para estudiar el deterioro de la perplejidad bajo cuantizaciones agresivas (IQ1_S, IQ2_XXS) y un ejemplo de modelo de "arte generativo" o sátira textual. No debe confundirse con un asistente generalista: no tiene conocimiento factual, ni razonamiento, ni soporte de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE), derivado de minimind y de la familia Qwen3 según las etiquetas del repositorio; detalles internos (tipo de atención, RoPE, GQA) no disponibles |
| Parámetros totales | 49.163.136 (49,16 M), dato real de safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0, Q4_K_M, IQ4_XS, IQ2_M, IQ2_XXS, IQ1_M, IQ1_S (7 ficheros, todos calibrados con imatrix) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp (el modelo original se distribuye en safetensors) |
| Número de capas | 6 (frente a 8 en la versión sin podar) |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | Feihua-n1-64M-prune (podado desde Feihua-n1-64M) |
| Corpus de calibración | 3.000 textos sin sentido generados con BullshitGenerator |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 6 capas y 49,16 M de parámetros, heredado de la versión Feihua-n1-64M (8 capas, ~64 M de parámetros) tras aplicar una poda estructural con el método ShortGPT (arXiv:2403.03853). ShortGPT calcula la relevancia de cada capa (block influence) mediante la similitud de las representaciones de entrada y salida y elimina las capas menos informativas; en este caso se han eliminado dos de las ocho capas originales, es decir, un 25 % de la profundidad. Posteriormente se aplicó un microajuste de recuperación ("revival") de 79 segundos para reparar parte del daño causado por la poda, y se generaron las siete cuantizaciones GGUF con llama.cpp usando calibración imatrix sobre un corpus de 3.000 documentos de texto deliberadamente incoherente producido con BullshitGenerator.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original, el uso de RLHF/DPO ni el proceso de ajuste conversacional; la etiqueta "conversational" del repositorio indica únicamente que el modelo está formateado para diálogo. La innovación técnica relevante no está en la arquitectura, sino en el ejercicio de compresión: la tabla del autor reporta la perplejidad de cada nivel de cuantización (con f16 como referencia en 120,5 sobre el corpus de "废话"), lo que convierte al repositorio en un registro útil de cómo se degrada un modelo diminuto al bajar de 8,5 bpw a 1,56 bpw.

## Capacidades

- Generación de texto conversacional en chino con estilo ampuloso y vacío ("废话文学"), que es su único objetivo declarado y entrenado.
- Producción de texto fluido gramaticalmente a nivel de superficie, incluso en las cuantizaciones más agresivas (IQ1_S "solo escribe poesía", según el autor).
- Formato de pesos compatible con llama.cpp, lo que habilita su uso como modelo de prueba en cualquier herramienta del ecosistema GGUF.
- No soporta tool calling ni function calling: no se menciona en la información disponible y el modelo carece de las capacidades y del ajuste necesarios.
- No soporta agentes, razonamiento multi-step ni planificación; no hay indicios de entrenamiento en ese sentido.
- No dispone de capacidades de visión, audio, matemáticas, código ni recuperación factual.
- Capacidad multilingüe inexistente más allá del chino: el campo de idioma del repositorio declara únicamente zh.
- No dispone de modo "thinking" ni de decodificación especulativa propia, más allá de las funciones estándar de llama.cpp.

## Casos de uso

- Prueba de humo en pipelines de CI/CD de LLM: con ficheros de 17 a 51 MB, el modelo puede descargarse y arrancar en un `llama-server` dentro de un runner sin GPU para validar integraciones, plantillas de prompt, streaming SSE y compatibilidad con endpoints antes de pasar a modelos reales.
- Texto de relleno en chino para maquetación y prototipado: sustituye al "lorem ipsum" en mockups de aplicaciones de chat, demos de interfaz o pruebas de carga de front-ends, generando párrafos largos y verosímiles en chino que no aportan información sensible.
- Investigación sobre poda y cuantización extrema: permite reproducir la curva perplejidad/tamaño (de 51 MB y PPL 476,9 hasta 17 MB y PPL 2.114,4) y compararla con el modelo sin podar, útil para estudiar los límites prácticos de IQ1_S e IQ2_XXS en modelos diminutos.
- Validación de nuevas versiones de llama.cpp o de Ollama: al ser un GGUF minúsculo, sirve como caso de prueba reproducible para verificar la carga de cuantizaciones poco frecuentes (IQ1_M, IQ1_S) y la calibración imatrix en hardware modesto.
- Aplicaciones de entretenimiento y bots de comunidad: un bot de chat en chino que responda siempre con "废话" encaja en dinámicas de humor de internet, canales de memes o easter eggs dentro de productos ya existentes.
- Instalaciones de arte digital y sátira sobre la IA generativa: el modelo puede alimentar una pieza que genere texto interminable y vacío de forma continua en una Raspberry Pi o un dispositivo empotrado, sin coste de cómputo apreciable.
- Docencia y divulgación técnica: su tamaño permite ejecutarlo en un portátil durante una charla y mostrar en directo tokenización, muestreo, temperatura y efecto de la cuantización sin depender de infraestructura cloud.
- Pruebas de internacionalización y tokenización en chino: útil para verificar pipelines de codificación UTF-8, tokenizadores compatibles con Qwen3 y visualización de tokens en aplicaciones multilingües, aunque el modelo no produzca salida en otros idiomas.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, C-Eval). El único dato de rendimiento disponible es la perplejidad (PPL) medida por el propio autor sobre su corpus de texto sin sentido, junto al tamaño y la anchura de bits de cada fichero:

| Fichero | Tamaño | Bits por peso | PPL (menor es mejor) | Comentario del autor |
|---|---|---|---|---|
| f16 (modelo base) | No disponible | 16 bpw | 120,5 | Línea base de referencia |
| feihua-v6-prune6-heal-Q8_0.gguf | 51 MB | 8,5 bpw | 476,9 | Cuasi sin pérdida |
| feihua-v6-prune6-heal-Q4_K_M.gguf | 31 MB | 4,8 bpw | 468,0 | Opción segura |
| feihua-v6-prune6-heal-IQ4_XS.gguf | 27 MB | 4,25 bpw | 486,1 | "Punto dulce" |
| feihua-v6-prune6-heal-IQ2_M.gguf | 21 MB | 2,7 bpw | 660,2 | Límite de uso práctico |
| feihua-v6-prune6-heal-IQ2_XXS.gguf | 18 MB | 2,06 bpw | 1.038,6 | Flujo de conciencia |
| feihua-v6-prune6-heal-IQ1_M.gguf | 17 MB | 1,75 bpw | 1.457,4 | "Poéticamente borroso" |
| feihua-v6-prune6-heal-IQ1_S.gguf | 17 MB | 1,56 bpw | 2.114,4 | El más pequeño; "solo escribe poesía" |

Advertencia de interpretación: estos valores de PPL corresponden a un corpus de "废话" y no son comparables con las perplejidades de modelos generalistas sobre datasets estándar. Un detalle técnico interesante es que la PPL no crece de forma monótona respecto a los bits por peso (Q4_K_M obtiene 468,0 frente a 476,9 de Q8_0), lo que sugiere que la calibración imatrix compensa parcialmente la pérdida de precisión en este rango.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: prácticamente despreciable. Los pesos ocupan entre 17 MB (IQ1_S/IQ1_M) y 51 MB (Q8_0); con la caché KV, el contexto y el propio runtime de llama.cpp, el consumo total se mantiene muy por debajo de 1 GB, incluso para las variantes más grandes.
- GPU recomendadas: no requiere GPU. Cualquier GPU de consumo, incluida una RTX 3060, una RTX 4090 o incluso gráficas integradas, ejecuta el modelo sin dificultad; también es válido un acelerador de datacenter, aunque resulta absolutamente desproporcionado.
- Compatibilidad con GPU de consumo: sí, en todas. Cabe incluso en dispositivos sin GPU dedicada, como Raspberry Pi, mini-PC, routers con Linux o teléfonos móviles mediante bindings de llama.cpp.
- Opciones de despliegue: llama.cpp (binarios `llama-cli`, `llama-server`, con soporte de descarga directa desde HuggingFace mediante `-hf`), Ollama importando el GGUF, LM Studio, Jan y cualquier frontal que consuma GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que indica compatibilidad con API de tipo endpoint.
- Latencia y throughput: no disponibles en la información proporcionada. El dato de "79 segundos" que aparece en la model card corresponde al tiempo del microajuste de recuperación tras la poda, no a la inferencia. En la práctica, un modelo de 6 capas y ~49 M de parámetros en CPU debería generar varios cientos de tokens por segundo en hardware moderno, pero al no haber mediciones publicadas no se ofrece una cifra concreta.

## Comparativa con modelos similares

Dentro de la propia familia Feihua, la comparación es directa:

| Modelo | Parámetros | Capas | Idiomas | Licencia | Formato | Tarea |
|---|---|---|---|---|---|---|
| Feihua-n1-64M-prune-GGUF (este repositorio) | 49,16 M | 6 | zh | Apache-2.0 | GGUF (7 cuantizaciones) | Generación de "废话" |
| Feihua-n1-64M-prune | 49,16 M | 6 | zh | Apache-2.0 (según la model card) | safetensors | Generación de "废话" |
| Feihua-n1-64M-GGUF | ~64 M | 8 | zh | Apache-2.0 (según la model card) | GGUF | Generación de "废话" |

En cuanto a alternativas de tamaño comparable, existen modelos generalistas diminutos como SmolLM-135M, Qwen2.5-0.5B o TinyLlama-1.1B, todos ellos de mayor tamaño que este modelo. No obstante, no son comparables en tarea: esos modelos persiguen capacidades generales (comprensión, código, matemáticas), mientras que Feihua-n1-64M-prune está entrenado deliberadamente para producir texto sin contenido informativo. Los datos comparativos de parámetros, contexto y rendimiento de esas alternativas no se han verificado en la información disponible y, por tanto, no se incluyen cifras.

## Limitaciones y advertencias

- El modelo no está diseñado para proporcionar información veraz. Su objetivo declarado es generar "废话" (sinsentido); cualquier uso como fuente de conocimiento produce alucinación por diseño, no por fallo puntual.
- Ausencia total de capacidades verificables de razonamiento, matemáticas, código, seguimiento de instrucciones complejas, tool calling o uso como agente. No hay evidencia de entrenamiento en ninguna de esas áreas.
- Idiomas: solo chino (zh). No hay soporte ni evaluación en castellano, inglés u otras lenguas.
- Longitud de contexto desconocida: no se publica en la model card y no puede asumirse un valor concreto, lo que impide planificar conversaciones largas o tareas de resumen documental.
- Capacidad muy limitada por tamaño: 49,16 M de parámetros y 6 capas tras eliminar un 25 % de la profundidad original. La poda degrada la calidad y el microajuste de 79 segundos no la recupera por completo.
- Cuantizaciones extremas: IQ1_S (1,56 bpw) e IQ2_XXS (2,06 bpw) elevan la perplejidad a 2.114,4 y 1.038,6 respectivamente; son experimentos de compresión, no opciones para uso serio.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las licencias de los componentes de terceros implicados (el framework minimind se declara Apache-2.0; la licencia de BullshitGenerator, utilizado como materia prima de calibración, no se especifica en la información disponible).
- Advertencia de procedencia: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la calidad de las cuantizaciones publicadas.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad. Dado que el corpus de calibración procede de un generador automático de texto sin sentido, no hay control conocido sobre el contenido que pueda emitir el modelo.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/ZZRI/Feihua-n1-64M-prune-GGUF
- Modelo base podado: https://huggingface.co/ZZRI/Feihua-n1-64M-prune
- Versión sin podar (64 M, 8 capas) en GGUF: https://huggingface.co/ZZRI/Feihua-n1-64M-GGUF
- Método de poda ShortGPT (paper): https://arxiv.org/abs/2403.03853
- Framework de entrenamiento minimind: https://github.com/jingyaogong/minimind
- Generador de corpus de calibración BullshitGenerator: https://github.com/menzi11/BullshitGenerator
- llama.cpp (conversión y cuantización): https://github.com/ggml-org/llama.cpp

Nota: las búsquedas web realizadas para esta ficha no han devuelto ningún resultado relacionado con el modelo, su autor ni su familia; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio de HuggingFace.
