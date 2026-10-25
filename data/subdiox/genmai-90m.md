# subdiox/genmai-90M

## Resumen

genmai-90M es un modelo de conversión kana-kanji (kana-kanji henkan) para japonés, es decir, un modelo que transforma una lectura en katakana en texto japonés con la ortografía kanji correcta, opcionalmente condicionado por el texto que precede al cursor. Lo desarrolla el usuario subdiox como variante ligera de su propio genmai-310M, del que se destila, y está pensado para dispositivos con poca memoria, como un iPhone. Emplea el mismo formato de prompt, tokenizador y disposición de ficheros que genmai-310M.

Arquitectónicamente es un transformer decoder-only estilo GPT-2 pequeño: 12 capas, 768 dimensiones ocultas, vocabulario a nivel de carácter de 6.000 entradas y 90.450.432 parámetros. Parte de zenz-v3.2-small (Miwa-Keita/zenz-v3.2-small-gguf, Apache-2.0), desconvolucionado del GGUF Q5_K_M, y se entrena por destilación de conocimiento desde genmai-310M, que actúa como profesor.

Su relevancia es práctica: demuestra que una tarea lingüística concreta y muy sensible a la latencia, como la conversión de entrada en un IME japonés, se puede resolver con un modelo de 90 M de parámetros que corre en el Neural Engine de Apple con un consumo de memoria de proceso de 50–90 MB y unos 4 ms por paso de decodificación. No es un modelo de propósito general: es un componente especializado dentro de un motor de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 768 de dimensión oculta, vocabulario a nivel de carácter de 6.000) |
| Parametros totales | 90.450.432 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de prompt en la implementación Core ML; contexto izquierdo de hasta 500 caracteres; salida de 64 tokens por fragmento |
| Tipos de cuantizacion | fp32 en safetensors; int8 (simétrico, por canal) para los pesos lineales en el paquete Core ML, resto fp16; el modelo base se desconvolucionó de un GGUF Q5_K_M |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY-SA 4.0 (el modelo base zenz-v3.2-small es Apache-2.0) |
| Formato de pesos | safetensors (fp32, diseño GPT-2 de Hugging Face) y Core ML (`model-coreml.zip`, 82 MB, `genmai.mlpackage`) |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |
| Modelo base | Miwa-Keita/zenz-v3.2-small-gguf |
| Profesor (destilación) | subdiox/genmai-310M |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración GPT-2 de 12 capas y 768 dimensiones ocultas, pero con un tokenizador a nivel de carácter de solo 6.000 entradas, lo que es coherente con la tarea: la entrada es una cadena de katakana y la salida es texto japonés carácter a carácter. El formato de prompt, denominado `zenzlc`, codifica la estructura con caracteres de uso privado: `<s>[U+EE02]{contexto izquierdo}[U+EE00]{lectura en katakana}[U+EE01]{salida}</s>`, donde U+EE02 marca el contexto previo (hasta los últimos 500 caracteres, omitido si no hay contexto), U+EE00 la lectura de entrada y U+EE01 el inicio de la salida. Los espacios se representan como U+3000 y los saltos de línea se eliminan. Las lecturas largas se trocean en segmentos de como máximo 40 caracteres cortando por 、 y 。, decodificando cada trozo a continuación de la salida anterior.

El entrenamiento es destilación desde genmai-310M: en cada posición de salida la pérdida combina 0,5 · entropía cruzada contra la referencia y 0,5 · divergencia KL contra la distribución del profesor sobre el siguiente carácter (ambos modelos comparten vocabulario), más una pérdida auxiliar de modelo de lenguaje sobre el siguiente carácter del texto anterior al cursor con peso 0,3. El proceso tuvo tres etapas: aproximadamente 3 millones de frases leídas automáticamente (Wikipedia, FineWeb-2 Japanese, Aozora Bunko y actas parlamentarias) y frases que contienen palabras raras del diccionario Mozc; después unas 3,2 millones de frases adicionales de Wikipedia y FineWeb-2; y una etapa final sobre datos curados (elementos revisados a mano, frases sintéticas y de homófonos generadas con Claude y correcciones juzgadas por un LLM) con repetición de los datos anteriores.

La innovación técnica más destacable no está en la arquitectura sino en el empaquetado: el `genmai.mlpackage` es un paquete multifunción de Core ML con dos funciones (`prefill` y `decode`) que comparten un mismo conjunto de estados (claves y valores en fp16 por capa) para el Neural Engine. `prefill` escribe 32 tokens de prompt en ranuras y devuelve las log-probabilidades; `decode` procesa un token para cada una de las 5 hipótesis del beam search, con colocación mediante one-hot (`wsel`, `keep`) y máscaras aditivas (`pmask`, `smask`), de forma que reordenar haces no requiere copiar memoria.

