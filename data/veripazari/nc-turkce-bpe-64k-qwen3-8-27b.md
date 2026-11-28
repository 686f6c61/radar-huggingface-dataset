# veripazari/nc-turkce-bpe-64k-qwen3.8-27b

## Resumen

`veripazari/nc-turkce-bpe-64k-qwen3.8-27b` no es un modelo de lenguaje, sino un **tokenizer** para `transformers`: una extensión del vocabulario del tokenizer de Qwen3.8-27B con el diccionario turco NC-64k (un BPE byte-level entrenado desde cero sobre turco). El objetivo es reducir el coste en tokens del turco manteniendo intacto el comportamiento en inglés y código. El tokenizer original fue desarrollado por el usuario `nesicn` y esta copia es un archivo documentado en turco por la plataforma VeriPazarı.

La construcción preserva el tamano de vocabulario (248.077) y los IDs de tokens especiales: 49.401 tokens de NC-64k sustituyen a los 49.401 tokens de mayor ID de Qwen3.8-27B. Sobre el mismo texto, el turco consume un 33,3 % menos de tokens (de 312,5 a 207,1 tokens por 1.000 caracteres), la F1 de frontera morfológica sube de 32,55 a 57,14, el inglés empeora un 5,7 % y el código mejora un 2,5 %. La tokenización es sin pérdidas: `decode(encode(x)) == x` en todos los textos de prueba y no genera `<unk>`.

Es relevante porque demuestra una vía práctica de adaptación de vocabulario para lenguas aglutinantes sin reentrenar el modelo completo, pero con una advertencia crítica: los nuevos tokens no tienen embeddings entrenados y ocupan IDs que en el modelo original correspondían a otros tokens, por lo que **no puede usarse directamente con los pesos de Qwen3.8-27B**. El repo incluye `merged-to-original-token-ids.json` para inicializar esos embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (no es un modelo de lenguaje; no hay pesos de red) |
| Parametros totales | no disponible (no aplica: es un tokenizer) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B, no del tokenizer) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Turco (tr) e inglés (en); el vocabulario cubre también código fuente |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `merged-to-original-token-ids.json` (no hay safetensors ni GGUF) |

| Parametro adicional | Valor |
|---|---|
| Tamano de vocabulario | 248.077 (idéntico a Qwen3.8-27B) |
| Tokens NC-64k integrados | 49.401 |
| Tokens de Qwen3.8-27B desplazados | 49.401 (los de mayor ID) |
| Reglas de merge totales | 288.278 (252.110 del merge + 36.168 de la reparación de accesibilidad) |
| Clase de tokenizer en `tokenizer_config.json` | `PreTrainedTokenizerFast` |
| Compatibilidad `transformers` | 5.22.2 (carga como `TokenizersBackend` o `Qwen3_5Tokenizer` según contexto) |
| Tamano del repo | 0,0 GB (solo ficheros de tokenizer) |

## Arquitectura y entrenamiento

El componente es un tokenizer **byte-level BPE** derivado del de Qwen3.8-27B. El proceso de construcción consta de tres fases documentadas: (1) conversión del `tokenizer.json` de NC-64k al formato de texto que espera la herramienta de merge (token byte-level a texto, espacio a `▁`, byte suelto a `<0xXX>`), descartando 73 tokens de NC que no se pueden convertir por ser fragmentos UTF-8 incompletos; (2) fusión con `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=248077)`, donde las reglas de merge de NC se anteponen a las del tokenizer base y se conservan tokens de un solo carácter, tokens con formato `<…>`/`[…]`, tokens especiales, duplicados y puentes de caracteres base; (3) reparación de accesibilidad: como las reglas de NC pasan por delante, 55.084 tokens de Qwen3.8-27B quedaban inalcanzables desde sus propios caracteres, lo que inflaba el inglés un 22,4 % y el código un 7,8 %. Se añadieron 36.168 reglas de merge de baja prioridad (por ejemplo `tur` + `n` → `turn`) para reconstruir esos tokens; 7.673 tokens quedaron sin ruta posible dentro del vocabulario y no se resolvieron.

No hay entrenamiento de red neuronal, RLHF ni DPO: es un artefacto de preprocesado. La innovación técnica destacable es la elección de reparar la lista de merges en lugar de activar `ignore_merges=true`, porque `transformers` ignora ese flag al cargar el modelo con su clase `Qwen3_5Tokenizer`, lo que habría producido tokenizaciones distintas según el cargador. Las reglas añadidas se validaron sobre todo el vocabulario para garantizar que no incrementan el número de tokens de ningún texto ni rompen ningún token construible.

## Capacidades

- Tokenización de texto turco con reducción del 33,3 % en número de tokens frente al tokenizer original de Qwen3.8-27B.
- Mejora de la segmentación morfológica del turco (F1 de frontera 32,55 → 57,14), preservando sufijos como `-deki`, `-lerimize` o `-mıştır` en un solo token.
- Tokenización sin pérdidas: `decode(encode(x)) == x` en todos los textos de prueba y ausencia de `<unk>`.
- Mantenimiento de tokens de código e inglés mediante la reparación de accesibilidad (inglés +5,7 %, código −2,5 % respecto al tokenizer base).
- Conservación de IDs de tokens especiales y de la plantilla de chat del modelo base.
- Mapa de correspondencia `merged-to-original-token-ids.json` para inicializar embeddings de los tokens nuevos a partir de sus fragmentos originales.
- No soporta tool calling, agentes, visión, audio ni razonamiento: esas capacidades pertenecen al modelo base, no al tokenizer.