## Capacidades

- Conversión kana-kanji: traduce una lectura en katakana a texto japonés con kanji y ortografía correctos (por ejemplo, ハハハハガイタイラシイ → 母は歯が痛いらしい).
- Conversión condicionada por contexto: acepta hasta 500 caracteres del texto anterior al cursor, lo que permite desambiguar homófonos y mantener coherencia con lo ya escrito.
- Decodificación por haces: soporta beam search (5 haces en la configuración recomendada) y devolución de múltiples candidatos ordenables por suma de log-probabilidades.
- Ejecución en dispositivo: variante Core ML para el Apple Neural Engine con pesos int8 y estados fp16, con funciones separadas de prefill y decode pensadas para un decodificador incremental de IME.
- Generación de texto a nivel de carácter en japonés dentro del dominio de la conversión de entrada.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al japonés; no se declaran otros idiomas.

## Casos de uso

- Motor de conversión de un IME japonés en iOS y macOS: el paquete Core ML está diseñado exactamente para esto, con 4 ms por paso de decodificación en el Neural Engine de un M4 Pro y un consumo de proceso de 50–90 MB, adecuado para teclados de terceros con restricciones estrictas de memoria.
- Autocompletado de texto en aplicaciones móviles japonesas: dado el contexto anterior al cursor y una lectura, el modelo propone el texto completo con kanji, integrándose en un campo de entrada mediante beam search de 5 haces y corte en EOS.
- Corrección de homófonos en pipelines de transcripción: tras un ASR que produce katakana o lecturas, el modelo reconstruye la forma escrita correcta; en el conjunto de frases de homófonos alcanza un 89,6 % de acierto a nivel de palabra.
- Normalización de texto para búsqueda y recuperación documental en japonés: convertir lecturas de índices o consultas de usuario a la forma kanji canónica antes de indexar o comparar.
- Procesamiento por lotes en servidor con transformers: el `model.safetensors` en fp32 se carga con `AutoModelForCausalLM` y permite generar candidatos para grandes volúmenes de frases (por ejemplo, curaduría de corpus o generación de pares lectura-escritura).
- Experimentación e investigación en destilación: al ser un alumno de 90 M con profesor de 310 M y datos y recetas documentados, sirve como caso de estudio reproducible de destilación con KL más pérdida auxiliar de LM.
- Pruebas de integración en CI para correctores ortográficos japoneses: el reducido tamaño (362 MB en fp32, ~181 MB en bf16) permite ejecutar tests de regresión de conversión en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

Precisión top-1 con beam size 5; se descartan los candidatos cuya lectura no coincide con la entrada. Las métricas de AJIMEE, frases cotidianas e ime_v1 dev se juzgan de forma laxa (se aceptan variantes ortográficas); homófonos es precisión a nivel de palabra sobre frases retenidas; hard son 28 frases diseñadas para exigir a un IME (coincidencia exacta salvo ortografía).

| Conjunto | genmai-90M (bf16) | genmai-310M (bf16) | Zenzai (zenz-v3.2-small, ajustes azooKey) |
|---|---|---|---|
| AJIMEE-Bench (200) | 91,0 % | 95,0 % | 85,5 % |
| Frases cotidianas (101) | 98,0 % | 98,0 % | 97,0 % |
| ime_v1 dev (544) | 94,3 % | 93,6 % | no disponible |
| Frases de homófonos (1.607) | 89,6 % | 93,1 % | no disponible |
| Media de los cuatro conjuntos | 93,2 % | 94,9 % | no disponible |
| Frases difíciles de IME (28) | 22 / 28 | 22 / 28 | no disponible |