## Casos de uso

- **Adaptación de Qwen3.8-27B al turco con presupuesto de contexto ajustado**: al reducir un 33,3 % los tokens por carácter, se procesa aproximadamente un 50 % más de texto turco dentro de la misma ventana de contexto del modelo base, útil en pipelines de resumen o RAG sobre corpus turcos.
- **Reducción de coste de inferencia en producción para cargas en turco**: menos tokens de entrada y salida se traducen directamente en menor latencia y menor factura de API o de GPU por petición, sin cambiar la arquitectura del modelo.
- **Fine-tuning de embeddings para lenguas aglutinantes**: el mapa `merged-to-original-token-ids.json` permite inicializar los 49.401 embeddings nuevos a partir de los fragmentos originales, lo que sirve como punto de partida para un ajuste supervisado sobre corpus turco.
- **Investigación en morfología computacional**: la mejora de F1 de frontera morfológica (32,55 → 57,14) hace que el tokenizer sea útil como componente en tareas de análisis morfológico, lematización o etiquetado gramatical en turco.
- **Preprocesado de corpus mixtos turco/inglés/código**: al mantener un coste controlado en inglés (+5,7 %) y código (−2,5 %), es viable en repositorios y documentación técnica bilingües donde no se quiere un tokenizer exclusivamente turco.
- **Evaluación comparativa de vocabularios**: sirve como referencia reproducible para medir el impacto de sustituciones de vocabulario sobre fertilidad por idioma antes de comprometerse a un reentrenamiento completo.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B (base) | NC-64k | Este tokenizer |
|---|---|---|---|
| Tokens por 1.000 caracteres (turco) | 312,5 | no disponible | 207,1 (−33,3 %) |
| F1 de frontera morfológica | 32,55 | no disponible | 57,14 |
| Variación de tokens en inglés | referencia | no disponible | +5,7 % |
| Variación de tokens en código | referencia | no disponible | −2,5 % |
| Pérdida en decodificación | sin pérdida | sin pérdida | sin pérdida (`decode(encode(x)) == x`) |
| Emisión de `<unk>` | no | no | no |

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto no es un modelo evaluable de forma autónoma.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer (solo CPU y unos pocos MB de RAM para cargar `tokenizer.json`).
- GPU recomendadas: no aplica; el coste de GPU lo determina el modelo base Qwen3.8-27B con el que se empareje.
- Compatibilidad con GPU de consumo: irrelevante para el tokenizer; dependerá del modelo base y de su cuantización.
- Opciones de despliegue: `transformers` (versión 5.22.2 validada), con carga como `TokenizersBackend` o `Qwen3_5Tokenizer`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que requerirían convertir el tokenizer a sus formatos y verificar la lista de merges ampliada.
- Latencia y throughput: no disponibles; el impacto esperado es una reducción proporcional del número de tokens procesados por el modelo base en texto turco.

## Comparativa con modelos similares

| Tokenizer | Base | Vocabulario | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Este artefacto (NC-64k + Qwen3.8-27B) | Qwen3.8-27B | 248.077 | tr, en, código | Apache 2.0 | Publicado, sin descargas ni likes |
| `nesicn/nc-turkce-bpe-64k` (NC-64k) | Desde cero | 64k (según nombre) | tr | no disponible | Origen del vocabulario turco |
| Tokenizer original de Qwen3.8-27B | Qwen | 248.077 | multilingüe | Apache 2.0 (según repo base) | Referencia de comparación |
| Tokenizers de otras familias (Llama, Mistral) | Varios | no disponible | multilingüe | no disponible | No comparables directamente sin datos de fertilidad en turco |

La comparación con tokenizers de otras familias no está cubierta en la información disponible; solo se dispone de las métricas frente al tokenizer original de Qwen3.8-27B y frente a NC-64k en los ejemplos de segmentación.

## Limitaciones y advertencias

- **No usable directamente con los pesos de Qwen3.8-27B**: los 49.401 tokens nuevos ocupan los IDs de tokens descartados, cuyos embeddings en el modelo original corresponden a otros tokens. Sin inicializar y entrenar esos embeddings, el modelo produce salidas incorrectas.
- **Cobertura incompleta de la reparación**: 7.673 tokens de Qwen3.8-27B siguen sin ruta de construcción dentro del vocabulario (por ejemplo `␣struct`), lo que puede fragmentar identificadores y palabras en inglés o código.
- **Regresión en inglés**: un +5,7 % de tokens en inglés implica mayor coste y menor texto efectivo por ventana en cargas anglófonas.
- **Sesgo de dominio**: el vocabulario NC-64k se entrenó sobre turco; no hay datos publicados sobre su cobertura de jerga técnica, dialectos o turco informal.
- **Riesgo de alucinación**: no evaluable en el tokenizer; depende del modelo base y de la calidad del reentrenamiento de embeddings.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene sus propias condiciones que deben verificarse por separado.
- **Madurez**: repo con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación externa.
- **Compatibilidad de cargadores**: el comportamiento depende de la versión de `transformers`; el autor valida 5.22.2 y advierte que `ignore_merges` no se respeta con `Qwen3_5Tokenizer`.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/veripazari/nc-turkce-bpe-64k-qwen3.8-27b
- Repo original del tokenizer: https://huggingface.co/nesicn/nc-turkce-bpe-64k-qwen3.8-27b
- Vocabulario turco NC-64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de merge: https://github.com/malibayram/bpe-tokenizer-editor
- Plataforma que archiva la copia: https://veripazari.com.tr