En la comparación de la variante Core ML frente a los pesos en 8 bits sobre GPU, con 5 haces, el modelo obtiene el mismo top-1 en 101 de 101 frases cotidianas, 199 de 200 elementos AJIMEE y 27 de 28 frases difíciles. El tiempo por paso de decodificación en el Neural Engine es de unos 4 ms, con una compilación inicial para el Neural Engine de unos 20 s (macOS cachea el resultado). La model card incluye un apartado de velocidad en RTX 3090 (bf16, 5 haces, frases cotidianas) cuyo contenido no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 362 MB en fp32, aproximadamente 181 MB en bf16 y unos 90 MB en int8; el peso del modelo es despreciable frente a la caché KV, que con 256 posiciones de prompt, 12 capas y 768 dimensiones es de apenas unas decenas de MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria sirve; la model card cita una RTX 3090 para las pruebas de velocidad. Para el despliegue en producción en servidor no se requiere hardware de gama alta.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1060, RTX 3060, RTX 4090 y Apple Silicon (M1 en adelante); también es viable en CPU.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` (revisión fijada, por ejemplo `v1.0.0`); paquete Core ML 9 (`genmai.mlpackage`) para macOS 15 / iOS 18 o posterior a través del decodificador Core ML de genmai-ime. No se publica conversión GGUF de este modelo en el repositorio, por lo que las rutas llama.cpp u Ollama requerirían una conversión propia a partir del safetensors.
- Latencia y throughput: aproximadamente 4 ms por paso de decodificación con 5 haces en el Neural Engine de un M4 Pro, con una huella de proceso de 50–90 MB. No se han publicado cifras de latencia o throughput en GPU en la información disponible (el apartado correspondiente de la model card está truncado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AJIMEE-Bench | Media de cuatro conjuntos | Licencia | Formatos |
|---|---|---|---|---|---|---|
| genmai-90M | 90.450.432 | 256 tokens de prompt (Core ML), contexto izquierdo de hasta 500 caracteres | 91,0 % | 93,2 % | CC BY-SA 4.0 | safetensors, Core ML |
| genmai-310M | no disponible | no disponible (mismo formato de prompt y tokenizador) | 95,0 % | 94,9 % | no disponible | no disponible |
| Zenzai (zenz-v3.2-small, ajustes azooKey) | no disponible | no disponible | 85,5 % | no disponible | Apache-2.0 (modelo zenz-v3.2-small) | GGUF (zenz-v3.2-small-gguf) |

Frente a su profesor, genmai-90M pierde 4,0 puntos en AJIMEE-Bench y 3,5 puntos en frases de homófonos, pero gana 0,7 puntos en ime_v1 dev y empata en frases cotidianas y en frases difíciles (22/28). Frente a la configuración Zenzai sobre zenz-v3.2-small, gana 5,5 puntos en AJIMEE-Bench, aunque la comparación no es completamente equivalente porque las condiciones de decodificación difieren.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de chat ni de propósito general; fuera de la tarea de conversión kana-kanji su utilidad es muy limitada.
- Solo japonés: no se declara soporte de otros idiomas, y el vocabulario a nivel de carácter de 6.000 entradas está adaptado al japonés.
- Dependencia del beam search: la model card advierte que con la normalización de longitud por defecto de transformers pueden ganar salidas degeneradas y largas como ハハハハガイタイらしい; hay que ordenar los haces por suma simple de log-probabilidades (`length_penalty=0.0`) y parar en EOS.
- Sensibilidad al formato de prompt: requiere los caracteres de uso privado U+EE00, U+EE01 y U+EE02, el tratamiento de espacios como U+3000, la eliminación de saltos de línea y el troceado de lecturas largas por 、 y 。 en segmentos de 40 caracteres; desviarse de este protocolo degrada la salida.
- Riesgo de alucinación ortográfica: el modelo puede producir texto gramatical japonés que no corresponde a la lectura de entrada; la evaluación descarta explícitamente candidatos cuya lectura no coincide, lo que indica que ese filtro es necesario en producción.
- Rendimiento limitado en entradas difíciles: solo 22 de 28 frases del conjunto adversarial de IME se resuelven correctamente.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información proporcionada; los datos de entrenamiento (Wikipedia, FineWeb-2, Aozora Bunko, actas parlamentarias y frases generadas con Claude) pueden introducir sesgos de dominio y de registro.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar la integración en productos propietarios. El modelo base zenz-v3.2-small es Apache-2.0.
- Restricciones del despliegue Core ML: el prompt está limitado a 256 tokens y la salida a 64 tokens por fragmento; además, la primera carga compila el modelo para el Neural Engine (unos 20 s) y requiere macOS 15 / iOS 18 o posterior.
- Madurez: el repositorio tiene 18 descargas, 0 likes y una única versión publicada (v1.0.0), sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subdiox/genmai-90M
- Modelo profesor, genmai-310M: https://huggingface.co/subdiox/genmai-310M
- Modelo base, zenz-v3.2-small-gguf: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Repositorio del IME con el script de conversión a Core ML (`Tools/coreml/genmai_coreml.py`): https://github.com/subdiox/genmai-ime
- Resultados de la búsqueda web: las entradas proporcionadas corresponden a páginas de compraventa de coches (Autotrader UK) y no contienen información relevante sobre el modelo, por lo que no aportan enlaces adicionales (papers, blogs o demos).
